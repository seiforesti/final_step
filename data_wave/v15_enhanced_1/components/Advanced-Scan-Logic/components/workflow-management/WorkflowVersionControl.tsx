"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  History,
  Tag,
  Archive,
  Download,
  Upload,
  FileText,
  Compare,
  Clock,
  User,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Shield,
  Lock,
  Unlock,
  Key,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Stop,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ExternalLink,
  Link,
  Unlink,
  Hash,
  Percent,
  Calendar,
  Timer,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Layers,
  Package,
  Code,
  Database,
  Server,
  Cloud,
  Workflow,
  Target,
  Zap
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Import types and services
import {
  WorkflowVersion,
  VersionBranch,
  VersionCommit,
  VersionTag,
  VersionMerge,
  VersionConflict,
  VersionDiff,
  VersionHistory,
  VersionMetadata,
  VersionSnapshot,
  VersionRestore,
  VersionBackup,
  VersionMigration,
  VersionPolicy,
  VersionPermission,
  VersionAudit,
  VersionEvent,
  VersionLog,
  VersionTrace,
  VersionConfiguration,
  VersionStrategy,
  VersionWorkflow,
  VersionRelease,
  VersionDeployment,
  VersionRollback,
  VersionComparison,
  VersionAnalytics,
  VersionReport,
  VersionInsights,
  VersionRecommendation,
  VersionOptimization,
  VersionValidation,
  VersionTest,
  VersionBenchmark,
  VersionProfile,
  VersionMonitoring,
  VersionAlert,
  VersionNotification
} from '../../types/version.types'

import {
  useWorkflowVersions,
  useVersionBranches,
  useVersionHistory,
  useVersionComparison,
  useVersionMerging,
  useVersionTags,
  useVersionValidation,
  useVersionAnalytics,
  useVersionAudit,
  useVersionConfiguration,
  useVersionPermissions,
  useVersionBackup
} from '../../hooks/useVersionControl'

import {
  createVersion,
  updateVersion,
  deleteVersion,
  cloneVersion,
  compareVersions,
  mergeVersions,
  revertVersion,
  rollbackVersion,
  tagVersion,
  branchVersion,
  promoteVersion,
  demoteVersion,
  validateVersion,
  testVersion,
  deployVersion,
  restoreVersion,
  backupVersion,
  migrateVersion,
  optimizeVersion,
  profileVersion,
  benchmarkVersion,
  monitorVersion,
  analyzeVersion,
  reportVersion,
  auditVersion,
  lockVersion,
  unlockVersion,
  signVersion,
  verifyVersion,
  encryptVersion,
  decryptVersion,
  compressVersion,
  decompressVersion,
  indexVersion,
  searchVersions,
  filterVersions,
  sortVersions,
  paginateVersions,
  groupVersions,
  aggregateVersions,
  summarizeVersions,
  visualizeVersions,
  chartVersions,
  graphVersions,
  mapVersions,
  diagramVersions,
  modelVersions,
  simulateVersions,
  forecastVersions,
  projectVersions,
  estimateVersions,
  calculateVersions,
  evaluateVersions,
  assessVersions,
  mitigateVersions,
  contingencyVersions,
  disasterVersionRecovery,
  businessVersionContinuity,
  scalabilityVersionTesting,
  performanceVersionTuning,
  reliabilityVersionEngineering,
  availabilityVersionManagement,
  consistencyVersionControl,
  integrityVersionValidation,
  confidentialityVersionProtection,
  authenticationVersionServices,
  authorizationVersionPolicies,
  accountabilityVersionAuditing,
  nonRepudiationVersionLogging,
  privacyVersionCompliance
} from '../../services/version-control-apis'

// Enhanced interfaces for advanced version control management
interface WorkflowVersionControlState {
  // Core version state
  versions: WorkflowVersion[]
  branches: VersionBranch[]
  commits: VersionCommit[]
  tags: VersionTag[]
  merges: VersionMerge[]
  conflicts: VersionConflict[]
  
