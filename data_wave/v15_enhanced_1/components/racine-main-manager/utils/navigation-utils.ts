import React from 'react'
import { CheckCircle, AlertTriangle, Clock, Activity } from 'lucide-react'

export function buildPath(base: string, segment: string): string {
	return `${base.replace(/\/$/, '')}/${segment.replace(/^\//, '')}`
}

// Status and health utilities
export function getStatusIcon(status: string): React.ComponentType<{ className?: string }> {
	switch (status.toLowerCase()) {
		case 'online':
		case 'active':
		case 'healthy':
			return CheckCircle;
		case 'offline':
		case 'inactive':
		case 'unhealthy':
			return AlertTriangle;
		case 'warning':
		case 'degraded':
			return Clock;
		default:
			return Activity;
	}
}

export function getHealthStatusColor(status: string): string {
	switch (status.toLowerCase()) {
		case 'healthy':
		case 'online':
			return 'text-green-500';
		case 'warning':
		case 'degraded':
			return 'text-yellow-500';
		case 'unhealthy':
		case 'offline':
			return 'text-red-500';
		default:
			return 'text-gray-500';
	}
}

export function formatNotificationTime(timestamp: Date | string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return 'Just now';
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes}m ago`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours}h ago`;
	} else {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days}d ago`;
	}
}
