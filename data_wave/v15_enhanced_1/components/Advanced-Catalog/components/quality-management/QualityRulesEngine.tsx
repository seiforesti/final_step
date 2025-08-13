"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, CheckCircle, XCircle, AlertTriangle, Info, Zap,
  Search, Filter, Settings, RefreshCw, Download, Upload,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  MoreHorizontal, Eye, EyeOff, Clock, Calendar,
  User, Users, Link, ExternalLink, Copy, Share2,
  Database, FileText, Cpu, Server, Cloud, Globe,
  PieChart, LineChart, BarChart3, Layers, GitBranch,
  Lightbulb, Rocket, Compass, Map, Route, Navigation,
  Award, Crown, Medal, Trophy, Badge as BadgeIcon,
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize2, Minimize2,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Plus, Minus, X, Check, Edit, Trash2,
  MessageSquare, Bell, Flag, Bookmark,
  Workflow, Boxes, Combine, Split, Shuffle,
  Hash, Tag, Tags, Sparkles, Brain, Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { catalogQualityService } from '../../services/catalog-quality.service'
import { useToast } from '@/components/ui/use-toast'

// Types for quality rules engine
interface QualityRule {
  id: string
  name: string
  description: string
  category: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness' | 'timeliness' | 'conformity' | 'integrity'
  rule_type: 'threshold' | 'pattern' | 'statistical' | 'custom' | 'ml_based' | 'reference_data' | 'business_logic'
  severity: 'low' | 'medium' | 'high' | 'critical'
  priority: number
  status: 'active' | 'inactive' | 'draft' | 'deprecated' | 'testing'
  target_assets: string[]
  target_columns?: string[]
  conditions: RuleCondition[]
  actions: RuleAction[]
  schedule: RuleSchedule
  thresholds: RuleThreshold[]
  metadata: {
    created_by: string
    created_at: Date
    updated_by: string
    updated_at: Date
    version: string
    tags: string[]
    business_context: string
    technical_notes: string
    dependencies: string[]
    impact_assessment: string
  }
  execution_stats: {
    total_executions: number
    successful_executions: number
    failed_executions: number
    last_execution: Date
    avg_execution_time: number
    success_rate: number
  }
  validation_results?: RuleValidationResult[]
}

interface RuleCondition {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'contains' | 'not_contains' | 'regex' | 'is_null' | 'is_not_null' | 'custom'
  value: any
  data_type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object'
  case_sensitive?: boolean
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct_count' | 'null_count' | 'percentile'
  group_by?: string[]
  having_condition?: string
  custom_logic?: string
}

interface RuleAction {
  id: string
  action_type: 'alert' | 'notification' | 'quarantine' | 'reject' | 'flag' | 'auto_correct' | 'escalate' | 'custom'
  target: string
  parameters: Record<string, any>
  condition: string
  enabled: boolean
  retry_config?: {
    max_retries: number
    retry_delay: number
    backoff_strategy: 'linear' | 'exponential'
  }
}

interface RuleSchedule {
  enabled: boolean
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
  cron_expression?: string
  timezone: string
  start_date: Date
  end_date?: Date
  execution_window?: {
    start_time: string
    end_time: string
  }
  dependencies?: string[]
}

interface RuleThreshold {
  id: string
  metric: string
  warning_threshold: number
  critical_threshold: number
  comparison_operator: 'greater_than' | 'less_than' | 'equals' | 'between'
  unit: string
  baseline_value?: number
  trend_analysis: boolean
}

interface RuleValidationResult {
  id: string
  rule_id: string
  execution_id: string
  timestamp: Date
  status: 'passed' | 'failed' | 'warning' | 'error'
  score: number
  violations_count: number
  total_records: number
  execution_time: number
  details: {
    violations: QualityViolation[]
    metrics: Record<string, number>
    performance_stats: Record<string, any>
    error_message?: string
    recommendations: string[]
  }
}

