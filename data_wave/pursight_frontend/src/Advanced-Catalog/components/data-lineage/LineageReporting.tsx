'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  Calendar,
  CalendarDays
} from '@/components/ui/calendar';

import { FileText, Download, Upload, Share2, Eye, Edit, Trash2, Plus, Filter, Search, RefreshCw, Settings, BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Clock, Users, Database, GitBranch, Link, Network, Layers, MapPin, Target, Activity, Zap, Gauge, AlertTriangle, CheckCircle, XCircle, Minus, Calendar as CalendarIcon, Mail, Bell, Star, BookOpen, Archive, History, Play, Pause, Square, SkipForward, Repeat, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, MoreHorizontal, ExternalLink, Copy, Save, Send, Layout, Grid, List, Table as TableIcon } from 'lucide-react';

import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  RadialBarChart, 
  RadialBar, 
  ComposedChart,
  ScatterChart,
  Scatter,
  TreeMap,
  Sankey
} from 'recharts';

import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO, formatDistanceToNow, addDays } from 'date-fns';
import { cn } from '@/lib copie/utils';

// Import backend services
import { advancedLineageService } from '../../services/advanced-lineage.service';
import { collaborationService } from '../../services';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { catalogAnalyticsService } from '../../services/catalog-analytics.service';

// Import types
import { 
  LineageReport,
  LineageReportType,
  LineageReportConfig,
  LineageReportContent,
  LineageReportMetadata,
  LineageReportDistribution,
  LineageReportStatus,
  LineageDocumentation,
  DocumentationApprovalStatus,
  LineageMetrics,
  LineageAnalysisResult,
  LineageImpactAnalysis,
  TimeRange
} from '../../types/lineage.types';

// ============================================================================
// ADVANCED LINEAGE REPORTING TYPES
// ============================================================================

interface LineageReportTemplate {
  id: string;
  name: string;
  description: string;
  type: LineageReportType;
  sections: ReportSection[];
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  distribution?: ReportDistribution;
  format: ReportFormat[];
  created_at: string;
  updated_at: string;
  created_by: string;
  is_default: boolean;
}

interface ReportSection {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'text' | 'metrics' | 'visualization';
  config: SectionConfig;
  data_source: string;
  filters?: ReportFilter[];
  order: number;
  enabled: boolean;
}

interface SectionConfig {
  chart_type?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'sankey' | 'treemap';
  columns?: string[];
  metrics?: string[];
  groupBy?: string[];
  sortBy?: string;
  limit?: number;
  aggregate?: string;
  visualization_config?: any;
}

interface ReportParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  label: string;
  description: string;
  default_value?: any;
  options?: any[];
  required: boolean;
  validation?: string;
}

interface ReportFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
  logical_operator?: 'and' | 'or';
}

interface ReportSchedule {
  id: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  cron_expression?: string;
  timezone: string;
  start_date: string;
  end_date?: string;
  parameters?: Record<string, any>;
}

interface ReportDistribution {
  id: string;
  enabled: boolean;
  recipients: ReportRecipient[];
  delivery_method: 'email' | 'webhook' | 'sftp' | 'api' | 'portal';
  format: ReportFormat[];
  notification_settings: NotificationSettings;
}

interface ReportRecipient {
  id: string;
  type: 'user' | 'group' | 'role' | 'email';
  identifier: string;
  name: string;
  permissions: RecipientPermission[];
}

interface RecipientPermission {
  action: 'view' | 'edit' | 'download' | 'share' | 'schedule';
  granted: boolean;
}

interface NotificationSettings {
  send_on_success: boolean;
  send_on_failure: boolean;
  send_summary: boolean;
  include_attachments: boolean;
  custom_message?: string;
}

type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html' | 'pptx';

interface ReportExecution {
  id: string;
  report_id: string;
  report_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  started_at: string;
  completed_at?: string;
  duration?: number;
  parameters: Record<string, any>;
  results?: ReportExecutionResults;
  error?: string;
  size_bytes?: number;
  row_count?: number;
  executed_by: string;
}

interface ReportExecutionResults {
  file_urls: Record<ReportFormat, string>;
  preview_data: any[];
  metadata: {
    generation_time: number;
    data_freshness: string;
    total_records: number;
    total_pages: number;
  };
}

