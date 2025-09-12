/**
 * Advanced Graph View Component - Production-grade canvas renderer
 * High-performance graph visualization with Web Worker layout computation
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { 
  Database, Table, Columns, FileText, Folder, FolderOpen, 
  ChevronRight, ChevronDown, Eye, Network, Activity, Brain, Maximize2,
  Minimize2, RotateCcw, ZoomIn, ZoomOut, Settings, X
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface GraphNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  level: number
  hasChildren: boolean
  isExpanded: boolean
  isSelected: boolean
  isVisible: boolean
  metadata?: any
  children?: GraphNode[]
  x?: number
  y?: number
  connections?: string[]
  parentId?: string
  depth?: number
  weight?: number
  importance?: number
}

interface GraphConnection {
  from: string
  to: string
  type: 'parent' | 'child' | 'reference' | 'dependency'
  strength: number
}

interface AdvancedGraphViewProps {
  nodes: GraphNode[]
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string, checked: boolean) => void
  onPreview: (node: GraphNode) => void
  height?: number
  viewMode?: 'centralized' | 'hierarchical' | 'network' | 'force-directed'
  showConnections?: boolean
  enablePhysics?: boolean
  autoLayout?: boolean
}

// Web Worker for layout computation
const createLayoutWorker = (): Worker => {
  const workerCode = `
    self.onmessage = function(e) {
      const { nodes, viewMode, width, height, requestId } = e.data;
      
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.4;
      
      const positions = {};
      const levelGroups = new Map();
      
      // Group nodes by level
      nodes.forEach(node => {
        const level = node.level || 0;
        if (!levelGroups.has(level)) {
          levelGroups.set(level, []);
        }
        levelGroups.get(level).push(node);
      });
      
      // Calculate positions based on view mode
      nodes.forEach((node, index) => {
        let x = centerX, y = centerY;
        const level = node.level || 0;
        const siblings = levelGroups.get(level) || [];
        const siblingIndex = siblings.findIndex(s => s.id === node.id);
        
        switch (viewMode) {
          case 'centralized':
            if (level === 0) {
              x = centerX;
              y = centerY;
            } else {
              const levelRadius = radius * (0.1 + level * 0.15);
              const angle = (siblingIndex * 2 * Math.PI) / Math.max(siblings.length, 1);
              x = centerX + Math.cos(angle) * levelRadius;
              y = centerY + Math.sin(angle) * levelRadius;
            }
            break;
            
          case 'hierarchical':
            const levelWidth = 300;
            const levelHeight = 100;
            x = 50 + level * levelWidth;
            y = 50 + siblingIndex * levelHeight;
            break;
            
          case 'network':
            const cols = Math.ceil(Math.sqrt(nodes.length));
            const col = index % cols;
            const row = Math.floor(index / cols);
            x = 100 + col * 180;
            y = 100 + row * 120;
            break;
            
          case 'force-directed':
          default:
            const levelRadius = radius * (0.2 + level * 0.2);
            const angle = (index * 2 * Math.PI) / Math.max(nodes.length, 1);
            // Deterministic jitter based on node ID
            const seed = Math.abs(Array.from(node.id).reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000;
            const jitterX = ((seed % 10) - 5) * 4;
            const jitterY = (((seed / 10) | 0) % 10 - 5) * 4;
            x = centerX + Math.cos(angle) * levelRadius + jitterX;
            y = centerY + Math.sin(angle) * levelRadius + jitterY;
            break;
        }
        
        positions[node.id] = { x, y };
      });
      
      self.postMessage({ positions, requestId });
    };
  `;
  
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
};

export function AdvancedGraphView({
  nodes,
  onToggle,
  onSelect,
  onPreview,
  height = 600,
  viewMode = 'centralized',
  showConnections = true,
  enablePhysics = true,
  autoLayout = true
}: AdvancedGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const animationFrameRef = useRef<number>()
  const requestIdRef = useRef(0)
  
  // Core state
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  
  // Advanced controls
  const [showControls, setShowControls] = useState(true)
  const [nodeSize, setNodeSize] = useState(1)
  const [connectionOpacity, setConnectionOpacity] = useState(0.6)
  const [showLabels, setShowLabels] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'importance'>('importance')
  
  // Performance optimization
  const [visibleNodes, setVisibleNodes] = useState<GraphNode[]>([])
  const [connections, setConnections] = useState<GraphConnection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({})
  
  // Performance constants
  const LARGE_GRAPH_THRESHOLD = 500
  const MAX_NODES = 1000
  const MAX_CONNECTIONS = 2000
  const VIEWPORT_PADDING = 100

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = createLayoutWorker()
    } catch (error) {
      console.warn('Web Worker not supported, falling back to main thread')
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  // Update dimensions on resize
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const updateDimensions = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight
          })
        }
      }, 100)
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => {
      window.removeEventListener('resize', updateDimensions)
      clearTimeout(timeoutId)
    }
  }, [])

  // Flatten hierarchical nodes
  const flattenNodes = useCallback((nodeList: GraphNode[], level = 0): GraphNode[] => {
    const result: GraphNode[] = []
    
    const flatten = (nodes: GraphNode[], currentLevel = 0) => {
      nodes.forEach(node => {
        result.push({ 
          ...node, 
          level: currentLevel,
          depth: currentLevel,
          importance: calculateNodeImportance(node)
        })
        
        if (node.children && node.children.length > 0) {
          flatten(node.children, currentLevel + 1)
        }
      })
    }
    
    flatten(nodeList, level)
    return result
  }, [])

  // Calculate node importance
  const calculateNodeImportance = useCallback((node: GraphNode): number => {
    let importance = 0
    
    switch (node.type) {
      case 'database': importance = 100; break
      case 'schema': importance = 80; break
      case 'table': importance = 60; break
      case 'view': importance = 50; break
      case 'column': importance = 30; break
      default: importance = 10
    }
    
    if (node.metadata?.rowCount) {
      importance += Math.min(20, Math.log10(node.metadata.rowCount + 1))
    }
    
    return importance
  }, [])

  // Process nodes with filtering and sorting
  const processedNodes = useMemo(() => {
    const flattened = flattenNodes(nodes)
    let filtered = flattened
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(node => node.type === filterType)
    }
    
    // Sort nodes
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'type': return a.type.localeCompare(b.type)
        case 'importance': return (b.importance || 0) - (a.importance || 0)
        default: return 0
      }
    })
    
    // Cap nodes for performance
    if (filtered.length > MAX_NODES) {
      filtered = filtered.slice(0, MAX_NODES)
    }
    
    return filtered
  }, [nodes, filterType, sortBy, flattenNodes])

  // Generate connections
  const generateConnections = useCallback((nodes: GraphNode[]): GraphConnection[] => {
    const conns: GraphConnection[] = []
    const nodeMap = new Map(nodes.map(node => [node.id, node]))
    
    for (let i = 0; i < nodes.length && conns.length < MAX_CONNECTIONS; i++) {
      const node = nodes[i]
      
      if (node.level > 0) {
        // Find parent nodes
        const potentialParents: GraphNode[] = []
        
        if (node.parentId && nodeMap.has(node.parentId)) {
          potentialParents.push(nodeMap.get(node.parentId)!)
        } else {
          const parent = nodes.find(n => n.level === node.level - 1)
          if (parent) potentialParents.push(parent)
        }
        
        if (potentialParents.length > 0) {
          const parent = potentialParents[0]
          conns.push({
            from: parent.id,
            to: node.id,
            type: 'parent',
            strength: 1
          })
        }
      }
    }
    
    return conns
  }, [])

  // Request layout from worker
  const requestLayoutFromWorker = useCallback((baseNodes: GraphNode[], mode: string): Promise<Record<string, {x:number,y:number}>> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !dimensions.width || !dimensions.height) {
        // Fallback to simple radial layout
        const centerX = dimensions.width / 2
        const centerY = dimensions.height / 2
        const radius = Math.min(dimensions.width, dimensions.height) * 0.4
        const positions: Record<string, {x:number,y:number}> = {}
        const levelGroups = new Map<number, GraphNode[]>()
        
        baseNodes.forEach(n => {
          const lvl = n.level || 0
          if (!levelGroups.has(lvl)) levelGroups.set(lvl, [])
          levelGroups.get(lvl)!.push(n)
        })
        
        baseNodes.forEach((node) => {
          let x = centerX, y = centerY
          const lvl = node.level || 0
          const siblings = levelGroups.get(lvl) || []
          const idx = Math.max(0, siblings.findIndex(s => s.id === node.id))
          const angle = (idx * 2 * Math.PI) / Math.max(1, siblings.length)
          const r = lvl === 0 ? 0 : radius * (0.15 + lvl * 0.15)
          x = centerX + Math.cos(angle) * r
          y = centerY + Math.sin(angle) * r
          positions[node.id] = { x, y }
        })
        
        resolve(positions)
        return
      }
      
      const requestId = ++requestIdRef.current
      const payload = {
        nodes: baseNodes.map(n => ({ 
          id: n.id, 
          level: n.level, 
          type: n.type, 
          parentId: n.parentId, 
          importance: n.importance 
        })),
        viewMode: mode,
        width: dimensions.width,
        height: dimensions.height,
        requestId
      }
      
      const handleMessage = (e: MessageEvent) => {
        if (e.data.requestId === requestId) {
          resolve(e.data.positions)
          workerRef.current?.removeEventListener('message', handleMessage)
        }
      }
      
      workerRef.current.addEventListener('message', handleMessage)
      workerRef.current.postMessage(payload)
    })
  }, [dimensions])

  // Calculate layout and connections
  useEffect(() => {
    if (processedNodes.length === 0) return
    
    setIsLoading(true)
    
    const updateLayout = async () => {
      try {
        const positions = await requestLayoutFromWorker(processedNodes, viewMode)
        const layoutNodes = processedNodes.map(n => ({ 
          ...n, 
          x: positions[n.id]?.x, 
          y: positions[n.id]?.y 
        }))
        const nodeConnections = generateConnections(layoutNodes)
        
        setVisibleNodes(layoutNodes)
        setConnections(nodeConnections)
        setNodePositions(positions)
        setIsLoading(false)
      } catch (error) {
        console.error('Layout computation failed:', error)
        setIsLoading(false)
      }
    }
    
    if (processedNodes.length > LARGE_GRAPH_THRESHOLD && 'requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(() => {
        animationFrameRef.current = requestAnimationFrame(updateLayout)
      }, { timeout: 100 })
    } else {
      animationFrameRef.current = requestAnimationFrame(updateLayout)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [processedNodes, viewMode, requestLayoutFromWorker, generateConnections])

  // Canvas rendering with viewport culling
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !dimensions.width || !dimensions.height) return
    
    // Set up canvas for high DPI
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(dimensions.width * dpr)
    canvas.height = Math.floor(dimensions.height * dpr)
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    
    // Viewport bounds for culling
    const viewportLeft = -pan.x / zoom - VIEWPORT_PADDING
    const viewportRight = (-pan.x + dimensions.width) / zoom + VIEWPORT_PADDING
    const viewportTop = -pan.y / zoom - VIEWPORT_PADDING
    const viewportBottom = (-pan.y + dimensions.height) / zoom + VIEWPORT_PADDING
    
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)
    
    // Draw connections (culled)
    if (showConnections) {
      ctx.strokeStyle = `rgba(148, 163, 184, ${connectionOpacity})`
      ctx.lineWidth = Math.max(0.5, 1.5 / zoom)
      
      for (let i = 0; i < connections.length; i++) {
        const conn = connections[i]
        const from = visibleNodes.find(n => n.id === conn.from)
        const to = visibleNodes.find(n => n.id === conn.to)
        
        if (!from || !to || !from.x || !from.y || !to.x || !to.y) continue
        
        // Cull connections outside viewport
        if (from.x < viewportLeft || from.x > viewportRight || 
            from.y < viewportTop || from.y > viewportBottom ||
            to.x < viewportLeft || to.x > viewportRight || 
            to.y < viewportTop || to.y > viewportBottom) continue
        
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }
    }
    
    // Draw nodes (culled and LOD)
    const nodeSizeMultiplier = Math.max(0.5, Math.min(2, nodeSize))
    
    for (let i = 0; i < visibleNodes.length; i++) {
      const node = visibleNodes[i]
      if (!node.x || !node.y) continue
      
      // Cull nodes outside viewport
      if (node.x < viewportLeft || node.x > viewportRight || 
          node.y < viewportTop || node.y > viewportBottom) continue
      
      // LOD: smaller nodes at low zoom
      const baseSize = 12
      const size = Math.max(4, Math.min(24, baseSize * nodeSizeMultiplier / Math.max(0.3, zoom)))
      
      // Color by type
      let fill = '#64748b' // slate-500
      if (node.type === 'database') fill = '#3b82f6' // blue-500
      else if (node.type === 'schema') fill = '#f59e0b' // amber-500
      else if (node.type === 'table') fill = '#10b981' // emerald-500
      else if (node.type === 'view') fill = '#8b5cf6' // violet-500
      else if (node.type === 'column') fill = '#6b7280' // gray-500
      
      if (node.isSelected) fill = '#f59e0b' // amber-500
      if (hoveredNode === node.id) fill = '#6366f1' // indigo-500
      
      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.arc(node.x, node.y, size / 2, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw selection ring
      if (node.isSelected) {
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(node.x, node.y, size / 2 + 2, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Draw labels (LOD: only at high zoom)
      if (showLabels && zoom >= 0.8) {
        ctx.fillStyle = '#111827'
        ctx.font = `${Math.max(10, 12 / zoom)}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu`
        const text = node.name.length > 15 ? node.name.slice(0, 14) + '…' : node.name
        ctx.fillText(text, node.x + size * 0.7, node.y + 4)
      }
    }
    
    ctx.restore()
  }, [visibleNodes, connections, zoom, pan, showLabels, showConnections, connectionOpacity, nodeSize, dimensions, hoveredNode])

  // Mouse interaction handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    } else {
      // Hit testing for hover
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      
      let foundNode: GraphNode | null = null
      for (let i = 0; i < visibleNodes.length; i++) {
        const node = visibleNodes[i]
        if (!node.x || !node.y) continue
        
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
        const currentNodeSize = Math.max(4, Math.min(24, 12 * nodeSize / Math.max(0.3, zoom)))
        
        if (distance <= currentNodeSize / 2) {
          foundNode = node
          break
        }
      }
      
      setHoveredNode(foundNode?.id || null)
    }
  }, [isDragging, dragStart, pan, zoom, visibleNodes, nodeSize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)))
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom
    
    // Hit testing
    for (let i = 0; i < visibleNodes.length; i++) {
      const node = visibleNodes[i]
      if (!node.x || !node.y) continue
      
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      const currentNodeSize = Math.max(4, Math.min(24, 12 * nodeSize / Math.max(0.3, zoom)))
      
      if (distance <= currentNodeSize / 2) {
        onSelect(node.id, !node.isSelected)
        return
      }
    }
  }, [isDragging, pan, zoom, visibleNodes, nodeSize, onSelect])

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom
    
    // Hit testing
    for (let i = 0; i < visibleNodes.length; i++) {
      const node = visibleNodes[i]
      if (!node.x || !node.y) continue
      
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      const currentNodeSize = Math.max(4, Math.min(24, 12 * nodeSize / Math.max(0.3, zoom)))
      
      if (distance <= currentNodeSize / 2) {
        if (node.hasChildren) {
          onToggle(node.id)
        } else {
          onPreview(node)
        }
        return
      }
    }
  }, [isDragging, pan, zoom, visibleNodes, nodeSize, onToggle, onPreview])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const fitToView = useCallback(() => {
    if (visibleNodes.length === 0) return
    
    const bounds = visibleNodes.reduce((acc, node) => {
      if (!node.x || !node.y) return acc
      return {
        minX: Math.min(acc.minX, node.x),
        maxX: Math.max(acc.maxX, node.x),
        minY: Math.min(acc.minY, node.y),
        maxY: Math.max(acc.maxY, node.y)
      }
    }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity })
    
    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY
    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2
    
    const scale = Math.min(dimensions.width / width, dimensions.height / height) * 0.8
    const newZoom = Math.max(0.1, Math.min(5, scale))
    
    setZoom(newZoom)
    setPan({
      x: dimensions.width / 2 - centerX * newZoom,
      y: dimensions.height / 2 - centerY * newZoom
    })
  }, [visibleNodes, dimensions])

  // Auto-expand nodes with children but no data
  const attemptedAutoExpandRef = useRef(false)
  useEffect(() => {
    if (attemptedAutoExpandRef.current) return
    if (!nodes || nodes.length === 0) return
    
    const rootsWithNoChildren = nodes.filter(n => n.hasChildren && (!n.children || n.children.length === 0))
    if (rootsWithNoChildren.length > 0) {
      attemptedAutoExpandRef.current = true
      rootsWithNoChildren.slice(0, 8).forEach(r => {
        try { onToggle(r.id) } catch { /* noop */ }
      })
    }
  }, [nodes, onToggle])

  // Control panel
  const renderControlPanel = () => (
    <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg">
          <Network className="h-3 w-3 mr-1" />
          {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
        </Badge>
        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg">
          {visibleNodes.length} Nodes
        </Badge>
        {isLoading && (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Processing
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="bg-white/90 backdrop-blur-sm shadow-lg"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={fitToView}
                className="bg-white/90 backdrop-blur-sm shadow-lg"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
          <ZoomOut 
            className="h-4 w-4 cursor-pointer hover:text-blue-600" 
            onClick={() => setZoom(prev => Math.max(0.1, prev * 0.9))}
          />
          <span className="text-xs font-medium min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <ZoomIn 
            className="h-4 w-4 cursor-pointer hover:text-blue-600" 
            onClick={() => setZoom(prev => Math.min(5, prev * 1.1))}
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 rounded-lg overflow-hidden">
      {/* Control Panel */}
      {renderControlPanel()}
      
      {/* Settings Panel */}
      {showControls && (
        <div className="absolute top-16 right-4 z-30 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Graph Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">Node Size</Label>
                <Slider
                  value={[nodeSize]}
                  onValueChange={([value]) => setNodeSize(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-xs font-medium">Connection Opacity</Label>
                <Slider
                  value={[connectionOpacity]}
                  onValueChange={([value]) => setConnectionOpacity(value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Show Labels</Label>
                <Switch
                  checked={showLabels}
                  onCheckedChange={setShowLabels}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Show Connections</Label>
                <Switch
                  checked={showConnections}
                  onCheckedChange={(checked) => {
                    console.log('Toggle connections:', checked)
                  }}
                />
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Filter by Type</Label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="database">Database</option>
                  <option value="schema">Schema</option>
                  <option value="table">Table</option>
                  <option value="view">View</option>
                  <option value="column">Column</option>
                </select>
              </div>
              
              <div className="space-y-2 mt-3">
                <Label className="text-xs font-medium">Sort by</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="importance">Importance</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Graph Renderer */}
      <ScrollArea className="w-full h-full">
        <div
          ref={containerRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ height: `${height}px`, minHeight: `${height}px` }}
        >
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0"
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
          />

          {/* Center indicator for centralized view */}
          {viewMode === 'centralized' && (
            <div
              className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse"
              style={{
                left: dimensions.width / 2 + pan.x,
                top: dimensions.height / 2 + pan.y,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold">Node Types</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <Database className="h-3 w-3 text-blue-500" />
              <span className="font-medium">Database</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <Folder className="h-3 w-3 text-amber-500" />
              <span className="font-medium">Schema</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <Table className="h-3 w-3 text-emerald-500" />
              <span className="font-medium">Table</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded-full bg-violet-500"></div>
              <FileText className="h-3 w-3 text-violet-500" />
              <span className="font-medium">View</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <Columns className="h-3 w-3 text-gray-500" />
              <span className="font-medium">Column</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Indicator */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-medium">Processing Graph Layout...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}