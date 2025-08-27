// ============================================================================
// DATA VALIDATION FRAMEWORK - ADVANCED CATALOG QUALITY MANAGEMENT
// ============================================================================
// Enterprise-grade data validation framework with AI-powered validation rules
// Integrates with: catalog_quality_service.py, data_profiling_service.py
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Progress,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Switch,
  Slider,
  Calendar as UICalendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Checkbox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui";
import { 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Plus,
  Target,
  TrendingUp,
  Clock,
  Pause,
  MoreHorizontal,
  Edit,
  Copy,
  Play,
  Trash2
} from 'lucide-react';

// Additional lucide-react icons for advanced functionality
import {
  Activity,
  BarChart3,
  Brain,
  Database,
  FileText,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  History,
  Layers,
  Network,
  Server,
  Settings,
  Shield as Shield2,
  Target as Target2,
  TrendingUp as TrendingUp2,
  TrendingDown,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle as XCircle2,
  Info,
  AlertTriangle as Warning,
  HelpCircle,
  Lightbulb,
  Star,
  Heart,
  BookOpen,
  Search,
  Filter,
  ArrowUpDown as Sort,
  ArrowDownUp as SortAlt,
  Eye,
  EyeOff,
  Download,
  Upload,
  Save,
  RefreshCw,
  RotateCcw,
  Play as Play2,
  Pause as Pause2,
  Square,
  SkipForward,
  SkipBack,
  RotateCw,
  Timer,
  Calendar as Calendar2,
  Clock as Clock2,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  Users,
  User,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  Settings as UserSettings,
  Search as UserSearch,
  UserX as UserX2,
  Building2,
  Home,
  MapPin,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Send,
  Inbox,
  Archive,
  Trash,
  Folder,
  FolderOpen,
  File,
  FileText as FileText2,
  FilePlus,
  FileMinus,
  FileX,
  FileCheck,
  FileSearch,
  FileEdit,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive
} from 'lucide-react';

// Additional UI imports
import { 
  useQueryClient 
} from '@tanstack/react-query';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area as RechartsArea
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Service and Hook imports
import { 
  useCatalogQuality,
  useCatalogProfiling,
  useCatalogAssets,
  useCatalogAI
} from '../../hooks';
import {
  catalogQualityService,
  dataProfilingService
} from '../../services';
import {
  QualityDashboard,
  QualityAssessmentJob,
  QualityAssessmentResult,
  DataQualityRule,
  QualityIssue,
  QualityTrend,
  QualityRecommendation,
  QualityMonitoring,
  QualityReport,
  CreateQualityAssessmentRequest,
  CreateQualityRuleRequest,
  CreateQualityReportRequest,
  QualityIssueUpdateRequest,
  QualityFilters,
  DashboardLayoutConfig
} from '../../../types';

// ============================================================================
// COMPONENT EXPORT
// ============================================================================

// ============================================================================
// MAIN COMPONENT IMPLEMENTATION
// ============================================================================

interface DataValidationFrameworkProps {
  assetId?: string;
  mode?: 'dashboard' | 'assessment' | 'monitoring' | 'rules' | 'reports';
  enableRealTimeUpdates?: boolean;
  onValidationComplete?: (results: QualityAssessmentResult[]) => void;
  onRuleCreated?: (rule: DataQualityRule) => void;
  className?: string;
}

