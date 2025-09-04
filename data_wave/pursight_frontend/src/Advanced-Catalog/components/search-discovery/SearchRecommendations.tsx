'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import { Search, Lightbulb, Target, TrendingUp, Activity, Users, Brain, Sparkles, Star, ThumbsUp, ThumbsDown, BookOpen, Filter, Settings, RefreshCw, MoreVertical, Eye, Share, Heart, Clock, AlertCircle, CheckCircle, ArrowRight, ArrowUp, ArrowDown, Plus, Minus, X, ChevronRight, ChevronDown, Info, Zap, Globe, Database, FileText, Tag, Folder, Calendar, BarChart3, PieChart as PieChartIcon, Workflow, Network, Cpu, Bot, Gauge, Map, Bookmark, MessageSquare, Edit, Trash2, Download, Upload, Save, Copy, ExternalLink, Maximize, Minimize, RotateCw, Play, Pause, FastForward, Rewind, SkipForward, Volume2, ToggleLeft, ToggleRight, Layers, GitBranch, Shuffle, Repeat, Hash, Percent, DollarSign, TrendingDown, BarChart2 } from 'lucide-react';

// Hook imports
import { useCatalogRecommendations } from '../../hooks/useCatalogRecommendations';
import { semanticSearchService } from '../../services/semantic-search.service';

// Type imports
import {
  AssetRecommendation,
  SearchRecommendationType,
  PersonalizedSearchRecommendation,
  IntelligentDataAsset,
  SearchRequest,
  SearchResponse
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface SearchRecommendationsProps {
  userId?: string;
  currentQuery?: string;
  context?: Record<string, any>;
  onRecommendationSelect?: (recommendation: AssetRecommendation) => void;
  onRecommendationFeedback?: (recommendationId: string, feedback: RecommendationFeedback) => void;
  onError?: (error: Error) => void;
}

interface RecommendationsState {
  currentUserId: string;
  activeRecommendationType: SearchRecommendationType;
  recommendationStrength: number;
  enableRealTimeRecommendations: boolean;
  enableCollaborativeFiltering: boolean;
  enableContentBased: boolean;
  enableTrendingRecommendations: boolean;
  enableSemanticRecommendations: boolean;
  activeTab: string;
  selectedCategory: string;
  confidenceThreshold: number;
  maxRecommendations: number;
  contextAwareness: boolean;
  learningEnabled: boolean;
}

interface RecommendationFilters {
  categories?: string[];
  confidenceLevel?: number;
  timeRange?: { start: Date; end: Date };
  userSegments?: string[];
  assetTypes?: string[];
  departments?: string[];
  searchTerm: string;
  includePersonalized?: boolean;
  includeTrending?: boolean;
  includePopular?: boolean;
}

interface RecommendationFeedback {
  type: 'LIKE' | 'DISLIKE' | 'IRRELEVANT' | 'HELPFUL' | 'NOT_HELPFUL';
  comment?: string;
  rating?: number;
  context?: Record<string, any>;
}

interface RecommendationEngine {
  id: string;
  name: string;
  type: 'COLLABORATIVE' | 'CONTENT_BASED' | 'HYBRID' | 'KNOWLEDGE_BASED' | 'DEEP_LEARNING';
  algorithm: string;
  confidence: number;
  performance: EnginePerformance;
  status: 'ACTIVE' | 'INACTIVE' | 'TRAINING' | 'OPTIMIZING';
  lastTrained: Date;
  trainingData: {
    interactions: number;
    users: number;
    assets: number;
    accuracy: number;
  };
  parameters: Record<string, any>;
}

interface EnginePerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  coverage: number;
  diversity: number;
  novelty: number;
  serendipity: number;
  responseTime: number;
  userSatisfaction: number;
}

interface RecommendationPattern {
  id: string;
  patternType: 'SEQUENTIAL' | 'ASSOCIATIVE' | 'TEMPORAL' | 'CONTEXTUAL' | 'BEHAVIORAL';
  description: string;
  frequency: number;
  confidence: number;
  users: number;
  examples: PatternExample[];
  recommendations: string[];
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  lastObserved: Date;
}

