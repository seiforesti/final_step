'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Download,
  Upload,
  Settings,
  RefreshCw,
  Calendar,
  Users,
  Building,
  Zap,
  Gauge,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Edit,
  Trash2,
  Eye,
  Share,
  BookOpen,
  Brain,
  Lightbulb,
  Shield,
  Lock,
  Globe,
  Database,
  Server,
  Cloud,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  Search,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Info,
  HelpCircle,
  Star,
  Bookmark,
  MessageSquare,
  Bell,
  Activity,
  BarChart2,
  LineChart as LineChartIcon,
  Layers,
  Package,
  FileText,
  FolderOpen,
  Save,
  Copy,
  Link,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Home,
  Car,
  Plane,
  Ship,
  Truck,
  Bike,
  Bus,
  Train,
  Taxi,
  Rocket
} from 'lucide-react';

import { useReporting } from '../../hooks/useReporting';
import { reportingApi } from '../../services/reporting-apis';
import { ROICalculation, InvestmentCategory, BusinessMetric, CostBenefit } from '../../types/reporting.types';

interface ROIMetrics {
  totalInvestment: number;
  totalReturns: number;
  netBenefit: number;
  roiPercentage: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
  breakEvenPoint: number;
}

interface InvestmentData {
  id: string;
  name: string;
  category: InvestmentCategory;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  description: string;
  businessJustification: string;
  expectedReturns: number;
  actualReturns?: number;
  risks: string[];
  stakeholders: string[];
}

interface BusinessImpact {
  id: string;
  metric: string;
  baseline: number;
  current: number;
  target: number;
  improvement: number;
  financialValue: number;
  timeframe: string;
  confidence: number;
}

interface ROIScenario {
  id: string;
  name: string;
  description: string;
  assumptions: Record<string, any>;
  metrics: ROIMetrics;
  probability: number;
  risk: 'low' | 'medium' | 'high';
}

const ROI_STATUSES = [
  { value: 'planned', label: 'Planned', color: 'bg-blue-500' },
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
];

const INVESTMENT_CATEGORIES = [
  { value: 'technology', label: 'Technology', icon: Server },
  { value: 'people', label: 'People', icon: Users },
  { value: 'process', label: 'Process', icon: Settings },
  { value: 'infrastructure', label: 'Infrastructure', icon: Building },
  { value: 'compliance', label: 'Compliance', icon: Shield },
  { value: 'security', label: 'Security', icon: Lock }
];

