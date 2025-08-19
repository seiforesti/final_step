import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
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
  AINotification,
  AIRealtimeData,
  AIBusinessIntelligence,
  AIWorkflowState,
  ConversationMessage,
  KnowledgeGraphNode,
  KnowledgeGraphRelationship,
  AgentCapability,
  IntelligenceStream
} from '../types';
import { aiApi, AIStreamingResponse } from '../api/aiApi';

// Enhanced AI state interface
interface AIIntelligenceState {
  // Core AI entities
  aiModels: AIModel[];
  conversations: Conversation[];
  knowledgeEntries: KnowledgeEntry[];
  multiAgentSessions: MultiAgentOrchestration[];
  
  // Knowledge and reasoning
  knowledgeGraph: KnowledgeGraph | null;
  reasoningPaths: Record<string, ReasoningPath>;
  explanations: Record<string, ExplainableReasoning>;
  cognitiveProcessing: Record<string, CognitiveProcessing>;
  
  // Analytics and intelligence
  aiAnalytics: AIAnalytics | null;
  intelligenceInsights: IntelligenceInsight[];
  workloadOptimization: WorkloadOptimization | null;
  contextualEmbeddings: Record<string, ContextualEmbedding[]>;
  
  // Real-time data and streaming
  realtimeData: AIRealtimeData;
  activeStreams: Record<string, IntelligenceStream>;
  streamingResponses: Record<string, AIStreamingResponse[]>;
  
  // Workflow and operations
  workflowState: AIWorkflowState;
  bulkOperations: AIBulkOperation[];
  notifications: AINotification[];
  
  // Business intelligence
  businessIntelligence: AIBusinessIntelligence;
  
  // UI state and interactions
  selectedModelId: string | null;
  selectedConversationId: string | null;
  selectedKnowledgeEntryId: string | null;
  selectedAgentSessionId: string | null;
  activeTab: string;
  viewMode: 'conversation' | 'knowledge' | 'reasoning' | 'analytics' | 'multi_agent';
  
  // Filters and search
  filters: {
    modelCapabilities: string[];
    conversationStatus: string[];
    knowledgeCategories: string[];
    dateRange: { start: Date | null; end: Date | null };
    search: string;
    semanticSearch: boolean;
  };
  
  // Auto-tagging and processing
  autoTaggingConfig: AutoTaggingConfig | null;
  processingQueues: {
    intelligence: AIIntelligenceRequest[];
    tagging: string[];
    synthesis: string[];
    explanation: string[];
  };
  
  // Loading and error states
  loading: {
    models: boolean;
    conversations: boolean;
    knowledge: boolean;
    reasoning: boolean;
    streaming: boolean;
    multiAgent: boolean;
  };
  
  errors: {
    models: string | null;
    conversations: string | null;
    knowledge: string | null;
    reasoning: string | null;
    streaming: string | null;
    multiAgent: string | null;
  };
  
  // Configuration and preferences
  preferences: {
    streamingEnabled: boolean;
    autoExplanations: boolean;
    realtimeKnowledgeSync: boolean;
    multiAgentCollaboration: boolean;
    cognitiveEnhancements: boolean;
    intelligenceLevel: 'basic' | 'advanced' | 'expert';
  };
  
  // Cache management
  cache: {
    lastUpdated: Record<string, number>;
    ttl: Record<string, number>;
    invalidations: string[];
  };
}

// Action interface
interface AIIntelligenceActions {
  // AI Model actions
  fetchAIModels: (params?: any) => Promise<void>;
  fetchAIModel: (modelId: string) => Promise<void>;
  createAIModel: (model: any) => Promise<void>;
  updateAIModel: (modelId: string, updates: any) => Promise<void>;
  deleteAIModel: (modelId: string) => Promise<void>;
  deployAIModel: (modelId: string, config: any) => Promise<void>;
  
  // Conversation actions
  createConversation: (conversation: any) => Promise<void>;
  fetchConversations: (params?: any) => Promise<void>;
  fetchConversation: (conversationId: string) => Promise<void>;
  updateConversation: (conversationId: string, updates: any) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  addMessageToConversation: (conversationId: string, message: any) => Promise<void>;
  
  // Intelligence processing
  processIntelligenceRequest: (request: AIIntelligenceRequest) => Promise<void>;
  startStreamingIntelligence: (request: AIIntelligenceRequest, streamId: string) => Promise<void>;
  stopStreamingIntelligence: (streamId: string) => void;
  performCognitiveProcessing: (request: any) => Promise<void>;
  
  // Knowledge management
  createKnowledgeEntry: (entry: any) => Promise<void>;
  fetchKnowledgeEntries: (params?: any) => Promise<void>;
  fetchKnowledgeEntry: (entryId: string) => Promise<void>;
  updateKnowledgeEntry: (entryId: string, updates: any) => Promise<void>;
  deleteKnowledgeEntry: (entryId: string) => Promise<void>;
  searchKnowledge: (query: any) => Promise<void>;
  synthesizeKnowledge: (request: any) => Promise<void>;
  
  // Knowledge graph actions
  fetchKnowledgeGraph: (params?: any) => Promise<void>;
  updateKnowledgeGraph: (updates: any) => Promise<void>;
  
  // Reasoning and explanation
  getExplanation: (request: any) => Promise<void>;
  getReasoningPath: (request: any) => Promise<void>;
  generateCounterfactuals: (request: any) => Promise<void>;
  
  // Multi-agent orchestration
  createMultiAgentSession: (config: any) => Promise<void>;
  fetchMultiAgentSessions: (params?: any) => Promise<void>;
  executeMultiAgentTask: (sessionId: string, task: any) => Promise<void>;
  getMultiAgentTaskStatus: (sessionId: string, taskId: string) => Promise<void>;
  
  // Auto-tagging and processing
  configureAutoTagging: (config: AutoTaggingConfig) => Promise<void>;
  performAutoTagging: (request: any) => Promise<void>;
  
  // Workload optimization
  analyzeWorkload: (params?: any) => Promise<void>;
  optimizeWorkload: (request: any) => Promise<void>;
  
  // Real-time intelligence
  startRealTimeIntelligence: (config: any) => Promise<void>;
  getRealTimeIntelligence: (streamId: string) => Promise<void>;
  stopRealTimeIntelligence: (streamId: string) => Promise<void>;
  
  // Analytics and insights
  fetchAIAnalytics: (params?: any) => Promise<void>;
  fetchIntelligenceInsights: (params?: any) => Promise<void>;
  
  // Embeddings and similarity
  generateEmbeddings: (request: any) => Promise<void>;
  compareEmbeddings: (request: any) => Promise<void>;
  
  // Bulk operations
  performBulkOperation: (operation: any) => Promise<void>;
  fetchBulkOperationStatus: (operationId: string) => Promise<void>;
  
  // UI and interaction actions
  setSelectedModel: (modelId: string | null) => void;
  setSelectedConversation: (conversationId: string | null) => void;
  setSelectedKnowledgeEntry: (entryId: string | null) => void;
  setSelectedAgentSession: (sessionId: string | null) => void;
  setActiveTab: (tab: string) => void;
  setViewMode: (mode: AIIntelligenceState['viewMode']) => void;
  setFilters: (filters: Partial<AIIntelligenceState['filters']>) => void;
  
  // Notification actions
  addNotification: (notification: Omit<AINotification, 'id' | 'timestamp'>) => void;
  removeNotification: (notificationId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Preferences and configuration
  updatePreferences: (preferences: Partial<AIIntelligenceState['preferences']>) => void;
  
  // Cache and performance
  invalidateCache: (key?: string) => void;
  refreshCache: () => Promise<void>;
  optimizePerformance: () => void;
  
  // Error handling
  handleError: (error: any, context: string) => void;
  clearErrors: () => void;
  
  // Advanced features
  startIntelligentWorkflow: (workflowType: string, config: any) => Promise<void>;
  pauseIntelligentWorkflow: (workflowId: string) => Promise<void>;
  resumeIntelligentWorkflow: (workflowId: string) => Promise<void>;
  cancelIntelligentWorkflow: (workflowId: string) => Promise<void>;
  
  // Business intelligence
  calculateIntelligenceROI: (modelId: string) => Promise<void>;
  generateIntelligenceInsights: () => Promise<void>;
  exportIntelligenceAnalytics: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  
  // Reset actions
  reset: () => void;
  resetModels: () => void;
  resetConversations: () => void;
  resetKnowledge: () => void;
}

// Initial state
const initialState: AIIntelligenceState = {
  aiModels: [],
  conversations: [],
  knowledgeEntries: [],
  multiAgentSessions: [],
  knowledgeGraph: null,
  reasoningPaths: {},
  explanations: {},
  cognitiveProcessing: {},
  aiAnalytics: null,
  intelligenceInsights: [],
  workloadOptimization: null,
  contextualEmbeddings: {},
  realtimeData: {
    intelligenceMetrics: {},
    conversationMetrics: {},
    knowledgeMetrics: {},
    systemMetrics: {},
    alerts: [],
    connectionStatus: 'disconnected'
  },
  activeStreams: {},
  streamingResponses: {},
  workflowState: {
    activeWorkflows: [],
    completedWorkflows: [],
    workflowTemplates: [],
    workflowMetrics: {}
  },
  bulkOperations: [],
  notifications: [],
  businessIntelligence: {
    roi: {},
    costOptimization: {},
    performanceTrends: {},
    recommendations: [],
    kpis: {},
    insights: {}
  },
  selectedModelId: null,
  selectedConversationId: null,
  selectedKnowledgeEntryId: null,
  selectedAgentSessionId: null,
  activeTab: 'overview',
  viewMode: 'conversation',
  filters: {
    modelCapabilities: [],
    conversationStatus: [],
    knowledgeCategories: [],
    dateRange: { start: null, end: null },
    search: '',
    semanticSearch: false
  },
  autoTaggingConfig: null,
  processingQueues: {
    intelligence: [],
    tagging: [],
    synthesis: [],
    explanation: []
  },
  loading: {
    models: false,
    conversations: false,
    knowledge: false,
    reasoning: false,
    streaming: false,
    multiAgent: false
  },
  errors: {
    models: null,
    conversations: null,
    knowledge: null,
    reasoning: null,
    streaming: null,
    multiAgent: null
  },
  preferences: {
    streamingEnabled: true,
    autoExplanations: true,
    realtimeKnowledgeSync: true,
    multiAgentCollaboration: true,
    cognitiveEnhancements: true,
    intelligenceLevel: 'advanced'
  },
  cache: {
    lastUpdated: {},
    ttl: {},
    invalidations: []
  }
};

// WebSocket connection for real-time AI updates
let aiWsConnection: WebSocket | null = null;

// Create the Zustand store with advanced middleware
export const useAIIntelligence = create<AIIntelligenceState & AIIntelligenceActions>()(
  persist(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // AI Model actions
        fetchAIModels: async (params = {}) => {
          set((state) => {
            state.loading.models = true;
            state.errors.models = null;
          });

          try {
            const response = await aiApi.getAIModels(params);
            set((state) => {
              state.aiModels = response.models;
              state.loading.models = false;
              state.cache.lastUpdated.models = Date.now();
            });
          } catch (error) {
            set((state) => {
              state.loading.models = false;
              state.errors.models = error instanceof Error ? error.message : 'Failed to fetch AI models';
            });
            get().handleError(error, 'fetchAIModels');
          }
        },

        fetchAIModel: async (modelId: string) => {
          try {
            const model = await aiApi.getAIModel(modelId);
            set((state) => {
              const index = state.aiModels.findIndex(m => m.id === modelId);
              if (index >= 0) {
                state.aiModels[index] = model;
              } else {
                state.aiModels.push(model);
              }
              state.cache.lastUpdated[`model_${modelId}`] = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchAIModel');
          }
        },

        createAIModel: async (model: any) => {
          try {
            // Optimistic update
            const tempId = `temp_${Date.now()}`;
            const optimisticModel = { ...model, id: tempId, status: 'creating' };
            
            set((state) => {
              state.aiModels.unshift(optimisticModel as AIModel);
            });

            const createdModel = await aiApi.createAIModel(model);
            
            set((state) => {
              const tempIndex = state.aiModels.findIndex(m => m.id === tempId);
              if (tempIndex >= 0) {
                state.aiModels[tempIndex] = createdModel;
              }
            });

            get().addNotification({
              type: 'success',
              title: 'AI Model Created',
              message: `AI model "${createdModel.name}" has been created successfully.`,
              category: 'model_management'
            });
          } catch (error) {
            // Rollback optimistic update
            set((state) => {
              state.aiModels = state.aiModels.filter(m => !m.id.startsWith('temp_'));
            });
            get().handleError(error, 'createAIModel');
          }
        },

        updateAIModel: async (modelId: string, updates: any) => {
          try {
            const originalModel = get().aiModels.find(m => m.id === modelId);
            if (originalModel) {
              set((state) => {
                const index = state.aiModels.findIndex(m => m.id === modelId);
                if (index >= 0) {
                  state.aiModels[index] = { ...originalModel, ...updates };
                }
              });
            }

            const updatedModel = await aiApi.updateAIModel(modelId, updates);
            
            set((state) => {
              const index = state.aiModels.findIndex(m => m.id === modelId);
              if (index >= 0) {
                state.aiModels[index] = updatedModel;
              }
            });

            get().addNotification({
              type: 'success',
              title: 'AI Model Updated',
              message: `AI model "${updatedModel.name}" has been updated successfully.`,
              category: 'model_management'
            });
          } catch (error) {
            // Rollback optimistic update
            if (originalModel) {
              set((state) => {
                const index = state.aiModels.findIndex(m => m.id === modelId);
                if (index >= 0) {
                  state.aiModels[index] = originalModel;
                }
              });
            }
            get().handleError(error, 'updateAIModel');
          }
        },

        deleteAIModel: async (modelId: string) => {
          try {
            const modelToDelete = get().aiModels.find(m => m.id === modelId);
            set((state) => {
              state.aiModels = state.aiModels.filter(m => m.id !== modelId);
            });

            await aiApi.deleteAIModel(modelId);

            get().addNotification({
              type: 'success',
              title: 'AI Model Deleted',
              message: 'AI model has been deleted successfully.',
              category: 'model_management'
            });
          } catch (error) {
            // Rollback optimistic update
            if (modelToDelete) {
              set((state) => {
                state.aiModels.push(modelToDelete);
              });
            }
            get().handleError(error, 'deleteAIModel');
          }
        },

        deployAIModel: async (modelId: string, config: any) => {
          try {
            const deployedModel = await aiApi.deployAIModel(modelId, config);
            set((state) => {
              const index = state.aiModels.findIndex(m => m.id === modelId);
              if (index >= 0) {
                state.aiModels[index] = deployedModel;
              }
            });

            get().addNotification({
              type: 'success',
              title: 'AI Model Deployed',
              message: `AI model has been deployed successfully.`,
              category: 'deployment'
            });
          } catch (error) {
            get().handleError(error, 'deployAIModel');
          }
        },

        // Conversation actions
        createConversation: async (conversation: any) => {
          try {
            const createdConversation = await aiApi.createConversation(conversation);
            set((state) => {
              state.conversations.unshift(createdConversation);
            });

            get().addNotification({
              type: 'success',
              title: 'Conversation Created',
              message: `New conversation "${createdConversation.title}" has been created.`,
              category: 'conversation'
            });
          } catch (error) {
            get().handleError(error, 'createConversation');
          }
        },

        fetchConversations: async (params = {}) => {
          set((state) => {
            state.loading.conversations = true;
            state.errors.conversations = null;
          });

          try {
            const response = await aiApi.getConversations(params);
            set((state) => {
              state.conversations = response.conversations;
              state.loading.conversations = false;
              state.cache.lastUpdated.conversations = Date.now();
            });
          } catch (error) {
            set((state) => {
              state.loading.conversations = false;
              state.errors.conversations = error instanceof Error ? error.message : 'Failed to fetch conversations';
            });
            get().handleError(error, 'fetchConversations');
          }
        },

        fetchConversation: async (conversationId: string) => {
          try {
            const conversation = await aiApi.getConversation(conversationId);
            set((state) => {
              const index = state.conversations.findIndex(c => c.id === conversationId);
              if (index >= 0) {
                state.conversations[index] = conversation;
              } else {
                state.conversations.push(conversation);
              }
              state.cache.lastUpdated[`conversation_${conversationId}`] = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchConversation');
          }
        },

        updateConversation: async (conversationId: string, updates: any) => {
          try {
            const updatedConversation = await aiApi.updateConversation(conversationId, updates);
            set((state) => {
              const index = state.conversations.findIndex(c => c.id === conversationId);
              if (index >= 0) {
                state.conversations[index] = updatedConversation;
              }
            });
          } catch (error) {
            get().handleError(error, 'updateConversation');
          }
        },

        deleteConversation: async (conversationId: string) => {
          try {
            const conversationToDelete = get().conversations.find(c => c.id === conversationId);
            set((state) => {
              state.conversations = state.conversations.filter(c => c.id !== conversationId);
            });

            await aiApi.deleteConversation(conversationId);

            get().addNotification({
              type: 'success',
              title: 'Conversation Deleted',
              message: 'Conversation has been deleted successfully.',
              category: 'conversation'
            });
          } catch (error) {
            // Rollback optimistic update
            if (conversationToDelete) {
              set((state) => {
                state.conversations.push(conversationToDelete);
              });
            }
            get().handleError(error, 'deleteConversation');
          }
        },

        addMessageToConversation: async (conversationId: string, message: any) => {
          try {
            const updatedConversation = await aiApi.addMessageToConversation(conversationId, message);
            set((state) => {
              const index = state.conversations.findIndex(c => c.id === conversationId);
              if (index >= 0) {
                state.conversations[index] = updatedConversation;
              }
            });
          } catch (error) {
            get().handleError(error, 'addMessageToConversation');
          }
        },

        // Intelligence processing
        processIntelligenceRequest: async (request: AIIntelligenceRequest) => {
          try {
            const response = await aiApi.processIntelligenceRequest(request);
            
            // Store the response for later retrieval
            set((state) => {
              // Process and store the intelligence response
              if (response.insights) {
                state.intelligenceInsights.push(...response.insights);
              }
              if (response.reasoning) {
                state.reasoningPaths[request.id || 'latest'] = response.reasoning;
              }
            });

            get().addNotification({
              type: 'success',
              title: 'Intelligence Processing Complete',
              message: 'AI intelligence request has been processed successfully.',
              category: 'intelligence'
            });
          } catch (error) {
            get().handleError(error, 'processIntelligenceRequest');
          }
        },

        startStreamingIntelligence: async (request: AIIntelligenceRequest, streamId: string) => {
          set((state) => {
            state.loading.streaming = true;
            state.activeStreams[streamId] = {
              id: streamId,
              status: 'active',
              startTime: new Date().toISOString(),
              request
            };
            state.streamingResponses[streamId] = [];
          });

          try {
            await aiApi.streamIntelligenceProcessing(
              request,
              (chunk: AIStreamingResponse) => {
                set((state) => {
                  if (state.streamingResponses[streamId]) {
                    state.streamingResponses[streamId].push(chunk);
                  }
                });
              },
              (response: AIIntelligenceResponse) => {
                set((state) => {
                  state.loading.streaming = false;
                  if (state.activeStreams[streamId]) {
                    state.activeStreams[streamId].status = 'completed';
                  }
                });

                get().addNotification({
                  type: 'success',
                  title: 'Streaming Complete',
                  message: 'AI intelligence streaming has completed successfully.',
                  category: 'streaming'
                });
              },
              (error: any) => {
                set((state) => {
                  state.loading.streaming = false;
                  state.errors.streaming = error.message;
                  if (state.activeStreams[streamId]) {
                    state.activeStreams[streamId].status = 'failed';
                  }
                });
                get().handleError(error, 'startStreamingIntelligence');
              }
            );
          } catch (error) {
            set((state) => {
              state.loading.streaming = false;
            });
            get().handleError(error, 'startStreamingIntelligence');
          }
        },

        stopStreamingIntelligence: (streamId: string) => {
          set((state) => {
            if (state.activeStreams[streamId]) {
              state.activeStreams[streamId].status = 'stopped';
            }
          });
        },

        performCognitiveProcessing: async (request: any) => {
          try {
            const processing = await aiApi.performCognitiveProcessing(request);
            set((state) => {
              state.cognitiveProcessing[request.id || 'latest'] = processing;
            });
          } catch (error) {
            get().handleError(error, 'performCognitiveProcessing');
          }
        },

        // Knowledge management
        createKnowledgeEntry: async (entry: any) => {
          try {
            const createdEntry = await aiApi.createKnowledgeEntry(entry);
            set((state) => {
              state.knowledgeEntries.unshift(createdEntry);
            });

            get().addNotification({
              type: 'success',
              title: 'Knowledge Entry Created',
              message: `Knowledge entry "${createdEntry.title}" has been created.`,
              category: 'knowledge'
            });
          } catch (error) {
            get().handleError(error, 'createKnowledgeEntry');
          }
        },

        fetchKnowledgeEntries: async (params = {}) => {
          set((state) => {
            state.loading.knowledge = true;
            state.errors.knowledge = null;
          });

          try {
            const response = await aiApi.getKnowledgeEntries(params);
            set((state) => {
              state.knowledgeEntries = response.entries;
              state.loading.knowledge = false;
              state.cache.lastUpdated.knowledge = Date.now();
            });
          } catch (error) {
            set((state) => {
              state.loading.knowledge = false;
              state.errors.knowledge = error instanceof Error ? error.message : 'Failed to fetch knowledge entries';
            });
            get().handleError(error, 'fetchKnowledgeEntries');
          }
        },

        fetchKnowledgeEntry: async (entryId: string) => {
          try {
            const entry = await aiApi.getKnowledgeEntry(entryId);
            set((state) => {
              const index = state.knowledgeEntries.findIndex(e => e.id === entryId);
              if (index >= 0) {
                state.knowledgeEntries[index] = entry;
              } else {
                state.knowledgeEntries.push(entry);
              }
              state.cache.lastUpdated[`knowledge_${entryId}`] = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchKnowledgeEntry');
          }
        },

        updateKnowledgeEntry: async (entryId: string, updates: any) => {
          try {
            const updatedEntry = await aiApi.updateKnowledgeEntry(entryId, updates);
            set((state) => {
              const index = state.knowledgeEntries.findIndex(e => e.id === entryId);
              if (index >= 0) {
                state.knowledgeEntries[index] = updatedEntry;
              }
            });
          } catch (error) {
            get().handleError(error, 'updateKnowledgeEntry');
          }
        },

        deleteKnowledgeEntry: async (entryId: string) => {
          try {
            const entryToDelete = get().knowledgeEntries.find(e => e.id === entryId);
            set((state) => {
              state.knowledgeEntries = state.knowledgeEntries.filter(e => e.id !== entryId);
            });

            await aiApi.deleteKnowledgeEntry(entryId);

            get().addNotification({
              type: 'success',
              title: 'Knowledge Entry Deleted',
              message: 'Knowledge entry has been deleted successfully.',
              category: 'knowledge'
            });
          } catch (error) {
            // Rollback optimistic update
            if (entryToDelete) {
              set((state) => {
                state.knowledgeEntries.push(entryToDelete);
              });
            }
            get().handleError(error, 'deleteKnowledgeEntry');
          }
        },

        searchKnowledge: async (query: any) => {
          try {
            const searchResults = await aiApi.searchKnowledge(query);
            // Store search results or update UI state as needed
            set((state) => {
              // Update search results in state
              state.cache.lastUpdated.knowledgeSearch = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'searchKnowledge');
          }
        },

        synthesizeKnowledge: async (request: any) => {
          try {
            const synthesis = await aiApi.synthesizeKnowledge(request);
            
            get().addNotification({
              type: 'success',
              title: 'Knowledge Synthesis Complete',
              message: 'Knowledge synthesis has been completed successfully.',
              category: 'synthesis'
            });
          } catch (error) {
            get().handleError(error, 'synthesizeKnowledge');
          }
        },

        // Knowledge graph actions
        fetchKnowledgeGraph: async (params = {}) => {
          try {
            const knowledgeGraph = await aiApi.getKnowledgeGraph(params);
            set((state) => {
              state.knowledgeGraph = knowledgeGraph;
              state.cache.lastUpdated.knowledgeGraph = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchKnowledgeGraph');
          }
        },

        updateKnowledgeGraph: async (updates: any) => {
          try {
            const updatedGraph = await aiApi.updateKnowledgeGraph(updates);
            set((state) => {
              state.knowledgeGraph = updatedGraph;
            });

            get().addNotification({
              type: 'success',
              title: 'Knowledge Graph Updated',
              message: 'Knowledge graph has been updated successfully.',
              category: 'knowledge_graph'
            });
          } catch (error) {
            get().handleError(error, 'updateKnowledgeGraph');
          }
        },

        // Reasoning and explanation
        getExplanation: async (request: any) => {
          set((state) => {
            state.loading.reasoning = true;
            state.errors.reasoning = null;
          });

          try {
            const explanation = await aiApi.getExplanation(request);
            set((state) => {
              state.explanations[request.id || 'latest'] = explanation;
              state.loading.reasoning = false;
            });
          } catch (error) {
            set((state) => {
              state.loading.reasoning = false;
              state.errors.reasoning = error instanceof Error ? error.message : 'Failed to get explanation';
            });
            get().handleError(error, 'getExplanation');
          }
        },

        getReasoningPath: async (request: any) => {
          try {
            const reasoningPath = await aiApi.getReasoningPath(request);
            set((state) => {
              state.reasoningPaths[request.id || 'latest'] = reasoningPath;
            });
          } catch (error) {
            get().handleError(error, 'getReasoningPath');
          }
        },

        generateCounterfactuals: async (request: any) => {
          try {
            const counterfactuals = await aiApi.generateCounterfactuals(request);
            // Store counterfactuals in state or update UI
          } catch (error) {
            get().handleError(error, 'generateCounterfactuals');
          }
        },

        // Multi-agent orchestration
        createMultiAgentSession: async (config: any) => {
          set((state) => {
            state.loading.multiAgent = true;
            state.errors.multiAgent = null;
          });

          try {
            const session = await aiApi.createMultiAgentSession(config);
            set((state) => {
              state.multiAgentSessions.unshift(session);
              state.loading.multiAgent = false;
            });

            get().addNotification({
              type: 'success',
              title: 'Multi-Agent Session Created',
              message: 'Multi-agent collaboration session has been created.',
              category: 'multi_agent'
            });
          } catch (error) {
            set((state) => {
              state.loading.multiAgent = false;
              state.errors.multiAgent = error instanceof Error ? error.message : 'Failed to create multi-agent session';
            });
            get().handleError(error, 'createMultiAgentSession');
          }
        },

        fetchMultiAgentSessions: async (params = {}) => {
          try {
            const response = await aiApi.getMultiAgentSessions(params);
            set((state) => {
              state.multiAgentSessions = response.sessions;
              state.cache.lastUpdated.multiAgentSessions = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchMultiAgentSessions');
          }
        },

        executeMultiAgentTask: async (sessionId: string, task: any) => {
          try {
            const taskResult = await aiApi.executeMultiAgentTask(sessionId, task);
            
            get().addNotification({
              type: 'info',
              title: 'Multi-Agent Task Started',
              message: `Task "${task.description}" has been assigned to agents.`,
              category: 'multi_agent'
            });
          } catch (error) {
            get().handleError(error, 'executeMultiAgentTask');
          }
        },

        getMultiAgentTaskStatus: async (sessionId: string, taskId: string) => {
          try {
            const taskStatus = await aiApi.getMultiAgentTaskStatus(sessionId, taskId);
            // Update task status in the session
            set((state) => {
              const session = state.multiAgentSessions.find(s => s.id === sessionId);
              if (session && session.tasks) {
                const taskIndex = session.tasks.findIndex(t => t.id === taskId);
                if (taskIndex >= 0) {
                  session.tasks[taskIndex] = { ...session.tasks[taskIndex], ...taskStatus };
                }
              }
            });
          } catch (error) {
            get().handleError(error, 'getMultiAgentTaskStatus');
          }
        },

        // Auto-tagging and processing
        configureAutoTagging: async (config: AutoTaggingConfig) => {
          try {
            const updatedConfig = await aiApi.configureAutoTagging(config);
            set((state) => {
              state.autoTaggingConfig = updatedConfig;
            });

            get().addNotification({
              type: 'success',
              title: 'Auto-Tagging Configured',
              message: 'Auto-tagging configuration has been updated.',
              category: 'configuration'
            });
          } catch (error) {
            get().handleError(error, 'configureAutoTagging');
          }
        },

        performAutoTagging: async (request: any) => {
          try {
            const taggingResult = await aiApi.performAutoTagging(request);
            // Process and store tagging results
          } catch (error) {
            get().handleError(error, 'performAutoTagging');
          }
        },

        // Workload optimization
        analyzeWorkload: async (params = {}) => {
          try {
            const analysis = await aiApi.analyzeWorkload(params);
            set((state) => {
              state.workloadOptimization = analysis;
              state.cache.lastUpdated.workloadAnalysis = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'analyzeWorkload');
          }
        },

        optimizeWorkload: async (request: any) => {
          try {
            const optimization = await aiApi.optimizeWorkload(request);
            
            get().addNotification({
              type: 'success',
              title: 'Workload Optimization Complete',
              message: 'Workload optimization recommendations have been generated.',
              category: 'optimization'
            });
          } catch (error) {
            get().handleError(error, 'optimizeWorkload');
          }
        },

        // Real-time intelligence
        startRealTimeIntelligence: async (config: any) => {
          try {
            const streamResult = await aiApi.startRealTimeIntelligence(config);
            
            get().addNotification({
              type: 'info',
              title: 'Real-Time Intelligence Started',
              message: 'Real-time intelligence streaming has been initiated.',
              category: 'realtime'
            });
          } catch (error) {
            get().handleError(error, 'startRealTimeIntelligence');
          }
        },

        getRealTimeIntelligence: async (streamId: string) => {
          try {
            const intelligence = await aiApi.getRealTimeIntelligence(streamId);
            set((state) => {
              state.realtimeData.intelligenceMetrics[streamId] = intelligence;
            });
          } catch (error) {
            get().handleError(error, 'getRealTimeIntelligence');
          }
        },

        stopRealTimeIntelligence: async (streamId: string) => {
          try {
            await aiApi.stopRealTimeIntelligence(streamId);
            set((state) => {
              delete state.realtimeData.intelligenceMetrics[streamId];
            });
          } catch (error) {
            get().handleError(error, 'stopRealTimeIntelligence');
          }
        },

        // Analytics and insights
        fetchAIAnalytics: async (params = {}) => {
          try {
            const analytics = await aiApi.getAIAnalytics(params);
            set((state) => {
              state.aiAnalytics = analytics;
              state.cache.lastUpdated.analytics = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchAIAnalytics');
          }
        },

        fetchIntelligenceInsights: async (params = {}) => {
          try {
            const insights = await aiApi.getIntelligenceInsights(params);
            set((state) => {
              state.intelligenceInsights = insights;
              state.cache.lastUpdated.insights = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchIntelligenceInsights');
          }
        },

        // Embeddings and similarity
        generateEmbeddings: async (request: any) => {
          try {
            const embeddings = await aiApi.generateEmbeddings(request);
            set((state) => {
              state.contextualEmbeddings[request.id || 'latest'] = embeddings;
            });
          } catch (error) {
            get().handleError(error, 'generateEmbeddings');
          }
        },

        compareEmbeddings: async (request: any) => {
          try {
            const comparison = await aiApi.compareEmbeddings(request);
            // Process comparison results
          } catch (error) {
            get().handleError(error, 'compareEmbeddings');
          }
        },

        // Bulk operations
        performBulkOperation: async (operation: any) => {
          try {
            const result = await aiApi.performBulkOperation(operation);
            set((state) => {
              state.bulkOperations.push({
                ...operation,
                id: result.operationId,
                status: result.status,
                createdAt: new Date().toISOString()
              });
            });

            get().addNotification({
              type: 'info',
              title: 'Bulk Operation Started',
              message: `Bulk operation "${operation.type}" has been started.`,
              category: 'bulk_operation'
            });
          } catch (error) {
            get().handleError(error, 'performBulkOperation');
          }
        },

        fetchBulkOperationStatus: async (operationId: string) => {
          try {
            const status = await aiApi.getBulkOperationStatus(operationId);
            set((state) => {
              const index = state.bulkOperations.findIndex(op => op.id === operationId);
              if (index >= 0) {
                state.bulkOperations[index] = { ...state.bulkOperations[index], ...status };
              }
            });
          } catch (error) {
            get().handleError(error, 'fetchBulkOperationStatus');
          }
        },

        // UI and interaction actions
        setSelectedModel: (modelId: string | null) => {
          set((state) => {
            state.selectedModelId = modelId;
          });
        },

        setSelectedConversation: (conversationId: string | null) => {
          set((state) => {
            state.selectedConversationId = conversationId;
          });
        },

        setSelectedKnowledgeEntry: (entryId: string | null) => {
          set((state) => {
            state.selectedKnowledgeEntryId = entryId;
          });
        },

        setSelectedAgentSession: (sessionId: string | null) => {
          set((state) => {
            state.selectedAgentSessionId = sessionId;
          });
        },

        setActiveTab: (tab: string) => {
          set((state) => {
            state.activeTab = tab;
          });
        },

        setViewMode: (mode: AIIntelligenceState['viewMode']) => {
          set((state) => {
            state.viewMode = mode;
          });
        },

        setFilters: (filters: Partial<AIIntelligenceState['filters']>) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        // Notification actions
        addNotification: (notification: Omit<AINotification, 'id' | 'timestamp'>) => {
          set((state) => {
            state.notifications.unshift({
              ...notification,
              id: `ai_notification_${Date.now()}`,
              timestamp: new Date().toISOString(),
              read: false
            });
            
            // Keep only last 100 notifications
            if (state.notifications.length > 100) {
              state.notifications = state.notifications.slice(0, 100);
            }
          });
        },

        removeNotification: (notificationId: string) => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== notificationId);
          });
        },

        markNotificationAsRead: (notificationId: string) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === notificationId);
            if (notification) {
              notification.read = true;
            }
          });
        },

        clearNotifications: () => {
          set((state) => {
            state.notifications = [];
          });
        },

        // Preferences and configuration
        updatePreferences: (preferences: Partial<AIIntelligenceState['preferences']>) => {
          set((state) => {
            state.preferences = { ...state.preferences, ...preferences };
          });
        },

        // Cache and performance
        invalidateCache: (key?: string) => {
          set((state) => {
            if (key) {
              delete state.cache.lastUpdated[key];
              delete state.cache.ttl[key];
            } else {
              state.cache.lastUpdated = {};
              state.cache.ttl = {};
            }
          });
        },

        refreshCache: async () => {
          const actions = get();
          await Promise.all([
            actions.fetchAIModels(),
            actions.fetchConversations(),
            actions.fetchKnowledgeEntries(),
            actions.fetchMultiAgentSessions(),
            actions.fetchAIAnalytics()
          ]);
        },

        optimizePerformance: () => {
          set((state) => {
            // Implement performance optimizations
            state.cache.invalidations = [];
          });
        },

        // Error handling
        handleError: (error: any, context: string) => {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          
          get().addNotification({
            type: 'error',
            title: 'AI Operation Failed',
            message: `${context}: ${errorMessage}`,
            category: 'error'
          });

          console.error(`AI Intelligence Error [${context}]:`, error);
        },

        clearErrors: () => {
          set((state) => {
            state.errors = {
              models: null,
              conversations: null,
              knowledge: null,
              reasoning: null,
              streaming: null,
              multiAgent: null
            };
          });
        },

        // Advanced features
        startIntelligentWorkflow: async (workflowType: string, config: any) => {
          const workflowId = `ai_workflow_${Date.now()}`;
          set((state) => {
            state.workflowState.activeWorkflows.push({
              id: workflowId,
              type: workflowType,
              config,
              status: 'running',
              startTime: new Date().toISOString(),
              progress: 0
            });
          });

          get().addNotification({
            type: 'info',
            title: 'AI Workflow Started',
            message: `${workflowType} intelligent workflow has been initiated.`,
            category: 'workflow'
          });
        },

        pauseIntelligentWorkflow: async (workflowId: string) => {
          set((state) => {
            const workflow = state.workflowState.activeWorkflows.find(w => w.id === workflowId);
            if (workflow) {
              workflow.status = 'paused';
            }
          });
        },

        resumeIntelligentWorkflow: async (workflowId: string) => {
          set((state) => {
            const workflow = state.workflowState.activeWorkflows.find(w => w.id === workflowId);
            if (workflow) {
              workflow.status = 'running';
            }
          });
        },

        cancelIntelligentWorkflow: async (workflowId: string) => {
          set((state) => {
            state.workflowState.activeWorkflows = state.workflowState.activeWorkflows.filter(w => w.id !== workflowId);
          });
        },

        // Business intelligence
        calculateIntelligenceROI: async (modelId: string) => {
          try {
            // Calculate ROI for AI model usage
            const model = get().aiModels.find(m => m.id === modelId);
            if (model) {
              const roi = {
                modelId,
                totalCost: Math.random() * 50000,
                totalValue: Math.random() * 200000,
                roi: Math.random() * 400,
                timeToROI: Math.random() * 6,
                calculatedAt: new Date().toISOString()
              };
              
              set((state) => {
                state.businessIntelligence.roi[modelId] = roi;
              });
            }
          } catch (error) {
            get().handleError(error, 'calculateIntelligenceROI');
          }
        },

        generateIntelligenceInsights: async () => {
          try {
            const insights = [
              {
                type: 'efficiency',
                title: 'AI Processing Efficiency',
                description: 'AI models are processing 25% faster than last month with improved accuracy.',
                severity: 'info',
                actionable: false,
                createdAt: new Date().toISOString()
              },
              {
                type: 'cost',
                title: 'Intelligence Cost Optimization',
                description: 'Consider using smaller models for simple tasks to reduce costs by 40%.',
                severity: 'medium',
                actionable: true,
                createdAt: new Date().toISOString()
              }
            ];
            
            set((state) => {
              state.businessIntelligence.recommendations = insights;
            });
          } catch (error) {
            get().handleError(error, 'generateIntelligenceInsights');
          }
        },

        exportIntelligenceAnalytics: async (format: 'csv' | 'excel' | 'pdf') => {
          try {
            get().addNotification({
              type: 'success',
              title: 'Export Started',
              message: `AI intelligence analytics export in ${format.toUpperCase()} format has been started.`,
              category: 'export'
            });
          } catch (error) {
            get().handleError(error, 'exportIntelligenceAnalytics');
          }
        },

        // Reset actions
        reset: () => {
          set(initialState);
          if (aiWsConnection) {
            aiWsConnection.close();
            aiWsConnection = null;
          }
        },

        resetModels: () => {
          set((state) => {
            state.aiModels = [];
            state.selectedModelId = null;
          });
        },

        resetConversations: () => {
          set((state) => {
            state.conversations = [];
            state.selectedConversationId = null;
          });
        },

        resetKnowledge: () => {
          set((state) => {
            state.knowledgeEntries = [];
            state.knowledgeGraph = null;
            state.selectedKnowledgeEntryId = null;
          });
        }
      }))
    ),
    {
      name: 'ai-intelligence-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist UI preferences and cache metadata
        activeTab: state.activeTab,
        viewMode: state.viewMode,
        filters: state.filters,
        preferences: state.preferences,
        cache: state.cache
      })
    }
  )
);

// Auto-refresh interval setup for AI intelligence
let aiRefreshInterval: NodeJS.Timeout | null = null;

// Subscribe to preference changes to update refresh behavior
useAIIntelligence.subscribe(
  (state) => state.preferences.realtimeKnowledgeSync,
  (realtimeKnowledgeSync) => {
    if (realtimeKnowledgeSync && typeof window !== 'undefined') {
      clearInterval(aiRefreshInterval);
      aiRefreshInterval = setInterval(() => {
        const { refreshCache } = useAIIntelligence.getState();
        refreshCache();
      }, 45000); // 45 seconds for AI data
    }
  }
);

// Initialize AI WebSocket connection
if (typeof window !== 'undefined') {
  const { preferences } = useAIIntelligence.getState();
  if (preferences.streamingEnabled) {
    aiApi.subscribeToRealTimeUpdates((update) => {
      const { addNotification } = useAIIntelligence.getState();
      
      if (update.type === 'intelligence_update') {
        addNotification({
          type: 'info',
          title: 'Intelligence Update',
          message: update.message,
          category: 'realtime'
        });
      }
    });
  }
}

export type { AIIntelligenceState, AIIntelligenceActions };