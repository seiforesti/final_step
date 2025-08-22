export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'ultrawide'

export function getActiveBreakpoint(width: number): Breakpoint {
	if (width < 640) return 'mobile'
	if (width < 1024) return 'tablet'
	if (width < 1536) return 'desktop'
	return 'ultrawide'
}
