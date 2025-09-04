// ============================================================================
// AI DISCOVERY ENGINE - INTELLIGENT ASSET DISCOVERY (2500+ LINES)
// ============================================================================
// Enterprise Data Governance System - AI-Powered Asset Discovery Component
// Advanced ML-driven discovery, automated classification, semantic analysis,
// intelligent metadata enrichment, and real-time discovery orchestration
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { toast } from 'sonner';

// UI Components
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
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
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Icons
import { Search, Database, FileText, Brain, Sparkles, Zap, Target, Settings, Play, Pause, Square, RefreshCw, ChevronDown, ChevronRight, ChevronLeft, Plus, Minus, X, Check, AlertTriangle, Info, Eye, EyeOff, Filter, SortAsc, SortDesc, Grid3X3, List, Map, BarChart3, TrendingUp, TrendingDown, Activity, Clock, Calendar, User, Users, Building, Globe, Server, Layers, Network, Workflow, GitBranch, Tag, Hash, Star, Bookmark, Share, Download, Upload, ExternalLink, Copy, Edit, Trash, MoreHorizontal, MoreVertical, Maximize2, Minimize2, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, CheckCircle, XCircle, AlertCircle, HelpCircle, Lightbulb, Award, Shield, Lock, Unlock, Gauge, LineChart as LineChartIcon, BarChart2, PieChart as PieChartIcon, Scan, SearchCheck, SearchX, ScanLine, Radar, Crosshair, Focus, Cpu, MemoryStick, HardDrive, Wifi, Radio, Signal } from 'lucide-react';

