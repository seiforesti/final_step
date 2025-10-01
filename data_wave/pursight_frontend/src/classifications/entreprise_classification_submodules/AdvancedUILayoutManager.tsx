import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { 
  Layout, Grid, List, Kanban, Calendar, Map, BarChart3, 
  Settings, Eye, EyeOff, Maximize, Minimize, RotateCcw,
  Save, Download, Upload, Trash2, Copy, Edit, Plus,
  Monitor, Smartphone, Tablet, Laptop, Desktop,
  Palette, Type, Spacing, Layers, Grid3X3,
  Search, Filter, SortAsc, SortDesc, MoreVertical,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Home, Star, Bookmark, History, Settings2, User,
  Bell, Mail, MessageSquare, Share, Lock, Unlock
} from 'lucide-react';
import { toast } from 'sonner';

// Advanced Layout Types
export interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  type: LayoutType;
  structure: LayoutStructure;
  theme: ThemeConfig;
  responsive: ResponsiveConfig;
  accessibility: AccessibilityConfig;
  performance: PerformanceConfig;
  customization: CustomizationConfig;
  metadata: LayoutMetadata;
}

export interface LayoutStructure {
  header: HeaderConfig;
  sidebar: SidebarConfig;
  main: MainContentConfig;
  footer: FooterConfig;
  panels: PanelConfig[];
  widgets: WidgetConfig[];
  navigation: NavigationConfig;
  breadcrumbs: BreadcrumbConfig;
}

export interface HeaderConfig {
  enabled: boolean;
  height: number;
  position: 'fixed' | 'sticky' | 'static';
  background: string;
  border: boolean;
  shadow: boolean;
  components: HeaderComponent[];
  search: SearchConfig;
  notifications: NotificationConfig;
  userMenu: UserMenuConfig;
}

export interface SidebarConfig {
  enabled: boolean;
  width: number;
  position: 'left' | 'right';
  collapsible: boolean;
  collapsed: boolean;
  overlay: boolean;
  background: string;
  border: boolean;
  shadow: boolean;
  components: SidebarComponent[];
  navigation: NavigationItem[];
  filters: FilterConfig;
}

export interface MainContentConfig {
  layout: 'single' | 'split' | 'grid' | 'masonry' | 'timeline';
  columns: number;
  gap: number;
  padding: number;
  background: string;
  scrollable: boolean;
  virtualized: boolean;
  lazy: boolean;
  components: MainComponent[];
}

export interface FooterConfig {
  enabled: boolean;
  height: number;
  position: 'fixed' | 'sticky' | 'static';
  background: string;
  border: boolean;
  shadow: boolean;
  components: FooterComponent[];
  links: FooterLink[];
  copyright: string;
}

export interface PanelConfig {
  id: string;
  title: string;
  type: 'floating' | 'docked' | 'modal' | 'drawer';
  position: { x: number; y: number; width: number; height: number };
  resizable: boolean;
  draggable: boolean;
  collapsible: boolean;
  collapsed: boolean;
  closable: boolean;
  background: string;
  border: boolean;
  shadow: boolean;
  components: PanelComponent[];
  zIndex: number;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; width: number; height: number };
  resizable: boolean;
  draggable: boolean;
  collapsible: boolean;
  collapsed: boolean;
  closable: boolean;
  background: string;
  border: boolean;
  shadow: boolean;
  data: any;
  refreshInterval: number;
  autoRefresh: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto' | 'high-contrast';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  custom: Record<string, string>;
  fonts: FontConfig;
  spacing: SpacingConfig;
  borderRadius: number;
  animations: AnimationConfig;
}

export interface ResponsiveConfig {
  breakpoints: BreakpointConfig[];
  mobile: MobileConfig;
  tablet: TabletConfig;
  desktop: DesktopConfig;
  adaptive: boolean;
  fluid: boolean;
}

export interface AccessibilityConfig {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  focusIndicators: boolean;
  ariaLabels: boolean;
  colorBlindSupport: boolean;
  voiceControl: boolean;
}

export interface PerformanceConfig {
  lazyLoading: boolean;
  virtualization: boolean;
  memoization: boolean;
  debouncing: boolean;
  throttling: boolean;
  caching: boolean;
  compression: boolean;
  minification: boolean;
  bundleSplitting: boolean;
  preloading: boolean;
}

export interface CustomizationConfig {
  allowThemes: boolean;
  allowLayouts: boolean;
  allowWidgets: boolean;
  allowShortcuts: boolean;
  allowExtensions: boolean;
  allowPlugins: boolean;
  allowScripts: boolean;
  allowStyles: boolean;
  allowComponents: boolean;
  allowTemplates: boolean;
}

export interface LayoutMetadata {
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  tags: string[];
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  compatibility: string[];
  dependencies: string[];
  features: string[];
  limitations: string[];
}

// Component Types
export type LayoutType = 'dashboard' | 'workspace' | 'editor' | 'viewer' | 'admin' | 'custom';
export type WidgetType = 'chart' | 'table' | 'form' | 'list' | 'card' | 'map' | 'calendar' | 'timeline' | 'kanban' | 'custom';
export type HeaderComponent = 'logo' | 'title' | 'search' | 'notifications' | 'user-menu' | 'breadcrumbs' | 'actions' | 'custom';
export type SidebarComponent = 'navigation' | 'filters' | 'bookmarks' | 'recent' | 'favorites' | 'tools' | 'custom';
export type MainComponent = 'content' | 'sidebar' | 'panel' | 'widget' | 'form' | 'table' | 'chart' | 'custom';
export type FooterComponent = 'links' | 'copyright' | 'social' | 'newsletter' | 'custom';
export type PanelComponent = 'header' | 'content' | 'footer' | 'actions' | 'custom';

// Configuration Interfaces
export interface NavigationConfig {
  style: 'vertical' | 'horizontal' | 'breadcrumb' | 'tabs' | 'pills';
  position: 'top' | 'bottom' | 'left' | 'right';
  showLabels: boolean;
  showIcons: boolean;
  groupBy: 'category' | 'frequency' | 'alphabetical' | 'custom';
  items: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  children?: NavigationItem[];
  badge?: string;
  disabled?: boolean;
  hidden?: boolean;
  permissions?: string[];
}

export interface BreadcrumbConfig {
  enabled: boolean;
  separator: string;
  showHome: boolean;
  maxItems: number;
  style: 'default' | 'minimal' | 'detailed';
}

export interface SearchConfig {
  enabled: boolean;
  placeholder: string;
  suggestions: boolean;
  history: boolean;
  filters: boolean;
  shortcuts: boolean;
  position: 'header' | 'sidebar' | 'floating' | 'modal';
}

export interface NotificationConfig {
  enabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  maxVisible: number;
  autoHide: boolean;
  duration: number;
  sound: boolean;
  vibration: boolean;
}

export interface UserMenuConfig {
  enabled: boolean;
  position: 'header' | 'sidebar' | 'floating';
  showAvatar: boolean;
  showName: boolean;
  showRole: boolean;
  showStatus: boolean;
  items: UserMenuItem[];
}

export interface UserMenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  permissions?: string[];
}

export interface FilterConfig {
  enabled: boolean;
  position: 'sidebar' | 'top' | 'floating';
  collapsible: boolean;
  collapsed: boolean;
  filters: FilterItem[];
}

export interface FilterItem {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean' | 'custom';
  options?: any[];
  defaultValue?: any;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
}

export interface PanelComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface FontConfig {
  primary: string;
  secondary: string;
  mono: string;
  sizes: Record<string, number>;
  weights: Record<string, number>;
  lineHeights: Record<string, number>;
}

export interface SpacingConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  reducedMotion: boolean;
  transitions: Record<string, any>;
}

export interface BreakpointConfig {
  name: string;
  minWidth: number;
  maxWidth?: number;
  columns: number;
  gap: number;
  padding: number;
}

export interface MobileConfig {
  layout: 'stack' | 'tabs' | 'drawer' | 'modal';
  navigation: 'bottom' | 'top' | 'drawer' | 'floating';
  gestures: boolean;
  touchOptimized: boolean;
  orientation: 'portrait' | 'landscape' | 'auto';
}

