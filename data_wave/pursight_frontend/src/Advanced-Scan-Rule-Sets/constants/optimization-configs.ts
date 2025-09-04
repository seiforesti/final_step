/**
 * Advanced Optimization Configurations for Enterprise Data Governance
 * Comprehensive settings for genetic algorithms, simulated annealing, 
 * particle swarm optimization, and machine learning approaches
 */

// =============================================================================
// GENETIC ALGORITHM CONFIGURATIONS
// =============================================================================

export const GENETIC_ALGORITHM_CONFIGS = {
  // Standard genetic algorithm configuration
  STANDARD: {
    populationSize: 100,
    generations: 50,
    crossoverRate: 0.8,
    mutationRate: 0.1,
    elitismRate: 0.1,
    selectionMethod: 'tournament' as const,
    crossoverMethod: 'uniform' as const,
    mutationMethod: 'gaussian' as const,
    convergenceThreshold: 0.001,
    maxStagnantGenerations: 10,
    diversityMaintenance: true,
    fitnessScaling: 'linear' as const,
    tournamentSize: 3,
    hybridOperators: false
  },

  // High-performance configuration for complex rules
  HIGH_PERFORMANCE: {
    populationSize: 200,
    generations: 100,
    crossoverRate: 0.85,
    mutationRate: 0.05,
    elitismRate: 0.15,
    selectionMethod: 'rank' as const,
    crossoverMethod: 'multi-point' as const,
    mutationMethod: 'adaptive' as const,
    convergenceThreshold: 0.0001,
    maxStagnantGenerations: 15,
    diversityMaintenance: true,
    fitnessScaling: 'exponential' as const,
    tournamentSize: 5,
    hybridOperators: true,
    localSearchRate: 0.1,
    nichingEnabled: true,
    crowdingFactor: 0.1
  },

  // Fast optimization for simple rules
  FAST_OPTIMIZATION: {
    populationSize: 50,
    generations: 25,
    crossoverRate: 0.75,
    mutationRate: 0.15,
    elitismRate: 0.05,
    selectionMethod: 'roulette' as const,
    crossoverMethod: 'single-point' as const,
    mutationMethod: 'uniform' as const,
    convergenceThreshold: 0.01,
    maxStagnantGenerations: 5,
    diversityMaintenance: false,
    fitnessScaling: 'none' as const,
    tournamentSize: 2,
    hybridOperators: false,
    earlyTermination: true
  },

  // Multi-objective optimization (NSGA-II)
  MULTI_OBJECTIVE: {
    populationSize: 150,
    generations: 80,
    crossoverRate: 0.9,
    mutationRate: 0.08,
    dominanceMethod: 'pareto' as const,
    crowdingDistance: true,
    diversity: 0.1,
    referencePoint: [1.0, 1.0, 1.0],
    hypervolumeCalculation: true,
    archiveSize: 100,
    distributionIndex: 20,
    adaptiveParameters: true
  },

  // Adaptive genetic algorithm
  ADAPTIVE: {
    initialPopulationSize: 80,
    maxPopulationSize: 200,
    minPopulationSize: 30,
    adaptationStrategy: 'performance-based' as const,
    parameterAdaptationRate: 0.1,
    crossoverAdaptation: true,
    mutationAdaptation: true,
    populationAdaptation: true,
    diversityThreshold: 0.05,
    performanceWindow: 10,
    adaptationFrequency: 5
  }
} as const;

// =============================================================================
// SIMULATED ANNEALING CONFIGURATIONS
// =============================================================================

export const SIMULATED_ANNEALING_CONFIGS = {
  // Standard simulated annealing
  STANDARD: {
    initialTemperature: 1000,
    finalTemperature: 0.1,
    coolingRate: 0.95,
    maxIterations: 10000,
    coolingSchedule: 'exponential' as const,
    acceptanceCriteria: 'metropolis' as const,
    reheatThreshold: 0.01,
    reheatFactor: 2.0,
    temperatureLength: 100,
    equilibriumChecks: true
  },

  // Fast cooling for quick optimization
  FAST_COOLING: {
    initialTemperature: 500,
    finalTemperature: 0.01,
    coolingRate: 0.9,
    maxIterations: 5000,
    coolingSchedule: 'linear' as const,
    acceptanceCriteria: 'threshold' as const,
    reheatThreshold: 0.001,
    reheatFactor: 1.5,
    temperatureLength: 50,
    equilibriumChecks: false,
    earlyTermination: true
  },

  // Adaptive cooling schedule
  ADAPTIVE: {
    initialTemperature: 1500,
    finalTemperature: 0.05,
    coolingRate: 0.98,
    maxIterations: 15000,
    coolingSchedule: 'adaptive' as const,
    acceptanceCriteria: 'boltzmann' as const,
    reheatThreshold: 0.005,
    reheatFactor: 3.0,
    temperatureLength: 200,
    equilibriumChecks: true,
    adaptiveCooling: true,
    performanceTracking: true,
    dynamicReheat: true,
    learningRate: 0.01,
    explorationBonus: 0.1
  },

  // Logarithmic cooling for precision
  LOGARITHMIC: {
    initialTemperature: 2000,
    finalTemperature: 0.001,
    coolingRate: 0.99,
    maxIterations: 20000,
    coolingSchedule: 'logarithmic' as const,
    acceptanceCriteria: 'metropolis' as const,
    reheatThreshold: 0.0001,
    reheatFactor: 4.0,
    temperatureLength: 300,
    equilibriumChecks: true,
    precisionFocused: true,
    convergenceTracking: true
  }
} as const;

// =============================================================================
// PARTICLE SWARM OPTIMIZATION CONFIGURATIONS
// =============================================================================

export const PARTICLE_SWARM_CONFIGS = {
  // Standard particle swarm optimization
  STANDARD: {
    swarmSize: 50,
    maxIterations: 1000,
    inertiaWeight: 0.9,
    cognitiveWeight: 2.0,
    socialWeight: 2.0,
    velocityClamp: 0.1,
    topology: 'global' as const,
    neighborhoodSize: 3,
    adaptiveParameters: false,
    constrictionFactor: 0.729
  },

  // High-performance swarm
  HIGH_PERFORMANCE: {
    swarmSize: 100,
    maxIterations: 2000,
    inertiaWeight: 0.95,
    cognitiveWeight: 2.5,
    socialWeight: 2.5,
    velocityClamp: 0.2,
    topology: 'ring' as const,
    neighborhoodSize: 5,
    adaptiveParameters: true,
    constrictionFactor: 0.729,
    diversityMaintenance: true,
    localSearchRate: 0.05,
    regenerationRate: 0.1
  },

  // Multi-swarm optimization
  MULTI_SWARM: {
    swarmCount: 3,
    swarmSize: 30,
    maxIterations: 1500,
    inertiaWeight: 0.85,
    cognitiveWeight: 1.8,
    socialWeight: 1.8,
    velocityClamp: 0.15,
    topology: 'cluster' as const,
    neighborhoodSize: 8,
    adaptiveParameters: true,
    constrictionFactor: 0.729,
    swarmCooperation: true,
    informationSharing: 'best-particle' as const,
    migrationRate: 0.1,
    migrationFrequency: 50
  },

  // Adaptive PSO
  ADAPTIVE: {
    swarmSize: 75,
    maxIterations: 1200,
    inertiaWeight: 0.9,
    cognitiveWeight: 2.0,
    socialWeight: 2.0,
    velocityClamp: 0.12,
    topology: 'adaptive' as const,
    neighborhoodSize: 4,
    adaptiveParameters: true,
    constrictionFactor: 0.729,
    inertiaAdaptation: true,
    weightAdaptation: true,
    topologyAdaptation: true,
    performanceTracking: true,
    diversityTracking: true,
    adaptationFrequency: 25
  }
} as const;

// =============================================================================
// MACHINE LEARNING OPTIMIZATION CONFIGURATIONS
// =============================================================================

