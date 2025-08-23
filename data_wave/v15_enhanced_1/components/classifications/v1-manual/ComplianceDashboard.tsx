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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, FileText, Users, Settings, Download, Upload, RefreshCw, Eye, Edit, Plus, Minus, Search, Filter, Calendar, BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown, Target, Award, BookOpen, Bookmark, Scale, Gavel, Building, Globe, Lock, Key, Database, Server, Network, Monitor, Activity, Zap, Bell, Mail, Phone, MessageSquare, Star, ThumbsUp, ThumbsDown, Flag, MapPin, Calendar as CalendarIcon, ChevronRight, ChevronDown, MoreHorizontal, ExternalLink, Copy, Save, Trash2,  } from 'lucide-react';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { classificationApi } from '../core/api';
import type {
  ComplianceFramework,
  ComplianceReport,
  ComplianceStatus,
  ComplianceRequirement,
  PolicyViolation,
  RiskAssessment,
  AuditTrail,
  ControlMapping,
  ComplianceMetrics,
  RegulatoryFramework,
  PolicyDocument,
  ComplianceEvidence,
  AssessmentResult,
  RemediationPlan,
  ComplianceAlert,
  ComplianceScore,
  ComplianceTrend,
  ControlEffectiveness,
  GapAnalysis,
  MaturityAssessment,
  BenchmarkComparison,
  ComplianceWorkflow,
  StakeholderRole,
  ComplianceCalendar,
  ReportingSchedule,
  ComplianceDashboard,
  Widget,
  Visualization,
} from '../core/types';

// Enhanced compliance types
interface ComplianceFrameworkConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'privacy' | 'security' | 'financial' | 'healthcare' | 'industry';
  jurisdiction: string[];
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  assessmentCriteria: AssessmentCriteria[];
  reportingRequirements: ReportingRequirement[];
  penalties: PenaltyStructure[];
  implementationGuide: ImplementationGuide;
  lastUpdated: Date;
  effectiveDate: Date;
  nextReview: Date;
}

interface ComplianceControl {
  id: string;
  frameworkId: string;
  category: string;
  title: string;
  description: string;
  objective: string;
  controlType: 'preventive' | 'detective' | 'corrective' | 'compensating';
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  owner: string;
  implementationStatus: 'not-started' | 'in-progress' | 'implemented' | 'verified';
  effectiveness: 'effective' | 'partially-effective' | 'ineffective' | 'not-tested';
  lastTested: Date;
  nextTest: Date;
  evidence: ComplianceEvidence[];
  dependencies: string[];
  riskRating: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  testProcedures: TestProcedure[];
  remediationActions: RemediationAction[];
}

interface AssessmentCriteria {
  id: string;
  requirement: string;
  criterion: string;
  weight: number;
  scoringMethod: 'binary' | 'scale' | 'percentage' | 'maturity';
  passingScore: number;
  evidenceRequirements: string[];
  testingMethods: string[];
}

interface ReportingRequirement {
  id: string;
  name: string;
  frequency: string;
  recipients: string[];
  format: string;
  deadline: string;
  content: string[];
  template: string;
}

interface PenaltyStructure {
  violationType: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  financialPenalty: {
    min: number;
    max: number;
    currency: string;
  };
  operationalPenalty: string[];
  reputationalImpact: 'low' | 'medium' | 'high' | 'severe';
  timeToRemediate: number;
}

interface ImplementationGuide {
  phases: ImplementationPhase[];
  resources: Resource[];
  timeline: string;
  dependencies: string[];
  successCriteria: string[];
  risks: Risk[];
}

interface ImplementationPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  activities: Activity[];
  deliverables: string[];
  milestones: Milestone[];
}

interface TestProcedure {
  id: string;
  name: string;
  description: string;
  steps: string[];
  expectedResults: string[];
  frequency: string;
  automated: boolean;
  tools: string[];
}

interface RemediationAction {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'completed' | 'overdue';
  effort: number;
  cost: number;
}

interface ComplianceMetricsData {
  overallScore: number;
  frameworkScores: Record<string, number>;
  controlEffectiveness: number;
  violationTrends: Array<{
    date: string;
    count: number;
    severity: string;
  }>;
  assessmentResults: Array<{
    framework: string;
    score: number;
    status: string;
    lastAssessed: Date;
  }>;
  remediationProgress: Array<{
    framework: string;
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  }>;
  costOfCompliance: Array<{
    framework: string;
    implementation: number;
    maintenance: number;
    penalties: number;
  }>;
  maturityLevels: Array<{
    domain: string;
    current: number;
    target: number;
  }>;
}

interface ComplianceDashboardConfig {
  id: string;
  name: string;
  description: string;
  widgets: ComplianceWidget[];
  layout: DashboardLayout;
  filters: ComplianceFilter[];
  refreshInterval: number;
  autoRefresh: boolean;
  permissions: string[];
  stakeholders: StakeholderRole[];
}

interface ComplianceWidget {
  id: string;
  type: 'score' | 'trend' | 'violations' | 'controls' | 'assessment' | 'remediation';
  title: string;
  framework?: string;
  visualization: VisualizationConfig;
  position: { x: number; y: number; w: number; h: number };
  refreshInterval: number;
  alertThresholds: Record<string, number>;
}

interface ComplianceFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
  active: boolean;
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
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
  timeGranularity: 'day' | 'week' | 'month' | 'quarter' | 'year';
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  thresholds: Record<string, number>;
}

const COMPLIANCE_FRAMEWORKS = [
  {
    id: 'gdpr',
    name: 'GDPR',
    version: '2018',
    category: 'privacy' as const,
    description: 'General Data Protection Regulation',
    jurisdiction: ['EU', 'EEA'],
    requirements: 99,
    controls: 47,
    maturityLevel: 4,
    implementationStatus: 'implemented' as const,
    lastAssessment: new Date('2024-01-15'),
    nextAssessment: new Date('2024-07-15'),
    score: 92,
    violations: 2,
    riskLevel: 'low' as const,
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    version: '2013',
    category: 'healthcare' as const,
    description: 'Health Insurance Portability and Accountability Act',
    jurisdiction: ['US'],
    requirements: 45,
    controls: 32,
    maturityLevel: 3,
    implementationStatus: 'implemented' as const,
    lastAssessment: new Date('2024-01-10'),
    nextAssessment: new Date('2024-04-10'),
    score: 88,
    violations: 1,
    riskLevel: 'low' as const,
  },
  {
    id: 'sox',
    name: 'SOX',
    version: '2002',
    category: 'financial' as const,
    description: 'Sarbanes-Oxley Act',
    jurisdiction: ['US'],
    requirements: 25,
    controls: 18,
    maturityLevel: 4,
    implementationStatus: 'implemented' as const,
    lastAssessment: new Date('2024-01-01'),
    nextAssessment: new Date('2024-12-31'),
    score: 95,
    violations: 0,
    riskLevel: 'low' as const,
  },
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    version: '4.0',
    category: 'financial' as const,
    description: 'Payment Card Industry Data Security Standard',
    jurisdiction: ['Global'],
    requirements: 12,
    controls: 78,
    maturityLevel: 5,
    implementationStatus: 'implemented' as const,
    lastAssessment: new Date('2024-01-20'),
    nextAssessment: new Date('2024-01-20'),
    score: 98,
    violations: 0,
    riskLevel: 'low' as const,
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    version: '2022',
    category: 'security' as const,
    description: 'Information Security Management System',
    jurisdiction: ['Global'],
    requirements: 93,
    controls: 114,
    maturityLevel: 3,
    implementationStatus: 'in-progress' as const,
    lastAssessment: new Date('2023-12-15'),
    nextAssessment: new Date('2024-06-15'),
    score: 78,
    violations: 8,
    riskLevel: 'medium' as const,
  },
  {
    id: 'nist',
    name: 'NIST CSF',
    version: '2.0',
    category: 'security' as const,
    description: 'Cybersecurity Framework',
    jurisdiction: ['US'],
    requirements: 108,
    controls: 164,
    maturityLevel: 3,
    implementationStatus: 'in-progress' as const,
    lastAssessment: new Date('2023-11-30'),
    nextAssessment: new Date('2024-05-30'),
    score: 82,
    violations: 5,
    riskLevel: 'medium' as const,
  },
];

const COMPLIANCE_CATEGORIES = [
  { id: 'privacy', name: 'Privacy & Data Protection', icon: Shield, color: '#3b82f6' },
  { id: 'security', name: 'Information Security', icon: Lock, color: '#10b981' },
  { id: 'financial', name: 'Financial Compliance', icon: Scale, color: '#f59e0b' },
  { id: 'healthcare', name: 'Healthcare Regulations', icon: FileText, color: '#ef4444' },
  { id: 'industry', name: 'Industry Standards', icon: Building, color: '#8b5cf6' },
];

const MATURITY_LEVELS = [
  { level: 1, name: 'Initial', description: 'Ad hoc processes', color: '#ef4444' },
  { level: 2, name: 'Managed', description: 'Basic processes established', color: '#f97316' },
  { level: 3, name: 'Defined', description: 'Standardized processes', color: '#f59e0b' },
  { level: 4, name: 'Quantitatively Managed', description: 'Measured processes', color: '#84cc16' },
  { level: 5, name: 'Optimizing', description: 'Continuous improvement', color: '#10b981' },
];

const VIOLATION_SEVERITIES = [
  { id: 'critical', name: 'Critical', color: '#dc2626', weight: 4 },
  { id: 'high', name: 'High', color: '#ea580c', weight: 3 },
  { id: 'medium', name: 'Medium', color: '#ca8a04', weight: 2 },
  { id: 'low', name: 'Low', color: '#16a34a', weight: 1 },
];

const ComplianceDashboard: React.FC = () => {
  // State management
  const {
    complianceFrameworks,
    complianceReports,
    isLoading,
    error,
    getComplianceMetrics,
    generateComplianceReport,
    updateComplianceStatus,
  } = useClassificationState();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetricsData | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<ComplianceDashboardConfig | null>(null);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [remediationPlans, setRemediationPlans] = useState<RemediationPlan[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);
  const [showCreateReportDialog, setShowCreateReportDialog] = useState(false);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [showRemediationDialog, setShowRemediationDialog] = useState(false);
  const [showFrameworkDialog, setShowFrameworkDialog] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedViolations, setSelectedViolations] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    loadComplianceData();
    loadViolations();
    loadAssessments();
    loadRemediationPlans();
    loadComplianceAlerts();

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadComplianceData();
        loadViolations();
        loadComplianceAlerts();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [selectedFramework, selectedCategory, dateRange, autoRefresh, refreshInterval]);

  const loadComplianceData = useCallback(async () => {
    try {
      const response = await getComplianceMetrics({
        frameworks: selectedFramework === 'all' ? undefined : [selectedFramework],
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        dateRange,
      });
      setComplianceMetrics(response);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    }
  }, [selectedFramework, selectedCategory, dateRange, getComplianceMetrics]);

  const loadViolations = useCallback(async () => {
    try {
      const response = await classificationApi.getPolicyViolations({
        frameworks: selectedFramework === 'all' ? undefined : [selectedFramework],
        dateRange,
        status: 'all',
      });
      setViolations(response.data);
    } catch (error) {
      console.error('Error loading violations:', error);
    }
  }, [selectedFramework, dateRange]);

  const loadAssessments = useCallback(async () => {
    try {
      const response = await classificationApi.getComplianceAssessments({
        frameworks: selectedFramework === 'all' ? undefined : [selectedFramework],
        dateRange,
      });
      setAssessments(response.data);
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
  }, [selectedFramework, dateRange]);

  const loadRemediationPlans = useCallback(async () => {
    try {
      const response = await classificationApi.getRemediationPlans({
        frameworks: selectedFramework === 'all' ? undefined : [selectedFramework],
        status: 'all',
      });
      setRemediationPlans(response.data);
    } catch (error) {
      console.error('Error loading remediation plans:', error);
    }
  }, [selectedFramework]);

  const loadComplianceAlerts = useCallback(async () => {
    try {
      const response = await classificationApi.getComplianceAlerts({
        frameworks: selectedFramework === 'all' ? undefined : [selectedFramework],
        severity: 'all',
        status: 'active',
      });
      setComplianceAlerts(response.data);
    } catch (error) {
      console.error('Error loading compliance alerts:', error);
    }
  }, [selectedFramework]);

  // Filtered data
  const filteredFrameworks = useMemo(() => {
    let filtered = COMPLIANCE_FRAMEWORKS;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort frameworks
    filtered.sort((a, b) => {
      const aValue = sortBy === 'score' ? a.score : sortBy === 'name' ? a.name : a.violations;
      const bValue = sortBy === 'score' ? b.score : sortBy === 'name' ? b.name : b.violations;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, sortBy, sortOrder]);

  // Event handlers
  const handleGenerateReport = useCallback(async (frameworkId?: string) => {
    try {
      const reportConfig = {
        frameworks: frameworkId ? [frameworkId] : undefined,
        dateRange,
        includeViolations: true,
        includeRemediation: true,
        includeEvidence: true,
        format: 'pdf',
      };

      await generateComplianceReport(reportConfig);
      setShowCreateReportDialog(false);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }, [dateRange, generateComplianceReport]);

  const handleRunAssessment = useCallback(async (frameworkId: string) => {
    try {
      const response = await classificationApi.runComplianceAssessment({
        frameworkId,
        assessmentType: 'full',
        includeControls: true,
        includeEvidence: true,
      });
      
      // Reload assessments
      loadAssessments();
      setShowAssessmentDialog(false);
    } catch (error) {
      console.error('Error running assessment:', error);
    }
  }, [loadAssessments]);

  const handleCreateRemediationPlan = useCallback(async (violationIds: string[]) => {
    try {
      const planData = {
        title: `Remediation Plan - ${new Date().toLocaleDateString()}`,
        description: `Remediation plan for ${violationIds.length} violations`,
        violationIds,
        priority: 'high' as const,
        assignee: 'compliance_team',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };

      const response = await classificationApi.createRemediationPlan(planData);
      setRemediationPlans(prev => [...prev, response.data]);
      setSelectedViolations(new Set());
      setShowRemediationDialog(false);
    } catch (error) {
      console.error('Error creating remediation plan:', error);
    }
  }, []);

  // Utility functions
  const getFrameworkIcon = useCallback((category: string) => {
    const categoryData = COMPLIANCE_CATEGORIES.find(c => c.id === category);
    return categoryData ? categoryData.icon : Shield;
  }, []);

  const getFrameworkColor = useCallback((category: string) => {
    const categoryData = COMPLIANCE_CATEGORIES.find(c => c.id === category);
    return categoryData ? categoryData.color : '#3b82f6';
  }, []);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  const getRiskLevelColor = useCallback((riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getMaturityLevel = useCallback((level: number) => {
    return MATURITY_LEVELS.find(m => m.level === level) || MATURITY_LEVELS[0];
  }, []);

  // Data for visualizations
  const overallComplianceData = useMemo(() => {
    return COMPLIANCE_FRAMEWORKS.map(framework => ({
      name: framework.name,
      score: framework.score,
      violations: framework.violations,
      riskLevel: framework.riskLevel,
      category: framework.category,
    }));
  }, []);

  const complianceTrendsData = useMemo(() => {
    // Generate mock trend data
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - index));
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        overallScore: 85 + Math.random() * 10,
        violations: Math.floor(Math.random() * 20),
        assessments: Math.floor(Math.random() * 5) + 1,
      };
    });
  }, []);

  const violationsByCategoryData = useMemo(() => {
    const categoryGroups = violations.reduce((acc, violation) => {
      const category = violation.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryGroups).map(([category, count]) => ({
      category,
      count,
      percentage: violations.length > 0 ? (count / violations.length * 100).toFixed(1) : '0',
    }));
  }, [violations]);

  const maturityRadarData = useMemo(() => {
    return [
      { domain: 'Governance', current: 4, target: 5, fullMark: 5 },
      { domain: 'Risk Management', current: 3, target: 4, fullMark: 5 },
      { domain: 'Compliance Monitoring', current: 4, target: 5, fullMark: 5 },
      { domain: 'Incident Response', current: 3, target: 4, fullMark: 5 },
      { domain: 'Training & Awareness', current: 2, target: 4, fullMark: 5 },
      { domain: 'Technology Controls', current: 4, target: 5, fullMark: 5 },
    ];
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Scale className="h-8 w-8 text-purple-600" />
              Compliance Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive compliance management with regulatory framework monitoring, policy tracking, and automated reporting
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
            <Button variant="outline" onClick={() => setShowCreateReportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button onClick={() => setShowAssessmentDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Run Assessment
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Compliance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(COMPLIANCE_FRAMEWORKS.reduce((sum, f) => sum + f.score, 0) / COMPLIANCE_FRAMEWORKS.length)}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-4">
                <Progress 
                  value={COMPLIANCE_FRAMEWORKS.reduce((sum, f) => sum + f.score, 0) / COMPLIANCE_FRAMEWORKS.length} 
                  className="h-2" 
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {COMPLIANCE_FRAMEWORKS.filter(f => f.score >= 80).length} of {COMPLIANCE_FRAMEWORKS.length} frameworks compliant
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Violations</p>
                  <p className="text-2xl font-bold text-red-600">
                    {COMPLIANCE_FRAMEWORKS.reduce((sum, f) => sum + f.violations, 0)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      Critical: {violations.filter(v => v.severity === 'critical').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      High: {violations.filter(v => v.severity === 'high').length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Frameworks</p>
                  <p className="text-2xl font-bold">{COMPLIANCE_FRAMEWORKS.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground">
                  {COMPLIANCE_FRAMEWORKS.filter(f => f.implementationStatus === 'implemented').length} implemented, {' '}
                  {COMPLIANCE_FRAMEWORKS.filter(f => f.implementationStatus === 'in-progress').length} in progress
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <p className="text-2xl font-bold text-yellow-600">Medium</p>
                </div>
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground">
                  Based on {COMPLIANCE_FRAMEWORKS.filter(f => f.riskLevel === 'medium' || f.riskLevel === 'high').length} frameworks at risk
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="remediation">Remediation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Compliance Scores by Framework
                  </CardTitle>
                  <CardDescription>
                    Current compliance scores across all frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overallComplianceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <RechartsTooltip />
                      <Bar dataKey="score" fill="#3b82f6" />
                      <ReferenceLine y={80} stroke="#10b981" strokeDasharray="5 5" label="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Compliance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Compliance Trends
                  </CardTitle>
                  <CardDescription>
                    Historical compliance performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={complianceTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="overallScore"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        stroke="#3b82f6"
                        name="Compliance Score"
                      />
                      <Bar yAxisId="right" dataKey="violations" fill="#ef4444" name="Violations" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Violations by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Violations by Category
                  </CardTitle>
                  <CardDescription>
                    Distribution of policy violations by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={violationsByCategoryData}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ category, percentage }) => `${category} (${percentage}%)`}
                      >
                        {violationsByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Maturity Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Maturity Assessment
                  </CardTitle>
                  <CardDescription>
                    Current vs target maturity levels across domains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={maturityRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="domain" />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} />
                      <Radar
                        name="Current"
                        dataKey="current"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Target"
                        dataKey="target"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.1}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Compliance Alerts
                </CardTitle>
                <CardDescription>
                  Latest compliance alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-2 h-8 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'high' ? 'bg-orange-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground">{alert.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.framework} • {new Date(alert.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge className={getRiskLevelColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                  
                  {complianceAlerts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No active compliance alerts</p>
                      <p className="text-sm">All compliance requirements are being met</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Compliance Frameworks</CardTitle>
                    <CardDescription>
                      Manage and monitor regulatory compliance frameworks
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowFrameworkDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Framework
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search frameworks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {COMPLIANCE_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="violations">Violations</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Frameworks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFrameworks.map((framework) => {
                    const IconComponent = getFrameworkIcon(framework.category);
                    const maturity = getMaturityLevel(framework.maturityLevel);
                    
                    return (
                      <Card key={framework.id} className="relative">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${getFrameworkColor(framework.category)}20` }}
                              >
                                <IconComponent 
                                  className="h-5 w-5" 
                                  style={{ color: getFrameworkColor(framework.category) }}
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold">{framework.name}</h3>
                                <p className="text-sm text-muted-foreground">{framework.version}</p>
                              </div>
                            </div>
                            <Badge className={getRiskLevelColor(framework.riskLevel)}>
                              {framework.riskLevel}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">
                            {framework.description}
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Compliance Score</span>
                              <span className={`text-sm font-medium ${getScoreColor(framework.score)}`}>
                                {framework.score}%
                              </span>
                            </div>
                            <Progress value={framework.score} className="h-2" />
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Requirements</div>
                                <div className="font-medium">{framework.requirements}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Controls</div>
                                <div className="font-medium">{framework.controls}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-muted-foreground">Maturity Level</div>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: maturity.color }}
                                  ></div>
                                  <span className="text-sm font-medium">
                                    Level {maturity.level} - {maturity.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Violations: {framework.violations}</span>
                              <span>Last assessed: {framework.lastAssessment.toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would continue here... */}
          <TabsContent value="violations">
            <Card>
              <CardHeader>
                <CardTitle>Policy Violations</CardTitle>
                <CardDescription>Track and manage compliance violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p>Violations content would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Assessments</CardTitle>
                <CardDescription>Run and review compliance assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Assessments content would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remediation">
            <Card>
              <CardHeader>
                <CardTitle>Remediation Plans</CardTitle>
                <CardDescription>Manage remediation activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Remediation content would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>Generate and manage compliance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Reports content would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default ComplianceDashboard;