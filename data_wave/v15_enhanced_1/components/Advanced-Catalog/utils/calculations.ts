// ============================================================================
// CALCULATIONS UTILITY - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Statistical and data analysis calculations for the Advanced Catalog
// ============================================================================

// ============================================================================
// STATISTICAL CALCULATIONS
// ============================================================================

/**
 * Calculate mean/average
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Calculate median
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate mode (most frequent value)
 */
export function mode(values: number[]): number | null {
  if (values.length === 0) return null;
  
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let modeValue: number | null = null;
  
  values.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      modeValue = value;
    }
  });
  
  return modeValue;
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = mean(values);
  const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquaredDiff = mean(squaredDiffs);
  
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate variance
 */
export function variance(values: number[]): number {
  const stdDev = standardDeviation(values);
  return Math.pow(stdDev, 2);
}

/**
 * Calculate percentile
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (p < 0 || p > 100) throw new Error('Percentile must be between 0 and 100');
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  
  if (Math.floor(index) === index) {
    return sorted[index];
  }
  
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate quartiles
 */
export function quartiles(values: number[]): { q1: number; q2: number; q3: number } {
  return {
    q1: percentile(values, 25),
    q2: percentile(values, 50), // median
    q3: percentile(values, 75)
  };
}

/**
 * Calculate interquartile range (IQR)
 */
export function interquartileRange(values: number[]): number {
  const { q1, q3 } = quartiles(values);
  return q3 - q1;
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(values: number[]): { outliers: number[]; bounds: { lower: number; upper: number } } {
  const { q1, q3 } = quartiles(values);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = values.filter(value => value < lowerBound || value > upperBound);
  
  return {
    outliers,
    bounds: { lower: lowerBound, upper: upperBound }
  };
}

// ============================================================================
// DATA QUALITY CALCULATIONS
// ============================================================================

/**
 * Calculate completeness score
 */
export function calculateCompleteness(totalRecords: number, nonNullRecords: number): number {
  if (totalRecords === 0) return 0;
  return nonNullRecords / totalRecords;
}

/**
 * Calculate uniqueness score
 */
export function calculateUniqueness(totalRecords: number, uniqueRecords: number): number {
  if (totalRecords === 0) return 0;
  return uniqueRecords / totalRecords;
}

/**
 * Calculate validity score based on pattern matching
 */
export function calculateValidity(totalRecords: number, validRecords: number): number {
  if (totalRecords === 0) return 0;
  return validRecords / totalRecords;
}

/**
 * Calculate accuracy score based on reference data
 */
export function calculateAccuracy(totalRecords: number, accurateRecords: number): number {
  if (totalRecords === 0) return 0;
  return accurateRecords / totalRecords;
}

/**
 * Calculate consistency score across datasets
 */
export function calculateConsistency(matchingRecords: number, totalRecords: number): number {
  if (totalRecords === 0) return 0;
  return matchingRecords / totalRecords;
}

/**
 * Calculate overall data quality score
 */
export function calculateDataQualityScore(
  completeness: number,
  uniqueness: number,
  validity: number,
  accuracy: number,
  consistency: number,
  weights: { completeness: number; uniqueness: number; validity: number; accuracy: number; consistency: number } = {
    completeness: 0.25,
    uniqueness: 0.2,
    validity: 0.2,
    accuracy: 0.2,
    consistency: 0.15
  }
): number {
  return (
    completeness * weights.completeness +
    uniqueness * weights.uniqueness +
    validity * weights.validity +
    accuracy * weights.accuracy +
    consistency * weights.consistency
  );
}

// ============================================================================
// LINEAGE CALCULATIONS
// ============================================================================

/**
 * Calculate lineage depth
 */
export function calculateLineageDepth(lineageGraph: any[]): number {
  if (!lineageGraph.length) return 0;
  
  // Simple depth calculation - would need actual graph structure
  let maxDepth = 0;
  
  function traverse(node: any, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    if (node.children) {
      node.children.forEach((child: any) => traverse(child, depth + 1));
    }
  }
  
  lineageGraph.forEach(node => traverse(node, 1));
  return maxDepth;
}

/**
 * Calculate lineage coverage
 */
export function calculateLineageCoverage(
  assetsWithLineage: number,
  totalAssets: number
): number {
  if (totalAssets === 0) return 0;
  return assetsWithLineage / totalAssets;
}

/**
 * Calculate lineage complexity score
 */
export function calculateLineageComplexity(
  totalConnections: number,
  totalAssets: number
): number {
  if (totalAssets === 0) return 0;
  return totalConnections / totalAssets;
}

// ============================================================================
// USAGE ANALYTICS CALCULATIONS
// ============================================================================

/**
 * Calculate usage growth rate
 */
export function calculateGrowthRate(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return currentValue > 0 ? 1 : 0;
  return (currentValue - previousValue) / previousValue;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(values: number[], windowSize: number): number[] {
  if (windowSize <= 0 || windowSize > values.length) return [];
  
  const result: number[] = [];
  
  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);
    result.push(mean(window));
  }
  
  return result;
}

/**
 * Calculate seasonal adjustment
 */
export function calculateSeasonalAdjustment(
  values: number[],
  seasonLength: number = 12
): number[] {
  if (values.length < seasonLength) return values;
  
  const seasonalFactors: number[] = [];
  
  // Calculate seasonal factors
  for (let i = 0; i < seasonLength; i++) {
    const seasonValues: number[] = [];
    for (let j = i; j < values.length; j += seasonLength) {
      seasonValues.push(values[j]);
    }
    seasonalFactors.push(mean(seasonValues));
  }
  
  const overallMean = mean(seasonalFactors);
  const adjustmentFactors = seasonalFactors.map(factor => overallMean / factor);
  
  // Apply seasonal adjustment
  return values.map((value, index) => {
    const seasonIndex = index % seasonLength;
    return value * adjustmentFactors[seasonIndex];
  });
}

/**
 * Calculate trend
 */
export function calculateTrend(values: number[]): { slope: number; intercept: number; r2: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  
  const x = Array.from({ length: n }, (_, i) => i);
  const xMean = mean(x);
  const yMean = mean(values);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (values[i] - yMean);
    denominator += Math.pow(x[i] - xMean, 2);
  }
  
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;
  
  // Calculate R-squared
  let ssRes = 0;
  let ssTot = 0;
  
  for (let i = 0; i < n; i++) {
    const predicted = slope * x[i] + intercept;
    ssRes += Math.pow(values[i] - predicted, 2);
    ssTot += Math.pow(values[i] - yMean, 2);
  }
  
  const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);
  
  return { slope, intercept, r2 };
}

// ============================================================================
// PERFORMANCE CALCULATIONS
// ============================================================================

/**
 * Calculate confidence interval
 */
export function calculateConfidenceInterval(
  values: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number; mean: number } {
  const n = values.length;
  const sampleMean = mean(values);
  const sampleStd = standardDeviation(values);
  
  // Using t-distribution approximation for normal distribution
  const alpha = 1 - confidenceLevel;
  const tValue = 1.96; // Approximation for 95% confidence level
  
  const marginOfError = tValue * (sampleStd / Math.sqrt(n));
  
  return {
    mean: sampleMean,
    lower: sampleMean - marginOfError,
    upper: sampleMean + marginOfError
  };
}

/**
 * Calculate correlation coefficient
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const xMean = mean(x);
  const yMean = mean(y);
  
  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }
  
  const denominator = Math.sqrt(xDenominator * yDenominator);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate prediction accuracy metrics
 */
export function calculatePredictionMetrics(
  actual: number[],
  predicted: number[]
): {
  mae: number; // Mean Absolute Error
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error
} {
  if (actual.length !== predicted.length || actual.length === 0) {
    return { mae: 0, mse: 0, rmse: 0, mape: 0 };
  }
  
  const n = actual.length;
  let mae = 0;
  let mse = 0;
  let mape = 0;
  
  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    const absError = Math.abs(error);
    
    mae += absError;
    mse += error * error;
    
    if (actual[i] !== 0) {
      mape += Math.abs(error / actual[i]);
    }
  }
  
  mae /= n;
  mse /= n;
  mape = (mape / n) * 100;
  const rmse = Math.sqrt(mse);
  
  return { mae, mse, rmse, mape };
}

// ============================================================================
// DISTANCE & SIMILARITY CALCULATIONS
// ============================================================================

/**
 * Calculate Euclidean distance
 */
export function euclideanDistance(vector1: number[], vector2: number[]): number {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }
  
  const squaredDifferences = vector1.map((val, i) => Math.pow(val - vector2[i], 2));
  return Math.sqrt(squaredDifferences.reduce((sum, val) => sum + val, 0));
}

/**
 * Calculate cosine similarity
 */
export function cosineSimilarity(vector1: number[], vector2: number[]): number {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }
  
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Calculate Jaccard similarity
 */
export function jaccardSimilarity<T>(set1: Set<T>, set2: Set<T>): number {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}

/**
 * Calculate Levenshtein distance (string similarity)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// ============================================================================
// EXPORT DEFAULT CALCULATIONS COLLECTION
// ============================================================================

export const calculations = {
  // Statistical
  mean,
  median,
  mode,
  standardDeviation,
  variance,
  percentile,
  quartiles,
  interquartileRange,
  detectOutliers,
  
  // Data Quality
  calculateCompleteness,
  calculateUniqueness,
  calculateValidity,
  calculateAccuracy,
  calculateConsistency,
  calculateDataQualityScore,
  
  // Lineage
  calculateLineageDepth,
  calculateLineageCoverage,
  calculateLineageComplexity,
  
  // Usage Analytics
  calculateGrowthRate,
  calculateMovingAverage,
  calculateSeasonalAdjustment,
  calculateTrend,
  
  // Performance
  calculateConfidenceInterval,
  calculateCorrelation,
  calculatePredictionMetrics,
  
  // Distance & Similarity
  euclideanDistance,
  cosineSimilarity,
  jaccardSimilarity,
  levenshteinDistance
};

export default calculations;