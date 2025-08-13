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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  LineChart,
  Sankey
} from 'recharts';

import {
  User,
  Search,
  Brain,
  TrendingUp,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Settings,
  RefreshCw,
  Play,
  Pause,
  MoreVertical,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Zap,
  Database,
  Microscope,
  Calculator,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Table as TableIcon,
  FileText,
  Save,
  Share,
  Copy,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Clock4,
  Shield,
  AlertTriangle,
  Star,
  TrendingDown,
  Layers,
  Hash,
  Type,
  Globe,
  Binary,
  Calendar as DateIcon,
  Percent,
  Ruler,
  BarChart2,
  PlusCircle,
  MinusCircle,
  FileBarChart,
  Bot,
  Cpu,
  Network,
  Workflow,
  Sparkles,
  ChartLine,
  GitBranch,
  Users,
  Timer,
  Gauge,
  BarChart3,
  PieChart as PieIcon,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Minus,
  Plus,
  X,
  Check,
  ExternalLink,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Maximize,
  Minimize,
  UserCheck,
  BookOpen,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Tag,
  Folder,
  FolderOpen,
  History,
  Map,
  Compass,
  Navigation,
  Route,
  MapPin,
  Locate,
  Move,
  RotateClockwise,
  Shuffle,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  Signal,
  Smartphone
} from 'lucide-react';

// Hook imports
import { useCatalogRecommendations } from '../../hooks/useCatalogRecommendations';
import { semanticSearchService } from '../../services/semantic-search.service';

// Type imports
import {
  SearchPersonalization,
  SearchPreferences,
  SearchHistoryItem,
  UserSearchProfile,
  SearchBehaviorProfile,
  PersonalSearchContext,
  PersonalizedSearchRecommendation,
  AssetRecommendation,
  IntelligentDataAsset,
  SearchRequest,
  SearchResponse
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface SearchPersonalizationProps {
  userId?: string;
  onSearchPersonalized?: (personalization: SearchPersonalization) => void;
  onPreferencesUpdated?: (preferences: SearchPreferences) => void;
  onError?: (error: Error) => void;
}

interface PersonalizationState {
  currentUserId: string;
  activeProfile: UserSearchProfile | null;
  learningMode: 'AUTOMATIC' | 'MANUAL' | 'HYBRID';
  personalizationLevel: 'BASIC' | 'ADVANCED' | 'EXPERT';
  enableRealTimeAdaptation: boolean;
  enableBehaviorTracking: boolean;
  enableCollaborativeFiltering: boolean;
  enableContentBasedRecommendations: boolean;
  activeTab: string;
  showAdvancedSettings: boolean;
  adaptationStrength: number;
  privacyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  contextAwareness: boolean;
  crossDomainLearning: boolean;
}

interface PersonalizationFilters {
  timeRange?: { start: Date; end: Date };
  searchDomains?: string[];
  userSegments?: string[];
  behaviorTypes?: string[];
  confidenceLevel?: number;
  includeAnonymous?: boolean;
  searchTerm: string;
}

interface UserBehaviorPattern {
  id: string;
  patternType: 'SEARCH' | 'NAVIGATION' | 'INTERACTION' | 'TEMPORAL' | 'CONTEXTUAL';
  description: string;
  frequency: number;
  confidence: number;
  impact: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  lastObserved: Date;
  examples: string[];
  recommendations: string[];
}

interface PersonalizationInsight {
  id: string;
  type: 'PREFERENCE' | 'BEHAVIOR' | 'PATTERN' | 'OPPORTUNITY' | 'ANOMALY';
  title: string;
  description: string;
  confidence: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionable: boolean;
  recommendations: PersonalizationRecommendation[];
  evidence: InsightEvidence[];
  createdAt: Date;
}

interface PersonalizationRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'UI_ADJUSTMENT' | 'ALGORITHM_TUNING' | 'CONTENT_RECOMMENDATION' | 'WORKFLOW_OPTIMIZATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedImpact: string;
  implementationEffort: string;
  expectedResults: string[];
}

interface InsightEvidence {
  type: 'BEHAVIORAL' | 'STATISTICAL' | 'COMPARATIVE' | 'TEMPORAL';
  description: string;
  confidence: number;
  source: string;
  data?: any;
}

