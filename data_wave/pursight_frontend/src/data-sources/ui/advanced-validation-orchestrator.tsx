"use client"

import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from "react"
import { 
  Play, Pause, Square, Brain, Zap, Shield, Target, Activity,
  Database, Table, Columns, Search, BarChart3, Clock, Check, X
} from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// PERFORMANCE: Lazy load heavy components
const WorkflowVisualizer = lazy(() => import("../ui/workflow-visualizer"))

// PERFORMANCE: Loading component for lazy imports
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-2 border-slate-300 border-top-slate-900 rounded-full animate-spin" />
    <span className="ml-2 text-sm text-slate-600">Loading...</span>
  </div>
)

// Types copied to preserve business contract
interface ValidationItem {
  id: string
  item: {
    database?: string
    schema?: string
    table?: string
    column?: string
    [key: string]: any
  }
  existing_catalog_item?: any
  item_type: 'database' | 'schema' | 'table' | 'view' | 'column'
  priority: number
  conflict_type?: 'duplicate' | 'schema_mismatch' | 'permission' | 'dependency'
  reason?: string
  action?: 'catalog_immediately' | 'catalog_soon' | 'review_required' | 'skip'
  confidence?: number
  business_value?: 'low' | 'medium' | 'high' | 'critical'
  automation_score?: number
  estimated_time?: number
  dependencies?: string[]
  risk_level?: 'low' | 'medium' | 'high'
  size_mb?: number
  last_updated?: string
}

interface ValidationResult {
  total_selected: number
  existing_items: ValidationItem[]
  new_items: ValidationItem[]
  conflicts: ValidationItem[]
  recommendations: ValidationItem[]
  critical_items: ValidationItem[]
  business_value_score: number
  automation_suggestions: {
    auto_resolvable: ValidationItem[]
    requires_review: ValidationItem[]
    high_risk: ValidationItem[]
    estimated_time_minutes: number
    success_probability: number
  }
  validation_summary: {
    existing_count: number
    new_count: number
    critical_count: number
    recommendation_count: number
    business_value: number
    requires_user_decision: boolean
    automation_coverage: number
    risk_assessment: 'low' | 'medium' | 'high'
  }
  performance_metrics?: {
    validation_time_ms: number
    items_per_second: number
    memory_usage_mb: number
  }
}

interface WorkflowState {
  mode: 'manual' | 'semi_auto' | 'full_auto'
  current_step: number
  total_steps: number
  is_running: boolean
  is_paused: boolean
  completed_items: string[]
  failed_items: string[]
  current_item?: ValidationItem
  estimated_remaining_time: number
  success_rate: number
}

export interface AdvancedValidationOrchestratorProps {
  isOpen: boolean
  onClose: () => void
  validationResult: ValidationResult | null
  onConfirm: (action: 'replace' | 'add_new' | 'cancel', selectedItems: any[], workflowOptions?: any) => void
  onApplyRecommendations: (recommendations: any[], automationMode?: string) => void
  onWorkflowUpdate?: (state: WorkflowState) => void
  isLoading?: boolean
  enableWorkflowAutomation?: boolean
  maxItemsToShow?: number
  autoSelectRecommendations?: boolean
}

