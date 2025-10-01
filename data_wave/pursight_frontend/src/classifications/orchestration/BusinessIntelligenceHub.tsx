import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { BarChart3, TrendingUp, Activity, DollarSign, Users, Target, Award, Clock, Database, AlertTriangle, CheckCircle, XCircle, Info, Settings, Search, Filter, Download, Plus, ArrowUp, ArrowDown, ArrowRight, Calendar, Share, Table, PieChart as PieChartIcon, FileText, Presentation, Lightbulb, Brain, RefreshCw, Edit, Bot, Eye, MoreVertical } from 'lucide-react';

// Import custom hooks and utilities - Mock implementations for now
// import { useClassificationState } from '../core/hooks/useClassificationState';
// import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
// import { aiApi } from '../core/api/aiApi';
// import { websocketApi } from '../core/api/websocketApi';

// TypeScript Interfaces for Business Intelligence Hub
interface BusinessIntelligenceState {
  isLoading: boolean;
  error: string | null;
  dashboards: BIDashboard[];
  reports: BIReport[];
  metrics: BIMetrics;
  kpis: BIKeyPerformanceIndicator[];
  analytics: BIAnalytics;
  insights: BIInsight[];
  forecasts: BIForecast[];
  benchmarks: BIBenchmark[];
  alerts: BIAlert[];
  datasets: BIDataset[];
  visualizations: BIVisualization[];
  governance: BIGovernance;
  security: BISecurity;
  collaboration: BICollaboration;
  automation: BIAutomation;
  integration: BIIntegration;
  performance: BIPerformance;
  quality: BIQuality;
  compliance: BICompliance;
  realTimeMode: boolean;
  autoRefresh: boolean;
  selectedDashboard: string | null;
  selectedReport: string | null;
  selectedTimeRange: BITimeRange;
  filterCriteria: BIFilter;
  viewMode: BIViewMode;
  sortOrder: BISortOrder;
}

// Additional missing interfaces
interface BIForecast {
  id: string;
  name: string;
  type: string;
  value: number;
  confidence: number;
  timestamp: Date;
}

interface BIBenchmark {
  id: string;
  name: string;
  type: string;
  value: number;
  category: string;
  timestamp: Date;
}

interface BIAlert {
  id: string;
  name: string;
  type: string;
  severity: string;
  message: string;
  timestamp: Date;
}

interface BIDataset {
  id: string;
  name: string;
  type: string;
  size: number;
  format: string;
  source: string;
}

interface BIVisualization {
  id: string;
  name: string;
  type: string;
  data: any;
  configuration: any;
}

interface BIGovernance {
  enabled: boolean;
  policies: string[];
  rules: string[];
  compliance: string[];
}

interface BISecurity {
  enabled: boolean;
  authentication: string[];
  authorization: string[];
  encryption: string[];
}

interface BICollaboration {
  enabled: boolean;
  teams: string[];
  projects: string[];
  sharing: string[];
}

interface BIAutomation {
  enabled: boolean;
  workflows: string[];
  triggers: string[];
  actions: string[];
}

interface BIIntegration {
  enabled: boolean;
  apis: string[];
  connectors: string[];
  protocols: string[];
}

interface BIPerformance {
  enabled: boolean;
  metrics: string[];
  optimization: string[];
  monitoring: string[];
}

interface BIQuality {
  enabled: boolean;
  standards: string[];
  testing: string[];
  validation: string[];
}

interface BICompliance {
  enabled: boolean;
  standards: string[];
  regulations: string[];
  audits: string[];
}

interface BIFilter {
  dashboards: string[];
  reports: string[];
  kpis: string[];
  insights: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  search: string;
}

interface BIDashboard {
  id: string;
  name: string;
  description: string;
  type: DashboardType;
  category: DashboardCategory;
  status: DashboardStatus;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  permissions: DashboardPermissions;
  sharing: DashboardSharing;
  automation: DashboardAutomation;
  performance: DashboardPerformance;
  usage: DashboardUsage;
  feedback: DashboardFeedback;
  version: number;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  labels: { [key: string]: string };
}

// Dashboard-related interfaces
interface DashboardWidget {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  configuration: { [key: string]: any };
}

interface DashboardLayout {
  type: string;
  columns: number;
  rows: number;
  grid: string[][];
}

interface DashboardFilter {
  id: string;
  name: string;
  type: string;
  field: string;
  operator: string;
  value: any;
}

interface DashboardPermissions {
  read: string[];
  write: string[];
  admin: string[];
}

interface DashboardSharing {
  enabled: boolean;
  public: boolean;
  users: string[];
  groups: string[];
}

interface DashboardAutomation {
  enabled: boolean;
  refresh: number;
  alerts: string[];
  exports: string[];
}

