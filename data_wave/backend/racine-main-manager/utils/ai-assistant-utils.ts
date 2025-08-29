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
export function importWorkflow(workflowData: any, targetWorkspace: string): any {
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
  calibrateAudioInput
};
