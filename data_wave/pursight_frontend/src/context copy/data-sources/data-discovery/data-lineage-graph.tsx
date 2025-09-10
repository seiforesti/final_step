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
  Position,
  Handle,
  NodeProps,
  EdgeProps,
  useReactFlow,
  Panel,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { 
  Database, Table, Activity, Filter, Download, RefreshCw, Search, Eye, AlertTriangle, CheckCircle, Clock,
  Zap, Shield, TrendingUp, Users, BarChart3, Settings, Play, Pause, Maximize2, Minimize2,
  Info, AlertCircle, Star, Target, ArrowRight, ArrowLeft, ArrowUpDown, Layers, Network,
  Brain, Sparkles, Gauge, Lock, Unlock, Activity as ActivityIcon, Globe, Cpu, HardDrive
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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

// Advanced Custom Node Components
function DataSourceNode({ data, selected }: NodeProps) {
  const qualityScore = data.quality_score || 0
  const businessValue = data.business_value_score || 0
  const piiDetected = data.pii_detected || false
  const complianceScore = data.compliance_score || 0
  
  return (
    <div className={`relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 rounded-xl p-4 min-w-[220px] shadow-lg ${
      selected ? 'border-blue-500 shadow-xl ring-2 ring-blue-200' : 'border-blue-300'
    }`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-500 rounded-lg">
          <Database className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-blue-900 dark:text-blue-100">{data.label}</div>
          <div className="text-xs text-blue-600 dark:text-blue-300">{data.type}</div>
        </div>
        {data.status && (
          <div className="flex items-center gap-1">
            {data.status === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {data.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
            {data.status === 'processing' && <Clock className="h-4 w-4 text-yellow-500" />}
          </div>
        )}
      </div>
      
      {/* Quality and Business Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Quality</span>
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            <span className="text-xs font-bold">{Math.round(qualityScore * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Business Value</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-bold">{Math.round(businessValue * 100)}%</span>
          </div>
        </div>
        
        {piiDetected && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <Shield className="h-3 w-3" />
            <span className="font-medium">PII Detected</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Compliance</span>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span className="text-xs font-bold">{Math.round(complianceScore * 100)}%</span>
          </div>
        </div>
      </div>
      
      {data.metrics && (
        <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Table className="h-3 w-3" />
              <span className="text-blue-600 dark:text-blue-400">{data.metrics.tables}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span className="text-blue-600 dark:text-blue-400">{data.metrics.size}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TableNode({ data, selected }: NodeProps) {
  const qualityScore = data.quality_score || 0
  const businessValue = data.business_value_score || 0
  const piiDetected = data.pii_detected || false
  const complianceScore = data.compliance_score || 0
  const relationshipStrength = data.relationship_strength || 0
  const relationshipType = data.relationship_type || 'unknown'
  
  return (
    <div className={`relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 rounded-xl p-4 min-w-[200px] shadow-lg ${
      selected ? 'border-green-500 shadow-xl ring-2 ring-green-200' : 'border-green-300'
    }`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-green-500 rounded-lg">
          <Table className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-green-900 dark:text-green-100">{data.label}</div>
          <div className="text-xs text-green-600 dark:text-green-300">{data.schema}</div>
        </div>
        {data.type === 'current' && (
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-blue-500" />
          </div>
        )}
      </div>
      
      {/* Quality and Business Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-green-700 dark:text-green-300">Quality</span>
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            <span className="text-xs font-bold">{Math.round(qualityScore * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-green-700 dark:text-green-300">Business Value</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-bold">{Math.round(businessValue * 100)}%</span>
          </div>
        </div>
        
        {piiDetected && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <Shield className="h-3 w-3" />
            <span className="font-medium">PII Detected</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-green-700 dark:text-green-300">Compliance</span>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span className="text-xs font-bold">{Math.round(complianceScore * 100)}%</span>
          </div>
        </div>
      </div>
      
      {/* Relationship Information */}
      {relationshipStrength > 0 && (
        <div className="mt-3 pt-2 border-t border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-green-700 dark:text-green-300">Relationship</span>
            <div className="flex items-center gap-1">
              <Network className="h-3 w-3" />
              <span className="text-xs font-bold">{Math.round(relationshipStrength * 100)}%</span>
            </div>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 capitalize">
            {relationshipType.replace('_', ' ')}
          </div>
        </div>
      )}
      
      {/* Table Information */}
      {data.columns && (
        <div className="mt-3 pt-2 border-t border-green-200 dark:border-green-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              <span className="text-green-600 dark:text-green-400">{data.columns} cols</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span className="text-green-600 dark:text-green-400">{data.rows || 0} rows</span>
            </div>
          </div>
        </div>
      )}
      
      {data.classification && (
        <div className="mt-2">
          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
            {data.classification}
          </Badge>
        </div>
      )}
    </div>
  )
}

function ProcessNode({ data, selected }: NodeProps) {
  const qualityScore = data.quality_score || 0
  const businessValue = data.business_value_score || 0
  const piiDetected = data.pii_detected || false
  const complianceScore = data.compliance_score || 0
  
  return (
    <div className={`relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 rounded-xl p-4 min-w-[180px] shadow-lg ${
      selected ? 'border-purple-500 shadow-xl ring-2 ring-purple-200' : 'border-purple-300'
    }`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-purple-500 rounded-lg">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-purple-900 dark:text-purple-100">{data.label}</div>
          <div className="text-xs text-purple-600 dark:text-purple-300">{data.type}</div>
        </div>
      </div>
      
      {/* Quality and Business Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Quality</span>
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            <span className="text-xs font-bold">{Math.round(qualityScore * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Business Value</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-bold">{Math.round(businessValue * 100)}%</span>
          </div>
        </div>
        
        {piiDetected && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <Shield className="h-3 w-3" />
            <span className="font-medium">PII Detected</span>
          </div>
        )}
      </div>
      
      {data.lastRun && (
        <div className="mt-3 pt-2 border-t border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
            <Clock className="h-3 w-3" />
            <span>Last run: {data.lastRun}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// New Advanced Node Types
function AINode({ data, selected }: NodeProps) {
  const confidence = data.ai_confidence_score || 0
  const businessValue = data.business_value_score || 0
  
  return (
    <div className={`relative bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-2 rounded-xl p-4 min-w-[200px] shadow-lg ${
      selected ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-200' : 'border-indigo-300'
    }`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-indigo-500 rounded-lg">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-indigo-900 dark:text-indigo-100">{data.label}</div>
          <div className="text-xs text-indigo-600 dark:text-indigo-300">AI Analysis</div>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI Confidence</span>
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span className="text-xs font-bold">{Math.round(confidence * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Business Value</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-bold">{Math.round(businessValue * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComplianceNode({ data, selected }: NodeProps) {
  const complianceScore = data.compliance_score || 0
  const piiDetected = data.pii_detected || false
  const dataSensitivity = data.data_sensitivity || 'internal'
  
  return (
    <div className={`relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 rounded-xl p-4 min-w-[200px] shadow-lg ${
      selected ? 'border-orange-500 shadow-xl ring-2 ring-orange-200' : 'border-orange-300'
    }`}>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-orange-500 rounded-lg">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-orange-900 dark:text-orange-100">{data.label}</div>
          <div className="text-xs text-orange-600 dark:text-orange-300">Compliance</div>
        </div>
        {piiDetected && (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Compliance</span>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span className="text-xs font-bold">{Math.round(complianceScore * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Sensitivity</span>
          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
            {dataSensitivity}
          </Badge>
        </div>
        
        {piiDetected && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <Shield className="h-3 w-3" />
            <span className="font-medium">PII Detected</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Advanced Custom Edge Component
function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`
  
  const getEdgeColor = () => {
    if (data?.type === 'dependency') return '#ef4444'
    if (data?.type === 'data_flow') return '#10b981'
    if (data?.type === 'business_domain') return '#8b5cf6'
    if (data?.type === 'naming_pattern') return '#f59e0b'
    if (data?.type === 'quality_similar') return '#06b6d4'
    return '#6366f1'
  }
  
  const getEdgeWidth = () => {
    if (data?.strength > 0.8) return 4
    if (data?.strength > 0.5) return 3
    if (data?.strength > 0.2) return 2
    return 1
  }
  
  const getEdgeStyle = () => {
    if (data?.type === 'inferred') return '5,5'
    if (data?.type === 'weak') return '10,5'
    return 'none'
  }
  
  return (
    <g>
      <path
        id={id}
        style={{
          stroke: getEdgeColor(),
          strokeWidth: getEdgeWidth(),
          strokeDasharray: getEdgeStyle(),
          fill: 'none'
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrowhead)"
      />
      {data?.label && (
        <text>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle" className="text-xs fill-current font-medium">
            {data.label}
          </textPath>
        </text>
      )}
      {data?.strength && (
        <text>
          <textPath href={`#${id}`} startOffset="75%" textAnchor="middle" className="text-xs fill-current opacity-70">
            {Math.round(data.strength * 100)}%
          </textPath>
        </text>
      )}
    </g>
  )
}

// Enhanced Node Types
const nodeTypes: NodeTypes = {
  dataSource: DataSourceNode,
  table: TableNode,
  process: ProcessNode,
  ai: AINode,
  compliance: ComplianceNode,
  current: TableNode, // Use TableNode for current asset
  upstream: TableNode, // Use TableNode for upstream assets
  downstream: TableNode, // Use TableNode for downstream assets
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

// Internal component that uses ReactFlow hooks
function DataLineageGraphInternal({ 
  dataSourceId, 
  selectedItems = [], 
  onNodeSelect, 
  onEdgeSelect 
}: DataLineageGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showNodeDetails, setShowNodeDetails] = useState(false)
  const [layoutDirection, setLayoutDirection] = useState<'horizontal' | 'vertical'>('horizontal')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOptions, setFilterOptions] = useState({
    showDataSources: true,
    showTables: true,
    showProcesses: true,
    showDependencies: true,
    showInferred: false,
    showAI: true,
    showCompliance: true
  })
  const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || "/proxy"
  const [upstreamDepth, setUpstreamDepth] = useState<number>(3)
  const [downstreamDepth, setDownstreamDepth] = useState<number>(3)
  const [includeNeighbors, setIncludeNeighbors] = useState<boolean>(true)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false)
  const [refreshSeconds, setRefreshSeconds] = useState<number>(60)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'compliance'>('overview')
  const [showMetrics, setShowMetrics] = useState<boolean>(true)
  const [showBusinessContext, setShowBusinessContext] = useState<boolean>(true)
  const [showQualityMetrics, setShowQualityMetrics] = useState<boolean>(true)
  const [lineageData, setLineageData] = useState<any>(null)
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  useEffect(() => {
    fetchLineage()
  }, [dataSourceId, JSON.stringify(selectedItems), upstreamDepth, downstreamDepth, includeNeighbors])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => fetchLineage(), Math.max(10, refreshSeconds) * 1000)
    return () => clearInterval(id)
  }, [autoRefresh, refreshSeconds, dataSourceId, JSON.stringify(selectedItems), upstreamDepth, downstreamDepth, includeNeighbors])

  const buildSelectionFilter = () => {
    // Prefer server-side tag filter; also pass explicit selection for precision if API supports it
    const selection = selectedItems?.filter(Boolean).map((s: any) => ({
      database: s.database,
      schema: s.schema,
      table: s.table,
      column: s.column
    }))
    return { tag: 'selection:selected', selection, upstream_depth: upstreamDepth, downstream_depth: downstreamDepth, include_neighbors: includeNeighbors }
  }

  const fetchLineage = async () => {
    if (!dataSourceId) return
    setIsLoading(true)
    setError(null)
    try {
      // Try data source lineage first
      const res = await fetch(`${API_BASE_URL}/scan/data-sources/${dataSourceId}/lineage?depth=${Math.max(upstreamDepth, downstreamDepth)}&direction=both`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })
      
      if (!res.ok) throw new Error('Failed to load lineage')
      const json = await res.json()
      if (!json?.success || !json?.data) throw new Error(json?.detail || 'Invalid lineage payload')

      const lineageData = json.data
      setLineageData(lineageData)
      setImpactAnalysis(lineageData.impact_analysis)

      // Process nodes with enhanced data
      const backendNodesRaw: Node[] = (lineageData.lineage_graph?.nodes || []).map((n: any, i: number) => {
        const nodeType = n.type === 'current' ? 'current' : 
                        n.type === 'upstream' ? 'upstream' : 
                        n.type === 'downstream' ? 'downstream' :
                        n.type === 'process' ? 'process' : 
                        n.type === 'ai' ? 'ai' :
                        n.type === 'compliance' ? 'compliance' :
                        n.type === 'table' ? 'table' : 'dataSource'
        
        const label = n.name || n.label
        const isSelected = selectedItems?.some((item: any) => item.table === label) || false
        
        return {
          id: n.id || `n${i}`,
          type: nodeType,
          position: n.position || { x: 0, y: 0 },
          data: {
            ...n,
            label,
            type: n.asset_type || n.type,
            schema: n.schema,
            columns: n.metadata?.columns_info || n.columns,
            rows: n.metadata?.record_count || n.rows,
            classification: n.classification,
            metrics: n.metadata,
            status: n.status || 'active',
            quality_score: n.quality_score,
            business_value_score: n.business_value_score,
            pii_detected: n.pii_detected,
            compliance_score: n.compliance_score,
            data_sensitivity: n.data_sensitivity,
            relationship_strength: n.relationship_strength,
            relationship_type: n.relationship_type,
            ai_confidence_score: n.metadata?.ai_confidence_score
          },
          style: isSelected ? { 
            border: '2px solid #3b82f6', 
            boxShadow: '0 0 0 2px rgba(59,130,246,0.2)' 
          } : undefined
        } as Node
      })
      
      // Process edges with enhanced data
      const backendEdges: Edge[] = (lineageData.lineage_graph?.edges || []).map((e: any, i: number) => ({
        id: e.id || `e${i}`,
        source: e.from,
        target: e.to,
        type: 'custom',
        data: { 
          type: e.type || e.relationship_type || 'data_flow', 
          label: e.description || e.label, 
          strength: e.strength || 0.5,
          relationship_type: e.relationship_type,
          transformation_type: e.transformation_type,
          data_volume: e.data_volume,
          frequency: e.frequency,
          last_updated: e.last_updated
        }
      }))

      const layouted = layoutNodesByType(backendNodesRaw)
      setNodes(layouted)
      setEdges(backendEdges)
      
    } catch (e: any) {
      console.warn('Lineage fetch failed, falling back to sample:', e?.message)
      setError(e?.message || 'Failed to load lineage')
      
      // Enhanced fallback to sample data
      const sampleNodes: Node[] = [
        { 
          id: 'ds1', 
          type: 'dataSource', 
          position: { x: 50, y: 100 }, 
          data: { 
            label: 'Data Source', 
            type: 'PostgreSQL', 
            status: 'active', 
            metrics: { tables: 5, size: '100GB' },
            quality_score: 0.85,
            business_value_score: 0.75,
            pii_detected: false,
            compliance_score: 0.90
          } 
        },
        { 
          id: 't1', 
          type: 'current', 
          position: { x: 350, y: 80 }, 
          data: { 
            label: 'pg_user', 
            schema: 'pg_catalog', 
            columns: 10, 
            rows: 10000,
            quality_score: 0.92,
            business_value_score: 0.88,
            pii_detected: true,
            compliance_score: 0.85,
            relationship_strength: 0.8,
            relationship_type: 'business_domain'
          } 
        },
      ]
      const sampleEdges: Edge[] = [ 
        { 
          id: 'e1', 
          source: 'ds1', 
          target: 't1', 
          type: 'custom', 
          data: { 
            type: 'data_flow', 
            strength: 0.8, 
            label: 'Contains user data',
            relationship_type: 'contains',
            transformation_type: 'direct_copy'
          } 
        } 
      ]
      setNodes(sampleNodes)
      setEdges(sampleEdges)
    } finally {
      setIsLoading(false)
    }
  }

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setShowNodeDetails(true)
    onNodeSelect?.(node)
  }, [onNodeSelect])

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    // onEdgeSelect callback only
    onEdgeSelect?.(edge)
  }, [onEdgeSelect])

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (!filterOptions.showDataSources && node.type === 'dataSource') return false
      if (!filterOptions.showTables && node.type === 'table') return false
      if (!filterOptions.showProcesses && node.type === 'process') return false
      if (searchTerm) {
        return String((node.data as any)?.label || '').toLowerCase().includes(searchTerm.toLowerCase())
      }
      return true
    })
  }, [nodes, filterOptions, searchTerm])

  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      if (!filterOptions.showDependencies && (edge.data as any)?.type === 'dependency') return false
      if (!filterOptions.showInferred && (edge.data as any)?.type === 'inferred') return false
      const sourceVisible = filteredNodes.some(node => node.id === edge.source)
      const targetVisible = filteredNodes.some(node => node.id === edge.target)
      return sourceVisible && targetVisible
    })
  }, [edges, filteredNodes, filterOptions])

  const handleLayout = (direction: 'horizontal' | 'vertical') => {
    setLayoutDirection(direction)
  }

  const layoutNodesByType = (input: Node[]): Node[] => {
    const ds: Node[] = []
    const tables: Node[] = []
    const procs: Node[] = []
    input.forEach(n => {
      if (n.type === 'dataSource') ds.push(n)
      else if (n.type === 'table') tables.push(n)
      else procs.push(n)
    })
    const colX = layoutDirection === 'horizontal' ? [50, 350, 650] : [50]
    const colYStart = 60
    const gapY = 100
    const placeCol = (nodes: Node[], colIndex: number, startY: number) => {
      nodes.forEach((n, i) => {
        const x = layoutDirection === 'horizontal' ? colX[colIndex] : (50 + colIndex * 300)
        const y = startY + i * gapY
        n.position = { x, y }
      })
    }
    placeCol(ds, 0, colYStart)
    placeCol(tables, 1, colYStart)
    placeCol(procs, 2, colYStart)
    return [...ds, ...tables, ...procs]
  }

  const handleExport = () => {
    // Export placeholder
    try { console.log('Exporting lineage data...') } catch {}
  }

  const handleRefresh = () => {
    fetchLineage()
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Advanced Data Lineage</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              AI-powered data flow visualization with real-time insights
            </p>
          </div>
          {lineageData && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{lineageData.lineage_metrics?.total_assets || 0} Assets</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">{lineageData.lineage_metrics?.connected_assets || 0} Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{lineageData.lineage_summary?.sensitive_assets || 0} Sensitive</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Selector */}
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          {/* Advanced Controls */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium">Depth</Label>
              <Select value={String(upstreamDepth)} onValueChange={(v) => setUpstreamDepth(parseInt(v || '3', 10))}>
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch id="include-neighbors" checked={includeNeighbors} onCheckedChange={setIncludeNeighbors} />
              <Label htmlFor="include-neighbors" className="text-xs">Neighbors</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch id="show-metrics" checked={showMetrics} onCheckedChange={setShowMetrics} />
              <Label htmlFor="show-metrics" className="text-xs">Metrics</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch id="show-business" checked={showBusinessContext} onCheckedChange={setShowBusinessContext} />
              <Label htmlFor="show-business" className="text-xs">Business</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch id="show-quality" checked={showQualityMetrics} onCheckedChange={setShowQualityMetrics} />
              <Label htmlFor="show-quality" className="text-xs">Quality</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh" className="text-xs">Auto</Label>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Advanced Lineage Filters</SheetTitle>
                  <SheetDescription>
                    Configure what to show in the lineage graph
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Node Types</h4>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-data-sources" checked={filterOptions.showDataSources} onCheckedChange={(checked) => setFilterOptions(prev => ({ ...prev, showDataSources: checked }))} />
                      <Label htmlFor="show-data-sources">Data Sources</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-tables" checked={filterOptions.showTables} onCheckedChange={(checked) => setFilterOptions(prev => ({ ...prev, showTables: checked }))} />
                      <Label htmlFor="show-tables">Tables & Views</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-processes" checked={filterOptions.showProcesses} onCheckedChange={(checked) => setFilterOptions(prev => ({ ...prev, showProcesses: checked }))} />
                      <Label htmlFor="show-processes">Processes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-ai" checked={filterOptions.showAI} onCheckedChange={(checked) => setFilterOptions(prev => ({ ...prev, showAI: checked }))} />
                      <Label htmlFor="show-ai">AI Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-compliance" checked={filterOptions.showCompliance} onCheckedChange={(checked) => setFilterOptions(prev => ({ ...prev, showCompliance: checked }))} />
                      <Label htmlFor="show-compliance">Compliance</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Relationships</h4>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-dependencies" checked={filterOptions.showDependencies} onCheckedChange={(checked) => setFilterOptions(prev => ({ ...prev, showDependencies: checked }))} />
                      <Label htmlFor="show-dependencies">Dependencies</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-inferred" checked={filterOptions.showInferred} onCheckedChange={(checked) => setFilterOptions(prev => ({ ...prev, showInferred: checked }))} />
                      <Label htmlFor="show-inferred">Inferred Relationships</Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Layout</h4>
                    <Select value={layoutDirection} onValueChange={(value) => handleLayout(value as 'horizontal' | 'vertical')}>
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
            
            <Button variant="outline" size="sm" onClick={() => fitView()}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Fit View
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Graph */}
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
          proOptions={{ hideAttribution: true }}
        >
          <Controls 
            position="top-right"
            showInteractive={false}
          />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'dataSource': return '#3b82f6'
                case 'table': return '#10b981'
                case 'current': return '#f59e0b'
                case 'upstream': return '#06b6d4'
                case 'downstream': return '#8b5cf6'
                case 'process': return '#8b5cf6'
                case 'ai': return '#6366f1'
                case 'compliance': return '#f97316'
                default: return '#6b7280'
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            position="bottom-left"
            zoomable
            pannable
          />
          <Background 
            gap={20} 
            size={1} 
            color="#e5e7eb"
            variant="dots"
          />
          <svg>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
              </marker>
              <marker id="arrowhead-strong" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" fill="#10b981" />
              </marker>
              <marker id="arrowhead-weak" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
              </marker>
            </defs>
          </svg>
        </ReactFlow>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <div className="text-center">
                <div className="font-medium">Loading Advanced Lineage Data</div>
                <div className="text-sm text-muted-foreground">AI-powered relationship discovery in progress...</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && !isLoading && (
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium text-red-800 dark:text-red-200">Lineage Loading Error</div>
                  <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Impact Analysis Panel */}
        {impactAnalysis && viewMode === 'detailed' && (
          <Panel position="top-left" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Impact Analysis</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Level:</span>
                  <Badge variant={impactAnalysis.risk_assessment === 'high' ? 'destructive' : impactAnalysis.risk_assessment === 'medium' ? 'default' : 'secondary'}>
                    {impactAnalysis.risk_assessment}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upstream:</span>
                  <span className="font-medium">{impactAnalysis.total_upstream_assets}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Downstream:</span>
                  <span className="font-medium">{impactAnalysis.total_downstream_assets}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Critical Paths:</span>
                  <span className="font-medium">{impactAnalysis.critical_paths?.length || 0}</span>
                </div>
              </div>
              
              {impactAnalysis.performance_impact && (
                <div className="pt-2 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Performance Impact</div>
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span>Complexity:</span>
                      <span>{impactAnalysis.performance_impact.dependency_complexity?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bottleneck Risk:</span>
                      <Badge variant="outline" className="text-xs">
                        {impactAnalysis.performance_impact.bottleneck_risk || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Data Source</span>
          </div>
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-green-500" />
            <span className="font-medium">Table/View</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">Current Asset</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-cyan-500" />
            <span className="font-medium">Upstream</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-purple-500" />
            <span className="font-medium">Downstream</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-500" />
            <span className="font-medium">AI Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <span className="font-medium">Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span className="font-medium">Data Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500"></div>
            <span className="font-medium">Dependency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400 border-dashed"></div>
            <span className="font-medium">Inferred</span>
          </div>
        </div>
        
        {/* Advanced Features Indicator */}
        {lineageData?.advanced_features && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                <span>AI-Powered Discovery</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-green-500" />
                <span>Business Context</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3 text-purple-500" />
                <span>Quality Metrics</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Node Details Dialog */}
      <Dialog open={showNodeDetails} onOpenChange={setShowNodeDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNode?.type === 'current' && <Target className="h-5 w-5 text-yellow-500" />}
              {selectedNode?.type === 'upstream' && <ArrowRight className="h-5 w-5 text-cyan-500" />}
              {selectedNode?.type === 'downstream' && <ArrowLeft className="h-5 w-5 text-purple-500" />}
              {selectedNode?.type === 'ai' && <Brain className="h-5 w-5 text-indigo-500" />}
              {selectedNode?.type === 'compliance' && <Shield className="h-5 w-5 text-orange-500" />}
              {selectedNode?.data.label || 'Node Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedNode?.type} • {(selectedNode?.data as any)?.type} • {(selectedNode?.data as any)?.schema}
            </DialogDescription>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-6">
              {/* Quality and Business Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Quality Metrics
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overall Score:</span>
                      <span className="font-medium">{Math.round(((selectedNode.data as any).quality_score || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Value:</span>
                      <span className="font-medium">{Math.round(((selectedNode.data as any).business_value_score || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compliance:</span>
                      <span className="font-medium">{Math.round(((selectedNode.data as any).compliance_score || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Asset Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{(selectedNode.data as any).asset_type || selectedNode.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Schema:</span>
                      <span className="font-medium">{(selectedNode.data as any).schema}</span>
                    </div>
                    {(selectedNode.data as any).pii_detected && (
                      <div className="flex items-center gap-1 text-red-600">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs font-medium">PII Detected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Relationship Information */}
              {(selectedNode.data as any).relationship_strength && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Relationship Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strength:</span>
                      <span className="font-medium">{Math.round(((selectedNode.data as any).relationship_strength || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {((selectedNode.data as any).relationship_type || 'unknown').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Metadata */}
              {(selectedNode.data as any).metadata && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Technical Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {(selectedNode.data as any).columns && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Columns:</span>
                        <span className="font-medium">{(selectedNode.data as any).columns}</span>
                      </div>
                    )}
                    {(selectedNode.data as any).rows && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rows:</span>
                        <span className="font-medium">{(selectedNode.data as any).rows.toLocaleString()}</span>
                      </div>
                    )}
                    {(selectedNode.data as any).metadata?.record_count && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Record Count:</span>
                        <span className="font-medium">{(selectedNode.data as any).metadata.record_count.toLocaleString()}</span>
                      </div>
                    )}
                    {(selectedNode.data as any).metadata?.size_bytes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{((selectedNode.data as any).metadata.size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Business Context */}
              {(selectedNode.data as any).business_domain && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Business Context
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Domain:</span>
                      <Badge variant="outline" className="ml-2">{(selectedNode.data as any).business_domain}</Badge>
                    </div>
                    {(selectedNode.data as any).owner && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="font-medium">{(selectedNode.data as any).owner}</span>
                      </div>
                    )}
                    {(selectedNode.data as any).steward && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Steward:</span>
                        <span className="font-medium">{(selectedNode.data as any).steward}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
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

// Main export component with ReactFlowProvider
export function DataLineageGraph(props: DataLineageGraphProps) {
  return (
    <ReactFlowProvider>
      <DataLineageGraphInternal {...props} />
    </ReactFlowProvider>
  )
}