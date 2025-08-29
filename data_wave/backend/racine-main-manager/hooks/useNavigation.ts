"use client";

import { useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface NavigationItem {
  id: string;
  path: string;
  label: string;
  icon?: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  isVisible: boolean;
  children?: NavigationItem[];
  metadata?: Record<string, any>;
}

export interface NavigationState {
  currentPath: string;
  navigationHistory: string[];
  breadcrumbs: NavigationItem[];
  activeSection: string;
  navigationMode: 'standard' | 'compact' | 'expanded';
  quickActions: NavigationItem[];
  recentItems: NavigationItem[];
  favorites: NavigationItem[];
}

export interface NavigationOptions {
  replace?: boolean;
  scroll?: boolean;
  preserveQuery?: boolean;
  addToHistory?: boolean;
  preload?: boolean;
}

// =============================================================================
// MOCK API FUNCTIONS
// =============================================================================

const mockNavigationAPI = {
  // Get navigation structure
  getNavigationStructure: async (): Promise<NavigationItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      {
        id: 'dashboard',
        path: '/dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        description: 'Main application dashboard',
        permissions: ['read'],
        isActive: true,
        isVisible: true,
        metadata: { order: 1, category: 'main' }
      },
      {
        id: 'rbac-system',
        path: '/rbac-system',
        label: 'RBAC System',
        icon: 'Shield',
        description: 'Role-based access control',
        permissions: ['read', 'write', 'admin'],
        isActive: true,
        isVisible: true,
        children: [
          {
            id: 'users',
            path: '/rbac-system/users',
            label: 'Users',
            icon: 'Users',
            permissions: ['read', 'write'],
            isActive: true,
            isVisible: true
          },
          {
            id: 'roles',
            path: '/rbac-system/roles',
            label: 'Roles',
            icon: 'UserCheck',
            permissions: ['read', 'write'],
            isActive: true,
            isVisible: true
          },
          {
            id: 'permissions',
            path: '/rbac-system/permissions',
            label: 'Permissions',
            icon: 'Key',
            permissions: ['read', 'write', 'admin'],
            isActive: true,
            isVisible: true
          }
        ],
        metadata: { order: 2, category: 'security' }
      },
      {
        id: 'data-sources',
        path: '/data-sources',
        label: 'Data Sources',
        icon: 'Database',
        description: 'Manage data connections',
        permissions: ['read', 'write'],
        isActive: true,
        isVisible: true,
        children: [
          {
            id: 'connections',
            path: '/data-sources/connections',
            label: 'Connections',
            icon: 'Link',
            permissions: ['read', 'write'],
            isActive: true,
            isVisible: true
          },
          {
            id: 'monitoring',
            path: '/data-sources/monitoring',
            label: 'Monitoring',
            icon: 'Activity',
            permissions: ['read'],
            isActive: true,
            isVisible: true
          }
        ],
        metadata: { order: 3, category: 'data' }
      },
      {
        id: 'scan-rule-sets',
        path: '/scan-rule-sets',
        label: 'Scan Rule Sets',
        icon: 'Search',
        description: 'Data scanning rules',
        permissions: ['read', 'write', 'execute'],
        isActive: true,
        isVisible: true,
        metadata: { order: 4, category: 'scanning' }
      },
      {
        id: 'classifications',
        path: '/classifications',
        label: 'Classifications',
        icon: 'Tag',
        description: 'Data classification',
        permissions: ['read', 'write'],
        isActive: true,
        isVisible: true,
        metadata: { order: 5, category: 'classification' }
      },
      {
        id: 'compliance-rules',
        path: '/compliance-rules',
        label: 'Compliance Rules',
        icon: 'FileCheck',
        description: 'Compliance management',
        permissions: ['read', 'write', 'audit'],
        isActive: true,
        isVisible: true,
        metadata: { order: 6, category: 'compliance' }
      },
      {
        id: 'advanced-catalog',
        path: '/advanced-catalog',
        label: 'Advanced Catalog',
        icon: 'BookOpen',
        description: 'Data catalog and lineage',
        permissions: ['read', 'write', 'admin'],
        isActive: true,
        isVisible: true,
        metadata: { order: 7, category: 'catalog' }
      },
      {
        id: 'scan-logic',
        path: '/scan-logic',
        label: 'Scan Logic',
        icon: 'Code',
        description: 'Custom scanning logic',
        permissions: ['read', 'write', 'execute'],
        isActive: true,
        isVisible: true,
        metadata: { order: 8, category: 'scanning' }
      }
    ];
  },

  // Get user navigation preferences
  getUserNavigationPreferences: async (): Promise<Partial<NavigationState>> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      navigationMode: 'standard',
      favorites: [],
      recentItems: []
    };
  },

  // Update navigation preferences
  updateNavigationPreferences: async (preferences: Partial<NavigationState>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Navigation preferences updated:', preferences);
  },

  // Get breadcrumbs for current path
  getBreadcrumbs: async (path: string): Promise<NavigationItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 30));
    const pathSegments = path.split('/').filter(Boolean);
    const breadcrumbs: NavigationItem[] = [];
    
    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        id: segment,
        path: currentPath,
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
        permissions: ['read'],
        isActive: currentPath === path,
        isVisible: true
      });
    }
    
    return breadcrumbs;
  }
};

