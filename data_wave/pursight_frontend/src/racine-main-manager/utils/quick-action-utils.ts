export type QuickAction = {
	id: string
	title: string
	icon?: string
	category?: string
	payload?: Record<string, any>
}

export function validateQuickAction(action: QuickAction): boolean {
	return !!action.id && !!action.title
}

export function throttle<T extends (...args: any[]) => any>(fn: T, wait: number) {
	let last = 0
	return (...args: Parameters<T>) => {
		const now = Date.now()
		if (now - last >= wait) {
			last = now
			fn(...args)
		}
	}
}

export function buildActionPayload(base: Record<string, any>, extra?: Record<string, any>) {
	return { ...base, ...(extra || {}) }
}

// Additional utility functions
export function generateActionId(): string {
	return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getQuickActionIcon(actionType: string): string {
	switch (actionType.toLowerCase()) {
		case 'create':
		case 'add':
		case 'new':
			return '➕'
		case 'edit':
		case 'modify':
		case 'update':
			return '✏️'
		case 'delete':
		case 'remove':
		case 'trash':
			return '🗑️'
		case 'view':
		case 'show':
		case 'display':
			return '👁️'
		case 'download':
		case 'export':
			return '⬇️'
		case 'upload':
		case 'import':
			return '⬆️'
		case 'search':
		case 'find':
		case 'query':
			return '🔍'
		case 'start':
		case 'run':
		case 'execute':
			return '▶️'
		case 'stop':
		case 'pause':
		case 'halt':
			return '⏹️'
		case 'settings':
		case 'configure':
		case 'setup':
			return '⚙️'
		case 'help':
		case 'info':
		case 'about':
			return '❓'
		default:
			return '🔧'
	}
}
