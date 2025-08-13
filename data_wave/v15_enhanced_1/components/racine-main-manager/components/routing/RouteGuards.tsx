/**
 * 🛡️ ROUTE GUARDS - ADVANCED ROUTE PROTECTION SYSTEM
 * ==================================================
 * 
 * Enterprise-grade route protection system that provides comprehensive
 * security, access control, and validation for all routes in the data
 * governance platform. Integrates deeply with RBAC system and provides
 * intelligent route protection that surpasses industry standards.
 * 
 * Features:
 * - RBAC-integrated route protection with role-based access control
 * - Dynamic permission validation with real-time updates
 * - Context-aware security checks and multi-factor authentication
 * - Advanced audit logging and security event tracking
 * - Intelligent error handling with graceful degradation
 * - Performance-optimized guard execution with caching
 * - Cross-group permission coordination and validation
 * - Accessibility-compliant error and access denied pages
 * 
 * Architecture:
 * - Composable guard system with priority-based execution
 * - Real-time permission synchronization with backend
 * - Advanced caching for performance optimization
 * - Comprehensive error boundary integration
 * - Security audit trail with detailed logging
 * - Mobile-optimized guard interfaces
 * 
 * Backend Integration:
 * - Complete RBAC service integration
 * - Real-time permission validation
 * - Security audit logging
 * - Performance monitoring
 * - Cross-group access coordination
 */

'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  createContext,
  useContext,
  ReactNode,
  ComponentType
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key,
  UserX,
  RefreshCw,
  ArrowLeft,
  Home,
  Settings,
  HelpCircle,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  Mail,
  Phone,
  QrCode,
  Zap,
  Activity,
  BarChart3,
  Users,
  Database,
  FileText,
  Layers,
  Building2,
  Bot,
  MessageCircle,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Save,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Archive,
  Star,
  Bookmark,
  Share2,
  Link,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { 
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger
} from '@/components/ui/menubar';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { Toast } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Calendar } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { ColorPicker } from '@/components/ui/color-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { DataTable } from '@/components/ui/data-table';
import { Chart } from '@/components/ui/chart';
import { Heatmap } from '@/components/ui/heatmap';
import { TreeView } from '@/components/ui/tree-view';
import { Timeline } from '@/components/ui/timeline';
import { Kanban } from '@/components/ui/kanban';
import { Gantt } from '@/components/ui/gantt';

// Racine Components
import { AppNavbar } from './components/navigation/AppNavbar';
import { AppSidebar } from './components/navigation/AppSidebar';
import { GlobalQuickActionsSidebar } from './components/quick-actions-sidebar/GlobalQuickActionsSidebar';
import { AIAssistantInterface } from './components/ai-assistant/AIAssistantInterface';
import { IntelligentDashboardOrchestrator } from './components/intelligent-dashboard/IntelligentDashboardOrchestrator';
import { ActivityTrackingHub } from './components/activity-tracker/ActivityTrackingHub';
import { MasterCollaborationHub } from './components/collaboration/MasterCollaborationHub';
import { JobWorkflowBuilder } from './components/job-workflow-space/JobWorkflowBuilder';
import { PipelineDesigner } from './components/pipeline-manager/PipelineDesigner';
import { WorkspaceOrchestrator } from './components/workspace/WorkspaceOrchestrator';
import { UserProfileManager } from './components/user-management/UserProfileManager';

// Group SPA Orchestrators (Each manages the full SPA for its respective group)
import { DataSourcesSPAOrchestrator } from './components/spa-orchestrators/DataSourcesSPAOrchestrator';
import { ScanRuleSetsSPAOrchestrator } from './components/spa-orchestrators/ScanRuleSetsSPAOrchestrator';
import { ClassificationsSPAOrchestrator } from './components/spa-orchestrators/ClassificationsSPAOrchestrator';
import { ComplianceRuleSPAOrchestrator } from './components/spa-orchestrators/ComplianceRuleSPAOrchestrator';
import { AdvancedCatalogSPAOrchestrator } from './components/spa-orchestrators/AdvancedCatalogSPAOrchestrator';
import { ScanLogicSPAOrchestrator } from './components/spa-orchestrators/ScanLogicSPAOrchestrator';
import { RBACSystemSPAOrchestrator } from './components/spa-orchestrators/RBACSystemSPAOrchestrator';

// Racine Services
import { racineOrchestrationAPI } from './services/racine-orchestration-apis';
import { workspaceManagementAPI } from './services/workspace-management-apis';
import { userManagementAPI } from './services/user-management-apis';
import { crossGroupIntegrationAPI } from './services/cross-group-integration-apis';
import { activityTrackingAPI } from './services/activity-tracking-apis';
import { intelligentDashboardAPI } from './services/intelligent-dashboard-apis';
import { aiAssistantAPI } from './services/ai-assistant-apis';
import { jobWorkflowAPI } from './services/job-workflow-apis';
import { pipelineManagementAPI } from './services/pipeline-management-apis';
import { collaborationAPI } from './services/collaboration-apis';
import { performanceMonitoringAPI } from './services/performance-monitoring-apis';

// Racine Utilities
import { crossGroupOrchestrator } from './utils/cross-group-orchestrator';
import { workflowEngine } from './utils/workflow-engine';
import { pipelineEngine } from './utils/pipeline-engine';
import { aiIntegrationUtils } from './utils/ai-integration-utils';
import { activityAnalyzer } from './utils/activity-analyzer';
import { dashboardUtils } from './utils/dashboard-utils';
import { collaborationUtils } from './utils/collaboration-utils';
import { performanceUtils } from './utils/performance-utils';
import { securityUtils } from './utils/security-utils';
import { workspaceUtils } from './utils/workspace-utils';
import { navigationUtils } from './utils/navigation-utils';
import { formattingUtils } from './utils/formatting-utils';
import { validationUtils } from './utils/validation-utils';
import { uiUtils } from './utils/ui-utils';

