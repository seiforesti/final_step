"use client"

import { useState, useEffect } from "react"
import { Cloud, Settings, Shield, Key, Eye, EyeOff, CheckCircle, AlertTriangle, X, Plus, Trash2, Save, TestTube, RefreshCw, Database, Server, Globe, Lock, Unlock, Network, HardDrive, Cpu, Zap, Info, ExternalLink, Download, Upload, Copy, Edit, EyeIcon, EyeOffIcon,  } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { DataSource, CloudConfig, ReplicaConfig, SSLConfig } from "./types"
import {
  useUpdateDataSourceMutation,
  validateCloudConfig,
  validateReplicaConfig,
  validateSSLConfig,
} from "./services/apis"

interface DataSourceCloudConfigProps {
  dataSource: DataSource
  onSave?: (config: any) => void
  onCancel?: () => void
}

export function DataSourceCloudConfig({
  dataSource,
  onSave,
  onCancel,
}: DataSourceCloudConfigProps) {
  const [activeTab, setActiveTab] = useState("cloud")
  const [isEditing, setIsEditing] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<any>({})

  // Form states
  const [cloudProvider, setCloudProvider] = useState(dataSource.cloud_provider || "")
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(dataSource.cloud_config || {})
  const [replicaConfig, setReplicaConfig] = useState<ReplicaConfig>(dataSource.replica_config || {})
  const [sslConfig, setSslConfig] = useState<SSLConfig>(dataSource.ssl_config || {})
  const [poolConfig, setPoolConfig] = useState({
    pool_size: dataSource.pool_size || 5,
    max_overflow: dataSource.max_overflow || 10,
    pool_timeout: dataSource.pool_timeout || 30,
    checkout_timeout: 30,
    recycle_time: 3600,
    echo: false,
    pre_ping: true,
  })

  // Mutations
  const updateMutation = useUpdateDataSourceMutation()

  const handleSave = async () => {
    try {
      const updates = {
        cloud_provider: cloudProvider || null,
        cloud_config: Object.keys(cloudConfig).length > 0 ? cloudConfig : null,
        replica_config: Object.keys(replicaConfig).length > 0 ? replicaConfig : null,
        ssl_config: Object.keys(sslConfig).length > 0 ? sslConfig : null,
        pool_size: poolConfig.pool_size,
        max_overflow: poolConfig.max_overflow,
        pool_timeout: poolConfig.pool_timeout,
      }

      await updateMutation.mutateAsync({ id: dataSource.id, ...updates })
      setIsEditing(false)
      onSave?.(updates)
    } catch (error) {
      console.error("Failed to save cloud configuration:", error)
    }
  }

  const handleValidate = async (type: "cloud" | "replica" | "ssl") => {
    setIsValidating(true)
    try {
      let result
      switch (type) {
        case "cloud":
          result = await validateCloudConfig(dataSource.id)
          break
        case "replica":
          result = await validateReplicaConfig(dataSource.id)
          break
        case "ssl":
          result = await validateSSLConfig(dataSource.id)
          break
      }
      setValidationResults(prev => ({ ...prev, [type]: result }))
    } catch (error) {
      console.error(`Failed to validate ${type} config:`, error)
      setValidationResults(prev => ({ 
        ...prev, 
        [type]: { success: false, message: "Validation failed" } 
      }))
    } finally {
      setIsValidating(false)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "aws":
        return <Cloud className="h-4 w-4 text-orange-500" />
      case "azure":
        return <Cloud className="h-4 w-4 text-blue-500" />
      case "gcp":
        return <Cloud className="h-4 w-4 text-red-500" />
      default:
        return <Cloud className="h-4 w-4" />
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "aws":
        return "Amazon Web Services"
      case "azure":
        return "Microsoft Azure"
      case "gcp":
        return "Google Cloud Platform"
      default:
        return "Unknown"
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Cloud Configuration</h2>
            <p className="text-muted-foreground">
              Configure cloud provider settings, connection pooling, and security
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showSecrets ? "Hide" : "Show"} Secrets
            </Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Configuration
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Provider
            </TabsTrigger>
            <TabsTrigger value="replica" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Replica Set
            </TabsTrigger>
            <TabsTrigger value="ssl" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              SSL/TLS
            </TabsTrigger>
            <TabsTrigger value="pool" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Connection Pool
            </TabsTrigger>
          </TabsList>

          {/* Cloud Provider Tab */}
          <TabsContent value="cloud" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Cloud Provider Configuration
                </CardTitle>
                <CardDescription>
                  Configure cloud provider settings and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cloud-provider">Cloud Provider</Label>
                    <Select
                      value={cloudProvider}
                      onValueChange={setCloudProvider}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cloud provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-orange-500" />
                            Amazon Web Services
                          </div>
                        </SelectItem>
                        <SelectItem value="azure">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-blue-500" />
                            Microsoft Azure
                          </div>
                        </SelectItem>
                        <SelectItem value="gcp">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-red-500" />
                            Google Cloud Platform
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={cloudConfig.region || ""}
                      onChange={(e) => setCloudConfig(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="us-east-1"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {cloudProvider && (
                  <div className="space-y-4">
                    <Separator />
                    <h4 className="font-medium">Credentials</h4>
                    
                    {cloudProvider === "aws" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="access-key">Access Key ID</Label>
                          <Input
                            id="access-key"
                            type={showSecrets ? "text" : "password"}
                            value={cloudConfig.access_key_id || ""}
                            onChange={(e) => setCloudConfig(prev => ({ ...prev, access_key_id: e.target.value }))}
                            placeholder="AKIA..."
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secret-key">Secret Access Key</Label>
                          <div className="relative">
                            <Input
                              id="secret-key"
                              type={showSecrets ? "text" : "password"}
                              value={cloudConfig.secret_access_key || ""}
                              onChange={(e) => setCloudConfig(prev => ({ ...prev, secret_access_key: e.target.value }))}
                              placeholder="••••••••"
                              disabled={!isEditing}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowSecrets(!showSecrets)}
                            >
                              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {cloudProvider === "azure" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tenant-id">Tenant ID</Label>
                          <Input
                            id="tenant-id"
                            value={cloudConfig.tenant_id || ""}
                            onChange={(e) => setCloudConfig(prev => ({ ...prev, tenant_id: e.target.value }))}
                            placeholder="00000000-0000-0000-0000-000000000000"
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-id">Client ID</Label>
                          <Input
                            id="client-id"
                            value={cloudConfig.client_id || ""}
                            onChange={(e) => setCloudConfig(prev => ({ ...prev, client_id: e.target.value }))}
                            placeholder="00000000-0000-0000-0000-000000000000"
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-secret">Client Secret</Label>
                          <div className="relative">
                            <Input
                              id="client-secret"
                              type={showSecrets ? "text" : "password"}
                              value={cloudConfig.client_secret || ""}
                              onChange={(e) => setCloudConfig(prev => ({ ...prev, client_secret: e.target.value }))}
                              placeholder="••••••••"
                              disabled={!isEditing}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowSecrets(!showSecrets)}
                            >
                              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {cloudProvider === "gcp" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="project-id">Project ID</Label>
                          <Input
                            id="project-id"
                            value={cloudConfig.project_id || ""}
                            onChange={(e) => setCloudConfig(prev => ({ ...prev, project_id: e.target.value }))}
                            placeholder="my-project-123"
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="service-account-key">Service Account Key (JSON)</Label>
                          <Textarea
                            id="service-account-key"
                            value={cloudConfig.service_account_key || ""}
                            onChange={(e) => setCloudConfig(prev => ({ ...prev, service_account_key: e.target.value }))}
                            placeholder="Paste your service account JSON key here..."
                            rows={6}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleValidate("cloud")}
                    disabled={isValidating || !isEditing}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {isValidating ? "Validating..." : "Validate Configuration"}
                  </Button>
                  {validationResults.cloud && (
                    <Badge variant={validationResults.cloud.success ? "default" : "destructive"}>
                      {validationResults.cloud.success ? "Valid" : "Invalid"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Replica Set Tab */}
          <TabsContent value="replica" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Replica Set Configuration
                </CardTitle>
                <CardDescription>
                  Configure read replicas for improved performance and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-replicas"
                    checked={replicaConfig.enabled || false}
                    onCheckedChange={(checked) => setReplicaConfig(prev => ({ ...prev, enabled: checked }))}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="enable-replicas">Enable Read Replicas</Label>
                </div>

                {replicaConfig.enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="replica-count">Number of Replicas</Label>
                        <Input
                          id="replica-count"
                          type="number"
                          min="1"
                          max="10"
                          value={replicaConfig.replica_count || 1}
                          onChange={(e) => setReplicaConfig(prev => ({ ...prev, replica_count: parseInt(e.target.value) }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="replica-lag">Max Replica Lag (seconds)</Label>
                        <Input
                          id="replica-lag"
                          type="number"
                          min="0"
                          value={replicaConfig.max_replica_lag || 30}
                          onChange={(e) => setReplicaConfig(prev => ({ ...prev, max_replica_lag: parseInt(e.target.value) }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Replica Endpoints</Label>
                      <div className="space-y-2">
                        {(replicaConfig.replica_endpoints || []).map((endpoint, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={endpoint}
                              onChange={(e) => {
                                const newEndpoints = [...(replicaConfig.replica_endpoints || [])]
                                newEndpoints[index] = e.target.value
                                setReplicaConfig(prev => ({ ...prev, replica_endpoints: newEndpoints }))
                              }}
                              placeholder="replica-host:port"
                              disabled={!isEditing}
                            />
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newEndpoints = replicaConfig.replica_endpoints?.filter((_, i) => i !== index) || []
                                  setReplicaConfig(prev => ({ ...prev, replica_endpoints: newEndpoints }))
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newEndpoints = [...(replicaConfig.replica_endpoints || []), ""]
                              setReplicaConfig(prev => ({ ...prev, replica_endpoints: newEndpoints }))
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Replica
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidate("replica")}
                        disabled={isValidating || !isEditing}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        {isValidating ? "Validating..." : "Validate Replicas"}
                      </Button>
                      {validationResults.replica && (
                        <Badge variant={validationResults.replica.success ? "default" : "destructive"}>
                          {validationResults.replica.success ? "Valid" : "Invalid"}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SSL/TLS Tab */}
          <TabsContent value="ssl" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SSL/TLS Configuration
                </CardTitle>
                <CardDescription>
                  Configure SSL/TLS settings for secure connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-ssl"
                    checked={sslConfig.enabled || false}
                    onCheckedChange={(checked) => setSslConfig(prev => ({ ...prev, enabled: checked }))}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="enable-ssl">Enable SSL/TLS</Label>
                </div>

                {sslConfig.enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ssl-mode">SSL Mode</Label>
                        <Select
                          value={sslConfig.ssl_mode || "verify-full"}
                          onValueChange={(value) => setSslConfig(prev => ({ ...prev, ssl_mode: value }))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disable">Disable</SelectItem>
                            <SelectItem value="require">Require</SelectItem>
                            <SelectItem value="verify-ca">Verify CA</SelectItem>
                            <SelectItem value="verify-full">Verify Full</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ssl-version">SSL Version</Label>
                        <Select
                          value={sslConfig.ssl_version || "TLSv1.2"}
                          onValueChange={(value) => setSslConfig(prev => ({ ...prev, ssl_version: value }))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TLSv1.0">TLS 1.0</SelectItem>
                            <SelectItem value="TLSv1.1">TLS 1.1</SelectItem>
                            <SelectItem value="TLSv1.2">TLS 1.2</SelectItem>
                            <SelectItem value="TLSv1.3">TLS 1.3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ca-cert">CA Certificate</Label>
                      <Textarea
                        id="ca-cert"
                        value={sslConfig.ca_certificate || ""}
                        onChange={(e) => setSslConfig(prev => ({ ...prev, ca_certificate: e.target.value }))}
                        placeholder="-----BEGIN CERTIFICATE-----..."
                        rows={4}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client-cert">Client Certificate</Label>
                        <Textarea
                          id="client-cert"
                          value={sslConfig.client_certificate || ""}
                          onChange={(e) => setSslConfig(prev => ({ ...prev, client_certificate: e.target.value }))}
                          placeholder="-----BEGIN CERTIFICATE-----..."
                          rows={4}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client-key">Client Private Key</Label>
                        <div className="relative">
                          <Textarea
                            id="client-key"
                            value={sslConfig.client_private_key || ""}
                            onChange={(e) => setSslConfig(prev => ({ ...prev, client_private_key: e.target.value }))}
                            placeholder="-----BEGIN PRIVATE KEY-----..."
                            rows={4}
                            disabled={!isEditing}
                            className={showSecrets ? "" : "text-security-disc"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => setShowSecrets(!showSecrets)}
                          >
                            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidate("ssl")}
                        disabled={isValidating || !isEditing}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        {isValidating ? "Validating..." : "Validate SSL"}
                      </Button>
                      {validationResults.ssl && (
                        <Badge variant={validationResults.ssl.success ? "default" : "destructive"}>
                          {validationResults.ssl.success ? "Valid" : "Invalid"}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connection Pool Tab */}
          <TabsContent value="pool" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Connection Pool Configuration
                </CardTitle>
                <CardDescription>
                  Configure connection pooling for optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pool-size">Pool Size</Label>
                    <Input
                      id="pool-size"
                      type="number"
                      min="1"
                      max="50"
                      value={poolConfig.pool_size}
                      onChange={(e) => setPoolConfig(prev => ({ ...prev, pool_size: parseInt(e.target.value) }))}
                      disabled={!isEditing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of connections to maintain
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-overflow">Max Overflow</Label>
                    <Input
                      id="max-overflow"
                      type="number"
                      min="0"
                      max="20"
                      value={poolConfig.max_overflow}
                      onChange={(e) => setPoolConfig(prev => ({ ...prev, max_overflow: parseInt(e.target.value) }))}
                      disabled={!isEditing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Additional connections when pool is full
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pool-timeout">Pool Timeout (seconds)</Label>
                    <Input
                      id="pool-timeout"
                      type="number"
                      min="1"
                      max="300"
                      value={poolConfig.pool_timeout}
                      onChange={(e) => setPoolConfig(prev => ({ ...prev, pool_timeout: parseInt(e.target.value) }))}
                      disabled={!isEditing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Time to wait for available connection
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkout-timeout">Checkout Timeout (seconds)</Label>
                    <Input
                      id="checkout-timeout"
                      type="number"
                      min="1"
                      max="300"
                      value={poolConfig.checkout_timeout || 30}
                      onChange={(e) => setPoolConfig(prev => ({ ...prev, checkout_timeout: parseInt(e.target.value) }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recycle-time">Recycle Time (seconds)</Label>
                    <Input
                      id="recycle-time"
                      type="number"
                      min="0"
                      max="3600"
                      value={poolConfig.recycle_time || 3600}
                      onChange={(e) => setPoolConfig(prev => ({ ...prev, recycle_time: parseInt(e.target.value) }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="echo"
                    checked={poolConfig.echo || false}
                    onCheckedChange={(checked) => setPoolConfig(prev => ({ ...prev, echo: checked }))}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="echo">Enable SQL Echo (Debug)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pre-ping"
                    checked={poolConfig.pre_ping || true}
                    onCheckedChange={(checked) => setPoolConfig(prev => ({ ...prev, pre_ping: checked }))}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="pre-ping">Enable Pre-ping (Connection Validation)</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status and Alerts */}
        <div className="space-y-4">
          {updateMutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to save configuration. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {updateMutation.isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Configuration saved successfully.
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    <span className="font-medium">Cloud Provider</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cloudProvider ? getProviderName(cloudProvider) : "Not configured"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    <span className="font-medium">Replica Set</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {replicaConfig.enabled ? `${replicaConfig.replica_count || 1} replicas` : "Disabled"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">SSL/TLS</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sslConfig.enabled ? sslConfig.ssl_mode || "Enabled" : "Disabled"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">Connection Pool</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {poolConfig.pool_size} connections
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
