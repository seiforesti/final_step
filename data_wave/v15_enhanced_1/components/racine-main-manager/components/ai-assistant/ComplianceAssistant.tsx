'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  ScrollText, 
  BookOpen, 
  Scale, 
  Gavel, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Target, 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Settings, 
  RefreshCw, 
  Download, 
  Upload, 
  Save, 
  Share, 
  Bookmark, 
  Star, 
  Flag, 
  Info, 
  Clock, 
  Calendar, 
  Timer, 
  Users, 
  Database, 
  Lock, 
  Unlock, 
  KeyRound, 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Maximize, 
  Minimize, 
  ExternalLink, 
  LinkIcon,
  Hash,
  Tag,
  Workflow,
  Route,
  MapPin,
  Crosshair,
  Focus,
  Scan,
  Microscope,
  Bell,
  BellOff,
  Award,
  Certificate,
  Zap,
  Activity
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Types
import { 
  ComplianceFramework,
  ComplianceRule,
  ComplianceStatus,
  ComplianceAssessment,
  ComplianceReport,
  RegulatoryRequirement,
  ComplianceViolation,
  ComplianceRemediation,
  ComplianceMetrics,
  AuditTrail,
  PolicyTemplate,
  ControlFramework,
  RiskAssessment,
  ComplianceGap,
  ComplianceMonitoring,
  CertificationStatus,
  ComplianceSchedule,
  ComplianceWorkflow,
  ComplianceAlert,
  GovernancePolicy
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utilities
import {
  assessComplianceStatus,
  evaluateRegulatoryRequirements,
  generateComplianceReport,
  identifyComplianceGaps,
  recommendRemediation,
  validateControlFramework,
  trackComplianceMetrics,
  scheduleComplianceReview,
  automateComplianceWorkflow,
  generateAuditTrail,
  monitorPolicyCompliance,
  calculateComplianceScore
} from '../../utils/ai-assistant-utils';

// Constants
import {
  COMPLIANCE_FRAMEWORKS,
  REGULATORY_REQUIREMENTS,
  COMPLIANCE_STATUSES,
  CONTROL_TYPES,
  RISK_LEVELS,
  AUDIT_FREQUENCIES
} from '../../constants/ai-assistant-constants';

interface ComplianceAssistantProps {
  className?: string;
  enableContinuousMonitoring?: boolean;
  complianceFrameworks?: string[];
  onComplianceViolation?: (violation: ComplianceViolation) => void;
  onComplianceUpdate?: (status: ComplianceStatus) => void;
  autoRemediationEnabled?: boolean;
}

interface ComplianceDashboardProps {
  assessments: ComplianceAssessment[];
  selectedAssessment: string | null;
  onAssessmentSelect: (assessmentId: string) => void;
  onAssessmentReview: (assessmentId: string) => void;
  onViolationResolve: (violationId: string) => void;
  showResolved: boolean;
}

interface PolicyManagementProps {
  policies: GovernancePolicy[];
  onPolicyCreate: (policy: GovernancePolicy) => void;
  onPolicyUpdate: (policyId: string, updates: Partial<GovernancePolicy>) => void;
  onPolicyValidate: (policyId: string) => void;
  onPolicyEnforce: (policyId: string) => void;
  frameworks: ComplianceFramework[];
}

interface AuditingProps {
  auditTrails: AuditTrail[];
  upcomingAudits: ComplianceSchedule[];
  onAuditSchedule: (schedule: ComplianceSchedule) => void;
  onAuditExecute: (auditId: string) => void;
  onAuditReview: (auditId: string) => void;
  complianceScore: number;
}

interface RiskAssessmentProps {
  riskAssessments: RiskAssessment[];
  complianceGaps: ComplianceGap[];
  onRiskAnalyze: (riskId: string) => void;
  onGapRemediate: (gapId: string) => void;
  onRiskMitigate: (riskId: string, action: string) => void;
}

export const ComplianceAssistant: React.FC<ComplianceAssistantProps> = ({
  className = "",
  enableContinuousMonitoring = true,
  complianceFrameworks = ['GDPR', 'SOX', 'HIPAA'],
  onComplianceViolation,
  onComplianceUpdate,
  autoRemediationEnabled = false
}) => {
  // Hooks
  const {
    complianceAssessments,
    complianceViolations,
    complianceMetrics,
    governancePolicies,
    auditTrails,
    complianceReports,
    riskAssessments,
    complianceGaps,
    upcomingAudits,
    assessCompliance,
    createComplianceReport,
    updateComplianceStatus,
    scheduleComplianceAudit,
    remediateCompliance,
    validatePolicyCompliance,
    trackComplianceChanges,
    isAssessing,
    isGeneratingReport,
    error
  } = useAIAssistant();

  const {
    systemHealth,
    globalMetrics,
    performanceMetrics
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus,
    crossGroupMetrics,
    spaIntegrationData
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    userBehaviorData,
    userPreferences
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceMetrics,
    workspaceConfiguration
  } = useWorkspaceManagement();

  const {
    trackActivity,
    recentActivities,
    activityPatterns
  } = useActivityTracker();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'policies' | 'auditing' | 'risks'>('overview');
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [frameworkFilter, setFrameworkFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [continuousMonitoring, setContinuousMonitoring] = useState(enableContinuousMonitoring);
  const [autoRemediation, setAutoRemediation] = useState(autoRemediationEnabled);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(complianceFrameworks);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [monitoringConfig, setMonitoringConfig] = useState({
    enableRealTime: true,
    checkInterval: 60000, // 1 minute
    enableAuditing: true,
    enableReporting: true
  });
  const [lastAssessment, setLastAssessment] = useState<Date>(new Date());
  const [complianceScore, setComplianceScore] = useState(0);

  // Refs
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);
  const assessmentCache = useRef<Map<string, ComplianceAssessment>>(new Map());

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    recentActivities: recentActivities.slice(0, 30),
    userPermissions,
    workspaceContext: {
      id: activeWorkspace?.id || '',
      configuration: workspaceConfiguration,
      metrics: workspaceMetrics
    },
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [
    currentUser,
    activeWorkspace,
    activeSPAContext,
    systemHealth,
    recentActivities,
    userPermissions,
    workspaceConfiguration,
    workspaceMetrics
  ]);

  const filteredAssessments = useMemo(() => {
    let filtered = complianceAssessments;

    if (frameworkFilter !== 'all') {
      filtered = filtered.filter(assessment => 
        assessment.framework === frameworkFilter
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(assessment => 
        assessment.status === statusFilter
      );
    }

    if (!showResolved) {
      filtered = filtered.filter(assessment => 
        assessment.status !== 'compliant'
      );
    }

    // Sort by risk level and timestamp
    filtered.sort((a, b) => {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const riskDiff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      if (riskDiff !== 0) return riskDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return filtered;
  }, [complianceAssessments, frameworkFilter, statusFilter, showResolved]);

  const criticalViolations = useMemo(() => {
    return complianceViolations.filter(violation => 
      violation.severity === 'critical' && !violation.resolved
    );
  }, [complianceViolations]);

  const frameworkStatus = useMemo(() => {
    const status: Record<string, { compliant: number; total: number; score: number }> = {};
    
    selectedFrameworks.forEach(framework => {
      const assessments = complianceAssessments.filter(a => a.framework === framework);
      const compliant = assessments.filter(a => a.status === 'compliant').length;
      const total = assessments.length;
      const score = total > 0 ? (compliant / total) * 100 : 0;
      
      status[framework] = { compliant, total, score };
    });
    
    return status;
  }, [complianceAssessments, selectedFrameworks]);

  const overallComplianceScore = useMemo(() => {
    const totalAssessments = complianceAssessments.length;
    if (totalAssessments === 0) return 0;
    
    const compliantAssessments = complianceAssessments.filter(a => a.status === 'compliant').length;
    return Math.round((compliantAssessments / totalAssessments) * 100);
  }, [complianceAssessments]);

  const upcomingDeadlines = useMemo(() => {
    return upcomingAudits.filter(audit => {
      const deadline = new Date(audit.dueDate);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 30; // Next 30 days
    });
  }, [upcomingAudits]);

  // Effects
  useEffect(() => {
    if (continuousMonitoring && monitoringConfig.enableRealTime) {
      monitoringInterval.current = setInterval(() => {
        performContinuousAssessment();
      }, monitoringConfig.checkInterval);
    }

    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, [continuousMonitoring, monitoringConfig]);

  useEffect(() => {
    // Perform initial assessment
    performInitialAssessment();
  }, [currentContext, selectedFrameworks]);

  useEffect(() => {
    // Handle new violations
    complianceViolations.forEach(violation => {
      if (!violation.resolved && onComplianceViolation) {
        onComplianceViolation(violation);
      }
    });

    // Update compliance score
    setComplianceScore(overallComplianceScore);
    
    if (onComplianceUpdate) {
      onComplianceUpdate({
        score: overallComplianceScore,
        violations: complianceViolations.filter(v => !v.resolved).length,
        frameworks: selectedFrameworks,
        lastAssessment: lastAssessment
      } as ComplianceStatus);
    }
  }, [complianceViolations, overallComplianceScore, selectedFrameworks, lastAssessment, onComplianceViolation, onComplianceUpdate]);

  // Handlers
  const performInitialAssessment = useCallback(async () => {
    try {
      await assessCompliance({
        context: currentContext,
        frameworks: selectedFrameworks,
        includeAllSPAs: true,
        riskAssessment: true,
        detailedReport: true
      });

      setLastAssessment(new Date());

      trackActivity({
        type: 'compliance_assessment_performed',
        details: {
          frameworks: selectedFrameworks,
          assessmentCount: complianceAssessments.length,
          context: currentContext.activeSPA
        }
      });

    } catch (error) {
      console.error('Failed to perform initial compliance assessment:', error);
    }
  }, [assessCompliance, currentContext, selectedFrameworks, complianceAssessments.length, trackActivity]);

  const performContinuousAssessment = useCallback(async () => {
    try {
      await assessCompliance({
        context: currentContext,
        frameworks: selectedFrameworks,
        continuousMode: true,
        onlyChanges: true,
        riskAssessment: false
      });

      setLastAssessment(new Date());

    } catch (error) {
      console.error('Failed to perform continuous assessment:', error);
    }
  }, [assessCompliance, currentContext, selectedFrameworks]);

  const handleAssessmentReview = useCallback(async (assessmentId: string) => {
    try {
      const assessment = complianceAssessments.find(a => a.id === assessmentId);
      if (!assessment) return;

      // Generate detailed assessment report
      const report = await createComplianceReport({
        assessmentId,
        includeRecommendations: true,
        includeRiskAnalysis: true,
        includeRemediationPlan: true,
        format: 'detailed'
      });

      trackActivity({
        type: 'compliance_assessment_reviewed',
        details: {
          assessmentId,
          framework: assessment.framework,
          status: assessment.status
        }
      });

      // This would typically open a detailed review interface
      console.log('Assessment report:', report);

    } catch (error) {
      console.error('Failed to review assessment:', error);
    }
  }, [complianceAssessments, createComplianceReport, trackActivity]);

  const handleViolationResolve = useCallback(async (violationId: string) => {
    try {
      const violation = complianceViolations.find(v => v.id === violationId);
      if (!violation) return;

      await remediateCompliance(violationId, {
        action: 'resolve',
        remediation: violation.recommendedRemediation || 'Manual resolution',
        resolvedBy: currentUser?.id || 'system',
        automated: autoRemediation
      });

      trackActivity({
        type: 'compliance_violation_resolved',
        details: {
          violationId,
          framework: violation.framework,
          severity: violation.severity
        }
      });

    } catch (error) {
      console.error('Failed to resolve violation:', error);
    }
  }, [complianceViolations, remediateCompliance, currentUser, autoRemediation, trackActivity]);

  const handlePolicyValidation = useCallback(async (policyId: string) => {
    try {
      const policy = governancePolicies.find(p => p.id === policyId);
      if (!policy) return;

      await validatePolicyCompliance(policyId, {
        frameworks: selectedFrameworks,
        crossSPAValidation: true,
        generateReport: true
      });

      trackActivity({
        type: 'policy_validated',
        details: {
          policyId,
          type: policy.type,
          frameworks: selectedFrameworks
        }
      });

    } catch (error) {
      console.error('Failed to validate policy:', error);
    }
  }, [governancePolicies, validatePolicyCompliance, selectedFrameworks, trackActivity]);

  const handleAuditSchedule = useCallback(async (schedule: ComplianceSchedule) => {
    try {
      await scheduleComplianceAudit({
        ...schedule,
        context: currentContext,
        frameworks: selectedFrameworks,
        automated: true
      });

      trackActivity({
        type: 'compliance_audit_scheduled',
        details: {
          auditType: schedule.type,
          dueDate: schedule.dueDate,
          frameworks: selectedFrameworks
        }
      });

    } catch (error) {
      console.error('Failed to schedule audit:', error);
    }
  }, [scheduleComplianceAudit, currentContext, selectedFrameworks, trackActivity]);

  const handleExportReport = useCallback(async () => {
    try {
      const report = await createComplianceReport({
        scope: 'comprehensive',
        frameworks: selectedFrameworks,
        includeMetrics: true,
        includeViolations: true,
        includeRecommendations: true,
        includeAuditTrail: true,
        timeRange: '30d'
      });

      // Download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      trackActivity({
        type: 'compliance_report_exported',
        details: {
          frameworks: selectedFrameworks,
          assessmentCount: filteredAssessments.length,
          violationCount: complianceViolations.length
        }
      });

    } catch (error) {
      console.error('Failed to export compliance report:', error);
    }
  }, [createComplianceReport, selectedFrameworks, filteredAssessments.length, complianceViolations.length, trackActivity]);

  // Render Methods
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{overallComplianceScore}%</div>
                <p className="text-xs text-muted-foreground">Overall Compliance</p>
              </div>
              <Scale className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalViolations.length}</div>
                <p className="text-xs text-muted-foreground">Critical Violations</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{selectedFrameworks.length}</div>
                <p className="text-xs text-muted-foreground">Active Frameworks</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{upcomingDeadlines.length}</div>
                <p className="text-xs text-muted-foreground">Upcoming Deadlines</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Violations Alert */}
      {criticalViolations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Compliance Violations</AlertTitle>
          <AlertDescription>
            {criticalViolations.length} critical violations require immediate attention to maintain compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Framework Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Certificate className="h-5 w-5" />
            Framework Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(frameworkStatus).map(([framework, status]) => (
              <div key={framework} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{framework}</h4>
                  <Badge variant={status.score >= 80 ? 'default' : status.score >= 60 ? 'secondary' : 'destructive'}>
                    {Math.round(status.score)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Progress value={status.score} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {status.compliant} of {status.total} requirements met
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <ComplianceDashboard
        assessments={filteredAssessments.slice(0, 10)}
        selectedAssessment={selectedAssessment}
        onAssessmentSelect={setSelectedAssessment}
        onAssessmentReview={handleAssessmentReview}
        onViolationResolve={handleViolationResolve}
        showResolved={showResolved}
      />
    </div>
  );

  const renderAssessments = () => (
    <ComplianceDashboard
      assessments={filteredAssessments}
      selectedAssessment={selectedAssessment}
      onAssessmentSelect={setSelectedAssessment}
      onAssessmentReview={handleAssessmentReview}
      onViolationResolve={handleViolationResolve}
      showResolved={showResolved}
    />
  );

  const renderPolicies = () => (
    <PolicyManagement
      policies={governancePolicies}
      onPolicyCreate={(policy) => {
        // Handle policy creation
      }}
      onPolicyUpdate={(policyId, updates) => {
        // Handle policy update
      }}
      onPolicyValidate={handlePolicyValidation}
      onPolicyEnforce={(policyId) => {
        // Handle policy enforcement
      }}
      frameworks={COMPLIANCE_FRAMEWORKS}
    />
  );

  const renderAuditing = () => (
    <Auditing
      auditTrails={auditTrails}
      upcomingAudits={upcomingDeadlines}
      onAuditSchedule={handleAuditSchedule}
      onAuditExecute={(auditId) => {
        // Handle audit execution
      }}
      onAuditReview={(auditId) => {
        // Handle audit review
      }}
      complianceScore={overallComplianceScore}
    />
  );

  const renderRisks = () => (
    <RiskAssessment
      riskAssessments={riskAssessments}
      complianceGaps={complianceGaps}
      onRiskAnalyze={(riskId) => {
        // Handle risk analysis
      }}
      onGapRemediate={(gapId) => {
        // Handle gap remediation
      }}
      onRiskMitigate={(riskId, action) => {
        // Handle risk mitigation
      }}
    />
  );

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Compliance Assistant</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered compliance guidance and monitoring across all data governance operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={continuousMonitoring}
                onCheckedChange={setContinuousMonitoring}
              />
              <Label className="text-sm">Continuous Monitoring</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={autoRemediation}
                onCheckedChange={setAutoRemediation}
              />
              <Label className="text-sm">Auto Remediation</Label>
            </div>

            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>

            <Button 
              onClick={performInitialAssessment}
              disabled={isAssessing}
              size="sm"
            >
              {isAssessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Assessing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Assess
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Framework:</Label>
                  <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frameworks</SelectItem>
                      {selectedFrameworks.map(framework => (
                        <SelectItem key={framework} value={framework}>
                          {framework}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Status:</Label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={showResolved} onCheckedChange={setShowResolved} />
                  <Label className="text-sm">Show Resolved</Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Last assessment: {lastAssessment.toLocaleTimeString()}
                </Badge>
                <Badge variant={overallComplianceScore >= 80 ? 'default' : 'secondary'} className="text-xs">
                  {overallComplianceScore}% Compliant
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="auditing" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Auditing
              {upcomingDeadlines.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {upcomingDeadlines.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            {renderAssessments()}
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            {renderPolicies()}
          </TabsContent>

          <TabsContent value="auditing" className="space-y-4">
            {renderAuditing()}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {renderRisks()}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Compliance Assessment Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Compliance Dashboard Component
const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  assessments,
  selectedAssessment,
  onAssessmentSelect,
  onAssessmentReview,
  onViolationResolve,
  showResolved
}) => {
  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'non_compliant': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'review': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant': return 'border-green-500 bg-green-50';
      case 'non_compliant': return 'border-red-500 bg-red-50';
      case 'pending': return 'border-yellow-500 bg-yellow-50';
      case 'review': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Scale className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Compliance Assessments</h3>
          <p className="text-muted-foreground text-sm">
            Run a compliance assessment to see results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Assessments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assessments.map((assessment) => (
          <div
            key={assessment.id}
            className={`cursor-pointer transition-all duration-200 p-3 rounded-lg border ${getStatusColor(assessment.status)} ${
              selectedAssessment === assessment.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onAssessmentSelect(assessment.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(assessment.status)}
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{assessment.requirement}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{assessment.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {assessment.framework}
                    </Badge>
                    <Badge variant={assessment.status === 'compliant' ? 'default' : 'destructive'} className="text-xs">
                      {assessment.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {assessment.riskLevel}
                    </Badge>
                  </div>

                  {assessment.complianceScore !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Compliance Score:</span>
                        <span>{Math.round(assessment.complianceScore * 100)}%</span>
                      </div>
                      <Progress value={assessment.complianceScore * 100} className="h-1" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssessmentReview(assessment.id);
                  }}
                >
                  <FileText className="h-3 w-3" />
                </Button>
                {assessment.status === 'non_compliant' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViolationResolve(assessment.id);
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Policy Management Component
const PolicyManagement: React.FC<PolicyManagementProps> = ({
  policies,
  onPolicyCreate,
  onPolicyUpdate,
  onPolicyValidate,
  onPolicyEnforce,
  frameworks
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Governance Policies
            </CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Policies Defined</h3>
              <p className="text-sm">
                Create governance policies to ensure compliance across your organization.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{policy.name}</h4>
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {policy.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPolicyValidate(policy.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPolicyEnforce(policy.id)}
                    >
                      <Shield className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Edit policy
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Auditing Component
const Auditing: React.FC<AuditingProps> = ({
  auditTrails,
  upcomingAudits,
  onAuditSchedule,
  onAuditExecute,
  onAuditReview,
  complianceScore
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAudits.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No upcoming audits scheduled</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingAudits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{audit.type}</div>
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(audit.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onAuditExecute(audit.id)}>
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{complianceScore}%</div>
              <Progress value={complianceScore} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Overall compliance across all frameworks
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditTrails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Audit Trail</h3>
              <p className="text-sm">
                Audit activities will appear here as they occur.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditTrails.slice(0, 10).map((trail) => (
                <div key={trail.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{trail.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {trail.user} • {new Date(trail.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {trail.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Risk Assessment Component
const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  riskAssessments,
  complianceGaps,
  onRiskAnalyze,
  onGapRemediate,
  onRiskMitigate
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskAssessments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No risk assessments available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {riskAssessments.map((risk) => (
                  <div key={risk.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{risk.riskDescription}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={risk.riskLevel === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                          {risk.riskLevel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Impact: {risk.impact}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onRiskAnalyze(risk.id)}>
                      <Search className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Compliance Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {complianceGaps.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No compliance gaps identified</p>
              </div>
            ) : (
              <div className="space-y-2">
                {complianceGaps.map((gap) => (
                  <div key={gap.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{gap.requirement}</div>
                      <div className="text-xs text-muted-foreground">
                        Framework: {gap.framework}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onGapRemediate(gap.id)}>
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceAssistant;