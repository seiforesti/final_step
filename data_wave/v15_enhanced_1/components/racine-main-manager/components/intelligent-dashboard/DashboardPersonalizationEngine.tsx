'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui';
import { Settings, User, Palette, Layout, Eye, EyeOff, Save, RotateCcw, Download, Upload, Share2, Copy, Plus, Minus, Move, Grid3X3, Columns, Rows, Sun, Moon, Monitor, Smartphone, Tablet, Bell, Volume2, VolumeX, Globe, Calendar, Filter, Search, SortAsc, SortDesc, Target, Zap, RefreshCw, Clock, AlertTriangle, CheckCircle, Brush, Type, Image, Video, BarChart3, PieChart, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoreVertical, Star, Heart, Bookmark, Tag, Flag, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DashboardState, UserPreferences, WidgetConfiguration, 
  ThemeConfiguration, LayoutConfiguration, NotificationPreferences
} from '../../types/racine-core.types';
import { useDashboardAPIs } from '../../hooks/useDashboardAPIs';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Enhanced interfaces for personalization
interface PersonalizationProfile {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  preferences: UserPreferences;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
}

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  isDark: boolean;
  preview: string;
}

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  layout: {
    sidebar: 'collapsed' | 'expanded' | 'hidden';
    header: 'compact' | 'expanded' | 'minimal';
    density: 'compact' | 'comfortable' | 'spacious';
    gridSize: number;
  };
  preview: string;
}

interface WidgetPreferences {
  id: string;
  type: string;
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
  defaultConfiguration: any;
  refreshInterval: number;
  isEnabled: boolean;
  priority: number;
}

interface PersonalizationState {
  currentProfile: PersonalizationProfile | null;
  profiles: PersonalizationProfile[];
  themePresets: ThemePreset[];
  layoutPresets: LayoutPreset[];
  widgetPreferences: WidgetPreferences[];
  preferences: UserPreferences;
  previewMode: boolean;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
  aiSuggestions: any[];
  usageAnalytics: any;
}

interface DashboardPersonalizationEngineProps {
  currentDashboard?: DashboardState | null;
  userPreferences?: UserPreferences | null;
  isLoading?: boolean;
  onPreferencesUpdate?: (preferences: UserPreferences) => void;
  onProfileSwitch?: (profile: PersonalizationProfile) => void;
  onThemeChange?: (theme: ThemeConfiguration) => void;
}

// Animation variants
const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  slide: {
    initial: { x: -300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 }
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  }
};

// Default theme presets
const DEFAULT_THEME_PRESETS: ThemePreset[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827'
    },
    isDark: false,
    preview: 'light-preview.png'
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes for long sessions',
    colors: {
      primary: '#60A5FA',
      secondary: '#A78BFA',
      accent: '#34D399',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB'
    },
    isDark: true,
    preview: 'dark-preview.png'
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Professional blue theme',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#0891B2',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: '#0C4A6E'
    },
    isDark: false,
    preview: 'blue-preview.png'
  },
  {
    id: 'green',
    name: 'Nature Green',
    description: 'Calming green theme',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#047857',
      background: '#F0FDF4',
      surface: '#DCFCE7',
      text: '#14532D'
    },
    isDark: false,
    preview: 'green-preview.png'
  }
];

// Default layout presets
const DEFAULT_LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'compact',
    name: 'Compact',
    description: 'Maximizes content space',
    layout: {
      sidebar: 'collapsed',
      header: 'compact',
      density: 'compact',
      gridSize: 8
    },
    preview: 'compact-layout.png'
  },
  {
    id: 'comfortable',
    name: 'Comfortable',
    description: 'Balanced layout with good spacing',
    layout: {
      sidebar: 'expanded',
      header: 'expanded',
      density: 'comfortable',
      gridSize: 12
    },
    preview: 'comfortable-layout.png'
  },
  {
    id: 'spacious',
    name: 'Spacious',
    description: 'Lots of white space for clarity',
    layout: {
      sidebar: 'expanded',
      header: 'expanded',
      density: 'spacious',
      gridSize: 16
    },
    preview: 'spacious-layout.png'
  }
];

