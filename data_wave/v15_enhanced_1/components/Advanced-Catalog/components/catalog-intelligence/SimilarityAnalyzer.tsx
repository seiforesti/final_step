"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, Radar, Compass, TrendingUp, Activity, BarChart3,
  Search, Filter, Settings, RefreshCw, Download, Upload,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  MoreHorizontal, Eye, EyeOff, Clock, Calendar,
  User, Users, Link, ExternalLink, Copy, Share2,
  AlertTriangle, CheckCircle, XCircle, Info,
  Database, FileText, Cpu, Server, Cloud, Globe,
  PieChart, LineChart, Layers, GitBranch, Network,
  Lightbulb, Rocket, Map, Route, Navigation,
  Award, Crown, Medal, Trophy, Shield, Badge as BadgeIcon,
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize2, Minimize2,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Plus, Minus, X, Check, Edit, Trash2,
  MessageSquare, Bell, Flag, Bookmark,
  Workflow, Boxes, Combine, Split, Shuffle,
  Hash, Tag, Tags, Sparkles, Brain, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service'
import { catalogAIService } from '../../services/catalog-ai.service'
import { useToast } from '@/components/ui/use-toast'

// Types for similarity analysis
interface DataAsset {
  id: string
  name: string
  type: 'dataset' | 'table' | 'column' | 'view' | 'schema' | 'database' | 'model' | 'report' | 'dashboard'
  category: string
  description: string
  owner: string
  created_at: Date
  updated_at: Date
  status: 'active' | 'inactive' | 'deprecated'
  metadata: Record<string, any>
  tags: string[]
  quality_score: number
  usage_frequency: number
  business_value: number
  schema_info?: SchemaInfo
  content_sample?: any[]
  embedding_vector?: number[]
  similarity_scores?: Record<string, number>
}

interface SchemaInfo {
  columns: ColumnInfo[]
  primary_keys: string[]
  foreign_keys: ForeignKeyInfo[]
  indexes: IndexInfo[]
  constraints: ConstraintInfo[]
  statistics: SchemaStatistics
}

interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  default_value?: any
  description?: string
  statistics?: ColumnStatistics
}

interface SimilarityAnalysis {
  id: string
  source_asset_id: string
  target_asset_id: string
  similarity_score: number
  similarity_type: 'structural' | 'semantic' | 'content' | 'usage' | 'contextual' | 'hybrid'
  analysis_method: 'embedding_cosine' | 'jaccard_similarity' | 'schema_comparison' | 'content_analysis' | 'ml_classification'
  confidence_score: number
  detailed_metrics: SimilarityMetrics
  created_at: Date
  analysis_duration: number
  metadata: {
    algorithm_version: string
    parameters: Record<string, any>
    feature_weights: Record<string, number>
    explanation: string
    recommendations: string[]
  }
}

interface SimilarityMetrics {
  structural_similarity: number
  semantic_similarity: number
  content_similarity: number
  usage_similarity: number
  schema_similarity: number
  tag_similarity: number
  description_similarity: number
  name_similarity: number
  breakdown: {
    feature_similarities: Record<string, number>
    weight_contributions: Record<string, number>
    distance_metrics: Record<string, number>
  }
}

interface SimilarityCluster {
  id: string
  name: string
  description: string
  cluster_method: 'hierarchical' | 'k_means' | 'dbscan' | 'spectral' | 'affinity_propagation' | 'mean_shift'
  similarity_threshold: number
  member_assets: DataAsset[]
  centroid_asset_id?: string
  cluster_metrics: {
    cohesion_score: number
    separation_score: number
    silhouette_score: number
    inertia: number
    density: number
  }
  created_at: Date
  metadata: {
    algorithm_parameters: Record<string, any>
    quality_metrics: Record<string, number>
    stability_score: number
    interpretability_score: number
  }
}

