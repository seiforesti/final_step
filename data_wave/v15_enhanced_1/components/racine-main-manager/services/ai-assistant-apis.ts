/**
 * Racine AI Assistant API Service
 * ================================
 * 
 * Comprehensive API service for AI assistant functionality that maps 100%
 * to the backend RacineAIService and provides context-aware AI assistance
 * with cross-group intelligence and proactive recommendations.
 * 
 * Features:
 * - Natural language query processing and conversation management
 * - Context-aware assistance with deep system understanding
 * - Cross-group insights and intelligent recommendations
 * - Proactive guidance and workflow automation suggestions
 * - Continuous learning from user interactions and system behavior
 * - Advanced anomaly detection and compliance assistance
 * - AI-driven optimization recommendations
 * - Intelligent code generation and troubleshooting
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_ai_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_ai_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_ai_models.py
 */

import {
  APIResponse,
  AIQueryRequest,
  AIQueryResponse,
  AIConversationResponse,
  AIRecommendationResponse,
  AIInsightResponse,
  ContextAnalysisRequest,
  ContextAnalysisResponse,
  OptimizationRequest,
  OptimizationRecommendationResponse,
  AnomalyDetectionRequest,
  AnomalyDetectionResponse,
  CodeGenerationRequest,
  CodeGenerationResponse,
  AILearningUpdateRequest,
  UUID,
  ISODateString,
  PaginationRequest,
  FilterRequest
} from '../types/api.types';

import {
  AIConversation,
  AIMessage,
  AIRecommendation,
  AIInsight,
  UserContext,
  SystemContext,
  AILearningData,
  AnomalyAlert,
  ComplianceGuidance,
  WorkflowSuggestion,
  CrossGroupInsight,
  OptimizationSuggestion
} from '../types/racine-core.types';

/**
 * Configuration for the AI assistant API service
 */
interface AIAssistantAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableContextAnalysis: boolean;
  enableProactiveRecommendations: boolean;
  enableLearning: boolean;
  websocketURL?: string;
  contextUpdateInterval: number;
  learningBatchSize: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AIAssistantAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 45000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableContextAnalysis: true,
  enableProactiveRecommendations: true,
  enableLearning: true,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  contextUpdateInterval: 30000,
  learningBatchSize: 10
};

/**
 * AI event types for real-time updates
 */
export enum AIEventType {
  CONVERSATION_STARTED = 'conversation_started',
  MESSAGE_RECEIVED = 'message_received',
  RECOMMENDATION_GENERATED = 'recommendation_generated',
  INSIGHT_DISCOVERED = 'insight_discovered',
  ANOMALY_DETECTED = 'anomaly_detected',
  CONTEXT_UPDATED = 'context_updated',
  LEARNING_UPDATED = 'learning_updated',
  OPTIMIZATION_SUGGESTED = 'optimization_suggested',
  WORKFLOW_SUGGESTED = 'workflow_suggested',
  COMPLIANCE_ALERT = 'compliance_alert'
}

/**
 * AI event data structure
 */
