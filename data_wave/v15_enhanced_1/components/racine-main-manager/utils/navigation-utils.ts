export function buildPath(base: string, segment: string): string {
	return `${base.replace(/\/$/, '')}/${segment.replace(/^\//, '')}`
}
