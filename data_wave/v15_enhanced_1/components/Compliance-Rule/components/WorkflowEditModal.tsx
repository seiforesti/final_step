"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Bell,
  Ticket,
  Play,
  CheckCircle,
  Webhook,
  PlusCircle,
  Loader2,
  Activity,
  BarChart3,
  Clock,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceWorkflow } from "../types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  trigger: z.enum(["rule_violation", "issue_status_change", "manual", "scheduled", "threshold_breach", "integration_event"]),
  trigger_config: z
    .string()
    .optional()
    .transform((str: string) => {
      try {
        return str ? JSON.parse(str) : {}
      } catch {
        return {}
      }
    })
    .refine((val: any) => typeof val === "object" && val !== null, {
      message: "Trigger configuration must be a valid JSON object",
    }),
  actions: z.array(
    z.object({
      id: z.string().optional(),
      type: z.enum([
        "create_issue",
        "send_notification",
        "update_issue",
        "run_remediation",
        "call_webhook",
        "approval",
        "escalate",
        "assign_user"
      ]),
      config: z
        .string()
        .optional()
        .transform((str: string) => {
          try {
            return str ? JSON.parse(str) : {}
          } catch {
            return {}
          }
        })
        .refine((val: any) => typeof val === "object" && val !== null, {
          message: "Action configuration must be a valid JSON object",
        }),
      order: z.number(),
      delay_minutes: z.number().min(0).default(0),
      condition: z.string().optional()
    }),
  ),
  status: z.enum(["active", "inactive", "draft"]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  timeout_hours: z.number().min(1).max(168).default(24),
  retry_count: z.number().min(0).max(5).default(3),
  tags: z.array(z.string()).default([])
})

type FormData = z.infer<typeof formSchema>

interface WorkflowEditModalProps {
  isOpen: boolean
  onClose: () => void
  workflow: ComplianceWorkflow
  onSuccess: (workflow: ComplianceWorkflow) => void
}

const triggerOptions = [
  { 
    value: "rule_violation", 
    label: "Rule Violation", 
    description: "Triggered when a compliance rule is violated",
    icon: Ticket,
    category: "compliance"
  },
  {
    value: "issue_status_change",
    label: "Issue Status Change",
    description: "Triggered when an issue's status changes",
    icon: Edit,
    category: "issue"
  },
  { 
    value: "threshold_breach", 
    label: "Threshold Breach", 
    description: "Triggered when metrics exceed defined thresholds",
    icon: Zap,
    category: "monitoring"
  },
  { 
    value: "manual", 
    label: "Manual", 
    description: "Triggered manually by a user",
    icon: Play,
    category: "user"
  },
  { 
    value: "scheduled", 
    label: "Scheduled", 
    description: "Triggered at specific time intervals",
    icon: Clock,
    category: "time"
  },
  {
    value: "integration_event",
    label: "Integration Event",
    description: "Triggered by external system events",
    icon: Webhook,
    category: "external"
  }
]

const actionTypeOptions = [
  { value: "create_issue", label: "Create Issue", icon: Ticket, category: "issue" },
  { value: "send_notification", label: "Send Notification", icon: Bell, category: "communication" },
  { value: "update_issue", label: "Update Issue", icon: Edit, category: "issue" },
  { value: "assign_user", label: "Assign User", icon: CheckCircle, category: "assignment" },
  { value: "escalate", label: "Escalate", icon: Zap, category: "escalation" },
  { value: "run_remediation", label: "Run Remediation", icon: Play, category: "automation" },
  { value: "call_webhook", label: "Call Webhook", icon: Webhook, category: "integration" },
  { value: "approval", label: "Require Approval", icon: CheckCircle, category: "approval" },
]

export function WorkflowEditModal({ isOpen, onClose, workflow, onSuccess }: WorkflowEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [triggerTemplates, setTriggerTemplates] = useState<any>({})
  const [actionTemplates, setActionTemplates] = useState<any>({})
  const [templatesLoading, setTemplatesLoading] = useState(true)

  const { 
    executeAction, 
    sendNotification, 
    getMetrics,
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'WorkflowEditModal',
    complianceId: workflow.id,
    enableAnalytics: true,
    enableMonitoring: true,
    enableWorkflows: true
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workflow.name,
      description: workflow.description || "",
      trigger: workflow.trigger,
      trigger_config: workflow.trigger_config || {},
      actions: workflow.actions || [],
      status: workflow.status,
      priority: workflow.priority || "medium",
      timeout_hours: workflow.timeout_hours || 24,
      retry_count: workflow.retry_count || 3,
      tags: workflow.tags || []
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "actions",
  })

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setTemplatesLoading(true)
        const [triggerTemplatesData, actionTemplatesData] = await Promise.all([
          ComplianceAPIs.Workflow.getTriggerTemplates(),
          ComplianceAPIs.Workflow.getActionTemplates()
        ])
        setTriggerTemplates(triggerTemplatesData)
        setActionTemplates(actionTemplatesData)
      } catch (error) {
        console.error('Failed to load templates:', error)
        sendNotification('error', 'Failed to load workflow templates')
      } finally {
        setTemplatesLoading(false)
      }
    }

    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, sendNotification])

  // Reset form with new workflow data if the workflow prop changes
  useEffect(() => {
    if (workflow) {
      form.reset({
        name: workflow.name,
        description: workflow.description || "",
        trigger: workflow.trigger,
        trigger_config: workflow.trigger_config || {},
        actions: workflow.actions || [],
        status: workflow.status,
        priority: workflow.priority || "medium",
        timeout_hours: workflow.timeout_hours || 24,
        retry_count: workflow.retry_count || 3,
        tags: workflow.tags || []
      })
    }
  }, [workflow, form])

  const watchTrigger = form.watch("trigger")

  const getTriggerConfigPlaceholder = (triggerType: string) => {
    const template = triggerTemplates[triggerType]
    if (template) {
      return JSON.stringify(template, null, 2)
    }
    return JSON.stringify({ message: "Loading template..." }, null, 2)
  }

  const getActionConfigPlaceholder = (actionType: string) => {
    const template = actionTemplates[actionType]
    if (template) {
      return JSON.stringify(template, null, 2)
    }
    return JSON.stringify({ message: "Loading template..." }, null, 2)
  }

  const addAction = () => {
    const defaultTemplate = actionTemplates.send_notification || {}
    append({
      id: `action-${Date.now()}`,
      type: "send_notification",
      config: defaultTemplate,
      order: fields.length + 1,
      delay_minutes: 0,
      condition: ""
    })
  }

  const loadTriggerTemplate = async () => {
    try {
      const template = triggerTemplates[watchTrigger]
      if (template) {
        form.setValue('trigger_config', template)
        sendNotification('info', 'Trigger template loaded successfully')
      } else {
        sendNotification('warning', 'No template available for this trigger type')
      }
    } catch (error) {
      sendNotification('error', 'Failed to load trigger template')
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      
      const updatedWorkflow: ComplianceWorkflow = {
        ...workflow,
        ...data,
        actions: data.actions.map((action: any, index: number) => ({ 
          ...action, 
          order: index + 1,
          id: action.id || `action-${index + 1}`
        })),
        updated_at: new Date().toISOString(),
        updated_by: "current-user@company.com",
      }

      await executeAction('updateWorkflow', {
        id: workflow.id,
        ...updatedWorkflow
      })

      onSuccess(updatedWorkflow)
      sendNotification('success', `Workflow "${data.name}" updated successfully`)
      onClose()
    } catch (error) {
      console.error("Failed to update workflow:", error)
      sendNotification('error', 'Failed to update workflow. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecuteNow = async () => {
    try {
      setIsExecuting(true)
      await ComplianceAPIs.Workflow.executeWorkflow(workflow.id)
      sendNotification('success', 'Workflow execution initiated successfully')
    } catch (error) {
      sendNotification('error', 'Failed to execute workflow. Please try again.')
    } finally {
      setIsExecuting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      draft: 'outline',
      running: 'default',
      failed: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <Activity className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatExecutionTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  const getSuccessRate = () => {
    const total = workflow.execution_count || 0
    const success = workflow.success_count || 0
    return total > 0 ? Math.round((success / total) * 100) : 0
  }

  const getTrendIcon = () => {
    const successRate = getSuccessRate()
    if (successRate >= 90) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (successRate >= 70) return <Minus className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Edit className="h-5 w-5" />
            </motion.div>
            Edit Workflow: {workflow.name}
          </DialogTitle>
          <DialogDescription>
            Update the configuration for this automated workflow.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Workflow Status & Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Workflow Status & Performance
                      </span>
                      {getStatusBadge(workflow.status)}
                    </CardTitle>
                    <CardDescription>Current status and execution metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <motion.div 
                        className="text-center p-4 rounded-lg bg-muted/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-2xl font-bold text-blue-600">{workflow.execution_count || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Executions</div>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 rounded-lg bg-muted/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                          {getSuccessRate()}%
                          {getTrendIcon()}
                        </div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 rounded-lg bg-muted/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-2xl font-bold text-purple-600">
                          {formatExecutionTime(workflow.average_execution_time)}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. Execution Time</div>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 rounded-lg bg-muted/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-2xl font-bold text-orange-600">
                          {workflow.last_run_at ? new Date(workflow.last_run_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-sm text-muted-foreground">Last Run</div>
                      </motion.div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleExecuteNow}
                        disabled={isExecuting || workflow.status !== 'active'}
                        className="flex items-center gap-2"
                      >
                        {isExecuting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        {isExecuting ? 'Executing...' : 'Execute Now'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        View Analytics
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadTriggerTemplate}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Load Template
                      </Button>
                    </div>

                    {workflow.last_run_status === 'failed' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Last execution failed:</strong> Check the execution history for details and error messages.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Workflow Details</CardTitle>
                    <CardDescription>Basic information and configuration.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workflow Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Critical Issue Escalation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    Low
                                  </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Medium
                                  </div>
                                </SelectItem>
                                <SelectItem value="high">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    High
                                  </div>
                                </SelectItem>
                                <SelectItem value="critical">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    Critical
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe what this workflow automates and when it should run..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">
                                  <Badge variant="default">Active</Badge>
                                </SelectItem>
                                <SelectItem value="inactive">
                                  <Badge variant="secondary">Inactive</Badge>
                                </SelectItem>
                                <SelectItem value="draft">
                                  <Badge variant="outline">Draft</Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeout_hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeout (Hours)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="168" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Maximum execution time</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="retry_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retry Count</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="5" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Number of retry attempts</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter tags separated by commas"
                              value={field.value?.join(", ") || ""}
                              onChange={(e) => {
                                const tags = e.target.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter((tag) => tag.length > 0)
                                field.onChange(tags)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Add tags to categorize and organize workflows</FormDescription>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {field.value?.map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Trigger Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trigger Configuration</CardTitle>
                    <CardDescription>Define when this workflow should execute.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="trigger"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select trigger type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {triggerOptions.map((option) => {
                                const Icon = option.icon
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-xs text-muted-foreground">{option.description}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <FormDescription>Trigger type cannot be changed after creation.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchTrigger !== "manual" && (
                      <FormField
                        control={form.control}
                        name="trigger_config"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trigger Configuration (JSON)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={getTriggerConfigPlaceholder(watchTrigger)}
                                className="min-h-[150px] font-mono text-sm"
                                value={JSON.stringify(field.value, null, 2)}
                                onChange={(e) => {
                                  try {
                                    field.onChange(JSON.parse(e.target.value))
                                  } catch {
                                    // Invalid JSON, don't update field.value
                                  }
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              <div className="flex items-center gap-1">
                                <Settings className="h-3 w-3" />
                                Define specific conditions for the trigger in JSON format.
                              </div>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Actions Configuration */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Workflow Actions</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addAction}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Action
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">No actions defined yet. Click "Add Action" to start building your workflow.</p>
                      </div>
                    )}
                    
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            Action {index + 1}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => move(index, index - 1)}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => move(index, index + 1)}
                              disabled={index === fields.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <Separator />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`actions.${index}.type`}
                            render={({ field: actionTypeField }) => (
                              <FormItem>
                                <FormLabel>Action Type *</FormLabel>
                                <Select onValueChange={actionTypeField.onChange} defaultValue={actionTypeField.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select action type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(
                                      actionTypeOptions.reduce((acc, option) => {
                                        if (!acc[option.category]) acc[option.category] = []
                                        acc[option.category].push(option)
                                        return acc
                                      }, {} as Record<string, typeof actionTypeOptions>)
                                    ).map(([category, options]) => (
                                      <div key={category}>
                                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                          {category}
                                        </div>
                                        {options.map((option) => {
                                          const Icon = option.icon
                                          return (
                                            <SelectItem key={option.value} value={option.value}>
                                              <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                {option.label}
                                              </div>
                                            </SelectItem>
                                          )
                                        })}
                                      </div>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`actions.${index}.delay_minutes`}
                            render={({ field: delayField }) => (
                              <FormItem>
                                <FormLabel>Delay (Minutes)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    placeholder="0"
                                    {...delayField}
                                    onChange={(e) => delayField.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>Wait time before executing this action</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`actions.${index}.config`}
                          render={({ field: actionConfigField }) => (
                            <FormItem>
                              <FormLabel>Action Configuration (JSON)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={getActionConfigPlaceholder(form.getValues(`actions.${index}.type`))}
                                  className="min-h-[120px] font-mono text-sm"
                                  value={JSON.stringify(actionConfigField.value, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      actionConfigField.onChange(JSON.parse(e.target.value))
                                    } catch {
                                      // Invalid JSON, don't update field.value
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                <div className="flex items-center gap-1">
                                  <Settings className="h-3 w-3" />
                                  Define parameters for this action in JSON format.
                                </div>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`actions.${index}.condition`}
                          render={({ field: conditionField }) => (
                            <FormItem>
                              <FormLabel>Condition (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., severity == 'critical' && status == 'open'"
                                  {...conditionField}
                                />
                              </FormControl>
                              <FormDescription>Conditional expression to execute this action</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isExecuting || enterpriseLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