export const ML_OPTIMIZATION_CONFIGS = {
  // Bayesian optimization
  BAYESIAN: {
    acquisitionFunction: 'expected-improvement' as const,
    surrogateModel: 'gaussian-process' as const,
    kernelType: 'rbf' as const,
    initialSamples: 10,
    maxIterations: 100,
    explorationWeight: 0.01,
    acquisitionOptimizer: 'l-bfgs' as const,
    gpVarianceThreshold: 1e-6,
    uncertaintyQuantification: true,
    hyperparameterOptimization: true,
    multiObjectiveAcquisition: false
  },

  // Reinforcement learning
  REINFORCEMENT_LEARNING: {
    agentType: 'dqn' as const,
    learningRate: 0.001,
    explorationRate: 0.1,
    explorationDecay: 0.995,
    discountFactor: 0.95,
    batchSize: 32,
    memorySize: 10000,
    targetUpdateFreq: 100,
    trainingSteps: 10000,
    evaluationSteps: 1000,
    networkArchitecture: [256, 128, 64],
    activationFunction: 'relu' as const,
    optimizer: 'adam' as const
  },

  // Neural architecture search
  NEURAL_ARCHITECTURE_SEARCH: {
    searchStrategy: 'evolutionary' as const,
    performanceMetric: 'accuracy' as const,
    maxSearchTime: 3600, // 1 hour
    maxTrials: 50,
    earlyStoppingPatience: 10,
    resourceConstraints: {
      maxParameters: 1000000,
      maxMemoryMB: 512,
      maxInferenceTimeMs: 100
    },
    searchSpace: {
      layers: [1, 2, 3, 4, 5],
      neurons: [32, 64, 128, 256, 512],
      activations: ['relu', 'tanh', 'sigmoid'],
      dropoutRates: [0.0, 0.1, 0.2, 0.3, 0.5]
    },
    autoML: true,
    hyperparameterOptimization: true
  },

  // Gradient-based optimization
  GRADIENT_BASED: {
    optimizer: 'adam' as const,
    learningRate: 0.01,
    momentum: 0.9,
    beta1: 0.9,
    beta2: 0.999,
    epsilon: 1e-8,
    weightDecay: 0.0001,
    gradientClipping: 1.0,
    schedulerType: 'cosine' as const,
    warmupSteps: 100,
    maxIterations: 5000,
    convergenceThreshold: 1e-6,
    linesearchType: 'strong-wolfe' as const
  }
} as const;

// =============================================================================
// HYBRID OPTIMIZATION CONFIGURATIONS
// =============================================================================

export const HYBRID_OPTIMIZATION_CONFIGS = {
  // Sequential optimization
  SEQUENTIAL: {
    algorithms: ['genetic', 'annealing', 'particle-swarm'],
    algorithmConfigs: {
      genetic: GENETIC_ALGORITHM_CONFIGS.FAST_OPTIMIZATION,
      annealing: SIMULATED_ANNEALING_CONFIGS.FAST_COOLING,
      'particle-swarm': PARTICLE_SWARM_CONFIGS.STANDARD
    },
    transitionCriteria: 'improvement-plateau' as const,
    maxStagnantIterations: 20,
    improvementThreshold: 0.001
  },

  // Parallel ensemble
  PARALLEL_ENSEMBLE: {
    algorithms: ['genetic', 'particle-swarm', 'bayesian'],
    ensembleMethod: 'weighted-average' as const,
    consensusThreshold: 0.8,
    diversityMaintenance: true,
    weightingStrategy: 'performance-based' as const,
    synchronizationFrequency: 100,
    resultAggregation: 'pareto-optimal' as const
  },

  // Adaptive hybrid
  ADAPTIVE_HYBRID: {
    initialAlgorithm: 'genetic' as const,
    switchingCriteria: 'performance-stagnation' as const,
    performanceWindow: 50,
    switchingThreshold: 0.005,
    algorithmPool: ['genetic', 'annealing', 'particle-swarm', 'bayesian'],
    selectionStrategy: 'performance-history' as const,
    adaptationRate: 0.1,
    explorationPhase: true,
    exploitationPhase: true
  },

  // Multi-level optimization
  MULTI_LEVEL: {
    levels: [
      {
        name: 'coarse',
        algorithm: 'genetic',
        config: GENETIC_ALGORITHM_CONFIGS.FAST_OPTIMIZATION,
        iterations: 25
      },
      {
        name: 'medium',
        algorithm: 'particle-swarm',
        config: PARTICLE_SWARM_CONFIGS.STANDARD,
        iterations: 50
      },
      {
        name: 'fine',
        algorithm: 'annealing',
        config: SIMULATED_ANNEALING_CONFIGS.STANDARD,
        iterations: 100
      }
    ],
    refinementStrategy: 'progressive' as const,
    qualityImprovement: 0.1,
    timeAllocation: [0.2, 0.3, 0.5]
  }
} as const;

// =============================================================================
// PERFORMANCE THRESHOLDS AND CRITERIA
// =============================================================================

export const PERFORMANCE_THRESHOLDS = {
  // Execution time thresholds (milliseconds)
  EXECUTION_TIME: {
    EXCELLENT: 100,
    GOOD: 500,
    ACCEPTABLE: 1000,
    POOR: 5000,
    CRITICAL: 10000
  },

  // Memory usage thresholds (MB)
  MEMORY_USAGE: {
    EXCELLENT: 10,
    GOOD: 50,
    ACCEPTABLE: 100,
    POOR: 500,
    CRITICAL: 1000
  },

  // CPU usage thresholds (percentage)
  CPU_USAGE: {
    EXCELLENT: 10,
    GOOD: 30,
    ACCEPTABLE: 50,
    POOR: 80,
    CRITICAL: 95
  },

  // Accuracy thresholds (percentage)
  ACCURACY: {
    EXCELLENT: 95,
    GOOD: 90,
    ACCEPTABLE: 85,
    POOR: 75,
    CRITICAL: 60
  },

  // Throughput thresholds (operations per second)
  THROUGHPUT: {
    EXCELLENT: 1000,
    GOOD: 500,
    ACCEPTABLE: 100,
    POOR: 50,
    CRITICAL: 10
  }
} as const;

// =============================================================================
// OPTIMIZATION OBJECTIVES AND WEIGHTS
// =============================================================================

export const OPTIMIZATION_OBJECTIVES = {
  // Single-objective configurations
  PERFORMANCE: {
    primary: 'execution-time' as const,
    weight: 1.0,
    direction: 'minimize' as const,
    tolerance: 0.01
  },

  ACCURACY: {
    primary: 'accuracy-score' as const,
    weight: 1.0,
    direction: 'maximize' as const,
    tolerance: 0.001
  },

  COST: {
    primary: 'resource-cost' as const,
    weight: 1.0,
    direction: 'minimize' as const,
    tolerance: 0.05
  },

  // Multi-objective configurations
  BALANCED: {
    objectives: [
      { name: 'performance', weight: 0.4, direction: 'minimize' },
      { name: 'accuracy', weight: 0.4, direction: 'maximize' },
      { name: 'cost', weight: 0.2, direction: 'minimize' }
    ],
    aggregationMethod: 'weighted-sum' as const,
    normalization: 'min-max' as const
  },

  QUALITY_FOCUSED: {
    objectives: [
      { name: 'accuracy', weight: 0.6, direction: 'maximize' },
      { name: 'reliability', weight: 0.3, direction: 'maximize' },
      { name: 'performance', weight: 0.1, direction: 'minimize' }
    ],
    aggregationMethod: 'weighted-product' as const,
    normalization: 'z-score' as const
  },

  EFFICIENCY_FOCUSED: {
    objectives: [
      { name: 'performance', weight: 0.5, direction: 'minimize' },
      { name: 'cost', weight: 0.3, direction: 'minimize' },
      { name: 'accuracy', weight: 0.2, direction: 'maximize' }
    ],
    aggregationMethod: 'tchebycheff' as const,
    normalization: 'robust' as const
  }
} as const;

