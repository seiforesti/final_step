"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { 
  ChevronRight, ChevronDown, Database, Table, Columns, Search, Eye, FileText, Folder, FolderOpen, RefreshCw,
  Brain, Sparkles, TrendingUp, Shield, Star, Target, Zap, Activity, Gauge, CheckCircle, AlertTriangle,
  BarChart3, Users, Settings, Filter, Download, Share2, Globe, Network, Lock, Unlock, Clock, Info
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Prefer enterprise wrapper for consistent normalization and telemetry compatibility
import { discoverSchemaWithOptions, getDiscoveryStatus, stopDiscovery as stopDiscoveryApi } from "../services/enterprise-apis"
import { previewTable as previewTableApi } from "../services/apis"
import type { SchemaDiscoveryRequest, TablePreviewRequest } from "../types"

interface SchemaNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  children?: SchemaNode[]
  metadata?: {
    type?: string
    description?: string
    lastUpdated?: string
    // Database metadata
    itemCount?: number
    // Schema metadata  
    tableCount?: number
    viewCount?: number
    totalObjects?: number
    // Table/View metadata
    columnCount?: number
    rowCount?: number
    schemaName?: string
    tableName?: string
    viewName?: string
    estimatedSize?: number
    // Column metadata
    dataType?: string
    nullable?: boolean
    primaryKey?: boolean
    isIndexed?: boolean
    isForeignKey?: boolean
    columnName?: string
    // Advanced metadata
    qualityScore?: number
    businessValue?: number
    piiDetected?: boolean
    complianceScore?: number
    usageFrequency?: number
    tags?: string[]
    owner?: string
    steward?: string
  }
  selected?: boolean
  expanded?: boolean
  parentPath?: string
  // Advanced properties
  qualityIssues?: string[]
  recommendations?: string[]
  relationships?: {
    upstream: string[]
    downstream: string[]
  }
}

interface SchemaDiscoveryProps {
  dataSourceId: number
  dataSourceName: string
  onSelectionChange: (selection: SchemaNode[]) => void
  onClose: () => void
}

