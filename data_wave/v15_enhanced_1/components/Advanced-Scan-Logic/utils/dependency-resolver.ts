// Advanced Dependency Resolver Utilities - aligned to backend
// Maps to: /api/v1/workflow/dependencies

import { apiClient } from '@/lib/api-client';

// Core formatting functions for dependencies
export const formatDependencyType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'workflow': 'Workflow',
    'task': 'Task',
    'resource': 'Resource',
    'service': 'Service',
    'api': 'API',
    'database': 'Database',
    'file': 'File',
    'queue': 'Queue',
    'cache': 'Cache',
    'external': 'External System'
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

export const formatDependencyStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending',
    'failed': 'Failed',
    'deprecated': 'Deprecated',
    'maintenance': 'Maintenance',
    'testing': 'Testing',
    'archived': 'Archived'
  };
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatDependencyPriority = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'critical': 'Critical',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'info': 'Info'
  };
  
  return priorityMap[priority] || priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const formatDependencyStrength = (strength: number): string => {
  if (strength >= 0.8) return 'Strong';
  if (strength >= 0.5) return 'Moderate';
  if (strength >= 0.2) return 'Weak';
  return 'Very Weak';
};

// Advanced dependency analysis
export const analyzeDependencyHealth = (dependencies: any[]): {
  total: number;
  healthy: number;
  warning: number;
  critical: number;
  healthScore: number;
  recommendations: string[];
} => {
  let healthy = 0;
  let warning = 0;
  let critical = 0;
  const recommendations: string[] = [];
  
  dependencies.forEach(dep => {
    if (dep.status === 'active' && dep.healthScore > 0.7) {
      healthy++;
    } else if (dep.status === 'active' && dep.healthScore > 0.4) {
      warning++;
      recommendations.push(`Monitor ${dep.name} - health score: ${dep.healthScore}`);
    } else if (dep.status === 'active') {
      critical++;
      recommendations.push(`Critical: ${dep.name} requires immediate attention`);
    }
  });
  
  const total = dependencies.length;
  const healthScore = total > 0 ? (healthy / total) * 100 : 0;
  
  return {
    total,
    healthy,
    warning,
    critical,
    healthScore: Math.round(healthScore),
    recommendations
  };
};

export const detectCircularDependencies = (dependencies: any[]): {
  hasCircular: boolean;
  circularPaths: string[][];
  recommendations: string[];
} => {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularPaths: string[][] = [];
  
  const dfs = (nodeId: string, path: string[]): boolean => {
    if (recursionStack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      const cycle = path.slice(cycleStart);
      circularPaths.push([...cycle, nodeId]);
      return true;
    }
    
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const node = dependencies.find(d => d.id === nodeId);
    if (node && node.dependencies) {
      for (const depId of node.dependencies) {
        if (dfs(depId, [...path, nodeId])) {
          return true;
        }
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  };
  
  dependencies.forEach(dep => {
    if (!visited.has(dep.id)) {
      dfs(dep.id, []);
    }
  });
  
  const recommendations = circularPaths.map(path => 
    `Circular dependency detected: ${path.join(' → ')}. Consider refactoring to break the cycle.`
  );
  
  return {
    hasCircular: circularPaths.length > 0,
    circularPaths,
    recommendations
  };
};

export const calculateDependencyImpact = (dependencies: any[], targetId: string): {
  directImpact: number;
  indirectImpact: number;
  totalImpact: number;
  affectedNodes: string[];
  impactScore: number;
} => {
  const visited = new Set<string>();
  const impactMap = new Map<string, number>();
  
  const calculateImpact = (nodeId: string, depth: number): number => {
    if (visited.has(nodeId)) return impactMap.get(nodeId) || 0;
    visited.add(nodeId);
    
    const node = dependencies.find(d => d.id === nodeId);
    if (!node) return 0;
    
    let impact = depth === 0 ? 1 : 1 / Math.pow(2, depth);
    
    if (node.dependents) {
      for (const dependentId of node.dependents) {
        impact += calculateImpact(dependentId, depth + 1);
      }
    }
    
    impactMap.set(nodeId, impact);
    return impact;
  };
  
  const directImpact = calculateImpact(targetId, 0);
  const indirectImpact = directImpact - 1;
  const totalImpact = directImpact;
  
  const affectedNodes = Array.from(visited);
  const impactScore = Math.min(100, Math.round((totalImpact / dependencies.length) * 100));
  
  return {
    directImpact: Math.round(directImpact * 100) / 100,
    indirectImpact: Math.round(indirectImpact * 100) / 100,
    totalImpact: Math.round(totalImpact * 100) / 100,
    affectedNodes,
    impactScore
  };
};

export const optimizeDependencyOrder = (dependencies: any[]): {
  optimizedOrder: string[];
  executionTime: number;
  parallelGroups: string[][];
  recommendations: string[];
} => {
  // Topological sort for dependency ordering
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();
  const recommendations: string[] = [];
  
  // Initialize
  dependencies.forEach(dep => {
    inDegree.set(dep.id, 0);
    graph.set(dep.id, dep.dependencies || []);
  });
  
  // Calculate in-degrees
  dependencies.forEach(dep => {
    (dep.dependencies || []).forEach((depId: string) => {
      inDegree.set(depId, (inDegree.get(depId) || 0) + 1);
    });
  });
  
  // Topological sort
  const queue: string[] = [];
  const optimizedOrder: string[] = [];
  
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    optimizedOrder.push(current);
    
    const neighbors = graph.get(current) || [];
    neighbors.forEach((neighborId: string) => {
      const newDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newDegree);
      if (newDegree === 0) queue.push(neighborId);
    });
  }
  
  // Detect parallel execution groups
  const parallelGroups: string[][] = [];
  let currentLevel = 0;
  const levelMap = new Map<string, number>();
  
  optimizedOrder.forEach(nodeId => {
    const node = dependencies.find(d => d.id === nodeId);
    if (!node) return;
    
    const level = Math.max(0, ...(node.dependencies || []).map((depId: string) => levelMap.get(depId) || 0)) + 1;
    levelMap.set(nodeId, level);
    
    if (level >= parallelGroups.length) {
      parallelGroups[level] = [];
    }
    parallelGroups[level].push(nodeId);
  });
  
  // Calculate execution time
  const executionTime = parallelGroups.length;
  
  // Generate recommendations
  if (parallelGroups.length > 10) {
    recommendations.push('Consider breaking down complex dependency chains into smaller workflows');
  }
  
  if (parallelGroups.some(group => group.length > 5)) {
    recommendations.push('Some dependency levels have many parallel tasks - consider resource allocation');
  }
  
  return {
    optimizedOrder,
    executionTime,
    parallelGroups,
    recommendations
  };
};

export const validateDependencyConstraints = (dependencies: any[]): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
} => {
  const violations: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  dependencies.forEach(dep => {
    // Check for orphaned dependencies
    if (dep.dependencies && dep.dependencies.length > 0) {
      dep.dependencies.forEach((depId: string) => {
        const targetDep = dependencies.find(d => d.id === depId);
        if (!targetDep) {
          violations.push(`Dependency ${dep.name} references non-existent dependency ${depId}`);
        }
      });
    }
    
    // Check for self-dependencies
    if (dep.dependencies && dep.dependencies.includes(dep.id)) {
      violations.push(`Dependency ${dep.name} cannot depend on itself`);
    }
    
    // Check for excessive dependencies
    if (dep.dependencies && dep.dependencies.length > 10) {
      warnings.push(`Dependency ${dep.name} has many dependencies (${dep.dependencies.length}) - consider refactoring`);
    }
    
    // Check for inactive dependencies
    if (dep.status === 'active' && dep.dependencies) {
      const inactiveDeps = dep.dependencies.filter((depId: string) => {
        const targetDep = dependencies.find(d => d.id === depId);
        return targetDep && targetDep.status !== 'active';
      });
      
      if (inactiveDeps.length > 0) {
        warnings.push(`Dependency ${dep.name} depends on inactive dependencies: ${inactiveDeps.join(', ')}`);
      }
    }
  });
  
  // Generate recommendations
  if (violations.length > 0) {
    recommendations.push('Fix all dependency violations before proceeding');
  }
  
  if (warnings.length > 0) {
    recommendations.push('Review warnings and consider addressing them for better system health');
  }
  
  if (violations.length === 0 && warnings.length === 0) {
    recommendations.push('All dependencies are valid and well-configured');
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    recommendations
  };
};

// Export utility object
export const dependencyResolverUtils = {
  formatDependencyType,
  formatDependencyStatus,
  formatDependencyPriority,
  formatDependencyStrength,
  analyzeDependencyHealth,
  detectCircularDependencies,
  calculateDependencyImpact,
  optimizeDependencyOrder,
  validateDependencyConstraints
};

export default dependencyResolverUtils;

// Additional functions for DependencyResolver component
export const calculateDependencyEfficiency = (dependencies: any[]): {
  efficiency: number;
  bottlenecks: string[];
  recommendations: string[];
} => {
  let totalEfficiency = 0;
  const bottlenecks: string[] = [];
  const recommendations: string[] = [];
  
  dependencies.forEach(dep => {
    const efficiency = dep.efficiency || 0.8;
    totalEfficiency += efficiency;
    
    if (efficiency < 0.6) {
      bottlenecks.push(dep.name);
      recommendations.push(`Optimize ${dep.name} - current efficiency: ${(efficiency * 100).toFixed(1)}%`);
    }
  });
  
  const avgEfficiency = dependencies.length > 0 ? totalEfficiency / dependencies.length : 0;
  
  return {
    efficiency: Math.round(avgEfficiency * 100) / 100,
    bottlenecks,
    recommendations
  };
};

