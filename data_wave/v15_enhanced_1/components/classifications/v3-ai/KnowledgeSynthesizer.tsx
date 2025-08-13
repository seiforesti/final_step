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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ScrollArea,
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
} from 'recharts';
import {
  Brain,
  Network,
  Lightbulb,
  BookOpen,
  Search,
  Filter,
  Settings,
  Play,
  Pause,
  Stop,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Copy,
  Save,
  Eye,
  EyeOff,
  TrendingUp,
  BarChart3,
  Target,
  Award,
  Clock,
  Users,
  Globe,
  MapPin,
  Calendar,
  Flag,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Layers,
  Grid,
  List,
  Table,
  Plus,
  Minus,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  GitBranch,
  TreePine,
  Workflow,
  FlowChart,
  Database,
  Server,
  Cloud,
  Monitor,
  Cpu,
  Activity,
  Zap,
  Shield,
  Lock,
  Key,
  Link,
  ExternalLink,
  Compass,
  Route,
  Radar,
} from 'lucide-react';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { aiApi } from '../core/api/aiApi';
import { websocketApi } from '../core/api/websocketApi';

// Enhanced knowledge synthesis types
interface KnowledgeSynthesizerState {
  knowledgeBase: KnowledgeEntry[];
  synthesisTasks: SynthesisTask[];
  insights: KnowledgeInsight[];
  patterns: KnowledgePattern[];
  connections: KnowledgeConnection[];
  domains: KnowledgeDomain[];
  ontologies: KnowledgeOntology[];
  graphs: KnowledgeGraph[];
  analytics: KnowledgeAnalytics;
  synthesis: SynthesisEngine;
  reasoning: ReasoningEngine;
  discovery: DiscoveryEngine;
  integration: IntegrationEngine;
  validation: ValidationEngine;
  quality: QualityMetrics;
  performance: PerformanceMetrics;
  collaboration: CollaborationData;
  automation: AutomationConfig;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'fact' | 'rule' | 'pattern' | 'insight' | 'hypothesis' | 'theory' | 'principle';
  domain: string;
  subdomain?: string;
  confidence: number;
  relevance: number;
  quality: number;
  source: KnowledgeSource;
  metadata: KnowledgeMetadata;
  relationships: KnowledgeRelationship[];
  tags: string[];
  categories: string[];
  embeddings: number[];
  validation: ValidationStatus;
  provenance: ProvenanceData;
  lifecycle: LifecycleData;
  usage: UsageMetrics;
  feedback: FeedbackData[];
  annotations: AnnotationData[];
  citations: CitationData[];
  versions: VersionData[];
}

interface SynthesisTask {
  id: string;
  name: string;
  description: string;
  type: 'cross_domain' | 'pattern_discovery' | 'insight_generation' | 'hypothesis_formation' | 'theory_building' | 'knowledge_fusion';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  inputs: SynthesisInput[];
  outputs: SynthesisOutput[];
  configuration: SynthesisConfiguration;
  progress: number;
  metrics: SynthesisMetrics;
  results: SynthesisResult[];
  insights: GeneratedInsight[];
  patterns: DiscoveredPattern[];
  connections: NewConnection[];
  validation: SynthesisValidation;
  quality: SynthesisQuality;
  performance: SynthesisPerformance;
  timeline: SynthesisTimeline;
  resources: ResourceUsage;
  collaboration: TaskCollaboration;
}

interface KnowledgeInsight {
  id: string;
  title: string;
  description: string;
  type: 'correlation' | 'causation' | 'prediction' | 'classification' | 'anomaly' | 'trend' | 'pattern' | 'opportunity';
  confidence: number;
  impact: number;
  novelty: number;
  domains: string[];
  evidence: EvidenceData[];
  reasoning: ReasoningChain;
  implications: InsightImplication[];
  recommendations: InsightRecommendation[];
  validation: InsightValidation;
  applications: InsightApplication[];
  limitations: InsightLimitation[];
  metadata: InsightMetadata;
  lifecycle: InsightLifecycle;
  feedback: InsightFeedback[];
  citations: InsightCitation[];
  related: RelatedInsight[];
}

interface KnowledgePattern {
  id: string;
  name: string;
  description: string;
  type: 'structural' | 'behavioral' | 'temporal' | 'spatial' | 'semantic' | 'causal' | 'statistical' | 'logical';
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  frequency: number;
  strength: number;
  confidence: number;
  domains: string[];
  instances: PatternInstance[];
  variations: PatternVariation[];
  parameters: PatternParameter[];
  conditions: PatternCondition[];
  exceptions: PatternException[];
  evolution: PatternEvolution;
  applications: PatternApplication[];
  validation: PatternValidation;
  metadata: PatternMetadata;
  relationships: PatternRelationship[];
  predictions: PatternPrediction[];
}

