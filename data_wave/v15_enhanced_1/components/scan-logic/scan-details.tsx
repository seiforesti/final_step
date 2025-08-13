"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Database,
  BarChart3,
} from "lucide-react"
import { useScanDetails } from "./hooks/use-scan-details"
import { ScanResultsView } from "./scan-results-view"
import { ScanEntitiesView } from "./scan-entities-view"

interface ScanDetailsProps {
  runId: string
  onBack: () => void
}

export function ScanDetails({ runId, onBack }: ScanDetailsProps) {
  const { scanRun, entities, issues, results, loading, error, updateIssueStatus, filterEntities, filterIssues } =
    useScanDetails(runId)

  const [activeTab, setActiveTab] = useState("overview")

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !scanRun) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">{error || "Scan not found"}</p>
          <Button variant="outline" onClick={onBack} className="mt-4 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "cancelled":
        return <Pause className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-3 w-3 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />
      case "info":
        return <Info className="h-3 w-3 text-blue-600" />
      default:
        return <Info className="h-3 w-3 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{scanRun.scanName}</h1>
            <p className="text-muted-foreground">Scan run details • {scanRun.dataSourceName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(scanRun.status)}
          <Badge
            variant={
              scanRun.status === "completed"
                ? "default"
                : scanRun.status === "running"
                  ? "secondary"
                  : scanRun.status === "failed"
                    ? "destructive"
                    : "outline"
            }
          >
            {scanRun.status}
          </Badge>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanRun.progress}%</div>
            <Progress value={scanRun.progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {scanRun.entitiesScanned.toLocaleString()} / {scanRun.entitiesTotal.toLocaleString()} entities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scanRun.duration ? `${Math.round(scanRun.duration / 1000)}s` : "Running..."}
            </div>
            <p className="text-xs text-muted-foreground">Started {new Date(scanRun.startTime).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanRun.issuesFound}</div>
            <p className="text-xs text-muted-foreground">Governance and quality issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Triggered By</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{scanRun.triggeredBy}</div>
            <p className="text-xs text-muted-foreground">Execution trigger</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {results && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Scan Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entities Scanned:</span>
                    <span className="font-medium">{results.summary.entitiesScanned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tables Scanned:</span>
                    <span className="font-medium">{results.summary.tablesScanned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Columns Scanned:</span>
                    <span className="font-medium">{results.summary.columnsScanned.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Classifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="font-medium">{results.summary.classificationsApplied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PII Detected:</span>
                    <span className="font-medium text-orange-600">{results.summary.piiDetected}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Issues & Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issues Found:</span>
                    <span className="font-medium text-red-600">{results.summary.issuesFound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommendations:</span>
                    <span className="font-medium">{results.recommendations.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Issues */}
          {issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Issues</CardTitle>
                <CardDescription>Top issues discovered during this scan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issues.slice(0, 5).map((issue) => (
                    <div key={issue.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge
                          variant={
                            issue.severity === "critical"
                              ? "destructive"
                              : issue.severity === "high"
                                ? "destructive"
                                : issue.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{issue.title}</p>
                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Entity: {issue.entity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <ScanEntitiesView entities={entities} />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results && <ScanResultsView results={results} onUpdateIssueStatus={updateIssueStatus} />}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scan Logs</CardTitle>
              <CardDescription>Detailed execution logs for this scan run</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {scanRun.logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-2 text-sm">
                      <div className="flex-shrink-0 mt-0.5">{getLogLevelIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground text-xs">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                        </div>
                        <p className="mt-1">{log.message}</p>
                        {log.details && (
                          <pre className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
