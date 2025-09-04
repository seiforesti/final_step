import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, TrendingDown, TrendingUp, Calculator, PieChart, BarChart3, LineChart, Target, Settings, AlertTriangle, CheckCircle, Clock, Calendar, Download, Upload, Save, Eye, EyeOff, RefreshCw, Play, Pause, Square, Zap, Shield, Layers, Activity, Server, Database, HardDrive, Cpu, Monitor, Filter, Search, Plus, Minus, Edit, Trash2, Copy, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Percent, Scale } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, ComposedChart, Area, AreaChart, ScatterChart, Scatter } from 'recharts';
import { cn } from '@/lib copie/utils';
import { useOptimization } from '../../hooks/useOptimization';
import { optimizationApi } from '../../services/optimization-apis';
import { CostMetric, CostOptimizationRule, CostSavingsOpportunity, BudgetAllocation } from '../../types/optimization.types';

interface CostAnalyzerProps {
  className?: string;
  onCostOptimization?: (savings: CostSavingsOpportunity[]) => void;
  onBudgetUpdate?: (allocation: BudgetAllocation) => void;
}

interface CostBreakdown {
  id: string;
  category: 'compute' | 'storage' | 'network' | 'license' | 'support' | 'other';
  name: string;
  currentCost: number;
  projectedCost: number;
  budgetedCost: number;
  variance: number;
  variancePercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  usage: {
    allocated: number;
    utilized: number;
    waste: number;
  };
  provider: string;
  region: string;
  tags: string[];
  lastUpdated: Date;
}

interface CostOptimizationRecommendation {
  id: string;
  type: 'rightsizing' | 'scheduling' | 'reserved_instances' | 'spot_instances' | 'storage_optimization' | 'network_optimization';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  potentialSavings: {
    monthly: number;
    annual: number;
    percentage: number;
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    risk: 'low' | 'medium' | 'high';
    timeToImplement: number; // days
    prerequisites: string[];
  };
  affectedResources: string[];
  metrics: {
    confidence: number;
    impact: number;
    feasibility: number;
  };
  actions: Array<{
    type: string;
    description: string;
    automated: boolean;
    cost: number;
  }>;
}

interface BudgetForecast {
  period: string;
  budgeted: number;
  forecasted: number;
  actual?: number;
  variance: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: number;
    probability: number;
  }>;
}

