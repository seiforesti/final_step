'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Calendar, Play, Pause, Settings, Zap, Brain, Target,
  CalendarDays, CalendarCheck, CalendarX, CalendarPlus, Timer,
  Bell, BellOff, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Plus, Minus, X, Edit3, Save, Download, Upload, Eye, EyeOff,
  MoreHorizontal, Filter, Search, BarChart3, TrendingUp, Activity,
  Globe, MapPin, Sunrise, Sunset, Moon, Sun, CloudRain, Zap as Lightning,
  FileText, Package, Users, Shield, Database, Network, HelpCircle,
  Copy, Share2, Bookmark, History, Lightbulb, Workflow, Bot, Code
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';

// Advanced Chart components
import { LineChart, BarChart, AreaChart, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, Line, Bar, Area, Pie, Cell } from 'recharts';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types from racine-core.types
import { 
  JobSchedule,
  CronExpression,
  ScheduleTrigger,
  EventTrigger,
  ScheduleConflict,
  ResourceSchedule,
  ScheduleOptimization,
  ScheduleAnalytics,
  RecurrencePattern,
  TimeZoneConfig,
  ScheduleValidation,
  ScheduleExecution,
  ScheduleTemplate,
  ConditionalSchedule,
  DependentSchedule,
  PrioritySchedule,
  NotificationConfig,
  RetryPolicy
} from '../../types/racine-core.types';

// Comprehensive Cron Expression Presets
const CRON_PRESETS = {
  'every-minute': { expression: '* * * * *', description: 'Every minute', category: 'frequent' },
  'every-5-minutes': { expression: '*/5 * * * *', description: 'Every 5 minutes', category: 'frequent' },
  'every-15-minutes': { expression: '*/15 * * * *', description: 'Every 15 minutes', category: 'frequent' },
  'every-30-minutes': { expression: '*/30 * * * *', description: 'Every 30 minutes', category: 'frequent' },
  'hourly': { expression: '0 * * * *', description: 'Every hour', category: 'regular' },
  'every-2-hours': { expression: '0 */2 * * *', description: 'Every 2 hours', category: 'regular' },
  'every-4-hours': { expression: '0 */4 * * *', description: 'Every 4 hours', category: 'regular' },
  'every-6-hours': { expression: '0 */6 * * *', description: 'Every 6 hours', category: 'regular' },
  'every-12-hours': { expression: '0 */12 * * *', description: 'Every 12 hours', category: 'regular' },
  'daily': { expression: '0 0 * * *', description: 'Daily at midnight', category: 'daily' },
  'daily-morning': { expression: '0 9 * * *', description: 'Daily at 9 AM', category: 'daily' },
  'daily-evening': { expression: '0 18 * * *', description: 'Daily at 6 PM', category: 'daily' },
  'weekdays': { expression: '0 9 * * 1-5', description: 'Weekdays at 9 AM', category: 'weekly' },
  'weekends': { expression: '0 10 * * 0,6', description: 'Weekends at 10 AM', category: 'weekly' },
  'weekly': { expression: '0 0 * * 0', description: 'Weekly on Sunday', category: 'weekly' },
  'bi-weekly': { expression: '0 0 * * 0/2', description: 'Every 2 weeks', category: 'weekly' },
  'monthly': { expression: '0 0 1 * *', description: 'Monthly on 1st', category: 'monthly' },
  'monthly-mid': { expression: '0 0 15 * *', description: 'Monthly on 15th', category: 'monthly' },
  'quarterly': { expression: '0 0 1 */3 *', description: 'Quarterly', category: 'quarterly' },
  'semi-annually': { expression: '0 0 1 */6 *', description: 'Semi-annually', category: 'yearly' },
  'annually': { expression: '0 0 1 1 *', description: 'Annually on Jan 1st', category: 'yearly' },
  'business-hours': { expression: '0 9-17 * * 1-5', description: 'Business hours (9-5, Mon-Fri)', category: 'business' },
  'off-hours': { expression: '0 18-8 * * *', description: 'Off hours (6PM-8AM)', category: 'business' },
  'maintenance-window': { expression: '0 2 * * 0', description: 'Sunday 2 AM maintenance', category: 'maintenance' }
};

// Event Trigger Types with Advanced Options
const EVENT_TRIGGER_TYPES = {
  FILE_CHANGE: { 
    type: 'file_change', 
    icon: FileText, 
    color: '#3b82f6',
    description: 'File system changes',
    parameters: ['path', 'pattern', 'event_type']
  },
  API_CALL: { 
    type: 'api_call', 
    icon: Network, 
    color: '#10b981',
    description: 'API endpoint calls',
    parameters: ['endpoint', 'method', 'status_code']
  },
  SPA_EVENT: { 
    type: 'spa_event', 
    icon: Package, 
    color: '#f59e0b',
    description: 'SPA events and actions',
    parameters: ['spa_id', 'event_type', 'payload_filter']
  },
  WORKFLOW_COMPLETION: { 
    type: 'workflow_completion', 
    icon: Workflow, 
    color: '#8b5cf6',
    description: 'Workflow completions',
    parameters: ['workflow_id', 'status', 'duration_threshold']
  },
  DATA_ARRIVAL: { 
    type: 'data_arrival', 
    icon: Database, 
    color: '#06b6d4',
    description: 'New data availability',
    parameters: ['source', 'volume_threshold', 'freshness']
  },
  THRESHOLD_BREACH: { 
    type: 'threshold_breach', 
    icon: AlertTriangle, 
    color: '#ef4444',
    description: 'Metric threshold breaches',
    parameters: ['metric', 'threshold', 'comparison']
  },
  SCHEDULE_DEPENDENCY: { 
    type: 'schedule_dependency', 
    icon: Clock, 
    color: '#ec4899',
    description: 'Other schedule completions',
    parameters: ['schedule_id', 'status', 'delay_tolerance']
  },
  EXTERNAL_WEBHOOK: {
    type: 'external_webhook',
    icon: Globe,
    color: '#6b7280',
    description: 'External webhook triggers',
    parameters: ['webhook_url', 'auth_token', 'payload_validation']
  }
};

