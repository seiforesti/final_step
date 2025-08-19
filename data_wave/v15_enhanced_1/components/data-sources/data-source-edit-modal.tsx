"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  RefreshCw, 
  Settings, 
  Shield, 
  Cloud, 
  Server,
  Network,
  Lock,
  Monitor,
  Archive,
  Tag,
  User,
  Calendar,
  Activity,
  Zap,
  Globe
} from "lucide-react"
import { toast } from "sonner"

// Import backend services and types
import { useUpdateDataSourceMutation, useTestConnectionMutation } from "./services/enterprise-apis"
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"
import { useRBACIntegration } from "./hooks/use-rbac-integration"
import { DataSource, DataSourceUpdateParams } from "./types"

interface DataSourceEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataSource: DataSource
  onSuccess?: () => void
}

const DATA_SOURCE_TYPES = [
  { value: "postgresql", label: "PostgreSQL", icon: Database },
  { value: "mysql", label: "MySQL", icon: Database },
  { value: "mongodb", label: "MongoDB", icon: Database },
  { value: "snowflake", label: "Snowflake", icon: Cloud },
  { value: "s3", label: "Amazon S3", icon: Archive },
  { value: "redis", label: "Redis", icon: Zap }
]

const ENVIRONMENTS = [
  { value: "production", label: "Production", color: "text-red-600 bg-red-50" },
  { value: "staging", label: "Staging", color: "text-yellow-600 bg-yellow-50" },
  { value: "development", label: "Development", color: "text-blue-600 bg-blue-50" },
  { value: "test", label: "Test", color: "text-green-600 bg-green-50" }
]

const CRITICALITY_LEVELS = [
  { value: "critical", label: "Critical", color: "text-red-600 bg-red-50" },
  { value: "high", label: "High", color: "text-orange-600 bg-orange-50" },
  { value: "medium", label: "Medium", color: "text-yellow-600 bg-yellow-50" },
  { value: "low", label: "Low", color: "text-green-600 bg-green-50" }
]

const DATA_CLASSIFICATIONS = [
  { value: "public", label: "Public", color: "text-green-600 bg-green-50" },
  { value: "internal", label: "Internal", color: "text-blue-600 bg-blue-50" },
  { value: "confidential", label: "Confidential", color: "text-orange-600 bg-orange-50" },
  { value: "restricted", label: "Restricted", color: "text-red-600 bg-red-50" }
]

const SCAN_FREQUENCIES = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
]

const CLOUD_PROVIDERS = [
  { value: "aws", label: "Amazon Web Services" },
  { value: "azure", label: "Microsoft Azure" },
  { value: "gcp", label: "Google Cloud Platform" }
]

