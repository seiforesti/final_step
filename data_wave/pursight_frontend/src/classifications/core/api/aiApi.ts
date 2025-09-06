import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  AIModel, 
  Conversation, 
  KnowledgeEntry,
  AIMetrics,
  ExplainableReasoning,
  ConversationContext,
  AIIntelligenceRequest,
  AIIntelligenceResponse,
  KnowledgeGraph,
  MultiAgentOrchestration,
  CognitiveProcessing,
  AutoTaggingConfig,
  WorkloadOptimization,
  RealTimeIntelligence,
  AIAnalytics,
  AIBulkOperation,
  ConversationFlow,
  ReasoningPath,
  IntelligenceInsight,
  ContextualEmbedding,
  SemanticSearch,
  KnowledgeSynthesis,
  AIModelCreate,
  AIModelUpdate,
  ConversationCreate,
  KnowledgeEntryCreate
} from '../types';

// Advanced AI processing interfaces
interface AIStreamingResponse {
  id: string;
  type: 'text' | 'reasoning' | 'insight' | 'completion';
  content: string;
  metadata: Record<string, any>;
  timestamp: string;
  confidence: number;
  sources?: string[];
}

interface CognitiveProcessingConfig {
  enableReasoning: boolean;
  enableMemory: boolean;
  enablePlanning: boolean;
  enableReflection: boolean;
  contextWindow: number;
  temperature: number;
  topP: number;
  maxTokens: number;
}

interface MultiAgentConfig {
  agents: Array<{
    id: string;
    role: string;
    capabilities: string[];
    priority: number;
  }>;
  orchestrationStrategy: 'sequential' | 'parallel' | 'dynamic';
  collaborationMode: 'competitive' | 'cooperative' | 'hybrid';
  consensusThreshold: number;
}

interface ExplainabilityConfig {
  enableStepByStep: boolean;
  enableVisualization: boolean;
  enableCounterfactuals: boolean;
  enableFeatureImportance: boolean;
  explanationDepth: 'basic' | 'detailed' | 'comprehensive';
  visualizationType: 'graph' | 'tree' | 'timeline' | 'heatmap';
}

interface AIApiConfig {
  baseURL: string;
  timeout: number;
  streaming: {
    enabled: boolean;
    chunkSize: number;
    bufferSize: number;
  };
  retryConfig: {
    retries: number;
    retryDelay: number;
    exponentialBackoff: boolean;
  };
  cacheConfig: {
    enabled: boolean;
    defaultTTL: number;
    maxEntries: number;
  };
}

class AIApiClient {
  private client: AxiosInstance;
  private streamingClient: AxiosInstance;
  private wsConnection: WebSocket | null = null;
  private cache: Map<string, any> = new Map();
  private config: AIApiConfig;
  private requestId = 0;

  constructor(config: AIApiConfig) {
    this.config = config;
    
    // Standard HTTP client
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Streaming client for real-time AI responses
    this.streamingClient = axios.create({
      baseURL: config.baseURL,
      timeout: 0, // No timeout for streaming
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    this.setupInterceptors();
    this.setupRetryLogic();
    this.initializeWebSocket();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication and request ID
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
      }
      config.headers = {
        ...config.headers,
        'X-Request-ID': `ai-${++this.requestId}-${Date.now()}`
      };
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  private setupRetryLogic(): void {
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const { retries, retryDelay, exponentialBackoff } = this.config.retryConfig;
        
        if (
          error.config &&
          !error.config.__retryCount &&
          retries > 0
        ) {
          error.config.__retryCount = 0;
        }

        if (error.config && error.config.__retryCount < retries) {
          error.config.__retryCount += 1;
          
          const delay = exponentialBackoff 
            ? retryDelay * Math.pow(2, error.config.__retryCount - 1)
            : retryDelay;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(error.config);
        }

        return Promise.reject(error);
      }
    );
  }

