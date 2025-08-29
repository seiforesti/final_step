// ============================================================================
// AI ASSISTANT COMPONENTS - INDEX EXPORTS
// ============================================================================
// Central export file for all AI assistant components
// Enables proper module resolution for app pages

export { default as AIAssistantInterface } from './AIAssistantInterface';
export { default as WorkflowAutomationEngine } from './WorkflowAutomationEngine';
export { default as WorkflowAutomationAssistant } from './WorkflowAutomationAssistant';
export { default as VoiceControlInterface } from './VoiceControlInterface';
export { default as ProactiveRecommendationEngine } from './ProactiveRecommendationEngine';
export { default as ProactiveInsightsEngine } from './ProactiveInsightsEngine';
export { default as NaturalLanguageProcessor } from './NaturalLanguageProcessor';
export { default as CrossGroupInsightsEngine } from './CrossGroupInsightsEngine';
export { default as ContextAwareAssistant } from './ContextAwareAssistant';
export { default as ComplianceAssistant } from './ComplianceAssistant';
export { default as AnomalyDetectionAssistant } from './AnomalyDetectionAssistant';
export { default as AILearningEngine } from './AILearningEngine';

// Re-export types and utilities
export type { 
  AIAssistantMessage, 
  AIAssistantContext, 
  AIAssistantConfig,
  AIAssistantResponse,
  AIAssistantAction,
  AIAssistantInsight
} from '../../utils/ai-assistant-utils';