interface QualityViolation {
  id: string
  rule_id: string
  record_id: string
  field: string
  expected_value: any
  actual_value: any
  violation_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detected_at: Date
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive'
  resolution_notes?: string
  resolved_by?: string
  resolved_at?: Date
}

interface RuleTemplate {
  id: string
  name: string
  description: string
  category: string
  template_type: 'built_in' | 'custom' | 'industry_standard'
  rule_definition: Partial<QualityRule>
  parameters: TemplateParameter[]
  use_cases: string[]
  best_practices: string[]
  examples: RuleExample[]
}

interface TemplateParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  default_value?: any
  description: string
  validation_rules?: string[]
}

interface RuleExample {
  title: string
  description: string
  configuration: Record<string, any>
  expected_outcome: string
}

interface RuleDependency {
  id: string
  rule_id: string
  depends_on_rule_id: string
  dependency_type: 'prerequisite' | 'sequential' | 'conditional' | 'exclusive'
  condition?: string
  delay?: number
}

interface RuleGroup {
  id: string
  name: string
  description: string
  rules: string[]
  execution_order: 'parallel' | 'sequential' | 'conditional'
  stop_on_failure: boolean
  group_conditions?: string[]
  metadata: {
    created_by: string
    created_at: Date
    tags: string[]
  }
}

interface RuleMetrics {
  total_rules: number
  active_rules: number
  passing_rules: number
  failing_rules: number
  rule_coverage: number
  data_quality_score: number
  trend_data: {
    date: Date
    score: number
    violations: number
  }[]
  category_breakdown: Record<string, number>
  severity_breakdown: Record<string, number>
}

interface RuleEngineConfiguration {
  execution_mode: 'batch' | 'streaming' | 'hybrid'
  max_concurrent_rules: number
  timeout_seconds: number
  retry_policy: {
    enabled: boolean
    max_retries: number
    backoff_multiplier: number
  }
  notification_settings: {
    email_enabled: boolean
    slack_enabled: boolean
    webhook_enabled: boolean
    escalation_rules: EscalationRule[]
  }
  performance_settings: {
    enable_caching: boolean
    cache_ttl: number
    enable_sampling: boolean
    sample_rate: number
  }
  audit_settings: {
    log_level: 'debug' | 'info' | 'warn' | 'error'
    retention_days: number
    enable_detailed_logging: boolean
  }
}

interface EscalationRule {
  condition: string
  delay_minutes: number
  escalate_to: string[]
  message_template: string
}

