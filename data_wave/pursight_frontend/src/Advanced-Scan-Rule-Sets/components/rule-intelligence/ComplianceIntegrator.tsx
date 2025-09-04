import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, CheckCircle2, XCircle, AlertTriangle, Info, Zap, Activity, BarChart3, PieChart, Target, Settings, RefreshCw, Play, Pause, Square, Clock, Search, Filter, Plus, Edit, Trash2, Download, Upload, Save, Copy, MoreHorizontal, ExternalLink, Database, Users, Lock, Unlock, Key, Eye, EyeOff, BookOpen, Scale, Gavel, Badge as BadgeIcon, Award, AlertOctagon, CheckSquare, Clipboard, FileCheck, FileMinus, FileX } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// API Services
import { intelligenceAPI } from '../../services/intelligence-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';
import { reportingAPI } from '../../services/reporting-apis';

// Types
import type { 
  ComplianceFramework,
  ComplianceRule,
  ComplianceMapping,
  ComplianceAssessment,
  ComplianceGap,
  ComplianceMetrics,
  RegulatoryRequirement,
  ComplianceStatus,
  ComplianceReport,
  AuditTrail,
  CompliancePolicy,
  ControlObjective,
  ComplianceEvidence,
  RiskControl,
  ComplianceScore,
  ComplianceViolation,
  ComplianceTrend,
  ComplianceRemediation,
  ComplianceCategory,
  ComplianceSeverity
} from '../../types/intelligence.types';

import type { 
  ScanRule,
  RuleSet,
  RulePattern
} from '../../types/scan-rules.types';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { performanceCalculator } from '../../utils/performance-calculator';

interface ComplianceIntegratorProps {
  className?: string;
  onComplianceMapped?: (mapping: ComplianceMapping) => void;
  onViolationDetected?: (violation: ComplianceViolation) => void;
  onAssessmentCompleted?: (assessment: ComplianceAssessment) => void;
}

