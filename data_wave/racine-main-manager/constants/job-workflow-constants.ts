export const WORKFLOW_DEFAULTS = {
	nodeWidth: 220,
	nodeHeight: 120,
	gridSize: 16,
	maxConnectionsPerNode: 8
} as const

export const WORKFLOW_NODE_CATEGORIES = [
	'io',
	'transform',
	'quality',
	'observability',
	'governance',
	'custom'
] as const
