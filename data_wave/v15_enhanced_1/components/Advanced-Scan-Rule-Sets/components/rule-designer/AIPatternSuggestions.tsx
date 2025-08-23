/**
 * AI Pattern Suggestions Component for Advanced Data Governance
 * Provides intelligent pattern suggestions using machine learning and contextual analysis
 * Features: Pattern recognition, ML recommendations, contextual suggestions, semantic analysis
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, TrendingUp, Target, Zap, ChevronRight, Search, Filter, Download, Share2, BookOpen, Code, Database, Shield, AlertTriangle, CheckCircle, Clock, Users, Bookmark, Star, MessageSquare, RefreshCw, Layers, GitBranch, Cpu, BarChart3, Activity, Sparkles, Wand2, BrainCircuit, Network, Workflow, Gauge, Puzzle, Settings, Eye, ThumbsUp, ThumbsDown, Copy, ExternalLink, HelpCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types and interfaces
import { 
  PatternSuggestion, 
  AIRecommendation, 
  PatternContext,
  SuggestionFilter,
  PatternMetrics,
  LearningModel,
  ContextualHint,
  SuggestionFeedback,
  PatternCategory,
  SemanticAnalysis,
  PatternEvolution,
  SuggestionHistory,
  ModelPerformance,
  PatternConfidence,
  UserPreference,
  PatternTemplate,
  AIInsight,
  RecommendationEngine,
  PatternCluster,
  SuggestionPipeline,
  IntelligenceMetrics,
  AdaptiveLearning,
  PatternValidation,
  ContextualRelevance,
  SuggestionRanking,
  PatternOptimization
} from '../../types/intelligence.types';
import { ScanRule, RuleType, RuleCategory } from '../../types/scan-rules.types';

// Services and hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { usePatternLibrary } from '../../hooks/usePatternLibrary';
import { useScanRules } from '../../hooks/useScanRules';
import { useCollaboration } from '../../hooks/useCollaboration';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { patternMatcher } from '../../utils/pattern-matcher';
import { validationEngine } from '../../utils/validation-engine';

// Constants
import { THEME_CONFIG, ANIMATION_CONFIG, COMPONENT_CONFIG } from '../../constants/ui-constants';

// =============================================================================
// AI PATTERN SUGGESTIONS COMPONENT
// =============================================================================

interface AIPatternSuggestionsProps {
  currentRule?: ScanRule;
  context?: PatternContext;
  onSuggestionSelect?: (suggestion: PatternSuggestion) => void;
  onPatternApply?: (pattern: PatternTemplate) => void;
  disabled?: boolean;
  className?: string;
}

export const AIPatternSuggestions: React.FC<AIPatternSuggestionsProps> = ({
  currentRule,
  context,
  onSuggestionSelect,
  onPatternApply,
  disabled = false,
  className = ''
}) => {
  // State management
  const [suggestions, setSuggestions] = useState<PatternSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PatternCategory | 'all'>('all');
  const [filters, setFilters] = useState<SuggestionFilter>({
    confidence: 0.7,
    relevance: 0.8,
    categories: [],
    types: [],
    complexity: 'all'
  });
  const [selectedSuggestion, setSelectedSuggestion] = useState<PatternSuggestion | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestionHistory, setSuggestionHistory] = useState<SuggestionHistory[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference>({});
  const [modelMetrics, setModelMetrics] = useState<ModelPerformance | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    learningRate: 0.1,
    adaptationEnabled: true,
    feedbackWeight: 0.3
  });

  // Refs
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { 
    generateSuggestions,
    analyzeSemantic,
    getContextualHints,
    getModelPerformance,
    submitFeedback,
    updateLearningModel,
    getClusters,
    optimizeRecommendations
  } = useIntelligence();

  const {
    patterns,
    searchPatterns,
    getPatternsByCategory,
    getPopularPatterns,
    getRecentPatterns
  } = usePatternLibrary();

  const { validateRule } = useScanRules();
  const { trackUserActivity } = useCollaboration();

  // =============================================================================
  // CORE AI SUGGESTION ENGINE
  // =============================================================================

  /**
   * Generate AI-powered pattern suggestions based on current context
   */
  const generateAISuggestions = useCallback(async () => {
    if (!currentRule && !context) return;

    setLoading(true);
    try {
      // Analyze current context
      const contextAnalysis = await aiHelpers.semanticAnalysis.analyzeContext({
        rule: currentRule,
        context: context || {},
        userHistory: suggestionHistory,
        preferences: userPreferences
      });

      // Generate base suggestions using AI
      const baseSuggestions = await generateSuggestions({
        context: contextAnalysis,
        filters,
        limit: 50
      });

      // Apply semantic enhancement
      const enhancedSuggestions = await Promise.all(
        baseSuggestions.map(async (suggestion) => {
          const semanticAnalysis = await analyzeSemantic(suggestion.pattern);
          const confidence = await calculateConfidence(suggestion, contextAnalysis);
          const relevance = await calculateRelevance(suggestion, context);

          return {
            ...suggestion,
            semanticAnalysis,
            confidence,
            relevance,
            aiInsights: await generateInsights(suggestion, contextAnalysis)
          };
        })
      );

      // Rank and optimize suggestions
      const rankedSuggestions = await optimizeRecommendations(
        enhancedSuggestions,
        userPreferences,
        contextAnalysis
      );

      setSuggestions(rankedSuggestions);

      // Generate contextual insights
      const contextualInsights = await generateContextualInsights(
        rankedSuggestions,
        contextAnalysis
      );
      setInsights(contextualInsights);

      // Track usage for adaptive learning
      await trackUserActivity({
        action: 'suggestion_generated',
        context: contextAnalysis,
        suggestions: rankedSuggestions.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [
    currentRule,
    context,
    filters,
    suggestionHistory,
    userPreferences,
    generateSuggestions,
    analyzeSemantic,
    optimizeRecommendations,
    trackUserActivity
  ]);

  /**
   * Calculate confidence score for a suggestion
   */
  const calculateConfidence = useCallback(async (
    suggestion: PatternSuggestion,
    contextAnalysis: SemanticAnalysis
  ): Promise<number> => {
    const factors = {
      // Pattern usage frequency
      usageFrequency: suggestion.metrics?.usage || 0,
      
      // Semantic similarity to context
      semanticSimilarity: await patternMatcher.calculateSimilarity(
        suggestion.pattern,
        contextAnalysis.patterns
      ),
      
      // Historical success rate
      successRate: suggestion.metrics?.successRate || 0.5,
      
      // Validation score
      validationScore: await validationEngine.validatePattern(suggestion.pattern),
      
      // User preference alignment
      preferenceAlignment: calculatePreferenceAlignment(suggestion, userPreferences)
    };

    // Weighted confidence calculation
    const weights = {
      usageFrequency: 0.2,
      semanticSimilarity: 0.3,
      successRate: 0.25,
      validationScore: 0.15,
      preferenceAlignment: 0.1
    };

    return Object.entries(factors).reduce((confidence, [factor, value]) => {
      return confidence + (value * weights[factor as keyof typeof weights]);
    }, 0);
  }, [userPreferences]);

  /**
   * Calculate relevance score for a suggestion
   */
  const calculateRelevance = useCallback(async (
    suggestion: PatternSuggestion,
    context?: PatternContext
  ): Promise<number> => {
    if (!context) return 0.5;

    const relevanceFactors = {
      // Domain relevance
      domainMatch: suggestion.domain === context.domain ? 1 : 0.3,
      
      // Rule type compatibility
      typeCompatibility: suggestion.ruleTypes?.includes(context.ruleType || '') ? 1 : 0.5,
      
      // Complexity alignment
      complexityMatch: Math.abs((suggestion.complexity || 0.5) - (context.complexity || 0.5)),
      
      // Temporal relevance
      recency: calculateRecencyScore(suggestion.lastUpdated),
      
      // Contextual keywords match
      keywordMatch: calculateKeywordMatch(suggestion.keywords, context.keywords)
    };

    // Normalize and combine factors
    return (
      relevanceFactors.domainMatch * 0.3 +
      relevanceFactors.typeCompatibility * 0.25 +
      (1 - relevanceFactors.complexityMatch) * 0.2 +
      relevanceFactors.recency * 0.15 +
      relevanceFactors.keywordMatch * 0.1
    );
  }, []);

  /**
   * Generate AI insights for a suggestion
   */
  const generateInsights = useCallback(async (
    suggestion: PatternSuggestion,
    contextAnalysis: SemanticAnalysis
  ): Promise<AIInsight[]> => {
    return aiHelpers.intelligentAssistant.generateInsights({
      suggestion,
      context: contextAnalysis,
      userHistory: suggestionHistory,
      modelVersion: '2.1.0'
    });
  }, [suggestionHistory]);

  /**
   * Generate contextual insights for all suggestions
   */
  const generateContextualInsights = useCallback(async (
    suggestions: PatternSuggestion[],
    contextAnalysis: SemanticAnalysis
  ): Promise<AIInsight[]> => {
    const insights: AIInsight[] = [];

    // Pattern distribution insight
    const categoryDistribution = suggestions.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    insights.push({
      type: 'pattern_distribution',
      title: 'Pattern Categories',
      description: `Found patterns across ${Object.keys(categoryDistribution).length} categories`,
      data: categoryDistribution,
      confidence: 0.95,
      actionable: true
    });

    // Complexity analysis
    const avgComplexity = suggestions.reduce((sum, s) => sum + (s.complexity || 0), 0) / suggestions.length;
    insights.push({
      type: 'complexity_analysis',
      title: 'Complexity Assessment',
      description: `Average pattern complexity: ${(avgComplexity * 100).toFixed(1)}%`,
      data: { avgComplexity, distribution: suggestions.map(s => s.complexity) },
      confidence: 0.9,
      actionable: false
    });

    // Performance prediction
    const performancePrediction = await aiHelpers.predictiveAnalytics.predictPerformance({
      patterns: suggestions.map(s => s.pattern),
      context: contextAnalysis
    });

    insights.push({
      type: 'performance_prediction',
      title: 'Expected Performance',
      description: `Predicted ${performancePrediction.successRate}% success rate`,
      data: performancePrediction,
      confidence: performancePrediction.confidence,
      actionable: true
    });

    return insights;
  }, []);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Calculate preference alignment score
   */
  const calculatePreferenceAlignment = useCallback((
    suggestion: PatternSuggestion,
    preferences: UserPreference
  ): number => {
    if (!preferences || Object.keys(preferences).length === 0) return 0.5;

    let alignmentScore = 0;
    let factorCount = 0;

    // Category preference
    if (preferences.preferredCategories?.length) {
      alignmentScore += preferences.preferredCategories.includes(suggestion.category) ? 1 : 0;
      factorCount++;
    }

    // Complexity preference
    if (preferences.complexityPreference) {
      const complexityDiff = Math.abs(
        (suggestion.complexity || 0.5) - preferences.complexityPreference
      );
      alignmentScore += 1 - complexityDiff;
      factorCount++;
    }

    // Domain preference
    if (preferences.preferredDomains?.length) {
      alignmentScore += preferences.preferredDomains.includes(suggestion.domain) ? 1 : 0;
      factorCount++;
    }

    return factorCount > 0 ? alignmentScore / factorCount : 0.5;
  }, []);

  /**
   * Calculate recency score
   */
  const calculateRecencyScore = useCallback((lastUpdated?: string): number => {
    if (!lastUpdated) return 0.5;

    const now = new Date();
    const updated = new Date(lastUpdated);
    const daysDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);

    // Decay function - newer patterns get higher scores
    return Math.exp(-daysDiff / 30); // 30-day half-life
  }, []);

  /**
   * Calculate keyword match score
   */
  const calculateKeywordMatch = useCallback((
    suggestionKeywords?: string[],
    contextKeywords?: string[]
  ): number => {
    if (!suggestionKeywords?.length || !contextKeywords?.length) return 0;

    const intersection = suggestionKeywords.filter(k => 
      contextKeywords.some(ck => 
        k.toLowerCase().includes(ck.toLowerCase()) ||
        ck.toLowerCase().includes(k.toLowerCase())
      )
    );

    return intersection.length / Math.max(suggestionKeywords.length, contextKeywords.length);
  }, []);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handle suggestion selection
   */
  const handleSuggestionSelect = useCallback(async (suggestion: PatternSuggestion) => {
    setSelectedSuggestion(suggestion);
    
    // Track selection for learning
    await trackUserActivity({
      action: 'suggestion_selected',
      suggestionId: suggestion.id,
      confidence: suggestion.confidence,
      relevance: suggestion.relevance,
      timestamp: new Date().toISOString()
    });

    // Update suggestion history
    setSuggestionHistory(prev => [
      {
        suggestion,
        selectedAt: new Date().toISOString(),
        context: context || {}
      },
      ...prev.slice(0, 99) // Keep last 100 selections
    ]);

    onSuggestionSelect?.(suggestion);
  }, [context, onSuggestionSelect, trackUserActivity]);

  /**
   * Handle pattern application
   */
  const handlePatternApply = useCallback(async (suggestion: PatternSuggestion) => {
    if (!suggestion.template) return;

    try {
      // Validate pattern before applying
      const validation = await validationEngine.validatePattern(suggestion.pattern);
      
      if (validation.isValid) {
        await trackUserActivity({
          action: 'pattern_applied',
          suggestionId: suggestion.id,
          patternId: suggestion.template.id,
          timestamp: new Date().toISOString()
        });

        onPatternApply?.(suggestion.template);
      } else {
        console.warn('Pattern validation failed:', validation.errors);
      }
    } catch (error) {
      console.error('Error applying pattern:', error);
    }
  }, [onPatternApply, trackUserActivity]);

  /**
   * Handle feedback submission
   */
  const handleFeedback = useCallback(async (
    suggestion: PatternSuggestion,
    feedback: SuggestionFeedback
  ) => {
    try {
      await submitFeedback({
        suggestionId: suggestion.id,
        feedback,
        context: context || {},
        timestamp: new Date().toISOString()
      });

      // Update adaptive learning
      if (adaptiveSettings.adaptationEnabled) {
        await updateLearningModel({
          suggestionId: suggestion.id,
          feedback,
          learningRate: adaptiveSettings.learningRate,
          weight: adaptiveSettings.feedbackWeight
        });
      }

      // Refresh suggestions if feedback affects current results
      if (feedback.helpful !== undefined) {
        await generateAISuggestions();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }, [
    context,
    adaptiveSettings,
    submitFeedback,
    updateLearningModel,
    generateAISuggestions
  ]);

  /**
   * Handle search
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: Partial<SuggestionFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  /**
   * Filter suggestions based on search and filters
   */
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          suggestion.title.toLowerCase().includes(query) ||
          suggestion.description.toLowerCase().includes(query) ||
          suggestion.keywords?.some(k => k.toLowerCase().includes(query)) ||
          suggestion.pattern.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && suggestion.category !== selectedCategory) {
        return false;
      }

      // Confidence filter
      if (suggestion.confidence < filters.confidence) {
        return false;
      }

      // Relevance filter
      if (suggestion.relevance < filters.relevance) {
        return false;
      }

      // Category filters
      if (filters.categories.length > 0 && !filters.categories.includes(suggestion.category)) {
        return false;
      }

      // Type filters
      if (filters.types.length > 0 && !filters.types.some(type => 
        suggestion.ruleTypes?.includes(type)
      )) {
        return false;
      }

      // Complexity filter
      if (filters.complexity !== 'all') {
        const complexity = suggestion.complexity || 0.5;
        switch (filters.complexity) {
          case 'low':
            if (complexity > 0.33) return false;
            break;
          case 'medium':
            if (complexity <= 0.33 || complexity > 0.66) return false;
            break;
          case 'high':
            if (complexity <= 0.66) return false;
            break;
        }
      }

      return true;
    });
  }, [suggestions, searchQuery, selectedCategory, filters]);

  /**
   * Group suggestions by category
   */
  const groupedSuggestions = useMemo(() => {
    return filteredSuggestions.reduce((groups, suggestion) => {
      const category = suggestion.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(suggestion);
      return groups;
    }, {} as Record<string, PatternSuggestion[]>);
  }, [filteredSuggestions]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    return {
      total: suggestions.length,
      filtered: filteredSuggestions.length,
      avgConfidence: filteredSuggestions.reduce((sum, s) => sum + s.confidence, 0) / filteredSuggestions.length || 0,
      avgRelevance: filteredSuggestions.reduce((sum, s) => sum + s.relevance, 0) / filteredSuggestions.length || 0,
      categories: Object.keys(groupedSuggestions).length,
      highConfidence: filteredSuggestions.filter(s => s.confidence > 0.8).length
    };
  }, [suggestions, filteredSuggestions, groupedSuggestions]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  /**
   * Generate suggestions when context changes
   */
  useEffect(() => {
    if (currentRule || context) {
      generateAISuggestions();
    }
  }, [currentRule, context?.domain, context?.ruleType, generateAISuggestions]);

  /**
   * Update suggestions when filters change
   */
  useEffect(() => {
    if (suggestions.length > 0) {
      // Debounce filter updates
      const timeoutId = setTimeout(() => {
        generateAISuggestions();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [filters.confidence, filters.relevance, generateAISuggestions, suggestions.length]);

  /**
   * Load model performance metrics
   */
  useEffect(() => {
    const loadModelMetrics = async () => {
      try {
        const metrics = await getModelPerformance();
        setModelMetrics(metrics);
      } catch (error) {
        console.error('Error loading model metrics:', error);
      }
    };

    loadModelMetrics();
  }, [getModelPerformance]);

  /**
   * Auto-focus search input
   */
  useEffect(() => {
    if (searchInputRef.current && !disabled) {
      searchInputRef.current.focus();
    }
  }, [disabled]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render suggestion card
   */
  const renderSuggestionCard = useCallback((suggestion: PatternSuggestion) => (
    <motion.div
      key={suggestion.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card 
        className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 ${
          selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-primary border-primary' : ''
        }`}
        onClick={() => handleSuggestionSelect(suggestion)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                {suggestion.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {suggestion.description}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1 ml-4">
              <Badge variant="secondary" className="text-xs">
                {suggestion.category}
              </Badge>
              <div className="flex items-center space-x-1">
                <Badge 
                  variant={suggestion.confidence > 0.8 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {(suggestion.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Confidence and Relevance Bars */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Confidence</span>
              <span className="font-medium text-gray-900">
                {(suggestion.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={suggestion.confidence * 100} className="h-1.5" />
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Relevance</span>
              <span className="font-medium text-gray-900">
                {(suggestion.relevance * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={suggestion.relevance * 100} 
              className="h-1.5"
            />
          </div>

          {/* Pattern Preview */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Pattern</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(suggestion.pattern);
                }}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <code className="text-xs text-gray-800 font-mono break-all line-clamp-3">
              {suggestion.pattern}
            </code>
          </div>

          {/* Keywords and Tags */}
          {suggestion.keywords && suggestion.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {suggestion.keywords.slice(0, 6).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {suggestion.keywords.length > 6 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{suggestion.keywords.length - 6} more
                </Badge>
              )}
            </div>
          )}

          {/* Metrics */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{suggestion.metrics?.usage || 0} uses</span>
              </span>
              <span className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>{(suggestion.metrics?.rating || 0).toFixed(1)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{((suggestion.metrics?.successRate || 0) * 100).toFixed(0)}%</span>
              </span>
            </div>
            <span className="text-gray-500">
              {suggestion.lastUpdated && new Date(suggestion.lastUpdated).toLocaleDateString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {suggestion.template && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePatternApply(suggestion);
                  }}
                  className="h-8 text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Apply
                </Button>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{suggestion.title}</DialogTitle>
                  </DialogHeader>
                  {/* Detailed preview content would go here */}
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(suggestion, { helpful: true });
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mark as helpful</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(suggestion, { helpful: false });
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mark as not helpful</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ), [selectedSuggestion, handleSuggestionSelect, handlePatternApply, handleFeedback]);

  /**
   * Render insights panel
   */
  const renderInsights = useCallback(() => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
        AI Insights
      </h3>
      
      {insights.map((insight, index) => (
        <Card key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-blue-900">{insight.title}</h4>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {(insight.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-blue-800 text-sm mb-3">{insight.description}</p>
            
            {insight.actionable && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Apply Insight
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <Info className="h-3 w-3 mr-1" />
                  Learn More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  ), [insights]);

  /**
   * Render statistics
   */
  const renderStatistics = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Suggestion Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Suggestions</span>
            <p className="font-semibold text-lg">{statistics.total}</p>
          </div>
          <div>
            <span className="text-gray-600">Filtered Results</span>
            <p className="font-semibold text-lg">{statistics.filtered}</p>
          </div>
          <div>
            <span className="text-gray-600">Avg. Confidence</span>
            <p className="font-semibold text-lg">{(statistics.avgConfidence * 100).toFixed(1)}%</p>
          </div>
          <div>
            <span className="text-gray-600">High Confidence</span>
            <p className="font-semibold text-lg">{statistics.highConfidence}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ), [statistics]);

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <TooltipProvider>
      <div className={`ai-pattern-suggestions ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Pattern Suggestions</h2>
              <p className="text-gray-600">
                Intelligent pattern recommendations powered by machine learning
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => generateAISuggestions()}
              disabled={loading || disabled}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search patterns, descriptions, or keywords..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  disabled={disabled}
                />
              </div>

              {/* Quick Filters */}
              <div className="flex items-center space-x-4">
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => setSelectedCategory(value as PatternCategory | 'all')}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="data_quality">Data Quality</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="business_rules">Business Rules</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <div className="w-32">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={filters.confidence}
                      onChange={(e) => handleFilterChange({ confidence: parseFloat(e.target.value) })}
                      className="w-full"
                      disabled={disabled}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(filters.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Relevance:</span>
                  <div className="w-32">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={filters.relevance}
                      onChange={(e) => handleFilterChange({ relevance: parseFloat(e.target.value) })}
                      className="w-full"
                      disabled={disabled}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(filters.relevance * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-4"
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Rule Types
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="validation">Validation</SelectItem>
                            <SelectItem value="transformation">Transformation</SelectItem>
                            <SelectItem value="enrichment">Enrichment</SelectItem>
                            <SelectItem value="classification">Classification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Complexity
                        </label>
                        <Select 
                          value={filters.complexity}
                          onValueChange={(value) => handleFilterChange({ complexity: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Sort By
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Confidence" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confidence">Confidence</SelectItem>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="usage">Usage</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                            <SelectItem value="recency">Recently Updated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suggestions List */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestions" className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Suggestions</span>
                  <Badge variant="secondary" className="ml-1">
                    {statistics.filtered}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center space-x-2">
                  <BrainCircuit className="h-4 w-4" />
                  <span>Insights</span>
                  <Badge variant="secondary" className="ml-1">
                    {insights.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="suggestions" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-gray-600">Generating AI suggestions...</span>
                    </div>
                  </div>
                ) : filteredSuggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No suggestions found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters or providing more context
                    </p>
                    <Button onClick={() => generateAISuggestions()} disabled={disabled}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Suggestions
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[800px]" ref={suggestionsContainerRef}>
                    <div className="space-y-4 pr-4">
                      {filteredSuggestions.map(renderSuggestionCard)}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                {renderInsights()}
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Suggestion History</h3>
                  {suggestionHistory.length === 0 ? (
                    <p className="text-gray-600">No suggestions selected yet</p>
                  ) : (
                    <div className="space-y-3">
                      {suggestionHistory.slice(0, 10).map((entry, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{entry.suggestion.title}</h4>
                              <p className="text-sm text-gray-600">
                                {entry.suggestion.category} • {(entry.suggestion.confidence * 100).toFixed(0)}% confidence
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.selectedAt).toLocaleString()}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            {renderStatistics()}

            {/* Model Performance */}
            {modelMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Gauge className="h-4 w-4 mr-2" />
                    Model Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium">
                        {(modelMetrics.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precision</span>
                      <span className="font-medium">
                        {(modelMetrics.precision * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recall</span>
                      <span className="font-medium">
                        {(modelMetrics.recall * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">F1 Score</span>
                      <span className="font-medium">
                        {modelMetrics.f1Score.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Suggestions
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Results
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Tips
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AIPatternSuggestions;