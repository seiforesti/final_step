import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Brain, Zap, Target, TrendingUp, BookOpen, Lightbulb, Award, Users, BarChart3, LineChart, PieChart, Activity, Clock, CheckCircle, XCircle, AlertTriangle, Info, Play, Pause, RotateCcw, Settings, Monitor, Database, Network, Cpu, MemoryStick, HardDrive, Gauge, Timer, Sparkles, Workflow, GitBranch, Code, Search, Filter, SortAsc, SortDesc, MoreVertical, RefreshCw, Download, Upload, Edit, Trash2, Copy, Eye, ExternalLink, Plus, Minus, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, ChevronDown, ChevronRight, ChevronUp, Calendar, Globe, Lock, Unlock, History, Star, Heart, ThumbsUp, ThumbsDown, MessageSquare, Bell, Bookmark, Share, Flag, Shield, Layers, Package, FileText, Image, Video, Music, Map, Compass, Route, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Treemap,
  Sankey
} from 'recharts';
import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

import { useMLIntelligence } from '../core/hooks/useMLIntelligence';
import { 
  MLModel,
  TrainingJob,
  AdaptiveLearningConfig,
  LearningPath,
  CurriculumUnit,
  LearningObjective,
  PerformanceMetrics,
  AdaptationStrategy,
  KnowledgeGraph,
  LearningSession,
  StudentProfile,
  DifficultyLevel,
  LearningStyle,
  FeedbackData,
  RecommendationEngine,
  LearningAnalytics,
  AdaptiveTesting,
  PersonalizationConfig
} from '../core/types';

// Enhanced interfaces for adaptive learning
interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  type: 'concept' | 'exercise' | 'assessment' | 'project' | 'review';
  difficulty: DifficultyLevel;
  estimatedDuration: number;
  prerequisites: string[];
  dependencies: string[];
  learningObjectives: string[];
  competencies: string[];
  resources: LearningResource[];
  adaptationRules: AdaptationRule[];
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'skipped';
  progress: number;
  score?: number;
  attempts: number;
  timeSpent: number;
  lastAccessed?: string;
  personalizedContent?: PersonalizedContent;
}

interface LearningResource {
  id: string;
  type: 'text' | 'video' | 'interactive' | 'simulation' | 'quiz' | 'code';
  title: string;
  url: string;
  duration: number;
  difficulty: DifficultyLevel;
  tags: string[];
  rating: number;
  accessibility: AccessibilityFeatures;
}

interface AdaptationRule {
  id: string;
  condition: AdaptationCondition;
  action: AdaptationAction;
  priority: number;
  enabled: boolean;
}

interface AdaptationCondition {
  type: 'performance' | 'time' | 'engagement' | 'style' | 'prior_knowledge';
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: number | string;
  threshold?: number;
}

interface AdaptationAction {
  type: 'adjust_difficulty' | 'recommend_resource' | 'skip_content' | 'provide_scaffolding' | 'change_pace';
  parameters: Record<string, any>;
  explanation: string;
}

interface PersonalizedContent {
  recommendations: ContentRecommendation[];
  alternativeExplanations: AlternativeExplanation[];
  scaffolding: ScaffoldingSupport[];
  enrichment: EnrichmentActivity[];
}

interface ContentRecommendation {
  resourceId: string;
  reason: string;
  confidence: number;
  priority: number;
}

interface AlternativeExplanation {
  concept: string;
  explanation: string;
  learningStyle: LearningStyle;
  examples: Example[];
}

interface ScaffoldingSupport {
  type: 'hint' | 'breakdown' | 'analogy' | 'example' | 'practice';
  content: string;
  when: 'on_demand' | 'automatic' | 'after_error';
}

interface EnrichmentActivity {
  title: string;
  description: string;
  type: 'challenge' | 'project' | 'research' | 'discussion';
  estimatedTime: number;
}

interface AccessibilityFeatures {
  transcripts: boolean;
  captions: boolean;
  audioDescription: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
}

interface Example {
  title: string;
  content: string;
  interactive: boolean;
  visualization?: string;
}

interface AdaptiveLearningCenterProps {
  className?: string;
  modelId?: string;
  learningPathId?: string;
  studentId?: string;
  onPathSelect?: (pathId: string) => void;
  onProgressUpdate?: (progress: any) => void;
}