interface SimilarityRecommendation {
  id: string
  type: 'duplicate_detection' | 'data_consolidation' | 'relationship_discovery' | 'categorization' | 'quality_improvement'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  reasoning: string
  confidence_score: number
  impact_score: number
  involved_assets: DataAsset[]
  suggested_actions: SuggestedAction[]
  potential_benefits: string[]
  risks: string[]
  implementation_effort: 'low' | 'medium' | 'high'
  created_at: Date
}

interface SuggestedAction {
  id: string
  type: 'merge_assets' | 'create_relationship' | 'update_metadata' | 'consolidate_data' | 'improve_quality'
  title: string
  description: string
  parameters: Record<string, any>
  estimated_duration: string
  complexity: 'simple' | 'moderate' | 'complex'
  prerequisites: string[]
  expected_outcome: string
  risk_level: 'low' | 'medium' | 'high'
}

interface SimilarityConfiguration {
  similarity_threshold: number
  clustering_method: string
  feature_weights: {
    structural: number
    semantic: number
    content: number
    usage: number
    metadata: number
  }
  analysis_methods: string[]
  include_deprecated: boolean
  min_quality_score: number
  max_analysis_time: number
  enable_ml_enhancement: boolean
  auto_clustering: boolean
  similarity_cache_duration: number
}

interface SimilarityVisualization {
  type: 'heatmap' | 'network' | 'dendrogram' | 'scatter' | 'parallel_coordinates' | 'radar'
  data: any[]
  layout: any
  config: Record<string, any>
}

