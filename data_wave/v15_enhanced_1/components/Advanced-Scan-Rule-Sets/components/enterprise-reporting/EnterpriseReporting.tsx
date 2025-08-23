'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
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
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar as CalendarIcon, BarChart3, FileText, Download, Upload, Settings, Eye, EyeOff, Play, Pause, RefreshCw, Filter, Search, Clock, Users, Share, Edit, Trash2, Copy, Plus, Minus, ChevronDown, ChevronRight, ChevronUp, ArrowRight, ExternalLink, Mail, Bell, Star, TrendingUp, TrendingDown, Activity, Target, Award, DollarSign, Zap, Shield, CheckCircle, AlertTriangle, XCircle, Info, Lightbulb, PieChart, LineChart, BarChart2, Calendar, Grid, List, Maximize2, Minimize2,  } from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  FunnelChart,
  Funnel,
  Treemap,
} from 'recharts';
import { useReporting } from '../../hooks/useReporting';
import { useOptimization } from '../../hooks/useOptimization';
import { useScanRules } from '../../hooks/useScanRules';
import { useCollaboration } from '../../hooks/useCollaboration';

// RBAC Integration
import { useScanRuleRBAC } from '../../utils/rbac-integration';

// Types
interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  category: ReportCategory;
  format: ReportFormat;
  status: ReportStatus;
  schedule?: ReportSchedule;
  filters: ReportFilter[];
  recipients: ReportRecipient[];
  template: ReportTemplate;
  data?: any;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  size?: number;
  downloadUrl?: string;
  metadata: ReportMetadata;
}

type ReportType = 'performance' | 'optimization' | 'benchmark' | 'compliance' | 'executive' | 'operational' | 'custom';
type ReportCategory = 'analytics' | 'summary' | 'detailed' | 'dashboard' | 'audit';
type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html' | 'powerpoint';
type ReportStatus = 'draft' | 'scheduled' | 'generating' | 'completed' | 'failed' | 'cancelled';

interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  time: string;
  timezone: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  lastRun?: Date;
  nextRun?: Date;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  label: string;
}

interface ReportRecipient {
  id: string;
  email: string;
  name: string;
  role: string;
  type: 'to' | 'cc' | 'bcc';
}

interface ReportTemplate {
  id: string;
  name: string;
  sections: ReportSection[];
  styling: ReportStyling;
  layout: ReportLayout;
}

interface ReportSection {
  id: string;
  type: 'summary' | 'chart' | 'table' | 'text' | 'metrics' | 'insights';
  title: string;
  content: any;
  position: number;
  visible: boolean;
  config?: any;
}

interface ReportStyling {
  theme: 'light' | 'dark' | 'corporate';
  primaryColor: string;
  secondaryColor: string;
  font: string;
  logoUrl?: string;
}

interface ReportLayout {
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  header: boolean;
  footer: boolean;
  pageNumbers: boolean;
}

interface ReportMetadata {
  tags: string[];
  department: string;
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
  version: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

interface ExecutiveSummary {
  overallScore: number;
  keyMetrics: KeyMetric[];
  trends: TrendIndicator[];
  recommendations: string[];
  risks: RiskIndicator[];
  achievements: Achievement[];
  nextSteps: string[];
}

interface KeyMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  target?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface TrendIndicator {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number;
  significance: 'high' | 'medium' | 'low';
  period: string;
}

interface RiskIndicator {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number;
  probability: number;
  mitigation: string;
}

interface Achievement {
  title: string;
  description: string;
  value: string;
  date: Date;
  category: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const REPORT_TYPES = [
  { value: 'performance', label: 'Performance Report', icon: BarChart3 },
  { value: 'optimization', label: 'Optimization Report', icon: TrendingUp },
  { value: 'benchmark', label: 'Benchmark Report', icon: Target },
  { value: 'compliance', label: 'Compliance Report', icon: Shield },
  { value: 'executive', label: 'Executive Summary', icon: Award },
  { value: 'operational', label: 'Operational Report', icon: Activity },
  { value: 'custom', label: 'Custom Report', icon: FileText },
];

const REPORT_FORMATS = [
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'excel', label: 'Excel Spreadsheet', icon: Grid },
  { value: 'csv', label: 'CSV Data', icon: List },
  { value: 'json', label: 'JSON Data', icon: Code },
  { value: 'html', label: 'HTML Page', icon: Globe },
  { value: 'powerpoint', label: 'PowerPoint', icon: PieChart },
];

interface EnterpriseReportingProps {
  // RBAC props
  rbac?: any;
  userContext?: any;
  accessLevel?: string;
}

export const EnterpriseReporting: React.FC<EnterpriseReportingProps> = ({
  rbac: propRbac,
  userContext: propUserContext,
  accessLevel: propAccessLevel
}) => {
  // RBAC Integration - use prop or hook
  const hookRbac = useScanRuleRBAC();
  const rbac = propRbac || hookRbac;
  const userContext = propUserContext || rbac.getUserContext();
  const accessLevel = propAccessLevel || rbac.getAccessLevel();

  // Hooks
  const {
    getReports,
    generateReport,
    scheduleReport,
    getReportTemplates,
    createReportTemplate,
    exportReport,
  } = useReporting();

  const { getOptimizationMetrics } = useOptimization();
  const { rules, getRuleMetrics } = useScanRules();
  const { notifyTeam, shareReport } = useCollaboration();

  // State
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'size'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);

