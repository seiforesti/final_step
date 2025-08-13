// RBACLayout.tsx - Enterprise-grade RBAC system layout component
// Provides the main layout structure with navigation, content areas, and RBAC integration

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Settings,
  HelpCircle,
  Shield,
  Users,
  Database,
  Activity,
  Eye,
  Lock,
  Unlock,
  Sun,
  Moon,
  Monitor,
  Maximize,
  Minimize,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Grid,
  List,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  Zap,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { LoadingSpinner, WebSocketConnectionLoading } from '../shared/LoadingStates';

// Layout configuration interfaces
export interface LayoutConfig {
  sidebar: {
    defaultWidth: number;
    minWidth: number;
    maxWidth: number;
    collapsible: boolean;
    persistState: boolean;
    position: 'left' | 'right';
  };
  header: {
    height: number;
    sticky: boolean;
    showBreadcrumbs: boolean;
    showSearch: boolean;
    showNotifications: boolean;
    showUserMenu: boolean;
  };
  content: {
    padding: number;
    maxWidth?: number;
    centered: boolean;
  };
  footer: {
    show: boolean;
    height: number;
    sticky: boolean;
  };
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    borderRadius: number;
  };
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  permission?: string;
  badge?: {
    content: string | number;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
  children?: NavigationItem[];
  divider?: boolean;
  external?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

export interface RBACLayoutProps {
  children: React.ReactNode;
  
  // Configuration
  config?: Partial<LayoutConfig>;
  navigationItems?: NavigationItem[];
  
  // Content
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  
  // Layout behavior
  sidebarCollapsed?: boolean;
  onSidebarToggle?: (collapsed: boolean) => void;
  showSidebar?: boolean;
  
  // Customization
  className?: string;
  headerClassName?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  
  // Features
  enableKeyboardShortcuts?: boolean;
  enableFullscreen?: boolean;
  enableSearch?: boolean;
  enableNotifications?: boolean;
  enableThemeToggle?: boolean;
  
  // RBAC
  permission?: string;
  adminOnly?: boolean;
  
  // Callbacks
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
}

// Default layout configuration
const DEFAULT_CONFIG: LayoutConfig = {
  sidebar: {
    defaultWidth: 280,
    minWidth: 200,
    maxWidth: 400,
    collapsible: true,
    persistState: true,
    position: 'left'
  },
  header: {
    height: 64,
    sticky: true,
    showBreadcrumbs: true,
    showSearch: true,
    showNotifications: true,
    showUserMenu: true
  },
  content: {
    padding: 24,
    centered: false
  },
  footer: {
    show: true,
    height: 48,
    sticky: false
  },
  theme: {
    mode: 'system',
    primaryColor: '#3b82f6',
    borderRadius: 8
  },
  animations: {
    enabled: true,
    duration: 200,
    easing: 'ease-in-out'
  }
};

// Default navigation structure
const DEFAULT_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Gauge className="w-5 h-5" />,
    path: '/rbac',
    permission: 'rbac.view'
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="w-5 h-5" />,
    path: '/rbac/users',
    permission: 'users.view'
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: <Shield className="w-5 h-5" />,
    path: '/rbac/roles',
    permission: 'roles.view'
  },
  {
    id: 'permissions',
    label: 'Permissions',
    icon: <Lock className="w-5 h-5" />,
    path: '/rbac/permissions',
    permission: 'permissions.view'
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: <Database className="w-5 h-5" />,
    path: '/rbac/resources',
    permission: 'resources.view'
  },
  {
    id: 'divider-1',
    label: '',
    divider: true
  },
  {
    id: 'groups',
    label: 'Groups',
    icon: <Users className="w-5 h-5" />,
    path: '/rbac/groups',
    permission: 'groups.view'
  },
  {
    id: 'conditions',
    label: 'Conditions',
    icon: <Settings className="w-5 h-5" />,
    path: '/rbac/conditions',
    permission: 'conditions.view'
  },
  {
    id: 'access-requests',
    label: 'Access Requests',
    icon: <CheckCircle className="w-5 h-5" />,
    path: '/rbac/access-requests',
    permission: 'access_requests.view'
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: <Activity className="w-5 h-5" />,
    path: '/rbac/audit',
    permission: 'audit.view'
  }
];

// Utility functions
const useLocalStorage = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  }, [key]);

  return [value, setStoredValue];
};

const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('rbac-theme', 'system');
  
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return { theme, setTheme };
};

const useKeyboardShortcuts = (enabled: boolean, callbacks: Record<string, () => void>) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
      const isModifierPressed = ctrlKey || metaKey;

      // Sidebar toggle: Ctrl/Cmd + B
      if (isModifierPressed && key === 'b' && callbacks.toggleSidebar) {
        event.preventDefault();
        callbacks.toggleSidebar();
      }

      // Search: Ctrl/Cmd + K
      if (isModifierPressed && key === 'k' && callbacks.openSearch) {
        event.preventDefault();
        callbacks.openSearch();
      }

      // Settings: Ctrl/Cmd + ,
      if (isModifierPressed && key === ',' && callbacks.openSettings) {
        event.preventDefault();
        callbacks.openSettings();
      }

      // Help: F1 or ?
      if ((key === 'F1' || key === '?') && callbacks.openHelp) {
        event.preventDefault();
        callbacks.openHelp();
      }

      // Fullscreen: F11
      if (key === 'F11' && callbacks.toggleFullscreen) {
        event.preventDefault();
        callbacks.toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, callbacks]);
};

// Navigation component
const Navigation: React.FC<{
  items: NavigationItem[];
  collapsed: boolean;
  hasPermission: (permission: string) => boolean;
  currentPath?: string;
  onItemClick?: (item: NavigationItem) => void;
}> = ({ items, collapsed, hasPermission, currentPath, onItemClick }) => {
  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    // Check permissions
    if (item.permission && !hasPermission(item.permission)) return null;
    if (item.hidden) return null;

    // Render divider
    if (item.divider) {
      return (
        <div key={item.id} className="my-2 border-t border-gray-200 dark:border-gray-700" />
      );
    }

    const isActive = currentPath === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const indentClass = level > 0 ? `ml-${level * 4}` : '';

    return (
      <div key={item.id}>
        <button
          onClick={() => onItemClick?.(item)}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors group',
            indentClass,
            isActive && 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
            !isActive && 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
            item.disabled && 'opacity-50 cursor-not-allowed',
            collapsed && level === 0 && 'justify-center px-2'
          )}
          title={collapsed ? item.label : undefined}
        >
          {item.icon && (
            <span className={cn(
              'flex-shrink-0',
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
            )}>
              {item.icon}
            </span>
          )}
          
          {!collapsed && (
            <>
              <span className="flex-1 font-medium truncate">{item.label}</span>
              
              {item.badge && (
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded-full',
                  item.badge.variant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  item.badge.variant === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                  item.badge.variant === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  (!item.badge.variant || item.badge.variant === 'default') && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                )}>
                  {item.badge.content}
                </span>
              )}
              
              {hasChildren && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </>
          )}
        </button>
        
        {/* Render children */}
        {hasChildren && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="space-y-1">
      {items.map(item => renderNavigationItem(item))}
    </nav>
  );
};

// Main layout component
export const RBACLayout: React.FC<RBACLayoutProps> = ({
  children,
  
  // Configuration
  config: userConfig = {},
  navigationItems = DEFAULT_NAVIGATION,
  
  // Content
  title,
  subtitle,
  actions,
  
  // Layout behavior
  sidebarCollapsed: controlledCollapsed,
  onSidebarToggle,
  showSidebar = true,
  
  // Customization
  className,
  headerClassName,
  sidebarClassName,
  contentClassName,
  
  // Features
  enableKeyboardShortcuts = true,
  enableFullscreen = true,
  enableSearch = true,
  enableNotifications = true,
  enableThemeToggle = true,
  
  // RBAC
  permission,
  adminOnly = false,
  
  // Callbacks
  onSearch,
  onNotificationClick,
  onSettingsClick,
  onHelpClick
}) => {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { hasPermission } = usePermissionCheck();
  const { connected: wsConnected, connectionStatus } = useRBACWebSocket();
  const { theme, setTheme } = useTheme();
  
  // State management
  const [internalCollapsed, setInternalCollapsed] = useLocalStorage('rbac-sidebar-collapsed', false);
  const [sidebarWidth, setSidebarWidth] = useLocalStorage('rbac-sidebar-width', DEFAULT_CONFIG.sidebar.defaultWidth);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  
  // Merge configurations
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...userConfig,
    sidebar: { ...DEFAULT_CONFIG.sidebar, ...userConfig.sidebar },
    header: { ...DEFAULT_CONFIG.header, ...userConfig.header },
    content: { ...DEFAULT_CONFIG.content, ...userConfig.content },
    footer: { ...DEFAULT_CONFIG.footer, ...userConfig.footer },
    theme: { ...DEFAULT_CONFIG.theme, ...userConfig.theme },
    animations: { ...DEFAULT_CONFIG.animations, ...userConfig.animations }
  }), [userConfig]);
  
  // Controlled vs uncontrolled sidebar state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  
  // Permission checks
  if (permission && !hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You don't have permission to access this area.
          </p>
        </div>
      </div>
    );
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Only</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            This area is restricted to administrators.
          </p>
        </div>
      </div>
    );
  }
  
  // Sidebar toggle handler
  const handleSidebarToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    if (onSidebarToggle) {
      onSidebarToggle(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  }, [isCollapsed, onSidebarToggle, setInternalCollapsed]);
  
  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!enableFullscreen) return;
    
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, [enableFullscreen]);
  
  // Search handling
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  }, [searchQuery, onSearch]);
  
  // Keyboard shortcuts
  useKeyboardShortcuts(enableKeyboardShortcuts, {
    toggleSidebar: handleSidebarToggle,
    openSearch: () => setShowSearch(true),
    openSettings: () => onSettingsClick?.(),
    openHelp: () => onHelpClick?.(),
    toggleFullscreen
  });
  
  // Sidebar resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(
        config.sidebar.minWidth,
        Math.min(config.sidebar.maxWidth, startWidth + deltaX)
      );
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth, setSidebarWidth, config.sidebar.minWidth, config.sidebar.maxWidth]);
  
  // Navigation item click handler
  const handleNavigationItemClick = useCallback((item: NavigationItem) => {
    if (item.disabled) return;
    
    if (item.path) {
      if (item.external) {
        window.open(item.path, '_blank');
      } else {
        // Handle internal navigation
        window.location.href = item.path;
      }
    }
  }, []);
  
  // Theme toggle
  const handleThemeToggle = useCallback(() => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme, setTheme]);
  
  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading RBAC system..." />
      </div>
    );
  }
  
  const actualSidebarWidth = isCollapsed ? 64 : sidebarWidth;
  
  return (
    <ErrorBoundary>
      <div className={cn(
        'min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200',
        className
      )}>
        {/* Header */}
        <header className={cn(
          'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
          config.header.sticky && 'sticky top-0 z-40',
          headerClassName
        )} style={{ height: config.header.height }}>
          <div className="flex items-center justify-between h-full px-4">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              {showSidebar && (
                <button
                  onClick={handleSidebarToggle}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Toggle sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              
              <div>
                {title && (
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Center section - Search */}
            {enableSearch && config.header.showSearch && (
              <div className="flex-1 max-w-md mx-4">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search RBAC system..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </form>
              </div>
            )}
            
            {/* Right section */}
            <div className="flex items-center space-x-2">
              {/* WebSocket status */}
              <WebSocketConnectionLoading status={connectionStatus} />
              
              {/* Theme toggle */}
              {enableThemeToggle && (
                <button
                  onClick={handleThemeToggle}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title={`Current theme: ${theme}`}
                >
                  {theme === 'light' && <Sun className="w-5 h-5" />}
                  {theme === 'dark' && <Moon className="w-5 h-5" />}
                  {theme === 'system' && <Monitor className="w-5 h-5" />}
                </button>
              )}
              
              {/* Fullscreen toggle */}
              {enableFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Toggle fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              )}
              
              {/* Notifications */}
              {enableNotifications && config.header.showNotifications && (
                <button
                  onClick={onNotificationClick}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              )}
              
              {/* Settings */}
              <button
                onClick={onSettingsClick}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {/* Help */}
              <button
                onClick={onHelpClick}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              
              {/* Actions */}
              {actions && (
                <div className="ml-4">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="flex">
          {/* Sidebar */}
          {showSidebar && (
            <>
              <motion.aside
                ref={sidebarRef}
                initial={false}
                animate={{ width: actualSidebarWidth }}
                transition={{ duration: config.animations.duration / 1000, ease: config.animations.easing }}
                className={cn(
                  'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col',
                  config.animations.enabled ? 'transition-all' : '',
                  sidebarClassName
                )}
                style={{ 
                  width: actualSidebarWidth,
                  height: `calc(100vh - ${config.header.height}px)`
                }}
              >
                {/* Sidebar content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <Navigation
                    items={navigationItems}
                    collapsed={isCollapsed}
                    hasPermission={hasPermission}
                    currentPath={typeof window !== 'undefined' ? window.location.pathname : undefined}
                    onItemClick={handleNavigationItemClick}
                  />
                </div>
                
                {/* Sidebar footer */}
                {user && (
                  <div className={cn(
                    'p-4 border-t border-gray-200 dark:border-gray-700',
                    isCollapsed && 'px-2'
                  )}>
                    <div className={cn(
                      'flex items-center space-x-3',
                      isCollapsed && 'justify-center'
                    )}>
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.display_name?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.display_name || user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.role}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.aside>
              
              {/* Resize handle */}
              {!isCollapsed && config.sidebar.collapsible && (
                <div
                  ref={resizeRef}
                  className={cn(
                    'w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors',
                    isResizing && 'bg-blue-500'
                  )}
                  onMouseDown={handleMouseDown}
                />
              )}
            </>
          )}
          
          {/* Main content */}
          <main 
            className={cn(
              'flex-1 overflow-auto',
              contentClassName
            )}
            style={{
              height: `calc(100vh - ${config.header.height}px)`,
              marginLeft: showSidebar ? 0 : 0
            }}
          >
            <div 
              className="p-6"
              style={{ 
                padding: config.content.padding,
                maxWidth: config.content.maxWidth,
                margin: config.content.centered ? '0 auto' : undefined
              }}
            >
              {children}
            </div>
          </main>
        </div>
        
        {/* Footer */}
        {config.footer.show && (
          <footer className={cn(
            'bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3',
            config.footer.sticky && 'sticky bottom-0'
          )} style={{ height: config.footer.height }}>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div>© 2024 RBAC Data Governance System</div>
              <div className="flex items-center space-x-4">
                <span>Version 1.0.0</span>
                <span>•</span>
                <span>Connected: {wsConnected ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default RBACLayout;