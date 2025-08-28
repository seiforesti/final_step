'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Plus, Check, ChevronDown, Settings, Users, Globe, Lock, Unlock, Star, Clock, Copy, Trash2, Edit3, Share2, Archive, ExternalLink, Search, Filter, MoreHorizontal, ChevronRight, Folder, FolderOpen, Building, Shield, Database, FileText, BookOpen, Scan, Activity, Bot, MessageSquare, Workflow, BarChart3, Zap, Hash, Calendar, Eye, EyeOff, UserPlus, LogOut, Download, Upload, RefreshCw, AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// Import racine foundation layers (already implemented)
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement'
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement'
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration'
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker'
import { useUserPreferences } from '../hooks/optimized/useOptimizedUserPreferences'

// Import types (already implemented)
import {
  WorkspaceState,
  WorkspaceTemplate,
  WorkspacePermission,
  WorkspaceContext,
  UserContext,
  WorkspaceCollaborator,
  WorkspaceResource,
  WorkspaceAnalytics,
  WorkspaceSettings
} from '../../../types/racine-core.types'

// Import utils (already implemented)
import { formatWorkspaceName, getWorkspaceIcon, validateWorkspaceName } from '../../../utils/workspace-utils'
import { formatTimeAgo } from '../../../utils/formatting-utils'

// Import constants (already implemented)
import { WORKSPACE_TEMPLATES, WORKSPACE_TYPES, MAX_WORKSPACE_NAME_LENGTH } from '../../../constants/workspace-constants'

interface QuickWorkspaceSwitchProps {
  showCreateOption?: boolean
  showTemplates?: boolean
  maxRecentWorkspaces?: number
  onWorkspaceSwitch?: (workspace: WorkspaceState) => void
  onWorkspaceCreate?: (workspace: WorkspaceState) => void
  className?: string
}

export const QuickWorkspaceSwitch: React.FC<QuickWorkspaceSwitchProps> = ({
  showCreateOption = true,
  showTemplates = true,
  maxRecentWorkspaces = 5,
  onWorkspaceSwitch,
  onWorkspaceCreate,
  className
}) => {
  // State management
  const [workspaces, setWorkspaces] = useState<WorkspaceState[]>([])
  const [recentWorkspaces, setRecentWorkspaces] = useState<WorkspaceState[]>([])
  const [favoriteWorkspaces, setFavoriteWorkspaces] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitching, setIsSwitching] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Custom hooks (normalized to support tuple or object returns)
  const workspaceHook = useWorkspaceManagement() as any
  const workspaceState = workspaceHook?.state ?? workspaceHook?.[0] ?? {}
  const workspaceOps = workspaceHook?.operations ?? workspaceHook?.[1] ?? workspaceHook ?? {}
  const getCurrentWorkspace = () => workspaceOps?.getCurrentWorkspace?.() ?? workspaceState?.currentWorkspace ?? null
  const getAllWorkspaces = async () => {
    try { return await (workspaceOps?.getAllWorkspaces?.()) ?? [] } catch { return [] }
  }
  const switchWorkspace = async (id: string) => { try { return await workspaceOps?.switchWorkspace?.(id) } catch { /* noop */ } }
  const createWorkspace = async (req: any) => { try { return await workspaceOps?.createWorkspace?.(req) } catch { return { id: '', name: req?.name || 'New Workspace', type: 'general' } }
  }
  const getFavoriteWorkspaces = async () => { try { return await (workspaceOps?.getFavoriteWorkspaces?.()) ?? [] } catch { return [] } }
  const addToFavorites = async (id: string) => { try { await workspaceOps?.addToFavorites?.(id) } catch { /* noop */ } }
  const removeFromFavorites = async (id: string) => { try { await workspaceOps?.removeFromFavorites?.(id) } catch { /* noop */ } }
  const getRecentWorkspaces = async (limit: number) => { try { return await (workspaceOps?.getRecentWorkspaces?.(limit)) ?? [] } catch { return [] } }
  const getWorkspaceTemplates = async () => { try { return await (workspaceOps?.getWorkspaceTemplates?.()) ?? [] } catch { return [] } }
  const getWorkspaceAnalytics = async () => { try { return await (workspaceOps?.getWorkspaceAnalytics?.()) ?? {} } catch { return {} } }
  const duplicateWorkspace = async (id: string) => { try { return await workspaceOps?.duplicateWorkspace?.(id) } catch { return null } }
  const archiveWorkspace = async (id: string) => { try { return await workspaceOps?.archiveWorkspace?.(id) } catch { /* noop */ } }

  const userHook = useUserManagement() as any
  const userOps = userHook?.operations ?? userHook?.[1] ?? userHook ?? {}
  const getCurrentUser = () => {
    try { return userOps?.getCurrentUser?.() ?? null } catch { return null }
  }
  const getUserPermissions = () => {
    try { return userOps?.getUserPermissions?.() ?? {} } catch { return {} }
  }

  const crossGroupHook = useCrossGroupIntegration() as any
  const crossGroupOps = crossGroupHook?.operations ?? crossGroupHook?.[1] ?? crossGroupHook ?? {}
  const getWorkspaceContext = () => {
    try { return crossGroupOps?.getWorkspaceContext?.() ?? null } catch { return null }
  }

  const activityHook = useActivityTracker() as any
  const activityOps = activityHook?.operations ?? activityHook?.[1] ?? activityHook ?? {}
  const trackEvent = (event: string, data?: any) => { try { activityOps?.trackEvent?.(event, data) } catch { /* noop */ } }

  const prefsHook = useUserPreferences() as any
  const prefsOps = prefsHook?.operations ?? prefsHook?.[1] ?? prefsHook ?? {}
  const getWorkspacePreferences = () => { try { return prefsOps?.getWorkspacePreferences?.() ?? { defaultSettings: {} } } catch { return { defaultSettings: {} } } }

  // Get current context
  const currentWorkspace = getCurrentWorkspace()
  const currentUser = getCurrentUser()
  const userPermissions = getUserPermissions()
  const workspacePreferences = getWorkspacePreferences()

  // Load workspaces (re-entrancy guarded)
  const loadingRef = useRef(false)
  const loadWorkspaces = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setIsLoading(true)
    try {
      const [allWorkspaces, recent, favorites] = await Promise.all([
        getAllWorkspaces(),
        getRecentWorkspaces(maxRecentWorkspaces),
        getFavoriteWorkspaces()
      ])

      setWorkspaces(allWorkspaces)
      setRecentWorkspaces(recent)
      setFavoriteWorkspaces(favorites)
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [maxRecentWorkspaces])

  // Load workspaces on mount
  useEffect(() => {
    // Run once on mount; internal guard prevents overlaps
    loadWorkspaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle workspace switch
  const handleWorkspaceSwitch = useCallback(async (workspace: WorkspaceState) => {
    if (workspace.id === currentWorkspace?.id || isSwitching) return

    setIsSwitching(workspace.id)

    try {
      await switchWorkspace(workspace.id)
      
      // Update recent workspaces
      setRecentWorkspaces(prev => {
        const updated = [workspace, ...prev.filter(w => w.id !== workspace.id)]
        return updated.slice(0, maxRecentWorkspaces)
      })

      trackEvent('workspace_switched', {
        fromWorkspaceId: currentWorkspace?.id,
        toWorkspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceType: workspace.type
      })

      onWorkspaceSwitch?.(workspace)
    } catch (error) {
      console.error('Failed to switch workspace:', error)
    } finally {
      setIsSwitching(null)
    }
  }, [
    currentWorkspace?.id,
    isSwitching,
    switchWorkspace,
    maxRecentWorkspaces,
    trackEvent,
    onWorkspaceSwitch
  ])

  // Handle workspace creation
  const handleWorkspaceCreate = useCallback(async () => {
    if (!newWorkspaceName.trim() || isCreating) return

    const validationError = validateWorkspaceName(newWorkspaceName)
    if (validationError) {
      console.error('Invalid workspace name:', validationError)
      return
    }

    setIsCreating(true)

    try {
      const newWorkspace = await createWorkspace({
        name: newWorkspaceName.trim(),
        template: selectedTemplate,
        isPrivate: false,
        settings: workspacePreferences.defaultSettings
      })

      setWorkspaces(prev => [newWorkspace, ...prev])
      setNewWorkspaceName('')
      setSelectedTemplate(null)
      setShowCreateDialog(false)

      trackEvent('workspace_created', {
        workspaceId: newWorkspace.id,
        workspaceName: newWorkspace.name,
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.name
      })

      onWorkspaceCreate?.(newWorkspace)

      // Auto-switch to new workspace
      await handleWorkspaceSwitch(newWorkspace)
    } catch (error) {
      console.error('Failed to create workspace:', error)
    } finally {
      setIsCreating(false)
    }
  }, [
    newWorkspaceName,
    isCreating,
    selectedTemplate,
    workspacePreferences.defaultSettings,
    createWorkspace,
    trackEvent,
    onWorkspaceCreate,
    handleWorkspaceSwitch
  ])

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async (workspaceId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    try {
      if (favoriteWorkspaces.includes(workspaceId)) {
        await removeFromFavorites(workspaceId)
        setFavoriteWorkspaces(prev => prev.filter(id => id !== workspaceId))
      } else {
        await addToFavorites(workspaceId)
        setFavoriteWorkspaces(prev => [...prev, workspaceId])
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }, [favoriteWorkspaces, addToFavorites, removeFromFavorites])

  // Filter workspaces based on search
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces

    return workspaces.filter(workspace =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [workspaces, searchQuery])

  // Get workspace display info
  const getWorkspaceDisplay = useCallback((workspace: WorkspaceState) => {
    const Icon = getWorkspaceIcon(workspace.type)
    const isActive = workspace.id === currentWorkspace?.id
    const isFavorite = favoriteWorkspaces.includes(workspace.id)
    const isSwitchingTo = isSwitching === workspace.id

    return { Icon, isActive, isFavorite, isSwitchingTo }
  }, [currentWorkspace?.id, favoriteWorkspaces, isSwitching])

  // Render workspace item
  const renderWorkspaceItem = useCallback((workspace: WorkspaceState, showActions = true) => {
    const { Icon, isActive, isFavorite, isSwitchingTo } = getWorkspaceDisplay(workspace)

    return (
      <DropdownMenuItem
        key={workspace.id}
        className={cn(
          "flex items-center gap-3 p-3 cursor-pointer",
          isActive && "bg-primary/10 border-l-2 border-l-primary"
        )}
        onClick={() => !isActive && handleWorkspaceSwitch(workspace)}
      >
        <div className="flex-shrink-0 relative">
          {workspace.avatar ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={workspace.avatar} alt={workspace.name} />
              <AvatarFallback>
                <Icon className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
          )}
          {isActive && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "text-sm truncate",
              isActive ? "font-semibold" : "font-medium"
            )}>
              {workspace.name}
            </p>
            {workspace.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
            {isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            <Badge variant="outline" className="text-xs">
              {workspace.type}
            </Badge>
          </div>
          
          {workspace.description && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {workspace.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{workspace.memberCount} members</span>
            <span>{workspace.resourceCount} resources</span>
            <span>Modified {formatTimeAgo(workspace.lastModified)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isSwitchingTo && <Loader2 className="w-4 h-4 animate-spin" />}
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => handleFavoriteToggle(workspace.id, e)}>
                  <Star className="w-4 h-4 mr-2" />
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate workspace
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share workspace
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Workspace settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {isActive ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </DropdownMenuItem>
    )
  }, [getWorkspaceDisplay, handleWorkspaceSwitch, handleFavoriteToggle])

  // Render create workspace dialog
  const renderCreateDialog = () => (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your data governance projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Workspace Name</label>
            <Input
              placeholder="Enter workspace name..."
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              maxLength={MAX_WORKSPACE_NAME_LENGTH}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {newWorkspaceName.length}/{MAX_WORKSPACE_NAME_LENGTH} characters
            </p>
          </div>

          {showTemplates && (
            <div>
              <label className="text-sm font-medium">Template (Optional)</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {WORKSPACE_TEMPLATES.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                    size="sm"
                    className="h-auto p-3 text-left"
                    onClick={() => setSelectedTemplate(
                      selectedTemplate?.id === template.id ? null : template
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <template.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{template.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowCreateDialog(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWorkspaceCreate}
            disabled={!newWorkspaceName.trim() || isCreating}
          >
            {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
            {currentWorkspace ? (
              <>
                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                  {currentWorkspace.avatar ? (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={currentWorkspace.avatar} alt={currentWorkspace.name} />
                      <AvatarFallback className="text-xs">
                        {currentWorkspace.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Briefcase className="w-3 h-3" />
                  )}
                </div>
                <span className="truncate max-w-32">{currentWorkspace.name}</span>
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                <span>Select Workspace</span>
              </>
            )}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          {/* Header */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-semibold">Workspaces</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={loadWorkspaces}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
              </Button>
            </div>
            
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>

          <ScrollArea className="max-h-96">
            {/* Recent Workspaces */}
            {recentWorkspaces.length > 0 && (
              <>
                <DropdownMenuLabel>Recent Workspaces</DropdownMenuLabel>
                {recentWorkspaces.map(workspace => renderWorkspaceItem(workspace, false))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* All Workspaces */}
            <DropdownMenuLabel>All Workspaces</DropdownMenuLabel>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : filteredWorkspaces.length > 0 ? (
              filteredWorkspaces.map(workspace => renderWorkspaceItem(workspace))
            ) : (
              <div className="text-center p-4">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No workspaces found' : 'No workspaces available'}
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {showCreateOption && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="w-4 h-4" />
                Create new workspace
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderCreateDialog()}
    </>
  )
}

export default QuickWorkspaceSwitch