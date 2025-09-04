/**
 * ActivitySearchEngine.tsx
 * =========================
 * 
 * Advanced Search and Filtering Engine - Intelligent search system for activity
 * data with AI-powered suggestions, natural language processing, advanced query
 * building, and sophisticated filtering capabilities.
 * 
 * Features:
 * - Natural language query processing
 * - AI-powered search suggestions and autocomplete
 * - Advanced filter builder with visual query construction
 * - Fuzzy search and semantic matching
 * - Real-time search results with instant feedback
 * - Saved searches and search history
 * - Cross-group activity correlation in search
 * - Smart search recommendations based on patterns
 * 
 * Design: Modern search interface with intelligent suggestions, advanced filters,
 * and sophisticated query visualization using shadcn/ui, Next.js, and Tailwind CSS.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Search, Filter, X, Plus, Minus, Edit, Save, Star, StarOff, History, Clock, Calendar, User, Database, Tag, Hash, Target, Zap, Brain, BrainCircuit, Lightbulb, Sparkles, Wand2, Code, Type, AlignLeft as AlignLeftIcon, Quote, Parentheses, Regex, CaseSensitive, WholeWord, ArrowRight, ArrowDown, ArrowUp, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, MoreHorizontal, Eye, EyeOff, Download, Upload, Copy, Share, ExternalLink, Settings, Sliders, RotateCcw, RefreshCcw, Play, Pause, Square, SkipForward, SkipBack, FastForward, Rewind, Volume2, VolumeX, Mic, MicOff, Keyboard, Mouse, Touchpad, Gamepad2, Joystick, MonitorSpeaker, Headphones, Speaker, Smartphone, Tablet, Laptop, Monitor, Tv, Watch, Camera, Video, Image, FileText, File, Folder, FolderOpen, Archive, Package, Box, Container, Layers, Stack, Grid3X3, Grid2X2, LayoutGrid, LayoutList, List, Table, Columns, Rows, SplitSquareHorizontal, SplitSquareVertical, Maximize, Minimize, Expand, Shrink, ZoomIn, ZoomOut, Focus, Scan, ScanLine, QrCode, Fingerprint, Lock, Unlock, Key, Shield, ShieldCheckIcon, ShieldAlert, ShieldX, Security, AlertTriangle, AlertCircle, CheckCircle, XCircle, Info, HelpCircle, MessageCircle, MessageSquare, Mail, Send, Inbox, Outbox, Archive as ArchiveIcon, Trash, Trash2, Delete, Eraser, Scissors, Clipboard, ClipboardCopy, ClipboardPaste, ClipboardList, ClipboardCheck, ClipboardX, Command as CommandIcon, Terminal, Binary, Bug, Cpu, HardDrive, MemoryStick, SdCard, Usb, Bluetooth, Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium, SignalZero, Antenna, Radio, Rss, Activity, Pulse, HeartHandshake, Heart, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, BarChart, BarChart2, BarChart3, LineChart, PieChart, ScatterChart, Gauge, Speedometer, Timer, Stopwatch, Clock3, AlarmClock, Hourglass, Loader, Loader2, LoaderCircle, RotateCw, Repeat, Repeat1, Repeat2, Shuffle, SkipBackIcon, SkipForwardIcon, PlayCircle, PauseCircle, StopCircle, Power, PowerOff, Plug, Unplug, Battery, BatteryLow, Fuel, Zap as ZapIcon, Flame, Sun, Moon, CloudSun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudLightning, Tornado, Wind, Snowflake, Droplets, Waves, Mountain, Trees, Flower, Leaf, Seedling, Sprout, TreePine, TreeDeciduous, Palmtree, Cactus, Mushroom, Apple, Cherry, Grape, Orange, Banana, Carrot, Fish, Bug as BugIcon, Rabbit, Turtle, Bird, Cat, Dog, Squirrel, Cow, Pig, Sheep, Horse, Snail, Ant, Bee, Butterfly, Spider, Worm, Microscope, TestTube, FlaskConical, TestTubes, Dna, Atom, Magnet, Compass, MapPin, Map, Navigation, Route, Milestone, Flag, FlagTriangleLeft, FlagTriangleRight, Bookmark, BookOpen, Book, Library, GraduationCap, School, Building, Building2, Factory, Warehouse, Store, ShoppingCart, ShoppingBag, CreditCard, Banknote, DollarSign, Euro, PoundSterling, Yen, Bitcoin, Coins, Wallet, PiggyBank, Calculator, Abacus, Scale, Ruler, Scissors as ScissorsIcon, Wrench, Hammer, Screwdriver, Drill, Saw, Pickaxe, Shovel, Axe, Knife, Sword, Shield as ShieldIcon, Crown, Trophy, Award, Medal, Ribbon, Rosette, Gift, Cake, Candle, PartyPopper, Confetti, Balloon, Camera as CameraIcon, Video as VideoIcon, Film, Clapperboard, Music, Music2, Music3, Music4, Disc, Disc2, Disc3, Radio as RadioIcon, Podcast, Headphones as HeadphonesIcon, Speaker as SpeakerIcon, Volume, Volume1, VolumeOff, Gamepad, Joystick as JoystickIcon, Dices, Puzzle, Target as TargetIcon, Crosshair, Scope, Radar as RadarIcon, Satellite, Rocket, Plane, Car, Truck, Bus, Train, Tractor, Bike, Scooter, Motorcycle, Boat, Ship, Anchor, Wheel, Fuel as FuelIcon, Construction, Cone, Barrier, RoadClosed, TrafficCone, Ambulance, FireExtinguisher, Siren, Hospital, Cross, Pill, Stethoscope, Thermometer, Bandage, Syringe, Dumbbell, Weight, Activity as ActivityIcon, HeartPulse, Brain as BrainIcon, Eye as EyeIcon, Ear, Nose, Mouth, Hand, Footprints, Baby, Child, User2, Users, UserPlus, UserMinus, UserCheck, UserX, Users2, TeamIcon, Group, Family, Couple, PersonStanding, Accessibility, WheelchairIcon, Blind, Deaf, SignLanguage, Braille, Languages, Globe, Globe2, Earth, Satellite as SatelliteIcon, Orbit, Planet, MoonIcon, SunIcon, Star as StarIcon, Comet, Meteor, Galaxy, Binoculars, Camera2, CameraOff, VideoOff, Image as ImageIcon, ImageOff, ImagePlus, ImageMinus, Crop, RotateCcw as RotateCcwIcon, Rotate3D, FlipHorizontal, FlipVertical, Contrast, SunMedium, Palette, Pipette, Paintbrush, Paintbrush2, PenTool, Pen, Pencil, Highlighter, Marker, Crayon, PaintBucket, Eraser as EraserIcon, Lasso, MoveIcon, Move3D, MousePointer, MousePointer2, CursorArrow, Hand as HandIcon, Grab, GrabIcon, Pointer, Click, Tap, Swipe, Pinch, Zoom, Pan, Rotate, Scale as ScaleIcon, Transform, Flip, Mirror, Symmetry, Align, AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, AlignHorizontalDistributeStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, AlignJustify, AlignLeft, AlignRight, AlignStartHorizontal, AlignStartVertical, AlignVerticalDistributeCenter, AlignVerticalDistributeEnd, AlignVerticalDistributeStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalSpaceAround, AlignVerticalSpaceBetween, Distribute, DistributeHorizontal, DistributeVertical, Space, Spacing, Margin, Padding, BorderAll, BorderBottom, BorderLeft, BorderRight, BorderTop, CornerDownLeft, CornerDownRight, CornerLeftDown, CornerLeftUp, CornerRightDown, CornerRightUp, CornerUpLeft, CornerUpRight, RoundedCorner, Square as SquareIcon, Rectangle, Circle, Triangle, Diamond, Pentagon, Hexagon, Octagon, Star4, Star5, Star6, Heart as HeartIcon, Spade, Club, Clubs, Diamonds, Hearts, Spades, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

// Hooks and Services
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types
import {
  RacineActivity,
  ActivityFilter,
  ActivityType,
  ActivitySeverity,
  UUID,
  UserRole,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utils
import { formatDateTime, formatDuration, formatBytes, formatNumber } from '../../utils/formatting-utils';
import { cn } from '@/lib copie/utils';

/**
 * Search modes
 */
