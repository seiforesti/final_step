// ============================================================================
// THEME ENGINE HOOK - USER MANAGEMENT
// ============================================================================
// Advanced theme management hook with comprehensive theme customization
// Provides dynamic theme switching, color scheme management, and accessibility features

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// THEME INTERFACES
// ============================================================================

export interface Theme {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark' | 'auto' | 'custom';
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
  accessibility: ThemeAccessibility;
  metadata?: Record<string, any>;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  custom?: Record<string, string>;
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface ThemeAnimations {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  transitions: {
    default: string;
    fast: string;
    slow: string;
  };
}

export interface ThemeAccessibility {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  colorBlindFriendly: boolean;
  focusIndicators: boolean;
}

export interface UserThemePreference {
  id: string;
  userId: string;
  themeId: string;
  customizations?: Partial<Theme>;
  autoSwitch: boolean;
  schedule?: {
    lightModeStart: string;
    darkModeStart: string;
    timezone: string;
  };
  metadata?: Record<string, any>;
}

// ============================================================================
// THEME ENGINE HOOK
// ============================================================================

export function useThemeEngine(userId?: string) {
  const queryClient = useQueryClient();
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [isAutoSwitchEnabled, setIsAutoSwitchEnabled] = useState(false);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Fetch available themes
  const themesQuery = useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const response = await fetch('/api/themes');
      if (!response.ok) throw new Error('Failed to fetch themes');
      return response.json();
    },
  });

  // Fetch user theme preference
  const userThemeQuery = useQuery({
    queryKey: ['user-theme', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/themes/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user theme');
      return response.json();
    },
    enabled: !!userId,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Update user theme preference
  const updateUserThemeMutation = useMutation({
    mutationFn: async (params: { userId: string; themeId: string; customizations?: Partial<Theme> }) => {
      const response = await fetch(`/api/themes/user/${params.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: params.themeId, customizations: params.customizations }),
      });
      if (!response.ok) throw new Error('Failed to update user theme');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-theme', userId] });
    },
  });

  // Create custom theme
  const createCustomThemeMutation = useMutation({
    mutationFn: async (theme: Partial<Theme>) => {
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
      if (!response.ok) throw new Error('Failed to create custom theme');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });

  // ============================================================================
  // THEME MANAGEMENT
  // ============================================================================

  const applyTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value);
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--color-${key}-${subKey}`, subValue);
        });
      }
    });

    // Apply typography
    Object.entries(theme.typography.fontFamily).forEach(([key, value]) => {
      root.style.setProperty(`--font-family-${key}`, value);
    });

    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });

    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply animations
    Object.entries(theme.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });

    Object.entries(theme.animations.easing).forEach(([key, value]) => {
      root.style.setProperty(`--easing-${key}`, value);
    });

    // Apply accessibility features
    if (theme.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (theme.accessibility.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (theme.accessibility.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Store theme in localStorage
    localStorage.setItem('current-theme', JSON.stringify(theme));
  }, []);

  const switchTheme = useCallback(async (themeId: string, customizations?: Partial<Theme>) => {
    try {
      const theme = themesQuery.data?.find((t: Theme) => t.id === themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Apply customizations if provided
      const finalTheme = customizations ? { ...theme, ...customizations } : theme;
      applyTheme(finalTheme);

      // Update user preference if userId is provided
      if (userId) {
        await updateUserThemeMutation.mutateAsync({ userId, themeId, customizations });
      }
    } catch (error) {
      console.error('Failed to switch theme:', error);
      throw error;
    }
  }, [themesQuery.data, applyTheme, updateUserThemeMutation, userId]);

  const createCustomTheme = useCallback(async (themeData: Partial<Theme>) => {
    try {
      const newTheme = await createCustomThemeMutation.mutateAsync(themeData);
      return newTheme;
    } catch (error) {
      console.error('Failed to create custom theme:', error);
      throw error;
    }
  }, [createCustomThemeMutation]);

  const toggleAutoSwitch = useCallback(() => {
    setIsAutoSwitchEnabled(prev => !prev);
  }, []);

  const getThemePreview = useCallback((theme: Theme, customizations?: Partial<Theme>) => {
    return customizations ? { ...theme, ...customizations } : theme;
  }, []);

  const exportTheme = useCallback((theme: Theme) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${theme.name}-theme.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, []);

  const importTheme = useCallback((file: File): Promise<Theme> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string);
          resolve(theme);
        } catch (error) {
          reject(new Error('Invalid theme file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  // ============================================================================
  // AUTO SWITCH LOGIC
  // ============================================================================

  useEffect(() => {
    if (!isAutoSwitchEnabled || !userThemeQuery.data?.schedule) return;

    const schedule = userThemeQuery.data.schedule;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Simple time-based switching (can be enhanced with more sophisticated logic)
    const isLightMode = currentTime >= schedule.lightModeStart && currentTime < schedule.darkModeStart;
    const targetTheme = isLightMode ? 'light' : 'dark';
    
    const theme = themesQuery.data?.find((t: Theme) => t.type === targetTheme);
    if (theme && currentTheme?.type !== targetTheme) {
      applyTheme(theme);
    }
  }, [isAutoSwitchEnabled, userThemeQuery.data, themesQuery.data, currentTheme, applyTheme]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('current-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        applyTheme(theme);
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }

    // Load user theme preference if available
    if (userThemeQuery.data?.themeId) {
      const userTheme = themesQuery.data?.find((t: Theme) => t.id === userThemeQuery.data.themeId);
      if (userTheme) {
        applyTheme(userTheme);
      }
    }
  }, [userThemeQuery.data, themesQuery.data, applyTheme]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getContrastRatio = useCallback((color1: string, color2: string) => {
    // Simple contrast ratio calculation (can be enhanced)
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;

    const luminance1 = (0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b) / 255;
    const luminance2 = (0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b) / 255;
    
    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }, []);

  const validateTheme = useCallback((theme: Theme) => {
    const errors: string[] = [];
    
    if (!theme.name) errors.push('Theme name is required');
    if (!theme.colors.primary) errors.push('Primary color is required');
    if (!theme.colors.background) errors.push('Background color is required');
    if (!theme.colors.text.primary) errors.push('Primary text color is required');
    
    // Check contrast ratios
    const primaryTextContrast = getContrastRatio(theme.colors.primary, theme.colors.background);
    if (primaryTextContrast < 4.5) {
      errors.push('Primary color and background color have insufficient contrast');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }, [getContrastRatio]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    currentTheme,
    isAutoSwitchEnabled,
    
    // Data
    availableThemes: themesQuery.data || [],
    userThemePreference: userThemeQuery.data,
    
    // Loading states
    isLoading: themesQuery.isLoading || userThemeQuery.isLoading,
    isError: themesQuery.isError || userThemeQuery.isError,
    
    // Theme management
    applyTheme,
    switchTheme,
    createCustomTheme,
    toggleAutoSwitch,
    
    // Utility functions
    getThemePreview,
    exportTheme,
    importTheme,
    getContrastRatio,
    validateTheme,
    
    // Refetch functions
    refetchThemes: themesQuery.refetch,
    refetchUserTheme: userThemeQuery.refetch,
  };
}
