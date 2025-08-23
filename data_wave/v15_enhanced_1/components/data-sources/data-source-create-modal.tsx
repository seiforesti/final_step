"use client"

import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from 'lucide-react'

import { DataSourceCreateParams } from "./types"
import { DataDiscoveryWorkspace } from "./data-discovery/data-discovery-workspace"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Eye, RefreshCw, Database, Search, Layers } from 'lucide-react'

interface DataSourceCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (dataSource: DataSourceCreateParams) => Promise<void>
}

export function DataSourceCreateModal({ open, onClose, onSuccess }: DataSourceCreateModalProps) {
  const [formData, setFormData] = useState<DataSourceCreateParams>({
    name: "",
    source_type: "postgresql",
    location: "cloud",
    host: "",
    port: 5432,
    username: "",
    password: "",
    database_name: "",
    description: "",
    connection_properties: {}
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showDiscovery, setShowDiscovery] = useState(false)
  const [createdDataSource, setCreatedDataSource] = useState<any>(null)

  const validateForm = () => {
    if (!formData.name.trim()) {
      setSubmitError("Name is required")
      return false
    }
    if (!formData.host.trim()) {
      setSubmitError("Host is required")
      return false
    }
    if (!formData.username.trim()) {
      setSubmitError("Username is required")
      return false
    }
    if (!formData.password.trim()) {
      setSubmitError("Password is required")
      return false
    }
    if (formData.port <= 0 || formData.port > 65535) {
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
      if (onSuccess) {
        const result = await onSuccess(formData)
        setCreatedDataSource(result)
      }
      
      // Reset form
      setFormData({
        name: "",
        source_type: "postgresql",
        location: "cloud",
        host: "",
        port: 5432,
        username: "",
        password: "",
        database_name: "",
        description: "",
        connection_properties: {}
      })
      
      // Show option to start discovery
      setIsSubmitting(false)
      // Don't close immediately, show discovery option
    } catch (error: any) {
      setSubmitError(error?.message || "Failed to create data source")
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setSubmitError(null)
    }
  }

  const handleSourceTypeChange = (value: string) => {
    let defaultPort = 5432
    switch (value) {
      case "mysql":
        defaultPort = 3306
        break
      case "mongodb":
        defaultPort = 27017
        break
      case "redis":
        defaultPort = 6379
        break
      case "snowflake":
        defaultPort = 443
        break
      case "s3":
        defaultPort = 443
        break
      default:
        defaultPort = 5432
    }

    setFormData(prev => ({
      ...prev,
      source_type: value,
      port: defaultPort
    }))
  }

  const handleStartDiscovery = () => {
    setShowDiscovery(true)
    onClose() // Close the create modal
  }

  const handleCloseAndFinish = () => {
    // Reset form and close
    setFormData({
      name: "",
      source_type: "postgresql",
      location: "cloud",
      host: "",
      port: 5432,
      username: "",
      password: "",
      database_name: "",
      description: "",
      connection_properties: {}
    })
    setCreatedDataSource(null)
    onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Data Source</DialogTitle>
            <DialogDescription>
              Configure a new data source connection for scanning and monitoring.
            </DialogDescription>
          </DialogHeader>

          {!createdDataSource ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production Database"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source_type">Source Type *</Label>
                  <Select 
                    value={formData.source_type} 
                    onValueChange={handleSourceTypeChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="snowflake">Snowflake</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="redis">Redis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="host">Host *</Label>
                  <Input
                    id="host"
                    placeholder="e.g., db.example.com"
                    value={formData.host}
                    onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    min="1"
                    max="65535"
                    value={formData.port}
                    onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 0 }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Database username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Database password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="database_name">Database Name</Label>
                  <Input
                    id="database_name"
                    placeholder="Database/schema name (optional)"
                    value={formData.database_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, database_name: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cloud">Cloud</SelectItem>
                      <SelectItem value="on-premise">On-Premise</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this data source (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Data Source"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Data Source Created Successfully!</h3>
                <p className="text-muted-foreground">
                  {createdDataSource.name} has been added to your data catalog.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Start Data Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Would you like to start discovering and exploring the data structure 
                    of your new data source? This will help you understand what data is available
                    and set up your workspace.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 border rounded">
                      <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <div className="text-sm font-medium">Connect & Test</div>
                      <div className="text-xs text-muted-foreground">Verify connectivity</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <Search className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <div className="text-sm font-medium">Discover Schema</div>
                      <div className="text-xs text-muted-foreground">Explore data structure</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <Layers className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-sm font-medium">Create Workspace</div>
                      <div className="text-xs text-muted-foreground">Select and organize data</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleStartDiscovery} className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Start Discovery
                    </Button>
                    <Button variant="outline" onClick={handleCloseAndFinish}>
                      Skip for Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Data Discovery Workspace */}
      <DataDiscoveryWorkspace
        dataSource={createdDataSource}
        isOpen={showDiscovery}
        onClose={() => {
          setShowDiscovery(false)
          handleCloseAndFinish()
        }}
      />
    </>
  )
}
