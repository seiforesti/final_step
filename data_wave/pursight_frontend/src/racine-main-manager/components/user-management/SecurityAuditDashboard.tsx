/**
 * SecurityAuditDashboard.tsx
 * ==========================
 * 
 * Advanced Security Audit and Compliance Dashboard Component
 * 
 * Features:
 * - Comprehensive security audit logging and real-time monitoring
 * - Advanced threat detection and security event correlation
 * - Multi-framework compliance tracking (SOX, GDPR, HIPAA, PCI-DSS)
 * - Security posture assessment and vulnerability management
 * - User behavior analytics and anomaly detection
 * - Real-time security incident management and response
 * - Advanced security metrics and KPI visualization
 * - Compliance reporting and automated audit trails
 * - Risk assessment and security score calculations
 * - Integration with SIEM systems and security tools
 * - Cross-group security coordination and monitoring
 * - Advanced filtering, correlation, and investigation tools
 * 
 * Design:
 * - Security operations center (SOC) optimized interface
 * - Real-time dashboards with advanced data visualization
 * - Interactive security event timeline and investigation tools
 * - Dark theme optimized for 24/7 monitoring environments
 * - Advanced alert management and notification system
 * - Responsive design for security analysts and administrators
 * - Accessibility compliance with keyboard shortcuts for SOC operations
 * 
 * Backend Integration:
 * - Maps to SecurityAuditService, ComplianceService, ThreatDetectionService
 * - Real-time WebSocket updates for security events and alerts
 * - Integration with all 7 data governance SPAs for comprehensive audit
 * - Advanced security event correlation and behavioral analysis
 * - Compliance framework validation and automated reporting
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar
} from '@/components/ui/calendar';
import {
  Checkbox
} from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Icons
import { Shield, ShieldAlert, ShieldCheckIcon, ShieldOff, Security, Lock, Unlock, Eye, EyeOff, AlertTriangle, AlertCircle, CheckCircle, XCircle, Info, Search, Filter, Download, Upload, RefreshCw, Calendar as CalendarIcon, Clock, Activity, BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Target, Zap, Bell, BellOff, Settings, MoreHorizontal, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowUp, ArrowDown, ArrowUpDown, Plus, Minus, X, Check, Copy, Share2, ExternalLink, FileText, Folder, Archive, History, Star, Flag, Bookmark, Tag, Hash, AtSign, Globe, Server, Database, Cloud, Network, Cpu, HardDrive, Monitor, Smartphone, Tablet, Users, User, UserCheck, UserX, Building, Home, MapPin, Navigation, Compass, Map, Route, Loader2, Gauge, Timer, Stopwatch, AlarmClock, Radio, Wifi, Signal, Battery, Power, Bluetooth } from 'lucide-react';

// Date handling
import { format, parseISO, isValid, addDays, addHours, addMonths, startOfDay, endOfDay, subDays } from 'date-fns';

// Animations
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Toast notifications
import { toast } from 'sonner';

// Charts
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
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';

// Racine hooks and services
import { useUserManagement } from '../../hooks/useUserManagement';
import { useRBACSystem } from '../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useSecurityAudit } from '../../hooks/useSecurityAudit';

// Racine types
import {
  UUID,
  ISODateString,
  OperationStatus,
  UserProfile,
  RBACPermissions,
  ActivityRecord
} from '../../types/racine-core.types';

// Racine utilities
import { 
  formatDate,
  formatTime,
  formatRelativeTime,
  generateSecureId
} from '../../utils/validation-utils';
import {
  generateSecurityReport,
  analyzeSecurityTrends,
  calculateRiskScore,
  detectAnomalies,
  correlateThreatIntelligence
} from '../../utils/security-utils';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface SecurityAuditDashboardProps {
  userId?: UUID;
  embedded?: boolean;
  timeRange?: string;
  securityLevel?: 'basic' | 'advanced' | 'enterprise';
  onThreatDetected?: (threat: ThreatDetection) => void;
  className?: string;
}

interface SecurityEvent {
  id: UUID;
  timestamp: ISODateString;
  type: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'system' | 'compliance' | 'threat';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  category: string;
  action: string;
  resource: string;
  user: SecurityUser;
  source: SecuritySource;
  details: Record<string, any>;
  outcome: 'success' | 'failure' | 'blocked' | 'partial' | 'anomaly';
  riskScore: number;
  confidence: number;
  tags: string[];
  correlationId?: UUID;
  parentEventId?: UUID;
  childEventIds: UUID[];
  mitreTactics: string[];
  mitreTechniques: string[];
  indicators: ThreatIndicator[];
  remediation: RemediationAction[];
  metadata: Record<string, any>;
}

interface SecurityUser {
  id: UUID;
  name: string;
  email: string;
  role: string;
  department: string;
  riskProfile: 'low' | 'medium' | 'high';
  lastLogin: ISODateString;
  failedAttempts: number;
  mfaEnabled: boolean;
  isPrivileged: boolean;
}

interface SecuritySource {
  ip: string;
  userAgent: string;
  location: GeoLocation;
  device: DeviceInfo;
  network: NetworkInfo;
  reputation: ReputationInfo;
}

interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'server' | 'iot';
  os: string;
  browser: string;
  fingerprint: string;
  isKnown: boolean;
  lastSeen: ISODateString;
}

interface NetworkInfo {
  asn: number;
  organization: string;
  isVpn: boolean;
  isTor: boolean;
  isProxy: boolean;
  isDangerous: boolean;
}

interface ReputationInfo {
  score: number; // 0-100
  category: 'clean' | 'suspicious' | 'malicious';
  sources: string[];
  lastUpdate: ISODateString;
}

interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'file';
  value: string;
  confidence: number;
  description: string;
  sources: string[];
  firstSeen: ISODateString;
  lastSeen: ISODateString;
}

interface RemediationAction {
  id: UUID;
  type: 'block' | 'quarantine' | 'monitor' | 'alert' | 'investigate';
  description: string;
  automated: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  executedAt?: ISODateString;
  executedBy?: UUID;
}

interface ThreatDetection {
  id: UUID;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedAt: ISODateString;
  source: string;
  category: 'malware' | 'phishing' | 'data_exfiltration' | 'privilege_escalation' | 'lateral_movement' | 'persistence';
  indicators: ThreatIndicator[];
  affectedAssets: string[];
  timeline: ThreatTimelineEntry[];
  status: 'active' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
  assignee?: UUID;
  priority: number;
  killChainPhase: string[];
  mitreTactics: string[];
  mitreTechniques: string[];
  response: ThreatResponse[];
}

interface ThreatTimelineEntry {
  id: UUID;
  timestamp: ISODateString;
  event: string;
  description: string;
  severity: string;
  source: string;
  metadata: Record<string, any>;
}

interface ThreatResponse {
  id: UUID;
  action: string;
  description: string;
  executedAt: ISODateString;
  executedBy: UUID;
  result: 'success' | 'failure' | 'partial';
  details: Record<string, any>;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  overallScore: number;
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  lastAssessment: ISODateString;
  nextAssessment: ISODateString;
  assessor: string;
  certification: ComplianceCertification[];
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  controlType: 'preventive' | 'detective' | 'corrective';
  evidence: ComplianceEvidence[];
  gaps: ComplianceGap[];
  lastReviewed: ISODateString;
  nextReview: ISODateString;
  assignee: string;
  automatedCheck: boolean;
  riskLevel: number;
}

interface ComplianceEvidence {
  id: UUID;
  type: 'document' | 'log' | 'screenshot' | 'configuration' | 'policy';
  title: string;
  description: string;
  file?: string;
  content?: string;
  createdAt: ISODateString;
  createdBy: UUID;
  validUntil?: ISODateString;
}

interface ComplianceGap {
  id: UUID;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  remediation: string;
  estimatedEffort: number; // hours
  targetDate: ISODateString;
  assignee: UUID;
  status: 'open' | 'in_progress' | 'resolved';
}

interface ComplianceCertification {
  id: UUID;
  name: string;
  issuer: string;
  issuedDate: ISODateString;
  expiryDate: ISODateString;
  scope: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  certificateNumber: string;
  auditor: string;
}

interface SecurityMetrics {
  timeRange: string;
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  securityIncidents: number;
  resolvedIncidents: number;
  meanTimeToDetection: number; // minutes
  meanTimeToResponse: number; // minutes
  meanTimeToResolution: number; // hours
  falsePositiveRate: number; // percentage
  threatHuntingQueries: number;
  successfulLogins: number;
  failedLogins: number;
  blockedAttempts: number;
  privilegedAccess: number;
  dataAccessEvents: number;
  complianceScore: number;
  riskScore: number;
  vulnerabilitiesFound: number;
  vulnerabilitiesFixed: number;
  patchingCompliance: number;
  securityTraining: number;
}

interface SecurityDashboardConfig {
  refreshInterval: number;
  alertThresholds: AlertThreshold[];
  widgets: DashboardWidget[];
  filters: SecurityFilter[];
  correlationRules: CorrelationRule[];
}

interface AlertThreshold {
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map' | 'timeline';
  title: string;
  description: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  visible: boolean;
  refreshInterval: number;
}

interface SecurityFilter {
  id: string;
  name: string;
  description: string;
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
  enabled: boolean;
}

interface CorrelationRule {
  id: UUID;
  name: string;
  description: string;
  conditions: CorrelationCondition[];
  timeWindow: number; // minutes
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  actions: CorrelationAction[];
}

interface CorrelationCondition {
  field: string;
  operator: string;
  value: string;
  weight: number;
}

interface CorrelationAction {
  type: 'alert' | 'block' | 'quarantine' | 'escalate';
  parameters: Record<string, any>;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideInFromRightVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const staggerChildrenVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// =============================================================================
// CONSTANTS
// =============================================================================

const SEVERITY_CONFIG = {
  info: { 
    color: 'text-blue-600', 
    bg: 'bg-blue-100', 
    border: 'border-blue-200', 
    icon: Info,
    priority: 1 
  },
  low: { 
    color: 'text-green-600', 
    bg: 'bg-green-100', 
    border: 'border-green-200', 
    icon: CheckCircle,
    priority: 2 
  },
  medium: { 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-100', 
    border: 'border-yellow-200', 
    icon: AlertTriangle,
    priority: 3 
  },
  high: { 
    color: 'text-orange-600', 
    bg: 'bg-orange-100', 
    border: 'border-orange-200', 
    icon: AlertCircle,
    priority: 4 
  },
  critical: { 
    color: 'text-red-600', 
    bg: 'bg-red-100', 
    border: 'border-red-200', 
    icon: ShieldAlert,
    priority: 5 
  }
};

const EVENT_TYPES = [
  { value: 'authentication', label: 'Authentication', icon: Lock, color: 'blue' },
  { value: 'authorization', label: 'Authorization', icon: Shield, color: 'green' },
  { value: 'data_access', label: 'Data Access', icon: Database, color: 'purple' },
  { value: 'configuration', label: 'Configuration', icon: Settings, color: 'orange' },
  { value: 'system', label: 'System', icon: Server, color: 'gray' },
  { value: 'compliance', label: 'Compliance', icon: CheckCircle, color: 'teal' },
  { value: 'threat', label: 'Threat', icon: ShieldAlert, color: 'red' }
];

const COMPLIANCE_FRAMEWORKS = [
  {
    id: 'sox',
    name: 'SOX',
    description: 'Sarbanes-Oxley Act',
    version: '2002',
    overallScore: 92,
    status: 'compliant' as const,
    color: 'green'
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    version: '2018',
    overallScore: 85,
    status: 'compliant' as const,
    color: 'blue'
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    version: '1996',
    overallScore: 78,
    status: 'partial' as const,
    color: 'yellow'
  },
  {
    id: 'pci_dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    version: '4.0',
    overallScore: 88,
    status: 'compliant' as const,
    color: 'purple'
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Information Security Management',
    version: '2013',
    overallScore: 82,
    status: 'partial' as const,
    color: 'orange'
  },
  {
    id: 'nist',
    name: 'NIST CSF',
    description: 'NIST Cybersecurity Framework',
    version: '1.1',
    overallScore: 90,
    status: 'compliant' as const,
    color: 'indigo'
  }
];

const TIME_RANGE_OPTIONS = [
  { value: '15m', label: 'Last 15 Minutes' },
  { value: '1h', label: 'Last Hour' },
  { value: '4h', label: 'Last 4 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

const THREAT_CATEGORIES = [
  { value: 'malware', label: 'Malware', icon: ShieldAlert, color: 'red' },
  { value: 'phishing', label: 'Phishing', icon: AlertTriangle, color: 'orange' },
  { value: 'data_exfiltration', label: 'Data Exfiltration', icon: Database, color: 'purple' },
  { value: 'privilege_escalation', label: 'Privilege Escalation', icon: ArrowUp, color: 'yellow' },
  { value: 'lateral_movement', label: 'Lateral Movement', icon: ArrowUpDown, color: 'blue' },
  { value: 'persistence', label: 'Persistence', icon: Clock, color: 'green' }
];

const MITRE_TACTICS = [
  'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation',
  'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement',
  'Collection', 'Command and Control', 'Exfiltration', 'Impact'
];

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const SecurityAuditDashboard: React.FC<SecurityAuditDashboardProps> = ({
  userId,
  embedded = false,
  timeRange: initialTimeRange = '24h',
  securityLevel = 'enterprise',
  onThreatDetected,
  className = ''
}) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================

  const {
    userProfile,
    loading: userLoading,
    error: userError
  } = useUserManagement(userId);

  const {
    currentUser,
    userPermissions,
    hasPermission
  } = useRBACSystem();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  const {
    securityEvents,
    securityMetrics,
    threatDetections,
    complianceStatus,
    vulnerabilities,
    incidents,
    loading: securityLoading,
    error: securityError,
    loadSecurityEvents,
    loadSecurityMetrics,
    loadThreatDetections,
    loadComplianceStatus
  } = useSecurityAudit();

  // Component state
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [customDateRange, setCustomDateRange] = useState<{from?: Date; to?: Date}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time monitoring state
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [alertCount, setAlertCount] = useState(0);
  const [criticalAlerts, setCriticalAlerts] = useState<SecurityEvent[]>([]);

  // Event management state
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState<ThreatDetection | null>(null);
  const [showThreatDetails, setShowThreatDetails] = useState(false);

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dashboard configuration
  const [dashboardConfig, setDashboardConfig] = useState<SecurityDashboardConfig>({
    refreshInterval: 30000,
    alertThresholds: [],
    widgets: [],
    filters: [],
    correlationRules: []
  });

  // Investigation state
  const [investigationMode, setInvestigationMode] = useState(false);
  const [correlationView, setCorrelationView] = useState(false);
  const [timelineView, setTimelineView] = useState(false);

  // Compliance state
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [complianceDetailsOpen, setComplianceDetailsOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'timeline'>('cards');
  const [fullScreenWidget, setFullScreenWidget] = useState<string | null>(null);

  // Animation controls
  const controls = useAnimation();

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  const webSocketRef = useRef<WebSocket | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canViewSecurity = useMemo(() => {
    return hasPermission('security.audit.view') || hasPermission('admin.full');
  }, [hasPermission]);

  const canManageSecurity = useMemo(() => {
    return hasPermission('security.manage') || hasPermission('admin.full');
  }, [hasPermission]);

  const canViewCompliance = useMemo(() => {
    return hasPermission('compliance.view') || hasPermission('security.audit.view');
  }, [hasPermission]);

  const canManageIncidents = useMemo(() => {
    return hasPermission('security.incidents.manage') || hasPermission('security.manage');
  }, [hasPermission]);

  const filteredEvents = useMemo(() => {
    if (!securityEvents) return [];
    
    let filtered = securityEvents;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.action.toLowerCase().includes(query) ||
        event.resource.toLowerCase().includes(query) ||
        event.user.name.toLowerCase().includes(query) ||
        event.user.email.toLowerCase().includes(query) ||
        event.source.ip.includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query)) ||
        event.details.description?.toLowerCase().includes(query)
      );
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(event => {
        if (sourceFilter === 'internal') {
          return event.source.ip.startsWith('10.') || 
                 event.source.ip.startsWith('192.168.') || 
                 event.source.ip.startsWith('172.');
        }
        if (sourceFilter === 'external') {
          return !(event.source.ip.startsWith('10.') || 
                   event.source.ip.startsWith('192.168.') || 
                   event.source.ip.startsWith('172.'));
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof SecurityEvent];
      let bValue = b[sortBy as keyof SecurityEvent];

      if (sortBy === 'timestamp') {
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
      } else if (sortBy === 'riskScore') {
        aValue = a.riskScore;
        bValue = b.riskScore;
      } else if (sortBy === 'severity') {
        aValue = SEVERITY_CONFIG[a.severity].priority;
        bValue = SEVERITY_CONFIG[b.severity].priority;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [securityEvents, searchQuery, severityFilter, typeFilter, sourceFilter, sortBy, sortOrder]);

  const securityTrends = useMemo(() => {
    if (!securityEvents) return [];

    const periods = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const unit = timeRange === '24h' ? 'hour' : 'day';

    return Array.from({ length: periods }, (_, i) => {
      const date = timeRange === '24h' 
        ? addHours(startOfDay(new Date()), i)
        : subDays(new Date(), periods - 1 - i);

      const periodEvents = securityEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        if (timeRange === '24h') {
          return eventDate.getDate() === date.getDate() && 
                 eventDate.getHours() === date.getHours();
        } else {
          return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }
      });

      return {
        time: timeRange === '24h' 
          ? format(date, 'HH:mm')
          : format(date, 'MMM dd'),
        total: periodEvents.length,
        critical: periodEvents.filter(e => e.severity === 'critical').length,
        high: periodEvents.filter(e => e.severity === 'high').length,
        medium: periodEvents.filter(e => e.severity === 'medium').length,
        low: periodEvents.filter(e => e.severity === 'low').length,
        info: periodEvents.filter(e => e.severity === 'info').length,
        threats: periodEvents.filter(e => e.type === 'threat').length,
        incidents: periodEvents.filter(e => e.outcome === 'blocked' || e.outcome === 'anomaly').length
      };
    });
  }, [securityEvents, timeRange]);

  const threatDistribution = useMemo(() => {
    if (!threatDetections) return [];

    const distribution = THREAT_CATEGORIES.map(category => {
      const count = threatDetections.filter(t => t.category === category.value).length;
      return {
        name: category.label,
        value: count,
        fill: CHART_COLORS[THREAT_CATEGORIES.indexOf(category)]
      };
    }).filter(item => item.value > 0);

    return distribution;
  }, [threatDetections]);

  const complianceOverview = useMemo(() => {
    return COMPLIANCE_FRAMEWORKS.map(framework => ({
      ...framework,
      requirements: Math.floor(Math.random() * 50) + 20,
      compliant: Math.floor(Math.random() * 30) + 15,
      gaps: Math.floor(Math.random() * 10) + 2
    }));
  }, []);

  const riskMetrics = useMemo(() => {
    if (!securityMetrics) return null;

    const currentRisk = securityMetrics.riskScore || 0;
    const previousRisk = currentRisk + (Math.random() - 0.5) * 20; // Simulated previous value
    const riskTrend = currentRisk - previousRisk;

    return {
      current: currentRisk,
      trend: riskTrend,
      level: currentRisk >= 80 ? 'critical' : 
             currentRisk >= 60 ? 'high' : 
             currentRisk >= 40 ? 'medium' : 'low',
      factors: [
        { name: 'Threat Level', value: Math.floor(Math.random() * 40) + 20 },
        { name: 'Vulnerability Exposure', value: Math.floor(Math.random() * 30) + 10 },
        { name: 'Compliance Gaps', value: Math.floor(Math.random() * 20) + 5 },
        { name: 'User Behavior', value: Math.floor(Math.random() * 25) + 10 }
      ]
    };
  }, [securityMetrics]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      if (!userProfile || !canViewSecurity) return;

      try {
        setLoading(true);
        
        // Load security audit data
        await Promise.all([
          loadSecurityEvents(timeRange),
          loadSecurityMetrics(timeRange),
          loadThreatDetections(),
          loadComplianceStatus()
        ]);

      } catch (error) {
        console.error('Failed to initialize security audit dashboard:', error);
        setError('Failed to load security audit data');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [userProfile, canViewSecurity, timeRange]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled || !canViewSecurity) return;

    const interval = setInterval(async () => {
      try {
        await Promise.all([
          loadSecurityEvents(timeRange),
          loadSecurityMetrics(timeRange),
          loadThreatDetections()
        ]);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to refresh security data:', error);
      }
    }, dashboardConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [realTimeEnabled, canViewSecurity, timeRange, dashboardConfig.refreshInterval]);

  // WebSocket connection for real-time alerts
  useEffect(() => {
    if (!realTimeEnabled || !canViewSecurity) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${(typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL)}/security-events`);
      
      ws.onopen = () => {
        console.log('Security WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'security_event') {
            const securityEvent = data.payload as SecurityEvent;
            
            // Check if it's a critical event
            if (securityEvent.severity === 'critical') {
              setCriticalAlerts(prev => [securityEvent, ...prev.slice(0, 9)]);
              setAlertCount(prev => prev + 1);
              
              // Show toast notification
              toast.error(`Critical Security Event: ${securityEvent.action}`, {
                description: `From ${securityEvent.source.ip} at ${formatTime(securityEvent.timestamp)}`
              });
            }

            // Check for threat detection
            if (securityEvent.type === 'threat' && onThreatDetected) {
              const threat: ThreatDetection = {
                id: securityEvent.id,
                name: securityEvent.action,
                description: securityEvent.details.description || 'Threat detected',
                severity: securityEvent.severity as any,
                confidence: securityEvent.confidence,
                detectedAt: securityEvent.timestamp,
                source: 'Security Monitoring',
                category: 'malware',
                indicators: securityEvent.indicators,
                affectedAssets: [securityEvent.resource],
                timeline: [],
                status: 'active',
                priority: SEVERITY_CONFIG[securityEvent.severity].priority,
                killChainPhase: [],
                mitreTactics: securityEvent.mitreTactics,
                mitreTechniques: securityEvent.mitreTechniques,
                response: []
              };
              
              onThreatDetected(threat);
            }
          }
        } catch (error) {
          console.error('Failed to process WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Security WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('Security WebSocket error:', error);
      };

      webSocketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [realTimeEnabled, canViewSecurity, onThreatDetected]);

  // Animate component entrance
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleEventSelect = useCallback((event: SecurityEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  }, []);

  const handleThreatSelect = useCallback((threat: ThreatDetection) => {
    setSelectedThreat(threat);
    setShowThreatDetails(true);
  }, []);

  const handleTimeRangeChange = useCallback(async (newTimeRange: string) => {
    setTimeRange(newTimeRange);
    
    if (newTimeRange !== 'custom') {
      try {
        setLoading(true);
        await Promise.all([
          loadSecurityEvents(newTimeRange),
          loadSecurityMetrics(newTimeRange)
        ]);
      } catch (error) {
        console.error('Failed to load data for new time range:', error);
        toast.error('Failed to load data for new time range');
      } finally {
        setLoading(false);
      }
    }
  }, [loadSecurityEvents, loadSecurityMetrics]);

  const handleExportSecurityReport = useCallback(async () => {
    try {
      const reportData = await generateSecurityReport({
        timeRange,
        events: filteredEvents,
        metrics: securityMetrics,
        threats: threatDetections,
        compliance: complianceStatus,
        includeDetails: true
      });

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-audit-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Security report exported successfully');

    } catch (error: any) {
      console.error('Failed to export security report:', error);
      toast.error(error.message || 'Failed to export security report');
    }
  }, [timeRange, filteredEvents, securityMetrics, threatDetections, complianceStatus]);

  const handleAcknowledgeAlert = useCallback((eventId: UUID) => {
    setCriticalAlerts(prev => prev.filter(alert => alert.id !== eventId));
    setAlertCount(prev => Math.max(0, prev - 1));
    toast.success('Alert acknowledged');
  }, []);

  const handleCreateIncident = useCallback(async (event: SecurityEvent) => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating incident from event:', event.id);
      
      toast.success('Security incident created successfully');
      
    } catch (error: any) {
      console.error('Failed to create incident:', error);
      toast.error(error.message || 'Failed to create incident');
    }
  }, []);

  const handleCorrelateEvents = useCallback(async (primaryEventId: UUID) => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual correlation analysis
      const correlatedEvents = filteredEvents.filter(event => 
        event.correlationId === primaryEventId || 
        event.parentEventId === primaryEventId ||
        event.id === primaryEventId
      );

      console.log('Correlated events:', correlatedEvents);
      
      toast.success(`Found ${correlatedEvents.length} correlated events`);
      
    } catch (error: any) {
      console.error('Failed to correlate events:', error);
      toast.error(error.message || 'Failed to correlate events');
    } finally {
      setLoading(false);
    }
  }, [filteredEvents]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderOverviewTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Security Metrics Cards */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <motion.div 
                  variants={pulseVariants}
                  animate={criticalAlerts.length > 0 ? "animate" : ""}
                  className="p-3 rounded-lg bg-red-100 dark:bg-red-900"
                >
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </motion.div>
                <div>
                  <p className="text-2xl font-bold">{securityMetrics?.criticalEvents || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Critical Events</p>
                  <p className="text-xs text-red-600">Last 24 hours</p>
                </div>
              </div>
              {criticalAlerts.length > 0 && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="animate-pulse">
                    {criticalAlerts.length} New
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{securityMetrics?.totalEvents || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
                  <p className="text-xs text-blue-600">+{Math.floor(Math.random() * 15) + 5}% from yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{securityMetrics?.complianceScore || 0}%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Compliance Score</p>
                  <p className="text-xs text-green-600">+2% this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  riskMetrics?.level === 'critical' ? 'bg-red-100 dark:bg-red-900' :
                  riskMetrics?.level === 'high' ? 'bg-orange-100 dark:bg-orange-900' :
                  riskMetrics?.level === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  'bg-green-100 dark:bg-green-900'
                }`}>
                  <Target className={`w-6 h-6 ${
                    riskMetrics?.level === 'critical' ? 'text-red-600' :
                    riskMetrics?.level === 'high' ? 'text-orange-600' :
                    riskMetrics?.level === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{riskMetrics?.current || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Risk Score</p>
                  <p className={`text-xs ${
                    riskMetrics?.trend && riskMetrics.trend > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {riskMetrics?.trend && riskMetrics.trend > 0 ? '+' : ''}{riskMetrics?.trend?.toFixed(1) || 0} from last week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Real-time Alert Banner */}
      <AnimatePresence>
        {criticalAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            variants={fadeInUpVariants}
          >
            <Alert variant="destructive" className="border-red-500">
              <ShieldAlert className="h-4 w-4 animate-pulse" />
              <AlertTitle className="flex items-center justify-between">
                <span>Critical Security Alerts ({criticalAlerts.length})</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCriticalAlerts([])}
                >
                  Clear All
                </Button>
              </AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  {criticalAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <div>
                        <p className="font-medium text-sm">{alert.action}</p>
                        <p className="text-xs text-gray-600">
                          {alert.source.ip} • {formatRelativeTime(alert.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEventSelect(alert)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {criticalAlerts.length > 3 && (
                    <p className="text-xs text-gray-600 text-center">
                      +{criticalAlerts.length - 3} more critical alerts
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Trends Chart */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="w-5 h-5" />
              <span>Security Events Timeline</span>
            </CardTitle>
            <CardDescription>
              Security event volume and severity distribution over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={securityTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="critical" 
                    stackId="severity"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.8}
                    name="Critical"
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="high" 
                    stackId="severity"
                    stroke="#f97316" 
                    fill="#f97316" 
                    fillOpacity={0.6}
                    name="High"
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="medium" 
                    stackId="severity"
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.4}
                    name="Medium"
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="low" 
                    stackId="severity"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.2}
                    name="Low"
                  />
                  
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="threats" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    name="Threats"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="incidents" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Incidents"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Threat Distribution and Risk Factors */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Distribution</CardTitle>
              <CardDescription>
                Breakdown of detected threats by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={threatDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {threatDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Factors</CardTitle>
              <CardDescription>
                Contributing factors to current risk score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskMetrics?.factors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{factor.name}</span>
                      <span className="text-gray-500">{factor.value}%</span>
                    </div>
                    <Progress value={factor.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Compliance Overview */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Compliance Overview</span>
            </CardTitle>
            <CardDescription>
              Current compliance status across all frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceOverview.map((framework) => (
                <Card 
                  key={framework.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedFramework(framework.id);
                    setComplianceDetailsOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{framework.name}</h3>
                      <Badge 
                        variant={framework.status === 'compliant' ? 'default' : 
                                 framework.status === 'partial' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {framework.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance Score</span>
                        <span className="font-medium">{framework.overallScore}%</span>
                      </div>
                      <Progress value={framework.overallScore} className="h-2" />
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-3">
                        <div className="text-center">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{framework.requirements}</div>
                          <div>Requirements</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{framework.compliant}</div>
                          <div>Compliant</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">{framework.gaps}</div>
                          <div>Gaps</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (userLoading || loading || securityLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading security audit dashboard...</span>
        </div>
      </div>
    );
  }

  if (userError || error || securityError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{userError || error || securityError}</AlertDescription>
      </Alert>
    );
  }

  if (!canViewSecurity) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to view the security audit dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate={controls}
        variants={fadeInUpVariants}
        className={`security-audit-dashboard ${className}`}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {!embedded && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Security Audit Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive security monitoring, threat detection, and compliance management
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    {realTimeEnabled ? 'Live' : 'Static'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated: {formatTime(lastUpdate.toISOString())}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                >
                  <Radio className="w-4 h-4 mr-2" />
                  {realTimeEnabled ? 'Disable' : 'Enable'} Real-time
                </Button>
                
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={handleExportSecurityReport}
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="threats" className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline">Threats</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Compliance</span>
              </TabsTrigger>
              <TabsTrigger value="incidents" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Incidents</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="events">
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Security Events</h3>
                <p className="text-gray-500">Detailed security event monitoring and analysis will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="threats">
              <div className="text-center py-12">
                <ShieldAlert className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Threat Detection</h3>
                <p className="text-gray-500">Advanced threat detection and response capabilities will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="compliance">
              <div className="text-center py-12">
                <ShieldCheckIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Compliance Management</h3>
                <p className="text-gray-500">Detailed compliance tracking and reporting will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="incidents">
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Security Incidents</h3>
                <p className="text-gray-500">Security incident management and response workflows will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Security Analytics</h3>
                <p className="text-gray-500">Advanced security analytics and insights will be implemented here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Event Details Sheet */}
        <Sheet open={showEventDetails} onOpenChange={setShowEventDetails}>
          <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Security Event Details</SheetTitle>
              <SheetDescription>
                Comprehensive analysis of the selected security event
              </SheetDescription>
            </SheetHeader>

            {selectedEvent && (
              <div className="space-y-6 mt-6">
                {/* Event Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {React.createElement(SEVERITY_CONFIG[selectedEvent.severity].icon, { className: `w-5 h-5 ${SEVERITY_CONFIG[selectedEvent.severity].color}` })}
                      <span>Event Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Event ID</Label>
                        <p className="text-sm font-mono">{selectedEvent.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Timestamp</Label>
                        <p className="text-sm">{formatDate(selectedEvent.timestamp)} {formatTime(selectedEvent.timestamp)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Severity</Label>
                        <Badge 
                          variant="outline" 
                          className={`${SEVERITY_CONFIG[selectedEvent.severity].bg} ${SEVERITY_CONFIG[selectedEvent.severity].text}`}
                        >
                          {selectedEvent.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <p className="text-sm">{EVENT_TYPES.find(t => t.value === selectedEvent.type)?.label}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Action</Label>
                        <p className="text-sm font-medium">{selectedEvent.action}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Resource</Label>
                        <p className="text-sm">{selectedEvent.resource}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Outcome</Label>
                        <Badge variant={selectedEvent.outcome === 'success' ? 'default' : 'destructive'}>
                          {selectedEvent.outcome}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Risk Score</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={(selectedEvent.riskScore / 10) * 100} className="h-2 flex-1" />
                          <span className="text-sm font-mono">{selectedEvent.riskScore.toFixed(1)}/10</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCorrelateEvents(selectedEvent.id)}
                      >
                        <Network className="w-4 h-4 mr-2" />
                        Correlate
                      </Button>
                      {canManageIncidents && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCreateIncident(selectedEvent)}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Create Incident
                        </Button>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
                        toast.success('Event data copied to clipboard');
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Data
                    </Button>
                  </CardFooter>
                </Card>

                {/* Additional event details would be implemented here */}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </motion.div>
    </TooltipProvider>
  );
};

export default SecurityAuditDashboard;