interface PatternExample {
  sequence: string[];
  frequency: number;
  successRate: number;
  avgRating: number;
}

interface RecommendationInsight {
  id: string;
  type: 'TRENDING' | 'EMERGING' | 'SEASONAL' | 'COLLABORATIVE' | 'CONTENT_SIMILARITY';
  title: string;
  description: string;
  confidence: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assets: IntelligentDataAsset[];
  users: number;
  trend: TrendData[];
  actionItems: InsightAction[];
  createdAt: Date;
}

interface TrendData {
  timestamp: Date;
  value: number;
  change: number;
  users: number;
}

interface InsightAction {
  id: string;
  title: string;
  description: string;
  type: 'FEATURE_ASSET' | 'PROMOTE_CONTENT' | 'IMPROVE_METADATA' | 'CREATE_COLLECTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedImpact: string;
  effort: string;
}

interface UserRecommendationProfile {
  userId: string;
  preferences: UserPreferences;
  behavior: BehaviorProfile;
  interests: Interest[];
  collaborativeGroups: string[];
  recommendationHistory: RecommendationHistory[];
  feedback: FeedbackSummary;
  effectiveness: ProfileEffectiveness;
}

interface UserPreferences {
  assetTypes: string[];
  departments: string[];
  topics: string[];
  complexity: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  recency: 'LATEST' | 'POPULAR' | 'BALANCED';
  diversity: number;
  explainability: boolean;
}

interface BehaviorProfile {
  searchPatterns: string[];
  interactionTypes: string[];
  sessionDuration: number;
  queryComplexity: number;
  explorationLevel: number;
  focusAreas: string[];
  peakHours: number[];
  devicePreferences: string[];
}

interface Interest {
  topic: string;
  strength: number;
  recency: number;
  growth: number;
  related: string[];
}

interface RecommendationHistory {
  recommendationId: string;
  timestamp: Date;
  type: SearchRecommendationType;
  asset: IntelligentDataAsset;
  context: Record<string, any>;
  feedback?: RecommendationFeedback;
  outcome: 'CLICKED' | 'SAVED' | 'SHARED' | 'IGNORED' | 'DISMISSED';
}

interface FeedbackSummary {
  totalFeedback: number;
  positiveRatio: number;
  avgRating: number;
  commonComplaints: string[];
  preferences: string[];
}

