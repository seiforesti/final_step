'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import { Brain, Send, Mic, MicOff, Volume2, VolumeX, Copy, Download, Share, MoreHorizontal, Sparkles, Zap, Target, Search, Filter, RefreshCw, Settings, BookOpen, Code, FileText, Database, Shield, Users, Activity, TrendingUp, AlertCircle, CheckCircle, Clock, ArrowUp, ArrowDown, ArrowRight, Plus, Minus, X, Eye, EyeOff, Star, ThumbsUp, ThumbsDown, MessageSquare, Globe, Lightbulb, Cpu, HardDrive, Network, Calendar, User, Tag, Layers, BarChart3, PieChart, LineChart, Map, Workflow, GitBranch, Terminal, Puzzle, Wand2, Rocket, Radar, Microscope, Beaker, FlaskConical, TestTube, Gauge, Timer, Clock4, AlarmClock, Bell, BellRing, Hash, AtSign, Percent, DollarSign, Euro, PoundSterling, Yen, Bitcoin, TrendingDown, MousePointer, Hand, Fingerprint, Key, Lock, Unlock, ShieldCheckIcon, ShieldAlert, ShieldX, Scan, ScanLine, QrCode, Smartphone, Tablet, Laptop, Monitor, Tv, Camera, Video, Headphones, Gamepad2, Joystick, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Shuffle, Repeat, Repeat1, SkipBack, Play, Pause, Square, SkipForward, FastForward, Rewind, Volume, VolumeX as VolumeMute, VolumeOff, WifiOff, Bluetooth, BluetoothConnected, Usb, UsbIcon, BatteryLow, Battery, BatteryCharging, Plug, Power, PowerOff, PlugZap, Flashlight, Sun, Moon, Sunrise, Sunset, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudHail, Wind, Tornado, Snowflake, Thermometer, ThermometerSun, ThermometerSnowflake, Umbrella, Rainbow, Waves, Mountain, Volcano, TreePine, TreeDeciduous, Flower, Flower2, Leaf, Seedling, Sprout, Bug, Fish, Bird, Rabbit, Turtle, Squirrel, Footprints, Paw, BugOff, BugPlay, Anchor, Ship, Sailboat, Car, CarTaxiFront, Truck, Bus, Bike, Scooter, Train, TrainFront, Plane, PlaneTakeoff, PlaneLanding, Helicopter, Rocket as RocketIcon, Fuel, Construction, Hammer, Wrench, Screwdriver, Drill, Pickaxe, Shovel, Scissors, PaintBucket, Brush, Palette, Pipette, Ruler, Triangle, Square as SquareIcon, Circle, Pentagon, Hexagon, Octagon, Diamond, Heart, Spade, Club, Clubs, Spades, Hearts, Diamonds, Bookmark, BookmarkPlus, BookmarkMinus, BookmarkCheck, BookmarkX, Book, BookCopy, BookOpen2, BookOpenCheck, BookOpenText, BookMarked, BookA, BookDashed, BookDown, BookUp, BookUser, Notebook, NotebookPen, NotebookTabs, NotebookText, ScrollText, Scroll, FileArchive, FileBadge, FileBadge2, FileBarChart, FileBarChart2, FileBox, FileCheck, FileCheck2, FileClock, FileCode, FileCode2, FileCog, FileDiff, FileDigit, FileDown, FileEdit, FileHeart, FileImage, FileInput, FileKey, FileKey2, FileLock, FileLock2, FileMinus, FileMinus2, FileMusic, FileOutput, FilePenLine, FilePlus, FilePlus2, FileQuestion, FileScan, FileSearch, FileSearch2, FileSliders, FileSpreadsheet, FileStack, FileSymlink, FileTerminal, FileType, FileType2, FileUp, FileVideo, FileVideo2, FileVolume, FileVolume2, FileWarning, FileX, FileX2, File as FileIcon, Files, Folder, FolderArchive, FolderCheck, FolderClock, FolderClosed, FolderCog, FolderDown, FolderEdit, FolderHeart, FolderInput, FolderKanban, FolderKey, FolderLock, FolderMinus, FolderOpen, FolderOutput, FolderPlus, FolderRoot, FolderSearch, FolderSearch2, FolderSymlink, FolderTree, FolderUp, FolderX, Archive, ArchiveRestore, ArchiveX, Package, PackageCheck, PackageMinus, PackageOpen, PackagePlus, PackageSearch, PackageX, Package2, Briefcase, BriefcaseBusiness, Building, Building2, Factory, Warehouse, Store, ShoppingBag, ShoppingCart, CreditCard, Banknote, Coins, Receipt, ReceiptEuro, ReceiptIndianRupee, ReceiptJapaneseYen, ReceiptPoundSterling, ReceiptRussianRuble, ReceiptSwissFranc, ReceiptText, Landmark, PiggyBank, Wallet, BadgeDollarSign, BadgeEuro, BadgeIndianRupee, BadgeJapaneseYen, BadgePoundSterling, BadgeRussianRuble, BadgeSwissFranc, DollarSign as Dollar, Euro as EuroIcon, IndianRupee, JapaneseYen, PoundSterling as Pound, RussianRuble, SwissFranc, Calculator, CalendarClock, CalendarDays, CalendarHeart, CalendarMinus, CalendarPlus, CalendarSearch, CalendarX, CalendarCheck, CalendarCheck2, CalendarRange, Clock1, Clock2, Clock3, Clock5, Clock6, Clock7, Clock8, Clock9, Clock10, Clock11, Clock12, Hourglass, Stopwatch, Watch, AlarmClockCheck, AlarmClockMinus, AlarmClockOff, AlarmClockPlus, BellDot, BellElectric, BellMinus, BellOff, BellPlus, Notification, Mail, MailCheck, MailMinus, MailOpen, MailPlus, MailQuestion, MailSearch, MailWarning, MailX, Inbox, Send as SendIcon, SendHorizonal, Forward, Reply, ReplyAll, Undo, Undo2, Redo, Redo2, RotateCcw, RotateCw, Repeat2, ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowBigUp, ArrowBigDownDash, ArrowBigLeftDash, ArrowBigRightDash, ArrowBigUpDash, ArrowDown01, ArrowDown10, ArrowDownAZ, ArrowDownFromLine, ArrowDownLeft, ArrowDownNarrowWide, ArrowDownRight, ArrowDownToDot, ArrowDownToLine, ArrowDownUp, ArrowDownWideNarrow, ArrowDownZA, ArrowLeft, ArrowLeftFromLine, ArrowLeftRight, ArrowLeftToLine, ArrowRightFromLine, ArrowRightLeft, ArrowRightToLine, ArrowUp01, ArrowUp10, ArrowUpAZ, ArrowUpDown, ArrowUpFromDot, ArrowUpFromLine, ArrowUpLeft, ArrowUpNarrowWide, ArrowUpRight, ArrowUpToLine, ArrowUpWideNarrow, ArrowUpZA, ChevronsDown, ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsUpDown, ChevronsLeftRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronFirst, ChevronLast, ChevronsDownUp, CornerDownLeft, CornerDownRight, CornerLeftDown, CornerLeftUp, CornerRightDown, CornerRightUp, CornerUpLeft, CornerUpRight, Move, Move3d, MoveDiagonal, MoveDiagonal2, MoveHorizontal, MoveVertical,  } from 'lucide-react';

