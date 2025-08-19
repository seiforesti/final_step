import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Badge,
  Button,
  Input,
  Label,
  Progress,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ScrollArea,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Slider,
  Checkbox,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Copy,
  Save,
  RefreshCw,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  Plus,
  Minus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Brain,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Network,
  Database,
  Server,
  Cloud,
  Globe,
  Lock,
  Unlock,
  Shield,
  Key,
  Users,
  Calendar,
  Clock,
  MapPin,
  Flag,
  Star,
  Heart,
  Bookmark,
  MessageCircle,
  Mail,
  Phone,
  Link,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Image,
  FileText,
  File,
  Video,
  Music,
  Camera,
  Headphones,
  Speaker,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Wifi,
  Bluetooth,
  Lightbulb,
  Target,
  Award,
  Trophy,
  Gift,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Sun,
  Moon,
  Stars,
  Thermometer,
  Cpu,
  MemoryStick,
  HardDrive,
  Layers,
  Grid,
  List,
  Table,
  GitBranch,
  TreePine,
  Workflow,
  FlowChart,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Hash,
  AtSign,
  Percent,
} from 'lucide-react';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { aiApi } from '../core/api/aiApi';
import { websocketApi } from '../core/api/websocketApi';
import type {
  ConversationThread,
  ConversationMessage,
  ConversationContext,
  AIPersonality,
  NaturalLanguageQuery,
  ConversationIntent,
  ConversationEntity,
  ConversationSentiment,
  ConversationFlow,
  ResponseGeneration,
  ContextualMemory,
  ConversationAnalytics,
  LanguageModel,
  ConversationTemplate,
  DialogueState,
  IntentClassification,
  EntityExtraction,
  SentimentAnalysis,
  ConversationHistory,
  UserPreferences,
  ConversationSettings,
  VoiceConfiguration,
  LanguageConfiguration,
  ConversationMetrics,
  ResponseQuality,
  ConversationInsight,
  TopicModeling,
  ConversationSummary,
  KnowledgeBase,
  ConversationAgent,
  MultiModalInput,
  ConversationWorkflow,
} from '../core/types';

// Enhanced conversation types for enterprise-grade functionality
interface ConversationState {
  activeThreads: ConversationThread[];
  selectedThread: ConversationThread | null;
  conversationHistory: ConversationHistory[];
  contextualMemory: ContextualMemory[];
  userPreferences: UserPreferences;
  conversationSettings: ConversationSettings;
  analytics: ConversationAnalytics;
  knowledgeBase: KnowledgeBase[];
  agents: ConversationAgent[];
  templates: ConversationTemplate[];
  workflows: ConversationWorkflow[];
  realTimeStreams: ConversationStream[];
  qualityMetrics: ConversationQualityMetrics;
  performanceInsights: ConversationPerformanceInsights;
  collaborationData: ConversationCollaboration;
  securityContext: ConversationSecurity;
}

interface ConversationMessage {
  id: string;
  threadId: string;
  type: 'user' | 'assistant' | 'system' | 'notification' | 'workflow' | 'insight';
  content: string;
  timestamp: Date;
  metadata: MessageMetadata;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  context?: ConversationContext;
  intent?: ConversationIntent;
  entities?: ConversationEntity[];
  sentiment?: ConversationSentiment;
  confidence?: number;
  processing?: boolean;
  error?: string;
  workflow?: MessageWorkflow;
  analytics?: MessageAnalytics;
  security?: MessageSecurity;
  multiModal?: MultiModalContent;
  reasoning?: ReasoningChain;
  citations?: CitationReference[];
  followUps?: FollowUpSuggestion[];
}

interface MessageMetadata {
  model: string;
  tokens: number;
  processingTime: number;
  confidence: number;
  temperature: number;
  topP: number;
  maxTokens: number;
  stopSequences: string[];
  systemPrompt?: string;
  userPrompt?: string;
  responseQuality: ResponseQuality;
  contextRelevance: number;
  factualAccuracy: number;
  coherence: number;
  creativity: number;
  helpfulness: number;
  safety: number;
  bias: number;
  toxicity: number;
  groundedness: number;
  citations: number;
  reasoning: ReasoningMetadata;
  performance: PerformanceMetadata;
  cost: CostMetadata;
}

interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'link' | 'file' | 'code' | 'data' | 'workflow' | 'model';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  description?: string;
  metadata?: Record<string, any>;
  analysis?: AttachmentAnalysis;
  processing?: AttachmentProcessing;
  security?: AttachmentSecurity;
}

interface MessageReaction {
  id: string;
  userId: string;
  type: 'like' | 'dislike' | 'helpful' | 'unhelpful' | 'accurate' | 'inaccurate' | 'creative' | 'clear' | 'relevant' | 'safe';
  timestamp: Date;
  comment?: string;
  context?: ReactionContext;
}