export const DashboardPersonalizationEngine: React.FC<DashboardPersonalizationEngineProps> = ({
  currentDashboard,
  userPreferences,
  isLoading = false,
  onPreferencesUpdate,
  onProfileSwitch,
  onThemeChange
}) => {
  // Refs
  const engineRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Custom hooks for backend integration
  const { 
    getUserPreferences,
    updateUserPreferences,
    getPersonalizationProfiles,
    createPersonalizationProfile,
    updatePersonalizationProfile,
    deletePersonalizationProfile,
    exportPersonalizationSettings,
    importPersonalizationSettings
  } = useDashboardAPIs();

  const { subscribe, unsubscribe } = useRealtimeUpdates();
  const { orchestrateWorkflow, getWorkflowStatus } = useRacineOrchestration();
  const { integrateCrossGroupData, getCrossGroupInsights } = useCrossGroupIntegration();
  const { analyzeUserBehavior, suggestPersonalizations, generateThemes } = useAIAssistant();

  // Component state
  const [state, setState] = useState<PersonalizationState>({
    currentProfile: null,
    profiles: [],
    themePresets: DEFAULT_THEME_PRESETS,
    layoutPresets: DEFAULT_LAYOUT_PRESETS,
    widgetPreferences: [],
    preferences: userPreferences || {
      theme: 'light',
      layout: 'comfortable',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        enabled: true,
        email: true,
        push: true,
        sound: true,
        frequency: 'immediate'
      },
      dashboard: {
        autoRefresh: true,
        refreshInterval: 30,
        defaultView: 'grid',
        itemsPerPage: 20
      }
    },
    previewMode: false,
    isEditing: false,
    hasUnsavedChanges: false,
    isLoading: false,
    error: null,
    aiSuggestions: [],
    usageAnalytics: {}
  });

  // Dialog states
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    isDefault: false
  });

  const [customTheme, setCustomTheme] = useState<Partial<ThemePreset>>({
    name: '',
    description: '',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827'
    },
    isDark: false
  });

  // Computed values
  const currentTheme = useMemo(() => {
    return state.themePresets.find(theme => theme.id === state.preferences.theme) || state.themePresets[0];
  }, [state.themePresets, state.preferences.theme]);

  const currentLayout = useMemo(() => {
    return state.layoutPresets.find(layout => layout.id === state.preferences.layout) || state.layoutPresets[0];
  }, [state.layoutPresets, state.preferences.layout]);

  // Initialize component
  useEffect(() => {
    initializePersonalizationEngine();
    return () => cleanup();
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (state.hasUnsavedChanges && state.isEditing) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.hasUnsavedChanges, state.isEditing]);

  // Initialize personalization engine
  const initializePersonalizationEngine = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load personalization data
      const [preferencesData, profilesData] = await Promise.all([
        getUserPreferences?.() || state.preferences,
        getPersonalizationProfiles?.() || []
      ]);

      // Analyze user behavior for AI suggestions
      const aiSuggestions = await analyzeUserBehavior?.() || [];

      setState(prev => ({
        ...prev,
        preferences: preferencesData,
        profiles: profilesData,
        aiSuggestions,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to initialize personalization engine:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to initialize personalization engine' 
      }));
    }
  }, [getUserPreferences, getPersonalizationProfiles, analyzeUserBehavior, state.preferences]);

  // Handle auto-save
  const handleAutoSave = useCallback(async () => {
    if (!state.hasUnsavedChanges) return;

    try {
      await updateUserPreferences?.(state.preferences);
      setState(prev => ({ ...prev, hasUnsavedChanges: false }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [state.preferences, state.hasUnsavedChanges, updateUserPreferences]);

  // Preference update handlers
  const handlePreferenceChange = useCallback((section: string, key: string, value: any) => {
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...prev.preferences[section],
          [key]: value
        }
      },
      hasUnsavedChanges: true
    }));
  }, []);

  const handleThemeChange = useCallback((themeId: string) => {
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: themeId
      },
      hasUnsavedChanges: true
    }));

    const theme = state.themePresets.find(t => t.id === themeId);
    if (theme && onThemeChange) {
      onThemeChange({
        name: theme.name,
        colors: theme.colors,
        isDark: theme.isDark
      });
    }
  }, [state.themePresets, onThemeChange]);

  const handleLayoutChange = useCallback((layoutId: string) => {
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        layout: layoutId
      },
      hasUnsavedChanges: true
    }));
  }, []);

  // Profile management
  const handleCreateProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const newProfile: PersonalizationProfile = {
        id: `profile_${Date.now()}`,
        name: profileForm.name,
        description: profileForm.description,
        isDefault: profileForm.isDefault,
        preferences: state.preferences,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        usageCount: 0
      };

      if (createPersonalizationProfile) {
        await createPersonalizationProfile(newProfile);
      }

      setState(prev => ({
        ...prev,
        profiles: [...prev.profiles, newProfile],
        currentProfile: newProfile,
        isLoading: false
      }));

      setShowProfileDialog(false);
      setProfileForm({ name: '', description: '', isDefault: false });

      if (onProfileSwitch) {
        onProfileSwitch(newProfile);
      }

    } catch (error) {
      console.error('Failed to create profile:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to create profile' 
      }));
    }
  }, [profileForm, state.preferences, createPersonalizationProfile, onProfileSwitch]);

  const handleSwitchProfile = useCallback(async (profile: PersonalizationProfile) => {
    try {
      setState(prev => ({
        ...prev,
        preferences: profile.preferences,
        currentProfile: profile,
        hasUnsavedChanges: false
      }));

      // Update usage analytics
      if (updatePersonalizationProfile) {
        await updatePersonalizationProfile(profile.id, {
          ...profile,
          lastUsed: new Date().toISOString(),
          usageCount: profile.usageCount + 1
        });
      }

      if (onProfileSwitch) {
        onProfileSwitch(profile);
      }

      if (onPreferencesUpdate) {
        onPreferencesUpdate(profile.preferences);
      }

    } catch (error) {
      console.error('Failed to switch profile:', error);
    }
  }, [updatePersonalizationProfile, onProfileSwitch, onPreferencesUpdate]);

  // Theme management
  const handleCreateCustomTheme = useCallback(async () => {
    try {
      const newTheme: ThemePreset = {
        id: `custom_${Date.now()}`,
        name: customTheme.name || 'Custom Theme',
        description: customTheme.description || 'User created theme',
        colors: customTheme.colors!,
        isDark: customTheme.isDark || false,
        preview: 'custom-preview.png'
      };

      setState(prev => ({
        ...prev,
        themePresets: [...prev.themePresets, newTheme]
      }));

      setShowThemeDialog(false);
      handleThemeChange(newTheme.id);

    } catch (error) {
      console.error('Failed to create custom theme:', error);
    }
  }, [customTheme, handleThemeChange]);

  // Export/Import operations
  const handleExportSettings = useCallback(async () => {
    try {
      const exportData = {
        preferences: state.preferences,
        profiles: state.profiles,
        customThemes: state.themePresets.filter(theme => theme.id.startsWith('custom_')),
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard-personalization.json';
      a.click();
      URL.revokeObjectURL(url);

      setShowExportDialog(false);

    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  }, [state.preferences, state.profiles, state.themePresets]);

  const handleImportSettings = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      setState(prev => ({
        ...prev,
        preferences: importData.preferences || prev.preferences,
        profiles: [...prev.profiles, ...(importData.profiles || [])],
        themePresets: [...prev.themePresets, ...(importData.customThemes || [])],
        hasUnsavedChanges: true
      }));

      setShowImportDialog(false);

    } catch (error) {
      console.error('Failed to import settings:', error);
      setState(prev => ({ ...prev, error: 'Failed to import settings' }));
    }
  }, []);

  // Reset to defaults
  const handleResetToDefaults = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferences: {
        theme: 'light',
        layout: 'comfortable',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          enabled: true,
          email: true,
          push: true,
          sound: true,
          frequency: 'immediate'
        },
        dashboard: {
          autoRefresh: true,
          refreshInterval: 30,
          defaultView: 'grid',
          itemsPerPage: 20
        }
      },
      hasUnsavedChanges: true
    }));
    setShowResetDialog(false);
  }, []);

  // Save all changes
  const handleSaveChanges = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (updateUserPreferences) {
        await updateUserPreferences(state.preferences);
      }

      setState(prev => ({ 
        ...prev, 
        hasUnsavedChanges: false,
        isLoading: false
      }));

      if (onPreferencesUpdate) {
        onPreferencesUpdate(state.preferences);
      }

    } catch (error) {
      console.error('Failed to save preferences:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to save preferences' 
      }));
    }
  }, [state.preferences, updateUserPreferences, onPreferencesUpdate]);

  // Cleanup
  const cleanup = useCallback(() => {
    // Clean up any resources, subscriptions, etc.
  }, []);

  // Render theme selection
  const renderThemeSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Theme</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowThemeDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Custom Theme
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {state.themePresets.map((theme) => (
          <motion.div
            key={theme.id}
            variants={animationVariants.item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200",
                state.preferences.theme === theme.id 
                  ? "ring-2 ring-blue-500 border-blue-500" 
                  : "hover:border-gray-400"
              )}
              onClick={() => handleThemeChange(theme.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{theme.name}</CardTitle>
                  {state.preferences.theme === theme.id && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{theme.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-3">
                  {Object.entries(theme.colors).slice(0, 5).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Badge variant={theme.isDark ? 'secondary' : 'outline'} className="text-xs">
                  {theme.isDark ? 'Dark' : 'Light'}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render layout selection
  const renderLayoutSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Layout</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {state.layoutPresets.map((layout) => (
          <motion.div
            key={layout.id}
            variants={animationVariants.item}
            whileHover={{ scale: 1.01 }}
          >
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200",
                state.preferences.layout === layout.id 
                  ? "ring-2 ring-blue-500 border-blue-500" 
                  : "hover:border-gray-400"
              )}
              onClick={() => handleLayoutChange(layout.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{layout.name}</CardTitle>
                    <p className="text-sm text-gray-600">{layout.description}</p>
                  </div>
                  {state.preferences.layout === layout.id && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Sidebar:</span>
                    <p className="font-medium capitalize">{layout.layout.sidebar}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Header:</span>
                    <p className="font-medium capitalize">{layout.layout.header}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Density:</span>
                    <p className="font-medium capitalize">{layout.layout.density}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Grid:</span>
                    <p className="font-medium">{layout.layout.gridSize} cols</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render notification preferences
  const renderNotificationPreferences = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Notifications</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Enable Notifications</Label>
            <p className="text-sm text-gray-600">Receive alerts and updates</p>
          </div>
          <Switch
            checked={state.preferences.notifications?.enabled}
            onCheckedChange={(checked) => 
              handlePreferenceChange('notifications', 'enabled', checked)
            }
          />
        </div>
        
        {state.preferences.notifications?.enabled && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  checked={state.preferences.notifications?.email}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'email', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-gray-600">Browser push notifications</p>
                </div>
                <Switch
                  checked={state.preferences.notifications?.push}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'push', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Sound Alerts</Label>
                  <p className="text-sm text-gray-600">Play sound for notifications</p>
                </div>
                <Switch
                  checked={state.preferences.notifications?.sound}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'sound', checked)
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base">Notification Frequency</Label>
                <Select
                  value={state.preferences.notifications?.frequency}
                  onValueChange={(value) => 
                    handlePreferenceChange('notifications', 'frequency', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Render dashboard preferences
  const renderDashboardPreferences = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Dashboard</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Auto Refresh</Label>
            <p className="text-sm text-gray-600">Automatically refresh dashboard data</p>
          </div>
          <Switch
            checked={state.preferences.dashboard?.autoRefresh}
            onCheckedChange={(checked) => 
              handlePreferenceChange('dashboard', 'autoRefresh', checked)
            }
          />
        </div>
        
        {state.preferences.dashboard?.autoRefresh && (
          <div className="space-y-2">
            <Label className="text-base">Refresh Interval (seconds)</Label>
            <div className="px-3">
              <Slider
                value={[state.preferences.dashboard?.refreshInterval || 30]}
                onValueChange={([value]) => 
                  handlePreferenceChange('dashboard', 'refreshInterval', value)
                }
                min={10}
                max={300}
                step={10}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>{state.preferences.dashboard?.refreshInterval}s</span>
                <span>5m</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label className="text-base">Default View</Label>
          <Select
            value={state.preferences.dashboard?.defaultView}
            onValueChange={(value) => 
              handlePreferenceChange('dashboard', 'defaultView', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="card">Card View</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-base">Items Per Page</Label>
          <Select
            value={state.preferences.dashboard?.itemsPerPage?.toString()}
            onValueChange={(value) => 
              handlePreferenceChange('dashboard', 'itemsPerPage', parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <motion.div
        ref={engineRef}
        className="p-6 space-y-6"
        variants={animationVariants.container}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 mr-3" />
              Dashboard Personalization
            </h1>
            <p className="text-gray-600 mt-1">
              Customize your dashboard experience and preferences
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {state.hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Unsaved Changes
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profiles
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {state.profiles.map((profile) => (
                  <DropdownMenuItem
                    key={profile.id}
                    onClick={() => handleSwitchProfile(profile)}
                  >
                    {profile.name}
                    {profile.isDefault && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}
                  </DropdownMenuItem>
                ))}
                <Separator />
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export/Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={handleSaveChanges}
              disabled={!state.hasUnsavedChanges || state.isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Personalization Tabs */}
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-6">
            {renderThemeSelection()}
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-6">
            {renderLayoutSelection()}
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            {renderNotificationPreferences()}
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-6">
            {renderDashboardPreferences()}
          </TabsContent>
        </Tabs>

        {/* Create Profile Dialog */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Personalization Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Profile Name</Label>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter profile name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={profileForm.description}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter profile description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={profileForm.isDefault}
                  onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label>Set as default profile</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProfile}
                  disabled={!profileForm.name || state.isLoading}
                >
                  Create Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Custom Theme Dialog */}
        <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Theme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Theme Name</Label>
                  <Input
                    value={customTheme.name}
                    onChange={(e) => setCustomTheme(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter theme name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={customTheme.description}
                    onChange={(e) => setCustomTheme(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(customTheme.colors || {}).map(([key, color]) => (
                  <div key={key}>
                    <Label className="capitalize">{key}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => setCustomTheme(prev => ({
                          ...prev,
                          colors: { ...prev.colors!, [key]: e.target.value }
                        }))}
                        className="w-12 h-8"
                      />
                      <Input
                        value={color}
                        onChange={(e) => setCustomTheme(prev => ({
                          ...prev,
                          colors: { ...prev.colors!, [key]: e.target.value }
                        }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={customTheme.isDark}
                  onCheckedChange={(checked) => setCustomTheme(prev => ({ ...prev, isDark: checked }))}
                />
                <Label>Dark theme</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowThemeDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCustomTheme}
                  disabled={!customTheme.name}
                >
                  Create Theme
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset to Defaults</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset all your personalization settings to their default values. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetToDefaults}>
                Reset Settings
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Loading overlay */}
        {(state.isLoading || isLoading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Saving personalization...</span>
              </div>
            </div>
          </div>
        )}

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
