import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
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
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Calendar,
  Eye,
  Settings,
  Share2,
  Bookmark,
  Star,
  Award,
  Flag,
  Bell,
  Mail,
  Users,
  User,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Database,
  Network,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Key,
  Fingerprint,
  Scale,
  Gavel,
  Building,
  Globe,
  Map,
  MapPin,
  Calendar as CalendarIcon,
  Timer,
  Hourglass,
  AlertCircle,
  Info,
  HelpCircle,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Archive,
  History,
  GitBranch,
  Layers,
  Tags,
  Hash,
  Percent,
  DollarSign,
  Euro,
  Pound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReporting } from '../../hooks/useReporting';
import { reportingApi } from '../../services/reporting-apis';

interface ComplianceReportingProps {
  className?: string;
  onComplianceUpdate?: (status: ComplianceStatus) => void;
  onViolationDetected?: (violation: ComplianceViolation) => void;
}

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'regulatory' | 'industry' | 'internal' | 'international';
  jurisdiction: string;
  effectiveDate: Date;
  lastUpdated: Date;
  status: 'active' | 'deprecated' | 'draft' | 'under_review';
  authority: string;
  website?: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  penalties: CompliancePenalty[];
  exemptions: ComplianceExemption[];
  applicability: {
    industries: string[];
    regions: string[];
    organizationTypes: string[];
    dataTypes: string[];
    minEmployees?: number;
    minRevenue?: number;
  };
  metadata: {
    complexity: 'low' | 'medium' | 'high' | 'critical';
    maturityLevel: 'basic' | 'standard' | 'advanced' | 'expert';
    implementationCost: 'low' | 'medium' | 'high' | 'very_high';
    maintenanceEffort: 'minimal' | 'moderate' | 'significant' | 'extensive';
  };
}

interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  section: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  mandatory: boolean;
  implementationGuidance: string;
  evidence: string[];
  dependencies: string[];
  controls: string[];
  deadline?: Date;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'ad_hoc';
  status: 'not_started' | 'in_progress' | 'implemented' | 'verified' | 'non_compliant' | 'exempt';
  owner: string;
  reviewer: string;
  lastAssessed: Date;
  nextAssessment: Date;
  evidence_documents: ComplianceEvidence[];
  gaps: ComplianceGap[];
  remediation: ComplianceRemediation[];
}

interface ComplianceControl {
  id: string;
  requirementId: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  category: 'technical' | 'administrative' | 'physical';
  automated: boolean;
  effectiveness: 'low' | 'medium' | 'high';
  implementationStatus: 'not_implemented' | 'partially_implemented' | 'implemented' | 'needs_improvement';
  testMethod: 'inspection' | 'observation' | 'inquiry' | 'testing' | 'reperformance';
  testFrequency: 'continuous' | 'monthly' | 'quarterly' | 'annually';
  lastTested: Date;
  nextTest: Date;
  testResults: ControlTestResult[];
  deficiencies: ControlDeficiency[];
  owner: string;
  reviewer: string;
}

interface ComplianceAssessment {
  id: string;
  frameworkId: string;
  name: string;
  type: 'internal' | 'external' | 'regulatory' | 'certification';
  scope: string;
  assessor: string;
  organization?: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  methodology: string;
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendation[];
  score: number;
  certification?: string;
  validUntil?: Date;
  cost: number;
  nextAssessment?: Date;
}

interface ComplianceViolation {
  id: string;
  frameworkId: string;
  requirementId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  detectMethod: 'automated' | 'manual' | 'external' | 'self_reported';
  detectedAt: Date;
  detectedBy: string;
  affectedSystems: string[];
  affectedData: string[];
  potentialImpact: string;
  rootCause?: string;
  status: 'open' | 'investigating' | 'remediating' | 'closed' | 'false_positive';
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  evidence: string[];
  timeline: ViolationTimelineEntry[];
  relatedViolations: string[];
  reportedToAuthority: boolean;
  reportedAt?: Date;
  authorityReference?: string;
}