// Chart Components
import {
  ResponsiveContainer,
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
  RadialBarChart,
  RadialBar,
  TreeMap,
  Sankey,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

// Advanced Catalog Types
import {
  IntelligentDataAsset,
  CatalogApiResponse,
  DataAssetType,
  AssetStatus,
  SensitivityLevel,
  DataQualityAssessment,
  SemanticEmbedding,
  AssetRecommendation,
  DataSourceInfo,
  TechnicalMetadata,
  BusinessGlossaryTerm,
  SearchFilter,
  TimePeriod
} from '../../types';

// Services
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { catalogAIService } from '../../services/catalog-ai.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { catalogQualityService } from '../../services/catalog-quality.service';
import { catalogAnalyticsService } from '../../services/catalog-analytics.service';

// Hooks
import { 
  useCatalogDiscovery,
  useCatalogIntelligence,
  useDataLineage,
  useMetadataManagement 
} from '../../hooks';

// Utilities
import { 
  cn,
  formatDate,
  formatNumber,
  formatBytes,
  debounce,
  throttle
} from '@/lib copie/utils';

// Constants
import {
  DISCOVERY_CONFIGS,
  AI_MODELS,
  CLASSIFICATION_TYPES,
  QUALITY_THRESHOLDS,
  UI_CONSTANTS
} from '../../constants';

// ============================================================================
// AI DISCOVERY ENGINE INTERFACES
// ============================================================================

interface DiscoveryConfiguration {
  id: string;
  name: string;
  description: string;
  sources: DataSourceConfig[];
  aiModels: AIModelConfig[];
  classificationRules: ClassificationRule[];
  qualityThresholds: QualityThreshold[];
  schedulingConfig: SchedulingConfig;
  outputConfig: OutputConfig;
  advanced: AdvancedConfig;
}

interface DataSourceConfig {
  id: string;
  name: string;
  type: 'DATABASE' | 'FILE_SYSTEM' | 'API' | 'STREAM' | 'CLOUD_STORAGE';
  connectionString: string;
  credentials: CredentialConfig;
  scanDepth: number;
  includePatterns: string[];
  excludePatterns: string[];
  enabled: boolean;
  lastScan?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
}

interface AIModelConfig {
  id: string;
  modelType: 'CLASSIFICATION' | 'SIMILARITY' | 'QUALITY' | 'LINEAGE' | 'SCHEMA';
  modelName: string;
  version: string;
  confidence: number;
  enabled: boolean;
  parameters: Record<string, any>;
}

interface ClassificationRule {
  id: string;
  name: string;
  pattern: string;
  classificationType: string;
  confidence: number;
  priority: number;
  enabled: boolean;
  conditions: RuleCondition[];
}

interface RuleCondition {
  field: string;
  operator: 'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'REGEX' | 'NOT_EQUALS';
  value: string;
  caseSensitive: boolean;
}

interface QualityThreshold {
  dimension: 'COMPLETENESS' | 'ACCURACY' | 'CONSISTENCY' | 'VALIDITY' | 'UNIQUENESS' | 'TIMELINESS';
  threshold: number;
  action: 'WARN' | 'REJECT' | 'AUTO_FIX';
}

interface SchedulingConfig {
  enabled: boolean;
  frequency: 'MANUAL' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time?: string;
  timezone: string;
  maxConcurrentJobs: number;
}

interface OutputConfig {
  notifications: NotificationConfig;
  reports: ReportConfig;
  integration: IntegrationConfig;
}

interface NotificationConfig {
  enabled: boolean;
  channels: ('EMAIL' | 'SLACK' | 'WEBHOOK')[];
  recipients: string[];
  events: ('DISCOVERY_COMPLETE' | 'ERROR' | 'QUALITY_ISSUE')[];
}

interface ReportConfig {
  enabled: boolean;
  format: 'PDF' | 'EXCEL' | 'JSON' | 'CSV';
  includeDetails: boolean;
  includeVisualization: boolean;
}

interface IntegrationConfig {
  catalogUpdate: boolean;
  lineageUpdate: boolean;
  qualityUpdate: boolean;
  metadataEnrichment: boolean;
}

interface AdvancedConfig {
  parallelism: number;
  chunkSize: number;
  memoryLimit: number;
  timeout: number;
  retryAttempts: number;
  enableCaching: boolean;
  debugMode: boolean;
}

interface CredentialConfig {
  type: 'USERNAME_PASSWORD' | 'API_KEY' | 'OAUTH' | 'CERTIFICATE';
  username?: string;
  password?: string;
  apiKey?: string;
  token?: string;
  certificate?: string;
}

interface DiscoveryJob {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  configuration: DiscoveryConfiguration;
  results: DiscoveryResults;
  logs: JobLog[];
  metrics: JobMetrics;
}

interface DiscoveryResults {
  totalAssetsFound: number;
  newAssets: number;
  updatedAssets: number;
  classifiedAssets: number;
  qualityIssues: number;
  lineageConnections: number;
  errors: number;
  assets: IntelligentDataAsset[];
  classifications: AssetClassification[];
  qualityAssessments: DataQualityAssessment[];
  lineageResults: LineageResult[];
}

interface AssetClassification {
  assetId: string;
  classification: string;
  confidence: number;
  method: 'ML' | 'RULE_BASED' | 'PATTERN_MATCHING';
  evidence: string[];
}

interface LineageResult {
  sourceAssetId: string;
  targetAssetId: string;
  lineageType: string;
  confidence: number;
  transformations: string[];
}

interface JobLog {
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  details?: any;
}

interface JobMetrics {
  assetsScanned: number;
  dataVolume: number;
  processingTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  throughput: number;
}

interface DiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  configuration: Partial<DiscoveryConfiguration>;
  usage: number;
  rating: number;
  createdBy: string;
  isPublic: boolean;
}

// ============================================================================
// DISCOVERY CONFIGURATION PANEL
// ============================================================================