interface ConversationPersonality {
  id: string;
  name: string;
  description: string;
  traits: PersonalityTrait[];
  communicationStyle: CommunicationStyle;
  knowledgeDomains: string[];
  responsePatterns: ResponsePattern[];
  emotionalIntelligence: EmotionalIntelligence;
  adaptability: number;
  creativity: number;
  formality: number;
  empathy: number;
  humor: number;
  assertiveness: number;
  expertise: ExpertiseProfile;
  ethics: EthicalFramework;
  culturalAwareness: CulturalProfile;
  learningStyle: LearningPreferences;
}

interface PersonalityTrait {
  name: string;
  value: number;
  description: string;
  impact: string[];
  examples: string[];
  constraints: string[];
}

interface CommunicationStyle {
  tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'academic' | 'conversational' | 'technical' | 'creative';
  verbosity: 'concise' | 'moderate' | 'detailed' | 'comprehensive' | 'adaptive';
  complexity: 'simple' | 'moderate' | 'advanced' | 'expert' | 'adaptive';
  examples: boolean;
  analogies: boolean;
  questions: boolean;
  suggestions: boolean;
  citations: boolean;
  reasoning: boolean;
  followUps: boolean;
  multiModal: boolean;
}

interface ResponsePattern {
  trigger: string;
  template: string;
  variables: string[];
  conditions: string[];
  priority: number;
  context: string[];
  examples: string[];
  constraints: string[];
}

interface EmotionalIntelligence {
  emotionRecognition: number;
  empathyLevel: number;
  emotionalResponse: number;
  socialAwareness: number;
  adaptiveResponse: number;
  conflictResolution: number;
  motivationalSupport: number;
  stressManagement: number;
}

interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  triggers: FlowTrigger[];
  conditions: FlowCondition[];
  actions: FlowAction[];
  branches: FlowBranch[];
  loops: FlowLoop[];
  exits: FlowExit[];
  analytics: FlowAnalytics;
  optimization: FlowOptimization;
  personalization: FlowPersonalization;
}

interface FlowStep {
  id: string;
  name: string;
  type: 'input' | 'processing' | 'decision' | 'action' | 'output' | 'validation' | 'routing' | 'escalation';
  prompt?: string;
  validation?: ValidationRule[];
  timeout?: number;
  retries?: number;
  fallback?: string;
  analytics?: StepAnalytics;
  optimization?: StepOptimization;
  personalization?: StepPersonalization;
}

interface ConversationAnalytics {
  totalConversations: number;
  activeConversations: number;
  averageLength: number;
  averageDuration: number;
  satisfactionScore: number;
  resolutionRate: number;
  escalationRate: number;
  topicDistribution: TopicDistribution[];
  sentimentTrends: SentimentTrend[];
  performanceMetrics: ConversationPerformanceMetrics;
  qualityMetrics: ConversationQualityMetrics;
  usagePatterns: UsagePattern[];
  userInsights: UserInsight[];
  businessImpact: BusinessImpactMetrics;
  costAnalysis: CostAnalysisData;
  complianceMetrics: ComplianceMetrics;
  securityMetrics: SecurityMetrics;
}

interface ConversationQualityMetrics {
  accuracy: number;
  relevance: number;
  coherence: number;
  completeness: number;
  helpfulness: number;
  safety: number;
  bias: number;
  toxicity: number;
  groundedness: number;
  factualAccuracy: number;
  reasoning: number;
  creativity: number;
  empathy: number;
  clarity: number;
  conciseness: number;
  engagement: number;
  personalization: number;
  culturalSensitivity: number;
  ethicalAlignment: number;
  trustworthiness: number;
}

interface ConversationPerformanceMetrics {
  responseTime: number;
  throughput: number;
  latency: number;
  availability: number;
  reliability: number;
  scalability: number;
  efficiency: number;
  resourceUtilization: number;
  errorRate: number;
  successRate: number;
  userSatisfaction: number;
  taskCompletion: number;
  goalAchievement: number;
  retentionRate: number;
  engagementRate: number;
  conversionRate: number;
  costEfficiency: number;
  roi: number;
  businessValue: number;
  competitiveAdvantage: number;
}

interface ConversationStream {
  id: string;
  type: 'real_time' | 'batch' | 'streaming' | 'scheduled';
  status: 'active' | 'paused' | 'stopped' | 'error';
  dataSource: string;
  processingRate: number;
  latency: number;
  errorRate: number;
  throughput: number;
  quality: number;
  cost: number;
  configuration: StreamConfiguration;
  analytics: StreamAnalytics;
  optimization: StreamOptimization;
}

interface ConversationCollaboration {
  sharedThreads: SharedThread[];
  teamMembers: TeamMember[];
  permissions: PermissionMatrix;
  workflows: CollaborativeWorkflow[];
  notifications: CollaborationNotification[];
  analytics: CollaborationAnalytics;
  insights: CollaborationInsight[];
}

interface ConversationSecurity {
  encryption: EncryptionConfig;
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  auditTrail: SecurityAuditTrail[];
  compliance: ComplianceConfig;
  privacy: PrivacyConfig;
  dataGovernance: DataGovernanceConfig;
  threatDetection: ThreatDetectionConfig;
  incidentResponse: IncidentResponseConfig;
}

