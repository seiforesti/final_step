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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Settings,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Pause,
  Stop,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Cpu,
  HardDrive,
  Database,
  Server,
  Monitor,
  Gauge,
  Scale,
  Layers,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Maximize,
  Minimize,
  Split,
  Merge,
  Grid,
  List
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, ComposedChart, Area, AreaChart, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '@/lib/utils';
import { useOptimization } from '../../hooks/useOptimization';
import { optimizationApi } from '../../services/optimization-apis';
import { PerformanceMetric, TuningRecommendation, OptimizationProfile, PerformanceBaseline } from '../../types/optimization.types';

interface TuningAssistantProps {
  className?: string;
  onPerformanceImprovement?: (improvement: PerformanceMetric) => void;
  onTuningComplete?: (profile: OptimizationProfile) => void;
}

interface TuningSession {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'running' | 'paused' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration: number;
  targetMetrics: string[];
  optimizationGoals: {
    performance: number;
    cost: number;
    efficiency: number;
    stability: number;
  };
  currentBaseline: PerformanceBaseline;
  improvements: PerformanceMetric[];
  recommendations: TuningRecommendation[];
  progress: number;
}

interface PerformanceAnalysis {
  componentName: string;
  currentPerformance: {
    throughput: number;
    latency: number;
    errorRate: number;
    resourceUtilization: number;
    efficiency: number;
  };
  baseline: {
    throughput: number;
    latency: number;
    errorRate: number;
    resourceUtilization: number;
    efficiency: number;
  };
  bottlenecks: Array<{
    component: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: number;
    description: string;
    suggestions: string[];
  }>;
  optimizationPotential: {
    throughput: number;
    latency: number;
    cost: number;
    efficiency: number;
  };
}

interface TuningParameter {
  id: string;
  name: string;
  category: 'performance' | 'memory' | 'concurrency' | 'caching' | 'network' | 'storage';
  currentValue: number | string | boolean;
  recommendedValue: number | string | boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
  description: string;
  impact: {
    performance: number;
    stability: number;
    resources: number;
  };
  risk: 'low' | 'medium' | 'high';
  dependencies: string[];
  validationRules: string[];
}

interface TuningStrategy {
  id: string;
  name: string;
  description: string;
  type: 'conservative' | 'moderate' | 'aggressive' | 'experimental';
  estimatedImprovement: {
    performance: number;
    efficiency: number;
    cost: number;
  };
  estimatedRisk: 'low' | 'medium' | 'high';
  parameters: TuningParameter[];
  prerequisites: string[];
  warnings: string[];
  estimatedDuration: number; // minutes
}

interface AutoTuningProfile {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  schedule: {
    frequency: 'continuous' | 'hourly' | 'daily' | 'weekly';
    time?: string;
    days?: string[];
  };
  conditions: {
    performanceThreshold: number;
    utilizationThreshold: number;
    errorRateThreshold: number;
  };
  strategies: string[];
  safetyLimits: {
    maxChangesPerSession: number;
    rollbackOnFailure: boolean;
    approvalRequired: boolean;
  };
  history: Array<{
    timestamp: Date;
    action: string;
    result: 'success' | 'failure' | 'rollback';
    improvement: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const TuningAssistant: React.FC<TuningAssistantProps> = ({
  className,
  onPerformanceImprovement,
  onTuningComplete
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'analysis' | 'tuning' | 'strategies' | 'automation' | 'monitoring'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [autoMode, setAutoMode] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  // Tuning data
  const [tuningSessions, setTuningSessions] = useState<TuningSession[]>([]);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis[]>([]);
  const [tuningStrategies, setTuningStrategies] = useState<TuningStrategy[]>([]);
  const [autoTuningProfiles, setAutoTuningProfiles] = useState<AutoTuningProfile[]>([]);
  const [currentSession, setCurrentSession] = useState<TuningSession | null>(null);
  
  // Dialog and modal states
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showStrategyEditor, setShowStrategyEditor] = useState(false);
  const [showParameterEditor, setShowParameterEditor] = useState(false);
  const [showAutoTuningConfig, setShowAutoTuningConfig] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<TuningStrategy | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<TuningParameter | null>(null);
  
  // Form states
  const [sessionForm, setSessionForm] = useState({
    name: '',
    description: '',
    targetMetrics: [] as string[],
    performanceGoal: 20,
    costGoal: 10,
    efficiencyGoal: 15,
    stabilityGoal: 5
  });

  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});