const DataValidationFramework: React.FC<DataValidationFrameworkProps> = ({
  assetId,
  mode = 'dashboard',
  enableRealTimeUpdates = true,
  onValidationComplete,
  onRuleCreated,
  className = ''
}) => {
  // ============================================================================
  // HOOKS & STATE MANAGEMENT
  // ============================================================================

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(mode);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(assetId ? [assetId] : []);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(enableRealTimeUpdates);
  const [filters, setFilters] = useState<QualityFilters>({});
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayoutConfig>({
    columns: 3,
    spacing: 16,
    responsive: true
  });

  // State for different views
  const [ruleCreationOpen, setRuleCreationOpen] = useState(false);
  const [assessmentConfigOpen, setAssessmentConfigOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<QualityIssue | null>(null);
  const [reportGenerationOpen, setReportGenerationOpen] = useState(false);
  const [monitoringConfigOpen, setMonitoringConfigOpen] = useState(false);

  // Performance optimization with refs
  const chartRefs = useRef<{ [key: string]: any }>({});
  const virtualListRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // ============================================================================
  // SERVICE INTEGRATIONS
  // ============================================================================

  // Quality service integration
  const {
    qualityDashboard,
    qualityAssessments,
    qualityRules,
    qualityIssues,
    qualityTrends,
    qualityReports,
    qualityMonitoring,
    isLoading: qualityLoading,
    error: qualityError,
    createQualityRule,
    runQualityAssessment,
    updateQualityIssue,
    generateQualityReport,
    createQualityMonitoring
  } = useCatalogQuality({
    enableRealTimeUpdates: realTimeMode,
    autoRefreshInterval: 30000,
    onAssessmentComplete: onValidationComplete,
    onRuleCreated
  });

  // Data profiling integration
  const {
    profilingResults,
    statisticalMetrics,
    dataDistributions,
    qualityProfiles,
    isLoading: profilingLoading,
    executeProfilingJob,
    getStatisticalMetrics,
    getDataDistribution
  } = useCatalogProfiling({
    enableRealTimeUpdates: realTimeMode,
    autoRefreshInterval: 60000
  });

  // Asset management integration
  const {
    assets,
    selectedAsset,
    getAsset,
    searchAssets
  } = useCatalogAssets();

  // AI recommendations integration
  const {
    recommendations,
    getQualityRecommendations,
    generateRuleRecommendations
  } = useCatalogAI();

  // ============================================================================
  // COMPUTED VALUES & MEMOIZED DATA
  // ============================================================================

  const dashboardMetrics = useMemo(() => {
    if (!qualityDashboard) return null;

    return {
      overallScore: qualityDashboard.overallQualityScore,
      totalAssets: assets?.length || 0,
      activeRules: qualityRules?.filter(r => r.enabled)?.length || 0,
      openIssues: qualityIssues?.filter(i => i.status === 'OPEN')?.length || 0,
      criticalIssues: qualityIssues?.filter(i => i.severity === 'CRITICAL')?.length || 0,
      trend: qualityDashboard.qualityTrend?.direction || 'STABLE'
    };
  }, [qualityDashboard, assets, qualityRules, qualityIssues]);

  const filteredAssessments = useMemo(() => {
    if (!qualityAssessments) return [];
    
    return qualityAssessments.filter(assessment => {
      if (filters.status && assessment.status !== filters.status) return false;
      if (filters.assetId && !assessment.assets.includes(filters.assetId)) return false;
      if (filters.severity && assessment.results.some(r => r.issues.some(i => i.severity === filters.severity))) return true;
      return true;
    });
  }, [qualityAssessments, filters]);

  const ruleCategories = useMemo(() => {
    if (!qualityRules) return [];
    
    const categories = qualityRules.reduce((acc, rule) => {
      const category = rule.dimension || 'Other';
      if (!acc[category]) {
        acc[category] = { name: category, rules: [], count: 0 };
      }
      acc[category].rules.push(rule);
      acc[category].count++;
      return acc;
    }, {} as Record<string, { name: string; rules: DataQualityRule[]; count: number }>);

    return Object.values(categories);
  }, [qualityRules]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRunValidation = useCallback(async () => {
    if (!selectedAssets.length || !selectedRules.length) {
      toast.error('Please select assets and rules for validation');
      return;
    }

    setValidationInProgress(true);
    try {
      const assessmentRequest: CreateQualityAssessmentRequest = {
        name: `Validation Assessment - ${new Date().toISOString()}`,
        description: 'Automated data validation assessment',
        assetIds: selectedAssets,
        ruleIds: selectedRules,
        configuration: {
          enableTrends: true,
          enableRecommendations: true,
          scoreThreshold: 0.8,
          failureThreshold: 0.2,
          parallelExecution: true
        }
      };

      const assessment = await runQualityAssessment(assessmentRequest);
      toast.success(`Validation assessment ${assessment.id} started successfully`);
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const updatedAssessment = await getQualityAssessment(assessment.id);
          if (updatedAssessment.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setValidationInProgress(false);
            toast.success('Validation assessment completed');
            queryClient.invalidateQueries(['quality-assessments']);
          } else if (updatedAssessment.status === 'FAILED') {
            clearInterval(pollInterval);
            setValidationInProgress(false);
            toast.error('Validation assessment failed');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setValidationInProgress(false);
          toast.error('Error polling assessment status');
        }
      }, 5000);

    } catch (error) {
      setValidationInProgress(false);
      toast.error(`Failed to start validation: ${error.message}`);
    }
  }, [selectedAssets, selectedRules, runQualityAssessment, getQualityAssessment, queryClient]);

  const handleCreateRule = useCallback(async (ruleData: CreateQualityRuleRequest) => {
    try {
      const rule = await createQualityRule(ruleData);
      toast.success(`Quality rule "${rule.name}" created successfully`);
      setRuleCreationOpen(false);
      queryClient.invalidateQueries(['quality-rules']);
      onRuleCreated?.(rule);
    } catch (error) {
      toast.error(`Failed to create rule: ${error.message}`);
    }
  }, [createQualityRule, queryClient, onRuleCreated]);

  const handleIssueUpdate = useCallback(async (issueId: string, updates: QualityIssueUpdateRequest) => {
    try {
      await updateQualityIssue(issueId, updates);
      toast.success('Issue updated successfully');
      queryClient.invalidateQueries(['quality-issues']);
    } catch (error) {
      toast.error(`Failed to update issue: ${error.message}`);
    }
  }, [updateQualityIssue, queryClient]);

  const handleGenerateReport = useCallback(async (reportConfig: CreateQualityReportRequest) => {
    try {
      const report = await generateQualityReport(reportConfig);
      toast.success(`Report "${report.name}" generation started`);
      setReportGenerationOpen(false);
      queryClient.invalidateQueries(['quality-reports']);
    } catch (error) {
      toast.error(`Failed to generate report: ${error.message}`);
    }
  }, [generateQualityReport, queryClient]);

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: query }));
    }, 300);
  }, []);

  // ============================================================================
  // DASHBOARD VIEW COMPONENT
  // ============================================================================

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Quality Score</p>
              <p className="text-2xl font-bold text-green-600">
                {dashboardMetrics?.overallScore?.toFixed(1) || 'N/A'}%
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            {dashboardMetrics?.trend === 'IMPROVING' ? (
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            ) : dashboardMetrics?.trend === 'DECLINING' ? (
              <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
            ) : (
              <ArrowRight className="h-4 w-4 text-gray-600 mr-1" />
            )}
            <span className={cn(
              dashboardMetrics?.trend === 'IMPROVING' ? 'text-green-600' :
              dashboardMetrics?.trend === 'DECLINING' ? 'text-red-600' : 'text-gray-600'
            )}>
              {dashboardMetrics?.trend?.toLowerCase() || 'stable'}
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
              <p className="text-2xl font-bold">{dashboardMetrics?.activeRules || 0}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
              <p className="text-2xl font-bold text-orange-600">{dashboardMetrics?.openIssues || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{dashboardMetrics?.criticalIssues || 0}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Quality Trends Chart */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quality Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={qualityTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="overallScore" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="completeness" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="accuracy" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="consistency" stroke="#ef4444" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments & Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-4">
              {filteredAssessments.slice(0, 5).map(assessment => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{assessment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {assessment.assets.length} assets • {assessment.rules.length} rules
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      assessment.status === 'COMPLETED' ? 'default' :
                      assessment.status === 'RUNNING' ? 'secondary' :
                      assessment.status === 'FAILED' ? 'destructive' : 'outline'
                    }>
                      {assessment.status}
                    </Badge>
                    {assessment.status === 'COMPLETED' && (
                      <span className="text-sm font-medium">
                        {assessment.summary.averageScore?.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Critical Issues</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-4">
              {qualityIssues?.filter(issue => issue.severity === 'CRITICAL').slice(0, 5).map(issue => (
                <div key={issue.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{issue.title}</p>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="destructive" className="text-xs">
                        {issue.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {issue.affectedRecords} records affected
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ============================================================================
  // RULES VIEW COMPONENT
  // ============================================================================

  const RulesView = () => (
    <div className="space-y-6">
      {/* Rules Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Rules</h2>
          <p className="text-muted-foreground">Manage and configure data quality validation rules</p>
        </div>
        <Button onClick={() => setRuleCreationOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Rules Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ruleCategories.map(category => (
          <Card key={category.name} className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center justify-between">
                <span>{category.name}</span>
                <Badge variant="secondary">{category.count}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-2">
                {category.rules.slice(0, 3).map(rule => (
                  <div key={rule.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{rule.name}</span>
                    <Badge variant={rule.enabled ? 'default' : 'outline'} className="text-xs">
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {category.count > 3 && (
                  <p className="text-xs text-muted-foreground">+{category.count - 3} more</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rules</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search rules..."
              className="max-w-sm"
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, dimension: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by dimension" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPLETENESS">Completeness</SelectItem>
                <SelectItem value="ACCURACY">Accuracy</SelectItem>
                <SelectItem value="CONSISTENCY">Consistency</SelectItem>
                <SelectItem value="VALIDITY">Validity</SelectItem>
                <SelectItem value="UNIQUENESS">Uniqueness</SelectItem>
                <SelectItem value="TIMELINESS">Timeliness</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Dimension</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualityRules?.map(rule => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.dimension}</TableCell>
                  <TableCell>{rule.ruleType}</TableCell>
                  <TableCell>
                    <Badge variant={
                      rule.severity === 'CRITICAL' ? 'destructive' :
                      rule.severity === 'HIGH' ? 'default' :
                      rule.severity === 'MEDIUM' ? 'secondary' : 'outline'
                    }>
                      {rule.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={rule.enabled} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Test Rule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // ASSESSMENTS VIEW COMPONENT
  // ============================================================================

  const AssessmentsView = () => (
    <div className="space-y-6">
      {/* Assessments Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Assessments</h2>
          <p className="text-muted-foreground">Monitor and analyze data quality assessments</p>
        </div>
        <Button onClick={() => setAssessmentConfigOpen(true)}>
          <Play className="h-4 w-4 mr-2" />
          Run Assessment
        </Button>
      </div>

      {/* Assessment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Running</p>
              <p className="text-2xl font-bold">
                {qualityAssessments?.filter(a => a.status === 'RUNNING').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">
                {qualityAssessments?.filter(a => a.status === 'COMPLETED').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">
                {qualityAssessments?.filter(a => a.status === 'FAILED').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">
                {qualityAssessments?.filter(a => a.status === 'PENDING').length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssessments.map(assessment => (
              <div key={assessment.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{assessment.name}</h3>
                      <Badge variant={
                        assessment.status === 'COMPLETED' ? 'default' :
                        assessment.status === 'RUNNING' ? 'secondary' :
                        assessment.status === 'FAILED' ? 'destructive' : 'outline'
                      }>
                        {assessment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {assessment.assets.length} assets • {assessment.rules.length} rules
                    </p>
                    
                    {assessment.status === 'RUNNING' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{assessment.progress?.percentage || 0}%</span>
                        </div>
                        <Progress value={assessment.progress?.percentage || 0} className="h-2" />
                      </div>
                    )}
                    
                    {assessment.status === 'COMPLETED' && assessment.results.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {assessment.summary.averageScore?.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Avg Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {assessment.summary.totalIssues || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Issues</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">
                            {assessment.summary.criticalIssues || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Critical</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {assessment.status === 'RUNNING' && (
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MONITORING VIEW COMPONENT
  // ============================================================================

  const MonitoringView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Monitoring</h2>
          <p className="text-muted-foreground">Real-time monitoring and alerting for data quality</p>
        </div>
        <Button onClick={() => setMonitoringConfigOpen(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Setup Monitor
        </Button>
      </div>

      {/* Monitoring Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Monitors</p>
              <p className="text-2xl font-bold">
                {qualityMonitoring?.filter(m => m.status === 'ACTIVE').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Coverage</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Monitoring Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityMonitoring?.map(monitor => (
              <div key={monitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    monitor.status === 'ACTIVE' ? "bg-green-500 animate-pulse" :
                    monitor.status === 'INACTIVE' ? "bg-gray-400" :
                    monitor.status === 'ERROR' ? "bg-red-500" : "bg-yellow-500"
                  )}></div>
                  <div>
                    <h3 className="font-medium">{monitor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {monitor.assets.length} assets • {monitor.rules.length} rules
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    monitor.status === 'ACTIVE' ? 'default' :
                    monitor.status === 'ERROR' ? 'destructive' : 'secondary'
                  }>
                    {monitor.status}
                  </Badge>
                  <Switch checked={monitor.status === 'ACTIVE'} />
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // REPORTS VIEW COMPONENT
  // ============================================================================

  const ReportsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Reports</h2>
          <p className="text-muted-foreground">Generate and manage data quality reports</p>
        </div>
        <Button onClick={() => setReportGenerationOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold">Executive Summary</h3>
              <p className="text-sm text-muted-foreground">High-level quality overview</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Generate
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold">Trend Analysis</h3>
              <p className="text-sm text-muted-foreground">Quality trends over time</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Generate
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold">Issues Report</h3>
              <p className="text-sm text-muted-foreground">Detailed issue analysis</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Generate
          </Button>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityReports?.map(report => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • Generated {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    report.status === 'COMPLETED' ? 'default' :
                    report.status === 'GENERATING' ? 'secondary' :
                    report.status === 'FAILED' ? 'destructive' : 'outline'
                  }>
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  if (qualityLoading || profilingLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading validation framework...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("data-validation-framework", className)}>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Data Validation Framework</h1>
            <p className="text-muted-foreground mt-1">
              Enterprise-grade data quality management and validation
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={realTimeMode ? 'bg-green-50 border-green-200' : ''}
            >
              <Zap className={cn("h-4 w-4 mr-2", realTimeMode ? "text-green-600" : "")} />
              Real-time {realTimeMode ? 'ON' : 'OFF'}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRuleCreationOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssessmentConfigOpen(true)}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Assessment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReportGenerationOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setMonitoringConfigOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Setup Monitoring
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardView />
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <RulesView />
          </TabsContent>

          <TabsContent value="assessments" className="mt-6">
            <AssessmentsView />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <MonitoringView />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsView />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default DataValidationFramework;