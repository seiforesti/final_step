/**
 * Advanced Framework Manager Component - Version 1 (Manual & Rule-Based)
 * Enterprise-grade classification framework management with sophisticated UI
 * Comprehensive framework lifecycle management and intelligent workflow orchestration
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Settings, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Copy, 
  Play, 
  Pause, 
  BarChart3, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  Tag, 
  Shield, 
  Database,
  TrendingUp,
  Activity,
  Calendar,
  Target,
  Zap,
  Brain,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

import {
  ClassificationFramework,
  ClassificationStatus,
  ClassificationScope,
  SensitivityLevel,
  FilterParams,
  SortParams,
  PaginationParams,
  ValidationResult,
  BaseComponentProps,
  LoadingState,
  ViewMode
} from '../core/types'

import { ClassificationApi } from '../core/api/classificationApi'
import { useClassificationState } from '../core/hooks/useClassificationState'
import { useRealTimeMonitoring } from '../core/hooks/useRealTimeMonitoring'

// UI Components (assuming shadcn/ui structure)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface FrameworkManagerProps extends BaseComponentProps {
  onFrameworkSelect?: (framework: ClassificationFramework) => void
  onFrameworkCreate?: (framework: ClassificationFramework) => void
  onFrameworkUpdate?: (framework: ClassificationFramework) => void
  onFrameworkDelete?: (frameworkId: number) => void
  selectedFrameworkId?: number
  viewMode?: ViewMode
  enableBulkOperations?: boolean
  enableAdvancedFiltering?: boolean
  enableRealTimeUpdates?: boolean
  showAnalytics?: boolean
  customActions?: FrameworkAction[]
}

interface FrameworkAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  handler: (framework: ClassificationFramework) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  disabled?: (framework: ClassificationFramework) => boolean
  tooltip?: string
}

interface FrameworkFilters {
  search: string
  status: ClassificationStatus[]
  scope: ClassificationScope[]
  domain: string[]
  category: string[]
  sensitivityLevel: SensitivityLevel[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  customFilters: FilterParams[]
}

interface FrameworkStats {
  total: number
  active: number
  inactive: number
  draft: number
  avgAccuracy: number
  totalRules: number
  totalClassifications: number
  complianceScore: number
}

interface CreateFrameworkData {
  name: string
  description: string
  domain: string
  category: string
  scope: ClassificationScope
  tags: string[]
  configuration: {
    auto_apply: boolean
    require_approval: boolean
    notification_enabled: boolean
    audit_enabled: boolean
  }
}

interface BulkOperation {
  operation: 'activate' | 'deactivate' | 'delete' | 'export' | 'duplicate'
  frameworkIds: number[]
  progress: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  results?: any
}

// ============================================================================
// FRAMEWORK MANAGER COMPONENT
// ============================================================================

export const FrameworkManager: React.FC<FrameworkManagerProps> = ({
  onFrameworkSelect,
  onFrameworkCreate,
  onFrameworkUpdate,
  onFrameworkDelete,
  selectedFrameworkId,
  viewMode = 'table',
  enableBulkOperations = true,
  enableAdvancedFiltering = true,
  enableRealTimeUpdates = true,
  showAnalytics = true,
  customActions = [],
  className,
  loading: externalLoading,
  disabled,
  ...props
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [frameworks, setFrameworks] = useState<ClassificationFramework[]>([])
  const [filteredFrameworks, setFilteredFrameworks] = useState<ClassificationFramework[]>([])
  const [selectedFrameworks, setSelectedFrameworks] = useState<Set<number>>(new Set())
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  
  // Filter and search state
  const [filters, setFilters] = useState<FrameworkFilters>({
    search: '',
    status: [],
    scope: [],
    domain: [],
    category: [],
    sensitivityLevel: [],
    dateRange: { start: null, end: null },
    customFilters: []
  })
  
  // Pagination and sorting
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    total: 0
  })
  
  const [sorting, setSorting] = useState<SortParams[]>([
    { field: 'updated_at', direction: 'desc' }
  ])
  
  // UI state
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showBulkPanel, setShowBulkPanel] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [expandedFramework, setExpandedFramework] = useState<number | null>(null)
  
  // Create framework state
  const [createFormData, setCreateFormData] = useState<CreateFrameworkData>({
    name: '',
    description: '',
    domain: '',
    category: '',
    scope: ClassificationScope.GLOBAL,
    tags: [],
    configuration: {
      auto_apply: false,
      require_approval: true,
      notification_enabled: true,
      audit_enabled: true
    }
  })
  
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  
  // Bulk operations state
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null)
  
  // Analytics state
  const [stats, setStats] = useState<FrameworkStats>({
    total: 0,
    active: 0,
    inactive: 0,
    draft: 0,
    avgAccuracy: 0,
    totalRules: 0,
    totalClassifications: 0,
    complianceScore: 0
  })

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // API client
  const apiClient = useMemo(() => new ClassificationApi(), [])

  // Hooks
  const { 
    state: classificationState, 
    updateFramework, 
    deleteFramework: removeFramework 
  } = useClassificationState()
  
  const { isConnected, lastUpdate } = useRealTimeMonitoring(enableRealTimeUpdates)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isLoading = loadingState === 'loading' || externalLoading
  const hasSelection = selectedFrameworks.size > 0
  const isAllSelected = frameworks.length > 0 && selectedFrameworks.size === frameworks.length
  const isPartiallySelected = hasSelection && !isAllSelected

  const availableDomains = useMemo(() => {
    const domains = frameworks.map(f => f.domain).filter(Boolean)
    return Array.from(new Set(domains)).sort()
  }, [frameworks])

  const availableCategories = useMemo(() => {
    const categories = frameworks.map(f => f.category).filter(Boolean)
    return Array.from(new Set(categories)).sort()
  }, [frameworks])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.status.length > 0) count++
    if (filters.scope.length > 0) count++
    if (filters.domain.length > 0) count++
    if (filters.category.length > 0) count++
    if (filters.sensitivityLevel.length > 0) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.customFilters.length > 0) count += filters.customFilters.length
    return count
  }, [filters])

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchFrameworks = useCallback(async (force = false) => {
    if (isLoading && !force) return

    try {
      setLoadingState('loading')
      setError(null)

      const params = {
        pagination,
        sort: sorting,
        filters: buildApiFilters(),
        search: filters.search ? { query: filters.search } : undefined,
        include_inactive: true
      }

      const response = await apiClient.frameworks.getFrameworks(params)
      
      if (response.success) {
        setFrameworks(response.data)
        setPagination(prev => ({ ...prev, total: response.pagination?.total || 0 }))
        updateStats(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch frameworks')
      }

      setLoadingState('success')
    } catch (err: any) {
      setError(err.message)
      setLoadingState('error')
    }
  }, [pagination, sorting, filters, apiClient])

  const buildApiFilters = useCallback((): FilterParams[] => {
    const apiFilters: FilterParams[] = []

    if (filters.status.length > 0) {
      apiFilters.push({
        field: 'status',
        operator: 'in',
        value: filters.status
      })
    }

    if (filters.scope.length > 0) {
      apiFilters.push({
        field: 'scope',
        operator: 'in',
        value: filters.scope
      })
    }

    if (filters.domain.length > 0) {
      apiFilters.push({
        field: 'domain',
        operator: 'in',
        value: filters.domain
      })
    }

    if (filters.category.length > 0) {
      apiFilters.push({
        field: 'category',
        operator: 'in',
        value: filters.category
      })
    }

    if (filters.dateRange.start) {
      apiFilters.push({
        field: 'created_at',
        operator: 'gte',
        value: filters.dateRange.start.toISOString()
      })
    }

    if (filters.dateRange.end) {
      apiFilters.push({
        field: 'created_at',
        operator: 'lte',
        value: filters.dateRange.end.toISOString()
      })
    }

    return [...apiFilters, ...filters.customFilters]
  }, [filters])

  const updateStats = useCallback((frameworkData: ClassificationFramework[]) => {
    const newStats: FrameworkStats = {
      total: frameworkData.length,
      active: frameworkData.filter(f => f.status === ClassificationStatus.ACTIVE).length,
      inactive: frameworkData.filter(f => f.status === ClassificationStatus.INACTIVE).length,
      draft: frameworkData.filter(f => f.status === ClassificationStatus.DRAFT).length,
      avgAccuracy: frameworkData.reduce((acc, f) => acc + (f.accuracy_score || 0), 0) / frameworkData.length,
      totalRules: frameworkData.reduce((acc, f) => acc + f.rules_count, 0),
      totalClassifications: frameworkData.reduce((acc, f) => acc + f.applied_count, 0),
      complianceScore: frameworkData.filter(f => f.compliance_status === 'compliant').length / frameworkData.length * 100
    }
    setStats(newStats)
  }, [])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleFilterChange = useCallback(<K extends keyof FrameworkFilters>(
    key: K,
    value: FrameworkFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleSortChange = useCallback((field: string) => {
    setSorting(prev => {
      const existing = prev.find(s => s.field === field)
      if (existing) {
        return prev.map(s => 
          s.field === field 
            ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
            : s
        )
      }
      return [{ field, direction: 'asc' }, ...prev.filter(s => s.field !== field)]
    })
  }, [])

  const handleFrameworkSelect = useCallback((framework: ClassificationFramework) => {
    onFrameworkSelect?.(framework)
  }, [onFrameworkSelect])

  const handleFrameworkToggleSelection = useCallback((frameworkId: number) => {
    setSelectedFrameworks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(frameworkId)) {
        newSet.delete(frameworkId)
      } else {
        newSet.add(frameworkId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedFrameworks(new Set())
    } else {
      setSelectedFrameworks(new Set(frameworks.map(f => f.id)))
    }
  }, [frameworks, isAllSelected])

  const handleCreateFramework = useCallback(async () => {
    try {
      setIsCreating(true)
      setCreateFormErrors({})

      // Validate form
      const errors: Record<string, string> = {}
      if (!createFormData.name.trim()) errors.name = 'Name is required'
      if (!createFormData.description.trim()) errors.description = 'Description is required'
      if (!createFormData.domain.trim()) errors.domain = 'Domain is required'
      if (!createFormData.category.trim()) errors.category = 'Category is required'

      if (Object.keys(errors).length > 0) {
        setCreateFormErrors(errors)
        return
      }

      const response = await apiClient.frameworks.createFramework({
        ...createFormData,
        status: ClassificationStatus.DRAFT,
        scope: createFormData.scope,
        rules_count: 0,
        policies_count: 0,
        applied_count: 0,
        compliance_status: 'pending',
        business_impact: {
          cost_reduction: 0,
          time_savings: 0,
          accuracy_improvement: 0
        }
      })

      if (response.success) {
        const newFramework = response.data
        setFrameworks(prev => [newFramework, ...prev])
        onFrameworkCreate?.(newFramework)
        setShowCreateDialog(false)
        resetCreateForm()
        
        // Show success notification
        // toast.success(`Framework "${newFramework.name}" created successfully`)
      } else {
        throw new Error(response.message || 'Failed to create framework')
      }

    } catch (err: any) {
      setError(err.message)
      // toast.error(`Failed to create framework: ${err.message}`)
    } finally {
      setIsCreating(false)
    }
  }, [createFormData, apiClient, onFrameworkCreate])

  const resetCreateForm = useCallback(() => {
    setCreateFormData({
      name: '',
      description: '',
      domain: '',
      category: '',
      scope: ClassificationScope.GLOBAL,
      tags: [],
      configuration: {
        auto_apply: false,
        require_approval: true,
        notification_enabled: true,
        audit_enabled: true
      }
    })
    setCreateFormErrors({})
  }, [])

  const handleFrameworkAction = useCallback(async (
    action: string, 
    framework: ClassificationFramework
  ) => {
    try {
      setLoadingState('loading')

      switch (action) {
        case 'edit':
          // Handle edit action
          break
        
        case 'duplicate':
          const duplicateResponse = await apiClient.frameworks.duplicateFramework(
            framework.id, 
            `${framework.name} (Copy)`
          )
          if (duplicateResponse.success) {
            fetchFrameworks(true)
          }
          break
          
        case 'toggle_status':
          const newStatus = framework.status === ClassificationStatus.ACTIVE 
            ? ClassificationStatus.INACTIVE 
            : ClassificationStatus.ACTIVE
            
          const toggleResponse = await apiClient.frameworks.toggleFrameworkStatus(
            framework.id, 
            newStatus === ClassificationStatus.ACTIVE
          )
          if (toggleResponse.success) {
            updateFramework(toggleResponse.data)
          }
          break
          
        case 'delete':
          const deleteResponse = await apiClient.frameworks.deleteFramework(framework.id)
          if (deleteResponse.success) {
            removeFramework(framework.id)
            onFrameworkDelete?.(framework.id)
          }
          break
          
        case 'export':
          const exportResponse = await apiClient.frameworks.exportFramework(framework.id)
          if (exportResponse.success) {
            // Handle export download
            const blob = new Blob([JSON.stringify(exportResponse.data, null, 2)], {
              type: 'application/json'
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `framework-${framework.name.toLowerCase().replace(/\s+/g, '-')}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
          break
          
        case 'analytics':
          // Navigate to analytics view
          break
          
        default:
          // Handle custom actions
          const customAction = customActions.find(a => a.id === action)
          if (customAction) {
            customAction.handler(framework)
          }
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingState('success')
    }
  }, [apiClient, updateFramework, removeFramework, onFrameworkDelete, customActions, fetchFrameworks])

  const handleBulkOperation = useCallback(async (operation: string) => {
    if (selectedFrameworks.size === 0) return

    try {
      setBulkOperation({
        operation: operation as any,
        frameworkIds: Array.from(selectedFrameworks),
        progress: 0,
        status: 'running'
      })

      const frameworkIds = Array.from(selectedFrameworks)
      
      switch (operation) {
        case 'activate':
          for (const id of frameworkIds) {
            await apiClient.frameworks.toggleFrameworkStatus(id, true)
          }
          break
          
        case 'deactivate':
          for (const id of frameworkIds) {
            await apiClient.frameworks.toggleFrameworkStatus(id, false)
          }
          break
          
        case 'delete':
          for (const id of frameworkIds) {
            await apiClient.frameworks.deleteFramework(id)
          }
          break
          
        case 'export':
          // Handle bulk export
          break
      }

      setBulkOperation(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null)
      setSelectedFrameworks(new Set())
      fetchFrameworks(true)

    } catch (err: any) {
      setBulkOperation(prev => prev ? { ...prev, status: 'failed' } : null)
      setError(err.message)
    }
  }, [selectedFrameworks, apiClient, fetchFrameworks])

  const handleImportFramework = useCallback(async (file: File) => {
    try {
      setLoadingState('loading')
      
      const response = await apiClient.frameworks.importFramework(file)
      if (response.success) {
        fetchFrameworks(true)
        // toast.success('Framework imported successfully')
      } else {
        throw new Error(response.message || 'Import failed')
      }
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingState('success')
    }
  }, [apiClient, fetchFrameworks])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchFrameworks()
  }, [fetchFrameworks])

  useEffect(() => {
    const filtered = frameworks.filter(framework => {
      // Apply client-side filtering for better UX
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          framework.name.toLowerCase().includes(searchLower) ||
          framework.description.toLowerCase().includes(searchLower) ||
          framework.domain.toLowerCase().includes(searchLower) ||
          framework.category.toLowerCase().includes(searchLower) ||
          framework.tags.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }

      return true
    })

    setFilteredFrameworks(filtered)
  }, [frameworks, filters.search])

  useEffect(() => {
    if (enableRealTimeUpdates && lastUpdate) {
      // Handle real-time updates
      fetchFrameworks(true)
    }
  }, [enableRealTimeUpdates, lastUpdate, fetchFrameworks])

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFrameworkCard = (framework: ClassificationFramework) => (
    <Card 
      key={framework.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        selectedFrameworkId === framework.id ? 'ring-2 ring-primary' : ''
      } ${disabled ? 'opacity-50' : ''}`}
      onClick={() => !disabled && handleFrameworkSelect(framework)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {enableBulkOperations && (
              <Checkbox
                checked={selectedFrameworks.has(framework.id)}
                onCheckedChange={() => handleFrameworkToggleSelection(framework.id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div>
              <CardTitle className="text-lg">{framework.name}</CardTitle>
              <CardDescription className="mt-1">
                {framework.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {renderFrameworkStatusBadge(framework)}
            <FrameworkActionsMenu 
              framework={framework} 
              onAction={handleFrameworkAction}
              customActions={customActions}
              disabled={disabled}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{framework.rules_count}</div>
            <div className="text-sm text-muted-foreground">Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{framework.applied_count}</div>
            <div className="text-sm text-muted-foreground">Applied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {framework.accuracy_score ? `${Math.round(framework.accuracy_score * 100)}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {renderComplianceIcon(framework.compliance_status)}
            </div>
            <div className="text-sm text-muted-foreground">Compliance</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{framework.domain}</Badge>
          <Badge variant="outline">{framework.category}</Badge>
          <Badge variant="secondary">{framework.scope}</Badge>
          {framework.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {framework.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{framework.tags.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(framework.updated_at).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {framework.created_by}
            </span>
          </div>
          {framework.business_impact && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">
                ${framework.business_impact.cost_reduction.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderFrameworkRow = (framework: ClassificationFramework) => (
    <TableRow 
      key={framework.id}
      className={`cursor-pointer hover:bg-muted/50 ${
        selectedFrameworkId === framework.id ? 'bg-muted' : ''
      } ${disabled ? 'opacity-50' : ''}`}
      onClick={() => !disabled && handleFrameworkSelect(framework)}
    >
      {enableBulkOperations && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedFrameworks.has(framework.id)}
            onCheckedChange={() => handleFrameworkToggleSelection(framework.id)}
          />
        </TableCell>
      )}
      <TableCell>
        <div>
          <div className="font-medium">{framework.name}</div>
          <div className="text-sm text-muted-foreground truncate max-w-xs">
            {framework.description}
          </div>
        </div>
      </TableCell>
      <TableCell>{renderFrameworkStatusBadge(framework)}</TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <Badge variant="outline" className="w-fit">{framework.domain}</Badge>
          <Badge variant="outline" className="w-fit">{framework.category}</Badge>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{framework.scope}</Badge>
      </TableCell>
      <TableCell className="text-center">{framework.rules_count}</TableCell>
      <TableCell className="text-center">{framework.applied_count}</TableCell>
      <TableCell className="text-center">
        {framework.accuracy_score ? `${Math.round(framework.accuracy_score * 100)}%` : 'N/A'}
      </TableCell>
      <TableCell className="text-center">
        {renderComplianceIcon(framework.compliance_status)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(framework.updated_at).toLocaleDateString()}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <FrameworkActionsMenu 
          framework={framework} 
          onAction={handleFrameworkAction}
          customActions={customActions}
          disabled={disabled}
        />
      </TableCell>
    </TableRow>
  )

  const renderFrameworkStatusBadge = (framework: ClassificationFramework) => {
    const statusConfig = {
      [ClassificationStatus.ACTIVE]: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        label: 'Active' 
      },
      [ClassificationStatus.INACTIVE]: { 
        variant: 'secondary' as const, 
        icon: Pause, 
        label: 'Inactive' 
      },
      [ClassificationStatus.DRAFT]: { 
        variant: 'outline' as const, 
        icon: Edit3, 
        label: 'Draft' 
      },
      [ClassificationStatus.DEPRECATED]: { 
        variant: 'destructive' as const, 
        icon: AlertCircle, 
        label: 'Deprecated' 
      },
      [ClassificationStatus.TESTING]: { 
        variant: 'outline' as const, 
        icon: Clock, 
        label: 'Testing' 
      }
    }

    const config = statusConfig[framework.status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const renderComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'non_compliant':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================

  const FrameworkActionsMenu: React.FC<{
    framework: ClassificationFramework
    onAction: (action: string, framework: ClassificationFramework) => void
    customActions: FrameworkAction[]
    disabled?: boolean
  }> = ({ framework, onAction, customActions, disabled }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => onAction('edit', framework)}>
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Framework
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('duplicate', framework)}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('toggle_status', framework)}>
          {framework.status === ClassificationStatus.ACTIVE ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onAction('analytics', framework)}>
          <BarChart3 className="w-4 h-4 mr-2" />
          View Analytics
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('export', framework)}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </DropdownMenuItem>
        
        {customActions.map(action => (
          <DropdownMenuItem 
            key={action.id}
            onClick={() => onAction(action.id, framework)}
            disabled={action.disabled?.(framework)}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onAction('delete', framework)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`} {...props}>
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Classification Frameworks</h2>
            <p className="text-muted-foreground">
              Manage and orchestrate your classification frameworks with enterprise-grade controls
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {enableRealTimeUpdates && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted">
                    <Activity className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="text-sm">
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Real-time updates {isConnected ? 'enabled' : 'disabled'}
                </TooltipContent>
              </Tooltip>
            )}
            
            <Button variant="outline" onClick={() => fetchFrameworks(true)} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={() => setShowCreateDialog(true)} disabled={disabled}>
              <Plus className="w-4 h-4 mr-2" />
              Create Framework
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        {showAnalytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">Inactive</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(stats.avgAccuracy * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Accuracy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.totalRules}</div>
                <div className="text-sm text-muted-foreground">Total Rules</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.totalClassifications}</div>
                <div className="text-sm text-muted-foreground">Classifications</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(stats.complianceScore)}%
                </div>
                <div className="text-sm text-muted-foreground">Compliance</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search frameworks..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <Select
              value={filters.status.length === 1 ? filters.status[0] : ''}
              onValueChange={(value) => 
                handleFilterChange('status', value ? [value as ClassificationStatus] : [])
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value={ClassificationStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={ClassificationStatus.INACTIVE}>Inactive</SelectItem>
                <SelectItem value={ClassificationStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={ClassificationStatus.TESTING}>Testing</SelectItem>
                <SelectItem value={ClassificationStatus.DEPRECATED}>Deprecated</SelectItem>
              </SelectContent>
            </Select>

            {enableAdvancedFiltering && (
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={currentViewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentViewMode('table')}
              className="rounded-r-none"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentViewMode('grid')}
              className="rounded-l-none"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Bulk Actions */}
          {enableBulkOperations && hasSelection && (
            <Button
              variant="outline"
              onClick={() => setShowBulkPanel(true)}
            >
              <span className="mr-2">{selectedFrameworks.size} selected</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}

          {/* Import/Export */}
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.yaml,.yml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleImportFramework(file)
                  e.target.value = ''
                }
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import Framework</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && enableAdvancedFiltering && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Domain Filter */}
                <div>
                  <Label>Domain</Label>
                  <Select
                    value={filters.domain.length === 1 ? filters.domain[0] : ''}
                    onValueChange={(value) => 
                      handleFilterChange('domain', value ? [value] : [])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Domains</SelectItem>
                      {availableDomains.map(domain => (
                        <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <Label>Category</Label>
                  <Select
                    value={filters.category.length === 1 ? filters.category[0] : ''}
                    onValueChange={(value) => 
                      handleFilterChange('category', value ? [value] : [])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {availableCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scope Filter */}
                <div>
                  <Label>Scope</Label>
                  <Select
                    value={filters.scope.length === 1 ? filters.scope[0] : ''}
                    onValueChange={(value) => 
                      handleFilterChange('scope', value ? [value as ClassificationScope] : [])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Scopes</SelectItem>
                      <SelectItem value={ClassificationScope.GLOBAL}>Global</SelectItem>
                      <SelectItem value={ClassificationScope.DOMAIN}>Domain</SelectItem>
                      <SelectItem value={ClassificationScope.DATASET}>Dataset</SelectItem>
                      <SelectItem value={ClassificationScope.FIELD}>Field</SelectItem>
                      <SelectItem value={ClassificationScope.RECORD}>Record</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      search: '',
                      status: [],
                      scope: [],
                      domain: [],
                      category: [],
                      sensitivityLevel: [],
                      dateRange: { start: null, end: null },
                      customFilters: []
                    })
                  }}
                >
                  Clear Filters
                </Button>
                
                <Button onClick={() => setShowAdvancedFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && frameworks.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No frameworks found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first classification framework
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Framework
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          {!isLoading && frameworks.length > 0 && (
            <>
              {currentViewMode === 'grid' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredFrameworks.map(renderFrameworkCard)}
                </div>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {enableBulkOperations && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={isAllSelected}
                              indeterminate={isPartiallySelected}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                        )}
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSortChange('name')}
                        >
                          <div className="flex items-center">
                            Name
                            <ArrowUpDown className="w-4 h-4 ml-1" />
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Domain/Category</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead className="text-center">Rules</TableHead>
                        <TableHead className="text-center">Applied</TableHead>
                        <TableHead className="text-center">Accuracy</TableHead>
                        <TableHead className="text-center">Compliance</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSortChange('updated_at')}
                        >
                          <div className="flex items-center">
                            Updated
                            <ArrowUpDown className="w-4 h-4 ml-1" />
                          </div>
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFrameworks.map(renderFrameworkRow)}
                    </TableBody>
                  </Table>
                </Card>
              )}

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} frameworks
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Framework Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Classification Framework</DialogTitle>
              <DialogDescription>
                Create a new framework to organize your classification rules and policies
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter framework name"
                    className={createFormErrors.name ? 'border-red-500' : ''}
                  />
                  {createFormErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{createFormErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="domain">Domain *</Label>
                  <Input
                    id="domain"
                    value={createFormData.domain}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="e.g., Finance, Healthcare"
                    className={createFormErrors.domain ? 'border-red-500' : ''}
                  />
                  {createFormErrors.domain && (
                    <p className="text-sm text-red-500 mt-1">{createFormErrors.domain}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and scope of this framework"
                  className={createFormErrors.description ? 'border-red-500' : ''}
                />
                {createFormErrors.description && (
                  <p className="text-sm text-red-500 mt-1">{createFormErrors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Data Privacy, Security"
                    className={createFormErrors.category ? 'border-red-500' : ''}
                  />
                  {createFormErrors.category && (
                    <p className="text-sm text-red-500 mt-1">{createFormErrors.category}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <Select
                    value={createFormData.scope}
                    onValueChange={(value) => 
                      setCreateFormData(prev => ({ ...prev, scope: value as ClassificationScope }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ClassificationScope.GLOBAL}>Global</SelectItem>
                      <SelectItem value={ClassificationScope.DOMAIN}>Domain</SelectItem>
                      <SelectItem value={ClassificationScope.DATASET}>Dataset</SelectItem>
                      <SelectItem value={ClassificationScope.FIELD}>Field</SelectItem>
                      <SelectItem value={ClassificationScope.RECORD}>Record</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Configuration</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-normal">Auto-apply classifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically apply classifications when conditions are met
                      </p>
                    </div>
                    <Switch
                      checked={createFormData.configuration.auto_apply}
                      onCheckedChange={(checked) =>
                        setCreateFormData(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration, auto_apply: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-normal">Require approval</Label>
                      <p className="text-xs text-muted-foreground">
                        Classifications require manual approval before being applied
                      </p>
                    </div>
                    <Switch
                      checked={createFormData.configuration.require_approval}
                      onCheckedChange={(checked) =>
                        setCreateFormData(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration, require_approval: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-normal">Enable notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Send notifications for classification events
                      </p>
                    </div>
                    <Switch
                      checked={createFormData.configuration.notification_enabled}
                      onCheckedChange={(checked) =>
                        setCreateFormData(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration, notification_enabled: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-normal">Enable audit logging</Label>
                      <p className="text-xs text-muted-foreground">
                        Log all classification activities for compliance
                      </p>
                    </div>
                    <Switch
                      checked={createFormData.configuration.audit_enabled}
                      onCheckedChange={(checked) =>
                        setCreateFormData(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration, audit_enabled: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  resetCreateForm()
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFramework}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Framework'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Operations Panel */}
        {showBulkPanel && (
          <Sheet open={showBulkPanel} onOpenChange={setShowBulkPanel}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Bulk Operations</SheetTitle>
                <SheetDescription>
                  Perform actions on {selectedFrameworks.size} selected frameworks
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-4 mt-6">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleBulkOperation('activate')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Activate Selected
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleBulkOperation('deactivate')}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Deactivate Selected
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleBulkOperation('export')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                
                <Separator />
                
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => handleBulkOperation('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
              
              {bulkOperation && (
                <div className="mt-6 p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {bulkOperation.operation.charAt(0).toUpperCase() + bulkOperation.operation.slice(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {bulkOperation.status}
                    </span>
                  </div>
                  <Progress value={bulkOperation.progress} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Processing {bulkOperation.frameworkIds.length} frameworks
                  </p>
                </div>
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </TooltipProvider>
  )
}

export default FrameworkManager