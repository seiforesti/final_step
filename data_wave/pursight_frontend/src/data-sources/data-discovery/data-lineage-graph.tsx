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
  BackgroundVariant,
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
  Brain, Sparkles, Gauge, Lock, Unlock, Activity as ActivityIcon, Globe, Cpu, HardDrive, ArrowLeftRight
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

// Enhanced Local Storage Utilities for Lineage Data Persistence
const LINEAGE_CACHE_KEY = 'datawave_lineage_cache'
const CACHE_METADATA_KEY = 'datawave_lineage_metadata'
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes in milliseconds (increased for better persistence)
const MAX_CACHE_ENTRIES = 50 // Increased cache size
const CACHE_VERSION = '1.0' // Cache version for migration

interface CachedLineageData {
  data: any
  timestamp: number
  dataSourceId: number
  depth: number
  includeNeighbors: boolean
  selectedItems: any[]
  version: string
  serverTimestamp?: number // Server-side timestamp if available
  etag?: string // ETag for cache validation
  lastModified?: string // Last modified header
}

interface CacheMetadata {
  version: string
  lastCleanup: number
  totalEntries: number
  serverRestartDetected: boolean
  lastServerCheck: number
}

const getCacheKey = (dataSourceId: number, depth: number, includeNeighbors: boolean, selectedItems: any[]) => {
  return `${dataSourceId}_${depth}_${includeNeighbors}_${JSON.stringify(selectedItems)}`
}

const saveToCache = (dataSourceId: number, depth: number, includeNeighbors: boolean, selectedItems: any[], lineageData: any, serverHeaders?: any) => {
  try {
    const cacheKey = getCacheKey(dataSourceId, depth, includeNeighbors, selectedItems)
    const cachedData: CachedLineageData = {
      data: lineageData,
      timestamp: Date.now(),
      dataSourceId,
      depth,
      includeNeighbors,
      selectedItems,
      version: CACHE_VERSION,
      serverTimestamp: serverHeaders?.timestamp,
      etag: serverHeaders?.etag,
      lastModified: serverHeaders?.lastModified
    }
    
    const existingCache = JSON.parse(localStorage.getItem(LINEAGE_CACHE_KEY) || '{}')
    existingCache[cacheKey] = cachedData
    
    // Update cache metadata
    const metadata: CacheMetadata = {
      version: CACHE_VERSION,
      lastCleanup: Date.now(),
      totalEntries: Object.keys(existingCache).length,
      serverRestartDetected: false,
      lastServerCheck: Date.now()
    }
    
    // Clean up old entries (keep only last MAX_CACHE_ENTRIES entries)
    const entries = Object.entries(existingCache)
    if (entries.length > MAX_CACHE_ENTRIES) {
      const sortedEntries = entries.sort((a, b) => (b[1] as CachedLineageData).timestamp - (a[1] as CachedLineageData).timestamp)
      const cleanedCache = Object.fromEntries(sortedEntries.slice(0, MAX_CACHE_ENTRIES))
      localStorage.setItem(LINEAGE_CACHE_KEY, JSON.stringify(cleanedCache))
      metadata.totalEntries = MAX_CACHE_ENTRIES
    } else {
      localStorage.setItem(LINEAGE_CACHE_KEY, JSON.stringify(existingCache))
    }
    
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata))
    console.log('Lineage data saved to cache:', cacheKey)
  } catch (error) {
    console.warn('Failed to save lineage data to cache:', error)
  }
}

const loadFromCache = (dataSourceId: number, depth: number, includeNeighbors: boolean, selectedItems: any[]): any | null => {
  try {
    const cacheKey = getCacheKey(dataSourceId, depth, includeNeighbors, selectedItems)
    const existingCache = JSON.parse(localStorage.getItem(LINEAGE_CACHE_KEY) || '{}')
    const cachedData: CachedLineageData = existingCache[cacheKey]
    
    if (!cachedData) {
      return null
    }
    
    // Check cache version compatibility
    if (cachedData.version !== CACHE_VERSION) {
      console.log('Cache version mismatch, clearing cache')
      clearCache()
      return null
    }
    
    // Check if cache is still valid
    const isExpired = (Date.now() - cachedData.timestamp) > CACHE_TTL
    if (isExpired) {
      console.log('Cache expired, removing entry:', cacheKey)
      delete existingCache[cacheKey]
      localStorage.setItem(LINEAGE_CACHE_KEY, JSON.stringify(existingCache))
      return null
    }
    
    // Check for server restart detection
    const metadata = JSON.parse(localStorage.getItem(CACHE_METADATA_KEY) || '{}') as CacheMetadata
    if (metadata.serverRestartDetected) {
      console.log('Server restart detected, clearing cache')
      clearCache()
      return null
    }
    
    console.log('Loading lineage data from cache:', cacheKey)
    return cachedData.data
  } catch (error) {
    console.warn('Failed to load lineage data from cache:', error)
    return null
  }
}

const clearCache = () => {
  try {
    localStorage.removeItem(LINEAGE_CACHE_KEY)
    localStorage.removeItem(CACHE_METADATA_KEY)
    console.log('Lineage cache cleared')
  } catch (error) {
    console.warn('Failed to clear lineage cache:', error)
  }
}

// Server restart detection
const detectServerRestart = async (): Promise<boolean> => {
  try {
    const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || "/proxy"
    const metadata = JSON.parse(localStorage.getItem(CACHE_METADATA_KEY) || '{}') as CacheMetadata
    const lastCheck = metadata.lastServerCheck || 0
    const now = Date.now()
    
    // Only check every 5 minutes to avoid excessive requests
    if (now - lastCheck < 5 * 60 * 1000) {
      return metadata.serverRestartDetected || false
    }
    
    // Make a lightweight request to check server status
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    })
    
    const serverTimestamp = response.headers.get('x-server-timestamp')
    const serverStartTime = response.headers.get('x-server-start-time')
    
    // Update metadata
    metadata.lastServerCheck = now
    metadata.serverRestartDetected = false
    
    // Check if server has restarted (simplified check)
    if (serverStartTime && metadata.lastServerCheck) {
      const serverStart = parseInt(serverStartTime)
      const lastCheckTime = metadata.lastServerCheck
      if (serverStart > lastCheckTime) {
        metadata.serverRestartDetected = true
        console.log('Server restart detected, cache will be invalidated')
      }
    }
    
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata))
    return metadata.serverRestartDetected
    
  } catch (error) {
    console.warn('Failed to detect server restart:', error)
    return false
  }
}

// Enhanced cache management
const getCacheStats = () => {
  try {
    const cache = JSON.parse(localStorage.getItem(LINEAGE_CACHE_KEY) || '{}')
    const metadata = JSON.parse(localStorage.getItem(CACHE_METADATA_KEY) || '{}') as CacheMetadata
    
    return {
      totalEntries: Object.keys(cache).length,
      maxEntries: MAX_CACHE_ENTRIES,
      ttl: CACHE_TTL,
      version: CACHE_VERSION,
      lastCleanup: metadata.lastCleanup,
      serverRestartDetected: metadata.serverRestartDetected
    }
  } catch (error) {
    return null
  }
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
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'compliance' | 'performance' | 'business'>('overview')
  const [showMetrics, setShowMetrics] = useState<boolean>(true)
  const [showBusinessContext, setShowBusinessContext] = useState<boolean>(true)
  const [showQualityMetrics, setShowQualityMetrics] = useState<boolean>(true)
  const [showAIInsights, setShowAIInsights] = useState<boolean>(true)
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState<boolean>(true)
  const [lineageData, setLineageData] = useState<any>(null)
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [selectedPath, setSelectedPath] = useState<string[]>([])
  const [hoverNode, setHoverNode] = useState<string | null>(null)
  const [animationEnabled, setAnimationEnabled] = useState<boolean>(true)
  const [showDataFlow, setShowDataFlow] = useState<boolean>(true)
  const [clusteringEnabled, setClustering] = useState<boolean>(false)
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [performanceAnalysis, setPerformanceAnalysis] = useState<any>(null)
  const [businessImpactScore, setBusinessImpactScore] = useState<number>(0)
  const [cacheEnabled, setCacheEnabled] = useState<boolean>(true)
  const [lastFetchParams, setLastFetchParams] = useState<{
    dataSourceId: number
    depth: number
    includeNeighbors: boolean
    selectedItems: any[]
  } | null>(null)
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'tree' | 'hierarchical' | 'flow' | 'compact'>('tree')
  const [autoLayout, setAutoLayout] = useState<boolean>(true)
  const [isLayouting, setIsLayouting] = useState<boolean>(false)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(false)
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null)
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set())
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<Set<string>>(new Set())
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  // Advanced AI-powered lineage analysis
  const generateAIRecommendations = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/lineage-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          dataSourceId,
          selectedItems,
          lineageData
        })
      })

      const backend = response.ok ? await response.json() : { data: [] }

      // Local heuristic enrichment
      const localRecommendations: any[] = []
      const lg = lineageData?.lineage_graph
      if (lg) {
        const edges: any[] = lg.edges || []
        const outDegree: Record<string, number> = {}
        const inDegree: Record<string, number> = {}
        edges.forEach(e => {
          outDegree[e.from] = (outDegree[e.from] || 0) + 1
          inDegree[e.to] = (inDegree[e.to] || 0) + 1
        })

        // Bottlenecks
        const bottlenecks = Object.entries(outDegree).filter(([,d]) => (d as number) >= 5).map(([id]) => id)
        if (bottlenecks.length) {
          localRecommendations.push({ id: 'local-bottleneck', title: 'Potential bottlenecks', description: 'Assets with high fan-out detected.', impact: 'high', confidence: 0.8, nodeIds: bottlenecks })
        }

        // Quality/Compliance risks
        const riskyNodes = (lg.nodes || []).filter((n: any) => (n.quality_score && n.quality_score < 60) || n.pii_detected || (n.compliance_score && n.compliance_score < 60)).map((n: any) => n.id || n.name)
        if (riskyNodes.length) {
          localRecommendations.push({ id: 'local-quality', title: 'Quality/Compliance risks', description: 'Low quality or compliance risks found.', impact: 'high', confidence: 0.85, nodeIds: riskyNodes })
        }

        // Leaves
        const leaves = (lg.nodes || []).filter((n: any) => !outDegree[n.id || n.name]).map((n: any) => n.id || n.name)
        if (leaves.length >= 5) {
          localRecommendations.push({ id: 'local-leaves', title: 'Many leaf assets', description: 'Validate final sinks or missing lineage.', impact: 'medium', confidence: 0.7, nodeIds: leaves.slice(0, 25) })
        }

        // Simple cycle candidates
        const edgeSet = new Set(edges.map(e => `${e.from}->${e.to}`))
        const cyc: string[] = []
        const cycEdges: string[] = []
        edges.forEach(e => {
          if (edgeSet.has(`${e.to}->${e.from}`)) {
            cyc.push(e.from, e.to)
            cycEdges.push(e.id || `${e.from}-${e.to}`)
          }
        })
        if (cyc.length) {
          localRecommendations.push({ id: 'local-cycles', title: 'Circular dependencies', description: 'Pairs of edges forming cycles detected.', impact: 'medium', confidence: 0.65, nodeIds: Array.from(new Set(cyc)), edgeIds: Array.from(new Set(cycEdges)) })
        }
      }

      const merged = [...(backend.data || []), ...localRecommendations]
      const filled = merged.length ? merged : [
        { id: 'fallback-1', title: 'Optimize frequent joins', description: 'Tables with heavy joins may need indexing.', impact: 'high', confidence: 0.8 },
        { id: 'fallback-2', title: 'Resolve circular dependency', description: 'Break cycles to reduce risk.', impact: 'medium', confidence: 0.7 },
        { id: 'fallback-3', title: 'Validate downstream sinks', description: 'Verify leaf assets are expected sinks.', impact: 'low', confidence: 0.6 },
      ]
      setAiRecommendations(filled)
    } catch (error) {
      console.warn('Failed to generate AI recommendations:', error)
    }
  }, [dataSourceId, selectedItems, lineageData, API_BASE_URL])

  // Highlight application for selected recommendation
  const applyRecommendationHighlight = useCallback((rec: any | null) => {
    const nodeIds = new Set<string>(rec?.nodeIds || [])
    const edgeIds = new Set<string>(rec?.edgeIds || [])
    setHighlightedNodeIds(nodeIds)
    setHighlightedEdgeIds(edgeIds)

    if (!rec) {
      setNodes(prev => prev.map(n => ({ ...n, style: { ...(n.style || {}), opacity: 1 } })))
      setEdges(prev => prev.map(e => ({ ...e, style: { ...(e.style || {}), opacity: 1, strokeWidth: 2 } })))
      return
    }

    setNodes(prev => prev.map(n => ({
      ...n,
      style: {
        ...(n.style || {}),
        opacity: nodeIds.has(n.id) ? 1 : 0.25,
        border: nodeIds.has(n.id) ? '2px solid #7c3aed' : (n.style as any)?.border,
        boxShadow: nodeIds.has(n.id) ? '0 0 0 3px rgba(124,58,237,0.25)' : (n.style as any)?.boxShadow,
      }
    })))
    setEdges(prev => prev.map(e => ({
      ...e,
      style: {
        ...(e.style || {}),
        opacity: edgeIds.has(e.id) ? 1 : 0.2,
        strokeWidth: edgeIds.has(e.id) ? 3 : 1.5,
        stroke: edgeIds.has(e.id) ? '#7c3aed' : (e.style as any)?.stroke,
      }
    })))

    if (nodeIds.size > 0) {
      setTimeout(() => fitView({ padding: 0.2 }), 50)
    }
  }, [fitView, setNodes, setEdges])

  // Performance analysis
  const analyzePerformance = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/lineage-performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          dataSourceId,
          selectedItems
        })
      })

      if (response.ok) {
        const analysis = await response.json()
        setPerformanceAnalysis(analysis.data)
      } else {
        // Fallback to simulated data
        setPerformanceAnalysis({
          bottlenecks: ['table_a', 'view_b'],
          averageLatency: 250,
          throughput: 1500,
          errorRate: 0.02,
          recommendations: [
            'Consider indexing frequently joined columns',
            'Review query execution plans',
            'Implement caching for static reference data'
          ]
        })
      }
    } catch (error) {
      console.warn('Performance analysis failed:', error)
    }
  }, [dataSourceId, selectedItems, API_BASE_URL])

  // Business impact assessment
  const assessBusinessImpact = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/business-impact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          dataSourceId,
          selectedItems,
          lineageData
        })
      })

      if (response.ok) {
        const impact = await response.json()
        setBusinessImpactScore(impact.score || 0)
      } else {
        // Fallback to simulated score
        setBusinessImpactScore(Math.random() * 100)
      }
    } catch (error) {
      console.warn('Business impact assessment failed:', error)
      setBusinessImpactScore(Math.random() * 100)
    }
  }, [dataSourceId, selectedItems, lineageData, API_BASE_URL])

  useEffect(() => {
    fetchLineage()
  }, [dataSourceId, JSON.stringify(selectedItems), upstreamDepth, downstreamDepth, includeNeighbors])

  // Initialize cache stats on component mount
  useEffect(() => {
    setCacheStats(getCacheStats())
  }, [])

  // Auto-layout when algorithm changes
  useEffect(() => {
    if (nodes.length > 0) {
      console.log('Applying layout algorithm:', layoutAlgorithm)
      setIsLayouting(true)
      const layouted = layoutNodesByType(nodes)
      setNodes(layouted)
      setTimeout(() => {
        fitView()
        setIsLayouting(false)
      }, 100)
    }
  }, [layoutAlgorithm, layoutDirection, clusteringEnabled])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => fetchLineage(), Math.max(10, refreshSeconds) * 1000)
    return () => clearInterval(id)
  }, [autoRefresh, refreshSeconds, dataSourceId, JSON.stringify(selectedItems), upstreamDepth, downstreamDepth, includeNeighbors])

  // Trigger AI analysis when lineage data is loaded
  useEffect(() => {
    if (lineageData && showAIInsights) {
      generateAIRecommendations()
      assessBusinessImpact()
    }
  }, [lineageData, showAIInsights, generateAIRecommendations, assessBusinessImpact])

  // Trigger performance analysis when view mode changes to performance
  useEffect(() => {
    if (viewMode === 'performance' && lineageData) {
      analyzePerformance()
    }
  }, [viewMode, lineageData, analyzePerformance])

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

  const fetchLineage = async (forceRefresh: boolean = false) => {
    if (!dataSourceId) return

    const currentParams = {
      dataSourceId,
      depth: Math.max(upstreamDepth, downstreamDepth),
      includeNeighbors,
      selectedItems: selectedItems || []
    }

    // Check if we need to fetch (parameters changed or force refresh)
    const paramsChanged = !lastFetchParams ||
      lastFetchParams.dataSourceId !== currentParams.dataSourceId ||
      lastFetchParams.depth !== currentParams.depth ||
      lastFetchParams.includeNeighbors !== currentParams.includeNeighbors ||
      JSON.stringify(lastFetchParams.selectedItems) !== JSON.stringify(currentParams.selectedItems)

    if (!forceRefresh && !paramsChanged && lineageData) {
      // Data is already loaded and parameters haven't changed
      console.log('Lineage data already loaded, skipping fetch')
      return
    }

    // Check for server restart before using cache
    if (cacheEnabled && !forceRefresh) {
      setIsCheckingServer(true)
      const serverRestarted = await detectServerRestart()
      setIsCheckingServer(false)
      
      if (serverRestarted) {
        console.log('Server restart detected, forcing refresh')
        forceRefresh = true
      }
    }

    // Try to load from cache first (only if not forcing refresh)
    if (cacheEnabled && !forceRefresh) {
      const cachedData = loadFromCache(
        currentParams.dataSourceId,
        currentParams.depth,
        currentParams.includeNeighbors,
        currentParams.selectedItems
      )

      if (cachedData) {
        console.log('Loading lineage data from cache')
        setLineageData(cachedData)
        setImpactAnalysis(cachedData.impact_analysis)
        setLastFetchParams(currentParams)
        setCacheStats(getCacheStats())

        // Process cached nodes and edges
        const backendNodesRaw: Node[] = (cachedData.lineage_graph?.nodes || []).map((n: any, i: number) => {
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

        const backendEdges: Edge[] = (cachedData.lineage_graph?.edges || []).map((e: any, i: number) => ({
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
        return
      }
    }
    
    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching lineage data from backend')
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
      setLastFetchParams(currentParams)

      // Extract server headers for cache validation
      const serverHeaders = {
        timestamp: res.headers.get('x-server-timestamp'),
        etag: res.headers.get('etag'),
        lastModified: res.headers.get('last-modified')
      }

      // Save to cache with server headers
      if (cacheEnabled) {
        saveToCache(
          currentParams.dataSourceId,
          currentParams.depth,
          currentParams.includeNeighbors,
          currentParams.selectedItems,
          lineageData,
          serverHeaders
        )
        setCacheStats(getCacheStats())
      }

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

  // Path highlighting for data flow visualization
  const highlightPath = useCallback((fromNodeId: string, toNodeId: string) => {
    // Find path between nodes using graph traversal
    const findPath = (start: string, end: string, visited = new Set<string>()): string[] => {
      if (start === end) return [start]
      if (visited.has(start)) return []
      
      visited.add(start)
      
      for (const edge of edges) {
        if (edge.source === start) {
          const path = findPath(edge.target, end, new Set(visited))
          if (path.length > 0) return [start, ...path]
        }
      }
      
      return []
    }
    
    const path = findPath(fromNodeId, toNodeId)
    setSelectedPath(path)
  }, [edges])

  // Advanced clustering algorithm
  const clusterNodes = useCallback(() => {
    if (!clusteringEnabled) return nodes

    // Group nodes by type and business domain
    const clusters: Record<string, Node[]> = {}
    
    nodes.forEach(node => {
      const key = `${node.type}_${(node.data as any).business_domain || 'default'}`
      if (!clusters[key]) clusters[key] = []
      clusters[key].push(node)
    })

    // Adjust positions for clustering
    let clusterX = 100
    const clusteredNodes = Object.values(clusters).flatMap((cluster, index) => {
      return cluster.map((node, nodeIndex) => ({
        ...node,
        position: {
          x: clusterX + (nodeIndex % 3) * 200,
          y: 100 + Math.floor(nodeIndex / 3) * 150
        }
      }))
    })

    return clusteredNodes
  }, [nodes, clusteringEnabled])

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

  // Hierarchical Tree Layout Algorithm
  const layoutNodesByType = (input: Node[]): Node[] => {
    if (!input || input.length === 0) return input

    // Configuration for hierarchical layout
    const config = {
      levelSpacing: 400,        // Horizontal distance between levels
      nodeSpacing: 200,         // Vertical distance between nodes in same level
      startX: 100,             // Starting X position
      startY: 200,             // Starting Y position
      nodeWidth: 220,          // Node width for collision detection
      nodeHeight: 120,         // Node height for collision detection
      centerY: 400             // Center Y position for main flow
    }

    // Categorize nodes by hierarchy level
    const levels = {
      dataSources: [] as Node[],      // Level 0: Data Sources
      upstream: [] as Node[],         // Level 1: Upstream Assets
      current: [] as Node[],          // Level 2: Current Assets (Center)
      downstream: [] as Node[],       // Level 3: Downstream Assets
      processes: [] as Node[],        // Level 4: Process Nodes
      ai: [] as Node[],              // Side nodes: AI Analysis
      compliance: [] as Node[]        // Side nodes: Compliance
    }

    input.forEach(node => {
      switch (node.type) {
        case 'dataSource':
          levels.dataSources.push(node)
          break
        case 'upstream':
          levels.upstream.push(node)
          break
        case 'current':
          levels.current.push(node)
          break
        case 'downstream':
          levels.downstream.push(node)
          break
        case 'process':
          levels.processes.push(node)
          break
        case 'ai':
          levels.ai.push(node)
          break
        case 'compliance':
          levels.compliance.push(node)
          break
        default:
          levels.upstream.push(node) // Default to upstream
      }
    })

    // Helper function to center nodes vertically
    const centerNodesVertically = (nodes: Node[], centerY: number) => {
      if (nodes.length === 0) return
      
      const totalHeight = (nodes.length - 1) * config.nodeSpacing
      const startY = centerY - totalHeight / 2
      
      nodes.forEach((node, index) => {
        node.position.y = startY + index * config.nodeSpacing
      })
    }

    // Helper function to create tree-like horizontal layout
    const createTreeLayout = () => {
      let currentLevel = 0
      const levelX = config.startX

      // Level 0: Data Sources (leftmost)
      if (levels.dataSources.length > 0) {
        levels.dataSources.forEach((node, index) => {
          node.position = {
            x: levelX,
            y: config.startY + index * config.nodeSpacing
          }
        })
        currentLevel++
      }

      // Level 1: Upstream Assets
      if (levels.upstream.length > 0) {
        const x = levelX + config.levelSpacing
        centerNodesVertically(levels.upstream, config.centerY)
        levels.upstream.forEach(node => {
          node.position.x = x
        })
        currentLevel++
      }

      // Level 2: Current Assets (center, highlighted)
      if (levels.current.length > 0) {
        const x = levelX + (currentLevel * config.levelSpacing)
        centerNodesVertically(levels.current, config.centerY)
        levels.current.forEach(node => {
          node.position.x = x
        })
        currentLevel++
      }

      // Level 3: Downstream Assets
      if (levels.downstream.length > 0) {
        const x = levelX + (currentLevel * config.levelSpacing)
        centerNodesVertically(levels.downstream, config.centerY)
        levels.downstream.forEach(node => {
          node.position.x = x
        })
        currentLevel++
      }

      // Level 4: Process Nodes (rightmost)
      if (levels.processes.length > 0) {
        const x = levelX + (currentLevel * config.levelSpacing)
        centerNodesVertically(levels.processes, config.centerY)
        levels.processes.forEach(node => {
          node.position.x = x
        })
      }

      // Side nodes: AI Analysis (top)
      if (levels.ai.length > 0) {
        const centerX = levelX + (currentLevel * config.levelSpacing) / 2
        levels.ai.forEach((node, index) => {
          node.position = {
            x: centerX + (index - levels.ai.length / 2) * config.nodeSpacing,
            y: config.startY - config.nodeSpacing
          }
        })
      }

      // Side nodes: Compliance (bottom)
      if (levels.compliance.length > 0) {
        const centerX = levelX + (currentLevel * config.levelSpacing) / 2
        levels.compliance.forEach((node, index) => {
          node.position = {
            x: centerX + (index - levels.compliance.length / 2) * config.nodeSpacing,
            y: config.centerY + config.nodeSpacing * 2
          }
        })
      }
    }

    // Helper function to create vertical tree layout
    const createVerticalTreeLayout = () => {
      let currentLevel = 0
      const levelY = config.startY

      // Level 0: Data Sources (top)
      if (levels.dataSources.length > 0) {
        levels.dataSources.forEach((node, index) => {
          node.position = {
            x: config.startX + index * config.nodeSpacing,
            y: levelY
          }
        })
        currentLevel++
      }

      // Level 1: Upstream Assets
      if (levels.upstream.length > 0) {
        const y = levelY + (currentLevel * config.levelSpacing)
        levels.upstream.forEach((node, index) => {
          node.position = {
            x: config.startX + index * config.nodeSpacing,
            y: y
          }
        })
        currentLevel++
      }

      // Level 2: Current Assets (center, highlighted)
      if (levels.current.length > 0) {
        const y = levelY + (currentLevel * config.levelSpacing)
        levels.current.forEach((node, index) => {
          node.position = {
            x: config.startX + index * config.nodeSpacing,
            y: y
          }
        })
        currentLevel++
      }

      // Level 3: Downstream Assets
      if (levels.downstream.length > 0) {
        const y = levelY + (currentLevel * config.levelSpacing)
        levels.downstream.forEach((node, index) => {
          node.position = {
            x: config.startX + index * config.nodeSpacing,
            y: y
          }
        })
        currentLevel++
      }

      // Level 4: Process Nodes (bottom)
      if (levels.processes.length > 0) {
        const y = levelY + (currentLevel * config.levelSpacing)
        levels.processes.forEach((node, index) => {
          node.position = {
            x: config.startX + index * config.nodeSpacing,
            y: y
          }
        })
      }

      // Side nodes: AI Analysis (left)
      if (levels.ai.length > 0) {
        const centerY = levelY + (currentLevel * config.levelSpacing) / 2
        levels.ai.forEach((node, index) => {
          node.position = {
            x: config.startX - config.nodeSpacing,
            y: centerY + (index - levels.ai.length / 2) * config.nodeSpacing
          }
        })
      }

      // Side nodes: Compliance (right)
      if (levels.compliance.length > 0) {
        const centerY = levelY + (currentLevel * config.levelSpacing) / 2
        levels.compliance.forEach((node, index) => {
          node.position = {
            x: config.startX + config.nodeSpacing * 6,
            y: centerY + (index - levels.compliance.length / 2) * config.nodeSpacing
          }
        })
      }
    }

    // Apply layout based on algorithm and direction
    switch (layoutAlgorithm) {
      case 'tree':
        if (layoutDirection === 'horizontal') {
          createTreeLayout()
        } else {
          createVerticalTreeLayout()
        }
        break
        
      case 'hierarchical':
        // More structured hierarchical layout
        if (layoutDirection === 'horizontal') {
          createTreeLayout()
          // Add more spacing for hierarchical feel
          Object.values(levels).forEach(levelNodes => {
            levelNodes.forEach(node => {
              node.position.x += 50 // Add extra spacing
            })
          })
        } else {
          createVerticalTreeLayout()
          Object.values(levels).forEach(levelNodes => {
            levelNodes.forEach(node => {
              node.position.y += 50 // Add extra spacing
            })
          })
        }
        break
        
      case 'flow':
        // Continuous flow layout
        if (layoutDirection === 'horizontal') {
          createTreeLayout()
          // Reduce spacing for flow effect
          Object.values(levels).forEach(levelNodes => {
            levelNodes.forEach(node => {
              node.position.x -= 50 // Reduce spacing
            })
          })
        } else {
          createVerticalTreeLayout()
          Object.values(levels).forEach(levelNodes => {
            levelNodes.forEach(node => {
              node.position.y -= 50 // Reduce spacing
            })
          })
        }
        break
        
      case 'compact':
        // Compact layout with minimal spacing
        if (layoutDirection === 'horizontal') {
          createTreeLayout()
          // Very tight spacing
          Object.values(levels).forEach(levelNodes => {
            levelNodes.forEach(node => {
              node.position.x -= 100 // Much tighter spacing
            })
          })
        } else {
          createVerticalTreeLayout()
          Object.values(levels).forEach(levelNodes => {
            levelNodes.forEach(node => {
              node.position.y -= 100 // Much tighter spacing
            })
          })
        }
        break
    }

    // Apply clustering if enabled
    if (clusteringEnabled) {
      // Group nodes by level for better organization
      const allNodes = [...levels.dataSources, ...levels.upstream, ...levels.current, ...levels.downstream, ...levels.processes, ...levels.ai, ...levels.compliance]
      
      // Create clusters for each level
      const levelGroups = {
        dataSources: levels.dataSources,
        upstream: levels.upstream,
        current: levels.current,
        downstream: levels.downstream,
        processes: levels.processes
      }

      Object.entries(levelGroups).forEach(([levelName, levelNodes]) => {
        if (levelNodes.length > 1) {
          // Calculate level center
          const centerX = levelNodes.reduce((sum, node) => sum + node.position.x, 0) / levelNodes.length
          const centerY = levelNodes.reduce((sum, node) => sum + node.position.y, 0) / levelNodes.length
          
          // Arrange in a compact cluster
          levelNodes.forEach((node, index) => {
            const angle = (index / levelNodes.length) * 2 * Math.PI
            const radius = Math.min(100, config.nodeSpacing / 3)
            node.position = {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle)
            }
          })
        }
      })
    }

    // Final collision detection and adjustment
    const allNodes = [...levels.dataSources, ...levels.upstream, ...levels.current, ...levels.downstream, ...levels.processes, ...levels.ai, ...levels.compliance]
    
    allNodes.forEach((node, index) => {
      for (let i = index + 1; i < allNodes.length; i++) {
        const otherNode = allNodes[i]
        const dx = node.position.x - otherNode.position.x
        const dy = node.position.y - otherNode.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < config.nodeWidth) {
          // Push nodes apart
          const pushDistance = config.nodeWidth - distance + 30
          const pushX = (dx / distance) * pushDistance
          const pushY = (dy / distance) * pushDistance
          
          node.position.x += pushX / 2
          node.position.y += pushY / 2
          otherNode.position.x -= pushX / 2
          otherNode.position.y -= pushY / 2
        }
      }
    })

    return allNodes
  }

  const handleExport = () => {
    // Export placeholder
    try { console.log('Exporting lineage data...') } catch {}
  }

  const handleRefresh = () => {
    fetchLineage(true) // Force refresh, bypass cache
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Compact Enhanced Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        {/* Main Header Row */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          {/* Left: Title & Metrics */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                <Network className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-bold text-blue-900 dark:text-blue-100 truncate">Data Lineage</h3>
                <p className="text-xs text-blue-600 dark:text-blue-300 hidden sm:block">AI-powered visualization</p>
              </div>
            </div>
            
            {/* Compact Metrics - Responsive */}
          {lineageData && (
              <div className="flex items-center gap-1 sm:gap-3 text-xs">
                <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 dark:bg-blue-900 rounded">
                  <Network className="h-3 w-3 text-blue-500" />
                  <span className="font-medium hidden sm:inline">{lineageData.lineage_metrics?.total_assets || 0}</span>
                  <span className="font-medium sm:hidden">{lineageData.lineage_metrics?.total_assets || 0}</span>
              </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-100 dark:bg-green-900 rounded">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="font-medium hidden sm:inline">{lineageData.lineage_metrics?.connected_assets || 0}</span>
                  <span className="font-medium sm:hidden">{lineageData.lineage_metrics?.connected_assets || 0}</span>
              </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-100 dark:bg-orange-900 rounded">
                  <Shield className="h-3 w-3 text-orange-500" />
                  <span className="font-medium hidden sm:inline">{lineageData.lineage_summary?.sensitive_assets || 0}</span>
                  <span className="font-medium sm:hidden">{lineageData.lineage_summary?.sensitive_assets || 0}</span>
              </div>
                {/* Cache Status Indicator */}
                {cacheEnabled && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-purple-100 dark:bg-purple-900 rounded">
                    <Database className="h-3 w-3 text-purple-500" />
                    <span className="font-medium text-purple-600 dark:text-purple-400">Cached</span>
                  </div>
                )}
                {isCheckingServer && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 dark:bg-blue-900 rounded">
                    <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">Checking Server</span>
                  </div>
                )}
                {cacheStats && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 dark:bg-gray-900 rounded">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {cacheStats.totalEntries}/{cacheStats.maxEntries}
                    </span>
                  </div>
                )}
            </div>
          )}
        </div>
        
          {/* Right: Primary Controls - Responsive */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* View Mode - Hidden on small screens */}
            <div className="hidden sm:block">
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
            </div>
            
            {/* Layout Algorithm - Hidden on small screens */}
            <div className="hidden md:block">
              <div className="flex items-center gap-1">
                <Select value={layoutAlgorithm} onValueChange={(value) => {
                setLayoutAlgorithm(value as any)
                setIsLayouting(true)
                // Force immediate layout update
                setTimeout(() => {
                  if (nodes.length > 0) {
                    const layouted = layoutNodesByType(nodes)
                    setNodes(layouted)
                    setTimeout(() => {
                      fitView()
                      setIsLayouting(false)
                    }, 100)
                  }
                }, 50)
              }}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">Tree</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                  <SelectItem value="flow">Flow</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
              {isLayouting && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Layouting...</span>
                </div>
              )}
              </div>
            </div>
            
            {/* Search - Responsive width */}
          <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-8 w-24 sm:w-32 text-xs"
            />
          </div>
            
            {/* Action Buttons - Compact on mobile */}
            <div className="flex items-center gap-0.5 sm:gap-1">
            <Button variant="outline" size="sm" className="h-8 px-1.5 sm:px-2" onClick={() => fetchLineage(true)} disabled={isLoading}>
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1">Refresh</span>
            </Button>
              <Button variant="outline" size="sm" className="h-8 px-1.5 sm:px-2" onClick={() => fitView()}>
                <Maximize2 className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">Fit</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-1.5 sm:px-2" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                <span className="hidden sm:inline ml-1">{isFullscreen ? 'Exit' : 'Full'}</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-1.5 sm:px-2" onClick={handleExport}>
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">Export</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Secondary Controls Row - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-2 sm:px-4 bg-white/50 dark:bg-gray-800/50 border-t border-blue-200 dark:border-blue-800 gap-2 sm:gap-0">
          {/* Left: Quick Toggles - Responsive */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2">
              <Label className="text-xs font-medium hidden sm:inline">Depth:</Label>
              <Label className="text-xs font-medium sm:hidden">D:</Label>
              <Select value={String(upstreamDepth)} onValueChange={(v) => setUpstreamDepth(parseInt(v || '3', 10))}>
                <SelectTrigger className="h-6 w-10 sm:w-12 text-xs">
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
            
            {/* Essential Toggles - Always visible */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1">
                <Switch id="neighbors" checked={includeNeighbors} onCheckedChange={setIncludeNeighbors} className="scale-75" />
                <Label htmlFor="neighbors" className="text-xs">Neighbors</Label>
            </div>
              <div className="flex items-center gap-1">
                <Switch id="metrics" checked={showMetrics} onCheckedChange={setShowMetrics} className="scale-75" />
                <Label htmlFor="metrics" className="text-xs">Metrics</Label>
            </div>
              <div className="flex items-center gap-1">
                <Switch id="ai" checked={showAIInsights} onCheckedChange={setShowAIInsights} className="scale-75" />
                <Label htmlFor="ai" className="text-xs">AI</Label>
            </div>
              <div className="flex items-center gap-1">
                <Switch id="auto" checked={autoRefresh} onCheckedChange={setAutoRefresh} className="scale-75" />
                <Label htmlFor="auto" className="text-xs">Auto</Label>
            </div>
              <div className="flex items-center gap-1">
                <Switch id="cache" checked={cacheEnabled} onCheckedChange={setCacheEnabled} className="scale-75" />
                <Label htmlFor="cache" className="text-xs">Cache</Label>
            </div>
              <div className="flex items-center gap-1">
                <Switch id="auto-layout" checked={autoLayout} onCheckedChange={setAutoLayout} className="scale-75" />
                <Label htmlFor="auto-layout" className="text-xs">Auto</Label>
            </div>
            </div>
            </div>
          
          {/* Right: Advanced Controls - Responsive */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => {
                clearCache()
                setLineageData(null)
                setNodes([])
                setEdges([])
                setLastFetchParams(null)
              }}
              title="Clear Cache"
            >
              <Database className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => {
                setIsLayouting(true)
                const layouted = layoutNodesByType(nodes)
                setNodes(layouted)
                setTimeout(() => {
                  fitView()
                  setIsLayouting(false)
                }, 100)
              }}
              title="Re-layout Nodes"
              disabled={isLayouting}
            >
              {isLayouting ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Network className="h-3 w-3 mr-1" />
              )}
              <span className="hidden sm:inline">Layout</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => {
                setLayoutDirection(layoutDirection === 'horizontal' ? 'vertical' : 'horizontal')
                setTimeout(() => {
                  const layouted = layoutNodesByType(nodes)
                  setNodes(layouted)
                  setTimeout(() => fitView(), 100)
                }, 50)
              }}
              title="Toggle Layout Direction"
            >
              <ArrowLeftRight className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Direction</span>
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Filters</span>
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
            
            {/* Additional Toggles - Hidden on small screens */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Switch id="business" checked={showBusinessContext} onCheckedChange={setShowBusinessContext} className="scale-75" />
                <Label htmlFor="business" className="text-xs">Business</Label>
          </div>
              <div className="flex items-center gap-1">
                <Switch id="quality" checked={showQualityMetrics} onCheckedChange={setShowQualityMetrics} className="scale-75" />
                <Label htmlFor="quality" className="text-xs">Quality</Label>
              </div>
              <div className="flex items-center gap-1">
                <Switch id="cluster" checked={clusteringEnabled} onCheckedChange={setClustering} className="scale-75" />
                <Label htmlFor="cluster" className="text-xs">Cluster</Label>
              </div>
              <div className="flex items-center gap-1">
                <Switch id="animate" checked={animationEnabled} onCheckedChange={setAnimationEnabled} className="scale-75" />
                <Label htmlFor="animate" className="text-xs">Animate</Label>
              </div>
            </div>
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

        {/* AI Recommendations Panel */}
        {showAIInsights && aiRecommendations.length > 0 && (
          <Panel position="top-right" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-0 max-w-sm overflow-hidden">
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold">AI Recommendations</h4>
              </div>
              <div className="border-t" />
              <div className="space-y-3 max-h-72 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none]">
                {aiRecommendations.map((rec, index) => (
                  <div
                    key={rec.id || index}
                    className={`p-3 border rounded-lg bg-muted/30 cursor-pointer transition-colors ${selectedRecommendationId === (rec.id || String(index)) ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30' : 'hover:bg-muted/50'}`}
                    onClick={() => {
                      const selId = rec.id || String(index)
                      setSelectedRecommendationId(selId === selectedRecommendationId ? null : selId)
                      applyRecommendationHighlight(selId === selectedRecommendationId ? null : rec)
                    }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{rec.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">{rec.description}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'} className="text-xs">
                            {rec.impact}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round((rec.confidence || 0.7) * 100)}% confident
                          </span>
                        </div>
                        {rec.estimatedImprovement && (
                          <div className="text-xs text-green-600 mt-1">
                            {rec.estimatedImprovement}
                          </div>
                        )}
                        {(rec.nodeIds || rec.edgeIds) && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                            {rec.nodeIds && <div>Nodes: {rec.nodeIds.length}</div>}
                            {rec.edgeIds && <div>Edges: {rec.edgeIds.length}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}

        {/* Performance Analysis Panel */}
        {viewMode === 'performance' && performanceAnalysis && (
          <Panel position="bottom-left" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">Performance Metrics</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Latency:</span>
                  <span className="font-medium">{performanceAnalysis.averageLatency}ms</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Throughput:</span>
                  <span className="font-medium">{performanceAnalysis.throughput} req/s</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error Rate:</span>
                  <span className={`font-medium ${performanceAnalysis.errorRate > 0.05 ? 'text-red-500' : 'text-green-500'}`}>
                    {(performanceAnalysis.errorRate * 100).toFixed(2)}%
                  </span>
                </div>
                
                {performanceAnalysis.bottlenecks?.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Bottlenecks</div>
                    <div className="flex flex-wrap gap-1">
                      {performanceAnalysis.bottlenecks.map((bottleneck: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {bottleneck}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        )}

        {/* Business Impact Panel */}
        {viewMode === 'business' && (
          <Panel position="bottom-right" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Business Impact</h4>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{Math.round(businessImpactScore)}</div>
                  <div className="text-sm text-muted-foreground">Impact Score</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Value:</span>
                    <Badge variant={businessImpactScore > 70 ? 'default' : businessImpactScore > 40 ? 'secondary' : 'destructive'}>
                      {businessImpactScore > 70 ? 'High' : businessImpactScore > 40 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue Impact:</span>
                    <span className="font-medium text-green-600">
                      ${Math.round(businessImpactScore * 1000).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Exposure:</span>
                    <span className={`font-medium ${businessImpactScore < 50 ? 'text-red-500' : 'text-green-500'}`}>
                      ${Math.round((100 - businessImpactScore) * 500).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Based on data usage patterns, compliance requirements, and operational dependencies.
                  </div>
                </div>
              </div>
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
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
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
              <span>Performance Metrics</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-red-500" />
              <span>Impact Analysis</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-indigo-500" />
              <span>Business Intelligence</span>
            </div>
            {clusteringEnabled && (
              <div className="flex items-center gap-1">
                <Network className="h-3 w-3 text-orange-500" />
                <span>Smart Clustering</span>
              </div>
            )}
            {animationEnabled && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-pink-500" />
                <span>Animated Flows</span>
              </div>
            )}
          </div>
        </div>
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