interface LearningSession {
  id: string;
  userId: string;
  sessionStart: Date;
  sessionEnd: Date;
  interactions: UserInteraction[];
  learningGoals: string[];
  outcomes: SessionOutcome[];
  adaptations: Adaptation[];
  feedback: UserFeedback[];
  metrics: SessionMetrics;
}

interface UserInteraction {
  id: string;
  timestamp: Date;
  type: 'SEARCH' | 'CLICK' | 'FILTER' | 'SORT' | 'SAVE' | 'SHARE' | 'RATE' | 'COMMENT';
  target: string;
  context: InteractionContext;
  outcome: 'SUCCESS' | 'PARTIAL' | 'FAILURE' | 'ABANDONED';
  feedbackProvided: boolean;
  learningValue: number;
}

interface InteractionContext {
  searchQuery?: string;
  filters?: Record<string, any>;
  resultPosition?: number;
  sessionDuration?: number;
  deviceType?: string;
  location?: string;
  timeOfDay?: string;
  userGoal?: string;
}

interface SessionOutcome {
  goal: string;
  achieved: boolean;
  confidence: number;
  timeToAchieve?: number;
  alternativePaths?: string[];
  barriers?: string[];
  satisfactionScore?: number;
}

interface Adaptation {
  id: string;
  type: 'RANKING' | 'FILTERING' | 'UI' | 'RECOMMENDATIONS' | 'SUGGESTIONS';
  description: string;
  trigger: string;
  parameters: Record<string, any>;
  expectedImpact: string;
  actualImpact?: string;
  effectiveness?: number;
  appliedAt: Date;
}

interface UserFeedback {
  id: string;
  type: 'EXPLICIT' | 'IMPLICIT' | 'RATING' | 'COMMENT' | 'BEHAVIOR';
  content: any;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number;
  context: string;
  timestamp: Date;
}

interface SessionMetrics {
  totalInteractions: number;
  successfulQueries: number;
  averageQueryTime: number;
  uniqueAssetsViewed: number;
  goalCompletionRate: number;
  userSatisfactionScore: number;
  learningEffectiveness: number;
  adaptationSuccess: number;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockUserProfiles = (): UserSearchProfile[] => {
  const departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'];
  const expertiseAreas = ['Data Science', 'Business Intelligence', 'Analytics', 'Reporting', 'Governance'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    userId: `user_${i + 1}`,
    department: departments[i % departments.length],
    role: `${expertiseAreas[i % expertiseAreas.length]} Specialist`,
    expertiseLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'][i % 4] as any,
    preferredDomains: ['DATA_ASSETS', 'BUSINESS_GLOSSARY', 'REPORTS'][Math.floor(Math.random() * 3)],
    searchFrequency: Math.floor(Math.random() * 50) + 10,
    avgSessionDuration: Math.floor(Math.random() * 20) + 5,
    topSearchTerms: [`term_${i + 1}`, `query_${i + 1}`, `asset_${i + 1}`],
    collaborationLevel: Math.random() * 100,
    learningStyle: ['VISUAL', 'ANALYTICAL', 'EXPLORATORY', 'STRUCTURED'][i % 4] as any,
    goalOrientation: ['DISCOVERY', 'EFFICIENCY', 'VALIDATION', 'EXPLORATION'][i % 4] as any,
    contextualPreferences: {
      timeOfDay: ['MORNING', 'AFTERNOON', 'EVENING'][i % 3],
      workMode: ['FOCUSED', 'EXPLORATORY', 'COLLABORATIVE'][i % 3],
      devicePreference: ['DESKTOP', 'MOBILE', 'TABLET'][i % 3]
    },
    adaptationHistory: [],
    lastUpdated: new Date()
  }));
};

const generateMockBehaviorPatterns = (): UserBehaviorPattern[] => {
  const patternTypes: ('SEARCH' | 'NAVIGATION' | 'INTERACTION' | 'TEMPORAL' | 'CONTEXTUAL')[] = 
    ['SEARCH', 'NAVIGATION', 'INTERACTION', 'TEMPORAL', 'CONTEXTUAL'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `pattern_${i + 1}`,
    patternType: patternTypes[i % patternTypes.length],
    description: `User tends to ${['search for specific terms', 'navigate hierarchically', 'interact with visual elements', 'search at specific times', 'prefer certain contexts'][i % 5]}`,
    frequency: Math.floor(Math.random() * 100) + 20,
    confidence: 60 + Math.random() * 40,
    impact: 40 + Math.random() * 60,
    trend: (['INCREASING', 'DECREASING', 'STABLE'] as const)[i % 3],
    lastObserved: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    examples: [`Example behavior ${i + 1}`, `Pattern instance ${i + 1}`],
    recommendations: [`Optimize for ${patternTypes[i % patternTypes.length].toLowerCase()} behavior`]
  }));
};