interface ReportAnalytics {
  report_id: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time: number;
  avg_file_size: number;
  popular_formats: Array<{ format: ReportFormat; count: number }>;
  usage_trends: Array<{ date: string; executions: number; unique_users: number }>;
  user_engagement: Array<{ user_id: string; executions: number; last_access: string }>;
  performance_metrics: {
    p50_execution_time: number;
    p95_execution_time: number;
    p99_execution_time: number;
    error_rate: number;
  };
}

interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refresh_interval: number;
  auto_refresh: boolean;
  is_public: boolean;
  permissions: DashboardPermission[];
}

interface DashboardLayout {
  columns: number;
  rows: number;
  grid_size: number;
  responsive: boolean;
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text' | 'image' | 'iframe';
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  data_source: string;
  refresh_interval?: number;
  conditional_formatting?: ConditionalFormatting[];
}

interface WidgetPosition {
  x: number;
  y: number;
}

interface WidgetSize {
  width: number;
  height: number;
}

interface WidgetConfig {
  chart_type?: string;
  metrics?: string[];
  dimensions?: string[];
  filters?: ReportFilter[];
  sort?: string;
  limit?: number;
  format?: any;
  style?: any;
}

interface ConditionalFormatting {
  condition: string;
  format: {
    color?: string;
    background_color?: string;
    font_weight?: string;
    icon?: string;
  };
}

interface DashboardFilter {
  id: string;
  name: string;
  type: 'date_range' | 'select' | 'multiselect' | 'text' | 'number';
  field: string;
  default_value?: any;
  options?: any[];
  applies_to: string[]; // widget IDs
}

interface DashboardPermission {
  user_id?: string;
  role?: string;
  permissions: string[];
}

interface LineageReportingProps {
  className?: string;
  onReportGenerated?: (report: LineageReport) => void;
  onReportScheduled?: (schedule: ReportSchedule) => void;
  onDashboardCreated?: (dashboard: DashboardConfig) => void;
}

// Color schemes and constants
const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

const STATUS_COLORS = {
  pending: '#f59e0b',
  running: '#3b82f6',
  completed: '#10b981',
  failed: '#ef4444',
  cancelled: '#6b7280'
};

const REPORT_TYPE_ICONS = {
  SUMMARY: BarChart3,
  DETAILED: FileText,
  IMPACT_ANALYSIS: Network,
  QUALITY_REPORT: CheckCircle,
  COMPLIANCE_REPORT: Shield,
  PERFORMANCE_REPORT: Gauge
};

