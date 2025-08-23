import { Briefcase, Building, Database, Workflow } from 'lucide-react'

export const MAX_WORKSPACE_NAME_LENGTH = 64

export const WORKSPACE_TYPES = [
	'engineering',
	'analytics',
	'governance',
	'operations',
	'security',
	'compliance',
] as const

export const WORKSPACE_TEMPLATES = [
	{
		id: 'analytics-default',
		name: 'Analytics Workspace',
		description: 'Preconfigured analytics workspace with dashboards and datasets',
		icon: Database,
		configuration: {
			type: 'analytics',
			settings: { enableDashboards: true },
		},
	},
	{
		id: 'governance-core',
		name: 'Governance Core',
		description: 'Core governance workspace with policies and catalogs',
		icon: Briefcase,
		configuration: {
			type: 'governance',
			settings: { enablePolicies: true },
		},
	},
	{
		id: 'ops-monitoring',
		name: 'Operations Monitoring',
		description: 'Operational monitoring setup with alerts and SLOs',
		icon: Workflow,
		configuration: {
			type: 'operations',
			settings: { enableAlerts: true },
		},
	},
] as const


