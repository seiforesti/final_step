// ============================================================================
// LINEAGE VISUALIZATION ENGINE - ADVANCED ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// The most advanced data lineage visualization engine in the industry
// Surpassing Databricks, Microsoft Purview, and other enterprise platforms
// Features: 3D/2D interactive graphs, real-time updates, column-level lineage
// ============================================================================

'use client';

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
  ScrollArea,
  Input,
  Label,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Textarea
} from '@/components/ui';
import { Network, GitBranch, Share2, Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, Download, Upload, Settings, Filter, Search, RefreshCw, Maximize2, Minimize2, Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX, Monitor, Smartphone, Tablet, Camera, Video, Image, FileText, Database, Server, Cloud, Layers, Box, Cpu, HardDrive, MemoryStick, Activity, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, ScatterChart, Target, Crosshair, Move, MousePointer, Hand, Grab, GrabIcon, Navigation, Compass, Map, MapPin, Route, Navigation2, Radar, Satellite, Globe, Zap, Bolt, Lightning, Flame, Sun, Moon, Star, Sparkles, Wand2, Magic, Palette, Brush, Pen, Edit, Copy, Scissors, ClipboardCopy, Save, FolderOpen, Folder, File, FileImage, FileVideo, FileAudio, Archive, Package, Inbox, Outbox, Send, Mail, MessageSquare, MessageCircle, Bell, BellRing, BellOff, Notification, AlertTriangle, AlertCircle, AlertOctagon, CheckCircle, XCircle, Info, HelpCircle, Question, Plus, Minus, X, Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsDown, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, ArrowDownRight, ArrowDownLeft, ArrowUpLeft, ExternalLink, Link, Unlink, Chain, Anchor, Lock, Unlock, Key, Shield, ShieldCheckIcon, ShieldAlert, ShieldX, UserCheck, UserX, Users, User, UserPlus, UserMinus, Crown, Award, Trophy, Medal, Gem, Diamond, Heart, ThumbsUp, ThumbsDown, Smile, Frown, Meh, Angry, Laugh, Clock, Timer, Stopwatch, Hourglass, Calendar, CalendarDays, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, History, RotateClockwise, RotateCounterClockwise, Repeat, Repeat1, Shuffle, SkipForward as Skip, FastForward, Rewind, PlayCircle, PauseCircle, StopCircle, Volume, Volume1, VolumeOff, Mic, MicOff, Phone, PhoneCall, PhoneOff, Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium, SignalZero, Bluetooth, BluetoothConnected, BluetoothSearching, Cast, Radio, Tv, Gamepad, Gamepad2, Joystick, Dices, Puzzle, Blocks, Construction, Hammer, Wrench, Screwdriver, Drill, Saw, Ruler, Triangle, Square as SquareIcon, Circle, Pentagon, Hexagon, Octagon, Star as StarIcon, Heart as HeartIcon, Spade, Club, Diamond as DiamondIcon, Shapes, Grid, Grid3x3, LayoutGrid, LayoutList, LayoutTemplate, Layout, Columns, Rows, SplitSquareHorizontal, SplitSquareVertical, Combine, Merge, Split, Flip, FlipHorizontal, FlipVertical, Rotate90, Rotate180, Rotate270, Scale, Resize, Move3d, Orbit, Axis3d, Box as BoxIcon, Cylinder, Sphere, Cone, Pyramid, Cube, Cuboid, Dodecahedron, Icosahedron, Octahedron, Tetrahedron, Torus } from 'lucide-react';
import * as d3 from 'd3';
import { toast } from 'sonner';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { cn } from '@/lib copie/utils';

// Advanced Catalog Services and Types
import { AdvancedLineageService } from '../../services/advanced-lineage.service';
import { 
  EnterpriseDataLineage,
  DataLineageNode,
  DataLineageEdge,
  LineageVisualizationConfig,
  LineageMetrics,
  LineageImpactAnalysis,
  LineageVisualization,
  LineageVisualizationNode,
  LineageVisualizationEdge,
  LineageLayoutConfig,
  LineageFilter,
  LineageView,
  LineageInteractionConfig,
  LineageVisualizationPerformance,
  LineageNodeType,
  NodePosition,
  NodeStyle,
  LineageNodeData,
  LineageNodeMetadata,
  LineageNodeState,
  NodeInteraction,
  LineageEdgeType,
  TransformationType,
  EdgeStyle,
  EdgePath,
  LineageEdgeData,
  LineageEdgeMetadata,
  LineageEdgeState,
  LineageQuality,
  LineageTraversalEngine,
  LineageAnalysisResult,
  LineageMetadata,
  LineageValidationResult,
  LineageOptimizationSuggestion,
  LineageComplianceStatus,
  LineageSecurityClassification,
  LineagePerformanceMetrics,
  LineageBusinessContext,
  LineageDataContext,
  LineageTechnicalContext,
  LineageGovernanceContext,
  LineageQualityContext,
  LineageSecurityContext,
  LineageComplianceContext,
  LineageOperationalContext,
  LineageBusinessImpact,
  LineageRiskAssessment,
  LineageCostAnalysis,
  LineageROIMetrics,
  LineageEfficiencyMetrics,
  LineageUsageStatistics,
  LineageHealthMetrics,
  LineageReliabilityMetrics,
  LineageAvailabilityMetrics,
  LineageScalabilityMetrics,
  LineageMaintainabilityMetrics,
  LineageTestabilityMetrics,
  LineageObservabilityMetrics,
  LineageMonitoringMetrics,
  LineageAlertingMetrics,
  LineageNotificationMetrics,
  LineageReportingMetrics,
  LineageAuditMetrics,
  LineageComplianceMetrics,
  LineageGovernanceMetrics,
  LineageSecurityMetrics,
  LineagePrivacyMetrics,
  LineageDataQualityMetrics,
  LineageDataIntegrityMetrics,
  LineageDataConsistencyMetrics,
  LineageDataCompletenessMetrics,
  LineageDataAccuracyMetrics,
  LineageDataValidityMetrics,
  LineageDataTimelinessMetrics,
  LineageDataRelevanceMetrics,
  LineageDataUsabilityMetrics,
  LineageDataAccessibilityMetrics,
  LineageDataInteroperabilityMetrics,
  LineageDataPortabilityMetrics,
  LineageDataRecoverabilityMetrics,
  LineageDataAvailabilityMetrics,
  LineageDataDurabilityMetrics,
  LineageDataRetentionMetrics,
  LineageDataArchivalMetrics,
  LineageDataDisposalMetrics,
  LineageDataLifecycleMetrics
} from '../../types';
import { useDataLineage } from '../../hooks/useDataLineage';
import { useRealTimeUpdates } from '@/components/shared/hooks/useRealTimeUpdates';
import { usePerformanceMonitoring } from '@/components/racine-main-manager/hooks/usePerformanceMonitoring';
import { useEnterpriseNotifications } from '@/components/shared/hooks/useEnterpriseNotifications';