interface DashboardPerformance {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

interface DashboardUsage {
  views: number;
  users: string[];
  lastAccessed: Date;
}

interface DashboardFeedback {
  rating: number;
  comments: string[];
  suggestions: string[];
}

interface BIReport {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  category: ReportCategory;
  status: ReportStatus;
  format: ReportFormat;
  schedule: ReportSchedule;
  recipients: ReportRecipient[];
  parameters: ReportParameter[];
  data: ReportData;
  visualization: ReportVisualization;
  automation: ReportAutomation;
  delivery: ReportDelivery;
  security: ReportSecurity;
  audit: ReportAudit;
  performance: ReportPerformance;
  quality: ReportQuality;
  version: number;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  labels: { [key: string]: string };
}

// Report-related interfaces
interface ReportSchedule {
  enabled: boolean;
  frequency: string;
  time: string;
  timezone: string;
  days: string[];
}

interface ReportRecipient {
  id: string;
  name: string;
  email: string;
  type: string;
  preferences: { [key: string]: any };
}

interface ReportParameter {
  id: string;
  name: string;
  type: string;
  required: boolean;
  defaultValue: any;
  options: any[];
}

interface ReportData {
  sources: string[];
  queries: string[];
  filters: string[];
  aggregations: string[];
}

interface ReportVisualization {
  type: string;
  configuration: { [key: string]: any };
  charts: string[];
  tables: string[];
}

interface ReportAutomation {
  enabled: boolean;
  triggers: string[];
  actions: string[];
  conditions: string[];
}

interface ReportDelivery {
  methods: string[];
  formats: string[];
  destinations: string[];
  encryption: boolean;
}

interface ReportSecurity {
  enabled: boolean;
  authentication: string[];
  authorization: string[];
  encryption: string[];
}

interface ReportAudit {
  enabled: boolean;
  logging: boolean;
  tracking: string[];
  retention: number;
}

interface ReportPerformance {
  generationTime: number;
  size: number;
  compression: boolean;
  optimization: string[];
}

interface ReportQuality {
  accuracy: number;
  completeness: number;
  consistency: number;
  timeliness: number;
}

interface BIMetrics {
  revenue: RevenueMetrics;
  cost: CostMetrics;
  efficiency: EfficiencyMetrics;
  quality: QualityMetrics;
  customer: CustomerMetrics;
  operational: OperationalMetrics;
  financial: FinancialMetrics;
  performance: PerformanceMetrics;
  growth: GrowthMetrics;
  risk: RiskMetrics;
  compliance: ComplianceMetrics;
  innovation: InnovationMetrics;
  market: MarketMetrics;
  competitive: CompetitiveMetrics;
  strategic: StrategicMetrics;
  sustainability: SustainabilityMetrics;
}

// Metrics-related interfaces
interface RevenueMetrics {
  total: number;
  recurring: number;
  growth: number;
  forecast: number;
}

interface CostMetrics {
  total: number;
  operational: number;
  capital: number;
  reduction: number;
}

interface EfficiencyMetrics {
  overall: number;
  process: number;
  resource: number;
  time: number;
}

interface QualityMetrics {
  overall: number;
  product: number;
  service: number;
  customer: number;
}

interface CustomerMetrics {
  satisfaction: number;
  retention: number;
  acquisition: number;
  lifetime: number;
}

interface OperationalMetrics {
  uptime: number;
  throughput: number;
  latency: number;
  error: number;
}

interface FinancialMetrics {
  profit: number;
  margin: number;
  roi: number;
  cashflow: number;
}

interface PerformanceMetrics {
  speed: number;
  accuracy: number;
  reliability: number;
  scalability: number;
}

interface GrowthMetrics {
  revenue: number;
  customer: number;
  market: number;
  employee: number;
}

interface RiskMetrics {
  overall: number;
  financial: number;
  operational: number;
  compliance: number;
}

interface ComplianceMetrics {
  overall: number;
  regulatory: number;
  internal: number;
  audit: number;
}

interface InnovationMetrics {
  overall: number;
  rnd: number;
  patents: number;
  products: number;
}

interface MarketMetrics {
  share: number;
  position: number;
  penetration: number;
  expansion: number;
}

interface CompetitiveMetrics {
  position: number;
  advantage: number;
  differentiation: number;
  pricing: number;
}

interface StrategicMetrics {
  alignment: number;
  execution: number;
  achievement: number;
  progress: number;
}

interface SustainabilityMetrics {
  environmental: number;
  social: number;
  governance: number;
  overall: number;
}

interface BIKeyPerformanceIndicator {
  id: string;
  name: string;
  description: string;
  category: KPICategory;
  type: KPIType;
  value: number;
  target: number;
  threshold: KPIThreshold;
  trend: KPITrend;
  status: KPIStatus;
  unit: string;
  frequency: KPIFrequency;
  source: KPISource;
  calculation: KPICalculation;
  visualization: KPIVisualization;
  alerts: KPIAlert[];
  history: KPIHistory[];
  benchmarks: KPIBenchmark[];
  forecasts: KPIForecast[];
  insights: KPIInsight[];
  actions: KPIAction[];
  owner: string;
  stakeholders: string[];
  created: Date;
  updated: Date;
  tags: string[];
  labels: { [key: string]: string };
}

// KPI-related interfaces
interface KPIThreshold {
  warning: number;
  critical: number;
  excellent: number;
}

interface KPITrend {
  direction: string;
  change: number;
  period: string;
}

interface KPISource {
  system: string;
  table: string;
  field: string;
  query: string;
}

interface KPICalculation {
  formula: string;
  parameters: string[];
  dependencies: string[];
}

interface KPIVisualization {
  type: string;
  configuration: { [key: string]: any };
  colors: string[];
}

interface KPIAlert {
  id: string;
  type: string;
  condition: string;
  message: string;
  enabled: boolean;
}

interface KPIHistory {
  date: Date;
  value: number;
  target: number;
  status: string;
}

interface KPIBenchmark {
  name: string;
  value: number;
  source: string;
  category: string;
}

interface KPIForecast {
  date: Date;
  value: number;
  confidence: number;
  method: string;
}

interface KPIInsight {
  id: string;
  type: string;
  description: string;
  confidence: number;
  timestamp: Date;
}

interface KPIAction {
  id: string;
  type: string;
  description: string;
  priority: number;
  status: string;
}

interface BIAnalytics {
  descriptive: DescriptiveAnalytics;
  diagnostic: DiagnosticAnalytics;
  predictive: PredictiveAnalytics;
  prescriptive: PrescriptiveAnalytics;
  cognitive: CognitiveAnalytics;
  realTime: RealTimeAnalytics;
  streaming: StreamingAnalytics;
  batch: BatchAnalytics;
  interactive: InteractiveAnalytics;
  selfService: SelfServiceAnalytics;
  embedded: EmbeddedAnalytics;
  mobile: MobileAnalytics;
  cloud: CloudAnalytics;
  edge: EdgeAnalytics;
  augmented: AugmentedAnalytics;
  automated: AutomatedAnalytics;
}

// Analytics-related interfaces
interface DescriptiveAnalytics {
  enabled: boolean;
  reports: string[];
  dashboards: string[];
  metrics: string[];
}

interface DiagnosticAnalytics {
  enabled: boolean;
  tools: string[];
  methods: string[];
  insights: string[];
}

interface PredictiveAnalytics {
  enabled: boolean;
  models: string[];
  algorithms: string[];
  forecasts: string[];
}

interface PrescriptiveAnalytics {
  enabled: boolean;
  recommendations: string[];
  optimizations: string[];
  actions: string[];
}

interface CognitiveAnalytics {
  enabled: boolean;
  ai: string[];
  ml: string[];
  nlp: string[];
}

interface RealTimeAnalytics {
  enabled: boolean;
  streaming: string[];
  processing: string[];
  visualization: string[];
}

interface StreamingAnalytics {
  enabled: boolean;
  sources: string[];
  processing: string[];
  outputs: string[];
}

interface BatchAnalytics {
  enabled: boolean;
  schedules: string[];
  processes: string[];
  outputs: string[];
}

interface InteractiveAnalytics {
  enabled: boolean;
  tools: string[];
  interfaces: string[];
  capabilities: string[];
}

interface SelfServiceAnalytics {
  enabled: boolean;
  users: string[];
  tools: string[];
  data: string[];
}

interface EmbeddedAnalytics {
  enabled: boolean;
  applications: string[];
  apis: string[];
  widgets: string[];
}

interface MobileAnalytics {
  enabled: boolean;
  apps: string[];
  features: string[];
  platforms: string[];
}

interface CloudAnalytics {
  enabled: boolean;
  providers: string[];
  services: string[];
  regions: string[];
}

interface EdgeAnalytics {
  enabled: boolean;
  devices: string[];
  processing: string[];
  connectivity: string[];
}

interface AugmentedAnalytics {
  enabled: boolean;
  ai: string[];
  automation: string[];
  insights: string[];
}

interface AutomatedAnalytics {
  enabled: boolean;
  workflows: string[];
  triggers: string[];
  actions: string[];
}

interface BIInsight {
  id: string;
  title: string;
  description: string;
  type: InsightType;
  category: InsightCategory;
  priority: InsightPriority;
  confidence: number;
  impact: InsightImpact;
  recommendations: InsightRecommendation[];
  evidence: InsightEvidence[];
  source: InsightSource;
  method: InsightMethod;
  validation: InsightValidation;
  automation: InsightAutomation;
  collaboration: InsightCollaboration;
  tracking: InsightTracking;
  lifecycle: InsightLifecycle;
  metadata: InsightMetadata;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  labels: { [key: string]: string };
}

// Insight-related interfaces
interface InsightImpact {
  financial: number;
  operational: number;
  strategic: number;
  risk: number;
}

interface InsightRecommendation {
  id: string;
  type: string;
  description: string;
  priority: number;
  effort: number;
  impact: number;
}

interface InsightEvidence {
  id: string;
  type: string;
  source: string;
  data: any;
  confidence: number;
}

interface InsightSource {
  system: string;
  data: string;
  method: string;
  timestamp: Date;
}

interface InsightMethod {
  algorithm: string;
  parameters: { [key: string]: any };
  validation: string[];
}

interface InsightValidation {
  enabled: boolean;
  methods: string[];
  results: { [key: string]: any };
}

interface InsightAutomation {
  enabled: boolean;
  triggers: string[];
  actions: string[];
  workflows: string[];
}

interface InsightCollaboration {
  enabled: boolean;
  teams: string[];
  sharing: string[];
  feedback: string[];
}

interface InsightTracking {
  enabled: boolean;
  metrics: string[];
  events: string[];
  analytics: string[];
}

interface InsightLifecycle {
  stage: string;
  transitions: string[];
  approvals: string[];
}

interface InsightMetadata {
  version: string;
  author: string;
  documentation: string;
  examples: string[];
}

interface BITimeRange {
  start: Date;
  end: Date;
  period: TimePeriod;
  granularity: TimeGranularity;
  timezone: string;
  comparison: TimeComparison;
  aggregation: TimeAggregation;
}

// Time-related interfaces
interface TimeComparison {
  enabled: boolean;
  period: string;
  baseline: string;
  metrics: string[];
}

interface TimeAggregation {
  enabled: boolean;
  method: string;
  granularity: string;
  functions: string[];
}

// Additional type definitions
type DashboardType = 'executive' | 'operational' | 'analytical' | 'tactical' | 'strategic' | 'custom';
type DashboardCategory = 'overview' | 'performance' | 'financial' | 'operational' | 'customer' | 'product';
type DashboardStatus = 'active' | 'inactive' | 'draft' | 'archived' | 'maintenance';
type ReportType = 'standard' | 'adhoc' | 'scheduled' | 'automated' | 'interactive' | 'custom';
type ReportCategory = 'financial' | 'operational' | 'compliance' | 'performance' | 'strategic' | 'tactical';
type ReportStatus = 'active' | 'inactive' | 'generating' | 'completed' | 'failed' | 'scheduled';
type ReportFormat = 'pdf' | 'excel' | 'csv' | 'html' | 'powerpoint' | 'json' | 'xml';
type KPICategory = 'financial' | 'operational' | 'customer' | 'process' | 'learning' | 'innovation';
type KPIType = 'leading' | 'lagging' | 'concurrent' | 'input' | 'output' | 'outcome';
type KPIStatus = 'on-track' | 'at-risk' | 'off-track' | 'exceeding' | 'unknown';
type KPIFrequency = 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
type InsightType = 'trend' | 'anomaly' | 'correlation' | 'pattern' | 'opportunity' | 'risk';
type InsightCategory = 'operational' | 'strategic' | 'tactical' | 'financial' | 'customer' | 'market';
type InsightPriority = 'critical' | 'high' | 'medium' | 'low' | 'informational';
type TimePeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type TimeGranularity = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
type BIViewMode = 'dashboard' | 'report' | 'analytics' | 'insights' | 'kpis' | 'explorer';
type BISortOrder = 'name' | 'created' | 'updated' | 'priority' | 'status' | 'performance';

// Constants
// const DASHBOARD_TYPES = [
//   { value: 'executive', label: 'Executive Dashboard', icon: Building },
//   { value: 'operational', label: 'Operational Dashboard', icon: Monitor },
//   { value: 'analytical', label: 'Analytical Dashboard', icon: BarChart3 },
//   { value: 'tactical', label: 'Tactical Dashboard', icon: Target },
//   { value: 'strategic', label: 'Strategic Dashboard', icon: Lightbulb },
//   { value: 'custom', label: 'Custom Dashboard', icon: Settings }
// ] as const;

const REPORT_TYPES = [
  { value: 'standard', label: 'Standard Report', icon: FileText },
  { value: 'adhoc', label: 'Ad-hoc Report', icon: Edit },
  { value: 'scheduled', label: 'Scheduled Report', icon: Calendar },
  { value: 'automated', label: 'Automated Report', icon: Bot },
  { value: 'interactive', label: 'Interactive Report', icon: Presentation },
  { value: 'custom', label: 'Custom Report', icon: Settings }
] as const;

const KPI_CATEGORIES = [
  { value: 'financial', label: 'Financial KPIs', icon: DollarSign },
  { value: 'operational', label: 'Operational KPIs', icon: Activity },
  { value: 'customer', label: 'Customer KPIs', icon: Users },
  { value: 'process', label: 'Process KPIs', icon: Settings },
  { value: 'learning', label: 'Learning KPIs', icon: Brain },
  { value: 'innovation', label: 'Innovation KPIs', icon: Lightbulb }
] as const;

const TIME_RANGES = [
  { label: 'Last Hour', value: 'hour' },
  { label: 'Last 24 Hours', value: 'day' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'Last Quarter', value: 'quarter' },
  { label: 'Last Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' }
] as const;

const STATUS_COLORS = {
  'on-track': 'bg-green-100 text-green-800',
  'at-risk': 'bg-yellow-100 text-yellow-800',
  'off-track': 'bg-red-100 text-red-800',
  'exceeding': 'bg-blue-100 text-blue-800',
  'unknown': 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-purple-100 text-purple-800',
  maintenance: 'bg-orange-100 text-orange-800',
  generating: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  scheduled: 'bg-yellow-100 text-yellow-800'
} as const;

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
] as const;

