"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, Database, Table, Columns, Search, Eye, RefreshCw, FileText, Folder, FolderOpen } from 'lucide-react'

// Import enterprise services and utilities
import { discoverSchemaWithOptions, getDiscoveryStatus, stopDiscovery as stopDiscoveryApi, SchemaDiscoveryRequest } from "../services/enterprise-apis"
import { setupProgressTracking } from "../../shared/utils/progress-tracking"
import { logDiscoveryTelemetry, logPreviewTelemetry } from "../../shared/utils/telemetry"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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

interface SchemaNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  children?: SchemaNode[]
  metadata?: {
    // Common metadata
    description?: string
    lastUpdated?: string
    type?: string
    
    // Schema-specific metadata
    tableCount?: number
    viewCount?: number
    totalObjects?: number
    
    // Table-specific metadata
    rowCount?: number
    columnCount?: number
    primaryKeyColumns?: number
    estimatedSize?: number
    schemaName?: string
    tableName?: string
    
    // View-specific metadata
    viewName?: string
    definition?: string
    dependsOn?: string[]
    
    // Column-specific metadata
    dataType?: string
    nullable?: boolean
    primaryKey?: boolean
    isIndexed?: boolean
    isForeignKey?: boolean
    sourceColumn?: string
    columnName?: string
    statistics?: any
  }
  selected?: boolean
  expanded?: boolean
  parentPath?: string
}

interface SchemaDiscoveryProps {
  dataSourceId: number
  dataSourceName: string
  onSelectionChange: (selection: any[]) => void
  onClose: () => void
  initialSelectionManifest?: any
}