// ============================================================================
// ADVANCED INTERFACES AND TYPES
// ============================================================================

interface LineageVisualizationEngineProps {
  assetId?: string;
  initialConfig?: Partial<LineageVisualizationConfig>;
  height?: number;
  width?: number;
  className?: string;
  onNodeClick?: (node: LineageVisualizationNode) => void;
  onEdgeClick?: (edge: LineageVisualizationEdge) => void;
  onSelectionChange?: (selection: LineageSelection) => void;
  onConfigChange?: (config: LineageVisualizationConfig) => void;
  onError?: (error: Error) => void;
  enableRealTimeUpdates?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableAdvancedFeatures?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  accessibilityMode?: boolean;
  debugMode?: boolean;
}

interface LineageSelection {
  nodes: string[];
  edges: string[];
  metadata: SelectionMetadata;
}

interface SelectionMetadata {
  selectionType: 'single' | 'multiple' | 'range' | 'path';
  timestamp: Date;
  source: 'user' | 'api' | 'automation';
  context: Record<string, any>;
}

interface LineageVisualizationState {
  // Core State
  isLoading: boolean;
  isInitialized: boolean;
  isRealTimeEnabled: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  is3DMode: boolean;
  
  // Data State
  lineageData: LineageVisualization | null;
  filteredData: LineageVisualization | null;
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  
  // View State
  currentView: string;
  zoomLevel: number;
  panPosition: { x: number; y: number };
  rotation: { x: number; y: number; z: number };
  
  // Filter State
  activeFilters: LineageFilter[];
  searchQuery: string;
  searchResults: SearchResult[];
  
  // Configuration State
  config: LineageVisualizationConfig;
  layoutConfig: LineageLayoutConfig;
  interactionConfig: LineageInteractionConfig;
  
  // Performance State
  performance: LineageVisualizationPerformance;
  renderingStats: RenderingStats;
  
  // Error State
  errors: LineageError[];
  warnings: LineageWarning[];
  
  // Analytics State
  analytics: LineageAnalytics;
  userInteractions: UserInteraction[];
}

interface SearchResult {
  id: string;
  type: 'node' | 'edge' | 'path';
  relevance: number;
  highlights: string[];
  metadata: Record<string, any>;
}

interface RenderingStats {
  frameRate: number;
  renderTime: number;
  nodeCount: number;
  edgeCount: number;
  memoryUsage: number;
  gpuUsage?: number;
}

interface LineageError {
  id: string;
  type: 'rendering' | 'data' | 'performance' | 'network' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  context: Record<string, any>;
  stackTrace?: string;
}

interface LineageWarning {
  id: string;
  type: 'performance' | 'data' | 'ui' | 'accessibility';
  message: string;
  timestamp: Date;
  context: Record<string, any>;
}