// Comprehensive Time Zone Options
const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: '-06:00' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: '-08:00' },
  { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'CET (Central European Time)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'CET (Central European Time)', offset: '+01:00' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'CST (China Standard Time)', offset: '+08:00' },
  { value: 'Asia/Kolkata', label: 'IST (India Standard Time)', offset: '+05:30' },
  { value: 'Asia/Dubai', label: 'GST (Gulf Standard Time)', offset: '+04:00' },
  { value: 'Australia/Sydney', label: 'AEST (Australian Eastern)', offset: '+10:00' },
  { value: 'Pacific/Auckland', label: 'NZST (New Zealand)', offset: '+12:00' }
];

// Schedule Priority Levels
const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low Priority', color: '#6b7280', description: 'Can be delayed if resources are constrained' },
  { value: 'normal', label: 'Normal Priority', color: '#3b82f6', description: 'Standard execution priority' },
  { value: 'high', label: 'High Priority', color: '#f59e0b', description: 'Preferred execution when resources allow' },
  { value: 'critical', label: 'Critical Priority', color: '#ef4444', description: 'Must execute on time, allocate resources' },
  { value: 'emergency', label: 'Emergency Priority', color: '#dc2626', description: 'Override all other schedules' }
];

interface JobSchedulingEngineProps {
  workflowId?: string;
  initialSchedule?: JobSchedule;
  onScheduleChange?: (schedule: JobSchedule) => void;
  onScheduleSave?: (schedule: JobSchedule) => void;
  onScheduleTest?: (schedule: JobSchedule) => void;
  readonly?: boolean;
  showAdvancedFeatures?: boolean;
  className?: string;
}

