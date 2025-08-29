/**
 * 🏢 SIMPLE ENTERPRISE LAYOUT - STABLE LAYOUT SYSTEM
 * ==================================================
 * 
 * Simple, stable enterprise layout component designed to replace
 * the problematic MasterLayoutOrchestrator without conflicts.
 * 
 * Key Features:
 * - Zero conflicts with existing components
 * - High-performance rendering
 * - Enterprise-grade stability
 * - Simple responsive design
 * - Professional integration
 */

'use client';

import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useRef
} from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Layout, 
  Maximize2, 
  Minimize2,
  Home,
  Database,
  Shield,
  Users,
  Workflow,
  Bot,
  Activity,
  RefreshCw
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface SimpleEnterpriseLayoutProps {
  children: React.ReactNode;
  currentView?: string;
  layoutMode?: string;
  spaContext?: any;
  userPreferences?: any;
  className?: string;
  style?: React.CSSProperties;
}

interface LayoutState {
  sidebarCollapsed: boolean;
  fullScreenMode: boolean;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  currentBreakpoint: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SimpleEnterpriseLayout: React.FC<SimpleEnterpriseLayoutProps> = ({
  children,
  currentView = 'dashboard',
  layoutMode = 'default',
  spaContext,
  userPreferences,
  className = '',
  style
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<LayoutState>(() => {
    const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    
    return {
      sidebarCollapsed: false,
      fullScreenMode: false,
      deviceType: initialWidth >= 1024 ? 'desktop' : initialWidth >= 768 ? 'tablet' : 'mobile',
      currentBreakpoint: initialWidth >= 1536 ? '2xl' : initialWidth >= 1280 ? 'xl' : initialWidth >= 1024 ? 'lg' : initialWidth >= 768 ? 'md' : initialWidth >= 640 ? 'sm' : 'xs'
    };
  });

  // ============================================================================
  // REFS & HOOKS
  // ============================================================================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setState(prev => ({
        ...prev,
        deviceType: width >= 1024 ? 'desktop' : width >= 768 ? 'tablet' : 'mobile',
        currentBreakpoint: width >= 1536 ? '2xl' : width >= 1280 ? 'xl' : width >= 1024 ? 'lg' : width >= 768 ? 'md' : width >= 640 ? 'sm' : 'xs'
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================================
  // ACTIONS
  // ============================================================================
  
  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  };

  const toggleFullScreen = () => {
    setState(prev => ({ ...prev, fullScreenMode: !prev.fullScreenMode }));
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================
  
  const renderHeader = () => (
    <motion.header
      className={cn(
        "simple-enterprise-header",
        "flex items-center justify-between px-6 py-3",
        "bg-background border-b border-border",
        "transition-all duration-200"
      )}
      style={{ height: 64 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Data Governance</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Badge variant="secondary" className="text-xs">
          {state.currentBreakpoint.toUpperCase()}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
            >
              <Layout className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Sidebar</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullScreen}
              className="h-8 w-8 p-0"
            >
              {state.fullScreenMode ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {state.fullScreenMode ? 'Exit Full Screen' : 'Full Screen'}
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.header>
  );

  const renderSidebar = () => (
    <motion.aside
      className={cn(
        "simple-enterprise-sidebar",
        "bg-card border-r border-border",
        "transition-all duration-300 ease-in-out",
        {
          'w-0 opacity-0': state.sidebarCollapsed,
          'w-70': !state.sidebarCollapsed
        }
      )}
      style={{ width: state.sidebarCollapsed ? 0 : 280 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/data-sources')}
            >
              <Database className="h-4 w-4 mr-2" />
              Data Sources
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/compliance-rules')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Compliance
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/rbac-system')}
            >
              <Users className="h-4 w-4 mr-2" />
              RBAC System
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/workflows')}
            >
              <Workflow className="h-4 w-4 mr-2" />
              Workflows
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/ai-assistant')}
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/monitoring')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Monitoring
            </Button>
          </div>
        </div>
      </ScrollArea>
    </motion.aside>
  );

  const renderContent = () => (
    <motion.main
      className={cn(
        "simple-enterprise-content",
        "flex-1 overflow-hidden",
        "transition-all duration-300 ease-in-out"
      )}
      style={{ padding: 24 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full overflow-auto">
        {children}
      </div>
    </motion.main>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn(
          'simple-enterprise-layout',
          `layout-${layoutMode}`,
          `device-${state.deviceType}`,
          `breakpoint-${state.currentBreakpoint}`,
          {
            'sidebar-collapsed': state.sidebarCollapsed,
            'fullscreen': state.fullScreenMode
          },
          className
        )}
        style={{
          minWidth: '320px',
          ...style
        }}
      >
        {/* Main Layout Grid */}
        <div className={cn(
          "simple-enterprise-grid",
          "grid h-screen",
          "transition-all duration-300 ease-in-out",
          {
            'grid-cols-[auto_1fr]': !state.sidebarCollapsed,
            'grid-cols-[1fr]': state.sidebarCollapsed,
            'grid-rows-[auto_1fr]': true
          }
        )}>
          {/* Header */}
          {renderHeader()}
          
          {/* Sidebar */}
          {renderSidebar()}
          
          {/* Content */}
          {renderContent()}
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-3 shadow-lg z-30">
            <h4 className="text-xs font-medium mb-2">Layout Debug</h4>
            <div className="space-y-1 text-xs">
              <div>Device: {state.deviceType}</div>
              <div>Breakpoint: {state.currentBreakpoint}</div>
              <div>Sidebar: {state.sidebarCollapsed ? 'Collapsed' : 'Expanded'}</div>
              <div>Fullscreen: {state.fullScreenMode ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default SimpleEnterpriseLayout;