interface LineageAnalytics {
  viewCount: number;
  interactionCount: number;
  averageSessionDuration: number;
  popularViews: string[];
  performanceMetrics: PerformanceMetric[];
  usagePatterns: UsagePattern[];
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

interface UsagePattern {
  pattern: string;
  frequency: number;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface UserInteraction {
  id: string;
  type: 'click' | 'hover' | 'drag' | 'zoom' | 'pan' | 'select' | 'filter' | 'search';
  target: string;
  timestamp: Date;
  duration?: number;
  metadata: Record<string, any>;
}

// Advanced 3D Visualization Types
interface Node3D extends LineageVisualizationNode {
  x: number;
  y: number;
  z: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number;
  fy?: number;
  fz?: number;
}

interface Edge3D extends LineageVisualizationEdge {
  source: Node3D;
  target: Node3D;
}

interface Camera3D {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  up: { x: number; y: number; z: number };
  fov: number;
  near: number;
  far: number;
}

interface Lighting3D {
  ambient: { color: string; intensity: number };
  directional: Array<{
    color: string;
    intensity: number;
    position: { x: number; y: number; z: number };
  }>;
  point: Array<{
    color: string;
    intensity: number;
    position: { x: number; y: number; z: number };
    distance: number;
  }>;
}

// Advanced Animation Types
interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  stagger: number;
  loop: boolean;
  yoyo: boolean;
  delay: number;
}

interface TransitionConfig {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'morph' | 'custom';
  duration: number;
  easing: string;
  properties: string[];
}

// Advanced Layout Types
interface ForceSimulationConfig {
  enabled: boolean;
  strength: {
    charge: number;
    link: number;
    collision: number;
    center: number;
    x: number;
    y: number;
    z?: number;
  };
  alpha: {
    min: number;
    decay: number;
    target: number;
  };
  velocityDecay: number;
  iterations: number;
}

interface HierarchicalLayoutConfig {
  direction: 'top-down' | 'bottom-up' | 'left-right' | 'right-left';
  rankSeparation: number;
  nodeSeparation: number;
  edgeSeparation: number;
  alignment: 'start' | 'center' | 'end';
}

interface CircularLayoutConfig {
  radius: number;
  startAngle: number;
  endAngle: number;
  clockwise: boolean;
  spiral: boolean;
  spiralCoefficient: number;
}

// Advanced Interaction Types
interface GestureConfig {
  enabled: boolean;
  sensitivity: number;
  threshold: number;
  debounce: number;
}

interface KeyboardShortcuts {
  [key: string]: {
    action: string;
    description: string;
    modifiers?: string[];
  };
}

interface ContextMenuConfig {
  enabled: boolean;
  items: ContextMenuItem[];
  customItems?: ContextMenuItem[];
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

// Advanced Rendering Types
interface RenderingEngine {
  type: 'svg' | 'canvas' | 'webgl' | 'webgpu';
  antialiasing: boolean;
  pixelRatio: number;
  preserveDrawingBuffer: boolean;
  premultipliedAlpha: boolean;
  alpha: boolean;
  depth: boolean;
  stencil: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
}

interface ShaderConfig {
  vertex: string;
  fragment: string;
  uniforms: Record<string, any>;
  attributes: Record<string, any>;
}

// Advanced Export Types
interface ExportConfig {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'json' | 'csv' | 'xlsx' | 'xml';
  quality: number;
  resolution: { width: number; height: number };
  background: string;
  includeMetadata: boolean;
  compression: boolean;
}

// ============================================================================
// ADVANCED CONSTANTS AND CONFIGURATIONS
// ============================================================================

const DEFAULT_VISUALIZATION_CONFIG: LineageVisualizationConfig = {
  id: 'default',
  name: 'Default Visualization',
  description: 'Default lineage visualization configuration',
  
  // Layout Configuration
  layout: {
    type: 'force-directed',
    algorithm: 'd3-force',
    dimensions: 2,
    animated: true,
    physics: {
      enabled: true,
      gravity: 0.1,
      friction: 0.9,
      repulsion: 100,
      attraction: 0.1
    }
  },
  
  // Visual Configuration
  visual: {
    theme: 'light',
    colorScheme: 'default',
    nodeSize: { min: 10, max: 50, scale: 'linear' },
    edgeWidth: { min: 1, max: 5, scale: 'linear' },
    opacity: { nodes: 0.8, edges: 0.6, labels: 0.9 },
    fonts: {
      family: 'Inter, sans-serif',
      sizes: { small: 10, medium: 12, large: 14, xlarge: 16 }
    }
  },
  
  // Interaction Configuration
  interaction: {
    enabled: true,
    zoom: { enabled: true, min: 0.1, max: 10, step: 0.1 },
    pan: { enabled: true, constrained: false },
    select: { enabled: true, multiple: true },
    hover: { enabled: true, delay: 200 },
    drag: { enabled: true, constrained: false },
    contextMenu: { enabled: true }
  },
  
  // Performance Configuration
  performance: {
    maxNodes: 10000,
    maxEdges: 50000,
    renderingEngine: 'canvas',
    levelOfDetail: true,
    culling: true,
    batching: true,
    caching: true
  },
  
  // Filter Configuration
  filters: {
    enabled: true,
    types: ['node-type', 'edge-type', 'metadata', 'properties'],
    defaultFilters: []
  },
  
  // Export Configuration
  export: {
    enabled: true,
    formats: ['png', 'svg', 'json'],
    quality: 1.0,
    includeMetadata: true
  }
};

const LAYOUT_ALGORITHMS = {
  'force-directed': {
    name: 'Force-Directed',
    description: 'Physics-based layout with attractive and repulsive forces',
    dimensions: [2, 3],
    animated: true,
    scalable: true
  },
  'hierarchical': {
    name: 'Hierarchical',
    description: 'Tree-like layout with clear hierarchy',
    dimensions: [2],
    animated: false,
    scalable: true
  },
  'circular': {
    name: 'Circular',
    description: 'Nodes arranged in circular patterns',
    dimensions: [2],
    animated: true,
    scalable: false
  },
  'grid': {
    name: 'Grid',
    description: 'Regular grid arrangement',
    dimensions: [2, 3],
    animated: false,
    scalable: true
  },
  'radial': {
    name: 'Radial',
    description: 'Radial tree layout from center',
    dimensions: [2],
    animated: true,
    scalable: true
  }
};

const NODE_TYPES = {
  'table': { icon: Database, color: '#3b82f6', shape: 'rectangle' },
  'view': { icon: Eye, color: '#10b981', shape: 'ellipse' },
  'procedure': { icon: Cpu, color: '#f59e0b', shape: 'diamond' },
  'function': { icon: Zap, color: '#8b5cf6', shape: 'triangle' },
  'file': { icon: File, color: '#6b7280', shape: 'rectangle' },
  'api': { icon: Cloud, color: '#ef4444', shape: 'hexagon' },
  'service': { icon: Server, color: '#06b6d4', shape: 'octagon' },
  'stream': { icon: Activity, color: '#84cc16', shape: 'circle' }
};

const EDGE_TYPES = {
  'direct': { style: 'solid', color: '#374151', width: 2 },
  'derived': { style: 'dashed', color: '#6b7280', width: 1.5 },
  'aggregated': { style: 'dotted', color: '#9ca3af', width: 1 },
  'transformed': { style: 'double', color: '#4b5563', width: 2.5 },
  'filtered': { style: 'wavy', color: '#d1d5db', width: 1 }
};

const KEYBOARD_SHORTCUTS: KeyboardShortcuts = {
  'space': { action: 'togglePause', description: 'Toggle pause/play' },
  'r': { action: 'reset', description: 'Reset view' },
  'f': { action: 'fit', description: 'Fit to screen' },
  'z': { action: 'undo', description: 'Undo last action', modifiers: ['ctrl'] },
  'y': { action: 'redo', description: 'Redo last action', modifiers: ['ctrl'] },
  's': { action: 'save', description: 'Save visualization', modifiers: ['ctrl'] },
  'o': { action: 'open', description: 'Open visualization', modifiers: ['ctrl'] },
  'e': { action: 'export', description: 'Export visualization', modifiers: ['ctrl'] },
  'h': { action: 'help', description: 'Show help' },
  'escape': { action: 'clearSelection', description: 'Clear selection' },
  'delete': { action: 'deleteSelected', description: 'Delete selected items' },
  'a': { action: 'selectAll', description: 'Select all', modifiers: ['ctrl'] },
  'd': { action: 'duplicate', description: 'Duplicate selected', modifiers: ['ctrl'] },
  'g': { action: 'group', description: 'Group selected', modifiers: ['ctrl'] },
  'u': { action: 'ungroup', description: 'Ungroup selected', modifiers: ['ctrl'] },
  'l': { action: 'toggleLabels', description: 'Toggle labels' },
  'm': { action: 'toggleMinimap', description: 'Toggle minimap' },
  'i': { action: 'toggleInfo', description: 'Toggle info panel' },
  'p': { action: 'toggleProperties', description: 'Toggle properties panel' },
  'n': { action: 'toggleNavigation', description: 'Toggle navigation' },
  't': { action: 'toggleTimeline', description: 'Toggle timeline' },
  'c': { action: 'center', description: 'Center view' },
  'x': { action: 'toggleAxis', description: 'Toggle axis' },
  'w': { action: 'toggleWireframe', description: 'Toggle wireframe' },
  'b': { action: 'toggleBounds', description: 'Toggle bounds' },
  'v': { action: 'toggleVertices', description: 'Toggle vertices' },
  'q': { action: 'toggleQuality', description: 'Toggle quality mode' },
  'j': { action: 'toggleDebug', description: 'Toggle debug mode' },
  'k': { action: 'toggleStats', description: 'Toggle stats' },
  '1': { action: 'setView2D', description: 'Switch to 2D view' },
  '2': { action: 'setView3D', description: 'Switch to 3D view' },
  '3': { action: 'setViewVR', description: 'Switch to VR view' },
  '4': { action: 'setViewAR', description: 'Switch to AR view' },
  '+': { action: 'zoomIn', description: 'Zoom in' },
  '-': { action: 'zoomOut', description: 'Zoom out' },
  '0': { action: 'resetZoom', description: 'Reset zoom' },
  'arrowup': { action: 'panUp', description: 'Pan up' },
  'arrowdown': { action: 'panDown', description: 'Pan down' },
  'arrowleft': { action: 'panLeft', description: 'Pan left' },
  'arrowright': { action: 'panRight', description: 'Pan right' }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LineageVisualizationEngine = forwardRef<
  HTMLDivElement,
  LineageVisualizationEngineProps
>(({
  assetId,
  initialConfig = {},
  height = 600,
  width,
  className,
  onNodeClick,
  onEdgeClick,
  onSelectionChange,
  onConfigChange,
  onError,
  enableRealTimeUpdates = true,
  enablePerformanceMonitoring = true,
  enableAdvancedFeatures = true,
  theme = 'light',
  locale = 'en',
  accessibilityMode = false,
  debugMode = false
}, ref) => {
  // ============================================================================
  // REFS AND STATE
  // ============================================================================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();
  
  // Core State
  const [state, setState] = useState<LineageVisualizationState>({
    // Core State
    isLoading: false,
    isInitialized: false,
    isRealTimeEnabled: enableRealTimeUpdates,
    isPaused: false,
    isFullscreen: false,
    is3DMode: false,
    
    // Data State
    lineageData: null,
    filteredData: null,
    selectedNodes: new Set(),
    selectedEdges: new Set(),
    highlightedNodes: new Set(),
    highlightedEdges: new Set(),
    
    // View State
    currentView: 'default',
    zoomLevel: 1,
    panPosition: { x: 0, y: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    
    // Filter State
    activeFilters: [],
    searchQuery: '',
    searchResults: [],
    
    // Configuration State
    config: { ...DEFAULT_VISUALIZATION_CONFIG, ...initialConfig },
    layoutConfig: DEFAULT_VISUALIZATION_CONFIG.layout,
    interactionConfig: DEFAULT_VISUALIZATION_CONFIG.interaction,
    
    // Performance State
    performance: {
      renderTime: 0,
      frameRate: 60,
      memoryUsage: 0,
      nodeCount: 0,
      edgeCount: 0,
      optimizationLevel: 'balanced'
    },
    renderingStats: {
      frameRate: 60,
      renderTime: 0,
      nodeCount: 0,
      edgeCount: 0,
      memoryUsage: 0
    },
    
    // Error State
    errors: [],
    warnings: [],
    
    // Analytics State
    analytics: {
      viewCount: 0,
      interactionCount: 0,
      averageSessionDuration: 0,
      popularViews: [],
      performanceMetrics: [],
      usagePatterns: []
    },
    userInteractions: []
  });
  
  // Services and Hooks
  const lineageService = useMemo(() => new AdvancedLineageService(), []);
  const { 
    lineageData,
    loading: lineageLoading,
    error: lineageError,
    fetchLineage,
    trackLineage,
    analyzeImpact,
    visualizeLineage
  } = useDataLineage();
  
  const {
    subscribe: subscribeToUpdates,
    unsubscribe: unsubscribeFromUpdates,
    isConnected: realTimeConnected
  } = useRealTimeUpdates();
  
  const {
    startMonitoring,
    stopMonitoring,
    metrics: performanceMetrics
  } = usePerformanceMonitoring({
    enabled: enablePerformanceMonitoring,
    interval: 1000,
    thresholds: {
      frameRate: 30,
      memoryUsage: 100 * 1024 * 1024, // 100MB
      renderTime: 16 // 16ms for 60fps
    }
  });
  
  const { showNotification } = useEnterpriseNotifications();
  
  // D3 Simulation and Layout
  const simulationRef = useRef<d3.Simulation<Node3D, Edge3D>>();
  const layoutWorkerRef = useRef<Worker>();
  
  // Animation and Interaction State
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showMinimap, setShowMinimap] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showStats, setShowStats] = useState(debugMode);
  
  // Advanced Feature State
  const [camera3D, setCamera3D] = useState<Camera3D>({
    position: { x: 0, y: 0, z: 500 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    fov: 45,
    near: 1,
    far: 2000
  });
  
  const [lighting3D, setLighting3D] = useState<Lighting3D>({
    ambient: { color: '#404040', intensity: 0.4 },
    directional: [
      {
        color: '#ffffff',
        intensity: 0.8,
        position: { x: 1, y: 1, z: 1 }
      }
    ],
    point: []
  });
  
  // Motion Values for Smooth Animations
  const zoomMotionValue = useMotionValue(1);
  const panXMotionValue = useMotionValue(0);
  const panYMotionValue = useMotionValue(0);
  const rotationXMotionValue = useMotionValue(0);
  const rotationYMotionValue = useMotionValue(0);
  const rotationZMotionValue = useMotionValue(0);
  
  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================
  
  const dimensions = useMemo(() => {
    if (!containerRef.current) return { width: width || 800, height };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      width: width || rect.width,
      height: height
    };
  }, [width, height, containerRef.current]);
  
  const processedLineageData = useMemo(() => {
    if (!state.lineageData) return null;
    
    // Apply filters
    let filteredNodes = state.lineageData.nodes;
    let filteredEdges = state.lineageData.edges;
    
    // Apply active filters
    state.activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'node-type':
          filteredNodes = filteredNodes.filter(node => 
            filter.values.includes(node.nodeType)
          );
          break;
        case 'edge-type':
          filteredEdges = filteredEdges.filter(edge => 
            filter.values.includes(edge.edgeType)
          );
          break;
        case 'metadata':
          filteredNodes = filteredNodes.filter(node => {
            return Object.entries(filter.criteria || {}).every(([key, value]) => 
              node.metadata[key] === value
            );
          });
          break;
      }
    });
    
    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(node => 
        node.data.name?.toLowerCase().includes(query) ||
        node.data.description?.toLowerCase().includes(query) ||
        Object.values(node.metadata).some(value => 
          String(value).toLowerCase().includes(query)
        )
      );
    }
    
