import { AlertTriangle, CheckCircle2, Clock, Wrench, XCircle } from 'lucide-react'
import type { HealthStatus, HealthMetric } from '../types/racine-core.types'

export function getHealthStatusColor(status: HealthStatus | string): string {
	const normalized = String(status).toLowerCase()
	switch (normalized) {
		case 'healthy':
			return 'text-green-600 dark:text-green-400'
		case 'degraded':
			return 'text-yellow-600 dark:text-yellow-400'
		case 'failed':
			return 'text-red-600 dark:text-red-400'
		case 'maintenance':
			return 'text-blue-600 dark:text-blue-400'
		default:
			return 'text-muted-foreground'
	}
}

export function getHealthStatusIcon(status: HealthStatus | string) {
	const normalized = String(status).toLowerCase()
	switch (normalized) {
		case 'healthy':
			return CheckCircle2
		case 'degraded':
			return AlertTriangle
		case 'failed':
			return XCircle
		case 'maintenance':
			return Wrench
		default:
			return Clock
	}
}

export function formatHealthMetric(metric: HealthMetric | number | undefined, unitOverride?: string): string {
	if (metric == null) return '—'
	if (typeof metric === 'number') {
		return unitOverride ? `${metric}${unitOverride}` : String(metric)
	}
	const value = metric.value
	const unit = unitOverride ?? metric.unit ?? ''
	if (metric.type === 'percentage') {
		const pct = Math.max(0, Math.min(100, value))
		return `${pct.toFixed(0)}%`
	}
	if (metric.type === 'duration_ms') {
		return `${value}ms`
	}
	return `${value}${unit}`
}


