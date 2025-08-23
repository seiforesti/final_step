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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  cn 
} from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Download, FileText, Filter, MoreHorizontal, Plus, RefreshCw, Settings, Share, Upload, Clock, AlertTriangle, CheckCircle, XCircle, Eye, Edit3, Trash2, Copy, Search, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Save, Send, Users, Mail, Printer, ExternalLink, Zap, Target, Layers, Activity, Database, Archive, Globe, Shield, Award, Bookmark, Info, HelpCircle, ChevronDown, ChevronRight, Maximize2, Minimize2, RotateCcw, PlayCircle, StopCircle, PauseCircle, Palette, Layout, Grid3X3, List, MapPin, Tag, Link, Star, Heart, MessageSquare, Bell, Lock, Unlock, Key, UserCheck, UserX, Briefcase, Building, Home, Folder, FolderOpen, File, FileType, Image, Video, Music, Code, Terminal, Cpu, HardDrive, Wifi, WifiOff, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Import types and services
import { 
  QualityReport,
  QualityReportTemplate,
  QualityScheduleConfig,
  CreateQualityReportRequest,
  QualityReportGenerationConfig,
  QualityDashboard,
  QualityIssue,
  QualityTrend,
  QualityAssessmentResult,
  QualityMetrics,
  QualityWidgetData,
  QualityExportFormat,
  QualityNotificationConfig,
  ReportSection,
  ReportVisualization,
  ReportFilter,
  ReportCustomization,
  TimePeriod,
  CatalogApiResponse
} from '../../types';

import { catalogQualityService } from '../../services';
import { QUALITY_ENDPOINTS, QUALITY_RULE_TYPES, JOB_STATUSES } from '../../constants';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface QualityReportGeneratorProps {
  className?: string;
  onReportGenerated?: (report: QualityReport) => void;
  onError?: (error: Error) => void;
  defaultAssetIds?: string[];
  embedded?: boolean;
}

