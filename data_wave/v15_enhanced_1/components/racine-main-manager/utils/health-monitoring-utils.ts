export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'offline'

export function calculateHealthScore(perf: { cpuUsage?: number; memoryUsage?: number; avgResponseTime?: number; errorRate?: number }): number {
	const cpu = perf.cpuUsage ?? 50
	const mem = perf.memoryUsage ?? 50
	const lat = perf.avgResponseTime ?? 200
	const err = perf.errorRate ?? 1
	const cpuScore = Math.max(0, 100 - cpu)
	const memScore = Math.max(0, 100 - mem)
	const latScore = Math.max(0, 100 - Math.min(100, lat / 10))
	const errScore = Math.max(0, 100 - Math.min(100, err * 10))
	return Math.round(cpuScore * 0.25 + memScore * 0.25 + latScore * 0.3 + errScore * 0.2)
}

export function determineHealthStatus(score: number): HealthStatus {
	if (score >= 90) return 'healthy'
	if (score >= 70) return 'warning'
	if (score > 0) return 'critical'
	return 'unknown'
}

export function analyzePerformanceTrends(history: Array<{ timestamp: number; score: number }>): { improving: boolean; change: number } {
	if (!history || history.length < 2) return { improving: false, change: 0 }
	const first = history[0].score
	const last = history[history.length - 1].score
	const change = last - first
	return { improving: change >= 0, change }
}

export function classifyHealthIssues(perf: { cpuUsage?: number; memoryUsage?: number; avgResponseTime?: number; errorRate?: number }): string[] {
	const issues: string[] = []
	if ((perf.cpuUsage ?? 0) > 85) issues.push('High CPU usage')
	if ((perf.memoryUsage ?? 0) > 90) issues.push('High memory usage')
	if ((perf.avgResponseTime ?? 0) > 1000) issues.push('High response latency')
	if ((perf.errorRate ?? 0) > 2) issues.push('Elevated error rate')
	return issues
}

export function getHealthColorScheme(status: HealthStatus) {
	switch (status) {
		case 'healthy': return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' }
		case 'warning': return { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' }
		case 'critical': return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' }
		case 'offline': return { text: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100' }
		default: return { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' }
	}
}

export function generateHealthReport(input: {
	dataSourceId: string;
	window: { start: number; end: number };
	metrics: Array<{ timestamp: number; cpu: number; mem: number; latency: number; errors: number }>;
}) {
	const scores = input.metrics.map(m => calculateHealthScore({ cpuUsage: m.cpu, memoryUsage: m.mem, avgResponseTime: m.latency, errorRate: m.errors }))
	const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
	const trend = analyzePerformanceTrends(scores.map((s, i) => ({ timestamp: input.metrics[i]?.timestamp ?? input.window.start + i * 1000, score: s })))
	return {
		dataSourceId: input.dataSourceId,
		window: input.window,
		averageScore: avg,
		trend,
		status: determineHealthStatus(avg),
		issues: classifyHealthIssues({ cpuUsage: 100 - avg, memoryUsage: 100 - avg }),
	}
}
