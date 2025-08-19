'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Star,
  StarOff,
  Heart,
  HeartOff,
  Share,
  Save,
  ArrowLeft,
  Tag,
  Clock,
  MapPin,
  Crown,
  Database,
  Network,
  Globe,
  Users,
  User,
  Building,
  Target,
  Shield,
  Key,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Play,
  Pause,
  Square,
  Code,
  GitBranch,
  Layers,
  Workflow,
  Zap,
  Bell,
  Mail,
  Phone,
  Home,
  Archive,
  BookOpen,
  Terminal,
  Monitor,
  Cpu,
  Loader2,
  Calendar,
  Bookmark,
} from 'lucide-react';

// Hooks and Services
import { useConditions } from '../../hooks/useConditions';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';

// Types
import type { 
  ConditionTemplate, 
  ConditionCategory,
  ConditionTemplateStats,
  TemplateUsage
} from '../../types/condition.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate, formatDateTime } from '../../utils/format.utils';

interface ConditionTemplatesProps {
  templates: ConditionTemplate[];
  onUseTemplate: (template: ConditionTemplate) => void;
  onEditTemplate?: (template: ConditionTemplate) => void;
  className?: string;
}

interface TemplateFilter {
  category: string;
  type: string;
  status: string;
  popularity: string;
  complexity: string;
  tags: string[];
}

interface TemplateStats {
  total: number;
  active: number;
  categories: { [key: string]: number };
  popularityScores: { [key: string]: number };
  usageStats: { [key: string]: number };
  recentlyAdded: number;
  featured: number;
}

const TEMPLATE_CATEGORIES = [
  { 
    id: 'security', 
    name: 'Security & Access Control', 
    icon: Shield, 
    color: 'bg-red-100 text-red-800',
    description: 'Templates for security policies and access control'
  },
  { 
    id: 'time', 
    name: 'Time-based Access', 
    icon: Clock, 
    color: 'bg-blue-100 text-blue-800',
    description: 'Time and schedule-based condition templates'
  },
  { 
    id: 'location', 
    name: 'Location & Geography', 
    icon: MapPin, 
    color: 'bg-green-100 text-green-800',
    description: 'Geographic and location-based conditions'
  },
  { 
    id: 'role', 
    name: 'Role & Hierarchy', 
    icon: Crown, 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Role-based and organizational hierarchy conditions'
  },
  { 
    id: 'resource', 
    name: 'Resource Protection', 
    icon: Database, 
    color: 'bg-purple-100 text-purple-800',
    description: 'Data and resource protection templates'
  },
  { 
    id: 'network', 
    name: 'Network & Infrastructure', 
    icon: Network, 
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Network and infrastructure-based conditions'
  },
  { 
    id: 'compliance', 
    name: 'Compliance & Audit', 
    icon: FileText, 
    color: 'bg-orange-100 text-orange-800',
    description: 'Compliance and audit-related templates'
  },
  { 
    id: 'custom', 
    name: 'Custom Templates', 
    icon: Settings, 
    color: 'bg-gray-100 text-gray-800',
    description: 'User-created custom templates'
  },
];

const BUILT_IN_TEMPLATES: ConditionTemplate[] = [
  {
    id: 'business-hours-access',
    name: 'Business Hours Access',
    description: 'Allow access only during standard business hours (9 AM - 5 PM, weekdays)',
    category: 'time',
    type: 'time',
    expression: 'time.hour >= 9 && time.hour <= 17 && time.dayOfWeek >= 1 && time.dayOfWeek <= 5',
    complexity: 3,
    popularity: 95,
    usage_count: 1247,
    is_featured: true,
    is_system: true,
    tags: ['business-hours', 'working-time', 'schedule'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: {
      variables: ['time.hour', 'time.dayOfWeek'],
      functions: [],
      dependencies: ['time'],
      examples: [
        'Standard 9-5 access control',
        'Office hours limitation',
        'Business schedule enforcement'
      ]
    }
  },
  {
    id: 'admin-role-required',
    name: 'Administrator Role Required',
    description: 'Require administrator role for sensitive operations',
    category: 'role',
    type: 'role',
    expression: 'user.roles contains "administrator" || user.roles contains "super_admin"',
    complexity: 2,
    popularity: 89,
    usage_count: 892,
    is_featured: true,
    is_system: true,
    tags: ['admin', 'role', 'privileged'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: {
      variables: ['user.roles'],
      functions: [],
      dependencies: ['user'],
      examples: [
        'Administrative access control',
        'Privileged operation protection',
        'Super user requirements'
      ]
    }
  },
  {
    id: 'sensitive-data-protection',
    name: 'Sensitive Data Protection',
    description: 'Protect access to confidential and restricted data based on user clearance',
    category: 'resource',
    type: 'resource',
    expression: '(resource.classification == "confidential" && user.clearance_level >= 3) || (resource.classification == "restricted" && user.clearance_level >= 4)',
    complexity: 5,
    popularity: 78,
    usage_count: 543,
    is_featured: true,
    is_system: true,
    tags: ['data-protection', 'classification', 'security'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: {
      variables: ['resource.classification', 'user.clearance_level'],
      functions: [],
      dependencies: ['resource', 'user'],
      examples: [
        'Confidential data access',
        'Restricted information protection',
        'Security clearance validation'
      ]
    }
  },
  {
    id: 'geo-restriction-us-only',
    name: 'US-Only Geographic Access',
    description: 'Restrict access to users located within the United States',
    category: 'location',
    type: 'location',
    expression: 'location.country == "US" || location.country == "USA"',
    complexity: 2,
    popularity: 72,
    usage_count: 421,
    is_featured: false,
    is_system: true,
    tags: ['geography', 'location', 'country'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: {
      variables: ['location.country'],
      functions: [],
      dependencies: ['location'],
      examples: [
        'US-only access control',
        'Geographic restriction',
        'Country-based limitation'
      ]
    }
  },
  {
    id: 'trusted-network-only',
    name: 'Trusted Network Access',
    description: 'Allow access only from trusted corporate networks',
    category: 'network',
    type: 'network',
    expression: 'network.trusted_network == true || location.ip in ["192.168.1.0/24", "10.0.0.0/8", "172.16.0.0/12"]',
    complexity: 4,
    popularity: 85,
    usage_count: 672,
    is_featured: true,
    is_system: true,
    tags: ['network', 'trusted', 'corporate'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: {
      variables: ['network.trusted_network', 'location.ip'],
      functions: [],
      dependencies: ['network', 'location'],
      examples: [
        'Corporate network access',
        'Trusted IP restriction',
        'Internal network only'
      ]
    }
  },
  {
    id: 'emergency-access-override',
    name: 'Emergency Access Override',
    description: 'Special access conditions during emergency situations',
    category: 'security',
    type: 'custom',
    expression: 'environment.emergency_mode == true || (user.roles contains "emergency_responder" && time.current > emergency.declared_at)',
    complexity: 6,
    popularity: 45,
    usage_count: 127,
    is_featured: false,
    is_system: true,
    tags: ['emergency', 'override', 'special-access'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: {
      variables: ['environment.emergency_mode', 'user.roles', 'time.current', 'emergency.declared_at'],
      functions: [],
      dependencies: ['environment', 'user', 'time', 'emergency'],
      examples: [
        'Emergency response access',
        'Crisis management override',
        'Special situation handling'
      ]
    }
  },
  {
    id: 'department-data-access',
    name: 'Department-based Data Access',
    description: 'Allow access to departmental data based on user department',
    category: 'role',
    type: 'attribute',
    expression: 'user.department == resource.department || user.roles contains "data_admin" || user.access_level >= resource.required_level',
    complexity: 4,
    popularity: 91,
    usage_count: 758,
    is_featured: true,
    is_system: true,
    tags: ['department', 'data-access', 'organizational'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: {
      variables: ['user.department', 'resource.department', 'user.roles', 'user.access_level', 'resource.required_level'],
      functions: [],
      dependencies: ['user', 'resource'],
      examples: [
        'Departmental data isolation',
        'Cross-department access control',
        'Organizational boundaries'
      ]
    }
  },
  {
    id: 'multi-factor-required',
    name: 'Multi-Factor Authentication Required',
    description: 'Require MFA for high-risk operations or sensitive resources',
    category: 'security',
    type: 'attribute',
    expression: 'user.mfa_verified == true && user.mfa_timestamp > dateAdd(now(), -8, "hours")',
    complexity: 3,
    popularity: 94,
    usage_count: 1156,
    is_featured: true,
    is_system: true,
    tags: ['mfa', 'security', 'authentication'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    metadata: {
      variables: ['user.mfa_verified', 'user.mfa_timestamp'],
      functions: ['dateAdd', 'now'],
      dependencies: ['user'],
      examples: [
        'High-security operations',
        'Sensitive data access',
        'Critical system changes'
      ]
    }
  }
];

const ConditionTemplates: React.FC<ConditionTemplatesProps> = ({
  templates: propTemplates,
  onUseTemplate,
  onEditTemplate,
  className = ''
}) => {
  // State Management
  const [allTemplates, setAllTemplates] = useState<ConditionTemplate[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<ConditionTemplate | null>(null);
  const [templateStats, setTemplateStats] = useState<TemplateStats | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browse');
  
  // Filter and Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');
  const [popularityFilter, setPopularityFilter] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Dialog State
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const { 
    getTemplateStats, 
    getTemplateUsage, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
    favoriteTemplate,
    unfavoriteTemplate 
  } = useConditions();
  const { checkPermission } = usePermissions();

  // Computed Properties
  const canManageTemplates = currentUser && hasPermission(currentUser, 'template:manage');
  const canCreateTemplates = currentUser && hasPermission(currentUser, 'template:create');

  // Combine built-in and custom templates
  useEffect(() => {
    const combined = [...BUILT_IN_TEMPLATES, ...propTemplates];
    setAllTemplates(combined);
    
    // Calculate stats
    const stats: TemplateStats = {
      total: combined.length,
      active: combined.filter(t => !t.is_deprecated).length,
      categories: {},
      popularityScores: {},
      usageStats: {},
      recentlyAdded: combined.filter(t => 
        new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      featured: combined.filter(t => t.is_featured).length
    };

    combined.forEach(template => {
      stats.categories[template.category] = (stats.categories[template.category] || 0) + 1;
      stats.popularityScores[template.id] = template.popularity || 0;
      stats.usageStats[template.id] = template.usage_count || 0;
    });

    setTemplateStats(stats);
  }, [propTemplates]);

  // Filtered and Sorted Templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    // Complexity filter
    if (complexityFilter !== 'all') {
      const complexity = parseInt(complexityFilter);
      filtered = filtered.filter(template => Math.floor((template.complexity || 0) / 2) === Math.floor(complexity / 2));
    }

    // Popularity filter
    if (popularityFilter !== 'all') {
      const popularity = parseInt(popularityFilter);
      filtered = filtered.filter(template => (template.popularity || 0) >= popularity);
    }

    // Featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(template => template.is_featured);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(template => favoriteTemplates.has(template.id));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'popularity':
          aValue = a.popularity || 0;
          bValue = b.popularity || 0;
          break;
        case 'usage':
          aValue = a.usage_count || 0;
          bValue = b.usage_count || 0;
          break;
        case 'complexity':
          aValue = a.complexity || 0;
          bValue = b.complexity || 0;
          break;
        case 'created':
          aValue = a.created_at;
          bValue = b.created_at;
          break;
        default:
          aValue = a.popularity || 0;
          bValue = b.popularity || 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    allTemplates, 
    searchTerm, 
    selectedCategory, 
    selectedType, 
    complexityFilter, 
    popularityFilter, 
    showFeaturedOnly, 
    showFavoritesOnly, 
    favoriteTemplates, 
    sortBy, 
    sortOrder
  ]);

  // Event Handlers
  const handleToggleFavorite = useCallback(async (template: ConditionTemplate) => {
    if (!currentUser) return;

    try {
      const isFavorited = favoriteTemplates.has(template.id);
      
      if (isFavorited) {
        await unfavoriteTemplate(template.id);
        setFavoriteTemplates(prev => {
          const newSet = new Set(prev);
          newSet.delete(template.id);
          return newSet;
        });
      } else {
        await favoriteTemplate(template.id);
        setFavoriteTemplates(prev => new Set(prev).add(template.id));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [currentUser, favoriteTemplates, favoriteTemplate, unfavoriteTemplate]);

  const handleViewTemplate = useCallback((template: ConditionTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
  }, []);

  const handleUseTemplate = useCallback((template: ConditionTemplate) => {
    onUseTemplate(template);
  }, [onUseTemplate]);

  const handleEditTemplate = useCallback((template: ConditionTemplate) => {
    if (onEditTemplate) {
      onEditTemplate(template);
    }
  }, [onEditTemplate]);

  const getComplexityLabel = useCallback((complexity: number) => {
    if (complexity <= 2) return 'Simple';
    if (complexity <= 4) return 'Medium';
    if (complexity <= 6) return 'Complex';
    return 'Advanced';
  }, []);

  const getComplexityColor = useCallback((complexity: number) => {
    if (complexity <= 2) return 'bg-green-100 text-green-800';
    if (complexity <= 4) return 'bg-yellow-100 text-yellow-800';
    if (complexity <= 6) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }, []);

  const getPopularityStars = useCallback((popularity: number) => {
    const stars = Math.round(popularity / 20); // Convert 0-100 to 0-5 stars
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  }, []);

  // Render Methods
  const renderHeader = () => (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Condition Templates
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Browse and use pre-built condition templates for common access control scenarios
        </p>
        {templateStats && (
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>{templateStats.total} total templates</span>
            <span>{templateStats.featured} featured</span>
            <span>{templateStats.recentlyAdded} recently added</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {canCreateTemplates && (
          <Button onClick={() => setShowCreateTemplate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        )}
        
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <div className="space-y-1">
              <div className="h-0.5 w-4 bg-current"></div>
              <div className="h-0.5 w-4 bg-current"></div>
              <div className="h-0.5 w-4 bg-current"></div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStatsCards = () => {
    if (!templateStats) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{templateStats.total}</div>
                <div className="text-sm text-gray-500">Total Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{templateStats.featured}</div>
                <div className="text-sm text-gray-500">Featured</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{templateStats.recentlyAdded}</div>
                <div className="text-sm text-gray-500">Recent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{favoriteTemplates.size}</div>
                <div className="text-sm text-gray-500">Favorites</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFilters = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={showFeaturedOnly}
                onCheckedChange={setShowFeaturedOnly}
              />
              <Label htmlFor="featured" className="text-sm">Featured only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="favorites"
                checked={showFavoritesOnly}
                onCheckedChange={setShowFavoritesOnly}
              />
              <Label htmlFor="favorites" className="text-sm">My favorites</Label>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={complexityFilter} onValueChange={setComplexityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Simple</SelectItem>
                <SelectItem value="3">Medium</SelectItem>
                <SelectItem value="5">Complex</SelectItem>
                <SelectItem value="7">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={popularityFilter} onValueChange={setPopularityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Popularity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="80">Highly Popular</SelectItem>
                <SelectItem value="60">Popular</SelectItem>
                <SelectItem value="40">Moderate</SelectItem>
                <SelectItem value="20">New</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="usage">Usage Count</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="complexity">Complexity</SelectItem>
                <SelectItem value="created">Date Created</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplateCard = (template: ConditionTemplate) => {
    const categoryConfig = TEMPLATE_CATEGORIES.find(cat => cat.id === template.category);
    const CategoryIcon = categoryConfig?.icon || Settings;
    const isFavorited = favoriteTemplates.has(template.id);

    return (
      <motion.div
        key={template.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        className="group"
      >
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${categoryConfig?.color || 'bg-gray-100'}`}>
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    {template.is_featured && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                    {template.is_system && (
                      <Badge variant="secondary" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    {getPopularityStars(template.popularity || 0)}
                    <span className="text-xs text-gray-500 ml-2">
                      ({template.usage_count || 0} uses)
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(template);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isFavorited ? (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                ) : (
                  <HeartOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {template.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={categoryConfig?.color}>
                  {categoryConfig?.name}
                </Badge>
                <Badge className={getComplexityColor(template.complexity || 0)}>
                  {getComplexityLabel(template.complexity || 0)}
                </Badge>
              </div>

              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-xs text-gray-700 break-all">
                  {template.expression.length > 80 
                    ? `${template.expression.substring(0, 80)}...`
                    : template.expression
                  }
                </code>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template);
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Use
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewTemplate(template);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                    <Play className="h-4 w-4 mr-2" />
                    Use Template
                  </DropdownMenuItem>
                  {canManageTemplates && !template.is_system && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Template
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {filteredTemplates.map((template) => renderTemplateCard(template))}
      </AnimatePresence>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      <AnimatePresence>
        {filteredTemplates.map((template) => {
          const categoryConfig = TEMPLATE_CATEGORIES.find(cat => cat.id === template.category);
          const CategoryIcon = categoryConfig?.icon || Settings;
          const isFavorited = favoriteTemplates.has(template.id);

          return (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${categoryConfig?.color || 'bg-gray-100'}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          {template.is_featured && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                          {template.is_system && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{template.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            {getPopularityStars(template.popularity || 0)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {template.usage_count || 0} uses
                          </span>
                          <Badge className={categoryConfig?.color}>
                            {categoryConfig?.name}
                          </Badge>
                          <Badge className={getComplexityColor(template.complexity || 0)}>
                            {getComplexityLabel(template.complexity || 0)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(template)}
                      >
                        {isFavorited ? (
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        ) : (
                          <HeartOff className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Use
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTemplate(template)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                            <Play className="h-4 w-4 mr-2" />
                            Use Template
                          </DropdownMenuItem>
                          {canManageTemplates && !template.is_system && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Template
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setShowDeleteConfirm(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Template
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderCategories = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {TEMPLATE_CATEGORIES.map((category) => {
        const CategoryIcon = category.icon;
        const count = templateStats?.categories[category.id] || 0;
        
        return (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all ${
                selectedCategory === category.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-500">{count} template{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {renderHeader()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          {renderStatsCards()}
          {renderFilters()}
          
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or filters to find templates.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {renderCategories()}
          {selectedCategory !== 'all' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                {TEMPLATE_CATEGORIES.find(cat => cat.id === selectedCategory)?.name} Templates
              </h3>
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {favoriteTemplates.size === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-600">
                  Click the heart icon on templates to add them to your favorites.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Details Dialog */}
      <Dialog open={showTemplateDetails} onOpenChange={setShowTemplateDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedTemplate && (
                <>
                  {React.createElement(
                    TEMPLATE_CATEGORIES.find(cat => cat.id === selectedTemplate.category)?.icon || Settings,
                    { className: "h-5 w-5" }
                  )}
                  <span>{selectedTemplate.name}</span>
                  {selectedTemplate.is_featured && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">Category</Label>
                  <div className="mt-1">
                    <Badge className={TEMPLATE_CATEGORIES.find(cat => cat.id === selectedTemplate.category)?.color}>
                      {TEMPLATE_CATEGORIES.find(cat => cat.id === selectedTemplate.category)?.name}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Complexity</Label>
                  <div className="mt-1">
                    <Badge className={getComplexityColor(selectedTemplate.complexity || 0)}>
                      {getComplexityLabel(selectedTemplate.complexity || 0)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Popularity</Label>
                  <div className="flex items-center space-x-1 mt-1">
                    {getPopularityStars(selectedTemplate.popularity || 0)}
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedTemplate.popularity}/100
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Usage Count</Label>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedTemplate.usage_count || 0} times used
                  </div>
                </div>
              </div>

              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div>
                  <Label className="font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="font-medium">Expression</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <code className="text-sm">{selectedTemplate.expression}</code>
                </div>
              </div>

              {selectedTemplate.metadata?.examples && (
                <div>
                  <Label className="font-medium">Usage Examples</Label>
                  <div className="mt-2 space-y-1">
                    {selectedTemplate.metadata.examples.map((example, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="font-medium">Variables Used</Label>
                  <div className="mt-2 space-y-1">
                    {selectedTemplate.metadata?.variables?.map((variable) => (
                      <code key={variable} className="text-xs bg-gray-100 px-2 py-1 rounded block">
                        {variable}
                      </code>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Functions Used</Label>
                  <div className="mt-2 space-y-1">
                    {selectedTemplate.metadata?.functions?.map((func) => (
                      <code key={func} className="text-xs bg-blue-100 px-2 py-1 rounded block">
                        {func}()
                      </code>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Dependencies</Label>
                  <div className="mt-2 space-y-1">
                    {selectedTemplate.metadata?.dependencies?.map((dep) => (
                      <Badge key={dep} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDetails(false)}>
              Close
            </Button>
            {selectedTemplate && (
              <Button onClick={() => handleUseTemplate(selectedTemplate)}>
                <Play className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ConditionTemplates;