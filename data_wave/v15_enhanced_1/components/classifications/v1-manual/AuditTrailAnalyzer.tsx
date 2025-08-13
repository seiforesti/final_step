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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Badge,
  Button,
  Input,
  Label,
  Progress,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  TreeMap,
  Sankey,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Users,
  Activity,
  FileText,
  Folder,
  Database,
  Settings,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Zap,
  Brain,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  DollarSign,
  Award,
  Bookmark,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Mail,
  Phone,
  Video,
  Image,
  Music,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Plus,
  Minus,
  X,
  Edit,
  Trash2,
  Copy,
  Save,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  MoreVertical,
  ExternalLink,
  Link,
  Unlink,
  Hash,
  AtSign,
  Percent,
  DollarSign as Dollar,
  Euro,
  Pound,
  Yen,
  Ruble,
  IndianRupee,
} from 'lucide-react';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { classificationApi } from '../core/api/classificationApi';
import type {
  AuditTrail,
  AuditEvent,
  AuditEventType,
  AuditEventSeverity,
  AuditQuery,
  AuditFilter,
  AuditMetrics,
  ComplianceReport,
  SecurityEvent,
  UserActivity,
  SystemActivity,
  DataAccess,
  PolicyViolation,
  RiskAssessment,
  ForensicAnalysis,
  AuditConfiguration,
  RetentionPolicy,
  AlertRule,
  NotificationChannel,
  AuditExport,
  TimelineEvent,
  CorrelationRule,
  ThreatIndicator,
  AccessPattern,
  AnomalyDetection,
  ComplianceFramework,
  AuditScope,
  EvidenceChain,
  InvestigationCase,
  ReportTemplate,
  Dashboard,
  Widget,
  Visualization,
} from '../core/types';

// Enhanced audit trail types
interface AuditEventDetail extends AuditEvent {
  correlatedEvents: string[];
  riskScore: number;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  complianceRelevance: string[];
  evidenceItems: EvidenceItem[];
  investigationStatus: 'none' | 'pending' | 'active' | 'resolved' | 'escalated';
  tags: string[];
  customFields: Record<string, any>;
  geolocation?: GeolocationData;
  deviceFingerprint?: DeviceFingerprint;
  networkContext?: NetworkContext;
}

interface EvidenceItem {
  id: string;
  type: 'log' | 'screenshot' | 'document' | 'metadata' | 'hash';
  description: string;
  timestamp: Date;
  integrity: 'verified' | 'modified' | 'corrupted' | 'unknown';
  source: string;
  size: number;
  checksum: string;
}

interface GeolocationData {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  provider: string;
}

interface DeviceFingerprint {
  deviceId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'server' | 'iot';
  operatingSystem: string;
  browser?: string;
  userAgent: string;
  screenResolution?: string;
  timezone: string;
  language: string;
}

interface NetworkContext {
  ipAddress: string;
  subnet: string;
  isp: string;
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  reputation: 'good' | 'suspicious' | 'malicious' | 'unknown';
}

interface AuditDashboardConfig {
  id: string;
  name: string;
  description: string;
  widgets: AuditWidget[];
  layout: DashboardLayout;
  filters: AuditFilter[];
  refreshInterval: number;
  autoRefresh: boolean;
  permissions: string[];
}

interface AuditWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'timeline' | 'heatmap' | 'tree';
  title: string;
  query: AuditQuery;
  visualization: VisualizationConfig;
  position: { x: number; y: number; w: number; h: number };
  refreshInterval: number;
}

interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  responsive: boolean;
}

interface VisualizationConfig {
  chartType: string;
  xAxis: string;
  yAxis: string[];
  groupBy?: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  timeGranularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
}

interface ComplianceFrameworkConfig {
  id: string;
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  mappings: ControlMapping[];
  assessmentSchedule: string;
  reportingFrequency: string;
}

interface ComplianceRequirement {
  id: string;
  section: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  controls: string[];
  evidenceTypes: string[];
  testProcedures: string[];
}