interface ComplianceStatus {
  overall: {
    score: number;
    status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'under_review';
    lastAssessed: Date;
    nextAssessment: Date;
    trend: 'improving' | 'declining' | 'stable';
  };
  frameworks: Array<{
    frameworkId: string;
    name: string;
    score: number;
    status: 'compliant' | 'non_compliant' | 'partially_compliant';
    requirements: {
      total: number;
      compliant: number;
      nonCompliant: number;
      inProgress: number;
      notStarted: number;
    };
    controls: {
      total: number;
      effective: number;
      ineffective: number;
      notTested: number;
    };
    violations: {
      open: number;
      closed: number;
      critical: number;
      overdue: number;
    };
    lastUpdated: Date;
  }>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  gaps: number;
  violations: number;
  upcomingDeadlines: number;
  certifications: Array<{
    name: string;
    status: 'valid' | 'expiring' | 'expired' | 'suspended';
    expiryDate: Date;
    authority: string;
  }>;
}

interface ComplianceEvidence {
  id: string;
  requirementId: string;
  name: string;
  type: 'document' | 'screenshot' | 'log' | 'certificate' | 'attestation' | 'test_result';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  validFrom: Date;
  validUntil?: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  description: string;
  tags: string[];
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
}

interface ComplianceGap {
  id: string;
  requirementId: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  cost: number;
  timeline: number;
  dependencies: string[];
  assignee?: string;
  status: 'identified' | 'planned' | 'in_progress' | 'resolved' | 'deferred';
  createdAt: Date;
  targetDate?: Date;
  resolvedAt?: Date;
}

interface ComplianceRemediation {
  id: string;
  violationId?: string;
  gapId?: string;
  title: string;
  description: string;
  type: 'immediate' | 'short_term' | 'long_term' | 'strategic';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  effort: 'minimal' | 'moderate' | 'significant' | 'extensive';
  cost: number;
  timeline: number;
  steps: RemediationStep[];
  resources: string[];
  assignee: string;
  reviewer: string;
  status: 'planned' | 'in_progress' | 'testing' | 'completed' | 'on_hold' | 'cancelled';
  startDate?: Date;
  targetDate?: Date;
  completedDate?: Date;
  effectiveness?: 'low' | 'medium' | 'high';
  verificationMethod: string;
  approvedBy?: string;
  approvedAt?: Date;
}

interface ControlTestResult {
  id: string;
  controlId: string;
  testDate: Date;
  tester: string;
  methodology: string;
  result: 'effective' | 'ineffective' | 'partially_effective' | 'not_tested';
  findings: string;
  evidence: string[];
  recommendations: string[];
  nextTestDate: Date;
}

interface ControlDeficiency {
  id: string;
  controlId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  likelihood: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high' | 'critical';
  identifiedAt: Date;
  identifiedBy: string;
  status: 'open' | 'remediating' | 'resolved' | 'accepted';
  remediation?: string;
  targetDate?: Date;
  resolvedAt?: Date;
}

interface CompliancePenalty {
  frameworkId: string;
  violationType: string;
  description: string;
  minPenalty: number;
  maxPenalty: number;
  currency: string;
  additionalConsequences: string[];
  precedents: string[];
}

interface ComplianceExemption {
  id: string;
  requirementId: string;
  reason: string;
  justification: string;
  approvedBy: string;
  approvedAt: Date;
  validUntil?: Date;
  conditions: string[];
  review: {
    frequency: 'quarterly' | 'annually' | 'biannually';
    nextReview: Date;
    reviewer: string;
  };
}

interface ViolationTimelineEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details: string;
  evidence?: string[];
}

interface AssessmentFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirement: string;
  evidence: string;
  recommendation: string;
  managementResponse?: string;
  targetDate?: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

interface AssessmentRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  benefit: string;
  effort: 'low' | 'medium' | 'high';
  cost: number;
  timeline: number;
  dependencies: string[];
  status: 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
}

interface RemediationStep {
  id: string;
  order: number;
  description: string;
  assignee: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  evidence?: string[];
}

const COMPLIANCE_FRAMEWORKS = [
  { value: 'gdpr', label: 'GDPR', region: 'EU', type: 'regulatory' },
  { value: 'ccpa', label: 'CCPA', region: 'California', type: 'regulatory' },
  { value: 'hipaa', label: 'HIPAA', region: 'US', type: 'regulatory' },
  { value: 'sox', label: 'SOX', region: 'US', type: 'regulatory' },
  { value: 'pci_dss', label: 'PCI DSS', region: 'Global', type: 'industry' },
  { value: 'iso_27001', label: 'ISO 27001', region: 'Global', type: 'international' },
  { value: 'nist', label: 'NIST', region: 'US', type: 'industry' },
  { value: 'fedramp', label: 'FedRAMP', region: 'US', type: 'regulatory' }
];

const VIOLATION_SEVERITIES = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

const COMPLIANCE_STATUSES = [
  { value: 'compliant', label: 'Compliant', color: 'text-green-600', icon: CheckCircle },
  { value: 'partially_compliant', label: 'Partially Compliant', color: 'text-yellow-600', icon: AlertTriangle },
  { value: 'non_compliant', label: 'Non-Compliant', color: 'text-red-600', icon: XCircle },
  { value: 'under_review', label: 'Under Review', color: 'text-blue-600', icon: Clock }
];

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#f97316'];

export const ComplianceReporting: React.FC<ComplianceReportingProps> = ({
  className,
  onComplianceUpdate,
  onViolationDetected
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'frameworks' | 'violations' | 'assessments' | 'evidence' | 'reports'>('overview');
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [evidence, setEvidence] = useState<ComplianceEvidence[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<ComplianceViolation | null>(null);
  
  // Dialog states
  const [showFrameworkDetails, setShowFrameworkDetails] = useState(false);
  const [showViolationDetails, setShowViolationDetails] = useState(false);
  const [showCreateAssessment, setShowCreateAssessment] = useState(false);
  const [showUploadEvidence, setShowUploadEvidence] = useState(false);
  const [showComplianceReport, setShowComplianceReport] = useState(false);
  
  // Form states
  const [assessmentForm, setAssessmentForm] = useState({
    name: '',
    frameworkId: '',
    type: 'internal' as 'internal' | 'external' | 'regulatory' | 'certification',
    scope: '',
    assessor: '',
    startDate: '',
    endDate: '',
    methodology: ''
  });
  
  const [evidenceForm, setEvidenceForm] = useState({
    requirementId: '',
    name: '',
    type: 'document' as ComplianceEvidence['type'],
    description: '',
    validFrom: '',
    validUntil: '',
    sensitivity: 'internal' as ComplianceEvidence['sensitivity']
  });
  
  const [reportForm, setReportForm] = useState({
    name: '',
    frameworks: [] as string[],
    includeViolations: true,
    includeAssessments: true,
    includeEvidence: true,
    dateRange: {
      start: '',
      end: ''
    },
    format: 'pdf' as 'pdf' | 'excel' | 'csv'
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  
  // Hooks
  const {
    getComplianceStatus,
    getComplianceFrameworks,
    getComplianceViolations,
    getComplianceAssessments,
    getComplianceEvidence,
    createComplianceAssessment,
    uploadComplianceEvidence,
    generateComplianceReport,
    updateViolationStatus,
    loading: reportingLoading,
    error: reportingError
  } = useReporting();

  // Initialize data
  useEffect(() => {
    loadComplianceData();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(loadComplianceData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Data loading functions
  const loadComplianceData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusData, frameworksData, violationsData, assessmentsData, evidenceData] = await Promise.all([
        getComplianceStatus(),
        getComplianceFrameworks(),
        getComplianceViolations(),
        getComplianceAssessments(),
        getComplianceEvidence()
      ]);
      
      setComplianceStatus(statusData);
      setFrameworks(frameworksData);
      setViolations(violationsData);
      setAssessments(assessmentsData);
      setEvidence(evidenceData);
      
      if (onComplianceUpdate) {
        onComplianceUpdate(statusData);
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  }, [getComplianceStatus, getComplianceFrameworks, getComplianceViolations, getComplianceAssessments, getComplianceEvidence, onComplianceUpdate]);

  // Operations
  const handleCreateAssessment = useCallback(async () => {
    try {
      setLoading(true);
      const assessment = await createComplianceAssessment({
        name: assessmentForm.name,
        frameworkId: assessmentForm.frameworkId,
        type: assessmentForm.type,
        scope: assessmentForm.scope,
        assessor: assessmentForm.assessor,
        startDate: new Date(assessmentForm.startDate),
        endDate: new Date(assessmentForm.endDate),
        methodology: assessmentForm.methodology
      });
      
      setAssessments(prev => [...prev, assessment]);
      setShowCreateAssessment(false);
      setAssessmentForm({
        name: '',
        frameworkId: '',
        type: 'internal',
        scope: '',
        assessor: '',
        startDate: '',
        endDate: '',
        methodology: ''
      });
    } catch (error) {
      console.error('Failed to create assessment:', error);
    } finally {
      setLoading(false);
    }
  }, [assessmentForm, createComplianceAssessment]);

  const handleUploadEvidence = useCallback(async () => {
    try {
      setLoading(true);
      const evidenceItem = await uploadComplianceEvidence({
        requirementId: evidenceForm.requirementId,
        name: evidenceForm.name,
        type: evidenceForm.type,
        description: evidenceForm.description,
        validFrom: new Date(evidenceForm.validFrom),
        validUntil: evidenceForm.validUntil ? new Date(evidenceForm.validUntil) : undefined,
        sensitivity: evidenceForm.sensitivity
      });
      
      setEvidence(prev => [...prev, evidenceItem]);
      setShowUploadEvidence(false);
      setEvidenceForm({
        requirementId: '',
        name: '',
        type: 'document',
        description: '',
        validFrom: '',
        validUntil: '',
        sensitivity: 'internal'
      });
    } catch (error) {
      console.error('Failed to upload evidence:', error);
    } finally {
      setLoading(false);
    }
  }, [evidenceForm, uploadComplianceEvidence]);

  const handleGenerateReport = useCallback(async () => {
    try {
      setLoading(true);
      const report = await generateComplianceReport({
        name: reportForm.name,
        frameworks: reportForm.frameworks,
        includeViolations: reportForm.includeViolations,
        includeAssessments: reportForm.includeAssessments,
        includeEvidence: reportForm.includeEvidence,
        dateRange: {
          start: reportForm.dateRange.start ? new Date(reportForm.dateRange.start) : undefined,
          end: reportForm.dateRange.end ? new Date(reportForm.dateRange.end) : undefined
        },
        format: reportForm.format
      });
      
      setShowComplianceReport(false);
      setReportForm({
        name: '',
        frameworks: [],
        includeViolations: true,
        includeAssessments: true,
        includeEvidence: true,
        dateRange: { start: '', end: '' },
        format: 'pdf'
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  }, [reportForm, generateComplianceReport]);

  const handleUpdateViolationStatus = useCallback(async (violationId: string, status: string) => {
    try {
      await updateViolationStatus(violationId, status);
      setViolations(prev => prev.map(violation => 
        violation.id === violationId ? { ...violation, status: status as any } : violation
      ));
    } catch (error) {
      console.error('Failed to update violation status:', error);
    }
  }, [updateViolationStatus]);

  // Filter data
  const filteredViolations = useMemo(() => {
    return violations.filter(violation => {
      if (searchQuery && !violation.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (frameworkFilter !== 'all' && violation.frameworkId !== frameworkFilter) {
        return false;
      }
      if (severityFilter !== 'all' && violation.severity !== severityFilter) {
        return false;
      }
      if (statusFilter !== 'all' && violation.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [violations, searchQuery, frameworkFilter, severityFilter, statusFilter]);

  // Utility functions
  const getComplianceScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getViolationSeverityColor = (severity: string): string => {
    const config = VIOLATION_SEVERITIES.find(s => s.value === severity);
    return config ? config.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const config = COMPLIANCE_STATUSES.find(s => s.value === status);
    return config ? config.icon : Clock;
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Chart data
  const complianceScoreData = useMemo(() => {
    if (!complianceStatus) return [];
    return complianceStatus.frameworks.map(framework => ({
      name: framework.name,
      score: framework.score,
      compliant: framework.requirements.compliant,
      nonCompliant: framework.requirements.nonCompliant,
      inProgress: framework.requirements.inProgress
    }));
  }, [complianceStatus]);

  const violationTrendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        violations: Math.floor(Math.random() * 10),
        resolved: Math.floor(Math.random() * 8)
      };
    }).reverse();
    return last30Days;
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance Reporting</h2>
          <p className="text-muted-foreground">
            Monitor regulatory compliance and manage violations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadComplianceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowComplianceReport(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="violations">
            Violations
            {violations.filter(v => v.status === 'open').length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {violations.filter(v => v.status === 'open').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Score */}
          {complianceStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                      <p className={cn("text-3xl font-bold", getComplianceScoreColor(complianceStatus.overall.score))}>
                        {complianceStatus.overall.score}%
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {complianceStatus.overall.trend}
                      </div>
                    </div>
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Open Violations</p>
                      <p className="text-3xl font-bold text-red-600">{complianceStatus.violations}</p>
                      <p className="text-sm text-muted-foreground">
                        {violations.filter(v => v.severity === 'critical').length} critical
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Compliance Gaps</p>
                      <p className="text-3xl font-bold text-orange-600">{complianceStatus.gaps}</p>
                      <p className="text-sm text-muted-foreground">
                        Requires attention
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</p>
                      <p className="text-3xl font-bold text-blue-600">{complianceStatus.upcomingDeadlines}</p>
                      <p className="text-sm text-muted-foreground">
                        Next 30 days
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Framework Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Framework Compliance Scores</CardTitle>
                <CardDescription>Compliance status across all frameworks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Violation Trends</CardTitle>
                <CardDescription>Violations detected and resolved over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={violationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Framework Status */}
          {complianceStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Framework Status Summary</CardTitle>
                <CardDescription>Detailed compliance status for each framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceStatus.frameworks.map(framework => {
                    const StatusIcon = getStatusIcon(framework.status);
                    return (
                      <div key={framework.frameworkId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <StatusIcon className={cn("h-5 w-5", 
                            framework.status === 'compliant' ? 'text-green-600' :
                            framework.status === 'partially_compliant' ? 'text-yellow-600' : 'text-red-600'
                          )} />
                          <div>
                            <h4 className="font-medium">{framework.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Score: {framework.score}% • {framework.requirements.compliant}/{framework.requirements.total} requirements
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            <div className="font-medium">{framework.violations.open} open violations</div>
                            <div className="text-muted-foreground">{framework.violations.critical} critical</div>
                          </div>
                          <Progress value={framework.score} className="w-24" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="frameworks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frameworks.map(framework => (
              <Card 
                key={framework.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedFramework(framework);
                  setShowFrameworkDetails(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{framework.name}</CardTitle>
                      <CardDescription className="mt-1">{framework.description}</CardDescription>
                    </div>
                    <Badge variant={framework.status === 'active' ? 'default' : 'secondary'}>
                      {framework.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{framework.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <span className="ml-2 font-medium">{framework.version}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Jurisdiction:</span>
                        <span className="ml-2 font-medium">{framework.jurisdiction}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requirements:</span>
                        <span className="ml-2 font-medium">{framework.requirements.length}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Complexity</span>
                        <Badge variant="outline">{framework.metadata.complexity}</Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Effective: {framework.effectiveDate.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="violations" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search violations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                {COMPLIANCE_FRAMEWORKS.map(framework => (
                  <SelectItem key={framework.value} value={framework.value}>
                    {framework.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {VIOLATION_SEVERITIES.map(severity => (
                  <SelectItem key={severity.value} value={severity.value}>
                    {severity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="remediating">Remediating</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Violations List */}
          <div className="space-y-4">
            {filteredViolations.map(violation => (
              <Card 
                key={violation.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow border-l-4",
                  violation.severity === 'critical' && "border-l-red-500",
                  violation.severity === 'high' && "border-l-orange-500",
                  violation.severity === 'medium' && "border-l-yellow-500",
                  violation.severity === 'low' && "border-l-green-500"
                )}
                onClick={() => {
                  setSelectedViolation(violation);
                  setShowViolationDetails(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base">{violation.title}</CardTitle>
                        <Badge className={getViolationSeverityColor(violation.severity)}>
                          {violation.severity}
                        </Badge>
                        <Badge variant={violation.status === 'open' ? 'destructive' : 'outline'}>
                          {violation.status}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">{violation.description}</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {violation.detectedAt.toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Framework:</span>
                        <span className="ml-2 font-medium">
                          {frameworks.find(f => f.id === violation.frameworkId)?.name || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2 font-medium">{violation.category}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Detected by:</span>
                        <span className="ml-2 font-medium">{violation.detectedBy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assignee:</span>
                        <span className="ml-2 font-medium">{violation.assignee}</span>
                      </div>
                    </div>
                    
                    {violation.affectedSystems.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Affected Systems:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {violation.affectedSystems.map(system => (
                            <Badge key={system} variant="outline" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        {violation.status === 'open' && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateViolationStatus(violation.id, 'investigating');
                            }}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Start Investigation
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                      
                      {violation.dueDate && (
                        <div className="text-xs text-muted-foreground">
                          Due: {violation.dueDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="assessments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Compliance Assessments</h3>
            <Button onClick={() => setShowCreateAssessment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Assessment
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assessments.map(assessment => (
              <Card key={assessment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{assessment.name}</CardTitle>
                      <CardDescription className="mt-1">{assessment.scope}</CardDescription>
                    </div>
                    <Badge variant={assessment.status === 'completed' ? 'default' : 'outline'}>
                      {assessment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{assessment.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assessor:</span>
                        <span className="ml-2 font-medium">{assessment.assessor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="ml-2 font-medium">{assessment.startDate.toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="ml-2 font-medium">{assessment.endDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {assessment.status === 'completed' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={assessment.score} className="w-20" />
                          <span className="text-sm font-medium">{assessment.score}%</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Framework: {frameworks.find(f => f.id === assessment.frameworkId)?.name || 'Unknown'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="evidence" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Compliance Evidence</h3>
            <Button onClick={() => setShowUploadEvidence(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Evidence
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidence.map(item => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription className="mt-1">{item.description}</CardDescription>
                    </div>
                    <Badge variant={item.verified ? 'default' : 'outline'}>
                      {item.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">{item.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span className="ml-2 font-medium">{item.uploadedAt.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valid From:</span>
                      <span className="ml-2 font-medium">{item.validFrom.toLocaleDateString()}</span>
                    </div>
                    {item.validUntil && (
                      <div>
                        <span className="text-muted-foreground">Valid Until:</span>
                        <span className="ml-2 font-medium">{item.validUntil.toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generate comprehensive compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Generate Custom Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Create detailed compliance reports with evidence and assessments
                </p>
                <Button onClick={() => setShowComplianceReport(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Assessment Dialog */}
      <Dialog open={showCreateAssessment} onOpenChange={setShowCreateAssessment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Compliance Assessment</DialogTitle>
            <DialogDescription>
              Plan a new compliance assessment for a specific framework
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assessment-name">Assessment Name</Label>
                <Input
                  id="assessment-name"
                  value={assessmentForm.name}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter assessment name"
                />
              </div>
              <div>
                <Label htmlFor="assessment-framework">Framework</Label>
                <Select value={assessmentForm.frameworkId} onValueChange={(value) => setAssessmentForm(prev => ({ ...prev, frameworkId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map(framework => (
                      <SelectItem key={framework.id} value={framework.id}>
                        {framework.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assessment-type">Type</Label>
                <Select value={assessmentForm.type} onValueChange={(value) => setAssessmentForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assessment-assessor">Assessor</Label>
                <Input
                  id="assessment-assessor"
                  value={assessmentForm.assessor}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, assessor: e.target.value }))}
                  placeholder="Assessor name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="assessment-scope">Scope</Label>
              <Textarea
                id="assessment-scope"
                value={assessmentForm.scope}
                onChange={(e) => setAssessmentForm(prev => ({ ...prev, scope: e.target.value }))}
                placeholder="Assessment scope and objectives"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assessment-start">Start Date</Label>
                <Input
                  id="assessment-start"
                  type="date"
                  value={assessmentForm.startDate}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="assessment-end">End Date</Label>
                <Input
                  id="assessment-end"
                  type="date"
                  value={assessmentForm.endDate}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateAssessment(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAssessment} disabled={loading || !assessmentForm.name}>
              Schedule Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={showComplianceReport} onOpenChange={setShowComplianceReport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Compliance Report</DialogTitle>
            <DialogDescription>
              Create a comprehensive compliance report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportForm.name}
                onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter report name"
              />
            </div>
            
            <div>
              <Label>Frameworks to Include</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {COMPLIANCE_FRAMEWORKS.map(framework => (
                  <div key={framework.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={reportForm.frameworks.includes(framework.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setReportForm(prev => ({ ...prev, frameworks: [...prev.frameworks, framework.value] }));
                        } else {
                          setReportForm(prev => ({ ...prev, frameworks: prev.frameworks.filter(f => f !== framework.value) }));
                        }
                      }}
                    />
                    <Label className="text-sm">{framework.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportForm.includeViolations}
                  onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, includeViolations: !!checked }))}
                />
                <Label className="text-sm">Include violations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportForm.includeAssessments}
                  onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, includeAssessments: !!checked }))}
                />
                <Label className="text-sm">Include assessments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportForm.includeEvidence}
                  onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, includeEvidence: !!checked }))}
                />
                <Label className="text-sm">Include evidence</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-start">Start Date</Label>
                <Input
                  id="report-start"
                  type="date"
                  value={reportForm.dateRange.start}
                  onChange={(e) => setReportForm(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                />
              </div>
              <div>
                <Label htmlFor="report-end">End Date</Label>
                <Input
                  id="report-end"
                  type="date"
                  value={reportForm.dateRange.end}
                  onChange={(e) => setReportForm(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="report-format">Format</Label>
              <Select value={reportForm.format} onValueChange={(value) => setReportForm(prev => ({ ...prev, format: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowComplianceReport(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={loading || !reportForm.name}>
              Generate Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceReporting;