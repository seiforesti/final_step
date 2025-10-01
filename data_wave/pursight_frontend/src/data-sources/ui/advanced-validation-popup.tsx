"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowVisualizer } from "./workflow-visualizer"
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap, 
  Brain, 
  Shield, 
  Target,
  TrendingUp,
  Activity,
  Database,
  FileText,
  Users,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Info,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
  Wand2,
  Rocket,
  Star
} from "lucide-react"

// Import the original interfaces from the old popup
export interface ValidationItem {
  id: string
  displayId: string
  name: string
  type: string
  schema?: string
  table?: string
  column?: string
  item?: any
  confidence?: number
  risk?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'pending' | 'validating' | 'validated' | 'failed'
  conflicts?: string[]
  recommendations?: string[]
}

export interface ValidationResult {
  items: ValidationItem[]
  auto_resolvable: ValidationItem[]
  recommendations: ValidationItem[]
  new_items: ValidationItem[]
  conflicts: ValidationItem[]
  metrics: {
    total: number
    autoResolvable: number
    recommendations: number
    newItems: number
    conflicts: number
    successRate: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
  }
}

export interface WorkflowState {
  mode: 'manual' | 'semi_auto' | 'full_auto'
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  progress: number
  selectedItems: ValidationItem[]
  processingItems: ValidationItem[]
  completedItems: ValidationItem[]
  failedItems: ValidationItem[]
}

export interface AdvancedValidationOrchestratorProps {
  isOpen: boolean
  onClose: () => void
  validationResult: ValidationResult | null
  onConfirm: (action: 'replace' | 'add_new' | 'cancel', selectedItems: any[], workflowOptions?: any) => void
  onApplyRecommendations: (recommendations: any[], automationMode?: string) => void
  onCatalogItems?: (items: ValidationItem[]) => void
  onStartWorkflow?: (mode: 'manual' | 'semi_auto' | 'full_auto') => void
  onPauseWorkflow?: () => void
  onResumeWorkflow?: () => void
  onResetWorkflow?: () => void
  workflowState?: WorkflowState
  isLoading?: boolean
  error?: string | null
}

