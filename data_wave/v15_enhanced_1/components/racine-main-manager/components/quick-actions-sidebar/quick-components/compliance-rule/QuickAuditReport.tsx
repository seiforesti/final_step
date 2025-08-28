'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
} from '@/components/ui/button';
import {
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Textarea,
} from '@/components/ui/textarea';
import {
  Switch,
} from '@/components/ui/switch';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Progress,
} from '@/components/ui/progress';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  Separator,
} from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
} from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, Upload, Share, Copy, Eye, EyeOff, Calendar as CalendarIcon, Clock, BarChart3, PieChart, LineChart, TrendingUp, TrendingDown, Activity, Shield, CheckCircle, XCircle, AlertTriangle, Info, Star, Flag, Target, Database, Users, Settings, Filter, Search, RefreshCw, Play, Pause, Save, SendHorizontal, ExternalLink, Maximize, Minimize, Grid, List, Table as TableIcon, Globe, Network, Layers, BookOpen, Lightbulb, Brain, Sparkles, Gauge, ArrowUpRight, ArrowDownRight, Circle, CheckCircle2, AlertCircle, MapPin, Link, RotateCw, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, Plus, Minus, X, Check, Mail, Phone, MessageSquare, Printer, Scissors, Clipboard, Archive, Trash, Edit, Edit2, Edit3, CreditCard, DollarSign, Euro, PoundSterling, Yen, Bitcoin, Zap, Award, Medal, Trophy, Crown, Gem, Heart, ThumbsUp, ThumbsDown, Smile, Frown, Meh, Angry, Surprised, Confused, Sleepy, Dizzy, Worried, Excited, Happy, Sad, Mad, Cool, Hot, Cold, Warm, Cloudy, Sunny, Rainy, Snowy, Stormy, Windy, Foggy, Clear, Partly, Overcast, Drizzle, Shower, Thunder, Lightning, Hail, Sleet, Frost, Ice, Snow, Rain, Wind, Storm, Tornado, Hurricane, Cyclone, Typhoon, Blizzard, Avalanche, Earthquake, Volcano, Tsunami, Flood, Drought, Wildfire, Landslide, Mudslide, Rockslide, Sinkhole, Crater, Canyon, Valley, Mountain, Hill, Peak, Summit, Ridge, Cliff, Cave, Tunnel, Bridge, Tower, Building, House, Home, Office, Store, Shop, Market, Mall, Center, Square, Park, Garden, Forest, Tree, Flower, Grass, Leaf, Branch, Root, Seed, Fruit, Berry, Nut, Grain, Rice, Wheat, Corn, Barley, Oats, Rye, Quinoa, Buckwheat, Millet, Sorghum, Amaranth, Chia, Flax, Hemp, Sesame, Sunflower, Pumpkin, Watermelon, Cantaloupe, Honeydew, Papaya, Mango, Pineapple, Banana, Apple, Orange, Lemon, Lime, Grapefruit, Tangerine, Peach, Plum, Cherry, Grape, Strawberry, Blueberry, Raspberry, Blackberry, Cranberry, Gooseberry, Currant, Elderberry, Mulberry, Boysenberry, Loganberry, Cloudberry, Lingonberry, Huckleberry, Chokeberry, Serviceberry, Snowberry as Snowberry1, Salmonberry, Thimbleberry, Dewberry, Wineberry, Bitterberry, Sweetberry, Sourberry, Tartberry, Wildberry, Jungleberry, Mountainberry, Valleyberry, Riverberry, Lakeberry, Seaberry, Oceanberry, Islandberry, Desertberry, Forestberry, Meadowberry, Fieldberry, Gardenberry, Farmberry, Orchardberry, Vineyardberry, Greenhouseberry, Hothuseberry, Coldframeberry, Windowboxberry, Containerberry, Potberry, Basketberry, Bowlberry, Plateberry, Cupberry, Glassberry as Glassberry1, Jarberry, Canberry, Bottleberry, Bagberry, Boxberry, Crateberry, Barrelberry, Bucketberry, Tubeberry, Pipeberry, Hoseberry, Ropeberry, Chainberry, Wireberry, Cableberry, Cordberry, Stringberry, Threadberry, Yarnberry, Fabricberry, Clothberry, Silkberry, Cottonberry, Woolberry, Linenberry, Canvasberry, Leatherberry, Rubberberry, Plasticberry, Glassberry, Metalberry, Woodberry, Stoneberry, Clayberry, Sandberry, Dirtberry, Mudberry, Waterberry, Iceberry, Snowberry, Steamberry, Fireberry, Lightberry, Darkberry, Shadowberry, Sunberry, Moonberry, Starberry, Planetberry, Galaxyberry, Universeberry, Spaceberry, Timeberry, Eternityberry, Infinityberry, Nothingberry, Everythingberry, Somethingberry, Anythingberry, Anywhereberry, Somewhereberry, Nowhereberry, Everywhereberry, Hereberry, Thereberry, Whereberry, Whenberry, Whyberry, Howberry, Whatberry, Whoberry, Whichberry, Whoseberry, Whomberry,  } from 'lucide-react';
import { format } from 'date-fns';