  // Hooks
  const {
    analyzePerformance,
    generateTuningRecommendations,
    createOptimizationProfile,
    executePerformanceTuning,
    getPerformanceBaselines,
    loading: optimizationLoading,
    error: optimizationError
  } = useOptimization();

  // Initialize data
  useEffect(() => {
    loadTuningData();
    loadPerformanceAnalysis();
    loadTuningStrategies();
    loadAutoTuningProfiles();
  }, [selectedTimeRange]);

  // Real-time updates effect
  useEffect(() => {
    if (!realTimeUpdates || !currentSession) return;
    
    const interval = setInterval(() => {
      refreshCurrentSession();
    }, 5000); // 5 seconds
    
    return () => clearInterval(interval);
  }, [realTimeUpdates, currentSession]);

  // Data loading functions
  const loadTuningData = useCallback(async () => {
    try {
      setLoading(true);
      const sessions = await optimizationApi.getTuningSessions();
      setTuningSessions(sessions);
      
      // Find active session
      const active = sessions.find(s => s.status === 'running');
      if (active) setCurrentSession(active);
    } catch (error) {
      console.error('Failed to load tuning data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPerformanceAnalysis = useCallback(async () => {
    try {
      const analysis = await analyzePerformance(selectedTimeRange);
      setPerformanceAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load performance analysis:', error);
    }
  }, [analyzePerformance, selectedTimeRange]);

  const loadTuningStrategies = useCallback(async () => {
    try {
      const strategies = await optimizationApi.getTuningStrategies();
      setTuningStrategies(strategies);
    } catch (error) {
      console.error('Failed to load tuning strategies:', error);
    }
  }, []);

  const loadAutoTuningProfiles = useCallback(async () => {
    try {
      const profiles = await optimizationApi.getAutoTuningProfiles();
      setAutoTuningProfiles(profiles);
    } catch (error) {
      console.error('Failed to load auto-tuning profiles:', error);
    }
  }, []);

  const refreshCurrentSession = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      const updated = await optimizationApi.getTuningSession(currentSession.id);
      setCurrentSession(updated);
      
      // Update sessions list
      setTuningSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      
      // Notify about improvements
      if (onPerformanceImprovement && updated.improvements.length > 0) {
        const latestImprovement = updated.improvements[updated.improvements.length - 1];
        onPerformanceImprovement(latestImprovement);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }, [currentSession, onPerformanceImprovement]);

  // Tuning functions
  const handleCreateTuningSession = useCallback(async () => {
    try {
      setLoading(true);
      const session = await optimizationApi.createTuningSession({
        name: sessionForm.name,
        description: sessionForm.description,
        targetMetrics: sessionForm.targetMetrics,
        optimizationGoals: {
          performance: sessionForm.performanceGoal,
          cost: sessionForm.costGoal,
          efficiency: sessionForm.efficiencyGoal,
          stability: sessionForm.stabilityGoal
        }
      });
      
      setTuningSessions(prev => [...prev, session]);
      setCurrentSession(session);
      setShowCreateSession(false);
      setSessionForm({
        name: '',
        description: '',
        targetMetrics: [],
        performanceGoal: 20,
        costGoal: 10,
        efficiencyGoal: 15,
        stabilityGoal: 5
      });
    } catch (error) {
      console.error('Failed to create tuning session:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionForm]);

  const handleStartTuning = useCallback(async (strategyId: string) => {
    try {
      setLoading(true);
      const result = await executePerformanceTuning({
        strategyId,
        sessionId: currentSession?.id,
        parameters: parameterValues
      });
      
      if (onTuningComplete) {
        onTuningComplete(result);
      }
      
      await refreshCurrentSession();
    } catch (error) {
      console.error('Failed to start tuning:', error);
    } finally {
      setLoading(false);
    }
  }, [currentSession, parameterValues, executePerformanceTuning, onTuningComplete, refreshCurrentSession]);

  const handlePauseTuning = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      await optimizationApi.pauseTuningSession(currentSession.id);
      await refreshCurrentSession();
    } catch (error) {
      console.error('Failed to pause tuning:', error);
    }
  }, [currentSession, refreshCurrentSession]);

  const handleStopTuning = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      await optimizationApi.stopTuningSession(currentSession.id);
      await refreshCurrentSession();
    } catch (error) {
      console.error('Failed to stop tuning:', error);
    }
  }, [currentSession, refreshCurrentSession]);

  const handleApplyRecommendation = useCallback(async (recommendationId: string) => {
    try {
      setLoading(true);
      await optimizationApi.applyTuningRecommendation(recommendationId);
      await loadPerformanceAnalysis();
      await refreshCurrentSession();
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    } finally {
      setLoading(false);
    }
  }, [loadPerformanceAnalysis, refreshCurrentSession]);

  // Calculate derived metrics
  const overallPerformance = useMemo(() => {
    if (!performanceAnalysis.length) return { current: 0, baseline: 0, improvement: 0 };
    
    const avgCurrent = performanceAnalysis.reduce((sum, item) => sum + item.currentPerformance.efficiency, 0) / performanceAnalysis.length;
    const avgBaseline = performanceAnalysis.reduce((sum, item) => sum + item.baseline.efficiency, 0) / performanceAnalysis.length;
    const improvement = ((avgCurrent - avgBaseline) / avgBaseline) * 100;
    
    return { current: avgCurrent, baseline: avgBaseline, improvement };
  }, [performanceAnalysis]);

  const criticalBottlenecks = useMemo(() => {
    if (!performanceAnalysis.length) return [];
    
    return performanceAnalysis
      .flatMap(item => item.bottlenecks)
      .filter(bottleneck => bottleneck.severity === 'critical' || bottleneck.severity === 'high')
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5);
  }, [performanceAnalysis]);

  // Render functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Current Session Status */}
      {currentSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Active Tuning Session: {currentSession.name}
                </CardTitle>
                <CardDescription>{currentSession.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  currentSession.status === 'running' ? 'default' :
                  currentSession.status === 'completed' ? 'secondary' :
                  currentSession.status === 'failed' ? 'destructive' : 'outline'
                }>
                  {currentSession.status}
                </Badge>
                <div className="flex items-center space-x-1">
                  {currentSession.status === 'running' && (
                    <Button size="sm" variant="outline" onClick={handlePauseTuning}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {currentSession.status === 'paused' && (
                    <Button size="sm" variant="outline" onClick={() => handleStartTuning(selectedStrategy?.id || '')}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleStopTuning}>
                    <Stop className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{currentSession.progress.toFixed(1)}%</span>
              </div>
              <Progress value={currentSession.progress} className="w-full" />
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    +{currentSession.optimizationGoals.performance}%
                  </div>
                  <div className="text-xs text-muted-foreground">Performance Target</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    +{currentSession.optimizationGoals.efficiency}%
                  </div>
                  <div className="text-xs text-muted-foreground">Efficiency Target</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    -{currentSession.optimizationGoals.cost}%
                  </div>
                  <div className="text-xs text-muted-foreground">Cost Target</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    +{currentSession.optimizationGoals.stability}%
                  </div>
                  <div className="text-xs text-muted-foreground">Stability Target</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPerformance.current.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {overallPerformance.improvement >= 0 ? '+' : ''}{overallPerformance.improvement.toFixed(1)}% vs baseline
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tuningSessions.filter(s => s.status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {tuningSessions.length} total sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalBottlenecks.length}</div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Tuning</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {autoTuningProfiles.filter(p => p.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active profiles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Real-time performance metrics across components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceAnalysis.map(item => ({
                name: item.componentName,
                current: item.currentPerformance.efficiency,
                baseline: item.baseline.efficiency,
                throughput: item.currentPerformance.throughput,
                latency: item.currentPerformance.latency
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="current" stroke="#8884d8" name="Current Performance" strokeWidth={2} />
                <Line type="monotone" dataKey="baseline" stroke="#82ca9d" name="Baseline" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Critical Bottlenecks */}
      {criticalBottlenecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Critical Performance Bottlenecks
            </CardTitle>
            <CardDescription>High-impact issues requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalBottlenecks.map((bottleneck, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={cn(
                    "rounded-full p-1",
                    bottleneck.severity === 'critical' && "bg-red-100 text-red-600",
                    bottleneck.severity === 'high' && "bg-orange-100 text-orange-600"
                  )}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{bottleneck.component}</h4>
                    <p className="text-sm text-muted-foreground">{bottleneck.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant={bottleneck.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {bottleneck.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {bottleneck.impact.toFixed(1)}% performance impact
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Fix Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCreateSession(true)}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Start New Tuning Session
            </CardTitle>
            <CardDescription>Create a custom performance tuning session</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('strategies')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Apply Tuning Strategy
            </CardTitle>
            <CardDescription>Choose from pre-configured optimization strategies</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowAutoTuningConfig(true)}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Configure Auto-Tuning
            </CardTitle>
            <CardDescription>Set up automated performance optimization</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderPerformanceAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Performance Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Detailed analysis of system performance and bottlenecks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadPerformanceAnalysis}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {performanceAnalysis.map((analysis, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{analysis.componentName}</span>
                <Badge variant={
                  analysis.currentPerformance.efficiency >= 90 ? 'default' :
                  analysis.currentPerformance.efficiency >= 70 ? 'secondary' : 'destructive'
                }>
                  {analysis.currentPerformance.efficiency.toFixed(1)}% efficiency
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Throughput</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {analysis.currentPerformance.throughput.toLocaleString()}/sec
                      </span>
                      <span className={cn(
                        "text-xs",
                        analysis.currentPerformance.throughput >= analysis.baseline.throughput ? "text-green-600" : "text-red-600"
                      )}>
                        {analysis.currentPerformance.throughput >= analysis.baseline.throughput ? '+' : '-'}
                        {Math.abs(((analysis.currentPerformance.throughput - analysis.baseline.throughput) / analysis.baseline.throughput) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Latency</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {analysis.currentPerformance.latency.toFixed(1)}ms
                      </span>
                      <span className={cn(
                        "text-xs",
                        analysis.currentPerformance.latency <= analysis.baseline.latency ? "text-green-600" : "text-red-600"
                      )}>
                        {analysis.currentPerformance.latency <= analysis.baseline.latency ? '-' : '+'}
                        {Math.abs(((analysis.currentPerformance.latency - analysis.baseline.latency) / analysis.baseline.latency) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Error Rate</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {analysis.currentPerformance.errorRate.toFixed(2)}%
                      </span>
                      <span className={cn(
                        "text-xs",
                        analysis.currentPerformance.errorRate <= analysis.baseline.errorRate ? "text-green-600" : "text-red-600"
                      )}>
                        {analysis.currentPerformance.errorRate <= analysis.baseline.errorRate ? '-' : '+'}
                        {Math.abs(analysis.currentPerformance.errorRate - analysis.baseline.errorRate).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Resource Usage</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {analysis.currentPerformance.resourceUtilization.toFixed(1)}%
                      </span>
                      <Progress value={analysis.currentPerformance.resourceUtilization} className="w-16 h-2" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Bottlenecks */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Performance Bottlenecks</Label>
                  <div className="space-y-2">
                    {analysis.bottlenecks.slice(0, 3).map((bottleneck, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            bottleneck.severity === 'critical' && "bg-red-500",
                            bottleneck.severity === 'high' && "bg-orange-500",
                            bottleneck.severity === 'medium' && "bg-yellow-500",
                            bottleneck.severity === 'low' && "bg-blue-500"
                          )} />
                          <span>{bottleneck.component}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {bottleneck.impact.toFixed(0)}% impact
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Optimization Potential */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Optimization Potential</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Throughput</span>
                      <span className="text-green-600">+{analysis.optimizationPotential.throughput.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Latency</span>
                      <span className="text-green-600">-{analysis.optimizationPotential.latency.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cost</span>
                      <span className="text-green-600">-{analysis.optimizationPotential.cost.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Efficiency</span>
                      <span className="text-green-600">+{analysis.optimizationPotential.efficiency.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => setActiveView('tuning')}>
                  <Target className="h-4 w-4 mr-2" />
                  Optimize This Component
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTuningStrategies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Tuning Strategies</h3>
          <p className="text-sm text-muted-foreground">
            Choose from pre-configured optimization strategies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowStrategyEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Strategy
          </Button>
          <Button onClick={loadTuningStrategies}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tuningStrategies.map((strategy) => (
          <Card key={strategy.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{strategy.name}</CardTitle>
                  <CardDescription>{strategy.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    strategy.type === 'conservative' ? 'outline' :
                    strategy.type === 'moderate' ? 'secondary' :
                    strategy.type === 'aggressive' ? 'default' : 'destructive'
                  }>
                    {strategy.type}
                  </Badge>
                  <Badge variant={
                    strategy.estimatedRisk === 'low' ? 'outline' :
                    strategy.estimatedRisk === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {strategy.estimatedRisk} risk
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      +{strategy.estimatedImprovement.performance.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      +{strategy.estimatedImprovement.efficiency.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      -{strategy.estimatedImprovement.cost.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Cost</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Key Parameters ({strategy.parameters.length})</Label>
                  <div className="flex flex-wrap gap-1">
                    {strategy.parameters.slice(0, 4).map((param, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {param.name}
                      </Badge>
                    ))}
                    {strategy.parameters.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{strategy.parameters.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Estimated Duration</span>
                  <span className="font-medium">{strategy.estimatedDuration} minutes</span>
                </div>
                
                {strategy.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Warnings</span>
                    </div>
                    <ul className="text-xs text-yellow-700 mt-1 ml-6 list-disc">
                      {strategy.warnings.slice(0, 2).map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleStartTuning(strategy.id)}
                    disabled={loading || currentSession?.status === 'running'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Apply Strategy
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedStrategy(strategy);
                      setShowParameterEditor(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tuning Assistant</h2>
          <p className="text-muted-foreground">
            AI-powered performance tuning and optimization assistant
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-mode" className="text-sm">Auto Mode</Label>
            <Switch
              id="auto-mode"
              checked={autoMode}
              onCheckedChange={setAutoMode}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="real-time" className="text-sm">Real-time</Label>
            <Switch
              id="real-time"
              checked={realTimeUpdates}
              onCheckedChange={setRealTimeUpdates}
            />
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="tuning">Manual Tuning</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="automation">Auto-Tuning</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          {renderPerformanceAnalysis()}
        </TabsContent>
        
        <TabsContent value="tuning" className="space-y-6">
          {/* Manual tuning interface */}
          <div>Manual Tuning Interface (Implementation continues...)</div>
        </TabsContent>
        
        <TabsContent value="strategies" className="space-y-6">
          {renderTuningStrategies()}
        </TabsContent>
        
        <TabsContent value="automation" className="space-y-6">
          {/* Auto-tuning configuration */}
          <div>Auto-Tuning Configuration (Implementation continues...)</div>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-6">
          {/* Real-time monitoring */}
          <div>Real-time Monitoring (Implementation continues...)</div>
        </TabsContent>
      </Tabs>

      {/* Create Session Dialog */}
      <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Tuning Session</DialogTitle>
            <DialogDescription>
              Configure a new performance tuning session with custom goals
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session-name">Session Name</Label>
                <Input
                  id="session-name"
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter session name"
                />
              </div>
              <div>
                <Label htmlFor="target-metrics">Target Metrics</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metrics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="throughput">Throughput</SelectItem>
                    <SelectItem value="latency">Latency</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={sessionForm.description}
                onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the tuning session goals"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Optimization Goals</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Performance Improvement: {sessionForm.performanceGoal}%</Label>
                  <Slider
                    value={[sessionForm.performanceGoal]}
                    onValueChange={([value]) => setSessionForm(prev => ({ ...prev, performanceGoal: value }))}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Cost Reduction: {sessionForm.costGoal}%</Label>
                  <Slider
                    value={[sessionForm.costGoal]}
                    onValueChange={([value]) => setSessionForm(prev => ({ ...prev, costGoal: value }))}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Efficiency Gain: {sessionForm.efficiencyGoal}%</Label>
                  <Slider
                    value={[sessionForm.efficiencyGoal]}
                    onValueChange={([value]) => setSessionForm(prev => ({ ...prev, efficiencyGoal: value }))}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Stability Improvement: {sessionForm.stabilityGoal}%</Label>
                  <Slider
                    value={[sessionForm.stabilityGoal]}
                    onValueChange={([value]) => setSessionForm(prev => ({ ...prev, stabilityGoal: value }))}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateSession(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTuningSession} disabled={loading}>
              Create Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TuningAssistant;