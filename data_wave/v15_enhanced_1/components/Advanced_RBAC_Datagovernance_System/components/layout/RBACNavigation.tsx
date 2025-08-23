// RBACNavigation.tsx - Enterprise-grade RBAC navigation component
// Provides advanced navigation with dynamic permissions, intelligent search, and modern UI/UX

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Users, Database, Activity, Eye, Lock, Unlock, Settings, Search, ChevronDown, ChevronRight, Home, FolderOpen, FileText, BarChart3, Globe, Zap, Bell, Star, Heart, Bookmark, Clock, Calendar, Mail, Phone, MapPin, User, UserPlus, UserCheck, UserX, Group, Building, Briefcase, CreditCard, ShoppingCart, Package, Truck, Archive, Download, Upload, Share, Link, Copy, Edit, Trash2, Plus, Minus, X, Check, AlertCircle, Info, HelpCircle, ExternalLink, Maximize, Minimize, RefreshCw, RotateCw, Filter, SortAsc, SortDesc, Grid, List, Layers, Tag, Flag, Inbox, Send, FileCode, Terminal, Cpu, HardDrive, Monitor, Smartphone, Tablet, Wifi, Bluetooth, Camera, Mic, Volume2, VolumeX, Play, Pause, Square, SkipBack, SkipForward, Repeat, Shuffle, ThumbsUp, ThumbsDown, MessageCircle, MessageSquare, AtSign, Hash, Percent, DollarSign, PoundSterling, Euro, Yen, Bitcoin, TrendingUp, TrendingDown, PieChart, LineChart, AreaChart, Navigation, Compass, Map, Route, Car, Bus, Train, Plane, Ship, Anchor, Umbrella, Sun, Moon, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, Thermometer, Droplets, Eye as EyeIcon, EyeOff, Palette, Brush, Scissors, Ruler, PenTool, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, Code, Quote, Heading, Paragraph, List as ListIcon, Indent, Outdent, Image, Video, Music, Headphones, Mic2, Radio, Tv, Monitor as MonitorIcon, Projector, Gamepad2, Joystick, Dices, Puzzle, Target, Award, Trophy, Medal, Gift, PartyPopper, Cake, Coffee, Wine, Utensils, ChefHat, Apple, Cherry, Grape, Banana, Carrot, Leaf, TreePine, Flower, FlowerIcon as Flower2, Sprout, Seedling, Bug, Butterfly, Bird, Cat, Dog, Fish, Rabbit, Turtle, Bear, Lion, Tiger, Wolf, Fox, Squirrel, Owl, Eagle, Dove, Feather, Paw, Bone, Crown, Gem, Diamond, Sparkles, Wand2, MagicWand, Crystal, Zap as ZapIcon, Lightning, Flame, Snowflake, Droplet, CloudIcon as Cloud, Rainbow, Sunset, Sunrise, MoonIcon as MoonIcon2, Stars, Planet, Rocket, Satellite, Microscope, FlaskConical, TestTube, Dna, Atom, Magnet, Battery, BatteryLow, Plug, Power, Lightbulb, Flashlight, Candle, Lamp, LampDesk, Sofa, Bed, Bath, Toilet, Shower, Washing, Refrigerator, Microwave, Oven, Toaster, Blender, Scale, Wrench, Hammer, Screwdriver, Drill, Saw, Pliers, Scissors as ScissorsIcon, Paperclip, Pin, Pushpin, Thumbtack, Stapler, Tape, Glue, Eraser, Pencil, Pen, Marker, Highlighter, Crayon, Paintbrush, PaintBucket, Palette as PaletteIcon, Easel, Frame, Picture, Gallery, Museum, Library, Book, BookOpen, Notebook, Journal, Newspaper, Magazine, Scroll, FileIcon, Folder, FolderIcon, Archive as ArchiveIcon, Box, Package2, Container, Crate, Basket, ShoppingBag, Handbag, Backpack, Luggage, Briefcase as BriefcaseIcon, HardHat, Glasses, Sunglasses, Watch, Clock as ClockIcon, Timer, Stopwatch, Hourglass, Calendar as CalendarIcon, CalendarDays, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, CalendarRange, CalendarClock, CalendarHeart, Alarm, AlarmCheck, AlarmClock, Bell as BellIcon, BellRing, BellOff, Siren, Volume, VolumeIcon, Speaker, Headset, MicIcon, MicOff, Radio as RadioIcon, Signal, SignalHigh, SignalLow, SignalZero, WifiOff, WifiIcon, Bluetooth as BluetoothIcon, BluetoothConnected, BluetoothSearching, Nfc, Smartphone as SmartphoneIcon, TabletIcon, Laptop, Desktop, MonitorSpeaker, Keyboard, Mouse, MousePointer, MousePointer2, Touchpad, Fingerprint, Scan, QrCode, Barcode, CreditCardIcon, Banknote, Coins, Wallet, PiggyBank, Safe, Vault, Calculator, Abacus, Scale as ScaleIcon, Ruler as RulerIcon, Gauge, Speedometer, Tachometer, Fuel, BatteryCharging, PlugZap, Plug2, Cable, Usb, Ethernet, Router, Server, Database as DatabaseIcon, HardDriveIcon, SsdIcon, MemoryStick, Disc, Disc2, Disc3, Save, FolderPlus, FolderMinus, FolderX, FolderCheck, FolderOpen as FolderOpenIcon, FolderClosed, FolderArchive, FolderSync, FolderKey, FolderLock, FolderHeart, FolderStar, FolderTree, FolderRoot, FolderInput, FolderOutput, FolderUp, FolderDown, FilePlus, FileMinus, FileX, FileCheck, FileSearch, FileClock, FileHeart, FileStar, FileKey, FileLock, FileInput, FileOutput, FileUp, FileDown, FileEdit, FileType, FileType2, FileImage, FileVideo, FileAudio, FileMusic, FileText as FileTextIcon, FileCode as FileCodeIcon, FileSpreadsheet, FileJson, FileDigit, FileBadge, FileBadge2, FileBarChart, FileBarChart2, FilePieChart, FileLineChart, FileAreaChart, FileSliders, FileQuestion, FileWarning, FileX2, FileCheck2, FileCog, FileKey2, FileLock2, FileHeart2, FileStar2, FileSearch2, FileClock2, FileEdit2, FileEdit3, FileSignature, FilePenLine, FilePen, FileTerminal, FileCode2, FileSpreadsheet2, FileJson2, FileDigit2, FileBadge3, FileBarChart3, FilePieChart2, FileLineChart2, FileAreaChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, Skeleton } from '../shared/LoadingStates';

// Navigation item interfaces
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'warning' | 'success';
  
  // Permissions and visibility
  permission?: string;
  requiredRole?: string;
  hidden?: boolean;
  disabled?: boolean;
  
  // Hierarchy
  children?: NavigationItem[];
  parent?: string;
  order?: number;
  
  // Behavior
  external?: boolean;
  onClick?: () => void;
  exact?: boolean; // For route matching
  
  // Appearance
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  showInMobile?: boolean;
  showInDesktop?: boolean;
  
  // Metadata
  description?: string;
  tooltip?: string;
  keywords?: string[]; // For search
  category?: string;
  tags?: string[];
  
  // State
  isNew?: boolean;
  isBeta?: boolean;
  isDeprecated?: boolean;
  lastAccessed?: Date;
  accessCount?: number;
  
  // Custom properties
  customData?: Record<string, any>;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
  collapsed?: boolean;
  icon?: React.ReactNode;
  permission?: string;
  order?: number;
  description?: string;
}

export interface NavigationConfig {
  // Layout
  width: number;
  minWidth: number;
  maxWidth: number;
  collapsible: boolean;
  position: 'left' | 'right';
  
  // Behavior
  persistState: boolean;
  autoCollapse: boolean;
  showSearch: boolean;
  showRecentItems: boolean;
  showFavorites: boolean;
  searchPlaceholder: string;
  
  // Appearance
  showGroupLabels: boolean;
  showIcons: boolean;
  showBadges: boolean;
  showTooltips: boolean;
  compactMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  
  // Performance
  virtualizedThreshold: number;
  preloadRoutes: boolean;
  lazy: boolean;
  
  // Analytics
  trackNavigation: boolean;
  trackSearch: boolean;
  trackUsage: boolean;
}

export interface RBACNavigationProps {
  config?: Partial<NavigationConfig>;
  className?: string;
  variant?: 'default' | 'minimal' | 'compact';
  onNavigate?: (item: NavigationItem) => void;
  onCollapse?: (collapsed: boolean) => void;
  customItems?: NavigationItem[];
  hideGroups?: string[];
  showOnlyGroups?: string[];
}

// Navigation search interface
interface NavigationSearchProps {
  items: NavigationItem[];
  onSelect: (item: NavigationItem) => void;
  placeholder?: string;
  className?: string;
}

// Recent items interface
interface RecentItem {
  item: NavigationItem;
  timestamp: Date;
  count: number;
}

// Favorites interface
interface FavoriteItem {
  item: NavigationItem;
  addedAt: Date;
  category?: string;
}

// Custom hooks for navigation state
const useNavigationState = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('rbac-navigation-state');
      if (savedState) {
        const state = JSON.parse(savedState);
        setCollapsed(state.collapsed || false);
        setExpandedGroups(new Set(state.expandedGroups || []));
        setRecentItems(state.recentItems || []);
        setFavoriteItems(state.favoriteItems || []);
      }
    } catch (error) {
      console.error('Failed to load navigation state:', error);
    }
  }, []);

  // Save state to localStorage
  const saveState = useCallback(() => {
    try {
      const state = {
        collapsed,
        expandedGroups: Array.from(expandedGroups),
        recentItems: recentItems.slice(0, 10), // Keep only last 10
        favoriteItems
      };
      localStorage.setItem('rbac-navigation-state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  }, [collapsed, expandedGroups, recentItems, favoriteItems]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  // Add recent item
  const addRecentItem = useCallback((item: NavigationItem) => {
    setRecentItems(prev => {
      const existing = prev.find(recent => recent.item.id === item.id);
      if (existing) {
        return prev.map(recent =>
          recent.item.id === item.id
            ? { ...recent, timestamp: new Date(), count: recent.count + 1 }
            : recent
        );
      } else {
        return [
          { item, timestamp: new Date(), count: 1 },
          ...prev.slice(0, 9)
        ];
      }
    });
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((item: NavigationItem) => {
    setFavoriteItems(prev => {
      const existing = prev.find(fav => fav.item.id === item.id);
      if (existing) {
        return prev.filter(fav => fav.item.id !== item.id);
      } else {
        return [...prev, { item, addedAt: new Date() }];
      }
    });
  }, []);

  // Check if item is favorite
  const isFavorite = useCallback((itemId: string) => {
    return favoriteItems.some(fav => fav.item.id === itemId);
  }, [favoriteItems]);

  return {
    collapsed,
    setCollapsed,
    searchTerm,
    setSearchTerm,
    expandedGroups,
    setExpandedGroups,
    recentItems,
    favoriteItems,
    selectedItem,
    setSelectedItem,
    addRecentItem,
    toggleFavorite,
    isFavorite
  };
};

// Default navigation configuration
const defaultNavigationConfig: NavigationConfig = {
  width: 280,
  minWidth: 200,
  maxWidth: 400,
  collapsible: true,
  position: 'left',
  persistState: true,
  autoCollapse: false,
  showSearch: true,
  showRecentItems: true,
  showFavorites: true,
  searchPlaceholder: 'Search navigation...',
  showGroupLabels: true,
  showIcons: true,
  showBadges: true,
  showTooltips: true,
  compactMode: false,
  theme: 'auto',
  virtualizedThreshold: 100,
  preloadRoutes: true,
  lazy: false,
  trackNavigation: true,
  trackSearch: true,
  trackUsage: true
};

// Default navigation items based on RBAC groups
const getDefaultNavigationItems = (): NavigationGroup[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-4 h-4" />,
    order: 1,
    items: [
      {
        id: 'overview',
        label: 'Overview',
        href: '/rbac',
        icon: <BarChart3 className="w-4 h-4" />,
        description: 'System overview and metrics'
      },
      {
        id: 'activity',
        label: 'Activity Feed',
        href: '/rbac/activity',
        icon: <Activity className="w-4 h-4" />,
        description: 'Recent system activity'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/rbac/analytics',
        icon: <PieChart className="w-4 h-4" />,
        permission: 'analytics:read',
        description: 'System analytics and insights'
      }
    ]
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: <Users className="w-4 h-4" />,
    permission: 'users:read',
    order: 2,
    items: [
      {
        id: 'users',
        label: 'Users',
        href: '/rbac/users',
        icon: <User className="w-4 h-4" />,
        permission: 'users:read',
        description: 'Manage system users'
      },
      {
        id: 'groups',
        label: 'Groups',
        href: '/rbac/groups',
        icon: <Group className="w-4 h-4" />,
        permission: 'groups:read',
        description: 'Manage user groups'
      },
      {
        id: 'invitations',
        label: 'Invitations',
        href: '/rbac/invitations',
        icon: <UserPlus className="w-4 h-4" />,
        permission: 'users:invite',
        badge: '2',
        badgeVariant: 'primary',
        description: 'Pending user invitations'
      }
    ]
  },
  {
    id: 'rbac-core',
    label: 'Access Control',
    icon: <Shield className="w-4 h-4" />,
    permission: 'rbac:read',
    order: 3,
    items: [
      {
        id: 'roles',
        label: 'Roles',
        href: '/rbac/roles',
        icon: <Lock className="w-4 h-4" />,
        permission: 'roles:read',
        description: 'Manage system roles'
      },
      {
        id: 'permissions',
        label: 'Permissions',
        href: '/rbac/permissions',
        icon: <Key className="w-4 h-4" />,
        permission: 'permissions:read',
        description: 'Manage permissions'
      },
      {
        id: 'resources',
        label: 'Resources',
        href: '/rbac/resources',
        icon: <Database className="w-4 h-4" />,
        permission: 'resources:read',
        description: 'Manage protected resources'
      },
      {
        id: 'access-requests',
        label: 'Access Requests',
        href: '/rbac/access-requests',
        icon: <UserCheck className="w-4 h-4" />,
        permission: 'access_requests:read',
        badge: '5',
        badgeVariant: 'warning',
        description: 'Pending access requests'
      }
    ]
  },
  {
    id: 'data-governance',
    label: 'Data Governance',
    icon: <Database className="w-4 h-4" />,
    permission: 'data_governance:read',
    order: 4,
    items: [
      {
        id: 'data-sources',
        label: 'Data Sources',
        href: '/data-sources',
        icon: <Database className="w-4 h-4" />,
        permission: 'data_sources:read',
        description: 'Manage data sources'
      },
      {
        id: 'catalog',
        label: 'Data Catalog',
        href: '/catalog',
        icon: <FolderOpen className="w-4 h-4" />,
        permission: 'catalog:read',
        description: 'Browse data catalog'
      },
      {
        id: 'classifications',
        label: 'Classifications',
        href: '/classifications',
        icon: <Tag className="w-4 h-4" />,
        permission: 'classifications:read',
        description: 'Data classifications'
      },
      {
        id: 'compliance',
        label: 'Compliance Rules',
        href: '/compliance',
        icon: <FileText className="w-4 h-4" />,
        permission: 'compliance:read',
        description: 'Compliance rules and policies'
      },
      {
        id: 'scan-rules',
        label: 'Scan Rule Sets',
        href: '/scan-rule-sets',
        icon: <Search className="w-4 h-4" />,
        permission: 'scan_rules:read',
        description: 'Data scanning rule sets'
      },
      {
        id: 'scan-logic',
        label: 'Scan Logic',
        href: '/scan-logic',
        icon: <Zap className="w-4 h-4" />,
        permission: 'scan_logic:read',
        description: 'Advanced scan logic'
      }
    ]
  },
  {
    id: 'monitoring',
    label: 'Monitoring & Audit',
    icon: <Eye className="w-4 h-4" />,
    permission: 'audit:read',
    order: 5,
    items: [
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        href: '/rbac/audit',
        icon: <FileText className="w-4 h-4" />,
        permission: 'audit:read',
        description: 'System audit logs'
      },
      {
        id: 'sessions',
        label: 'User Sessions',
        href: '/rbac/sessions',
        icon: <Clock className="w-4 h-4" />,
        permission: 'sessions:read',
        description: 'Active user sessions'
      },
      {
        id: 'security-events',
        label: 'Security Events',
        href: '/rbac/security',
        icon: <AlertCircle className="w-4 h-4" />,
        permission: 'security:read',
        badge: '3',
        badgeVariant: 'destructive',
        description: 'Security events and alerts'
      }
    ]
  },
  {
    id: 'system',
    label: 'System',
    icon: <Settings className="w-4 h-4" />,
    permission: 'system:read',
    order: 6,
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/rbac/settings',
        icon: <Settings className="w-4 h-4" />,
        permission: 'settings:read',
        description: 'System settings'
      },
      {
        id: 'integrations',
        label: 'Integrations',
        href: '/rbac/integrations',
        icon: <Plug className="w-4 h-4" />,
        permission: 'integrations:read',
        description: 'External integrations'
      },
      {
        id: 'backup',
        label: 'Backup & Recovery',
        href: '/rbac/backup',
        icon: <Archive className="w-4 h-4" />,
        permission: 'backup:read',
        description: 'System backup and recovery'
      },
      {
        id: 'health',
        label: 'System Health',
        href: '/rbac/health',
        icon: <Activity className="w-4 h-4" />,
        permission: 'health:read',
        description: 'System health monitoring'
      }
    ]
  }
];

// Navigation search component
const NavigationSearch: React.FC<NavigationSearchProps> = ({
  items,
  onSelect,
  placeholder = 'Search...',
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const results: NavigationItem[] = [];

    const searchInItems = (itemList: NavigationItem[], parentPath = '') => {
      itemList.forEach(item => {
        const fullPath = parentPath ? `${parentPath} > ${item.label}` : item.label;
        const searchableText = [
          item.label,
          item.description,
          ...(item.keywords || []),
          ...(item.tags || []),
          fullPath
        ].filter(Boolean).join(' ').toLowerCase();

        if (searchableText.includes(term)) {
          results.push({
            ...item,
            label: fullPath
          });
        }

        if (item.children) {
          searchInItems(item.children, fullPath);
        }
      });
    };

    searchInItems(items);
    return results.slice(0, 10); // Limit results
  }, [searchTerm, items]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex]);
            setIsOpen(false);
            setSearchTerm('');
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onSelect]);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-md bg-background/50 backdrop-blur-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredItems.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {filteredItems.map((item, index) => (
              <motion.button
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent transition-colors duration-150',
                  selectedIndex === index && 'bg-accent'
                )}
              >
                {item.icon}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.badge && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    item.badgeVariant === 'primary' && 'bg-primary text-primary-foreground',
                    item.badgeVariant === 'secondary' && 'bg-secondary text-secondary-foreground',
                    item.badgeVariant === 'destructive' && 'bg-destructive text-destructive-foreground',
                    item.badgeVariant === 'warning' && 'bg-yellow-500 text-white',
                    item.badgeVariant === 'success' && 'bg-green-500 text-white',
                    (!item.badgeVariant || item.badgeVariant === 'default') && 'bg-muted text-muted-foreground'
                  )}>
                    {item.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Navigation item component
interface NavigationItemComponentProps {
  item: NavigationItem;
  level?: number;
  isActive?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onNavigate?: (item: NavigationItem) => void;
  onToggleFavorite?: (item: NavigationItem) => void;
  isFavorite?: boolean;
  config: NavigationConfig;
  showTooltip?: boolean;
}

const NavigationItemComponent: React.FC<NavigationItemComponentProps> = ({
  item,
  level = 0,
  isActive = false,
  isExpanded = false,
  onToggle,
  onNavigate,
  onToggleFavorite,
  isFavorite = false,
  config,
  showTooltip = true
}) => {
  const { hasPermission } = usePermissionCheck();
  const [isHovered, setIsHovered] = useState(false);

  // Check permissions
  if (item.permission && !hasPermission(item.permission)) {
    return null;
  }

  if (item.hidden || item.disabled) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = `${0.75 + level * 1.5}rem`;

  const handleClick = () => {
    if (hasChildren && onToggle) {
      onToggle();
    } else if (onNavigate) {
      onNavigate(item);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(item);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2 mx-2 text-sm rounded-lg cursor-pointer transition-all duration-200',
          isActive && 'bg-primary text-primary-foreground shadow-md',
          !isActive && 'hover:bg-accent hover:text-accent-foreground',
          config.compactMode && 'py-1.5 text-xs'
        )}
        style={{ paddingLeft }}
        onClick={handleClick}
        title={showTooltip ? item.tooltip || item.description : undefined}
      >
        {/* Icon */}
        {config.showIcons && item.icon && (
          <div className={cn(
            'flex-shrink-0 transition-transform duration-200',
            isActive && 'scale-110',
            config.compactMode && 'w-3 h-3'
          )}>
            {item.icon}
          </div>
        )}

        {/* Label */}
        <span className="flex-1 font-medium truncate">
          {item.label}
        </span>

        {/* Badges and indicators */}
        <div className="flex items-center gap-1">
          {/* New indicator */}
          {item.isNew && (
            <span className="px-1.5 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full">
              NEW
            </span>
          )}

          {/* Beta indicator */}
          {item.isBeta && (
            <span className="px-1.5 py-0.5 text-xs font-semibold bg-orange-500 text-white rounded-full">
              BETA
            </span>
          )}

          {/* Badge */}
          {config.showBadges && item.badge && (
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              item.badgeVariant === 'primary' && 'bg-primary text-primary-foreground',
              item.badgeVariant === 'secondary' && 'bg-secondary text-secondary-foreground',
              item.badgeVariant === 'destructive' && 'bg-destructive text-destructive-foreground',
              item.badgeVariant === 'warning' && 'bg-yellow-500 text-white',
              item.badgeVariant === 'success' && 'bg-green-500 text-white',
              (!item.badgeVariant || item.badgeVariant === 'default') && 'bg-muted text-muted-foreground'
            )}>
              {item.badge}
            </span>
          )}

          {/* Favorite button */}
          {isHovered && onToggleFavorite && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={cn(
                'p-1 rounded transition-colors duration-150',
                isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Star className={cn('w-3 h-3', isFavorite && 'fill-current')} />
            </motion.button>
          )}

          {/* Expand/collapse button for items with children */}
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}

          {/* External link indicator */}
          {item.external && (
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {item.children!.map((child) => (
              <NavigationItemComponent
                key={child.id}
                item={child}
                level={level + 1}
                isActive={false} // TODO: Implement active state for children
                onNavigate={onNavigate}
                onToggleFavorite={onToggleFavorite}
                isFavorite={false} // TODO: Check if child is favorite
                config={config}
                showTooltip={showTooltip}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Navigation group component
interface NavigationGroupComponentProps {
  group: NavigationGroup;
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onNavigate?: (item: NavigationItem) => void;
  onToggleFavorite?: (item: NavigationItem) => void;
  favoriteItems: FavoriteItem[];
  config: NavigationConfig;
}

const NavigationGroupComponent: React.FC<NavigationGroupComponentProps> = ({
  group,
  expandedGroups,
  onToggleGroup,
  onNavigate,
  onToggleFavorite,
  favoriteItems,
  config
}) => {
  const { hasPermission } = usePermissionCheck();
  const isExpanded = expandedGroups.has(group.id);

  // Check permissions
  if (group.permission && !hasPermission(group.permission)) {
    return null;
  }

  // Filter items based on permissions
  const visibleItems = group.items.filter(item => {
    if (item.permission && !hasPermission(item.permission)) return false;
    if (item.hidden) return false;
    return true;
  });

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      {/* Group header */}
      {config.showGroupLabels && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onToggleGroup(group.id)}
          className="w-full flex items-center gap-3 px-3 py-2 mx-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors duration-200"
        >
          {group.icon && (
            <div className="flex-shrink-0">
              {group.icon}
            </div>
          )}
          <span className="flex-1 text-left">{group.label}</span>
          {group.collapsible !== false && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-3 h-3" />
            </motion.div>
          )}
        </motion.button>
      )}

      {/* Group items */}
      <AnimatePresence>
        {(isExpanded || group.collapsible === false) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {visibleItems.map((item) => {
              const isFavorite = favoriteItems.some(fav => fav.item.id === item.id);
              return (
                <NavigationItemComponent
                  key={item.id}
                  item={item}
                  level={0}
                  isActive={false} // TODO: Implement active state
                  onNavigate={onNavigate}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={isFavorite}
                  config={config}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main RBAC Navigation component
export const RBACNavigation: React.FC<RBACNavigationProps> = ({
  config: userConfig = {},
  className,
  variant = 'default',
  onNavigate,
  onCollapse,
  customItems = [],
  hideGroups = [],
  showOnlyGroups = []
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading } = useCurrentUser();
  const { hasPermission } = usePermissionCheck();

  // Merge configurations
  const config = useMemo(() => ({
    ...defaultNavigationConfig,
    ...userConfig
  }), [userConfig]);

  // Navigation state
  const {
    collapsed,
    setCollapsed,
    searchTerm,
    setSearchTerm,
    expandedGroups,
    setExpandedGroups,
    recentItems,
    favoriteItems,
    selectedItem,
    setSelectedItem,
    addRecentItem,
    toggleFavorite,
    isFavorite
  } = useNavigationState();

  // Get navigation groups
  const navigationGroups = useMemo(() => {
    let groups = getDefaultNavigationItems();

    // Add custom items
    if (customItems.length > 0) {
      groups.push({
        id: 'custom',
        label: 'Custom',
        items: customItems
      });
    }

    // Filter groups
    if (showOnlyGroups.length > 0) {
      groups = groups.filter(group => showOnlyGroups.includes(group.id));
    } else if (hideGroups.length > 0) {
      groups = groups.filter(group => !hideGroups.includes(group.id));
    }

    // Sort by order
    groups.sort((a, b) => (a.order || 0) - (b.order || 0));

    return groups;
  }, [customItems, hideGroups, showOnlyGroups]);

  // Flatten all items for search
  const allItems = useMemo(() => {
    const items: NavigationItem[] = [];
    const flattenItems = (itemList: NavigationItem[]) => {
      itemList.forEach(item => {
        items.push(item);
        if (item.children) {
          flattenItems(item.children);
        }
      });
    };

    navigationGroups.forEach(group => {
      flattenItems(group.items);
    });

    return items;
  }, [navigationGroups]);

  // Handle navigation
  const handleNavigate = useCallback((item: NavigationItem) => {
    if (item.disabled) return;

    // Add to recent items
    addRecentItem(item);

    // Call custom handler
    if (onNavigate) {
      onNavigate(item);
    }

    // Handle navigation
    if (item.href) {
      if (item.external) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(item.href);
      }
    } else if (item.onClick) {
      item.onClick();
    }

    // Update selected item
    setSelectedItem(item.id);
  }, [addRecentItem, onNavigate, router, setSelectedItem]);

  // Handle group toggle
  const handleToggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, [setExpandedGroups]);

  // Handle collapse toggle
  const handleCollapseToggle = useCallback(() => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  }, [collapsed, setCollapsed, onCollapse]);

  // Initialize expanded groups
  useEffect(() => {
    if (expandedGroups.size === 0) {
      const defaultExpanded = navigationGroups
        .filter(group => group.collapsible !== false)
        .map(group => group.id);
      setExpandedGroups(new Set(defaultExpanded));
    }
  }, [navigationGroups, expandedGroups.size, setExpandedGroups]);

  if (isLoading) {
    return (
      <div className={cn('flex flex-col space-y-4 p-4', className)}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  }

  return (
    <motion.nav
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col h-full bg-background border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : `w-[${config.width}px]`,
        variant === 'minimal' && 'border-none shadow-none',
        variant === 'compact' && 'text-sm',
        className
      )}
      style={{
        width: collapsed ? 64 : config.width,
        minWidth: collapsed ? 64 : config.minWidth,
        maxWidth: collapsed ? 64 : config.maxWidth
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">RBAC System</span>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCollapseToggle}
          className="p-2 rounded-lg hover:bg-accent transition-colors duration-150"
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <Menu className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Search */}
      {!collapsed && config.showSearch && (
        <div className="p-4 border-b border-border">
          <NavigationSearch
            items={allItems}
            onSelect={handleNavigate}
            placeholder={config.searchPlaceholder}
          />
        </div>
      )}

      {/* Recent Items */}
      {!collapsed && config.showRecentItems && recentItems.length > 0 && (
        <div className="px-4 py-2 border-b border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Recent
          </h4>
          <div className="space-y-1">
            {recentItems.slice(0, 3).map((recent) => (
              <NavigationItemComponent
                key={`recent-${recent.item.id}`}
                item={recent.item}
                level={0}
                onNavigate={handleNavigate}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(recent.item.id)}
                config={config}
                showTooltip={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Favorites */}
      {!collapsed && config.showFavorites && favoriteItems.length > 0 && (
        <div className="px-4 py-2 border-b border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Favorites
          </h4>
          <div className="space-y-1">
            {favoriteItems.slice(0, 5).map((favorite) => (
              <NavigationItemComponent
                key={`favorite-${favorite.item.id}`}
                item={favorite.item}
                level={0}
                onNavigate={handleNavigate}
                onToggleFavorite={toggleFavorite}
                isFavorite={true}
                config={config}
                showTooltip={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-4">
          {navigationGroups.map((group) => (
            <NavigationGroupComponent
              key={group.id}
              group={group}
              expandedGroups={expandedGroups}
              onToggleGroup={handleToggleGroup}
              onNavigate={handleNavigate}
              onToggleFavorite={toggleFavorite}
              favoriteItems={favoriteItems}
              config={config}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 border-t border-border"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">
                {currentUser?.username || 'User'}
              </div>
              <div className="text-xs truncate">
                {currentUser?.email || 'user@example.com'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default RBACNavigation;