interface CostAlert {
  id: string;
  type: 'budget_exceeded' | 'unusual_spike' | 'waste_detected' | 'savings_opportunity';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
  actions: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export const CostAnalyzer: React.FC<CostAnalyzerProps> = ({
  className,
  onCostOptimization,
  onBudgetUpdate
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'breakdown' | 'optimization' | 'forecasting' | 'alerts' | 'budgets'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Cost data
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<CostOptimizationRecommendation[]>([]);
  const [budgetForecasts, setBudgetForecasts] = useState<BudgetForecast[]>([]);
  const [costAlerts, setCostAlerts] = useState<CostAlert[]>([]);
  const [totalCosts, setTotalCosts] = useState({
    current: 0,
    projected: 0,
    budgeted: 0,
    savings: 0
  });
  
  // Dialog and modal states
  const [showOptimizationDetails, setShowOptimizationDetails] = useState(false);
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);
  const [showCostAlert, setShowCostAlert] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<CostOptimizationRecommendation | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<CostAlert | null>(null);
  
  // Form states
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: 0,
    period: 'monthly' as 'monthly' | 'quarterly' | 'annual',
    alertThreshold: 80
  });

  // Hooks
  const {
    analyzeCosts,
    getCostBreakdown,
    generateCostOptimizationRecommendations,
    createBudgetForecast,
    getCostAlerts,
    loading: optimizationLoading,
    error: optimizationError
  } = useOptimization();

  // Initialize data
  useEffect(() => {
    loadCostData();
    loadOptimizationRecommendations();
    loadBudgetForecasts();
    loadCostAlerts();
  }, [selectedTimeRange]);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshCostData();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [autoRefresh, selectedTimeRange]);

  // Data loading functions
  const loadCostData = useCallback(async () => {
    try {
      setLoading(true);
      const breakdown = await getCostBreakdown(selectedTimeRange);
      setCostBreakdown(breakdown);
      
      // Calculate totals
      const totals = breakdown.reduce((acc, item) => ({
        current: acc.current + item.currentCost,
        projected: acc.projected + item.projectedCost,
        budgeted: acc.budgeted + item.budgetedCost,
        savings: acc.savings + Math.max(0, item.budgetedCost - item.currentCost)
      }), { current: 0, projected: 0, budgeted: 0, savings: 0 });
      
      setTotalCosts(totals);
    } catch (error) {
      console.error('Failed to load cost data:', error);
    } finally {
      setLoading(false);
    }
  }, [getCostBreakdown, selectedTimeRange]);

  const loadOptimizationRecommendations = useCallback(async () => {
    try {
      const recommendations = await generateCostOptimizationRecommendations();
      setOptimizationRecommendations(recommendations);
      
      if (onCostOptimization) {
        const opportunities = recommendations.map(rec => ({
          id: rec.id,
          type: rec.type,
          potentialSavings: rec.potentialSavings.monthly,
          confidence: rec.metrics.confidence
        }));
        onCostOptimization(opportunities);
      }
    } catch (error) {
      console.error('Failed to load optimization recommendations:', error);
    }
  }, [generateCostOptimizationRecommendations, onCostOptimization]);

  const loadBudgetForecasts = useCallback(async () => {
    try {
      const forecasts = await createBudgetForecast(selectedTimeRange);
      setBudgetForecasts(forecasts);
    } catch (error) {
      console.error('Failed to load budget forecasts:', error);
    }
  }, [createBudgetForecast, selectedTimeRange]);

  const loadCostAlerts = useCallback(async () => {
    try {
      const alerts = await getCostAlerts();
      setCostAlerts(alerts);
    } catch (error) {
      console.error('Failed to load cost alerts:', error);
    }
  }, [getCostAlerts]);

  const refreshCostData = useCallback(async () => {
    await Promise.all([
      loadCostData(),
      loadOptimizationRecommendations(),
      loadBudgetForecasts(),
      loadCostAlerts()
    ]);
  }, [loadCostData, loadOptimizationRecommendations, loadBudgetForecasts, loadCostAlerts]);

  // Cost optimization functions
  const handleImplementRecommendation = useCallback(async (recommendationId: string) => {
    try {
      setLoading(true);
      await optimizationApi.implementCostOptimization(recommendationId);
      await loadOptimizationRecommendations();
      await loadCostData();
    } catch (error) {
      console.error('Failed to implement recommendation:', error);
    } finally {
      setLoading(false);
    }
  }, [loadOptimizationRecommendations, loadCostData]);

  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await optimizationApi.acknowledgeAlert(alertId);
      setCostAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, []);

  // Calculate derived metrics
  const costTrends = useMemo(() => {
    if (!costBreakdown.length) return [];
    
    return costBreakdown.map(item => ({
      name: item.name,
      current: item.currentCost,
      projected: item.projectedCost,
      budgeted: item.budgetedCost,
      waste: item.usage.waste * item.currentCost / 100
    }));
  }, [costBreakdown]);

  const totalPotentialSavings = useMemo(() => {
    return optimizationRecommendations.reduce((sum, rec) => sum + rec.potentialSavings.monthly, 0);
  }, [optimizationRecommendations]);

  const budgetVariance = useMemo(() => {
    if (totalCosts.budgeted === 0) return 0;
    return ((totalCosts.current - totalCosts.budgeted) / totalCosts.budgeted) * 100;
  }, [totalCosts]);

  // Render functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCosts.current.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {budgetVariance >= 0 ? '+' : ''}{budgetVariance.toFixed(1)}% vs budget
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCosts.projected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              End of period forecast
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPotentialSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {optimizationRecommendations.length} opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.max(0, totalCosts.budgeted - totalCosts.current).toLocaleString()}
            </div>
            <Progress 
              value={Math.min(100, (totalCosts.current / totalCosts.budgeted) * 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Cost Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trends</CardTitle>
          <CardDescription>Current vs projected vs budgeted costs by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`$${value?.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="current" fill="#8884d8" name="Current" />
                <Bar dataKey="projected" fill="#82ca9d" name="Projected" />
                <Line type="monotone" dataKey="budgeted" stroke="#ff7300" name="Budget" />
                <Area dataKey="waste" fill="#ff4444" fillOpacity={0.3} name="Waste" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Cost Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={costBreakdown.map(item => ({
                      name: item.name,
                      value: item.currentCost,
                      category: item.category
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Cost']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Savings Opportunities</CardTitle>
            <CardDescription>Highest impact cost optimizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationRecommendations
                .sort((a, b) => b.potentialSavings.monthly - a.potentialSavings.monthly)
                .slice(0, 5)
                .map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "rounded-full p-2",
                        rec.severity === 'critical' && "bg-red-100 text-red-600",
                        rec.severity === 'high' && "bg-orange-100 text-orange-600",
                        rec.severity === 'medium' && "bg-yellow-100 text-yellow-600",
                        rec.severity === 'low' && "bg-blue-100 text-blue-600"
                      )}>
                        {rec.type === 'rightsizing' && <Scale className="h-4 w-4" />}
                        {rec.type === 'scheduling' && <Clock className="h-4 w-4" />}
                        {rec.type === 'reserved_instances' && <Shield className="h-4 w-4" />}
                        {rec.type === 'spot_instances' && <Target className="h-4 w-4" />}
                        {rec.type === 'storage_optimization' && <HardDrive className="h-4 w-4" />}
                        {rec.type === 'network_optimization' && <Activity className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{rec.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {rec.implementation.effort} effort • {rec.implementation.risk} risk
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${rec.potentialSavings.monthly.toLocaleString()}/mo
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {rec.potentialSavings.percentage.toFixed(1)}% savings
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {costAlerts.filter(alert => !alert.acknowledged).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Active Cost Alerts
            </CardTitle>
            <CardDescription>Immediate attention required</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costAlerts
                .filter(alert => !alert.acknowledged)
                .slice(0, 3)
                .map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "rounded-full p-1",
                        alert.severity === 'critical' && "bg-red-100 text-red-600",
                        alert.severity === 'error' && "bg-red-100 text-red-600",
                        alert.severity === 'warning' && "bg-yellow-100 text-yellow-600",
                        alert.severity === 'info' && "bg-blue-100 text-blue-600"
                      )}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{alert.title}</div>
                        <div className="text-xs text-muted-foreground">{alert.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'error' ? 'destructive' :
                        alert.severity === 'warning' ? 'secondary' : 'outline'
                      }>
                        {alert.severity}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCostBreakdown = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Cost Breakdown</h3>
          <p className="text-sm text-muted-foreground">
            Detailed analysis of costs by category and resource
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshCostData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Cost Analysis</CardTitle>
          <CardDescription>Detailed breakdown of costs by resource and category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Cost</TableHead>
                <TableHead>Projected</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costBreakdown.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.provider} • {item.region}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${item.currentCost.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    ${item.projectedCost.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    ${item.budgetedCost.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "flex items-center",
                      item.variance > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {item.variance > 0 ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(item.variancePercentage).toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{item.usage.utilized.toFixed(1)}%</div>
                      <Progress value={item.usage.utilized} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "flex items-center text-sm",
                      item.trend === 'increasing' && "text-red-600",
                      item.trend === 'decreasing' && "text-green-600",
                      item.trend === 'stable' && "text-gray-600"
                    )}>
                      {item.trend === 'increasing' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {item.trend === 'decreasing' && <TrendingDown className="h-3 w-3 mr-1" />}
                      {item.trend === 'stable' && <ArrowUpDown className="h-3 w-3 mr-1" />}
                      {item.trend}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderOptimizationRecommendations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Cost Optimization</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered recommendations to reduce costs and improve efficiency
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadOptimizationRecommendations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Optimize All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {optimizationRecommendations.map((rec) => (
          <Card key={rec.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "rounded-full p-2 mt-1",
                    rec.severity === 'critical' && "bg-red-100 text-red-600",
                    rec.severity === 'high' && "bg-orange-100 text-orange-600",
                    rec.severity === 'medium' && "bg-yellow-100 text-yellow-600",
                    rec.severity === 'low' && "bg-blue-100 text-blue-600"
                  )}>
                    {rec.type === 'rightsizing' && <Scale className="h-4 w-4" />}
                    {rec.type === 'scheduling' && <Clock className="h-4 w-4" />}
                    {rec.type === 'reserved_instances' && <Shield className="h-4 w-4" />}
                    {rec.type === 'spot_instances' && <Target className="h-4 w-4" />}
                    {rec.type === 'storage_optimization' && <HardDrive className="h-4 w-4" />}
                    {rec.type === 'network_optimization' && <Activity className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <CardDescription className="mt-1">{rec.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={
                  rec.severity === 'critical' ? 'destructive' :
                  rec.severity === 'high' ? 'secondary' : 'outline'
                }>
                  {rec.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${rec.potentialSavings.monthly.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Monthly Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {rec.potentialSavings.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Cost Reduction</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Implementation Effort</span>
                    <Badge variant={
                      rec.implementation.effort === 'high' ? 'destructive' :
                      rec.implementation.effort === 'medium' ? 'secondary' : 'outline'
                    }>
                      {rec.implementation.effort}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Risk Level</span>
                    <Badge variant={
                      rec.implementation.risk === 'high' ? 'destructive' :
                      rec.implementation.risk === 'medium' ? 'secondary' : 'outline'
                    }>
                      {rec.implementation.risk}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Time to Implement</span>
                    <span className="font-medium">{rec.implementation.timeToImplement} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence Level</span>
                    <span className="font-medium">{rec.metrics.confidence.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Affected Resources</Label>
                  <div className="flex flex-wrap gap-1">
                    {rec.affectedResources.slice(0, 3).map((resource, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {resource}
                      </Badge>
                    ))}
                    {rec.affectedResources.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{rec.affectedResources.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleImplementRecommendation(rec.id)}
                    disabled={loading}
                  >
                    Implement
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedRecommendation(rec);
                      setShowOptimizationDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBudgetForecasting = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Budget Forecasting</h3>
          <p className="text-sm text-muted-foreground">
            Predictive budget analysis and variance tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowBudgetEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
          <Button onClick={loadBudgetForecasts}>
            <Calculator className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual vs Forecast</CardTitle>
          <CardDescription>Historical and projected budget performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={budgetForecasts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`$${value?.toLocaleString()}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="budgeted" stroke="#8884d8" name="Budgeted" strokeWidth={2} />
                <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" strokeWidth={2} />
                <Line type="monotone" dataKey="forecasted" stroke="#ffc658" name="Forecasted" strokeDasharray="5 5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Variance Analysis</CardTitle>
            <CardDescription>Detailed variance breakdown by period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetForecasts.map((forecast, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{forecast.period}</div>
                    <div className="text-sm text-muted-foreground">
                      Confidence: {forecast.confidence.toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${Math.abs(forecast.variance).toLocaleString()}
                    </div>
                    <div className={cn(
                      "text-sm",
                      forecast.variance > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {forecast.variance > 0 ? "Over" : "Under"} budget
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast Factors</CardTitle>
            <CardDescription>Key factors influencing budget forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetForecasts[0]?.factors?.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{factor.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {factor.probability.toFixed(0)}% probability
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={Math.abs(factor.impact)} className="flex-1" />
                    <span className={cn(
                      "text-sm font-medium",
                      factor.impact > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )) || []}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cost Analyzer</h2>
          <p className="text-muted-foreground">
            Comprehensive cost analysis and optimization insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
              <SelectItem value="1y">1y</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshCostData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="breakdown" className="space-y-6">
          {renderCostBreakdown()}
        </TabsContent>
        
        <TabsContent value="optimization" className="space-y-6">
          {renderOptimizationRecommendations()}
        </TabsContent>
        
        <TabsContent value="forecasting" className="space-y-6">
          {renderBudgetForecasting()}
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          {/* Cost alerts content */}
          <div>Cost Alerts Management (Implementation continues...)</div>
        </TabsContent>
        
        <TabsContent value="budgets" className="space-y-6">
          {/* Budget management content */}
          <div>Budget Management (Implementation continues...)</div>
        </TabsContent>
      </Tabs>

      {/* Optimization Details Dialog */}
      <Dialog open={showOptimizationDetails} onOpenChange={setShowOptimizationDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedRecommendation?.title}</DialogTitle>
            <DialogDescription>{selectedRecommendation?.description}</DialogDescription>
          </DialogHeader>
          {selectedRecommendation && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${selectedRecommendation.potentialSavings.monthly.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Savings</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${selectedRecommendation.potentialSavings.annual.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Annual Savings</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedRecommendation.metrics.confidence.toFixed(0)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Implementation Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedRecommendation.actions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{action.description}</div>
                          <div className="text-sm text-muted-foreground">{action.type}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={action.automated ? "default" : "secondary"}>
                            {action.automated ? "Automated" : "Manual"}
                          </Badge>
                          {action.cost > 0 && (
                            <span className="text-sm font-medium">${action.cost}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowOptimizationDetails(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleImplementRecommendation(selectedRecommendation.id);
                    setShowOptimizationDetails(false);
                  }}
                  disabled={loading}
                >
                  Implement Recommendation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostAnalyzer;