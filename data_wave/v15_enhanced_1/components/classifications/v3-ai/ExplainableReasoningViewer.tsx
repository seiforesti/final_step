import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  ScrollArea,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Slider,
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
  Sankey,
  TreeMap,
  ScatterChart,
  Scatter,
  ComposedChart,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import {
  Brain,
  Lightbulb,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Copy,
  Save,
  RefreshCw,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Target,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Network,
  Cpu,
  Database,
  Server,
  Cloud,
  Globe,
  Lock,
  Unlock,
  Shield,
  Key,
  User,
  Users,
  Calendar,
  Clock,
  MapPin,
  Flag,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  MessageCircle,
  Mail,
  Phone,
  Link,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Edit,
  Trash2,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Table,
  Layers,
  GitBranch,
  TreePine,
  Workflow,
  FlowChart,
} from 'lucide-react';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { aiApi } from '../core/api/aiApi';
import { websocketApi } from '../core/api/websocketApi';
import type {
  ReasoningChain,
  ExplanationModel,
  DecisionNode,
  FeatureImportance,
  ExplainabilityMetrics,
  ReasoningStep,
  CausalRelationship,
  CounterfactualAnalysis,
  SHAPValues,
  LIMEExplanation,
  AttentionWeights,
  ActivationMap,
  ConceptActivation,
  LayerWiseRelevance,
  GradientBasedExplanation,
  IntegratedGradients,
  ExplanationAudit,
  TrustScore,
  UncertaintyQuantification,
  BiasDetection,
  FairnessMetrics,
  RobustnessAnalysis,
  AdversarialExample,
  ExplanationTemplate,
  ReasoningContext,
  CognitiveProcess,
  KnowledgeGraph,
  InferenceTrace,
  LogicalReasoning,
  ProbabilisticReasoning,
  CausalInference,
  AbductiveReasoning,
  DeductiveReasoning,
  InductiveReasoning,
  AnalogicalReasoning,
  MetaReasoning,
  ExplanationQuality,
  HumanInterpretability,
  CognitiveLoad,
  ExplanationPersonalization,
} from '../core/types';

// Enhanced reasoning and explainability types
interface ReasoningVisualization {
  id: string;
  type: 'decision_tree' | 'reasoning_chain' | 'feature_importance' | 'attention_map' | 'causal_graph' | 'counterfactual' | 'concept_activation';
  title: string;
  description: string;
  data: any;
  config: VisualizationConfig;
  interactivity: InteractivityConfig;
  annotations: Annotation[];
  metadata: VisualizationMetadata;
  performance: VisualizationPerformance;
}

interface VisualizationConfig {
  layout: 'hierarchical' | 'force_directed' | 'circular' | 'matrix' | 'timeline' | 'spatial';
  colorScheme: 'categorical' | 'sequential' | 'diverging' | 'custom';
  animations: AnimationConfig;
  interactions: InteractionConfig;
  responsive: ResponsiveConfig;
  accessibility: AccessibilityConfig;
}

interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  stagger: number;
  entrance: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce';
  transition: 'morph' | 'crossfade' | 'wipe' | 'zoom';
}

interface InteractionConfig {
  hover: HoverConfig;
  click: ClickConfig;
  drag: DragConfig;
  zoom: ZoomConfig;
  selection: SelectionConfig;
  brushing: BrushingConfig;
}

interface HoverConfig {
  enabled: boolean;
  tooltip: TooltipConfig;
  highlight: HighlightConfig;
  preview: PreviewConfig;
}

interface ExplanationDashboard {
  id: string;
  name: string;
  description: string;
  widgets: ExplanationWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  timeRange: TimeRange;
  refreshRate: number;
  permissions: string[];
  personalization: PersonalizationSettings;
}

interface ExplanationWidget {
  id: string;
  type: 'reasoning_chain' | 'feature_importance' | 'decision_boundary' | 'counterfactual' | 'bias_analysis' | 'uncertainty' | 'trust_score';
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  data: any;
  interactions: WidgetInteraction[];
  dependencies: string[];
}

interface ReasoningChainVisualization {
  nodes: ReasoningNode[];
  edges: ReasoningEdge[];
  clusters: ReasoningCluster[];
  pathways: ReasoningPathway[];
  annotations: ChainAnnotation[];
  metadata: ChainMetadata;
}

interface ReasoningNode {
  id: string;
  type: 'premise' | 'inference' | 'conclusion' | 'evidence' | 'assumption' | 'contradiction';
  content: string;
  confidence: number;
  importance: number;
  position: NodePosition;
  style: NodeStyle;
  properties: NodeProperties;
  connections: NodeConnection[];
}

interface ReasoningEdge {
  id: string;
  source: string;
  target: string;
  type: 'supports' | 'contradicts' | 'implies' | 'requires' | 'influences' | 'correlates';
  strength: number;
  confidence: number;
  style: EdgeStyle;
  properties: EdgeProperties;
  annotations: EdgeAnnotation[];
}

interface FeatureImportanceAnalysis {
  global: GlobalImportance[];
  local: LocalImportance[];
  temporal: TemporalImportance[];
  conditional: ConditionalImportance[];
  interactive: InteractiveImportance[];
  hierarchical: HierarchicalImportance[];
  contextual: ContextualImportance[];
}

interface GlobalImportance {
  feature: string;
  importance: number;
  rank: number;
  confidence: number;
  stability: number;
  interpretation: string;
  category: string;
  dataType: string;
  distribution: number[];
}

interface LocalImportance {
  instanceId: string;
  features: FeatureContribution[];
  baseline: number;
  prediction: number;
  explanation: string;
  confidence: number;
  alternatives: AlternativeExplanation[];
}

interface FeatureContribution {
  feature: string;
  value: any;
  contribution: number;
  direction: 'positive' | 'negative';
  magnitude: number;
  rank: number;
  interpretation: string;
  uncertainty: number;
}

interface DecisionBoundaryVisualization {
  dimensions: DimensionConfig[];
  boundaries: BoundarySegment[];
  regions: DecisionRegion[];
  samples: DataPoint[];
  uncertainty: UncertaintyRegion[];
  interactions: BoundaryInteraction[];
}

interface CounterfactualExplanation {
  original: DataInstance;
  counterfactuals: CounterfactualInstance[];
  changes: FeatureChange[];
  pathways: CounterfactualPathway[];
  constraints: CounterfactualConstraint[];
  plausibility: PlausibilityScore;
  diversity: DiversityMetrics;
}

interface CounterfactualInstance {
  id: string;
  features: Record<string, any>;
  prediction: any;
  distance: number;
  plausibility: number;
  actionability: number;
  explanation: string;
  pathway: ChangePathway[];
}

interface BiasAnalysis {
  fairnessMetrics: FairnessMetric[];
  demographicParity: DemographicParityAnalysis;
  equalizedOdds: EqualizedOddsAnalysis;
  calibration: CalibrationAnalysis;
  individualFairness: IndividualFairnessAnalysis;
  intersectionalBias: IntersectionalBiasAnalysis;
  temporalBias: TemporalBiasAnalysis;
  recommendations: BiasRecommendation[];
}

interface UncertaintyVisualization {
  epistemic: EpistemicUncertainty;
  aleatoric: AleatoricUncertainty;
  model: ModelUncertainty;
  prediction: PredictionUncertainty;
  calibration: UncertaintyCalibration;
  decomposition: UncertaintyDecomposition;
  propagation: UncertaintyPropagation;
}

interface TrustScoreAnalysis {
  overall: TrustMetrics;
  components: TrustComponent[];
  factors: TrustFactor[];
  evolution: TrustEvolution[];
  benchmarks: TrustBenchmark[];
  recommendations: TrustRecommendation[];
}

// Constants and configuration
const REASONING_TYPES = [
  { id: 'deductive', name: 'Deductive Reasoning', icon: ArrowDown, color: '#3b82f6' },
  { id: 'inductive', name: 'Inductive Reasoning', icon: ArrowUp, color: '#10b981' },
  { id: 'abductive', name: 'Abductive Reasoning', icon: Lightbulb, color: '#f59e0b' },
  { id: 'analogical', name: 'Analogical Reasoning', icon: GitBranch, color: '#8b5cf6' },
  { id: 'causal', name: 'Causal Reasoning', icon: Network, color: '#ef4444' },
  { id: 'probabilistic', name: 'Probabilistic Reasoning', icon: BarChart3, color: '#06b6d4' },
];

const EXPLANATION_METHODS = [
  { id: 'shap', name: 'SHAP Values', description: 'SHapley Additive exPlanations' },
  { id: 'lime', name: 'LIME', description: 'Local Interpretable Model-agnostic Explanations' },
  { id: 'grad_cam', name: 'Grad-CAM', description: 'Gradient-weighted Class Activation Mapping' },
  { id: 'integrated_gradients', name: 'Integrated Gradients', description: 'Attribution method for deep networks' },
  { id: 'attention', name: 'Attention Weights', description: 'Attention mechanism visualization' },
  { id: 'layer_wise', name: 'Layer-wise Relevance', description: 'LRP propagation method' },
];

const VISUALIZATION_LAYOUTS = [
  { id: 'hierarchical', name: 'Hierarchical', icon: TreePine },
  { id: 'force_directed', name: 'Force Directed', icon: Network },
  { id: 'circular', name: 'Circular', icon: Target },
  { id: 'matrix', name: 'Matrix', icon: Grid },
  { id: 'timeline', name: 'Timeline', icon: Clock },
  { id: 'spatial', name: 'Spatial', icon: MapPin },
];

const COLOR_SCHEMES = [
  { id: 'categorical', name: 'Categorical', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] },
  { id: 'sequential', name: 'Sequential', colors: ['#f0f9ff', '#0369a1'] },
  { id: 'diverging', name: 'Diverging', colors: ['#ef4444', '#ffffff', '#3b82f6'] },
  { id: 'custom', name: 'Custom', colors: [] },
];