// Main SimilarityAnalyzer Component
export const SimilarityAnalyzer: React.FC = () => {
  // Core state management
  const [assets, setAssets] = useState<DataAsset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null)
  const [similarityAnalyses, setSimilarityAnalyses] = useState<SimilarityAnalysis[]>([])
  const [similarityClusters, setSimilarityClusters] = useState<SimilarityCluster[]>([])
  const [similarityRecommendations, setSimilarityRecommendations] = useState<SimilarityRecommendation[]>([])
  const [similarityConfig, setSimilarityConfig] = useState<SimilarityConfiguration>({
    similarity_threshold: 0.75,
    clustering_method: 'hierarchical',
    feature_weights: {
      structural: 0.3,
      semantic: 0.25,
      content: 0.2,
      usage: 0.15,
      metadata: 0.1
    },
    analysis_methods: ['embedding_cosine', 'schema_comparison', 'content_analysis'],
    include_deprecated: false,
    min_quality_score: 0.5,
    max_analysis_time: 300,
    enable_ml_enhancement: true,
    auto_clustering: true,
    similarity_cache_duration: 3600
  })

  // UI state management
  const [activeTab, setActiveTab] = useState('similarity')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'network' | 'heatmap'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [filterBy, setFilterBy] = useState<{
    similarity_types: string[]
    confidence_range: [number, number]
    asset_types: string[]
    categories: string[]
    include_low_confidence: boolean
  }>({
    similarity_types: [],
    confidence_range: [0.5, 1],
    asset_types: [],
    categories: [],
    include_low_confidence: false
  })

  // Analysis and processing state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [isClustering, setIsClustering] = useState(false)
  const [clusteringProgress, setClusteringProgress] = useState(0)

  // Dialog and modal states
  const [showSimilarityDetails, setShowSimilarityDetails] = useState(false)
  const [showClusterDetails, setShowClusterDetails] = useState(false)
  const [showRecommendationDetails, setShowRecommendationDetails] = useState(false)
  const [showConfiguration, setShowConfiguration] = useState(false)
  const [showBulkAnalysis, setShowBulkAnalysis] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Selected items for detailed view
  const [selectedSimilarity, setSelectedSimilarity] = useState<SimilarityAnalysis | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<SimilarityCluster | null>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<SimilarityRecommendation | null>(null)
  const [selectedVisualization, setSelectedVisualization] = useState<SimilarityVisualization | null>(null)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const visualizationRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Queries
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['similarityAssets', filterBy],
    queryFn: () => enterpriseCatalogService.getAssetsForSimilarityAnalysis(filterBy),
    staleTime: 60000
  })

  const { data: analysesData, isLoading: analysesLoading } = useQuery({
    queryKey: ['similarityAnalyses', selectedAsset?.id],
    queryFn: () => selectedAsset ? catalogAIService.getSimilarityAnalyses(selectedAsset.id) : [],
    enabled: !!selectedAsset,
    staleTime: 30000
  })

  const { data: clustersData, isLoading: clustersLoading } = useQuery({
    queryKey: ['similarityClusters', similarityConfig.clustering_method],
    queryFn: () => catalogAIService.getSimilarityClusters(similarityConfig),
    staleTime: 120000
  })

  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['similarityRecommendations'],
    queryFn: () => catalogAIService.getSimilarityRecommendations(),
    staleTime: 60000
  })

  // Mutations
  const runSimilarityAnalysisMutation = useMutation({
    mutationFn: ({ assetIds, config }: { assetIds: string[]; config: SimilarityConfiguration }) =>
      catalogAIService.runSimilarityAnalysis(assetIds, config),
    onMutate: () => {
      setIsAnalyzing(true)
      setAnalysisProgress(0)
      setAnalysisStatus('Initializing similarity analysis...')
    },
    onSuccess: (data) => {
      setIsAnalyzing(false)
      setAnalysisProgress(100)
      queryClient.invalidateQueries({ queryKey: ['similarityAnalyses'] })
      toast({ 
        title: "Analysis Complete", 
        description: `Analyzed ${data.analyses_completed} asset similarities` 
      })
    },
    onError: () => {
      setIsAnalyzing(false)
      toast({ title: "Analysis Failed", description: "Failed to complete similarity analysis", variant: "destructive" })
    }
  })

  const runClusteringMutation = useMutation({
    mutationFn: (config: SimilarityConfiguration) =>
      catalogAIService.runSimilarityClustering(config),
    onMutate: () => {
      setIsClustering(true)
      setClusteringProgress(0)
    },
    onSuccess: (data) => {
      setIsClustering(false)
      setClusteringProgress(100)
      queryClient.invalidateQueries({ queryKey: ['similarityClusters'] })
      toast({ 
        title: "Clustering Complete", 
        description: `Created ${data.clusters_created} similarity clusters` 
      })
    },
    onError: () => {
      setIsClustering(false)
      toast({ title: "Clustering Failed", description: "Failed to complete clustering", variant: "destructive" })
    }
  })

  const acceptRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) =>
      catalogAIService.acceptSimilarityRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['similarityRecommendations'] })
      toast({ title: "Recommendation Accepted", description: "Recommendation has been implemented" })
    }
  })

  const rejectRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) =>
      catalogAIService.rejectSimilarityRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['similarityRecommendations'] })
      toast({ title: "Recommendation Rejected", description: "Recommendation has been dismissed" })
    }
  })

  // Filtered and processed data
  const filteredAssets = useMemo(() => {
    if (!assets) return []
    
    return assets.filter(asset => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          asset.name.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.tags.some(tag => tag.toLowerCase().includes(query))
        
        if (!matchesSearch) return false
      }

      // Asset type filter
      if (filterBy.asset_types.length > 0 && !filterBy.asset_types.includes(asset.type)) {
        return false
      }

      // Category filter
      if (filterBy.categories.length > 0 && !filterBy.categories.includes(asset.category)) {
        return false
      }

      return true
    })
  }, [assets, searchQuery, filterBy])

  const filteredAnalyses = useMemo(() => {
    if (!similarityAnalyses) return []
    
    return similarityAnalyses.filter(analysis => {
      // Similarity type filter
      if (filterBy.similarity_types.length > 0 && !filterBy.similarity_types.includes(analysis.similarity_type)) {
        return false
      }

      // Confidence range filter
      if (analysis.confidence_score < filterBy.confidence_range[0] || 
          analysis.confidence_score > filterBy.confidence_range[1]) {
        return false
      }

      // Low confidence filter
      if (!filterBy.include_low_confidence && analysis.confidence_score < 0.7) {
        return false
      }

      return true
    })
  }, [similarityAnalyses, filterBy])

  // Helper functions
  const getSimilarityColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-600 bg-green-50'
    if (score >= 0.75) return 'text-blue-600 bg-blue-50'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50'
    if (score >= 0.45) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getSimilarityIcon = (type: string) => {
    const iconMap = {
      structural: Database,
      semantic: Brain,
      content: FileText,
      usage: Activity,
      contextual: Compass,
      hybrid: Combine
    }
    return iconMap[type] || Target
  }

  const getClusterColor = (method: string): string => {
    const colorMap = {
      hierarchical: 'text-purple-600',
      k_means: 'text-blue-600',
      dbscan: 'text-green-600',
      spectral: 'text-orange-600',
      affinity_propagation: 'text-red-600',
      mean_shift: 'text-indigo-600'
    }
    return colorMap[method] || 'text-gray-600'
  }

  // Event handlers
  const handleAssetSelect = (asset: DataAsset) => {
    setSelectedAsset(asset)
  }

  const handleRunSimilarityAnalysis = (assetIds?: string[]) => {
    const targetAssets = assetIds || (selectedAsset ? [selectedAsset.id] : selectedAssets)
    if (targetAssets.length === 0) {
      toast({ title: "No Assets Selected", description: "Please select assets to analyze", variant: "destructive" })
      return
    }

    runSimilarityAnalysisMutation.mutate({ assetIds: targetAssets, config: similarityConfig })
  }

  const handleRunClustering = () => {
    runClusteringMutation.mutate(similarityConfig)
  }

  const handleAcceptRecommendation = (recommendationId: string) => {
    acceptRecommendationMutation.mutate(recommendationId)
  }

  const handleRejectRecommendation = (recommendationId: string) => {
    rejectRecommendationMutation.mutate(recommendationId)
  }

  const handleConfigurationUpdate = (newConfig: Partial<SimilarityConfiguration>) => {
    setSimilarityConfig(prev => ({ ...prev, ...newConfig }))
  }

  const handleExportResults = (format: 'json' | 'csv' | 'xlsx') => {
    const data = {
      analyses: filteredAnalyses,
      clusters: similarityClusters,
      recommendations: similarityRecommendations,
      configuration: similarityConfig,
      exported_at: new Date().toISOString()
    }
    
    const filename = `similarity-analysis.${format}`
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
    toast({ title: "Export Complete", description: `Results exported as ${format.toUpperCase()}` })
  }

  // Render functions
  const renderAssetCard = (asset: DataAsset) => {
    const isSelected = selectedAsset?.id === asset.id
    const isInSelection = selectedAssets.includes(asset.id)
    
    return (
      <Card 
        key={asset.id}
        className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${isInSelection ? 'bg-blue-50' : ''}`}
        onClick={() => handleAssetSelect(asset)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {asset.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{asset.type}</Badge>
                  <Badge variant="secondary">{asset.category}</Badge>
                  {asset.similarity_scores && (
                    <div className="text-sm text-slate-500">
                      {Object.keys(asset.similarity_scores).length} similarities
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Checkbox
                checked={isInSelection}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAssets(prev => [...prev, asset.id])
                  } else {
                    setSelectedAssets(prev => prev.filter(id => id !== asset.id))
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleRunSimilarityAnalysis([asset.id])}>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze Similarity
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
            {asset.description}
          </p>

          {/* Similarity Scores */}
          {asset.similarity_scores && Object.keys(asset.similarity_scores).length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Top Similarities</div>
              <div className="space-y-1">
                {Object.entries(asset.similarity_scores)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([assetId, score], index) => {
                    const similarAsset = assets.find(a => a.id === assetId)
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1 mr-2">
                          {similarAsset?.name || assetId}
                        </span>
                        <Badge className={getSimilarityColor(score)}>
                          {Math.round(score * 100)}%
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Quality and Usage Metrics */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Quality:</span>
              <span className="font-medium">{Math.round(asset.quality_score * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Usage:</span>
              <span className="font-medium">{Math.round(asset.usage_frequency * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSimilarityCard = (analysis: SimilarityAnalysis) => {
    const Icon = getSimilarityIcon(analysis.similarity_type)
    const sourceAsset = assets.find(a => a.id === analysis.source_asset_id)
    const targetAsset = assets.find(a => a.id === analysis.target_asset_id)
    
    return (
      <Card 
        key={analysis.id}
        className="transition-all duration-200 hover:shadow-lg cursor-pointer"
        onClick={() => {
          setSelectedSimilarity(analysis)
          setShowSimilarityDetails(true)
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">
                  {Math.round(analysis.similarity_score * 100)}% Similar
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{analysis.similarity_type}</Badge>
                  <Badge variant="secondary">{analysis.analysis_method}</Badge>
                  <div className={`text-sm ${getSimilarityColor(analysis.confidence_score)}`}>
                    {Math.round(analysis.confidence_score * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link className="h-4 w-4 mr-2" />
                  Create Relationship
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Analysis
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Results
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Asset Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Source Asset</div>
                <div className="text-sm text-slate-600 truncate">
                  {sourceAsset?.name || analysis.source_asset_id}
                </div>
                <Badge variant="outline" className="text-xs">
                  {sourceAsset?.type}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Target Asset</div>
                <div className="text-sm text-slate-600 truncate">
                  {targetAsset?.name || analysis.target_asset_id}
                </div>
                <Badge variant="outline" className="text-xs">
                  {targetAsset?.type}
                </Badge>
              </div>
            </div>

            {/* Similarity Breakdown */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Similarity Breakdown</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Structural:</span>
                  <span>{Math.round(analysis.detailed_metrics.structural_similarity * 100)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Semantic:</span>
                  <span>{Math.round(analysis.detailed_metrics.semantic_similarity * 100)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Content:</span>
                  <span>{Math.round(analysis.detailed_metrics.content_similarity * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Analysis Time */}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Analysis Time:</span>
              <span className="font-medium">{analysis.analysis_duration}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderClusterCard = (cluster: SimilarityCluster) => {
    return (
      <Card 
        key={cluster.id}
        className="transition-all duration-200 hover:shadow-lg cursor-pointer"
        onClick={() => {
          setSelectedCluster(cluster)
          setShowClusterDetails(true)
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <Boxes className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {cluster.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{cluster.cluster_method}</Badge>
                  <Badge variant="secondary">{cluster.member_assets.length} assets</Badge>
                  <div className={`text-sm ${getClusterColor(cluster.cluster_method)}`}>
                    {Math.round(cluster.cluster_metrics.cohesion_score * 100)}% cohesion
                  </div>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Cluster
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Network className="h-4 w-4 mr-2" />
                  Visualize
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Cluster
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
            {cluster.description}
          </p>

          {/* Cluster Metrics */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Cluster Quality</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Cohesion:</span>
                <span className="font-medium">{Math.round(cluster.cluster_metrics.cohesion_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Separation:</span>
                <span className="font-medium">{Math.round(cluster.cluster_metrics.separation_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Silhouette:</span>
                <span className="font-medium">{Math.round(cluster.cluster_metrics.silhouette_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Density:</span>
                <span className="font-medium">{Math.round(cluster.cluster_metrics.density * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Member Assets Preview */}
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium">Member Assets</div>
            <div className="flex flex-wrap gap-1">
              {cluster.member_assets.slice(0, 4).map((asset, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {asset.name}
                </Badge>
              ))}
              {cluster.member_assets.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{cluster.member_assets.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Threshold */}
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-slate-500">Threshold:</span>
            <span className="font-medium">{Math.round(cluster.similarity_threshold * 100)}%</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderRecommendationCard = (recommendation: SimilarityRecommendation) => {
    const priorityColors = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    }
    
    return (
      <Card 
        key={recommendation.id}
        className="transition-all duration-200 hover:shadow-lg"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {recommendation.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={priorityColors[recommendation.priority]}>
                    {recommendation.priority}
                  </Badge>
                  <Badge variant="outline">{recommendation.type.replace('_', ' ')}</Badge>
                  <div className="text-sm text-slate-500">
                    {Math.round(recommendation.confidence_score * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAcceptRecommendation(recommendation.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectRecommendation(recommendation.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
            {recommendation.description}
          </p>

          {/* Reasoning */}
          <div className="space-y-2 mb-3">
            <div className="text-sm font-medium">AI Reasoning</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {recommendation.reasoning}
            </p>
          </div>

          {/* Involved Assets */}
          <div className="space-y-2 mb-3">
            <div className="text-sm font-medium">Involved Assets</div>
            <div className="flex flex-wrap gap-1">
              {recommendation.involved_assets.slice(0, 3).map((asset, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {asset.name}
                </Badge>
              ))}
              {recommendation.involved_assets.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{recommendation.involved_assets.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Impact and Effort */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Impact:</span>
              <span className="font-medium">{Math.round(recommendation.impact_score * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Effort:</span>
              <span className="font-medium">{recommendation.implementation_effort}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Effect hooks
  useEffect(() => {
    if (assetsData) {
      setAssets(assetsData)
    }
  }, [assetsData])

  useEffect(() => {
    if (analysesData) {
      setSimilarityAnalyses(analysesData)
    }
  }, [analysesData])

  useEffect(() => {
    if (clustersData) {
      setSimilarityClusters(clustersData)
    }
  }, [clustersData])

  useEffect(() => {
    if (recommendationsData) {
      setSimilarityRecommendations(recommendationsData)
    }
  }, [recommendationsData])

  // Simulate analysis progress
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          const newProgress = prev + Math.random() * 10
          if (newProgress >= 90) {
            setAnalysisStatus('Finalizing analysis...')
          } else if (newProgress >= 60) {
            setAnalysisStatus('Computing similarity scores...')
          } else if (newProgress >= 30) {
            setAnalysisStatus('Extracting features...')
          }
          return Math.min(newProgress, 95)
        })
      }, 500)

      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  // Simulate clustering progress
  useEffect(() => {
    if (isClustering) {
      const interval = setInterval(() => {
        setClusteringProgress(prev => Math.min(prev + Math.random() * 15, 95))
      }, 300)

      return () => clearInterval(interval)
    }
  }, [isClustering])

  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Similarity Analyzer
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Advanced similarity detection and clustering analysis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-10 w-64"
              />
            </div>

            {/* View Mode */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  {viewMode}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  List View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('network')}>
                  Network View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('heatmap')}>
                  Heatmap View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunSimilarityAnalysis()}
              disabled={isAnalyzing || selectedAssets.length === 0}
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              Analyze ({selectedAssets.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunClustering()}
              disabled={isClustering}
            >
              {isClustering ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Boxes className="h-4 w-4 mr-2" />
              )}
              Cluster
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkAnalysis(true)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Bulk Analysis
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportResults('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportResults('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportResults('xlsx')}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfiguration(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Indicators */}
        <AnimatePresence>
          {(isAnalyzing || isClustering) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20"
            >
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Similarity Analysis</span>
                    <span>{Math.round(analysisProgress)}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                  <div className="text-xs text-slate-600">{analysisStatus}</div>
                </div>
              )}
              
              {isClustering && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Clustering Analysis</span>
                    <span>{Math.round(clusteringProgress)}%</span>
                  </div>
                  <Progress value={clusteringProgress} className="h-2" />
                  <div className="text-xs text-slate-600">Running clustering algorithm...</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-4" ref={containerRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="similarity">Assets ({filteredAssets.length})</TabsTrigger>
              <TabsTrigger value="analyses">Analyses ({filteredAnalyses.length})</TabsTrigger>
              <TabsTrigger value="clusters">Clusters ({similarityClusters.length})</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations ({similarityRecommendations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="similarity" className="mt-4">
              {/* Bulk Selection Actions */}
              {selectedAssets.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedAssets.length} asset(s) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => handleRunSimilarityAnalysis()}
                        disabled={isAnalyzing}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Analyze Similarity
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedAssets([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {assetsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading assets...</p>
                  </div>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                }>
                  {filteredAssets.map(renderAssetCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analyses" className="mt-4">
              {analysesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading analyses...</p>
                  </div>
                </div>
              ) : filteredAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No similarity analyses found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Select assets and run similarity analysis to get started
                  </p>
                  <Button onClick={() => setActiveTab('similarity')}>
                    <Target className="h-4 w-4 mr-2" />
                    Select Assets
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAnalyses.map(renderSimilarityCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="clusters" className="mt-4">
              {clustersLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading clusters...</p>
                  </div>
                </div>
              ) : similarityClusters.length === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No similarity clusters found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Run clustering analysis to discover asset groups
                  </p>
                  <Button onClick={() => handleRunClustering()}>
                    <Boxes className="h-4 w-4 mr-2" />
                    Run Clustering
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {similarityClusters.map(renderClusterCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              {recommendationsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading recommendations...</p>
                  </div>
                </div>
              ) : similarityRecommendations.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No recommendations available
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Run similarity analysis to generate AI-powered recommendations
                  </p>
                  <Button onClick={() => setActiveTab('similarity')}>
                    <Target className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {similarityRecommendations.map(renderRecommendationCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Configuration Dialog */}
        <Dialog open={showConfiguration} onOpenChange={setShowConfiguration}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Similarity Analysis Configuration</DialogTitle>
              <DialogDescription>
                Configure similarity analysis parameters and algorithms
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Similarity Threshold */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Similarity Threshold: {Math.round(similarityConfig.similarity_threshold * 100)}%
                </Label>
                <Slider
                  value={[similarityConfig.similarity_threshold]}
                  onValueChange={([value]) => 
                    handleConfigurationUpdate({ similarity_threshold: value })
                  }
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  className="w-full"
                />
              </div>

              {/* Clustering Method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Clustering Method</Label>
                <Select 
                  value={similarityConfig.clustering_method} 
                  onValueChange={(value) => 
                    handleConfigurationUpdate({ clustering_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hierarchical">Hierarchical</SelectItem>
                    <SelectItem value="k_means">K-Means</SelectItem>
                    <SelectItem value="dbscan">DBSCAN</SelectItem>
                    <SelectItem value="spectral">Spectral</SelectItem>
                    <SelectItem value="affinity_propagation">Affinity Propagation</SelectItem>
                    <SelectItem value="mean_shift">Mean Shift</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feature Weights */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Feature Weights</Label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Structural ({Math.round(similarityConfig.feature_weights.structural * 100)}%)</Label>
                    <Slider
                      value={[similarityConfig.feature_weights.structural]}
                      onValueChange={([value]) => 
                        handleConfigurationUpdate({ 
                          feature_weights: { ...similarityConfig.feature_weights, structural: value }
                        })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Semantic ({Math.round(similarityConfig.feature_weights.semantic * 100)}%)</Label>
                    <Slider
                      value={[similarityConfig.feature_weights.semantic]}
                      onValueChange={([value]) => 
                        handleConfigurationUpdate({ 
                          feature_weights: { ...similarityConfig.feature_weights, semantic: value }
                        })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Content ({Math.round(similarityConfig.feature_weights.content * 100)}%)</Label>
                    <Slider
                      value={[similarityConfig.feature_weights.content]}
                      onValueChange={([value]) => 
                        handleConfigurationUpdate({ 
                          feature_weights: { ...similarityConfig.feature_weights, content: value }
                        })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Usage ({Math.round(similarityConfig.feature_weights.usage * 100)}%)</Label>
                    <Slider
                      value={[similarityConfig.feature_weights.usage]}
                      onValueChange={([value]) => 
                        handleConfigurationUpdate({ 
                          feature_weights: { ...similarityConfig.feature_weights, usage: value }
                        })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Metadata ({Math.round(similarityConfig.feature_weights.metadata * 100)}%)</Label>
                    <Slider
                      value={[similarityConfig.feature_weights.metadata]}
                      onValueChange={([value]) => 
                        handleConfigurationUpdate({ 
                          feature_weights: { ...similarityConfig.feature_weights, metadata: value }
                        })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-32"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Advanced Options</Label>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Include Deprecated Assets</Label>
                  <Switch
                    checked={similarityConfig.include_deprecated}
                    onCheckedChange={(checked) => 
                      handleConfigurationUpdate({ include_deprecated: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable ML Enhancement</Label>
                  <Switch
                    checked={similarityConfig.enable_ml_enhancement}
                    onCheckedChange={(checked) => 
                      handleConfigurationUpdate({ enable_ml_enhancement: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto Clustering</Label>
                  <Switch
                    checked={similarityConfig.auto_clustering}
                    onCheckedChange={(checked) => 
                      handleConfigurationUpdate({ auto_clustering: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConfiguration(false)}>
                Cancel
              </Button>
              <Button>
                Apply Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Similarity Details Dialog */}
        <Dialog open={showSimilarityDetails} onOpenChange={setShowSimilarityDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedSimilarity && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Similarity Analysis Details</span>
                    <Badge className={getSimilarityColor(selectedSimilarity.similarity_score)}>
                      {Math.round(selectedSimilarity.similarity_score * 100)}% Similar
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Detailed breakdown of similarity analysis between assets
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Asset Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Source Asset</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="font-medium">
                            {assets.find(a => a.id === selectedSimilarity.source_asset_id)?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-slate-600">
                            ID: {selectedSimilarity.source_asset_id}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Target Asset</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="font-medium">
                            {assets.find(a => a.id === selectedSimilarity.target_asset_id)?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-slate-600">
                            ID: {selectedSimilarity.target_asset_id}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Similarity Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Structural Similarity:</span>
                            <span className="font-medium">
                              {Math.round(selectedSimilarity.detailed_metrics.structural_similarity * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Semantic Similarity:</span>
                            <span className="font-medium">
                              {Math.round(selectedSimilarity.detailed_metrics.semantic_similarity * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Content Similarity:</span>
                            <span className="font-medium">
                              {Math.round(selectedSimilarity.detailed_metrics.content_similarity * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Usage Similarity:</span>
                            <span className="font-medium">
                              {Math.round(selectedSimilarity.detailed_metrics.usage_similarity * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Schema Similarity:</span>
                            <span className="font-medium">
                              {Math.round(selectedSimilarity.detailed_metrics.schema_similarity * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tag Similarity:</span>
                            <span className="font-medium">
                              {Math.round(selectedSimilarity.detailed_metrics.tag_similarity * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Description Similarity:</span>
                            <span className="font-medium">
                              {Math.round(selectedSimilarity.detailed_metrics.description_similarity * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Name Similarity:</span>
                            <span className="font-medium">
                              {Math.round(selectedSimilarity.detailed_metrics.name_similarity * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analysis Metadata */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Analysis Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Analysis Method:</span>
                            <span className="font-medium">{selectedSimilarity.analysis_method}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Similarity Type:</span>
                            <span className="font-medium">{selectedSimilarity.similarity_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Confidence Score:</span>
                            <span className="font-medium">{Math.round(selectedSimilarity.confidence_score * 100)}%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Analysis Duration:</span>
                            <span className="font-medium">{selectedSimilarity.analysis_duration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Algorithm Version:</span>
                            <span className="font-medium">{selectedSimilarity.metadata.algorithm_version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Created:</span>
                            <span className="font-medium">
                              {new Date(selectedSimilarity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Explanation */}
                  {selectedSimilarity.metadata.explanation && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">AI Explanation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedSimilarity.metadata.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommendations */}
                  {selectedSimilarity.metadata.recommendations && selectedSimilarity.metadata.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedSimilarity.metadata.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default SimilarityAnalyzer