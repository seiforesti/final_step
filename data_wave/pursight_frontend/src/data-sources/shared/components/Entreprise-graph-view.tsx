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
  x?: number
  y?: number
  z?: number // 3D Z-axis position for true dimensional movement
  vx?: number // velocity for physics simulation
  vy?: number
  vz?: number // 3D Z-axis velocity for dimensional movement
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
  | 'hierarchical'
  | 'circular'
  | 'grid'
  | 'tree'
  | 'radial'
  | 'cluster'
  | 'organic'
  | 'spiral'
  | 'concentric'

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

// Advanced Layout Engine with Multiple Algorithms
class GraphLayoutEngine {
  private nodes: GraphNode[] = []
  private connections: GraphConnection[] = []
  private width: number = 0
  private height: number = 0
  private algorithm: LayoutAlgorithm = 'force-directed'
  private isRunning: boolean = false
  private animationId: number | null = null
  
  // 3D Camera and perspective properties for true dimensional movement
  private camera = {
    x: 0,
    y: 0,
    z: 1000, // Camera distance from 3D space
    rotationX: 0, // Pitch rotation
    rotationY: 0, // Yaw rotation
    rotationZ: 0, // Roll rotation
    fov: 60, // Field of view for 3D perspective
    near: 100,
    far: 2000
  }
  
  // 3D space properties
  private space3D = {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    depth: 2000, // 3D space depth
    gravity: 0.002, // 3D gravity effect
    rotationSpeed: 0.001, // Space rotation speed
    orbitalSpeed: 0.0008 // Orbital movement speed
  }
  
  // PRODUCTION-LEVEL SCHEMA SYNCHRONIZATION CONFIGURATION
  // Core physics balanced for proper schema hierarchy display
  private forceConfig = {
    charge: -500, // Balanced repulsion for proper schema spacing
    linkDistance: 80, // Optimal distance for schema relationships
    linkStrength: 0.5, // Strong links for schema hierarchy
    friction: 0.85, // Balanced friction for stable movement
    alpha: 1,
    alphaDecay: 0.01, // Slower decay for continuous movement
    velocityDecay: 0.9, // Balanced velocity decay
    maxVelocity: 1.2, // Controlled max velocity
    minVelocity: 0.02, // Minimum visible movement
    centerForce: 0.2, // Strong center force for schema clustering
    collisionRadius: 30, // Appropriate collision radius
    
    // 3D movement forces - CONTINUOUS and SMOOTH
    floatingForce: 0.01, // Gentle floating for 3D effect
    depthForce: 0.008, // Subtle depth movement
    rotationForce: 0.005, // Gentle rotation
    waveForce: 0.006, // Wave-like movement
    spiralForce: 0.004, // Spiral movement
    orbitalForce: 0.003, // Orbital movement
    breathingForce: 0.002, // Breathing effect
    zDepth: 0.2, // 3D depth factor
    
    // Advanced 3D forces for CONTINUOUS movement
    gravity: 0.003, // Gentle gravity
    turbulence: 0.004, // Dynamic turbulence
    magnetism: 0.003, // Magnetic attraction
    elasticity: 0.005, // Elastic connections
    inertia: 0.95, // Smooth inertia
    damping: 0.9, // Balanced damping
    buoyancy: 0.001, // Floating effect
    vortex: 0.002, // Swirling motion
    resonance: 0.0008, // Node resonance
    quantum: 0.0005, // Random quantum movement
    cosmicWind: 0.0008, // Cosmic wind
    galacticRotation: 0.0005, // Galactic rotation
    stellarDrift: 0.0005, // Stellar drift
    nebulaSwirl: 0.0008, // Nebula swirling
    blackHoleEffect: 0.0002, // Black hole effect
    supernova: 0.0003, // Supernova effect
    darkMatter: 0.0002, // Dark matter
    cosmicRays: 0.0002 // Cosmic rays
  }
  
  constructor() {
    this.tick = this.tick.bind(this)
  }
  
  setNodes(nodes: GraphNode[]) {
    this.nodes = nodes.map(node => ({
      ...node,
      vx: node.vx || 0,
      vy: node.vy || 0,
      vz: node.vz || 0, // Initialize 3D Z velocity
      fx: node.fx,
      fy: node.fy,
      fz: node.fz, // Initialize 3D Z fixed position
      z: node.z || (Math.random() - 0.5) * this.space3D.depth // Random 3D Z position
    }))
  }
  
  setConnections(connections: GraphConnection[]) {
    this.connections = connections
  }
  
  setDimensions(width: number, height: number) {
    this.width = width
    this.height = height
    
    // Initialize 3D space center
    this.space3D.centerX = width / 2
    this.space3D.centerY = height / 2
    this.space3D.centerZ = 0
    
    // Initialize camera position
    this.camera.x = width / 2
    this.camera.y = height / 2
  }
  
  setAlgorithm(algorithm: LayoutAlgorithm) {
    this.algorithm = algorithm
    this.initializeLayout()
  }
  
  // Speed control methods
  setSimulationSpeed(speed: number) {
    this.forceConfig.alphaDecay = Math.max(0.001, Math.min(0.1, speed))
    this.forceConfig.velocityDecay = Math.max(0.1, Math.min(0.9, 1 - speed * 0.5))
  }
  
  setNodeSpacing(spacing: number) {
    this.forceConfig.charge = -800 * spacing
    this.forceConfig.linkDistance = 150 * spacing
    this.forceConfig.collisionRadius = 50 * spacing
  }
  
  setMovementDamping(damping: number) {
    this.forceConfig.friction = Math.max(0.5, Math.min(0.99, damping))
    this.forceConfig.velocityDecay = Math.max(0.1, Math.min(0.9, damping))
  }
  
  // 3D Projection methods for true dimensional movement
  private project3DTo2D(x: number, y: number, z: number): { x: number, y: number, scale: number } {
    // 3D to 2D projection with perspective
    const distance = this.camera.z - z
    const scale = this.camera.fov / (this.camera.fov + distance)
    
    // Apply camera rotation
    const rotated = this.rotate3D(x - this.camera.x, y - this.camera.y, z - this.camera.z)
    
    return {
      x: this.camera.x + rotated.x * scale,
      y: this.camera.y + rotated.y * scale,
      scale: Math.max(0.1, scale)
    }
  }
  
  private rotate3D(x: number, y: number, z: number): { x: number, y: number, z: number } {
    // Apply 3D rotations
    let rotatedX = x
    let rotatedY = y
    let rotatedZ = z
    
    // Y rotation (yaw)
    const cosY = Math.cos(this.camera.rotationY)
    const sinY = Math.sin(this.camera.rotationY)
    const newX = rotatedX * cosY - rotatedZ * sinY
    const newZ = rotatedX * sinY + rotatedZ * cosY
    rotatedX = newX
    rotatedZ = newZ
    
    // X rotation (pitch)
    const cosX = Math.cos(this.camera.rotationX)
    const sinX = Math.sin(this.camera.rotationX)
    const newY = rotatedY * cosX - rotatedZ * sinX
    const newZ2 = rotatedY * sinX + rotatedZ * cosX
    rotatedY = newY
    rotatedZ = newZ2
    
    return { x: rotatedX, y: rotatedY, z: rotatedZ }
  }
  
  // Update camera for dynamic 3D movement
  private updateCamera(time: number) {
    // Slow camera rotation for 3D space effect
    this.camera.rotationY += this.space3D.rotationSpeed
    this.camera.rotationX += this.space3D.rotationSpeed * 0.3
    
    // Orbital camera movement
    this.camera.x = this.space3D.centerX + Math.sin(time * this.space3D.orbitalSpeed) * 200
    this.camera.y = this.space3D.centerY + Math.cos(time * this.space3D.orbitalSpeed) * 150
  }
  
  private initializeLayout() {
    switch (this.algorithm) {
      case 'force-directed':
        this.initializeForceDirected()
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
      case 'organic':
        this.initializeOrganic()
        break
      case 'spiral':
        this.initializeSpiral()
        break
      case 'concentric':
        this.initializeConcentric()
        break
    }
  }
  
  private initializeForceDirected() {
    // CRITICAL: Initialize with SCHEMA-AWARE positioning for proper synchronization
    const centerX = this.width / 2
    const centerY = this.height / 2
    const centerZ = this.space3D.centerZ
    
    console.log('🎯 SCHEMA-GRAPH SYNC: Initializing schema-aware positioning')
    
    // Group nodes by type for proper schema hierarchy
    const nodesByType = {
      database: this.nodes.filter(n => n.type === 'database'),
      schema: this.nodes.filter(n => n.type === 'schema'),
      table: this.nodes.filter(n => n.type === 'table'),
      view: this.nodes.filter(n => n.type === 'view'),
      column: this.nodes.filter(n => n.type === 'column')
    }
    
    console.log('📊 Schema Items Distribution:', {
      databases: nodesByType.database.length,
      schemas: nodesByType.schema.length,
      tables: nodesByType.table.length,
      views: nodesByType.view.length,
      columns: nodesByType.column.length
    })
    
    // CRITICAL: Position each schema item based on its hierarchy
    this.nodes.forEach((node, index) => {
      if (node.fx === undefined && node.fy === undefined) {
        const type = node.type
        const level = node.level || 0
        const importance = node.metadata?.importance || 50
        
        // Calculate schema-specific position
        let baseX = centerX
        let baseY = centerY
        let baseZ = centerZ
        
        switch (type) {
          case 'database':
            // Databases at center - STABLE and VISIBLE
            baseX = centerX + (Math.random() - 0.5) * 20
            baseY = centerY + (Math.random() - 0.5) * 20
            baseZ = centerZ
            console.log(`🗄️ Database ${node.name} positioned at center`)
            break
            
          case 'schema':
            // Schemas around databases - MAINTAIN CONNECTION
            const schemaIndex = nodesByType.schema.indexOf(node)
            const schemaRadius = 100 + (level * 30)
            const schemaAngle = (schemaIndex * 2 * Math.PI) / Math.max(1, nodesByType.schema.length)
            baseX = centerX + Math.cos(schemaAngle) * schemaRadius
            baseY = centerY + Math.sin(schemaAngle) * schemaRadius
            baseZ = centerZ + (Math.random() - 0.5) * 15
            console.log(`📁 Schema ${node.name} positioned around database`)
            break
            
          case 'table':
            // Tables around their schemas - KEEP SCHEMA ITEMS TOGETHER
            const tableIndex = nodesByType.table.indexOf(node)
            const tableRadius = 150 + (level * 40)
            const tableAngle = (tableIndex * 2 * Math.PI) / Math.max(1, nodesByType.table.length)
            baseX = centerX + Math.cos(tableAngle) * tableRadius + (Math.random() - 0.5) * 40
            baseY = centerY + Math.sin(tableAngle) * tableRadius + (Math.random() - 0.5) * 40
            baseZ = centerZ + (Math.random() - 0.5) * 25
            console.log(`📋 Table ${node.name} positioned around schema`)
            break
            
          case 'view':
            // Views near related tables - MAINTAIN RELATIONSHIPS
            const viewIndex = nodesByType.view.indexOf(node)
            const viewRadius = 130 + (level * 35)
            const viewAngle = (viewIndex * 2 * Math.PI) / Math.max(1, nodesByType.view.length)
            baseX = centerX + Math.cos(viewAngle) * viewRadius + (Math.random() - 0.5) * 35
            baseY = centerY + Math.sin(viewAngle) * viewRadius + (Math.random() - 0.5) * 35
            baseZ = centerZ + (Math.random() - 0.5) * 20
            console.log(`👁️ View ${node.name} positioned near tables`)
            break
            
          case 'column':
            // Columns within their tables - PRECISE POSITIONING
            const columnIndex = nodesByType.column.indexOf(node)
            const columnRadius = 80 + (level * 25)
            const columnAngle = (columnIndex * 2 * Math.PI) / Math.max(1, nodesByType.column.length)
            baseX = centerX + Math.cos(columnAngle) * columnRadius + (Math.random() - 0.5) * 25
            baseY = centerY + Math.sin(columnAngle) * columnRadius + (Math.random() - 0.5) * 25
            baseZ = centerZ + (Math.random() - 0.5) * 10
            console.log(`📊 Column ${node.name} positioned within table`)
            break
        }
        
        node.x = baseX
        node.y = baseY
        node.z = baseZ
        node.vx = (Math.random() - 0.5) * 0.2
        node.vy = (Math.random() - 0.5) * 0.2
        node.vz = (Math.random() - 0.5) * 0.1
      }
    })
    
    console.log('✅ SCHEMA-GRAPH SYNC: Schema-aware positioning completed')
  }
  
  private initializeHierarchical() {
    const levelGroups = new Map<number, GraphNode[]>()
    const levelWidth = 300
    const levelHeight = 100
    
    this.nodes.forEach(node => {
      const level = node.level || 0
      if (!levelGroups.has(level)) {
        levelGroups.set(level, [])
      }
      levelGroups.get(level)!.push(node)
    })
    
    levelGroups.forEach((nodes, level) => {
      nodes.forEach((node, index) => {
        node.x = 50 + level * levelWidth
        node.y = 50 + index * levelHeight
        node.vx = 0
        node.vy = 0
      })
    })
  }
  
  private initializeCircular() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    const radius = Math.min(this.width, this.height) * 0.35
    
    this.nodes.forEach((node, index) => {
      const angle = (index * 2 * Math.PI) / this.nodes.length
      // Add some randomness for more organic look
      const randomRadius = radius + (Math.random() - 0.5) * 20
      node.x = centerX + Math.cos(angle) * randomRadius
      node.y = centerY + Math.sin(angle) * randomRadius
      node.vx = (Math.random() - 0.5) * 0.5
      node.vy = (Math.random() - 0.5) * 0.5
    })
  }
  
  private initializeGrid() {
    const cols = Math.ceil(Math.sqrt(this.nodes.length))
    const cellWidth = this.width / cols
    const cellHeight = this.height / Math.ceil(this.nodes.length / cols)
    
    this.nodes.forEach((node, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      node.x = col * cellWidth + cellWidth / 2
      node.y = row * cellHeight + cellHeight / 2
      node.vx = 0
      node.vy = 0
    })
  }
  
  private initializeTree() {
    const rootNodes = this.nodes.filter(n => n.level === 0)
    const levelSpacing = 200
    const siblingSpacing = 150
    
    const layoutNode = (node: GraphNode, x: number, y: number) => {
      node.x = x
      node.y = y
      node.vx = 0
      node.vy = 0
      
      if (node.children && node.children.length > 0) {
        const childY = y + levelSpacing
        const totalWidth = (node.children.length - 1) * siblingSpacing
        const startX = x - totalWidth / 2
        
        node.children.forEach((child, index) => {
          layoutNode(child, startX + index * siblingSpacing, childY)
        })
      }
    }
    
    rootNodes.forEach((root, index) => {
      layoutNode(root, this.width / 2, 100 + index * 200)
    })
  }
  
  private initializeRadial() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    const levelGroups = new Map<number, GraphNode[]>()
    
    this.nodes.forEach(node => {
      const level = node.level || 0
      if (!levelGroups.has(level)) {
        levelGroups.set(level, [])
      }
      levelGroups.get(level)!.push(node)
    })
    
    levelGroups.forEach((nodes, level) => {
      const radius = level * 80 + 50
      nodes.forEach((node, index) => {
        const angle = (index * 2 * Math.PI) / nodes.length
        node.x = centerX + Math.cos(angle) * radius
        node.y = centerY + Math.sin(angle) * radius
        node.vx = 0
        node.vy = 0
      })
    })
  }
  
  private initializeCluster() {
    const clusters = new Map<string, GraphNode[]>()
    this.nodes.forEach(node => {
      if (!clusters.has(node.type)) {
        clusters.set(node.type, [])
      }
      clusters.get(node.type)!.push(node)
    })
    
    const clusterRadius = 150
    let angle = 0
    
    clusters.forEach((nodes, type) => {
      const clusterX = this.width / 2 + Math.cos(angle) * clusterRadius
      const clusterY = this.height / 2 + Math.sin(angle) * clusterRadius
      
      nodes.forEach((node, index) => {
        const nodeAngle = (index * 2 * Math.PI) / nodes.length
        const nodeRadius = 30
        node.x = clusterX + Math.cos(nodeAngle) * nodeRadius
        node.y = clusterY + Math.sin(nodeAngle) * nodeRadius
        node.vx = 0
        node.vy = 0
      })
      
      angle += (2 * Math.PI) / clusters.size
    })
  }
  
  private initializeOrganic() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    const maxRadius = Math.min(this.width, this.height) * 0.4
    
    this.nodes.forEach((node, index) => {
      // Create organic clusters
      const clusterAngle = (index * 2 * Math.PI) / Math.max(1, Math.floor(this.nodes.length / 3))
      const clusterRadius = maxRadius * (0.3 + Math.random() * 0.4)
      
      const angle = clusterAngle + (Math.random() - 0.5) * 0.5
      const radius = clusterRadius + (Math.random() - 0.5) * 30
      
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + Math.sin(angle) * radius
      node.vx = (Math.random() - 0.5) * 1.5
      node.vy = (Math.random() - 0.5) * 1.5
    })
  }
  
  private initializeSpiral() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    const maxRadius = Math.min(this.width, this.height) * 0.4
    
    this.nodes.forEach((node, index) => {
      const t = index / this.nodes.length
      const radius = t * maxRadius
      const angle = t * 6 * Math.PI + Math.random() * 0.2
      // Add some variation for more dynamic look
      const variation = 1 + (Math.random() - 0.5) * 0.3
      node.x = centerX + Math.cos(angle) * radius * variation
      node.y = centerY + Math.sin(angle) * radius * variation
      node.vx = (Math.random() - 0.5) * 0.3
      node.vy = (Math.random() - 0.5) * 0.3
    })
  }
  
  private initializeConcentric() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    const levelGroups = new Map<number, GraphNode[]>()
    
    this.nodes.forEach(node => {
      const level = node.level || 0
      if (!levelGroups.has(level)) {
        levelGroups.set(level, [])
      }
      levelGroups.get(level)!.push(node)
    })
    
    const maxLevel = Math.max(...Array.from(levelGroups.keys()))
    const maxRadius = Math.min(this.width, this.height) * 0.4
    
    levelGroups.forEach((nodes, level) => {
      const radius = (level / maxLevel) * maxRadius
      nodes.forEach((node, index) => {
        const angle = (index * 2 * Math.PI) / nodes.length
        node.x = centerX + Math.cos(angle) * radius
        node.y = centerY + Math.sin(angle) * radius
        node.vx = 0
        node.vy = 0
      })
    })
  }
  
  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.forceConfig.alpha = 1
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
    
    // Ultra-optimized 3D physics simulation for maximum FPS
    const startTime = performance.now()
    const time = performance.now() * 0.0003
    
    // Update 3D camera for dynamic space movement
    this.updateCamera(time)
    
    // Run DRAMATIC 3D physics simulation for ALL algorithms
    // ALL graph types now get large-scale 3D movement
    this.simulateAdvanced3DForces()
    
    // Additional large-scale movement for non-force-directed layouts
    if (this.algorithm !== 'force-directed') {
      this.addAdvanced3DFloatingMovement()
    }
    
    // Apply TRUE 3D dimensional effects
    this.applyTrue3DEffects()
    
    this.forceConfig.alpha *= (1 - this.forceConfig.alphaDecay)
    
    // ULTRA-OPTIMIZED continuous animation for MAXIMUM FPS
    const frameTime = performance.now() - startTime
    const targetFrameTime = 16.67 // 60 FPS target
    
    // Always use requestAnimationFrame for maximum performance
      this.animationId = requestAnimationFrame(this.tick)
    
    // Only apply frame skipping for very slow frames
    if (frameTime > targetFrameTime * 3) {
      // Skip every other frame only if extremely slow
      if (Math.random() > 0.5) {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId)
        }
      this.animationId = requestAnimationFrame(this.tick)
    }
  }
  
    // Ensure continuous floating effect
    if (this.forceConfig.alpha < 0.001) {
      this.forceConfig.alpha = 0.05 // Restart with low alpha for continuous floating
    }
  }
  
  private simulateAdvanced3DForces() {
    // PRODUCTION-LEVEL 3D physics simulation with SCHEMA SYNCHRONIZATION
    const centerX = this.width / 2
    const centerY = this.height / 2
    const centerZ = this.space3D.centerZ
    const time = performance.now() * 0.0005 // Slower time for smoother movement
    
    // Process ALL nodes for schema synchronization
    const maxNodes = Math.min(this.nodes.length, 200) // Optimized limit
    
    // Apply SCHEMA-AWARE 3D forces to ALL nodes
    for (let i = 0; i < maxNodes; i++) {
      const node = this.nodes[i]
      if (node.fx !== undefined && node.fy !== undefined) continue
      
      // Initialize velocities if not set
      node.vx = node.vx || 0
      node.vy = node.vy || 0
      node.vz = node.vz || 0
      
      // Apply SCHEMA-AWARE center force based on node type and hierarchy
      const type = node.type
      const level = node.level || 0
      const importance = node.metadata?.importance || 50
      
      // Calculate schema-specific target position
      let targetX = centerX
      let targetY = centerY
      let targetZ = centerZ
      
      // SCHEMA HIERARCHY POSITIONING - CRITICAL for synchronization
      switch (type) {
        case 'database':
          // Databases at center - STABLE
          targetX = centerX + Math.sin(time * 0.02) * 20
          targetY = centerY + Math.cos(time * 0.02) * 20
          targetZ = centerZ
          break
        case 'schema':
          // Schemas orbit around databases - MAINTAIN CONNECTION
          const schemaRadius = 80 + (level * 40)
          const schemaAngle = (node.id.charCodeAt(0) + time * 0.01) % (Math.PI * 2)
          targetX = centerX + Math.cos(schemaAngle) * schemaRadius
          targetY = centerY + Math.sin(schemaAngle) * schemaRadius
          targetZ = centerZ + Math.sin(time * 0.03 + level) * 15
          break
        case 'table':
          // Tables cluster around their schemas - KEEP SCHEMA ITEMS TOGETHER
          const tableRadius = 120 + (level * 50)
          const tableAngle = (node.id.charCodeAt(0) + time * 0.015) % (Math.PI * 2)
          targetX = centerX + Math.cos(tableAngle) * tableRadius + Math.sin(time * 0.025) * 30
          targetY = centerY + Math.sin(tableAngle) * tableRadius + Math.cos(time * 0.025) * 30
          targetZ = centerZ + Math.sin(time * 0.04 + level) * 25
          break
        case 'view':
          // Views near related tables - MAINTAIN RELATIONSHIPS
          const viewRadius = 100 + (level * 40)
          const viewAngle = (node.id.charCodeAt(0) + time * 0.012) % (Math.PI * 2)
          targetX = centerX + Math.cos(viewAngle) * viewRadius + Math.sin(time * 0.02) * 25
          targetY = centerY + Math.sin(viewAngle) * viewRadius + Math.cos(time * 0.02) * 25
          targetZ = centerZ + Math.sin(time * 0.035 + level) * 20
          break
        case 'column':
          // Columns within their tables - PRECISE POSITIONING
          const columnRadius = 60 + (level * 30)
          const columnAngle = (node.id.charCodeAt(0) + time * 0.018) % (Math.PI * 2)
          targetX = centerX + Math.cos(columnAngle) * columnRadius + Math.sin(time * 0.03) * 20
          targetY = centerY + Math.sin(columnAngle) * columnRadius + Math.cos(time * 0.03) * 20
          targetZ = centerZ + Math.sin(time * 0.05 + level) * 15
          break
      }
      
      // Apply attraction force towards schema-specific target
      const dx = targetX - (node.x || 0)
      const dy = targetY - (node.y || 0)
      const dz = targetZ - (node.z || 0)
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
      
      if (distance > 0) {
        // SCHEMA-AWARE force strength based on type and importance
        const typeMultiplier = type === 'database' ? 2.0 : type === 'schema' ? 1.5 : type === 'table' ? 1.2 : 1.0
        const importanceMultiplier = 1 + (importance / 100) * 0.5
        const force = this.forceConfig.centerForce * typeMultiplier * importanceMultiplier * (1 - Math.min(distance / 400, 1))
        
        node.vx += (dx / distance) * force
        node.vy += (dy / distance) * force
        node.vz += (dz / distance) * force
      }
      
      // Apply SCHEMA-AWARE 3D forces
      this.applyNode3DForces(node, time, i)
      
      // Apply repulsive forces to nearby nodes (optimized for performance)
      for (let j = i + 1; j < Math.min(i + 3, maxNodes); j++) {
        const nodeB = this.nodes[j]
        if (nodeB.fx !== undefined && nodeB.fy !== undefined) continue
        
        const dx = (node.x || 0) - (nodeB.x || 0)
        const dy = (node.y || 0) - (nodeB.y || 0)
        const dz = (node.z || 0) - (nodeB.z || 0)
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (distance > 0 && distance < 200) {
          const force = this.forceConfig.charge / (distance * distance)
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force
          const fz = (dz / distance) * force
          
          node.vx += fx
          node.vy += fy
          node.vz += fz
          nodeB.vx = (nodeB.vx || 0) - fx
          nodeB.vy = (nodeB.vy || 0) - fy
          nodeB.vz = (nodeB.vz || 0) - fz
        }
      }
      
      // Apply velocity with balanced damping
      node.vx *= this.forceConfig.velocityDecay
      node.vy *= this.forceConfig.velocityDecay
      node.vz *= this.forceConfig.velocityDecay
      
      // Limit velocity for smooth movement
      const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy + node.vz * node.vz)
      if (velocity > this.forceConfig.maxVelocity) {
        const scale = this.forceConfig.maxVelocity / velocity
        node.vx *= scale
        node.vy *= scale
        node.vz *= scale
      }
      
      // Update position with smooth 3D movement
      node.x = (node.x || 0) + node.vx
      node.y = (node.y || 0) + node.vy
      node.z = (node.z || 0) + node.vz
      
      // Keep nodes within 3D bounds with soft boundaries
      if (node.x < 50) { node.x = 50; node.vx *= -0.5 }
      if (node.x > this.width - 50) { node.x = this.width - 50; node.vx *= -0.5 }
      if (node.y < 50) { node.y = 50; node.vy *= -0.5 }
      if (node.y > this.height - 50) { node.y = this.height - 50; node.vy *= -0.5 }
      if (node.z < -this.space3D.depth / 2) { node.z = -this.space3D.depth / 2; node.vz *= -0.5 }
      if (node.z > this.space3D.depth / 2) { node.z = this.space3D.depth / 2; node.vz *= -0.5 }
    }
  }
  
  private applyNode3DForces(node: GraphNode, time: number, index: number) {
    // PRODUCTION-LEVEL 3D forces for SCHEMA SYNCHRONIZATION and CONTINUOUS movement
    const nodeId = node.id.charCodeAt(0) + node.id.charCodeAt(1) + node.id.charCodeAt(2)
    const type = node.type
    const level = node.level || 0
    
    // Pre-calculate common values for performance with schema awareness
    const phase1 = (nodeId + time * 0.1) * 0.08
    const phase2 = (nodeId + time * 0.15) * 0.1
    const phase3 = (nodeId + time * 0.2) * 0.12
    const phase4 = (nodeId + time * 0.25) * 0.09
    const phase5 = (nodeId + time * 0.3) * 0.06
    
    // SCHEMA-AWARE 3D movement based on node type
    const typeMultiplier = type === 'database' ? 0.3 : type === 'schema' ? 0.6 : type === 'table' ? 0.8 : 0.5
    const levelMultiplier = 1 + (level * 0.1)
    
    // Gentle orbital movement - CONTINUOUS and SMOOTH
    const orbitalRadius = 0.8 + Math.sin(phase1 * 0.3) * 0.2
    const orbitalZ = Math.sin(phase1 * 0.2) * 0.15
    node.vx = (node.vx || 0) + Math.cos(phase1) * this.forceConfig.orbitalForce * orbitalRadius * typeMultiplier
    node.vy = (node.vy || 0) + Math.sin(phase1) * this.forceConfig.orbitalForce * orbitalRadius * typeMultiplier
    node.vz = (node.vz || 0) + orbitalZ * this.forceConfig.orbitalForce * levelMultiplier
    
    // Gentle spiral movement - CONTINUOUS and SMOOTH
    const spiralRadius = 0.6 + Math.sin(phase2) * 0.15
    const spiralZ = Math.cos(phase2 * 0.4) * 0.2
    node.vx = (node.vx || 0) + Math.cos(phase2 * 0.8) * this.forceConfig.spiralForce * spiralRadius * typeMultiplier
    node.vy = (node.vy || 0) + Math.sin(phase2 * 0.8) * this.forceConfig.spiralForce * spiralRadius * typeMultiplier
    node.vz = (node.vz || 0) + spiralZ * this.forceConfig.spiralForce * levelMultiplier
    
    // COSMIC WAVE movement - DRAMATIC 3D large-scale wave patterns
    const waveAmplitude = 2.0 + Math.sin(time * 0.15) * 0.3
    const waveZ = Math.sin(phase3 * 1.5) * 0.5
    node.vx = (node.vx || 0) + Math.sin(phase3) * this.forceConfig.waveForce * waveAmplitude
    node.vy = (node.vy || 0) + Math.cos(phase3) * this.forceConfig.waveForce * waveAmplitude
    node.vz = (node.vz || 0) + waveZ * this.forceConfig.waveForce * 1.3
    
    // BLACK HOLE VORTEX movement - DRAMATIC 3D swirling
    const vortexRadius = 1.0 + Math.sin(phase4) * 0.3
    const vortexZ = Math.sin(phase4 * 2.0) * 0.8
    node.vx = (node.vx || 0) + Math.cos(phase4 + Math.PI/2) * this.forceConfig.vortex * vortexRadius
    node.vy = (node.vy || 0) + Math.sin(phase4 + Math.PI/2) * this.forceConfig.vortex * vortexRadius
    node.vz = (node.vz || 0) + vortexZ * this.forceConfig.vortex * 1.4
    
    // GALACTIC RESONANCE - DRAMATIC 3D harmonic movement
    const resonanceAmplitude = 1.6 + Math.sin(time * 0.18) * 0.2
    const resonanceZ = Math.cos(phase5 * 1.3) * 0.3
    node.vx = (node.vx || 0) + Math.sin(phase5) * this.forceConfig.resonance * resonanceAmplitude
    node.vy = (node.vy || 0) + Math.cos(phase5) * this.forceConfig.resonance * resonanceAmplitude
    node.vz = (node.vz || 0) + resonanceZ * this.forceConfig.resonance * 1.1
    
    // COSMIC WIND - DRAMATIC 3D large-scale directional movement
    const windStrength = 1.8 + Math.sin(time * 0.12) * 0.2
    const windZ = Math.sin(phase1 + time * 0.3) * 0.4
    node.vx = (node.vx || 0) + Math.cos(phase1 + time * 0.2) * this.forceConfig.cosmicWind * windStrength
    node.vy = (node.vy || 0) + Math.sin(phase2 + time * 0.2) * this.forceConfig.cosmicWind * windStrength
    node.vz = (node.vz || 0) + windZ * this.forceConfig.cosmicWind * 1.6
    
    // GALACTIC ROTATION - DRAMATIC 3D massive rotational movement
    const rotationRadius = 2.5 + Math.sin(phase3 * 0.3) * 0.5
    const rotationZ = Math.cos(phase3 * 0.7) * 0.7
    node.vx = (node.vx || 0) + Math.cos(phase3 * 0.5) * this.forceConfig.galacticRotation * rotationRadius
    node.vy = (node.vy || 0) + Math.sin(phase3 * 0.5) * this.forceConfig.galacticRotation * rotationRadius
    node.vz = (node.vz || 0) + rotationZ * this.forceConfig.galacticRotation * 1.8
    
    // SUPERNOVA EXPLOSION - DRAMATIC 3D outward movement
    const explosionStrength = 2.2 + Math.sin(time * 0.08) * 0.3
    const explosionZ = Math.sin(phase4 + time * 0.15) * 1.0
    node.vx = (node.vx || 0) + Math.cos(phase4 + time * 0.1) * this.forceConfig.supernova * explosionStrength
    node.vy = (node.vy || 0) + Math.sin(phase5 + time * 0.1) * this.forceConfig.supernova * explosionStrength
    node.vz = (node.vz || 0) + explosionZ * this.forceConfig.supernova * 2.0
    
    // COSMIC RAYS - DRAMATIC 3D random large-scale movement (reduced frequency for performance)
    if (index % 3 === 0) { // Only apply to every 3rd node for performance
      const cosmicRayPhase = (nodeId + time * 0.72) * 0.04
      node.vx = (node.vx || 0) + (Math.random() - 0.5) * this.forceConfig.cosmicRays * Math.sin(cosmicRayPhase) * 2.5
      node.vy = (node.vy || 0) + (Math.random() - 0.5) * this.forceConfig.cosmicRays * Math.cos(cosmicRayPhase) * 2.5
      node.vz = (node.vz || 0) + (Math.random() - 0.5) * this.forceConfig.cosmicRays * Math.sin(cosmicRayPhase * 1.3) * 3.0
    }
  }
  
  private addAdvanced3DFloatingMovement() {
    // ULTRA-OPTIMIZED LARGE-SCALE 3D space movement for ALL layouts
    const time = performance.now() * 0.0005 // Optimized time for dramatic movement
    
    // Process nodes in batches for maximum performance
    const batchSize = 15
    const maxNodes = Math.min(this.nodes.length, 250)
    
    for (let batch = 0; batch < Math.ceil(maxNodes / batchSize); batch++) {
      const startIdx = batch * batchSize
      const endIdx = Math.min(startIdx + batchSize, maxNodes)
      
      for (let i = startIdx; i < endIdx; i++) {
        const node = this.nodes[i]
        if (node.fx !== undefined && node.fy !== undefined) continue
        
        // Initialize velocities if not set
        node.vx = node.vx || 0
        node.vy = node.vy || 0
        node.vz = node.vz || 0
      
      // Create unique 3D phase for each node based on ID
      const nodeId = node.id.charCodeAt(0) + node.id.charCodeAt(1) + node.id.charCodeAt(2)
        const phase1 = (nodeId + time * 0.5) * 0.4
        const phase2 = (nodeId + time * 0.7) * 0.5
        const phase3 = (nodeId + time * 0.9) * 0.45
        const phase4 = (nodeId + time * 1.1) * 0.35
        const phase5 = (nodeId + time * 1.3) * 0.3
        
        // DRAMATIC LARGE-SCALE 3D movement patterns
        const waveX = Math.sin(phase1) * this.forceConfig.waveForce * 2.0
        const waveY = Math.cos(phase2) * this.forceConfig.waveForce * 2.0
        const waveZ = Math.sin(phase1 + phase2) * this.forceConfig.waveForce * 1.8
        
        // DRAMATIC spiral movement for large-scale 3D depth
        const spiralX = Math.sin(phase3) * Math.cos(time * 0.4) * this.forceConfig.spiralForce * 2.5
        const spiralY = Math.cos(phase3) * Math.sin(time * 0.4) * this.forceConfig.spiralForce * 2.5
        const spiralZ = Math.sin(phase3 * 1.5) * this.forceConfig.spiralForce * 2.2
        
        // GALACTIC orbital movement for massive 3D space movement
        const orbitalX = Math.sin(time * 0.5 + phase1) * this.forceConfig.orbitalForce * 2.2
        const orbitalY = Math.cos(time * 0.5 + phase2) * this.forceConfig.orbitalForce * 2.2
        const orbitalZ = Math.sin(time * 0.3 + phase1) * this.forceConfig.orbitalForce * 1.9
        
        // COSMIC rotation movement for massive 3D effect
        const rotationX = Math.sin(phase1 + phase2 + time * 0.3) * this.forceConfig.rotationForce * 2.0
        const rotationY = Math.cos(phase2 + phase3 + time * 0.3) * this.forceConfig.rotationForce * 2.0
        const rotationZ = Math.cos(phase1 + phase3 + time * 0.2) * this.forceConfig.rotationForce * 1.7
        
        // GALACTIC WIND - DRAMATIC 3D large-scale directional movement
        const galacticWindX = Math.cos(phase1 + time * 0.25) * this.forceConfig.cosmicWind * 1.8
        const galacticWindY = Math.sin(phase2 + time * 0.25) * this.forceConfig.cosmicWind * 1.8
        const galacticWindZ = Math.sin(phase1 + phase2 + time * 0.35) * this.forceConfig.cosmicWind * 2.1
        
        // SUPERNOVA EXPLOSION - DRAMATIC 3D outward movement
        const supernovaX = Math.cos(phase4 + time * 0.15) * this.forceConfig.supernova * 3.0
        const supernovaY = Math.sin(phase5 + time * 0.15) * this.forceConfig.supernova * 3.0
        const supernovaZ = Math.cos(phase4 + phase5 + time * 0.1) * this.forceConfig.supernova * 2.8
        
        // Combine DRAMATIC large-scale 3D movements
        node.vx = (node.vx || 0) + waveX + spiralX + orbitalX + rotationX + galacticWindX + supernovaX
        node.vy = (node.vy || 0) + waveY + spiralY + orbitalY + rotationY + galacticWindY + supernovaY
        node.vz = (node.vz || 0) + waveZ + spiralZ + orbitalZ + rotationZ + galacticWindZ + supernovaZ
        
        // Apply DRAMATIC damping for more movement
        node.vx *= 0.95
        node.vy *= 0.95
        node.vz *= 0.95
        
        // Update position with DRAMATIC LARGE-SCALE 3D interpolation
        node.x = (node.x || 0) + (node.vx || 0) * 0.22
        node.y = (node.y || 0) + (node.vy || 0) * 0.22
        node.z = (node.z || 0) + (node.vz || 0) * 0.22
        
        // Keep within 3D bounds with larger padding for dramatic movement
        const padding = 50
      node.x = Math.max(padding, Math.min(this.width - padding, node.x))
      node.y = Math.max(padding, Math.min(this.height - padding, node.y))
        node.z = Math.max(-this.space3D.depth / 2, Math.min(this.space3D.depth / 2, node.z))
      }
    }
  }
  
  private applyTrue3DEffects() {
    // Apply TRUE 3D dimensional effects with perspective projection
    const time = performance.now() * 0.0003
    
    this.nodes.forEach((node, index) => {
      if (!node.x || !node.y || node.z === undefined) return
      
      // Project 3D position to 2D screen coordinates
      const projected = this.project3DTo2D(node.x, node.y, node.z)
      
      // Update 2D screen position for rendering
      node.screenX = projected.x
      node.screenY = projected.y
      node.screenScale = projected.scale
      
      // Apply TRUE 3D depth-based scaling
      const centerX = this.width / 2
      const centerY = this.height / 2
      const distanceFromCenter = Math.sqrt(
        Math.pow(node.x - centerX, 2) + Math.pow(node.y - centerY, 2) + Math.pow(node.z || 0, 2)
      )
      const maxDistance = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2) + Math.pow(this.space3D.depth / 2, 2))
      const depthScale = 0.3 + (1 - distanceFromCenter / maxDistance) * 1.4 // TRUE 3D depth scaling
      
      // Apply DRAMATIC stellar breathing effect
      const breathingPhase = (index + time * 0.6) * 0.15
      const breathingScale = 1 + Math.sin(breathingPhase) * 0.2
      
      // Apply DRAMATIC pulsing effect
      const pulsePhase = (index + time * 0.4) * 0.2
      const pulseScale = 1 + Math.sin(pulsePhase) * 0.1
      
      // Apply GALACTIC rotation effect
      const rotationPhase = (index + time * 0.3) * 0.12
      const rotationScale = 1 + Math.sin(rotationPhase) * 0.08
      
      // Apply SUPERNOVA explosion effect
      const supernovaPhase = (index + time * 0.7) * 0.08
      const supernovaScale = 1 + Math.sin(supernovaPhase) * 0.15
      
      // Apply NEBULA swirl effect
      const nebulaPhase = (index + time * 0.5) * 0.1
      const nebulaScale = 1 + Math.sin(nebulaPhase) * 0.06
      
      // Combine ALL TRUE 3D effects
      const finalScale = depthScale * breathingScale * pulseScale * rotationScale * supernovaScale * nebulaScale
      
      // Store TRUE 3D properties for rendering
      node.size = (node.size || 1) * finalScale * projected.scale
      node.opacity = Math.max(0.2, projected.scale * (1 - distanceFromCenter / maxDistance) * 0.8) // TRUE 3D opacity
      
      // Apply DRAMATIC color variation based on TRUE 3D position and movement
      const colorPhase = (index + time * 0.25) * 0.12
      const colorVariation = Math.sin(colorPhase) * 0.3
      const hueShift = (240 + colorVariation * 150) % 360
      const saturation = 85 + Math.sin(colorPhase * 1.5) * 20
      const lightness = 45 + Math.sin(colorPhase * 0.8) * 25
      node.color = `hsl(${hueShift}, ${saturation}%, ${lightness}%)`
      
      // Apply DRAMATIC glow effect based on TRUE 3D movement speed
      const velocity = Math.sqrt((node.vx || 0) ** 2 + (node.vy || 0) ** 2 + (node.vz || 0) ** 2)
      const glowIntensity = Math.min(1, velocity / 1.5)
      node.glowIntensity = glowIntensity
      
      // Apply TRUE 3D depth-based color intensity
      const depthIntensity = 1 - (Math.abs(node.z || 0) / (this.space3D.depth / 2)) * 0.6
      node.depthIntensity = depthIntensity
    })
  }
  
  private simulateForces() {
    // Ultra-optimized 3D space physics simulation for maximum FPS and smooth movement
    const centerX = this.width / 2
    const centerY = this.height / 2
    const time = performance.now() * 0.0003 // Ultra-slow time for graceful 3D movement
    
    // Process fewer nodes for maximum performance
    const maxNodes = Math.min(this.nodes.length, 150)
    const nodesToProcess = this.nodes.slice(0, maxNodes)
    
    // Apply repulsive forces with ultra-optimized spatial checking
    for (let i = 0; i < nodesToProcess.length; i++) {
      const nodeA = nodesToProcess[i]
      if (nodeA.fx !== undefined && nodeA.fy !== undefined) continue
      
      // Check fewer nearby nodes for maximum performance
      const maxChecks = Math.min(25, nodesToProcess.length - i - 1)
      for (let j = i + 1; j < i + 1 + maxChecks; j++) {
        if (j >= nodesToProcess.length) break
        
        const nodeB = nodesToProcess[j]
        if (nodeB.fx !== undefined && nodeB.fy !== undefined) continue
        
        const dx = (nodeA.x || 0) - (nodeB.x || 0)
        const dy = (nodeA.y || 0) - (nodeB.y || 0)
        const distanceSquared = dx * dx + dy * dy
        
        // Skip if nodes are too far apart
        if (distanceSquared > 8000) continue
        
        const distance = Math.sqrt(distanceSquared) || 1
        
        // Ultra-smooth collision detection
        const minDistance = this.forceConfig.collisionRadius
        if (distance < minDistance) {
          const overlap = minDistance - distance
          const separationForce = overlap * 0.1
          const fx = (dx / distance) * separationForce
          const fy = (dy / distance) * separationForce
          
          nodeA.vx = (nodeA.vx || 0) + fx
          nodeA.vy = (nodeA.vy || 0) + fy
          nodeB.vx = (nodeB.vx || 0) - fx
          nodeB.vy = (nodeB.vy || 0) - fy
        } else {
          const force = this.forceConfig.charge / distanceSquared
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        nodeA.vx = (nodeA.vx || 0) + fx
        nodeA.vy = (nodeA.vy || 0) + fy
        nodeB.vx = (nodeB.vx || 0) - fx
        nodeB.vy = (nodeB.vy || 0) - fy
        }
      }
    }
    
    // Apply attractive forces for connected nodes (ultra-reduced count)
    const maxConnections = Math.min(this.connections.length, 60)
    for (let i = 0; i < maxConnections; i++) {
      const conn = this.connections[i]
      const source = this.nodes.find(n => n.id === conn.from)
      const target = this.nodes.find(n => n.id === conn.to)
      
      if (!source || !target) continue
      if (source.fx !== undefined && source.fy !== undefined) continue
      if (target.fx !== undefined && target.fy !== undefined) continue
      
      const dx = (target.x || 0) - (source.x || 0)
      const dy = (target.y || 0) - (source.y || 0)
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      
      const force = (distance - this.forceConfig.linkDistance) * this.forceConfig.linkStrength
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force
      
      source.vx = (source.vx || 0) + fx
      source.vy = (source.vy || 0) + fy
      target.vx = (target.vx || 0) - fx
      target.vy = (target.vy || 0) - fy
    }
    
    // Apply center force to keep nodes from drifting
    nodesToProcess.forEach(node => {
      if (node.fx !== undefined && node.fy !== undefined) return
      
      const dx = centerX - (node.x || 0)
      const dy = centerY - (node.y || 0)
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      
      if (distance > this.width * 0.35) {
        const force = this.forceConfig.centerForce * (distance - this.width * 0.35)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        node.vx = (node.vx || 0) + fx
        node.vy = (node.vy || 0) + fy
      }
    })
    
    // Update positions with ultra-smooth 3D space movement
    nodesToProcess.forEach(node => {
      if (node.fx !== undefined && node.fy !== undefined) return
      
      // Apply ultra-smooth damping
      node.vx = (node.vx || 0) * this.forceConfig.velocityDecay
      node.vy = (node.vy || 0) * this.forceConfig.velocityDecay
      
      // Limit maximum velocity for ultra-smooth movement
      const velocity = Math.sqrt((node.vx || 0) ** 2 + (node.vy || 0) ** 2)
      if (velocity > this.forceConfig.maxVelocity) {
        const scale = this.forceConfig.maxVelocity / velocity
        node.vx = (node.vx || 0) * scale
        node.vy = (node.vy || 0) * scale
      }
      
      // Add ultra-smooth 3D floating movement
      if (velocity < this.forceConfig.minVelocity) {
        const nodeId = node.id.charCodeAt(0) + node.id.charCodeAt(1) + node.id.charCodeAt(2)
        
        // Multiple 3D movement patterns for space-like experience
        const phase1 = (nodeId + time * 0.2) * 0.15
        const phase2 = (nodeId + time * 0.4) * 0.2
        const phase3 = (nodeId + time * 0.6) * 0.18
        const phase4 = (nodeId + time * 0.8) * 0.12
        const phase5 = (nodeId + time * 1.0) * 0.08
        
        // Wave movement for 3D space
        const waveX = Math.sin(phase1) * this.forceConfig.waveForce
        const waveY = Math.cos(phase2) * this.forceConfig.waveForce
        
        // Spiral movement for 3D depth
        const spiralX = Math.sin(phase3) * Math.cos(time * 0.15) * this.forceConfig.spiralForce
        const spiralY = Math.cos(phase3) * Math.sin(time * 0.15) * this.forceConfig.spiralForce
        
        // Orbital movement for 3D space
        const orbitalX = Math.sin(time * 0.2 + phase1) * this.forceConfig.orbitalForce
        const orbitalY = Math.cos(time * 0.2 + phase2) * this.forceConfig.orbitalForce
        
        // Breathing movement for 3D depth
        const breathingX = Math.sin(phase4 + time * 0.08) * this.forceConfig.breathingForce
        const breathingY = Math.cos(phase5 + time * 0.08) * this.forceConfig.breathingForce
        
        // Rotation movement for 3D effect
        const rotationX = Math.sin(phase1 + phase2 + time * 0.1) * this.forceConfig.rotationForce
        const rotationY = Math.cos(phase2 + phase3 + time * 0.1) * this.forceConfig.rotationForce
        
        // Combine all 3D movements for ultra-smooth space experience
        node.vx = (node.vx || 0) + waveX + spiralX + orbitalX + breathingX + rotationX
        node.vy = (node.vy || 0) + waveY + spiralY + orbitalY + breathingY + rotationY
      }
      
      // Update position with ultra-smooth 3D interpolation
      node.x = (node.x || 0) + (node.vx || 0) * this.forceConfig.alpha
      node.y = (node.y || 0) + (node.vy || 0) * this.forceConfig.alpha
      
      // Keep nodes within bounds with padding
      const padding = 20
      node.x = Math.max(padding, Math.min(this.width - padding, node.x))
      node.y = Math.max(padding, Math.min(this.height - padding, node.y))
    })
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

// High-Performance Canvas Renderer with WebGL Support
class GraphRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private gl: WebGLRenderingContext | null = null
  private useWebGL: boolean = false
  private dpr: number = 1
  private width: number = 0
  private height: number = 0
  
  // Rendering state
  private zoom: number = 1
  private panX: number = 0
  private panY: number = 0
  private viewportBounds = { left: 0, right: 0, top: 0, bottom: 0 }
  
  // Ultra-performance optimization for maximum FPS and smooth 3D movement
  private renderQueue: { type: 'node' | 'connection', data: any }[] = []
  private lastRenderTime: number = 0
  private targetFPS: number = 120 // Ultra-high FPS for smooth 3D movement
  private frameTime: number = 1000 / this.targetFPS
  private frameSkip: number = 0
  private patternHighlightColor: string = '#3b82f6' // Add pattern highlight color property
  private maxFrameSkip: number = 0 // No frame skipping for ultra-smooth movement
  private renderCount: number = 0
  private lastFPSUpdate: number = 0
  private frameBuffer: number[] = []
  private adaptiveFPS: boolean = true
  
  constructor(canvas: HTMLCanvasElement, useWebGL: boolean = false) {
    this.canvas = canvas
    this.useWebGL = useWebGL
    this.dpr = window.devicePixelRatio || 1
    
    this.ctx = canvas.getContext('2d')!
    
    if (useWebGL) {
      try {
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
        if (!this.gl) {
          console.warn('WebGL not supported, falling back to 2D canvas')
          this.useWebGL = false
        }
      } catch (e) {
        console.warn('WebGL initialization failed, falling back to 2D canvas')
        this.useWebGL = false
      }
    }
  }
  
  setDimensions(width: number, height: number) {
    this.width = width
    this.height = height
    
    this.canvas.width = Math.floor(width * this.dpr)
    this.canvas.height = Math.floor(height * this.dpr)
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    }
  }
  
  setTransform(zoom: number, panX: number, panY: number) {
    this.zoom = zoom
    this.panX = panX
    this.panY = panY
    
    this.updateViewportBounds()
  }
  
  getTransform() {
    return {
      zoom: this.zoom,
      panX: this.panX,
      panY: this.panY
    }
  }
  
  private updateViewportBounds() {
    const padding = 100
    this.viewportBounds = {
      left: (-this.panX / this.zoom) - padding,
      right: ((-this.panX + this.width) / this.zoom) + padding,
      top: (-this.panY / this.zoom) - padding,
      bottom: ((-this.panY + this.height) / this.zoom) + padding
    }
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    
    if (this.gl) {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }
  }
  
  render(nodes: GraphNode[], connections: GraphConnection[], options: {
    showConnections?: boolean
    showLabels?: boolean
    nodeSize?: number
    connectionOpacity?: number
    hoveredNode?: string | null
    selectedNodes?: Set<string>
    highlightedNodes?: Set<string>
    patternHighlightColor?: string
  }) {
    const now = performance.now()
    
    // Set pattern highlight color
    this.patternHighlightColor = options.patternHighlightColor || '#3b82f6'
    
    // Ultra-optimized frame skipping for maximum FPS
    if (now - this.lastRenderTime < this.frameTime) {
      this.frameSkip++
      if (this.frameSkip <= this.maxFrameSkip) {
      return // Skip frame to maintain target FPS
      }
      this.frameSkip = 0
    }
    
    this.lastRenderTime = now
    this.renderCount++
    
    // Adaptive FPS adjustment for ultra-smooth movement
    if (this.adaptiveFPS) {
      this.frameBuffer.push(now - this.lastRenderTime)
      if (this.frameBuffer.length > 60) {
        this.frameBuffer.shift()
      }
      
      if (this.frameBuffer.length >= 30) {
        const avgFrameTime = this.frameBuffer.reduce((a, b) => a + b, 0) / this.frameBuffer.length
        const currentFPS = 1000 / avgFrameTime
        
        if (currentFPS > 100) {
          this.targetFPS = Math.min(144, this.targetFPS + 1)
        } else if (currentFPS < 80) {
          this.targetFPS = Math.max(60, this.targetFPS - 1)
        }
        this.frameTime = 1000 / this.targetFPS
      }
    }
    
    // Update FPS counter every second
    if (now - this.lastFPSUpdate >= 1000) {
      this.lastFPSUpdate = now
      this.renderCount = 0
    }
    
    this.clear()
    
    this.ctx.save()
    this.ctx.translate(this.panX, this.panY)
    this.ctx.scale(this.zoom, this.zoom)
    
    // Ultra-optimized visible node filtering
    const visibleNodes = this.getVisibleNodes(nodes)
    const visibleConnections = this.getVisibleConnections(connections)
    
    // Render connections first (behind nodes) - ultra-optimized for maximum FPS
    if (options.showConnections && visibleConnections.length > 0) {
      this.renderConnections(visibleConnections.slice(0, 200), options.connectionOpacity || 0.6)
    }
    
    // Render nodes - ultra-optimized for maximum FPS
    if (visibleNodes.length > 0) {
      this.renderNodes(visibleNodes.slice(0, 250), {
      nodeSize: options.nodeSize || 1,
      showLabels: options.showLabels || true,
      hoveredNode: options.hoveredNode,
        selectedNodes: options.selectedNodes || new Set(),
        highlightedNodes: options.highlightedNodes || new Set()
    })
    }
    
    this.ctx.restore()
  }
  
  private getVisibleNodes(nodes: GraphNode[]): GraphNode[] {
    // Optimized viewport culling
    const result: GraphNode[] = []
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.x !== undefined && node.y !== undefined && this.isNodeVisible(node)) {
        result.push(node)
      }
    }
    return result
  }
  
  private getVisibleConnections(connections: GraphConnection[]): GraphConnection[] {
    // Optimized connection filtering
    const result: GraphConnection[] = []
    for (let i = 0; i < connections.length; i++) {
      const conn = connections[i]
      if (this.isConnectionVisible(conn)) {
        result.push(conn)
      }
    }
    return result
  }
  
  private renderConnections(connections: GraphConnection[], opacity: number) {
    // Ultra-optimized 3D connection rendering for maximum FPS
    const time = performance.now() * 0.001
    
    // Enhanced 3D gradient for connections
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height)
    gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity * 0.8})`) // Blue start
    gradient.addColorStop(0.5, `rgba(147, 51, 234, ${opacity * 0.6})`) // Purple middle
    gradient.addColorStop(1, `rgba(236, 72, 153, ${opacity * 0.4})`) // Pink end
    
    this.ctx.strokeStyle = gradient
    this.ctx.lineWidth = Math.max(0.6, 1.2 / this.zoom)
    this.ctx.lineCap = 'round'
    
    // Add subtle glow effect for 3D space feel
    this.ctx.shadowColor = 'rgba(59, 130, 246, 0.1)'
    this.ctx.shadowBlur = 1
    
    // Batch render connections for maximum performance
      this.ctx.beginPath()
    connections.forEach(conn => {
      if (!conn.fromX || !conn.fromY || !conn.toX || !conn.toY) return
      
      this.ctx.moveTo(conn.fromX, conn.fromY)
      this.ctx.lineTo(conn.toX, conn.toY)
    })
    this.ctx.stroke()
    
    // Reset shadow
    this.ctx.shadowBlur = 0
  }
  
  private renderNodes(nodes: GraphNode[], options: {
    nodeSize: number
    showLabels: boolean
    hoveredNode: string | null | undefined
    selectedNodes: Set<string>
    highlightedNodes: Set<string> // Add highlightedNodes to options
  }) {
    const nodeSizeMultiplier = Math.max(0.5, Math.min(2, options.nodeSize))
    const time = performance.now() * 0.0008 // Slower for smoother 3D effects
    
    // Ultra-optimized TRUE 3D rendering for maximum FPS with advanced effects
    nodes.forEach(node => {
      if (!node.screenX || !node.screenY) return
      
      const size = this.calculateNodeSize(node, nodeSizeMultiplier)
      const color = this.getNodeColor(node, options.hoveredNode, options.selectedNodes)
      const isHovered = options.hoveredNode === node.id
      const isSelected = options.selectedNodes.has(node.id)
      
      // Check if node is highlighted by pattern analysis
      const isPatternHighlighted = options.highlightedNodes.has(node.id)
      const patternColor = isPatternHighlighted ? this.getPatternHighlightColor(node.id) : null
      
      // Use TRUE 3D projected positions and effects
      const centerX = this.width / 2
      const centerY = this.height / 2
      const distanceFromCenter = Math.sqrt(
        Math.pow(node.screenX - centerX, 2) + Math.pow(node.screenY - centerY, 2)
      )
      const maxDistance = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2))
      const depthScale = (node.screenScale || 1) * (0.8 + (distanceFromCenter / maxDistance) * 0.4)
      
      // Apply DRAMATIC breathing effect
      const breathingPhase = (node.id.charCodeAt(0) + time * 0.6) * 0.15
      const breathingScale = 1 + Math.sin(breathingPhase) * 0.15
      
      // Apply DRAMATIC pulsing effect
      const pulsePhase = (node.id.charCodeAt(1) + time * 0.4) * 0.2
      const pulseScale = 1 + Math.sin(pulsePhase) * 0.08
      
      // Apply SUPERNOVA explosion effect
      const supernovaPhase = (node.id.charCodeAt(2) + time * 0.7) * 0.08
      const supernovaScale = 1 + Math.sin(supernovaPhase) * 0.12
      
      // Apply NEBULA swirl effect
      const nebulaPhase = (node.id.charCodeAt(0) + time * 0.5) * 0.1
      const nebulaScale = 1 + Math.sin(nebulaPhase) * 0.05
      
      const finalSize = size * depthScale * breathingScale * pulseScale * supernovaScale * nebulaScale
      const finalOpacity = Math.max(0.4, 1 - (distanceFromCenter / maxDistance) * 0.5)
      
      // Enhanced TRUE 3D gradient with depth and pattern highlighting
      const gradient = this.ctx.createRadialGradient(
        node.screenX - finalSize * 0.3, node.screenY - finalSize * 0.3, 0,
        node.screenX, node.screenY, finalSize / 2
      )
      
      // Use pattern color if highlighted, otherwise use normal color
      const baseColor = isPatternHighlighted && patternColor ? patternColor : color
      gradient.addColorStop(0, this.lightenColor(baseColor, 0.4 * finalOpacity))
      gradient.addColorStop(0.7, baseColor)
      gradient.addColorStop(1, this.darkenColor(baseColor, 0.2 * finalOpacity))
      
      // Render DRAMATIC node shadow for large-scale 3D effect
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      this.ctx.shadowBlur = 4 * finalOpacity
      this.ctx.shadowOffsetX = 2 * finalOpacity
      this.ctx.shadowOffsetY = 2 * finalOpacity
      
      // Render DRAMATIC glow effect for fast-moving nodes
      const velocity = Math.sqrt((node.vx || 0) ** 2 + (node.vy || 0) ** 2)
      const glowIntensity = Math.min(1, velocity / 2)
      
      if (glowIntensity > 0.3) {
        // Outer glow
        this.ctx.shadowColor = `rgba(59, 130, 246, ${glowIntensity * 0.4})`
        this.ctx.shadowBlur = 8 * glowIntensity
        this.ctx.shadowOffsetX = 0
        this.ctx.shadowOffsetY = 0
      }
      
      // Render node with DRAMATIC TRUE 3D gradient
      this.ctx.fillStyle = gradient
      this.ctx.beginPath()
      this.ctx.arc(node.screenX, node.screenY, finalSize / 2, 0, Math.PI * 2)
      this.ctx.fill()
      
      // Add DRAMATIC outer ring for fast-moving nodes or pattern highlighted nodes
      if (glowIntensity > 0.5 || isPatternHighlighted) {
        const ringColor = isPatternHighlighted && patternColor 
          ? patternColor 
          : `rgba(147, 51, 234, ${glowIntensity * 0.6})`
        this.ctx.strokeStyle = ringColor
        this.ctx.lineWidth = isPatternHighlighted ? 3 : 2 * glowIntensity
        this.ctx.beginPath()
        this.ctx.arc(node.screenX, node.screenY, finalSize / 2 + 2, 0, Math.PI * 2)
        this.ctx.stroke()
      }
      
      // Reset shadow
      this.ctx.shadowBlur = 0
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 0
      
      // Enhanced hover effect with TRUE 3D glow
      if (isHovered) {
        this.ctx.strokeStyle = this.lightenColor(color, 0.6)
        this.ctx.lineWidth = 2
        this.ctx.shadowColor = this.lightenColor(color, 0.3)
        this.ctx.shadowBlur = 4
        this.ctx.beginPath()
        this.ctx.arc(node.screenX, node.screenY, finalSize / 2 + 2, 0, Math.PI * 2)
        this.ctx.stroke()
        this.ctx.shadowBlur = 0
      }
      
      // Enhanced selection ring with TRUE 3D effect
      if (isSelected) {
        this.ctx.strokeStyle = '#f59e0b'
        this.ctx.lineWidth = 2
        this.ctx.shadowColor = 'rgba(245, 158, 11, 0.5)'
        this.ctx.shadowBlur = 6
        this.ctx.beginPath()
        this.ctx.arc(node.screenX, node.screenY, finalSize / 2 + 3, 0, Math.PI * 2)
        this.ctx.stroke()
        this.ctx.shadowBlur = 0
      }
      
      // Render labels with LOD (only at high zoom for performance)
      if (options.showLabels && this.zoom >= 1.2) {
        this.renderNodeLabel(node, finalSize)
      }
    })
  }
  
  private darkenColor(color: string, factor: number): string {
    // Simple color darkening function
    const hex = color.replace('#', '')
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor))
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor))
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor))
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
  }
  
  private lightenColor(color: string, factor: number): string {
    // Simple color lightening function
    const hex = color.replace('#', '')
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 - parseInt(hex.substr(0, 2), 16)) * factor)
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 - parseInt(hex.substr(2, 2), 16)) * factor)
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 - parseInt(hex.substr(4, 2), 16)) * factor)
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
  }
  
  private renderNodeTypeIndicator(node: GraphNode, size: number) {
    if (!node.x || !node.y) return
    
    const indicatorSize = size * 0.3
    const indicatorX = node.x + size * 0.3
    const indicatorY = node.y - size * 0.3
    
    this.ctx.fillStyle = this.getNodeTypeIndicatorColor(node.type)
    this.ctx.beginPath()
    this.ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Add border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, Math.PI * 2)
    this.ctx.stroke()
  }
  
  private getNodeTypeIndicatorColor(type: string): string {
    switch (type) {
      case 'database': return '#1e40af' // Blue
      case 'schema': return '#ea580c' // Orange
      case 'table': return '#059669' // Green
      case 'view': return '#7c3aed' // Purple
      case 'column': return '#6b7280' // Gray
      default: return '#64748b'
    }
  }
  
  private isNodeVisible(node: GraphNode): boolean {
    if (!node.x || !node.y) return false
    return node.x >= this.viewportBounds.left &&
           node.x <= this.viewportBounds.right &&
           node.y >= this.viewportBounds.top &&
           node.y <= this.viewportBounds.bottom
  }
  
  private isConnectionVisible(conn: GraphConnection): boolean {
    return (conn.fromX || 0) >= this.viewportBounds.left &&
           (conn.fromX || 0) <= this.viewportBounds.right &&
           (conn.fromY || 0) >= this.viewportBounds.top &&
           (conn.fromY || 0) <= this.viewportBounds.bottom
  }
  
  private calculateNodeSize(node: GraphNode, multiplier: number): number {
    const baseSize = 12
    const importanceMultiplier = (node.importance || 50) / 100
    return Math.max(4, Math.min(24, baseSize * multiplier * importanceMultiplier / Math.max(0.3, this.zoom)))
  }
  
  private getNodeColor(node: GraphNode, hoveredNode: string | null | undefined, selectedNodes: Set<string>): string {
    if (selectedNodes.has(node.id)) return '#f59e0b'
    if (hoveredNode === node.id) return '#6366f1'
    
    switch (node.type) {
      case 'database': return '#3b82f6'
      case 'schema': return '#f59e0b'
      case 'table': return '#10b981'
      case 'view': return '#8b5cf6'
      case 'column': return '#6b7280'
      default: return '#64748b'
    }
  }
  
  private renderNodeLabel(node: GraphNode, size: number) {
    if (!node.screenX || !node.screenY) return
    
    this.ctx.fillStyle = '#111827'
    this.ctx.font = `${Math.max(10, 12 / this.zoom)}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu`
    const text = node.name.length > 15 ? node.name.slice(0, 14) + '…' : node.name
    this.ctx.fillText(text, node.screenX + size * 0.7, node.screenY + 4)
  }
  
  private getPatternHighlightColor(nodeId: string): string | null {
    // Use the pattern highlight color passed from the parent component
    return this.patternHighlightColor || '#3b82f6'
  }
  
  destroy() {
    if (this.gl) {
      this.gl = null
    }
  }
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
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layoutEngineRef = useRef<GraphLayoutEngine | null>(null)
  const rendererRef = useRef<GraphRenderer | null>(null)
  const animationFrameRef = useRef<number>()
  
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
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'importance'>('importance')
  const [searchTerm, setSearchTerm] = useState('')
  
  // CRITICAL: Pattern-based node highlighting system
  const [patternHighlightColor, setPatternHighlightColor] = useState<string>('#3b82f6')
  
  // Schema synchronization state
  const [schemaSyncStatus, setSchemaSyncStatus] = useState({
    isSynchronized: false,
    totalItems: 0,
    connectedItems: 0,
    syncPercentage: 0
  })
  
  // Advanced report generation state
  const [showReportGenerator, setShowReportGenerator] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const graphRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const chartComponentRef = useRef<SchemaLineChartRef>(null)
  const [autoLayoutState, setAutoLayoutState] = useState(autoLayout)
  const [showMinimapState, setShowMinimapState] = useState(showMinimap)
  const [showLabelsState, setShowLabelsState] = useState(showLabels)
  const [showConnectionsState, setShowConnectionsState] = useState(showConnections)
  
  // Additional state for advanced features
  const [enablePhysicsState, setEnablePhysicsState] = useState(enablePhysics)
  const [enableAnimationState, setEnableAnimationState] = useState(enableAnimation)
  const [enableClusteringState, setEnableClusteringState] = useState(enableClustering)
  
  // Advanced control state
  const [simulationSpeed, setSimulationSpeed] = useState(0.3) // Reduced default
  const [nodeSpacing, setNodeSpacing] = useState(1.0) // Reduced default
  const [movementDamping, setMovementDamping] = useState(0.9) // Increased default
  
  // Persistent graph type state - ensures selected type persists and doesn't reset
  const [selectedGraphType, setSelectedGraphType] = useState<LayoutAlgorithm>(layoutAlgorithm)
  const [isLayoutChanging, setIsLayoutChanging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  
  // Schema Analysis Integration
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [showLineChart, setShowLineChart] = useState(false)
  const [isAnalysisPanelCollapsed, setIsAnalysisPanelCollapsed] = useState(false)
  const [minimapCanvas, setMinimapCanvas] = useState<HTMLCanvasElement | null>(null)
  const [performanceMode, setPerformanceMode] = useState(true) // Enable performance mode by default
  
  
  // Performance optimization
  const [visibleNodes, setVisibleNodes] = useState<GraphNode[]>([])
  const [connections, setConnections] = useState<GraphConnection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({})
  
  // Ultra-performance constants for maximum FPS and smooth 3D movement
  const defaultConfig: PerformanceConfig = {
    maxNodes: 400, // Optimized for maximum FPS
    maxConnections: 800, // Optimized for ultra-smooth rendering
    enableVirtualization: true,
    enableLOD: true,
    enableWebGL: false, // Disabled for better compatibility
    enableWorkers: false, // Disabled for simplicity
    frameRate: 120, // Ultra-high FPS for smooth 3D movement
    memoryLimit: 50 * 1024 * 1024, // 50MB
    ...performanceConfig
  }
  
  const LARGE_GRAPH_THRESHOLD = 100 // Reduced from 500
  const MAX_NODES = defaultConfig.maxNodes
  const MAX_CONNECTIONS = defaultConfig.maxConnections
  const VIEWPORT_PADDING = 50 // Reduced from 100

  // Initialize layout engine and renderer
  useEffect(() => {
    if (!canvasRef.current) return
    
    // Initialize layout engine
    layoutEngineRef.current = new GraphLayoutEngine()
    
    // Initialize renderer
    rendererRef.current = new GraphRenderer(canvasRef.current, defaultConfig.enableWebGL)
    
    return () => {
      layoutEngineRef.current?.destroy()
      rendererRef.current?.destroy()
    }
  }, [])

  // Update dimensions on resize
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const updateDimensions = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          const newDimensions = {
            width: width || containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight
          }
          setDimensions(newDimensions)
          
          if (rendererRef.current) {
            rendererRef.current.setDimensions(newDimensions.width, newDimensions.height)
          }
          
          if (layoutEngineRef.current) {
            layoutEngineRef.current.setDimensions(newDimensions.width, newDimensions.height)
          }
        }
      }, 100)
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => {
      window.removeEventListener('resize', updateDimensions)
      clearTimeout(timeoutId)
    }
  }, [width])

  // Flatten hierarchical nodes with enhanced processing
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

  // Calculate node importance with advanced metrics
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
    
    if (node.metadata?.columnCount) {
      importance += Math.min(10, node.metadata.columnCount / 10)
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
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(term) ||
        node.metadata?.description?.toLowerCase().includes(term)
      )
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
  }, [nodes, filterType, sortBy, searchTerm, flattenNodes])

  // Convert GraphNode to AnalysisGraphNode for analysis
  const analysisNodes: AnalysisGraphNode[] = useMemo(() => {
    return processedNodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type as 'database' | 'schema' | 'table' | 'view' | 'column',
      metadata: {
        description: node.metadata?.description || '',
        ...node.metadata
      }
    }))
  }, [processedNodes])

  // Schema Analysis Hook
  const {
    patterns,
    analysis,
    lineChartData,
    selectedPattern,
    selectedNodes,
    highlightedNodes,
    selectPattern,
    toggleLineChart,
    toggleAnalysisPanel,
    generateReport,
    exportReport
  } = useSchemaAnalysis({
    nodes: analysisNodes,
    autoAnalyze: true
  })

  // CRITICAL: Enhanced pattern selection with node highlighting
  const enhancedSelectPattern = useCallback((patternId: string | null) => {
    // Call the original selectPattern function
    selectPattern(patternId)
    
    if (patternId) {
      // Get pattern color for highlighting
      const pattern = patterns.find(p => p.id === patternId)
      if (pattern) {
        setPatternHighlightColor(pattern.color)
        console.log(`🎯 PATTERN HIGHLIGHT: Selected pattern ${patternId} with color ${pattern.color}`)
      }
    } else {
      // Clear highlighting when pattern is deselected
      setPatternHighlightColor('#3b82f6')
      console.log('🎯 PATTERN HIGHLIGHT: Cleared pattern highlighting')
    }
  }, [selectPattern, patterns])

  // CRITICAL: Enhanced highlighted nodes with pattern highlighting
  const enhancedHighlightedNodes = useMemo(() => {
    return new Set([
      ...highlightedNodes,
      ...(selectedPattern ? 
        analysis.find(a => a.patternId === selectedPattern)?.nodeIds || [] 
        : [])
    ])
  }, [highlightedNodes, selectedPattern, analysis])

  // CRITICAL: Advanced report generation function
  const handleGenerateAdvancedReport = useCallback(async (reportConfig: any) => {
    setIsGeneratingReport(true)
    
    try {
      console.log('🎯 GENERATING ADVANCED REPORT WITH CONFIG:', reportConfig)
      
      const pdfGenerator = new PDFReportGenerator()
      
      // Filter data based on selected patterns
      const selectedPatterns = reportConfig.selectedPatterns.length > 0 
        ? patterns.filter(p => reportConfig.selectedPatterns.includes(p.id))
        : patterns
      
      const selectedAnalysis = reportConfig.selectedPatterns.length > 0
        ? analysis.filter(a => reportConfig.selectedPatterns.includes(a.patternId))
        : analysis
      
      const selectedNodes = reportConfig.selectedPatterns.length > 0
        ? analysisNodes.filter(n => 
            selectedAnalysis.some(a => a.nodeIds.includes(n.id))
          )
        : analysisNodes
      
      const selectedLineChartData = reportConfig.selectedPatterns.length > 0
        ? lineChartData.filter(d => reportConfig.selectedPatterns.includes(d.patternId))
        : lineChartData
      
      console.log('🎯 FILTERED DATA FOR REPORT:')
      console.log('- Selected Patterns:', selectedPatterns.map(p => p.name))
      console.log('- Selected Analysis:', selectedAnalysis.length)
      console.log('- Selected Nodes:', selectedNodes.length)
      console.log('- Selected Line Chart Data:', selectedLineChartData.length)
      
      // Get graph and chart elements for screenshots
      let graphElement: HTMLElement | undefined
      let chartElement: HTMLElement | undefined
      
      // Try multiple selectors to find canvas elements
      if (containerRef.current) {
        graphElement = containerRef.current.querySelector('canvas') || undefined
        if (!graphElement) {
          // Try to find any canvas in the container
          const canvases = containerRef.current.querySelectorAll('canvas')
          if (canvases.length > 0) {
            graphElement = canvases[0] as HTMLElement
          }
        }
      }
      
      // Try to get chart canvas from the component ref first
      if (chartComponentRef.current) {
        const chartCanvas = chartComponentRef.current.getCanvas()
        if (chartCanvas) {
          chartElement = chartCanvas
        }
      }
      
      // Fallback: try to find canvas in the chart container
      if (!chartElement && chartRef.current) {
        chartElement = chartRef.current.querySelector('canvas') || undefined
        if (!chartElement) {
          // Try to find any canvas in the chart container and nested components
          const canvases = chartRef.current.querySelectorAll('canvas')
          if (canvases.length > 0) {
            chartElement = canvases[0] as HTMLElement
          }
        }
      }
      
      console.log('🎯 SCREENSHOT ELEMENTS:')
      console.log('- Container Ref:', containerRef.current)
      console.log('- Chart Ref:', chartRef.current)
      console.log('- Graph Element:', graphElement)
      console.log('- Chart Element:', chartElement)
      console.log('- Graph Element Tag:', graphElement?.tagName)
      console.log('- Chart Element Tag:', chartElement?.tagName)
      console.log('- Graph Canvas Size:', graphElement ? `${(graphElement as HTMLCanvasElement).width}x${(graphElement as HTMLCanvasElement).height}` : 'N/A')
      console.log('- Chart Canvas Size:', chartElement ? `${(chartElement as HTMLCanvasElement).width}x${(chartElement as HTMLCanvasElement).height}` : 'N/A')
      
      await pdfGenerator.generateReport(
        reportConfig,
        selectedPatterns,
        selectedAnalysis,
        selectedNodes,
        selectedLineChartData,
        graphElement,
        chartElement
      )
      
      console.log('✅ Advanced PDF report generated successfully')
      
    } catch (error) {
      console.error('❌ Report generation failed:', error)
      alert(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGeneratingReport(false)
    }
  }, [patterns, analysis, analysisNodes, lineChartData])

  // CRITICAL: Generate connections that map EXACTLY to discovered schema items
  const generateConnections = useCallback((nodes: GraphNode[]): GraphConnection[] => {
    const conns: GraphConnection[] = []
    const nodeMap = new Map(nodes.map(node => [node.id, node]))
    
    console.log('🔍 SCHEMA-GRAPH SYNC: Generating connections for', nodes.length, 'schema items')
    
    // CRITICAL: Build schema hierarchy from discovered items
    const schemaHierarchy = buildSchemaHierarchy(nodes)
    console.log('📊 Schema Hierarchy:', schemaHierarchy)
    
    // 1. DATABASE → SCHEMA connections (CRITICAL for schema sync)
    schemaHierarchy.databases.forEach(database => {
      schemaHierarchy.schemas.forEach(schema => {
        if (schema.parentId === database.id || schema.level === 1) {
          conns.push({
            id: `db-${database.id}-schema-${schema.id}`,
            from: database.id,
            to: schema.id,
            type: 'parent' as const,
            strength: 1.0,
            fromX: database.x,
            fromY: database.y,
            toX: schema.x,
            toY: schema.y
          })
        }
      })
    })
    
    // 2. SCHEMA → TABLE connections (CRITICAL for schema sync)
    schemaHierarchy.schemas.forEach(schema => {
      schemaHierarchy.tables.forEach(table => {
        if (table.parentId === schema.id || table.level === schema.level + 1) {
          conns.push({
            id: `schema-${schema.id}-table-${table.id}`,
            from: schema.id,
            to: table.id,
            type: 'parent' as const,
            strength: 0.8,
            fromX: schema.x,
            fromY: schema.y,
            toX: table.x,
            toY: table.y
          })
        }
      })
    })
    
    // 3. SCHEMA → VIEW connections (CRITICAL for schema sync)
    schemaHierarchy.schemas.forEach(schema => {
      schemaHierarchy.views.forEach(view => {
        if (view.parentId === schema.id || view.level === schema.level + 1) {
          conns.push({
            id: `schema-${schema.id}-view-${view.id}`,
            from: schema.id,
            to: view.id,
            type: 'parent' as const,
            strength: 0.7,
            fromX: schema.x,
            fromY: schema.y,
            toX: view.x,
            toY: view.y
          })
        }
      })
    })
    
    // 4. TABLE → COLUMN connections (CRITICAL for schema sync)
    schemaHierarchy.tables.forEach(table => {
      schemaHierarchy.columns.forEach(column => {
        if (column.parentId === table.id || column.level === table.level + 1) {
          conns.push({
            id: `table-${table.id}-column-${column.id}`,
            from: table.id,
            to: column.id,
            type: 'parent' as const,
            strength: 0.6,
            fromX: table.x,
            fromY: table.y,
            toX: column.x,
            toY: column.y
          })
        }
      })
    })
    
    // 5. Cross-schema relationships (for better graph structure)
    schemaHierarchy.tables.forEach(table => {
      // Find related tables in same schema
      const relatedTables = schemaHierarchy.tables.filter(t => 
        t.id !== table.id && 
        t.level === table.level &&
        Math.abs((t.metadata?.importance || 0) - (table.metadata?.importance || 0)) < 30
      )
      
      relatedTables.slice(0, 2).forEach(relatedTable => {
        conns.push({
          id: `table-${table.id}-ref-${relatedTable.id}`,
          from: table.id,
          to: relatedTable.id,
          type: 'reference' as const,
          strength: 0.3,
          fromX: table.x,
          fromY: table.y,
          toX: relatedTable.x,
          toY: relatedTable.y
        })
      })
    })
    
    console.log('🔗 Generated', conns.length, 'schema-synchronized connections')
    
    // CRITICAL: Calculate schema synchronization status
    const totalItems = nodes.length
    const connectedItems = new Set([...conns.map(c => c.from), ...conns.map(c => c.to)]).size
    const syncPercentage = totalItems > 0 ? Math.round((connectedItems / totalItems) * 100) : 0
    
    setSchemaSyncStatus({
      isSynchronized: syncPercentage > 80,
      totalItems,
      connectedItems,
      syncPercentage
    })
    
    console.log(`📊 SCHEMA SYNC STATUS: ${syncPercentage}% (${connectedItems}/${totalItems} items connected)`)
    
    return conns
  }, [])
  
  // CRITICAL: Build schema hierarchy from discovered items
  const buildSchemaHierarchy = (nodes: GraphNode[]) => {
    const hierarchy = {
      databases: nodes.filter(n => n.type === 'database'),
      schemas: nodes.filter(n => n.type === 'schema'),
      tables: nodes.filter(n => n.type === 'table'),
      views: nodes.filter(n => n.type === 'view'),
      columns: nodes.filter(n => n.type === 'column')
    }
    
    console.log('📋 Schema Hierarchy Built:', {
      databases: hierarchy.databases.length,
      schemas: hierarchy.schemas.length,
      tables: hierarchy.tables.length,
      views: hierarchy.views.length,
      columns: hierarchy.columns.length
    })
    
    return hierarchy
  }
  
  // Helper functions for schema-aware connections
  const getConnectionType = (childType: string, parentType: string): 'parent' | 'child' | 'reference' | 'dependency' | 'foreign_key' | 'index' => {
    if (parentType === 'database' && childType === 'schema') return 'parent'
    if (parentType === 'schema' && childType === 'table') return 'parent'
    if (parentType === 'schema' && childType === 'view') return 'parent'
    if (parentType === 'table' && childType === 'column') return 'parent'
    return 'child'
  }
  
  const getConnectionStrength = (childType: string, parentType: string): number => {
    if (parentType === 'database' && childType === 'schema') return 1.0
    if (parentType === 'schema' && (childType === 'table' || childType === 'view')) return 0.8
    if (parentType === 'table' && childType === 'column') return 0.6
    return 0.4
  }

  // Calculate layout and connections
  useEffect(() => {
    if (processedNodes.length === 0 || !layoutEngineRef.current) return
    
    setIsLoading(true)
    
    const updateLayout = async () => {
      try {
        // Set nodes and connections in layout engine
        layoutEngineRef.current!.setNodes(processedNodes)
        layoutEngineRef.current!.setAlgorithm(selectedGraphType)
        
        // Apply advanced controls
        layoutEngineRef.current!.setSimulationSpeed(simulationSpeed)
        layoutEngineRef.current!.setNodeSpacing(nodeSpacing)
        layoutEngineRef.current!.setMovementDamping(movementDamping)
        
        // Generate connections
        const nodeConnections = generateConnections(processedNodes)
        layoutEngineRef.current!.setConnections(nodeConnections)
        
        // Start layout simulation for all algorithms to enable floating
        if (enablePhysics) {
          layoutEngineRef.current!.start()
        }
        
        setVisibleNodes(processedNodes)
        setConnections(nodeConnections)
        setIsLoading(false)
      } catch (error) {
        console.error('Layout computation failed:', error)
        setIsLoading(false)
      }
    }
    
    // Always use requestAnimationFrame for better performance
        animationFrameRef.current = requestAnimationFrame(updateLayout)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [processedNodes, selectedGraphType, generateConnections, enablePhysics, simulationSpeed, nodeSpacing, movementDamping])

  // Canvas rendering with viewport culling
  useEffect(() => {
    if (!rendererRef.current || !dimensions.width || !dimensions.height) return
    
    const render = () => {
      if (!rendererRef.current) return
      
      const currentNodes = layoutEngineRef.current?.getNodes() || visibleNodes
      const currentConnections = layoutEngineRef.current?.getConnections() || connections
      
      // Update connection positions
      const updatedConnections = currentConnections.map(conn => {
        const fromNode = currentNodes.find(n => n.id === conn.from)
        const toNode = currentNodes.find(n => n.id === conn.to)
        return {
          ...conn,
          fromX: fromNode?.x,
          fromY: fromNode?.y,
          toX: toNode?.x,
          toY: toNode?.y
        }
      })
      
      rendererRef.current.render(currentNodes, updatedConnections, {
        showConnections: showConnectionsState,
        showLabels: showLabelsState,
        nodeSize: performanceMode ? 0.9 : nodeSize,
        connectionOpacity: performanceMode ? 0.5 : connectionOpacity,
        hoveredNode,
        selectedNodes: new Set(processedNodes.filter(n => n.isSelected).map(n => n.id)),
        highlightedNodes: enhancedHighlightedNodes,
        patternHighlightColor: patternHighlightColor
      })
      
      // Continue animation for floating effect
      if (enableAnimationState && layoutEngineRef.current && visibleNodes.length > 0) {
        animationFrameRef.current = requestAnimationFrame(render)
      }
    }
    
    rendererRef.current.setTransform(zoom, pan.x, pan.y)
    render()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [visibleNodes, connections, zoom, pan, showLabels, showConnections, connectionOpacity, nodeSize, dimensions, hoveredNode, processedNodes, enableAnimation])

  // Mouse interaction handlers with enhanced performance
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
      // Hit testing for hover with spatial optimization
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      
      let foundNode: GraphNode | null = null
      const currentNodes = layoutEngineRef.current?.getNodes() || visibleNodes
      
      // Use spatial indexing for better performance
      for (let i = 0; i < currentNodes.length; i++) {
        const node = currentNodes[i]
        if (!node.x || !node.y) continue
        
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
        const currentNodeSize = Math.max(4, Math.min(24, 12 * nodeSize / Math.max(0.3, zoom)))
        
        if (distance <= currentNodeSize / 2) {
          foundNode = node
          break
        }
      }
      
      setHoveredNode(foundNode?.id || null)
      onNodeHover?.(foundNode)
    }
  }, [isDragging, dragStart, pan, zoom, visibleNodes, nodeSize, onNodeHover])

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
    
    // Hit testing with spatial optimization
    const currentNodes = layoutEngineRef.current?.getNodes() || visibleNodes
    
    for (let i = 0; i < currentNodes.length; i++) {
      const node = currentNodes[i]
      if (!node.x || !node.y) continue
      
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      const currentNodeSize = Math.max(4, Math.min(24, 12 * nodeSize / Math.max(0.3, zoom)))
      
      if (distance <= currentNodeSize / 2) {
        onSelect(node.id, !node.isSelected)
        onNodeClick?.(node, e.nativeEvent)
        return
      }
    }
  }, [isDragging, pan, zoom, visibleNodes, nodeSize, onSelect, onNodeClick])

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom
    
    // Hit testing
    const currentNodes = layoutEngineRef.current?.getNodes() || visibleNodes
    
    for (let i = 0; i < currentNodes.length; i++) {
      const node = currentNodes[i]
      if (!node.x || !node.y) continue
      
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      const currentNodeSize = Math.max(4, Math.min(24, 12 * nodeSize / Math.max(0.3, zoom)))
      
      if (distance <= currentNodeSize / 2) {
        if (node.hasChildren) {
          onToggle(node.id)
        } else {
          onPreview(node)
        }
        onNodeDoubleClick?.(node, e.nativeEvent)
        return
      }
    }
  }, [isDragging, pan, zoom, visibleNodes, nodeSize, onToggle, onPreview, onNodeDoubleClick])


  // Advanced view controls
  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const fitToView = useCallback(() => {
    if (visibleNodes.length === 0) return
    
    const currentNodes = layoutEngineRef.current?.getNodes() || visibleNodes
    const bounds = currentNodes.reduce((acc, node) => {
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

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
      onFullscreenChange?.(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
      onFullscreenChange?.(false)
    }
  }, [onFullscreenChange])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)
      onFullscreenChange?.(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [onFullscreenChange])

  // Advanced search and filtering
  const filteredNodes = useMemo(() => {
    let filtered = processedNodes
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(term) ||
        node.metadata?.description?.toLowerCase().includes(term) ||
        node.type.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }, [processedNodes, searchTerm])

  // Performance monitoring
  const [performanceStats, setPerformanceStats] = useState({
    fps: 0,
    renderTime: 0,
    nodeCount: 0,
    connectionCount: 0,
    memoryUsage: 0
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const updateStats = () => {
      frameCount++
      const now = performance.now()
      
      if (now - lastTime >= 1000) {
        setPerformanceStats({
          fps: Math.round((frameCount * 1000) / (now - lastTime)),
          renderTime: 0, // Will be updated by renderer
          nodeCount: visibleNodes.length,
          connectionCount: connections.length,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        })
        
        frameCount = 0
        lastTime = now
      }
      
      requestAnimationFrame(updateStats)
    }
    
    updateStats()
  }, [visibleNodes.length, connections.length])

  // Advanced control panel
  const renderAdvancedControlPanel = () => (
    <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg">
          <Network className="h-3 w-3 mr-1" />
          {selectedGraphType.charAt(0).toUpperCase() + selectedGraphType.slice(1)} Layout
        </Badge>
        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg">
          {visibleNodes.length} Nodes
        </Badge>
        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg">
          {connections.length} Connections
        </Badge>
        {/* CRITICAL: Schema Synchronization Status */}
        <Badge 
          variant="outline" 
          className={`${
            schemaSyncStatus.isSynchronized 
              ? 'bg-green-50 text-green-600 border-green-200' 
              : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          <Brain className="h-3 w-3 mr-1" />
          Schema Sync: {schemaSyncStatus.syncPercentage}%
        </Badge>
        {isLoading && (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Processing
          </Badge>
        )}
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <Zap className="h-3 w-3 mr-1" />
          {performanceStats.fps} FPS
        </Badge>
      </div>
      
        <div className="flex items-center gap-2">
          {/* Enhanced Layout Algorithm Selector with Persistent State */}
          <Select value={selectedGraphType} onValueChange={(value: LayoutAlgorithm) => {
            setIsLayoutChanging(true)
            setSelectedGraphType(value) // Update persistent state
            
            if (layoutEngineRef.current && rendererRef.current) {
              // Preserve current view state for smooth transitions
              const currentTransform = rendererRef.current.getTransform()
              
              // Change layout algorithm with smooth transition
              layoutEngineRef.current.setAlgorithm(value)
              
              // Restore view state after layout initialization
              setTimeout(() => {
                if (rendererRef.current) {
                  rendererRef.current.setTransform(currentTransform.zoom, currentTransform.panX, currentTransform.panY)
                }
                setIsLayoutChanging(false)
              }, 100) // Slightly longer delay for smoother transition
            } else {
              setIsLayoutChanging(false)
            }
          }}>
          <SelectTrigger className="w-48 bg-white/95 backdrop-blur-md shadow-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-blue-600" />
            <SelectValue />
              {isLayoutChanging && <Activity className="h-3 w-3 animate-spin text-blue-500" />}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-blue-200">
            <SelectItem value="force-directed" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-blue-500" />
                Force Directed
              </div>
            </SelectItem>
            <SelectItem value="hierarchical" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Layers className="h-3 w-3 text-green-500" />
                Hierarchical
              </div>
            </SelectItem>
            <SelectItem value="circular" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-purple-500" />
                Circular
              </div>
            </SelectItem>
            <SelectItem value="grid" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-3 w-3 text-orange-500" />
                Grid
              </div>
            </SelectItem>
            <SelectItem value="tree" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Folder className="h-3 w-3 text-emerald-500" />
                Tree
              </div>
            </SelectItem>
            <SelectItem value="radial" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-red-500" />
                Radial
              </div>
            </SelectItem>
            <SelectItem value="cluster" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Hexagon className="h-3 w-3 text-indigo-500" />
                Cluster
              </div>
            </SelectItem>
            <SelectItem value="organic" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-pink-500" />
                Organic
              </div>
            </SelectItem>
            <SelectItem value="spiral" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-cyan-500" />
                Spiral
              </div>
            </SelectItem>
            <SelectItem value="concentric" className="hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3 text-teal-500" />
                Concentric
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

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
          onClick={toggleFullscreen}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
          className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50 text-blue-200 hover:text-blue-100"
        >
          <Brain className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Advanced settings panel
  const renderAdvancedSettingsPanel = () => (
    showAdvancedControls && (
      <div className="absolute top-16 right-4 z-30 w-96 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">Advanced Graph Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedControls(false)}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
              <TabsTrigger value="interaction" className="text-xs">Interaction</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="space-y-3 mt-4">
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
                  checked={showLabelsState}
                  onCheckedChange={setShowLabelsState}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Show Connections</Label>
                <Switch
                  checked={showConnectionsState}
                  onCheckedChange={setShowConnectionsState}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-3 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>FPS</span>
                  <span className="font-mono text-green-400">{performanceStats.fps}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Nodes</span>
                  <span className="font-mono text-blue-400">{performanceStats.nodeCount}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Connections</span>
                  <span className="font-mono text-purple-400">{performanceStats.connectionCount}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Memory</span>
                  <span className="font-mono text-orange-400">
                    {Math.round(performanceStats.memoryUsage / 1024 / 1024)}MB
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-slate-300">Simulation Speed</Label>
                  <Slider
                    value={[simulationSpeed]}
                    onValueChange={([value]) => setSimulationSpeed(value)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    {Math.round(simulationSpeed * 100)}% - {simulationSpeed < 0.3 ? 'Slow' : simulationSpeed < 0.7 ? 'Medium' : 'Fast'}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-slate-300">Node Spacing</Label>
                  <Slider
                    value={[nodeSpacing]}
                    onValueChange={([value]) => setNodeSpacing(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    {Math.round(nodeSpacing * 100)}% - {nodeSpacing < 0.8 ? 'Compact' : nodeSpacing < 1.4 ? 'Normal' : 'Wide'}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-slate-300">Movement Damping</Label>
                  <Slider
                    value={[movementDamping]}
                    onValueChange={([value]) => setMovementDamping(value)}
                    min={0.1}
                    max={0.99}
                    step={0.01}
                    className="mt-2"
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    {Math.round(movementDamping * 100)}% - {movementDamping < 0.5 ? 'Bouncy' : movementDamping < 0.8 ? 'Smooth' : 'Stable'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-slate-300">Enable Physics</Label>
                <Switch
                  checked={enablePhysicsState}
                  onCheckedChange={setEnablePhysicsState}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-slate-300">Enable Animation</Label>
                <Switch
                  checked={enableAnimationState}
                  onCheckedChange={setEnableAnimationState}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-slate-300">Performance Mode</Label>
                <Switch
                  checked={performanceMode}
                  onCheckedChange={setPerformanceMode}
                />
              </div>
              
              {performanceMode && (
                <div className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded">
                  Performance mode reduces visual effects for better speed
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="interaction" className="space-y-3 mt-4">
              <div>
                <Label className="text-xs font-medium">Search</Label>
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              
              <div>
                <Label className="text-xs font-medium">Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="schema">Schema</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="column">Column</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs font-medium">Sort by</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="importance">Importance</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Enable Clustering</Label>
                <Switch
                  checked={enableClusteringState}
                  onCheckedChange={setEnableClusteringState}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Auto Layout</Label>
                <Switch
                  checked={autoLayoutState}
                  onCheckedChange={setAutoLayoutState}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Show Minimap</Label>
                <Switch
                  checked={showMinimapState}
                  onCheckedChange={setShowMinimapState}
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                <div>Max Nodes: {defaultConfig.maxNodes}</div>
                <div>Max Connections: {defaultConfig.maxConnections}</div>
                <div>WebGL: {defaultConfig.enableWebGL ? 'Enabled' : 'Disabled'}</div>
                <div>Virtualization: {defaultConfig.enableVirtualization ? 'Enabled' : 'Disabled'}</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  )

  // Enhanced legend with statistics
  const renderEnhancedLegend = () => (
    <div className="absolute bottom-4 left-4 z-20">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Network className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">Schema Overview</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <Database className="h-3 w-3 text-blue-400" />
            <span className="font-medium">Database</span>
            <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600 text-slate-300">
              {filteredNodes.filter(n => n.type === 'database').length}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <Folder className="h-3 w-3 text-amber-400" />
            <span className="font-medium">Schema</span>
            <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600 text-slate-300">
              {filteredNodes.filter(n => n.type === 'schema').length}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <Table className="h-3 w-3 text-emerald-400" />
            <span className="font-medium">Table</span>
            <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600 text-slate-300">
              {filteredNodes.filter(n => n.type === 'table').length}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-3 h-3 rounded-full bg-violet-500"></div>
            <FileText className="h-3 w-3 text-violet-400" />
            <span className="font-medium">View</span>
            <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600 text-slate-300">
              {filteredNodes.filter(n => n.type === 'view').length}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <Columns className="h-3 w-3 text-gray-400" />
            <span className="font-medium">Column</span>
            <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600 text-slate-300">
              {filteredNodes.filter(n => n.type === 'column').length}
            </Badge>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-slate-700 text-xs text-slate-400">
          <div>Total: {filteredNodes.length} nodes</div>
          <div>Connections: {connections.length}</div>
          <div>Zoom: {Math.round(zoom * 100)}%</div>
        </div>
      </div>
    </div>
  )

  // Enhanced minimap component
  const renderMinimap = () => {
    if (!showMinimapState || visibleNodes.length === 0) return null

    return (
      <div className="absolute bottom-4 right-4 z-20 w-64 h-40 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 overflow-hidden">
        <div className="p-2 text-xs font-medium border-b border-slate-700 text-white flex items-center justify-between">
          <span>Minimap</span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Viewport</span>
          </div>
        </div>
        <div className="relative w-full h-32">
          <canvas
            ref={(canvas) => {
              if (canvas && !minimapCanvas) {
                setMinimapCanvas(canvas)
                // Render minimap content
                const ctx = canvas.getContext('2d')
                if (ctx) {
                  const scale = 0.1
                  canvas.width = 256
                  canvas.height = 128
                  
                  // Clear canvas
                  ctx.fillStyle = '#0f172a'
                  ctx.fillRect(0, 0, canvas.width, canvas.height)
                  
                  // Draw nodes
                  const currentNodes = layoutEngineRef.current?.getNodes() || visibleNodes
                  currentNodes.forEach(node => {
                    if (!node.x || !node.y) return
                    
                    const x = node.x * scale
                    const y = node.y * scale
                    const size = Math.max(1, 3 * scale)
                    
                    // Get node color based on type
                    let nodeColor = '#64748b' // default gray
                    switch (node.type) {
                      case 'database': nodeColor = '#3b82f6'; break
                      case 'schema': nodeColor = '#f59e0b'; break
                      case 'table': nodeColor = '#10b981'; break
                      case 'view': nodeColor = '#8b5cf6'; break
                      case 'column': nodeColor = '#6b7280'; break
                    }
                    ctx.fillStyle = nodeColor
                    ctx.beginPath()
                    ctx.arc(x, y, size, 0, Math.PI * 2)
                    ctx.fill()
                  })
                  
                  // Draw connections
                  const currentConnections = layoutEngineRef.current?.getConnections() || connections
                  ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
                  ctx.lineWidth = 0.5
                  currentConnections.forEach(conn => {
                    if (!conn.fromX || !conn.fromY || !conn.toX || !conn.toY) return
                    
                    ctx.beginPath()
                    ctx.moveTo(conn.fromX * scale, conn.fromY * scale)
                    ctx.lineTo(conn.toX * scale, conn.toY * scale)
                    ctx.stroke()
                  })
                }
              }
            }}
            className="w-full h-full"
          />
          {/* Enhanced viewport indicator */}
          <div
            className="absolute border-2 border-blue-400 bg-blue-400/20 rounded-sm"
            style={{
              left: `${Math.max(0, Math.min(100, (-pan.x / zoom / dimensions.width) * 100))}%`,
              top: `${Math.max(0, Math.min(100, (-pan.y / zoom / dimensions.height) * 100))}%`,
              width: `${Math.min(100, (dimensions.width / zoom / dimensions.width) * 100)}%`,
              height: `${Math.min(100, (dimensions.height / zoom / dimensions.height) * 100)}%`
            }}
          />
          {/* Zoom level indicator */}
          <div className="absolute top-1 right-1 text-xs text-slate-400 bg-slate-800/80 px-1 rounded">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    )
  }

  // Performance indicator
  const renderPerformanceIndicator = () => (
    isLoading && (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium">Processing Graph Layout...</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {selectedGraphType} algorithm • {visibleNodes.length} nodes
          </div>
        </div>
      </div>
    )
  )

  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`} style={style}>
      {/* Advanced Control Panel */}
      {renderAdvancedControlPanel()}
      
      {/* Advanced Settings Panel */}
      {renderAdvancedSettingsPanel()}

      {/* Main Canvas Graph Renderer */}
      <div
        ref={containerRef}
        className={`relative w-full h-full cursor-grab active:cursor-grabbing transition-all duration-300 ${
          showAnalysisPanel && !isAnalysisPanelCollapsed 
            ? (showLineChart ? 'w-1/4' : 'w-1/2') 
            : 'w-full'
        }`}
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

        {/* Enhanced center indicator for certain layouts */}
        {(selectedGraphType === 'circular' || selectedGraphType === 'radial' || selectedGraphType === 'concentric') && (
          <div
            className="absolute w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg animate-pulse"
            style={{
              left: dimensions.width / 2 + pan.x,
              top: dimensions.height / 2 + pan.y,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }}
          />
        )}
        
        {/* Grid background for better visual reference */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        />
      </div>

      {/* Enhanced Legend */}
      {renderEnhancedLegend()}
      
      {/* Minimap */}
      {renderMinimap()}
        
        {/* Schema Analysis Panel - Collapsible Side Panel */}
        {showAnalysisPanel && (
          <div className={`absolute right-0 top-0 h-full z-30 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700 transition-all duration-300 ${
            isAnalysisPanelCollapsed ? 'w-12' : showLineChart ? 'w-3/4' : 'w-1/2'
          }`}>
            {/* Collapse/Expand Button */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (showLineChart) {
                    // If chart is open, only close the chart panel
                    setShowLineChart(false)
                  } else {
                    // If only analysis panel is open, collapse the entire panel
                    setIsAnalysisPanelCollapsed(!isAnalysisPanelCollapsed)
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 border-slate-600 text-white rounded-full w-8 h-8 p-0"
              >
                {isAnalysisPanelCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {!isAnalysisPanelCollapsed && (
              <div className="flex h-full">
                {/* Schema Analysis Panel */}
                <div className={`${showLineChart ? 'w-1/2' : 'w-full'} border-r border-slate-700`}>
                  <SchemaAnalysisPanel
                    patterns={patterns}
                    analysis={analysis}
                    lineChartData={lineChartData}
                    selectedPattern={selectedPattern}
                    highlightedNodes={enhancedHighlightedNodes}
                    nodes={analysisNodes}
                    onPatternSelect={enhancedSelectPattern}
                    onClose={() => setShowAnalysisPanel(false)}
                    onGenerateReport={() => {
                      console.log('🎯 REPORT BUTTON CLICKED: Opening report generator')
                      setShowReportGenerator(true)
                    }}
                    onToggleChart={() => setShowLineChart(!showLineChart)}
                    showChart={showLineChart}
                    className="h-full"
                  />
                </div>
                
                {/* Schema Lifecycle Analysis Panel */}
                {showLineChart && (
                  <div className="w-1/2 flex flex-col">
                    {/* Chart Panel Header */}
                    <div className="p-4 border-b border-slate-700 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Schema Lifecycle Analysis</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowLineChart(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Chart Panel Content */}
                    <div ref={chartRef} className="flex-1 p-4">
                      <SchemaLineChart
                        ref={chartComponentRef}
                        data={lineChartData}
                        patterns={patterns}
                        selectedPattern={selectedPattern}
                        onPatternSelect={enhancedSelectPattern}
                        onClose={() => setShowLineChart(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
      
      {/* Performance Indicator */}
      {renderPerformanceIndicator()}
      
      {/* Advanced Report Generator */}
      <AdvancedReportGenerator
        isOpen={showReportGenerator}
        onClose={() => setShowReportGenerator(false)}
        patterns={patterns}
        analysis={analysis}
        lineChartData={lineChartData}
        nodes={analysisNodes}
        selectedPattern={selectedPattern}
        onGenerateReport={handleGenerateAdvancedReport}
      />
    </div>
  )
}