export enum SearchMode {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
  NATURAL = 'natural',
  VISUAL = 'visual'
}

/**
 * Query operators
 */
export enum QueryOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  REGEX = 'regex',
  FUZZY = 'fuzzy',
  SEMANTIC = 'semantic',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

/**
 * Query field types
 */
export enum QueryFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  UUID = 'uuid',
  JSON = 'json'
}

/**
 * Search filter interface
 */
interface SearchFilter {
  id: string;
  field: string;
  fieldType: QueryFieldType;
  operator: QueryOperator;
  value: any;
  label: string;
  description?: string;
  required?: boolean;
  enabled: boolean;
}

/**
 * Search query interface
 */
interface SearchQuery {
  id: string;
  name: string;
  description?: string;
  mode: SearchMode;
  query: string;
  filters: SearchFilter[];
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  limit: number;
  offset: number;
  facets: string[];
  highlighting: boolean;
  fuzzySearch: boolean;
  semanticSearch: boolean;
  crossGroup: boolean;
  realTime: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: UUID;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[];
}

/**
 * Search suggestion interface
 */
interface SearchSuggestion {
  id: string;
  type: 'query' | 'filter' | 'field' | 'value' | 'operator';
  text: string;
  description?: string;
  score: number;
  category: string;
  metadata?: any;
}