interface KnowledgeConnection {
  id: string;
  source: string;
  target: string;
  type: 'similarity' | 'causality' | 'dependency' | 'correlation' | 'composition' | 'inheritance' | 'association' | 'implication';
  strength: number;
  confidence: number;
  direction: 'bidirectional' | 'source_to_target' | 'target_to_source';
  weight: number;
  context: ConnectionContext;
  evidence: ConnectionEvidence[];
  validation: ConnectionValidation;
  metadata: ConnectionMetadata;
  lifecycle: ConnectionLifecycle;
  quality: ConnectionQuality;
  applications: ConnectionApplication[];
  implications: ConnectionImplication[];
}

interface KnowledgeGraph {
  id: string;
  name: string;
  description: string;
  type: 'domain_specific' | 'cross_domain' | 'temporal' | 'hierarchical' | 'semantic' | 'causal' | 'probabilistic';
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
  metrics: GraphMetrics;
  layout: GraphLayout;
  visualization: GraphVisualization;
  analysis: GraphAnalysis;
  algorithms: GraphAlgorithm[];
  queries: GraphQuery[];
  transformations: GraphTransformation[];
  evolution: GraphEvolution;
  quality: GraphQuality;
  performance: GraphPerformance;
  applications: GraphApplication[];
  metadata: GraphMetadata;
}

interface SynthesisEngine {
  algorithms: SynthesisAlgorithm[];
  strategies: SynthesisStrategy[];
  pipelines: SynthesisPipeline[];
  models: SynthesisModel[];
  configuration: EngineConfiguration;
  performance: EnginePerformance;
  optimization: EngineOptimization;
  monitoring: EngineMonitoring;
  quality: EngineQuality;
  resources: EngineResources;
  scalability: EngineScalability;
  reliability: EngineReliability;
  security: EngineSecurity;
  compliance: EngineCompliance;
  analytics: EngineAnalytics;
}

// Constants for knowledge synthesis
const KNOWLEDGE_TYPES = [
  { id: 'concept', name: 'Concept', icon: Lightbulb, color: '#3B82F6', description: 'Abstract ideas and concepts' },
  { id: 'fact', name: 'Fact', icon: CheckCircle, color: '#10B981', description: 'Verified factual information' },
  { id: 'rule', name: 'Rule', icon: Shield, color: '#F59E0B', description: 'Logical rules and constraints' },
  { id: 'pattern', name: 'Pattern', icon: Target, color: '#EF4444', description: 'Identified patterns and trends' },
  { id: 'insight', name: 'Insight', icon: Brain, color: '#8B5CF6', description: 'Generated insights and discoveries' },
  { id: 'hypothesis', name: 'Hypothesis', icon: HelpCircle, color: '#EC4899', description: 'Proposed hypotheses' },
  { id: 'theory', name: 'Theory', icon: BookOpen, color: '#06B6D4', description: 'Theoretical frameworks' },
  { id: 'principle', name: 'Principle', icon: Star, color: '#84CC16', description: 'Fundamental principles' },
];

const SYNTHESIS_TYPES = [
  {
    id: 'cross_domain',
    name: 'Cross-Domain Synthesis',
    description: 'Synthesize knowledge across multiple domains',
    complexity: 'high',
    duration: 'long',
    accuracy: 0.85,
    novelty: 0.92,
  },
  {
    id: 'pattern_discovery',
    name: 'Pattern Discovery',
    description: 'Discover new patterns in existing knowledge',
    complexity: 'medium',
    duration: 'medium',
    accuracy: 0.91,
    novelty: 0.87,
  },
  {
    id: 'insight_generation',
    name: 'Insight Generation',
    description: 'Generate actionable insights from data',
    complexity: 'medium',
    duration: 'short',
    accuracy: 0.88,
    novelty: 0.84,
  },
  {
    id: 'hypothesis_formation',
    name: 'Hypothesis Formation',
    description: 'Form testable hypotheses from observations',
    complexity: 'high',
    duration: 'medium',
    accuracy: 0.82,
    novelty: 0.95,
  },
  {
    id: 'theory_building',
    name: 'Theory Building',
    description: 'Build comprehensive theoretical frameworks',
    complexity: 'very_high',
    duration: 'very_long',
    accuracy: 0.79,
    novelty: 0.98,
  },
  {
    id: 'knowledge_fusion',
    name: 'Knowledge Fusion',
    description: 'Fuse knowledge from multiple sources',
    complexity: 'high',
    duration: 'long',
    accuracy: 0.86,
    novelty: 0.89,
  },
];