// Mock data generators
const generateBIMetrics = () => ({
  totalRevenue: 12500000,
  monthlyGrowth: 8.5,
  customerSatisfaction: 94.2,
  operationalEfficiency: 87.8,
  costOptimization: 15.3,
  marketShare: 23.7,
  employeeEngagement: 89.4,
  innovationIndex: 76.9,
  qualityScore: 92.1,
  riskScore: 12.4
});

const generateKPIs = (): BIKeyPerformanceIndicator[] => [
  {
    id: 'kpi-001',
    name: 'Monthly Recurring Revenue',
    description: 'Total monthly recurring revenue from all active subscriptions',
    category: 'financial',
    type: 'lagging',
    value: 2850000,
    target: 3000000,
    threshold: {} as KPIThreshold,
    trend: {} as KPITrend,
    status: 'at-risk',
    unit: 'USD',
    frequency: 'monthly',
    source: {} as KPISource,
    calculation: {} as KPICalculation,
    visualization: {} as KPIVisualization,
    alerts: [],
    history: [],
    benchmarks: [],
    forecasts: [],
    insights: [],
    actions: [],
    owner: 'CFO',
    stakeholders: ['CEO', 'Sales Director', 'Finance Team'],
    created: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tags: ['revenue', 'subscription', 'financial'],
    labels: { priority: 'high', department: 'finance' }
  },
  {
    id: 'kpi-002',
    name: 'Customer Acquisition Cost',
    description: 'Average cost to acquire a new customer',
    category: 'customer',
    type: 'leading',
    value: 245,
    target: 200,
    threshold: {} as KPIThreshold,
    trend: {} as KPITrend,
    status: 'off-track',
    unit: 'USD',
    frequency: 'monthly',
    source: {} as KPISource,
    calculation: {} as KPICalculation,
    visualization: {} as KPIVisualization,
    alerts: [],
    history: [],
    benchmarks: [],
    forecasts: [],
    insights: [],
    actions: [],
    owner: 'CMO',
    stakeholders: ['CEO', 'Marketing Team', 'Sales Team'],
    created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['customer', 'acquisition', 'cost'],
    labels: { priority: 'high', department: 'marketing' }
  },
  {
    id: 'kpi-003',
    name: 'System Uptime',
    description: 'Percentage of time systems are operational and available',
    category: 'operational',
    type: 'concurrent',
    value: 99.8,
    target: 99.9,
    threshold: {} as KPIThreshold,
    trend: {} as KPITrend,
    status: 'on-track',
    unit: '%',
    frequency: 'real-time',
    source: {} as KPISource,
    calculation: {} as KPICalculation,
    visualization: {} as KPIVisualization,
    alerts: [],
    history: [],
    benchmarks: [],
    forecasts: [],
    insights: [],
    actions: [],
    owner: 'CTO',
    stakeholders: ['CEO', 'Engineering Team', 'Operations Team'],
    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 5 * 60 * 1000),
    tags: ['uptime', 'reliability', 'operational'],
    labels: { priority: 'critical', department: 'engineering' }
  }
];

