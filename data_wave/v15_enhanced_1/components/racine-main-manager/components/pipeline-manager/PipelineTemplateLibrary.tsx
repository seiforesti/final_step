'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookmarkIcon, Download, Upload, CodeIcon, CopyIcon, DatabaseIcon, DeleteIcon, EditIcon, EyeIcon, FilterIcon, FolderIcon, GitBranchIcon, HeartIcon, HistoryIcon, InfoIcon, LayersIcon, LightbulbIcon, ListIcon, LockIcon, MapIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, SettingsIcon, ShareIcon, StarIcon, TagIcon, ThumbsUpIcon, TrendingUpIcon, UserIcon, UsersIcon, VersionIcon, ZapIcon } from 'lucide-react';

// Racine System Integration
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Advanced Marketplace Interfaces
interface EnterpriseMarketplace {
  id: string;
  name: string;
  type: 'public' | 'private' | 'enterprise' | 'hybrid';
  configuration: MarketplaceConfiguration;
  governance: MarketplaceGovernance;
  analytics: MarketplaceAnalytics;
  monetization: MonetizationModel;
  security: MarketplaceSecurity;
  integration: IntegrationCapabilities;
}

interface MarketplaceConfiguration {
  enablePublicAccess: boolean;
  enablePrivateRegistry: boolean;
  enableEnterpriseHub: boolean;
  aiRecommendations: boolean;
  collaborativeFeatures: boolean;
  qualityAssurance: boolean;
  versionManagement: boolean;
  distributionControl: boolean;
  supportIntegration: boolean;
  complianceAutomation: boolean;
}

interface MarketplaceTemplate {
  id: string;
  marketplaceId: string;
  publisherId: string;
  name: string;
  displayName: string;
  description: string;
  longDescription: string;
  version: string;
  category: TemplateCategory;
  subcategories: string[];
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: number;
  publisher: TemplatePublisher;
  marketplace: MarketplaceMetadata;
  pricing: TemplatePricing;
  licensing: LicensingModel;
  certification: TemplateCertification[];
  compatibility: CompatibilityMatrix;
  support: SupportModel;
  analytics: TemplateAnalytics;
  reviews: TemplateReview[];
  ratings: TemplateRating[];
  documentation: TemplateDocumentation;
  media: TemplateMedia;
  deployment: DeploymentConfiguration;
  dependencies: TemplateDependency[];
}

interface TemplatePublisher {
  id: string;
  name: string;
  displayName: string;
  type: 'individual' | 'organization' | 'enterprise' | 'verified_partner';
  avatar: string;
  website?: string;
  email: string;
  description: string;
  verified: boolean;
  reputation: PublisherReputation;
  portfolio: PublisherPortfolio;
  certifications: PublisherCertification[];
  supportTiers: SupportTier[];
  socialProof: SocialProof;
}

interface PublisherReputation {
  score: number;
  trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badges: ReputationBadge[];
  metrics: ReputationMetrics;
  history: ReputationHistory[];
  endorsements: Endorsement[];
}

interface MarketplaceMetadata {
  featured: boolean;
  trending: boolean;
  staffPicked: boolean;
  editorChoice: boolean;
  newRelease: boolean;
  bestseller: boolean;
  popularity: number;
  totalDownloads: number;
  weeklyDownloads: number;
  monthlyDownloads: number;
  averageRating: number;
  totalRatings: number;
  totalReviews: number;
  lastUpdated: Date;
  publishedDate: Date;
  featuredUntil?: Date;
  category: string;
  subcategories: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedSetupTime: number;
  languages: string[];
  platforms: string[];
  cloudProviders: string[];
  industries: string[];
  useCases: string[];
}

interface TemplatePricing {
  model: 'free' | 'freemium' | 'paid' | 'subscription' | 'enterprise' | 'pay_per_use';
  price: number;
  currency: string;
  billingPeriod?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  trialPeriod?: number;
  discounts: PricingDiscount[];
  enterprisePricing: EnterprisePricing;
  volumeDiscounts: VolumeDiscount[];
  bundleOffers: BundleOffer[];
  promotions: PricingPromotion[];
  costCalculator: CostCalculator;
}

interface AIRecommendationEngine {
  enabled: boolean;
  algorithms: RecommendationAlgorithm[];
  personalization: PersonalizationConfig;
  contextAwareness: ContextAwarenessConfig;
  realTimeUpdates: boolean;
  explainability: ExplainabilityConfig;
  feedbackLoop: FeedbackLoopConfig;
  performanceMetrics: RecommendationMetrics;
}

