import { Bell, BookOpen, Database, FileText, Scan, Shield, Users } from 'lucide-react'

export const NOTIFICATION_CATEGORIES = [
	{ id: 'data-sources', name: 'Data Sources', icon: Database },
	{ id: 'scan-rule-sets', name: 'Scan Rules', icon: Shield },
	{ id: 'classifications', name: 'Classifications', icon: FileText },
	{ id: 'compliance-rule', name: 'Compliance', icon: BookOpen },
	{ id: 'advanced-catalog', name: 'Catalog', icon: Scan },
	{ id: 'rbac-system', name: 'RBAC', icon: Users },
	{ id: 'general', name: 'General', icon: Bell },
] as const

export const NOTIFICATION_SOUNDS = {
	critical: '/sounds/critical.mp3',
	high: '/sounds/high.mp3',
	medium: '/sounds/medium.mp3',
	low: '/sounds/low.mp3',
} as const

export const MAX_VISIBLE_NOTIFICATIONS = 50