export function DataSourceEditModal({ 
  open, 
  onOpenChange, 
  dataSource, 
  onSuccess 
}: DataSourceEditModalProps) {
  const [formData, setFormData] = useState<DataSourceUpdateParams>({
    name: dataSource.name,
    description: dataSource.description || "",
    host: dataSource.host,
    port: dataSource.port,
    username: dataSource.username,
    password: "",
    database_name: dataSource.database_name || "",
    environment: dataSource.environment,
    criticality: dataSource.criticality,
    data_classification: dataSource.data_classification,
    owner: dataSource.owner || "",
    team: dataSource.team || "",
    tags: dataSource.tags || [],
    scan_frequency: dataSource.scan_frequency,
    monitoring_enabled: dataSource.monitoring_enabled,
    backup_enabled: dataSource.backup_enabled,
    encryption_enabled: dataSource.encryption_enabled,
    cloud_provider: dataSource.cloud_provider,
    cloud_config: dataSource.cloud_config || {},
    pool_size: dataSource.pool_size,
    max_overflow: dataSource.max_overflow,
    pool_timeout: dataSource.pool_timeout
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [newTag, setNewTag] = useState("")

  // Backend integration hooks
  const updateMutation = useUpdateDataSourceMutation()
  const testConnectionMutation = useTestConnectionMutation()

  // Enterprise features
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceEditModal',
    enableAnalytics: true,
    enableRealTimeUpdates: true
  })

  // RBAC integration
  const { logUserAction, hasPermission } = useRBACIntegration()

  // Reset form when dataSource changes
  useEffect(() => {
    setFormData({
      name: dataSource.name,
      description: dataSource.description || "",
      host: dataSource.host,
      port: dataSource.port,
      username: dataSource.username,
      password: "",
      database_name: dataSource.database_name || "",
      environment: dataSource.environment,
      criticality: dataSource.criticality,
      data_classification: dataSource.data_classification,
      owner: dataSource.owner || "",
      team: dataSource.team || "",
      tags: dataSource.tags || [],
      scan_frequency: dataSource.scan_frequency,
      monitoring_enabled: dataSource.monitoring_enabled,
      backup_enabled: dataSource.backup_enabled,
      encryption_enabled: dataSource.encryption_enabled,
      cloud_provider: dataSource.cloud_provider,
      cloud_config: dataSource.cloud_config || {},
      pool_size: dataSource.pool_size,
      max_overflow: dataSource.max_overflow,
      pool_timeout: dataSource.pool_timeout
    })
    setSubmitError(null)
    setConnectionResult(null)
  }, [dataSource])

  const validateForm = () => {
    if (!formData.name?.trim()) {
      setSubmitError("Name is required")
      return false
    }
    if (!formData.host?.trim()) {
      setSubmitError("Host is required")
      return false
    }
    if (!formData.username?.trim()) {
      setSubmitError("Username is required")
      return false
    }
    if (formData.port && (formData.port <= 0 || formData.port > 65535)) {
      setSubmitError("Port must be between 1 and 65535")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await updateMutation.mutateAsync({
        id: dataSource.id,
        params: formData
      })
      
      toast.success("Data source updated successfully")
      logUserAction('data_source_updated', 'data_source', dataSource.id)
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to update data source"
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      const result = await testConnectionMutation.mutateAsync(dataSource.id)
      setConnectionResult(result)
      
      if (result.success) {
        toast.success("Connection test successful")
      } else {
        toast.error("Connection test failed")
      }
    } catch (error: any) {
      setConnectionResult({
        success: false,
        message: error?.response?.data?.detail || error?.message || "Connection test failed"
      })
      toast.error("Connection test failed")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const getDefaultPort = (sourceType: string) => {
    const portMap: Record<string, number> = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017,
      redis: 6379
    }
    return portMap[sourceType] || 5432
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Edit Data Source: {dataSource.name}
          </DialogTitle>
          <DialogDescription>
            Update connection details, configuration, and metadata for your data source.
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="connection" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Connection
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="metadata" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Metadata
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Production Database"
                        value={formData.name || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Source Type</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          {DATA_SOURCE_TYPES.find(t => t.value === dataSource.source_type)?.label || dataSource.source_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">(Cannot be changed)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this data source (optional)"
                      value={formData.description || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connection Configuration Tab */}
            <TabsContent value="connection" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Connection Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Host *</Label>
                      <Input
                        id="host"
                        placeholder="e.g., db.example.com"
                        value={formData.host || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        min="1"
                        max="65535"
                        value={formData.port || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        placeholder="Database username"
                        value={formData.username || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Leave empty to keep current password"
                        value={formData.password || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database_name">Database Name</Label>
                    <Input
                      id="database_name"
                      placeholder="Database/schema name (optional)"
                      value={formData.database_name || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, database_name: e.target.value }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Test Connection</h4>
                      <p className="text-sm text-muted-foreground">
                        Verify that the connection settings are working
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                    >
                      {isTestingConnection ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  </div>

                  {connectionResult && (
                    <Alert variant={connectionResult.success ? "default" : "destructive"}>
                      <div className="flex items-center gap-2">
                        {connectionResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <span>{connectionResult.message}</span>
                      </div>
                      {connectionResult.connection_time_ms && (
                        <p className="text-sm mt-1">
                          Connection time: {connectionResult.connection_time_ms}ms
                        </p>
                      )}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Select 
                        value={formData.environment || ""} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, environment: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENVIRONMENTS.map((env) => (
                            <SelectItem key={env.value} value={env.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={env.color} variant="secondary">
                                  {env.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Criticality Level</Label>
                      <Select 
                        value={formData.criticality || ""} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, criticality: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select criticality" />
                        </SelectTrigger>
                        <SelectContent>
                          {CRITICALITY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <Badge className={level.color} variant="secondary">
                                {level.label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Classification</Label>
                    <Select 
                      value={formData.data_classification || ""} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, data_classification: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_CLASSIFICATIONS.map((classification) => (
                          <SelectItem key={classification.value} value={classification.value}>
                            <Badge className={classification.color} variant="secondary">
                              {classification.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Encryption Enabled</Label>
                        <p className="text-sm text-muted-foreground">Store credentials encrypted at rest</p>
                      </div>
                      <Switch
                        checked={formData.encryption_enabled || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, encryption_enabled: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Metadata & Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner</Label>
                      <Input
                        id="owner"
                        placeholder="e.g., john.doe@company.com"
                        value={formData.owner || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team">Team</Label>
                      <Input
                        id="team"
                        placeholder="e.g., Data Engineering"
                        value={formData.team || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Configuration Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Advanced Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Scan Frequency</Label>
                    <Select 
                      value={formData.scan_frequency || ""} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, scan_frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scan frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCAN_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pool_size">Pool Size</Label>
                      <Input
                        id="pool_size"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.pool_size || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, pool_size: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_overflow">Max Overflow</Label>
                      <Input
                        id="max_overflow"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.max_overflow || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_overflow: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pool_timeout">Pool Timeout (s)</Label>
                      <Input
                        id="pool_timeout"
                        type="number"
                        min="1"
                        max="300"
                        value={formData.pool_timeout || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, pool_timeout: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Monitoring Enabled</Label>
                        <p className="text-sm text-muted-foreground">Enable runtime monitoring for this data source</p>
                      </div>
                      <Switch
                        checked={formData.monitoring_enabled || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, monitoring_enabled: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Backup Enabled</Label>
                        <p className="text-sm text-muted-foreground">Enable automated backups for this data source</p>
                      </div>
                      <Switch
                        checked={formData.backup_enabled || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, backup_enabled: checked }))}
                      />
                    </div>
                  </div>

                  {dataSource.cloud_provider && (
                    <div className="space-y-2">
                      <Label>Cloud Provider</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          {CLOUD_PROVIDERS.find(p => p.value === dataSource.cloud_provider)?.label || dataSource.cloud_provider}
                        </Badge>
                        <span className="text-sm text-muted-foreground">(Cannot be changed)</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !hasPermission('data_source.edit')}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Data Source
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