interface ProfileEffectiveness {
  accuracy: number;
  satisfaction: number;
  engagement: number;
  discovery: number;
  retention: number;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockRecommendationEngines = (): RecommendationEngine[] => {
  const algorithms = ['Matrix Factorization', 'Deep Learning', 'Content-Based Filtering', 'Collaborative Filtering', 'Hybrid Model'];
  const types: ('COLLABORATIVE' | 'CONTENT_BASED' | 'HYBRID' | 'KNOWLEDGE_BASED' | 'DEEP_LEARNING')[] = 
    ['COLLABORATIVE', 'CONTENT_BASED', 'HYBRID', 'KNOWLEDGE_BASED', 'DEEP_LEARNING'];
  
  return Array.from({ length: 6 }, (_, i) => ({
    id: `engine_${i + 1}`,
    name: `${algorithms[i % algorithms.length]} Engine`,
    type: types[i % types.length],
    algorithm: algorithms[i % algorithms.length],
    confidence: 70 + Math.random() * 30,
    performance: {
      accuracy: 70 + Math.random() * 30,
      precision: 65 + Math.random() * 35,
      recall: 60 + Math.random() * 40,
      f1Score: 65 + Math.random() * 35,
      coverage: 80 + Math.random() * 20,
      diversity: 60 + Math.random() * 40,
      novelty: 50 + Math.random() * 50,
      serendipity: 40 + Math.random() * 60,
      responseTime: Math.random() * 200 + 50,
      userSatisfaction: 70 + Math.random() * 30
    },
    status: ['ACTIVE', 'INACTIVE', 'TRAINING'][Math.floor(Math.random() * 3)] as any,
    lastTrained: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    trainingData: {
      interactions: Math.floor(Math.random() * 1000000) + 100000,
      users: Math.floor(Math.random() * 10000) + 1000,
      assets: Math.floor(Math.random() * 50000) + 5000,
      accuracy: 70 + Math.random() * 30
    },
    parameters: {
      learningRate: 0.01 + Math.random() * 0.09,
      regularization: Math.random() * 0.1,
      factors: Math.floor(Math.random() * 200) + 50
    }
  }));
};

const generateMockRecommendations = (): AssetRecommendation[] => {
  const types: SearchRecommendationType[] = ['QUERY_SUGGESTION', 'RESULT_RECOMMENDATION', 'FILTER_SUGGESTION', 'SIMILAR_SEARCH', 'TRENDING_SEARCH', 'PERSONALIZED'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `rec_${i + 1}`,
    type: types[i % types.length],
    title: `Recommended Asset ${i + 1}`,
    description: `AI-generated recommendation based on your search patterns and preferences`,
    asset: {
      id: `asset_${i + 1}`,
      name: `Data Asset ${i + 1}`,
      type: ['TABLE', 'VIEW', 'REPORT', 'DASHBOARD'][i % 4],
      description: `Description for asset ${i + 1}`,
      tags: [`tag_${i + 1}`, `category_${(i % 5) + 1}`],
      owner: `user_${(i % 10) + 1}`,
      department: ['Engineering', 'Marketing', 'Sales', 'Finance'][i % 4],
      popularity: Math.random() * 100,
      qualityScore: 70 + Math.random() * 30,
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    } as IntelligentDataAsset,
    score: Math.random() * 100,
    confidence: 60 + Math.random() * 40,
    reason: `Based on ${['similar searches', 'user behavior', 'content similarity', 'collaborative filtering'][i % 4]}`,
    context: {
      source: 'AI Recommendation Engine',
      algorithm: ['Collaborative Filtering', 'Content-Based', 'Hybrid Model'][i % 3],
      factors: [`factor_${i + 1}`, `pattern_${i + 1}`]
    },
    metadata: {
      category: ['Trending', 'Popular', 'Personalized', 'Similar'][i % 4],
      freshness: Math.random() * 10,
      relevance: Math.random() * 100,
      novelty: Math.random() * 100
    },
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }));
};

const generateMockPatterns = (): RecommendationPattern[] => {
  const patternTypes: ('SEQUENTIAL' | 'ASSOCIATIVE' | 'TEMPORAL' | 'CONTEXTUAL' | 'BEHAVIORAL')[] = 
    ['SEQUENTIAL', 'ASSOCIATIVE', 'TEMPORAL', 'CONTEXTUAL', 'BEHAVIORAL'];
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: `pattern_${i + 1}`,
    patternType: patternTypes[i % patternTypes.length],
    description: `${patternTypes[i % patternTypes.length].toLowerCase()} pattern detected in user search behavior`,
    frequency: Math.floor(Math.random() * 1000) + 100,
    confidence: 60 + Math.random() * 40,
    users: Math.floor(Math.random() * 500) + 50,
    examples: [
      {
        sequence: [`step_${i + 1}`, `step_${i + 2}`, `step_${i + 3}`],
        frequency: Math.floor(Math.random() * 100) + 10,
        successRate: Math.random() * 100,
        avgRating: 3 + Math.random() * 2
      }
    ],
    recommendations: [`Optimize for ${patternTypes[i % patternTypes.length].toLowerCase()} searches`],
    trend: (['INCREASING', 'DECREASING', 'STABLE'] as const)[i % 3],
    lastObserved: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  }));
};