// =============================================================================
// CONSTRAINT DEFINITIONS
// =============================================================================

export const OPTIMIZATION_CONSTRAINTS = {
  // Performance constraints
  PERFORMANCE: {
    maxExecutionTime: 5000, // milliseconds
    maxMemoryUsage: 200, // MB
    maxCpuUsage: 70, // percentage
    minThroughput: 100, // ops/sec
    maxLatency: 1000 // milliseconds
  },

  // Quality constraints
  QUALITY: {
    minAccuracy: 80, // percentage
    minPrecision: 75, // percentage
    minRecall: 75, // percentage
    minF1Score: 75, // percentage
    maxFalsePositiveRate: 10 // percentage
  },

  // Business constraints
  BUSINESS: {
    maxCost: 1000, // dollars
    maxComplexity: 100, // complexity score
    minMaintainability: 70, // percentage
    maxRiskScore: 30, // risk score
    minComplianceScore: 90 // percentage
  },

  // Technical constraints
  TECHNICAL: {
    maxRuleSize: 10000, // characters
    maxNestingDepth: 10, // levels
    maxDependencies: 20, // count
    minTestCoverage: 80, // percentage
    maxCyclomaticComplexity: 15 // complexity
  }
} as const;

// =============================================================================
// OPTIMIZATION STRATEGIES
// =============================================================================

export const OPTIMIZATION_STRATEGIES = {
  // Strategy definitions
  EXPLORATION_FIRST: {
    name: 'exploration-first',
    description: 'Focus on exploration in early phases',
    phases: [
      { phase: 'exploration', duration: 0.6, explorationRate: 0.8 },
      { phase: 'exploitation', duration: 0.4, explorationRate: 0.2 }
    ],
    transitionCriteria: 'time-based' as const
  },

  BALANCED: {
    name: 'balanced',
    description: 'Balance exploration and exploitation',
    phases: [
      { phase: 'balanced', duration: 1.0, explorationRate: 0.5 }
    ],
    transitionCriteria: 'none' as const
  },

  AGGRESSIVE: {
    name: 'aggressive',
    description: 'Aggressive optimization with high mutation',
    phases: [
      { phase: 'aggressive', duration: 1.0, explorationRate: 0.9 }
    ],
    transitionCriteria: 'none' as const,
    riskTolerance: 'high' as const,
    convergenceSpeed: 'fast' as const
  },

  CONSERVATIVE: {
    name: 'conservative',
    description: 'Conservative approach with gradual improvement',
    phases: [
      { phase: 'conservative', duration: 1.0, explorationRate: 0.3 }
    ],
    transitionCriteria: 'none' as const,
    riskTolerance: 'low' as const,
    convergenceSpeed: 'slow' as const
  },

  ADAPTIVE: {
    name: 'adaptive',
    description: 'Adaptive strategy based on performance',
    phases: [
      { phase: 'initial', duration: 0.3, explorationRate: 0.7 },
      { phase: 'adaptive', duration: 0.7, explorationRate: 'adaptive' }
    ],
    transitionCriteria: 'performance-based' as const,
    adaptationRate: 0.1,
    performanceWindow: 20
  }
} as const;

// =============================================================================
// TERMINATION CRITERIA
// =============================================================================

