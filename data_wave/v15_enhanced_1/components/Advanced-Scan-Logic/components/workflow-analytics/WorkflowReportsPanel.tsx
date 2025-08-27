"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  Settings,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  Rewind,
  CheckCircle as CheckCircleIcon,
  XCircle,
  AlertTriangle as AlertTriangleIcon,
  Info,
  Workflow,
  GitBranch,
  Database,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Route,
  Layers,
  Package,
  Component,
  Code,
  Terminal,
  Monitor,
  Users,
  User,
  Crown,
  Award,
  Star,
  Bookmark,
  Tag,
  Hash,
  Percent,
  DollarSign,
  Calculator,
  Plus,
  Minus,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Grid,
  List,
  Map,
  Navigation,
  Compass,
  MapPin,
  Globe,
  Wifi,
  Link,
  Unlink,
  Share2,
  Copy,
  Edit,
  Trash2,
  Save,
  File,
  Folder,
  Archive,
  History,
  Bell,
  BellOff,
  MessageSquare,
  Mail,
  Send,
  Phone,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Image,
  Film,
  Music,
  Headphones,
  Radio,
  Tv,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Gamepad2,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Fax,
  Projector,
  Lightbulb,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  Rainbow,
  Sunrise,
  Sunset,
  Wind,
  Thermometer,
  Gauge,
  Ruler,
  Scale,
  Timer as TimerIcon,
  AlarmClock,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Clock as ClockIcon,
  UserCheck,
  Users as UsersIcon,
  Building,
  Globe as GlobeIcon,
  Lock,
  Unlock,
  Key,
  Eye as EyeIcon,
  EyeOff,
  Shield as ShieldIcon,
  AlertCircle,
  CheckSquare,
  Square as SquareIcon,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Star as StarIcon,
  Heart,
  Diamond,
  Zap as ZapIcon,
  Bolt,
  Flash,
  Sparkles,
  Wand2,
  Magic,
  Crystal,
  Gem,
  Crown as CrownIcon,
  Trophy,
  Medal,
  Award as AwardIcon,
  Ribbon,
  Flag,
  Banner,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldOff,
  ShieldPlus,
  ShieldMinus,
  ShieldQuestion,
  ShieldZap,
  ShieldStar,
  ShieldHeart,
  ShieldDollarSign,
  ShieldPercent,
  Printer as PrinterIcon,
  Mail as MailIcon,
  Share as ShareIcon,
  ExternalLink,
  BookOpen,
  Book,
  FileText as FileTextIcon,
  File as FileIcon,
  Folder as FolderIcon,
  Archive as ArchiveIcon,
  Download as DownloadIcon,
  Upload,
  Copy as CopyIcon,
  Scissors,
  Paperclip,
  Link as LinkIcon,
  Unlink as UnlinkIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key as KeyIcon,
  Eye as EyeIcon2,
  EyeOff as EyeOffIcon,
  Shield as ShieldIcon2,
  AlertCircle as AlertCircleIcon,
  CheckSquare as CheckSquareIcon,
  Square as SquareIcon2,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon,
  Star as StarIcon2,
  Heart as HeartIcon,
  Diamond as DiamondIcon,
  Zap as ZapIcon2,
  Bolt as BoltIcon,
  Flash as FlashIcon,
  Sparkles as SparklesIcon,
  Wand2 as Wand2Icon,
  Magic as MagicIcon,
  Crystal as CrystalIcon,
  Gem as GemIcon,
  Crown as CrownIcon2,
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  Award as AwardIcon2,
  Ribbon as RibbonIcon,
  Flag as FlagIcon,
  Banner as BannerIcon
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Chart components for analytics
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Brush
} from 'recharts';

// Import types and hooks
import {
  WorkflowReports,
  WorkflowReport,
  ReportType,
  ReportStatus,
  ReportFormat,
  ReportSchedule,
  ReportTemplate
} from '../../types/workflow.types';

import { useWorkflowReports } from '../../hooks/useWorkflowAnalytics';

interface WorkflowReportsPanelProps {
  workflowId?: string;
  className?: string;
  onReportClick?: (report: WorkflowReport) => void;
  onReportGenerate?: (reportType: ReportType, parameters: any) => void;
  onReportDownload?: (report: WorkflowReport) => void;
  onReportShare?: (report: WorkflowReport) => void;
}