interface ReportTemplateConfig {
  id: string;
  name: string;
  description: string;
  type: 'STANDARD' | 'EXECUTIVE' | 'DETAILED' | 'COMPLIANCE' | 'CUSTOM';
  sections: ReportSection[];
  visualizations: ReportVisualization[];
  defaultFilters: ReportFilter[];
  customization: ReportCustomization;
  metadata: {
    category: string;
    tags: string[];
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface ReportGenerationRequest {
  templateId?: string;
  name: string;
  description?: string;
  assetIds: string[];
  timePeriod: TimePeriod;
  filters: ReportFilter[];
  sections: string[];
  visualizations: ReportVisualization[];
  format: QualityExportFormat[];
  schedule?: QualityScheduleConfig;
  notifications: QualityNotificationConfig[];
  customization: ReportCustomization;
  metadata: Record<string, any>;
}

interface ReportPreviewData {
  reportId: string;
  metadata: {
    title: string;
    subtitle: string;
    generatedAt: Date;
    timePeriod: TimePeriod;
    totalAssets: number;
    assessmentCount: number;
  };
  summary: {
    overallScore: number;
    totalIssues: number;
    criticalIssues: number;
    resolvedIssues: number;
    trendDirection: 'UP' | 'DOWN' | 'STABLE';
    improvementPercentage: number;
  };
  sections: {
    executive: boolean;
    detailed: boolean;
    trends: boolean;
    recommendations: boolean;
    appendix: boolean;
  };
  visualizations: Array<{
    type: string;
    title: string;
    data: any;
    config: any;
  }>;
}

interface ExportProgress {
  stage: string;
  percentage: number;
  message: string;
  estimatedTime: number;
}

interface ScheduleDialogState {
  open: boolean;
  reportId?: string;
  schedule: QualityScheduleConfig;
}

interface ShareDialogState {
  open: boolean;
  reportId?: string;
  recipients: string[];
  message: string;
}

interface NotificationConfig {
  type: 'EMAIL' | 'WEBHOOK' | 'SLACK';
  recipients: string[];
  events: string[];
  threshold?: number;
  template?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QualityReportGenerator: React.FC<QualityReportGeneratorProps> = ({
  className,
  onReportGenerated,
  onError,
  defaultAssetIds = [],
  embedded = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<string>('generator');
  const [selectedAssets, setSelectedAssets] = useState<string[]>(defaultAssetIds);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    timezone: 'UTC'
  });
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'executive',
    'detailed',
    'trends'
  ]);
  const [exportFormats, setExportFormats] = useState<QualityExportFormat[]>(['PDF']);
  const [scheduleConfig, setScheduleConfig] = useState<QualityScheduleConfig | null>(null);
  const [notifications, setNotifications] = useState<QualityNotificationConfig[]>([]);
  const [customization, setCustomization] = useState<ReportCustomization>({
    theme: 'corporate',
    includeCharts: true,
    includeTables: true,
    includeRecommendations: true,
    detailLevel: 'STANDARD',
    language: 'en'
  });
  const [reportFilters, setReportFilters] = useState<ReportFilter[]>([]);
  const [previewData, setPreviewData] = useState<ReportPreviewData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<ExportProgress | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);
  const [scheduleDialogState, setScheduleDialogState] = useState<ScheduleDialogState>({
    open: false,
    schedule: {
      type: 'RECURRING',
      cronExpression: '0 9 * * 1',
      enabled: true,
      timezone: 'UTC'
    }
  });
  const [shareDialogState, setShareDialogState] = useState<ShareDialogState>({
    open: false,
    recipients: [],
    message: ''
  });
  const [showPreviewDialog, setShowPreviewDialog] = useState<boolean>(false);
  const [showCustomizationSheet, setShowCustomizationSheet] = useState<boolean>(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({ field: 'name', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<{
    status: string[];
    type: string[];
    priority: string[];
  }>({
    status: [],
    type: [],
    priority: []
  });
  const [newNotification, setNewNotification] = useState<NotificationConfig>({
    type: 'EMAIL',
    recipients: [],
    events: ['COMPLETED', 'FAILED']
  });

  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // API QUERIES & MUTATIONS
  // ============================================================================

  // Fetch report templates
  const { 
    data: templates = [], 
    isLoading: templatesLoading 
  } = useQuery({
    queryKey: ['quality-report-templates'],
    queryFn: async () => {
      const response = await catalogQualityService.getQualityReportTemplates();
      return response.data || [];
    }
  });

  // Fetch existing reports
  const { 
    data: existingReports = [], 
    isLoading: reportsLoading,
    refetch: refetchReports
  } = useQuery({
    queryKey: ['quality-reports', filterConfig, searchQuery],
    queryFn: async () => {
      const response = await catalogQualityService.getQualityReports();
      return response.data || [];
    }
  });

  // Fetch quality dashboard data for context
  const { 
    data: dashboardData,
    isLoading: dashboardLoading 
  } = useQuery({
    queryKey: ['quality-dashboard'],
    queryFn: async () => {
      const response = await catalogQualityService.getQualityDashboard();
      return response.data;
    }
  });

  // Fetch available assets for selection
  const { 
    data: availableAssets = [],
    isLoading: assetsLoading 
  } = useQuery({
    queryKey: ['catalog-assets'],
    queryFn: async () => {
      // This would typically come from a catalog service
      return [
        { id: 'asset-1', name: 'Customer Database', type: 'DATABASE' },
        { id: 'asset-2', name: 'Sales Data Lake', type: 'LAKE' },
        { id: 'asset-3', name: 'Product Catalog', type: 'TABLE' },
        { id: 'asset-4', name: 'User Events Stream', type: 'STREAM' }
      ];
    }
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (request: ReportGenerationRequest) => {
      const response = await catalogQualityService.generateQualityReport(
        request.templateId || 'default',
        request.format
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Report generation started successfully');
      if (onReportGenerated && data) {
        // onReportGenerated(data);
      }
      refetchReports();
    },
    onError: (error) => {
      toast.error('Failed to generate report');
      if (onError) {
        onError(error as Error);
      }
    }
  });

  // Export report mutation
  const exportReportMutation = useMutation({
    mutationFn: async (params: { reportId: string; format: QualityExportFormat }) => {
      const response = await catalogQualityService.exportQualityReport(
        params.reportId,
        params.format
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Report export ready for download');
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: () => {
      toast.error('Failed to export report');
    }
  });

  // Share report mutation
  const shareReportMutation = useMutation({
    mutationFn: async (params: { 
      reportId: string; 
      recipients: string[]; 
      message?: string 
    }) => {
      const response = await catalogQualityService.shareQualityReport(
        params.reportId,
        params.recipients,
        params.message
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report shared successfully');
      setShareDialogState(prev => ({ ...prev, open: false }));
    },
    onError: () => {
      toast.error('Failed to share report');
    }
  });

  // Schedule report mutation
  const scheduleReportMutation = useMutation({
    mutationFn: async (params: { 
      reportId: string; 
      schedule: QualityScheduleConfig 
    }) => {
      const response = await catalogQualityService.scheduleQualityReport(
        params.reportId,
        params.schedule
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report scheduled successfully');
      setScheduleDialogState(prev => ({ ...prev, open: false }));
    },
    onError: () => {
      toast.error('Failed to schedule report');
    }
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredReports = useMemo(() => {
    return existingReports.filter(report => {
      // Search filter
      if (searchQuery && !report.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filterConfig.status.length > 0 && !filterConfig.status.includes(report.status)) {
        return false;
      }

      // Type filter
      if (filterConfig.type.length > 0 && !filterConfig.type.includes(report.type)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const field = sortConfig.field as keyof QualityReport;
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [existingReports, searchQuery, filterConfig, sortConfig]);

  const canGenerateReport = useMemo(() => {
    return selectedAssets.length > 0 && reportName.trim() !== '';
  }, [selectedAssets, reportName]);

  const estimatedGenerationTime = useMemo(() => {
    const baseTime = 30; // 30 seconds base
    const assetMultiplier = selectedAssets.length * 5; // 5 seconds per asset
    const sectionMultiplier = selectedSections.length * 10; // 10 seconds per section
    
    return Math.max(baseTime + assetMultiplier + sectionMultiplier, 60); // minimum 1 minute
  }, [selectedAssets, selectedSections]);

  const selectedTemplateData = useMemo(() => {
    return templates.find(t => t.id === selectedTemplate);
  }, [templates, selectedTemplate]);

  // ============================================================================
  // EFFECT HOOKS
  // ============================================================================

  useEffect(() => {
    if (defaultAssetIds.length > 0) {
      setSelectedAssets(defaultAssetIds);
    }
  }, [defaultAssetIds]);

  useEffect(() => {
    // Auto-generate report name based on selected assets and current date
    if (selectedAssets.length > 0 && !reportName) {
      const assetText = selectedAssets.length === 1 ? '1 Asset' : `${selectedAssets.length} Assets`;
      const dateText = format(new Date(), 'yyyy-MM-dd');
      setReportName(`Quality Report - ${assetText} - ${dateText}`);
    }
  }, [selectedAssets, reportName]);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleGenerateReport = useCallback(async () => {
    if (!canGenerateReport) return;

    setIsGenerating(true);
    setGenerationProgress({
      stage: 'Initializing',
      percentage: 0,
      message: 'Preparing report generation...',
      estimatedTime: estimatedGenerationTime
    });

    try {
      // Simulate progress updates
      const stages = [
        { stage: 'Collecting Data', percentage: 20, message: 'Gathering quality data...' },
        { stage: 'Analyzing Quality', percentage: 40, message: 'Running quality assessments...' },
        { stage: 'Generating Visualizations', percentage: 60, message: 'Creating charts and graphs...' },
        { stage: 'Formatting Report', percentage: 80, message: 'Applying formatting and layout...' },
        { stage: 'Finalizing', percentage: 95, message: 'Completing report generation...' }
      ];

      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (!prev) return null;
          const nextStage = stages.find(s => s.percentage > prev.percentage);
          return nextStage || prev;
        });
      }, estimatedGenerationTime * 1000 / stages.length);

      intervalRef.current = progressInterval;

      const request: ReportGenerationRequest = {
        templateId: selectedTemplate || undefined,
        name: reportName,
        description: reportDescription,
        assetIds: selectedAssets,
        timePeriod,
        filters: reportFilters,
        sections: selectedSections,
        visualizations: [],
        format: exportFormats,
        schedule: scheduleConfig || undefined,
        notifications,
        customization,
        metadata: {
          generatedBy: 'user', // This would come from auth context
          generatedAt: new Date(),
          version: '1.0'
        }
      };

      await generateReportMutation.mutateAsync(request);

      setGenerationProgress({
        stage: 'Complete',
        percentage: 100,
        message: 'Report generated successfully!',
        estimatedTime: 0
      });

      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(null);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }, 2000);

    } catch (error) {
      console.error('Report generation failed:', error);
      setIsGenerating(false);
      setGenerationProgress(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [
    canGenerateReport, 
    reportName, 
    reportDescription,
    selectedAssets,
    timePeriod,
    reportFilters,
    selectedSections,
    exportFormats,
    scheduleConfig,
    notifications,
    customization,
    selectedTemplate,
    estimatedGenerationTime,
    generateReportMutation
  ]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Auto-populate based on template
      setSelectedSections(template.template?.sections || selectedSections);
      setCustomization(prev => ({
        ...prev,
        ...(template.template?.customization || {})
      }));
    }
    
    setShowTemplateDialog(false);
  }, [templates, selectedSections]);

  const handleExportReport = useCallback(async (
    reportId: string, 
    format: QualityExportFormat
  ) => {
    try {
      await exportReportMutation.mutateAsync({ reportId, format });
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportReportMutation]);

  const handleShareReport = useCallback(async () => {
    if (!shareDialogState.reportId || shareDialogState.recipients.length === 0) return;
    
    try {
      await shareReportMutation.mutateAsync({
        reportId: shareDialogState.reportId,
        recipients: shareDialogState.recipients,
        message: shareDialogState.message
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [shareReportMutation, shareDialogState]);

  const handleScheduleReport = useCallback(async () => {
    if (!scheduleDialogState.reportId) return;
    
    try {
      await scheduleReportMutation.mutateAsync({
        reportId: scheduleDialogState.reportId,
        schedule: scheduleDialogState.schedule
      });
    } catch (error) {
      console.error('Schedule failed:', error);
    }
  }, [scheduleReportMutation, scheduleDialogState]);

  const handleSectionToggle = useCallback((section: string) => {
    setSelectedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const handleFormatToggle = useCallback((format: QualityExportFormat) => {
    setExportFormats(prev => 
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  }, []);

  const handleAssetToggle = useCallback((assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  }, []);

  const handlePreviewReport = useCallback(async () => {
    if (!canGenerateReport) return;

    // Generate preview data
    const preview: ReportPreviewData = {
      reportId: 'preview-' + Date.now(),
      metadata: {
        title: reportName,
        subtitle: reportDescription || '',
        generatedAt: new Date(),
        timePeriod,
        totalAssets: selectedAssets.length,
        assessmentCount: 42 // Mock data
      },
      summary: {
        overallScore: 85.7,
        totalIssues: 23,
        criticalIssues: 3,
        resolvedIssues: 19,
        trendDirection: 'UP',
        improvementPercentage: 12.5
      },
      sections: {
        executive: selectedSections.includes('executive'),
        detailed: selectedSections.includes('detailed'),
        trends: selectedSections.includes('trends'),
        recommendations: selectedSections.includes('recommendations'),
        appendix: selectedSections.includes('appendix')
      },
      visualizations: [
        {
          type: 'score-trend',
          title: 'Quality Score Trend',
          data: [],
          config: {}
        },
        {
          type: 'issue-distribution',
          title: 'Issue Distribution by Type',
          data: [],
          config: {}
        }
      ]
    };

    setPreviewData(preview);
    setShowPreviewDialog(true);
  }, [canGenerateReport, reportName, reportDescription, timePeriod, selectedAssets, selectedSections]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const handleAddNotification = useCallback(() => {
    if (newNotification.recipients.length === 0) return;
    
    setNotifications(prev => [...prev, { ...newNotification }]);
    setNewNotification({
      type: 'EMAIL',
      recipients: [],
      events: ['COMPLETED', 'FAILED']
    });
  }, [newNotification]);

  const handleRemoveNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderAssetSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Select Assets
        </CardTitle>
        <CardDescription>
          Choose the data assets to include in the quality report
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assetsLoading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading assets...
          </div>
        ) : (
          <div className="space-y-2">
            {availableAssets.map((asset) => (
              <div key={asset.id} className="flex items-center space-x-2">
                <Checkbox
                  id={asset.id}
                  checked={selectedAssets.includes(asset.id)}
                  onCheckedChange={() => handleAssetToggle(asset.id)}
                />
                <Label htmlFor={asset.id} className="flex-1 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>{asset.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {asset.type}
                  </Badge>
                </Label>
              </div>
            ))}
            {selectedAssets.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  {selectedAssets.length} asset(s) selected for quality reporting
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderReportTemplates = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="cursor-pointer border-dashed border-2 hover:border-blue-500 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="font-medium">Custom Template</h3>
          <p className="text-sm text-muted-foreground">Start from scratch</p>
        </CardContent>
      </Card>
      
      {templates.map((template) => (
        <Card 
          key={template.id} 
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedTemplate === template.id && "ring-2 ring-blue-500"
          )}
          onClick={() => handleTemplateSelect(template.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
              <Badge variant={template.type === 'STANDARD' ? 'default' : 'secondary'}>
                {template.type}
              </Badge>
            </div>
            <CardDescription className="text-xs line-clamp-2">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{template.template?.sections?.length || 0} sections</span>
              <span>Updated {format(new Date(template.template?.updatedAt || Date.now()), 'MMM dd')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderReportConfiguration = () => (
    <div className="space-y-6">
      {/* Asset Selection */}
      {renderAssetSelection()}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name..."
              />
            </div>
            <div>
              <Label htmlFor="template">Template</Label>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowTemplateDialog(true)}
              >
                {selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name : 'Select template...'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Enter report description..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Time Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(timePeriod.startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={timePeriod.startDate}
                    onSelect={(date) => date && setTimePeriod(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(timePeriod.endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={timePeriod.endDate}
                    onSelect={(date) => date && setTimePeriod(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Report Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'executive', label: 'Executive Summary', description: 'High-level overview and key insights' },
              { id: 'detailed', label: 'Detailed Analysis', description: 'Comprehensive quality analysis' },
              { id: 'trends', label: 'Trend Analysis', description: 'Historical trends and patterns' },
              { id: 'recommendations', label: 'Recommendations', description: 'AI-powered improvement suggestions' },
              { id: 'appendix', label: 'Technical Appendix', description: 'Detailed technical information' },
              { id: 'compliance', label: 'Compliance Report', description: 'Regulatory compliance status' }
            ].map((section) => (
              <div key={section.id} className="flex items-start space-x-3">
                <Checkbox
                  id={section.id}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => handleSectionToggle(section.id)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor={section.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {section.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {(['PDF', 'EXCEL', 'CSV'] as QualityExportFormat[]).map((format) => (
              <div key={format} className="flex items-center space-x-2">
                <Checkbox
                  id={format}
                  checked={exportFormats.includes(format)}
                  onCheckedChange={() => handleFormatToggle(format)}
                />
                <Label htmlFor={format} className="text-sm font-medium">
                  {format}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Include Recommendations</Label>
              <p className="text-xs text-muted-foreground">AI-powered improvement suggestions</p>
            </div>
            <Switch
              checked={customization.includeRecommendations}
              onCheckedChange={(checked) => 
                setCustomization(prev => ({ ...prev, includeRecommendations: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Include Charts</Label>
              <p className="text-xs text-muted-foreground">Visual charts and graphs</p>
            </div>
            <Switch
              checked={customization.includeCharts}
              onCheckedChange={(checked) => 
                setCustomization(prev => ({ ...prev, includeCharts: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Include Data Tables</Label>
              <p className="text-xs text-muted-foreground">Detailed data tables</p>
            </div>
            <Switch
              checked={customization.includeTables}
              onCheckedChange={(checked) => 
                setCustomization(prev => ({ ...prev, includeTables: checked }))
              }
            />
          </div>
          <div>
            <Label>Detail Level</Label>
            <Select
              value={customization.detailLevel}
              onValueChange={(value) => 
                setCustomization(prev => ({ 
                  ...prev, 
                  detailLevel: value as 'SUMMARY' | 'STANDARD' | 'DETAILED' 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUMMARY">Summary</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="DETAILED">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotificationsDialog(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Configure Notifications ({notifications.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomizationSheet(true)}
            >
              <Palette className="h-4 w-4 mr-2" />
              Customize Theme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExistingReports = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetchReports()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Reports</CardTitle>
          <CardDescription>
            Manage and access your quality reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading reports...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reports found</p>
              <Button className="mt-4" onClick={() => setActiveTab('generator')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Report
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          {report.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            report.status === 'COMPLETED' ? 'default' :
                            report.status === 'FAILED' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>
                        {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {report.metadata?.assetCount || 0} assets
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleExportReport(report.id, 'PDF')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              ArrowDownTrayIcon PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setShareDialogState({
                                open: true,
                                reportId: report.id,
                                recipients: [],
                                message: ''
                              })}
                            >
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setScheduleDialogState({
                                open: true,
                                reportId: report.id,
                                schedule: {
                                  type: 'RECURRING',
                                  cronExpression: '0 9 * * 1',
                                  enabled: true,
                                  timezone: 'UTC'
                                }
                              })}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderGenerationProgress = () => (
    <AnimatePresence>
      {isGenerating && generationProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Generating Report
              </CardTitle>
              <CardDescription>
                This may take a few minutes depending on the report size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{generationProgress.stage}</span>
                  <span>{generationProgress.percentage}%</span>
                </div>
                <Progress value={generationProgress.percentage} className="h-2" />
              </div>
              <div className="text-sm text-muted-foreground">
                {generationProgress.message}
              </div>
              {generationProgress.estimatedTime > 0 && (
                <div className="text-xs text-muted-foreground">
                  Estimated time remaining: {Math.ceil(generationProgress.estimatedTime / 60)} minutes
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
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
              <h1 className="text-3xl font-bold tracking-tight">Quality Report Generator</h1>
              <p className="text-muted-foreground">
                Generate comprehensive data quality reports with advanced analytics and insights
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePreviewReport} disabled={!canGenerateReport}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleGenerateReport} 
                disabled={!canGenerateReport || isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Report Generator</TabsTrigger>
            <TabsTrigger value="reports">Existing Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            {renderReportConfiguration()}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {renderExistingReports()}
          </TabsContent>
        </Tabs>

        {/* Dialogs and Modals */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Report Template</DialogTitle>
              <DialogDescription>
                Choose a pre-configured template to get started quickly
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading templates...</span>
                </div>
              ) : (
                renderReportTemplates()
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Report Preview</DialogTitle>
              <DialogDescription>
                Preview of your quality report configuration
              </DialogDescription>
            </DialogHeader>
            {previewData && (
              <div className="py-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{previewData.metadata.title}</CardTitle>
                    <CardDescription>{previewData.metadata.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {previewData.summary.overallScore}%
                        </div>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{previewData.summary.totalIssues}</div>
                        <p className="text-sm text-muted-foreground">Total Issues</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {previewData.summary.criticalIssues}
                        </div>
                        <p className="text-sm text-muted-foreground">Critical Issues</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {previewData.metadata.totalAssets}
                        </div>
                        <p className="text-sm text-muted-foreground">Assets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={shareDialogState.open} onOpenChange={(open) => setShareDialogState(prev => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Report</DialogTitle>
              <DialogDescription>
                Share this quality report with team members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Recipients (Email addresses)</Label>
                <Textarea
                  placeholder="Enter email addresses separated by commas..."
                  value={shareDialogState.recipients.join(', ')}
                  onChange={(e) => setShareDialogState(prev => ({
                    ...prev,
                    recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                  }))}
                />
              </div>
              <div>
                <Label>Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personal message..."
                  value={shareDialogState.message}
                  onChange={(e) => setShareDialogState(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShareDialogState(prev => ({ ...prev, open: false }))}>
                  Cancel
                </Button>
                <Button onClick={handleShareReport} disabled={shareDialogState.recipients.length === 0}>
                  <Send className="h-4 w-4 mr-2" />
                  Share Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogState.open} onOpenChange={(open) => setScheduleDialogState(prev => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Report</DialogTitle>
              <DialogDescription>
                Set up automatic report generation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Schedule Type</Label>
                <Select
                  value={scheduleDialogState.schedule.type}
                  onValueChange={(value) => setScheduleDialogState(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, type: value as 'ONCE' | 'RECURRING' }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONCE">One-time</SelectItem>
                    <SelectItem value="RECURRING">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {scheduleDialogState.schedule.type === 'RECURRING' && (
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={scheduleDialogState.schedule.cronExpression}
                    onValueChange={(value) => setScheduleDialogState(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, cronExpression: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0 9 * * 1">Weekly (Mondays at 9 AM)</SelectItem>
                      <SelectItem value="0 9 1 * *">Monthly (1st at 9 AM)</SelectItem>
                      <SelectItem value="0 9 * * *">Daily (9 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={scheduleDialogState.schedule.enabled}
                  onCheckedChange={(checked) => setScheduleDialogState(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, enabled: checked }
                  }))}
                />
                <Label>Enable schedule</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setScheduleDialogState(prev => ({ ...prev, open: false }))}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleReport}>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications Dialog */}
        <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Notifications</DialogTitle>
              <DialogDescription>
                Set up notifications for report generation events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Existing Notifications */}
              {notifications.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Notifications</Label>
                  {notifications.map((notification, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{notification.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.recipients.join(', ')} • {notification.events.join(', ')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveNotification(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Separator />
                </div>
              )}
              
              {/* Add New Notification */}
              <div className="space-y-3">
                <Label>Add New Notification</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value) => setNewNotification(prev => ({ 
                        ...prev, 
                        type: value as 'EMAIL' | 'WEBHOOK' | 'SLACK' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="WEBHOOK">Webhook</SelectItem>
                        <SelectItem value="SLACK">Slack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Events</Label>
                    <div className="flex space-x-2">
                      {['COMPLETED', 'FAILED', 'STARTED'].map((event) => (
                        <div key={event} className="flex items-center space-x-1">
                          <Checkbox
                            id={event}
                            checked={newNotification.events.includes(event)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewNotification(prev => ({
                                  ...prev,
                                  events: [...prev.events, event]
                                }));
                              } else {
                                setNewNotification(prev => ({
                                  ...prev,
                                  events: prev.events.filter(e => e !== event)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={event} className="text-xs">{event}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Recipients</Label>
                  <Textarea
                    placeholder="Enter recipients (emails, webhooks, or channels)..."
                    value={newNotification.recipients.join(', ')}
                    onChange={(e) => setNewNotification(prev => ({
                      ...prev,
                      recipients: e.target.value.split(',').map(r => r.trim()).filter(Boolean)
                    }))}
                  />
                </div>
                <Button onClick={handleAddNotification} disabled={newNotification.recipients.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Notification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generation Progress Overlay */}
        {renderGenerationProgress()}
      </div>
    </TooltipProvider>
  );
};

export default QualityReportGenerator;
