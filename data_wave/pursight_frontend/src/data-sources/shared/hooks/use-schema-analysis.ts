"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  SchemaAnalysisEngine, 
  type SchemaPattern, 
  type SchemaAnalysis, 
  type LineChartData,
  type GraphNode 
} from '../utils/schema-analysis-utils'

interface UseSchemaAnalysisProps {
  nodes: GraphNode[]
  patterns?: SchemaPattern[]
  autoAnalyze?: boolean
}

interface UseSchemaAnalysisReturn {
  // Analysis Engine
  analysisEngine: SchemaAnalysisEngine
  
  // Analysis Data
  patterns: SchemaPattern[]
  analysis: SchemaAnalysis[]
  lineChartData: LineChartData[]
  
  // Selection State
  selectedPattern: string | null
  selectedNodes: GraphNode[]
  highlightedNodes: Set<string>
  
  // UI State
  isAnalyzing: boolean
  showLineChart: boolean
  showAnalysisPanel: boolean
  
  // Actions
  selectPattern: (patternId: string | null) => void
  toggleLineChart: () => void
  toggleAnalysisPanel: () => void
  analyzeNodes: (nodes: GraphNode[]) => void
  clearSelection: () => void
  
  // Computed Data
  patternConnections: Map<string, string[]>
  criticalPatterns: SchemaPattern[]
  highRiskPatterns: SchemaPattern[]
  totalRiskScore: number
  averageHealthScore: number
  
  // Report Generation
  generateReport: (selectedPatterns?: string[]) => any
  exportReport: (format: 'json' | 'csv' | 'pdf') => void
}

export function useSchemaAnalysis({
  nodes,
  patterns: customPatterns,
  autoAnalyze = true
}: UseSchemaAnalysisProps): UseSchemaAnalysisReturn {
  
  // Initialize Analysis Engine
  const analysisEngine = useMemo(() => {
    return new SchemaAnalysisEngine(customPatterns)
  }, [customPatterns])
  
  // State
  const [patterns, setPatterns] = useState<SchemaPattern[]>(analysisEngine.getPatterns())
  const [analysis, setAnalysis] = useState<SchemaAnalysis[]>([])
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([])
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showLineChart, setShowLineChart] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  
  // Analyze nodes when they change
  const analyzeNodes = useCallback(async (nodesToAnalyze: GraphNode[]) => {
    if (nodesToAnalyze.length === 0) return
    
    setIsAnalyzing(true)
    
    try {
      // Simulate analysis delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Run analysis
      analysisEngine.analyzeSchemaNodes(nodesToAnalyze)
      
      // Update state
      setAnalysis(analysisEngine.getAnalysis())
      setLineChartData(analysisEngine.getLineChartData())
      
    } catch (error) {
      console.error('Schema analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [analysisEngine])
  
  // Auto-analyze when nodes change
  useEffect(() => {
    if (autoAnalyze && nodes.length > 0) {
      analyzeNodes(nodes)
    }
  }, [nodes, autoAnalyze, analyzeNodes])
  
  // Pattern selection
  const selectPattern = useCallback((patternId: string | null) => {
    setSelectedPattern(patternId)
  }, [])
  
  // Get selected nodes
  const selectedNodes = useMemo(() => {
    if (!selectedPattern) return []
    return analysisEngine.getNodesByPattern(selectedPattern, nodes)
  }, [selectedPattern, analysisEngine, nodes])
  
  // Get highlighted nodes (all nodes with the selected pattern)
  const highlightedNodes = useMemo(() => {
    if (!selectedPattern) return new Set<string>()
    
    const patternAnalysis = analysisEngine.getAnalysisByPattern(selectedPattern)
    if (!patternAnalysis) return new Set<string>()
    
    return new Set(patternAnalysis.nodeIds)
  }, [selectedPattern, analysisEngine])
  
  // Pattern connections
  const patternConnections = useMemo(() => {
    const connections = new Map<string, string[]>()
    
    patterns.forEach(pattern => {
      const patternAnalysis = analysis.find(a => a.patternId === pattern.id)
      if (patternAnalysis) {
        connections.set(pattern.id, patternAnalysis.nodeIds)
      }
    })
    
    return connections
  }, [patterns, analysis])
  
  // Critical patterns
  const criticalPatterns = useMemo(() => {
    return patterns.filter(p => p.criticality === 'critical')
  }, [patterns])
  
  // High risk patterns
  const highRiskPatterns = useMemo(() => {
    return patterns.filter(p => p.criticality === 'high' || p.criticality === 'critical')
  }, [patterns])
  
  // Total risk score
  const totalRiskScore = useMemo(() => {
    return analysis.reduce((sum, a) => sum + a.criticalityScore, 0)
  }, [analysis])
  
  // Average health score
  const averageHealthScore = useMemo(() => {
    if (analysis.length === 0) return 0
    return analysis.reduce((sum, a) => sum + a.healthScore, 0) / analysis.length
  }, [analysis])
  
  // UI Actions
  const toggleLineChart = useCallback(() => {
    setShowLineChart(prev => !prev)
  }, [])
  
  const toggleAnalysisPanel = useCallback(() => {
    setShowAnalysisPanel(prev => !prev)
  }, [])
  
  const clearSelection = useCallback(() => {
    setSelectedPattern(null)
  }, [])
  
  // Report generation
  const generateReport = useCallback((selectedPatterns?: string[]) => {
    return analysisEngine.generateReport(selectedPatterns)
  }, [analysisEngine])
  
  const exportReport = useCallback((format: 'json' | 'csv' | 'pdf') => {
    const report = generateReport(selectedPattern ? [selectedPattern] : undefined)
    
    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
        const jsonUrl = URL.createObjectURL(jsonBlob)
        const jsonLink = document.createElement('a')
        jsonLink.href = jsonUrl
        jsonLink.download = `schema-analysis-${new Date().toISOString().split('T')[0]}.json`
        jsonLink.click()
        URL.revokeObjectURL(jsonUrl)
        break
        
      case 'csv':
        // Convert report to CSV format
        const csvData = convertReportToCSV(report)
        const csvBlob = new Blob([csvData], { type: 'text/csv' })
        const csvUrl = URL.createObjectURL(csvBlob)
        const csvLink = document.createElement('a')
        csvLink.href = csvUrl
        csvLink.download = `schema-analysis-${new Date().toISOString().split('T')[0]}.csv`
        csvLink.click()
        URL.revokeObjectURL(csvUrl)
        break
        
      case 'pdf':
        // PDF generation would require a library like jsPDF
        console.log('PDF export not implemented yet')
        break
    }
  }, [generateReport, selectedPattern])
  
  return {
    // Analysis Engine
    analysisEngine,
    
    // Analysis Data
    patterns,
    analysis,
    lineChartData,
    
    // Selection State
    selectedPattern,
    selectedNodes,
    highlightedNodes,
    
    // UI State
    isAnalyzing,
    showLineChart,
    showAnalysisPanel,
    
    // Actions
    selectPattern,
    toggleLineChart,
    toggleAnalysisPanel,
    analyzeNodes,
    clearSelection,
    
    // Computed Data
    patternConnections,
    criticalPatterns,
    highRiskPatterns,
    totalRiskScore,
    averageHealthScore,
    
    // Report Generation
    generateReport,
    exportReport
  }
}

// Helper function to convert report to CSV
function convertReportToCSV(report: any): string {
  let csv = 'Pattern,Category,Criticality,Priority,Node Count,Avg Criticality Score,Avg Health Score,Current Value,Peak Value,Low Value,Trend\n'
  
  report.patterns.forEach((patternData: any) => {
    const pattern = patternData.pattern
    const lineChartData = patternData.lineChartData
    
    csv += `"${pattern.name}","${pattern.category}","${pattern.criticality}","${pattern.priority}","${patternData.analysis?.nodeIds?.length || 0}","${patternData.analysis?.criticalityScore?.toFixed(2) || 0}","${patternData.analysis?.healthScore?.toFixed(2) || 0}","${lineChartData?.currentValue?.toFixed(2) || 0}","${lineChartData?.peakValue?.toFixed(2) || 0}","${lineChartData?.lowValue?.toFixed(2) || 0}","${lineChartData?.trend || 'stable'}"\n`
  })
  
  return csv
}