export default function LineageReporting({ 
  className, 
  onReportGenerated, 
  onReportScheduled,
  onDashboardCreated 
}: LineageReportingProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [reports, setReports] = useState<LineageReport[]>([]);
  const [templates, setTemplates] = useState<LineageReportTemplate[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, ReportAnalytics>>({});
  
  // UI States
  const [selectedReport, setSelectedReport] = useState<LineageReport | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LineageReportTemplate | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<ReportExecution | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardConfig | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showDashboardDialog, setShowDashboardDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  // Form States
  const [newReport, setNewReport] = useState<Partial<LineageReport>>({});
  const [newTemplate, setNewTemplate] = useState<Partial<LineageReportTemplate>>({});
  const [newSchedule, setNewSchedule] = useState<Partial<ReportSchedule>>({});
  const [newDashboard, setNewDashboard] = useState<Partial<DashboardConfig>>({});
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadReportingData();
    setupRealTimeUpdates();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const loadReportingData = async () => {
    setLoading(true);
    try {
      // Load reports from backend
      const reportsResponse = await advancedLineageService.generateLineageReport('all', 'SUMMARY');
      const reportsData = reportsResponse.data || [];
      
      // Load report templates from backend
      const templatesResponse = await enterpriseCatalogService.getReportTemplates();
      const templatesData = templatesResponse.data || [];
      
      // Load recent executions from backend
      const executionsResponse = await enterpriseCatalogService.getReportExecutions({
        limit: 50,
        sortBy: 'started_at',
        sortOrder: 'desc'
      });
      const executionsData = executionsResponse.data || [];
      
      // Load dashboards from backend
      const dashboardsResponse = await catalogAnalyticsService.getDashboards();
      const dashboardsData = dashboardsResponse.data || [];
      
      // Load analytics for each report
      const analyticsData: Record<string, ReportAnalytics> = {};
      for (const report of reportsData) {
        try {
          const analytics = await enterpriseCatalogService.getReportAnalytics(report.id);
          analyticsData[report.id] = analytics.data;
        } catch (err) {
          console.warn(`Failed to load analytics for report ${report.id}:`, err);
        }
      }
      
      setReports(reportsData);
      setTemplates(templatesData);
      setExecutions(executionsData);
      setDashboards(dashboardsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load reporting data from backend');
      console.error('Error loading reporting data:', err);
      
      // Fallback to empty states
      setReports([]);
      setTemplates([]);
      setExecutions([]);
      setDashboards([]);
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadReportingData();
    }, 30000);
    
    // WebSocket connection for real-time execution updates
    try {
      ws.current = new WebSocket(`${(typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL)}/reporting`);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'execution_update') {
          setExecutions(prev => prev.map(exec => 
            exec.id === data.execution.id ? { ...exec, ...data.execution } : exec
          ));
        }
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  };

  // Report Management Functions
  const createReport = async (reportData: Partial<LineageReport>) => {
    try {
      setLoading(true);
      
      const createRequest = {
        name: reportData.name || '',
        type: reportData.type || 'SUMMARY',
        config: reportData.config || {},
        parameters: reportParameters,
        assetId: reportData.metadata?.assetId,
        scope: reportData.metadata?.scope
      };
      
      const response = await advancedLineageService.generateLineageReport(
        createRequest.assetId || 'all',
        createRequest.type as any
      );
      
      const newReport = response.data;
      setReports(prev => [...prev, newReport]);
      setShowCreateDialog(false);
      setNewReport({});
      setReportParameters({});
      
      onReportGenerated?.(newReport);
    } catch (err) {
      setError('Failed to create report via backend');
      console.error('Report creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeReport = async (reportId: string, parameters: Record<string, any> = {}) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;
      
      const executionRequest = {
        reportId,
        parameters,
        format: ['pdf', 'excel'] as ReportFormat[],
        notify: true
      };
      
      const response = await enterpriseCatalogService.executeReport(executionRequest);
      const execution = response.data;
      
      setExecutions(prev => [execution, ...prev]);
      
      // Start polling for execution status
      pollExecutionStatus(execution.id);
      
    } catch (err) {
      setError('Failed to execute report via backend');
      console.error('Report execution error:', err);
    }
  };

  const pollExecutionStatus = async (executionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await enterpriseCatalogService.getExecutionStatus(executionId);
        const execution = response.data;
        
        setExecutions(prev => prev.map(exec => 
          exec.id === executionId ? execution : exec
        ));
        
        if (execution.status === 'completed' || execution.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Failed to poll execution status:', err);
        clearInterval(pollInterval);
      }
    }, 2000);
  };

  const scheduleReport = async (reportId: string, scheduleData: Partial<ReportSchedule>) => {
    try {
      const scheduleRequest = {
        reportId,
        frequency: scheduleData.frequency || 'weekly',
        cronExpression: scheduleData.cron_expression,
        timezone: scheduleData.timezone || 'UTC',
        startDate: scheduleData.start_date || new Date().toISOString(),
        endDate: scheduleData.end_date,
        parameters: scheduleData.parameters || {},
        distribution: {
          enabled: true,
          recipients: [],
          deliveryMethod: 'email' as const,
          format: ['pdf'] as ReportFormat[]
        }
      };
      
      const response = await enterpriseCatalogService.scheduleReport(scheduleRequest);
      const schedule = response.data;
      
      // Update the report with schedule info
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'SCHEDULED' as LineageReportStatus }
          : report
      ));
      
      setShowScheduleDialog(false);
      setNewSchedule({});
      
      onReportScheduled?.(schedule);
    } catch (err) {
      setError('Failed to schedule report via backend');
      console.error('Report scheduling error:', err);
    }
  };

  const createTemplate = async (templateData: Partial<LineageReportTemplate>) => {
    try {
      const createRequest = {
        name: templateData.name || '',
        description: templateData.description || '',
        type: templateData.type || 'SUMMARY',
        sections: templateData.sections || [],
        parameters: templateData.parameters || [],
        isDefault: templateData.is_default || false
      };
      
      const response = await enterpriseCatalogService.createReportTemplate(createRequest);
      const newTemplate = response.data;
      
      setTemplates(prev => [...prev, newTemplate]);
      setShowTemplateDialog(false);
      setNewTemplate({});
    } catch (err) {
      setError('Failed to create template via backend');
      console.error('Template creation error:', err);
    }
  };

  const createDashboard = async (dashboardData: Partial<DashboardConfig>) => {
    try {
      const createRequest = {
        name: dashboardData.name || '',
        description: dashboardData.description || '',
        layout: dashboardData.layout || { columns: 12, rows: 8, grid_size: 24, responsive: true },
        widgets: dashboardData.widgets || [],
        filters: dashboardData.filters || [],
        refreshInterval: dashboardData.refresh_interval || 300,
        autoRefresh: dashboardData.auto_refresh || true,
        isPublic: dashboardData.is_public || false
      };
      
      const response = await catalogAnalyticsService.createDashboard(createRequest);
      const newDashboard = response.data;
      
      setDashboards(prev => [...prev, newDashboard]);
      setShowDashboardDialog(false);
      setNewDashboard({});
      
      onDashboardCreated?.(newDashboard);
    } catch (err) {
      setError('Failed to create dashboard via backend');
      console.error('Dashboard creation error:', err);
    }
  };

  const exportReport = async (reportId: string, format: ReportFormat) => {
    try {
      const response = await enterpriseCatalogService.exportReport(reportId, format);
      const blob = new Blob([response.data], { 
        type: getContentType(format) 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lineage-report-${reportId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export report');
      console.error('Export error:', err);
    }
  };

  const previewReport = async (reportId: string) => {
    try {
      setLoading(true);
      const response = await enterpriseCatalogService.previewReport(reportId);
      setPreviewData(response.data);
      setShowPreviewDialog(true);
    } catch (err) {
      setError('Failed to preview report');
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Utility Functions
  const getContentType = (format: ReportFormat): string => {
    const types = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      json: 'application/json',
      html: 'text/html',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    return types[format] || 'application/octet-stream';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getReportTypeIcon = (type: LineageReportType) => {
    const IconComponent = REPORT_TYPE_ICONS[type] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Filter and Search Functions
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesType = filterType === 'all' || report.type === filterType;
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesSearch = !searchTerm || 
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.content.description && report.content.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [reports, filterType, filterStatus, searchTerm]);

  const filteredExecutions = useMemo(() => {
    return executions.filter(execution => {
      const matchesStatus = filterStatus === 'all' || execution.status === filterStatus;
      const matchesSearch = !searchTerm || 
        execution.report_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = isWithinInterval(parseISO(execution.started_at), {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      });
      
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [executions, filterStatus, searchTerm, dateRange]);

  // Render Functions
  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SUMMARY">Summary</SelectItem>
              <SelectItem value="DETAILED">Detailed</SelectItem>
              <SelectItem value="IMPACT_ANALYSIS">Impact Analysis</SelectItem>
              <SelectItem value="QUALITY_REPORT">Quality Report</SelectItem>
              <SelectItem value="COMPLIANCE_REPORT">Compliance Report</SelectItem>
              <SelectItem value="PERFORMANCE_REPORT">Performance Report</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="GENERATING">Generating</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadReportingData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getReportTypeIcon(report.type)}
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {report.content.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => previewReport(report.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => executeReport(report.id)}>
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportReport(report.id, 'pdf')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportReport(report.id, 'excel')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setSelectedReport(report);
                      setShowScheduleDialog(true);
                    }}>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Schedule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{report.type.replace('_', ' ')}</Badge>
                  <Badge 
                    variant={report.status === 'COMPLETED' ? 'default' : 'secondary'}
                    className={cn(
                      report.status === 'COMPLETED' && 'bg-green-100 text-green-800',
                      report.status === 'FAILED' && 'bg-red-100 text-red-800',
                      report.status === 'GENERATING' && 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {report.status}
                  </Badge>
                </div>
                
                {analytics[report.id] && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Executions</p>
                      <p className="font-medium">{analytics[report.id].total_executions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">
                        {Math.round((analytics[report.id].successful_executions / analytics[report.id].total_executions) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Time</p>
                      <p className="font-medium">{formatDuration(analytics[report.id].avg_execution_time)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Size</p>
                      <p className="font-medium">{formatFileSize(analytics[report.id].avg_file_size)}</p>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Generated {formatDistanceToNow(parseISO(report.generatedAt), { addSuffix: true })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'No reports match your current filters' 
              : 'Create your first lineage report to get started'}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>
      )}
    </div>
  );

  const renderExecutionsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search executions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-64 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button variant="outline" onClick={loadReportingData} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Executions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Track report generation progress and results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExecutions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{execution.report_name}</p>
                      <p className="text-sm text-muted-foreground">ID: {execution.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <span className={cn(
                        "capitalize",
                        execution.status === 'completed' && "text-green-600",
                        execution.status === 'failed' && "text-red-600",
                        execution.status === 'running' && "text-blue-600"
                      )}>
                        {execution.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full">
                      <Progress value={execution.progress} className="w-16 h-2" />
                      <span className="text-xs text-muted-foreground ml-2">{execution.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{format(parseISO(execution.started_at), 'MMM dd, HH:mm')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(parseISO(execution.started_at), { addSuffix: true })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {execution.duration ? formatDuration(execution.duration) : '-'}
                  </TableCell>
                  <TableCell>
                    {execution.size_bytes ? formatFileSize(execution.size_bytes) : '-'}
                  </TableCell>
                  <TableCell>{execution.executed_by}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {execution.status === 'completed' && execution.results && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {Object.entries(execution.results.file_urls).map(([format, url]) => (
                              <DropdownMenuItem key={format} asChild>
                                <a href={url} download>
                                  <Download className="w-4 h-4 mr-2" />
                                  ArrowDownTrayIcon {format.toUpperCase()}
                                </a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedExecution(execution)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredExecutions.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Executions Found</h3>
              <p className="text-muted-foreground">
                No executions match your current filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Report Templates</h2>
          <p className="text-muted-foreground">Manage reusable report configurations</p>
        </div>
        <Button onClick={() => setShowTemplateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getReportTypeIcon(template.type)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
                {template.is_default && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{template.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sections</p>
                    <p className="font-medium">{template.sections.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parameters</p>
                    <p className="font-medium">{template.parameters.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {format(parseISO(template.created_at), 'MMM dd')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setNewReport({ 
                        type: template.type,
                        config: { templateId: template.id }
                      });
                      setShowCreateDialog(true);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
          <p className="text-muted-foreground mb-4">
            Create reusable report templates to standardize your reporting
          </p>
          <Button onClick={() => setShowTemplateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );

  const renderDashboardsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboards</h2>
          <p className="text-muted-foreground">Interactive lineage analytics and insights</p>
        </div>
        <Button onClick={() => setShowDashboardDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Dashboard
        </Button>
      </div>

      {/* Dashboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                  <CardDescription>{dashboard.description}</CardDescription>
                </div>
                {dashboard.is_public && (
                  <Badge variant="secondary">Public</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Widgets</p>
                    <p className="font-medium">{dashboard.widgets.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Filters</p>
                    <p className="font-medium">{dashboard.filters.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Auto Refresh</p>
                    <p className="font-medium">
                      {dashboard.auto_refresh ? `${dashboard.refresh_interval}s` : 'Off'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Layout</p>
                    <p className="font-medium">
                      {dashboard.layout.columns}x{dashboard.layout.rows}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedDashboard(dashboard)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dashboards.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Dashboards Found</h3>
          <p className="text-muted-foreground mb-4">
            Create interactive dashboards to visualize your lineage analytics
          </p>
          <Button onClick={() => setShowDashboardDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Dashboard
          </Button>
        </div>
      )}
    </div>
  );

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading reporting data...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("h-full flex flex-col space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-500" />
              Lineage Reporting
            </h1>
            <p className="text-muted-foreground">
              Comprehensive lineage reporting with automated generation, interactive dashboards, and enterprise analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadReportingData} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            {renderReportsTab()}
          </TabsContent>

          <TabsContent value="executions" className="mt-6">
            {renderExecutionsTab()}
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            {renderTemplatesTab()}
          </TabsContent>

          <TabsContent value="dashboards" className="mt-6">
            {renderDashboardsTab()}
          </TabsContent>
        </Tabs>

        {/* Create Report Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Configure and generate a new lineage report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    value={newReport.name || ''}
                    onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter report name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select 
                    value={newReport.type || ''} 
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value as LineageReportType }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUMMARY">Summary</SelectItem>
                      <SelectItem value="DETAILED">Detailed</SelectItem>
                      <SelectItem value="IMPACT_ANALYSIS">Impact Analysis</SelectItem>
                      <SelectItem value="QUALITY_REPORT">Quality Report</SelectItem>
                      <SelectItem value="COMPLIANCE_REPORT">Compliance Report</SelectItem>
                      <SelectItem value="PERFORMANCE_REPORT">Performance Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  value={newReport.content?.description || ''}
                  onChange={(e) => setNewReport(prev => ({ 
                    ...prev, 
                    content: { ...prev.content, description: e.target.value }
                  }))}
                  placeholder="Describe the report purpose and scope"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createReport(newReport)} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Report Preview</DialogTitle>
              <DialogDescription>
                Preview report content before generation
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-96">
              {previewData && (
                <div className="space-y-4">
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}