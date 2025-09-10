"use client"

import { useState, useEffect } from "react"
import { Play, Pause, SkipForward, SkipBack, Settings, Save, Download, Share2, Eye, BarChart3, GitBranch, Database, Table, Layers, CheckCircle, AlertTriangle, Clock, Info, RefreshCw, X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { SchemaDiscovery } from "./schema-discovery"
import { DataLineageGraph } from "./data-lineage-graph"

interface DataDiscoveryWorkspaceProps {
  dataSource: any
  isOpen: boolean
  onClose: () => void
}

type DiscoveryStep = 'connection' | 'discovery' | 'selection' | 'workspace' | 'lineage'

interface WorkspaceData {
  name: string
  description: string
  selectedItems: any[]
  viewMode: 'tree' | 'table' | 'lineage'
  filters: any
}

export function DataDiscoveryWorkspace({ 
  dataSource, 
  isOpen, 
  onClose 
}: DataDiscoveryWorkspaceProps) {
  const [currentStep, setCurrentStep] = useState<DiscoveryStep>('connection')
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [discoveryData, setDiscoveryData] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({
    name: `${dataSource?.name || 'Data Source'} Workspace`,
    description: '',
    selectedItems: [],
    viewMode: 'tree',
    filters: {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('discovery')
  const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || "/proxy"
  const [initialSelectionManifest, setInitialSelectionManifest] = useState<any | null>(null)

  useEffect(() => {
    if (isOpen && dataSource) {
      testConnection()
      // Load any existing selection manifest for preselection
      loadSelectionManifest()
    }
  }, [isOpen, dataSource])

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setCurrentStep('connection')

    try {
      const response = await fetch(`/api/data-discovery/data-sources/${dataSource.id}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`)
      }

      const result = await response.json()
      setConnectionStatus(result.connection_test)

      if (result.connection_test.success) {
        setCurrentStep('discovery')
      } else {
        setError(result.connection_test.message)
      }

    } catch (err: any) {
      setError(err.message || "Connection test failed")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSelectionManifest = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/scan/data-sources/${dataSource.id}/selection-manifest`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` }
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json?.success && json?.data) {
        setInitialSelectionManifest(json.data)
      } else {
        setInitialSelectionManifest(null)
      }
    } catch {
      setInitialSelectionManifest(null)
    }
  }

  const handleSchemaDiscoveryComplete = (schemaData: any) => {
    setDiscoveryData(schemaData)
    setCurrentStep('selection')
  }

  const handleSelectionChange = (selection: any[]) => {
    setSelectedItems(selection)
    setWorkspaceData(prev => ({
      ...prev,
      selectedItems: selection
    }))
    
    if (selection.length > 0) {
      setCurrentStep('workspace')
      // Persist selection immediately for production integrity
      saveSelectionManifest()
    }
  }

  const buildSelectionManifest = (items: any[]) => {
    // items may include tables and columns; group into db->schemas->tables->columns
    const manifest: any = { databases: [] }
    const dbMap: Record<string, any> = {}
    for (const it of items) {
      const db = (it.database || it.db || 'default') as string
      const schema = (it.schema || 'public') as string
      const table = (it.table || it.name || '') as string
      const column = it.column
      if (!dbMap[db]) {
        dbMap[db] = { name: db, schemas: [], _sch: {} }
        manifest.databases.push(dbMap[db])
      }
      const dbNode = dbMap[db]
      if (!dbNode._sch[schema]) {
        dbNode._sch[schema] = { name: schema, tables: [], _tbl: {} }
        dbNode.schemas.push(dbNode._sch[schema])
      }
      const schNode = dbNode._sch[schema]
      if (!schNode._tbl[table]) {
        schNode._tbl[table] = { name: table, columns: [] as string[] }
        schNode.tables.push(schNode._tbl[table])
      }
      if (column) {
        if (!schNode._tbl[table].columns.includes(column)) {
          schNode._tbl[table].columns.push(column)
        }
      }
    }
    // cleanup helpers
    for (const dbNode of manifest.databases) {
      delete dbNode._sch
      for (const sch of dbNode.schemas) {
        delete sch._tbl
      }
    }
    return manifest
  }

  const saveSelectionManifest = async () => {
    try {
      const manifest = buildSelectionManifest(selectedItems)
      const res = await fetch(`${API_BASE_URL}/scan/data-sources/${dataSource.id}/selection-manifest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` },
        body: JSON.stringify(manifest)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'Failed to save selection')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to save selection')
    }
  }

  const handleSaveWorkspace = async () => {
    try {
      const response = await fetch(`/api/data-discovery/data-sources/${dataSource.id}/save-workspace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData)
      })

      if (!response.ok) {
        throw new Error('Failed to save workspace')
      }

      const result = await response.json()
      setShowSaveDialog(false)
      
      // Show success message or redirect
      console.log('Workspace saved:', result)

    } catch (err: any) {
      setError(err.message || "Failed to save workspace")
    }
  }

  const handleExportData = () => {
    // Export selected data or workspace configuration
    const exportData = {
      dataSource: {
        id: dataSource.id,
        name: dataSource.name,
        type: dataSource.source_type
      },
      workspace: workspaceData,
      selectedItems: selectedItems,
      discoveryData: discoveryData,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${dataSource.name}_workspace_export.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStepStatus = (step: DiscoveryStep) => {
    const stepOrder: DiscoveryStep[] = ['connection', 'discovery', 'selection', 'workspace', 'lineage']
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(step)

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const renderStepIndicator = () => {
    const steps: { key: DiscoveryStep; label: string; icon: any }[] = [
      { key: 'connection', label: 'Connection', icon: Database },
      { key: 'discovery', label: 'Discovery', icon: Eye },
      { key: 'selection', label: 'Selection', icon: CheckCircle },
      { key: 'workspace', label: 'Workspace', icon: Layers },
      { key: 'lineage', label: 'Lineage', icon: GitBranch }
    ]

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key)
          const Icon = step.icon

          return (
            <div key={step.key} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' : ''}
                ${status === 'active' ? 'bg-blue-100 border-blue-500 text-blue-700' : ''}
                ${status === 'pending' ? 'bg-gray-100 border-gray-300 text-gray-500' : ''}
              `}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                status === 'active' ? 'text-blue-700' : 
                status === 'completed' ? 'text-green-700' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  getStepStatus(steps[index + 1].key) !== 'pending' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderConnectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Testing Connection</h3>
        <p className="text-muted-foreground">
          Verifying connectivity to {dataSource?.name}
        </p>
      </div>

      {isLoading && (
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Connecting to data source...</p>
        </div>
      )}

      {connectionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectionStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Connection {connectionStatus.success ? 'Successful' : 'Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{connectionStatus.message}</p>
            
            {connectionStatus.details && (
              <div className="space-y-2">
                <h4 className="font-medium">Connection Details:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(connectionStatus.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="ml-2 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {connectionStatus.recommendations && connectionStatus.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {connectionStatus.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {connectionStatus.success && (
              <div className="mt-4">
                <Button onClick={() => setCurrentStep('discovery')}>
                  Continue to Discovery
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  const renderWorkspaceStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workspace Configuration</h3>
          <p className="text-muted-foreground">
            Configure your data workspace with {selectedItems.length} selected items
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('lineage')}>
            <GitBranch className="h-4 w-4 mr-2" />
            View Lineage
          </Button>
          <Button onClick={() => setShowSaveDialog(true)}>
            <Save className="h-4 w-4 mr-2" />
            Save Workspace
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Items Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Selected Data Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedItems.length === 0 ? (
                <p className="text-muted-foreground">No items selected yet</p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {item.type === 'table' && <Table className="h-4 w-4 text-green-500" />}
                        {item.type === 'database' && <Database className="h-4 w-4 text-blue-500" />}
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSelection = selectedItems.filter((_, i) => i !== index)
                          setSelectedItems(newSelection)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {selectedItems.length > 10 && (
                    <p className="text-sm text-muted-foreground">
                      ... and {selectedItems.length - 10} more items
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workspace Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentStep('selection')}
            >
              <SkipBack className="h-4 w-4 mr-2" />
              Modify Selection
            </Button>
            
            <Button variant="outline" className="w-full" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Configuration
            </Button>
            
            <Button variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Workspace
            </Button>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Statistics</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Selected Tables:</span>
                  <span>{selectedItems.filter(item => item.type === 'table').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Columns:</span>
                  <span>{selectedItems.filter(item => item.type === 'column').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span>{selectedItems.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Discovery - {dataSource?.name}
          </DialogTitle>
          <DialogDescription>
            Discover, explore, and configure your data workspace
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {renderStepIndicator()}

          <div className="h-[calc(80vh-200px)] overflow-auto">
            {currentStep === 'connection' && renderConnectionStep()}
            
            {currentStep === 'discovery' && (
              <SchemaDiscovery
                dataSourceId={dataSource?.id}
                dataSourceName={dataSource?.name}
                onSelectionChange={handleSelectionChange}
                onClose={() => setCurrentStep('connection')}
                initialSelectionManifest={initialSelectionManifest}
              />
            )}
            
            {currentStep === 'selection' && (
              <SchemaDiscovery
                dataSourceId={dataSource?.id}
                dataSourceName={dataSource?.name}
                onSelectionChange={handleSelectionChange}
                onClose={() => setCurrentStep('discovery')}
                initialSelectionManifest={initialSelectionManifest}
              />
            )}
            
            {currentStep === 'workspace' && renderWorkspaceStep()}
            
            {currentStep === 'lineage' && (
              <DataLineageGraph
                dataSourceId={dataSource?.id}
                selectedItems={selectedItems}
                onNodeSelect={(node) => console.log('Node selected:', node)}
                onEdgeSelect={(edge) => console.log('Edge selected:', edge)}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {currentStep !== 'connection' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const steps: DiscoveryStep[] = ['connection', 'discovery', 'selection', 'workspace', 'lineage']
                  const currentIndex = steps.indexOf(currentStep)
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1])
                  }
                }}
              >
                <SkipBack className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {connectionStatus?.success && currentStep !== 'lineage' && (
              <Button 
                onClick={() => {
                  const steps: DiscoveryStep[] = ['connection', 'discovery', 'selection', 'workspace', 'lineage']
                  const currentIndex = steps.indexOf(currentStep)
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1])
                  }
                }}
                disabled={currentStep === 'selection' && selectedItems.length === 0}
              >
                Continue
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Save Workspace Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Workspace</DialogTitle>
              <DialogDescription>
                Save your current workspace configuration for future use
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceData.name}
                  onChange={(e) => setWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workspace name"
                />
              </div>
              
              <div>
                <Label htmlFor="workspace-description">Description (Optional)</Label>
                <Textarea
                  id="workspace-description"
                  value={workspaceData.description}
                  onChange={(e) => setWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this workspace"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveWorkspace}>
                Save Workspace
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
