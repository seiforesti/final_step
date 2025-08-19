"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText,
  Copy,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Star,
  Bookmark,
  Tag,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Save,
  RefreshCw,
  Settings,
  Package,
  Code,
  Layers,
  Share2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Archive,
  History,
  GitBranch,
  Workflow,
  Database,
  Server,
  Zap,
  Target,
  Activity,
  Clock,
  User,
  Users,
  Crown,
  Award,
  Flag,
  Hash,
  Percent,
  Calendar,
  Timer,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Play
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
  WorkflowTemplate,
  TemplateCategory,
  TemplateVersion,
  TemplateMetadata,
  TemplateConfiguration,
  TemplateVariable,
  TemplateValidation,
  TemplateUsage,
  TemplateLibrary,
  TemplateCollection,
  TemplateTag,
  TemplateRating,
  TemplateComment,
  TemplateHistory,
  TemplateSnapshot,
  TemplateImport,
  TemplateExport,
  TemplateMigration,
  TemplateAnalytics,
  TemplateRecommendation,
  TemplateOptimization,
  TemplatePermission,
  TemplateAudit,
  TemplateBackup,
  TemplateRestore,
  TemplateSync,
  TemplateCache,
  TemplateIndex,
  TemplateSearch,
  TemplateFilter,
  TemplateSort,
  TemplatePagination
} from '../../types/workflow.types'

import {
  useWorkflowTemplates,
  useTemplateLibrary,
  useTemplateVersioning,
  useTemplateValidation,
  useTemplateAnalytics,
  useTemplateRecommendations,
  useTemplatePermissions,
  useTemplateAudit,
  useTemplateBackup,
  useTemplateSync,
  useTemplateCache,
  useTemplateSearch
} from '../../hooks/useWorkflowManagement'

import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
  validateTemplate,
  publishTemplate,
  importTemplate,
  exportTemplate,
  applyTemplate,
  instantiateTemplate,
  customizeTemplate,
  shareTemplate,
  favoriteTemplate,
  rateTemplate,
  commentTemplate,
  searchTemplates,
  filterTemplates,
  categorizeTemplates,
  tagTemplates,
  analyzeTemplate,
  optimizeTemplate,
  recommendTemplates,
  migrateTemplate,
  versionTemplate,
  rollbackTemplate,
  compareTemplates,
  mergeTemplates,
  syncTemplates,
  cacheTemplates,
  indexTemplates,
  backupTemplates,
  restoreTemplates,
  compressTemplate,
  decompressTemplate,
  encryptTemplate,
  decryptTemplate,
  signTemplate,
  verifyTemplate,
  auditTemplate,
  trackTemplate,
  monitorTemplate,
  alertTemplate,
  scheduleTemplate,
  executeTemplate,
  testTemplate,
  debugTemplate,
  profileTemplate,
  benchmarkTemplate,
  deployTemplate,
  retireTemplate,
  archiveTemplate,
  deleteTemplateVersion,
  purgeTemplate,
  bulkOperations,
  batchProcessing,
  parallelExecution,
  queueManagement,
  resourceManagement,
  memoryOptimization,
  diskOptimization,
  networkOptimization,
  securityScanning,
  vulnerabilityAssessment,
  complianceChecking,
  accessControlManagement,
  roleBasedPermissions,
  attributeBasedAccess,
  multiTenantSupport,
  organizationIsolation,
  dataEncryption,
  dataAnonymization,
  dataRetention,
  dataArchival,
  dataDestruction,
  auditLogging,
  eventTracking,
  performanceMonitoring,
  usageTracking,
  metricCollection,
  reportGeneration,
  dashboardCreation,
  alertConfiguration,
  notificationManagement,
  integrationManagement,
  apiManagement,
  webhookManagement,
  eventSubscription,
  messageQueuing,
  workflowOrchestration,
  processAutomation,
  taskScheduling,
  jobManagement,
  resourceProvisioning,
  scalingManagement,
  loadBalancing,
  failoverManagement,
  disasterRecovery,
  backupManagement,
  restoreManagement,
  migrationManagement,
  upgradeManagement,
  versionManagement,
  releaseManagement,
  deploymentManagement,
  configurationManagement,
  environmentManagement,
  testingManagement,
  qualityAssurance,
  performanceTesting,
  securityTesting,
  usabilityTesting,
  accessibilityTesting,
  compatibilityTesting,
  documentationGeneration,
  helpSystemIntegration,
  trainingMaterialCreation,
  userOnboarding,
  supportTicketing,
  feedbackCollection,
  featureRequesting,
  bugReporting,
  issueTracking,
  projectManagement,
  teamCollaboration,
  communicationTools,
  meetingIntegration,
  calendarIntegration,
  emailIntegration,
  chatIntegration,
  videoConferencing,
  screenSharing,
  fileSharing,
  documentCollaboration,
  versionControl,
  codeReview,
  continuousIntegration,
  continuousDeployment,
  devOpsIntegration,
  cloudIntegration,
  containerization,
  microservices,
  serverlessComputing,
  edgeComputing,
  iotIntegration,
  aiIntegration,
  mlIntegration,
  analyticsIntegration,
  businessIntelligence,
  dataVisualization,
  reportingTools,
  dashboardTools,
  kpiTracking,
  metricsDashboard,
  performanceDashboard,
  operationalDashboard,
  executiveDashboard,
  customDashboard,
  realTimeDashboard,
  interactiveDashboard,
  mobileDashboard,
  webDashboard,
  desktopDashboard
} from '../../services/scan-workflow-apis'

