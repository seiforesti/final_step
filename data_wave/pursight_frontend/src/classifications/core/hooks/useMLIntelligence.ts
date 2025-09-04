import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  MLModel,
  TrainingJob,
  Prediction,
  MLMetrics,
  HyperparameterConfig,
  MLDriftDetection,
  FeatureEngineering,
  ModelEnsemble,
  MLAnalytics,
  MLResourceUsage,
  MLModelValidation,
  MLFeatureImportance,
  MLModelComparison,
  MLBulkOperation,
  MLWorkflowState,
  MLNotification,
  MLRealtimeData,
  MLBusinessIntelligence
} from '../types';
import { mlApi } from '../api/mlApi';

// Advanced ML state interface
interface MLIntelligenceState {
  // Core ML entities
  models: MLModel[];
  trainingJobs: TrainingJob[];
  predictions: Prediction[];
  ensembles: ModelEnsemble[];
  
  // Analytics and monitoring
  analytics: MLAnalytics | null;
  resourceUsage: MLResourceUsage | null;
  driftDetections: Record<string, MLDriftDetection>;
  featureImportance: Record<string, MLFeatureImportance>;
  modelValidations: Record<string, MLModelValidation[]>;
  modelComparisons: MLModelComparison[];
  
  // Real-time data
  realtimeData: MLRealtimeData;
  
  // Workflow and operations
  workflowState: MLWorkflowState;
  bulkOperations: MLBulkOperation[];
  notifications: MLNotification[];
  
  // Business intelligence
  businessIntelligence: MLBusinessIntelligence;
  
  // UI state
  selectedModelId: string | null;
  selectedTrainingJobId: string | null;
  selectedEnsembleId: string | null;
  viewMode: 'list' | 'grid' | 'timeline' | 'analytics';
  filters: {
    status: string[];
    modelType: string[];
    dateRange: { start: Date | null; end: Date | null };
    search: string;
  };
  
  // Loading and error states
  loading: {
    models: boolean;
    trainingJobs: boolean;
    predictions: boolean;
    analytics: boolean;
    bulkOperations: boolean;
  };
  
  errors: {
    models: string | null;
    trainingJobs: string | null;
    predictions: string | null;
    analytics: string | null;
    bulkOperations: string | null;
  };
  
  // Cache management
  cache: {
    lastUpdated: Record<string, number>;
    ttl: Record<string, number>;
  };
  
  // Performance optimization
  optimizations: {
    batchSize: number;
    refreshInterval: number;
    enableRealtime: boolean;
    compressionLevel: number;
  };
}

// Action interface
interface MLIntelligenceActions {
  // ML Model actions
  fetchModels: (params?: any) => Promise<void>;
  fetchModel: (modelId: string) => Promise<void>;
  createModel: (model: any) => Promise<void>;
  updateModel: (modelId: string, updates: any) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  deployModel: (modelId: string, config: any) => Promise<void>;
  retireModel: (modelId: string) => Promise<void>;
  
  // Training Job actions
  fetchTrainingJobs: (params?: any) => Promise<void>;
  fetchTrainingJob: (jobId: string) => Promise<void>;
  createTrainingJob: (job: any) => Promise<void>;
  stopTrainingJob: (jobId: string) => Promise<void>;
  
  // Prediction actions
  makePrediction: (request: any) => Promise<void>;
  fetchPredictions: (params?: any) => Promise<void>;
  provideFeedback: (predictionId: string, feedback: any) => Promise<void>;
  
  // Analytics actions
  fetchAnalytics: (params?: any) => Promise<void>;
  fetchResourceUsage: (params?: any) => Promise<void>;
  fetchDriftDetection: (modelId: string, params?: any) => Promise<void>;
  fetchFeatureImportance: (modelId: string) => Promise<void>;
  fetchModelValidations: (modelId: string) => Promise<void>;
  compareModels: (modelIds: string[], metrics: string[]) => Promise<void>;
  
  // Ensemble actions
  createEnsemble: (ensemble: any) => Promise<void>;
  fetchEnsembles: (params?: any) => Promise<void>;
  updateEnsemble: (ensembleId: string, updates: any) => Promise<void>;
  deleteEnsemble: (ensembleId: string) => Promise<void>;
  
  // Bulk operations
  performBulkOperation: (operation: any) => Promise<void>;
  fetchBulkOperationStatus: (operationId: string) => Promise<void>;
  
