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
  Monitor,
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
  Desktop,
  Watch,
  Gamepad2,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Fax,
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
  Stopwatch,
  AlarmClock,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus
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
  WorkflowInsights,
  WorkflowInsight,
  InsightType,
  InsightSeverity,
  InsightCategory,
  InsightRecommendation
} from '../../types/workflow.types';

import { useWorkflowInsights } from '../../hooks/useWorkflowAnalytics';

interface WorkflowInsightsPanelProps {
  workflowId?: string;
  className?: string;
  onInsightClick?: (insight: WorkflowInsight) => void;
  onRecommendationApply?: (recommendation: InsightRecommendation) => void;
}

export const WorkflowInsightsPanel: React.FC<WorkflowInsightsPanelProps> = ({
  workflowId,
  className = '',
  onInsightClick,
  onRecommendationApply
}) => {
  const { insights, isLoading, error } = useWorkflowInsights();
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<InsightSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  // Filter insights based on selected criteria
  const filteredInsights = useMemo(() => {
    if (!insights?.data) return [];

    return insights.data.filter(insight => {
      const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'all' || insight.severity === selectedSeverity;
      const matchesSearch = searchQuery === '' || 
        insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSeverity && matchesSearch;
    });
  }, [insights, selectedCategory, selectedSeverity, searchQuery]);

  // Group insights by category
  const groupedInsights = useMemo(() => {
    const groups: Record<string, WorkflowInsight[]> = {};
    
    filteredInsights.forEach(insight => {
      const category = insight.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(insight);
    });

    return groups;
  }, [filteredInsights]);

  // Toggle insight expansion
  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  // Get severity color
  const getSeverityColor = (severity: InsightSeverity) => {
    switch (severity) {
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

  // Get category icon
  const getCategoryIcon = (category: InsightCategory) => {
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
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Get insight type icon
  const getInsightTypeIcon = (type: InsightType) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'optimization':
        return <Target className="h-4 w-4" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Workflow Insights
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
            Workflow Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load workflow insights. Please try again.
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
            <CardTitle>Workflow Insights</CardTitle>
            <Badge variant="secondary">{filteredInsights.length}</Badge>
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
          AI-powered insights and recommendations for workflow optimization
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as InsightCategory | 'all')}>
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
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value as InsightSeverity | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Insights List */}
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {getCategoryIcon(category as InsightCategory)}
                  {category.charAt(0).toUpperCase() + category.slice(1)} Insights
                  <Badge variant="outline">{categoryInsights.length}</Badge>
                </div>
                
                <div className="space-y-3">
                  {categoryInsights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          expandedInsights.has(insight.id) ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          toggleInsightExpansion(insight.id);
                          onInsightClick?.(insight);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex items-center gap-2 mt-1">
                                {getInsightTypeIcon(insight.type)}
                                <Badge className={getSeverityColor(insight.severity)}>
                                  {insight.severity}
                                </Badge>
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {insight.description}
                                </p>
                                
                                {expandedInsights.has(insight.id) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3"
                                  >
                                    {insight.metrics && (
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        {Object.entries(insight.metrics).map(([key, value]) => (
                                          <div key={key} className="flex justify-between">
                                            <span className="text-muted-foreground">{key}:</span>
                                            <span className="font-medium">{value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {insight.recommendations && insight.recommendations.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium">Recommendations:</h5>
                                        {insight.recommendations.map((recommendation, index) => (
                                          <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-md">
                                            <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                                            <div className="flex-1">
                                              <p className="text-sm">{recommendation.description}</p>
                                              {recommendation.impact && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  Impact: {recommendation.impact}
                                                </p>
                                              )}
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onRecommendationApply?.(recommendation);
                                              }}
                                            >
                                              Apply
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(insight.timestamp).toLocaleDateString()}
                              </span>
                              <ChevronRight 
                                className={`h-4 w-4 transition-transform ${
                                  expandedInsights.has(insight.id) ? 'rotate-90' : ''
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

        {filteredInsights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No insights found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or check back later for new insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowInsightsPanel;
