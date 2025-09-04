"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
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
import { FileText, Download, Calendar, Clock, Users, Settings, Eye, Loader2, AlertTriangle, CheckCircle, FileSpreadsheet, FileCode, FileImage } from 'lucide-react'
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceReport } from "../types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  type: z.enum(["compliance_status", "gap_analysis", "risk_assessment", "audit_trail", "executive_summary", "detailed_findings"]),
  format: z.enum(["pdf", "excel", "csv", "json", "html"]),
  framework: z.string().optional(),
  schedule: z.enum(["once", "daily", "weekly", "monthly", "quarterly"]).default("once"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  recipients: z.string().optional(),
  filters: z.object({
    date_range: z.string().optional(),
    severity: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional()
  }).optional(),
  include_charts: z.boolean().default(true),
  include_recommendations: z.boolean().default(true),
  include_raw_data: z.boolean().default(false)
})

type FormData = z.infer<typeof formSchema>

interface ReportCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (report: ComplianceReport) => void
  dataSourceId?: number
}

const reportTypeOptions = [
  { value: "compliance_status", label: "Compliance Status", icon: CheckCircle, description: "Overall compliance posture and metrics" },
  { value: "gap_analysis", label: "Gap Analysis", icon: AlertTriangle, description: "Identify compliance gaps and remediation needs" },
  { value: "risk_assessment", label: "Risk Assessment", icon: FileText, description: "Risk analysis and mitigation strategies" },
  { value: "audit_trail", label: "Audit Trail", icon: Clock, description: "Detailed audit logs and activities" },
  { value: "executive_summary", label: "Executive Summary", icon: Users, description: "High-level overview for executives" },
  { value: "detailed_findings", label: "Detailed Findings", icon: FileSpreadsheet, description: "Comprehensive findings and evidence" }
]

const formatOptions = [
  { value: "pdf", label: "PDF", icon: FileText, description: "Portable document format" },
  { value: "excel", label: "Excel", icon: FileSpreadsheet, description: "Microsoft Excel spreadsheet" },
  { value: "csv", label: "CSV", icon: FileCode, description: "Comma-separated values" },
  { value: "json", label: "JSON", icon: FileCode, description: "JavaScript Object Notation" },
  { value: "html", label: "HTML", icon: FileImage, description: "Web page format" }
]