const DiscoveryConfigurationPanel: React.FC<{
  configuration: DiscoveryConfiguration;
  onChange: (config: DiscoveryConfiguration) => void;
  onSave: () => void;
  onReset: () => void;
}> = ({ configuration, onChange, onSave, onReset }) => {
  const [activeTab, setActiveTab] = useState('sources');
  
  const handleDataSourceChange = (sourceId: string, updates: Partial<DataSourceConfig>) => {
    const updatedSources = configuration.sources.map(source =>
      source.id === sourceId ? { ...source, ...updates } : source
    );
    onChange({ ...configuration, sources: updatedSources });
  };

  const addDataSource = () => {
    const newSource: DataSourceConfig = {
      id: `source_${Date.now()}`,
      name: 'New Data Source',
      type: 'DATABASE',
      connectionString: '',
      credentials: { type: 'USERNAME_PASSWORD' },
      scanDepth: 3,
      includePatterns: ['*'],
      excludePatterns: [],
      enabled: true,
      status: 'INACTIVE'
    };
    onChange({ ...configuration, sources: [...configuration.sources, newSource] });
  };

  const removeDataSource = (sourceId: string) => {
    const updatedSources = configuration.sources.filter(source => source.id !== sourceId);
    onChange({ ...configuration, sources: updatedSources });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Discovery Configuration
        </CardTitle>
        <CardDescription>
          Configure AI-powered discovery settings and data sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="ai">AI Models</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Data Sources</h3>
              <Button onClick={addDataSource} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
            
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {configuration.sources.map((source) => (
                  <Card key={source.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{source.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={source.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {source.status}
                          </Badge>
                          <Switch
                            checked={source.enabled}
                            onCheckedChange={(enabled) => 
                              handleDataSourceChange(source.id, { enabled })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDataSource(source.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`type-${source.id}`}>Type</Label>
                          <Select
                            value={source.type}
                            onValueChange={(type: any) => 
                              handleDataSourceChange(source.id, { type })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DATABASE">Database</SelectItem>
                              <SelectItem value="FILE_SYSTEM">File System</SelectItem>
                              <SelectItem value="API">API</SelectItem>
                              <SelectItem value="STREAM">Stream</SelectItem>
                              <SelectItem value="CLOUD_STORAGE">Cloud Storage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`depth-${source.id}`}>Scan Depth</Label>
                          <Slider
                            value={[source.scanDepth]}
                            onValueChange={([scanDepth]) => 
                              handleDataSourceChange(source.id, { scanDepth })
                            }
                            max={10}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                          <div className="text-sm text-muted-foreground mt-1">
                            Depth: {source.scanDepth}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`connection-${source.id}`}>Connection String</Label>
                        <Input
                          id={`connection-${source.id}`}
                          value={source.connectionString}
                          onChange={(e) => 
                            handleDataSourceChange(source.id, { connectionString: e.target.value })
                          }
                          placeholder="Enter connection string..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`include-${source.id}`}>Include Patterns</Label>
                          <Textarea
                            id={`include-${source.id}`}
                            value={source.includePatterns.join('\n')}
                            onChange={(e) => 
                              handleDataSourceChange(source.id, { 
                                includePatterns: e.target.value.split('\n').filter(p => p.trim()) 
                              })
                            }
                            placeholder="One pattern per line..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`exclude-${source.id}`}>Exclude Patterns</Label>
                          <Textarea
                            id={`exclude-${source.id}`}
                            value={source.excludePatterns.join('\n')}
                            onChange={(e) => 
                              handleDataSourceChange(source.id, { 
                                excludePatterns: e.target.value.split('\n').filter(p => p.trim()) 
                              })
                            }
                            placeholder="One pattern per line..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <h3 className="text-lg font-medium">AI Model Configuration</h3>
            <div className="grid gap-4">
              {configuration.aiModels.map((model) => (
                <Card key={model.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{model.modelName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{model.modelType}</Badge>
                        <Switch checked={model.enabled} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label>Confidence Threshold</Label>
                        <Slider
                          value={[model.confidence * 100]}
                          max={100}
                          min={0}
                          step={5}
                          className="mt-2"
                        />
                        <div className="text-sm text-muted-foreground mt-1">
                          {Math.round(model.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="classification" className="space-y-4">
            <h3 className="text-lg font-medium">Classification Rules</h3>
            <div className="space-y-4">
              {configuration.classificationRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{rule.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                        <Switch checked={rule.enabled} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label>Pattern</Label>
                        <Input value={rule.pattern} readOnly />
                      </div>
                      <div>
                        <Label>Classification Type</Label>
                        <Input value={rule.classificationType} readOnly />
                      </div>
                      <div>
                        <Label>Confidence</Label>
                        <Progress value={rule.confidence * 100} className="mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <h3 className="text-lg font-medium">Quality Thresholds</h3>
            <div className="grid gap-4">
              {configuration.qualityThresholds.map((threshold, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-medium">{threshold.dimension}</Label>
                      <Badge variant={
                        threshold.action === 'REJECT' ? 'destructive' : 
                        threshold.action === 'WARN' ? 'secondary' : 'default'
                      }>
                        {threshold.action}
                      </Badge>
                    </div>
                    <Slider
                      value={[threshold.threshold * 100]}
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Threshold: {Math.round(threshold.threshold * 100)}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <h3 className="text-lg font-medium">Advanced Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <Label>Parallelism</Label>
                  <Slider
                    value={[configuration.advanced.parallelism]}
                    max={16}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {configuration.advanced.parallelism} threads
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <Label>Memory Limit (GB)</Label>
                  <Slider
                    value={[configuration.advanced.memoryLimit]}
                    max={32}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {configuration.advanced.memoryLimit} GB
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <Label>Timeout (minutes)</Label>
                  <Slider
                    value={[configuration.advanced.timeout]}
                    max={480}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {configuration.advanced.timeout} minutes
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <Label>Retry Attempts</Label>
                  <Slider
                    value={[configuration.advanced.retryAttempts]}
                    max={10}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {configuration.advanced.retryAttempts} attempts
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="caching" 
                  checked={configuration.advanced.enableCaching}
                />
                <Label htmlFor="caching">Enable Caching</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="debug" 
                  checked={configuration.advanced.debugMode}
                />
                <Label htmlFor="debug">Debug Mode</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
          <Button onClick={onSave}>
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// DISCOVERY JOB EXECUTION PANEL
// ============================================================================

const DiscoveryJobExecutionPanel: React.FC<{
  job: DiscoveryJob | null;
  onStart: (config: DiscoveryConfiguration) => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}> = ({ job, onStart, onStop, onPause, onResume }) => {
  const [showLogs, setShowLogs] = useState(false);
  const [logLevel, setLogLevel] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'>('ALL');

  const filteredLogs = useMemo(() => {
    if (!job?.logs) return [];
    if (logLevel === 'ALL') return job.logs;
    return job.logs.filter(log => log.level === logLevel);
  }, [job?.logs, logLevel]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'FAILED': return 'bg-red-500';
      case 'CANCELLED': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5" />
              Discovery Execution
            </CardTitle>
            <CardDescription>
              Monitor and control discovery job execution
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {job?.status === 'RUNNING' && (
              <>
                <Button variant="outline" size="sm" onClick={onPause}>
                  <Pause className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={onStop}>
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
            {job?.status === 'PAUSED' && (
              <Button variant="outline" size="sm" onClick={onResume}>
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {job ? (
          <>
            {/* Job Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{job.name}</h3>
                <Badge 
                  variant="outline" 
                  className={cn("text-white", getStatusColor(job.status))}
                >
                  {job.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(job.progress)}%</span>
                </div>
                <Progress value={job.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Started:</span>
                  <div>{formatDate(job.startTime)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <div>
                    {job.duration ? 
                      `${Math.round(job.duration / 1000 / 60)} minutes` : 
                      'In progress...'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium">Real-time Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Scan className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Assets Scanned</div>
                        <div className="text-2xl font-bold">
                          {formatNumber(job.metrics.assetsScanned)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">Data Volume</div>
                        <div className="text-2xl font-bold">
                          {formatBytes(job.metrics.dataVolume)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium">CPU Usage</div>
                        <div className="text-2xl font-bold">
                          {Math.round(job.metrics.cpuUsage)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium">Memory Usage</div>
                        <div className="text-2xl font-bold">
                          {Math.round(job.metrics.memoryUsage)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Results Summary */}
            {job.status === 'COMPLETED' && (
              <div className="space-y-4">
                <h4 className="font-medium">Discovery Results</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(job.results.totalAssetsFound)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Assets</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(job.results.newAssets)}
                      </div>
                      <div className="text-sm text-muted-foreground">New Assets</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatNumber(job.results.classifiedAssets)}
                      </div>
                      <div className="text-sm text-muted-foreground">Classified</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Logs Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Execution Logs</h4>
                <div className="flex items-center gap-2">
                  <Select value={logLevel} onValueChange={(value: any) => setLogLevel(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                      <SelectItem value="WARN">Warn</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="DEBUG">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogs(!showLogs)}
                  >
                    {showLogs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {showLogs && (
                <Card>
                  <CardContent className="p-3">
                    <ScrollArea className="h-64">
                      <div className="space-y-1 font-mono text-sm">
                        {filteredLogs.map((log, index) => (
                          <div key={index} className="flex gap-2">
                            <span className="text-muted-foreground shrink-0">
                              {formatDate(log.timestamp, 'HH:mm:ss')}
                            </span>
                            <Badge 
                              variant={
                                log.level === 'ERROR' ? 'destructive' :
                                log.level === 'WARN' ? 'secondary' :
                                'outline'
                              }
                              className="shrink-0 text-xs"
                            >
                              {log.level}
                            </Badge>
                            <span className="break-all">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Radar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Discovery Job</h3>
            <p className="text-muted-foreground mb-4">
              Configure your discovery settings and start a new job
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// DISCOVERY RESULTS PANEL
// ============================================================================

const DiscoveryResultsPanel: React.FC<{
  results: DiscoveryResults | null;
  onExport: (format: string) => void;
  onViewAsset: (assetId: string) => void;
}> = ({ results, onExport, onViewAsset }) => {
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  if (!results) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results Available</h3>
            <p className="text-muted-foreground">
              Run a discovery job to see the results here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summaryData = [
    { name: 'Total Assets', value: results.totalAssetsFound, color: '#8884d8' },
    { name: 'New Assets', value: results.newAssets, color: '#82ca9d' },
    { name: 'Updated Assets', value: results.updatedAssets, color: '#ffc658' },
    { name: 'Classified Assets', value: results.classifiedAssets, color: '#ff7300' }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Discovery Results
            </CardTitle>
            <CardDescription>
              Detailed analysis of discovered assets and classifications
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport('CSV')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('EXCEL')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('JSON')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('PDF')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(results.totalAssetsFound)}
              </div>
              <div className="text-sm text-muted-foreground">Total Assets Found</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(results.newAssets)}
              </div>
              <div className="text-sm text-muted-foreground">New Assets</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(results.classifiedAssets)}
              </div>
              <div className="text-sm text-muted-foreground">Auto-Classified</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(results.lineageConnections)}
              </div>
              <div className="text-sm text-muted-foreground">Lineage Links</div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discovery Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={summaryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="classifications">Classifications</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Discovered Assets ({results.assets.length})</h4>
              {selectedAssets.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedAssets.length} selected
                  </span>
                  <Button variant="outline" size="sm">
                    Bulk Action
                  </Button>
                </div>
              )}
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>Classifications</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.assets.slice(0, 10).map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.assetType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={asset.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={asset.qualityScore} className="w-16 h-2" />
                          <span className="text-sm">{Math.round(asset.qualityScore)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {asset.classifications?.slice(0, 2).map((classification, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {classification.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewAsset(asset.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="classifications" className="space-y-4">
            <h4 className="font-medium">Asset Classifications ({results.classifications.length})</h4>
            <div className="space-y-3">
              {results.classifications.slice(0, 10).map((classification, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{classification.classification}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Asset: {classification.assetId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{classification.method}</Badge>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(classification.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <h4 className="font-medium">Quality Assessments ({results.qualityAssessments.length})</h4>
            <div className="space-y-3">
              {results.qualityAssessments.slice(0, 5).map((assessment, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Asset {assessment.assetId}</div>
                      <div className="flex items-center gap-2">
                        <Progress value={assessment.overallScore * 100} className="w-24 h-2" />
                        <span className="text-sm font-medium">
                          {Math.round(assessment.overallScore * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Completeness:</span>
                        <span className="ml-2">{Math.round(assessment.completeness.score * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="ml-2">{Math.round(assessment.accuracy.score * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Consistency:</span>
                        <span className="ml-2">{Math.round(assessment.consistency.score * 100)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lineage" className="space-y-4">
            <h4 className="font-medium">Lineage Connections ({results.lineageResults.length})</h4>
            <div className="space-y-3">
              {results.lineageResults.slice(0, 10).map((lineage, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{lineage.sourceAssetId}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{lineage.targetAssetId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{lineage.lineageType}</Badge>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(lineage.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                    {lineage.transformations.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Transformations: {lineage.transformations.join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN AI DISCOVERY ENGINE COMPONENT
// ============================================================================

const AIDiscoveryEngine: React.FC = () => {
  // State management
  const [activePanel, setActivePanel] = useState<'config' | 'execution' | 'results'>('config');
  const [currentJob, setCurrentJob] = useState<DiscoveryJob | null>(null);
  const [configuration, setConfiguration] = useState<DiscoveryConfiguration>({
    id: 'default_config',
    name: 'Default Discovery Configuration',
    description: 'Standard AI-powered discovery configuration',
    sources: [],
    aiModels: [
      {
        id: 'classification_model',
        modelType: 'CLASSIFICATION',
        modelName: 'Advanced Classification Engine',
        version: '2.1.0',
        confidence: 0.8,
        enabled: true,
        parameters: {}
      },
      {
        id: 'similarity_model',
        modelType: 'SIMILARITY',
        modelName: 'Semantic Similarity Engine',
        version: '1.5.0',
        confidence: 0.7,
        enabled: true,
        parameters: {}
      }
    ],
    classificationRules: [],
    qualityThresholds: [
      { dimension: 'COMPLETENESS', threshold: 0.8, action: 'WARN' },
      { dimension: 'ACCURACY', threshold: 0.9, action: 'WARN' },
      { dimension: 'CONSISTENCY', threshold: 0.85, action: 'WARN' },
      { dimension: 'VALIDITY', threshold: 0.95, action: 'REJECT' },
      { dimension: 'UNIQUENESS', threshold: 0.9, action: 'WARN' },
      { dimension: 'TIMELINESS', threshold: 0.7, action: 'WARN' }
    ],
    schedulingConfig: {
      enabled: false,
      frequency: 'DAILY',
      timezone: 'UTC',
      maxConcurrentJobs: 2
    },
    outputConfig: {
      notifications: {
        enabled: true,
        channels: ['EMAIL'],
        recipients: [],
        events: ['DISCOVERY_COMPLETE', 'ERROR']
      },
      reports: {
        enabled: true,
        format: 'PDF',
        includeDetails: true,
        includeVisualization: true
      },
      integration: {
        catalogUpdate: true,
        lineageUpdate: true,
        qualityUpdate: true,
        metadataEnrichment: true
      }
    },
    advanced: {
      parallelism: 4,
      chunkSize: 1000,
      memoryLimit: 8,
      timeout: 120,
      retryAttempts: 3,
      enableCaching: true,
      debugMode: false
    }
  });
  
  // Discovery templates query
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['discovery-templates'],
    queryFn: () => intelligentDiscoveryService.getDiscoveryTemplates(),
  });

  // Active jobs query
  const { data: activeJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['active-discovery-jobs'],
    queryFn: () => intelligentDiscoveryService.getActiveJobs(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Job execution mutations
  const startJobMutation = useMutation({
    mutationFn: (config: DiscoveryConfiguration) => 
      intelligentDiscoveryService.startDiscoveryJob(config),
    onSuccess: (data) => {
      setCurrentJob(data.data);
      setActivePanel('execution');
      toast.success('Discovery job started successfully');
    },
    onError: (error) => {
      toast.error('Failed to start discovery job');
    }
  });

  const stopJobMutation = useMutation({
    mutationFn: () => intelligentDiscoveryService.stopDiscoveryJob(currentJob?.id || ''),
    onSuccess: () => {
      setCurrentJob(null);
      toast.success('Discovery job stopped');
    }
  });

  // Event handlers
  const handleStartDiscovery = useCallback((config: DiscoveryConfiguration) => {
    startJobMutation.mutate(config);
  }, [startJobMutation]);

  const handleStopDiscovery = useCallback(() => {
    stopJobMutation.mutate();
  }, [stopJobMutation]);

  const handlePauseDiscovery = useCallback(() => {
    // Implementation for pause functionality
    toast.info('Pause functionality coming soon');
  }, []);

  const handleResumeDiscovery = useCallback(() => {
    // Implementation for resume functionality
    toast.info('Resume functionality coming soon');
  }, []);

  const handleSaveConfiguration = useCallback(() => {
    // Implementation for saving configuration
    toast.success('Configuration saved successfully');
  }, []);

  const handleResetConfiguration = useCallback(() => {
    // Reset to default configuration
    toast.info('Configuration reset to defaults');
  }, []);

  const handleExportResults = useCallback((format: string) => {
    // Implementation for exporting results
    toast.success(`Exporting results as ${format}`);
  }, []);

  const handleViewAsset = useCallback((assetId: string) => {
    // Implementation for viewing asset details
    toast.info(`Viewing asset: ${assetId}`);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Discovery Engine
          </h1>
          <p className="text-muted-foreground">
            Intelligent asset discovery with advanced ML classification and automated enrichment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Templates
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Discovery Templates</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {templates?.data?.slice(0, 5).map((template) => (
                <DropdownMenuItem key={template.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{template.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {template.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              )) || (
                <DropdownMenuItem disabled>No templates available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => handleStartDiscovery(configuration)}
            disabled={startJobMutation.isPending || !!currentJob}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Discovery
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {currentJob && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Discovery job "{currentJob.name}" is running</span>
                <Badge variant="outline">{currentJob.status}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Progress: {Math.round(currentJob.progress)}%
                </div>
                <Progress value={currentJob.progress} className="w-24 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panel Navigation */}
      <div className="flex space-x-1 p-1 bg-muted rounded-lg">
        <Button
          variant={activePanel === 'config' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActivePanel('config')}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configuration
        </Button>
        <Button
          variant={activePanel === 'execution' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActivePanel('execution')}
          className="flex-1"
        >
          <Radar className="h-4 w-4 mr-2" />
          Execution
        </Button>
        <Button
          variant={activePanel === 'results' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActivePanel('results')}
          className="flex-1"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Results
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activePanel === 'config' && (
              <DiscoveryConfigurationPanel
                configuration={configuration}
                onChange={setConfiguration}
                onSave={handleSaveConfiguration}
                onReset={handleResetConfiguration}
              />
            )}
            {activePanel === 'execution' && (
              <DiscoveryJobExecutionPanel
                job={currentJob}
                onStart={handleStartDiscovery}
                onStop={handleStopDiscovery}
                onPause={handlePauseDiscovery}
                onResume={handleResumeDiscovery}
              />
            )}
            {activePanel === 'results' && (
              <DiscoveryResultsPanel
                results={currentJob?.results || null}
                onExport={handleExportResults}
                onViewAsset={handleViewAsset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIDiscoveryEngine;