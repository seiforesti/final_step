"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Edit, Mail, Webhook, Settings, RefreshCw, Play, CheckCircle, AlertTriangle, Info, Loader2, Activity } from 'lucide-react'
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceIntegration } from "../types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  type: z.enum(["jira", "servicenow", "slack", "email", "custom_webhook", "teams", "pagerduty"]),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  config: z
    .string()
    .optional()
    .transform((str) => {
      try {
        return str ? JSON.parse(str) : {}
      } catch {
        return {}
      }
    })
    .refine((val) => typeof val === "object" && val !== null, {
      message: "Configuration must be a valid JSON object",
    }),
  is_active: z.boolean().default(true),
  notification_settings: z.object({
    on_compliance_violation: z.boolean().default(true),
    on_assessment_complete: z.boolean().default(true),
    on_risk_threshold_exceeded: z.boolean().default(true),
    severity_filter: z.array(z.enum(["low", "medium", "high", "critical"])).default(["high", "critical"])
  }).default({})
})

type FormData = z.infer<typeof formSchema>

interface IntegrationEditModalProps {
  isOpen: boolean
  onClose: () => void
  integration: ComplianceIntegration
  onSuccess: (integration: ComplianceIntegration) => void
}

const integrationTypeOptions = [
  {
    value: "jira",
    label: "Jira",
    description: "Issue tracking and project management",
    icon: () => <div className="h-4 w-4 bg-blue-500 rounded"></div>,
    category: "ticketing"
  },
  {
    value: "servicenow",
    label: "ServiceNow",
    description: "IT service management platform",
    icon: () => <div className="h-4 w-4 bg-green-500 rounded"></div>,
    category: "ticketing"
  },
  {
    value: "slack",
    label: "Slack",
    description: "Team communication and collaboration",
    icon: () => <div className="h-4 w-4 bg-purple-500 rounded"></div>,
    category: "communication"
  },
  {
    value: "teams",
    label: "Microsoft Teams",
    description: "Enterprise communication platform",
    icon: () => <div className="h-4 w-4 bg-blue-600 rounded"></div>,
    category: "communication"
  },
  { 
    value: "email", 
    label: "Email", 
    description: "SMTP email notifications",
    icon: Mail,
    category: "communication"
  },
  {
    value: "pagerduty",
    label: "PagerDuty",
    description: "Incident response and alerting",
    icon: () => <div className="h-4 w-4 bg-orange-500 rounded"></div>,
    category: "alerting"
  },
  { 
    value: "custom_webhook", 
    label: "Custom Webhook", 
    description: "Custom HTTP endpoint integration",
    icon: Webhook,
    category: "custom"
  },
]