  private initializeWebSocket(): void {
    // Check if WebSocket is enabled and URL is configured
    // Disable WebSocket by default to prevent connection errors
    const enableWebSocket = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_ENABLE_AI_WEBSOCKET) === 'true';
    const wsUrl = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL) || 'ws://localhost:8000';
    
    if (!enableWebSocket) {
      console.log('AI WebSocket is disabled in configuration');
      return;
    }
    
    if (!wsUrl) {
      console.warn('AI WebSocket URL not configured, WebSocket features will be disabled');
      return;
    }

    // Only attempt WebSocket connection in browser environment
    if (typeof window === 'undefined') {
      console.log('AI WebSocket initialization skipped - not in browser environment');
      return;
    }
    
    // Check if WebSocket is already connected or connecting
    if (this.wsConnection && (this.wsConnection.readyState === WebSocket.OPEN || this.wsConnection.readyState === WebSocket.CONNECTING)) {
      console.log('AI WebSocket already connected or connecting, skipping initialization');
      return;
    }
    
    try {
      const fullWsUrl = `${wsUrl}/v3/ai/realtime`;
      console.log('Attempting to connect to AI WebSocket:', fullWsUrl);
      
      // Validate URL format
      if (!fullWsUrl.startsWith('ws://') && !fullWsUrl.startsWith('wss://')) {
        console.warn('Invalid WebSocket URL format:', fullWsUrl);
        return;
      }
      
      this.wsConnection = new WebSocket(fullWsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('AI WebSocket connected');
      };

      this.wsConnection.onclose = () => {
        console.log('AI WebSocket disconnected, attempting reconnect...');
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.wsConnection.onerror = (error) => {
        // Handle WebSocket error with better error information
        let errorMessage = 'Unknown WebSocket error';
        let errorDetails = {};
        
        if (error) {
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error instanceof Error) {
            errorMessage = error.message || error.name || 'WebSocket error occurred';
            errorDetails = {
              name: error.name,
              stack: error.stack,
              message: error.message
            };
          } else if (error.message) {
            errorMessage = error.message;
            errorDetails = {
              name: error.name,
              stack: error.stack,
              code: error.code,
              ...error
            };
          } else if (error.toString && error.toString() !== '[object Object]') {
            errorMessage = error.toString();
          } else {
            // If error is an empty object or undefined, provide a default message
            errorMessage = 'AI WebSocket connection failed';
            errorDetails = { originalError: error };
          }
        } else {
          // If no error object provided, create a default error
          errorMessage = 'AI WebSocket connection failed - no error details available';
          errorDetails = { noErrorObject: true };
        }
        
        console.error('AI WebSocket error:', {
          message: errorMessage,
          error: error,
          url: fullWsUrl,
          readyState: this.wsConnection?.readyState,
          errorDetails: errorDetails,
          timestamp: new Date().toISOString()
        });
      };
    } catch (error) {
      console.error('Failed to initialize AI WebSocket:', error);
    }
  }

  // AI Model Management
  async getAIModels(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    capabilities?: string[];
    status?: string;
  }): Promise<{ models: AIModel[]; total: number; page: number; pageSize: number }> {
    const response = await this.client.get('/v3/ai/models', { params });
    return response.data;
  }

  async getAIModel(modelId: string): Promise<AIModel> {
    const response = await this.client.get(`/v3/ai/models/${modelId}`);
    return response.data;
  }

  async createAIModel(model: AIModelCreate): Promise<AIModel> {
    const response = await this.client.post('/v3/ai/models', model);
    return response.data;
  }

  async updateAIModel(modelId: string, updates: AIModelUpdate): Promise<AIModel> {
    const response = await this.client.put(`/v3/ai/models/${modelId}`, updates);
    return response.data;
  }

  async deleteAIModel(modelId: string): Promise<void> {
    await this.client.delete(`/v3/ai/models/${modelId}`);
  }

  async deployAIModel(modelId: string, config: {
    endpoint: string;
    scalingConfig: any;
    securityConfig: any;
  }): Promise<AIModel> {
    const response = await this.client.post(`/v3/ai/models/${modelId}/deploy`, config);
    return response.data;
  }

  // Conversation Management
  async createConversation(conversation: ConversationCreate): Promise<Conversation> {
    const response = await this.client.post('/v3/ai/conversations', conversation);
    return response.data;
  }

  async getConversations(params?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    modelId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ conversations: Conversation[]; total: number }> {
    const response = await this.client.get('/v3/ai/conversations', { params });
    return response.data;
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await this.client.get(`/v3/ai/conversations/${conversationId}`);
    return response.data;
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation> {
    const response = await this.client.put(`/v3/ai/conversations/${conversationId}`, updates);
    return response.data;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.client.delete(`/v3/ai/conversations/${conversationId}`);
  }

  async addMessageToConversation(conversationId: string, message: {
    content: string;
    role: 'user' | 'assistant' | 'system';
    metadata?: Record<string, any>;
  }): Promise<Conversation> {
    const response = await this.client.post(`/v3/ai/conversations/${conversationId}/messages`, message);
    return response.data;
  }

  // AI Intelligence Processing
  async processIntelligenceRequest(request: AIIntelligenceRequest): Promise<AIIntelligenceResponse> {
    const response = await this.client.post('/v3/ai/intelligence/process', request);
    return response.data;
  }

  async streamIntelligenceProcessing(
    request: AIIntelligenceRequest,
    onChunk: (chunk: AIStreamingResponse) => void,
    onComplete: (response: AIIntelligenceResponse) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/v3/ai/intelligence/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk') {
                onChunk(data);
              } else if (data.type === 'complete') {
                onComplete(data.response);
                return;
              } else if (data.type === 'error') {
                onError(new Error(data.error));
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      onError(error);
    }
  }

  // Cognitive Processing
  async performCognitiveProcessing(request: {
    input: string;
    context?: ConversationContext;
    config: CognitiveProcessingConfig;
    modelId: string;
  }): Promise<CognitiveProcessing> {
    const response = await this.client.post('/v3/ai/cognitive/process', request);
    return response.data;
  }

  async getCognitiveCapabilities(modelId: string): Promise<{
    reasoning: boolean;
    memory: boolean;
    planning: boolean;
    reflection: boolean;
    creativity: boolean;
    analysis: boolean;
  }> {
    const response = await this.client.get(`/v3/ai/models/${modelId}/capabilities`);
    return response.data;
  }

  // Explainable Reasoning
  async getExplanation(request: {
    predictionId?: string;
    conversationId?: string;
    messageId?: string;
    explanationType: 'step_by_step' | 'counterfactual' | 'feature_importance' | 'reasoning_path';
    config: ExplainabilityConfig;
  }): Promise<ExplainableReasoning> {
    const response = await this.client.post('/v3/ai/explanations', request);
    return response.data;
  }

  async getReasoningPath(request: {
    input: string;
    output: string;
    modelId: string;
    includeIntermediateSteps: boolean;
  }): Promise<ReasoningPath> {
    const response = await this.client.post('/v3/ai/reasoning/path', request);
    return response.data;
  }

  async generateCounterfactuals(request: {
    input: string;
    output: string;
    modelId: string;
    numCounterfactuals: number;
  }): Promise<Array<{
    input: string;
    output: string;
    explanation: string;
    confidence: number;
  }>> {
    const response = await this.client.post('/v3/ai/reasoning/counterfactuals', request);
    return response.data;
  }

  // Knowledge Management
  async createKnowledgeEntry(entry: KnowledgeEntryCreate): Promise<KnowledgeEntry> {
    const response = await this.client.post('/v3/ai/knowledge', entry);
    return response.data;
  }

  async getKnowledgeEntries(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    tags?: string[];
    relevanceThreshold?: number;
  }): Promise<{ entries: KnowledgeEntry[]; total: number }> {
    const response = await this.client.get('/v3/ai/knowledge', { params });
    return response.data;
  }

  async getKnowledgeEntry(entryId: string): Promise<KnowledgeEntry> {
    const response = await this.client.get(`/v3/ai/knowledge/${entryId}`);
    return response.data;
  }

  async updateKnowledgeEntry(entryId: string, updates: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> {
    const response = await this.client.put(`/v3/ai/knowledge/${entryId}`, updates);
    return response.data;
  }

  async deleteKnowledgeEntry(entryId: string): Promise<void> {
    await this.client.delete(`/v3/ai/knowledge/${entryId}`);
  }

  async searchKnowledge(query: {
    text: string;
    embedding?: number[];
    filters?: Record<string, any>;
    maxResults?: number;
    includeEmbeddings?: boolean;
  }): Promise<SemanticSearch> {
    const response = await this.client.post('/v3/ai/knowledge/search', query);
    return response.data;
  }

  // Knowledge Graph
  async getKnowledgeGraph(params?: {
    nodeTypes?: string[];
    relationshipTypes?: string[];
    maxDepth?: number;
    startNodeId?: string;
  }): Promise<KnowledgeGraph> {
    const response = await this.client.get('/v3/ai/knowledge/graph', { params });
    return response.data;
  }

  async updateKnowledgeGraph(updates: {
    addNodes?: Array<{ id: string; type: string; properties: Record<string, any> }>;
    addRelationships?: Array<{ from: string; to: string; type: string; properties?: Record<string, any> }>;
    removeNodes?: string[];
    removeRelationships?: string[];
  }): Promise<KnowledgeGraph> {
    const response = await this.client.post('/v3/ai/knowledge/graph/update', updates);
    return response.data;
  }

  // Knowledge Synthesis
  async synthesizeKnowledge(request: {
    sources: string[];
    query: string;
    synthesisType: 'summary' | 'comparison' | 'analysis' | 'insight';
    maxLength?: number;
    includeReferences?: boolean;
  }): Promise<KnowledgeSynthesis> {
    const response = await this.client.post('/v3/ai/knowledge/synthesize', request);
    return response.data;
  }

  // Multi-Agent Orchestration
  async createMultiAgentSession(config: MultiAgentConfig): Promise<MultiAgentOrchestration> {
    const response = await this.client.post('/v3/ai/multi-agent/sessions', config);
    return response.data;
  }

  async getMultiAgentSessions(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ sessions: MultiAgentOrchestration[]; total: number }> {
    const response = await this.client.get('/v3/ai/multi-agent/sessions', { params });
    return response.data;
  }

  async executeMultiAgentTask(sessionId: string, task: {
    description: string;
    requirements: string[];
    deadline?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<{
    taskId: string;
    status: string;
    assignedAgents: string[];
    estimatedCompletion: string;
  }> {
    const response = await this.client.post(`/v3/ai/multi-agent/sessions/${sessionId}/tasks`, task);
    return response.data;
  }

  async getMultiAgentTaskStatus(sessionId: string, taskId: string): Promise<{
    taskId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    results?: any;
    agentContributions: Array<{
      agentId: string;
      contribution: string;
      confidence: number;
      timestamp: string;
    }>;
  }> {
    const response = await this.client.get(`/v3/ai/multi-agent/sessions/${sessionId}/tasks/${taskId}`);
    return response.data;
  }

  // Auto-Tagging
  async configureAutoTagging(config: AutoTaggingConfig): Promise<AutoTaggingConfig> {
    const response = await this.client.post('/v3/ai/auto-tagging/configure', config);
    return response.data;
  }

  async performAutoTagging(request: {
    content: string;
    contentType: 'text' | 'document' | 'image' | 'conversation';
    existingTags?: string[];
    maxTags?: number;
    confidenceThreshold?: number;
  }): Promise<{
    tags: Array<{
      tag: string;
      confidence: number;
      category: string;
      reasoning: string;
    }>;
    suggestedCategories: string[];
    metadata: Record<string, any>;
  }> {
    const response = await this.client.post('/v3/ai/auto-tagging/tag', request);
    return response.data;
  }

  // Workload Optimization
  async analyzeWorkload(params?: {
    startDate?: string;
    endDate?: string;
    modelIds?: string[];
    includeProjections?: boolean;
  }): Promise<WorkloadOptimization> {
    const response = await this.client.get('/v3/ai/workload/analyze', { params });
    return response.data;
  }

  async optimizeWorkload(request: {
    targetMetrics: string[];
    constraints: Record<string, any>;
    optimizationGoal: 'cost' | 'performance' | 'latency' | 'throughput';
    timeHorizon: number;
  }): Promise<{
    recommendedChanges: Array<{
      type: string;
      description: string;
      impact: Record<string, number>;
      implementation: string;
    }>;
    projectedImpact: Record<string, number>;
    confidence: number;
  }> {
    const response = await this.client.post('/v3/ai/workload/optimize', request);
    return response.data;
  }

  // Real-Time Intelligence
  async startRealTimeIntelligence(config: {
    sources: string[];
    processors: string[];
    outputs: string[];
    updateInterval: number;
  }): Promise<{ streamId: string; status: string }> {
    const response = await this.client.post('/v3/ai/realtime/start', config);
    return response.data;
  }

  async getRealTimeIntelligence(streamId: string): Promise<RealTimeIntelligence> {
    const response = await this.client.get(`/v3/ai/realtime/${streamId}`);
    return response.data;
  }

  async stopRealTimeIntelligence(streamId: string): Promise<void> {
    await this.client.post(`/v3/ai/realtime/${streamId}/stop`);
  }

  // Analytics and Metrics
  async getAIAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    modelIds?: string[];
    metricTypes?: string[];
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<AIAnalytics> {
    const response = await this.client.get('/v3/ai/analytics', { params });
    return response.data;
  }

  async getAIMetrics(modelId: string, timeRange?: {
    startDate: string;
    endDate: string;
  }): Promise<AIMetrics> {
    const response = await this.client.get(`/v3/ai/models/${modelId}/metrics`, {
      params: timeRange
    });
    return response.data;
  }

  async getIntelligenceInsights(params?: {
    analysisType?: 'performance' | 'usage' | 'cost' | 'quality';
    timeRange?: { startDate: string; endDate: string };
    aggregationLevel?: 'model' | 'conversation' | 'user' | 'global';
  }): Promise<IntelligenceInsight[]> {
    const response = await this.client.get('/v3/ai/insights', { params });
    return response.data;
  }

  // Bulk Operations
  async performBulkOperation(operation: AIBulkOperation): Promise<{ operationId: string; status: string }> {
    const response = await this.client.post('/v3/ai/bulk-operations', operation);
    return response.data;
  }

  async getBulkOperationStatus(operationId: string): Promise<{
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    results?: any;
    error?: string;
  }> {
    const response = await this.client.get(`/v3/ai/bulk-operations/${operationId}`);
    return response.data;
  }

  // Contextual Embeddings
  async generateEmbeddings(request: {
    texts: string[];
    modelId?: string;
    normalize?: boolean;
    includeMetadata?: boolean;
  }): Promise<ContextualEmbedding[]> {
    const response = await this.client.post('/v3/ai/embeddings/generate', request);
    return response.data;
  }

  async compareEmbeddings(request: {
    embedding1: number[];
    embedding2: number[];
    metric?: 'cosine' | 'euclidean' | 'dot_product';
  }): Promise<{ similarity: number; distance: number }> {
    const response = await this.client.post('/v3/ai/embeddings/compare', request);
    return response.data;
  }

  // WebSocket Methods
  subscribeToRealTimeUpdates(callback: (update: any) => void): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          callback(update);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    }
  }

  sendRealtimeCommand(command: {
    type: string;
    payload: any;
  }): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(command));
    }
  }

  // Utility Methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): {
    size: number;
    maxSize: number;
    entries: Array<{ key: string; size: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      size: JSON.stringify(value).length
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.cacheConfig.maxEntries,
      entries
    };
  }

  // Cleanup
  destroy(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.clearCache();
  }
}

