"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  Settings,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  Rewind,
  CheckCircle as CheckCircleIcon,
  XCircle,
  AlertTriangle as AlertTriangleIcon,
  Info,
  Workflow,
  GitBranch,
  Database,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Route,
  Layers,
  Package,
  Component,
  Code,
  Terminal,
  Monitor as MonitorIcon,
  Users,
  User,
  Crown,
  Award,
  Star,
  Bookmark,
  Tag,
  Hash,
  Percent,
  DollarSign,
  Calculator,
  Plus,
  Minus,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Grid,
  List,
  Map,
  Navigation,
  Compass,
  MapPin,
  Globe,
  Wifi,
  Link,
  Unlink,
  Share2,
  Copy,
  Edit,
  Trash2,
  Save,
  FileText,
  File,
  Folder,
  Archive,
  History,
  Bell,
  BellOff,
  MessageSquare,
  Mail,
  Send,
  Phone,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Image,
  Film,
  Music,
  Headphones,
  Radio,
  Tv,
  Smartphone,
  Tablet,
  Laptop,
  Monitor as MonitorIcon2,
  Watch,
  Gamepad2,
  Keyboard,
  Mouse,
  Printer,
  Projector,
  Lightbulb as LightbulbIcon,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  Rainbow,
  Sunrise,
  Sunset,
  Wind,
  Thermometer,
  Gauge,
  Ruler,
  Scale,
  Timer as TimerIcon,
  AlarmClock,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Clock as ClockIcon, 
  UserCheck,
  Users as UsersIcon,
  Building,
  Globe as GlobeIcon,
  Lock,
  Unlock,
  Key,
  Eye as EyeIcon,
  EyeOff,
  Shield as ShieldIcon,
  AlertCircle,
  CheckSquare,
  Square as SquareIcon,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Star as StarIcon,
  Heart,
  Diamond,
  Zap as ZapIcon,
  Sparkles,
  Wand2,
  Gem,
  Crown as CrownIcon,
  Trophy,
  Medal,
  Award as AwardIcon,
  Ribbon,
  Flag,
  Banner,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldOff,
  ShieldPlus,
  ShieldMinus,
  ShieldQuestion,
  ShieldZap,
  ShieldStar,
  ShieldHeart,
  ShieldDollarSign,
  ShieldPercent,
  ShieldCheck as ShieldCheckIcon,
  ShieldX as ShieldXIcon,
  ShieldAlert as ShieldAlertIcon,
  ShieldOff as ShieldOffIcon,
  ShieldPlus as ShieldPlusIcon,
  ShieldMinus as ShieldMinusIcon,
  ShieldQuestion as ShieldQuestionIcon,
  ShieldZap as ShieldZapIcon,
  ShieldStar as ShieldStarIcon,
  ShieldHeart as ShieldHeartIcon,
  ShieldDollarSign as ShieldDollarSignIcon,
  ShieldPercent as ShieldPercentIcon
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Chart components for analytics
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Brush
} from 'recharts';

// Import types and hooks
import {
  WorkflowRecommendations,
  WorkflowRecommendation,
  RecommendationType,
  RecommendationPriority,
  RecommendationCategory,
  RecommendationImpact,
  RecommendationStatus
} from '../../types/workflow.types';

import { useWorkflowRecommendations } from '../../hooks/useWorkflowAnalytics';

interface WorkflowRecommendationsPanelProps {
  workflowId?: string;
  className?: string;
  onRecommendationClick?: (recommendation: WorkflowRecommendation) => void;
  onRecommendationApply?: (recommendation: WorkflowRecommendation) => void;
  onRecommendationDismiss?: (recommendation: WorkflowRecommendation) => void;
}