const ROICalculator: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('12m');
  const [calculations, setCalculations] = useState<ROICalculation[]>([]);
  const [investments, setInvestments] = useState<InvestmentData[]>([]);
  const [businessImpacts, setBusinessImpacts] = useState<BusinessImpact[]>([]);
  const [scenarios, setScenarios] = useState<ROIScenario[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<ROIMetrics>({
    totalInvestment: 0,
    totalReturns: 0,
    netBenefit: 0,
    roiPercentage: 0,
    paybackPeriod: 0,
    npv: 0,
    irr: 0,
    breakEvenPoint: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [customTimeRange, setCustomTimeRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Form States
  const [newInvestment, setNewInvestment] = useState<Partial<InvestmentData>>({
    name: '',
    category: 'technology' as InvestmentCategory,
    amount: 0,
    startDate: '',
    endDate: '',
    status: 'planned',
    description: '',
    businessJustification: '',
    expectedReturns: 0,
    risks: [],
    stakeholders: []
  });

  const [newScenario, setNewScenario] = useState<Partial<ROIScenario>>({
    name: '',
    description: '',
    assumptions: {},
    probability: 50,
    risk: 'medium'
  });

  // Hooks
  const {
    roi: { data: roiData, isLoading: roiLoading },
    analytics: { data: analyticsData, isLoading: analyticsLoading },
    trends: { data: trendsData, isLoading: trendsLoading },
    insights: { data: insightsData, isLoading: insightsLoading },
    real_time: { data: realTimeData, isLoading: realTimeLoading },
    fetchROIReports,
    fetchAnalytics,
    fetchTrends,
    fetchInsights,
    fetchRealTimeData,
    generateReport,
    scheduleReport,
    exportData
  } = useReporting();

  // Data fetching
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchROIReports({ timeframe: selectedTimeframe }),
        fetchAnalytics({ timeframe: selectedTimeframe }),
        fetchTrends({ timeframe: selectedTimeframe }),
        fetchInsights({ timeframe: selectedTimeframe }),
        fetchRealTimeData()
      ]);
    };

    loadData();
  }, [selectedTimeframe]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (realTimeData) {
        fetchRealTimeData();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeData]);

  // Calculate ROI metrics
  const calculateROIMetrics = useCallback((investmentIds?: string[]): ROIMetrics => {
    const relevantInvestments = investmentIds 
      ? investments.filter(inv => investmentIds.includes(inv.id))
      : investments;

    const totalInvestment = relevantInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalReturns = relevantInvestments.reduce((sum, inv) => sum + (inv.actualReturns || inv.expectedReturns), 0);
    const netBenefit = totalReturns - totalInvestment;
    const roiPercentage = totalInvestment > 0 ? (netBenefit / totalInvestment) * 100 : 0;

    // Simplified calculations for demo
    const paybackPeriod = totalInvestment > 0 ? totalInvestment / (totalReturns / 12) : 0;
    const npv = netBenefit * 0.9; // Simplified NPV
    const irr = roiPercentage / 100; // Simplified IRR
    const breakEvenPoint = totalInvestment;

    return {
      totalInvestment,
      totalReturns,
      netBenefit,
      roiPercentage,
      paybackPeriod,
      npv,
      irr,
      breakEvenPoint
    };
  }, [investments]);

  // Update metrics when investments change
  useEffect(() => {
    setCurrentMetrics(calculateROIMetrics());
  }, [investments, calculateROIMetrics]);

  // Filtering and sorting
  const filteredInvestments = useMemo(() => {
    let filtered = investments;

    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(inv => inv.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(inv => inv.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof InvestmentData];
      let bValue: any = b[sortBy as keyof InvestmentData];

      if (sortBy === 'amount' || sortBy === 'expectedReturns') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  }, [investments, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  // Chart data
  const roiTrendData = useMemo(() => {
    return trendsData?.roi_trends?.map(trend => ({
      date: trend.date,
      roi: trend.roi_percentage,
      investment: trend.total_investment,
      returns: trend.total_returns,
      netBenefit: trend.net_benefit
    })) || [];
  }, [trendsData]);

  const categoryBreakdownData = useMemo(() => {
    const categoryTotals = investments.reduce((acc, inv) => {
      acc[inv.category] = (acc[inv.category] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      percentage: (amount / currentMetrics.totalInvestment) * 100
    }));
  }, [investments, currentMetrics.totalInvestment]);

  const paybackAnalysisData = useMemo(() => {
    return investments.map(inv => ({
      name: inv.name,
      investment: inv.amount,
      expectedPayback: inv.amount / (inv.expectedReturns / 12),
      actualPayback: inv.actualReturns ? inv.amount / (inv.actualReturns / 12) : null,
      roi: ((inv.actualReturns || inv.expectedReturns) - inv.amount) / inv.amount * 100
    }));
  }, [investments]);

  // Event Handlers
  const handleCreateInvestment = async () => {
    if (!newInvestment.name || !newInvestment.amount) return;

    const investment: InvestmentData = {
      id: `inv_${Date.now()}`,
      name: newInvestment.name,
      category: newInvestment.category || 'technology',
      amount: newInvestment.amount,
      startDate: newInvestment.startDate || new Date().toISOString().split('T')[0],
      endDate: newInvestment.endDate || '',
      status: newInvestment.status || 'planned',
      description: newInvestment.description || '',
      businessJustification: newInvestment.businessJustification || '',
      expectedReturns: newInvestment.expectedReturns || 0,
      risks: newInvestment.risks || [],
      stakeholders: newInvestment.stakeholders || []
    };

    setInvestments(prev => [...prev, investment]);
    setNewInvestment({
      name: '',
      category: 'technology',
      amount: 0,
      startDate: '',
      endDate: '',
      status: 'planned',
      description: '',
      businessJustification: '',
      expectedReturns: 0,
      risks: [],
      stakeholders: []
    });
    setIsCreateDialogOpen(false);
  };

  const handleCreateScenario = async () => {
    if (!newScenario.name || !newScenario.description) return;

    const scenarioMetrics = calculateROIMetrics(selectedInvestments.length > 0 ? selectedInvestments : undefined);
    
    const scenario: ROIScenario = {
      id: `scenario_${Date.now()}`,
      name: newScenario.name,
      description: newScenario.description || '',
      assumptions: newScenario.assumptions || {},
      metrics: scenarioMetrics,
      probability: newScenario.probability || 50,
      risk: newScenario.risk || 'medium'
    };

    setScenarios(prev => [...prev, scenario]);
    setNewScenario({
      name: '',
      description: '',
      assumptions: {},
      probability: 50,
      risk: 'medium'
    });
  };

  const handleExportData = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      await exportData({
        type: 'roi_analysis',
        format,
        data: {
          metrics: currentMetrics,
          investments: filteredInvestments,
          scenarios,
          businessImpacts
        }
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await generateReport({
        type: 'roi_comprehensive',
        timeframe: selectedTimeframe,
        includeProjections: true,
        includeScenarios: true
      });
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  // Utility functions
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

  const getStatusColor = (status: string): string => {
    const statusConfig = ROI_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-500';
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (roiLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            ROI Calculator & Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive return on investment analysis and business value tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="12m">12 Months</SelectItem>
              <SelectItem value="24m">24 Months</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Investment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Investment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Investment Name</Label>
                    <Input
                      id="name"
                      value={newInvestment.name || ''}
                      onChange={(e) => setNewInvestment(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter investment name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newInvestment.category || 'technology'}
                      onValueChange={(value) => setNewInvestment(prev => ({ ...prev, category: value as InvestmentCategory }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTMENT_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Investment Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newInvestment.amount || 0}
                      onChange={(e) => setNewInvestment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedReturns">Expected Returns ($)</Label>
                    <Input
                      id="expectedReturns"
                      type="number"
                      value={newInvestment.expectedReturns || 0}
                      onChange={(e) => setNewInvestment(prev => ({ ...prev, expectedReturns: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newInvestment.description || ''}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the investment..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="justification">Business Justification</Label>
                  <Textarea
                    id="justification"
                    value={newInvestment.businessJustification || ''}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, businessJustification: e.target.value }))}
                    placeholder="Provide business justification..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateInvestment}>
                    Create Investment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Key Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMetrics.totalInvestment)}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMetrics.totalReturns)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI Percentage</p>
                <p className={`text-2xl font-bold ${currentMetrics.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(currentMetrics.roiPercentage)}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${currentMetrics.roiPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {currentMetrics.roiPercentage >= 0 ? (
                  <ArrowUpRight className="h-6 w-6 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payback Period</p>
                <p className="text-2xl font-bold">{currentMetrics.paybackPeriod.toFixed(1)} months</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  ROI Trend Analysis
                </CardTitle>
                <CardDescription>
                  Historical ROI performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={roiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="investment" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                        name="Investment"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="roi" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="ROI %"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Investment by Category
                </CardTitle>
                <CardDescription>
                  Distribution of investments across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {categoryBreakdownData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${index * 45}, 70%, 50%)`} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Advanced Financial Metrics
                </CardTitle>
                <CardDescription>
                  Detailed financial analysis and projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Net Present Value (NPV)</span>
                    <span className="font-semibold">{formatCurrency(currentMetrics.npv)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Internal Rate of Return (IRR)</span>
                    <span className="font-semibold">{formatPercentage(currentMetrics.irr * 100)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Break-even Point</span>
                    <span className="font-semibold">{formatCurrency(currentMetrics.breakEvenPoint)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Net Benefit</span>
                    <span className={`font-semibold ${currentMetrics.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(currentMetrics.netBenefit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payback Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Payback Analysis
                </CardTitle>
                <CardDescription>
                  Investment payback periods and returns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={paybackAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="investment" name="Investment" unit="$" />
                      <YAxis dataKey="roi" name="ROI" unit="%" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [
                          name === 'roi' ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value)),
                          name
                        ]}
                      />
                      <Scatter 
                        name="Investments" 
                        data={paybackAnalysisData} 
                        fill="#3b82f6"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search investments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {INVESTMENT_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {ROI_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="expectedReturns">Returns</SelectItem>
                    <SelectItem value="startDate">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Investments List */}
          <div className="grid gap-4">
            {filteredInvestments.map((investment) => (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{investment.name}</h3>
                          <Badge 
                            className={`${getStatusColor(investment.status)} text-white`}
                          >
                            {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">
                            {investment.category.charAt(0).toUpperCase() + investment.category.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {investment.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Investment</p>
                            <p className="font-semibold">{formatCurrency(investment.amount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expected Returns</p>
                            <p className="font-semibold">{formatCurrency(investment.expectedReturns)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expected ROI</p>
                            <p className="font-semibold text-green-600">
                              {formatPercentage(((investment.expectedReturns - investment.amount) / investment.amount) * 100)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-semibold">
                              {investment.startDate} - {investment.endDate || 'Ongoing'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDetails(showDetails === investment.id ? null : investment.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {showDetails === investment.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Business Justification</h4>
                              <p className="text-sm text-muted-foreground">
                                {investment.businessJustification || 'No justification provided'}
                              </p>
                            </div>
                            {investment.risks.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Risks</h4>
                                <div className="flex flex-wrap gap-1">
                                  {investment.risks.map((risk, index) => (
                                    <Badge key={index} variant="destructive" className="text-xs">
                                      {risk}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {investment.stakeholders.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Stakeholders</h4>
                                <div className="flex flex-wrap gap-1">
                                  {investment.stakeholders.map((stakeholder, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {stakeholder}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Investment Analysis Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Analysis Configuration
                </CardTitle>
                <CardDescription>
                  Configure analysis parameters and scope
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Analysis Mode</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={isAnalysisMode}
                      onCheckedChange={setIsAnalysisMode}
                    />
                    <span className="text-sm">Advanced Analysis Mode</span>
                  </div>
                </div>
                <div>
                  <Label>Selected Investments</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {investments.map((investment) => (
                      <div key={investment.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedInvestments.includes(investment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvestments(prev => [...prev, investment.id]);
                            } else {
                              setSelectedInvestments(prev => prev.filter(id => id !== investment.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{investment.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentMetrics(calculateROIMetrics(selectedInvestments))}
                  className="w-full"
                >
                  Run Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>
                  Investment risk analysis and mitigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.slice(0, 3).map((investment) => {
                    const roi = ((investment.expectedReturns - investment.amount) / investment.amount) * 100;
                    const riskLevel = roi > 50 ? 'low' : roi > 20 ? 'medium' : 'high';
                    
                    return (
                      <div key={investment.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{investment.name}</h4>
                          <Badge className={getRiskColor(riskLevel)}>
                            {riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Expected ROI:</span>
                            <span className="font-medium">{formatPercentage(roi)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Risk Score:</span>
                            <span className="font-medium">
                              {riskLevel === 'low' ? '2.1' : riskLevel === 'medium' ? '4.7' : '7.8'}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">ROI Scenarios</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Scenario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create ROI Scenario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scenario-name">Scenario Name</Label>
                    <Input
                      id="scenario-name"
                      value={newScenario.name || ''}
                      onChange={(e) => setNewScenario(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter scenario name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scenario-description">Description</Label>
                    <Textarea
                      id="scenario-description"
                      value={newScenario.description || ''}
                      onChange={(e) => setNewScenario(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the scenario..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="probability">Probability (%)</Label>
                      <Input
                        id="probability"
                        type="number"
                        min="0"
                        max="100"
                        value={newScenario.probability || 50}
                        onChange={(e) => setNewScenario(prev => ({ ...prev, probability: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="risk-level">Risk Level</Label>
                      <Select
                        value={newScenario.risk || 'medium'}
                        onValueChange={(value) => setNewScenario(prev => ({ ...prev, risk: value as 'low' | 'medium' | 'high' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleCreateScenario}>Create Scenario</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{scenario.name}</h3>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(scenario.risk)}>
                        {scenario.risk.toUpperCase()} RISK
                      </Badge>
                      <Badge variant="outline">
                        {scenario.probability}% Probability
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">ROI</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatPercentage(scenario.metrics.roiPercentage)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Benefit</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(scenario.metrics.netBenefit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payback</p>
                      <p className="text-lg font-semibold">
                        {scenario.metrics.paybackPeriod.toFixed(1)} months
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">NPV</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(scenario.metrics.npv)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ROI Performance Trends
              </CardTitle>
              <CardDescription>
                Long-term ROI trends and projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={roiTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="roi" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="ROI %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netBenefit" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Net Benefit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>
                  Intelligent recommendations and observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High ROI Opportunity:</strong> Technology investments show 23% higher returns compared to other categories. Consider increasing allocation to technology initiatives.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Payback Optimization:</strong> Three investments are approaching their expected payback period. Monitor closely for actual vs. projected returns.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Risk Alert:</strong> Infrastructure investments show higher volatility. Consider risk mitigation strategies for future investments in this category.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-green-600">Portfolio Rebalancing</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shift 15% of budget from low-performing process improvements to high-ROI technology investments.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-blue-600">Timing Optimization</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Delay Q4 infrastructure investments by 2 months to align with budget cycles and improve cash flow.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-orange-600">Risk Mitigation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Implement phased rollout for high-risk investments to reduce potential losses and enable early course correction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">Export & Reporting</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportData('excel')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportData('pdf')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportData('csv')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ROICalculator;