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

interface WorkflowStep {
  id: string
  name: string
  type: 'scan' | 'classify' | 'validate' | 'notify' | 'custom'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  duration?: number
  startTime?: string
  endTime?: string
  inputs?: Record<string, any>
  outputs?: Record<string, any>
  error?: string
}

interface Workflow {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'running' | 'completed' | 'failed' | 'paused'
  category: 'data-governance' | 'compliance' | 'quality' | 'automation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdBy: string
  createdAt: string
  updatedAt: string
  lastRunAt?: string
  nextRunAt?: string
  schedule?: string
  steps: WorkflowStep[]
  tags: string[]
  triggers: string[]
  assignees: string[]
  progress: number
  estimatedDuration: number
  actualDuration?: number
  successRate: number
  runCount: number
}

const mockWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "Daily Data Quality Check",
    description: "Automated daily scan and validation of critical data sources",
    status: "active",
    category: "data-governance",
    priority: "high",
    createdBy: "admin",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    lastRunAt: "2024-01-20T06:00:00Z",
    nextRunAt: "2024-01-21T06:00:00Z",
    schedule: "0 6 * * *", // Daily at 6 AM
    tags: ["quality", "automated", "daily"],
    triggers: ["schedule", "data-change"],
    assignees: ["data-team"],
    progress: 75,
    estimatedDuration: 45, // minutes
    actualDuration: 38,
    successRate: 98.5,
    runCount: 150,
    steps: [
      {
        id: "step-1",
        name: "Scan Data Sources",
        type: "scan",
        status: "completed",
        duration: 15,
        startTime: "2024-01-20T06:00:00Z",
        endTime: "2024-01-20T06:15:00Z"
      },
      {
        id: "step-2", 
        name: "Classify Sensitive Data",
        type: "classify",
        status: "completed",
        duration: 12,
        startTime: "2024-01-20T06:15:00Z",
        endTime: "2024-01-20T06:27:00Z"
      },
      {
        id: "step-3",
        name: "Validate Compliance",
        type: "validate",
        status: "running",
        startTime: "2024-01-20T06:27:00Z"
      },
      {
        id: "step-4",
        name: "Generate Report",
        type: "custom",
        status: "pending"
      }
    ]
  },
  {
    id: "wf-2",
    name: "GDPR Compliance Audit",
    description: "Weekly comprehensive GDPR compliance validation",
    status: "completed",
    category: "compliance",
    priority: "critical",
    createdBy: "compliance-team",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-18T16:00:00Z",
    lastRunAt: "2024-01-19T12:00:00Z",
    nextRunAt: "2024-01-26T12:00:00Z",
    schedule: "0 12 * * 1", // Weekly on Monday at 12 PM
    tags: ["gdpr", "compliance", "weekly"],
    triggers: ["schedule"],
    assignees: ["compliance-team", "legal-team"],
    progress: 100,
    estimatedDuration: 120,
    actualDuration: 115,
    successRate: 94.2,
    runCount: 8,
    steps: []
  },
  {
    id: "wf-3",
    name: "New Data Source Onboarding",
    description: "Automated workflow for onboarding new data sources",
    status: "draft",
    category: "automation",
    priority: "medium",
    createdBy: "admin",
    createdAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-20T11:00:00Z",
    tags: ["onboarding", "automation", "data-sources"],
    triggers: ["manual", "api"],
    assignees: ["data-team"],
    progress: 0,
    estimatedDuration: 30,
    successRate: 0,
    runCount: 0,
    steps: []
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

const priorityColors = {
  low: "text-gray-500",
  medium: "text-blue-500", 
  high: "text-orange-500",
  critical: "text-red-500"
}

export const WorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workflow.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === "all" || workflow.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || workflow.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [workflows, searchQuery, selectedCategory, selectedStatus])

  // Handle workflow actions
  const handleRunWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId 
        ? { ...wf, status: 'running' as const, progress: 0 }
        : wf
    ))
  }, [])

  const handlePauseWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(wf =>
      wf.id === workflowId
        ? { ...wf, status: 'paused' as const }
        : wf
    ))
  }, [])

  const handleStopWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(wf =>
      wf.id === workflowId
        ? { ...wf, status: 'active' as const, progress: 0 }
        : wf
    ))
  }, [])

  // Render workflow card
  const renderWorkflowCard = useCallback((workflow: Workflow) => {
    const StatusIcon = statusIcons[workflow.status]
    
    return (
      <Card key={workflow.id} className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{workflow.name}</h3>
                <Badge variant="outline" className="h-5 text-xs">
                  {workflow.category.replace('-', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {workflow.description}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedWorkflow(workflow)}>
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
              <div className={cn("w-2 h-2 rounded-full", statusColors[workflow.status])} />
              <StatusIcon className="h-3 w-3" />
              <span className="text-xs capitalize">{workflow.status}</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={priorityColors[workflow.priority]}>
                {workflow.priority.toUpperCase()}
              </span>
            </div>
            
            {workflow.progress > 0 && (
              <div className="flex-1 max-w-20">
                <Progress value={workflow.progress} className="h-1" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-sm font-medium">{workflow.successRate}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Runs</p>
              <p className="text-sm font-medium">{workflow.runCount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{workflow.estimatedDuration}m</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {workflow.status === 'active' && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => handleRunWorkflow(workflow.id)}
              >
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>
            )}
            
            {workflow.status === 'running' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePauseWorkflow(workflow.id)}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleStopWorkflow(workflow.id)}
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              </>
            )}
            
            {(workflow.status === 'draft' || workflow.status === 'paused') && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleRunWorkflow(workflow.id)}
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
          </div>
          
          {/* Tags */}
          {workflow.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {workflow.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="h-4 px-1 text-xs">
                  {tag}
                </Badge>
              ))}
              {workflow.tags.length > 3 && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  +{workflow.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }, [handleRunWorkflow, handlePauseWorkflow, handleStopWorkflow])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Workflow Manager</h1>
            <p className="text-muted-foreground">
              Automate and orchestrate your data governance processes
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Category: {selectedCategory === 'all' ? 'All' : selectedCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('data-governance')}>
                Data Governance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('compliance')}>
                Compliance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('quality')}>
                Quality
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('automation')}>
                Automation
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
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="flex-1 px-6 pb-6">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkflows.map(renderWorkflowCard)}
              </div>
              
              {filteredWorkflows.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium mb-1">No workflows found</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first workflow to get started
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="list" className="flex-1 px-6 pb-6">
            <div className="text-center py-20">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">List View</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="flex-1 px-6 pb-6">
            <div className="text-center py-20">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">Timeline View</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Workflow Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Build automated data governance workflows
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Workflow builder coming soon
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WorkflowManager