export function SchemaDiscovery({ 
  dataSourceId, 
  dataSourceName, 
  onSelectionChange, 
  onClose,
  initialSelectionManifest
}: SchemaDiscoveryProps) {
  const [schemaTree, setSchemaTree] = useState<SchemaNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [discoveryProgress, setDiscoveryProgress] = useState(0)
  const [discoveryStatus, setDiscoveryStatus] = useState<string>("")
  const [schemaStats, setSchemaStats] = useState<any>(null)
  const [subProgress, setSubProgress] = useState<{ schema?: string; table?: string; current?: number; total?: number } | null>(null)
  // const [activeTab, setActiveTab] = useState("tree") // Removed unused state
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pathIndex, setPathIndex] = useState<Record<string, string>>({})
  const [isStarted, setIsStarted] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any ongoing requests when component unmounts
      if (abortController) {
        abortController.abort()
      }
    }
  }, [abortController])

  // Real enterprise-grade schema discovery implementation with proper cancellation
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
    setDiscoveryStatus("Initializing connection to data source...")

    // Create abort controller for cancellation
    const controller = new AbortController()
    setAbortController(controller)

    try {
      // Set up progress tracking with WebSocket or EventSource for real-time updates
      const progressTracker: any = (setupProgressTracking as any)(dataSourceId, (progress: any) => {
        if (progress) {
          if (typeof progress.percentage === 'number') setDiscoveryProgress(progress.percentage)
          if (typeof progress.status === 'string') {
            // Build rich status string
            let label = progress.status
            if (progress.step === 'schemas_listed' && typeof progress.schemas_total === 'number') {
              label = `Schemas listed: ${progress.schemas_total}`
            } else if (progress.step === 'tables_discovered' && progress.schema && progress.table && typeof progress.tables_in_schema === 'number') {
              label = `Schema ${progress.schema} (${Math.min(progress.percentage, 99)}%): ${progress.table} (${progress.tables_in_schema} total)`
              // Update sub-progress for per-schema table completion
              const current = typeof progress.table_index === 'number' ? progress.table_index : undefined
              setSubProgress({ schema: progress.schema, table: progress.table, current, total: progress.tables_in_schema })
            } else if (progress.step === 'schema_completed' && typeof progress.schemas_completed === 'number' && typeof progress.schemas_total === 'number') {
              label = `Completed ${progress.schemas_completed}/${progress.schemas_total} schemas`
              setSubProgress(null)
            } else if (progress.step === 'aggregate' && typeof progress.tables_total === 'number') {
              label = `Aggregating (${progress.tables_total} tables)`
            } else if (progress.status === 'completed') {
              label = 'Discovery completed'
              setSubProgress(null)
            }
            setDiscoveryStatus(label)
          }
        }
      })

      // Use the enterprise API for schema discovery with advanced options
      const discoveryOptions: SchemaDiscoveryRequest = {
        data_source_id: dataSourceId,
        include_data_preview: false,
        auto_catalog: true, // Enable automatic cataloging for enterprise integration
        max_tables_per_schema: 1000 // Support larger schemas in production
      }

      // Call the enterprise API service with abort signal
      const result = await discoverSchemaWithOptions(dataSourceId, discoveryOptions, { signal: controller.signal })

      if (!result.success) {
        throw new Error(result.error || "Discovery failed with unknown error")
      }
      
      // Clean up progress tracking if available
      if (progressTracker && typeof progressTracker.disconnect === 'function') {
        progressTracker.disconnect()
      }
      
      setDiscoveryProgress(100)
      setDiscoveryStatus("Discovery completed successfully!")

      // Transform the schema structure into tree nodes with enhanced metadata
      const { nodes: treeNodes, index: builtIndex } = transformSchemaTo
      (result.data.schema_structure)
      setSchemaTree(treeNodes)
      setPathIndex(builtIndex)
      setSchemaStats(result.data.summary)

      // Auto-expand first level for better UX
      const firstLevelIds = treeNodes.map(node => node.id)
      setExpandedNodes(new Set(firstLevelIds))

      // Log telemetry for enterprise monitoring
      logDiscoveryTelemetry({
        dataSourceId,
        dataSourceName,
        discoveryTime: result.data.discovery_time,
        itemsDiscovered: result.data.summary.total_tables + result.data.summary.total_views,
        success: true
      })

    } catch (err: any) {
      // Don't show error if it was cancelled
      if (err.name === 'AbortError') {
        setDiscoveryStatus("Discovery cancelled")
        return
      }
      
      setError(err.message || "Schema discovery failed")
      setDiscoveryProgress(0)
      setDiscoveryStatus("Discovery failed")
      
      // Log error telemetry
      logDiscoveryTelemetry({
        dataSourceId,
        dataSourceName,
        error: err.message,
        success: false
      })
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
    setIsLoading(false)
    setDiscoveryStatus("Discovery stopped")
  }

  const transformSchemaToTree = (schemaStructure: any): { nodes: SchemaNode[]; index: Record<string, string> } => {
    const nodes: SchemaNode[] = []
    const index: Record<string, string> = {}

    if (schemaStructure.databases) {
      schemaStructure.databases.forEach((database: any, dbIndex: number) => {
        const dbNode: SchemaNode = {
          id: `db_${dbIndex}_${database.name}`,
          name: database.name,
          type: 'database',
          children: [],
          metadata: { 
            type: 'database', 
            lastUpdated: database.last_updated || new Date().toISOString()
          }
        }
        index[`${database.name}`] = dbNode.id

        if (database.schemas) {
          database.schemas.forEach((schema: any, schemaIndex: number) => {
            const tableCount = schema.tables?.length || 0
            const viewCount = schema.views?.length || 0
            
            const schemaNode: SchemaNode = {
              id: `schema_${dbIndex}_${schemaIndex}_${schema.name}`,
              name: schema.name,
              type: 'schema',
              children: [],
              parentPath: dbNode.id,
              metadata: { 
                type: 'schema', 
                tableCount: tableCount,
                viewCount: viewCount,
                totalObjects: tableCount + viewCount,
                description: schema.description || ''
              }
            }
            index[`${database.name}.${schema.name}`] = schemaNode.id

            // Add tables with enhanced metadata
            if (schema.tables) {
              schema.tables.forEach((table: any, tableIndex: number) => {
                const columnCount = table.columns?.length || 0
                const primaryKeyColumns = table.columns?.filter((col: any) => col.primary_key)?.length || 0
                
                const tableNode: SchemaNode = {
                  id: `table_${dbIndex}_${schemaIndex}_${tableIndex}_${table.name}`,
                  name: table.name,
                  type: 'table',
                  children: [],
                  parentPath: `${dbNode.id}/${schemaNode.id}`,
                  metadata: { 
                    type: 'table', 
                    columnCount: columnCount,
                    primaryKeyColumns: primaryKeyColumns,
                    rowCount: table.row_count,
                    schemaName: schema.name,
                    tableName: table.name,
                    estimatedSize: table.estimated_size_bytes,
                    description: table.description || ''
                  }
                }
                index[`${database.name}.${schema.name}.${table.name}`] = tableNode.id

                // Add columns with enhanced metadata
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
                        isIndexed: column.is_indexed || false,
                        isForeignKey: column.is_foreign_key || false,
                        schemaName: schema.name,
                        tableName: table.name,
                        columnName: column.name,
                        description: column.description || '',
                        statistics: column.statistics || {}
                      }
                    }
                    index[`${database.name}.${schema.name}.${table.name}.${column.name}`] = columnNode.id
                    tableNode.children!.push(columnNode)
                  })
                  
                  // Sort columns - primary keys first, then alphabetically
                  tableNode.children!.sort((a, b) => {
                    const aPK = (a.metadata as any)?.primaryKey
                    const bPK = (b.metadata as any)?.primaryKey
                    if (aPK && !bPK) return -1
                    if (!aPK && bPK) return 1
                    return a.name.localeCompare(b.name)
                  })
                }

                schemaNode.children!.push(tableNode)
              })
            }

            // Add views with enhanced metadata
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
                    viewName: view.name,
                    definition: view.definition || '',
                    dependsOn: view.depends_on || [],
                    description: view.description || ''
                  }
                }

                // Add view columns with enhanced metadata
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
                        columnName: column.name,
                        sourceColumn: column.source_column || '',
                        description: column.description || ''
                      }
                    }
                    viewNode.children!.push(columnNode)
                  })
                  
                  // Sort columns alphabetically
                  viewNode.children!.sort((a, b) => a.name.localeCompare(b.name))
                }

                schemaNode.children!.push(viewNode)
              })
            }
            
            // Sort children by type (tables first, then views) and then alphabetically
            schemaNode.children!.sort((a, b) => {
              if (a.type !== b.type) {
                return a.type === 'table' ? -1 : 1
              }
              return a.name.localeCompare(b.name)
            })

            dbNode.children!.push(schemaNode)
          })
        }

        nodes.push(dbNode)
      })
    }

    return { nodes, index }
  }

  // Preselect nodes from manifest when tree and index are ready
  useEffect(() => {
    if (!initialSelectionManifest || !schemaTree.length || !Object.keys(pathIndex).length) return
    const toSelect = new Set<string>()
    try {
      for (const db of initialSelectionManifest.databases || []) {
        // If whole database chosen (no schemas?), select db
        if (!db.schemas || db.schemas.length === 0) {
          const id = pathIndex[`${db.name}`]
          if (id) toSelect.add(id)
          continue
        }
        for (const sch of db.schemas) {
          // If whole schema
          if (!sch.tables || sch.tables.length === 0) {
            const id = pathIndex[`${db.name}.${sch.name}`]
            if (id) toSelect.add(id)
            continue
          }
          for (const tbl of sch.tables) {
            const tableId = pathIndex[`${db.name}.${sch.name}.${tbl.name}`]
            if (tableId) toSelect.add(tableId)
            // Columns
            if (Array.isArray(tbl.columns) && tbl.columns.length > 0) {
              for (const col of tbl.columns) {
                const colId = pathIndex[`${db.name}.${sch.name}.${tbl.name}.${col}`]
                if (colId) toSelect.add(colId)
              }
            }
          }
        }
      }
      if (toSelect.size > 0) {
        setSelectedNodes(toSelect)
      }
    } catch {}
  }, [initialSelectionManifest, schemaTree, pathIndex])

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
      
      // Update parent selection based on children
      // This would need more complex logic for hierarchical selection
      
      return newSet
    })
  }

  const handlePreviewTable = async (node: SchemaNode) => {
    if (node.type !== 'table' && node.type !== 'view') return

    try {
      // Use the enterprise API service for data preview with advanced options
      const previewOptions = {
        data_source_id: dataSourceId,
        schema_name: node.metadata?.schemaName || '',
        table_name: node.metadata?.tableName || node.metadata?.viewName || node.name,
        limit: 50,
        include_statistics: true,  // Include column statistics for enterprise insights
        apply_data_masking: true,   // Apply data masking for sensitive data
        timeout_seconds: 30         // Configure timeout for large tables
      }

      const token = (typeof window !== 'undefined' && localStorage.getItem('authToken')) || ''
      const response = await fetch(`/proxy/data-discovery/data-sources/${dataSourceId}/preview-table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(previewOptions)
      })

      if (!response.ok) {
        throw new Error('Preview failed')
      }

      const result = await response.json()
      
      // Process and enhance the preview data with additional metadata
      const enhancedPreviewData = {
        ...result,
        preview_data: {
          ...result.preview_data,
          columns: result.preview_data.columns.map((column: string) => ({
            name: column,
            statistics: result.column_statistics?.[column] || {},
            dataType: result.column_types?.[column] || 'unknown'
          })),
          total_rows: result.preview_data.total_rows || result.preview_data.rows.length
        }
      }
      
      setPreviewData(enhancedPreviewData)
      setShowPreviewDialog(true)

      // Log telemetry for enterprise monitoring
      logPreviewTelemetry && logPreviewTelemetry({
        dataSourceId,
        schemaName: node.metadata?.schemaName,
        tableName: node.metadata?.tableName || node.metadata?.viewName || node.name,
        rowCount: result.preview_data.rows.length,
        success: true
      })

    } catch (err) {
      console.error('Table preview failed:', err)
      
      // Log error telemetry
      logPreviewTelemetry && logPreviewTelemetry({
        dataSourceId,
        schemaName: node.metadata?.schemaName,
        tableName: node.metadata?.tableName || node.metadata?.viewName || node.name,
        error: err,
        success: false
      })
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
    
    // Check if any children are selected (indeterminate state)
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

  const filterTree = (nodes: SchemaNode[], term: string): SchemaNode[] => {
    return nodes.filter(node => {
      const matches = node.name.toLowerCase().includes(term)
      const hasMatchingChildren = node.children ? 
        filterTree(node.children, term).length > 0 : false
      
      if (matches || hasMatchingChildren) {
        return {
          ...node,
          children: node.children ? filterTree(node.children, term) : undefined
        }
      }
      return false
    }).filter(Boolean) as SchemaNode[]
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
            checked={selectionState === 'indeterminate' ? 'indeterminate' : selectionState === 'checked'}
            onCheckedChange={(checked) => handleNodeSelect(node.id, Boolean(checked))}
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Data Discovery</h2>
          <p className="text-sm text-muted-foreground">
            Explore and select data from {dataSourceName}
          </p>
          {subProgress && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <span>Current: {subProgress.schema}.{subProgress.table}</span>
              {typeof subProgress.current === 'number' && typeof subProgress.total === 'number' && (
                <>
                  <span>({subProgress.current}/{subProgress.total})</span>
                  <div className="w-40">
                    <Progress value={Math.round(100 * (subProgress.current / Math.max(1, subProgress.total)))} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isStarted ? (
            <Button onClick={discoverSchema} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Discovery
            </Button>
          ) : isLoading ? (
            <Button variant="destructive" onClick={stopDiscovery}>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Stop Discovery
            </Button>
          ) : (
            <Button onClick={discoverSchema} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Discovery
            </Button>
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
              <span>{discoveryStatus}</span>
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

      {/* Main Content */}
      {!isLoading && !error && (
        <div className="flex-1 flex flex-col">
          {/* Summary Stats */}
          {schemaStats && (
            <div className="p-4 border-b">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{schemaStats.total_databases}</div>
                  <div className="text-xs text-muted-foreground">Databases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{schemaStats.total_schemas}</div>
                  <div className="text-xs text-muted-foreground">Schemas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{schemaStats.total_tables}</div>
                  <div className="text-xs text-muted-foreground">Tables</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{schemaStats.total_columns}</div>
                  <div className="text-xs text-muted-foreground">Columns</div>
                </div>
              </div>
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
                      const selections: any[] = []
                      const addTable = (dbName: string, schemaName: string, tableName: string) => {
                        selections.push({ database: dbName, schema: schemaName, table: tableName })
                      }
                      const addColumn = (dbName: string, schemaName: string, tableName: string, columnName: string) => {
                        selections.push({ database: dbName, schema: schemaName, table: tableName, column: columnName })
                      }
                      const visitedTables = new Set<string>()
                      for (const id of Array.from(selectedNodes)) {
                        const node = findNodeById(schemaTree, id)
                        if (!node) continue
                        if (node.type === 'table') {
                          const dbName = dataSourceName
                          const schemaName = node.metadata?.schemaName || ''
                          const tableName = node.metadata?.tableName || node.name
                          const key = `${schemaName}.${tableName}`
                          if (!visitedTables.has(key)) {
                            visitedTables.add(key)
                            addTable(dbName, schemaName, tableName)
                          }
                        } else if (node.type === 'column') {
                          const schemaName = node.metadata?.schemaName || ''
                          const tableName = node.metadata?.tableName || ''
                          const columnName = node.metadata?.columnName || node.name
                          addColumn(dataSourceName, schemaName, tableName, columnName)
                        } else if (node.type === 'schema') {
                          // include all tables under schema
                          node.children?.filter(c => c.type === 'table').forEach(tbl => {
                            addTable(dataSourceName, tbl.metadata?.schemaName || '', tbl.metadata?.tableName || tbl.name)
                          })
                        } else if (node.type === 'database') {
                          // include all tables under database
                          node.children?.forEach(sch => sch.children?.filter(c => c.type === 'table').forEach(tbl => {
                            addTable(node.name, tbl.metadata?.schemaName || '', tbl.metadata?.tableName || tbl.name)
                          }))
                        }
                      }
                      onSelectionChange(selections)
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

      {/* Enhanced Table Preview Dialog with Statistics and Data Quality */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Table Preview</DialogTitle>
            <DialogDescription>
              {previewData && `${previewData.schema_name}.${previewData.table_name}`}
              {previewData?.execution_time_ms && ` • Query executed in ${(previewData.execution_time_ms / 1000).toFixed(2)}s`}
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="data">Data Preview</TabsTrigger>
                <TabsTrigger value="stats">Column Statistics</TabsTrigger>
                <TabsTrigger value="quality">Data Quality</TabsTrigger>
              </TabsList>
              
              <TabsContent value="data" className="overflow-auto max-h-[60vh]">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      {previewData.preview_data.columns.map((column: any) => (
                        <TableHead key={column.name || column} className="whitespace-nowrap">
                          <div className="flex flex-col">
                            <span>{column.name || column}</span>
                            <span className="text-xs text-muted-foreground">{column.dataType || ''}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.preview_data.rows.slice(0, 20).map((row: any, index: number) => (
                      <TableRow key={index}>
                        {previewData.preview_data.columns.map((column: any) => {
                          const colName = column.name || column;
                          const value = row[colName];
                          const isNull = value === null || value === undefined;
                          
                          return (
                            <TableCell key={colName} className={`font-mono text-xs ${isNull ? 'text-muted-foreground italic' : ''}`}>
                              {isNull ? 'NULL' : value || '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
                
                {previewData.preview_data.rows.length > 20 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Showing first 20 rows of {previewData.preview_data.total_rows} total
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="stats" className="overflow-auto max-h-[60vh]">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Distinct Values</TableHead>
                      <TableHead>Null Count</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Max</TableHead>
                      <TableHead>Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.preview_data.columns.map((column: any) => {
                      const colName = column.name || column;
                      const stats = column.statistics || {};
                      return (
                        <TableRow key={colName}>
                          <TableCell>{colName}</TableCell>
                          <TableCell>{column.dataType || 'unknown'}</TableCell>
                          <TableCell>{stats.distinctCount || 'N/A'}</TableCell>
                          <TableCell>{stats.nullCount !== undefined ? stats.nullCount : 'N/A'}</TableCell>
                          <TableCell>{stats.min !== undefined ? String(stats.min) : 'N/A'}</TableCell>
                          <TableCell>{stats.max !== undefined ? String(stats.max) : 'N/A'}</TableCell>
                          <TableCell>{stats.avg !== undefined ? String(stats.avg) : 'N/A'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </TableComponent>
              </TabsContent>
              
              <TabsContent value="quality" className="overflow-auto max-h-[60vh]">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Completeness</TableHead>
                      <TableHead>Uniqueness</TableHead>
                      <TableHead>Consistency</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Overall Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.preview_data.columns.map((column: any) => {
                      const colName = column.name || column;
                      const quality = column.dataQuality || {};
                      const getQualityBadge = (score?: number) => {
                        if (score === undefined) return <Badge variant="outline">N/A</Badge>;
                        if (score >= 90) return <Badge className="bg-green-500">High</Badge>;
                        if (score >= 70) return <Badge className="bg-yellow-500">Medium</Badge>;
                        return <Badge className="bg-red-500">Low</Badge>;
                      };
                      
                      return (
                        <TableRow key={colName}>
                          <TableCell>{colName}</TableCell>
                          <TableCell>{getQualityBadge(quality.completeness)}</TableCell>
                          <TableCell>{getQualityBadge(quality.uniqueness)}</TableCell>
                          <TableCell>{getQualityBadge(quality.consistency)}</TableCell>
                          <TableCell>{getQualityBadge(quality.validity)}</TableCell>
                          <TableCell>
                            {quality.overallScore !== undefined ? (
                              <div className="flex items-center gap-2">
                                <Progress value={quality.overallScore} className="h-2 w-20" />
                                <span>{quality.overallScore}%</span>
                              </div>
                            ) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </TableComponent>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