// Enhanced interfaces for advanced template management
interface WorkflowTemplateManagerState {
  // Core template state
  templates: WorkflowTemplate[]
  categories: TemplateCategory[]
  collections: TemplateCollection[]
  library: TemplateLibrary | null
  versions: TemplateVersion[]
  
  // Selected items
  selectedTemplate: WorkflowTemplate | null
  selectedCategory: TemplateCategory | null
  selectedCollection: TemplateCollection | null
  selectedVersion: TemplateVersion | null
  
  // Template operations
  isCreating: boolean
  isEditing: boolean
  isDeleting: boolean
  isImporting: boolean
  isExporting: boolean
  isValidating: boolean
  isOptimizing: boolean
  isPublishing: boolean
  isTesting: boolean
  isDeploying: boolean
  
  // View state
  view: 'gallery' | 'editor' | 'library' | 'analytics' | 'settings' | 'permissions' | 'audit'
  displayMode: 'grid' | 'list' | 'details' | 'cards' | 'tiles'
  showFavorites: boolean
  showRecent: boolean
  showPublic: boolean
  showPrivate: boolean
  showShared: boolean
  showArchived: boolean
  
  // Search and filters
  searchQuery: string
  selectedCategories: string[]
  selectedTags: string[]
  selectedTypes: string[]
  selectedStatuses: string[]
  selectedAuthors: string[]
  ratingFilter: number
  dateFilter: string
  sizeFilter: string
  usageFilter: string
  
  // Analytics and metrics
  templateMetrics: TemplateAnalytics | null
  usageStats: TemplateUsage[]
  recommendations: TemplateRecommendation[]
  optimizations: TemplateOptimization[]
  performanceData: any[]
  
  // Version management
  showVersionHistory: boolean
  compareVersions: boolean
  versionFrom: TemplateVersion | null
  versionTo: TemplateVersion | null
  
  // Validation and testing
  validationResults: TemplateValidation[]
  testResults: any[]
  performanceResults: any[]
  securityResults: any[]
  
  // Import/Export
  importData: any | null
  exportSettings: any
  migrationStatus: any
  
  // Configuration
  configuration: TemplateConfiguration
  variables: TemplateVariable[]
  permissions: TemplatePermission[]
  
  // Collaboration
  comments: TemplateComment[]
  ratings: TemplateRating[]
  shares: any[]
  collaborators: any[]
  
  // Audit and history
  auditLog: TemplateAudit[]
  history: TemplateHistory[]
  snapshots: TemplateSnapshot[]
  
  // Cache and performance
  cacheStats: any
  indexStats: any
  syncStatus: any
  
  // UI preferences
  sortBy: string
  sortOrder: 'asc' | 'desc'
  pageSize: number
  currentPage: number
  groupBy: string
  filterBy: string
  
  // Error and loading states
  error: string | null
  warnings: string[]
  isLoading: boolean
  progress: number
}

/**
 * WorkflowTemplateManager Component
 * 
 * Enterprise-grade workflow template management component that provides comprehensive
 * template lifecycle management capabilities including:
 * - Template creation, editing, and deletion
 * - Version control and history management
 * - Template library and collections
 * - Import/export functionality
 * - Template validation and optimization
 * - Analytics and usage tracking
 * - Sharing and collaboration features
 * - Template recommendations
 * - Permission management
 * - Audit trail and compliance
 * - Performance monitoring
 * - Multi-tenant support
 * - Integration capabilities
 * 
 * This component integrates with the backend template management system and provides
 * a sophisticated user interface for managing reusable workflow templates.
 */
