export const HEALTH_REFRESH_INTERVAL = 30000

export const HEALTH_THRESHOLDS = {
	cpu: {
		degraded: 70,
		failed: 90
	},
	memory: {
		degraded: 75,
		failed: 90
	},
	responseTimeMs: {
		degraded: 800,
		failed: 2000
	}
} as const


