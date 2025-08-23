"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  Rewind,
  CheckCircle as CheckCircleIcon,
  XCircle,
  AlertTriangle as AlertTriangleIcon,
  Info,
  Workflow,
  GitBranch,
  Database,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Route,
  Layers,
  Package,
  Component,
  Code,
  Terminal,
  Monitor,
  Users,
  User,
  Crown,
  Award,
  Star,
  Bookmark,
  Tag,
  Hash,
  Percent,
  DollarSign,
  Calculator,
  Plus,
  Minus,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Grid,
  List,
  Map,
  Navigation,
  Compass,
  MapPin,
  Globe,
  Wifi,
  Link,
  Unlink,
  Share2,
  Copy,
  Edit,
  Trash2,
  Save,
  FileText,
  File,
  Folder,
  Archive,
  History,
  Bell,
  BellOff,
  MessageSquare,
  Mail,
  Send,
  Phone,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Image,
  Film,
  Music,
  Headphones,
  Radio,
  Tv,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Gamepad2,
  Keyboard,
  Mouse,
  Printer,
  Projector,
  Lightbulb,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  Rainbow,
  Sunrise,
  Sunset,
  Wind,
  Thermometer,
  Gauge,
  Ruler,
  Scale,
  Timer as TimerIcon,
  AlarmClock,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Clock as ClockIcon,
  UserCheck,
  Users as UsersIcon,
  Building,
  Globe as GlobeIcon,
  Lock,
  Unlock,
  Key,
  Eye as EyeIcon,
  EyeOff,
  Shield as ShieldIcon,
  AlertCircle,
  CheckSquare,
  Square as SquareIcon,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Star as StarIcon,
  Heart,
  Diamond,
  Zap as ZapIcon,
  Sparkles,
  Wand2,
  Gem,
  Crown as CrownIcon,
  Trophy,
  Medal,
  Award as AwardIcon,
  Ribbon,
  Flag,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldOff,
  ShieldPlus,
  ShieldMinus,
  ShieldQuestion,
  Printer as PrinterIcon,
  Mail as MailIcon,
  Share as ShareIcon,
  ExternalLink,
  BookOpen,
  Book,
  FileText as FileTextIcon,
  File as FileIcon,
  Folder as FolderIcon,
  Archive as ArchiveIcon,
  Download as DownloadIcon,
  Upload,
  Copy as CopyIcon,
  Scissors,
  Paperclip,
  Link as LinkIcon,
  Unlink as UnlinkIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key as KeyIcon,
  Eye as EyeIcon2,
  EyeOff as EyeOffIcon,
  Shield as ShieldIcon2,
  AlertCircle as AlertCircleIcon,
  CheckSquare as CheckSquareIcon,
  Square as SquareIcon2,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon,
  Star as StarIcon2,
  Heart as HeartIcon,
  Diamond as DiamondIcon,
  Zap as ZapIcon2,
  Sparkles as SparklesIcon,
  Wand2 as Wand2Icon,
  Gem as GemIcon,
  Crown as CrownIcon2,
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  Award as AwardIcon2,
  Ribbon as RibbonIcon,
  Flag as FlagIcon,
  Palette,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Watch as WatchIcon,
  Gamepad2 as Gamepad2Icon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Printer as PrinterIcon2,
  Scanner as ScannerIcon,
  Fax as FaxIcon,
  Projector as ProjectorIcon,
  Lightbulb as LightbulbIcon,
  Flame as FlameIcon,
  Snowflake as SnowflakeIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon2,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon,
  Umbrella as UmbrellaIcon,
  Rainbow as RainbowIcon,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  Wind as WindIcon,
  Thermometer as ThermometerIcon,
  Gauge as GaugeIcon,
  Ruler as RulerIcon,
  Scale as ScaleIcon,
  Timer as TimerIcon2,
  Stopwatch as StopwatchIcon,
  AlarmClock as AlarmClockIcon,
  Calendar as CalendarIcon2,
  CalendarDays as CalendarDaysIcon,
  CalendarClock as CalendarClockIcon,
  CalendarCheck as CalendarCheckIcon,
  CalendarX as CalendarXIcon,
  CalendarPlus as CalendarPlusIcon,
  CalendarMinus as CalendarMinusIcon,
  Shield as ShieldIcon3,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  Clock as ClockIcon2,
  Calendar as CalendarIcon3,
  UserCheck as UserCheckIcon,
  Users as UsersIcon2,
  Building as BuildingIcon,
  Globe as GlobeIcon2,
  Lock as LockIcon2,
  Unlock as UnlockIcon2,
  Key as KeyIcon2,
  Eye as EyeIcon3,
  EyeOff as EyeOffIcon2,
  Shield as ShieldIcon4,
  AlertCircle as AlertCircleIcon2,
  CheckSquare as CheckSquareIcon2,
  Square as SquareIcon3,
  Circle as CircleIcon2,
  Triangle as TriangleIcon2,
  Hexagon as HexagonIcon2,
  Octagon as OctagonIcon2,
  Star as StarIcon3,
  Heart as HeartIcon2,
  Diamond as DiamondIcon2,
  Zap as ZapIcon3,
  Bolt as BoltIcon2,
  Flash as FlashIcon2,
  Sparkles as SparklesIcon2,
  Wand2 as Wand2Icon2,
  Magic as MagicIcon2,
  Crystal as CrystalIcon2,
  Gem as GemIcon2,
  Crown as CrownIcon3,
  Trophy as TrophyIcon2,
  Medal as MedalIcon2,
  Award as AwardIcon3,
  Ribbon as RibbonIcon2,
  Flag as FlagIcon2,
  Banner as BannerIcon2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Chart components for analytics
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Brush
} from 'recharts';

