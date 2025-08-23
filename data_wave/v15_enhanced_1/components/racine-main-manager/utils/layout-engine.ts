export type Pane = { id: string; size: number }

export function optimizeLayout(panes: Pane[]): Pane[] {
	const total = panes.reduce((s,p)=>s+p.size,0) || 1
	return panes.map(p=>({ ...p, size: Math.round((p.size/total)*100) }))
}

export const validateResponsiveLayout = (
  layout: any,
  constraints: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    breakpoints?: string[];
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check width constraints
  if (constraints.minWidth && layout.width && layout.width < constraints.minWidth) {
    errors.push(`Layout width ${layout.width} is below minimum ${constraints.minWidth}`);
  }

  if (constraints.maxWidth && layout.width && layout.width > constraints.maxWidth) {
    errors.push(`Layout width ${layout.width} exceeds maximum ${constraints.maxWidth}`);
  }

  // Check height constraints
  if (constraints.minHeight && layout.height && layout.height < constraints.minHeight) {
    errors.push(`Layout height ${layout.height} is below minimum ${constraints.minHeight}`);
  }

  if (constraints.maxHeight && layout.height && layout.height > constraints.maxHeight) {
    errors.push(`Layout height ${layout.height} exceeds maximum ${constraints.maxHeight}`);
  }

  // Check breakpoint constraints
  if (constraints.breakpoints && layout.breakpoint && !constraints.breakpoints.includes(layout.breakpoint)) {
    errors.push(`Invalid breakpoint: ${layout.breakpoint}. Must be one of: ${constraints.breakpoints.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const layoutEngine = {
  optimizeLayout,
  validateResponsiveLayout
};