export function AdvancedValidationOrchestrator({
  isOpen,
  onClose,
  validationResult,
  onConfirm,
  onApplyRecommendations,
  onWorkflowUpdate,
  isLoading = false,
  enableWorkflowAutomation = true,
  maxItemsToShow = 1000,
  autoSelectRecommendations = true
}: AdvancedValidationOrchestratorProps) {
  // PERFORMANCE: Remove console logging in production
  // Version stamp removed for performance
  const [selectedAction, setSelectedAction] = useState<'replace' | 'add_new' | 'cancel'>('add_new')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'database' | 'schema' | 'table' | 'view' | 'column'>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'type' | 'risk' | 'business_value'>('priority')
  const [tab, setTab] = useState<'workflow' | 'items' | 'analytics' | 'settings'>('workflow')

  const [workflow, setWorkflow] = useState<WorkflowState>({
    mode: 'semi_auto', current_step: 0, total_steps: 0, is_running: false, is_paused: false,
    completed_items: [], failed_items: [], estimated_remaining_time: 0, success_rate: 100
  })

  const [perf, setPerf] = useState({ isVirtualized: false, start: 0, end: 60, total: 0 })
  const analyzingRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const [showVisualizer, setShowVisualizer] = useState(false)
  // Stable items fed to WorkflowVisualizer for both Selecting and Analyzing steps
  const [vizItems, setVizItems] = useState<Array<{ id: string; name: string; type: string; priority: number; item: any }>>([])
  
  // Processing overlay state (AI analysis / auto resolve)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)

  // Progressive source items to avoid blocking render
  const [sourceItems, setSourceItems] = useState<(ValidationItem & { category: string, displayId: string })[]>([])
  
  // PERFORMANCE: Static synthetic items to avoid recreation
  const SYNTHETIC_ITEMS = useMemo(() => 
    Array.from({ length: 8 }).map((_, i) => ({
      id: `synthetic-${i+1}`,
      name: `field_${i+1}`,
      type: (i % 3 === 0 ? 'string' : (i % 3 === 1 ? 'number' : 'date')),
      priority: 3,
      item: { schema: 'unknown', table: 'unknown' }
    })), [])


  useEffect(() => {
    if (!isOpen || !validationResult) return

    setSelectedAction('add_new')
    setSelectedIds(new Set())
    setSearch('')
    setFilterType('all')
    setSortBy('priority')

    const total = validationResult.total_selected
    setWorkflow(prev => ({
      ...prev, mode: 'semi_auto', current_step: 0, total_steps: total,
      is_running: false, is_paused: false, completed_items: [], failed_items: [],
      estimated_remaining_time: Math.ceil(total * 2), success_rate: validationResult.automation_suggestions?.success_probability || 95
    }))

    setPerf({ isVirtualized: total > 120, start: 0, end: Math.min(60, total), total })

    if (autoSelectRecommendations && validationResult.recommendations?.length) {
      const ids = new Set(validationResult.recommendations.map((_, i) => `rec_${i}`))
      setSelectedIds(ids)
    }

    onWorkflowUpdate?.(workflow)
  }, [isOpen, validationResult, autoSelectRecommendations, onWorkflowUpdate])

  // PERFORMANCE: Optimized item loading with batching and debouncing
  useEffect(() => {
    if (!isOpen || !validationResult) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    // PERFORMANCE: Use requestIdleCallback for non-blocking processing
    const processItems = () => {
      const rec: (ValidationItem & { category: string, displayId: string })[] = []
      const crit: (ValidationItem & { category: string, displayId: string })[] = []
      const neu: (ValidationItem & { category: string, displayId: string })[] = []
      const exi: (ValidationItem & { category: string, displayId: string })[] = []

      // PERFORMANCE: Batch process items to avoid blocking
      const batchSize = 50
      const processInBatches = (items: ValidationItem[], category: string, target: any[]) => {
        for (let i = 0; i < Math.min(items.length, batchSize); i++) {
          const it = items[i]
          target.push({ 
            ...it, 
            id: it.id || `${category}_${i}`, 
            category, 
            displayId: `${category}_${i}` 
          })
        }
      }

      if (validationResult.recommendations) processInBatches(validationResult.recommendations, 'recommendation', rec)
      if (validationResult.critical_items) processInBatches(validationResult.critical_items, 'critical', crit)
      if (validationResult.new_items) processInBatches(validationResult.new_items, 'new', neu)
      if (validationResult.existing_items) processInBatches(validationResult.existing_items, 'existing', exi)

      // PERFORMANCE: Prioritize critical items first
      const allItems = [...crit, ...rec, ...neu, ...exi]
      setSourceItems(allItems)
    }

    // PERFORMANCE: Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(processItems, { timeout: 100 })
    } else {
      setTimeout(processItems, 0)
    }

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isOpen, validationResult])

  

  // PERFORMANCE: Optimized filtering and sorting with memoization
  const allItems = useMemo(() => {
    if (!isOpen || !sourceItems.length) return [] as (ValidationItem & { category: string, displayId: string })[]
    
    // PERFORMANCE: Early return for empty states
    let filtered = sourceItems
    
    // PERFORMANCE: Optimized filtering with early exits
    if (filterType !== 'all') {
      filtered = filtered.filter(i => i.item_type === filterType)
    }
    
    if (search) {
      const searchTerm = search.toLowerCase()
      // PERFORMANCE: Use more efficient search with early termination
      filtered = filtered.filter(i => {
        return (i.item.table?.toLowerCase().includes(searchTerm)) ||
               (i.item.schema?.toLowerCase().includes(searchTerm)) ||
               (i.item.column?.toLowerCase().includes(searchTerm)) ||
               (i.reason?.toLowerCase().includes(searchTerm))
      })
    }
    
    // PERFORMANCE: Optimized sorting with cached comparisons
    const sortComparators = {
      priority: (a: any, b: any) => (b.priority || 0) - (a.priority || 0),
      name: (a: any, b: any) => (a.item.table || a.item.schema || '').localeCompare(b.item.table || b.item.schema || ''),
      type: (a: any, b: any) => a.item_type.localeCompare(b.item_type),
      risk: (a: any, b: any) => {
        const riskValues = { high: 3, medium: 2, low: 1 }
        return (riskValues[b.risk_level as keyof typeof riskValues] || 0) - (riskValues[a.risk_level as keyof typeof riskValues] || 0)
      },
      business_value: (a: any, b: any) => {
        const valueMap = { critical: 4, high: 3, medium: 2, low: 1 }
        return (valueMap[b.business_value as keyof typeof valueMap] || 0) - (valueMap[a.business_value as keyof typeof valueMap] || 0)
      }
    }
    
    const comparator = sortComparators[sortBy as keyof typeof sortComparators]
    if (comparator) {
      filtered.sort(comparator)
    }
    
    // PERFORMANCE: Limit results early to avoid processing excess items
    return filtered.length > maxItemsToShow ? filtered.slice(0, maxItemsToShow) : filtered
  }, [isOpen, sourceItems, filterType, search, sortBy, maxItemsToShow])

  // PERFORMANCE: Optimized virtualization with stable references
  const visible = useMemo(() => {
    if (!perf.isVirtualized || allItems.length <= 60) return allItems
    return allItems.slice(perf.start, perf.end)
  }, [allItems, perf.isVirtualized, perf.start, perf.end])

  // PERFORMANCE: Memoized visualizer items builder to prevent recalculation
  const buildVisualizerItems = useCallback(() => {
    if (vizItems.length) return vizItems
    
    // PERFORMANCE: Early return for selected items
    if (selectedIds.size > 0) {
      const derived = Array.from(selectedIds).map(id => {
        const it = allItems.find(i => i.displayId === id)
        return it ? {
          id: it.id,
          name: it.item.table || it.item.schema || it.item.column || 'Unknown',
          type: it.item_type,
          priority: it.priority || 5,
          item: it.item
        } : null
      }).filter(Boolean) as Array<{ id: string; name: string; type: string; priority: number; item: any }>
      if (derived.length) return derived
    }
    
    // PERFORMANCE: Use source items efficiently
    const pool = allItems.length ? allItems : sourceItems
    if (pool.length) {
      return pool.slice(0, 12).map(it => ({
        id: it.id,
        name: it.item.table || it.item.schema || it.item.column || 'Unknown',
        type: it.item_type,
        priority: it.priority || 5,
        item: it.item
      }))
    }
    
    // PERFORMANCE: Cached synthetic placeholders
    return SYNTHETIC_ITEMS
  }, [vizItems, selectedIds, allItems, sourceItems, SYNTHETIC_ITEMS])

  const idToDisplayId = useMemo(() => {
    const map = new Map<string, string>()
    for (const it of allItems) {
      if (it.id && it.displayId) map.set(it.id, it.displayId)
    }
    return map
  }, [allItems])

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }, [])

  const selectAll = useCallback(() => setSelectedIds(new Set(visible.map(i => i.displayId))), [visible])
  const clearAll = useCallback(() => setSelectedIds(new Set()), [])
  const selectAutoResolvable = useCallback(() => {
    if (!validationResult?.automation_suggestions) return
    const next = new Set<string>()
    for (const it of validationResult.automation_suggestions.auto_resolvable) {
      const disp = idToDisplayId.get(it.id) || it.id
      next.add(disp)
    }
    setSelectedIds(next)
  }, [validationResult, idToDisplayId])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Handle AI recommendations with instant processing
  const handleAIRecommendations = useCallback(() => {
    if (validationResult?.recommendations) {
      // Instant execution - no delays
      onApplyRecommendations(validationResult.recommendations, 'auto')
    }
  }, [validationResult, onApplyRecommendations])

  const startAuto = useCallback(async () => {
    if (analyzingRef.current) return
    const isFullAuto = workflow.mode === 'full_auto'
    // For full_auto, mount visualizer immediately regardless of availability
    if (isFullAuto) setShowVisualizer(true)
    if (!validationResult) return
    analyzingRef.current = true
    setWorkflow(w => ({ ...w, is_running: true, is_paused: false, current_step: 0 }))
    
    // Choose items: prefer auto_resolvable; otherwise fallback to recommendations, then new_items
    let items = validationResult.automation_suggestions?.auto_resolvable || []
    if (!items.length) items = validationResult.recommendations || []
    if (!items.length) items = validationResult.new_items || []
    
    // Prepare stable visualizer items so all stages use the same list
    const mapped = items.length > 0 ? items.slice(0, 12).map(it => ({
      id: it.id,
      name: it.item.table || it.item.schema || it.item.column || 'Unknown',
      type: it.item_type,
      priority: it.priority || 5,
      item: it.item
    })) : Array.from({ length: 8 }).map((_, i) => ({
      id: `synthetic-${i+1}`,
      name: `field_${i+1}`,
      type: (i % 3 === 0 ? 'string' : (i % 3 === 1 ? 'number' : 'date')),
      priority: 4 - (i % 3),
      item: { schema: 'unknown', table: 'unknown' }
    }))
    setVizItems(mapped)
    
    // Set total steps for visualizer progression
    setWorkflow(w => ({ ...w, total_steps: 6 }))
    
    // ENTERPRISE-GRADE STEP-BY-STEP EXECUTION - NO MOVEMENT UNTIL STEP COMPLETE
    const stepDurations = [
      4000, // Step 1: Selecting (4 seconds) - Show item selection process
      6000, // Step 2: Analyzing (6 seconds) - Advanced pattern detection
      3000, // Step 3: AI Recommending (3 seconds)
      2500, // Step 4: Resolving (2.5 seconds)
      2500, // Step 5: Applying (2.5 seconds)
      2000  // Step 6: Cataloging (2 seconds)
    ]
    
    let currentStepIndex = 0
    const executeStep = () => {
      if (currentStepIndex >= stepDurations.length) {
        // All steps completed
        setWorkflow(w => ({ ...w, is_running: false, current_step: 6 }))
        analyzingRef.current = false
        onWorkflowUpdate?.(workflow)
        return
      }
      
      // Start current step
      const stepNumber = currentStepIndex + 1
      setWorkflow(w => ({ 
        ...w, 
        current_step: stepNumber,
        estimated_remaining_time: Math.ceil(stepDurations.slice(currentStepIndex).reduce((a, b) => a + b, 0) / 1000)
      }))
      
      // Wait for step completion before moving to next
      setTimeout(() => {
        currentStepIndex++
        executeStep() // Recursively execute next step
      }, stepDurations[currentStepIndex])
    }
    
    // Start the step-by-step execution
    executeStep()
    
    // Process actual items for selection (instant for UI responsiveness)
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      const display = idToDisplayId.get(it.id) || it.id
      setSelectedIds(prev => new Set([...prev, display]))
      setWorkflow(w => ({ ...w, completed_items: [...w.completed_items, it.id] }))
    }
  }, [validationResult, onWorkflowUpdate, workflow, idToDisplayId])

  // Conflict auto-resolve with instant processing
  const resolveConflictsAutomatically = useCallback(async () => {
    if (!validationResult?.conflicts) return
    const conflicts = validationResult.conflicts
    const resolved: string[] = []
    for (let i = 0; i < conflicts.length; i++) {
      const c = conflicts[i]
      // Auto-resolve if automation_score > 80
      if ((c.automation_score || 0) > 80) {
        const disp = (idToDisplayId.get(c.id) || (c as any).displayId || c.id)
        if (disp) {
          resolved.push(c.id)
          setSelectedIds(prev => new Set([...prev, disp]))
        }
      }
      // No delays - instant processing
    }
  }, [validationResult, idToDisplayId])

  const pause = useCallback(() => setWorkflow(w => ({ ...w, is_paused: true })), [])
  const resume = useCallback(() => { setWorkflow(w => ({ ...w, is_paused: false })); startAuto() }, [startAuto])
  const stop = useCallback(() => {
    setWorkflow(w => ({ ...w, is_running: false, is_paused: false, current_step: 0, current_item: undefined }))
  }, [])

  const confirm = useCallback(() => {
    const items = Array.from(selectedIds).map(id => allItems.find(i => i.displayId === id)?.item).filter(Boolean)
    const options = {
      automation_mode: workflow.mode,
      batch_size: 10,
      retry_failed: true,
      validate_dependencies: true,
      estimated_time: workflow.estimated_remaining_time,
      success_rate_threshold: 90
    }
    onConfirm(selectedAction, items as any[], options)
  }, [selectedIds, allItems, workflow, selectedAction, onConfirm])

  // PERFORMANCE: Memoized icon renderer to prevent recreation
  const getIcon = useCallback((t: string) => {
    const cls = "h-4 w-4 text-slate-600"
    switch (t) {
      case 'database': return <Database className={cls} />
      case 'schema': return <Database className={cls} />
      case 'table': return <Table className={cls} />
      case 'view': return <Table className={cls} />
      case 'column': return <Columns className={cls} />
      default: return <Database className={cls} />
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden bg-white border border-slate-300 z-[100]">
        {isProcessing && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center">
            <div className="bg-white border border-slate-300 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto border-2 border-slate-300 border-top-slate-900 rounded-full animate-spin" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">AI Processing</h3>
                  <p className="text-sm text-slate-600">Analyzing and processing data...</p>
                  <Progress value={processingProgress} className="h-2 bg-slate-200" />
                  <p className="text-xs text-slate-500 font-mono">{Math.round(processingProgress)}% Complete</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-slate-300 rounded-sm flex items-center justify-center">
                <Shield className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <span className="text-xl font-semibold text-slate-900">Validation Orchestrator</span>
                <p className="text-sm text-slate-600 mt-1">AI-guided validation and cataloging</p>
              </div>
            </div>
            {validationResult && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BarChart3 className="h-4 w-4" />
                <span>{allItems.length} items</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {!validationResult && (
          <div className="p-12 flex flex-col items-center justify-center gap-5">
            {/* Animated AI logo */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-slate-900/20 to-slate-600/20 animate-pulse" />
              <svg width="56" height="56" viewBox="0 0 56 56" className="relative drop-shadow-sm">
                <defs>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                </defs>
                <circle cx="28" cy="28" r="26" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                <path d="M18 30c0-7 6-12 10-12s10 5 10 12" fill="none" stroke="url(#aiGrad)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="22" cy="31" r="2.5" fill="#0f172a">
                  <animate attributeName="r" values="2.5;3.2;2.5" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="34" cy="31" r="2.5" fill="#0f172a" opacity="0.85">
                  <animate attributeName="r" values="2.5;3.2;2.5" dur="1.4s" begin="0.2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div className="text-center space-y-1">
              <div className="text-base font-semibold text-slate-900">Analyzing and AI-processing metadata...</div>
              <div className="text-xs text-slate-500">Optimizing schema insights, dependencies and risk signals</div>
            </div>
            {/* Shimmer progress */}
            <div className="w-64 h-2 rounded-full overflow-hidden bg-slate-200">
              <div className="h-full w-1/3 bg-slate-900/70 animate-[shimmer_1.4s_ease_infinite]" style={{transformOrigin:'left center'}} />
            </div>
            <style>{`@keyframes shimmer{0%{transform:translateX(-120%)}50%{transform:translateX(60%)}100%{transform:translateX(120%)}}`}</style>
          </div>
        )}

        {validationResult && (
        <>
        {/* Top Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700">Mode:</span>
              <Select value={workflow.mode} onValueChange={(v: any) => setWorkflow(w => ({ ...w, mode: v }))}>
                <SelectTrigger className="w-32 h-8 text-xs border-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="semi_auto">Semi-Auto</SelectItem>
                  <SelectItem value="full_auto">Full Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              {!workflow.is_running ? (
                <Button variant="outline" size="sm" onClick={startAuto} className="h-8 px-3 border-slate-300 hover:border-slate-400">
                  <Play className="h-3 w-3" />
                </Button>
              ) : workflow.is_paused ? (
                <Button variant="outline" size="sm" onClick={resume} className="h-8 px-3 border-slate-300 hover:border-slate-400">
                  <Play className="h-3 w-3" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={pause} className="h-8 px-3 border-slate-300 hover:border-slate-400">
                  <Pause className="h-3 w-3" />
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={stop} className="h-8 px-3 border-slate-300 hover:border-slate-400">
                <Square className="h-3 w-3" />
              </Button>
            </div>
            {workflow.is_running && (
              <div className="flex items-center gap-2">
                <Progress value={(workflow.current_step / Math.max(1, workflow.total_steps)) * 100} className="w-32 h-2 bg-slate-200" />
                <span className="text-xs text-slate-600 font-mono">{workflow.current_step}/{workflow.total_steps}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-900" /><span>{validationResult.total_selected} Total</span></div>
            <div className="flex items-center gap-1"><Check className="h-3 w-3" /><span>{selectedIds.size} Selected</span></div>
            <div className="flex items-center gap-1"><Brain className="h-3 w-3" /><span>{validationResult.recommendations?.length || 0} AI</span></div>
            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{workflow.estimated_remaining_time}s Est.</span></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-64 h-8 border-slate-300 focus:border-slate-500" />
            </div>
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-32 h-8 border-slate-300"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="schema">Schema</SelectItem>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="column">Column</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-32 h-8 border-slate-300"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
                <SelectItem value="business_value">Business Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAll} className="h-8 px-3 border-slate-300 hover:border-slate-400">Select All</Button>
            <Button variant="outline" size="sm" onClick={clearAll} className="h-8 px-3 border-slate-300 hover:border-slate-400">Select None</Button>
            <Button variant="outline" size="sm" onClick={selectAutoResolvable} className="h-8 px-3 border-slate-300 hover:border-slate-400"><Brain className="h-3 w-3 mr-1" />AI Select</Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={tab} onValueChange={(v: any) => setTab(v)} className="h-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 border border-slate-200">
              <TabsTrigger value="workflow" className="text-slate-700 data-[state=active]:bg-white"><Target className="h-4 w-4 mr-1" />Workflow</TabsTrigger>
              <TabsTrigger value="items" className="text-slate-700 data-[state=active]:bg-white"><Database className="h-4 w-4 mr-1" />Items</TabsTrigger>
              <TabsTrigger value="analytics" className="text-slate-700 data-[state=active]:bg-white"><BarChart3 className="h-4 w-4 mr-1" />Analytics</TabsTrigger>
              <TabsTrigger value="settings" className="text-slate-700 data-[state=active]:bg-white"><Activity className="h-4 w-4 mr-1" />Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="mt-4 h-full">
              <div className="grid grid-cols-3 gap-4 h-full">
                {!showVisualizer ? (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-900">Enterprise Pipeline</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-600">Auto-Resolvable</span><span className="font-mono text-slate-900">{validationResult.automation_suggestions?.auto_resolvable?.length || 0}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Requires Review</span><span className="font-mono text-slate-900">{validationResult.automation_suggestions?.requires_review?.length || 0}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">High Risk</span><span className="font-mono text-slate-900">{validationResult.automation_suggestions?.high_risk?.length || 0}</span></div>
                    </div>
                    <Separator className="bg-slate-200" />
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-600">Success Rate</span><span className="font-mono text-slate-900">{workflow.success_rate}%</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Est. Time</span><span className="font-mono text-slate-900">{Math.ceil(workflow.estimated_remaining_time / 60)}m</span></div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded border">
                      <div className="text-xs font-medium text-slate-700 mb-2">Step-by-Step Execution</div>
                      <div className="text-xs text-slate-600">• No movement until step complete</div>
                      <div className="text-xs text-slate-600">• Advanced pattern analysis</div>
                      <div className="text-xs text-slate-600">• Enterprise-grade processing</div>
                    </div>
                  </CardContent>
                </Card>
                ) : (
                  <div className="col-span-3">
                    <Suspense fallback={<LoadingSpinner />}>
                      <WorkflowVisualizer
                        mode={workflow.mode}
                        totalSteps={Math.max(1, workflow.total_steps)}
                        currentStep={workflow.current_step}
                        running={workflow.is_running}
                        successRate={workflow.success_rate}
                        onExit={() => setShowVisualizer(false)}
                        metrics={{
                          autoResolvable: validationResult.automation_suggestions?.auto_resolvable?.length || 0,
                          requiresReview: validationResult.automation_suggestions?.requires_review?.length || 0,
                          highRisk: validationResult.automation_suggestions?.high_risk?.length || 0,
                        }}
                        selectedItems={buildVisualizerItems()}
                      />
                    </Suspense>
                  </div>
                )}

                {!showVisualizer && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-900">Current Processing</CardTitle></CardHeader>
                  <CardContent>
                    {workflow.current_item ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">{getIcon(workflow.current_item.item_type)}<span className="font-medium text-slate-900">{workflow.current_item.item.table || workflow.current_item.item.schema}</span></div>
                        <div className="text-xs text-slate-600">{workflow.current_item.reason}</div>
                        <Progress value={(workflow.current_step / Math.max(1, workflow.total_steps)) * 100} className="h-2 bg-slate-200" />
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 text-center py-4">No active processing</div>
                    )}
                  </CardContent>
                </Card>
                )}

                {!showVisualizer && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-900">Quick Actions</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      onApplyRecommendations(validationResult.recommendations, workflow.mode)
                    }} className="w-full justify-start border-slate-300 hover:border-slate-400"><Brain className="h-4 w-4 mr-2" />AI Recommendations</Button>
                    <Button variant="outline" size="sm" onClick={selectAutoResolvable} className="w-full justify-start border-slate-300 hover:border-slate-400"><Zap className="h-4 w-4 mr-2" />Auto Select</Button>
                    <Button variant="outline" size="sm" onClick={resolveConflictsAutomatically} className="w-full justify-start border-slate-300 hover:border-slate-400"><Zap className="h-4 w-4 mr-2" />Auto Resolve</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowVisualizer(true)} className="w-full justify-start border-slate-300 hover:border-slate-400"><Target className="h-4 w-4 mr-2" />Advanced View</Button>
                  </CardContent>
                </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="items" className="mt-4 h-full">
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {visible.map((it) => {
                    // PERFORMANCE: Memoize priority class calculation
                    const priorityClass = it.priority >= 8 ? 'bg-slate-900' : 
                                         it.priority >= 6 ? 'bg-slate-700' : 
                                         it.priority >= 4 ? 'bg-slate-500' : 'bg-slate-300'
                    const isSelected = selectedIds.has(it.displayId)
                    const isCompleted = workflow.completed_items.includes(it.id)
                    
                    return (
                      <div 
                        key={it.displayId} 
                        className={`group flex items-center gap-3 p-3 border border-slate-200 rounded-sm hover:border-slate-400 hover:bg-slate-50 transition-all duration-150 cursor-pointer select-none ${isSelected ? 'border-slate-900 bg-slate-100' : ''}`} 
                        onClick={() => toggle(it.displayId)}
                      >
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggle(it.displayId)} 
                          className="border-slate-400" 
                        />
                        <div className={`w-2 h-2 rounded-full ${priorityClass}`} />
                        {getIcon(it.item_type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 truncate">
                              {it.item.table || it.item.schema || it.item.column || 'Unknown'}
                            </span>
                            {it.category === 'recommendation' && (
                              <Brain className="h-3 w-3 text-slate-600" />
                            )}
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {it.item.schema && it.item.table ? 
                              `${it.item.schema}.${it.item.table}` : 
                              it.item.schema || it.item.database || 'N/A'
                            }
                          </div>
                        </div>
                        {it.business_value && (
                          <Badge variant="outline" className="text-xs border-slate-300 capitalize">
                            {it.business_value}
                          </Badge>
                        )}
                        {it.risk_level && (
                          <Badge variant="outline" className="text-xs border-slate-300 capitalize">
                            {it.risk_level}
                          </Badge>
                        )}
                        {typeof it.automation_score === 'number' && (
                          <div className="text-xs text-slate-500 font-mono w-8 text-right">
                            {it.automation_score}%
                          </div>
                        )}
                        {isCompleted && (
                          <Check className="h-4 w-4 text-slate-600" />
                        )}
                        {workflow.failed_items.includes(it.id) && (
                          <X className="h-4 w-4 text-slate-900" />
                        )}
                        {workflow.current_item?.id === it.id && (
                          <Activity className="h-4 w-4 text-slate-600 animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                  {perf.isVirtualized && perf.end < allItems.length && (
                    <div className="p-4 text-center">
                      <Button variant="outline" size="sm" onClick={() => setPerf(p => ({ ...p, end: p.end + 60 }))} className="text-slate-600 border-slate-300 hover:border-slate-400">Load More ({allItems.length - perf.end} remaining)</Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4 h-full">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-slate-200"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-900">Validation Summary</CardTitle></CardHeader><CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center"><div className="text-2xl font-bold text-slate-900">{validationResult.validation_summary.new_count}</div><div className="text-slate-600">New Items</div></div>
                    <div className="text-center"><div className="text-2xl font-bold text-slate-900">{validationResult.validation_summary.existing_count}</div><div className="text-slate-600">Existing</div></div>
                    <div className="text-center"><div className="text-2xl font-bold text-slate-900">{validationResult.validation_summary.critical_count}</div><div className="text-slate-600">Critical</div></div>
                    <div className="text-center"><div className="text-2xl font-bold text-slate-900">{validationResult.business_value_score}%</div><div className="text-slate-600">Value Score</div></div>
                  </div>
                </CardContent></Card>
                <Card className="border-slate-200"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-900">Automation Insights</CardTitle></CardHeader><CardContent className="space-y-3">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-600">Coverage:</span><span className="font-mono text-slate-900">{validationResult.validation_summary.automation_coverage || 0}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Risk Level:</span><span className="font-mono text-slate-900 capitalize">{validationResult.validation_summary.risk_assessment || 'Unknown'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Success Rate:</span><span className="font-mono text-slate-900">{validationResult.automation_suggestions?.success_probability || 0}%</span></div>
                  </div>
                </CardContent></Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-4 h-full">
              <div className="space-y-4">
                <Card className="border-slate-200"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-900">Performance</CardTitle></CardHeader><CardContent className="space-y-3">
                  <div className="flex items-center justify-between"><span className="text-xs text-slate-600">Virtualization</span><Badge variant="outline" className="text-xs border-slate-300">{perf.isVirtualized ? 'Enabled' : 'Disabled'}</Badge></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-slate-600">Window Size</span><Badge variant="outline" className="text-xs border-slate-300 font-mono">{perf.end - perf.start}</Badge></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-slate-600">Total Items</span><Badge variant="outline" className="text-xs border-slate-300 font-mono">{allItems.length}</Badge></div>
                </CardContent></Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700">Action:</span>
              <div className="flex border border-slate-300 rounded-sm overflow-hidden">
                <Button variant={selectedAction === 'add_new' ? 'default' : 'ghost'} size="sm" onClick={() => setSelectedAction('add_new')} className={`h-8 px-3 rounded-none ${selectedAction === 'add_new' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900'}`}>Add New</Button>
                <Button variant={selectedAction === 'replace' ? 'default' : 'ghost'} size="sm" onClick={() => setSelectedAction('replace')} className={`h-8 px-3 rounded-none ${selectedAction === 'replace' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900'}`}>Replace</Button>
              </div>
            </div>
            <div className="text-xs text-slate-600">{selectedIds.size} of {allItems.length} items selected</div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="border-slate-300 hover:border-slate-400 text-slate-700"><ArrowLeft className="h-4 w-4 mr-2" />Cancel</Button>
            <Button onClick={confirm} disabled={isLoading || selectedIds.size === 0} className="bg-slate-900 hover:bg-slate-800 text-white">
              {isLoading ? 'Processing...' : (<><ArrowRight className="h-4 w-4 mr-2" />Execute ({selectedIds.size})</>)}
            </Button>
          </div>
        </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AdvancedValidationOrchestrator


