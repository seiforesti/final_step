/**
 * Racine Context-Aware AI Hook
 * =============================
 * 
 * Comprehensive React hook for context-aware AI functionality that provides
 * state management, API integration, and real-time updates for the master
 * AI assistant system across all 7 data governance groups.
 * 
 * Features:
 * - Context-aware AI assistance and guidance
 * - Natural language processing and understanding
 * - Cross-group intelligence and insights
 * - Proactive recommendations and automation
 * - Workflow automation and smart suggestions
 * - Anomaly detection and predictive analytics
 * - Continuous learning and adaptation
 * - Multi-modal AI interactions (text, voice, visual)
 * 
 * Backend Integration:
 * - Maps to: RacineAIService, AdvancedAIService
 * - Uses: ai-assistant-apis.ts
 * - Real-time: WebSocket events for AI interactions and insights
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  aiAssistantAPI,
  AIEventType,
  AIEvent,
  AIEventHandler
} from '../services/ai-assistant-apis';

import {
  AIConversationResponse,
  CreateAIConversationRequest,
  AIMessageResponse,
  SendAIMessageRequest,
  AIRecommendationResponse,
  AIInsightResponse,
  AIAnalysisResponse,
  ContextAnalysisResponse,
  WorkflowAutomationResponse,
  CreateWorkflowAutomationRequest,
  AnomalyDetectionResponse,
  PredictiveAnalysisResponse,
  AILearningResponse,
  AICapabilityResponse,
  UUID,
  ISODateString,
  OperationStatus,
  FilterRequest
} from '../types/api.types';

import {
  AIContext,
  UserContext,
  SystemContext,
  ConversationState,
  AIInsight,
  AIRecommendation,
  WorkflowAutomation,
  AnomalyDetection,
  PredictiveModel,
  LearningModel,
  AIPersonality
} from '../types/racine-core.types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Context-aware AI hook state interface
 */
export interface ContextAwareAIHookState {
  // AI conversations and interactions
  conversations: AIConversationResponse[];
  activeConversation: AIConversationResponse | null;
  conversationHistory: Record<UUID, AIMessageResponse[]>;
  
  // Context awareness
  currentContext: AIContext | null;
  userContext: UserContext | null;
  systemContext: SystemContext | null;
  contextHistory: AIContext[];
  
  // AI insights and recommendations
  insights: AIInsightResponse[];
  recommendations: AIRecommendationResponse[];
  activeRecommendations: AIRecommendationResponse[];
  dismissedRecommendations: Set<UUID>;
  
  // Analysis and processing
  analysisResults: Record<UUID, AIAnalysisResponse>;
  contextAnalysis: ContextAnalysisResponse | null;
  processingQueue: string[];
  
  // Workflow automation
  automations: WorkflowAutomationResponse[];
  activeAutomations: WorkflowAutomationResponse[];
  automationSuggestions: WorkflowAutomationResponse[];
  
  // Anomaly detection and prediction
  anomalies: AnomalyDetectionResponse[];
  activeAnomalies: AnomalyDetectionResponse[];
  predictiveModels: PredictiveModel[];
  predictions: PredictiveAnalysisResponse[];
  
  // Learning and adaptation
  learningModels: LearningModel[];
  learningProgress: Record<string, number>;
  adaptationHistory: AILearningResponse[];
  
  // AI capabilities and configuration
  availableCapabilities: AICapabilityResponse[];
  enabledCapabilities: Set<string>;
  aiPersonality: AIPersonality;
  confidenceThreshold: number;
  
  // Real-time interaction
  isProcessing: boolean;
  isListening: boolean;
  isTyping: boolean;
  lastInteraction: ISODateString | null;
  
  // Connection status
  isConnected: boolean;
  lastSync: ISODateString | null;
  websocketConnected: boolean;
}

/**
 * Context-aware AI hook operations interface
 */
export interface ContextAwareAIHookOperations {
  // Conversation management
  startConversation: (request: CreateAIConversationRequest) => Promise<AIConversationResponse>;
  sendMessage: (conversationId: UUID, request: SendAIMessageRequest) => Promise<AIMessageResponse>;
  endConversation: (conversationId: UUID) => Promise<void>;
  switchConversation: (conversationId: UUID) => Promise<void>;
  
  // Context analysis
  analyzeContext: (context?: Partial<AIContext>) => Promise<ContextAnalysisResponse>;
  updateContext: (context: Partial<AIContext>) => Promise<void>;
  getContextHistory: (timeRange?: string) => Promise<AIContext[]>;
  clearContext: () => Promise<void>;
  
  // AI insights and recommendations
  getInsights: (scope: string[], timeRange?: string) => Promise<AIInsightResponse[]>;
  generateRecommendations: (context: AIContext, type?: string) => Promise<AIRecommendationResponse[]>;
  acceptRecommendation: (recommendationId: UUID) => Promise<void>;
  dismissRecommendation: (recommendationId: UUID) => Promise<void>;
  
  // Analysis and processing
  analyzeData: (data: any, analysisType: string) => Promise<AIAnalysisResponse>;
  processNaturalLanguage: (text: string, intent?: string) => Promise<any>;
  extractEntities: (text: string) => Promise<any[]>;
  classifyContent: (content: any) => Promise<any>;
  
  // Workflow automation
  createAutomation: (request: CreateWorkflowAutomationRequest) => Promise<WorkflowAutomationResponse>;
  enableAutomation: (automationId: UUID) => Promise<void>;
  disableAutomation: (automationId: UUID) => Promise<void>;
  getAutomationSuggestions: (context: AIContext) => Promise<WorkflowAutomationResponse[]>;
  
  // Anomaly detection and prediction
  detectAnomalies: (data: any, modelType?: string) => Promise<AnomalyDetectionResponse[]>;
  generatePredictions: (data: any, modelType: string, horizon?: string) => Promise<PredictiveAnalysisResponse>;
  acknowledgeAnomaly: (anomalyId: UUID) => Promise<void>;
  createPredictiveModel: (config: any) => Promise<PredictiveModel>;
  
  // Learning and adaptation
  provideFeedback: (interactionId: UUID, feedback: 'positive' | 'negative', details?: string) => Promise<void>;
  trainModel: (modelId: UUID, trainingData: any) => Promise<AILearningResponse>;
  adaptToUser: (preferences: Record<string, any>) => Promise<void>;
  getLearningProgress: (modelId?: UUID) => Promise<Record<string, number>>;
  
  // AI capabilities management
  getAvailableCapabilities: () => Promise<AICapabilityResponse[]>;
  enableCapability: (capabilityId: string) => Promise<void>;
  disableCapability: (capabilityId: string) => Promise<void>;
  configureCapability: (capabilityId: string, config: Record<string, any>) => Promise<void>;
  
  // AI personality and behavior
  updatePersonality: (personality: Partial<AIPersonality>) => Promise<void>;
  setConfidenceThreshold: (threshold: number) => Promise<void>;
  resetPersonality: () => Promise<void>;
  
  // Multi-modal interactions
  processVoiceInput: (audioBlob: Blob) => Promise<string>;
  generateVoiceResponse: (text: string) => Promise<Blob>;
  analyzeImage: (imageBlob: Blob, analysisType?: string) => Promise<any>;
  generateVisualization: (data: any, chartType: string) => Promise<string>;
  
  // Utilities
  refresh: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  exportConversation: (conversationId: UUID, format: 'json' | 'txt') => Promise<Blob>;
}

/**
 * Context-aware AI hook configuration
 */
export interface ContextAwareAIHookConfig {
  userId: UUID;
  autoConnect?: boolean;
  enableRealTime?: boolean;
  enableVoice?: boolean;
  enableLearning?: boolean;
  confidenceThreshold?: number;
  maxConversations?: number;
  refreshInterval?: number;
  retryAttempts?: number;
}

// =============================================================================
// MAIN HOOK IMPLEMENTATION
// =============================================================================

/**
 * Main context-aware AI hook
 */
export const useContextAwareAI = (config: ContextAwareAIHookConfig): [ContextAwareAIHookState, ContextAwareAIHookOperations] => {
  const {
    userId,
    autoConnect = true,
    enableRealTime = true,
    enableVoice = false,
    enableLearning = true,
    confidenceThreshold = 0.8,
    maxConversations = 10,
    refreshInterval = 30000,
    retryAttempts = 3
  } = config;

  // State management
  const [state, setState] = useState<ContextAwareAIHookState>({
    conversations: [],
    activeConversation: null,
    conversationHistory: {},
    currentContext: null,
    userContext: null,
    systemContext: null,
    contextHistory: [],
    insights: [],
    recommendations: [],
    activeRecommendations: [],
    dismissedRecommendations: new Set(),
    analysisResults: {},
    contextAnalysis: null,
    processingQueue: [],
    automations: [],
    activeAutomations: [],
    automationSuggestions: [],
    anomalies: [],
    activeAnomalies: [],
    predictiveModels: [],
    predictions: [],
    learningModels: [],
    learningProgress: {},
    adaptationHistory: [],
    availableCapabilities: [],
    enabledCapabilities: new Set(),
    aiPersonality: {
      name: 'Assistant',
      tone: 'professional',
      verbosity: 'balanced',
      proactiveness: 'moderate',
      expertise: 'generalist'
    },
    confidenceThreshold,
    isProcessing: false,
    isListening: false,
    isTyping: false,
    lastInteraction: null,
    isConnected: false,
    lastSync: null,
    websocketConnected: false
  });

  // Refs for managing subscriptions and intervals
  const eventHandlersRef = useRef<Map<AIEventType, AIEventHandler>>(new Map());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingQueueRef = useRef<string[]>([]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleAIEvent = useCallback((event: AIEvent) => {
    setState(prevState => {
      const newState = { ...prevState };

      switch (event.type) {
        case AIEventType.CONVERSATION_STARTED:
          const conversation = event.data as AIConversationResponse;
          newState.conversations.push(conversation);
          if (newState.conversations.length > maxConversations) {
            newState.conversations = newState.conversations.slice(-maxConversations);
          }
          break;

        case AIEventType.MESSAGE_RECEIVED:
          const message = event.data as AIMessageResponse;
          if (!newState.conversationHistory[message.conversationId]) {
            newState.conversationHistory[message.conversationId] = [];
          }
          newState.conversationHistory[message.conversationId].push(message);
          newState.isTyping = false;
          break;

        case AIEventType.CONTEXT_UPDATED:
          const context = event.data as AIContext;
          newState.currentContext = context;
          newState.contextHistory.push(context);
          if (newState.contextHistory.length > 100) {
            newState.contextHistory = newState.contextHistory.slice(-100);
          }
          break;

        case AIEventType.INSIGHT_GENERATED:
          const insight = event.data as AIInsightResponse;
          newState.insights.push(insight);
          if (newState.insights.length > 50) {
            newState.insights = newState.insights.slice(-50);
          }
          break;

        case AIEventType.RECOMMENDATION_GENERATED:
          const recommendation = event.data as AIRecommendationResponse;
          newState.recommendations.push(recommendation);
          newState.activeRecommendations.push(recommendation);
          break;

        case AIEventType.AUTOMATION_TRIGGERED:
          const automation = event.data as WorkflowAutomationResponse;
          newState.activeAutomations.push(automation);
          break;

        case AIEventType.ANOMALY_DETECTED:
          const anomaly = event.data as AnomalyDetectionResponse;
          newState.anomalies.push(anomaly);
          newState.activeAnomalies.push(anomaly);
          break;

        case AIEventType.PREDICTION_GENERATED:
          const prediction = event.data as PredictiveAnalysisResponse;
          newState.predictions.push(prediction);
          break;

        case AIEventType.LEARNING_PROGRESS_UPDATED:
          const { modelId, progress } = event.data as { modelId: string; progress: number };
          newState.learningProgress[modelId] = progress;
          break;

        case AIEventType.AI_THINKING:
          newState.isProcessing = true;
          newState.isTyping = true;
          break;

        case AIEventType.AI_RESPONSE_READY:
          newState.isProcessing = false;
          newState.isTyping = false;
          break;

        case AIEventType.CONNECTION_STATUS_CHANGED:
          newState.websocketConnected = event.data.connected as boolean;
          break;

        default:
          console.warn('Unknown AI event type:', event.type);
      }

      newState.lastInteraction = new Date().toISOString();
      newState.lastSync = new Date().toISOString();
      return newState;
    });
  }, [maxConversations]);

  // =============================================================================
  // CONVERSATION MANAGEMENT OPERATIONS
  // =============================================================================

  const startConversation = useCallback(async (request: CreateAIConversationRequest): Promise<AIConversationResponse> => {
    try {
      const conversation = await aiAssistantAPI.createConversation(request);
      setState(prevState => ({
        ...prevState,
        conversations: [...prevState.conversations, conversation],
        activeConversation: conversation,
        conversationHistory: {
          ...prevState.conversationHistory,
          [conversation.id]: []
        },
        lastSync: new Date().toISOString()
      }));
      return conversation;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: UUID, request: SendAIMessageRequest): Promise<AIMessageResponse> => {
    try {
      setState(prevState => ({ ...prevState, isProcessing: true, isTyping: true }));
      
      const message = await aiAssistantAPI.sendMessage(conversationId, request);
      
      setState(prevState => ({
        ...prevState,
        conversationHistory: {
          ...prevState.conversationHistory,
          [conversationId]: [...(prevState.conversationHistory[conversationId] || []), message]
        },
        isProcessing: false,
        isTyping: false,
        lastInteraction: new Date().toISOString(),
        lastSync: new Date().toISOString()
      }));
      
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      setState(prevState => ({ ...prevState, isProcessing: false, isTyping: false }));
      throw error;
    }
  }, []);

  const endConversation = useCallback(async (conversationId: UUID): Promise<void> => {
    try {
      await aiAssistantAPI.endConversation(conversationId);
      setState(prevState => ({
        ...prevState,
        conversations: prevState.conversations.map(conv => 
          conv.id === conversationId ? { ...conv, status: 'ended' } : conv
        ),
        activeConversation: prevState.activeConversation?.id === conversationId ? null : prevState.activeConversation,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to end conversation:', error);
      throw error;
    }
  }, []);

  const switchConversation = useCallback(async (conversationId: UUID): Promise<void> => {
    try {
      const conversation = await aiAssistantAPI.getConversation(conversationId);
      const messages = await aiAssistantAPI.getConversationMessages(conversationId);
      
      setState(prevState => ({
        ...prevState,
        activeConversation: conversation,
        conversationHistory: {
          ...prevState.conversationHistory,
          [conversationId]: messages
        },
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to switch conversation:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // CONTEXT ANALYSIS OPERATIONS
  // =============================================================================

  const analyzeContext = useCallback(async (context?: Partial<AIContext>): Promise<ContextAnalysisResponse> => {
    try {
      const contextToAnalyze = context || state.currentContext || {};
      const analysis = await aiAssistantAPI.analyzeContext(contextToAnalyze);
      
      setState(prevState => ({
        ...prevState,
        contextAnalysis: analysis,
        lastSync: new Date().toISOString()
      }));
      
      return analysis;
    } catch (error) {
      console.error('Failed to analyze context:', error);
      throw error;
    }
  }, [state.currentContext]);

  const updateContext = useCallback(async (context: Partial<AIContext>): Promise<void> => {
    try {
      const updatedContext = await aiAssistantAPI.updateContext(context);
      setState(prevState => ({
        ...prevState,
        currentContext: updatedContext,
        contextHistory: [...prevState.contextHistory, updatedContext],
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to update context:', error);
      throw error;
    }
  }, []);

  const getContextHistory = useCallback(async (timeRange = '24h'): Promise<AIContext[]> => {
    try {
      const contextHistory = await aiAssistantAPI.getContextHistory(timeRange);
      setState(prevState => ({
        ...prevState,
        contextHistory,
        lastSync: new Date().toISOString()
      }));
      return contextHistory;
    } catch (error) {
      console.error('Failed to get context history:', error);
      throw error;
    }
  }, []);

  const clearContext = useCallback(async (): Promise<void> => {
    try {
      await aiAssistantAPI.clearContext();
      setState(prevState => ({
        ...prevState,
        currentContext: null,
        contextHistory: [],
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to clear context:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // AI INSIGHTS AND RECOMMENDATIONS OPERATIONS
  // =============================================================================

  const getInsights = useCallback(async (scope: string[], timeRange = '7d'): Promise<AIInsightResponse[]> => {
    try {
      const insights = await aiAssistantAPI.getInsights(scope, timeRange);
      setState(prevState => ({
        ...prevState,
        insights: [...prevState.insights, ...insights],
        lastSync: new Date().toISOString()
      }));
      return insights;
    } catch (error) {
      console.error('Failed to get insights:', error);
      throw error;
    }
  }, []);

  const generateRecommendations = useCallback(async (context: AIContext, type = 'general'): Promise<AIRecommendationResponse[]> => {
    try {
      const recommendations = await aiAssistantAPI.generateRecommendations(context, type);
      setState(prevState => ({
        ...prevState,
        recommendations: [...prevState.recommendations, ...recommendations],
        activeRecommendations: [...prevState.activeRecommendations, ...recommendations],
        lastSync: new Date().toISOString()
      }));
      return recommendations;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      throw error;
    }
  }, []);

  const acceptRecommendation = useCallback(async (recommendationId: UUID): Promise<void> => {
    try {
      await aiAssistantAPI.acceptRecommendation(recommendationId);
      setState(prevState => ({
        ...prevState,
        activeRecommendations: prevState.activeRecommendations.filter(rec => rec.id !== recommendationId),
        recommendations: prevState.recommendations.map(rec => 
          rec.id === recommendationId ? { ...rec, status: 'accepted' } : rec
        ),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to accept recommendation:', error);
      throw error;
    }
  }, []);

  const dismissRecommendation = useCallback(async (recommendationId: UUID): Promise<void> => {
    try {
      await aiAssistantAPI.dismissRecommendation(recommendationId);
      setState(prevState => ({
        ...prevState,
        activeRecommendations: prevState.activeRecommendations.filter(rec => rec.id !== recommendationId),
        dismissedRecommendations: new Set([...prevState.dismissedRecommendations, recommendationId]),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // ANALYSIS AND PROCESSING OPERATIONS
  // =============================================================================

  const analyzeData = useCallback(async (data: any, analysisType: string): Promise<AIAnalysisResponse> => {
    try {
      setState(prevState => ({ ...prevState, isProcessing: true }));
      
      const analysis = await aiAssistantAPI.analyzeData(data, analysisType);
      
      setState(prevState => ({
        ...prevState,
        analysisResults: { ...prevState.analysisResults, [analysis.id]: analysis },
        isProcessing: false,
        lastSync: new Date().toISOString()
      }));
      
      return analysis;
    } catch (error) {
      console.error('Failed to analyze data:', error);
      setState(prevState => ({ ...prevState, isProcessing: false }));
      throw error;
    }
  }, []);

  const processNaturalLanguage = useCallback(async (text: string, intent?: string): Promise<any> => {
    try {
      return await aiAssistantAPI.processNaturalLanguage(text, intent);
    } catch (error) {
      console.error('Failed to process natural language:', error);
      throw error;
    }
  }, []);

  const extractEntities = useCallback(async (text: string): Promise<any[]> => {
    try {
      return await aiAssistantAPI.extractEntities(text);
    } catch (error) {
      console.error('Failed to extract entities:', error);
      throw error;
    }
  }, []);

  const classifyContent = useCallback(async (content: any): Promise<any> => {
    try {
      return await aiAssistantAPI.classifyContent(content);
    } catch (error) {
      console.error('Failed to classify content:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // WORKFLOW AUTOMATION OPERATIONS
  // =============================================================================

  const createAutomation = useCallback(async (request: CreateWorkflowAutomationRequest): Promise<WorkflowAutomationResponse> => {
    try {
      const automation = await aiAssistantAPI.createAutomation(request);
      setState(prevState => ({
        ...prevState,
        automations: [...prevState.automations, automation],
        lastSync: new Date().toISOString()
      }));
      return automation;
    } catch (error) {
      console.error('Failed to create automation:', error);
      throw error;
    }
  }, []);

  const enableAutomation = useCallback(async (automationId: UUID): Promise<void> => {
    try {
      await aiAssistantAPI.enableAutomation(automationId);
      setState(prevState => ({
        ...prevState,
        automations: prevState.automations.map(auto => 
          auto.id === automationId ? { ...auto, status: 'enabled' } : auto
        ),
        activeAutomations: [...prevState.activeAutomations, ...prevState.automations.filter(auto => auto.id === automationId)],
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to enable automation:', error);
      throw error;
    }
  }, []);

  const disableAutomation = useCallback(async (automationId: UUID): Promise<void> => {
    try {
      await aiAssistantAPI.disableAutomation(automationId);
      setState(prevState => ({
        ...prevState,
        automations: prevState.automations.map(auto => 
          auto.id === automationId ? { ...auto, status: 'disabled' } : auto
        ),
        activeAutomations: prevState.activeAutomations.filter(auto => auto.id !== automationId),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to disable automation:', error);
      throw error;
    }
  }, []);

  const getAutomationSuggestions = useCallback(async (context: AIContext): Promise<WorkflowAutomationResponse[]> => {
    try {
      const suggestions = await aiAssistantAPI.getAutomationSuggestions(context);
      setState(prevState => ({
        ...prevState,
        automationSuggestions: suggestions,
        lastSync: new Date().toISOString()
      }));
      return suggestions;
    } catch (error) {
      console.error('Failed to get automation suggestions:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // ANOMALY DETECTION AND PREDICTION OPERATIONS
  // =============================================================================

  const detectAnomalies = useCallback(async (data: any, modelType = 'general'): Promise<AnomalyDetectionResponse[]> => {
    try {
      const anomalies = await aiAssistantAPI.detectAnomalies(data, modelType);
      setState(prevState => ({
        ...prevState,
        anomalies: [...prevState.anomalies, ...anomalies],
        activeAnomalies: [...prevState.activeAnomalies, ...anomalies.filter(a => a.severity === 'high')],
        lastSync: new Date().toISOString()
      }));
      return anomalies;
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      throw error;
    }
  }, []);

  const generatePredictions = useCallback(async (data: any, modelType: string, horizon = '7d'): Promise<PredictiveAnalysisResponse> => {
    try {
      const prediction = await aiAssistantAPI.generatePredictions(data, modelType, horizon);
      setState(prevState => ({
        ...prevState,
        predictions: [...prevState.predictions, prediction],
        lastSync: new Date().toISOString()
      }));
      return prediction;
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      throw error;
    }
  }, []);

  const acknowledgeAnomaly = useCallback(async (anomalyId: UUID): Promise<void> => {
    try {
      await aiAssistantAPI.acknowledgeAnomaly(anomalyId);
      setState(prevState => ({
        ...prevState,
        activeAnomalies: prevState.activeAnomalies.filter(anomaly => anomaly.id !== anomalyId),
        anomalies: prevState.anomalies.map(anomaly => 
          anomaly.id === anomalyId ? { ...anomaly, status: 'acknowledged' } : anomaly
        ),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to acknowledge anomaly:', error);
      throw error;
    }
  }, []);

  const createPredictiveModel = useCallback(async (config: any): Promise<PredictiveModel> => {
    try {
      const model = await aiAssistantAPI.createPredictiveModel(config);
      setState(prevState => ({
        ...prevState,
        predictiveModels: [...prevState.predictiveModels, model],
        lastSync: new Date().toISOString()
      }));
      return model;
    } catch (error) {
      console.error('Failed to create predictive model:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // LEARNING AND ADAPTATION OPERATIONS
  // =============================================================================

  const provideFeedback = useCallback(async (interactionId: UUID, feedback: 'positive' | 'negative', details?: string): Promise<void> => {
    try {
      await aiAssistantAPI.provideFeedback(interactionId, feedback, details);
      setState(prevState => ({
        ...prevState,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to provide feedback:', error);
      throw error;
    }
  }, []);

  const trainModel = useCallback(async (modelId: UUID, trainingData: any): Promise<AILearningResponse> => {
    try {
      const learningResponse = await aiAssistantAPI.trainModel(modelId, trainingData);
      setState(prevState => ({
        ...prevState,
        adaptationHistory: [...prevState.adaptationHistory, learningResponse],
        lastSync: new Date().toISOString()
      }));
      return learningResponse;
    } catch (error) {
      console.error('Failed to train model:', error);
      throw error;
    }
  }, []);

  const adaptToUser = useCallback(async (preferences: Record<string, any>): Promise<void> => {
    try {
      await aiAssistantAPI.adaptToUser(preferences);
      setState(prevState => ({
        ...prevState,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to adapt to user:', error);
      throw error;
    }
  }, []);

  const getLearningProgress = useCallback(async (modelId?: UUID): Promise<Record<string, number>> => {
    try {
      const progress = await aiAssistantAPI.getLearningProgress(modelId);
      setState(prevState => ({
        ...prevState,
        learningProgress: { ...prevState.learningProgress, ...progress },
        lastSync: new Date().toISOString()
      }));
      return progress;
    } catch (error) {
      console.error('Failed to get learning progress:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // AI CAPABILITIES MANAGEMENT OPERATIONS
  // =============================================================================

  const getAvailableCapabilities = useCallback(async (): Promise<AICapabilityResponse[]> => {
    try {
      const capabilities = await aiAssistantAPI.getAvailableCapabilities();
      setState(prevState => ({
        ...prevState,
        availableCapabilities: capabilities,
        lastSync: new Date().toISOString()
      }));
      return capabilities;
    } catch (error) {
      console.error('Failed to get available capabilities:', error);
      throw error;
    }
  }, []);

  const enableCapability = useCallback(async (capabilityId: string): Promise<void> => {
    try {
      await aiAssistantAPI.enableCapability(capabilityId);
      setState(prevState => ({
        ...prevState,
        enabledCapabilities: new Set([...prevState.enabledCapabilities, capabilityId]),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to enable capability:', error);
      throw error;
    }
  }, []);

  const disableCapability = useCallback(async (capabilityId: string): Promise<void> => {
    try {
      await aiAssistantAPI.disableCapability(capabilityId);
      setState(prevState => {
        const newEnabledCapabilities = new Set(prevState.enabledCapabilities);
        newEnabledCapabilities.delete(capabilityId);
        return {
          ...prevState,
          enabledCapabilities: newEnabledCapabilities,
          lastSync: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Failed to disable capability:', error);
      throw error;
    }
  }, []);

  const configureCapability = useCallback(async (capabilityId: string, config: Record<string, any>): Promise<void> => {
    try {
      await aiAssistantAPI.configureCapability(capabilityId, config);
      setState(prevState => ({
        ...prevState,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to configure capability:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // AI PERSONALITY AND BEHAVIOR OPERATIONS
  // =============================================================================

  const updatePersonality = useCallback(async (personality: Partial<AIPersonality>): Promise<void> => {
    try {
      await aiAssistantAPI.updatePersonality(personality);
      setState(prevState => ({
        ...prevState,
        aiPersonality: { ...prevState.aiPersonality, ...personality },
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to update personality:', error);
      throw error;
    }
  }, []);

  const setConfidenceThreshold = useCallback(async (threshold: number): Promise<void> => {
    try {
      await aiAssistantAPI.setConfidenceThreshold(threshold);
      setState(prevState => ({
        ...prevState,
        confidenceThreshold: threshold,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to set confidence threshold:', error);
      throw error;
    }
  }, []);

  const resetPersonality = useCallback(async (): Promise<void> => {
    try {
      await aiAssistantAPI.resetPersonality();
      setState(prevState => ({
        ...prevState,
        aiPersonality: {
          name: 'Assistant',
          tone: 'professional',
          verbosity: 'balanced',
          proactiveness: 'moderate',
          expertise: 'generalist'
        },
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to reset personality:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // MULTI-MODAL INTERACTIONS OPERATIONS
  // =============================================================================

  const processVoiceInput = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      setState(prevState => ({ ...prevState, isListening: true }));
      const text = await aiAssistantAPI.processVoiceInput(audioBlob);
      setState(prevState => ({ ...prevState, isListening: false }));
      return text;
    } catch (error) {
      console.error('Failed to process voice input:', error);
      setState(prevState => ({ ...prevState, isListening: false }));
      throw error;
    }
  }, []);

  const generateVoiceResponse = useCallback(async (text: string): Promise<Blob> => {
    try {
      return await aiAssistantAPI.generateVoiceResponse(text);
    } catch (error) {
      console.error('Failed to generate voice response:', error);
      throw error;
    }
  }, []);

  const analyzeImage = useCallback(async (imageBlob: Blob, analysisType = 'general'): Promise<any> => {
    try {
      return await aiAssistantAPI.analyzeImage(imageBlob, analysisType);
    } catch (error) {
      console.error('Failed to analyze image:', error);
      throw error;
    }
  }, []);

  const generateVisualization = useCallback(async (data: any, chartType: string): Promise<string> => {
    try {
      return await aiAssistantAPI.generateVisualization(data, chartType);
    } catch (error) {
      console.error('Failed to generate visualization:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // UTILITY OPERATIONS
  // =============================================================================

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setState(prevState => ({ ...prevState, isConnected: false }));
      
      // Fetch all AI data
      const [conversations, capabilities, insights, recommendations, automations] = await Promise.all([
        aiAssistantAPI.getConversations(),
        aiAssistantAPI.getAvailableCapabilities(),
        aiAssistantAPI.getInsights(['all']),
        aiAssistantAPI.getRecommendations(),
        aiAssistantAPI.getAutomations()
      ]);

      setState(prevState => ({
        ...prevState,
        conversations,
        availableCapabilities: capabilities,
        insights,
        recommendations,
        activeRecommendations: recommendations.filter(rec => rec.status === 'active'),
        automations,
        activeAutomations: automations.filter(auto => auto.status === 'enabled'),
        isConnected: true,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to refresh AI data:', error);
      setState(prevState => ({ ...prevState, isConnected: false }));
      throw error;
    }
  }, []);

  const disconnect = useCallback((): void => {
    if (enableRealTime) {
      aiAssistantAPI.unsubscribeFromEvents();
    }
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setState(prevState => ({
      ...prevState,
      isConnected: false,
      websocketConnected: false,
      isProcessing: false,
      isListening: false,
      isTyping: false
    }));
  }, [enableRealTime]);

  const reconnect = useCallback(async (): Promise<void> => {
    disconnect();
    
    if (autoConnect) {
      try {
        await refresh();
        
        if (enableRealTime) {
          aiAssistantAPI.subscribeToEvents(handleAIEvent);
        }
        
        // Set up refresh interval
        refreshIntervalRef.current = setInterval(refresh, refreshInterval);
        
        setState(prevState => ({
          ...prevState,
          websocketConnected: enableRealTime
        }));
      } catch (error) {
        console.error('Failed to reconnect:', error);
        
        // Retry with exponential backoff
        if (retryAttempts > 0) {
          retryTimeoutRef.current = setTimeout(() => {
            reconnect();
          }, Math.min(30000, 1000 * Math.pow(2, 3 - retryAttempts)));
        }
      }
    }
  }, [autoConnect, enableRealTime, refresh, refreshInterval, retryAttempts, handleAIEvent, disconnect]);

  const exportConversation = useCallback(async (conversationId: UUID, format: 'json' | 'txt'): Promise<Blob> => {
    try {
      return await aiAssistantAPI.exportConversation(conversationId, format);
    } catch (error) {
      console.error('Failed to export conversation:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize AI connection
  useEffect(() => {
    if (autoConnect) {
      reconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, reconnect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // =============================================================================
  // MEMOIZED OPERATIONS
  // =============================================================================

  const operations = useMemo<ContextAwareAIHookOperations>(() => ({
    startConversation,
    sendMessage,
    endConversation,
    switchConversation,
    analyzeContext,
    updateContext,
    getContextHistory,
    clearContext,
    getInsights,
    generateRecommendations,
    acceptRecommendation,
    dismissRecommendation,
    analyzeData,
    processNaturalLanguage,
    extractEntities,
    classifyContent,
    createAutomation,
    enableAutomation,
    disableAutomation,
    getAutomationSuggestions,
    detectAnomalies,
    generatePredictions,
    acknowledgeAnomaly,
    createPredictiveModel,
    provideFeedback,
    trainModel,
    adaptToUser,
    getLearningProgress,
    getAvailableCapabilities,
    enableCapability,
    disableCapability,
    configureCapability,
    updatePersonality,
    setConfidenceThreshold,
    resetPersonality,
    processVoiceInput,
    generateVoiceResponse,
    analyzeImage,
    generateVisualization,
    refresh,
    disconnect,
    reconnect,
    exportConversation
  }), [
    startConversation,
    sendMessage,
    endConversation,
    switchConversation,
    analyzeContext,
    updateContext,
    getContextHistory,
    clearContext,
    getInsights,
    generateRecommendations,
    acceptRecommendation,
    dismissRecommendation,
    analyzeData,
    processNaturalLanguage,
    extractEntities,
    classifyContent,
    createAutomation,
    enableAutomation,
    disableAutomation,
    getAutomationSuggestions,
    detectAnomalies,
    generatePredictions,
    acknowledgeAnomaly,
    createPredictiveModel,
    provideFeedback,
    trainModel,
    adaptToUser,
    getLearningProgress,
    getAvailableCapabilities,
    enableCapability,
    disableCapability,
    configureCapability,
    updatePersonality,
    setConfidenceThreshold,
    resetPersonality,
    processVoiceInput,
    generateVoiceResponse,
    analyzeImage,
    generateVisualization,
    refresh,
    disconnect,
    reconnect,
    exportConversation
  ]);

  return [state, operations];
};

export default useContextAwareAI;
