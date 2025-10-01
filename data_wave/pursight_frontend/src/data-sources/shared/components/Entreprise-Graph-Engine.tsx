/**
 * Enterprise-Grade Graph Visualization Engine
 * Advanced 3D rendering with WebGL, physics simulation, and enterprise features
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, Table, Columns, FileText, Folder, FolderOpen, 
  ChevronRight, ChevronDown, Eye, Network, Activity, Brain, 
  Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Settings, 
  X, Search, Filter, Layers, Grid3X3, Circle, Square, Triangle, 
  Hexagon, Star, Zap, Target, TrendingUp, Shield, Sparkles, 
  Gauge, BarChart3, Globe, Play, Pause, Square as Stop,
  Cpu, MemoryStick, HardDrive, Wifi, WifiOff, Lock, Unlock,
  Users, UserCheck, AlertTriangle, CheckCircle, XCircle,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw,
  MousePointer, Hand, Move, Focus, Camera, Download, Upload,
  Palette, Sliders, ToggleLeft, ToggleRight, EyeOff,
  BarChart, PieChart, LineChart, Scatter, Map, Globe2,
  Layers3, Box, Cylinder, Sphere, Cone, Pyramid, Torus,
  Lightbulb, Moon, Sun, Monitor, Smartphone, Tablet,
  Wrench, Hammer, Cog, SlidersHorizontal, Tune,
  Zap as Lightning, Flame, Snowflake, Droplets, Wind
} from 'lucide-react'

// Enterprise Graph Node Interface
interface EnterpriseGraphNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column' | 'index' | 'constraint' | 'trigger' | 'function' | 'procedure'
  level: number
  hasChildren: boolean
  isExpanded: boolean
  isSelected: boolean
  isVisible: boolean
  isHighlighted?: boolean
  isFiltered?: boolean
  isLocked?: boolean
  isAnimated?: boolean
  
  // Advanced metadata
  metadata?: {
    description?: string
    rowCount?: number
    columnCount?: number
    size?: number
    lastModified?: string
    importance?: number
    quality?: number
    performance?: number
    security?: number
    compliance?: number
    dependencies?: string[]
    relationships?: string[]
    tags?: string[]
    owner?: string
    team?: string
    project?: string
    environment?: 'dev' | 'staging' | 'prod'
    status?: 'active' | 'inactive' | 'deprecated' | 'archived'
    [key: string]: any
  }
  
  children?: EnterpriseGraphNode[]
  parentId?: string
  childIds?: string[]
  
  // Advanced 3D Position and Physics
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  fx?: number
  fy?: number
  fz?: number
  
  // Advanced visual properties
  color?: string
  size?: number
  opacity?: number
  shape?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'cylinder' | 'sphere' | 'cube' | 'pyramid'
  texture?: string
  glow?: boolean
  shadow?: boolean
  border?: boolean
  gradient?: boolean
  
  // 3D rendering properties
  screenX?: number
  screenY?: number
  screenScale?: number
  depth?: number
  rotationX?: number
  rotationY?: number
  rotationZ?: number
  
  // Animation properties
  animationType?: 'pulse' | 'rotate' | 'float' | 'glow' | 'bounce' | 'shake' | 'fade' | 'scale'
  animationSpeed?: number
  animationDelay?: number
  
  // Enterprise features
  alerts?: number
  warnings?: number
  errors?: number
  health?: 'excellent' | 'good' | 'warning' | 'critical'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  subcategory?: string
}

// Enterprise Graph Connection Interface
interface EnterpriseGraphConnection {
  id: string
  from: string
  to: string
  type: 'parent' | 'child' | 'reference' | 'dependency' | 'foreign_key' | 'index' | 'constraint' | 'trigger' | 'function' | 'procedure'
  strength: number
  weight?: number
  color?: string
  opacity?: number
  animated?: boolean
  label?: string
  metadata?: any
  
  // Advanced connection properties
  direction?: 'unidirectional' | 'bidirectional'
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'thick' | 'thin'
  curve?: 'straight' | 'curved' | 'bezier' | 'arc' | 'spiral'
  thickness?: number
  glow?: boolean
  pulse?: boolean
  
  // Enterprise features
  dataFlow?: 'read' | 'write' | 'readwrite' | 'none'
  frequency?: 'high' | 'medium' | 'low'
  latency?: number
  throughput?: number
  reliability?: number
}

// Advanced Layout Algorithm Types
type EnterpriseLayoutAlgorithm = 
  | 'force-directed-3d'
  | 'hierarchical-3d'
  | 'circular-3d'
  | 'grid-3d'
  | 'tree-3d'
  | 'radial-3d'
  | 'cluster-3d'
  | 'organic-3d'
  | 'spiral-3d'
  | 'concentric-3d'
  | 'centralized-3d'
  | 'network-3d'
  | 'galaxy-3d'
  | 'molecule-3d'
  | 'crystal-3d'
  | 'fractal-3d'
  | 'neural-3d'
  | 'quantum-3d'

// Enterprise Graph Engine
class EnterpriseGraphEngine {
  private nodes: EnterpriseGraphNode[] = []
  private connections: EnterpriseGraphConnection[] = []
  private width: number = 0
  private height: number = 0
  private algorithm: EnterpriseLayoutAlgorithm = 'force-directed-3d'
  private isRunning: boolean = false
  private animationId: number | null = null
  
  // Advanced 3D Camera system
  private camera = {
    x: 0, y: 0, z: 2000,
    targetX: 0, targetY: 0, targetZ: 0,
    rotationX: 0, rotationY: 0, rotationZ: 0,
    fov: 75, near: 0.1, far: 10000,
    autoRotate: true,
    autoRotateSpeed: 0.002,
    enableDamping: true,
    dampingFactor: 0.05
  }
  
  // Advanced 3D space configuration
  private space3D = {
    width: 3000, height: 3000, depth: 3000,
    centerX: 0, centerY: 0, centerZ: 0,
    bounds: {
      minX: -1500, maxX: 1500,
      minY: -1500, maxY: 1500,
      minZ: -1500, maxZ: 1500
    }
  }
  
  // Advanced force configuration
  private forceConfig = {
    // Core forces
    centerForce: 0.15,
    chargeForce: -500,
    linkForce: 0.2,
    collisionForce: 0.8,
    
    // 3D specific forces
    zAxisForce: 0.1,
    depthForce: 0.05,
    rotationForce: 0.02,
    gravityForce: 0.002,
    
    // Advanced forces
    turbulenceForce: 0.03,
    flowForce: 0.015,
    magneticForce: 0.05,
    repulsionForce: 0.15,
    attractionForce: 0.08,
    cohesionForce: 0.03,
    separationForce: 0.1,
    alignmentForce: 0.02,
    
    // Damping and stability
    velocityDamping: 0.88,
    angularDamping: 0.92,
    friction: 0.96,
    airResistance: 0.99,
    
    // 3D movement parameters
    rotationSpeed: 0.002,
    orbitSpeed: 0.001,
    floatSpeed: 0.003,
    waveSpeed: 0.004,
    spiralSpeed: 0.0015,
    
    // Performance tuning
    maxVelocity: 80,
    minVelocity: 0.2,
    maxAngularVelocity: 0.15,
    minAngularVelocity: 0.002,
    
    // Advanced parameters
    enable3D: true,
    enablePhysics: true,
    enableTurbulence: true,
    enableFlow: true,
    enableMagnetic: true,
    enableQuantum: false,
    enableNeural: false
  }
  
  // Performance monitoring
  private performance = {
    fps: 60,
    frameTime: 16.67,
    nodeCount: 0,
    connectionCount: 0,
    renderTime: 0,
    physicsTime: 0,
    lastUpdate: 0
  }
  
  constructor() {
    this.tick = this.tick.bind(this)
  }
  
  setNodes(nodes: EnterpriseGraphNode[]) {
    this.nodes = nodes.map(node => ({
      ...node,
      x: node.x || (Math.random() - 0.5) * this.width,
      y: node.y || (Math.random() - 0.5) * this.height,
      z: node.z || (Math.random() - 0.5) * 1000,
      vx: node.vx || 0,
      vy: node.vy || 0,
      vz: node.vz || 0,
      rotationX: node.rotationX || 0,
      rotationY: node.rotationY || 0,
      rotationZ: node.rotationZ || 0
    }))
    this.performance.nodeCount = this.nodes.length
  }
  
  setConnections(connections: EnterpriseGraphConnection[]) {
    this.connections = connections
    this.performance.connectionCount = this.connections.length
  }
  
  setDimensions(width: number, height: number) {
    this.width = width
    this.height = height
    this.space3D.width = width * 2
    this.space3D.height = height * 2
  }
  
  setAlgorithm(algorithm: EnterpriseLayoutAlgorithm) {
    this.algorithm = algorithm
    this.initializeLayout()
  }
  
  private initializeLayout() {
    switch (this.algorithm) {
      case 'force-directed-3d':
        this.initializeForceDirected3D()
        break
      case 'hierarchical-3d':
        this.initializeHierarchical3D()
        break
      case 'circular-3d':
        this.initializeCircular3D()
        break
      case 'grid-3d':
        this.initializeGrid3D()
        break
      case 'tree-3d':
        this.initializeTree3D()
        break
      case 'radial-3d':
        this.initializeRadial3D()
        break
      case 'cluster-3d':
        this.initializeCluster3D()
        break
      case 'organic-3d':
        this.initializeOrganic3D()
        break
      case 'spiral-3d':
        this.initializeSpiral3D()
        break
      case 'concentric-3d':
        this.initializeConcentric3D()
        break
      case 'centralized-3d':
        this.initializeCentralized3D()
        break
      case 'network-3d':
        this.initializeNetwork3D()
        break
      case 'galaxy-3d':
        this.initializeGalaxy3D()
        break
      case 'molecule-3d':
        this.initializeMolecule3D()
        break
      case 'crystal-3d':
        this.initializeCrystal3D()
        break
      case 'fractal-3d':
        this.initializeFractal3D()
        break
      case 'neural-3d':
        this.initializeNeural3D()
        break
      case 'quantum-3d':
        this.initializeQuantum3D()
        break
      default:
        this.initializeForceDirected3D()
    }
  }
  
  private initializeForceDirected3D() {
    // Advanced force-directed with schema hierarchy
    const rootNodes = this.nodes.filter(n => !n.parentId)
    const childNodes = this.nodes.filter(n => n.parentId)
    
    // Position root nodes in 3D space
    rootNodes.forEach((node, i) => {
      const angle = (i / rootNodes.length) * Math.PI * 2
      const radius = 300
      const height = (Math.random() - 0.5) * 400
      node.x = Math.cos(angle) * radius
      node.y = height
      node.z = Math.sin(angle) * radius
    })
    
    // Position child nodes in 3D around parents
    childNodes.forEach(node => {
      const parent = this.nodes.find(n => n.id === node.parentId)
      if (parent) {
        const angle = Math.random() * Math.PI * 2
        const radius = 150 + Math.random() * 200
        const height = (Math.random() - 0.5) * 300
        node.x = parent.x + Math.cos(angle) * radius
        node.y = parent.y + height
        node.z = parent.z + Math.sin(angle) * radius
      }
    })
  }
  
  private initializeHierarchical3D() {
    // 3D hierarchical layout with depth
    const levels = new Map<number, EnterpriseGraphNode[]>()
    this.nodes.forEach(node => {
      if (!levels.has(node.level)) {
        levels.set(node.level, [])
      }
      levels.get(node.level)!.push(node)
    })
    
    const maxLevel = Math.max(...levels.keys())
    levels.forEach((levelNodes, level) => {
      levelNodes.forEach((node, i) => {
        const y = (level / maxLevel) * this.height - this.height / 2
        const x = (i / levelNodes.length) * this.width - this.width / 2
        const z = (level - maxLevel / 2) * 200
        node.x = x
        node.y = y
        node.z = z
      })
    })
  }
  
  private initializeCircular3D() {
    // 3D circular layout with multiple rings
    const centerX = 0
    const centerY = 0
    const centerZ = 0
    
    this.nodes.forEach((node, i) => {
      const angle = (i / this.nodes.length) * Math.PI * 2
      const radius = 200 + (node.level * 100)
      const height = Math.sin(angle * 3) * 100
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + height
      node.z = centerZ + Math.sin(angle) * radius
    })
  }
  
  private initializeGrid3D() {
    // 3D grid layout
    const cols = Math.ceil(Math.cbrt(this.nodes.length))
    const rows = Math.ceil(Math.sqrt(this.nodes.length / cols))
    const layers = Math.ceil(this.nodes.length / (cols * rows))
    
    this.nodes.forEach((node, i) => {
      const layer = Math.floor(i / (cols * rows))
      const row = Math.floor((i % (cols * rows)) / cols)
      const col = i % cols
      
      node.x = (col - cols / 2) * 150
      node.y = (row - rows / 2) * 150
      node.z = (layer - layers / 2) * 150
    })
  }
  
  private initializeTree3D() {
    // 3D tree layout with branches
    const rootNodes = this.nodes.filter(n => !n.parentId)
    if (rootNodes.length === 0) return
    
    const root = rootNodes[0]
    root.x = 0
    root.y = this.height / 2
    root.z = 0
    
    const layoutNode = (node: EnterpriseGraphNode, x: number, y: number, z: number, level: number = 0) => {
      const children = this.nodes.filter(n => n.parentId === node.id)
      if (children.length === 0) return
      
      const spacing = 200
      const angleStep = Math.PI * 2 / children.length
      
      children.forEach((child, i) => {
        const angle = i * angleStep
        const radius = spacing * (1 + level * 0.5)
        child.x = x + Math.cos(angle) * radius
        child.y = y - 150
        child.z = z + Math.sin(angle) * radius
        layoutNode(child, child.x, child.y, child.z, level + 1)
      })
    }
    
    layoutNode(root, root.x, root.y, root.z)
  }
  
  private initializeRadial3D() {
    // 3D radial layout with multiple levels
    const centerX = 0
    const centerY = 0
    const centerZ = 0
    
    this.nodes.forEach((node, i) => {
      const angle = (i / this.nodes.length) * Math.PI * 2
      const radius = 100 + (node.level * 150)
      const height = Math.sin(angle * 2) * 100
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + height
      node.z = centerZ + Math.sin(angle) * radius
    })
  }
  
  private initializeCluster3D() {
    // 3D cluster layout by type
    const clusters = new Map<string, EnterpriseGraphNode[]>()
    this.nodes.forEach(node => {
      if (!clusters.has(node.type)) {
        clusters.set(node.type, [])
      }
      clusters.get(node.type)!.push(node)
    })
    
    const clusterTypes = Array.from(clusters.keys())
    clusterTypes.forEach((type, clusterIndex) => {
      const clusterNodes = clusters.get(type)!
      const clusterX = (clusterIndex % 4) * 400 - 600
      const clusterY = Math.floor(clusterIndex / 4) * 400 - 200
      const clusterZ = Math.floor(clusterIndex / 8) * 400 - 200
      
      clusterNodes.forEach((node, i) => {
        const angle = (i / clusterNodes.length) * Math.PI * 2
        const radius = 80 + Math.random() * 120
        const height = (Math.random() - 0.5) * 200
        node.x = clusterX + Math.cos(angle) * radius
        node.y = clusterY + height
        node.z = clusterZ + Math.sin(angle) * radius
      })
    })
  }
  
  private initializeOrganic3D() {
    // Organic 3D layout with natural distribution
    this.nodes.forEach((node, i) => {
      const phi = Math.acos(1 - 2 * i / this.nodes.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const radius = 300 + Math.random() * 200
      
      node.x = radius * Math.cos(theta) * Math.sin(phi)
      node.y = radius * Math.sin(theta) * Math.sin(phi)
      node.z = radius * Math.cos(phi)
    })
  }
  
  private initializeSpiral3D() {
    // 3D spiral layout
    this.nodes.forEach((node, i) => {
      const t = i / this.nodes.length
      const angle = t * Math.PI * 8
      const radius = 200 + t * 300
      const height = t * 400 - 200
      
      node.x = Math.cos(angle) * radius
      node.y = height
      node.z = Math.sin(angle) * radius
    })
  }
  
  private initializeConcentric3D() {
    // 3D concentric circles
    const centerX = 0
    const centerY = 0
    const centerZ = 0
    
    this.nodes.forEach((node, i) => {
      const level = Math.floor(i / 8)
      const angle = (i % 8) * Math.PI / 4
      const radius = 150 + level * 200
      const height = (Math.random() - 0.5) * 300
      
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + height
      node.z = centerZ + Math.sin(angle) * radius
    })
  }
  
  private initializeCentralized3D() {
    // 3D centralized layout
    const centerX = 0
    const centerY = 0
    const centerZ = 0
    
    this.nodes.forEach((node, i) => {
      const angle = (i / this.nodes.length) * Math.PI * 2
      const radius = 100 + Math.random() * 400
      const height = (Math.random() - 0.5) * 500
      
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + height
      node.z = centerZ + Math.sin(angle) * radius
    })
  }
  
  private initializeNetwork3D() {
    // 3D network layout with multiple hubs
    const hubs = [
      { x: -400, y: 0, z: -400 },
      { x: 400, y: 0, z: -400 },
      { x: -400, y: 0, z: 400 },
      { x: 400, y: 0, z: 400 },
      { x: 0, y: 200, z: 0 }
    ]
    
    this.nodes.forEach((node, i) => {
      const hub = hubs[i % hubs.length]
      const angle = Math.random() * Math.PI * 2
      const radius = 100 + Math.random() * 200
      const height = (Math.random() - 0.5) * 300
      
      node.x = hub.x + Math.cos(angle) * radius
      node.y = hub.y + height
      node.z = hub.z + Math.sin(angle) * radius
    })
  }
  
  private initializeGalaxy3D() {
    // Galaxy-like 3D layout
    this.nodes.forEach((node, i) => {
      const t = i / this.nodes.length
      const angle = t * Math.PI * 4
      const radius = 200 + t * 500
      const height = Math.sin(angle * 2) * 200
      const spiral = t * 0.5
      
      node.x = Math.cos(angle + spiral) * radius
      node.y = height
      node.z = Math.sin(angle + spiral) * radius
    })
  }
  
  private initializeMolecule3D() {
    // Molecule-like 3D layout
    const centerX = 0
    const centerY = 0
    const centerZ = 0
    
    this.nodes.forEach((node, i) => {
      const phi = Math.acos(1 - 2 * i / this.nodes.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const radius = 200 + Math.sin(phi * 3) * 100
      
      node.x = centerX + radius * Math.cos(theta) * Math.sin(phi)
      node.y = centerY + radius * Math.sin(theta) * Math.sin(phi)
      node.z = centerZ + radius * Math.cos(phi)
    })
  }
  
  private initializeCrystal3D() {
    // Crystal-like 3D layout
    const layers = Math.ceil(Math.cbrt(this.nodes.length))
    const nodesPerLayer = Math.ceil(this.nodes.length / layers)
    
    this.nodes.forEach((node, i) => {
      const layer = Math.floor(i / nodesPerLayer)
      const nodeInLayer = i % nodesPerLayer
      const angle = (nodeInLayer / nodesPerLayer) * Math.PI * 2
      const radius = 150 + layer * 100
      const height = layer * 200 - (layers - 1) * 100
      
      node.x = Math.cos(angle) * radius
      node.y = height
      node.z = Math.sin(angle) * radius
    })
  }
  
  private initializeFractal3D() {
    // Fractal-like 3D layout
    const generateFractal = (nodes: EnterpriseGraphNode[], startIndex: number, endIndex: number, centerX: number, centerY: number, centerZ: number, radius: number, level: number) => {
      if (startIndex >= endIndex || level > 3) return
      
      const count = endIndex - startIndex
      const angleStep = Math.PI * 2 / count
      
      for (let i = 0; i < count; i++) {
        const nodeIndex = startIndex + i
        if (nodeIndex >= nodes.length) break
        
        const angle = i * angleStep
        const newRadius = radius * 0.6
        const height = (Math.random() - 0.5) * radius * 0.5
        
        nodes[nodeIndex].x = centerX + Math.cos(angle) * newRadius
        nodes[nodeIndex].y = centerY + height
        nodes[nodeIndex].z = centerZ + Math.sin(angle) * newRadius
        
        if (level < 2) {
          generateFractal(nodes, nodeIndex, Math.min(nodeIndex + 3, endIndex), nodes[nodeIndex].x, nodes[nodeIndex].y, nodes[nodeIndex].z, newRadius, level + 1)
        }
      }
    }
    
    generateFractal(this.nodes, 0, this.nodes.length, 0, 0, 0, 300, 0)
  }
  
  private initializeNeural3D() {
    // Neural network-like 3D layout
    const layers = Math.ceil(Math.sqrt(this.nodes.length))
    const nodesPerLayer = Math.ceil(this.nodes.length / layers)
    
    this.nodes.forEach((node, i) => {
      const layer = Math.floor(i / nodesPerLayer)
      const nodeInLayer = i % nodesPerLayer
      const x = (layer - layers / 2) * 300
      const y = (nodeInLayer - nodesPerLayer / 2) * 100
      const z = (Math.random() - 0.5) * 200
      
      node.x = x
      node.y = y
      node.z = z
    })
  }
  
  private initializeQuantum3D() {
    // Quantum-like 3D layout with probability clouds
    this.nodes.forEach((node, i) => {
      const t = i / this.nodes.length
      const angle1 = t * Math.PI * 6
      const angle2 = t * Math.PI * 4
      const radius = 200 + Math.sin(angle1) * 150
      const height = Math.sin(angle2) * 200
      const quantum = Math.sin(t * Math.PI * 8) * 100
      
      node.x = Math.cos(angle1) * radius + quantum
      node.y = height
      node.z = Math.sin(angle1) * radius + quantum
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
    
    const startTime = performance.now()
    
    this.simulateAdvancedForces()
    this.update3DPositions()
    this.updateCamera()
    
    const endTime = performance.now()
    this.performance.physicsTime = endTime - startTime
    this.performance.lastUpdate = endTime
    
    this.animationId = requestAnimationFrame(this.tick)
  }
  
  private simulateAdvancedForces() {
    if (!this.forceConfig.enablePhysics) return
    
    this.nodes.forEach(node => {
      if (node.fx !== undefined && node.fy !== undefined && node.fz !== undefined) return
      
      // Center force
      const centerX = 0
      const centerY = 0
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
        
        if (distance > 0 && distance < 300) {
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
              const force = this.forceConfig.linkForce * distance * conn.strength
              node.vx += (dx / distance) * force
              node.vy += (dy / distance) * force
              node.vz += (dz / distance) * force
            }
          }
        }
      })
      
      // Advanced forces
      if (this.forceConfig.enableTurbulence) {
        const turbulence = Math.sin(Date.now() * 0.001 + node.x * 0.01) * 0.5
        node.vx += turbulence
        node.vy += Math.cos(Date.now() * 0.001 + node.y * 0.01) * 0.5
        node.vz += Math.sin(Date.now() * 0.001 + node.z * 0.01) * 0.5
      }
      
      if (this.forceConfig.enableFlow) {
        const flowX = Math.sin(node.y * 0.01) * 0.3
        const flowY = Math.cos(node.z * 0.01) * 0.3
        const flowZ = Math.sin(node.x * 0.01) * 0.3
        node.vx += flowX
        node.vy += flowY
        node.vz += flowZ
      }
      
      if (this.forceConfig.enableMagnetic) {
        const magneticX = Math.sin(node.x * 0.005) * 0.2
        const magneticY = Math.cos(node.y * 0.005) * 0.2
        const magneticZ = Math.sin(node.z * 0.005) * 0.2
        node.vx += magneticX
        node.vy += magneticY
        node.vz += magneticZ
      }
      
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
      
      // Update rotation
      node.rotationX += node.vx * 0.01
      node.rotationY += node.vy * 0.01
      node.rotationZ += node.vz * 0.01
    })
  }
  
  private update3DPositions() {
    if (!this.forceConfig.enable3D) return
    
    // Project 3D positions to 2D screen coordinates
    this.nodes.forEach(node => {
      const projected = this.project3DTo2D(node.x, node.y, node.z)
      node.screenX = projected.x
      node.screenY = projected.y
      node.screenScale = projected.scale
      node.depth = projected.depth
    })
  }
  
  private updateCamera() {
    if (this.camera.autoRotate) {
      this.camera.rotationY += this.camera.autoRotateSpeed
      this.camera.rotationX += this.camera.autoRotateSpeed * 0.5
    }
  }
  
  private project3DTo2D(x: number, y: number, z: number): { x: number, y: number, scale: number, depth: number } {
    // Advanced perspective projection with camera
    const cosY = Math.cos(this.camera.rotationY)
    const sinY = Math.sin(this.camera.rotationY)
    const cosX = Math.cos(this.camera.rotationX)
    const sinX = Math.sin(this.camera.rotationX)
    
    // Rotate around Y axis
    const x1 = x * cosY - z * sinY
    const z1 = x * sinY + z * cosY
    
    // Rotate around X axis
    const y1 = y * cosX - z1 * sinX
    const z2 = y * sinX + z1 * cosX
    
    // Perspective projection
    const distance = Math.abs(z2 - this.camera.z)
    const scale = Math.max(0.1, 1 - distance / 3000)
    
    return {
      x: x1 * scale,
      y: y1 * scale,
      scale: scale,
      depth: distance
    }
  }
  
  getNodes(): EnterpriseGraphNode[] {
    return this.nodes
  }
  
  getConnections(): EnterpriseGraphConnection[] {
    return this.connections
  }
  
  getPerformance() {
    return this.performance
  }
  
  destroy() {
    this.stop()
    this.nodes = []
    this.connections = []
  }
}

// Enterprise Graph Renderer with WebGL
class EnterpriseGraphRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private gl: WebGLRenderingContext | null = null
  private useWebGL: boolean = false
  private width: number = 0
  private height: number = 0
  private zoom: number = 1
  private panX: number = 0
  private panY: number = 0
  
  // Advanced rendering properties
  private renderQuality: 'low' | 'medium' | 'high' | 'ultra' = 'high'
  private enableShadows: boolean = true
  private enableGlow: boolean = true
  private enableParticles: boolean = true
  private enableAnimations: boolean = true
  
  // Performance monitoring
  private frameCount: number = 0
  private lastFPSUpdate: number = 0
  private currentFPS: number = 60
  
  constructor(canvas: HTMLCanvasElement, useWebGL: boolean = false) {
    this.canvas = canvas
    this.useWebGL = useWebGL
    this.ctx = canvas.getContext('2d')!
    
    if (useWebGL) {
      this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (this.gl) {
        this.setupWebGL()
      } else {
        this.useWebGL = false
      }
    }
    
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
  
  private setupWebGL() {
    if (!this.gl) return
    
    // Enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.depthFunc(this.gl.LEQUAL)
    
    // Enable blending
    this.gl.enable(this.gl.BLEND)
  private setupWebGL() {
    if (!this.gl) return
    
    // Enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.depthFunc(this.gl.LEQUAL)
    
    // Enable blending
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
    
    // Enable culling
    this.gl.enable(this.gl.CULL_FACE)
    this.gl.cullFace(this.gl.BACK)
    
    // Set clear color
    this.gl.clearColor(0.05, 0.05, 0.1, 1.0)
    
    // Create shader programs
    this.createShaderPrograms()
  }
  
  private createShaderPrograms() {
    if (!this.gl) return
    
    // Vertex shader for nodes
    const nodeVertexShader = `
      attribute vec3 position;
      attribute vec3 color;
      attribute float size;
      attribute float opacity;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform float time;
      
      varying vec3 vColor;
      varying float vOpacity;
      varying float vSize;
      
      void main() {
        vColor = color;
        vOpacity = opacity;
        vSize = size;
        
        vec3 pos = position;
        pos.y += sin(time * 0.001 + position.x * 0.01) * 10.0;
        pos.z += cos(time * 0.001 + position.z * 0.01) * 5.0;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (1.0 + sin(time * 0.002) * 0.1);
      }
    `
    
    // Fragment shader for nodes
    const nodeFragmentShader = `
      precision mediump float;
      
      varying vec3 vColor;
      varying float vOpacity;
      varying float vSize;
      
      uniform float time;
      
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        float alpha = (1.0 - dist * 2.0) * vOpacity;
        vec3 color = vColor;
        
        // Add glow effect
        float glow = 1.0 - dist * 1.5;
        color += glow * 0.3;
        
        // Add pulsing effect
        float pulse = sin(time * 0.003) * 0.1 + 0.9;
        alpha *= pulse;
        
        gl_FragColor = vec4(color, alpha);
      }
    `
    
    // Create and compile shaders
    this.nodeShaderProgram = this.createShaderProgram(nodeVertexShader, nodeFragmentShader)
    
    // Connection shader
    const connectionVertexShader = `
      attribute vec3 position;
      attribute vec3 color;
      attribute float thickness;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform float time;
      
      varying vec3 vColor;
      varying float vThickness;
      
      void main() {
        vColor = color;
        vThickness = thickness;
        
        vec3 pos = position;
        pos.y += sin(time * 0.0005 + position.x * 0.005) * 2.0;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `
    
    const connectionFragmentShader = `
      precision mediump float;
      
      varying vec3 vColor;
      varying float vThickness;
      
      uniform float time;
      
      void main() {
        vec3 color = vColor;
        
        // Add flowing effect
        float flow = sin(time * 0.002 + gl_FragCoord.x * 0.01) * 0.2 + 0.8;
        color *= flow;
        
        gl_FragColor = vec4(color, 0.8);
      }
    `
    
    this.connectionShaderProgram = this.createShaderProgram(connectionVertexShader, connectionFragmentShader)
  }
  
  private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    if (!this.gl) return null
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource)
    
    if (!vertexShader || !fragmentShader) return null
    
    const program = this.gl.createProgram()
    if (!program) return null
    
    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Shader program linking failed:', this.gl.getProgramInfoLog(program))
      this.gl.deleteProgram(program)
      return null
    }
    
    return program
  }
  
  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null
    
    const shader = this.gl.createShader(type)
    if (!shader) return null
    
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader))
      this.gl.deleteShader(shader)
      return null
    }
    
    return shader
  }
  
  // Advanced rendering methods
  render(nodes: EnterpriseGraphNode[], connections: EnterpriseGraphConnection[], engine: EnterpriseGraphEngine) {
    this.updatePerformance()
    
    if (this.useWebGL && this.gl) {
      this.renderWebGL(nodes, connections, engine)
    } else {
      this.renderCanvas2D(nodes, connections, engine)
    }
  }
  
  private renderWebGL(nodes: EnterpriseGraphNode[], connections: EnterpriseGraphConnection[], engine: EnterpriseGraphEngine) {
    if (!this.gl || !this.nodeShaderProgram || !this.connectionShaderProgram) return
    
    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    
    // Set up matrices
    const time = Date.now()
    const modelViewMatrix = this.createModelViewMatrix()
    const projectionMatrix = this.createProjectionMatrix()
    
    // Render connections first (behind nodes)
    this.renderConnectionsWebGL(connections, modelViewMatrix, projectionMatrix, time)
    
    // Render nodes
    this.renderNodesWebGL(nodes, modelViewMatrix, projectionMatrix, time)
    
    // Render particles and effects
    this.renderParticlesWebGL(time)
  }
  
  private renderCanvas2D(nodes: EnterpriseGraphNode[], connections: EnterpriseGraphConnection[], engine: EnterpriseGraphEngine) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height)
    
    // Set up canvas context
    this.ctx.save()
    this.ctx.translate(this.width / 2 + this.panX, this.height / 2 + this.panY)
    this.ctx.scale(this.zoom, this.zoom)
    
    // Render background effects
    this.renderBackgroundEffects()
    
    // Render connections
    this.renderConnectionsCanvas(connections, nodes)
    
    // Render nodes
    this.renderNodesCanvas(nodes)
    
    // Render UI overlays
    this.renderUIOverlays(nodes, connections, engine)
    
    this.ctx.restore()
  }
  
  private renderBackgroundEffects() {
    const time = Date.now() * 0.001
    
    // Create gradient background
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 1000)
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)')
    gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.6)')
    gradient.addColorStop(1, 'rgba(51, 65, 85, 0.4)')
    
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(-this.width, -this.height, this.width * 2, this.height * 2)
    
    // Add animated grid
    this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
    this.ctx.lineWidth = 1
    
    const gridSize = 100
    const offsetX = (time * 10) % gridSize
    const offsetY = (time * 5) % gridSize
    
    for (let x = -this.width; x < this.width; x += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x + offsetX, -this.height)
      this.ctx.lineTo(x + offsetX, this.height)
      this.ctx.stroke()
    }
    
    for (let y = -this.height; y < this.height; y += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(-this.width, y + offsetY)
      this.ctx.lineTo(this.width, y + offsetY)
      this.ctx.stroke()
    }
    
    // Add floating particles
    this.renderFloatingParticles(time)
  }
  
  private renderFloatingParticles(time: number) {
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
    
    for (let i = 0; i < 50; i++) {
      const x = Math.sin(time + i * 0.1) * 800
      const y = Math.cos(time * 0.7 + i * 0.15) * 600
      const size = Math.sin(time * 2 + i) * 2 + 3
      
      this.ctx.beginPath()
      this.ctx.arc(x, y, size, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }
  
  private renderConnectionsCanvas(connections: EnterpriseGraphConnection[], nodes: EnterpriseGraphNode[]) {
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from)
      const toNode = nodes.find(n => n.id === conn.to)
      
      if (!fromNode || !toNode || !fromNode.screenX || !fromNode.screenY || !toNode.screenX || !toNode.screenY) return
      
      // Connection styling based on type
      const connectionStyles = {
        'parent': { color: 'rgba(34, 197, 94, 0.6)', width: 3, style: 'solid' },
        'child': { color: 'rgba(34, 197, 94, 0.4)', width: 2, style: 'solid' },
        'reference': { color: 'rgba(59, 130, 246, 0.5)', width: 2, style: 'dashed' },
        'dependency': { color: 'rgba(168, 85, 247, 0.5)', width: 2, style: 'dotted' },
        'foreign_key': { color: 'rgba(245, 158, 11, 0.6)', width: 3, style: 'solid' },
        'index': { color: 'rgba(236, 72, 153, 0.5)', width: 2, style: 'dashed' },
        'constraint': { color: 'rgba(239, 68, 68, 0.5)', width: 2, style: 'solid' },
        'trigger': { color: 'rgba(16, 185, 129, 0.5)', width: 2, style: 'dotted' },
        'function': { color: 'rgba(139, 92, 246, 0.5)', width: 2, style: 'solid' },
        'procedure': { color: 'rgba(99, 102, 241, 0.5)', width: 2, style: 'solid' }
      }
      
      const style = connectionStyles[conn.type] || connectionStyles['reference']
      
      this.ctx.strokeStyle = style.color
      this.ctx.lineWidth = style.width
      this.ctx.setLineDash(style.style === 'dashed' ? [10, 5] : style.style === 'dotted' ? [2, 3] : [])
      
      // Create curved connection
      this.ctx.beginPath()
      const midX = (fromNode.screenX + toNode.screenX) / 2
      const midY = (fromNode.screenY + toNode.screenY) / 2
      const controlX = midX + (Math.random() - 0.5) * 100
      const controlY = midY + (Math.random() - 0.5) * 100
      
      this.ctx.moveTo(fromNode.screenX, fromNode.screenY)
      this.ctx.quadraticCurveTo(controlX, controlY, toNode.screenX, toNode.screenY)
      this.ctx.stroke()
      
      // Add animated flow effect
      if (conn.animated) {
        this.renderConnectionFlow(fromNode, toNode, conn)
      }
      
      // Add connection label
      if (conn.label) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        this.ctx.font = '12px Inter, sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(conn.label, midX, midY - 10)
      }
    })
  }
  
  private renderConnectionFlow(fromNode: EnterpriseGraphNode, toNode: EnterpriseGraphNode, conn: EnterpriseGraphConnection) {
    const time = Date.now() * 0.001
    const progress = (time * 0.5) % 1
    
    const x = fromNode.screenX! + (toNode.screenX! - fromNode.screenX!) * progress
    const y = fromNode.screenY! + (toNode.screenY! - fromNode.screenY!) * progress
    
    // Create flowing particle
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
    this.ctx.beginPath()
    this.ctx.arc(x, y, 3, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Add glow effect
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 10)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
    
    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(x, y, 10, 0, Math.PI * 2)
    this.ctx.fill()
  }
  
  private renderNodesCanvas(nodes: EnterpriseGraphNode[]) {
    nodes.forEach(node => {
      if (!node.screenX || !node.screenY || !node.isVisible) return
      
      const size = (node.size || 20) * (node.screenScale || 1)
      const opacity = node.opacity || 1
      
      // Node styling based on type and state
      const nodeStyles = this.getNodeStyles(node)
      
      // Render node shadow
      if (node.shadow) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        this.ctx.shadowBlur = 10
        this.ctx.shadowOffsetX = 2
        this.ctx.shadowOffsetY = 2
      }
      
      // Render node background
      this.ctx.fillStyle = nodeStyles.background
      this.ctx.strokeStyle = nodeStyles.border
      this.ctx.lineWidth = nodeStyles.borderWidth
      
      this.renderNodeShape(node, size, opacity)
      
      // Reset shadow
      this.ctx.shadowColor = 'transparent'
      this.ctx.shadowBlur = 0
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 0
      
      // Render node glow
      if (node.glow || node.isHighlighted) {
        this.renderNodeGlow(node, size)
      }
      
      // Render node icon
      this.renderNodeIcon(node, size)
      
      // Render node label
      if (node.name) {
        this.renderNodeLabel(node, size)
      }
      
      // Render node badges
      this.renderNodeBadges(node, size)
    })
  }
  
  private getNodeStyles(node: EnterpriseGraphNode) {
    const baseStyles = {
      database: { background: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)', borderWidth: 2 },
      schema: { background: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)', borderWidth: 2 },
      table: { background: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)', borderWidth: 2 },
      view: { background: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)', borderWidth: 2 },
      column: { background: 'rgba(236, 72, 153, 0.8)', border: 'rgba(236, 72, 153, 1)', borderWidth: 1 },
      index: { background: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)', borderWidth: 1 },
      constraint: { background: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)', borderWidth: 1 },
      trigger: { background: 'rgba(139, 92, 246, 0.8)', border: 'rgba(139, 92, 246, 1)', borderWidth: 1 },
      function: { background: 'rgba(99, 102, 241, 0.8)', border: 'rgba(99, 102, 241, 1)', borderWidth: 1 },
      procedure: { background: 'rgba(14, 165, 233, 0.8)', border: 'rgba(14, 165, 233, 1)', borderWidth: 1 }
    }
    
    let style = baseStyles[node.type] || baseStyles['table']
    
    // Modify based on state
    if (node.isSelected) {
      style.borderWidth = 4
      style.border = 'rgba(255, 255, 255, 1)'
    }
    
    if (node.isHighlighted) {
      style.background = style.background.replace('0.8', '1')
    }
    
    if (node.health === 'critical') {
      style.background = 'rgba(239, 68, 68, 0.9)'
      style.border = 'rgba(239, 68, 68, 1)'
    } else if (node.health === 'warning') {
      style.background = 'rgba(245, 158, 11, 0.9)'
      style.border = 'rgba(245, 158, 11, 1)'
    }
    
    return style
  }
  
  private renderNodeShape(node: EnterpriseGraphNode, size: number, opacity: number) {
    const x = node.screenX!
    const y = node.screenY!
    
    this.ctx.globalAlpha = opacity
    
    switch (node.shape || 'circle') {
      case 'circle':
        this.ctx.beginPath()
        this.ctx.arc(x, y, size, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.stroke()
        break
        
      case 'square':
        this.ctx.fillRect(x - size, y - size, size * 2, size * 2)
        this.ctx.strokeRect(x - size, y - size, size * 2, size * 2)
        break
        
      case 'triangle':
        this.ctx.beginPath()
        this.ctx.moveTo(x, y - size)
        this.ctx.lineTo(x - size, y + size)
        this.ctx.lineTo(x + size, y + size)
        this.ctx.closePath()
        this.ctx.fill()
        this.ctx.stroke()
        break
        
      case 'diamond':
        this.ctx.beginPath()
        this.ctx.moveTo(x, y - size)
        this.ctx.lineTo(x + size, y)
        this.ctx.lineTo(x, y + size)
        this.ctx.lineTo(x - size, y)
        this.ctx.closePath()
        this.ctx.fill()
        this.ctx.stroke()
        break
        
      case 'hexagon':
        this.ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const px = x + size * Math.cos(angle)
          const py = y + size * Math.sin(angle)
          if (i === 0) this.ctx.moveTo(px, py)
          else this.ctx.lineTo(px, py)
        }
        this.ctx.closePath()
        this.ctx.fill()
        this.ctx.stroke()
        break
        
      case 'star':
        this.ctx.beginPath()
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5
          const radius = i % 2 === 0 ? size : size * 0.5
          const px = x + radius * Math.cos(angle)
          const py = y + radius * Math.sin(angle)
          if (i === 0) this.ctx.moveTo(px, py)
          else this.ctx.lineTo(px, py)
        }
        this.ctx.closePath()
        this.ctx.fill()
        this.ctx.stroke()
        break
    }
    
    this.ctx.globalAlpha = 1
  }
  
  private renderNodeGlow(node: EnterpriseGraphNode, size: number) {
    const x = node.screenX!
    const y = node.screenY!
    const time = Date.now() * 0.001
    
    // Create pulsing glow effect
    const glowSize = size * (2 + Math.sin(time * 2) * 0.3)
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
    
    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(x, y, glowSize, 0, Math.PI * 2)
    this.ctx.fill()
  }
  
  private renderNodeIcon(node: EnterpriseGraphNode, size: number) {
    const x = node.screenX!
    const y = node.screenY!
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    this.ctx.font = `${size * 0.6}px Inter, sans-serif`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    
    const icons = {
      database: '🗄️',
      schema: '📁',
      table: '📊',
      view: '👁️',
      column: '📋',
      index: '🔍',
      constraint: '🔒',
      trigger: '⚡',
      function: '⚙️',
      procedure: '🔧'
    }
    
    const icon = icons[node.type] || '📄'
    this.ctx.fillText(icon, x, y)
  }
  
  private renderNodeLabel(node: EnterpriseGraphNode, size: number) {
    const x = node.screenX!
    const y = node.screenY! + size + 15
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    this.ctx.font = '12px Inter, sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'
    
    // Truncate long labels
    const maxLength = 20
    const label = node.name.length > maxLength ? node.name.substring(0, maxLength) + '...' : node.name
    this.ctx.fillText(label, x, y)
  }
  
  private renderNodeBadges(node: EnterpriseGraphNode, size: number) {
    const x = node.screenX! + size - 5
    const y = node.screenY! - size + 5
    
    // Health badge
    if (node.health && node.health !== 'excellent') {
      const healthColors = {
        good: 'rgba(34, 197, 94, 0.9)',
        warning: 'rgba(245, 158, 11, 0.9)',
        critical: 'rgba(239, 68, 68, 0.9)'
      }
      
      this.ctx.fillStyle = healthColors[node.health] || 'rgba(156, 163, 175, 0.9)'
      this.ctx.beginPath()
      this.ctx.arc(x, y, 6, 0, Math.PI * 2)
      this.ctx.fill()
    }
    
    // Alert badge
    if (node.alerts && node.alerts > 0) {
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'
      this.ctx.beginPath()
      this.ctx.arc(x - 15, y, 6, 0, Math.PI * 2)
      this.ctx.fill()
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      this.ctx.font = '10px Inter, sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(node.alerts.toString(), x - 15, y)
    }
  }
  
  private renderUIOverlays(nodes: EnterpriseGraphNode[], connections: EnterpriseGraphConnection[], engine: EnterpriseGraphEngine) {
    // Performance overlay
    this.renderPerformanceOverlay(engine)
    
    // Legend
    this.renderLegend()
    
    // Search results highlight
    this.renderSearchHighlights()
  }
  
  private renderPerformanceOverlay(engine: EnterpriseGraphEngine) {
    const performance = engine.getPerformance()
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(10, 10, 200, 120)
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    this.ctx.font = '12px Inter, sans-serif'
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'top'
    
    this.ctx.fillText(`FPS: ${this.currentFPS}`, 20, 20)
    this.ctx.fillText(`Nodes: ${performance.nodeCount}`, 20, 40)
    this.ctx.fillText(`Connections: ${performance.connectionCount}`, 20, 60)
    this.ctx.fillText(`Physics: ${performance.physicsTime.toFixed(2)}ms`, 20, 80)
    this.ctx.fillText(`Render: ${performance.renderTime.toFixed(2)}ms`, 20, 100)
  }
  
  private renderLegend() {
    const legendItems = [
      { type: 'database', label: 'Database', color: 'rgba(59, 130, 246, 0.8)' },
      { type: 'schema', label: 'Schema', color: 'rgba(34, 197, 94, 0.8)' },
      { type: 'table', label: 'Table', color: 'rgba(168, 85, 247, 0.8)' },
      { type: 'view', label: 'View', color: 'rgba(245, 158, 11, 0.8)' },
      { type: 'column', label: 'Column', color: 'rgba(236, 72, 153, 0.8)' }
    ]
    
    const startX = this.width - 150
    const startY = 20
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(startX - 10, startY - 10, 140, legendItems.length * 25 + 20)
    
    legendItems.forEach((item, i) => {
      const y = startY + i * 25
      
      // Color indicator
      this.ctx.fillStyle = item.color
      this.ctx.beginPath()
      this.ctx.arc(startX, y, 8, 0, Math.PI * 2)
      this.ctx.fill()
      
      // Label
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      this.ctx.font = '12px Inter, sans-serif'
      this.ctx.textAlign = 'left'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(item.label, startX + 20, y)
    })
  }
  
  private renderSearchHighlights() {
    // This would highlight search results
    // Implementation depends on search functionality
  }
  
  private updatePerformance() {
    this.frameCount++
    const now = performance.now()
    
    if (now - this.lastFPSUpdate >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate))
      this.frameCount = 0
      this.lastFPSUpdate = now
    }
  }
  
  // WebGL rendering methods
  private nodeShaderProgram: WebGLProgram | null = null
  private connectionShaderProgram: WebGLProgram | null = null
  
  private renderNodesWebGL(nodes: EnterpriseGraphNode[], modelViewMatrix: number[], projectionMatrix: number[], time: number) {
    if (!this.gl || !this.nodeShaderProgram) return
    
    this.gl.useProgram(this.nodeShaderProgram)
    
    // Set up attributes and uniforms
    // Implementation would continue with WebGL buffer setup and rendering
  }
  
  private renderConnectionsWebGL(connections: EnterpriseGraphConnection[], modelViewMatrix: number[], projectionMatrix: number[], time: number) {
    if (!this.gl || !this.connectionShaderProgram) return
    
    this.gl.useProgram(this.connectionShaderProgram)
    
    // Implementation would continue with WebGL buffer setup and rendering
  }
  
  private renderParticlesWebGL(time: number) {
    if (!this.gl) return
    
    // Advanced particle system rendering
  }
  
  private createModelViewMatrix(): number[] {
    // Create 4x4 model-view matrix
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
  }
  
  private createProjectionMatrix(): number[] {
    // Create 4x4 projection matrix
    const fov = 75
    const aspect = this.width / this.height
    const near = 0.1
    const far = 1000
    
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov * Math.PI / 180)
    const rangeInv = 1.0 / (near - far)
    
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]
  }
  
  // Interaction methods
  setZoom(zoom: number) {
    this.zoom = Math.max(0.1, Math.min(5, zoom))
  }
  
  setPan(panX: number, panY: number) {
    this.panX = panX
    this.panY = panY
  }
  
  getZoom(): number {
    return this.zoom
  }
  
  getPan(): { x: number, y: number } {
    return { x: this.panX, y: this.panY }
  }
  
  // Quality settings
  setRenderQuality(quality: 'low' | 'medium' | 'high' | 'ultra') {
    this.renderQuality = quality
    
    switch (quality) {
      case 'low':
        this.enableShadows = false
        this.enableGlow = false
        this.enableParticles = false
        break
      case 'medium':
        this.enableShadows = true
        this.enableGlow = false
        this.enableParticles = false
        break
      case 'high':
        this.enableShadows = true
        this.enableGlow = true
        this.enableParticles = true
        break
      case 'ultra':
        this.enableShadows = true
        this.enableGlow = true
        this.enableParticles = true
        this.enableAnimations = true
        break
    }
  }
  
  destroy() {
    if (this.gl) {
      if (this.nodeShaderProgram) {
        this.gl.deleteProgram(this.nodeShaderProgram)
      }
      if (this.connectionShaderProgram) {
        this.gl.deleteProgram(this.connectionShaderProgram)
      }
    }
  }
}
      
      private createShaderPrograms() {
        if (!this.gl) return
        
        // Vertex shader for nodes
        const nodeVertexShader = `
          attribute vec3 position;
          attribute vec3 color;
          attribute float size;
          attribute float opacity;
          
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          uniform float time;
          
          varying vec3 vColor;
          varying float vOpacity;
          varying float vSize;
          
          void main() {
            vColor = color;
            vOpacity = opacity;
            vSize = size;
            
            vec3 pos = position;
            pos.y += sin(time * 0.001 + position.x * 0.01) * 10.0;
            pos.z += cos(time * 0.001 + position.z * 0.01) * 5.0;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (1.0 + sin(time * 0.002) * 0.1);
          }
        `
        
        // Fragment shader for nodes
        const nodeFragmentShader = `
          precision mediump float;
          
          varying vec3 vColor;
          varying float vOpacity;
          varying float vSize;
          
          uniform float time;
          
          void main() {
            vec2 center = gl_PointCoord - 0.5;
            float dist = length(center);
            
            if (dist > 0.5) discard;
            
            float alpha = (1.0 - dist * 2.0) * vOpacity;
            vec3 color = vColor;
            
            // Add glow effect
            float glow = 1.0 - dist * 1.5;
            color += glow * 0.3;
            
            // Add pulsing effect
            float pulse = sin(time * 0.003) * 0.1 + 0.9;
            alpha *= pulse;
            
            gl_FragColor = vec4(color, alpha);
          }
        `
        
        // Create and compile shaders
        this.nodeShaderProgram = this.createShaderProgram(nodeVertexShader, nodeFragmentShader)
        
        // Connection shader
        const connectionVertexShader = `
          attribute vec3 position;
          attribute vec3 color;
          attribute float thickness;
          
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          uniform float time;
          
          varying vec3 vColor;
          varying float vThickness;
          
          void main() {
            vColor = color;
            vThickness = thickness;
            
            vec3 pos = position;
            pos.y += sin(time * 0.0005 + position.x * 0.005) * 2.0;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `
        
        const connectionFragmentShader = `
          precision mediump float;
          
          varying vec3 vColor;
          varying float vThickness;
          
          uniform float time;
          
          void main() {
            vec3 color = vColor;
            
            // Add flowing effect
            float flow = sin(time * 0.002 + gl_FragCoord.x * 0.01) * 0.2 + 0.8;
            color *= flow;
            
            gl_FragColor = vec4(color, 0.8);
          }
        `
        
        this.connectionShaderProgram = this.createShaderProgram(connectionVertexShader, connectionFragmentShader)
      }
      
      private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
        if (!this.gl) return null
        
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource)
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource)
        
        if (!vertexShader || !fragmentShader) return null
        
        const program = this.gl.createProgram()
        if (!program) return null
        
        this.gl.attachShader(program, vertexShader)
        this.gl.attachShader(program, fragmentShader)
        this.gl.linkProgram(program)
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
          console.error('Shader program linking failed:', this.gl.getProgramInfoLog(program))
          this.gl.deleteProgram(program)
          return null
        }
        
        return program
      }
      
      private createShader(type: number, source: string): WebGLShader | null {
        if (!this.gl) return null
        
        const shader = this.gl.createShader(type)
        if (!shader) return null
        
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader))
          this.gl.deleteShader(shader)
          return null
        }
        
        return shader
      }
      
      // Advanced rendering methods
      render(nodes: EnterpriseGraphNode[], connections: EnterpriseGraphConnection[], engine: EnterpriseGraphEngine) {
        this.updatePerformance()
        
        if (this.useWebGL && this.gl) {
          this.renderWebGL(nodes, connections, engine)
        } else {
          this.renderCanvas2D(nodes, connections, engine)
        }
      }
      
      private renderWebGL(nodes: EnterpriseGraphNode[], connections: EnterpriseGraphConnection[], engine: EnterpriseGraphEngine) {
        if (!this.gl || !this.nodeShaderProgram || !this.connectionShaderProgram) return
        
        // Clear the canvas
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
        
        // Set up matrices
        const time = Date.now()
        const modelViewMatrix = this.createModelViewMatrix()
        const projectionMatrix = this.createProjectionMatrix()
        
        // Render connections first (behind nodes)
        this.renderConnectionsWebGL(connections, modelViewMatrix, projectionMatrix, time)
        
        // Render nodes
        this.renderNodesWebGL(nodes, modelViewMatrix, projectionMatrix, time)
        
        // Render particles and effects
        this.renderParticlesWebGL(time)
      }
      
      private renderCanvas2D(nodes: EnterpriseGraphNode[], connections: EnterpriseGraphConnection[], engine: EnterpriseGraphEngine) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height)
        
        // Set up canvas context
        this.ctx.save()
        this.ctx.translate(this.width / 2 + this.panX, this.height / 2 + this.panY)
        this.ctx.scale(this.zoom, this.zoom)
        
        // Render background effects
        this.renderBackgroundEffects()
        
        // Render connections
        this.renderConnectionsCanvas(connections, nodes)
        
        // Render nodes
        this.renderNodesCanvas(nodes)
        
        // Render UI overlays
        this.renderUIOverlays(nodes, connections, engine)
        
        this.ctx.restore()
      }
      
      private renderBackgroundEffects() {
        const time = Date.now() * 0.001
        
        // Create gradient background
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 1000)
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)')
        gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.6)')
        gradient.addColorStop(1, 'rgba(51, 65, 85, 0.4)')
        
        this.ctx.fillStyle = gradient
        this.ctx.fillRect(-this.width, -this.height, this.width * 2, this.height * 2)
        
        // Add animated grid
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
        this.ctx.lineWidth = 1
        
        const gridSize = 100
        const offsetX = (time * 10) % gridSize
        const offsetY = (time * 5) % gridSize
        
        for (let x = -this.width; x < this.width; x += gridSize) {
          this.ctx.beginPath()
          this.ctx.moveTo(x + offsetX, -this.height)
          this.ctx.lineTo(x + offsetX, this.height)
          this.ctx.stroke()
        }
        
        for (let y = -this.height; y < this.height; y += gridSize) {
          this.ctx.beginPath()
          this.ctx.moveTo(-this.width, y + offsetY)
          this.ctx.lineTo(this.width, y + offsetY)
          this.ctx.stroke()
        }
        
        // Add floating particles
        this.renderFloatingParticles(time)
      }
      
      private renderFloatingParticles(time: number) {
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
        
        for (let i = 0; i < 50; i++) {
          const x = Math.sin(time + i * 0.1) * 800
          const y = Math.cos(time * 0.7 + i * 0.15) * 600
          const size = Math.sin(time * 2 + i) * 2 + 3
          
          this.ctx.beginPath()
          this.ctx.arc(x, y, size, 0, Math.PI * 2)
          this.ctx.fill()
        }
      }
      
      private renderConnectionsCanvas(connections: EnterpriseGraphConnection[], nodes: EnterpriseGraphNode[]) {
        connections.forEach(conn => {
          const fromNode = nodes.find(n => n.id === conn.from)
          const toNode = nodes.find(n => n.id === conn.to)
          
          if (!fromNode || !toNode || !fromNode.screenX || !fromNode.screenY || !toNode.screenX || !toNode.screenY) return
          
          // Connection styling based on type
          const connectionStyles = {
            'parent': { color: 'rgba(34, 197, 94, 0.6)', width: 3, style: 'solid' },
            'child': { color: 'rgba(34, 197, 94, 0.4)', width: 2, style: 'solid' },
            'reference': { color: 'rgba(59, 130, 246, 0.5)', width: 2, style: 'dashed' },
            'dependency': { color: 'rgba(168, 85, 247, 0.5)', width: 2, style: 'dotted' },
            'foreign_key': { color: 'rgba(245, 158, 11, 0.6)', width: 3, style: 'solid' },
            'index': { color: 'rgba(236, 72, 153, 0.5)', width: 2, style: 'dashed' },
            'constraint': { color: 'rgba(239, 68, 68, 0.5)', width: 2, style: 'solid' },
            'trigger': { color: 'rgba(16, 185, 129, 0.5)', width: 2, style: 'dotted' },
            'function': { color: 'rgba(139, 92, 246, 0.5)', width: 2, style: 'solid' },
            'procedure': { color: 'rgba(99, 102, 241, 0.5)', width: 2, style: 'solid' }
          }
          
          const style = connectionStyles[conn.type] || connectionStyles['reference']
          
          this.ctx.strokeStyle = style.color
          this.ctx.lineWidth = style.width
          this.ctx.setLineDash(style.style === 'dashed' ? [10, 5] : style.style === 'dotted' ? [2, 3] : [])
          
          // Create curved connection
          this.ctx.beginPath()
          const midX = (fromNode.screenX + toNode.screenX) / 2
          const midY = (fromNode.screenY + toNode.screenY) / 2
          const controlX = midX + (Math.random() - 0.5) * 100
          const controlY = midY + (Math.random() - 0.5) * 100
          
          this.ctx.moveTo(fromNode.screenX, fromNode.screenY)
          this.ctx.quadraticCurveTo(controlX, controlY, toNode.screenX, toNode.screenY)
          this.ctx.stroke()
          
          // Add animated flow effect
          if (conn.animated) {
            this.renderConnectionFlow(fromNode, toNode, conn)
          }
          
          // Add connection label
          if (conn.label) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
            this.ctx.font = '12px Inter, sans-serif'
            this.ctx.textAlign = 'center'
            this.ctx.fillText(conn.label, midX, midY - 10)
          }
        })
      }
      
      private renderConnectionFlow(fromNode: EnterpriseGraphNode, toNode: EnterpriseGraphNode, conn: EnterpriseGraphConnection) {
        const time = Date.now() * 0.001
        const progress = (time * 0.5) % 1
        
        const x = fromNode.screenX! + (toNode.screenX! - fromNode.screenX!) * progress
        const y = fromNode.screenY! + (toNode.screenY! - fromNode.screenY!) * progress
        
        // Create flowing particle
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
        this.ctx.beginPath()
        this.ctx.arc(x, y, 3, 0, Math.PI * 2)
        this.ctx.fill()
        
        // Add glow effect
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 10)
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)')
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
        
        this.ctx.fillStyle = gradient
        this.ctx.beginPath()
        this.ctx.arc(x, y, 10, 0, Math.PI * 2)
        this.ctx.fill()
      }
      
      private renderNodesCanvas(nodes: EnterpriseGraphNode[]) {
        nodes.forEach(node => {
          if (!node.screenX || !node.screenY || !node.isVisible) return
          
          const size = (node.size || 20) * (node.screenScale || 1)
          const opacity = node.opacity || 1
          
          // Node styling based on type and state
          const nodeStyles = this.getNodeStyles(node)
          
          // Render node shadow
          if (node.shadow) {
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
            this.ctx.shadowBlur = 10
            this.ctx.shadowOffsetX = 2
            this.ctx.shadowOffsetY = 2
          }
          
          // Render node background
          this.ctx.fillStyle = nodeStyles.background
          this.ctx.strokeStyle = nodeStyles.border
          this.ctx.lineWidth = nodeStyles.borderWidth
          
          this.renderNodeShape(node, size, opacity)
          
          // Reset shadow
          this.ctx.shadowColor = 'transparent'
          this.ctx.shadowBlur = 0
          this.ctx.shadowOffsetX = 0
          this.ctx.shadowOffsetY = 0
          
          // Render node glow
          if (node.glow || node.isHighlighted) {
            this.renderNodeGlow(node, size)
          }
          
          // Render node icon
          this.renderNodeIcon(node, size)
          
          // Render node label
          if (node.name) {
            this.renderNodeLabel(node, size)
          }
          
          // Render node badges
          this.renderNodeBadges(node, size)
        })
      }
      
      private getNodeStyles(node: EnterpriseGraphNode) {
        const baseStyles = {
          database: { background: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)', borderWidth: 2 },
          schema: { background: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)', borderWidth: 2 },
          table: { background: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)', borderWidth: 2 },
          view: { background: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)', borderWidth: 2 },
          column: { background: 'rgba(236, 72, 153, 0.8)', border: 'rgba(236, 72, 153, 1)', borderWidth: 1 },
          index: { background: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)', borderWidth: 1 },
          constraint: { background: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)', borderWidth: 1 },
          trigger: { background: 'rgba(139, 92, 246, 0.8)', border: 'rgba(139, 92, 246, 1)', borderWidth: 1 },
          function: { background: 'rgba(99, 102, 241, 0.8)', border: 'rgba(99, 102, 241, 1)', borderWidth: 1 },
          procedure: { background: 'rgba(14, 165, 233, 0.8)', border: 'rgba(14, 165, 233, 1)', borderWidth: 1 }
        }
        
        let style = baseStyles[node.type] || baseStyles['table']
        
        // Modify based on state
        if (node.isSelected) {
          style.borderWidth = 4
          style.border = 'rgba(255, 255, 255, 1)'
        }
        
        if (node.isHighlighted) {
          style.background = style.background.replace('0.8', '1')
        }
        
        if (node.health === 'critical') {
          style.background = 'rgba(239, 68, 68, 0.9)'
          style.border = 'rgba(239, 68, 68, 1)'
        } else if (node.health === 'warning') {
          style.background = 'rgba(245, 158, 11, 0.9)'
          style.border = 'rgba(245, 158, 11, 1)'
        }
        
        return style
      }
      
      private renderNodeShape(node: EnterpriseGraphNode, size: number, opacity: number) {
        const x = node.screenX!
        const y = node.screenY!
        
        this.ctx.globalAlpha = opacity
        
        switch (node.shape || 'circle') {
          case 'circle':
            this.ctx.beginPath()
            this.ctx.arc(x, y, size, 0, Math.PI * 2)
            this.ctx.fill()
            this.ctx.stroke()
            break
            
          case 'square':
            this.ctx.fillRect(x - size, y - size, size * 2, size * 2)
            this.ctx.strokeRect(x - size, y - size, size * 2, size * 2)
            break
            
          case 'triangle':
            this.ctx.beginPath()
            this.ctx.moveTo(x, y - size)
            this.ctx.lineTo(x - size, y + size)
            this.ctx.lineTo(x + size, y + size)
            this.ctx.closePath()
            this.ctx.fill()
            this.ctx.stroke()
            break
            
          case 'diamond':
            this.ctx.beginPath()
            this.ctx.moveTo(x, y - size)
            this.ctx.lineTo(x + size, y)
            this.ctx.lineTo(x, y + size)
            this.ctx.lineTo(x - size, y)
            this.ctx.closePath()
            this.ctx.fill()
            this.ctx.stroke()
            break
            
          case 'hexagon':
            this.ctx.beginPath()
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3
              const px = x + size * Math.cos(angle)
              const py = y + size * Math.sin(angle)
              if (i === 0) this.ctx.moveTo(px, py)
              else this.ctx.lineTo(px, py)
            }
            this.ctx.closePath()
            this.ctx.fill()
            this.ctx.stroke()
            break
            
          case 'star':
            this.ctx.beginPath()
            for (let i = 0; i < 10; i++) {
              const angle = (i * Math.PI) / 5
              const radius = i % 2 === 0 ? size : size * 0.5
              const px = x + radius * Math.cos(angle)
              const py = y + radius * Math.sin(angle)
              if (i === 0) this.ctx.moveTo(px, py)
              else this.ctx.lineTo(px, py)
            }
            this.ctx.closePath()
            this.ctx.fill()
            this.ctx.stroke()
            break
        }
        
        this.ctx.globalAlpha = 1
      }
      
      private renderNodeGlow(node: EnterpriseGraphNode, size: number) {
        const x = node.screenX!
        const y = node.screenY!
        const time = Date.now() * 0.001
        
        // Create pulsing glow effect
        const glowSize = size * (2 + Math.sin(time * 2) * 0.3)
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize)
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)')
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
        
        this.ctx.fillStyle = gradient
        this.ctx.beginPath()
        this.ctx.arc(x, y, glowSize, 0, Math.PI * 2)
        this.ctx.fill()
      }
      
      private renderNodeIcon(node: EnterpriseGraphNode, size: number) {
        const x = node.screenX!
        const y = node.screenY!
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        this.ctx.font = `${size * 0.6}px Inter, sans-serif`
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        
        const icons = {
          database: '🗄️',
          schema: '📁',
          table: '📊',
          view: '👁️',
          column: '📋',
          index: '🔍',
          constraint: '🔒',
          trigger: '⚡',
          function: '⚙️',
          procedure: '🔧'
        }
        
        const icon = icons[node.type] || '📄'
        this.ctx.fillText(icon, x, y)
      }
      
      private renderNodeLabel(node: EnterpriseGraphNode, size: number) {
        const x = node.screenX!
        const y = node.screenY! + size + 15
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        this.ctx.font = '12px Inter, sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'top'
        
        // Truncate long labels
        const maxLength = 20
        const label = node.name.length > maxLength ? node.name.substring(0, maxLength) + '...' : node.name
        this.ctx.fillText(label, x, y)
      }
      
      private renderNodeBadges(node: EnterpriseGraphNode, size: number) {
        const x = node.screenX! + size - 5
        const y = node.screenY! - size + 5
        
        // Health badge
        if (node.health && node.health !== 'excellent') {
          const healthColors = {
            good: 'rgba(34, 197, 94, 0.9)',
            warning: 'rgba(245, 158, 11, 0.9)',
            critical: 'rgba(239, 68, 68, 0.9)'
          }
          
          this.ctx.fillStyle = healthColors[node.health] || 'rgba(156, 163, 175, 0.9)'
          this.ctx.beginPath()
          this.ctx.arc(x, y, 6, 0, Math.PI * 2)
          this.ctx.fill()
        }
        
        // Alert badge
        if (node.alerts && node.alerts > 0) {
          this.ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'
          this.ctx.beginPath()
          this.ctx.arc(x - 15, y, 6, 0, Math.PI * 2)
          this.ctx.fill()
          
          this.ctx.fillStyle = 'rgba(255, 255, 255, 1)'
          this.ctx.font = '10px Inter, sans-serif'
          this.ctx.textAlign = 'center'
          this.ctx.textBaseline = 'middle'
          this.ctx.fillText(node.alerts.toString(), x - 15, y)
        }
      }
      
      private renderUIOverlays(nodes: EnterpriseGraphNode[], connections: EnterpriseGraphConnection[], engine: EnterpriseGraphEngine) {
        // Performance overlay
        this.renderPerformanceOverlay(engine)
        
        // Legend
        this.renderLegend()
        
        // Search results highlight
        this.renderSearchHighlights()
      }
      
      private renderPerformanceOverlay(engine: EnterpriseGraphEngine) {
        const performance = engine.getPerformance()
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        this.ctx.fillRect(10, 10, 200, 120)
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        this.ctx.font = '12px Inter, sans-serif'
        this.ctx.textAlign = 'left'
        this.ctx.textBaseline = 'top'
        
        this.ctx.fillText(`FPS: ${this.currentFPS}`, 20, 20)
        this.ctx.fillText(`Nodes: ${performance.nodeCount}`, 20, 40)
        this.ctx.fillText(`Connections: ${performance.connectionCount}`, 20, 60)
        this.ctx.fillText(`Physics: ${performance.physicsTime.toFixed(2)}ms`, 20, 80)
        this.ctx.fillText(`Render: ${performance.renderTime.toFixed(2)}ms`, 20, 100)
      }
      
      private renderLegend() {
        const legendItems = [
          { type: 'database', label: 'Database', color: 'rgba(59, 130, 246, 0.8)' },
          { type: 'schema', label: 'Schema', color: 'rgba(34, 197, 94, 0.8)' },
          { type: 'table', label: 'Table', color: 'rgba(168, 85, 247, 0.8)' },
          { type: 'view', label: 'View', color: 'rgba(245, 158, 11, 0.8)' },
          { type: 'column', label: 'Column', color: 'rgba(236, 72, 153, 0.8)' }
        ]
        
        const startX = this.width - 150
        const startY = 20
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        this.ctx.fillRect(startX - 10, startY - 10, 140, legendItems.length * 25 + 20)
        
        legendItems.forEach((item, i) => {
          const y = startY + i * 25
          
          // Color indicator
          this.ctx.fillStyle = item.color
          this.ctx.beginPath()
          this.ctx.arc(startX, y, 8, 0, Math.PI * 2)
          this.ctx.fill()
          
          // Label
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          this.ctx.font = '12px Inter, sans-serif'
          this.ctx.textAlign = 'left'
          this.ctx.textBaseline = 'middle'
          this.ctx.fillText(item.label, startX + 20, y)
        })
      }
      
      private renderSearchHighlights() {
        // This would highlight search results
        // Implementation depends on search functionality
      }
      
      private updatePerformance() {
        this.frameCount++
        const now = performance.now()
        
        if (now - this.lastFPSUpdate >= 1000) {
          this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate))
          this.frameCount = 0
          this.lastFPSUpdate = now
        }
      }
      
      // WebGL rendering methods
      private nodeShaderProgram: WebGLProgram | null = null
      private connectionShaderProgram: WebGLProgram | null = null
      
      private renderNodesWebGL(nodes: EnterpriseGraphNode[], modelViewMatrix: number[], projectionMatrix: number[], time: number) {
        if (!this.gl || !this.nodeShaderProgram) return
        
        this.gl.useProgram(this.nodeShaderProgram)
        
        // Set up attributes and uniforms
        // Implementation would continue with WebGL buffer setup and rendering
      }
      
      private renderConnectionsWebGL(connections: EnterpriseGraphConnection[], modelViewMatrix: number[], projectionMatrix: number[], time: number) {
        if (!this.gl || !this.connectionShaderProgram) return
        
        this.gl.useProgram(this.connectionShaderProgram)
        
        // Implementation would continue with WebGL buffer setup and rendering
      }
      
      private renderParticlesWebGL(time: number) {
        if (!this.gl) return
        
        // Advanced particle system rendering
      }
      
      private createModelViewMatrix(): number[] {
        // Create 4x4 model-view matrix
        return [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        ]
      }
      
      private createProjectionMatrix(): number[] {
        // Create 4x4 projection matrix
        const fov = 75
        const aspect = this.width / this.height
        const near = 0.1
        const far = 1000
        
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov * Math.PI / 180)
        const rangeInv = 1.0 / (near - far)
        
        return [
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (near + far) * rangeInv, -1,
          0, 0, near * far * rangeInv * 2, 0
        ]
      }
      
      // Interaction methods
      setZoom(zoom: number) {
        this.zoom = Math.max(0.1, Math.min(5, zoom))
      }
      
      setPan(panX: number, panY: number) {
        this.panX = panX
        this.panY = panY
      }
      
      getZoom(): number {
        return this.zoom
      }
      
      getPan(): { x: number, y: number } {
        return { x: this.panX, y: this.panY }
      }
      
      // Quality settings
      setRenderQuality(quality: 'low' | 'medium' | 'high' | 'ultra') {
        this.renderQuality = quality
        
        switch (quality) {
          case 'low':
            this.enableShadows = false
            this.enableGlow = false
            this.enableParticles = false
            break
          case 'medium':
            this.enableShadows = true
            this.enableGlow = false
            this.enableParticles = false
            break
          case 'high':
            this.enableShadows = true
            this.enableGlow = true
            this.enableParticles = true
            break
          case 'ultra':
            destroy() {
                if (this.gl) {
                  if (this.nodeShaderProgram) {
                    this.gl.deleteProgram(this.nodeShaderProgram)
                  }
                  if (this.connectionShaderProgram) {
                    this.gl.deleteProgram(this.connectionShaderProgram)
                  }
                }
              }
            }
            
            // Enterprise Graph Component Props
            interface EnterpriseGraphEngineProps {
              nodes: EnterpriseGraphNode[]
              onToggle?: (nodeId: string) => void
              onSelect?: (nodeId: string) => void
              onPreview?: (nodeId: string) => void
              onNodeHover?: (nodeId: string | null) => void
              onNodeClick?: (nodeId: string) => void
              onNodeDoubleClick?: (nodeId: string) => void
              onConnectionClick?: (connectionId: string) => void
              height?: number
              width?: number
              layoutAlgorithm?: EnterpriseLayoutAlgorithm
              viewMode?: 'overview' | 'detailed' | 'minimal' | 'presentation'
              showConnections?: boolean
              showLabels?: boolean
              showMinimap?: boolean
              enablePhysics?: boolean
              enableAnimation?: boolean
              enableSearch?: boolean
              enableFiltering?: boolean
              enableClustering?: boolean
              autoLayout?: boolean
              performanceConfig?: {
                maxNodes?: number
                maxConnections?: number
                targetFPS?: number
                enableLOD?: boolean
                enableCulling?: boolean
              }
              theme?: 'light' | 'dark' | 'auto'
              className?: string
              style?: React.CSSProperties
              onFullscreenChange?: (isFullscreen: boolean) => void
            }
            
            // Main Enterprise Graph Component
            export function EnterpriseGraphEngine({
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
              layoutAlgorithm = 'force-directed-3d',
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
            }: EnterpriseGraphEngineProps) {
              
              // State management
              const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
              const [hoveredNode, setHoveredNode] = useState<string | null>(null)
              const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
              const [searchQuery, setSearchQuery] = useState('')
              const [filterType, setFilterType] = useState<string>('all')
              const [isPlaying, setIsPlaying] = useState(true)
              const [zoom, setZoom] = useState(1)
              const [pan, setPan] = useState({ x: 0, y: 0 })
              const [currentAlgorithm, setCurrentAlgorithm] = useState<EnterpriseLayoutAlgorithm>(layoutAlgorithm)
              const [isFullscreen, setIsFullscreen] = useState(false)
              const [showSettings, setShowSettings] = useState(false)
              const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high')
              const [useWebGL, setUseWebGL] = useState(false)
              const [showPerformance, setShowPerformance] = useState(false)
              
              // Refs
              const canvasRef = useRef<HTMLCanvasElement>(null)
              const containerRef = useRef<HTMLDivElement>(null)
              const engineRef = useRef<EnterpriseGraphEngine | null>(null)
              const rendererRef = useRef<EnterpriseGraphRenderer | null>(null)
              const animationFrameRef = useRef<number | null>(null)
              
              // Memoized filtered nodes and connections
              const { filteredNodes, filteredConnections } = useMemo(() => {
                let filtered = nodes.filter(node => {
                  // Search filter
                  if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false
                  }
                  
                  // Type filter
                  if (filterType !== 'all' && node.type !== filterType) {
                    return false
                  }
                  
                  return true
                })
                
                // Generate connections based on schema hierarchy
                const connections: EnterpriseGraphConnection[] = []
                filtered.forEach(node => {
                  if (node.parentId) {
                    connections.push({
                      id: `${node.parentId}-${node.id}`,
                      from: node.parentId,
                      to: node.id,
                      type: 'parent',
                      strength: 1,
                      color: 'rgba(34, 197, 94, 0.6)',
                      animated: true
                    })
                  }
                  
                  if (node.childIds) {
                    node.childIds.forEach(childId => {
                      connections.push({
                        id: `${node.id}-${childId}`,
                        from: node.id,
                        to: childId,
                        type: 'child',
                        strength: 0.8,
                        color: 'rgba(34, 197, 94, 0.4)'
                      })
                    })
                  }
                })
                
                return { filteredNodes: filtered, filteredConnections: connections }
              }, [nodes, searchQuery, filterType])
              
              // Initialize engine and renderer
              useEffect(() => {
                if (!canvasRef.current) return
                
                const canvas = canvasRef.current
                const container = containerRef.current
                
                if (!container) return
                
                // Create engine
                const engine = new EnterpriseGraphEngine()
                engine.setDimensions(container.clientWidth, height)
                engine.setAlgorithm(currentAlgorithm)
                engine.setNodes(filteredNodes)
                engine.setConnections(filteredConnections)
                
                // Create renderer
                const renderer = new EnterpriseGraphRenderer(canvas, useWebGL)
                renderer.setRenderQuality(renderQuality)
                
                engineRef.current = engine
                rendererRef.current = renderer
                
                // Start animation
                if (isPlaying) {
                  engine.start()
                }
                
                return () => {
                  engine.stop()
                  engine.destroy()
                  renderer.destroy()
                }
              }, [filteredNodes, filteredConnections, currentAlgorithm, height, useWebGL, renderQuality])
              
              // Render loop
              useEffect(() => {
                if (!isPlaying || !engineRef.current || !rendererRef.current) return
                
                const render = () => {
                  if (engineRef.current && rendererRef.current) {
                    const nodes = engineRef.current.getNodes()
                    const connections = engineRef.current.getConnections()
                    rendererRef.current.render(nodes, connections, engineRef.current)
                  }
                  animationFrameRef.current = requestAnimationFrame(render)
                }
                
                animationFrameRef.current = requestAnimationFrame(render)
                
                return () => {
                  if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current)
                  }
                }
              }, [isPlaying])
              
              // Handle canvas interactions
              const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
                if (!canvasRef.current || !engineRef.current) return
                
                const rect = canvasRef.current.getBoundingClientRect()
                const x = event.clientX - rect.left
                const y = event.clientY - rect.top
                
                // Find node under cursor
                const nodes = engineRef.current.getNodes()
                const nodeUnderCursor = nodes.find(node => {
                  if (!node.screenX || !node.screenY) return false
                  const distance = Math.sqrt(
                    Math.pow(x - node.screenX, 2) + Math.pow(y - node.screenY, 2)
                  )
                  return distance < (node.size || 20)
                })
                
                if (nodeUnderCursor) {
                  setHoveredNode(nodeUnderCursor.id)
                  onNodeHover?.(nodeUnderCursor.id)
                } else {
                  setHoveredNode(null)
                  onNodeHover?.(null)
                }
              }, [onNodeHover])
              
              const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
                if (!canvasRef.current || !engineRef.current) return
                
                const rect = canvasRef.current.getBoundingClientRect()
                const x = event.clientX - rect.left
                const y = event.clientY - rect.top
                
                // Find clicked node
                const nodes = engineRef.current.getNodes()
                const clickedNode = nodes.find(node => {
                  if (!node.screenX || !node.screenY) return false
                  const distance = Math.sqrt(
                    Math.pow(x - node.screenX, 2) + Math.pow(y - node.screenY, 2)
                  )
                  return distance < (node.size || 20)
                })
                
                if (clickedNode) {
                  setSelectedNodes(new Set([clickedNode.id]))
                  onNodeClick?.(clickedNode.id)
                  onSelect?.(clickedNode.id)
                } else {
                  setSelectedNodes(new Set())
                }
              }, [onNodeClick, onSelect])
              
              const handleCanvasDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
                if (!canvasRef.current || !engineRef.current) return
                
                const rect = canvasRef.current.getBoundingClientRect()
                const x = event.clientX - rect.left
                const y = event.clientY - rect.top
                
                // Find double-clicked node
                const nodes = engineRef.current.getNodes()
                const clickedNode = nodes.find(node => {
                  if (!node.screenX || !node.screenY) return false
                  const distance = Math.sqrt(
                    Math.pow(x - node.screenX, 2) + Math.pow(y - node.screenY, 2)
                  )
                  return distance < (node.size || 20)
                })
                
                if (clickedNode) {
                  onNodeDoubleClick?.(clickedNode.id)
                  onToggle?.(clickedNode.id)
                }
              }, [onNodeDoubleClick, onToggle])
              
              // Handle keyboard shortcuts
              useEffect(() => {
                const handleKeyDown = (event: KeyboardEvent) => {
                  switch (event.key) {
                    case ' ':
                      event.preventDefault()
                      setIsPlaying(!isPlaying)
                      break
                    case 'r':
                      if (event.ctrlKey || event.metaKey) {
                        event.preventDefault()
                        // Reset view
                        setZoom(1)
                        setPan({ x: 0, y: 0 })
                      }
                      break
                    case 'f':
                      if (event.ctrlKey || event.metaKey) {
                        event.preventDefault()
                        setIsFullscreen(!isFullscreen)
                        onFullscreenChange?.(!isFullscreen)
                      }
                      break
                    case 'Escape':
                      if (isFullscreen) {
                        setIsFullscreen(false)
                        onFullscreenChange?.(false)
                      }
                      break
                  }
                }
                
                window.addEventListener('keydown', handleKeyDown)
                return () => window.removeEventListener('keydown', handleKeyDown)
              }, [isPlaying, isFullscreen, onFullscreenChange])
              
              // Handle window resize
              useEffect(() => {
                const handleResize = () => {
                  if (containerRef.current && engineRef.current) {
                    const container = containerRef.current
                    engineRef.current.setDimensions(container.clientWidth, height)
                  }
                }
                
                window.addEventListener('resize', handleResize)
                return () => window.removeEventListener('resize', handleResize)
              }, [height])
              
              // Layout algorithm options
              const layoutOptions: { value: EnterpriseLayoutAlgorithm; label: string; icon: React.ReactNode }[] = [
                { value: 'force-directed-3d', label: 'Force Directed 3D', icon: <Network className="w-4 h-4" /> },
                { value: 'hierarchical-3d', label: 'Hierarchical 3D', icon: <Layers className="w-4 h-4" /> },
                { value: 'circular-3d', label: 'Circular 3D', icon: <Circle className="w-4 h-4" /> },
                { value: 'grid-3d', label: 'Grid 3D', icon: <Grid3X3 className="w-4 h-4" /> },
                { value: 'tree-3d', label: 'Tree 3D', icon: <Tree className="w-4 h-4" /> },
                { value: 'radial-3d', label: 'Radial 3D', icon: <Target className="w-4 h-4" /> },
                { value: 'cluster-3d', label: 'Cluster 3D', icon: <Box className="w-4 h-4" /> },
                { value: 'organic-3d', label: 'Organic 3D', icon: <Sparkles className="w-4 h-4" /> },
                { value: 'spiral-3d', label: 'Spiral 3D', icon: <RotateCw className="w-4 h-4" /> },
                { value: 'concentric-3d', label: 'Concentric 3D', icon: <Circle className="w-4 h-4" /> },
                { value: 'centralized-3d', label: 'Centralized 3D', icon: <Target className="w-4 h-4" /> },
                { value: 'network-3d', label: 'Network 3D', icon: <Network className="w-4 h-4" /> },
                { value: 'galaxy-3d', label: 'Galaxy 3D', icon: <Globe className="w-4 h-4" /> },
                { value: 'molecule-3d', label: 'Molecule 3D', icon: <Hexagon className="w-4 h-4" /> },
                { value: 'crystal-3d', label: 'Crystal 3D', icon: <Square className="w-4 h-4" /> },
                { value: 'fractal-3d', label: 'Fractal 3D', icon: <Star className="w-4 h-4" /> },
                { value: 'neural-3d', label: 'Neural 3D', icon: <Brain className="w-4 h-4" /> },
                { value: 'quantum-3d', label: 'Quantum 3D', icon: <Zap className="w-4 h-4" /> }
              ]
              
              // Node type filter options
              const nodeTypeOptions = [
                { value: 'all', label: 'All Types', icon: <Layers className="w-4 h-4" /> },
                { value: 'database', label: 'Databases', icon: <Database className="w-4 h-4" /> },
                { value: 'schema', label: 'Schemas', icon: <Folder className="w-4 h-4" /> },
                { value: 'table', label: 'Tables', icon: <Table className="w-4 h-4" /> },
                { value: 'view', label: 'Views', icon: <Eye className="w-4 h-4" /> },
                { value: 'column', label: 'Columns', icon: <Columns className="w-4 h-4" /> },
                { value: 'index', label: 'Indexes', icon: <Search className="w-4 h-4" /> },
                { value: 'constraint', label: 'Constraints', icon: <Lock className="w-4 h-4" /> },
                { value: 'trigger', label: 'Triggers', icon: <Zap className="w-4 h-4" /> },
                { value: 'function', label: 'Functions', icon: <Cog className="w-4 h-4" /> },
                { value: 'procedure', label: 'Procedures', icon: <Settings className="w-4 h-4" /> }
              ]
              
              return (
                <div 
                  ref={containerRef}
                  className={`relative w-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden ${className}`}
                  style={{ height, ...style }}
                >
                  {/* Header Controls */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                      {/* Left Controls */}
                      <div className="flex items-center space-x-4">
                        {/* Search */}
                        {enableSearch && (
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search nodes..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        )}
                        
                        {/* Filter */}
                        {enableFiltering && (
                          <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {nodeTypeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {/* Layout Algorithm */}
                        <select
                          value={currentAlgorithm}
                          onChange={(e) => setCurrentAlgorithm(e.target.value as EnterpriseLayoutAlgorithm)}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {layoutOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Right Controls */}
                      <div className="flex items-center space-x-2">
                        {/* Play/Pause */}
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                          title={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        
                        {/* Reset */}
                        <button
                          onClick={() => {
                            setZoom(1)
                            setPan({ x: 0, y: 0 })
                            if (engineRef.current) {
                              engineRef.current.setAlgorithm(currentAlgorithm)
                            }
                          }}
                          className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                          title="Reset View"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        
                        {/* Zoom Controls */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                            className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-slate-300 px-2">
                            {Math.round(zoom * 100)}%
                          </span>
                          <button
                            onClick={() => setZoom(Math.min(5, zoom + 0.1))}
                            className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Settings */}
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        
                        {/* Fullscreen */}
                        <button
                          onClick={() => {
                            setIsFullscreen(!isFullscreen)
                            onFullscreenChange?.(!isFullscreen)
                          }}
                          className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                          title="Fullscreen"
                        >
                          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Settings Panel */}
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, x: -300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        className="absolute top-16 left-0 z-20 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Settings</h3>
                            <button
                              onClick={() => setShowSettings(false)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            {/* Render Quality */}
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Render Quality
                              </label>
                              <select
                                value={renderQuality}
                                onChange={(e) => setRenderQuality(e.target.value as any)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="ultra">Ultra</option>
                              </select>
                            </div>
                            
                            {/* WebGL Toggle */}
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-slate-300">
                                Use WebGL
                              </label>
                              <button
                                onClick={() => setUseWebGL(!useWebGL)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  useWebGL ? 'bg-blue-600' : 'bg-slate-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    useWebGL ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                            
                            {/* Performance Monitor */}
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-slate-300">
                                Show Performance
                              </label>
                              <button
                                onClick={() => setShowPerformance(!showPerformance)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  showPerformance ? 'bg-blue-600' : 'bg-slate-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    showPerformance ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Canvas */}
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseMove={handleCanvasMouseMove}
                    onClick={handleCanvasClick}
                    onDoubleClick={handleCanvasDoubleClick}
                    style={{ 
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                      cursor: hoveredNode ? 'pointer' : 'crosshair'
                    }}
                  />
                  
                  {/* Status Bar */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 p-2">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <div className="flex items-center space-x-4">
                        <span>Nodes: {filteredNodes.length}</span>
                        <span>Connections: {filteredConnections.length}</span>
                        <span>Algorithm: {layoutOptions.find(opt => opt.value === currentAlgorithm)?.label}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        {hoveredNode && (
                          <span>Hovered: {nodes.find(n => n.id === hoveredNode)?.name}</span>
                        )}
                        {selectedNodes.size > 0 && (
                          <span>Selected: {selectedNodes.size}</span>
                        )}
                        <span>Zoom: {Math.round(zoom * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
            
            export default EnterpriseGraphEngine      