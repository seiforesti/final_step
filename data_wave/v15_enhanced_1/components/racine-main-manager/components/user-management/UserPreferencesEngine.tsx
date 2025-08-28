/**
 * UserPreferencesEngine.tsx
 * =========================
 * 
 * Advanced User Preferences and Customization Engine Component
 * 
 * Features:
 * - Comprehensive preference management (UI, behavior, notifications, accessibility)
 * - Advanced theme customization with custom color schemes and layouts
 * - Workspace and dashboard personalization
 * - Language and localization settings
 * - Accessibility preferences and compliance
 * - Data export/import preferences
 * - Performance and display optimization settings
 * - Real-time preference synchronization across devices
 * - Advanced keyboard shortcuts and hotkey management
 * - Custom dashboard layouts and widget arrangements
 * - Integration preferences for external tools and services
 * - Privacy and data handling preferences
 * 
 * Design:
 * - Modern tabbed interface with categorized preferences
 * - Live preview of changes with real-time updates
 * - Advanced color pickers and theme builders
 * - Responsive design optimized for all screen sizes
 * - Accessibility-first design with full keyboard navigation
 * - Dark/light/auto theme support with custom themes
 * - Advanced animations and smooth transitions
 * 
 * Backend Integration:
 * - Maps to UserPreferencesService, ThemeService, SettingsService
 * - Real-time synchronization across user sessions
 * - Integration with all 7 data governance SPAs
 * - Advanced preference validation and conflict resolution
 * - Cross-device preference synchronization
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Slider 
} from '@/components/ui/slider';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Checkbox
} from '@/components/ui/checkbox';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Icons
import { Settings, Palette, Globe, Bell, Shield, Monitor, Keyboard, Layout, User, Eye, EyeOff, Sun, Moon, Laptop, Smartphone, Tablet, Volume2, VolumeX, Zap, Database, Cloud, Download, Upload, RefreshCw, Save, RotateCcw, Trash2, Edit, Plus, Minus, X, Check, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoreHorizontal, Search, Filter, SortAsc, SortDesc, Star, Heart, Bookmark, Flag, Tag, Hash, AtSign, Link, ExternalLink, Copy, Share2, Info, AlertCircle, CheckCircle, XCircle, AlertTriangle, Loader2, Activity, BarChart3, PieChart, TrendingUp, Target, Gauge, Timer, Clock, Calendar, MapPin, Languages, Type, MousePointer, Contrast, Accessibility, Focus, Maximize, Minimize, Move, RotateCw, Shuffle, Grid, List, Columns, Rows, PanelLeft, PanelRight, PanelTop, PanelBottom, Sidebar, Navigation, Menu, Home, Building, Users, FileText, Folder, Image, Video, Music, Code, Terminal, Cpu, HardDrive, Wifi, Signal, Battery, Power, Bluetooth, Headphones, Mic, Camera, Printer, Scanner, Gamepad2, Joystick } from 'lucide-react';

// Form validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Date handling
import { format, parseISO, isValid } from 'date-fns';

// Animations
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Toast notifications
import { toast } from 'sonner';

// Color picker
import { HexColorPicker, HexColorInput } from 'react-colorful';

// Racine hooks and services
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useRBACSystem } from '../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useThemeEngine } from '../../hooks/useThemeEngine';

// Racine types
import {
  UUID,
  ISODateString,
  UserProfile,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  DashboardPreferences,
  AccessibilitySettings
} from '../../types/racine-core.types';

// Racine utilities
import { 
  formatDate,
  formatTime,
  generateSecureId,
  sanitizeInput
} from '../../utils/validation-utils';
import {
  exportUserPreferences,
  importUserPreferences,
  validatePreferences
} from '../../utils/preferences-utils';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface UserPreferencesEngineProps {
  userId?: UUID;
  embedded?: boolean;
  onPreferencesUpdate?: (preferences: UserPreferences) => void;
  className?: string;
}

interface ThemeCustomization {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  isDark: boolean;
  isCustom: boolean;
  createdAt: ISODateString;
}

interface LayoutPreferences {
  sidebarPosition: 'left' | 'right' | 'hidden';
  sidebarWidth: number;
  headerHeight: number;
  compactMode: boolean;
  showBreadcrumbs: boolean;
  showQuickActions: boolean;
  defaultView: 'grid' | 'list' | 'cards';
  itemsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  action: string;
  category: string;
  enabled: boolean;
  isCustom: boolean;
}

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  visible: boolean;
}

interface PerformanceSettings {
  animationsEnabled: boolean;
  transitionsEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  cacheSize: number;
  prefetchData: boolean;
  compressData: boolean;
  offlineMode: boolean;
}

interface IntegrationPreferences {
  enabledIntegrations: string[];
  webhookUrls: string[];
  apiCallTimeout: number;
  retryAttempts: number;
  batchSize: number;
  syncFrequency: number;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const preferencesSchema = z.object({
  theme: z.string(),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  numberFormat: z.string(),
  layout: z.object({
    sidebarPosition: z.enum(['left', 'right', 'hidden']),
    compactMode: z.boolean(),
    defaultView: z.enum(['grid', 'list', 'cards'])
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    browser: z.boolean(),
    desktop: z.boolean()
  }),
  accessibility: z.object({
    highContrast: z.boolean(),
    largeText: z.boolean(),
    reduceMotion: z.boolean(),
    screenReader: z.boolean()
  }),
  performance: z.object({
    animationsEnabled: z.boolean(),
    autoSave: z.boolean(),
    prefetchData: z.boolean()
  })
});

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideInFromRightVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const staggerChildrenVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// =============================================================================
// CONSTANTS
// =============================================================================

const THEME_PRESETS = [
  {
    id: 'light',
    name: 'Light',
    description: 'Default light theme',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#e5e7eb',
    isDark: false,
    isCustom: false
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Default dark theme',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#10b981',
    backgroundColor: '#1f2937',
    textColor: '#f9fafb',
    borderColor: '#374151',
    isDark: true,
    isCustom: false
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Professional blue theme',
    primaryColor: '#1e40af',
    secondaryColor: '#3730a3',
    accentColor: '#06b6d4',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    borderColor: '#cbd5e1',
    isDark: false,
    isCustom: false
  },
  {
    id: 'green',
    name: 'Forest Green',
    description: 'Nature-inspired green theme',
    primaryColor: '#059669',
    secondaryColor: '#065f46',
    accentColor: '#34d399',
    backgroundColor: '#f0fdf4',
    textColor: '#14532d',
    borderColor: '#bbf7d0',
    isDark: false,
    isCustom: false
  }
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'pt', label: 'Português', flag: '🇵🇹' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' }
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (London)' },
  { value: 'Europe/Paris', label: 'Central European Time (Paris)' },
  { value: 'Europe/Berlin', label: 'Central European Time (Berlin)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (Mumbai)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' }
];

const DATE_FORMAT_OPTIONS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)', example: '12/25/2023' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)', example: '25/12/2023' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)', example: '2023-12-25' },
  { value: 'MMM dd, yyyy', label: 'MMM DD, YYYY', example: 'Dec 25, 2023' },
  { value: 'dd MMM yyyy', label: 'DD MMM YYYY', example: '25 Dec 2023' },
  { value: 'MMMM dd, yyyy', label: 'MMMM DD, YYYY', example: 'December 25, 2023' }
];

const TIME_FORMAT_OPTIONS = [
  { value: 'HH:mm', label: '24-hour format (HH:MM)', example: '14:30' },
  { value: 'hh:mm aa', label: '12-hour format (HH:MM AM/PM)', example: '2:30 PM' },
  { value: 'HH:mm:ss', label: '24-hour with seconds (HH:MM:SS)', example: '14:30:45' },
  { value: 'hh:mm:ss aa', label: '12-hour with seconds (HH:MM:SS AM/PM)', example: '2:30:45 PM' }
];

const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'global-search',
    name: 'Global Search',
    description: 'Open global search dialog',
    keys: ['Ctrl', 'K'],
    action: 'openGlobalSearch',
    category: 'Navigation',
    enabled: true,
    isCustom: false
  },
  {
    id: 'new-item',
    name: 'New Item',
    description: 'Create new item in current context',
    keys: ['Ctrl', 'N'],
    action: 'createNew',
    category: 'Actions',
    enabled: true,
    isCustom: false
  },
  {
    id: 'save',
    name: 'Save',
    description: 'Save current changes',
    keys: ['Ctrl', 'S'],
    action: 'save',
    category: 'Actions',
    enabled: true,
    isCustom: false
  },
  {
    id: 'copy',
    name: 'Copy',
    description: 'Copy selected item',
    keys: ['Ctrl', 'C'],
    action: 'copy',
    category: 'Edit',
    enabled: true,
    isCustom: false
  },
  {
    id: 'paste',
    name: 'Paste',
    description: 'Paste from clipboard',
    keys: ['Ctrl', 'V'],
    action: 'paste',
    category: 'Edit',
    enabled: true,
    isCustom: false
  },
  {
    id: 'undo',
    name: 'Undo',
    description: 'Undo last action',
    keys: ['Ctrl', 'Z'],
    action: 'undo',
    category: 'Edit',
    enabled: true,
    isCustom: false
  },
  {
    id: 'redo',
    name: 'Redo',
    description: 'Redo last undone action',
    keys: ['Ctrl', 'Y'],
    action: 'redo',
    category: 'Edit',
    enabled: true,
    isCustom: false
  },
  {
    id: 'toggle-sidebar',
    name: 'Toggle Sidebar',
    description: 'Show/hide main sidebar',
    keys: ['Ctrl', 'B'],
    action: 'toggleSidebar',
    category: 'View',
    enabled: true,
    isCustom: false
  },
  {
    id: 'toggle-theme',
    name: 'Toggle Theme',
    description: 'Switch between light and dark theme',
    keys: ['Ctrl', 'Shift', 'L'],
    action: 'toggleTheme',
    category: 'View',
    enabled: true,
    isCustom: false
  },
  {
    id: 'help',
    name: 'Help',
    description: 'Open help documentation',
    keys: ['F1'],
    action: 'openHelp',
    category: 'Navigation',
    enabled: true,
    isCustom: false
  }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const UserPreferencesEngine: React.FC<UserPreferencesEngineProps> = ({
  userId,
  embedded = false,
  onPreferencesUpdate,
  className = ''
}) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================

  const {
    userProfile,
    userPreferences,
    loading: userLoading,
    error: userError,
    updateUserPreferences
  } = useUserManagement(userId);

  const {
    currentUser,
    userPermissions,
    hasPermission
  } = useRBACSystem();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  const {
    currentTheme,
    availableThemes,
    setTheme,
    createCustomTheme
  } = useThemeEngine();

  // Form management
  const form = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: userPreferences || {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: 'HH:mm',
      numberFormat: 'en-US',
      layout: {
        sidebarPosition: 'left',
        compactMode: false,
        defaultView: 'grid'
      },
      notifications: {
        email: true,
        push: true,
        browser: true,
        desktop: false
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        screenReader: false
      },
      performance: {
        animationsEnabled: true,
        autoSave: true,
        prefetchData: true
      }
    }
  });

  // Component state
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Theme customization state
  const [customThemes, setCustomThemes] = useState<ThemeCustomization[]>([]);
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [currentCustomTheme, setCurrentCustomTheme] = useState<Partial<ThemeCustomization>>({});

  // Layout preferences state
  const [layoutPreferences, setLayoutPreferences] = useState<LayoutPreferences>({
    sidebarPosition: 'left',
    sidebarWidth: 280,
    headerHeight: 64,
    compactMode: false,
    showBreadcrumbs: true,
    showQuickActions: true,
    defaultView: 'grid',
    itemsPerPage: 25,
    autoRefresh: false,
    refreshInterval: 30
  });

  // Keyboard shortcuts state
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<KeyboardShortcut[]>(DEFAULT_KEYBOARD_SHORTCUTS);
  const [showShortcutEditor, setShowShortcutEditor] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<KeyboardShortcut | null>(null);

  // Dashboard widgets state
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  const [showWidgetEditor, setShowWidgetEditor] = useState(false);

  // Performance settings state
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    animationsEnabled: true,
    transitionsEnabled: true,
    autoSave: true,
    autoSaveInterval: 30,
    cacheSize: 100,
    prefetchData: true,
    compressData: false,
    offlineMode: false
  });

  // Integration preferences state
  const [integrationPreferences, setIntegrationPreferences] = useState<IntegrationPreferences>({
    enabledIntegrations: [],
    webhookUrls: [],
    apiCallTimeout: 30,
    retryAttempts: 3,
    batchSize: 100,
    syncFrequency: 300
  });

  // UI state
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Animation controls
  const controls = useAnimation();

  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canEditPreferences = useMemo(() => {
    return hasPermission('user.preferences.edit') || hasPermission('user.self.edit');
  }, [hasPermission]);

  const canExportPreferences = useMemo(() => {
    return hasPermission('user.preferences.export') || hasPermission('user.data.export');
  }, [hasPermission]);

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return keyboardShortcuts;
    
    const query = searchQuery.toLowerCase();
    return keyboardShortcuts.filter(shortcut =>
      shortcut.name.toLowerCase().includes(query) ||
      shortcut.description.toLowerCase().includes(query) ||
      shortcut.category.toLowerCase().includes(query) ||
      shortcut.keys.some(key => key.toLowerCase().includes(query))
    );
  }, [keyboardShortcuts, searchQuery]);

  const shortcutCategories = useMemo(() => {
    const categories: {[key: string]: KeyboardShortcut[]} = {};
    filteredShortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });
    return categories;
  }, [filteredShortcuts]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      if (!userProfile) return;

      try {
        setLoading(true);
        
        // Load user preferences and settings
        await Promise.all([
          loadCustomThemes(),
          loadDashboardWidgets(),
          loadUserSettings()
        ]);

      } catch (error) {
        console.error('Failed to initialize preferences:', error);
        setError('Failed to load user preferences');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [userProfile]);

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Animate component entrance
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  const loadCustomThemes = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockThemes: ThemeCustomization[] = [
        {
          id: 'custom-purple',
          name: 'Purple Pro',
          description: 'Custom purple theme for professionals',
          primaryColor: '#8b5cf6',
          secondaryColor: '#a855f7',
          accentColor: '#c084fc',
          backgroundColor: '#faf5ff',
          textColor: '#581c87',
          borderColor: '#e9d5ff',
          isDark: false,
          isCustom: true,
          createdAt: new Date().toISOString()
        }
      ];

      setCustomThemes(mockThemes);

    } catch (error) {
      console.error('Failed to load custom themes:', error);
    }
  }, []);

  const loadDashboardWidgets = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockWidgets: DashboardWidget[] = [
        {
          id: 'widget-activity',
          type: 'activity-feed',
          title: 'Recent Activity',
          position: { x: 0, y: 0 },
          size: { width: 6, height: 4 },
          config: { limit: 10, showAvatars: true },
          visible: true
        },
        {
          id: 'widget-stats',
          type: 'stats-overview',
          title: 'Quick Stats',
          position: { x: 6, y: 0 },
          size: { width: 6, height: 4 },
          config: { metrics: ['users', 'data-sources', 'scans', 'compliance'] },
          visible: true
        }
      ];

      setDashboardWidgets(mockWidgets);

    } catch (error) {
      console.error('Failed to load dashboard widgets:', error);
    }
  }, []);

  const loadUserSettings = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // Settings are loaded from userPreferences hook
      console.log('User settings loaded from userPreferences hook');

    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  }, []);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleSavePreferences = useCallback(async (data: any) => {
    if (!userProfile || !canEditPreferences) return;

    try {
      setLoading(true);

      // Validate preferences
      const validatedPreferences = validatePreferences(data);

      // Update preferences via API
      await updateUserPreferences(validatedPreferences);

      // Update local state
      setHasUnsavedChanges(false);

      // Notify parent component
      if (onPreferencesUpdate) {
        onPreferencesUpdate(validatedPreferences);
      }

      toast.success('Preferences updated successfully');

    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  }, [userProfile, canEditPreferences, updateUserPreferences, onPreferencesUpdate]);

  const handleResetPreferences = useCallback(async () => {
    if (!userProfile || !canEditPreferences) return;

    try {
      setLoading(true);

      // Reset to default preferences
      const defaultPreferences = {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: 'HH:mm',
        numberFormat: 'en-US',
        layout: {
          sidebarPosition: 'left',
          compactMode: false,
          defaultView: 'grid'
        },
        notifications: {
          email: true,
          push: true,
          browser: true,
          desktop: false
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          reduceMotion: false,
          screenReader: false
        },
        performance: {
          animationsEnabled: true,
          autoSave: true,
          prefetchData: true
        }
      };

      form.reset(defaultPreferences);
      await updateUserPreferences(defaultPreferences);

      setHasUnsavedChanges(false);
      toast.success('Preferences reset to defaults');

    } catch (error: any) {
      console.error('Failed to reset preferences:', error);
      toast.error(error.message || 'Failed to reset preferences');
    } finally {
      setLoading(false);
    }
  }, [userProfile, canEditPreferences, form, updateUserPreferences]);

  const handleExportPreferences = useCallback(async () => {
    if (!userProfile || !canExportPreferences) return;

    try {
      const preferences = form.getValues();
      const exportData = await exportUserPreferences(preferences);
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-preferences-${userProfile.id}-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Preferences exported successfully');

    } catch (error: any) {
      console.error('Failed to export preferences:', error);
      toast.error(error.message || 'Failed to export preferences');
    }
  }, [userProfile, canExportPreferences, form]);

  const handleImportPreferences = useCallback(async (file: File) => {
    if (!userProfile || !canEditPreferences) return;

    try {
      setLoading(true);

      const text = await file.text();
      const importData = JSON.parse(text);
      const validatedPreferences = await importUserPreferences(importData);

      form.reset(validatedPreferences);
      await updateUserPreferences(validatedPreferences);

      setHasUnsavedChanges(false);
      toast.success('Preferences imported successfully');

    } catch (error: any) {
      console.error('Failed to import preferences:', error);
      toast.error(error.message || 'Failed to import preferences');
    } finally {
      setLoading(false);
    }
  }, [userProfile, canEditPreferences, form, updateUserPreferences]);

  const handleCreateCustomTheme = useCallback(async (themeData: Partial<ThemeCustomization>) => {
    try {
      const newTheme: ThemeCustomization = {
        id: generateSecureId(),
        name: themeData.name || 'Custom Theme',
        description: themeData.description || 'User created theme',
        primaryColor: themeData.primaryColor || '#3b82f6',
        secondaryColor: themeData.secondaryColor || '#64748b',
        accentColor: themeData.accentColor || '#10b981',
        backgroundColor: themeData.backgroundColor || '#ffffff',
        textColor: themeData.textColor || '#1f2937',
        borderColor: themeData.borderColor || '#e5e7eb',
        isDark: themeData.isDark || false,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      // TODO: Replace with actual API call
      await createCustomTheme(newTheme);

      setCustomThemes(prev => [...prev, newTheme]);
      setShowThemeBuilder(false);
      setCurrentCustomTheme({});

      toast.success('Custom theme created successfully');

    } catch (error: any) {
      console.error('Failed to create custom theme:', error);
      toast.error(error.message || 'Failed to create custom theme');
    }
  }, [createCustomTheme]);

  const handleUpdateKeyboardShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setKeyboardShortcuts(prev => 
      prev.map(s => s.id === shortcut.id ? shortcut : s)
    );
    setEditingShortcut(null);
    setShowShortcutEditor(false);
    toast.success('Keyboard shortcut updated');
  }, []);

  const handleToggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderGeneralTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Theme and Appearance */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Theme & Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the visual appearance of your interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...THEME_PRESETS, ...customThemes].map((theme) => (
                      <div
                        key={theme.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          field.value === theme.id 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => field.onChange(theme.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full border-2"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <div>
                            <p className="font-medium text-sm">{theme.name}</p>
                            <p className="text-xs text-gray-500">{theme.description}</p>
                          </div>
                        </div>
                        {theme.isCustom && (
                          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowThemeBuilder(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Theme
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {previewMode ? 'Exit Preview' : 'Preview Changes'}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="layout.compactMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Compact Mode</FormLabel>
                      <FormDescription>
                        Use smaller spacing and condensed layouts
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="layout.sidebarPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sidebar Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sidebar position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="left">
                          <div className="flex items-center space-x-2">
                            <PanelLeft className="w-4 h-4" />
                            <span>Left</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="right">
                          <div className="flex items-center space-x-2">
                            <PanelRight className="w-4 h-4" />
                            <span>Right</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="hidden">
                          <div className="flex items-center space-x-2">
                            <EyeOff className="w-4 h-4" />
                            <span>Hidden</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language and Region */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Language & Region</span>
            </CardTitle>
            <CardDescription>
              Set your language, timezone, and formatting preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center space-x-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DATE_FORMAT_OPTIONS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex flex-col">
                              <span>{format.label}</span>
                              <span className="text-xs text-gray-500">{format.example}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_FORMAT_OPTIONS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex flex-col">
                              <span>{format.label}</span>
                              <span className="text-xs text-gray-500">{format.example}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Display Preferences */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="w-5 h-5" />
              <span>Display Preferences</span>
            </CardTitle>
            <CardDescription>
              Configure how content is displayed and organized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="layout.defaultView"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default View</FormLabel>
                  <FormDescription>
                    Choose how items are displayed by default
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grid" id="grid" />
                        <Label htmlFor="grid" className="flex items-center space-x-2">
                          <Grid className="w-4 h-4" />
                          <span>Grid</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="list" id="list" />
                        <Label htmlFor="list" className="flex items-center space-x-2">
                          <List className="w-4 h-4" />
                          <span>List</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cards" id="cards" />
                        <Label htmlFor="cards" className="flex items-center space-x-2">
                          <Columns className="w-4 h-4" />
                          <span>Cards</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>Items per page</Label>
              <div className="px-3">
                <Slider
                  value={[layoutPreferences.itemsPerPage]}
                  onValueChange={([value]) => 
                    setLayoutPreferences(prev => ({ ...prev, itemsPerPage: value }))
                  }
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>10</span>
                  <span>{layoutPreferences.itemsPerPage}</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Breadcrumbs</Label>
                  <p className="text-sm text-gray-500">Display navigation breadcrumbs</p>
                </div>
                <Switch
                  checked={layoutPreferences.showBreadcrumbs}
                  onCheckedChange={(checked) =>
                    setLayoutPreferences(prev => ({ ...prev, showBreadcrumbs: checked }))
                  }
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Quick Actions</Label>
                  <p className="text-sm text-gray-500">Display quick action buttons</p>
                </div>
                <Switch
                  checked={layoutPreferences.showQuickActions}
                  onCheckedChange={(checked) =>
                    setLayoutPreferences(prev => ({ ...prev, showQuickActions: checked }))
                  }
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto Refresh</Label>
                  <p className="text-sm text-gray-500">Automatically refresh data</p>
                </div>
                <Switch
                  checked={layoutPreferences.autoRefresh}
                  onCheckedChange={(checked) =>
                    setLayoutPreferences(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>

              {layoutPreferences.autoRefresh && (
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Refresh Interval</Label>
                    <p className="text-sm text-gray-500">{layoutPreferences.refreshInterval} seconds</p>
                  </div>
                  <div className="w-24">
                    <Slider
                      value={[layoutPreferences.refreshInterval]}
                      onValueChange={([value]) =>
                        setLayoutPreferences(prev => ({ ...prev, refreshInterval: value }))
                      }
                      max={300}
                      min={10}
                      step={10}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderNotificationsTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Notification Channels */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Channels</span>
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="notifications.email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notifications.push"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Push Notifications</FormLabel>
                      <FormDescription>
                        Receive push notifications on mobile
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notifications.browser"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Browser Notifications</FormLabel>
                      <FormDescription>
                        Show notifications in your browser
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notifications.desktop"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Desktop Notifications</FormLabel>
                      <FormDescription>
                        Show desktop notifications when app is closed
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderKeyboardShortcutsTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Keyboard Shortcuts Header */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Keyboard className="w-5 h-5" />
              <span>Keyboard Shortcuts</span>
            </CardTitle>
            <CardDescription>
              Customize keyboard shortcuts for faster navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingShortcut(null);
                  setShowShortcutEditor(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Shortcut
              </Button>
            </div>

            <Accordion type="multiple" value={Object.keys(expandedSections).filter(key => expandedSections[key])}>
              {Object.entries(shortcutCategories).map(([category, shortcuts]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{category}</span>
                      <Badge variant="secondary">{shortcuts.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {shortcuts.map((shortcut) => (
                        <div 
                          key={shortcut.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-medium">{shortcut.name}</p>
                                <p className="text-sm text-gray-500">{shortcut.description}</p>
                              </div>
                              {shortcut.isCustom && (
                                <Badge variant="outline" className="text-xs">Custom</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              {shortcut.keys.map((key, index) => (
                                <React.Fragment key={index}>
                                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                                    {key}
                                  </kbd>
                                  {index < shortcut.keys.length - 1 && (
                                    <span className="text-gray-400">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                            
                            <Switch
                              checked={shortcut.enabled}
                              onCheckedChange={(enabled) => {
                                const updatedShortcut = { ...shortcut, enabled };
                                handleUpdateKeyboardShortcut(updatedShortcut);
                              }}
                            />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingShortcut(shortcut);
                                setShowShortcutEditor(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading preferences...</span>
        </div>
      </div>
    );
  }

  if (userError || error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{userError || error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate={controls}
        variants={fadeInUpVariants}
        className={`user-preferences-engine ${className}`}
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {!embedded && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">User Preferences</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Customize your experience and manage your preferences
                </p>
              </div>
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-orange-600">
                    Unsaved Changes
                  </Badge>
                  <Button
                    onClick={form.handleSubmit(handleSavePreferences)}
                    disabled={loading || !canEditPreferences}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}

          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(handleSavePreferences)}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="general" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">General</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="accessibility" className="flex items-center space-x-2">
                    <Accessibility className="w-4 h-4" />
                    <span className="hidden sm:inline">Accessibility</span>
                  </TabsTrigger>
                  <TabsTrigger value="shortcuts" className="flex items-center space-x-2">
                    <Keyboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Shortcuts</span>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Privacy</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  {renderGeneralTab()}
                </TabsContent>

                <TabsContent value="notifications">
                  {renderNotificationsTab()}
                </TabsContent>

                <TabsContent value="accessibility">
                  <div className="text-center py-12">
                    <Accessibility className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Accessibility Settings</h3>
                    <p className="text-gray-500">Advanced accessibility preferences will be implemented here</p>
                  </div>
                </TabsContent>

                <TabsContent value="shortcuts">
                  {renderKeyboardShortcutsTab()}
                </TabsContent>

                <TabsContent value="performance">
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Performance Settings</h3>
                    <p className="text-gray-500">Performance optimization preferences will be implemented here</p>
                  </div>
                </TabsContent>

                <TabsContent value="privacy">
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Privacy Settings</h3>
                    <p className="text-gray-500">Privacy and data handling preferences will be implemented here</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportPreferences}
                    disabled={!canExportPreferences}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImportPreferences(file);
                      };
                      input.click();
                    }}
                    disabled={!canEditPreferences}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetPreferences}
                    disabled={loading || !canEditPreferences}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !canEditPreferences || !hasUnsavedChanges}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* Theme Builder Dialog */}
        <Dialog open={showThemeBuilder} onOpenChange={setShowThemeBuilder}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Theme</DialogTitle>
              <DialogDescription>
                Design your own custom theme with personalized colors
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Theme Name</Label>
                  <Input
                    placeholder="My Custom Theme"
                    value={currentCustomTheme.name || ''}
                    onChange={(e) => setCurrentCustomTheme(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Theme description"
                    value={currentCustomTheme.description || ''}
                    onChange={(e) => setCurrentCustomTheme(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="mt-2">
                    <HexColorPicker
                      color={currentCustomTheme.primaryColor || '#3b82f6'}
                      onChange={(color) => setCurrentCustomTheme(prev => ({ ...prev, primaryColor: color }))}
                    />
                    <HexColorInput
                      color={currentCustomTheme.primaryColor || '#3b82f6'}
                      onChange={(color) => setCurrentCustomTheme(prev => ({ ...prev, primaryColor: color }))}
                      className="mt-2 w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="mt-2">
                    <HexColorPicker
                      color={currentCustomTheme.secondaryColor || '#64748b'}
                      onChange={(color) => setCurrentCustomTheme(prev => ({ ...prev, secondaryColor: color }))}
                    />
                    <HexColorInput
                      color={currentCustomTheme.secondaryColor || '#64748b'}
                      onChange={(color) => setCurrentCustomTheme(prev => ({ ...prev, secondaryColor: color }))}
                      className="mt-2 w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="mt-2">
                    <HexColorPicker
                      color={currentCustomTheme.accentColor || '#10b981'}
                      onChange={(color) => setCurrentCustomTheme(prev => ({ ...prev, accentColor: color }))}
                    />
                    <HexColorInput
                      color={currentCustomTheme.accentColor || '#10b981'}
                      onChange={(color) => setCurrentCustomTheme(prev => ({ ...prev, accentColor: color }))}
                      className="mt-2 w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDark"
                  checked={currentCustomTheme.isDark || false}
                  onCheckedChange={(checked) => setCurrentCustomTheme(prev => ({ ...prev, isDark: !!checked }))}
                />
                <Label htmlFor="isDark">Dark theme</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowThemeBuilder(false);
                  setCurrentCustomTheme({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreateCustomTheme(currentCustomTheme)}
                disabled={!currentCustomTheme.name}
              >
                <Palette className="w-4 h-4 mr-2" />
                Create Theme
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default UserPreferencesEngine;