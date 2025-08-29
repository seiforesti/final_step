export function groupBy<T, K extends string | number | symbol>(items: T[], getKey: (item: T) => K): Record<K, T[]> {
	return items.reduce((acc, item) => {
		const key = getKey(item)
		;(acc[key] ||= []).push(item)
		return acc
	}, {} as Record<K, T[]>)
}

export function sortBy<T>(items: T[], selector: (item: T) => any, order: 'asc' | 'desc' = 'asc'): T[] {
	const sorted = [...items].sort((a, b) => {
		const va = selector(a)
		const vb = selector(b)
		if (va === vb) return 0
		return va > vb ? 1 : -1
	})
	return order === 'desc' ? sorted.reverse() : sorted
}

export function sortNotifications<T extends { [key: string]: any }>(items: T[], key: string, order: 'asc' | 'desc' = 'desc'): T[] {
	const sorted = [...items].sort((a, b) => {
		const va = a[key]
		const vb = b[key]
		if (va === vb) return 0
		return va > vb ? 1 : -1
	})
	return order === 'desc' ? sorted.reverse() : sorted
}