export const WorkflowRecommendationsPanel: React.FC<WorkflowRecommendationsPanelProps> = ({
  workflowId,
  className = '',
  onRecommendationClick,
  onRecommendationApply,
  onRecommendationDismiss
}) => {
  const { recommendations, isLoading, error } = useWorkflowRecommendations();
  const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<RecommendationPriority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<RecommendationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());

  // Filter recommendations based on selected criteria
  const filteredRecommendations = useMemo(() => {
    if (!recommendations?.data) return [];

    return recommendations.data.filter(recommendation => {
      const matchesCategory = selectedCategory === 'all' || recommendation.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || recommendation.priority === selectedPriority;
      const matchesStatus = selectedStatus === 'all' || recommendation.status === selectedStatus;
      const matchesSearch = searchQuery === '' || 
        recommendation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recommendation.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesPriority && matchesStatus && matchesSearch;
    });
  }, [recommendations, selectedCategory, selectedPriority, selectedStatus, searchQuery]);

  // Group recommendations by category
  const groupedRecommendations = useMemo(() => {
    const groups: Record<string, WorkflowRecommendation[]> = {};
    
    filteredRecommendations.forEach(recommendation => {
      const category = recommendation.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(recommendation);
    });

    return groups;
  }, [filteredRecommendations]);

  // Toggle recommendation expansion
  const toggleRecommendationExpansion = (recommendationId: string) => {
    setExpandedRecommendations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recommendationId)) {
        newSet.delete(recommendationId);
      } else {
        newSet.add(recommendationId);
      }
      return newSet;
    });
  };

  // Get priority color
  const getPriorityColor = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Get status color
  const getStatusColor = (status: RecommendationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'applied':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'performance':
        return <Activity className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'efficiency':
        return <Zap className="h-4 w-4" />;
      case 'reliability':
        return <CheckCircle className="h-4 w-4" />;
      case 'cost':
        return <DollarSign className="h-4 w-4" />;
      case 'compliance':
        return <FileText className="h-4 w-4" />;
      case 'scalability':
        return <TrendingUp className="h-4 w-4" />;
      case 'maintainability':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  // Get recommendation type icon
  const getRecommendationTypeIcon = (type: RecommendationType) => {
    switch (type) {
      case 'optimization':
        return <Target className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'cost_savings':
        return <DollarSign className="h-4 w-4" />;
      case 'best_practice':
        return <CheckCircle className="h-4 w-4" />;
      case 'automation':
        return <Bot className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  // Get impact icon
  const getImpactIcon = (impact: RecommendationImpact) => {
    switch (impact) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Workflow Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Workflow Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load workflow recommendations. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            <CardTitle>Workflow Recommendations</CardTitle>
            <Badge variant="secondary">{filteredRecommendations.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          AI-powered recommendations for workflow optimization and improvement
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as RecommendationCategory | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="efficiency">Efficiency</SelectItem>
                <SelectItem value="reliability">Reliability</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="scalability">Scalability</SelectItem>
                <SelectItem value="maintainability">Maintainability</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as RecommendationPriority | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as RecommendationStatus | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recommendations List */}
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {Object.entries(groupedRecommendations).map(([category, categoryRecommendations]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {getCategoryIcon(category as RecommendationCategory)}
                  {category.charAt(0).toUpperCase() + category.slice(1)} Recommendations
                  <Badge variant="outline">{categoryRecommendations.length}</Badge>
                </div>
                
                <div className="space-y-3">
                  {categoryRecommendations.map((recommendation) => (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          expandedRecommendations.has(recommendation.id) ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          toggleRecommendationExpansion(recommendation.id);
                          onRecommendationClick?.(recommendation);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex items-center gap-2 mt-1">
                                {getRecommendationTypeIcon(recommendation.type)}
                                <Badge className={getPriorityColor(recommendation.priority)}>
                                  {recommendation.priority}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(recommendation.status)}>
                                  {recommendation.status}
                                </Badge>
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {recommendation.description}
                                </p>
                                
                                {expandedRecommendations.has(recommendation.id) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3"
                                  >
                                    {recommendation.impact && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Impact:</span>
                                        {getImpactIcon(recommendation.impact)}
                                        <span className="font-medium capitalize">{recommendation.impact}</span>
                                      </div>
                                    )}
                                    
                                    {recommendation.estimatedSavings && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Estimated Savings:</span>
                                        <span className="font-medium text-green-600">
                                          ${recommendation.estimatedSavings.toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {recommendation.implementationSteps && recommendation.implementationSteps.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium">Implementation Steps:</h5>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                          {recommendation.implementationSteps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                          ))}
                                        </ol>
                                      </div>
                                    )}
                                    
                                    {recommendation.risks && recommendation.risks.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-orange-600">Risks:</h5>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                          {recommendation.risks.map((risk, index) => (
                                            <li key={index}>{risk}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 pt-2">
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRecommendationApply?.(recommendation);
                                        }}
                                        disabled={recommendation.status === 'applied'}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Apply
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRecommendationDismiss?.(recommendation);
                                        }}
                                        disabled={recommendation.status === 'dismissed'}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Dismiss
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(recommendation.createdAt).toLocaleDateString()}
                              </span>
                              <ChevronRight 
                                className={`h-4 w-4 transition-transform ${
                                  expandedRecommendations.has(recommendation.id) ? 'rotate-90' : ''
                                }`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {filteredRecommendations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No recommendations found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or check back later for new recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowRecommendationsPanel;
