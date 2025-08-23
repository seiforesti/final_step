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