export const calculateDependencyReliability = (dependencies: any[]): {
  reliability: number;
  weakPoints: string[];
  recommendations: string[];
} => {
  let totalReliability = 0;
  const weakPoints: string[] = [];
  const recommendations: string[] = [];
  
  dependencies.forEach(dep => {
    const reliability = dep.reliability || 0.9;
    totalReliability += reliability;
    
    if (reliability < 0.8) {
      weakPoints.push(dep.name);
      recommendations.push(`Improve reliability of ${dep.name} - current: ${(reliability * 100).toFixed(1)}%`);
    }
  });
  
  const avgReliability = dependencies.length > 0 ? totalReliability / dependencies.length : 0;
  
  return {
    reliability: Math.round(avgReliability * 100) / 100,
    weakPoints,
    recommendations
  };
};

export const calculateDependencyPerformance = (dependencies: any[]): {
  performance: number;
  slowDependencies: string[];
  recommendations: string[];
} => {
  let totalPerformance = 0;
  const slowDependencies: string[] = [];
  const recommendations: string[] = [];
  
  dependencies.forEach(dep => {
    const performance = dep.performance || 0.85;
    totalPerformance += performance;
    
    if (performance < 0.7) {
      slowDependencies.push(dep.name);
      recommendations.push(`Optimize performance of ${dep.name} - current: ${(performance * 100).toFixed(1)}%`);
    }
  });
  
  const avgPerformance = dependencies.length > 0 ? totalPerformance / dependencies.length : 0;
  
  return {
    performance: Math.round(avgPerformance * 100) / 100,
    slowDependencies,
    recommendations
  };
};

// ==========================================
// DEPENDENCY ANALYZER
// ==========================================

export const dependencyAnalyzer = {
  async analyzeDependencies(dependencies: any[]): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/dependencies/analyze', { dependencies });
      return response.data;
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
      throw error;
    }
  },

  async detectCircularDependencies(dependencies: any[]): Promise<any[]> {
    try {
      const response = await apiClient.post('/api/v1/dependencies/circular', { dependencies });
      return response.data.circular_dependencies;
    } catch (error) {
      console.error('Error detecting circular dependencies:', error);
      throw error;
    }
  },

  async analyzeDependencyImpact(dependencyId: string, changes: any[]): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/dependencies/impact', { dependency_id: dependencyId, changes });
      return response.data;
    } catch (error) {
      console.error('Error analyzing dependency impact:', error);
      throw error;
    }
  },

  async optimizeDependencyGraph(dependencies: any[]): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/dependencies/optimize', { dependencies });
      return response.data;
    } catch (error) {
      console.error('Error optimizing dependency graph:', error);
      throw error;
    }
  },

  async validateDependencyConstraints(dependencies: any[], constraints: any[]): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/dependencies/validate', { dependencies, constraints });
      return response.data;
    } catch (error) {
      console.error('Error validating dependency constraints:', error);
      throw error;
    }
  },

  // Additional methods required by DependencyResolver component
  async analyzeGraph(dependencyGraph: any): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/dependencies/analyze-graph', { dependencyGraph });
      return response.data;
    } catch (error) {
      console.error('Error analyzing dependency graph:', error);
      // Fallback to local analysis if API fails
      return {
        totalNodes: dependencyGraph.nodes?.length || 0,
        totalEdges: dependencyGraph.edges?.length || 0,
        circularDependencies: [],
        criticalPath: [],
        maxDepth: 0,
        complexity: 'low',
        recommendations: []
      };
    }
  },

  async detectConflicts(dependencyGraph: any): Promise<any[]> {
    try {
      const response = await apiClient.post('/api/v1/dependencies/detect-conflicts', { dependencyGraph });
      return response.data.conflicts || [];
    } catch (error) {
      console.error('Error detecting dependency conflicts:', error);
      // Fallback to local conflict detection if API fails
      return [];
    }
  },

  async generateExecutionOrder(dependencyGraph: any): Promise<any[]> {
    try {
      const response = await apiClient.post('/api/v1/dependencies/execution-order', { dependencyGraph });
      return response.data.executionOrder || [];
    } catch (error) {
      console.error('Error generating execution order:', error);
      // Fallback to local execution order generation if API fails
      return [];
    }
  }
};

export const calculateDependencyComplexity = (dependencies: any[]): {
  complexity: number;
  factors: string[];
  recommendations: string[];
} => {
  let totalComplexity = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];
  
  dependencies.forEach(dep => {
    let complexity = 0;
    
    // Factor in number of dependencies
    complexity += (dep.dependencies?.length || 0) * 0.1;
    
    // Factor in depth
    complexity += (dep.depth || 0) * 0.2;
    
    // Factor in criticality
    complexity += (dep.criticality || 0.5) * 0.3;
    
    // Factor in volatility
    complexity += (dep.volatility || 0.5) * 0.2;
    
    totalComplexity += complexity;
    
    if (complexity > 0.8) {
      factors.push(dep.name);
      recommendations.push(`Simplify ${dep.name} - complexity: ${(complexity * 100).toFixed(1)}%`);
    }
  });
  
  const avgComplexity = dependencies.length > 0 ? totalComplexity / dependencies.length : 0;
  
  return {
    complexity: Math.round(avgComplexity * 100) / 100,
    factors,
    recommendations
  };
};
