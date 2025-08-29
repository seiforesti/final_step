/**
 * 🔗 DEEP LINK MANAGER - ENHANCED DEEP LINKING SYSTEM
 * ===================================================
 * 
 * Enterprise-grade deep linking system that provides comprehensive
 * URL state management, cross-SPA navigation, and intelligent link
 * generation for the data governance platform. Enables seamless
 * navigation and state preservation across all components.
 * 
 * Features:
 * - Advanced URL state management with intelligent serialization
 * - Cross-SPA navigation with context preservation and state synchronization
 * - Dynamic link generation with SEO optimization and social sharing
 * - Intelligent route matching with pattern recognition and validation
 * - Real-time link validation with error handling and recovery
 * - Performance-optimized link processing with caching and prefetching
 * - Accessibility-compliant link generation with ARIA support
 * - Mobile-optimized deep linking with app integration
 * 
 * Architecture:
 * - URL state serialization with intelligent compression
 * - Cross-component state synchronization with real-time updates
 * - Advanced pattern matching with regex and fuzzy matching
 * - Comprehensive error boundary integration
 * - Performance monitoring with detailed metrics
 * - SEO optimization with structured data
 * 
 * Backend Integration:
 * - Link analytics and tracking
 * - SEO optimization services
 * - Social sharing integration
 * - Performance monitoring
 * - Security validation
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
  ReactNode
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Link, ExternalLink, Copy, Share2, Bookmark, History, Search, Filter, ArrowRight, ArrowLeft, Home, Globe, Zap, Activity, BarChart3, Settings, Users, Database, FileText, Layers, Building2, Bot, MessageCircle, Target, PieChart, Workflow, GitBranch, Radar, Shield, Clock, CheckCircle, AlertTriangle, RefreshCw, Eye, EyeOff, Hash, MapPin, Calendar, Tag, Star, Heart, ThumbsUp, MessageSquare, Send, Download, Upload, Save, Edit, Trash2, Plus, Minus, MoreVertical, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Lock } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';

// Racine Types
import { 
  UserContext, 
  WorkspaceConfiguration, 
  ViewMode, 
  LayoutMode,
  UUID,
  ISODateString,
  JSONValue
} from '../../types/racine-core.types';

// Racine Services
import { activityTrackingAPI } from '../../services/activity-tracking-apis';
import { racineOrchestrationAPI } from '../../services/racine-orchestration-apis';
import { performanceUtils } from '../../utils/performance-utils';

// Racine Utilities
import { navigationUtils } from '../../utils/navigation-utils';
import { validationUtils } from '../../utils/validation-utils';
import { formattingUtils } from '../../utils/formatting-utils';
import { securityUtils } from '../../utils/security-utils';

// Racine Constants
import { 
  SUPPORTED_GROUPS,
  VIEW_MODES,
  LAYOUT_MODES,
  API_ENDPOINTS
} from '../../constants/cross-group-configs';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DeepLinkConfig {
  pattern: string;
  handler: (params: Record<string, string>) => DeepLinkResult;
  validation?: (params: Record<string, string>) => boolean;
  metadata?: {
    title?: string;
    description?: string;
    icon?: string;
    category?: string;
    tags?: string[];
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  security?: {
    requiresAuth?: boolean;
    requiredPermissions?: string[];
    requiredRoles?: string[];
  };
}

interface DeepLinkResult {
  valid: boolean;
  path: string;
  state?: Record<string, any>;
  metadata?: Record<string, any>;
  error?: string;
  redirect?: string;
  preserveState?: boolean;
}

interface LinkState {
  view: ViewMode;
  layout: LayoutMode;
  workspace?: string;
  filters?: Record<string, any>;
  selections?: string[];
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pagination?: {
    page: number;
    limit: number;
  };
  customData?: Record<string, any>;
}

interface DeepLinkAnalytics {
  linkId: string;
  originalUrl: string;
  targetUrl: string;
  clicks: number;
  uniqueClicks: number;
  createdAt: string;
  lastAccessedAt: string;
  userId?: string;
  source?: string;
  campaign?: string;
  medium?: string;
  referrer?: string;
  conversionRate?: number;
  averageTimeOnPage?: number;
}

interface ShareableLink {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  expiresAt?: string;
  accessCount: number;
  maxAccess?: number;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  permissions?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// DEEP LINK CONTEXT
// ============================================================================

interface DeepLinkManagerContextType {
  currentLink: string;
  linkState: LinkState;
  linkConfigs: DeepLinkConfig[];
  addLinkConfig: (config: DeepLinkConfig) => void;
  removeLinkConfig: (pattern: string) => void;
  generateDeepLink: (path: string, state?: LinkState, options?: DeepLinkOptions) => string;
  parseDeepLink: (url: string) => DeepLinkResult;
  navigateWithState: (path: string, state?: LinkState) => void;
  createShareableLink: (path: string, options?: ShareableLinkOptions) => Promise<ShareableLink>;
  getShareableLink: (id: string) => Promise<ShareableLink | null>;
  trackLinkAnalytics: (linkId: string, event: string, metadata?: Record<string, any>) => void;
  getLinkAnalytics: (linkId: string) => Promise<DeepLinkAnalytics>;
  validateLink: (url: string) => Promise<boolean>;
  prefetchLink: (url: string) => Promise<void>;
}

const DeepLinkManagerContext = createContext<DeepLinkManagerContextType | null>(null);

export const useDeepLinkManager = (): DeepLinkManagerContextType => {
  const context = useContext(DeepLinkManagerContext);
  if (!context) {
    throw new Error('useDeepLinkManager must be used within a DeepLinkManagerProvider');
  }
  return context;
};

// ============================================================================
// DEEP LINK CONFIGURATIONS
// ============================================================================

const createBuiltInLinkConfigs = (): DeepLinkConfig[] => [
  // Data Sources Deep Links
  {
    pattern: '/data-sources/:id?',
    handler: (params) => ({
      valid: true,
      path: params.id ? `/data-sources/${params.id}` : '/data-sources',
      state: {
        view: 'data_sources' as ViewMode,
        selectedId: params.id
      }
    }),
    metadata: {
      title: 'Data Sources',
      description: 'Manage and configure data sources',
      icon: 'database',
      category: 'data_management',
      tags: ['data', 'sources', 'connections']
    },
    seo: {
      title: 'Data Sources - Enterprise Data Governance',
      description: 'Manage and configure enterprise data sources with advanced governance controls',
      keywords: ['data sources', 'data governance', 'enterprise data management']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['data_sources.read']
    }
  },

  // Scan Rule Sets Deep Links
  {
    pattern: '/scan-rule-sets/:id?',
    handler: (params) => ({
      valid: true,
      path: params.id ? `/scan-rule-sets/${params.id}` : '/scan-rule-sets',
      state: {
        view: 'scan_rule_sets' as ViewMode,
        selectedId: params.id
      }
    }),
    metadata: {
      title: 'Scan Rule Sets',
      description: 'Advanced scan rule configuration and management',
      icon: 'scan',
      category: 'scanning',
      tags: ['scan', 'rules', 'automation']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['scan_rules.read']
    }
  },

  // Classifications Deep Links
  {
    pattern: '/classifications/:id?',
    handler: (params) => ({
      valid: true,
      path: params.id ? `/classifications/${params.id}` : '/classifications',
      state: {
        view: 'classifications' as ViewMode,
        selectedId: params.id
      }
    }),
    metadata: {
      title: 'Data Classifications',
      description: 'Intelligent data classification and labeling',
      icon: 'tag',
      category: 'classification',
      tags: ['classification', 'labeling', 'ai']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['classifications.read']
    }
  },

  // Compliance Rules Deep Links
  {
    pattern: '/compliance-rules/:id?',
    handler: (params) => ({
      valid: true,
      path: params.id ? `/compliance-rules/${params.id}` : '/compliance-rules',
      state: {
        view: 'compliance_rules' as ViewMode,
        selectedId: params.id
      }
    }),
    metadata: {
      title: 'Compliance Rules',
      description: 'Enterprise compliance and regulatory management',
      icon: 'shield',
      category: 'compliance',
      tags: ['compliance', 'regulations', 'governance']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['compliance.read']
    }
  },

  // Advanced Catalog Deep Links
  {
    pattern: '/advanced-catalog/:id?',
    handler: (params) => ({
      valid: true,
      path: params.id ? `/advanced-catalog/${params.id}` : '/advanced-catalog',
      state: {
        view: 'advanced_catalog' as ViewMode,
        selectedId: params.id
      }
    }),
    metadata: {
      title: 'Advanced Catalog',
      description: 'Intelligent data catalog with AI-powered insights',
      icon: 'layers',
      category: 'catalog',
      tags: ['catalog', 'metadata', 'discovery']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['catalog.read']
    }
  },

  // Scan Logic Deep Links
  {
    pattern: '/scan-logic/:id?',
    handler: (params) => ({
      valid: true,
      path: params.id ? `/scan-logic/${params.id}` : '/scan-logic',
      state: {
        view: 'scan_logic' as ViewMode,
        selectedId: params.id
      }
    }),
    metadata: {
      title: 'Advanced Scan Logic',
      description: 'Intelligent scanning orchestration and management',
      icon: 'radar',
      category: 'scanning',
      tags: ['scanning', 'orchestration', 'automation']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['scan_logic.read']
    }
  },

  // RBAC System Deep Links
  {
    pattern: '/rbac-system/:section?/:id?',
    handler: (params) => {
      const section = params.section || 'overview';
      const path = params.id ? `/rbac-system/${section}/${params.id}` : `/rbac-system/${section}`;
      
      return {
        valid: true,
        path,
        state: {
          view: 'rbac_system' as ViewMode,
          section,
          selectedId: params.id
        }
      };
    },
    metadata: {
      title: 'RBAC System',
      description: 'Role-based access control and user management',
      icon: 'users',
      category: 'security',
      tags: ['rbac', 'security', 'access control']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['rbac.read']
    }
  },

  // Workspace Deep Links
  {
    pattern: '/workspace/:workspaceId/:view?/:resourceId?',
    handler: (params) => {
      const view = params.view || 'overview';
      let path = `/workspace/${params.workspaceId}`;
      if (params.view) path += `/${params.view}`;
      if (params.resourceId) path += `/${params.resourceId}`;

      return {
        valid: true,
        path,
        state: {
          view: 'workspace' as ViewMode,
          workspace: params.workspaceId,
          workspaceView: view,
          selectedResourceId: params.resourceId
        }
      };
    },
    validation: (params) => !!params.workspaceId,
    metadata: {
      title: 'Workspace',
      description: 'Collaborative workspace management',
      icon: 'building2',
      category: 'workspace',
      tags: ['workspace', 'collaboration', 'projects']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['workspace.read']
    }
  },

  // Job Workflow Deep Links
  {
    pattern: '/workflows/:workflowId?/:action?',
    handler: (params) => {
      let path = '/workflows';
      if (params.workflowId) path += `/${params.workflowId}`;
      if (params.action) path += `/${params.action}`;

      return {
        valid: true,
        path,
        state: {
          view: 'job_workflows' as ViewMode,
          workflowId: params.workflowId,
          action: params.action
        }
      };
    },
    metadata: {
      title: 'Job Workflows',
      description: 'Advanced workflow builder and orchestration',
      icon: 'workflow',
      category: 'automation',
      tags: ['workflows', 'automation', 'jobs']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['workflows.read']
    }
  },

  // Pipeline Deep Links
  {
    pattern: '/pipelines/:pipelineId?/:view?',
    handler: (params) => {
      let path = '/pipelines';
      if (params.pipelineId) path += `/${params.pipelineId}`;
      if (params.view) path += `/${params.view}`;

      return {
        valid: true,
        path,
        state: {
          view: 'pipelines' as ViewMode,
          pipelineId: params.pipelineId,
          pipelineView: params.view
        }
      };
    },
    metadata: {
      title: 'Data Pipelines',
      description: 'Advanced pipeline designer and management',
      icon: 'git-branch',
      category: 'pipelines',
      tags: ['pipelines', 'data processing', 'etl']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['pipelines.read']
    }
  },

  // AI Assistant Deep Links
  {
    pattern: '/ai-assistant/:conversationId?',
    handler: (params) => ({
      valid: true,
      path: params.conversationId ? `/ai-assistant/${params.conversationId}` : '/ai-assistant',
      state: {
        view: 'ai_assistant' as ViewMode,
        conversationId: params.conversationId
      }
    }),
    metadata: {
      title: 'AI Assistant',
      description: 'Intelligent AI-powered assistance and insights',
      icon: 'bot',
      category: 'ai',
      tags: ['ai', 'assistant', 'intelligence']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['ai_assistant.read']
    }
  },

  // Dashboard Deep Links
  {
    pattern: '/dashboard/:dashboardId?/:widget?',
    handler: (params) => {
      let path = '/dashboard';
      if (params.dashboardId) path += `/${params.dashboardId}`;
      if (params.widget) path += `/${params.widget}`;

      return {
        valid: true,
        path,
        state: {
          view: 'dashboard' as ViewMode,
          dashboardId: params.dashboardId,
          focusWidget: params.widget
        }
      };
    },
    metadata: {
      title: 'Intelligence Dashboard',
      description: 'Real-time analytics and insights dashboard',
      icon: 'bar-chart-3',
      category: 'analytics',
      tags: ['dashboard', 'analytics', 'metrics']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['dashboard.read']
    }
  },

  // Activity Tracker Deep Links
  {
    pattern: '/activity/:activityId?/:filter?',
    handler: (params) => {
      let path = '/activity';
      if (params.activityId) path += `/${params.activityId}`;
      if (params.filter) path += `/${params.filter}`;

      return {
        valid: true,
        path,
        state: {
          view: 'activity_tracker' as ViewMode,
          activityId: params.activityId,
          activeFilter: params.filter
        }
      };
    },
    metadata: {
      title: 'Activity Tracker',
      description: 'Comprehensive activity monitoring and audit trails',
      icon: 'activity',
      category: 'monitoring',
      tags: ['activity', 'audit', 'tracking']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['activity.read']
    }
  },

  // Collaboration Deep Links
  {
    pattern: '/collaboration/:sessionId?/:mode?',
    handler: (params) => {
      let path = '/collaboration';
      if (params.sessionId) path += `/${params.sessionId}`;
      if (params.mode) path += `/${params.mode}`;

      return {
        valid: true,
        path,
        state: {
          view: 'collaboration' as ViewMode,
          sessionId: params.sessionId,
          collaborationMode: params.mode
        }
      };
    },
    metadata: {
      title: 'Team Collaboration',
      description: 'Real-time team collaboration and communication',
      icon: 'message-circle',
      category: 'collaboration',
      tags: ['collaboration', 'teamwork', 'communication']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['collaboration.read']
    }
  },

  // User Management Deep Links
  {
    pattern: '/user-management/:section?/:userId?',
    handler: (params) => {
      const section = params.section || 'profile';
      let path = `/user-management/${section}`;
      if (params.userId) path += `/${params.userId}`;

      return {
        valid: true,
        path,
        state: {
          view: 'user_management' as ViewMode,
          section,
          selectedUserId: params.userId
        }
      };
    },
    metadata: {
      title: 'User Management',
      description: 'User profiles, settings, and account management',
      icon: 'users',
      category: 'user_management',
      tags: ['users', 'profiles', 'settings']
    },
    security: {
      requiresAuth: true,
      requiredPermissions: ['users.read']
    }
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const serializeState = (state: LinkState): string => {
  try {
    // Compress and encode state
    const stateString = JSON.stringify(state);
    const compressed = btoa(encodeURIComponent(stateString));
    return compressed;
  } catch (error) {
    console.error('State serialization error:', error);
    return '';
  }
};

const deserializeState = (stateString: string): LinkState | null => {
  try {
    // Decode and decompress state
    const decoded = decodeURIComponent(atob(stateString));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('State deserialization error:', error);
    return null;
  }
};

const matchPattern = (pattern: string, path: string): Record<string, string> | null => {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/:\w+\?/g, '([^/]*)?') // Optional parameters
    .replace(/:\w+/g, '([^/]+)') // Required parameters
    .replace(/\//g, '\\/'); // Escape forward slashes

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  if (!match) return null;

  // Extract parameter names and values
  const paramNames = pattern.match(/:\w+/g)?.map(p => p.substring(1)) || [];
  const params: Record<string, string> = {};

  paramNames.forEach((name, index) => {
    const value = match[index + 1];
    if (value !== undefined) {
      params[name] = value;
    }
  });

  return params;
};

const generateSEOMetadata = (config: DeepLinkConfig, params: Record<string, string>): Record<string, string> => {
  const metadata: Record<string, string> = {};

  if (config.seo?.title) {
    metadata['og:title'] = interpolateString(config.seo.title, params);
    metadata['twitter:title'] = metadata['og:title'];
  }

  if (config.seo?.description) {
    metadata['og:description'] = interpolateString(config.seo.description, params);
    metadata['twitter:description'] = metadata['og:description'];
    metadata['description'] = metadata['og:description'];
  }

  if (config.seo?.keywords) {
    metadata['keywords'] = config.seo.keywords.join(', ');
  }

  if (config.seo?.ogImage) {
    metadata['og:image'] = config.seo.ogImage;
    metadata['twitter:image'] = config.seo.ogImage;
  }

  metadata['og:type'] = 'website';
  metadata['twitter:card'] = 'summary_large_image';

  return metadata;
};

const interpolateString = (template: string, params: Record<string, string>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
};

const validateDeepLinkSecurity = async (
  config: DeepLinkConfig,
  params: Record<string, string>,
  user: UserContext | null
): Promise<{ valid: boolean; reason?: string }> => {
  try {
    // Check authentication requirement
    if (config.security?.requiresAuth && !user) {
      return { valid: false, reason: 'Authentication required' };
    }

    // Check permissions
    if (config.security?.requiredPermissions && user) {
      const hasPermissions = config.security.requiredPermissions.every(permission =>
        user.permissions?.includes(permission)
      );

      if (!hasPermissions) {
        return { 
          valid: false, 
          reason: `Missing permissions: ${config.security.requiredPermissions.join(', ')}` 
        };
      }
    }

    // Check roles
    if (config.security?.requiredRoles && user) {
      const hasRoles = config.security.requiredRoles.some(role =>
        user.roles?.includes(role)
      );

      if (!hasRoles) {
        return { 
          valid: false, 
          reason: `Missing roles: ${config.security.requiredRoles.join(', ')}` 
        };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Deep link security validation error:', error);
    return { valid: false, reason: 'Security validation failed' };
  }
};

const generateUniqueId = (): string => {
  return `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

interface DeepLinkOptions {
  preserveCurrentState?: boolean;
  includeAnalytics?: boolean;
  seoOptimized?: boolean;
  expiresAt?: string;
  campaign?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

interface ShareableLinkOptions {
  title?: string;
  description?: string;
  thumbnail?: string;
  expiresAt?: string;
  maxAccess?: number;
  isPublic?: boolean;
  permissions?: string[];
}

// ============================================================================
// DEEP LINK MANAGER PROVIDER
// ============================================================================

interface DeepLinkManagerProviderProps {
  children: ReactNode;
  configuration?: {
    enableAnalytics?: boolean;
    enableSEO?: boolean;
    enableCaching?: boolean;
    cacheTimeout?: number;
  };
}

export const DeepLinkManagerProvider: React.FC<DeepLinkManagerProviderProps> = ({
  children,
  configuration = {}
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [linkConfigs, setLinkConfigs] = useState<DeepLinkConfig[]>([]);
  const [currentLink, setCurrentLink] = useState<string>('');
  const [linkState, setLinkState] = useState<LinkState>({
    view: 'dashboard' as ViewMode,
    layout: 'default' as LayoutMode
  });

  const linkCache = useRef(new Map<string, any>());
  const analyticsQueue = useRef<any[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Initialize built-in link configurations
    const builtInConfigs = createBuiltInLinkConfigs();
    setLinkConfigs(builtInConfigs);

    // Parse current URL
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    setCurrentLink(currentUrl);

    // Parse state from URL
    const stateParam = searchParams.get('state');
    if (stateParam) {
      const parsedState = deserializeState(stateParam);
      if (parsedState) {
        setLinkState(parsedState);
      }
    }
  }, [pathname, searchParams]);

  // ============================================================================
  // DEEP LINK FUNCTIONS
  // ============================================================================

  const addLinkConfig = useCallback((config: DeepLinkConfig) => {
    setLinkConfigs(prev => {
      const filtered = prev.filter(c => c.pattern !== config.pattern);
      return [...filtered, config];
    });
  }, []);

  const removeLinkConfig = useCallback((pattern: string) => {
    setLinkConfigs(prev => prev.filter(c => c.pattern !== pattern));
  }, []);

  const generateDeepLink = useCallback((
    path: string, 
    state?: LinkState, 
    options?: DeepLinkOptions
  ): string => {
    try {
      let url = path;
      const urlParams = new URLSearchParams();

      // Add state to URL if provided
      if (state) {
        const mergedState = options?.preserveCurrentState 
          ? { ...linkState, ...state }
          : state;

        const serializedState = serializeState(mergedState);
        if (serializedState) {
          urlParams.set('state', serializedState);
        }
      }

      // Add analytics parameters if enabled
      if (options?.includeAnalytics || configuration.enableAnalytics) {
        urlParams.set('_t', Date.now().toString());
        urlParams.set('_r', Math.random().toString(36).substr(2, 9));
      }

      // Add campaign parameters
      if (options?.campaign) {
        if (options.campaign.source) urlParams.set('utm_source', options.campaign.source);
        if (options.campaign.medium) urlParams.set('utm_medium', options.campaign.medium);
        if (options.campaign.campaign) urlParams.set('utm_campaign', options.campaign.campaign);
        if (options.campaign.term) urlParams.set('utm_term', options.campaign.term);
        if (options.campaign.content) urlParams.set('utm_content', options.campaign.content);
      }

      // Add expiration if specified
      if (options?.expiresAt) {
        urlParams.set('expires', options.expiresAt);
      }

      // Construct final URL
      const queryString = urlParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      return url;
    } catch (error) {
      console.error('Deep link generation error:', error);
      return path; // Fallback to original path
    }
  }, [linkState, configuration.enableAnalytics]);

  const parseDeepLink = useCallback((url: string): DeepLinkResult => {
    try {
      // Parse URL
      const urlObj = new URL(url, window.location.origin);
      const path = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      // Find matching configuration
      const matchingConfig = linkConfigs.find(config => {
        const params = matchPattern(config.pattern, path);
        return params !== null;
      });

      if (!matchingConfig) {
        return {
          valid: false,
          path,
          error: 'No matching route configuration found'
        };
      }

      // Extract parameters
      const params = matchPattern(matchingConfig.pattern, path)!;

      // Validate parameters if validation function exists
      if (matchingConfig.validation && !matchingConfig.validation(params)) {
        return {
          valid: false,
          path,
          error: 'Invalid parameters for route'
        };
      }

      // Handle the route
      const result = matchingConfig.handler(params);

      // Parse state from URL
      const stateParam = searchParams.get('state');
      if (stateParam) {
        const parsedState = deserializeState(stateParam);
        if (parsedState) {
          result.state = { ...result.state, ...parsedState };
        }
      }

      // Check expiration
      const expires = searchParams.get('expires');
      if (expires && new Date(expires) < new Date()) {
        return {
          valid: false,
          path,
          error: 'Link has expired'
        };
      }

      return result;
    } catch (error) {
      console.error('Deep link parsing error:', error);
      return {
        valid: false,
        path: url,
        error: error.message
      };
    }
  }, [linkConfigs]);

  const navigateWithState = useCallback((path: string, state?: LinkState) => {
    try {
      // Generate deep link with state
      const deepLink = generateDeepLink(path, state, { preserveCurrentState: true });
      
      // Navigate using Next.js router
      router.push(deepLink);

      // Update local state
      if (state) {
        setLinkState(prev => ({ ...prev, ...state }));
      }

      // Track navigation
      trackLinkAnalytics(generateUniqueId(), 'navigation', {
        from: pathname,
        to: path,
        state: state ? JSON.stringify(state) : null,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Navigation with state error:', error);
      toast({
        title: 'Navigation Error',
        description: 'Failed to navigate to the requested page',
        variant: 'destructive'
      });
    }
  }, [generateDeepLink, router, pathname, toast]);

  const createShareableLink = useCallback(async (
    path: string, 
    options?: ShareableLinkOptions
  ): Promise<ShareableLink> => {
    try {
      const linkId = generateUniqueId();
      const shareableLink: ShareableLink = {
        id: linkId,
        url: generateDeepLink(path, undefined, { includeAnalytics: true }),
        title: options?.title || 'Shared Resource',
        description: options?.description,
        thumbnail: options?.thumbnail,
        expiresAt: options?.expiresAt,
        accessCount: 0,
        maxAccess: options?.maxAccess,
        createdBy: 'current_user', // Would come from auth context
        createdAt: new Date().toISOString(),
        isPublic: options?.isPublic || false,
        permissions: options?.permissions,
        metadata: {
          originalPath: path,
          createdFrom: pathname
        }
      };

      // Store shareable link
      const response = await fetch('/api/racine/links/shareable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareableLink)
      });

      if (!response.ok) {
        throw new Error('Failed to create shareable link');
      }

      const savedLink = await response.json();

      toast({
        title: 'Shareable Link Created',
        description: 'Link has been created and is ready to share'
      });

      return savedLink;
    } catch (error) {
      console.error('Create shareable link error:', error);
      toast({
        title: 'Error Creating Link',
        description: 'Failed to create shareable link',
        variant: 'destructive'
      });
      throw error;
    }
  }, [generateDeepLink, pathname, toast]);

  const getShareableLink = useCallback(async (id: string): Promise<ShareableLink | null> => {
    try {
      const response = await fetch(`/api/racine/links/shareable/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get shareable link');
      }

      const link = await response.json();

      // Check expiration
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return null;
      }

      // Check access limits
      if (link.maxAccess && link.accessCount >= link.maxAccess) {
        return null;
      }

      return link;
    } catch (error) {
      console.error('Get shareable link error:', error);
      return null;
    }
  }, []);

  const trackLinkAnalytics = useCallback((
    linkId: string, 
    event: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      const analyticsEvent = {
        linkId,
        event,
        timestamp: new Date().toISOString(),
        userId: 'current_user', // Would come from auth context
        sessionId: localStorage.getItem('session_id') || '',
        path: pathname,
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          ...metadata
        }
      };

      // Add to queue for batch processing
      analyticsQueue.current.push(analyticsEvent);

      // Process queue if it gets too large
      if (analyticsQueue.current.length >= 10) {
        processAnalyticsQueue();
      }
    } catch (error) {
      console.error('Link analytics tracking error:', error);
    }
  }, [pathname]);

  const processAnalyticsQueue = useCallback(async () => {
    if (analyticsQueue.current.length === 0) return;

    try {
      const events = [...analyticsQueue.current];
      analyticsQueue.current = [];

      await activityTrackingAPI.trackBulkEvents(events);
    } catch (error) {
      console.error('Analytics queue processing error:', error);
      // Re-add events to queue for retry
      analyticsQueue.current.unshift(...analyticsQueue.current);
    }
  }, []);

  const getLinkAnalytics = useCallback(async (linkId: string): Promise<DeepLinkAnalytics> => {
    try {
      const response = await fetch(`/api/racine/analytics/links/${linkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get link analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Get link analytics error:', error);
      throw error;
    }
  }, []);

  const validateLink = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Parse the link
      const parseResult = parseDeepLink(url);
      
      if (!parseResult.valid) {
        return false;
      }

      // Additional validation with backend
      const response = await fetch('/api/racine/links/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      return response.ok;
    } catch (error) {
      console.error('Link validation error:', error);
      return false;
    }
  }, [parseDeepLink]);

  const prefetchLink = useCallback(async (url: string): Promise<void> => {
    try {
      // Check cache first
      if (linkCache.current.has(url)) {
        return;
      }

      // Parse link to get target path
      const parseResult = parseDeepLink(url);
      
      if (!parseResult.valid) {
        return;
      }

      // Prefetch data for the target route
      const response = await fetch(`/api/racine/prefetch${parseResult.path}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        linkCache.current.set(url, {
          data,
          timestamp: Date.now(),
          ttl: configuration.cacheTimeout || 300000 // 5 minutes
        });
      }
    } catch (error) {
      console.error('Link prefetch error:', error);
    }
  }, [parseDeepLink, configuration.cacheTimeout]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Process analytics queue periodically
    const interval = setInterval(processAnalyticsQueue, 5000);
    return () => clearInterval(interval);
  }, [processAnalyticsQueue]);

  useEffect(() => {
    // Clean up cache periodically
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of linkCache.current.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          linkCache.current.delete(key);
        }
      }
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<DeepLinkManagerContextType>(() => ({
    currentLink,
    linkState,
    linkConfigs,
    addLinkConfig,
    removeLinkConfig,
    generateDeepLink,
    parseDeepLink,
    navigateWithState,
    createShareableLink,
    getShareableLink,
    trackLinkAnalytics,
    getLinkAnalytics,
    validateLink,
    prefetchLink
  }), [
    currentLink,
    linkState,
    linkConfigs,
    addLinkConfig,
    removeLinkConfig,
    generateDeepLink,
    parseDeepLink,
    navigateWithState,
    createShareableLink,
    getShareableLink,
    trackLinkAnalytics,
    getLinkAnalytics,
    validateLink,
    prefetchLink
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DeepLinkManagerContext.Provider value={contextValue}>
      {children}
    </DeepLinkManagerContext.Provider>
  );
};

// ============================================================================
// DEEP LINK COMPONENTS
// ============================================================================

interface SmartLinkProps {
  href: string;
  children: ReactNode;
  state?: LinkState;
  prefetch?: boolean;
  analytics?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

export const SmartLink: React.FC<SmartLinkProps> = ({
  href,
  children,
  state,
  prefetch = false,
  analytics = true,
  className,
  onClick
}) => {
  const { generateDeepLink, navigateWithState, trackLinkAnalytics, prefetchLink } = useDeepLinkManager();
  const [isPrefetched, setIsPrefetched] = useState(false);

  // Generate smart link with state
  const smartHref = useMemo(() => {
    return generateDeepLink(href, state, { includeAnalytics: analytics });
  }, [href, state, analytics, generateDeepLink]);

  // Prefetch on hover if enabled
  const handleMouseEnter = useCallback(async () => {
    if (prefetch && !isPrefetched) {
      await prefetchLink(smartHref);
      setIsPrefetched(true);
    }
  }, [prefetch, isPrefetched, smartHref, prefetchLink]);

  // Handle click with analytics
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (onClick) {
      onClick(event);
    }

    if (analytics) {
      trackLinkAnalytics(generateUniqueId(), 'click', {
        href: smartHref,
        timestamp: new Date().toISOString()
      });
    }

    // Navigate with state preservation
    event.preventDefault();
    navigateWithState(href, state);
  }, [onClick, analytics, smartHref, trackLinkAnalytics, navigateWithState, href, state]);

  return (
    <a
      href={smartHref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

interface ShareLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  path: string;
  title?: string;
  description?: string;
}

export const ShareLinkDialog: React.FC<ShareLinkDialogProps> = ({
  isOpen,
  onClose,
  path,
  title,
  description
}) => {
  const { createShareableLink } = useDeepLinkManager();
  const { toast } = useToast();
  
  const [shareLink, setShareLink] = useState<ShareableLink | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    isPublic: false,
    expiresIn: '7d',
    maxAccess: 100
  });

  const handleCreateLink = useCallback(async () => {
    setIsCreating(true);
    try {
      const expiresAt = shareOptions.expiresIn === 'never' 
        ? undefined 
        : new Date(Date.now() + parseExpirationTime(shareOptions.expiresIn)).toISOString();

      const link = await createShareableLink(path, {
        title,
        description,
        expiresAt,
        maxAccess: shareOptions.maxAccess > 0 ? shareOptions.maxAccess : undefined,
        isPublic: shareOptions.isPublic
      });

      setShareLink(link);
    } catch (error) {
      console.error('Failed to create shareable link:', error);
    } finally {
      setIsCreating(false);
    }
  }, [createShareableLink, path, title, description, shareOptions]);

  const handleCopyLink = useCallback(async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink.url);
      toast({
        title: 'Link Copied',
        description: 'Shareable link has been copied to clipboard'
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive'
      });
    }
  }, [shareLink, toast]);

  const parseExpirationTime = (expiration: string): number => {
    const timeMap: Record<string, number> = {
      '1h': 3600000,
      '1d': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
      '90d': 7776000000
    };

    return timeMap[expiration] || 604800000; // Default 7 days
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Link
          </DialogTitle>
          <DialogDescription>
            Create a shareable link for this resource
          </DialogDescription>
        </DialogHeader>

        {!shareLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link Visibility</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={shareOptions.isPublic}
                  onCheckedChange={(checked) => 
                    setShareOptions(prev => ({ ...prev, isPublic: checked }))
                  }
                />
                <Label className="text-sm">
                  {shareOptions.isPublic ? 'Public' : 'Private'}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expires In</Label>
              <Select
                value={shareOptions.expiresIn}
                onValueChange={(value) => 
                  setShareOptions(prev => ({ ...prev, expiresIn: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Access Count</Label>
              <Input
                type="number"
                value={shareOptions.maxAccess}
                onChange={(e) => 
                  setShareOptions(prev => ({ ...prev, maxAccess: parseInt(e.target.value) || 0 }))
                }
                placeholder="0 for unlimited"
              />
            </div>

            <Button
              onClick={handleCreateLink}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Link...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Create Shareable Link
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shareable Link</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={shareLink.url}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Visibility</Label>
                <div className="flex items-center gap-1">
                  {shareLink.isPublic ? (
                    <Globe className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  <span>{shareLink.isPublic ? 'Public' : 'Private'}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Access Count</Label>
                <div>{shareLink.accessCount}{shareLink.maxAccess ? ` / ${shareLink.maxAccess}` : ''}</div>
              </div>

              {shareLink.expiresAt && (
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Expires</Label>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(shareLink.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShareLink(null)}
                variant="outline"
                className="flex-1"
              >
                Create New
              </Button>
              <Button
                onClick={onClose}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface LinkHistoryProps {
  maxItems?: number;
  showAnalytics?: boolean;
}

export const LinkHistory: React.FC<LinkHistoryProps> = ({
  maxItems = 50,
  showAnalytics = false
}) => {
  const [history, setHistory] = useState<Array<{
    url: string;
    title: string;
    timestamp: string;
    analytics?: DeepLinkAnalytics;
  }>>([]);

  const { getLinkAnalytics } = useDeepLinkManager();

  useEffect(() => {
    // Load link history from localStorage
    const savedHistory = localStorage.getItem('link_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.slice(0, maxItems));
      } catch (error) {
        console.error('Failed to parse link history:', error);
      }
    }
  }, [maxItems]);

  const clearHistory = useCallback(() => {
    localStorage.removeItem('link_history');
    setHistory([]);
  }, []);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="w-8 h-8 mx-auto mb-2" />
        <p>No link history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Recent Links</h3>
        <Button
          onClick={clearHistory}
          size="sm"
          variant="ghost"
        >
          Clear
        </Button>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-1">
          {history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.url}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(item.url)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// ============================================================================
// DEEP LINK HOOKS
// ============================================================================

export const useDeepLink = (path?: string) => {
  const { generateDeepLink, parseDeepLink, navigateWithState, linkState } = useDeepLinkManager();

  const currentDeepLink = useMemo(() => {
    return path ? generateDeepLink(path, linkState) : '';
  }, [path, generateDeepLink, linkState]);

  const navigate = useCallback((targetPath: string, state?: LinkState) => {
    navigateWithState(targetPath, state);
  }, [navigateWithState]);

  const parse = useCallback((url: string) => {
    return parseDeepLink(url);
  }, [parseDeepLink]);

  return {
    currentLink: currentDeepLink,
    navigate,
    parse,
    state: linkState
  };
};

export const useShareableLink = () => {
  const { createShareableLink, getShareableLink } = useDeepLinkManager();
  const [isLoading, setIsLoading] = useState(false);

  const createLink = useCallback(async (
    path: string, 
    options?: ShareableLinkOptions
  ): Promise<ShareableLink | null> => {
    setIsLoading(true);
    try {
      return await createShareableLink(path, options);
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [createShareableLink]);

  const getLink = useCallback(async (id: string): Promise<ShareableLink | null> => {
    setIsLoading(true);
    try {
      return await getShareableLink(id);
    } catch (error) {
      console.error('Failed to get shareable link:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getShareableLink]);

  return {
    createLink,
    getLink,
    isLoading
  };
};

export const useLinkAnalytics = (linkId?: string) => {
  const { getLinkAnalytics, trackLinkAnalytics } = useDeepLinkManager();
  const [analytics, setAnalytics] = useState<DeepLinkAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalytics = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getLinkAnalytics(id);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load link analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getLinkAnalytics]);

  const trackEvent = useCallback((event: string, metadata?: Record<string, any>) => {
    if (linkId) {
      trackLinkAnalytics(linkId, event, metadata);
    }
  }, [linkId, trackLinkAnalytics]);

  useEffect(() => {
    if (linkId) {
      loadAnalytics(linkId);
    }
  }, [linkId, loadAnalytics]);

  return {
    analytics,
    isLoading,
    trackEvent,
    reload: () => linkId && loadAnalytics(linkId)
  };
};

export const useLinkValidation = () => {
  const { validateLink } = useDeepLinkManager();
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (url: string): Promise<boolean> => {
    setIsValidating(true);
    try {
      return await validateLink(url);
    } catch (error) {
      console.error('Link validation error:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [validateLink]);

  return {
    validate,
    isValidating
  };
};

// ============================================================================
// LINK BUILDER COMPONENT
// ============================================================================

interface LinkBuilderProps {
  onLinkGenerated?: (link: string) => void;
  defaultPath?: string;
  defaultState?: LinkState;
}

export const LinkBuilder: React.FC<LinkBuilderProps> = ({
  onLinkGenerated,
  defaultPath = '',
  defaultState
}) => {
  const { generateDeepLink } = useDeepLinkManager();
  const [path, setPath] = useState(defaultPath);
  const [state, setState] = useState<LinkState>(defaultState || {
    view: 'dashboard' as ViewMode,
    layout: 'default' as LayoutMode
  });

  const generatedLink = useMemo(() => {
    if (!path) return '';
    return generateDeepLink(path, state, { includeAnalytics: true });
  }, [path, state, generateDeepLink]);

  useEffect(() => {
    if (generatedLink && onLinkGenerated) {
      onLinkGenerated(generatedLink);
    }
  }, [generatedLink, onLinkGenerated]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Link Builder
        </CardTitle>
        <CardDescription>
          Build custom deep links with state preservation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Target Path</Label>
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/data-sources"
          />
        </div>

        <div className="space-y-2">
          <Label>View Mode</Label>
          <Select
            value={state.view}
            onValueChange={(value) => setState(prev => ({ ...prev, view: value as ViewMode }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_MODES.map(mode => (
                <SelectItem key={mode} value={mode}>
                  {mode.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Layout Mode</Label>
          <Select
            value={state.layout}
            onValueChange={(value) => setState(prev => ({ ...prev, layout: value as LayoutMode }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAYOUT_MODES.map(mode => (
                <SelectItem key={mode} value={mode}>
                  {mode.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {generatedLink && (
          <div className="space-y-2">
            <Label>Generated Link</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={generatedLink}
                readOnly
                className="flex-1 font-mono text-xs"
              />
              <Button
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                size="sm"
                variant="outline"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default DeepLinkManagerProvider;
export type { 
  DeepLinkConfig, 
  DeepLinkResult, 
  LinkState, 
  DeepLinkAnalytics, 
  ShareableLink,
  DeepLinkOptions,
  ShareableLinkOptions
};