// =============================================================================
// MAIN HOOK
// =============================================================================

export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPath: pathname,
    navigationHistory: [],
    breadcrumbs: [],
    activeSection: '',
    navigationMode: 'standard',
    quickActions: [],
    recentItems: [],
    favorites: []
  });

  // Query for navigation structure
  const { data: navigationStructure = [], isLoading: isLoadingNavigation } = useQuery(
    ['navigation', 'structure'],
    mockNavigationAPI.getNavigationStructure,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000 // 30 minutes
    }
  );

  // Query for user preferences
  const { data: userPreferences = {} } = useQuery(
    ['navigation', 'preferences'],
    mockNavigationAPI.getUserNavigationPreferences,
    {
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );

  // Mutation for updating preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: mockNavigationAPI.updateNavigationPreferences,
    onSuccess: (_, preferences) => {
      setNavigationState(prev => ({
        ...prev,
        ...preferences
      }));
    }
  });

  // Navigation functions
  const navigate = useCallback((path: string, options?: NavigationOptions) => {
    const {
      replace = false,
      scroll = true,
      preserveQuery = true,
      addToHistory = true,
      preload = false
    } = options || {};

    // Update navigation state
    setNavigationState(prev => ({
      ...prev,
      currentPath: path,
      navigationHistory: addToHistory 
        ? [...prev.navigationHistory, prev.currentPath]
        : prev.navigationHistory
    }));

    // Perform navigation
    if (replace) {
      router.replace(path);
    } else {
      router.push(path);
    }

    // Scroll to top if requested
    if (scroll) {
      window.scrollTo(0, 0);
    }
  }, [router]);

  const navigateBack = useCallback(() => {
    setNavigationState(prev => {
      const newHistory = [...prev.navigationHistory];
      const previousPath = newHistory.pop();
      
      if (previousPath) {
        router.push(previousPath);
        return {
          ...prev,
          currentPath: previousPath,
          navigationHistory: newHistory
        };
      }
      
      return prev;
    });
  }, [router]);

  const navigateToSection = useCallback((sectionId: string) => {
    const section = navigationStructure.find(item => item.id === sectionId);
    if (section) {
      navigate(section.path);
      setNavigationState(prev => ({
        ...prev,
        activeSection: sectionId
      }));
    }
  }, [navigationStructure, navigate]);

  const addToFavorites = useCallback((item: NavigationItem) => {
    setNavigationState(prev => ({
      ...prev,
      favorites: prev.favorites.some(fav => fav.id === item.id)
        ? prev.favorites
        : [...prev.favorites, item]
    }));
  }, []);

  const removeFromFavorites = useCallback((itemId: string) => {
    setNavigationState(prev => ({
      ...prev,
      favorites: prev.favorites.filter(fav => fav.id !== itemId)
    }));
  }, []);

  const updateNavigationMode = useCallback((mode: NavigationState['navigationMode']) => {
    setNavigationState(prev => ({
      ...prev,
      navigationMode: mode
    }));
    updatePreferencesMutation.mutate({ navigationMode: mode });
  }, [updatePreferencesMutation]);

  // Computed values
  const currentSection = useMemo(() => {
    return navigationStructure.find(item => 
      pathname.startsWith(item.path) && item.path !== '/'
    );
  }, [navigationStructure, pathname]);

  const canNavigateBack = useMemo(() => {
    return navigationState.navigationHistory.length > 0;
  }, [navigationState.navigationHistory.length]);

  const isFavorite = useCallback((itemId: string) => {
    return navigationState.favorites.some(fav => fav.id === itemId);
  }, [navigationState.favorites]);

  const getBreadcrumbs = useCallback(async () => {
    try {
      const breadcrumbs = await mockNavigationAPI.getBreadcrumbs(pathname);
      setNavigationState(prev => ({
        ...prev,
        breadcrumbs
      }));
    } catch (error) {
      console.error('Failed to get breadcrumbs:', error);
    }
  }, [pathname]);

  // Update current path when pathname changes
  useMemo(() => {
    if (pathname !== navigationState.currentPath) {
      setNavigationState(prev => ({
        ...prev,
        currentPath: pathname
      }));
      getBreadcrumbs();
    }
  }, [pathname, navigationState.currentPath, getBreadcrumbs]);

  return {
    // State
    navigationState,
    navigationStructure,
    currentSection,
    currentPath: pathname,
    searchParams,
    
    // Loading states
    isLoadingNavigation,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    
    // Computed values
    canNavigateBack,
    isFavorite,
    
    // Actions
    navigate,
    navigateBack,
    navigateToSection,
    addToFavorites,
    removeFromFavorites,
    updateNavigationMode,
    getBreadcrumbs,
    
    // Error handling
    preferencesError: updatePreferencesMutation.error
  };
};

export default useNavigation;