export const WorkflowTemplateManager: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onTemplateSelected?: (template: WorkflowTemplate) => void
  onTemplateApplied?: (template: WorkflowTemplate) => void
  allowEditing?: boolean
  allowSharing?: boolean
  showAnalytics?: boolean
  enableVersioning?: boolean
  enableCollaboration?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onTemplateSelected,
  onTemplateApplied,
  allowEditing = true,
  allowSharing = true,
  showAnalytics = true,
  enableVersioning = true,
  enableCollaboration = true,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<WorkflowTemplateManagerState>({
    // Core template state
    templates: [],
    categories: [],
    collections: [],
    library: null,
    versions: [],
    
    // Selected items
    selectedTemplate: null,
    selectedCategory: null,
    selectedCollection: null,
    selectedVersion: null,
    
    // Template operations
    isCreating: false,
    isEditing: false,
    isDeleting: false,
    isImporting: false,
    isExporting: false,
    isValidating: false,
    isOptimizing: false,
    isPublishing: false,
    isTesting: false,
    isDeploying: false,
    
    // View state
    view: 'gallery',
    displayMode: 'grid',
    showFavorites: false,
    showRecent: true,
    showPublic: true,
    showPrivate: true,
    showShared: false,
    showArchived: false,
    
    // Search and filters
    searchQuery: '',
    selectedCategories: [],
    selectedTags: [],
    selectedTypes: [],
    selectedStatuses: [],
    selectedAuthors: [],
    ratingFilter: 0,
    dateFilter: 'all',
    sizeFilter: 'all',
    usageFilter: 'all',
    
    // Analytics and metrics
    templateMetrics: null,
    usageStats: [],
    recommendations: [],
    optimizations: [],
    performanceData: [],
    
    // Version management
    showVersionHistory: false,
    compareVersions: false,
    versionFrom: null,
    versionTo: null,
    
    // Validation and testing
    validationResults: [],
    testResults: [],
    performanceResults: [],
    securityResults: [],
    
    // Import/Export
    importData: null,
    exportSettings: {},
    migrationStatus: {},
    
    // Configuration
    configuration: {
      autoSave: true,
      autoValidate: true,
      autoOptimize: false,
      enableVersioning: enableVersioning,
      enableCollaboration: enableCollaboration,
      maxVersions: 10,
      compressionLevel: 5,
      encryptionEnabled: false,
      backupInterval: 3600,
      syncInterval: 300,
      cacheSize: 100,
      indexSize: 1000
    } as TemplateConfiguration,
    variables: [],
    permissions: [],
    
    // Collaboration
    comments: [],
    ratings: [],
    shares: [],
    collaborators: [],
    
    // Audit and history
    auditLog: [],
    history: [],
    snapshots: [],
    
    // Cache and performance
    cacheStats: {},
    indexStats: {},
    syncStatus: {},
    
    // UI preferences
    sortBy: 'name',
    sortOrder: 'asc',
    pageSize: 20,
    currentPage: 1,
    groupBy: 'category',
    filterBy: 'all',
    
    // Error and loading states
    error: null,
    warnings: [],
    isLoading: false,
    progress: 0
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const uploaderRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<any>(null)
  const analyticsRef = useRef<any>(null)

  // Hook integrations
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    refreshTemplates,
    createTemplate: createTemplateHook,
    updateTemplate: updateTemplateHook,
    deleteTemplate: deleteTemplateHook,
    cloneTemplate: cloneTemplateHook,
    publishTemplate: publishTemplateHook
  } = useWorkflowTemplates(organizationId)

  const {
    library,
    categories,
    collections,
    refreshLibrary,
    createCollection,
    updateCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection
  } = useTemplateLibrary()

  const {
    versions,
    activeVersion,
    createVersion,
    deleteVersion,
    rollbackToVersion,
    compareVersions: compareVersionsHook
  } = useTemplateVersioning()

  const {
    validation,
    validateTemplate: validateTemplateHook,
    validateConfiguration,
    validateVariables,
    validatePermissions
  } = useTemplateValidation()

  const {
    analytics,
    metrics,
    usageStats,
    calculateMetrics,
    generateReport,
    analyzePerformance,
    trackUsage
  } = useTemplateAnalytics()

  const {
    recommendations,
    generateRecommendations,
    applyRecommendation,
    optimizeTemplate: optimizeTemplateHook
  } = useTemplateRecommendations()

  const {
    userPermissions,
    checkPermission,
    grantPermission,
    revokePermission,
    listPermissions
  } = useTemplatePermissions(userId)

  const {
    auditLog,
    logEvent,
    refreshAudit,
    generateAuditReport
  } = useTemplateAudit()

  const {
    backupStatus,
    createBackup,
    restoreBackup,
    listBackups,
    deleteBackup
  } = useTemplateBackup()

  const {
    syncStatus,
    syncTemplates: syncTemplatesHook,
    syncLibrary,
    syncConfiguration
  } = useTemplateSync()

  const {
    cacheStats,
    cacheHit,
    cacheMiss,
    clearCache,
    optimizeCache
  } = useTemplateCache()

  const {
    searchResults,
    searchTemplates: searchTemplatesHook,
    searchLibrary,
    searchHistory,
    saveSearch,
    deleteSearch
  } = useTemplateSearch()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredTemplates = useMemo(() => {
    let result = state.templates

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      result = result.filter(template =>
        template.name?.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        template.author?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (state.selectedCategories.length > 0) {
      result = result.filter(template =>
        state.selectedCategories.includes(template.categoryId || '')
      )
    }

    // Apply type filter
    if (state.selectedTypes.length > 0) {
      result = result.filter(template =>
        state.selectedTypes.includes(template.type)
      )
    }

    // Apply status filter
    if (state.selectedStatuses.length > 0) {
      result = result.filter(template =>
        state.selectedStatuses.includes(template.status)
      )
    }

    // Apply author filter
    if (state.selectedAuthors.length > 0) {
      result = result.filter(template =>
        state.selectedAuthors.includes(template.author || '')
      )
    }

    // Apply rating filter
    if (state.ratingFilter > 0) {
      result = result.filter(template =>
        (template.rating || 0) >= state.ratingFilter
      )
    }

    // Apply date filter
    if (state.dateFilter !== 'all') {
      const now = new Date()
      let filterDate: Date
      
      switch (state.dateFilter) {
        case 'today':
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          filterDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          filterDate = new Date(0)
      }
      
      result = result.filter(template =>
        new Date(template.updatedAt) >= filterDate
      )
    }

    // Apply visibility filters
    if (!state.showPublic) {
      result = result.filter(template => !template.isPublic)
    }
    if (!state.showPrivate) {
      result = result.filter(template => template.isPublic)
    }
    if (state.showFavorites) {
      result = result.filter(template => template.isFavorited)
    }
    if (state.showShared) {
      result = result.filter(template => template.isShared)
    }
    if (!state.showArchived) {
      result = result.filter(template => template.status !== 'archived')
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (state.sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0)
          break
        case 'usage':
          comparison = (b.usageCount || 0) - (a.usageCount || 0)
          break
        case 'size':
          comparison = (b.size || 0) - (a.size || 0)
          break
        case 'author':
          comparison = (a.author || '').localeCompare(b.author || '')
          break
        default:
          comparison = 0
      }
      return state.sortOrder === 'desc' ? comparison : -comparison
    })

    return result
  }, [
    state.templates, state.searchQuery, state.selectedCategories, state.selectedTypes, 
    state.selectedStatuses, state.selectedAuthors, state.ratingFilter, state.dateFilter,
    state.showPublic, state.showPrivate, state.showFavorites, state.showShared, 
    state.showArchived, state.sortBy, state.sortOrder
  ])

  const paginatedTemplates = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.pageSize
    const endIndex = startIndex + state.pageSize
    return filteredTemplates.slice(startIndex, endIndex)
  }, [filteredTemplates, state.currentPage, state.pageSize])

  const templateStatistics = useMemo(() => {
    return {
      total: state.templates.length,
      public: state.templates.filter(t => t.isPublic).length,
      private: state.templates.filter(t => !t.isPublic).length,
      favorited: state.templates.filter(t => t.isFavorited).length,
      shared: state.templates.filter(t => t.isShared).length,
      published: state.templates.filter(t => t.status === 'published').length,
      draft: state.templates.filter(t => t.status === 'draft').length,
      archived: state.templates.filter(t => t.status === 'archived').length,
      totalUsage: state.templates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
      averageRating: state.templates.reduce((sum, t) => sum + (t.rating || 0), 0) / state.templates.length,
      totalSize: state.templates.reduce((sum, t) => sum + (t.size || 0), 0),
      categories: state.categories.length,
      collections: state.collections.length,
      versions: state.versions.length
    }
  }, [state.templates, state.categories, state.collections, state.versions])

  const canCreateTemplate = useMemo(() => {
    return checkPermission('create_template') && !state.isCreating
  }, [checkPermission, state.isCreating])

  const canEditTemplate = useMemo(() => {
    return allowEditing && 
           state.selectedTemplate && 
           (checkPermission('edit_template') || state.selectedTemplate.author === userId) && 
           !state.isEditing
  }, [allowEditing, state.selectedTemplate, checkPermission, userId, state.isEditing])

  const canDeleteTemplate = useMemo(() => {
    return state.selectedTemplate && 
           (checkPermission('delete_template') || state.selectedTemplate.author === userId) && 
           !state.isDeleting
  }, [state.selectedTemplate, checkPermission, userId, state.isDeleting])

  const canShareTemplate = useMemo(() => {
    return allowSharing && 
           state.selectedTemplate && 
           (checkPermission('share_template') || state.selectedTemplate.author === userId)
  }, [allowSharing, state.selectedTemplate, checkPermission, userId])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatTemplateSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTemplateUsage = (count: number): string => {
    if (count === 0) return '0 uses'
    if (count === 1) return '1 use'
    if (count < 1000) return `${count} uses`
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K uses`
    return `${(count / 1000000).toFixed(1)}M uses`
  }

  const formatTemplateRating = (rating: number): string => {
    return rating.toFixed(1)
  }

  const getTemplateStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return 'text-green-600'
      case 'draft': return 'text-orange-600'
      case 'archived': return 'text-gray-600'
      case 'deprecated': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const getTemplateStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default'
      case 'draft': return 'secondary'
      case 'archived': return 'outline'
      case 'deprecated': return 'destructive'
      default: return 'outline'
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

  const handleTemplateSelect = useCallback((template: WorkflowTemplate) => {
    setState(prev => ({ ...prev, selectedTemplate: template }))
    onTemplateSelected?.(template)
    trackUsage(template.id, 'view')
    logEvent('template_selected', { templateId: template.id, userId })
  }, [onTemplateSelected, trackUsage, logEvent, userId])

  const handleTemplateCreate = useCallback(async (templateData: Partial<WorkflowTemplate>) => {
    if (!canCreateTemplate) return

    try {
      setState(prev => ({ ...prev, isCreating: true, progress: 0 }))
      
      // Validate template data
      if (state.configuration.autoValidate) {
        const validation = await validateTemplateHook(templateData as WorkflowTemplate)
        if (!validation.isValid) {
          setState(prev => ({ 
            ...prev, 
            error: 'Template validation failed: ' + validation.errors.join(', ') 
          }))
          return
        }
      }
      
      setState(prev => ({ ...prev, progress: 25 }))
      
      const newTemplate = await createTemplateHook({
        ...templateData,
        author: userId,
        organizationId: multiTenant ? organizationId : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      setState(prev => ({ ...prev, progress: 75 }))
      
      // Create initial version if versioning is enabled
      if (state.configuration.enableVersioning) {
        await createVersion(newTemplate.id, {
          number: '1.0.0',
          description: 'Initial version',
          author: userId
        })
      }
      
      setState(prev => ({
        ...prev,
        templates: [...prev.templates, newTemplate],
        selectedTemplate: newTemplate,
        progress: 100
      }))
      
      logEvent('template_created', { templateId: newTemplate.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create template'
      }))
      logEvent('template_create_failed', { error: error instanceof Error ? error.message : 'Unknown error', userId })
    } finally {
      setState(prev => ({ ...prev, isCreating: false, progress: 0 }))
    }
  }, [canCreateTemplate, state.configuration, validateTemplateHook, createTemplateHook, userId, multiTenant, organizationId, createVersion, logEvent])

  const handleTemplateUpdate = useCallback(async (templateId: string, updates: Partial<WorkflowTemplate>) => {
    if (!canEditTemplate) return

    try {
      setState(prev => ({ ...prev, isEditing: true, progress: 0 }))
      
      // Validate updates
      if (state.configuration.autoValidate) {
        const currentTemplate = state.templates.find(t => t.id === templateId)
        if (currentTemplate) {
          const updatedTemplate = { ...currentTemplate, ...updates }
          const validation = await validateTemplateHook(updatedTemplate)
          if (!validation.isValid) {
            setState(prev => ({ 
              ...prev, 
              error: 'Template validation failed: ' + validation.errors.join(', ') 
            }))
            return
          }
        }
      }
      
      setState(prev => ({ ...prev, progress: 25 }))
      
      const updatedTemplate = await updateTemplateHook(templateId, {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      })
      
      setState(prev => ({ ...prev, progress: 75 }))
      
      // Create new version if versioning is enabled
      if (state.configuration.enableVersioning && updates.content) {
        const currentVersion = state.versions.find(v => v.templateId === templateId && v.isActive)
        if (currentVersion) {
          const versionParts = currentVersion.number.split('.')
          const newPatch = parseInt(versionParts[2] || '0') + 1
          const newVersionNumber = `${versionParts[0]}.${versionParts[1]}.${newPatch}`
          
          await createVersion(templateId, {
            number: newVersionNumber,
            description: updates.description || 'Updated template',
            author: userId
          })
        }
      }
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === templateId ? updatedTemplate : t),
        selectedTemplate: updatedTemplate,
        progress: 100
      }))
      
      logEvent('template_updated', { templateId, userId, changes: Object.keys(updates) })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update template'
      }))
      logEvent('template_update_failed', { templateId, error: error instanceof Error ? error.message : 'Unknown error', userId })
    } finally {
      setState(prev => ({ ...prev, isEditing: false, progress: 0 }))
    }
  }, [canEditTemplate, state.configuration, state.templates, state.versions, validateTemplateHook, updateTemplateHook, userId, createVersion, logEvent])

  const handleTemplateDelete = useCallback(async (templateId: string) => {
    if (!canDeleteTemplate) return

    try {
      setState(prev => ({ ...prev, isDeleting: true }))
      
      await deleteTemplateHook(templateId)
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.id !== templateId),
        selectedTemplate: prev.selectedTemplate?.id === templateId ? null : prev.selectedTemplate
      }))
      
      logEvent('template_deleted', { templateId, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      }))
      logEvent('template_delete_failed', { templateId, error: error instanceof Error ? error.message : 'Unknown error', userId })
    } finally {
      setState(prev => ({ ...prev, isDeleting: false }))
    }
  }, [canDeleteTemplate, deleteTemplateHook, logEvent, userId])

  const handleTemplateClone = useCallback(async (template: WorkflowTemplate) => {
    try {
      const clonedTemplate = await cloneTemplateHook(template.id, {
        name: `${template.name} (Copy)`,
        author: userId
      })
      
      setState(prev => ({
        ...prev,
        templates: [...prev.templates, clonedTemplate],
        selectedTemplate: clonedTemplate
      }))
      
      logEvent('template_cloned', { originalId: template.id, clonedId: clonedTemplate.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clone template'
      }))
    }
  }, [cloneTemplateHook, userId, logEvent])

  const handleTemplateApply = useCallback(async (template: WorkflowTemplate) => {
    try {
      await applyTemplate(template.id, workflowId)
      onTemplateApplied?.(template)
      trackUsage(template.id, 'apply')
      logEvent('template_applied', { templateId: template.id, workflowId, userId })
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply template'
      }))
    }
  }, [workflowId, onTemplateApplied, trackUsage, logEvent, userId])

  const handleTemplateValidate = useCallback(async (template: WorkflowTemplate) => {
    try {
      setState(prev => ({ ...prev, isValidating: true }))
      
      const validation = await validateTemplateHook(template)
      
      setState(prev => ({
        ...prev,
        validationResults: [...prev.validationResults.filter(v => v.templateId !== template.id), validation]
      }))
      
      logEvent('template_validated', { templateId: template.id, isValid: validation.isValid, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to validate template'
      }))
    } finally {
      setState(prev => ({ ...prev, isValidating: false }))
    }
  }, [validateTemplateHook, logEvent, userId])

  const handleTemplateOptimize = useCallback(async (template: WorkflowTemplate) => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }))
      
      const optimizedTemplate = await optimizeTemplateHook(template.id)
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === template.id ? optimizedTemplate : t),
        selectedTemplate: optimizedTemplate
      }))
      
      logEvent('template_optimized', { templateId: template.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize template'
      }))
    } finally {
      setState(prev => ({ ...prev, isOptimizing: false }))
    }
  }, [optimizeTemplateHook, logEvent, userId])

  const handleTemplateFavorite = useCallback(async (template: WorkflowTemplate) => {
    try {
      await favoriteTemplate(template.id, !template.isFavorited)
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => 
          t.id === template.id ? { ...t, isFavorited: !t.isFavorited } : t
        )
      }))
      
      logEvent('template_favorited', { templateId: template.id, favorited: !template.isFavorited, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update favorite status'
      }))
    }
  }, [logEvent, userId])

  const handleTemplateRate = useCallback(async (template: WorkflowTemplate, rating: number) => {
    try {
      await rateTemplate(template.id, rating, userId)
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => 
          t.id === template.id ? { ...t, rating } : t
        )
      }))
      
      logEvent('template_rated', { templateId: template.id, rating, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to rate template'
      }))
    }
  }, [logEvent, userId])

  const handleTemplateImport = useCallback(async (file: File) => {
    try {
      setState(prev => ({ ...prev, isImporting: true, progress: 0 }))
      
      const importedTemplates = await importTemplate(file)
      
      setState(prev => ({
        ...prev,
        templates: [...prev.templates, ...importedTemplates],
        progress: 100
      }))
      
      logEvent('templates_imported', { count: importedTemplates.length, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import templates'
      }))
    } finally {
      setState(prev => ({ ...prev, isImporting: false, progress: 0 }))
    }
  }, [logEvent, userId])

  const handleTemplateExport = useCallback(async (templates: WorkflowTemplate[], format: string) => {
    try {
      setState(prev => ({ ...prev, isExporting: true, progress: 0 }))
      
      const exportData = await exportTemplate(templates.map(t => t.id), format)
      
      setState(prev => ({ ...prev, progress: 75 }))
      
      // Download the exported data
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 
              format === 'xml' ? 'application/xml' : 
              'text/plain'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `templates.${format}`
      a.click()
      URL.revokeObjectURL(url)
      
      setState(prev => ({ ...prev, progress: 100 }))
      
      logEvent('templates_exported', { count: templates.length, format, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export templates'
      }))
    } finally {
      setState(prev => ({ ...prev, isExporting: false, progress: 0 }))
    }
  }, [logEvent, userId])

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, currentPage: 1 }))
    if (query) {
      searchTemplatesHook(query)
    }
  }, [searchTemplatesHook])

  const handleFilterChange = useCallback((filterType: string, values: string[]) => {
    setState(prev => {
      const newState = { ...prev, currentPage: 1 }
      switch (filterType) {
        case 'categories':
          newState.selectedCategories = values
          break
        case 'types':
          newState.selectedTypes = values
          break
        case 'statuses':
          newState.selectedStatuses = values
          break
        case 'authors':
          newState.selectedAuthors = values
          break
        case 'tags':
          newState.selectedTags = values
          break
      }
      return newState
    })
  }, [])

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
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
          refreshTemplates(),
          refreshLibrary(),
          showAnalytics ? refreshAudit() : Promise.resolve()
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
  }, [organizationId, refreshTemplates, refreshLibrary, refreshAudit, showAnalytics])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      templates: templates || [],
      library: library || null,
      categories: categories || [],
      collections: collections || [],
      versions: versions || [],
      templateMetrics: analytics || null,
      usageStats: usageStats || [],
      recommendations: recommendations || [],
      auditLog: auditLog || [],
      cacheStats: cacheStats || {},
      syncStatus: syncStatus || {}
    }))
  }, [templates, library, categories, collections, versions, analytics, usageStats, recommendations, auditLog, cacheStats, syncStatus])

  useEffect(() => {
    // Auto-save configuration changes
    if (state.configuration.autoSave) {
      const timeoutId = setTimeout(() => {
        // Save configuration to backend
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [state.configuration])

  useEffect(() => {
    // Periodic sync if enabled
    if (state.configuration.enableVersioning && state.syncStatus.autoSync) {
      const intervalId = setInterval(() => {
        syncTemplatesHook()
      }, state.configuration.syncInterval * 1000)
      
      return () => clearInterval(intervalId)
    }
  }, [state.configuration, state.syncStatus, syncTemplatesHook])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Template Manager</h1>
        <Separator orientation="vertical" className="h-6" />
        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            {showAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search templates..."
            value={state.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={state.displayMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDisplayModeChange('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={state.displayMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDisplayModeChange('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {canCreateTemplate && (
          <Button onClick={() => handleTemplateCreate({})}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleTemplateExport(filteredTemplates, 'json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTemplateExport(filteredTemplates, 'yaml')}>
              Export as YAML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTemplateExport(filteredTemplates, 'xml')}>
              Export as XML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={() => uploaderRef.current?.click()}>
          <Upload className="h-4 w-4" />
        </Button>

        <input
          ref={uploaderRef}
          type="file"
          accept=".json,.yaml,.yml,.xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleTemplateImport(file)
            }
          }}
        />

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
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">{templateStatistics.total}</p>
              <p className="text-xs text-muted-foreground">templates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Public</p>
              <p className="text-2xl font-bold">{templateStatistics.public}</p>
              <p className="text-xs text-muted-foreground">shared</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">Favorited</p>
              <p className="text-2xl font-bold">{templateStatistics.favorited}</p>
              <p className="text-xs text-muted-foreground">by users</p>
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
              <p className="text-2xl font-bold">{templateStatistics.published}</p>
              <p className="text-xs text-muted-foreground">active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Usage</p>
              <p className="text-2xl font-bold">{formatTemplateUsage(templateStatistics.totalUsage)}</p>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Rating</p>
              <p className="text-2xl font-bold">{formatTemplateRating(templateStatistics.averageRating)}</p>
              <p className="text-xs text-muted-foreground">average</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTemplateCard = (template: WorkflowTemplate) => (
    <Card 
      key={template.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        state.selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleTemplateSelect(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Package className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base truncate">{template.name}</CardTitle>
              {template.isFavorited && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getTemplateStatusVariant(template.status)}>
                {template.status}
              </Badge>
              {template.isPublic && (
                <Badge variant="outline" className="text-green-600">
                  <Share2 className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
              {template.type && (
                <Badge variant="secondary">{template.type}</Badge>
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
              <DropdownMenuItem onClick={() => handleTemplateApply(template)}>
                <Play className="h-4 w-4 mr-2" />
                Apply Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTemplateClone(template)}>
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTemplateValidate(template)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTemplateOptimize(template)}>
                <Zap className="h-4 w-4 mr-2" />
                Optimize
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleTemplateFavorite(template)}>
                <Star className={`h-4 w-4 mr-2 ${template.isFavorited ? 'fill-current text-yellow-500' : ''}`} />
                {template.isFavorited ? 'Unfavorite' : 'Favorite'}
              </DropdownMenuItem>
              {canShareTemplate && (
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canEditTemplate && (
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDeleteTemplate && (
                <DropdownMenuItem 
                  onClick={() => handleTemplateDelete(template.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription className="text-sm line-clamp-2 mt-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Author and Date */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {template.author?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{template.author}</span>
            </div>
            <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{formatTemplateUsage(template.usageCount || 0)}</span>
            </div>
            {template.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{formatTemplateRating(template.rating)}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Database className="h-3 w-3" />
              <span>{formatTemplateSize(template.size || 0)}</span>
            </div>
          </div>

          {/* Progress bar for operations */}
          {(state.isCreating || state.isEditing || state.isValidating || state.isOptimizing) && 
           state.selectedTemplate?.id === template.id && state.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Processing...</span>
                <span>{state.progress}%</span>
              </div>
              <Progress value={state.progress} className="h-1" />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                handleTemplateApply(template)
              }}
              className="flex-1 mr-2"
            >
              Apply
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                // Handle view details
              }}
            >
              <Eye className="h-4 w-4" />
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
          {/* Gallery View */}
          <TabsContent value="gallery" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              {renderStatisticsCards()}
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                <div className="lg:col-span-3">
                  <ScrollArea className="h-[calc(100vh-400px)]" ref={galleryRef}>
                    {state.displayMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedTemplates.map(renderTemplateCard)}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paginatedTemplates.map(renderTemplateCard)}
                      </div>
                    )}
                    
                    {/* Pagination */}
                    {filteredTemplates.length > state.pageSize && (
                      <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(state.currentPage - 1)}
                            disabled={state.currentPage <= 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {state.currentPage} of {Math.ceil(filteredTemplates.length / state.pageSize)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(state.currentPage + 1)}
                            disabled={state.currentPage >= Math.ceil(filteredTemplates.length / state.pageSize)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                <div className="space-y-4">
                  {/* Filters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Status</Label>
                        <Select onValueChange={(value) => handleFilterChange('statuses', [value])}>
                          <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Category</Label>
                        <Select onValueChange={(value) => handleFilterChange('categories', [value])}>
                          <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {state.categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Sort By</Label>
                        <Select value={state.sortBy} onValueChange={(value) => handleSortChange(value, state.sortOrder)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="created">Created Date</SelectItem>
                            <SelectItem value="updated">Updated Date</SelectItem>
                            <SelectItem value="usage">Usage Count</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Visibility</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="show-public"
                              checked={state.showPublic}
                              onCheckedChange={(checked) => 
                                setState(prev => ({ ...prev, showPublic: checked as boolean }))
                              }
                            />
                            <Label htmlFor="show-public" className="text-sm">Public</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="show-private"
                              checked={state.showPrivate}
                              onCheckedChange={(checked) => 
                                setState(prev => ({ ...prev, showPrivate: checked as boolean }))
                              }
                            />
                            <Label htmlFor="show-private" className="text-sm">Private</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="show-favorites"
                              checked={state.showFavorites}
                              onCheckedChange={(checked) => 
                                setState(prev => ({ ...prev, showFavorites: checked as boolean }))
                              }
                            />
                            <Label htmlFor="show-favorites" className="text-sm">Favorites Only</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Selected Template Details */}
                  {state.selectedTemplate && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Template Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label>Name</Label>
                            <p className="text-sm font-medium">{state.selectedTemplate.name}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Badge variant={getTemplateStatusVariant(state.selectedTemplate.status)}>
                              {state.selectedTemplate.status}
                            </Badge>
                          </div>
                          <div>
                            <Label>Author</Label>
                            <p className="text-sm">{state.selectedTemplate.author}</p>
                          </div>
                          <div>
                            <Label>Created</Label>
                            <p className="text-sm">{new Date(state.selectedTemplate.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label>Updated</Label>
                            <p className="text-sm">{new Date(state.selectedTemplate.updatedAt).toLocaleDateString()}</p>
                          </div>
                          {state.selectedTemplate.description && (
                            <div>
                              <Label>Description</Label>
                              <p className="text-sm text-muted-foreground">
                                {state.selectedTemplate.description}
                              </p>
                            </div>
                          )}
                          {state.selectedTemplate.rating && (
                            <div>
                              <Label>Rating</Label>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= (state.selectedTemplate?.rating || 0)
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm">
                                  {formatTemplateRating(state.selectedTemplate.rating)}
                                </span>
                              </div>
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
          <TabsContent value="editor" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Editor</CardTitle>
                  <CardDescription>
                    Create and edit workflow templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 border rounded-md p-4">
                    <p className="text-muted-foreground text-center">Template editor will be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add other tab contents as needed */}
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isLoading || state.isCreating || state.isEditing || state.isDeleting || state.isImporting || state.isExporting || state.isValidating || state.isOptimizing) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <p className="font-medium">
                {state.isLoading ? 'Loading templates...' :
                 state.isCreating ? 'Creating template...' :
                 state.isEditing ? 'Updating template...' :
                 state.isDeleting ? 'Deleting template...' :
                 state.isImporting ? 'Importing templates...' :
                 state.isExporting ? 'Exporting templates...' :
                 state.isValidating ? 'Validating template...' :
                 'Optimizing template...'}
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

      {/* Warnings */}
      {state.warnings.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 space-y-2">
          {state.warnings.map((warning, index) => (
            <Alert key={index} variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkflowTemplateManager