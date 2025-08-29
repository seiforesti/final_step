'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Input, Label, Textarea, Switch, Slider,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Separator, ScrollArea, Popover, PopoverContent, PopoverTrigger,
  Collapsible, CollapsibleContent, CollapsibleTrigger,
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger
} from '@/components/ui';
import { Plus, Save, Download, Upload, Share2, Copy, Trash2, Edit3, Grid3X3, BarChart3, LineChart, PieChart, Activity, TrendingUp, Settings, Palette, Layout, Eye, EyeOff, Lock, Unlock, RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, Search, Filter, SortAsc, SortDesc, Calendar, Clock, Users, Database, Server, Shield, AlertTriangle, CheckCircle, Code, Layers, Move, MousePointer, Hand, Square, Circle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoreVertical, RefreshCw, PlayCircle, PauseCircle, StopCircle, Folder, FolderOpen, FileText, Image, Video, Music, Star, Heart, Bookmark, Tag, Flag, Bell, Mail, Home, Building, Globe, Map, Navigation, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DashboardWidget, WidgetType, DashboardLayout, VisualizationConfig,
  ChartType, AggregationType, DashboardState, WidgetConfiguration
} from '../../types/racine-core.types';
import { useDashboardAPIs } from '../../hooks/useDashboardAPIs';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Enhanced interfaces for drag-and-drop functionality
interface DragItem {
  id: string;
  type: 'widget' | 'template' | 'component';
  data: any;
  preview?: React.ReactNode;
}

interface DropZone {
  id: string;
  type: 'grid' | 'panel' | 'section';
  accepts: string[];
  position: { x: number; y: number; width: number; height: number };
}

interface GridItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  widget: DashboardWidget;
  locked?: boolean;
  hidden?: boolean;
}

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  layout: GridItem[];
  config: any;
  tags: string[];
  popularity: number;
  lastModified: string;
}

interface BuilderState {
  currentDashboard: DashboardState | null;
  gridItems: GridItem[];
  selectedItems: string[];
  draggedItem: DragItem | null;
  dropZones: DropZone[];
  gridSize: { cols: number; rows: number };
  zoomLevel: number;
  viewMode: 'design' | 'preview' | 'code';
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  isPreviewMode: boolean;
  undoStack: any[];
  redoStack: any[];
  clipboard: GridItem[];
  templates: DashboardTemplate[];
  widgetLibrary: any[];
  recentlyUsed: any[];
  autoSave: boolean;
  collaborationMode: boolean;
  livePreview: boolean;
  showMinimap: boolean;
  selectedTool: 'select' | 'move' | 'resize' | 'draw';
  paintMode: boolean;
  guidesEnabled: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
}

interface CustomDashboardBuilderProps {
  currentDashboard?: DashboardState | null;
  isLoading?: boolean;
  onDashboardUpdate?: (dashboard: DashboardState) => void;
  onSave?: (dashboard: DashboardState) => void;
  onExport?: (format: string) => void;
  onShare?: (permissions: any) => void;
}

// Animation variants
const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  dragging: {
    scale: 1.05,
    rotate: 5,
    transition: { type: "spring", stiffness: 300 }
  },
  dropped: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 300 }
  }
};

// Widget library with comprehensive widget types
const WIDGET_LIBRARY = [
  {
    id: 'kpi-card',
    name: 'KPI Card',
    category: 'metrics',
    icon: TrendingUp,
    description: 'Display key performance indicators',
    defaultSize: { w: 2, h: 1 },
    configurable: ['title', 'metric', 'comparison', 'trend', 'color']
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    category: 'charts',
    icon: LineChart,
    description: 'Time series and trend visualization',
    defaultSize: { w: 4, h: 3 },
    configurable: ['data', 'axes', 'legend', 'colors', 'annotations']
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    category: 'charts',
    icon: BarChart3,
    description: 'Categorical data comparison',
    defaultSize: { w: 3, h: 2 },
    configurable: ['data', 'orientation', 'stacking', 'colors', 'labels']
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    category: 'charts',
    icon: PieChart,
    description: 'Part-to-whole relationships',
    defaultSize: { w: 2, h: 2 },
    configurable: ['data', 'labels', 'colors', 'donut', 'legend']
  },
  {
    id: 'data-table',
    name: 'Data Table',
    category: 'data',
    icon: Database,
    description: 'Structured data display',
    defaultSize: { w: 4, h: 3 },
    configurable: ['columns', 'sorting', 'filtering', 'pagination', 'export']
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    category: 'monitoring',
    icon: Activity,
    description: 'Real-time activity stream',
    defaultSize: { w: 3, h: 4 },
    configurable: ['sources', 'filters', 'refresh', 'grouping', 'limits']
  },
  {
    id: 'gauge-chart',
    name: 'Gauge Chart',
    category: 'metrics',
    icon: TrendingUp,
    description: 'Performance gauge visualization',
    defaultSize: { w: 2, h: 2 },
    configurable: ['value', 'ranges', 'colors', 'units', 'thresholds']
  },
  {
    id: 'map-widget',
    name: 'Map Widget',
    category: 'geography',
    icon: Map,
    description: 'Geographic data visualization',
    defaultSize: { w: 4, h: 3 },
    configurable: ['layers', 'markers', 'zoom', 'style', 'interactions']
  }
];

// Dashboard templates
const DASHBOARD_TEMPLATES = [
  {
    id: 'executive-overview',
    name: 'Executive Overview',
    description: 'High-level KPIs and metrics for executives',
    category: 'executive',
    preview: '/templates/executive-overview.png',
    tags: ['kpi', 'overview', 'executive', 'summary'],
    popularity: 95,
    layout: []
  },
  {
    id: 'operational-monitoring',
    name: 'Operational Monitoring',
    description: 'Real-time operational metrics and alerts',
    category: 'operations',
    preview: '/templates/operational-monitoring.png',
    tags: ['monitoring', 'real-time', 'alerts', 'operations'],
    popularity: 88,
    layout: []
  },
  {
    id: 'data-quality-dashboard',
    name: 'Data Quality Dashboard',
    description: 'Comprehensive data quality metrics and trends',
    category: 'data-quality',
    preview: '/templates/data-quality.png',
    tags: ['data-quality', 'metrics', 'trends', 'governance'],
    popularity: 82,
    layout: []
  },
  {
    id: 'compliance-reporting',
    name: 'Compliance Reporting',
    description: 'Regulatory compliance metrics and reports',
    category: 'compliance',
    preview: '/templates/compliance-reporting.png',
    tags: ['compliance', 'reporting', 'regulatory', 'audit'],
    popularity: 76,
    layout: []
  }
];

