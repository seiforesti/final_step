import {
	AlertCircle,
	Bell,
	BookOpen,
	Database,
	FileText,
	Scan,
	Shield,
	Users,
} from 'lucide-react'
import type { NotificationCategory, NotificationPriority } from '../types/racine-core.types'

export function formatNotificationTime(iso: string): string {
	const date = new Date(iso)
	const diffMs = Date.now() - date.getTime()
	const diffMin = Math.floor(diffMs / 60000)
	if (diffMin < 1) return 'just now'
	if (diffMin < 60) return `${diffMin}m ago`
	const diffH = Math.floor(diffMin / 60)
	if (diffH < 24) return `${diffH}h ago`
	const diffD = Math.floor(diffH / 24)
	return `${diffD}d ago`
}

export function getNotificationIcon(category: NotificationCategory | string) {
	switch (category) {
		case 'data-sources':
			return Database
		case 'scan-rule-sets':
			return Shield
		case 'classifications':
			return FileText
		case 'compliance-rule':
			return BookOpen
		case 'advanced-catalog':
			return Scan
		case 'scan-logic':
			return AlertCircle
		case 'rbac-system':
			return Users
		default:
			return Bell
	}
}

export function playNotificationSound(priority: NotificationPriority | string) {
	// Non-blocking: Map priorities to basic sound cues. Integrate with preferences elsewhere.
	try {
		const audio = new Audio(
			priority === 'critical'
				? '/sounds/critical.mp3'
				: priority === 'high'
				? '/sounds/high.mp3'
				: priority === 'medium'
				? '/sounds/medium.mp3'
				: '/sounds/low.mp3'
		)
		audio.volume = 0.3
		audio.play().catch(() => {})
	} catch {
		// Ignore sound errors in environments without audio
	}
}

export function groupNotifications<T extends { category: string }>(items: T[]): Record<string, T[]> {
	return items.reduce<Record<string, T[]>>((acc, item) => {
		(acc[item.category] ||= []).push(item)
		return acc
	}, {})
}

export function sortNotifications<T extends Record<string, any>>(items: T[], key: string, order: 'asc' | 'desc' = 'desc'): T[] {
	const sorted = [...items].sort((a, b) => {
		const va = a[key]
		const vb = b[key]
		if (va === vb) return 0
		return va > vb ? 1 : -1
	})
	return order === 'desc' ? sorted.reverse() : sorted
}


