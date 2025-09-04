export type PaneLayout = { id: string; size: number; min?: number; max?: number }

export function normalizePaneSizes(panes: PaneLayout[]): PaneLayout[] {
	const total = panes.reduce((s,p)=>s+p.size,0) || 1
	return panes.map(p=>({ ...p, size: (p.size/total)*100 }))
}

export function rebalancePanes(panes: PaneLayout[], delta: number, leftIndex: number): PaneLayout[] {
	const res = [...panes]
	if (!res[leftIndex+1]) return res
	res[leftIndex].size += delta
	res[leftIndex+1].size -= delta
	return normalizePaneSizes(res)
}

export const validateSplitConfiguration = (
  configuration: {
    panes: PaneLayout[];
    orientation?: 'horizontal' | 'vertical';
    minPaneSize?: number;
    maxPanes?: number;
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if we have at least 2 panes for a split
  if (!configuration.panes || configuration.panes.length < 2) {
    errors.push('Split configuration requires at least 2 panes');
  }

  // Check max panes constraint
  if (configuration.maxPanes && configuration.panes.length > configuration.maxPanes) {
    errors.push(`Number of panes (${configuration.panes.length}) exceeds maximum (${configuration.maxPanes})`);
  }

  // Check orientation
  if (configuration.orientation && !['horizontal', 'vertical'].includes(configuration.orientation)) {
    errors.push(`Invalid orientation: ${configuration.orientation}. Must be 'horizontal' or 'vertical'`);
  }

  // Check pane size constraints
  if (configuration.minPaneSize) {
    configuration.panes.forEach((pane, index) => {
      if (pane.size < configuration.minPaneSize!) {
        errors.push(`Pane ${index} size (${pane.size}) is below minimum (${configuration.minPaneSize})`);
      }
    });
  }

  // Check that pane sizes sum to 100%
  const totalSize = configuration.panes.reduce((sum, pane) => sum + pane.size, 0);
  if (Math.abs(totalSize - 100) > 0.01) {
    errors.push(`Pane sizes must sum to 100%, got ${totalSize}%`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const splitScreenUtils = {
	normalizePaneSizes,
	rebalancePanes,
	validateSplitConfiguration
};
