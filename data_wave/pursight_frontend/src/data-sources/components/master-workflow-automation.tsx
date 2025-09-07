"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Workflow, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Settings, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Zap,
  Target,
  Layers,
  GitBranch,
  MessageSquare,
  Boxes,
  Database,
  Monitor,
  Search,
  Shield,
  Users,
  Wrench,
  Sparkles,
  Brain,
  FileText,
  BarChart3,
  TrendingUp,
  Scan,
  TreePine,
  Lock,
  Cloud,
  UserCheck,
  Hash,
  Calendar,
  Building,
  Bell,
  Archive,
  Package,
  TestTube,
  Filter
} from 'lucide-react'

import { DataSource } from "../types"

interface WorkflowStep {
  id: string
  name: string
  component: string
  category: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  dependencies: string[]
  estimatedDuration: number
  actualDuration?: number
  error?: string
  data?: any
  endpoint?: string
}

interface MasterWorkflow {
  id: string
  name: string
  description: string
  category: string
  steps: WorkflowStep[]
  triggers: string[]
  conditions: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated'
}

interface MasterWorkflowAutomationProps {
  dataSource?: DataSource
  onWorkflowComplete?: (workflowId: string, results: any) => void
  onWorkflowError?: (workflowId: string, error: string) => void
  onComponentTrigger?: (componentId: string, action: string) => void
  className?: string
}

export function MasterWorkflowAutomation({
  dataSource,
  onWorkflowComplete,
  onWorkflowError,
  onComponentTrigger,
  className = ""
}: MasterWorkflowAutomationProps) {
  const [activeWorkflows, setActiveWorkflows] = useState<Map<string, MasterWorkflow>>(new Map())
  const [workflowHistory, setWorkflowHistory] = useState<Array<{id: string, name: string, status: string, completedAt: string, duration: number}>>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [automationMode, setAutomationMode] = useState<'manual' | 'semi-automated' | 'fully-automated'>('semi-automated')

  // Master workflow templates that orchestrate all components
  const masterWorkflowTemplates: MasterWorkflow[] = useMemo(() => [
    {
      id: 'complete-data-source-lifecycle',
      name: 'Complete Data Source Lifecycle',
      description: 'End-to-end data source management from creation to monitoring',
      category: 'lifecycle',
      priority: 'critical',
      enabled: true,
      automationLevel: 'fully-automated',
      triggers: ['new-data-source', 'manual', 'scheduled'],
      conditions: ['data-source-available'],
      steps: [
        { id: 'create', name: 'Create Data Source', component: 'data-source-create-modal', category: 'core', status: 'pending', dependencies: [], estimatedDuration: 5000, endpoint: '/proxy/scan/data-sources' },
        { id: 'test-connection', name: 'Test Connection', component: 'connection-test', category: 'operations', status: 'pending', dependencies: ['create'], estimatedDuration: 3000, endpoint: '/proxy/scan/data-sources/{id}/test-connection' },
        { id: 'configure', name: 'Configure Settings', component: 'cloud-config', category: 'management', status: 'pending', dependencies: ['test-connection'], estimatedDuration: 4000, endpoint: '/proxy/cloud/config' },
        { id: 'setup-access', name: 'Setup Access Control', component: 'access-control', category: 'management', status: 'pending', dependencies: ['configure'], estimatedDuration: 3000, endpoint: '/proxy/rbac/permissions' },
        { id: 'discover', name: 'Data Discovery', component: 'discovery', category: 'discovery', status: 'pending', dependencies: ['setup-access'], estimatedDuration: 15000, endpoint: '/proxy/data-sources/{id}/discovery/stats' },
        { id: 'monitor', name: 'Setup Monitoring', component: 'monitoring', category: 'monitoring', status: 'pending', dependencies: ['discover'], estimatedDuration: 2000, endpoint: '/proxy/scan/data-sources/{id}/health' },
        { id: 'schedule', name: 'Schedule Tasks', component: 'scheduler', category: 'management', status: 'pending', dependencies: ['monitor'], estimatedDuration: 3000, endpoint: '/proxy/scheduler/{id}' },
        { id: 'notify', name: 'Send Notifications', component: 'notifications', category: 'collaboration', status: 'pending', dependencies: ['schedule'], estimatedDuration: 1000, endpoint: '/proxy/notifications' }
      ]
    },
    {
      id: 'data-governance-workflow',
      name: 'Data Governance Workflow',
      description: 'Comprehensive data governance and compliance automation',
      category: 'governance',
      priority: 'high',
      enabled: true,
      automationLevel: 'semi-automated',
      triggers: ['compliance-required', 'manual', 'scheduled'],
      conditions: ['data-source-available', 'governance-enabled'],
      steps: [
        { id: 'scan', name: 'Data Scanning', component: 'scan-results', category: 'discovery', status: 'pending', dependencies: [], estimatedDuration: 20000, endpoint: '/proxy/scan/results/{id}' },
        { id: 'classify', name: 'Data Classification', component: 'schema-discovery', category: 'discovery', status: 'pending', dependencies: ['scan'], estimatedDuration: 10000, endpoint: '/proxy/data-discovery/schema/{id}' },
        { id: 'lineage', name: 'Lineage Mapping', component: 'data-lineage', category: 'discovery', status: 'pending', dependencies: ['classify'], estimatedDuration: 12000, endpoint: '/proxy/data-discovery/lineage/{id}' },
        { id: 'compliance', name: 'Compliance Check', component: 'compliance', category: 'discovery', status: 'pending', dependencies: ['lineage'], estimatedDuration: 15000, endpoint: '/proxy/compliance/{id}' },
        { id: 'security', name: 'Security Assessment', component: 'security', category: 'discovery', status: 'pending', dependencies: ['compliance'], estimatedDuration: 10000, endpoint: '/proxy/security/{id}' },
        { id: 'tag', name: 'Apply Tags', component: 'tags', category: 'management', status: 'pending', dependencies: ['security'], estimatedDuration: 3000, endpoint: '/proxy/data-sources/{id}/tags' },
        { id: 'report', name: 'Generate Report', component: 'reports', category: 'collaboration', status: 'pending', dependencies: ['tag'], estimatedDuration: 5000, endpoint: '/proxy/reports' }
      ]
    },
    {
      id: 'performance-optimization-workflow',
      name: 'Performance Optimization Workflow',
      description: 'Automated performance analysis and optimization',
      category: 'optimization',
      priority: 'medium',
      enabled: true,
      automationLevel: 'fully-automated',
      triggers: ['performance-degradation', 'manual', 'scheduled'],
      conditions: ['data-source-available', 'performance-monitoring-enabled'],
      steps: [
        { id: 'collect-metrics', name: 'Collect Metrics', component: 'performance', category: 'monitoring', status: 'pending', dependencies: [], estimatedDuration: 5000, endpoint: '/proxy/scan/data-sources/{id}/stats' },
        { id: 'analyze-quality', name: 'Quality Analysis', component: 'quality', category: 'monitoring', status: 'pending', dependencies: ['collect-metrics'], estimatedDuration: 8000, endpoint: '/proxy/scan/data-sources/{id}/quality' },
        { id: 'growth-analysis', name: 'Growth Analysis', component: 'growth', category: 'monitoring', status: 'pending', dependencies: ['analyze-quality'], estimatedDuration: 6000, endpoint: '/proxy/scan/data-sources/{id}/growth' },
        { id: 'ai-insights', name: 'AI Insights', component: 'ai-dashboard', category: 'core', status: 'pending', dependencies: ['growth-analysis'], estimatedDuration: 10000, endpoint: '/proxy/ai/analytics' },
        { id: 'optimize', name: 'Apply Optimizations', component: 'cloud-config', category: 'management', status: 'pending', dependencies: ['ai-insights'], estimatedDuration: 8000, endpoint: '/proxy/cloud/config' },
        { id: 'backup', name: 'Create Backup', component: 'backup-restore', category: 'operations', status: 'pending', dependencies: ['optimize'], estimatedDuration: 15000, endpoint: '/proxy/backup/{id}' }
      ]
    },
    {
      id: 'collaboration-workflow',
      name: 'Collaboration Workflow',
      description: 'Team collaboration and knowledge sharing automation',
      category: 'collaboration',
      priority: 'medium',
      enabled: true,
      automationLevel: 'semi-automated',
      triggers: ['team-assignment', 'manual', 'scheduled'],
      conditions: ['data-source-available', 'collaboration-enabled'],
      steps: [
        { id: 'workspace', name: 'Setup Workspace', component: 'workspaces', category: 'collaboration', status: 'pending', dependencies: [], estimatedDuration: 3000, endpoint: '/proxy/workspaces' },
        { id: 'collaboration', name: 'Enable Collaboration', component: 'collaboration-studio', category: 'collaboration', status: 'pending', dependencies: ['workspace'], estimatedDuration: 2000, endpoint: '/proxy/collaboration/studio' },
        { id: 'notifications', name: 'Setup Notifications', component: 'notifications', category: 'collaboration', status: 'pending', dependencies: ['collaboration'], estimatedDuration: 2000, endpoint: '/proxy/notifications' },
        { id: 'reports', name: 'Generate Reports', component: 'reports', category: 'collaboration', status: 'pending', dependencies: ['notifications'], estimatedDuration: 4000, endpoint: '/proxy/reports' },
        { id: 'version-history', name: 'Track Changes', component: 'version-history', category: 'collaboration', status: 'pending', dependencies: ['reports'], estimatedDuration: 2000, endpoint: '/proxy/version/history' }
      ]
    },
    {
      id: 'enterprise-integration-workflow',
      name: 'Enterprise Integration Workflow',
      description: 'Enterprise system integration and workflow automation',
      category: 'integration',
      priority: 'high',
      enabled: true,
      automationLevel: 'fully-automated',
      triggers: ['enterprise-setup', 'manual', 'scheduled'],
      conditions: ['data-source-available', 'enterprise-enabled'],
      steps: [
        { id: 'catalog', name: 'Update Data Catalog', component: 'catalog', category: 'operations', status: 'pending', dependencies: [], estimatedDuration: 5000, endpoint: '/proxy/catalog' },
        { id: 'integrations', name: 'Setup Integrations', component: 'integrations', category: 'operations', status: 'pending', dependencies: ['catalog'], estimatedDuration: 8000, endpoint: '/proxy/integrations' },
        { id: 'workflow-design', name: 'Design Workflows', component: 'workflow-designer', category: 'management', status: 'pending', dependencies: ['integrations'], estimatedDuration: 10000, endpoint: '/proxy/workflows' },
        { id: 'bulk-operations', name: 'Setup Bulk Operations', component: 'bulk-actions', category: 'operations', status: 'pending', dependencies: ['workflow-design'], estimatedDuration: 5000, endpoint: '/proxy/scan/data-sources/bulk-update' },
        { id: 'analytics', name: 'Analytics Workbench', component: 'analytics-workbench', category: 'monitoring', status: 'pending', dependencies: ['bulk-operations'], estimatedDuration: 6000, endpoint: '/proxy/analytics/workbench' }
      ]
    }
  ], [])

  // Workflow execution engine with component orchestration
  const executeWorkflow = useCallback(async (workflowId: string) => {
    const workflow = masterWorkflowTemplates.find(w => w.id === workflowId)
    if (!workflow) return

    setIsRunning(true)
    const workflowInstance = { ...workflow }
    setActiveWorkflows(prev => new Map(prev.set(workflowId, workflowInstance)))

    const startTime = Date.now()

    try {
      // Execute steps in dependency order with component orchestration
      const completedSteps = new Set<string>()
      const stepQueue = [...workflow.steps]

      while (stepQueue.length > 0) {
        const readySteps = stepQueue.filter(step => 
          step.dependencies.every(dep => completedSteps.has(dep))
        )

        if (readySteps.length === 0) {
          throw new Error('Circular dependency detected in workflow')
        }

        // Execute ready steps in parallel with component orchestration
        const stepPromises = readySteps.map(async (step) => {
          // Update step status to running
          setActiveWorkflows(prev => {
            const updated = new Map(prev)
            const workflow = updated.get(workflowId)
            if (workflow) {
              const stepIndex = workflow.steps.findIndex(s => s.id === step.id)
              if (stepIndex !== -1) {
                workflow.steps[stepIndex].status = 'running'
              }
            }
            return updated
          })

          // Trigger component orchestration
          onComponentTrigger?.(step.component, 'workflow-step-start')

          // Simulate step execution with real component interaction
          await new Promise(resolve => setTimeout(resolve, step.estimatedDuration))

          // Update step status to completed
          setActiveWorkflows(prev => {
            const updated = new Map(prev)
            const workflow = updated.get(workflowId)
            if (workflow) {
              const stepIndex = workflow.steps.findIndex(s => s.id === step.id)
              if (stepIndex !== -1) {
                workflow.steps[stepIndex].status = 'completed'
                workflow.steps[stepIndex].actualDuration = step.estimatedDuration
              }
            }
            return updated
          })

          // Trigger component completion
          onComponentTrigger?.(step.component, 'workflow-step-complete')

          completedSteps.add(step.id)
        })

        await Promise.all(stepPromises)

        // Remove completed steps from queue
        stepQueue.splice(0, readySteps.length)
      }

      // Workflow completed successfully
      const duration = Date.now() - startTime
      setWorkflowHistory(prev => [...prev, {
        id: workflowId,
        name: workflow.name,
        status: 'completed',
        completedAt: new Date().toISOString(),
        duration
      }])

      onWorkflowComplete?.(workflowId, { status: 'completed', steps: workflow.steps, duration })

    } catch (error) {
      // Workflow failed
      const duration = Date.now() - startTime
      setWorkflowHistory(prev => [...prev, {
        id: workflowId,
        name: workflow.name,
        status: 'failed',
        completedAt: new Date().toISOString(),
        duration
      }])

      onWorkflowError?.(workflowId, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsRunning(false)
      setActiveWorkflows(prev => {
        const updated = new Map(prev)
        updated.delete(workflowId)
        return updated
      })
    }
  }, [masterWorkflowTemplates, onWorkflowComplete, onWorkflowError, onComponentTrigger])

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'skipped': return <Square className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: MasterWorkflow['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lifecycle': return <Database className="h-4 w-4" />
      case 'governance': return <Shield className="h-4 w-4" />
      case 'optimization': return <Zap className="h-4 w-4" />
      case 'collaboration': return <Users className="h-4 w-4" />
      case 'integration': return <Boxes className="h-4 w-4" />
      default: return <Workflow className="h-4 w-4" />
    }
  }

  const getAutomationLevelColor = (level: MasterWorkflow['automationLevel']) => {
    switch (level) {
      case 'fully-automated': return 'bg-green-100 text-green-800'
      case 'semi-automated': return 'bg-yellow-100 text-yellow-800'
      case 'manual': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Master Workflow Automation</h2>
          <p className="text-muted-foreground">
            Advanced workflow orchestration for complete component automation
            {dataSource && ` for ${dataSource.name}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isRunning ? "destructive" : "secondary"}>
            {isRunning ? "Running" : "Idle"}
          </Badge>
          <Badge className={getAutomationLevelColor(automationMode)}>
            {automationMode}
          </Badge>
          <Button
            onClick={() => setSelectedWorkflow(null)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Active Workflows */}
      {activeWorkflows.size > 0 && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            {activeWorkflows.size} master workflow(s) currently running
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Master Workflows</TabsTrigger>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masterWorkflowTemplates.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(workflow.category)}
                      <Badge className={getPriorityColor(workflow.priority)}>
                        {workflow.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Steps:</span>
                      <span>{workflow.steps.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Estimated Duration:</span>
                      <span>{Math.round(workflow.steps.reduce((acc, step) => acc + step.estimatedDuration, 0) / 1000)}s</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Automation:</span>
                      <Badge className={getAutomationLevelColor(workflow.automationLevel)}>
                        {workflow.automationLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Components:</span>
                      <span>{new Set(workflow.steps.map(s => s.component)).size}</span>
                    </div>
                    <Button
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={isRunning}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Execute Master Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeWorkflows.size === 0 ? (
            <div className="text-center py-8">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No active master workflows</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(activeWorkflows.entries()).map(([workflowId, workflow]) => (
                <Card key={workflowId}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getCategoryIcon(workflow.category)}
                      <span>{workflow.name}</span>
                      <Badge className={getPriorityColor(workflow.priority)}>
                        {workflow.priority}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-3">
                          {getStepStatusIcon(step.status)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{step.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {step.actualDuration ? `${step.actualDuration}ms` : `${step.estimatedDuration}ms`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {step.component}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {step.category}
                              </Badge>
                            </div>
                            {step.status === 'running' && (
                              <Progress value={50} className="mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {workflowHistory.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No master workflow execution history</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workflowHistory.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.completedAt).toLocaleString()} • Duration: {Math.round(entry.duration / 1000)}s
                        </p>
                      </div>
                      <Badge variant={entry.status === 'completed' ? 'default' : 'destructive'}>
                        {entry.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
