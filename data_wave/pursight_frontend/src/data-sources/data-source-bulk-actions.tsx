"use client"

import { useState } from "react"
import { Play, Pause, Trash2, Settings, Download, Upload, RefreshCw, CheckCircle, AlertTriangle, Info, X, Database, Edit, Copy, Tag, Shield, Monitor, Activity, Archive, Layers, ArrowDownToLine } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { DataSource } from "./types"

interface DataSourceBulkActionsProps {
  open: boolean
  onClose: () => void
  selectedItems: string[]
  dataSources?: DataSource[]
  onSuccess?: () => void
}

interface BulkOperation {
  id: string
  name: string
  description: string
  icon: any
  color: string
  requiresConfirmation: boolean
  fields?: Array<{
    name: string
    label: string
    type: "text" | "select" | "textarea" | "number"
    options?: string[]
    required?: boolean
  }>
}

const bulkOperations: BulkOperation[] = [
  {
    id: "start-monitoring",
    name: "Start Monitoring",
    description: "Enable real-time monitoring for selected data sources",
    icon: Monitor,
    color: "text-green-600",
    requiresConfirmation: false,
  },
  {
    id: "stop-monitoring",
    name: "Stop Monitoring", 
    description: "Disable monitoring for selected data sources",
    icon: Pause,
    color: "text-yellow-600",
    requiresConfirmation: true,
  },
  {
    id: "update-tags",
    name: "Update Tags",
    description: "Add or update tags for selected data sources",
    icon: Tag,
    color: "text-blue-600",
    requiresConfirmation: false,
    fields: [
      {
        name: "tags",
        label: "Tags (comma separated)",
        type: "text",
        required: true,
      },
      {
        name: "action",
        label: "Action",
        type: "select",
        options: ["add", "replace", "remove"],
        required: true,
      }
    ]
  },
  {
    id: "change-environment",
    name: "Change Environment",
    description: "Update environment classification",
    icon: Settings,
    color: "text-purple-600",
    requiresConfirmation: false,
    fields: [
      {
        name: "environment",
        label: "Environment",
        type: "select",
        options: ["development", "staging", "production"],
        required: true,
      }
    ]
  },
  {
    id: "update-criticality",
    name: "Update Criticality",
    description: "Change criticality level for selected sources",
    icon: Shield,
    color: "text-orange-600", 
    requiresConfirmation: false,
    fields: [
      {
        name: "criticality",
        label: "Criticality Level",
        type: "select",
        options: ["low", "medium", "high", "critical"],
        required: true,
      }
    ]
  },
  {
    id: "export-config",
    name: "Export Configuration",
    description: "Export configuration for selected data sources",
    icon: ArrowDownToLine,
    color: "text-indigo-600",
    requiresConfirmation: false,
    fields: [
      {
        name: "format",
        label: "Export Format",
        type: "select",
        options: ["json", "yaml", "csv"],
        required: true,
      },
      {
        name: "include_credentials",
        label: "Include Credentials",
        type: "select",
        options: ["yes", "no"],
        required: true,
      }
    ]
  },
  {
    id: "backup",
    name: "Create Backup",
    description: "Create backup for selected data sources",
    icon: Archive,
    color: "text-cyan-600",
    requiresConfirmation: false,
    fields: [
      {
        name: "backup_name",
        label: "Backup Name",
        type: "text",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
      }
    ]
  },
  {
    id: "test-connections",
    name: "Test Connections",
    description: "Test connectivity for all selected data sources",
    icon: Activity,
    color: "text-teal-600",
    requiresConfirmation: false,
  },
  {
    id: "duplicate",
    name: "Duplicate",
    description: "Create copies of selected data sources",
    icon: Copy,
    color: "text-slate-600",
    requiresConfirmation: false,
    fields: [
      {
        name: "suffix",
        label: "Name Suffix",
        type: "text",
        required: true,
      }
    ]
  },
  {
    id: "delete",
    name: "Delete",
    description: "Permanently delete selected data sources",
    icon: Trash2,
    color: "text-red-600",
    requiresConfirmation: true,
  }
]

export function DataSourceBulkActions({
  open,
  onClose,
  selectedItems,
  dataSources = [],
  onSuccess
}: DataSourceBulkActionsProps) {
  const [selectedOperation, setSelectedOperation] = useState<string>("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [executionResults, setExecutionResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const selectedDataSources = dataSources.filter(ds => 
    selectedItems.includes(ds.id.toString())
  )

  const currentOperation = bulkOperations.find(op => op.id === selectedOperation)

  const handleExecute = async () => {
    if (!currentOperation) return

    setIsExecuting(true)
    setExecutionProgress(0)
    setExecutionResults([])

    try {
      // Simulate bulk operation execution
      const results = []
      for (let i = 0; i < selectedDataSources.length; i++) {
        const dataSource = selectedDataSources[i]
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Simulate success/failure
        const success = Math.random() > 0.1 // 90% success rate
        results.push({
          dataSource,
          success,
          message: success ? "Operation completed successfully" : "Operation failed: Connection timeout"
        })
        
        setExecutionProgress(((i + 1) / selectedDataSources.length) * 100)
      }
      
      setExecutionResults(results)
      setShowResults(true)
      onSuccess?.()
    } catch (error) {
      console.error("Bulk operation failed:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setSelectedOperation("")
    setFormData({})
    setExecutionResults([])
    setShowResults(false)
    setExecutionProgress(0)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (showResults) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Operation Results</DialogTitle>
            <DialogDescription>
              Operation completed for {selectedDataSources.length} data sources
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {executionResults.filter(r => r.success).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {executionResults.filter(r => !r.success).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {executionResults.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results List */}
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {executionResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{result.dataSource.name}</p>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Run Another Operation
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform operations on {selectedItems.length} selected data sources
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-h-32 overflow-y-auto">
                {selectedDataSources.map(ds => (
                  <div key={ds.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">{ds.name}</span>
                      <Badge variant="outline">{ds.source_type}</Badge>
                    </div>
                    <Badge variant={ds.status === "active" ? "default" : "secondary"}>
                      {ds.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operation Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Operation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {bulkOperations.map(operation => {
                  const Icon = operation.icon
                  const isSelected = selectedOperation === operation.id
                  
                  return (
                    <div
                      key={operation.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedOperation(operation.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 ${operation.color}`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{operation.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {operation.description}
                          </p>
                          {operation.requiresConfirmation && (
                            <Badge variant="destructive" className="mt-2 text-xs">
                              Requires Confirmation
                            </Badge>
                          )}
                        </div>
                        <Checkbox checked={isSelected} disabled />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Operation Configuration */}
          {currentOperation?.fields && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {currentOperation.fields.map(field => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {field.type === "select" ? (
                        <Select 
                          value={formData[field.name] || ""} 
                          onValueChange={(value) => handleFormChange(field.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map(option => (
                              <SelectItem key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          id={field.name}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execution Progress */}
          {isExecuting && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Executing Operation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={executionProgress} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing data sources...</span>
                    <span>{Math.round(executionProgress)}% complete</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Warning */}
          {currentOperation?.requiresConfirmation && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This operation cannot be undone. Please confirm you want to proceed with{" "}
                <strong>{currentOperation.name.toLowerCase()}</strong> for{" "}
                {selectedItems.length} data sources.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isExecuting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExecute} 
            disabled={!selectedOperation || isExecuting}
            variant={currentOperation?.requiresConfirmation ? "destructive" : "default"}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Layers className="h-4 w-4 mr-2" />
                Execute Operation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