// Import hooks and services
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';
import { usePipelineManager } from '../../../../hooks/usePipelineManager';
import { useJobWorkflow } from '../../../../hooks/useJobWorkflow';
import { useDataSources } from '../../../../hooks/useDataSources';
import { useScanRuleSets } from '../../../../hooks/useScanRuleSets';
import { useClassifications } from '../../../../hooks/useClassifications';
import { useComplianceRules as useComplianceRule } from '../../../../hooks/useComplianceRules';
import { useAdvancedCatalog } from '../../../../hooks/useAdvancedCatalog';
import { useScanLogic } from '../../../../hooks/useScanLogic';
import { useRBACSystem as useRBAC } from '../../../../hooks/useRBACSystem';

// Types
interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    tokens?: number;
    confidence?: number;
    sources?: string[];
    recommendations?: AIRecommendation[];
    actions?: AIAction[];
    insights?: AIInsight[];
    context?: AIContext;
    error?: string;
    warning?: string;
  };
  reactions?: {
    helpful: boolean;
    accurate: boolean;
    rating: number;
    feedback?: string;
  };
  attachments?: AIAttachment[];
}

interface AIRecommendation {
  id: string;
  type: 'optimization' | 'security' | 'compliance' | 'quality' | 'performance' | 'cost';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    metric: string;
    improvement: number;
    confidence: number;
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number;
    steps: string[];
    automated: boolean;
    spaIntegration?: string;
  };
  evidence: {
    dataPoints: string[];
    metrics: Record<string, number>;
    comparisons: Record<string, any>;
  };
}

interface AIAction {
  id: string;
  type: 'spa-action' | 'workflow' | 'pipeline' | 'analysis' | 'export' | 'notification';
  title: string;
  description: string;
  icon: any;
  parameters: Record<string, any>;
  confirmation?: {
    required: boolean;
    message: string;
    risks: string[];
  };
  execution: {
    method: string;
    endpoint?: string;
    spaTarget?: string;
    workflowId?: string;
    pipelineId?: string;
  };
}

interface AIInsight {
  id: string;
  category: 'trend' | 'anomaly' | 'pattern' | 'correlation' | 'prediction' | 'benchmark';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  data: {
    source: string;
    timeRange: string;
    metrics: Record<string, any>;
    visualizations: AIVisualization[];
  };
  implications: string[];
  relatedSPAs: string[];
}

interface AIContext {
  user: {
    id: string;
    role: string;
    permissions: string[];
    preferences: Record<string, any>;
    activity: {
      recentActions: string[];
      frequentSPAs: string[];
      currentSession: Record<string, any>;
    };
  };
  workspace: {
    id: string;
    name: string;
    type: string;
    resources: string[];
    metrics: Record<string, number>;
  };
  system: {
    activeSPAs: string[];
    health: Record<string, any>;
    performance: Record<string, number>;
    alerts: any[];
    recentEvents: any[];
  };
  conversation: {
    topic: string;
    intent: string;
    entities: string[];
    sentiment: string;
    complexity: number;
  };
}

interface AIVisualization {
  type: 'chart' | 'graph' | 'heatmap' | 'table' | 'metric' | 'gauge';
  title: string;
  data: any;
  config: Record<string, any>;
}

interface AIAttachment {
  id: string;
  type: 'code' | 'config' | 'data' | 'image' | 'document' | 'link';
  name: string;
  content: string;
  metadata: Record<string, any>;
  actions: string[];
}

interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'troubleshooting' | 'optimization' | 'analysis' | 'learning' | 'automation';
  prompt: string;
  context: string[];
  expectedOutputs: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
}

interface AIKnowledgeBase {
  id: string;
  title: string;
  category: 'concepts' | 'procedures' | 'troubleshooting' | 'best-practices' | 'apis' | 'integrations';
  content: string;
  tags: string[];
  relevanceScore: number;
  lastUpdated: string;
  sources: string[];
  relatedTopics: string[];
}

interface VoiceRecognition {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  language: string;
  error?: string;
}

interface AIAnalytics {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  satisfactionScore: number;
  topCategories: Record<string, number>;
  frequentQuestions: string[];
  resolutionRate: number;
  escalationRate: number;
  userEngagement: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
    avgSessionDuration: number;
  };
}

interface QuickAIChatProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  initialPrompt?: string;
  contextData?: any;
}