const ExplainableReasoningViewer: React.FC = () => {
  // State management
  const {
    aiModels,
    explanations,
    reasoningChains,
    isLoading,
    error,
    generateExplanation,
    analyzeReasoning,
    updateExplanationSettings,
  } = useClassificationState();

  const {
    explainabilityMethods,
    reasoningEngines,
    interpretabilityMetrics,
    generateCounterfactuals,
    analyzeBias,
    calculateTrustScore,
    visualizeDecisionBoundary,
  } = useAIIntelligence();

  const [activeTab, setActiveTab] = useState('reasoning');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [explanationMethod, setExplanationMethod] = useState('shap');
  const [visualizationLayout, setVisualizationLayout] = useState('hierarchical');
  const [colorScheme, setColorScheme] = useState('categorical');
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showUncertainty, setShowUncertainty] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [detailLevel, setDetailLevel] = useState(2); // 0: basic, 1: intermediate, 2: advanced, 3: expert
  const [personalizationMode, setPersonalizationMode] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  const [reasoningData, setReasoningData] = useState<ReasoningChainVisualization | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceAnalysis | null>(null);
  const [counterfactuals, setCounterfactuals] = useState<CounterfactualExplanation | null>(null);
  const [biasAnalysis, setBiasAnalysis] = useState<BiasAnalysis | null>(null);
  const [uncertaintyData, setUncertaintyData] = useState<UncertaintyVisualization | null>(null);
  const [trustScore, setTrustScore] = useState<TrustScoreAnalysis | null>(null);
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonItems, setComparisonItems] = useState<string[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparative' | 'interactive'>('overview');
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  
  // Refs for visualization containers
  const reasoningVisualizationRef = useRef<HTMLDivElement>(null);
  const featureVisualizationRef = useRef<HTMLDivElement>(null);
  const decisionBoundaryRef = useRef<HTMLDivElement>(null);
  const counterfactualRef = useRef<HTMLDivElement>(null);

  // Load initial data and establish real-time connections
  useEffect(() => {
    loadExplanationData();
    initializeRealTimeConnections();
    
    if (realTimeUpdates) {
      const updateInterval = setInterval(() => {
        refreshExplanations();
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(updateInterval);
    }
  }, [selectedModel, selectedInstance, explanationMethod, realTimeUpdates]);

  const loadExplanationData = useCallback(async () => {
    if (!selectedModel || !selectedInstance) return;

    try {
      const [
        reasoningResponse,
        importanceResponse,
        counterfactualResponse,
        biasResponse,
        uncertaintyResponse,
        trustResponse
      ] = await Promise.all([
        aiApi.generateReasoningChain({
          modelId: selectedModel,
          instanceId: selectedInstance,
          method: explanationMethod,
          detailLevel,
        }),
        aiApi.analyzeFeatureImportance({
          modelId: selectedModel,
          instanceId: selectedInstance,
          method: explanationMethod,
        }),
        generateCounterfactuals({
          modelId: selectedModel,
          instanceId: selectedInstance,
          constraints: filterCriteria,
        }),
        analyzeBias({
          modelId: selectedModel,
          instanceId: selectedInstance,
        }),
        aiApi.quantifyUncertainty({
          modelId: selectedModel,
          instanceId: selectedInstance,
        }),
        calculateTrustScore({
          modelId: selectedModel,
          instanceId: selectedInstance,
        }),
      ]);

      setReasoningData(reasoningResponse.data);
      setFeatureImportance(importanceResponse.data);
      setCounterfactuals(counterfactualResponse);
      setBiasAnalysis(biasResponse);
      setUncertaintyData(uncertaintyResponse.data);
      setTrustScore(trustResponse);
    } catch (error) {
      console.error('Error loading explanation data:', error);
    }
  }, [selectedModel, selectedInstance, explanationMethod, detailLevel, filterCriteria, generateCounterfactuals, analyzeBias, calculateTrustScore]);

  const initializeRealTimeConnections = useCallback(async () => {
    if (realTimeUpdates) {
      try {
        await websocketApi.connect('explainability');
        
        websocketApi.subscribe('reasoning_update', (data) => {
          setReasoningData(prev => prev ? { ...prev, ...data } : data);
        });

        websocketApi.subscribe('explanation_generated', (data) => {
          if (data.modelId === selectedModel && data.instanceId === selectedInstance) {
            loadExplanationData();
          }
        });

        websocketApi.subscribe('bias_detected', (data) => {
          setBiasAnalysis(prev => prev ? { ...prev, ...data } : data);
        });

        websocketApi.subscribe('trust_score_updated', (data) => {
          setTrustScore(prev => prev ? { ...prev, ...data } : data);
        });
      } catch (error) {
        console.error('Error initializing real-time connections:', error);
      }
    }
  }, [realTimeUpdates, selectedModel, selectedInstance, loadExplanationData]);

  const refreshExplanations = useCallback(async () => {
    await loadExplanationData();
  }, [loadExplanationData]);

  // Event handlers
  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    setSelectedInstance(''); // Reset instance when model changes
  }, []);

  const handleInstanceChange = useCallback((instanceId: string) => {
    setSelectedInstance(instanceId);
  }, []);

  const handleExplanationMethodChange = useCallback((method: string) => {
    setExplanationMethod(method);
  }, []);

  const handleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    
    // Load detailed information for the selected node
    if (reasoningData) {
      const node = reasoningData.nodes.find(n => n.id === nodeId);
      if (node) {
        // Trigger detailed analysis for this node
        analyzeReasoningNode(node);
      }
    }
  }, [reasoningData]);

  const analyzeReasoningNode = useCallback(async (node: ReasoningNode) => {
    try {
      const analysis = await aiApi.analyzeReasoningNode({
        nodeId: node.id,
        modelId: selectedModel,
        instanceId: selectedInstance,
        context: reasoningData,
      });
      
      // Update the node with detailed analysis
      setReasoningData(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          nodes: prev.nodes.map(n => 
            n.id === node.id ? { ...n, ...analysis.data } : n
          ),
        };
      });
    } catch (error) {
      console.error('Error analyzing reasoning node:', error);
    }
  }, [selectedModel, selectedInstance, reasoningData]);

  const handleFeatureSelection = useCallback((feature: string) => {
    setSelectedFeature(feature);
    
    // Load detailed feature analysis
    if (featureImportance) {
      analyzeFeatureDetails(feature);
    }
  }, [featureImportance]);

  const analyzeFeatureDetails = useCallback(async (feature: string) => {
    try {
      const analysis = await aiApi.analyzeFeatureDetails({
        feature,
        modelId: selectedModel,
        instanceId: selectedInstance,
        method: explanationMethod,
      });
      
      // Update feature importance with detailed analysis
      setFeatureImportance(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          global: prev.global.map(f => 
            f.feature === feature ? { ...f, ...analysis.data } : f
          ),
        };
      });
    } catch (error) {
      console.error('Error analyzing feature details:', error);
    }
  }, [selectedModel, selectedInstance, explanationMethod]);

  const handleGenerateCounterfactuals = useCallback(async () => {
    if (!selectedModel || !selectedInstance) return;

    try {
      const counterfactualData = await generateCounterfactuals({
        modelId: selectedModel,
        instanceId: selectedInstance,
        constraints: filterCriteria,
        diversity: true,
        plausibility: true,
      });
      
      setCounterfactuals(counterfactualData);
    } catch (error) {
      console.error('Error generating counterfactuals:', error);
    }
  }, [selectedModel, selectedInstance, filterCriteria, generateCounterfactuals]);

  const handleExportExplanation = useCallback(async (format: 'pdf' | 'json' | 'html' | 'interactive') => {
    try {
      const exportData = {
        model: selectedModel,
        instance: selectedInstance,
        method: explanationMethod,
        reasoning: reasoningData,
        featureImportance,
        counterfactuals,
        biasAnalysis,
        uncertainty: uncertaintyData,
        trustScore,
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          settings: {
            detailLevel,
            visualizationLayout,
            colorScheme,
          },
        },
      };

      const response = await aiApi.exportExplanation({
        data: exportData,
        format,
        options: {
          includeInteractive: format === 'interactive',
          includeRawData: format === 'json',
          includeVisualizations: format !== 'json',
        },
      });

      // Trigger download
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'json' ? 'application/json' : 
              'text/html' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `explanation_${selectedModel}_${selectedInstance}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting explanation:', error);
    }
  }, [selectedModel, selectedInstance, explanationMethod, reasoningData, featureImportance, counterfactuals, biasAnalysis, uncertaintyData, trustScore, detailLevel, visualizationLayout, colorScheme]);

  // Visualization components
  const ReasoningChainVisualization = useCallback(() => {
    if (!reasoningData) return null;

    return (
      <div className="space-y-6">
        {/* Reasoning Chain Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Reasoning Chain Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Interactive visualization of AI reasoning process with {reasoningData.nodes.length} reasoning steps
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={visualizationLayout} onValueChange={setVisualizationLayout}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISUALIZATION_LAYOUTS.map(layout => (
                  <SelectItem key={layout.id} value={layout.id}>
                    <div className="flex items-center gap-2">
                      <layout.icon className="h-4 w-4" />
                      {layout.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Reasoning Chain Visualization */}
        <Card>
          <CardContent className="p-6">
            <div 
              ref={reasoningVisualizationRef}
              className="relative w-full h-[600px] border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
            >
              {/* Interactive reasoning chain would be rendered here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <p className="text-lg font-medium">Interactive Reasoning Chain</p>
                  <p className="text-sm text-muted-foreground">
                    Advanced visualization rendering in progress...
                  </p>
                </div>
              </div>
              
              {/* Overlay controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Reasoning Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reasoningData.nodes.length}</div>
                <div className="text-sm text-muted-foreground">Reasoning Steps</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reasoningData.edges.length}</div>
                <div className="text-sm text-muted-foreground">Logical Connections</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{reasoningData.clusters.length}</div>
                <div className="text-sm text-muted-foreground">Concept Clusters</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(reasoningData.nodes.reduce((acc, node) => acc + node.confidence, 0) / reasoningData.nodes.length * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Node Details */}
        {selectedNode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Reasoning Step Details
              </CardTitle>
              <CardDescription>
                Detailed analysis of the selected reasoning step
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const node = reasoningData.nodes.find(n => n.id === selectedNode);
                if (!node) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <Badge className="mt-1">{node.type}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Confidence</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress value={node.confidence * 100} className="flex-1" />
                          <span className="text-sm">{Math.round(node.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Content</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        {node.content}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Importance Score</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={node.importance * 100} className="flex-1" />
                        <span className="text-sm">{Math.round(node.importance * 100)}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Connected Steps</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {node.connections.map(conn => (
                          <Badge key={conn.nodeId} variant="outline" className="cursor-pointer">
                            {reasoningData.nodes.find(n => n.id === conn.nodeId)?.type || conn.nodeId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }, [reasoningData, selectedNode, visualizationLayout]);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-amber-600" />
              Explainable Reasoning Viewer
            </h1>
            <p className="text-muted-foreground mt-2">
              Advanced AI explainability with interactive reasoning visualization, feature importance analysis, and bias detection
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
              className={realTimeUpdates ? 'bg-green-50 border-green-200' : ''}
            >
              {realTimeUpdates ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              Real-time
            </Button>
            <Button variant="outline" onClick={() => setShowHelpDialog(true)}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={refreshExplanations} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Explanation Configuration
            </CardTitle>
            <CardDescription>
              Configure the AI model, instance, and explanation method for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="model-select">AI Model</Label>
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger id="model-select">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="instance-select">Data Instance</Label>
                <Select value={selectedInstance} onValueChange={handleInstanceChange}>
                  <SelectTrigger id="instance-select">
                    <SelectValue placeholder="Select instance" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Instance options would be populated based on selected model */}
                    <SelectItem value="instance_1">Instance 1</SelectItem>
                    <SelectItem value="instance_2">Instance 2</SelectItem>
                    <SelectItem value="instance_3">Instance 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="method-select">Explanation Method</Label>
                <Select value={explanationMethod} onValueChange={handleExplanationMethodChange}>
                  <SelectTrigger id="method-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPLANATION_METHODS.map(method => (
                      <SelectItem key={method.id} value={method.id}>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-xs text-muted-foreground">{method.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="detail-level">Detail Level</Label>
                <div className="mt-2">
                  <Slider
                    id="detail-level"
                    min={0}
                    max={3}
                    step={1}
                    value={[detailLevel]}
                    onValueChange={(value) => setDetailLevel(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Basic</span>
                    <span>Expert</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="interactive-mode"
                  checked={interactiveMode}
                  onCheckedChange={setInteractiveMode}
                />
                <Label htmlFor="interactive-mode">Interactive Mode</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-annotations"
                  checked={showAnnotations}
                  onCheckedChange={setShowAnnotations}
                />
                <Label htmlFor="show-annotations">Show Annotations</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-uncertainty"
                  checked={showUncertainty}
                  onCheckedChange={setShowUncertainty}
                />
                <Label htmlFor="show-uncertainty">Show Uncertainty</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="animations-enabled"
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
                <Label htmlFor="animations-enabled">Animations</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="reasoning">Reasoning Chain</TabsTrigger>
            <TabsTrigger value="features">Feature Importance</TabsTrigger>
            <TabsTrigger value="counterfactuals">Counterfactuals</TabsTrigger>
            <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
            <TabsTrigger value="uncertainty">Uncertainty</TabsTrigger>
            <TabsTrigger value="trust">Trust Score</TabsTrigger>
          </TabsList>

          {/* Reasoning Chain Tab */}
          <TabsContent value="reasoning">
            <ReasoningChainVisualization />
          </TabsContent>

          {/* Feature Importance Tab */}
          <TabsContent value="features">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Feature Importance Analysis
                  </CardTitle>
                  <CardDescription>
                    Global and local feature importance with interactive exploration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {featureImportance ? (
                    <div className="space-y-6">
                      {/* Global Feature Importance Chart */}
                      <div>
                        <h4 className="text-lg font-medium mb-4">Global Feature Importance</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={featureImportance.global.slice(0, 20)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="feature" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar 
                              dataKey="importance" 
                              fill="#3b82f6"
                              onClick={(data) => handleFeatureSelection(data.feature)}
                              style={{ cursor: 'pointer' }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Feature Details */}
                      {selectedFeature && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Feature: {selectedFeature}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {(() => {
                              const feature = featureImportance.global.find(f => f.feature === selectedFeature);
                              if (!feature) return null;
                              
                              return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Importance Score</Label>
                                    <Progress value={feature.importance * 100} className="mt-1" />
                                    <span className="text-sm text-muted-foreground">
                                      {Math.round(feature.importance * 100)}% (Rank #{feature.rank})
                                    </span>
                                  </div>
                                  <div>
                                    <Label>Confidence</Label>
                                    <Progress value={feature.confidence * 100} className="mt-1" />
                                    <span className="text-sm text-muted-foreground">
                                      {Math.round(feature.confidence * 100)}%
                                    </span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <Label>Interpretation</Label>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {feature.interpretation}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>Select a model and instance to view feature importance</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs would continue with similar implementations... */}
          <TabsContent value="counterfactuals">
            <Card>
              <CardHeader>
                <CardTitle>Counterfactual Analysis</CardTitle>
                <CardDescription>Explore what-if scenarios and alternative outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Counterfactual analysis interface would be implemented here</p>
                  <Button className="mt-4" onClick={handleGenerateCounterfactuals}>
                    Generate Counterfactuals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bias">
            <Card>
              <CardHeader>
                <CardTitle>Bias Analysis</CardTitle>
                <CardDescription>Fairness metrics and bias detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Bias analysis interface would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uncertainty">
            <Card>
              <CardHeader>
                <CardTitle>Uncertainty Quantification</CardTitle>
                <CardDescription>Model uncertainty and prediction confidence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Uncertainty analysis interface would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trust">
            <Card>
              <CardHeader>
                <CardTitle>Trust Score Analysis</CardTitle>
                <CardDescription>Model trustworthiness and reliability metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Trust score analysis interface would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default ExplainableReasoningViewer;