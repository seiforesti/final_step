'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  LineChart,
  Histogram,
  BoxPlot
} from 'recharts';

import {
  Database,
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Settings,
  RefreshCw,
  Play,
  Pause,
  MoreVertical,
  Search,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Zap,
  Brain,
  Microscope,
  Calculator,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Table as TableIcon,
  FileText,
  Save,
  Share,
  Copy,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Clock4,
  Shield,
  AlertTriangle,
  Star,
  TrendingDown,
  Layers,
  Hash,
  Type,
  Globe,
  Binary,
  Calendar as DateIcon,
  Percent,
  Ruler,
  StatActivity,
  BarChart2,
  PlusCircle,
  MinusCircle,
  FileBarChart
} from 'lucide-react';

// Hook imports
import { useCatalogProfiling } from '../../hooks/useCatalogProfiling';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';

// Type imports
import {
  DataProfilingResult,
  ProfilingJob,
  StatisticalMetrics,
  DataDistribution,
  DataQualityProfile,
  ProfilingConfig,
  ProfilingJobStatus
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface DataProfilerProps {
  assetId?: string;
  initialAssetType?: string;
  onProfileComplete?: (result: DataProfilingResult) => void;
  onError?: (error: Error) => void;
}

interface ProfilerState {
  selectedAssetId: string;
  selectedColumns: string[];
  profilingType: 'BASIC' | 'ADVANCED' | 'COMPREHENSIVE' | 'CUSTOM';
  includeStatistics: boolean;
  includeQuality: boolean;
  includeDistribution: boolean;
  includePatterns: boolean;
  sampleSize: number;
  scheduleMode: 'MANUAL' | 'SCHEDULED';
  autoRefresh: boolean;
  showAdvancedOptions: boolean;
  activeTab: string;
  selectedMetric: string | null;
  comparisonMode: boolean;
  exportFormat: 'JSON' | 'CSV' | 'EXCEL' | 'PDF';
}

interface ProfilerFilters {
  columnType?: string;
  qualityThreshold?: number;
  nullPercentage?: number;
  uniqueness?: number;
  searchTerm: string;
}

interface ProfilingJobConfig {
  type: 'BASIC' | 'ADVANCED' | 'COMPREHENSIVE' | 'CUSTOM';
  columns: string[];
  sampleSize: number;
  includeStatistics: boolean;
  includeQuality: boolean;
  includeDistribution: boolean;
  includePatterns: boolean;
  customRules: ProfilingRule[];
}

interface ProfilingRule {
  name: string;
  type: 'PATTERN' | 'RANGE' | 'ENUM' | 'CUSTOM';
  column: string;
  condition: string;
  expectedValue?: any;
  tolerance?: number;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

interface ColumnProfile {
  columnName: string;
  dataType: string;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  uniquePercentage: number;
  statistics: StatisticalMetrics;
  distribution: DataDistribution;
  qualityScore: number;
  patterns: string[];
  anomalies: string[];
  recommendations: string[];
}

interface QualityInsight {
  type: 'COMPLETENESS' | 'VALIDITY' | 'CONSISTENCY' | 'ACCURACY' | 'UNIQUENESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  affectedColumns: string[];
  recommendation: string;
  impact: number;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockColumnProfiles = (count: number = 10): ColumnProfile[] => {
  const dataTypes = ['STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'DATE', 'TIMESTAMP'];
  const columns: ColumnProfile[] = [];

  for (let i = 0; i < count; i++) {
    const dataType = dataTypes[Math.floor(Math.random() * dataTypes.length)];
    const nullPercentage = Math.random() * 20;
    const uniquePercentage = Math.random() * 100;
    const qualityScore = Math.random() * 100;

    columns.push({
      columnName: `column_${i + 1}`,
      dataType,
      nullCount: Math.floor(Math.random() * 1000),
      nullPercentage,
      uniqueCount: Math.floor(Math.random() * 10000),
      uniquePercentage,
      statistics: {
        count: 10000,
        mean: Math.random() * 1000,
        median: Math.random() * 1000,
        mode: Math.random() * 1000,
        min: Math.random() * 100,
        max: Math.random() * 1000,
        standardDeviation: Math.random() * 100,
        variance: Math.random() * 10000,
        skewness: (Math.random() - 0.5) * 4,
        kurtosis: Math.random() * 10,
        percentile25: Math.random() * 250,
        percentile75: Math.random() * 750,
        interquartileRange: Math.random() * 500
      } as StatisticalMetrics,
      distribution: {
        type: 'NORMAL',
        bins: Array.from({ length: 20 }, (_, i) => ({
          range: `${i * 50}-${(i + 1) * 50}`,
          count: Math.floor(Math.random() * 500),
          percentage: Math.random() * 5
        })),
        parameters: {
          mean: Math.random() * 1000,
          standardDeviation: Math.random() * 100
        }
      } as DataDistribution,
      qualityScore,
      patterns: [`Pattern_${i + 1}`, `Format_${i + 1}`],
      anomalies: qualityScore < 70 ? [`Anomaly_${i + 1}`] : [],
      recommendations: qualityScore < 80 ? [`Improve ${columnName} quality`] : []
    });
  }

  return columns;
};

const generateMockQualityInsights = (): QualityInsight[] => {
  return [
    {
      type: 'COMPLETENESS',
      severity: 'HIGH',
      message: 'High null percentage detected in critical columns',
      affectedColumns: ['customer_id', 'email'],
      recommendation: 'Implement data validation rules to reduce null values',
      impact: 85
    },
    {
      type: 'UNIQUENESS',
      severity: 'MEDIUM',
      message: 'Duplicate values found in supposedly unique columns',
      affectedColumns: ['user_id', 'transaction_id'],
      recommendation: 'Review duplicate detection and removal processes',
      impact: 65
    },
    {
      type: 'VALIDITY',
      severity: 'LOW',
      message: 'Some values do not match expected format patterns',
      affectedColumns: ['phone_number', 'zip_code'],
      recommendation: 'Standardize format validation rules',
      impact: 40
    }
  ];
};

const generateMockTrendData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    qualityScore: 70 + Math.random() * 30,
    completeness: 80 + Math.random() * 20,
    validity: 75 + Math.random() * 25,
    uniqueness: 85 + Math.random() * 15,
    consistency: 78 + Math.random() * 22
  }));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DataProfiler: React.FC<DataProfilerProps> = ({
  assetId: initialAssetId,
  initialAssetType,
  onProfileComplete,
  onError
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const profilingHook = useCatalogProfiling({
    enableRealTimeUpdates: false,
    onProfilingComplete: onProfileComplete,
    onProfilingError: onError
  });

  const analyticsHook = useCatalogAnalytics({
    enableRealTimeUpdates: true,
    autoRefreshInterval: 30000
  });

  // Local State
  const [state, setState] = useState<ProfilerState>({
    selectedAssetId: initialAssetId || '',
    selectedColumns: [],
    profilingType: 'COMPREHENSIVE',
    includeStatistics: true,
    includeQuality: true,
    includeDistribution: true,
    includePatterns: true,
    sampleSize: 10000,
    scheduleMode: 'MANUAL',
    autoRefresh: false,
    showAdvancedOptions: false,
    activeTab: 'overview',
    selectedMetric: null,
    comparisonMode: false,
    exportFormat: 'JSON'
  });

  const [filters, setFilters] = useState<ProfilerFilters>({
    searchTerm: ''
  });

  const [customRules, setCustomRules] = useState<ProfilingRule[]>([]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ProfilingJob | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Mock data (in production, this would come from the hooks)
  const [mockColumnProfiles] = useState(() => generateMockColumnProfiles(15));
  const [mockQualityInsights] = useState(() => generateMockQualityInsights());
  const [mockTrendData] = useState(() => generateMockTrendData());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredColumns = useMemo(() => {
    return mockColumnProfiles.filter(column => {
      if (filters.searchTerm && !column.columnName.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.columnType && column.dataType !== filters.columnType) {
        return false;
      }
      if (filters.qualityThreshold && column.qualityScore < filters.qualityThreshold) {
        return false;
      }
      if (filters.nullPercentage && column.nullPercentage > filters.nullPercentage) {
        return false;
      }
      if (filters.uniqueness && column.uniquePercentage < filters.uniqueness) {
        return false;
      }
      return true;
    });
  }, [mockColumnProfiles, filters]);

  const overallQualityScore = useMemo(() => {
    if (filteredColumns.length === 0) return 0;
    return filteredColumns.reduce((sum, col) => sum + col.qualityScore, 0) / filteredColumns.length;
  }, [filteredColumns]);

  const qualityDistribution = useMemo(() => {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    filteredColumns.forEach(col => {
      if (col.qualityScore >= 90) distribution.excellent++;
      else if (col.qualityScore >= 70) distribution.good++;
      else if (col.qualityScore >= 50) distribution.fair++;
      else distribution.poor++;
    });
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: name === 'excellent' ? '#22c55e' : name === 'good' ? '#3b82f6' : name === 'fair' ? '#f59e0b' : '#ef4444'
    }));
  }, [filteredColumns]);

  const dataTypeDistribution = useMemo(() => {
    const types: Record<string, number> = {};
    filteredColumns.forEach(col => {
      types[col.dataType] = (types[col.dataType] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [filteredColumns]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAssetChange = useCallback((assetId: string) => {
    setState(prev => ({ ...prev, selectedAssetId: assetId }));
    profilingHook.setFilters({ assetId });
  }, [profilingHook]);

  const handleProfilingTypeChange = useCallback((type: 'BASIC' | 'ADVANCED' | 'COMPREHENSIVE' | 'CUSTOM') => {
    setState(prev => ({ ...prev, profilingType: type }));
  }, []);

  const handleColumnSelection = useCallback((columnName: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedColumns: selected
        ? [...prev.selectedColumns, columnName]
        : prev.selectedColumns.filter(col => col !== columnName)
    }));
  }, []);

  const handleSelectAllColumns = useCallback((selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedColumns: selected ? filteredColumns.map(col => col.columnName) : []
    }));
  }, [filteredColumns]);

  const handleStartProfiling = useCallback(async () => {
    if (!state.selectedAssetId) {
      alert('Please select an asset first');
      return;
    }

    try {
      const config: ProfilingJobConfig = {
        type: state.profilingType,
        columns: state.selectedColumns.length > 0 ? state.selectedColumns : filteredColumns.map(col => col.columnName),
        sampleSize: state.sampleSize,
        includeStatistics: state.includeStatistics,
        includeQuality: state.includeQuality,
        includeDistribution: state.includeDistribution,
        includePatterns: state.includePatterns,
        customRules
      };

      const job = await profilingHook.createProfilingJob({
        assetId: state.selectedAssetId,
        config: config as any,
        type: state.profilingType,
        scheduleConfig: {
          frequency: state.scheduleMode
        }
      });

      setSelectedJob(job);
      
      if (state.scheduleMode === 'MANUAL') {
        await profilingHook.executeProfilingJob(job.id);
      }

      setIsProfileDialogOpen(false);
    } catch (error) {
      console.error('Failed to start profiling:', error);
      onError?.(error as Error);
    }
  }, [state, filteredColumns, customRules, profilingHook, onError]);

  const handleExportResults = useCallback(async () => {
    if (!selectedJob) return;

    try {
      const blob = await profilingHook.exportProfilingResults(selectedJob.id, state.exportFormat);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profiling_results_${selectedJob.id}.${state.exportFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Failed to export results:', error);
    }
  }, [selectedJob, state.exportFormat, profilingHook]);

  const handleAddCustomRule = useCallback(() => {
    const newRule: ProfilingRule = {
      name: `Rule ${customRules.length + 1}`,
      type: 'PATTERN',
      column: '',
      condition: '',
      severity: 'WARNING'
    };
    setCustomRules(prev => [...prev, newRule]);
    setIsRuleDialogOpen(true);
  }, [customRules.length]);

  const handleUpdateCustomRule = useCallback((index: number, rule: ProfilingRule) => {
    setCustomRules(prev => prev.map((r, i) => i === index ? rule : r));
  }, []);

  const handleDeleteCustomRule = useCallback((index: number) => {
    setCustomRules(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleFilterChange = useCallback((key: keyof ProfilerFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleRefresh = useCallback(async () => {
    await profilingHook.refreshProfiling();
  }, [profilingHook]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total Columns</CardTitle>
          <Database className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{filteredColumns.length}</div>
          <p className="text-xs text-blue-600 mt-1">
            {dataTypeDistribution.length} different data types
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Quality Score</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{Math.round(overallQualityScore)}%</div>
          <Progress value={overallQualityScore} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">Quality Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900">{mockQualityInsights.length}</div>
          <p className="text-xs text-yellow-600 mt-1">
            {mockQualityInsights.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL').length} critical
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Profiling Jobs</CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{profilingHook.jobs.length}</div>
          <p className="text-xs text-purple-600 mt-1">
            {profilingHook.jobs.filter(j => j.status === 'RUNNING').length} running
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderColumnProfile = (column: ColumnProfile) => (
    <Card key={column.columnName} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={state.selectedColumns.includes(column.columnName)}
              onCheckedChange={(checked) => handleColumnSelection(column.columnName, checked as boolean)}
            />
            <div>
              <CardTitle className="text-lg">{column.columnName}</CardTitle>
              <div className="flex items-center space-x-4 mt-1">
                <Badge variant="outline" className="text-xs">
                  {column.dataType}
                </Badge>
                <Badge
                  variant={column.qualityScore >= 80 ? "default" : column.qualityScore >= 60 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  Quality: {Math.round(column.qualityScore)}%
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, selectedMetric: column.columnName }))}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Distribution
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Trends
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Null %</p>
            <p className="text-lg font-semibold">{column.nullPercentage.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Unique %</p>
            <p className="text-lg font-semibold">{column.uniquePercentage.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Mean</p>
            <p className="text-lg font-semibold">{column.statistics.mean?.toFixed(2) || 'N/A'}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Std Dev</p>
            <p className="text-lg font-semibold">{column.statistics.standardDeviation?.toFixed(2) || 'N/A'}</p>
          </div>
        </div>

        {column.anomalies.length > 0 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Quality Issues Detected</AlertTitle>
            <AlertDescription>
              {column.anomalies.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {column.recommendations.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Recommendations:</p>
            <ul className="text-sm text-blue-700 list-disc list-inside">
              {column.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStatisticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qualityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" fill={(entry: any) => entry.color} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistical Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Mean</TableHead>
                <TableHead>Median</TableHead>
                <TableHead>Std Dev</TableHead>
                <TableHead>Min</TableHead>
                <TableHead>Max</TableHead>
                <TableHead>Skewness</TableHead>
                <TableHead>Kurtosis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColumns.map((column) => (
                <TableRow key={column.columnName}>
                  <TableCell className="font-medium">{column.columnName}</TableCell>
                  <TableCell>{column.dataType}</TableCell>
                  <TableCell>{column.statistics.count}</TableCell>
                  <TableCell>{column.statistics.mean?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{column.statistics.median?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{column.statistics.standardDeviation?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{column.statistics.min?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{column.statistics.max?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{column.statistics.skewness?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{column.statistics.kurtosis?.toFixed(2) || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderQualityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center mb-4">{Math.round(overallQualityScore)}%</div>
            <Progress value={overallQualityScore} className="mb-4" />
            <div className="text-sm text-gray-600 text-center">
              Based on {filteredColumns.length} columns
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completeness</span>
                <span className="text-sm font-semibold">85%</span>
              </div>
              <Progress value={85} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Validity</span>
                <span className="text-sm font-semibold">78%</span>
              </div>
              <Progress value={78} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Uniqueness</span>
                <span className="text-sm font-semibold">92%</span>
              </div>
              <Progress value={92} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Consistency</span>
                <span className="text-sm font-semibold">73%</span>
              </div>
              <Progress value={73} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockTrendData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="qualityScore" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quality Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockQualityInsights.map((insight, index) => (
              <Alert key={index} className={
                insight.severity === 'CRITICAL' ? 'border-red-500 bg-red-50' :
                insight.severity === 'HIGH' ? 'border-orange-500 bg-orange-50' :
                insight.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{insight.type}</span>
                  <Badge variant={
                    insight.severity === 'CRITICAL' ? 'destructive' :
                    insight.severity === 'HIGH' ? 'destructive' :
                    insight.severity === 'MEDIUM' ? 'secondary' :
                    'default'
                  }>
                    {insight.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{insight.message}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Affected columns: {insight.affectedColumns.join(', ')}
                  </p>
                  <p className="text-sm font-medium">
                    Recommendation: {insight.recommendation}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Impact</span>
                      <span>{insight.impact}%</span>
                    </div>
                    <Progress value={insight.impact} className="h-2 mt-1" />
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDistributionTab = () => (
    <div className="space-y-6">
      {filteredColumns.slice(0, 6).map((column) => (
        <Card key={column.columnName}>
          <CardHeader>
            <CardTitle>{column.columnName} Distribution</CardTitle>
            <CardDescription>Data type: {column.dataType}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={column.distribution.bins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderJobsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Profiling Jobs</h3>
        <Button onClick={() => setIsProfileDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Profiling Job
        </Button>
      </div>

      <div className="space-y-4">
        {profilingHook.jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{job.name || `Job ${job.id}`}</CardTitle>
                  <CardDescription>Asset: {job.assetId}</CardDescription>
                </div>
                <Badge variant={
                  job.status === 'COMPLETED' ? 'default' :
                  job.status === 'RUNNING' ? 'secondary' :
                  job.status === 'FAILED' ? 'destructive' :
                  'outline'
                }>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold">{job.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{job.duration ? `${job.duration}s` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <Progress value={job.progress || 0} className="mt-1" />
                </div>
              </div>
              
              <div className="flex space-x-2">
                {job.status === 'PENDING' && (
                  <Button size="sm" onClick={() => profilingHook.executeProfilingJob(job.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </Button>
                )}
                {job.status === 'RUNNING' && (
                  <Button size="sm" variant="outline" onClick={() => profilingHook.cancelProfilingJob(job.id)}>
                    <Pause className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
                {job.status === 'COMPLETED' && (
                  <Button size="sm" variant="outline" onClick={() => setSelectedJob(job)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => profilingHook.deleteProfilingJob(job.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profiling Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="profiling-type">Profiling Type</Label>
                <Select value={state.profilingType} onValueChange={handleProfilingTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="COMPREHENSIVE">Comprehensive</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sample-size">Sample Size</Label>
                <Input
                  id="sample-size"
                  type="number"
                  value={state.sampleSize}
                  onChange={(e) => setState(prev => ({ ...prev, sampleSize: parseInt(e.target.value) || 10000 }))}
                />
              </div>

              <div>
                <Label htmlFor="schedule-mode">Schedule Mode</Label>
                <Select value={state.scheduleMode} onValueChange={(value: any) => setState(prev => ({ ...prev, scheduleMode: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-statistics"
                  checked={state.includeStatistics}
                  onCheckedChange={(checked) => setState(prev => ({ ...prev, includeStatistics: checked }))}
                />
                <Label htmlFor="include-statistics">Include Statistics</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-quality"
                  checked={state.includeQuality}
                  onCheckedChange={(checked) => setState(prev => ({ ...prev, includeQuality: checked }))}
                />
                <Label htmlFor="include-quality">Include Quality Assessment</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-distribution"
                  checked={state.includeDistribution}
                  onCheckedChange={(checked) => setState(prev => ({ ...prev, includeDistribution: checked }))}
                />
                <Label htmlFor="include-distribution">Include Distribution Analysis</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-patterns"
                  checked={state.includePatterns}
                  onCheckedChange={(checked) => setState(prev => ({ ...prev, includePatterns: checked }))}
                />
                <Label htmlFor="include-patterns">Include Pattern Detection</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={state.autoRefresh}
                  onCheckedChange={(checked) => setState(prev => ({ ...prev, autoRefresh: checked }))}
                />
                <Label htmlFor="auto-refresh">Auto Refresh Results</Label>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Custom Rules</h4>
              <Button onClick={handleAddCustomRule}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-3">
              {customRules.map((rule, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Rule Name</Label>
                        <Input
                          value={rule.name}
                          onChange={(e) => handleUpdateCustomRule(index, { ...rule, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={rule.type}
                          onValueChange={(value: any) => handleUpdateCustomRule(index, { ...rule, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PATTERN">Pattern</SelectItem>
                            <SelectItem value="RANGE">Range</SelectItem>
                            <SelectItem value="ENUM">Enum</SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Column</Label>
                        <Select
                          value={rule.column}
                          onValueChange={(value) => handleUpdateCustomRule(index, { ...rule, column: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredColumns.map(col => (
                              <SelectItem key={col.columnName} value={col.columnName}>
                                {col.columnName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <Label>Severity</Label>
                          <Select
                            value={rule.severity}
                            onValueChange={(value: any) => handleUpdateCustomRule(index, { ...rule, severity: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INFO">Info</SelectItem>
                              <SelectItem value="WARNING">Warning</SelectItem>
                              <SelectItem value="ERROR">Error</SelectItem>
                              <SelectItem value="CRITICAL">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomRule(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Condition</Label>
                      <Textarea
                        value={rule.condition}
                        onChange={(e) => handleUpdateCustomRule(index, { ...rule, condition: e.target.value })}
                        placeholder="Enter rule condition (e.g., length > 10, matches pattern '^[A-Z]+$')"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Profiler</h1>
            <p className="text-gray-600 mt-1">Advanced statistical analysis and quality assessment</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleRefresh} disabled={profilingHook.isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${profilingHook.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsExportDialogOpen(true)} disabled={!selectedJob}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsProfileDialogOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              New Profile
            </Button>
          </div>
        </div>

        {/* Asset Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="asset-id">Asset ID</Label>
                <Input
                  id="asset-id"
                  value={state.selectedAssetId}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  placeholder="Enter asset ID"
                />
              </div>
              <div>
                <Label htmlFor="search-columns">Search Columns</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search-columns"
                    className="pl-10"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    placeholder="Search columns..."
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => handleSelectAllColumns(state.selectedColumns.length === 0)}
                  className="w-full"
                >
                  {state.selectedColumns.length === 0 ? 'Select All' : 'Deselect All'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Data Type</Label>
                <Select value={filters.columnType || ''} onValueChange={(value) => handleFilterChange('columnType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="STRING">String</SelectItem>
                    <SelectItem value="INTEGER">Integer</SelectItem>
                    <SelectItem value="FLOAT">Float</SelectItem>
                    <SelectItem value="BOOLEAN">Boolean</SelectItem>
                    <SelectItem value="DATE">Date</SelectItem>
                    <SelectItem value="TIMESTAMP">Timestamp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Min Quality Score</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.qualityThreshold || ''}
                  onChange={(e) => handleFilterChange('qualityThreshold', parseFloat(e.target.value) || undefined)}
                  placeholder="0-100"
                />
              </div>
              <div>
                <Label>Max Null %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.nullPercentage || ''}
                  onChange={(e) => handleFilterChange('nullPercentage', parseFloat(e.target.value) || undefined)}
                  placeholder="0-100"
                />
              </div>
              <div>
                <Label>Min Uniqueness %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.uniqueness || ''}
                  onChange={(e) => handleFilterChange('uniqueness', parseFloat(e.target.value) || undefined)}
                  placeholder="0-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        {renderOverviewCards()}

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-4">
              {filteredColumns.map(renderColumnProfile)}
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            {renderStatisticsTab()}
          </TabsContent>

          <TabsContent value="quality">
            {renderQualityTab()}
          </TabsContent>

          <TabsContent value="distribution">
            {renderDistributionTab()}
          </TabsContent>

          <TabsContent value="jobs">
            {renderJobsTab()}
          </TabsContent>

          <TabsContent value="configuration">
            {renderConfigurationTab()}
          </TabsContent>
        </Tabs>

        {/* New Profiling Job Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Profiling Job</DialogTitle>
              <DialogDescription>
                Configure and start a new data profiling job
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Asset ID</Label>
                  <Input
                    value={state.selectedAssetId}
                    onChange={(e) => setState(prev => ({ ...prev, selectedAssetId: e.target.value }))}
                    placeholder="Enter asset ID"
                  />
                </div>
                <div>
                  <Label>Profiling Type</Label>
                  <Select value={state.profilingType} onValueChange={handleProfilingTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="COMPREHENSIVE">Comprehensive</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Sample Size</Label>
                <Input
                  type="number"
                  value={state.sampleSize}
                  onChange={(e) => setState(prev => ({ ...prev, sampleSize: parseInt(e.target.value) || 10000 }))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={state.includeStatistics}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, includeStatistics: checked }))}
                  />
                  <Label>Include Statistical Analysis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={state.includeQuality}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, includeQuality: checked }))}
                  />
                  <Label>Include Quality Assessment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={state.includeDistribution}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, includeDistribution: checked }))}
                  />
                  <Label>Include Distribution Analysis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={state.includePatterns}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, includePatterns: checked }))}
                  />
                  <Label>Include Pattern Detection</Label>
                </div>
              </div>

              {state.selectedColumns.length > 0 && (
                <div>
                  <Label>Selected Columns ({state.selectedColumns.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {state.selectedColumns.map(col => (
                      <Badge key={col} variant="secondary">
                        {col}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2"
                          onClick={() => handleColumnSelection(col, false)}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStartProfiling} disabled={!state.selectedAssetId}>
                Start Profiling
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Profiling Results</DialogTitle>
              <DialogDescription>
                Choose the format for exporting profiling results
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select value={state.exportFormat} onValueChange={(value: any) => setState(prev => ({ ...prev, exportFormat: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="EXCEL">Excel</SelectItem>
                    <SelectItem value="PDF">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportResults}>
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default DataProfiler;