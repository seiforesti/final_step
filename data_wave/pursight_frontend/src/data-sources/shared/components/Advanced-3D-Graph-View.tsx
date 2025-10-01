/**
 * Advanced 3D Graph View Component
 * Complete rebuild with proper schema integration and 3D movement
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, Table, Columns, FileText, Folder, FolderOpen, 
  ChevronRight, ChevronDown, Eye, Network, Activity, Brain, 
  Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Settings, 
  X, Search, Filter, Layers, Grid3X3, Circle, Square, Triangle, 
  Hexagon, Star, Zap, Target, TrendingUp, Shield, Sparkles, 
  Gauge, BarChart3, Globe, Play, Pause, Square as Stop
} from 'lucide-react'

// Enhanced Graph Node Interface
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
  parentId?: string
  childIds?: string[]
  
  // 3D Position and Physics
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  fx?: number
  fy?: number
  fz?: number
  
  // Visual properties
  color?: string
  size?: number
  opacity?: number
  shape?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon'
  
  // 3D rendering
  screenX?: number
  screenY?: number
  screenScale?: number
  depth?: number
}

// Graph Connection Interface
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

// Advanced 3D Graph Layout Engine
class GraphLayoutEngine {
  private nodes: GraphNode[] = []
  private connections: GraphConnection[] = []
  private width: number = 0
  private height: number = 0
  private algorithm: LayoutAlgorithm = 'force-directed'
  private isRunning: boolean = false
  private animationId: number | null = null
  
  // 3D Camera system
  private camera = {
    x: 0, y: 0, z: 1000,
    targetX: 0, targetY: 0, targetZ: 0,
    rotationX: 0, rotationY: 0, rotationZ: 0,
    fov: 60, near: 0.1, far: 10000
  }
  
  // 3D space bounds
  private space3D = {
    width: 2000, height: 2000, depth: 2000,
    centerX: 0, centerY: 0, centerZ: 0
  }
  
  // Force configuration
  private forceConfig = {
    centerForce: 0.1,
    chargeForce: -300,
    linkForce: 0.1,
    collisionForce: 0.5,
    zAxisForce: 0.05,
    velocityDamping: 0.85,
    maxVelocity: 50,
    enable3D: true,
    enablePhysics: true
  }
  
  constructor() {
    this.tick = this.tick.bind(this)
  }
  
  setNodes(nodes: GraphNode[]) {
    this.nodes = nodes.map(node => ({
      ...node,
      x: node.x || Math.random() * this.width,
      y: node.y || Math.random() * this.height,
      z: node.z || Math.random() * 1000 - 500,
      vx: node.vx || 0,
      vy: node.vy || 0,
      vz: node.vz || 0
    }))
  }
  
  setConnections(connections: GraphConnection[]) {
    this.connections = connections
  }
  
  setDimensions(width: number, height: number) {
    this.width = width
    this.height = height
    this.space3D.width = width * 2
    this.space3D.height = height * 2
  }
  
  setAlgorithm(algorithm: LayoutAlgorithm) {
    this.algorithm = algorithm
    this.initializeLayout()
  }
  
  private initializeLayout() {
    switch (this.algorithm) {
      case 'force-directed':
        this.initializeForceDirected()
        break
      case 'force-3d':
        this.initializeForce3D()
        break
      case 'hierarchical':
        this.initializeHierarchical()
        break
      case 'circular':
        this.initializeCircular()
        break
      case 'grid':
        this.initializeGrid()
        break
      case 'tree':
        this.initializeTree()
        break
      case 'radial':
        this.initializeRadial()
        break
      case 'cluster':
        this.initializeCluster()
        break
      case 'centralized':
        this.initializeCentralized()
        break
      case 'network':
        this.initializeNetwork()
        break
      default:
        this.initializeForceDirected()
    }
  }
  
  private initializeForceDirected() {
    // Seed nodes based on schema hierarchy
    const rootNodes = this.nodes.filter(n => !n.parentId)
    const childNodes = this.nodes.filter(n => n.parentId)
    
    // Position root nodes in center
    rootNodes.forEach((node, i) => {
      const angle = (i / rootNodes.length) * Math.PI * 2
      const radius = 200
      node.x = this.width / 2 + Math.cos(angle) * radius
      node.y = this.height / 2 + Math.sin(angle) * radius
      node.z = 0
    })
    
    // Position child nodes around their parents
    childNodes.forEach(node => {
      const parent = this.nodes.find(n => n.id === node.parentId)
      if (parent) {
        const angle = Math.random() * Math.PI * 2
        const radius = 100 + Math.random() * 100
        node.x = parent.x + Math.cos(angle) * radius
        node.y = parent.y + Math.sin(angle) * radius
        node.z = parent.z + (Math.random() - 0.5) * 200
      }
    })
  }
  
  private initializeForce3D() {
    // 3D spherical distribution
    this.nodes.forEach((node, i) => {
      const phi = Math.acos(1 - 2 * i / this.nodes.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const radius = 300
      
      node.x = this.width / 2 + radius * Math.cos(theta) * Math.sin(phi)
      node.y = this.height / 2 + radius * Math.sin(theta) * Math.sin(phi)
      node.z = radius * Math.cos(phi)
    })
  }
  
  private initializeHierarchical() {
    // Build hierarchy levels
    const levels = new Map<number, GraphNode[]>()
    this.nodes.forEach(node => {
      if (!levels.has(node.level)) {
        levels.set(node.level, [])
      }
      levels.get(node.level)!.push(node)
    })
    
    const maxLevel = Math.max(...levels.keys())
    levels.forEach((levelNodes, level) => {
      levelNodes.forEach((node, i) => {
        const y = (level / maxLevel) * this.height
        const x = (i / levelNodes.length) * this.width
        node.x = x
        node.y = y
        node.z = 0
      })
    })
  }
  
  private initializeCircular() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    const radius = Math.min(this.width, this.height) / 3
    
    this.nodes.forEach((node, i) => {
      const angle = (i / this.nodes.length) * Math.PI * 2
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + Math.sin(angle) * radius
      node.z = 0
    })
  }
  
  private initializeGrid() {
    const cols = Math.ceil(Math.sqrt(this.nodes.length))
    const cellWidth = this.width / cols
    const cellHeight = this.height / cols
    
    this.nodes.forEach((node, i) => {
      const row = Math.floor(i / cols)
      const col = i % cols
      node.x = col * cellWidth + cellWidth / 2
      node.y = row * cellHeight + cellHeight / 2
      node.z = 0
    })
  }
  
  private initializeTree() {
    const rootNodes = this.nodes.filter(n => !n.parentId)
    if (rootNodes.length === 0) return
    
    const root = rootNodes[0]
    root.x = this.width / 2
    root.y = 50
    root.z = 0
    
    const layoutNode = (node: GraphNode, x: number, y: number, level: number = 0) => {
      const children = this.nodes.filter(n => n.parentId === node.id)
      if (children.length === 0) return
      
      const spacing = this.width / (children.length + 1)
      children.forEach((child, i) => {
        child.x = x + (i - children.length / 2) * spacing
        child.y = y + 100
        child.z = level * 50
        layoutNode(child, child.x, child.y, level + 1)
      })
    }
    
    layoutNode(root, root.x, root.y)
  }
  
  private initializeRadial() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    
    this.nodes.forEach((node, i) => {
      const angle = (i / this.nodes.length) * Math.PI * 2
      const radius = 50 + (node.level * 100)
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + Math.sin(angle) * radius
      node.z = node.level * 50
    })
  }
  
  private initializeCluster() {
    // Group nodes by type
    const clusters = new Map<string, GraphNode[]>()
    this.nodes.forEach(node => {
      if (!clusters.has(node.type)) {
        clusters.set(node.type, [])
      }
      clusters.get(node.type)!.push(node)
    })
    
    const clusterTypes = Array.from(clusters.keys())
    clusterTypes.forEach((type, clusterIndex) => {
      const clusterNodes = clusters.get(type)!
      const clusterX = (clusterIndex % 3) * (this.width / 3) + this.width / 6
      const clusterY = Math.floor(clusterIndex / 3) * (this.height / 3) + this.height / 6
      
      clusterNodes.forEach((node, i) => {
        const angle = (i / clusterNodes.length) * Math.PI * 2
        const radius = 50 + Math.random() * 50
        node.x = clusterX + Math.cos(angle) * radius
        node.y = clusterY + Math.sin(angle) * radius
        node.z = clusterIndex * 100
      })
    })
  }
  
  private initializeCentralized() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    
    this.nodes.forEach((node, i) => {
      const angle = (i / this.nodes.length) * Math.PI * 2
      const radius = 100 + Math.random() * 200
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + Math.sin(angle) * radius
      node.z = (Math.random() - 0.5) * 300
    })
  }
  
  private initializeNetwork() {
    // Network-style layout with multiple centers
    const centers = [
      { x: this.width * 0.25, y: this.height * 0.25 },
      { x: this.width * 0.75, y: this.height * 0.25 },
      { x: this.width * 0.25, y: this.height * 0.75 },
      { x: this.width * 0.75, y: this.height * 0.75 }
    ]
    
    this.nodes.forEach((node, i) => {
      const center = centers[i % centers.length]
      const angle = Math.random() * Math.PI * 2
      const radius = 50 + Math.random() * 100
      node.x = center.x + Math.cos(angle) * radius
      node.y = center.y + Math.sin(angle) * radius
      node.z = (Math.random() - 0.5) * 200
    })
  }
  
  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.tick()
  }
  
  stop() {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
  
  private tick() {
    if (!this.isRunning) return
    
    this.simulateForces()
    this.update3DPositions()
    this.animationId = requestAnimationFrame(this.tick)
  }
  
  private simulateForces() {
    if (!this.forceConfig.enablePhysics) return
    
    // Apply forces
    this.nodes.forEach(node => {
      if (node.fx !== undefined && node.fy !== undefined && node.fz !== undefined) return
      
      // Center force
      const centerX = this.width / 2
      const centerY = this.height / 2
      const centerZ = 0
      
      const dx = centerX - node.x
      const dy = centerY - node.y
      const dz = centerZ - node.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
      
      if (distance > 0) {
        const force = this.forceConfig.centerForce * distance
        node.vx += (dx / distance) * force
        node.vy += (dy / distance) * force
        node.vz += (dz / distance) * force
      }
      
      // Charge force (repulsion)
      this.nodes.forEach(other => {
        if (node === other) return
        
        const dx = node.x - other.x
        const dy = node.y - other.y
        const dz = node.z - other.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (distance > 0 && distance < 200) {
          const force = this.forceConfig.chargeForce / (distance * distance)
          node.vx += (dx / distance) * force
          node.vy += (dy / distance) * force
          node.vz += (dz / distance) * force
        }
      })
      
      // Link force (attraction)
      this.connections.forEach(conn => {
        if (conn.from === node.id) {
          const target = this.nodes.find(n => n.id === conn.to)
          if (target) {
            const dx = target.x - node.x
            const dy = target.y - node.y
            const dz = target.z - node.z
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
            
            if (distance > 0) {
              const force = this.forceConfig.linkForce * distance
              node.vx += (dx / distance) * force
              node.vy += (dy / distance) * force
              node.vz += (dz / distance) * force
            }
          }
        }
      })
      
      // Apply velocity with damping
      node.vx *= this.forceConfig.velocityDamping
      node.vy *= this.forceConfig.velocityDamping
      node.vz *= this.forceConfig.velocityDamping
      
      // Limit velocity
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy + node.vz * node.vz)
      if (speed > this.forceConfig.maxVelocity) {
        node.vx = (node.vx / speed) * this.forceConfig.maxVelocity
        node.vy = (node.vy / speed) * this.forceConfig.maxVelocity
        node.vz = (node.vz / speed) * this.forceConfig.maxVelocity
      }
      
      // Update position
      node.x += node.vx
      node.y += node.vy
      node.z += node.vz
    })
  }
  
  private update3DPositions() {
    if (!this.forceConfig.enable3D) return
    
    // Update 3D camera
    this.camera.rotationY += 0.001
    this.camera.rotationX += 0.0005
    
    // Project 3D positions to 2D screen coordinates
    this.nodes.forEach(node => {
      const projected = this.project3DTo2D(node.x, node.y, node.z)
      node.screenX = projected.x
      node.screenY = projected.y
      node.screenScale = projected.scale
      node.depth = projected.depth
    })
  }
  
  private project3DTo2D(x: number, y: number, z: number): { x: number, y: number, scale: number, depth: number } {
    // Simple perspective projection
    const fov = this.camera.fov
    const distance = Math.abs(z - this.camera.z)
    const scale = Math.max(0.1, 1 - distance / 2000)
    
    return {
      x: x * scale,
      y: y * scale,
      scale: scale,
      depth: distance
    }
  }
  
  getNodes(): GraphNode[] {
    return this.nodes
  }
  
  getConnections(): GraphConnection[] {
    return this.connections
  }
  
  destroy() {
    this.stop()
    this.nodes = []
    this.connections = []
  }
}

// Advanced 3D Graph Renderer
class GraphRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number = 0
  private height: number = 0
  private zoom: number = 1
  private panX: number = 0
  private panY: number = 0
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.setupCanvas()
  }
  
  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    
    this.ctx.scale(dpr, dpr)
    this.width = rect.width
    this.height = rect.height
  }
  
  setDimensions(width: number, height: number) {
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height
  }
  
  setTransform(zoom: number, panX: number, panY: number) {
    this.zoom = zoom
    this.panX = panX
    this.panY = panY
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  
  render(nodes: GraphNode[], connections: GraphConnection[], options: {
    showConnections?: boolean
    showLabels?: boolean
    nodeSize?: number
    connectionOpacity?: number
    hoveredNode?: string | null
    selectedNodes?: Set<string>
    highlightedNodes?: Set<string>
  }) {
    this.clear()
    
    this.ctx.save()
    this.ctx.translate(this.panX, this.panY)
    this.ctx.scale(this.zoom, this.zoom)
    
    // Render connections
    if (options.showConnections) {
      this.renderConnections(connections, nodes, options.connectionOpacity || 0.6)
    }
    
    // Render nodes
    this.renderNodes(nodes, {
      nodeSize: options.nodeSize || 20,
      showLabels: options.showLabels || true,
      hoveredNode: options.hoveredNode,
      selectedNodes: options.selectedNodes || new Set(),
      highlightedNodes: options.highlightedNodes || new Set()
    })
    
    this.ctx.restore()
  }
  
  private renderConnections(connections: GraphConnection[], nodes: GraphNode[], opacity: number) {
    this.ctx.save()
    this.ctx.globalAlpha = opacity
    
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from)
      const toNode = nodes.find(n => n.id === conn.to)
      
      if (!fromNode || !toNode) return
      
      const fromX = fromNode.screenX || fromNode.x
      const fromY = fromNode.screenY || fromNode.y
      const toX = toNode.screenX || toNode.x
      const toY = toNode.screenY || toNode.y
      
      this.ctx.beginPath()
      this.ctx.moveTo(fromX, fromY)
      this.ctx.lineTo(toX, toY)
      this.ctx.strokeStyle = conn.color || '#666'
      this.ctx.lineWidth = conn.weight || 1
      this.ctx.stroke()
    })
    
    this.ctx.restore()
  }
  
  private renderNodes(nodes: GraphNode[], options: {
    nodeSize: number
    showLabels: boolean
    hoveredNode: string | null | undefined
    selectedNodes: Set<string>
    highlightedNodes: Set<string>
  }) {
    nodes.forEach(node => {
      if (!node.isVisible) return
      
      const x = node.screenX || node.x
      const y = node.screenY || node.y
      const scale = node.screenScale || 1
      const size = (node.size || options.nodeSize) * scale
      
      // Node color based on state
      let color = node.color || this.getNodeTypeColor(node.type)
      if (options.selectedNodes.has(node.id)) {
        color = '#3b82f6'
      } else if (options.highlightedNodes.has(node.id)) {
        color = '#f59e0b'
      } else if (options.hoveredNode === node.id) {
        color = '#10b981'
      }
      
      // Render node
      this.ctx.save()
      this.ctx.globalAlpha = node.opacity || 1
      
      this.ctx.fillStyle = color
      this.ctx.strokeStyle = '#fff'
      this.ctx.lineWidth = 2
      
      this.ctx.beginPath()
      if (node.shape === 'square') {
        this.ctx.rect(x - size/2, y - size/2, size, size)
      } else if (node.shape === 'triangle') {
        this.ctx.moveTo(x, y - size/2)
        this.ctx.lineTo(x - size/2, y + size/2)
        this.ctx.lineTo(x + size/2, y + size/2)
        this.ctx.closePath()
      } else {
        this.ctx.arc(x, y, size/2, 0, Math.PI * 2)
      }
      
      this.ctx.fill()
      this.ctx.stroke()
      
      // Render node label
      if (options.showLabels) {
        this.ctx.fillStyle = '#000'
        this.ctx.font = `${12 * scale}px Arial`
        this.ctx.textAlign = 'center'
        this.ctx.fillText(node.name, x, y + size/2 + 15)
      }
      
      this.ctx.restore()
    })
  }
  
  private getNodeTypeColor(type: string): string {
    switch (type) {
      case 'database': return '#8b5cf6'
      case 'schema': return '#06b6d4'
      case 'table': return '#10b981'
      case 'view': return '#f59e0b'
      case 'column': return '#ef4444'
      default: return '#6b7280'
    }
  }
  
  destroy() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
}

// Main Component Props
interface Advanced3DGraphViewProps {
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
  showConnections?: boolean
  showLabels?: boolean
  enablePhysics?: boolean
  enableAnimation?: boolean
  enableSearch?: boolean
  enableFiltering?: boolean
  autoLayout?: boolean
  theme?: 'light' | 'dark' | 'auto'
  className?: string
  style?: React.CSSProperties
}

// Main Component
export function Advanced3DGraphView({
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
  showConnections = true,
  showLabels = true,
  enablePhysics = true,
  enableAnimation = true,
  enableSearch = true,
  enableFiltering = true,
  autoLayout = true,
  theme = 'auto',
  className = '',
  style = {}
}: Advanced3DGraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const layoutEngineRef = useRef<GraphLayoutEngine | null>(null)
  const rendererRef = useRef<GraphRenderer | null>(null)
  
  // State
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isPlaying, setIsPlaying] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [currentAlgorithm, setCurrentAlgorithm] = useState<LayoutAlgorithm>(layoutAlgorithm)
  const [showSettings, setShowSettings] = useState(false)
  
  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterType === 'all' || node.type === filterType
      return matchesSearch && matchesFilter && node.isVisible
    })
  }, [nodes, searchQuery, filterType])
  
  // Generate connections based on schema hierarchy
  const connections = useMemo(() => {
    const conns: GraphConnection[] = []
    
    nodes.forEach(node => {
      if (node.parentId) {
        conns.push({
          id: `${node.parentId}-${node.id}`,
          from: node.parentId,
          to: node.id,
          type: 'parent',
          strength: 1,
          color: '#666',
          opacity: 0.6
        })
      }
      
      if (node.childIds) {
        node.childIds.forEach(childId => {
          conns.push({
            id: `${node.id}-${childId}`,
            from: node.id,
            to: childId,
            type: 'child',
            strength: 1,
            color: '#666',
            opacity: 0.6
          })
        })
      }
    })
    
    return conns
  }, [nodes])
  
  // Initialize layout engine and renderer
  useEffect(() => {
    if (!canvasRef.current) return
    
    const layoutEngine = new GraphLayoutEngine()
    const renderer = new GraphRenderer(canvasRef.current)
    
    layoutEngineRef.current = layoutEngine
    rendererRef.current = renderer
    
    return () => {
      layoutEngine.destroy()
      renderer.destroy()
    }
  }, [])
  
  // Update layout when nodes or algorithm changes
  useEffect(() => {
    if (!layoutEngineRef.current) return
    
    layoutEngineRef.current.setNodes(filteredNodes)
    layoutEngineRef.current.setConnections(connections)
    layoutEngineRef.current.setDimensions(width || 800, height)
    layoutEngineRef.current.setAlgorithm(currentAlgorithm)
    
    if (isPlaying) {
      layoutEngineRef.current.start()
    }
  }, [filteredNodes, connections, currentAlgorithm, width, height, isPlaying])
  
  // Render loop
  useEffect(() => {
    if (!rendererRef.current || !layoutEngineRef.current) return
    
    const render = () => {
      if (!rendererRef.current || !layoutEngineRef.current) return
      
      const nodes = layoutEngineRef.current.getNodes()
      const connections = layoutEngineRef.current.getConnections()
      
      rendererRef.current.render(nodes, connections, {
        showConnections,
        showLabels,
        nodeSize: 20,
        connectionOpacity: 0.6,
        hoveredNode,
        selectedNodes,
        highlightedNodes
      })
      
      if (isPlaying) {
        requestAnimationFrame(render)
      }
    }
    
    render()
  }, [showConnections, showLabels, hoveredNode, selectedNodes, highlightedNodes, isPlaying])
  
  // Handle canvas interactions
  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left - panX) / zoom
    const y = (event.clientY - rect.top - panY) / zoom
    
    // Find hovered node
    const hovered = filteredNodes.find(node => {
      const nodeX = node.screenX || node.x
      const nodeY = node.screenY || node.y
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2)
      return distance < (node.size || 20) / 2
    })
    
    if (hovered && hovered.id !== hoveredNode) {
      setHoveredNode(hovered.id)
      onNodeHover?.(hovered)
    } else if (!hovered && hoveredNode) {
      setHoveredNode(null)
      onNodeHover?.(null)
    }
  }, [filteredNodes, hoveredNode, onNodeHover, panX, panY, zoom])
  
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left - panX) / zoom
    const y = (event.clientY - rect.top - panY) / zoom
    
    const clicked = filteredNodes.find(node => {
      const nodeX = node.screenX || node.x
      const nodeY = node.screenY || node.y
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2)
      return distance < (node.size || 20) / 2
    })
    
    if (clicked) {
      onNodeClick?.(clicked, event.nativeEvent)
    }
  }, [filteredNodes, onNodeClick, panX, panY, zoom])
  
  const handleCanvasDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left - panX) / zoom
    const y = (event.clientY - rect.top - panY) / zoom
    
    const clicked = filteredNodes.find(node => {
      const nodeX = node.screenX || node.x
      const nodeY = node.screenY || node.y
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2)
      return distance < (node.size || 20) / 2
    })
    
    if (clicked) {
      onNodeDoubleClick?.(clicked, event.nativeEvent)
    }
  }, [filteredNodes, onNodeDoubleClick, panX, panY, zoom])
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-gray-50 dark:bg-gray-900 ${className}`}
      style={style}
    >
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Search */}
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
          )}
          
          {/* Filter */}
          {enableFiltering && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="all">All Types</option>
              <option value="database">Database</option>
              <option value="schema">Schema</option>
              <option value="table">Table</option>
              <option value="view">View</option>
              <option value="column">Column</option>
            </select>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Layout Algorithm */}
          <select
            value={currentAlgorithm}
            onChange={(e) => setCurrentAlgorithm(e.target.value as LayoutAlgorithm)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="force-directed">Force Directed</option>
            <option value="force-3d">Force 3D</option>
            <option value="hierarchical">Hierarchical</option>
            <option value="circular">Circular</option>
            <option value="grid">Grid</option>
            <option value="tree">Tree</option>
            <option value="radial">Radial</option>
            <option value="cluster">Cluster</option>
            <option value="centralized">Centralized</option>
            <option value="network">Network</option>
          </select>
          
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width || 800}
        height={height}
        className="w-full h-full cursor-pointer"
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
      />
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Node Size</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  defaultValue="20"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Connection Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.6"
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showConnections"
                  checked={showConnections}
                  onChange={(e) => {/* Handle change */}}
                  className="rounded"
                />
                <label htmlFor="showConnections" className="text-sm">Show Connections</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showLabels"
                  checked={showLabels}
                  onChange={(e) => {/* Handle change */}}
                  className="rounded"
                />
                <label htmlFor="showLabels" className="text-sm">Show Labels</label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Advanced3DGraphView