const KNOWLEDGE_DOMAINS = [
  { id: 'technology', name: 'Technology', color: '#3B82F6', count: 1250 },
  { id: 'business', name: 'Business', color: '#10B981', count: 980 },
  { id: 'science', name: 'Science', color: '#F59E0B', count: 1420 },
  { id: 'healthcare', name: 'Healthcare', color: '#EF4444', count: 890 },
  { id: 'finance', name: 'Finance', color: '#8B5CF6', count: 760 },
  { id: 'education', name: 'Education', color: '#EC4899', count: 650 },
  { id: 'legal', name: 'Legal', color: '#06B6D4', count: 540 },
  { id: 'environment', name: 'Environment', color: '#84CC16', count: 720 },
];

const SYNTHESIS_ALGORITHMS = [
  {
    id: 'semantic_fusion',
    name: 'Semantic Fusion',
    type: 'knowledge_fusion',
    complexity: 'high',
    accuracy: 0.89,
    speed: 'medium',
    description: 'Advanced semantic knowledge fusion algorithm',
  },
  {
    id: 'pattern_mining',
    name: 'Deep Pattern Mining',
    type: 'pattern_discovery',
    complexity: 'medium',
    accuracy: 0.92,
    speed: 'fast',
    description: 'Deep learning-based pattern discovery',
  },
  {
    id: 'causal_inference',
    name: 'Causal Inference Engine',
    type: 'insight_generation',
    complexity: 'high',
    accuracy: 0.87,
    speed: 'slow',
    description: 'Advanced causal relationship inference',
  },
  {
    id: 'cross_domain_mapper',
    name: 'Cross-Domain Mapper',
    type: 'cross_domain',
    complexity: 'very_high',
    accuracy: 0.84,
    speed: 'very_slow',
    description: 'Cross-domain knowledge mapping and synthesis',
  },
  {
    id: 'hypothesis_generator',
    name: 'Hypothesis Generator',
    type: 'hypothesis_formation',
    complexity: 'high',
    accuracy: 0.81,
    speed: 'medium',
    description: 'AI-powered hypothesis generation system',
  },
];