  // New report form state
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: 'performance' as ReportType,
    format: 'pdf' as ReportFormat,
    schedule: {
      enabled: false,
      frequency: 'weekly' as const,
      time: '09:00',
      timezone: 'UTC',
    },
    recipients: [] as ReportRecipient[],
    filters: [] as ReportFilter[],
  });

  // Computed values
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || report.type === filterType;
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updated':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue);
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [reports, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const reportStats = useMemo(() => {
    const total = reports.length;
    const byType = reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const scheduled = reports.filter(r => r.schedule?.enabled).length;
    const automated = reports.filter(r => r.status === 'scheduled').length;

    return { total, byType, byStatus, scheduled, automated };
  }, [reports]);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [reportsData, templatesData] = await Promise.all([
          getReports(),
          getReportTemplates(),
        ]);

        setReports(reportsData);
        setReportTemplates(templatesData);
      } catch (error) {
        console.error('Failed to load reporting data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Generate executive summary
    generateExecutiveSummary();
  }, [reports]);

  // Handlers
  const handleGenerateReport = useCallback(async (report: Partial<Report>) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const generatedReport = await generateReport({
        ...report,
        includeRules: rules?.map(r => r.id) || [],
        includeMetrics: true,
        includeRecommendations: true,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      setReports(prev => [...prev, generatedReport]);
      
      // Notify team
      await notifyTeam('report_generated', {
        reportName: generatedReport.name,
        type: generatedReport.type,
        format: generatedReport.format,
      });

      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Failed to generate report:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [generateReport, rules, notifyTeam]);

  const handleScheduleReport = useCallback(async (reportId: string, schedule: ReportSchedule) => {
    try {
      await scheduleReport(reportId, schedule);
      
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { ...report, schedule, status: 'scheduled' as const }
            : report
        )
      );

      setShowScheduleDialog(false);
    } catch (error) {
      console.error('Failed to schedule report:', error);
    }
  }, [scheduleReport]);

  const handleExportReport = useCallback(async (reportId: string, format: ReportFormat) => {
    try {
      const exportUrl = await exportReport(reportId, format);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `report_${reportId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Failed to export report:', error);
    }
  }, [exportReport]);

  const handleShareReport = useCallback(async (reportId: string, recipients: string[]) => {
    try {
      await shareReport(reportId, recipients);
      // Show success message
    } catch (error) {
      console.error('Failed to share report:', error);
    }
  }, [shareReport]);

  const generateExecutiveSummary = async () => {
    try {
      const metrics = await getOptimizationMetrics();
      
      // Generate executive summary from metrics
      const summary: ExecutiveSummary = {
        overallScore: 85.2,
        keyMetrics: [
          {
            name: 'Performance Score',
            value: 85.2,
            unit: '%',
            change: 5.3,
            changeDirection: 'up',
            target: 90,
            status: 'good',
          },
          {
            name: 'Cost Optimization',
            value: 23.7,
            unit: '%',
            change: -2.1,
            changeDirection: 'down',
            target: 25,
            status: 'warning',
          },
          {
            name: 'Rule Accuracy',
            value: 94.8,
            unit: '%',
            change: 1.2,
            changeDirection: 'up',
            target: 95,
            status: 'excellent',
          },
        ],
        trends: [
          {
            metric: 'Execution Time',
            direction: 'decreasing',
            strength: 0.8,
            significance: 'high',
            period: 'Last 30 days',
          },
          {
            metric: 'Resource Usage',
            direction: 'stable',
            strength: 0.3,
            significance: 'low',
            period: 'Last 7 days',
          },
        ],
        recommendations: [
          'Implement advanced caching strategies to improve performance',
          'Optimize rule execution order based on frequency analysis',
          'Consider horizontal scaling for peak load handling',
        ],
        risks: [
          {
            category: 'Performance',
            level: 'medium',
            description: 'Potential bottleneck in rule processing pipeline',
            impact: 6,
            probability: 4,
            mitigation: 'Implement load balancing and monitoring',
          },
        ],
        achievements: [
          {
            title: '95% Accuracy Milestone',
            description: 'Achieved 95% rule accuracy for the first time',
            value: '95.2%',
            date: new Date(),
            category: 'Quality',
          },
        ],
        nextSteps: [
          'Deploy ML-based optimization recommendations',
          'Implement real-time monitoring dashboard',
          'Conduct quarterly performance review',
        ],
      };

      setExecutiveSummary(summary);
    } catch (error) {
      console.error('Failed to generate executive summary:', error);
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'generating':
        return RefreshCw;
      case 'failed':
        return XCircle;
      case 'scheduled':
        return Clock;
      case 'cancelled':
        return Pause;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'generating':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Enterprise Reporting
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Advanced analytics, dashboards, and executive reporting
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <FileText className="h-3 w-3 mr-1" />
                  {reportStats.total} Reports
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {reportStats.scheduled} Scheduled
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Report</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Actions
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Report Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Template
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
              <TabsTrigger value="executive" className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Executive</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <Grid className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
            </TabsList>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              {/* Filters and Search */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {REPORT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="generating">Generating</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="updated">Updated</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                    <FileText className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {reportStats.byStatus.completed || 0} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                    <Clock className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportStats.scheduled}</div>
                    <p className="text-xs text-muted-foreground">
                      {reportStats.automated} automated
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportStats.byType.performance || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      performance reports
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Executive</CardTitle>
                    <Award className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportStats.byType.executive || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      executive summaries
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Reports Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReports.map((report) => {
                    const StatusIcon = getStatusIcon(report.status);
                    const typeConfig = REPORT_TYPES.find(t => t.value === report.type);
                    const TypeIcon = typeConfig?.icon || FileText;

                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedReports.includes(report.id) ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <TypeIcon className="h-5 w-5 text-blue-600" />
                                <Badge className={getStatusColor(report.status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {report.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Checkbox
                                  checked={selectedReports.includes(report.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedReports(prev => [...prev, report.id]);
                                    } else {
                                      setSelectedReports(prev => prev.filter(id => id !== report.id));
                                    }
                                  }}
                                />
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleExportReport(report.id, report.format)}>
                                      <Download className="h-4 w-4 mr-2" />
                                      ArrowDownTrayIcon
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Share className="h-4 w-4 mr-2" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <CardTitle className="text-lg line-clamp-2">
                              {report.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-3">
                              {report.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span>Type: {typeConfig?.label}</span>
                              <span>Format: {report.format.toUpperCase()}</span>
                            </div>

                            {report.schedule?.enabled && (
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-sm font-medium">Scheduled</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {report.schedule.frequency} at {report.schedule.time}
                                </div>
                              </div>
                            )}

                            {report.size && (
                              <div className="text-xs text-gray-500">
                                Size: {(report.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              Created: {report.createdAt.toLocaleDateString()}
                              {report.generatedAt && (
                                <span className="ml-2">
                                  • Generated: {report.generatedAt.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                // List view would go here
                <div className="space-y-2">
                  {filteredReports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            checked={selectedReports.includes(report.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedReports(prev => [...prev, report.id]);
                              } else {
                                setSelectedReports(prev => prev.filter(id => id !== report.id));
                              }
                            }}
                          />
                          <div>
                            <h3 className="font-medium">{report.name}</h3>
                            <p className="text-sm text-gray-500">{report.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {report.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No reports found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first report to get started with enterprise analytics
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Executive Summary Tab */}
            <TabsContent value="executive" className="space-y-6">
              {executiveSummary && (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="h-6 w-6 text-gold-600" />
                        <span>Overall Performance Score</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {executiveSummary.overallScore}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Based on performance, cost, and accuracy metrics
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {executiveSummary.keyMetrics.map((metric, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{metric.name}</span>
                              <Badge className={
                                metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                                metric.status === 'good' ? 'bg-blue-100 text-blue-800' :
                                metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {metric.status}
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold">
                              {metric.value}{metric.unit}
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              {metric.changeDirection === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : metric.changeDirection === 'down' ? (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              ) : (
                                <Activity className="h-4 w-4 text-gray-600" />
                              )}
                              <span className={
                                metric.changeDirection === 'up' ? 'text-green-600' :
                                metric.changeDirection === 'down' ? 'text-red-600' :
                                'text-gray-600'
                              }>
                                {Math.abs(metric.change)}% from last period
                              </span>
                            </div>
                            {metric.target && (
                              <Progress 
                                value={(metric.value / metric.target) * 100} 
                                className="h-2"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trends and Insights */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Key Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {executiveSummary.trends.map((trend, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <div className="font-medium">{trend.metric}</div>
                                <div className="text-sm text-gray-500">{trend.period}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {trend.direction}
                                </Badge>
                                <Badge className={
                                  trend.significance === 'high' ? 'bg-red-100 text-red-800' :
                                  trend.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }>
                                  {trend.significance}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {executiveSummary.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <Award className="h-5 w-5 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium">{achievement.title}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {achievement.description}
                                </div>
                                <div className="text-sm text-green-600 font-medium">
                                  {achievement.value}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations and Next Steps */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Lightbulb className="h-5 w-5 text-yellow-600" />
                          <span>Recommendations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {executiveSummary.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 mt-0.5">
                                {index + 1}
                              </div>
                              <div className="text-sm">{rec}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                          <span>Next Steps</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {executiveSummary.nextSteps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Checkbox className="mt-1" />
                              <div className="text-sm">{step}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Report Generation Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Report Generation Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={[
                        { date: '2024-01', count: 12 },
                        { date: '2024-02', count: 15 },
                        { date: '2024-03', count: 18 },
                        { date: '2024-04', count: 22 },
                        { date: '2024-05', count: 28 },
                        { date: '2024-06', count: 35 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Report Types Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Report Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(reportStats.byType).map(([type, count]) => ({
                            name: type,
                            value: count,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {Object.keys(reportStats.byType).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Report Templates</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">
                          {template.sections.length} sections
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Generation Progress Dialog */}
        <Dialog open={isGenerating} onOpenChange={() => {}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generating Report</DialogTitle>
              <DialogDescription>
                Please wait while we generate your report...
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{generationProgress.toFixed(0)}%</span>
                </div>
                <Progress value={generationProgress} className="h-3" />
              </div>

              <div className="text-sm text-gray-600">
                {generationProgress < 25 && "Collecting data..."}
                {generationProgress >= 25 && generationProgress < 50 && "Analyzing metrics..."}
                {generationProgress >= 50 && generationProgress < 75 && "Generating visualizations..."}
                {generationProgress >= 75 && generationProgress < 100 && "Finalizing report..."}
                {generationProgress === 100 && "Report generated successfully!"}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Report Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Configure your report settings and generation options
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    value={newReport.name}
                    onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter report name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select 
                    value={newReport.type} 
                    onValueChange={(value: ReportType) => setNewReport(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter report description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select 
                    value={newReport.format} 
                    onValueChange={(value: ReportFormat) => setNewReport(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_FORMATS.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newReport.schedule.enabled}
                      onCheckedChange={(enabled) => 
                        setNewReport(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, enabled } 
                        }))
                      }
                    />
                    <span className="text-sm">Enable scheduling</span>
                  </div>
                </div>
              </div>

              {newReport.schedule.enabled && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select 
                      value={newReport.schedule.frequency} 
                      onValueChange={(value: any) => 
                        setNewReport(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, frequency: value } 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newReport.schedule.time}
                      onChange={(e) => 
                        setNewReport(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, time: e.target.value } 
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={newReport.schedule.timezone} 
                      onValueChange={(value) => 
                        setNewReport(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, timezone: value } 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  handleGenerateReport(newReport);
                  setShowCreateDialog(false);
                }}
              >
                Create Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};