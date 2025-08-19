"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plug, CheckCircle, AlertCircle, Clock, RefreshCw, PlusCircle, 
  Eye, Edit, Trash2, Search, Settings, Wifi, WifiOff, Zap
} from "lucide-react"

// Enterprise Integration
import { ComplianceHooks } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import type { 
  ComplianceIntegration, 
  ComplianceComponentProps 
} from '../types'

interface ComplianceIntegrationsProps extends ComplianceComponentProps {
  onCreateIntegration?: () => void
  onEditIntegration?: (integration: ComplianceIntegration) => void
  onViewIntegration?: (integration: ComplianceIntegration) => void
  onDeleteIntegration?: (integration: ComplianceIntegration) => void
}

const ComplianceIntegrations: React.FC<ComplianceIntegrationsProps> = ({
  dataSourceId,
  searchQuery: initialSearchQuery = '',
  filters: initialFilters = {},
  onRefresh,
  onError,
  className = '',
  onCreateIntegration,
  onEditIntegration,
  onViewIntegration,
  onDeleteIntegration
}) => {
  const enterprise = useEnterpriseCompliance()
  
  // Enterprise hooks
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceIntegrations',
    dataSourceId
  })
  
  const integrationManagement = ComplianceHooks.useIntegrationManagement()
  
  // State
  const [integrations, setIntegrations] = useState<ComplianceIntegration[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filters, setFilters] = useState(initialFilters)
  const [activeTab, setActiveTab] = useState('all')

  // Load integrations from backend
  useEffect(() => {
    const loadIntegrations = async () => {
      setLoading(true)
      try {
        // Use real backend API call through enterprise integration
        const response = await ComplianceAPIs.Integration.getIntegrations({
          integration_type: filters.integration_type,
          provider: filters.provider,
          status: activeTab !== 'all' ? activeTab : undefined
        })
        
        setIntegrations(response || [])
        
        // Emit success event
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'integrations_loaded', count: response?.length || 0 },
          source: 'ComplianceIntegrations',
          severity: 'low'
        })
        
      } catch (error) {
        console.error('Failed to load integrations:', error)
        enterprise.sendNotification('error', 'Failed to load compliance integrations')
        onError?.('Failed to load compliance integrations')
        
        // Emit error event
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'integrations_load_failed', error: error.message },
          source: 'ComplianceIntegrations',
          severity: 'high'
        })
      } finally {
        setLoading(false)
      }
    }

    loadIntegrations()
  }, [dataSourceId, filters, activeTab, enterprise])

  // Filter integrations based on active tab and search
  const filteredIntegrations = integrations.filter(integration => {
    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'active' && integration.status !== 'active') return false
      if (activeTab === 'error' && integration.status !== 'error') return false
      if (activeTab === 'pending' && integration.status !== 'pending') return false
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        integration.name.toLowerCase().includes(searchLower) ||
        integration.provider.toLowerCase().includes(searchLower) ||
        integration.integration_type.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'error':
        return 'destructive'
      case 'pending':
        return 'secondary'
      case 'inactive':
        return 'outline'
      case 'testing':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'inactive':
        return <WifiOff className="h-4 w-4 text-gray-500" />
      case 'testing':
        return <Zap className="h-4 w-4 text-blue-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />
    }
  }

  // Handle test integration
  const handleTestIntegration = async (integration: ComplianceIntegration) => {
    try {
      const result = await ComplianceAPIs.Integration.testIntegration(integration.id as number)
      if (result.status === 'success') {
        enterprise.sendNotification('success', 'Integration test successful')
      } else {
        enterprise.sendNotification('error', `Integration test failed: ${result.error_message}`)
      }
    } catch (error) {
      console.error('Failed to test integration:', error)
      enterprise.sendNotification('error', 'Failed to test integration')
    }
  }

  // Handle sync integration
  const handleSyncIntegration = async (integration: ComplianceIntegration) => {
    try {
      await ComplianceAPIs.Integration.syncIntegration(integration.id as number)
      setIntegrations(prev => prev.map(i => 
        i.id === integration.id ? { ...i, last_sync_status: 'success', last_synced_at: new Date().toISOString() } : i
      ))
      enterprise.sendNotification('success', 'Integration sync started')
    } catch (error) {
      console.error('Failed to sync integration:', error)
      enterprise.sendNotification('error', 'Failed to sync integration')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compliance Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect and manage external compliance tools and systems
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={onCreateIntegration}>
            <PlusCircle className="h-4 w-4 mr-1" />
            New Integration
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filters.integration_type || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, integration_type: value || undefined }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Integration Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="grc_tool">GRC Tool</SelectItem>
              <SelectItem value="security_scanner">Security Scanner</SelectItem>
              <SelectItem value="audit_platform">Audit Platform</SelectItem>
              <SelectItem value="risk_management">Risk Management</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="ticketing">Ticketing</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.provider || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, provider: value || undefined }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Providers</SelectItem>
              <SelectItem value="ServiceNow">ServiceNow</SelectItem>
              <SelectItem value="Qualys">Qualys</SelectItem>
              <SelectItem value="Atlassian">Atlassian</SelectItem>
              <SelectItem value="Microsoft">Microsoft</SelectItem>
              <SelectItem value="AWS">AWS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredIntegrations.length === 0 ? (
            <div className="text-center py-12">
              <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No integrations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by connecting your first integration'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateIntegration}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Integration
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(integration.status)}
                            <CardTitle className="text-base line-clamp-1">
                              {integration.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="line-clamp-1">
                            {integration.provider} • {integration.integration_type.replace('_', ' ')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Status and Type */}
                        <div className="flex items-center justify-between">
                          <Badge variant={getStatusBadgeVariant(integration.status)}>
                            {integration.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {integration.sync_frequency.replace('_', ' ')}
                          </Badge>
                        </div>

                        {/* Sync Statistics */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Success Rate</span>
                            <span>{integration.sync_statistics.success_rate.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Records Synced</span>
                            <span>{integration.sync_statistics.total_records.toLocaleString()}</span>
                          </div>
                          {integration.last_synced_at && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Last Sync</span>
                              <span>
                                {new Date(integration.last_synced_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Error Message */}
                        {integration.error_message && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            {integration.error_message}
                          </div>
                        )}

                        {/* Supported Frameworks */}
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">Supported Frameworks</span>
                          <div className="flex flex-wrap gap-1">
                            {integration.supported_frameworks.slice(0, 3).map((framework) => (
                              <Badge key={framework} variant="outline" className="text-xs">
                                {framework}
                              </Badge>
                            ))}
                            {integration.supported_frameworks.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{integration.supported_frameworks.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewIntegration?.(integration)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditIntegration?.(integration)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTestIntegration(integration)
                              }}
                            >
                              <Zap className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-1">
                            {integration.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSyncIntegration(integration)
                                }}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Sync
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteIntegration?.(integration)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComplianceIntegrations
