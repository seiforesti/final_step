export interface MetricPoint { timestamp: number; value: number; metric?: string }
export interface MetricTrend { direction: 'up' | 'down' | 'stable'; change: number; description?: string }

export function calculateMetricTrend(points: MetricPoint[], metricKey: string): MetricTrend {
	const series = metricKey ? points.filter(p => p.metric === metricKey) : points
	if (!series || series.length < 2) return { direction: 'stable', change: 0 }
	const recent = series.slice(-Math.min(10, series.length))
	const first = recent[0].value
	const last = recent[recent.length - 1].value
	const denom = Math.abs(first) < 1e-6 ? 1 : first
	const change = ((last - first) / denom) * 100
	const direction = Math.abs(change) < 2 ? 'stable' : change > 0 ? 'up' : 'down'
	return { direction, change: Math.round(change * 10) / 10 }
}

export function aggregateMetrics(points: MetricPoint[], method: 'avg' | 'sum' | 'min' | 'max' | 'count' = 'avg'): number {
	if (!points || points.length === 0) return 0
	switch (method) {
		case 'sum':
			return points.reduce((acc, p) => acc + p.value, 0)
		case 'min':
			return Math.min(...points.map(p => p.value))
		case 'max':
			return Math.max(...points.map(p => p.value))
		case 'count':
			return points.length
		case 'avg':
		default:
			return points.reduce((acc, p) => acc + p.value, 0) / points.length
	}
}

export function analyzePerformancePattern(points: MetricPoint[]): { pattern: 'improving' | 'degrading' | 'stable'; volatility: number } {
	const trend = calculateMetricTrend(points, '')
	const diffs = points.slice(1).map((p, i) => Math.abs(p.value - points[i].value))
	const volatility = diffs.length ? Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 100) / 100 : 0
	const pattern = trend.direction === 'up' ? 'improving' : trend.direction === 'down' ? 'degrading' : 'stable'
	return { pattern, volatility }
}

export function detectAnomalies(points: MetricPoint[], thresholdStd = 3): MetricPoint[] {
	if (points.length < 5) return []
	const values = points.map(p => p.value)
	const mean = values.reduce((a, b) => a + b, 0) / values.length
	const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
	const std = Math.sqrt(variance)
	return points.filter(p => Math.abs(p.value - mean) > thresholdStd * std)
}

export function predictMetricTrend(points: MetricPoint[], steps = 5): MetricPoint[] {
	if (points.length < 2) return []
	const n = points.length
	const xs = points.map((_, i) => i)
	const ys = points.map(p => p.value)
	const meanX = xs.reduce((a, b) => a + b, 0) / n
	const meanY = ys.reduce((a, b) => a + b, 0) / n
	const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0)
	const den = xs.reduce((acc, x) => acc + Math.pow(x - meanX, 2), 0) || 1
	const slope = num / den
	const intercept = meanY - slope * meanX
	const lastTs = points[n - 1].timestamp
	const interval = Math.max(1000, Math.round((lastTs - points[0].timestamp) / (n - 1)))
	return Array.from({ length: steps }).map((_, i) => ({
		timestamp: lastTs + (i + 1) * interval,
		value: intercept + slope * (n + i)
	}))
}

export function calculateMetricScore(perf: { avgResponseTime?: number; throughput?: number; errorRate?: number }): number {
	const latencyScore = perf.avgResponseTime != null ? Math.max(0, 100 - Math.min(100, perf.avgResponseTime / 10)) : 50
	const throughputScore = perf.throughput != null ? Math.min(100, perf.throughput / 10) : 50
	const errorScore = perf.errorRate != null ? Math.max(0, 100 - Math.min(100, perf.errorRate * 10)) : 50
	return Math.round((latencyScore * 0.4 + throughputScore * 0.4 + errorScore * 0.2))
}

export function normalizeMetricValue(value: number, min: number, max: number): number {
	if (max <= min) return 0
	return (value - min) / (max - min)
}

export function generateMetricReport(input: {
	series: Record<string, MetricPoint[]>;
	window: { start: number; end: number };
	includePredictions?: boolean;
}) {
	const summary: Record<string, any> = {}
	Object.entries(input.series).forEach(([key, pts]) => {
		summary[key] = {
			avg: aggregateMetrics(pts, 'avg'),
			min: aggregateMetrics(pts, 'min'),
			max: aggregateMetrics(pts, 'max'),
			trend: calculateMetricTrend(pts, ''),
			anomalies: detectAnomalies(pts).length,
			predictions: input.includePredictions ? predictMetricTrend(pts, 5) : [],
		}
	})
	return { window: input.window, summary }
}