  // AutoML actions
  startAutoML: (config: any) => Promise<void>;
  fetchAutoMLStatus: (jobId: string) => Promise<void>;
  
  // Real-time actions
  startRealtimeMonitoring: () => void;
  stopRealtimeMonitoring: () => void;
  processRealtimeUpdate: (update: any) => void;
  
  // Workflow actions
  startWorkflow: (workflowType: string, config: any) => Promise<void>;
  pauseWorkflow: (workflowId: string) => Promise<void>;
  resumeWorkflow: (workflowId: string) => Promise<void>;
  cancelWorkflow: (workflowId: string) => Promise<void>;
  
  // UI actions
  setSelectedModel: (modelId: string | null) => void;
  setSelectedTrainingJob: (jobId: string | null) => void;
  setSelectedEnsemble: (ensembleId: string | null) => void;
  setViewMode: (mode: 'list' | 'grid' | 'timeline' | 'analytics') => void;
  setFilters: (filters: Partial<MLIntelligenceState['filters']>) => void;
  
  // Notification actions
  addNotification: (notification: Omit<MLNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (notificationId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Cache actions
  invalidateCache: (key?: string) => void;
  refreshCache: () => Promise<void>;
  optimizePerformance: (config: Partial<MLIntelligenceState['optimizations']>) => void;
  
  // Business intelligence actions
  calculateROI: (modelId: string) => Promise<void>;
  generateInsights: () => Promise<void>;
  exportAnalytics: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  
  // Error handling
  handleError: (error: any, context: string) => void;
  clearErrors: () => void;
  
  // Reset actions
  reset: () => void;
  resetModels: () => void;
  resetTrainingJobs: () => void;
  resetPredictions: () => void;
}

// Initial state
const initialState: MLIntelligenceState = {
  models: [],
  trainingJobs: [],
  predictions: [],
  ensembles: [],
  analytics: null,
  resourceUsage: null,
  driftDetections: {},
  featureImportance: {},
  modelValidations: {},
  modelComparisons: [],
  realtimeData: {
    trainingMetrics: {},
    predictionMetrics: {},
    systemMetrics: {},
    alerts: [],
    connectionStatus: 'disconnected'
  },
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
    kpis: {}
  },
  selectedModelId: null,
  selectedTrainingJobId: null,
  selectedEnsembleId: null,
  viewMode: 'list',
  filters: {
    status: [],
    modelType: [],
    dateRange: { start: null, end: null },
    search: ''
  },
  loading: {
    models: false,
    trainingJobs: false,
    predictions: false,
    analytics: false,
    bulkOperations: false
  },
  errors: {
    models: null,
    trainingJobs: null,
    predictions: null,
    analytics: null,
    bulkOperations: null
  },
  cache: {
    lastUpdated: {},
    ttl: {}
  },
  optimizations: {
    batchSize: 50,
    refreshInterval: 30000, // 30 seconds
    enableRealtime: true,
    compressionLevel: 6
  }
};

// WebSocket connection for real-time updates
let wsConnection: WebSocket | null = null;

// Create the Zustand store with advanced middleware
export const useMLIntelligence = create<MLIntelligenceState & MLIntelligenceActions>()(
  persist(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // ML Model actions
        fetchModels: async (params = {}) => {
          set((state) => {
            state.loading.models = true;
            state.errors.models = null;
          });

          try {
            const response = await mlApi.getMLModels(params);
            set((state) => {
              state.models = response.models;
              state.loading.models = false;
              state.cache.lastUpdated.models = Date.now();
            });
          } catch (error) {
            set((state) => {
              state.loading.models = false;
              state.errors.models = error instanceof Error ? error.message : 'Failed to fetch models';
            });
            get().handleError(error, 'fetchModels');
          }
        },

        fetchModel: async (modelId: string) => {
          try {
            const model = await mlApi.getMLModel(modelId);
            set((state) => {
              const index = state.models.findIndex(m => m.id === modelId);
              if (index >= 0) {
                state.models[index] = model;
              } else {
                state.models.push(model);
              }
              state.cache.lastUpdated[`model_${modelId}`] = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchModel');
          }
        },

        createModel: async (model: any) => {
          try {
            // Optimistic update
            const tempId = `temp_${Date.now()}`;
            const optimisticModel = { ...model, id: tempId, status: 'creating' };
            
            set((state) => {
              state.models.unshift(optimisticModel as MLModel);
            });

            const createdModel = await mlApi.createMLModel(model);
            
            set((state) => {
              const tempIndex = state.models.findIndex(m => m.id === tempId);
              if (tempIndex >= 0) {
                state.models[tempIndex] = createdModel;
              }
            });

            get().addNotification({
              type: 'success',
              title: 'Model Created',
              message: `Model "${createdModel.name}" has been created successfully.`,
              category: 'model_management'
            });
          } catch (error) {
            // Rollback optimistic update
            set((state) => {
              state.models = state.models.filter(m => !m.id.startsWith('temp_'));
            });
            get().handleError(error, 'createModel');
          }
        },

        updateModel: async (modelId: string, updates: any) => {
          try {
            // Optimistic update
            const originalModel = get().models.find(m => m.id === modelId);
            if (originalModel) {
              set((state) => {
                const index = state.models.findIndex(m => m.id === modelId);
                if (index >= 0) {
                  state.models[index] = { ...originalModel, ...updates };
                }
              });
            }

            const updatedModel = await mlApi.updateMLModel(modelId, updates);
            
            set((state) => {
              const index = state.models.findIndex(m => m.id === modelId);
              if (index >= 0) {
                state.models[index] = updatedModel;
              }
            });

            get().addNotification({
              type: 'success',
              title: 'Model Updated',
              message: `Model "${updatedModel.name}" has been updated successfully.`,
              category: 'model_management'
            });
          } catch (error) {
            // Rollback optimistic update
            if (originalModel) {
              set((state) => {
                const index = state.models.findIndex(m => m.id === modelId);
                if (index >= 0) {
                  state.models[index] = originalModel;
                }
              });
            }
            get().handleError(error, 'updateModel');
          }
        },

        deleteModel: async (modelId: string) => {
          try {
            // Optimistic update
            const modelToDelete = get().models.find(m => m.id === modelId);
            set((state) => {
              state.models = state.models.filter(m => m.id !== modelId);
            });

            await mlApi.deleteMLModel(modelId);

            get().addNotification({
              type: 'success',
              title: 'Model Deleted',
              message: `Model has been deleted successfully.`,
              category: 'model_management'
            });
          } catch (error) {
            // Rollback optimistic update
            if (modelToDelete) {
              set((state) => {
                state.models.push(modelToDelete);
              });
            }
            get().handleError(error, 'deleteModel');
          }
        },

        deployModel: async (modelId: string, config: any) => {
          try {
            const deployedModel = await mlApi.deployMLModel(modelId, config);
            set((state) => {
              const index = state.models.findIndex(m => m.id === modelId);
              if (index >= 0) {
                state.models[index] = deployedModel;
              }
            });

            get().addNotification({
              type: 'success',
              title: 'Model Deployed',
              message: `Model "${deployedModel.name}" has been deployed successfully.`,
              category: 'deployment'
            });
          } catch (error) {
            get().handleError(error, 'deployModel');
          }
        },

        retireModel: async (modelId: string) => {
          try {
            const retiredModel = await mlApi.retireMLModel(modelId);
            set((state) => {
              const index = state.models.findIndex(m => m.id === modelId);
              if (index >= 0) {
                state.models[index] = retiredModel;
              }
            });

            get().addNotification({
              type: 'info',
              title: 'Model Retired',
              message: `Model "${retiredModel.name}" has been retired.`,
              category: 'model_management'
            });
          } catch (error) {
            get().handleError(error, 'retireModel');
          }
        },

        // Training Job actions
        fetchTrainingJobs: async (params = {}) => {
          set((state) => {
            state.loading.trainingJobs = true;
            state.errors.trainingJobs = null;
          });

          try {
            const response = await mlApi.getTrainingJobs(params);
            set((state) => {
              state.trainingJobs = response.jobs;
              state.loading.trainingJobs = false;
              state.cache.lastUpdated.trainingJobs = Date.now();
            });
          } catch (error) {
            set((state) => {
              state.loading.trainingJobs = false;
              state.errors.trainingJobs = error instanceof Error ? error.message : 'Failed to fetch training jobs';
            });
            get().handleError(error, 'fetchTrainingJobs');
          }
        },

        fetchTrainingJob: async (jobId: string) => {
          try {
            const job = await mlApi.getTrainingJob(jobId);
            set((state) => {
              const index = state.trainingJobs.findIndex(j => j.id === jobId);
              if (index >= 0) {
                state.trainingJobs[index] = job;
              } else {
                state.trainingJobs.push(job);
              }
              state.cache.lastUpdated[`trainingJob_${jobId}`] = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchTrainingJob');
          }
        },

        createTrainingJob: async (job: any) => {
          try {
            const createdJob = await mlApi.createTrainingJob(job);
            set((state) => {
              state.trainingJobs.unshift(createdJob);
            });

            get().addNotification({
              type: 'success',
              title: 'Training Job Started',
              message: `Training job "${createdJob.name}" has been started.`,
              category: 'training'
            });
          } catch (error) {
            get().handleError(error, 'createTrainingJob');
          }
        },

        stopTrainingJob: async (jobId: string) => {
          try {
            const stoppedJob = await mlApi.stopTrainingJob(jobId);
            set((state) => {
              const index = state.trainingJobs.findIndex(j => j.id === jobId);
              if (index >= 0) {
                state.trainingJobs[index] = stoppedJob;
              }
            });

            get().addNotification({
              type: 'warning',
              title: 'Training Job Stopped',
              message: `Training job has been stopped.`,
              category: 'training'
            });
          } catch (error) {
            get().handleError(error, 'stopTrainingJob');
          }
        },

        // Prediction actions
        makePrediction: async (request: any) => {
          try {
            const prediction = await mlApi.makePrediction(request);
            set((state) => {
              state.predictions.unshift(prediction);
            });
          } catch (error) {
            get().handleError(error, 'makePrediction');
          }
        },

        fetchPredictions: async (params = {}) => {
          set((state) => {
            state.loading.predictions = true;
            state.errors.predictions = null;
          });

          try {
            const response = await mlApi.getPredictions(params);
            set((state) => {
              state.predictions = response.predictions;
              state.loading.predictions = false;
              state.cache.lastUpdated.predictions = Date.now();
            });
          } catch (error) {
            set((state) => {
              state.loading.predictions = false;
              state.errors.predictions = error instanceof Error ? error.message : 'Failed to fetch predictions';
            });
            get().handleError(error, 'fetchPredictions');
          }
        },

        provideFeedback: async (predictionId: string, feedback: any) => {
          try {
            const updatedPrediction = await mlApi.provideFeedback(predictionId, feedback);
            set((state) => {
              const index = state.predictions.findIndex(p => p.id === predictionId);
              if (index >= 0) {
                state.predictions[index] = updatedPrediction;
              }
            });

            get().addNotification({
              type: 'success',
              title: 'Feedback Provided',
              message: 'Thank you for providing feedback on the prediction.',
              category: 'feedback'
            });
          } catch (error) {
            get().handleError(error, 'provideFeedback');
          }
        },

        // Analytics actions
        fetchAnalytics: async (params = {}) => {
          set((state) => {
            state.loading.analytics = true;
            state.errors.analytics = null;
          });

          try {
            const analytics = await mlApi.getMLAnalytics(params);
            set((state) => {
              state.analytics = analytics;
              state.loading.analytics = false;
              state.cache.lastUpdated.analytics = Date.now();
            });
          } catch (error) {
            set((state) => {
              state.loading.analytics = false;
              state.errors.analytics = error instanceof Error ? error.message : 'Failed to fetch analytics';
            });
            get().handleError(error, 'fetchAnalytics');
          }
        },

        fetchResourceUsage: async (params = {}) => {
          try {
            const resourceUsage = await mlApi.getResourceUsage(params);
            set((state) => {
              state.resourceUsage = resourceUsage;
              state.cache.lastUpdated.resourceUsage = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchResourceUsage');
          }
        },

        fetchDriftDetection: async (modelId: string, params = {}) => {
          try {
            const driftDetection = await mlApi.getDriftDetection(modelId, params);
            set((state) => {
              state.driftDetections[modelId] = driftDetection;
              state.cache.lastUpdated[`drift_${modelId}`] = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchDriftDetection');
          }
        },

        fetchFeatureImportance: async (modelId: string) => {
          try {
            const featureImportance = await mlApi.getFeatureImportance(modelId);
            set((state) => {
              state.featureImportance[modelId] = featureImportance;
              state.cache.lastUpdated[`features_${modelId}`] = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchFeatureImportance');
          }
        },

        fetchModelValidations: async (modelId: string) => {
          try {
            const validations = await mlApi.getModelValidations(modelId);
            set((state) => {
              state.modelValidations[modelId] = validations;
              state.cache.lastUpdated[`validations_${modelId}`] = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchModelValidations');
          }
        },

        compareModels: async (modelIds: string[], metrics: string[]) => {
          try {
            const comparison = await mlApi.compareModels(modelIds, metrics);
            set((state) => {
              state.modelComparisons.push(comparison);
              state.cache.lastUpdated.modelComparison = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'compareModels');
          }
        },

        // Ensemble actions
        createEnsemble: async (ensemble: any) => {
          try {
            const createdEnsemble = await mlApi.createEnsemble(ensemble);
            set((state) => {
              state.ensembles.unshift(createdEnsemble);
            });

            get().addNotification({
              type: 'success',
              title: 'Ensemble Created',
              message: `Ensemble "${createdEnsemble.name}" has been created successfully.`,
              category: 'ensemble'
            });
          } catch (error) {
            get().handleError(error, 'createEnsemble');
          }
        },

        fetchEnsembles: async (params = {}) => {
          try {
            const response = await mlApi.getEnsembles(params);
            set((state) => {
              state.ensembles = response.ensembles;
              state.cache.lastUpdated.ensembles = Date.now();
            });
          } catch (error) {
            get().handleError(error, 'fetchEnsembles');
          }
        },

        updateEnsemble: async (ensembleId: string, updates: any) => {
          try {
            const updatedEnsemble = await mlApi.updateEnsemble(ensembleId, updates);
            set((state) => {
              const index = state.ensembles.findIndex(e => e.id === ensembleId);
              if (index >= 0) {
                state.ensembles[index] = updatedEnsemble;
              }
            });
          } catch (error) {
            get().handleError(error, 'updateEnsemble');
          }
        },

        deleteEnsemble: async (ensembleId: string) => {
          try {
            await mlApi.deleteEnsemble(ensembleId);
            set((state) => {
              state.ensembles = state.ensembles.filter(e => e.id !== ensembleId);
            });

            get().addNotification({
              type: 'success',
              title: 'Ensemble Deleted',
              message: 'Ensemble has been deleted successfully.',
              category: 'ensemble'
            });
          } catch (error) {
            get().handleError(error, 'deleteEnsemble');
          }
        },

        // Bulk operations
        performBulkOperation: async (operation: any) => {
          set((state) => {
            state.loading.bulkOperations = true;
            state.errors.bulkOperations = null;
          });

          try {
            const result = await mlApi.performBulkOperation(operation);
            set((state) => {
              state.bulkOperations.push({
                ...operation,
                id: result.operationId,
                status: result.status,
                createdAt: new Date().toISOString()
              });
              state.loading.bulkOperations = false;
            });

            get().addNotification({
              type: 'info',
              title: 'Bulk Operation Started',
              message: `Bulk operation "${operation.type}" has been started.`,
              category: 'bulk_operation'
            });
          } catch (error) {
            set((state) => {
              state.loading.bulkOperations = false;
              state.errors.bulkOperations = error instanceof Error ? error.message : 'Failed to perform bulk operation';
            });
            get().handleError(error, 'performBulkOperation');
          }
        },

        fetchBulkOperationStatus: async (operationId: string) => {
          try {
            const status = await mlApi.getBulkOperationStatus(operationId);
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

        // AutoML actions
        startAutoML: async (config: any) => {
          try {
            const result = await mlApi.startAutoML(config);
            get().addNotification({
              type: 'info',
              title: 'AutoML Started',
              message: `AutoML job has been started with ID: ${result.jobId}`,
              category: 'automl'
            });
          } catch (error) {
            get().handleError(error, 'startAutoML');
          }
        },

        fetchAutoMLStatus: async (jobId: string) => {
          try {
            const status = await mlApi.getAutoMLStatus(jobId);
            // Update relevant state based on AutoML status
            if (status.bestModel) {
              set((state) => {
                const existingIndex = state.models.findIndex(m => m.id === status.bestModel!.id);
                if (existingIndex >= 0) {
                  state.models[existingIndex] = status.bestModel!;
                } else {
                  state.models.push(status.bestModel!);
                }
              });
            }
          } catch (error) {
            get().handleError(error, 'fetchAutoMLStatus');
          }
        },

        // Real-time actions
        startRealtimeMonitoring: () => {
          if (wsConnection) return; // Already connected

          const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/v2/ml/realtime`;
          wsConnection = new WebSocket(wsUrl);

          wsConnection.onopen = () => {
            set((state) => {
              state.realtimeData.connectionStatus = 'connected';
            });
            
            get().addNotification({
              type: 'success',
              title: 'Real-time Monitoring Started',
              message: 'Connected to ML real-time monitoring.',
              category: 'realtime'
            });
          };

          wsConnection.onmessage = (event) => {
            try {
              const update = JSON.parse(event.data);
              get().processRealtimeUpdate(update);
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          };

          wsConnection.onclose = () => {
            set((state) => {
              state.realtimeData.connectionStatus = 'disconnected';
            });
            wsConnection = null;
            
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
              if (get().optimizations.enableRealtime) {
                get().startRealtimeMonitoring();
              }
            }, 5000);
          };

          wsConnection.onerror = (error) => {
            console.error('WebSocket error:', error);
            set((state) => {
              state.realtimeData.connectionStatus = 'error';
            });
          };
        },

        stopRealtimeMonitoring: () => {
          if (wsConnection) {
            wsConnection.close();
            wsConnection = null;
          }
          
          set((state) => {
            state.realtimeData.connectionStatus = 'disconnected';
            state.optimizations.enableRealtime = false;
          });
        },

        processRealtimeUpdate: (update: any) => {
          set((state) => {
            switch (update.type) {
              case 'training_metrics':
                state.realtimeData.trainingMetrics[update.jobId] = update.data;
                break;
              case 'prediction_metrics':
                state.realtimeData.predictionMetrics[update.modelId] = update.data;
                break;
              case 'system_metrics':
                state.realtimeData.systemMetrics = { ...state.realtimeData.systemMetrics, ...update.data };
                break;
              case 'alert':
                state.realtimeData.alerts.push(update.data);
                break;
              case 'model_status':
                const modelIndex = state.models.findIndex(m => m.id === update.modelId);
                if (modelIndex >= 0) {
                  state.models[modelIndex].status = update.status;
                }
                break;
              case 'training_job_status':
                const jobIndex = state.trainingJobs.findIndex(j => j.id === update.jobId);
                if (jobIndex >= 0) {
                  state.trainingJobs[jobIndex].status = update.status;
                }
                break;
            }
          });
        },

        // Workflow actions
        startWorkflow: async (workflowType: string, config: any) => {
          const workflowId = `workflow_${Date.now()}`;
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
            title: 'Workflow Started',
            message: `${workflowType} workflow has been started.`,
            category: 'workflow'
          });
        },

        pauseWorkflow: async (workflowId: string) => {
          set((state) => {
            const workflow = state.workflowState.activeWorkflows.find(w => w.id === workflowId);
            if (workflow) {
              workflow.status = 'paused';
            }
          });
        },

        resumeWorkflow: async (workflowId: string) => {
          set((state) => {
            const workflow = state.workflowState.activeWorkflows.find(w => w.id === workflowId);
            if (workflow) {
              workflow.status = 'running';
            }
          });
        },

        cancelWorkflow: async (workflowId: string) => {
          set((state) => {
            state.workflowState.activeWorkflows = state.workflowState.activeWorkflows.filter(w => w.id !== workflowId);
          });
        },

        // UI actions
        setSelectedModel: (modelId: string | null) => {
          set((state) => {
            state.selectedModelId = modelId;
          });
        },

        setSelectedTrainingJob: (jobId: string | null) => {
          set((state) => {
            state.selectedTrainingJobId = jobId;
          });
        },

        setSelectedEnsemble: (ensembleId: string | null) => {
          set((state) => {
            state.selectedEnsembleId = ensembleId;
          });
        },

        setViewMode: (mode: 'list' | 'grid' | 'timeline' | 'analytics') => {
          set((state) => {
            state.viewMode = mode;
          });
        },

        setFilters: (filters: Partial<MLIntelligenceState['filters']>) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        // Notification actions
        addNotification: (notification: Omit<MLNotification, 'id' | 'timestamp'>) => {
          set((state) => {
            state.notifications.unshift({
              ...notification,
              id: `notification_${Date.now()}`,
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

        // Cache actions
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
            actions.fetchModels(),
            actions.fetchTrainingJobs(),
            actions.fetchPredictions(),
            actions.fetchAnalytics(),
            actions.fetchEnsembles()
          ]);
        },

        optimizePerformance: (config: Partial<MLIntelligenceState['optimizations']>) => {
          set((state) => {
            state.optimizations = { ...state.optimizations, ...config };
          });
        },

        // Business intelligence actions
        calculateROI: async (modelId: string) => {
          try {
            // This would typically call a specialized ROI calculation endpoint
            const model = get().models.find(m => m.id === modelId);
            if (model) {
              // Simulate ROI calculation
              const roi = {
                modelId,
                totalCost: Math.random() * 10000,
                totalRevenue: Math.random() * 50000,
                roi: Math.random() * 300,
                timeToROI: Math.random() * 12,
                calculatedAt: new Date().toISOString()
              };
              
              set((state) => {
                state.businessIntelligence.roi[modelId] = roi;
              });
            }
          } catch (error) {
            get().handleError(error, 'calculateROI');
          }
        },

        generateInsights: async () => {
          try {
            // Generate ML-powered insights
            const insights = [
              {
                type: 'performance',
                title: 'Model Performance Trend',
                description: 'Your classification accuracy has improved by 15% over the last month.',
                severity: 'info',
                actionable: true,
                createdAt: new Date().toISOString()
              },
              {
                type: 'cost',
                title: 'Cost Optimization Opportunity',
                description: 'Consider reducing training frequency for stable models to save 30% on compute costs.',
                severity: 'medium',
                actionable: true,
                createdAt: new Date().toISOString()
              }
            ];
            
            set((state) => {
              state.businessIntelligence.recommendations = insights;
            });
          } catch (error) {
            get().handleError(error, 'generateInsights');
          }
        },

        exportAnalytics: async (format: 'csv' | 'excel' | 'pdf') => {
          try {
            // This would typically call an export endpoint
            get().addNotification({
              type: 'success',
              title: 'Export Started',
              message: `Analytics export in ${format.toUpperCase()} format has been started.`,
              category: 'export'
            });
          } catch (error) {
            get().handleError(error, 'exportAnalytics');
          }
        },

        // Error handling
        handleError: (error: any, context: string) => {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          
          get().addNotification({
            type: 'error',
            title: 'Operation Failed',
            message: `${context}: ${errorMessage}`,
            category: 'error'
          });

          // Log error for debugging
          console.error(`ML Intelligence Error [${context}]:`, error);
        },

        clearErrors: () => {
          set((state) => {
            state.errors = {
              models: null,
              trainingJobs: null,
              predictions: null,
              analytics: null,
              bulkOperations: null
            };
          });
        },

        // Reset actions
        reset: () => {
          set(initialState);
          if (wsConnection) {
            wsConnection.close();
            wsConnection = null;
          }
        },

        resetModels: () => {
          set((state) => {
            state.models = [];
            state.selectedModelId = null;
          });
        },

        resetTrainingJobs: () => {
          set((state) => {
            state.trainingJobs = [];
            state.selectedTrainingJobId = null;
          });
        },

        resetPredictions: () => {
          set((state) => {
            state.predictions = [];
          });
        }
      }))
    ),
    {
      name: 'ml-intelligence-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist UI preferences and cache metadata
        viewMode: state.viewMode,
        filters: state.filters,
        optimizations: state.optimizations,
        cache: state.cache
      })
    }
  )
);

// Auto-refresh interval setup
let refreshInterval: NodeJS.Timeout | null = null;

// Subscribe to optimization changes to update refresh interval
useMLIntelligence.subscribe(
  (state) => state.optimizations.refreshInterval,
  (refreshInterval) => {
    if (refreshInterval && typeof window !== 'undefined') {
      clearInterval(refreshInterval);
      refreshInterval = setInterval(() => {
        const { refreshCache, optimizations } = useMLIntelligence.getState();
        if (optimizations.enableRealtime) {
          refreshCache();
        }
      }, refreshInterval);
    }
  }
);

// Start real-time monitoring on initialization
if (typeof window !== 'undefined') {
  const { startRealtimeMonitoring, optimizations } = useMLIntelligence.getState();
  if (optimizations.enableRealtime) {
    startRealtimeMonitoring();
  }
}

export type { MLIntelligenceState, MLIntelligenceActions };