export function IntegrationEditModal({ isOpen, onClose, integration, onSuccess }: IntegrationEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  const { 
    executeAction, 
    sendNotification, 
    getMetrics,
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'IntegrationEditModal',
    complianceId: integration.id,
    enableAnalytics: true,
    enableMonitoring: true
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: integration.name,
      type: integration.type,
      description: integration.description || "",
      config: integration.config || {},
      is_active: integration.status === 'active',
      notification_settings: integration.notification_settings || {
        on_compliance_violation: true,
        on_assessment_complete: true,
        on_risk_threshold_exceeded: true,
        severity_filter: ["high", "critical"]
      }
    },
  })

  // Reset form with new integration data if the integration prop changes
  useEffect(() => {
    if (integration) {
      form.reset({
        name: integration.name,
        type: integration.type,
        description: integration.description || "",
        config: integration.config || {},
        is_active: integration.status === 'active',
        notification_settings: integration.notification_settings || {
          on_compliance_violation: true,
          on_assessment_complete: true,
          on_risk_threshold_exceeded: true,
          severity_filter: ["high", "critical"]
        }
      })
    }
  }, [integration, form])

  const watchType = form.watch("type")

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      
      const updatedIntegration: ComplianceIntegration = {
        ...integration,
        ...data,
        status: data.is_active ? 'active' : 'inactive',
        updated_at: new Date().toISOString(),
        updated_by: "current-user@company.com",
      }

      await executeAction('updateIntegration', {
        id: integration.id,
        ...updatedIntegration
      })

      onSuccess(updatedIntegration)
      sendNotification('success', `Integration "${data.name}" updated successfully`)
      onClose()
    } catch (error) {
      console.error("Failed to update integration:", error)
      sendNotification('error', 'Failed to update integration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    const formData = form.getValues()
    if (!formData.config || Object.keys(formData.config).length === 0) {
      setTestStatus('error')
      setTestMessage('Please configure the integration before testing')
      return
    }

    setTestStatus('testing')
    setTestMessage('Testing connection...')
    setIsTesting(true)

    try {
      await executeAction('testIntegration', {
        id: integration.id,
        type: formData.type,
        config: formData.config
      })
      
      setTestStatus('success')
      setTestMessage('Connection test successful!')
      sendNotification('success', 'Integration test passed')
    } catch (error) {
      setTestStatus('error')
      setTestMessage('Connection test failed. Please check your configuration.')
      sendNotification('error', 'Integration test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleSyncNow = async () => {
    try {
      await executeAction('syncIntegration', { id: integration.id })
      sendNotification('success', 'Integration sync initiated')
    } catch (error) {
      sendNotification('error', 'Failed to sync integration')
    }
  }

  const getConfigPlaceholder = (type: string) => {
    const templates = {
      jira: `{
  "url": "https://company.atlassian.net",
  "username": "compliance-user@company.com",
  "api_token": "ATATT3xFfGF0...",
  "project_key": "COMP",
  "issue_type": "Compliance Issue"
}`,
      servicenow: `{
  "instance_url": "https://company.service-now.com",
  "username": "compliance.integration",
  "password": "secure_password_123",
  "table": "incident",
  "category": "Compliance"
}`,
      slack: `{
  "webhook_url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
  "channel": "#compliance-alerts",
  "username": "Compliance Bot"
}`,
      teams: `{
  "webhook_url": "https://company.webhook.office.com/webhookb2/...",
  "channel_name": "Compliance Alerts"
}`,
      email: `{
  "smtp_server": "smtp.company.com",
  "port": 587,
  "username": "compliance-alerts@company.com",
  "from_address": "compliance-alerts@company.com"
}`,
      pagerduty: `{
  "integration_key": "R01234567890123456789012345678901",
  "service_name": "Compliance Monitoring"
}`,
      custom_webhook: `{
  "webhook_url": "https://api.company.com/compliance/webhook",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer token_here"
  }
}`
    }
    return templates[type as keyof typeof templates] || "Enter configuration in JSON format"
  }

  const getTestStatusIcon = () => {
    switch (testStatus) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      syncing: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <Activity className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Edit className="h-5 w-5" />
            </motion.div>
            Edit Integration: {integration.name}
          </DialogTitle>
          <DialogDescription>
            Update the configuration for this external system integration.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Integration Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Integration Status
                      {getStatusBadge(integration.status)}
                    </CardTitle>
                    <CardDescription>Current status and performance metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{integration.success_count || 0}</div>
                        <div className="text-sm text-muted-foreground">Successful Operations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{integration.error_count || 0}</div>
                        <div className="text-sm text-muted-foreground">Failed Operations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-sm text-muted-foreground">Last Sync</div>
                      </div>
                    </div>

                    {integration.last_error && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Last Error:</strong> {integration.last_error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="flex items-center gap-2"
                      >
                        {getTestStatusIcon()}
                        {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSyncNow}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Sync Now
                      </Button>

                      <AnimatePresence>
                        {testMessage && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                          >
                            <Badge variant={testStatus === 'success' ? 'default' : testStatus === 'error' ? 'destructive' : 'secondary'}>
                              {testMessage}
                            </Badge>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Integration Details</CardTitle>
                    <CardDescription>Basic information and connection settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Compliance Slack Alerts" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select integration type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {integrationTypeOptions.map((option) => {
                                  const Icon = option.icon
                                  return (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon />
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
                            <FormDescription>Integration type cannot be changed after creation.</FormDescription>
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
                            <Textarea placeholder="Describe the purpose and scope of this integration..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Integration</FormLabel>
                            <FormDescription>Enable or disable this integration</FormDescription>
                          </div>
                          <FormControl>
                            <input 
                              type="checkbox" 
                              checked={field.value} 
                              onChange={field.onChange}
                              className="rounded border-gray-300"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configuration</CardTitle>
                    <CardDescription>Connection settings and authentication details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="config"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Configuration (JSON) *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={getConfigPlaceholder(watchType)}
                              className="min-h-[200px] font-mono text-sm"
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
                              Enter the connection configuration in JSON format.
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notification Settings</CardTitle>
                    <CardDescription>Configure when and how notifications are sent.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="notification_settings.on_compliance_violation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Compliance Violations</FormLabel>
                              <FormDescription className="text-xs">Notify on rule violations and non-compliance issues</FormDescription>
                            </div>
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value} 
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notification_settings.on_assessment_complete"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Assessment Completion</FormLabel>
                              <FormDescription className="text-xs">Notify when compliance assessments are completed</FormDescription>
                            </div>
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value} 
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notification_settings.severity_filter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Filter</FormLabel>
                          <FormDescription>Select which severity levels should trigger notifications</FormDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['low', 'medium', 'high', 'critical'].map((severity) => (
                              <Badge
                                key={severity}
                                variant={field.value?.includes(severity as any) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || []
                                  if (current.includes(severity as any)) {
                                    field.onChange(current.filter(s => s !== severity))
                                  } else {
                                    field.onChange([...current, severity])
                                  }
                                }}
                              >
                                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Integration Capabilities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Integration Capabilities</CardTitle>
                    <CardDescription>Features available with this integration type.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {integration.capabilities?.map((capability) => (
                        <Badge key={capability} variant="secondary">
                          {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      )) || (
                        <div className="text-sm text-muted-foreground">No capabilities defined</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isTesting || enterpriseLoading}>
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
