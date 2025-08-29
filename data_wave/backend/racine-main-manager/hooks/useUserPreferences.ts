/**
 * 👤 USER PREFERENCES HOOK - ENTERPRISE PREFERENCE MANAGEMENT
 * ===========================================================
 * 
 * Advanced user preferences hook that provides comprehensive preference
 * management across all aspects of the data governance system. Features include:
 * - Theme and layout preferences
 * - Navigation and workspace customization
 * - Cross-device preference synchronization
 * - Advanced accessibility preferences
 * - Personalized dashboard configurations
 * - SPA-specific preference management
 * - Real-time preference updates
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Backend API Integration
import { userManagementAPI } from '../services/user-management-apis';
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis';
import { workspaceManagementAPI } from '../services/workspace-management-apis';

// Type Definitions
import {
  UserPreferences,
  ThemePreferences,
  LayoutPreferences,
  NavigationPreferences,
  AccessibilityPreferences,
  DashboardPreferences,
  WorkspacePreferences,
  NotificationPreferences,
  SPAPreferences,
  SecurityPreferences,
  UUID,
  ISODateString,
  SPAType
} from '../types/racine-core.types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface UserPreferencesState {
  // Core Preferences
  userPreferences: UserPreferences;
  
  // Specific Preference Categories
  theme: ThemePreferences;
  layout: LayoutPreferences;
  navigation: NavigationPreferences;
  accessibility: AccessibilityPreferences;
  dashboard: DashboardPreferences;
  workspace: WorkspacePreferences;
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  
  // SPA-Specific Preferences
  spaPreferences: Record<SPAType, SPAPreferences>;
  
  // Device & Sync
  devicePreferences: Record<string, Partial<UserPreferences>>;
  syncEnabled: boolean;
  lastSyncTime: ISODateString | null;
  
  // Customization Features
  customThemes: Array<{
    id: string;
    name: string;
    theme: ThemePreferences;
    isActive: boolean;
  }>;
  customLayouts: Array<{
    id: string;
    name: string;
    layout: LayoutPreferences;
    isActive: boolean;
  }>;
  
  // State Management
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
  lastUpdated: ISODateString | null;
  
  // Import/Export
  isExporting: boolean;
  isImporting: boolean;
  
  // Validation
  validationErrors: Record<string, string[]>;
  
  // Preview Mode
  previewMode: boolean;
  previewPreferences: Partial<UserPreferences> | null;
}

export interface UserPreferencesActions {
  // Core Preference Management
  loadPreferences: (forceRefresh?: boolean) => Promise<void>;
  savePreferences: (preferences?: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: (category?: keyof UserPreferences) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  
  // Theme Management
  setTheme: (theme: Partial<ThemePreferences>) => void;
  createCustomTheme: (name: string, theme: ThemePreferences) => Promise<void>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
  applyCustomTheme: (themeId: string) => void;
  toggleDarkMode: () => void;
  setColorScheme: (scheme: string) => void;
  
  // Layout Management
  setLayout: (layout: Partial<LayoutPreferences>) => void;
  createCustomLayout: (name: string, layout: LayoutPreferences) => Promise<void>;
  deleteCustomLayout: (layoutId: string) => Promise<void>;
  applyCustomLayout: (layoutId: string) => void;
  setLayoutMode: (mode: string) => void;
  toggleSidebarCollapsed: () => void;
  
  // Navigation Preferences
  setNavigation: (navigation: Partial<NavigationPreferences>) => void;
  setPinnedItems: (items: string[]) => void;
  addPinnedItem: (itemId: string) => void;
  removePinnedItem: (itemId: string) => void;
  setNavigationStyle: (style: string) => void;
  
  // Accessibility Preferences
  setAccessibility: (accessibility: Partial<AccessibilityPreferences>) => void;
  toggleHighContrast: () => void;
  setFontSize: (size: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  
  // Dashboard Preferences
  setDashboard: (dashboard: Partial<DashboardPreferences>) => void;
  setDashboardLayout: (layout: any[]) => void;
  addDashboardWidget: (widget: any) => void;
  removeDashboardWidget: (widgetId: string) => void;
  reorderDashboardWidgets: (widgetIds: string[]) => void;
  
  // Workspace Preferences
  setWorkspace: (workspace: Partial<WorkspacePreferences>) => void;
  setDefaultWorkspace: (workspaceId: string) => void;
  setWorkspaceAutoSwitch: (enabled: boolean) => void;
  
  // Notification Preferences
  setNotifications: (notifications: Partial<NotificationPreferences>) => void;
  setNotificationChannel: (channel: string, enabled: boolean) => void;
  setNotificationFrequency: (frequency: string) => void;
  toggleNotificationSound: () => void;
  
  // Security Preferences
  setSecurity: (security: Partial<SecurityPreferences>) => void;
  setSessionTimeout: (timeout: number) => void;
  toggleTwoFactorAuth: () => Promise<void>;
  setPasswordPolicy: (policy: any) => void;
  
  // SPA-Specific Preferences
  setSPAPreferences: (spaType: SPAType, preferences: Partial<SPAPreferences>) => void;
  getSPAPreferences: (spaType: SPAType) => SPAPreferences;
  resetSPAPreferences: (spaType: SPAType) => void;
  
  // Device & Sync Management
  enableSync: () => Promise<void>;
  disableSync: () => Promise<void>;
  syncPreferences: () => Promise<void>;
  getDevicePreferences: (deviceId: string) => Partial<UserPreferences> | null;
  setDeviceSpecificPreferences: (deviceId: string, preferences: Partial<UserPreferences>) => Promise<void>;
  
  // Import/Export
  exportPreferences: (format: 'json' | 'yaml', includeCustomizations?: boolean) => Promise<Blob>;
  importPreferences: (file: File, mergeStrategy?: 'overwrite' | 'merge') => Promise<void>;
  sharePreferences: (recipientEmail: string, categories?: string[]) => Promise<void>;
  
  // Validation & Preview
  validatePreferences: (preferences: Partial<UserPreferences>) => Record<string, string[]>;
  enterPreviewMode: (previewPreferences: Partial<UserPreferences>) => void;
  exitPreviewMode: (applyChanges?: boolean) => void;
  
  // Quick Actions
  quickSetDarkMode: () => void;
  quickSetCompactLayout: () => void;
  quickSetAccessibilityMode: () => void;
  quickResetToDefaults: (category: string) => Promise<void>;
  
  // Advanced Features
  createPreferenceProfile: (name: string, preferences: UserPreferences) => Promise<void>;
  loadPreferenceProfile: (profileId: string) => Promise<void>;
  getPreferenceProfiles: () => Promise<Array<{ id: string; name: string; createdAt: string }>>;
  deletePreferenceProfile: (profileId: string) => Promise<void>;
  
  // Analytics & Insights
  getPreferenceUsageAnalytics: () => Promise<{
    mostUsedFeatures: string[];
    preferenceChangeHistory: any[];
    optimizationSuggestions: string[];
  }>;
  getPersonalizationRecommendations: () => Promise<{
    recommendedThemes: ThemePreferences[];
    recommendedLayouts: LayoutPreferences[];
    suggestedCustomizations: string[];
  }>;
}

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

const getDefaultPreferences = (): UserPreferences => ({
  id: '',
  userId: '',
  
  theme: {
    mode: 'system',
    primaryColor: '#2563eb',
    accentColor: '#10b981',
    colorScheme: 'blue',
    customColors: {},
    fontFamily: 'inter',
    borderRadius: 'medium',
    glassEffect: true,
    animations: true
  },
  
  layout: {
    mode: 'default',
    sidebarPosition: 'left',
    sidebarCollapsed: false,
    sidebarWidth: 280,
    headerHeight: 64,
    contentPadding: 'normal',
    gridGap: 'medium',
    responsiveBreakpoints: {},
    customLayouts: {}
  },
  
  navigation: {
    style: 'modern',
    showIcons: true,
    showLabels: true,
    pinnedItems: [],
    recentItems: [],
    maxRecentItems: 10,
    groupSimilarItems: true,
    enableKeyboardShortcuts: true,
    breadcrumbStyle: 'full'
  },
  
  accessibility: {
    highContrast: false,
    fontSize: 16,
    fontWeight: 'normal',
    reducedMotion: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    focusVisible: true,
    colorBlindnessSupport: 'none',
    languageCode: 'en'
  },
  
  dashboard: {
    layout: [],
    widgets: [],
    refreshInterval: 300000,
    autoRefresh: true,
    compactMode: false,
    showWidgetTitles: true,
    allowWidgetReordering: true,
    defaultTimeRange: '24h'
  },
  
  workspace: {
    defaultWorkspaceId: null,
    autoSwitchWorkspace: false,
    showWorkspaceSwitcher: true,
    workspaceSpecificSettings: true,
    recentWorkspaces: [],
    maxRecentWorkspaces: 5
  },
  
  notifications: {
    enabled: true,
    channels: {
      email: true,
      push: true,
      inApp: true,
      sms: false
    },
    frequency: 'realtime',
    quiet: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    },
    categories: {},
    sound: true,
    vibration: true
  },
  
  security: {
    sessionTimeout: 3600000,
    autoLock: false,
    twoFactorEnabled: false,
    passwordPolicy: 'standard',
    securityAlerts: true,
    loginNotifications: true,
    apiKeyManagement: {
      autoRotation: false,
      expirationNotifications: true
    }
  },
  
  spaPreferences: {} as Record<SPAType, SPAPreferences>,
  
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: '1.0.0'
});

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export const useUserPreferences = (
  options?: {
    autoLoad?: boolean;
    autoSave?: boolean;
    saveDelay?: number;
    enableSync?: boolean;
    enableAnalytics?: boolean;
  }
): UserPreferencesState & UserPreferencesActions => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [preferencesState, setPreferencesState] = useState<UserPreferencesState>({
    // Core Preferences
    userPreferences: getDefaultPreferences(),
    
    // Specific Preference Categories
    theme: getDefaultPreferences().theme,
    layout: getDefaultPreferences().layout,
    navigation: getDefaultPreferences().navigation,
    accessibility: getDefaultPreferences().accessibility,
    dashboard: getDefaultPreferences().dashboard,
    workspace: getDefaultPreferences().workspace,
    notifications: getDefaultPreferences().notifications,
    security: getDefaultPreferences().security,
    
    // SPA-Specific Preferences
    spaPreferences: {},
    
    // Device & Sync
    devicePreferences: {},
    syncEnabled: options?.enableSync ?? false,
    lastSyncTime: null,
    
    // Customization Features
    customThemes: [],
    customLayouts: [],
    
    // State Management
    isLoading: false,
    isSaving: false,
    hasUnsavedChanges: false,
    error: null,
    lastUpdated: null,
    
    // Import/Export
    isExporting: false,
    isImporting: false,
    
    // Validation
    validationErrors: {},
    
    // Preview Mode
    previewMode: false,
    previewPreferences: null
  });

  // ========================================================================
  // REFS & PERFORMANCE
  // ========================================================================
  
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const originalPreferences = useRef<UserPreferences>(getDefaultPreferences());
  const syncInterval = useRef<NodeJS.Timeout | null>(null);

  // ========================================================================
  // CORE PREFERENCE MANAGEMENT
  // ========================================================================

  const loadPreferences = useCallback(async (forceRefresh = false) => {
    if (preferencesState.isLoading && !forceRefresh) return;
    
    try {
      setPreferencesState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load user preferences from backend
      const [
        userPrefs,
        customThemes,
        customLayouts,
        devicePrefs
      ] = await Promise.all([
        userManagementAPI.getUserPreferences(),
        userManagementAPI.getCustomThemes(),
        userManagementAPI.getCustomLayouts(),
        userManagementAPI.getDevicePreferences()
      ]);
      
      // Merge with defaults to ensure all properties exist
      const mergedPreferences = {
        ...getDefaultPreferences(),
        ...userPrefs
      };
      
      originalPreferences.current = { ...mergedPreferences };
      
      setPreferencesState(prev => ({
        ...prev,
        userPreferences: mergedPreferences,
        theme: mergedPreferences.theme,
        layout: mergedPreferences.layout,
        navigation: mergedPreferences.navigation,
        accessibility: mergedPreferences.accessibility,
        dashboard: mergedPreferences.dashboard,
        workspace: mergedPreferences.workspace,
        notifications: mergedPreferences.notifications,
        security: mergedPreferences.security,
        spaPreferences: mergedPreferences.spaPreferences,
        customThemes,
        customLayouts,
        devicePreferences: devicePrefs,
        lastUpdated: new Date().toISOString(),
        isLoading: false
      }));
      
    } catch (error: any) {
      console.error('Failed to load user preferences:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to load preferences';
      if (error.message) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Preferences loading timed out - using default settings';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error - using cached preferences';
        } else if (error.message.includes('HTTP 5')) {
          errorMessage = 'Server error - using default preferences';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Set error state but don't break the app
      setPreferencesState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      
      // Log the error for debugging but continue with defaults
      console.warn('Continuing with default preferences due to error:', errorMessage);
    }
  }, [preferencesState.isLoading]);

  const savePreferences = useCallback(async (preferences?: Partial<UserPreferences>) => {
    try {
      setPreferencesState(prev => ({ ...prev, isSaving: true, error: null }));
      
      const prefsToSave = preferences || preferencesState.userPreferences;
      
      // Validate preferences before saving
      const validationErrors = validatePreferences(prefsToSave);
      if (Object.keys(validationErrors).length > 0) {
        setPreferencesState(prev => ({
          ...prev,
          validationErrors,
          isSaving: false
        }));
        return;
      }
      
      // Save to backend
      const updatedPreferences = await userManagementAPI.updateUserPreferences(prefsToSave);
      
      // Update state
      setPreferencesState(prev => ({
        ...prev,
        userPreferences: updatedPreferences,
        hasUnsavedChanges: false,
        lastUpdated: new Date().toISOString(),
        isSaving: false,
        validationErrors: {}
      }));
      
      // Sync across devices if enabled
      if (preferencesState.syncEnabled) {
        syncPreferences();
      }
      
      // Track analytics
      if (options?.enableAnalytics) {
        racineOrchestrationAPI.trackPreferenceChange({
          category: 'preferences_updated',
          changes: preferences || {},
          timestamp: new Date().toISOString()
        }).catch(error => {
          console.warn('Failed to track preference change:', error);
        });
      }
      
    } catch (error: any) {
      console.error('Failed to save user preferences:', error);
      setPreferencesState(prev => ({
        ...prev,
        error: error.message || 'Failed to save preferences',
        isSaving: false
      }));
    }
  }, [preferencesState.userPreferences, preferencesState.syncEnabled, options?.enableAnalytics]);

  // ========================================================================
  // AUTO-SAVE FUNCTIONALITY
  // ========================================================================

  const debouncedSave = useCallback(() => {
    if (!options?.autoSave) return;
    
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    saveTimeout.current = setTimeout(() => {
      if (preferencesState.hasUnsavedChanges) {
        savePreferences();
      }
    }, options?.saveDelay || 2000);
  }, [options?.autoSave, options?.saveDelay, preferencesState.hasUnsavedChanges, savePreferences]);

  // ========================================================================
  // PREFERENCE CATEGORY SETTERS
  // ========================================================================

  const setTheme = useCallback((theme: Partial<ThemePreferences>) => {
    setPreferencesState(prev => {
      const updatedTheme = { ...prev.theme, ...theme };
      const updatedPreferences = { ...prev.userPreferences, theme: updatedTheme };
      
      return {
        ...prev,
        theme: updatedTheme,
        userPreferences: updatedPreferences,
        hasUnsavedChanges: true
      };
    });
    
    debouncedSave();
  }, [debouncedSave]);

  const setLayout = useCallback((layout: Partial<LayoutPreferences>) => {
    setPreferencesState(prev => {
      const updatedLayout = { ...prev.layout, ...layout };
      const updatedPreferences = { ...prev.userPreferences, layout: updatedLayout };
      
      return {
        ...prev,
        layout: updatedLayout,
        userPreferences: updatedPreferences,
        hasUnsavedChanges: true
      };
    });
    
    debouncedSave();
  }, [debouncedSave]);

  const setNavigation = useCallback((navigation: Partial<NavigationPreferences>) => {
    setPreferencesState(prev => {
      const updatedNavigation = { ...prev.navigation, ...navigation };
      const updatedPreferences = { ...prev.userPreferences, navigation: updatedNavigation };
      
      return {
        ...prev,
        navigation: updatedNavigation,
        userPreferences: updatedPreferences,
        hasUnsavedChanges: true
      };
    });
    
    debouncedSave();
  }, [debouncedSave]);

  const setAccessibility = useCallback((accessibility: Partial<AccessibilityPreferences>) => {
    setPreferencesState(prev => {
      const updatedAccessibility = { ...prev.accessibility, ...accessibility };
      const updatedPreferences = { ...prev.userPreferences, accessibility: updatedAccessibility };
      
      return {
        ...prev,
        accessibility: updatedAccessibility,
        userPreferences: updatedPreferences,
        hasUnsavedChanges: true
      };
    });
    
    debouncedSave();
  }, [debouncedSave]);

  // ========================================================================
  // VALIDATION FUNCTIONS
  // ========================================================================

  const validatePreferences = useCallback((preferences: Partial<UserPreferences>): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};
    
    // Theme validation
    if (preferences.theme) {
      if (preferences.theme.fontSize && (preferences.theme.fontSize < 10 || preferences.theme.fontSize > 32)) {
        errors.theme = errors.theme || [];
        errors.theme.push('Font size must be between 10 and 32 pixels');
      }
    }
    
    // Layout validation
    if (preferences.layout) {
      if (preferences.layout.sidebarWidth && (preferences.layout.sidebarWidth < 200 || preferences.layout.sidebarWidth > 500)) {
        errors.layout = errors.layout || [];
        errors.layout.push('Sidebar width must be between 200 and 500 pixels');
      }
    }
    
    // Security validation
    if (preferences.security) {
      if (preferences.security.sessionTimeout && preferences.security.sessionTimeout < 300000) {
        errors.security = errors.security || [];
        errors.security.push('Session timeout must be at least 5 minutes');
      }
    }
    
    return errors;
  }, []);

  // ========================================================================
  // SYNC FUNCTIONALITY
  // ========================================================================

  const syncPreferences = useCallback(async () => {
    if (!preferencesState.syncEnabled) return;
    
    try {
      await userManagementAPI.syncPreferencesAcrossDevices({
        preferences: preferencesState.userPreferences,
        deviceId: navigator.userAgent
      });
      
      setPreferencesState(prev => ({
        ...prev,
        lastSyncTime: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Failed to sync preferences:', error);
    }
  }, [preferencesState.syncEnabled, preferencesState.userPreferences]);

  // ========================================================================
  // QUICK ACTIONS
  // ========================================================================

  const toggleDarkMode = useCallback(() => {
    const newMode = preferencesState.theme.mode === 'dark' ? 'light' : 'dark';
    setTheme({ mode: newMode });
  }, [preferencesState.theme.mode, setTheme]);

  const toggleSidebarCollapsed = useCallback(() => {
    setLayout({ sidebarCollapsed: !preferencesState.layout.sidebarCollapsed });
  }, [preferencesState.layout.sidebarCollapsed, setLayout]);

  const toggleHighContrast = useCallback(() => {
    setAccessibility({ highContrast: !preferencesState.accessibility.highContrast });
  }, [preferencesState.accessibility.highContrast, setAccessibility]);

  // ========================================================================
  // LIFECYCLE & EFFECTS
  // ========================================================================

  // Auto-load preferences on mount
  useEffect(() => {
    if (options?.autoLoad !== false) {
      loadPreferences();
    }
  }, [loadPreferences, options?.autoLoad]);

  // Set up sync interval
  useEffect(() => {
    if (preferencesState.syncEnabled) {
      syncInterval.current = setInterval(syncPreferences, 300000); // 5 minutes
      return () => {
        if (syncInterval.current) {
          clearInterval(syncInterval.current);
        }
      };
    }
  }, [preferencesState.syncEnabled, syncPreferences]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
      }
    };
  }, []);

  // ========================================================================
  // RETURN HOOK INTERFACE
  // ========================================================================

  return {
    // State
    ...preferencesState,
    
    // Core Preference Management
    loadPreferences,
    savePreferences,
    resetPreferences: async (category?) => {
      const defaults = getDefaultPreferences();
      if (category) {
        const resetValue = defaults[category as keyof UserPreferences];
        setPreferencesState(prev => ({
          ...prev,
          [category]: resetValue,
          userPreferences: { ...prev.userPreferences, [category]: resetValue },
          hasUnsavedChanges: true
        }));
      } else {
        setPreferencesState(prev => ({
          ...prev,
          userPreferences: defaults,
          theme: defaults.theme,
          layout: defaults.layout,
          navigation: defaults.navigation,
          accessibility: defaults.accessibility,
          dashboard: defaults.dashboard,
          workspace: defaults.workspace,
          notifications: defaults.notifications,
          security: defaults.security,
          hasUnsavedChanges: true
        }));
      }
      debouncedSave();
    },
    resetToDefaults: async () => {
      const defaults = getDefaultPreferences();
      setPreferencesState(prev => ({
        ...prev,
        userPreferences: defaults,
        theme: defaults.theme,
        layout: defaults.layout,
        navigation: defaults.navigation,
        accessibility: defaults.accessibility,
        dashboard: defaults.dashboard,
        workspace: defaults.workspace,
        notifications: defaults.notifications,
        security: defaults.security,
        hasUnsavedChanges: true
      }));
      await savePreferences(defaults);
    },
    
    // Category Setters
    setTheme,
    createCustomTheme: async (name, theme) => {
      const customTheme = { id: `theme_${Date.now()}`, name, theme, isActive: false };
      await userManagementAPI.createCustomTheme(customTheme);
      setPreferencesState(prev => ({
        ...prev,
        customThemes: [...prev.customThemes, customTheme]
      }));
    },
    deleteCustomTheme: async (themeId) => {
      await userManagementAPI.deleteCustomTheme(themeId);
      setPreferencesState(prev => ({
        ...prev,
        customThemes: prev.customThemes.filter(t => t.id !== themeId)
      }));
    },
    applyCustomTheme: (themeId) => {
      const customTheme = preferencesState.customThemes.find(t => t.id === themeId);
      if (customTheme) {
        setTheme(customTheme.theme);
      }
    },
    toggleDarkMode,
    setColorScheme: (scheme) => setTheme({ colorScheme: scheme }),
    
    // Layout Management
    setLayout,
    createCustomLayout: async (name, layout) => {
      const customLayout = { id: `layout_${Date.now()}`, name, layout, isActive: false };
      await userManagementAPI.createCustomLayout(customLayout);
      setPreferencesState(prev => ({
        ...prev,
        customLayouts: [...prev.customLayouts, customLayout]
      }));
    },
    deleteCustomLayout: async (layoutId) => {
      await userManagementAPI.deleteCustomLayout(layoutId);
      setPreferencesState(prev => ({
        ...prev,
        customLayouts: prev.customLayouts.filter(l => l.id !== layoutId)
      }));
    },
    applyCustomLayout: (layoutId) => {
      const customLayout = preferencesState.customLayouts.find(l => l.id === layoutId);
      if (customLayout) {
        setLayout(customLayout.layout);
      }
    },
    setLayoutMode: (mode) => setLayout({ mode }),
    toggleSidebarCollapsed,
    
    // Navigation Preferences
    setNavigation,
    setPinnedItems: (items) => setNavigation({ pinnedItems: items }),
    addPinnedItem: (itemId) => {
      const currentPinned = preferencesState.navigation.pinnedItems;
      if (!currentPinned.includes(itemId)) {
        setNavigation({ pinnedItems: [...currentPinned, itemId] });
      }
    },
    removePinnedItem: (itemId) => {
      setNavigation({ 
        pinnedItems: preferencesState.navigation.pinnedItems.filter(id => id !== itemId) 
      });
    },
    setNavigationStyle: (style) => setNavigation({ style }),
    
    // Accessibility Preferences
    setAccessibility,
    toggleHighContrast,
    setFontSize: (size) => setAccessibility({ fontSize: size }),
    setReducedMotion: (enabled) => setAccessibility({ reducedMotion: enabled }),
    setScreenReaderMode: (enabled) => setAccessibility({ screenReaderOptimized: enabled }),
    
    // Dashboard Preferences
    setDashboard: (dashboard) => {
      setPreferencesState(prev => {
        const updatedDashboard = { ...prev.dashboard, ...dashboard };
        const updatedPreferences = { ...prev.userPreferences, dashboard: updatedDashboard };
        
        return {
          ...prev,
          dashboard: updatedDashboard,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    setDashboardLayout: (layout) => {
      setPreferencesState(prev => {
        const updatedDashboard = { ...prev.dashboard, layout };
        const updatedPreferences = { ...prev.userPreferences, dashboard: updatedDashboard };
        
        return {
          ...prev,
          dashboard: updatedDashboard,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    addDashboardWidget: (widget) => {
      setPreferencesState(prev => {
        const updatedWidgets = [...prev.dashboard.widgets, widget];
        const updatedDashboard = { ...prev.dashboard, widgets: updatedWidgets };
        const updatedPreferences = { ...prev.userPreferences, dashboard: updatedDashboard };
        
        return {
          ...prev,
          dashboard: updatedDashboard,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    removeDashboardWidget: (widgetId) => {
      setPreferencesState(prev => {
        const updatedWidgets = prev.dashboard.widgets.filter(w => w.id !== widgetId);
        const updatedDashboard = { ...prev.dashboard, widgets: updatedWidgets };
        const updatedPreferences = { ...prev.userPreferences, dashboard: updatedDashboard };
        
        return {
          ...prev,
          dashboard: updatedDashboard,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    reorderDashboardWidgets: (widgetIds) => {
      const reorderedWidgets = widgetIds.map(id => 
        preferencesState.dashboard.widgets.find(w => w.id === id)
      ).filter(Boolean);
      
      setPreferencesState(prev => {
        const updatedDashboard = { ...prev.dashboard, widgets: reorderedWidgets };
        const updatedPreferences = { ...prev.userPreferences, dashboard: updatedDashboard };
        
        return {
          ...prev,
          dashboard: updatedDashboard,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    
    // Workspace Preferences
    setWorkspace: (workspace) => {
      setPreferencesState(prev => {
        const updatedWorkspace = { ...prev.workspace, ...workspace };
        const updatedPreferences = { ...prev.userPreferences, workspace: updatedWorkspace };
        
        return {
          ...prev,
          workspace: updatedWorkspace,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    setDefaultWorkspace: (workspaceId) => {
      setPreferencesState(prev => {
        const updatedWorkspace = { ...prev.workspace, defaultWorkspaceId: workspaceId };
        const updatedPreferences = { ...prev.userPreferences, workspace: updatedWorkspace };
        
        return {
          ...prev,
          workspace: updatedWorkspace,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    setWorkspaceAutoSwitch: (enabled) => {
      setPreferencesState(prev => {
        const updatedWorkspace = { ...prev.workspace, autoSwitchWorkspace: enabled };
        const updatedPreferences = { ...prev.userPreferences, workspace: updatedWorkspace };
        
        return {
          ...prev,
          workspace: updatedWorkspace,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    
    // Notification Preferences
    setNotifications: (notifications) => {
      setPreferencesState(prev => {
        const updatedNotifications = { ...prev.notifications, ...notifications };
        const updatedPreferences = { ...prev.userPreferences, notifications: updatedNotifications };
        
        return {
          ...prev,
          notifications: updatedNotifications,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    setNotificationChannel: (channel, enabled) => {
      setPreferencesState(prev => {
        const updatedChannels = { ...prev.notifications.channels, [channel]: enabled };
        const updatedNotifications = { ...prev.notifications, channels: updatedChannels };
        const updatedPreferences = { ...prev.userPreferences, notifications: updatedNotifications };
        
        return {
          ...prev,
          notifications: updatedNotifications,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    setNotificationFrequency: (frequency) => {
      setPreferencesState(prev => {
        const updatedNotifications = { ...prev.notifications, frequency };
        const updatedPreferences = { ...prev.userPreferences, notifications: updatedNotifications };
        
        return {
          ...prev,
          notifications: updatedNotifications,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    toggleNotificationSound: () => {
      setPreferencesState(prev => {
        const updatedNotifications = { ...prev.notifications, sound: !prev.notifications.sound };
        const updatedPreferences = { ...prev.userPreferences, notifications: updatedNotifications };
        
        return {
          ...prev,
          notifications: updatedNotifications,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    
    // Security Preferences
    setSecurity: (security) => {
      setPreferencesState(prev => {
        const updatedSecurity = { ...prev.security, ...security };
        const updatedPreferences = { ...prev.userPreferences, security: updatedSecurity };
        
        return {
          ...prev,
          security: updatedSecurity,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    setSessionTimeout: (timeout) => {
      setPreferencesState(prev => {
        const updatedSecurity = { ...prev.security, sessionTimeout: timeout };
        const updatedPreferences = { ...prev.userPreferences, security: updatedSecurity };
        
        return {
          ...prev,
          security: updatedSecurity,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    toggleTwoFactorAuth: async () => {
      const newValue = !preferencesState.security.twoFactorEnabled;
      if (newValue) {
        // Enable 2FA
        await userManagementAPI.enableTwoFactorAuth();
      } else {
        // Disable 2FA
        await userManagementAPI.disableTwoFactorAuth();
      }
      
      setPreferencesState(prev => {
        const updatedSecurity = { ...prev.security, twoFactorEnabled: newValue };
        const updatedPreferences = { ...prev.userPreferences, security: updatedSecurity };
        
        return {
          ...prev,
          security: updatedSecurity,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    setPasswordPolicy: (policy) => {
      setPreferencesState(prev => {
        const updatedSecurity = { ...prev.security, passwordPolicy: policy };
        const updatedPreferences = { ...prev.userPreferences, security: updatedSecurity };
        
        return {
          ...prev,
          security: updatedSecurity,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    
    // SPA-Specific Preferences
    setSPAPreferences: (spaType, preferences) => {
      setPreferencesState(prev => {
        const updatedSPAPrefs = {
          ...prev.spaPreferences,
          [spaType]: { ...prev.spaPreferences[spaType], ...preferences }
        };
        const updatedPreferences = { ...prev.userPreferences, spaPreferences: updatedSPAPrefs };
        
        return {
          ...prev,
          spaPreferences: updatedSPAPrefs,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    getSPAPreferences: (spaType) => {
      return preferencesState.spaPreferences[spaType] || {};
    },
    resetSPAPreferences: (spaType) => {
      setPreferencesState(prev => {
        const updatedSPAPrefs = { ...prev.spaPreferences };
        delete updatedSPAPrefs[spaType];
        const updatedPreferences = { ...prev.userPreferences, spaPreferences: updatedSPAPrefs };
        
        return {
          ...prev,
          spaPreferences: updatedSPAPrefs,
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true
        };
      });
      debouncedSave();
    },
    
    // Device & Sync Management
    enableSync: async () => {
      await userManagementAPI.enablePreferenceSync();
      setPreferencesState(prev => ({ ...prev, syncEnabled: true }));
    },
    disableSync: async () => {
      await userManagementAPI.disablePreferenceSync();
      setPreferencesState(prev => ({ ...prev, syncEnabled: false }));
    },
    syncPreferences,
    getDevicePreferences: (deviceId) => {
      return preferencesState.devicePreferences[deviceId] || null;
    },
    setDeviceSpecificPreferences: async (deviceId, preferences) => {
      await userManagementAPI.setDeviceSpecificPreferences(deviceId, preferences);
      setPreferencesState(prev => ({
        ...prev,
        devicePreferences: {
          ...prev.devicePreferences,
          [deviceId]: preferences
        }
      }));
    },
    
    // Import/Export
    exportPreferences: async (format, includeCustomizations = true) => {
      setPreferencesState(prev => ({ ...prev, isExporting: true }));
      try {
        const blob = await userManagementAPI.exportUserPreferences({
          format,
          includeCustomizations,
          preferences: preferencesState.userPreferences
        });
        return blob;
      } finally {
        setPreferencesState(prev => ({ ...prev, isExporting: false }));
      }
    },
    importPreferences: async (file, mergeStrategy = 'merge') => {
      setPreferencesState(prev => ({ ...prev, isImporting: true }));
      try {
        const importedPrefs = await userManagementAPI.importUserPreferences(file, mergeStrategy);
        setPreferencesState(prev => ({
          ...prev,
          userPreferences: importedPrefs,
          theme: importedPrefs.theme,
          layout: importedPrefs.layout,
          navigation: importedPrefs.navigation,
          accessibility: importedPrefs.accessibility,
          dashboard: importedPrefs.dashboard,
          workspace: importedPrefs.workspace,
          notifications: importedPrefs.notifications,
          security: importedPrefs.security,
          hasUnsavedChanges: true
        }));
        await savePreferences(importedPrefs);
      } finally {
        setPreferencesState(prev => ({ ...prev, isImporting: false }));
      }
    },
    sharePreferences: async (recipientEmail, categories) => {
      await userManagementAPI.sharePreferences({
        recipientEmail,
        categories,
        preferences: preferencesState.userPreferences
      });
    },
    
    // Validation & Preview
    validatePreferences,
    enterPreviewMode: (previewPreferences) => {
      setPreferencesState(prev => ({
        ...prev,
        previewMode: true,
        previewPreferences
      }));
    },
    exitPreviewMode: (applyChanges = false) => {
      if (applyChanges && preferencesState.previewPreferences) {
        setPreferencesState(prev => ({
          ...prev,
          userPreferences: { ...prev.userPreferences, ...prev.previewPreferences },
          previewMode: false,
          previewPreferences: null,
          hasUnsavedChanges: true
        }));
        debouncedSave();
      } else {
        setPreferencesState(prev => ({
          ...prev,
          previewMode: false,
          previewPreferences: null
        }));
      }
    },
    
    // Quick Actions
    quickSetDarkMode: () => setTheme({ mode: 'dark' }),
    quickSetCompactLayout: () => setLayout({ mode: 'compact' }),
    quickSetAccessibilityMode: () => setAccessibility({ 
      highContrast: true, 
      fontSize: 18, 
      reducedMotion: true,
      screenReaderOptimized: true 
    }),
    quickResetToDefaults: async (category) => {
      const defaults = getDefaultPreferences();
      const resetValue = defaults[category as keyof UserPreferences];
      setPreferencesState(prev => ({
        ...prev,
        [category]: resetValue,
        userPreferences: { ...prev.userPreferences, [category]: resetValue },
        hasUnsavedChanges: true
      }));
      await savePreferences();
    },
    
    // Advanced Features
    createPreferenceProfile: async (name, preferences) => {
      await userManagementAPI.createPreferenceProfile({ name, preferences });
    },
    loadPreferenceProfile: async (profileId) => {
      const profile = await userManagementAPI.loadPreferenceProfile(profileId);
      setPreferencesState(prev => ({
        ...prev,
        userPreferences: profile.preferences,
        theme: profile.preferences.theme,
        layout: profile.preferences.layout,
        navigation: profile.preferences.navigation,
        accessibility: profile.preferences.accessibility,
        dashboard: profile.preferences.dashboard,
        workspace: profile.preferences.workspace,
        notifications: profile.preferences.notifications,
        security: profile.preferences.security,
        hasUnsavedChanges: true
      }));
      await savePreferences(profile.preferences);
    },
    getPreferenceProfiles: async () => {
      return await userManagementAPI.getPreferenceProfiles();
    },
    deletePreferenceProfile: async (profileId) => {
      await userManagementAPI.deletePreferenceProfile(profileId);
    },
    
    // Analytics & Insights
    getPreferenceUsageAnalytics: async () => {
      return await racineOrchestrationAPI.getPreferenceUsageAnalytics();
    },
    getPersonalizationRecommendations: async () => {
      return await racineOrchestrationAPI.getPersonalizationRecommendations({
        currentPreferences: preferencesState.userPreferences,
        userBehavior: await racineOrchestrationAPI.getUserBehaviorData()
      });
    }
  };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useUserPreferences;