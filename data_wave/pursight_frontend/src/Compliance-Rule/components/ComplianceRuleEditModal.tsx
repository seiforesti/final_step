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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Edit, Shield, AlertTriangle, CheckCircle, FileText, Calendar, User, Target, Loader2, Lightbulb, Settings, Activity, BarChart3 } from 'lucide-react'
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceRequirement } from "../types"

const formSchema = z.object({
  framework: z.string().min(1, "Framework is required"),
  requirement_id: z.string().min(1, "Requirement ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Category is required"),
  risk_level: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["compliant", "non_compliant", "partially_compliant", "not_assessed", "in_progress"]),
  compliance_percentage: z.number().min(0).max(100),
  impact_description: z.string().optional(),
  remediation_plan: z.string().optional(),
  remediation_deadline: z.string().optional(),
  remediation_owner: z.string().optional(),
  assessment_notes: z.string().optional(),
  assessor: z.string().optional(),
  next_assessment: z.string().optional(),
  tags: z.array(z.string()).default([])
})

type FormData = z.infer<typeof formSchema>

interface ComplianceRuleEditModalProps {
  isOpen: boolean
  onClose: () => void
  requirement: ComplianceRequirement | null
  onSuccess: (requirement: ComplianceRequirement) => void
}

const frameworkOptions = [
  { value: "SOC 2", label: "SOC 2 Type II", description: "Service Organization Control 2" },
  { value: "ISO 27001", label: "ISO 27001:2013", description: "Information Security Management" },
  { value: "NIST CSF", label: "NIST Cybersecurity Framework", description: "National Institute of Standards" },
  { value: "GDPR", label: "GDPR", description: "General Data Protection Regulation" },
  { value: "HIPAA", label: "HIPAA", description: "Health Insurance Portability" },
  { value: "PCI DSS", label: "PCI DSS", description: "Payment Card Industry Data Security" },
  { value: "CCPA", label: "CCPA", description: "California Consumer Privacy Act" },
  { value: "FedRAMP", label: "FedRAMP", description: "Federal Risk and Authorization" }
]

const categoryOptions = [
  { value: "access_control", label: "Access Control", icon: Shield },
  { value: "data_protection", label: "Data Protection", icon: FileText },
  { value: "incident_response", label: "Incident Response", icon: AlertTriangle },
  { value: "risk_management", label: "Risk Management", icon: Target },
  { value: "monitoring", label: "Monitoring & Logging", icon: Settings },
  { value: "training", label: "Training & Awareness", icon: User },
  { value: "documentation", label: "Documentation", icon: FileText },
  { value: "audit", label: "Audit & Review", icon: CheckCircle }
]

const riskLevelColors = {
  low: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300", 
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300"
}

export function ComplianceRuleEditModal({ 
  isOpen, 
  onClose, 
  requirement, 
  onSuccess 
}: ComplianceRuleEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { 
    executeAction, 
    sendNotification, 
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'ComplianceRuleEditModal',
    complianceId: requirement?.id,
    enableAnalytics: true,
    enableMonitoring: true
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      framework: "",
      requirement_id: "",
      title: "",
      description: "",
      category: "",
      risk_level: "medium",
      status: "not_assessed",
      compliance_percentage: 0,
      impact_description: "",
      remediation_plan: "",
      remediation_deadline: "",
      remediation_owner: "",
      assessment_notes: "",
      assessor: "",
      next_assessment: "",
      tags: []
    },
  })

  // Reset form when requirement changes
  useEffect(() => {
    if (requirement && isOpen) {
      form.reset({
        framework: requirement.framework,
        requirement_id: requirement.requirement_id,
        title: requirement.title,
        description: requirement.description,
        category: requirement.category,
        risk_level: requirement.risk_level,
        status: requirement.status,
        compliance_percentage: requirement.compliance_percentage,
        impact_description: requirement.impact_description || "",
        remediation_plan: requirement.remediation_plan || "",
        remediation_deadline: requirement.remediation_deadline || "",
        remediation_owner: requirement.remediation_owner || "",
        assessment_notes: requirement.assessment_notes || "",
        assessor: requirement.assessor || "",
        next_assessment: requirement.next_assessment || "",
        tags: requirement.tags || []
      })
    }
  }, [requirement, isOpen, form])

  const watchRiskLevel = form.watch("risk_level")
  const watchStatus = form.watch("status")
  const watchCompliancePercentage = form.watch("compliance_percentage")

  const onSubmit = async (data: FormData) => {
    if (!requirement) return

    try {
      setIsLoading(true)
      
      const updatedRequirement: ComplianceRequirement = {
        ...requirement,
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: "current-user@company.com",
        version: requirement.version + 1
      }

      await executeAction('updateRequirement', {
        id: requirement.id,
        ...updatedRequirement
      })

      onSuccess(updatedRequirement)
      sendNotification('success', `Compliance requirement "${data.title}" updated successfully`)
      onClose()
    } catch (error) {
      console.error("Failed to update compliance requirement:", error)
      sendNotification('error', 'Failed to update compliance requirement')
    } finally {
      setIsLoading(false)
    }
  }

  const suggestRemediationPlan = () => {
    const category = form.getValues('category')
    const riskLevel = form.getValues('risk_level')
    
    const suggestions = {
      access_control: "Implement role-based access controls, conduct regular access reviews, and enforce least privilege principles.",
      data_protection: "Deploy data encryption, implement data classification, and establish data retention policies.",
      incident_response: "Develop incident response procedures, conduct tabletop exercises, and establish communication protocols.",
      risk_management: "Perform risk assessments, implement risk mitigation controls, and establish risk monitoring processes.",
      monitoring: "Deploy security monitoring tools, establish log retention policies, and implement alerting mechanisms.",
      training: "Develop security awareness programs, conduct regular training sessions, and track completion rates.",
      documentation: "Create policy documents, maintain procedure documentation, and establish document control processes.",
      audit: "Schedule regular audits, implement continuous monitoring, and establish audit trail mechanisms."
    }

    const baseSuggestion = suggestions[category as keyof typeof suggestions] || "Develop appropriate controls and procedures."
    const urgencyNote = riskLevel === 'critical' ? " URGENT: Immediate action required." : 
                       riskLevel === 'high' ? " HIGH PRIORITY: Address within 30 days." : ""
    
    form.setValue('remediation_plan', baseSuggestion + urgencyNote)
  }

  const calculateComplianceScore = () => {
    const status = form.getValues('status')
    const scores = {
      compliant: 100,
      partially_compliant: 75,
      in_progress: 50,
      non_compliant: 0,
      not_assessed: 0
    }
    
    const suggestedScore = scores[status as keyof typeof scores]
    form.setValue('compliance_percentage', suggestedScore)
    sendNotification('info', `Compliance percentage set to ${suggestedScore}% based on status`)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: { variant: 'default' as const, color: 'text-green-600', icon: CheckCircle },
      non_compliant: { variant: 'destructive' as const, color: 'text-red-600', icon: AlertTriangle },
      partially_compliant: { variant: 'secondary' as const, color: 'text-yellow-600', icon: Activity },
      not_assessed: { variant: 'outline' as const, color: 'text-gray-600', icon: FileText },
      in_progress: { variant: 'secondary' as const, color: 'text-blue-600', icon: Activity }
    }

    const config = variants[status as keyof typeof variants] || variants.not_assessed
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  if (!requirement) {
    return null
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
            Edit Compliance Requirement
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>{requirement.framework} • {requirement.requirement_id}</span>
            {getStatusBadge(requirement.status)}
          </DialogDescription>
        </DialogHeader>

        {/* Current Status Overview */}
        <Card className="border-muted">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Current Compliance Status</p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(watchStatus)}
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date(requirement.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{watchCompliancePercentage}%</div>
                <Progress value={watchCompliancePercentage} className="w-24 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Requirement Details
                    </CardTitle>
                    <CardDescription>Update basic information about the compliance requirement.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="framework"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compliance Framework *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select framework" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {frameworkOptions.map((framework) => (
                                  <SelectItem key={framework.value} value={framework.value}>
                                    <div>
                                      <div className="font-medium">{framework.label}</div>
                                      <div className="text-xs text-muted-foreground">{framework.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Framework cannot be changed after creation.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requirement_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requirement ID *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., SOC2-ACC-001" {...field} disabled />
                            </FormControl>
                            <FormDescription>Requirement ID cannot be changed after creation.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., User Access Control Implementation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of the compliance requirement, including specific controls and expected outcomes..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoryOptions.map((category) => {
                                  const Icon = category.icon
                                  return (
                                    <SelectItem key={category.value} value={category.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="risk_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Risk Level *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">
                                  <Badge className={riskLevelColors.low}>Low Risk</Badge>
                                </SelectItem>
                                <SelectItem value="medium">
                                  <Badge className={riskLevelColors.medium}>Medium Risk</Badge>
                                </SelectItem>
                                <SelectItem value="high">
                                  <Badge className={riskLevelColors.high}>High Risk</Badge>
                                </SelectItem>
                                <SelectItem value="critical">
                                  <Badge className={riskLevelColors.critical}>Critical Risk</Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="not_assessed">Not Assessed</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="compliant">Compliant</SelectItem>
                                <SelectItem value="partially_compliant">Partially Compliant</SelectItem>
                                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="compliance_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compliance Percentage</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={calculateComplianceScore}
                              >
                                Auto-calc
                              </Button>
                            </div>
                            <FormDescription>Percentage of compliance achieved (0-100)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <div className="w-full">
                          <Label className="text-sm font-medium">Compliance Progress</Label>
                          <div className="mt-2">
                            <Progress value={watchCompliancePercentage} className="h-3" />
                            <div className="text-xs text-muted-foreground mt-1">
                              {watchCompliancePercentage}% Complete
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="impact_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Impact</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the potential business impact if this requirement is not met..."
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Explain the consequences of non-compliance for business operations, reputation, or regulatory standing.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter tags separated by commas (e.g., security, privacy, annual)"
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

                {/* Advanced Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Assessment & Remediation
                        </CardTitle>
                        <CardDescription>Configure assessment schedules and remediation plans.</CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                      >
                        {showAdvanced ? 'Hide' : 'Show'} Advanced
                      </Button>
                    </div>
                  </CardHeader>
                  {showAdvanced && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="assessor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assessor</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., compliance-officer@company.com" {...field} />
                              </FormControl>
                              <FormDescription>Person responsible for assessment</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="next_assessment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Next Assessment Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="assessment_notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assessment Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Assessment notes, findings, and observations..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="remediation_owner"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remediation Owner</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., security-team@company.com" {...field} />
                              </FormControl>
                              <FormDescription>Person or team responsible for remediation</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="remediation_deadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remediation Deadline</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="remediation_plan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remediation Plan</FormLabel>
                            <div className="flex gap-2 mb-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={suggestRemediationPlan}
                                className="flex items-center gap-1"
                              >
                                <Lightbulb className="h-3 w-3" />
                                Suggest Plan
                              </Button>
                            </div>
                            <FormControl>
                              <Textarea 
                                placeholder="Detailed steps to achieve compliance with this requirement..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  )}
                </Card>

                {/* Risk Level Alert */}
                {watchRiskLevel === 'critical' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Critical Risk Level:</strong> This requirement requires immediate attention and should be prioritized for implementation.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Status Change Alert */}
                {requirement.status !== watchStatus && (
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Status Change:</strong> Changing from "{requirement.status.replace('_', ' ')}" to "{watchStatus.replace('_', ' ')}".
                      This will be recorded in the audit trail.
                    </AlertDescription>
                  </Alert>
                )}
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
                    Updating...
                  </>
                ) : (
                  "Update Requirement"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
