"use client"

import React, { useState, useEffect } from "react"
import { 
  ChevronRight, 
  ChevronDown, 
  Database, 
  Table, 
  Columns, 
  Search, 
  Filter, 
  Eye, 
  Download,
  RefreshCw,
  Check,
  Square,
  MinusSquare,
  CheckSquare,
  FileText,
  Folder,
  FolderOpen,
  Info,
  BarChart3,
  Activity
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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
  metadata?: any
  selected?: boolean
  expanded?: boolean
  parentPath?: string
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
  const [activeTab, setActiveTab] = useState("tree")
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (dataSourceId) {
      discoverSchema()
    }
  }, [dataSourceId])

  const discoverSchema = async () => {
    setIsLoading(true)
    setError(null)
    setDiscoveryProgress(0)
    setDiscoveryStatus("Connecting to data source...")

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDiscoveryProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      setDiscoveryStatus("Discovering schema structure...")

      const response = await fetch(`/api/data-discovery/data-sources/${dataSourceId}/discover-schema`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_source_id: dataSourceId,
          include_data_preview: false,
          max_tables_per_schema: 100
        })
      })

      if (!response.ok) {
        throw new Error(`Discovery failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      clearInterval(progressInterval)
      setDiscoveryProgress(100)
      setDiscoveryStatus("Discovery completed!")

      // Transform the schema structure into tree nodes
      const treeNodes = transformSchemaToTree(result.schema_structure)
      setSchemaTree(treeNodes)
      setSchemaStats(result.summary)

      // Auto-expand first level
      const firstLevelIds = treeNodes.map(node => node.id)
      setExpandedNodes(new Set(firstLevelIds))

    } catch (err: any) {
      setError(err.message || "Schema discovery failed")
      setDiscoveryProgress(0)
      setDiscoveryStatus("Discovery failed")
    } finally {
      setIsLoading(false)
    }
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
      
      // Update parent selection based on children
      // This would need more complex logic for hierarchical selection
      
      return newSet
    })
  }

  const handlePreviewTable = async (node: SchemaNode) => {
    if (node.type !== 'table' && node.type !== 'view') return

    try {
      const response = await fetch('/api/data-discovery/data-sources/preview-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_source_id: dataSourceId,
          schema_name: node.metadata.schemaName,
          table_name: node.metadata.tableName || node.metadata.viewName,
          limit: 50
        })
      })

      if (!response.ok) {
        throw new Error('Preview failed')
      }

      const result = await response.json()
      setPreviewData(result)
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

  const filteredTree = searchTerm ? 
    filterTree(schemaTree, searchTerm.toLowerCase()) : 
    schemaTree

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
            ref={(el) => {
              if (el) el.indeterminate = selectionState === 'indeterminate'
            }}
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Data Discovery</h2>
          <p className="text-sm text-muted-foreground">
            Explore and select data from {dataSourceName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={discoverSchema} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
            <AlertDescription>{error}</Alert>
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
            <div className="overflow-auto max-h-[60vh]">
              <TableComponent>
                <TableHeader>
                  <TableRow>
                    {previewData.preview_data.columns.map((column: string) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.preview_data.rows.slice(0, 20).map((row: any, index: number) => (
                    <TableRow key={index}>
                      {previewData.preview_data.columns.map((column: string) => (
                        <TableCell key={column} className="font-mono text-xs">
                          {row[column] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>
              
              {previewData.preview_data.rows.length > 20 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Showing first 20 rows of {previewData.preview_data.total_rows} total
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}