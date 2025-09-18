/**
 * Advanced PDF Report Generator
 * Creates comprehensive PDF reports with graph screenshots, pattern analysis, and schema insights
 */

// Dynamic imports to handle potential missing dependencies
let jsPDF: any = null
let html2canvas: any = null

// Try to load dependencies
try {
  jsPDF = require('jspdf').default || require('jspdf')
} catch (error) {
  console.warn('jsPDF not available, will use fallback method')
}

try {
  html2canvas = require('html2canvas').default || require('html2canvas')
} catch (error) {
  console.warn('html2canvas not available, will use fallback method')
}

export interface ReportConfig {
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

export interface SchemaPattern {
  id: string
  name: string
  description: string
  criticality: 'low' | 'medium' | 'high' | 'critical'
  priority: number
  color: string
  riskFactors: string[]
}

export interface SchemaAnalysis {
  patternId: string
  nodeIds: string[]
  criticalityScore: number
  healthScore: number
  impactScore: number
  businessValue: string
  recommendations: string[]
}

export interface GraphNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  metadata?: {
    description?: string
    rowCount?: number
    columnCount?: number
    size?: number
    lastModified?: string
    importance?: number
    quality?: number
  }
}

export interface LineChartData {
  patternId: string
  patternName: string
  color: string
  currentValue: number
  averageValue: number
  peakValue: number
  trend: 'improving' | 'declining' | 'stable' | 'critical'
  dataPoints: Array<{
    timestamp: Date | string
    value: number
    healthScore?: number
    riskLevel?: number
    criticalityScore?: number
    businessImpact?: number
  }>
}

export class PDFReportGenerator {
  private pdf: any = null
  private currentY: number = 20
  private pageHeight: number = 280
  private margin: number = 20
  private pageWidth: number = 210
  private useFallback: boolean = false

  constructor() {
    if (jsPDF) {
      try {
        this.pdf = new jsPDF('p', 'mm', 'a4')
        this.setupPDF()
        this.useFallback = false
      } catch (error) {
        console.warn('Failed to initialize jsPDF, using fallback method')
        this.useFallback = true
      }
    } else {
      this.useFallback = true
    }
  }

  private setupPDF() {
    // Set up PDF with professional styling
    this.pdf.setProperties({
      title: 'Schema Analysis Report',
      subject: 'Advanced Schema Discovery Analysis',
      author: 'DataWave Enterprise',
      creator: 'DataWave Schema Analyzer'
    })
  }

  async generateReport(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[],
    nodes: GraphNode[],
    lineChartData: LineChartData[],
    graphElement?: HTMLElement | undefined,
    chartElement?: HTMLElement | undefined
  ): Promise<void> {
    try {
      if (this.useFallback) {
        // Use fallback method - generate HTML report and open print dialog
        await this.generateFallbackReport(config, patterns, analysis, nodes, graphElement, chartElement)
        return
      }

      // Generate cover page
      await this.generateCoverPage(config, patterns, analysis, nodes)
      
      // Generate table of contents
      this.generateTableOfContents(config)
      
      // Generate executive summary
      this.generateExecutiveSummary(config, patterns, analysis, nodes)
      
      // Generate pattern analysis - only for selected patterns
      if (config.selectedPatterns.length > 0) {
        const selectedPatterns = patterns.filter(p => config.selectedPatterns.includes(p.id))
        const selectedAnalysis = analysis.filter(a => config.selectedPatterns.includes(a.patternId))
        const selectedNodes = nodes.filter(n => 
          selectedAnalysis.some(a => a.nodeIds.includes(n.id))
        )
        await this.generatePatternAnalysis(config, selectedPatterns, selectedAnalysis, selectedNodes, lineChartData)
      }
      
      // Generate graph screenshots
      if (config.includeGraphScreenshot && graphElement && graphElement !== undefined) {
        console.log('🎯 GENERATING GRAPH SCREENSHOT...')
        await this.generateGraphScreenshot(graphElement)
      } else {
        console.log('⚠️ Skipping graph screenshot - element not available')
      }
      
      // Generate chart screenshots
      if (config.includeChartScreenshot && chartElement && chartElement !== undefined) {
        console.log('🎯 GENERATING CHART SCREENSHOT...')
        await this.generateChartScreenshot(chartElement)
      } else {
        console.log('⚠️ Skipping chart screenshot - element not available')
      }
      
      // Generate node details
      if (config.includeNodeDetails) {
        this.generateNodeDetails(config, patterns, analysis, nodes)
      }
      
      // Generate recommendations
      if (config.includeRecommendations) {
        this.generateRecommendations(config, patterns, analysis)
      }
      
      // Generate risk analysis
      if (config.includeRiskAnalysis) {
        this.generateRiskAnalysis(config, patterns, analysis)
      }
      
      // Generate appendix
      this.generateAppendix(config, patterns, analysis, nodes)
      
      // Save the PDF
      const fileName = this.generateFileName(config)
      this.pdf.save(fileName)
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      // Try fallback method
      try {
        await this.generateFallbackReport(config, patterns, analysis, nodes)
      } catch (fallbackError) {
        console.error('Fallback PDF generation also failed:', fallbackError)
        throw error
      }
    }
  }

  private async generateCoverPage(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[],
    nodes: GraphNode[]
  ) {
    // Add logo/header
    this.pdf.setFillColor(30, 41, 59) // slate-800
    this.pdf.rect(0, 0, this.pageWidth, 40, 'F')
    
    // Title
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Schema Analysis Report', this.margin, 25)
    
    // Subtitle
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text('Advanced Enterprise Schema Discovery', this.margin, 32)
    
    // Reset colors
    this.pdf.setTextColor(0, 0, 0)
    
    // Report details
    this.currentY = 60
    this.addSectionHeader('Report Information')
    
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const reportDetails = [
      ['Report Type:', config.reportType.replace('-', ' ').toUpperCase()],
      ['Generated:', reportDate],
      ['Analysis Depth:', config.analysisDepth.toUpperCase()],
      ['Patterns Analyzed:', config.selectedPatterns.length.toString()],
      ['Total Nodes:', nodes.length.toString()],
      ['Critical Patterns:', patterns.filter(p => p.criticality === 'critical').length.toString()]
    ]
    
    this.addTable(reportDetails, [60, 120])
    
    // Executive summary box
    this.currentY += 20
    this.addSectionHeader('Executive Summary')
    
    const summaryText = this.generateExecutiveSummaryText(config, patterns, analysis, nodes)
    this.addText(summaryText, 12)
    
    this.addNewPage()
  }

  private generateTableOfContents(config: ReportConfig) {
    this.addSectionHeader('Table of Contents')
    
    const tocItems = [
      '1. Executive Summary',
      '2. Pattern Analysis',
      '3. Graph Visualization',
      '4. Chart Analysis',
      '5. Node Details',
      '6. Recommendations',
      '7. Risk Analysis',
      '8. Appendix'
    ]
    
    tocItems.forEach((item, index) => {
      this.pdf.setFontSize(12)
      this.pdf.text(item, this.margin, this.currentY)
      this.currentY += 8
    })
    
    this.addNewPage()
  }

  private generateExecutiveSummary(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[],
    nodes: GraphNode[]
  ) {
    this.addSectionHeader('Executive Summary')
    
    const summaryText = this.generateExecutiveSummaryText(config, patterns, analysis, nodes)
    this.addText(summaryText, 12)
    
    // Key metrics
    this.currentY += 10
    this.addSectionHeader('Key Metrics')
    
    const selectedPatterns = patterns.filter(p => config.selectedPatterns.includes(p.id))
    const selectedAnalysis = analysis.filter(a => config.selectedPatterns.includes(a.patternId))
    
    const metrics = [
      ['Total Patterns Analyzed:', selectedPatterns.length.toString()],
      ['Critical Patterns:', selectedPatterns.filter(p => p.criticality === 'critical').length.toString()],
      ['High Risk Patterns:', selectedPatterns.filter(p => p.criticality === 'high').length.toString()],
      ['Total Nodes:', selectedAnalysis.reduce((sum, a) => sum + a.nodeIds.length, 0).toString()],
      ['Average Health Score:', (selectedAnalysis.reduce((sum, a) => sum + a.healthScore, 0) / selectedAnalysis.length || 0).toFixed(1) + '%'],
      ['Average Criticality Score:', (selectedAnalysis.reduce((sum, a) => sum + a.criticalityScore, 0) / selectedAnalysis.length || 0).toFixed(1)]
    ]
    
    this.addTable(metrics, [80, 100])
    
    this.addNewPage()
  }

  private async generatePatternAnalysis(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[],
    nodes: GraphNode[],
    lineChartData: LineChartData[]
  ) {
    this.addSectionHeader('Pattern Analysis')
    
    const selectedPatterns = patterns.filter(p => config.selectedPatterns.includes(p.id))
    
    selectedPatterns.forEach((pattern, index) => {
      const patternAnalysis = analysis.find(a => a.patternId === pattern.id)
      const lineData = lineChartData.find(l => l.patternId === pattern.id)
      
      // Pattern header
      this.pdf.setFontSize(16)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(`${index + 1}. ${pattern.name}`, this.margin, this.currentY)
      this.currentY += 10
      
      // Pattern details
      this.pdf.setFontSize(12)
      this.pdf.setFont('helvetica', 'normal')
      
      const patternDetails = [
        ['Description:', pattern.description],
        ['Criticality:', pattern.criticality.toUpperCase()],
        ['Priority:', pattern.priority.toString()],
        ['Risk Factors:', pattern.riskFactors.join(', ')],
        ['Nodes Affected:', patternAnalysis?.nodeIds.length.toString() || '0'],
        ['Health Score:', patternAnalysis?.healthScore.toFixed(1) + '%' || 'N/A'],
        ['Criticality Score:', patternAnalysis?.criticalityScore.toFixed(1) || 'N/A'],
        ['Business Value:', patternAnalysis?.businessValue || 'N/A']
      ]
      
      this.addTable(patternDetails, [60, 120])
      
      // Recommendations
      if (patternAnalysis?.recommendations && patternAnalysis.recommendations.length > 0) {
        this.currentY += 5
        this.pdf.setFontSize(14)
        this.pdf.setFont('helvetica', 'bold')
        this.pdf.text('Recommendations:', this.margin, this.currentY)
        this.currentY += 8
        
        patternAnalysis.recommendations.forEach((rec, recIndex) => {
          this.pdf.setFontSize(11)
          this.pdf.setFont('helvetica', 'normal')
          this.pdf.text(`• ${rec}`, this.margin + 5, this.currentY)
          this.currentY += 6
        })
      }
      
      this.currentY += 15
      
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 50) {
        this.addNewPage()
      }
    })
    
    this.addNewPage()
  }

  private async generateGraphScreenshot(graphElement: HTMLElement) {
    this.addSectionHeader('Graph Visualization')
    
    try {
      console.log('🎯 CAPTURING GRAPH SCREENSHOT...')
      console.log('Graph element:', graphElement)
      
      // Validate element
      if (!graphElement) {
        throw new Error('Graph element is null or undefined')
      }
      
      let imgData: string
      
      // Check if it's a canvas element
      if (graphElement.tagName === 'CANVAS') {
        console.log('🎯 Direct canvas capture')
        // Direct canvas capture
        const canvas = graphElement as HTMLCanvasElement
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas has no content (width or height is 0)')
        }
        imgData = canvas.toDataURL('image/png', 1.0)
      } else if (html2canvas) {
        console.log('🎯 Using html2canvas')
        // Use html2canvas for other elements
        const canvas = await html2canvas(graphElement, {
          backgroundColor: '#1e293b',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        })
        imgData = canvas.toDataURL('image/png')
      } else {
        throw new Error('No screenshot method available')
      }
      
      if (imgData && imgData !== 'data:,') {
        console.log('🎯 Image data captured successfully')
        
        // Calculate dimensions
        const imgWidth = this.pageWidth - (this.margin * 2)
        const imgHeight = Math.min(imgWidth * 0.75, 200) // Max height of 200
        
        // Add image to PDF
        this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight)
        this.currentY += imgHeight + 10
        
        // Add caption
        this.pdf.setFontSize(10)
        this.pdf.setFont('helvetica', 'italic')
        this.pdf.text('Graph visualization showing schema relationships and pattern connections', this.margin, this.currentY)
        this.currentY += 15
        
        console.log('✅ Graph screenshot added to PDF')
      } else {
        throw new Error('Invalid image data')
      }
      
    } catch (error) {
      console.error('❌ Failed to capture graph screenshot:', error)
      this.pdf.setFontSize(12)
      this.pdf.text('Graph screenshot could not be captured', this.margin, this.currentY)
      this.pdf.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, this.margin, this.currentY + 10)
      this.currentY += 25
    }
    
    this.addNewPage()
  }

  private async generateChartScreenshot(chartElement: HTMLElement) {
    this.addSectionHeader('Chart Analysis')
    
    try {
      console.log('🎯 CAPTURING CHART SCREENSHOT...')
      console.log('Chart element:', chartElement)
      
      // Validate element
      if (!chartElement) {
        throw new Error('Chart element is null or undefined')
      }
      
      let imgData: string
      
      // Check if it's a canvas element
      if (chartElement.tagName === 'CANVAS') {
        console.log('🎯 Direct canvas capture for chart')
        // Direct canvas capture
        const canvas = chartElement as HTMLCanvasElement
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Chart canvas has no content (width or height is 0)')
        }
        imgData = canvas.toDataURL('image/png', 1.0)
      } else if (html2canvas) {
        console.log('🎯 Using html2canvas for chart')
        // Use html2canvas for other elements
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#1e293b',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        })
        imgData = canvas.toDataURL('image/png')
      } else {
        throw new Error('No screenshot method available')
      }
      
      if (imgData && imgData !== 'data:,') {
        console.log('🎯 Chart image data captured successfully')
        
        // Calculate dimensions
        const imgWidth = this.pageWidth - (this.margin * 2)
        const imgHeight = Math.min(imgWidth * 0.5, 150) // Max height of 150 for charts
        
        // Add image to PDF
        this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight)
        this.currentY += imgHeight + 10
        
        // Add caption
        this.pdf.setFontSize(10)
        this.pdf.setFont('helvetica', 'italic')
        this.pdf.text('Line chart showing pattern criticality trends over time', this.margin, this.currentY)
        this.currentY += 15
        
        console.log('✅ Chart screenshot added to PDF')
      } else {
        throw new Error('Invalid chart image data')
      }
      
    } catch (error) {
      console.error('❌ Failed to capture chart screenshot:', error)
      this.pdf.setFontSize(12)
      this.pdf.text('Chart screenshot could not be captured', this.margin, this.currentY)
      this.pdf.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, this.margin, this.currentY + 10)
      this.currentY += 25
    }
    
    this.addNewPage()
  }

  private generateNodeDetails(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[],
    nodes: GraphNode[]
  ) {
    this.addSectionHeader('Node Details')
    
    const selectedAnalysis = analysis.filter(a => config.selectedPatterns.includes(a.patternId))
    const selectedNodeIds = new Set(selectedAnalysis.flatMap(a => a.nodeIds))
    const selectedNodes = nodes.filter(n => selectedNodeIds.has(n.id))
    
    selectedNodes.forEach((node, index) => {
      this.pdf.setFontSize(14)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(`${index + 1}. ${node.name}`, this.margin, this.currentY)
      this.currentY += 8
      
      const nodeDetails = [
        ['Type:', node.type.toUpperCase()],
        ['Description:', node.metadata?.description || 'No description available'],
        ['Row Count:', node.metadata?.rowCount?.toString() || 'N/A'],
        ['Column Count:', node.metadata?.columnCount?.toString() || 'N/A'],
        ['Size:', node.metadata?.size ? `${node.metadata.size} MB` : 'N/A'],
        ['Last Modified:', node.metadata?.lastModified || 'N/A'],
        ['Importance:', node.metadata?.importance?.toString() || 'N/A'],
        ['Quality Score:', node.metadata?.quality?.toString() || 'N/A']
      ]
      
      this.addTable(nodeDetails, [50, 130])
      
      this.currentY += 10
      
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 50) {
        this.addNewPage()
      }
    })
    
    this.addNewPage()
  }

  private generateRecommendations(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[]
  ) {
    this.addSectionHeader('Recommendations')
    
    const selectedAnalysis = analysis.filter(a => config.selectedPatterns.includes(a.patternId))
    const allRecommendations = selectedAnalysis.flatMap(a => a.recommendations)
    const uniqueRecommendations = [...new Set(allRecommendations)]
    
    uniqueRecommendations.forEach((rec, index) => {
      this.pdf.setFontSize(12)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text(`${index + 1}. ${rec}`, this.margin, this.currentY)
      this.currentY += 8
    })
    
    this.addNewPage()
  }

  private generateRiskAnalysis(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[]
  ) {
    this.addSectionHeader('Risk Analysis')
    
    const selectedPatterns = patterns.filter(p => config.selectedPatterns.includes(p.patternId))
    const selectedAnalysis = analysis.filter(a => config.selectedPatterns.includes(a.patternId))
    
    // Risk summary
    const riskSummary = [
      ['Critical Patterns:', selectedPatterns.filter(p => p.criticality === 'critical').length.toString()],
      ['High Risk Patterns:', selectedPatterns.filter(p => p.criticality === 'high').length.toString()],
      ['Medium Risk Patterns:', selectedPatterns.filter(p => p.criticality === 'medium').length.toString()],
      ['Low Risk Patterns:', selectedPatterns.filter(p => p.criticality === 'low').length.toString()],
      ['Average Risk Score:', (selectedAnalysis.reduce((sum, a) => sum + a.criticalityScore, 0) / selectedAnalysis.length || 0).toFixed(1)]
    ]
    
    this.addTable(riskSummary, [80, 100])
    
    // Risk factors
    this.currentY += 15
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Risk Factors:', this.margin, this.currentY)
    this.currentY += 8
    
    const allRiskFactors = selectedPatterns.flatMap(p => p.riskFactors)
    const uniqueRiskFactors = [...new Set(allRiskFactors)]
    
    uniqueRiskFactors.forEach((risk, index) => {
      this.pdf.setFontSize(11)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text(`• ${risk}`, this.margin + 5, this.currentY)
      this.currentY += 6
    })
    
    this.addNewPage()
  }

  private generateAppendix(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[],
    nodes: GraphNode[]
  ) {
    this.addSectionHeader('Appendix')
    
    // Technical details
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Technical Details', this.margin, this.currentY)
    this.currentY += 8
    
    const technicalDetails = [
      ['Report Generated:', new Date().toISOString()],
      ['Analysis Engine:', 'DataWave Enterprise Schema Analyzer'],
      ['Report Version:', '1.0.0'],
      ['Total Patterns:', patterns.length.toString()],
      ['Total Nodes:', nodes.length.toString()],
      ['Analysis Depth:', config.analysisDepth],
      ['Report Type:', config.reportType]
    ]
    
    this.addTable(technicalDetails, [80, 100])
    
    // Footer
    this.currentY = this.pageHeight - 20
    this.pdf.setFontSize(8)
    this.pdf.setFont('helvetica', 'italic')
    this.pdf.text('Generated by DataWave Enterprise Schema Analyzer', this.margin, this.currentY)
    this.pdf.text(`Page ${this.pdf.getNumberOfPages()}`, this.pageWidth - this.margin - 10, this.currentY)
  }

  private addSectionHeader(text: string) {
    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setTextColor(59, 130, 246) // blue-500
    this.pdf.text(text, this.margin, this.currentY)
    this.currentY += 10
    this.pdf.setTextColor(0, 0, 0)
  }

  private addText(text: string, fontSize: number = 12) {
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont('helvetica', 'normal')
    
    const lines = this.pdf.splitTextToSize(text, this.pageWidth - (this.margin * 2))
    lines.forEach((line: string) => {
      this.pdf.text(line, this.margin, this.currentY)
      this.currentY += 6
    })
    
    this.currentY += 5
  }

  private addTable(data: string[][], columnWidths: number[]) {
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        this.pdf.setFontSize(11)
        this.pdf.setFont('helvetica', colIndex === 0 ? 'bold' : 'normal')
        this.pdf.text(cell, this.margin + (colIndex * columnWidths[colIndex]), this.currentY)
      })
      this.currentY += 6
    })
    this.currentY += 5
  }

  private addNewPage() {
    this.pdf.addPage()
    this.currentY = this.margin
  }

  private generateFileName(config: ReportConfig): string {
    const date = new Date().toISOString().split('T')[0]
    const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-')
    return `Schema_Analysis_Report_${config.reportType}_${date}_${time}.pdf`
  }

  private generateExecutiveSummaryText(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[],
    nodes: GraphNode[]
  ): string {
    const selectedPatterns = patterns.filter(p => config.selectedPatterns.includes(p.id))
    const criticalPatterns = selectedPatterns.filter(p => p.criticality === 'critical')
    const totalNodes = analysis.filter(a => config.selectedPatterns.includes(a.patternId))
      .reduce((sum, a) => sum + a.nodeIds.length, 0)
    
    return `This comprehensive schema analysis report provides detailed insights into ${selectedPatterns.length} patterns affecting ${totalNodes} schema nodes. The analysis reveals ${criticalPatterns.length} critical patterns requiring immediate attention. The report includes visual representations of schema relationships, pattern trends, and detailed recommendations for optimization and risk mitigation.`
  }

  private async generateFallbackReport(
    config: ReportConfig,
    patterns: SchemaPattern[],
    analysis: SchemaAnalysis[],
    nodes: GraphNode[],
    graphElement?: HTMLElement | undefined,
    chartElement?: HTMLElement | undefined
  ): Promise<void> {
    try {
      console.log('🎯 GENERATING FALLBACK REPORT WITH CONFIG:', config)
      console.log('🎯 SELECTED PATTERNS:', config.selectedPatterns)
      
      // Import the simple PDF generator
      const { SimplePDFGenerator } = await import('./simple-pdf-generator')
      const simpleGenerator = new SimplePDFGenerator()
      
      // Filter patterns based on selection
      const selectedPatterns = config.selectedPatterns.length > 0 
        ? patterns.filter(p => config.selectedPatterns.includes(p.id))
        : patterns
      
      console.log('🎯 FILTERED PATTERNS FOR REPORT:', selectedPatterns.map(p => p.name))
      
      // Convert types to match simple generator interface
      const simpleConfig = {
        reportType: config.reportType,
        selectedPatterns: config.selectedPatterns,
        includeGraphScreenshot: config.includeGraphScreenshot,
        includeChartScreenshot: config.includeChartScreenshot,
        includeNodeDetails: config.includeNodeDetails,
        includeConnections: config.includeConnections,
        includeRecommendations: config.includeRecommendations,
        includeRiskAnalysis: config.includeRiskAnalysis,
        customTitle: config.customTitle || 'Schema Analysis Report',
        customDescription: config.customDescription || 'Comprehensive analysis of selected schema patterns',
        graphModelType: config.graphModelType,
        analysisDepth: config.analysisDepth
      }

      const simplePatterns = selectedPatterns.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        criticality: p.criticality,
        priority: p.priority,
        color: p.color,
        riskFactors: p.riskFactors
      }))

      // Filter analysis based on selected patterns
      const selectedAnalysis = analysis.filter(a => config.selectedPatterns.includes(a.patternId))
      
      const simpleAnalysis = selectedAnalysis.map(a => ({
        patternId: a.patternId,
        nodeIds: a.nodeIds,
        criticalityScore: a.criticalityScore,
        healthScore: a.healthScore,
        impactScore: a.impactScore,
        businessValue: a.businessValue,
        recommendations: a.recommendations
      }))

      // Filter nodes based on selected patterns
      const selectedNodeIds = new Set(selectedAnalysis.flatMap(a => a.nodeIds))
      const selectedNodes = nodes.filter(n => selectedNodeIds.has(n.id))
      
      const simpleNodes = selectedNodes.map(n => ({
        id: n.id,
        name: n.name,
        type: n.type,
        metadata: n.metadata
      }))

      console.log('🎯 REPORT DATA SUMMARY:')
      console.log('- Patterns:', simplePatterns.length)
      console.log('- Analysis:', simpleAnalysis.length)
      console.log('- Nodes:', simpleNodes.length)

      await simpleGenerator.generateReport(simpleConfig, simplePatterns, simpleAnalysis, simpleNodes, graphElement, chartElement)
      
    } catch (error) {
      console.error('Fallback report generation failed:', error)
      throw error
    }
  }
}
