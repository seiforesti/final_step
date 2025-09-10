"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Layers, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Settings, 
  Play, 
  Pause, 
  Square,
  Database,
  Monitor,
  Search,
  Shield,
  Users,
  Wrench,
  Sparkles,
  Zap,
  Target,
  Workflow,
  Brain,
  MessageSquare,
  Boxes,
  GitBranch,
  TestTube,
  Filter
} from 'lucide-react'

import { DataSource } from "../types"

interface ComponentIntegration {
  id: string
  name: string
  category: string
  description: string
  status: 'integrated' | 'missing' | 'error' | 'loading'
  workflowEnabled: boolean
  backendMapped: boolean
  endpoints: string[]
  dependencies: string[]
  lastTested?: string
  errorMessage?: string
}

interface ComponentIntegrationManagerProps {
  dataSource?: DataSource
  onComponentIntegration?: (componentId: string, status: string) => void
  onWorkflowTrigger?: (componentId: string, workflowType: string) => void
  className?: string
}

export function ComponentIntegrationManager({
  dataSource,
  onComponentIntegration,
  onWorkflowTrigger,
  className = ""
}: ComponentIntegrationManagerProps) {
  const [integrations, setIntegrations] = useState<Map<string, ComponentIntegration>>(new Map())
  const [isScanning, setIsScanning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Complete component registry with integration status
  const componentRegistry: ComponentIntegration[] = useMemo(() => [
    // Core Management Components
    { id: 'enterprise-dashboard', name: 'Enterprise Dashboard', category: 'core', description: 'Unified enterprise dashboard with AI insights', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources', '/proxy/rbac/me'], dependencies: [], },
    { id: 'ai-dashboard', name: 'AI-Powered Dashboard', category: 'core', description: 'Advanced AI analytics and predictive insights', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/ai/analytics', '/proxy/ai/predictions'], dependencies: ['enterprise-dashboard'], },
    { id: 'overview', name: 'Data Source Overview', category: 'core', description: 'Comprehensive data sources overview', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources/{id}/stats', '/proxy/scan/data-sources/{id}/health'], dependencies: [], },
    { id: 'grid', name: 'Grid View', category: 'core', description: 'Visual grid layout with real-time updates', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources'], dependencies: [], },
    { id: 'list', name: 'List View', category: 'core', description: 'Advanced list view with filtering', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources'], dependencies: [], },
    { id: 'details', name: 'Data Source Details', category: 'core', description: 'In-depth analysis with AI insights', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources/{id}'], dependencies: [], },

    // Monitoring & Analytics Components
    { id: 'monitoring', name: 'Real-time Monitoring', category: 'monitoring', description: 'Live health and performance metrics', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources/{id}/health'], dependencies: [], },
    { id: 'dashboard-monitoring', name: 'Monitoring Dashboard', category: 'monitoring', description: 'Advanced monitoring dashboards', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/monitoring/dashboard'], dependencies: ['monitoring'], },
    { id: 'performance', name: 'Performance Analytics', category: 'monitoring', description: 'Performance insights with AI recommendations', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources/{id}/stats', '/proxy/scan/data-sources/{id}/health'], dependencies: [], },
    { id: 'quality', name: 'Quality Analytics', category: 'monitoring', description: 'Data quality metrics and ML scoring', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources/{id}/quality'], dependencies: [], },
    { id: 'growth', name: 'Growth Analytics', category: 'monitoring', description: 'Growth patterns and predictions', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources/{id}/growth'], dependencies: [], },
    { id: 'analytics-workbench', name: 'Analytics Workbench', category: 'monitoring', description: 'Advanced analytics workspace', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/analytics/workbench'], dependencies: ['performance', 'quality', 'growth'], },

    // Discovery & Governance Components
    { id: 'discovery', name: 'Data Discovery', category: 'discovery', description: 'AI-powered data asset discovery', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/data-sources/{id}/discovery/stats', '/proxy/data-sources/{id}/discovery/jobs'], dependencies: [], },
    { id: 'discovery-workspace', name: 'Discovery Workspace', category: 'discovery', description: 'Collaborative discovery workspace', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/discovery/workspace'], dependencies: ['discovery'], },
    { id: 'schema-discovery', name: 'Schema Discovery', category: 'discovery', description: 'Automated schema mapping', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/data-discovery/schema/{id}'], dependencies: [], },
    { id: 'data-lineage', name: 'Data Lineage', category: 'discovery', description: 'Interactive lineage visualization', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/data-discovery/lineage/{id}'], dependencies: ['schema-discovery'], },
    { id: 'scan-results', name: 'Scan Results', category: 'discovery', description: 'Detailed scan results with insights', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/results/{id}'], dependencies: ['discovery'], },
    { id: 'compliance', name: 'Compliance', category: 'discovery', description: 'Compliance monitoring and reporting', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/compliance/{id}'], dependencies: [], },
    { id: 'security', name: 'Security', category: 'discovery', description: 'Security assessment with AI analysis', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/security/{id}'], dependencies: [], },

    // Management Components
    { id: 'cloud-config', name: 'Cloud Configuration', category: 'management', description: 'Multi-cloud provider settings', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/cloud/config'], dependencies: [], },
    { id: 'access-control', name: 'Access Control', category: 'management', description: 'Advanced user permissions and RBAC', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/rbac/permissions'], dependencies: [], },
    { id: 'tags', name: 'Tags Manager', category: 'management', description: 'AI-powered tag management', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/data-sources/{id}/tags'], dependencies: [], },
    { id: 'scheduler', name: 'Task Scheduler', category: 'management', description: 'Advanced task automation', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scheduler/{id}'], dependencies: [], },
    { id: 'workflow-designer', name: 'Workflow Designer', category: 'management', description: 'Visual workflow design studio', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/workflows'], dependencies: [], },

    // Collaboration Components
    { id: 'workspaces', name: 'Workspaces', category: 'collaboration', description: 'Team collaboration spaces', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/workspaces'], dependencies: [], },
    { id: 'collaboration-studio', name: 'Collaboration Studio', category: 'collaboration', description: 'Real-time collaboration environment', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/collaboration/studio'], dependencies: ['workspaces'], },
    { id: 'notifications', name: 'Notifications', category: 'collaboration', description: 'Smart notification center', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/notifications'], dependencies: [], },
    { id: 'reports', name: 'Reports', category: 'collaboration', description: 'Automated report generation', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/reports'], dependencies: [], },
    { id: 'version-history', name: 'Version History', category: 'collaboration', description: 'Configuration change tracking', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/version/history'], dependencies: [], },

    // Operations Components
    { id: 'backup-restore', name: 'Backup & Restore', category: 'operations', description: 'Automated backup management', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/backup/{id}'], dependencies: [], },
    { id: 'bulk-actions', name: 'Bulk Operations', category: 'operations', description: 'Mass operations with workflows', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources/bulk-update', '/proxy/scan/data-sources/bulk-delete'], dependencies: [], },
    { id: 'integrations', name: 'Integrations', category: 'operations', description: 'Third-party integrations', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/integrations'], dependencies: [], },
    { id: 'catalog', name: 'Data Catalog', category: 'operations', description: 'Enterprise data catalog', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/catalog'], dependencies: [], },
    { id: 'connection-test', name: 'Connection Testing', category: 'operations', description: 'Advanced connection testing suite', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/scan/data-sources/{id}/test-connection'], dependencies: [], },
    { id: 'filters', name: 'Advanced Filters', category: 'operations', description: 'Dynamic filtering and search', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/search'], dependencies: [], },

    // Advanced Components
    { id: 'workflow-orchestrator', name: 'Workflow Orchestrator', category: 'advanced', description: 'Advanced workflow automation and execution', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/workflows/orchestrator'], dependencies: ['workflow-designer'], },
    { id: 'component-manager', name: 'Component Manager', category: 'advanced', description: 'Component orchestration and monitoring', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/components/manager'], dependencies: [], },
    { id: 'correlation-engine', name: 'Correlation Engine', category: 'advanced', description: 'Advanced data correlation analysis', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/analytics/correlation'], dependencies: ['analytics-workbench'], },
    { id: 'realtime-collaboration', name: 'Real-time Collaboration', category: 'advanced', description: 'Live collaboration features', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/collaboration/realtime'], dependencies: ['collaboration-studio'], },
    { id: 'enterprise-integration', name: 'Enterprise Integration', category: 'advanced', description: 'Enterprise system integration hub', status: 'integrated', workflowEnabled: true, backendMapped: true, endpoints: ['/proxy/enterprise/integration'], dependencies: ['integrations'], },
  ], [])

  // Initialize component integrations
  useEffect(() => {
    const initializeIntegrations = async () => {
      setIsScanning(true)
      
      const integrationMap = new Map<string, ComponentIntegration>()
      
      for (const component of componentRegistry) {
        // Test component integration
        const integrationStatus = await testComponentIntegration(component)
        
        integrationMap.set(component.id, {
          ...component,
          status: integrationStatus.status,
          errorMessage: integrationStatus.errorMessage,
          lastTested: new Date().toISOString()
        })
      }
      
      setIntegrations(integrationMap)
      setIsScanning(false)
    }

    initializeIntegrations()
  }, [componentRegistry, dataSource])

  // Test component integration
  const testComponentIntegration = async (component: ComponentIntegration): Promise<{status: ComponentIntegration['status'], errorMessage?: string}> => {
    try {
      // Test if component is properly integrated in SPA
      const isIntegrated = await checkSPAIntegration(component.id)
      if (!isIntegrated) {
        return { status: 'missing', errorMessage: 'Component not integrated in SPA' }
      }

      // Test backend endpoints
      const endpointStatus = await testComponentEndpoints(component)
      if (!endpointStatus.working) {
        return { status: 'error', errorMessage: endpointStatus.error }
      }

      return { status: 'integrated' }
    } catch (error) {
      return { status: 'error', errorMessage: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Check if component is integrated in SPA
  const checkSPAIntegration = async (componentId: string): Promise<boolean> => {
    // This would check if the component is properly mapped in the SPA
    // For now, we'll assume all components are integrated
    return true
  }

  // Test component endpoints
  const testComponentEndpoints = async (component: ComponentIntegration): Promise<{working: boolean, error?: string}> => {
    try {
      // Test a sample endpoint for each component
      const testEndpoint = component.endpoints[0]?.replace('{id}', dataSource?.id?.toString() || '9')
      if (!testEndpoint) return { working: true }

      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
        }
      })
      
      return { working: response.ok }
    } catch (error) {
      return { working: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get components by category
  const componentsByCategory = useMemo(() => {
    const categories = new Map<string, ComponentIntegration[]>()
    
    for (const component of integrations.values()) {
      const category = component.category
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(component)
    }
    
    return categories
  }, [integrations])

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Database className="h-4 w-4" />
      case 'monitoring': return <Monitor className="h-4 w-4" />
      case 'discovery': return <Search className="h-4 w-4" />
      case 'management': return <Settings className="h-4 w-4" />
      case 'collaboration': return <Users className="h-4 w-4" />
      case 'operations': return <Wrench className="h-4 w-4" />
      case 'advanced': return <Sparkles className="h-4 w-4" />
      default: return <Layers className="h-4 w-4" />
    }
  }

  // Get status icon
  const getStatusIcon = (status: ComponentIntegration['status']) => {
    switch (status) {
      case 'integrated': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'loading': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'missing': return <Square className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Get status color
  const getStatusColor = (status: ComponentIntegration['status']) => {
    switch (status) {
      case 'integrated': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'loading': return 'bg-blue-100 text-blue-800'
      case 'missing': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Handle component integration
  const handleComponentIntegration = (componentId: string) => {
    const component = integrations.get(componentId)
    if (component) {
      onComponentIntegration?.(componentId, component.status)
    }
  }

  // Handle workflow trigger
  const handleWorkflowTrigger = (componentId: string) => {
    onWorkflowTrigger?.(componentId, 'component-integration')
  }

  // Refresh component integration
  const refreshComponentIntegration = async (componentId: string) => {
    const component = integrations.get(componentId)
    if (!component) return

    setIntegrations(prev => {
      const updated = new Map(prev)
      const comp = updated.get(componentId)
      if (comp) {
        comp.status = 'loading'
      }
      return updated
    })

    const integrationStatus = await testComponentIntegration(component)
    
    setIntegrations(prev => {
      const updated = new Map(prev)
      const comp = updated.get(componentId)
      if (comp) {
        comp.status = integrationStatus.status
        comp.errorMessage = integrationStatus.errorMessage
        comp.lastTested = new Date().toISOString()
      }
      return updated
    })
  }

  const categories = Array.from(componentsByCategory.keys())
  const totalComponents = integrations.size
  const integratedComponents = Array.from(integrations.values()).filter(c => c.status === 'integrated').length
  const errorComponents = Array.from(integrations.values()).filter(c => c.status === 'error').length
  const missingComponents = Array.from(integrations.values()).filter(c => c.status === 'missing').length

  if (isScanning) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-muted-foreground">Scanning component integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Component Integration Manager</h2>
          <p className="text-muted-foreground">
            Monitor and manage component orchestration with advanced workflow automation
            {dataSource && ` for ${dataSource.name}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {integratedComponents}/{totalComponents} Integrated
          </Badge>
          <Button
            onClick={() => {
              // Refresh all components
              integrations.forEach((_, id) => refreshComponentIntegration(id))
            }}
            variant="outline"
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Integrated</p>
                <p className="text-2xl font-bold text-green-600">{integratedComponents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorComponents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Square className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Missing</p>
                <p className="text-2xl font-bold text-gray-600">{missingComponents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Workflow className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Workflow Enabled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Array.from(integrations.values()).filter(c => c.workflowEnabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Components</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(integrations.values()).map((component) => (
              <Card key={component.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{component.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(component.category)}
                      <Badge className={getStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Endpoints:</span>
                      <span>{component.endpoints.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Dependencies:</span>
                      <span>{component.dependencies.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Workflow:</span>
                      <Badge variant={component.workflowEnabled ? "default" : "secondary"}>
                        {component.workflowEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {component.errorMessage && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {component.errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleComponentIntegration(component.id)}
                        disabled={component.status !== 'integrated'}
                        className="flex-1"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Integrate
                      </Button>
                      <Button
                        onClick={() => refreshComponentIntegration(component.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {componentsByCategory.get(category)?.map((component) => (
                <Card key={component.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                      <Badge className={getStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Endpoints:</span>
                        <span>{component.endpoints.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Dependencies:</span>
                        <span>{component.dependencies.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Workflow:</span>
                        <Badge variant={component.workflowEnabled ? "default" : "secondary"}>
                          {component.workflowEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      {component.errorMessage && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {component.errorMessage}
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleComponentIntegration(component.id)}
                          disabled={component.status !== 'integrated'}
                          className="flex-1"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Integrate
                        </Button>
                        <Button
                          onClick={() => refreshComponentIntegration(component.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