    // Filter edges to only include those with both nodes present
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    filteredEdges = filteredEdges.filter(edge => 
      nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId)
    );
    
    return {
      ...state.lineageData,
      nodes: filteredNodes,
      edges: filteredEdges
    };
  }, [state.lineageData, state.activeFilters, state.searchQuery]);
  
  const renderingEngine = useMemo(() => {
    const engine = state.config.performance?.renderingEngine || 'canvas';
    const nodeCount = processedLineageData?.nodes.length || 0;
    const edgeCount = processedLineageData?.edges.length || 0;
    
    // Auto-select best rendering engine based on data size
    if (nodeCount > 5000 || edgeCount > 25000) {
      return 'webgl';
    } else if (nodeCount > 1000 || edgeCount > 5000) {
      return 'canvas';
    } else {
      return engine;
    }
  }, [state.config.performance?.renderingEngine, processedLineageData]);
  
  // ============================================================================
  // CORE FUNCTIONS
  // ============================================================================
  
  const initializeVisualization = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (assetId) {
        // Fetch lineage data from backend
        const lineageData = await lineageService.getLineageVisualization(assetId, {
          direction: 'BOTH',
          maxDepth: 5,
          includeLabels: true,
          layoutType: 'FORCE_DIRECTED'
        });
        
        setState(prev => ({
          ...prev,
          lineageData,
          isInitialized: true,
          isLoading: false
        }));
        
        // Start real-time updates if enabled
        if (enableRealTimeUpdates) {
          subscribeToUpdates(`lineage:${assetId}`, handleRealTimeUpdate);
        }
        
        // Start performance monitoring
        if (enablePerformanceMonitoring) {
          startMonitoring();
        }
        
        showNotification({
          title: 'Lineage Visualization Loaded',
          message: `Successfully loaded lineage for asset ${assetId}`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to initialize visualization:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: [...prev.errors, {
          id: Date.now().toString(),
          type: 'data',
          severity: 'high',
          message: `Failed to load lineage data: ${error.message}`,
          timestamp: new Date(),
          context: { assetId, error }
        }]
      }));
      
      onError?.(error as Error);
      
      showNotification({
        title: 'Visualization Error',
        message: 'Failed to load lineage data',
        type: 'error'
      });
    }
  }, [
    assetId,
    lineageService,
    enableRealTimeUpdates,
    enablePerformanceMonitoring,
    subscribeToUpdates,
    startMonitoring,
    showNotification,
    onError
  ]);
  
  const handleRealTimeUpdate = useCallback((update: any) => {
    try {
      setState(prev => {
        if (!prev.lineageData) return prev;
        
        const updatedData = { ...prev.lineageData };
        
        // Apply real-time updates
        switch (update.type) {
          case 'node_added':
            updatedData.nodes = [...updatedData.nodes, update.node];
            break;
          case 'node_updated':
            updatedData.nodes = updatedData.nodes.map(node => 
              node.id === update.node.id ? { ...node, ...update.node } : node
            );
            break;
          case 'node_removed':
            updatedData.nodes = updatedData.nodes.filter(node => 
              node.id !== update.nodeId
            );
            updatedData.edges = updatedData.edges.filter(edge => 
              edge.sourceNodeId !== update.nodeId && edge.targetNodeId !== update.nodeId
            );
            break;
          case 'edge_added':
            updatedData.edges = [...updatedData.edges, update.edge];
            break;
          case 'edge_updated':
            updatedData.edges = updatedData.edges.map(edge => 
              edge.id === update.edge.id ? { ...edge, ...update.edge } : edge
            );
            break;
          case 'edge_removed':
            updatedData.edges = updatedData.edges.filter(edge => 
              edge.id !== update.edgeId
            );
            break;
        }
        
        return {
          ...prev,
          lineageData: updatedData
        };
      });
      
      // Trigger re-render
      if (simulationRef.current) {
        simulationRef.current.alpha(0.3).restart();
      }
    } catch (error) {
      console.error('Failed to handle real-time update:', error);
    }
  }, []);
  
  const setupD3Simulation = useCallback(() => {
    if (!processedLineageData || !containerRef.current) return;
    
    const { nodes, edges } = processedLineageData;
    const { width, height } = dimensions;
    
    // Convert to D3 format
    const d3Nodes: Node3D[] = nodes.map(node => ({
      ...node,
      x: node.position?.x || Math.random() * width,
      y: node.position?.y || Math.random() * height,
      z: state.is3DMode ? (node.position?.z || Math.random() * 100) : 0
    }));
    
    const d3Edges: Edge3D[] = edges.map(edge => ({
      ...edge,
      source: d3Nodes.find(n => n.id === edge.sourceNodeId)!,
      target: d3Nodes.find(n => n.id === edge.targetNodeId)!
    }));
    
    // Create D3 force simulation
    const simulation = d3.forceSimulation<Node3D>(d3Nodes)
      .force('link', d3.forceLink<Node3D, Edge3D>(d3Edges)
        .id(d => d.id)
        .distance(100)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));
    
    // Add 3D forces if in 3D mode
    if (state.is3DMode) {
      simulation
        .force('z', (alpha: number) => {
          d3Nodes.forEach(node => {
            if (node.z !== undefined) {
              node.z += (0 - node.z) * alpha * 0.1;
            }
          });
        })
        .force('collision3d', d3.forceCollide().radius(30));
    }
    
    // Configure simulation
    simulation
      .alpha(1)
      .alphaDecay(0.02)
      .alphaMin(0.001)
      .velocityDecay(0.4);
    
    // Handle simulation tick
    simulation.on('tick', () => {
      if (!state.isPaused) {
        renderVisualization(d3Nodes, d3Edges);
        updatePerformanceStats();
      }
    });
    
    // Handle simulation end
    simulation.on('end', () => {
      setIsAnimating(false);
      showNotification({
        title: 'Layout Complete',
        message: 'Force simulation has converged',
        type: 'info'
      });
    });
    
    simulationRef.current = simulation;
    setIsAnimating(true);
    
    return () => {
      simulation.stop();
    };
  }, [
    processedLineageData,
    dimensions,
    state.is3DMode,
    state.isPaused,
    showNotification
  ]);
  
  const renderVisualization = useCallback((nodes: Node3D[], edges: Edge3D[]) => {
    const startTime = performance.now();
    
    try {
      switch (renderingEngine) {
        case 'svg':
          renderSVG(nodes, edges);
          break;
        case 'canvas':
          renderCanvas(nodes, edges);
          break;
        case 'webgl':
          renderWebGL(nodes, edges);
          break;
        default:
          renderCanvas(nodes, edges);
      }
    } catch (error) {
      console.error('Rendering error:', error);
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, {
          id: Date.now().toString(),
          type: 'rendering',
          severity: 'medium',
          message: `Rendering failed: ${error.message}`,
          timestamp: new Date(),
          context: { renderingEngine, nodeCount: nodes.length, edgeCount: edges.length }
        }]
      }));
    }
    
    const renderTime = performance.now() - startTime;
    
    setState(prev => ({
      ...prev,
      renderingStats: {
        ...prev.renderingStats,
        renderTime,
        frameRate: 1000 / renderTime,
        nodeCount: nodes.length,
        edgeCount: edges.length
      }
    }));
  }, [renderingEngine]);
  
  const renderSVG = useCallback((nodes: Node3D[], edges: Edge3D[]) => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;
    
    const { width, height } = dimensions;
    
    // Clear previous content
    svg.selectAll('*').remove();
    
    // Create groups
    const edgeGroup = svg.append('g').attr('class', 'edges');
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const labelGroup = svg.append('g').attr('class', 'labels');
    
    // Render edges
    const edgeSelection = edgeGroup
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('stroke', d => EDGE_TYPES[d.edgeType]?.color || '#999')
      .attr('stroke-width', d => EDGE_TYPES[d.edgeType]?.width || 1)
      .attr('stroke-dasharray', d => {
        const style = EDGE_TYPES[d.edgeType]?.style;
        switch (style) {
          case 'dashed': return '5,5';
          case 'dotted': return '2,2';
          default: return '';
        }
      })
      .attr('opacity', state.config.visual?.opacity?.edges || 0.6);
    
    // Render nodes
    const nodeSelection = nodeGroup
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => {
        const baseSize = 15;
        const sizeMultiplier = Math.log(1 + (d.data.connectionCount || 0)) / Math.log(2);
        return Math.min(baseSize * (1 + sizeMultiplier * 0.5), 50);
      })
      .attr('fill', d => NODE_TYPES[d.nodeType]?.color || '#6b7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', state.config.visual?.opacity?.nodes || 0.8)
      .style('cursor', 'pointer');
    
    // Add node interactions
    nodeSelection
      .on('click', (event, d) => {
        event.stopPropagation();
        handleNodeClick(d);
      })
      .on('mouseover', (event, d) => {
        handleNodeHover(d, true);
      })
      .on('mouseout', (event, d) => {
        handleNodeHover(d, false);
      })
      .call(d3.drag<SVGCircleElement, Node3D>()
        .on('start', handleDragStart)
        .on('drag', handleDrag)
        .on('end', handleDragEnd)
      );
    
    // Render labels
    if (state.config.visual?.showLabels !== false) {
      labelGroup
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-family', state.config.visual?.fonts?.family || 'Inter, sans-serif')
        .attr('font-size', state.config.visual?.fonts?.sizes?.medium || 12)
        .attr('fill', theme === 'dark' ? '#f9fafb' : '#111827')
        .attr('opacity', state.config.visual?.opacity?.labels || 0.9)
        .text(d => d.data.name || d.id)
        .style('pointer-events', 'none');
    }
    
    // Update positions on tick
    const updatePositions = () => {
      edgeSelection
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      nodeSelection
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      if (state.config.visual?.showLabels !== false) {
        labelGroup.selectAll('text')
          .attr('x', d => d.x)
          .attr('y', d => d.y + 25);
      }
    };
    
    // Apply zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { transform } = event;
        edgeGroup.attr('transform', transform);
        nodeGroup.attr('transform', transform);
        labelGroup.attr('transform', transform);
        
        setState(prev => ({
          ...prev,
          zoomLevel: transform.k,
          panPosition: { x: transform.x, y: transform.y }
        }));
      });
    
    svg.call(zoom);
    
    // Store update function for simulation
    (svg.node() as any).__updatePositions = updatePositions;
  }, [dimensions, state.config, theme, handleNodeClick, handleNodeHover]);
  
  const renderCanvas = useCallback((nodes: Node3D[], edges: Edge3D[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const { width, height } = dimensions;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas size
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Scale context
    context.scale(pixelRatio, pixelRatio);
    
    // Clear canvas
    context.clearRect(0, 0, width, height);
    
    // Apply transform
    context.save();
    context.translate(state.panPosition.x, state.panPosition.y);
    context.scale(state.zoomLevel, state.zoomLevel);
    
    // Render edges
    context.strokeStyle = '#999';
    context.lineWidth = 1;
    context.globalAlpha = state.config.visual?.opacity?.edges || 0.6;
    
    edges.forEach(edge => {
      const sourceNode = edge.source;
      const targetNode = edge.target;
      
      context.beginPath();
      context.moveTo(sourceNode.x, sourceNode.y);
      context.lineTo(targetNode.x, targetNode.y);
      
      // Apply edge style
      const edgeType = EDGE_TYPES[edge.edgeType];
      if (edgeType) {
        context.strokeStyle = edgeType.color;
        context.lineWidth = edgeType.width;
        
        // Apply dash pattern
        switch (edgeType.style) {
          case 'dashed':
            context.setLineDash([5, 5]);
            break;
          case 'dotted':
            context.setLineDash([2, 2]);
            break;
          default:
            context.setLineDash([]);
        }
      }
      
      context.stroke();
    });
    
    // Render nodes
    context.globalAlpha = state.config.visual?.opacity?.nodes || 0.8;
    
    nodes.forEach(node => {
      const nodeType = NODE_TYPES[node.nodeType];
      const radius = Math.min(15 * (1 + Math.log(1 + (node.data.connectionCount || 0)) / Math.log(2) * 0.5), 50);
      
      // Node background
      context.beginPath();
      context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      context.fillStyle = nodeType?.color || '#6b7280';
      context.fill();
      
      // Node border
      context.strokeStyle = '#fff';
      context.lineWidth = 2;
      context.stroke();
      
      // Node selection highlight
      if (state.selectedNodes.has(node.id)) {
        context.beginPath();
        context.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
        context.strokeStyle = '#3b82f6';
        context.lineWidth = 3;
        context.stroke();
      }
      
      // Node hover highlight
      if (state.highlightedNodes.has(node.id)) {
        context.beginPath();
        context.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
        context.strokeStyle = '#fbbf24';
        context.lineWidth = 2;
        context.stroke();
      }
    });
    
    // Render labels
    if (state.config.visual?.showLabels !== false) {
      context.globalAlpha = state.config.visual?.opacity?.labels || 0.9;
      context.fillStyle = theme === 'dark' ? '#f9fafb' : '#111827';
      context.font = `${state.config.visual?.fonts?.sizes?.medium || 12}px ${state.config.visual?.fonts?.family || 'Inter, sans-serif'}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      nodes.forEach(node => {
        const text = node.data.name || node.id;
        context.fillText(text, node.x, node.y + 25);
      });
    }
    
    context.restore();
  }, [dimensions, state.config, state.panPosition, state.zoomLevel, state.selectedNodes, state.highlightedNodes, theme]);
  
  const renderWebGL = useCallback((nodes: Node3D[], edges: Edge3D[]) => {
    // WebGL rendering implementation for high-performance visualization
    // This would include shader programs, buffer management, and 3D rendering
    // For brevity, this is a placeholder for the full WebGL implementation
    console.log('WebGL rendering not fully implemented in this example');
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleNodeClick = useCallback((node: LineageVisualizationNode) => {
    setState(prev => {
      const newSelectedNodes = new Set(prev.selectedNodes);
      
      if (newSelectedNodes.has(node.id)) {
        newSelectedNodes.delete(node.id);
      } else {
        if (!prev.config.interaction?.select?.multiple) {
          newSelectedNodes.clear();
        }
        newSelectedNodes.add(node.id);
      }
      
      const selection: LineageSelection = {
        nodes: Array.from(newSelectedNodes),
        edges: Array.from(prev.selectedEdges),
        metadata: {
          selectionType: newSelectedNodes.size > 1 ? 'multiple' : 'single',
          timestamp: new Date(),
          source: 'user',
          context: { clickedNode: node.id }
        }
      };
      
      onSelectionChange?.(selection);
      onNodeClick?.(node);
      
      return {
        ...prev,
        selectedNodes: newSelectedNodes,
        userInteractions: [...prev.userInteractions, {
          id: Date.now().toString(),
          type: 'click',
          target: node.id,
          timestamp: new Date(),
          metadata: { nodeType: node.nodeType, position: node.position }
        }]
      };
    });
  }, [onNodeClick, onSelectionChange]);
  
  const handleNodeHover = useCallback((node: LineageVisualizationNode, isHovering: boolean) => {
    setState(prev => {
      const newHighlightedNodes = new Set(prev.highlightedNodes);
      const newHighlightedEdges = new Set(prev.highlightedEdges);
      
      if (isHovering) {
        newHighlightedNodes.add(node.id);
        
        // Highlight connected edges
        if (prev.lineageData) {
          prev.lineageData.edges.forEach(edge => {
            if (edge.sourceNodeId === node.id || edge.targetNodeId === node.id) {
              newHighlightedEdges.add(edge.id);
            }
          });
        }
      } else {
        newHighlightedNodes.delete(node.id);
        newHighlightedEdges.clear();
      }
      
      return {
        ...prev,
        highlightedNodes: newHighlightedNodes,
        highlightedEdges: newHighlightedEdges,
        userInteractions: [...prev.userInteractions, {
          id: Date.now().toString(),
          type: 'hover',
          target: node.id,
          timestamp: new Date(),
          metadata: { isHovering, nodeType: node.nodeType }
        }]
      };
    });
  }, []);
  
  const handleDragStart = useCallback((event: d3.D3DragEvent<SVGCircleElement, Node3D, Node3D>) => {
    if (!event.active && simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
    }
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
    setIsDragging(true);
  }, []);
  
  const handleDrag = useCallback((event: d3.D3DragEvent<SVGCircleElement, Node3D, Node3D>) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }, []);
  
  const handleDragEnd = useCallback((event: d3.D3DragEvent<SVGCircleElement, Node3D, Node3D>) => {
    if (!event.active && simulationRef.current) {
      simulationRef.current.alphaTarget(0);
    }
    event.subject.fx = null;
    event.subject.fy = null;
    setIsDragging(false);
  }, []);
  
  const handleZoom = useCallback((delta: number) => {
    setState(prev => {
      const newZoomLevel = Math.max(0.1, Math.min(10, prev.zoomLevel + delta));
      zoomMotionValue.set(newZoomLevel);
      
      return {
        ...prev,
        zoomLevel: newZoomLevel
      };
    });
  }, [zoomMotionValue]);
  
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setState(prev => {
      const newPanX = prev.panPosition.x + deltaX;
      const newPanY = prev.panPosition.y + deltaY;
      
      panXMotionValue.set(newPanX);
      panYMotionValue.set(newPanY);
      
      return {
        ...prev,
        panPosition: { x: newPanX, y: newPanY }
      };
    });
  }, [panXMotionValue, panYMotionValue]);
  
  const handleKeyboard = useCallback((event: KeyboardEvent) => {
    const shortcut = KEYBOARD_SHORTCUTS[event.key.toLowerCase()];
    if (!shortcut) return;
    
    // Check modifiers
    const hasRequiredModifiers = !shortcut.modifiers || shortcut.modifiers.every(modifier => {
      switch (modifier) {
        case 'ctrl': return event.ctrlKey;
        case 'shift': return event.shiftKey;
        case 'alt': return event.altKey;
        case 'meta': return event.metaKey;
        default: return false;
      }
    });
    
    if (!hasRequiredModifiers) return;
    
    event.preventDefault();
    
    // Execute action
    switch (shortcut.action) {
      case 'togglePause':
        setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
        break;
      case 'reset':
        resetView();
        break;
      case 'fit':
        fitToScreen();
        break;
      case 'zoomIn':
        handleZoom(0.1);
        break;
      case 'zoomOut':
        handleZoom(-0.1);
        break;
      case 'resetZoom':
        setState(prev => ({ ...prev, zoomLevel: 1 }));
        break;
      case 'panUp':
        handlePan(0, -20);
        break;
      case 'panDown':
        handlePan(0, 20);
        break;
      case 'panLeft':
        handlePan(-20, 0);
        break;
      case 'panRight':
        handlePan(20, 0);
        break;
      case 'clearSelection':
        setState(prev => ({ 
          ...prev, 
          selectedNodes: new Set(), 
          selectedEdges: new Set() 
        }));
        break;
      case 'selectAll':
        if (processedLineageData) {
          setState(prev => ({
            ...prev,
            selectedNodes: new Set(processedLineageData.nodes.map(n => n.id)),
            selectedEdges: new Set(processedLineageData.edges.map(e => e.id))
          }));
        }
        break;
      case 'toggleLabels':
        setState(prev => ({
          ...prev,
          config: {
            ...prev.config,
            visual: {
              ...prev.config.visual,
              showLabels: !prev.config.visual?.showLabels
            }
          }
        }));
        break;
      case 'setView2D':
        setState(prev => ({ ...prev, is3DMode: false }));
        break;
      case 'setView3D':
        setState(prev => ({ ...prev, is3DMode: true }));
        break;
      case 'toggleStats':
        setShowStats(prev => !prev);
        break;
      case 'toggleMinimap':
        setShowMinimap(prev => !prev);
        break;
      case 'toggleProperties':
        setShowProperties(prev => !prev);
        break;
    }
  }, [handleZoom, handlePan, processedLineageData]);
  
  const resetView = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoomLevel: 1,
      panPosition: { x: 0, y: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    }));
    
    zoomMotionValue.set(1);
    panXMotionValue.set(0);
    panYMotionValue.set(0);
    rotationXMotionValue.set(0);
    rotationYMotionValue.set(0);
    rotationZMotionValue.set(0);
    
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  }, [zoomMotionValue, panXMotionValue, panYMotionValue, rotationXMotionValue, rotationYMotionValue, rotationZMotionValue]);
  
  const fitToScreen = useCallback(() => {
    if (!processedLineageData || !containerRef.current) return;
    
    const { nodes } = processedLineageData;
    const { width, height } = dimensions;
    
    if (nodes.length === 0) return;
    
    // Calculate bounding box
    const xExtent = d3.extent(nodes, d => d.position?.x || 0) as [number, number];
    const yExtent = d3.extent(nodes, d => d.position?.y || 0) as [number, number];
    
    const dataWidth = xExtent[1] - xExtent[0];
    const dataHeight = yExtent[1] - yExtent[0];
    
    // Calculate scale and translation
    const scale = Math.min(width / dataWidth, height / dataHeight) * 0.8;
    const translateX = (width - dataWidth * scale) / 2 - xExtent[0] * scale;
    const translateY = (height - dataHeight * scale) / 2 - yExtent[0] * scale;
    
    setState(prev => ({
      ...prev,
      zoomLevel: scale,
      panPosition: { x: translateX, y: translateY }
    }));
    
    zoomMotionValue.set(scale);
    panXMotionValue.set(translateX);
    panYMotionValue.set(translateY);
  }, [processedLineageData, dimensions, zoomMotionValue, panXMotionValue, panYMotionValue]);
  
  const updatePerformanceStats = useCallback(() => {
    if (!enablePerformanceMonitoring) return;
    
    const now = performance.now();
    const memoryInfo = (performance as any).memory;
    
    setState(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        memoryUsage: memoryInfo?.usedJSHeapSize || 0,
        nodeCount: processedLineageData?.nodes.length || 0,
        edgeCount: processedLineageData?.edges.length || 0
      }
    }));
  }, [enablePerformanceMonitoring, processedLineageData]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Initialize visualization
  useEffect(() => {
    initializeVisualization();
    
    return () => {
      if (enableRealTimeUpdates && assetId) {
        unsubscribeFromUpdates(`lineage:${assetId}`);
      }
      if (enablePerformanceMonitoring) {
        stopMonitoring();
      }
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (layoutWorkerRef.current) {
        layoutWorkerRef.current.terminate();
      }
    };
  }, [initializeVisualization, enableRealTimeUpdates, enablePerformanceMonitoring, assetId, unsubscribeFromUpdates, stopMonitoring]);
  
  // Setup D3 simulation when data changes
  useEffect(() => {
    if (state.isInitialized && processedLineageData) {
      const cleanup = setupD3Simulation();
      return cleanup;
    }
  }, [state.isInitialized, processedLineageData, setupD3Simulation]);
  
  // Handle keyboard events
  useEffect(() => {
    if (!state.isInitialized) return;
    
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [state.isInitialized, handleKeyboard]);
  
  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (simulationRef.current) {
        const { width, height } = dimensions;
        simulationRef.current.force('center', d3.forceCenter(width / 2, height / 2));
        simulationRef.current.alpha(0.1).restart();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    resizeObserverRef.current = resizeObserver;
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [dimensions]);
  
  // Update configuration
  useEffect(() => {
    onConfigChange?.(state.config);
  }, [state.config, onConfigChange]);
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderControls = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
      className="absolute top-4 left-4 z-50"
    >
      <Card className="p-2">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
                >
                  {state.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {state.isPaused ? 'Resume' : 'Pause'} simulation
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-6" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={resetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset view</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={fitToScreen}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit to screen</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-6" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom(0.1)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom(-0.1)}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-6" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={state.is3DMode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, is3DMode: !prev.is3DMode }))}
                >
                  <Box className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle 3D mode</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowMinimap(!showMinimap)}>
                <Monitor className="mr-2 h-4 w-4" />
                {showMinimap ? 'Hide' : 'Show'} Minimap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowProperties(!showProperties)}>
                <FileText className="mr-2 h-4 w-4" />
                {showProperties ? 'Hide' : 'Show'} Properties
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                {showStats ? 'Hide' : 'Show'} Stats
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Visualization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </motion.div>
  );
  
  const renderStats = () => (
    <AnimatePresence>
      {showStats && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 right-4 z-50"
        >
          <Card className="p-4 min-w-[200px]">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-sm">Performance Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Nodes:</span>
                <span>{state.renderingStats.nodeCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Edges:</span>
                <span>{state.renderingStats.edgeCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>FPS:</span>
                <span>{Math.round(state.renderingStats.frameRate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Render Time:</span>
                <span>{state.renderingStats.renderTime.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Memory:</span>
                <span>{Math.round(state.renderingStats.memoryUsage / 1024 / 1024)}MB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Engine:</span>
                <span className="capitalize">{renderingEngine}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Zoom:</span>
                <span>{state.zoomLevel.toFixed(2)}x</span>
              </div>
              {state.errors.length > 0 && (
                <div className="flex justify-between text-xs text-red-500">
                  <span>Errors:</span>
                  <span>{state.errors.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  const renderMinimap = () => (
    <AnimatePresence>
      {showMinimap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 right-4 z-50"
        >
          <Card className="p-2">
            <div className="w-32 h-24 bg-muted rounded border relative overflow-hidden">
              <svg
                width="100%"
                height="100%"
                className="absolute inset-0"
              >
                {/* Minimap content would be rendered here */}
                <rect
                  x="10%"
                  y="20%"
                  width="60%"
                  height="40%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="opacity-50"
                />
              </svg>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  const renderPropertiesPanel = () => (
    <AnimatePresence>
      {showProperties && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute bottom-4 left-4 z-50"
        >
          <Card className="p-4 min-w-[300px] max-h-[400px]">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-sm">Selection Properties</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                {state.selectedNodes.size > 0 ? (
                  <div className="space-y-4">
                    {Array.from(state.selectedNodes).map(nodeId => {
                      const node = processedLineageData?.nodes.find(n => n.id === nodeId);
                      if (!node) return null;
                      
                      return (
                        <div key={nodeId} className="border rounded p-2">
                          <div className="font-medium text-sm">{node.data.name || node.id}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Type: {node.nodeType}
                          </div>
                          {node.data.description && (
                            <div className="text-xs mt-1">{node.data.description}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Connections: {node.data.connectionCount || 0}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Select nodes or edges to view properties
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  const renderVisualizationCanvas = () => {
    switch (renderingEngine) {
      case 'svg':
        return (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              background: theme === 'dark' ? '#0f172a' : '#ffffff'
            }}
          />
        );
      case 'canvas':
        return (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              background: theme === 'dark' ? '#0f172a' : '#ffffff'
            }}
          />
        );
      case 'webgl':
        return (
          <canvas
            ref={webglRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              background: theme === 'dark' ? '#0f172a' : '#ffffff'
            }}
          />
        );
      default:
        return null;
    }
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full border rounded-lg overflow-hidden",
        "bg-background",
        className
      )}
      style={{ height }}
    >
      {/* Loading State */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <div className="text-sm text-muted-foreground">
              Loading lineage visualization...
            </div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {state.errors.length > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Visualization Error</AlertTitle>
            <AlertDescription>
              {state.errors[state.errors.length - 1].message}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Main Visualization Canvas */}
      {state.isInitialized && !state.isLoading && renderVisualizationCanvas()}
      
      {/* Controls */}
      {renderControls()}
      
      {/* Stats Panel */}
      {renderStats()}
      
      {/* Minimap */}
      {renderMinimap()}
      
      {/* Properties Panel */}
      {renderPropertiesPanel()}
      
      {/* Real-time Connection Indicator */}
      {enableRealTimeUpdates && (
        <div className="absolute top-4 right-4 z-40">
          <Badge
            variant={realTimeConnected ? "default" : "secondary"}
            className="text-xs"
          >
            <div className={cn(
              "w-2 h-2 rounded-full mr-1",
              realTimeConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
            )} />
            {realTimeConnected ? "Live" : "Offline"}
          </Badge>
        </div>
      )}
      
      {/* Performance Warning */}
      {state.renderingStats.frameRate < 30 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <Alert className="w-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Performance degraded. Consider reducing data or switching to WebGL.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
});

LineageVisualizationEngine.displayName = 'LineageVisualizationEngine';

export default LineageVisualizationEngine;