const generateMockPersonalizationInsights = (): PersonalizationInsight[] => {
  const types: ('PREFERENCE' | 'BEHAVIOR' | 'PATTERN' | 'OPPORTUNITY' | 'ANOMALY')[] = 
    ['PREFERENCE', 'BEHAVIOR', 'PATTERN', 'OPPORTUNITY', 'ANOMALY'];
  const impacts: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `insight_${i + 1}`,
    type: types[i % types.length],
    title: `Personalization Insight ${i + 1}`,
    description: `AI-detected insight about user search personalization patterns and opportunities for improvement`,
    confidence: 60 + Math.random() * 40,
    impact: impacts[i % impacts.length],
    actionable: Math.random() > 0.3,
    recommendations: [
      {
        id: `rec_${i + 1}`,
        title: `Improve ${types[i % types.length].toLowerCase()} handling`,
        description: 'Detailed recommendation for personalization enhancement',
        type: ['UI_ADJUSTMENT', 'ALGORITHM_TUNING', 'CONTENT_RECOMMENDATION', 'WORKFLOW_OPTIMIZATION'][i % 4] as any,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][i % 4] as any,
        estimatedImpact: `${10 + Math.random() * 40}% improvement`,
        implementationEffort: `${1 + Math.floor(Math.random() * 4)} weeks`,
        expectedResults: [`Better ${types[i % types.length].toLowerCase()} handling`, 'Improved user satisfaction']
      }
    ],
    evidence: [
      {
        type: ['BEHAVIORAL', 'STATISTICAL', 'COMPARATIVE', 'TEMPORAL'][i % 4] as any,
        description: 'Supporting evidence for the insight',
        confidence: 70 + Math.random() * 30,
        source: 'AI Analysis Engine',
        data: { metric: Math.random() * 100 }
      }
    ],
    createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
  }));
};

