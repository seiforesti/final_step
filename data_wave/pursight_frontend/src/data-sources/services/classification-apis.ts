/**
 * Advanced Classification API Service
 * Comprehensive API functions for Manual, ML, and AI classification tiers
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  ClassificationFramework,
  ClassificationPolicy,
  ClassificationRule,
  ClassificationDictionary,
  ClassificationResult,
  ClassificationCreateRequest,
  ClassificationRuleCreateRequest,
  ClassificationAssignmentCreateRequest,
  BulkClassificationRequest,
  ClassificationMetrics,
  ClassificationDashboard,
  MLModelConfiguration,
  MLTrainingJob,
  MLPrediction,
  AIModelConfiguration,
  AIConversation,
  AIPrediction,
  SensitivityLevel,
  ClassificationScope,
  ClassificationStatus,
  MLModelType,
  MLTaskType,
  MLModelStatus,
  MLModelFramework,
  AIModelType,
  AITaskType,
  AIProviderType,
  AIModelStatus,
  ExplainabilityLevel
} from '../types/classification';

// Configure axios instance for classification APIs
const classificationApi = axios.create({
  baseURL: '/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 60000, // Extended timeout for ML/AI operations
});

// Add request interceptor for authentication
classificationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
classificationApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config: any = error?.config || {};
    const status = error?.response?.status;
    const method = (config.method || 'get').toLowerCase();

    // Retry logic for classification operations
    config.__retryCount = config.__retryCount || 0;
    
    if (status === 503 && method === 'get' && config.__retryCount < 3) {
      config.__retryCount += 1;
      const delay = 1000 * config.__retryCount;
      await new Promise(resolve => setTimeout(resolve, delay));
      return classificationApi.request(config);
    }

    if (status === 503 && method === 'post' && config.__retryCount < 2) {
      config.__retryCount += 1;
      await new Promise(resolve => setTimeout(resolve, 2000));
      return classificationApi.request(config);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// MANUAL CLASSIFICATION API FUNCTIONS
// ============================================================================

// Framework Management
export const getClassificationFrameworks = async (): Promise<ClassificationFramework[]> => {
  const { data } = await classificationApi.get('/classification/frameworks');
  return data;
};

export const getClassificationFramework = async (id: number): Promise<ClassificationFramework> => {
  const { data } = await classificationApi.get(`/classification/frameworks/${id}`);
  return data;
};

export const createClassificationFramework = async (framework: Partial<ClassificationFramework>): Promise<ClassificationFramework> => {
  const { data } = await classificationApi.post('/classification/frameworks', framework);
  return data;
};

export const updateClassificationFramework = async (id: number, framework: Partial<ClassificationFramework>): Promise<ClassificationFramework> => {
  const { data } = await classificationApi.put(`/classification/frameworks/${id}`, framework);
  return data;
};

export const deleteClassificationFramework = async (id: number): Promise<void> => {
  await classificationApi.delete(`/classification/frameworks/${id}`);
};

// Policy Management
export const getClassificationPolicies = async (frameworkId?: number): Promise<ClassificationPolicy[]> => {
  const url = frameworkId 
    ? `/classification/policies?framework_id=${frameworkId}`
    : '/classification/policies';
  const { data } = await classificationApi.get(url);
  return data;
};

export const createClassificationPolicy = async (policy: Partial<ClassificationPolicy>): Promise<ClassificationPolicy> => {
  const { data } = await classificationApi.post('/classification/policies', policy);
  return data;
};

export const updateClassificationPolicy = async (id: number, policy: Partial<ClassificationPolicy>): Promise<ClassificationPolicy> => {
  const { data } = await classificationApi.put(`/classification/policies/${id}`, policy);
  return data;
};

export const deleteClassificationPolicy = async (id: number): Promise<void> => {
  await classificationApi.delete(`/classification/policies/${id}`);
};

// Rule Management
export const getClassificationRules = async (frameworkId?: number, scope?: ClassificationScope): Promise<ClassificationRule[]> => {
  const params = new URLSearchParams();
  if (frameworkId) params.append('framework_id', frameworkId.toString());
  if (scope) params.append('scope', scope);
  
  const { data } = await classificationApi.get(`/classification/rules?${params.toString()}`);
  return data;
};

export const getClassificationRule = async (id: number): Promise<ClassificationRule> => {
  const { data } = await classificationApi.get(`/classification/rules/${id}`);
  return data;
};

export const createClassificationRule = async (rule: Partial<ClassificationRule>): Promise<ClassificationRule> => {
  const { data } = await classificationApi.post('/classification/rules', rule);
  return data;
};

export const updateClassificationRule = async (id: number, rule: Partial<ClassificationRule>): Promise<ClassificationRule> => {
  const { data } = await classificationApi.put(`/classification/rules/${id}`, rule);
  return data;
};

export const deleteClassificationRule = async (id: number): Promise<void> => {
  await classificationApi.delete(`/classification/rules/${id}`);
};

export const testClassificationRule = async (ruleId: number, testData: any): Promise<any> => {
  const { data } = await classificationApi.post(`/classification/rules/${ruleId}/test`, testData);
  return data;
};

// Dictionary Management
export const getClassificationDictionaries = async (): Promise<ClassificationDictionary[]> => {
  const { data } = await classificationApi.get('/classification/dictionaries');
  return data;
};

export const createClassificationDictionary = async (dictionary: Partial<ClassificationDictionary>): Promise<ClassificationDictionary> => {
  const { data } = await classificationApi.post('/classification/dictionaries', dictionary);
  return data;
};

export const updateClassificationDictionary = async (id: number, dictionary: Partial<ClassificationDictionary>): Promise<ClassificationDictionary> => {
  const { data } = await classificationApi.put(`/classification/dictionaries/${id}`, dictionary);
  return data;
};

export const deleteClassificationDictionary = async (id: number): Promise<void> => {
  await classificationApi.delete(`/classification/dictionaries/${id}`);
};

// Classification Results
export const getClassificationResults = async (params: {
  entity_type?: string;
  entity_id?: string;
  data_source_id?: number;
  sensitivity_level?: SensitivityLevel;
  status?: ClassificationStatus;
  limit?: number;
  offset?: number;
}): Promise<{ results: ClassificationResult[]; total: number }> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await classificationApi.get(`/classification/results?${searchParams.toString()}`);
  return data;
};

export const getClassificationResult = async (id: number): Promise<ClassificationResult> => {
  const { data } = await classificationApi.get(`/classification/results/${id}`);
  return data;
};

export const createClassificationAssignment = async (assignment: ClassificationAssignmentCreateRequest): Promise<ClassificationResult> => {
  const { data } = await classificationApi.post('/classification/assignments', assignment);
  return data;
};

export const updateClassificationResult = async (id: number, result: Partial<ClassificationResult>): Promise<ClassificationResult> => {
  const { data } = await classificationApi.put(`/classification/results/${id}`, result);
  return data;
};

export const validateClassificationResult = async (id: number, validation: { is_valid: boolean; notes?: string }): Promise<ClassificationResult> => {
  const { data } = await classificationApi.post(`/classification/results/${id}/validate`, validation);
  return data;
};

// Bulk Operations
export const bulkApplyClassification = async (request: BulkClassificationRequest): Promise<any> => {
  const { data } = await classificationApi.post('/classification/bulk/apply', request);
  return data;
};

export const bulkUploadClassificationRules = async (rules: any[]): Promise<any> => {
  const { data } = await classificationApi.post('/classification/bulk/upload-rules', { rules });
  return data;
};

export const bulkUploadClassificationDictionaries = async (dictionaries: any[]): Promise<any> => {
  const { data } = await classificationApi.post('/classification/bulk/upload-dictionaries', { dictionaries });
  return data;
};

// Metrics and Analytics
export const getClassificationMetrics = async (params: {
  framework_id?: number;
  data_source_id?: number;
  time_range?: string;
}): Promise<ClassificationMetrics> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await classificationApi.get(`/classification/metrics?${searchParams.toString()}`);
  return data;
};

export const getClassificationDashboard = async (): Promise<ClassificationDashboard> => {
  const { data } = await classificationApi.get('/classification/dashboard');
  return data;
};

// ============================================================================
// ML CLASSIFICATION API FUNCTIONS
// ============================================================================

// ML Model Management
export const getMLModels = async (params: {
  model_type?: MLModelType;
  status?: MLModelStatus;
  framework?: MLModelFramework;
  limit?: number;
  offset?: number;
}): Promise<{ models: MLModelConfiguration[]; total: number }> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await classificationApi.get(`/ml/models?${searchParams.toString()}`);
  return data;
};

export const getMLModel = async (id: number): Promise<MLModelConfiguration> => {
  const { data } = await classificationApi.get(`/ml/models/${id}`);
  return data;
};

export const createMLModel = async (model: Partial<MLModelConfiguration>): Promise<MLModelConfiguration> => {
  const { data } = await classificationApi.post('/ml/models', model);
  return data;
};

export const updateMLModel = async (id: number, model: Partial<MLModelConfiguration>): Promise<MLModelConfiguration> => {
  const { data } = await classificationApi.put(`/ml/models/${id}`, model);
  return data;
};

export const deleteMLModel = async (id: number): Promise<void> => {
  await classificationApi.delete(`/ml/models/${id}`);
};

// ML Training Jobs
export const getMLTrainingJobs = async (params: {
  model_config_id?: number;
  status?: MLModelStatus;
  limit?: number;
  offset?: number;
}): Promise<{ jobs: MLTrainingJob[]; total: number }> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await classificationApi.get(`/ml/training-jobs?${searchParams.toString()}`);
  return data;
};

export const getMLTrainingJob = async (id: number): Promise<MLTrainingJob> => {
  const { data } = await classificationApi.get(`/ml/training-jobs/${id}`);
  return data;
};

export const createMLTrainingJob = async (job: Partial<MLTrainingJob>): Promise<MLTrainingJob> => {
  const { data } = await classificationApi.post('/ml/training-jobs', job);
  return data;
};

export const startMLTrainingJob = async (id: number): Promise<MLTrainingJob> => {
  const { data } = await classificationApi.post(`/ml/training-jobs/${id}/start`);
  return data;
};

export const stopMLTrainingJob = async (id: number): Promise<MLTrainingJob> => {
  const { data } = await classificationApi.post(`/ml/training-jobs/${id}/stop`);
  return data;
};

export const getMLTrainingJobLogs = async (id: number): Promise<string[]> => {
  const { data } = await classificationApi.get(`/ml/training-jobs/${id}/logs`);
  return data;
};

// ML Predictions
export const getMLPredictions = async (params: {
  model_config_id?: number;
  target_type?: string;
  target_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ predictions: MLPrediction[]; total: number }> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await classificationApi.get(`/ml/predictions?${searchParams.toString()}`);
  return data;
};

export const createMLPrediction = async (prediction: {
  model_config_id: number;
  target_type: string;
  target_id: string;
  target_identifier: string;
  input_data: any;
}): Promise<MLPrediction> => {
  const { data } = await classificationApi.post('/ml/predictions', prediction);
  return data;
};

export const getMLPrediction = async (id: number): Promise<MLPrediction> => {
  const { data } = await classificationApi.get(`/ml/predictions/${id}`);
  return data;
};

// ML Model Performance
export const getMLModelPerformance = async (modelId: number): Promise<any> => {
  const { data } = await classificationApi.get(`/ml/models/${modelId}/performance`);
  return data;
};

export const getMLModelMetrics = async (modelId: number, timeRange?: string): Promise<any> => {
  const url = timeRange 
    ? `/ml/models/${modelId}/metrics?time_range=${timeRange}`
    : `/ml/models/${modelId}/metrics`;
  const { data } = await classificationApi.get(url);
  return data;
};

// ============================================================================
// AI CLASSIFICATION API FUNCTIONS
// ============================================================================

// AI Model Management
export const getAIModels = async (params: {
  model_type?: AIModelType;
  status?: AIModelStatus;
  provider?: AIProviderType;
  limit?: number;
  offset?: number;
}): Promise<{ models: AIModelConfiguration[]; total: number }> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await classificationApi.get(`/ai/models?${searchParams.toString()}`);
  return data;
};

export const getAIModel = async (id: number): Promise<AIModelConfiguration> => {
  const { data } = await classificationApi.get(`/ai/models/${id}`);
  return data;
};

export const createAIModel = async (model: Partial<AIModelConfiguration>): Promise<AIModelConfiguration> => {
  const { data } = await classificationApi.post('/ai/models', model);
  return data;
};

export const updateAIModel = async (id: number, model: Partial<AIModelConfiguration>): Promise<AIModelConfiguration> => {
  const { data } = await classificationApi.put(`/ai/models/${id}`, model);
  return data;
};

export const deleteAIModel = async (id: number): Promise<void> => {
  await classificationApi.delete(`/ai/models/${id}`);
};

// AI Conversations
export const getAIConversations = async (params: {
  ai_model_id?: number;
  conversation_type?: string;
  context_type?: string;
  limit?: number;
  offset?: number;
}): Promise<{ conversations: AIConversation[]; total: number }> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await classificationApi.get(`/ai/conversations?${searchParams.toString()}`);
  return data;
};

export const createAIConversation = async (conversation: Partial<AIConversation>): Promise<AIConversation> => {
  const { data } = await classificationApi.post('/ai/conversations', conversation);
  return data;
};

export const getAIConversation = async (id: number): Promise<AIConversation> => {
  const { data } = await classificationApi.get(`/ai/conversations/${id}`);
  return data;
};

export const sendAIMessage = async (conversationId: number, message: {
  content: string;
  message_type: string;
  context?: any;
}): Promise<any> => {
  const { data } = await classificationApi.post(`/ai/conversations/${conversationId}/messages`, message);
  return data;
};

// AI Predictions
export const getAIPredictions = async (params: {
  ai_model_id?: number;
  target_type?: string;
  target_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ predictions: AIPrediction[]; total: number }> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  const { data } = await classificationApi.get(`/ai/predictions?${searchParams.toString()}`);
  return data;
};

export const createAIPrediction = async (prediction: {
  ai_model_id: number;
  target_type: string;
  target_id: string;
  target_identifier: string;
  input_data: any;
  context?: any;
}): Promise<AIPrediction> => {
  const { data } = await classificationApi.post('/ai/predictions', prediction);
  return data;
};

export const getAIPrediction = async (id: number): Promise<AIPrediction> => {
  const { data } = await classificationApi.get(`/ai/predictions/${id}`);
  return data;
};

// AI Model Performance
export const getAIModelPerformance = async (modelId: number): Promise<any> => {
  const { data } = await classificationApi.get(`/ai/models/${modelId}/performance`);
  return data;
};

export const getAIModelMetrics = async (modelId: number, timeRange?: string): Promise<any> => {
  const url = timeRange 
    ? `/ai/models/${modelId}/metrics?time_range=${timeRange}`
    : `/ai/models/${modelId}/metrics`;
  const { data } = await classificationApi.get(url);
  return data;
};

// ============================================================================
// REACT QUERY HOOKS - MANUAL CLASSIFICATION
// ============================================================================

export const useClassificationFrameworksQuery = (options = {}) => {
  return useQuery({
    queryKey: ['classification-frameworks'],
    queryFn: getClassificationFrameworks,
    ...options,
  });
};

export const useClassificationFrameworkQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['classification-framework', id],
    queryFn: () => getClassificationFramework(id),
    enabled: !!id,
    ...options,
  });
};

export const useClassificationPoliciesQuery = (frameworkId?: number, options = {}) => {
  return useQuery({
    queryKey: ['classification-policies', frameworkId],
    queryFn: () => getClassificationPolicies(frameworkId),
    ...options,
  });
};

export const useClassificationRulesQuery = (frameworkId?: number, scope?: ClassificationScope, options = {}) => {
  return useQuery({
    queryKey: ['classification-rules', frameworkId, scope],
    queryFn: () => getClassificationRules(frameworkId, scope),
    ...options,
  });
};

export const useClassificationRuleQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['classification-rule', id],
    queryFn: () => getClassificationRule(id),
    enabled: !!id,
    ...options,
  });
};

export const useClassificationDictionariesQuery = (options = {}) => {
  return useQuery({
    queryKey: ['classification-dictionaries'],
    queryFn: getClassificationDictionaries,
    ...options,
  });
};

export const useClassificationResultsQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['classification-results', params],
    queryFn: () => getClassificationResults(params),
    ...options,
  });
};

export const useClassificationResultQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['classification-result', id],
    queryFn: () => getClassificationResult(id),
    enabled: !!id,
    ...options,
  });
};

export const useClassificationMetricsQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['classification-metrics', params],
    queryFn: () => getClassificationMetrics(params),
    ...options,
  });
};

export const useClassificationDashboardQuery = (options = {}) => {
  return useQuery({
    queryKey: ['classification-dashboard'],
    queryFn: getClassificationDashboard,
    ...options,
  });
};

// ============================================================================
// REACT QUERY HOOKS - ML CLASSIFICATION
// ============================================================================

export const useMLModelsQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['ml-models', params],
    queryFn: () => getMLModels(params),
    ...options,
  });
};

export const useMLModelQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['ml-model', id],
    queryFn: () => getMLModel(id),
    enabled: !!id,
    ...options,
  });
};

export const useMLTrainingJobsQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['ml-training-jobs', params],
    queryFn: () => getMLTrainingJobs(params),
    ...options,
  });
};

export const useMLTrainingJobQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['ml-training-job', id],
    queryFn: () => getMLTrainingJob(id),
    enabled: !!id,
    ...options,
  });
};

export const useMLPredictionsQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['ml-predictions', params],
    queryFn: () => getMLPredictions(params),
    ...options,
  });
};

export const useMLModelPerformanceQuery = (modelId: number, options = {}) => {
  return useQuery({
    queryKey: ['ml-model-performance', modelId],
    queryFn: () => getMLModelPerformance(modelId),
    enabled: !!modelId,
    ...options,
  });
};

// ============================================================================
// REACT QUERY HOOKS - AI CLASSIFICATION
// ============================================================================

export const useAIModelsQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['ai-models', params],
    queryFn: () => getAIModels(params),
    ...options,
  });
};

export const useAIModelQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['ai-model', id],
    queryFn: () => getAIModel(id),
    enabled: !!id,
    ...options,
  });
};

export const useAIConversationsQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['ai-conversations', params],
    queryFn: () => getAIConversations(params),
    ...options,
  });
};

export const useAIConversationQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['ai-conversation', id],
    queryFn: () => getAIConversation(id),
    enabled: !!id,
    ...options,
  });
};

export const useAIPredictionsQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['ai-predictions', params],
    queryFn: () => getAIPredictions(params),
    ...options,
  });
};

export const useAIModelPerformanceQuery = (modelId: number, options = {}) => {
  return useQuery({
    queryKey: ['ai-model-performance', modelId],
    queryFn: () => getAIModelPerformance(modelId),
    enabled: !!modelId,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS - MANUAL CLASSIFICATION
// ============================================================================

export const useCreateClassificationFrameworkMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClassificationFramework,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-frameworks'] });
    },
  });
};

export const useUpdateClassificationFrameworkMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, framework }: { id: number; framework: Partial<ClassificationFramework> }) => 
      updateClassificationFramework(id, framework),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classification-frameworks'] });
      queryClient.invalidateQueries({ queryKey: ['classification-framework', variables.id] });
    },
  });
};

export const useDeleteClassificationFrameworkMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClassificationFramework,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-frameworks'] });
    },
  });
};

export const useCreateClassificationRuleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClassificationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
    },
  });
};

export const useUpdateClassificationRuleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, rule }: { id: number; rule: Partial<ClassificationRule> }) => 
      updateClassificationRule(id, rule),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
      queryClient.invalidateQueries({ queryKey: ['classification-rule', variables.id] });
    },
  });
};

export const useDeleteClassificationRuleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClassificationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
    },
  });
};

export const useCreateClassificationAssignmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClassificationAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-results'] });
    },
  });
};

export const useBulkApplyClassificationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkApplyClassification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-results'] });
      queryClient.invalidateQueries({ queryKey: ['classification-metrics'] });
    },
  });
};

// ============================================================================
// MUTATION HOOKS - ML CLASSIFICATION
// ============================================================================

export const useCreateMLModelMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMLModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
    },
  });
};

export const useCreateMLTrainingJobMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMLTrainingJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-training-jobs'] });
    },
  });
};

export const useStartMLTrainingJobMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: startMLTrainingJob,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ml-training-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['ml-training-job', variables] });
    },
  });
};

export const useCreateMLPredictionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMLPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-predictions'] });
    },
  });
};

// ============================================================================
// MUTATION HOOKS - AI CLASSIFICATION
// ============================================================================

export const useCreateAIModelMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAIModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
  });
};

export const useCreateAIConversationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAIConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
};

export const useSendAIMessageMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: number; message: any }) => 
      sendAIMessage(conversationId, message),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', variables.conversationId] });
    },
  });
};

export const useCreateAIPredictionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAIPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-predictions'] });
    },
  });
};