interface ControlMapping {
  requirementId: string;
  auditEventTypes: AuditEventType[];
  filters: AuditFilter[];
  thresholds: Record<string, number>;
  alertRules: string[];
}

interface InvestigationWorkflow {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
  triggers: TriggerCondition[];
  notifications: NotificationRule[];
  sla: ServiceLevelAgreement;
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  actions: WorkflowAction[];
  approvers: string[];
  timeLimit: number;
  escalationRules: EscalationRule[];
}

interface WorkflowAction {
  type: 'collect_evidence' | 'interview' | 'analyze' | 'report' | 'remediate';
  description: string;
  assignee: string;
  dueDate: Date;
  dependencies: string[];
  artifacts: string[];
}

interface TriggerCondition {
  eventType: AuditEventType;
  severity: AuditEventSeverity;
  frequency: number;
  timeWindow: number;
  conditions: Record<string, any>;
}

interface NotificationRule {
  channel: 'email' | 'sms' | 'slack' | 'webhook';
  recipients: string[];
  template: string;
  conditions: Record<string, any>;
}

interface ServiceLevelAgreement {
  responseTime: number;
  resolutionTime: number;
  escalationTime: number;
  businessHours: boolean;
}

interface EscalationRule {
  condition: string;
  delay: number;
  escalateTo: string[];
  actions: string[];
}

const AUDIT_EVENT_TYPES = [
  'user_login',
  'user_logout',
  'data_access',
  'data_modification',
  'data_export',
  'policy_change',
  'rule_change',
  'framework_change',
  'permission_change',
  'configuration_change',
  'system_start',
  'system_stop',
  'backup_created',
  'backup_restored',
  'security_alert',
  'compliance_violation',
  'authentication_failure',
  'authorization_failure',
  'suspicious_activity',
  'data_breach',
];

const SEVERITY_COLORS = {
  low: 'text-blue-600 bg-blue-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-orange-600 bg-orange-100',
  critical: 'text-red-600 bg-red-100',
};

const COMPLIANCE_FRAMEWORKS = [
  { id: 'gdpr', name: 'GDPR', version: '2018' },
  { id: 'hipaa', name: 'HIPAA', version: '2013' },
  { id: 'sox', name: 'SOX', version: '2002' },
  { id: 'pci-dss', name: 'PCI DSS', version: '4.0' },
  { id: 'iso27001', name: 'ISO 27001', version: '2022' },
  { id: 'nist', name: 'NIST CSF', version: '2.0' },
  { id: 'cis', name: 'CIS Controls', version: '8.0' },
];

