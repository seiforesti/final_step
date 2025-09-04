"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Search,
  Filter,
  Zap,
  Star,
  Clock,
  Activity,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Bot,
  BarChart3,
  Target,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Settings,
  ExternalLink,
  GitBranch,
  Workflow,
  Brain,
  MessageSquare,
} from "lucide-react"

import { cn } from "../../utils/cn"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

// Import hooks and APIs
import { useActivityTracker } from '../../hooks/useActivityTracker'
import { quickActionsAPI } from '../../services/quick-actions-apis'

// Import types
import type { ViewMode } from "../../types/racine-core.types"
import type { User, RacineWorkspace } from "../../types/racine-core.types"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'create' | 'monitor' | 'analyze' | 'manage' | 'workflow'
  action: () => void
  isLoading?: boolean
  badge?: string
  disabled?: boolean
  url?: string
  group: ViewMode
}

interface GlobalQuickActionsSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  currentWorkspace?: RacineWorkspace
  currentUser?: User
}

export const GlobalQuickActionsSidebar: React.FC<GlobalQuickActionsSidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  currentWorkspace,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [recentActions, setRecentActions] = useState<string[]>([])
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())

  // Quick actions configuration
  const quickActions: QuickAction[] = useMemo(() => [
    // Core Features
    {
      id: "new-workflow",
      title: "Create Workflow",
      description: "Build a new data governance workflow",
      icon: Workflow,
      category: "create",
      group: "workflows" as ViewMode,
      action: () => onViewChange("workflows" as ViewMode)
    },
    {
      id: "new-pipeline",
      title: "Create Pipeline", 
      description: "Set up a new data processing pipeline",
      icon: GitBranch,
      category: "create",
      group: "pipelines" as ViewMode,
      action: () => onViewChange("pipelines" as ViewMode)
    },
    {
      id: "view-activity",
      title: "Activity Monitor",
      description: "View real-time system activity",
      icon: Activity,
      category: "monitor",
      group: "activity" as ViewMode,
      action: () => onViewChange("activity" as ViewMode)
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      description: "Get intelligent assistance",
      icon: Brain,
      category: "workflow",
      group: "ai-assistant" as ViewMode,
      action: () => onViewChange("ai-assistant" as ViewMode),
      badge: "New"
    },

    // Data Sources
    {
      id: "new-data-source",
      title: "Connect Data Source",
      description: "Add a new data connection",
      icon: Database,
      category: "create",
      group: "data-sources" as ViewMode,
      action: () => onViewChange("data-sources" as ViewMode)
    },
    {
      id: "test-connections",
      title: "Test Connections",
      description: "Verify data source connectivity",
      icon: CheckCircle,
      category: "monitor",
      group: "data-sources" as ViewMode,
      action: () => onViewChange("data-sources" as ViewMode)
    },

    // Scan Rule Sets
    {
      id: "new-scan-rule",
      title: "Create Scan Rule",
      description: "Define new scanning rules",
      icon: Scan,
      category: "create",
      group: "scan-rule-sets" as ViewMode,
      action: () => onViewChange("scan-rule-sets" as ViewMode)
    },
    {
      id: "run-scan",
      title: "Run Scan",
      description: "Execute data scanning",
      icon: Play,
      category: "workflow",
      group: "scan-rule-sets" as ViewMode,
      action: () => onViewChange("scan-rule-sets" as ViewMode)
    },

    // Classifications
    {
      id: "new-classification",
      title: "Create Classification",
      description: "Define new data classification",
      icon: FileText,
      category: "create",
      group: "classifications" as ViewMode,
      action: () => onViewChange("classifications" as ViewMode)
    },
    {
      id: "classify-data",
      title: "Auto-Classify",
      description: "Run automated classification",
      icon: Bot,
      category: "workflow",
      group: "classifications" as ViewMode,
      action: () => onViewChange("classifications" as ViewMode)
    },

    // Compliance
    {
      id: "new-compliance-rule",
      title: "Compliance Rule",
      description: "Create compliance rule",
      icon: Shield,
      category: "create", 
      group: "compliance-rule" as ViewMode,
      action: () => onViewChange("compliance-rule" as ViewMode)
    },
    {
      id: "compliance-check",
      title: "Compliance Check",
      description: "Run compliance validation",
      icon: CheckCircle,
      category: "monitor",
      group: "compliance-rule" as ViewMode,
      action: () => onViewChange("compliance-rule" as ViewMode)
    },

    // Data Catalog
    {
      id: "catalog-search",
      title: "Search Catalog",
      description: "Find data assets",
      icon: Search,
      category: "analyze",
      group: "advanced-catalog" as ViewMode,
      action: () => onViewChange("advanced-catalog" as ViewMode)
    },
    {
      id: "data-lineage",
      title: "Data Lineage",
      description: "View data lineage",
      icon: GitBranch,
      category: "analyze",
      group: "advanced-catalog" as ViewMode,
      action: () => onViewChange("advanced-catalog" as ViewMode)
    },

    // Collaboration
    {
      id: "team-chat",
      title: "Team Chat",
      description: "Collaborate with team",
      icon: MessageSquare,
      category: "workflow",
      group: "collaboration" as ViewMode,
      action: () => onViewChange("collaboration" as ViewMode),
      badge: "New"
    },

    // RBAC
    {
      id: "manage-users",
      title: "Manage Users",
      description: "User management",
      icon: Users,
      category: "manage",
      group: "rbac-system" as ViewMode,
      action: () => onViewChange("rbac-system" as ViewMode)
    },

  ], [onViewChange])

  // Filter actions based on search and category
  const filteredActions = useMemo(() => {
    let filtered = quickActions

    if (activeCategory !== "all") {
      filtered = filtered.filter(action => action.category === activeCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(action =>
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [quickActions, activeCategory, searchQuery])

  // Group actions by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, QuickAction[]> = {}
    
    filteredActions.forEach(action => {
      if (!groups[action.category]) {
        groups[action.category] = []
      }
      groups[action.category].push(action)
    })
    
    return groups
  }, [filteredActions])

  // Category labels
  const categoryLabels = {
    create: "Create New",
    monitor: "Monitor & Check", 
    analyze: "Analyze & Explore",
    manage: "Manage & Configure",
    workflow: "Workflows & Automation"
  }

  // Handle action execution
  const handleActionClick = useCallback(async (action: QuickAction) => {
    try {
      setLoadingActions(prev => new Set([...prev, action.id]))
      
      // Add to recent actions
      setRecentActions(prev => {
        const updated = [action.id, ...prev.filter(id => id !== action.id)]
        return updated.slice(0, 5) // Keep last 5
      })

      // Execute action
      await action.action()
      
      // Close sidebar after action
      setTimeout(() => {
        onClose()
      }, 300)
      
    } catch (error) {
      console.error('Quick action error:', error)
    } finally {
      setLoadingActions(prev => {
        const updated = new Set(prev)
        updated.delete(action.id)
        return updated
      })
    }
  }, [onClose])

  // Get recent actions
  const getRecentActions = useMemo(() => {
    return recentActions
      .map(id => quickActions.find(action => action.id === id))
      .filter(Boolean) as QuickAction[]
  }, [recentActions, quickActions])

  // Render action card
  const renderActionCard = useCallback((action: QuickAction) => {
    const isLoading = loadingActions.has(action.id)
    const Icon = action.icon

    return (
      <Card
        key={action.id}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md border",
          action.disabled && "opacity-50 cursor-not-allowed",
          currentView === action.group && "ring-2 ring-primary/20 border-primary/40"
        )}
        onClick={() => !action.disabled && !isLoading && handleActionClick(action)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0",
              currentView === action.group 
                ? "bg-primary text-primary-foreground" 
                : "bg-accent text-accent-foreground"
            )}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{action.title}</h4>
                {action.badge && (
                  <Badge variant="secondary" className="h-4 px-1 text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {action.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }, [loadingActions, currentView, handleActionClick])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Quick Actions</h2>
                    <p className="text-xs text-muted-foreground">Accelerate your workflow</p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-1 overflow-x-auto pb-2">
                <Button
                  variant={activeCategory === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                  className="whitespace-nowrap"
                >
                  All
                </Button>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={activeCategory === key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveCategory(key)}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Recent Actions */}
                {getRecentActions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-sm">Recent</h3>
                    </div>
                    <div className="space-y-2">
                      {getRecentActions.slice(0, 3).map(renderActionCard)}
                    </div>
                    <Separator className="my-4" />
                  </div>
                )}

                {/* Grouped Actions */}
                {Object.entries(groupedActions).map(([category, actions]) => (
                  <div key={category}>
                    <h3 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wider">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h3>
                    <div className="space-y-2">
                      {actions.map(renderActionCard)}
                    </div>
                  </div>
                ))}

                {/* No results */}
                {filteredActions.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No actions found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your search or filter</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Help
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default GlobalQuickActionsSidebar