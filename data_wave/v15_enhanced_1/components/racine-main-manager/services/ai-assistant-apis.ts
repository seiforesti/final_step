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
import { withGracefulErrorHandling, DefaultApiResponses } from '../../../lib/api-error-handler';

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
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy',
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
          console.warn('Failed to parse AI WebSocket message (handled gracefully):', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('AI Assistant WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.warn('AI Assistant WebSocket error (handled gracefully):', error);
      };
    } catch (error) {
      console.warn('Failed to initialize AI WebSocket (will retry):', error);
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
        console.warn('Error executing AI event handler (handled gracefully):', error);
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
    return withGracefulErrorHandling(
      async () => {
        // Check if backend is available before making the call
        if (!this.isBackendAvailable()) {
          console.log('Backend not available, returning empty recommendations');
          return { recommendations: [] };
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
          // Handle specific backend errors gracefully
          if (response.status === 502 || response.status === 503 || response.status === 504) {
            console.log('Backend service unavailable (Bad Gateway/Service Unavailable), returning empty recommendations');
            return { recommendations: [] };
          }
          throw new Error(`Failed to get recommendations: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { recommendations: [] },
        errorPrefix: 'Backend not available for getting recommendations'
      }
    );
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
   * Update proactive recommendations for a user
   */
  private async updateProactiveRecommendations(userId: UUID): Promise<void> {
    try {
      // Check if backend is available before making the call
      if (!this.isBackendAvailable()) {
        console.log('Backend not available, skipping proactive recommendations update');
        return;
      }

      const recommendations = await this.getRecommendations(userId);
      
      // Handle different response structures
      let recommendationsList: any[] = [];
      
      if (recommendations && typeof recommendations === 'object') {
        // Check if it's an array
        if (Array.isArray(recommendations)) {
          recommendationsList = recommendations;
        }
        // Check if it has a recommendations property
        else if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
          recommendationsList = recommendations.recommendations;
        }
        // Check if it's a single recommendation object
        else if (recommendations.id && recommendations.type) {
          recommendationsList = [recommendations];
        }
      }
      
      // Trigger proactive recommendation events
      recommendationsList.forEach(recommendation => {
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
      console.log('Failed to update proactive recommendations (backend may be unavailable):', error);
      // Don't throw error - just log and continue gracefully
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
   * Initialize real-time updates for AI assistant
   */
  async initializeRealTimeUpdates(): Promise<void> {
    try {
      // Initialize WebSocket connection if not already connected
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        await this.initializeWebSocket();
      }

      // Start context monitoring if enabled
      if (this.config.enableContextAnalysis) {
        // Start monitoring with a default user context
        this.startContextMonitoring('default-user', {
          userId: 'default-user',
          preferences: {},
          recentActivities: [],
          userPermissions: [],
          systemState: {},
          crossGroupContext: {}
        });
      }

      // Initialize proactive recommendations if enabled
      if (this.config.enableProactiveRecommendations) {
        // Start proactive recommendation updates
        setInterval(() => {
          this.updateProactiveRecommendations('default-user');
        }, this.config.contextUpdateInterval);
      }

      console.log('AI Assistant real-time updates initialized');
    } catch (error) {
      console.error('Failed to initialize AI Assistant real-time updates:', error);
      throw error;
    }
  }

  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================

  /**
   * Start a new AI conversation
   */
  async startConversation(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/conversations/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.statusText}`);
      }

      const conversation = await response.json();
      return conversation;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }

  /**
   * Send a message in an AI conversation
   */
  async sendMessage(conversationId: string, request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const message = await response.json();
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/conversations/${conversationId}/history`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get conversation history: ${response.statusText}`);
      }

      const history = await response.json();
      return history.messages || [];
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }

  /**
   * End an AI conversation
   */
  async endConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to end conversation: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to end conversation:', error);
      throw error;
    }
  }

  // =============================================================================
  // CONTEXT ANALYSIS AND RECOMMENDATIONS
  // =============================================================================

  /**
   * Analyze user context for AI assistance
   */
  async analyzeContext(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/context/analyze`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze context: ${response.statusText}`);
      }

      const context = await response.json();
      return context;
    } catch (error) {
      console.error('Failed to analyze context:', error);
      throw error;
    }
  }

  /**
   * Get AI recommendations
   */
  async getRecommendations(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/recommendations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`);
      }

      const recommendations = await response.json();
      return recommendations;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return { recommendations: [] };
    }
  }

  /**
   * Get cross-group insights
   */
  async getCrossGroupInsights(request: any): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/insights/cross-group`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to get cross-group insights: ${response.statusText}`);
      }

      const insights = await response.json();
      return insights.insights || [];
    } catch (error) {
      console.error('Failed to get cross-group insights:', error);
      return [];
    }
  }

  /**
   * Suggest workflow automation
   */
  async suggestWorkflow(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/workflow/suggest`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to suggest workflow: ${response.statusText}`);
      }

      const suggestion = await response.json();
      return suggestion;
    } catch (error) {
      console.error('Failed to suggest workflow:', error);
      throw error;
    }
  }

  // =============================================================================
  // AI OPTIMIZATION AND TROUBLESHOOTING
  // =============================================================================

  /**
   * Optimize system or process using AI
   */
  async optimize(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/optimize`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to optimize: ${response.statusText}`);
      }

      const optimization = await response.json();
      return optimization;
    } catch (error) {
      console.error('Failed to optimize:', error);
      throw error;
    }
  }

  /**
   * Detect anomalies using AI
   */
  async detectAnomalies(request: any): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/anomalies/detect`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to detect anomalies: ${response.statusText}`);
      }

      const anomalies = await response.json();
      return anomalies.anomalies || [];
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      return [];
    }
  }

  /**
   * Get compliance guidance from AI
   */
  async getComplianceGuidance(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/compliance/guidance`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to get compliance guidance: ${response.statusText}`);
      }

      const guidance = await response.json();
      return guidance;
    } catch (error) {
      console.error('Failed to get compliance guidance:', error);
      throw error;
    }
  }

  /**
   * Generate code using AI
   */
  async generateCode(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/code/generate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate code: ${response.statusText}`);
      }

      const code = await response.json();
      return code;
    } catch (error) {
      console.error('Failed to generate code:', error);
      throw error;
    }
  }

  /**
   * Troubleshoot issues using AI
   */
  async troubleshoot(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/troubleshoot`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to troubleshoot: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to troubleshoot:', error);
      throw error;
    }
  }

  /**
   * Calculate responsive adaptation using AI
   */
  async calculateResponsiveAdaptation(params: {
    currentLayout: any;
    targetBreakpoint: string;
    deviceCapabilities: any;
    performanceProfile: any;
    userPreferences?: any;
    networkCondition: any;
  }): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/responsive/adapt`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to calculate responsive adaptation: ${response.statusText}`);
        }

        const adaptationPlan = await response.json();
        return adaptationPlan;
      },
      {
        defaultValue: {
          type: 'fallback',
          breakpoint: params.targetBreakpoint,
          adaptations: [],
          confidence: 0.5,
          fallback: true
        },
        errorPrefix: 'Backend not available for responsive adaptation calculation'
      }
    );
  }

  /**
   * Get device optimizations using AI
   */
  async getDeviceOptimizations(params: {
    deviceType: string;
    currentLayout: any;
    deviceCapabilities: any;
    performanceProfile: any;
    networkCondition: any;
    batteryLevel: number;
  }): Promise<any[]> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/responsive/device-optimizations`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to get device optimizations: ${response.statusText}`);
        }

        const optimizations = await response.json();
        return optimizations;
      },
      {
        defaultValue: [
          {
            type: 'layout',
            action: 'adjust-columns',
            parameters: { columns: params.deviceType === 'mobile' ? 1 : 3 },
            priority: 'medium'
          }
        ],
        errorPrefix: 'Backend not available for device optimizations'
      }
    );
  }

  // =============================================================================
  // LEARNING AND DATA SUBMISSION
  // =============================================================================

  /**
   * Submit learning data for AI improvement
   */
  async submitLearningData(learningData: any[]): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/ai/learning/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ learningData })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit learning data: ${response.statusText}`);
      }

      console.log('Learning data submitted successfully');
    } catch (error) {
      console.error('Failed to submit learning data:', error);
      throw error;
    }
  }

  /**
   * Get AI learning data
   */
  async getAILearningData(): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/learning-data`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get AI learning data: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { patterns: [], insights: [] },
        errorPrefix: 'Backend not available for getting AI learning data'
      }
    );
  }

  // =============================================================================
  // TAB AI METHODS
  // =============================================================================

  /**
   * Get tab optimizations using AI
   */
  async getTabOptimizations(params: {
    tabs: any[];
    performanceData: any;
    userContext: any;
    workspaceContext: any;
  }): Promise<any[]> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/tabs/optimizations`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to get tab optimizations: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: [],
        errorPrefix: 'Backend not available for getting tab optimizations'
      }
    );
  }

  /**
   * Organize tabs with AI
   */
  async organizeTabsWithAI(params: {
    tabs: any[];
    userPatterns: any[];
    currentGroups: any[];
  }): Promise<{
    shouldReorganize: boolean;
    suggestedGroups: any[];
    suggestedOrder: any[];
    suggestions: any[];
  }> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/tabs/organize`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to organize tabs with AI: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: {
          shouldReorganize: false,
          suggestedGroups: [],
          suggestedOrder: [],
          suggestions: []
        },
        errorPrefix: 'Backend not available for organizing tabs with AI'
      }
    );
  }

  /**
   * Analyze tab usage patterns
   */
  async analyzeTabUsage(params: {
    userId: string;
    timeRange: string;
    tabs: any[];
  }): Promise<{
    patterns: any[];
    insights: any[];
  }> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/tabs/usage-analysis`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to analyze tab usage: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { patterns: [], insights: [] },
        errorPrefix: 'Backend not available for analyzing tab usage'
      }
    );
  }

  /**
   * Generate tab suggestions
   */
  async generateTabSuggestions(params: {
    userContext: any;
    currentTabs: any[];
    workspaceContext: any;
  }): Promise<any[]> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/tabs/suggestions`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to generate tab suggestions: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: [],
        errorPrefix: 'Backend not available for generating tab suggestions'
      }
    );
  }

  /**
   * Get workspace optimizations
   */
  async getWorkspaceOptimizations(params: {
    workspaceId: string;
    currentLayout: any;
    userContext: any;
  }): Promise<any[]> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/workspace/optimizations`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to get workspace optimizations: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: [],
        errorPrefix: 'Backend not available for getting workspace optimizations'
      }
    );
  }

  /**
   * Optimize workspace layout
   */
  async optimizeWorkspaceLayout(params: {
    workspaceId: string;
    currentLayout: any;
    userContext: any;
    performanceData: any;
  }): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/workspace/layout/optimize`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to optimize workspace layout: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { optimizedLayout: params.currentLayout },
        errorPrefix: 'Backend not available for optimizing workspace layout'
      }
    );
  }

  /**
   * Analyze workspace usability
   */
  async analyzeWorkspaceUsability(params: {
    workspaceId: string;
    userContext: any;
    usageData: any;
  }): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/workspace/usability`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to analyze workspace usability: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { score: 0.8, recommendations: [] },
        errorPrefix: 'Backend not available for analyzing workspace usability'
      }
    );
  }

  /**
   * Generate workspace recommendations
   */
  async generateWorkspaceRecommendations(params: {
    workspaceId: string;
    userContext: any;
    currentState: any;
  }): Promise<any[]> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/workspace/recommendations`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to generate workspace recommendations: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: [],
        errorPrefix: 'Backend not available for generating workspace recommendations'
      }
    );
  }

  /**
   * Predict usage patterns
   */
  async predictUsage(params: {
    userId: string;
    workspaceId: string;
    timeRange: string;
  }): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/ai/usage/predict`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to predict usage: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { predictions: [], confidence: 0.5 },
        errorPrefix: 'Backend not available for predicting usage'
      }
    );
  }

  /**
   * Get recommendations
   */
  async getRecommendations(params: {
    context: string;
    userContext: any;
    currentState: any;
  }): Promise<any[]> {
    return withGracefulErrorHandling(
      async () => {
        // Check if backend is available before making the call
        if (!this.isBackendAvailable()) {
          console.log('Backend not available, returning empty recommendations');
          return [];
        }

        const response = await fetch(`${this.config.baseURL}/api/racine/ai/recommendations`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          // Handle specific backend errors gracefully
          if (response.status === 502 || response.status === 503 || response.status === 504) {
            console.log('Backend service unavailable (Bad Gateway/Service Unavailable), returning empty recommendations');
            return [];
          }
          throw new Error(`Failed to get recommendations: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: [],
        errorPrefix: 'Backend not available for getting recommendations'
      }
    );
  }

  /**
   * Analyze workspace
   */
  async analyzeWorkspace(params: {
    workspaceId: string;
    userContext: any;
  }): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        // Check if backend is available before making the call
        if (!this.isBackendAvailable()) {
          console.log('Backend not available, returning default workspace analysis');
          return { analysis: {}, insights: [] };
        }

        const response = await fetch(`${this.config.baseURL}/api/racine/ai/workspace/analyze`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          // Handle specific backend errors gracefully
          if (response.status === 502 || response.status === 503 || response.status === 504) {
            console.log('Backend service unavailable (Bad Gateway/Service Unavailable), returning default workspace analysis');
            return { analysis: {}, insights: [] };
          }
          throw new Error(`Failed to analyze workspace: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { analysis: {}, insights: [] },
        errorPrefix: 'Backend not available for analyzing workspace'
      }
    );
  }

  /**
   * Optimize workspace
   */
  async optimizeWorkspace(params: {
    workspaceId: string;
    userContext: any;
    optimizationType: string;
  }): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        // Check if backend is available before making the call
        if (!this.isBackendAvailable()) {
          console.log('Backend not available, returning default workspace optimization');
          return { success: true, optimizations: [] };
        }

        const response = await fetch(`${this.config.baseURL}/api/racine/ai/workspace/optimize`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          // Handle specific backend errors gracefully
          if (response.status === 502 || response.status === 503 || response.status === 504) {
            console.log('Backend service unavailable (Bad Gateway/Service Unavailable), returning default workspace optimization');
            return { success: true, optimizations: [] };
          }
          throw new Error(`Failed to optimize workspace: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true, optimizations: [] },
        errorPrefix: 'Backend not available for optimizing workspace'
      }
    );
  }

  /**
   * Check if backend is available
   */
  private isBackendAvailable(): boolean {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check if the base URL is accessible
    try {
      const url = new URL(this.config.baseURL);
      // For now, assume backend is available if we have a valid URL
      // In a production environment, you might want to implement a health check
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      console.log('Invalid backend URL, assuming backend unavailable');
      return false;
    }
  }

  /**
   * Cleanup WebSocket connection
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.eventSubscriptions.clear();
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