  // Selected items
  selectedVersion: WorkflowVersion | null
  selectedBranch: VersionBranch | null
  selectedCommit: VersionCommit | null
  selectedTag: VersionTag | null
  comparisonVersions: WorkflowVersion[]
  
  // Version operations
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isCloning: boolean
  isComparing: boolean
  isMerging: boolean
  isReverting: boolean
  isRollingBack: boolean
  isTagging: boolean
  isBranching: boolean
  isValidating: boolean
  isTesting: boolean
  isDeploying: boolean
  
  // View state
  view: 'timeline' | 'branches' | 'comparison' | 'history' | 'tags' | 'merges' | 'conflicts' | 'analytics' | 'settings'
  displayMode: 'tree' | 'list' | 'graph' | 'timeline' | 'table'
  filterMode: 'all' | 'published' | 'draft' | 'tagged' | 'merged' | 'conflicted'
  sortMode: 'created' | 'updated' | 'version' | 'author' | 'status'
  groupMode: 'none' | 'branch' | 'author' | 'status' | 'date'
  
  // Search and filters
  searchQuery: string
  selectedBranches: string[]
  selectedAuthors: string[]
  selectedStatuses: string[]
  selectedDates: { from: Date | null; to: Date | null }
  selectedTags: string[]
  
  // Diff and comparison
  diffMode: 'unified' | 'split' | 'side-by-side'
  showLineNumbers: boolean
  showWhitespace: boolean
  highlightChanges: boolean
  contextLines: number
  
  // Analytics and metrics
  analytics: VersionAnalytics | null
  insights: VersionInsights[]
  recommendations: VersionRecommendation[]
  reports: VersionReport[]
  
  // Configuration
  configuration: VersionConfiguration
  permissions: VersionPermission[]
  policies: VersionPolicy[]
  
  // Audit and history
  auditLog: VersionAudit[]
  history: VersionHistory[]
  events: VersionEvent[]
  
  // UI preferences
  showMetrics: boolean
  showAudit: boolean
  autoRefresh: boolean
  refreshInterval: number
  theme: 'light' | 'dark' | 'auto'
  density: 'compact' | 'normal' | 'comfortable'
  
  // Error and loading states
  error: string | null
  warnings: string[]
  isLoading: boolean
  progress: number
}

/**
 * WorkflowVersionControl Component
 * 
 * Enterprise-grade version control component that provides comprehensive
 * version management capabilities including:
 * - Git-like branching and merging
 * - Version comparison and diff viewing
 * - Tag management and releases
 * - Conflict resolution
 * - Rollback and revert operations
 * - Version history and timeline
 * - Analytics and reporting
 * - Audit trail and compliance
 * - Permission management
 * - Backup and restore
 * - Performance optimization
 * - Security and validation
 * 
 * This component integrates with the backend version control system and provides
 * a sophisticated user interface for managing workflow versions.
 */