export interface TabletConfig {
  layout: 'split' | 'grid' | 'stack';
  navigation: 'sidebar' | 'tabs' | 'drawer';
  gestures: boolean;
  touchOptimized: boolean;
  orientation: 'portrait' | 'landscape' | 'auto';
}

export interface DesktopConfig {
  layout: 'multi-panel' | 'workspace' | 'dashboard';
  navigation: 'sidebar' | 'top' | 'floating';
  shortcuts: boolean;
  multiWindow: boolean;
  fullscreen: boolean;
}

// Advanced UI Layout Manager Component
interface AdvancedUILayoutManagerProps {
  initialLayout?: Partial<LayoutConfig>;
  onLayoutChange?: (layout: LayoutConfig) => void;
  onLayoutSave?: (layout: LayoutConfig) => void;
  onLayoutLoad?: (layoutId: string) => void;
  className?: string;
}

const AdvancedUILayoutManager: React.FC<AdvancedUILayoutManagerProps> = ({
  initialLayout,
  onLayoutChange,
  onLayoutSave,
  onLayoutLoad,
  className = ''
}) => {
  // State Management
  const [currentLayout, setCurrentLayout] = useState<LayoutConfig>({
    id: 'default-layout',
    name: 'Default Layout',
    description: 'Default enterprise layout configuration',
    type: 'dashboard',
    structure: {
      header: {
        enabled: true,
        height: 64,
        position: 'fixed',
        background: '#ffffff',
        border: true,
        shadow: true,
        components: ['logo', 'title', 'search', 'notifications', 'user-menu'],
        search: {
          enabled: true,
          placeholder: 'Search...',
          suggestions: true,
          history: true,
          filters: true,
          shortcuts: true,
          position: 'header'
        },
        notifications: {
          enabled: true,
          position: 'top-right',
          maxVisible: 5,
          autoHide: true,
          duration: 5000,
          sound: false,
          vibration: false
        },
        userMenu: {
          enabled: true,
          position: 'header',
          showAvatar: true,
          showName: true,
          showRole: true,
          showStatus: true,
          items: []
        }
      },
      sidebar: {
        enabled: true,
        width: 256,
        position: 'left',
        collapsible: true,
        collapsed: false,
        overlay: false,
        background: '#f8f9fa',
        border: true,
        shadow: false,
        components: ['navigation', 'filters'],
        navigation: [],
        filters: {
          enabled: true,
          position: 'sidebar',
          collapsible: true,
          collapsed: false,
          filters: []
        }
      },
      main: {
        layout: 'single',
        columns: 1,
        gap: 16,
        padding: 24,
        background: '#ffffff',
        scrollable: true,
        virtualized: false,
        lazy: true,
        components: []
      },
      footer: {
        enabled: true,
        height: 48,
        position: 'static',
        background: '#f8f9fa',
        border: true,
        shadow: false,
        components: ['links', 'copyright'],
        links: [],
        copyright: '© 2024 Enterprise Classification System'
      },
      panels: [],
      widgets: [],
      navigation: {
        style: 'vertical',
        position: 'left',
        showLabels: true,
        showIcons: true,
        groupBy: 'category',
        items: []
      },
      breadcrumbs: {
        enabled: true,
        separator: '/',
        showHome: true,
        maxItems: 5,
        style: 'default'
      }
    },
    theme: {
      mode: 'light',
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      shadow: 'rgba(0, 0, 0, 0.1)',
      custom: {},
      fonts: {
        primary: 'Inter',
        secondary: 'Roboto',
        mono: 'Fira Code',
        sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 },
        weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.75 }
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
      borderRadius: 8,
      animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
        reducedMotion: false,
        transitions: {}
      }
    },
    responsive: {
      breakpoints: [
        { name: 'xs', minWidth: 0, maxWidth: 576, columns: 1, gap: 8, padding: 16 },
        { name: 'sm', minWidth: 576, maxWidth: 768, columns: 2, gap: 12, padding: 20 },
        { name: 'md', minWidth: 768, maxWidth: 992, columns: 3, gap: 16, padding: 24 },
        { name: 'lg', minWidth: 992, maxWidth: 1200, columns: 4, gap: 20, padding: 28 },
        { name: 'xl', minWidth: 1200, columns: 5, gap: 24, padding: 32 }
      ],
      mobile: {
        layout: 'stack',
        navigation: 'bottom',
        gestures: true,
        touchOptimized: true,
        orientation: 'auto'
      },
      tablet: {
        layout: 'split',
        navigation: 'sidebar',
        gestures: true,
        touchOptimized: true,
        orientation: 'auto'
      },
      desktop: {
        layout: 'multi-panel',
        navigation: 'sidebar',
        shortcuts: true,
        multiWindow: true,
        fullscreen: true
      },
      adaptive: true,
      fluid: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      reducedMotion: false,
      focusIndicators: true,
      ariaLabels: true,
      colorBlindSupport: false,
      voiceControl: false
    },
    performance: {
      lazyLoading: true,
      virtualization: false,
      memoization: true,
      debouncing: true,
      throttling: true,
      caching: true,
      compression: true,
      minification: true,
      bundleSplitting: true,
      preloading: false
    },
    customization: {
      allowThemes: true,
      allowLayouts: true,
      allowWidgets: true,
      allowShortcuts: true,
      allowExtensions: false,
      allowPlugins: false,
      allowScripts: false,
      allowStyles: true,
      allowComponents: true,
      allowTemplates: true
    },
    metadata: {
      version: '1.0.0',
      createdBy: 'system',
      createdAt: new Date(),
      updatedBy: 'system',
      updatedAt: new Date(),
      tags: ['default', 'enterprise'],
      description: 'Default enterprise layout configuration',
      category: 'dashboard',
      difficulty: 'beginner',
      compatibility: ['chrome', 'firefox', 'safari', 'edge'],
      dependencies: [],
      features: ['responsive', 'accessible', 'customizable'],
      limitations: []
    },
    ...initialLayout
  });

  const [activeTab, setActiveTab] = useState('structure');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditing, setIsEditing] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<LayoutConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const layoutRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    onLayoutChange?.(currentLayout);
  }, [currentLayout, onLayoutChange]);

  useEffect(() => {
    // Load saved layouts from localStorage
    const saved = localStorage.getItem('saved-layouts');
    if (saved) {
      try {
        setSavedLayouts(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved layouts:', error);
      }
    }
  }, []);

  // Event Handlers
  const handleLayoutUpdate = useCallback((updates: Partial<LayoutConfig>) => {
    setCurrentLayout(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date(),
        updatedBy: 'user'
      }
    }));
  }, []);

  const handleSaveLayout = useCallback(() => {
    setIsLoading(true);
    try {
      const updatedLayout = {
        ...currentLayout,
        id: `layout-${Date.now()}`,
        metadata: {
          ...currentLayout.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      const newSavedLayouts = [...savedLayouts, updatedLayout];
      setSavedLayouts(newSavedLayouts);
      localStorage.setItem('saved-layouts', JSON.stringify(newSavedLayouts));
      
      onLayoutSave?.(updatedLayout);
      toast.success('Layout saved successfully');
    } catch (error) {
      toast.error('Failed to save layout');
    } finally {
      setIsLoading(false);
    }
  }, [currentLayout, savedLayouts, onLayoutSave]);

  const handleLoadLayout = useCallback((layoutId: string) => {
    const layout = savedLayouts.find(l => l.id === layoutId);
    if (layout) {
      setCurrentLayout(layout);
      onLayoutLoad?.(layoutId);
      toast.success('Layout loaded successfully');
    }
  }, [savedLayouts, onLayoutLoad]);

  const handleResetLayout = useCallback(() => {
    setCurrentLayout({
      ...currentLayout,
      structure: {
        ...currentLayout.structure,
        header: { ...currentLayout.structure.header, collapsed: false },
        sidebar: { ...currentLayout.structure.sidebar, collapsed: false },
        main: { ...currentLayout.structure.main, layout: 'single' }
      }
    });
    toast.info('Layout reset to defaults');
  }, [currentLayout]);

  const handleExportLayout = useCallback(() => {
    const dataStr = JSON.stringify(currentLayout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layout-${currentLayout.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Layout exported successfully');
  }, [currentLayout]);

  const handleImportLayout = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedLayout = JSON.parse(e.target?.result as string);
          setCurrentLayout(importedLayout);
          toast.success('Layout imported successfully');
        } catch (error) {
          toast.error('Failed to import layout');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Computed Values
  const layoutPreview = useMemo(() => {
    const { structure, theme, responsive } = currentLayout;
    const breakpoint = responsive.breakpoints.find(bp => 
      window.innerWidth >= bp.minWidth && 
      (!bp.maxWidth || window.innerWidth <= bp.maxWidth)
    ) || responsive.breakpoints[0];

    return {
      columns: breakpoint.columns,
      gap: breakpoint.gap,
      padding: breakpoint.padding,
      theme: theme.mode,
      layout: structure.main.layout
    };
  }, [currentLayout]);

  const layoutStats = useMemo(() => {
    const { structure } = currentLayout;
    return {
      components: structure.header.components.length + 
                 structure.sidebar.components.length + 
                 structure.main.components.length + 
                 structure.footer.components.length,
      panels: structure.panels.length,
      widgets: structure.widgets.length,
      navigationItems: structure.navigation.items.length,
      filters: structure.sidebar.filters.filters.length
    };
  }, [currentLayout]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-6 w-6" />
                Advanced UI Layout Manager
              </CardTitle>
              <CardDescription>
                Enterprise-grade layout configuration and management system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveLayout}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Layout
              </Button>
              <Button
                onClick={handleResetLayout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Layout Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Layout Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {layoutStats.components}
              </div>
              <div className="text-xs text-muted-foreground">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {layoutStats.panels}
              </div>
              <div className="text-xs text-muted-foreground">Panels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {layoutStats.widgets}
              </div>
              <div className="text-xs text-muted-foreground">Widgets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {layoutStats.navigationItems}
              </div>
              <div className="text-xs text-muted-foreground">Nav Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {layoutStats.filters}
              </div>
              <div className="text-xs text-muted-foreground">Filters</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="preview-mode">Preview Mode:</Label>
              <Select value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <Desktop className="h-4 w-4" />
                      Desktop
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4" />
                      Tablet
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="edit-mode"
                checked={isEditing}
                onCheckedChange={setIsEditing}
              />
              <Label htmlFor="edit-mode">Edit Mode</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportLayout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={() => document.getElementById('import-layout')?.click()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <input
                id="import-layout"
                type="file"
                accept=".json"
                onChange={handleImportLayout}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Configuration Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="responsive">Responsive</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structure" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Header Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="header-enabled">Enabled</Label>
                    <Switch
                      id="header-enabled"
                      checked={currentLayout.structure.header.enabled}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          structure: {
                            ...currentLayout.structure,
                            header: { ...currentLayout.structure.header, enabled: checked }
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="header-height">Height: {currentLayout.structure.header.height}px</Label>
                    <Slider
                      id="header-height"
                      min={48}
                      max={120}
                      step={8}
                      value={[currentLayout.structure.header.height]}
                      onValueChange={([value]) => 
                        handleLayoutUpdate({
                          structure: {
                            ...currentLayout.structure,
                            header: { ...currentLayout.structure.header, height: value }
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="header-position">Position</Label>
                    <Select
                      value={currentLayout.structure.header.position}
                      onValueChange={(value: any) => 
                        handleLayoutUpdate({
                          structure: {
                            ...currentLayout.structure,
                            header: { ...currentLayout.structure.header, position: value }
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="sticky">Sticky</SelectItem>
                        <SelectItem value="static">Static</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5" />
                    Sidebar Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebar-enabled">Enabled</Label>
                    <Switch
                      id="sidebar-enabled"
                      checked={currentLayout.structure.sidebar.enabled}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          structure: {
                            ...currentLayout.structure,
                            sidebar: { ...currentLayout.structure.sidebar, enabled: checked }
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-width">Width: {currentLayout.structure.sidebar.width}px</Label>
                    <Slider
                      id="sidebar-width"
                      min={200}
                      max={400}
                      step={16}
                      value={[currentLayout.structure.sidebar.width]}
                      onValueChange={([value]) => 
                        handleLayoutUpdate({
                          structure: {
                            ...currentLayout.structure,
                            sidebar: { ...currentLayout.structure.sidebar, width: value }
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebar-collapsible">Collapsible</Label>
                    <Switch
                      id="sidebar-collapsible"
                      checked={currentLayout.structure.sidebar.collapsible}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          structure: {
                            ...currentLayout.structure,
                            sidebar: { ...currentLayout.structure.sidebar, collapsible: checked }
                          }
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="theme" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme-mode">Mode</Label>
                    <Select
                      value={currentLayout.theme.mode}
                      onValueChange={(value: any) => 
                        handleLayoutUpdate({
                          theme: { ...currentLayout.theme, mode: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="high-contrast">High Contrast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={currentLayout.theme.primary}
                        onChange={(e) => 
                          handleLayoutUpdate({
                            theme: { ...currentLayout.theme, primary: e.target.value }
                          })
                        }
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={currentLayout.theme.primary}
                        onChange={(e) => 
                          handleLayoutUpdate({
                            theme: { ...currentLayout.theme, primary: e.target.value }
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={currentLayout.theme.secondary}
                        onChange={(e) => 
                          handleLayoutUpdate({
                            theme: { ...currentLayout.theme, secondary: e.target.value }
                          })
                        }
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={currentLayout.theme.secondary}
                        onChange={(e) => 
                          handleLayoutUpdate({
                            theme: { ...currentLayout.theme, secondary: e.target.value }
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-font">Primary Font</Label>
                    <Select
                      value={currentLayout.theme.fonts.primary}
                      onValueChange={(value) => 
                        handleLayoutUpdate({
                          theme: {
                            ...currentLayout.theme,
                            fonts: { ...currentLayout.theme.fonts, primary: value }
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="border-radius">Border Radius: {currentLayout.theme.borderRadius}px</Label>
                    <Slider
                      id="border-radius"
                      min={0}
                      max={24}
                      step={2}
                      value={[currentLayout.theme.borderRadius]}
                      onValueChange={([value]) => 
                        handleLayoutUpdate({
                          theme: { ...currentLayout.theme, borderRadius: value }
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="responsive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Responsive Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adaptive">Adaptive Layout</Label>
                  <Switch
                    id="adaptive"
                    checked={currentLayout.responsive.adaptive}
                    onCheckedChange={(checked) => 
                      handleLayoutUpdate({
                        responsive: { ...currentLayout.responsive, adaptive: checked }
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="fluid">Fluid Layout</Label>
                  <Switch
                    id="fluid"
                    checked={currentLayout.responsive.fluid}
                    onCheckedChange={(checked) => 
                      handleLayoutUpdate({
                        responsive: { ...currentLayout.responsive, fluid: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accessibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Accessibility Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <Switch
                      id="high-contrast"
                      checked={currentLayout.accessibility.highContrast}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          accessibility: { ...currentLayout.accessibility, highContrast: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-text">Large Text</Label>
                    <Switch
                      id="large-text"
                      checked={currentLayout.accessibility.largeText}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          accessibility: { ...currentLayout.accessibility, largeText: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
                    <Switch
                      id="keyboard-nav"
                      checked={currentLayout.accessibility.keyboardNavigation}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          accessibility: { ...currentLayout.accessibility, keyboardNavigation: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <Switch
                      id="reduced-motion"
                      checked={currentLayout.accessibility.reducedMotion}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          accessibility: { ...currentLayout.accessibility, reducedMotion: checked }
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lazy-loading">Lazy Loading</Label>
                    <Switch
                      id="lazy-loading"
                      checked={currentLayout.performance.lazyLoading}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          performance: { ...currentLayout.performance, lazyLoading: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="virtualization">Virtualization</Label>
                    <Switch
                      id="virtualization"
                      checked={currentLayout.performance.virtualization}
                      onCheckedChange={(checked) => 
                        handleLayoutUpdate({
                          performance: { ...currentLayout.performance, virtualization: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="memoization">Memoization</Label>
   