export const WorkflowReportsPanel: React.FC<WorkflowReportsPanelProps> = ({
  workflowId,
  className = '',
  onReportClick,
  onReportGenerate,
  onReportDownload,
  onReportShare
}) => {
  const { reports, isLoading, error } = useWorkflowReports();
  const [selectedType, setSelectedType] = useState<ReportType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('performance');
  const [reportParameters, setReportParameters] = useState<any>({});

  // Filter reports based on selected criteria
  const filteredReports = useMemo(() => {
    if (!reports?.data) return [];

    return reports.data.filter(report => {
      const matchesType = selectedType === 'all' || report.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
      const matchesFormat = selectedFormat === 'all' || report.format === selectedFormat;
      const matchesSearch = searchQuery === '' || 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesStatus && matchesFormat && matchesSearch;
    });
  }, [reports, selectedType, selectedStatus, selectedFormat, searchQuery]);

  // Group reports by type
  const groupedReports = useMemo(() => {
    const groups: Record<string, WorkflowReport[]> = {};
    
    filteredReports.forEach(report => {
      const type = report.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(report);
    });

    return groups;
  }, [filteredReports]);

  // Toggle report expansion
  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  // Get status color
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get format icon
  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <BarChart3 className="h-4 w-4" />;
      case 'csv':
        return <Table className="h-4 w-4" />;
      case 'json':
        return <Code className="h-4 w-4" />;
      case 'xml':
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get report type icon
  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'performance':
        return <Activity className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'compliance':
        return <CheckCircle className="h-4 w-4" />;
      case 'audit':
        return <FileText className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'summary':
        return <FileText className="h-4 w-4" />;
      case 'detailed':
        return <FileText className="h-4 w-4" />;
      case 'executive':
        return <Crown className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Handle report generation
  const handleGenerateReport = () => {
    onReportGenerate?.(selectedReportType, reportParameters);
    setShowGenerateDialog(false);
    setReportParameters({});
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Workflow Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Workflow Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load workflow reports. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Workflow Reports</CardTitle>
            <Badge variant="secondary">{filteredReports.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowGenerateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Generate
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Comprehensive reports and analytics for workflow performance and insights
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ReportType | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ReportStatus | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ReportFormat | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reports List */}
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {Object.entries(groupedReports).map(([type, typeReports]) => (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {getReportTypeIcon(type as ReportType)}
                  {type.charAt(0).toUpperCase() + type.slice(1)} Reports
                  <Badge variant="outline">{typeReports.length}</Badge>
                </div>
                
                <div className="space-y-3">
                  {typeReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          expandedReports.has(report.id) ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          toggleReportExpansion(report.id);
                          onReportClick?.(report);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex items-center gap-2 mt-1">
                                {getFormatIcon(report.format)}
                                <Badge variant="outline" className={getStatusColor(report.status)}>
                                  {report.status}
                                </Badge>
                                <Badge variant="secondary">
                                  {report.format.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {report.description}
                                </p>
                                
                                {expandedReports.has(report.id) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3"
                                  >
                                    {report.metadata && (
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        {Object.entries(report.metadata).map(([key, value]) => (
                                          <div key={key} className="flex justify-between">
                                            <span className="text-muted-foreground">{key}:</span>
                                            <span className="font-medium">{value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {report.schedule && (
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium">Schedule:</h5>
                                        <div className="text-sm text-muted-foreground">
                                          <p>Frequency: {report.schedule.frequency}</p>
                                          <p>Next Run: {new Date(report.schedule.nextRun).toLocaleString()}</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 pt-2">
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onReportDownload?.(report);
                                        }}
                                        disabled={report.status !== 'completed'}
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onReportShare?.(report);
                                        }}
                                      >
                                        <Share2 className="h-4 w-4 mr-1" />
                                        Share
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // View report details
                                        }}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                              <ChevronRight 
                                className={`h-4 w-4 transition-transform ${
                                  expandedReports.has(report.id) ? 'rotate-90' : ''
                                }`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or generate a new report.
            </p>
          </div>
        )}
      </CardContent>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>
              Create a new workflow report with custom parameters and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={selectedReportType} onValueChange={(value) => setSelectedReportType(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="security">Security Report</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="audit">Audit Report</SelectItem>
                  <SelectItem value="analytics">Analytics Report</SelectItem>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="executive">Executive Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-format">Format</Label>
              <Select value={reportParameters.format || 'pdf'} onValueChange={(value) => setReportParameters(prev => ({ ...prev, format: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input
                id="report-title"
                placeholder="Enter report title"
                value={reportParameters.title || ''}
                onChange={(e) => setReportParameters(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Enter report description"
                value={reportParameters.description || ''}
                onChange={(e) => setReportParameters(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkflowReportsPanel;