// Constants and configuration for enterprise-grade conversation management
const CONVERSATION_PERSONALITIES = [
  {
    id: 'enterprise_analyst',
    name: 'Enterprise Data Analyst',
    description: 'Expert in enterprise data analysis and business intelligence',
    avatar: '📊',
    traits: ['analytical', 'precise', 'insightful', 'strategic'],
    domains: ['business_intelligence', 'data_analysis', 'enterprise_strategy', 'performance_metrics'],
    capabilities: ['data_visualization', 'trend_analysis', 'predictive_modeling', 'roi_calculation'],
    expertise: 'advanced',
    specializations: ['classification_systems', 'ml_operations', 'ai_governance', 'compliance'],
  },
  {
    id: 'ai_researcher',
    name: 'AI Research Specialist',
    description: 'Cutting-edge AI research and development expert',
    avatar: '🧠',
    traits: ['innovative', 'thorough', 'technical', 'forward_thinking'],
    domains: ['artificial_intelligence', 'machine_learning', 'deep_learning', 'nlp'],
    capabilities: ['model_development', 'algorithm_design', 'research_analysis', 'technical_documentation'],
    expertise: 'expert',
    specializations: ['transformer_models', 'reinforcement_learning', 'computer_vision', 'ethics'],
  },
  {
    id: 'compliance_officer',
    name: 'Compliance & Governance Officer',
    description: 'Expert in regulatory compliance and data governance',
    avatar: '⚖️',
    traits: ['meticulous', 'ethical', 'regulatory_focused', 'risk_aware'],
    domains: ['compliance', 'governance', 'risk_management', 'legal_frameworks'],
    capabilities: ['regulatory_analysis', 'policy_development', 'audit_management', 'risk_assessment'],
    expertise: 'expert',
    specializations: ['gdpr', 'sox', 'hipaa', 'data_privacy', 'ai_ethics'],
  },
  {
    id: 'technical_architect',
    name: 'Technical Architecture Specialist',
    description: 'Enterprise system architecture and integration expert',
    avatar: '🏗️',
    traits: ['systematic', 'scalable', 'integration_focused', 'performance_oriented'],
    domains: ['system_architecture', 'integration', 'performance', 'scalability'],
    capabilities: ['architecture_design', 'system_integration', 'performance_optimization', 'scalability_planning'],
    expertise: 'expert',
    specializations: ['microservices', 'cloud_architecture', 'api_design', 'data_pipelines'],
  },
  {
    id: 'business_strategist',
    name: 'Business Strategy Consultant',
    description: 'Strategic business planning and transformation expert',
    avatar: '💼',
    traits: ['strategic', 'business_focused', 'value_driven', 'transformation_oriented'],
    domains: ['business_strategy', 'digital_transformation', 'change_management', 'value_creation'],
    capabilities: ['strategic_planning', 'business_analysis', 'transformation_roadmaps', 'value_assessment'],
    expertise: 'advanced',
    specializations: ['ai_adoption', 'digital_transformation', 'process_optimization', 'competitive_analysis'],
  },
  {
    id: 'customer_success',
    name: 'Customer Success Manager',
    description: 'Customer-focused success and adoption specialist',
    avatar: '🤝',
    traits: ['empathetic', 'supportive', 'solution_oriented', 'relationship_focused'],
    domains: ['customer_success', 'user_adoption', 'training', 'support'],
    capabilities: ['user_training', 'adoption_strategies', 'success_metrics', 'relationship_management'],
    expertise: 'advanced',
    specializations: ['user_onboarding', 'feature_adoption', 'success_metrics', 'feedback_analysis'],
  },
];

const LANGUAGE_MODELS = [
  { 
    id: 'gpt-4-turbo', 
    name: 'GPT-4 Turbo', 
    provider: 'OpenAI', 
    capabilities: ['text', 'reasoning', 'code', 'analysis', 'creative'],
    contextLength: 128000,
    costPer1kTokens: 0.01,
    latency: 'low',
    quality: 'highest',
  },
  { 
    id: 'claude-3-opus', 
    name: 'Claude 3 Opus', 
    provider: 'Anthropic', 
    capabilities: ['text', 'analysis', 'safety', 'reasoning', 'creative'],
    contextLength: 200000,
    costPer1kTokens: 0.015,
    latency: 'medium',
    quality: 'highest',
  },
  { 
    id: 'gemini-ultra', 
    name: 'Gemini Ultra', 
    provider: 'Google', 
    capabilities: ['text', 'multimodal', 'reasoning', 'code', 'analysis'],
    contextLength: 100000,
    costPer1kTokens: 0.008,
    latency: 'low',
    quality: 'high',
  },
  { 
    id: 'llama-3-70b', 
    name: 'Llama 3 70B', 
    provider: 'Meta', 
    capabilities: ['text', 'open_source', 'customizable', 'reasoning'],
    contextLength: 32000,
    costPer1kTokens: 0.005,
    latency: 'medium',
    quality: 'high',
  },
];

