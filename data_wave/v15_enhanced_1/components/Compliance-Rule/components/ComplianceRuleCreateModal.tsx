"use client"

import React, { useState, useEffect } from "react"
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Info, Loader2, Plus, Search, Shield, Database, FileText, Settings, Zap, Target, Clock, Users, AlertTriangle, ExternalLink,  } from 'lucide-react'

// **NEW: Enhanced Imports**
import { ComplianceAPIs } from '../services/enterprise-apis'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceHooks } from '../hooks/use-enterprise-features'
import type { ComplianceRequirement } from '../types'

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  rule_type: z.string().min(1, "Rule type is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  compliance_standard: z.string().optional(),
  scope: z.enum(["global", "data_source", "schema", "table", "column", "field"]),
  condition: z.string().min(1, "Condition is required"),
  data_source_ids: z.array(z.number()).optional(),
  tags: z.array(z.string()).optional(),
  validation_frequency: z.enum(["daily", "weekly", "monthly"]),
  auto_remediation: z.boolean().default(false),
  scan_integration: z.object({
    auto_scan_on_evaluation: z.boolean().default(false),
    scan_triggers: z.array(z.string()).default([])
  }).optional(),
  remediation_steps: z.string().optional(),
  business_impact: z.enum(["low", "medium", "high", "critical"]),
  regulatory_requirement: z.boolean().default(false)
})

type FormData = z.infer<typeof formSchema>

interface ComplianceRuleCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (rule: ComplianceRequirement) => void
  initialData?: Partial<ComplianceRequirement>
}

const ruleTypes = [
  { value: "regulatory", label: "Regulatory", description: "Government and industry regulations", icon: Shield },
  { value: "internal", label: "Internal", description: "Company policies and standards", icon: FileText },
  { value: "security", label: "Security", description: "Security controls and measures", icon: Shield },
  { value: "privacy", label: "Privacy", description: "Data privacy and protection", icon: Users },
  { value: "quality", label: "Quality", description: "Data quality standards", icon: Target },
  { value: "access_control", label: "Access Control", description: "Access management rules", icon: Users },
  { value: "data_retention", label: "Data Retention", description: "Data lifecycle management", icon: Clock },
  { value: "encryption", label: "Encryption", description: "Data encryption requirements", icon: Shield },
  { value: "audit", label: "Audit", description: "Audit trail and logging", icon: FileText },
  { value: "custom", label: "Custom", description: "Custom rule logic", icon: Zap },
]

export function ComplianceRuleCreateModal({ isOpen, onClose, onSuccess, initialData }: ComplianceRuleCreateModalProps) {
  // **NEW: Enhanced State Management**
  const enterprise = useEnterpriseCompliance()
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceRuleCreateModal',
    enableAnalytics: true,
    enableWorkflows: true
  })

  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")
  
  // **NEW: Data Loading States**
  const [dataSources, setDataSources] = useState<any[]>([])
  const [frameworks, setFrameworks] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedFramework, setSelectedFramework] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [loadingDataSources, setLoadingDataSources] = useState(false)
  const [loadingFrameworks, setLoadingFrameworks] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      rule_type: initialData?.rule_type || "",
      severity: (initialData?.severity as any) || "medium",
      compliance_standard: initialData?.compliance_standard || "",
      scope: (initialData?.scope as any) || "global",
      condition: initialData?.condition || "",
      data_source_ids: initialData?.data_source_ids || [],
      tags: initialData?.tags || [],
      validation_frequency: "weekly",
      auto_remediation: false,
      scan_integration: {
        auto_scan_on_evaluation: false,
        scan_triggers: []
      },
      business_impact: "medium",
      regulatory_requirement: false
    },
  })

  // **NEW: Load Data Sources**
  useEffect(() => {
    const loadDataSources = async () => {
      if (!isOpen) return
      
      setLoadingDataSources(true)
      try {
        const response = await ComplianceAPIs.ComplianceManagement.getDataSources()
        setDataSources(response || [])
        
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'data_sources_loaded', count: response?.length || 0 },
          source: 'ComplianceRuleCreateModal',
          severity: 'low'
        })
        
      } catch (error) {
        console.error('Failed to load data sources:', error)
        enterprise.sendNotification('error', 'Failed to load data sources')
      } finally {
        setLoadingDataSources(false)
      }
    }

    loadDataSources()
  }, [isOpen, enterprise])

  // **NEW: Load Frameworks**
  useEffect(() => {
    const loadFrameworks = async () => {
      if (!isOpen) return
      
      setLoadingFrameworks(true)
      try {
        const response = await ComplianceAPIs.ComplianceManagement.getFrameworks()
        setFrameworks(response || [])
        
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'frameworks_loaded', count: response?.length || 0 },
          source: 'ComplianceRuleCreateModal',
          severity: 'low'
        })
        
      } catch (error) {
        console.error('Failed to load frameworks:', error)
        enterprise.sendNotification('error', 'Failed to load compliance frameworks')
      } finally {
        setLoadingFrameworks(false)
      }
    }

    loadFrameworks()
  }, [isOpen, enterprise])

  // **NEW: Load Templates When Framework Selected**
  useEffect(() => {
    const loadTemplates = async () => {
      if (!selectedFramework) {
        setTemplates([])
        return
      }
      
      setLoadingTemplates(true)
      try {
        const response = await ComplianceAPIs.ComplianceManagement.getTemplatesByFramework(selectedFramework)
        setTemplates(response || [])
        
      } catch (error) {
        console.error('Failed to load templates:', error)
        enterprise.sendNotification('error', 'Failed to load rule templates')
      } finally {
        setLoadingTemplates(false)
      }
    }

    loadTemplates()
  }, [selectedFramework, enterprise])

  // **NEW: Apply Template**
  const applyTemplate = (template: any) => {
    setSelectedTemplate(template)
    
    // Update form with template values
    form.setValue('name', template.name)
    form.setValue('description', template.description)
    form.setValue('rule_type', template.rule_type)
    form.setValue('severity', template.severity)
    form.setValue('condition', template.condition)
    
    const framework = frameworks.find(f => f.templates.some((t: any) => t.id === template.id))
    if (framework) {
      form.setValue('compliance_standard', framework.name)
    }
    
    enterprise.sendNotification('success', `Applied template: ${template.name}`)
  }

  // **NEW: Enhanced Form Submission**
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      let rule: ComplianceRequirement

      if (selectedTemplate) {
        // Create from template
        rule = await ComplianceAPIs.ComplianceManagement.createRuleFromTemplate({
          template_id: selectedTemplate.id,
          customizations: {
            ...data,
            metadata: {
              created_from_template: true,
              template_id: selectedTemplate.id,
              framework: selectedFramework
            }
          }
        }, 'current_user') // Replace with actual user
      } else {
        // Create from scratch
        rule = await ComplianceAPIs.ComplianceManagement.createRequirement({
          ...data,
          status: 'draft',
          metadata: {
            created_from_scratch: true
          }
        }, 'current_user') // Replace with actual user
      }

      enterprise.sendNotification('success', `Compliance rule "${rule.name}" created successfully`)
      
      // Emit success event
      enterprise.emitEvent({
        type: 'compliance_rule_created',
        data: { rule_id: rule.id, rule_name: rule.name },
        source: 'ComplianceRuleCreateModal',
        severity: 'low'
      })

      onSuccess(rule)
      onClose()
      
    } catch (error) {
      console.error("Failed to create rule:", error)
      enterprise.sendNotification('error', 'Failed to create compliance rule')
    } finally {
      setLoading(false)
    }
  }

  // **NEW: Reset Form**
  const resetForm = () => {
    form.reset()
    setSelectedFramework("")
    setSelectedTemplate(null)
    setCurrentTab("basic")
  }

  // Close handler
  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span>Create Compliance Rule</span>
            {selectedTemplate && (
              <Badge variant="secondary" className="ml-2">
                From Template: {selectedTemplate.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Create a new compliance rule to monitor and enforce regulatory requirements
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="framework">Framework & Templates</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>

              {/* **NEW: Framework & Templates Tab** */}
              <TabsContent value="framework" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Compliance Frameworks</h4>
                    {loadingFrameworks ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading frameworks...
                      </div>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {frameworks.map((framework) => (
                            <Card
                              key={framework.id}
                              className={`cursor-pointer transition-colors ${
                                selectedFramework === framework.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSelectedFramework(framework.id)}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{framework.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {framework.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-1">
                                  {framework.categories?.slice(0, 3).map((category: string) => (
                                    <Badge key={category} variant="outline" className="text-xs">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Rule Templates</h4>
                    {selectedFramework ? (
                      loadingTemplates ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading templates...
                        </div>
                      ) : templates.length > 0 ? (
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {templates.map((template) => (
                              <Card
                                key={template.id}
                                className={`cursor-pointer transition-colors ${
                                  selectedTemplate?.id === template.id ? 'border-green-500 bg-green-50' : 'hover:bg-muted/50'
                                }`}
                                onClick={() => applyTemplate(template)}
                              >
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">{template.name}</CardTitle>
                                  <CardDescription className="text-xs">
                                    {template.description}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      {template.rule_type}
                                    </Badge>
                                    <Badge variant={template.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                      {template.severity}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center text-muted-foreground p-4">
                          No templates available for this framework
                        </div>
                      )
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        Select a framework to view templates
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter rule name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rule_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rule type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ruleTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center space-x-2">
                                  <type.icon className="h-4 w-4" />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
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
                        <Textarea
                          placeholder="Describe what this rule checks for"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scope</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select scope" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="data_source">Data Source</SelectItem>
                            <SelectItem value="schema">Schema</SelectItem>
                            <SelectItem value="table">Table</SelectItem>
                            <SelectItem value="column">Column</SelectItem>
                            <SelectItem value="field">Field</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="business_impact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Impact</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select impact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="configuration" className="space-y-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Condition</FormLabel>
                      <FormDescription>
                        Define the condition that will be evaluated for compliance
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Enter rule condition (e.g., encryption_enabled == true AND access_control_enabled == true)"
                          className="min-h-[120px] font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validation_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validation Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compliance_standard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Standard</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SOC 2, GDPR, HIPAA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="auto_remediation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto Remediation</FormLabel>
                          <FormDescription>
                            Automatically attempt to fix compliance issues when detected
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="regulatory_requirement"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Regulatory Requirement</FormLabel>
                          <FormDescription>
                            This rule is required by external regulations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="remediation_steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remediation Steps</FormLabel>
                      <FormDescription>
                        Describe the steps to resolve compliance issues
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="1. Review the non-compliant data&#10;2. Apply necessary controls&#10;3. Verify compliance"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* **NEW: Integration Tab** */}
              <TabsContent value="integration" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Data Sources</h4>
                    <FormField
                      control={form.control}
                      name="data_source_ids"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Applicable Data Sources</FormLabel>
                          <FormDescription>Select which data sources this rule should apply to</FormDescription>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {loadingDataSources ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading data sources...
                              </div>
                            ) : dataSources.length === 0 ? (
                              <div className="text-center text-muted-foreground p-4">
                                No data sources found. Please ensure data sources are configured.
                              </div>
                            ) : (
                              dataSources.map((source) => (
                                <div key={source.id} className="flex items-center space-x-2 p-2 border rounded">
                                  <Checkbox
                                    id={`source-${source.id}`}
                                    checked={field.value?.includes(source.id) || false}
                                    onCheckedChange={(checked) => {
                                      const currentIds = field.value || []
                                      if (checked) {
                                        field.onChange([...currentIds, source.id])
                                      } else {
                                        field.onChange(currentIds.filter((id) => id !== source.id))
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <Label htmlFor={`source-${source.id}`} className="font-medium">
                                      {source.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {source.source_type} • {source.environment} • {source.data_classification}
                                    </p>
                                  </div>
                                  {source.compliance_score !== undefined && (
                                    <Badge variant={source.compliance_score >= 80 ? 'default' : 'destructive'}>
                                      {source.compliance_score}%
                                    </Badge>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Scan Integration</h4>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="scan_integration.auto_scan_on_evaluation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Auto Scan on Evaluation</FormLabel>
                              <FormDescription>
                                Automatically trigger scans when evaluating this rule
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="scan_integration.scan_triggers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scan Triggers</FormLabel>
                            <FormDescription>When should scans be triggered for this rule</FormDescription>
                            <div className="space-y-2">
                              {['schedule', 'on_change', 'manual'].map((trigger) => (
                                <div key={trigger} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`trigger-${trigger}`}
                                    checked={field.value?.includes(trigger) || false}
                                    onCheckedChange={(checked) => {
                                      const currentTriggers = field.value || []
                                      if (checked) {
                                        field.onChange([...currentTriggers, trigger])
                                      } else {
                                        field.onChange(currentTriggers.filter((t) => t !== trigger))
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`trigger-${trigger}`} className="capitalize">
                                    {trigger.replace('_', ' ')}
                                  </Label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Rule"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