const KnowledgeSynthesizer: React.FC = () => {
  const {
    knowledgeBase: classificationKnowledge,
    insights: classificationInsights,
    isLoading,
    error,
    synthesizeKnowledge,
    generateInsights,
    discoverPatterns,
    buildKnowledgeGraph,
    validateKnowledge,
    optimizeKnowledge,
  } = useClassificationState();

  const {
    knowledgeSynthesis,
    crossDomainInsights,
    patternDiscovery,
    knowledgeGraphs,
    reasoningEngines,
    synthesizeAcrossDomains,
    generateKnowledgeInsights,
    discoverKnowledgePatterns,
    buildIntelligentGraphs,
    validateKnowledgeQuality,
    optimizeKnowledgeBase,
    reasonAboutKnowledge,
  } = useAIIntelligence();

  // Core state
  const [synthesizerState, setSynthesizerState] = useState<KnowledgeSynthesizerState>({
    knowledgeBase: [],
    synthesisTasks: [],
    insights: [],
    patterns: [],
    connections: [],
    domains: [],
    ontologies: [],
    graphs: [],
    analytics: {} as KnowledgeAnalytics,
    synthesis: {} as SynthesisEngine,
    reasoning: {} as ReasoningEngine,
    discovery: {} as DiscoveryEngine,
    integration: {} as IntegrationEngine,
    validation: {} as ValidationEngine,
    quality: {} as QualityMetrics,
    performance: {} as PerformanceMetrics,
    collaboration: {} as CollaborationData,
    automation: {} as AutomationConfig,
  });

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedGraph, setSelectedGraph] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'graph' | 'timeline'>('grid');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [searchQuery, setSearchQuery] = useState('');

  // Configuration state
  const [autoSynthesis, setAutoSynthesis] = useState(true);
  const [crossDomainEnabled, setCrossDomainEnabled] = useState(true);
  const [patternDiscoveryEnabled, setPatternDiscoveryEnabled] = useState(true);
  const [insightGenerationEnabled, setInsightGenerationEnabled] = useState(true);
  const [hypothesisFormationEnabled, setHypothesisFormationEnabled] = useState(true);
  const [theoryBuildingEnabled, setTheoryBuildingEnabled] = useState(false);
  const [knowledgeFusionEnabled, setKnowledgeFusionEnabled] = useState(true);
  const [realTimeProcessing, setRealTimeProcessing] = useState(true);
  const [qualityValidation, setQualityValidation] = useState(true);
  const [collaborativeMode, setCollaborativeMode] = useState(false);

  // Advanced settings
  const [synthesisAlgorithm, setSynthesisAlgorithm] = useState('semantic_fusion');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [noveltyThreshold, setNoveltyThreshold] = useState(0.7);
  const [relevanceThreshold, setRelevanceThreshold] = useState(0.75);
  const [complexityLevel, setComplexityLevel] = useState(2); // 0: simple, 1: moderate, 2: complex, 3: very_complex
  const [batchSize, setBatchSize] = useState(50);
  const [processingTimeout, setProcessingTimeout] = useState(300);

  // Refs for visualization
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);
  const networkVisualizationRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Load data and initialize
  useEffect(() => {
    loadKnowledgeData();
    initializeRealTimeProcessing();
    initializeSynthesisEngine();
    initializeKnowledgeGraphs();
  }, []);

  const loadKnowledgeData = useCallback(async () => {
    try {
      const [
        knowledgeData,
        tasksData,
        insightsData,
        patternsData,
        connectionsData,
        domainsData,
        graphsData,
        analyticsData,
      ] = await Promise.all([
        aiApi.getKnowledgeBase({ includeMetadata: true, includeRelationships: true }),
        aiApi.getSynthesisTasks({ includeResults: true, includeMetrics: true }),
        aiApi.getKnowledgeInsights({ includeEvidence: true, includeValidation: true }),
        aiApi.getKnowledgePatterns({ includeInstances: true, includeApplications: true }),
        aiApi.getKnowledgeConnections({ includeEvidence: true, includeValidation: true }),
        aiApi.getKnowledgeDomains({ includeOntologies: true, includeMetrics: true }),
        aiApi.getKnowledgeGraphs({ includeAnalysis: true, includeVisualization: true }),
        aiApi.getKnowledgeAnalytics({ timeRange: '30d', includeQuality: true }),
      ]);

      setSynthesizerState(prev => ({
        ...prev,
        knowledgeBase: knowledgeData.data,
        synthesisTasks: tasksData.data,
        insights: insightsData.data,
        patterns: patternsData.data,
        connections: connectionsData.data,
        domains: domainsData.data,
        graphs: graphsData.data,
        analytics: analyticsData.data,
      }));
    } catch (error) {
      console.error('Error loading knowledge data:', error);
    }
  }, []);

  const initializeRealTimeProcessing = useCallback(async () => {
    if (realTimeProcessing) {
      try {
        await websocketApi.connect('knowledge_synthesizer');

        websocketApi.subscribe('synthesis_task_updated', (data) => {
          setSynthesizerState(prev => ({
            ...prev,
            synthesisTasks: prev.synthesisTasks.map(task =>
              task.id === data.taskId ? { ...task, ...data.updates } : task
            ),
          }));
        });

        websocketApi.subscribe('new_insight_generated', (data) => {
          setSynthesizerState(prev => ({
            ...prev,
            insights: [data.insight, ...prev.insights.slice(0, 99)],
          }));
        });

        websocketApi.subscribe('pattern_discovered', (data) => {
          setSynthesizerState(prev => ({
            ...prev,
            patterns: [data.pattern, ...prev.patterns.slice(0, 49)],
          }));
        });

        websocketApi.subscribe('connection_identified', (data) => {
          setSynthesizerState(prev => ({
            ...prev,
            connections: [data.connection, ...prev.connections.slice(0, 199)],
          }));
        });

        websocketApi.subscribe('knowledge_graph_updated', (data) => {
          setSynthesizerState(prev => ({
            ...prev,
            graphs: prev.graphs.map(graph =>
              graph.id === data.graphId ? { ...graph, ...data.updates } : graph
            ),
          }));
        });

      } catch (error) {
        console.error('Error initializing real-time processing:', error);
      }
    }
  }, [realTimeProcessing]);

  const initializeSynthesisEngine = useCallback(async () => {
    try {
      await aiApi.initializeSynthesisEngine({
        algorithm: synthesisAlgorithm,
        crossDomainEnabled,
        patternDiscoveryEnabled,
        insightGenerationEnabled,
        hypothesisFormationEnabled,
        theoryBuildingEnabled,
        knowledgeFusionEnabled,
        confidenceThreshold,
        noveltyThreshold,
        relevanceThreshold,
        complexityLevel,
        batchSize,
        processingTimeout,
        qualityValidation,
        realTimeProcessing,
      });
    } catch (error) {
      console.error('Error initializing synthesis engine:', error);
    }
  }, [synthesisAlgorithm, crossDomainEnabled, patternDiscoveryEnabled, insightGenerationEnabled, hypothesisFormationEnabled, theoryBuildingEnabled, knowledgeFusionEnabled, confidenceThreshold, noveltyThreshold, relevanceThreshold, complexityLevel, batchSize, processingTimeout, qualityValidation, realTimeProcessing]);

  const initializeKnowledgeGraphs = useCallback(async () => {
    try {
      await aiApi.initializeKnowledgeGraphs({
        domains: KNOWLEDGE_DOMAINS.map(d => d.id),
        algorithms: SYNTHESIS_ALGORITHMS.map(a => a.id),
        visualization: true,
        analysis: true,
        realTimeUpdates: realTimeProcessing,
        collaboration: collaborativeMode,
      });
    } catch (error) {
      console.error('Error initializing knowledge graphs:', error);
    }
  }, [realTimeProcessing, collaborativeMode]);

  // Synthesis operations
  const handleStartSynthesis = useCallback(async (type: string, inputs: any[]) => {
    try {
      const task = await synthesizeAcrossDomains({
        type,
        inputs,
        algorithm: synthesisAlgorithm,
        configuration: {
          crossDomainEnabled,
          patternDiscoveryEnabled,
          insightGenerationEnabled,
          hypothesisFormationEnabled,
          theoryBuildingEnabled,
          knowledgeFusionEnabled,
          confidenceThreshold,
          noveltyThreshold,
          relevanceThreshold,
          complexityLevel,
          qualityValidation,
        },
      });

      setSynthesizerState(prev => ({
        ...prev,
        synthesisTasks: [task, ...prev.synthesisTasks],
      }));
    } catch (error) {
      console.error('Error starting synthesis:', error);
    }
  }, [synthesisAlgorithm, crossDomainEnabled, patternDiscoveryEnabled, insightGenerationEnabled, hypothesisFormationEnabled, theoryBuildingEnabled, knowledgeFusionEnabled, confidenceThreshold, noveltyThreshold, relevanceThreshold, complexityLevel, qualityValidation, synthesizeAcrossDomains]);

  const handleGenerateInsights = useCallback(async (knowledgeIds: string[]) => {
    try {
      const insights = await generateKnowledgeInsights({
        knowledgeIds,
        algorithm: synthesisAlgorithm,
        configuration: {
          confidenceThreshold,
          noveltyThreshold,
          relevanceThreshold,
          crossDomainEnabled,
          qualityValidation,
        },
      });

      setSynthesizerState(prev => ({
        ...prev,
        insights: [...insights, ...prev.insights.slice(0, 100 - insights.length)],
      }));
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  }, [synthesisAlgorithm, confidenceThreshold, noveltyThreshold, relevanceThreshold, crossDomainEnabled, qualityValidation, generateKnowledgeInsights]);

  const handleDiscoverPatterns = useCallback(async (domain?: string) => {
    try {
      const patterns = await discoverKnowledgePatterns({
        domain,
        algorithm: 'pattern_mining',
        configuration: {
          complexityLevel,
          confidenceThreshold,
          noveltyThreshold,
          batchSize,
          qualityValidation,
        },
      });

      setSynthesizerState(prev => ({
        ...prev,
        patterns: [...patterns, ...prev.patterns.slice(0, 50 - patterns.length)],
      }));
    } catch (error) {
      console.error('Error discovering patterns:', error);
    }
  }, [complexityLevel, confidenceThreshold, noveltyThreshold, batchSize, qualityValidation, discoverKnowledgePatterns]);

  const handleBuildKnowledgeGraph = useCallback(async (domain: string) => {
    try {
      const graph = await buildIntelligentGraphs({
        domain,
        knowledgeBase: synthesizerState.knowledgeBase.filter(k => k.domain === domain),
        connections: synthesizerState.connections,
        configuration: {
          includePatterns: true,
          includeInsights: true,
          includeValidation: qualityValidation,
          visualization: true,
          analysis: true,
        },
      });

      setSynthesizerState(prev => ({
        ...prev,
        graphs: [graph, ...prev.graphs.slice(0, 9)],
      }));
    } catch (error) {
      console.error('Error building knowledge graph:', error);
    }
  }, [synthesizerState.knowledgeBase, synthesizerState.connections, qualityValidation, buildIntelligentGraphs]);

  const handleOptimizeKnowledge = useCallback(async () => {
    try {
      const optimization = await optimizeKnowledgeBase({
        knowledgeBase: synthesizerState.knowledgeBase,
        insights: synthesizerState.insights,
        patterns: synthesizerState.patterns,
        connections: synthesizerState.connections,
        objectives: ['quality', 'relevance', 'novelty', 'coherence'],
        constraints: {
          minConfidence: confidenceThreshold,
          minNovelty: noveltyThreshold,
          minRelevance: relevanceThreshold,
        },
      });

      setSynthesizerState(prev => ({
        ...prev,
        quality: { ...prev.quality, ...optimization.quality },
        performance: { ...prev.performance, ...optimization.performance },
      }));
    } catch (error) {
      console.error('Error optimizing knowledge:', error);
    }
  }, [synthesizerState.knowledgeBase, synthesizerState.insights, synthesizerState.patterns, synthesizerState.connections, confidenceThreshold, noveltyThreshold, relevanceThreshold, optimizeKnowledgeBase]);

  // Utility functions
  const getKnowledgeTypeIcon = useCallback((type: string) => {
    const knowledgeType = KNOWLEDGE_TYPES.find(t => t.id === type);
    return knowledgeType?.icon || BookOpen;
  }, []);

  const getKnowledgeTypeColor = useCallback((type: string) => {
    const knowledgeType = KNOWLEDGE_TYPES.find(t => t.id === type);
    return knowledgeType?.color || '#64748B';
  }, []);

  const getSynthesisTypeInfo = useCallback((type: string) => {
    return SYNTHESIS_TYPES.find(t => t.id === type);
  }, []);

  const formatConfidence = useCallback((confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  }, []);

  const getTaskStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Filtered data
  const filteredKnowledge = useMemo(() => {
    let filtered = synthesizerState.knowledgeBase;

    if (filterBy !== 'all') {
      filtered = filtered.filter(knowledge => {
        switch (filterBy) {
          case 'concept': return knowledge.type === 'concept';
          case 'fact': return knowledge.type === 'fact';
          case 'rule': return knowledge.type === 'rule';
          case 'pattern': return knowledge.type === 'pattern';
          case 'insight': return knowledge.type === 'insight';
          case 'hypothesis': return knowledge.type === 'hypothesis';
          case 'theory': return knowledge.type === 'theory';
          case 'principle': return knowledge.type === 'principle';
          case 'high_confidence': return knowledge.confidence >= 0.8;
          case 'validated': return knowledge.validation?.status === 'validated';
          default: return true;
        }
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(knowledge =>
        knowledge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        knowledge.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        knowledge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort knowledge
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevance - a.relevance;
        case 'confidence':
          return b.confidence - a.confidence;
        case 'quality':
          return b.quality - a.quality;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'domain':
          return a.domain.localeCompare(b.domain);
        default:
          return 0;
      }
    });

    return filtered;
  }, [synthesizerState.knowledgeBase, filterBy, searchQuery, sortBy]);

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const analytics = synthesizerState.analytics;
    return {
      totalKnowledge: synthesizerState.knowledgeBase.length,
      totalInsights: synthesizerState.insights.length,
      totalPatterns: synthesizerState.patterns.length,
      totalConnections: synthesizerState.connections.length,
      activeTasks: synthesizerState.synthesisTasks.filter(t => t.status === 'running').length,
      averageConfidence: synthesizerState.knowledgeBase.reduce((sum, k) => sum + k.confidence, 0) / Math.max(synthesizerState.knowledgeBase.length, 1),
      averageQuality: synthesizerState.knowledgeBase.reduce((sum, k) => sum + k.quality, 0) / Math.max(synthesizerState.knowledgeBase.length, 1),
      crossDomainConnections: synthesizerState.connections.filter(c => {
        const source = synthesizerState.knowledgeBase.find(k => k.id === c.source);
        const target = synthesizerState.knowledgeBase.find(k => k.id === c.target);
        return source && target && source.domain !== target.domain;
      }).length,
    };
  }, [synthesizerState]);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Knowledge Synthesizer
            </h1>
            <p className="text-muted-foreground mt-2">
              Advanced knowledge synthesis with cross-domain insights and intelligent pattern discovery
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button onClick={() => handleStartSynthesis('cross_domain', [])}>
              <Plus className="h-4 w-4 mr-2" />
              Start Synthesis
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {overallMetrics.totalKnowledge.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Avg Quality: {formatConfidence(overallMetrics.averageQuality)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generated Insights</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {overallMetrics.totalInsights.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Avg Confidence: {formatConfidence(overallMetrics.averageConfidence)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discovered Patterns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {overallMetrics.totalPatterns.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Cross-Domain: {overallMetrics.crossDomainConnections}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Synthesis</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {overallMetrics.activeTasks}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Running tasks
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="synthesis">Synthesis</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="graphs">Knowledge Graphs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Knowledge Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Knowledge Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of knowledge across domains and types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={KNOWLEDGE_DOMAINS.map(domain => ({
                          name: domain.name,
                          value: synthesizerState.knowledgeBase.filter(k => k.domain === domain.id).length,
                          fill: domain.color,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Synthesis Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Synthesis Performance
                  </CardTitle>
                  <CardDescription>
                    Performance metrics across synthesis types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={SYNTHESIS_TYPES.map(type => ({
                      type: type.name.split(' ')[0],
                      accuracy: type.accuracy * 100,
                      novelty: type.novelty * 100,
                      complexity: type.complexity === 'very_high' ? 100 : type.complexity === 'high' ? 75 : type.complexity === 'medium' ? 50 : 25,
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="type" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Accuracy" dataKey="accuracy" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Novelty" dataKey="novelty" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Radar name="Complexity" dataKey="complexity" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Synthesis Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Recent Synthesis Tasks
                </CardTitle>
                <CardDescription>
                  Latest knowledge synthesis tasks and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {synthesizerState.synthesisTasks.slice(0, 5).map((task) => {
                    const typeInfo = getSynthesisTypeInfo(task.type);
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">
                            <Brain className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{task.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {typeInfo?.description || task.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            Progress: {Math.round(task.progress * 100)}%
                          </div>
                          <Progress value={task.progress * 100} className="w-24" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search knowledge..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="concept">Concepts</SelectItem>
                    <SelectItem value="fact">Facts</SelectItem>
                    <SelectItem value="rule">Rules</SelectItem>
                    <SelectItem value="pattern">Patterns</SelectItem>
                    <SelectItem value="insight">Insights</SelectItem>
                    <SelectItem value="hypothesis">Hypotheses</SelectItem>
                    <SelectItem value="theory">Theories</SelectItem>
                    <SelectItem value="principle">Principles</SelectItem>
                    <SelectItem value="high_confidence">High Confidence</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="domain">Domain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleGenerateInsights(filteredKnowledge.map(k => k.id))}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
                <Button variant="outline" onClick={() => handleDiscoverPatterns()}>
                  <Target className="h-4 w-4 mr-2" />
                  Discover Patterns
                </Button>
                <Button onClick={handleOptimizeKnowledge}>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredKnowledge.slice(0, 12).map((knowledge) => {
                const IconComponent = getKnowledgeTypeIcon(knowledge.type);
                
                return (
                  <Card key={knowledge.id} className={selectedKnowledge === knowledge.id ? 'ring-2 ring-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" style={{ color: getKnowledgeTypeColor(knowledge.type) }} />
                          {knowledge.title}
                        </CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {knowledge.type}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {knowledge.content}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Domain</div>
                          <div className="font-medium capitalize">{knowledge.domain}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Confidence</div>
                          <div className="font-medium">{formatConfidence(knowledge.confidence)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Quality</div>
                          <div className="font-medium">{formatConfidence(knowledge.quality)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Relevance</div>
                          <div className="font-medium">{formatConfidence(knowledge.relevance)}</div>
                        </div>
                      </div>
                      
                      {knowledge.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {knowledge.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {knowledge.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{knowledge.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Network className="h-3 w-3 mr-1" />
                          Connections
                        </Button>
                        <Button size="sm" variant="ghost" className="px-2">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Synthesis Tab */}
          <TabsContent value="synthesis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Synthesis Types
                  </CardTitle>
                  <CardDescription>
                    Available knowledge synthesis approaches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {SYNTHESIS_TYPES.map((type) => (
                      <div key={type.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{type.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="text-green-600 bg-green-100">
                              {formatConfidence(type.accuracy)}
                            </Badge>
                            <Badge variant="outline">{type.complexity}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>Novelty: {formatConfidence(type.novelty)}</span>
                          <span>Duration: {type.duration}</span>
                          <Button size="sm" onClick={() => handleStartSynthesis(type.id, [])}>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Synthesis Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure synthesis parameters and algorithms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-synthesis">Auto Synthesis</Label>
                      <Switch
                        id="auto-synthesis"
                        checked={autoSynthesis}
                        onCheckedChange={setAutoSynthesis}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cross-domain">Cross-Domain Synthesis</Label>
                      <Switch
                        id="cross-domain"
                        checked={crossDomainEnabled}
                        onCheckedChange={setCrossDomainEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pattern-discovery">Pattern Discovery</Label>
                      <Switch
                        id="pattern-discovery"
                        checked={patternDiscoveryEnabled}
                        onCheckedChange={setPatternDiscoveryEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="insight-generation">Insight Generation</Label>
                      <Switch
                        id="insight-generation"
                        checked={insightGenerationEnabled}
                        onCheckedChange={setInsightGenerationEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hypothesis-formation">Hypothesis Formation</Label>
                      <Switch
                        id="hypothesis-formation"
                        checked={hypothesisFormationEnabled}
                        onCheckedChange={setHypothesisFormationEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theory-building">Theory Building</Label>
                      <Switch
                        id="theory-building"
                        checked={theoryBuildingEnabled}
                        onCheckedChange={setTheoryBuildingEnabled}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Confidence Threshold</Label>
                      <Slider
                        value={[confidenceThreshold]}
                        onValueChange={(value) => setConfidenceThreshold(value[0])}
                        max={1}
                        min={0}
                        step={0.05}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {formatConfidence(confidenceThreshold)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Novelty Threshold</Label>
                      <Slider
                        value={[noveltyThreshold]}
                        onValueChange={(value) => setNoveltyThreshold(value[0])}
                        max={1}
                        min={0}
                        step={0.05}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {formatConfidence(noveltyThreshold)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Complexity Level</Label>
                      <Slider
                        value={[complexityLevel]}
                        onValueChange={(value) => setComplexityLevel(value[0])}
                        max={3}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {['Simple', 'Moderate', 'Complex', 'Very Complex'][complexityLevel]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Synthesis Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Synthesis Tasks
                </CardTitle>
                <CardDescription>
                  Currently running synthesis tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {synthesizerState.synthesisTasks.filter(t => t.status === 'running' || t.status === 'pending').map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{task.name}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {task.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{Math.round(task.progress * 100)}%</span>
                        </div>
                        <Progress value={task.progress * 100} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 text-sm">
                        <div className="flex items-center gap-4">
                          <span>Inputs: {task.inputs.length}</span>
                          <span>Outputs: {task.outputs.length}</span>
                          <span>Insights: {task.insights?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {synthesizerState.insights.slice(0, 12).map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        {insight.title}
                      </CardTitle>
                      <Badge className="text-green-600 bg-green-100">
                        {formatConfidence(insight.confidence)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {insight.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Type</div>
                        <div className="font-medium capitalize">{insight.type}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Impact</div>
                        <div className="font-medium">{formatConfidence(insight.impact)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Novelty</div>
                        <div className="font-medium">{formatConfidence(insight.novelty)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Domains</div>
                        <div className="font-medium">{insight.domains.length}</div>
                      </div>
                    </div>
                    
                    {insight.domains.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {insight.domains.slice(0, 3).map((domain) => (
                          <Badge key={domain} variant="secondary" className="text-xs">
                            {domain}
                          </Badge>
                        ))}
                        {insight.domains.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{insight.domains.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Explore
                      </Button>
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Evidence
                      </Button>
                      <Button size="sm" variant="ghost" className="px-2">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Knowledge Graphs Tab */}
          <TabsContent value="graphs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Knowledge Graphs</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive knowledge graphs and network visualizations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {KNOWLEDGE_DOMAINS.map(domain => (
                      <SelectItem key={domain.id} value={domain.id}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleBuildKnowledgeGraph('technology')}>
                  <Network className="h-4 w-4 mr-2" />
                  Build Graph
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {synthesizerState.graphs.slice(0, 4).map((graph) => (
                <Card key={graph.id} className={selectedGraph === graph.id ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        {graph.name}
                      </CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {graph.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{graph.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Nodes</div>
                        <div className="font-medium">{graph.nodes.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Edges</div>
                        <div className="font-medium">{graph.edges.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Clusters</div>
                        <div className="font-medium">{graph.clusters.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Quality</div>
                        <div className="font-medium">{formatConfidence(graph.quality?.score || 0)}</div>
                      </div>
                    </div>
                    
                    <div className="h-32 bg-muted rounded flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Network className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">Graph Visualization</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Explore
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      <Button size="sm" variant="ghost" className="px-2">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Knowledge Quality Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Knowledge Quality Trends
                  </CardTitle>
                  <CardDescription>
                    Quality metrics over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={synthesizerState.analytics?.qualityTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="confidence" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="relevance" stroke="#F59E0B" strokeWidth={2} />
                      <Line type="monotone" dataKey="novelty" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cross-Domain Connections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Cross-Domain Connections
                  </CardTitle>
                  <CardDescription>
                    Knowledge connections across domains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={KNOWLEDGE_DOMAINS.map(domain => ({
                      name: domain.name,
                      internal: synthesizerState.connections.filter(c => {
                        const source = synthesizerState.knowledgeBase.find(k => k.id === c.source);
                        const target = synthesizerState.knowledgeBase.find(k => k.id === c.target);
                        return source?.domain === domain.id && target?.domain === domain.id;
                      }).length,
                      external: synthesizerState.connections.filter(c => {
                        const source = synthesizerState.knowledgeBase.find(k => k.id === c.source);
                        const target = synthesizerState.knowledgeBase.find(k => k.id === c.target);
                        return (source?.domain === domain.id && target?.domain !== domain.id) ||
                               (target?.domain === domain.id && source?.domain !== domain.id);
                      }).length,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="internal" fill="#3B82F6" />
                      <Bar dataKey="external" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Synthesis Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Synthesis Performance Summary
                </CardTitle>
                <CardDescription>
                  Overall performance metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatConfidence(overallMetrics.averageConfidence)}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatConfidence(overallMetrics.averageQuality)}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {overallMetrics.crossDomainConnections}
                    </div>
                    <div className="text-sm text-muted-foreground">Cross-Domain Links</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {KNOWLEDGE_DOMAINS.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Domains</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default KnowledgeSynthesizer;