/**
 * AI search recommendation interface
 */
interface AISearchRecommendation {
  id: string;
  title: string;
  description: string;
  query: string;
  filters: SearchFilter[];
  confidence: number;
  reasoning: string;
  examples: string[];
  tags: string[];
}

/**
 * Component props
 */
interface ActivitySearchEngineProps {
  height?: number;
  defaultMode?: SearchMode;
  enableAI?: boolean;
  enableSuggestions?: boolean;
  enableHistory?: boolean;
  enableSavedSearches?: boolean;
  className?: string;
  onSearchResults?: (results: RacineActivity[]) => void;
  onQueryChange?: (query: SearchQuery) => void;
}

/**
 * Component state interface
 */
interface SearchEngineState {
  // Search Configuration
  currentMode: SearchMode;
  query: string;
  activeQuery: SearchQuery | null;
  
  // Results and Data
  results: RacineActivity[];
  totalResults: number;
  searchTime: number;
  
  // Filters and Facets
  filters: SearchFilter[];
  availableFields: { field: string; type: QueryFieldType; label: string; description?: string }[];
  facets: Record<string, { values: { value: any; count: number }[] }>;
  
  // Suggestions and AI
  suggestions: SearchSuggestion[];
  recommendations: AISearchRecommendation[];
  isGeneratingRecommendations: boolean;
  
  // History and Saved Searches
  searchHistory: SearchQuery[];
  savedSearches: SearchQuery[];
  
  // UI State
  showSuggestions: boolean;
  showAdvancedFilters: boolean;
  showSearchHistory: boolean;
  showSavedSearches: boolean;
  showRecommendations: boolean;
  showQueryBuilder: boolean;
  isFullscreen: boolean;
  
  // Performance
  searchDebounceMs: number;
  maxSuggestions: number;
  maxResults: number;
  
  // Loading and Errors
  loading: {
    search: boolean;
    suggestions: boolean;
    recommendations: boolean;
    save: boolean;
  };
  errors: {
    search: string | null;
    suggestions: string | null;
    recommendations: string | null;
    save: string | null;
  };
}

/**
 * Search field configurations
 */
const searchFields = [
  { field: 'id', type: QueryFieldType.UUID, label: 'Activity ID', description: 'Unique identifier for the activity' },
  { field: 'userId', type: QueryFieldType.UUID, label: 'User ID', description: 'User who performed the activity' },
  { field: 'activityType', type: QueryFieldType.TEXT, label: 'Activity Type', description: 'Type of activity performed' },
  { field: 'action', type: QueryFieldType.TEXT, label: 'Action', description: 'Specific action taken' },
  { field: 'resourceType', type: QueryFieldType.TEXT, label: 'Resource Type', description: 'Type of resource affected' },
  { field: 'resourceId', type: QueryFieldType.UUID, label: 'Resource ID', description: 'ID of the affected resource' },
  { field: 'timestamp', type: QueryFieldType.DATE, label: 'Timestamp', description: 'When the activity occurred' },
  { field: 'duration', type: QueryFieldType.NUMBER, label: 'Duration', description: 'Duration of the activity in milliseconds' },
  { field: 'severity', type: QueryFieldType.TEXT, label: 'Severity', description: 'Severity level of the activity' },
  { field: 'status', type: QueryFieldType.TEXT, label: 'Status', description: 'Current status of the activity' },
  { field: 'description', type: QueryFieldType.TEXT, label: 'Description', description: 'Activity description' },
  { field: 'metadata', type: QueryFieldType.JSON, label: 'Metadata', description: 'Additional activity metadata' },
  { field: 'tags', type: QueryFieldType.ARRAY, label: 'Tags', description: 'Tags associated with the activity' },
  { field: 'ipAddress', type: QueryFieldType.TEXT, label: 'IP Address', description: 'IP address of the user' },
  { field: 'userAgent', type: QueryFieldType.TEXT, label: 'User Agent', description: 'User agent string' },
  { field: 'sessionId', type: QueryFieldType.UUID, label: 'Session ID', description: 'User session identifier' },
  { field: 'workspaceId', type: QueryFieldType.UUID, label: 'Workspace ID', description: 'Workspace context' }
];

