/**
 * useAIAssistant Hook
 * ===================
 * 
 * React hook for managing AI assistant state, conversations, and intelligent interactions.
 * Maps to the AI assistant API service and provides reactive state management
 * for AI-powered assistance, recommendations, and automation.
 * 
 * Features:
 * - Context-aware conversation management
 * - Real-time AI responses and recommendations
 * - Cross-group insights and analysis
 * - Proactive assistance and automation
 * - Learning and adaptation capabilities
 * - Natural language processing and understanding
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  aiAssistantAPI, 
  AIEventType, 
  type AIEvent,
  type AIEventHandler,
  type ConversationContext
} from '../services/ai-assistant-apis';
import {
  RacineAIConversation,
  AIMessage,
  AIRecommendation,
  CrossGroupInsight,
  WorkflowSuggestion,
  AIOptimization,
  ComplianceGuidance,
  GeneratedCode,
  TroubleshootingResult,
  UUID
} from '../types/racine-core.types';
import {
  StartConversationRequest,
  SendMessageRequest,
  ContextAnalysisRequest,
  RecommendationRequest,
  CrossGroupInsightsRequest,
  OptimizationRequest,
  ComplianceGuidanceRequest,
  CodeGenerationRequest,
  TroubleshootingRequest
} from '../types/api.types';

/**
 * AI assistant state interface
 */
interface AIAssistantState {
  conversations: RacineAIConversation[];
  activeConversation: RacineAIConversation | null;
  messages: AIMessage[];
  recommendations: AIRecommendation[];
  insights: CrossGroupInsight[];
  workflowSuggestions: WorkflowSuggestion[];
  optimizations: AIOptimization[];
  complianceGuidance: ComplianceGuidance[];
  generatedCode: GeneratedCode[];
  troubleshootingResults: TroubleshootingResult[];
  assistantState: {
    isTyping: boolean;
    isListening: boolean;
    contextAware: boolean;
    proactiveMode: boolean;
    learningEnabled: boolean;
    voiceEnabled: boolean;
  };
  loading: {
    conversation: boolean;
    message: boolean;
    recommendations: boolean;
    insights: boolean;
    optimization: boolean;
    troubleshooting: boolean;
  };
  errors: {
    conversation: string | null;
    message: string | null;
    recommendations: string | null;
    insights: string | null;
    optimization: string | null;
  };
  context: ConversationContext | null;
  learningData: Map<string, any>;
}

/**
 * Initial state
 */
const initialState: AIAssistantState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  recommendations: [],
  insights: [],
  workflowSuggestions: [],
  optimizations: [],
  complianceGuidance: [],
  generatedCode: [],
  troubleshootingResults: [],
  assistantState: {
    isTyping: false,
    isListening: false,
    contextAware: true,
    proactiveMode: true,
    learningEnabled: true,
    voiceEnabled: false
  },
  loading: {
    conversation: false,
    message: false,
    recommendations: false,
    insights: false,
    optimization: false,
    troubleshooting: false
  },
  errors: {
    conversation: null,
    message: null,
    recommendations: null,
    insights: null,
    optimization: null
  },
  context: null,
  learningData: new Map()
};

/**
 * Hook options interface
 */
interface UseAIAssistantOptions {
  enableRealTimeUpdates?: boolean;
  enableContextAwareness?: boolean;
  enableProactiveMode?: boolean;
  enableLearning?: boolean;
  contextUpdateInterval?: number;
  recommendationInterval?: number;
  onNewRecommendation?: (recommendation: AIRecommendation) => void;
  onNewInsight?: (insight: CrossGroupInsight) => void;
  onOptimizationSuggestion?: (optimization: AIOptimization) => void;
  onError?: (error: string, operation: string) => void;
}

/**
 * useAIAssistant hook
 */
export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const {
    enableRealTimeUpdates = true,
    enableContextAwareness = true,
    enableProactiveMode = true,
    enableLearning = true,
    contextUpdateInterval = 10000,
    recommendationInterval = 30000,
    onNewRecommendation,
    onNewInsight,
    onOptimizationSuggestion,
    onError
  } = options;

  const [state, setState] = useState<AIAssistantState>(initialState);
  const eventSubscriptions = useRef<UUID[]>([]);
  const contextUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  const recommendationTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // =============================================================================
  // STATE MANAGEMENT HELPERS
  // =============================================================================

  const updateState = useCallback((updater: Partial<AIAssistantState> | ((prev: AIAssistantState) => AIAssistantState)) => {
    setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
  }, []);

  const setLoading = useCallback((key: keyof AIAssistantState['loading'], value: boolean) => {
    updateState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, [updateState]);

  const setError = useCallback((key: keyof AIAssistantState['errors'], error: string | null) => {
    updateState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
    
    if (error && onError) {
      onError(error, key);
    }
  }, [updateState, onError]);

  const updateAssistantState = useCallback((updates: Partial<AIAssistantState['assistantState']>) => {
    updateState(prev => ({
      ...prev,
      assistantState: { ...prev.assistantState, ...updates }
    }));
  }, [updateState]);

  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================

  const startConversation = useCallback(async (request: StartConversationRequest): Promise<RacineAIConversation | null> => {
    setLoading('conversation', true);
    setError('conversation', null);

    try {
      const conversation = await aiAssistantAPI.startConversation(request);

      updateState(prev => ({
        ...prev,
        conversations: [conversation, ...prev.conversations],
        activeConversation: conversation,
        messages: [] // Reset messages for new conversation
      }));

      return conversation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start conversation';
      setError('conversation', message);
      return null;
    } finally {
      setLoading('conversation', false);
    }
  }, [setLoading, setError, updateState]);

  const sendMessage = useCallback(async (
    conversationId: UUID,
    request: SendMessageRequest
  ): Promise<AIMessage | null> => {
    setLoading('message', true);
    setError('message', null);
    updateAssistantState({ isTyping: true });

    try {
      const response = await aiAssistantAPI.sendMessage(conversationId, request);

      // Add both user and AI messages
      updateState(prev => ({
        ...prev,
        messages: [...prev.messages, response.userMessage, response.aiMessage]
      }));

      // Store learning data if enabled
      if (enableLearning) {
        updateState(prev => {
          const newLearningData = new Map(prev.learningData);
          newLearningData.set(`interaction_${Date.now()}`, {
            userMessage: response.userMessage,
            aiMessage: response.aiMessage,
            context: state.context,
            timestamp: new Date().toISOString()
          });
          return { ...prev, learningData: newLearningData };
        });
      }

      return response.aiMessage;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      setError('message', message);
      return null;
    } finally {
      setLoading('message', false);
      updateAssistantState({ isTyping: false });
    }
  }, [setLoading, setError, updateState, updateAssistantState, enableLearning, state.context]);

  const loadConversationHistory = useCallback(async (conversationId: UUID): Promise<void> => {
    try {
      const messages = await aiAssistantAPI.getConversationHistory(conversationId);
      updateState(prev => ({ ...prev, messages }));
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }, [updateState]);

  const endConversation = useCallback(async (conversationId: UUID): Promise<boolean> => {
    try {
      await aiAssistantAPI.endConversation(conversationId);

      updateState(prev => ({
        ...prev,
        activeConversation: prev.activeConversation?.id === conversationId ? null : prev.activeConversation,
        messages: prev.activeConversation?.id === conversationId ? [] : prev.messages
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to end conversation';
      setError('conversation', message);
      return false;
    }
  }, [updateState, setError]);

  // =============================================================================
  // CONTEXT ANALYSIS
  // =============================================================================

  const analyzeContext = useCallback(async (request: ContextAnalysisRequest): Promise<ConversationContext | null> => {
    try {
      const context = await aiAssistantAPI.analyzeContext(request);
      updateState(prev => ({ ...prev, context }));
      return context;
    } catch (error) {
      console.error('Failed to analyze context:', error);
      return null;
    }
  }, [updateState]);

  const updateContextAutomatically = useCallback(async (): Promise<void> => {
    if (!enableContextAwareness || !state.activeConversation) {
      return;
    }

    try {
      const context = await aiAssistantAPI.analyzeContext({
        conversation_id: state.activeConversation.id,
        include_cross_group_data: true,
        include_user_activity: true,
        include_system_state: true
      });

      updateState(prev => ({ ...prev, context }));
    } catch (error) {
      console.error('Failed to update context automatically:', error);
    }
  }, [enableContextAwareness, state.activeConversation, updateState]);

  // =============================================================================
  // RECOMMENDATIONS AND INSIGHTS
  // =============================================================================

  const getRecommendations = useCallback(async (request: RecommendationRequest): Promise<void> => {
    setLoading('recommendations', true);
    setError('recommendations', null);

    try {
      const recommendations = await aiAssistantAPI.getRecommendations(request);

      updateState(prev => ({
        ...prev,
        recommendations: [...recommendations, ...prev.recommendations].slice(0, 50) // Keep latest 50
      }));

      // Notify about new recommendations
      if (onNewRecommendation && recommendations.length > 0) {
        recommendations.forEach(rec => onNewRecommendation(rec));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get recommendations';
      setError('recommendations', message);
    } finally {
      setLoading('recommendations', false);
    }
  }, [setLoading, setError, updateState, onNewRecommendation]);

  const getCrossGroupInsights = useCallback(async (request: CrossGroupInsightsRequest): Promise<void> => {
    setLoading('insights', true);
    setError('insights', null);

    try {
      const insights = await aiAssistantAPI.getCrossGroupInsights(request);

      updateState(prev => ({
        ...prev,
        insights: [...insights, ...prev.insights].slice(0, 30) // Keep latest 30
      }));

      // Notify about new insights
      if (onNewInsight && insights.length > 0) {
        insights.forEach(insight => onNewInsight(insight));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get cross-group insights';
      setError('insights', message);
    } finally {
      setLoading('insights', false);
    }
  }, [setLoading, setError, updateState, onNewInsight]);

  const suggestWorkflow = useCallback(async (
    workflowType: string,
    context?: Record<string, any>
  ): Promise<WorkflowSuggestion | null> => {
    try {
      const suggestion = await aiAssistantAPI.suggestWorkflow({
        workflow_type: workflowType,
        context: context || {}
      });

      updateState(prev => ({
        ...prev,
        workflowSuggestions: [suggestion, ...prev.workflowSuggestions].slice(0, 20)
      }));

      return suggestion;
    } catch (error) {
      console.error('Failed to suggest workflow:', error);
      return null;
    }
  }, [updateState]);

  // =============================================================================
  // OPTIMIZATION AND AUTOMATION
  // =============================================================================

  const optimizeResource = useCallback(async (request: OptimizationRequest): Promise<void> => {
    setLoading('optimization', true);
    setError('optimization', null);

    try {
      const optimization = await aiAssistantAPI.optimize(request);

      updateState(prev => ({
        ...prev,
        optimizations: [optimization, ...prev.optimizations].slice(0, 20)
      }));

      if (onOptimizationSuggestion) {
        onOptimizationSuggestion(optimization);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to optimize resource';
      setError('optimization', message);
    } finally {
      setLoading('optimization', false);
    }
  }, [setLoading, setError, updateState, onOptimizationSuggestion]);

  const detectAnomalies = useCallback(async (
    resourceType: string,
    resourceId: UUID,
    timeRange?: { start: string; end: string }
  ): Promise<any[]> => {
    try {
      return await aiAssistantAPI.detectAnomalies({
        resource_type: resourceType,
        resource_id: resourceId,
        time_range: timeRange
      });
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      return [];
    }
  }, []);

  const getComplianceGuidance = useCallback(async (request: ComplianceGuidanceRequest): Promise<void> => {
    try {
      const guidance = await aiAssistantAPI.getComplianceGuidance(request);

      updateState(prev => ({
        ...prev,
        complianceGuidance: [guidance, ...prev.complianceGuidance].slice(0, 15)
      }));
    } catch (error) {
      console.error('Failed to get compliance guidance:', error);
    }
  }, [updateState]);

  // =============================================================================
  // CODE GENERATION AND TROUBLESHOOTING
  // =============================================================================

  const generateCode = useCallback(async (request: CodeGenerationRequest): Promise<GeneratedCode | null> => {
    try {
      const code = await aiAssistantAPI.generateCode(request);

      updateState(prev => ({
        ...prev,
        generatedCode: [code, ...prev.generatedCode].slice(0, 10)
      }));

      return code;
    } catch (error) {
      console.error('Failed to generate code:', error);
      return null;
    }
  }, [updateState]);

  const troubleshoot = useCallback(async (request: TroubleshootingRequest): Promise<void> => {
    setLoading('troubleshooting', true);

    try {
      const result = await aiAssistantAPI.troubleshoot(request);

      updateState(prev => ({
        ...prev,
        troubleshootingResults: [result, ...prev.troubleshootingResults].slice(0, 15)
      }));
    } catch (error) {
      console.error('Failed to troubleshoot:', error);
    } finally {
      setLoading('troubleshooting', false);
    }
  }, [setLoading, updateState]);

  // =============================================================================
  // PROACTIVE RECOMMENDATIONS
  // =============================================================================

  const setupProactiveRecommendations = useCallback(() => {
    if (recommendationTimer.current) {
      clearInterval(recommendationTimer.current);
    }

    if (enableProactiveMode) {
      recommendationTimer.current = setInterval(async () => {
        try {
          await getRecommendations({
            context: state.context,
            include_cross_group: true,
            recommendation_types: ['optimization', 'security', 'compliance', 'workflow']
          });
        } catch (error) {
          console.error('Proactive recommendations failed:', error);
        }
      }, recommendationInterval);
    }
  }, [enableProactiveMode, recommendationInterval, getRecommendations, state.context]);

  const setupContextUpdates = useCallback(() => {
    if (contextUpdateTimer.current) {
      clearInterval(contextUpdateTimer.current);
    }

    if (enableContextAwareness) {
      contextUpdateTimer.current = setInterval(() => {
        updateContextAutomatically();
      }, contextUpdateInterval);
    }
  }, [enableContextAwareness, contextUpdateInterval, updateContextAutomatically]);

  // =============================================================================
  // LEARNING AND ADAPTATION
  // =============================================================================

  const submitLearningData = useCallback(async (): Promise<void> => {
    if (!enableLearning || state.learningData.size === 0) {
      return;
    }

    try {
      const learningArray = Array.from(state.learningData.values());
      await aiAssistantAPI.submitLearningData(learningArray);

      // Clear submitted learning data
      updateState(prev => ({ ...prev, learningData: new Map() }));
    } catch (error) {
      console.error('Failed to submit learning data:', error);
    }
  }, [enableLearning, state.learningData, updateState]);

  // =============================================================================
  // REAL-TIME EVENT HANDLING
  // =============================================================================

  const handleAIEvent: AIEventHandler = useCallback((event: AIEvent) => {
    switch (event.type) {
      case AIEventType.CONVERSATION_STARTED:
        if (event.data.conversation) {
          updateState(prev => ({
            ...prev,
            conversations: [event.data.conversation, ...prev.conversations]
          }));
        }
        break;

      case AIEventType.MESSAGE_RECEIVED:
        if (event.data.message) {
          updateState(prev => ({
            ...prev,
            messages: [...prev.messages, event.data.message]
          }));
        }
        break;

      case AIEventType.RECOMMENDATION_GENERATED:
        if (event.data.recommendation) {
          updateState(prev => ({
            ...prev,
            recommendations: [event.data.recommendation, ...prev.recommendations]
          }));

          if (onNewRecommendation) {
            onNewRecommendation(event.data.recommendation);
          }
        }
        break;

      case AIEventType.INSIGHT_DISCOVERED:
        if (event.data.insight) {
          updateState(prev => ({
            ...prev,
            insights: [event.data.insight, ...prev.insights]
          }));

          if (onNewInsight) {
            onNewInsight(event.data.insight);
          }
        }
        break;

      case AIEventType.OPTIMIZATION_SUGGESTED:
        if (event.data.optimization) {
          updateState(prev => ({
            ...prev,
            optimizations: [event.data.optimization, ...prev.optimizations]
          }));

          if (onOptimizationSuggestion) {
            onOptimizationSuggestion(event.data.optimization);
          }
        }
        break;
    }
  }, [updateState, onNewRecommendation, onNewInsight, onOptimizationSuggestion]);

  // =============================================================================
  // INITIALIZATION AND CLEANUP
  // =============================================================================

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Initialize real-time updates
      if (enableRealTimeUpdates) {
        aiAssistantAPI.initializeRealTimeUpdates();

        Object.values(AIEventType).forEach(eventType => {
          const id = aiAssistantAPI.subscribeToEvents(eventType, handleAIEvent);
          eventSubscriptions.current.push(id);
        });
      }
    }

    return () => {
      // Cleanup subscriptions
      eventSubscriptions.current.forEach(id => {
        aiAssistantAPI.unsubscribeFromEvents(id);
      });
      eventSubscriptions.current = [];

      // Cleanup timers
      if (contextUpdateTimer.current) {
        clearInterval(contextUpdateTimer.current);
      }
      if (recommendationTimer.current) {
        clearInterval(recommendationTimer.current);
      }
    };
  }, [enableRealTimeUpdates, handleAIEvent]);

  // Setup proactive features
  useEffect(() => {
    setupProactiveRecommendations();
    setupContextUpdates();
  }, [setupProactiveRecommendations, setupContextUpdates]);

  // Submit learning data periodically
  useEffect(() => {
    const learningTimer = setInterval(() => {
      submitLearningData();
    }, 60000); // Submit every minute

    return () => clearInterval(learningTimer);
  }, [submitLearningData]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // State
    ...state,
    
    // Loading states
    isLoading: Object.values(state.loading).some(Boolean),
    
    // Conversation management
    startConversation,
    sendMessage,
    loadConversationHistory,
    endConversation,
    
    // Context analysis
    analyzeContext,
    updateContextAutomatically,
    
    // Recommendations and insights
    getRecommendations,
    getCrossGroupInsights,
    suggestWorkflow,
    
    // Optimization and automation
    optimizeResource,
    detectAnomalies,
    getComplianceGuidance,
    
    // Code generation and troubleshooting
    generateCode,
    troubleshoot,
    
    // Assistant state management
    updateAssistantState,
    
    // Learning
    submitLearningData,
    
    // Utility functions
    clearErrors: useCallback(() => {
      updateState(prev => ({
        ...prev,
        errors: {
          conversation: null,
          message: null,
          recommendations: null,
          insights: null,
          optimization: null
        }
      }));
    }, [updateState]),
    
    clearHistory: useCallback(() => {
      updateState(prev => ({
        ...prev,
        messages: [],
        recommendations: [],
        insights: [],
        workflowSuggestions: [],
        optimizations: [],
        complianceGuidance: [],
        generatedCode: [],
        troubleshootingResults: []
      }));
    }, [updateState])
  };
}