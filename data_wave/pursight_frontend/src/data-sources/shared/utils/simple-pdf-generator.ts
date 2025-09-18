/**
 * Simple PDF Generator - Fallback implementation without external dependencies
 * Creates basic PDF reports using browser's print functionality
 */

export interface SimpleReportConfig {
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

export interface SimpleSchemaPattern {
  id: string
  name: string
  description: string
  criticality: 'low' | 'medium' | 'high' | 'critical'
  priority: number
  color: string
  riskFactors: string[]
}

export interface SimpleSchemaAnalysis {
  patternId: string
  nodeIds: string[]
  criticalityScore: number
  healthScore: number
  impactScore: number
  businessValue: string
  recommendations: string[]
}

export interface SimpleGraphNode {
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

export class SimplePDFGenerator {
  async generateReport(
    config: SimpleReportConfig,
    patterns: SimpleSchemaPattern[],
    analysis: SimpleSchemaAnalysis[],
    nodes: SimpleGraphNode[],
    graphElement?: HTMLElement,
    chartElement?: HTMLElement
  ): Promise<void> {
    try {
      console.log('🎯 SIMPLE PDF GENERATOR: Starting report generation')
      console.log('🎯 CONFIG:', config)
      console.log('🎯 PATTERNS:', patterns.length)
      console.log('🎯 ANALYSIS:', analysis.length)
      console.log('🎯 NODES:', nodes.length)
      
      // Create a new window for the report
      const reportWindow = window.open('', '_blank', 'width=1200,height=800')
      if (!reportWindow) {
        throw new Error('Could not open report window')
      }

      // Generate HTML content
      const htmlContent = this.generateHTMLReport(config, patterns, analysis, nodes, graphElement, chartElement)
      
      // Write content to the new window
      reportWindow.document.write(htmlContent)
      reportWindow.document.close()
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        reportWindow.print()
        // Close the window after printing
        setTimeout(() => {
          reportWindow.close()
        }, 2000)
      }, 1000)

    } catch (error) {
      console.error('Simple PDF generation failed:', error)
      throw error
    }
  }

  private generateHTMLReport(
    config: SimpleReportConfig,
    patterns: SimpleSchemaPattern[],
    analysis: SimpleSchemaAnalysis[],
    nodes: SimpleGraphNode[],
    graphElement?: HTMLElement,
    chartElement?: HTMLElement
  ): string {
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const selectedPatterns = patterns.filter(p => config.selectedPatterns.includes(p.id))
    const selectedAnalysis = analysis.filter(a => config.selectedPatterns.includes(a.patternId))
    const totalNodes = selectedAnalysis.reduce((sum, a) => sum + a.nodeIds.length, 0)
    const criticalPatterns = selectedPatterns.filter(p => p.criticality === 'critical')
    const highRiskPatterns = selectedPatterns.filter(p => p.criticality === 'high')

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Advanced Schema Analysis Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.8;
            color: #1a1a1a;
            background: #ffffff;
            font-size: 12pt;
          }
          
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 24pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .header h2 {
            font-size: 16pt;
            color: #34495e;
            margin-bottom: 5px;
            font-style: italic;
          }
          
          .header .date {
            font-size: 11pt;
            color: #7f8c8d;
            margin-top: 10px;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 16pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #3498db;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .subsection-title {
            font-size: 14pt;
            font-weight: bold;
            color: #34495e;
            margin: 20px 0 10px 0;
            text-transform: capitalize;
          }
          
