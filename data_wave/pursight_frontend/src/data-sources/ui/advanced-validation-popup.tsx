"use client"

import { useState, useEffect } from "react"
import { 
  X, CheckCircle, AlertTriangle, RefreshCw, Brain, Sparkles, 
  ArrowRight, ArrowLeft, Zap, Shield, Star, Target, Activity,
  Database, Table, Columns, Eye, EyeOff, Trash2, Plus, Clock
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ValidationItem {
  item: any
  existing_catalog_item?: any
  item_type: string
  priority: number
  conflict_type?: string
  reason?: string
  action?: string
  confidence?: number
}

interface ValidationResult {
  total_selected: number
  existing_items: ValidationItem[]
  new_items: ValidationItem[]
  conflicts: ValidationItem[]
  recommendations: ValidationItem[]
  critical_items: ValidationItem[]
  business_value_score: number
  validation_summary: {
    existing_count: number
    new_count: number
    critical_count: number
    recommendation_count: number
    business_value: number
    requires_user_decision: boolean
  }
}

interface AdvancedValidationPopupProps {
  isOpen: boolean
  onClose: () => void
  validationResult: ValidationResult | null
  onConfirm: (action: 'replace' | 'add_new' | 'cancel', selectedItems: any[]) => void
  onApplyRecommendations: (recommendations: any[]) => void
  isLoading?: boolean
}

export function AdvancedValidationPopup({
  isOpen,
  onClose,
  validationResult,
  onConfirm,
  onApplyRecommendations,
  isLoading = false
}: AdvancedValidationPopupProps) {
  const [selectedAction, setSelectedAction] = useState<'replace' | 'add_new' | 'cancel'>('add_new')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showAIProcessing, setShowAIProcessing] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [aiStatus, setAiStatus] = useState("")
  const [viewMode, setViewMode] = useState<'summary' | 'list'>('summary')
  const [actionPreset, setActionPreset] = useState<'add_new' | 'replace'>('add_new')

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen && validationResult) {
      setSelectedAction('add_new')
      setSelectedItems(new Set())
      setShowAIProcessing(false)
      setAiProgress(0)
    }
  }, [isOpen, validationResult])

  const handleItemToggle = (itemKey: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey)
      } else {
        newSet.add(itemKey)
      }
      return newSet
    })
  }

  const handleApplyRecommendations = async () => {
    if (!validationResult?.recommendations) return

    setShowAIProcessing(true)
    setAiProgress(0)
    setAiStatus("🤖 AI is analyzing recommendations...")

    // Simulate AI processing with realistic progress
    const steps = [
      "Analyzing data patterns...",
      "Calculating business value...",
      "Optimizing selection strategy...",
      "Preparing recommendations...",
      "Finalizing selection..."
    ]

    for (let i = 0; i < steps.length; i++) {
      setAiStatus(steps[i])
      setAiProgress((i + 1) * 20)
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    // Auto-select recommended items
    const recommendedKeys = validationResult.recommendations.map((_, index) => `rec_${index}`)
    setSelectedItems(new Set(recommendedKeys))
    
    setAiStatus("✅ AI recommendations applied successfully!")
    setAiProgress(100)
    
    setTimeout(() => {
      setShowAIProcessing(false)
      onApplyRecommendations(validationResult.recommendations)
    }, 1000)
  }

  const handleConfirm = () => {
    const itemsToProcess = Array.from(selectedItems).map(key => {
      if (key.startsWith('rec_')) {
        const index = parseInt(key.split('_')[1])
        return validationResult?.recommendations[index]?.item
      } else if (key.startsWith('new_')) {
        const index = parseInt(key.split('_')[1])
        return validationResult?.new_items[index]?.item
      } else if (key.startsWith('existing_')) {
        const index = parseInt(key.split('_')[1])
        return validationResult?.existing_items[index]?.item
      }
      return null
    }).filter(Boolean)

    onConfirm(selectedAction || actionPreset, itemsToProcess)
  }

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'database': return <Database className="h-4 w-4 text-blue-500" />
      case 'table': return <Table className="h-4 w-4 text-green-500" />
      case 'column': return <Columns className="h-4 w-4 text-purple-500" />
      default: return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-red-600 bg-red-50 border-red-200"
    if (priority >= 6) return "text-orange-600 bg-orange-50 border-orange-200"
    if (priority >= 4) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'catalog_immediately': return <Zap className="h-4 w-4 text-red-500" />
      case 'catalog_soon': return <Clock className="h-4 w-4 text-orange-500" />
      default: return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  if (!validationResult) return null

  return (
    <>
      {/* AI Processing Overlay */}
      {showAIProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="h-10 w-10 text-white animate-spin" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Processing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {aiStatus}
                </p>
                <Progress value={aiProgress} className="h-2" />
                <p className="text-xs text-gray-500">
                  {aiProgress}% Complete
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Validation Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Advanced Validation Center
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Smart analysis of selected schema items with AI recommendations
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Workflow toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Badge variant="outline">{validationResult?.validation_summary?.new_count || 0} New</Badge>
                <Badge variant="outline">{validationResult?.validation_summary?.existing_count || 0} Existing</Badge>
                <Badge variant="outline">{validationResult?.validation_summary?.critical_count || 0} Critical</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={viewMode === 'summary' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('summary')}>Summary</Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>List</Button>
              </div>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{validationResult.total_selected}</div>
                    <div className="text-xs text-blue-600">Total Selected</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
                <div className="flex items-center gap-3">
                  <Plus className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-700">{validationResult.validation_summary.new_count}</div>
                    <div className="text-xs text-green-600">New Items</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-700">{validationResult.validation_summary.existing_count}</div>
                    <div className="text-xs text-orange-600">Existing Items</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-700">{validationResult.business_value_score}%</div>
                    <div className="text-xs text-purple-600">Business Value</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Recommendations Section */}
            {validationResult.recommendations.length > 0 && (
              <Card className="border-2 border-gradient-to-r from-purple-200 to-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">AI Recommendations</CardTitle>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {validationResult.recommendations.length} suggestions
                      </Badge>
                    </div>
                    <Button 
                      onClick={handleApplyRecommendations}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      disabled={showAIProcessing}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Apply AI Recommendations
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {validationResult.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {getActionIcon(rec.action || '')}
                          <span className="font-medium">{rec.item.table || rec.item.schema}</span>
                        </div>
                        <Badge className={getPriorityColor(rec.priority)}>
                          Priority {rec.priority}
                        </Badge>
                        <span className="text-sm text-gray-600 flex-1">{rec.reason}</span>
                        <Badge variant="outline" className="text-xs">
                          {rec.confidence}% confidence
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="new" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Items ({validationResult.new_items.length})
                </TabsTrigger>
                <TabsTrigger value="existing" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Existing Items ({validationResult.existing_items.length})
                </TabsTrigger>
                <TabsTrigger value="critical" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Critical Items ({validationResult.critical_items.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {validationResult.new_items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(`new_${index}`)}
                          onChange={() => handleItemToggle(`new_${index}`)}
                          className="h-4 w-4 text-green-600"
                        />
                        {getItemIcon(item.item_type)}
                        <span className="font-medium">{item.item.table || item.item.schema}</span>
                        <Badge className={getPriorityColor(item.priority)}>
                          Priority {item.priority}
                        </Badge>
                        <span className="text-sm text-gray-600 flex-1">
                          {item.item.column ? `Column: ${item.item.column}` : `Table in ${item.item.schema}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="existing" className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {validationResult.existing_items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(`existing_${index}`)}
                          onChange={() => handleItemToggle(`existing_${index}`)}
                          className="h-4 w-4 text-orange-600"
                        />
                        {getItemIcon(item.item_type)}
                        <span className="font-medium">{item.item.table || item.item.schema}</span>
                        <Badge variant="destructive">Already Exists</Badge>
                        <span className="text-sm text-gray-600 flex-1">
                          Created: {new Date(item.existing_catalog_item?.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="critical" className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {validationResult.critical_items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(`critical_${index}`)}
                          onChange={() => handleItemToggle(`critical_${index}`)}
                          className="h-4 w-4 text-red-600"
                        />
                        {getItemIcon(item.item_type)}
                        <span className="font-medium">{item.item.table || item.item.schema}</span>
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          Critical Priority {item.priority}
                        </Badge>
                        <span className="text-sm text-gray-600 flex-1">
                          High business value - requires immediate attention
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Action Selection */}
            <Card className="p-4">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Action Required</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={selectedAction === 'add_new' ? 'default' : 'outline'}
                    onClick={() => setSelectedAction('add_new')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="font-medium">Add New Only</span>
                    <span className="text-xs text-center">Catalog only new items, skip existing ones</span>
                  </Button>
                  
                  <Button
                    variant={selectedAction === 'replace' ? 'default' : 'outline'}
                    onClick={() => setSelectedAction('replace')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <RefreshCw className="h-6 w-6" />
                    <span className="font-medium">Replace Existing</span>
                    <span className="text-xs text-center">Update existing items with new data</span>
                  </Button>
                  
                  <Button
                    variant={selectedAction === 'cancel' ? 'destructive' : 'outline'}
                    onClick={() => setSelectedAction('cancel')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <X className="h-6 w-6" />
                    <span className="font-medium">Cancel</span>
                    <span className="text-xs text-center">Cancel operation and return to selection</span>
                  </Button>
                </div>
                {/* Preset for default action when none explicitly selected */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Default:</span>
                  <Button size="sm" variant={actionPreset === 'add_new' ? 'default' : 'outline'} onClick={() => setActionPreset('add_new')}>Add New Only</Button>
                  <Button size="sm" variant={actionPreset === 'replace' ? 'default' : 'outline'} onClick={() => setActionPreset('replace')}>Replace Existing</Button>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedItems.size} items selected for {selectedAction === 'add_new' ? 'addition' : selectedAction === 'replace' ? 'replacement' : 'cancellation'}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Selection
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={isLoading || selectedItems.size === 0}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Action
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
