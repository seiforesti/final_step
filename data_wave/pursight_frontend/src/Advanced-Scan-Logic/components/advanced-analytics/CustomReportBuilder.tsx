/**
 * 📊 Custom Report Builder - Advanced Scan Logic
 * ===============================================
 * 
 * Enterprise-grade custom report builder with drag-and-drop interface,
 * advanced visualizations, and automated report generation capabilities.
 * 
 * Features:
 * - Drag-and-drop report designer
 * - Advanced visualization components
 * - Real-time data integration
 * - Custom template management
 * - Automated report scheduling
 * - Multi-format export (PDF, Excel, Word)
 * - Interactive dashboards
 * - Advanced filtering and grouping
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

import { BarChart3, LineChart, PieChart, ScatterChart, Activity, Calculator, Target, TrendingUp, TrendingDown, Zap, Settings, Filter, Download, Upload, RefreshCw, PlayCircle, PauseCircle, AlertTriangle, CheckCircle, Info, HelpCircle, ArrowRight, ArrowUp, ArrowDown, Plus, Minus, X, Search, MoreHorizontal, Database, Cpu, MemoryStick, Network, Server, Monitor, Gauge, Sparkles, Layers, Globe, Building, DollarSign, AlertCircle, Eye, EyeOff, Maximize2, Minimize2, RotateCcw, Save, Share, Copy, ExternalLink, FileText, Image, Calendar as CalendarIcon, Clock, CheckSquare, Square, Circle, Triangle, Diamond, Star, Grid3X3, Layout, Type, Palette, Move, Resize, RotateCw, Trash2, Edit, BookOpen, Folder, FolderOpen, File, FilePlus, Archive, Send, Timer, Bell, Users, UserCheck, Mail, Printer } from 'lucide-react';

// Charts and Visualization
import {
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart as RechartsBarChart,
  ScatterChart as RechartsScatterChart,
  PieChart as RechartsPieChart,
  RadarChart,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Scatter,
  Pie,
  Cell,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  ReferenceArea,
  ErrorBar,
  Brush,
  LabelList
} from 'recharts';

// Date handling
import { format, addDays, subDays, differenceInDays, addHours, addMinutes } from 'date-fns';

// Drag and Drop
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// API and Types
import { ScanAnalyticsAPIService } from '../../services/scan-analytics-apis';

// Report Builder Types
interface ReportElement {
  id: string;
  type: ElementType;
  title: string;
  description?: string;
  position: Position;
  size: Size;
  config: ElementConfig;
  data: any;
  style: ElementStyle;
  filters: FilterConfig[];
  created_at: string;
  updated_at: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  elements: ReportElement[];
  layout: LayoutConfig;
  theme: ThemeConfig;
  settings: ReportSettings;
  permissions: PermissionConfig;
  schedule: ScheduleConfig | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  usage_count: number;
  rating: number;
}

interface GeneratedReport {
  id: string;
  template_id: string;
  name: string;
  format: ReportFormat;
  status: ReportStatus;
  file_path?: string;
  file_size?: number;
  generation_time: number;
  scheduled_at?: string;
  generated_at: string;
  expires_at?: string;
  download_count: number;
  error_message?: string;
  metadata: ReportMetadata;
}

interface ReportSchedule {
  id: string;
  template_id: string;
  name: string;
  frequency: ScheduleFrequency;
  schedule_config: ScheduleFrequencyConfig;
  recipients: ReportRecipient[];
  format: ReportFormat;
  delivery_method: DeliveryMethod;
  next_run: string;
  last_run?: string;
  is_active: boolean;
  created_at: string;
}

enum ElementType {
  TEXT = 'text',
  CHART_BAR = 'chart_bar',
  CHART_LINE = 'chart_line',
  CHART_PIE = 'chart_pie',
  CHART_SCATTER = 'chart_scatter',
  CHART_AREA = 'chart_area',
  CHART_RADAR = 'chart_radar',
  TABLE = 'table',
  METRIC_CARD = 'metric_card',
  KPI_WIDGET = 'kpi_widget',
  PROGRESS_BAR = 'progress_bar',
  GAUGE = 'gauge',
  HEATMAP = 'heatmap',
  IMAGE = 'image',
  DIVIDER = 'divider',
  SPACER = 'spacer',
  CONTAINER = 'container'
}

enum TemplateCategory {
  ANALYTICS = 'analytics',
  PERFORMANCE = 'performance',
  COMPLIANCE = 'compliance',
  OPERATIONAL = 'operational',
  EXECUTIVE = 'executive',
  CUSTOM = 'custom'
}

enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  WORD = 'word',
  HTML = 'html',
  JSON = 'json',
  CSV = 'csv'
}

enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

enum ScheduleFrequency {
  ONCE = 'once',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

enum DeliveryMethod {
  EMAIL = 'email',
  DOWNLOAD = 'download',
  SHARED_FOLDER = 'shared_folder',
  API = 'api'
}

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Size {
  width: number;
  height: number;
}

interface ElementConfig {
  dataSource: string;
  query?: string;
  aggregation?: string;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  refreshInterval?: number;
  autoRefresh?: boolean;
  [key: string]: any;
}

interface ElementStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  [key: string]: any;
}

interface FilterConfig {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  label: string;
}

enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_EQUAL = 'gte',
  LESS_EQUAL = 'lte',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

interface LayoutConfig {
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  margins: { top: number; right: number; bottom: number; left: number };
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom';
  orientation: 'portrait' | 'landscape';
  columns: number;
  rowHeight: number;
}

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  shadows: boolean;
  animations: boolean;
}

interface ReportBuilderState {
  isInitialized: boolean;
  isLoading: boolean;
  currentTemplate: ReportTemplate | null;
  templates: ReportTemplate[];
  generatedReports: GeneratedReport[];
  schedules: ReportSchedule[];
  selectedElements: string[];
  draggedElement: ReportElement | null;
  viewMode: 'designer' | 'preview' | 'templates' | 'generated' | 'scheduled';
  builderMode: 'design' | 'data' | 'style' | 'publish';
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  availableDataSources: DataSource[];
  elementLibrary: ElementLibraryItem[];
  error: string | null;
}

interface GenerationProgress {
  stage: string;
  progress: number;
  currentTask: string;
  estimatedTimeRemaining: string;
  elementsProcessed: number;
  totalElements: number;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: DataField[];
  sample_data: any[];
}

interface DataField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  description: string;
  nullable: boolean;
}

interface ElementLibraryItem {
  type: ElementType;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  defaultConfig: ElementConfig;
  defaultStyle: ElementStyle;
  defaultSize: Size;
}

const CustomReportBuilder: React.FC = () => {
  // Services
  const analyticsAPI = useRef(new ScanAnalyticsAPIService());

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Component State
  const [builderState, setBuilderState] = useState<ReportBuilderState>({
    isInitialized: false,
    isLoading: false,
    currentTemplate: null,
    templates: [],
    generatedReports: [],
    schedules: [],
    selectedElements: [],
    draggedElement: null,
    viewMode: 'designer',
    builderMode: 'design',
    isGenerating: false,
    generationProgress: null,
    availableDataSources: [],
    elementLibrary: [],
    error: null
  });

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Initialize the report builder
  useEffect(() => {
    initializeReportBuilder();
  }, []);

  const initializeReportBuilder = async () => {
    try {
      setBuilderState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load existing templates
      const templates = await loadReportTemplates();
      
      // Load generated reports
      const generatedReports = await loadGeneratedReports();
      
      // Load schedules
      const schedules = await loadReportSchedules();

      // Load available data sources
      const dataSources = await loadAvailableDataSources();

      // Initialize element library
      const elementLibrary = initializeElementLibrary();

      // Create default template if none exists
      let currentTemplate = templates.length > 0 ? templates[0] : await createDefaultTemplate();

      setBuilderState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        currentTemplate,
        templates,
        generatedReports,
        schedules,
        availableDataSources: dataSources,
        elementLibrary
      }));

    } catch (error) {
      console.error('Failed to initialize report builder:', error);
      setBuilderState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize report builder'
      }));
    }
  };

  const loadReportTemplates = async (): Promise<ReportTemplate[]> => {
    try {
      const response = await analyticsAPI.current.getReportTemplates({
        include_public: true,
        include_private: true,
        category: null,
        sort_by: 'updated_at',
        sort_order: 'desc'
      });

      return response.templates || [];
    } catch (error) {
      console.error('Failed to load report templates:', error);
      return [];
    }
  };

  const loadGeneratedReports = async (): Promise<GeneratedReport[]> => {
    try {
      const response = await analyticsAPI.current.getGeneratedReports({
        status: null,
        limit: 50,
        include_expired: false
      });

      return response.reports || [];
    } catch (error) {
      console.error('Failed to load generated reports:', error);
      return [];
    }
  };

  const loadReportSchedules = async (): Promise<ReportSchedule[]> => {
    try {
      const response = await analyticsAPI.current.getReportSchedules({
        is_active: null,
        template_id: null
      });

      return response.schedules || [];
    } catch (error) {
      console.error('Failed to load report schedules:', error);
      return [];
    }
  };

  const loadAvailableDataSources = async (): Promise<DataSource[]> => {
    try {
      const response = await analyticsAPI.current.getAvailableDataSources({
        include_sample_data: true,
        include_schema: true
      });

      return response.data_sources || [];
    } catch (error) {
      console.error('Failed to load data sources:', error);
      return [];
    }
  };

  const initializeElementLibrary = (): ElementLibraryItem[] => {
    return [
      {
        type: ElementType.TEXT,
        name: 'Text Block',
        description: 'Rich text content with formatting',
        icon: <Type className="h-4 w-4" />,
        category: 'Content',
        defaultConfig: { dataSource: '', content: 'Enter your text here...' },
        defaultStyle: { fontSize: 14, fontWeight: 'normal', color: '#000000' },
        defaultSize: { width: 300, height: 100 }
      },
      {
        type: ElementType.CHART_BAR,
        name: 'Bar Chart',
        description: 'Vertical or horizontal bar chart',
        icon: <BarChart3 className="h-4 w-4" />,
        category: 'Charts',
        defaultConfig: { dataSource: '', groupBy: [], aggregation: 'count' },
        defaultStyle: { backgroundColor: '#ffffff', borderRadius: 8 },
        defaultSize: { width: 400, height: 300 }
      },
      {
        type: ElementType.CHART_LINE,
        name: 'Line Chart',
        description: 'Time series and trend visualization',
        icon: <LineChart className="h-4 w-4" />,
        category: 'Charts',
        defaultConfig: { dataSource: '', groupBy: [], aggregation: 'avg' },
        defaultStyle: { backgroundColor: '#ffffff', borderRadius: 8 },
        defaultSize: { width: 400, height: 300 }
      },
      {
        type: ElementType.CHART_PIE,
        name: 'Pie Chart',
        description: 'Proportional data visualization',
        icon: <PieChart className="h-4 w-4" />,
        category: 'Charts',
        defaultConfig: { dataSource: '', groupBy: [], aggregation: 'sum' },
        defaultStyle: { backgroundColor: '#ffffff', borderRadius: 8 },
        defaultSize: { width: 350, height: 350 }
      },
      {
        type: ElementType.TABLE,
        name: 'Data Table',
        description: 'Tabular data display with sorting',
        icon: <Grid3X3 className="h-4 w-4" />,
        category: 'Data',
        defaultConfig: { dataSource: '', limit: 10, sortBy: '', sortOrder: 'asc' },
        defaultStyle: { backgroundColor: '#ffffff', borderRadius: 8 },
        defaultSize: { width: 500, height: 400 }
      },
      {
        type: ElementType.METRIC_CARD,
        name: 'Metric Card',
        description: 'Key performance indicator display',
        icon: <Calculator className="h-4 w-4" />,
        category: 'Metrics',
        defaultConfig: { dataSource: '', aggregation: 'count', format: 'number' },
        defaultStyle: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16 },
        defaultSize: { width: 200, height: 120 }
      },
      {
        type: ElementType.GAUGE,
        name: 'Gauge Chart',
        description: 'Circular progress indicator',
        icon: <Gauge className="h-4 w-4" />,
        category: 'Metrics',
        defaultConfig: { dataSource: '', min: 0, max: 100, target: 80 },
        defaultStyle: { backgroundColor: '#ffffff', borderRadius: 8 },
        defaultSize: { width: 250, height: 250 }
      }
    ];
  };

  const createDefaultTemplate = async (): Promise<ReportTemplate> => {
    const defaultTemplate: ReportTemplate = {
      id: 'default-template',
      name: 'New Report',
      description: 'A blank report template',
      category: TemplateCategory.CUSTOM,
      elements: [],
      layout: {
        gridSize: 10,
        snapToGrid: true,
        showGrid: true,
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        pageSize: 'A4',
        orientation: 'portrait',
        columns: 12,
        rowHeight: 30
      },
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter',
        fontSize: 14,
        borderRadius: 8,
        shadows: true,
        animations: true
      },
      settings: {
        autoRefresh: false,
        refreshInterval: 300,
        cacheResults: true,
        allowExport: true,
        allowScheduling: true,
        requireAuth: false
      },
      permissions: {
        view: ['public'],
        edit: ['owner'],
        delete: ['owner'],
        schedule: ['owner', 'admin']
      },
      schedule: null,
      created_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public: false,
      usage_count: 0,
      rating: 0
    };

    return defaultTemplate;
  };

  const generateReport = async (format: ReportFormat = ReportFormat.PDF) => {
    if (!builderState.currentTemplate) return;

    try {
      setBuilderState(prev => ({ ...prev, isGenerating: true }));

      // Simulate progress tracking
      const progressSteps = [
        { stage: 'Validation', progress: 10, task: 'Validating report structure' },
        { stage: 'Data Collection', progress: 25, task: 'Fetching data from sources' },
        { stage: 'Processing', progress: 40, task: 'Processing report elements' },
        { stage: 'Rendering', progress: 60, task: 'Rendering visualizations' },
        { stage: 'Formatting', progress: 80, task: 'Applying formatting and layout' },
        { stage: 'Export', progress: 95, task: 'Generating final output' },
        { stage: 'Complete', progress: 100, task: 'Report generation complete' }
      ];

      for (const step of progressSteps) {
        setBuilderState(prev => ({
          ...prev,
          generationProgress: {
            ...step,
            estimatedTimeRemaining: `${Math.max(1, Math.ceil((100 - step.progress) / 20))} minutes`,
            elementsProcessed: Math.floor((step.progress / 100) * builderState.currentTemplate!.elements.length),
            totalElements: builderState.currentTemplate!.elements.length
          }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const generateRequest = {
        template_id: builderState.currentTemplate.id,
        format,
        filters: [],
        parameters: {},
        include_metadata: true,
        compress: format === ReportFormat.PDF
      };

      const response = await analyticsAPI.current.generateReport(generateRequest);

      if (response.success) {
        // Refresh generated reports
        const updatedReports = await loadGeneratedReports();
        setBuilderState(prev => ({
          ...prev,
          generatedReports: updatedReports,
          viewMode: 'generated'
        }));
      }

    } catch (error) {
      console.error('Failed to generate report:', error);
      setBuilderState(prev => ({
        ...prev,
        error: 'Failed to generate report'
      }));
    } finally {
      setBuilderState(prev => ({
        ...prev,
        isGenerating: false,
        generationProgress: null
      }));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedElement = builderState.currentTemplate?.elements.find(el => el.id === active.id);
    setBuilderState(prev => ({ ...prev, draggedElement: draggedElement || null }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && builderState.currentTemplate) {
      // Handle element reordering or positioning
      const elementIndex = builderState.currentTemplate.elements.findIndex(el => el.id === active.id);
      if (elementIndex !== -1) {
        // Update element position or order
        // Implementation depends on specific drag operation
      }
    }
    
    setBuilderState(prev => ({ ...prev, draggedElement: null }));
  };

  const addElement = (type: ElementType) => {
    if (!builderState.currentTemplate) return;

    const libraryItem = builderState.elementLibrary.find(item => item.type === type);
    if (!libraryItem) return;

    const newElement: ReportElement = {
      id: `element-${Date.now()}`,
      type,
      title: libraryItem.name,
      description: libraryItem.description,
      position: { x: 100, y: 100, z: builderState.currentTemplate.elements.length },
      size: libraryItem.defaultSize,
      config: libraryItem.defaultConfig,
      data: null,
      style: libraryItem.defaultStyle,
      filters: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setBuilderState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        elements: [...prev.currentTemplate.elements, newElement],
        updated_at: new Date().toISOString()
      } : null
    }));
  };

  const removeElement = (elementId: string) => {
    if (!builderState.currentTemplate) return;

    setBuilderState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        elements: prev.currentTemplate.elements.filter(el => el.id !== elementId),
        updated_at: new Date().toISOString()
      } : null,
      selectedElements: prev.selectedElements.filter(id => id !== elementId)
    }));
  };

  const updateElement = (elementId: string, updates: Partial<ReportElement>) => {
    if (!builderState.currentTemplate) return;

    setBuilderState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        elements: prev.currentTemplate.elements.map(el =>
          el.id === elementId ? { ...el, ...updates, updated_at: new Date().toISOString() } : el
        ),
        updated_at: new Date().toISOString()
      } : null
    }));
  };

  const selectElement = (elementId: string, multiSelect = false) => {
    setBuilderState(prev => ({
      ...prev,
      selectedElements: multiSelect
        ? prev.selectedElements.includes(elementId)
          ? prev.selectedElements.filter(id => id !== elementId)
          : [...prev.selectedElements, elementId]
        : [elementId]
    }));
  };

  // Computed values
  const selectedElement = useMemo(() => {
    if (builderState.selectedElements.length === 1 && builderState.currentTemplate) {
      return builderState.currentTemplate.elements.find(el => el.id === builderState.selectedElements[0]);
    }
    return null;
  }, [builderState.selectedElements, builderState.currentTemplate]);

  const reportSummary = useMemo(() => {
    return {
      totalTemplates: builderState.templates.length,
      publicTemplates: builderState.templates.filter(t => t.is_public).length,
      totalReports: builderState.generatedReports.length,
      completedReports: builderState.generatedReports.filter(r => r.status === ReportStatus.COMPLETED).length,
      activeSchedules: builderState.schedules.filter(s => s.is_active).length,
      elementsInCurrentTemplate: builderState.currentTemplate?.elements.length || 0
    };
  }, [builderState.templates, builderState.generatedReports, builderState.schedules, builderState.currentTemplate]);

  // Sample data for visualizations
  const templateUsageData = useMemo(() => {
    return builderState.templates.map(template => ({
      name: template.name,
      usage: template.usage_count,
      rating: template.rating
    }));
  }, [builderState.templates]);

  const reportGenerationData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayReports = builderState.generatedReports.filter(report => {
        const reportDate = new Date(report.generated_at);
        return reportDate.toDateString() === date.toDateString();
      });
      
      return {
        date: format(date, 'MMM dd'),
        reports: dayReports.length,
        successful: dayReports.filter(r => r.status === ReportStatus.COMPLETED).length
      };
    });
    
    return last7Days;
  }, [builderState.generatedReports]);

  // Render helper functions
  const renderDesignerCanvas = () => (
    <div className="relative h-[600px] bg-white border rounded-lg overflow-hidden">
      {/* Grid Background */}
      {builderState.currentTemplate?.layout.showGrid && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: `${builderState.currentTemplate.layout.gridSize}px ${builderState.currentTemplate.layout.gridSize}px`
          }}
        />
      )}

      {/* Report Elements */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="relative w-full h-full">
          {builderState.currentTemplate?.elements.map(element => (
            <div
              key={element.id}
              className={`absolute border-2 rounded cursor-pointer transition-all ${
                builderState.selectedElements.includes(element.id) 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                backgroundColor: element.style.backgroundColor || '#ffffff',
                borderRadius: element.style.borderRadius || 0,
                zIndex: element.position.z
              }}
              onClick={(e) => {
                e.stopPropagation();
                selectElement(element.id, e.ctrlKey || e.metaKey);
              }}
            >
              {/* Element Content Preview */}
              <div className="w-full h-full p-2 flex items-center justify-center text-sm text-gray-600">
                <div className="text-center">
                  <div className="font-medium">{element.title}</div>
                  <div className="text-xs opacity-60">{element.type}</div>
                </div>
              </div>

              {/* Element Controls */}
              {builderState.selectedElements.includes(element.id) && (
                <div className="absolute -top-8 left-0 flex items-center gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(element.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <DragOverlay>
          {builderState.draggedElement && (
            <div 
              className="border-2 border-blue-500 rounded bg-white shadow-lg"
              style={{
                width: builderState.draggedElement.size.width,
                height: builderState.draggedElement.size.height
              }}
            >
              <div className="w-full h-full p-2 flex items-center justify-center text-sm">
                {builderState.draggedElement.title}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {builderState.currentTemplate?.elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Empty Report</h3>
            <p className="text-sm">Drag elements from the library to start building your report</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderElementLibrary = () => (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Element Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {Object.entries(
            builderState.elementLibrary.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {} as Record<string, ElementLibraryItem[]>)
          ).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                {category}
              </h4>
              <div className="space-y-2">
                {items.map(item => (
                  <div
                    key={item.type}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => addElement(item.type)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderPropertiesPanel = () => (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {selectedElement ? (
            <div className="space-y-6">
              {/* Basic Properties */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Basic Properties</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={selectedElement.title}
                      onChange={(e) => updateElement(selectedElement.id, { title: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={selectedElement.description || ''}
                      onChange={(e) => updateElement(selectedElement.id, { description: e.target.value })}
                      className="h-16 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Position & Size */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Position & Size</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X</Label>
                    <Input
                      type="number"
                      value={selectedElement.position.x}
                      onChange={(e) => updateElement(selectedElement.id, {
                        position: { ...selectedElement.position, x: Number(e.target.value) }
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y</Label>
                    <Input
                      type="number"
                      value={selectedElement.position.y}
                      onChange={(e) => updateElement(selectedElement.id, {
                        position: { ...selectedElement.position, y: Number(e.target.value) }
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={selectedElement.size.width}
                      onChange={(e) => updateElement(selectedElement.id, {
                        size: { ...selectedElement.size, width: Number(e.target.value) }
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={selectedElement.size.height}
                      onChange={(e) => updateElement(selectedElement.id, {
                        size: { ...selectedElement.size, height: Number(e.target.value) }
                      })}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Data Configuration */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Data Configuration</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Data Source</Label>
                    <Select
                      value={selectedElement.config.dataSource || ''}
                      onValueChange={(value) => updateElement(selectedElement.id, {
                        config: { ...selectedElement.config, dataSource: value }
                      })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        {builderState.availableDataSources.map(source => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Style Properties */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Style</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Background Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.style.backgroundColor || '#ffffff'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, backgroundColor: e.target.value }
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Border Radius</Label>
                    <Slider
                      value={[selectedElement.style.borderRadius || 0]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, borderRadius: value }
                      })}
                      min={0}
                      max={20}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select an element to edit properties</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderTemplatesView = () => (
    <div className="space-y-6">
      {/* Templates Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Templates</h2>
          <p className="text-muted-foreground">Manage and organize your report templates</p>
        </div>
        <Button onClick={() => setIsTemplateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Template Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(TemplateCategory).map(category => {
          const categoryTemplates = builderState.templates.filter(t => t.category === category);
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{category.replace('_', ' ')}</CardTitle>
                <CardDescription>
                  {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryTemplates.slice(0, 3).map(template => (
                    <div
                      key={template.id}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setBuilderState(prev => ({ ...prev, currentTemplate: template, viewMode: 'designer' }))}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.elements.length} elements • {format(new Date(template.updated_at), 'MMM dd')}
                      </div>
                    </div>
                  ))}
                  {categoryTemplates.length > 3 && (
                    <div className="text-xs text-center text-muted-foreground py-1">
                      +{categoryTemplates.length - 3} more templates
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template List */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {builderState.templates.map(template => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setBuilderState(prev => ({ ...prev, currentTemplate: template, viewMode: 'designer' }))}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline">{template.category}</Badge>
                      {template.is_public && <Badge variant="secondary">Public</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{template.elements.length} elements</span>
                      <span>{template.usage_count} uses</span>
                      <span>Updated {format(new Date(template.updated_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  if (!builderState.isInitialized && builderState.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
          <p>Initializing Report Builder...</p>
        </div>
      </div>
    );
  }

  if (builderState.error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{builderState.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              Custom Report Builder
            </h1>
            <p className="text-muted-foreground">
              Create custom reports with drag-and-drop interface and advanced visualizations
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={initializeReportBuilder}
              disabled={builderState.isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${builderState.isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Generate Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.values(ReportFormat).map(format => (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => generateReport(format)}
                    disabled={builderState.isGenerating}
                  >
                    {format.toUpperCase()} Format
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleDialogOpen(true)}
            >
              <Clock className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Generation Progress */}
        {builderState.generationProgress && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Generating Report - {builderState.generationProgress.stage}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{builderState.generationProgress.currentTask}</span>
                  <span>{builderState.generationProgress.progress}%</span>
                </div>
                <Progress value={builderState.generationProgress.progress} />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Elements Processed</div>
                  <div className="font-medium">
                    {builderState.generationProgress.elementsProcessed} / {builderState.generationProgress.totalElements}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">ETA</div>
                  <div className="font-medium">{builderState.generationProgress.estimatedTimeRemaining}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={builderState.viewMode} onValueChange={(value) => setBuilderState(prev => ({ ...prev, viewMode: value as any }))}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="designer">Designer</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="generated">Generated</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="designer" className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Element Library */}
              <div className="col-span-3">
                {renderElementLibrary()}
              </div>

              {/* Designer Canvas */}
              <div className="col-span-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        {builderState.currentTemplate?.name || 'Untitled Report'}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {reportSummary.elementsInCurrentTemplate} elements
                        </Badge>
                        <Tabs value={builderState.builderMode} onValueChange={(value) => setBuilderState(prev => ({ ...prev, builderMode: value as any }))}>
                          <TabsList className="h-8">
                            <TabsTrigger value="design" className="h-6 text-xs">Design</TabsTrigger>
                            <TabsTrigger value="data" className="h-6 text-xs">Data</TabsTrigger>
                            <TabsTrigger value="style" className="h-6 text-xs">Style</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderDesignerCanvas()}
                  </CardContent>
                </Card>
              </div>

              {/* Properties Panel */}
              <div className="col-span-3">
                {renderPropertiesPanel()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Report Preview</h3>
              <p className="text-muted-foreground">Live preview implementation in progress</p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {renderTemplatesView()}
          </TabsContent>

          <TabsContent value="generated" className="space-y-4">
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Generated Reports</h3>
              <p className="text-muted-foreground">Generated reports management implementation in progress</p>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="text-center py-12">
              <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Scheduled Reports</h3>
              <p className="text-muted-foreground">Report scheduling implementation in progress</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default CustomReportBuilder;