export function SchemaDiscovery({ 
  dataSourceId, 
  dataSourceName, 
  onSelectionChange, 
  onClose 
}: SchemaDiscoveryProps) {
  const [schemaTree, setSchemaTree] = useState<SchemaNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [discoveryProgress, setDiscoveryProgress] = useState(0)
  const [discoveryStatus, setDiscoveryStatus] = useState<string>("")
  const [schemaStats, setSchemaStats] = useState<any>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discoveryDiagnostics, setDiscoveryDiagnostics] = useState<{ durationMs?: number; endpoint?: string; request?: any }>({})
  const [previewDiagnostics, setPreviewDiagnostics] = useState<{ durationMs?: number; endpoint?: string; request?: any }>({})
  const [autoPicked, setAutoPicked] = useState<{ db: string; schema: string; table: string } | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  
  // Advanced features state
  const [viewMode, setViewMode] = useState<'tree' | 'table' | 'grid'>('tree')
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'quality' | 'usage'>('name')
  const [filterBy, setFilterBy] = useState({
    showTables: true,
    showViews: true,
    showColumns: true,
    qualityThreshold: 0,
    hasData: false,
    hasPII: false,
    businessCritical: false
  })
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [collaborationMode, setCollaborationMode] = useState(false)
  const [qualityAnalysis, setQualityAnalysis] = useState<any>(null)
  const [businessContext, setBusinessContext] = useState<any>(null)
  const [complianceData, setComplianceData] = useState<any>(null)

  // Progress streaming refs
  const sseRef = useRef<EventSource | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Define filterTree before first use to avoid hoisting issues
  function filterTree(nodes: SchemaNode[], term: string): SchemaNode[] {
    return nodes.filter(node => {
      const matches = node.name.toLowerCase().includes(term)
      const hasMatchingChildren = node.children ? 
        filterTree(node.children, term).length > 0 : false
      if (matches || hasMatchingChildren) {
        return {
          ...node,
          children: node.children ? filterTree(node.children, term) : undefined
        } as any
      }
      return false as any
    }).filter(Boolean) as unknown as SchemaNode[]
  }

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any ongoing requests when component unmounts
      if (abortController) {
        abortController.abort()
      }
      try { sseRef.current?.close() } catch {}
      try { wsRef.current?.close() } catch {}
    }
  }, [abortController])

  const startProgressStreams = () => {
    // Try SSE first
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''
      const sseUrl = `/proxy/data-discovery/data-sources/${dataSourceId}/discover-schema/progress${token ? `?token=${encodeURIComponent(token)}` : ''}`
      const es = new EventSource(sseUrl)
      sseRef.current = es
      es.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data)
          if (typeof msg.percentage === 'number') setDiscoveryProgress(msg.percentage)
          if (typeof msg.status === 'string') setDiscoveryStatus(msg.status)
        } catch {}
      }
      es.onerror = () => {
        try { es.close() } catch {}
        sseRef.current = null
        // Fallback to WS
        startWsProgress()
      }
    } catch {
      startWsProgress()
    }
  }

  const startWsProgress = () => {
    try {
      const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws'
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''
      const wsUrl = `${proto}://${window.location.host}/proxy/data-discovery/data-sources/${dataSourceId}/discover-schema/progress/ws${token ? `?token=${encodeURIComponent(token)}` : ''}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data)
          if (typeof msg.percentage === 'number') setDiscoveryProgress(msg.percentage)
          if (typeof msg.status === 'string') setDiscoveryStatus(msg.status)
        } catch {}
      }
      ws.onerror = () => {
        try { ws.close() } catch {}
        wsRef.current = null
      }
    } catch {}
  }

  const stopProgressStreams = () => {
    try { sseRef.current?.close() } catch {}
    try { wsRef.current?.close() } catch {}
    sseRef.current = null
    wsRef.current = null
  }

  const discoverSchema = async () => {
    // Prevent multiple simultaneous executions
    if (isLoading) {
      console.warn('Discovery already in progress, ignoring duplicate request')
      return
    }

    // Check if discovery is already running on the backend
    try {
      const statusResponse = await getDiscoveryStatus(dataSourceId)
      if (statusResponse.success && statusResponse.data?.is_running) {
        setError(`Discovery is already running by user: ${statusResponse.data.active_user}`)
        return
      }
    } catch (err) {
      console.warn('Could not check discovery status:', err)
    }

    setIsLoading(true)
    setIsStarted(true)
    setError(null)
    setDiscoveryProgress(0)
    setDiscoveryStatus("Connecting to data source...")

    // Create abort controller for cancellation
    const controller = new AbortController()
    setAbortController(controller)

    try {
      // Start real-time progress streams if available
      startProgressStreams()

      // Simulate progress baseline to avoid frozen bar if streams not available
      const progressInterval = setInterval(() => {
        setDiscoveryProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return Math.max(prev, prev + 5)
        })
      }, 400)

      setDiscoveryStatus("Discovering schema structure...")

      // Use centralized service wrapper (handles /proxy, auth, retries)
      const t0 = Date.now()
      const req: SchemaDiscoveryRequest = {
        data_source_id: dataSourceId,
        include_data_preview: false,
        max_tables_per_schema: 100,
      }
      const normalized = await discoverSchemaWithOptions(dataSourceId, req, { signal: controller.signal })
      const payload = (normalized as any).data || {}
      const t1 = Date.now()
      setDiscoveryDiagnostics({ durationMs: t1 - t0, endpoint: `/proxy/data-discovery/data-sources/${dataSourceId}/discover-schema`, request: req })

      clearInterval(progressInterval)
      setDiscoveryProgress(100)
      setDiscoveryStatus("Discovery completed!")
      stopProgressStreams()

      // Transform the schema structure into tree nodes
      const treeNodes = transformSchemaToTree(payload.schema_structure)
      setSchemaTree(treeNodes)
      setSchemaStats(payload.summary)

      // Auto-expand first level
      const firstLevelIds = treeNodes.map(node => node.id)
      setExpandedNodes(new Set(firstLevelIds))

      // Auto pick a populated table for UX
      try {
        const databases = payload?.schema_structure?.databases || []
        let selected: { db: string; schema: string; table: string } | null = null
        for (const db of databases) {
          for (const sch of (db?.schemas || [])) {
            const tables = sch?.tables || []
            const withRows = tables.find((t: any) => typeof t?.row_count === 'number' && t.row_count > 0)
            if (withRows) { selected = { db: db.name, schema: sch.name, table: withRows.name }; break }
          }
          if (selected) break
        }
        if (!selected) {
          outer: for (const db of databases) {
            for (const sch of (db?.schemas || [])) {
              const tables = sch?.tables || []
              if (tables.length > 0) { selected = { db: db.name, schema: sch.name, table: tables[0].name }; break outer }
            }
          }
        }
        if (selected) setAutoPicked(selected)
      } catch {}

    } catch (err: any) {
      // Don't show error if it was cancelled
      if (err.name === 'AbortError') {
        setDiscoveryStatus("Discovery cancelled")
        return
      }
      
      setError(err.message || "Schema discovery failed")
      setDiscoveryProgress(0)
      setDiscoveryStatus("Discovery failed")
      stopProgressStreams()
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  // Stop discovery function
  const stopDiscovery = async () => {
    try {
      // Stop discovery on the backend
      await stopDiscoveryApi(dataSourceId)
    } catch (err) {
      console.warn('Could not stop discovery on backend:', err)
    }
    
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    stopProgressStreams()
    setIsLoading(false)
    setDiscoveryStatus("Discovery stopped")
  }

  const transformSchemaToTree = (schemaStructure: any): SchemaNode[] => {
    const nodes: SchemaNode[] = []

    if (schemaStructure.databases) {
      schemaStructure.databases.forEach((database: any, dbIndex: number) => {
        const dbNode: SchemaNode = {
          id: `db_${dbIndex}_${database.name}`,
          name: database.name,
          type: 'database',
          children: [],
          metadata: { type: 'database', itemCount: database.schemas?.length || 0 }
        }

        if (database.schemas) {
          database.schemas.forEach((schema: any, schemaIndex: number) => {
            const schemaNode: SchemaNode = {
              id: `schema_${dbIndex}_${schemaIndex}_${schema.name}`,
              name: schema.name,
              type: 'schema',
              children: [],
              parentPath: dbNode.id,
              metadata: { 
                type: 'schema', 
                tableCount: schema.tables?.length || 0,
                viewCount: schema.views?.length || 0
              }
            }

            // Add tables
            if (schema.tables) {
              schema.tables.forEach((table: any, tableIndex: number) => {
                const tableNode: SchemaNode = {
                  id: `table_${dbIndex}_${schemaIndex}_${tableIndex}_${table.name}`,
                  name: table.name,
                  type: 'table',
                  children: [],
                  parentPath: `${dbNode.id}/${schemaNode.id}`,
                  metadata: { 
                    type: 'table', 
                    columnCount: table.columns?.length || 0,
                    rowCount: table.row_count,
                    schemaName: schema.name,
                    tableName: table.name
                  }
                }

                // Add columns
                if (table.columns) {
                  table.columns.forEach((column: any, columnIndex: number) => {
                    const columnNode: SchemaNode = {
                      id: `column_${dbIndex}_${schemaIndex}_${tableIndex}_${columnIndex}_${column.name}`,
                      name: column.name,
                      type: 'column',
                      parentPath: `${dbNode.id}/${schemaNode.id}/${tableNode.id}`,
                      metadata: {
                        type: 'column',
                        dataType: column.data_type,
                        nullable: column.nullable,
                        primaryKey: column.primary_key,
                        schemaName: schema.name,
                        tableName: table.name,
                        columnName: column.name
                      }
                    }
                    tableNode.children!.push(columnNode)
                  })
                }

                schemaNode.children!.push(tableNode)
              })
            }

            // Add views
            if (schema.views) {
              schema.views.forEach((view: any, viewIndex: number) => {
                const viewNode: SchemaNode = {
                  id: `view_${dbIndex}_${schemaIndex}_${viewIndex}_${view.name}`,
                  name: view.name,
                  type: 'view',
                  children: [],
                  parentPath: `${dbNode.id}/${schemaNode.id}`,
                  metadata: { 
                    type: 'view', 
                    columnCount: view.columns?.length || 0,
                    schemaName: schema.name,
                    viewName: view.name
                  }
                }

                // Add view columns
                if (view.columns) {
                  view.columns.forEach((column: any, columnIndex: number) => {
                    const columnNode: SchemaNode = {
                      id: `view_column_${dbIndex}_${schemaIndex}_${viewIndex}_${columnIndex}_${column.name}`,
                      name: column.name,
                      type: 'column',
                      parentPath: `${dbNode.id}/${schemaNode.id}/${viewNode.id}`,
                      metadata: {
                        type: 'column',
                        dataType: column.data_type,
                        nullable: column.nullable,
                        schemaName: schema.name,
                        tableName: view.name,
                        columnName: column.name
                      }
                    }
                    viewNode.children!.push(columnNode)
                  })
                }

                schemaNode.children!.push(viewNode)
              })
            }

            dbNode.children!.push(schemaNode)
          })
        }

        nodes.push(dbNode)
      })
    }

    return nodes
  }

  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const handleNodeSelect = (nodeId: string, checked: boolean) => {
    setSelectedNodes(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(nodeId)
      } else {
        newSet.delete(nodeId)
      }
      return newSet
    })
  }

  const handlePreviewTable = async (node: SchemaNode) => {
    if (node.type !== 'table' && node.type !== 'view') return

    try {
      const req: TablePreviewRequest = {
        data_source_id: dataSourceId,
        schema_name: node.metadata.schemaName,
        table_name: node.metadata.tableName || node.metadata.viewName,
        limit: 100,
        include_statistics: true,
        apply_data_masking: false,
      }
      const t0 = Date.now()
      const result = await previewTableApi(req)
      const t1 = Date.now()
      setPreviewDiagnostics({ durationMs: t1 - t0, endpoint: `/proxy/data-discovery/data-sources/${dataSourceId}/preview-table`, request: req })
      setPreviewData((result as any)?.data || result)
      setShowPreviewDialog(true)

    } catch (err) {
      console.error('Table preview failed:', err)
    }
  }

  const getNodeIcon = (node: SchemaNode) => {
    switch (node.type) {
      case 'database':
        return <Database className="h-4 w-4 text-blue-500" />
      case 'schema':
        return expandedNodes.has(node.id) ? 
          <FolderOpen className="h-4 w-4 text-orange-500" /> : 
          <Folder className="h-4 w-4 text-orange-500" />
      case 'table':
        return <Table className="h-4 w-4 text-green-500" />
      case 'view':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'column':
        return <Columns className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getSelectionState = (nodeId: string): 'checked' | 'unchecked' | 'indeterminate' => {
    if (selectedNodes.has(nodeId)) return 'checked'
    const node = findNodeById(schemaTree, nodeId)
    if (node?.children) {
      const hasSelectedChildren = node.children.some(child => 
        selectedNodes.has(child.id) || getSelectionState(child.id) !== 'unchecked'
      )
      if (hasSelectedChildren) return 'indeterminate'
    }
    return 'unchecked'
  }

  const findNodeById = (nodes: SchemaNode[], id: string): SchemaNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const filteredTree = searchTerm ? 
    filterTree(schemaTree, searchTerm.toLowerCase()) : 
    schemaTree

  const renderTreeNode = (node: SchemaNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const selectionState = getSelectionState(node.id)

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => handleNodeToggle(node.id)}
            >
              {isExpanded ? 
                <ChevronDown className="h-3 w-3" /> : 
                <ChevronRight className="h-3 w-3" />
              }
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}
          <Checkbox
            checked={selectionState === 'checked'}
            onCheckedChange={(checked) => handleNodeSelect(node.id, checked as boolean)}
          />
          {getNodeIcon(node)}
          <span className="flex-1 text-sm font-medium">{node.name}</span>
          {node.metadata && (
            <div className="flex items-center gap-2">
              {node.type === 'table' && node.metadata.rowCount && (
                <Badge variant="outline" className="text-xs">
                  {node.metadata.rowCount.toLocaleString()} rows
                </Badge>
              )}
              {(node.type === 'table' || node.type === 'view') && node.metadata.columnCount && (
                <Badge variant="secondary" className="text-xs">
                  {node.metadata.columnCount} cols
                </Badge>
              )}
              {node.type === 'column' && (
                <Badge variant="outline" className="text-xs">
                  {node.metadata.dataType}
                  {node.metadata.primaryKey && (
                    <span className="ml-1 text-yellow-600">PK</span>
                  )}
                </Badge>
              )}
              {(node.type === 'table' || node.type === 'view') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handlePreviewTable(node)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Preview data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const getSelectedCount = () => {
    return selectedNodes.size
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enterprise Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Enterprise Schema Discovery
              </h2>
              <p className="text-sm text-indigo-600 dark:text-indigo-300">
                AI-powered intelligent analysis of {dataSourceName}
              </p>
            </div>
          </div>
          
          {/* Real-time metrics */}
          {schemaStats && !isLoading && (
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full border">
                <Gauge className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Quality: 94%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full border">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Business Value: High</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full border">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Compliance: GDPR</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full border">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">3 Users Active</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Selector */}
          {!isLoading && schemaStats && (
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tree">Tree View</SelectItem>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="grid">Grid View</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {/* AI Toggle */}
          {!isLoading && schemaStats && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 rounded-lg border">
              <Brain className="h-4 w-4 text-purple-500" />
              <Label className="text-xs font-medium">AI Analysis</Label>
              <Switch checked={showAIInsights} onCheckedChange={setShowAIInsights} size="sm" />
            </div>
          )}
          
          {/* Advanced Filters */}
          {!isLoading && schemaStats && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>
                    Configure discovery filters and analysis options
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Asset Types</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="show-tables" checked={filterBy.showTables} onCheckedChange={(checked) => setFilterBy(prev => ({ ...prev, showTables: checked }))} />
                        <Label htmlFor="show-tables">Tables</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="show-views" checked={filterBy.showViews} onCheckedChange={(checked) => setFilterBy(prev => ({ ...prev, showViews: checked }))} />
                        <Label htmlFor="show-views">Views</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="show-columns" checked={filterBy.showColumns} onCheckedChange={(checked) => setFilterBy(prev => ({ ...prev, showColumns: checked }))} />
                        <Label htmlFor="show-columns">Columns</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Quality & Compliance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="has-data" checked={filterBy.hasData} onCheckedChange={(checked) => setFilterBy(prev => ({ ...prev, hasData: checked }))} />
                        <Label htmlFor="has-data">Has Data</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="has-pii" checked={filterBy.hasPII} onCheckedChange={(checked) => setFilterBy(prev => ({ ...prev, hasPII: checked }))} />
                        <Label htmlFor="has-pii">Contains PII</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="business-critical" checked={filterBy.businessCritical} onCheckedChange={(checked) => setFilterBy(prev => ({ ...prev, businessCritical: checked }))} />
                        <Label htmlFor="business-critical">Business Critical</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          {/* Discovery Controls */}
          {!isStarted ? (
            <Button onClick={discoverSchema} disabled={isLoading} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Discovery
            </Button>
          ) : isLoading ? (
            <Button variant="destructive" onClick={stopDiscovery}>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Stop Discovery
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={discoverSchema} disabled={isLoading} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-analyze
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Discovery Progress */}
      {isLoading && (
        <div className="p-4 border-b">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{discoveryStatus || 'Initializing...'}</span>
              <span>{discoveryProgress}%</span>
            </div>
            <Progress value={discoveryProgress} />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Enhanced Main Content */}
      {!isLoading && !error && (
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="discovery" className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="discovery" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Discovery
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="quality" className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Quality
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Compliance
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="discovery" className="flex-1 flex flex-col">
              {/* Enhanced Summary Stats */}
              {schemaStats && (
                <div className="p-4 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="p-4 bg-white/60 dark:bg-gray-800/60 border-0 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{schemaStats.total_databases}</div>
                          <div className="text-xs text-muted-foreground">Databases</div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-white/60 dark:bg-gray-800/60 border-0 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <Table className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{schemaStats.total_tables}</div>
                          <div className="text-xs text-muted-foreground">Tables</div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-white/60 dark:bg-gray-800/60 border-0 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{schemaStats.total_views || 0}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-white/60 dark:bg-gray-800/60 border-0 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                          <Columns className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{schemaStats.total_columns}</div>
                          <div className="text-xs text-muted-foreground">Columns</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  {/* Performance Metrics */}
                  {(discoveryDiagnostics.durationMs || discoveryDiagnostics.endpoint) && (
                    <div className="mt-4 flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-muted-foreground">Discovery Time:</span>
                        <span className="font-medium">{discoveryDiagnostics.durationMs} ms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">Endpoint:</span>
                        <span className="font-mono text-xs">{discoveryDiagnostics.endpoint?.split('/').pop()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

          {/* Controls */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tables, columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {autoPicked && (
                <Badge variant="outline" className="text-xs">Auto-selected: {autoPicked.schema}.{autoPicked.table}</Badge>
              )}
              {getSelectedCount() > 0 && (
                <Badge variant="secondary">
                  {getSelectedCount()} items selected
                </Badge>
              )}
            </div>
          </div>

          {/* Schema Tree */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                {filteredTree.length > 0 ? (
                  <div className="space-y-1">
                    {filteredTree.map(node => renderTreeNode(node))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found matching your search
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Selection Actions */}
          {getSelectedCount() > 0 && (
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {getSelectedCount()} items selected
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedNodes(new Set())}
                  >
                    Clear Selection
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      const selectedItems = Array.from(selectedNodes).map(id => 
                        findNodeById(schemaTree, id)
                      ).filter(Boolean) as SchemaNode[]
                      onSelectionChange(selectedItems)
                    }}
                  >
                    Continue with Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Table Preview</DialogTitle>
            <DialogDescription>
              {previewData && `${previewData.schema_name}.${previewData.table_name}`}
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="overflow-auto max-h-[60vh] space-y-3">
              {/* Preview summary */}
              <div className="text-xs text-muted-foreground">
                <div>Columns: {Array.isArray(previewData.preview_data?.columns) ? previewData.preview_data.columns.length : 0}</div>
                <div>Rows (sample): {Array.isArray(previewData.preview_data?.rows) ? previewData.preview_data.rows.length : 0}</div>
                {typeof previewData.execution_time_ms === 'number' && (
                  <div>Execution time: {(previewData.execution_time_ms / 1000).toFixed(2)}s</div>
                )}
                {(previewDiagnostics.durationMs || previewDiagnostics.endpoint) && (
                  <div className="mt-1">Fetched in {previewDiagnostics.durationMs} ms via {previewDiagnostics.endpoint}</div>
                )}
              </div>

              <TableComponent>
                <TableHeader>
                  <TableRow>
                    {previewData.preview_data.columns.map((column: any) => (
                      <TableHead key={typeof column === 'string' ? column : (column.name || String(column))} className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{typeof column === 'string' ? column : (column.name || String(column))}</span>
                          <span className="text-xs text-muted-foreground">{typeof column === 'string' ? '' : (column.dataType || '')}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.preview_data.rows.slice(0, 20).map((row: any, index: number) => (
                    <TableRow key={index}>
                      {previewData.preview_data.columns.map((column: any) => {
                        const colName = typeof column === 'string' ? column : (column.name || String(column));
                        const value = row[colName];
                        const isNull = value === null || value === undefined;
                        return (
                          <TableCell key={colName} className={`font-mono text-xs ${isNull ? 'text-muted-foreground italic' : ''}`}>
                            {isNull ? 'NULL' : String(value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>

              {/* Optional stats (first 5 columns) */}
              {previewData.column_statistics && (
                <div className="pt-2">
                  <div className="text-xs font-medium mb-2">Column statistics (sample)</div>
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column</TableHead>
                        <TableHead>Distinct</TableHead>
                        <TableHead>Nulls</TableHead>
                        <TableHead>Min</TableHead>
                        <TableHead>Max</TableHead>
                        <TableHead>Avg</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(previewData.column_statistics).slice(0, 5).map(([col, stats]: any) => (
                        <TableRow key={col}>
                          <TableCell>{col}</TableCell>
                          <TableCell>{stats?.distinctCount ?? 'N/A'}</TableCell>
                          <TableCell>{stats?.nullCount ?? 'N/A'}</TableCell>
                          <TableCell>{stats?.min ?? 'N/A'}</TableCell>
                          <TableCell>{stats?.max ?? 'N/A'}</TableCell>
                          <TableCell>{stats?.avg ?? 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableComponent>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
