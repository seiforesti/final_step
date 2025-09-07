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
  Boxes
} from 'lucide-react'

import { DataSource } from "../types"

interface WorkflowStep {
  id: string
  name: string
  component: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  dependencies: string[]
  estimatedDuration: number
  actualDuration?: number
  error?: string
  data?: any
}

interface WorkflowDefinition {
  id: string
  name: string
  description: string
  category: string
  steps: WorkflowStep[]
  triggers: string[]
  conditions: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
}

interface AdvancedWorkflowOrchestratorProps {
  dataSource?: DataSource
  onWorkflowComplete?: (workflowId: string, results: any) => void
  onWorkflowError?: (workflowId: string, error: string) => void
  className?: string
}

export function AdvancedWorkflowOrchestrator({
  dataSource,
  onWorkflowComplete,
  onWorkflowError,
  className = ""
}: AdvancedWorkflowOrchestratorProps) {
  const [activeWorkflows, setActiveWorkflows] = useState<Map<string, WorkflowDefinition>>(new Map())
  const [workflowHistory, setWorkflowHistory] = useState<Array<{id: string, name: string, status: string, completedAt: string}>>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Predefined workflow templates
  const workflowTemplates: WorkflowDefinition[] = useMemo(() => [
    {
      id: 'data-source-health-check',
      name: 'Data Source Health Check',
      description: 'Comprehensive health monitoring and diagnostics',
      category: 'monitoring',
      priority: 'high',
      enabled: true,
      triggers: ['manual', 'scheduled', 'data-source-selected'],
      conditions: ['data-source-available'],
      steps: [
        { id: 'connect', name: 'Test Connection', component: 'connection-test', status: 'pending', dependencies: [], estimatedDuration: 5000 },
        { id: 'health', name: 'Health Metrics', component: 'health-check', status: 'pending', dependencies: ['connect'], estimatedDuration: 3000 },
        { id: 'performance', name: 'Performance Analysis', component: 'performance-analysis', status: 'pending', dependencies: ['health'], estimatedDuration: 8000 },
        { id: 'report', name: 'Generate Report', component: 'report-generator', status: 'pending', dependencies: ['performance'], estimatedDuration: 2000 }
      ]
    },
    {
      id: 'data-discovery-workflow',
      name: 'Data Discovery Workflow',
      description: 'Automated data asset discovery and cataloging',
      category: 'discovery',
      priority: 'medium',
      enabled: true,
      triggers: ['manual', 'scheduled', 'new-data-source'],
      conditions: ['data-source-available', 'discovery-enabled'],
      steps: [
        { id: 'scan', name: 'Schema Scan', component: 'schema-discovery', status: 'pending', dependencies: [], estimatedDuration: 15000 },
        { id: 'classify', name: 'Data Classification', component: 'data-classification', status: 'pending', dependencies: ['scan'], estimatedDuration: 10000 },
        { id: 'lineage', name: 'Lineage Mapping', component: 'lineage-mapping', status: 'pending', dependencies: ['classify'], estimatedDuration: 12000 },
        { id: 'catalog', name: 'Update Catalog', component: 'catalog-update', status: 'pending', dependencies: ['lineage'], estimatedDuration: 5000 }
      ]
    },
    {
      id: 'compliance-audit-workflow',
      name: 'Compliance Audit Workflow',
      description: 'Automated compliance checking and reporting',
      category: 'compliance',
      priority: 'high',
      enabled: true,
      triggers: ['manual', 'scheduled', 'compliance-required'],
      conditions: ['data-source-available', 'compliance-enabled'],
      steps: [
        { id: 'security-scan', name: 'Security Scan', component: 'security-scan', status: 'pending', dependencies: [], estimatedDuration: 20000 },
        { id: 'compliance-check', name: 'Compliance Check', component: 'compliance-check', status: 'pending', dependencies: ['security-scan'], estimatedDuration: 15000 },
        { id: 'risk-assessment', name: 'Risk Assessment', component: 'risk-assessment', status: 'pending', dependencies: ['compliance-check'], estimatedDuration: 10000 },
        { id: 'audit-report', name: 'Audit Report', component: 'audit-report', status: 'pending', dependencies: ['risk-assessment'], estimatedDuration: 8000 }
      ]
    },
    {
      id: 'performance-optimization-workflow',
      name: 'Performance Optimization Workflow',
      description: 'Automated performance analysis and optimization',
      category: 'optimization',
      priority: 'medium',
      enabled: true,
      triggers: ['manual', 'performance-degradation', 'scheduled'],
      conditions: ['data-source-available', 'performance-monitoring-enabled'],
      steps: [
        { id: 'metrics-collection', name: 'Collect Metrics', component: 'metrics-collection', status: 'pending', dependencies: [], estimatedDuration: 5000 },
        { id: 'analysis', name: 'Performance Analysis', component: 'performance-analysis', status: 'pending', dependencies: ['metrics-collection'], estimatedDuration: 12000 },
        { id: 'recommendations', name: 'Generate Recommendations', component: 'optimization-recommendations', status: 'pending', dependencies: ['analysis'], estimatedDuration: 8000 },
        { id: 'apply-optimizations', name: 'Apply Optimizations', component: 'apply-optimizations', status: 'pending', dependencies: ['recommendations'], estimatedDuration: 15000 }
      ]
    },
    {
      id: 'backup-and-recovery-workflow',
      name: 'Backup and Recovery Workflow',
      description: 'Automated backup creation and recovery testing',
      category: 'operations',
      priority: 'high',
      enabled: true,
      triggers: ['manual', 'scheduled', 'before-maintenance'],
      conditions: ['data-source-available', 'backup-enabled'],
      steps: [
        { id: 'pre-backup-check', name: 'Pre-backup Check', component: 'pre-backup-check', status: 'pending', dependencies: [], estimatedDuration: 3000 },
        { id: 'create-backup', name: 'Create Backup', component: 'backup-creation', status: 'pending', dependencies: ['pre-backup-check'], estimatedDuration: 30000 },
        { id: 'verify-backup', name: 'Verify Backup', component: 'backup-verification', status: 'pending', dependencies: ['create-backup'], estimatedDuration: 10000 },
        { id: 'test-recovery', name: 'Test Recovery', component: 'recovery-test', status: 'pending', dependencies: ['verify-backup'], estimatedDuration: 20000 }
      ]
    }
  ], [])

  // Workflow execution engine
  const executeWorkflow = useCallback(async (workflowId: string) => {
    const workflow = workflowTemplates.find(w => w.id === workflowId)
    if (!workflow) return

    setIsRunning(true)
    const workflowInstance = { ...workflow }
    setActiveWorkflows(prev => new Map(prev.set(workflowId, workflowInstance)))

    try {
      // Execute steps in dependency order
      const completedSteps = new Set<string>()
      const stepQueue = [...workflow.steps]

      while (stepQueue.length > 0) {
        const readySteps = stepQueue.filter(step => 
          step.dependencies.every(dep => completedSteps.has(dep))
        )

        if (readySteps.length === 0) {
          throw new Error('Circular dependency detected in workflow')
        }

        // Execute ready steps in parallel
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

          // Simulate step execution
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

          completedSteps.add(step.id)
        })

        await Promise.all(stepPromises)

        // Remove completed steps from queue
        stepQueue.splice(0, readySteps.length)
      }

      // Workflow completed successfully
      setWorkflowHistory(prev => [...prev, {
        id: workflowId,
        name: workflow.name,
        status: 'completed',
        completedAt: new Date().toISOString()
      }])

      onWorkflowComplete?.(workflowId, { status: 'completed', steps: workflow.steps })

    } catch (error) {
      // Workflow failed
      setWorkflowHistory(prev => [...prev, {
        id: workflowId,
        name: workflow.name,
        status: 'failed',
        completedAt: new Date().toISOString()
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
  }, [workflowTemplates, onWorkflowComplete, onWorkflowError])

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'skipped': return <Square className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: WorkflowDefinition['priority']) => {
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
      case 'monitoring': return <Activity className="h-4 w-4" />
      case 'discovery': return <Target className="h-4 w-4" />
      case 'compliance': return <Zap className="h-4 w-4" />
      case 'optimization': return <Layers className="h-4 w-4" />
      case 'operations': return <Boxes className="h-4 w-4" />
      default: return <Workflow className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Workflow Orchestrator</h2>
          <p className="text-muted-foreground">
            Automated workflow execution and component orchestration
            {dataSource && ` for ${dataSource.name}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isRunning ? "destructive" : "secondary"}>
            {isRunning ? "Running" : "Idle"}
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
            {activeWorkflows.size} workflow(s) currently running
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.map((workflow) => (
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
                    <Button
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={isRunning}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Execute Workflow
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
              <p className="text-muted-foreground">No active workflows</p>
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
              <p className="text-muted-foreground">No workflow execution history</p>
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
                          {new Date(entry.completedAt).toLocaleString()}
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
