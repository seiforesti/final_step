"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Clock,
  User,
  Database,
  Shield,
  FileText,
  Scan,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  Filter,
  Search,
  Calendar,
  RefreshCw,
  TrendingUp,
  Eye,
  Download,
  Bell,
  Users,
  Zap,
  GitBranch,
  Target,
  BarChart3,
} from "lucide-react"

import { cn } from "../../utils/cn"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Progress } from "../ui/progress"

interface ActivityEvent {
  id: string
  timestamp: string
  type: 'scan' | 'classification' | 'compliance' | 'workflow' | 'pipeline' | 'user' | 'system' | 'alert'
  action: string
  description: string
  user: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  target: {
    type: 'data-source' | 'scan-rule' | 'classification' | 'workflow' | 'pipeline' | 'user' | 'system'
    id: string
    name: string
  }
  status: 'success' | 'warning' | 'error' | 'info' | 'in-progress'
  metadata?: Record<string, any>
  duration?: number
  impact: 'low' | 'medium' | 'high' | 'critical'
}

const mockActivities: ActivityEvent[] = [
  {
    id: "act-1",
    timestamp: "2024-01-20T14:30:00Z",
    type: "workflow",
    action: "executed",
    description: "Daily Data Quality Check workflow completed successfully",
    user: {
      id: "user-1",
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
      role: "Data Engineer"
    },
    target: {
      type: "workflow",
      id: "wf-1",
      name: "Daily Data Quality Check"
    },
    status: "success",
    duration: 38,
    impact: "medium",
    metadata: {
      recordsProcessed: 2500000,
      issuesFound: 12,
      qualityScore: 98.5
    }
  },
  {
    id: "act-2",
    timestamp: "2024-01-20T14:15:00Z",
    type: "scan",
    action: "started",
    description: "PCI DSS compliance scan initiated on payment database",
    user: {
      id: "user-2",
      name: "Mike Johnson",
      avatar: "/avatars/mike.jpg",
      role: "Compliance Officer"
    },
    target: {
      type: "data-source",
      id: "ds-5",
      name: "Payment Database"
    },
    status: "in-progress",
    impact: "high",
    metadata: {
      scanType: "compliance",
      framework: "PCI DSS",
      estimatedDuration: 45
    }
  },
  {
    id: "act-3",
    timestamp: "2024-01-20T13:45:00Z",
    type: "alert",
    action: "triggered",
    description: "High volume of sensitive data detected in marketing database",
    user: {
      id: "system",
      name: "System",
      role: "Automated"
    },
    target: {
      type: "data-source",
      id: "ds-8",
      name: "Marketing Database"
    },
    status: "warning",
    impact: "high",
    metadata: {
      sensitiveRecords: 15000,
      classification: "PII",
      threshold: 10000
    }
  },
  {
    id: "act-4",
    timestamp: "2024-01-20T13:30:00Z",
    type: "pipeline",
    action: "completed",
    description: "Customer ETL pipeline finished with 99.9% success rate",
    user: {
      id: "user-3",
      name: "Alex Rivera",
      avatar: "/avatars/alex.jpg",
      role: "Data Engineer"
    },
    target: {
      type: "pipeline",
      id: "pl-1",
      name: "Customer Data ETL"
    },
    status: "success",
    duration: 42,
    impact: "medium",
    metadata: {
      recordsProcessed: 1250000,
      successRate: 99.9,
      errorCount: 125
    }
  },
  {
    id: "act-5",
    timestamp: "2024-01-20T13:00:00Z",
    type: "classification",
    action: "updated",
    description: "Auto-classification model retrained with new data patterns",
    user: {
      id: "user-4",
      name: "Dr. Emily Watson",
      avatar: "/avatars/emily.jpg",
      role: "Data Scientist"
    },
    target: {
      type: "system",
      id: "model-1",
      name: "Auto-Classification Model"
    },
    status: "success",
    impact: "medium",
    metadata: {
      accuracy: 94.8,
      trainingData: 500000,
      improvementPercent: 2.3
    }
  },
  {
    id: "act-6",
    timestamp: "2024-01-20T12:30:00Z",
    type: "user",
    action: "created",
    description: "New user account created for external auditor",
    user: {
      id: "user-1",
      name: "Sarah Chen", 
      avatar: "/avatars/sarah.jpg",
      role: "Data Engineer"
    },
    target: {
      type: "user",
      id: "user-5",
      name: "External Auditor"
    },
    status: "success",
    impact: "low",
    metadata: {
      role: "Auditor",
      permissions: ["read-only", "compliance-reports"],
      expiryDate: "2024-02-20"
    }
  }
]