const JobSchedulingEngine: React.FC<JobSchedulingEngineProps> = ({
  workflowId,
  initialSchedule,
  onScheduleChange,
  onScheduleSave,
  onScheduleTest,
  readonly = false,
  showAdvancedFeatures = true,
  className = ''
}) => {
  // Hooks for Backend Integration
  const { 
    createSchedule,
    updateSchedule,
    deleteSchedule,
    validateSchedule,
    testSchedule,
    getScheduleConflicts,
    optimizeSchedule,
    getScheduleAnalytics,
    getScheduleTemplates,
    predictScheduleLoad,
    getScheduleHistory
  } = useJobWorkflow();
  
  const { 
    orchestrateSchedule,
    getResourceAvailability,
    getSystemLoad,
    getTimezoneInfo,
    validateSchedulePermissions
  } = useRacineOrchestration();
  
  const { 
    getSPAEvents,
    getWorkflowCompletions,
    validateCrossGroupSchedule,
    getExternalTriggers
  } = useCrossGroupIntegration();
  
  const { getCurrentUser } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    optimizeScheduleWithAI,
    suggestScheduleImprovements,
    detectScheduleConflicts,
    predictOptimalTiming,
    analyzeSchedulePerformance
  } = useAIAssistant();

  // Core Schedule State
  const [schedule, setSchedule] = useState<JobSchedule>(initialSchedule || {
    id: '',
    name: 'New Schedule',
    description: '',
    workflow_id: workflowId || '',
    cron_expression: '0 0 * * *',
    timezone: 'UTC',
    enabled: true,
    priority: 'normal',
    triggers: [],
    conditions: [],
    dependencies: [],
    resource_requirements: {},
    retry_policy: {
      max_retries: 3,
      retry_delay: 60,
      backoff_multiplier: 2,
      retry_on_failure: true
    },
    notification_config: {
      on_success: false,
      on_failure: true,
      on_delay: true,
      channels: ['email']
    },
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: '1.0.0',
      tags: []
    }
  });

  // Cron Builder State
  const [cronBuilder, setCronBuilder] = useState({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*'
  });

  // Advanced Features State
  const [eventTriggers, setEventTriggers] = useState<EventTrigger[]>([]);
  const [scheduleConflicts, setScheduleConflicts] = useState<ScheduleConflict[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<ScheduleOptimization[]>([]);
  const [scheduleAnalytics, setScheduleAnalytics] = useState<ScheduleAnalytics | null>(null);
  const [upcomingExecutions, setUpcomingExecutions] = useState<ScheduleExecution[]>([]);
  const [scheduleTemplates, setScheduleTemplates] = useState<ScheduleTemplate[]>([]);
  const [resourceAvailability, setResourceAvailability] = useState<any>(null);
  const [systemLoadPrediction, setSystemLoadPrediction] = useState<any>(null);

  // UI State Management
  const [activeTab, setActiveTab] = useState('basic');
  const [showCronBuilder, setShowCronBuilder] = useState(false);
  const [showEventTriggers, setShowEventTriggers] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [previewRange, setPreviewRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [presetCategory, setPresetCategory] = useState<string>('all');

  // Validation and Processing State
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>(null);

  // Performance State
  const [loadTime, setLoadTime] = useState(0);
  const [lastOptimized, setLastOptimized] = useState<Date | null>(null);

  // Refs
  const cronInputRef = useRef<HTMLInputElement>(null);
  const scheduleFormRef = useRef<HTMLFormElement>(null);

  // Cron Expression Builder Logic
  const buildCronExpression = useCallback(() => {
    const { minute, hour, day, month, weekday } = cronBuilder;
    return `${minute} ${hour} ${day} ${month} ${weekday}`;
  }, [cronBuilder]);

  const parseCronExpression = useCallback((expression: string) => {
    const parts = expression.split(' ');
    if (parts.length === 5) {
      setCronBuilder({
        minute: parts[0],
        hour: parts[1],
        day: parts[2],
        month: parts[3],
        weekday: parts[4]
      });
    }
  }, []);

  const updateCronPart = useCallback((part: string, value: string) => {
    setCronBuilder(prev => {
      const newBuilder = { ...prev, [part]: value };
      const newExpression = `${newBuilder.minute} ${newBuilder.hour} ${newBuilder.day} ${newBuilder.month} ${newBuilder.weekday}`;
      setSchedule(prevSchedule => ({ ...prevSchedule, cron_expression: newExpression }));
      return newBuilder;
    });
  }, []);

  // Advanced Schedule Validation
  const validateScheduleConfiguration = useCallback(async () => {
    if (!schedule.cron_expression || !schedule.name) return;

    setIsValidating(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    const startTime = Date.now();

    try {
      // Parallel validation for better performance
      const [
        basicValidation,
        conflicts,
        crossValidation,
        permissionValidation,
        resourceValidation
      ] = await Promise.all([
        validateSchedule(schedule),
        getScheduleConflicts(schedule),
        validateCrossGroupSchedule(schedule),
        validateSchedulePermissions(getCurrentUser()?.id || '', schedule),
        getResourceAvailability(schedule.resource_requirements || {})
      ]);

      setScheduleConflicts(conflicts);
      setResourceAvailability(resourceValidation);
      
      const allErrors = [
        ...(basicValidation.errors || []),
        ...(crossValidation.errors || []),
        ...(permissionValidation.errors || [])
      ];
      
      const allWarnings = [
        ...(basicValidation.warnings || []),
        ...(crossValidation.warnings || []),
        ...(permissionValidation.warnings || [])
      ];
      
      setValidationErrors(allErrors);
      setValidationWarnings(allWarnings);
      
      // Update schedule with validation results
      setSchedule(prev => ({
        ...prev,
        validation: {
          is_valid: allErrors.length === 0,
          errors: allErrors,
          warnings: allWarnings,
          conflicts: conflicts,
          last_validated: new Date().toISOString()
        },
        metadata: {
          ...prev.metadata,
          last_validated: new Date().toISOString(),
          is_valid: allErrors.length === 0,
          error_count: allErrors.length,
          warning_count: allWarnings.length
        }
      }));

      // Track validation performance
      const validationTime = Date.now() - startTime;
      setLoadTime(validationTime);

      // Track validation activity
      trackActivity({
        action: 'schedule_validated',
        resource_type: 'job_schedule',
        resource_id: schedule.id || 'new',
        details: {
          is_valid: allErrors.length === 0,
          error_count: allErrors.length,
          warning_count: allWarnings.length,
          conflict_count: conflicts.length,
          validation_time: validationTime,
          cron_expression: schedule.cron_expression,
          timezone: schedule.timezone
        }
      });
    } catch (error) {
      console.error('❌ Schedule validation failed:', error);
      setValidationErrors(['Schedule validation failed. Please try again.']);
    } finally {
      setIsValidating(false);
    }
  }, [
    schedule, validateSchedule, getScheduleConflicts, validateCrossGroupSchedule, 
    validateSchedulePermissions, getResourceAvailability, getCurrentUser, trackActivity
  ]);

  // AI-Powered Schedule Optimization
  const optimizeScheduleWithAIAnalysis = useCallback(async () => {
    if (!schedule.cron_expression || !schedule.name) return;

    setIsOptimizing(true);

    try {
      // Get comprehensive optimization data
      const [
        aiOptimizations,
        systemLoad,
        resourcePredictions,
        historicalAnalytics,
        optimalTiming
      ] = await Promise.all([
        optimizeScheduleWithAI(schedule),
        getSystemLoad(),
        predictScheduleLoad(schedule),
        getScheduleAnalytics(schedule.id),
        predictOptimalTiming(schedule)
      ]);

      // Combine all optimization suggestions
      const combinedOptimizations: ScheduleOptimization[] = [
        ...aiOptimizations,
        {
          type: 'timing_optimization',
          title: 'Optimal Timing Recommendation',
          description: `Based on system load analysis, consider running at ${optimalTiming.recommended_time}`,
          impact: 'medium',
          confidence: optimalTiming.confidence,
          suggested_changes: {
            cron_expression: optimalTiming.optimized_cron,
            timezone: optimalTiming.optimal_timezone
          },
          estimated_improvement: {
            performance: optimalTiming.performance_gain,
            resource_efficiency: optimalTiming.resource_savings,
            success_rate: optimalTiming.success_improvement
          }
        },
        {
          type: 'resource_optimization',
          title: 'Resource-Aware Scheduling',
          description: 'Optimize schedule based on predicted resource availability',
          impact: resourcePredictions.impact_level,
          suggested_changes: {
            resource_requirements: resourcePredictions.optimized_requirements,
            priority: resourcePredictions.recommended_priority
          },
          estimated_improvement: {
            resource_efficiency: resourcePredictions.efficiency_gain
          }
        }
      ];

      setOptimizationSuggestions(combinedOptimizations);
      setSystemLoadPrediction(systemLoad);
      setScheduleAnalytics(historicalAnalytics);
      setShowOptimizations(true);
      setLastOptimized(new Date());

      // Track optimization activity
      trackActivity({
        action: 'schedule_optimized',
        resource_type: 'job_schedule',
        resource_id: schedule.id || 'new',
        details: {
          optimization_count: combinedOptimizations.length,
          has_ai_suggestions: aiOptimizations.length > 0,
          system_load_factor: systemLoad.average_load,
          optimal_timing: optimalTiming.recommended_time,
          confidence_score: optimalTiming.confidence
        }
      });
    } catch (error) {
      console.error('❌ Schedule optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [
    schedule, optimizeScheduleWithAI, getSystemLoad, predictScheduleLoad,
    getScheduleAnalytics, predictOptimalTiming, trackActivity
  ]);

  // Test Schedule Configuration
  const testScheduleConfiguration = useCallback(async () => {
    if (!schedule.cron_expression || !schedule.name) return;

    setIsTesting(true);

    try {
      const testResult = await testSchedule(schedule);
      setTestResults(testResult);

      // Track test activity
      trackActivity({
        action: 'schedule_tested',
        resource_type: 'job_schedule',
        resource_id: schedule.id || 'new',
        details: {
          test_success: testResult.success,
          test_duration: testResult.duration,
          simulated_executions: testResult.simulated_executions
        }
      });
    } catch (error) {
      console.error('❌ Schedule test failed:', error);
      setTestResults({ success: false, error: error.message });
    } finally {
      setIsTesting(false);
    }
  }, [schedule, testSchedule, trackActivity]);

  // Save Schedule with Enhanced Error Handling
  const saveSchedule = useCallback(async () => {
    if (!schedule.name || !schedule.cron_expression) return;

    setIsSaving(true);

    try {
      let savedSchedule: JobSchedule;
      
      if (schedule.id) {
        savedSchedule = await updateSchedule(schedule.id, schedule);
      } else {
        savedSchedule = await createSchedule({
          ...schedule,
          created_by: getCurrentUser()?.id || '',
          workspace_id: getActiveWorkspace()?.id || ''
        });
      }

      setSchedule(savedSchedule);
      
      // Track save activity with detailed metrics
      trackActivity({
        action: schedule.id ? 'schedule_updated' : 'schedule_created',
        resource_type: 'job_schedule',
        resource_id: savedSchedule.id,
        details: {
          schedule_name: savedSchedule.name,
          cron_expression: savedSchedule.cron_expression,
          timezone: savedSchedule.timezone,
          enabled: savedSchedule.enabled,
          priority: savedSchedule.priority,
          has_triggers: (savedSchedule.triggers || []).length > 0,
          has_conditions: (savedSchedule.conditions || []).length > 0,
          has_dependencies: (savedSchedule.dependencies || []).length > 0,
          validation_status: savedSchedule.validation?.is_valid || false
        }
      });

      onScheduleSave?.(savedSchedule);
    } catch (error) {
      console.error('❌ Failed to save schedule:', error);
    } finally {
      setIsSaving(false);
    }
  }, [schedule, createSchedule, updateSchedule, getCurrentUser, getActiveWorkspace, trackActivity, onScheduleSave]);

  // Load Schedule Templates
  const loadScheduleTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);

    try {
      const templates = await getScheduleTemplates();
      setScheduleTemplates(templates);
    } catch (error) {
      console.error('❌ Failed to load schedule templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [getScheduleTemplates]);

  // Generate Execution Preview with Advanced Logic
  const generateExecutionPreview = useCallback(() => {
    if (!schedule.cron_expression) return;

    // Enhanced execution preview logic
    const executions: ScheduleExecution[] = [];
    const now = new Date();
    
    // Generate realistic preview based on cron expression and timezone
    for (let i = 0; i < 20; i++) {
      const nextExecution = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
      executions.push({
        id: `preview_${i}`,
        schedule_id: schedule.id || 'preview',
        scheduled_time: nextExecution.toISOString(),
        status: 'scheduled',
        estimated_duration: await predictExecutionDuration(schedule, executionId) || 600, // Get from backend prediction
        resource_allocation: schedule.resource_requirements || {},
        priority: schedule.priority || 'normal',
        timezone: schedule.timezone,
        conditions_met: true,
        dependencies_satisfied: true
      });
    }
    
    setUpcomingExecutions(executions);
  }, [schedule.cron_expression, schedule.id, schedule.resource_requirements, schedule.priority, schedule.timezone]);

  // Advanced Cron Builder Render
  const renderAdvancedCronBuilder = () => (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Visual Cron Builder
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const expression = buildCronExpression();
                setSchedule(prev => ({ ...prev, cron_expression: expression }));
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCronBuilder(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Preset Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Quick Presets</Label>
              <Select value={presetCategory} onValueChange={setPresetCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="frequent">Frequent</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(CRON_PRESETS)
                .filter(([_, preset]) => presetCategory === 'all' || preset.category === presetCategory)
                .map(([key, preset]) => (
                  <Button
                    key={key}
                    variant={selectedPreset === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedPreset(key);
                      setSchedule(prev => ({ ...prev, cron_expression: preset.expression }));
                      parseCronExpression(preset.expression);
                    }}
                    disabled={readonly}
                    className="text-xs h-auto py-2 px-3"
                  >
                    <div className="text-center">
                      <div className="font-medium">{preset.description}</div>
                      <div className="text-xs opacity-75 font-mono">{preset.expression}</div>
                    </div>
                  </Button>
                ))}
            </div>
          </div>

          <Separator />

          {/* Advanced Manual Builder */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Manual Configuration</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Minute Configuration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Minute
                </Label>
                <Select 
                  value={cronBuilder.minute} 
                  onValueChange={(value) => updateCronPart('minute', value)}
                  disabled={readonly}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">Every minute (*)</SelectItem>
                    <SelectItem value="0">:00</SelectItem>
                    <SelectItem value="15">:15</SelectItem>
                    <SelectItem value="30">:30</SelectItem>
                    <SelectItem value="45">:45</SelectItem>
                    <SelectItem value="*/5">Every 5 min (*/5)</SelectItem>
                    <SelectItem value="*/10">Every 10 min (*/10)</SelectItem>
                    <SelectItem value="*/15">Every 15 min (*/15)</SelectItem>
                    <SelectItem value="*/30">Every 30 min (*/30)</SelectItem>
                    <SelectItem value="0,15,30,45">Quarter hours</SelectItem>
                    <SelectItem value="0,30">Half hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Hour Configuration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <Sun className="h-3 w-3 mr-1" />
                  Hour
                </Label>
                <Select 
                  value={cronBuilder.hour} 
                  onValueChange={(value) => updateCronPart('hour', value)}
                  disabled={readonly}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">Every hour (*)</SelectItem>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                    <SelectItem value="*/2">Every 2 hours (*/2)</SelectItem>
                    <SelectItem value="*/4">Every 4 hours (*/4)</SelectItem>
                    <SelectItem value="*/6">Every 6 hours (*/6)</SelectItem>
                    <SelectItem value="*/12">Every 12 hours (*/12)</SelectItem>
                    <SelectItem value="9-17">Business hours (9-17)</SelectItem>
                    <SelectItem value="18-8">Off hours (18-8)</SelectItem>
                    <SelectItem value="0,6,12,18">Quarter day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Day Configuration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  Day
                </Label>
                <Select 
                  value={cronBuilder.day} 
                  onValueChange={(value) => updateCronPart('day', value)}
                  disabled={readonly}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">Every day (*)</SelectItem>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Day {i + 1}
                      </SelectItem>
                    ))}
                    <SelectItem value="1">1st of month</SelectItem>
                    <SelectItem value="15">15th of month</SelectItem>
                    <SelectItem value="L">Last day of month</SelectItem>
                    <SelectItem value="1,15">1st & 15th</SelectItem>
                    <SelectItem value="*/7">Every 7 days</SelectItem>
                    <SelectItem value="1-7">First week</SelectItem>
                    <SelectItem value="L-7">Last week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Month Configuration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Month
                </Label>
                <Select 
                  value={cronBuilder.month} 
                  onValueChange={(value) => updateCronPart('month', value)}
                  disabled={readonly}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">Every month (*)</SelectItem>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                    <SelectItem value="*/3">Quarterly (*/3)</SelectItem>
                    <SelectItem value="*/6">Bi-annually (*/6)</SelectItem>
                    <SelectItem value="1,4,7,10">Fiscal quarters</SelectItem>
                    <SelectItem value="6,12">Mid & end year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Weekday Configuration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <CalendarCheck className="h-3 w-3 mr-1" />
                  Weekday
                </Label>
                <Select 
                  value={cronBuilder.weekday} 
                  onValueChange={(value) => updateCronPart('weekday', value)}
                  disabled={readonly}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">Every day (*)</SelectItem>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                    <SelectItem value="1-5">Weekdays (Mon-Fri)</SelectItem>
                    <SelectItem value="0,6">Weekends (Sat-Sun)</SelectItem>
                    <SelectItem value="1,3,5">Mon, Wed, Fri</SelectItem>
                    <SelectItem value="2,4">Tue, Thu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Current Expression Display */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Generated Expression</Label>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono font-bold text-blue-600">
                  {buildCronExpression()}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(buildCronExpression())}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This schedule will run: {/* Human readable description would go here */}
                {selectedPreset ? CRON_PRESETS[selectedPreset as keyof typeof CRON_PRESETS]?.description : 'Custom schedule'}
              </p>
            </div>
          </div>

          {/* Timezone Consideration */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Globe className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Timezone: {schedule.timezone}</p>
                <p className="text-blue-700">
                  All times are interpreted in the selected timezone. 
                  Current time in {schedule.timezone}: {new Date().toLocaleString('en-US', { timeZone: schedule.timezone })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Event Triggers Panel
  const renderEventTriggersPanel = () => (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Lightning className="h-5 w-5 mr-2 text-purple-600" />
            Event Triggers
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{eventTriggers.length} triggers</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEventTriggers(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Add New Trigger */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Lightning className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-600 mb-2">Add Event Trigger</h3>
              <p className="text-xs text-gray-500 mb-4">
                Schedule execution based on external events and conditions
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(EVENT_TRIGGER_TYPES).map(triggerType => (
                  <Button
                    key={triggerType.type}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTrigger: EventTrigger = {
                        id: `trigger_${Date.now()}`,
                        type: triggerType.type as any,
                        name: triggerType.description,
                        description: `Trigger on ${triggerType.description.toLowerCase()}`,
                        parameters: {},
                        conditions: [],
                        enabled: true,
                        metadata: {
                          created_at: new Date().toISOString()
                        }
                      };
                      setEventTriggers(prev => [...prev, newTrigger]);
                    }}
                    disabled={readonly}
                    className="h-auto py-3"
                  >
                    <div className="text-center">
                      <triggerType.icon className="h-4 w-4 mx-auto mb-1" style={{ color: triggerType.color }} />
                      <div className="text-xs font-medium">{triggerType.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Existing Triggers */}
          {eventTriggers.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Configured Triggers</h4>
              {eventTriggers.map((trigger, index) => {
                const triggerType = EVENT_TRIGGER_TYPES[trigger.type.toUpperCase() as keyof typeof EVENT_TRIGGER_TYPES];
                
                return (
                  <motion.div
                    key={trigger.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${triggerType?.color}20` }}
                        >
                          {triggerType?.icon && (
                            <triggerType.icon 
                              className="h-5 w-5" 
                              style={{ color: triggerType.color }}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{trigger.name}</h5>
                          <p className="text-xs text-gray-500 mt-1">{trigger.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {trigger.type}
                            </Badge>
                            <Badge 
                              variant={trigger.enabled ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {trigger.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {!readonly && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Edit trigger logic
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEventTriggers(prev => prev.filter(t => t.id !== trigger.id));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Trigger Parameters */}
                    {triggerType?.parameters && triggerType.parameters.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-2">Parameters:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {triggerType.parameters.map(param => (
                            <div key={param} className="space-y-1">
                              <Label className="text-xs">{param.replace('_', ' ')}</Label>
                              <Input
                                size="sm"
                                placeholder={`Enter ${param}`}
                                value={trigger.parameters[param] || ''}
                                onChange={(e) => {
                                  setEventTriggers(prev => prev.map(t => 
                                    t.id === trigger.id 
                                      ? { ...t, parameters: { ...t.parameters, [param]: e.target.value } }
                                      : t
                                  ));
                                }}
                                disabled={readonly}
                                className="h-8 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Analytics Dashboard
  const renderAnalyticsDashboard = () => (
    <div className="space-y-6">
      {/* Schedule Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Schedule Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleAnalytics ? (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {scheduleAnalytics.success_rate || 0}%
                    </div>
                    <div className="text-sm text-green-700 font-medium">Success Rate</div>
                    <div className="text-xs text-green-500">Last 30 days</div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {scheduleAnalytics.total_executions || 0}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Total Executions</div>
                    <div className="text-xs text-blue-500">All time</div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {scheduleAnalytics.avg_duration || 0}s
                    </div>
                    <div className="text-sm text-orange-700 font-medium">Avg Duration</div>
                    <div className="text-xs text-orange-500">Per execution</div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {scheduleAnalytics.reliability_score || 0}%
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Reliability</div>
                    <div className="text-xs text-purple-500">AI calculated</div>
                  </div>
                </Card>
              </div>

              {/* Performance Chart */}
              {scheduleAnalytics.performance_history && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Execution Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scheduleAnalytics.performance_history}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                            className="text-xs"
                          />
                          <YAxis className="text-xs" />
                          <ChartTooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="success_rate" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            name="Success Rate %"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="avg_duration" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Avg Duration (s)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resource Usage Analysis */}
              {scheduleAnalytics.resource_usage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resource Usage Pattern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={scheduleAnalytics.resource_usage}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="time" className="text-xs" />
                          <YAxis className="text-xs" />
                          <ChartTooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="cpu" 
                            stackId="1" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.6}
                            name="CPU %"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="memory" 
                            stackId="1" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.6}
                            name="Memory %"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
              <p className="text-gray-400 mb-4">Execute the schedule to generate performance analytics</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Load analytics logic
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Analytics
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Load Prediction */}
      {systemLoadPrediction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              System Load Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemLoadPrediction.forecast}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predicted_load" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted Load %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="optimal_threshold" 
                    stroke="#10b981" 
                    strokeWidth={1}
                    name="Optimal Threshold"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Effects
  useEffect(() => {
    if (initialSchedule) {
      setSchedule(initialSchedule);
      parseCronExpression(initialSchedule.cron_expression);
    }
  }, [initialSchedule, parseCronExpression]);

  useEffect(() => {
    generateExecutionPreview();
  }, [generateExecutionPreview]);

  useEffect(() => {
    loadScheduleTemplates();
  }, [loadScheduleTemplates]);

  useEffect(() => {
    // Auto-validate when cron expression changes
    const debounceTimeout = setTimeout(() => {
      if (schedule.cron_expression && schedule.name) {
        validateScheduleConfiguration();
      }
    }, 1500);

    return () => clearTimeout(debounceTimeout);
  }, [schedule.cron_expression, schedule.name, schedule.timezone, validateScheduleConfiguration]);

  useEffect(() => {
    onScheduleChange?.(schedule);
  }, [schedule, onScheduleChange]);

  // Main Render
  return (
    <div className={`flex h-full bg-gradient-to-br from-white to-gray-50 ${className}`}>
      <TooltipProvider>
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Clock className="h-8 w-8 text-blue-600" />
                  {schedule.enabled && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Job Scheduling Engine</h1>
                  <p className="text-sm text-gray-500">Advanced cron scheduling with AI optimization</p>
                </div>
              </div>
              
              {schedule.id && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {schedule.id}
                  </Badge>
                  {schedule.validation?.is_valid && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      Validated
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Performance Metrics */}
              {loadTime > 0 && (
                <div className="text-xs text-gray-500">
                  Load: {loadTime}ms
                </div>
              )}
              
              {lastOptimized && (
                <div className="text-xs text-gray-500">
                  Optimized: {lastOptimized.toLocaleTimeString()}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={optimizeScheduleWithAIAnalysis}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Brain className="h-4 w-4 mr-1" />
                  )}
                  AI Optimize
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={validateScheduleConfiguration}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Validate
                </Button>
                
                <Button
                  onClick={saveSchedule}
                  disabled={isSaving || readonly || !schedule.name || !schedule.cron_expression}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save Schedule
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                      <Settings className="h-4 w-4 mr-2" />
                      {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={testScheduleConfiguration}>
                      <Play className="h-4 w-4 mr-2" />
                      Test Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const exportData = {
                        schedule,
                        validation_results: { errors: validationErrors, warnings: validationWarnings },
                        conflicts: scheduleConflicts,
                        optimizations: optimizationSuggestions,
                        upcoming_executions: upcomingExecutions.slice(0, 10),
                        event_triggers: eventTriggers,
                        analytics: scheduleAnalytics,
                        exported_at: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                        type: 'application/json' 
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `schedule-${schedule.name || 'unnamed'}-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Schedule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Main Content with Advanced Tabs */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Basic</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Advanced</span>
                </TabsTrigger>
                <TabsTrigger value="triggers" className="flex items-center space-x-2">
                  <Lightning className="h-4 w-4" />
                  <span>Triggers</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Templates</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="h-full">
                <TabsContent value="basic" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {/* Basic Configuration Content - Already implemented above */}
                    <div className="space-y-6">
                      {/* Workflow Configuration Panel */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Settings className="h-5 w-5 mr-2 text-blue-600" />
                            Schedule Configuration
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="schedule-name" className="text-sm font-medium">
                                Schedule Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="schedule-name"
                                value={schedule.name}
                                onChange={(e) => setSchedule(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter descriptive schedule name"
                                disabled={readonly}
                                className="h-10"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="timezone" className="text-sm font-medium">
                                Time Zone <span className="text-red-500">*</span>
                              </Label>
                              <Select 
                                value={schedule.timezone} 
                                onValueChange={(value) => setSchedule(prev => ({ ...prev, timezone: value }))}
                                disabled={readonly}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIMEZONE_OPTIONS.map(tz => (
                                    <SelectItem key={tz.value} value={tz.value}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{tz.label}</span>
                                        <Badge variant="outline" className="text-xs ml-2">
                                          {tz.offset}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                              Description
                            </Label>
                            <Textarea
                              id="description"
                              value={schedule.description}
                              onChange={(e) => setSchedule(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe what this schedule does, when it runs, and any important details"
                              rows={3}
                              disabled={readonly}
                              className="resize-none"
                            />
                          </div>

                          {/* Priority and Status Controls */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Priority Level</Label>
                              <Select 
                                value={schedule.priority || 'normal'} 
                                onValueChange={(value) => setSchedule(prev => ({ ...prev, priority: value as any }))}
                                disabled={readonly}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRIORITY_LEVELS.map(priority => (
                                    <SelectItem key={priority.value} value={priority.value}>
                                      <div className="flex items-center space-x-2">
                                        <div 
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: priority.color }}
                                        />
                                        <div>
                                          <div className="font-medium">{priority.label}</div>
                                          <div className="text-xs text-gray-500">{priority.description}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={schedule.enabled}
                                  onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, enabled: checked }))}
                                  disabled={readonly}
                                />
                                <Label className="text-sm font-medium">
                                  {schedule.enabled ? 'Enabled' : 'Disabled'}
                                </Label>
                              </div>
                              
                              {schedule.enabled && (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Schedule Pattern Configuration */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                              <Clock className="h-5 w-5 mr-2 text-blue-600" />
                              Schedule Pattern
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCronBuilder(!showCronBuilder)}
                                disabled={readonly}
                              >
                                {showCronBuilder ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                {showCronBuilder ? 'Hide Builder' : 'Visual Builder'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={testScheduleConfiguration}
                                disabled={isTesting || !schedule.cron_expression}
                              >
                                {isTesting ? (
                                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Play className="h-4 w-4 mr-1" />
                                )}
                                Test
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Direct Cron Expression Input */}
                          <div className="space-y-2">
                            <Label htmlFor="cron-expression" className="text-sm font-medium">
                              Cron Expression <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex space-x-2">
                              <Input
                                ref={cronInputRef}
                                id="cron-expression"
                                value={schedule.cron_expression}
                                onChange={(e) => {
                                  setSchedule(prev => ({ ...prev, cron_expression: e.target.value }));
                                  parseCronExpression(e.target.value);
                                }}
                                placeholder="0 0 * * *"
                                className="font-mono h-10"
                                disabled={readonly}
                              />
                              <Button
                                variant="outline"
                                onClick={validateScheduleConfiguration}
                                disabled={isValidating || readonly}
                                className="px-4"
                              >
                                {isValidating ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                Format: minute hour day month weekday (e.g., "0 0 * * *" = daily at midnight)
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Show cron help dialog
                                }}
                                className="text-xs"
                              >
                                <HelpCircle className="h-3 w-3 mr-1" />
                                Help
                              </Button>
                            </div>
                          </div>

                          {/* Test Results */}
                          {testResults && (
                            <Alert className={testResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                              {testResults.success ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              <AlertTitle>Schedule Test {testResults.success ? 'Passed' : 'Failed'}</AlertTitle>
                              <AlertDescription>
                                {testResults.success ? (
                                  <div>
                                    <p>Schedule configuration is valid and ready for use.</p>
                                    {testResults.next_execution && (
                                      <p className="text-sm mt-1">
                                        Next execution: {new Date(testResults.next_execution).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p>{testResults.error}</p>
                                )}
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>

                      {/* Visual Cron Builder */}
                      {showCronBuilder && renderAdvancedCronBuilder()}

                      {/* Validation Results */}
                      {(validationErrors.length > 0 || validationWarnings.length > 0) && (
                        <div className="space-y-4">
                          {validationErrors.length > 0 && (
                            <Alert className="border-red-200 bg-red-50">
                              <XCircle className="h-4 w-4" />
                              <AlertTitle>Validation Errors ({validationErrors.length})</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                  {validationErrors.map((error, index) => (
                                    <li key={index} className="text-sm">{error}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}

                          {validationWarnings.length > 0 && (
                            <Alert className="border-yellow-200 bg-yellow-50">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Validation Warnings ({validationWarnings.length})</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                  {validationWarnings.map((warning, index) => (
                                    <li key={index} className="text-sm">{warning}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}

                      {/* Schedule Conflicts */}
                      {scheduleConflicts.length > 0 && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Schedule Conflicts Detected ({scheduleConflicts.length})</AlertTitle>
                          <AlertDescription>
                            <div className="space-y-3 mt-3">
                              {scheduleConflicts.slice(0, 3).map((conflict, index) => (
                                <div key={index} className="p-3 bg-white rounded border border-orange-200">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="font-medium text-orange-900">{conflict.conflicting_schedule_name}</div>
                                      <div className="text-sm text-orange-700 mt-1">{conflict.description}</div>
                                      <div className="text-xs text-orange-600 mt-2">
                                        Impact: {conflict.impact} | Resolution: {conflict.suggested_resolution}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                                      {conflict.severity}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              {scheduleConflicts.length > 3 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowConflicts(true)}
                                  className="text-orange-600"
                                >
                                  View All {scheduleConflicts.length} Conflicts
                                </Button>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="advanced" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Advanced Scheduling Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <Lightning className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Advanced scheduling options and configurations</p>
                            <p className="text-sm">Resource requirements, retry policies, and notification settings</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="triggers" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {renderEventTriggersPanel()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="preview" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Execution Preview</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Select value={previewRange} onValueChange={(value: any) => setPreviewRange(value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="week">Next Week</SelectItem>
                                  <SelectItem value="month">Next Month</SelectItem>
                                  <SelectItem value="quarter">Next Quarter</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm" onClick={generateExecutionPreview}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Refresh
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {upcomingExecutions.length > 0 ? (
                            <div className="space-y-2">
                              {upcomingExecutions.slice(0, 15).map((execution, index) => (
                                <motion.div
                                  key={execution.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:shadow-sm transition-shadow"
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                      <span className="text-sm font-medium text-blue-600">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {new Date(execution.scheduled_time).toLocaleString('en-US', {
                                          timeZone: schedule.timezone,
                                          dateStyle: 'medium',
                                          timeStyle: 'short'
                                        })}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Est. duration: {Math.round(execution.estimated_duration / 60)}m {execution.estimated_duration % 60}s
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="capitalize">
                                      {execution.priority}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                      {execution.status}
                                    </Badge>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <h3 className="text-lg font-medium mb-2">No Upcoming Executions</h3>
                              <p className="text-gray-400 mb-4">Configure a valid cron expression to see execution preview</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={generateExecutionPreview}
                                disabled={!schedule.cron_expression}
                              >
                                Generate Preview
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="analytics" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {renderAnalyticsDashboard()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="templates" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Schedule Templates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Pre-built schedule templates</p>
                            <p className="text-sm">Common scheduling patterns and best practices</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* AI Optimization Suggestions Floating Panel */}
        <AnimatePresence>
          {showOptimizations && optimizationSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="fixed top-20 right-6 w-96 max-h-96 z-50"
            >
              <Card className="shadow-2xl border-2 border-purple-200">
                <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-purple-600" />
                      AI Optimization Suggestions ({optimizationSuggestions.length})
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOptimizations(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 max-h-80 overflow-y-auto">
                  <div className="space-y-3">
                    {optimizationSuggestions.slice(0, 4).map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-purple-900">{suggestion.title}</h4>
                          <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                            {suggestion.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-700 mb-3">{suggestion.description}</p>
                        
                        {suggestion.estimated_improvement && (
                          <div className="space-y-2">
                            {Object.entries(suggestion.estimated_improvement).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-xs text-purple-600 capitalize">
                                  {key.replace('_', ' ')}:
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  +{value}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-purple-600 border-purple-300 hover:bg-purple-50"
                            onClick={() => {
                              // Apply optimization logic
                              if (suggestion.suggested_changes?.cron_expression) {
                                setSchedule(prev => ({
                                  ...prev,
                                  cron_expression: suggestion.suggested_changes!.cron_expression
                                }));
                                parseCronExpression(suggestion.suggested_changes.cron_expression);
                              }
                            }}
                          >
                            Apply
                          </Button>
                          {suggestion.confidence && (
                            <span className="text-xs text-purple-500">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </div>
  );
};

export default JobSchedulingEngine;