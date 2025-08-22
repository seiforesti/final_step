'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Progress 
} from "@/components/ui/progress";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  cn 
} from "@/lib/utils";
import { format, subDays, subHours, isWithinInterval } from "date-fns";
import { 
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Share,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Activity,
  Database,
  Target,
  Star,
  Heart,
  Eye,
  Search,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Flame as Fire,
  Award,
  Crown,
  Sparkles,
  Calendar,
  Clock3,
  Globe,
  Hash,
  Link2,
  ExternalLink,
  Copy,
  ChevronUp,
  ChevronDown,
  Info,
  HelpCircle,
  Layers,
  FileType,
  Folder,
  Tag,
  MapPin,
  Navigation,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart as RechartsLineChart, 
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart as RechartsScatterChart,
  Scatter,
  ComposedChart,
  Treemap
} from 'recharts';

// Import types and services
import { 
  PopularityAnalysis,
  AssetPopularity,
  TrendingAsset,
  PopularityMetrics,
  UserEngagement,
  PopularityTrend,
  RecommendationScore,
  UsagePattern,
  CatalogApiResponse
} from '../../types';

import { popularityAnalysisService, catalogAnalyticsService } from '../../services';
import { useCatalogAnalytics } from '../../hooks';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface PopularityAnalyzerProps {
  className?: string;
  embedded?: boolean;
  assetTypes?: string[];
  timeRange?: string;
  onAssetSelect?: (asset: TrendingAsset) => void;
  onError?: (error: Error) => void;
}

interface PopularityConfiguration {
  timeRange: 'last_1h' | 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'custom';
  customDateRange?: {
    start: Date;
    end: Date;
  };
  assetTypes: string[];
  userGroups: string[];
  popularityMetrics: ('views' | 'downloads' | 'shares' | 'bookmarks' | 'ratings' | 'comments')[];
  trendingThreshold: number;
  minimumInteractions: number;
  weightConfig: {
    views: number;
    downloads: number;
    shares: number;
    bookmarks: number;
    ratings: number;
    comments: number;
  };
}

interface TrendingConfiguration {
  algorithm: 'velocity' | 'momentum' | 'engagement' | 'composite';
  timeWindow: 'hourly' | 'daily' | 'weekly';
  decayFactor: number;
  boostNewContent: boolean;
  categoryWeights: Record<string, number>;
}

interface RecommendationConfig {
  engine: 'collaborative' | 'content_based' | 'hybrid';
  maxRecommendations: number;
  diversityFactor: number;
  personalizeForUser: boolean;
  includeNewAssets: boolean;
  excludeViewed: boolean;
}

interface PopularityInsight {
  id: string;
  type: 'trending_up' | 'trending_down' | 'viral' | 'seasonal' | 'anomaly';
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  metric: string;
  change: number;
  confidence: number;
  timeframe: string;
  recommendations: string[];
}

interface EngagementMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_RANGES = [
  { value: 'last_1h', label: 'Last Hour' },
  { value: 'last_24h', label: 'Last 24 Hours' },
  { value: 'last_7d', label: 'Last 7 Days' },
  { value: 'last_30d', label: 'Last 30 Days' },
  { value: 'last_90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

const POPULARITY_METRICS = [
  { value: 'views', label: 'Views', icon: Eye, weight: 1 },
  { value: 'downloads', label: 'Downloads', icon: Download, weight: 3 },
  { value: 'shares', label: 'Shares', icon: Share, weight: 5 },
  { value: 'bookmarks', label: 'Bookmarks', icon: Bookmark, weight: 4 },
  { value: 'ratings', label: 'Ratings', icon: Star, weight: 3 },
  { value: 'comments', label: 'Comments', icon: MessageSquare, weight: 2 }
];

const TRENDING_ALGORITHMS = [
  { value: 'velocity', label: 'Velocity Based', description: 'Rate of growth in interactions' },
  { value: 'momentum', label: 'Momentum Based', description: 'Accelerating engagement patterns' },
  { value: 'engagement', label: 'Engagement Focused', description: 'Quality of user interactions' },
  { value: 'composite', label: 'Composite Score', description: 'Weighted combination of all factors' }
];

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

const ASSET_TYPES = [
  { value: 'dataset', label: 'Datasets', icon: Database },
  { value: 'dashboard', label: 'Dashboards', icon: BarChart3 },
  { value: 'report', label: 'Reports', icon: FileType },
  { value: 'model', label: 'Models', icon: Target },
  { value: 'pipeline', label: 'Pipelines', icon: Layers },
  { value: 'api', label: 'APIs', icon: Link2 }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PopularityAnalyzer: React.FC<PopularityAnalyzerProps> = ({
  className,
  embedded = false,
  assetTypes = ['dataset', 'dashboard', 'report'],
  timeRange = 'last_7d',
  onAssetSelect,
  onError
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<string>('trending');
  const [popularityConfig, setPopularityConfig] = useState<PopularityConfiguration>({
    timeRange: timeRange as any,
    assetTypes,
    userGroups: [],
    popularityMetrics: ['views', 'downloads', 'shares', 'bookmarks'],
    trendingThreshold: 0.1,
    minimumInteractions: 5,
    weightConfig: {
      views: 1,
      downloads: 3,
      shares: 5,
      bookmarks: 4,
      ratings: 3,
      comments: 2
    }
  });
  const [trendingConfig, setTrendingConfig] = useState<TrendingConfiguration>({
    algorithm: 'composite',
    timeWindow: 'daily',
    decayFactor: 0.8,
    boostNewContent: true,
    categoryWeights: {}
  });
  const [recommendationConfig, setRecommendationConfig] = useState<RecommendationConfig>({
    engine: 'hybrid',
    maxRecommendations: 10,
    diversityFactor: 0.3,
    personalizeForUser: true,
    includeNewAssets: true,
    excludeViewed: false
  });
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'trend' | 'recent' | 'rating'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterByType, setFilterByType] = useState<string[]>([]);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: subDays(new Date(), 7),
    end: new Date()
  });

  const queryClient = useQueryClient();

  // ============================================================================
  // HOOKS & API INTEGRATION
  // ============================================================================

  const {
    generateReport,
    exportData,
    isLoading: analyticsLoading
  } = useCatalogAnalytics();

  // Fetch popularity analysis
  const { 
    data: popularityAnalysis, 
    isLoading: popularityLoading,
    refetch: refetchPopularity 
  } = useQuery({
    queryKey: ['popularity-analysis', popularityConfig],
    queryFn: async () => {
      const timeRange = popularityConfig.timeRange === 'custom' 
        ? { start: customDateRange.start, end: customDateRange.end }
        : { range: popularityConfig.timeRange };
      
      const response = await popularityAnalysisService.getPopularityAnalysis({
        ...timeRange,
        assetTypes: popularityConfig.assetTypes,
        metrics: popularityConfig.popularityMetrics,
        weights: popularityConfig.weightConfig,
        minimumInteractions: popularityConfig.minimumInteractions
      });
      return response.data;
    }
  });

  // Fetch trending assets
  const { 
    data: trendingAssets = [],
    isLoading: trendingLoading 
  } = useQuery({
    queryKey: ['trending-assets', trendingConfig, popularityConfig],
    queryFn: async () => {
      const response = await popularityAnalysisService.getTrendingAssets({
        algorithm: trendingConfig.algorithm,
        timeWindow: trendingConfig.timeWindow,
        threshold: popularityConfig.trendingThreshold,
        assetTypes: popularityConfig.assetTypes,
        limit: 50
      });
      return response.data || [];
    }
  });

  // Fetch popularity metrics
  const { 
    data: popularityMetrics,
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ['popularity-metrics', popularityConfig.timeRange],
    queryFn: async () => {
      const response = await popularityAnalysisService.getPopularityMetrics({
        timeRange: popularityConfig.timeRange,
        assetTypes: popularityConfig.assetTypes
      });
      return response.data;
    }
  });

  // Fetch user engagement data
  const { 
    data: engagementData,
    isLoading: engagementLoading 
  } = useQuery({
    queryKey: ['user-engagement', popularityConfig.timeRange],
    queryFn: async () => {
      const response = await popularityAnalysisService.getUserEngagement({
        timeRange: popularityConfig.timeRange,
        assetTypes: popularityConfig.assetTypes
      });
      return response.data;
    }
  });

  // Fetch popularity insights
  const { 
    data: popularityInsights = [],
    isLoading: insightsLoading 
  } = useQuery({
    queryKey: ['popularity-insights', popularityConfig.timeRange],
    queryFn: async () => {
      const response = await popularityAnalysisService.getPopularityInsights({
        timeRange: popularityConfig.timeRange,
        assetTypes: popularityConfig.assetTypes
      });
      return response.data || [];
    }
  });

  // Fetch recommendations
  const { 
    data: recommendations = [],
    isLoading: recommendationsLoading 
  } = useQuery({
    queryKey: ['popularity-recommendations', recommendationConfig],
    queryFn: async () => {
      const response = await popularityAnalysisService.getRecommendations({
        engine: recommendationConfig.engine,
        maxRecommendations: recommendationConfig.maxRecommendations,
        diversityFactor: recommendationConfig.diversityFactor,
        assetTypes: popularityConfig.assetTypes
      });
      return response.data || [];
    }
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const sortedTrendingAssets = useMemo(() => {
    if (!trendingAssets) return [];

    return [...trendingAssets]
      .filter(asset => 
        filterByType.length === 0 || filterByType.includes(asset.type)
      )
      .sort((a, b) => {
        let aVal: number, bVal: number;
        
        switch (sortBy) {
          case 'popularity':
            aVal = a.popularityScore;
            bVal = b.popularityScore;
            break;
          case 'trend':
            aVal = a.trendScore;
            bVal = b.trendScore;
            break;
          case 'recent':
            aVal = new Date(a.lastActivity).getTime();
            bVal = new Date(b.lastActivity).getTime();
            break;
          case 'rating':
            aVal = a.avgRating || 0;
            bVal = b.avgRating || 0;
            break;
          default:
            aVal = a.popularityScore;
            bVal = b.popularityScore;
        }
        
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
  }, [trendingAssets, sortBy, sortOrder, filterByType]);

  const engagementMetrics = useMemo(() => {
    if (!engagementData) return [];

    return [
      {
        name: 'Total Views',
        value: engagementData.totalViews,
        change: engagementData.viewsChange,
        trend: engagementData.viewsChange > 0 ? 'up' : engagementData.viewsChange < 0 ? 'down' : 'stable',
        icon: Eye,
        color: '#3b82f6'
      },
      {
        name: 'Downloads',
        value: engagementData.totalDownloads,
        change: engagementData.downloadsChange,
        trend: engagementData.downloadsChange > 0 ? 'up' : engagementData.downloadsChange < 0 ? 'down' : 'stable',
        icon: Download,
        color: '#10b981'
      },
      {
        name: 'Shares',
        value: engagementData.totalShares,
        change: engagementData.sharesChange,
        trend: engagementData.sharesChange > 0 ? 'up' : engagementData.sharesChange < 0 ? 'down' : 'stable',
        icon: Share,
        color: '#f59e0b'
      },
      {
        name: 'Active Users',
        value: engagementData.activeUsers,
        change: engagementData.usersChange,
        trend: engagementData.usersChange > 0 ? 'up' : engagementData.usersChange < 0 ? 'down' : 'stable',
        icon: Users,
        color: '#8b5cf6'
      }
    ] as EngagementMetric[];
  }, [engagementData]);

  const popularityTrendData = useMemo(() => {
    if (!popularityAnalysis?.trends) return [];

    return popularityAnalysis.trends.map(point => ({
      timestamp: point.timestamp,
      date: format(new Date(point.timestamp), 'MMM dd'),
      popularity: point.averagePopularity,
      trending: point.trendingAssets,
      engagement: point.engagementRate,
      velocity: point.velocityScore
    }));
  }, [popularityAnalysis]);

  const assetTypeDistribution = useMemo(() => {
    if (!popularityAnalysis?.assetDistribution) return [];

    return Object.entries(popularityAnalysis.assetDistribution).map(([type, data]) => ({
      name: ASSET_TYPES.find(t => t.value === type)?.label || type,
      value: (data as any).count,
      popularity: (data as any).avgPopularity,
      fill: CHART_COLORS[Object.keys(popularityAnalysis.assetDistribution).indexOf(type) % CHART_COLORS.length]
    }));
  }, [popularityAnalysis]);

  const isLoading = popularityLoading || trendingLoading || metricsLoading || engagementLoading;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAssetSelect = useCallback((asset: TrendingAsset) => {
    setSelectedAsset(asset.id);
    onAssetSelect?.(asset);
  }, [onAssetSelect]);

  const handleTimeRangeChange = useCallback((range: string) => {
    setPopularityConfig(prev => ({ ...prev, timeRange: range as any }));
  }, []);

  const handleAssetTypeToggle = useCallback((type: string) => {
    setFilterByType(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleExportAnalysis = useCallback(async () => {
    try {
      const response = await popularityAnalysisService.exportPopularityAnalysis({
        timeRange: popularityConfig.timeRange,
        assetTypes: popularityConfig.assetTypes,
        format: 'PDF',
        includeCharts: true,
        includeRecommendations: true
      });
      
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
      
      toast.success('Popularity analysis exported successfully');
    } catch (error) {
      toast.error('Failed to export analysis');
      onError?.(error as Error);
    }
  }, [popularityConfig, onError]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderEngagementMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {engagementMetrics.map((metric) => (
        <motion.div
          key={metric.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
                    <h3 className="text-sm font-medium text-muted-foreground">{metric.name}</h3>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">
                      {metric.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    {metric.trend === 'up' ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : metric.trend === 'down' ? (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <Minus className="h-3 w-3 text-gray-500" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      metric.trend === 'up' ? "text-green-600" :
                      metric.trend === 'down' ? "text-red-600" :
                      "text-gray-600"
                    )}>
                      {metric.change > 0 ? '+' : ''}
                      {metric.change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs prev period</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${metric.color}20` }}
                  >
                    <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderTrendingAssets = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Fire className="h-5 w-5 text-orange-500" />
              Trending Assets
            </CardTitle>
            <CardDescription>
              Assets with the highest growth in popularity and engagement
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Asset Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ASSET_TYPES.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={filterByType.includes(type.value)}
                    onCheckedChange={() => handleAssetTypeToggle(type.value)}
                  >
                    <type.icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="trend">Trend Score</SelectItem>
                <SelectItem value="recent">Recent Activity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTrendingAssets.slice(0, 20).map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedAsset === asset.id && "ring-2 ring-blue-500 bg-blue-50"
              )}
              onClick={() => handleAssetSelect(asset)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {ASSET_TYPES.find(t => t.value === asset.type)?.icon && (
                      React.createElement(
                        ASSET_TYPES.find(t => t.value === asset.type)!.icon,
                        { className: "h-4 w-4 text-muted-foreground" }
                      )
                    )}
                    <h4 className="font-medium line-clamp-1">{asset.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {ASSET_TYPES.find(t => t.value === asset.type)?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {asset.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{asset.views.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{asset.downloads.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{asset.avgRating?.toFixed(1) || 'N/A'}</span>
                    </span>
                    <span>{format(new Date(asset.lastActivity), 'MMM dd')}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">
                      {(asset.popularityScore * 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Popularity</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      {asset.trendDirection === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : asset.trendDirection === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        asset.trendDirection === 'up' ? "text-green-600" :
                        asset.trendDirection === 'down' ? "text-red-600" :
                        "text-gray-600"
                      )}>
                        {asset.trendScore > 0 ? '+' : ''}
                        {(asset.trendScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Trend</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {sortedTrendingAssets.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Trending Assets Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or time range to see trending content
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPopularityTrends = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Popularity Trends
        </CardTitle>
        <CardDescription>
          Overall popularity and engagement trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={popularityTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="popularity" 
                stroke={CHART_COLORS[0]}
                fill={CHART_COLORS[0]}
                fillOpacity={0.3}
                name="Average Popularity"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="trending" 
                stroke={CHART_COLORS[1]} 
                strokeWidth={2}
                name="Trending Assets"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="engagement" 
                stroke={CHART_COLORS[2]} 
                strokeWidth={2}
                name="Engagement Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderAssetTypeAnalysis = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Type Distribution</CardTitle>
          <CardDescription>Popularity distribution across asset types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={assetTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Categories by Popularity</CardTitle>
          <CardDescription>Most popular asset categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assetTypeDistribution
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, 6)
              .map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.value} assets</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{category.popularity.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">avg popularity</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Popularity Insights
          {popularityInsights.length > 0 && (
            <Badge variant="secondary">{popularityInsights.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>AI-generated insights about trending patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {popularityInsights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 border rounded-lg",
                insight.type === 'viral' && "border-red-200 bg-red-50",
                insight.type === 'trending_up' && "border-green-200 bg-green-50",
                insight.type === 'trending_down' && "border-orange-200 bg-orange-50",
                insight.type === 'seasonal' && "border-blue-200 bg-blue-50",
                insight.type === 'anomaly' && "border-purple-200 bg-purple-50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {insight.type === 'viral' && <Fire className="h-4 w-4 text-red-500" />}
                    {insight.type === 'trending_up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {insight.type === 'trending_down' && <TrendingDown className="h-4 w-4 text-orange-500" />}
                    {insight.type === 'seasonal' && <Calendar className="h-4 w-4 text-blue-500" />}
                    {insight.type === 'anomaly' && <Zap className="h-4 w-4 text-purple-500" />}
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.timeframe}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Asset: {insight.assetName}</span>
                    <span>Change: {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%</span>
                    <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                  </div>
                  {insight.recommendations.length > 0 && (
                    <div className="mt-3">
                      <Label className="text-xs font-medium">Recommendations:</Label>
                      <ul className="mt-1 space-y-1">
                        {insight.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <Progress value={insight.confidence * 100} className="w-16 h-2" />
                </div>
              </div>
            </motion.div>
          ))}
          
          {popularityInsights.length === 0 && (
            <div className="text-center py-8">
              <Info className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
              <p className="text-muted-foreground">
                Insights will appear as we detect significant popularity patterns
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderRecommendations = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Recommended for You
        </CardTitle>
        <CardDescription>Personalized recommendations based on popularity trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.slice(0, 10).map((recommendation, index) => (
            <div key={recommendation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium line-clamp-1">{recommendation.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {recommendation.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Match: {(recommendation.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Asset</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bookmark</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderControlPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Configuration</CardTitle>
        <CardDescription>Configure popularity analysis parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Time Range</Label>
          <Select value={popularityConfig.timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Trending Algorithm</Label>
          <Select 
            value={trendingConfig.algorithm} 
            onValueChange={(value) => 
              setTrendingConfig(prev => ({ ...prev, algorithm: value as any }))
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRENDING_ALGORITHMS.map((algo) => (
                <SelectItem key={algo.value} value={algo.value}>
                  {algo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Trending Threshold</Label>
          <Slider
            value={[popularityConfig.trendingThreshold * 100]}
            onValueChange={([value]) => 
              setPopularityConfig(prev => ({ ...prev, trendingThreshold: value / 100 }))
            }
            min={1}
            max={50}
            step={1}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {(popularityConfig.trendingThreshold * 100).toFixed(0)}% minimum growth
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium">Minimum Interactions</Label>
          <Slider
            value={[popularityConfig.minimumInteractions]}
            onValueChange={([value]) => 
              setPopularityConfig(prev => ({ ...prev, minimumInteractions: value }))
            }
            min={1}
            max={100}
            step={1}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {popularityConfig.minimumInteractions} interactions required
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Metric Weights</Label>
          {POPULARITY_METRICS.map((metric) => (
            <div key={metric.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className="h-4 w-4" />
                <span className="text-sm">{metric.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[popularityConfig.weightConfig[metric.value as keyof typeof popularityConfig.weightConfig]]}
                  onValueChange={([value]) => 
                    setPopularityConfig(prev => ({
                      ...prev,
                      weightConfig: { ...prev.weightConfig, [metric.value]: value }
                    }))
                  }
                  min={0}
                  max={10}
                  step={1}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground w-4">
                  {popularityConfig.weightConfig[metric.value as keyof typeof popularityConfig.weightConfig]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center space-x-2">
          <Button onClick={() => refetchPopularity()} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh Analysis
          </Button>
          <Button variant="outline" onClick={handleExportAnalysis}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={cn("w-full space-y-6", className)}>
        {/* Header */}
        {!embedded && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Popularity Analyzer</h1>
              <p className="text-muted-foreground">
                Analyze asset popularity, trends, and user engagement patterns
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1">
                {trendingAssets.length} trending assets
              </Badge>
              <Button variant="outline" onClick={() => setShowHeatmap(!showHeatmap)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                {showHeatmap ? 'Hide' : 'Show'} Heatmap
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Analyzing popularity patterns...</p>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-6">
              {/* Engagement Metrics */}
              {renderEngagementMetrics()}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {renderTrendingAssets()}
                </div>
                <div className="space-y-6">
                  {renderControlPanel()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {renderPopularityTrends()}
              {renderAssetTypeAnalysis()}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {renderInsights()}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {renderRecommendations()}
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendation Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Engine</Label>
                        <Select 
                          value={recommendationConfig.engine} 
                          onValueChange={(value) => 
                            setRecommendationConfig(prev => ({ ...prev, engine: value as any }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="collaborative">Collaborative Filtering</SelectItem>
                            <SelectItem value="content_based">Content-Based</SelectItem>
                            <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Max Recommendations</Label>
                        <Slider
                          value={[recommendationConfig.maxRecommendations]}
                          onValueChange={([value]) => 
                            setRecommendationConfig(prev => ({ ...prev, maxRecommendations: value }))
                          }
                          min={5}
                          max={50}
                          step={5}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {recommendationConfig.maxRecommendations} recommendations
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Diversity Factor</Label>
                        <Slider
                          value={[recommendationConfig.diversityFactor * 100]}
                          onValueChange={([value]) => 
                            setRecommendationConfig(prev => ({ ...prev, diversityFactor: value / 100 }))
                          }
                          min={0}
                          max={100}
                          step={10}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {(recommendationConfig.diversityFactor * 100).toFixed(0)}% diversity
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Include New Assets</Label>
                          <Switch
                            checked={recommendationConfig.includeNewAssets}
                            onCheckedChange={(checked) => 
                              setRecommendationConfig(prev => ({ ...prev, includeNewAssets: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Exclude Viewed</Label>
                          <Switch
                            checked={recommendationConfig.excludeViewed}
                            onCheckedChange={(checked) => 
                              setRecommendationConfig(prev => ({ ...prev, excludeViewed: checked }))
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PopularityAnalyzer;