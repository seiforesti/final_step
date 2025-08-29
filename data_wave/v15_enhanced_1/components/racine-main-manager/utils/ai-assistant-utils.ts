// ai-assistant-utils.ts
// Utility functions for AI Assistant component in Racine Main Manager

export interface AIAssistantMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
  attachments?: AIAssistantAttachment[];
  suggestions?: string[];
  confidence?: number;
}

export interface AIAssistantAttachment {
  id: string;
  type: 'file' | 'image' | 'code' | 'data';
  name: string;
  url?: string;
  content?: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface AIAssistantContext {
  userId: string;
  sessionId: string;
  workspaceId?: string;
  currentPage?: string;
  userRole?: string;
  permissions?: string[];
  recentActions?: string[];
  systemState?: Record<string, any>;
}

export interface AIAssistantConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  enableStreaming: boolean;
  enableSuggestions: boolean;
  enableContextAwareness: boolean;
  enableCodeAnalysis: boolean;
  enableDataInsights: boolean;
  enableWorkflowAssistance: boolean;
}

export interface AIAssistantResponse {
  message: AIAssistantMessage;
  suggestions?: string[];
  actions?: AIAssistantAction[];
  insights?: AIAssistantInsight[];
  confidence: number;
  processingTime: number;
}

export interface AIAssistantAction {
  id: string;
  type: 'navigate' | 'execute' | 'analyze' | 'optimize' | 'configure';
  title: string;
  description: string;
  parameters?: Record<string, any>;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

export interface AIAssistantInsight {
  id: string;
  type: 'performance' | 'security' | 'optimization' | 'trend' | 'anomaly';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, any>;
  recommendations?: string[];
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format message content for display
 */
export function formatMessageContent(content: string): string {
  // Basic formatting for code blocks, links, etc.
  return content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
}

/**
 * Extract code blocks from message content
 */
export function extractCodeBlocks(content: string): Array<{ language: string; code: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2]
    });
  }

  return blocks;
}

/**
 * Analyze user intent from message content
 */
export function analyzeUserIntent(content: string): {
  intent: 'question' | 'command' | 'analysis' | 'optimization' | 'help' | 'general';
  confidence: number;
  entities: string[];
  actions: string[];
} {
  const lowerContent = content.toLowerCase();
  
  // Intent classification
  let intent: 'question' | 'command' | 'analysis' | 'optimization' | 'help' | 'general' = 'general';
  let confidence = 0.5;
  
  // Question detection
  if (lowerContent.includes('?') || 
      lowerContent.includes('what') || 
      lowerContent.includes('how') || 
      lowerContent.includes('why') ||
      lowerContent.includes('when') ||
      lowerContent.includes('where')) {
    intent = 'question';
    confidence = 0.8;
  }
  
  // Command detection
  if (lowerContent.includes('show') || 
      lowerContent.includes('display') || 
      lowerContent.includes('create') || 
      lowerContent.includes('delete') ||
      lowerContent.includes('update') ||
      lowerContent.includes('run') ||
      lowerContent.includes('execute')) {
    intent = 'command';
    confidence = 0.7;
  }
  
  // Analysis detection
  if (lowerContent.includes('analyze') || 
      lowerContent.includes('examine') || 
      lowerContent.includes('review') || 
      lowerContent.includes('investigate') ||
      lowerContent.includes('check') ||
      lowerContent.includes('verify')) {
    intent = 'analysis';
    confidence = 0.8;
  }
  
  // Optimization detection
  if (lowerContent.includes('optimize') || 
      lowerContent.includes('improve') || 
      lowerContent.includes('enhance') || 
      lowerContent.includes('fix') ||
      lowerContent.includes('resolve') ||
      lowerContent.includes('tune')) {
    intent = 'optimization';
    confidence = 0.7;
  }
  
  // Help detection
  if (lowerContent.includes('help') || 
      lowerContent.includes('support') || 
      lowerContent.includes('guide') || 
      lowerContent.includes('assist') ||
      lowerContent.includes('tutorial')) {
    intent = 'help';
    confidence = 0.9;
  }
  
  // Entity extraction
  const entities = extractEntities(lowerContent);
  
  // Action extraction
  const actions = extractActions(lowerContent);
  
  return {
    intent,
    confidence,
    entities,
    actions
  };
}

/**
 * Extract entities from user input
 */
function extractEntities(content: string): string[] {
  const entities: string[] = [];
  
  // Extract potential entity patterns
  const entityPatterns = [
    /\b\d{4}-\d{2}-\d{2}\b/g, // Dates
    /\b\d+\.\d+\.\d+\b/g, // Version numbers
    /\b[A-Z]{2,}\b/g, // Acronyms
    /\b[a-z]+_[a-z]+\b/g, // Snake case
    /\b[A-Z][a-z]+[A-Z][a-z]+\b/g // Camel case
  ];
  
  entityPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      entities.push(...matches);
    }
  });
  
  return [...new Set(entities)];
}

/**
 * Extract potential actions from user input
 */
function extractActions(content: string): string[] {
  const actions: string[] = [];
  
  const actionKeywords = [
    'show', 'display', 'create', 'delete', 'update', 'run', 'execute',
    'analyze', 'examine', 'review', 'investigate', 'check', 'verify',
    'optimize', 'improve', 'enhance', 'fix', 'resolve', 'tune',
    'help', 'support', 'guide', 'assist', 'tutorial'
  ];
  
  actionKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      actions.push(keyword);
    }
  });
  
  return actions;
}

/**
 * Extract links from message content
 */
export function extractLinks(content: string): Array<{ text: string; url: string }> {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: Array<{ text: string; url: string }> = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }

  return links;
}

/**
 * Analyze message sentiment
 */
export function analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'awesome'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'frustrating', 'error'];

  const words = content.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Generate contextual suggestions based on user input
 */
export function generateSuggestions(
  userInput: string,
  context: AIAssistantContext,
  recentMessages: AIAssistantMessage[]
): string[] {
  const suggestions: string[] = [];

  // Common suggestions based on input keywords
  if (userInput.toLowerCase().includes('performance')) {
    suggestions.push('Analyze system performance metrics');
    suggestions.push('Check for performance bottlenecks');
    suggestions.push('Generate performance optimization recommendations');
  }

  if (userInput.toLowerCase().includes('error') || userInput.toLowerCase().includes('issue')) {
    suggestions.push('Check error logs and diagnostics');
    suggestions.push('Analyze error patterns and trends');
    suggestions.push('Generate error resolution steps');
  }

  if (userInput.toLowerCase().includes('data') || userInput.toLowerCase().includes('source')) {
    suggestions.push('Analyze data source health and status');
    suggestions.push('Check data quality metrics');
    suggestions.push('Generate data governance recommendations');
  }

  if (userInput.toLowerCase().includes('security')) {
    suggestions.push('Run security audit and analysis');
    suggestions.push('Check compliance status');
    suggestions.push('Generate security recommendations');
  }

  // Context-aware suggestions
  if (context.currentPage?.includes('dashboard')) {
    suggestions.push('Customize dashboard layout');
    suggestions.push('Add new dashboard widgets');
    suggestions.push('Generate dashboard insights');
  }

  if (context.currentPage?.includes('data-sources')) {
    suggestions.push('Add new data source');
    suggestions.push('Configure data source settings');
    suggestions.push('Test data source connection');
  }

  // Recent activity suggestions
  if (recentMessages.length > 0) {
    const lastMessage = recentMessages[recentMessages.length - 1];
    if (lastMessage.content.includes('performance')) {
      suggestions.push('Continue performance analysis');
      suggestions.push('Generate detailed performance report');
    }
  }

  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Calculate response confidence based on various factors
 */
export function calculateConfidence(
  response: AIAssistantResponse,
  context: AIAssistantContext
): number {
  let confidence = 0.5; // Base confidence

  // Adjust based on response quality
  if (response.message.content.length > 100) confidence += 0.1;
  if (response.suggestions && response.suggestions.length > 0) confidence += 0.1;
  if (response.actions && response.actions.length > 0) confidence += 0.1;
  if (response.insights && response.insights.length > 0) confidence += 0.1;

  // Adjust based on context relevance
  if (context.currentPage && response.message.content.includes(context.currentPage)) {
    confidence += 0.1;
  }

  // Adjust based on user role and permissions
  if (context.userRole === 'admin' && response.actions?.some(a => a.type === 'configure')) {
    confidence += 0.1;
  }

  // Adjust based on processing time (faster is better, but not too fast)
  if (response.processingTime > 100 && response.processingTime < 5000) {
    confidence += 0.05;
  }

  return Math.min(confidence, 1.0); // Cap at 1.0
}

/**
 * Validate AI Assistant configuration
 */
export function validateConfig(config: AIAssistantConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.model) errors.push('Model is required');
  if (config.temperature < 0 || config.temperature > 2) {
    errors.push('Temperature must be between 0 and 2');
  }
  if (config.maxTokens < 1 || config.maxTokens > 10000) {
    errors.push('Max tokens must be between 1 and 10000');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format processing time for display
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Generate action impact assessment
 */
export function assessActionImpact(action: AIAssistantAction): {
  risk: 'low' | 'medium' | 'high';
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: string;
} {
  let risk: 'low' | 'medium' | 'high' = 'low';
  let complexity: 'low' | 'medium' | 'high' = 'low';
  let estimatedTime = '5 minutes';

  // Assess based on action type
  switch (action.type) {
    case 'navigate':
      risk = 'low';
      complexity = 'low';
      estimatedTime = '1 minute';
      break;
    case 'execute':
      risk = action.impact === 'high' ? 'high' : 'medium';
      complexity = 'medium';
      estimatedTime = '10 minutes';
      break;
    case 'analyze':
      risk = 'low';
      complexity = 'medium';
      estimatedTime = '15 minutes';
      break;
    case 'optimize':
      risk = 'medium';
      complexity = 'high';
      estimatedTime = '30 minutes';
      break;
    case 'configure':
      risk = 'high';
      complexity = 'high';
      estimatedTime = '45 minutes';
      break;
  }

  // Adjust based on confidence
  if (action.confidence < 0.7) {
    risk = risk === 'low' ? 'medium' : risk;
    complexity = complexity === 'low' ? 'medium' : complexity;
  }

  return { risk, complexity, estimatedTime };
}

/**
 * Generate insight recommendations
 */
export function generateInsightRecommendations(insight: AIAssistantInsight): string[] {
  const recommendations: string[] = [];

  switch (insight.type) {
    case 'performance':
      recommendations.push('Monitor system resources');
      recommendations.push('Optimize query performance');
      recommendations.push('Scale infrastructure if needed');
      break;
    case 'security':
      recommendations.push('Review access controls');
      recommendations.push('Update security policies');
      recommendations.push('Run security audit');
      break;
    case 'optimization':
      recommendations.push('Implement suggested optimizations');
      recommendations.push('Monitor performance improvements');
      recommendations.push('Document optimization changes');
      break;
    case 'trend':
      recommendations.push('Continue monitoring trends');
      recommendations.push('Set up trend alerts');
      recommendations.push('Plan for trend continuation');
      break;
    case 'anomaly':
      recommendations.push('Investigate anomaly cause');
      recommendations.push('Set up anomaly detection');
      recommendations.push('Document anomaly response');
      break;
  }

  return recommendations;
}

/**
 * Handle anomaly response and generate appropriate actions
 */
export function handleAnomalyResponse(anomaly: any, context: any): AIAssistantAction[] {
  const actions: AIAssistantAction[] = [];
  
  // Analyze anomaly severity and type
  const severity = anomaly.severity || 'medium';
  const type = anomaly.type || 'unknown';
  
  // Generate appropriate actions based on anomaly type
  switch (type) {
    case 'performance':
      actions.push({
        id: `action-${Date.now()}-1`,
        type: 'analyze',
        title: 'Analyze Performance Impact',
        description: 'Investigate the performance anomaly and identify root cause',
        confidence: 0.8,
        impact: severity === 'high' ? 'high' : 'medium'
      });
      break;
    case 'security':
      actions.push({
        id: `action-${Date.now()}-2`,
        type: 'execute',
        title: 'Security Response',
        description: 'Execute immediate security response procedures',
        confidence: 0.9,
        impact: 'high'
      });
      break;
    case 'data-quality':
      actions.push({
        id: `action-${Date.now()}-3`,
        type: 'optimize',
        title: 'Data Quality Check',
        description: 'Run comprehensive data quality assessment',
        confidence: 0.7,
        impact: 'medium'
      });
      break;
  }
  
  return actions;
}

/**
 * Calculate context relevance for AI responses
 */
export function calculateContextRelevance(userContext: any, systemContext: any): number {
  let relevance = 0.5; // Base relevance
  
  // Check user role alignment
  if (userContext.userRole && systemContext.requiredRole) {
    if (userContext.userRole === systemContext.requiredRole) {
      relevance += 0.2;
    }
  }
  
  // Check workspace alignment
  if (userContext.workspaceId && systemContext.workspaceId) {
    if (userContext.workspaceId === systemContext.workspaceId) {
      relevance += 0.15;
    }
  }
  
  // Check permission alignment
  if (userContext.permissions && systemContext.requiredPermissions) {
    const hasRequiredPermissions = systemContext.requiredPermissions.every(
      (perm: string) => userContext.permissions.includes(perm)
    );
    if (hasRequiredPermissions) {
      relevance += 0.15;
    }
  }
  
  return Math.min(relevance, 1.0);
}

/**
 * Personalize recommendations based on user context
 */
export function personalizeRecommendations(recommendations: any[], userContext: any): any[] {
  return recommendations.map(rec => ({
    ...rec,
    personalized: true,
    userRelevance: calculateContextRelevance(userContext, rec),
    estimatedValue: rec.impact === 'high' ? 'High' : rec.impact === 'medium' ? 'Medium' : 'Low'
  }));
}

/**
 * Update learning model with user feedback
 */
export function updateLearningModel(feedback: any, currentModel: any): any {
  const updatedModel = { ...currentModel };
  
  // Update confidence scores based on feedback
  if (feedback.accuracy) {
    updatedModel.confidenceAdjustment = (updatedModel.confidenceAdjustment || 0) + 
      (feedback.accuracy - 0.5) * 0.1;
  }
  
  // Update response patterns
  if (feedback.responseType) {
    updatedModel.responsePatterns = updatedModel.responsePatterns || {};
    updatedModel.responsePatterns[feedback.responseType] = 
      (updatedModel.responsePatterns[feedback.responseType] || 0) + 1;
  }
  
  return updatedModel;
}

/**
 * Import workflow from external source
 */
export function prepareWorkflowForImport(workflowData: any, targetWorkspace: string): any {
  const importedWorkflow = {
    ...workflowData,
    id: `imported-${Date.now()}`,
    workspaceId: targetWorkspace,
    importedAt: new Date().toISOString(),
    status: 'draft',
    metadata: {
      ...workflowData.metadata,
      imported: true,
      originalSource: workflowData.source || 'unknown'
    }
  };
  
  return importedWorkflow;
}

/**
 * Calibrate audio input for voice control
 */
export function calibrateAudioInput(audioContext: any, userPreferences: any): any {
  const calibration = {
    sampleRate: audioContext.sampleRate,
    channelCount: audioContext.destination.channelCount,
    userPreferences,
    calibrationData: {
      noiseThreshold: userPreferences.noiseThreshold || -50,
      gainAdjustment: userPreferences.gainAdjustment || 1.0,
      frequencyRange: userPreferences.frequencyRange || [85, 255]
    }
  };
  
  return calibration;
}

/**
 * Detect system anomalies
 */
export function detectSystemAnomalies(systemData: any): any[] {
  // Mock anomaly detection
  const anomalies = [];
  
  // Simulate detecting anomalies based on system data
  if (systemData.cpuUsage > 90) {
    anomalies.push({
      id: `anomaly-${Date.now()}`,
      type: 'performance',
      severity: 'high',
      description: 'High CPU usage detected',
      timestamp: new Date().toISOString(),
      data: { cpuUsage: systemData.cpuUsage }
    });
  }
  
  if (systemData.memoryUsage > 85) {
    anomalies.push({
      id: `anomaly-${Date.now()}-2`,
      type: 'resource',
      severity: 'medium',
      description: 'High memory usage detected',
      timestamp: new Date().toISOString(),
      data: { memoryUsage: systemData.memoryUsage }
    });
  }
  
  return anomalies;
}

/**
 * Analyze user behavior patterns
 */
export function analyzeUserBehaviorPatterns(userData: any, timeRange: any): any[] {
  // Mock behavior pattern analysis
  const patterns = [];
  
  // Simulate analyzing user behavior patterns
  if (userData.interactions && userData.interactions.length > 0) {
    patterns.push({
      id: `pattern-${Date.now()}`,
      type: 'interaction',
      description: 'User interaction pattern detected',
      confidence: 0.85,
      data: {
        totalInteractions: userData.interactions.length,
        averageSessionTime: 1200,
        preferredFeatures: ['dashboard', 'analytics']
      }
    });
  }
  
  return patterns;
}

/**
 * Identify security threats
 */
export function identifySecurityThreats(securityData: any): any[] {
  // Mock security threat identification
  const threats = [];
  
  // Simulate identifying security threats
  if (securityData.failedLogins > 5) {
    threats.push({
      id: `threat-${Date.now()}`,
      type: 'authentication',
      severity: 'high',
      description: 'Multiple failed login attempts detected',
      timestamp: new Date().toISOString(),
      data: { failedLogins: securityData.failedLogins }
    });
  }
  
  return threats;
}

/**
 * Detect performance anomalies
 */
export function detectPerformanceAnomalies(performanceData: any): any[] {
  // Mock performance anomaly detection
  const anomalies = [];
  
  // Simulate detecting performance anomalies
  if (performanceData.responseTime > 5000) {
    anomalies.push({
      id: `perf-anomaly-${Date.now()}`,
      type: 'response_time',
      severity: 'medium',
      description: 'Slow response time detected',
      timestamp: new Date().toISOString(),
      data: { responseTime: performanceData.responseTime }
    });
  }
  
  return anomalies;
}

/**
 * Analyze data quality issues
 */
export function analyzeDataQualityIssues(dataQualityData: any): any[] {
  // Mock data quality analysis
  const issues = [];
  
  // Simulate analyzing data quality issues
  if (dataQualityData.completeness < 0.9) {
    issues.push({
      id: `quality-issue-${Date.now()}`,
      type: 'completeness',
      severity: 'medium',
      description: 'Data completeness below threshold',
      timestamp: new Date().toISOString(),
      data: { completeness: dataQualityData.completeness }
    });
  }
  
  return issues;
}

/**
 * Train detection models
 */
export function trainDetectionModels(modelData: any): any {
  // Mock model training
  return {
    id: `model-${Date.now()}`,
    status: 'training',
    progress: 0,
    accuracy: 0.85,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate anomaly scores
 */
export function calculateAnomalyScores(anomalyData: any): any[] {
  // Mock anomaly score calculation
  return anomalyData.map((anomaly: any) => ({
    ...anomaly,
    score: Math.random() * 100,
    confidence: Math.random() * 1
  }));
}

/**
 * Create baseline profiles
 */
export function createBaselineProfiles(baselineData: any): any[] {
  // Mock baseline profile creation
  return [{
    id: `baseline-${Date.now()}`,
    type: 'system',
    description: 'System baseline profile',
    data: baselineData,
    timestamp: new Date().toISOString()
  }];
}

/**
 * Configure threat detection
 */
export function configureThreatDetection(config: any): any {
  // Mock threat detection configuration
  return {
    id: `config-${Date.now()}`,
    enabled: true,
    sensitivity: config.sensitivity || 'medium',
    rules: config.rules || [],
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate anomaly reports
 */
export function generateAnomalyReports(anomalies: any[]): any {
  // Mock anomaly report generation
  return {
    id: `report-${Date.now()}`,
    anomalies: anomalies.length,
    critical: anomalies.filter((a: any) => a.severity === 'critical').length,
    high: anomalies.filter((a: any) => a.severity === 'high').length,
    medium: anomalies.filter((a: any) => a.severity === 'medium').length,
    low: anomalies.filter((a: any) => a.severity === 'low').length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Validate detection accuracy
 */
export function validateDetectionAccuracy(validationData: any): any {
  // Mock detection accuracy validation
  return {
    accuracy: 0.92,
    precision: 0.89,
    recall: 0.94,
    f1Score: 0.91,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format AI response for display
 */
export function formatAIResponse(response: any): string {
  if (typeof response === 'string') {
    return response;
  }
  
  if (response && response.content) {
    return response.content;
  }
  
  if (response && response.message) {
    return response.message;
  }
  
  return JSON.stringify(response, null, 2);
}

/**
 * Parse natural language input
 */
export function parseNaturalLanguage(input: string): any {
  // Mock natural language parsing
  const intent = {
    type: 'message',
    confidence: 0.85,
    entities: [] as Array<{ type: string; value: string }>,
    actions: []
  };
  
  // Basic keyword detection
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('search') || lowerInput.includes('find')) {
    intent.type = 'search';
    intent.entities.push({ type: 'query', value: input });
  } else if (lowerInput.includes('navigate') || lowerInput.includes('go to')) {
    intent.type = 'navigation';
    intent.entities.push({ type: 'destination', value: input });
  } else if (lowerInput.includes('automate') || lowerInput.includes('workflow')) {
    intent.type = 'automation';
    intent.entities.push({ type: 'action', value: input });
  }
  
  return intent;
}

/**
 * Generate proactive insights
 */
export function generateProactiveInsights(context: any): any[] {
  // Mock proactive insights generation
  const insights = [];
  
  // Generate insights based on context
  if (context.systemHealth && context.systemHealth.cpuUsage > 80) {
    insights.push({
      id: `insight-${Date.now()}`,
      type: 'performance',
      title: 'High CPU Usage Detected',
      description: 'System CPU usage is above 80%. Consider optimizing resource usage.',
      severity: 'warning',
      timestamp: new Date().toISOString(),
      recommendations: [
        'Check for resource-intensive processes',
        'Consider scaling up resources',
        'Optimize database queries'
      ]
    });
  }
  
  if (context.recentActivities && context.recentActivities.length > 10) {
    insights.push({
      id: `insight-${Date.now()}-2`,
      type: 'activity',
      title: 'High Activity Level',
      description: 'Unusually high number of recent activities detected.',
      severity: 'info',
      timestamp: new Date().toISOString(),
      recommendations: [
        'Review activity patterns',
        'Check for automated processes',
        'Monitor for unusual behavior'
      ]
    });
  }
  
  return insights;
}

/**
 * Optimize AI performance
 */
export function optimizeAIPerformance(config: any): any {
  // Mock AI performance optimization
  const optimizations = {
    modelOptimization: {
      enabled: true,
      compression: 'quantized',
      caching: true,
      batchProcessing: true
    },
    responseOptimization: {
      streaming: true,
      chunking: true,
      compression: true
    },
    resourceOptimization: {
      memoryUsage: 'optimized',
      cpuUsage: 'balanced',
      gpuUsage: 'available'
    }
  };
  
  return {
    ...optimizations,
    timestamp: new Date().toISOString(),
    performanceGain: 0.25 // 25% improvement
  };
}

/**
 * Train learning model
 */
export function trainLearningModel(modelId: string, config: any): any {
  // Mock learning model training
  const training = {
    id: `training-${Date.now()}`,
    modelId,
    status: 'running',
    progress: 0,
    startTime: new Date(),
    estimatedDuration: 300000, // 5 minutes
    config,
    logs: []
  };
  
  return training;
}

/**
 * Evaluate model performance
 */
export function evaluateModelPerformance(modelId: string, dataset: any): any {
  // Mock model performance evaluation
  const evaluation = {
    modelId,
    dataset: dataset.name,
    accuracy: 0.85 + Math.random() * 0.1,
    precision: 0.82 + Math.random() * 0.1,
    recall: 0.88 + Math.random() * 0.1,
    f1Score: 0.85 + Math.random() * 0.1,
    auc: 0.90 + Math.random() * 0.08,
    timestamp: new Date().toISOString(),
    duration: 5000 + Math.random() * 10000
  };
  
  return evaluation;
}

/**
 * Generate learning insights
 */
export function generateLearningInsights(context: any): any[] {
  // Mock learning insights generation
  const insights = [];
  
  if (context.models && context.models.length > 0) {
    insights.push({
      id: `insight-${Date.now()}`,
      type: 'performance',
      title: 'Model Performance Trend',
      description: 'Overall model performance is improving by 2.3%',
      severity: 'info',
      confidence: 0.85,
      actionable: true,
      timestamp: new Date().toISOString()
    });
  }
  
  if (context.trainingSessions && context.trainingSessions.length > 5) {
    insights.push({
      id: `insight-${Date.now()}-2`,
      type: 'optimization',
      title: 'Training Optimization Opportunity',
      description: 'Consider adjusting learning rate for faster convergence',
      severity: 'warning',
      confidence: 0.72,
      actionable: true,
      timestamp: new Date().toISOString()
    });
  }
  
  return insights;
}

/**
 * Adapt to user behavior
 */
export function adaptToUserBehavior(userId: string, behaviorData: any): any {
  // Mock user behavior adaptation
  const adaptation = {
    userId,
    adaptations: [] as Array<{
      type: string;
      target: string;
      changes: string[];
      priority: string;
    }>,
    timestamp: new Date().toISOString(),
    confidence: 0.78
  };
  
  if (behaviorData.preferences) {
    adaptation.adaptations.push({
      type: 'personalization',
      target: 'interface',
      changes: ['layout', 'theme', 'features'],
      priority: 'medium'
    });
  }
  
  return adaptation;
}

/**
 * Optimize personalization
 */
export function optimizePersonalization(userId: string, preferences: any): any {
  // Mock personalization optimization
  const optimization = {
    userId,
    optimizations: [] as Array<{
      type: string;
      changes: string[];
      impact: string;
    }>,
    performanceGain: 0.15,
    timestamp: new Date().toISOString()
  };
  
  if (preferences.interface) {
    optimization.optimizations.push({
      type: 'ui_optimization',
      changes: ['layout', 'colors', 'spacing'],
      impact: 'medium'
    });
  }
  
  return optimization;
}

/**
 * Validate model accuracy
 */
export function validateModelAccuracy(modelId: string, validationData: any): any {
  // Mock model accuracy validation
  const validation = {
    modelId,
    accuracy: 0.87 + Math.random() * 0.1,
    precision: 0.84 + Math.random() * 0.1,
    recall: 0.89 + Math.random() * 0.1,
    f1Score: 0.86 + Math.random() * 0.1,
    status: 'passed',
    timestamp: new Date().toISOString(),
    recommendations: [] as string[]
  };
  
  if (validation.accuracy < 0.9) {
    validation.recommendations.push('Consider retraining with more data');
  }
  
  return validation;
}

/**
 * Experiment with parameters
 */
export function experimentWithParameters(modelId: string, parameters: any): any {
  // Mock parameter experimentation
  const experiment = {
    id: `exp-${Date.now()}`,
    modelId,
    parameters,
    status: 'running',
    startTime: new Date(),
    estimatedDuration: 600000, // 10 minutes
    results: null
  };
  
  return experiment;
}

/**
 * Extract feature importance
 */
export function extractFeatureImportance(modelId: string, dataset: any): any[] {
  // Mock feature importance extraction
  const features = [
    { feature: 'feature_1', importance: 0.25, rank: 1 },
    { feature: 'feature_2', importance: 0.20, rank: 2 },
    { feature: 'feature_3', importance: 0.15, rank: 3 },
    { feature: 'feature_4', importance: 0.12, rank: 4 },
    { feature: 'feature_5', importance: 0.08, rank: 5 }
  ];
  
  return features;
}

/**
 * Update knowledge base
 */
export function updateKnowledgeBase(knowledgeId: string, updates: any): any {
  // Mock knowledge base update
  const update = {
    knowledgeId,
    updates,
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    status: 'completed'
  };
  
  return update;
}

/**
 * Analyze learning progress
 */
export function analyzeLearningProgress(userId: string, progressData: any): any {
  // Mock learning progress analysis
  const analysis = {
    userId,
    progress: 0.75,
    trends: {
      accuracy: 'improving',
      speed: 'stable',
      engagement: 'increasing'
    },
    recommendations: [
      'Focus on challenging areas',
      'Practice more frequently',
      'Review previous sessions'
    ],
    timestamp: new Date().toISOString()
  };
  
  return analysis;
}

/**
 * Generate personalization profile
 */
export function generatePersonalizationProfile(userId: string, userData: any): any {
  // Mock personalization profile generation
  const profile = {
    userId,
    preferences: {
      interface: 'modern',
      complexity: 'intermediate',
      automation: 'high'
    },
    behavior: {
      learningStyle: 'visual',
      pace: 'moderate',
      focus: 'analytical'
    },
    recommendations: [
      'Use visual aids',
      'Provide step-by-step guidance',
      'Include examples'
    ],
    timestamp: new Date().toISOString()
  };
  
  return profile;
}

/**
 * Implement continuous learning
 */
export function implementContinuousLearning(modelId: string, strategy: any): any {
  // Mock continuous learning implementation
  const implementation = {
    modelId,
    strategy,
    status: 'active',
    frequency: 'daily',
    lastUpdate: new Date(),
    nextUpdate: new Date(Date.now() + 86400000), // 24 hours
    performance: {
      improvement: 0.05,
      stability: 0.92
    }
  };
  
  return implementation;
}

/**
 * Analyze cross-group patterns
 */
export function analyzeCrossGroupPatterns(spaData: any): any[] {
  // Mock cross-group pattern analysis
  const patterns = [];
  
  if (spaData && spaData.length > 1) {
    patterns.push({
      id: `pattern-${Date.now()}`,
      name: 'Performance Correlation',
      description: 'Strong correlation between SPA performance metrics',
      type: 'performance',
      frequency: 0.85,
      confidence: 0.78,
      spas: spaData.map((spa: any) => spa.id),
      indicators: ['response_time', 'throughput', 'error_rate'],
      recommendations: ['Optimize shared resources', 'Implement caching']
    });
  }
  
  return patterns;
}

/**
 * Detect cross-group anomalies
 */
export function detectCrossGroupAnomalies(spaData: any): any[] {
  // Mock cross-group anomaly detection
  const anomalies = [];
  
  if (spaData && spaData.length > 0) {
    anomalies.push({
      id: `anomaly-${Date.now()}`,
      type: 'statistical',
      metric: 'response_time',
      expectedValue: 200,
      actualValue: 500,
      deviation: 150,
      severity: 'high',
      confidence: 0.82,
      spas: spaData.map((spa: any) => spa.id),
      recommendations: ['Investigate network latency', 'Check database performance']
    });
  }
  
  return anomalies;
}

/**
 * Generate strategic insights
 */
export function generateStrategicInsights(context: any): any[] {
  // Mock strategic insights generation
  const insights = [];
  
  insights.push({
    id: `insight-${Date.now()}`,
    title: 'System Optimization Opportunity',
    description: 'Consolidating similar SPAs could improve efficiency by 25%',
    type: 'strategic',
    category: 'optimization',
    severity: 'medium',
    confidence: 0.75,
    actionable: true,
    recommendations: ['Audit SPA functionality', 'Plan consolidation strategy']
  });
  
  return insights;
}

/**
 * Calculate SPA correlations
 */
export function calculateSPACorrelations(spaData: any): any[] {
  // Mock SPA correlation calculation
  const correlations = [];
  
  if (spaData && spaData.length > 1) {
    for (let i = 0; i < spaData.length - 1; i++) {
      for (let j = i + 1; j < spaData.length; j++) {
        correlations.push({
          spaId: spaData[i].id,
          spaName: spaData[i].name,
          correlationStrength: 0.6 + Math.random() * 0.3,
          correlationType: Math.random() > 0.5 ? 'positive' : 'negative',
          confidence: 0.7 + Math.random() * 0.2,
          impact: 'medium',
          description: `Correlation between ${spaData[i].name} and ${spaData[j].name}`
        });
      }
    }
  }
  
  return correlations;
}

/**
 * Identify performance bottlenecks
 */
export function identifyPerformanceBottlenecks(performanceData: any): any[] {
  // Mock performance bottleneck identification
  const bottlenecks: any[] = [];
  
  if (performanceData && performanceData.metrics) {
    Object.entries(performanceData.metrics).forEach(([metric, value]: [string, any]) => {
      if (value > 80) {
        bottlenecks.push({
          id: `bottleneck-${Date.now()}`,
          metric,
          value,
          threshold: 80,
          severity: 'high',
          impact: 'critical',
          recommendations: [`Optimize ${metric}`, 'Scale resources']
        });
      }
    });
  }
  
  return bottlenecks;
}

/**
 * Assess security risks
 */
export function assessSecurityRisks(securityData: any): any[] {
  // Mock security risk assessment
  const risks: any[] = [];
  
  if (securityData && securityData.vulnerabilities) {
    securityData.vulnerabilities.forEach((vuln: any) => {
      risks.push({
        id: `risk-${Date.now()}`,
        threatType: vuln.type,
        severity: vuln.severity,
        confidence: 0.85,
        affectedSPAs: vuln.affectedSPAs || [],
        riskScore: vuln.score,
        mitigationSteps: ['Apply security patches', 'Update configurations'],
        recommendations: ['Implement security monitoring', 'Conduct security audit']
      });
    });
  }
  
  return risks;
}

/**
 * Evaluate compliance status
 */
export function evaluateComplianceStatus(complianceData: any): any[] {
  // Mock compliance status evaluation
  const compliance: any[] = [];
  
  if (complianceData && complianceData.frameworks) {
    complianceData.frameworks.forEach((framework: any) => {
      compliance.push({
        id: `compliance-${Date.now()}`,
        framework: framework.name,
        requirement: framework.requirement,
        status: framework.compliant ? 'compliant' : 'non-compliant',
        severity: framework.compliant ? 'low' : 'high',
        spas: framework.affectedSPAs || [],
        remediationSteps: framework.remediationSteps || [],
        recommendations: ['Review compliance policies', 'Implement monitoring']
      });
    });
  }
  
  return compliance;
}

/**
 * Analyze data quality trends
 */
export function analyzeDataQualityTrends(qualityData: any): any[] {
  // Mock data quality trend analysis
  const trends: any[] = [];
  
  if (qualityData && qualityData.metrics) {
    Object.entries(qualityData.metrics).forEach(([dimension, value]: [string, any]) => {
      trends.push({
        id: `trend-${Date.now()}`,
        dimension,
        currentValue: value,
        targetValue: 95,
        status: value >= 95 ? 'good' : value >= 80 ? 'warning' : 'poor',
        impact: value >= 95 ? 'low' : value >= 80 ? 'medium' : 'high',
        recommendations: ['Improve data validation', 'Enhance data collection']
      });
    });
  }
  
  return trends;
}

/**
 * Predict system behavior
 */
export function predictSystemBehavior(historicalData: any): any[] {
  // Mock system behavior prediction
  const predictions = [];
  
  if (historicalData && historicalData.metrics) {
    predictions.push({
      id: `prediction-${Date.now()}`,
      prediction: 'System load will increase by 15% in the next 24 hours',
      probability: 0.78,
      confidence: 0.72,
      timeframe: '24 hours',
      factors: ['Historical patterns', 'Current trends', 'Scheduled events'],
      impact: 'medium',
      recommendations: ['Scale resources', 'Monitor performance']
    });
  }
  
  return predictions;
}

/**
 * Generate actionable recommendations
 */
export function generateActionableRecommendations(insights: any[]): any[] {
  // Mock actionable recommendations generation
  const recommendations: any[] = [];
  
  insights.forEach((insight: any) => {
    recommendations.push({
      id: `rec-${Date.now()}`,
      title: `Optimize ${insight.type}`,
      description: `Based on ${insight.title} analysis`,
      category: insight.category,
      priority: insight.severity === 'critical' ? 'high' : 'medium',
      impact: 'medium',
      effort: 'medium',
      roi: 0.25,
      timeframe: '2-4 weeks',
      implementation: ['Analyze current state', 'Plan improvements', 'Implement changes'],
      metrics: ['Performance improvement', 'Cost reduction', 'User satisfaction']
    });
  });
  
  return recommendations;
}

/**
 * Visualize insights
 */
export function visualizeInsights(insights: any[]): any {
  // Mock insights visualization
  const visualization = {
    id: `viz-${Date.now()}`,
    type: 'dashboard',
    title: 'Cross-Group Insights Dashboard',
    description: 'Comprehensive view of system insights',
    data: {
      insights: insights.length,
      categories: insights.reduce((acc: any, insight: any) => {
        acc[insight.category] = (acc[insight.category] || 0) + 1;
        return acc;
      }, {}),
      severities: insights.reduce((acc: any, insight: any) => {
        acc[insight.severity] = (acc[insight.severity] || 0) + 1;
        return acc;
      }, {})
    },
    config: {
      chartType: 'mixed',
      interactive: true,
      exportable: true
    },
    interactive: true,
    exportable: true
  };
  
  return visualization;
}

/**
 * Export insights report
 */
export function exportInsightsReport(insights: any[], format: string = 'pdf'): any {
  // Mock insights report export
  const report = {
    id: `report-${Date.now()}`,
    title: 'Cross-Group Insights Report',
    format,
    timestamp: new Date().toISOString(),
    insights: insights.length,
    summary: {
      total: insights.length,
      critical: insights.filter((i: any) => i.severity === 'critical').length,
      high: insights.filter((i: any) => i.severity === 'high').length,
      medium: insights.filter((i: any) => i.severity === 'medium').length,
      low: insights.filter((i: any) => i.severity === 'low').length
    },
    url: `/reports/insights-${Date.now()}.${format}`,
    size: '2.5MB'
  };
  
  return report;
}

/**
 * Export all utilities as a single object
 */
export const aiAssistantUtils = {
  generateMessageId,
  formatMessageContent,
  extractCodeBlocks,
  extractLinks,
  analyzeSentiment,
  generateSuggestions,
  calculateConfidence,
  validateConfig,
  formatProcessingTime,
  assessActionImpact,
  generateInsightRecommendations,
  handleAnomalyResponse,
  calculateContextRelevance,
  personalizeRecommendations,
  updateLearningModel,
  importWorkflow,
  calibrateAudioInput,
  detectSystemAnomalies,
  analyzeUserBehaviorPatterns,
  identifySecurityThreats,
  detectPerformanceAnomalies,
  analyzeDataQualityIssues,
  trainDetectionModels,
  calculateAnomalyScores,
  createBaselineProfiles,
  configureThreatDetection,
  generateAnomalyReports,
  validateDetectionAccuracy,
  formatAIResponse,
  parseNaturalLanguage,
  generateProactiveInsights,
  optimizeAIPerformance,
  trainLearningModel,
  evaluateModelPerformance,
  generateLearningInsights,
  adaptToUserBehavior,
  optimizePersonalization,
  validateModelAccuracy,
  experimentWithParameters,
  extractFeatureImportance,
  updateKnowledgeBase,
  analyzeLearningProgress,
  generatePersonalizationProfile,
  implementContinuousLearning,
  analyzeCrossGroupPatterns,
  detectCrossGroupAnomalies,
  generateStrategicInsights,
  calculateSPACorrelations,
  identifyPerformanceBottlenecks,
  assessSecurityRisks,
  evaluateComplianceStatus,
  analyzeDataQualityTrends,
  predictSystemBehavior,
  generateActionableRecommendations,
  visualizeInsights,
  exportInsightsReport
};

// ============================================================================
// COMPLIANCE UTILITY FUNCTIONS
// ============================================================================

export async function assessComplianceStatus(
  framework: string,
  requirements: string[],
  context: any
): Promise<any> {
  try {
    console.log('Assessing compliance status for framework:', framework);
    // Mock implementation
    const assessment = {
      framework,
      requirements,
      status: 'compliant',
      score: 0.85,
      violations: [],
      recommendations: []
    };
    return assessment;
  } catch (error) {
    console.error('Failed to assess compliance status:', error);
    return null;
  }
}

export async function evaluateRegulatoryRequirements(
  requirements: string[],
  context: any
): Promise<any> {
  try {
    console.log('Evaluating regulatory requirements:', requirements);
    // Mock implementation
    const evaluation = {
      requirements,
      compliance: 'compliant',
      gaps: [],
      risks: [],
      recommendations: []
    };
    return evaluation;
  } catch (error) {
    console.error('Failed to evaluate regulatory requirements:', error);
    return null;
  }
}

export async function generateComplianceReport(
  framework: string,
  period: { start: Date; end: Date },
  context: any
): Promise<any> {
  try {
    console.log('Generating compliance report for framework:', framework);
    // Mock implementation
    const report = {
      framework,
      period,
      status: 'compliant',
      score: 0.88,
      violations: [],
      recommendations: [],
      generatedAt: new Date()
    };
    return report;
  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    return null;
  }
}

export async function identifyComplianceGaps(
  framework: string,
  requirements: string[],
  context: any
): Promise<any> {
  try {
    console.log('Identifying compliance gaps for framework:', framework);
    // Mock implementation
    const gaps = [
      {
        requirement: 'data_retention',
        gap: 'Missing automated retention policy enforcement',
        severity: 'medium',
        impact: 'medium'
      }
    ];
    return gaps;
  } catch (error) {
    console.error('Failed to identify compliance gaps:', error);
    return [];
  }
}

export async function recommendRemediation(
  violations: any[],
  context: any
): Promise<any> {
  try {
    console.log('Recommending remediation for violations:', violations);
    // Mock implementation
    const recommendations = violations.map(violation => ({
      violationId: violation.id,
      action: 'Implement automated monitoring',
      priority: 'high',
      effort: 'medium',
      timeline: '2 weeks'
    }));
    return recommendations;
  } catch (error) {
    console.error('Failed to recommend remediation:', error);
    return [];
  }
}

export async function validateControlFramework(
  framework: string,
  controls: string[],
  context: any
): Promise<any> {
  try {
    console.log('Validating control framework:', framework);
    // Mock implementation
    const validation = {
      framework,
      controls,
      status: 'valid',
      effectiveness: 0.92,
      gaps: [],
      recommendations: []
    };
    return validation;
  } catch (error) {
    console.error('Failed to validate control framework:', error);
    return null;
  }
}

export async function trackComplianceMetrics(
  framework: string,
  metrics: any,
  context: any
): Promise<any> {
  try {
    console.log('Tracking compliance metrics for framework:', framework);
    // Mock implementation
    const tracking = {
      framework,
      metrics,
      timestamp: new Date(),
      status: 'tracked'
    };
    return tracking;
  } catch (error) {
    console.error('Failed to track compliance metrics:', error);
    return null;
  }
}

export async function scheduleComplianceReview(
  framework: string,
  schedule: any,
  context: any
): Promise<any> {
  try {
    console.log('Scheduling compliance review for framework:', framework);
    // Mock implementation
    const review = {
      framework,
      schedule,
      status: 'scheduled',
      assignedTo: 'compliance-team',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
    return review;
  } catch (error) {
    console.error('Failed to schedule compliance review:', error);
    return null;
  }
}

export async function automateComplianceWorkflow(
  workflow: any,
  context: any
): Promise<any> {
  try {
    console.log('Automating compliance workflow:', workflow);
    // Mock implementation
    const automation = {
      workflow,
      status: 'automated',
      triggers: ['daily', 'on_change'],
      actions: ['monitor', 'alert', 'report']
    };
    return automation;
  } catch (error) {
    console.error('Failed to automate compliance workflow:', error);
    return null;
  }
}

export async function generateAuditTrail(
  action: string,
  context: any
): Promise<any> {
  try {
    console.log('Generating audit trail for action:', action);
    // Mock implementation
    const trail = {
      action,
      timestamp: new Date(),
      user: context.user?.id || 'system',
      details: context,
      status: 'logged'
    };
    return trail;
  } catch (error) {
    console.error('Failed to generate audit trail:', error);
    return null;
  }
}

export async function monitorPolicyCompliance(
  policy: any,
  context: any
): Promise<any> {
  try {
    console.log('Monitoring policy compliance:', policy);
    // Mock implementation
    const monitoring = {
      policy,
      status: 'compliant',
      violations: [],
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };
    return monitoring;
  } catch (error) {
    console.error('Failed to monitor policy compliance:', error);
    return null;
  }
}

export async function calculateComplianceScore(
  assessments: any[],
  context: any
): Promise<number> {
  try {
    console.log('Calculating compliance score for assessments:', assessments);
    // Mock implementation
    if (assessments.length === 0) return 0;
    
    const compliantCount = assessments.filter(a => a.status === 'compliant').length;
    const score = (compliantCount / assessments.length) * 100;
    return Math.round(score);
  } catch (error) {
    console.error('Failed to calculate compliance score:', error);
    return 0;
  }
}

// ============================================================================
// CONTEXT-AWARE UTILITY FUNCTIONS
// ============================================================================

export async function analyzeContextualPatterns(
  context: any,
  patterns: any[]
): Promise<any> {
  try {
    console.log('Analyzing contextual patterns with context:', context);
    
    // Use existing backend service for context analysis
    const response = await fetch('/api/racine/ai-assistant/analyze-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: context.user?.id || 'default',
        context: context,
        analysisType: 'comprehensive'
      })
    });

    if (!response.ok) {
      throw new Error(`Context analysis failed: ${response.statusText}`);
    }

    const analysis = await response.json();
    return analysis;
  } catch (error) {
    console.error('Failed to analyze contextual patterns:', error);
    // Fallback to local analysis
    return {
      patterns: patterns.filter(p => p.confidence > 0.6),
      insights: [],
      recommendations: []
    };
  }
}

export async function generateContextualRecommendations(
  context: any,
  analysis: any
): Promise<any[]> {
  try {
    console.log('Generating contextual recommendations for context:', context);
    
    // Use existing backend service for recommendations
    const response = await fetch('/api/racine/ai-assistant/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: context.user?.id || 'default',
        context: context
      })
    });

    if (!response.ok) {
      throw new Error(`Recommendations generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.recommendations || [];
  } catch (error) {
    console.error('Failed to generate contextual recommendations:', error);
    // Fallback to local recommendations
    return [
      {
        id: 'fallback-1',
        title: 'Optimize Workspace Usage',
        description: 'Based on your current context, consider optimizing workspace configuration',
        category: 'optimization',
        priority: 'medium',
        confidence: 0.7,
        relevanceScore: 0.6,
        context: context,
        implementation: {},
        estimatedEffort: 'low',
        estimatedImpact: 'medium',
        dependencies: [],
        tags: ['workspace', 'optimization'],
        generatedAt: new Date(),
        executed: false,
        dismissed: false
      }
    ];
  }
}

// calculateContextRelevance function already exists above

export async function predictUserIntent(
  context: any,
  patterns: any[]
): Promise<any> {
  try {
    console.log('Predicting user intent based on context and patterns:', context);
    
    // Analyze recent activities and patterns to predict intent
    const recentActivities = context.recentActivities || [];
    const activePatterns = patterns.filter(p => p.isActive && p.confidence > 0.7);
    
    let predictedIntent = {
      primary: 'general_usage',
      confidence: 0.5,
      secondary: [],
      context: 'neutral'
    };
    
    // Analyze activity patterns
    if (recentActivities.length > 0) {
      const activityTypes = recentActivities.map((a: any) => a.type || 'unknown');
      const mostFrequent = activityTypes.reduce((acc: Record<string, number>, type: string) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      const primaryActivity = Object.entries(mostFrequent)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      
      if (primaryActivity) {
        predictedIntent.primary = primaryActivity[0];
        predictedIntent.confidence = Math.min(primaryActivity[1] as number / recentActivities.length, 0.9);
      }
    }
    
          // Factor in behavior patterns
      if (activePatterns.length > 0) {
        const patternIntent = activePatterns
          .filter((p: any) => p.type === 'positive' || p.type === 'adaptive')
          .sort((a: any, b: any) => b.confidence - a.confidence)[0];
        
        if (patternIntent) {
          predictedIntent.secondary.push(patternIntent.name);
          predictedIntent.confidence = Math.max(predictedIntent.confidence, patternIntent.confidence);
        }
      }
    
    return predictedIntent;
  } catch (error) {
    console.error('Failed to predict user intent:', error);
    return {
      primary: 'general_usage',
      confidence: 0.5,
      secondary: [],
      context: 'neutral'
    };
  }
}

// adaptToUserBehavior function already exists above

export async function optimizeContextualResponse(
  response: any,
  context: any
): Promise<any> {
  try {
    console.log('Optimizing contextual response based on context:', context);
    
    // Optimize response based on user context and preferences
    let optimizedResponse = { ...response };
    
    // Adjust response complexity based on user experience level
    if (context.user?.profile?.skills?.length > 0) {
      const skillLevel = context.user.profile.skills.length;
      if (skillLevel < 3) {
        // Beginner user - simplify response
        optimizedResponse.message = `Simple explanation: ${response.message}`;
        optimizedResponse.suggestions = response.suggestions.slice(0, 2); // Limit suggestions
      } else if (skillLevel > 7) {
        // Expert user - provide more technical details
        optimizedResponse.message = `${response.message} (Technical details available)`;
        optimizedResponse.actions = response.actions.concat([
          { type: 'show_technical_details', label: 'Show Technical Details' }
        ]);
      }
    }
    
    // Adjust response timing based on user activity
    if (context.temporal?.businessHours) {
      optimizedResponse.priority = 'high'; // Prioritize during business hours
    } else {
      optimizedResponse.priority = 'medium'; // Lower priority outside business hours
    }
    
    // Add contextual metadata
    optimizedResponse.metadata = {
      ...response.metadata,
      contextOptimized: true,
      optimizationTimestamp: new Date().toISOString(),
      contextFactors: {
        userExperience: context.user?.profile?.skills?.length || 0,
        businessHours: context.temporal?.businessHours || false,
        systemLoad: context.environmental?.systemLoad || 0
      }
    };
    
    return optimizedResponse;
  } catch (error) {
    console.error('Failed to optimize contextual response:', error);
    return response; // Return original response if optimization fails
  }
}

// ============================================================================
// PROACTIVE RECOMMENDATION UTILITY FUNCTIONS
// ============================================================================

export async function generateRecommendations(
  context: any,
  options: any
): Promise<any[]> {
  try {
    console.log('Generating recommendations with context:', context);
    
    // Use existing backend service for recommendations
    const response = await fetch('/api/racine/ai-assistant/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: context.user?.id || 'default',
        context: context,
        options: options
      })
    });

    if (!response.ok) {
      throw new Error(`Recommendations generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.recommendations || [];
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return [];
  }
}

export async function optimizeSystemPerformance(
  target: string,
  metrics: any
): Promise<any> {
  try {
    console.log('Optimizing system performance for target:', target);
    
    // Use existing backend service for performance optimization
    const response = await fetch('/api/racine/ai-assistant/optimize-performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: target,
        metrics: metrics,
        optimization_type: 'system_performance'
      })
    });

    if (!response.ok) {
      throw new Error(`Performance optimization failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to optimize system performance:', error);
    return null;
  }
}

export async function predictTrends(
  data: any[],
  timeRange: string
): Promise<any> {
  try {
    console.log('Predicting trends for data:', data.length, 'records');
    
    // Use existing backend service for trend prediction
    const response = await fetch('/api/racine/ai-assistant/predict-trends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: data,
        time_range: timeRange,
        prediction_type: 'trend_analysis'
      })
    });

    if (!response.ok) {
      throw new Error(`Trend prediction failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to predict trends:', error);
    return null;
  }
}

export async function calculateRecommendationScore(
  recommendation: any,
  context: any
): Promise<number> {
  try {
    console.log('Calculating recommendation score for:', recommendation.id);
    
    // Calculate score based on multiple factors
    let score = 0.5; // Base score
    
    // Factor in confidence
    if (recommendation.confidence) {
      score += recommendation.confidence * 0.2;
    }
    
    // Factor in priority
    const priorityWeights = { low: 0.1, medium: 0.2, high: 0.3, critical: 0.4 };
    if (recommendation.priority && priorityWeights[recommendation.priority]) {
      score += priorityWeights[recommendation.priority];
    }
    
    // Factor in context relevance
    if (context.user?.role && recommendation.category) {
      // Simple role-category matching
      const roleCategoryMatch = {
        'admin': ['security', 'compliance', 'performance'],
        'developer': ['performance', 'workflow', 'data_quality'],
        'analyst': ['data_quality', 'workflow', 'user_experience'],
        'user': ['user_experience', 'workflow', 'performance']
      };
      
      if (roleCategoryMatch[context.user.role]?.includes(recommendation.category)) {
        score += 0.1;
      }
    }
    
    // Factor in recent activity relevance
    if (context.recentActivities?.length > 0) {
      const recentActivityTypes = context.recentActivities.map((a: any) => a.type);
      if (recommendation.category && recentActivityTypes.includes(recommendation.category)) {
        score += 0.1;
      }
    }
    
    return Math.min(Math.max(score, 0), 1); // Ensure score is between 0 and 1
  } catch (error) {
    console.error('Failed to calculate recommendation score:', error);
    return 0.5; // Default score
  }
}

export async function filterRecommendationsByPermissions(
  recommendations: any[],
  userPermissions: any
): Promise<any[]> {
  try {
    console.log('Filtering recommendations by user permissions');
    
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return recommendations;
    }
    
    return recommendations.filter(recommendation => {
      // Check if user has permission for the recommendation category
      const categoryPermission = `${recommendation.category}_read`;
      const executePermission = `${recommendation.category}_execute`;
      
      return userPermissions.includes(categoryPermission) || 
             userPermissions.includes(executePermission) ||
             userPermissions.includes('admin') ||
             userPermissions.includes('superuser');
    });
  } catch (error) {
    console.error('Failed to filter recommendations by permissions:', error);
    return recommendations; // Return all if filtering fails
  }
}

export async function trackRecommendationEffectiveness(
  recommendationId: string,
  executionResult: any
): Promise<any> {
  try {
    console.log('Tracking recommendation effectiveness for:', recommendationId);
    
    // Use existing backend service for tracking effectiveness
    const response = await fetch('/api/racine/ai-assistant/track-effectiveness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recommendation_id: recommendationId,
        execution_result: executionResult,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Effectiveness tracking failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to track recommendation effectiveness:', error);
    return null;
  }
}

export async function validateRecommendation(
  recommendation: any,
  context: any
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  try {
    console.log('Validating recommendation:', recommendation.id);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!recommendation.title || recommendation.title.trim().length === 0) {
      errors.push('Recommendation title is required');
    }
    
    if (!recommendation.description || recommendation.description.trim().length === 0) {
      errors.push('Recommendation description is required');
    }
    
    if (!recommendation.category) {
      errors.push('Recommendation category is required');
    }
    
    if (!recommendation.priority) {
      errors.push('Recommendation priority is required');
    }
    
    if (recommendation.confidence < 0 || recommendation.confidence > 1) {
      errors.push('Confidence must be between 0 and 1');
    }
    
    // Context validation
    if (context.user?.role === 'user' && recommendation.category === 'security') {
      warnings.push('Security recommendations may require elevated permissions');
    }
    
    // Business rule validation
    if (recommendation.estimatedCost && recommendation.estimatedCost > 10000) {
      warnings.push('High-cost recommendations may require approval');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    console.error('Failed to validate recommendation:', error);
    return {
      valid: false,
      errors: ['Validation failed due to system error'],
      warnings: []
    };
  }
}

// ============================================================================
// WORKFLOW AUTOMATION UTILITY FUNCTIONS
// ============================================================================

export async function createAutomatedWorkflow(
  workflow: any,
  options: any
): Promise<any> {
  try {
    console.log('Creating automated workflow:', workflow.name);
    
    // Use existing backend service for workflow creation
    const response = await fetch('/api/racine/ai-assistant/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: workflow,
        options: options,
        user_id: options?.context?.user?.id || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow creation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.workflow;
  } catch (error) {
    console.error('Failed to create automated workflow:', error);
    return null;
  }
}



export async function optimizeWorkflowPerformance(
  workflowId: string,
  strategy: string,
  options: any
): Promise<any> {
  try {
    console.log('Optimizing workflow performance for:', workflowId);
    
    // Use existing backend service for workflow optimization
    const response = await fetch('/api/racine/ai-assistant/workflows/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        strategy: strategy,
        options: options,
        user_id: options?.context?.user?.id || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow optimization failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.optimization;
  } catch (error) {
    console.error('Failed to optimize workflow performance:', error);
    return null;
  }
}

export async function analyzeWorkflowExecution(
  executionId: string,
  analysisType: string
): Promise<any> {
  try {
    console.log('Analyzing workflow execution:', executionId);
    
    // Use existing backend service for execution analysis
    const response = await fetch('/api/racine/ai-assistant/workflows/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        execution_id: executionId,
        analysis_type: analysisType
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow execution analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.analysis;
  } catch (error) {
    console.error('Failed to analyze workflow execution:', error);
    return null;
  }
}

export async function generateWorkflowSuggestions(
  context: any,
  options: any
): Promise<any[]> {
  try {
    console.log('Generating workflow suggestions');
    
    // Use existing backend service for workflow suggestions
    const response = await fetch('/api/racine/ai-assistant/workflows/suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: context,
        options: options,
        user_id: context?.user?.id || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow suggestions generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.suggestions || [];
  } catch (error) {
    console.error('Failed to generate workflow suggestions:', error);
    return [];
  }
}

export async function validateWorkflowConfiguration(
  workflow: any,
  validationType: string
): Promise<any> {
  try {
    console.log('Validating workflow configuration');
    
    // Use existing backend service for workflow validation
    const response = await fetch('/api/racine/ai-assistant/workflows/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: workflow,
        validation_type: validationType
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow validation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.validation;
  } catch (error) {
    console.error('Failed to validate workflow configuration:', error);
    return null;
  }
}

export async function scheduleWorkflowExecution(
  workflowId: string,
  schedule: any,
  options: any
): Promise<any> {
  try {
    console.log('Scheduling workflow execution for:', workflowId);
    
    // Use existing backend service for workflow scheduling
    const response = await fetch('/api/racine/ai-assistant/workflows/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        schedule: schedule,
        options: options,
        user_id: options?.context?.user?.id || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow scheduling failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.schedule;
  } catch (error) {
    console.error('Failed to schedule workflow execution:', error);
    return null;
  }
}

export async function monitorWorkflowHealth(
  workflowId: string,
  metrics: string[]
): Promise<any> {
  try {
    console.log('Monitoring workflow health for:', workflowId);
    
    // Use existing backend service for workflow health monitoring
    const response = await fetch('/api/racine/ai-assistant/workflows/health', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        metrics: metrics
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow health monitoring failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.health;
  } catch (error) {
    console.error('Failed to monitor workflow health:', error);
    return null;
  }
}

export async function extractWorkflowMetrics(
  workflowId: string,
  timeRange: string,
  metrics: string[]
): Promise<any> {
  try {
    console.log('Extracting workflow metrics for:', workflowId);
    
    // Use existing backend service for workflow metrics extraction
    const response = await fetch('/api/racine/ai-assistant/workflows/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        time_range: timeRange,
        metrics: metrics
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow metrics extraction failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.metrics;
  } catch (error) {
    console.error('Failed to extract workflow metrics:', error);
    return null;
  }
}

export async function predictWorkflowOutcome(
  workflowId: string,
  parameters: any,
  context: any
): Promise<any> {
  try {
    console.log('Predicting workflow outcome for:', workflowId);
    
    // Use existing backend service for workflow outcome prediction
    const response = await fetch('/api/racine/ai-assistant/workflows/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        parameters: parameters,
        context: context
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow outcome prediction failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.prediction;
  } catch (error) {
    console.error('Failed to predict workflow outcome:', error);
    return null;
  }
}

export async function cloneWorkflow(
  workflowId: string,
  newName: string,
  options: any
): Promise<any> {
  try {
    console.log('Cloning workflow:', workflowId);
    
    // Use existing backend service for workflow cloning
    const response = await fetch('/api/racine/ai-assistant/workflows/clone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        new_name: newName,
        options: options,
        user_id: options?.context?.user?.id || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow cloning failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.workflow;
  } catch (error) {
    console.error('Failed to clone workflow:', error);
    return null;
  }
}

export async function shareWorkflow(
  workflowId: string,
  shareOptions: any
): Promise<any> {
  try {
    console.log('Sharing workflow:', workflowId);
    
    // Use existing backend service for workflow sharing
    const response = await fetch('/api/racine/ai-assistant/workflows/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        share_options: shareOptions,
        user_id: shareOptions?.user_id || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow sharing failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.share;
  } catch (error) {
    console.error('Failed to share workflow:', error);
    return null;
  }
}

// ============================================================================
// WORKFLOW AUTOMATION ENGINE UTILITY FUNCTIONS
// ============================================================================

export async function createWorkflow(
  workflowData: any,
  options: any = {}
): Promise<any> {
  try {
    console.log('Creating workflow:', workflowData.name);
    
    // Use existing backend service for workflow creation
    const response = await fetch('/api/racine/ai-assistant/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: workflowData,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow creation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.workflow;
  } catch (error) {
    console.error('Failed to create workflow:', error);
    return null;
  }
}

export async function executeWorkflow(
  workflowId: string,
  parameters: any = {},
  context: any = {}
): Promise<any> {
  try {
    console.log('Executing workflow:', workflowId);
    
    // Use existing backend service for workflow execution
    const response = await fetch('/api/racine/ai-assistant/workflows/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        parameters: parameters,
        context: context,
        user_id: context.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow execution failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.execution;
  } catch (error) {
    console.error('Failed to execute workflow:', error);
    return null;
  }
}

export async function validateWorkflow(
  workflowData: any
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  try {
    console.log('Validating workflow:', workflowData.name);
    
    // Use existing backend service for workflow validation
    const response = await fetch('/api/racine/ai-assistant/workflows/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: workflowData
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow validation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.validation;
  } catch (error) {
    console.error('Failed to validate workflow:', error);
    return {
      isValid: false,
      errors: ['Validation failed due to system error'],
      warnings: []
    };
  }
}

export async function optimizeWorkflow(
  workflowId: string,
  strategy: string = 'performance',
  options: any = {}
): Promise<any> {
  try {
    console.log('Optimizing workflow:', workflowId);
    
    // Use existing backend service for workflow optimization
    const response = await fetch('/api/racine/ai-assistant/workflows/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        strategy: strategy,
        options: options
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow optimization failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.optimization;
  } catch (error) {
    console.error('Failed to optimize workflow:', error);
    return null;
  }
}

export async function scheduleWorkflow(
  workflowId: string,
  schedule: any,
  options: any = {}
): Promise<any> {
  try {
    console.log('Scheduling workflow:', workflowId);
    
    // Use existing backend service for workflow scheduling
    const response = await fetch('/api/racine/ai-assistant/workflows/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        schedule: schedule,
        options: options
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow scheduling failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.schedule;
  } catch (error) {
    console.error('Failed to schedule workflow:', error);
    return null;
  }
}

export async function monitorExecution(
  executionId: string,
  options: any = {}
): Promise<any> {
  try {
    console.log('Monitoring execution:', executionId);
    
    // Use existing backend service for execution monitoring
    const response = await fetch(`/api/racine/ai-assistant/workflows/executions/${executionId}/monitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: options.action || 'status',
        execution_id: executionId
      })
    });

    if (!response.ok) {
      throw new Error(`Execution monitoring failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.execution;
  } catch (error) {
    console.error('Failed to monitor execution:', error);
    return null;
  }
}

export async function handleWorkflowError(
  error: any,
  workflowId: string,
  context: any = {}
): Promise<any> {
  try {
    console.log('Handling workflow error:', error.message);
    
    // Use existing backend service for error handling
    const response = await fetch('/api/racine/ai-assistant/workflows/error-handling', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error,
        workflow_id: workflowId,
        context: context
      })
    });

    if (!response.ok) {
      throw new Error(`Error handling failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.handling;
  } catch (error) {
    console.error('Failed to handle workflow error:', error);
    return null;
  }
}

export async function calculateMetrics(
  workflowId: string,
  timeRange: string = '24h',
  metrics: string[] = ['execution_time', 'success_rate', 'error_rate']
): Promise<any> {
  try {
    console.log('Calculating workflow metrics:', workflowId);
    
    // Use existing backend service for metrics calculation
    const response = await fetch('/api/racine/ai-assistant/workflows/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        time_range: timeRange,
        metrics: metrics
      })
    });

    if (!response.ok) {
      throw new Error(`Metrics calculation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.metrics;
  } catch (error) {
    console.error('Failed to calculate metrics:', error);
    return null;
  }
}

export async function exportWorkflow(
  workflowId: string,
  format: string = 'json',
  options: any = {}
): Promise<any> {
  try {
    console.log('Exporting workflow:', workflowId);
    
    // Use existing backend service for workflow export
    const response = await fetch(`/api/racine/ai-assistant/workflows/${workflowId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: format,
        options: options
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow export failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.export;
  } catch (error) {
    console.error('Failed to export workflow:', error);
    return null;
  }
}

export async function importWorkflow(
  workflowData: any,
  options: any = {}
): Promise<any> {
  try {
    console.log('Importing workflow:', workflowData.name);
    
    // Use existing backend service for workflow import
    const response = await fetch('/api/racine/ai-assistant/workflows/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: workflowData,
        options: options
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow import failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.workflow;
  } catch (error) {
    console.error('Failed to import workflow:', error);
    return null;
  }
}

// ============================================================================
// PROACTIVE INSIGHTS ENGINE UTILITY FUNCTIONS
// ============================================================================

export async function analyzePatterns(
  data: any,
  patternType: string,
  options: any = {}
): Promise<any> {
  try {
    console.log('Analyzing patterns of type:', patternType);
    
    // Use existing backend service for pattern analysis
    const response = await fetch('/api/racine/ai-assistant/insights/patterns/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: data,
        pattern_type: patternType,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Pattern analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.patterns;
  } catch (error) {
    console.error('Failed to analyze patterns:', error);
    return null;
  }
}

export async function generateInsights(
  data: any,
  analysisType: string = 'comprehensive',
  options: any = {}
): Promise<any> {
  try {
    console.log('Generating insights with analysis type:', analysisType);
    
    // Use existing backend service for insight generation
    const response = await fetch('/api/racine/ai-assistant/insights/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: data,
        analysis_type: analysisType,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Insight generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.insights;
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return null;
  }
}

export async function calculateTrends(
  data: any,
  timeRange: string = '24h',
  options: any = {}
): Promise<any> {
  try {
    console.log('Calculating trends for time range:', timeRange);
    
    // Use existing backend service for trend calculation
    const response = await fetch('/api/racine/ai-assistant/insights/trends/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: data,
        time_range: timeRange,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Trend calculation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.trends;
  } catch (error) {
    console.error('Failed to calculate trends:', error);
    return null;
  }
}

export async function buildPredictiveModel(
  trainingData: any,
  modelType: string = 'ensemble',
  options: any = {}
): Promise<any> {
  try {
    console.log('Building predictive model of type:', modelType);
    
    // Use existing backend service for predictive model building
    const response = await fetch('/api/racine/ai-assistant/insights/models/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        training_data: trainingData,
        model_type: modelType,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Predictive model building failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.model;
  } catch (error) {
    console.error('Failed to build predictive model:', error);
    return null;
  }
}

export async function processUserBehavior(
  behaviorData: any,
  analysisDepth: string = 'detailed',
  options: any = {}
): Promise<any> {
  try {
    console.log('Processing user behavior with depth:', analysisDepth);
    
    // Use existing backend service for user behavior processing
    const response = await fetch('/api/racine/ai-assistant/insights/behavior/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        behavior_data: behaviorData,
        analysis_depth: analysisDepth,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`User behavior processing failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.behavior_analysis;
  } catch (error) {
    console.error('Failed to process user behavior:', error);
    return null;
  }
}

export async function optimizeRecommendations(
  recommendations: any[],
  optimizationStrategy: string = 'relevance',
  options: any = {}
): Promise<any[]> {
  try {
    console.log('Optimizing recommendations using strategy:', optimizationStrategy);
    
    // Use existing backend service for recommendation optimization
    const response = await fetch('/api/racine/ai-assistant/insights/recommendations/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recommendations: recommendations,
        optimization_strategy: optimizationStrategy,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Recommendation optimization failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.optimized_recommendations || [];
  } catch (error) {
    console.error('Failed to optimize recommendations:', error);
    return [];
  }
}

export async function validateInsights(
  insights: any[],
  validationCriteria: any = {},
  options: any = {}
): Promise<{ valid: any[]; invalid: any[]; warnings: string[] }> {
  try {
    console.log('Validating insights with criteria:', validationCriteria);
    
    // Use existing backend service for insight validation
    const response = await fetch('/api/racine/ai-assistant/insights/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        insights: insights,
        validation_criteria: validationCriteria,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Insight validation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.validation;
  } catch (error) {
    console.error('Failed to validate insights:', error);
    return {
      valid: [],
      invalid: insights,
      warnings: ['Validation failed due to system error']
    };
  }
}

export async function prioritizeInsights(
  insights: any[],
  prioritizationMethod: string = 'impact',
  options: any = {}
): Promise<any[]> {
  try {
    console.log('Prioritizing insights using method:', prioritizationMethod);
    
    // Use existing backend service for insight prioritization
    const response = await fetch('/api/racine/ai-assistant/insights/prioritize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        insights: insights,
        prioritization_method: prioritizationMethod,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Insight prioritization failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.prioritized_insights || [];
  } catch (error) {
    console.error('Failed to prioritize insights:', error);
    return insights;
  }
}

export async function formatInsightData(
  insights: any[],
  format: string = 'dashboard',
  options: any = {}
): Promise<any> {
  try {
    console.log('Formatting insight data for format:', format);
    
    // Use existing backend service for insight data formatting
    const response = await fetch('/api/racine/ai-assistant/insights/format', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        insights: insights,
        format: format,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Insight data formatting failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.formatted_data;
  } catch (error) {
    console.error('Failed to format insight data:', error);
    return null;
  }
}

// ============================================================================
// NATURAL LANGUAGE PROCESSING UTILITY FUNCTIONS
// ============================================================================

export async function processNaturalLanguage(
  text: string,
  options: any = {}
): Promise<any> {
  try {
    console.log('Processing natural language text:', text.substring(0, 100));
    
    // Use existing backend service for natural language processing
    const response = await fetch('/api/racine/ai-assistant/nlp/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Natural language processing failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.processing_result;
  } catch (error) {
    console.error('Failed to process natural language:', error);
    return null;
  }
}

export async function recognizeIntent(
  text: string,
  context: any = {},
  options: any = {}
): Promise<any> {
  try {
    console.log('Recognizing intent for text:', text.substring(0, 100));
    
    // Use existing backend service for intent recognition
    const response = await fetch('/api/racine/ai-assistant/nlp/intent/recognize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        context: context,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Intent recognition failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.intent_recognition;
  } catch (error) {
    console.error('Failed to recognize intent:', error);
    return null;
  }
}

export async function detectLanguage(
  text: string,
  options: any = {}
): Promise<any> {
  try {
    console.log('Detecting language for text:', text.substring(0, 100));
    
    // Use existing backend service for language detection
    const response = await fetch('/api/racine/ai-assistant/nlp/language/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Language detection failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.language_detection;
  } catch (error) {
    console.error('Failed to detect language:', error);
    return null;
  }
}

export async function generateResponse(
  query: any,
  context: any = {},
  options: any = {}
): Promise<any> {
  try {
    console.log('Generating response for query:', query.query?.substring(0, 100));
    
    // Use existing backend service for response generation
    const response = await fetch('/api/racine/ai-assistant/nlp/response/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        context: context,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Response generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.response_generation;
  } catch (error) {
    console.error('Failed to generate response:', error);
    return null;
  }
}

export async function buildSemanticModel(
  trainingData: any[],
  modelType: string = 'semantic',
  options: any = {}
): Promise<any> {
  try {
    console.log('Building semantic model of type:', modelType);
    
    // Use existing backend service for semantic model building
    const response = await fetch('/api/racine/ai-assistant/nlp/models/semantic/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        training_data: trainingData,
        model_type: modelType,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Semantic model building failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.semantic_model;
  } catch (error) {
    console.error('Failed to build semantic model:', error);
    return null;
  }
}

export async function trainNLPModel(
  modelId: string,
  trainingData: any[],
  options: any = {}
): Promise<any> {
  try {
    console.log('Training NLP model:', modelId);
    
    // Use existing backend service for NLP model training
    const response = await fetch(`/api/racine/ai-assistant/nlp/models/${modelId}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        training_data: trainingData,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`NLP model training failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.training_result;
  } catch (error) {
    console.error('Failed to train NLP model:', error);
    return null;
  }
}

export async function optimizeProcessing(
  pipelineId: string,
  optimizationStrategy: string = 'performance',
  options: any = {}
): Promise<any> {
  try {
    console.log('Optimizing processing pipeline:', pipelineId);
    
    // Use existing backend service for processing optimization
    const response = await fetch(`/api/racine/ai-assistant/nlp/pipelines/${pipelineId}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        optimization_strategy: optimizationStrategy,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`Processing optimization failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.optimization_result;
  } catch (error) {
    console.error('Failed to optimize processing:', error);
    return null;
  }
}

export async function validateNLPResult(
  result: any,
  validationCriteria: any = {},
  options: any = {}
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  try {
    console.log('Validating NLP result');
    
    // Use existing backend service for NLP result validation
    const response = await fetch('/api/racine/ai-assistant/nlp/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        result: result,
        validation_criteria: validationCriteria,
        options: options,
        user_id: options.userId || 'default'
      })
    });

    if (!response.ok) {
      throw new Error(`NLP result validation failed: ${response.statusText}`);
    }

    const validationResult = await response.json();
    return validationResult.validation;
  } catch (error) {
    console.error('Failed to validate NLP result:', error);
    return {
      isValid: false,
      errors: ['Validation failed due to system error'],
      warnings: []
    };
  }
}
