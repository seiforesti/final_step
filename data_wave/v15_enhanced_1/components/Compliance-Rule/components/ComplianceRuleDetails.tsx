"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye,
  Edit,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Activity,
  Target,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  History,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react"
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceRequirement } from "../types"

interface ComplianceRuleDetailsProps {
  isOpen: boolean
  onClose: () => void
  requirement: ComplianceRequirement | null
  onEdit?: (requirement: ComplianceRequirement) => void
  onDelete?: (requirement: ComplianceRequirement) => void
}

export function ComplianceRuleDetails({ 
  isOpen, 
  onClose, 
  requirement: initialRequirement, 
  onEdit, 
  onDelete 
}: ComplianceRuleDetailsProps) {
  // State
  const [requirement, setRequirement] = useState<ComplianceRequirement | null>(initialRequirement || null)
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([])
  const [evidenceFiles, setEvidenceFiles] = useState<any[]>([])
  const [relatedRequirements, setRelatedRequirements] = useState<ComplianceRequirement[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { 
    executeAction, 
    sendNotification, 
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'ComplianceRuleDetails',
    complianceId: requirement?.id,
    enableAnalytics: true,
    enableMonitoring: true
  })

  // Load requirement details from backend
  useEffect(() => {
    const loadRequirementDetails = async () => {
      if (!requirementId) return
      
      setLoading(true)
      try {
        // Load main requirement data
        const requirementData = await ComplianceAPIs.ComplianceManagement.getRequirement(requirementId)
        setRequirement(requirementData)
        
        // Load evaluation history
        const evaluationsResponse = await ComplianceAPIs.ComplianceManagement.getRuleEvaluations(requirementId, {
          page: 1,
          limit: 10
        })
        setAssessmentHistory(evaluationsResponse.data || [])
        
        // Load related requirements (same framework)
        if (requirementData.framework) {
          const relatedResponse = await ComplianceAPIs.ComplianceManagement.getRequirements({
            framework: requirementData.framework,
            limit: 5
          })
          setRelatedRequirements((relatedResponse.data || []).filter(r => r.id !== requirementId))
        }
        
        // Emit success event
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'requirement_details_loaded', requirement_id: requirementId },
          source: 'ComplianceRuleDetails',
          severity: 'low'
        })
        
      } catch (error) {
        console.error('Failed to load requirement details:', error)
        enterprise.sendNotification('error', 'Failed to load compliance requirement details')
        onError?.('Failed to load compliance requirement details')
        
        // Emit error event
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'requirement_details_load_failed', error: error.message },
          source: 'ComplianceRuleDetails',
          severity: 'high'
        })
      } finally {
        setLoading(false)
      }
    }

    loadRequirementDetails()
  }, [requirementId, enterprise])

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: { variant: 'default' as const, color: 'text-green-600', icon: CheckCircle },
      non_compliant: { variant: 'destructive' as const, color: 'text-red-600', icon: AlertTriangle },
      partially_compliant: { variant: 'secondary' as const, color: 'text-yellow-600', icon: Clock },
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

  const getRiskLevelBadge = (riskLevel: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300'
    }

    return (
      <Badge className={variants[riskLevel as keyof typeof variants] || variants.medium}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
      </Badge>
    )
  }

  const handleRefresh = async () => {
    if (!requirement?.id) return
    
    setLoading(true)
    try {
      // Load fresh requirement data from backend
      const requirementResponse = await ComplianceAPIs.ComplianceManagement.getRequirement(requirement.id)
      setRequirement(requirementResponse.data)
      
      // Load assessment history from backend
      const assessmentResponse = await ComplianceAPIs.ComplianceManagement.getRuleEvaluations(requirement.id, {
        page: 1,
        limit: 20,
        sort: 'created_at',
        sort_order: 'desc'
      })
      setAssessmentHistory(assessmentResponse.data?.data || [])
      
      // Load evidence files from backend
      const evidenceResponse = await ComplianceAPIs.ComplianceManagement.getRequirementEvidence(requirement.id)
      setEvidenceFiles(evidenceResponse.data || [])
      
      // Load related requirements from backend
      const relatedResponse = await ComplianceAPIs.ComplianceManagement.getRequirements({
        framework: requirement.framework,
        exclude_id: requirement.id,
        limit: 10
      })
      setRelatedRequirements(relatedResponse.data?.data || [])
      
      sendNotification('success', 'Requirement details refreshed')
    } catch (error) {
      console.error('Failed to refresh requirement details:', error)
      sendNotification('error', 'Failed to refresh details')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadEvidence = async (evidenceId: number) => {
    try {
      await executeAction('downloadEvidence', { evidenceId })
      sendNotification('success', 'Evidence download initiated')
    } catch (error) {
      sendNotification('error', 'Failed to download evidence')
    }
  }

  const handleStartAssessment = async () => {
    try {
      await executeAction('startAssessment', { requirementId: requirement?.id })
      sendNotification('success', 'Assessment started successfully')
    } catch (error) {
      sendNotification('error', 'Failed to start assessment')
    }
  }

  if (!requirement) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Eye className="h-5 w-5" />
            </motion.div>
            {requirement.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>{requirement.framework} • {requirement.requirement_id}</span>
            {getStatusBadge(requirement.status)}
            {getRiskLevelBadge(requirement.risk_level)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleStartAssessment}>
              <Target className="h-4 w-4 mr-1" />
              Start Assessment
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Compliance: {requirement.compliance_percentage}%
            </span>
            <Progress value={requirement.compliance_percentage} className="w-24 h-2" />
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="remediation">Remediation</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Requirement Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Framework</label>
                        <p className="text-sm">{requirement.framework}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Category</label>
                        <p className="text-sm">{requirement.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-sm">{requirement.description}</p>
                      </div>
                      {requirement.impact_description && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Business Impact</label>
                          <p className="text-sm">{requirement.impact_description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Status & Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Status & Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Status</span>
                        {getStatusBadge(requirement.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Risk Level</span>
                        {getRiskLevelBadge(requirement.risk_level)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compliance Score</span>
                        <div className="flex items-center gap-2">
                          <Progress value={requirement.compliance_percentage} className="w-16 h-2" />
                          <span className="text-sm">{requirement.compliance_percentage}%</span>
                        </div>
                      </div>
                      {requirement.last_assessed && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Last Assessed</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(requirement.last_assessed).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {requirement.next_assessment && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Next Assessment</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(requirement.next_assessment).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                {requirement.tags && requirement.tags.length > 0 && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {requirement.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Assessment Information
                  </CardTitle>
                  <CardDescription>Current assessment status and details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assessor</label>
                      <p className="text-sm">{requirement.assessor || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assessment Notes</label>
                      <p className="text-sm">{requirement.assessment_notes || 'No notes available'}</p>
                    </div>
                  </div>
                  
                  {requirement.remediation_deadline && (
                    <Alert>
                      <Calendar className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Remediation Deadline:</strong> {new Date(requirement.remediation_deadline).toLocaleDateString()}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Related Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Requirements</CardTitle>
                  <CardDescription>Other requirements in the same framework or category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedRequirements.map((related) => (
                      <div key={related.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{related.title}</p>
                          <p className="text-xs text-muted-foreground">{related.requirement_id} • {related.framework}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(related.status)}
                          <span className="text-xs text-muted-foreground">{related.compliance_percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Evidence Files
                  </CardTitle>
                  <CardDescription>Supporting documentation and evidence for this requirement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evidenceFiles.map((evidence) => (
                      <div key={evidence.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{evidence.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {evidence.file_name} • {evidence.file_size} • 
                            Uploaded by {evidence.uploaded_by} on {new Date(evidence.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={evidence.status === 'verified' ? 'default' : 'secondary'}>
                            {evidence.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadEvidence(evidence.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="remediation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Remediation Plan
                  </CardTitle>
                  <CardDescription>Steps to achieve compliance with this requirement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requirement.remediation_plan ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Remediation Steps</label>
                        <p className="text-sm whitespace-pre-wrap">{requirement.remediation_plan}</p>
                      </div>
                      {requirement.remediation_owner && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Responsible Owner</label>
                          <p className="text-sm">{requirement.remediation_owner}</p>
                        </div>
                      )}
                      {requirement.remediation_deadline && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Target Completion</label>
                          <p className="text-sm">{new Date(requirement.remediation_deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No remediation plan defined yet.</p>
                      <p className="text-xs">Click "Edit" to add a remediation plan.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Assessment History
                  </CardTitle>
                  <CardDescription>Historical assessment results and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessmentHistory.map((assessment, index) => (
                      <div key={assessment.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(assessment.status)}
                              <span className="text-sm font-medium">Score: {assessment.score}%</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(assessment.assessment_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{assessment.notes}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Assessor: {assessment.assessor}</span>
                            <span>Evidence: {assessment.evidence_count} files</span>
                            <span>Remediation Items: {assessment.remediation_items}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(requirement)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(requirement)}>
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
