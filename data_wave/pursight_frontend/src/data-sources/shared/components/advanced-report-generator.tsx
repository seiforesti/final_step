"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  FileText, 
  Download, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Target,
  Database,
  BarChart3,
  Network,
  Calendar,
  Settings,
  Eye,
  Image,
  FileImage,
  Zap,
  Brain,
  Activity,
  TrendingUp,
  Shield,
  Star
} from 'lucide-react'
import type { SchemaPattern, SchemaAnalysis, LineChartData, GraphNode } from '../utils/schema-analysis-utils'

interface AdvancedReportGeneratorProps {
  isOpen: boolean
  onClose: () => void
  patterns: SchemaPattern[]
  analysis: SchemaAnalysis[]
  lineChartData: LineChartData[]
  nodes: GraphNode[]
  selectedPattern: string | null
  onGenerateReport: (reportConfig: ReportConfig) => void
  className?: string
}

interface ReportConfig {
  reportType: 'pattern-analysis' | 'full-analysis' | 'custom'
  selectedPatterns: string[]
  includeGraphScreenshot: boolean
  includeChartScreenshot: boolean
  includeNodeDetails: boolean
  includeConnections: boolean
  includeRecommendations: boolean
  includeRiskAnalysis: boolean
  customTitle: string
  customDescription: string
  graphModelType: 'all' | 'selected-patterns' | 'custom'
  analysisDepth: 'basic' | 'detailed' | 'comprehensive'
}

export function AdvancedReportGenerator({
  isOpen,
  onClose,
  patterns,
  analysis,
  lineChartData,
  nodes,
  selectedPattern,
  onGenerateReport,
  className = ""
}: AdvancedReportGeneratorProps) {
  console.log('🎯 ADVANCED REPORT GENERATOR: isOpen =', isOpen, 'patterns =', patterns.length)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    reportType: 'pattern-analysis',
    selectedPatterns: selectedPattern ? [selectedPattern] : [],
    includeGraphScreenshot: true,
    includeChartScreenshot: true,
    includeNodeDetails: true,
    includeConnections: true,
    includeRecommendations: true,
    includeRiskAnalysis: true,
    customTitle: '',
    customDescription: '',
    graphModelType: 'selected-patterns',
    analysisDepth: 'detailed'
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  // Handle pattern selection
  const handlePatternToggle = useCallback((patternId: string) => {
    setReportConfig(prev => ({
      ...prev,
      selectedPatterns: prev.selectedPatterns.includes(patternId)
        ? prev.selectedPatterns.filter(id => id !== patternId)
        : [...prev.selectedPatterns, patternId]
    }))
  }, [])

  // Handle select all patterns
  const handleSelectAllPatterns = useCallback(() => {
    setReportConfig(prev => ({
      ...prev,
      selectedPatterns: patterns.map(p => p.id)
    }))
  }, [patterns])

  // Handle clear all patterns
  const handleClearAllPatterns = useCallback(() => {
    setReportConfig(prev => ({
      ...prev,
      selectedPatterns: []
    }))
  }, [])

  // Generate report
  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      console.log('🎯 STARTING PDF GENERATION...')
      console.log('🎯 REPORT CONFIG:', reportConfig)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Call the report generation function
      await onGenerateReport(reportConfig)
      
      clearInterval(progressInterval)
      setGenerationProgress(100)
      console.log('✅ PDF REPORT GENERATED SUCCESSFULLY!')
      
      setTimeout(() => {
        setIsGenerating(false)
        setGenerationProgress(0)
        onClose()
      }, 1000)

    } catch (error) {
      console.error('❌ Report generation failed:', error)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Report generation failed: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`)
      
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }, [reportConfig, onGenerateReport, onClose])

  // Get selected patterns data
  const selectedPatternsData = patterns.filter(p => reportConfig.selectedPatterns.includes(p.id))
  const selectedAnalysisData = analysis.filter(a => reportConfig.selectedPatterns.includes(a.patternId))
  const selectedNodesCount = selectedAnalysisData.reduce((count, a) => count + a.nodeIds.length, 0)

  // Get pattern by ID
  const getPatternById = (patternId: string) => {
    return patterns.find(p => p.id === patternId)
  }

  // Get analysis by pattern ID
  const getAnalysisByPattern = (patternId: string) => {
    return analysis.find(a => a.patternId === patternId)
  }

  console.log('🎯 ADVANCED REPORT GENERATOR RENDER: isOpen =', isOpen)
  
  if (!isOpen) return null
  
  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #1e293b;
        }
        .pattern-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .pattern-scrollbar::-webkit-scrollbar-track {
          background: #334155;
          border-radius: 2px;
        }
        .pattern-scrollbar::-webkit-scrollbar-thumb {
          background: #64748b;
          border-radius: 2px;
        }
        .pattern-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        /* Fallback for Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #475569 #1e293b;
        }
        .pattern-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #64748b #334155;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-6xl h-[95vh] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative p-8 border-b border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-t-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Advanced Report Generator</h2>
                <p className="text-slate-300 text-sm">
                  Enterprise-grade schema analysis with comprehensive insights
                </p>
              </div>
              <Badge variant="outline" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-400 px-3 py-1">
                <Target className="h-3 w-3 mr-1" />
                Engineering Core
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="space-y-8">
            {/* Report Type Selection */}
            <div className="space-y-4">
              <Label className="text-white font-bold text-lg flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-400" />
                </div>
                Report Configuration
              </Label>
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  reportConfig.reportType === 'pattern-analysis'
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                }`}
                onClick={() => setReportConfig(prev => ({ ...prev, reportType: 'pattern-analysis' }))}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Pattern Analysis</span>
                </div>
                <p className="text-xs text-slate-400">Focus on selected patterns</p>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  reportConfig.reportType === 'full-analysis'
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                }`}
                onClick={() => setReportConfig(prev => ({ ...prev, reportType: 'full-analysis' }))}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Full Analysis</span>
                </div>
                <p className="text-xs text-slate-400">Complete schema analysis</p>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  reportConfig.reportType === 'custom'
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                }`}
                onClick={() => setReportConfig(prev => ({ ...prev, reportType: 'custom' }))}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Custom Report</span>
                </div>
                <p className="text-xs text-slate-400">Customize all options</p>
              </div>
            </div>
          </div>

          {/* Enhanced Pattern Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white font-bold text-lg flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                Pattern Selection
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400 px-3 py-1">
                  {reportConfig.selectedPatterns.length} selected
                </Badge>
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllPatterns}
                  className="text-xs bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllPatterns}
                  className="text-xs bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pattern-scrollbar pr-2">
              {patterns.map((pattern) => {
                const isSelected = reportConfig.selectedPatterns.includes(pattern.id)
                const patternAnalysis = getAnalysisByPattern(pattern.id)
                const nodeCount = patternAnalysis?.nodeIds.length || 0
                
                return (
                  <div
                    key={pattern.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-600/50'
                    }`}
                    onClick={() => handlePatternToggle(pattern.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-500'
                        }`} style={{ backgroundColor: isSelected ? pattern.color : 'transparent' }} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              isSelected ? 'text-blue-300' : 'text-white'
                            }`}>
                              {pattern.name}
                            </span>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              pattern.criticality === 'critical' ? 'border-red-500 text-red-400' :
                              pattern.criticality === 'high' ? 'border-orange-500 text-orange-400' :
                              pattern.criticality === 'medium' ? 'border-yellow-500 text-yellow-400' :
                              'border-green-500 text-green-400'
                            }`}
                          >
                            {pattern.criticality}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400">
                          {nodeCount} nodes • Priority {pattern.priority}
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Report Options */}
          <div className="space-y-3">
            <Label className="text-white font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Report Content
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeGraphScreenshot"
                    checked={reportConfig.includeGraphScreenshot}
                    onCheckedChange={(checked) => 
                      setReportConfig(prev => ({ ...prev, includeGraphScreenshot: !!checked }))
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="includeGraphScreenshot" className="text-sm text-white flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Graph Screenshot
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeChartScreenshot"
                    checked={reportConfig.includeChartScreenshot}
                    onCheckedChange={(checked) => 
                      setReportConfig(prev => ({ ...prev, includeChartScreenshot: !!checked }))
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="includeChartScreenshot" className="text-sm text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Chart Screenshot
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeNodeDetails"
                    checked={reportConfig.includeNodeDetails}
                    onCheckedChange={(checked) => 
                      setReportConfig(prev => ({ ...prev, includeNodeDetails: !!checked }))
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="includeNodeDetails" className="text-sm text-white flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Node Details
                  </Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeConnections"
                    checked={reportConfig.includeConnections}
                    onCheckedChange={(checked) => 
                      setReportConfig(prev => ({ ...prev, includeConnections: !!checked }))
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="includeConnections" className="text-sm text-white flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Connections
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRecommendations"
                    checked={reportConfig.includeRecommendations}
                    onCheckedChange={(checked) => 
                      setReportConfig(prev => ({ ...prev, includeRecommendations: !!checked }))
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="includeRecommendations" className="text-sm text-white flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Recommendations
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRiskAnalysis"
                    checked={reportConfig.includeRiskAnalysis}
                    onCheckedChange={(checked) => 
                      setReportConfig(prev => ({ ...prev, includeRiskAnalysis: !!checked }))
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="includeRiskAnalysis" className="text-sm text-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Analysis
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Depth */}
          <div className="space-y-3">
            <Label className="text-white font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Analysis Depth
            </Label>
            <Select
              value={reportConfig.analysisDepth}
              onValueChange={(value: 'basic' | 'detailed' | 'comprehensive') =>
                setReportConfig(prev => ({ ...prev, analysisDepth: value }))
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="basic" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    Basic Analysis
                  </div>
                </SelectItem>
                <SelectItem value="detailed" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    Detailed Analysis
                  </div>
                </SelectItem>
                <SelectItem value="comprehensive" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    Comprehensive Analysis
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Title and Description */}
          {reportConfig.reportType === 'custom' && (
            <div className="space-y-3">
              <Label className="text-white font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Custom Report Details
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customTitle" className="text-sm text-slate-300">Report Title</Label>
                  <Input
                    id="customTitle"
                    value={reportConfig.customTitle}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, customTitle: e.target.value }))}
                    placeholder="Enter custom report title..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="customDescription" className="text-sm text-slate-300">Description</Label>
                  <Textarea
                    id="customDescription"
                    value={reportConfig.customDescription}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, customDescription: e.target.value }))}
                    placeholder="Enter report description..."
                    className="bg-slate-800 border-slate-700 text-white"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Report Summary */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Report Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Report Type:</span>
                <div className="text-white font-medium capitalize">{reportConfig.reportType.replace('-', ' ')}</div>
              </div>
              <div>
                <span className="text-slate-400">Selected Patterns:</span>
                <div className="text-white font-medium">{reportConfig.selectedPatterns.length}</div>
              </div>
              <div>
                <span className="text-slate-400">Total Nodes:</span>
                <div className="text-white font-medium">{selectedNodesCount}</div>
              </div>
              <div>
                <span className="text-slate-400">Analysis Depth:</span>
                <div className="text-white font-medium capitalize">{reportConfig.analysisDepth}</div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Enhanced Footer */}
        <div className="relative p-8 border-t border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-b-2xl"></div>
          <div className="relative flex gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 h-12 bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || reportConfig.selectedPatterns.length === 0}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating... {Math.round(generationProgress)}%
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Advanced Report
                </>
              )}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
