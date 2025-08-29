"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  Square,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Copy,
  Eye,
  Settings,
  GitBranch,
  Activity,
  Users,
  Calendar,
  RefreshCw,
  TrendingUp,
  Zap,
  Database,
  ArrowRight,
  BarChart3,
  Target,
  Layers,
} from "lucide-react"

import { cn } from "../../utils/cn"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Progress } from "../ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

interface PipelineStage {
  id: string
  name: string
  type: 'extract' | 'transform' | 'load' | 'validate' | 'monitor' | 'custom'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  duration?: number
  startTime?: string
  endTime?: string
  processingRecords?: number
  errorCount?: number
  config?: Record<string, any>
}

interface Pipeline {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'running' | 'completed' | 'failed' | 'paused'
  category: 'etl' | 'streaming' | 'batch' | 'realtime' | 'analytics'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdBy: string
  createdAt: string
  updatedAt: string
  lastRunAt?: string
  nextRunAt?: string
  schedule?: string
  stages: PipelineStage[]
  tags: string[]
  sourceType: string
  targetType: string
  dataVolume: string
  progress: number
  estimatedDuration: number
  actualDuration?: number
  successRate: number
  runCount: number
  throughput: number // records per minute
  errorRate: number
}

const mockPipelines: Pipeline[] = [
  {
    id: "pl-1",
    name: "Customer Data ETL",
    description: "Extract, transform and load customer data from CRM to data warehouse",
    status: "running",
    category: "etl",
    priority: "high",
    createdBy: "data-engineer",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    lastRunAt: "2024-01-20T08:00:00Z",
    nextRunAt: "2024-01-21T08:00:00Z",
    schedule: "0 8 * * *", // Daily at 8 AM
    tags: ["customer", "crm", "warehouse"],
    sourceType: "Salesforce CRM",
    targetType: "Snowflake DW",
    dataVolume: "2.5M records",
    progress: 65,
    estimatedDuration: 45,
    actualDuration: 28,
    successRate: 99.1,
    runCount: 89,
    throughput: 1200,
    errorRate: 0.02,
    stages: [
      {
        id: "stage-1",
        name: "Extract from CRM",
        type: "extract",
        status: "completed",
        duration: 8,
        processingRecords: 2500000,
        errorCount: 0
      },
      {
        id: "stage-2",
        name: "Transform & Validate",
        type: "transform",
        status: "running",
        processingRecords: 1625000,
        errorCount: 12
      },
      {
        id: "stage-3",
        name: "Load to Warehouse",
        type: "load",
        status: "pending"
      }
    ]
  },
  {
    id: "pl-2",
    name: "Real-time Analytics Stream",
    description: "Process web events for real-time analytics dashboard",
    status: "active",
    category: "streaming",
    priority: "critical",
    createdBy: "analytics-team",
    createdAt: "2024-01-05T11:00:00Z",
    updatedAt: "2024-01-20T16:00:00Z",
    lastRunAt: "2024-01-20T16:00:00Z",
    tags: ["analytics", "realtime", "web-events"],
    sourceType: "Kafka Stream",
    targetType: "ClickHouse",
    dataVolume: "50K events/min",
    progress: 100,
    estimatedDuration: 0, // continuous
    successRate: 99.8,
    runCount: 24000,
    throughput: 50000,
    errorRate: 0.001,
    stages: [
      {
        id: "stage-1",
        name: "Event Ingestion",
        type: "extract",
        status: "completed"
      },
      {
        id: "stage-2",
        name: "Stream Processing",
        type: "transform",
        status: "completed"
      },
      {
        id: "stage-3",
        name: "Analytics Store",
        type: "load",
        status: "completed"
      }
    ]
  },
  {
    id: "pl-3",
    name: "Financial Reports Pipeline",
    description: "Generate monthly financial reports from multiple data sources",
    status: "completed",
    category: "batch",
    priority: "medium",
    createdBy: "finance-team",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-19T23:00:00Z",
    lastRunAt: "2024-01-19T23:00:00Z",
    nextRunAt: "2024-02-01T00:00:00Z",
    schedule: "0 0 1 * *", // Monthly on 1st
    tags: ["finance", "reports", "monthly"],
    sourceType: "Multiple DBs",
    targetType: "Report Server",
    dataVolume: "500K records",
    progress: 100,
    estimatedDuration: 180,
    actualDuration: 165,
    successRate: 96.5,
    runCount: 12,
    throughput: 500,
    errorRate: 0.05,
    stages: []
  }
]

const statusColors = {
  draft: "bg-gray-500",
  active: "bg-green-500",
  running: "bg-blue-500",
  completed: "bg-emerald-500",
  failed: "bg-red-500",
  paused: "bg-yellow-500"
}

const statusIcons = {
  draft: Edit,
  active: CheckCircle,
  running: Play,
  completed: CheckCircle,
  failed: XCircle,
  paused: Pause
}

const categoryColors = {
  etl: "text-blue-600",
  streaming: "text-purple-600",
  batch: "text-green-600",
  realtime: "text-orange-600",
  analytics: "text-pink-600"
}

const stageIcons = {
  extract: Database,
  transform: Settings,
  load: Target,
  validate: CheckCircle,
  monitor: BarChart3,
  custom: Layers
}

export const PipelineManager: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Filter pipelines
  const filteredPipelines = useMemo(() => {
    return pipelines.filter(pipeline => {
      const matchesSearch = pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pipeline.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pipeline.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === "all" || pipeline.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || pipeline.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [pipelines, searchQuery, selectedCategory, selectedStatus])

  // Handle pipeline actions
  const handleRunPipeline = useCallback((pipelineId: string) => {
    setPipelines(prev => prev.map(pl => 
      pl.id === pipelineId 
        ? { ...pl, status: 'running' as const, progress: 0 }
        : pl
    ))
  }, [])

  const handlePausePipeline = useCallback((pipelineId: string) => {
    setPipelines(prev => prev.map(pl =>
      pl.id === pipelineId
        ? { ...pl, status: 'paused' as const }
        : pl
    ))
  }, [])

  const handleStopPipeline = useCallback((pipelineId: string) => {
    setPipelines(prev => prev.map(pl =>
      pl.id === pipelineId
        ? { ...pl, status: 'active' as const, progress: 0 }
        : pl
    ))
  }, [])

  // Render pipeline stage
  const renderStage = useCallback((stage: PipelineStage, index: number, totalStages: number) => {
    const StageIcon = stageIcons[stage.type]
    
    return (
      <div key={stage.id} className="flex items-center">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full border-2",
          stage.status === 'completed' && "bg-green-100 border-green-500 text-green-700",
          stage.status === 'running' && "bg-blue-100 border-blue-500 text-blue-700",
          stage.status === 'failed' && "bg-red-100 border-red-500 text-red-700",
          stage.status === 'pending' && "bg-gray-100 border-gray-300 text-gray-500"
        )}>
          <StageIcon className="h-4 w-4" />
        </div>
        
        {index < totalStages - 1 && (
          <div className={cn(
            "w-8 h-0.5 mx-1",
            stage.status === 'completed' ? "bg-green-300" : "bg-gray-200"
          )} />
        )}
      </div>
    )
  }, [])

  // Render pipeline card
  const renderPipelineCard = useCallback((pipeline: Pipeline) => {
    const StatusIcon = statusIcons[pipeline.status]
    
    return (
      <Card key={pipeline.id} className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{pipeline.name}</h3>
                <Badge variant="outline" className={cn("h-5 text-xs", categoryColors[pipeline.category])}>
                  {pipeline.category.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {pipeline.description}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedPipeline(pipeline)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Status and Progress */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", statusColors[pipeline.status])} />
              <StatusIcon className="h-3 w-3" />
              <span className="text-xs capitalize">{pipeline.status}</span>
            </div>
            
            {pipeline.progress > 0 && (
              <div className="flex-1 max-w-20">
                <Progress value={pipeline.progress} className="h-1" />
                <span className="text-xs text-muted-foreground">{pipeline.progress}%</span>
              </div>
            )}
          </div>
          
          {/* Pipeline Flow */}
          {pipeline.stages.length > 0 && (
            <div className="flex items-center justify-center mt-3 p-2 bg-accent/30 rounded-lg">
              {pipeline.stages.map((stage, index) => 
                renderStage(stage, index, pipeline.stages.length)
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Data Flow */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded text-xs">
            <span className="font-medium">{pipeline.sourceType}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{pipeline.targetType}</span>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Throughput</p>
              <p className="text-sm font-medium">{pipeline.throughput.toLocaleString()}/min</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-sm font-medium">{pipeline.successRate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data Volume</p>
              <p className="text-sm font-medium">{pipeline.dataVolume}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Error Rate</p>
              <p className="text-sm font-medium">{(pipeline.errorRate * 100).toFixed(2)}%</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {pipeline.status === 'active' && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => handleRunPipeline(pipeline.id)}
              >
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>
            )}
            
            {pipeline.status === 'running' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePausePipeline(pipeline.id)}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleStopPipeline(pipeline.id)}
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              </>
            )}
            
            {(pipeline.status === 'draft' || pipeline.status === 'paused') && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleRunPipeline(pipeline.id)}
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
          </div>
          
          {/* Tags */}
          {pipeline.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {pipeline.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="h-4 px-1 text-xs">
                  {tag}
                </Badge>
              ))}
              {pipeline.tags.length > 3 && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  +{pipeline.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }, [handleRunPipeline, handlePausePipeline, handleStopPipeline, renderStage])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Pipeline Manager</h1>
            <p className="text-muted-foreground">
              Orchestrate and monitor your data processing pipelines
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pipelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Type: {selectedCategory === 'all' ? 'All' : selectedCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('etl')}>
                ETL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('streaming')}>
                Streaming
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('batch')}>
                Batch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('realtime')}>
                Real-time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('analytics')}>
                Analytics
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Status: {selectedStatus === 'all' ? 'All' : selectedStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('running')}>
                Running
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('completed')}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('failed')}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('draft')}>
                Draft
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="grid" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="flow">Flow View</TabsTrigger>
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="flex-1 px-6 pb-6">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPipelines.map(renderPipelineCard)}
              </div>
              
              {filteredPipelines.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium mb-1">No pipelines found</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first pipeline to get started
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="flow" className="flex-1 px-6 pb-6">
            <div className="text-center py-20">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">Flow View</h3>
              <p className="text-sm text-muted-foreground">Visual pipeline flow editor coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="monitor" className="flex-1 px-6 pb-6">
            <div className="text-center py-20">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">Real-time Monitor</h3>
              <p className="text-sm text-muted-foreground">Live pipeline monitoring coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Pipeline Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Pipeline</DialogTitle>
            <DialogDescription>
              Build data processing pipelines
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Pipeline builder coming soon
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PipelineManager