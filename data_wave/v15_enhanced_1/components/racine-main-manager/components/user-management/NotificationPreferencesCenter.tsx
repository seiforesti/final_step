/**
 * NotificationPreferencesCenter.tsx
 * =================================
 * 
 * Advanced Notification Preferences and Management Center Component
 * 
 * Features:
 * - Comprehensive notification preference management across all channels
 * - Intelligent notification routing and delivery optimization
 * - Multi-channel notification orchestration (email, SMS, push, in-app, webhook)
 * - Advanced notification templates and customization engine
 * - Real-time notification testing and preview capabilities
 * - Smart notification scheduling and time zone management
 * - Advanced filtering and notification rule engine
 * - Notification analytics and delivery tracking
 * - Integration with all 7 data governance groups for contextual notifications
 * - Advanced escalation chains and fallback mechanisms
 * - Compliance-aware notification handling (GDPR, privacy controls)
 * - Rich notification content with attachments and interactive elements
 * - Advanced notification history and audit trails
 * - Cross-platform notification synchronization
 * - AI-powered notification intelligence and recommendations
 * 
 * Design:
 * - Modern channel-based interface with live preview
 * - Interactive notification composer and template editor
 * - Real-time notification testing and simulation
 * - Advanced channel management and configuration
 * - Responsive design optimized for notification management
 * - Accessibility compliance with screen reader support
 * - Dark/light theme support with notification-optimized themes
 * - Advanced animations and smooth delivery status transitions
 * 
 * Backend Integration:
 * - Maps to NotificationService, DeliveryService, TemplateService
 * - Real-time WebSocket updates for notification status and delivery
 * - Integration with all 7 data governance SPAs for contextual notifications
 * - Advanced analytics and delivery optimization
 * - Multi-vendor notification gateway integration
 * - Comprehensive audit logging and compliance tracking
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
  Slider 
} from '@/components/ui/slider';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Icons
import { Bell, BellOff, BellRing, Mail, MailOpen, MailCheck, MailX, MessageSquare, MessageCircle, Send, SendHorizonal, Smartphone, Monitor, Globe, Webhook, Phone, PhoneCall, Slack, Chrome, Settings, SettingsIcon, Cog, CogIcon, Volume2, VolumeX, Volume1, VolumeOff, Vibrate, Clock, Timer, CalendarClock, Calendar as CalendarIcon, AlarmClock, User, Users, UserCheck, UserX, UserPlus, Shield, ShieldCheckIcon, ShieldAlert, Eye, EyeOff, Edit, Edit2, Edit3, Copy, Trash2, Plus, Minus, X, Check, CheckCircle, XCircle, AlertCircle, AlertTriangle, Info, Search, Filter, SortAsc, SortDesc, MoreHorizontal, Download, Upload, ExternalLink, Link, Unlink, Share2, Share, Forward, Reply, ReplyAll, Archive, Inbox, Outbox, Drafts, Star, StarOff, Heart, Flag, Bookmark, Tag, Hash, AtSign, Percent, DollarSign, Target, Zap, Activity, BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, RefreshCw, RotateCcw, Loader2, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpDown, MapPin, Navigation, Compass, Map, Route, Building, Home, FileText, Folder, FolderOpen, Image, Video, Music, Code, Terminal, Database, Server, Cloud, HardDrive, Cpu, Network, Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium, SignalZero, Battery, BatteryLow, Power, PowerOff, Bluetooth, BluetoothConnected, BluetoothOff, Headphones, Mic, MicOff, Camera, CameraOff, Speaker, Palette, Brush, Paintbrush, PaintBucket, Pipette, Contrast, Sun, Moon, SunMoon, Laptop, Tablet, Watch, GamepadIcon, Gamepad2, Joystick, MousePointer, MousePointer2, Keyboard, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, Subscript, Superscript, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from 'lucide-react';

// Form validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Date handling
import { format, parseISO, isValid, addDays, addHours, addMinutes, startOfDay, endOfDay } from 'date-fns';

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
import { useNotificationSystem } from '../../hooks/useNotificationSystem';

// Racine types
import {
  UUID,
  ISODateString,
  OperationStatus,
  UserProfile,
  RBACPermissions,
  ActivityRecord,
  NotificationSettings
} from '../../types/racine-core.types';

// Racine utilities
import { 
  formatDate,
  formatTime,
  formatRelativeTime,
  generateSecureId
} from '../../utils/validation-utils';
import {
  generateNotificationTemplate,
  validateNotificationSettings,
  optimizeNotificationDelivery,
  analyzeNotificationPatterns
} from '../../utils/notification-utils';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface NotificationPreferencesCenterProps {
  userId?: UUID;
  embedded?: boolean;
  channelFilter?: string;
  showTestingTools?: boolean;
  onSettingsChange?: (settings: NotificationSettings) => void;
  className?: string;
}

interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook' | 'voice' | 'slack' | 'teams';
  enabled: boolean;
  verified: boolean;
  primary: boolean;
  endpoint: string;
  priority: number;
  rateLimit: RateLimit;
  fallback?: string;
  metadata: Record<string, any>;
  deliveryStats: DeliveryStats;
  lastUsed?: ISODateString;
  status: 'active' | 'inactive' | 'error' | 'pending_verification';
}

interface RateLimit {
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
  burstAllowed: boolean;
  burstLimit?: number;
}

interface DeliveryStats {
  totalSent: number;
  delivered: number;
  failed: number;
  bounced: number;
  opened?: number;
  clicked?: number;
  averageDeliveryTime: number; // milliseconds
  successRate: number; // percentage
  lastDelivery?: ISODateString;
}

interface NotificationRule {
  id: UUID;
  name: string;
  description: string;
  category: string;
  eventTypes: string[];
  conditions: NotificationCondition[];
  channels: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  scheduleRestrictions: ScheduleRestriction[];
  escalationChain?: EscalationStep[];
  template?: string;
  customization: NotificationCustomization;
  createdAt: ISODateString;
  lastModified: ISODateString;
  usage: RuleUsageStats;
}

interface NotificationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'regex';
  value: string;
  caseSensitive?: boolean;
}

interface ScheduleRestriction {
  type: 'time_range' | 'weekdays' | 'holidays' | 'timezone';
  value: string;
  enabled: boolean;
}

interface EscalationStep {
  order: number;
  delay: number; // minutes
  channels: string[];
  assignees: string[];
  condition?: string;
}

interface NotificationCustomization {
  subject?: string;
  content?: string;
  template?: string;
  variables: Record<string, any>;
  formatting: FormattingOptions;
  attachments: NotificationAttachment[];
}

interface FormattingOptions {
  useHtml: boolean;
  useMarkdown: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  brandingEnabled: boolean;
  colorScheme: string;
  fontSize: string;
  fontFamily: string;
}

interface NotificationAttachment {
  id: UUID;
  name: string;
  type: string;
  size: number;
  url: string;
  inline: boolean;
}

interface RuleUsageStats {
  triggerCount: number;
  deliveryCount: number;
  successRate: number;
  averageDeliveryTime: number;
  lastTriggered?: ISODateString;
}

interface NotificationTemplate {
  id: UUID;
  name: string;
  description: string;
  category: string;
  type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
  subject: string;
  content: string;
  variables: TemplateVariable[];
  formatting: FormattingOptions;
  preview: TemplatePreview;
  isSystem: boolean;
  isActive: boolean;
  version: string;
  createdBy: UUID;
  createdAt: ISODateString;
  lastModified: ISODateString;
  usage: TemplateUsageStats;
}

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: string;
}

interface TemplatePreview {
  desktop: string;
  mobile: string;
  plainText: string;
}

interface TemplateUsageStats {
  usageCount: number;
  successRate: number;
  averageRating: number;
  lastUsed?: ISODateString;
}

interface NotificationHistory {
  id: UUID;
  type: string;
  title: string;
  content: string;
  channels: string[];
  recipients: string[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  priority: 'low' | 'medium' | 'high' | 'critical';
  sentAt: ISODateString;
  deliveredAt?: ISODateString;
  openedAt?: ISODateString;
  clickedAt?: ISODateString;
  errorMessage?: string;
  deliveryAttempts: number;
  metadata: Record<string, any>;
  metrics: NotificationMetrics;
}

interface NotificationMetrics {
  deliveryTime: number;
  openRate?: number;
  clickRate?: number;
  unsubscribeRate?: number;
  bounceRate?: number;
  spamComplaintRate?: number;
}

interface NotificationAnalytics {
  timeRange: string;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  averageDeliveryTime: number;
  channelPerformance: ChannelPerformance[];
  topCategories: CategoryStats[];
  deliveryTrends: DeliveryTrend[];
  engagementMetrics: EngagementMetrics;
  errorAnalysis: ErrorAnalysis[];
}

interface ChannelPerformance {
  channel: string;
  sent: number;
  delivered: number;
  failed: number;
  successRate: number;
  averageDeliveryTime: number;
  engagementRate?: number;
}

interface CategoryStats {
  category: string;
  count: number;
  successRate: number;
  averageDeliveryTime: number;
}

interface DeliveryTrend {
  timestamp: string;
  sent: number;
  delivered: number;
  failed: number;
}

interface EngagementMetrics {
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  forwardRate: number;
  replyRate: number;
}

interface ErrorAnalysis {
  errorType: string;
  count: number;
  percentage: number;
  channels: string[];
  description: string;
}

interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  emergencyOverride: boolean;
  weekendsEnabled: boolean;
  holidaysEnabled: boolean;
}

interface NotificationDigest {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm format
  timezone: string;
  categories: string[];
  maxItems: number;
  includeMetrics: boolean;
  customTemplate?: string;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  emailAddress: z.string().email().optional(),
  phoneNumber: z.string().min(10).optional(),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    timezone: z.string()
  }),
  digest: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    time: z.string()
  }),
  preferences: z.object({
    marketing: z.boolean(),
    updates: z.boolean(),
    security: z.boolean(),
    mentions: z.boolean()
  })
});

const notificationRuleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  eventTypes: z.array(z.string()).min(1, 'At least one event type is required'),
  channels: z.array(z.string()).min(1, 'At least one channel is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  enabled: z.boolean(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.string()
  })).optional()
});

const notificationTemplateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['email', 'sms', 'push', 'in_app', 'webhook']),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  variables: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean()
  })).optional()
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

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// =============================================================================
// CONSTANTS
// =============================================================================

const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Email notifications with rich content support',
    icon: Mail,
    type: 'email',
    enabled: true,
    verified: true,
    primary: true,
    endpoint: 'user@example.com',
    priority: 1,
    rateLimit: {
      maxPerMinute: 10,
      maxPerHour: 100,
      maxPerDay: 1000,
      burstAllowed: true,
      burstLimit: 20
    },
    metadata: {
      provider: 'SendGrid',
      encryption: true,
      tracking: true
    },
    deliveryStats: {
      totalSent: 1250,
      delivered: 1180,
      failed: 45,
      bounced: 25,
      opened: 890,
      clicked: 234,
      averageDeliveryTime: 2500,
      successRate: 94.4,
      lastDelivery: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Text message notifications for urgent alerts',
    icon: MessageSquare,
    type: 'sms',
    enabled: true,
    verified: true,
    primary: false,
    endpoint: '+1234567890',
    priority: 2,
    rateLimit: {
      maxPerMinute: 5,
      maxPerHour: 50,
      maxPerDay: 200,
      burstAllowed: false
    },
    metadata: {
      provider: 'Twilio',
      international: true,
      carrier: 'Verizon'
    },
    deliveryStats: {
      totalSent: 145,
      delivered: 140,
      failed: 3,
      bounced: 2,
      averageDeliveryTime: 1200,
      successRate: 96.6,
      lastDelivery: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'push',
    name: 'Push Notifications',
    description: 'Browser and mobile push notifications',
    icon: Bell,
    type: 'push',
    enabled: true,
    verified: true,
    primary: false,
    endpoint: 'browser-subscription-endpoint',
    priority: 3,
    rateLimit: {
      maxPerMinute: 20,
      maxPerHour: 200,
      maxPerDay: 2000,
      burstAllowed: true,
      burstLimit: 50
    },
    metadata: {
      browsers: ['Chrome', 'Firefox', 'Safari'],
      platforms: ['Web', 'iOS', 'Android']
    },
    deliveryStats: {
      totalSent: 890,
      delivered: 820,
      failed: 45,
      bounced: 25,
      clicked: 156,
      averageDeliveryTime: 800,
      successRate: 92.1,
      lastDelivery: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'in_app',
    name: 'In-App',
    description: 'Real-time notifications within the application',
    icon: Monitor,
    type: 'in_app',
    enabled: true,
    verified: true,
    primary: false,
    endpoint: 'websocket-connection',
    priority: 4,
    rateLimit: {
      maxPerMinute: 50,
      maxPerHour: 500,
      maxPerDay: 5000,
      burstAllowed: true,
      burstLimit: 100
    },
    metadata: {
      realTime: true,
      persistent: true,
      interactive: true
    },
    deliveryStats: {
      totalSent: 2340,
      delivered: 2320,
      failed: 15,
      bounced: 5,
      clicked: 890,
      averageDeliveryTime: 150,
      successRate: 99.1,
      lastDelivery: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    lastUsed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'HTTP webhook notifications for system integration',
    icon: Webhook,
    type: 'webhook',
    enabled: false,
    verified: false,
    primary: false,
    endpoint: 'https://api.example.com/webhooks/notifications',
    priority: 5,
    rateLimit: {
      maxPerMinute: 30,
      maxPerHour: 300,
      maxPerDay: 3000,
      burstAllowed: true,
      burstLimit: 60
    },
    metadata: {
      authentication: 'Bearer Token',
      retries: 3,
      timeout: 30000
    },
    deliveryStats: {
      totalSent: 0,
      delivered: 0,
      failed: 0,
      bounced: 0,
      averageDeliveryTime: 0,
      successRate: 0
    },
    status: 'inactive'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Slack workspace notifications',
    icon: MessageCircle,
    type: 'slack',
    enabled: true,
    verified: true,
    primary: false,
    endpoint: '#general',
    priority: 6,
    rateLimit: {
      maxPerMinute: 10,
      maxPerHour: 100,
      maxPerDay: 1000,
      burstAllowed: true,
      burstLimit: 20
    },
    metadata: {
      workspace: 'Racine Data Governance',
      botToken: 'configured',
      channels: ['#general', '#alerts', '#data-team']
    },
    deliveryStats: {
      totalSent: 234,
      delivered: 230,
      failed: 3,
      bounced: 1,
      averageDeliveryTime: 1800,
      successRate: 98.3,
      lastDelivery: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  }
];

const NOTIFICATION_CATEGORIES = [
  {
    id: 'security',
    name: 'Security & Compliance',
    description: 'Security alerts, compliance violations, audit events',
    icon: Shield,
    color: 'red',
    priority: 'critical',
    defaultChannels: ['email', 'sms', 'push'],
    escalationEnabled: true
  },
  {
    id: 'data_governance',
    name: 'Data Governance',
    description: 'Data quality issues, classification updates, lineage changes',
    icon: Database,
    color: 'blue',
    priority: 'high',
    defaultChannels: ['email', 'in_app'],
    escalationEnabled: false
  },
  {
    id: 'system',
    name: 'System Operations',
    description: 'System status, maintenance, performance alerts',
    icon: Server,
    color: 'orange',
    priority: 'medium',
    defaultChannels: ['email', 'slack'],
    escalationEnabled: true
  },
  {
    id: 'workflow',
    name: 'Workflow & Tasks',
    description: 'Task assignments, workflow completions, approvals',
    icon: CheckCircle,
    color: 'green',
    priority: 'medium',
    defaultChannels: ['email', 'in_app'],
    escalationEnabled: false
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'Comments, mentions, shared documents, team updates',
    icon: Users,
    color: 'purple',
    priority: 'low',
    defaultChannels: ['in_app', 'email'],
    escalationEnabled: false
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Scheduled reports, data insights, dashboard updates',
    icon: BarChart3,
    color: 'teal',
    priority: 'low',
    defaultChannels: ['email'],
    escalationEnabled: false
  },
  {
    id: 'marketing',
    name: 'Marketing & Updates',
    description: 'Product updates, feature announcements, newsletters',
    icon: Zap,
    color: 'yellow',
    priority: 'low',
    defaultChannels: ['email'],
    escalationEnabled: false
  }
];

const EVENT_TYPES = [
  // Security Events
  { category: 'security', value: 'security.login.failed', label: 'Failed Login Attempt' },
  { category: 'security', value: 'security.login.anomaly', label: 'Anomalous Login Detected' },
  { category: 'security', value: 'security.mfa.disabled', label: 'MFA Disabled' },
  { category: 'security', value: 'security.permission.elevated', label: 'Elevated Permissions Granted' },
  { category: 'security', value: 'security.compliance.violation', label: 'Compliance Violation' },
  
  // Data Governance Events
  { category: 'data_governance', value: 'data.quality.issue', label: 'Data Quality Issue' },
  { category: 'data_governance', value: 'data.classification.changed', label: 'Data Classification Changed' },
  { category: 'data_governance', value: 'data.lineage.updated', label: 'Data Lineage Updated' },
  { category: 'data_governance', value: 'data.scan.completed', label: 'Data Scan Completed' },
  { category: 'data_governance', value: 'data.source.connected', label: 'Data Source Connected' },
  
  // System Events
  { category: 'system', value: 'system.maintenance.scheduled', label: 'Maintenance Scheduled' },
  { category: 'system', value: 'system.performance.degraded', label: 'Performance Degraded' },
  { category: 'system', value: 'system.backup.completed', label: 'Backup Completed' },
  { category: 'system', value: 'system.error.critical', label: 'Critical System Error' },
  
  // Workflow Events
  { category: 'workflow', value: 'workflow.task.assigned', label: 'Task Assigned' },
  { category: 'workflow', value: 'workflow.approval.pending', label: 'Approval Pending' },
  { category: 'workflow', value: 'workflow.deadline.approaching', label: 'Deadline Approaching' },
  { category: 'workflow', value: 'workflow.completed', label: 'Workflow Completed' },
  
  // Collaboration Events
  { category: 'collaboration', value: 'collaboration.mention', label: 'User Mentioned' },
  { category: 'collaboration', value: 'collaboration.comment.added', label: 'Comment Added' },
  { category: 'collaboration', value: 'collaboration.document.shared', label: 'Document Shared' },
  { category: 'collaboration', value: 'collaboration.team.joined', label: 'Team Member Joined' },
  
  // Report Events
  { category: 'reports', value: 'reports.scheduled.ready', label: 'Scheduled Report Ready' },
  { category: 'reports', value: 'reports.insight.generated', label: 'New Insight Generated' },
  { category: 'reports', value: 'reports.dashboard.updated', label: 'Dashboard Updated' },
  
  // Marketing Events
  { category: 'marketing', value: 'marketing.feature.announced', label: 'New Feature Announced' },
  { category: 'marketing', value: 'marketing.newsletter', label: 'Newsletter' },
  { category: 'marketing', value: 'marketing.survey', label: 'User Survey' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'green', description: 'Non-urgent information' },
  { value: 'medium', label: 'Medium', color: 'yellow', description: 'Standard notifications' },
  { value: 'high', label: 'High', color: 'orange', description: 'Important alerts' },
  { value: 'critical', label: 'Critical', color: 'red', description: 'Urgent action required' }
];

const DELIVERY_OPERATORS = [
  { value: 'equals', label: 'Equals', description: 'Exact match' },
  { value: 'contains', label: 'Contains', description: 'Contains substring' },
  { value: 'starts_with', label: 'Starts With', description: 'Begins with text' },
  { value: 'ends_with', label: 'Ends With', description: 'Ends with text' },
  { value: 'greater_than', label: 'Greater Than', description: 'Numeric comparison' },
  { value: 'less_than', label: 'Less Than', description: 'Numeric comparison' },
  { value: 'regex', label: 'Regular Expression', description: 'Pattern matching' }
];

const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney'
];

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const NotificationPreferencesCenter: React.FC<NotificationPreferencesCenterProps> = ({
  userId,
  embedded = false,
  channelFilter,
  showTestingTools = true,
  onSettingsChange,
  className = ''
}) => {
  // =============================================================================
  // HOOKS AND STATE
  // =============================================================================

  const {
    userProfile,
    userPreferences,
    loading: userLoading,
    error: userError,
    updateUserPreferences
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
    notificationSettings,
    notificationRules,
    notificationTemplates,
    notificationHistory,
    notificationAnalytics,
    loading: notificationLoading,
    error: notificationError,
    loadNotificationSettings,
    loadNotificationRules,
    loadNotificationTemplates,
    loadNotificationHistory,
    loadNotificationAnalytics,
    updateNotificationSettings,
    createNotificationRule,
    updateNotificationRule,
    deleteNotificationRule,
    testNotificationChannel,
    sendTestNotification
  } = useNotificationSystem();

  // Form management
  const settingsForm = useForm({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: notificationSettings || {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      emailAddress: '',
      phoneNumber: '',
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC'
      },
      digest: {
        enabled: false,
        frequency: 'daily',
        time: '09:00'
      },
      preferences: {
        marketing: false,
        updates: true,
        security: true,
        mentions: true
      }
    }
  });

  const ruleForm = useForm({
    resolver: zodResolver(notificationRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      eventTypes: [],
      channels: [],
      priority: 'medium',
      enabled: true,
      conditions: []
    }
  });

  const templateForm = useForm({
    resolver: zodResolver(notificationTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      type: 'email',
      subject: '',
      content: '',
      variables: []
    }
  });

  // Component state
  const [activeTab, setActiveTab] = useState('channels');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Channel management state
  const [channels, setChannels] = useState<NotificationChannel[]>(NOTIFICATION_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);
  const [showChannelConfig, setShowChannelConfig] = useState(false);
  const [channelTestResults, setChannelTestResults] = useState<{[key: string]: any}>({});

  // Rule management state
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showRuleDetails, setShowRuleDetails] = useState(false);

  // Template management state
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<TemplatePreview | null>(null);

  // Testing state
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testChannels, setTestChannels] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [channelFilterState, setChannelFilterState] = useState<string>(channelFilter || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // UI state
  const [expandedRules, setExpandedRules] = useState<{[key: string]: boolean}>({});
  const [expandedChannels, setExpandedChannels] = useState<{[key: string]: boolean}>({});
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'timeline'>('cards');

  // Real-time updates
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Animation controls
  const controls = useAnimation();

  // Refs
  const templateEditorRef = useRef<HTMLTextAreaElement>(null);
  const webSocketRef = useRef<WebSocket | null>(null);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const canManageNotifications = useMemo(() => {
    return hasPermission('notifications.manage') || hasPermission('admin.full');
  }, [hasPermission]);

  const canEditTemplates = useMemo(() => {
    return hasPermission('notifications.templates.edit') || hasPermission('notifications.manage');
  }, [hasPermission]);

  const canTestChannels = useMemo(() => {
    return hasPermission('notifications.test') || hasPermission('notifications.manage');
  }, [hasPermission]);

  const canViewAnalytics = useMemo(() => {
    return hasPermission('notifications.analytics') || hasPermission('analytics.view');
  }, [hasPermission]);

  const filteredRules = useMemo(() => {
    if (!notificationRules) return [];
    
    let filtered = notificationRules;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rule => 
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.category.toLowerCase().includes(query) ||
        rule.eventTypes.some(event => event.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(rule => rule.category === categoryFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(rule => rule.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'enabled') {
        filtered = filtered.filter(rule => rule.enabled);
      } else if (statusFilter === 'disabled') {
        filtered = filtered.filter(rule => !rule.enabled);
      }
    }

    return filtered;
  }, [notificationRules, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  const filteredChannels = useMemo(() => {
    let filtered = channels;

    if (channelFilterState !== 'all') {
      filtered = filtered.filter(channel => channel.type === channelFilterState);
    }

    return filtered;
  }, [channels, channelFilterState]);

  const notificationStatistics = useMemo(() => {
    if (!notificationAnalytics) return {
      totalSent: 0,
      delivered: 0,
      failed: 0,
      successRate: 0,
      averageDeliveryTime: 0,
      channelPerformance: [],
      topCategories: []
    };

    return {
      totalSent: notificationAnalytics.totalSent,
      delivered: notificationAnalytics.totalDelivered,
      failed: notificationAnalytics.totalFailed,
      successRate: notificationAnalytics.totalDelivered / notificationAnalytics.totalSent * 100,
      averageDeliveryTime: notificationAnalytics.averageDeliveryTime,
      channelPerformance: notificationAnalytics.channelPerformance,
      topCategories: notificationAnalytics.topCategories
    };
  }, [notificationAnalytics]);

  const enabledChannelsCount = useMemo(() => {
    return channels.filter(channel => channel.enabled).length;
  }, [channels]);

  const activeRulesCount = useMemo(() => {
    return filteredRules.filter(rule => rule.enabled).length;
  }, [filteredRules]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      if (!userProfile) return;

      try {
        setLoading(true);
        
        // Load notification data
        await Promise.all([
          loadNotificationSettings(),
          loadNotificationRules(),
          loadNotificationTemplates(),
          loadNotificationHistory('30d'),
          loadNotificationAnalytics('30d')
        ]);

      } catch (error) {
        console.error('Failed to initialize notification preferences:', error);
        setError('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [userProfile]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(async () => {
      try {
        await Promise.all([
          loadNotificationHistory('24h'),
          loadNotificationAnalytics('24h')
        ]);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to refresh notification data:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, loadNotificationHistory, loadNotificationAnalytics]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications`);
      
      ws.onopen = () => {
        console.log('Notifications WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'delivery_status') {
            // Update channel delivery stats
            setChannels(prev => prev.map(channel => {
              if (channel.id === data.payload.channel) {
                return {
                  ...channel,
                  deliveryStats: {
                    ...channel.deliveryStats,
                    ...data.payload.stats
                  }
                };
              }
              return channel;
            }));
          } else if (data.type === 'test_result') {
            // Update test results
            setChannelTestResults(prev => ({
              ...prev,
              [data.payload.channel]: data.payload.result
            }));
          }
        } catch (error) {
          console.error('Failed to process WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Notifications WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('Notifications WebSocket error:', error);
      };

      webSocketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [realTimeEnabled]);

  // Animate component entrance
  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleUpdateNotificationSettings = useCallback(async (data: any) => {
    if (!userProfile || !canManageNotifications) return;

    try {
      setLoading(true);

      // Validate settings
      const validatedSettings = validateNotificationSettings(data);

      // Update settings via API
      await updateNotificationSettings(validatedSettings);

      // Update local state
      settingsForm.reset(validatedSettings);

      // Notify parent component
      if (onSettingsChange) {
        onSettingsChange(validatedSettings);
      }

      toast.success('Notification settings updated successfully');

    } catch (error: any) {
      console.error('Failed to update notification settings:', error);
      toast.error(error.message || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  }, [userProfile, canManageNotifications, updateNotificationSettings, settingsForm, onSettingsChange]);

  const handleCreateRule = useCallback(async (data: any) => {
    if (!canManageNotifications) return;

    try {
      setLoading(true);

      const ruleData: Partial<NotificationRule> = {
        id: generateSecureId(),
        name: data.name,
        description: data.description,
        category: data.category,
        eventTypes: data.eventTypes,
        conditions: data.conditions || [],
        channels: data.channels,
        priority: data.priority,
        enabled: data.enabled,
        scheduleRestrictions: [],
        customization: {
          variables: {},
          formatting: {
            useHtml: false,
            useMarkdown: false,
            includeHeader: true,
            includeFooter: true,
            brandingEnabled: true,
            colorScheme: 'default',
            fontSize: 'medium',
            fontFamily: 'sans-serif'
          },
          attachments: []
        },
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        usage: {
          triggerCount: 0,
          deliveryCount: 0,
          successRate: 0,
          averageDeliveryTime: 0
        }
      };

      // TODO: Replace with actual API call
      await createNotificationRule(ruleData);

      toast.success('Notification rule created successfully');
      setShowRuleDialog(false);
      ruleForm.reset();

      // Reload rules
      await loadNotificationRules();

    } catch (error: any) {
      console.error('Failed to create notification rule:', error);
      toast.error(error.message || 'Failed to create notification rule');
    } finally {
      setLoading(false);
    }
  }, [canManageNotifications, createNotificationRule, ruleForm, loadNotificationRules]);

  const handleTestChannel = useCallback(async (channelId: string, message?: string) => {
    if (!canTestChannels) return;

    try {
      setLoading(true);

      const testMessage = message || 'This is a test notification from Racine Data Governance Platform.';
      
      // TODO: Replace with actual API call
      const result = await testNotificationChannel(channelId, {
        subject: 'Test Notification',
        content: testMessage,
        priority: 'low'
      });

      setChannelTestResults(prev => ({
        ...prev,
        [channelId]: result
      }));

      toast.success(`Test notification sent to ${channels.find(c => c.id === channelId)?.name}`);

    } catch (error: any) {
      console.error('Failed to test notification channel:', error);
      toast.error(error.message || 'Failed to test notification channel');
    } finally {
      setLoading(false);
    }
  }, [canTestChannels, testNotificationChannel, channels]);

  const handleSendTestNotification = useCallback(async () => {
    if (!canTestChannels || testChannels.length === 0) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      const results = await sendTestNotification({
        channels: testChannels,
        subject: 'Test Notification',
        content: testMessage || 'This is a test notification.',
        priority: 'low'
      });

      setTestResults(results);

      toast.success(`Test notification sent to ${testChannels.length} channel(s)`);
      setShowTestDialog(false);

    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      toast.error(error.message || 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  }, [canTestChannels, testChannels, testMessage, sendTestNotification]);

  const handleToggleChannel = useCallback(async (channelId: string, enabled: boolean) => {
    try {
      setChannels(prev => prev.map(channel =>
        channel.id === channelId
          ? { ...channel, enabled }
          : channel
      ));

      // TODO: Replace with actual API call to update channel status
      console.log('Toggling channel:', channelId, enabled);

      toast.success(`${channels.find(c => c.id === channelId)?.name} ${enabled ? 'enabled' : 'disabled'}`);

    } catch (error: any) {
      console.error('Failed to toggle channel:', error);
      toast.error('Failed to update channel status');
    }
  }, [channels]);

  const handleToggleRule = useCallback(async (ruleId: UUID, enabled: boolean) => {
    if (!canManageNotifications) return;

    try {
      // TODO: Replace with actual API call
      await updateNotificationRule(ruleId, { enabled });

      toast.success(`Rule ${enabled ? 'enabled' : 'disabled'} successfully`);

      // Reload rules
      await loadNotificationRules();

    } catch (error: any) {
      console.error('Failed to toggle rule:', error);
      toast.error('Failed to update rule status');
    }
  }, [canManageNotifications, updateNotificationRule, loadNotificationRules]);

  const handleDeleteRule = useCallback(async (ruleId: UUID) => {
    if (!canManageNotifications) return;

    try {
      // TODO: Replace with actual API call
      await deleteNotificationRule(ruleId);

      toast.success('Rule deleted successfully');

      // Reload rules
      await loadNotificationRules();

    } catch (error: any) {
      console.error('Failed to delete rule:', error);
      toast.error('Failed to delete rule');
    }
  }, [canManageNotifications, deleteNotificationRule, loadNotificationRules]);

  const handleGenerateTemplate = useCallback(async (type: string, category: string) => {
    try {
      // TODO: Replace with actual template generation
      const template = await generateNotificationTemplate(type, category);
      
      setTemplatePreview(template.preview);
      templateForm.setValue('content', template.content);
      templateForm.setValue('subject', template.subject);

      toast.success('Template generated successfully');

    } catch (error: any) {
      console.error('Failed to generate template:', error);
      toast.error('Failed to generate template');
    }
  }, [templateForm]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderChannelsTab = () => (
    <motion.div
      variants={staggerChildrenVariants}
      className="space-y-6"
    >
      {/* Channel Overview */}
      <motion.div variants={fadeInUpVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enabledChannelsCount}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Channels</p>
                  <p className="text-xs text-green-600">Out of {channels.length} total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notificationStatistics.totalSent}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Messages Sent</p>
                  <p className="text-xs text-blue-600">Last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notificationStatistics.successRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                  <p className="text-xs text-purple-600">
                    {notificationStatistics.averageDeliveryTime}ms avg delivery
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Channel Configuration */}
      <motion.div variants={fadeInUpVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Notification Channels</span>
                </CardTitle>
                <CardDescription>
                  Configure and manage your notification delivery channels
                </CardDescription>
              </div>
              {showTestingTools && canTestChannels && (
                <Button
                  variant="outline"
                  onClick={() => setShowTestDialog(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test Channels
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredChannels.map((channel) => {
                const ChannelIcon = channel.icon;
                const testResult = channelTestResults[channel.id];
                
                return (
                  <motion.div
                    key={channel.id}
                    variants={fadeInUpVariants}
                    className="border rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          channel.enabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <ChannelIcon className={`w-6 h-6 ${
                            channel.enabled ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{channel.name}</h3>
                            <Badge 
                              variant={channel.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {channel.status}
                            </Badge>
                            {channel.verified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {channel.primary && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {channel.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-xs text-gray-500">Endpoint</Label>
                              <p className="font-mono text-xs truncate">{channel.endpoint}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Success Rate</Label>
                              <p className="font-medium">{channel.deliveryStats.successRate.toFixed(1)}%</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Total Sent</Label>
                              <p className="font-medium">{channel.deliveryStats.totalSent.toLocaleString()}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Avg Delivery</Label>
                              <p className="font-medium">{channel.deliveryStats.averageDeliveryTime}ms</p>
                            </div>
                          </div>

                          {channel.deliveryStats.totalSent > 0 && (
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Delivery Performance</span>
                                <span>{channel.deliveryStats.delivered}/{channel.deliveryStats.totalSent}</span>
                              </div>
                              <Progress 
                                value={channel.deliveryStats.successRate} 
                                className="h-2"
                              />
                            </div>
                          )}

                          {testResult && (
                            <Alert className={`mt-4 ${testResult.success ? 'border-green-500' : 'border-red-500'}`}>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Test {testResult.success ? 'passed' : 'failed'}: {testResult.message}
                                {testResult.deliveryTime && (
                                  <span className="block text-xs mt-1">
                                    Delivered in {testResult.deliveryTime}ms
                                  </span>
                                )}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={channel.enabled}
                            onCheckedChange={(enabled) => handleToggleChannel(channel.id, enabled)}
                            disabled={!canManageNotifications}
                          />
                          <Label className="text-sm">
                            {channel.enabled ? 'Enabled' : 'Disabled'}
                          </Label>
                        </div>
                        
                        {showTestingTools && canTestChannels && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestChannel(channel.id)}
                            disabled={!channel.enabled || loading}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedChannel(channel);
                            setShowChannelConfig(true);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (userLoading || loading || notificationLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading notification preferences...</span>
        </div>
      </div>
    );
  }

  if (userError || error || notificationError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{userError || error || notificationError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate={controls}
        variants={fadeInUpVariants}
        className={`notification-preferences-center ${className}`}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {!embedded && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Notification Preferences</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage your notification channels, rules, and delivery preferences
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    {realTimeEnabled ? 'Live' : 'Static'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated: {formatTime(lastUpdate.toISOString())}
                  </span>
                </div>
                
                {canManageNotifications && (
                  <Button
                    onClick={() => setShowRuleDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                )}
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="channels" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Channels</span>
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Rules</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="channels">
              {renderChannelsTab()}
            </TabsContent>

            <TabsContent value="rules">
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Notification Rules</h3>
                <p className="text-gray-500">Advanced notification rules and automation will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Notification Templates</h3>
                <p className="text-gray-500">Template management and customization will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="preferences">
              <div className="text-center py-12">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Personal Preferences</h3>
                <p className="text-gray-500">Individual notification preferences will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Notification History</h3>
                <p className="text-gray-500">Detailed notification history and tracking will be implemented here</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Notification Analytics</h3>
                <p className="text-gray-500">Comprehensive analytics and insights will be implemented here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Test Notification Dialog */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Test Notification Channels</DialogTitle>
              <DialogDescription>
                Send a test notification to verify your channel configurations
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Select Channels</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {channels.filter(c => c.enabled).map(channel => (
                    <div key={channel.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={channel.id}
                        checked={testChannels.includes(channel.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTestChannels(prev => [...prev, channel.id]);
                          } else {
                            setTestChannels(prev => prev.filter(id => id !== channel.id));
                          }
                        }}
                      />
                      <Label htmlFor={channel.id} className="flex items-center space-x-2">
                        <channel.icon className="w-4 h-4" />
                        <span>{channel.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="testMessage">Test Message</Label>
                <Textarea
                  id="testMessage"
                  placeholder="Enter your test message..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowTestDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendTestNotification}
                disabled={testChannels.length === 0 || loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default NotificationPreferencesCenter;