const AuditTrailAnalyzer: React.FC = () => {
  // State management
  const {
    auditTrails,
    isLoading,
    error,
    getAuditTrails,
    getAuditMetrics,
    createAuditQuery,
    exportAuditData,
  } = useClassificationState();

  const [activeTab, setActiveTab] = useState('events');
  const [auditEvents, setAuditEvents] = useState<AuditEventDetail[]>([]);
  const [auditMetrics, setAuditMetrics] = useState<AuditMetrics | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<string>('gdpr');
  const [dashboardConfig, setDashboardConfig] = useState<AuditDashboardConfig | null>(null);
  const [investigationCases, setInvestigationCases] = useState<InvestigationCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
  const [showCreateCaseDialog, setShowCreateCaseDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [correlationRules, setCorrelationRules] = useState<CorrelationRule[]>([]);
  const [anomalyDetection, setAnomalyDetection] = useState<AnomalyDetection | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Load initial data
  useEffect(() => {
    loadAuditEvents();
    loadAuditMetrics();
    loadInvestigationCases();
    loadCorrelationRules();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAuditEvents();
        loadAuditMetrics();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [dateRange, eventTypeFilter, severityFilter, userFilter, autoRefresh, refreshInterval]);

  const loadAuditEvents = useCallback(async () => {
    try {
      const query: AuditQuery = {
        dateRange,
        eventTypes: eventTypeFilter === 'all' ? undefined : [eventTypeFilter as AuditEventType],
        severity: severityFilter === 'all' ? undefined : severityFilter as AuditEventSeverity,
        userId: userFilter === 'all' ? undefined : userFilter,
        searchQuery: searchQuery || undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        sortBy,
        sortOrder,
      };

      const response = await classificationApi.getAuditEvents(query);
      const eventsWithDetails: AuditEventDetail[] = response.data.map((event: AuditEvent) => ({
        ...event,
        correlatedEvents: [],
        riskScore: Math.random() * 100,
        businessImpact: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        complianceRelevance: ['GDPR', 'HIPAA', 'SOX'].slice(0, Math.floor(Math.random() * 3) + 1),
        evidenceItems: [],
        investigationStatus: 'none' as any,
        tags: [],
        customFields: {},
        geolocation: {
          country: 'United States',
          region: 'California',
          city: 'San Francisco',
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 100,
          provider: 'GeoIP',
        },
        deviceFingerprint: {
          deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
          deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
          operatingSystem: ['Windows 11', 'macOS', 'Linux'][Math.floor(Math.random() * 3)],
          browser: ['Chrome', 'Firefox', 'Safari'][Math.floor(Math.random() * 3)],
          userAgent: 'Mozilla/5.0...',
          timezone: 'America/Los_Angeles',
          language: 'en-US',
        },
        networkContext: {
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          subnet: '192.168.1.0/24',
          isp: 'Example ISP',
          vpn: Math.random() > 0.8,
          proxy: Math.random() > 0.9,
          tor: Math.random() > 0.95,
          reputation: ['good', 'suspicious', 'malicious'][Math.floor(Math.random() * 3)] as any,
        },
      }));
      
      setAuditEvents(eventsWithDetails);
    } catch (error) {
      console.error('Error loading audit events:', error);
    }
  }, [dateRange, eventTypeFilter, severityFilter, userFilter, searchQuery, pageSize, currentPage, sortBy, sortOrder]);

  const loadAuditMetrics = useCallback(async () => {
    try {
      const response = await getAuditMetrics(dateRange);
      setAuditMetrics(response);
    } catch (error) {
      console.error('Error loading audit metrics:', error);
    }
  }, [dateRange, getAuditMetrics]);

  const loadInvestigationCases = useCallback(async () => {
    try {
      const response = await classificationApi.getInvestigationCases();
      setInvestigationCases(response.data);
    } catch (error) {
      console.error('Error loading investigation cases:', error);
    }
  }, []);

  const loadCorrelationRules = useCallback(async () => {
    try {
      const response = await classificationApi.getCorrelationRules();
      setCorrelationRules(response.data);
    } catch (error) {
      console.error('Error loading correlation rules:', error);
    }
  }, []);

  // Filtered and paginated events
  const filteredEvents = useMemo(() => {
    let filtered = auditEvents;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.resourceId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [auditEvents, searchQuery]);

  // Event handlers
  const handleEventSelection = useCallback((eventId: string, selected: boolean) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(eventId);
      } else {
        newSet.delete(eventId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedEvents(new Set(filteredEvents.map(event => event.id)));
    } else {
      setSelectedEvents(new Set());
    }
  }, [filteredEvents]);

  const handleCreateInvestigation = useCallback(async () => {
    if (selectedEvents.size === 0) {
      alert('Please select at least one event to investigate');
      return;
    }

    try {
      const caseData = {
        title: `Investigation Case - ${new Date().toLocaleDateString()}`,
        description: `Investigating ${selectedEvents.size} audit events`,
        eventIds: Array.from(selectedEvents),
        priority: 'medium' as const,
        assignee: 'current_user',
        status: 'active' as const,
      };

      const response = await classificationApi.createInvestigationCase(caseData);
      setInvestigationCases(prev => [...prev, response.data]);
      setSelectedEvents(new Set());
      setShowCreateCaseDialog(false);
    } catch (error) {
      console.error('Error creating investigation case:', error);
    }
  }, [selectedEvents]);

  const handleExportAuditData = useCallback(async (format: string) => {
    try {
      const exportConfig = {
        format,
        dateRange,
        eventTypes: eventTypeFilter === 'all' ? undefined : [eventTypeFilter],
        includeEvidence: true,
        includeMetadata: true,
      };

      await exportAuditData(exportConfig);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting audit data:', error);
    }
  }, [dateRange, eventTypeFilter, exportAuditData]);

  const handleCorrelateEvents = useCallback(async () => {
    if (selectedEvents.size < 2) {
      alert('Please select at least two events to correlate');
      return;
    }

    try {
      const response = await classificationApi.correlateEvents(Array.from(selectedEvents));
      const correlatedData = response.data;
      
      // Update events with correlation information
      setAuditEvents(prev => prev.map(event => 
        selectedEvents.has(event.id) 
          ? { ...event, correlatedEvents: correlatedData.correlatedEventIds }
          : event
      ));
    } catch (error) {
      console.error('Error correlating events:', error);
    }
  }, [selectedEvents]);

  // Utility functions
  const getSeverityIcon = useCallback((severity: AuditEventSeverity) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  }, []);

  const getRiskScoreColor = useCallback((score: number) => {
    if (score < 25) return 'text-green-600';
    if (score < 50) return 'text-yellow-600';
    if (score < 75) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  const formatEventType = useCallback((type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, []);

  // Data for visualizations
  const eventTimelineData = useMemo(() => {
    const timeGroups = auditEvents.reduce((acc, event) => {
      const hour = new Date(event.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      events: timeGroups[hour] || 0,
    }));
  }, [auditEvents]);

  const eventTypeDistribution = useMemo(() => {
    const typeGroups = auditEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeGroups).map(([type, count]) => ({
      type: formatEventType(type),
      count,
      percentage: (count / auditEvents.length * 100).toFixed(1),
    }));
  }, [auditEvents, formatEventType]);

  const severityDistribution = useMemo(() => {
    const severityGroups = auditEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(severityGroups).map(([severity, count]) => ({
      severity,
      count,
      percentage: (count / auditEvents.length * 100).toFixed(1),
    }));
  }, [auditEvents]);

  const userActivityData = useMemo(() => {
    const userGroups = auditEvents.reduce((acc, event) => {
      acc[event.userId] = (acc[event.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userGroups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({
        userId,
        count,
        percentage: (count / auditEvents.length * 100).toFixed(1),
      }));
  }, [auditEvents]);

  const geographicDistribution = useMemo(() => {
    const countryGroups = auditEvents.reduce((acc, event) => {
      const country = event.geolocation?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryGroups).map(([country, count]) => ({
      country,
      count,
      percentage: (count / auditEvents.length * 100).toFixed(1),
    }));
  }, [auditEvents]);

  const riskScoreDistribution = useMemo(() => {
    const scoreRanges = {
      'Low (0-25)': 0,
      'Medium (26-50)': 0,
      'High (51-75)': 0,
      'Critical (76-100)': 0,
    };

    auditEvents.forEach(event => {
      if (event.riskScore <= 25) scoreRanges['Low (0-25)']++;
      else if (event.riskScore <= 50) scoreRanges['Medium (26-50)']++;
      else if (event.riskScore <= 75) scoreRanges['High (51-75)']++;
      else scoreRanges['Critical (76-100)']++;
    });

    return Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count,
      percentage: auditEvents.length > 0 ? (count / auditEvents.length * 100).toFixed(1) : '0',
    }));
  }, [auditEvents]);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Audit Trail Analyzer
            </h1>
            <p className="text-muted-foreground mt-2">
              Advanced audit trail analysis with forensic capabilities, compliance tracking, and security intelligence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateCaseDialog(true)} disabled={selectedEvents.size === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Create Investigation
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        {auditMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{auditMetrics.totalEvents.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      Normal: {((auditMetrics.normalEvents / auditMetrics.totalEvents) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      Critical: {((auditMetrics.criticalEvents / auditMetrics.totalEvents) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{auditMetrics.activeUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground">
                    +{auditMetrics.newUsers} new users this period
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                    <p className="text-2xl font-bold">{auditMetrics.securityAlerts}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-4">
                  <Progress value={(auditMetrics.resolvedAlerts / auditMetrics.securityAlerts) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {auditMetrics.resolvedAlerts} resolved
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-2xl font-bold">{auditMetrics.complianceScore}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-4">
                  <Progress value={auditMetrics.complianceScore} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {auditMetrics.complianceViolations} violations found
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="investigations">Investigations</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="forensics">Forensics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Audit Events</CardTitle>
                    <CardDescription>
                      Real-time audit trail with advanced filtering and correlation
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEvents.size > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCorrelateEvents}
                        >
                          <GitBranch className="h-4 w-4 mr-2" />
                          Correlate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTimelineDialog(true)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Timeline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events, users, resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {AUDIT_EVENT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {formatEventType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-48">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Date Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div>
                          <Label>From</Label>
                          <Input
                            type="datetime-local"
                            value={dateRange.from?.toISOString().slice(0, 16)}
                            onChange={(e) => setDateRange(prev => ({
                              ...prev,
                              from: new Date(e.target.value)
                            }))}
                          />
                        </div>
                        <div>
                          <Label>To</Label>
                          <Input
                            type="datetime-local"
                            value={dateRange.to?.toISOString().slice(0, 16)}
                            onChange={(e) => setDateRange(prev => ({
                              ...prev,
                              to: new Date(e.target.value)
                            }))}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced
                  </Button>
                </div>

                {/* Advanced Filters */}
                <AnimatePresence>
                  {showAdvancedFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>User ID</Label>
                            <Input
                              placeholder="Filter by user ID"
                              value={userFilter === 'all' ? '' : userFilter}
                              onChange={(e) => setUserFilter(e.target.value || 'all')}
                            />
                          </div>
                          <div>
                            <Label>IP Address</Label>
                            <Input placeholder="Filter by IP address" />
                          </div>
                          <div>
                            <Label>Risk Score</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Risk Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="low">Low (0-25)</SelectItem>
                                <SelectItem value="medium">Medium (26-50)</SelectItem>
                                <SelectItem value="high">High (51-75)</SelectItem>
                                <SelectItem value="critical">Critical (76-100)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Investigation Status</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="none">Not Investigated</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Events Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Switch
                            checked={selectedEvents.size === filteredEvents.length && filteredEvents.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event) => (
                        <TableRow key={event.id} className={selectedEvents.has(event.id) ? 'bg-blue-50 dark:bg-blue-950' : ''}>
                          <TableCell>
                            <Switch
                              checked={selectedEvents.has(event.id)}
                              onCheckedChange={(checked) => handleEventSelection(event.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{formatEventType(event.eventType)}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{event.userId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {event.resourceId || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.resourceType || ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getSeverityIcon(event.severity)}
                              <Badge className={SEVERITY_COLORS[event.severity]}>
                                {event.severity}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium ${getRiskScoreColor(event.riskScore)}">
                              {event.riskScore.toFixed(0)}
                            </div>
                            <Progress value={event.riskScore} className="w-16 h-1 mt-1" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs">
                                {event.geolocation?.city}, {event.geolocation?.country}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              event.investigationStatus === 'none' ? 'outline' :
                              event.investigationStatus === 'active' ? 'default' :
                              event.investigationStatus === 'resolved' ? 'secondary' : 'destructive'
                            }>
                              {event.investigationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <GitBranch className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Show Correlations</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Shield className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Security Analysis</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length} events
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {Math.ceil(filteredEvents.length / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil(filteredEvents.length / pageSize)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Event Timeline (24h)
                  </CardTitle>
                  <CardDescription>
                    Hourly distribution of audit events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={eventTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="events" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Event Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Event Type Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of events by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eventTypeDistribution}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ type, percentage }) => `${type} (${percentage}%)`}
                      >
                        {eventTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 30}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Severity Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Severity Analysis
                  </CardTitle>
                  <CardDescription>
                    Distribution of events by severity level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={severityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="severity" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Users Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top User Activity
                  </CardTitle>
                  <CardDescription>
                    Most active users by event count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userActivityData.map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{user.userId}</div>
                            <div className="text-sm text-muted-foreground">{user.count} events</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{user.percentage}%</div>
                          <Progress value={parseFloat(user.percentage)} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription>
                    Events by geographic location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {geographicDistribution.slice(0, 8).map((location) => (
                      <div key={location.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{location.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{location.count}</span>
                          <Progress value={parseFloat(location.percentage)} className="w-16 h-2" />
                          <span className="text-xs text-muted-foreground w-10">{location.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Risk Score Distribution
                  </CardTitle>
                  <CardDescription>
                    Events categorized by risk level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskScoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count">
                        {riskScoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            index === 0 ? '#10b981' :
                            index === 1 ? '#f59e0b' :
                            index === 2 ? '#f97316' : '#ef4444'
                          } />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investigations Tab */}
          <TabsContent value="investigations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Investigation Cases</CardTitle>
                    <CardDescription>
                      Manage security investigations and forensic analysis
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateCaseDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Investigation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investigationCases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No investigation cases</p>
                      <p className="text-sm">Create a new case to start investigating security incidents</p>
                    </div>
                  ) : (
                    investigationCases.map((investigation) => (
                      <div key={investigation.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{investigation.title}</h3>
                            <p className="text-sm text-muted-foreground">{investigation.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              investigation.priority === 'critical' ? 'destructive' :
                              investigation.priority === 'high' ? 'secondary' :
                              investigation.priority === 'medium' ? 'default' : 'outline'
                            }>
                              {investigation.priority}
                            </Badge>
                            <Badge variant={
                              investigation.status === 'active' ? 'default' :
                              investigation.status === 'resolved' ? 'secondary' : 'outline'
                            }>
                              {investigation.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Events</div>
                            <div className="font-medium">{investigation.eventIds?.length || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Assignee</div>
                            <div className="font-medium">{investigation.assignee}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Created</div>
                            <div className="font-medium">{new Date(investigation.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Status: {investigation.status}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                        
                        {investigation.tags.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex flex-wrap gap-2">
                              {investigation.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Framework</CardTitle>
                  <CardDescription>
                    Select compliance framework for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLIANCE_FRAMEWORKS.map(framework => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name} {framework.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Compliance</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">142</div>
                        <div className="text-muted-foreground">Controls Met</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">21</div>
                        <div className="text-muted-foreground">Violations</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>
                    Current compliance status across all requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Data Protection</div>
                          <div className="text-sm text-muted-foreground">Article 32 - Security of processing</div>
                        </div>
                      </div>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="font-medium">Access Control</div>
                          <div className="text-sm text-muted-foreground">Article 25 - Data protection by design</div>
                        </div>
                      </div>
                      <Badge variant="secondary">Partial</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <X className="h-5 w-5 text-red-600" />
                        <div>
                          <div className="font-medium">Data Retention</div>
                          <div className="text-sm text-muted-foreground">Article 17 - Right to erasure</div>
                        </div>
                      </div>
                      <Badge variant="destructive">Non-compliant</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Audit Logging</div>
                          <div className="text-sm text-muted-foreground">Article 30 - Records of processing</div>
                        </div>
                      </div>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
                <CardDescription>
                  Compliance score over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', score: 82 },
                    { month: 'Feb', score: 85 },
                    { month: 'Mar', score: 83 },
                    { month: 'Apr', score: 87 },
                    { month: 'May', score: 89 },
                    { month: 'Jun', score: 87 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 100]} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                    <ReferenceLine y={90} stroke="#10b981" strokeDasharray="5 5" label="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forensics Tab */}
          <TabsContent value="forensics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5" />
                    Digital Forensics
                  </CardTitle>
                  <CardDescription>
                    Advanced forensic analysis tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      Event Correlation Analysis
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline Reconstruction
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Digital Fingerprinting
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Network className="h-4 w-4 mr-2" />
                      Network Flow Analysis
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Data Recovery
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Evidence Chain
                  </CardTitle>
                  <CardDescription>
                    Maintain evidence integrity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Event Log #1247</div>
                        <div className="text-xs text-muted-foreground">SHA256: a1b2c3d4...</div>
                      </div>
                      <Badge variant="default">Verified</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">System Snapshot</div>
                        <div className="text-xs text-muted-foreground">SHA256: e5f6g7h8...</div>
                      </div>
                      <Badge variant="default">Verified</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Network Capture</div>
                        <div className="text-xs text-muted-foreground">SHA256: i9j0k1l2...</div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forensic Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Forensic Timeline</CardTitle>
                <CardDescription>
                  Chronological reconstruction of events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Suspicious Login Detected</div>
                        <div className="text-sm text-muted-foreground">2024-01-15 14:32:15 UTC</div>
                        <div className="text-sm mt-1">Multiple failed authentication attempts from IP 192.168.1.100</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Data Access Anomaly</div>
                        <div className="text-sm text-muted-foreground">2024-01-15 14:35:42 UTC</div>
                        <div className="text-sm mt-1">Unusual data access pattern detected for user john.doe</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Security Response Initiated</div>
                        <div className="text-sm text-muted-foreground">2024-01-15 14:38:01 UTC</div>
                        <div className="text-sm mt-1">Automatic security protocols activated, account temporarily locked</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Configuration</CardTitle>
                  <CardDescription>
                    Configure audit trail settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Retention Period</Label>
                    <Select defaultValue="1year">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30days">30 Days</SelectItem>
                        <SelectItem value="90days">90 Days</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="3years">3 Years</SelectItem>
                        <SelectItem value="7years">7 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Log Level</Label>
                    <Select defaultValue="detailed">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="verbose">Verbose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="real-time-monitoring" defaultChecked />
                      <Label htmlFor="real-time-monitoring">Real-time Monitoring</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="anomaly-detection" defaultChecked />
                      <Label htmlFor="anomaly-detection">Anomaly Detection</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="compliance-checks" defaultChecked />
                      <Label htmlFor="compliance-checks">Compliance Checks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="forensic-mode" />
                      <Label htmlFor="forensic-mode">Forensic Mode</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Rules</CardTitle>
                  <CardDescription>
                    Configure automated alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Failed Login Threshold</div>
                        <div className="text-sm text-muted-foreground">5 attempts in 5 minutes</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Data Export Alert</div>
                        <div className="text-sm text-muted-foreground">Large data exports</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Off-hours Access</div>
                        <div className="text-sm text-muted-foreground">Access outside business hours</div>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Privilege Escalation</div>
                        <div className="text-sm text-muted-foreground">Permission changes</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Alert Rule
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Export Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Export & Reporting</CardTitle>
                <CardDescription>
                  Configure export formats and scheduled reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Default Export Format</Label>
                    <Select defaultValue="json">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Report Frequency</Label>
                    <Select defaultValue="weekly">
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
                  
                  <div>
                    <Label>Compression</Label>
                    <Select defaultValue="gzip">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="gzip">GZIP</SelectItem>
                        <SelectItem value="zip">ZIP</SelectItem>
                        <SelectItem value="tar">TAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Investigation Dialog */}
        <Dialog open={showCreateCaseDialog} onOpenChange={setShowCreateCaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Investigation Case</DialogTitle>
              <DialogDescription>
                Create a new investigation case for selected events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Case Title</Label>
                <Input placeholder="Enter investigation title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe the investigation scope and objectives" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Select defaultValue="current_user">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current_user">Current User</SelectItem>
                      <SelectItem value="security_team">Security Team</SelectItem>
                      <SelectItem value="compliance_team">Compliance Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Selected Events</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedEvents.size} events selected for investigation
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateCaseDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvestigation}>
                  Create Investigation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Audit Data</DialogTitle>
              <DialogDescription>
                Export audit events and analysis results
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="include-metadata" defaultChecked />
                  <Label htmlFor="include-metadata">Include Metadata</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-evidence" defaultChecked />
                  <Label htmlFor="include-evidence">Include Evidence</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-correlations" />
                  <Label htmlFor="include-correlations">Include Correlations</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleExportAuditData('json')}>
                  Export Data
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AuditTrailAnalyzer;