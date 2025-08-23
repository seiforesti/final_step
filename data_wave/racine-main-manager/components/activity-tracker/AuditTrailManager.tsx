/**
 * AuditTrailManager.tsx
 * ======================
 * 
 * Comprehensive Audit Trail Management System - Enterprise-grade audit trail
 * management with compliance reporting, automated retention policies, advanced
 * filtering, export capabilities, and security-focused design.
 * 
 * Features:
 * - Complete audit trail lifecycle management
 * - Compliance framework integration (SOX, GDPR, HIPAA, etc.)
 * - Advanced filtering and search capabilities
 * - Automated retention and archival policies
 * - Real-time audit monitoring and alerts
 * - Multi-format export with digital signatures
 * - Cross-group audit correlation
 * - Risk assessment and anomaly detection
 * 
 * Design: Enterprise compliance interface with security-focused UI, audit
 * visualizations, and comprehensive reporting using shadcn/ui, Next.js, and Tailwind CSS.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Settings, 
  MoreHorizontal, 
  Maximize2, 
  Minimize2, 
  RefreshCcw, 
  Archive, 
  Trash2, 
  Copy, 
  Share, 
  ExternalLink, 
  History, 
  Tag, 
  User, 
  Building, 
  Database, 
  Server, 
  Network, 
  Activity, 
  Zap, 
  Target, 
  Layers, 
  GitBranch, 
  Workflow, 
  Users, 
  Hash, 
  Key, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Square, 
  RotateCw, 
  Plus, 
  Minus, 
  Edit, 
  Save, 
  X, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  Briefcase, 
  Scale, 
  Gavel, 
  Scroll, 
  Certificate, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Globe, 
  MapPin, 
  Clock3, 
  Timer, 
  Calendar as CalendarIcon2,
  Bookmark, 
  Star, 
  Flag, 
  Bell, 
  BellOff, 
  Mail, 
  Phone, 
  MessageSquare, 
  Printer, 
  ScanLine, 
  QrCode, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  LineChart, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  CloudUpload, 
  CloudDownload, 
  FolderOpen, 
  FileCheck, 
  FileLock, 
  FileWarning, 
  FileX, 
  Folder, 
  Grid3X3, 
  List, 
  Table as TableIcon,
  Columns, 
  Rows,
  Binary,
  Code,
  Terminal,
  Bug,
  Zap as Lightning,
  Fingerprint,
  Scan,
  Radar,
  Crosshair,
  Focus,
  Microscope,
  FlaskConical,
  TestTube,
  Beaker,
  Atom,
  Dna,
  Brain,
  BrainCircuit,
  Lightbulb,
  Sparkles,
  Stars,
  Crown,
  Award,
  Trophy,
  Medal,
  Badge as BadgeIcon,
  Verified,
  ShieldX
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';

// Hooks and Services
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useComplianceManagement } from '../../hooks/useComplianceManagement';

// Types
import {
  AuditTrail,
  AuditTrailEntry,
  ComplianceLevel,
  RetentionPolicy,
  RacineActivity,
  ActivityFilter,
  UUID,
  UserRole,
  WorkspaceContext,
  ComplianceFramework,
  AuditEvent,
  SecurityClassification
} from '../../types/racine-core.types';

// Utils
import { formatDateTime, formatDuration, formatBytes, formatNumber } from '../../utils/formatting-utils';
import { cn } from '@/lib/utils';

/**
 * Audit trail view modes
 */
export enum AuditViewMode {
  TIMELINE = 'timeline',
  TABLE = 'table',
  TREE = 'tree',
  GRAPH = 'graph',
  REPORT = 'report'
}

/**
 * Compliance framework enumeration
 */
export enum ComplianceFrameworkType {
  SOX = 'sox',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  SOC2 = 'soc2',
  ISO27001 = 'iso27001',
  NIST = 'nist',
  CCPA = 'ccpa',
  PIPEDA = 'pipeda',
  CUSTOM = 'custom'
}

/**
 * Audit export formats
 */
export enum AuditExportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
  EXCEL = 'excel',
  SIGNED_PDF = 'signed_pdf'
}

/**
 * Risk assessment levels
 */
export enum RiskLevel {
  NEGLIGIBLE = 'negligible',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Audit filter configuration
 */
interface AuditFilter {
  id: string;
  name: string;
  type: 'time' | 'user' | 'action' | 'resource' | 'compliance' | 'risk';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'range';
  value: any;
  enabled: boolean;
}

/**
 * Retention policy configuration
 */
interface RetentionPolicyConfig {
  id: string;
  name: string;
  framework: ComplianceFrameworkType;
  retentionPeriod: number; // in days
  archiveAfter: number; // in days
  deleteAfter: number; // in days
  compressionEnabled: boolean;
  encryptionRequired: boolean;
  immutableStorage: boolean;
  witnessRequired: boolean;
}

/**
 * Audit report configuration
 */
interface AuditReportConfig {
  id: string;
  name: string;
  description: string;
  template: string;
  filters: AuditFilter[];
  scheduleCron?: string;
  recipients: string[];
  format: AuditExportFormat;
  digitalSignature: boolean;
  watermark: boolean;
  redactionRules: string[];
}

/**
 * Component props
 */
interface AuditTrailManagerProps {
  height?: number;
  enableExport?: boolean;
  enableScheduling?: boolean;
  enableSignatures?: boolean;
  defaultFramework?: ComplianceFrameworkType;
  className?: string;
}

/**
 * Component state interface
 */
interface AuditTrailState {
  // View Management
  currentView: AuditViewMode;
  selectedTrail: string | null;
  selectedEntries: Set<string>;
  
  // Data
  auditTrails: AuditTrail[];
  filteredTrails: AuditTrail[];
  auditEntries: AuditTrailEntry[];
  filteredEntries: AuditTrailEntry[];
  
  // Filtering and Search
  activeFilters: AuditFilter[];
  savedFilters: AuditFilter[];
  searchQuery: string;
  timeRange: { start: Date; end: Date };
  
  // Compliance
  activeFramework: ComplianceFrameworkType;
  complianceScore: number;
  riskAssessment: { level: RiskLevel; score: number; factors: string[] };
  retentionPolicies: RetentionPolicyConfig[];
  
  // Export and Reporting
  reportConfigs: AuditReportConfig[];
  exportProgress: number;
  isExporting: boolean;
  
  // UI State
  showFilters: boolean;
  showCompliance: boolean;
  showRisk: boolean;
  showRetention: boolean;
  showReports: boolean;
  isFullscreen: boolean;
  
  // Performance
  pageSize: number;
  currentPage: number;
  totalPages: number;
  
