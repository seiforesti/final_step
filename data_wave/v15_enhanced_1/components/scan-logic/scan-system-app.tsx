"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Pause, Calendar, Activity, Database, AlertTriangle, CheckCircle } from "lucide-react"
import { useScanSystem } from "./hooks/use-scan-system"
import { ScanList } from "./scan-list"
import { ScanCreateModal } from "./scan-create-modal"
import { ScanScheduleList } from "./scan-schedule-list"
import { ScanDetails } from "./scan-details"

export function ScanSystemApp() {
  const {
    scanConfigs,
    scanRuns,
    scanSchedules,
    loading,
    error,
    createScan,
    updateScan,
    deleteScan,
    runScan,
    cancelScan,
    updateSchedule,
  } = useScanSystem()

  const [activeTab, setActiveTab] = useState("scans")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedScanRun, setSelectedScanRun] = useState<string | null>(null)

  // Calculate statistics
  const stats = {
    totalScans: scanConfigs.length,
    activeScans: scanConfigs.filter((s) => s.status === "active").length,
    runningScans: scanRuns.filter((r) => r.status === "running").length,
    scheduledScans: scanSchedules.filter((s) => s.enabled).length,
    recentIssues: scanRuns.reduce((sum, run) => sum + run.issuesFound, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (selectedScanRun) {
    return <ScanDetails runId={selectedScanRun} onBack={() => setSelectedScanRun(null)} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scan System</h1>
          <p className="text-muted-foreground">Manage data discovery scans and monitor data governance</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Scan
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <p className="text-xs text-muted-foreground">{stats.activeScans} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.runningScans}</div>
            <p className="text-xs text-muted-foreground">Currently executing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledScans}</div>
            <p className="text-xs text-muted-foreground">Auto-scheduled scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentIssues}</div>
            <p className="text-xs text-muted-foreground">From recent scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="scans">Scan Configurations</TabsTrigger>
          <TabsTrigger value="runs">Scan Runs</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-4">
          <ScanList
            scans={scanConfigs.filter(
              (scan) =>
                scan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                scan.description.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            onEdit={(scan) => {
              // Handle edit
              console.log("Edit scan:", scan)
            }}
            onDelete={deleteScan}
            onRun={runScan}
            onDuplicate={(scan) => {
              // Handle duplicate
              console.log("Duplicate scan:", scan)
            }}
          />
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <div className="space-y-4">
            {scanRuns
              .filter((run) => run.scanName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((run) => (
                <Card key={run.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3" onClick={() => setSelectedScanRun(run.id)}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{run.scanName}</CardTitle>
                        <CardDescription>
                          {run.dataSourceName} • Started {new Date(run.startTime).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            run.status === "completed"
                              ? "default"
                              : run.status === "running"
                                ? "secondary"
                                : run.status === "failed"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {run.status}
                        </Badge>
                        {run.status === "running" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              cancelScan(run.id)
                            }}
                          >
                            <Pause className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {run.entitiesScanned.toLocaleString()} / {run.entitiesTotal.toLocaleString()} entities
                      </span>
                      <span>{run.progress}% complete</span>
                      <span>{run.issuesFound} issues found</span>
                      {run.duration && <span>{Math.round(run.duration / 1000)}s duration</span>}
                    </div>
                    {run.status === "running" && (
                      <div className="w-full bg-secondary rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${run.progress}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <ScanScheduleList
            schedules={scanSchedules.filter((schedule) =>
              schedule.scanName.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            onUpdateSchedule={updateSchedule}
          />
        </TabsContent>
      </Tabs>

      {/* Create Scan Modal */}
      <ScanCreateModal open={showCreateModal} onOpenChange={setShowCreateModal} onCreateScan={createScan} />
    </div>
  )
}
