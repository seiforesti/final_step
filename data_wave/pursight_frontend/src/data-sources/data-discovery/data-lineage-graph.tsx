"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  NodeTypes,
  EdgeTypes,
  MarkerType,
  Position,
  Handle,
  NodeProps,
  EdgeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Database, Table, Columns, FileText, Activity, GitBranch, Filter, ZoomIn, ZoomOut, Maximize2, Download, RefreshCw, Settings, Search, Eye, Info, Play, AlertTriangle, CheckCircle, Clock, Layers, Share2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Custom Node Components
function DataSourceNode({ data, selected }: NodeProps) {
  return (
    <div className={`relative bg-background border-2 rounded-lg p-3 min-w-[200px] ${
      selected ? 'border-primary shadow-lg' : 'border-border'
    }`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5 text-blue-500" />
        <div>
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.type}</div>
        </div>
      </div>
      
      {data.metrics && (
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>
            <span className="text-muted-foreground">Tables:</span>
            <span className="ml-1 font-medium">{data.metrics.tables}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Size:</span>
            <span className="ml-1 font-medium">{data.metrics.size}</span>
          </div>
        </div>
      )}
      
      {data.status && (
        <div className="absolute -top-1 -right-1">
          {data.status === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {data.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
          {data.status === 'processing' && <Clock className="h-4 w-4 text-yellow-500" />}
        </div>
      )}
    </div>
  )
}

function TableNode({ data, selected }: NodeProps) {
  return (
    <div className={`relative bg-background border-2 rounded-lg p-3 min-w-[180px] ${
      selected ? 'border-primary shadow-lg' : 'border-border'
    }`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <Table className="h-4 w-4 text-green-500" />
        <div>
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.schema}</div>
        </div>
      </div>
      
      {data.columns && (
        <div className="text-xs text-muted-foreground">
          {data.columns} columns • {data.rows || 0} rows
        </div>
      )}
      
      {data.classification && (
        <Badge variant="outline" className="mt-1 text-xs">
          {data.classification}
        </Badge>
      )}
    </div>
  )
}

function ProcessNode({ data, selected }: NodeProps) {
  return (
    <div className={`relative bg-background border-2 rounded-lg p-3 min-w-[160px] ${
      selected ? 'border-primary shadow-lg' : 'border-border'
    }`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-4 w-4 text-purple-500" />
        <div>
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.type}</div>
        </div>
      </div>
      
      {data.lastRun && (
        <div className="text-xs text-muted-foreground">
          Last run: {data.lastRun}
        </div>
      )}
    </div>
  )
}

// Custom Edge Component
function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`
  
  return (
    <g>
      <path
        id={id}
        style={{
          stroke: data?.type === 'dependency' ? '#ef4444' : '#6366f1',
          strokeWidth: data?.strength === 'strong' ? 3 : 2,
          strokeDasharray: data?.type === 'inferred' ? '5,5' : 'none'
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrowhead)"
      />
      {data?.label && (
        <text>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle" className="text-xs fill-current">
            {data.label}
          </textPath>
        </text>
      )}
    </g>
  )
}

const nodeTypes: NodeTypes = {
  dataSource: DataSourceNode,
  table: TableNode,
  process: ProcessNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

interface DataLineageGraphProps {
  dataSourceId?: number
  selectedItems?: any[]
  onNodeSelect?: (node: Node) => void
  onEdgeSelect?: (edge: Edge) => void
}

export function DataLineageGraph({ 
  dataSourceId, 
  selectedItems = [], 
  onNodeSelect, 
  onEdgeSelect 
}: DataLineageGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [showNodeDetails, setShowNodeDetails] = useState(false)
  const [layoutDirection, setLayoutDirection] = useState<'horizontal' | 'vertical'>('horizontal')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOptions, setFilterOptions] = useState({
    showDataSources: true,
    showTables: true,
    showProcesses: true,
    showDependencies: true,
    showInferred: false
  })

  // Generate sample lineage data
  useEffect(() => {
    generateLineageData()
  }, [dataSourceId, selectedItems])

  const generateLineageData = () => {
    setIsLoading(true)
    
    // Sample data - in real implementation, this would come from the backend
    const sampleNodes: Node[] = [
      {
        id: 'ds1',
        type: 'dataSource',
        position: { x: 50, y: 100 },
        data: {
          label: 'PostgreSQL Production',
          type: 'PostgreSQL',
          status: 'active',
          metrics: { tables: 45, size: '2.4TB' }
        }
      },
      {
        id: 'table1',
        type: 'table',
        position: { x: 350, y: 50 },
        data: {
          label: 'users',
          schema: 'public',
          columns: 12,
          rows: 150000,
          classification: 'PII'
        }
      },
      {
        id: 'table2',
        type: 'table',
        position: { x: 350, y: 150 },
        data: {
          label: 'orders',
          schema: 'public',
          columns: 8,
          rows: 500000,
          classification: 'Business'
        }
      },
      {
        id: 'process1',
        type: 'process',
        position: { x: 650, y: 100 },
        data: {
          label: 'ETL Pipeline',
          type: 'Data Transform',
          lastRun: '2 hours ago'
        }
      },
      {
        id: 'ds2',
        type: 'dataSource',
        position: { x: 950, y: 100 },
        data: {
          label: 'Snowflake Analytics',
          type: 'Snowflake',
          status: 'active',
          metrics: { tables: 23, size: '890GB' }
        }
      },
      {
        id: 'table3',
        type: 'table',
        position: { x: 1250, y: 100 },
        data: {
          label: 'user_analytics',
          schema: 'analytics',
          columns: 15,
          rows: 150000,
          classification: 'Analytics'
        }
      }
    ]

    const sampleEdges: Edge[] = [
      {
        id: 'e1',
        source: 'ds1',
        target: 'table1',
        type: 'custom',
        data: { type: 'contains', strength: 'strong' }
      },
      {
        id: 'e2',
        source: 'ds1',
        target: 'table2',
        type: 'custom',
        data: { type: 'contains', strength: 'strong' }
      },
      {
        id: 'e3',
        source: 'table1',
        target: 'process1',
        type: 'custom',
        data: { type: 'reads', label: 'user data', strength: 'strong' }
      },
      {
        id: 'e4',
        source: 'table2',
        target: 'process1',
        type: 'custom',
        data: { type: 'reads', label: 'order data', strength: 'strong' }
      },
      {
        id: 'e5',
        source: 'process1',
        target: 'ds2',
        type: 'custom',
        data: { type: 'writes', strength: 'strong' }
      },
      {
        id: 'e6',
        source: 'ds2',
        target: 'table3',
        type: 'custom',
        data: { type: 'contains', strength: 'strong' }
      }
    ]

    setNodes(sampleNodes)
    setEdges(sampleEdges)
    setIsLoading(false)
  }

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setShowNodeDetails(true)
    onNodeSelect?.(node)
  }, [onNodeSelect])

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    onEdgeSelect?.(edge)
  }, [onEdgeSelect])

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (!filterOptions.showDataSources && node.type === 'dataSource') return false
      if (!filterOptions.showTables && node.type === 'table') return false
      if (!filterOptions.showProcesses && node.type === 'process') return false
      
      if (searchTerm) {
        return node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
      }
      
      return true
    })
  }, [nodes, filterOptions, searchTerm])

  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      if (!filterOptions.showDependencies && edge.data?.type === 'dependency') return false
      if (!filterOptions.showInferred && edge.data?.type === 'inferred') return false
      
      // Only show edges where both source and target nodes are visible
      const sourceVisible = filteredNodes.some(node => node.id === edge.source)
      const targetVisible = filteredNodes.some(node => node.id === edge.target)
      
      return sourceVisible && targetVisible
    })
  }, [edges, filteredNodes, filterOptions])

  const handleLayout = (direction: 'horizontal' | 'vertical') => {
    setLayoutDirection(direction)
    // In a real implementation, you'd run a layout algorithm here
    // For now, we'll just update the layout direction
  }

  const handleExport = () => {
    // Export lineage as image or data
    console.log('Exporting lineage data...')
  }

  const handleRefresh = () => {
    generateLineageData()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">Data Lineage</h3>
          <p className="text-sm text-muted-foreground">
            Visualize data flow and relationships
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Lineage Filters</SheetTitle>
                <SheetDescription>
                  Configure what to show in the lineage graph
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Node Types</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-data-sources"
                      checked={filterOptions.showDataSources}
                      onCheckedChange={(checked) => 
                        setFilterOptions(prev => ({ ...prev, showDataSources: checked }))
                      }
                    />
                    <Label htmlFor="show-data-sources">Data Sources</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-tables"
                      checked={filterOptions.showTables}
                      onCheckedChange={(checked) => 
                        setFilterOptions(prev => ({ ...prev, showTables: checked }))
                      }
                    />
                    <Label htmlFor="show-tables">Tables & Views</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-processes"
                      checked={filterOptions.showProcesses}
                      onCheckedChange={(checked) => 
                        setFilterOptions(prev => ({ ...prev, showProcesses: checked }))
                      }
                    />
                    <Label htmlFor="show-processes">Processes</Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Relationships</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-dependencies"
                      checked={filterOptions.showDependencies}
                      onCheckedChange={(checked) => 
                        setFilterOptions(prev => ({ ...prev, showDependencies: checked }))
                      }
                    />
                    <Label htmlFor="show-dependencies">Dependencies</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-inferred"
                      checked={filterOptions.showInferred}
                      onCheckedChange={(checked) => 
                        setFilterOptions(prev => ({ ...prev, showInferred: checked }))
                      }
                    />
                    <Label htmlFor="show-inferred">Inferred Relationships</Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Layout</h4>
                  
                  <Select 
                    value={layoutDirection} 
                    onValueChange={(value: 'horizontal' | 'vertical') => handleLayout(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'dataSource': return '#3b82f6'
                case 'table': return '#10b981'
                case 'process': return '#8b5cf6'
                default: return '#6b7280'
              }
            }}
            maskColor="rgba(0, 0, 0, 0.2)"
          />
          <Background variant="dots" gap={12} size={1} />
          
          {/* Custom SVG definitions for arrow markers */}
          <svg>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#6366f1"
                />
              </marker>
            </defs>
          </svg>
        </ReactFlow>
        
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading lineage data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span>Data Source</span>
          </div>
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-green-500" />
            <span>Table/View</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <span>Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span>Data Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500"></div>
            <span>Dependency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400 border-dashed"></div>
            <span>Inferred</span>
          </div>
        </div>
      </div>

      {/* Node Details Dialog */}
      <Dialog open={showNodeDetails} onOpenChange={setShowNodeDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedNode?.data.label || 'Node Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedNode?.type} • {selectedNode?.data.type}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNode && (
            <div className="space-y-4">
              {selectedNode.data.metrics && (
                <div>
                  <h4 className="font-medium mb-2">Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(selectedNode.data.metrics).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="ml-2 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedNode.data.classification && (
                <div>
                  <h4 className="font-medium mb-2">Classification</h4>
                  <Badge variant="outline">{selectedNode.data.classification}</Badge>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Run Analysis
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}