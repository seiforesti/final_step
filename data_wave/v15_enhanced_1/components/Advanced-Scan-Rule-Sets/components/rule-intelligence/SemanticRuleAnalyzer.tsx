import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  Target,
  Search,
  Filter,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Database,
  FileText,
  Code,
  GitBranch,
  Network,
  Layers,
  Sparkles,
  Robot,
  Eye,
  Edit,
  Plus,
  MoreHorizontal,
  Download,
  Upload,
  Save,
  Copy,
  Trash2,
  Play,
  Pause,
  Square,
  Clock
} from 'lucide-react';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { usePatternLibrary } from '../../hooks/usePatternLibrary';

// API Services
import { intelligenceAPI } from '../../services/intelligence-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';

// Types
import type { 
  SemanticAnalysis,
  RuleSemantics,
  LanguageModel,
  SemanticPattern,
  AnalysisMetrics,
  SemanticSuggestion,
  RuleComplexity,
  SemanticRelation,
  ConceptMap,
  EntityExtraction,
  IntentClassification,
  SentimentAnalysis,
  SemanticScore,
  LanguageDetection,
  TextNormalization,
  SemanticClustering,
  KnowledgeGraph,
  OntologyMapping,
  SemanticValidation
} from '../../types/intelligence.types';

import type { 
  ScanRule,
  RuleSet,
  RulePattern
} from '../../types/scan-rules.types';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { patternMatcher } from '../../utils/pattern-matcher';

interface SemanticRuleAnalyzerProps {
  className?: string;
  onAnalysisCompleted?: (analysis: SemanticAnalysis) => void;
  onSuggestionGenerated?: (suggestion: SemanticSuggestion) => void;
  onComplexityDetected?: (complexity: RuleComplexity) => void;
}

interface SemanticAnalyzerState {
  analyses: SemanticAnalysis[];
  rules: ScanRule[];
  patterns: SemanticPattern[];
  suggestions: SemanticSuggestion[];
  metrics: AnalysisMetrics;
  languageModels: LanguageModel[];
  conceptMaps: ConceptMap[];
  knowledgeGraph: KnowledgeGraph;
  ontologyMappings: OntologyMapping[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalAnalyses: number;
  successfulAnalyses: number;
  averageComplexity: number;
  semanticScore: number;
  rulesCovered: number;
  patternsDetected: number;
  suggestionsGenerated: number;
  conceptsExtracted: number;
  relationsDiscovered: number;
}

interface SemanticViewState {
  currentView: 'overview' | 'analysis' | 'patterns' | 'suggestions' | 'concepts' | 'validation';
  selectedRule?: ScanRule;
  selectedAnalysis?: SemanticAnalysis;
  selectedPattern?: SemanticPattern;
  analysisType: 'syntax' | 'semantic' | 'intent' | 'sentiment' | 'complexity' | 'all';
  languageModel: string;
  confidenceThreshold: number;
  autoAnalysis: boolean;
  realTimeProcessing: boolean;
  expertMode: boolean;
  filterComplexity: string;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTimeRange: 'hour' | 'day' | 'week' | 'month';
}

const DEFAULT_VIEW_STATE: SemanticViewState = {
  currentView: 'overview',
  analysisType: 'all',
  languageModel: 'transformer_v2',
  confidenceThreshold: 0.8,
  autoAnalysis: true,
  realTimeProcessing: true,
  expertMode: false,
  filterComplexity: 'all',
  searchQuery: '',
  sortBy: 'semantic_score',
  sortOrder: 'desc',
  selectedTimeRange: 'day'
};

const ANALYSIS_TYPES = [
  { value: 'syntax', label: 'Syntax Analysis', description: 'Analyze rule syntax and structure' },
  { value: 'semantic', label: 'Semantic Analysis', description: 'Understand rule meaning and intent' },
  { value: 'intent', label: 'Intent Classification', description: 'Classify rule purpose and goals' },
  { value: 'sentiment', label: 'Sentiment Analysis', description: 'Analyze rule sentiment and tone' },
  { value: 'complexity', label: 'Complexity Analysis', description: 'Measure rule complexity metrics' },
  { value: 'all', label: 'Complete Analysis', description: 'Perform all analysis types' }
];

const LANGUAGE_MODELS = [
  { value: 'transformer_v2', label: 'Transformer V2', description: 'Advanced transformer model' },
  { value: 'bert_base', label: 'BERT Base', description: 'Bidirectional encoder representations' },
  { value: 'gpt_semantic', label: 'GPT Semantic', description: 'Generative pre-trained transformer' },
  { value: 'rule_specific', label: 'Rule-Specific', description: 'Domain-specific language model' }
];

const COMPLEXITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' }
];

