export type Pane = { id: string; title?: string; closable?: boolean; size?: number }

export function createPane(id: string, title?: string): Pane {
	return { id, title, closable: true }
}

export const validatePaneConstraints = (
  pane: Pane,
  constraints: {
    maxPanes?: number;
    minPaneSize?: number;
    maxPaneSize?: number;
    allowedPaneTypes?: string[];
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if pane type is allowed
  if (constraints.allowedPaneTypes && !constraints.allowedPaneTypes.includes(pane.id)) {
    errors.push(`Pane type '${pane.id}' is not allowed`);
  }

  // Check pane size constraints (if size is provided)
  if (constraints.minPaneSize && pane.size && pane.size < constraints.minPaneSize) {
    errors.push(`Pane size ${pane.size} is below minimum ${constraints.minPaneSize}`);
  }

  if (constraints.maxPaneSize && pane.size && pane.size > constraints.maxPaneSize) {
    errors.push(`Pane size ${pane.size} exceeds maximum ${constraints.maxPaneSize}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