// Racine Constants
import { 
  SUPPORTED_GROUPS,
  VIEW_MODES,
  LAYOUT_MODES,
  PERFORMANCE_THRESHOLDS,
  API_ENDPOINTS,
  WEBSOCKET_EVENTS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  DEFAULT_CONFIGS
} from './constants/cross-group-configs';
import { 
  WORKFLOW_TEMPLATES,
  STEP_TEMPLATES,
  VALIDATION_RULES,
  EXECUTION_MODES
} from './constants/workflow-templates';
import { 
  PIPELINE_TEMPLATES,
  STAGE_TEMPLATES,
  OPTIMIZATION_CONFIGS,
  MONITORING_CONFIGS
} from './constants/pipeline-templates';
import { 
  AI_CONFIGS,
  RECOMMENDATION_TYPES,
  LEARNING_MODES,
  CONTEXT_TYPES
} from './constants/ai-configs';
import { 
  ACTIVITY_CONFIGS,
  TRACKING_MODES,
  ANALYSIS_TYPES,
  AUDIT_LEVELS
} from './constants/activity-configs';
import { 
  DASHBOARD_CONFIGS,
  WIDGET_TYPES,
  CHART_TYPES,
  LAYOUT_PRESETS
} from './constants/dashboard-configs';
import { 
  COLLABORATION_CONFIGS,
  SESSION_TYPES,
  COMMUNICATION_MODES,
  SHARING_PERMISSIONS
} from './constants/collaboration-configs';
import { 
  USER_CONFIGS,
  PROFILE_FIELDS,
  PREFERENCE_CATEGORIES,
  SECURITY_LEVELS
} from './constants/user-configs';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Route Guard Types
interface RouteGuard {
  name: string;
  handler: (context: RouteContext) => Promise<GuardResult>;
  priority: number;
  errorComponent?: ComponentType<RouteErrorProps>;
  retryable?: boolean;
  timeout?: number;
}

interface RouteContext {
  path: string;
  pathname: string;
  searchParams: URLSearchParams;
  user: UserContext | null;
  permissions: string[];
  roles: string[];
  workspace: WorkspaceConfiguration | null;
  previousPath?: string;
  timestamp: string;
  userAgent: string;
  ipAddress?: string;
  sessionId: string;
  requestId: string;
}

interface GuardResult {
  allowed: boolean;
  reason?: string;
  redirectTo?: string;
  requiresAuth?: boolean;
  requiresMFA?: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  errorCode?: string;
  metadata?: Record<string, any>;
}

interface RouteErrorProps {
  error: GuardResult;
  context: RouteContext;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
}

interface GuardConfiguration {
  enabledGuards: string[];
  guardSettings: Record<string, any>;
  cacheSettings: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  performanceSettings: {
    maxExecutionTime: number;
    parallelExecution: boolean;
    fallbackBehavior: 'allow' | 'deny' | 'redirect';
  };
  auditSettings: {
    logAllAttempts: boolean;
    logFailuresOnly: boolean;
    detailedLogging: boolean;
  };
}

interface SecurityContext {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  suspiciousActivity: boolean;
  rateLimit: {
    current: number;
    limit: number;
    resetTime: string;
  };
  deviceTrust: 'trusted' | 'unknown' | 'suspicious';
  locationTrust: 'trusted' | 'unknown' | 'suspicious';
  sessionSecurity: {
    encrypted: boolean;
    mfaVerified: boolean;
    tokenValid: boolean;
    lastActivity: string;
  };
}

// ============================================================================
// ROUTE GUARDS CONTEXT
// ============================================================================

interface RouteGuardsContextType {
  guards: RouteGuard[];
  configuration: GuardConfiguration;
  securityContext: SecurityContext;
  addGuard: (guard: RouteGuard) => void;
  removeGuard: (name: string) => void;
  updateConfiguration: (config: Partial<GuardConfiguration>) => void;
  executeGuards: (context: RouteContext) => Promise<GuardResult>;
  clearCache: () => void;
  getAuditLog: () => any[];
}

const RouteGuardsContext = createContext<RouteGuardsContextType | null>(null);

export const useRouteGuards = (): RouteGuardsContextType => {
  const context = useContext(RouteGuardsContext);
  if (!context) {
    throw new Error('useRouteGuards must be used within a RouteGuardsProvider');
  }
  return context;
};

// ============================================================================
// BUILT-IN ROUTE GUARDS
// ============================================================================

/**
 * Authentication Guard - Validates user authentication
 */
const createAuthenticationGuard = (): RouteGuard => ({
  name: 'authentication',
  priority: 1000,
  handler: async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    
    try {
      // Check if user is authenticated
      if (!context.user) {
        return {
          allowed: false,
          reason: 'User not authenticated',
          requiresAuth: true,
          redirectTo: '/auth/login',
          errorCode: 'AUTH_REQUIRED',
          metadata: {
            executionTime: performance.now() - startTime,
            path: context.path,
            timestamp: new Date().toISOString()
          }
        };
      }

      // Validate session token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return {
          allowed: false,
          reason: 'Authentication token missing',
          requiresAuth: true,
          redirectTo: '/auth/login',
          errorCode: 'TOKEN_MISSING'
        };
      }

      // Validate token with backend
      const response = await fetch('/api/racine/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          allowed: false,
          reason: 'Authentication token invalid',
          requiresAuth: true,
          redirectTo: '/auth/login',
          errorCode: 'TOKEN_INVALID'
        };
      }

      return {
        allowed: true,
        metadata: {
          executionTime: performance.now() - startTime,
          validatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Authentication guard error:', error);
      return {
        allowed: false,
        reason: 'Authentication service unavailable',
        requiresAuth: true,
        redirectTo: '/auth/login',
        errorCode: 'AUTH_SERVICE_ERROR'
      };
    }
  }
});

/**
 * Authorization Guard - Validates user permissions and roles
 */
const createAuthorizationGuard = (): RouteGuard => ({
  name: 'authorization',
  priority: 900,
  handler: async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    
    try {
      // Define route permission requirements
      const routePermissions = getRoutePermissions(context.path);
      const routeRoles = getRouteRoles(context.path);

      // Check permissions
      if (routePermissions.length > 0) {
        const hasPermissions = routePermissions.every(permission => 
          context.permissions.includes(permission)
        );

        if (!hasPermissions) {
          return {
            allowed: false,
            reason: 'Insufficient permissions',
            requiredPermissions: routePermissions,
            errorCode: 'INSUFFICIENT_PERMISSIONS',
            metadata: {
              userPermissions: context.permissions,
              requiredPermissions: routePermissions,
              executionTime: performance.now() - startTime
            }
          };
        }
      }

      // Check roles
      if (routeRoles.length > 0) {
        const hasRoles = routeRoles.some(role => 
          context.roles.includes(role)
        );

        if (!hasRoles) {
          return {
            allowed: false,
            reason: 'Insufficient role access',
            requiredRoles: routeRoles,
            errorCode: 'INSUFFICIENT_ROLES',
            metadata: {
              userRoles: context.roles,
              requiredRoles: routeRoles,
              executionTime: performance.now() - startTime
            }
          };
        }
      }

      return {
        allowed: true,
        metadata: {
          executionTime: performance.now() - startTime,
          authorizedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Authorization guard error:', error);
      return {
        allowed: false,
        reason: 'Authorization service error',
        errorCode: 'AUTHORIZATION_ERROR'
      };
    }
  }
});

/**
 * Multi-Factor Authentication Guard - Validates MFA requirements
 */
const createMFAGuard = (): RouteGuard => ({
  name: 'mfa',
  priority: 800,
  handler: async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    
    try {
      // Check if route requires MFA
      const requiresMFA = getRouteMFARequirement(context.path);
      
      if (!requiresMFA) {
        return { allowed: true };
      }

      // Check MFA status
      const mfaStatus = await validateMFAStatus(context.user?.id);
      
      if (!mfaStatus.verified) {
        return {
          allowed: false,
          reason: 'Multi-factor authentication required',
          requiresMFA: true,
          redirectTo: '/auth/mfa',
          errorCode: 'MFA_REQUIRED',
          metadata: {
            mfaMethod: mfaStatus.availableMethods,
            executionTime: performance.now() - startTime
          }
        };
      }

      return {
        allowed: true,
        metadata: {
          mfaVerifiedAt: mfaStatus.verifiedAt,
          executionTime: performance.now() - startTime
        }
      };
    } catch (error) {
      console.error('MFA guard error:', error);
      return {
        allowed: false,
        reason: 'MFA validation error',
        errorCode: 'MFA_ERROR'
      };
    }
  }
});

/**
 * Rate Limiting Guard - Prevents abuse and ensures fair usage
 */
const createRateLimitGuard = (): RouteGuard => ({
  name: 'rateLimit',
  priority: 700,
  handler: async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    
    try {
      // Check rate limits for user
      const rateLimitStatus = await checkRateLimit(context.user?.id, context.path);
      
      if (rateLimitStatus.exceeded) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded',
          errorCode: 'RATE_LIMIT_EXCEEDED',
          metadata: {
            limit: rateLimitStatus.limit,
            current: rateLimitStatus.current,
            resetTime: rateLimitStatus.resetTime,
            executionTime: performance.now() - startTime
          }
        };
      }

      return {
        allowed: true,
        metadata: {
          rateLimitStatus,
          executionTime: performance.now() - startTime
        }
      };
    } catch (error) {
      console.error('Rate limit guard error:', error);
      return {
        allowed: true, // Allow on error to prevent blocking
        metadata: { error: error.message }
      };
    }
  }
});

/**
 * Security Context Guard - Validates security context and threat level
 */
const createSecurityContextGuard = (): RouteGuard => ({
  name: 'securityContext',
  priority: 600,
  handler: async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    
    try {
      // Analyze security context
      const securityAnalysis = await analyzeSecurityContext(context);
      
      // Check threat level
      if (securityAnalysis.threatLevel === 'critical') {
        return {
          allowed: false,
          reason: 'Critical security threat detected',
          errorCode: 'SECURITY_THREAT',
          metadata: {
            threatLevel: securityAnalysis.threatLevel,
            threats: securityAnalysis.detectedThreats,
            executionTime: performance.now() - startTime
          }
        };
      }

      // Check for suspicious activity
      if (securityAnalysis.suspiciousActivity && isHighSecurityRoute(context.path)) {
        return {
          allowed: false,
          reason: 'Suspicious activity detected for sensitive route',
          requiresMFA: true,
          redirectTo: '/auth/security-verification',
          errorCode: 'SUSPICIOUS_ACTIVITY'
        };
      }

      return {
        allowed: true,
        metadata: {
          securityAnalysis,
          executionTime: performance.now() - startTime
        }
      };
    } catch (error) {
      console.error('Security context guard error:', error);
      return {
        allowed: true, // Allow on error to prevent blocking
        metadata: { error: error.message }
      };
    }
  }
});

/**
 * Workspace Access Guard - Validates workspace-specific access
 */
const createWorkspaceAccessGuard = (): RouteGuard => ({
  name: 'workspaceAccess',
  priority: 500,
  handler: async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    
    try {
      // Extract workspace ID from path
      const workspaceId = extractWorkspaceId(context.path);
      
      if (!workspaceId) {
        return { allowed: true }; // No workspace-specific route
      }

      // Validate workspace access
      const hasAccess = await validateWorkspaceAccess(
        context.user?.id,
        workspaceId,
        getRequiredWorkspacePermissions(context.path)
      );

      if (!hasAccess.allowed) {
        return {
          allowed: false,
          reason: hasAccess.reason || 'Workspace access denied',
          errorCode: 'WORKSPACE_ACCESS_DENIED',
          metadata: {
            workspaceId,
            requiredPermissions: hasAccess.requiredPermissions,
            userPermissions: hasAccess.userPermissions,
            executionTime: performance.now() - startTime
          }
        };
      }

      return {
        allowed: true,
        metadata: {
          workspaceId,
          accessLevel: hasAccess.accessLevel,
          executionTime: performance.now() - startTime
        }
      };
    } catch (error) {
      console.error('Workspace access guard error:', error);
      return {
        allowed: false,
        reason: 'Workspace validation error',
        errorCode: 'WORKSPACE_ERROR'
      };
    }
  }
});

/**
 * Feature Flag Guard - Validates feature availability
 */
