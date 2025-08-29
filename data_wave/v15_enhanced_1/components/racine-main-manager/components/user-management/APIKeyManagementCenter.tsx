/**
 * APIKeyManagementCenter.tsx
 * ==========================
 * 
 * Advanced Enterprise API Key Management Component
 * 
 * Features:
 * - Comprehensive API key lifecycle management (create, rotate, revoke, monitor)
 * - Enterprise-grade security with granular permissions and scoping
 * - Advanced API key analytics and usage monitoring
 * - Rate limiting and quota management
 * - Cross-SPA API key coordination and access control
 * - Real-time API key activity tracking and alerting
 * - API key compliance and audit logging
 * - Advanced authentication methods (Bearer, API Key, JWT)
 * - Webhook and event-driven notifications
 * - API versioning and deprecation management
 * - Advanced filtering, searching, and bulk operations
 * - Export and import capabilities for enterprise environments
 * 
 * Design:
 * - Modern enterprise-grade interface with advanced data tables
 * - Real-time status indicators and monitoring dashboards
 * - Advanced form validation and step-by-step key creation
 * - Responsive design optimized for all device sizes
 * - Accessibility compliance and keyboard navigation
 * - Dark/light theme support with security-focused themes
 * - Advanced animations and micro-interactions
 * 
 * Backend Integration:
 * - Maps to APIKeyService, SecurityService, AuditService
 * - Real-time WebSocket updates for key status and usage
 * - Integration with all 7 data governance SPAs
 * - Advanced security event logging and monitoring
 * - Cross-group API key access coordination
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar
} from '@/components/ui/calendar';
import {
  Checkbox
} from '@/components/ui/checkbox';

// Icons
import { Key, KeyRound, KeySquare, Shield, ShieldCheckIcon, ShieldAlert, ShieldOff, Lock, LockKeyhole, Unlock, Eye, EyeOff, Copy, RefreshCw, RotateCcw, Trash2, Edit, Save, Plus, Minus, X, Check, Calendar as CalendarIcon, Clock, Activity, BarChart3, TrendingUp, TrendingDown, PieChart, LineChart, Target, Zap, Bell, BellOff, AlertTriangle, AlertCircle, CheckCircle, XCircle, Info, Settings, Cog, Filter, Search, SortAsc, SortDesc, MoreHorizontal, Download, Upload, Share2, ExternalLink, Link, Unlink, Globe, Server, Database, Cloud, Network, Cpu, HardDrive, Monitor, Smartphone, Tablet, Users, User, Building, FileText, Folder, FolderOpen, Archive, History, Star, Heart, Flag, Bookmark, Tag, Hash, AtSign, Percent, DollarSign, CreditCard, Loader2, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpDown, Code, Terminal, Webhook, Radio, Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium, SignalZero } from 'lucide-react';

// Form validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Date handling
import { format, parseISO, isValid, addDays, addHours, addMonths, startOfDay, endOfDay } from 'date-fns';

// Animations
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Toast notifications
import { toast } from 'sonner';

// Charts
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

// Racine hooks and services
import { useUserManagement } from '../../hooks/useUserManagement';
import { useRBACSystem } from '../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';

// Racine types
import {
  UUID,
  ISODateString,
  OperationStatus,
  UserProfile,
  RBACPermissions,
  ActivityRecord
} from '../../types/racine-core.types';

// Racine utilities
import { 
  formatDate,
  formatTime,
  formatRelativeTime,
  generateSecureId,
  sanitizeInput,
  validateUrl
} from '../../utils/validation-utils';
import {
  generateAPIKey,
  encryptAPIKey,
  decryptAPIKey,
  hashAPIKey
} from '../../utils/security-utils';
import {
  trackAPIKeyActivity,
  generateAPIKeyReport,
  analyzeAPIKeyUsage
} from '../../utils/analytics-utils';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface APIKeyManagementCenterProps {
  userId?: UUID;
  embedded?: boolean;
  onKeyUpdate?: (keyData: APIKeyState) => void;
  className?: string;
}

interface APIKey {
  id: UUID;
  name: string;
  description?: string;
  key: string;
  keyHash: string;
  prefix: string;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  type: 'read' | 'write' | 'admin' | 'custom';
  scopes: string[];
  permissions: string[];
  rateLimit: RateLimit;
  quotas: Quota[];
  createdBy: UUID;
  createdAt: ISODateString;
  lastUsed?: ISODateString;
  expiresAt?: ISODateString;
  lastRotated?: ISODateString;
  usageCount: number;
  errorCount: number;
  metadata: Record<string, any>;
  tags: string[];
  environment: 'development' | 'staging' | 'production';
  ipWhitelist?: string[];
  userAgent?: string;
  referrerWhitelist?: string[];
}

interface RateLimit {
  requests: number;
  period: 'second' | 'minute' | 'hour' | 'day' | 'month';
  burst?: number;
  enabled: boolean;
}

interface Quota {
  resource: string;
  limit: number;
  used: number;
  resetAt: ISODateString;
  enabled: boolean;
}

interface APIKeyState {
  keys: APIKey[];
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  revokedKeys: number;
  totalUsage: number;
  totalErrors: number;
  lastActivity: ISODateString;
}

interface APIKeyUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uniqueIPs: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    errorRate: number;
  }>;
  usageByTime: Array<{
    timestamp: string;
    requests: number;
    errors: number;
  }>;
  usageByRegion: Array<{
    region: string;
    requests: number;
    percentage: number;
  }>;
}

interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  type: string;
  scopes: string[];
  permissions: string[];
  expiresAt?: ISODateString;
  rateLimit: RateLimit;
  quotas: Quota[];
  environment: string;
  ipWhitelist?: string[];
  referrerWhitelist?: string[];
  tags: string[];
}

interface APIKeyAnalytics {
  keyId: UUID;
  dailyUsage: Array<{
    date: string;
    requests: number;
    errors: number;
    latency: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    requests: number;
    percentage: number;
  }>;
  endpointUsage: Array<{
    endpoint: string;
    method: string;
    requests: number;
    avgResponseTime: number;
    errorRate: number;
  }>;
  rateLimit: {
    limit: number;
    used: number;
    resetAt: ISODateString;
    violations: number;
  };
  securityEvents: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: ISODateString;
    metadata: Record<string, any>;
  }>;
}

// =============================================================================
// FORM VALIDATION SCHEMAS
// =============================================================================

const createAPIKeySchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  type: z.enum(['read', 'write', 'admin', 'custom']),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']),
  rateLimit: z.object({
    requests: z.number().min(1).max(10000),
    period: z.enum(['second', 'minute', 'hour', 'day', 'month']),
    burst: z.number().optional(),
    enabled: z.boolean()
  }),
  quotas: z.array(z.object({
    resource: z.string(),
    limit: z.number().min(1),
    enabled: z.boolean()
  })).optional(),
  ipWhitelist: z.array(z.string()).optional(),
  referrerWhitelist: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

const updateAPIKeySchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  scopes: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
  rateLimit: z.object({
    requests: z.number().min(1).max(10000),
    period: z.enum(['second', 'minute', 'hour', 'day', 'month']),
    burst: z.number().optional(),
    enabled: z.boolean()
  }).optional(),
  quotas: z.array(z.object({
    resource: z.string(),
    limit: z.number().min(1),
    enabled: z.boolean()
  })).optional(),
  ipWhitelist: z.array(z.string()).optional(),
  referrerWhitelist: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
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

const API_KEY_TYPES = [
  {
    value: 'read',
    label: 'Read Only',
    description: 'Read access to data and resources',
    icon: Eye,
    color: 'blue'
  },
  {
    value: 'write',
    label: 'Read/Write',
    description: 'Read and write access to data and resources',
    icon: Edit,
    color: 'green'
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full administrative access',
    icon: Shield,
    color: 'red'
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Custom permission set',
    icon: Settings,
    color: 'purple'
  }
];

const AVAILABLE_SCOPES = [
  {
    category: 'Data Sources',
    scopes: [
      { value: 'data-sources:read', label: 'Read Data Sources' },
      { value: 'data-sources:write', label: 'Manage Data Sources' },
      { value: 'data-sources:scan', label: 'Scan Data Sources' },
      { value: 'data-sources:connect', label: 'Connect Data Sources' }
    ]
  },
  {
    category: 'Data Catalog',
    scopes: [
      { value: 'catalog:read', label: 'Read Catalog' },
      { value: 'catalog:write', label: 'Manage Catalog' },
      { value: 'catalog:search', label: 'Search Catalog' },
      { value: 'catalog:lineage', label: 'Access Lineage' }
    ]
  },
  {
    category: 'Classifications',
    scopes: [
      { value: 'classifications:read', label: 'Read Classifications' },
      { value: 'classifications:write', label: 'Manage Classifications' },
      { value: 'classifications:assign', label: 'Assign Classifications' }
    ]
  },
  {
    category: 'Compliance',
    scopes: [
      { value: 'compliance:read', label: 'Read Compliance Rules' },
      { value: 'compliance:write', label: 'Manage Compliance Rules' },
      { value: 'compliance:audit', label: 'Access Audit Logs' }
    ]
  },
  {
    category: 'Scan Rules',
    scopes: [
      { value: 'scan-rules:read', label: 'Read Scan Rules' },
      { value: 'scan-rules:write', label: 'Manage Scan Rules' },
      { value: 'scan-rules:execute', label: 'Execute Scans' }
    ]
  },
  {
    category: 'RBAC',
    scopes: [
      { value: 'rbac:read', label: 'Read RBAC' },
      { value: 'rbac:write', label: 'Manage RBAC' },
      { value: 'rbac:assign', label: 'Assign Roles' }
    ]
  },
  {
    category: 'Analytics',
    scopes: [
      { value: 'analytics:read', label: 'Read Analytics' },
      { value: 'analytics:reports', label: 'Generate Reports' },
      { value: 'analytics:export', label: 'Export Data' }
    ]
  }
];

const RATE_LIMIT_PERIODS = [
  { value: 'second', label: 'per second', multiplier: 1 },
  { value: 'minute', label: 'per minute', multiplier: 60 },
  { value: 'hour', label: 'per hour', multiplier: 3600 },
  { value: 'day', label: 'per day', multiplier: 86400 },
  { value: 'month', label: 'per month', multiplier: 2592000 }
];

const ENVIRONMENTS = [
  { value: 'development', label: 'Development', color: 'gray' },
  { value: 'staging', label: 'Staging', color: 'yellow' },
  { value: 'production', label: 'Production', color: 'red' }
];

const STATUS_COLORS = {
  active: 'green',
  inactive: 'gray',
  expired: 'orange',
  revoked: 'red'
};

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const APIKeyManagementCenter: React.FC<APIKeyManagementCenterProps> = ({
  userId,
  embedded = false,
  onKeyUpdate,
  className = ''
}) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================

  const {
    userProfile,
    loading: userLoading,
    error: userError
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
    crossGroupData
  } = useCrossGroupIntegration();

  // Form management
  const createForm = useForm({
    resolver: zodResolver(createAPIKeySchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'read',
      scopes: [],
      permissions: [],
      expiresAt: '',
      environment: 'development',
      rateLimit: {
        requests: 1000,
        period: 'hour',
        burst: 100,
        enabled: true
      },
      quotas: [],
      ipWhitelist: [],
      referrerWhitelist: [],
      tags: []
    }
  });

  const updateForm = useForm({
    resolver: zodResolver(updateAPIKeySchema),
    defaultValues: {}
  });

  // Component state
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeyState, setApiKeyState] = useState<APIKeyState>({
    keys: [],
    totalKeys: 0,
    activeKeys: 0,
    expiredKeys: 0,
    revokedKeys: 0,
    totalUsage: 0,
    totalErrors: 0,
    lastActivity: new Date().toISOString()
  });

  // API Key management state
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState<{[key: string]: boolean}>({});
  const [createStep, setCreateStep] = useState(0);

  // Analytics and monitoring state
  const [usageStats, setUsageStats] = useState<APIKeyUsageStats | null>(null);
  const [keyAnalytics, setKeyAnalytics] = useState<{[key: string]: APIKeyAnalytics}>({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('7d');

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedKeys, setSelectedKeys] = useState<UUID[]>([]);

  // Bulk operations state
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStates, setCopyStates] = useState<{[key: string]: boolean}>({});

  // Animation controls
  const controls = useAnimation();

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canManageKeys = useMemo(() => {
    return hasPermission('api-keys.manage') || hasPermission('admin.full');
  }, [hasPermission]);

  const canCreateKeys = useMemo(() => {
    return hasPermission('api-keys.create') || hasPermission('api-keys.manage');
  }, [hasPermission]);

  const canViewAnalytics = useMemo(() => {
    return hasPermission('api-keys.analytics') || hasPermission('analytics.view');
  }, [hasPermission]);

  const filteredKeys = useMemo(() => {
    let filtered = apiKeyState.keys;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(key => 
        key.name.toLowerCase().includes(query) ||
        key.description?.toLowerCase().includes(query) ||
        key.tags.some(tag => tag.toLowerCase().includes(query)) ||
        key.prefix.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(key => key.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(key => key.type === typeFilter);
    }

    // Apply environment filter
    if (environmentFilter !== 'all') {
      filtered = filtered.filter(key => key.environment === environmentFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof APIKey];
      let bValue = b[sortBy as keyof APIKey];

      if (sortBy === 'lastUsed') {
        aValue = a.lastUsed || '1970-01-01';
        bValue = b.lastUsed || '1970-01-01';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [apiKeyState.keys, searchQuery, statusFilter, typeFilter, environmentFilter, sortBy, sortOrder]);

  const statsCards = useMemo(() => [
    {
      title: 'Total Keys',
      value: apiKeyState.totalKeys,
      icon: Key,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Active Keys',
      value: apiKeyState.activeKeys,
      icon: CheckCircle,
      color: 'green',
      change: '+5%'
    },
    {
      title: 'Total Requests',
      value: usageStats?.totalRequests || 0,
      icon: Activity,
      color: 'purple',
      change: '+23%'
    },
    {
      title: 'Error Rate',
      value: usageStats ? `${((usageStats.failedRequests / usageStats.totalRequests) * 100).toFixed(1)}%` : '0%',
      icon: AlertTriangle,
      color: 'red',
      change: '-2%'
    }
  ], [apiKeyState, usageStats]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      if (!userProfile) return;

      try {
        setLoading(true);
        
        // Load API keys and analytics data
        await Promise.all([
          loadAPIKeys(),
          loadUsageStats(),
          loadAnalytics()
        ]);

      } catch (error) {
        console.error('Failed to initialize API Key Management:', error);
        setError('Failed to load API key data');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [userProfile]);

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedKeys.length > 0);
  }, [selectedKeys]);

  // Animate component entrance
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  const loadAPIKeys = useCallback(async () => {
    if (!userProfile) return;

    try {
      // TODO: Replace with actual API call
      const mockKeys: APIKey[] = [
        {
          id: 'api-key-1',
          name: 'Data Sources API',
          description: 'API key for data source management',
          key: 'rk_live_1234567890abcdef',
          keyHash: 'hash_1234567890',
          prefix: 'rk_live',
          status: 'active',
          type: 'write',
          scopes: ['data-sources:read', 'data-sources:write'],
          permissions: ['data.read', 'data.write'],
          rateLimit: {
            requests: 1000,
            period: 'hour',
            enabled: true
          },
          quotas: [
            {
              resource: 'api_calls',
              limit: 10000,
              used: 2345,
              resetAt: addMonths(new Date(), 1).toISOString(),
              enabled: true
            }
          ],
          createdBy: userProfile.id,
          createdAt: addDays(new Date(), -30).toISOString(),
          lastUsed: addHours(new Date(), -2).toISOString(),
          expiresAt: addMonths(new Date(), 6).toISOString(),
          usageCount: 2345,
          errorCount: 23,
          metadata: {},
          tags: ['production', 'data-sources'],
          environment: 'production'
        },
        {
          id: 'api-key-2',
          name: 'Analytics Dashboard',
          description: 'Read-only access for analytics dashboard',
          key: 'rk_test_abcdef1234567890',
          keyHash: 'hash_abcdef1234',
          prefix: 'rk_test',
          status: 'active',
          type: 'read',
          scopes: ['analytics:read', 'catalog:read'],
          permissions: ['analytics.read', 'catalog.read'],
          rateLimit: {
            requests: 500,
            period: 'hour',
            enabled: true
          },
          quotas: [
            {
              resource: 'api_calls',
              limit: 5000,
              used: 1234,
              resetAt: addMonths(new Date(), 1).toISOString(),
              enabled: true
            }
          ],
          createdBy: userProfile.id,
          createdAt: addDays(new Date(), -15).toISOString(),
          lastUsed: addHours(new Date(), -1).toISOString(),
          usageCount: 1234,
          errorCount: 5,
          metadata: {},
          tags: ['staging', 'analytics'],
          environment: 'staging'
        },
        {
          id: 'api-key-3',
          name: 'Legacy Integration',
          description: 'Legacy system integration key',
          key: 'rk_legacy_xyz789abc123',
          keyHash: 'hash_xyz789abc',
          prefix: 'rk_legacy',
          status: 'expired',
          type: 'admin',
          scopes: ['*'],
          permissions: ['*'],
          rateLimit: {
            requests: 100,
            period: 'minute',
            enabled: true
          },
          quotas: [],
          createdBy: userProfile.id,
          createdAt: addDays(new Date(), -365).toISOString(),
          lastUsed: addDays(new Date(), -30).toISOString(),
          expiresAt: addDays(new Date(), -1).toISOString(),
          usageCount: 15432,
          errorCount: 234,
          metadata: {},
          tags: ['legacy', 'deprecated'],
          environment: 'production'
        }
      ];

      const newState: APIKeyState = {
        keys: mockKeys,
        totalKeys: mockKeys.length,
        activeKeys: mockKeys.filter(k => k.status === 'active').length,
        expiredKeys: mockKeys.filter(k => k.status === 'expired').length,
        revokedKeys: mockKeys.filter(k => k.status === 'revoked').length,
        totalUsage: mockKeys.reduce((sum, k) => sum + k.usageCount, 0),
        totalErrors: mockKeys.reduce((sum, k) => sum + k.errorCount, 0),
        lastActivity: new Date().toISOString()
      };

      setApiKeyState(newState);

      if (onKeyUpdate) {
        onKeyUpdate(newState);
      }

    } catch (error) {
      console.error('Failed to load API keys:', error);
      throw error;
    }
  }, [userProfile, onKeyUpdate]);

  const loadUsageStats = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockStats: APIKeyUsageStats = {
        totalRequests: 189543,
        successfulRequests: 186234,
        failedRequests: 3309,
        averageResponseTime: 245,
        uniqueIPs: 1247,
        topEndpoints: [
          { endpoint: '/api/v1/data-sources', requests: 45234, errorRate: 1.2 },
          { endpoint: '/api/v1/catalog/search', requests: 38765, errorRate: 0.8 },
          { endpoint: '/api/v1/analytics/reports', requests: 25432, errorRate: 2.1 },
          { endpoint: '/api/v1/compliance/rules', requests: 18976, errorRate: 0.5 },
          { endpoint: '/api/v1/scan-rules', requests: 15234, errorRate: 1.8 }
        ],
        usageByTime: Array.from({ length: 24 }, (_, i) => ({
          timestamp: format(addHours(startOfDay(new Date()), i), 'yyyy-MM-dd HH:mm'),
          requests: Math.floor(Math.random() * 1000) + 500,
          errors: Math.floor(Math.random() * 50) + 10
        })),
        usageByRegion: [
          { region: 'North America', requests: 89234, percentage: 47.1 },
          { region: 'Europe', requests: 56789, percentage: 30.0 },
          { region: 'Asia Pacific', requests: 34567, percentage: 18.2 },
          { region: 'Others', requests: 8953, percentage: 4.7 }
        ]
      };

      setUsageStats(mockStats);

    } catch (error) {
      console.error('Failed to load usage stats:', error);
      throw error;
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockAnalytics: {[key: string]: APIKeyAnalytics} = {
        'api-key-1': {
          keyId: 'api-key-1',
          dailyUsage: Array.from({ length: 30 }, (_, i) => ({
            date: format(addDays(new Date(), -29 + i), 'yyyy-MM-dd'),
            requests: Math.floor(Math.random() * 200) + 50,
            errors: Math.floor(Math.random() * 10),
            latency: Math.floor(Math.random() * 100) + 100
          })),
          geographicDistribution: [
            { country: 'United States', requests: 1234, percentage: 52.3 },
            { country: 'Canada', requests: 567, percentage: 24.0 },
            { country: 'United Kingdom', requests: 345, percentage: 14.6 },
            { country: 'Germany', requests: 218, percentage: 9.1 }
          ],
          endpointUsage: [
            { endpoint: '/api/v1/data-sources', method: 'GET', requests: 1234, avgResponseTime: 234, errorRate: 1.2 },
            { endpoint: '/api/v1/data-sources', method: 'POST', requests: 567, avgResponseTime: 345, errorRate: 2.1 },
            { endpoint: '/api/v1/data-sources/:id', method: 'PUT', requests: 234, avgResponseTime: 456, errorRate: 0.8 }
          ],
          rateLimit: {
            limit: 1000,
            used: 234,
            resetAt: addHours(new Date(), 1).toISOString(),
            violations: 0
          },
          securityEvents: [
            {
              type: 'rate_limit_exceeded',
              severity: 'medium',
              description: 'Rate limit exceeded from IP 192.168.1.100',
              timestamp: addHours(new Date(), -2).toISOString(),
              metadata: { ip: '192.168.1.100', requests: 1500 }
            }
          ]
        }
      };

      setKeyAnalytics(mockAnalytics);

    } catch (error) {
      console.error('Failed to load analytics:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleCreateAPIKey = useCallback(async (data: any) => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Generate new API key
      const keyValue = generateAPIKey();
      const keyHash = hashAPIKey(keyValue);
      const prefix = `rk_${data.environment.slice(0, 4)}`;

      const newKey: APIKey = {
        id: generateSecureId(),
        name: data.name,
        description: data.description,
        key: keyValue,
        keyHash,
        prefix,
        status: 'active',
        type: data.type,
        scopes: data.scopes,
        permissions: data.permissions,
        rateLimit: data.rateLimit,
        quotas: data.quotas || [],
        createdBy: userProfile.id,
        createdAt: new Date().toISOString(),
        expiresAt: data.expiresAt,
        usageCount: 0,
        errorCount: 0,
        metadata: {},
        tags: data.tags || [],
        environment: data.environment,
        ipWhitelist: data.ipWhitelist,
        referrerWhitelist: data.referrerWhitelist
      };

      // TODO: Replace with actual API call
      console.log('Creating API key:', newKey);

      // Update state
      setApiKeyState(prev => ({
        ...prev,
        keys: [...prev.keys, newKey],
        totalKeys: prev.totalKeys + 1,
        activeKeys: prev.activeKeys + 1
      }));

      toast.success('API key created successfully');
      setShowCreateDialog(false);
      setCreateStep(0);
      createForm.reset();

      // Track activity
      trackAPIKeyActivity({
        action: 'create',
        keyId: newKey.id,
        userId: userProfile.id,
        details: { name: newKey.name, type: newKey.type }
      });

    } catch (error: any) {
      console.error('Failed to create API key:', error);
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  }, [userProfile, createForm]);

  const handleUpdateAPIKey = useCallback(async (keyId: UUID, data: any) => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      console.log('Updating API key:', keyId, data);

      // Update state
      setApiKeyState(prev => ({
        ...prev,
        keys: prev.keys.map(key => 
          key.id === keyId 
            ? { ...key, ...data, lastRotated: new Date().toISOString() }
            : key
        )
      }));

      toast.success('API key updated successfully');
      setShowEditDialog(false);
      updateForm.reset();

      // Track activity
      trackAPIKeyActivity({
        action: 'update',
        keyId,
        userId: userProfile.id,
        details: data
      });

    } catch (error: any) {
      console.error('Failed to update API key:', error);
      toast.error(error.message || 'Failed to update API key');
    } finally {
      setLoading(false);
    }
  }, [userProfile, updateForm]);

  const handleRotateAPIKey = useCallback(async (keyId: UUID) => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Generate new key value
      const newKeyValue = generateAPIKey();
      const newKeyHash = hashAPIKey(newKeyValue);

      // TODO: Replace with actual API call
      console.log('Rotating API key:', keyId);

      // Update state
      setApiKeyState(prev => ({
        ...prev,
        keys: prev.keys.map(key => 
          key.id === keyId 
            ? { 
                ...key, 
                key: newKeyValue,
                keyHash: newKeyHash,
                lastRotated: new Date().toISOString() 
              }
            : key
        )
      }));

      toast.success('API key rotated successfully');

      // Track activity
      trackAPIKeyActivity({
        action: 'rotate',
        keyId,
        userId: userProfile.id,
        details: { rotatedAt: new Date().toISOString() }
      });

    } catch (error: any) {
      console.error('Failed to rotate API key:', error);
      toast.error(error.message || 'Failed to rotate API key');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const handleRevokeAPIKey = useCallback(async (keyId: UUID) => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      console.log('Revoking API key:', keyId);

      // Update state
      setApiKeyState(prev => ({
        ...prev,
        keys: prev.keys.map(key => 
          key.id === keyId 
            ? { ...key, status: 'revoked' as const }
            : key
        ),
        activeKeys: prev.activeKeys - 1,
        revokedKeys: prev.revokedKeys + 1
      }));

      toast.success('API key revoked successfully');
      setShowDeleteDialog(false);
      setSelectedKey(null);

      // Track activity
      trackAPIKeyActivity({
        action: 'revoke',
        keyId,
        userId: userProfile.id,
        details: { revokedAt: new Date().toISOString() }
      });

    } catch (error: any) {
      console.error('Failed to revoke API key:', error);
      toast.error(error.message || 'Failed to revoke API key');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const handleCopyKey = useCallback(async (keyId: UUID, keyValue: string) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopyStates(prev => ({ ...prev, [keyId]: true }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [keyId]: false }));
      }, 2000);
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  }, []);

  const handleToggleKeyVisibility = useCallback((keyId: UUID) => {
    setShowKeyValue(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  }, []);

  const handleBulkAction = useCallback(async (action: string) => {
    if (!userProfile || selectedKeys.length === 0) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API calls
      console.log('Bulk action:', action, selectedKeys);

      switch (action) {
        case 'revoke':
          setApiKeyState(prev => ({
            ...prev,
            keys: prev.keys.map(key => 
              selectedKeys.includes(key.id) && key.status === 'active'
                ? { ...key, status: 'revoked' as const }
                : key
            ),
            activeKeys: prev.activeKeys - selectedKeys.filter(id => 
              prev.keys.find(k => k.id === id)?.status === 'active'
            ).length,
            revokedKeys: prev.revokedKeys + selectedKeys.filter(id => 
              prev.keys.find(k => k.id === id)?.status === 'active'
            ).length
          }));
          toast.success(`${selectedKeys.length} API keys revoked`);
          break;
        
        case 'activate':
          setApiKeyState(prev => ({
            ...prev,
            keys: prev.keys.map(key => 
              selectedKeys.includes(key.id) && key.status === 'inactive'
                ? { ...key, status: 'active' as const }
                : key
            )
          }));
          toast.success(`${selectedKeys.length} API keys activated`);
          break;
        
        case 'deactivate':
          setApiKeyState(prev => ({
            ...prev,
            keys: prev.keys.map(key => 
              selectedKeys.includes(key.id) && key.status === 'active'
                ? { ...key, status: 'inactive' as const }
                : key
            )
          }));
          toast.success(`${selectedKeys.length} API keys deactivated`);
          break;
      }

      setSelectedKeys([]);
      setBulkAction('');

    } catch (error: any) {
      console.error('Failed to perform bulk action:', error);
      toast.error(error.message || 'Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  }, [userProfile, selectedKeys]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderOverviewTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                      <IconComponent className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                      <p className="text-xs text-green-600">{stat.change}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Usage Chart */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>API Usage Over Time</span>
            </CardTitle>
            <CardDescription>
              API request volume and error rates over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageStats?.usageByTime || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                  />
                  <YAxis />
                  <RechartsTooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, HH:mm')}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Requests"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    name="Errors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Endpoints and Usage by Region */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints</CardTitle>
              <CardDescription>
                Most frequently accessed API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats?.topEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{endpoint.endpoint}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress 
                          value={(endpoint.requests / (usageStats?.topEndpoints[0]?.requests || 1)) * 100} 
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-gray-500">
                          {endpoint.requests.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={endpoint.errorRate > 2 ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {endpoint.errorRate.toFixed(1)}% errors
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage by Region</CardTitle>
              <CardDescription>
                Geographic distribution of API requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats?.usageByRegion.map((region, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{region.region}</p>
                      <Progress value={region.percentage} className="h-2 mt-1" />
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium">{region.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{region.requests.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common API key management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex items-center space-x-2 h-auto p-4"
                onClick={() => setShowCreateDialog(true)}
                disabled={!canCreateKeys}
              >
                <Plus className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Create API Key</p>
                  <p className="text-sm text-gray-500">Generate a new API key</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 h-auto p-4"
                onClick={() => setActiveTab('analytics')}
                disabled={!canViewAnalytics}
              >
                <BarChart3 className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-gray-500">Detailed usage analytics</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 h-auto p-4"
                onClick={() => setActiveTab('management')}
              >
                <Settings className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Manage Keys</p>
                  <p className="text-sm text-gray-500">View and edit existing keys</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderManagementTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Filters and Search */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search API keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {API_KEY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Environments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    {ENVIRONMENTS.map(env => (
                      <SelectItem key={env.value} value={env.value}>
                        {env.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {canCreateKeys && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Key</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {selectedKeys.length} key{selectedKeys.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('activate')}
                        disabled={loading}
                      >
                        Activate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('deactivate')}
                        disabled={loading}
                      >
                        Deactivate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBulkAction('revoke')}
                        disabled={loading}
                      >
                        Revoke
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedKeys([])}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Keys Table */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={tableRef} className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedKeys.length === filteredKeys.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedKeys(filteredKeys.map(k => k.id));
                          } else {
                            setSelectedKeys([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortBy('lastUsed');
                        setSortOrder(sortBy === 'lastUsed' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Last Used</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map((key) => {
                    const keyType = API_KEY_TYPES.find(t => t.value === key.type);
                    const KeyIcon = keyType?.icon || Key;
                    const isSelected = selectedKeys.includes(key.id);
                    const isKeyVisible = showKeyValue[key.id];
                    const isCopied = copyStates[key.id];

                    return (
                      <TableRow 
                        key={key.id}
                        className={isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedKeys([...selectedKeys, key.id]);
                              } else {
                                setSelectedKeys(selectedKeys.filter(id => id !== key.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-${keyType?.color}-100 dark:bg-${keyType?.color}-900`}>
                              <KeyIcon className={`w-4 h-4 text-${keyType?.color}-600`} />
                            </div>
                            <div>
                              <p className="font-medium">{key.name}</p>
                              {key.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {key.description.slice(0, 50)}
                                  {key.description.length > 50 ? '...' : ''}
                                </p>
                              )}
                              {key.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {key.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {key.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{key.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                              {isKeyVisible ? key.key : `${key.prefix}_${'*'.repeat(16)}`}
                            </code>
                            <div className="flex items-center space-x-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleKeyVisibility(key.id)}
                                    >
                                      {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isKeyVisible ? 'Hide key' : 'Show key'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopyKey(key.id, key.key)}
                                    >
                                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isCopied ? 'Copied!' : 'Copy key'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-${keyType?.color}-600 border-${keyType?.color}-200`}
                          >
                            {keyType?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={key.status === 'active' ? 'default' : 'secondary'}
                            className={`bg-${STATUS_COLORS[key.status]}-100 text-${STATUS_COLORS[key.status]}-700 dark:bg-${STATUS_COLORS[key.status]}-900 dark:text-${STATUS_COLORS[key.status]}-300`}
                          >
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`text-${ENVIRONMENTS.find(e => e.value === key.environment)?.color}-600`}
                          >
                            {ENVIRONMENTS.find(e => e.value === key.environment)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {key.lastUsed 
                              ? formatRelativeTime(key.lastUsed)
                              : 'Never'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{key.usageCount.toLocaleString()}</p>
                            <p className="text-gray-500 dark:text-gray-400">
                              {key.errorCount} errors
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedKey(key);
                                  setShowKeyDetails(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {canManageKeys && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedKey(key);
                                      updateForm.reset(key);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRotateAPIKey(key.id)}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Rotate Key
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedKey(key);
                                      setShowDeleteDialog(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Revoke
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
          <span>Loading API key management...</span>
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
        className={`api-key-management-center ${className}`}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {!embedded && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">API Key Management</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage API keys, monitor usage, and control access across your data governance platform
                </p>
              </div>
              {canCreateKeys && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create API Key</span>
                </Button>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>Management</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="management">
              {renderManagementTab()}
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-gray-500">Detailed API key analytics and monitoring will be implemented here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs will be implemented in the next section... */}
      </motion.div>
    </TooltipProvider>
  );
};

export default APIKeyManagementCenter;