/**
 * Query operator configurations
 */
const operatorConfigs = {
  [QueryOperator.EQUALS]: { label: 'Equals', symbol: '=', description: 'Exact match' },
  [QueryOperator.NOT_EQUALS]: { label: 'Not Equals', symbol: '≠', description: 'Does not match' },
  [QueryOperator.CONTAINS]: { label: 'Contains', symbol: '∋', description: 'Contains text' },
  [QueryOperator.NOT_CONTAINS]: { label: 'Not Contains', symbol: '∌', description: 'Does not contain text' },
  [QueryOperator.STARTS_WITH]: { label: 'Starts With', symbol: '^', description: 'Begins with text' },
  [QueryOperator.ENDS_WITH]: { label: 'Ends With', symbol: '$', description: 'Ends with text' },
  [QueryOperator.REGEX]: { label: 'Regular Expression', symbol: '~', description: 'Regular expression match' },
  [QueryOperator.FUZZY]: { label: 'Fuzzy Match', symbol: '≈', description: 'Approximate match' },
  [QueryOperator.SEMANTIC]: { label: 'Semantic Search', symbol: '🔍', description: 'AI-powered semantic match' },
  [QueryOperator.GREATER_THAN]: { label: 'Greater Than', symbol: '>', description: 'Greater than value' },
  [QueryOperator.LESS_THAN]: { label: 'Less Than', symbol: '<', description: 'Less than value' },
  [QueryOperator.BETWEEN]: { label: 'Between', symbol: '⟷', description: 'Between two values' },
  [QueryOperator.IN]: { label: 'In List', symbol: '∈', description: 'In a list of values' },
  [QueryOperator.NOT_IN]: { label: 'Not In List', symbol: '∉', description: 'Not in a list of values' },
  [QueryOperator.IS_NULL]: { label: 'Is Empty', symbol: '∅', description: 'Is null or empty' },
  [QueryOperator.IS_NOT_NULL]: { label: 'Is Not Empty', symbol: '∃', description: 'Is not null or empty' }
};

/**
 * Initial state
 */
const initialState: SearchEngineState = {
  currentMode: SearchMode.SIMPLE,
  query: '',
  activeQuery: null,
  results: [],
  totalResults: 0,
  searchTime: 0,
  filters: [],
  availableFields: searchFields,
  facets: {},
  suggestions: [],
  recommendations: [],
  isGeneratingRecommendations: false,
  searchHistory: [],
  savedSearches: [],
  showSuggestions: false,
  showAdvancedFilters: false,
  showSearchHistory: false,
  showSavedSearches: false,
  showRecommendations: false,
  showQueryBuilder: false,
  isFullscreen: false,
  searchDebounceMs: 300,
  maxSuggestions: 10,
  maxResults: 100,
  loading: {
    search: false,
    suggestions: false,
    recommendations: false,
    save: false
  },
  errors: {
    search: null,
    suggestions: null,
    recommendations: null,
    save: null
  }
};

/**
 * Main ActivitySearchEngine Component
 */
export const ActivitySearchEngine: React.FC<ActivitySearchEngineProps> = ({
  height = 800,
  defaultMode = SearchMode.SIMPLE,
  enableAI = true,
  enableSuggestions = true,
  enableHistory = true,
  enableSavedSearches = true,
  className,
  onSearchResults,
  onQueryChange
}) => {
  // State Management
  const [state, setState] = useState<SearchEngineState>({
    ...initialState,
    currentMode: defaultMode
  });
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Animation Controls
  const mainAnimationControls = useAnimation();
  const suggestionsAnimationControls = useAnimation();
  
  // Hooks
  const { 
    searchActivities, 
    getActivitySuggestions, 
    getActivityFacets,
    exportActivities 
  } = useActivityTracker();
  const { currentUser, userPermissions } = useUserManagement();
  const { currentWorkspace } = useWorkspaceManagement();
  const { getAllSPAStatus } = useCrossGroupIntegration();
  const {
    generateSearchRecommendations,
    processNaturalLanguageQuery,
    getSemanticSuggestions,
    optimizeQuery
  } = useAIAssistant();
  
  // Initialize component
  useEffect(() => {
    loadSavedSearches();
    loadSearchHistory();
    if (enableAI) {
      generateInitialRecommendations();
    }
  }, []);
  
  // Search debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (state.query.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch();
        if (enableSuggestions) {
          loadSuggestions();
        }
      }, state.searchDebounceMs);
    } else {
      setState(prev => ({ 
        ...prev, 
        results: [], 
        totalResults: 0, 
        suggestions: [],
        showSuggestions: false 
      }));
    }
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state.query, state.filters, state.currentMode]);
  
  // Data Loading Functions
  const loadSavedSearches = useCallback(async () => {
    try {
      // Implementation would load saved searches from backend
      const savedSearches: SearchQuery[] = [
        {
          id: 'recent-errors',
          name: 'Recent Errors',
          description: 'Activities with error severity in the last 24 hours',
          mode: SearchMode.ADVANCED,
          query: 'severity:error',
          filters: [
            {
              id: 'severity-filter',
              field: 'severity',
              fieldType: QueryFieldType.TEXT,
              operator: QueryOperator.EQUALS,
              value: 'error',
              label: 'Severity',
              enabled: true
            },
            {
              id: 'time-filter',
              field: 'timestamp',
              fieldType: QueryFieldType.DATE,
              operator: QueryOperator.GREATER_THAN,
              value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              label: 'Timestamp',
              enabled: true
            }
          ],
          sorting: [{ field: 'timestamp', direction: 'desc' }],
          limit: 50,
          offset: 0,
          facets: ['activityType', 'userId', 'resourceType'],
          highlighting: true,
          fuzzySearch: false,
          semanticSearch: false,
          crossGroup: true,
          realTime: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: currentUser?.id || '',
          isPublic: false,
          isFavorite: true,
          tags: ['errors', 'monitoring']
        }
      ];
      
      setState(prev => ({ ...prev, savedSearches }));
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }, [currentUser]);
  
  const loadSearchHistory = useCallback(async () => {
    try {
      // Implementation would load search history from backend
      const searchHistory: SearchQuery[] = [];
      setState(prev => ({ ...prev, searchHistory }));
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);
  
  const generateInitialRecommendations = useCallback(async () => {
    if (!enableAI) return;
    
    setState(prev => ({ ...prev, isGeneratingRecommendations: true }));
    try {
      const recommendations = await generateSearchRecommendations({
        context: 'activity_search',
        userRole: currentUser?.role,
        workspaceId: currentWorkspace?.id,
        recentActivity: state.searchHistory.slice(0, 5)
      });
      
      setState(prev => ({ 
        ...prev, 
        recommendations,
        isGeneratingRecommendations: false,
        errors: { ...prev.errors, recommendations: null }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGeneratingRecommendations: false,
        errors: { ...prev.errors, recommendations: error instanceof Error ? error.message : 'Failed to generate recommendations' }
      }));
    }
  }, [enableAI, currentUser, currentWorkspace, state.searchHistory, generateSearchRecommendations]);
  
  // Search Functions
  const performSearch = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, search: true },
      errors: { ...prev.errors, search: null }
    }));
    
    try {
      const startTime = performance.now();
      
      let processedQuery = state.query;
      let processedFilters = state.filters;
      
      // Process natural language query if in natural mode
      if (state.currentMode === SearchMode.NATURAL && enableAI) {
        const nlpResult = await processNaturalLanguageQuery(state.query);
        processedQuery = nlpResult.query;
        processedFilters = [...processedFilters, ...nlpResult.filters];
      }
      
      const searchParams = {
        query: processedQuery,
        filters: processedFilters,
        mode: state.currentMode,
        limit: state.maxResults,
        offset: 0,
        facets: ['activityType', 'severity', 'userId', 'resourceType'],
        highlighting: true,
        fuzzySearch: state.currentMode === SearchMode.SIMPLE,
        semanticSearch: enableAI && (state.currentMode === SearchMode.NATURAL || state.currentMode === SearchMode.ADVANCED),
        crossGroup: true
      };
      
      const results = await searchActivities(searchParams);
      const searchTime = performance.now() - startTime;
      
      setState(prev => ({
        ...prev,
        results: results.activities,
        totalResults: results.total,
        searchTime,
        facets: results.facets || {},
        loading: { ...prev.loading, search: false },
        errors: { ...prev.errors, search: null }
      }));
      
      // Add to search history
      if (state.query.trim()) {
        const historyEntry: SearchQuery = {
          id: `history-${Date.now()}`,
          name: state.query,
          mode: state.currentMode,
          query: state.query,
          filters: state.filters,
          sorting: [{ field: 'timestamp', direction: 'desc' }],
          limit: state.maxResults,
          offset: 0,
          facets: [],
          highlighting: true,
          fuzzySearch: false,
          semanticSearch: enableAI,
          crossGroup: true,
          realTime: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: currentUser?.id || '',
          isPublic: false,
          isFavorite: false,
          tags: []
        };
        
        setState(prev => ({
          ...prev,
          searchHistory: [historyEntry, ...prev.searchHistory.slice(0, 9)] // Keep last 10
        }));
      }
      
      // Notify parent component
      if (onSearchResults) {
        onSearchResults(results.activities);
      }
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, search: false },
        errors: { ...prev.errors, search: error instanceof Error ? error.message : 'Search failed' }
      }));
    }
  }, [state.query, state.filters, state.currentMode, state.maxResults, enableAI, currentUser, searchActivities, processNaturalLanguageQuery, onSearchResults]);
  
  const loadSuggestions = useCallback(async () => {
    if (!enableSuggestions || !state.query.trim()) return;
    
    setState(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, suggestions: true },
      errors: { ...prev.errors, suggestions: null }
    }));
    
    try {
      let suggestions: SearchSuggestion[] = [];
      
      // Get field and value suggestions
      const fieldSuggestions = await getActivitySuggestions({
        query: state.query,
        type: 'field',
        limit: state.maxSuggestions
      });
      
      suggestions = [...suggestions, ...fieldSuggestions];
      
      // Get AI-powered semantic suggestions if enabled
      if (enableAI) {
        const semanticSuggestions = await getSemanticSuggestions({
          query: state.query,
          context: 'activity_search',
          limit: Math.floor(state.maxSuggestions / 2)
        });
        
        suggestions = [...suggestions, ...semanticSuggestions];
      }
      
      // Sort by score and limit
      suggestions = suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, state.maxSuggestions);
      
      setState(prev => ({
        ...prev,
        suggestions,
        showSuggestions: suggestions.length > 0,
        loading: { ...prev.loading, suggestions: false },
        errors: { ...prev.errors, suggestions: null }
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, suggestions: false },
        errors: { ...prev.errors, suggestions: error instanceof Error ? error.message : 'Failed to load suggestions' }
      }));
    }
  }, [enableSuggestions, enableAI, state.query, state.maxSuggestions, getActivitySuggestions, getSemanticSuggestions]);
  
  // Event Handlers
  const handleQueryChange = useCallback((newQuery: string) => {
    setState(prev => ({ ...prev, query: newQuery }));
  }, []);
  
  const handleModeChange = useCallback((mode: SearchMode) => {
    setState(prev => ({ ...prev, currentMode: mode }));
    mainAnimationControls.start({
      opacity: [0, 1],
      scale: [0.95, 1],
      transition: { duration: 0.3 }
    });
  }, [mainAnimationControls]);
  
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setState(prev => ({ 
      ...prev, 
      query: suggestion.text,
      showSuggestions: false 
    }));
    
    // Focus search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  const handleFilterAdd = useCallback((field: string, operator: QueryOperator, value: any) => {
    const fieldConfig = searchFields.find(f => f.field === field);
    if (!fieldConfig) return;
    
    const newFilter: SearchFilter = {
      id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      field,
      fieldType: fieldConfig.type,
      operator,
      value,
      label: fieldConfig.label,
      description: fieldConfig.description,
      enabled: true
    };
    
    setState(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  }, []);
  
  const handleFilterUpdate = useCallback((filterId: string, updates: Partial<SearchFilter>) => {
    setState(prev => ({
      ...prev,
      filters: prev.filters.map(filter =>
        filter.id === filterId ? { ...filter, ...updates } : filter
      )
    }));
  }, []);
  
  const handleFilterRemove = useCallback((filterId: string) => {
    setState(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== filterId)
    }));
  }, []);
  
  const handleSaveSearch = useCallback(async (name: string, description?: string, isPublic = false) => {
    setState(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, save: true },
      errors: { ...prev.errors, save: null }
    }));
    
    try {
      const searchQuery: SearchQuery = {
        id: `saved-${Date.now()}`,
        name,
        description,
        mode: state.currentMode,
        query: state.query,
        filters: state.filters,
        sorting: [{ field: 'timestamp', direction: 'desc' }],
        limit: state.maxResults,
        offset: 0,
        facets: Object.keys(state.facets),
        highlighting: true,
        fuzzySearch: state.currentMode === SearchMode.SIMPLE,
        semanticSearch: enableAI,
        crossGroup: true,
        realTime: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser?.id || '',
        isPublic,
        isFavorite: false,
        tags: []
      };
      
      // Implementation would save to backend
      setState(prev => ({
        ...prev,
        savedSearches: [searchQuery, ...prev.savedSearches],
        loading: { ...prev.loading, save: false },
        errors: { ...prev.errors, save: null }
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, save: false },
        errors: { ...prev.errors, save: error instanceof Error ? error.message : 'Failed to save search' }
      }));
    }
  }, [state.currentMode, state.query, state.filters, state.maxResults, state.facets, enableAI, currentUser]);
  
  const handleLoadSavedSearch = useCallback((searchQuery: SearchQuery) => {
    setState(prev => ({
      ...prev,
      currentMode: searchQuery.mode,
      query: searchQuery.query,
      filters: searchQuery.filters,
      activeQuery: searchQuery
    }));
    
    if (onQueryChange) {
      onQueryChange(searchQuery);
    }
  }, [onQueryChange]);
  
  const handleRecommendationApply = useCallback((recommendation: AISearchRecommendation) => {
    setState(prev => ({
      ...prev,
      query: recommendation.query,
      filters: recommendation.filters,
      showRecommendations: false
    }));
  }, []);
  
  // Computed Values
  const searchStatistics = useMemo(() => {
    return {
      totalResults: state.totalResults,
      searchTime: state.searchTime,
      resultsShown: state.results.length,
      hasMoreResults: state.totalResults > state.results.length,
      averageRelevance: state.results.length > 0 ? 
        state.results.reduce((sum, r) => sum + (r.relevanceScore || 0), 0) / state.results.length : 0
    };
  }, [state.totalResults, state.searchTime, state.results]);
  
  const availableOperators = useMemo(() => {
    return Object.values(QueryOperator).map(op => ({
      value: op,
      label: operatorConfigs[op].label,
      symbol: operatorConfigs[op].symbol,
      description: operatorConfigs[op].description
    }));
  }, []);
  
  // Render Functions
  const renderSearchHeader = () => (
    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Search className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Activity Search Engine
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search Mode Selector */}
          <Tabs value={state.currentMode} onValueChange={(value) => handleModeChange(value as SearchMode)}>
            <TabsList>
              <TabsTrigger value={SearchMode.SIMPLE} className="text-xs">
                <Type className="h-3 w-3 mr-1" />
                Simple
              </TabsTrigger>
              <TabsTrigger value={SearchMode.ADVANCED} className="text-xs">
                <Sliders className="h-3 w-3 mr-1" />
                Advanced
              </TabsTrigger>
              {enableAI && (
                <TabsTrigger value={SearchMode.NATURAL} className="text-xs">
                  <BrainCircuit className="h-3 w-3 mr-1" />
                  Natural
                </TabsTrigger>
              )}
              <TabsTrigger value={SearchMode.VISUAL} className="text-xs">
                <LayoutGrid className="h-3 w-3 mr-1" />
                Visual
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Action Controls */}
          <div className="flex items-center space-x-1">
            {enableHistory && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, showSearchHistory: !prev.showSearchHistory }))}
                      className={cn(state.showSearchHistory && "bg-blue-50 border-blue-300")}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search History</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {enableSavedSearches && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, showSavedSearches: !prev.showSavedSearches }))}
                      className={cn(state.showSavedSearches && "bg-green-50 border-green-300")}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Saved Searches</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {enableAI && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, showRecommendations: !prev.showRecommendations }))}
                      className={cn(state.showRecommendations && "bg-purple-50 border-purple-300")}
                      disabled={state.isGeneratingRecommendations}
                    >
                      {state.isGeneratingRecommendations ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lightbulb className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Recommendations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
                    className={cn(state.showAdvancedFilters && "bg-orange-50 border-orange-300")}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Advanced Filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showQueryBuilder: true }))}>
                  <Code className="h-4 w-4 mr-2" />
                  Query Builder
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}>
                  {state.isFullscreen ? <Minimize className="h-4 w-4 mr-2" /> : <Maximize className="h-4 w-4 mr-2" />}
                  {state.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Search Statistics */}
      {searchStatistics.totalResults > 0 && (
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>
            {formatNumber(searchStatistics.totalResults)} results found
          </span>
          <span>•</span>
          <span>
            {searchStatistics.searchTime.toFixed(2)}ms search time
          </span>
          {searchStatistics.averageRelevance > 0 && (
            <>
              <span>•</span>
              <span>
                {(searchStatistics.averageRelevance * 100).toFixed(1)}% avg relevance
              </span>
            </>
          )}
          {searchStatistics.hasMoreResults && (
            <>
              <span>•</span>
              <span className="text-blue-600">
                Showing {searchStatistics.resultsShown} of {searchStatistics.totalResults}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
  
  const renderSearchInput = () => (
    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={
              state.currentMode === SearchMode.NATURAL
                ? "Ask questions in natural language... (e.g., 'Show me all errors from yesterday')"
                : state.currentMode === SearchMode.ADVANCED
                ? "Enter advanced search query with operators..."
                : "Search activities..."
            }
            value={state.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-10 pr-12 h-12 text-lg"
            disabled={state.loading.search}
          />
          
          {state.loading.search && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          )}
          
          {state.query && !state.loading.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => handleQueryChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Search Mode Specific Hints */}
        {state.currentMode === SearchMode.NATURAL && enableAI && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
            <BrainCircuit className="h-4 w-4" />
            <span>AI-powered natural language search is active</span>
          </div>
        )}
        
        {state.currentMode === SearchMode.ADVANCED && (
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Code className="h-3 w-3" />
              <span>field:value</span>
            </div>
            <div className="flex items-center space-x-1">
              <Quote className="h-3 w-3" />
              <span>"exact phrase"</span>
            </div>
            <div className="flex items-center space-x-1">
              <Parentheses className="h-3 w-3" />
              <span>(group terms)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Plus className="h-3 w-3" />
              <span>+required</span>
            </div>
            <div className="flex items-center space-x-1">
              <Minus className="h-3 w-3" />
              <span>-excluded</span>
            </div>
          </div>
        )}
        
        {/* Active Filters */}
        {state.filters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {state.filters.map(filter => (
              <Badge 
                key={filter.id} 
                variant="secondary" 
                className="flex items-center space-x-1 px-2 py-1"
              >
                <span className="text-xs">
                  {filter.label}: {operatorConfigs[filter.operator].symbol} {String(filter.value)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1"
                  onClick={() => handleFilterRemove(filter.id)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Search Suggestions */}
      <AnimatePresence>
        {state.showSuggestions && state.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg"
          >
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</div>
              {state.suggestions.map((suggestion, index) => (
                <Button
                  key={suggestion.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2 px-2"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {suggestion.type === 'query' ? '?' : 
                         suggestion.type === 'filter' ? 'F' :
                         suggestion.type === 'field' ? '#' :
                         suggestion.type === 'value' ? 'V' : 'O'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{suggestion.text}</div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-500">{suggestion.description}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {(suggestion.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  const renderMainContent = () => (
    <motion.div
      animate={mainAnimationControls}
      className="flex-1 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
        {/* Search Results */}
        <div className="lg:col-span-3 overflow-auto p-6">
          {state.loading.search ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Searching activities...</p>
              </div>
            </div>
          ) : state.results.length > 0 ? (
            <div className="space-y-4">
              {state.results.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{activity.activityType}</Badge>
                            <Badge variant="outline">{activity.action}</Badge>
                            {activity.severity && (
                              <Badge 
                                variant={activity.severity === 'error' ? 'destructive' : 'secondary'}
                              >
                                {activity.severity}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{activity.userId}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Database className="h-3 w-3" />
                              <span>{activity.resourceType}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDateTime(activity.timestamp)}</span>
                            </div>
                            {activity.relevanceScore && (
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>{(activity.relevanceScore * 100).toFixed(0)}% match</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : state.query ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activities found matching your search</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Start searching to see results</p>
                <p className="text-sm text-gray-400 mt-2">Enter keywords, use filters, or try natural language</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Facets and Filters */}
        <div className="lg:col-span-1 border-l border-gray-200 dark:border-gray-800 overflow-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Refine Results</h3>
            
            {/* Quick Filters */}
            {Object.entries(state.facets).map(([facetName, facetData]) => (
              <div key={facetName} className="mb-6">
                <h4 className="text-sm font-medium mb-2 capitalize">{facetName.replace(/([A-Z])/g, ' $1')}</h4>
                <div className="space-y-2">
                  {facetData.values.slice(0, 5).map((facetValue, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Checkbox
                        id={`${facetName}-${index}`}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterAdd(facetName, QueryOperator.EQUALS, facetValue.value);
                          }
                        }}
                      />
                      <Label htmlFor={`${facetName}-${index}`} className="flex-1 text-sm ml-2">
                        {String(facetValue.value)}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {facetValue.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
  
  // Error Handling
  if (Object.values(state.errors).some(error => error !== null)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>
            {Object.values(state.errors).find(error => error !== null)}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setState(prev => ({ 
              ...prev, 
              errors: { search: null, suggestions: null, recommendations: null, save: null }
            }))}
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }
  
  // Main Render
  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden",
        state.isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      style={{ height: state.isFullscreen ? '100vh' : height }}
    >
      {/* Header */}
      {renderSearchHeader()}
      
      {/* Search Input */}
      {renderSearchInput()}
      
      {/* Main Content */}
      {renderMainContent()}
    </div>
  );
};

export default ActivitySearchEngine;
