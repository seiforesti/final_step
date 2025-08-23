// scan-logic-utils.ts - Advanced Scan Logic Utilities for Racine Integration
// Integrates with existing Advanced-Scan-Logic SPA utilities for enhanced functionality

import type {
  ScanLogicConfig,
  ScanLogicStatus,
  ScanLogicMetrics,
  ScanLogicWorkflow,
  ScanLogicResult,
  ScanLogicOptimization,
  ScanLogicAnalytics,
  ScanLogicCoordination,
  DataSourceConfig,
  ClassificationRule,
  ComplianceRule,
  ScanRuleSet,
  WorkspaceContext,
  UserPermissions
} from '../types';

// Import existing Advanced-Scan-Logic utilities
import type { ScanOptimizationResult, ScanPerformanceMetrics } from '../types/api.types';

/**
 * Scan Logic Configuration Utilities
 */
export class ScanLogicConfigurationUtils {
  
  /**
   * Creates optimized scan configuration based on data source characteristics
   */
  static createOptimizedConfig(
    dataSource: DataSourceConfig,
    scanRules: ScanRuleSet[],
    optimization: ScanLogicOptimization
  ): ScanLogicConfig {
    const baseConfig: ScanLogicConfig = {
      id: `scan_${dataSource.id}_${Date.now()}`,
      name: `Optimized Scan for ${dataSource.name}`,
      dataSourceId: dataSource.id,
      scanRuleIds: scanRules.map(rule => rule.id),
      scanType: this.determineScanType(dataSource),
      schedule: this.generateOptimalSchedule(optimization),
      performance: this.optimizePerformanceSettings(optimization),
      security: this.generateSecuritySettings(dataSource),
      created: new Date(),
      updated: new Date(),
      createdBy: '', // Set by caller
      status: 'draft',
      isActive: false,
      workspace: dataSource.workspace
    };

    return this.applyOptimizations(baseConfig, optimization);
  }

  /**
   * Determines optimal scan type based on data source characteristics
   */
  static determineScanType(dataSource: DataSourceConfig): 'full' | 'incremental' | 'metadata' | 'sampling' {
    const { size, type, updateFrequency, complexity } = dataSource.characteristics || {};

    if (size === 'large' && updateFrequency === 'low') {
      return 'incremental';
    } else if (complexity === 'high' || type === 'structured') {
      return 'full';
    } else if (size === 'small' || type === 'metadata') {
      return 'metadata';
    } else {
      return 'sampling';
    }
  }

  /**
   * Generates optimal scan schedule based on optimization parameters
   */
  static generateOptimalSchedule(optimization: ScanLogicOptimization): ScanLogicConfig['schedule'] {
    const { priority, resourceAvailability, businessHours } = optimization;

    if (priority === 'high') {
      return {
        type: 'continuous',
        interval: 300000, // 5 minutes
        timezone: 'UTC',
        businessHoursOnly: false
      };
    } else if (priority === 'medium') {
      return {
        type: 'scheduled',
        interval: 3600000, // 1 hour
        timezone: 'UTC',
        businessHoursOnly: true,
        cron: '0 */1 * * *'
      };
    } else {
      return {
        type: 'scheduled',
        interval: 86400000, // 24 hours
        timezone: 'UTC',
        businessHoursOnly: true,
        cron: '0 2 * * *' // 2 AM daily
      };
    }
  }

  /**
   * Optimizes performance settings based on system capabilities
   */
  static optimizePerformanceSettings(optimization: ScanLogicOptimization): ScanLogicConfig['performance'] {
    return {
      parallelism: optimization.maxParallelism || 4,
      batchSize: optimization.optimalBatchSize || 1000,
      timeout: optimization.timeoutMs || 300000,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000
      },
      memoryLimit: optimization.memoryLimitMB || 512,
      cpuLimit: optimization.cpuLimitPercent || 80
    };
  }

  /**
   * Generates security settings based on data source sensitivity
   */
  static generateSecuritySettings(dataSource: DataSourceConfig): ScanLogicConfig['security'] {
    return {
      encryptInTransit: true,
      encryptAtRest: dataSource.sensitivityLevel !== 'public',
      auditLevel: dataSource.sensitivityLevel === 'highly_sensitive' ? 'detailed' : 'standard',
      maskSensitiveData: dataSource.containsPII === true,
      accessControl: {
        requiredPermissions: [`scan:${dataSource.id}`, 'scan:execute'],
        allowedRoles: dataSource.allowedRoles || ['data_analyst', 'data_scientist'],
        restrictedFields: dataSource.restrictedFields || []
      }
    };
  }

  /**
   * Applies optimization recommendations to scan configuration
   */
  static applyOptimizations(
    baseConfig: ScanLogicConfig,
    optimization: ScanLogicOptimization
  ): ScanLogicConfig {
    const optimizedConfig = { ...baseConfig };

    // Apply performance optimizations
    if (optimization.enableCaching) {
      optimizedConfig.caching = {
        enabled: true,
        ttl: optimization.cacheTTL || 3600000,
        strategy: 'intelligent'
      };
    }

    // Apply scanning optimizations
    if (optimization.enableSmartSampling) {
      optimizedConfig.sampling = {
        enabled: true,
        percentage: optimization.samplePercentage || 10,
        strategy: 'statistical'
      };
    }

    // Apply resource optimizations
    if (optimization.resourceOptimization) {
      optimizedConfig.resources = {
        autoScale: true,
        minInstances: 1,
        maxInstances: optimization.maxInstances || 5,
        targetUtilization: 70
      };
    }

    return optimizedConfig;
  }
}

/**
 * Scan Logic Monitoring and Analytics Utilities
 */
export class ScanLogicMonitoringUtils {

  /**
   * Analyzes scan performance trends
   */
  static analyzeScanTrends(scanHistory: ScanLogicResult[]): ScanLogicAnalytics {
    const trends = {
      throughputTrend: this.calculateThroughputTrend(scanHistory),
      latencyTrend: this.calculateLatencyTrend(scanHistory),
      errorRateTrend: this.calculateErrorRateTrend(scanHistory),
      resourceUsageTrend: this.calculateResourceUsageTrend(scanHistory)
    };

    const insights = this.generatePerformanceInsights(trends);
    const recommendations = this.generateOptimizationRecommendations(trends);

    return {
      trends,
      insights,
      recommendations,
      period: {
        start: new Date(Math.min(...scanHistory.map(r => r.startTime.getTime()))),
        end: new Date(Math.max(...scanHistory.map(r => r.endTime?.getTime() || Date.now())))
      },
      totalScans: scanHistory.length,
      successRate: this.calculateSuccessRate(scanHistory)
    };
  }

  /**
   * Calculates throughput trend over time
   */
  static calculateThroughputTrend(scanHistory: ScanLogicResult[]): Array<{ timestamp: Date; value: number }> {
    const timeWindows = this.groupByTimeWindows(scanHistory, 'hour');
    
    return timeWindows.map(window => ({
      timestamp: window.timestamp,
      value: window.scans.reduce((total, scan) => {
        const duration = (scan.endTime?.getTime() || Date.now()) - scan.startTime.getTime();
        return total + (scan.recordsProcessed / (duration / 1000)); // records per second
      }, 0) / window.scans.length
    }));
  }

  /**
   * Calculates latency trend over time
   */
  static calculateLatencyTrend(scanHistory: ScanLogicResult[]): Array<{ timestamp: Date; value: number }> {
    const timeWindows = this.groupByTimeWindows(scanHistory, 'hour');
    
    return timeWindows.map(window => ({
      timestamp: window.timestamp,
      value: window.scans.reduce((total, scan) => {
        const duration = (scan.endTime?.getTime() || Date.now()) - scan.startTime.getTime();
        return total + duration;
      }, 0) / window.scans.length
    }));
  }

  /**
   * Calculates error rate trend over time
   */
  static calculateErrorRateTrend(scanHistory: ScanLogicResult[]): Array<{ timestamp: Date; value: number }> {
    const timeWindows = this.groupByTimeWindows(scanHistory, 'hour');
    
    return timeWindows.map(window => ({
      timestamp: window.timestamp,
      value: (window.scans.filter(scan => scan.status === 'failed').length / window.scans.length) * 100
    }));
  }

  /**
   * Calculates resource usage trend over time
   */
  static calculateResourceUsageTrend(scanHistory: ScanLogicResult[]): Array<{ timestamp: Date; value: number }> {
    const timeWindows = this.groupByTimeWindows(scanHistory, 'hour');
    
    return timeWindows.map(window => ({
      timestamp: window.timestamp,
      value: window.scans.reduce((total, scan) => {
        return total + (scan.performance?.resourceUsage || 0);
      }, 0) / window.scans.length
    }));
  }

  /**
   * Groups scan results by time windows
   */
  static groupByTimeWindows(
    scanHistory: ScanLogicResult[],
    windowType: 'hour' | 'day' | 'week'
  ): Array<{ timestamp: Date; scans: ScanLogicResult[] }> {
    const windowSize = windowType === 'hour' ? 3600000 : windowType === 'day' ? 86400000 : 604800000;
    const windows = new Map<number, ScanLogicResult[]>();

    scanHistory.forEach(scan => {
      const windowStart = Math.floor(scan.startTime.getTime() / windowSize) * windowSize;
      if (!windows.has(windowStart)) {
        windows.set(windowStart, []);
      }
      windows.get(windowStart)!.push(scan);
    });

    return Array.from(windows.entries()).map(([timestamp, scans]) => ({
      timestamp: new Date(timestamp),
      scans
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Generates performance insights from trends
   */
  static generatePerformanceInsights(trends: any): string[] {
    const insights: string[] = [];

    // Throughput insights
    const throughputTrend = this.calculateTrendDirection(trends.throughputTrend);
    if (throughputTrend === 'decreasing') {
      insights.push('Scan throughput is decreasing over time. Consider optimization.');
    } else if (throughputTrend === 'increasing') {
      insights.push('Scan throughput is improving. Current optimizations are effective.');
    }

    // Latency insights
    const latencyTrend = this.calculateTrendDirection(trends.latencyTrend);
    if (latencyTrend === 'increasing') {
      insights.push('Scan latency is increasing. Check resource allocation and data growth.');
    }

    // Error rate insights
    const errorTrend = this.calculateTrendDirection(trends.errorRateTrend);
    if (errorTrend === 'increasing') {
      insights.push('Error rate is increasing. Review scan configurations and data quality.');
    }

    return insights;
  }

  /**
   * Generates optimization recommendations
   */
  static generateOptimizationRecommendations(trends: any): ScanLogicOptimization[] {
    const recommendations: ScanLogicOptimization[] = [];

    // Performance recommendations
    const avgLatency = trends.latencyTrend.reduce((sum: number, point: any) => sum + point.value, 0) / trends.latencyTrend.length;
    if (avgLatency > 300000) { // 5 minutes
      recommendations.push({
        type: 'performance',
        priority: 'high',
        description: 'High scan latency detected',
        optimizations: {
          enableCaching: true,
          cacheTTL: 1800000,
          enableSmartSampling: true,
          samplePercentage: 15,
          maxParallelism: 6
        }
      });
    }

    // Resource recommendations
    const avgResourceUsage = trends.resourceUsageTrend.reduce((sum: number, point: any) => sum + point.value, 0) / trends.resourceUsageTrend.length;
    if (avgResourceUsage > 80) {
      recommendations.push({
        type: 'resource',
        priority: 'medium',
        description: 'High resource usage detected',
        optimizations: {
          resourceOptimization: true,
          maxInstances: 8,
          enableAutoScale: true,
          cpuLimitPercent: 70
        }
      });
    }

    return recommendations;
  }

  /**
   * Calculates trend direction from data points
   */
  static calculateTrendDirection(dataPoints: Array<{ timestamp: Date; value: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (dataPoints.length < 2) return 'stable';

    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

    const firstAvg = firstHalf.reduce((sum, point) => sum + point.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, point) => sum + point.value, 0) / secondHalf.length;

    const changePercentage = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercentage > 5) return 'increasing';
    if (changePercentage < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculates overall success rate
   */
  static calculateSuccessRate(scanHistory: ScanLogicResult[]): number {
    if (scanHistory.length === 0) return 0;
    const successfulScans = scanHistory.filter(scan => scan.status === 'completed').length;
    return (successfulScans / scanHistory.length) * 100;
  }
}

/**
 * Scan Logic Coordination Utilities
 */
export class ScanLogicCoordinationUtils {

  /**
   * Coordinates cross-group scan workflow
   */
  static createCrossGroupCoordination(
    scanConfig: ScanLogicConfig,
    relatedGroups: string[],
    workspaceContext: WorkspaceContext
  ): ScanLogicCoordination {
    return {
      id: `coordination_${scanConfig.id}_${Date.now()}`,
      scanConfigId: scanConfig.id,
      coordinationType: 'cross_group',
      relatedGroups,
      workspaceId: workspaceContext.id,
      dependencies: this.identifyDependencies(scanConfig, relatedGroups),
      executionPlan: this.createExecutionPlan(scanConfig, relatedGroups),
      status: 'pending',
      created: new Date(),
      priority: scanConfig.priority || 'medium'
    };
  }

  /**
   * Identifies dependencies between scan groups
   */
  static identifyDependencies(
    scanConfig: ScanLogicConfig,
    relatedGroups: string[]
  ): ScanLogicCoordination['dependencies'] {
    const dependencies: ScanLogicCoordination['dependencies'] = [];

    relatedGroups.forEach(group => {
      switch (group) {
        case 'data-sources':
          dependencies.push({
            groupId: 'data-sources',
            resourceId: scanConfig.dataSourceId,
            type: 'data_source',
            condition: 'available'
          });
          break;
        case 'classifications':
          dependencies.push({
            groupId: 'classifications',
            resourceId: 'classification_rules',
            type: 'rules',
            condition: 'active'
          });
          break;
        case 'compliance-rule':
          dependencies.push({
            groupId: 'compliance-rule',
            resourceId: 'compliance_policies',
            type: 'policies',
            condition: 'enabled'
          });
          break;
        case 'scan-rule-sets':
          scanConfig.scanRuleIds.forEach(ruleId => {
            dependencies.push({
              groupId: 'scan-rule-sets',
              resourceId: ruleId,
              type: 'scan_rule',
              condition: 'validated'
            });
          });
          break;
      }
    });

    return dependencies;
  }

  /**
   * Creates execution plan for coordinated scan
   */
  static createExecutionPlan(
    scanConfig: ScanLogicConfig,
    relatedGroups: string[]
  ): ScanLogicCoordination['executionPlan'] {
    const phases: ScanLogicCoordination['executionPlan'] = [];

    // Phase 1: Preparation
    phases.push({
      phase: 1,
      name: 'Preparation',
      actions: [
        { group: 'data-sources', action: 'validate_connection', resourceId: scanConfig.dataSourceId },
        { group: 'scan-rule-sets', action: 'validate_rules', resourceId: scanConfig.scanRuleIds.join(',') }
      ],
      dependencies: [],
      estimatedDuration: 60000 // 1 minute
    });

    // Phase 2: Scanning
    phases.push({
      phase: 2,
      name: 'Data Scanning',
      actions: [
        { group: 'scan-logic', action: 'execute_scan', resourceId: scanConfig.id }
      ],
      dependencies: [1],
      estimatedDuration: scanConfig.performance?.timeout || 300000
    });

    // Phase 3: Classification (if applicable)
    if (relatedGroups.includes('classifications')) {
      phases.push({
        phase: 3,
        name: 'Data Classification',
        actions: [
          { group: 'classifications', action: 'apply_classification', resourceId: scanConfig.id }
        ],
        dependencies: [2],
        estimatedDuration: 120000 // 2 minutes
      });
    }

    // Phase 4: Compliance Check (if applicable)
    if (relatedGroups.includes('compliance-rule')) {
      phases.push({
        phase: 4,
        name: 'Compliance Validation',
        actions: [
          { group: 'compliance-rule', action: 'validate_compliance', resourceId: scanConfig.id }
        ],
        dependencies: [3],
        estimatedDuration: 90000 // 1.5 minutes
      });
    }

    // Phase 5: Cataloging
    if (relatedGroups.includes('advanced-catalog')) {
      phases.push({
        phase: 5,
        name: 'Catalog Update',
        actions: [
          { group: 'advanced-catalog', action: 'update_catalog', resourceId: scanConfig.id }
        ],
        dependencies: [4],
        estimatedDuration: 60000 // 1 minute
      });
    }

    return phases;
  }

  /**
   * Validates coordination prerequisites
   */
  static validateCoordinationPrerequisites(
    coordination: ScanLogicCoordination,
    groupStatuses: Record<string, any>
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check dependency status
    coordination.dependencies.forEach(dep => {
      const groupStatus = groupStatuses[dep.groupId];
      if (!groupStatus) {
        issues.push(`Group ${dep.groupId} is not available`);
      } else if (groupStatus.status !== dep.condition) {
        issues.push(`Resource ${dep.resourceId} in ${dep.groupId} is not ${dep.condition}`);
      }
    });

    // Check resource availability
    coordination.executionPlan.forEach(phase => {
      phase.actions.forEach(action => {
        const groupStatus = groupStatuses[action.group];
        if (!groupStatus || !groupStatus.resources[action.resourceId]) {
          issues.push(`Resource ${action.resourceId} not found in ${action.group}`);
        }
      });
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

/**
 * Scan Logic Real-time Processing Utilities
 */
export class ScanLogicRealTimeUtils {

  /**
   * Processes real-time scan updates
   */
  static processScanUpdate(
    currentScans: ScanLogicWorkflow[],
    update: any
  ): ScanLogicWorkflow[] {
    return currentScans.map(scan => {
      if (scan.id === update.scanId) {
        return {
          ...scan,
          status: update.status,
          progress: update.progress,
          lastUpdate: new Date(),
          metrics: {
            ...scan.metrics,
            ...update.metrics
          }
        };
      }
      return scan;
    });
  }

  /**
   * Extracts scan progress data
   */
  static extractScanProgress(scans: ScanLogicWorkflow[]): Record<string, number> {
    const progress: Record<string, number> = {};
    scans.forEach(scan => {
      progress[scan.id] = scan.progress || 0;
    });
    return progress;
  }

  /**
   * Extracts scan status data
   */
  static extractScanStatus(scans: ScanLogicWorkflow[]): Record<string, ScanLogicStatus> {
    const status: Record<string, ScanLogicStatus> = {};
    scans.forEach(scan => {
      status[scan.id] = scan.status;
    });
    return status;
  }

  /**
   * Groups scans by workspace
   */
  static groupScansByWorkspace(scans: ScanLogicWorkflow[]): Record<string, ScanLogicWorkflow[]> {
    const grouped: Record<string, ScanLogicWorkflow[]> = {};
    scans.forEach(scan => {
      const workspaceId = scan.workspaceId || 'default';
      if (!grouped[workspaceId]) {
        grouped[workspaceId] = [];
      }
      grouped[workspaceId].push(scan);
    });
    return grouped;
  }

  /**
   * Updates scan in list
   */
  static updateScanInList(
    scans: ScanLogicWorkflow[],
    update: any
  ): ScanLogicWorkflow[] {
    return this.processScanUpdate(scans, update);
  }

  /**
   * Filters scans by criteria
   */
  static filterScans(
    scans: ScanLogicWorkflow[],
    criteria: {
      status?: ScanLogicStatus[];
      workspaceId?: string;
      dataSourceId?: string;
      dateRange?: { start: Date; end: Date };
    }
  ): ScanLogicWorkflow[] {
    return scans.filter(scan => {
      if (criteria.status && !criteria.status.includes(scan.status)) {
        return false;
      }
      if (criteria.workspaceId && scan.workspaceId !== criteria.workspaceId) {
        return false;
      }
      if (criteria.dataSourceId && scan.dataSourceId !== criteria.dataSourceId) {
        return false;
      }
      if (criteria.dateRange) {
        const scanDate = scan.created;
        if (scanDate < criteria.dateRange.start || scanDate > criteria.dateRange.end) {
          return false;
        }
      }
      return true;
    });
  }
}

/**
 * Main export object with all scan logic utilities
 */
export const scanLogicUtils = {
  configuration: ScanLogicConfigurationUtils,
  monitoring: ScanLogicMonitoringUtils,
  coordination: ScanLogicCoordinationUtils,
  realTime: ScanLogicRealTimeUtils,

  // Convenience methods
  createOptimizedConfig: ScanLogicConfigurationUtils.createOptimizedConfig.bind(ScanLogicConfigurationUtils),
  analyzeScanTrends: ScanLogicMonitoringUtils.analyzeScanTrends.bind(ScanLogicMonitoringUtils),
  createCrossGroupCoordination: ScanLogicCoordinationUtils.createCrossGroupCoordination.bind(ScanLogicCoordinationUtils),
  processScanUpdate: ScanLogicRealTimeUtils.processScanUpdate.bind(ScanLogicRealTimeUtils),
  extractScanProgress: ScanLogicRealTimeUtils.extractScanProgress.bind(ScanLogicRealTimeUtils),
  extractScanStatus: ScanLogicRealTimeUtils.extractScanStatus.bind(ScanLogicRealTimeUtils),
  groupScansByWorkspace: ScanLogicRealTimeUtils.groupScansByWorkspace.bind(ScanLogicRealTimeUtils),
  updateScanInList: ScanLogicRealTimeUtils.updateScanInList.bind(ScanLogicRealTimeUtils),
  filterScans: ScanLogicRealTimeUtils.filterScans.bind(ScanLogicRealTimeUtils)
};

export default scanLogicUtils;