export const SemanticRuleAnalyzer: React.FC<SemanticRuleAnalyzerProps> = ({
  className,
  onAnalysisCompleted,
  onSuggestionGenerated,
  onComplexityDetected
}) => {
  // State Management
  const [viewState, setViewState] = useState<SemanticViewState>(DEFAULT_VIEW_STATE);
  const [analyzerState, setAnalyzerState] = useState<SemanticAnalyzerState>({
    analyses: [],
    rules: [],
    patterns: [],
    suggestions: [],
    metrics: {} as AnalysisMetrics,
    languageModels: [],
    conceptMaps: [],
    knowledgeGraph: {} as KnowledgeGraph,
    ontologyMappings: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalAnalyses: 0,
    successfulAnalyses: 0,
    averageComplexity: 0,
    semanticScore: 0,
    rulesCovered: 0,
    patternsDetected: 0,
    suggestionsGenerated: 0,
    conceptsExtracted: 0,
    relationsDiscovered: 0
  });

  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [patternDialogOpen, setPatternDialogOpen] = useState(false);
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Form States
  const [analysisForm, setAnalysisForm] = useState({
    ruleId: '',
    analysisType: 'all' as string,
    languageModel: 'transformer_v2',
    options: {
      extractEntities: true,
      detectSentiment: true,
      analyzeComplexity: true,
      generateSuggestions: true,
      buildConceptMap: true,
      validateSemantics: true
    }
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout>();

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
    patterns,
    getPatterns,
    loading: patternsLoading
  } = usePatternLibrary();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeProcessing) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/semantic-analysis`);
      
      wsRef.current.onopen = () => {
        console.log('Semantic Analysis WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Semantic Analysis WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Semantic Analysis WebSocket disconnected');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewState.realTimeProcessing]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'analysis_completed':
        setAnalyzerState(prev => ({
          ...prev,
          analyses: [...prev.analyses, data.analysis],
          totalAnalyses: prev.totalAnalyses + 1,
          successfulAnalyses: data.analysis.status === 'completed' ? prev.successfulAnalyses + 1 : prev.successfulAnalyses
        }));
        if (onAnalysisCompleted) onAnalysisCompleted(data.analysis);
        break;
      case 'suggestion_generated':
        setAnalyzerState(prev => ({
          ...prev,
          suggestions: [...prev.suggestions, data.suggestion],
          suggestionsGenerated: prev.suggestionsGenerated + 1
        }));
        if (onSuggestionGenerated) onSuggestionGenerated(data.suggestion);
        break;
      case 'pattern_detected':
        setAnalyzerState(prev => ({
          ...prev,
          patterns: [...prev.patterns, data.pattern],
          patternsDetected: prev.patternsDetected + 1
        }));
        break;
      case 'complexity_detected':
        if (onComplexityDetected) onComplexityDetected(data.complexity);
        break;
      case 'concept_extracted':
        setAnalyzerState(prev => ({
          ...prev,
          conceptsExtracted: prev.conceptsExtracted + 1
        }));
        break;
      case 'metrics_updated':
        setAnalyzerState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [onAnalysisCompleted, onSuggestionGenerated, onComplexityDetected]);

  // Auto-analysis for new rules
  useEffect(() => {
    if (viewState.autoAnalysis) {
      analysisIntervalRef.current = setInterval(() => {
        checkForNewRules();
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [viewState.autoAnalysis]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setAnalyzerState(prev => ({ ...prev, loading: true, error: null }));

      const [analysesData, rulesData, patternsData, metricsData] = await Promise.all([
        intelligenceAPI.getSemanticAnalyses({ 
          type: viewState.analysisType !== 'all' ? viewState.analysisType : undefined,
          timeRange: viewState.selectedTimeRange
        }),
        scanRulesAPI.getRules({ includeMetadata: true }),
        intelligenceAPI.getSemanticPatterns(),
        intelligenceAPI.getAnalysisMetrics()
      ]);

      setAnalyzerState(prev => ({
        ...prev,
        analyses: analysesData.analyses,
        rules: rulesData.rules,
        patterns: patternsData.patterns,
        metrics: metricsData,
        totalAnalyses: analysesData.total,
        successfulAnalyses: analysesData.analyses.filter(a => a.status === 'completed').length,
        rulesCovered: rulesData.rules.filter(r => r.hasSemanticAnalysis).length,
        patternsDetected: patternsData.total,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate derived metrics
      const avgComplexity = analysesData.analyses.length > 0
        ? analysesData.analyses.reduce((sum, a) => sum + (a.complexity?.score || 0), 0) / analysesData.analyses.length
        : 0;

      const avgSemanticScore = analysesData.analyses.length > 0
        ? analysesData.analyses.reduce((sum, a) => sum + (a.semanticScore || 0), 0) / analysesData.analyses.length
        : 0;

      setAnalyzerState(prev => ({
        ...prev,
        averageComplexity: avgComplexity,
        semanticScore: avgSemanticScore
      }));

    } catch (error) {
      console.error('Failed to refresh semantic analysis data:', error);
      setAnalyzerState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.analysisType, viewState.selectedTimeRange]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Analysis Functions
  const checkForNewRules = useCallback(async () => {
    try {
      const newRules = await scanRulesAPI.getUnanalyzedRules();
      if (newRules.length > 0) {
        for (const rule of newRules) {
          await performSemanticAnalysis(rule);
        }
      }
    } catch (error) {
      console.error('Failed to check for new rules:', error);
    }
  }, []);

  const performSemanticAnalysis = useCallback(async (rule: ScanRule) => {
    try {
      const analysis = await intelligenceAPI.performSemanticAnalysis({
        ruleId: rule.id,
        ruleText: rule.pattern || rule.logic,
        analysisType: viewState.analysisType,
        languageModel: viewState.languageModel,
        options: {
          extractEntities: true,
          detectSentiment: true,
          analyzeComplexity: true,
          generateSuggestions: viewState.autoAnalysis,
          buildConceptMap: true,
          validateSemantics: true,
          confidenceThreshold: viewState.confidenceThreshold
        }
      });

      setAnalyzerState(prev => ({
        ...prev,
        analyses: [...prev.analyses, analysis],
        totalAnalyses: prev.totalAnalyses + 1,
        successfulAnalyses: prev.successfulAnalyses + 1
      }));

      if (onAnalysisCompleted) onAnalysisCompleted(analysis);
    } catch (error) {
      console.error('Failed to perform semantic analysis:', error);
    }
  }, [viewState.analysisType, viewState.languageModel, viewState.confidenceThreshold, viewState.autoAnalysis, onAnalysisCompleted]);

  const generateSemanticSuggestions = useCallback(async (ruleId: string) => {
    try {
      const suggestions = await intelligenceAPI.generateSemanticSuggestions({
        ruleId: ruleId,
        model: viewState.languageModel,
        maxSuggestions: 5,
        confidenceThreshold: viewState.confidenceThreshold
      });

      setAnalyzerState(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, ...suggestions],
        suggestionsGenerated: prev.suggestionsGenerated + suggestions.length
      }));

      suggestions.forEach(suggestion => {
        if (onSuggestionGenerated) onSuggestionGenerated(suggestion);
      });
    } catch (error) {
      console.error('Failed to generate semantic suggestions:', error);
    }
  }, [viewState.languageModel, viewState.confidenceThreshold, onSuggestionGenerated]);

  const validateRuleSemantics = useCallback(async (rule: ScanRule) => {
    try {
      const validation = await intelligenceAPI.validateRuleSemantics({
        ruleId: rule.id,
        ruleText: rule.pattern || rule.logic,
        validationRules: ['syntax', 'semantics', 'logic', 'consistency']
      });

      return validation;
    } catch (error) {
      console.error('Failed to validate rule semantics:', error);
      return null;
    }
  }, []);

  const buildConceptMap = useCallback(async (ruleIds: string[]) => {
    try {
      const conceptMap = await intelligenceAPI.buildConceptMap({
        ruleIds: ruleIds,
        includeRelations: true,
        clusterConcepts: true,
        generateHierarchy: true
      });

      setAnalyzerState(prev => ({
        ...prev,
        conceptMaps: [...prev.conceptMaps, conceptMap],
        conceptsExtracted: conceptMap.concepts?.length || 0,
        relationsDiscovered: conceptMap.relations?.length || 0
      }));

      return conceptMap;
    } catch (error) {
      console.error('Failed to build concept map:', error);
      return null;
    }
  }, []);

  // Utility Functions
  const getComplexityColor = useCallback((complexity: string | number) => {
    if (typeof complexity === 'number') {
      if (complexity < 0.3) return 'text-green-600 bg-green-100';
      if (complexity < 0.6) return 'text-yellow-600 bg-yellow-100';
      if (complexity < 0.8) return 'text-orange-600 bg-orange-100';
      return 'text-red-600 bg-red-100';
    }
    
    const level = COMPLEXITY_LEVELS.find(l => l.value === complexity);
    return level ? level.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getSemanticScoreColor = useCallback((score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  const getAnalysisStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  // Filter and Search Functions
  const filteredAnalyses = useMemo(() => {
    let filtered = analyzerState.analyses;

    if (viewState.searchQuery) {
      filtered = filtered.filter(analysis => 
        analysis.ruleName?.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        analysis.insights?.some(insight => 
          insight.toLowerCase().includes(viewState.searchQuery.toLowerCase())
        )
      );
    }

    if (viewState.filterComplexity !== 'all') {
      filtered = filtered.filter(analysis => analysis.complexity?.level === viewState.filterComplexity);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'semantic_score':
          aValue = a.semanticScore || 0;
          bValue = b.semanticScore || 0;
          break;
        case 'complexity':
          aValue = a.complexity?.score || 0;
          bValue = b.complexity?.score || 0;
          break;
        case 'confidence':
          aValue = a.confidence || 0;
          bValue = b.confidence || 0;
          break;
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        default:
          aValue = a.semanticScore || 0;
          bValue = b.semanticScore || 0;
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [analyzerState.analyses, viewState.searchQuery, viewState.filterComplexity, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Analysis Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzerState.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              {analyzerState.successfulAnalyses} successful
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semantic Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSemanticScoreColor(analyzerState.semanticScore)}`}>
              {(analyzerState.semanticScore * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              average quality
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rules Covered</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzerState.rulesCovered}</div>
            <p className="text-xs text-muted-foreground">
              of {analyzerState.rules.length} total rules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patterns Detected</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzerState.patternsDetected}</div>
            <p className="text-xs text-muted-foreground">
              semantic patterns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Complexity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Complexity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {COMPLEXITY_LEVELS.map(level => {
              const count = analyzerState.analyses.filter(a => a.complexity?.level === level.value).length;
              const percentage = analyzerState.analyses.length > 0 
                ? (count / analyzerState.analyses.length) * 100 
                : 0;
              
              return (
                <div key={level.value} className="text-center">
                  <div className={`text-2xl font-bold ${level.color.split(' ')[0]}`}>
                    {count}
                  </div>
                  <div className="text-sm text-gray-500">{level.label}</div>
                  <Progress value={percentage} className="mt-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAnalyses.slice(0, 5).map(analysis => (
              <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getAnalysisStatusIcon(analysis.status)}
                  <div>
                    <div className="font-medium">{analysis.ruleName || 'Unknown Rule'}</div>
                    <div className="text-sm text-gray-500">
                      {analysis.analysisType} analysis
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getSemanticScoreColor(analysis.semanticScore || 0)}`}>
                    Score: {((analysis.semanticScore || 0) * 100).toFixed(1)}%
                  </div>
                  <Badge className={getComplexityColor(analysis.complexity?.level || 'low')}>
                    {analysis.complexity?.level || 'low'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recent Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {analyzerState.suggestions.slice(0, 10).map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-2 text-sm border-l-2 border-l-blue-300">
                  <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-gray-500">{suggestion.description}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(suggestion.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* Analysis Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Semantic Analysis</h2>
          <p className="text-gray-600">Analyze rule semantics and generate insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnalysisDialogOpen(true)}
          >
            <Brain className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search analyses..."
              value={viewState.searchQuery}
              onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={viewState.filterComplexity}
          onValueChange={(value) => setViewState(prev => ({ ...prev, filterComplexity: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Complexity</SelectItem>
            {COMPLEXITY_LEVELS.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={viewState.sortBy}
          onValueChange={(value) => setViewState(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semantic_score">Semantic Score</SelectItem>
            <SelectItem value="complexity">Complexity</SelectItem>
            <SelectItem value="confidence">Confidence</SelectItem>
            <SelectItem value="timestamp">Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analyses Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Semantic Score</TableHead>
              <TableHead>Complexity</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnalyses.map(analysis => (
              <TableRow key={analysis.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{analysis.ruleName || 'Unknown Rule'}</div>
                    <div className="text-sm text-gray-500">{analysis.ruleId}</div>
                  </div>
                </TableCell>
                <TableCell>{analysis.analysisType}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getAnalysisStatusIcon(analysis.status)}
                    <span>{analysis.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={getSemanticScoreColor(analysis.semanticScore || 0)}>
                    {((analysis.semanticScore || 0) * 100).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getComplexityColor(analysis.complexity?.level || 'low')}>
                    {analysis.complexity?.level || 'low'}
                  </Badge>
                </TableCell>
                <TableCell>{((analysis.confidence || 0) * 100).toFixed(1)}%</TableCell>
                <TableCell>{new Date(analysis.timestamp).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewState(prev => ({ ...prev, selectedAnalysis: analysis }));
                              // Open analysis details
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Details</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateSemanticSuggestions(analysis.ruleId)}
                          >
                            <Lightbulb className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Generate Suggestions</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
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
                <Brain className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Semantic Rule Analyzer</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  analyzerState.semanticScore > 0.8 ? 'bg-green-500' :
                  analyzerState.semanticScore > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  Avg Score: {(analyzerState.semanticScore * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.languageModel}
                onValueChange={(value) => setViewState(prev => ({ ...prev, languageModel: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_MODELS.map(model => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={analyzerState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${analyzerState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Switch
                checked={viewState.autoAnalysis}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, autoAnalysis: checked }))}
              />
              <span className="text-sm text-gray-600">Auto-analyze</span>
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
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="patterns" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Patterns
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="concepts" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Concepts
                </TabsTrigger>
                <TabsTrigger value="validation" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Validation
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="analysis">
                {renderAnalysis()}
              </TabsContent>
              <TabsContent value="patterns">
                <div>Semantic Pattern Analysis (To be implemented)</div>
              </TabsContent>
              <TabsContent value="suggestions">
                <div>Semantic Suggestions Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="concepts">
                <div>Concept Mapping and Ontology (To be implemented)</div>
              </TabsContent>
              <TabsContent value="validation">
                <div>Semantic Validation Tools (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Analysis Dialog */}
        <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Perform Semantic Analysis</DialogTitle>
              <DialogDescription>
                Analyze rule semantics and generate insights
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="analysis-rule">Select Rule</Label>
                <Select 
                  value={analysisForm.ruleId}
                  onValueChange={(value) => setAnalysisForm(prev => ({ ...prev, ruleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rule to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyzerState.rules.map(rule => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="analysis-type">Analysis Type</Label>
                <Select 
                  value={analysisForm.analysisType}
                  onValueChange={(value) => setAnalysisForm(prev => ({ ...prev, analysisType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAnalysisDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const rule = analyzerState.rules.find(r => r.id === analysisForm.ruleId);
                    if (rule) {
                      performSemanticAnalysis(rule);
                      setAnalysisDialogOpen(false);
                    }
                  }}
                  disabled={!analysisForm.ruleId}
                >
                  Start Analysis
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default SemanticRuleAnalyzer;