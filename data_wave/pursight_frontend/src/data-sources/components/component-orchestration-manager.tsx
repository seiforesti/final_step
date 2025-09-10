"use client"

import { useState, useEffect, useMemo } from "react"
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
  Square,
  Database,
  Monitor,
  Search,
  Users,
  Wrench,
  Sparkles,
} from "lucide-react"

import type { DataSource } from "../types"

interface ComponentInfo {
  id: string
  name: string
  category: string
  description: string
  status: "active" | "inactive" | "error" | "loading"
  dependencies: string[]
  endpoints: string[]
  lastUsed?: string
  usageCount: number
  errorMessage?: string
}

interface ComponentOrchestrationManagerProps {
  dataSource?: DataSource
  onComponentSelect?: (componentId: string) => void
  onComponentError?: (componentId: string, error: string) => void
  className?: string
}

export function ComponentOrchestrationManager({
  dataSource,
  onComponentSelect,
  onComponentError,
  className = "",
}: ComponentOrchestrationManagerProps) {
  const [components, setComponents] = useState<Map<string, ComponentInfo>>(new Map())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isInitializing, setIsInitializing] = useState(true)

  // Component registry with all available components
  const componentRegistry: ComponentInfo[] = useMemo(
    () => [
      // Core Management Components
      {
        id: "enterprise-dashboard",
        name: "Enterprise Dashboard",
        category: "core",
        description: "Unified enterprise dashboard with AI insights",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources", "/proxy/rbac/me"],
        usageCount: 0,
      },
      {
        id: "overview",
        name: "Data Source Overview",
        category: "core",
        description: "Comprehensive data sources overview",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources/{id}/stats", "/proxy/scan/data-sources/{id}/health"],
        usageCount: 0,
      },
      {
        id: "grid",
        name: "Grid View",
        category: "core",
        description: "Visual grid layout with real-time updates",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources"],
        usageCount: 0,
      },
      {
        id: "list",
        name: "List View",
        category: "core",
        description: "Advanced list view with filtering",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources"],
        usageCount: 0,
      },
      {
        id: "details",
        name: "Data Source Details",
        category: "core",
        description: "In-depth analysis with AI insights",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources/{id}"],
        usageCount: 0,
      },

      // Monitoring & Analytics Components
      {
        id: "monitoring",
        name: "Real-time Monitoring",
        category: "monitoring",
        description: "Live health and performance metrics",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources/{id}/health"],
        usageCount: 0,
      },
      {
        id: "performance",
        name: "Performance Analytics",
        category: "monitoring",
        description: "Performance insights with AI recommendations",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources/{id}/stats", "/proxy/scan/data-sources/{id}/health"],
        usageCount: 0,
      },
      {
        id: "quality",
        name: "Quality Analytics",
        category: "monitoring",
        description: "Data quality metrics and ML scoring",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources/{id}/quality"],
        usageCount: 0,
      },
      {
        id: "growth",
        name: "Growth Analytics",
        category: "monitoring",
        description: "Growth patterns and predictions",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources/{id}/growth"],
        usageCount: 0,
      },

      // Discovery & Governance Components
      {
        id: "discovery",
        name: "Data Discovery",
        category: "discovery",
        description: "AI-powered data asset discovery",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/data-sources/{id}/discovery/stats", "/proxy/data-sources/{id}/discovery/jobs"],
        usageCount: 0,
      },
      {
        id: "schema-discovery",
        name: "Schema Discovery",
        category: "discovery",
        description: "Automated schema mapping",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/data-discovery/schema/{id}"],
        usageCount: 0,
      },
      {
        id: "data-lineage",
        name: "Data Lineage",
        category: "discovery",
        description: "Interactive lineage visualization",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/data-discovery/lineage/{id}"],
        usageCount: 0,
      },
      {
        id: "compliance",
        name: "Compliance",
        category: "discovery",
        description: "Compliance monitoring and reporting",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/compliance/{id}"],
        usageCount: 0,
      },
      {
        id: "security",
        name: "Security",
        category: "discovery",
        description: "Security assessment with AI analysis",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/security/{id}"],
        usageCount: 0,
      },

      // Management Components
      {
        id: "access-control",
        name: "Access Control",
        category: "management",
        description: "Advanced user permissions and RBAC",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/rbac/permissions"],
        usageCount: 0,
      },
      {
        id: "tags",
        name: "Tags Manager",
        category: "management",
        description: "AI-powered tag management",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/data-sources/{id}/tags"],
        usageCount: 0,
      },
      {
        id: "scheduler",
        name: "Task Scheduler",
        category: "management",
        description: "Advanced task automation",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scheduler/{id}"],
        usageCount: 0,
      },

      // Collaboration Components
      {
        id: "workspaces",
        name: "Workspaces",
        category: "collaboration",
        description: "Team collaboration spaces",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/workspaces"],
        usageCount: 0,
      },
      {
        id: "notifications",
        name: "Notifications",
        category: "collaboration",
        description: "Smart notification center",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/notifications"],
        usageCount: 0,
      },
      {
        id: "reports",
        name: "Reports",
        category: "collaboration",
        description: "Automated report generation",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/reports"],
        usageCount: 0,
      },

      // Operations Components
      {
        id: "backup-restore",
        name: "Backup & Restore",
        category: "operations",
        description: "Automated backup management",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/backup/{id}"],
        usageCount: 0,
      },
      {
        id: "integrations",
        name: "Integrations",
        category: "operations",
        description: "Third-party integrations",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/integrations"],
        usageCount: 0,
      },
      {
        id: "catalog",
        name: "Data Catalog",
        category: "operations",
        description: "Enterprise data catalog",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/catalog"],
        usageCount: 0,
      },

      // Advanced Components
      {
        id: "workflow-designer",
        name: "Workflow Designer",
        category: "advanced",
        description: "Visual workflow design studio",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/workflows"],
        usageCount: 0,
      },
      {
        id: "connection-test",
        name: "Connection Testing",
        category: "advanced",
        description: "Advanced connection testing suite",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/scan/data-sources/{id}/test-connection"],
        usageCount: 0,
      },
      {
        id: "filters",
        name: "Advanced Filters",
        category: "advanced",
        description: "Dynamic filtering and search",
        status: "active",
        dependencies: [],
        endpoints: ["/proxy/search"],
        usageCount: 0,
      },
    ],
    [],
  )

  // Initialize components
  useEffect(() => {
    const initializeComponents = async () => {
      setIsInitializing(true)

      // Simulate component health checks
      const componentMap = new Map<string, ComponentInfo>()

      for (const component of componentRegistry) {
        // Simulate endpoint testing
        const isHealthy = await testComponentEndpoints(component)

        componentMap.set(component.id, {
          ...component,
          status: isHealthy ? "active" : "error",
          errorMessage: isHealthy ? undefined : "Endpoint not available",
        })
      }

      setComponents(componentMap)
      setIsInitializing(false)
    }

    initializeComponents()
  }, [componentRegistry])

  // Test component endpoints
  const testComponentEndpoints = async (component: ComponentInfo): Promise<boolean> => {
    try {
      // Test a sample endpoint for each component
      const testEndpoint = component.endpoints[0]?.replace("{id}", dataSource?.id?.toString() || "1")
      if (!testEndpoint) return true

      const response = await fetch(testEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_token") || ""}`,
        },
      })

      return response.ok
    } catch (error) {
      return false
    }
  }

  // Get components by category
  const componentsByCategory = useMemo(() => {
    const categories = new Map<string, ComponentInfo[]>()

    for (const component of components.values()) {
      const category = component.category
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(component)
    }

    return categories
  }, [components])

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "core":
        return <Database className="h-4 w-4" />
      case "monitoring":
        return <Monitor className="h-4 w-4" />
      case "discovery":
        return <Search className="h-4 w-4" />
      case "management":
        return <Settings className="h-4 w-4" />
      case "collaboration":
        return <Users className="h-4 w-4" />
      case "operations":
        return <Wrench className="h-4 w-4" />
      case "advanced":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Layers className="h-4 w-4" />
    }
  }

  // Get status icon
  const getStatusIcon = (status: ComponentInfo["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "loading":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "inactive":
        return <Square className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Get status color
  const getStatusColor = (status: ComponentInfo["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-900/50 text-green-300 border-green-800"
      case "error":
        return "bg-red-900/50 text-red-300 border-red-800"
      case "loading":
        return "bg-blue-900/50 text-blue-300 border-blue-800"
      case "inactive":
        return "bg-zinc-800 text-zinc-400 border-zinc-700"
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700"
    }
  }

  // Handle component selection
  const handleComponentSelect = (componentId: string) => {
    const component = components.get(componentId)
    if (component && component.status === "active") {
      setComponents((prev) => {
        const updated = new Map(prev)
        const comp = updated.get(componentId)
        if (comp) {
          comp.usageCount++
          comp.lastUsed = new Date().toISOString()
        }
        return updated
      })
      onComponentSelect?.(componentId)
    } else {
      onComponentError?.(componentId, component?.errorMessage || "Component not available")
    }
  }

  // Refresh component status
  const refreshComponentStatus = async (componentId: string) => {
    const component = components.get(componentId)
    if (!component) return

    setComponents((prev) => {
      const updated = new Map(prev)
      const comp = updated.get(componentId)
      if (comp) {
        comp.status = "loading"
      }
      return updated
    })

    const isHealthy = await testComponentEndpoints(component)

    setComponents((prev) => {
      const updated = new Map(prev)
      const comp = updated.get(componentId)
      if (comp) {
        comp.status = isHealthy ? "active" : "error"
        comp.errorMessage = isHealthy ? undefined : "Endpoint not available"
      }
      return updated
    })
  }

  const categories = Array.from(componentsByCategory.keys())

  if (isInitializing) {
    return (
      <div className="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-400" />
            <p className="text-zinc-400 text-sm">Initializing component orchestration...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 font-mono">Component Orchestration Manager</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage and monitor all Data Sources SPA components
            {dataSource && ` for ${dataSource.name}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 border-zinc-700">
            {components.size} Components
          </Badge>
          <Button
            onClick={() => {
              // Refresh all components
              components.forEach((_, id) => refreshComponentStatus(id))
            }}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-700"
          >
            <Activity className="h-3 w-3 mr-1" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Component Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["active", "error", "loading", "inactive"] as const).map((status) => {
          const count = Array.from(components.values()).filter((c) => c.status === status).length
          return (
            <Card key={status} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <div>
                    <p className="text-xs font-mono text-zinc-400 capitalize">{status}</p>
                    <p className="text-lg font-bold font-mono text-zinc-200">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Component Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-3">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger
            value="all"
            className="text-xs px-3 py-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-400"
          >
            All Components
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="text-xs px-3 py-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-400 capitalize"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from(components.values()).map((component) => (
              <Card
                key={component.id}
                className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <CardHeader className="pb-2 p-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono text-zinc-100">{component.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(component.category)}
                      <Badge className={`text-xs px-1 py-0 ${getStatusColor(component.status)}`}>
                        {component.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{component.description}</p>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Endpoints:</span>
                      <span className="font-mono">{component.endpoints.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Usage Count:</span>
                      <span className="font-mono">{component.usageCount}</span>
                    </div>
                    {component.errorMessage && (
                      <Alert className="bg-red-900/20 border-red-800 text-red-300">
                        <AlertTriangle className="h-3 w-3" />
                        <AlertDescription className="text-xs">{component.errorMessage}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex space-x-2 pt-1">
                      <Button
                        onClick={() => handleComponentSelect(component.id)}
                        disabled={component.status !== "active"}
                        size="sm"
                        className="flex-1 h-7 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Use Component
                      </Button>
                      <Button
                        onClick={() => refreshComponentStatus(component.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-700"
                      >
                        <Activity className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {componentsByCategory.get(category)?.map((component) => (
                <Card
                  key={component.id}
                  className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <CardHeader className="pb-2 p-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono text-zinc-100">{component.name}</CardTitle>
                      <Badge className={`text-xs px-1 py-0 ${getStatusColor(component.status)}`}>
                        {component.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{component.description}</p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Endpoints:</span>
                        <span className="font-mono">{component.endpoints.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Usage Count:</span>
                        <span className="font-mono">{component.usageCount}</span>
                      </div>
                      {component.errorMessage && (
                        <Alert className="bg-red-900/20 border-red-800 text-red-300">
                          <AlertTriangle className="h-3 w-3" />
                          <AlertDescription className="text-xs">{component.errorMessage}</AlertDescription>
                        </Alert>
                      )}
                      <div className="flex space-x-2 pt-1">
                        <Button
                          onClick={() => handleComponentSelect(component.id)}
                          disabled={component.status !== "active"}
                          size="sm"
                          className="flex-1 h-7 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Use Component
                        </Button>
                        <Button
                          onClick={() => refreshComponentStatus(component.id)}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-700"
                        >
                          <Activity className="h-3 w-3" />
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