export interface AIEvent {
  type: AIEventType;
  conversationId?: UUID;
  userId: UUID;
  timestamp: ISODateString;
  data: any;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Event handler function type
 */
export type AIEventHandler = (event: AIEvent) => void;

/**
 * Event subscription interface
 */
export interface AIEventSubscription {
  id: UUID;
  eventType: AIEventType;
  handler: AIEventHandler;
  conversationId?: UUID;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * AI query types
 */
export enum AIQueryType {
  NATURAL_LANGUAGE = 'natural_language',
  CODE_ASSISTANCE = 'code_assistance',
  TROUBLESHOOTING = 'troubleshooting',
  OPTIMIZATION = 'optimization',
  COMPLIANCE = 'compliance',
  WORKFLOW_HELP = 'workflow_help',
  DATA_ANALYSIS = 'data_analysis',
  CROSS_GROUP_INSIGHT = 'cross_group_insight'
}

/**
 * AI conversation context
 */
export interface ConversationContext {
  conversationId: UUID;
  userId: UUID;
  currentWorkspace?: UUID;
  activeProject?: UUID;
  recentActivities: string[];
  userPermissions: string[];
  systemState: Record<string, any>;
  crossGroupContext: Record<string, any>;
}

/**
 * Main AI Assistant API Service Class
 */
class AIAssistantAPI {
  private config: AIAssistantAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private eventSubscriptions: Map<UUID, AIEventSubscription> = new Map();
  private activeConversations: Map<UUID, ConversationContext> = new Map();
  private contextUpdateTimer: NodeJS.Timeout | null = null;
  private learningBuffer: AILearningData[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<AIAssistantAPIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // =============================================================================
  // AUTHENTICATION AND INITIALIZATION
  // =============================================================================

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Initialize AI assistant with context analysis
   */
  async initialize(userId: UUID, initialContext: UserContext): Promise<void> {
    try {
      // Initialize WebSocket connection
      await this.initializeWebSocket();
      
      // Start context monitoring if enabled
      if (this.config.enableContextAnalysis) {
        this.startContextMonitoring(userId, initialContext);
      }
      
      // Initialize learning system if enabled
      if (this.config.enableLearning) {
        this.initializeLearning(userId);
      }
      
      console.log('AI Assistant initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Assistant:', error);
      throw error;
    }
  }

  /**
   * Initialize WebSocket connection for real-time AI updates
   */
  async initializeWebSocket(): Promise<void> {
    if (!this.config.websocketURL) {
      return;
    }

    try {
      this.websocket = new WebSocket(`${this.config.websocketURL}/ai-assistant`);
      
      this.websocket.onopen = () => {
        console.log('AI Assistant WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse AI WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('AI Assistant WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('AI Assistant WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize AI WebSocket:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: any): void {
    const { event } = message;
    
    const applicableSubscriptions = Array.from(this.eventSubscriptions.values()).filter(
      subscription => {
        const typeMatches = subscription.eventType === event.type;
        const conversationMatches = !subscription.conversationId || subscription.conversationId === event.conversationId;
        const priorityMatches = !subscription.priority || subscription.priority === event.priority;
        return typeMatches && conversationMatches && priorityMatches;
      }
    );

    applicableSubscriptions.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error('Error executing AI event handler:', error);
      }
    });
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting AI WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================

  /**
   * Start a new AI conversation
   * Maps to: POST /api/racine/ai-assistant/conversations/start
   */
  async startConversation(
    userId: UUID,
    context?: UserContext,
    initialMessage?: string
  ): Promise<AIConversationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/conversations/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        context: context || {},
        initial_message: initialMessage
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to start conversation: ${response.statusText}`);
    }

    const conversation = await response.json();
    
    // Store conversation context
    this.activeConversations.set(conversation.id, {
      conversationId: conversation.id,
      userId,
      currentWorkspace: context?.currentWorkspace,
      activeProject: context?.activeProject,
      recentActivities: context?.recentActivities || [],
      userPermissions: context?.permissions || [],
      systemState: context?.systemState || {},
      crossGroupContext: context?.crossGroupContext || {}
    });

    return conversation;
  }

  /**
   * Send message to AI assistant
   * Maps to: POST /api/racine/ai-assistant/conversations/{id}/message
   */
  async sendMessage(
    conversationId: UUID,
    message: string,
    messageType: AIQueryType = AIQueryType.NATURAL_LANGUAGE,
    attachments?: Record<string, any>
  ): Promise<AIQueryResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/conversations/${conversationId}/message`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        message,
        message_type: messageType,
        attachments: attachments || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Update learning data if enabled
    if (this.config.enableLearning) {
      this.updateLearning({
        conversationId,
        userMessage: message,
        aiResponse: result.response,
        messageType,
        timestamp: new Date().toISOString(),
        context: this.activeConversations.get(conversationId) || {}
      } as AILearningData);
    }

    return result;
  }

  /**
   * Get conversation history
   * Maps to: GET /api/racine/ai-assistant/conversations/{id}/history
   */
  async getConversationHistory(
    conversationId: UUID,
    pagination?: PaginationRequest
  ): Promise<AIMessage[]> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/conversations/${conversationId}/history?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversation history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * End conversation
   * Maps to: POST /api/racine/ai-assistant/conversations/{id}/end
   */
  async endConversation(conversationId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to end conversation: ${response.statusText}`);
    }

    // Clean up local context
    this.activeConversations.delete(conversationId);
  }

  // =============================================================================
  // CONTEXT ANALYSIS
  // =============================================================================

  /**
   * Analyze current user context
   * Maps to: POST /api/racine/ai-assistant/analyze-context
   */
  async analyzeContext(request: ContextAnalysisRequest): Promise<ContextAnalysisResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/analyze-context`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze context: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get context-aware recommendations
   * Maps to: GET /api/racine/ai-assistant/recommendations
   */
  async getRecommendations(
    userId: UUID,
    context?: UserContext,
    filters?: FilterRequest
  ): Promise<AIRecommendationResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/recommendations?${params}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        context: context || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // CROSS-GROUP INSIGHTS
  // =============================================================================

  /**
   * Get cross-group insights
   * Maps to: POST /api/racine/ai-assistant/cross-group-insights
   */
  async getCrossGroupInsights(
    userId: UUID,
    groupIds: string[],
    analysisType: 'performance' | 'security' | 'compliance' | 'optimization' = 'performance'
  ): Promise<AIInsightResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/cross-group-insights`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        group_ids: groupIds,
        analysis_type: analysisType
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get cross-group insights: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate workflow suggestions
   * Maps to: POST /api/racine/ai-assistant/suggest-workflow
   */
  async suggestWorkflow(
    userId: UUID,
    goal: string,
    constraints?: Record<string, any>
  ): Promise<WorkflowSuggestion[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/suggest-workflow`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        goal,
        constraints: constraints || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to suggest workflow: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // OPTIMIZATION AND TROUBLESHOOTING
  // =============================================================================

  /**
   * Get optimization recommendations
   * Maps to: POST /api/racine/ai-assistant/optimize
   */
  async getOptimizationRecommendations(request: OptimizationRequest): Promise<OptimizationRecommendationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/optimize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to get optimization recommendations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Detect anomalies
   * Maps to: POST /api/racine/ai-assistant/detect-anomalies
   */
  async detectAnomalies(request: AnomalyDetectionRequest): Promise<AnomalyDetectionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/detect-anomalies`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to detect anomalies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get compliance guidance
   * Maps to: POST /api/racine/ai-assistant/compliance-guidance
   */
  async getComplianceGuidance(
    userId: UUID,
    complianceFramework: string,
    resourceType: string,
    resourceId: UUID
  ): Promise<ComplianceGuidance> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/compliance-guidance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        compliance_framework: complianceFramework,
        resource_type: resourceType,
        resource_id: resourceId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get compliance guidance: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // CODE GENERATION AND ASSISTANCE
  // =============================================================================

  /**
   * Generate code assistance
   * Maps to: POST /api/racine/ai-assistant/generate-code
   */
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/generate-code`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to generate code: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get troubleshooting assistance
   * Maps to: POST /api/racine/ai-assistant/troubleshoot
   */
  async getTroubleshootingHelp(
    userId: UUID,
    problem: string,
    errorLogs?: string[],
    systemState?: Record<string, any>
  ): Promise<AIQueryResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/troubleshoot`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        problem,
        error_logs: errorLogs || [],
        system_state: systemState || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get troubleshooting help: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // LEARNING AND ADAPTATION
  // =============================================================================

  /**
   * Update AI learning with user feedback
   * Maps to: POST /api/racine/ai-assistant/learning/update
   */
  async updateLearning(learningData: AILearningData): Promise<void> {
    this.learningBuffer.push(learningData);
    
    // Batch learning updates for efficiency
    if (this.learningBuffer.length >= this.config.learningBatchSize) {
      await this.flushLearningBuffer();
    }
  }

  /**
   * Flush learning buffer to backend
   */
  private async flushLearningBuffer(): Promise<void> {
    if (this.learningBuffer.length === 0) return;

    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai-assistant/learning/batch-update`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          learning_data: this.learningBuffer
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update learning: ${response.statusText}`);
      }

      this.learningBuffer = [];
    } catch (error) {
      console.error('Failed to flush learning buffer:', error);
    }
  }

  /**
   * Initialize learning system
   */
  private initializeLearning(userId: UUID): void {
    // Set up periodic learning buffer flush
    setInterval(() => {
      if (this.learningBuffer.length > 0) {
        this.flushLearningBuffer();
      }
    }, 60000); // Flush every minute
  }

  // =============================================================================
  // CONTEXT MONITORING
  // =============================================================================

  /**
   * Start context monitoring
   */
  private startContextMonitoring(userId: UUID, initialContext: UserContext): void {
    this.contextUpdateTimer = setInterval(async () => {
      try {
        // Update context and get proactive recommendations
        if (this.config.enableProactiveRecommendations) {
          await this.updateProactiveRecommendations(userId);
        }
      } catch (error) {
        console.error('Context monitoring error:', error);
      }
    }, this.config.contextUpdateInterval);
  }

  /**
   * Update proactive recommendations
   */
  private async updateProactiveRecommendations(userId: UUID): Promise<void> {
    try {
      const recommendations = await this.getRecommendations(userId);
      
      // Trigger proactive recommendation events
      recommendations.recommendations.forEach(recommendation => {
        this.handleWebSocketMessage({
          event: {
            type: AIEventType.RECOMMENDATION_GENERATED,
            userId,
            timestamp: new Date().toISOString(),
            data: recommendation,
            priority: recommendation.priority || 'medium'
          }
        });
      });
    } catch (error) {
      console.error('Failed to update proactive recommendations:', error);
    }
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to AI events
   */
  subscribeToEvents(
    eventType: AIEventType,
    handler: AIEventHandler,
    conversationId?: UUID,
    priority?: 'low' | 'medium' | 'high' | 'critical'
  ): UUID {
    const subscriptionId = crypto.randomUUID();
    const subscription: AIEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      conversationId,
      priority
    };

    this.eventSubscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from AI events
   */
  unsubscribeFromEvents(subscriptionId: UUID): void {
    this.eventSubscriptions.delete(subscriptionId);
  }

  /**
   * Cleanup all connections and subscriptions
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.contextUpdateTimer) {
      clearInterval(this.contextUpdateTimer);
      this.contextUpdateTimer = null;
    }
    
    // Flush any remaining learning data
    if (this.learningBuffer.length > 0) {
      this.flushLearningBuffer();
    }
    
    this.eventSubscriptions.clear();
    this.activeConversations.clear();
  }
}

// Create and export singleton instance
export const aiAssistantAPI = new AIAssistantAPI();

// Export class for direct instantiation if needed
export { AIAssistantAPI };

// Export types for external usage
export type {
  AIAssistantAPIConfig,
  AIEvent,
  AIEventHandler,
  AIEventSubscription,
  ConversationContext
};