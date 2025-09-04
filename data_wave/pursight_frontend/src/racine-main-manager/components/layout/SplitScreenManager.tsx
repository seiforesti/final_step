/**
 * SplitScreenManager.tsx - Enterprise Split Screen System (1800+ lines)
 * ====================================================================
 *
 * Advanced split screen management system providing intelligent multi-pane layouts
 * with dynamic resizing, cross-SPA integration, and AI-powered pane optimization.
 * Designed to surpass industry standards with enterprise-grade collaboration.
 *
 * Key Features:
 * - Intelligent multi-pane split screen management (2-8 panes)
 * - Dynamic pane resizing with collision detection and constraints
 * - Cross-SPA pane integration with seamless transitions
 * - Real-time collaborative pane editing and synchronization
 * - AI-powered pane layout optimization and recommendations
 * - Advanced split configurations (horizontal, vertical, grid, custom)
 * - Pane persistence and restoration across sessions
 * - Performance monitoring and optimization for complex layouts
 *
 * Backend Integration:
 * - Maps to: RacineLayoutService split screen management
 * - Uses: workspace-management-apis.ts, ai-assistant-apis.ts
 * - Types: SplitConfiguration, PaneLayout, SplitScreenState
 */

'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  createContext,
  useContext,
  MouseEvent,
  TouchEvent,
  KeyboardEvent
} from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useDragControls,
  PanInfo
} from 'framer-motion';
import { Split, Columns, Rows, Grid3X3, Maximize2, Minimize2, Move, RotateCcw, RotateCw, Copy, Trash2, Plus, Minus, Settings, Lock, Unlock, Eye, EyeOff, Layers, Target, Crosshair, MousePointer, Grab, Palette, Brush, Wand2, Sparkles, Brain, Zap, Activity, BarChart3, TrendingUp, Clock, History, RefreshCw, AlertTriangle, CheckCircle, Info, HelpCircle, Search, Filter, SortAsc, MoreHorizontal, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowLeftRight, ArrowUpDown, Square, Rectangle, Monitor, Smartphone, Tablet, Users, Share2, Save, Upload, Download } from 'lucide-react';

// Shadcn/UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Racine Type Imports
import {
  LayoutConfiguration,
  ViewConfiguration,
  UserContext,
  WorkspaceContext,
  PerformanceMetrics,
  UUID,
  ISODateString,
  JSONValue,
  LayoutMode,
  ResponsiveBreakpoint,
  ComponentConfiguration
} from '../../types/racine-core.types';

import {
  SplitScreenCreateRequest,
  SplitScreenUpdateRequest,
  PaneConfigurationRequest,
  SplitScreenOptimizationRequest,
  SplitScreenCollaborationRequest
} from '../../types/api.types';

// Racine Service Imports
import { workspaceManagementAPI } from '../../services/workspace-management-apis';
import { aiAssistantAPI } from '../../services/ai-assistant-apis';
import { collaborationAPI } from '../../services/collaboration-apis';
import { crossGroupIntegrationAPI } from '../../services/cross-group-integration-apis';

// Racine Hook Imports
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// Racine Utility Imports
import {
  splitScreenUtils,
  calculateOptimalSplit,
  validateSplitConfiguration,
  optimizeSplitPerformance
} from '../../utils/split-screen-utils';

import {
  paneUtils,
  createPaneLayout,
  resizePanes,
  validatePaneConstraints
} from '../../utils/pane-utils';

import {
  layoutEngine,
  applyLayoutTransitions,
  validateLayoutState
} from '../../utils/layout-engine';

// Racine Constants
import {
  SPLIT_SCREEN_TEMPLATES,
  PANE_CONFIGURATIONS,
  SPLIT_ANIMATIONS,
  RESIZE_CONSTRAINTS
} from '../../constants/split-screen-configs';

import {
  PERFORMANCE_THRESHOLDS,
  COLLABORATION_CONFIG,
  ACCESSIBILITY_STANDARDS
} from '../../constants/cross-group-configs';

// =============================================================================
// SPLIT SCREEN INTERFACES & TYPES
// =============================================================================

export interface SplitScreenManagerProps {
  activeViews: ViewConfiguration[];
  layoutMode: LayoutMode;
  currentLayout: LayoutConfiguration;
  userContext: UserContext;
  workspaceContext: WorkspaceContext;
  onSplitAction: (action: SplitAction, context: SplitActionContext) => void;
  onLayoutChange: (newLayout: LayoutConfiguration) => void;
  className?: string;
}

export interface SplitScreenState {
  // Split configuration
  splitConfiguration: SplitConfiguration;
  paneLayouts: PaneLayout[];
  activePaneId: UUID | null;
  selectedPanes: UUID[];

  // Split types and modes
  splitType: SplitType;
  splitOrientation: SplitOrientation;
  maxPanes: number;
  minPaneSize: number;
  resizeThreshold: number;

  // Pane management
  paneHistory: PaneHistoryEntry[];
  paneTemplates: PaneTemplate[];
  customSplitLayouts: CustomSplitLayout[];

  // Drag and resize state
  isResizing: boolean;
  resizingPaneId: UUID | null;
  resizeDirection: ResizeDirection | null;
  dragStartPosition: { x: number; y: number };

  // Collaboration state
  collaborativePanes: CollaborativePaneState[];
  paneCollaborators: PaneCollaborator[];
  realTimePaneEdits: RealTimePaneEdit[];

  // AI optimization
  aiSplitRecommendations: SplitRecommendation[];
  autoOptimizeLayout: boolean;
  optimizationHistory: SplitOptimizationHistory[];

  // Performance monitoring
  splitPerformance: SplitPerformanceMetrics;
  panePerformance: Record<UUID, PanePerformanceMetrics>;
  renderingOptimization: RenderingOptimization;

  // Accessibility and interaction
  keyboardNavigation: boolean;
  touchGestureSupport: boolean;
  screenReaderOptimized: boolean;
  focusManagement: FocusManagementState;

  // Animation and transitions
  animationsEnabled: boolean;
  transitionDuration: number;
  easingFunction: string;
  parallelAnimations: boolean;

  // Error handling and recovery
  splitErrors: SplitScreenError[];
  paneErrors: PaneError[];
  fallbackMode: boolean;
  lastSuccessfulSplit: ISODateString;

  // UI state
  splitControlsVisible: boolean;
  paneToolbarVisible: boolean;
  resizeHandlesVisible: boolean;
  splitPreviewVisible: boolean;
}

export interface PaneConfiguration {
  id: UUID;
  name: string;
  type: PaneType;
  content: PaneContent;
  position: PanePosition;
  size: PaneSize;
  constraints: PaneConstraints;
  permissions: string[];
  collaborators: UUID[];
  isActive: boolean;
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
  isLocked: boolean;
  zIndex: number;
  opacity: number;
  rotation: number;
  scale: number;
}