// Default configuration
const defaultAIApiConfig: AIApiConfig = {
  baseURL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/api/proxy',
  timeout: 60000, // 60 seconds for AI operations
  streaming: {
    enabled: true,
    chunkSize: 1024,
    bufferSize: 8192
  },
  retryConfig: {
    retries: 3,
    retryDelay: 2000,
    exponentialBackoff: true
  },
  cacheConfig: {
    enabled: true,
    defaultTTL: 600000, // 10 minutes
    maxEntries: 500
  }
};

// ============================================================================
// MISSING AI API METHODS - ADVANCED IMPLEMENTATIONS
// ============================================================================

// Add missing methods to AIApiClient class
class EnhancedAIApiClient extends AIApiClient {
  // Agent Management
  async initializeAgents(config: any): Promise<any> {
    return this.post('/agents/initialize', config);
  }

  async loadKnowledgeBase(config: any): Promise<any> {
    return this.post('/knowledge/load', config);
  }

  async executeReasoning(config: any): Promise<any> {
    return this.post('/reasoning/execute', config);
  }

  async generateExplanations(config: any): Promise<any> {
    return this.post('/explanations/generate', config);
  }

  async getAIModelStatus(): Promise<any> {
    return this.get('/models/status');
  }

  async updateAIModel(config: any): Promise<any> {
    return this.put(`/models/${config.modelId}`, config.updates);
  }

  async getKnowledgeSources(filter?: any): Promise<any> {
    const params = filter ? new URLSearchParams(filter).toString() : '';
    return this.get(`/knowledge/sources${params ? '?' + params : ''}`);
  }

  async getAIModels(filter?: any): Promise<any> {
    const params = filter ? new URLSearchParams(filter).toString() : '';
    return this.get(`/models${params ? '?' + params : ''}`);
  }

  // Workflow Step Execution
  async executeAIStep(stepId: string, config?: any): Promise<any> {
    return this.post(`/workflows/steps/${stepId}/execute`, { type: 'ai', config });
  }
}

// Export singleton instance with enhanced methods
export const aiApi = new EnhancedAIApiClient(defaultAIApiConfig);
export { AIApiClient, EnhancedAIApiClient };
export type { 
  AIApiConfig, 
  AIStreamingResponse, 
  CognitiveProcessingConfig, 
  MultiAgentConfig, 
  ExplainabilityConfig 
};

// Default export for compatibility
export default EnhancedAIApiClient;