const generateMockInsights = (): RecommendationInsight[] => {
  const types: ('TRENDING' | 'EMERGING' | 'SEASONAL' | 'COLLABORATIVE' | 'CONTENT_SIMILARITY')[] = 
    ['TRENDING', 'EMERGING', 'SEASONAL', 'COLLABORATIVE', 'CONTENT_SIMILARITY'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `insight_${i + 1}`,
    type: types[i % types.length],
    title: `${types[i % types.length]} Insight ${i + 1}`,
    description: `AI-detected insight about search recommendation patterns and opportunities`,
    confidence: 60 + Math.random() * 40,
    impact: (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const)[i % 4],
    assets: [],
    users: Math.floor(Math.random() * 1000) + 100,
    trend: Array.from({ length: 30 }, (_, j) => ({
      timestamp: new Date(Date.now() - (29 - j) * 24 * 60 * 60 * 1000),
      value: 50 + Math.random() * 100,
      change: (Math.random() - 0.5) * 20,
      users: Math.floor(Math.random() * 100) + 10
    })),
    actionItems: [
      {
        id: `action_${i + 1}`,
        title: `Improve ${types[i % types.length].toLowerCase()} recommendations`,
        description: 'Enhance recommendation quality and relevance',
        type: ['FEATURE_ASSET', 'PROMOTE_CONTENT', 'IMPROVE_METADATA', 'CREATE_COLLECTION'][i % 4] as any,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][i % 4] as any,
        estimatedImpact: `${10 + Math.random() * 40}% improvement`,
        effort: `${1 + Math.floor(Math.random() * 4)} weeks`
      }
    ],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  }));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SearchRecommendations: React.FC<SearchRecommendationsProps> = ({
  userId = 'user_1',
  currentQuery,
  context,
  onRecommendationSelect,
  onRecommendationFeedback,
  onError
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const recommendationsHook = useCatalogRecommendations({
    userId,
    enableRealTimeUpdates: true,
    autoRefreshInterval: 30000
  });

  // Local State
  const [state, setState] = useState<RecommendationsState>({
    currentUserId: userId,
    activeRecommendationType: 'PERSONALIZED',
    recommendationStrength: 80,
    enableRealTimeRecommendations: true,
    enableCollaborativeFiltering: true,
    enableContentBased: true,
    enableTrendingRecommendations: true,
    enableSemanticRecommendations: true,
    activeTab: 'recommendations',
    selectedCategory: 'ALL',
    confidenceThreshold: 70,
    maxRecommendations: 10,
    contextAwareness: true,
    learningEnabled: true
  });

  const [filters, setFilters] = useState<RecommendationFilters>({
    searchTerm: '',
    includePersonalized: true,
    includeTrending: true,
    includePopular: true,
    confidenceLevel: 70
  });

  const [isEngineDialogOpen, setIsEngineDialogOpen] = useState(false);
  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<RecommendationEngine | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<RecommendationInsight | null>(null);

  // Mock data (in production, this would come from the hooks)
  const [mockEngines] = useState(() => generateMockRecommendationEngines());
  const [mockRecommendations] = useState(() => generateMockRecommendations());
  const [mockPatterns] = useState(() => generateMockPatterns());
  const [mockInsights] = useState(() => generateMockInsights());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredRecommendations = useMemo(() => {
    return mockRecommendations.filter(rec => {
      if (filters.searchTerm && !rec.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.confidenceLevel && rec.confidence < filters.confidenceLevel) {
        return false;
      }
      if (state.selectedCategory !== 'ALL' && rec.type !== state.selectedCategory) {
        return false;
      }
      return true;
    });
  }, [mockRecommendations, filters, state.selectedCategory]);

  const activeEngines = useMemo(() => {
    return mockEngines.filter(engine => engine.status === 'ACTIVE');
  }, [mockEngines]);

  const overallPerformance = useMemo(() => {
    if (activeEngines.length === 0) return { accuracy: 0, satisfaction: 0, coverage: 0 };
    
    const avgAccuracy = activeEngines.reduce((sum, engine) => sum + engine.performance.accuracy, 0) / activeEngines.length;
    const avgSatisfaction = activeEngines.reduce((sum, engine) => sum + engine.performance.userSatisfaction, 0) / activeEngines.length;
    const avgCoverage = activeEngines.reduce((sum, engine) => sum + engine.performance.coverage, 0) / activeEngines.length;
    
    return {
      accuracy: avgAccuracy,
      satisfaction: avgSatisfaction,
      coverage: avgCoverage
    };
  }, [activeEngines]);

  const highImpactInsights = useMemo(() => {
    return mockInsights.filter(insight => insight.impact === 'HIGH' || insight.impact === 'CRITICAL');
  }, [mockInsights]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRecommendationSelect = useCallback((recommendation: AssetRecommendation) => {
    onRecommendationSelect?.(recommendation);
    
    // Track interaction for learning
    console.log('Recommendation selected:', recommendation);
  }, [onRecommendationSelect]);

  const handleRecommendationFeedback = useCallback((recommendationId: string, feedback: RecommendationFeedback) => {
    onRecommendationFeedback?.(recommendationId, feedback);
    
    // Update learning algorithms
    console.log('Feedback provided:', recommendationId, feedback);
  }, [onRecommendationFeedback]);

  const handleFilterChange = useCallback((key: keyof RecommendationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleStateChange = useCallback((updates: Partial<RecommendationsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleRefresh = useCallback(async () => {
    await recommendationsHook.refreshRecommendations();
  }, [recommendationsHook]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Active Recommendations</CardTitle>
          <Lightbulb className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{filteredRecommendations.length}</div>
          <p className="text-xs text-blue-600 mt-1">
            {filteredRecommendations.filter(r => r.confidence > 80).length} high confidence
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Engine Performance</CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{Math.round(overallPerformance.accuracy)}%</div>
          <Progress value={overallPerformance.accuracy} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">User Satisfaction</CardTitle>
          <Star className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{Math.round(overallPerformance.satisfaction)}%</div>
          <Progress value={overallPerformance.satisfaction} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Active Engines</CardTitle>
          <Brain className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{activeEngines.length}</div>
          <p className="text-xs text-orange-600 mt-1">
            {mockEngines.filter(e => e.status === 'TRAINING').length} training
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecommendationCard = (recommendation: AssetRecommendation) => (
    <Card key={recommendation.id} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              recommendation.type === 'PERSONALIZED' ? 'bg-blue-100 text-blue-600' :
              recommendation.type === 'TRENDING_SEARCH' ? 'bg-green-100 text-green-600' :
              recommendation.type === 'SIMILAR_SEARCH' ? 'bg-purple-100 text-purple-600' :
              recommendation.type === 'QUERY_SUGGESTION' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {recommendation.type === 'PERSONALIZED' ? <Users className="h-4 w-4" /> :
               recommendation.type === 'TRENDING_SEARCH' ? <TrendingUp className="h-4 w-4" /> :
               recommendation.type === 'SIMILAR_SEARCH' ? <Search className="h-4 w-4" /> :
               recommendation.type === 'QUERY_SUGGESTION' ? <Lightbulb className="h-4 w-4" /> :
               <Brain className="h-4 w-4" />}
            </div>
            <div>
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              <CardDescription>{recommendation.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(recommendation.confidence)}% confidence
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleRecommendationSelect(recommendation)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Asset
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRecommendationFeedback(recommendation.id, { type: 'LIKE' })}>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Like
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRecommendationFeedback(recommendation.id, { type: 'DISLIKE' })}>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Dislike
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Relevance Score</p>
              <p className="text-lg font-semibold">{Math.round(recommendation.score)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Asset Type</p>
              <Badge variant="secondary">{recommendation.asset.type}</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Recommendation Reason:</p>
            <p className="text-sm">{recommendation.reason}</p>
          </div>

          {recommendation.asset && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{recommendation.asset.name}</h4>
                <Badge variant="outline" className="text-xs">{recommendation.asset.department}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{recommendation.asset.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Quality: {Math.round(recommendation.asset.qualityScore)}%</span>
                <span>Owner: {recommendation.asset.owner}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="text-xs">{recommendation.metadata?.category}</Badge>
              <Badge variant="outline" className="text-xs">{recommendation.type}</Badge>
            </div>
            <Button size="sm" onClick={() => handleRecommendationSelect(recommendation)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Explore
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEnginesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recommendation Engines</h3>
        <Button onClick={() => setIsEngineDialogOpen(true)}>
          <Brain className="h-4 w-4 mr-2" />
          Configure Engines
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockEngines.map((engine) => (
          <Card key={engine.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{engine.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{engine.type}</Badge>
                    <Badge variant={
                      engine.status === 'ACTIVE' ? 'default' :
                      engine.status === 'TRAINING' ? 'secondary' :
                      'destructive'
                    }>
                      {engine.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(engine.performance.accuracy)}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Precision</p>
                    <p className="font-semibold">{Math.round(engine.performance.precision)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recall</p>
                    <p className="font-semibold">{Math.round(engine.performance.recall)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">F1 Score</p>
                    <p className="font-semibold">{Math.round(engine.performance.f1Score)}%</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Coverage</span>
                    <span>{Math.round(engine.performance.coverage)}%</span>
                  </div>
                  <Progress value={engine.performance.coverage} />
                  
                  <div className="flex justify-between text-sm">
                    <span>User Satisfaction</span>
                    <span>{Math.round(engine.performance.userSatisfaction)}%</span>
                  </div>
                  <Progress value={engine.performance.userSatisfaction} />
                  
                  <div className="flex justify-between text-sm">
                    <span>Diversity</span>
                    <span>{Math.round(engine.performance.diversity)}%</span>
                  </div>
                  <Progress value={engine.performance.diversity} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <span>Training Data:</span>
                    <div className="mt-1">
                      <div>{engine.trainingData.interactions.toLocaleString()} interactions</div>
                      <div>{engine.trainingData.users.toLocaleString()} users</div>
                      <div>{engine.trainingData.assets.toLocaleString()} assets</div>
                    </div>
                  </div>
                  <div>
                    <span>Performance:</span>
                    <div className="mt-1">
                      <div>Response: {Math.round(engine.performance.responseTime)}ms</div>
                      <div>Novelty: {Math.round(engine.performance.novelty)}%</div>
                      <div>Serendipity: {Math.round(engine.performance.serendipity)}%</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Last trained: {engine.lastTrained.toLocaleDateString()}</span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedEngine(engine)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPatternsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pattern Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(
                  mockPatterns.reduce((acc, pattern) => {
                    acc[pattern.patternType] = (acc[pattern.patternType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(
                  mockPatterns.reduce((acc, pattern) => {
                    acc[pattern.patternType] = (acc[pattern.patternType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {mockPatterns.map((pattern) => (
          <Card key={pattern.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    pattern.patternType === 'SEQUENTIAL' ? 'bg-blue-100 text-blue-600' :
                    pattern.patternType === 'ASSOCIATIVE' ? 'bg-green-100 text-green-600' :
                    pattern.patternType === 'TEMPORAL' ? 'bg-purple-100 text-purple-600' :
                    pattern.patternType === 'CONTEXTUAL' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {pattern.patternType === 'SEQUENTIAL' ? <ArrowRight className="h-4 w-4" /> :
                     pattern.patternType === 'ASSOCIATIVE' ? <Network className="h-4 w-4" /> :
                     pattern.patternType === 'TEMPORAL' ? <Clock className="h-4 w-4" /> :
                     pattern.patternType === 'CONTEXTUAL' ? <Globe className="h-4 w-4" /> :
                     <Activity className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pattern.patternType} Pattern</CardTitle>
                    <CardDescription>{pattern.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={
                  pattern.trend === 'INCREASING' ? 'default' :
                  pattern.trend === 'DECREASING' ? 'destructive' :
                  'secondary'
                }>
                  {pattern.trend === 'INCREASING' ? <ArrowUp className="h-3 w-3 mr-1" /> :
                   pattern.trend === 'DECREASING' ? <ArrowDown className="h-3 w-3 mr-1" /> :
                   <Minus className="h-3 w-3 mr-1" />}
                  {pattern.trend}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Frequency</p>
                  <p className="text-lg font-semibold">{pattern.frequency}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-lg font-semibold">{Math.round(pattern.confidence)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Users</p>
                  <p className="text-lg font-semibold">{pattern.users}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence</span>
                  <span>{Math.round(pattern.confidence)}%</span>
                </div>
                <Progress value={pattern.confidence} />
              </div>

              {pattern.examples.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Example Sequences:</p>
                  {pattern.examples.map((example, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        {example.sequence.map((step, stepIdx) => (
                          <React.Fragment key={stepIdx}>
                            <Badge variant="outline" className="text-xs">{step}</Badge>
                            {stepIdx < example.sequence.length - 1 && <ArrowRight className="h-3 w-3" />}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        Frequency: {example.frequency} | Success: {Math.round(example.successRate)}% | Rating: {example.avgRating.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Last observed: {pattern.lastObserved.toLocaleDateString()}</span>
                <span>Recommendations: {pattern.recommendations.length}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {mockInsights.map((insight) => (
          <Card key={insight.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'TRENDING' ? 'bg-green-100 text-green-600' :
                    insight.type === 'EMERGING' ? 'bg-blue-100 text-blue-600' :
                    insight.type === 'SEASONAL' ? 'bg-orange-100 text-orange-600' :
                    insight.type === 'COLLABORATIVE' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {insight.type === 'TRENDING' ? <TrendingUp className="h-4 w-4" /> :
                     insight.type === 'EMERGING' ? <Sparkles className="h-4 w-4" /> :
                     insight.type === 'SEASONAL' ? <Calendar className="h-4 w-4" /> :
                     insight.type === 'COLLABORATIVE' ? <Users className="h-4 w-4" /> :
                     <Search className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <CardDescription>{insight.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={
                  insight.impact === 'CRITICAL' ? 'destructive' :
                  insight.impact === 'HIGH' ? 'destructive' :
                  insight.impact === 'MEDIUM' ? 'secondary' :
                  'default'
                }>
                  {insight.impact}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-semibold">{Math.round(insight.confidence)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Affected Users</p>
                    <p className="text-lg font-semibold">{insight.users.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confidence Level</span>
                    <span>{Math.round(insight.confidence)}%</span>
                  </div>
                  <Progress value={insight.confidence} />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Trend Analysis</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={insight.trend.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <YAxis />
                      <RechartsTooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {insight.actionItems.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommended Actions</h4>
                    <div className="space-y-2">
                      {insight.actionItems.map((action, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{action.title}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">{action.type}</Badge>
                              <Badge variant={
                                action.priority === 'URGENT' ? 'destructive' :
                                action.priority === 'HIGH' ? 'destructive' :
                                'secondary'
                              } className="text-xs">
                                {action.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <span>Impact: {action.estimatedImpact}</span>
                            <span>Effort: {action.effort}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Discovered: {insight.createdAt.toLocaleDateString()}</span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedInsight(insight)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search Recommendations</h1>
            <p className="text-gray-600 mt-1">AI-powered intelligent search suggestions and personalized recommendations</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleRefresh} disabled={recommendationsHook.isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${recommendationsHook.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsEngineDialogOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={state.selectedCategory} onValueChange={(value) => handleStateChange({ selectedCategory: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="PERSONALIZED">Personalized</SelectItem>
                    <SelectItem value="TRENDING_SEARCH">Trending</SelectItem>
                    <SelectItem value="SIMILAR_SEARCH">Similar</SelectItem>
                    <SelectItem value="QUERY_SUGGESTION">Suggestions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Confidence Level (%)</Label>
                <Input
                  type="number"
                  value={filters.confidenceLevel || ''}
                  onChange={(e) => handleFilterChange('confidenceLevel', parseFloat(e.target.value) || undefined)}
                  min="0"
                  max="100"
                  placeholder="70"
                />
              </div>
              <div>
                <Label>Max Recommendations</Label>
                <Select value={state.maxRecommendations.toString()} onValueChange={(value) => handleStateChange({ maxRecommendations: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Search Recommendations</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    placeholder="Search recommendations..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        {renderOverviewCards()}

        {/* Recommendation Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Recommendation Strength: {state.recommendationStrength}%</Label>
                  <Slider
                    value={[state.recommendationStrength]}
                    onValueChange={([value]) => handleStateChange({ recommendationStrength: value })}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="real-time-recs"
                      checked={state.enableRealTimeRecommendations}
                      onCheckedChange={(checked) => handleStateChange({ enableRealTimeRecommendations: checked })}
                    />
                    <Label htmlFor="real-time-recs">Real-time Recommendations</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="collaborative-filtering"
                      checked={state.enableCollaborativeFiltering}
                      onCheckedChange={(checked) => handleStateChange({ enableCollaborativeFiltering: checked })}
                    />
                    <Label htmlFor="collaborative-filtering">Collaborative Filtering</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="content-based"
                      checked={state.enableContentBased}
                      onCheckedChange={(checked) => handleStateChange({ enableContentBased: checked })}
                    />
                    <Label htmlFor="content-based">Content-based Recommendations</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="trending-recs"
                      checked={state.enableTrendingRecommendations}
                      onCheckedChange={(checked) => handleStateChange({ enableTrendingRecommendations: checked })}
                    />
                    <Label htmlFor="trending-recs">Trending Recommendations</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="semantic-recs"
                      checked={state.enableSemanticRecommendations}
                      onCheckedChange={(checked) => handleStateChange({ enableSemanticRecommendations: checked })}
                    />
                    <Label htmlFor="semantic-recs">Semantic Recommendations</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="context-awareness"
                      checked={state.contextAwareness}
                      onCheckedChange={(checked) => handleStateChange({ contextAwareness: checked })}
                    />
                    <Label htmlFor="context-awareness">Context Awareness</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="learning-enabled"
                      checked={state.learningEnabled}
                      onCheckedChange={(checked) => handleStateChange({ learningEnabled: checked })}
                    />
                    <Label htmlFor="learning-enabled">Learning from Feedback</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="engines">Engines</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              {filteredRecommendations.slice(0, state.maxRecommendations).map(renderRecommendationCard)}
            </div>
          </TabsContent>

          <TabsContent value="engines">
            {renderEnginesTab()}
          </TabsContent>

          <TabsContent value="patterns">
            {renderPatternsTab()}
          </TabsContent>

          <TabsContent value="insights">
            {renderInsightsTab()}
          </TabsContent>
        </Tabs>

        {/* Engine Configuration Dialog */}
        <Dialog open={isEngineDialogOpen} onOpenChange={setIsEngineDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Recommendation Engines</DialogTitle>
              <DialogDescription>
                Adjust recommendation engine settings and parameters
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Primary Recommendation Type</Label>
                <Select value={state.activeRecommendationType} onValueChange={(value: any) => handleStateChange({ activeRecommendationType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONALIZED">Personalized</SelectItem>
                    <SelectItem value="TRENDING_SEARCH">Trending</SelectItem>
                    <SelectItem value="SIMILAR_SEARCH">Similar</SelectItem>
                    <SelectItem value="QUERY_SUGGESTION">Query Suggestions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Confidence Threshold (%)</Label>
                  <Input
                    type="number"
                    value={state.confidenceThreshold}
                    onChange={(e) => handleStateChange({ confidenceThreshold: parseInt(e.target.value) || 70 })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Max Recommendations</Label>
                  <Input
                    type="number"
                    value={state.maxRecommendations}
                    onChange={(e) => handleStateChange({ maxRecommendations: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <Label>Engine Performance Summary</Label>
                <div className="mt-2 p-4 border rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-lg font-semibold">{Math.round(overallPerformance.accuracy)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Satisfaction</p>
                      <p className="text-lg font-semibold">{Math.round(overallPerformance.satisfaction)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coverage</p>
                      <p className="text-lg font-semibold">{Math.round(overallPerformance.coverage)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEngineDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEngineDialogOpen(false)}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default SearchRecommendations;