export function ReportCreateModal({ isOpen, onClose, onSuccess, dataSourceId }: ReportCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [reportTemplates, setReportTemplates] = useState<any>({})
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [frameworks, setFrameworks] = useState<any[]>([])

  const { 
    executeAction, 
    sendNotification, 
    getMetrics,
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'ReportCreateModal',
    dataSourceId,
    enableAnalytics: true,
    enableMonitoring: true,
    enableWorkflows: true
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "compliance_status",
      format: "pdf",
      framework: "",
      schedule: "once",
      priority: "medium",
      recipients: "",
      filters: {
        date_range: "last_30_days",
        severity: [],
        status: [],
        categories: []
      },
      include_charts: true,
      include_recommendations: true,
      include_raw_data: false
    },
  })

  // Load templates and frameworks from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setTemplatesLoading(true)
        const [templatesData, frameworksData] = await Promise.all([
          ComplianceAPIs.Audit.getReportTemplates(),
          ComplianceAPIs.Framework.getFrameworks()
        ])
        
        // Convert templates array to object for easier access
        const templatesObj = templatesData.reduce((acc: any, template: any) => {
          acc[template.type] = template
          return acc
        }, {})
        
        setReportTemplates(templatesObj)
        setFrameworks(frameworksData)
      } catch (error) {
        console.error('Failed to load data:', error)
        sendNotification('error', 'Failed to load report templates and frameworks')
      } finally {
        setTemplatesLoading(false)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen, sendNotification])

  const watchType = form.watch("type")
  const watchFormat = form.watch("format")

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      
      const reportData = {
        ...data,
        data_source_id: dataSourceId,
        status: 'draft' as const,
        parameters: {
          include_charts: data.include_charts,
          include_recommendations: data.include_recommendations,
          include_raw_data: data.include_raw_data
        },
        filters: data.filters || {},
        recipients: data.recipients ? data.recipients.split(',').map(r => r.trim()) : [],
        distribution_method: 'download' as const,
        access_level: 'internal' as const,
        metadata: {
          created_via: 'modal',
          template_used: reportTemplates[data.type]?.id || data.type
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "current-user@company.com",
        updated_by: "current-user@company.com"
      }

      const createdReport = await executeAction('createReport', reportData)
      onSuccess(createdReport)
      sendNotification('success', `Report "${data.name}" created successfully`)
      onClose()
      
      // Reset form for next use
      form.reset()
    } catch (error) {
      console.error("Failed to create report:", error)
      sendNotification('error', 'Failed to create report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = async () => {
    try {
      setIsPreviewLoading(true)
      const formData = form.getValues()
      
      const previewData = {
        type: formData.type,
        format: formData.format,
        data_source_id: dataSourceId,
        filters: formData.filters,
        parameters: {
          include_charts: formData.include_charts,
          include_recommendations: formData.include_recommendations,
          include_raw_data: formData.include_raw_data
        }
      }

      const preview = await ComplianceAPIs.Audit.previewReport(previewData)
      sendNotification('success', 'Report preview generated successfully')
      
      // Open preview in new window/tab
      if (preview.preview_url) {
        window.open(preview.preview_url, '_blank')
      }
    } catch (error) {
      console.error("Failed to generate preview:", error)
      sendNotification('error', 'Failed to generate report preview')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const loadTemplate = async () => {
    try {
      const template = reportTemplates[watchType]
      if (template) {
        // Apply template settings to form
        if (template.default_format) {
          form.setValue('format', template.default_format)
        }
        if (template.default_filters) {
          form.setValue('filters', template.default_filters)
        }
        if (template.default_parameters) {
          form.setValue('include_charts', template.default_parameters.include_charts ?? true)
          form.setValue('include_recommendations', template.default_parameters.include_recommendations ?? true)
          form.setValue('include_raw_data', template.default_parameters.include_raw_data ?? false)
        }
        sendNotification('info', 'Report template applied successfully')
      } else {
        sendNotification('warning', 'No template available for this report type')
      }
    } catch (error) {
      sendNotification('error', 'Failed to load report template')
    }
  }

  const getEstimatedSize = () => {
    const template = reportTemplates[watchType]
    return template?.estimated_size || "~2-5 MB"
  }

  const getGenerationTime = () => {
    const template = reportTemplates[watchType]
    return template?.generation_time || "2-5 minutes"
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
              <PlusCircle className="h-5 w-5" />
            </motion.div>
            Create New Report
          </DialogTitle>
          <DialogDescription>Define the properties and configuration for your new compliance report.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Report Details</CardTitle>
                    <CardDescription>Basic information about the report.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Monthly Compliance Overview" {...field} />
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

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description of the report content and purpose..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Report Configuration */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Report Configuration</CardTitle>
                      <CardDescription>Define the type, format, and content settings.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={loadTemplate}>
                      Load Template
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(
                                  reportTypeOptions.reduce((acc, option) => {
                                    if (!acc[option.category]) acc[option.category] = []
                                    acc[option.category].push(option)
                                    return acc
                                  }, {} as Record<string, typeof reportTypeOptions>)
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
                                            <div>
                                              <div className="font-medium">{option.label}</div>
                                              <div className="text-xs text-muted-foreground">{option.description}</div>
                                            </div>
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
                        name="format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Output Format *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {formatOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Download className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-xs text-muted-foreground">{option.description}</div>
                                      </div>
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
                      name="schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reportScheduleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">{option.label}</div>
                                      <div className="text-xs text-muted-foreground">{option.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>How often should this report be generated?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="include_charts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Include Charts</FormLabel>
                              <FormDescription className="text-xs">Add visual charts and graphs</FormDescription>
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
                        name="include_recommendations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Include Recommendations</FormLabel>
                              <FormDescription className="text-xs">Add remediation suggestions</FormDescription>
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
                  </CardContent>
                </Card>

                {/* Compliance Frameworks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Frameworks</CardTitle>
                    <CardDescription>Select which compliance frameworks to include in the report.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="compliance_frameworks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frameworks</FormLabel>
                          <FormDescription>Select the compliance frameworks to analyze</FormDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {complianceFrameworks.map((framework) => (
                              <Badge
                                key={framework}
                                variant={field.value?.includes(framework) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || []
                                  if (current.includes(framework)) {
                                    field.onChange(current.filter(f => f !== framework))
                                  } else {
                                    field.onChange([...current, framework])
                                  }
                                }}
                              >
                                {framework}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Distribution & Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribution & Filters</CardTitle>
                    <CardDescription>Configure recipients and data filters.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="recipients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipients</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., compliance-team@company.com, ciso@company.com"
                              value={field.value?.join(", ") || ""}
                              onChange={(e) => {
                                const emails = e.target.value
                                  .split(",")
                                  .map((email) => email.trim())
                                  .filter((email) => email.length > 0)
                                field.onChange(emails)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Comma-separated email addresses for report distribution.</FormDescription>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {field.value?.map((recipient, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {recipient}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="filters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filters (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='e.g., {"severity": ["high", "critical"], "status": ["open"], "time_range": "last_30_days"}'
                              className="min-h-[100px] font-mono text-sm"
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
                              <Filter className="h-3 w-3" />
                              Define data filters in JSON format to customize report content.
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Report Estimates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Report Estimates</CardTitle>
                    <CardDescription>Estimated generation time and file size.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{getEstimatedSize()}</div>
                        <div className="text-sm text-muted-foreground">Estimated Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{getGenerationTime()}</div>
                        <div className="text-sm text-muted-foreground">Generation Time</div>
                      </div>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePreview}
                          className="flex items-center gap-2"
                        >
                          <Info className="h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </div>

                    {previewData && (
                      <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Preview generated successfully. The report will include {previewData.sections?.length || 0} sections 
                          and approximately {previewData.estimatedRecords || 0} data records.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || enterpriseLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
