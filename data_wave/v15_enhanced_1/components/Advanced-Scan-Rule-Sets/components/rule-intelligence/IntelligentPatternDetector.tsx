import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { 
  Brain,
  Search,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Database,
  FileText,
  Code,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  RefreshCw,
  Settings,
  Filter,
  Download,
  Upload,
  Save,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share,
  Link,
  ExternalLink,
  Maximize,
  Minimize,
  MoreHorizontal,
  MoreVertical,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Tag,
  Flag,
  Star,
  Bookmark,
  Layers,
  Network,
  Shuffle,
  GitBranch,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronDown,
  Cpu,
  Memory,
  HardDrive,
  Archive
} from 'lucide-react';

// Hooks and Services
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { usePatternLibrary } from '../../hooks/usePatternLibrary';
import { intelligenceAPI } from '../../services/intelligence-apis';

// RBAC Integration
import { useScanRuleRBAC } from '../../utils/rbac-integration';

// Types
import {
  PatternDetection,
  PatternMatch,
  PatternAnalysis,
  PatternClassification,
  PatternSimilarity,
  PatternEvolution,
  PatternConfidence,
  PatternMetrics,
  PatternInsight,
  PatternRecommendation,
  PatternTrend,
  MLModelResult,
  IntelligenceConfiguration,
  AnalysisConfiguration,
  DetectionThreshold,
  PatternCategory,
  PatternComplexity
} from '../../types/intelligence.types';

// Utils
import { patternAnalyzer } from '../../utils/ai-helpers';
import { mlModelManager } from '../../utils/ai-engine';
import { patternMatcher } from '../../utils/pattern-matcher';

interface IntelligentPatternDetectorProps {
  workspaceId?: string;
  dataSourceId?: string;
  initialPatterns?: PatternDetection[];
  autoDetect?: boolean;
  realTimeMode?: boolean;
  showVisualization?: boolean;
  enableMLModels?: boolean;
  onPatternDetected?: (pattern: PatternDetection) => void;
  onAnalysisComplete?: (analysis: PatternAnalysis) => void;
  onInsightGenerated?: (insight: PatternInsight) => void;
  // RBAC props
  rbac?: any;
  userContext?: any;
  accessLevel?: string;
}