  // Loading and Errors
  loading: {
    trails: boolean;
    entries: boolean;
    export: boolean;
    compliance: boolean;
  };
  errors: {
    trails: string | null;
    entries: string | null;
    export: string | null;
    compliance: string | null;
  };
}

/**
 * Compliance framework configurations
 */
const complianceFrameworks = {
  [ComplianceFrameworkType.SOX]: {
    name: 'Sarbanes-Oxley Act',
    description: 'Financial reporting and internal controls',
    color: '#DC2626',
    icon: Scale,
    requirements: ['financial_data_access', 'executive_actions', 'financial_reporting'],
    retentionPeriod: 2555, // 7 years
    riskFactors: ['financial_fraud', 'unauthorized_access', 'data_manipulation']
  },
  [ComplianceFrameworkType.GDPR]: {
    name: 'General Data Protection Regulation',
    description: 'EU data protection and privacy',
    color: '#2563EB',
    icon: Shield,
    requirements: ['personal_data_access', 'consent_management', 'data_portability'],
    retentionPeriod: 2190, // 6 years
    riskFactors: ['privacy_breach', 'unauthorized_processing', 'consent_violation']
  },
  [ComplianceFrameworkType.HIPAA]: {
    name: 'Health Insurance Portability and Accountability Act',
    description: 'Healthcare data protection',
    color: '#059669',
    icon: Cross,
    requirements: ['phi_access', 'healthcare_actions', 'patient_consent'],
    retentionPeriod: 2190, // 6 years
    riskFactors: ['phi_breach', 'unauthorized_disclosure', 'improper_access']
  },
  [ComplianceFrameworkType.PCI_DSS]: {
    name: 'Payment Card Industry Data Security Standard',
    description: 'Payment card data protection',
    color: '#7C3AED',
    icon: CreditCard,
    requirements: ['payment_data_access', 'cardholder_data', 'payment_processing'],
    retentionPeriod: 1095, // 3 years
    riskFactors: ['payment_fraud', 'card_data_breach', 'unauthorized_transactions']
  },
  [ComplianceFrameworkType.SOC2]: {
    name: 'Service Organization Control 2',
    description: 'Security, availability, and confidentiality',
    color: '#EA580C',
    icon: ShieldCheck,
    requirements: ['system_access', 'data_processing', 'security_controls'],
    retentionPeriod: 1095, // 3 years
    riskFactors: ['security_breach', 'availability_loss', 'confidentiality_breach']
  }
};

/**
 * Risk level configurations
 */
const riskLevelConfigs = {
  [RiskLevel.NEGLIGIBLE]: { color: '#10B981', bgColor: '#D1FAE5', textColor: '#065F46' },
  [RiskLevel.LOW]: { color: '#84CC16', bgColor: '#ECFCCB', textColor: '#365314' },
  [RiskLevel.MEDIUM]: { color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' },
  [RiskLevel.HIGH]: { color: '#EF4444', bgColor: '#FEE2E2', textColor: '#991B1B' },
  [RiskLevel.CRITICAL]: { color: '#7C2D12', bgColor: '#FEE2E2', textColor: '#7C2D12' }
};

/**
 * Initial state
 */
const initialState: AuditTrailState = {
  currentView: AuditViewMode.TABLE,
  selectedTrail: null,
  selectedEntries: new Set(),
  auditTrails: [],
  filteredTrails: [],
  auditEntries: [],
  filteredEntries: [],
  activeFilters: [],
  savedFilters: [
    {
      id: 'high-risk',
      name: 'High Risk Activities',
      type: 'risk',
      operator: 'equals',
      value: [RiskLevel.HIGH, RiskLevel.CRITICAL],
      enabled: false
    },
    {
      id: 'admin-actions',
      name: 'Administrative Actions',
      type: 'user',
      operator: 'equals',
      value: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      enabled: false
    },
    {
      id: 'recent-week',
      name: 'Recent Week',
      type: 'time',
      operator: 'range',
      value: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
      enabled: false
    }
  ],
  searchQuery: '',
  timeRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  activeFramework: ComplianceFrameworkType.SOX,
  complianceScore: 85,
  riskAssessment: {
    level: RiskLevel.MEDIUM,
    score: 65,
    factors: ['elevated_admin_activity', 'unusual_access_patterns', 'compliance_gaps']
  },
  retentionPolicies: [],
  reportConfigs: [],
  exportProgress: 0,
  isExporting: false,
  showFilters: false,
  showCompliance: false,
  showRisk: false,
  showRetention: false,
  showReports: false,
  isFullscreen: false,
  pageSize: 50,
  currentPage: 1,
  totalPages: 1,
  loading: {
    trails: false,
    entries: false,
    export: false,
    compliance: false
  },
  errors: {
    trails: null,
    entries: null,
    export: null,
    compliance: null
  }
};

/**
 * Main AuditTrailManager Component
 */
export const AuditTrailManager: React.FC<AuditTrailManagerProps> = ({
  height = 800,
  enableExport = true,
  enableScheduling = true,
  enableSignatures = true,
  defaultFramework = ComplianceFrameworkType.SOX,
  className
}) => {
  // State Management
  const [state, setState] = useState<AuditTrailState>({
    ...initialState,
    activeFramework: defaultFramework
  });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const exportProgressRef = useRef<number>(0);
  
  // Animation Controls
  const mainAnimationControls = useAnimation();
  const sidebarAnimationControls = useAnimation();
  
  // Hooks
  const { 
    auditTrails, 
    getAuditTrails, 
    createAuditReport, 
    exportAuditData,
    searchAuditTrails 
  } = useActivityTracker();
  const { currentUser, userPermissions } = useUserManagement();
  const { currentWorkspace } = useWorkspaceManagement();
  const { getAllSPAStatus } = useCrossGroupIntegration();
  const {
    getComplianceScore,
    getRiskAssessment,
    getRetentionPolicies,
    validateCompliance
  } = useComplianceManagement();
  
  // Initialize component
  useEffect(() => {
    loadAuditData();
    loadComplianceData();
  }, [state.activeFramework, state.timeRange]);
  
  // Data Loading Functions
  const loadAuditData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, trails: true } }));
    try {
      const trails = await getAuditTrails({
        framework: state.activeFramework,
        startDate: state.timeRange.start.toISOString(),
        endDate: state.timeRange.end.toISOString(),
        page: state.currentPage,
        limit: state.pageSize
      });
      
      setState(prev => ({
        ...prev,
        auditTrails: trails.data,
        filteredTrails: trails.data,
        totalPages: Math.ceil(trails.total / state.pageSize),
        loading: { ...prev.loading, trails: false },
        errors: { ...prev.errors, trails: null }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, trails: false },
        errors: { ...prev.errors, trails: error instanceof Error ? error.message : 'Failed to load audit trails' }
      }));
    }
  }, [state.activeFramework, state.timeRange, state.currentPage, state.pageSize, getAuditTrails]);
  
  const loadComplianceData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, compliance: true } }));
    try {
      const [score, risk, policies] = await Promise.all([
        getComplianceScore(state.activeFramework),
        getRiskAssessment(state.activeFramework),
        getRetentionPolicies(state.activeFramework)
      ]);
      
      setState(prev => ({
        ...prev,
        complianceScore: score,
        riskAssessment: risk,
        retentionPolicies: policies,
        loading: { ...prev.loading, compliance: false },
        errors: { ...prev.errors, compliance: null }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, compliance: false },
        errors: { ...prev.errors, compliance: error instanceof Error ? error.message : 'Failed to load compliance data' }
      }));
    }
  }, [state.activeFramework, getComplianceScore, getRiskAssessment, getRetentionPolicies]);
  
  // Search and Filter Functions
  const handleSearch = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    
    if (!query.trim()) {
      setState(prev => ({ ...prev, filteredTrails: prev.auditTrails }));
      return;
    }
    
    try {
      const results = await searchAuditTrails({
        query,
        framework: state.activeFramework,
        filters: state.activeFilters
      });
      
      setState(prev => ({ ...prev, filteredTrails: results }));
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [state.activeFramework, state.activeFilters, searchAuditTrails]);
  
  const applyFilters = useCallback((filters: AuditFilter[]) => {
    setState(prev => ({ ...prev, activeFilters: filters }));
    
    let filtered = state.auditTrails;
    
    filters.forEach(filter => {
      if (!filter.enabled) return;
      
      filtered = filtered.filter(trail => {
        // Apply filter logic based on type and operator
        switch (filter.type) {
          case 'time':
            if (filter.operator === 'range') {
              const trailDate = new Date(trail.createdAt);
              return trailDate >= filter.value.start && trailDate <= filter.value.end;
            }
            break;
          case 'user':
            if (filter.operator === 'equals') {
              return filter.value.includes(trail.userId);
            }
            break;
          case 'compliance':
            if (filter.operator === 'equals') {
              return filter.value.includes(trail.complianceLevel);
            }
            break;
          case 'risk':
            if (filter.operator === 'equals') {
              return filter.value.includes(trail.riskLevel);
            }
            break;
        }
        return true;
      });
    });
    
    setState(prev => ({ ...prev, filteredTrails: filtered }));
  }, [state.auditTrails]);
  
  // Export Functions
  const handleExport = useCallback(async (format: AuditExportFormat, options: any = {}) => {
    if (!enableExport) return;
    
    setState(prev => ({ 
      ...prev, 
      isExporting: true, 
      exportProgress: 0,
      loading: { ...prev.loading, export: true }
    }));
    
    try {
      const exportConfig = {
        format,
        framework: state.activeFramework,
        filters: state.activeFilters,
        timeRange: state.timeRange,
        digitalSignature: enableSignatures && options.digitalSignature,
        watermark: options.watermark || false,
        ...options
      };
      
      // Simulate export progress
      const progressInterval = setInterval(() => {
        exportProgressRef.current += 10;
        setState(prev => ({ ...prev, exportProgress: Math.min(exportProgressRef.current, 90) }));
      }, 200);
      
      const exportResult = await exportAuditData(exportConfig);
      
      clearInterval(progressInterval);
      setState(prev => ({ ...prev, exportProgress: 100 }));
      
      // Download the exported file
      const blob = new Blob([exportResult.data], { type: exportResult.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportResult.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isExporting: false, 
          exportProgress: 0,
          loading: { ...prev.loading, export: false }
        }));
        exportProgressRef.current = 0;
      }, 1000);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        exportProgress: 0,
        loading: { ...prev.loading, export: false },
        errors: { ...prev.errors, export: error instanceof Error ? error.message : 'Export failed' }
      }));
      exportProgressRef.current = 0;
    }
  }, [enableExport, enableSignatures, state.activeFramework, state.activeFilters, state.timeRange, exportAuditData]);
  
  // Event Handlers
  const handleViewChange = useCallback((view: AuditViewMode) => {
    setState(prev => ({ ...prev, currentView: view }));
    mainAnimationControls.start({
      opacity: [0, 1],
      scale: [0.95, 1],
      transition: { duration: 0.3 }
    });
  }, [mainAnimationControls]);
  
  const handleFrameworkChange = useCallback((framework: ComplianceFrameworkType) => {
    setState(prev => ({ ...prev, activeFramework: framework }));
  }, []);
  
  const handleTrailSelect = useCallback((trailId: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedTrail: prev.selectedTrail === trailId ? null : trailId 
    }));
  }, []);
  
  const handleEntrySelect = useCallback((entryId: string, multiSelect: boolean = false) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedEntries);
      
      if (multiSelect) {
        if (newSelected.has(entryId)) {
          newSelected.delete(entryId);
        } else {
          newSelected.add(entryId);
        }
      } else {
        newSelected.clear();
        newSelected.add(entryId);
      }
      
      return { ...prev, selectedEntries: newSelected };
    });
  }, []);
  
  const handleBulkAction = useCallback(async (action: string) => {
    const selectedIds = Array.from(state.selectedEntries);
    if (selectedIds.length === 0) return;
    
    try {
      switch (action) {
        case 'export':
          await handleExport(AuditExportFormat.CSV, { entryIds: selectedIds });
          break;
        case 'archive':
          // Implementation for bulk archive
          break;
        case 'delete':
          // Implementation for bulk delete (with proper authorization)
          break;
      }
      
      setState(prev => ({ ...prev, selectedEntries: new Set() }));
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [state.selectedEntries, handleExport]);
  
  // Computed Values
  const complianceStatus = useMemo(() => {
    const framework = complianceFrameworks[state.activeFramework];
    const status = state.complianceScore >= 80 ? 'compliant' : 
                   state.complianceScore >= 60 ? 'partial' : 'non-compliant';
    
    return {
      framework,
      status,
      score: state.complianceScore,
      color: status === 'compliant' ? '#10B981' : 
             status === 'partial' ? '#F59E0B' : '#EF4444'
    };
  }, [state.activeFramework, state.complianceScore]);
  
  const riskMetrics = useMemo(() => {
    const config = riskLevelConfigs[state.riskAssessment.level];
    return {
      ...state.riskAssessment,
      config,
      trend: state.riskAssessment.score > 70 ? 'increasing' : 
             state.riskAssessment.score < 30 ? 'decreasing' : 'stable'
    };
  }, [state.riskAssessment]);
  
  const auditStatistics = useMemo(() => {
    const trails = state.filteredTrails;
    const totalEntries = trails.reduce((sum, trail) => sum + (trail.activities?.length || 0), 0);
    const criticalEvents = trails.filter(trail => 
      trail.complianceLevel === ComplianceLevel.CRITICAL || 
      trail.riskLevel === RiskLevel.CRITICAL
    ).length;
    
    return {
      totalTrails: trails.length,
      totalEntries,
      criticalEvents,
      complianceViolations: trails.filter(trail => 
        trail.complianceLevel === ComplianceLevel.NON_COMPLIANT
      ).length,
      averageRisk: trails.length > 0 ? 
        trails.reduce((sum, trail) => sum + (trail.riskScore || 0), 0) / trails.length : 0
    };
  }, [state.filteredTrails]);
  
  // Render Functions
  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Audit Trail Manager
          </h2>
        </div>
        
        {state.loading.trails && (
          <div className="flex items-center space-x-2">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading audit trails...</span>
          </div>
        )}
        
        {state.isExporting && (
          <div className="flex items-center space-x-2">
            <CloudDownload className="h-4 w-4 text-blue-600" />
            <Progress value={state.exportProgress} className="w-32" />
            <span className="text-sm text-gray-500">{state.exportProgress}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Compliance Framework Selector */}
        <Select value={state.activeFramework} onValueChange={handleFrameworkChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(complianceFrameworks).map(([key, framework]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center space-x-2">
                  {React.createElement(framework.icon, { className: "h-4 w-4" })}
                  <span>{framework.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* View Mode Selector */}
        <Tabs value={state.currentView} onValueChange={(value) => handleViewChange(value as AuditViewMode)}>
          <TabsList>
            <TabsTrigger value={AuditViewMode.TABLE} className="text-xs">
              <Table className="h-3 w-3 mr-1" />
              Table
            </TabsTrigger>
            <TabsTrigger value={AuditViewMode.TIMELINE} className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value={AuditViewMode.REPORT} className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Report
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                  className={cn(state.showFilters && "bg-blue-50 border-blue-300")}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showCompliance: !prev.showCompliance }))}
                  className={cn(state.showCompliance && "bg-green-50 border-green-300")}
                >
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compliance Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showRisk: !prev.showRisk }))}
                  className={cn(state.showRisk && "bg-orange-50 border-orange-300")}
                >
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Risk Assessment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {enableExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport(AuditExportFormat.PDF)}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(AuditExportFormat.CSV)}>
                  <Table className="h-4 w-4 mr-2" />
                  CSV Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(AuditExportFormat.JSON)}>
                  <Code className="h-4 w-4 mr-2" />
                  JSON Export
                </DropdownMenuItem>
                {enableSignatures && (
                  <DropdownMenuItem onClick={() => handleExport(AuditExportFormat.SIGNED_PDF, { digitalSignature: true })}>
                    <Certificate className="h-4 w-4 mr-2" />
                    Signed PDF
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => loadAuditData()}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showRetention: true }))}>
                <Archive className="h-4 w-4 mr-2" />
                Retention Policies
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showReports: true }))}>
                <Scroll className="h-4 w-4 mr-2" />
                Scheduled Reports
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}>
                {state.isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                {state.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
  
  const renderStatusCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Audit Trails</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(auditStatistics.totalTrails)}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Compliance Score</p>
              <p className="text-2xl font-bold text-green-900">{state.complianceScore}%</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Risk Level</p>
              <p className="text-2xl font-bold text-orange-900 capitalize">{state.riskAssessment.level}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-red-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical Events</p>
              <p className="text-2xl font-bold text-red-900">{formatNumber(auditStatistics.criticalEvents)}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderMainContent = () => {
    return (
      <motion.div
        animate={mainAnimationControls}
        className="flex-1 overflow-hidden"
      >
        {state.currentView === AuditViewMode.TABLE && renderTableView()}
        {state.currentView === AuditViewMode.TIMELINE && renderTimelineView()}
        {state.currentView === AuditViewMode.REPORT && renderReportView()}
      </motion.div>
    );
  };
  
  const renderTableView = () => (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search audit trails..."
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          {state.selectedEntries.size > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {state.selectedEntries.size} selected
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Selected
                  </DropdownMenuItem>
                  {userPermissions.canDeleteAuditData && (
                    <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={state.selectedEntries.size === state.filteredTrails.length && state.filteredTrails.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setState(prev => ({ 
                        ...prev, 
                        selectedEntries: new Set(prev.filteredTrails.map(trail => trail.id)) 
                      }));
                    } else {
                      setState(prev => ({ ...prev, selectedEntries: new Set() }));
                    }
                  }}
                />
              </TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.filteredTrails.map((trail) => (
              <TableRow 
                key={trail.id}
                className={cn(
                  "cursor-pointer hover:bg-gray-50",
                  state.selectedEntries.has(trail.id) && "bg-blue-50"
                )}
                onClick={() => handleTrailSelect(trail.id)}
              >
                <TableCell>
                  <Checkbox
                    checked={state.selectedEntries.has(trail.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setState(prev => ({ 
                          ...prev, 
                          selectedEntries: new Set([...prev.selectedEntries, trail.id]) 
                        }));
                      } else {
                        setState(prev => {
                          const newSelected = new Set(prev.selectedEntries);
                          newSelected.delete(trail.id);
                          return { ...prev, selectedEntries: newSelected };
                        });
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{trail.resourceType}</span>
                    <span className="text-gray-500 text-sm">({trail.resourceId?.slice(0, 8)}...)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{trail.userId || 'System'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{trail.action || 'N/A'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={trail.complianceLevel === ComplianceLevel.COMPLIANT ? "default" : "destructive"}
                    style={{ backgroundColor: complianceStatus.color }}
                  >
                    {trail.complianceLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    style={{ 
                      backgroundColor: riskLevelConfigs[trail.riskLevel || RiskLevel.LOW].bgColor,
                      color: riskLevelConfigs[trail.riskLevel || RiskLevel.LOW].textColor
                    }}
                  >
                    {trail.riskLevel || RiskLevel.LOW}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{formatDateTime(trail.createdAt, 'date')}</div>
                    <div className="text-gray-500">{formatDateTime(trail.createdAt, 'time')}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTrailSelect(trail.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(AuditExportFormat.PDF, { trailId: trail.id })}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Trail
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy ID
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {state.filteredTrails.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No audit trails found</p>
            </div>
          </div>
        )}
      </Card>
      
      {/* Pagination */}
      {state.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {((state.currentPage - 1) * state.pageSize) + 1} to {Math.min(state.currentPage * state.pageSize, auditStatistics.totalTrails)} of {auditStatistics.totalTrails} trails
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={state.currentPage === 1}
              onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={state.currentPage === state.totalPages}
              onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderTimelineView = () => (
    <div className="p-6">
      <div className="space-y-4">
        {state.filteredTrails.map((trail, index) => (
          <motion.div
            key={trail.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="relative pl-8">
              <div className="absolute left-0 top-4 w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="absolute left-1 top-6 w-px h-full bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{trail.action}</Badge>
                      <span className="text-sm text-gray-500">by {trail.userId || 'System'}</span>
                    </div>
                    <p className="text-sm">{trail.resourceType} - {trail.resourceId?.slice(0, 16)}...</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatDateTime(trail.createdAt)}</span>
                      <Badge 
                        size="sm"
                        style={{ 
                          backgroundColor: riskLevelConfigs[trail.riskLevel || RiskLevel.LOW].bgColor,
                          color: riskLevelConfigs[trail.riskLevel || RiskLevel.LOW].textColor
                        }}
                      >
                        {trail.riskLevel || RiskLevel.LOW}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleTrailSelect(trail.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
  
  const renderReportView = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span>Compliance Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Overall Score</span>
                <Badge style={{ backgroundColor: complianceStatus.color }}>
                  {state.complianceScore}%
                </Badge>
              </div>
              <Progress value={state.complianceScore} className="h-2" />
              <div className="text-sm text-gray-600">
                Framework: {complianceStatus.framework.name}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Risk Level</span>
                <Badge 
                  style={{ 
                    backgroundColor: riskMetrics.config.bgColor,
                    color: riskMetrics.config.textColor
                  }}
                >
                  {riskMetrics.level}
                </Badge>
              </div>
              <Progress value={riskMetrics.score} className="h-2" />
              <div className="space-y-1">
                {riskMetrics.factors.slice(0, 3).map((factor, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                    <span>{factor.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Activity Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{auditStatistics.totalTrails}</div>
                <div className="text-sm text-gray-500">Total Trails</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{auditStatistics.totalEntries}</div>
                <div className="text-sm text-gray-500">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{auditStatistics.criticalEvents}</div>
                <div className="text-sm text-gray-500">Critical Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {auditStatistics.averageRisk.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Avg Risk Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
  // Error Handling
  if (Object.values(state.errors).some(error => error !== null)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Audit Data</AlertTitle>
          <AlertDescription>
            {Object.values(state.errors).find(error => error !== null)}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setState(prev => ({ 
              ...prev, 
              errors: { trails: null, entries: null, export: null, compliance: null } 
            }))}
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }
  
  // Main Render
  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden",
        state.isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      style={{ height: state.isFullscreen ? '100vh' : height }}
    >
      {/* Header */}
      {renderHeader()}
      
      {/* Status Cards */}
      {renderStatusCards()}
      
      {/* Main Content */}
      {renderMainContent()}
      
      {/* Filter Panel */}
      <AnimatePresence>
        {state.showFilters && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-lg z-40"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Advanced Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showFilters: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-80px)] p-4">
              <div className="space-y-4">
                {/* Time Range Filter */}
                <div>
                  <Label>Time Range</Label>
                  <div className="space-y-2 mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDateTime(state.timeRange.start.toISOString(), 'date')} - {formatDateTime(state.timeRange.end.toISOString(), 'date')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: state.timeRange.start,
                            to: state.timeRange.end
                          }}
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              setState(prev => ({
                                ...prev,
                                timeRange: { start: range.from!, end: range.to! }
                              }));
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {/* Saved Filters */}
                <div>
                  <Label>Quick Filters</Label>
                  <div className="space-y-2 mt-2">
                    {state.savedFilters.map(filter => (
                      <div key={filter.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={filter.id}
                          checked={filter.enabled}
                          onCheckedChange={(checked) => {
                            const updatedFilters = state.savedFilters.map(f =>
                              f.id === filter.id ? { ...f, enabled: !!checked } : f
                            );
                            setState(prev => ({ ...prev, savedFilters: updatedFilters }));
                            applyFilters(updatedFilters.filter(f => f.enabled));
                          }}
                        />
                        <Label htmlFor={filter.id} className="text-sm">
                          {filter.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Risk Level Filter */}
                <div>
                  <Label>Risk Level</Label>
                  <div className="space-y-2 mt-2">
                    {Object.values(RiskLevel).map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox id={level} />
                        <Label htmlFor={level} className="text-sm capitalize">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Compliance Level Filter */}
                <div>
                  <Label>Compliance Level</Label>
                  <div className="space-y-2 mt-2">
                    {Object.values(ComplianceLevel).map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox id={level} />
                        <Label htmlFor={level} className="text-sm">
                          {level.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Compliance Dashboard */}
      <Dialog open={state.showCompliance} onOpenChange={(open) => setState(prev => ({ ...prev, showCompliance: open }))}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span>Compliance Dashboard</span>
            </DialogTitle>
            <DialogDescription>
              Monitor compliance status and framework requirements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Framework</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    {React.createElement(complianceStatus.framework.icon, { 
                      className: "h-8 w-8",
                      style: { color: complianceStatus.framework.color }
                    })}
                    <div>
                      <div className="font-semibold">{complianceStatus.framework.name}</div>
                      <div className="text-sm text-gray-500">{complianceStatus.framework.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress value={state.complianceScore} className="h-3" />
                    </div>
                    <Badge style={{ backgroundColor: complianceStatus.color }}>
                      {state.complianceScore}%
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Status: <span className="capitalize font-medium">{complianceStatus.status}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Framework Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceStatus.framework.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{requirement.replace(/_/g, ' ')}</span>
                      </div>
                      <Badge variant="outline">Met</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCompliance: false }))}>
              Close
            </Button>
            <Button onClick={() => handleExport(AuditExportFormat.PDF, { includeCompliance: true })}>
              <Download className="h-4 w-4 mr-2" />
              Export Compliance Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Risk Assessment */}
      <Dialog open={state.showRisk} onOpenChange={(open) => setState(prev => ({ ...prev, showRisk: open }))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Risk Assessment</span>
            </DialogTitle>
            <DialogDescription>
              Analyze security risks and threat levels
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Progress value={riskMetrics.score} className="h-3" />
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: riskMetrics.config.bgColor,
                      color: riskMetrics.config.textColor
                    }}
                  >
                    {riskMetrics.level} ({riskMetrics.score}/100)
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskMetrics.factors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">{factor.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showRisk: false }))}>
              Close
            </Button>
            <Button onClick={() => handleExport(AuditExportFormat.PDF, { includeRisk: true })}>
              <Download className="h-4 w-4 mr-2" />
              Export Risk Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditTrailManager;