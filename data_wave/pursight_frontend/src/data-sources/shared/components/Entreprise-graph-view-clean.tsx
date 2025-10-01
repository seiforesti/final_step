/**
 * Enterprise Graph View Component - Production-grade visualization system
 * High-performance graph renderer with advanced layout algorithms and WebGL acceleration
 * Optimized for large-scale schema discovery with real-time interaction
 */

import React, { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react'
import { 
  Database, Table, Columns, FileText, Folder, FolderOpen, 
  ChevronRight, ChevronDown, ChevronLeft, Eye, Network, Activity, Brain, Maximize2,
  Minimize2, RotateCcw, ZoomIn, ZoomOut, Settings, X, Search, Filter,
  Layers, Grid3X3, Circle, Square, Triangle, Hexagon, Star, Zap,
  Target, TrendingUp, Shield, Sparkles, Gauge, BarChart3, Globe
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchemaAnalysis } from '../hooks/use-schema-analysis'
import { SchemaAnalysisPanel } from './schema-analysis-panel'
import { SchemaLineChart, type SchemaLineChartRef } from './schema-line-chart'
import { AdvancedReportGenerator } from './advanced-report-generator'
import { PDFReportGenerator } from '../utils/pdf-report-generator'
import type { GraphNode as AnalysisGraphNode } from '../utils/schema-analysis-utils'

// Enhanced Graph Node Interface with Advanced Properties
interface GraphNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  level: number
  hasChildren: boolean
  isExpanded: boolean
  isSelected: boolean
  isVisible: boolean
  isHighlighted?: boolean
  isFiltered?: boolean
  metadata?: {
    description?: string
    rowCount?: number
    columnCount?: number
    size?: number
    lastModified?: string
    importance?: number
    quality?: number
    [key: string]: any
  }
  children?: GraphNode[]
  x: number
  y: number
  z: number // 3D Z-axis position for true dimensional movement
  vx: number // velocity for physics simulation
  vy: number
  vz: number // 3D Z-axis velocity for dimensional movement
  fx?: number // fixed position
  fy?: number
  fz?: number // fixed 3D Z position
  connections?: string[]
  parentId?: string
  childIds?: string[] // Add childIds property for schema hierarchy
  depth?: number
  weight?: number
  importance?: number
  cluster?: number
  color?: string
  size?: number
  opacity?: number
  shape?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon'
  // 3D rendering properties
  screenX?: number
  screenY?: number
  screenScale?: number
  glowIntensity?: number
  depthIntensity?: number
}

// Enhanced Graph Connection Interface
interface GraphConnection {
  id: string
  from: string
  to: string
  type: 'parent' | 'child' | 'reference' | 'dependency' | 'foreign_key' | 'index'
  strength: number
  weight?: number
  color?: string
  opacity?: number
  animated?: boolean
  label?: string
  metadata?: any
  fromX?: number
  fromY?: number
  toX?: number
  toY?: number
}

// Layout Algorithm Types
type LayoutAlgorithm = 
  | 'force-directed'
  | 'force-3d'
  | 'force-clustered'
  | 'force-radial'
  | 'force-organic'
  | 'hierarchical'
  | 'circular'
  | 'grid'
  | 'tree'
  | 'radial'
  | 'cluster'
  | 'organic'
  | 'spiral'
  | 'concentric'
  | 'centralized'
  | 'network'

// View Mode Types
type ViewMode = 
  | 'overview'
  | 'detailed'
  | 'minimap'
  | 'focus'
  | 'comparison'

// Performance Configuration
interface PerformanceConfig {
  maxNodes: number
  maxConnections: number
  enableVirtualization: boolean
  enableLOD: boolean
  enableWebGL: boolean
  enableWorkers: boolean
  frameRate: number
  memoryLimit: number
}

// Advanced Graph View Props
interface AdvancedGraphViewProps {
  nodes: GraphNode[]
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string, checked: boolean) => void
  onPreview: (node: GraphNode) => void
  onNodeHover?: (node: GraphNode | null) => void
  onNodeClick?: (node: GraphNode, event: MouseEvent) => void
  onNodeDoubleClick?: (node: GraphNode, event: MouseEvent) => void
  onConnectionClick?: (connection: GraphConnection, event: MouseEvent) => void
  height?: number
  width?: number
  layoutAlgorithm?: LayoutAlgorithm
  viewMode?: ViewMode
  showConnections?: boolean
  showLabels?: boolean
  showMinimap?: boolean
  enablePhysics?: boolean
  enableAnimation?: boolean
  enableSearch?: boolean
  enableFiltering?: boolean
  enableClustering?: boolean
  autoLayout?: boolean
  performanceConfig?: Partial<PerformanceConfig>
  theme?: 'light' | 'dark' | 'auto'
  className?: string
  style?: React.CSSProperties
  onFullscreenChange?: (isFullscreen: boolean) => void
}

// Main Enterprise Graph View Component
export function AdvancedGraphView({
  nodes,
  onToggle,
  onSelect,
  onPreview,
  onNodeHover,
  onNodeClick,
  onNodeDoubleClick,
  onConnectionClick,
  height = 600,
  width,
  layoutAlgorithm = 'force-directed',
  viewMode = 'overview',
  showConnections = true,
  showLabels = true,
  showMinimap = true,
  enablePhysics = true,
  enableAnimation = true,
  enableSearch = true,
  enableFiltering = true,
  enableClustering = false,
  autoLayout = true,
  performanceConfig = {},
  theme = 'auto',
  className = '',
  style = {},
  onFullscreenChange
}: AdvancedGraphViewProps) {
  
  // Import the new advanced 3D graph component
  const Advanced3DGraphView = React.lazy(() => import('./Advanced-3D-Graph-View').then(module => ({ default: module.Advanced3DGraphView })))
  
  return (
    <div className="w-full h-full">
      <React.Suspense fallback={<div className="flex items-center justify-center h-full">Loading 3D Graph...</div>}>
        <Advanced3DGraphView
          nodes={nodes}
          onToggle={onToggle}
          onSelect={onSelect}
          onPreview={onPreview}
          onNodeHover={onNodeHover}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onConnectionClick={onConnectionClick}
          height={height}
          width={width}
          layoutAlgorithm={layoutAlgorithm}
          showConnections={showConnections}
          showLabels={showLabels}
          enablePhysics={enablePhysics}
          enableAnimation={enableAnimation}
          enableSearch={enableSearch}
          enableFiltering={enableFiltering}
          autoLayout={autoLayout}
          theme={theme}
          className={className}
          style={style}
        />
      </React.Suspense>
    </div>
  )
}

export default AdvancedGraphView
