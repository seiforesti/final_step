'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Clock,
  DollarSign,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Filter,
  Search,
  Calendar,
  Users,
  MapPin,
  Layers,
  GitBranch,
  Share,
  FileText,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Info,
  Sparkles,
  Star,
  Award,
  Trophy,
  Medal,
  Crown,
  Rocket,
  Shield,
  ShieldCheck,
  AlertCircle,
  Bell,
  Bookmark,
  BookmarkCheck,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  ExternalLink,
  Link,
  Tag,
  Hash,
  Percent,
  Activity,
  Gauge,
  Timer,
  Cpu,
  Database,
  Network,
  HardDrive,
  LineChart,
  PieChart,
  BarChart2,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Treemap,
  FunnelChart,
  Funnel,
} from 'recharts';
import { useOptimization } from '../../hooks/useOptimization';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useReporting } from '../../hooks/useReporting';

// Types
interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'cost' | 'accuracy' | 'security' | 'compliance' | 'usability';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    performance: number;
    cost: number;
    accuracy: number;
    risk: number;
  };
  effort: {
    level: 'low' | 'medium' | 'high';
    estimatedHours: number;
    skillsRequired: string[];
    resources: string[];
  };
  confidence: number;
  feasibility: number;
  roi: number;
  timeline: {
    phases: RecommendationPhase[];
    estimatedDuration: number;
    dependencies: string[];
  };
  ruleIds: string[];
  prerequisites: string[];
  risks: string[];
  benefits: string[];
  implementation: {
    steps: ImplementationStep[];
    automatable: boolean;
    testingRequired: boolean;
    rollbackPlan: string;
  };
  status: 'new' | 'reviewed' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'deferred';
  feedback: RecommendationFeedback[];
  metrics: {
    beforeValue: number;
    expectedValue: number;
    actualValue?: number;
    measurementUnit: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignee?: string;
  reviewers: string[];
  tags: string[];
}

interface RecommendationPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  dependencies: string[];
  deliverables: string[];
  resources: string[];
}

interface ImplementationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'manual' | 'automated' | 'configuration' | 'testing' | 'validation';
  estimatedTime: number;
  complexity: 'low' | 'medium' | 'high';
  tools: string[];
  documentation: string;
  validation: string;
  rollback: string;
}

interface RecommendationFeedback {
  id: string;
  type: 'comment' | 'approval' | 'rejection' | 'question' | 'suggestion';
  author: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
}

interface RecommendationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: TemplateCondition[];
  actions: TemplateAction[];
  priority: string;
  tags: string[];
  enabled: boolean;
}

interface TemplateCondition {
  metric: string;
  operator: string;
  value: number;
  weight: number;
}

interface TemplateAction {
  type: string;
  parameters: Record<string, any>;
  description: string;
}

interface RecommendationWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  schedule?: {
    enabled: boolean;
    frequency: string;
    time: string;
  };
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  executionHistory: WorkflowExecution[];
}

interface WorkflowTrigger {
  type: 'metric_threshold' | 'schedule' | 'manual' | 'rule_change' | 'performance_degradation';
  configuration: Record<string, any>;
}

interface WorkflowAction {
  type: 'generate_recommendation' | 'notify_team' | 'auto_implement' | 'schedule_review';
  configuration: Record<string, any>;
}

interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
}

interface WorkflowExecution {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  recommendations: string[];
  errors: string[];
  logs: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const CATEGORY_ICONS = {
  performance: Zap,
  cost: DollarSign,
  accuracy: Target,
  security: Shield,
  compliance: ShieldCheck,
  usability: Users,
};

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_COLORS = {
  new: 'bg-gray-100 text-gray-800 border-gray-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  deferred: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const OptimizationRecommendations: React.FC = () => {
  // Hooks
  const {
    getRecommendations,
    generateRecommendations,
    implementRecommendation,
    updateRecommendationStatus,
    addRecommendationFeedback,
    getRecommendationTemplates,
    createRecommendationTemplate,
    getRecommendationWorkflows,
    createRecommendationWorkflow,
    executeWorkflow,
  } = useOptimization();

  const {
    analyzeOptimizationOpportunities,
    predictRecommendationImpact,
    generateImplementationPlan,
    assessRecommendationRisk,
  } = useIntelligence();

  const { rules, getRuleMetrics } = useScanRules();
  const { notifyTeam, addComment, assignTask } = useCollaboration();
  const { generateReport } = useReporting();

  // State
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [templates, setTemplates] = useState<RecommendationTemplate[]>([]);
  const [workflows, setWorkflows] = useState<RecommendationWorkflow[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<OptimizationRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'kanban'>('cards');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'effort' | 'roi' | 'created'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showImplemented, setShowImplemented] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [generationInterval, setGenerationInterval] = useState(60);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showImplementationDialog, setShowImplementationDialog] = useState(false);
  const [implementationProgress, setImplementationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    recommendationId: string | null;
    type: string;
  }>({ open: false, recommendationId: null, type: 'comment' });
  const [feedbackContent, setFeedbackContent] = useState('');