interface ComplianceIntegratorState {
  frameworks: ComplianceFramework[];
  rules: ScanRule[];
  mappings: ComplianceMapping[];
  assessments: ComplianceAssessment[];
  gaps: ComplianceGap[];
  violations: ComplianceViolation[];
  metrics: ComplianceMetrics;
  auditTrails: AuditTrail[];
  policies: CompliancePolicy[];
  requirements: RegulatoryRequirement[];
  controls: RiskControl[];
  evidence: ComplianceEvidence[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalFrameworks: number;
  mappedRules: number;
  complianceScore: number;
  activeViolations: number;
  resolvedViolations: number;
  criticalGaps: number;
  completedAssessments: number;
  pendingRemediation: number;
  automatedChecks: number;
  manualReviews: number;
}

interface ComplianceViewState {
  currentView: 'overview' | 'frameworks' | 'mappings' | 'assessments' | 'violations' | 'reports';
  selectedFramework?: ComplianceFramework;
  selectedMapping?: ComplianceMapping;
  selectedAssessment?: ComplianceAssessment;
  frameworkFilter: string;
  severityFilter: string;
  statusFilter: string;
  categoryFilter: string;
  autoMapping: boolean;
  continuousMonitoring: boolean;
  realTimeAlerts: boolean;
  autoRemediation: boolean;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTimeRange: 'day' | 'week' | 'month' | 'quarter';
  showDetails: boolean;
}

const DEFAULT_VIEW_STATE: ComplianceViewState = {
  currentView: 'overview',
  frameworkFilter: 'all',
  severityFilter: 'all',
  statusFilter: 'all',
  categoryFilter: 'all',
  autoMapping: true,
  continuousMonitoring: true,
  realTimeAlerts: true,
  autoRemediation: false,
  searchQuery: '',
  sortBy: 'compliance_score',
  sortOrder: 'desc',
  selectedTimeRange: 'month',
  showDetails: false
};

const COMPLIANCE_FRAMEWORKS = [
  { id: 'gdpr', name: 'GDPR', description: 'General Data Protection Regulation', color: 'blue' },
  { id: 'hipaa', name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act', color: 'green' },
  { id: 'sox', name: 'SOX', description: 'Sarbanes-Oxley Act', color: 'purple' },
  { id: 'pci_dss', name: 'PCI DSS', description: 'Payment Card Industry Data Security Standard', color: 'red' },
  { id: 'iso27001', name: 'ISO 27001', description: 'Information Security Management System', color: 'orange' },
  { id: 'nist', name: 'NIST', description: 'National Institute of Standards and Technology', color: 'teal' },
  { id: 'ccpa', name: 'CCPA', description: 'California Consumer Privacy Act', color: 'pink' },
  { id: 'fedramp', name: 'FedRAMP', description: 'Federal Risk and Authorization Management Program', color: 'indigo' }
];

const COMPLIANCE_STATUSES = [
  { value: 'compliant', label: 'Compliant', color: 'text-green-600 bg-green-100', icon: CheckCircle2 },
  { value: 'non_compliant', label: 'Non-Compliant', color: 'text-red-600 bg-red-100', icon: XCircle },
  { value: 'partial', label: 'Partially Compliant', color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle },
  { value: 'pending', label: 'Pending Review', color: 'text-blue-600 bg-blue-100', icon: Clock },
  { value: 'exempt', label: 'Exempt', color: 'text-gray-600 bg-gray-100', icon: Minus }
];

const COMPLIANCE_SEVERITIES = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' }
];

const COMPLIANCE_CATEGORIES = [
  { value: 'data_protection', label: 'Data Protection', icon: Lock },
  { value: 'access_control', label: 'Access Control', icon: Key },
  { value: 'audit_logging', label: 'Audit & Logging', icon: FileText },
  { value: 'encryption', label: 'Encryption', icon: Shield },
  { value: 'risk_management', label: 'Risk Management', icon: AlertTriangle },
  { value: 'incident_response', label: 'Incident Response', icon: Zap },
  { value: 'business_continuity', label: 'Business Continuity', icon: Activity },
  { value: 'governance', label: 'Governance', icon: Scale }
];

export const ComplianceIntegrator: React.FC<ComplianceIntegratorProps> = ({
  className,
  onComplianceMapped,
  onViolationDetected,
  onAssessmentCompleted
}) => {
  // State Management
  const [viewState, setViewState] = useState<ComplianceViewState>(DEFAULT_VIEW_STATE);
  const [integratorState, setIntegratorState] = useState<ComplianceIntegratorState>({
    frameworks: [],
    rules: [],
    mappings: [],
    assessments: [],
    gaps: [],
    violations: [],
    metrics: {} as ComplianceMetrics,
    auditTrails: [],
    policies: [],
    requirements: [],
    controls: [],
    evidence: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalFrameworks: 0,
    mappedRules: 0,
    complianceScore: 0,
    activeViolations: 0,
    resolvedViolations: 0,
    criticalGaps: 0,
    completedAssessments: 0,
    pendingRemediation: 0,
    automatedChecks: 0,
    manualReviews: 0
  });

  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Form States
  const [mappingForm, setMappingForm] = useState({
    frameworkId: '',
    ruleIds: [] as string[],
    requirementIds: [] as string[],
    mappingType: 'automatic',
    confidenceThreshold: 0.8,
    includeEvidence: true,
    generateDocumentation: true
  });

  const [assessmentForm, setAssessmentForm] = useState({
    frameworkId: '',
    scope: 'full',
    assessmentType: 'automated',
    includeManualReview: false,
    generateReport: true,
    scheduledDate: '',
    assessor: ''
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout>();

  // Custom Hooks
  const {
    getInsights,
    analyzePerformance,
    generatePredictions,
    loading: intelligenceLoading
  } = useIntelligence();

  const {
    scanRules,
    ruleSets,
    getRules,
    loading: rulesLoading
  } = useScanRules();

  const {
    generateReport,
    getAnalytics,
    loading: reportingLoading
  } = useReporting();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.continuousMonitoring) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/compliance`);
      
      wsRef.current.onopen = () => {
        console.log('Compliance WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Compliance WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Compliance WebSocket disconnected');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewState.continuousMonitoring]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'compliance_mapped':
        setIntegratorState(prev => ({
          ...prev,
          mappings: [...prev.mappings, data.mapping],
          mappedRules: prev.mappedRules + 1
        }));
        if (onComplianceMapped) onComplianceMapped(data.mapping);
        break;
      case 'violation_detected':
        setIntegratorState(prev => ({
          ...prev,
          violations: [...prev.violations, data.violation],
          activeViolations: prev.activeViolations + 1
        }));
        if (onViolationDetected && viewState.realTimeAlerts) onViolationDetected(data.violation);
        break;
      case 'assessment_completed':
        setIntegratorState(prev => ({
          ...prev,
          assessments: [...prev.assessments, data.assessment],
          completedAssessments: prev.completedAssessments + 1
        }));
        if (onAssessmentCompleted) onAssessmentCompleted(data.assessment);
        break;
      case 'gap_identified':
        setIntegratorState(prev => ({
          ...prev,
          gaps: [...prev.gaps, data.gap],
          criticalGaps: data.gap.severity === 'critical' ? prev.criticalGaps + 1 : prev.criticalGaps
        }));
        break;
      case 'metrics_updated':
        setIntegratorState(prev => ({
          ...prev,
          metrics: data.metrics,
          complianceScore: data.metrics.overallScore,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [onComplianceMapped, onViolationDetected, onAssessmentCompleted, viewState.realTimeAlerts]);

  // Continuous monitoring
  useEffect(() => {
    if (viewState.continuousMonitoring) {
      monitoringIntervalRef.current = setInterval(() => {
        performContinuousMonitoring();
      }, 300000); // Every 5 minutes
    }

    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [viewState.continuousMonitoring]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setIntegratorState(prev => ({ ...prev, loading: true, error: null }));

      const [frameworksData, rulesData, mappingsData, assessmentsData, metricsData] = await Promise.all([
        intelligenceAPI.getComplianceFrameworks(),
        scanRulesAPI.getRules({ includeMetadata: true }),
        intelligenceAPI.getComplianceMappings({ 
          framework: viewState.frameworkFilter !== 'all' ? viewState.frameworkFilter : undefined,
          status: viewState.statusFilter !== 'all' ? viewState.statusFilter : undefined
        }),
        intelligenceAPI.getComplianceAssessments({ 
          timeRange: viewState.selectedTimeRange 
        }),
        intelligenceAPI.getComplianceMetrics()
      ]);

      setIntegratorState(prev => ({
        ...prev,
        frameworks: frameworksData.frameworks,
        rules: rulesData.rules,
        mappings: mappingsData.mappings,
        assessments: assessmentsData.assessments,
        metrics: metricsData,
        totalFrameworks: frameworksData.total,
        mappedRules: mappingsData.mappings.length,
        complianceScore: metricsData.overallScore,
        completedAssessments: assessmentsData.total,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate derived metrics
      const activeViolationsCount = mappingsData.mappings.filter(m => 
        m.status === 'non_compliant'
      ).length;

      const resolvedViolationsCount = mappingsData.mappings.filter(m => 
        m.status === 'compliant' && m.previousStatus === 'non_compliant'
      ).length;

      const criticalGapsCount = assessmentsData.assessments.reduce((sum, assessment) => 
        sum + (assessment.gaps?.filter(gap => gap.severity === 'critical').length || 0), 0
      );

      setIntegratorState(prev => ({
        ...prev,
        activeViolations: activeViolationsCount,
        resolvedViolations: resolvedViolationsCount,
        criticalGaps: criticalGapsCount
      }));

    } catch (error) {
      console.error('Failed to refresh compliance data:', error);
      setIntegratorState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.frameworkFilter, viewState.statusFilter, viewState.selectedTimeRange]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Compliance Functions
  const performContinuousMonitoring = useCallback(async () => {
    try {
      const monitoringResults = await intelligenceAPI.performContinuousCompliance({
        frameworks: integratorState.frameworks.map(f => f.id),
        rules: integratorState.rules.map(r => r.id),
        checkViolations: true,
        checkGaps: true,
        generateAlerts: viewState.realTimeAlerts
      });

      // Process monitoring results
      if (monitoringResults.newViolations) {
        monitoringResults.newViolations.forEach(violation => {
          if (onViolationDetected && viewState.realTimeAlerts) {
            onViolationDetected(violation);
          }
        });
      }
    } catch (error) {
      console.error('Continuous monitoring failed:', error);
    }
  }, [integratorState.frameworks, integratorState.rules, viewState.realTimeAlerts, onViolationDetected]);

  const createComplianceMapping = useCallback(async () => {
    try {
      const mapping = await intelligenceAPI.createComplianceMapping({
        frameworkId: mappingForm.frameworkId,
        ruleIds: mappingForm.ruleIds,
        requirementIds: mappingForm.requirementIds,
        mappingType: mappingForm.mappingType,
        confidenceThreshold: mappingForm.confidenceThreshold,
        includeEvidence: mappingForm.includeEvidence,
        generateDocumentation: mappingForm.generateDocumentation
      });

      setIntegratorState(prev => ({
        ...prev,
        mappings: [...prev.mappings, mapping],
        mappedRules: prev.mappedRules + mappingForm.ruleIds.length
      }));

      if (onComplianceMapped) onComplianceMapped(mapping);
      setMappingDialogOpen(false);
    } catch (error) {
      console.error('Failed to create compliance mapping:', error);
    }
  }, [mappingForm, onComplianceMapped]);

  const performComplianceAssessment = useCallback(async () => {
    try {
      const assessment = await intelligenceAPI.performComplianceAssessment({
        frameworkId: assessmentForm.frameworkId,
        scope: assessmentForm.scope,
        assessmentType: assessmentForm.assessmentType,
        includeManualReview: assessmentForm.includeManualReview,
        generateReport: assessmentForm.generateReport,
        scheduledDate: assessmentForm.scheduledDate,
        assessor: assessmentForm.assessor
      });

      setIntegratorState(prev => ({
        ...prev,
        assessments: [...prev.assessments, assessment],
        completedAssessments: prev.completedAssessments + 1
      }));

      if (onAssessmentCompleted) onAssessmentCompleted(assessment);
      setAssessmentDialogOpen(false);
    } catch (error) {
      console.error('Failed to perform compliance assessment:', error);
    }
  }, [assessmentForm, onAssessmentCompleted]);

  const generateComplianceReport = useCallback(async (frameworkId: string, period: string) => {
    try {
      const report = await intelligenceAPI.generateComplianceReport({
        frameworkId: frameworkId,
        period: period,
        includeMetrics: true,
        includeViolations: true,
        includeRemediation: true,
        format: 'pdf'
      });

      // ArrowDownTrayIcon report
      const link = document.createElement('a');
      link.href = report.downloadUrl;
      link.download = `compliance-report-${frameworkId}-${period}.pdf`;
      link.click();
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
    }
  }, []);

  const remediumeViolation = useCallback(async (violationId: string, remediation: ComplianceRemediation) => {
    try {
      await intelligenceAPI.remediateViolation({
        violationId: violationId,
        remediation: remediation,
        autoApply: viewState.autoRemediation
      });

      setIntegratorState(prev => ({
        ...prev,
        violations: prev.violations.map(v => 
          v.id === violationId 
            ? { ...v, status: 'remediated', remediation: remediation }
            : v
        ),
        activeViolations: prev.activeViolations - 1,
        resolvedViolations: prev.resolvedViolations + 1
      }));
    } catch (error) {
      console.error('Failed to remediate violation:', error);
    }
  }, [viewState.autoRemediation]);

  // Utility Functions
  const getStatusColor = useCallback((status: ComplianceStatus) => {
    const statusConfig = COMPLIANCE_STATUSES.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getStatusIcon = useCallback((status: ComplianceStatus) => {
    const statusConfig = COMPLIANCE_STATUSES.find(s => s.value === status);
    if (statusConfig) {
      const IconComponent = statusConfig.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
  }, []);

  const getSeverityColor = useCallback((severity: ComplianceSeverity) => {
    const sev = COMPLIANCE_SEVERITIES.find(s => s.value === severity);
    return sev ? sev.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getFrameworkColor = useCallback((frameworkId: string) => {
    const framework = COMPLIANCE_FRAMEWORKS.find(f => f.id === frameworkId);
    return framework ? framework.color : 'gray';
  }, []);

  const getCategoryIcon = useCallback((category: ComplianceCategory) => {
    const cat = COMPLIANCE_CATEGORIES.find(c => c.value === category);
    if (cat) {
      const IconComponent = cat.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  }, []);

  // Filter and Search Functions
  const filteredMappings = useMemo(() => {
    let filtered = integratorState.mappings;

    if (viewState.searchQuery) {
      filtered = filtered.filter(mapping => 
        mapping.frameworkName?.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        mapping.requirementTitle?.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.frameworkFilter !== 'all') {
      filtered = filtered.filter(mapping => mapping.frameworkId === viewState.frameworkFilter);
    }

    if (viewState.statusFilter !== 'all') {
      filtered = filtered.filter(mapping => mapping.status === viewState.statusFilter);
    }

    if (viewState.severityFilter !== 'all') {
      filtered = filtered.filter(mapping => mapping.severity === viewState.severityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'compliance_score':
          aValue = a.complianceScore || 0;
          bValue = b.complianceScore || 0;
          break;
        case 'status':
          aValue = COMPLIANCE_STATUSES.findIndex(s => s.value === a.status);
          bValue = COMPLIANCE_STATUSES.findIndex(s => s.value === b.status);
          break;
        case 'framework':
          aValue = a.frameworkName || '';
          bValue = b.frameworkName || '';
          break;
        case 'last_updated':
          aValue = new Date(a.lastUpdated).getTime();
          bValue = new Date(b.lastUpdated).getTime();
          break;
        default:
          aValue = a.complianceScore || 0;
          bValue = b.complianceScore || 0;
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [integratorState.mappings, viewState.searchQuery, viewState.frameworkFilter, viewState.statusFilter, viewState.severityFilter, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              integratorState.complianceScore >= 90 ? 'text-green-600' :
              integratorState.complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {integratorState.complianceScore.toFixed(1)}%
            </div>
            <Progress value={integratorState.complianceScore} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{integratorState.activeViolations}</div>
            <p className="text-xs text-muted-foreground">
              {integratorState.resolvedViolations} resolved
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapped Rules</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integratorState.mappedRules}</div>
            <p className="text-xs text-muted-foreground">
              of {integratorState.rules.length} total rules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Gaps</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{integratorState.criticalGaps}</div>
            <p className="text-xs text-muted-foreground">
              requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance by Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Compliance by Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMPLIANCE_FRAMEWORKS.slice(0, 8).map(framework => {
              const frameworkMappings = filteredMappings.filter(m => m.frameworkId === framework.id);
              const compliantCount = frameworkMappings.filter(m => m.status === 'compliant').length;
              const complianceRate = frameworkMappings.length > 0 
                ? (compliantCount / frameworkMappings.length) * 100 
                : 0;
              
              return (
                <div key={framework.id} className="text-center">
                  <div className={`text-lg font-bold text-${framework.color}-600`}>
                    {complianceRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-500">{framework.name}</div>
                  <Progress value={complianceRate} className="mt-2" />
                  <div className="text-xs text-gray-400 mt-1">
                    {compliantCount}/{frameworkMappings.length} rules
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integratorState.violations.slice(0, 5).map(violation => (
              <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <div className="font-medium">{violation.title}</div>
                    <div className="text-sm text-gray-500">
                      {violation.frameworkName} - {violation.requirementId}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getSeverityColor(violation.severity)}>
                    {violation.severity}
                  </Badge>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(violation.detectedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Compliance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <LineChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Compliance trend chart would be rendered here</p>
              <p className="text-sm">Historical compliance score over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFrameworks = () => (
    <div className="space-y-6">
      {/* Framework Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Frameworks</h2>
          <p className="text-gray-600">Manage and configure compliance frameworks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMappingDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      </div>

      {/* Frameworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPLIANCE_FRAMEWORKS.map(framework => {
          const frameworkMappings = filteredMappings.filter(m => m.frameworkId === framework.id);
          const compliantCount = frameworkMappings.filter(m => m.status === 'compliant').length;
          const violationsCount = frameworkMappings.filter(m => m.status === 'non_compliant').length;
          const complianceRate = frameworkMappings.length > 0 
            ? (compliantCount / frameworkMappings.length) * 100 
            : 0;
          
          return (
            <Card key={framework.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{framework.name}</CardTitle>
                  <Badge className={`text-${framework.color}-600 bg-${framework.color}-100`}>
                    {complianceRate.toFixed(0)}%
                  </Badge>
                </div>
                <CardDescription>{framework.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compliance Rate:</span>
                      <span className={`font-medium ${
                        complianceRate >= 90 ? 'text-green-600' :
                        complianceRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {complianceRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={complianceRate} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>{compliantCount} Compliant</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-600" />
                      <span>{violationsCount} Violations</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => performComplianceAssessment()}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Assess
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateComplianceReport(framework.id, 'monthly')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Compliance Integrator</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  integratorState.complianceScore >= 90 ? 'bg-green-500' :
                  integratorState.complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  Score: {integratorState.complianceScore.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.frameworkFilter}
                onValueChange={(value) => setViewState(prev => ({ ...prev, frameworkFilter: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  {COMPLIANCE_FRAMEWORKS.map(framework => (
                    <SelectItem key={framework.id} value={framework.id}>
                      {framework.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={integratorState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${integratorState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Switch
                checked={viewState.continuousMonitoring}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, continuousMonitoring: checked }))}
              />
              <span className="text-sm text-gray-600">Monitor</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="frameworks" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Frameworks
                </TabsTrigger>
                <TabsTrigger value="mappings" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Mappings
                </TabsTrigger>
                <TabsTrigger value="assessments" className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Assessments
                </TabsTrigger>
                <TabsTrigger value="violations" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Violations
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Reports
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="frameworks">
                {renderFrameworks()}
              </TabsContent>
              <TabsContent value="mappings">
                <div>Compliance Mappings Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="assessments">
                <div>Compliance Assessments (To be implemented)</div>
              </TabsContent>
              <TabsContent value="violations">
                <div>Violations Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="reports">
                <div>Compliance Reports (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Mapping Dialog */}
        <Dialog open={mappingDialogOpen} onOpenChange={setMappingDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Compliance Mapping</DialogTitle>
              <DialogDescription>
                Map scan rules to compliance framework requirements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mapping-framework">Compliance Framework</Label>
                <Select 
                  value={mappingForm.frameworkId}
                  onValueChange={(value) => setMappingForm(prev => ({ ...prev, frameworkId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLIANCE_FRAMEWORKS.map(framework => (
                      <SelectItem key={framework.id} value={framework.id}>
                        {framework.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mapping-type">Mapping Type</Label>
                <Select 
                  value={mappingForm.mappingType}
                  onValueChange={(value) => setMappingForm(prev => ({ ...prev, mappingType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMappingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createComplianceMapping}
                  disabled={!mappingForm.frameworkId}
                >
                  Create Mapping
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ComplianceIntegrator;