const IntelligentPatternDetector: React.FC<IntelligentPatternDetectorProps> = ({
  workspaceId,
  dataSourceId,
  initialPatterns = [],
  autoDetect = true,
  realTimeMode = false,
  showVisualization = true,
  enableMLModels = true,
  onPatternDetected,
  onAnalysisComplete,
  onInsightGenerated,
  rbac: propRbac,
  userContext: propUserContext,
  accessLevel: propAccessLevel
}) => {
  // RBAC Integration - use prop or hook
  const hookRbac = useScanRuleRBAC();
  const rbac = propRbac || hookRbac;
  const userContext = propUserContext || rbac.getUserContext();
  const accessLevel = propAccessLevel || rbac.getAccessLevel();
  // Hooks
  const {
    insights,
    patterns,
    anomalies,
    generateInsights,
    analyzePatterns,
    detectAnomalies,
    isLoading,
    error
  } = useIntelligence();

  const {
    scanRules,
    activeScanRules,
    createScanRule,
    updateScanRule
  } = useScanRules();

  const {
    patternLibrary,
    categories,
    searchPatterns,
    createPattern,
    updatePattern
  } = usePatternLibrary();

  // State Management
  const [detectedPatterns, setDetectedPatterns] = useState<PatternDetection[]>(initialPatterns);
  const [currentAnalysis, setCurrentAnalysis] = useState<PatternAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<PatternAnalysis[]>([]);
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([]);
  const [patternTrends, setPatternTrends] = useState<PatternTrend[]>([]);
  const [mlModels, setMLModels] = useState<MLModelResult[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<PatternDetection | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionConfiguration, setDetectionConfiguration] = useState<IntelligenceConfiguration>({
    enableRealTime: realTimeMode,
    detectionThreshold: 0.8,
    confidenceLevel: 0.85,
    maxPatterns: 100,
    enableMLAnalysis: enableMLModels,
    patternCategories: ['security', 'performance', 'compliance', 'quality'],
    analysisDepth: 'deep',
    autoClassification: true
  });
  const [filterOptions, setFilterOptions] = useState({
    category: 'all',
    confidence: 'all',
    complexity: 'all',
    status: 'all',
    timeRange: '24h'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('detection');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(realTimeMode);
  const [detectionMetrics, setDetectionMetrics] = useState<PatternMetrics>({
    totalPatterns: 0,
    newPatterns: 0,
    evolvedPatterns: 0,
    similarityScore: 0,
    confidenceDistribution: {},
    categoryDistribution: {},
    complexityDistribution: {},
    detectionRate: 0,
    accuracy: 0,
    falsePositives: 0
  });

  // Refs
  const detectionIntervalRef = useRef<NodeJS.Timeout>();
  const analysisQueueRef = useRef<PatternDetection[]>([]);
  const visualizationRef = useRef<HTMLDivElement>(null);

  // Real-time detection
  useEffect(() => {
    if (realTimeUpdates && autoDetect) {
      detectionIntervalRef.current = setInterval(async () => {
        await handlePatternDetection();
      }, 10000); // Run detection every 10 seconds

      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }
  }, [realTimeUpdates, autoDetect]);

  // Initialize ML models
  useEffect(() => {
    if (enableMLModels) {
      initializeMLModels();
    }
  }, [enableMLModels]);

  // Initialize ML models
  const initializeMLModels = useCallback(async () => {
    try {
      const models = await mlModelManager.loadModels([
        'pattern-classification',
        'anomaly-detection',
        'similarity-analysis',
        'trend-prediction'
      ]);
      setMLModels(models);
    } catch (error) {
      console.error('Failed to initialize ML models:', error);
    }
  }, []);

  // Handle pattern detection
  const handlePatternDetection = useCallback(async () => {
    if (isDetecting) return;

    setIsDetecting(true);
    try {
      const detectionResults = await intelligenceAPI.detectPatterns({
        dataSourceId,
        configuration: detectionConfiguration,
        existingPatterns: detectedPatterns
      });

      const newPatterns = detectionResults.filter(pattern => 
        !detectedPatterns.some(existing => existing.id === pattern.id)
      );

      setDetectedPatterns(prev => [...prev, ...newPatterns]);

      // Trigger callbacks for new patterns
      newPatterns.forEach(pattern => {
        if (onPatternDetected) {
          onPatternDetected(pattern);
        }
      });

      // Update metrics
      updateDetectionMetrics(detectionResults);

      // Queue for analysis if auto-analysis is enabled
      if (detectionConfiguration.autoClassification) {
        analysisQueueRef.current.push(...newPatterns);
        processAnalysisQueue();
      }

    } catch (error) {
      console.error('Failed to detect patterns:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [isDetecting, dataSourceId, detectionConfiguration, detectedPatterns, onPatternDetected]);

  // Process analysis queue
  const processAnalysisQueue = useCallback(async () => {
    if (isAnalyzing || analysisQueueRef.current.length === 0) return;

    setIsAnalyzing(true);
    try {
      const patternsToAnalyze = analysisQueueRef.current.splice(0, 5); // Process 5 at a time
      
      for (const pattern of patternsToAnalyze) {
        const analysis = await handlePatternAnalysis(pattern);
        if (analysis) {
          setAnalysisHistory(prev => [analysis, ...prev.slice(0, 49)]); // Keep last 50
        }
      }

      // Continue processing if more patterns in queue
      if (analysisQueueRef.current.length > 0) {
        setTimeout(processAnalysisQueue, 1000);
      }

    } catch (error) {
      console.error('Failed to process analysis queue:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  // Handle pattern analysis
  const handlePatternAnalysis = useCallback(async (pattern: PatternDetection): Promise<PatternAnalysis | null> => {
    try {
      const analysis = await patternAnalyzer.analyzePattern(pattern, {
        includeEvolution: true,
        includeSimilarity: true,
        includeClassification: true,
        includeInsights: true
      });

      // Generate insights if analysis is complete
      if (analysis && analysis.insights.length > 0) {
        setPatternInsights(prev => [...analysis.insights, ...prev.slice(0, 99)]);
        
        analysis.insights.forEach(insight => {
          if (onInsightGenerated) {
            onInsightGenerated(insight);
          }
        });
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }

      return analysis;
    } catch (error) {
      console.error('Failed to analyze pattern:', error);
      return null;
    }
  }, [onAnalysisComplete, onInsightGenerated]);

  // Update detection metrics
  const updateDetectionMetrics = useCallback((patterns: PatternDetection[]) => {
    const metrics: PatternMetrics = {
      totalPatterns: patterns.length,
      newPatterns: patterns.filter(p => p.isNew).length,
      evolvedPatterns: patterns.filter(p => p.hasEvolved).length,
      similarityScore: patterns.reduce((acc, p) => acc + (p.similarity || 0), 0) / patterns.length,
      confidenceDistribution: {},
      categoryDistribution: {},
      complexityDistribution: {},
      detectionRate: patterns.length / (patterns.length + (patterns.filter(p => p.confidence < 0.5).length)),
      accuracy: patterns.filter(p => p.validated).length / patterns.length,
      falsePositives: patterns.filter(p => p.isFalsePositive).length
    };

    // Calculate distributions
    patterns.forEach(pattern => {
      // Confidence distribution
      const confBucket = Math.floor(pattern.confidence * 10) / 10;
      metrics.confidenceDistribution[confBucket] = (metrics.confidenceDistribution[confBucket] || 0) + 1;

      // Category distribution
      metrics.categoryDistribution[pattern.category] = (metrics.categoryDistribution[pattern.category] || 0) + 1;

      // Complexity distribution
      metrics.complexityDistribution[pattern.complexity] = (metrics.complexityDistribution[pattern.complexity] || 0) + 1;
    });

    setDetectionMetrics(metrics);
  }, []);

  // Filter patterns
  const filteredPatterns = useMemo(() => {
    return detectedPatterns.filter(pattern => {
      const matchesSearch = searchTerm === '' || 
        pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pattern.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterOptions.category === 'all' || pattern.category === filterOptions.category;
      const matchesComplexity = filterOptions.complexity === 'all' || pattern.complexity === filterOptions.complexity;
      const matchesStatus = filterOptions.status === 'all' || pattern.status === filterOptions.status;

      const matchesConfidence = (() => {
        switch (filterOptions.confidence) {
          case 'high': return pattern.confidence >= 0.8;
          case 'medium': return pattern.confidence >= 0.5 && pattern.confidence < 0.8;
          case 'low': return pattern.confidence < 0.5;
          default: return true;
        }
      })();

      const matchesTimeRange = (() => {
        const now = new Date();
        const patternTime = new Date(pattern.detectedAt);
        const diffHours = (now.getTime() - patternTime.getTime()) / (1000 * 60 * 60);

        switch (filterOptions.timeRange) {
          case '1h': return diffHours <= 1;
          case '6h': return diffHours <= 6;
          case '24h': return diffHours <= 24;
          case '7d': return diffHours <= 24 * 7;
          default: return true;
        }
      })();

      return matchesSearch && matchesCategory && matchesComplexity && matchesStatus && matchesConfidence && matchesTimeRange;
    });
  }, [detectedPatterns, searchTerm, filterOptions]);

  // Render confidence badge
  const renderConfidenceBadge = (confidence: number) => {
    let variant: 'success' | 'default' | 'secondary' | 'destructive' = 'default';
    let label = '';

    if (confidence >= 0.8) {
      variant = 'success';
      label = 'High';
    } else if (confidence >= 0.5) {
      variant = 'default';
      label = 'Medium';
    } else {
      variant = 'secondary';
      label = 'Low';
    }

    return (
      <Badge variant={variant}>
        {label} ({(confidence * 100).toFixed(0)}%)
      </Badge>
    );
  };

  // Render complexity badge
  const renderComplexityBadge = (complexity: PatternComplexity) => {
    const colorMap = {
      'simple': 'success',
      'moderate': 'default',
      'complex': 'destructive',
      'highly-complex': 'destructive'
    };

    return (
      <Badge variant={colorMap[complexity] as any} className="capitalize">
        {complexity.replace('-', ' ')}
      </Badge>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const colorMap = {
      'active': 'success',
      'validated': 'success',
      'pending': 'default',
      'rejected': 'destructive',
      'archived': 'secondary'
    };

    return (
      <Badge variant={colorMap[status] as any} className="capitalize">
        {status}
      </Badge>
    );
  };

  // Render pattern visualization
  const renderPatternVisualization = () => {
    if (!showVisualization) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Pattern Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div>
              <Label className="text-sm font-medium mb-3 block">By Category</Label>
              <div className="space-y-2">
                {Object.entries(detectionMetrics.categoryDistribution).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(count / detectionMetrics.totalPatterns) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Distribution */}
            <div>
              <Label className="text-sm font-medium mb-3 block">By Confidence</Label>
              <div className="space-y-2">
                {Object.entries(detectionMetrics.confidenceDistribution).map(([confidence, count]) => (
                  <div key={confidence} className="flex items-center justify-between">
                    <span className="text-sm">{(parseFloat(confidence) * 100).toFixed(0)}%+</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(count / detectionMetrics.totalPatterns) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render metrics dashboard
  const renderMetricsDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Total Patterns</div>
              <div className="text-2xl font-bold mt-1">{detectionMetrics.totalPatterns}</div>
              <div className="text-xs text-green-600 mt-1">
                +{detectionMetrics.newPatterns} new
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Detection Rate</div>
              <div className="text-2xl font-bold mt-1">
                {(detectionMetrics.detectionRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {detectionMetrics.evolvedPatterns} evolved
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Accuracy</div>
              <div className="text-2xl font-bold mt-1">
                {(detectionMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-purple-600 mt-1">
                Avg confidence: {(detectionMetrics.similarityScore * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">False Positives</div>
              <div className="text-2xl font-bold mt-1 text-red-600">
                {detectionMetrics.falsePositives}
              </div>
              <div className="text-xs text-red-600 mt-1">
                {((detectionMetrics.falsePositives / detectionMetrics.totalPatterns) * 100).toFixed(1)}% rate
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Intelligent Pattern Detector
          </h2>
          <p className="text-gray-600">AI-powered pattern recognition and analysis system</p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                >
                  {realTimeUpdates ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {realTimeUpdates ? 'Pause real-time detection' : 'Enable real-time detection'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePatternDetection}
            disabled={isDetecting}
          >
            {isDetecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Detect
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {renderMetricsDashboard()}

      {/* Real-time Status */}
      {realTimeUpdates && (
        <Alert>
          <Activity className="w-4 h-4" />
          <AlertTitle>Real-time Detection Active</AlertTitle>
          <AlertDescription>
            Continuously monitoring for new patterns. Detection runs every 10 seconds.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="detection">Pattern Detection</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="detection" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <Input
                        placeholder="Search patterns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    
                    <Select value={filterOptions.category} onValueChange={(value) =>
                      setFilterOptions(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterOptions.confidence} onValueChange={(value) =>
                      setFilterOptions(prev => ({ ...prev, confidence: value }))
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Confidence</SelectItem>
                        <SelectItem value="high">High (80%+)</SelectItem>
                        <SelectItem value="medium">Medium (50-80%)</SelectItem>
                        <SelectItem value="low">Low (<50%)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterOptions.timeRange} onValueChange={(value) =>
                      setFilterOptions(prev => ({ ...prev, timeRange: value }))
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last Hour</SelectItem>
                        <SelectItem value="6h">Last 6 Hours</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Pattern Visualization */}
              {renderPatternVisualization()}

              {/* Detected Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Detected Patterns ({filteredPatterns.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pattern</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Complexity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Detected</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatterns.map((pattern) => (
                        <TableRow 
                          key={pattern.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedPattern(pattern)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{pattern.name}</div>
                              <div className="text-sm text-gray-600 truncate max-w-xs">
                                {pattern.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {pattern.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {renderConfidenceBadge(pattern.confidence)}
                          </TableCell>
                          <TableCell>
                            {renderComplexityBadge(pattern.complexity)}
                          </TableCell>
                          <TableCell>
                            {renderStatusBadge(pattern.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(pattern.detectedAt).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePatternAnalysis(pattern);
                                }}
                              >
                                <Activity className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle edit
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle archive
                                }}
                              >
                                <Archive className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Pattern Analysis History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No analysis results available</p>
                      <p className="text-sm mt-1">Start pattern detection to see analysis results</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analysisHistory.map((analysis, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{analysis.patternName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(analysis.analyzedAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Classification</div>
                              <div className="font-medium">{analysis.classification}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Similarity Score</div>
                              <div className="font-medium">
                                {(analysis.similarityScore * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Evolution Score</div>
                              <div className="font-medium">
                                {(analysis.evolutionScore * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          {analysis.insights.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-600 mb-1">Insights:</div>
                              <div className="text-sm">
                                {analysis.insights.slice(0, 2).map(insight => insight.title).join(', ')}
                                {analysis.insights.length > 2 && ` +${analysis.insights.length - 2} more`}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Pattern Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patternInsights.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No insights generated yet</p>
                      <p className="text-sm mt-1">Pattern analysis will generate insights automatically</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patternInsights.map((insight, index) => (
                        <Alert key={index} variant={insight.severity === 'critical' ? 'destructive' : 'default'}>
                          <Zap className="w-4 h-4" />
                          <AlertTitle>{insight.title}</AlertTitle>
                          <AlertDescription>
                            {insight.description}
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline">{insight.category}</Badge>
                              <Badge variant={insight.confidence > 0.8 ? 'success' : 'default'}>
                                {(insight.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Pattern Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Pattern trend analysis</p>
                    <p className="text-sm mt-1">Trend visualization will be available with more data</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Detection Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Detection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="detection-threshold">Detection Threshold</Label>
                <div className="mt-2">
                  <Slider
                    id="detection-threshold"
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    value={[detectionConfiguration.detectionThreshold]}
                    onValueChange={(value) =>
                      setDetectionConfiguration(prev => ({ ...prev, detectionThreshold: value[0] }))
                    }
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Current: {(detectionConfiguration.detectionThreshold * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="confidence-level">Confidence Level</Label>
                <div className="mt-2">
                  <Slider
                    id="confidence-level"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={[detectionConfiguration.confidenceLevel]}
                    onValueChange={(value) =>
                      setDetectionConfiguration(prev => ({ ...prev, confidenceLevel: value[0] }))
                    }
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Current: {(detectionConfiguration.confidenceLevel * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-ml">Enable ML Analysis</Label>
                <Switch
                  id="enable-ml"
                  checked={detectionConfiguration.enableMLAnalysis}
                  onCheckedChange={(checked) =>
                    setDetectionConfiguration(prev => ({ ...prev, enableMLAnalysis: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-classification">Auto Classification</Label>
                <Switch
                  id="auto-classification"
                  checked={detectionConfiguration.autoClassification}
                  onCheckedChange={(checked) =>
                    setDetectionConfiguration(prev => ({ ...prev, autoClassification: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="analysis-depth">Analysis Depth</Label>
                <Select
                  value={detectionConfiguration.analysisDepth}
                  onValueChange={(value) =>
                    setDetectionConfiguration(prev => ({ ...prev, analysisDepth: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shallow">Shallow</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="deep">Deep</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ML Models Status */}
          {enableMLModels && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  ML Models
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mlModels.length === 0 ? (
                  <div className="text-sm text-gray-500">Loading ML models...</div>
                ) : (
                  mlModels.map((model, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{model.name}</span>
                      <Badge variant={model.status === 'ready' ? 'success' : 'default'}>
                        {model.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Patterns
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Patterns
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Models
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pattern Details Modal */}
      {selectedPattern && (
        <Dialog open={!!selectedPattern} onOpenChange={() => setSelectedPattern(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Pattern Details: {selectedPattern.name}
              </DialogTitle>
              <DialogDescription>
                Comprehensive analysis and details for detected pattern
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedPattern.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Confidence</Label>
                  <div className="mt-1">
                    {renderConfidenceBadge(selectedPattern.confidence)}
                  </div>
                </div>
                <div>
                  <Label>Complexity</Label>
                  <div className="mt-1">
                    {renderComplexityBadge(selectedPattern.complexity)}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {renderStatusBadge(selectedPattern.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {selectedPattern.description}
                </div>
              </div>

              {selectedPattern.metadata && (
                <div>
                  <Label>Pattern Metadata</Label>
                  <Card className="mt-1">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Detected At</div>
                          <div className="font-medium">
                            {new Date(selectedPattern.detectedAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Data Points</div>
                          <div className="font-medium">
                            {selectedPattern.metadata.dataPoints || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Frequency</div>
                          <div className="font-medium">
                            {selectedPattern.metadata.frequency || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Source</div>
                          <div className="font-medium">
                            {selectedPattern.metadata.source || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedPattern.rules && selectedPattern.rules.length > 0 && (
                <div>
                  <Label>Associated Rules</Label>
                  <div className="mt-1 space-y-2">
                    {selectedPattern.rules.map((rule, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                        <div className="font-medium text-sm">{rule.name}</div>
                        <div className="text-xs text-gray-600">{rule.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedPattern(null)}>
                  Close
                </Button>
                <Button onClick={() => handlePatternAnalysis(selectedPattern)}>
                  <Activity className="w-4 h-4 mr-2" />
                  Analyze Pattern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IntelligentPatternDetector;