const activityTypeIcons = {
  scan: Scan,
  classification: FileText,
  compliance: Shield,
  workflow: GitBranch,
  pipeline: Database,
  user: User,
  system: BarChart3,
  alert: Bell
}

const statusColors = {
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
  "in-progress": "text-purple-600 bg-purple-50 border-purple-200"
}

const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Activity,
  "in-progress": Play
}

const impactColors = {
  low: "text-gray-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  critical: "text-red-500"
}

export const ActivityTracker: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>(mockActivities)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("today")
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // In a real app, this would fetch new activities from the backend
      console.log("Refreshing activities...")
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = selectedType === "all" || activity.type === selectedType
      const matchesStatus = selectedStatus === "all" || activity.status === selectedStatus
      
      // Time range filtering (simplified for demo)
      let matchesTime = true
      if (selectedTimeRange !== "all") {
        const activityDate = new Date(activity.timestamp)
        const now = new Date()
        
        switch (selectedTimeRange) {
          case "today":
            matchesTime = activityDate.toDateString() === now.toDateString()
            break
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesTime = activityDate >= weekAgo
            break
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesTime = activityDate >= monthAgo
            break
        }
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesTime
    })
  }, [activities, searchQuery, selectedType, selectedStatus, selectedTimeRange])

  // Get activity statistics
  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayActivities = activities.filter(act => 
      new Date(act.timestamp).toDateString() === today
    )
    
    return {
      total: activities.length,
      today: todayActivities.length,
      success: activities.filter(act => act.status === 'success').length,
      warnings: activities.filter(act => act.status === 'warning').length,
      errors: activities.filter(act => act.status === 'error').length,
      inProgress: activities.filter(act => act.status === 'in-progress').length
    }
  }, [activities])

  // Format relative time
  const formatRelativeTime = useCallback((timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }, [])

  // Render activity item
  const renderActivityItem = useCallback((activity: ActivityEvent) => {
    const TypeIcon = activityTypeIcons[activity.type]
    const StatusIcon = statusIcons[activity.status]
    
    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {/* Type Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <TypeIcon className="h-5 w-5 text-accent-foreground" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatRelativeTime(activity.timestamp)}</span>
                      <span>•</span>
                      <span>by {activity.user.name}</span>
                      <span>•</span>
                      <span className={impactColors[activity.impact]}>
                        {activity.impact.toUpperCase()} impact
                      </span>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn("border", statusColors[activity.status])}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {activity.status}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Target className="h-4 w-4 mr-2" />
                          Go to Target
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Target and User */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.target.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.target.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user.role}
                    </span>
                  </div>
                </div>
                
                {/* Metadata */}
                {activity.metadata && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                    {activity.duration && (
                      <span className="text-muted-foreground mr-3">
                        Duration: {activity.duration}m
                      </span>
                    )}
                    {activity.metadata.recordsProcessed && (
                      <span className="text-muted-foreground mr-3">
                        Records: {activity.metadata.recordsProcessed.toLocaleString()}
                      </span>
                    )}
                    {activity.metadata.successRate && (
                      <span className="text-muted-foreground">
                        Success: {activity.metadata.successRate}%
                      </span>
                    )}
                  </div>
                )}
                
                {/* Progress for in-progress items */}
                {activity.status === 'in-progress' && (
                  <div className="mt-2">
                    <Progress value={65} className="h-1" />
                    <span className="text-xs text-muted-foreground">65% complete</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }, [formatRelativeTime])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Activity Tracker</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of all system activities and events
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={autoRefresh ? "default" : "outline"} 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", autoRefresh && "animate-spin")} />
              Auto Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <Card className="p-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              <p className="text-xs text-muted-foreground">Success</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </Card>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Type: {selectedType === 'all' ? 'All' : selectedType}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedType('all')}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('workflow')}>
                Workflows
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('pipeline')}>
                Pipelines
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('scan')}>
                Scans
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('classification')}>
                Classifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('compliance')}>
                Compliance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('user')}>
                User Actions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('alert')}>
                Alerts
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
              <DropdownMenuItem onClick={() => setSelectedStatus('success')}>
                Success
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('warning')}>
                Warning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('error')}>
                Error
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus('in-progress')}>
                In Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Time: {selectedTimeRange}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedTimeRange('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedTimeRange('week')}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedTimeRange('month')}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedTimeRange('all')}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Activity Feed */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-6">
          <div className="space-y-4">
            <AnimatePresence>
              {filteredActivities.map(renderActivityItem)}
            </AnimatePresence>
            
            {filteredActivities.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No activities found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default ActivityTracker