export const CustomDashboardBuilder: React.FC<CustomDashboardBuilderProps> = ({
  currentDashboard,
  isLoading = false,
  onDashboardUpdate,
  onSave,
  onExport,
  onShare
}) => {
  // Refs for DOM manipulation
  const builderRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  // Custom hooks for backend integration
  const { 
    dashboards, 
    createDashboard, 
    updateDashboard, 
    deleteDashboard,
    exportDashboard,
    importDashboard,
    shareDashboard,
    saveDashboardTemplate,
    loadDashboardTemplates,
    getDashboardMetrics
  } = useDashboardAPIs();

  const { subscribe, unsubscribe } = useRealtimeUpdates();
  const { orchestrateWorkflow, getWorkflowStatus } = useRacineOrchestration();
  const { integrateCrossGroupData, getCrossGroupInsights } = useCrossGroupIntegration();
  const { generateInsights, optimizeDashboard, suggestWidgets } = useAIAssistant();

  // Component state
  const [state, setState] = useState<BuilderState>({
    currentDashboard: currentDashboard || null,
    gridItems: [],
    selectedItems: [],
    draggedItem: null,
    dropZones: [],
    gridSize: { cols: 12, rows: 20 },
    zoomLevel: 1,
    viewMode: 'design',
    showGrid: true,
    snapToGrid: true,
    showRulers: true,
    isPreviewMode: false,
    undoStack: [],
    redoStack: [],
    clipboard: [],
    templates: DASHBOARD_TEMPLATES,
    widgetLibrary: WIDGET_LIBRARY,
    recentlyUsed: [],
    autoSave: true,
    collaborationMode: false,
    livePreview: true,
    showMinimap: true,
    selectedTool: 'select',
    paintMode: false,
    guidesEnabled: true,
    isLoading: false,
    hasUnsavedChanges: false,
    error: null
  });

  // Dialog states
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<GridItem | null>(null);

  // Configuration states
  const [builderConfig, setBuilderConfig] = useState({
    gridSpacing: 20,
    snapThreshold: 10,
    autoSaveInterval: 30000,
    maxUndoSteps: 50,
    enableAnimations: true,
    showTooltips: true,
    enableKeyboardShortcuts: true,
    collaborationEnabled: false,
    aiAssistanceEnabled: true,
    performanceMode: false
  });

  // Computed values
  const canUndo = useMemo(() => state.undoStack.length > 0, [state.undoStack]);
  const canRedo = useMemo(() => state.redoStack.length > 0, [state.redoStack]);
  const hasSelection = useMemo(() => state.selectedItems.length > 0, [state.selectedItems]);
  const isMultiSelection = useMemo(() => state.selectedItems.length > 1, [state.selectedItems]);

  // Initialize component
  useEffect(() => {
    initializeBuilder();
    return () => cleanup();
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (state.autoSave && state.hasUnsavedChanges && state.currentDashboard) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, builderConfig.autoSaveInterval);
      return () => clearTimeout(timer);
    }
  }, [state.autoSave, state.hasUnsavedChanges, builderConfig.autoSaveInterval]);

  // Real-time collaboration effect
  useEffect(() => {
    if (state.collaborationMode && state.currentDashboard?.id) {
      const unsubscribe = subscribe(`dashboard:${state.currentDashboard.id}`, handleCollaborationUpdate);
      return () => unsubscribe();
    }
  }, [state.collaborationMode, state.currentDashboard?.id]);

  // Keyboard shortcuts effect
  useEffect(() => {
    if (builderConfig.enableKeyboardShortcuts) {
      document.addEventListener('keydown', handleKeyboardShortcuts);
      return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
    }
  }, [builderConfig.enableKeyboardShortcuts, state]);

  // Initialize builder
  const initializeBuilder = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load templates and widget library
      const templates = await loadDashboardTemplates();
      const recentlyUsed = JSON.parse(localStorage.getItem('racine-recent-widgets') || '[]');
      
      // Initialize drop zones
      const dropZones: DropZone[] = [
        {
          id: 'main-grid',
          type: 'grid',
          accepts: ['widget', 'template', 'component'],
          position: { x: 0, y: 0, width: 100, height: 100 }
        }
      ];

      setState(prev => ({
        ...prev,
        templates,
        recentlyUsed,
        dropZones,
        isLoading: false
      }));

      // Initialize current dashboard if provided
      if (currentDashboard) {
        loadDashboardLayout(currentDashboard);
      }

    } catch (error) {
      console.error('Failed to initialize dashboard builder:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to initialize dashboard builder' 
      }));
    }
  }, [currentDashboard]);

  // Load dashboard layout
  const loadDashboardLayout = useCallback(async (dashboard: DashboardState) => {
    try {
      const gridItems: GridItem[] = dashboard.widgets.map((widget, index) => ({
        id: widget.id,
        x: widget.layout?.x || (index % 4) * 3,
        y: widget.layout?.y || Math.floor(index / 4) * 2,
        w: widget.layout?.width || 3,
        h: widget.layout?.height || 2,
        widget,
        locked: widget.locked || false,
        hidden: widget.hidden || false
      }));

      setState(prev => ({
        ...prev,
        currentDashboard: dashboard,
        gridItems,
        selectedItems: [],
        hasUnsavedChanges: false
      }));

    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load dashboard layout' 
      }));
    }
  }, []);

  // Handle auto-save
  const handleAutoSave = useCallback(async () => {
    if (!state.currentDashboard || !state.hasUnsavedChanges) return;

    try {
      const updatedDashboard = await saveDashboardState();
      setState(prev => ({ 
        ...prev, 
        hasUnsavedChanges: false,
        currentDashboard: updatedDashboard
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [state.currentDashboard, state.hasUnsavedChanges]);

  // Handle collaboration updates
  const handleCollaborationUpdate = useCallback((update: any) => {
    setState(prev => {
      const newState = { ...prev };
      
      switch (update.type) {
        case 'widget_added':
          newState.gridItems = [...prev.gridItems, update.item];
          break;
        case 'widget_updated':
          newState.gridItems = prev.gridItems.map(item => 
            item.id === update.item.id ? { ...item, ...update.item } : item
          );
          break;
        case 'widget_deleted':
          newState.gridItems = prev.gridItems.filter(item => item.id !== update.itemId);
          break;
        case 'layout_changed':
          newState.gridItems = update.items;
          break;
      }
      
      return newState;
    });
  }, []);

  // Handle keyboard shortcuts
  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case 'c':
          event.preventDefault();
          handleCopy();
          break;
        case 'v':
          event.preventDefault();
          handlePaste();
          break;
        case 's':
          event.preventDefault();
          handleSave();
          break;
        case 'a':
          event.preventDefault();
          handleSelectAll();
          break;
        case 'd':
          event.preventDefault();
          handleDuplicate();
          break;
      }
    } else {
      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          handleDeleteSelected();
          break;
        case 'Escape':
          event.preventDefault();
          handleClearSelection();
          break;
      }
    }
  }, [state]);

  // Drag and drop handlers
  const handleDragStart = useCallback((event: React.DragEvent, item: DragItem) => {
    setState(prev => ({ ...prev, draggedItem: item }));
    
    // Set drag image
    if (dragPreviewRef.current) {
      event.dataTransfer.setDragImage(dragPreviewRef.current, 0, 0);
    }
    
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify(item));
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect || !state.draggedItem) return;

    const x = Math.floor((event.clientX - rect.left) / (rect.width / state.gridSize.cols));
    const y = Math.floor((event.clientY - rect.top) / (rect.height / state.gridSize.rows));

    addWidget(state.draggedItem, { x, y });
    
    setState(prev => ({ ...prev, draggedItem: null }));
  }, [state.draggedItem, state.gridSize]);

  // Widget management
  const addWidget = useCallback((dragItem: DragItem, position: { x: number; y: number }) => {
    const widgetType = WIDGET_LIBRARY.find(w => w.id === dragItem.id);
    if (!widgetType) return;

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: dragItem.id as WidgetType,
      title: widgetType.name,
      dataSource: 'default',
      config: {
        visualization: {
          type: 'default',
          options: {}
        }
      },
      layout: {
        x: position.x,
        y: position.y,
        width: widgetType.defaultSize.w,
        height: widgetType.defaultSize.h
      },
      filters: [],
      refreshInterval: 300,
      lastUpdated: new Date().toISOString()
    };

    const gridItem: GridItem = {
      id: newWidget.id,
      x: position.x,
      y: position.y,
      w: widgetType.defaultSize.w,
      h: widgetType.defaultSize.h,
      widget: newWidget
    };

    setState(prev => {
      const newState = {
        ...prev,
        gridItems: [...prev.gridItems, gridItem],
        hasUnsavedChanges: true,
        undoStack: [...prev.undoStack, prev.gridItems].slice(-builderConfig.maxUndoSteps),
        redoStack: []
      };
      
      // Update recently used
      const recentlyUsed = [dragItem.id, ...prev.recentlyUsed.filter(id => id !== dragItem.id)].slice(0, 10);
      localStorage.setItem('racine-recent-widgets', JSON.stringify(recentlyUsed));
      newState.recentlyUsed = recentlyUsed;
      
      return newState;
    });

    // Trigger AI suggestions
    if (builderConfig.aiAssistanceEnabled) {
      suggestRelatedWidgets(newWidget);
    }
  }, [builderConfig]);

  // Widget selection
  const handleWidgetSelect = useCallback((widgetId: string, multiSelect = false) => {
    setState(prev => {
      let selectedItems: string[];
      
      if (multiSelect) {
        selectedItems = prev.selectedItems.includes(widgetId)
          ? prev.selectedItems.filter(id => id !== widgetId)
          : [...prev.selectedItems, widgetId];
      } else {
        selectedItems = prev.selectedItems.includes(widgetId) && prev.selectedItems.length === 1
          ? []
          : [widgetId];
      }
      
      return { ...prev, selectedItems };
    });
  }, []);

  // Widget operations
  const handleWidgetResize = useCallback((widgetId: string, newSize: { w: number; h: number }) => {
    setState(prev => ({
      ...prev,
      gridItems: prev.gridItems.map(item =>
        item.id === widgetId ? { ...item, ...newSize } : item
      ),
      hasUnsavedChanges: true
    }));
  }, []);

  const handleWidgetMove = useCallback((widgetId: string, newPosition: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      gridItems: prev.gridItems.map(item =>
        item.id === widgetId ? { ...item, ...newPosition } : item
      ),
      hasUnsavedChanges: true
    }));
  }, []);

  // Action handlers
  const handleUndo = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) return prev;
      
      const previousState = prev.undoStack[prev.undoStack.length - 1];
      return {
        ...prev,
        gridItems: previousState,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [...prev.redoStack, prev.gridItems],
        hasUnsavedChanges: true
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setState(prev => {
      if (prev.redoStack.length === 0) return prev;
      
      const nextState = prev.redoStack[prev.redoStack.length - 1];
      return {
        ...prev,
        gridItems: nextState,
        undoStack: [...prev.undoStack, prev.gridItems],
        redoStack: prev.redoStack.slice(0, -1),
        hasUnsavedChanges: true
      };
    });
  }, []);

  const handleCopy = useCallback(() => {
    const selectedWidgets = state.gridItems.filter(item => 
      state.selectedItems.includes(item.id)
    );
    
    setState(prev => ({ ...prev, clipboard: selectedWidgets }));
  }, [state.gridItems, state.selectedItems]);

  const handlePaste = useCallback(() => {
    if (state.clipboard.length === 0) return;
    
    const newItems = state.clipboard.map(item => ({
      ...item,
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: item.x + 1,
      y: item.y + 1,
      widget: {
        ...item.widget,
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    }));
    
    setState(prev => ({
      ...prev,
      gridItems: [...prev.gridItems, ...newItems],
      selectedItems: newItems.map(item => item.id),
      hasUnsavedChanges: true,
      undoStack: [...prev.undoStack, prev.gridItems].slice(-builderConfig.maxUndoSteps),
      redoStack: []
    }));
  }, [state.clipboard, builderConfig.maxUndoSteps]);

  const handleSelectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.gridItems.map(item => item.id)
    }));
  }, []);

  const handleClearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedItems: [] }));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setState(prev => ({
      ...prev,
      gridItems: prev.gridItems.filter(item => !prev.selectedItems.includes(item.id)),
      selectedItems: [],
      hasUnsavedChanges: true,
      undoStack: [...prev.undoStack, prev.gridItems].slice(-builderConfig.maxUndoSteps),
      redoStack: []
    }));
  }, [builderConfig.maxUndoSteps]);

  const handleDuplicate = useCallback(() => {
    const selectedWidgets = state.gridItems.filter(item => 
      state.selectedItems.includes(item.id)
    );
    
    const duplicatedItems = selectedWidgets.map(item => ({
      ...item,
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: item.x + 1,
      y: item.y + 1,
      widget: {
        ...item.widget,
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    }));
    
    setState(prev => ({
      ...prev,
      gridItems: [...prev.gridItems, ...duplicatedItems],
      selectedItems: duplicatedItems.map(item => item.id),
      hasUnsavedChanges: true,
      undoStack: [...prev.undoStack, prev.gridItems].slice(-builderConfig.maxUndoSteps),
      redoStack: []
    }));
  }, [state.gridItems, state.selectedItems, builderConfig.maxUndoSteps]);

  // Save operations
  const saveDashboardState = useCallback(async (): Promise<DashboardState> => {
    if (!state.currentDashboard) {
      throw new Error('No dashboard to save');
    }

    const updatedWidgets = state.gridItems.map(item => ({
      ...item.widget,
      layout: {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      },
      locked: item.locked,
      hidden: item.hidden
    }));

    const dashboardToSave: DashboardState = {
      ...state.currentDashboard,
      widgets: updatedWidgets,
      lastModified: new Date().toISOString()
    };

    const savedDashboard = await updateDashboard(dashboardToSave.id, dashboardToSave);
    return savedDashboard;
  }, [state.currentDashboard, state.gridItems, updateDashboard]);

  const handleSave = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const savedDashboard = await saveDashboardState();
      
      setState(prev => ({ 
        ...prev, 
        currentDashboard: savedDashboard,
        hasUnsavedChanges: false,
        isLoading: false
      }));
      
      if (onSave) {
        onSave(savedDashboard);
      }
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to save dashboard' 
      }));
    }
  }, [saveDashboardState, onSave]);

  // Template operations
  const handleLoadTemplate = useCallback(async (template: DashboardTemplate) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const newDashboard: DashboardState = {
        id: `dashboard_${Date.now()}`,
        name: `${template.name} - Copy`,
        description: template.description,
        type: 'custom',
        layout: 'grid',
        widgets: template.layout.map(item => item.widget),
        filters: [],
        refreshInterval: 300,
        isPublic: false,
        tags: template.tags,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const createdDashboard = await createDashboard(newDashboard);
      await loadDashboardLayout(createdDashboard);
      
      setState(prev => ({ ...prev, isLoading: false }));
      setShowTemplateDialog(false);
      
    } catch (error) {
      console.error('Failed to load template:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load template' 
      }));
    }
  }, [createDashboard, loadDashboardLayout]);

  // AI assistance
  const suggestRelatedWidgets = useCallback(async (widget: DashboardWidget) => {
    try {
      const suggestions = await suggestWidgets({
        currentWidgets: state.gridItems.map(item => item.widget),
        context: {
          dashboardType: state.currentDashboard?.type || 'custom',
          dataSource: widget.dataSource,
          category: widget.type
        }
      });
      
      // Show suggestions in a toast or panel
      console.log('AI Suggestions:', suggestions);
      
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    }
  }, [state.gridItems, state.currentDashboard, suggestWidgets]);

  // View mode handlers
  const handleViewModeChange = useCallback((mode: 'design' | 'preview' | 'code') => {
    setState(prev => ({ 
      ...prev, 
      viewMode: mode,
      isPreviewMode: mode === 'preview'
    }));
  }, []);

  const handleZoomChange = useCallback((delta: number) => {
    setState(prev => ({
      ...prev,
      zoomLevel: Math.max(0.25, Math.min(3, prev.zoomLevel + delta))
    }));
  }, []);

  // Export operations
  const handleExport = useCallback(async (format: string) => {
    try {
      if (!state.currentDashboard) return;
      
      setState(prev => ({ ...prev, isLoading: true }));
      
      const exportData = await exportDashboard(state.currentDashboard.id, { format });
      
      // Trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard_${state.currentDashboard.name}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      setState(prev => ({ ...prev, isLoading: false }));
      setShowExportDialog(false);
      
      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      console.error('Failed to export dashboard:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to export dashboard' 
      }));
    }
  }, [state.currentDashboard, exportDashboard, onExport]);

  // Share operations
  const handleShare = useCallback(async (permissions: any) => {
    try {
      if (!state.currentDashboard) return;
      
      setState(prev => ({ ...prev, isLoading: true }));
      
      const shareData = await shareDashboard(state.currentDashboard.id, permissions);
      
      setState(prev => ({ ...prev, isLoading: false }));
      setShowShareDialog(false);
      
      if (onShare) {
        onShare(shareData);
      }
    } catch (error) {
      console.error('Failed to share dashboard:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to share dashboard' 
      }));
    }
  }, [state.currentDashboard, shareDashboard, onShare]);

  // Cleanup
  const cleanup = useCallback(() => {
    // Clean up any resources, subscriptions, etc.
  }, []);

  // Render widget library panel
  const renderWidgetLibrary = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Widget Library</h3>
          <Badge variant="secondary">{WIDGET_LIBRARY.length}</Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search widgets..."
            className="pl-10"
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-2 mt-4">
            {WIDGET_LIBRARY.map((widget) => (
              <motion.div
                key={widget.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, { 
                  id: widget.id, 
                  type: 'widget', 
                  data: widget 
                })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <widget.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {widget.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {widget.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {widget.category}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {widget.defaultSize.w}×{widget.defaultSize.h}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );

  // Render toolbar
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplateDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!state.hasUnsavedChanges || state.isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRedo}
          disabled={!canRedo}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Layout className="h-4 w-4 mr-2" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleViewModeChange('design')}>
              <Edit3 className="h-4 w-4 mr-2" />
              Design
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewModeChange('preview')}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewModeChange('code')}>
              <Code className="h-4 w-4 mr-2" />
              Code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoomChange(-0.25)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[4rem] text-center">
            {Math.round(state.zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoomChange(0.25)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShareDialog(true)}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );

  // Render design canvas
  const renderDesignCanvas = () => (
    <div 
      ref={gridRef}
      className="relative flex-1 bg-gray-100 overflow-auto"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ transform: `scale(${state.zoomLevel})`, transformOrigin: 'top left' }}
    >
      {/* Grid background */}
      {state.showGrid && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: `${builderConfig.gridSpacing}px ${builderConfig.gridSpacing}px`
          }}
        />
      )}
      
      {/* Drop zones */}
      {state.dropZones.map((zone) => (
        <div
          key={zone.id}
          className={cn(
            "absolute border-2 border-dashed border-blue-300 rounded-lg",
            "opacity-0 transition-opacity",
            state.draggedItem && "opacity-50"
          )}
          style={{
            left: `${zone.position.x}%`,
            top: `${zone.position.y}%`,
            width: `${zone.position.width}%`,
            height: `${zone.position.height}%`
          }}
        />
      ))}
      
      {/* Grid items */}
      <AnimatePresence>
        {state.gridItems.map((item) => (
          <motion.div
            key={item.id}
            className={cn(
              "absolute border-2 rounded-lg cursor-pointer",
              "hover:border-blue-400 transition-colors",
              state.selectedItems.includes(item.id) 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 bg-white",
              item.locked && "border-red-400",
              item.hidden && "opacity-50"
            )}
            style={{
              left: `${(item.x / state.gridSize.cols) * 100}%`,
              top: `${(item.y / state.gridSize.rows) * 100}%`,
              width: `${(item.w / state.gridSize.cols) * 100}%`,
              height: `${(item.h / state.gridSize.rows) * 100}%`,
              minHeight: '80px'
            }}
            onClick={(e) => handleWidgetSelect(item.id, e.ctrlKey || e.metaKey)}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Widget header */}
            <div className="flex items-center justify-between p-2 border-b bg-gray-50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-medium truncate">
                  {item.widget.title}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {item.locked && <Lock className="h-3 w-3 text-red-500" />}
                {item.hidden && <EyeOff className="h-3 w-3 text-gray-400" />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      setSelectedWidget(item);
                      setShowWidgetConfig(true);
                    }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate()}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteSelected()}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Widget content */}
            <div className="p-4">
              <div className="text-center text-gray-500">
                <span className="text-sm">
                  {item.widget.type} Widget
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // Render properties panel
  const renderPropertiesPanel = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Properties</h3>
          {hasSelection && (
            <Badge variant="secondary">
              {state.selectedItems.length} selected
            </Badge>
          )}
        </div>
        
        {hasSelection ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Position & Size</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs text-gray-500">X</Label>
                  <Input
                    type="number"
                    value={state.gridItems.find(item => 
                      state.selectedItems.includes(item.id)
                    )?.x || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      state.selectedItems.forEach(id => {
                        handleWidgetMove(id, { 
                          x: value, 
                          y: state.gridItems.find(item => item.id === id)?.y || 0 
                        });
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Y</Label>
                  <Input
                    type="number"
                    value={state.gridItems.find(item => 
                      state.selectedItems.includes(item.id)
                    )?.y || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      state.selectedItems.forEach(id => {
                        handleWidgetMove(id, { 
                          x: state.gridItems.find(item => item.id === id)?.x || 0,
                          y: value
                        });
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Width</Label>
                  <Input
                    type="number"
                    value={state.gridItems.find(item => 
                      state.selectedItems.includes(item.id)
                    )?.w || 1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      state.selectedItems.forEach(id => {
                        handleWidgetResize(id, { 
                          w: value, 
                          h: state.gridItems.find(item => item.id === id)?.h || 1 
                        });
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Height</Label>
                  <Input
                    type="number"
                    value={state.gridItems.find(item => 
                      state.selectedItems.includes(item.id)
                    )?.h || 1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      state.selectedItems.forEach(id => {
                        handleWidgetResize(id, { 
                          w: state.gridItems.find(item => item.id === id)?.w || 1,
                          h: value
                        });
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium">Widget Options</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Locked</Label>
                  <Switch
                    checked={state.gridItems.some(item => 
                      state.selectedItems.includes(item.id) && item.locked
                    )}
                    onCheckedChange={(checked) => {
                      setState(prev => ({
                        ...prev,
                        gridItems: prev.gridItems.map(item =>
                          prev.selectedItems.includes(item.id)
                            ? { ...item, locked: checked }
                            : item
                        ),
                        hasUnsavedChanges: true
                      }));
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Hidden</Label>
                  <Switch
                    checked={state.gridItems.some(item => 
                      state.selectedItems.includes(item.id) && item.hidden
                    )}
                    onCheckedChange={(checked) => {
                      setState(prev => ({
                        ...prev,
                        gridItems: prev.gridItems.map(item =>
                          prev.selectedItems.includes(item.id)
                            ? { ...item, hidden: checked }
                            : item
                        ),
                        hasUnsavedChanges: true
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Select a widget to edit its properties
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <TooltipProvider>
      <motion.div
        ref={builderRef}
        className="flex flex-col h-screen bg-gray-50"
        variants={animationVariants.container}
        initial="hidden"
        animate="visible"
      >
        {/* Toolbar */}
        {renderToolbar()}
        
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Widget library sidebar */}
          <div className="w-64 border-r bg-white">
            {renderWidgetLibrary()}
          </div>
          
          {/* Design canvas */}
          {renderDesignCanvas()}
          
          {/* Properties panel */}
          <div className="w-64 border-l bg-white">
            {renderPropertiesPanel()}
          </div>
        </div>
        
        {/* Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Choose Dashboard Template</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-auto">
              {state.templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => handleLoadTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <Badge variant="secondary">{template.popularity}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleExport('json')}>
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Loading overlay */}
        {(state.isLoading || isLoading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Building dashboard...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Drag preview */}
        <div
          ref={dragPreviewRef}
          className="fixed pointer-events-none z-50 opacity-75 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg"
          style={{ top: '-1000px', left: '-1000px' }}
        >
          Widget Preview
        </div>
        
        {/* Error display */}
        {state.error && (
          <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
              >
                ×
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default CustomDashboardBuilder;
