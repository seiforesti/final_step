"use client"

import React, { useState, useMemo, useCallback, useEffect, memo } from "react"
import {
  Download,
  Share2,
  Settings,
  Database,
  Table,
  Columns,
  Folder,
  File,
  GitBranch,
  Search,
  ExternalLink,
  Layers,
  Network,
  RefreshCw,
  Clock,
  Play,
  Pause,
  Eye,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
} from "lucide-react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  useReactFlow,
  Panel,
  type NodeTypes,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

// Enhanced mock data with more realistic schema information
const enhancedLineageData = {
  entities: [
    {
      id: "1",
      name: "finance_prod.sales.audi_sales_worldwide",
      entity_type: "table",
      qualified_name: "finance_prod.sales.audi_sales_worldwide",
      data_source_name: "PostgreSQL Production",
      direction: "center",
      depth: 0,
      sensitivity_label: "Medium",
      classifications: ["Financial", "Sales Data"],
      last_updated: "2024-01-25T14:45:00Z",
      row_count: 2456789,
      issues_count: 0,
      schema: [
        { name: "revenue", type: "int", nullable: false, description: "Total revenue amount" },
        { name: "gross_sales", type: "int", nullable: false, description: "Gross sales before deductions" },
        { name: "model", type: "string", nullable: true, description: "Car model identifier" },
        { name: "month", type: "int", nullable: false, description: "Month of sale" },
      ],
      external_location: null,
      model_version: null,
    },
    {
      id: "2",
      name: "finance_prod.sales.car_sales_features",
      entity_type: "table",
      qualified_name: "finance_prod.sales.car_sales_features",
      data_source_name: "PostgreSQL Production",
      direction: "downstream",
      depth: 1,
      sensitivity_label: "Medium",
      classifications: ["Financial", "Features"],
      last_updated: "2024-01-26T10:00:00Z",
      row_count: 1200000,
      issues_count: 0,
      schema: [
        { name: "month", type: "int", nullable: false, description: "Month identifier" },
        { name: "gross_sales", type: "int", nullable: false, description: "Gross sales amount" },
      ],
      external_location: null,
      model_version: null,
    },
    {
      id: "3",
      name: "finance_prod.sales.honda_uk",
      entity_type: "materialized_view",
      qualified_name: "finance_prod.sales.honda_uk",
      data_source_name: "PostgreSQL Production",
      direction: "upstream",
      depth: 1,
      sensitivity_label: "Low",
      classifications: ["Sales Data", "Regional"],
      last_updated: "2024-01-20T12:00:00Z",
      row_count: 45000,
      issues_count: 0,
      schema: [
        { name: "id", type: "int", nullable: false, description: "Unique identifier" },
        { name: "revenue", type: "int", nullable: false, description: "Revenue amount" },
      ],
      external_location: null,
      model_version: null,
    },
    {
      id: "4",
      name: "finance_prod.sales.honda_sales_worldwide",
      entity_type: "view",
      qualified_name: "finance_prod.sales.honda_sales_worldwide",
      data_source_name: "PostgreSQL Production",
      direction: "upstream",
      depth: 1,
      sensitivity_label: "Medium",
      classifications: ["Sales Data", "Global"],
      last_updated: "2024-01-21T16:30:00Z",
      row_count: 890000,
      issues_count: 0,
      schema: [
        { name: "id", type: "int", nullable: false, description: "Unique identifier" },
        { name: "revenue", type: "int", nullable: false, description: "Revenue amount" },
      ],
      external_location: null,
      model_version: null,
    },
    {
      id: "5",
      name: "finance_prod.sales.compact_car_sales",
      entity_type: "table",
      qualified_name: "finance_prod.sales.compact_car_sales",
      data_source_name: "PostgreSQL Production",
      direction: "downstream",
      depth: 1,
      sensitivity_label: "Medium",
      classifications: ["Sales Data", "Vehicle Type"],
      last_updated: "2024-01-27T08:30:00Z",
      row_count: 567000,
      issues_count: 0,
      schema: [
        { name: "revenue", type: "int", nullable: false, description: "Revenue amount" },
        { name: "gross_sales", type: "int", nullable: false, description: "Gross sales amount" },
        { name: "model", type: "string", nullable: true, description: "Car model" },
        { name: "month", type: "int", nullable: false, description: "Month of sale" },
      ],
      external_location: null,
      model_version: null,
    },
    {
      id: "6",
      name: "finance_prod.sales.bmw_sales_worldwide",
      entity_type: "table",
      qualified_name: "finance_prod.sales.bmw_sales_worldwide",
      data_source_name: "PostgreSQL Production",
      direction: "upstream",
      depth: 1,
      sensitivity_label: "Medium",
      classifications: ["Sales Data", "BMW"],
      last_updated: "2024-01-19T14:30:00Z",
      row_count: 1100000,
      issues_count: 0,
      schema: [
        { name: "revenue", type: "int", nullable: false, description: "Revenue amount" },
        { name: "gross_sales", type: "int", nullable: false, description: "Gross sales amount" },
        { name: "model", type: "string", nullable: true, description: "BMW model" },
        { name: "month", type: "int", nullable: false, description: "Month of sale" },
      ],
      external_location: null,
      model_version: null,
    },
    {
      id: "7",
      name: "finance_prod.sales.sales_features_model",
      entity_type: "model",
      qualified_name: "finance_prod.sales.sales_features_model",
      data_source_name: "MLflow",
      direction: "downstream",
      depth: 1,
      sensitivity_label: "High",
      classifications: ["ML Model", "Sales Prediction"],
      last_updated: "2024-01-28T06:00:00Z",
      row_count: null,
      issues_count: 0,
      schema: [],
      external_location: "bugbashdata",
      model_version: {
        version: "Version 1",
        latest: true,
        versions_count: 1,
        created: "6 hours ago",
      },
    },
  ],
  relationships: [
    {
      id: "e1",
      source: "3",
      target: "1",
      label: "ETL Pipeline",
      type: "data_flow",
      animated: true,
      last_updated: "2024-01-20T12:30:00Z",
    },
    {
      id: "e2",
      source: "4",
      target: "1",
      label: "JOIN",
      type: "data_flow",
      animated: true,
      last_updated: "2024-01-21T17:00:00Z",
    },
    {
      id: "e3",
      source: "6",
      target: "1",
      label: "UNION",
      type: "data_flow",
      animated: true,
      last_updated: "2024-01-19T15:00:00Z",
    },
    {
      id: "e4",
      source: "1",
      target: "2",
      label: "Feature Engineering",
      type: "ml_pipeline",
      animated: true,
      last_updated: "2024-01-26T10:30:00Z",
    },
    {
      id: "e5",
      source: "1",
      target: "5",
      label: "Filter & Transform",
      type: "data_flow",
      animated: true,
      last_updated: "2024-01-27T09:00:00Z",
    },
    {
      id: "e6",
      source: "2",
      target: "7",
      label: "Model Training",
      type: "ml_pipeline",
      animated: true,
      last_updated: "2024-01-28T06:30:00Z",
    },
  ],
}

// Entity icon mapping
const getEntityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "database":
      return Database
    case "schema":
      return Folder
    case "table":
      return Table
    case "view":
      return Eye
    case "materialized_view":
      return Layers
    case "column":
      return Columns
    case "file":
      return File
    case "model":
      return GitBranch
    case "api":
      return Network
    case "stream":
      return Clock
    case "dashboard":
      return Layers
    case "report":
      return File
    default:
      return Database
  }
}

// Enhanced Custom Node Component - Databricks style
const DatabricksStyleNode = memo(({ data, selected }: { data: any; selected: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const EntityIcon = getEntityIcon(data.entity_type)

  const visibleColumns = isExpanded ? data.schema : data.schema?.slice(0, 4) || []
  const hiddenColumnsCount = data.schema ? Math.max(0, data.schema.length - 4) : 0

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case "materialized_view":
        return "Materialized view"
      case "view":
        return "View"
      case "table":
        return "Table"
      case "model":
        return "Model version"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case "table":
        return "bg-blue-500"
      case "view":
        return "bg-green-500"
      case "materialized_view":
        return "bg-purple-500"
      case "model":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div
      className={cn(
        "bg-card border rounded-lg shadow-lg transition-all duration-200 min-w-[280px] max-w-[320px]",
        selected && "ring-2 ring-primary shadow-xl scale-105",
        data.direction === "center" && "ring-2 ring-primary/50",
      )}
    >
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded text-white", getEntityTypeColor(data.entity_type))}>
              <EntityIcon className="h-3 w-3" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{getEntityTypeLabel(data.entity_type)}</span>
          </div>
          {data.issues_count > 0 && (
            <Badge variant="destructive" className="text-xs">
              {data.issues_count}
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-sm leading-tight mb-1">{data.name}</h3>

        {data.external_location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            <span>External location</span>
          </div>
        )}

        {data.model_version && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-muted-foreground">{data.model_version.version}</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary cursor-pointer hover:underline">
                {data.model_version.versions_count} versions
              </span>
              <span className="text-muted-foreground">
                {data.model_version.latest && "Version 1 (latest)"} • {data.model_version.created}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Schema/Columns */}
      {data.schema && data.schema.length > 0 && (
        <div className="p-3">
          <div className="space-y-2">
            {visibleColumns.map((column: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Columns className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">{column.name}</span>
                </div>
                <span className="text-muted-foreground font-mono text-xs ml-2 flex-shrink-0">{column.type}</span>
              </div>
            ))}

            {hiddenColumnsCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-6 text-xs text-primary hover:text-primary/80"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show fewer columns
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show {hiddenColumnsCount} more columns
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer with metadata */}
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {data.row_count && (
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>{data.row_count.toLocaleString()} rows</span>
            </div>
          )}
          {data.sensitivity_label && (
            <Badge variant="outline" className="text-xs">
              <Shield className="h-2 w-2 mr-1" />
              {data.sensitivity_label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
})

DatabricksStyleNode.displayName = "DatabricksStyleNode"

// Create nodes and edges for ReactFlow with better positioning
const createNodesAndEdges = (
  entityId: number,
  showUpstreamDepth: number,
  showDownstreamDepth: number,
  isAnimationPlaying: boolean,
) => {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Enhanced positioning with better spacing
  const spacingX = 450
  const spacingY = 250

  const positionedNodes: { [key: string]: Node } = {}
  const nodesByDepthAndDirection: { [key: string]: { [key: number]: any[] } } = {
    center: {},
    upstream: {},
    downstream: {},
  }

  // Filter entities by depth
  const relevantEntities = enhancedLineageData.entities.filter((entity) => {
    return (
      entity.direction === "center" ||
      (entity.direction === "upstream" && entity.depth <= showUpstreamDepth) ||
      (entity.direction === "downstream" && entity.depth <= showDownstreamDepth)
    )
  })

  // Group entities by depth and direction
  relevantEntities.forEach((entity) => {
    if (entity.direction === "center") {
      nodesByDepthAndDirection.center[0] = nodesByDepthAndDirection.center[0] || []
      nodesByDepthAndDirection.center[0].push(entity)
    } else {
      if (!nodesByDepthAndDirection[entity.direction][entity.depth]) {
        nodesByDepthAndDirection[entity.direction][entity.depth] = []
      }
      nodesByDepthAndDirection[entity.direction][entity.depth].push(entity)
    }
  })

  // Position center node
  if (nodesByDepthAndDirection.center[0] && nodesByDepthAndDirection.center[0].length > 0) {
    const centerEntity = nodesByDepthAndDirection.center[0][0]
    positionedNodes[centerEntity.id] = {
      id: centerEntity.id,
      type: "databricksStyle",
      position: { x: 0, y: 0 },
      data: centerEntity,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }
  }

  // Position upstream nodes
  for (let depth = 1; depth <= showUpstreamDepth; depth++) {
    const entitiesAtDepth = nodesByDepthAndDirection.upstream[depth] || []
    const total = entitiesAtDepth.length
    entitiesAtDepth.forEach((entity, idx) => {
      const x = -depth * spacingX
      const y = (idx - (total - 1) / 2) * spacingY
      positionedNodes[entity.id] = {
        id: entity.id,
        type: "databricksStyle",
        position: { x, y },
        data: entity,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }
    })
  }

  // Position downstream nodes
  for (let depth = 1; depth <= showDownstreamDepth; depth++) {
    const entitiesAtDepth = nodesByDepthAndDirection.downstream[depth] || []
    const total = entitiesAtDepth.length
    entitiesAtDepth.forEach((entity, idx) => {
      const x = depth * spacingX
      const y = (idx - (total - 1) / 2) * spacingY
      positionedNodes[entity.id] = {
        id: entity.id,
        type: "databricksStyle",
        position: { x, y },
        data: entity,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }
    })
  }

  const finalNodes = Object.values(positionedNodes)

  // Create edges with enhanced styling
  enhancedLineageData.relationships.forEach((rel) => {
    const sourceExists = finalNodes.find((n) => n.id === rel.source)
    const targetExists = finalNodes.find((n) => n.id === rel.target)

    if (sourceExists && targetExists) {
      edges.push({
        id: rel.id,
        source: rel.source,
        target: rel.target,
        label: rel.label,
        animated: isAnimationPlaying && rel.animated,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
          stroke:
            rel.type === "data_flow"
              ? "#3b82f6"
              : rel.type === "ml_pipeline"
                ? "#8b5cf6"
                : rel.type === "streaming"
                  ? "#10b981"
                  : "#6b7280",
        },
        labelStyle: {
          fontSize: 12,
          fontWeight: 500,
          fill: "hsl(var(--foreground))",
        },
        labelBgStyle: {
          fill: "hsl(var(--background))",
          fillOpacity: 0.9,
        },
      })
    }
  })

  return { nodes: finalNodes, edges }
}

const nodeTypes: NodeTypes = {
  databricksStyle: DatabricksStyleNode,
}

interface EnhancedEntityLineageViewProps {
  entityId: number
  entityType: string
  onEntityClick?: (entityId: number, entityType: string) => void
}

// Internal component that uses React Flow hooks
function EnhancedEntityLineageViewInternal({ entityId, entityType, onEntityClick }: EnhancedEntityLineageViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [upstreamDepth, setUpstreamDepth] = useState([2])
  const [downstreamDepth, setDownstreamDepth] = useState([2])
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [layoutDirection, setLayoutDirection] = useState("horizontal")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const reactFlowInstance = useReactFlow()

  // Create nodes and edges based on current settings
  const { nodes: currentNodes, edges: currentEdges } = useMemo(
    () => createNodesAndEdges(entityId, upstreamDepth[0], downstreamDepth[0], isAnimationPlaying),
    [entityId, upstreamDepth, downstreamDepth, isAnimationPlaying],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(currentNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentEdges)

  // Update nodes and edges when dependencies change
  useEffect(() => {
    setNodes(currentNodes)
    setEdges(currentEdges)
  }, [currentNodes, currentEdges, setNodes, setEdges])

  // Filter entities for sidebar
  const filteredEntities = useMemo(() => {
    return enhancedLineageData.entities.filter((entity) => {
      const matchesSearch =
        !searchQuery ||
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.qualified_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === "all" || entity.entity_type === filterType

      return matchesSearch && matchesType
    })
  }, [searchQuery, filterType])

  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleEntityClick = useCallback((entity: any) => {
    setSelectedEntity(entity)
  }, [])

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const entity = enhancedLineageData.entities.find((e) => e.id === node.id)
      if (entity) {
        handleEntityClick(entity)
      }
    },
    [handleEntityClick],
  )

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 })
  }, [reactFlowInstance])

  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn()
  }, [reactFlowInstance])

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut()
  }, [reactFlowInstance])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const toggleAnimation = useCallback(() => {
    setIsAnimationPlaying(!isAnimationPlaying)
  }, [isAnimationPlaying])

  // Statistics
  const stats = useMemo(() => {
    const upstream = enhancedLineageData.entities.filter((e) => e.direction === "upstream")
    const downstream = enhancedLineageData.entities.filter((e) => e.direction === "downstream")
    const totalIssues = enhancedLineageData.entities.reduce((sum, e) => sum + e.issues_count, 0)

    return {
      totalEntities: enhancedLineageData.entities.length,
      upstreamCount: upstream.length,
      downstreamCount: downstream.length,
      relationshipsCount: enhancedLineageData.relationships.length,
      totalIssues,
      dataSources: [...new Set(enhancedLineageData.entities.map((e) => e.data_source_name))].length,
    }
  }, [])

  const MainContent = (
    <div className="flex-1 flex flex-col h-full">
      {/* Enhanced Header Controls */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6 gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Enhanced Data Lineage</h2>
            <p className="text-sm text-muted-foreground">Interactive visualization of data flow and dependencies</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Depth Controls */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Upstream:</Label>
              <div className="w-20">
                <Slider
                  value={upstreamDepth}
                  onValueChange={setUpstreamDepth}
                  max={3}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground w-4">{upstreamDepth[0]}</span>
            </div>

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center gap-2">
              <Label className="text-sm">Downstream:</Label>
              <div className="w-20">
                <Slider
                  value={downstreamDepth}
                  onValueChange={setDownstreamDepth}
                  max={3}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground w-4">{downstreamDepth[0]}</span>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Animation Control */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={toggleAnimation}>
                    {isAnimationPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isAnimationPlaying ? "Pause" : "Play"} Flow Animation</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* View Controls */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleFitView}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fit to View</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? "Exit" : "Enter"} Fullscreen</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={showMiniMap} onCheckedChange={setShowMiniMap}>
                  Show Mini Map
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={showControls} onCheckedChange={setShowControls}>
                  Show Controls
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Diagram
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Lineage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Enhanced Lineage Visualization */}
      <div className="flex-1 relative w-full h-full bg-muted/30">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Strict}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          className="w-full h-full"
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="hsl(var(--muted-foreground) / 0.2)" variant="dots" />

          {showControls && (
            <Controls
              position="bottom-right"
              showInteractive={false}
              className="bg-background border rounded-lg shadow-lg"
            />
          )}

          {showMiniMap && (
            <MiniMap
              position="bottom-left"
              nodeColor={(node) => {
                if (node.data?.direction === "center") return "hsl(var(--primary))"
                if (node.data?.direction === "upstream") return "hsl(var(--chart-1))"
                if (node.data?.direction === "downstream") return "hsl(var(--chart-2))"
                return "hsl(var(--muted-foreground))"
              }}
              maskColor="hsl(var(--background) / 0.8)"
              className="bg-background border rounded-lg shadow-lg"
            />
          )}

          {/* Enhanced Legend */}
          <Panel position="top-right" className="bg-background/90 backdrop-blur rounded-lg shadow-lg p-4 m-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Table</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>View</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Materialized View</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>Model</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>{stats.totalEntities} entities</div>
                <div>{stats.relationshipsCount} relationships</div>
                <div>{stats.dataSources} data sources</div>
              </div>
            </div>
          </Panel>

          {/* Zoom Controls */}
          <Panel position="top-left" className="bg-background/90 backdrop-blur rounded-lg shadow-lg p-2 m-4">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleFitView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )

  if (isFullscreen) {
    return <div className="fixed inset-0 z-50 bg-background">{MainContent}</div>
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
        {/* Sidebar */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <div className="flex flex-col h-full bg-muted/30">
            {/* Search and Filters */}
            <div className="p-4 border-b space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="materialized_view">Materialized View</SelectItem>
                  <SelectItem value="model">Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Statistics */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3 text-sm">Lineage Overview</h3>
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{stats.upstreamCount}</div>
                    <div className="text-xs text-muted-foreground">Upstream</div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.downstreamCount}</div>
                    <div className="text-xs text-muted-foreground">Downstream</div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Entity List */}
            <div className="flex-1 overflow-auto">
              <div className="p-4">
                <h3 className="font-semibold mb-3 text-sm">Entities ({filteredEntities.length})</h3>
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {filteredEntities.map((entity) => {
                      const EntityIcon = getEntityIcon(entity.entity_type)
                      const isSelected = selectedEntity?.id === entity.id
                      const isCenterEntity = entity.direction === "center"

                      return (
                        <Card
                          key={entity.id}
                          className={cn(
                            "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
                            isSelected && "ring-2 ring-primary",
                            isCenterEntity && "bg-primary/5 border-primary/20",
                          )}
                          onClick={() => handleEntityClick(entity)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-md bg-muted">
                              <EntityIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">{entity.name}</p>
                                {isCenterEntity && (
                                  <Badge variant="outline" className="text-xs">
                                    Focus
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{entity.qualified_name}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {entity.entity_type}
                                </Badge>
                                {entity.sensitivity_label && (
                                  <Badge variant="secondary" className="text-xs">
                                    {entity.sensitivity_label}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content */}
        <ResizablePanel defaultSize={75}>{MainContent}</ResizablePanel>
      </ResizablePanelGroup>

      {/* Entity Details Panel */}
      {selectedEntity && (
        <div className="fixed right-4 top-20 w-96 max-h-[calc(100vh-6rem)] bg-background border rounded-lg shadow-xl overflow-auto z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Entity Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEntity(null)}>
              ×
            </Button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {React.createElement(getEntityIcon(selectedEntity.entity_type), {
                  className: "h-5 w-5 text-primary",
                })}
              </div>
              <div>
                <h4 className="font-medium">{selectedEntity.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedEntity.entity_type}</p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schema">Schema</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Qualified Name</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded break-all">{selectedEntity.qualified_name}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Data Source</Label>
                  <p className="text-sm">{selectedEntity.data_source_name}</p>
                </div>

                {selectedEntity.row_count && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Row Count</Label>
                    <p className="text-sm">{selectedEntity.row_count.toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{new Date(selectedEntity.last_updated).toLocaleDateString()}</p>
                </div>

                {selectedEntity.classifications && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Classifications</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEntity.classifications.map((classification: string) => (
                        <Badge key={classification} variant="outline" className="text-xs">
                          {classification}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schema" className="space-y-4">
                {selectedEntity.schema && selectedEntity.schema.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEntity.schema.map((column: any, index: number) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{column.name}</span>
                          <Badge variant="outline" className="text-xs font-mono">
                            {column.type}
                          </Badge>
                        </div>
                        {column.description && (
                          <p className="text-xs text-muted-foreground mt-1">{column.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No schema information available</p>
                )}
              </TabsContent>
            </Tabs>

            <div className="pt-2 border-t">
              <Button
                className="w-full"
                onClick={() => onEntityClick?.(Number.parseInt(selectedEntity.id), selectedEntity.entity_type)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main component that wraps with ReactFlowProvider
export default function EnhancedEntityLineageView(props: EnhancedEntityLineageViewProps) {
  return (
    <ReactFlowProvider>
      <EnhancedEntityLineageViewInternal {...props} />
    </ReactFlowProvider>
  )
}