          .executive-summary {
            background: #f8f9fa;
            padding: 20px;
            border-left: 5px solid #3498db;
            margin-bottom: 25px;
            font-style: italic;
          }
          
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          
          .metric-card {
            background: #ffffff;
            border: 2px solid #ecf0f1;
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .metric-value {
            font-size: 20pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          
          .metric-label {
            font-size: 10pt;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .pattern-analysis {
            margin-bottom: 25px;
          }
          
          .pattern-card {
            background: #ffffff;
            border: 1px solid #bdc3c7;
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .pattern-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ecf0f1;
          }
          
          .pattern-color {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            margin-right: 10px;
            border: 2px solid #ffffff;
            box-shadow: 0 0 0 1px #bdc3c7;
          }
          
          .pattern-name {
            font-size: 14pt;
            font-weight: bold;
            color: #2c3e50;
            margin-right: 15px;
          }
          
          .criticality-badge {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 9pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-left: auto;
          }
          
          .criticality-critical { background: #e74c3c; color: white; }
          .criticality-high { background: #f39c12; color: white; }
          .criticality-medium { background: #f1c40f; color: #2c3e50; }
          .criticality-low { background: #27ae60; color: white; }
          
          .pattern-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 10px 0;
          }
          
          .detail-item {
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-weight: bold;
            color: #34495e;
            margin-right: 5px;
          }
          
          .recommendations {
            background: #e8f5e8;
            border: 1px solid #27ae60;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
          }
          
          .recommendations h4 {
            color: #27ae60;
            margin-bottom: 10px;
            font-size: 12pt;
          }
          
          .recommendations ul {
            margin-left: 20px;
          }
          
          .recommendations li {
            margin-bottom: 5px;
            color: #2c3e50;
          }
          
          .risk-factors {
            background: #fdf2e9;
            border: 1px solid #e67e22;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
          }
          
          .risk-factors h4 {
            color: #e67e22;
            margin-bottom: 10px;
            font-size: 12pt;
          }
          
          .schema-details {
            background: #f8f9fa;
            border: 1px solid #6c757d;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
          }
          
          .schema-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .schema-table th,
          .schema-table td {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: left;
          }
          
          .schema-table th {
            background: #e9ecef;
            font-weight: bold;
            color: #495057;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #2c3e50;
            text-align: center;
            color: #7f8c8d;
            font-size: 10pt;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .screenshot-container {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
          }
          
          .screenshot-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #ced4da;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .screenshot-caption {
            margin-top: 10px;
            font-style: italic;
            color: #6c757d;
            font-size: 11pt;
          }
          
          @media print {
            body { margin: 0; padding: 0; }
            .report-container { 
              max-width: none; 
              margin: 0; 
              padding: 15mm;
              box-shadow: none;
            }
            .section { page-break-inside: avoid; }
            .pattern-card { page-break-inside: avoid; }
            .screenshot-container { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>Advanced Schema Analysis Report</h1>
            <h2>Enterprise Data Discovery & Pattern Analysis</h2>
            <div class="date">Generated on ${reportDate}</div>
          </div>

          <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="executive-summary">
              This comprehensive schema analysis report provides detailed insights into <strong>${selectedPatterns.length}</strong> identified patterns affecting <strong>${totalNodes}</strong> schema nodes within the enterprise data ecosystem. The analysis reveals <strong>${criticalPatterns.length}</strong> critical patterns requiring immediate attention and <strong>${highRiskPatterns.length}</strong> high-risk patterns that warrant strategic review.
            </div>
            
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${selectedPatterns.length}</div>
                <div class="metric-label">Patterns Analyzed</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${criticalPatterns.length}</div>
                <div class="metric-label">Critical Patterns</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${totalNodes}</div>
                <div class="metric-label">Schema Nodes</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${config.analysisDepth.toUpperCase()}</div>
                <div class="metric-label">Analysis Depth</div>
              </div>
            </div>
          </div>

          ${this.generateScreenshotSections(graphElement, chartElement)}

          <div class="section page-break">
            <div class="section-title">Detailed Pattern Analysis</div>
            ${selectedPatterns.map((pattern, index) => {
              const patternAnalysis = analysis.find(a => a.patternId === pattern.id)
              const affectedNodes = nodes.filter(n => patternAnalysis?.nodeIds.includes(n.id))
              
              return `
                <div class="pattern-analysis">
                  <div class="pattern-card">
                    <div class="pattern-header">
                      <div class="pattern-color" style="background-color: ${pattern.color}"></div>
                      <div class="pattern-name">${index + 1}. ${pattern.name}</div>
                      <div class="criticality-badge criticality-${pattern.criticality}">${pattern.criticality}</div>
                    </div>
                    
                    <div class="pattern-details">
                      <div>
                        <div class="detail-item">
                          <span class="detail-label">Description:</span> ${pattern.description}
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">Priority Level:</span> ${pattern.priority}
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">Business Value:</span> ${patternAnalysis?.businessValue || 'Not assessed'}
                        </div>
                      </div>
                      <div>
                        <div class="detail-item">
                          <span class="detail-label">Nodes Affected:</span> ${patternAnalysis?.nodeIds.length || 0}
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">Health Score:</span> ${patternAnalysis?.healthScore.toFixed(1) || 'N/A'}%
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">Criticality Score:</span> ${patternAnalysis?.criticalityScore.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    ${patternAnalysis?.recommendations && patternAnalysis.recommendations.length > 0 ? `
                      <div class="recommendations">
                        <h4>Strategic Recommendations</h4>
                        <ul>
                          ${patternAnalysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    
                    ${pattern.riskFactors.length > 0 ? `
                      <div class="risk-factors">
                        <h4>Identified Risk Factors</h4>
                        <ul>
                          ${pattern.riskFactors.map(risk => `<li>${risk}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    
                    ${affectedNodes.length > 0 ? `
                      <div class="schema-details">
                        <h4>Affected Schema Elements (${affectedNodes.length} items)</h4>
                        <table class="schema-table">
                          <thead>
                            <tr>
                              <th>Node Name</th>
                              <th>Type</th>
                              <th>Description</th>
                              <th>Row Count</th>
                              <th>Column Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${affectedNodes.slice(0, 10).map(node => `
                              <tr>
                                <td>${node.name}</td>
                                <td>${node.type}</td>
                                <td>${node.metadata?.description || 'N/A'}</td>
                                <td>${node.metadata?.rowCount || 'N/A'}</td>
                                <td>${node.metadata?.columnCount || 'N/A'}</td>
                              </tr>
                            `).join('')}
                            ${affectedNodes.length > 10 ? `
                              <tr>
                                <td colspan="5" style="text-align: center; font-style: italic;">
                                  ... and ${affectedNodes.length - 10} more schema elements
                                </td>
                              </tr>
                            ` : ''}
                          </tbody>
                        </table>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `
            }).join('')}
          </div>

          <div class="section page-break">
            <div class="section-title">Risk Assessment & Impact Analysis</div>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${criticalPatterns.length}</div>
                <div class="metric-label">Critical Risk</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${highRiskPatterns.length}</div>
                <div class="metric-label">High Risk</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${selectedPatterns.filter(p => p.criticality === 'medium').length}</div>
                <div class="metric-label">Medium Risk</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${selectedPatterns.filter(p => p.criticality === 'low').length}</div>
                <div class="metric-label">Low Risk</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Technical Specifications</div>
            <div class="schema-details">
              <div class="detail-item">
                <span class="detail-label">Report Type:</span> ${config.reportType.replace('-', ' ').toUpperCase()}
              </div>
              <div class="detail-item">
                <span class="detail-label">Analysis Engine:</span> DataWave Enterprise Schema Analyzer v2.0
              </div>
              <div class="detail-item">
                <span class="detail-label">Analysis Depth:</span> ${config.analysisDepth.toUpperCase()}
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Patterns Discovered:</span> ${patterns.length}
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Schema Nodes:</span> ${nodes.length}
              </div>
              <div class="detail-item">
                <span class="detail-label">Selected Patterns:</span> ${selectedPatterns.length}
              </div>
              <div class="detail-item">
                <span class="detail-label">Affected Schema Elements:</span> ${totalNodes}
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>DataWave Enterprise Schema Analyzer</strong></p>
            <p>Advanced Data Discovery & Pattern Recognition Platform</p>
            <p>Report generated on ${reportDate} | Confidential Document</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateScreenshotSections(graphElement?: HTMLElement, chartElement?: HTMLElement): string {
    let screenshotSections = ''

    // Graph Screenshot Section
    if (graphElement) {
      try {
        console.log('🎯 GENERATING GRAPH SCREENSHOT FOR HTML REPORT')
        let graphImageData = ''
        
        if (graphElement.tagName === 'CANVAS') {
          const canvas = graphElement as HTMLCanvasElement
          graphImageData = canvas.toDataURL('image/png', 1.0)
          console.log('✅ Graph canvas captured for HTML report')
        } else {
          console.log('⚠️ Graph element is not a canvas, skipping screenshot')
        }

        if (graphImageData && graphImageData !== 'data:,') {
          screenshotSections += `
            <div class="section">
              <div class="section-title">Graph Visualization</div>
              <div class="screenshot-container">
                <img src="${graphImageData}" alt="Graph Visualization" class="screenshot-image" />
                <div class="screenshot-caption">
                  Graph visualization showing schema relationships and pattern connections
                </div>
              </div>
            </div>
          `
        }
      } catch (error) {
        console.error('❌ Failed to capture graph screenshot for HTML:', error)
      }
    }

    // Chart Screenshot Section
    if (chartElement) {
      try {
        console.log('🎯 GENERATING CHART SCREENSHOT FOR HTML REPORT')
        let chartImageData = ''
        
        if (chartElement.tagName === 'CANVAS') {
          const canvas = chartElement as HTMLCanvasElement
          chartImageData = canvas.toDataURL('image/png', 1.0)
          console.log('✅ Chart canvas captured for HTML report')
        } else {
          console.log('⚠️ Chart element is not a canvas, skipping screenshot')
        }

        if (chartImageData && chartImageData !== 'data:,') {
          screenshotSections += `
            <div class="section">
              <div class="section-title">Chart Analysis</div>
              <div class="screenshot-container">
                <img src="${chartImageData}" alt="Chart Analysis" class="screenshot-image" />
                <div class="screenshot-caption">
                  Line chart showing pattern criticality trends over time
                </div>
              </div>
            </div>
          `
        }
      } catch (error) {
        console.error('❌ Failed to capture chart screenshot for HTML:', error)
      }
    }

    return screenshotSections
  }
}