const generateRevenueData = () => {
  const data = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data.push({
      month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: Math.floor(2000000 + Math.random() * 1000000),
      target: 2500000,
      growth: Math.floor(5 + Math.random() * 10)
    });
  }
  return data;
};

const generateCustomerMetrics = () => [
  { name: 'New Customers', value: 1250, change: 12.5, trend: 'up' },
  { name: 'Churn Rate', value: 3.2, change: -0.8, trend: 'down' },
  { name: 'Lifetime Value', value: 8750, change: 15.3, trend: 'up' },
  { name: 'Satisfaction Score', value: 94.2, change: 2.1, trend: 'up' }
];

const generateOperationalData = () => [
  { metric: 'Efficiency', current: 87.8, target: 90, benchmark: 85 },
  { metric: 'Quality', current: 92.1, target: 95, benchmark: 88 },
  { metric: 'Speed', current: 78.5, target: 80, benchmark: 75 },
  { metric: 'Cost', current: 82.3, target: 85, benchmark: 80 },
  { metric: 'Innovation', current: 76.9, target: 80, benchmark: 70 },
  { metric: 'Compliance', current: 96.4, target: 98, benchmark: 95 }
];

const generateMarketShareData = () => [
  { name: 'Our Company', value: 23.7, color: CHART_COLORS[0] },
  { name: 'Competitor A', value: 19.3, color: CHART_COLORS[1] },
  { name: 'Competitor B', value: 15.8, color: CHART_COLORS[2] },
  { name: 'Competitor C', value: 12.4, color: CHART_COLORS[3] },
  { name: 'Others', value: 28.8, color: CHART_COLORS[4] }
];

