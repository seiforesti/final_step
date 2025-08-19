"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Network, GitBranch, Layers, Target, Zap, Eye, EyeOff,
  Search, Filter, Settings, Download, Share2, RefreshCw,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut,
  Play, Pause, Square, SkipBack, SkipForward,
  AlertTriangle, CheckCircle, XCircle, Clock, 
  Database, FileText, Cpu, Server, Cloud, Globe,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Compass, Map, Route, Navigation, Crosshair,
  Activity, TrendingUp, BarChart3, PieChart,
  Users, Tag, Hash, Link, Folder, Archive,
  Calendar, MapPin, Sparkles, Lightbulb,
  Brain, Telescope, Microscope, Radar,
  TreePine, Shuffle, GitMerge, Split,
  Workflow, Hierarchy, Boxes, Combine
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service'
import { useToast } from '@/components/ui/use-toast'

// Types for relationship mapping
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
  technical_debt: number
  relationships: string[]
  parent_id?: string
  children_ids: string[]
}

interface Relationship {
  id: string
  source_id: string
  target_id: string
  type: 'parent_child' | 'dependency' | 'similarity' | 'usage' | 'transformation' | 'reference' | 'composition' | 'inheritance'
  subtype: string
  strength: number
  confidence: number
  direction: 'bidirectional' | 'source_to_target' | 'target_to_source'
  created_at: Date
  discovered_by: 'manual' | 'automatic' | 'ml_inference' | 'pattern_analysis'
  metadata: {
    description?: string
    business_context?: string
    technical_details?: string
    validation_status?: 'validated' | 'pending' | 'rejected'
    validation_notes?: string
    impact_score?: number
    frequency?: number
    last_verified?: Date
  }
  attributes: RelationshipAttribute[]
}

interface RelationshipAttribute {
  name: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  description?: string
  importance: 'low' | 'medium' | 'high' | 'critical'
}

interface RelationshipPattern {
  id: string
  name: string
  description: string
  pattern_type: 'structural' | 'semantic' | 'behavioral' | 'temporal'
  detection_rules: DetectionRule[]
  confidence_threshold: number
  examples: string[]
  created_by: string
  created_at: Date
  usage_count: number
  accuracy_rate: number
}

interface DetectionRule {
  id: string
  name: string
  condition: string
  weight: number
  parameters: Record<string, any>
}

interface RelationshipCluster {
  id: string
  name: string
  description: string
  center_asset_id: string
  member_asset_ids: string[]
  cluster_type: 'semantic' | 'structural' | 'functional' | 'domain'
  cohesion_score: number
  separation_score: number
  created_at: Date
  metadata: Record<string, any>
}

interface RelationshipAnalysis {
  asset_id: string
  relationship_summary: {
    total_relationships: number
    incoming_relationships: number
    outgoing_relationships: number
    bidirectional_relationships: number
    relationship_types: Record<string, number>
    strongest_relationships: Relationship[]
    weakest_relationships: Relationship[]
  }
  centrality_metrics: {
    degree_centrality: number
    betweenness_centrality: number
    closeness_centrality: number
    eigenvector_centrality: number
    pagerank_score: number
  }
  community_membership: {
    cluster_id: string
    cluster_name: string
    membership_strength: number
  }[]
  influence_metrics: {
    direct_influence: number
    indirect_influence: number
    influence_radius: number
    influenced_assets: string[]
    influencing_assets: string[]
  }
  recommendations: {
    potential_relationships: Array<{
      target_asset_id: string
      relationship_type: string
      confidence: number
      reasoning: string
    }>
    relationship_improvements: Array<{
      relationship_id: string
      improvement_type: string
      description: string
      priority: 'low' | 'medium' | 'high'
    }>
  }
}

interface RelationshipFilter {
  relationship_types: string[]
  strength_range: [number, number]
  confidence_range: [number, number]
  discovery_methods: string[]
  validation_status: string[]
  date_range: { start: Date; end: Date }
  asset_types: string[]
  include_deprecated: boolean
}

interface VisualizationSettings {
  layout: 'force' | 'hierarchical' | 'circular' | 'cluster' | 'matrix' | 'sankey'
  node_size_metric: 'static' | 'degree' | 'centrality' | 'business_value' | 'usage'
  edge_width_metric: 'static' | 'strength' | 'confidence' | 'frequency'
  color_scheme: 'type' | 'cluster' | 'centrality' | 'quality' | 'status'
  show_labels: boolean
  show_metrics: boolean
  show_clusters: boolean
  enable_physics: boolean
  cluster_threshold: number
  max_relationships: number
}