const createFeatureFlagGuard = (): RouteGuard => ({
  name: 'featureFlag',
  priority: 400,
  handler: async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    
    try {
      // Get feature flags for route
      const routeFeatures = getRouteFeatures(context.path);
      
      if (routeFeatures.length === 0) {
        return { allowed: true }; // No feature flags required
      }

      // Check feature availability
      const featureStatus = await checkFeatureFlags(
        routeFeatures,
        context.user?.id,
        context.workspace?.id
      );

      const disabledFeatures = featureStatus.filter(f => !f.enabled);
      
      if (disabledFeatures.length > 0) {
        return {
          allowed: false,
          reason: 'Required features not available',
          errorCode: 'FEATURE_DISABLED',
          metadata: {
            requiredFeatures: routeFeatures,
            disabledFeatures: disabledFeatures.map(f => f.name),
            executionTime: performance.now() - startTime
          }
        };
      }

      return {
        allowed: true,
        metadata: {
          enabledFeatures: featureStatus.map(f => f.name),
          executionTime: performance.now() - startTime
        }
      };
    } catch (error) {
      console.error('Feature flag guard error:', error);
      return {
        allowed: true, // Allow on error to prevent blocking
        metadata: { error: error.message }
      };
    }
  }
});

/**
 * Maintenance Mode Guard - Handles system maintenance
 */
const createMaintenanceModeGuard = (): RouteGuard => ({
  name: 'maintenanceMode',
  priority: 1100,
  handler: async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    
    try {
      // Check maintenance status
      const maintenanceStatus = await checkMaintenanceStatus();
      
      if (maintenanceStatus.enabled) {
        // Allow admin access during maintenance
        if (context.roles.includes('admin') || context.roles.includes('super_admin')) {
          return {
            allowed: true,
            metadata: {
              maintenanceMode: true,
              adminAccess: true,
              executionTime: performance.now() - startTime
            }
          };
        }

        return {
          allowed: false,
          reason: 'System under maintenance',
          redirectTo: '/maintenance',
          errorCode: 'MAINTENANCE_MODE',
          metadata: {
            maintenanceWindow: maintenanceStatus.window,
            estimatedCompletion: maintenanceStatus.estimatedCompletion,
            executionTime: performance.now() - startTime
          }
        };
      }

      return {
        allowed: true,
        metadata: {
          executionTime: performance.now() - startTime
        }
      };
    } catch (error) {
      console.error('Maintenance mode guard error:', error);
      return {
        allowed: true, // Allow on error to prevent blocking
        metadata: { error: error.message }
      };
    }
  }
});

// ============================================================================
// GUARD UTILITY FUNCTIONS
// ============================================================================

const getRoutePermissions = (path: string): string[] => {
  const routePermissionMap: Record<string, string[]> = {
    '/data-sources': ['data_sources.read'],
    '/data-sources/create': ['data_sources.create'],
    '/data-sources/edit': ['data_sources.update'],
    '/data-sources/delete': ['data_sources.delete'],
    '/scan-rule-sets': ['scan_rules.read'],
    '/scan-rule-sets/create': ['scan_rules.create'],
    '/scan-rule-sets/edit': ['scan_rules.update'],
    '/classifications': ['classifications.read'],
    '/classifications/create': ['classifications.create'],
    '/compliance-rules': ['compliance.read'],
    '/compliance-rules/create': ['compliance.create'],
    '/advanced-catalog': ['catalog.read'],
    '/advanced-catalog/create': ['catalog.create'],
    '/scan-logic': ['scan_logic.read'],
    '/scan-logic/create': ['scan_logic.create'],
    '/rbac-system': ['rbac.read'],
    '/rbac-system/users': ['rbac.users.read'],
    '/rbac-system/roles': ['rbac.roles.read'],
    '/rbac-system/permissions': ['rbac.permissions.read'],
    '/admin': ['admin.access'],
    '/settings': ['settings.access'],
    '/analytics': ['analytics.read'],
    '/reports': ['reports.read']
  };

  // Find matching permissions for path
  const exactMatch = routePermissionMap[path];
  if (exactMatch) return exactMatch;

  // Check for pattern matches
  for (const [pattern, permissions] of Object.entries(routePermissionMap)) {
    if (path.startsWith(pattern)) {
      return permissions;
    }
  }

  return []; // No specific permissions required
};

const getRouteRoles = (path: string): string[] => {
  const routeRoleMap: Record<string, string[]> = {
    '/admin': ['admin', 'super_admin'],
    '/rbac-system': ['admin', 'rbac_admin'],
    '/system-settings': ['admin', 'system_admin'],
    '/audit-logs': ['admin', 'auditor'],
    '/security-dashboard': ['admin', 'security_admin'],
    '/user-management': ['admin', 'user_admin']
  };

  // Find matching roles for path
  const exactMatch = routeRoleMap[path];
  if (exactMatch) return exactMatch;

  // Check for pattern matches
  for (const [pattern, roles] of Object.entries(routeRoleMap)) {
    if (path.startsWith(pattern)) {
      return roles;
    }
  }

  return []; // No specific roles required
};

const getRouteMFARequirement = (path: string): boolean => {
  const mfaRequiredRoutes = [
    '/admin',
    '/rbac-system',
    '/system-settings',
    '/security-dashboard',
    '/user-management',
    '/audit-logs',
    '/data-sources/delete',
    '/compliance-rules/delete',
    '/scan-rule-sets/delete'
  ];

  return mfaRequiredRoutes.some(route => path.startsWith(route));
};

const validateMFAStatus = async (userId: string): Promise<{
  verified: boolean;
  availableMethods: string[];
  verifiedAt?: string;
}> => {
  try {
    const response = await fetch(`/api/racine/auth/mfa/status/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to validate MFA status');
    }

    return await response.json();
  } catch (error) {
    console.error('MFA validation error:', error);
    return {
      verified: false,
      availableMethods: []
    };
  }
};

const checkRateLimit = async (userId: string, path: string): Promise<{
  exceeded: boolean;
  limit: number;
  current: number;
  resetTime: string;
}> => {
  try {
    const response = await fetch(`/api/racine/security/rate-limit/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path })
    });

    if (!response.ok) {
      throw new Error('Failed to check rate limit');
    }

    return await response.json();
  } catch (error) {
    console.error('Rate limit check error:', error);
    return {
      exceeded: false,
      limit: 1000,
      current: 0,
      resetTime: new Date(Date.now() + 3600000).toISOString()
    };
  }
};

const analyzeSecurityContext = async (context: RouteContext): Promise<{
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  suspiciousActivity: boolean;
  detectedThreats: string[];
  deviceTrust: 'trusted' | 'unknown' | 'suspicious';
  locationTrust: 'trusted' | 'unknown' | 'suspicious';
}> => {
  try {
    const response = await fetch('/api/racine/security/analyze-context', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: context.user?.id,
        path: context.path,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        timestamp: context.timestamp
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze security context');
    }

    return await response.json();
  } catch (error) {
    console.error('Security context analysis error:', error);
    return {
      threatLevel: 'low',
      suspiciousActivity: false,
      detectedThreats: [],
      deviceTrust: 'unknown',
      locationTrust: 'unknown'
    };
  }
};

const isHighSecurityRoute = (path: string): boolean => {
  const highSecurityRoutes = [
    '/admin',
    '/rbac-system',
    '/security-dashboard',
    '/audit-logs',
    '/system-settings',
    '/user-management',
    '/api-keys'
  ];

  return highSecurityRoutes.some(route => path.startsWith(route));
};

const extractWorkspaceId = (path: string): string | null => {
  const workspaceMatch = path.match(/\/workspace\/([^\/]+)/);
  return workspaceMatch ? workspaceMatch[1] : null;
};

const validateWorkspaceAccess = async (
  userId: string, 
  workspaceId: string, 
  requiredPermissions: string[]
): Promise<{
  allowed: boolean;
  reason?: string;
  accessLevel?: string;
  requiredPermissions?: string[];
  userPermissions?: string[];
}> => {
  try {
    const response = await fetch(`/api/racine/workspace/${workspaceId}/access/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requiredPermissions })
    });

    if (!response.ok) {
      throw new Error('Failed to validate workspace access');
    }

    return await response.json();
  } catch (error) {
    console.error('Workspace access validation error:', error);
    return {
      allowed: false,
      reason: 'Workspace validation error'
    };
  }
};

const getRequiredWorkspacePermissions = (path: string): string[] => {
  const workspacePermissionMap: Record<string, string[]> = {
    '/workspace/': ['workspace.read'],
    '/workspace/edit': ['workspace.update'],
    '/workspace/settings': ['workspace.admin'],
    '/workspace/members': ['workspace.manage_members'],
    '/workspace/delete': ['workspace.delete']
  };

  for (const [pattern, permissions] of Object.entries(workspacePermissionMap)) {
    if (path.includes(pattern)) {
      return permissions;
    }
  }

  return ['workspace.read']; // Default permission
};

const getRouteFeatures = (path: string): string[] => {
  const routeFeatureMap: Record<string, string[]> = {
    '/ai-assistant': ['ai_assistant'],
    '/advanced-analytics': ['advanced_analytics'],
    '/real-time-collaboration': ['real_time_collaboration'],
    '/pipeline-designer': ['pipeline_designer'],
    '/workflow-builder': ['workflow_builder'],
    '/predictive-insights': ['predictive_insights']
  };

  const features: string[] = [];
  for (const [pattern, routeFeatures] of Object.entries(routeFeatureMap)) {
    if (path.startsWith(pattern)) {
      features.push(...routeFeatures);
    }
  }

  return features;
};

const checkFeatureFlags = async (
  features: string[], 
  userId: string, 
  workspaceId?: string
): Promise<Array<{ name: string; enabled: boolean; reason?: string }>> => {
  try {
    const response = await fetch('/api/racine/features/check', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ features, userId, workspaceId })
    });

    if (!response.ok) {
      throw new Error('Failed to check feature flags');
    }

    return await response.json();
  } catch (error) {
    console.error('Feature flag check error:', error);
    return features.map(name => ({ name, enabled: true })); // Default to enabled
  }
};

const checkMaintenanceStatus = async (): Promise<{
  enabled: boolean;
  window?: { start: string; end: string };
  estimatedCompletion?: string;
  message?: string;
}> => {
  try {
    const response = await fetch('/api/racine/system/maintenance-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check maintenance status');
    }

    return await response.json();
  } catch (error) {
    console.error('Maintenance status check error:', error);
    return { enabled: false };
  }
};

// ============================================================================
// GUARD CACHE SYSTEM
// ============================================================================

interface GuardCacheEntry {
  result: GuardResult;
  timestamp: number;
  context: Partial<RouteContext>;
}

class GuardCache {
  private cache = new Map<string, GuardCacheEntry>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 1000, ttl = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  generateKey(guardName: string, context: RouteContext): string {
    return `${guardName}:${context.user?.id}:${context.path}:${context.workspace?.id}`;
  }

  get(guardName: string, context: RouteContext): GuardResult | null {
    const key = this.generateKey(guardName, context);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  set(guardName: string, context: RouteContext, result: GuardResult): void {
    const key = this.generateKey(guardName, context);

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      context: {
        path: context.path,
        user: context.user,
        workspace: context.workspace
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================================================
// ROUTE GUARDS PROVIDER
// ============================================================================

interface RouteGuardsProviderProps {
  children: ReactNode;
  configuration?: Partial<GuardConfiguration>;
}

export const RouteGuardsProvider: React.FC<RouteGuardsProviderProps> = ({
  children,
  configuration = {}
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [guards, setGuards] = useState<RouteGuard[]>([]);
  const [guardConfiguration, setGuardConfiguration] = useState<GuardConfiguration>({
    enabledGuards: ['authentication', 'authorization', 'mfa', 'rateLimit', 'securityContext', 'workspaceAccess', 'featureFlag', 'maintenanceMode'],
    guardSettings: {},
    cacheSettings: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 1000
    },
    performanceSettings: {
      maxExecutionTime: 5000, // 5 seconds
      parallelExecution: true,
      fallbackBehavior: 'deny'
    },
    auditSettings: {
      logAllAttempts: true,
      logFailuresOnly: false,
      detailedLogging: true
    },
    ...configuration
  });

  const [securityContext, setSecurityContext] = useState<SecurityContext>({
    threatLevel: 'low',
    suspiciousActivity: false,
    rateLimit: {
      current: 0,
      limit: 1000,
      resetTime: new Date(Date.now() + 3600000).toISOString()
    },
    deviceTrust: 'unknown',
    locationTrust: 'unknown',
    sessionSecurity: {
      encrypted: true,
      mfaVerified: false,
      tokenValid: false,
      lastActivity: new Date().toISOString()
    }
  });

  const [auditLog, setAuditLog] = useState<any[]>([]);
  const guardCache = useRef(new GuardCache(
    guardConfiguration.cacheSettings.maxSize,
    guardConfiguration.cacheSettings.ttl
  ));

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Initialize built-in guards
    const builtInGuards = [
      createMaintenanceModeGuard(),
      createAuthenticationGuard(),
      createAuthorizationGuard(),
      createMFAGuard(),
      createRateLimitGuard(),
      createSecurityContextGuard(),
      createWorkspaceAccessGuard(),
      createFeatureFlagGuard()
    ];

    // Filter enabled guards
    const enabledGuards = builtInGuards.filter(guard => 
      guardConfiguration.enabledGuards.includes(guard.name)
    );

    // Sort by priority (higher priority first)
    enabledGuards.sort((a, b) => b.priority - a.priority);

    setGuards(enabledGuards);

    // Set up cache cleanup interval
    const cleanupInterval = setInterval(() => {
      guardCache.current.cleanup();
    }, 60000); // Clean up every minute

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [guardConfiguration.enabledGuards]);

  // ============================================================================
  // GUARD EXECUTION ENGINE
  // ============================================================================

  const executeGuards = useCallback(async (context: RouteContext): Promise<GuardResult> => {
    const startTime = performance.now();
    const auditEntry = {
      timestamp: new Date().toISOString(),
      path: context.path,
      userId: context.user?.id,
      sessionId: context.sessionId,
      requestId: context.requestId,
      guards: [],
      result: null,
      executionTime: 0,
      errors: []
    };

    try {
      // Execute guards based on configuration
      if (guardConfiguration.performanceSettings.parallelExecution) {
        // Parallel execution for better performance
        const guardPromises = guards.map(async (guard) => {
          const guardStartTime = performance.now();
          let result: GuardResult;

          try {
            // Check cache first if enabled
            if (guardConfiguration.cacheSettings.enabled) {
              const cachedResult = guardCache.current.get(guard.name, context);
              if (cachedResult) {
                auditEntry.guards.push({
                  name: guard.name,
                  result: cachedResult,
                  executionTime: 0,
                  cached: true
                });
                return { guard, result: cachedResult };
              }
            }

            // Execute guard with timeout
            const timeoutPromise = new Promise<GuardResult>((_, reject) => {
              setTimeout(() => reject(new Error('Guard execution timeout')), 
                guardConfiguration.performanceSettings.maxExecutionTime);
            });

            result = await Promise.race([
              guard.handler(context),
              timeoutPromise
            ]);

            // Cache result if enabled
            if (guardConfiguration.cacheSettings.enabled && result.allowed) {
              guardCache.current.set(guard.name, context, result);
            }

            auditEntry.guards.push({
              name: guard.name,
              result,
              executionTime: performance.now() - guardStartTime,
              cached: false
            });

            return { guard, result };
          } catch (error) {
            const errorResult: GuardResult = {
              allowed: guardConfiguration.performanceSettings.fallbackBehavior === 'allow',
              reason: `Guard execution error: ${error.message}`,
              errorCode: 'GUARD_EXECUTION_ERROR'
            };

            auditEntry.guards.push({
              name: guard.name,
              result: errorResult,
              executionTime: performance.now() - guardStartTime,
              error: error.message
            });

            auditEntry.errors.push({
              guard: guard.name,
              error: error.message,
              timestamp: new Date().toISOString()
            });

            return { guard, result: errorResult };
          }
        });

        // Wait for all guards to complete
        const guardResults = await Promise.all(guardPromises);

        // Find first failing guard
        const failingGuard = guardResults.find(({ result }) => !result.allowed);
        
        if (failingGuard) {
          auditEntry.result = failingGuard.result;
          auditEntry.executionTime = performance.now() - startTime;
          
          if (guardConfiguration.auditSettings.logAllAttempts || 
              guardConfiguration.auditSettings.logFailuresOnly) {
            setAuditLog(prev => [...prev.slice(-999), auditEntry]); // Keep last 1000 entries
          }

          return failingGuard.result;
        }

        // All guards passed
        const successResult: GuardResult = {
          allowed: true,
          metadata: {
            guardsExecuted: guardResults.length,
            totalExecutionTime: performance.now() - startTime,
            timestamp: new Date().toISOString()
          }
        };

        auditEntry.result = successResult;
        auditEntry.executionTime = performance.now() - startTime;

        if (guardConfiguration.auditSettings.logAllAttempts) {
          setAuditLog(prev => [...prev.slice(-999), auditEntry]);
        }

        return successResult;
      } else {
        // Sequential execution
        for (const guard of guards) {
          const guardStartTime = performance.now();
          let result: GuardResult;

          try {
            // Check cache first if enabled
            if (guardConfiguration.cacheSettings.enabled) {
              const cachedResult = guardCache.current.get(guard.name, context);
              if (cachedResult) {
                auditEntry.guards.push({
                  name: guard.name,
                  result: cachedResult,
                  executionTime: 0,
                  cached: true
                });

                if (!cachedResult.allowed) {
                  auditEntry.result = cachedResult;
                  auditEntry.executionTime = performance.now() - startTime;
                  
                  if (guardConfiguration.auditSettings.logAllAttempts || 
                      guardConfiguration.auditSettings.logFailuresOnly) {
                    setAuditLog(prev => [...prev.slice(-999), auditEntry]);
                  }

                  return cachedResult;
                }
                continue;
              }
            }

            // Execute guard with timeout
            const timeoutPromise = new Promise<GuardResult>((_, reject) => {
              setTimeout(() => reject(new Error('Guard execution timeout')), 
                guardConfiguration.performanceSettings.maxExecutionTime);
            });

            result = await Promise.race([
              guard.handler(context),
              timeoutPromise
            ]);

            // Cache result if enabled
            if (guardConfiguration.cacheSettings.enabled && result.allowed) {
              guardCache.current.set(guard.name, context, result);
            }

            auditEntry.guards.push({
              name: guard.name,
              result,
              executionTime: performance.now() - guardStartTime,
              cached: false
            });

            if (!result.allowed) {
              auditEntry.result = result;
              auditEntry.executionTime = performance.now() - startTime;
              
              if (guardConfiguration.auditSettings.logAllAttempts || 
                  guardConfiguration.auditSettings.logFailuresOnly) {
                setAuditLog(prev => [...prev.slice(-999), auditEntry]);
              }

              return result;
            }
          } catch (error) {
            const errorResult: GuardResult = {
              allowed: guardConfiguration.performanceSettings.fallbackBehavior === 'allow',
              reason: `Guard execution error: ${error.message}`,
              errorCode: 'GUARD_EXECUTION_ERROR'
            };

            auditEntry.guards.push({
              name: guard.name,
              result: errorResult,
              executionTime: performance.now() - guardStartTime,
              error: error.message
            });

            auditEntry.errors.push({
              guard: guard.name,
              error: error.message,
              timestamp: new Date().toISOString()
            });

            if (!errorResult.allowed) {
              auditEntry.result = errorResult;
              auditEntry.executionTime = performance.now() - startTime;
              
              if (guardConfiguration.auditSettings.logAllAttempts || 
                  guardConfiguration.auditSettings.logFailuresOnly) {
                setAuditLog(prev => [...prev.slice(-999), auditEntry]);
              }

              return errorResult;
            }
          }
        }

        // All guards passed
        const successResult: GuardResult = {
          allowed: true,
          metadata: {
            guardsExecuted: guards.length,
            totalExecutionTime: performance.now() - startTime,
            timestamp: new Date().toISOString()
          }
        };

        auditEntry.result = successResult;
        auditEntry.executionTime = performance.now() - startTime;

        if (guardConfiguration.auditSettings.logAllAttempts) {
          setAuditLog(prev => [...prev.slice(-999), auditEntry]);
        }

        return successResult;
      }
    } catch (error) {
      console.error('Guard execution system error:', error);
      
      const systemErrorResult: GuardResult = {
        allowed: guardConfiguration.performanceSettings.fallbackBehavior === 'allow',
        reason: 'Guard system error',
        errorCode: 'GUARD_SYSTEM_ERROR'
      };

      auditEntry.result = systemErrorResult;
      auditEntry.executionTime = performance.now() - startTime;
      auditEntry.errors.push({
        guard: 'system',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      if (guardConfiguration.auditSettings.logAllAttempts || 
          guardConfiguration.auditSettings.logFailuresOnly) {
        setAuditLog(prev => [...prev.slice(-999), auditEntry]);
      }

      return systemErrorResult;
    }
  }, [guards, guardConfiguration]);

  // ============================================================================
  // GUARD MANAGEMENT FUNCTIONS
  // ============================================================================

  const addGuard = useCallback((guard: RouteGuard) => {
    setGuards(prev => {
      const filtered = prev.filter(g => g.name !== guard.name);
      const updated = [...filtered, guard];
      return updated.sort((a, b) => b.priority - a.priority);
    });
  }, []);

  const removeGuard = useCallback((name: string) => {
    setGuards(prev => prev.filter(g => g.name !== name));
  }, []);

  const updateConfiguration = useCallback((config: Partial<GuardConfiguration>) => {
    setGuardConfiguration(prev => ({
      ...prev,
      ...config
    }));
  }, []);

  const clearCache = useCallback(() => {
    guardCache.current.clear();
  }, []);

  const getAuditLog = useCallback(() => {
    return auditLog;
  }, [auditLog]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<RouteGuardsContextType>(() => ({
    guards,
    configuration: guardConfiguration,
    securityContext,
    addGuard,
    removeGuard,
    updateConfiguration,
    executeGuards,
    clearCache,
    getAuditLog
  }), [
    guards,
    guardConfiguration,
    securityContext,
    addGuard,
    removeGuard,
    updateConfiguration,
    executeGuards,
    clearCache,
    getAuditLog
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <RouteGuardsContext.Provider value={contextValue}>
      {children}
    </RouteGuardsContext.Provider>
  );
};

// ============================================================================
// ROUTE GUARD COMPONENT
// ============================================================================

interface RouteGuardProps {
  children: ReactNode;
  guards?: string[];
  fallback?: ComponentType<RouteErrorProps>;
  onAccessDenied?: (result: GuardResult, context: RouteContext) => void;
  onError?: (error: Error, context: RouteContext) => void;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  guards: customGuards,
  fallback: CustomFallback,
  onAccessDenied,
  onError
}) => {
  // ============================================================================
  // HOOKS AND STATE
  // ============================================================================

  const router = useRouter();
  const pathname = usePathname();
  const { executeGuards, configuration } = useRouteGuards();
  
  const [guardState, setGuardState] = useState<{
    isChecking: boolean;
    result: GuardResult | null;
    context: RouteContext | null;
    error: Error | null;
  }>({
    isChecking: true,
    result: null,
    context: null,
    error: null
  });

  // ============================================================================
  // GUARD EXECUTION
  // ============================================================================

  const checkAccess = useCallback(async () => {
    const startTime = performance.now();
    setGuardState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      // Build route context
      const context: RouteContext = {
        path: pathname,
        pathname,
        searchParams: new URLSearchParams(window.location.search),
        user: null, // Will be populated by authentication hook
        permissions: [],
        roles: [],
        workspace: null,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: localStorage.getItem('session_id') || '',
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Get user context (this would come from auth hook in real implementation)
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        try {
          const userResponse = await fetch('/api/racine/auth/user', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            context.user = userData.user;
            context.permissions = userData.permissions || [];
            context.roles = userData.roles || [];
            context.workspace = userData.currentWorkspace || null;
          }
        } catch (error) {
          console.error('Failed to get user context:', error);
        }
      }

      // Execute guards
      const result = await executeGuards(context);

      setGuardState({
        isChecking: false,
        result,
        context,
        error: null
      });

      // Handle access denied
      if (!result.allowed) {
        if (onAccessDenied) {
          onAccessDenied(result, context);
        }

        // Handle redirects
        if (result.redirectTo) {
          router.push(result.redirectTo);
          return;
        }
      }

      console.log(`Route guards executed in ${performance.now() - startTime}ms`, {
        path: pathname,
        result: result.allowed ? 'ALLOWED' : 'DENIED',
        reason: result.reason,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      console.error('Route guard execution error:', error);
      
      setGuardState({
        isChecking: false,
        result: null,
        context: null,
        error: error as Error
      });

      if (onError) {
        onError(error as Error, guardState.context!);
      }
    }
  }, [pathname, executeGuards, onAccessDenied, onError, router]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderLoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto"
        >
          <Shield className="w-full h-full text-blue-500" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Validating Access
          </h2>
          <p className="text-gray-600">
            Checking permissions and security requirements...
          </p>
        </div>
      </motion.div>
    </div>
  );

  const renderErrorState = () => {
    const error = guardState.error;
    const result = guardState.result;
    const context = guardState.context;

    if (CustomFallback && result && context) {
      return (
        <CustomFallback
          error={result}
          context={context}
          onRetry={checkAccess}
          onGoHome={() => router.push('/')}
          onGoBack={() => router.back()}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-2xl mx-auto p-8"
        >
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            {result?.requiresAuth ? (
              <Lock className="w-12 h-12 text-red-500" />
            ) : result?.requiresMFA ? (
              <Key className="w-12 h-12 text-red-500" />
            ) : (
              <UserX className="w-12 h-12 text-red-500" />
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-red-900">
              {result?.requiresAuth ? 'Authentication Required' :
               result?.requiresMFA ? 'Multi-Factor Authentication Required' :
               result?.errorCode === 'INSUFFICIENT_PERMISSIONS' ? 'Access Denied' :
               result?.errorCode === 'RATE_LIMIT_EXCEEDED' ? 'Rate Limit Exceeded' :
               'Access Restricted'}
            </h1>
            
            <p className="text-lg text-red-700">
              {result?.reason || error?.message || 'Unable to access this resource'}
            </p>

            {result?.requiredPermissions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Required Permissions:</h3>
                <div className="flex flex-wrap gap-2">
                  {result.requiredPermissions.map(permission => (
                    <Badge key={permission} variant="destructive" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result?.requiredRoles && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Required Roles:</h3>
                <div className="flex flex-wrap gap-2">
                  {result.requiredRoles.map(role => (
                    <Badge key={role} variant="destructive" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button 
                onClick={checkAccess}
                variant="outline"
                className="bg-white/80"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="bg-white/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Button 
                onClick={() => router.push('/')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {result?.redirectTo && (
              <div className="pt-4">
                <Button 
                  onClick={() => router.push(result.redirectTo!)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {result.requiresAuth ? 'Login' : 
                   result.requiresMFA ? 'Complete MFA' : 
                   'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Show loading state while checking
  if (guardState.isChecking) {
    return renderLoadingState();
  }

  // Show error state if access denied or error occurred
  if (!guardState.result?.allowed || guardState.error) {
    return renderErrorState();
  }

  // Render children if access is allowed
  return <>{children}</>;
};

// ============================================================================
// DEFAULT ERROR COMPONENTS
// ============================================================================

export const DefaultAccessDeniedComponent: React.FC<RouteErrorProps> = ({
  error,
  context,
  onRetry,
  onGoHome,
  onGoBack
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <UserX className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-900">Access Denied</CardTitle>
          <CardDescription className="text-red-700">
            {error.reason || 'You do not have permission to access this resource'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error.requiredPermissions && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-red-900">Required Permissions:</Label>
              <div className="flex flex-wrap gap-2">
                {error.requiredPermissions.map(permission => (
                  <Badge key={permission} variant="destructive">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {error.requiredRoles && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-red-900">Required Roles:</Label>
              <div className="flex flex-wrap gap-2">
                {error.requiredRoles.map(role => (
                  <Badge key={role} variant="destructive">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-4">
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            
            {onGoBack && (
              <Button onClick={onGoBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
            
            {onGoHome && (
              <Button onClick={onGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// HIGHER-ORDER COMPONENT FOR ROUTE PROTECTION
// ============================================================================

export const withRouteGuards = <P extends object>(
  Component: ComponentType<P>,
  guardOptions?: {
    guards?: string[];
    fallback?: ComponentType<RouteErrorProps>;
    onAccessDenied?: (result: GuardResult, context: RouteContext) => void;
    onError?: (error: Error, context: RouteContext) => void;
  }
) => {
  const ProtectedComponent: React.FC<P> = (props) => {
    return (
      <RouteGuard
        guards={guardOptions?.guards}
        fallback={guardOptions?.fallback}
        onAccessDenied={guardOptions?.onAccessDenied}
        onError={guardOptions?.onError}
      >
        <Component {...props} />
      </RouteGuard>
    );
  };

  ProtectedComponent.displayName = `withRouteGuards(${Component.displayName || Component.name})`;
  return ProtectedComponent;
};

// ============================================================================
// GUARD HOOKS
// ============================================================================

export const useGuardStatus = (guardNames?: string[]) => {
  const { guards } = useRouteGuards();
  
  return useMemo(() => {
    const relevantGuards = guardNames 
      ? guards.filter(g => guardNames.includes(g.name))
      : guards;

    return {
      guards: relevantGuards,
      count: relevantGuards.length,
      enabled: relevantGuards.length > 0
    };
  }, [guards, guardNames]);
};

export const useSecurityContext = () => {
  const { securityContext } = useRouteGuards();
  return securityContext;
};

export const useGuardAudit = () => {
  const { getAuditLog } = useRouteGuards();
  
  return useMemo(() => {
    const log = getAuditLog();
    return {
      entries: log,
      count: log.length,
      failures: log.filter(entry => !entry.result?.allowed),
      successes: log.filter(entry => entry.result?.allowed)
    };
  }, [getAuditLog]);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default RouteGuard;
export { RouteGuardsProvider, useRouteGuards, withRouteGuards };
export type { 
  RouteGuard, 
  RouteContext, 
  GuardResult, 
  RouteErrorProps, 
  GuardConfiguration, 
  SecurityContext 
};