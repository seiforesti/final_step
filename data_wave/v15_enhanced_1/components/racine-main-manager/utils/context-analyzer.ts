/**
 * Racine Context Analyzer Utility
 * ================================
 * 
 * Advanced context analysis utility for the AI assistant system that provides
 * intelligent context understanding, pattern recognition, and contextual
 * recommendations across all 7 data governance groups.
 * 
 * Features:
 * - Multi-dimensional context analysis
 * - User behavior pattern recognition
 * - Cross-group context correlation
 * - Temporal context tracking
 * - Intent prediction and classification
 * - Context-aware recommendations
 * - Anomaly detection in context patterns
 * - Context history management
 */

import {
  AIContext,
  UserContext,
  SystemContext,
  ConversationState,
  UUID,
  ISODateString
} from '../types/racine-core.types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ContextAnalysisResult {
  confidence: number;
  primaryIntent: string;
  secondaryIntents: string[];
  entities: ContextEntity[];
  patterns: ContextPattern[];
  recommendations: ContextRecommendation[];
  anomalies: ContextAnomaly[];
  metadata: Record<string, any>;
}

export interface ContextEntity {
  type: string;
  value: string;
  confidence: number;
  metadata: Record<string, any>;
}

export interface ContextPattern {
  type: string;
  description: string;
  strength: number;
  frequency: number;
  lastSeen: ISODateString;
  metadata: Record<string, any>;
}

export interface ContextRecommendation {
  type: string;
  title: string;
  description: string;
  priority: number;
  actionable: boolean;
  metadata: Record<string, any>;
}

export interface ContextAnomaly {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedAt: ISODateString;
  metadata: Record<string, any>;
}

export interface ContextVector {
  dimensions: Record<string, number>;
  magnitude: number;
  normalized: boolean;
}

export interface ContextCluster {
  id: string;
  centroid: ContextVector;
  members: string[];
  coherence: number;
  metadata: Record<string, any>;
}

// =============================================================================
// CONTEXT ANALYZER CLASS
// =============================================================================

export class ContextAnalyzer {
  private contextHistory: AIContext[] = [];
  private patternCache: Map<string, ContextPattern> = new Map();
  private entityExtractors: Map<string, (text: string) => ContextEntity[]> = new Map();
  private intentClassifiers: Map<string, (context: AIContext) => string> = new Map();
  private anomalyDetectors: Map<string, (context: AIContext) => ContextAnomaly[]> = new Map();

  constructor() {
    this.initializeExtractors();
    this.initializeClassifiers();
    this.initializeAnomalyDetectors();
  }

  // =============================================================================
  // MAIN ANALYSIS METHODS
  // =============================================================================

  /**
   * Perform comprehensive context analysis
   */
  async analyzeContext(context: AIContext): Promise<ContextAnalysisResult> {
    const startTime = performance.now();

    try {
      // Extract entities from context
      const entities = await this.extractEntities(context);

      // Classify primary and secondary intents
      const intents = await this.classifyIntents(context);

      // Identify patterns
      const patterns = await this.identifyPatterns(context);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(context, entities, patterns);

      // Detect anomalies
      const anomalies = await this.detectAnomalies(context);

      // Calculate confidence score
      const confidence = this.calculateConfidence(entities, intents, patterns);

      const analysisTime = performance.now() - startTime;

      return {
        confidence,
        primaryIntent: intents.primary,
        secondaryIntents: intents.secondary,
        entities,
        patterns,
        recommendations,
        anomalies,
        metadata: {
          analysisTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (error) {
      console.error('Context analysis failed:', error);
      throw new Error(`Context analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract entities from context
   */
  private async extractEntities(context: AIContext): Promise<ContextEntity[]> {
    const entities: ContextEntity[] = [];

    // Extract from user context
    if (context.user) {
      entities.push(...this.extractUserEntities(context.user));
    }

    // Extract from system context
    if (context.system) {
      entities.push(...this.extractSystemEntities(context.system));
    }

    // Extract from conversation context
    if (context.conversation) {
      entities.push(...this.extractConversationEntities(context.conversation));
    }

    // Extract from current activity
    if (context.currentActivity) {
      entities.push(...this.extractActivityEntities(context.currentActivity));
    }

    // Extract from workspace context
    if (context.workspace) {
      entities.push(...this.extractWorkspaceEntities(context.workspace));
    }

    return this.deduplicateEntities(entities);
  }

  /**
   * Classify intents from context
   */
  private async classifyIntents(context: AIContext): Promise<{ primary: string; secondary: string[] }> {
    const intentScores: Record<string, number> = {};

    // Use all registered classifiers
    for (const [name, classifier] of this.intentClassifiers) {
      try {
        const intent = classifier(context);
        if (intent) {
          intentScores[intent] = (intentScores[intent] || 0) + 1;
        }
      } catch (error) {
        console.warn(`Intent classifier ${name} failed:`, error);
      }
    }

    // Sort by score
    const sortedIntents = Object.entries(intentScores)
      .sort(([, a], [, b]) => b - a)
      .map(([intent]) => intent);

    return {
      primary: sortedIntents[0] || 'unknown',
      secondary: sortedIntents.slice(1, 4)
    };
  }

  /**
   * Identify patterns in context
   */
  private async identifyPatterns(context: AIContext): Promise<ContextPattern[]> {
    const patterns: ContextPattern[] = [];

    // Add current context to history
    this.contextHistory.push(context);

    // Limit history size
    if (this.contextHistory.length > 1000) {
      this.contextHistory = this.contextHistory.slice(-1000);
    }

    // Temporal patterns
    patterns.push(...this.identifyTemporalPatterns());

    // Behavioral patterns
    patterns.push(...this.identifyBehavioralPatterns());

    // Cross-group patterns
    patterns.push(...this.identifyCrossGroupPatterns());

    // Update pattern cache
    patterns.forEach(pattern => {
      const key = `${pattern.type}:${pattern.description}`;
      this.patternCache.set(key, pattern);
    });

    return patterns;
  }

  /**
   * Generate context-aware recommendations
   */
  private async generateRecommendations(
    context: AIContext,
    entities: ContextEntity[],
    patterns: ContextPattern[]
  ): Promise<ContextRecommendation[]> {
    const recommendations: ContextRecommendation[] = [];

    // Intent-based recommendations
    recommendations.push(...this.generateIntentRecommendations(context));

    // Entity-based recommendations
    recommendations.push(...this.generateEntityRecommendations(entities));

    // Pattern-based recommendations
    recommendations.push(...this.generatePatternRecommendations(patterns));

    // Cross-group recommendations
    recommendations.push(...this.generateCrossGroupRecommendations(context));

    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Detect anomalies in context
   */
  private async detectAnomalies(context: AIContext): Promise<ContextAnomaly[]> {
    const anomalies: ContextAnomaly[] = [];

    // Use all registered anomaly detectors
    for (const [name, detector] of this.anomalyDetectors) {
      try {
        const detectedAnomalies = detector(context);
        anomalies.push(...detectedAnomalies);
      } catch (error) {
        console.warn(`Anomaly detector ${name} failed:`, error);
      }
    }

    return anomalies;
  }

  // =============================================================================
  // ENTITY EXTRACTION METHODS
  // =============================================================================

  private extractUserEntities(user: UserContext): ContextEntity[] {
    const entities: ContextEntity[] = [];

    if (user.id) {
      entities.push({
        type: 'user',
        value: user.id,
        confidence: 1.0,
        metadata: { source: 'user_context' }
      });
    }

    if (user.roles) {
      user.roles.forEach(role => {
        entities.push({
          type: 'role',
          value: role,
          confidence: 0.9,
          metadata: { source: 'user_context' }
        });
      });
    }

    if (user.groups) {
      user.groups.forEach(group => {
        entities.push({
          type: 'group',
          value: group,
          confidence: 0.8,
          metadata: { source: 'user_context' }
        });
      });
    }

    return entities;
  }

  private extractSystemEntities(system: SystemContext): ContextEntity[] {
    const entities: ContextEntity[] = [];

    if (system.currentView) {
      entities.push({
        type: 'view',
        value: system.currentView,
        confidence: 0.9,
        metadata: { source: 'system_context' }
      });
    }

    if (system.activeFeatures) {
      system.activeFeatures.forEach(feature => {
        entities.push({
          type: 'feature',
          value: feature,
          confidence: 0.7,
          metadata: { source: 'system_context' }
        });
      });
    }

    return entities;
  }

  private extractConversationEntities(conversation: ConversationState): ContextEntity[] {
    const entities: ContextEntity[] = [];

    if (conversation.topic) {
      entities.push({
        type: 'topic',
        value: conversation.topic,
        confidence: 0.8,
        metadata: { source: 'conversation_context' }
      });
    }

    if (conversation.keywords) {
      conversation.keywords.forEach(keyword => {
        entities.push({
          type: 'keyword',
          value: keyword,
          confidence: 0.6,
          metadata: { source: 'conversation_context' }
        });
      });
    }

    return entities;
  }

  private extractActivityEntities(activity: any): ContextEntity[] {
    const entities: ContextEntity[] = [];

    if (activity.type) {
      entities.push({
        type: 'activity',
        value: activity.type,
        confidence: 0.8,
        metadata: { source: 'activity_context' }
      });
    }

    if (activity.resources) {
      activity.resources.forEach((resource: any) => {
        entities.push({
          type: 'resource',
          value: resource.id || resource.name,
          confidence: 0.7,
          metadata: { source: 'activity_context', resourceType: resource.type }
        });
      });
    }

    return entities;
  }

  private extractWorkspaceEntities(workspace: any): ContextEntity[] {
    const entities: ContextEntity[] = [];

    if (workspace.id) {
      entities.push({
        type: 'workspace',
        value: workspace.id,
        confidence: 0.9,
        metadata: { source: 'workspace_context' }
      });
    }

    if (workspace.projects) {
      workspace.projects.forEach((project: any) => {
        entities.push({
          type: 'project',
          value: project.id || project.name,
          confidence: 0.8,
          metadata: { source: 'workspace_context' }
        });
      });
    }

    return entities;
  }

  // =============================================================================
  // PATTERN IDENTIFICATION METHODS
  // =============================================================================

  private identifyTemporalPatterns(): ContextPattern[] {
    const patterns: ContextPattern[] = [];

    if (this.contextHistory.length < 5) {
      return patterns;
    }

    // Time-based usage patterns
    const hourlyUsage = this.analyzeHourlyUsage();
    if (hourlyUsage.variance > 0.5) {
      patterns.push({
        type: 'temporal',
        description: 'Variable usage pattern detected',
        strength: hourlyUsage.variance,
        frequency: 1.0,
        lastSeen: new Date().toISOString(),
        metadata: { hourlyDistribution: hourlyUsage.distribution }
      });
    }

    // Session length patterns
    const sessionPatterns = this.analyzeSessionPatterns();
    if (sessionPatterns.consistency > 0.7) {
      patterns.push({
        type: 'temporal',
        description: 'Consistent session length pattern',
        strength: sessionPatterns.consistency,
        frequency: sessionPatterns.frequency,
        lastSeen: new Date().toISOString(),
        metadata: { averageLength: sessionPatterns.averageLength }
      });
    }

    return patterns;
  }

  private identifyBehavioralPatterns(): ContextPattern[] {
    const patterns: ContextPattern[] = [];

    // Feature usage patterns
    const featureUsage = this.analyzeFeatureUsage();
    Object.entries(featureUsage).forEach(([feature, usage]) => {
      if (usage.frequency > 0.3) {
        patterns.push({
          type: 'behavioral',
          description: `High usage of ${feature}`,
          strength: usage.frequency,
          frequency: usage.frequency,
          lastSeen: new Date().toISOString(),
          metadata: { feature, usage }
        });
      }
    });

    // Navigation patterns
    const navigationPatterns = this.analyzeNavigationPatterns();
    navigationPatterns.forEach(pattern => {
      patterns.push({
        type: 'behavioral',
        description: `Navigation pattern: ${pattern.sequence.join(' -> ')}`,
        strength: pattern.strength,
        frequency: pattern.frequency,
        lastSeen: new Date().toISOString(),
        metadata: { sequence: pattern.sequence }
      });
    });

    return patterns;
  }

  private identifyCrossGroupPatterns(): ContextPattern[] {
    const patterns: ContextPattern[] = [];

    // Cross-group correlation analysis
    const correlations = this.analyzeCrossGroupCorrelations();
    Object.entries(correlations).forEach(([groups, correlation]) => {
      if (correlation > 0.6) {
        patterns.push({
          type: 'cross-group',
          description: `Strong correlation between ${groups}`,
          strength: correlation,
          frequency: 1.0,
          lastSeen: new Date().toISOString(),
          metadata: { groups: groups.split('-'), correlation }
        });
      }
    });

    return patterns;
  }

  // =============================================================================
  // RECOMMENDATION GENERATION METHODS
  // =============================================================================

  private generateIntentRecommendations(context: AIContext): ContextRecommendation[] {
    const recommendations: ContextRecommendation[] = [];

    // Based on current activity and intent
    if (context.currentActivity?.type === 'data-exploration') {
      recommendations.push({
        type: 'workflow',
        title: 'Create Data Pipeline',
        description: 'Based on your data exploration, consider creating an automated pipeline',
        priority: 8,
        actionable: true,
        metadata: { suggestedAction: 'create_pipeline' }
      });
    }

    if (context.conversation?.topic?.includes('compliance')) {
      recommendations.push({
        type: 'compliance',
        title: 'Review Compliance Rules',
        description: 'Check latest compliance requirements for your data',
        priority: 9,
        actionable: true,
        metadata: { suggestedAction: 'review_compliance' }
      });
    }

    return recommendations;
  }

  private generateEntityRecommendations(entities: ContextEntity[]): ContextRecommendation[] {
    const recommendations: ContextRecommendation[] = [];

    // Group-based recommendations
    const groups = entities.filter(e => e.type === 'group').map(e => e.value);
    if (groups.includes('data-sources') && groups.includes('classifications')) {
      recommendations.push({
        type: 'integration',
        title: 'Link Data Sources to Classifications',
        description: 'Improve data governance by linking your data sources to classification rules',
        priority: 7,
        actionable: true,
        metadata: { suggestedAction: 'link_sources_classifications' }
      });
    }

    return recommendations;
  }

  private generatePatternRecommendations(patterns: ContextPattern[]): ContextRecommendation[] {
    const recommendations: ContextRecommendation[] = [];

    // Pattern-based optimization recommendations
    const highUsagePatterns = patterns.filter(p => p.strength > 0.8);
    highUsagePatterns.forEach(pattern => {
      if (pattern.type === 'behavioral' && pattern.description.includes('High usage')) {
        recommendations.push({
          type: 'optimization',
          title: 'Optimize Frequent Workflow',
          description: `Consider creating shortcuts for your frequently used ${pattern.metadata.feature} workflow`,
          priority: 6,
          actionable: true,
          metadata: { pattern: pattern.description }
        });
      }
    });

    return recommendations;
  }

  private generateCrossGroupRecommendations(context: AIContext): ContextRecommendation[] {
    const recommendations: ContextRecommendation[] = [];

    // Cross-group integration opportunities
    if (context.workspace?.projects) {
      const projectTypes = context.workspace.projects.map((p: any) => p.type);
      if (projectTypes.includes('data-catalog') && projectTypes.includes('compliance')) {
        recommendations.push({
          type: 'integration',
          title: 'Integrate Catalog with Compliance',
          description: 'Link your data catalog entries with compliance policies for better governance',
          priority: 8,
          actionable: true,
          metadata: { suggestedAction: 'integrate_catalog_compliance' }
        });
      }
    }

    return recommendations;
  }

  // =============================================================================
  // ANALYSIS UTILITY METHODS
  // =============================================================================

  private analyzeHourlyUsage(): { variance: number; distribution: number[] } {
    const hourlyDistribution = new Array(24).fill(0);
    
    this.contextHistory.forEach(context => {
      if (context.timestamp) {
        const hour = new Date(context.timestamp).getHours();
        hourlyDistribution[hour]++;
      }
    });

    const mean = hourlyDistribution.reduce((sum, count) => sum + count, 0) / 24;
    const variance = hourlyDistribution.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / 24;

    return {
      variance: variance / mean || 0,
      distribution: hourlyDistribution
    };
  }

  private analyzeSessionPatterns(): { consistency: number; frequency: number; averageLength: number } {
    // Simplified session analysis
    const sessionLengths: number[] = [];
    
    // Group contexts by session (simplified)
    let currentSessionLength = 0;
    let lastTimestamp: Date | null = null;

    this.contextHistory.forEach(context => {
      if (context.timestamp) {
        const timestamp = new Date(context.timestamp);
        if (lastTimestamp && timestamp.getTime() - lastTimestamp.getTime() > 30 * 60 * 1000) {
          // New session (gap > 30 minutes)
          if (currentSessionLength > 0) {
            sessionLengths.push(currentSessionLength);
          }
          currentSessionLength = 1;
        } else {
          currentSessionLength++;
        }
        lastTimestamp = timestamp;
      }
    });

    if (currentSessionLength > 0) {
      sessionLengths.push(currentSessionLength);
    }

    const averageLength = sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length || 0;
    const variance = sessionLengths.reduce((sum, length) => sum + Math.pow(length - averageLength, 2), 0) / sessionLengths.length || 0;
    const consistency = Math.max(0, 1 - (variance / averageLength));

    return {
      consistency,
      frequency: sessionLengths.length / Math.max(1, this.contextHistory.length / 10),
      averageLength
    };
  }

  private analyzeFeatureUsage(): Record<string, { frequency: number; lastUsed: string }> {
    const featureUsage: Record<string, { count: number; lastUsed: string }> = {};

    this.contextHistory.forEach(context => {
      if (context.system?.activeFeatures) {
        context.system.activeFeatures.forEach(feature => {
          if (!featureUsage[feature]) {
            featureUsage[feature] = { count: 0, lastUsed: '' };
          }
          featureUsage[feature].count++;
          featureUsage[feature].lastUsed = context.timestamp || new Date().toISOString();
        });
      }
    });

    const totalContexts = this.contextHistory.length;
    const result: Record<string, { frequency: number; lastUsed: string }> = {};

    Object.entries(featureUsage).forEach(([feature, usage]) => {
      result[feature] = {
        frequency: usage.count / totalContexts,
        lastUsed: usage.lastUsed
      };
    });

    return result;
  }

  private analyzeNavigationPatterns(): Array<{ sequence: string[]; strength: number; frequency: number }> {
    const patterns: Array<{ sequence: string[]; strength: number; frequency: number }> = [];

    // Simplified navigation pattern analysis
    const sequences: string[][] = [];
    let currentSequence: string[] = [];

    this.contextHistory.forEach(context => {
      if (context.system?.currentView) {
        currentSequence.push(context.system.currentView);
        if (currentSequence.length > 5) {
          sequences.push([...currentSequence]);
          currentSequence = currentSequence.slice(-2); // Keep last 2 for continuity
        }
      }
    });

    // Find common subsequences
    const subsequenceCount: Record<string, number> = {};
    sequences.forEach(sequence => {
      for (let i = 0; i < sequence.length - 1; i++) {
        for (let j = i + 2; j <= Math.min(i + 4, sequence.length); j++) {
          const subseq = sequence.slice(i, j);
          const key = subseq.join('->');
          subsequenceCount[key] = (subsequenceCount[key] || 0) + 1;
        }
      }
    });

    Object.entries(subsequenceCount).forEach(([key, count]) => {
      if (count > 2) {
        patterns.push({
          sequence: key.split('->'),
          strength: count / sequences.length,
          frequency: count / this.contextHistory.length
        });
      }
    });

    return patterns.sort((a, b) => b.strength - a.strength).slice(0, 10);
  }

  private analyzeCrossGroupCorrelations(): Record<string, number> {
    const correlations: Record<string, number> = {};

    // Simplified correlation analysis
    const groupUsage: Record<string, number[]> = {};

    this.contextHistory.forEach((context, index) => {
      if (context.user?.groups) {
        context.user.groups.forEach(group => {
          if (!groupUsage[group]) {
            groupUsage[group] = new Array(this.contextHistory.length).fill(0);
          }
          groupUsage[group][index] = 1;
        });
      }
    });

    const groups = Object.keys(groupUsage);
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const group1 = groups[i];
        const group2 = groups[j];
        const correlation = this.calculateCorrelation(groupUsage[group1], groupUsage[group2]);
        correlations[`${group1}-${group2}`] = correlation;
      }
    }

    return correlations;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateConfidence(
    entities: ContextEntity[],
    intents: { primary: string; secondary: string[] },
    patterns: ContextPattern[]
  ): number {
    let confidence = 0;

    // Entity confidence contribution (30%)
    const avgEntityConfidence = entities.reduce((sum, entity) => sum + entity.confidence, 0) / Math.max(1, entities.length);
    confidence += avgEntityConfidence * 0.3;

    // Intent confidence contribution (40%)
    const intentConfidence = intents.primary !== 'unknown' ? 0.8 : 0.2;
    confidence += intentConfidence * 0.4;

    // Pattern confidence contribution (30%)
    const avgPatternStrength = patterns.reduce((sum, pattern) => sum + pattern.strength, 0) / Math.max(1, patterns.length);
    confidence += avgPatternStrength * 0.3;

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private deduplicateEntities(entities: ContextEntity[]): ContextEntity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.type}:${entity.value}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // =============================================================================
  // INITIALIZATION METHODS
  // =============================================================================

  private initializeExtractors(): void {
    // Register default entity extractors
    this.entityExtractors.set('text', (text: string) => {
      // Simple text entity extraction
      const entities: ContextEntity[] = [];
      
      // Extract email addresses
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const emails = text.match(emailRegex) || [];
      emails.forEach(email => {
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.9,
          metadata: { source: 'regex' }
        });
      });

      // Extract URLs
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = text.match(urlRegex) || [];
      urls.forEach(url => {
        entities.push({
          type: 'url',
          value: url,
          confidence: 0.9,
          metadata: { source: 'regex' }
        });
      });

      return entities;
    });
  }

  private initializeClassifiers(): void {
    // Register default intent classifiers
    this.intentClassifiers.set('keyword-based', (context: AIContext) => {
      const keywords = context.conversation?.keywords || [];
      
      if (keywords.some(k => ['create', 'build', 'generate'].includes(k.toLowerCase()))) {
        return 'create';
      }
      if (keywords.some(k => ['analyze', 'examine', 'review'].includes(k.toLowerCase()))) {
        return 'analyze';
      }
      if (keywords.some(k => ['help', 'assist', 'guide'].includes(k.toLowerCase()))) {
        return 'help';
      }
      if (keywords.some(k => ['search', 'find', 'lookup'].includes(k.toLowerCase()))) {
        return 'search';
      }
      
      return 'unknown';
    });

    this.intentClassifiers.set('activity-based', (context: AIContext) => {
      const activityType = context.currentActivity?.type;
      
      if (activityType?.includes('data')) {
        return 'data-management';
      }
      if (activityType?.includes('compliance')) {
        return 'compliance';
      }
      if (activityType?.includes('workflow')) {
        return 'workflow-management';
      }
      
      return 'general';
    });
  }

  private initializeAnomalyDetectors(): void {
    // Register default anomaly detectors
    this.anomalyDetectors.set('usage-pattern', (context: AIContext) => {
      const anomalies: ContextAnomaly[] = [];
      
      // Detect unusual time patterns
      if (context.timestamp) {
        const hour = new Date(context.timestamp).getHours();
        if (hour < 6 || hour > 22) {
          anomalies.push({
            type: 'temporal',
            description: 'Unusual usage time detected',
            severity: 'low',
            confidence: 0.7,
            detectedAt: new Date().toISOString(),
            metadata: { hour, timestamp: context.timestamp }
          });
        }
      }
      
      return anomalies;
    });

    this.anomalyDetectors.set('context-consistency', (context: AIContext) => {
      const anomalies: ContextAnomaly[] = [];
      
      // Detect context inconsistencies
      if (context.user && context.system) {
        const userGroups = context.user.groups || [];
        const currentView = context.system.currentView;
        
        // Check if user is accessing a view they don't typically have access to
        if (currentView && userGroups.length > 0) {
          const hasAccess = userGroups.some(group => 
            currentView.toLowerCase().includes(group.toLowerCase())
          );
          
          if (!hasAccess) {
            anomalies.push({
              type: 'access',
              description: 'User accessing unusual view for their role',
              severity: 'medium',
              confidence: 0.6,
              detectedAt: new Date().toISOString(),
              metadata: { userGroups, currentView }
            });
          }
        }
      }
      
      return anomalies;
    });
  }

  // =============================================================================
  // PUBLIC UTILITY METHODS
  // =============================================================================

  /**
   * Add a custom entity extractor
   */
  addEntityExtractor(name: string, extractor: (text: string) => ContextEntity[]): void {
    this.entityExtractors.set(name, extractor);
  }

  /**
   * Add a custom intent classifier
   */
  addIntentClassifier(name: string, classifier: (context: AIContext) => string): void {
    this.intentClassifiers.set(name, classifier);
  }

  /**
   * Add a custom anomaly detector
   */
  addAnomalyDetector(name: string, detector: (context: AIContext) => ContextAnomaly[]): void {
    this.anomalyDetectors.set(name, detector);
  }

  /**
   * Get context history
   */
  getContextHistory(limit?: number): AIContext[] {
    return limit ? this.contextHistory.slice(-limit) : [...this.contextHistory];
  }

  /**
   * Clear context history
   */
  clearContextHistory(): void {
    this.contextHistory = [];
    this.patternCache.clear();
  }

  /**
   * Get cached patterns
   */
  getCachedPatterns(): ContextPattern[] {
    return Array.from(this.patternCache.values());
  }
}

// Export singleton instance
export const contextAnalyzer = new ContextAnalyzer();

// Export utility functions
export const analyzeContext = (context: AIContext) => contextAnalyzer.analyzeContext(context);
export const getContextHistory = (limit?: number) => contextAnalyzer.getContextHistory(limit);
export const clearContextHistory = () => contextAnalyzer.clearContextHistory();