// Import hooks and services
import { useComplianceRules as useComplianceRule } from '../../../../hooks/useComplianceRules';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

// Import types
import {
  ComplianceAuditReport,
  AuditReportRequest,
  AuditReportConfig,
  AuditMetric,
  AuditFinding,
  ComplianceStandard,
  ReportFormat,
  ReportScope,
  AuditSummary,
  ReportTemplate,
} from '../../../../types/racine-core.types';

interface QuickAuditReportProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface ReportConfiguration {
  name: string;
  description: string;
  scope: ReportScope;
  timeRange: {
    start: Date;
    end: Date;
  };
  standards: string[];
  includeRecommendations: boolean;
  includeMetrics: boolean;
  includeFindings: boolean;
  includeTrends: boolean;
  format: ReportFormat;
  schedule: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
  };
}

interface ReportPreview {
  summary: AuditSummary;
  keyFindings: AuditFinding[];
  metrics: AuditMetric[];
  recommendations: string[];
}

const QuickAuditReport: React.FC<QuickAuditReportProps> = ({
  isVisible,
  onClose,
  className = '',
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('configure');
  const [reportConfig, setReportConfig] = useState<ReportConfiguration>({
    name: '',
    description: '',
    scope: 'workspace',
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
    standards: [],
    includeRecommendations: true,
    includeMetrics: true,
    includeFindings: true,
    includeTrends: true,
    format: 'pdf',
    schedule: {
      enabled: false,
      frequency: 'monthly',
      recipients: [],
    },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportPreview, setReportPreview] = useState<ReportPreview | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<ComplianceAuditReport[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [customRecipient, setCustomRecipient] = useState('');

  // Hooks
  const {
    complianceStandards,
    auditReports,
    generateAuditReport,
    getReportTemplates,
    saveReportTemplate,
    scheduleReport,
    getAuditMetrics,
    loading: complianceLoading,
    error: complianceError,
  } = useComplianceRule();

  const { currentWorkspace, workspaceUsers } = useWorkspaceManagement();
  const { currentUser, hasPermission } = useUserManagement();
  const { getSuggestions, generateReportInsights } = useAIAssistant();
  const { getDataAssets, getCatalogData } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Computed values
  const canGenerateReports = useMemo(() => {
    return hasPermission('compliance:generate_reports') && currentWorkspace;
  }, [hasPermission, currentWorkspace]);

  const availableRecipients = useMemo(() => {
    return workspaceUsers?.filter(user => user.id !== currentUser?.id) || [];
  }, [workspaceUsers, currentUser]);

  const reportSizeEstimate = useMemo(() => {
    let size = 0.5; // Base size in MB
    if (reportConfig.includeMetrics) size += 0.3;
    if (reportConfig.includeFindings) size += 0.5;
    if (reportConfig.includeTrends) size += 0.2;
    if (reportConfig.includeRecommendations) size += 0.1;
    size *= reportConfig.standards.length || 1;
    return Math.round(size * 10) / 10;
  }, [reportConfig]);

  // Effects
  useEffect(() => {
    if (isVisible && currentUser) {
      trackActivity({
        action: 'quick_audit_report_opened',
        component: 'QuickAuditReport',
        metadata: { workspace: currentWorkspace?.id },
      });
      loadTemplates();
    }
  }, [isVisible, currentUser, trackActivity, currentWorkspace]);

  useEffect(() => {
    if (reportConfig.name && reportConfig.standards.length > 0) {
      generatePreview();
    }
  }, [reportConfig]);

  // Handlers
  const loadTemplates = useCallback(async () => {
    try {
      const templates = await getReportTemplates();
      setAvailableTemplates(templates);
    } catch (error) {
      console.error('Failed to load report templates:', error);
    }
  }, [getReportTemplates]);

  const generatePreview = useCallback(async () => {
    if (!currentWorkspace || !canGenerateReports) return;

    try {
      const preview = await generateReportInsights({
        workspaceId: currentWorkspace.id,
        timeRange: reportConfig.timeRange,
        standards: reportConfig.standards,
        scope: reportConfig.scope,
      });
      setReportPreview(preview);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  }, [currentWorkspace, canGenerateReports, reportConfig, generateReportInsights]);

  const handleGenerateReport = useCallback(async () => {
    if (!currentWorkspace || !canGenerateReports) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      const reportRequest: AuditReportRequest = {
        workspaceId: currentWorkspace.id,
        name: reportConfig.name,
        description: reportConfig.description,
        scope: reportConfig.scope,
        timeRange: reportConfig.timeRange,
        standards: reportConfig.standards,
        configuration: {
          includeRecommendations: reportConfig.includeRecommendations,
          includeMetrics: reportConfig.includeMetrics,
          includeFindings: reportConfig.includeFindings,
          includeTrends: reportConfig.includeTrends,
          format: reportConfig.format,
        },
        templateId: selectedTemplate || undefined,
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 800);

      const report = await generateAuditReport(reportRequest);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setGeneratedReports(prev => [report, ...prev]);

      // Schedule if configured
      if (reportConfig.schedule.enabled) {
        await scheduleReport({
          reportConfig: reportRequest,
          schedule: reportConfig.schedule,
        });
      }

      // Track successful generation
      trackActivity({
        action: 'audit_report_generated',
        component: 'QuickAuditReport',
        metadata: {
          workspace: currentWorkspace.id,
          reportName: reportConfig.name,
          standards: reportConfig.standards,
          format: reportConfig.format,
          scheduled: reportConfig.schedule.enabled,
        },
      });

      setActiveTab('results');

    } catch (error) {
      console.error('Report generation failed:', error);
      // Handle error appropriately
    } finally {
      setIsGenerating(false);
    }
  }, [
    currentWorkspace,
    canGenerateReports,
    reportConfig,
    selectedTemplate,
    generateAuditReport,
    scheduleReport,
    trackActivity,
  ]);

  const handleConfigChange = useCallback((key: keyof ReportConfiguration, value: any) => {
    setReportConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleStandardToggle = useCallback((standardId: string, selected: boolean) => {
    setReportConfig(prev => ({
      ...prev,
      standards: selected
        ? [...prev.standards, standardId]
        : prev.standards.filter(id => id !== standardId),
    }));
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    const template = availableTemplates.find(t => t.id === templateId);
    if (template) {
      setReportConfig(prev => ({
        ...prev,
        ...template.configuration,
        name: template.name,
        description: template.description,
      }));
    }
  }, [availableTemplates]);

  const handleAddRecipient = useCallback(() => {
    if (customRecipient && !selectedRecipients.includes(customRecipient)) {
      setSelectedRecipients(prev => [...prev, customRecipient]);
      setReportConfig(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          recipients: [...prev.schedule.recipients, customRecipient],
        },
      }));
      setCustomRecipient('');
    }
  }, [customRecipient, selectedRecipients]);

  const handleRemoveRecipient = useCallback((email: string) => {
    setSelectedRecipients(prev => prev.filter(r => r !== email));
    setReportConfig(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        recipients: prev.schedule.recipients.filter(r => r !== email),
      },
    }));
  }, []);

  const renderConfigurationTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              value={reportConfig.name}
              onChange={(e) => handleConfigChange('name', e.target.value)}
              placeholder="Monthly Compliance Audit Report"
            />
          </div>
          
          <div>
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              value={reportConfig.description}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              placeholder="Comprehensive compliance audit covering all active standards..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scope">Scope</Label>
              <Select
                value={reportConfig.scope}
                onValueChange={(value: ReportScope) => handleConfigChange('scope', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workspace">Entire Workspace</SelectItem>
                  <SelectItem value="selected">Selected Assets</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="format">Format</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value: ReportFormat) => handleConfigChange('format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Time Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(reportConfig.timeRange.start, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reportConfig.timeRange.start}
                    onSelect={(date) =>
                      date && handleConfigChange('timeRange', {
                        ...reportConfig.timeRange,
                        start: date,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(reportConfig.timeRange.end, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reportConfig.timeRange.end}
                    onSelect={(date) =>
                      date && handleConfigChange('timeRange', {
                        ...reportConfig.timeRange,
                        end: date,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standards Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Compliance Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {complianceStandards?.map((standard) => (
                <div key={standard.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={standard.id}
                    checked={reportConfig.standards.includes(standard.id)}
                    onCheckedChange={(checked) =>
                      handleStandardToggle(standard.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={standard.id} className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{standard.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {standard.version}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {standard.description}
                    </p>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Content Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="include-metrics"
              checked={reportConfig.includeMetrics}
              onCheckedChange={(checked) => handleConfigChange('includeMetrics', checked)}
            />
            <Label htmlFor="include-metrics" className="flex-1">
              Include Performance Metrics
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="include-findings"
              checked={reportConfig.includeFindings}
              onCheckedChange={(checked) => handleConfigChange('includeFindings', checked)}
            />
            <Label htmlFor="include-findings" className="flex-1">
              Include Audit Findings
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="include-recommendations"
              checked={reportConfig.includeRecommendations}
              onCheckedChange={(checked) => handleConfigChange('includeRecommendations', checked)}
            />
            <Label htmlFor="include-recommendations" className="flex-1">
              Include Recommendations
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="include-trends"
              checked={reportConfig.includeTrends}
              onCheckedChange={(checked) => handleConfigChange('includeTrends', checked)}
            />
            <Label htmlFor="include-trends" className="flex-1">
              Include Trend Analysis
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      {availableTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Report Template</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template (optional)" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{template.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {template.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Report Size Estimate */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Estimated Report Size</AlertTitle>
        <AlertDescription>
          The generated report will be approximately {reportSizeEstimate} MB based on your selections.
        </AlertDescription>
      </Alert>
    </motion.div>
  );

  const renderSchedulingTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Schedule Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-schedule"
              checked={reportConfig.schedule.enabled}
              onCheckedChange={(checked) =>
                handleConfigChange('schedule', {
                  ...reportConfig.schedule,
                  enabled: checked,
                })
              }
            />
            <Label htmlFor="enable-schedule">Enable automatic report generation</Label>
          </div>

          {reportConfig.schedule.enabled && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={reportConfig.schedule.frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'quarterly') =>
                    handleConfigChange('schedule', {
                      ...reportConfig.schedule,
                      frequency: value,
                    })
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

              {/* Recipients */}
              <div>
                <Label>Recipients</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddRecipient}
                      disabled={!customRecipient}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedRecipients.length > 0 && (
                    <div className="space-y-1">
                      {selectedRecipients.map((email) => (
                        <div
                          key={email}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm">{email}</span>
                          <Button
                            onClick={() => handleRemoveRecipient(email)}
                            size="sm"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Quick Add</Label>
                    <div className="flex flex-wrap gap-1">
                      {availableRecipients.map((user) => (
                        <Button
                          key={user.id}
                          onClick={() => {
                            if (!selectedRecipients.includes(user.email)) {
                              setSelectedRecipients(prev => [...prev, user.email]);
                              handleConfigChange('schedule', {
                                ...reportConfig.schedule,
                                recipients: [...reportConfig.schedule.recipients, user.email],
                              });
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6"
                        >
                          {user.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPreviewTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      {reportPreview ? (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {reportPreview.summary.overallScore}%
                  </div>
                  <div className="text-sm text-gray-500">Compliance Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportPreview.summary.totalChecks}
                  </div>
                  <div className="text-sm text-gray-500">Total Checks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Key Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {reportPreview.keyFindings.map((finding, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded border-l-4 border-l-blue-500"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{finding.title}</span>
                        <Badge
                          variant={finding.severity === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {finding.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {finding.description}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {reportPreview.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-24">
                  <div className="space-y-1">
                    {reportPreview.recommendations.map((recommendation, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {recommendation}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Configure your report to see a preview</p>
        </div>
      )}
    </motion.div>
  );

  const renderResultsTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      {generatedReports.length > 0 ? (
        <div className="space-y-3">
          {generatedReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{report.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {report.format.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Generated {format(new Date(report.generatedAt), 'PPp')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Size: {report.sizeInMB} MB • {report.pageCount} pages
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      ArrowDownTrayIcon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No reports generated yet.</p>
          <p className="text-sm mt-1">Generate your first audit report.</p>
        </div>
      )}
    </motion.div>
  );

  const renderProgressIndicator = () => {
    if (!isGenerating) return null;

    return (
      <motion.div
        variants={itemVariants}
        className="bg-blue-50 p-4 rounded-lg border border-blue-200"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">
            Generating Audit Report...
          </span>
          <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-2 text-xs text-blue-600">
          Processing {reportConfig.standards.length} compliance standards
        </div>
      </motion.div>
    );
  };

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
        style={{ width: '420px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Audit Report
              </h2>
              <p className="text-sm text-gray-500">
                Generate comprehensive audit reports
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-4">
              {renderConfigurationTab()}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              {renderSchedulingTab()}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {renderPreviewTab()}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {renderResultsTab()}
            </TabsContent>
          </Tabs>

          {/* Progress Indicator */}
          {renderProgressIndicator()}

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-6">
            <Button
              onClick={handleGenerateReport}
              disabled={
                isGenerating ||
                !reportConfig.name ||
                reportConfig.standards.length === 0 ||
                !canGenerateReports
              }
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!reportPreview}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickAuditReport;

// Named export for backward compatibility
export { QuickAuditReport };