// Main QualityRulesEngine Component
export const QualityRulesEngine: React.FC = () => {
  // Core state management
  const [rules, setRules] = useState<QualityRule[]>([])
  const [selectedRule, setSelectedRule] = useState<QualityRule | null>(null)
  const [ruleTemplates, setRuleTemplates] = useState<RuleTemplate[]>([])
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([])
  const [ruleDependencies, setRuleDependencies] = useState<RuleDependency[]>([])
  const [ruleMetrics, setRuleMetrics] = useState<RuleMetrics | null>(null)
  const [engineConfig, setEngineConfig] = useState<RuleEngineConfiguration>({
    execution_mode: 'batch',
    max_concurrent_rules: 10,
    timeout_seconds: 300,
    retry_policy: {
      enabled: true,
      max_retries: 3,
      backoff_multiplier: 2
    },
    notification_settings: {
      email_enabled: true,
      slack_enabled: false,
      webhook_enabled: false,
      escalation_rules: []
    },
    performance_settings: {
      enable_caching: true,
      cache_ttl: 3600,
      enable_sampling: false,
      sample_rate: 0.1
    },
    audit_settings: {
      log_level: 'info',
      retention_days: 90,
      enable_detailed_logging: false
    }
  })

  // UI state management
  const [activeTab, setActiveTab] = useState('rules')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'tree'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [filterBy, setFilterBy] = useState<{
    categories: string[]
    severities: string[]
    statuses: string[]
    rule_types: string[]
  }>({
    categories: [],
    severities: [],
    statuses: [],
    rule_types: []
  })

  // Rule creation and editing state
  const [isCreatingRule, setIsCreatingRule] = useState(false)
  const [isEditingRule, setIsEditingRule] = useState(false)
  const [currentRuleForm, setCurrentRuleForm] = useState<Partial<QualityRule>>({})
  const [selectedTemplate, setSelectedTemplate] = useState<RuleTemplate | null>(null)

  // Execution and testing state
  const [isExecutingRules, setIsExecutingRules] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [executionStatus, setExecutionStatus] = useState('')
  const [testResults, setTestResults] = useState<RuleValidationResult[]>([])

  // Dialog and modal states
  const [showRuleDetails, setShowRuleDetails] = useState(false)
  const [showRuleCreator, setShowRuleCreator] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showConfiguration, setShowConfiguration] = useState(false)
  const [showDependencyManager, setShowDependencyManager] = useState(false)
  const [showGroupManager, setShowGroupManager] = useState(false)
  const [showExecutionResults, setShowExecutionResults] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const ruleBuilderRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Queries
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['qualityRules', filterBy],
    queryFn: () => catalogQualityService.getQualityRules(filterBy),
    staleTime: 60000
  })

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['ruleTemplates'],
    queryFn: () => catalogQualityService.getRuleTemplates(),
    staleTime: 300000
  })

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['ruleMetrics'],
    queryFn: () => catalogQualityService.getRuleMetrics(),
    staleTime: 30000
  })

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['ruleGroups'],
    queryFn: () => catalogQualityService.getRuleGroups(),
    staleTime: 120000
  })

  const { data: dependenciesData, isLoading: dependenciesLoading } = useQuery({
    queryKey: ['ruleDependencies'],
    queryFn: () => catalogQualityService.getRuleDependencies(),
    staleTime: 120000
  })

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: (rule: Partial<QualityRule>) => catalogQualityService.createQualityRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualityRules'] })
      queryClient.invalidateQueries({ queryKey: ['ruleMetrics'] })
      setIsCreatingRule(false)
      setShowRuleCreator(false)
      toast({ title: "Rule Created", description: "Quality rule has been created successfully" })
    },
    onError: () => {
      toast({ title: "Creation Failed", description: "Failed to create quality rule", variant: "destructive" })
    }
  })

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, rule }: { id: string; rule: Partial<QualityRule> }) => 
      catalogQualityService.updateQualityRule(id, rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualityRules'] })
      setIsEditingRule(false)
      toast({ title: "Rule Updated", description: "Quality rule has been updated successfully" })
    }
  })

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => catalogQualityService.deleteQualityRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualityRules'] })
      queryClient.invalidateQueries({ queryKey: ['ruleMetrics'] })
      toast({ title: "Rule Deleted", description: "Quality rule has been deleted" })
    }
  })

  const executeRulesMutation = useMutation({
    mutationFn: ({ ruleIds, options }: { ruleIds: string[]; options?: any }) =>
      catalogQualityService.executeQualityRules(ruleIds, options),
    onMutate: () => {
      setIsExecutingRules(true)
      setExecutionProgress(0)
      setExecutionStatus('Initializing rule execution...')
    },
    onSuccess: (data) => {
      setIsExecutingRules(false)
      setExecutionProgress(100)
      setTestResults(data.results)
      setShowExecutionResults(true)
      queryClient.invalidateQueries({ queryKey: ['ruleMetrics'] })
      toast({ 
        title: "Execution Complete", 
        description: `Executed ${data.results.length} rules successfully` 
      })
    },
    onError: () => {
      setIsExecutingRules(false)
      toast({ title: "Execution Failed", description: "Failed to execute quality rules", variant: "destructive" })
    }
  })

  const testRuleMutation = useMutation({
    mutationFn: (rule: Partial<QualityRule>) => catalogQualityService.testQualityRule(rule),
    onSuccess: (result) => {
      setTestResults([result])
      toast({ title: "Test Complete", description: "Rule test completed successfully" })
    }
  })

  // Filtered and processed data
  const filteredRules = useMemo(() => {
    if (!rules) return []
    
    return rules.filter(rule => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          rule.name.toLowerCase().includes(query) ||
          rule.description.toLowerCase().includes(query) ||
          rule.category.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Category filter
      if (filterBy.categories.length > 0 && !filterBy.categories.includes(rule.category)) {
        return false
      }

      // Severity filter
      if (filterBy.severities.length > 0 && !filterBy.severities.includes(rule.severity)) {
        return false
      }

      // Status filter
      if (filterBy.statuses.length > 0 && !filterBy.statuses.includes(rule.status)) {
        return false
      }

      // Rule type filter
      if (filterBy.rule_types.length > 0 && !filterBy.rule_types.includes(rule.rule_type)) {
        return false
      }

      return true
    })
  }, [rules, searchQuery, filterBy])

  // Helper functions
  const getCategoryColor = (category: string): string => {
    const colorMap = {
      completeness: 'text-blue-600 bg-blue-50',
      accuracy: 'text-green-600 bg-green-50',
      consistency: 'text-purple-600 bg-purple-50',
      validity: 'text-orange-600 bg-orange-50',
      uniqueness: 'text-red-600 bg-red-50',
      timeliness: 'text-indigo-600 bg-indigo-50',
      conformity: 'text-yellow-600 bg-yellow-50',
      integrity: 'text-pink-600 bg-pink-50'
    }
    return colorMap[category] || 'text-gray-600 bg-gray-50'
  }

  const getSeverityColor = (severity: string): string => {
    const colorMap = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    }
    return colorMap[severity] || 'text-gray-600 bg-gray-50'
  }

  const getStatusIcon = (status: string) => {
    const iconMap = {
      active: CheckCircle,
      inactive: XCircle,
      draft: Edit,
      deprecated: AlertTriangle,
      testing: Zap
    }
    return iconMap[status] || Shield
  }

  const getStatusColor = (status: string): string => {
    const colorMap = {
      active: 'text-green-600',
      inactive: 'text-gray-600',
      draft: 'text-blue-600',
      deprecated: 'text-red-600',
      testing: 'text-orange-600'
    }
    return colorMap[status] || 'text-gray-600'
  }

  const formatSuccessRate = (rate: number): string => {
    return `${Math.round(rate * 100)}%`
  }

  // Event handlers
  const handleRuleSelect = (rule: QualityRule) => {
    setSelectedRule(rule)
  }

  const handleCreateRule = () => {
    setCurrentRuleForm({
      name: '',
      description: '',
      category: 'completeness',
      rule_type: 'threshold',
      severity: 'medium',
      priority: 1,
      status: 'draft',
      target_assets: [],
      conditions: [],
      actions: [],
      schedule: {
        enabled: false,
        frequency: 'daily',
        timezone: 'UTC',
        start_date: new Date()
      },
      thresholds: []
    })
    setIsCreatingRule(true)
    setShowRuleCreator(true)
  }

  const handleEditRule = (rule: QualityRule) => {
    setCurrentRuleForm(rule)
    setIsEditingRule(true)
    setShowRuleCreator(true)
  }

  const handleDeleteRule = (ruleId: string) => {
    deleteRuleMutation.mutate(ruleId)
  }

  const handleExecuteRules = (ruleIds?: string[]) => {
    const targetRules = ruleIds || (selectedRule ? [selectedRule.id] : selectedRules)
    if (targetRules.length === 0) {
      toast({ title: "No Rules Selected", description: "Please select rules to execute", variant: "destructive" })
      return
    }

    executeRulesMutation.mutate({ ruleIds: targetRules })
  }

  const handleTestRule = (rule: Partial<QualityRule>) => {
    testRuleMutation.mutate(rule)
  }

  const handleSaveRule = () => {
    if (isEditingRule && selectedRule) {
      updateRuleMutation.mutate({ id: selectedRule.id, rule: currentRuleForm })
    } else {
      createRuleMutation.mutate(currentRuleForm)
    }
  }

  const handleTemplateSelect = (template: RuleTemplate) => {
    setCurrentRuleForm({
      ...template.rule_definition,
      name: template.name,
      description: template.description,
      category: template.rule_definition.category || 'completeness'
    })
    setSelectedTemplate(template)
    setShowTemplateSelector(false)
    setShowRuleCreator(true)
  }

  const handleExportRules = (format: 'json' | 'csv' | 'yaml') => {
    const data = {
      rules: filteredRules,
      metrics: ruleMetrics,
      exported_at: new Date().toISOString()
    }
    
    const filename = `quality-rules.${format}`
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
    toast({ title: "Export Complete", description: `Rules exported as ${format.toUpperCase()}` })
  }

  // Render functions
  const renderRuleCard = (rule: QualityRule) => {
    const isSelected = selectedRule?.id === rule.id
    const isInSelection = selectedRules.includes(rule.id)
    const StatusIcon = getStatusIcon(rule.status)
    
    return (
      <Card 
        key={rule.id}
        className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${isInSelection ? 'bg-blue-50' : ''}`}
        onClick={() => handleRuleSelect(rule)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {rule.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getCategoryColor(rule.category)}>
                    {rule.category}
                  </Badge>
                  <Badge className={getSeverityColor(rule.severity)}>
                    {rule.severity}
                  </Badge>
                  <div className={`flex items-center space-x-1 ${getStatusColor(rule.status)}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm">{rule.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Checkbox
                checked={isInSelection}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedRules(prev => [...prev, rule.id])
                  } else {
                    setSelectedRules(prev => prev.filter(id => id !== rule.id))
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExecuteRules([rule.id])}>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Rule
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTestRule(rule)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Test Rule
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Rule
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeleteRule(rule.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Rule
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
            {rule.description}
          </p>

          {/* Rule Statistics */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Success Rate:</span>
                <span className="font-medium">{formatSuccessRate(rule.execution_stats.success_rate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Executions:</span>
                <span className="font-medium">{rule.execution_stats.total_executions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority:</span>
                <span className="font-medium">{rule.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assets:</span>
                <span className="font-medium">{rule.target_assets.length}</span>
              </div>
            </div>
          </div>

          {/* Rule Conditions Preview */}
          {rule.conditions.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-sm font-medium">Conditions</div>
              <div className="space-y-1">
                {rule.conditions.slice(0, 2).map((condition, index) => (
                  <div key={index} className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded">
                    <span className="font-mono">
                      {condition.field} {condition.operator} {String(condition.value)}
                    </span>
                  </div>
                ))}
                {rule.conditions.length > 2 && (
                  <div className="text-xs text-slate-500">
                    +{rule.conditions.length - 2} more conditions
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Execution */}
          {rule.execution_stats.last_execution && (
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-slate-500">Last Run:</span>
              <span className="font-medium">
                {new Date(rule.execution_stats.last_execution).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderMetricsOverview = () => {
    if (!ruleMetrics) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Rules</p>
                <p className="text-2xl font-bold">{ruleMetrics.total_rules}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{ruleMetrics.active_rules}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Quality Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(ruleMetrics.data_quality_score * 100)}%
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Coverage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(ruleMetrics.rule_coverage * 100)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderRuleCreator = () => {
    return (
      <Dialog open={showRuleCreator} onOpenChange={setShowRuleCreator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingRule ? 'Edit Quality Rule' : 'Create Quality Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure quality rule parameters and conditions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input
                    value={currentRuleForm.name || ''}
                    onChange={(e) => setCurrentRuleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={currentRuleForm.category} 
                    onValueChange={(value: any) => setCurrentRuleForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completeness">Completeness</SelectItem>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="consistency">Consistency</SelectItem>
                      <SelectItem value="validity">Validity</SelectItem>
                      <SelectItem value="uniqueness">Uniqueness</SelectItem>
                      <SelectItem value="timeliness">Timeliness</SelectItem>
                      <SelectItem value="conformity">Conformity</SelectItem>
                      <SelectItem value="integrity">Integrity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <Select 
                    value={currentRuleForm.rule_type} 
                    onValueChange={(value: any) => setCurrentRuleForm(prev => ({ ...prev, rule_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="threshold">Threshold</SelectItem>
                      <SelectItem value="pattern">Pattern</SelectItem>
                      <SelectItem value="statistical">Statistical</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="ml_based">ML Based</SelectItem>
                      <SelectItem value="reference_data">Reference Data</SelectItem>
                      <SelectItem value="business_logic">Business Logic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select 
                    value={currentRuleForm.severity} 
                    onValueChange={(value: any) => setCurrentRuleForm(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={currentRuleForm.priority || 1}
                    onChange={(e) => setCurrentRuleForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={currentRuleForm.description || ''}
                  onChange={(e) => setCurrentRuleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter rule description"
                  rows={3}
                />
              </div>
            </div>

            {/* Conditions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Rule Conditions</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newCondition: RuleCondition = {
                      id: Date.now().toString(),
                      field: '',
                      operator: 'equals',
                      value: '',
                      data_type: 'string'
                    }
                    setCurrentRuleForm(prev => ({
                      ...prev,
                      conditions: [...(prev.conditions || []), newCondition]
                    }))
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              <div className="space-y-3">
                {currentRuleForm.conditions?.map((condition, index) => (
                  <div key={condition.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Field</Label>
                        <Input
                          value={condition.field}
                          onChange={(e) => {
                            const updatedConditions = [...(currentRuleForm.conditions || [])]
                            updatedConditions[index] = { ...condition, field: e.target.value }
                            setCurrentRuleForm(prev => ({ ...prev, conditions: updatedConditions }))
                          }}
                          placeholder="Field name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Operator</Label>
                        <Select 
                          value={condition.operator} 
                          onValueChange={(value: any) => {
                            const updatedConditions = [...(currentRuleForm.conditions || [])]
                            updatedConditions[index] = { ...condition, operator: value }
                            setCurrentRuleForm(prev => ({ ...prev, conditions: updatedConditions }))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                            <SelectItem value="in">In</SelectItem>
                            <SelectItem value="not_in">Not In</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="regex">Regex</SelectItem>
                            <SelectItem value="is_null">Is Null</SelectItem>
                            <SelectItem value="is_not_null">Is Not Null</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Value</Label>
                        <Input
                          value={condition.value}
                          onChange={(e) => {
                            const updatedConditions = [...(currentRuleForm.conditions || [])]
                            updatedConditions[index] = { ...condition, value: e.target.value }
                            setCurrentRuleForm(prev => ({ ...prev, conditions: updatedConditions }))
                          }}
                          placeholder="Condition value"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Actions</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedConditions = currentRuleForm.conditions?.filter((_, i) => i !== index) || []
                            setCurrentRuleForm(prev => ({ ...prev, conditions: updatedConditions }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Rule Button */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handleTestRule(currentRuleForm)}
                disabled={testRuleMutation.isPending}
              >
                {testRuleMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Test Rule
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowRuleCreator(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule} disabled={createRuleMutation.isPending || updateRuleMutation.isPending}>
              {(createRuleMutation.isPending || updateRuleMutation.isPending) ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isEditingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Effect hooks
  useEffect(() => {
    if (rulesData) {
      setRules(rulesData)
    }
  }, [rulesData])

  useEffect(() => {
    if (templatesData) {
      setRuleTemplates(templatesData)
    }
  }, [templatesData])

  useEffect(() => {
    if (metricsData) {
      setRuleMetrics(metricsData)
    }
  }, [metricsData])

  useEffect(() => {
    if (groupsData) {
      setRuleGroups(groupsData)
    }
  }, [groupsData])

  useEffect(() => {
    if (dependenciesData) {
      setRuleDependencies(dependenciesData)
    }
  }, [dependenciesData])

  // Simulate execution progress
  useEffect(() => {
    if (isExecutingRules) {
      const interval = setInterval(() => {
        setExecutionProgress(prev => {
          const newProgress = prev + Math.random() * 10
          if (newProgress >= 90) {
            setExecutionStatus('Finalizing results...')
          } else if (newProgress >= 70) {
            setExecutionStatus('Validating data quality...')
          } else if (newProgress >= 40) {
            setExecutionStatus('Applying rule conditions...')
          } else if (newProgress >= 20) {
            setExecutionStatus('Loading target data...')
          }
          return Math.min(newProgress, 95)
        })
      }, 500)

      return () => clearInterval(interval)
    }
  }, [isExecutingRules])

  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Quality Rules Engine
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Advanced data quality rule management and execution
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules..."
                className="pl-10 w-64"
              />
            </div>

            {/* View Mode */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  {viewMode}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  List View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('tree')}>
                  Tree View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateRule}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Templates
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExecuteRules()}
              disabled={isExecutingRules || selectedRules.length === 0}
            >
              {isExecutingRules ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute ({selectedRules.length})
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportRules('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportRules('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportRules('yaml')}>
                  Export as YAML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfiguration(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isExecutingRules && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Quality Rules Execution</span>
                  <span>{Math.round(executionProgress)}%</span>
                </div>
                <Progress value={executionProgress} className="h-2" />
                <div className="text-xs text-slate-600">{executionStatus}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-4" ref={containerRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules">Rules ({filteredRules.length})</TabsTrigger>
              <TabsTrigger value="templates">Templates ({ruleTemplates.length})</TabsTrigger>
              <TabsTrigger value="groups">Groups ({ruleGroups.length})</TabsTrigger>
              <TabsTrigger value="metrics">Metrics & Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="mt-4">
              {/* Metrics Overview */}
              {renderMetricsOverview()}

              {/* Bulk Selection Actions */}
              {selectedRules.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedRules.length} rule(s) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => handleExecuteRules()}
                        disabled={isExecutingRules}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Execute Rules
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedRules([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {rulesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading rules...</p>
                  </div>
                </div>
              ) : filteredRules.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No quality rules found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Create your first quality rule to start monitoring data quality
                  </p>
                  <Button onClick={handleCreateRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                }>
                  {filteredRules.map(renderRuleCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="mt-4">
              {templatesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading templates...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {ruleTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className="transition-all duration-200 hover:shadow-lg cursor-pointer"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                          {template.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge variant="secondary">{template.template_type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                          {template.description}
                        </p>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Use Cases:</div>
                          <div className="flex flex-wrap gap-1">
                            {template.use_cases.slice(0, 3).map((useCase, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {useCase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="groups" className="mt-4">
              <div className="text-center py-12">
                <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Rule Groups Management
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Organize and manage rule execution groups
                </p>
                <Button onClick={() => setShowGroupManager(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <div className="space-y-6">
                {/* Quality Score Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Quality Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-slate-500">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Quality trend visualization will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rules by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {ruleMetrics && Object.entries(ruleMetrics.category_breakdown).map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="capitalize">{category}</span>
                            <Badge className={getCategoryColor(category)}>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Rules by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {ruleMetrics && Object.entries(ruleMetrics.severity_breakdown).map(([severity, count]) => (
                          <div key={severity} className="flex items-center justify-between">
                            <span className="capitalize">{severity}</span>
                            <Badge className={getSeverityColor(severity)}>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Rule Creator Dialog */}
        {renderRuleCreator()}
      </div>
    </TooltipProvider>
  )
}

export default QualityRulesEngine