const AdaptiveLearningCenter: React.FC<AdaptiveLearningCenterProps> = ({
  className,
  modelId,
  learningPathId,
  studentId,
  onPathSelect,
  onProgressUpdate
}) => {
  // ML Intelligence hook
  const {
    models,
    realtimeData,
    businessIntelligence,
    fetchModels,
    addNotification
  } = useMLIntelligence();

  // Local state management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'paths' | 'curriculum' | 'analytics' | 'personalization'>('dashboard');
  const [selectedPath, setSelectedPath] = useState<string | null>(learningPathId || null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(studentId || null);
  const [showCreatePathDialog, setShowCreatePathDialog] = useState(false);
  const [showAdaptationDialog, setShowAdaptationDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline' | 'grid' | 'tree'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'progress' | 'difficulty' | 'time' | 'score'>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [autoAdaptation, setAutoAdaptation] = useState(true);
  const [realTimeTracking, setRealTimeTracking] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'progress']));

  // Adaptive learning state
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [learningNodes, setLearningNodes] = useState<Record<string, LearningPathNode[]>>({});
  const [studentProfiles, setStudentProfiles] = useState<Record<string, StudentProfile>>({});
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics | null>(null);
  const [adaptationStrategies, setAdaptationStrategies] = useState<AdaptationStrategy[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<ContentRecommendation[]>([]);

  // Form state for path creation
  const [newPathForm, setNewPathForm] = useState<{
    name: string;
    description: string;
    targetAudience: string;
    difficulty: DifficultyLevel;
    estimatedDuration: number;
    learningObjectives: string[];
    prerequisites: string[];
    adaptationConfig: AdaptiveLearningConfig;
    personalizationConfig: PersonalizationConfig;
  }>({
    name: '',
    description: '',
    targetAudience: '',
    difficulty: 'intermediate',
    estimatedDuration: 0,
    learningObjectives: [],
    prerequisites: [],
    adaptationConfig: {
      enabled: true,
      strategies: ['performance_based', 'style_based', 'pace_based'],
      thresholds: {
        strugglingThreshold: 0.6,
        masteryThreshold: 0.85,
        timeThreshold: 1.5
      },
      interventions: {
        scaffolding: true,
        enrichment: true,
        reteaching: true,
        acceleration: true
      }
    },
    personalizationConfig: {
      learningStyleAdaptation: true,
      difficultyAdjustment: true,
      contentRecommendation: true,
      paceModification: true,
      alternativeExplanations: true,
      scaffoldingSupport: true,
      enrichmentActivities: true
    }
  });

  // Adaptation configuration state
  const [adaptationConfig, setAdaptationConfig] = useState<{
    globalRules: AdaptationRule[];
    personalizedRules: Record<string, AdaptationRule[]>;
    thresholds: {
      performance: number;
      engagement: number;
      timeSpent: number;
      errorRate: number;
    };
    interventions: {
      automaticScaffolding: boolean;
      dynamicDifficulty: boolean;
      contentRecommendation: boolean;
      paceAdjustment: boolean;
    };
  }>({
    globalRules: [],
    personalizedRules: {},
    thresholds: {
      performance: 0.7,
      engagement: 0.6,
      timeSpent: 1.2,
      errorRate: 0.3
    },
    interventions: {
      automaticScaffolding: true,
      dynamicDifficulty: true,
      contentRecommendation: true,
      paceAdjustment: true
    }
  });

  // Real-time monitoring
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized computed values
  const filteredPaths = useMemo(() => {
    let filtered = learningPaths;

    if (searchQuery) {
      filtered = filtered.filter(path => 
        path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.targetAudience.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(path => path.difficulty === difficultyFilter);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof LearningPath];
      const bValue = b[sortBy as keyof LearningPath];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [learningPaths, searchQuery, difficultyFilter, sortBy, sortOrder]);

  const pathProgressStats = useMemo(() => {
    if (!selectedPath || !learningNodes[selectedPath]) return null;

    const nodes = learningNodes[selectedPath];
    const total = nodes.length;
    const completed = nodes.filter(node => node.status === 'completed').length;
    const inProgress = nodes.filter(node => node.status === 'in_progress').length;
    const available = nodes.filter(node => node.status === 'available').length;
    const locked = nodes.filter(node => node.status === 'locked').length;

    const averageScore = nodes
      .filter(node => node.score !== undefined)
      .reduce((sum, node) => sum + (node.score || 0), 0) / 
      nodes.filter(node => node.score !== undefined).length || 0;

    const totalTimeSpent = nodes.reduce((sum, node) => sum + node.timeSpent, 0);
    const estimatedTotalTime = nodes.reduce((sum, node) => sum + node.estimatedDuration, 0);

    return {
      total,
      completed,
      inProgress,
      available,
      locked,
      completionRate: total > 0 ? completed / total : 0,
      averageScore,
      totalTimeSpent,
      estimatedTotalTime,
      efficiencyRatio: estimatedTotalTime > 0 ? totalTimeSpent / estimatedTotalTime : 0
    };
  }, [selectedPath, learningNodes]);

  const studentPerformanceData = useMemo(() => {
    if (!selectedStudent || !studentProfiles[selectedStudent]) return null;

    const profile = studentProfiles[selectedStudent];
    const recentSessions = profile.sessions?.slice(-10) || [];

    return recentSessions.map(session => ({
      date: session.date,
      performance: session.performance,
      engagement: session.engagement,
      timeSpent: session.timeSpent,
      conceptsMastered: session.conceptsMastered,
      errorsCount: session.errorsCount
    }));
  }, [selectedStudent, studentProfiles]);

  const adaptationInsights = useMemo(() => {
    if (!learningAnalytics) return [];

    return [
      {
        type: 'performance',
        title: 'Performance Adaptation',
        description: `${learningAnalytics.adaptationsApplied.performance} adaptations applied based on performance metrics`,
        impact: learningAnalytics.adaptationEffectiveness.performance,
        trend: 'improving'
      },
      {
        type: 'engagement',
        title: 'Engagement Optimization',
        description: `${learningAnalytics.adaptationsApplied.engagement} adaptations to improve student engagement`,
        impact: learningAnalytics.adaptationEffectiveness.engagement,
        trend: 'stable'
      },
      {
        type: 'difficulty',
        title: 'Difficulty Adjustment',
        description: `${learningAnalytics.adaptationsApplied.difficulty} difficulty adjustments made`,
        impact: learningAnalytics.adaptationEffectiveness.difficulty,
        trend: 'improving'
      },
      {
        type: 'content',
        title: 'Content Personalization',
        description: `${learningAnalytics.adaptationsApplied.content} personalized content recommendations`,
        impact: learningAnalytics.adaptationEffectiveness.content,
        trend: 'improving'
      }
    ];
  }, [learningAnalytics]);

  // Event handlers
  const handlePathSelect = useCallback((pathId: string) => {
    setSelectedPath(pathId);
    onPathSelect?.(pathId);
  }, [onPathSelect]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  const handleStartSession = useCallback(async (pathId: string, nodeId?: string) => {
    try {
      const session: LearningSession = {
        id: `session_${Date.now()}`,
        studentId: selectedStudent || 'current_user',
        pathId,
        nodeId,
        startTime: new Date().toISOString(),
        status: 'active',
        activities: [],
        interactions: [],
        adaptations: []
      };

      setCurrentSession(session);
      
      if (realTimeTracking) {
        // Start real-time tracking
        wsRef.current?.send(JSON.stringify({
          type: 'start_session',
          session
        }));
      }

      addNotification({
        type: 'info',
        title: 'Learning Session Started',
        message: `Session started for ${learningPaths.find(p => p.id === pathId)?.name || 'learning path'}`,
        category: 'session'
      });

      toast.success('Learning session started');
    } catch (error) {
      toast.error('Failed to start learning session');
      console.error('Session start error:', error);
    }
  }, [selectedStudent, realTimeTracking, addNotification, learningPaths]);

  const handleCompleteNode = useCallback(async (nodeId: string, score?: number) => {
    try {
      if (!selectedPath) return;

      setLearningNodes(prev => ({
        ...prev,
        [selectedPath]: prev[selectedPath]?.map(node => 
          node.id === nodeId 
            ? { 
                ...node, 
                status: 'completed', 
                progress: 100, 
                score,
                attempts: node.attempts + 1,
                lastAccessed: new Date().toISOString()
              }
            : node
        ) || []
      }));

      // Apply adaptations based on performance
      if (autoAdaptation && score !== undefined) {
        await applyAdaptation(nodeId, score);
      }

      // Update progress
      onProgressUpdate?.({ nodeId, score, status: 'completed' });

      addNotification({
        type: 'success',
        title: 'Node Completed',
        message: `Successfully completed learning node${score ? ` with score ${score}%` : ''}`,
        category: 'progress'
      });

      toast.success('Learning node completed');
    } catch (error) {
      toast.error('Failed to complete learning node');
      console.error('Node completion error:', error);
    }
  }, [selectedPath, autoAdaptation, onProgressUpdate, addNotification]);

  const applyAdaptation = useCallback(async (nodeId: string, score: number) => {
    try {
      const node = learningNodes[selectedPath || '']?.find(n => n.id === nodeId);
      if (!node) return;

      const adaptations: AdaptationAction[] = [];

      // Performance-based adaptations
      if (score < adaptationConfig.thresholds.performance * 100) {
        adaptations.push({
          type: 'provide_scaffolding',
          parameters: { level: 'high', type: 'conceptual' },
          explanation: 'Providing additional scaffolding due to low performance'
        });

        adaptations.push({
          type: 'adjust_difficulty',
          parameters: { direction: 'decrease', amount: 0.1 },
          explanation: 'Reducing difficulty to build confidence'
        });
      } else if (score > 0.9 * 100) {
        adaptations.push({
          type: 'adjust_difficulty',
          parameters: { direction: 'increase', amount: 0.1 },
          explanation: 'Increasing difficulty to maintain challenge'
        });

        adaptations.push({
          type: 'recommend_resource',
          parameters: { type: 'enrichment', difficulty: 'advanced' },
          explanation: 'Recommending enrichment activities for high performers'
        });
      }

      // Apply adaptations
      for (const adaptation of adaptations) {
        await executeAdaptation(nodeId, adaptation);
      }

      if (adaptations.length > 0) {
        addNotification({
          type: 'info',
          title: 'Adaptations Applied',
          message: `${adaptations.length} adaptations applied to personalize your learning experience`,
          category: 'adaptation'
        });
      }
    } catch (error) {
      console.error('Adaptation error:', error);
    }
  }, [learningNodes, selectedPath, adaptationConfig, addNotification]);

  const executeAdaptation = useCallback(async (nodeId: string, adaptation: AdaptationAction) => {
    try {
      switch (adaptation.type) {
        case 'adjust_difficulty':
          // Adjust the difficulty of subsequent nodes
          const { direction, amount } = adaptation.parameters;
          // Implementation would update node difficulties
          break;

        case 'provide_scaffolding':
          // Add scaffolding content to the node
          const { level, type } = adaptation.parameters;
          // Implementation would add scaffolding resources
          break;

        case 'recommend_resource':
          // Generate personalized content recommendations
          const { type: resourceType, difficulty } = adaptation.parameters;
          const recommendations = await generateRecommendations(nodeId, resourceType, difficulty);
          setPersonalizedRecommendations(prev => [...prev, ...recommendations]);
          break;

        case 'change_pace':
          // Adjust the pacing of the learning path
          const { factor } = adaptation.parameters;
          // Implementation would modify time allocations
          break;

        default:
          console.warn('Unknown adaptation type:', adaptation.type);
      }
    } catch (error) {
      console.error('Failed to execute adaptation:', error);
    }
  }, []);

  const generateRecommendations = useCallback(async (
    nodeId: string, 
    type: string, 
    difficulty: string
  ): Promise<ContentRecommendation[]> => {
    // Simulate AI-powered content recommendation
    const mockRecommendations: ContentRecommendation[] = [
      {
        resourceId: `resource_${nodeId}_1`,
        reason: `Additional ${type} content for ${difficulty} level`,
        confidence: 0.85,
        priority: 1
      },
      {
        resourceId: `resource_${nodeId}_2`,
        reason: `Interactive exercise to reinforce concepts`,
        confidence: 0.78,
        priority: 2
      }
    ];

    return mockRecommendations;
  }, []);

  const handleCreatePath = useCallback(async () => {
    try {
      const newPath: LearningPath = {
        id: `path_${Date.now()}`,
        name: newPathForm.name,
        description: newPathForm.description,
        targetAudience: newPathForm.targetAudience,
        difficulty: newPathForm.difficulty,
        estimatedDuration: newPathForm.estimatedDuration,
        learningObjectives: newPathForm.learningObjectives,
        prerequisites: newPathForm.prerequisites,
        nodes: [],
        adaptationConfig: newPathForm.adaptationConfig,
        personalizationConfig: newPathForm.personalizationConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        tags: [],
        version: '1.0'
      };

      setLearningPaths(prev => [...prev, newPath]);
      setShowCreatePathDialog(false);
      
      // Reset form
      setNewPathForm({
        name: '',
        description: '',
        targetAudience: '',
        difficulty: 'intermediate',
        estimatedDuration: 0,
        learningObjectives: [],
        prerequisites: [],
        adaptationConfig: newPathForm.adaptationConfig,
        personalizationConfig: newPathForm.personalizationConfig
      });

      addNotification({
        type: 'success',
        title: 'Learning Path Created',
        message: `Learning path "${newPath.name}" has been created successfully`,
        category: 'creation'
      });

      toast.success('Learning path created successfully');
    } catch (error) {
      toast.error('Failed to create learning path');
      console.error('Path creation error:', error);
    }
  }, [newPathForm, addNotification]);

  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Real-time monitoring setup
  useEffect(() => {
    if (realTimeTracking) {
      const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/v2/ml/adaptive-learning/realtime`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          
          switch (update.type) {
            case 'progress_update':
              // Update learning progress in real-time
              break;
            case 'adaptation_applied':
              // Show adaptation feedback
              addNotification({
                type: 'info',
                title: 'Adaptation Applied',
                message: update.message,
                category: 'adaptation'
              });
              break;
            case 'recommendation_update':
              setPersonalizedRecommendations(update.recommendations);
              break;
            default:
              console.log('Unknown update type:', update.type);
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [realTimeTracking, addNotification]);

  // Load initial data
  useEffect(() => {
    fetchModels();
    
    // Load sample data
    const samplePaths: LearningPath[] = [
      {
        id: 'path_1',
        name: 'ML Classification Fundamentals',
        description: 'Learn the basics of machine learning classification',
        targetAudience: 'Beginners',
        difficulty: 'beginner',
        estimatedDuration: 120,
        learningObjectives: ['Understand classification concepts', 'Implement basic algorithms'],
        prerequisites: ['Basic programming knowledge'],
        nodes: ['node_1', 'node_2', 'node_3'],
        adaptationConfig: newPathForm.adaptationConfig,
        personalizationConfig: newPathForm.personalizationConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        tags: ['ml', 'classification', 'beginner'],
        version: '1.0'
      }
    ];

    const sampleNodes: LearningPathNode[] = [
      {
        id: 'node_1',
        title: 'Introduction to Classification',
        description: 'Basic concepts and terminology',
        type: 'concept',
        difficulty: 'beginner',
        estimatedDuration: 30,
        prerequisites: [],
        dependencies: [],
        learningObjectives: ['Understand what classification is'],
        competencies: ['classification_basics'],
        resources: [],
        adaptationRules: [],
        status: 'available',
        progress: 0,
        attempts: 0,
        timeSpent: 0
      }
    ];

    setLearningPaths(samplePaths);
    setLearningNodes({ path_1: sampleNodes });
  }, [fetchModels, newPathForm.adaptationConfig, newPathForm.personalizationConfig]);

  // Get difficulty color
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'available': return 'bg-yellow-500';
      case 'locked': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  // Render learning path card
  const renderPathCard = (path: LearningPath) => (
    <motion.div
      key={path.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
          selectedPath === path.id ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => handlePathSelect(path.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getDifficultyColor(path.difficulty)} text-white`}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{path.name}</CardTitle>
                <CardDescription className="text-sm">
                  {path.targetAudience} • {path.estimatedDuration} minutes
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{path.difficulty}</Badge>
              <Badge variant="secondary">{path.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{path.description}</p>
            
            {pathProgressStats && selectedPath === path.id && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(pathProgressStats.completionRate * 100)}%</span>
                </div>
                <Progress value={pathProgressStats.completionRate * 100} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="ml-1 font-medium">{pathProgressStats.completed}/{pathProgressStats.total}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Score:</span>
                    <span className="ml-1 font-medium">{Math.round(pathProgressStats.averageScore)}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-1">
                {path.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartSession(path.id);
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Render dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Paths</p>
              <p className="text-2xl font-bold">{learningPaths.filter(p => p.status === 'active').length}</p>
            </div>
            <Route className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{Object.keys(studentProfiles).length}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adaptations Applied</p>
              <p className="text-2xl font-bold">{learningAnalytics?.adaptationsApplied.total || 0}</p>
            </div>
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
              <p className="text-2xl font-bold">{Math.round(learningAnalytics?.averagePerformance || 0)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Performance Trends</CardTitle>
            <CardDescription>Performance metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={studentPerformanceData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), 'MMM dd')} />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="performance" stroke="#8884d8" strokeWidth={2} name="Performance" />
                  <Line type="monotone" dataKey="engagement" stroke="#82ca9d" strokeWidth={2} name="Engagement" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adaptation Effectiveness</CardTitle>
            <CardDescription>Impact of adaptive learning strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adaptationInsights}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis domain={[0, 1]} />
                  <RechartsTooltip />
                  <Bar dataKey="impact" fill="#8884d8" name="Effectiveness" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Adaptive Learning Insights</CardTitle>
          <CardDescription>Real-time insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adaptationInsights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={insight.impact > 0.7 ? 'default' : insight.impact > 0.4 ? 'secondary' : 'outline'}>
                    {Math.round(insight.impact * 100)}% Impact
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.trend === 'improving' ? '↗' : insight.trend === 'declining' ? '↘' : '→'} {insight.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adaptive Learning Center</h1>
          <p className="text-muted-foreground">
            Personalized ML education with intelligent adaptation and real-time optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoAdaptation}
              onCheckedChange={setAutoAdaptation}
            />
            <Label className="text-sm">Auto Adaptation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={realTimeTracking}
              onCheckedChange={setRealTimeTracking}
            />
            <Label className="text-sm">Real-time Tracking</Label>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAdaptationDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button onClick={() => setShowCreatePathDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Path
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      {currentSession && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>Learning Session Active</AlertTitle>
          <AlertDescription>
            Session started {formatDistanceToNow(parseISO(currentSession.startTime), { addSuffix: true })}
            {realTimeTracking && " • Real-time tracking enabled"}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          {/* Filters and Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search learning paths..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-80"
                    />
                  </div>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="graph">Graph</SelectItem>
                      <SelectItem value="timeline">Timeline</SelectItem>
                      <SelectItem value="tree">Tree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setShowCreatePathDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Path
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Learning Paths Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPaths.map(path => renderPathCard(path))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredPaths.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Route className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Learning Paths Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery || difficultyFilter !== 'all' 
                    ? 'Try adjusting your search criteria or filters'
                    : 'Get started by creating your first learning path'
                  }
                </p>
                {!searchQuery && difficultyFilter === 'all' && (
                  <Button onClick={() => setShowCreatePathDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Learning Path
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-6">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Curriculum Management</h3>
            <p className="text-muted-foreground">
              Advanced curriculum design and management tools coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Learning Analytics</h3>
            <p className="text-muted-foreground">
              Comprehensive learning analytics and insights dashboard
            </p>
          </div>
        </TabsContent>

        <TabsContent value="personalization" className="space-y-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Personalization Engine</h3>
            <p className="text-muted-foreground">
              AI-powered personalization and adaptation settings
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Path Dialog */}
      <Dialog open={showCreatePathDialog} onOpenChange={setShowCreatePathDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Learning Path</DialogTitle>
            <DialogDescription>
              Design a new adaptive learning path with personalized content and intelligent progression.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="path-name">Path Name</Label>
                <Input
                  id="path-name"
                  value={newPathForm.name}
                  onChange={(e) => setNewPathForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter path name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  id="target-audience"
                  value={newPathForm.targetAudience}
                  onChange={(e) => setNewPathForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., Beginners, Data Scientists"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="path-description">Description</Label>
              <Textarea
                id="path-description"
                value={newPathForm.description}
                onChange={(e) => setNewPathForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the learning path objectives and content"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={newPathForm.difficulty}
                  onValueChange={(value) => setNewPathForm(prev => ({ ...prev, difficulty: value as DifficultyLevel }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newPathForm.estimatedDuration}
                  onChange={(e) => setNewPathForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowCreatePathDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePath}>
                <Plus className="h-4 w-4 mr-2" />
                Create Path
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adaptation Configuration Dialog */}
      <Dialog open={showAdaptationDialog} onOpenChange={setShowAdaptationDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adaptation Configuration</DialogTitle>
            <DialogDescription>
              Configure adaptive learning strategies and personalization settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Intelligent Adaptation</h3>
              <p className="text-muted-foreground">
                Advanced adaptation configuration tools will be available soon
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAdaptationDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdaptiveLearningCenter;