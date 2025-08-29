"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Activity,
  BarChart3,
  Workflow,
  Zap,
  Bot,
  MessageSquare,
  Settings,
  Search,
  Home,
  GitBranch,
  Target,
  Network,
  Brain,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Pin,
  Star,
} from "lucide-react"

import { cn } from "../../utils/cn"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

// Import types
import type { ViewModeEnum } from "../../RacineMainManagerSPA"
import type { SystemHealth, User, Workspace } from "../../types/racine-core.types"

interface NavigationItem {
  id: ViewModeEnum
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: string
  isNew?: boolean
  isProfessional?: boolean
  group: 'core' | 'governance' | 'management' | 'tools'
}

const navigationItems: NavigationItem[] = [
  // Core Features
  {
    id: "dashboard" as ViewModeEnum,
    label: "Dashboard",
    icon: Home,
    description: "Intelligent overview and metrics",
    group: 'core',
    isProfessional: true
  },
  {
    id: "workflows" as ViewModeEnum,
    label: "Workflows",
    icon: Workflow,
    description: "Data governance workflows",
    group: 'core',
    isProfessional: true,
    isNew: true
  },
  {
    id: "pipelines" as ViewModeEnum,
    label: "Pipelines",
    icon: GitBranch,
    description: "Data processing pipelines",
    group: 'core',
    isProfessional: true,
    isNew: true
  },
  {
    id: "activity" as ViewModeEnum,
    label: "Activity",
    icon: Activity,
    description: "Real-time activity tracking",
    group: 'core',
    isProfessional: true,
    isNew: true
  },
  // Data Governance
  {
    id: "data-sources" as ViewModeEnum,
    label: "Data Sources",
    icon: Database,
    description: "Manage data connections",
    group: 'governance'
  },
  {
    id: "scan-rule-sets" as ViewModeEnum,
    label: "Scan Rules",
    icon: Scan,
    description: "Configure scanning rules",
    group: 'governance'
  },
  {
    id: "classifications" as ViewModeEnum,
    label: "Classifications",
    icon: FileText,
    description: "Data classification system",
    group: 'governance'
  },
  {
    id: "compliance-rule" as ViewModeEnum,
    label: "Compliance",
    icon: Shield,
    description: "Compliance management",
    group: 'governance'
  },
  {
    id: "advanced-catalog" as ViewModeEnum,
    label: "Data Catalog",
    icon: BookOpen,
    description: "Advanced data catalog",
    group: 'governance'
  },
  {
    id: "scan-logic" as ViewModeEnum,
    label: "Scan Logic",
    icon: Target,
    description: "Advanced scanning logic",
    group: 'governance'
  },
  // Management
  {
    id: "rbac-system" as ViewModeEnum,
    label: "RBAC",
    icon: Users,
    description: "Role-based access control",
    group: 'management'
  },
  {
    id: "collaboration" as ViewModeEnum,
    label: "Collaboration",
    icon: MessageSquare,
    description: "Team collaboration space",
    group: 'management',
    isProfessional: true,
    isNew: true
  },
  // Tools
  {
    id: "ai-assistant" as ViewModeEnum,
    label: "AI Assistant",
    icon: Brain,
    description: "Intelligent AI assistant",
    group: 'tools',
    isProfessional: true,
    isNew: true
  },
  {
    id: "data-governance" as ViewModeEnum,
    label: "Schema View",
    icon: Network,
    description: "Data governance schema",
    group: 'tools'
  },
]

const groupLabels = {
  core: "Core Features",
  governance: "Data Governance", 
  management: "Management",
  tools: "Tools & Analytics"
}

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  currentView: ViewModeEnum
  onViewChange: (view: ViewModeEnum) => void
  onQuickActionsToggle: () => void
  systemHealth?: SystemHealth
  currentUser?: User
  currentWorkspace?: Workspace
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onToggle,
  currentView,
  onViewChange,
  onQuickActionsToggle,
  systemHealth,
  currentUser,
  currentWorkspace
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [pinnedItems, setPinnedItems] = useState<Set<ViewModeEnum>>(new Set())

  // Filter navigation items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return navigationItems
    
    return navigationItems.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Group filtered items
  const groupedItems = useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {}
    
    filteredItems.forEach(item => {
      if (!groups[item.group]) {
        groups[item.group] = []
      }
      groups[item.group].push(item)
    })
    
    return groups
  }, [filteredItems])

  // Handle navigation
  const handleNavigation = useCallback((viewId: ViewModeEnum) => {
    onViewChange(viewId)
  }, [onViewChange])

  // Handle pin toggle
  const handlePinToggle = useCallback((itemId: ViewModeEnum, event: React.MouseEvent) => {
    event.stopPropagation()
    setPinnedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  // Get system health indicator
  const getHealthIndicator = () => {
    if (!systemHealth) return null
    
    const isHealthy = systemHealth.overall === 'healthy'
    return isHealthy ? (
      <CheckCircle className="h-3 w-3 text-green-500" />
    ) : (
      <AlertCircle className="h-3 w-3 text-yellow-500" />
    )
  }

  // Render navigation item
  const renderNavigationItem = useCallback((item: NavigationItem) => {
    const isActive = currentView === item.id
    const isPinned = pinnedItems.has(item.id)
    const Icon = item.icon

    const content = (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "w-full justify-start relative group transition-all duration-200",
          isActive && "bg-accent text-accent-foreground shadow-sm",
          !collapsed ? "px-3" : "px-2",
          "hover:bg-accent/80"
        )}
        onClick={() => handleNavigation(item.id)}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", !collapsed && "mr-3")} />
        
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            
            <div className="flex items-center gap-1 ml-2">
              {item.isNew && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  New
                </Badge>
              )}
              {item.isProfessional && (
                <Star className="h-3 w-3 text-amber-500" />
              )}
              {item.badge && (
                <Badge variant="outline" className="h-4 px-1 text-xs">
                  {item.badge}
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  isPinned && "opacity-100"
                )}
                onClick={(e) => handlePinToggle(item.id, e)}
              >
                <Pin className={cn("h-3 w-3", isPinned && "text-blue-500")} />
              </Button>
            </div>
          </>
        )}
      </Button>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              {item.isProfessional && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Professional
                </Badge>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )
    }

    return <div key={item.id}>{content}</div>
  }, [currentView, collapsed, pinnedItems, handleNavigation, handlePinToggle])

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col bg-background border-r border-border h-full"
    >
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Racine Platform</h2>
                <p className="text-xs text-muted-foreground">Enterprise Data Gov</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([groupKey, items]) => (
            <div key={groupKey}>
              {!collapsed && (
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {groupLabels[groupKey as keyof typeof groupLabels]}
                </h3>
              )}
              
              <div className="space-y-1">
                {items.map(renderNavigationItem)}
              </div>
              
              {!collapsed && <Separator className="my-3" />}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        {!collapsed && (
          <div className="space-y-3">
            {/* Workspace Info */}
            {currentWorkspace && (
              <div className="p-2 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{currentWorkspace.name}</p>
                    <p className="text-xs text-muted-foreground">Workspace</p>
                  </div>
                  {getHealthIndicator()}
                </div>
              </div>
            )}

            {/* User Info */}
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full p-2 h-auto">
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>
                          {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate">
                          {currentUser.name || currentUser.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentUser.role}
                        </p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleNavigation("settings" as ViewModeEnum)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onQuickActionsToggle}>
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Actions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {collapsed && (
          <div className="flex flex-col gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onQuickActionsToggle}>
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Quick Actions</TooltipContent>
            </Tooltip>

            {currentUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="text-xs">
                        {currentUser.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {currentUser.name || currentUser.email}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  )
}

export default AppSidebar