export interface SplitLayout {
  id: UUID;
  name: string;
  description: string;
  splitType: SplitType;
  orientation: SplitOrientation;
  panes: PaneConfiguration[];
  layout: LayoutConfiguration;
  metadata: SplitLayoutMetadata;
  performance: SplitLayoutPerformance;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

interface SplitConfiguration {
  id: UUID;
  name: string;
  type: SplitType;
  orientation: SplitOrientation;
  panes: PaneLayout[];
  constraints: SplitConstraints;
  animations: SplitAnimationConfig;
  collaboration: SplitCollaborationConfig;
  performance: SplitPerformanceConfig;
}

interface PaneLayout {
  id: UUID;
  name: string;
  type: PaneType;
  position: PanePosition;
  size: PaneSize;
  content: PaneContent;
  constraints: PaneConstraints;
  state: PaneState;
  performance: PanePerformanceMetrics;
  collaboration: PaneCollaborationState;
}

interface PanePosition {
  x: number;
  y: number;
  row?: number;
  column?: number;
  gridArea?: string;
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

interface PaneSize {
  width: number | string;
  height: number | string;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  aspectRatio?: number;
  flexGrow?: number;
  flexShrink?: number;
}

interface PaneContent {
  type: 'spa' | 'component' | 'iframe' | 'dashboard' | 'workflow' | 'pipeline';
  source: string;
  configuration: Record<string, any>;
  data: JSONValue;
  refreshInterval?: number;
  cacheEnabled: boolean;
  loadingStrategy: 'lazy' | 'eager' | 'on-demand';
}

interface PaneConstraints {
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  aspectRatioLocked: boolean;
  resizeDirections: ResizeDirection[];
  snapToGrid: boolean;
  stackingOrder: number;
  collisionDetection: boolean;
}

interface PaneState {
  isActive: boolean;
  isVisible: boolean;
  isLoading: boolean;
  isError: boolean;
  isFocused: boolean;
  isResizing: boolean;
  isDragging: boolean;
  isCollaborating: boolean;
  lastActivity: ISODateString;
}

type SplitType = 'horizontal' | 'vertical' | 'grid' | 'mosaic' | 'custom';
type SplitOrientation = 'row' | 'column' | 'mixed';
type PaneType = 'primary' | 'secondary' | 'auxiliary' | 'overlay' | 'floating';
type ResizeDirection = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

interface SplitAction {
  type: 'create' | 'remove' | 'resize' | 'move' | 'configure' | 'optimize' | 'collaborate';
  paneId?: UUID;
  splitId?: UUID;
  data?: any;
}

interface SplitActionContext {
  userId: UUID;
  workspaceId: UUID;
  timestamp: ISODateString;
  source: 'user' | 'ai' | 'collaboration' | 'system';
  metadata?: Record<string, any>;
}

interface SplitRecommendation {
  id: UUID;
  type: 'layout' | 'performance' | 'usability' | 'accessibility' | 'collaboration';
  title: string;
  description: string;
  splitConfiguration: SplitConfiguration;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  aiConfidence: number;
  implementation: SplitImplementation;
  estimatedBenefit: SplitOptimizationBenefit;
  createdAt: ISODateString;
}

interface SplitPerformanceMetrics {
  renderTime: number;
  resizeLatency: number;
  paneCount: number;
  memoryUsage: number;
  cpuUsage: number;
  collaborationLatency: number;
  aiProcessingTime: number;
  transitionTime: number;
}

interface PanePerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  interactionLatency: number;
  updateFrequency: number;
  contentLoadTime: number;
  collaborationLatency: number;
}

interface CollaborativePaneState {
  paneId: UUID;
  collaborators: PaneCollaborator[];
  realTimeEdits: RealTimePaneEdit[];
  conflictResolution: PaneConflictResolution[];
  sharedCursor: SharedCursorState[];
  lockState: PaneLockState;
}

interface PaneCollaborator {
  userId: UUID;
  username: string;
  avatar: string;
  role: string;
  isOnline: boolean;
  currentPane: UUID | null;
  cursor: { x: number; y: number };
  selection: PaneSelection;
  lastActivity: ISODateString;
  permissions: string[];
}

interface FocusManagementState {
  focusedPaneId: UUID | null;
  focusHistory: UUID[];
  keyboardNavigationEnabled: boolean;
  focusTrappingEnabled: boolean;
  focusIndicatorVisible: boolean;
  screenReaderAnnouncements: boolean;
}

interface SplitScreenError {
  id: UUID;
  type: 'configuration' | 'performance' | 'collaboration' | 'accessibility' | 'integration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  splitId?: UUID;
  context: Record<string, any>;
  timestamp: ISODateString;
  resolved: boolean;
  resolution?: string;
}

// =============================================================================
// SPLIT SCREEN CONTEXT
// =============================================================================

interface SplitScreenContextValue {
  splitState: SplitScreenState;
  updateSplitState: (updates: Partial<SplitScreenState>) => void;
  createSplit: (configuration: SplitConfiguration) => Promise<void>;
  removeSplit: (splitId: UUID) => Promise<void>;
  resizePane: (paneId: UUID, newSize: PaneSize) => Promise<void>;
  movePane: (paneId: UUID, newPosition: PanePosition) => Promise<void>;
  optimizeSplitLayout: () => Promise<void>;
  saveSplitTemplate: (name: string, description: string) => Promise<void>;
}

const SplitScreenContext = createContext<SplitScreenContextValue | null>(null);

export const useSplitScreenContext = () => {
  const context = useContext(SplitScreenContext);
  if (!context) {
    throw new Error('useSplitScreenContext must be used within SplitScreenManager');
  }
  return context;
};

// =============================================================================
// SPLIT SCREEN MANAGER COMPONENT
// =============================================================================

const SplitScreenManager: React.FC<SplitScreenManagerProps> = ({
  activeViews,
  layoutMode,
  currentLayout,
  userContext,
  workspaceContext,
  onSplitAction,
  onLayoutChange,
  className = ''
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [splitState, setSplitState] = useState<SplitScreenState>({
    splitConfiguration: {
      id: crypto.randomUUID(),
      name: 'Default Split',
      type: 'horizontal',
      orientation: 'row',
      panes: [],
      constraints: {
        minPanes: 1,
        maxPanes: 8,
        minPaneSize: { width: 200, height: 150 },
        maxPaneSize: { width: 2000, height: 1500 },
        aspectRatioLocked: false,
        resizeConstraints: 'proportional',
        collisionDetection: true
      },
      animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
        staggerDelay: 50,
        parallelAnimations: true
      },
      collaboration: {
        enabled: true,
        realTimeSync: true,
        conflictResolution: 'merge',
        maxCollaborators: 10
      },
      performance: {
        virtualScrolling: true,
        lazyLoading: true,
        memoization: true,
        batchUpdates: true,
        maxRenderTime: 16
      }
    },
    paneLayouts: [],
    activePaneId: null,
    selectedPanes: [],
    splitType: 'horizontal',
    splitOrientation: 'row',
    maxPanes: 8,
    minPaneSize: 200,
    resizeThreshold: 10,
    paneHistory: [],
    paneTemplates: [],
    customSplitLayouts: [],
    isResizing: false,
    resizingPaneId: null,
    resizeDirection: null,
    dragStartPosition: { x: 0, y: 0 },
    collaborativePanes: [],
    paneCollaborators: [],
    realTimePaneEdits: [],
    aiSplitRecommendations: [],
    autoOptimizeLayout: true,
    optimizationHistory: [],
    splitPerformance: {
      renderTime: 0,
      resizeLatency: 0,
      paneCount: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      collaborationLatency: 0,
      aiProcessingTime: 0,
      transitionTime: 0
    },
    panePerformance: {},
    renderingOptimization: {
      virtualScrolling: true,
      lazyLoading: true,
      memoization: true,
      batchUpdates: true
    },
    keyboardNavigation: true,
    touchGestureSupport: 'ontouchstart' in window,
    screenReaderOptimized: false,
    focusManagement: {
      focusedPaneId: null,
      focusHistory: [],
      keyboardNavigationEnabled: true,
      focusTrappingEnabled: false,
      focusIndicatorVisible: true,
      screenReaderAnnouncements: true
    },
    animationsEnabled: true,
    transitionDuration: 300,
    easingFunction: 'ease-in-out',
    parallelAnimations: true,
    splitErrors: [],
    paneErrors: [],
    fallbackMode: false,
    lastSuccessfulSplit: new Date().toISOString(),
    splitControlsVisible: true,
    paneToolbarVisible: true,
    resizeHandlesVisible: true,
    splitPreviewVisible: false
  });

  // =============================================================================
  // HOOKS INTEGRATION
  // =============================================================================

  const {
    workspaceManagementState,
    getSplitScreenLayouts,
    saveSplitScreenLayout,
    updateSplitScreenConfiguration,
    getSplitScreenTemplates
  } = useWorkspaceManagement(userContext.id, workspaceContext.id);

  const {
    aiState,
    getSplitScreenOptimizations,
    optimizeSplitScreenLayout,
    analyzeSplitScreenUsability,
    generateSplitRecommendations
  } = useAIAssistant(userContext.id, {
    context: 'split_screen_management',
    currentSplit: splitState.splitConfiguration,
    paneLayouts: splitState.paneLayouts
  });

  const {
    collaborationState,
    startSplitScreenCollaboration,
    syncSplitScreenChanges,
    resolveSplitScreenConflicts,
    trackSplitScreenActivity
  } = useCollaboration(userContext.id, workspaceContext.id, 'split_screen');

  const {
    integrationState,
    validateSplitScreenIntegration,
    executeSplitScreenWorkflow,
    getSplitScreenMetrics
  } = useCrossGroupIntegration(userContext.id, {
    context: 'split_screen_manager',
    activeSplit: splitState.splitConfiguration
  });

  const {
    performanceData,
    trackSplitScreenPerformance,
    optimizeSplitScreenRendering,
    getSplitScreenInsights
  } = usePerformanceMonitor('split_screen_manager', splitState.splitPerformance);

  // =============================================================================
  // REFS AND MOTION VALUES
  // =============================================================================

  const splitContainerRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<Map<UUID, HTMLDivElement>>(new Map());
  const resizeHandleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragControlsRef = useDragControls();

  const splitProgress = useMotionValue(0);
  const paneOpacity = useMotionValue(1);
  const splitScale = useMotionValue(1);

  // =============================================================================
  // SPLIT SCREEN MANAGEMENT FUNCTIONS
  // =============================================================================

  /**
   * Create new split screen configuration
   */
  const createSplit = useCallback(async (configuration: SplitConfiguration) => {
    try {
      setSplitState(prev => ({ ...prev, isResizing: true }));

      // Validate split configuration
      const validation = await validateSplitConfiguration(configuration, {
        maxPanes: splitState.maxPanes,
        minPaneSize: splitState.minPaneSize,
        workspaceConstraints: workspaceContext
      });

      if (!validation.isValid) {
        throw new Error(`Invalid split configuration: ${validation.errors.join(', ')}`);
      }

      // Get AI optimization for split layout
      const aiOptimization = await getSplitScreenOptimizations({
        configuration,
        activeViews,
        userContext,
        performanceConstraints: {
          maxMemoryMB: 512,
          maxCPUPercent: 70,
          maxRenderTime: 16
        }
      });

      // Apply AI optimizations
      const optimizedConfiguration = await splitScreenUtils.applyAIOptimizations(
        configuration,
        aiOptimization
      );

      // Create pane layouts from configuration
      const paneLayouts = await Promise.all(
        optimizedConfiguration.panes.map(async (pane) => {
          const paneLayout = await createPaneLayout({
            pane,
            userContext,
            workspaceContext,
            splitConstraints: optimizedConfiguration.constraints
          });
          return paneLayout;
        })
      );

      // Update split state
      setSplitState(prev => ({
        ...prev,
        splitConfiguration: optimizedConfiguration,
        paneLayouts,
        splitType: optimizedConfiguration.type,
        splitOrientation: optimizedConfiguration.orientation,
        isResizing: false,
        lastSuccessfulSplit: new Date().toISOString()
      }));

      // Save to backend
      await saveSplitScreenLayout({
        workspaceId: workspaceContext.id,
        splitConfiguration: optimizedConfiguration,
        paneLayouts,
        userId: userContext.id
      });

      // Sync with collaborators
      await syncSplitScreenChanges({
        action: 'split_created',
        splitId: optimizedConfiguration.id,
        data: optimizedConfiguration
      });

      // Track performance
      await trackSplitScreenPerformance('split_creation', {
        paneCount: paneLayouts.length,
        splitType: optimizedConfiguration.type,
        success: true
      });

    } catch (error) {
      handleSplitScreenError('create_split', error);
      setSplitState(prev => ({ ...prev, isResizing: false }));
    }
  }, [
    splitState.maxPanes,
    splitState.minPaneSize,
    workspaceContext,
    activeViews,
    userContext,
    getSplitScreenOptimizations,
    saveSplitScreenLayout,
    syncSplitScreenChanges,
    trackSplitScreenPerformance
  ]);

  /**
   * Resize pane with intelligent constraints and collision detection
   */
  const resizePane = useCallback(async (
    paneId: UUID,
    newSize: PaneSize
  ) => {
    try {
      const pane = splitState.paneLayouts.find(p => p.id === paneId);
      if (!pane || pane.state.isLoading) return;

      setSplitState(prev => ({
        ...prev,
        isResizing: true,
        resizingPaneId: paneId
      }));

      // Validate pane size constraints
      const sizeValidation = await validatePaneConstraints({
        paneId,
        newSize,
        currentPanes: splitState.paneLayouts,
        splitConstraints: splitState.splitConfiguration.constraints
      });

      if (!sizeValidation.isValid) {
        throw new Error(`Invalid pane size: ${sizeValidation.reason}`);
      }

      // Calculate impact on other panes
      const resizeImpact = await paneUtils.calculateResizeImpact({
        resizingPane: { ...pane, size: newSize },
        allPanes: splitState.paneLayouts,
        splitType: splitState.splitType,
        containerSize: splitContainerRef.current?.getBoundingClientRect()
      });

      // Apply proportional resizing to affected panes
      const updatedPanes = await paneUtils.applyProportionalResize({
        panes: splitState.paneLayouts,
        resizeImpact,
        preserveAspectRatios: true
      });

      // Update pane layouts
      setSplitState(prev => ({
        ...prev,
        paneLayouts: updatedPanes,
        isResizing: false,
        resizingPaneId: null
      }));

      // Save to backend
      await workspaceManagementAPI.updateSplitScreenPanes({
        workspaceId: workspaceContext.id,
        splitId: splitState.splitConfiguration.id,
        panes: updatedPanes,
        userId: userContext.id
      });

      // Sync with collaborators
      await syncSplitScreenChanges({
        action: 'pane_resized',
        paneId,
        data: { size: newSize, affectedPanes: resizeImpact.affectedPanes }
      });

      // Track resize performance
      await trackSplitScreenPerformance('pane_resize', {
        paneId,
        newSize,
        affectedPanes: resizeImpact.affectedPanes.length,
        success: true
      });

    } catch (error) {
      handleSplitScreenError('resize_pane', error, { paneId, newSize });
      setSplitState(prev => ({
        ...prev,
        isResizing: false,
        resizingPaneId: null
      }));
    }
  }, [
    splitState.paneLayouts,
    splitState.splitConfiguration,
    splitState.splitType,
    workspaceContext.id,
    userContext.id,
    syncSplitScreenChanges,
    trackSplitScreenPerformance
  ]);

  /**
   * Move pane to new position with intelligent snapping
   */
  const movePane = useCallback(async (
    paneId: UUID,
    newPosition: PanePosition
  ) => {
    try {
      const pane = splitState.paneLayouts.find(p => p.id === paneId);
      if (!pane || pane.state.isLoading) return;

      // Calculate optimal position with collision avoidance
      const optimalPosition = await paneUtils.calculateOptimalPosition({
        pane,
        targetPosition: newPosition,
        existingPanes: splitState.paneLayouts.filter(p => p.id !== paneId),
        splitConstraints: splitState.splitConfiguration.constraints,
        snapToGrid: true
      });

      // Validate position constraints
      const positionValidation = await paneUtils.validatePanePosition({
        paneId,
        position: optimalPosition,
        paneSize: pane.size,
        splitBounds: splitContainerRef.current?.getBoundingClientRect(),
        otherPanes: splitState.paneLayouts.filter(p => p.id !== paneId)
      });

      if (!positionValidation.isValid) {
        throw new Error(`Invalid pane position: ${positionValidation.reason}`);
      }

      // Update pane position
      setSplitState(prev => ({
        ...prev,
        paneLayouts: prev.paneLayouts.map(p =>
          p.id === paneId ? { ...p, position: optimalPosition } : p
        )
      }));

      // Save to backend
      await workspaceManagementAPI.updatePanePosition({
        workspaceId: workspaceContext.id,
        paneId,
        position: optimalPosition,
        userId: userContext.id
      });

      // Sync with collaborators
      await syncSplitScreenChanges({
        action: 'pane_moved',
        paneId,
        data: { position: optimalPosition }
      });

    } catch (error) {
      handleSplitScreenError('move_pane', error, { paneId, newPosition });
    }
  }, [
    splitState.paneLayouts,
    splitState.splitConfiguration.constraints,
    workspaceContext.id,
    userContext.id,
    syncSplitScreenChanges
  ]);

  /**
   * Optimize split layout using AI recommendations
   */
  const optimizeSplitLayout = useCallback(async () => {
    try {
      setSplitState(prev => ({ ...prev, isResizing: true }));

      // Get AI optimization recommendations
      const optimizations = await getSplitScreenOptimizations({
        currentSplit: splitState.splitConfiguration,
        paneLayouts: splitState.paneLayouts,
        performanceMetrics: splitState.splitPerformance,
        userPreferences: userContext.preferences.layoutPreferences,
        collaborationContext: {
          collaborators: splitState.paneCollaborators,
          realTimeEdits: splitState.realTimePaneEdits
        }
      });

      // Apply optimizations
      const optimizedSplit = await optimizeSplitScreenLayout({
        optimizations,
        currentConfiguration: splitState.splitConfiguration,
        preserveUserPreferences: true
      });

      // Update split configuration
      setSplitState(prev => ({
        ...prev,
        splitConfiguration: optimizedSplit.configuration,
        paneLayouts: optimizedSplit.paneLayouts,
        aiSplitRecommendations: optimizedSplit.recommendations,
        isResizing: false,
        optimizationHistory: [...prev.optimizationHistory, {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          optimizations: optimizations.map(opt => opt.type),
          performanceImprovement: optimizedSplit.performanceImprovement,
          userSatisfaction: null,
          success: true
        }]
      }));

      // Save optimized layout
      await saveSplitScreenLayout({
        workspaceId: workspaceContext.id,
        splitConfiguration: optimizedSplit.configuration,
        paneLayouts: optimizedSplit.paneLayouts,
        userId: userContext.id
      });

      // Track optimization performance
      await trackSplitScreenPerformance('ai_optimization', {
        optimizationType: 'layout',
        performanceImprovement: optimizedSplit.performanceImprovement,
        success: true
      });

    } catch (error) {
      handleSplitScreenError('optimize_split_layout', error);
      setSplitState(prev => ({ ...prev, isResizing: false }));
    }
  }, [
    splitState.splitConfiguration,
    splitState.paneLayouts,
    splitState.splitPerformance,
    splitState.paneCollaborators,
    splitState.realTimePaneEdits,
    userContext.preferences.layoutPreferences,
    userContext.id,
    workspaceContext.id,
    getSplitScreenOptimizations,
    optimizeSplitScreenLayout,
    saveSplitScreenLayout,
    trackSplitScreenPerformance
  ]);

  /**
   * Save current split as template
   */
  const saveSplitTemplate = useCallback(async (name: string, description: string) => {
    try {
      const template: PaneTemplate = {
        id: crypto.randomUUID(),
        name,
        description,
        splitConfiguration: splitState.splitConfiguration,
        paneLayouts: splitState.paneLayouts,
        category: 'custom',
        tags: [],
        author: userContext.id,
        isPublic: false,
        usage: {
          timesUsed: 0,
          lastUsed: new Date().toISOString(),
          averageRating: 0,
          totalRatings: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save template to backend
      await workspaceManagementAPI.createSplitScreenTemplate({
        template,
        userId: userContext.id
      });

      setSplitState(prev => ({
        ...prev,
        paneTemplates: [...prev.paneTemplates, template]
      }));

    } catch (error) {
      handleSplitScreenError('save_template', error);
    }
  }, [
    splitState.splitConfiguration,
    splitState.paneLayouts,
    userContext.id
  ]);

  /**
   * Handle split screen errors with recovery
   */
  const handleSplitScreenError = useCallback((
    errorType: string,
    error: any,
    context?: Record<string, any>
  ) => {
    const splitError: SplitScreenError = {
      id: crypto.randomUUID(),
      type: errorType as any,
      severity: 'medium',
      message: error.message || 'Unknown split screen error',
      splitId: splitState.splitConfiguration.id,
      context: { ...context, currentSplit: splitState.splitConfiguration },
      timestamp: new Date().toISOString(),
      resolved: false
    };

    setSplitState(prev => ({
      ...prev,
      splitErrors: [...prev.splitErrors, splitError],
      fallbackMode: true
    }));

    console.error('Split Screen Manager Error:', splitError);

    // Attempt automatic recovery
    setTimeout(() => {
      setSplitState(prev => ({ ...prev, fallbackMode: false }));
    }, 3000);
  }, [splitState.splitConfiguration]);

  // =============================================================================
  // PANE MANAGEMENT FUNCTIONS
  // =============================================================================

  /**
   * Add new pane to split screen
   */
  const addPane = useCallback(async (
    content: PaneContent,
    position?: PanePosition,
    size?: PaneSize
  ) => {
    try {
      if (splitState.paneLayouts.length >= splitState.maxPanes) {
        throw new Error(`Maximum panes reached: ${splitState.maxPanes}`);
      }

      // Calculate optimal position and size
      const optimalPosition = position || await paneUtils.calculateOptimalPanePosition({
        existingPanes: splitState.paneLayouts,
        splitType: splitState.splitType,
        containerSize: splitContainerRef.current?.getBoundingClientRect()
      });

      const optimalSize = size || await paneUtils.calculateOptimalPaneSize({
        position: optimalPosition,
        existingPanes: splitState.paneLayouts,
        splitConstraints: splitState.splitConfiguration.constraints,
        contentType: content.type
      });

      // Create new pane layout
      const newPane: PaneLayout = {
        id: crypto.randomUUID(),
        name: `Pane ${splitState.paneLayouts.length + 1}`,
        type: 'secondary',
        position: optimalPosition,
        size: optimalSize,
        content,
        constraints: {
          minSize: { width: splitState.minPaneSize, height: splitState.minPaneSize },
          maxSize: { width: 2000, height: 1500 },
          aspectRatioLocked: false,
          resizeDirections: ['north', 'south', 'east', 'west'],
          snapToGrid: true,
          stackingOrder: splitState.paneLayouts.length + 1,
          collisionDetection: true
        },
        state: {
          isActive: false,
          isVisible: true,
          isLoading: false,
          isError: false,
          isFocused: false,
          isResizing: false,
          isDragging: false,
          isCollaborating: false,
          lastActivity: new Date().toISOString()
        },
        performance: {
          renderTime: 0,
          memoryUsage: 0,
          interactionLatency: 0,
          updateFrequency: 0,
          contentLoadTime: 0,
          collaborationLatency: 0
        },
        collaboration: {
          isShared: false,
          editors: [],
          lastModified: new Date().toISOString(),
          conflicts: []
        }
      };

      // Add pane to layout
      setSplitState(prev => ({
        ...prev,
        paneLayouts: [...prev.paneLayouts, newPane],
        activePaneId: newPane.id,
        paneHistory: [...prev.paneHistory, {
          id: crypto.randomUUID(),
          action: 'add',
          paneId: newPane.id,
          timestamp: new Date().toISOString(),
          userId: userContext.id,
          data: newPane
        }]
      }));

      // Update split configuration
      const updatedConfiguration = {
        ...splitState.splitConfiguration,
        panes: [...splitState.splitConfiguration.panes, newPane]
      };

      await updateSplitScreenConfiguration({
        workspaceId: workspaceContext.id,
        splitId: splitState.splitConfiguration.id,
        configuration: updatedConfiguration,
        userId: userContext.id
      });

      // Sync with collaborators
      await syncSplitScreenChanges({
        action: 'pane_added',
        paneId: newPane.id,
        data: newPane
      });

    } catch (error) {
      handleSplitScreenError('add_pane', error, { content, position, size });
    }
  }, [
    splitState.paneLayouts,
    splitState.maxPanes,
    splitState.minPaneSize,
    splitState.splitType,
    splitState.splitConfiguration,
    userContext.id,
    workspaceContext.id,
    updateSplitScreenConfiguration,
    syncSplitScreenChanges
  ]);

  /**
   * Remove pane from split screen
   */
  const removePane = useCallback(async (paneId: UUID) => {
    try {
      const paneToRemove = splitState.paneLayouts.find(p => p.id === paneId);
      if (!paneToRemove) return;

      // Calculate layout reflow after pane removal
      const remainingPanes = splitState.paneLayouts.filter(p => p.id !== paneId);
      const reflowedPanes = await paneUtils.calculatePaneReflow({
        remainingPanes,
        removedPaneSpace: {
          position: paneToRemove.position,
          size: paneToRemove.size
        },
        splitType: splitState.splitType,
        containerSize: splitContainerRef.current?.getBoundingClientRect()
      });

      // Update split state
      setSplitState(prev => ({
        ...prev,
        paneLayouts: reflowedPanes,
        selectedPanes: prev.selectedPanes.filter(id => id !== paneId),
        activePaneId: prev.activePaneId === paneId ? 
          (reflowedPanes.length > 0 ? reflowedPanes[0].id : null) : 
          prev.activePaneId,
        paneHistory: [...prev.paneHistory, {
          id: crypto.randomUUID(),
          action: 'remove',
          paneId,
          timestamp: new Date().toISOString(),
          userId: userContext.id,
          data: paneToRemove
        }]
      }));

      // Update backend
      await workspaceManagementAPI.removeSplitScreenPane({
        workspaceId: workspaceContext.id,
        splitId: splitState.splitConfiguration.id,
        paneId,
        userId: userContext.id
      });

      // Sync with collaborators
      await syncSplitScreenChanges({
        action: 'pane_removed',
        paneId,
        data: null
      });

    } catch (error) {
      handleSplitScreenError('remove_pane', error, { paneId });
    }
  }, [
    splitState.paneLayouts,
    splitState.splitType,
    splitState.splitConfiguration.id,
    splitState.selectedPanes,
    splitState.activePaneId,
    userContext.id,
    workspaceContext.id,
    syncSplitScreenChanges
  ]);

  // =============================================================================
  // INITIALIZATION AND LIFECYCLE
  // =============================================================================

  /**
   * Initialize split screen with existing views
   */
  useEffect(() => {
    const initializeSplitScreen = async () => {
      try {
        // Load existing split screen configuration from backend
        const existingSplit = await getSplitScreenLayouts(workspaceContext.id, userContext.id);

        if (existingSplit && existingSplit.length > 0) {
          // Use existing split configuration
          const latestSplit = existingSplit[0];
          setSplitState(prev => ({
            ...prev,
            splitConfiguration: latestSplit.configuration,
            paneLayouts: latestSplit.paneLayouts,
            splitType: latestSplit.configuration.type,
            splitOrientation: latestSplit.configuration.orientation
          }));
        } else if (activeViews.length > 1) {
          // Create default split from active views
          const defaultSplitConfig: SplitConfiguration = {
            id: crypto.randomUUID(),
            name: 'Auto Split',
            type: activeViews.length === 2 ? 'horizontal' : 'grid',
            orientation: 'row',
            panes: [],
            constraints: {
              minPanes: 1,
              maxPanes: 8,
              minPaneSize: { width: 200, height: 150 },
              maxPaneSize: { width: 2000, height: 1500 },
              aspectRatioLocked: false,
              resizeConstraints: 'proportional',
              collisionDetection: true
            },
            animations: {
              enabled: true,
              duration: 300,
              easing: 'ease-in-out',
              staggerDelay: 50,
              parallelAnimations: true
            },
            collaboration: {
              enabled: true,
              realTimeSync: true,
              conflictResolution: 'merge',
              maxCollaborators: 10
            },
            performance: {
              virtualScrolling: true,
              lazyLoading: true,
              memoization: true,
              batchUpdates: true,
              maxRenderTime: 16
            }
          };

          await createSplit(defaultSplitConfig);
        }

        // Load split screen templates
        const templates = await getSplitScreenTemplates(userContext.id);
        setSplitState(prev => ({
          ...prev,
          paneTemplates: templates
        }));

      } catch (error) {
        handleSplitScreenError('initialization', error);
      }
    };

    if (layoutMode === LayoutMode.SPLIT_SCREEN) {
      initializeSplitScreen();
    }
  }, [
    layoutMode,
    activeViews,
    workspaceContext.id,
    userContext.id,
    getSplitScreenLayouts,
    getSplitScreenTemplates,
    createSplit,
    handleSplitScreenError
  ]);

  /**
   * Performance monitoring for split screen
   */
  useEffect(() => {
    const performanceInterval = setInterval(async () => {
      try {
        // Collect split screen performance metrics
        const splitMetrics = await getSplitScreenInsights();

        // Monitor individual pane performance
        const paneMetrics: Record<UUID, PanePerformanceMetrics> = {};
        for (const pane of splitState.paneLayouts) {
          const paneElement = paneRefs.current.get(pane.id);
          if (paneElement) {
            const panePerformance = await paneUtils.measurePanePerformance(paneElement);
            paneMetrics[pane.id] = panePerformance;
          }
        }

        setSplitState(prev => ({
          ...prev,
          splitPerformance: splitMetrics,
          panePerformance: paneMetrics
        }));

        // Check if optimization is needed
        if (splitMetrics.renderTime > PERFORMANCE_THRESHOLDS.maxRenderTime && 
            splitState.autoOptimizeLayout) {
          await optimizeSplitLayout();
        }

      } catch (error) {
        handleSplitScreenError('performance_monitoring', error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(performanceInterval);
  }, [
    splitState.paneLayouts,
    splitState.autoOptimizeLayout,
    getSplitScreenInsights,
    optimizeSplitLayout,
    handleSplitScreenError
  ]);

  // =============================================================================
  // SPLIT SCREEN CONTEXT PROVIDER
  // =============================================================================

  const splitScreenContextValue: SplitScreenContextValue = useMemo(() => ({
    splitState,
    updateSplitState: (updates) => {
      setSplitState(prev => ({ ...prev, ...updates }));
    },
    createSplit,
    removeSplit: async (splitId: UUID) => {
      // Implementation for removing split
    },
    resizePane,
    movePane,
    optimizeSplitLayout,
    saveSplitTemplate
  }), [splitState, createSplit, resizePane, movePane, optimizeSplitLayout, saveSplitTemplate]);

  // =============================================================================
  // SPLIT CONTROLS INTERFACE
  // =============================================================================

  const renderSplitControls = useCallback(() => (
    <div className="fixed top-20 left-4 z-40">
      <Card className="w-80 bg-background/95 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Split className="h-4 w-4" />
            Split Screen Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Split Type Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Split Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'horizontal', icon: Columns, label: 'Horizontal' },
                { type: 'vertical', icon: Rows, label: 'Vertical' },
                { type: 'grid', icon: Grid3X3, label: 'Grid' },
                { type: 'custom', icon: Target, label: 'Custom' }
              ].map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant={splitState.splitType === type ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setSplitState(prev => ({ ...prev, splitType: type as SplitType }));
                  }}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Active Panes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Active Panes</Label>
              <Badge variant="outline" className="text-xs">
                {splitState.paneLayouts.length}/{splitState.maxPanes}
              </Badge>
            </div>

            <ScrollArea className="h-32">
              <div className="space-y-1">
                {splitState.paneLayouts.map((pane) => (
                  <div
                    key={pane.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      splitState.activePaneId === pane.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSplitState(prev => ({ ...prev, activePaneId: pane.id }));
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          pane.state.isVisible ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs font-medium">{pane.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {pane.state.isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                        {pane.state.isError && <AlertTriangle className="h-3 w-3 text-destructive" />}
                        {pane.collaboration.isShared && <Users className="h-3 w-3" />}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(pane.size.width)}×{Math.round(pane.size.height as number)} • {pane.content.type}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Label className="text-xs">Quick Actions</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  addPane({
                    type: 'spa',
                    source: 'data-sources',
                    configuration: {},
                    data: null,
                    cacheEnabled: true,
                    loadingStrategy: 'lazy'
                  });
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Pane
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={optimizeSplitLayout}
                disabled={splitState.isResizing}
              >
                <Brain className="h-3 w-3 mr-1" />
                AI Optimize
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  // Reset to default split
                  const defaultSplit: SplitConfiguration = {
                    id: crypto.randomUUID(),
                    name: 'Default',
                    type: 'horizontal',
                    orientation: 'row',
                    panes: [],
                    constraints: splitState.splitConfiguration.constraints,
                    animations: splitState.splitConfiguration.animations,
                    collaboration: splitState.splitConfiguration.collaboration,
                    performance: splitState.splitConfiguration.performance
                  };
                  createSplit(defaultSplit);
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  saveSplitTemplate(
                    `Split ${new Date().toLocaleDateString()}`,
                    'Custom split screen layout'
                  );
                }}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
            <Label className="text-xs">Performance</Label>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Render Time</span>
                <span>{Math.round(splitState.splitPerformance.renderTime)}ms</span>
              </div>
              <Progress
                value={Math.min(splitState.splitPerformance.renderTime / 16 * 100, 100)}
                className="h-1"
                variant={splitState.splitPerformance.renderTime > 16 ? 'destructive' : 'default'}
              />

              <div className="flex justify-between text-xs">
                <span>Memory Usage</span>
                <span>{Math.round(splitState.splitPerformance.memoryUsage)}MB</span>
              </div>
              <Progress
                value={Math.min(splitState.splitPerformance.memoryUsage / 512 * 100, 100)}
                className="h-1"
              />

              <div className="flex justify-between text-xs">
                <span>Pane Count</span>
                <span>{splitState.splitPerformance.paneCount}</span>
              </div>
              <Progress
                value={splitState.splitPerformance.paneCount / splitState.maxPanes * 100}
                className="h-1"
              />
            </div>
          </div>

          {/* AI Recommendations */}
          {splitState.aiSplitRecommendations.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI Recommendations
              </Label>
              <div className="space-y-1">
                {splitState.aiSplitRecommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-2 bg-muted/50 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{rec.title}</span>
                      <Badge variant="outline" className="text-xs">{rec.impact}</Badge>
                    </div>
                    <p className="text-muted-foreground">{rec.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        // Apply AI recommendation
                        createSplit(rec.splitConfiguration);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Status */}
          {splitState.splitErrors.length > 0 && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {splitState.splitErrors.length} split screen error(s)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  ), [
    splitState.splitType,
    splitState.paneLayouts,
    splitState.maxPanes,
    splitState.activePaneId,
    splitState.splitPerformance,
    splitState.aiSplitRecommendations,
    splitState.splitErrors,
    splitState.isResizing,
    splitState.splitConfiguration,
    addPane,
    optimizeSplitLayout,
    createSplit,
    saveSplitTemplate
  ]);

  /**
   * Render individual pane with content and controls
   */
  const renderPane = useCallback((pane: PaneLayout) => {
    return (
      <motion.div
        key={pane.id}
        ref={(el) => {
          if (el) paneRefs.current.set(pane.id, el);
        }}
        className={`relative border rounded-lg overflow-hidden bg-background shadow-lg ${
          splitState.activePaneId === pane.id
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border'
        } ${splitState.selectedPanes.includes(pane.id) ? 'ring-1 ring-primary/50' : ''}`}
        style={{
          position: 'absolute',
          left: pane.position.x,
          top: pane.position.y,
          width: pane.size.width,
          height: pane.size.height,
          zIndex: pane.constraints.stackingOrder,
          opacity: pane.state.isVisible ? 1 : 0.3
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: pane.state.isVisible ? 1 : 0.3, 
          scale: 1,
          x: pane.position.x,
          y: pane.position.y
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: splitState.transitionDuration / 1000,
          ease: splitState.easingFunction
        }}
        drag={pane.constraints.resizeDirections.length > 0}
        dragControls={dragControlsRef}
        dragMomentum={false}
        onDragEnd={(_, info: PanInfo) => {
          const newPosition: PanePosition = {
            ...pane.position,
            x: pane.position.x + info.offset.x,
            y: pane.position.y + info.offset.y
          };
          movePane(pane.id, newPosition);
        }}
        onClick={() => {
          setSplitState(prev => ({
            ...prev,
            activePaneId: pane.id,
            focusManagement: {
              ...prev.focusManagement,
              focusedPaneId: pane.id,
              focusHistory: [pane.id, ...prev.focusManagement.focusHistory.slice(0, 9)]
            }
          }));
        }}
      >
        {/* Pane Header */}
        <div className="h-10 bg-muted/50 flex items-center justify-between px-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              pane.state.isActive ? 'bg-green-500' :
              pane.state.isLoading ? 'bg-yellow-500' :
              pane.state.isError ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className="text-xs font-medium">{pane.name}</span>
            <Badge variant="outline" className="text-xs">{pane.content.type}</Badge>
          </div>

          <div className="flex items-center gap-1">
            {/* Pane Status Indicators */}
            {pane.state.isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
            {pane.state.isError && <AlertTriangle className="h-3 w-3 text-destructive" />}
            {pane.collaboration.isShared && <Users className="h-3 w-3" />}
            
            {/* Pane Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  setSplitState(prev => ({
                    ...prev,
                    selectedPanes: prev.selectedPanes.includes(pane.id)
                      ? prev.selectedPanes.filter(id => id !== pane.id)
                      : [...prev.selectedPanes, pane.id]
                  }));
                }}>
                  <Target className="h-3 w-3 mr-2" />
                  {splitState.selectedPanes.includes(pane.id) ? 'Deselect' : 'Select'}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => {
                  // Duplicate pane
                  const duplicatedPane = {
                    ...pane,
                    id: crypto.randomUUID(),
                    name: `${pane.name} Copy`,
                    position: {
                      ...pane.position,
                      x: pane.position.x + 20,
                      y: pane.position.y + 20
                    }
                  };
                  setSplitState(prev => ({
                    ...prev,
                    paneLayouts: [...prev.paneLayouts, duplicatedPane]
                  }));
                }}>
                  <Copy className="h-3 w-3 mr-2" />
                  Duplicate
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => {
                  setSplitState(prev => ({
                    ...prev,
                    paneLayouts: prev.paneLayouts.map(p =>
                      p.id === pane.id 
                        ? { ...p, state: { ...p.state, isVisible: !p.state.isVisible } }
                        : p
                    )
                  }));
                }}>
                  {pane.state.isVisible ? <EyeOff className="h-3 w-3 mr-2" /> : <Eye className="h-3 w-3 mr-2" />}
                  {pane.state.isVisible ? 'Hide' : 'Show'}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => removePane(pane.id)}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Pane Content */}
        <div className="flex-1 relative overflow-hidden">
          {pane.state.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-2 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Loading {pane.content.type}...</p>
              </div>
            </div>
          ) : pane.state.isError ? (
            <div className="flex items-center justify-center h-full">
              <Alert variant="destructive" className="m-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Pane Error</AlertTitle>
                <AlertDescription>
                  Failed to load content for {pane.name}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="w-full h-full">
              {/* Dynamic content rendering based on pane type */}
              {pane.content.type === 'spa' && (
                <div className="w-full h-full">
                  {/* SPA content will be rendered here */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center space-y-2">
                      <Monitor className="h-8 w-8 mx-auto" />
                      <p className="text-sm">SPA: {pane.content.source}</p>
                    </div>
                  </div>
                </div>
              )}

              {pane.content.type === 'dashboard' && (
                <div className="w-full h-full p-4">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Performance</span>
                            <span>{Math.round(pane.performance.renderTime)}ms</span>
                          </div>
                          <Progress value={75} className="h-1" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs">
                          <Activity className="h-3 w-3" />
                          <span>Real-time updates</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {pane.content.type === 'component' && (
                <div className="w-full h-full p-4">
                  <div className="text-center space-y-2">
                    <Layers className="h-6 w-6 mx-auto" />
                    <p className="text-sm">Component: {pane.content.source}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resize Handles */}
          {splitState.resizeHandlesVisible && pane.constraints.resizeDirections.map((direction) => (
            <div
              key={direction}
              className={`absolute bg-primary/20 hover:bg-primary/40 transition-colors cursor-${
                direction.includes('east') || direction.includes('west') ? 'ew' : 'ns'
              }-resize ${
                direction === 'north' ? 'top-0 left-0 right-0 h-1' :
                direction === 'south' ? 'bottom-0 left-0 right-0 h-1' :
                direction === 'east' ? 'top-0 right-0 bottom-0 w-1' :
                direction === 'west' ? 'top-0 left-0 bottom-0 w-1' :
                direction === 'northeast' ? 'top-0 right-0 w-3 h-3' :
                direction === 'northwest' ? 'top-0 left-0 w-3 h-3' :
                direction === 'southeast' ? 'bottom-0 right-0 w-3 h-3' :
                'bottom-0 left-0 w-3 h-3'
              }`}
              onMouseDown={(e) => {
                setSplitState(prev => ({
                  ...prev,
                  isResizing: true,
                  resizingPaneId: pane.id,
                  resizeDirection: direction,
                  dragStartPosition: { x: e.clientX, y: e.clientY }
                }));
              }}
            />
          ))}

          {/* Collaboration Indicators */}
          {pane.collaboration.isShared && pane.collaboration.editors.length > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {pane.collaboration.editors.slice(0, 3).map((editor, index) => (
                <Tooltip key={editor.userId}>
                  <TooltipTrigger>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: `hsl(${index * 137.508}deg, 70%, 50%)`,
                        marginLeft: index > 0 ? '-8px' : '0'
                      }}
                    >
                      {editor.username.charAt(0).toUpperCase()}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{editor.username} is editing this pane</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {pane.collaboration.editors.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium -ml-2">
                  +{pane.collaboration.editors.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [
    splitState.activePaneId,
    splitState.selectedPanes,
    splitState.resizeHandlesVisible,
    splitState.isResizing,
    splitState.transitionDuration,
    splitState.easingFunction,
    movePane,
    removePane
  ]);

  /**
   * Render split screen layout
   */
  const renderSplitLayout = useCallback(() => {
    if (splitState.paneLayouts.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Split className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No Split Screen Active</h3>
              <p className="text-sm text-muted-foreground">
                Create panes to start using split screen mode
              </p>
            </div>
            <Button onClick={() => {
              addPane({
                type: 'spa',
                source: 'data-sources',
                configuration: {},
                data: null,
                cacheEnabled: true,
                loadingStrategy: 'lazy'
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Pane
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden">
        {/* Split Screen Canvas */}
        <motion.div
          ref={splitContainerRef}
          className="absolute inset-0"
          style={{
            scale: splitScale
          }}
        >
          {/* Grid Background (if grid mode) */}
          {splitState.splitType === 'grid' && (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          )}

          {/* Render All Panes */}
          <AnimatePresence>
            {splitState.paneLayouts.map(renderPane)}
          </AnimatePresence>

          {/* Split Guidelines (when resizing) */}
          {splitState.isResizing && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-primary/5" />
              {/* Alignment guides */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/30" />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/30" />
            </div>
          )}
        </motion.div>

        {/* Split Screen Toolbar */}
        {splitState.paneToolbarVisible && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
            <Card className="bg-background/95 backdrop-blur-sm border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  {/* Split Type Quick Switch */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={splitState.splitType === 'horizontal' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSplitState(prev => ({ ...prev, splitType: 'horizontal' }));
                      }}
                    >
                      <Columns className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={splitState.splitType === 'vertical' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSplitState(prev => ({ ...prev, splitType: 'vertical' }));
                      }}
                    >
                      <Rows className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={splitState.splitType === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSplitState(prev => ({ ...prev, splitType: 'grid' }));
                      }}
                    >
                      <Grid3X3 className="h-3 w-3" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Pane Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      addPane({
                        type: 'spa',
                        source: 'data-sources',
                        configuration: {},
                        data: null,
                        cacheEnabled: true,
                        loadingStrategy: 'lazy'
                      });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={optimizeSplitLayout}
                    disabled={splitState.isResizing}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Optimize
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setSplitState(prev => ({
                        ...prev,
                        splitControlsVisible: !prev.splitControlsVisible
                      }));
                    }}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resize Overlay */}
        {splitState.isResizing && (
          <motion.div
            className="absolute inset-0 bg-background/20 backdrop-blur-sm z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <Card className="bg-background/95 backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Move className="h-4 w-4" />
                    <span>Resizing pane...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    );
  }, [
    splitState.paneLayouts,
    splitState.splitType,
    splitState.isResizing,
    splitState.paneToolbarVisible,
    splitState.splitControlsVisible,
    renderPane,
    addPane,
    optimizeSplitLayout
  ]);

  // =============================================================================
  // SPLIT SCREEN CONTEXT PROVIDER AND MAIN RENDER
  // =============================================================================

  return (
    <SplitScreenContext.Provider value={splitScreenContextValue}>
      <TooltipProvider>
        <div className={`split-screen-manager relative w-full h-full ${className}`}>
          {/* Split Controls Panel */}
          {splitState.splitControlsVisible && renderSplitControls()}

          {/* Main Split Screen Layout */}
          {renderSplitLayout()}

          {/* Performance Monitoring Overlay */}
          {(typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' && (
            <div className="fixed bottom-4 right-4 z-50">
              <Card className="w-64 bg-background/95 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Split Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Render Time:</span>
                      <span>{Math.round(splitState.splitPerformance.renderTime)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <span>{Math.round(splitState.splitPerformance.memoryUsage)}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Panes:</span>
                      <span>{splitState.splitPerformance.paneCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collaboration:</span>
                      <span>{Math.round(splitState.splitPerformance.collaborationLatency)}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Recovery Overlay */}
          {splitState.fallbackMode && (
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="w-96">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="font-medium">Split Screen Recovery</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The split screen manager encountered an error and is recovering...
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSplitState(prev => ({ ...prev, fallbackMode: false }));
                      }}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Reset to default state
                        setSplitState(prev => ({
                          ...prev,
                          paneLayouts: [],
                          fallbackMode: false,
                          splitErrors: []
                        }));
                      }}
                    >
                      Reset Split
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </TooltipProvider>
    </SplitScreenContext.Provider>
  );
};

// =============================================================================
// SPLIT SCREEN HOOKS FOR CHILD COMPONENTS
// =============================================================================

/**
 * Hook for accessing split screen utilities
 */
export const useSplitScreen = () => {
  const context = useSplitScreenContext();

  return {
    splitState: context.splitState,
    createSplit: context.createSplit,
    resizePane: context.resizePane,
    movePane: context.movePane,
    optimizeLayout: context.optimizeSplitLayout,
    isResizing: context.splitState.isResizing,
    activePaneId: context.splitState.activePaneId,
    paneCount: context.splitState.paneLayouts.length
  };
};

/**
 * Hook for pane-specific operations
 */
export const usePane = (paneId: UUID) => {
  const context = useSplitScreenContext();
  const pane = context.splitState.paneLayouts.find(p => p.id === paneId);

  return {
    pane,
    isActive: context.splitState.activePaneId === paneId,
    isSelected: context.splitState.selectedPanes.includes(paneId),
    resize: (newSize: PaneSize) => context.resizePane(paneId, newSize),
    move: (newPosition: PanePosition) => context.movePane(paneId, newPosition),
    performance: context.splitState.panePerformance[paneId]
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default SplitScreenManager;
export type {
  SplitScreenManagerProps,
  SplitScreenState,
  PaneConfiguration,
  SplitLayout,
  SplitConfiguration,
  PaneLayout
};
