"use client"

import { useState, useEffect, useMemo } from "react"
import { useDataSourceScheduledTasksQuery } from "@/hooks/useDataSources"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Play, Pause, Edit, Trash2, Calendar, Zap, CheckCircle, AlertTriangle } from 'lucide-react'

// Import enterprise hooks for better backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"
import { useScheduledTasksQuery } from "./services/enterprise-apis"
import { DataSource } from "./types"

interface SchedulerProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface ScheduledTask {
  id: string
  name: string
  description: string
  type: "backup" | "scan" | "maintenance" | "report" | "custom"
  schedule: string
  status: "active" | "paused" | "disabled"
  lastRun?: string
  nextRun: string
  cronExpression: string
  enabled: boolean
  retryCount: number
  maxRetries: number
}

export function DataSourceScheduler({
  dataSource,
  onNavigateToComponent,
  className = "" }: SchedulerProps) {
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [filterType, setFilterType] = useState("all")

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceScheduler',
    dataSourceId: dataSource.id,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // Backend data queries
  const { data: tasksData, isLoading, error, refetch } = useScheduledTasksQuery(dataSource.id)

  // Transform backend data to component format
  const tasks: ScheduledTask[] = useMemo(() => {
    if (!tasksData) return []
    
    return tasksData.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description || '',
      type: task.task_type || 'scan',
      schedule: task.schedule_description || '',
      status: task.status || 'active',
      lastRun: task.last_run || undefined,
      nextRun: task.next_run || '',
      cronExpression: task.cron_expression || '',
      enabled: task.enabled || false,
      retryCount: task.retry_count || 0,
      maxRetries: task.max_retries || 3
    }))
  }, [tasksData])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "backup": return "text-blue-600 bg-blue-50"
      case "scan": return "text-red-600 bg-red-50"
      case "maintenance": return "text-green-600 bg-green-50"
      case "report": return "text-purple-600 bg-purple-50"
      case "custom": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50"
      case "paused": return "text-yellow-600 bg-yellow-50"
      case "disabled": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Play className="h-4 w-4" />
      case "paused": return <Pause className="h-4 w-4" />
      case "disabled": return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesType = filterType === "all" || task.type === filterType
      return matchesType
    })
  }, [tasks, filterType])

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === "active" ? "paused" : "active", enabled: !task.enabled }
        : task
    ))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 text-blue-600" />
            Task Scheduler
          </h2>
          <p className="text-muted-foreground">
            Manage scheduled tasks and automation for {dataSource.name}
          </p>
        </div>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === "active").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paused Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === "paused").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Temporarily stopped</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0
                ? new Date(tasks[0].nextRun).toLocaleDateString()
                : "No tasks"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Earliest scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tasks</CardTitle>
          <CardDescription>
            View and manage automated tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="backup">Backup</option>
                <option value="scan">Scan</option>
                <option value="maintenance">Maintenance</option>
                <option value="report">Report</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{task.name}</h3>
                      <Badge className={getTypeColor(task.type)}>
                        {task.type}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          {task.status}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <span>Schedule: {task.schedule}</span>
                      {task.lastRun && (
                        <span>Last Run: {new Date(task.lastRun).toLocaleDateString()}</span>
                      )}
                      <span>Next Run: {new Date(task.nextRun).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTaskStatus(task.id)}
                    >
                      {task.status === "active" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTasks(tasks.filter(t => t.id !== task.id))
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Scheduled Task</DialogTitle>
            <DialogDescription>
              Add a new automated task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-name">Task Name</Label>
              <Input id="task-name" placeholder="Enter task name" />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Input id="task-description" placeholder="Enter task description" />
            </div>
            <div>
              <Label htmlFor="task-type">Task Type</Label>
              <select id="task-type" className="w-full px-3 py-2 border rounded-md">
                <option value="backup">Backup</option>
                <option value="scan">Security Scan</option>
                <option value="maintenance">Maintenance</option>
                <option value="report">Report Generation</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <Label htmlFor="task-schedule">Schedule</Label>
              <select id="task-schedule" className="w-full px-3 py-2 border rounded-md">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Cron</option>
              </select>
            </div>
            <div>
              <Label htmlFor="task-time">Time</Label>
              <Input id="task-time" type="time" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateTask(false)}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scheduled Task</DialogTitle>
            <DialogDescription>
              Modify task settings and schedule
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <Label>Task Name</Label>
                <p className="text-sm">{selectedTask.name}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedTask.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="text-sm capitalize">{selectedTask.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm capitalize">{selectedTask.status}</p>
                </div>
                <div>
                  <Label>Schedule</Label>
                  <p className="text-sm">{selectedTask.schedule}</p>
                </div>
                <div>
                  <Label>Next Run</Label>
                  <p className="text-sm">{new Date(selectedTask.nextRun).toLocaleString()}</p>
                </div>
              </div>
              {selectedTask.lastRun && (
                <div>
                  <Label>Last Run</Label>
                  <p className="text-sm">{new Date(selectedTask.lastRun).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Cancel
            </Button>
            <Button onClick={() => setSelectedTask(null)}>
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