export const WorkflowVersionControl: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onVersionSelected?: (version: WorkflowVersion) => void
  onVersionChanged?: (version: WorkflowVersion) => void
  allowCreation?: boolean
  allowModification?: boolean
  allowDeletion?: boolean
  showAnalytics?: boolean
  enableAudit?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onVersionSelected,
  onVersionChanged,
  allowCreation = true,
  allowModification = true,
  allowDeletion = false,
  showAnalytics = true,
  enableAudit = true,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<WorkflowVersionControlState>({
    // Core version state
    versions: [],
    branches: [],
    commits: [],
    tags: [],
    merges: [],
    conflicts: [],
    
    // Selected items
    selectedVersion: null,
    selectedBranch: null,
    selectedCommit: null,
    selectedTag: null,
    comparisonVersions: [],
    
    // Version operations
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isCloning: false,
    isComparing: false,
    isMerging: false,
    isReverting: false,
    isRollingBack: false,
    isTagging: false,
    isBranching: false,
    isValidating: false,
    isTesting: false,
    isDeploying: false,
    
    // View state
    view: 'timeline',
    displayMode: 'tree',
    filterMode: 'all',
    sortMode: 'created',
    groupMode: 'branch',
    
    // Search and filters
    searchQuery: '',
    selectedBranches: [],
    selectedAuthors: [],
    selectedStatuses: [],
    selectedDates: { from: null, to: null },
    selectedTags: [],
    
    // Diff and comparison
    diffMode: 'unified',
    showLineNumbers: true,
    showWhitespace: false,
    highlightChanges: true,
    contextLines: 3,
    
    // Analytics and metrics
    analytics: null,
    insights: [],
    recommendations: [],
    reports: [],
    
    // Configuration
    configuration: {
      maxVersions: 50,
      retentionPeriod: 7776000, // 90 days
      autoTag: true,
      autoMerge: false,
      conflictResolution: 'manual',
      branchingStrategy: 'gitflow',
      mergingStrategy: 'merge-commit',
      versionNaming: 'semantic',
      compression: true,
      encryption: false,
      validation: true,
      testing: false,
      monitoring: true,
      analytics: showAnalytics,
      audit: enableAudit,
      backup: true,
      restore: true,
      migration: true,
      optimization: true
    } as VersionConfiguration,
    permissions: [],
    policies: [],
    
    // Audit and history
    auditLog: [],
    history: [],
    events: [],
    
    // UI preferences
    showMetrics: showAnalytics,
    showAudit: enableAudit,
    autoRefresh: false,
    refreshInterval: 60000, // 1 minute
    theme: 'auto',
    density: 'normal',
    
    // Error and loading states
    error: null,
    warnings: [],
    isLoading: false,
    progress: 0
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<any>(null)
  const diffViewerRef = useRef<any>(null)
  const graphRef = useRef<any>(null)

  // Hook integrations
  const {
    versions,
    loading: versionsLoading,
    error: versionsError,
    refreshVersions,
    createVersion: createVersionHook,
    updateVersion: updateVersionHook,
    deleteVersion: deleteVersionHook,
    cloneVersion: cloneVersionHook
  } = useWorkflowVersions(workflowId)

  const {
    branches,
    activeBranch,
    refreshBranches,
    createBranch,
    deleteBranch,
    switchBranch,
    mergeBranch
  } = useVersionBranches()

  const {
    history,
    refreshHistory,
    getVersionHistory,
    compareVersionHistory
  } = useVersionHistory()

  const {
    comparison,
    diff,
    compareVersions: compareVersionsHook,
    generateDiff,
    applyDiff
  } = useVersionComparison()

  const {
    mergeStatus,
    conflicts,
    mergeVersions: mergeVersionsHook,
    resolveConflict,
    abortMerge
  } = useVersionMerging()

  const {
    tags,
    refreshTags,
    createTag,
    deleteTag,
    moveTag
  } = useVersionTags()

  const {
    validation,
    validateVersion: validateVersionHook,
    testVersion: testVersionHook
  } = useVersionValidation()

  const {
    analytics,
    metrics,
    refreshAnalytics,
    generateReport: generateReportHook
  } = useVersionAnalytics()

  const {
    auditLog,
    refreshAudit,
    logEvent,
    generateAuditReport
  } = useVersionAudit()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration
  } = useVersionConfiguration()

  const {
    userPermissions,
    checkPermission,
    grantPermission,
    revokePermission
  } = useVersionPermissions(userId)

  const {
    backupStatus,
    createBackup,
    restoreBackup,
    listBackups
  } = useVersionBackup()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredVersions = useMemo(() => {
    let result = state.versions

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      result = result.filter(version =>
        version.name?.toLowerCase().includes(query) ||
        version.description?.toLowerCase().includes(query) ||
        version.author?.toLowerCase().includes(query) ||
        version.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply filter mode
    if (state.filterMode !== 'all') {
      result = result.filter(version => {
        switch (state.filterMode) {
          case 'published':
            return version.status === 'published'
          case 'draft':
            return version.status === 'draft'
          case 'tagged':
            return version.tags && version.tags.length > 0
          case 'merged':
            return version.isMerged
          case 'conflicted':
            return version.hasConflicts
          default:
            return true
        }
      })
    }

    // Apply branch filter
    if (state.selectedBranches.length > 0) {
      result = result.filter(version =>
        state.selectedBranches.includes(version.branch || 'main')
      )
    }

    // Apply author filter
    if (state.selectedAuthors.length > 0) {
      result = result.filter(version =>
        state.selectedAuthors.includes(version.author || '')
      )
    }

    // Apply status filter
    if (state.selectedStatuses.length > 0) {
      result = result.filter(version =>
        state.selectedStatuses.includes(version.status)
      )
    }

    // Apply date filter
    if (state.selectedDates.from || state.selectedDates.to) {
      result = result.filter(version => {
        const versionDate = new Date(version.createdAt)
        if (state.selectedDates.from && versionDate < state.selectedDates.from) {
          return false
        }
        if (state.selectedDates.to && versionDate > state.selectedDates.to) {
          return false
        }
        return true
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (state.sortMode) {
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'version':
          comparison = (b.version || '').localeCompare(a.version || '')
          break
        case 'author':
          comparison = (a.author || '').localeCompare(b.author || '')
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }
      return comparison
    })

    return result
  }, [
    state.versions, state.searchQuery, state.filterMode, state.selectedBranches,
    state.selectedAuthors, state.selectedStatuses, state.selectedDates, state.sortMode
  ])

  const versionStatistics = useMemo(() => {
    const versions = state.versions
    return {
      total: versions.length,
      published: versions.filter(v => v.status === 'published').length,
      draft: versions.filter(v => v.status === 'draft').length,
      tagged: versions.filter(v => v.tags && v.tags.length > 0).length,
      merged: versions.filter(v => v.isMerged).length,
      conflicted: versions.filter(v => v.hasConflicts).length,
      branches: state.branches.length,
      activeBranch: activeBranch?.name || 'main',
      latestVersion: versions[0]?.version || '1.0.0',
      totalCommits: state.commits.length,
      totalTags: state.tags.length,
      totalMerges: state.merges.length
    }
  }, [state.versions, state.branches, state.commits, state.tags, state.merges, activeBranch])

  const canCreateVersion = useMemo(() => {
    return allowCreation && checkPermission('create_version') && !state.isCreating
  }, [allowCreation, checkPermission, state.isCreating])

  const canModifyVersion = useMemo(() => {
    return allowModification && 
           state.selectedVersion && 
           checkPermission('modify_version') && 
           !state.isUpdating
  }, [allowModification, state.selectedVersion, checkPermission, state.isUpdating])

  const canDeleteVersion = useMemo(() => {
    return allowDeletion && 
           state.selectedVersion && 
           checkPermission('delete_version') && 
           !state.isDeleting &&
           state.selectedVersion.status !== 'published'
  }, [allowDeletion, state.selectedVersion, checkPermission, state.isDeleting])

  const canCompareVersions = useMemo(() => {
    return state.comparisonVersions.length >= 2 && !state.isComparing
  }, [state.comparisonVersions, state.isComparing])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatVersionNumber = (version: string): string => {
    return version || '1.0.0'
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return 'text-green-600'
      case 'draft': return 'text-orange-600'
      case 'archived': return 'text-gray-600'
      case 'deprecated': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default'
      case 'draft': return 'secondary'
      case 'archived': return 'outline'
      case 'deprecated': return 'destructive'
      default: return 'outline'
    }
  }

  const getBranchColor = (branch: string): string => {
    switch (branch) {
      case 'main': return 'text-blue-600'
      case 'master': return 'text-blue-600'
      case 'develop': return 'text-green-600'
      case 'feature': return 'text-purple-600'
      case 'hotfix': return 'text-red-600'
      case 'release': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const generateVersionNumber = (currentVersion: string, type: 'major' | 'minor' | 'patch'): string => {
    const parts = currentVersion.split('.').map(Number)
    switch (type) {
      case 'major':
        return `${parts[0] + 1}.0.0`
      case 'minor':
        return `${parts[0]}.${parts[1] + 1}.0`
      case 'patch':
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
      default:
        return currentVersion
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
    logEvent('view_changed', { view, userId })
  }, [logEvent, userId])

  const handleDisplayModeChange = useCallback((mode: typeof state.displayMode) => {
    setState(prev => ({ ...prev, displayMode: mode }))
  }, [])

  const handleVersionSelect = useCallback((version: WorkflowVersion) => {
    setState(prev => ({ ...prev, selectedVersion: version }))
    onVersionSelected?.(version)
    logEvent('version_selected', { versionId: version.id, userId })
  }, [onVersionSelected, logEvent, userId])

  const handleVersionCreate = useCallback(async (versionData: Partial<WorkflowVersion>) => {
    if (!canCreateVersion) return

    try {
      setState(prev => ({ ...prev, isCreating: true, progress: 0 }))
      
      setState(prev => ({ ...prev, progress: 25 }))
      
      const newVersion = await createVersionHook({
        ...versionData,
        workflowId,
        author: userId,
        branch: activeBranch?.name || 'main',
        createdAt: new Date().toISOString()
      })
      
      setState(prev => ({ ...prev, progress: 75 }))
      
      setState(prev => ({
        ...prev,
        versions: [newVersion, ...prev.versions],
        selectedVersion: newVersion,
        progress: 100
      }))
      
      onVersionChanged?.(newVersion)
      logEvent('version_created', { versionId: newVersion.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create version'
      }))
    } finally {
      setState(prev => ({ ...prev, isCreating: false, progress: 0 }))
    }
  }, [canCreateVersion, createVersionHook, workflowId, userId, activeBranch, onVersionChanged, logEvent])

  const handleVersionUpdate = useCallback(async (versionId: string, updates: Partial<WorkflowVersion>) => {
    if (!canModifyVersion) return

    try {
      setState(prev => ({ ...prev, isUpdating: true }))
      
      const updatedVersion = await updateVersionHook(versionId, {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      })
      
      setState(prev => ({
        ...prev,
        versions: prev.versions.map(v => v.id === versionId ? updatedVersion : v),
        selectedVersion: updatedVersion
      }))
      
      onVersionChanged?.(updatedVersion)
      logEvent('version_updated', { versionId, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update version'
      }))
    } finally {
      setState(prev => ({ ...prev, isUpdating: false }))
    }
  }, [canModifyVersion, updateVersionHook, userId, onVersionChanged, logEvent])

  const handleVersionDelete = useCallback(async (versionId: string) => {
    if (!canDeleteVersion) return

    try {
      setState(prev => ({ ...prev, isDeleting: true }))
      
      await deleteVersionHook(versionId)
      
      setState(prev => ({
        ...prev,
        versions: prev.versions.filter(v => v.id !== versionId),
        selectedVersion: prev.selectedVersion?.id === versionId ? null : prev.selectedVersion
      }))
      
      logEvent('version_deleted', { versionId, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete version'
      }))
    } finally {
      setState(prev => ({ ...prev, isDeleting: false }))
    }
  }, [canDeleteVersion, deleteVersionHook, logEvent, userId])

  const handleVersionCompare = useCallback(async (versions: WorkflowVersion[]) => {
    if (!canCompareVersions) return

    try {
      setState(prev => ({ ...prev, isComparing: true }))
      
      const comparison = await compareVersionsHook(versions[0].id, versions[1].id)
      
      setState(prev => ({
        ...prev,
        comparisonVersions: versions
      }))
      
      logEvent('versions_compared', { 
        versionIds: versions.map(v => v.id), 
        userId 
      })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to compare versions'
      }))
    } finally {
      setState(prev => ({ ...prev, isComparing: false }))
    }
  }, [canCompareVersions, compareVersionsHook, logEvent, userId])

  const handleVersionTag = useCallback(async (version: WorkflowVersion, tagName: string, description?: string) => {
    try {
      setState(prev => ({ ...prev, isTagging: true }))
      
      const tag = await createTag({
        name: tagName,
        description,
        versionId: version.id,
        author: userId,
        createdAt: new Date().toISOString()
      })
      
      setState(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        versions: prev.versions.map(v => 
          v.id === version.id 
            ? { ...v, tags: [...(v.tags || []), tagName] }
            : v
        )
      }))
      
      logEvent('version_tagged', { versionId: version.id, tagName, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to tag version'
      }))
    } finally {
      setState(prev => ({ ...prev, isTagging: false }))
    }
  }, [createTag, userId, logEvent])

  const handleVersionRevert = useCallback(async (version: WorkflowVersion) => {
    try {
      setState(prev => ({ ...prev, isReverting: true }))
      
      const revertedVersion = await revertVersion(version.id, {
        author: userId,
        reason: 'Manual revert'
      })
      
      setState(prev => ({
        ...prev,
        versions: [revertedVersion, ...prev.versions],
        selectedVersion: revertedVersion
      }))
      
      onVersionChanged?.(revertedVersion)
      logEvent('version_reverted', { versionId: version.id, newVersionId: revertedVersion.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to revert version'
      }))
    } finally {
      setState(prev => ({ ...prev, isReverting: false }))
    }
  }, [userId, onVersionChanged, logEvent])

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const handleFilterChange = useCallback((filterType: string, values: string[]) => {
    setState(prev => {
      const newState = { ...prev }
      switch (filterType) {
        case 'branches':
          newState.selectedBranches = values
          break
        case 'authors':
          newState.selectedAuthors = values
          break
        case 'statuses':
          newState.selectedStatuses = values
          break
        case 'tags':
          newState.selectedTags = values
          break
      }
      return newState
    })
  }, [])

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      
      try {
        await Promise.all([
          refreshVersions(),
          refreshBranches(),
          refreshTags(),
          refreshHistory(),
          showAnalytics ? refreshAnalytics() : Promise.resolve(),
          enableAudit ? refreshAudit() : Promise.resolve()
        ])
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize data' 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    initializeData()
  }, [
    workflowId, refreshVersions, refreshBranches, refreshTags, refreshHistory,
    refreshAnalytics, refreshAudit, showAnalytics, enableAudit
  ])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      versions: versions || [],
      branches: branches || [],
      tags: tags || [],
      history: history || [],
      analytics: analytics || null,
      auditLog: auditLog || []
    }))
  }, [versions, branches, tags, history, analytics, auditLog])

  useEffect(() => {
    // Auto-refresh data
    if (state.autoRefresh) {
      const intervalId = setInterval(() => {
        refreshVersions()
      }, state.refreshInterval)
      
      return () => clearInterval(intervalId)
    }
  }, [state.autoRefresh, state.refreshInterval, refreshVersions])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Version Control</h1>
        <Separator orientation="vertical" className="h-6" />
        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="comparison">Compare</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="merges">Merges</TabsTrigger>
            {showAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search versions..."
          value={state.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-64"
        />
        
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {canCreateVersion && (
          <Button onClick={() => handleVersionCreate({})}>
            <Plus className="h-4 w-4 mr-2" />
            New Version
          </Button>
        )}

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <GitCommit className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Total Versions</p>
              <p className="text-2xl font-bold">{versionStatistics.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Published</p>
              <p className="text-2xl font-bold">{versionStatistics.published}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Branches</p>
              <p className="text-2xl font-bold">{versionStatistics.branches}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Tags</p>
              <p className="text-2xl font-bold">{versionStatistics.totalTags}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <GitMerge className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Merges</p>
              <p className="text-2xl font-bold">{versionStatistics.totalMerges}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium">Latest</p>
              <p className="text-2xl font-bold">{versionStatistics.latestVersion}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderVersionCard = (version: WorkflowVersion) => (
    <Card 
      key={version.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        state.selectedVersion?.id === version.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleVersionSelect(version)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <GitCommit className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base truncate">
                {version.name} v{formatVersionNumber(version.version)}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusVariant(version.status)}>
                {version.status}
              </Badge>
              <Badge variant="outline" className={getBranchColor(version.branch || 'main')}>
                <GitBranch className="h-3 w-3 mr-1" />
                {version.branch || 'main'}
              </Badge>
              {version.tags && version.tags.length > 0 && (
                <Badge variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {version.tags.length} tags
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleVersionRevert(version)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Revert
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVersionTag(version, `v${version.version}`)}>
                <Tag className="h-4 w-4 mr-2" />
                Add Tag
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Compare className="h-4 w-4 mr-2" />
                Compare
              </DropdownMenuItem>
              {canModifyVersion && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </DropdownMenuItem>
                </>
              )}
              {canDeleteVersion && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleVersionDelete(version.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription className="text-sm line-clamp-2 mt-2">
          {version.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Author and Date */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {version.author?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{version.author}</span>
            </div>
            <span>{new Date(version.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Version metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <History className="h-3 w-3" />
              <span>{version.changeCount || 0} changes</span>
            </div>
            <div className="flex items-center space-x-1">
              <GitCommit className="h-3 w-3" />
              <span>{version.commitCount || 0} commits</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{version.contributorCount || 1} contributors</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                // Handle view version details
              }}
              className="flex-1 mr-2"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                // Handle compare version
              }}
            >
              <Compare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-background" ref={containerRef}>
      {renderToolbar()}
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={state.view} className="h-full flex flex-col">
          {/* Timeline View */}
          <TabsContent value="timeline" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              {renderStatisticsCards()}
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                <div className="lg:col-span-3">
                  <ScrollArea className="h-[calc(100vh-400px)]" ref={timelineRef}>
                    <div className="space-y-4">
                      {filteredVersions.map(renderVersionCard)}
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="space-y-4">
                  {/* Current Branch */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Current Branch</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{versionStatistics.activeBranch}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Filters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Status</Label>
                        <Select value={state.filterMode} onValueChange={(value) => setState(prev => ({ ...prev, filterMode: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="tagged">Tagged</SelectItem>
                            <SelectItem value="merged">Merged</SelectItem>
                            <SelectItem value="conflicted">Conflicted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Sort By</Label>
                        <Select value={state.sortMode} onValueChange={(value) => setState(prev => ({ ...prev, sortMode: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created">Created Date</SelectItem>
                            <SelectItem value="updated">Updated Date</SelectItem>
                            <SelectItem value="version">Version Number</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Selected Version Details */}
                  {state.selectedVersion && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Version Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label>Version</Label>
                            <p className="text-sm font-medium">{formatVersionNumber(state.selectedVersion.version)}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Badge variant={getStatusVariant(state.selectedVersion.status)}>
                              {state.selectedVersion.status}
                            </Badge>
                          </div>
                          <div>
                            <Label>Branch</Label>
                            <p className="text-sm">{state.selectedVersion.branch || 'main'}</p>
                          </div>
                          <div>
                            <Label>Author</Label>
                            <p className="text-sm">{state.selectedVersion.author}</p>
                          </div>
                          <div>
                            <Label>Created</Label>
                            <p className="text-sm">{new Date(state.selectedVersion.createdAt).toLocaleDateString()}</p>
                          </div>
                          {state.selectedVersion.description && (
                            <div>
                              <Label>Description</Label>
                              <p className="text-sm text-muted-foreground">
                                {state.selectedVersion.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other views would be implemented here */}
          <TabsContent value="branches" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branch Management</CardTitle>
                  <CardDescription>
                    Manage version branches and merging
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 border rounded-md p-4">
                    <p className="text-muted-foreground text-center">Branch visualization will be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add other tab contents as needed */}
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isLoading || state.isCreating || state.isUpdating || state.isDeleting || state.isComparing) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <p className="font-medium">
                {state.isLoading ? 'Loading versions...' :
                 state.isCreating ? 'Creating version...' :
                 state.isUpdating ? 'Updating version...' :
                 state.isDeleting ? 'Deleting version...' :
                 'Comparing versions...'}
              </p>
              {state.progress > 0 && (
                <div className="mt-2 w-64">
                  <Progress value={state.progress} />
                  <p className="text-sm text-muted-foreground mt-1">{state.progress}% complete</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="fixed bottom-4 left-4 w-80">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
            >
              Dismiss
            </Button>
          </Alert>
        </div>
      )}
    </div>
  )
}

export default WorkflowVersionControl