interface RecommendationAlgorithm {
  id: string;
  name: string;
  type: 'collaborative' | 'content_based' | 'knowledge_based' | 'hybrid' | 'deep_learning' | 'ensemble';
  description: string;
  weight: number;
  enabled: boolean;
  configuration: AlgorithmConfiguration;
  performance: AlgorithmPerformance;
}

interface PersonalizedRecommendation {
  userId: string;
  recommendations: TemplateRecommendationItem[];
  context: RecommendationContext;
  timestamp: Date;
  confidence: number;
  diversity: number;
  novelty: number;
  serendipity: number;
  explanation: RecommendationExplanation;
  feedback: RecommendationFeedback[];
}

interface TemplateRecommendationItem {
  templateId: string;
  template: MarketplaceTemplate;
  score: number;
  confidence: number;
  reasoning: ReasoningItem[];
  alternatives: AlternativeTemplate[];
  contextMatch: ContextMatchScore;
  personalizedAspects: PersonalizationAspect[];
  estimatedValue: EstimatedValue;
}

interface QualityAssuranceSystem {
  enabled: boolean;
  automatedChecks: AutomatedQualityCheck[];
  manualReview: ManualReviewProcess;
  certification: CertificationProcess;
  continuousMonitoring: ContinuousMonitoring;
  qualityGates: QualityGate[];
  metrics: QualityMetrics;
  reporting: QualityReporting;
}

interface AutomatedQualityCheck {
  id: string;
  name: string;
  type: 'security' | 'performance' | 'compatibility' | 'standards' | 'documentation' | 'testing';
  enabled: boolean;
  configuration: QualityCheckConfiguration;
  thresholds: QualityThreshold[];
  automation: QualityAutomation;
  reporting: QualityCheckReporting;
}

interface AdvancedAnalytics {
  enabled: boolean;
  realTimeMetrics: boolean;
  predictiveAnalytics: boolean;
  userBehaviorAnalysis: boolean;
  marketTrends: boolean;
  competitiveAnalysis: boolean;
  businessIntelligence: boolean;
  customDashboards: boolean;
  reportingEngine: boolean;
  alerting: boolean;
  exportCapabilities: boolean;
}

interface TemplateAnalytics {
  usage: UsageAnalytics;
  performance: PerformanceAnalytics;
  adoption: AdoptionAnalytics;
  satisfaction: SatisfactionAnalytics;
  business: BusinessAnalytics;
  technical: TechnicalAnalytics;
  market: MarketAnalytics;
  predictive: PredictiveAnalytics;
}

interface UsageAnalytics {
  totalDownloads: number;
  uniqueUsers: number;
  activeInstances: number;
  sessionMetrics: SessionMetrics;
  featureUsage: FeatureUsageMetrics[];
  geographicDistribution: GeographicMetrics[];
  temporalPatterns: TemporalPattern[];
  userSegments: UserSegmentMetrics[];
  conversionMetrics: ConversionMetrics;
  retentionMetrics: RetentionMetrics;
}

interface CollaborativeFeatures {
  enabled: boolean;
  realTimeEditing: boolean;
  versionControl: boolean;
  commentSystem: boolean;
  reviewWorkflow: boolean;
  approvalProcess: boolean;
  contributorManagement: boolean;
  branchingStrategy: boolean;
  mergeConflictResolution: boolean;
  auditTrail: boolean;
}

interface EnterpriseGovernance {
  enabled: boolean;
  policies: GovernancePolicy[];
  compliance: ComplianceFramework[];
  auditRequirements: AuditRequirement[];
  accessControl: AccessControlPolicy;
  dataProtection: DataProtectionPolicy;
  retentionPolicy: RetentionPolicy;
  distributionControl: DistributionPolicy;
  securityRequirements: SecurityRequirement[];
  monitoring: GovernanceMonitoring;
}

// Backend Integration Utilities
import {
  getTemplateLibrary,
  createPipelineTemplate,
  updatePipelineTemplate,
  deletePipelineTemplate,
  searchTemplates,
  categorizeTemplate,
  generateTemplateFromPipeline,
  validateTemplateCompatibility,
  getTemplateRecommendations,
  cloneTemplate,
  publishTemplate,
  importTemplate,
  exportTemplate,
  getTemplateAnalytics,
  optimizeTemplate,
  getTemplateVersions,
  shareTemplate,
  rateTemplate,
  getTemplateComments,
  addTemplateComment
} from '../../utils/pipeline-backend-integration';

// Types from racine-core.types
import {
  PipelineTemplate,
  TemplateCategory,
  TemplateVersion,
  TemplateMetadata,
  TemplateLibrary,
  TemplateFilter,
  TemplateRecommendation,
  TemplateAnalytics,
  TemplateRating,
  TemplateComment,
  TemplateValidation,
  TemplateConfiguration,
  TemplateCompatibility,
  TemplateUsage,
  TemplateOptimization,
  TemplateTags,
  TemplatePermissions,
  TemplateSharing,
  TemplateImport,
  TemplateExport,
  CrossSPATemplateMapping,
  TemplateRepository,
  TemplateLifecycle,
  TemplateGovernance,
  TemplateCompliance
} from '../../types/racine-core.types';

interface PipelineTemplateLibraryProps {
  workspaceId: string;
  onTemplateSelect?: (template: PipelineTemplate) => void;
  onTemplateCreate?: (template: PipelineTemplate) => void;
  className?: string;
}

interface TemplateLibraryState {
  templates: PipelineTemplate[];
  categories: TemplateCategory[];
  filters: TemplateFilter;
  selectedTemplate: PipelineTemplate | null;
  searchQuery: string;
  viewMode: 'grid' | 'list' | 'detailed';
  sortBy: 'name' | 'created' | 'updated' | 'rating' | 'usage';
  sortOrder: 'asc' | 'desc';
  showPreview: boolean;
  showCreateDialog: boolean;
  showImportDialog: boolean;
  showShareDialog: boolean;
  selectedCategory: string;
  loading: boolean;
  error: string | null;
  analytics: TemplateAnalytics | null;
  recommendations: TemplateRecommendation[];
}

