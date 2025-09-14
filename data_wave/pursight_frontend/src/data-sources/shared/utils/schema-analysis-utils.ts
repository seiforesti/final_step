// Schema Analysis Utilities for Advanced Pattern Classification and Lifecycle Analysis

export interface SchemaPattern {
  id: string
  name: string
  color: string
  criticality: 'low' | 'medium' | 'high' | 'critical'
  priority: number
  description: string
  riskFactors: string[]
  mitigationStrategies: string[]
  category: 'security' | 'compliance' | 'performance' | 'data-quality' | 'architecture' | 'business'
}

export interface SchemaAnalysis {
  patternId: string
  nodeIds: string[]
  criticalityScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  healthScore: number
  lifecycleStage: 'development' | 'testing' | 'production' | 'deprecated' | 'archived'
  lastAnalyzed: Date
  recommendations: string[]
  impactScore: number
  businessValue: 'low' | 'medium' | 'high' | 'critical'
}

export interface LineChartData {
  patternId: string
  patternName: string
  color: string
  criticality: 'low' | 'medium' | 'high' | 'critical'
  dataPoints: {
    timestamp: Date
    value: number
    healthScore: number
    riskLevel: number
    criticalityScore: number
    businessImpact: number
  }[]
  trend: 'improving' | 'stable' | 'declining' | 'critical'
  priority: number
  currentValue: number
  averageValue: number
  peakValue: number
  lowValue: number
}

export interface GraphNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  patterns?: string[]
  criticalityScore?: number
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  healthScore?: number
  lifecycleStage?: 'development' | 'testing' | 'production' | 'deprecated' | 'archived'
  highlightColor?: string
  connectionStrength?: number
  isHighlighted?: boolean
  metadata?: {
    description?: string
    [key: string]: any
  }
}

// Default Schema Patterns with Advanced Classification
export const DEFAULT_SCHEMA_PATTERNS: SchemaPattern[] = [
  {
    id: 'pii',
    name: 'PII Data',
    color: '#ef4444',
    criticality: 'critical',
    priority: 1,
    description: 'Personally Identifiable Information requiring immediate protection',
    riskFactors: ['Data breach', 'Privacy violation', 'GDPR compliance', 'Identity theft'],
    mitigationStrategies: ['Encryption', 'Access control', 'Data masking', 'Audit logging'],
    category: 'compliance'
  },
  {
    id: 'security',
    name: 'Security',
    color: '#f97316',
    criticality: 'high',
    priority: 2,
    description: 'Security-related data and access controls',
    riskFactors: ['Unauthorized access', 'Data theft', 'System compromise', 'Privilege escalation'],
    mitigationStrategies: ['Authentication', 'Authorization', 'Audit logging', 'Security monitoring'],
    category: 'security'
  },
  {
    id: 'performance',
    name: 'Performance',
    color: '#eab308',
    criticality: 'medium',
    priority: 3,
    description: 'Performance optimization patterns and bottlenecks',
    riskFactors: ['Slow queries', 'Resource exhaustion', 'Poor scalability', 'Memory leaks'],
    mitigationStrategies: ['Indexing', 'Query optimization', 'Caching', 'Resource monitoring'],
    category: 'performance'
  },
  {
    id: 'data-quality',
    name: 'Data Quality',
    color: '#22c55e',
    criticality: 'medium',
    priority: 4,
    description: 'Data quality and integrity patterns',
    riskFactors: ['Data inconsistency', 'Invalid data', 'Missing values', 'Data corruption'],
    mitigationStrategies: ['Validation', 'Data cleansing', 'Monitoring', 'Quality gates'],
    category: 'data-quality'
  },
  {
    id: 'compliance',
    name: 'Compliance',
    color: '#3b82f6',
    criticality: 'high',
    priority: 2,
    description: 'Regulatory compliance patterns (GDPR, SOX, HIPAA)',
    riskFactors: ['Regulatory violation', 'Audit failure', 'Legal issues', 'Fines'],
    mitigationStrategies: ['Data retention', 'Audit trails', 'Compliance monitoring', 'Documentation'],
    category: 'compliance'
  },
  {
    id: 'architecture',
    name: 'Architecture',
    color: '#8b5cf6',
    criticality: 'low',
    priority: 5,
    description: 'Database architecture and design patterns',
    riskFactors: ['Poor design', 'Maintenance issues', 'Scalability problems', 'Technical debt'],
    mitigationStrategies: ['Design patterns', 'Documentation', 'Refactoring', 'Code reviews'],
    category: 'architecture'
  },
  {
    id: 'business-critical',
    name: 'Business Critical',
    color: '#dc2626',
    criticality: 'critical',
    priority: 1,
    description: 'Business-critical data and processes',
    riskFactors: ['Business disruption', 'Revenue loss', 'Customer impact', 'Operational failure'],
    mitigationStrategies: ['High availability', 'Disaster recovery', 'Monitoring', 'Backup strategies'],
    category: 'business'
  }
]

// Schema Analysis Engine
export class SchemaAnalysisEngine {
  private patterns: SchemaPattern[] = []
  private analysis: SchemaAnalysis[] = []
  private lineChartData: LineChartData[] = []

  constructor(patterns: SchemaPattern[] = DEFAULT_SCHEMA_PATTERNS) {
    this.patterns = patterns
  }

  // Analyze schema nodes for pattern classification
  analyzeSchemaNodes(nodes: GraphNode[]): void {
    this.analysis = []
    
    nodes.forEach(node => {
      const patterns = this.classifyNodePatterns(node)
      node.patterns = patterns
      
      patterns.forEach(patternId => {
        const existingAnalysis = this.analysis.find(a => a.patternId === patternId)
        
        if (existingAnalysis) {
          existingAnalysis.nodeIds.push(node.id)
        } else {
          const pattern = this.patterns.find(p => p.id === patternId)
          if (pattern) {
            this.analysis.push({
              patternId,
              nodeIds: [node.id],
              criticalityScore: this.calculateCriticalityScore(node, pattern),
              riskLevel: this.determineRiskLevel(node, pattern),
              healthScore: this.calculateHealthScore(node, pattern),
              lifecycleStage: this.determineLifecycleStage(node),
              lastAnalyzed: new Date(),
              recommendations: this.generateRecommendations(node, pattern),
              impactScore: this.calculateImpactScore(node, pattern),
              businessValue: this.determineBusinessValue(node, pattern)
            })
          }
        }
      })
    })

    this.generateLineChartData()
  }

  // Classify node patterns based on name, type, and metadata
  private classifyNodePatterns(node: GraphNode): string[] {
    const patterns: string[] = []
    
    // PII Pattern Detection
    if (this.isPIIPattern(node)) {
      patterns.push('pii')
    }
    
    // Security Pattern Detection
    if (this.isSecurityPattern(node)) {
      patterns.push('security')
    }
    
    // Performance Pattern Detection
    if (this.isPerformancePattern(node)) {
      patterns.push('performance')
    }
    
    // Data Quality Pattern Detection
    if (this.isDataQualityPattern(node)) {
      patterns.push('data-quality')
    }
    
    // Compliance Pattern Detection
    if (this.isCompliancePattern(node)) {
      patterns.push('compliance')
    }
    
    // Architecture Pattern Detection
    if (this.isArchitecturePattern(node)) {
      patterns.push('architecture')
    }
    
    // Business Critical Pattern Detection
    if (this.isBusinessCriticalPattern(node)) {
      patterns.push('business-critical')
    }
    
    return patterns
  }

  // Pattern Detection Methods
  private isPIIPattern(node: GraphNode): boolean {
    const piiKeywords = [
      'email', 'phone', 'ssn', 'address', 'name', 'birth', 'personal', 
      'user_id', 'customer_id', 'passport', 'license', 'credit_card',
      'social_security', 'tax_id', 'national_id', 'drivers_license'
    ]
    return this.hasKeywords(node, piiKeywords)
  }

  private isSecurityPattern(node: GraphNode): boolean {
    const securityKeywords = [
      'password', 'token', 'key', 'secret', 'auth', 'permission', 
      'role', 'access', 'login', 'session', 'credential', 'hash',
      'encrypt', 'decrypt', 'signature', 'certificate'
    ]
    return this.hasKeywords(node, securityKeywords)
  }

  private isPerformancePattern(node: GraphNode): boolean {
    const performanceKeywords = [
      'index', 'constraint', 'trigger', 'view', 'cache', 'temp', 
      'log', 'audit', 'backup', 'archive', 'partition', 'shard'
    ]
    return this.hasKeywords(node, performanceKeywords)
  }

  private isDataQualityPattern(node: GraphNode): boolean {
    const qualityKeywords = [
      'audit', 'log', 'history', 'backup', 'version', 'migration', 
      'validation', 'check', 'verify', 'clean', 'scrub', 'normalize'
    ]
    return this.hasKeywords(node, qualityKeywords)
  }

  private isCompliancePattern(node: GraphNode): boolean {
    const complianceKeywords = [
      'gdpr', 'sox', 'hipaa', 'pci', 'audit', 'compliance', 
      'retention', 'privacy', 'consent', 'opt_in', 'opt_out'
    ]
    return this.hasKeywords(node, complianceKeywords)
  }

  private isArchitecturePattern(node: GraphNode): boolean {
    const architectureKeywords = [
      'schema', 'database', 'table', 'view', 'function', 
      'procedure', 'sequence', 'trigger', 'package', 'type'
    ]
    return this.hasKeywords(node, architectureKeywords)
  }

  private isBusinessCriticalPattern(node: GraphNode): boolean {
    const businessKeywords = [
      'order', 'payment', 'transaction', 'customer', 'product', 
      'inventory', 'sales', 'revenue', 'financial', 'accounting',
      'billing', 'invoice', 'contract', 'agreement'
    ]
    return this.hasKeywords(node, businessKeywords)
  }

  private hasKeywords(node: GraphNode, keywords: string[]): boolean {
    const searchText = `${node.name} ${node.metadata?.description || ''}`.toLowerCase()
    return keywords.some(keyword => searchText.includes(keyword))
  }

  // Scoring and Analysis Methods
  private calculateCriticalityScore(node: GraphNode, pattern: SchemaPattern): number {
    let score = 0
    
    // Base score from node type
    switch (node.type) {
      case 'database': score += 20; break
      case 'schema': score += 15; break
      case 'table': score += 10; break
      case 'view': score += 8; break
      case 'column': score += 5; break
    }
    
    // Pattern criticality scoring
    switch (pattern.criticality) {
      case 'critical': score += 30; break
      case 'high': score += 20; break
      case 'medium': score += 10; break
      case 'low': score += 5; break
    }
    
    // Metadata-based scoring
    if (node.metadata?.importance) {
      score += node.metadata.importance * 2
    }
    
    return Math.min(100, Math.max(0, score))
  }

  private determineRiskLevel(node: GraphNode, pattern: SchemaPattern): 'low' | 'medium' | 'high' | 'critical' {
    const score = this.calculateCriticalityScore(node, pattern)
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  private calculateHealthScore(node: GraphNode, pattern: SchemaPattern): number {
    let score = 100
    
    // Reduce score based on risk level
    const riskLevel = this.determineRiskLevel(node, pattern)
    switch (riskLevel) {
      case 'critical': score -= 40; break
      case 'high': score -= 25; break
      case 'medium': score -= 15; break
      case 'low': score -= 5; break
    }
    
    // Reduce score based on metadata quality
    if (node.metadata?.quality) {
      score = Math.min(score, node.metadata.quality)
    }
    
    return Math.max(0, score)
  }

  private determineLifecycleStage(node: GraphNode): 'development' | 'testing' | 'production' | 'deprecated' | 'archived' {
    const name = node.name.toLowerCase()
    
    if (name.includes('test') || name.includes('dev') || name.includes('staging')) {
      return 'testing'
    }
    if (name.includes('deprecated') || name.includes('old') || name.includes('legacy')) {
      return 'deprecated'
    }
    if (name.includes('archive') || name.includes('backup') || name.includes('history')) {
      return 'archived'
    }
    if (name.includes('prod') || name.includes('live') || name.includes('active')) {
      return 'production'
    }
    
    return 'production' // Default to production
  }

  private calculateImpactScore(node: GraphNode, pattern: SchemaPattern): number {
    let score = 0
    
    // Business impact based on pattern
    switch (pattern.category) {
      case 'business': score += 40; break
      case 'compliance': score += 35; break
      case 'security': score += 30; break
      case 'data-quality': score += 20; break
      case 'performance': score += 15; break
      case 'architecture': score += 10; break
    }
    
    // Node type impact
    switch (node.type) {
      case 'database': score += 20; break
      case 'schema': score += 15; break
      case 'table': score += 10; break
      case 'view': score += 8; break
      case 'column': score += 5; break
    }
    
    return Math.min(100, Math.max(0, score))
  }

  private determineBusinessValue(node: GraphNode, pattern: SchemaPattern): 'low' | 'medium' | 'high' | 'critical' {
    const impactScore = this.calculateImpactScore(node, pattern)
    if (impactScore >= 80) return 'critical'
    if (impactScore >= 60) return 'high'
    if (impactScore >= 40) return 'medium'
    return 'low'
  }

  private generateRecommendations(node: GraphNode, pattern: SchemaPattern): string[] {
    const recommendations: string[] = []
    
    // Pattern-specific recommendations
    recommendations.push(...pattern.mitigationStrategies)
    
    // Node-specific recommendations
    if (node.type === 'column' && pattern.id === 'pii') {
      recommendations.push('Implement column-level encryption')
      recommendations.push('Add data masking for non-production environments')
    }
    
    if (node.type === 'table' && pattern.id === 'security') {
      recommendations.push('Implement row-level security policies')
      recommendations.push('Add audit triggers for data access')
    }
    
    return recommendations
  }

  // Generate Line Chart Data
  private generateLineChartData(): void {
    this.lineChartData = this.patterns.map(pattern => {
      const patternAnalysis = this.analysis.find(a => a.patternId === pattern.id)
      const nodeCount = patternAnalysis?.nodeIds.length || 0
      
      // Generate 30 days of historical data
      const dataPoints = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        
        // Simulate realistic data with trends
        const baseValue = nodeCount * 10
        const trend = this.calculateTrend(pattern, i)
        const variation = (Math.random() - 0.5) * 20
        const value = Math.max(0, baseValue + trend + variation)
        
        return {
          timestamp: date,
          value: Math.round(value),
          healthScore: Math.max(0, 100 - (value / 10)),
          riskLevel: Math.min(100, value / 5),
          criticalityScore: Math.min(100, value / 3),
          businessImpact: Math.min(100, value / 4)
        }
      })
      
      const values = dataPoints.map(d => d.value)
      const currentValue = values[values.length - 1]
      const averageValue = values.reduce((a, b) => a + b, 0) / values.length
      const peakValue = Math.max(...values)
      const lowValue = Math.min(...values)
      
      return {
        patternId: pattern.id,
        patternName: pattern.name,
        color: pattern.color,
        criticality: pattern.criticality,
        dataPoints,
        trend: this.determineTrend(values),
        priority: pattern.priority,
        currentValue,
        averageValue,
        peakValue,
        lowValue
      }
    })
  }

  private calculateTrend(pattern: SchemaPattern, dayIndex: number): number {
    // Different patterns have different trends
    switch (pattern.id) {
      case 'pii':
        return dayIndex * 0.5 // PII issues tend to increase
      case 'security':
        return dayIndex * 0.3 // Security concerns grow
      case 'performance':
        return -dayIndex * 0.2 // Performance issues being addressed
      case 'data-quality':
        return dayIndex * 0.1 // Data quality concerns
      case 'compliance':
        return dayIndex * 0.4 // Compliance requirements increase
      case 'architecture':
        return -dayIndex * 0.1 // Architecture improvements
      case 'business-critical':
        return dayIndex * 0.6 // Business critical items grow
      default:
        return 0
    }
  }

  private determineTrend(values: number[]): 'improving' | 'stable' | 'declining' | 'critical' {
    if (values.length < 2) return 'stable'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100
    
    if (change > 20) return 'critical'
    if (change > 10) return 'declining'
    if (change < -10) return 'improving'
    return 'stable'
  }

  // Public Methods
  getPatterns(): SchemaPattern[] {
    return this.patterns
  }

  getAnalysis(): SchemaAnalysis[] {
    return this.analysis
  }

  getLineChartData(): LineChartData[] {
    return this.lineChartData
  }

  getPatternById(patternId: string): SchemaPattern | undefined {
    return this.patterns.find(p => p.id === patternId)
  }

  getAnalysisByPattern(patternId: string): SchemaAnalysis | undefined {
    return this.analysis.find(a => a.patternId === patternId)
  }

  getNodesByPattern(patternId: string, allNodes: GraphNode[]): GraphNode[] {
    const analysis = this.getAnalysisByPattern(patternId)
    if (!analysis) return []
    
    return allNodes.filter(node => analysis.nodeIds.includes(node.id))
  }

  // Generate comprehensive report
  generateReport(selectedPatterns: string[] = []): any {
    const patternsToAnalyze = selectedPatterns.length > 0 
      ? this.patterns.filter(p => selectedPatterns.includes(p.id))
      : this.patterns

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalPatterns: patternsToAnalyze.length,
        criticalPatterns: patternsToAnalyze.filter(p => p.criticality === 'critical').length,
        highRiskPatterns: patternsToAnalyze.filter(p => p.criticality === 'high').length,
        totalAnalysis: this.analysis.length,
        averageHealthScore: this.analysis.reduce((sum, a) => sum + a.healthScore, 0) / this.analysis.length,
        averageCriticalityScore: this.analysis.reduce((sum, a) => sum + a.criticalityScore, 0) / this.analysis.length
      },
      patterns: patternsToAnalyze.map(pattern => {
        const analysis = this.getAnalysisByPattern(pattern.id)
        return {
          pattern,
          analysis,
          lineChartData: this.lineChartData.find(l => l.patternId === pattern.id),
          recommendations: analysis?.recommendations || []
        }
      }),
      trends: this.lineChartData.map(data => ({
        patternId: data.patternId,
        patternName: data.patternName,
        trend: data.trend,
        currentValue: data.currentValue,
        averageValue: data.averageValue,
        peakValue: data.peakValue,
        lowValue: data.lowValue
      }))
    }
  }
}

// Utility functions
export const getPatternColor = (patternId: string, patterns: SchemaPattern[]): string => {
  const pattern = patterns.find(p => p.id === patternId)
  return pattern?.color || '#6b7280'
}

export const getCriticalityColor = (criticality: string): string => {
  switch (criticality) {
    case 'critical': return '#dc2626'
    case 'high': return '#ea580c'
    case 'medium': return '#d97706'
    case 'low': return '#16a34a'
    default: return '#6b7280'
  }
}

export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'critical': return '#dc2626'
    case 'high': return '#ea580c'
    case 'medium': return '#d97706'
    case 'low': return '#16a34a'
    default: return '#6b7280'
  }
}

export const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculatePatternConnections = (nodes: GraphNode[], patternId: string): string[] => {
  return nodes
    .filter(node => node.patterns?.includes(patternId))
    .map(node => node.id)
}