  // Computed values
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || rec.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || rec.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
      const matchesImplemented = showImplemented || !['completed', 'rejected'].includes(rec.status);
      
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesImplemented;
    }).sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'impact':
          aValue = (a.impact.performance + a.impact.cost + a.impact.accuracy) / 3;
          bValue = (b.impact.performance + b.impact.cost + b.impact.accuracy) / 3;
          break;
        case 'effort':
          aValue = a.effort.estimatedHours;
          bValue = b.effort.estimatedHours;
          break;
        case 'roi':
          aValue = a.roi;
          bValue = b.roi;
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          aValue = 0;
          bValue = 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [recommendations, searchTerm, filterCategory, filterPriority, filterStatus, showImplemented, sortBy, sortOrder]);

  const recommendationStats = useMemo(() => {
    const total = recommendations.length;
    const byStatus = recommendations.reduce((acc, rec) => {
      acc[rec.status] = (acc[rec.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = recommendations.reduce((acc, rec) => {
      acc[rec.priority] = (acc[rec.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const averageROI = recommendations.reduce((sum, rec) => sum + rec.roi, 0) / total || 0;
    const totalEstimatedSavings = recommendations
      .filter(rec => rec.status !== 'rejected')
      .reduce((sum, rec) => sum + (rec.impact.cost * 1000), 0); // Assuming cost impact is in thousands
    
    return {
      total,
      byStatus,
      byPriority,
      averageROI,
      totalEstimatedSavings,
    };
  }, [recommendations]);

  const impactTrends = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last30Days.map(date => {
      const dayRecommendations = recommendations.filter(rec => 
        rec.createdAt.toISOString().split('T')[0] === date
      );
      
      return {
        date,
        count: dayRecommendations.length,
        avgImpact: dayRecommendations.reduce((sum, rec) => 
          sum + (rec.impact.performance + rec.impact.cost + rec.impact.accuracy) / 3, 0
        ) / dayRecommendations.length || 0,
        avgROI: dayRecommendations.reduce((sum, rec) => sum + rec.roi, 0) / dayRecommendations.length || 0,
      };
    });
  }, [recommendations]);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [recsData, templatesData, workflowsData] = await Promise.all([
          getRecommendations(),
          getRecommendationTemplates(),
          getRecommendationWorkflows(),
        ]);
        
        setRecommendations(recsData);
        setTemplates(templatesData);
        setWorkflows(workflowsData);
      } catch (error) {
        console.error('Failed to load recommendations data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!autoGenerate) return;

    const interval = setInterval(() => {
      handleGenerateRecommendations();
    }, generationInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoGenerate, generationInterval]);

  // Handlers
  const handleGenerateRecommendations = useCallback(async () => {
    setIsGenerating(true);
    try {
      const newRecommendations = await generateRecommendations({
        includeRules: rules?.map(r => r.id) || [],
        categories: ['performance', 'cost', 'accuracy', 'security'],
        minConfidence: 0.7,
        maxRecommendations: 20,
      });
      
      setRecommendations(prev => [...prev, ...newRecommendations]);
      notifyTeam('recommendations_generated', {
        count: newRecommendations.length,
        highPriority: newRecommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length,
      });
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generateRecommendations, rules, notifyTeam]);

  const handleImplementRecommendation = useCallback(async (recommendationId: string) => {
    setShowImplementationDialog(true);
    setImplementationProgress(0);
    
    try {
      const recommendation = recommendations.find(r => r.id === recommendationId);
      if (!recommendation) return;
      
      // Simulate implementation progress
      const steps = recommendation.implementation.steps;
      for (let i = 0; i < steps.length; i++) {
        setImplementationProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate step execution
      }
      
      await implementRecommendation(recommendationId);
      await updateRecommendationStatus(recommendationId, 'completed');
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: 'completed' as const }
            : rec
        )
      );
      
      notifyTeam('recommendation_implemented', {
        title: recommendation.title,
        impact: recommendation.impact,
      });
    } catch (error) {
      console.error('Failed to implement recommendation:', error);
    } finally {
      setShowImplementationDialog(false);
      setImplementationProgress(0);
    }
  }, [recommendations, implementRecommendation, updateRecommendationStatus, notifyTeam]);

  const handleStatusChange = useCallback(async (recommendationId: string, newStatus: string) => {
    try {
      await updateRecommendationStatus(recommendationId, newStatus);
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: newStatus as any }
            : rec
        )
      );
    } catch (error) {
      console.error('Failed to update recommendation status:', error);
    }
  }, [updateRecommendationStatus]);

  const handleAddFeedback = useCallback(async () => {
    if (!feedbackDialog.recommendationId || !feedbackContent.trim()) return;
    
    try {
      const feedback = await addRecommendationFeedback(
        feedbackDialog.recommendationId,
        {
          type: feedbackDialog.type,
          content: feedbackContent,
          author: 'current_user', // Replace with actual user
        }
      );
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === feedbackDialog.recommendationId 
            ? { ...rec, feedback: [...rec.feedback, feedback] }
            : rec
        )
      );
      
      setFeedbackDialog({ open: false, recommendationId: null, type: 'comment' });
      setFeedbackContent('');
    } catch (error) {
      console.error('Failed to add feedback:', error);
    }
  }, [feedbackDialog, feedbackContent, addRecommendationFeedback]);

  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selectedRecommendations.length === 0) return;
    
    try {
      for (const recId of selectedRecommendations) {
        switch (bulkAction) {
          case 'approve':
            await handleStatusChange(recId, 'approved');
            break;
          case 'reject':
            await handleStatusChange(recId, 'rejected');
            break;
          case 'defer':
            await handleStatusChange(recId, 'deferred');
            break;
          case 'implement':
            await handleImplementRecommendation(recId);
            break;
        }
      }
      
      setSelectedRecommendations([]);
      setBulkAction('');
    } catch (error) {
      console.error('Failed to execute bulk action:', error);
    }
  }, [bulkAction, selectedRecommendations, handleStatusChange, handleImplementRecommendation]);

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Lightbulb;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return AlertTriangle;
      case 'high':
        return ArrowUp;
      case 'medium':
        return ArrowRight;
      case 'low':
        return ArrowDown;
      default:
        return Info;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return Sparkles;
      case 'reviewed':
        return Eye;
      case 'approved':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'completed':
        return Trophy;
      case 'rejected':
        return XCircle;
      case 'deferred':
        return Pause;
      default:
        return Info;
    }
  };

  const getEffortColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-8 w-8 text-yellow-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Optimization Recommendations
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Intelligent suggestions for performance improvements and cost optimization
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {recommendationStats.total} Total
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  ${recommendationStats.totalEstimatedSavings.toLocaleString()} Savings
                </Badge>
                {isGenerating && (
                  <Badge variant="secondary" className="animate-pulse">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoGenerate}
                  onCheckedChange={setAutoGenerate}
                  id="auto-generate"
                />
                <Label htmlFor="auto-generate" className="text-sm">
                  Auto-generate ({generationInterval}m)
                </Label>
              </div>

              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">Cards</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="kanban">Kanban</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleGenerateRecommendations}
                disabled={isGenerating}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Generate</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Actions
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Recommendation Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowCreateTemplate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCreateWorkflow(true)}>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Create Workflow
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="recommendations" className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span>Recommendations</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4" />
                <span>Workflows</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {/* Filters and Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search recommendations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="cost">Cost</SelectItem>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="usability">Usability</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="deferred">Deferred</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showImplemented}
                      onCheckedChange={setShowImplemented}
                      id="show-implemented"
                    />
                    <Label htmlFor="show-implemented" className="text-sm">
                      Show completed
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="impact">Impact</SelectItem>
                      <SelectItem value="effort">Effort</SelectItem>
                      <SelectItem value="roi">ROI</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedRecommendations.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">
                      {selectedRecommendations.length} recommendations selected
                    </span>
                    
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Choose action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve All</SelectItem>
                        <SelectItem value="reject">Reject All</SelectItem>
                        <SelectItem value="defer">Defer All</SelectItem>
                        <SelectItem value="implement">Implement All</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                      size="sm"
                    >
                      Execute
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRecommendations([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}

              {/* Recommendations Grid/List */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRecommendations.map((recommendation) => {
                    const CategoryIcon = getCategoryIcon(recommendation.category);
                    const PriorityIcon = getPriorityIcon(recommendation.priority);
                    const StatusIcon = getStatusIcon(recommendation.status);
                    
                    return (
                      <motion.div
                        key={recommendation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all hover:shadow-lg relative ${
                            selectedRecommendations.includes(recommendation.id) ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedRecommendation(recommendation)}
                        >
                          <div className="absolute top-4 left-4">
                            <Checkbox
                              checked={selectedRecommendations.includes(recommendation.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRecommendations(prev => [...prev, recommendation.id]);
                                } else {
                                  setSelectedRecommendations(prev => prev.filter(id => id !== recommendation.id));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <CardHeader className="pl-12">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <CategoryIcon className="h-5 w-5 text-yellow-600" />
                                <Badge className={PRIORITY_COLORS[recommendation.priority]}>
                                  <PriorityIcon className="h-3 w-3 mr-1" />
                                  {recommendation.priority}
                                </Badge>
                              </div>
                              <Badge className={STATUS_COLORS[recommendation.status]}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {recommendation.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <CardTitle className="text-lg line-clamp-2">
                              {recommendation.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-3">
                              {recommendation.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Impact Metrics */}
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center">
                                <div className="font-medium text-green-600">
                                  +{recommendation.impact.performance}%
                                </div>
                                <div className="text-gray-500">Performance</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-blue-600">
                                  -${recommendation.impact.cost}K
                                </div>
                                <div className="text-gray-500">Cost</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-purple-600">
                                  +{recommendation.impact.accuracy}%
                                </div>
                                <div className="text-gray-500">Accuracy</div>
                              </div>
                            </div>

                            <Separator />

                            {/* Effort and ROI */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span>Effort:</span>
                                <Badge className={getEffortColor(recommendation.effort.level)}>
                                  {recommendation.effort.level}
                                </Badge>
                                <span className="text-gray-500">
                                  ({recommendation.effort.estimatedHours}h)
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>ROI:</span>
                                <span className="font-bold text-green-600">
                                  {recommendation.roi.toFixed(1)}x
                                </span>
                              </div>
                            </div>

                            {/* Progress for in-progress items */}
                            {recommendation.status === 'in_progress' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Implementation Progress</span>
                                  <span>75%</span>
                                </div>
                                <Progress value={75} className="h-2" />
                              </div>
                            )}

                            {/* Tags */}
                            {recommendation.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {recommendation.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {recommendation.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{recommendation.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2">
                              {recommendation.status === 'approved' && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImplementRecommendation(recommendation.id);
                                  }}
                                  className="flex-1"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Implement
                                </Button>
                              )}
                              
                              {recommendation.status === 'new' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(recommendation.id, 'approved');
                                    }}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(recommendation.id, 'rejected');
                                    }}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFeedbackDialog({
                                    open: true,
                                    recommendationId: recommendation.id,
                                    type: 'comment'
                                  });
                                }}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Comment
                              </Button>
                            </div>

                            {/* Metadata */}
                            <div className="text-xs text-gray-500 pt-2 border-t">
                              <div className="flex justify-between">
                                <span>Created: {recommendation.createdAt.toLocaleDateString()}</span>
                                <span>Confidence: {(recommendation.confidence * 100).toFixed(0)}%</span>
                              </div>
                              {recommendation.assignee && (
                                <div className="mt-1">
                                  <span>Assigned to: {recommendation.assignee}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {filteredRecommendations.length === 0 && (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No recommendations found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Try adjusting your filters or generate new recommendations
                  </p>
                  <Button onClick={handleGenerateRecommendations} disabled={isGenerating}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    Generate Recommendations
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Recommendations
                    </CardTitle>
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{recommendationStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {recommendationStats.byStatus.new || 0} new this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average ROI
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {recommendationStats.averageROI.toFixed(1)}x
                    </div>
                    <p className="text-xs text-muted-foreground">
                      return on investment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Estimated Savings
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      ${recommendationStats.totalEstimatedSavings.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      potential annual savings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Implementation Rate
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {((recommendationStats.byStatus.completed || 0) / recommendationStats.total * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      recommendations implemented
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(recommendationStats.byStatus).map(([status, count]) => ({
                            name: status.replace('_', ' '),
                            value: count,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {Object.keys(recommendationStats.byStatus).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations by Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(recommendationStats.byPriority).map(([priority, count]) => ({
                          priority: priority,
                          count: count,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="priority" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#fbbf24" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Impact Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Impact Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={impactTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Bar yAxisId="left" dataKey="count" fill="#fbbf24" name="Count" />
                      <Line yAxisId="right" type="monotone" dataKey="avgImpact" stroke="#8884d8" name="Avg Impact" />
                      <Line yAxisId="right" type="monotone" dataKey="avgROI" stroke="#82ca9d" name="Avg ROI" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recommendation Templates</h3>
                <Button onClick={() => setShowCreateTemplate(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Switch checked={template.enabled} />
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge className={PRIORITY_COLORS[template.priority as keyof typeof PRIORITY_COLORS]}>
                          {template.priority}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Conditions ({template.conditions.length})</div>
                        {template.conditions.slice(0, 3).map((condition, index) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            {condition.metric} {condition.operator} {condition.value}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Actions ({template.actions.length})</div>
                        {template.actions.slice(0, 2).map((action, index) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            {action.type}: {action.description}
                          </div>
                        ))}
                      </div>

                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Copy className="h-3 w-3 mr-1" />
                          Clone
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Workflows Tab */}
            <TabsContent value="workflows" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recommendation Workflows</h3>
                <Button onClick={() => setShowCreateWorkflow(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </div>

              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <Switch checked={workflow.enabled} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Triggers</div>
                          <div className="font-medium">{workflow.triggers.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Actions</div>
                          <div className="font-medium">{workflow.actions.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Last Run</div>
                          <div className="font-medium">
                            {workflow.lastRun?.toLocaleDateString() || 'Never'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Next Run</div>
                          <div className="font-medium">
                            {workflow.nextRun?.toLocaleDateString() || 'Manual'}
                          </div>
                        </div>
                      </div>

                      {workflow.schedule?.enabled && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-sm font-medium">Scheduled Execution</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {workflow.schedule.frequency} at {workflow.schedule.time}
                          </div>
                        </div>
                      )}

                      {workflow.executionHistory.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Recent Executions</div>
                          {workflow.executionHistory.slice(0, 3).map((execution) => (
                            <div key={execution.id} className="flex items-center justify-between text-sm">
                              <span>{execution.startTime.toLocaleString()}</span>
                              <Badge className={execution.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {execution.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-generate">Automatic Generation</Label>
                      <p className="text-sm text-gray-500">
                        Automatically generate recommendations based on system metrics
                      </p>
                    </div>
                    <Switch
                      id="auto-generate"
                      checked={autoGenerate}
                      onCheckedChange={setAutoGenerate}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Generation Interval (minutes)</Label>
                    <Slider
                      value={[generationInterval]}
                      onValueChange={([value]) => setGenerationInterval(value)}
                      max={480}
                      min={15}
                      step={15}
                    />
                    <div className="text-sm text-gray-500">
                      Current: {generationInterval} minutes
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>High Priority Alerts</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Implementation Reminders</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Weekly Summary</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Implementation Progress Dialog */}
        <Dialog open={showImplementationDialog} onOpenChange={setShowImplementationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Implementation in Progress</DialogTitle>
              <DialogDescription>
                Executing recommendation implementation steps...
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{implementationProgress.toFixed(0)}%</span>
                </div>
                <Progress value={implementationProgress} className="h-3" />
              </div>
              
              <div className="text-sm text-gray-600">
                {implementationProgress < 25 && "Analyzing current configuration..."}
                {implementationProgress >= 25 && implementationProgress < 50 && "Applying optimizations..."}
                {implementationProgress >= 50 && implementationProgress < 75 && "Validating changes..."}
                {implementationProgress >= 75 && implementationProgress < 100 && "Finalizing implementation..."}
                {implementationProgress === 100 && "Implementation completed successfully!"}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog.open} onOpenChange={(open) => setFeedbackDialog(prev => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Feedback</DialogTitle>
              <DialogDescription>
                Share your thoughts on this recommendation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Feedback Type</Label>
                <Select 
                  value={feedbackDialog.type} 
                  onValueChange={(value) => setFeedbackDialog(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="approval">Approval</SelectItem>
                    <SelectItem value="rejection">Rejection</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="Enter your feedback..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setFeedbackDialog({ open: false, recommendationId: null, type: 'comment' })}
              >
                Cancel
              </Button>
              <Button onClick={handleAddFeedback}>
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};