export const TERMINATION_CRITERIA = {
  // Standard termination conditions
  STANDARD: {
    maxIterations: 1000,
    maxTime: 3600, // seconds
    targetFitness: null,
    fitnessThreshold: 0.001,
    maxStagnantIterations: 50,
    improvementThreshold: 0.0001,
    diversityThreshold: 0.01
  },

  // Fast termination for quick results
  FAST: {
    maxIterations: 100,
    maxTime: 300, // seconds
    targetFitness: null,
    fitnessThreshold: 0.01,
    maxStagnantIterations: 10,
    improvementThreshold: 0.001,
    diversityThreshold: 0.05,
    earlyTermination: true
  },

  // Thorough optimization
  THOROUGH: {
    maxIterations: 5000,
    maxTime: 7200, // seconds
    targetFitness: null,
    fitnessThreshold: 0.0001,
    maxStagnantIterations: 200,
    improvementThreshold: 0.00001,
    diversityThreshold: 0.001,
    qualityAssurance: true
  },

  // Adaptive termination
  ADAPTIVE: {
    maxIterations: 2000,
    maxTime: 3600, // seconds
    targetFitness: null,
    fitnessThreshold: 'adaptive' as const,
    maxStagnantIterations: 'adaptive' as const,
    improvementThreshold: 'adaptive' as const,
    diversityThreshold: 'adaptive' as const,
    confidenceLevel: 0.95,
    statisticalSignificance: true
  }
} as const;

// =============================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// =============================================================================

export const ENVIRONMENT_CONFIGS = {
  // Development environment
  DEVELOPMENT: {
    optimizationStrategy: 'FAST',
    terminationCriteria: 'FAST',
    performanceThresholds: 'RELAXED',
    loggingLevel: 'DEBUG',
    validationLevel: 'BASIC',
    caching: true,
    parallelization: false
  },

  // Testing environment
  TESTING: {
    optimizationStrategy: 'STANDARD',
    terminationCriteria: 'STANDARD',
    performanceThresholds: 'STANDARD',
    loggingLevel: 'INFO',
    validationLevel: 'COMPREHENSIVE',
    caching: true,
    parallelization: true,
    reproducibility: true
  },

  // Production environment
  PRODUCTION: {
    optimizationStrategy: 'BALANCED',
    terminationCriteria: 'THOROUGH',
    performanceThresholds: 'STRICT',
    loggingLevel: 'WARN',
    validationLevel: 'COMPREHENSIVE',
    caching: true,
    parallelization: true,
    monitoring: true,
    alerting: true,
    backup: true
  },

  // High-performance environment
  HIGH_PERFORMANCE: {
    optimizationStrategy: 'AGGRESSIVE',
    terminationCriteria: 'ADAPTIVE',
    performanceThresholds: 'STRICT',
    loggingLevel: 'ERROR',
    validationLevel: 'MINIMAL',
    caching: true,
    parallelization: true,
    gpuAcceleration: true,
    distributedComputing: true
  }
} as const;

// =============================================================================
// EXPORT ALL CONFIGURATIONS
// =============================================================================

export const OPTIMIZATION_CONFIGS = {
  GENETIC_ALGORITHM: GENETIC_ALGORITHM_CONFIGS,
  SIMULATED_ANNEALING: SIMULATED_ANNEALING_CONFIGS,
  PARTICLE_SWARM: PARTICLE_SWARM_CONFIGS,
  MACHINE_LEARNING: ML_OPTIMIZATION_CONFIGS,
  HYBRID: HYBRID_OPTIMIZATION_CONFIGS,
  PERFORMANCE_THRESHOLDS,
  OBJECTIVES: OPTIMIZATION_OBJECTIVES,
  CONSTRAINTS: OPTIMIZATION_CONSTRAINTS,
  STRATEGIES: OPTIMIZATION_STRATEGIES,
  TERMINATION: TERMINATION_CRITERIA,
  ENVIRONMENTS: ENVIRONMENT_CONFIGS
} as const;

// Export individual configuration groups
export {
  GENETIC_ALGORITHM_CONFIGS,
  SIMULATED_ANNEALING_CONFIGS,
  PARTICLE_SWARM_CONFIGS,
  ML_OPTIMIZATION_CONFIGS,
  HYBRID_OPTIMIZATION_CONFIGS,
  PERFORMANCE_THRESHOLDS,
  OPTIMIZATION_OBJECTIVES,
  OPTIMIZATION_CONSTRAINTS,
  OPTIMIZATION_STRATEGIES,
  TERMINATION_CRITERIA,
  ENVIRONMENT_CONFIGS
};

// Default export
export default OPTIMIZATION_CONFIGS;