const CONVERSATION_TEMPLATES = [
  {
    id: 'classification_consultation',
    name: 'Classification Consultation',
    description: 'Expert consultation on data classification strategies and implementation',
    category: 'classification',
    systemPrompt: 'You are an expert data classification consultant with deep knowledge of enterprise classification systems, regulatory requirements, and best practices. Provide strategic guidance on classification approaches, technology selection, and implementation roadmaps.',
    workflows: ['strategy_assessment', 'technology_selection', 'implementation_planning', 'compliance_review'],
    personas: ['enterprise_analyst', 'compliance_officer', 'technical_architect'],
    complexity: 'advanced',
    duration: 'extended',
  },
  {
    id: 'ai_model_optimization',
    name: 'AI Model Optimization',
    description: 'Advanced consultation on AI model performance optimization and tuning',
    category: 'ai_optimization',
    systemPrompt: 'You are an AI research specialist focused on model optimization, performance tuning, and advanced machine learning techniques. Provide expert guidance on model architecture, hyperparameter optimization, and performance enhancement strategies.',
    workflows: ['performance_analysis', 'optimization_strategy', 'implementation_guidance', 'monitoring_setup'],
    personas: ['ai_researcher', 'technical_architect'],
    complexity: 'expert',
    duration: 'extended',
  },
  {
    id: 'compliance_assessment',
    name: 'Compliance & Governance Assessment',
    description: 'Comprehensive assessment of regulatory compliance and data governance',
    category: 'compliance',
    systemPrompt: 'You are a compliance and governance expert specializing in data privacy, regulatory requirements, and AI ethics. Provide thorough assessments of compliance posture, risk identification, and remediation strategies.',
    workflows: ['compliance_audit', 'risk_assessment', 'policy_development', 'remediation_planning'],
    personas: ['compliance_officer', 'enterprise_analyst'],
    complexity: 'expert',
    duration: 'comprehensive',
  },
  {
    id: 'business_strategy_session',
    name: 'Business Strategy Session',
    description: 'Strategic business planning and digital transformation guidance',
    category: 'strategy',
    systemPrompt: 'You are a business strategy consultant specializing in digital transformation and AI adoption. Provide strategic insights on business value creation, transformation roadmaps, and competitive positioning.',
    workflows: ['strategy_development', 'value_assessment', 'roadmap_planning', 'change_management'],
    personas: ['business_strategist', 'enterprise_analyst'],
    complexity: 'advanced',
    duration: 'strategic',
  },
  {
    id: 'technical_troubleshooting',
    name: 'Technical Troubleshooting',
    description: 'Advanced technical problem diagnosis and resolution',
    category: 'technical_support',
    systemPrompt: 'You are a technical architecture specialist with expertise in complex system troubleshooting, performance optimization, and integration challenges. Provide systematic problem diagnosis and solution recommendations.',
    workflows: ['problem_diagnosis', 'root_cause_analysis', 'solution_design', 'implementation_support'],
    personas: ['technical_architect', 'ai_researcher'],
    complexity: 'expert',
    duration: 'focused',
  },
  {
    id: 'user_adoption_strategy',
    name: 'User Adoption Strategy',
    description: 'Comprehensive user adoption and change management consultation',
    category: 'adoption',
    systemPrompt: 'You are a customer success specialist focused on user adoption, training strategies, and organizational change management. Provide guidance on adoption strategies, training programs, and success metrics.',
    workflows: ['adoption_assessment', 'training_design', 'change_management', 'success_measurement'],
    personas: ['customer_success', 'business_strategist'],
    complexity: 'advanced',
    duration: 'comprehensive',
  },
];

const CONVERSATION_MODES = [
  { id: 'text', name: 'Text Chat', icon: MessageSquare, description: 'Traditional text-based conversation' },
  { id: 'voice', name: 'Voice Chat', icon: Mic, description: 'Voice-enabled conversation with speech-to-text' },
  { id: 'multimodal', name: 'Multimodal', icon: Layers, description: 'Text, voice, images, and documents' },
  { id: 'collaborative', name: 'Collaborative', icon: Users, description: 'Team-based conversation with multiple participants' },
  { id: 'workflow', name: 'Workflow-Driven', icon: Workflow, description: 'Structured workflow-based conversation' },
  { id: 'analytical', name: 'Analytical', icon: BarChart3, description: 'Data-driven conversation with analytics integration' },
];

const QUALITY_DIMENSIONS = [
  { id: 'accuracy', name: 'Accuracy', description: 'Factual correctness and precision', weight: 0.2 },
  { id: 'relevance', name: 'Relevance', description: 'Contextual appropriateness and topic alignment', weight: 0.18 },
  { id: 'coherence', name: 'Coherence', description: 'Logical flow and consistency', weight: 0.15 },
  { id: 'helpfulness', name: 'Helpfulness', description: 'Practical value and actionability', weight: 0.15 },
  { id: 'safety', name: 'Safety', description: 'Harmlessness and risk mitigation', weight: 0.12 },
  { id: 'clarity', name: 'Clarity', description: 'Clear communication and understanding', weight: 0.1 },
  { id: 'empathy', name: 'Empathy', description: 'Emotional intelligence and understanding', weight: 0.1 },
];

const PERFORMANCE_METRICS = [
  { id: 'response_time', name: 'Response Time', unit: 'ms', target: 2000, threshold: 5000 },
  { id: 'throughput', name: 'Throughput', unit: 'msg/sec', target: 100, threshold: 50 },
  { id: 'availability', name: 'Availability', unit: '%', target: 99.9, threshold: 99.0 },
  { id: 'success_rate', name: 'Success Rate', unit: '%', target: 95, threshold: 90 },
  { id: 'user_satisfaction', name: 'User Satisfaction', unit: '/5', target: 4.5, threshold: 4.0 },
  { id: 'cost_efficiency', name: 'Cost Efficiency', unit: '$/conversation', target: 0.50, threshold: 1.00 },
];

const ConversationManager: React.FC = () => {
  // State management with comprehensive conversation orchestration
  const {
    conversations,
    isLoading,
    error,
    createConversation,
    sendMessage,
    getConversationHistory,
    updateConversationSettings,
    analyzeConversation,
    optimizeConversation,
  } = useClassificationState();

  const {
    nlpModels,
    conversationAgents,
    processNaturalLanguage,
    generateResponse,
    analyzeConversation: analyzeAIConversation,
    optimizeResponseGeneration,
    manageConversationWorkflow,
    monitorConversationQuality,
    enhanceConversationIntelligence,
  } = useAIIntelligence();

  // Core conversation state
  const [conversationState, setConversationState] = useState<ConversationState>({
    activeThreads: [],
    selectedThread: null,
    conversationHistory: [],
    contextualMemory: [],
    userPreferences: {} as UserPreferences,
    conversationSettings: {} as ConversationSettings,
    analytics: {} as ConversationAnalytics,
    knowledgeBase: [],
    agents: [],
    templates: [],
    workflows: [],
    realTimeStreams: [],
    qualityMetrics: {} as ConversationQualityMetrics,
    performanceInsights: {} as ConversationPerformanceInsights,
    collaborationData: {} as ConversationCollaboration,
    securityContext: {} as ConversationSecurity,
  });

  // UI and interaction state
  const [activeTab, setActiveTab] = useState('conversations');
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('enterprise_analyst');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [conversationMode, setConversationMode] = useState<'text' | 'voice' | 'multimodal' | 'collaborative' | 'workflow' | 'analytical'>('text');
  
  // Advanced configuration state
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  
  // Feature toggles and preferences
  const [autoSave, setAutoSave] = useState(true);
  const [contextAwareness, setContextAwareness] = useState(true);
  const [emotionalIntelligence, setEmotionalIntelligence] = useState(true);
  const [multiLanguage, setMultiLanguage] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  const [analyticsMode, setAnalyticsMode] = useState(true);
  const [securityMode, setSecurityMode] = useState(true);
  const [workflowMode, setWorkflowMode] = useState(false);
  const [qualityMonitoring, setQualityMonitoring] = useState(true);
  const [performanceOptimization, setPerformanceOptimization] = useState(true);
  const [intelligentRouting, setIntelligentRouting] = useState(true);
  const [adaptiveLearning, setAdaptiveLearning] = useState(true);
  const [personalizedExperience, setPersonalizedExperience] = useState(true);
  
  // Search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline' | 'analytics'>('list');
  
  // Advanced settings
  const [temperatureSetting, setTemperatureSetting] = useState(0.7);
  const [maxTokensSetting, setMaxTokensSetting] = useState(2048);
  const [topPSetting, setTopPSetting] = useState(0.9);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [responseLength, setResponseLength] = useState(2); // 0: short, 1: medium, 2: long, 3: comprehensive
  const [creativityLevel, setCreativityLevel] = useState(2); // 0: conservative, 1: balanced, 2: creative, 3: innovative
  const [formalityLevel, setFormalityLevel] = useState(2); // 0: casual, 1: friendly, 2: professional, 3: formal
  const [detailLevel, setDetailLevel] = useState(2); // 0: overview, 1: standard, 2: detailed, 3: comprehensive
  
  // Refs for advanced functionality
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const collaborationRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);

  // Load initial data and establish enterprise-grade connections
  useEffect(() => {
    loadConversationData();
    initializeRealTimeConnections();
    initializeAnalyticsTracking();
    initializeSecurityMonitoring();
    initializePerformanceOptimization();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversationState.selectedThread?.messages]);

  // Advanced data loading with enterprise features
  const loadConversationData = useCallback(async () => {
    try {
      const [
        threadsData, 
        historyData, 
        agentsData, 
        templatesData,
        analyticsData,
        qualityData,
        performanceData,
        collaborationData,
        securityData,
        workflowData
      ] = await Promise.all([
        aiApi.getConversationThreads({
          includeArchived: false,
          includeAnalytics: true,
          includeQualityMetrics: true,
        }),
        getConversationHistory({
          limit: 1000,
          includeContext: true,
          includeAnalytics: true,
        }),
        aiApi.getConversationAgents({
          includePerformanceMetrics: true,
          includeCapabilities: true,
        }),
        aiApi.getConversationTemplates({
          includeWorkflows: true,
          includePersonas: true,
        }),
        aiApi.getConversationAnalytics({
          timeRange: '30d',
          includeQualityMetrics: true,
          includePerformanceMetrics: true,
          includeBusinessMetrics: true,
        }),
        aiApi.getConversationQualityMetrics({
          timeRange: '7d',
          includeTrends: true,
        }),
        aiApi.getConversationPerformanceMetrics({
          timeRange: '24h',
          includeRealTime: true,
        }),
        aiApi.getCollaborationData({
          includeTeamMetrics: true,
          includeSharedThreads: true,
        }),
        aiApi.getSecurityData({
          includeAuditTrail: true,
          includeComplianceStatus: true,
        }),
        aiApi.getWorkflowData({
          includeActiveWorkflows: true,
          includeTemplates: true,
        }),
      ]);

      setConversationState(prev => ({
        ...prev,
        activeThreads: threadsData.data,
        conversationHistory: historyData,
        agents: agentsData.data,
        templates: templatesData.data,
        analytics: analyticsData.data,
        qualityMetrics: qualityData.data,
        performanceInsights: performanceData.data,
        collaborationData: collaborationData.data,
        securityContext: securityData.data,
        workflows: workflowData.data,
      }));

      // Select the first thread if available and none selected
      if (threadsData.data.length > 0 && !conversationState.selectedThread) {
        setConversationState(prev => ({
          ...prev,
          selectedThread: threadsData.data[0],
        }));
      }
    } catch (error) {
      console.error('Error loading conversation data:', error);
    }
  }, [getConversationHistory, conversationState.selectedThread]);

  const initializeRealTimeConnections = useCallback(async () => {
    if (realTimeMode) {
      try {
        await websocketApi.connect('conversations');
        
        // Message-level real-time updates
        websocketApi.subscribe('message_received', (data) => {
          setConversationState(prev => ({
            ...prev,
            selectedThread: prev.selectedThread ? {
              ...prev.selectedThread,
              messages: [...prev.selectedThread.messages, data.message],
            } : prev.selectedThread,
          }));
        });

        websocketApi.subscribe('message_updated', (data) => {
          setConversationState(prev => ({
            ...prev,
            selectedThread: prev.selectedThread ? {
              ...prev.selectedThread,
              messages: prev.selectedThread.messages.map(msg =>
                msg.id === data.messageId ? { ...msg, ...data.updates } : msg
              ),
            } : prev.selectedThread,
          }));
        });

        // Typing and presence indicators
        websocketApi.subscribe('typing_indicator', (data) => {
          // Handle typing indicators for collaborative conversations
          console.log('Typing indicator:', data);
        });

        websocketApi.subscribe('user_presence', (data) => {
          // Handle user presence updates
          console.log('User presence:', data);
        });

        // Quality and performance monitoring
        websocketApi.subscribe('quality_metrics_updated', (data) => {
          setConversationState(prev => ({
            ...prev,
            qualityMetrics: { ...prev.qualityMetrics, ...data },
          }));
        });

        websocketApi.subscribe('performance_metrics_updated', (data) => {
          setConversationState(prev => ({
            ...prev,
            performanceInsights: { ...prev.performanceInsights, ...data },
          }));
        });

        // Security and compliance monitoring
        websocketApi.subscribe('security_alert', (data) => {
          setConversationState(prev => ({
            ...prev,
            securityContext: {
              ...prev.securityContext,
              alerts: [...(prev.securityContext.alerts || []), data.alert],
            },
          }));
        });

        // Workflow and orchestration updates
        websocketApi.subscribe('workflow_updated', (data) => {
          setConversationState(prev => ({
            ...prev,
            workflows: prev.workflows.map(workflow =>
              workflow.id === data.workflowId ? { ...workflow, ...data.updates } : workflow
            ),
          }));
        });

        // Analytics and insights
        websocketApi.subscribe('analytics_updated', (data) => {
          setConversationState(prev => ({
            ...prev,
            analytics: { ...prev.analytics, ...data },
          }));
        });

        // Collaboration updates
        websocketApi.subscribe('collaboration_updated', (data) => {
          setConversationState(prev => ({
            ...prev,
            collaborationData: { ...prev.collaborationData, ...data },
          }));
        });

      } catch (error) {
        console.error('Error initializing real-time connections:', error);
      }
    }
  }, [realTimeMode]);

  const initializeAnalyticsTracking = useCallback(async () => {
    if (analyticsMode) {
      try {
        // Initialize comprehensive analytics tracking
        await aiApi.initializeAnalyticsTracking({
          trackingLevel: 'comprehensive',
          includeQualityMetrics: true,
          includePerformanceMetrics: true,
          includeBusinessMetrics: true,
          includeUserBehavior: true,
          includeConversationFlow: true,
          realTimeUpdates: realTimeMode,
        });
      } catch (error) {
        console.error('Error initializing analytics tracking:', error);
      }
    }
  }, [analyticsMode, realTimeMode]);

  const initializeSecurityMonitoring = useCallback(async () => {
    if (securityMode) {
      try {
        // Initialize enterprise-grade security monitoring
        await aiApi.initializeSecurityMonitoring({
          threatDetection: true,
          complianceMonitoring: true,
          auditTrail: true,
          dataGovernance: true,
          privacyProtection: true,
          accessControl: true,
          encryptionValidation: true,
          realTimeAlerts: realTimeMode,
        });
      } catch (error) {
        console.error('Error initializing security monitoring:', error);
      }
    }
  }, [securityMode, realTimeMode]);

  const initializePerformanceOptimization = useCallback(async () => {
    if (performanceOptimization) {
      try {
        // Initialize intelligent performance optimization
        await aiApi.initializePerformanceOptimization({
          adaptiveScaling: true,
          intelligentCaching: true,
          loadBalancing: true,
          resourceOptimization: true,
          latencyOptimization: true,
          throughputOptimization: true,
          costOptimization: true,
          realTimeMonitoring: realTimeMode,
        });
      } catch (error) {
        console.error('Error initializing performance optimization:', error);
      }
    }
  }, [performanceOptimization, realTimeMode]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Advanced Sidebar with Enterprise Features */}
        <div className="w-80 border-r bg-card flex flex-col">
          {/* Sidebar Header with Advanced Controls */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Enterprise Conversations
              </h2>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => handleCreateNewConversation()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Advanced Search and Filtering */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conversations</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                    <SelectItem value="high_quality">High Quality</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="importance">Importance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-600">{conversationState.activeThreads.length}</div>
                  <div className="text-blue-500">Active</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">
                    {Math.round((conversationState.qualityMetrics?.accuracy || 0) * 100)}%
                  </div>
                  <div className="text-green-500">Quality</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-semibold text-purple-600">
                    {Math.round((conversationState.performanceInsights?.responseTime || 0) / 1000)}s
                  </div>
                  <div className="text-purple-500">Response</div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation List with Enhanced Information */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredThreads.map((thread) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                    conversationState.selectedThread?.id === thread.id
                      ? 'bg-primary/10 border border-primary/20 shadow-sm'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleSelectThread(thread)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getPersonalityAvatar(thread.personality)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium truncate">{thread.title}</div>
                        {thread.unreadCount > 0 && (
                          <Badge className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground truncate mb-2">
                        {thread.messages.length > 0 
                          ? thread.messages[thread.messages.length - 1].content
                          : 'No messages yet'
                        }
                      </div>
                      
                      {/* Enhanced metadata */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {thread.updatedAt ? formatRelativeTime(thread.updatedAt) : ''}
                          </span>
                          {thread.mode && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {thread.mode}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {thread.qualityScore && (
                            <div className={`w-2 h-2 rounded-full ${
                              thread.qualityScore >= 0.8 ? 'bg-green-500' :
                              thread.qualityScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                          )}
                          {thread.isShared && <Users className="h-3 w-3 text-blue-500" />}
                          {thread.hasWorkflow && <Workflow className="h-3 w-3 text-purple-500" />}
                          {thread.isSecure && <Shield className="h-3 w-3 text-green-500" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar Footer with System Status */}
          <div className="p-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">System Status</span>
                <Badge className="text-green-600 bg-green-100">
                  {realTimeMode ? 'Live' : 'Offline'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Performance</div>
                  <Progress 
                    value={Math.round((conversationState.performanceInsights?.overallScore || 0) * 100)} 
                    className="h-1" 
                  />
                </div>
                <div>
                  <div className="text-muted-foreground">Quality</div>
                  <Progress 
                    value={Math.round((conversationState.qualityMetrics?.overallScore || 0) * 100)} 
                    className="h-1" 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSecurity(true)}>
                  <Shield className="h-4 w-4 mr-1" />
                  Security
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area with Enterprise Features */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Enhanced Chat Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getPersonalityAvatar(selectedThread.personality)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedThread.title}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>Model: {selectedModel}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>Mode: {conversationMode}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{selectedThread.messages.length} messages</span>
                        {selectedThread.qualityScore && (
                          <>
                            <Separator orientation="vertical" className="h-4" />
                            <span>Quality: {Math.round(selectedThread.qualityScore * 100)}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Mode Selector */}
                    <Select value={conversationMode} onValueChange={(value: any) => setConversationMode(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONVERSATION_MODES.map(mode => (
                          <SelectItem key={mode.id} value={mode.id}>
                            <div className="flex items-center gap-2">
                              <mode.icon className="h-4 w-4" />
                              {mode.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Quick Actions */}
                    <Button variant="outline" size="sm" onClick={() => setShowCollaboration(true)}>
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowWorkflow(true)}>
                      <Workflow className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)}>
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Advanced Status Indicators */}
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${realTimeMode ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>Real-time: {realTimeMode ? 'Active' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${contextAwareness ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    <span>Context: {contextAwareness ? 'Aware' : 'Basic'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${qualityMonitoring ? 'bg-purple-500' : 'bg-gray-400'}`} />
                    <span>Quality: {qualityMonitoring ? 'Monitored' : 'Standard'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${securityMode ? 'bg-red-500' : 'bg-gray-400'}`} />
                    <span>Security: {securityMode ? 'Enhanced' : 'Standard'}</span>
                  </div>
                </div>
              </div>

              {/* Messages Area with Enhanced Rendering */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedThread.messages.map((message) => {
                    const IconComponent = getMessageIcon(message.type);
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${
                          message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback>
                            <IconComponent className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`max-w-[70%] ${
                          message.type === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          <div className={`rounded-lg p-3 ${
                            message.type === 'user' 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : message.type === 'system'
                              ? 'bg-muted'
                              : 'bg-card border'
                          }`}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            
                            {/* Enhanced message features */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center gap-2 text-sm">
                                    <File className="h-4 w-4" />
                                    <span>{attachment.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {attachment.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {message.reasoning && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <div className="flex items-center gap-1 mb-1">
                                  <Brain className="h-3 w-3" />
                                  <span className="font-medium">Reasoning</span>
                                </div>
                                <div className="text-xs">{message.reasoning.summary}</div>
                              </div>
                            )}
                            
                            {message.citations && message.citations.length > 0 && (
                              <div className="mt-2 text-xs">
                                <div className="font-medium mb-1">Sources:</div>
                                {message.citations.map((citation, index) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <Link className="h-3 w-3" />
                                    <span>{citation.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {message.error && (
                              <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {message.error}
                              </div>
                            )}
                          </div>
                          
                          {/* Enhanced message metadata */}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {message.confidence && (
                              <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                            )}
                            {message.metadata?.processingTime && (
                              <span>Response: {message.metadata.processingTime}ms</span>
                            )}
                            {message.type === 'assistant' && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleTextToSpeech(message.content)}
                                >
                                  {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {/* Quality indicators */}
                          {message.metadata?.responseQuality && (
                            <div className="mt-1 flex items-center gap-1">
                              {QUALITY_DIMENSIONS.slice(0, 3).map((dimension) => {
                                const score = message.metadata.responseQuality[dimension.id] || 0;
                                return (
                                  <Tooltip key={dimension.id}>
                                    <TooltipTrigger>
                                      <div className={`w-2 h-2 rounded-full ${
                                        score >= 0.8 ? 'bg-green-500' :
                                        score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{dimension.name}: {Math.round(score * 100)}%</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Enhanced Input Area */}
              <div className="p-4 border-t bg-card">
                {/* Follow-up suggestions */}
                {selectedThread.followUpSuggestions && selectedThread.followUpSuggestions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm text-muted-foreground mb-2">Suggested follow-ups:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedThread.followUpSuggestions.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setMessageInput(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[60px] max-h-32 resize-none pr-12"
                    />
                    
                    {conversationMode === 'voice' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute right-2 bottom-2 ${isRecording ? 'text-red-500' : ''}`}
                        onClick={handleVoiceRecording}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {conversationMode === 'multimodal' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <File className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {workflowMode && (
                      <Button variant="outline" size="sm">
                        <Workflow className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="h-12"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Enhanced status bar */}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Personality: {CONVERSATION_PERSONALITIES.find(p => p.id === selectedPersonality)?.name}</span>
                    <span>Model: {LANGUAGE_MODELS.find(m => m.id === selectedModel)?.name}</span>
                    <span>Temperature: {temperatureSetting}</span>
                    <span>Max Tokens: {maxTokensSetting}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={contextAwareness}
                        onCheckedChange={setContextAwareness}
                        id="context-awareness"
                      />
                      <Label htmlFor="context-awareness" className="text-xs">Context Aware</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={emotionalIntelligence}
                        onCheckedChange={setEmotionalIntelligence}
                        id="emotional-intelligence"
                      />
                      <Label htmlFor="emotional-intelligence" className="text-xs">Emotional AI</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={qualityMonitoring}
                        onCheckedChange={setQualityMonitoring}
                        id="quality-monitoring"
                      />
                      <Label htmlFor="quality-monitoring" className="text-xs">Quality Monitor</Label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* No Conversation Selected State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Enterprise Conversation AI</h3>
                <p className="text-muted-foreground mb-6">
                  Select a conversation from the sidebar or create a new one to start an intelligent conversation with advanced AI capabilities
                </p>
                <div className="space-y-3">
                  <Button onClick={handleCreateNewConversation} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setShowTemplates(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Templates
                    </Button>
                    <Button variant="outline" onClick={() => setShowWorkflow(true)}>
                      <Workflow className="h-4 w-4 mr-2" />
                      Workflows
                    </Button>
                  </div>
                </div>
                
                {/* Quick stats */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">
                      {conversationState.analytics.totalConversations || 0}
                    </div>
                    <div className="text-muted-foreground">Total Conversations</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {Math.round((conversationState.analytics.satisfactionScore || 0) * 100)}%
                    </div>
                    <div className="text-muted-foreground">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">
                      {Math.round((conversationState.analytics.resolutionRate || 0) * 100)}%
                    </div>
                    <div className="text-muted-foreground">Resolution Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ConversationManager;