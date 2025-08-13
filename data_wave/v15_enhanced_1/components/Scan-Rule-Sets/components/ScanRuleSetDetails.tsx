"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Database,
  Activity,
  Play,
  Copy,
  Download,
  Edit,
  BarChart3,
  Shield,
  Tag,
  Server,
  Plus,
} from "lucide-react"
import type { ScanRuleSet } from "../types"

interface ScanRuleSetDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ruleSet: ScanRuleSet
}

export const ScanRuleSetDetails: React.FC<ScanRuleSetDetailsProps> = ({ open, onOpenChange, ruleSet }) => {
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-500" />
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      draft: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "destructive"}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "default",
      critical: "destructive",
    } as const

    return <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>{priority}</Badge>
  }

  const mockExecutionHistory = [
    {
      id: 1,
      startTime: "2024-01-20T09:15:00Z",
      endTime: "2024-01-20T09:20:00Z",
      status: "completed",
      recordsProcessed: 125000,
      recordsMatched: 1250,
      duration: 300,
    },
    {
      id: 2,
      startTime: "2024-01-19T09:15:00Z",
      endTime: "2024-01-19T09:18:00Z",
      status: "completed",
      recordsProcessed: 123000,
      recordsMatched: 1180,
      duration: 180,
    },
    {
      id: 3,
      startTime: "2024-01-18T09:15:00Z",
      endTime: "2024-01-18T09:25:00Z",
      status: "failed",
      recordsProcessed: 45000,
      recordsMatched: 0,
      duration: 600,
    },
  ]

  const mockMetrics = {
    totalExecutions: 156,
    successfulExecutions: 152,
    failedExecutions: 4,
    avgExecutionTime: 285,
    totalRecordsProcessed: 15600000,
    totalRecordsMatched: 156000,
    avgThroughput: 54736,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{ruleSet.name}</DialogTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(ruleSet.status)}
                {getStatusBadge(ruleSet.status)}
                <Badge variant={ruleSet.type === "system" ? "default" : "secondary"}>{ruleSet.type}</Badge>
                {getPriorityBadge(ruleSet.priority)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Execute
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{ruleSet.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Version</label>
                      <p className="text-sm font-mono">{ruleSet.version}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created By</label>
                      <p className="text-sm">{ruleSet.createdBy}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm">{new Date(ruleSet.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{new Date(ruleSet.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ruleSet.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Success Rate</label>
                      <span className="text-sm font-medium">{ruleSet.successRate}%</span>
                    </div>
                    <Progress value={ruleSet.successRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Executions</label>
                      <p className="text-2xl font-bold">{ruleSet.executionCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Avg Duration</label>
                      <p className="text-2xl font-bold">{ruleSet.estimatedDuration}s</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Executed</label>
                    <p className="text-sm">
                      {ruleSet.lastExecuted ? new Date(ruleSet.lastExecuted).toLocaleString() : "Never"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Supported Data Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {ruleSet.dataSourceTypes.map((type) => (
                      <Badge key={type} variant="outline" className="justify-center">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(ruleSet.compliance || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm uppercase">{key}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">CPU</label>
                      <span className="text-sm font-medium">{ruleSet.resourceUsage.cpu}%</span>
                    </div>
                    <Progress value={ruleSet.resourceUsage.cpu} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Memory</label>
                      <span className="text-sm font-medium">{ruleSet.resourceUsage.memory} MB</span>
                    </div>
                    <Progress value={(ruleSet.resourceUsage.memory / 1024) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Storage</label>
                      <span className="text-sm font-medium">{ruleSet.resourceUsage.storage} MB</span>
                    </div>
                    <Progress value={(ruleSet.resourceUsage.storage / 4096) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scan Rules ({ruleSet.rules.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rules configured yet</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="executions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Records Processed</TableHead>
                      <TableHead>Records Matched</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockExecutionHistory.map((execution) => (
                      <TableRow key={execution.id}>
                        <TableCell>{new Date(execution.startTime).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {execution.status === "completed" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge variant={execution.status === "completed" ? "default" : "destructive"}>
                              {execution.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{execution.duration}s</TableCell>
                        <TableCell>{execution.recordsProcessed.toLocaleString()}</TableCell>
                        <TableCell>{execution.recordsMatched.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">{/* Placeholder for metrics content */}</CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>{/* Placeholder for settings content */}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