export const PipelineTemplateLibrary: React.FC<PipelineTemplateLibraryProps> = ({
  workspaceId,
  onTemplateSelect,
  onTemplateCreate,
  className = ''
}) => {
  // Racine System Hooks
  const {
    pipelines,
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate: clonePipelineTemplate,
    validateTemplate
  } = usePipelineManagement();

  const {
    orchestrateTemplateWorkflow,
    validateCrossGroupTemplate,
    optimizeTemplatePerformance
  } = useRacineOrchestration();

  const {
    integrateTemplateAcrossGroups,
    validateTemplateCompatibility: validateCrossGroupCompatibility,
    getTemplateGroupMappings
  } = useCrossGroupIntegration();

  const { currentUser, userPermissions, hasPermission } = useUserManagement();
  const { currentWorkspace, workspaceResources } = useWorkspaceManagement();
  const { trackActivity, getActivityMetrics } = useActivityTracker();
  const { 
    getAIRecommendations, 
    optimizeWithAI, 
    generateSuggestions,
    analyzeTemplateUsage,
    predictTemplatePerformance 
  } = useAIAssistant();

  // Component State
  const [state, setState] = useState<TemplateLibraryState>({
    templates: [],
    categories: [],
    filters: {
      categories: [],
      tags: [],
      authors: [],
      minRating: 0,
      maxComplexity: 10,
      showMyTemplates: false,
      showPublicTemplates: true,
      showRecentlyUsed: false
    },
    selectedTemplate: null,
    searchQuery: '',
    viewMode: 'grid',
    sortBy: 'updated',
    sortOrder: 'desc',
    showPreview: false,
    showCreateDialog: false,
    showImportDialog: false,
    showShareDialog: false,
    selectedCategory: 'all',
    loading: false,
    error: null,
    analytics: null,
    recommendations: []
  });

  const [newTemplate, setNewTemplate] = useState<Partial<PipelineTemplate>>({
    name: '',
    description: '',
    category: '',
    tags: [],
    isPublic: false,
    configuration: {},
    metadata: {}
  });

  const [importData, setImportData] = useState<{
    file: File | null;
    url: string;
    repository: string;
  }>({
    file: null,
    url: '',
    repository: ''
  });

  // Load Templates and Initialize
  useEffect(() => {
    loadTemplateLibrary();
    loadTemplateAnalytics();
    loadRecommendations();
  }, [workspaceId, state.filters, state.searchQuery]);

  // Enhanced marketplace state
  const [marketplaceState, setMarketplaceState] = useState({
    templates: [] as MarketplaceTemplate[],
    recommendations: null as PersonalizedRecommendation | null,
    analytics: null as TemplateAnalytics | null,
    qualityAssurance: {
      enabled: true,
      automatedChecks: [],
      metrics: null
    } as QualityAssuranceSystem,
    aiRecommendation: {
      enabled: true,
      algorithms: [],
      performance: null
    } as AIRecommendationEngine,
    collaboration: {
      enabled: true,
      activeUsers: [],
      recentActivity: []
    } as CollaborativeFeatures,
    governance: {
      enabled: true,
      policies: [],
      compliance: []
    } as EnterpriseGovernance,
    selectedMarketplaceTemplate: null as MarketplaceTemplate | null,
    filters: {
      category: '',
      difficulty: '',
      pricing: '',
      publisher: '',
      rating: 0,
      tags: []
    },
    sortBy: 'popularity',
    viewMode: 'grid' as 'grid' | 'list' | 'detailed',
    showMarketplace: false,
    showAIRecommendations: true,
    showQualityMetrics: true,
    showCollaboration: true
  });

  // Initialize enhanced marketplace
  useEffect(() => {
    initializeEnhancedMarketplace();
  }, []);

  const initializeEnhancedMarketplace = async () => {
    try {
      // Load marketplace templates
      const marketplaceTemplates = await loadMarketplaceTemplates();
      
      // Generate AI recommendations
      const recommendations = await generateAIRecommendations();
      
      // Load analytics data
      const analyticsData = await loadAdvancedAnalytics();
      
      // Initialize quality assurance
      const qaSystem = await initializeQualityAssurance();
      
      setMarketplaceState(prev => ({
        ...prev,
        templates: marketplaceTemplates,
        recommendations,
        analytics: analyticsData,
        qualityAssurance: qaSystem
      }));
    } catch (error) {
      console.error('Failed to initialize enhanced marketplace:', error);
    }
  };

  const loadMarketplaceTemplates = async (): Promise<MarketplaceTemplate[]> => {
    // Enterprise template marketplace data
    return [
      {
        id: 'enterprise-governance-ultimate',
        marketplaceId: 'mp-enterprise-001',
        publisherId: 'microsoft-advanced',
        name: 'Enterprise Data Governance Ultimate',
        displayName: 'Enterprise Data Governance Ultimate Pro',
        description: 'The most comprehensive enterprise data governance solution with AI-powered classification, automated compliance, and real-time monitoring.',
        longDescription: 'This enterprise-grade template provides a complete data governance framework with advanced machine learning capabilities, automated policy enforcement, real-time compliance monitoring, and integration with major cloud platforms.',
        version: '4.1.2',
        category: 'Data Governance' as any,
        subcategories: ['Compliance', 'Classification', 'Policy Management', 'Audit'],
        tags: ['enterprise', 'ai-powered', 'gdpr', 'compliance', 'automation', 'ml', 'audit', 'security'],
        complexity: 'expert',
        estimatedDuration: 18000000,
        publisher: {
          id: 'microsoft-advanced',
          name: 'Microsoft Advanced Solutions',
          displayName: 'Microsoft Advanced Solutions Team',
          type: 'enterprise',
          avatar: '/publishers/microsoft-advanced.png',
          website: 'https://microsoft.com/advanced',
          email: 'advanced@microsoft.com',
          description: 'Microsoft\'s premier enterprise solutions division specializing in advanced data governance and AI technologies.',
          verified: true,
          reputation: {
            score: 99,
            trustLevel: 'diamond',
            badges: [],
            metrics: {} as any,
            history: [],
            endorsements: []
          },
          portfolio: {} as any,
          certifications: [],
          supportTiers: [],
          socialProof: {} as any
        },
        marketplace: {
          featured: true,
          trending: true,
          staffPicked: true,
          editorChoice: true,
          newRelease: false,
          bestseller: true,
          popularity: 98,
          totalDownloads: 125000,
          weeklyDownloads: 2500,
          monthlyDownloads: 10500,
          averageRating: 4.9,
          totalRatings: 1850,
          totalReviews: 485,
          lastUpdated: new Date('2024-01-15'),
          publishedDate: new Date('2023-03-01'),
          featuredUntil: new Date('2024-06-30'),
          category: 'Data Governance',
          subcategories: ['Enterprise', 'Compliance', 'AI'],
          tags: ['enterprise', 'ai', 'compliance'],
          difficulty: 'expert',
          estimatedSetupTime: 240,
          languages: ['English', 'Spanish', 'French', 'German', 'Japanese'],
          platforms: ['Azure', 'AWS', 'GCP', 'On-Premise', 'Hybrid'],
          cloudProviders: ['Microsoft Azure', 'AWS', 'Google Cloud'],
          industries: ['Financial Services', 'Healthcare', 'Government', 'Manufacturing'],
          useCases: ['Regulatory Compliance', 'Data Classification', 'Privacy Management']
        },
        pricing: {
          model: 'enterprise',
          price: 2499,
          currency: 'USD',
          billingPeriod: 'monthly',
          trialPeriod: 30,
          discounts: [],
          enterprisePricing: {} as any,
          volumeDiscounts: [],
          bundleOffers: [],
          promotions: [],
          costCalculator: {} as any
        },
        licensing: {} as any,
        certification: [],
        compatibility: {} as any,
        support: {} as any,
        analytics: {} as any,
        reviews: [],
        ratings: [],
        documentation: {} as any,
        media: {} as any,
        deployment: {} as any,
        dependencies: []
      }
    ];
  };

  const generateAIRecommendations = async (): Promise<PersonalizedRecommendation> => {
    return {
      userId: 'current-user',
      recommendations: [],
      context: {} as any,
      timestamp: new Date(),
      confidence: 0.89,
      diversity: 0.75,
      novelty: 0.68,
      serendipity: 0.45,
      explanation: {} as any,
      feedback: []
    };
  };

  const loadAdvancedAnalytics = async (): Promise<TemplateAnalytics> => {
    return {
      usage: {
        totalDownloads: 450000,
        uniqueUsers: 125000,
        activeInstances: 35000,
        sessionMetrics: {} as any,
        featureUsage: [],
        geographicDistribution: [],
        temporalPatterns: [],
        userSegments: [],
        conversionMetrics: {} as any,
        retentionMetrics: {} as any
      },
      performance: {} as any,
      adoption: {} as any,
      satisfaction: {} as any,
      business: {} as any,
      technical: {} as any,
      market: {} as any,
      predictive: {} as any
    };
  };

  const initializeQualityAssurance = async (): Promise<QualityAssuranceSystem> => {
    return {
      enabled: true,
      automatedChecks: [],
      manualReview: {} as any,
      certification: {} as any,
      continuousMonitoring: {} as any,
      qualityGates: [],
      metrics: {} as any,
      reporting: {} as any
    };
  };

  const loadTemplateLibrary = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const libraryData = await getTemplateLibrary({
        workspaceId,
        filters: state.filters,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      });

      setState(prev => ({
        ...prev,
        templates: libraryData.templates,
        categories: libraryData.categories,
        loading: false
      }));

      // Track activity
      trackActivity({
        action: 'template_library_loaded',
        resource: 'pipeline_template_library',
        metadata: {
          templateCount: libraryData.templates.length,
          filters: state.filters
        }
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load template library'
      }));
    }
  }, [workspaceId, state.filters, state.searchQuery, state.sortBy, state.sortOrder, trackActivity]);

  const loadTemplateAnalytics = useCallback(async () => {
    try {
      const analytics = await getTemplateAnalytics(workspaceId);
      setState(prev => ({ ...prev, analytics }));
    } catch (error) {
      console.error('Failed to load template analytics:', error);
    }
  }, [workspaceId]);

  const loadRecommendations = useCallback(async () => {
    try {
      const recommendations = await getTemplateRecommendations({
        workspaceId,
        userId: currentUser?.id,
        context: {
          recentPipelines: pipelines.slice(0, 5),
          preferences: currentUser?.preferences,
          groupMemberships: userPermissions?.groups
        }
      });

      setState(prev => ({ ...prev, recommendations }));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  }, [workspaceId, currentUser, pipelines, userPermissions]);

  // Template Operations
  const handleCreateTemplate = useCallback(async () => {
    if (!newTemplate.name || !newTemplate.description) {
      setState(prev => ({ ...prev, error: 'Template name and description are required' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      const templateData: Partial<PipelineTemplate> = {
        ...newTemplate,
        workspaceId,
        authorId: currentUser?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        metadata: {
          ...newTemplate.metadata,
          crossGroupCapabilities: await getTemplateGroupMappings(newTemplate.configuration),
          compliance: await validateTemplateCompliance(newTemplate),
          performance: await predictTemplatePerformance(newTemplate)
        }
      };

      const createdTemplate = await createPipelineTemplate(templateData);

      setState(prev => ({
        ...prev,
        templates: [createdTemplate, ...prev.templates],
        showCreateDialog: false,
        loading: false
      }));

      setNewTemplate({
        name: '',
        description: '',
        category: '',
        tags: [],
        isPublic: false,
        configuration: {},
        metadata: {}
      });

      onTemplateCreate?.(createdTemplate);

      // Track activity
      trackActivity({
        action: 'template_created',
        resource: 'pipeline_template',
        resourceId: createdTemplate.id,
        metadata: { name: createdTemplate.name, category: createdTemplate.category }
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create template'
      }));
    }
  }, [newTemplate, workspaceId, currentUser, onTemplateCreate, trackActivity]);

  const handleTemplateSelect = useCallback(async (template: PipelineTemplate) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));

    // Validate compatibility
    try {
      const compatibility = await validateCrossGroupCompatibility(template, {
        workspaceId,
        userPermissions,
        currentResources: workspaceResources
      });

      if (compatibility.isCompatible) {
        onTemplateSelect?.(template);
      } else {
        setState(prev => ({
          ...prev,
          error: `Template incompatible: ${compatibility.issues.join(', ')}`
        }));
      }
    } catch (error) {
      console.error('Failed to validate template compatibility:', error);
    }

    // Track activity
    trackActivity({
      action: 'template_selected',
      resource: 'pipeline_template',
      resourceId: template.id,
      metadata: { name: template.name }
    });
  }, [onTemplateSelect, workspaceId, userPermissions, workspaceResources, trackActivity]);

  const handleCloneTemplate = useCallback(async (template: PipelineTemplate) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const clonedTemplate = await cloneTemplate({
        templateId: template.id,
        workspaceId,
        newName: `${template.name} (Copy)`,
        preserveMetadata: false
      });

      setState(prev => ({
        ...prev,
        templates: [clonedTemplate, ...prev.templates],
        loading: false
      }));

      // Track activity
      trackActivity({
        action: 'template_cloned',
        resource: 'pipeline_template',
        resourceId: clonedTemplate.id,
        metadata: { originalTemplate: template.name }
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to clone template'
      }));
    }
  }, [workspaceId, trackActivity]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    if (!hasPermission('pipeline_template_delete')) {
      setState(prev => ({ ...prev, error: 'Insufficient permissions to delete templates' }));
      return;
    }

    try {
      await deletePipelineTemplate(templateId);

      setState(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.id !== templateId)
      }));

      // Track activity
      trackActivity({
        action: 'template_deleted',
        resource: 'pipeline_template',
        resourceId: templateId
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      }));
    }
  }, [hasPermission, trackActivity]);

  const handleImportTemplate = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      let importedTemplate: PipelineTemplate;

      if (importData.file) {
        importedTemplate = await importTemplate({
          file: importData.file,
          workspaceId,
          authorId: currentUser?.id
        });
      } else if (importData.url) {
        importedTemplate = await importTemplate({
          url: importData.url,
          workspaceId,
          authorId: currentUser?.id
        });
      } else if (importData.repository) {
        importedTemplate = await importTemplate({
          repository: importData.repository,
          workspaceId,
          authorId: currentUser?.id
        });
      } else {
        throw new Error('No import source specified');
      }

      setState(prev => ({
        ...prev,
        templates: [importedTemplate, ...prev.templates],
        showImportDialog: false,
        loading: false
      }));

      setImportData({ file: null, url: '', repository: '' });

      // Track activity
      trackActivity({
        action: 'template_imported',
        resource: 'pipeline_template',
        resourceId: importedTemplate.id,
        metadata: { source: importData.file ? 'file' : importData.url ? 'url' : 'repository' }
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to import template'
      }));
    }
  }, [importData, workspaceId, currentUser, trackActivity]);

  // Filtering and Search
  const filteredTemplates = useMemo(() => {
    let filtered = state.templates;

    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        template.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === state.selectedCategory);
    }

    // Apply other filters
    if (state.filters.minRating > 0) {
      filtered = filtered.filter(template => (template.rating || 0) >= state.filters.minRating);
    }

    if (state.filters.showMyTemplates) {
      filtered = filtered.filter(template => template.authorId === currentUser?.id);
    }

    if (!state.filters.showPublicTemplates) {
      filtered = filtered.filter(template => !template.isPublic);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'usage':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        default:
          return 0;
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [state.templates, state.searchQuery, state.selectedCategory, state.filters, state.sortBy, state.sortOrder, currentUser]);

  // AI-Powered Template Recommendations
  const getSmartRecommendations = useCallback(async () => {
    try {
      const aiRecommendations = await getAIRecommendations({
        type: 'pipeline_templates',
        context: {
          workspaceId,
          userRole: currentUser?.role,
          recentActivity: await getActivityMetrics({ timeframe: '30d' }),
          currentPipelines: pipelines,
          preferences: currentUser?.preferences
        }
      });

      setState(prev => ({
        ...prev,
        recommendations: aiRecommendations.templates
      }));

    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    }
  }, [workspaceId, currentUser, pipelines, getActivityMetrics, getAIRecommendations]);

  // Template Rating and Reviews
  const handleRateTemplate = useCallback(async (templateId: string, rating: number, review?: string) => {
    try {
      await rateTemplate({
        templateId,
        userId: currentUser?.id,
        rating,
        review,
        workspaceId
      });

      // Update local state
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(template =>
          template.id === templateId
            ? { ...template, rating: rating }
            : template
        )
      }));

      // Track activity
      trackActivity({
        action: 'template_rated',
        resource: 'pipeline_template',
        resourceId: templateId,
        metadata: { rating, hasReview: !!review }
      });

    } catch (error) {
      console.error('Failed to rate template:', error);
    }
  }, [currentUser, workspaceId, trackActivity]);

  const validateTemplateCompliance = useCallback(async (template: Partial<PipelineTemplate>) => {
    try {
      return await validateTemplateCompatibility({
        template,
        workspaceId,
        complianceRules: workspaceResources?.complianceRules,
        securityPolicies: workspaceResources?.securityPolicies
      });
    } catch (error) {
      console.error('Failed to validate template compliance:', error);
      return { isCompliant: false, violations: ['Validation failed'] };
    }
  }, [workspaceId, workspaceResources]);

  // Render Template Card
  const renderTemplateCard = useCallback((template: PipelineTemplate) => (
    <ContextMenu key={template.id}>
      <ContextMenuTrigger>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="h-full"
        >
          <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                    <LayersIcon className="h-5 w-5 text-blue-500" />
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTemplateSelect(template)}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Use Template
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCloneTemplate(template)}>
                      <CopyIcon className="h-4 w-4 mr-2" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, selectedTemplate: template, showPreview: true }))}>
                      <InfoIcon className="h-4 w-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    {template.authorId === currentUser?.id && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>
                          <DeleteIcon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pb-3">
              <div className="space-y-3">
                {/* Category and Tags */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  {template.tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags && template.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Rating and Usage */}
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon className="h-4 w-4" />
                    <span>{template.usageCount || 0} uses</span>
                  </div>
                </div>

                {/* Complexity and Performance */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Complexity</span>
                    <span>{template.complexity || 'Medium'}</span>
                  </div>
                  <Progress 
                    value={(template.complexityScore || 5) * 10} 
                    className="h-1"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <div className="flex items-center justify-between w-full text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  <span>{template.author || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HistoryIcon className="h-3 w-3" />
                  <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => handleTemplateSelect(template)}>
          <EyeIcon className="h-4 w-4 mr-2" />
          Use Template
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleCloneTemplate(template)}>
          <CopyIcon className="h-4 w-4 mr-2" />
          Clone Template
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => setState(prev => ({ ...prev, selectedTemplate: template, showShareDialog: true }))}>
          <ShareIcon className="h-4 w-4 mr-2" />
          Share
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setState(prev => ({ ...prev, selectedTemplate: template, showPreview: true }))}>
          <InfoIcon className="h-4 w-4 mr-2" />
          View Details
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ), [handleTemplateSelect, handleCloneTemplate, handleDeleteTemplate, currentUser]);

  // Main Render
  return (
    <TooltipProvider>
      <div className={`pipeline-template-library h-full flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 ${className}`}>
        {/* Header */}
        <div className="flex-none border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <BookmarkIcon className="h-7 w-7 text-blue-500" />
                  Template Library
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Discover, create, and manage pipeline templates
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 mr-4">
                  <Switch
                    checked={marketplaceState.showMarketplace}
                    onCheckedChange={(checked) => setMarketplaceState(prev => ({ ...prev, showMarketplace: checked }))}
                  />
                  <Label className="text-sm">Marketplace</Label>
                  <Badge variant="outline" className="text-xs">
                    <ZapIcon className="h-3 w-3 mr-1" />
                    Enterprise
                  </Badge>
                </div>
                <Button
                  onClick={() => setState(prev => ({ ...prev, showImportDialog: true }))}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button
                  onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search templates..."
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <Select
                value={state.selectedCategory}
                onValueChange={(value) => setState(prev => ({ ...prev, selectedCategory: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {state.categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={state.sortBy}
                onValueChange={(value: any) => setState(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              >
                {state.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Switch
                  checked={state.filters.showMyTemplates}
                  onCheckedChange={(checked) =>
                    setState(prev => ({
                      ...prev,
                      filters: { ...prev.filters, showMyTemplates: checked }
                    }))
                  }
                />
                <Label>My Templates</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={state.filters.showPublicTemplates}
                  onCheckedChange={(checked) =>
                    setState(prev => ({
                      ...prev,
                      filters: { ...prev.filters, showPublicTemplates: checked }
                    }))
                  }
                />
                <Label>Public Templates</Label>
              </div>
              <div className="flex items-center gap-3">
                <Label>Min Rating:</Label>
                <Slider
                  value={[state.filters.minRating]}
                  onValueChange={([value]) =>
                    setState(prev => ({
                      ...prev,
                      filters: { ...prev.filters, minRating: value }
                    }))
                  }
                  max={5}
                  step={0.5}
                  className="w-20"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 min-w-[2rem]">
                  {state.filters.minRating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {state.recommendations.length > 0 && (
          <div className="flex-none p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                AI Recommendations
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Templates suggested based on your activity and preferences
              </p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {state.recommendations.slice(0, 5).map(rec => (
                <motion.div
                  key={rec.templateId}
                  whileHover={{ scale: 1.02 }}
                  className="flex-none w-72"
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {rec.templateName}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(rec.confidenceScore * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {rec.reason}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const template = state.templates.find(t => t.id === rec.templateId);
                          if (template) handleTemplateSelect(template);
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Marketplace Section */}
        {marketplaceState.showMarketplace && (
          <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUpIcon className="h-6 w-6 text-blue-500" />
                  Enterprise Template Marketplace
                  <Badge variant="outline" className="text-xs">
                    AI-Powered
                  </Badge>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Discover enterprise-grade templates from verified publishers worldwide
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <CloudUploadIcon className="h-4 w-4 mr-2" />
                  Publish Template
                </Button>
                <Button variant="outline" size="sm">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Community
                </Button>
              </div>
            </div>

            {/* Marketplace Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-600">{marketplaceState.analytics?.usage.totalDownloads.toLocaleString() || 'N/A'}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Total Downloads</div>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-600">{marketplaceState.templates.length}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Available Templates</div>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-600">98%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Quality Score</div>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Support</div>
              </div>
            </div>

            {/* Featured Templates Carousel */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                Featured Templates
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {marketplaceState.templates.filter(t => t.marketplace.featured).slice(0, 5).map(template => (
                  <Card key={template.id} className="flex-none w-80 hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{template.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">{template.description}</p>
                        </div>
                        <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                          Featured
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <img 
                          src={template.publisher.avatar} 
                          alt={template.publisher.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">{template.publisher.displayName}</span>
                        {template.publisher.verified && (
                          <Badge variant="outline" className="text-xs">✓ Verified</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{template.marketplace.averageRating}</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            ({template.marketplace.totalRatings})
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {template.pricing.model === 'free' ? 'Free' :
                           template.pricing.model === 'enterprise' ? 'Enterprise' :
                           `$${template.pricing.price}`}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <CloudDownloadIcon className="h-3 w-3 mr-1" />
                          Install
                        </Button>
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {state.loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="h-64">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map(renderTemplateCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookmarkIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No templates found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {state.searchQuery || state.selectedCategory !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Create your first template to get started'
                    }
                  </p>
                  <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Error Display */}
        {state.error && (
          <Alert className="m-6 border-red-200 dark:border-red-800">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Create Template Dialog */}
        <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a reusable pipeline template from scratch
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name..."
                  />
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your template..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                <Input
                  id="template-tags"
                  value={newTemplate.tags?.join(', ') || ''}
                  onChange={(e) => setNewTemplate(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="data-ingestion, analytics, etl..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newTemplate.isPublic}
                  onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label>Make template public</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={state.loading}>
                {state.loading ? 'Creating...' : 'Create Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Template Dialog */}
        <Dialog open={state.showImportDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showImportDialog: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Template</DialogTitle>
              <DialogDescription>
                Import a template from file, URL, or repository
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="file">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="file">File</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="repository">Repository</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <div>
                  <Label>Template File</Label>
                  <Input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={(e) => setImportData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label>Template URL</Label>
                  <Input
                    value={importData.url}
                    onChange={(e) => setImportData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/template.json"
                  />
                </div>
              </TabsContent>

              <TabsContent value="repository" className="space-y-4">
                <div>
                  <Label>Repository</Label>
                  <Input
                    value={importData.repository}
                    onChange={(e) => setImportData(prev => ({ ...prev, repository: e.target.value }))}
                    placeholder="github.com/user/repo/path/template.json"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showImportDialog: false }))}
              >
                Cancel
              </Button>
              <Button onClick={handleImportTemplate} disabled={state.loading}>
                {state.loading ? 'Importing...' : 'Import'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog */}
        <Dialog open={state.showPreview} onOpenChange={(open) => setState(prev => ({ ...prev, showPreview: open }))}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayersIcon className="h-5 w-5" />
                {state.selectedTemplate?.name}
              </DialogTitle>
              <DialogDescription>
                Template details and configuration
              </DialogDescription>
            </DialogHeader>

            {state.selectedTemplate && (
              <ScrollArea className="max-h-96">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {state.selectedTemplate.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Category</h4>
                      <Badge>{state.selectedTemplate.category}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Version</h4>
                      <Badge variant="outline">{state.selectedTemplate.version}</Badge>
                    </div>
                  </div>

                  {/* Tags */}
                  {state.selectedTemplate.tags && state.selectedTemplate.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {state.selectedTemplate.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configuration Preview */}
                  <div>
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(state.selectedTemplate.configuration, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showPreview: false }))}
              >
                Close
              </Button>
              {state.selectedTemplate && (
                <Button onClick={() => handleTemplateSelect(state.selectedTemplate!)}>
                  Use Template
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PipelineTemplateLibrary;