const generateMockLearningSessions = (): LearningSession[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `session_${i + 1}`,
    userId: `user_${(i % 8) + 1}`,
    sessionStart: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
    sessionEnd: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000),
    interactions: [],
    learningGoals: [`Goal ${i + 1}`, `Objective ${i + 1}`],
    outcomes: [
      {
        goal: `Goal ${i + 1}`,
        achieved: Math.random() > 0.3,
        confidence: 60 + Math.random() * 40,
        timeToAchieve: Math.floor(Math.random() * 300) + 60,
        satisfactionScore: 60 + Math.random() * 40
      }
    ],
    adaptations: [
      {
        id: `adaptation_${i + 1}`,
        type: ['RANKING', 'FILTERING', 'UI', 'RECOMMENDATIONS', 'SUGGESTIONS'][i % 5] as any,
        description: `Adaptation for session ${i + 1}`,
        trigger: 'User behavior pattern detected',
        parameters: { strength: Math.random() },
        expectedImpact: 'Improved search relevance',
        effectiveness: Math.random() * 100,
        appliedAt: new Date()
      }
    ],
    feedback: [],
    metrics: {
      totalInteractions: Math.floor(Math.random() * 50) + 10,
      successfulQueries: Math.floor(Math.random() * 20) + 5,
      averageQueryTime: Math.random() * 10 + 2,
      uniqueAssetsViewed: Math.floor(Math.random() * 30) + 5,
      goalCompletionRate: Math.random() * 100,
      userSatisfactionScore: 60 + Math.random() * 40,
      learningEffectiveness: Math.random() * 100,
      adaptationSuccess: Math.random() * 100
    }
  }));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SearchPersonalization: React.FC<SearchPersonalizationProps> = ({
  userId = 'user_1',
  onSearchPersonalized,
  onPreferencesUpdated,
  onError
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const recommendationsHook = useCatalogRecommendations({
    userId,
    enableRealTimeUpdates: true,
    autoRefreshInterval: 60000
  });

  // Local State
  const [state, setState] = useState<PersonalizationState>({
    currentUserId: userId,
    activeProfile: null,
    learningMode: 'HYBRID',
    personalizationLevel: 'ADVANCED',
    enableRealTimeAdaptation: true,
    enableBehaviorTracking: true,
    enableCollaborativeFiltering: true,
    enableContentBasedRecommendations: true,
    activeTab: 'overview',
    showAdvancedSettings: false,
    adaptationStrength: 75,
    privacyLevel: 'MEDIUM',
    contextAwareness: true,
    crossDomainLearning: true
  });

  const [filters, setFilters] = useState<PersonalizationFilters>({
    searchTerm: '',
    includeAnonymous: false,
    confidenceLevel: 70
  });

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);
  const [isLearningDialogOpen, setIsLearningDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null);

  // Mock data (in production, this would come from the hooks)
  const [mockUserProfiles] = useState(() => generateMockUserProfiles());
  const [mockBehaviorPatterns] = useState(() => generateMockBehaviorPatterns());
  const [mockPersonalizationInsights] = useState(() => generateMockPersonalizationInsights());
  const [mockLearningSessions] = useState(() => generateMockLearningSessions());

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentUserProfile = useMemo(() => {
    return mockUserProfiles.find(profile => profile.userId === state.currentUserId) || mockUserProfiles[0];
  }, [mockUserProfiles, state.currentUserId]);

  const filteredBehaviorPatterns = useMemo(() => {
    return mockBehaviorPatterns.filter(pattern => {
      if (filters.searchTerm && !pattern.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.confidenceLevel && pattern.confidence < filters.confidenceLevel) {
        return false;
      }
      return true;
    });
  }, [mockBehaviorPatterns, filters]);

  const filteredInsights = useMemo(() => {
    return mockPersonalizationInsights.filter(insight => {
      if (filters.searchTerm && !insight.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.confidenceLevel && insight.confidence < filters.confidenceLevel) {
        return false;
      }
      return true;
    });
  }, [mockPersonalizationInsights, filters]);

  const userLearningSessions = useMemo(() => {
    return mockLearningSessions.filter(session => session.userId === state.currentUserId);
  }, [mockLearningSessions, state.currentUserId]);

  const personalizationEffectiveness = useMemo(() => {
    if (userLearningSessions.length === 0) return 0;
    return userLearningSessions.reduce((sum, session) => sum + session.metrics.learningEffectiveness, 0) / userLearningSessions.length;
  }, [userLearningSessions]);

  const adaptationSuccessRate = useMemo(() => {
    if (userLearningSessions.length === 0) return 0;
    return userLearningSessions.reduce((sum, session) => sum + session.metrics.adaptationSuccess, 0) / userLearningSessions.length;
  }, [userLearningSessions]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleUserChange = useCallback((newUserId: string) => {
    setState(prev => ({ ...prev, currentUserId: newUserId }));
  }, []);

  const handlePersonalizationUpdate = useCallback(async (updates: Partial<PersonalizationState>) => {
    setState(prev => ({ ...prev, ...updates }));
    
    try {
      // In production, this would update the backend
      console.log('Updating personalization settings:', updates);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      onError?.(error as Error);
    }
  }, [onError]);

  const handlePreferencesUpdate = useCallback(async (preferences: Partial<SearchPreferences>) => {
    try {
      // In production, this would call the semantic search service
      await semanticSearchService.updateSearchPreferences(state.currentUserId, preferences);
      
      onPreferencesUpdated?.(preferences as SearchPreferences);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [state.currentUserId, onPreferencesUpdated, onError]);

  const handleStartLearningSession = useCallback(async (goals: string[]) => {
    try {
      const newSession: LearningSession = {
        id: `session_${Date.now()}`,
        userId: state.currentUserId,
        sessionStart: new Date(),
        sessionEnd: new Date(),
        interactions: [],
        learningGoals: goals,
        outcomes: [],
        adaptations: [],
        feedback: [],
        metrics: {
          totalInteractions: 0,
          successfulQueries: 0,
          averageQueryTime: 0,
          uniqueAssetsViewed: 0,
          goalCompletionRate: 0,
          userSatisfactionScore: 0,
          learningEffectiveness: 0,
          adaptationSuccess: 0
        }
      };

      setSelectedSession(newSession);
      setIsLearningDialogOpen(false);
      
      console.log('Starting learning session:', newSession);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [state.currentUserId, onError]);

  const handleApplyRecommendation = useCallback(async (recommendation: PersonalizationRecommendation) => {
    try {
      // In production, this would apply the recommendation
      console.log('Applying recommendation:', recommendation);
      
      // Simulate adaptation
      const adaptation: Adaptation = {
        id: `adaptation_${Date.now()}`,
        type: recommendation.type as any,
        description: recommendation.description,
        trigger: 'Manual recommendation application',
        parameters: { priority: recommendation.priority },
        expectedImpact: recommendation.estimatedImpact,
        appliedAt: new Date()
      };

      setState(prev => ({ ...prev, adaptationStrength: Math.min(100, prev.adaptationStrength + 5) }));
    } catch (error) {
      onError?.(error as Error);
    }
  }, [onError]);

  const handleFilterChange = useCallback((key: keyof PersonalizationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
          <CardTitle className="text-sm font-medium text-blue-700">Personalization Score</CardTitle>
          <Brain className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{Math.round(personalizationEffectiveness)}%</div>
          <Progress value={personalizationEffectiveness} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Adaptation Success</CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{Math.round(adaptationSuccessRate)}%</div>
          <Progress value={adaptationSuccessRate} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Learning Sessions</CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{userLearningSessions.length}</div>
          <p className="text-xs text-purple-600 mt-1">
            {userLearningSessions.filter(s => s.outcomes.some(o => o.achieved)).length} successful
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Behavior Patterns</CardTitle>
          <Workflow className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{filteredBehaviorPatterns.length}</div>
          <p className="text-xs text-orange-600 mt-1">
            {filteredBehaviorPatterns.filter(p => p.confidence > 80).length} high confidence
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserProfileCard = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{currentUserProfile.userId.slice(-2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{currentUserProfile.userId}</CardTitle>
              <CardDescription>{currentUserProfile.department} • {currentUserProfile.role}</CardDescription>
            </div>
          </div>
          <Select value={state.currentUserId} onValueChange={handleUserChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockUserProfiles.map(profile => (
                <SelectItem key={profile.userId} value={profile.userId}>
                  {profile.userId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Expertise Level</p>
            <Badge variant={
              currentUserProfile.expertiseLevel === 'EXPERT' ? 'default' :
              currentUserProfile.expertiseLevel === 'ADVANCED' ? 'secondary' :
              'outline'
            }>
              {currentUserProfile.expertiseLevel}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Search Frequency</p>
            <p className="text-lg font-semibold">{currentUserProfile.searchFrequency}/week</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Session</p>
            <p className="text-lg font-semibold">{currentUserProfile.avgSessionDuration}m</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Learning Style</p>
            <Badge variant="outline">{currentUserProfile.learningStyle}</Badge>
          </div>
        </div>

        <Separator className="my-4" />

        <div>
          <h4 className="font-medium mb-2">Top Search Terms</h4>
          <div className="flex flex-wrap gap-2">
            {currentUserProfile.topSearchTerms.map((term, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBehaviorPatternsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pattern Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    filteredBehaviorPatterns.reduce((acc, pattern) => {
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
                    filteredBehaviorPatterns.reduce((acc, pattern) => {
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

        <Card>
          <CardHeader>
            <CardTitle>Pattern Confidence vs Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={filteredBehaviorPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="confidence" />
                <YAxis dataKey="impact" />
                <RechartsTooltip />
                <Scatter dataKey="frequency" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredBehaviorPatterns.map((pattern) => (
          <Card key={pattern.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    pattern.patternType === 'SEARCH' ? 'bg-blue-100 text-blue-600' :
                    pattern.patternType === 'NAVIGATION' ? 'bg-green-100 text-green-600' :
                    pattern.patternType === 'INTERACTION' ? 'bg-purple-100 text-purple-600' :
                    pattern.patternType === 'TEMPORAL' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {pattern.patternType === 'SEARCH' ? <Search className="h-4 w-4" /> :
                     pattern.patternType === 'NAVIGATION' ? <Navigation className="h-4 w-4" /> :
                     pattern.patternType === 'INTERACTION' ? <Users className="h-4 w-4" /> :
                     pattern.patternType === 'TEMPORAL' ? <Clock className="h-4 w-4" /> :
                     <Workflow className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pattern.patternType} Pattern</CardTitle>
                    <CardDescription>{pattern.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                  <p className="text-sm text-gray-600">Impact</p>
                  <p className="text-lg font-semibold">{Math.round(pattern.impact)}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Confidence</span>
                  <span>{Math.round(pattern.confidence)}%</span>
                </div>
                <Progress value={pattern.confidence} />
                
                <div className="flex justify-between text-sm">
                  <span>Impact</span>
                  <span>{Math.round(pattern.impact)}%</span>
                </div>
                <Progress value={pattern.impact} />
              </div>

              {pattern.recommendations.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Recommendations:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {pattern.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-center">
                        <ArrowRight className="h-3 w-3 mr-2" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Last observed: {pattern.lastObserved.toLocaleDateString()}</span>
                <span>Examples: {pattern.examples.length}</span>
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
        {filteredInsights.map((insight) => (
          <Card key={insight.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'PREFERENCE' ? 'bg-blue-100 text-blue-600' :
                    insight.type === 'BEHAVIOR' ? 'bg-green-100 text-green-600' :
                    insight.type === 'PATTERN' ? 'bg-purple-100 text-purple-600' :
                    insight.type === 'OPPORTUNITY' ? 'bg-orange-100 text-orange-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {insight.type === 'PREFERENCE' ? <User className="h-4 w-4" /> :
                     insight.type === 'BEHAVIOR' ? <Activity className="h-4 w-4" /> :
                     insight.type === 'PATTERN' ? <Workflow className="h-4 w-4" /> :
                     insight.type === 'OPPORTUNITY' ? <Lightbulb className="h-4 w-4" /> :
                     <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <CardDescription>{insight.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    insight.impact === 'CRITICAL' ? 'destructive' :
                    insight.impact === 'HIGH' ? 'destructive' :
                    insight.impact === 'MEDIUM' ? 'secondary' :
                    'default'
                  }>
                    {insight.impact}
                  </Badge>
                  {insight.actionable && (
                    <Badge variant="outline">
                      <Check className="h-3 w-3 mr-1" />
                      Actionable
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <span className="text-sm font-semibold">{Math.round(insight.confidence)}%</span>
                </div>
                <Progress value={insight.confidence} />

                {insight.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {insight.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{rec.title}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">{rec.type}</Badge>
                              <Badge variant={
                                rec.priority === 'URGENT' ? 'destructive' :
                                rec.priority === 'HIGH' ? 'destructive' :
                                'secondary'
                              } className="text-xs">
                                {rec.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                            <span>Impact: {rec.estimatedImpact}</span>
                            <span>Effort: {rec.implementationEffort}</span>
                            <Button size="sm" onClick={() => handleApplyRecommendation(rec)}>
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {insight.evidence.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Supporting Evidence</h4>
                    <div className="space-y-2">
                      {insight.evidence.map((evidence, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">{evidence.type}</Badge>
                            <span className="text-xs text-gray-500">{Math.round(evidence.confidence)}% confidence</span>
                          </div>
                          <p className="text-sm">{evidence.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Source: {evidence.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Discovered: {insight.createdAt.toLocaleDateString()}</span>
                  <span>Type: {insight.type}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLearningTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Learning Sessions</h3>
        <Button onClick={() => setIsLearningDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Start Learning Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Effectiveness Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userLearningSessions.map((session, i) => ({
                session: i + 1,
                effectiveness: session.metrics.learningEffectiveness,
                satisfaction: session.metrics.userSatisfactionScore,
                goalCompletion: session.metrics.goalCompletionRate
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="effectiveness" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="satisfaction" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="goalCompletion" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Metrics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Effectiveness</span>
                <span className="text-sm font-semibold">{Math.round(personalizationEffectiveness)}%</span>
              </div>
              <Progress value={personalizationEffectiveness} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Adaptation Success</span>
                <span className="text-sm font-semibold">{Math.round(adaptationSuccessRate)}%</span>
              </div>
              <Progress value={adaptationSuccessRate} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Goal Completion</span>
                <span className="text-sm font-semibold">
                  {Math.round(userLearningSessions.reduce((sum, s) => sum + s.metrics.goalCompletionRate, 0) / userLearningSessions.length || 0)}%
                </span>
              </div>
              <Progress value={userLearningSessions.reduce((sum, s) => sum + s.metrics.goalCompletionRate, 0) / userLearningSessions.length || 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {userLearningSessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Session {session.id}</CardTitle>
                  <CardDescription>
                    {session.sessionStart.toLocaleDateString()} • 
                    {Math.round((session.sessionEnd.getTime() - session.sessionStart.getTime()) / (1000 * 60))} minutes
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Learning Goals</p>
                  <p className="text-lg font-semibold">{session.learningGoals.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Interactions</p>
                  <p className="text-lg font-semibold">{session.metrics.totalInteractions}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Adaptations</p>
                  <p className="text-lg font-semibold">{session.adaptations.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Satisfaction</p>
                  <p className="text-lg font-semibold">{Math.round(session.metrics.userSatisfactionScore)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Learning Effectiveness</span>
                  <span>{Math.round(session.metrics.learningEffectiveness)}%</span>
                </div>
                <Progress value={session.metrics.learningEffectiveness} />
              </div>

              {session.learningGoals.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Learning Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.learningGoals.map((goal, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalization Settings</CardTitle>
          <CardDescription>Configure how search personalization adapts to your behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Learning Mode</Label>
                <Select value={state.learningMode} onValueChange={(value: any) => handlePersonalizationUpdate({ learningMode: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Personalization Level</Label>
                <Select value={state.personalizationLevel} onValueChange={(value: any) => handlePersonalizationUpdate({ personalizationLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Privacy Level</Label>
                <Select value={state.privacyLevel} onValueChange={(value: any) => handlePersonalizationUpdate({ privacyLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High (Minimal tracking)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (Balanced)</SelectItem>
                    <SelectItem value="LOW">Low (Full tracking)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Adaptation Strength: {state.adaptationStrength}%</Label>
                <Slider
                  value={[state.adaptationStrength]}
                  onValueChange={([value]) => handlePersonalizationUpdate({ adaptationStrength: value })}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="real-time-adaptation"
                    checked={state.enableRealTimeAdaptation}
                    onCheckedChange={(checked) => handlePersonalizationUpdate({ enableRealTimeAdaptation: checked })}
                  />
                  <Label htmlFor="real-time-adaptation">Real-time Adaptation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="behavior-tracking"
                    checked={state.enableBehaviorTracking}
                    onCheckedChange={(checked) => handlePersonalizationUpdate({ enableBehaviorTracking: checked })}
                  />
                  <Label htmlFor="behavior-tracking">Behavior Tracking</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="collaborative-filtering"
                    checked={state.enableCollaborativeFiltering}
                    onCheckedChange={(checked) => handlePersonalizationUpdate({ enableCollaborativeFiltering: checked })}
                  />
                  <Label htmlFor="collaborative-filtering">Collaborative Filtering</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="content-based"
                    checked={state.enableContentBasedRecommendations}
                    onCheckedChange={(checked) => handlePersonalizationUpdate({ enableContentBasedRecommendations: checked })}
                  />
                  <Label htmlFor="content-based">Content-based Recommendations</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="context-awareness"
                    checked={state.contextAwareness}
                    onCheckedChange={(checked) => handlePersonalizationUpdate({ contextAwareness: checked })}
                  />
                  <Label htmlFor="context-awareness">Context Awareness</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="cross-domain"
                    checked={state.crossDomainLearning}
                    onCheckedChange={(checked) => handlePersonalizationUpdate({ crossDomainLearning: checked })}
                  />
                  <Label htmlFor="cross-domain">Cross-domain Learning</Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-4">Search Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Default Sort Order</Label>
                <Select defaultValue="RELEVANCE">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RELEVANCE">Relevance</SelectItem>
                    <SelectItem value="POPULARITY">Popularity</SelectItem>
                    <SelectItem value="RECENCY">Recency</SelectItem>
                    <SelectItem value="ALPHABETICAL">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Results Per Page</Label>
                <Select defaultValue="20">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch id="enable-suggestions" defaultChecked />
                <Label htmlFor="enable-suggestions">Enable Search Suggestions</Label>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => setIsPreferencesDialogOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Advanced Preferences
            </Button>
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
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
            <h1 className="text-3xl font-bold text-gray-900">Search Personalization</h1>
            <p className="text-gray-600 mt-1">AI-powered personalized search experiences and adaptive learning</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleRefresh} disabled={recommendationsHook.isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${recommendationsHook.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsProfileDialogOpen(true)}>
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button onClick={() => setIsLearningDialogOpen(true)}>
              <Brain className="h-4 w-4 mr-2" />
              Start Learning
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label>Search Patterns</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    placeholder="Search patterns..."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="include-anonymous"
                  checked={filters.includeAnonymous || false}
                  onCheckedChange={(checked) => handleFilterChange('includeAnonymous', checked)}
                />
                <Label htmlFor="include-anonymous">Include Anonymous Data</Label>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, showAdvancedSettings: !prev.showAdvancedSettings }))}
                  className="w-full"
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  {state.showAdvancedSettings ? 'Hide' : 'Show'} Advanced
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Profile Card */}
        {renderUserProfileCard()}

        {/* Overview Cards */}
        {renderOverviewCards()}

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personalization Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userLearningSessions.map((session, i) => ({
                      session: i + 1,
                      effectiveness: session.metrics.learningEffectiveness,
                      satisfaction: session.metrics.userSatisfactionScore
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="effectiveness" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="satisfaction" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Personalization Score</span>
                      <span className="text-sm font-semibold">{Math.round(personalizationEffectiveness)}%</span>
                    </div>
                    <Progress value={personalizationEffectiveness} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Adaptation Strength</span>
                      <span className="text-sm font-semibold">{state.adaptationStrength}%</span>
                    </div>
                    <Progress value={state.adaptationStrength} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Learning Mode</span>
                      <Badge variant="outline">{state.learningMode}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Privacy Level</span>
                      <Badge variant={
                        state.privacyLevel === 'HIGH' ? 'default' :
                        state.privacyLevel === 'MEDIUM' ? 'secondary' :
                        'outline'
                      }>
                        {state.privacyLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Personalization Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredInsights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'OPPORTUNITY' ? 'bg-green-100 text-green-600' :
                          insight.type === 'PATTERN' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {insight.type === 'OPPORTUNITY' ? <Lightbulb className="h-4 w-4" /> :
                           insight.type === 'PATTERN' ? <Workflow className="h-4 w-4" /> :
                           <Brain className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{insight.title}</p>
                          <p className="text-sm text-gray-600">{insight.description.slice(0, 80)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          insight.impact === 'HIGH' ? 'default' :
                          insight.impact === 'MEDIUM' ? 'secondary' :
                          'outline'
                        }>
                          {insight.impact}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior">
            {renderBehaviorPatternsTab()}
          </TabsContent>

          <TabsContent value="insights">
            {renderInsightsTab()}
          </TabsContent>

          <TabsContent value="learning">
            {renderLearningTab()}
          </TabsContent>

          <TabsContent value="settings">
            {renderSettingsTab()}
          </TabsContent>
        </Tabs>

        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Search Profile</DialogTitle>
              <DialogDescription>
                Detailed view of search behavior and personalization profile
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User ID</Label>
                  <Input value={currentUserProfile.userId} disabled />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={currentUserProfile.department} disabled />
                </div>
              </div>
              
              <div>
                <Label>Role</Label>
                <Input value={currentUserProfile.role} disabled />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Expertise Level</Label>
                  <Input value={currentUserProfile.expertiseLevel} disabled />
                </div>
                <div>
                  <Label>Search Frequency</Label>
                  <Input value={`${currentUserProfile.searchFrequency}/week`} disabled />
                </div>
                <div>
                  <Label>Avg Session Duration</Label>
                  <Input value={`${currentUserProfile.avgSessionDuration}m`} disabled />
                </div>
              </div>

              <div>
                <Label>Top Search Terms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentUserProfile.topSearchTerms.map((term, idx) => (
                    <Badge key={idx} variant="secondary">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Close
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Learning Session Dialog */}
        <Dialog open={isLearningDialogOpen} onOpenChange={setIsLearningDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start Learning Session</DialogTitle>
              <DialogDescription>
                Define learning goals and begin AI-powered adaptation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Learning Goals</Label>
                <Textarea placeholder="Describe what you want to learn or improve in your search experience..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Focus Area</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select focus area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efficiency">Search Efficiency</SelectItem>
                      <SelectItem value="discovery">Content Discovery</SelectItem>
                      <SelectItem value="relevance">Result Relevance</SelectItem>
                      <SelectItem value="navigation">Interface Navigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Session Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="real-time-feedback" defaultChecked />
                <Label htmlFor="real-time-feedback">Enable real-time feedback collection</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLearningDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleStartLearningSession(['Improve search efficiency', 'Better result discovery'])}>
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default SearchPersonalization;