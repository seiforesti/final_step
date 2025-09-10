"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GitBranch, Clock, User, FileText, Plus, Eye, Download, RotateCcw, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { toast } from "sonner"

// Import backend services and hooks
import { useDataSourceVersionHistoryQuery, useCreateVersionMutation, useRestoreVersionMutation } from "./services/enterprise-apis"
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"
import { useRBACIntegration } from "./hooks/use-rbac-integration"
import { DataSource } from "./types"

interface VersionHistoryProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface Version {
  id: string
  version: string
  description: string
  changes: string[]
  author: string
  timestamp: string
  type: "major" | "minor" | "patch"
  status: "active" | "deprecated" | "draft"
  configSnapshot?: Record<string, any>
  rollbackable: boolean
}

const VERSION_TYPES = [
  { id: "major", label: "Major", description: "Breaking changes or significant new features" },
  { id: "minor", label: "Minor", description: "New features, backwards compatible" },
  { id: "patch", label: "Patch", description: "Bug fixes and small improvements" }
]

export function DataSourceVersionHistory({
  dataSource,
  onNavigateToComponent,
  className = ""
}: VersionHistoryProps) {
  // Safety check for dataSource
  if (!dataSource) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Data Source Not Available</h3>
          <p className="text-muted-foreground">Please select a data source to view version history.</p>
        </div>
      </div>
    )
  }

  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [showCreateVersion, setShowCreateVersion] = useState(false)
  const [showVersionDetails, setShowVersionDetails] = useState(false)
  const [newVersion, setNewVersion] = useState({
    version: "",
    description: "",
    type: "minor" as const,
    changes: [""]
  })

  // Backend integration hooks
  const { data: versionData, isLoading, error, refetch } = useDataSourceVersionHistoryQuery(dataSource?.id)
  const createVersionMutation = useCreateVersionMutation()
  const restoreVersionMutation = useRestoreVersionMutation()

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceVersionHistory',
    dataSourceId: dataSource?.id,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // RBAC integration
  const { 
    currentUser, 
    hasPermission, 
    logUserAction 
  } = useRBACIntegration()

  // Process backend data - use real backend data only
  const versions = useMemo(() => {
    if (!versionData?.data) return []
    return versionData.data.map((version: any) => ({
      id: version.id,
      version: version.version,
      description: version.description,
      changes: version.changes || [],
      author: version.author,
      timestamp: version.timestamp,
      type: version.type,
      status: version.status,
      configSnapshot: version.config_snapshot,
      rollbackable: version.rollbackable
    }))
  }, [versionData])

  // Handlers
  const handleCreateVersion = async () => {
    if (!newVersion.version || !newVersion.description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      if (!dataSource?.id) {
        toast.error("Data source not available")
        return
      }
      
      await createVersionMutation.mutateAsync({
        data_source_id: dataSource.id,
        version: newVersion.version,
        description: newVersion.description,
        type: newVersion.type,
        changes: newVersion.changes.filter(change => change.trim() !== ""),
        author: currentUser?.username || 'system'
      })
      
      toast.success("Version created successfully")
      logUserAction('version_created', 'version_control', dataSource.id)
      refetch()
      setShowCreateVersion(false)
      setNewVersion({
        version: "",
        description: "",
        type: "minor",
        changes: [""]
      })
    } catch (error) {
      toast.error("Failed to create version")
      console.error('Error creating version:', error)
    }
  }

  const handleRestoreVersion = async (versionId: string) => {
    try {
      if (!dataSource?.id) {
        toast.error("Data source not available")
        return
      }
      
      await restoreVersionMutation.mutateAsync({
        data_source_id: dataSource.id,
        version_id: parseInt(versionId)
      })
      
      toast.success("Version restored successfully")
      logUserAction('version_restored', 'version_control', parseInt(versionId))
      refetch()
    } catch (error) {
      toast.error("Failed to restore version")
      console.error('Error restoring version:', error)
    }
  }

  const handleViewVersion = (version: Version) => {
    setSelectedVersion(version)
    setShowVersionDetails(true)
  }

  const addChangeItem = () => {
    setNewVersion(prev => ({
      ...prev,
      changes: [...prev.changes, ""]
    }))
  }

  const updateChangeItem = (index: number, value: string) => {
    setNewVersion(prev => ({
      ...prev,
      changes: prev.changes.map((change, i) => i === index ? value : change)
    }))
  }

  const removeChangeItem = (index: number) => {
    setNewVersion(prev => ({
      ...prev,
      changes: prev.changes.filter((_, i) => i !== index)
    }))
  }

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case "major": return "text-red-600 bg-red-50"
      case "minor": return "text-yellow-600 bg-yellow-50"
      case "patch": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50"
      case "deprecated": return "text-gray-600 bg-gray-50"
      case "draft": return "text-yellow-600 bg-yellow-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load version history</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-blue-600" />
            Version History
          </h2>
          <p className="text-muted-foreground">
            Track configuration changes and manage versions for {dataSource.name}
          </p>
        </div>
        {hasPermission('version_control.create') && (
          <Button onClick={() => setShowCreateVersion(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Version
          </Button>
        )}
      </div>

      {/* Version Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{versions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {versions.find(v => v.status === "active")?.version || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Major Releases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {versions.filter(v => v.type === "major").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {versions.length > 0 
                ? new Date(versions[0].timestamp).toLocaleDateString()
                : "Never"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Version Timeline</CardTitle>
          <CardDescription>
            Chronological history of data source configuration changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No version history found</p>
              <p className="text-sm">Create your first version to start tracking changes</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">v{version.version}</h4>
                          <Badge className={getVersionTypeColor(version.type)}>
                            {version.type}
                          </Badge>
                          <Badge className={getStatusColor(version.status)}>
                            {version.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewVersion(version)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {version.rollbackable && hasPermission('version_control.restore') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreVersion(version.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {version.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{version.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(version.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {version.changes.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-xs font-medium text-muted-foreground mb-1">Changes:</h5>
                          <ul className="text-xs space-y-1">
                            {version.changes.slice(0, 3).map((change, changeIndex) => (
                              <li key={changeIndex} className="flex items-start space-x-1">
                                <span className="text-muted-foreground">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                            {version.changes.length > 3 && (
                              <li className="text-muted-foreground">
                                +{version.changes.length - 3} more changes
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Version Dialog */}
      <Dialog open={showCreateVersion} onOpenChange={setShowCreateVersion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version snapshot of the current data source configuration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version-number">Version Number</Label>
                <Input
                  id="version-number"
                  placeholder="e.g., 2.1.0"
                  value={newVersion.version}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, version: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version-type">Version Type</Label>
                <Select value={newVersion.type} onValueChange={(value: any) => setNewVersion(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VERSION_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version-description">Description</Label>
              <Textarea
                id="version-description"
                placeholder="Brief description of changes in this version"
                value={newVersion.description}
                onChange={(e) => setNewVersion(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Changes</Label>
              <div className="space-y-2">
                {newVersion.changes.map((change, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Describe a change"
                      value={change}
                      onChange={(e) => updateChangeItem(index, e.target.value)}
                    />
                    {newVersion.changes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChangeItem(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addChangeItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Change
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateVersion(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateVersion}
              disabled={createVersionMutation.isPending}
            >
              {createVersionMutation.isPending ? "Creating..." : "Create Version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Details Dialog */}
      <Dialog open={showVersionDetails} onOpenChange={setShowVersionDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Version Details</DialogTitle>
            <DialogDescription>
              Detailed information for version {selectedVersion?.version}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm">v{selectedVersion.version}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge className={getVersionTypeColor(selectedVersion.type)}>
                    {selectedVersion.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Author</Label>
                  <p className="text-sm">{selectedVersion.author}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{new Date(selectedVersion.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm mt-1">{selectedVersion.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Changes</Label>
                <ul className="text-sm mt-1 space-y-1">
                  {selectedVersion.changes.map((change, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedVersion.configSnapshot && (
                <div>
                  <Label className="text-sm font-medium">Configuration Snapshot</Label>
                  <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-40">
                    {JSON.stringify(selectedVersion.configSnapshot, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDetails(false)}>
              Close
            </Button>
            {selectedVersion?.rollbackable && hasPermission('version_control.restore') && (
              <Button 
                onClick={() => {
                  handleRestoreVersion(selectedVersion.id)
                  setShowVersionDetails(false)
                }}
                disabled={restoreVersionMutation.isPending}
              >
                {restoreVersionMutation.isPending ? "Restoring..." : "Restore This Version"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