const generateInsights = (): BIInsight[] => [
  {
    id: 'insight-001',
    title: 'Revenue Growth Acceleration',
    description: 'Q3 revenue growth is 25% higher than projected, driven by enterprise segment expansion',
    type: 'trend',
    category: 'financial',
    priority: 'high',
    confidence: 0.92,
    impact: {} as InsightImpact,
    recommendations: [],
    evidence: [],
    source: {} as InsightSource,
    method: {} as InsightMethod,
    validation: {} as InsightValidation,
    automation: {} as InsightAutomation,
    collaboration: {} as InsightCollaboration,
    tracking: {} as InsightTracking,
    lifecycle: {} as InsightLifecycle,
    metadata: {} as InsightMetadata,
    created: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 30 * 60 * 1000),
    createdBy: 'AI Analytics Engine',
    updatedBy: 'AI Analytics Engine',
    tags: ['revenue', 'growth', 'enterprise'],
    labels: { source: 'automated', confidence: 'high' }
  },
  {
    id: 'insight-002',
    title: 'Customer Acquisition Cost Spike',
    description: 'CAC increased 22% in the last month due to increased competition in digital channels',
    type: 'anomaly',
    category: 'customer',
    priority: 'critical',
    confidence: 0.87,
    impact: {} as InsightImpact,
    recommendations: [],
    evidence: [],
    source: {} as InsightSource,
    method: {} as InsightMethod,
    validation: {} as InsightValidation,
    automation: {} as InsightAutomation,
    collaboration: {} as InsightCollaboration,
    tracking: {} as InsightTracking,
    lifecycle: {} as InsightLifecycle,
    metadata: {} as InsightMetadata,
    created: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    createdBy: 'AI Analytics Engine',
    updatedBy: 'Marketing Analyst',
    tags: ['cac', 'acquisition', 'competition'],
    labels: { source: 'automated', urgency: 'high' }
  },
  {
    id: 'insight-003',
    title: 'Operational Efficiency Opportunity',
    description: 'Process automation in customer service could reduce costs by 15% while improving response times',
    type: 'opportunity',
    category: 'operational',
    priority: 'medium',
    confidence: 0.78,
    impact: {} as InsightImpact,
    recommendations: [],
    evidence: [],
    source: {} as InsightSource,
    method: {} as InsightMethod,
    validation: {} as InsightValidation,
    automation: {} as InsightAutomation,
    collaboration: {} as InsightCollaboration,
    tracking: {} as InsightTracking,
    lifecycle: {} as InsightLifecycle,
    metadata: {} as InsightMetadata,
    created: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 3 * 60 * 60 * 1000),
    createdBy: 'Operations Analyst',
    updatedBy: 'Operations Analyst',
    tags: ['automation', 'efficiency', 'cost-reduction'],
    labels: { source: 'manual', department: 'operations' }
  }
];