// Import types and hooks
import {
  AnalyticsConfiguration,
  AnalyticsSettings,
  AnalyticsTheme,
  AnalyticsRefreshInterval,
  AnalyticsDataRetention,
  AnalyticsNotificationSettings,
  AnalyticsExportSettings,
  AnalyticsSecuritySettings
} from '../../types/workflow.types';

import { useAnalyticsConfiguration } from '../../hooks/useWorkflowAnalytics';

interface AnalyticsConfigurationPanelProps {
  className?: string;
  onConfigurationChange?: (configuration: AnalyticsConfiguration) => void;
  onSettingsSave?: (settings: AnalyticsSettings) => void;
  onThemeChange?: (theme: AnalyticsTheme) => void;
}

export const AnalyticsConfigurationPanel: React.FC<AnalyticsConfigurationPanelProps> = ({
  className = '',
  onConfigurationChange,
  onSettingsSave,
  onThemeChange
}) => {
  const { configuration, updateConfiguration } = useAnalyticsConfiguration();
  const [localConfiguration, setLocalConfiguration] = useState<AnalyticsConfiguration>(configuration);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Update local configuration when global configuration changes
  useEffect(() => {
    setLocalConfiguration(configuration);
    setIsDirty(false);
  }, [configuration]);

  // Handle configuration changes
  const handleConfigurationChange = (updates: Partial<AnalyticsConfiguration>) => {
    const newConfiguration = { ...localConfiguration, ...updates };
    setLocalConfiguration(newConfiguration);
    setIsDirty(true);
    onConfigurationChange?.(newConfiguration);
  };

  // Save configuration
  const handleSave = () => {
    updateConfiguration(localConfiguration);
    setIsDirty(false);
    onSettingsSave?.(localConfiguration);
  };

  // Reset configuration
  const handleReset = () => {
    setLocalConfiguration(configuration);
    setIsDirty(false);
  };

  // Get theme options
  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'auto', label: 'Auto', icon: <Monitor className="h-4 w-4" /> },
    { value: 'high-contrast', label: 'High Contrast', icon: <Eye className="h-4 w-4" /> }
  ];

  // Get refresh interval options
  const refreshIntervalOptions = [
    { value: 5000, label: '5 seconds' },
    { value: 10000, label: '10 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 0, label: 'Disabled' }
  ];

  // Get data retention options
  const dataRetentionOptions = [
    { value: '1d', label: '1 day' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: '180d', label: '180 days' },
    { value: '365d', label: '1 year' },
    { value: 'unlimited', label: 'Unlimited' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Analytics Configuration</CardTitle>
            {isDirty && <Badge variant="secondary">Modified</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
        <CardDescription>
          Configure analytics settings, themes, and preferences
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Auto Refresh Interval</Label>
                <Select 
                  value={localConfiguration.refreshInterval.toString()} 
                  onValueChange={(value) => handleConfigurationChange({ refreshInterval: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select refresh interval" />
                  </SelectTrigger>
                  <SelectContent>
                    {refreshIntervalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How often analytics data should be automatically refreshed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention</Label>
                <Select 
                  value={localConfiguration.dataRetention} 
                  onValueChange={(value) => handleConfigurationChange({ dataRetention: value as AnalyticsDataRetention })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataRetentionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long to keep analytics data before automatic cleanup
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable real-time data updates and live monitoring
                    </p>
                  </div>
                  <Switch
                    checked={localConfiguration.enableRealTimeUpdates}
                    onCheckedChange={(checked) => handleConfigurationChange({ enableRealTimeUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anomaly Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered anomaly detection and alerts
                    </p>
                  </div>
                  <Switch
                    checked={localConfiguration.enableAnomalyDetection}
                    onCheckedChange={(checked) => handleConfigurationChange({ enableAnomalyDetection: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Predictive Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable machine learning predictions and forecasting
                    </p>
                  </div>
                  <Switch
                    checked={localConfiguration.enablePredictions}
                    onCheckedChange={(checked) => handleConfigurationChange({ enablePredictions: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chart-theme">Chart Theme</Label>
                <Select 
                  value={localConfiguration.chartTheme} 
                  onValueChange={(value) => handleConfigurationChange({ chartTheme: value as AnalyticsTheme })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the visual theme for charts and analytics displays
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chart-animations">Chart Animations</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="chart-animations"
                    checked={localConfiguration.enableChartAnimations ?? true}
                    onCheckedChange={(checked) => handleConfigurationChange({ enableChartAnimations: checked })}
                  />
                  <Label htmlFor="chart-animations">Enable smooth animations</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable smooth transitions and animations in charts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chart-interactivity">Chart Interactivity</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="chart-interactivity"
                    checked={localConfiguration.enableChartInteractivity ?? true}
                    onCheckedChange={(checked) => handleConfigurationChange({ enableChartInteractivity: checked })}
                  />
                  <Label htmlFor="chart-interactivity">Enable interactive features</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable hover effects, zooming, and other interactive features
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-chart-type">Default Chart Type</Label>
                <Select 
                  value={localConfiguration.defaultChartType ?? 'line'} 
                  onValueChange={(value) => handleConfigurationChange({ defaultChartType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Default chart type for new analytics visualizations
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive analytics alerts and reports via email
                  </p>
                </div>
                <Switch
                  checked={localConfiguration.enableEmailNotifications ?? false}
                  onCheckedChange={(checked) => handleConfigurationChange({ enableEmailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time push notifications for important events
                  </p>
                </div>
                <Switch
                  checked={localConfiguration.enablePushNotifications ?? false}
                  onCheckedChange={(checked) => handleConfigurationChange({ enablePushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Anomaly Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when anomalies are detected
                  </p>
                </div>
                <Switch
                  checked={localConfiguration.enableAnomalyAlerts ?? true}
                  onCheckedChange={(checked) => handleConfigurationChange({ enableAnomalyAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Performance Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when performance thresholds are exceeded
                  </p>
                </div>
                <Switch
                  checked={localConfiguration.enablePerformanceAlerts ?? true}
                  onCheckedChange={(checked) => handleConfigurationChange({ enablePerformanceAlerts: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Notification Frequency</Label>
                <Select 
                  value={localConfiguration.notificationFrequency ?? 'immediate'} 
                  onValueChange={(value) => handleConfigurationChange({ notificationFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How often to receive notification digests
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    Encrypt analytics data at rest and in transit
                  </p>
                </div>
                <Switch
                  checked={localConfiguration.enableDataEncryption ?? true}
                  onCheckedChange={(checked) => handleConfigurationChange({ enableDataEncryption: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Access Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all analytics data access and modifications
                  </p>
                </div>
                <Switch
                  checked={localConfiguration.enableAccessLogging ?? true}
                  onCheckedChange={(checked) => handleConfigurationChange({ enableAccessLogging: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Anonymization</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically anonymize sensitive data in analytics
                  </p>
                </div>
                <Switch
                  checked={localConfiguration.enableDataAnonymization ?? false}
                  onCheckedChange={(checked) => handleConfigurationChange({ enableDataAnonymization: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout</Label>
                <Select 
                  value={localConfiguration.sessionTimeout?.toString() ?? '3600'} 
                  onValueChange={(value) => handleConfigurationChange({ sessionTimeout: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="900">15 minutes</SelectItem>
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="7200">2 hours</SelectItem>
                    <SelectItem value="14400">4 hours</SelectItem>
                    <SelectItem value="28800">8 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long before analytics sessions expire
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <Textarea
                  placeholder="Enter IP addresses (one per line)"
                  value={localConfiguration.ipWhitelist?.join('\n') ?? ''}
                  onChange={(e) => handleConfigurationChange({ 
                    ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) 
                  })}
                />
                <p className="text-sm text-muted-foreground">
                  Restrict analytics access to specific IP addresses (optional)
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsConfigurationPanel;
