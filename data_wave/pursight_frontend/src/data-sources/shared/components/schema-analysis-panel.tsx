"use client"

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Shield,
  Database,
  FileText,
  Download,
  X,
  Eye,
  Target,
  Zap,
  Star,
  Brain
} from 'lucide-react'
import { SchemaLineChart } from './schema-line-chart'
import type { SchemaPattern, SchemaAnalysis, LineChartData, GraphNode } from '../utils/schema-analysis-utils'

interface SchemaAnalysisPanelProps {
  patterns: SchemaPattern[]
  analysis: SchemaAnalysis[]
  lineChartData: LineChartData[]
  selectedPattern: string | null
  highlightedNodes: Set<string>
  nodes: GraphNode[]
  onPatternSelect: (patternId: string | null) => void
  onClose: () => void
  onGenerateReport: () => void
  onToggleChart?: () => void
  showChart?: boolean
  className?: string
}

export function SchemaAnalysisPanel({
  patterns,
  analysis,
  lineChartData,
  selectedPattern,
  highlightedNodes,
  nodes,
  onPatternSelect,
  onClose,
  onGenerateReport,
  onToggleChart,
  showChart = false,
  className = ""
}: SchemaAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Computed data
  const criticalPatterns = useMemo(() => {
    return patterns.filter(p => p.criticality === 'critical')
  }, [patterns])

  const highRiskPatterns = useMemo(() => {
    return patterns.filter(p => p.criticality === 'high' || p.criticality === 'critical')
  }, [patterns])

  const totalNodes = nodes.length
  const analyzedNodes = highlightedNodes.size
  const analysisCoverage = totalNodes > 0 ? (analyzedNodes / totalNodes) * 100 : 0

  const averageHealthScore = useMemo(() => {
    if (analysis.length === 0) return 0
    return analysis.reduce((sum, a) => sum + a.healthScore, 0) / analysis.length
  }, [analysis])

  const totalRiskScore = useMemo(() => {
    return analysis.reduce((sum, a) => sum + a.criticalityScore, 0)
  }, [analysis])

  // Get pattern by ID
  const getPatternById = (patternId: string) => {
    return patterns.find(p => p.id === patternId)
  }

  // Get analysis by pattern ID
  const getAnalysisByPattern = (patternId: string) => {
    return analysis.find(a => a.patternId === patternId)
  }

  // Get nodes by pattern
  const getNodesByPattern = (patternId: string) => {
    const patternAnalysis = getAnalysisByPattern(patternId)
    if (!patternAnalysis) return []
    return nodes.filter(node => patternAnalysis.nodeIds.includes(node.id))
  }

  // Render pattern overview
  const renderPatternOverview = () => {
    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-3 w-3 text-blue-400" />
              <span className="text-xs font-medium text-slate-300">Total Patterns</span>
            </div>
            <div className="text-lg font-bold text-white">{patterns.length}</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3 w-3 text-red-400" />
              <span className="text-xs font-medium text-slate-300">Critical</span>
            </div>
            <div className="text-lg font-bold text-red-400">{criticalPatterns.length}</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3 w-3 text-orange-400" />
              <span className="text-xs font-medium text-slate-300">High Risk</span>
            </div>
            <div className="text-lg font-bold text-orange-400">{highRiskPatterns.length}</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span className="text-xs font-medium text-slate-300">Health</span>
            </div>
            <div className="text-lg font-bold text-green-400">{averageHealthScore.toFixed(1)}%</div>
          </div>
        </div>

        {/* Pattern List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pattern Analysis</h3>
          {patterns.map((pattern) => {
            const patternAnalysis = getAnalysisByPattern(pattern.id)
            const patternNodes = getNodesByPattern(pattern.id)
            const lineData = lineChartData.find(l => l.patternId === pattern.id)
            
            return (
              <div
                key={pattern.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPattern === pattern.id
                    ? 'bg-slate-700 border-slate-500'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                }`}
                onClick={() => onPatternSelect(pattern.id === selectedPattern ? null : pattern.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pattern.color }}
                    />
                    <h4 className="text-sm font-medium text-white">{pattern.name}</h4>
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
                    {patternNodes.length} nodes
                  </div>
                </div>
                
                <p className="text-xs text-slate-300 mb-2">{pattern.description}</p>
                
                {patternAnalysis && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Criticality:</span>
                      <div className="font-medium text-white">{patternAnalysis.criticalityScore.toFixed(1)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Health:</span>
                      <div className="font-medium text-white">{patternAnalysis.healthScore.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Impact:</span>
                      <div className="font-medium text-white">{patternAnalysis.impactScore.toFixed(1)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Value:</span>
                      <div className="font-medium text-white capitalize">{patternAnalysis.businessValue}</div>
                    </div>
                  </div>
                )}
                
                {lineData && (
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Current:</span>
                      <span className="text-white font-medium">{lineData.currentValue.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Trend:</span>
                      {lineData.trend === 'improving' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : lineData.trend === 'declining' ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : (
                        <Activity className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-white capitalize">{lineData.trend}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render detailed analysis
  const renderDetailedAnalysis = () => {
    if (!selectedPattern) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a pattern to view detailed analysis</p>
          </div>
        </div>
      )
    }

    const pattern = getPatternById(selectedPattern)
    const patternAnalysis = getAnalysisByPattern(selectedPattern)
    const patternNodes = getNodesByPattern(selectedPattern)
    const lineData = lineChartData.find(l => l.patternId === selectedPattern)

    if (!pattern || !patternAnalysis) return null

    return (
      <div className="space-y-6">
        {/* Pattern Header */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: pattern.color }}
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{pattern.name}</h2>
              <p className="text-slate-300">{pattern.description}</p>
            </div>
            <Badge 
              variant="outline"
              className={
                pattern.criticality === 'critical' ? 'border-red-500 text-red-400' :
                pattern.criticality === 'high' ? 'border-orange-500 text-orange-400' :
                pattern.criticality === 'medium' ? 'border-yellow-500 text-yellow-400' :
                'border-green-500 text-green-400'
              }
            >
              {pattern.criticality.toUpperCase()}
            </Badge>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-sm text-slate-400">Criticality Score</div>
              <div className="text-2xl font-bold text-white">{patternAnalysis.criticalityScore.toFixed(1)}</div>
              <Progress value={patternAnalysis.criticalityScore} className="mt-2" />
            </div>
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-sm text-slate-400">Health Score</div>
              <div className="text-2xl font-bold text-white">{patternAnalysis.healthScore.toFixed(1)}%</div>
              <Progress value={patternAnalysis.healthScore} className="mt-2" />
            </div>
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-sm text-slate-400">Impact Score</div>
              <div className="text-2xl font-bold text-white">{patternAnalysis.impactScore.toFixed(1)}</div>
              <Progress value={patternAnalysis.impactScore} className="mt-2" />
            </div>
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-sm text-slate-400">Business Value</div>
              <div className="text-2xl font-bold text-white capitalize">{patternAnalysis.businessValue}</div>
              <div className="text-xs text-slate-400 mt-1">Priority {pattern.priority}</div>
            </div>
          </div>
        </div>

        {/* Affected Nodes */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Affected Nodes ({patternNodes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {patternNodes.map((node) => (
              <div key={node.id} className="bg-slate-700 p-3 rounded border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-medium text-white">{node.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {node.type}
                  </Badge>
                </div>
                {node.metadata?.description && (
                  <p className="text-xs text-slate-400">{node.metadata.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
          <div className="space-y-3">
            {patternAnalysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-700 rounded">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-300">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
          <div className="space-y-2">
            {pattern.riskFactors.map((risk, index) => (
              <div key={index} className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-slate-300">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-slate-900 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Schema Analysis</h1>
              <p className="text-xs text-slate-400">
                Pattern analysis & lifecycle monitoring
              </p>
            </div>
            {highlightedNodes.size > 0 && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400 text-xs">
                {highlightedNodes.size} highlighted
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateReport}
              className="text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              Report
            </Button>
            {onToggleChart && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleChart}
                className={`text-xs ${
                  showChart 
                    ? 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50 text-purple-200 hover:text-purple-100'
                    : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Chart
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-slate-800/50 rounded">
            <div className="text-blue-400 font-semibold">{patterns.length}</div>
            <div className="text-slate-400">Patterns</div>
          </div>
          <div className="text-center p-2 bg-slate-800/50 rounded">
            <div className="text-green-400 font-semibold">{totalNodes}</div>
            <div className="text-slate-400">Total Nodes</div>
          </div>
          <div className="text-center p-2 bg-slate-800/50 rounded">
            <div className="text-orange-400 font-semibold">{criticalPatterns.length}</div>
            <div className="text-slate-400">Critical</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden p-4">
            <TabsContent value="overview" className="h-full">
              <ScrollArea className="h-full">
                {renderPatternOverview()}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="detailed" className="h-full">
              <ScrollArea className="h-full">
                {renderDetailedAnalysis()}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
        </div>
      </div>
  )
}