// Main Component
export const BusinessIntelligenceHub: React.FC = () => {
  // State Management
  const [state, setState] = useState<BusinessIntelligenceState>({
    isLoading: false,
    error: null,
    dashboards: [],
    reports: [],
    metrics: {} as BIMetrics,
    kpis: generateKPIs(),
    analytics: {} as BIAnalytics,
    insights: generateInsights(),
    forecasts: [],
    benchmarks: [],
    alerts: [],
    datasets: [],
    visualizations: [],
    governance: {} as BIGovernance,
    security: {} as BISecurity,
    collaboration: {} as BICollaboration,
    automation: {} as BIAutomation,
    integration: {} as BIIntegration,
    performance: {} as BIPerformance,
    quality: {} as BIQuality,
    compliance: {} as BICompliance,
    realTimeMode: true,
    autoRefresh: true,
    selectedDashboard: null,
    selectedReport: null,
    selectedTimeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      period: 'month',
      granularity: 'day',
      timezone: 'UTC',
      comparison: {} as TimeComparison,
      aggregation: {} as TimeAggregation
    },
    filterCriteria: {} as BIFilter,
    viewMode: 'dashboard',
    sortOrder: 'updated'
  });

  // Custom hooks - Mock implementations for now
  // const { classifications, updateClassification } = useClassificationState();
  // const { aiModels, aiAgents, startIntelligence, stopIntelligence } = useAIIntelligence();

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  // Memoized data
  const biMetrics = useMemo(() => generateBIMetrics(), []);
  const revenueData = useMemo(() => generateRevenueData(), []);
  const customerMetrics = useMemo(() => generateCustomerMetrics(), []);
  const operationalData = useMemo(() => generateOperationalData(), []);
  const marketShareData = useMemo(() => generateMarketShareData(), []);

  // Effects
  useEffect(() => {
    if (state.realTimeMode && state.autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefreshData();
      }, 30000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.realTimeMode, state.autoRefresh]);

  useEffect(() => {
    if (state.realTimeMode) {
      initializeWebSocket();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [state.realTimeMode]);

  // WebSocket initialization
  const initializeWebSocket = useCallback(() => {
    try {
      // Mock WebSocket connection for now
      console.log('Initializing WebSocket connection for business-intelligence');
      
      // Simulate WebSocket connection
      const mockWebSocket = {
        onmessage: (event: any) => {
          const data = JSON.parse(event.data);
          handleRealTimeUpdate(data);
        },
        onerror: (error: any) => {
          console.error('WebSocket error:', error);
          setState(prev => ({ ...prev, error: 'Real-time connection failed' }));
        },
        close: () => {
          console.log('WebSocket connection closed');
        }
      } as WebSocket;
      
      websocketRef.current = mockWebSocket;
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, []);

  // Event Handlers
  const handleRefreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock API calls for now - will be replaced with real implementation
      const [dashboardsData, reportsData, kpisData, insightsData] = await Promise.all([
        Promise.resolve([]),
        Promise.resolve([]),
        Promise.resolve(generateKPIs()),
        Promise.resolve(generateInsights())
      ]);

      setState(prev => ({
        ...prev,
        dashboards: dashboardsData,
        reports: reportsData,
        kpis: kpisData,
        insights: insightsData,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        isLoading: false
      }));
    }
  }, []);

  const handleRealTimeUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      kpis: data.kpis || prev.kpis,
      insights: data.insights || prev.insights,
      metrics: { ...prev.metrics, ...data.metrics }
    }));
  }, []);

  // const handleCreateDashboard = useCallback(async (type: DashboardType) => {
  //   setState(prev => ({ ...prev, isLoading: true }));
  //   
  //   try {
  //     // Mock API call for now
  //     console.log('Creating dashboard:', type);
  //     const dashboard = {
  //       id: `dashboard-${Date.now()}`,
  //       name: `${type} Dashboard`,
  //       description: `A ${type} dashboard`,
  //       type,
  //       category: 'overview' as DashboardCategory,
  //       status: 'active' as DashboardStatus,
  //       widgets: [],
  //       layout: {} as DashboardLayout,
  //       filters: [],
  //       permissions: {} as DashboardPermissions,
  //       sharing: {} as DashboardSharing,
  //       automation: {} as DashboardAutomation,
  //       performance: {} as DashboardPerformance,
  //       usage: {} as DashboardUsage,
  //       feedback: {} as DashboardFeedback,
  //       version: 1,
  //       created: new Date(),
  //       updated: new Date(),
  //       createdBy: 'admin',
  //       updatedBy: 'admin',
  //       tags: [type],
  //       labels: { type, status: 'active' }
  //     };
  //     
  //     setState(prev => ({
  //       ...prev,
  //       dashboards: [...prev.dashboards, dashboard],
  //       isLoading: false
  //     }));
  //   } catch (error) {
  //     setState(prev => ({
  //       ...prev,
  //       error: error instanceof Error ? error.message : 'Failed to create dashboard',
  //       isLoading: false
  //     }));
  //   }
  // }, []);

  const handleGenerateReport = useCallback(async (type: ReportType) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Mock API call for now
      console.log('Generating report:', type);
      const report = {
        id: `report-${Date.now()}`,
        name: `${type} Report`,
        description: `A ${type} report`,
        type,
        category: 'financial' as ReportCategory,
        status: 'generating' as ReportStatus,
        format: 'pdf' as ReportFormat,
        schedule: {} as ReportSchedule,
        recipients: [],
        parameters: [],
        data: {} as ReportData,
        visualization: {} as ReportVisualization,
        automation: {} as ReportAutomation,
        delivery: {} as ReportDelivery,
        security: {} as ReportSecurity,
        audit: {} as ReportAudit,
        performance: {} as ReportPerformance,
        quality: {} as ReportQuality,
        version: 1,
        created: new Date(),
        updated: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin',
        tags: [type],
        labels: { type, status: 'generating' }
      };
      
      setState(prev => ({
        ...prev,
        reports: [...prev.reports, report],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate report',
        isLoading: false
      }));
    }
  }, []);

  const handleExportData = useCallback(async (format: ReportFormat) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Mock API call for now
      console.log('Exporting data:', format);
      const exportData = JSON.stringify({
        format,
        timeRange: state.selectedTimeRange,
        kpis: state.kpis.map(kpi => kpi.id),
        insights: state.insights.map(insight => insight.id),
        timestamp: new Date().toISOString()
      });

      // Trigger download
      const blob = new Blob([exportData], { type: getContentType(format) });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bi-export-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Export failed'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedTimeRange, state.kpis, state.insights]);

  // Utility functions
  const getContentType = (format: ReportFormat): string => {
    const types = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      html: 'text/html',
      powerpoint: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      json: 'application/json',
      xml: 'application/xml'
    };
    return types[format] || 'application/octet-stream';
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getKPIStatusIcon = (status: KPIStatus) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'exceeding':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'at-risk':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'off-track':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightPriorityColor = (priority: InsightPriority): string => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <ArrowRight className="h-4 w-4 text-gray-600" />;
  };

  // Render functions
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(biMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +{biMetrics.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(biMetrics.customerSatisfaction)}</div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(biMetrics.operationalEfficiency)}</div>
            <p className="text-xs text-muted-foreground">
              +2.3% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Share</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(biMetrics.marketShare)}</div>
            <p className="text-xs text-muted-foreground">
              Leading position
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(biMetrics.qualityScore)}</div>
            <p className="text-xs text-muted-foreground">
              Exceeding targets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Revenue Trends</span>
          </CardTitle>
          <CardDescription>
            12-month revenue performance vs targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="revenue" fill={CHART_COLORS[0]} name="Actual Revenue" />
                <Line type="monotone" dataKey="target" stroke={CHART_COLORS[1]} strokeWidth={2} name="Target" />
                <Line type="monotone" dataKey="growth" stroke={CHART_COLORS[2]} strokeWidth={2} name="Growth %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Customer Metrics and Market Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Customer Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerMetrics.map((metric) => (
                <div key={metric.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(metric.trend)}
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {metric.change > 0 ? '+' : ''}{metric.change}% change
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {metric.name.includes('Rate') || metric.name.includes('Score') 
                        ? formatPercentage(metric.value)
                        : formatNumber(metric.value)
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Market Share</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketShareData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marketShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderKPIsTab = () => (
    <div className="space-y-6">
      {/* KPI Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search KPIs..."
              className="w-64"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {KPI_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on-track">On Track</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="off-track">Off Track</SelectItem>
              <SelectItem value="exceeding">Exceeding</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add KPI
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.kpis.map((kpi) => (
          <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getKPIStatusIcon(kpi.status)}
                  <CardTitle className="text-lg">{kpi.name}</CardTitle>
                </div>
                <Badge className={STATUS_COLORS[kpi.status]}>
                  {kpi.status}
                </Badge>
              </div>
              <CardDescription>{kpi.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current</span>
                  <span className="text-2xl font-bold">
                    {kpi.unit === 'USD' ? formatCurrency(kpi.value) : 
                     kpi.unit === '%' ? formatPercentage(kpi.value) : 
                     formatNumber(kpi.value)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Target</span>
                  <span className="font-medium">
                    {kpi.unit === 'USD' ? formatCurrency(kpi.target) : 
                     kpi.unit === '%' ? formatPercentage(kpi.target) : 
                     formatNumber(kpi.target)}
                  </span>
                </div>
                <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Owner: {kpi.owner}</span>
                  <span className="text-muted-foreground">Freq: {kpi.frequency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Operational Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={operationalData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current" dataKey="current" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} />
                <Radar name="Target" dataKey="target" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.1} />
                <Radar name="Benchmark" dataKey="benchmark" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.1} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Insights Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium">AI-Generated Insights</h3>
          <Badge variant="outline">
            {state.insights.length} insights
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {state.insights.map((insight) => (
          <Card key={insight.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    insight.priority === 'critical' ? 'bg-red-500' :
                    insight.priority === 'high' ? 'bg-orange-500' :
                    insight.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <CardDescription>{insight.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {insight.type}
                  </Badge>
                  <Badge className={`capitalize ${getInsightPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="ml-1 font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-1 font-medium capitalize">{insight.category}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-1 font-medium">{insight.created.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Report Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TYPES.map((type) => (
              <div key={type.value} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                   onClick={() => handleGenerateReport(type.value)}>
                <div className="flex items-center space-x-3">
                  <type.icon className="h-8 w-8 text-primary" />
                  <div>
                    <h4 className="font-medium">{type.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {type.value === 'standard' && 'Pre-built reports with standard metrics'}
                      {type.value === 'adhoc' && 'Custom reports for specific analysis'}
                      {type.value === 'scheduled' && 'Automated reports on schedule'}
                      {type.value === 'automated' && 'AI-powered automated insights'}
                      {type.value === 'interactive' && 'Interactive dashboards and reports'}
                      {type.value === 'custom' && 'Fully customizable report templates'}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="mt-3 w-full">
                  Generate Report
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries({
              pdf: { label: 'PDF Report', icon: FileText },
              excel: { label: 'Excel Workbook', icon: Table },
              csv: { label: 'CSV Data', icon: Database },
              powerpoint: { label: 'PowerPoint', icon: Presentation }
            }).map(([format, config]) => (
              <Button
                key={format}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleExportData(format as ReportFormat)}
              >
                <config.icon className="h-8 w-8" />
                <span>{config.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>No reports generated yet</p>
            <p className="text-sm">Generate your first report using the templates above</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Analytics Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Descriptive</CardTitle>
            <CardDescription>What happened?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Reports</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Diagnostic</CardTitle>
            <CardDescription>Why did it happen?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-muted-foreground">Analyses</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Predictive</CardTitle>
            <CardDescription>What will happen?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">34</div>
              <div className="text-sm text-muted-foreground">Forecasts</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Prescriptive</CardTitle>
            <CardDescription>What should we do?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Recommendations</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Real-Time Analytics</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Live data streaming</li>
                <li>• Real-time dashboards</li>
                <li>• Instant alerts</li>
                <li>• Event processing</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI-Powered Insights</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Automated pattern detection</li>
                <li>• Anomaly identification</li>
                <li>• Predictive modeling</li>
                <li>• Natural language insights</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Self-Service Analytics</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Drag-and-drop interface</li>
                <li>• Custom visualizations</li>
                <li>• Data exploration tools</li>
                <li>• Collaborative features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Business Intelligence Hub</h1>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${state.realTimeMode ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span>{state.realTimeMode ? 'Live' : 'Static'}</span>
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Switch
            checked={state.autoRefresh}
            onCheckedChange={(checked) => setState(prev => ({ ...prev, autoRefresh: checked }))}
          />
          <Label>Auto Refresh</Label>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={state.isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">{state.error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>KPIs</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="overview" className="mt-0">
              {renderOverviewTab()}
            </TabsContent>
            
            <TabsContent value="kpis" className="mt-0">
              {renderKPIsTab()}
            </TabsContent>
            
            <TabsContent value="insights" className="mt-0">
              {renderInsightsTab()}
            </TabsContent>
            
            <TabsContent value="reports" className="mt-0">
              {renderReportsTab()}
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              {renderAnalyticsTab()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessIntelligenceHub;