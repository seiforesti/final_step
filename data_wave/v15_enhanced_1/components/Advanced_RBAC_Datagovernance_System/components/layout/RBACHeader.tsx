// RBACHeader.tsx - Enterprise-grade RBAC header component
// Provides user context, notifications, search, settings, and advanced navigation features

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Monitor,
  Globe,
  HelpCircle,
  MessageCircle,
  Bookmark,
  Star,
  Clock,
  Activity,
  Eye,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  Users,
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share,
  Download,
  Upload,
  Maximize,
  Minimize,
  RefreshCw,
  RotateCw,
  Zap,
  Target,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Flag,
  Archive,
  Folder,
  File,
  Image,
  Video,
  Music,
  Code,
  Terminal,
  Palette,
  Brush,
  Type,
  Layout,
  Grid,
  List,
  Layers,
  Package,
  Truck,
  Plane,
  Car,
  Home,
  Building,
  Factory,
  Store,
  Hospital,
  School,
  Library,
  Museum,
  Park,
  Beach,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Sun as SunIcon,
  Moon as MoonIcon,
  Star as StarIcon,
  Heart,
  Smile,
  ThumbsUp,
  Award,
  Trophy,
  Medal,
  Gift,
  Coffee,
  Pizza,
  Gamepad2,
  Music2,
  Headphones,
  Camera,
  Smartphone,
  Laptop,
  Monitor as MonitorIcon,
  Tv,
  Radio,
  Wifi,
  Bluetooth,
  Battery,
  Plug,
  Lightbulb,
  Flashlight,
  Candle,
  Flame,
  Droplet,
  Cloud,
  Rainbow,
  Snowflake,
  Wind,
  Umbrella,
  Thermometer,
  Compass,
  Map,
  Route,
  Navigation,
  Anchor,
  Ship,
  Train,
  Bus,
  Bike,
  Rocket,
  Satellite,
  Earth,
  Planet,
  Galaxy,
  Telescope,
  Microscope,
  Atom,
  Dna,
  FlaskConical,
  TestTube,
  Pill,
  Stethoscope,
  Syringe,
  Bandage,
  FirstAid,
  CrossIcon,
  ShieldIcon,
  SwordIcon,
  BowIcon,
  ZapIcon,
  FireIcon,
  IceIcon,
  LeafIcon,
  RockIcon,
  WaterIcon,
  AirIcon,
  EarthIcon,
  LightIcon,
  DarkIcon,
  MagicIcon,
  SpellIcon,
  PotionIcon,
  ScrollIcon,
  BookIcon,
  LibraryIcon,
  ArchiveIcon,
  FolderIcon,
  FileIcon,
  DocumentIcon,
  PaperIcon,
  NoteIcon,
  PenIcon,
  PencilIcon,
  MarkerIcon,
  HighlighterIcon,
  EraserIcon,
  RulerIcon,
  ScissorsIcon,
  GlueIcon,
  TapeIcon,
  PinIcon,
  ClipIcon,
  StapleIcon,
  HoleIcon,
  CutIcon,
  PasteIcon,
  UndoIcon,
  RedoIcon,
  SaveIcon,
  LoadIcon,
  ImportIcon,
  ExportIcon,
  PrintIcon,
  ScanIcon,
  FaxIcon,
  EmailIcon,
  PhoneIcon,
  MessageIcon,
  ChatIcon,
  VideoIcon,
  CallIcon,
  ContactIcon,
  AddressIcon,
  LocationIcon,
  DirectionIcon,
  DistanceIcon,
  SpeedIcon,
  TimeIcon,
  DateIcon,
  ClockIcon,
  TimerIcon,
  AlarmIcon,
  StopwatchIcon,
  HourglassIcon,
  CalendarIcon,
  ScheduleIcon,
  EventIcon,
  TaskIcon,
  TodoIcon,
  CheckIcon,
  UncheckIcon,
  CompleteIcon,
  IncompleteIcon,
  ProgressIcon,
  StatusIcon,
  LevelIcon,
  RankIcon,
  ScoreIcon,
  PointIcon,
  CoinIcon,
  DollarIcon,
  EuroIcon,
  PoundIcon,
  YenIcon,
  BitcoinIcon,
  MoneyIcon,
  WalletIcon,
  CardIcon,
  PaymentIcon,
  PurchaseIcon,
  SaleIcon,
  DiscountIcon,
  CouponIcon,
  VoucherIcon,
  TicketIcon,
  PassIcon,
  BadgeIcon,
  CertificateIcon,
  DiplomaIcon,
  LicenseIcon,
  PermitIcon,
  ApprovalIcon,
  RejectIcon,
  PendingIcon,
  WaitingIcon,
  LoadingIcon,
  ProcessingIcon,
  UploadingIcon,
  DownloadingIcon,
  SyncingIcon,
  ConnectingIcon,
  DisconnectedIcon,
  OnlineIcon,
  OfflineIcon,
  AvailableIcon,
  BusyIcon,
  AwayIcon,
  IdleIcon,
  ActiveIcon,
  InactiveIcon,
  EnabledIcon,
  DisabledIcon,
  VisibleIcon,
  HiddenIcon,
  PublicIcon,
  PrivateIcon,
  SecureIcon,
  UnsecureIcon,
  LockedIcon,
  UnlockedIcon,
  ProtectedIcon,
  UnprotectedIcon,
  EncryptedIcon,
  DecryptedIcon,
  SignedIcon,
  UnsignedIcon,
  VerifiedIcon,
  UnverifiedIcon,
  TrustedIcon,
  UntrustedIcon,
  ValidIcon,
  InvalidIcon,
  CorrectIcon,
  IncorrectIcon,
  AcceptedIcon,
  RejectedIcon,
  ApprovedIcon,
  DeniedIcon,
  AllowedIcon,
  BlockedIcon,
  PermittedIcon,
  ForbiddenIcon,
  AuthorizedIcon,
  UnauthorizedIcon,
  AuthenticatedIcon,
  UnauthenticatedIcon,
  LoggedInIcon,
  LoggedOutIcon,
  SignedInIcon,
  SignedOutIcon,
  RegisteredIcon,
  UnregisteredIcon,
  MemberIcon,
  NonMemberIcon,
  GuestIcon,
  HostIcon,
  AdminIcon,
  ModeratorIcon,
  UserIcon,
  OwnerIcon,
  CreatorIcon,
  EditorIcon,
  ViewerIcon,
  ContributorIcon,
  CollaboratorIcon,
  PartnerIcon,
  ClientIcon,
  CustomerIcon,
  SupplierIcon,
  VendorIcon,
  ProviderIcon,
  ServiceIcon,
  ProductIcon,
  CategoryIcon,
  BrandIcon,
  CompanyIcon,
  OrganizationIcon,
  TeamIcon,
  GroupIcon,
  DepartmentIcon,
  DivisionIcon,
  BranchIcon,
  OfficeIcon,
  HeadquartersIcon,
  LocationsIcon,
  SitesIcon,
  FacilitiesIcon,
  BuildingsIcon,
  RoomsIcon,
  FloorsIcon,
  AreasIcon,
  ZonesIcon,
  RegionsIcon,
  CountriesIcon,
  StatesIcon,
  CitiesIcon,
  StreetsIcon,
  AddressesIcon,
  CoordinatesIcon,
  LatitudeIcon,
  LongitudeIcon,
  ElevationIcon,
  AltitudeIcon,
  DepthIcon,
  WidthIcon,
  HeightIcon,
  LengthIcon,
  SizeIcon,
  WeightIcon,
  VolumeIcon,
  AreaIcon,
  PerimeterIcon,
  DiameterIcon,
  RadiusIcon,
  CircumferenceIcon,
  AngleIcon,
  DegreesIcon,
  RadiansIcon,
  PercentageIcon,
  FractionIcon,
  DecimalIcon,
  IntegerIcon,
  FloatIcon,
  NumberIcon,
  DigitIcon,
  CountIcon,
  QuantityIcon,
  AmountIcon,
  TotalIcon,
  SumIcon,
  AverageIcon,
  MedianIcon,
  ModeIcon,
  RangeIcon,
  MinimumIcon,
  MaximumIcon,
  VarianceIcon,
  DeviationIcon,
  DistributionIcon,
  ProbabilityIcon,
  StatisticsIcon,
  AnalyticsIcon,
  MetricsIcon,
  KPIIcon,
  DashboardIcon,
  ReportIcon,
  ChartIcon,
  GraphIcon,
  PlotIcon,
  DiagramIcon,
  FlowchartIcon,
  SchemaIcon,
  ModelIcon,
  FrameworkIcon,
  ArchitectureIcon,
  StructureIcon,
  LayoutIcon,
  DesignIcon,
  PatternIcon,
  TemplateIcon,
  ThemeIcon,
  StyleIcon,
  FormatIcon,
  AppearanceIcon,
  LookIcon,
  FeelIcon,
  ExperienceIcon,
  InterfaceIcon,
  InteractionIcon,
  UsabilityIcon,
  AccessibilityIcon,
  ResponsivenessIcon,
  PerformanceIcon,
  SpeedIcon2,
  EfficiencyIcon,
  OptimizationIcon,
  QualityIcon,
  ReliabilityIcon,
  StabilityIcon,
  DurabilityIcon,
  RobustnessIcon,
  ScalabilityIcon,
  FlexibilityIcon,
  AdaptabilityIcon,
  ExtensibilityIcon,
  ModularityIcon,
  ReusabilityIcon,
  MaintainabilityIcon,
  TestabilityIcon,
  DebuggabilityIcon,
  MonitorabilityIcon,
  ObservabilityIcon,
  TraceabilityIcon,
  AuditabilityIcon,
  ComplianceIcon,
  GovernanceIcon,
  PolicyIcon,
  RuleIcon,
  RegulationIcon,
  StandardIcon,
  GuidelineIcon,
  ProcedureIcon,
  ProcessIcon,
  WorkflowIcon,
  PipelineIcon,
  JobIcon,
  TasksIcon,
  StepsIcon,
  PhasesIcon,
  StagesIcon,
  MilestonesIcon,
  DeadlinesIcon,
  DueDatesIcon,
  RemindersIcon,
  NotificationsIcon,
  AlertsIcon,
  WarningsIcon,
  ErrorsIcon,
  IssuesIcon,
  ProblemsIcon,
  BugsIcon,
  DefectsIcon,
  FlawsIcon,
  FaultsIcon,
  FailuresIcon,
  CrashesIcon,
  OutagesIcon,
  DowntimeIcon,
  UptimeIcon,
  AvailabilityIcon2,
  RedundancyIcon,
  BackupIcon,
  RestoreIcon,
  RecoveryIcon,
  DisasterIcon,
  EmergencyIcon,
  CrisisIcon,
  IncidentIcon,
  AccidentIcon,
  EventsIcon,
  LogsIcon,
  RecordsIcon,
  HistoryIcon,
  TimelineIcon,
  ChronologyIcon,
  SequenceIcon,
  OrderIcon,
  PriorityIcon,
  ImportanceIcon,
  UrgencyIcon,
  CriticalIcon,
  HighIcon,
  MediumIcon,
  LowIcon,
  SeverityIcon,
  ImpactIcon,
  RiskIcon,
  ThreatIcon,
  VulnerabilityIcon,
  AttackIcon,
  DefenseIcon,
  ProtectionIcon,
  SecurityIcon2,
  SafetyIcon,
  PrivacyIcon2,
  ConfidentialityIcon,
  IntegrityIcon,
  AvailabilityIcon3,
  NonRepudiationIcon,
  AuthenticationIcon2,
  AuthorizationIcon2,
  AccountabilityIcon,
  TrustIcon,
  ReputationIcon,
  CredibilityIcon,
  ValidityIcon,
  AccuracyIcon,
  PrecisionIcon,
  CorrectnessIcon,
  CompletenessIcon,
  ConsistencyIcon,
  CoherenceIcon,
  ClarityIcon,
  SimplilictyIcon,
  ComplexityIcon,
  DifficultyIcon,
  EaseIcon,
  ConvenienceIcon,
  ComfortIcon,
  SatisfactionIcon,
  HappinessIcon,
  JoyIcon,
  PleasureIcon,
  EnjoymentIcon,
  FunIcon,
  EntertainmentIcon,
  AmusementIcon,
  RecreationIcon,
  LeisureIcon,
  RelaxationIcon,
  RestIcon,
  SleepIcon,
  DreamIcon,
  WakeIcon,
  AliveIcon,
  HealthIcon,
  WellnessIcon,
  FitnessIcon,
  StrengthIcon,
  PowerIcon,
  EnergyIcon,
  VitalityIcon,
  VigorIcon,
  EnduranceIcon,
  StaminaIcon,
  ResilienceIcon,
  CourageIcon,
  BraveryIcon,
  FearlessnessIcon,
  ConfidenceIcon,
  DeterminationIcon,
  PersistenceIcon,
  PatienceIcon,
  ToleranceIcon,
  UnderstandingIcon,
  EmpathyIcon,
  CompassionIcon,
  KindnessIcon,
  GenerosityIcon,
  CharityIcon,
  LoveIcon,
  AffectionIcon,
  CaringIcon,
  SupportIcon,
  HelpIcon,
  AssistanceIcon,
  ServiceIcon2,
  CooperationIcon,
  CollaborationIcon2,
  PartnershipIcon,
  TeamworkIcon,
  UnityIcon,
  HarmonyIcon,
  BalanceIcon,
  EquilibriumIcon,
  StabilityIcon2,
  OrderIcon2,
  OrganizationIcon2,
  StructureIcon2,
  SystemIcon,
  NetworkIcon,
  ConnectionIcon,
  RelationshipIcon,
  LinkIcon2,
  BondIcon,
  TieIcon,
  ChainIcon,
  BridgeIcon,
  PathIcon,
  RouteIcon2,
  JourneyIcon,
  TripIcon,
  TravelIcon,
  VoyageIcon,
  AdventureIcon,
  ExplorationIcon,
  DiscoveryIcon,
  FindingIcon,
  SearchingIcon,
  LookingIcon,
  SeeingIcon,
  WatchingIcon,
  ObservingIcon,
  MonitoringIcon2,
  TrackingIcon,
  FollowingIcon,
  ChasingIcon,
  HuntingIcon,
  CatchingIcon,
  CapturingIcon,
  GraspingIcon,
  HoldingIcon,
  KeepingIcon,
  StoringIcon,
  SavingIcon2,
  PreservingIcon,
  MaintainingIcon,
  SustainningIcon,
  ContinuingIcon,
  PersistingIcon,
  LastingIcon,
  EndurringIcon,
  SurvivingIcon,
  ThrivingIcon,
  FlourishingIcon,
  BloomingIcon,
  GrowingIcon,
  DevelopingIcon,
  EvolvingIcon,
  ProgressingIcon,
  AdvancingIcon,
  ImprovingIcon,
  EnhancingIcon,
  UpgradingIcon,
  ModernizingIcon,
  InnovatingIcon,
  CreatingIcon,
  BuildingIcon2,
  ConstructingIcon,
  FormingIcon,
  ShapingIcon,
  MoldingIcon,
  CraftingIcon,
  MakingIcon,
  ProducingIcon,
  ManufacturingIcon,
  GeneratingIcon,
  CreatingIcon2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useAuth } from '../../hooks/useAuth';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { LoadingSpinner } from '../shared/LoadingStates';

// Header configuration interfaces
export interface HeaderConfig {
  // Layout
  height: number;
  sticky: boolean;
  backdrop: boolean;
  
  // Visibility
  showSearch: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
  showBreadcrumbs: boolean;
  showQuickActions: boolean;
  showSystemStatus: boolean;
  
  // Behavior
  autoHideOnScroll: boolean;
  searchOnType: boolean;
  maxSearchResults: number;
  
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  variant: 'default' | 'minimal' | 'compact' | 'expanded';
  showBorder: boolean;
  showShadow: boolean;
  
  // Features
  enableShortcuts: boolean;
  enableTooltips: boolean;
  enableAnimations: boolean;
  enableRealTimeUpdates: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  userId?: number;
  metadata?: Record<string, any>;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  permission?: string;
  shortcut?: string;
  tooltip?: string;
  badge?: string | number;
  category?: string;
  order?: number;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface SystemStatus {
  id: string;
  label: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  lastChecked: Date;
  responseTime?: number;
  uptime?: number;
  icon?: React.ReactNode;
  details?: string;
}

export interface RBACHeaderProps {
  config?: Partial<HeaderConfig>;
  className?: string;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  customActions?: QuickAction[];
  breadcrumbs?: BreadcrumbItem[];
  hideElements?: string[];
  showOnlyElements?: string[];
}

// Search result interface
interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'page' | 'user' | 'role' | 'resource' | 'action';
  href?: string;
  icon?: React.ReactNode;
  category?: string;
  relevance?: number;
  lastAccessed?: Date;
  metadata?: Record<string, any>;
}

// User menu item interface
interface UserMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  separator?: boolean;
  disabled?: boolean;
  permission?: string;
  badge?: string | number;
  shortcut?: string;
  variant?: 'default' | 'destructive';
}

// Theme configuration
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  animations: boolean;
}

// Default configuration
const defaultHeaderConfig: HeaderConfig = {
  height: 64,
  sticky: true,
  backdrop: true,
  showSearch: true,
  showNotifications: true,
  showUserMenu: true,
  showBreadcrumbs: true,
  showQuickActions: true,
  showSystemStatus: true,
  autoHideOnScroll: false,
  searchOnType: true,
  maxSearchResults: 10,
  theme: 'auto',
  variant: 'default',
  showBorder: true,
  showShadow: true,
  enableShortcuts: true,
  enableTooltips: true,
  enableAnimations: true,
  enableRealTimeUpdates: true
};

// Mock data generators (replace with real API calls)
const getMockNotifications = (): Notification[] => [
  {
    id: '1',
    title: 'New Access Request',
    message: 'John Doe requested access to Production Database',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    actionable: true,
    action: {
      label: 'Review',
      onClick: () => console.log('Review access request')
    },
    priority: 'high',
    category: 'access_requests'
  },
  {
    id: '2',
    title: 'Security Alert',
    message: 'Unusual login activity detected',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    actionable: true,
    priority: 'critical',
    category: 'security'
  },
  {
    id: '3',
    title: 'System Maintenance',
    message: 'Scheduled maintenance completed successfully',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
    actionable: false,
    priority: 'low',
    category: 'system'
  }
];

const getDefaultQuickActions = (): QuickAction[] => [
  {
    id: 'new-user',
    label: 'New User',
    icon: <UserCheck className="w-4 h-4" />,
    onClick: () => console.log('Create new user'),
    permission: 'users:create',
    shortcut: 'Ctrl+N',
    tooltip: 'Create a new user account',
    category: 'users',
    order: 1
  },
  {
    id: 'access-review',
    label: 'Access Review',
    icon: <Shield className="w-4 h-4" />,
    onClick: () => console.log('Start access review'),
    permission: 'audit:review',
    badge: '3',
    tooltip: 'Review pending access requests',
    category: 'security',
    order: 2
  },
  {
    id: 'system-health',
    label: 'Health Check',
    icon: <Activity className="w-4 h-4" />,
    onClick: () => console.log('Check system health'),
    permission: 'system:monitor',
    tooltip: 'View system health status',
    category: 'monitoring',
    order: 3
  }
];

const getUserMenuItems = (): UserMenuItem[] => [
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="w-4 h-4" />,
    href: '/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    href: '/settings'
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: <HelpCircle className="w-4 h-4" />,
    href: '/help'
  },
  {
    id: 'separator1',
    label: '',
    icon: <></>,
    separator: true
  },
  {
    id: 'theme',
    label: 'Toggle Theme',
    icon: <Moon className="w-4 h-4" />,
    onClick: () => console.log('Toggle theme'),
    shortcut: 'Ctrl+Shift+T'
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: <MessageCircle className="w-4 h-4" />,
    onClick: () => console.log('Open feedback')
  },
  {
    id: 'separator2',
    label: '',
    icon: <></>,
    separator: true
  },
  {
    id: 'logout',
    label: 'Sign Out',
    icon: <LogOut className="w-4 h-4" />,
    onClick: () => console.log('Sign out'),
    variant: 'destructive',
    shortcut: 'Ctrl+Shift+Q'
  }
];

// Custom hooks
const useHeaderState = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(getMockNotifications());
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement real search API call
    if (query.trim()) {
      setSearchResults([
        {
          id: '1',
          title: 'User Management',
          description: 'Manage system users and permissions',
          type: 'page',
          href: '/rbac/users',
          icon: <Users className="w-4 h-4" />,
          category: 'Navigation'
        },
        {
          id: '2',
          title: 'John Doe',
          description: 'Administrator - john.doe@company.com',
          type: 'user',
          href: '/rbac/users/123',
          icon: <User className="w-4 h-4" />,
          category: 'Users'
        }
      ]);
    } else {
      setSearchResults([]);
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    notifications,
    theme,
    setTheme,
    handleSearch,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification
  };
};

// Header search component
interface HeaderSearchProps {
  searchQuery: string;
  searchResults: SearchResult[];
  isOpen: boolean;
  onSearch: (query: string) => void;
  onToggle: () => void;
  onClose: () => void;
  placeholder?: string;
  maxResults?: number;
  className?: string;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({
  searchQuery,
  searchResults,
  isOpen,
  onSearch,
  onToggle,
  onClose,
  placeholder = 'Search...',
  maxResults = 10,
  className
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onToggle();
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle, onClose]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.div
        className="relative"
        initial={false}
        animate={{
          width: isOpen ? 400 : 280,
          transition: { duration: 0.2, ease: 'easeInOut' }
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (!isOpen) onToggle();
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-2 text-sm border border-border rounded-lg bg-background/80 backdrop-blur-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded border">
              ⌘K
            </kbd>
            {isOpen && searchQuery && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => {
                  onSearch('');
                  searchRef.current?.focus();
                }}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (searchResults.length > 0 || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.slice(0, maxResults).map((result, index) => (
                  <motion.a
                    key={result.id}
                    href={result.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer"
                    onClick={onClose}
                  >
                    {result.icon}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.category}
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="py-8 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{searchQuery}"</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notifications dropdown component
interface NotificationsDropdownProps {
  notifications: Notification[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: (id: string) => void;
  className?: string;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  isOpen,
  onToggle,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer',
                      !notification.read && 'bg-primary/5'
                    )}
                    onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn(
                            'text-sm font-medium truncate',
                            !notification.read && 'text-foreground'
                          )}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {notification.actionable && notification.action && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.action?.onClick();
                              }}
                              className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClear(notification.id);
                        }}
                        className="p-1 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <button className="w-full text-xs text-center text-primary hover:text-primary/80 transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// User menu dropdown component
interface UserMenuDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  menuItems: UserMenuItem[];
  className?: string;
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  isOpen,
  onToggle,
  onClose,
  menuItems,
  className
}) => {
  const { currentUser, isLoading } = useCurrentUser();
  const { logout } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleMenuItemClick = (item: UserMenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (item.id === 'logout') {
      logout();
    }
    onClose();
  };

  if (isLoading) {
    return (
      <div className="p-2">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium truncate max-w-32">
            {currentUser?.username || 'User'}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-32">
            {currentUser?.email || 'user@example.com'}
          </div>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50"
          >
            {/* User info header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {currentUser?.username || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {currentUser?.email || 'user@example.com'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {currentUser?.roles?.[0]?.name || 'User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                item.separator ? (
                  <div key={item.id} className="my-1 border-t border-border" />
                ) : (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMenuItemClick(item)}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-accent transition-colors',
                      item.variant === 'destructive' && 'text-destructive hover:bg-destructive/10',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded border">
                        {item.shortcut}
                      </kbd>
                    )}
                  </motion.button>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick actions component
interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions, className }) => {
  const { hasPermission } = usePermissionCheck();

  const visibleActions = actions.filter(action => 
    !action.disabled && (!action.permission || hasPermission(action.permission))
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {visibleActions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          title={action.tooltip}
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            action.variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
            action.variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            action.variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            (!action.variant || action.variant === 'default') && 'bg-accent text-accent-foreground hover:bg-accent/80'
          )}
        >
          {action.icon}
          <span className="hidden sm:inline">{action.label}</span>
          {action.badge && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
              {action.badge}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

// Breadcrumbs component
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          {item.active ? (
            <span className="flex items-center gap-1 font-medium text-foreground">
              {item.icon}
              {item.label}
            </span>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                'flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon}
              {item.label}
            </motion.button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// System status component
interface SystemStatusProps {
  className?: string;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ className }) => {
  const { isConnected, connectionState, lastPing } = useRBACWebSocket();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <div className={cn(
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        )} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {lastPing && (
        <span className="text-xs text-muted-foreground">
          {lastPing}ms
        </span>
      )}
    </div>
  );
};

// Main RBAC Header component
export const RBACHeader: React.FC<RBACHeaderProps> = ({
  config: userConfig = {},
  className,
  onMenuToggle,
  onSearch,
  customActions = [],
  breadcrumbs = [],
  hideElements = [],
  showOnlyElements = []
}) => {
  const pathname = usePathname();
  
  // Merge configurations
  const config = useMemo(() => ({
    ...defaultHeaderConfig,
    ...userConfig
  }), [userConfig]);

  // Header state
  const {
    searchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    notifications,
    theme,
    setTheme,
    handleSearch,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification
  } = useHeaderState();

  // Quick actions
  const quickActions = useMemo(() => [
    ...getDefaultQuickActions(),
    ...customActions
  ], [customActions]);

  // User menu items
  const userMenuItems = useMemo(() => getUserMenuItems(), []);

  // Handle search
  const handleSearchWrapper = useCallback((query: string) => {
    handleSearch(query);
    if (onSearch) {
      onSearch(query);
    }
  }, [handleSearch, onSearch]);

  // Auto-hide on scroll
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!config.autoHideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY.current;

      if (isScrollingDown && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [config.autoHideOnScroll]);

  const shouldShowElement = (elementName: string) => {
    if (showOnlyElements.length > 0) {
      return showOnlyElements.includes(elementName);
    }
    return !hideElements.includes(elementName);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'flex items-center justify-between gap-4 px-6 py-3 bg-background/95 backdrop-blur-sm transition-all duration-200',
        config.sticky && 'sticky top-0 z-40',
        config.showBorder && 'border-b border-border',
        config.showShadow && 'shadow-sm',
        config.variant === 'compact' && 'py-2',
        config.variant === 'expanded' && 'py-4',
        className
      )}
      style={{ height: config.height }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Menu toggle */}
        {shouldShowElement('menuToggle') && onMenuToggle && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-accent transition-colors lg:hidden"
            title="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}

        {/* Breadcrumbs */}
        {shouldShowElement('breadcrumbs') && config.showBreadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="hidden md:flex" />
        )}
      </div>

      {/* Center section */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        {/* Search */}
        {shouldShowElement('search') && config.showSearch && (
          <HeaderSearch
            searchQuery={searchQuery}
            searchResults={searchResults}
            isOpen={isSearchOpen}
            onSearch={handleSearchWrapper}
            onToggle={() => setIsSearchOpen(!isSearchOpen)}
            onClose={() => setIsSearchOpen(false)}
            placeholder="Search RBAC system..."
            maxResults={config.maxSearchResults}
          />
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Quick actions */}
        {shouldShowElement('quickActions') && config.showQuickActions && (
          <QuickActions actions={quickActions} className="hidden lg:flex" />
        )}

        {/* System status */}
        {shouldShowElement('systemStatus') && config.showSystemStatus && (
          <SystemStatus className="hidden xl:flex" />
        )}

        {/* Notifications */}
        {shouldShowElement('notifications') && config.showNotifications && (
          <NotificationsDropdown
            notifications={notifications}
            isOpen={isNotificationsOpen}
            onToggle={() => setIsNotificationsOpen(!isNotificationsOpen)}
            onClose={() => setIsNotificationsOpen(false)}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
            onClear={clearNotification}
          />
        )}

        {/* User menu */}
        {shouldShowElement('userMenu') && config.showUserMenu && (
          <UserMenuDropdown
            isOpen={isUserMenuOpen}
            onToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
            onClose={() => setIsUserMenuOpen(false)}
            menuItems={userMenuItems}
          />
        )}
      </div>
    </motion.header>
  );
};

export default RBACHeader;