const QuickAIChat: React.FC<QuickAIChatProps> = ({
  isVisible,
  onClose,
  className = '',
  initialPrompt,
  contextData,
}) => {
  // State management
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [aiMode, setAIMode] = useState<'chat' | 'analysis' | 'automation' | 'learning'>('chat');
  const [activeTab, setActiveTab] = useState<string>('conversation');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [voiceRecognition, setVoiceRecognition] = useState<VoiceRecognition>({
    isRecording: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    language: 'en-US'
  });
  const [textToSpeech, setTextToSpeech] = useState<{
    enabled: boolean;
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
  }>({
    enabled: false,
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 0.8
  });
  const [conversationTemplates, setConversationTemplates] = useState<ConversationTemplate[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<AIKnowledgeBase[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [contextMode, setContextMode] = useState<'auto' | 'manual' | 'selective'>('auto');
  const [selectedContext, setSelectedContext] = useState<string[]>([]);
  const [aiPersonality, setAIPersonality] = useState<'professional' | 'friendly' | 'technical' | 'creative'>('professional');
  const [responseLength, setResponseLength] = useState<'concise' | 'detailed' | 'comprehensive'>('detailed');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.8);
  const [showDebugMode, setShowDebugMode] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [aiAnalytics, setAIAnalytics] = useState<AIAnalytics | null>(null);
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [showContextPanel, setShowContextPanel] = useState<boolean>(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);
  const [autoSuggestMode, setAutoSuggestMode] = useState<boolean>(true);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<boolean>(true);
  const [crossSPAIntegration, setCrossSPAIntegration] = useState<boolean>(true);
  const [proactiveInsights, setProactiveInsights] = useState<boolean>(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  // Hooks
  const {
    aiContext,
    getAIRecommendations,
    analyzePerformance,
    optimizeWorkflow,
    generateCode,
    validateConfiguration,
    predictIssues,
    suggestImprovements,
    autoComplete,
    explainConcept,
    troubleshootError,
    processNaturalLanguage,
    generateInsights,
    getContextualHelp,
    analyzeUserBehavior,
    createAutomation,
    getKnowledgeBase,
    saveConversation,
    loadConversation,
    exportConversation,
    getAIAnalytics,
    updateAISettings,
    trainAIModel,
    validateAIResponse,
    getConversationSuggestions,
    analyzeCrossGroupData,
    generateWorkflow,
    optimizeResources
  } = useAIAssistant();

  const {
    currentWorkspace,
    workspaces,
    getWorkspaceContext,
    getWorkspaceResources,
    getWorkspaceMetrics
  } = useWorkspaceManagement();

  const {
    currentUser,
    userPermissions,
    checkPermission,
    getUserPreferences,
    getUserActivity
  } = useUserManagement();

  const {
    crossGroupContext,
    getSPAStatus,
    getAvailableSPAActions,
    getCrossGroupMetrics,
    getIntegrationStatus,
    coordinateExecution
  } = useCrossGroupIntegration();

  const {
    trackActivity,
    getActivityHistory,
    getPerformanceData,
    getUserBehavior,
    getSystemMetrics
  } = useActivityTracking();

  // SPA Integration Hooks
  const { dataSources, getDataSourceMetrics } = useDataSources();
  const { scanRuleSets, getScanRuleMetrics } = useScanRuleSets();
  const { classifications, getClassificationMetrics } = useClassifications();
  const { complianceRules, getComplianceMetrics } = useComplianceRule();
  const { catalogItems, getCatalogMetrics } = useAdvancedCatalog();
  const { scanJobs, getScanMetrics } = useScanLogic();
  const { users, roles, getRBACMetrics } = useRBAC();
  const { 
    pipelines, 
    getPipelineMetrics,
    createPipeline,
    executePipeline,
    optimizePipeline,
    loadPipeline,
    generatePipelineFromTemplate
  } = usePipelineManager();
  const { workflows, getWorkflowMetrics } = useJobWorkflow();

  // Conversation Templates
  const defaultTemplates = useMemo(() => [
    {
      id: 'data-quality-analysis',
      name: 'Data Quality Analysis',
      description: 'Analyze data quality across all connected sources',
      category: 'analysis' as const,
      prompt: 'Please analyze the data quality across all our connected data sources. I need a comprehensive report on data completeness, accuracy, consistency, and timeliness. Include recommendations for improvement.',
      context: ['data-sources', 'scan-logic', 'advanced-catalog', 'compliance-rule'],
      expectedOutputs: ['quality-metrics', 'recommendations', 'action-plan'],
      difficulty: 'intermediate' as const,
      tags: ['data-quality', 'analysis', 'reporting', 'metrics']
    },
    {
      id: 'compliance-assessment',
      name: 'Compliance Assessment',
      description: 'Evaluate compliance status and identify risks',
      category: 'analysis' as const,
      prompt: 'Conduct a comprehensive compliance assessment for our data governance framework. Check for GDPR, CCPA, SOX, and industry-specific regulatory compliance. Highlight any violations or risks.',
      context: ['compliance-rule', 'rbac-system', 'advanced-catalog', 'scan-logic'],
      expectedOutputs: ['compliance-report', 'risk-assessment', 'remediation-plan'],
      difficulty: 'advanced' as const,
      tags: ['compliance', 'risk', 'governance', 'regulatory']
    },
    {
      id: 'performance-optimization',
      name: 'Performance Optimization',
      description: 'Optimize system performance and resource utilization',
      category: 'optimization' as const,
      prompt: 'Analyze the current system performance and provide optimization recommendations. Focus on scan efficiency, catalog performance, pipeline throughput, and resource utilization.',
      context: ['scan-logic', 'pipeline-manager', 'advanced-catalog', 'system-metrics'],
      expectedOutputs: ['performance-analysis', 'optimization-plan', 'resource-recommendations'],
      difficulty: 'advanced' as const,
      tags: ['performance', 'optimization', 'efficiency', 'resources']
    },
    {
      id: 'security-audit',
      name: 'Security Audit',
      description: 'Perform comprehensive security audit and assessment',
      category: 'analysis' as const,
      prompt: 'Execute a thorough security audit of our data governance system. Check access controls, data encryption, authentication mechanisms, and identify potential security vulnerabilities.',
      context: ['rbac-system', 'data-sources', 'compliance-rule', 'user-management'],
      expectedOutputs: ['security-report', 'vulnerability-assessment', 'security-recommendations'],
      difficulty: 'expert' as const,
      tags: ['security', 'audit', 'vulnerabilities', 'access-control']
    },
    {
      id: 'workflow-automation',
      name: 'Workflow Automation',
      description: 'Create automated workflows for common tasks',
      category: 'automation' as const,
      prompt: 'Help me create automated workflows for our most common data governance tasks. Include data ingestion, quality checking, compliance validation, and reporting processes.',
      context: ['job-workflow', 'pipeline-manager', 'scan-logic', 'compliance-rule'],
      expectedOutputs: ['workflow-designs', 'automation-scripts', 'monitoring-setup'],
      difficulty: 'intermediate' as const,
      tags: ['automation', 'workflows', 'efficiency', 'processes']
    },
    {
      id: 'data-lineage-mapping',
      name: 'Data Lineage Mapping',
      description: 'Map and visualize data lineage across systems',
      category: 'analysis' as const,
      prompt: 'Create comprehensive data lineage maps for our critical datasets. Show data flow from source to consumption, including all transformations, quality checks, and governance touchpoints.',
      context: ['advanced-catalog', 'data-sources', 'pipeline-manager', 'scan-logic'],
      expectedOutputs: ['lineage-diagrams', 'impact-analysis', 'dependency-mapping'],
      difficulty: 'intermediate' as const,
      tags: ['lineage', 'mapping', 'dependencies', 'visualization']
    },
    {
      id: 'cost-optimization',
      name: 'Cost Optimization',
      description: 'Analyze and optimize operational costs',
      category: 'optimization' as const,
      prompt: 'Analyze our current operational costs for data governance activities. Identify areas for cost reduction and optimization while maintaining quality and compliance standards.',
      context: ['system-metrics', 'pipeline-manager', 'scan-logic', 'resource-usage'],
      expectedOutputs: ['cost-analysis', 'savings-opportunities', 'optimization-roadmap'],
      difficulty: 'advanced' as const,
      tags: ['cost', 'optimization', 'efficiency', 'budgeting']
    },
    {
      id: 'data-discovery',
      name: 'Data Discovery Session',
      description: 'Discover and catalog new data assets',
      category: 'analysis' as const,
      prompt: 'Help me discover and catalog new data assets in our environment. Analyze data sources, identify sensitive information, apply appropriate classifications, and update our data catalog.',
      context: ['scan-logic', 'classifications', 'advanced-catalog', 'data-sources'],
      expectedOutputs: ['discovery-results', 'classification-recommendations', 'catalog-updates'],
      difficulty: 'beginner' as const,
      tags: ['discovery', 'cataloging', 'classification', 'inventory']
    }
  ], []);

  // Knowledge Base Items
  const defaultKnowledgeBase = useMemo(() => [
    {
      id: 'data-governance-concepts',
      title: 'Data Governance Fundamentals',
      category: 'concepts' as const,
      content: 'Data governance is a collection of processes, roles, policies, standards, and metrics that ensure the effective and efficient use of information in enabling an organization to achieve its goals.',
      tags: ['governance', 'fundamentals', 'concepts', 'policies'],
      relevanceScore: 0.95,
      lastUpdated: new Date().toISOString(),
      sources: ['DAMA-DMBOK', 'ISO 8000', 'DCAM'],
      relatedTopics: ['data-quality', 'compliance', 'metadata-management']
    },
    {
      id: 'data-classification-guide',
      title: 'Data Classification Best Practices',
      category: 'best-practices' as const,
      content: 'Data classification involves categorizing data based on its type, sensitivity, and the impact to the organization should it be disclosed, altered, or destroyed without authorization.',
      tags: ['classification', 'security', 'best-practices', 'sensitivity'],
      relevanceScore: 0.92,
      lastUpdated: new Date().toISOString(),
      sources: ['NIST Framework', 'ISO 27001', 'GDPR Guidelines'],
      relatedTopics: ['data-security', 'compliance', 'risk-management']
    },
    {
      id: 'scan-optimization-tips',
      title: 'Data Scan Optimization Techniques',
      category: 'procedures' as const,
      content: 'Optimize data scanning performance through proper indexing, parallel processing, intelligent sampling, and incremental scan strategies.',
      tags: ['scanning', 'optimization', 'performance', 'efficiency'],
      relevanceScore: 0.88,
      lastUpdated: new Date().toISOString(),
      sources: ['Performance Tuning Guide', 'Best Practices Manual'],
      relatedTopics: ['performance-tuning', 'resource-optimization', 'scalability']
    },
    {
      id: 'compliance-frameworks',
      title: 'Understanding Compliance Frameworks',
      category: 'concepts' as const,
      content: 'Overview of major compliance frameworks including GDPR, CCPA, HIPAA, SOX, and industry-specific regulations with implementation guidance.',
      tags: ['compliance', 'frameworks', 'regulation', 'implementation'],
      relevanceScore: 0.94,
      lastUpdated: new Date().toISOString(),
      sources: ['Regulatory Bodies', 'Legal Guidelines', 'Compliance Handbooks'],
      relatedTopics: ['regulatory-compliance', 'risk-management', 'audit-preparation']
    },
    {
      id: 'api-integration-guide',
      title: 'SPA Integration API Reference',
      category: 'apis' as const,
      content: 'Complete API reference for integrating with all data governance SPAs including authentication, endpoints, parameters, and response formats.',
      tags: ['api', 'integration', 'reference', 'endpoints'],
      relevanceScore: 0.90,
      lastUpdated: new Date().toISOString(),
      sources: ['API Documentation', 'Integration Guides', 'SDK Reference'],
      relatedTopics: ['development', 'integration', 'automation', 'workflows']
    }
  ], []);

  // Initialize component
  useEffect(() => {
    if (initialPrompt) {
      setInputMessage(initialPrompt);
    }
    loadConversationTemplates();
    loadKnowledgeBase();
    initializeVoiceRecognition();
    initializeTextToSpeech();
    loadAIAnalytics();
    createNewConversation();
    trackActivity('ai-chat-opened', { component: 'QuickAIChat' });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Context data processing
  useEffect(() => {
    if (contextData && realTimeAnalysis) {
      processContextData(contextData);
    }
  }, [contextData, realTimeAnalysis]);

  // Load conversation templates
  const loadConversationTemplates = useCallback(async () => {
    try {
      const fetchedTemplates = await getConversationSuggestions();
      setConversationTemplates([...defaultTemplates, ...fetchedTemplates]);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setConversationTemplates(defaultTemplates);
    }
  }, [defaultTemplates]);

  // Load knowledge base
  const loadKnowledgeBase = useCallback(async () => {
    try {
      const fetchedKB = await getKnowledgeBase();
      setKnowledgeBase([...defaultKnowledgeBase, ...fetchedKB]);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      setKnowledgeBase(defaultKnowledgeBase);
    }
  }, [defaultKnowledgeBase]);

  // Load AI analytics
  const loadAIAnalytics = useCallback(async () => {
    try {
      const analytics = await getAIAnalytics();
      setAIAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load AI analytics:', error);
    }
  }, []);

  // Initialize voice recognition
  const initializeVoiceRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceRecognition.language;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setVoiceRecognition(prev => ({
          ...prev,
          transcript: finalTranscript || interimTranscript,
          confidence: event.results[event.results.length - 1][0].confidence || 0
        }));

        if (finalTranscript) {
          setInputMessage(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setVoiceRecognition(prev => ({
          ...prev,
          error: event.error,
          isRecording: false
        }));
      };

      recognitionRef.current.onend = () => {
        setVoiceRecognition(prev => ({
          ...prev,
          isRecording: false
        }));
      };
    }
  }, [voiceRecognition.language]);

  // Initialize text to speech
  const initializeTextToSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Create new conversation
  const createNewConversation = useCallback(() => {
    const newConversationId = `conv-${Date.now()}`;
    setConversationId(newConversationId);
    setMessages([
      {
        id: 'welcome',
        type: 'assistant',
        content: `Hello! I'm your AI assistant for data governance. I can help you with analysis, optimization, troubleshooting, and automation across all your data governance SPAs. What would you like to explore today?`,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 1.0,
          context: {
            user: {
              id: currentUser?.id || '',
              role: currentUser?.role || '',
              permissions: userPermissions || [],
              preferences: {},
              activity: {
                recentActions: [],
                frequentSPAs: [],
                currentSession: {}
              }
            },
            workspace: {
              id: currentWorkspace?.id || '',
              name: currentWorkspace?.name || '',
              type: currentWorkspace?.type || '',
              resources: [],
              metrics: {}
            },
            system: {
              activeSPAs: [],
              health: {},
              performance: {},
              alerts: [],
              recentEvents: []
            },
            conversation: {
              topic: 'welcome',
              intent: 'greeting',
              entities: [],
              sentiment: 'neutral',
              complexity: 1
            }
          }
        }
      }
    ]);
  }, [currentUser, currentWorkspace, userPermissions]);

  // Process context data
  const processContextData = useCallback(async (data: any) => {
    if (!proactiveInsights) return;

    try {
      const insights = await generateInsights(data);
      if (insights && insights.length > 0) {
        const proactiveMessage: AIMessage = {
          id: `insight-${Date.now()}`,
          type: 'assistant',
          content: `I've analyzed the current context and found some insights that might interest you:`,
          timestamp: new Date().toISOString(),
          metadata: {
            insights,
            confidence: 0.85,
            context: aiContext
          }
        };
        
        setMessages(prev => [...prev, proactiveMessage]);
      }
    } catch (error) {
      console.error('Failed to process context data:', error);
    }
  }, [proactiveInsights, generateInsights, aiContext]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Gather context for AI processing
      const context = await gatherAIContext();
      
      // Process natural language
      const nlpResult = await processNaturalLanguage(userMessage.content, {
        context,
        mode: aiMode,
        personality: aiPersonality,
        responseLength,
        crossSPAIntegration,
        confidenceThreshold
      });

      // Generate AI response
      const aiResponse: AIMessage = {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: nlpResult.response,
        timestamp: new Date().toISOString(),
        metadata: {
          tokens: nlpResult.tokens,
          confidence: nlpResult.confidence,
          sources: nlpResult.sources,
          recommendations: nlpResult.recommendations,
          actions: nlpResult.actions,
          insights: nlpResult.insights,
          context: nlpResult.context
        }
      };

      setMessages(prev => [...prev, aiResponse]);

      // Text to speech
      if (textToSpeech.enabled) {
        speakMessage(aiResponse.content);
      }

      // Track activity
      trackActivity('ai-message-sent', {
        conversationId,
        messageLength: userMessage.content.length,
        responseTime: Date.now() - new Date(userMessage.timestamp).getTime(),
        confidence: nlpResult.confidence,
        mode: aiMode
      });

      // Auto-save conversation
      if (conversationId && messages.length > 0) {
        await saveConversation(conversationId, {
          messages: [...messages, userMessage, aiResponse],
          metadata: {
            mode: aiMode,
            context,
            analytics: {
              totalMessages: messages.length + 2,
              avgConfidence: nlpResult.confidence,
              lastUpdated: new Date().toISOString()
            }
          }
        });
      }

    } catch (error) {
      console.error('Failed to process message:', error);
      
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString(),
        metadata: {
          error: (error as Error).message,
          confidence: 0
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputMessage,
    isLoading,
    aiMode,
    aiPersonality,
    responseLength,
    crossSPAIntegration,
    confidenceThreshold,
    textToSpeech.enabled,
    conversationId,
    messages,
    processNaturalLanguage,
    saveConversation,
    trackActivity
  ]);

  // Gather AI context
  const gatherAIContext = useCallback(async () => {
    const context: AIContext = {
      user: {
        id: currentUser?.id || '',
        role: currentUser?.role || '',
        permissions: userPermissions || [],
        preferences: await getUserPreferences() || {},
        activity: {
          recentActions: await getUserActivity() || [],
          frequentSPAs: [],
          currentSession: {}
        }
      },
      workspace: {
        id: currentWorkspace?.id || '',
        name: currentWorkspace?.name || '',
        type: currentWorkspace?.type || '',
        resources: await getWorkspaceResources() || [],
        metrics: await getWorkspaceMetrics() || {}
      },
      system: {
        activeSPAs: Object.keys(await getSPAStatus()),
        health: {},
        performance: await getCrossGroupMetrics() || {},
        alerts: [],
        recentEvents: await getActivityHistory() || []
      },
      conversation: {
        topic: 'general',
        intent: 'unknown',
        entities: [],
        sentiment: 'neutral',
        complexity: 1
      }
    };

    // Add cross-SPA data if enabled
    if (crossSPAIntegration) {
      try {
        const crossData = await analyzeCrossGroupData();
        context.system.performance = { ...context.system.performance, ...crossData };
      } catch (error) {
        console.error('Failed to gather cross-SPA data:', error);
      }
    }

    return context;
  }, [
    currentUser,
    currentWorkspace,
    userPermissions,
    crossSPAIntegration,
    getUserPreferences,
    getUserActivity,
    getWorkspaceResources,
    getWorkspaceMetrics,
    getSPAStatus,
    getCrossGroupMetrics,
    getActivityHistory,
    analyzeCrossGroupData
  ]);

  // Handle voice recording
  const handleVoiceRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (voiceRecognition.isRecording) {
      recognitionRef.current.stop();
      setVoiceRecognition(prev => ({ ...prev, isRecording: false }));
    } else {
      setVoiceRecognition(prev => ({ ...prev, isRecording: true, error: undefined }));
      recognitionRef.current.start();
    }
  }, [voiceRecognition.isRecording]);

  // Speak message
  const speakMessage = useCallback((text: string) => {
    if (!synthesisRef.current || !textToSpeech.enabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synthesisRef.current.getVoices().find((voice: any) => 
      voice.name === textToSpeech.voice
    ) || null;
    utterance.rate = textToSpeech.rate;
    utterance.pitch = textToSpeech.pitch;
    utterance.volume = textToSpeech.volume;

    synthesisRef.current.speak(utterance);
  }, [textToSpeech]);

  // Handle template selection
  const handleTemplateSelection = useCallback((template: ConversationTemplate) => {
    setSelectedTemplate(template);
    setInputMessage(template.prompt);
    setAIMode(template.category as any);
    
    // Set appropriate context based on template
    if (contextMode === 'auto') {
      setSelectedContext(template.context);
    }
  }, [contextMode]);

  // Handle message reaction
  const handleMessageReaction = useCallback(async (messageId: string, reaction: any) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: { ...msg.reactions, ...reaction } }
        : msg
    ));

    // Send feedback to AI system
    try {
      await validateAIResponse(messageId, reaction);
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  }, [validateAIResponse]);

  // Handle action execution
  const handleActionExecution = useCallback(async (action: AIAction) => {
    try {
      let result;
      
      switch (action.type) {
        case 'spa-action':
          result = await coordinateExecution(action.execution.spaTarget!, action.execution.method, action.parameters);
          break;
        case 'workflow':
          result = await generateWorkflow(action.parameters);
          break;
        case 'pipeline':
          // Handle pipeline actions
          if (action.execution?.method === 'create') {
            result = await createPipeline({
              name: action.parameters.name || 'AI Generated Pipeline',
              description: action.parameters.description || 'Pipeline created by AI Assistant',
              stages: action.parameters.stages || [],
              workspace: currentWorkspace?.id,
              template: action.parameters.template,
              ...action.parameters
            });
          } else if (action.execution?.method === 'execute') {
            result = await executePipeline(
              action.parameters.pipelineId,
              action.parameters.executionParameters
            );
          } else if (action.execution?.method === 'optimize') {
            result = await optimizePipeline(
              action.parameters.pipelineId,
              action.parameters.optimizationConfig
            );
          } else if (action.execution?.method === 'load') {
            result = await loadPipeline(action.parameters.pipelineId);
          } else if (action.execution?.method === 'generateFromTemplate') {
            result = await generatePipelineFromTemplate(
              action.parameters.templateId,
              action.parameters.templateParameters
            );
          } else {
            throw new Error(`Unsupported pipeline method: ${action.execution?.method}`);
          }
          break;
        case 'analysis':
          result = await analyzePerformance(action.parameters);
          break;
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }

      // Add result message
      const resultMessage: AIMessage = {
        id: `result-${Date.now()}`,
        type: 'assistant',
        content: `Action "${action.title}" executed successfully. ${result.summary || 'Operation completed.'}`,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 1.0,
          actions: [{ ...action, result }]
        }
      };

      setMessages(prev => [...prev, resultMessage]);
      
      trackActivity('ai-action-executed', {
        actionType: action.type,
        actionId: action.id,
        success: true
      });

    } catch (error) {
      console.error('Failed to execute action:', error);
      
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `Failed to execute action "${action.title}": ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        metadata: {
          error: (error as Error).message,
          confidence: 0
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [coordinateExecution, generateWorkflow, analyzePerformance, trackActivity]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return conversationTemplates.filter(template => {
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      const matchesSearch = !searchQuery || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [conversationTemplates, filterCategory, searchQuery]);

  // Filter knowledge base
  const filteredKnowledgeBase = useMemo(() => {
    return knowledgeBase.filter(item => {
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [knowledgeBase, filterCategory, searchQuery]);

  // Render message
  const renderMessage = useCallback((message: AIMessage) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          {!isUser && !isSystem && (
            <div className="flex items-center mb-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src="/ai-avatar.png" />
                <AvatarFallback>
                  <Brain className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">AI Assistant</span>
              {message.metadata?.confidence && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {Math.round(message.metadata.confidence * 100)}% confident
                </Badge>
              )}
            </div>
          )}
          
          <Card className={`${
            isUser ? 'bg-primary text-primary-foreground' : 
            isSystem ? 'bg-yellow-50 border-yellow-200' : 'bg-background'
          }`}>
            <CardContent className="p-3">
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              
              {/* Metadata Display */}
              {message.metadata && !isUser && (
                <div className="mt-3 space-y-2">
                  {/* Recommendations */}
                  {message.metadata.recommendations && message.metadata.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-2 flex items-center">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Recommendations
                      </h5>
                      <div className="space-y-2">
                        {message.metadata.recommendations.map((rec, index) => (
                          <Card key={index} className="p-2 bg-muted/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h6 className="text-xs font-medium">{rec.title}</h6>
                                <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                                <div className="flex items-center mt-2 space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {rec.priority}
                                  </Badge>
                                  <span className="text-xs text-green-600">
                                    +{rec.impact.improvement}% {rec.impact.metric}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {message.metadata.actions && message.metadata.actions.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-2 flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        Quick Actions
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {message.metadata.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleActionExecution(action)}
                            className="text-xs"
                          >
                            <action.icon className="h-3 w-3 mr-1" />
                            {action.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {message.metadata.insights && message.metadata.insights.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-2 flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        Insights
                      </h5>
                      <div className="space-y-1">
                        {message.metadata.insights.map((insight, index) => (
                          <div key={index} className="p-2 bg-muted/30 rounded text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{insight.title}</span>
                              <Badge variant={
                                insight.severity === 'error' ? 'destructive' :
                                insight.severity === 'warning' ? 'default' :
                                insight.severity === 'success' ? 'default' : 'secondary'
                              } className="text-xs">
                                {insight.category}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {message.metadata.sources && message.metadata.sources.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-1 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Sources
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {message.metadata.sources.map((source, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Debug Info */}
                  {showDebugMode && message.metadata.context && (
                    <details className="mt-2">
                      <summary className="text-xs font-medium cursor-pointer">
                        Debug Information
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(message.metadata.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Message Actions */}
              {!isUser && !isSystem && (
                <div className="flex items-center justify-between mt-3 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessageReaction(message.id, { helpful: true })}
                      className="h-6 px-2"
                    >
                      <ThumbsUp className={`h-3 w-3 ${
                        message.reactions?.helpful ? 'text-green-600' : ''
                      }`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessageReaction(message.id, { helpful: false })}
                      className="h-6 px-2"
                    >
                      <ThumbsDown className={`h-3 w-3 ${
                        message.reactions?.helpful === false ? 'text-red-600' : ''
                      }`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(message.content)}
                      className="h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {textToSpeech.enabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakMessage(message.content)}
                        className="h-6 px-2"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }, [
    showDebugMode,
    textToSpeech.enabled,
    handleMessageReaction,
    handleActionExecution,
    speakMessage
  ]);

  // Main render
  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 bg-background border rounded-lg shadow-lg flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <p className="text-sm text-muted-foreground">
                  Context-aware data governance intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* AI Mode Selector */}
              <Select value={aiMode} onValueChange={(value) => setAIMode(value as any)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                </SelectContent>
              </Select>

              {/* Settings */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Templates & Knowledge */}
            <div className="w-80 border-r bg-muted/30 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 m-2">
                  <TabsTrigger value="conversation" className="text-xs">Chat</TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
                  <TabsTrigger value="knowledge" className="text-xs">Knowledge</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  {/* Conversation Tab */}
                  <TabsContent value="conversation" className="h-full m-0 p-2">
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        {/* Quick Suggestions */}
                        {showSuggestions && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Quick Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {[
                                'Analyze data quality across all sources',
                                'Check compliance status',
                                'Optimize scan performance',
                                'Generate data lineage map',
                                'Create automated workflow'
                              ].map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setInputMessage(suggestion)}
                                  className="w-full justify-start text-xs"
                                >
                                  <Sparkles className="h-3 w-3 mr-2" />
                                  {suggestion}
                                </Button>
                              ))}
                            </CardContent>
                          </Card>
                        )}

                        {/* Context Display */}
                        {showContextPanel && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Current Context</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="text-xs">
                                <p><strong>User:</strong> {currentUser?.name || 'Unknown'}</p>
                                <p><strong>Role:</strong> {currentUser?.role || 'Unknown'}</p>
                                <p><strong>Workspace:</strong> {currentWorkspace?.name || 'Default'}</p>
                                <p><strong>Mode:</strong> {aiMode}</p>
                              </div>
                              {selectedContext.length > 0 && (
                                <div>
                                  <Label className="text-xs">Active Context:</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedContext.map((ctx, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {ctx}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Recent Conversations */}
                        {savedConversations.length > 0 && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Recent Conversations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {savedConversations.slice(0, 5).map((conv, index) => (
                                <div
                                  key={index}
                                  className="p-2 rounded border cursor-pointer hover:bg-muted/50 text-xs"
                                  onClick={() => loadConversation(conv.id)}
                                >
                                  <p className="font-medium truncate">{conv.title}</p>
                                  <p className="text-muted-foreground truncate">{conv.preview}</p>
                                  <p className="text-muted-foreground">
                                    {new Date(conv.lastUpdated).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Templates Tab */}
                  <TabsContent value="templates" className="h-full m-0 p-2">
                    <div className="space-y-3 h-full flex flex-col">
                      {/* Template Filters */}
                      <div className="space-y-2">
                        <Input
                          placeholder="Search templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                            <SelectItem value="optimization">Optimization</SelectItem>
                            <SelectItem value="analysis">Analysis</SelectItem>
                            <SelectItem value="learning">Learning</SelectItem>
                            <SelectItem value="automation">Automation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Template List */}
                      <ScrollArea className="flex-1">
                        <div className="space-y-2">
                          {filteredTemplates.map((template) => (
                            <Card 
                              key={template.id} 
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleTemplateSelection(template)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-xs font-medium">{template.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {template.difficulty}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {template.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {template.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  {/* Knowledge Tab */}
                  <TabsContent value="knowledge" className="h-full m-0 p-2">
                    <div className="space-y-3 h-full flex flex-col">
                      {/* Knowledge Filters */}
                      <div className="space-y-2">
                        <Input
                          placeholder="Search knowledge base..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="concepts">Concepts</SelectItem>
                            <SelectItem value="procedures">Procedures</SelectItem>
                            <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                            <SelectItem value="best-practices">Best Practices</SelectItem>
                            <SelectItem value="apis">APIs</SelectItem>
                            <SelectItem value="integrations">Integrations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Knowledge List */}
                      <ScrollArea className="flex-1">
                        <div className="space-y-2">
                          {filteredKnowledgeBase.map((item) => (
                            <Card 
                              key={item.id} 
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setInputMessage(`Tell me about: ${item.title}`)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-xs font-medium">{item.title}</h4>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs">{(item.relevanceScore * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {item.content}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="max-w-[80%]">
                        <Card className="bg-background">
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-muted-foreground">AI is thinking...</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="space-y-3">
                  {/* Voice Recognition Status */}
                  {voiceRecognition.isRecording && (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-700">Recording...</span>
                          {voiceRecognition.transcript && (
                            <span className="text-xs text-muted-foreground">
                              "{voiceRecognition.transcript}"
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Input Controls */}
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about your data governance..."
                        className="min-h-[60px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {/* Voice Recording */}
                      <Button
                        variant={voiceRecognition.isRecording ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={handleVoiceRecording}
                        disabled={!recognitionRef.current}
                      >
                        {voiceRecognition.isRecording ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Send Message */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>Press Cmd/Ctrl + Enter to send</span>
                      <div className="flex items-center space-x-2">
                        <span>Mode:</span>
                        <Badge variant="outline" className="text-xs">
                          {aiMode}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {textToSpeech.enabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTextToSpeech(prev => ({ ...prev, enabled: false }))}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDebugMode(!showDebugMode)}
                      >
                        <Terminal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Settings */}
            {showSettingsPanel && (
              <div className="w-80 border-l bg-muted/30 p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">AI Settings</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettingsPanel(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* AI Personality */}
                    <div>
                      <Label className="text-xs">AI Personality</Label>
                      <Select value={aiPersonality} onValueChange={(value) => setAIPersonality(value as any)}>
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Response Length */}
                    <div>
                      <Label className="text-xs">Response Length</Label>
                      <Select value={responseLength} onValueChange={(value) => setResponseLength(value as any)}>
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concise">Concise</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Confidence Threshold */}
                    <div>
                      <Label className="text-xs">Confidence Threshold</Label>
                      <Slider
                        value={[confidenceThreshold]}
                        onValueChange={([value]) => setConfidenceThreshold(value)}
                        max={1}
                        min={0}
                        step={0.1}
                        className="mt-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(confidenceThreshold * 100)}%
                      </span>
                    </div>

                    {/* Feature Toggles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Text to Speech</Label>
                        <Switch
                          checked={textToSpeech.enabled}
                          onCheckedChange={(checked) => setTextToSpeech(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Auto Suggestions</Label>
                        <Switch
                          checked={autoSuggestMode}
                          onCheckedChange={setAutoSuggestMode}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Real-time Analysis</Label>
                        <Switch
                          checked={realTimeAnalysis}
                          onCheckedChange={setRealTimeAnalysis}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Cross-SPA Integration</Label>
                        <Switch
                          checked={crossSPAIntegration}
                          onCheckedChange={setCrossSPAIntegration}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Proactive Insights</Label>
                        <Switch
                          checked={proactiveInsights}
                          onCheckedChange={setProactiveInsights}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Debug Mode</Label>
                        <Switch
                          checked={showDebugMode}
                          onCheckedChange={setShowDebugMode}
                        />
                      </div>
                    </div>

                    {/* Voice Settings */}
                    {textToSpeech.enabled && (
                      <div className="space-y-3">
                        <Separator />
                        <h4 className="text-xs font-medium">Voice Settings</h4>
                        
                        <div>
                          <Label className="text-xs">Speech Rate</Label>
                          <Slider
                            value={[textToSpeech.rate]}
                            onValueChange={([value]) => setTextToSpeech(prev => ({ ...prev, rate: value }))}
                            max={2}
                            min={0.5}
                            step={0.1}
                            className="mt-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            {textToSpeech.rate}x
                          </span>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Volume</Label>
                          <Slider
                            value={[textToSpeech.volume]}
                            onValueChange={([value]) => setTextToSpeech(prev => ({ ...prev, volume: value }))}
                            max={1}
                            min={0}
                            step={0.1}
                            className="mt-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(textToSpeech.volume * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Analytics */}
                    {aiAnalytics && (
                      <div className="space-y-3">
                        <Separator />
                        <h4 className="text-xs font-medium">Analytics</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Total Conversations:</span>
                            <span>{aiAnalytics.totalConversations}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Satisfaction Score:</span>
                            <span>{aiAnalytics.satisfactionScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Response Time:</span>
                            <span>{aiAnalytics.avgResponseTime}ms</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default QuickAIChat;