export function AdvancedValidationOrchestrator({
  isOpen,
  onClose,
  validationResult,
  onConfirm,
  onApplyRecommendations,
  onCatalogItems,
  onStartWorkflow,
  onPauseWorkflow,
  onResumeWorkflow,
  onResetWorkflow,
  workflowState = {
    mode: 'manual',
    status: 'idle',
    currentStep: 0,
    totalSteps: 5,
    progress: 0,
    selectedItems: [],
    processingItems: [],
    completedItems: [],
    failedItems: []
  },
  isLoading = false,
  error = null
}: AdvancedValidationOrchestratorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'risk' | 'confidence'>('name')
  const [showWorkflowVisualizer, setShowWorkflowVisualizer] = useState(false)
  const [workflowMode, setWorkflowMode] = useState<'manual' | 'semi_auto' | 'full_auto'>('manual')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true)
  const [visualizerItems, setVisualizerItems] = useState<{
    id: string; name: string; type: string; priority: number; item: any
  }[]>([])
  // Local workflow runner to drive the visualizer regardless of external workflowState
  const [internalRunning, setInternalRunning] = useState(false)
  const [internalStep, setInternalStep] = useState(0)
  const stepTimerRef = useRef<number | null>(null)
  
  // Performance optimization: Memoize filtered and sorted items
  const processedItems = useMemo(() => {
    if (!validationResult) return []
    
    let items = [...validationResult.items]
    
    // Filter by search term
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.schema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.table?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by type
    if (filterType !== 'all') {
      items = items.filter(item => item.type === filterType)
    }
    
    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'risk':
          const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return (riskOrder[b.risk || 'low'] || 0) - (riskOrder[a.risk || 'low'] || 0)
        case 'confidence':
          return (b.confidence || 0) - (a.confidence || 0)
        default:
          return 0
      }
    })
    
    return items
  }, [validationResult, searchTerm, filterType, sortBy])
  
  // Performance optimization: Memoize selected items
  const selectedItems = useMemo(() => {
    return processedItems.filter(item => selectedIds.has(item.displayId))
  }, [processedItems, selectedIds])
  
  // Handle item selection
  const handleItemSelect = useCallback((item: ValidationItem, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(item.displayId)
      } else {
        newSet.delete(item.displayId)
      }
      return newSet
    })
  }, [])
  
  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(processedItems.map(item => item.displayId)))
    } else {
      setSelectedIds(new Set())
    }
  }, [processedItems])
  
  // Handle workflow start with advanced processing
  const startWorkflow = useCallback((mode: 'manual' | 'semi_auto' | 'full_auto') => {
    // Reset UI progress and open visualizer immediately
    setIsProcessing(true)
    setProcessingProgress(0)
    setWorkflowMode(mode)
    setShowWorkflowVisualizer(true)

    // Ensure the visualizer has items even if none are selected or data still loading
    const baseItems = selectedItems.length > 0
      ? selectedItems
      : (validationResult?.auto_resolvable?.length ? validationResult.auto_resolvable
        : (validationResult?.recommendations?.length ? validationResult.recommendations
          : (validationResult?.new_items?.length ? validationResult.new_items : [])))

    const synthesized = baseItems.length > 0 ? baseItems.slice(0, 12) : Array.from({ length: 8 }).map((_, i) => ({
      id: `synthetic-${i+1}`,
      displayId: `synthetic-${i+1}`,
      name: `field_${i+1}`,
      type: i % 3 === 0 ? 'string' : (i % 3 === 1 ? 'number' : 'date'),
      risk: (i % 4 === 0 ? 'high' : (i % 4 === 1 ? 'medium' : 'low')) as any,
      item: { table: 'unknown', schema: 'unknown' }
    }))

    const mapped = synthesized.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      priority: item.risk === 'critical' ? 4 : item.risk === 'high' ? 3 : item.risk === 'medium' ? 2 : 1,
      item: item.item
    }))
    setVisualizerItems(mapped)

    // Start visualizer run loop
    setInternalRunning(true)
    setInternalStep(0)
    if (stepTimerRef.current) {
      window.clearInterval(stepTimerRef.current)
      stepTimerRef.current = null
    }
    // Advance steps smoothly for the visualizer badges while it animates time-based
    stepTimerRef.current = window.setInterval(() => {
      setInternalStep(prev => {
        const next = Math.min(workflowState.totalSteps, prev + 1)
        if (next >= workflowState.totalSteps) {
          if (stepTimerRef.current) {
            window.clearInterval(stepTimerRef.current)
            stepTimerRef.current = null
          }
          // stop internal running shortly after reaching the end
          setTimeout(() => setInternalRunning(false), 800)
        }
        return next
      })
    }, 900)

    // Simulate header processing bar
    const progressInterval = window.setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          window.clearInterval(progressInterval)
          setIsProcessing(false)
          return 100
        }
        return prev + 10
      })
    }, 100)

    if (onStartWorkflow) {
      onStartWorkflow(mode)
    }
  }, [onStartWorkflow, workflowState.totalSteps, selectedItems, validationResult])

  // Ensure timers are cleared on unmount/close
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        window.clearInterval(stepTimerRef.current)
        stepTimerRef.current = null
      }
    }
  }, [])
  
  // Handle AI recommendations with advanced processing
  const handleAIRecommendations = useCallback(() => {
    if (validationResult?.recommendations) {
      setIsProcessing(true)
      setProcessingProgress(0)
      
      // Simulate AI processing
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setIsProcessing(false)
            onApplyRecommendations(validationResult.recommendations, 'auto')
            return 100
          }
          return prev + 15
        })
      }, 80)
    }
  }, [validationResult, onApplyRecommendations])
  
  // Handle catalog selected items with advanced processing
  const handleCatalogSelected = useCallback(() => {
    if (selectedItems.length > 0) {
      setIsProcessing(true)
      setProcessingProgress(0)
      
      // Simulate catalog processing
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setIsProcessing(false)
            onConfirm('add_new', selectedItems)
            return 100
          }
          return prev + 12
        })
      }, 90)
    }
  }, [selectedItems, onConfirm])
  
  // Performance optimization: Memoize item list rendering
  const renderItemList = useCallback((items: ValidationItem[], title: string, emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-slate-500">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )
    }
    
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.displayId}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
              selectedIds.has(item.displayId)
                ? 'bg-blue-50 border-blue-200 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <Checkbox
              checked={selectedIds.has(item.displayId)}
              onCheckedChange={(checked) => handleItemSelect(item, checked as boolean)}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-900 truncate">
                    {item.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {item.risk && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.risk === 'critical' ? 'border-red-500 text-red-600' :
                        item.risk === 'high' ? 'border-orange-500 text-orange-600' :
                        item.risk === 'medium' ? 'border-yellow-500 text-yellow-600' :
                        'border-green-500 text-green-600'
                      }`}
                    >
                      {item.risk}
                    </Badge>
                  )}
                  {item.confidence && (
                    <span className="text-xs text-slate-500">
                      {Math.round(item.confidence)}%
                    </span>
                  )}
                </div>
              </div>
              {(item.schema || item.table) && (
                <div className="text-xs text-slate-500 mt-1">
                  {item.schema && item.table ? `${item.schema}.${item.table}` : item.schema || item.table}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }, [selectedIds, handleItemSelect])
  
  // Show workflow visualizer when workflow is running
  useEffect(() => {
    if (workflowState.status === 'running' || workflowState.status === 'paused') {
      setShowWorkflowVisualizer(true)
    } else if (workflowState.status === 'completed' || workflowState.status === 'failed') {
      // Keep visualizer open for a moment to show completion
      setTimeout(() => {
        setShowWorkflowVisualizer(false)
      }, 3000)
    }
  }, [workflowState.status])
  
  // Progressive loading of validation result
  useEffect(() => {
    if (validationResult && validationResult.items.length > 0) {
      // Progressive loading to avoid blocking the main thread
      const loadItems = () => {
        // Items are already loaded, just ensure UI updates
        requestAnimationFrame(() => {
          // Force re-render if needed
        })
      }
      
      requestAnimationFrame(loadItems)
    }
  }, [validationResult])
  
  if (!isOpen) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 z-[100]">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 dark:border-slate-700">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Advanced Validation Orchestrator
                </span>
              </div>
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                <Rocket className="h-3 w-3 mr-1" />
                Enterprise
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {isProcessing && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-600">{processingProgress}%</span>
                  <Progress value={processingProgress} className="w-20 h-2" />
                </div>
              )}
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                className="text-slate-600 hover:text-blue-600"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
          {showWorkflowVisualizer ? (
            <WorkflowVisualizer
              mode={workflowMode}
              totalSteps={workflowState.totalSteps}
              currentStep={internalStep}
              running={internalRunning || workflowState.status === 'running'}
              successRate={validationResult?.metrics.successRate || 0}
              onExit={() => { setShowWorkflowVisualizer(false); setInternalRunning(false) }}
              metrics={{
                autoResolvable: validationResult?.metrics.autoResolvable || 0,
                requiresReview: validationResult?.metrics.conflicts || 0,
                highRisk: validationResult?.metrics.highRisk || 0
              }}
              selectedItems={(visualizerItems.length ? visualizerItems : selectedItems.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                priority: item.risk === 'critical' ? 4 : item.risk === 'high' ? 3 : item.risk === 'medium' ? 2 : 1,
                item: item.item
              })))}
            />
          ) : (
            <div className="h-full flex flex-col">
              {/* Header with controls */}
              <div className="px-6 py-4 border-b bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      />
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-32 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'type' | 'risk' | 'confidence')}>
                        <SelectTrigger className="w-32 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="type">Type</SelectItem>
                          <SelectItem value="risk">Risk</SelectItem>
                          <SelectItem value="confidence">Confidence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(true)}
                      disabled={processedItems.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(false)}
                      disabled={selectedIds.size === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                
                {/* Advanced Action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => startWorkflow('manual')}
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Manual Workflow
                            <Star className="h-3 w-3 ml-1 text-yellow-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Manual workflow with full control</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => startWorkflow('semi_auto')}
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            className="hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Semi-Auto Workflow
                            <Sparkles className="h-3 w-3 ml-1 text-orange-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Automated workflow with manual oversight</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => startWorkflow('full_auto')}
                            variant="default"
                            size="sm"
                            disabled={isProcessing}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Rocket className="h-4 w-4 mr-2" />
                            Full Auto Workflow
                            <Wand2 className="h-3 w-3 ml-1" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fully automated enterprise workflow</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleAIRecommendations}
                            variant="outline"
                            size="sm"
                            disabled={!validationResult?.recommendations?.length || isProcessing}
                            className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            AI Recommendations
                            <Sparkles className="h-3 w-3 ml-1 text-purple-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Apply AI-powered recommendations</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleCatalogSelected}
                            variant="default"
                            size="sm"
                            disabled={selectedItems.length === 0 || isProcessing}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Catalog Selected Items
                            <Check className="h-3 w-3 ml-1" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add selected items to data catalog</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="flex-1 overflow-hidden">
                {validationResult ? (
                  <Tabs defaultValue="all" className="h-full flex flex-col">
                    <TabsList className="px-6 py-2 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 dark:border-b dark:border-slate-800">
                      <TabsTrigger value="all" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                        <Database className="h-4 w-4 mr-2" />
                        All Items ({validationResult.items.length})
                      </TabsTrigger>
                      <TabsTrigger value="auto" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Auto Resolvable ({validationResult.auto_resolvable.length})
                      </TabsTrigger>
                      <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                        <Brain className="h-4 w-4 mr-2" />
                        Recommendations ({validationResult.recommendations.length})
                      </TabsTrigger>
                      <TabsTrigger value="new" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                        <Sparkles className="h-4 w-4 mr-2" />
                        New Items ({validationResult.new_items.length})
                      </TabsTrigger>
                      <TabsTrigger value="conflicts" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Conflicts ({validationResult.conflicts.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="all" className="h-full m-0">
                        <ScrollArea className="h-full px-6 py-4">
                          {renderItemList(processedItems, "All Items", "No items found")}
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="auto" className="h-full m-0">
                        <ScrollArea className="h-full px-6 py-4">
                          {renderItemList(validationResult.auto_resolvable, "Auto Resolvable", "No auto-resolvable items")}
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="recommendations" className="h-full m-0">
                        <ScrollArea className="h-full px-6 py-4">
                          {renderItemList(validationResult.recommendations, "AI Recommendations", "No recommendations available")}
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="new" className="h-full m-0">
                        <ScrollArea className="h-full px-6 py-4">
                          {renderItemList(validationResult.new_items, "New Items", "No new items detected")}
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="conflicts" className="h-full m-0">
                        <ScrollArea className="h-full px-6 py-4">
                          {renderItemList(validationResult.conflicts, "Conflicts", "No conflicts detected")}
                        </ScrollArea>
                      </TabsContent>
                    </div>
                  </Tabs>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                    <div className="text-center">
                      <div className="relative">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
                        <Loader2 className="h-8 w-8 animate-spin absolute top-2 left-1/2 transform -translate-x-1/2 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Loading Advanced Validation Results</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">Processing enterprise-grade validation data...</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <div className="mt-6">
                        <Button onClick={() => startWorkflow('full_auto')} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          Quick Start Full Auto
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-rose-950 dark:to-rose-900 border-t border-red-200 dark:border-rose-800">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5 animate-pulse" />
              <div>
                <h4 className="font-semibold">Validation Error</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AdvancedValidationOrchestrator
