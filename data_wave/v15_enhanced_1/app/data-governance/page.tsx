"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Database,
  Map,
  BarChart3,
  Shield,
  Folder,
  Settings,
  Scan,
  FileText,
  Bell,
  MessageCircle,
  Plus,
  Search,
  Activity,
  GitBranch,
  Layers,
  Server,
  Workflow,
  Tag,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  CheckCircle,
  Play,
  Home,
  ExternalLink,
  UserCheck,
  Sparkles,
  Crown,
  MoreHorizontal,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import EntityDetails from "@/components/data-catalog/entity-details"
import EntityLineageView from "@/components/data-catalog/entity-lineage-view"
import EntityManagementContent from "@/components/data-catalog/entity-management-content"
import { EnhancedDataSourcesApp } from "@/components/data-sources/enhanced-data-sources-app" 
import { ScanSystemApp } from "@/components/scan-system/ScanSystemSPA"
import { ScanRuleSetsSPA } from "@/components/Advanced-Scan-Rule-Sets/spa/ScanRuleSetsSPA"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import ComplianceRuleAppWithProvider from "@/components/Compliance-Rule/enhanced-compliance-rule-app"

// Enhanced Types
interface SidebarItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  children?: SidebarItem[]
  badge?: number
  description?: string
  status?: "active" | "inactive" | "warning" | "error"
  premium?: boolean
}

interface SecondSidebarItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  section?: string
  status?: "active" | "inactive" | "warning" | "error"
  description?: string
  metrics?: {
    count?: number
    percentage?: number
    trend?: "up" | "down" | "stable"
  }
}

interface LoadingState {
  isLoading: boolean
  progress?: number
  message?: string
}

// Enhanced main sidebar configuration
const mainSidebarItems: SidebarItem[] = [
  {
    id: "overview",
    name: "Overview",
    icon: Home,
    description: "Dashboard and key metrics",
    path: "/data-governance",
    status: "active",
  },
  {
    id: "data-catalog",
    name: "Data Catalog",
    icon: Database,
    description: "Discover and manage your data assets",
    status: "active",
    badge: 156,
  },
  {
    id: "data-map",
    name: "Data Map",
    icon: Map,
    description: "Visualize data lineage and relationships",
    badge: 24,
    status: "active",
  },
  {
    id: "data-insights",
    name: "Data Insights",
    icon: BarChart3,
    description: "Analytics and reporting dashboard",
    path: "/data-governance/insights",
    status: "active",
    badge: 8,
    premium: true,
  },
  {
    id: "data-policy",
    name: "Data Policy",
    icon: Shield,
    description: "Governance policies and compliance",
    badge: 3,
    path: "/data-governance/policy",
    status: "warning",
  },
  {
    id: "automation",
    name: "Automation",
    icon: Zap,
    description: "Automated workflows and jobs",
    path: "/data-governance/automation",
    status: "active",
    badge: 12,
    premium: true,
  },
]

// Data for Data Catalog second sidebar
const dataCatalogSidebarItems: SecondSidebarItem[] = [
  {
    id: "catalog-browser",
    name: "Catalog Browser",
    icon: Folder,
    path: "/data-governance/catalog-browser",
    section: "catalog",
    description: "Browse data catalogs",
  },
  {
    id: "entity-management",
    name: "Entity Management",
    icon: Database,
    path: "/data-governance/entity-management",
    section: "catalog",
    description: "Manage data entities",
  },
  {
    id: "schema-registry",
    name: "Schema Registry",
    icon: FileText,
    path: "/data-governance/schema-registry",
    section: "catalog",
    description: "Manage data schemas",
  },
  {
    id: "metadata-management",
    name: "Metadata Management",
    icon: Tag,
    path: "/data-governance/metadata",
    section: "catalog",
    description: "Data metadata and tags",
    premium: true,
  },
]

// Data for Data Map second sidebar
const dataMapSidebarItems: SecondSidebarItem[] = [
  {
    id: "data-sources",
    name: "Data Sources",
    icon: Server,
    path: "/data-governance/data-sources",
    section: "resources",
    status: "active",
    description: "24 active connections",
    metrics: { count: 24, trend: "up" },
  },
  {
    id: "data-lineage",
    name: "Data Lineage",
    icon: GitBranch,
    path: "/data-governance/lineage",
    section: "resources",
    status: "active",
    description: "Track data flow",
    premium: true,
  },
  {
    id: "collections",
    name: "Collections",
    icon: Layers,
    path: "/data-governance/collections",
    section: "resources",
    status: "active",
    description: "12 collections",
    metrics: { count: 12, trend: "stable" },
  },
  {
    id: "monitoring",
    name: "Monitoring",
    icon: Activity,
    path: "/data-governance/monitoring",
    section: "resources",
    status: "warning",
    description: "3 alerts pending",
    metrics: { count: 3, trend: "up" },
  },
  {
    id: "quality-checks",
    name: "Quality Checks",
    icon: CheckCircle,
    path: "/data-governance/quality",
    section: "resources",
    status: "active",
    description: "98% passing",
    metrics: { percentage: 98, trend: "up" },
  },
  {
    id: "entity-management",
    name: "Entity Management",
    icon: Database,
    path: "/data-governance/entity-management",
    section: "resources",
    status: "active",
    description: "156 entities managed",
    metrics: { count: 156, trend: "up" },
  },
  {
    id: "scan",
    name: "Scan",
    icon: Scan,
    path: "/data-governance/scan",
    section: "automation",
    status: "active",
    description: "Data discovery and profiling",
    metrics: { count: 12, trend: "up" },
  },
  {
    id: "scan-rules",
    name: "Scan Rules",
    icon: Settings,
    path: "/data-governance/scan-rules",
    section: "automation",
    status: "active",
    description: "8 active rules",
    metrics: { count: 8, trend: "stable" },
  },
  {
    id: "workflows",
    name: "Workflows",
    icon: Workflow,
    path: "/data-governance/workflows",
    section: "automation",
    status: "active",
    description: "5 running workflows",
    metrics: { count: 5, trend: "up" },
  },
  {
    id: "schedules",
    name: "Schedules",
    icon: Calendar,
    path: "/data-governance/schedules",
    section: "automation",
    status: "active",
    description: "15 scheduled jobs",
    metrics: { count: 15, trend: "stable" },
  },
  {
    id: "classifications",
    name: "Classifications",
    icon: Tag,
    path: "/data-governance/classifications",
    section: "governance",
    status: "active",
    description: "15 classification types",
    metrics: { count: 15, trend: "stable" },
  },
  {
    id: "compliance",
    name: "Compliance",
    icon: Shield,
    path: "/data-governance/compliance",
    section: "governance",
    status: "active",
    description: "Compliance rules and monitoring",
    metrics: { count: 12, trend: "up" },
  },
  {
    id: "access-control",
    name: "Access Control",
    icon: UserCheck,
    path: "/data-governance/access-control",
    section: "governance",
    status: "active",
    description: "156 active policies",
    metrics: { count: 156, trend: "up" },
  },
]

// Section titles with icons
const sectionTitles: Record<string, { title: string; icon: React.ComponentType<{ className?: string }> }> = {
  resources: { title: "Data Resources", icon: Database },
  automation: { title: "Automation & Scanning", icon: Zap },
  governance: { title: "Governance & Compliance", icon: Shield },
  catalog: { title: "Catalog Management", icon: Database },
}

// Enhanced Sidebar Item Component with performance optimizations
const SidebarItemComponent: React.FC<{
  item: SidebarItem | SecondSidebarItem
  isActive: boolean
  onClick: () => void
  hasChildren?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
  level?: number
  showDescription?: boolean
  sidebarExpanded?: boolean
  isHovered?: boolean
}> = React.memo(
  ({
    item,
    isActive,
    onClick,
    hasChildren,
    isExpanded,
    onToggleExpand,
    level = 0,
    showDescription = false,
    sidebarExpanded = true,
    isHovered = false,
  }) => {
    const Icon = item.icon
    const status = item.status
    const metrics = "metrics" in item ? item.metrics : undefined

    const getStatusColor = (status?: string) => {
      switch (status) {
        case "active":
          return "text-green-500"
        case "warning":
          return "text-yellow-500"
        case "error":
          return "text-red-500"
        default:
          return "text-muted-foreground"
      }
    }

    const getTrendIcon = (trend?: string) => {
      switch (trend) {
        case "up":
          return <TrendingUp className="h-3 w-3 text-green-500" />
        case "down":
          return <TrendingDown className="h-3 w-3 text-red-500" />
        default:
          return null
      }
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("group relative", level > 0 && "ml-4")}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 text-left transition-all duration-200 relative overflow-hidden",
                  isActive && "bg-primary/10 text-primary border-l-2 border-primary shadow-sm",
                  !isActive && "hover:bg-muted/50 hover:shadow-sm",
                  !sidebarExpanded && "justify-center p-2",
                )}
                onClick={onClick}
              >
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />}

                <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                  <div className="relative flex-shrink-0">
                    <Icon className={cn("h-4 w-4", isActive ? "text-primary" : getStatusColor(status))} />
                    {status === "warning" && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                    )}
                    {status === "error" && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                    {"premium" in item && item.premium && (
                      <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                    )}
                  </div>

                  {(sidebarExpanded || isHovered) && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.name}</span>
                        {"badge" in item && item.badge && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
                            {item.badge > 99 ? "99+" : item.badge}
                          </Badge>
                        )}
                        {metrics && (
                          <div className="flex items-center gap-1 ml-auto">
                            {metrics.count && <span className="text-xs text-muted-foreground">{metrics.count}</span>}
                            {metrics.percentage && (
                              <span className="text-xs text-muted-foreground">{metrics.percentage}%</span>
                            )}
                            {getTrendIcon(metrics.trend)}
                          </div>
                        )}
                      </div>
                      {showDescription && item.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{item.description}</p>
                      )}
                    </div>
                  )}

                  {hasChildren && (sidebarExpanded || isHovered) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleExpand?.()
                      }}
                    >
                      <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
                    </Button>
                  )}
                </div>
              </Button>
            </div>
          </TooltipTrigger>
          {!sidebarExpanded && !isHovered && (
            <TooltipContent side="right" className="max-w-xs">
              <div>
                <p className="font-medium">{item.name}</p>
                {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  },
)

SidebarItemComponent.displayName = "SidebarItemComponent"

// Main Component with performance optimizations
export default function DataGovernancePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeSidebarItem, setActiveSidebarItem] = useState("overview")
  const [activeSecondSidebarItem, setActiveSecondSidebarItem] = useState<string | null>(null)
  const [secondSidebarContext, setSecondSidebarContext] = useState<"data-map" | "data-catalog" | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    main: true,
    second: true,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false })
  const [mainSidebarHovered, setMainSidebarHovered] = useState(false)
  const [secondSidebarHovered, setSecondSidebarHovered] = useState(false)

  // State for managing entity details/lineage view within Entity Management
  const [selectedEntityDetails, setSelectedEntityDetails] = useState<{
    id: number
    type: string
  } | null>(null)
  const [currentSubSectionView, setCurrentSubSectionView] = useState<"list" | "details" | "lineage" | null>(null)

  // Callbacks for EntityManagementContent with throttling
  const handleViewEntityDetails = useCallback((entityId: number, entityType: string) => {
    setSelectedEntityDetails({ id: entityId, type: entityType })
    setCurrentSubSectionView("details")
  }, [])

  const handleViewEntityLineage = useCallback((entityId: number, entityType: string) => {
    setSelectedEntityDetails({ id: entityId, type: entityType })
    setCurrentSubSectionView("lineage")
  }, [])

  // Loading simulation for content changes
  const simulateLoading = useCallback((message: string, duration = 1000) => {
    setLoadingState({ isLoading: true, progress: 0, message })

    const interval = setInterval(() => {
      setLoadingState((prev) => {
        const newProgress = Math.min((prev.progress || 0) + 10, 90)
        return { ...prev, progress: newProgress }
      })
    }, duration / 10)

    setTimeout(() => {
      clearInterval(interval)
      setLoadingState({ isLoading: true, progress: 100, message: "Complete!" })
      setTimeout(() => {
        setLoadingState({ isLoading: false })
      }, 200)
    }, duration)
  }, [])

  // Update active items based on URL params for initial load and direct URL access
  useEffect(() => {
    const mainParam = searchParams.get("main")
    const subParam = searchParams.get("sub")
    const entityIdParam = searchParams.get("entityId")
    const entityTypeParam = searchParams.get("entityType")
    const viewParam = searchParams.get("view")

    let newActiveMain = "overview"
    let newSecondSidebarContext: "data-map" | "data-catalog" | null = null
    let newActiveSecond: string | null = null
    let newSelectedEntityDetails: { id: number; type: string } | null = null
    let newCurrentSubSectionView: "list" | "details" | "lineage" | null = null

    // Determine active main sidebar item
    if (mainParam && mainSidebarItems.some((item) => item.id === mainParam)) {
      newActiveMain = mainParam
    } else {
      const pathSegments = pathname.split("/").filter(Boolean)
      if (pathSegments[1] === "data-governance") {
        const currentMainItem = mainSidebarItems.find((item) => item.path === pathname)
        if (currentMainItem) {
          newActiveMain = currentMainItem.id
        } else if (pathSegments[2]) {
          if (dataCatalogSidebarItems.some((item) => item.path?.endsWith(pathSegments[2]))) {
            newActiveMain = "data-catalog"
          } else if (dataMapSidebarItems.some((item) => item.path?.endsWith(pathSegments[2]))) {
            newActiveMain = "data-map"
          }
        }
      }
    }

    // Determine second sidebar context and active item
    if (newActiveMain === "data-catalog") {
      newSecondSidebarContext = "data-catalog"
      if (subParam && dataCatalogSidebarItems.some((item) => item.id === subParam)) {
        newActiveSecond = subParam
      } else {
        newActiveSecond = dataCatalogSidebarItems[0]?.id || null
      }
    } else if (newActiveMain === "data-map") {
      newSecondSidebarContext = "data-map"
      if (subParam && dataMapSidebarItems.some((item) => item.id === subParam)) {
        newActiveSecond = subParam
      } else {
        newActiveSecond = dataMapSidebarItems[0]?.id || null
      }
    }

    // Determine entity details and sub-section view
    if (newActiveSecond === "entity-management") {
      if (entityIdParam && entityTypeParam) {
        newSelectedEntityDetails = {
          id: Number.parseInt(entityIdParam),
          type: entityTypeParam,
        }
        if (viewParam === "lineage") {
          newCurrentSubSectionView = "lineage"
        } else {
          newCurrentSubSectionView = "details"
        }
      } else {
        newCurrentSubSectionView = "list"
      }
    }

    // Only update state if values have actually changed to prevent infinite loops
    if (activeSidebarItem !== newActiveMain) {
      setActiveSidebarItem(newActiveMain)
    }
    if (secondSidebarContext !== newSecondSidebarContext) {
      setSecondSidebarContext(newSecondSidebarContext)
    }
    if (activeSecondSidebarItem !== newActiveSecond) {
      setActiveSecondSidebarItem(newActiveSecond)
    }
    if (JSON.stringify(selectedEntityDetails) !== JSON.stringify(newSelectedEntityDetails)) {
      setSelectedEntityDetails(newSelectedEntityDetails)
    }
    if (currentSubSectionView !== newCurrentSubSectionView) {
      setCurrentSubSectionView(newCurrentSubSectionView)
    }
  }, [
    pathname,
    searchParams,
    activeSidebarItem,
    secondSidebarContext,
    activeSecondSidebarItem,
    selectedEntityDetails,
    currentSubSectionView,
  ])

  // Separate effect for URL updates to prevent conflicts
  useEffect(() => {
    const currentUrl = new URL(window.location.href)
    const currentMainParam = currentUrl.searchParams.get("main")
    const currentSubParam = currentUrl.searchParams.get("sub")
    const currentEntityIdParam = currentUrl.searchParams.get("entityId")
    const currentEntityTypeParam = currentUrl.searchParams.get("entityType")
    const currentViewParam = currentUrl.searchParams.get("view")

    const expectedMainParam = activeSidebarItem !== "overview" ? activeSidebarItem : null
    const expectedSubParam = activeSecondSidebarItem
    const expectedEntityIdParam = selectedEntityDetails?.id?.toString() || null
    const expectedEntityTypeParam = selectedEntityDetails?.type || null
    const expectedViewParam = currentSubSectionView

    let shouldUpdateUrl = false
    if (currentMainParam !== expectedMainParam) shouldUpdateUrl = true
    if (currentSubParam !== expectedSubParam) shouldUpdateUrl = true
    if (currentEntityIdParam !== expectedEntityIdParam) shouldUpdateUrl = true
    if (currentEntityTypeParam !== expectedEntityTypeParam) shouldUpdateUrl = true
    if (currentViewParam !== expectedViewParam) shouldUpdateUrl = true

    if (shouldUpdateUrl) {
      const newSearchParams = new URLSearchParams()
      if (expectedMainParam) newSearchParams.set("main", expectedMainParam)
      if (expectedSubParam) newSearchParams.set("sub", expectedSubParam)
      if (expectedEntityIdParam) newSearchParams.set("entityId", expectedEntityIdParam)
      if (expectedEntityTypeParam) newSearchParams.set("entityType", expectedEntityTypeParam)
      if (expectedViewParam) newSearchParams.set("view", expectedViewParam)

      const newPath = `/data-governance${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`
      if (pathname + (window.location.search || "") !== newPath) {
        router.replace(newPath)
      }
    }
  }, [activeSidebarItem, activeSecondSidebarItem, selectedEntityDetails, currentSubSectionView, pathname, router])

  const toggleExpand = useCallback((itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }, [])

  const handleSidebarItemClick = useCallback(
    (item: SidebarItem) => {
      if (activeSidebarItem === item.id) return

      // Simulate loading when changing main sections
      simulateLoading(`Loading ${item.name}...`, 800)

      setActiveSidebarItem(item.id)
      setSelectedEntityDetails(null)
      setCurrentSubSectionView(null)

      let newSecondSidebarContext: "data-map" | "data-catalog" | null = null
      let newActiveSecondSidebarItem: string | null = null

      if (item.id === "data-catalog") {
        newSecondSidebarContext = "data-catalog"
        newActiveSecondSidebarItem = dataCatalogSidebarItems[0]?.id || null
        setExpandedItems((prev) => ({ ...prev, second: true }))
      } else if (item.id === "data-map") {
        newSecondSidebarContext = "data-map"
        newActiveSecondSidebarItem = dataMapSidebarItems[0]?.id || null
        setExpandedItems((prev) => ({ ...prev, second: true }))
      } else {
        newSecondSidebarContext = null
        newActiveSecondSidebarItem = null
      }

      setSecondSidebarContext(newSecondSidebarContext)
      setActiveSecondSidebarItem(newActiveSecondSidebarItem)

      // Auto-collapse sidebars when item is selected
      if (newSecondSidebarContext) {
        setTimeout(() => {
          setExpandedItems((prev) => ({ ...prev, main: false, second: false }))
        }, 100)
      }
    },
    [activeSidebarItem, simulateLoading],
  )

  const handleSecondSidebarItemClick = useCallback(
    (item: SecondSidebarItem) => {
      if (activeSecondSidebarItem === item.id) return

      // Simulate loading when changing sub-sections
      simulateLoading(`Loading ${item.name}...`, 600)

      setActiveSecondSidebarItem(item.id)
      setSelectedEntityDetails(null)
      setCurrentSubSectionView(null)

      if (item.id === "entity-management") {
        setCurrentSubSectionView("list")
      }

      // Auto-collapse sidebars when item is selected
      setTimeout(() => {
        setExpandedItems((prev) => ({ ...prev, main: false, second: false }))
      }, 100)
    },
    [activeSecondSidebarItem, simulateLoading],
  )

  // Enhanced content rendering with loading states
  const renderContent = useCallback(() => {
    if (loadingState.isLoading) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <LoadingSpinner size="lg" message={loadingState.message} progress={loadingState.progress} />
        </div>
      )
    }

    if (activeSidebarItem === "overview") {
      return (
        <div className="space-y-6 h-full w-full">
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Welcome to Data Governance</h1>
                  <p className="text-blue-100 mb-4">Manage, monitor, and govern your data ecosystem with confidence</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>24 Data Sources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>98% Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>12 Active Workflows</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Sparkles className="h-16 w-16 text-white/20" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                icon: Plus,
                label: "Add Data Source",
                color: "bg-green-500",
                action: () => {},
              },
              {
                icon: Scan,
                label: "Run Scan",
                color: "bg-blue-500",
                action: () => {},
              },
              {
                icon: FileText,
                label: "Generate Report",
                color: "bg-purple-500",
                action: () => {},
              },
              {
                icon: Settings,
                label: "Configure Policies",
                color: "bg-orange-500",
                action: () => {},
              },
            ].map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg text-white", action.color)}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Data Sources</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">+2</span> from last week
                </div>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">+1.2%</span> improvement
                </div>
                <Progress value={98} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96%</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">-0.5%</span> needs attention
                </div>
                <Progress value={96} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Play className="h-3 w-3 text-blue-500" />
                  <span className="text-blue-600">5</span> running now
                </div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </div>
      )
    } else if (secondSidebarContext === "data-catalog") {
      switch (activeSecondSidebarItem) {
        case "catalog-browser":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Catalog Browser Content</h3>
                <p className="text-muted-foreground">Content for Catalog Browser is under construction.</p>
              </div>
            </div>
          )
        case "entity-management":
          if (currentSubSectionView === "details" && selectedEntityDetails) {
            return (
              <EntityDetails
                entityId={selectedEntityDetails.id}
                entityType={selectedEntityDetails.type}
                onBackToList={() => {
                  setCurrentSubSectionView("list")
                  setSelectedEntityDetails(null)
                  router.replace(`/data-governance?main=${activeSidebarItem}&sub=entity-management`)
                }}
                onViewLineage={(id, type) => {
                  setSelectedEntityDetails({ id, type })
                  setCurrentSubSectionView("lineage")
                  router.replace(
                    `/data-governance?main=${activeSidebarItem}&sub=entity-management&entityId=${id}&entityType=${type}&view=lineage`,
                  )
                }}
              />
            )
          } else if (currentSubSectionView === "lineage" && selectedEntityDetails) {
            return (
              <EntityLineageView
                entityId={selectedEntityDetails.id}
                entityType={selectedEntityDetails.type}
                onEntityClick={(id, type) => {
                  setSelectedEntityDetails({ id, type })
                  setCurrentSubSectionView("details")
                  router.replace(
                    `/data-governance?main=${activeSidebarItem}&sub=entity-management&entityId=${id}&entityType=${type}&view=details`,
                  )
                }}
              />
            )
          } else {
            return (
              <EntityManagementContent
                onViewDetails={handleViewEntityDetails}
                onViewLineage={handleViewEntityLineage}
              />
            )
          }
        case "schema-registry":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Schema Registry Content</h3>
                <p className="text-muted-foreground">Manage your data schemas here.</p>
              </div>
            </div>
          )
        case "metadata-management":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Metadata Management Content</h3>
                <p className="text-muted-foreground">Manage metadata and tags for your entities.</p>
              </div>
            </div>
          )
        default:
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Data Catalog Section</h3>
                <p className="text-muted-foreground">Select an item from the left to view content.</p>
              </div>
            </div>
          )
      }
    } else if (secondSidebarContext === "data-map") {
      switch (activeSecondSidebarItem) {
        case "data-sources":
          return <DataSourcesApp />
        case "scan":
          return <ScanSystemApp />
        case "scan-rules":
          return (
            <ErrorBoundary>
              <ScanRuleSetsSPA embedded={true} />
            </ErrorBoundary>
          )
        case "data-lineage":
          return (
            <EntityLineageView
              entityId={1}
              entityType="table"
              onEntityClick={(id, type) => {
                console.log(`Navigating to entity details for ${type}/${id}`)
              }}
            />
          )
        case "collections":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Collections Content</h3>
                <p className="text-muted-foreground">Manage your data collections here.</p>
              </div>
            </div>
          )
        case "monitoring":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Monitoring Content</h3>
                <p className="text-muted-foreground">View monitoring dashboards and alerts.</p>
              </div>
            </div>
          )
        case "quality-checks":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Quality Checks Content</h3>
                <p className="text-muted-foreground">Review data quality reports.</p>
              </div>
            </div>
          )
        case "entity-management":
          return (
            <EntityManagementContent onViewDetails={handleViewEntityDetails} onViewLineage={handleViewEntityLineage} />
          )
        case "workflows":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Workflows Content</h3>
                <p className="text-muted-foreground">Manage automated workflows.</p>
              </div>
            </div>
          )
        case "schedules":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Schedules Content</h3>
                <p className="text-muted-foreground">View and manage scheduled jobs.</p>
              </div>
            </div>
          )
        case "classifications":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Classifications Content</h3>
                <p className="text-muted-foreground">Manage data classifications.</p>
              </div>
            </div>
          )
        case "compliance":
          return (
            <ErrorBoundary>
              <ComplianceRuleApp embedded={true} />
            </ErrorBoundary>
          )
        case "access-control":
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Access Control Content</h3>
                <p className="text-muted-foreground">Manage access policies and permissions.</p>
              </div>
            </div>
          )
        default:
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Data Map Section</h3>
                <p className="text-muted-foreground">Select an item from the left to view content.</p>
              </div>
            </div>
          )
      }
    } else {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Data Governance Platform</h3>
            <p className="text-muted-foreground">Select a section from the sidebar to get started.</p>
          </div>
        </div>
      )
    }
  }, [
    loadingState,
    activeSidebarItem,
    secondSidebarContext,
    activeSecondSidebarItem,
    currentSubSectionView,
    selectedEntityDetails,
    handleViewEntityDetails,
    handleViewEntityLineage,
    router,
  ])

  const secondSidebarItems = useMemo(() => {
    return secondSidebarContext === "data-catalog" ? dataCatalogSidebarItems : dataMapSidebarItems
  }, [secondSidebarContext])

  return (
    <div className="flex h-screen bg-background">
      {/* Main Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r bg-muted/30 transition-all duration-300 ease-in-out relative",
          expandedItems.main ? "w-64" : "w-16",
        )}
        onMouseEnter={() => setMainSidebarHovered(true)}
        onMouseLeave={() => setMainSidebarHovered(false)}
      >
        {/* Invisible expand button */}
        <button
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-background border rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
          onClick={() => toggleExpand("main")}
          aria-label="Toggle main sidebar"
        >
          {expandedItems.main ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        {/* Header */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Database className="h-4 w-4" />
            </div>
            {(expandedItems.main || mainSidebarHovered) && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Data Governance</span>
                <span className="text-xs text-muted-foreground">Platform</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {mainSidebarItems.map((item) => (
              <SidebarItemComponent
                key={item.id}
                item={item}
                isActive={activeSidebarItem === item.id}
                onClick={() => handleSidebarItemClick(item)}
                showDescription={expandedItems.main || mainSidebarHovered}
                sidebarExpanded={expandedItems.main}
                isHovered={mainSidebarHovered}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {(expandedItems.main || mainSidebarHovered) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">Data Admin</p>
              </div>
            )}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              {(expandedItems.main || mainSidebarHovered) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Sidebar */}
      {secondSidebarContext && (
        <div
          className={cn(
            "flex flex-col border-r bg-background transition-all duration-300 ease-in-out relative",
            expandedItems.second ? "w-72" : "w-16",
          )}
          onMouseEnter={() => setSecondSidebarHovered(true)}
          onMouseLeave={() => setSecondSidebarHovered(false)}
        >
          {/* Invisible expand button */}
          <button
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-background border rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
            onClick={() => toggleExpand("second")}
            aria-label="Toggle second sidebar"
          >
            {expandedItems.second ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>

          {/* Header */}
          <div className="flex h-16 items-center border-b px-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {(expandedItems.second || secondSidebarHovered) && (
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {secondSidebarContext === "data-catalog" ? "Data Catalog" : "Data Map"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {secondSidebarContext === "data-catalog" ? "Manage data assets" : "Visualize data relationships"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          {(expandedItems.second || secondSidebarHovered) && (
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-4">
              {(expandedItems.second || secondSidebarHovered) &&
                Object.entries(
                  secondSidebarItems.reduce(
                    (acc, item) => {
                      const section = item.section || "default"
                      if (!acc[section]) acc[section] = []
                      acc[section].push(item)
                      return acc
                    },
                    {} as Record<string, SecondSidebarItem[]>,
                  ),
                ).map(([sectionKey, items]) => {
                  const sectionConfig = sectionTitles[sectionKey]
                  return (
                    <div key={sectionKey}>
                      {sectionConfig && (
                        <div className="flex items-center gap-2 px-2 py-1 mb-2">
                          <sectionConfig.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {sectionConfig.title}
                          </span>
                        </div>
                      )}
                      <div className="space-y-1">
                        {items.map((item) => (
                          <SidebarItemComponent
                            key={item.id}
                            item={item}
                            isActive={activeSecondSidebarItem === item.id}
                            onClick={() => handleSecondSidebarItemClick(item)}
                            showDescription={expandedItems.second || secondSidebarHovered}
                            sidebarExpanded={expandedItems.second}
                            isHovered={secondSidebarHovered}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}

              {!expandedItems.second &&
                !secondSidebarHovered &&
                secondSidebarItems.map((item) => (
                  <SidebarItemComponent
                    key={item.id}
                    item={item}
                    isActive={activeSecondSidebarItem === item.id}
                    onClick={() => handleSecondSidebarItemClick(item)}
                    showDescription={false}
                    sidebarExpanded={false}
                    isHovered={secondSidebarHovered}
                  />
                ))}
            </div>
          </ScrollArea>

          {/* Settings */}
          {(expandedItems.second || secondSidebarHovered) && (
            <div className="border-t p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh" className="text-sm">
                    Auto Refresh
                  </Label>
                  <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Time Range</Label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Data Governance</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {activeSidebarItem === "overview"
                  ? "Overview"
                  : secondSidebarContext === "data-catalog"
                    ? "Data Catalog"
                    : secondSidebarContext === "data-map"
                      ? "Data Map"
                      : "Dashboard"}
              </span>
              {activeSecondSidebarItem && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {secondSidebarItems.find((item) => item.id === activeSecondSidebarItem)?.name}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Support</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <ErrorBoundary>{renderContent()}</ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