// Main RelationshipMapper Component
export const RelationshipMapper: React.FC = () => {
  // Core state management
  const [assets, setAssets] = useState<DataAsset[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null)
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null)
  const [relationshipAnalysis, setRelationshipAnalysis] = useState<RelationshipAnalysis | null>(null)
  const [relationshipPatterns, setRelationshipPatterns] = useState<RelationshipPattern[]>([])
  const [relationshipClusters, setRelationshipClusters] = useState<RelationshipCluster[]>([])
  
  // Filter and visualization state
  const [relationshipFilter, setRelationshipFilter] = useState<RelationshipFilter>({
    relationship_types: [],
    strength_range: [0, 1],
    confidence_range: [0, 1],
    discovery_methods: [],
    validation_status: [],
    date_range: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
    asset_types: [],
    include_deprecated: false
  })

  const [visualizationSettings, setVisualizationSettings] = useState<VisualizationSettings>({
    layout: 'force',
    node_size_metric: 'degree',
    edge_width_metric: 'strength',
    color_scheme: 'type',
    show_labels: true,
    show_metrics: false,
    show_clusters: true,
    enable_physics: true,
    cluster_threshold: 0.7,
    max_relationships: 1000
  })

  // UI state management
  const [activeTab, setActiveTab] = useState('map')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedAsset, setFocusedAsset] = useState<string | null>(null)
  const [highlightedAssets, setHighlightedAssets] = useState<string[]>([])
  const [highlightedRelationships, setHighlightedRelationships] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAssetDetails, setShowAssetDetails] = useState(false)
  const [showRelationshipDetails, setShowRelationshipDetails] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [showPatternDiscovery, setShowPatternDiscovery] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Analysis state
  const [analysisMode, setAnalysisMode] = useState<'overview' | 'centrality' | 'clusters' | 'patterns'>('overview')
  const [selectedCluster, setSelectedCluster] = useState<RelationshipCluster | null>(null)
  const [patternDiscoveryRunning, setPatternDiscoveryRunning] = useState(false)
  const [relationshipValidation, setRelationshipValidation] = useState<{
    pending: Relationship[]
    validated: Relationship[]
    rejected: Relationship[]
  }>({ pending: [], validated: [], rejected: [] })

  // Refs for visualization
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  // Hooks
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for assets and relationships
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['relationshipAssets', relationshipFilter],
    queryFn: () => enterpriseCatalogService.getAssetsWithRelationships(relationshipFilter),
    staleTime: 60000
  })

  const { data: relationshipsData, isLoading: relationshipsLoading } = useQuery({
    queryKey: ['relationships', relationshipFilter],
    queryFn: () => enterpriseCatalogService.getRelationships(relationshipFilter),
    staleTime: 60000
  })

  // Query for relationship analysis
  const { data: analysisData, isLoading: analysisLoading } = useQuery({
    queryKey: ['relationshipAnalysis', selectedAsset?.id],
    queryFn: () => selectedAsset ? enterpriseCatalogService.getRelationshipAnalysis(selectedAsset.id) : null,
    enabled: !!selectedAsset,
    staleTime: 30000
  })

  // Query for relationship patterns
  const { data: patternsData, isLoading: patternsLoading } = useQuery({
    queryKey: ['relationshipPatterns'],
    queryFn: () => enterpriseCatalogService.getRelationshipPatterns(),
    staleTime: 300000
  })

  // Query for relationship clusters
  const { data: clustersData, isLoading: clustersLoading } = useQuery({
    queryKey: ['relationshipClusters', visualizationSettings.cluster_threshold],
    queryFn: () => enterpriseCatalogService.getRelationshipClusters(visualizationSettings.cluster_threshold),
    staleTime: 120000
  })

  // Mutations
  const discoverPatternsMutation = useMutation({
    mutationFn: (params: any) => enterpriseCatalogService.discoverRelationshipPatterns(params),
    onMutate: () => setPatternDiscoveryRunning(true),
    onSuccess: (data) => {
      setPatternDiscoveryRunning(false)
      queryClient.invalidateQueries({ queryKey: ['relationshipPatterns'] })
      toast({ title: "Pattern Discovery Complete", description: `Discovered ${data.patterns_found} new patterns` })
    },
    onError: () => {
      setPatternDiscoveryRunning(false)
      toast({ title: "Pattern Discovery Failed", description: "Failed to discover new patterns", variant: "destructive" })
    }
  })

  const validateRelationshipMutation = useMutation({
    mutationFn: ({ relationshipId, status, notes }: { relationshipId: string; status: string; notes?: string }) =>
      enterpriseCatalogService.validateRelationship(relationshipId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] })
      toast({ title: "Relationship Validated", description: "Relationship validation updated successfully" })
    }
  })

  const createRelationshipMutation = useMutation({
    mutationFn: (relationshipData: Partial<Relationship>) =>
      enterpriseCatalogService.createRelationship(relationshipData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] })
      toast({ title: "Relationship Created", description: "New relationship created successfully" })
    }
  })

  // Visualization functions
  const renderRelationshipMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !assets.length || !relationships.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Apply layout algorithm
    const layoutData = applyLayoutAlgorithm(assets, relationships, visualizationSettings.layout, rect.width, rect.height)

    // Draw clusters if enabled
    if (visualizationSettings.show_clusters && relationshipClusters.length > 0) {
      drawClusters(ctx, layoutData.nodes, relationshipClusters)
    }

    // Draw relationships (edges)
    relationships.forEach(relationship => {
      drawRelationship(ctx, relationship, layoutData.nodes)
    })

    // Draw assets (nodes)
    layoutData.nodes.forEach(node => {
      drawAsset(ctx, node)
    })

    // Draw labels if enabled
    if (visualizationSettings.show_labels) {
      layoutData.nodes.forEach(node => {
        drawAssetLabel(ctx, node)
      })
    }

    // Draw metrics if enabled
    if (visualizationSettings.show_metrics) {
      layoutData.nodes.forEach(node => {
        drawAssetMetrics(ctx, node)
      })
    }

    // Draw highlights
    if (highlightedAssets.length > 0 || highlightedRelationships.length > 0) {
      drawHighlights(ctx, layoutData.nodes, relationships)
    }

  }, [assets, relationships, relationshipClusters, visualizationSettings, highlightedAssets, highlightedRelationships])

  const applyLayoutAlgorithm = (assets: DataAsset[], relationships: Relationship[], layout: string, width: number, height: number) => {
    const nodes = assets.map(asset => ({
      ...asset,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: getAssetSize(asset)
    }))

    switch (layout) {
      case 'force':
        return applyForceLayout(nodes, relationships, width, height)
      case 'hierarchical':
        return applyHierarchicalLayout(nodes, relationships, width, height)
      case 'circular':
        return applyCircularLayout(nodes, width, height)
      case 'cluster':
        return applyClusterLayout(nodes, relationships, relationshipClusters, width, height)
      default:
        return { nodes, edges: relationships }
    }
  }

  const applyForceLayout = (nodes: any[], relationships: Relationship[], width: number, height: number) => {
    // Simplified force-directed layout
    const iterations = 100
    const k = Math.sqrt((width * height) / nodes.length)
    
    for (let i = 0; i < iterations; i++) {
      // Repulsive forces
      nodes.forEach(node1 => {
        let fx = 0, fy = 0
        nodes.forEach(node2 => {
          if (node1.id === node2.id) return
          const dx = node1.x - node2.x
          const dy = node1.y - node2.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          const force = k * k / distance
          fx += (dx / distance) * force
          fy += (dy / distance) * force
        })
        node1.vx = (node1.vx + fx) * 0.1
        node1.vy = (node1.vy + fy) * 0.1
      })

      // Attractive forces
      relationships.forEach(rel => {
        const source = nodes.find(n => n.id === rel.source_id)
        const target = nodes.find(n => n.id === rel.target_id)
        if (!source || !target) return

        const dx = target.x - source.x
        const dy = target.y - source.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        const force = distance * distance / k * rel.strength
        const fx = (dx / distance) * force * 0.01
        const fy = (dy / distance) * force * 0.01

        source.vx += fx
        source.vy += fy
        target.vx -= fx
        target.vy -= fy
      })

      // Update positions
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x))
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y))
        node.vx *= 0.9
        node.vy *= 0.9
      })
    }

    return { nodes, edges: relationships }
  }

  const applyHierarchicalLayout = (nodes: any[], relationships: Relationship[], width: number, height: number) => {
    // Build hierarchy based on parent-child relationships
    const hierarchy = buildHierarchy(nodes, relationships)
    const levels = assignLevels(hierarchy)
    
    // Position nodes by level
    Object.entries(levels).forEach(([levelStr, levelNodes]) => {
      const level = parseInt(levelStr)
      const y = (level + 1) * (height / (Object.keys(levels).length + 1))
      const nodeWidth = width / (levelNodes.length + 1)
      
      levelNodes.forEach((node: any, index: number) => {
        node.x = (index + 1) * nodeWidth
        node.y = y
      })
    })

    return { nodes, edges: relationships }
  }

  const applyCircularLayout = (nodes: any[], width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3
    
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length
      node.x = centerX + radius * Math.cos(angle)
      node.y = centerY + radius * Math.sin(angle)
    })

    return { nodes, edges: relationships }
  }

  const applyClusterLayout = (nodes: any[], relationships: Relationship[], clusters: RelationshipCluster[], width: number, height: number) => {
    if (clusters.length === 0) {
      return applyForceLayout(nodes, relationships, width, height)
    }

    // Position clusters in a grid
    const cols = Math.ceil(Math.sqrt(clusters.length))
    const rows = Math.ceil(clusters.length / cols)
    const clusterWidth = width / cols
    const clusterHeight = height / rows

    clusters.forEach((cluster, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const centerX = (col + 0.5) * clusterWidth
      const centerY = (row + 0.5) * clusterHeight
      const radius = Math.min(clusterWidth, clusterHeight) / 3

      // Position cluster members in a circle
      cluster.member_asset_ids.forEach((assetId, memberIndex) => {
        const node = nodes.find(n => n.id === assetId)
        if (node) {
          const angle = (2 * Math.PI * memberIndex) / cluster.member_asset_ids.length
          node.x = centerX + radius * Math.cos(angle)
          node.y = centerY + radius * Math.sin(angle)
        }
      })
    })

    // Position unclustered nodes
    const clusteredAssetIds = new Set(clusters.flatMap(c => c.member_asset_ids))
    const unclusteredNodes = nodes.filter(n => !clusteredAssetIds.has(n.id))
    
    unclusteredNodes.forEach((node, index) => {
      node.x = Math.random() * width
      node.y = Math.random() * height
    })

    return { nodes, edges: relationships }
  }

  const buildHierarchy = (nodes: any[], relationships: Relationship[]) => {
    const hierarchy: Record<string, any> = {}
    const parentChildRels = relationships.filter(r => r.type === 'parent_child')
    
    nodes.forEach(node => {
      hierarchy[node.id] = { ...node, children: [], parent: null }
    })

    parentChildRels.forEach(rel => {
      if (hierarchy[rel.source_id] && hierarchy[rel.target_id]) {
        hierarchy[rel.source_id].children.push(hierarchy[rel.target_id])
        hierarchy[rel.target_id].parent = hierarchy[rel.source_id]
      }
    })

    return hierarchy
  }

  const assignLevels = (hierarchy: Record<string, any>) => {
    const levels: Record<number, any[]> = {}
    const visited = new Set<string>()

    const assignLevel = (nodeId: string, level: number) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      
      if (!levels[level]) levels[level] = []
      levels[level].push(hierarchy[nodeId])
      
      hierarchy[nodeId].children.forEach((child: any) => {
        assignLevel(child.id, level + 1)
      })
    }

    // Start from root nodes
    Object.values(hierarchy).forEach((node: any) => {
      if (!node.parent) {
        assignLevel(node.id, 0)
      }
    })

    return levels
  }

  const drawAsset = (ctx: CanvasRenderingContext2D, asset: any) => {
    const isSelected = selectedAsset?.id === asset.id
    const isHighlighted = highlightedAssets.includes(asset.id)
    const isFocused = focusedAsset === asset.id

    // Draw shadow for selected/focused assets
    if (isSelected || isFocused) {
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
    }

    // Draw asset circle
    ctx.beginPath()
    ctx.arc(asset.x, asset.y, asset.radius, 0, 2 * Math.PI)
    ctx.fillStyle = getAssetColor(asset)
    ctx.fill()

    // Draw border
    ctx.strokeStyle = isSelected ? '#3b82f6' : isFocused ? '#6366f1' : '#ffffff'
    ctx.lineWidth = isSelected ? 3 : isFocused ? 2 : 1
    ctx.stroke()

    // Draw highlight ring
    if (isHighlighted) {
      ctx.beginPath()
      ctx.arc(asset.x, asset.y, asset.radius + 5, 0, 2 * Math.PI)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw asset icon
    drawAssetIcon(ctx, asset)

    // Draw status indicator
    drawStatusIndicator(ctx, asset)

    if (isSelected || isFocused) {
      ctx.restore()
    }
  }

  const drawRelationship = (ctx: CanvasRenderingContext2D, relationship: Relationship, nodes: any[]) => {
    const source = nodes.find(n => n.id === relationship.source_id)
    const target = nodes.find(n => n.id === relationship.target_id)
    
    if (!source || !target) return

    const isSelected = selectedRelationship?.id === relationship.id
    const isHighlighted = highlightedRelationships.includes(relationship.id)

    // Calculate edge path
    const dx = target.x - source.x
    const dy = target.y - source.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return

    const sourceRadius = source.radius
    const targetRadius = target.radius
    
    const startX = source.x + (dx / distance) * sourceRadius
    const startY = source.y + (dy / distance) * sourceRadius
    const endX = target.x - (dx / distance) * targetRadius
    const endY = target.y - (dy / distance) * targetRadius

    // Draw relationship line
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    
    if (relationship.type === 'parent_child') {
      // Straight line for hierarchical relationships
      ctx.lineTo(endX, endY)
    } else {
      // Curved line for other relationships
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2
      const controlX = midX + (dy / distance) * 20
      const controlY = midY - (dx / distance) * 20
      ctx.quadraticCurveTo(controlX, controlY, endX, endY)
    }

    ctx.strokeStyle = isSelected ? '#3b82f6' : isHighlighted ? '#fbbf24' : getRelationshipColor(relationship)
    ctx.lineWidth = isSelected ? getRelationshipWidth(relationship) + 2 : getRelationshipWidth(relationship)
    ctx.globalAlpha = isHighlighted ? 1 : 0.7
    ctx.stroke()
    ctx.globalAlpha = 1

    // Draw arrow
    if (relationship.direction !== 'target_to_source') {
      drawArrow(ctx, endX, endY, Math.atan2(dy, dx), getRelationshipColor(relationship))
    }

    if (relationship.direction === 'bidirectional' || relationship.direction === 'target_to_source') {
      drawArrow(ctx, startX, startY, Math.atan2(-dy, -dx), getRelationshipColor(relationship))
    }

    // Draw relationship label if selected
    if (isSelected) {
      drawRelationshipLabel(ctx, relationship, (startX + endX) / 2, (startY + endY) / 2)
    }
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) => {
    const arrowSize = 8
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-arrowSize, -arrowSize / 2)
    ctx.lineTo(-arrowSize, arrowSize / 2)
    ctx.closePath()
    
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
  }

  const drawClusters = (ctx: CanvasRenderingContext2D, nodes: any[], clusters: RelationshipCluster[]) => {
    clusters.forEach(cluster => {
      const clusterNodes = nodes.filter(n => cluster.member_asset_ids.includes(n.id))
      if (clusterNodes.length < 2) return

      // Calculate cluster bounds
      const minX = Math.min(...clusterNodes.map(n => n.x - n.radius))
      const maxX = Math.max(...clusterNodes.map(n => n.x + n.radius))
      const minY = Math.min(...clusterNodes.map(n => n.y - n.radius))
      const maxY = Math.max(...clusterNodes.map(n => n.y + n.radius))

      const padding = 20
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      const width = maxX - minX + padding * 2
      const height = maxY - minY + padding * 2

      // Draw cluster background
      ctx.fillStyle = getClusterColor(cluster.cluster_type)
      ctx.globalAlpha = 0.1
      ctx.fillRect(centerX - width / 2, centerY - height / 2, width, height)
      ctx.globalAlpha = 1

      // Draw cluster border
      ctx.strokeStyle = getClusterColor(cluster.cluster_type)
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(centerX - width / 2, centerY - height / 2, width, height)
      ctx.setLineDash([])

      // Draw cluster label
      ctx.fillStyle = getClusterColor(cluster.cluster_type)
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(cluster.name, centerX, centerY - height / 2 - 5)
    })
  }

  const drawAssetIcon = (ctx: CanvasRenderingContext2D, asset: any) => {
    const icon = getAssetIcon(asset.type)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${asset.radius}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icon, asset.x, asset.y)
  }

  const drawStatusIndicator = (ctx: CanvasRenderingContext2D, asset: any) => {
    const statusColors = {
      active: '#10b981',
      inactive: '#6b7280',
      deprecated: '#f59e0b'
    }

    ctx.beginPath()
    ctx.arc(asset.x + asset.radius - 3, asset.y - asset.radius + 3, 4, 0, 2 * Math.PI)
    ctx.fillStyle = statusColors[asset.status] || '#6b7280'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const drawAssetLabel = (ctx: CanvasRenderingContext2D, asset: any) => {
    ctx.fillStyle = '#374151'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    const textWidth = ctx.measureText(asset.name).width
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(
      asset.x - textWidth / 2 - 4,
      asset.y + asset.radius + 5,
      textWidth + 8,
      16
    )
    
    ctx.fillStyle = '#374151'
    ctx.fillText(asset.name, asset.x, asset.y + asset.radius + 8)
  }

  const drawAssetMetrics = (ctx: CanvasRenderingContext2D, asset: any) => {
    const metrics = `Q:${asset.quality_score}%`
    ctx.fillStyle = '#6b7280'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(metrics, asset.x, asset.y + asset.radius + 25)
  }

  const drawRelationshipLabel = (ctx: CanvasRenderingContext2D, relationship: Relationship, x: number, y: number) => {
    const text = relationship.type
    const textWidth = ctx.measureText(text).width
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(x - textWidth / 2 - 4, y - 8, textWidth + 8, 16)
    ctx.strokeStyle = '#d1d5db'
    ctx.strokeRect(x - textWidth / 2 - 4, y - 8, textWidth + 8, 16)
    
    ctx.fillStyle = '#374151'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x, y)
  }

  const drawHighlights = (ctx: CanvasRenderingContext2D, nodes: any[], relationships: Relationship[]) => {
    // Dim non-highlighted elements
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()
  }

  // Helper functions
  const getAssetSize = (asset: DataAsset): number => {
    const baseSize = 15
    const maxSize = 40
    const minSize = 10

    switch (visualizationSettings.node_size_metric) {
      case 'degree':
        return Math.max(minSize, Math.min(maxSize, baseSize + asset.relationships.length * 2))
      case 'centrality':
        // Would need centrality calculation
        return baseSize
      case 'business_value':
        return Math.max(minSize, Math.min(maxSize, baseSize + asset.business_value * 20))
      case 'usage':
        return Math.max(minSize, Math.min(maxSize, baseSize + asset.usage_frequency * 20))
      default:
        return baseSize
    }
  }

  const getAssetColor = (asset: DataAsset): string => {
    const colorSchemes = {
      type: {
        dataset: '#3b82f6',
        table: '#8b5cf6',
        column: '#06b6d4',
        view: '#10b981',
        schema: '#f59e0b',
        database: '#ef4444',
        model: '#6366f1',
        report: '#84cc16',
        dashboard: '#f97316'
      },
      status: {
        active: '#10b981',
        inactive: '#6b7280',
        deprecated: '#f59e0b'
      },
      quality: (score: number) => {
        if (score >= 90) return '#10b981'
        if (score >= 70) return '#f59e0b'
        if (score >= 50) return '#f97316'
        return '#ef4444'
      }
    }

    switch (visualizationSettings.color_scheme) {
      case 'type':
        return colorSchemes.type[asset.type] || '#6b7280'
      case 'status':
        return colorSchemes.status[asset.status] || '#6b7280'
      case 'quality':
        return colorSchemes.quality(asset.quality_score)
      default:
        return '#3b82f6'
    }
  }

  const getRelationshipColor = (relationship: Relationship): string => {
    const relationshipColors = {
      parent_child: '#3b82f6',
      dependency: '#8b5cf6',
      similarity: '#06b6d4',
      usage: '#10b981',
      transformation: '#f59e0b',
      reference: '#ef4444',
      composition: '#6366f1',
      inheritance: '#84cc16'
    }
    return relationshipColors[relationship.type] || '#6b7280'
  }

  const getRelationshipWidth = (relationship: Relationship): number => {
    const baseWidth = 2
    const maxWidth = 8
    const minWidth = 1

    switch (visualizationSettings.edge_width_metric) {
      case 'strength':
        return Math.max(minWidth, Math.min(maxWidth, baseWidth + relationship.strength * 4))
      case 'confidence':
        return Math.max(minWidth, Math.min(maxWidth, baseWidth + relationship.confidence * 4))
      case 'frequency':
        return Math.max(minWidth, Math.min(maxWidth, baseWidth + (relationship.metadata.frequency || 0) * 4))
      default:
        return baseWidth
    }
  }

  const getAssetIcon = (type: string): string => {
    const iconMap = {
      dataset: '📊',
      table: '🗃️',
      column: '📋',
      view: '👁️',
      schema: '🏗️',
      database: '🗄️',
      model: '🧠',
      report: '📄',
      dashboard: '📈'
    }
    return iconMap[type] || '📦'
  }

  const getClusterColor = (clusterType: string): string => {
    const clusterColors = {
      semantic: '#3b82f6',
      structural: '#8b5cf6',
      functional: '#10b981',
      domain: '#f59e0b'
    }
    return clusterColors[clusterType] || '#6b7280'
  }

  // Interaction handlers
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !assets.length) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check for asset click
    let clickedAsset: DataAsset | null = null
    for (const asset of assets) {
      const distance = Math.sqrt(Math.pow(x - (asset as any).x, 2) + Math.pow(y - (asset as any).y, 2))
      if (distance <= getAssetSize(asset)) {
        clickedAsset = asset
        break
      }
    }

    if (clickedAsset) {
      setSelectedAsset(clickedAsset)
      setShowAssetDetails(true)
      setFocusedAsset(clickedAsset.id)
      
      // Highlight related assets
      const relatedAssetIds = relationships
        .filter(r => r.source_id === clickedAsset!.id || r.target_id === clickedAsset!.id)
        .map(r => r.source_id === clickedAsset!.id ? r.target_id : r.source_id)
      
      setHighlightedAssets([clickedAsset.id, ...relatedAssetIds])
      
      const relatedRelationshipIds = relationships
        .filter(r => r.source_id === clickedAsset!.id || r.target_id === clickedAsset!.id)
        .map(r => r.id)
      
      setHighlightedRelationships(relatedRelationshipIds)
    } else {
      setSelectedAsset(null)
      setFocusedAsset(null)
      setHighlightedAssets([])
      setHighlightedRelationships([])
    }
  }, [assets, relationships])

  // Search and filter functions
  const searchAssets = useCallback((query: string) => {
    if (!query.trim()) {
      setHighlightedAssets([])
      return
    }

    const matchingAssets = assets.filter(asset =>
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.description.toLowerCase().includes(query.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    setHighlightedAssets(matchingAssets.map(a => a.id))
  }, [assets])

  const applyFilters = useCallback(() => {
    // Filter logic would be applied here
    // This would typically involve API calls with filter parameters
  }, [relationshipFilter])

  // Pattern discovery functions
  const runPatternDiscovery = () => {
    const params = {
      asset_types: relationshipFilter.asset_types,
      confidence_threshold: 0.7,
      min_support: 3,
      max_patterns: 50
    }
    discoverPatternsMutation.mutate(params)
  }

  // Relationship validation functions
  const validateRelationship = (relationshipId: string, status: 'validated' | 'rejected', notes?: string) => {
    validateRelationshipMutation.mutate({ relationshipId, status, notes })
  }

  // Export functions
  const exportRelationshipMap = (format: 'png' | 'json' | 'csv') => {
    switch (format) {
      case 'png':
        exportAsPNG()
        break
      case 'json':
        exportAsJSON()
        break
      case 'csv':
        exportAsCSV()
        break
    }
  }

  const exportAsPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'relationship-map.png'
        link.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  const exportAsJSON = () => {
    const data = {
      assets,
      relationships,
      clusters: relationshipClusters,
      patterns: relationshipPatterns
    }

    const dataStr = JSON.stringify(data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'relationship-map.json'
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const exportAsCSV = () => {
    // Export relationships as CSV
    const headers = ['source_id', 'target_id', 'type', 'strength', 'confidence', 'direction']
    const rows = relationships.map(rel => [
      rel.source_id,
      rel.target_id,
      rel.type,
      rel.strength,
      rel.confidence,
      rel.direction
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'relationships.csv'
    link.click()
    
    URL.revokeObjectURL(url)
  }

  // Effect hooks
  useEffect(() => {
    if (assetsData) {
      setAssets(assetsData)
    }
  }, [assetsData])

  useEffect(() => {
    if (relationshipsData) {
      setRelationships(relationshipsData)
    }
  }, [relationshipsData])

  useEffect(() => {
    if (analysisData) {
      setRelationshipAnalysis(analysisData)
    }
  }, [analysisData])

  useEffect(() => {
    if (patternsData) {
      setRelationshipPatterns(patternsData)
    }
  }, [patternsData])

  useEffect(() => {
    if (clustersData) {
      setRelationshipClusters(clustersData)
    }
  }, [clustersData])

  useEffect(() => {
    const animate = () => {
      renderRelationshipMap()
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [renderRelationshipMap])

  useEffect(() => {
    searchAssets(searchQuery)
  }, [searchQuery, searchAssets])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <Network className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Relationship Mapper
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Discover and visualize data asset relationships
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

            {/* Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPatternDiscovery(true)}
            >
              <Brain className="h-4 w-4 mr-2" />
              Discover Patterns
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportRelationshipMap('png')}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportRelationshipMap('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportRelationshipMap('csv')}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <AnimatePresence>
            {(showFilters || showSettings) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden"
              >
                <div className="p-4 h-full overflow-y-auto">
                  <Tabs value={showFilters ? 'filters' : 'settings'} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger 
                        value="filters" 
                        onClick={() => { setShowFilters(true); setShowSettings(false) }}
                      >
                        Filters
                      </TabsTrigger>
                      <TabsTrigger 
                        value="settings"
                        onClick={() => { setShowSettings(true); setShowFilters(false) }}
                      >
                        Settings
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="filters" className="space-y-4 mt-4">
                      {/* Relationship Type Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Relationship Types</Label>
                        <div className="space-y-1">
                          {['parent_child', 'dependency', 'similarity', 'usage', 'transformation', 'reference'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                checked={relationshipFilter.relationship_types.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setRelationshipFilter(prev => ({
                                      ...prev,
                                      relationship_types: [...prev.relationship_types, type]
                                    }))
                                  } else {
                                    setRelationshipFilter(prev => ({
                                      ...prev,
                                      relationship_types: prev.relationship_types.filter(t => t !== type)
                                    }))
                                  }
                                }}
                              />
                              <Label className="text-sm capitalize">{type.replace('_', ' ')}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strength Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Strength Range: {relationshipFilter.strength_range[0]} - {relationshipFilter.strength_range[1]}
                        </Label>
                        <div className="px-2">
                          <Slider
                            value={relationshipFilter.strength_range}
                            onValueChange={(value) => 
                              setRelationshipFilter(prev => ({ ...prev, strength_range: value as [number, number] }))
                            }
                            min={0}
                            max={1}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Confidence Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Confidence Range: {relationshipFilter.confidence_range[0]} - {relationshipFilter.confidence_range[1]}
                        </Label>
                        <div className="px-2">
                          <Slider
                            value={relationshipFilter.confidence_range}
                            onValueChange={(value) => 
                              setRelationshipFilter(prev => ({ ...prev, confidence_range: value as [number, number] }))
                            }
                            min={0}
                            max={1}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Asset Type Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Asset Types</Label>
                        <div className="space-y-1">
                          {['dataset', 'table', 'column', 'view', 'schema', 'database', 'model'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                checked={relationshipFilter.asset_types.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setRelationshipFilter(prev => ({
                                      ...prev,
                                      asset_types: [...prev.asset_types, type]
                                    }))
                                  } else {
                                    setRelationshipFilter(prev => ({
                                      ...prev,
                                      asset_types: prev.asset_types.filter(t => t !== type)
                                    }))
                                  }
                                }}
                              />
                              <Label className="text-sm capitalize">{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button onClick={applyFilters} className="w-full">
                        Apply Filters
                      </Button>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 mt-4">
                      {/* Layout Settings */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Layout Algorithm</Label>
                        <Select 
                          value={visualizationSettings.layout} 
                          onValueChange={(value: any) => 
                            setVisualizationSettings(prev => ({ ...prev, layout: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="force">Force-Directed</SelectItem>
                            <SelectItem value="hierarchical">Hierarchical</SelectItem>
                            <SelectItem value="circular">Circular</SelectItem>
                            <SelectItem value="cluster">Cluster-Based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Node Size Metric */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Node Size Based On</Label>
                        <Select 
                          value={visualizationSettings.node_size_metric} 
                          onValueChange={(value: any) => 
                            setVisualizationSettings(prev => ({ ...prev, node_size_metric: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="static">Static Size</SelectItem>
                            <SelectItem value="degree">Relationship Count</SelectItem>
                            <SelectItem value="centrality">Centrality</SelectItem>
                            <SelectItem value="business_value">Business Value</SelectItem>
                            <SelectItem value="usage">Usage Frequency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Color Scheme */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Color Scheme</Label>
                        <Select 
                          value={visualizationSettings.color_scheme} 
                          onValueChange={(value: any) => 
                            setVisualizationSettings(prev => ({ ...prev, color_scheme: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="type">By Asset Type</SelectItem>
                            <SelectItem value="cluster">By Cluster</SelectItem>
                            <SelectItem value="centrality">By Centrality</SelectItem>
                            <SelectItem value="quality">By Quality</SelectItem>
                            <SelectItem value="status">By Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Display Options */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Display Options</Label>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Labels</Label>
                          <Switch
                            checked={visualizationSettings.show_labels}
                            onCheckedChange={(checked) => 
                              setVisualizationSettings(prev => ({ ...prev, show_labels: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Metrics</Label>
                          <Switch
                            checked={visualizationSettings.show_metrics}
                            onCheckedChange={(checked) => 
                              setVisualizationSettings(prev => ({ ...prev, show_metrics: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Clusters</Label>
                          <Switch
                            checked={visualizationSettings.show_clusters}
                            onCheckedChange={(checked) => 
                              setVisualizationSettings(prev => ({ ...prev, show_clusters: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Enable Physics</Label>
                          <Switch
                            checked={visualizationSettings.enable_physics}
                            onCheckedChange={(checked) => 
                              setVisualizationSettings(prev => ({ ...prev, enable_physics: checked }))
                            }
                          />
                        </div>
                      </div>

                      {/* Cluster Threshold */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Cluster Threshold: {visualizationSettings.cluster_threshold}
                        </Label>
                        <Slider
                          value={[visualizationSettings.cluster_threshold]}
                          onValueChange={([value]) => 
                            setVisualizationSettings(prev => ({ ...prev, cluster_threshold: value }))
                          }
                          min={0.1}
                          max={1.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Visualization Area */}
          <div className="flex-1 flex flex-col">
            {/* Analysis Panel */}
            <AnimatePresence>
              {showAnalysisPanel && relationshipAnalysis && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 200, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden"
                >
                  <div className="p-4 h-full overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Relationship Analysis</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAnalysisPanel(false)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {relationshipAnalysis.relationship_summary.total_relationships}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Total Relationships
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {relationshipAnalysis.centrality_metrics.degree_centrality.toFixed(3)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Degree Centrality
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {relationshipAnalysis.influence_metrics.direct_influence.toFixed(3)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Direct Influence
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {relationshipAnalysis.community_membership.length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Communities
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visualization Canvas */}
            <div className="flex-1 relative" ref={containerRef}>
              {(assetsLoading || relationshipsLoading) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading relationship data...</p>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-pointer"
                  onClick={handleCanvasClick}
                  style={{ background: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)' }}
                />
              )}

              {/* Stats Panel */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 rounded-lg p-3 text-sm">
                <div className="space-y-1">
                  <div>Assets: {assets.length}</div>
                  <div>Relationships: {relationships.length}</div>
                  <div>Clusters: {relationshipClusters.length}</div>
                  <div>Patterns: {relationshipPatterns.length}</div>
                </div>
              </div>

              {/* Analysis Toggle */}
              {!showAnalysisPanel && selectedAsset && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnalysisPanel(true)}
                    className="bg-white/90 dark:bg-slate-800/90"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Show Analysis
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Asset Details Dialog */}
        <Dialog open={showAssetDetails} onOpenChange={setShowAssetDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedAsset && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{getAssetIcon(selectedAsset.type)}</span>
                    <span>{selectedAsset.name}</span>
                    <Badge variant="outline">{selectedAsset.type}</Badge>
                    <Badge variant={selectedAsset.status === 'active' ? 'default' : 'secondary'}>
                      {selectedAsset.status}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedAsset.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Owner:</span>
                          <span className="font-medium">{selectedAsset.owner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Category:</span>
                          <span className="font-medium">{selectedAsset.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Quality Score:</span>
                          <span className="font-medium">{selectedAsset.quality_score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Usage Frequency:</span>
                          <span className="font-medium">{(selectedAsset.usage_frequency * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Business Value:</span>
                          <span className="font-medium">{(selectedAsset.business_value * 100).toFixed(1)}%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Relationship Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Total Relationships:</span>
                          <span className="font-medium">{selectedAsset.relationships.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Parent Assets:</span>
                          <span className="font-medium">{selectedAsset.parent_id ? 1 : 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Child Assets:</span>
                          <span className="font-medium">{selectedAsset.children_ids.length}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Related Assets */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Related Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {relationships
                            .filter(r => r.source_id === selectedAsset.id || r.target_id === selectedAsset.id)
                            .map((rel, index) => {
                              const relatedAssetId = rel.source_id === selectedAsset.id ? rel.target_id : rel.source_id
                              const relatedAsset = assets.find(a => a.id === relatedAssetId)
                              return (
                                <div key={index} className="flex items-center justify-between p-2 border border-slate-200 dark:border-slate-700 rounded">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg">{relatedAsset ? getAssetIcon(relatedAsset.type) : '📦'}</span>
                                    <span className="text-sm">{relatedAsset?.name || relatedAssetId}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {rel.type}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                      {Math.round(rel.strength * 100)}%
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  {selectedAsset.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedAsset.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Pattern Discovery Dialog */}
        <Dialog open={showPatternDiscovery} onOpenChange={setShowPatternDiscovery}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pattern Discovery</DialogTitle>
              <DialogDescription>
                Discover new relationship patterns using machine learning
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Discovery Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Confidence Threshold</Label>
                    <Slider
                      value={[0.7]}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Minimum Support</Label>
                    <Slider
                      value={[3]}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Maximum Patterns</Label>
                    <Slider
                      value={[50]}
                      min={10}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Patterns ({relationshipPatterns.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {relationshipPatterns.map((pattern, index) => (
                        <div key={index} className="p-2 border border-slate-200 dark:border-slate-700 rounded">
                          <div className="font-medium text-sm">{pattern.name}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {pattern.pattern_type} • Accuracy: {(pattern.accuracy_rate * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPatternDiscovery(false)}>
                Cancel
              </Button>
              <Button 
                onClick={runPatternDiscovery}
                disabled={patternDiscoveryRunning}
              >
                {patternDiscoveryRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Start Discovery
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default RelationshipMapper