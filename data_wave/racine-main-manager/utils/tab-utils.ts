export type Tab = { id: string; title: string; state?: Record<string, any> }

export function findTab(tabs: Tab[], id: string): Tab | undefined {
	return tabs.find(t => t.id === id)
}

export const validateTabGroup = (
  tabGroup: {
    id: string;
    tabs: Tab[];
    maxTabs?: number;
    allowDuplicates?: boolean;
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if tab group has an ID
  if (!tabGroup.id || tabGroup.id.trim() === '') {
    errors.push('Tab group must have a valid ID');
  }

  // Check if we have at least one tab
  if (!tabGroup.tabs || tabGroup.tabs.length === 0) {
    errors.push('Tab group must have at least one tab');
  }

  // Check max tabs constraint
  if (tabGroup.maxTabs && tabGroup.tabs.length > tabGroup.maxTabs) {
    errors.push(`Number of tabs (${tabGroup.tabs.length}) exceeds maximum (${tabGroup.maxTabs})`);
  }

  // Check for duplicate tab IDs if not allowed
  if (!tabGroup.allowDuplicates) {
    const tabIds = tabGroup.tabs.map(tab => tab.id);
    const duplicateIds = tabIds.filter((id, index) => tabIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate tab IDs found: ${duplicateIds.join(', ')}`);
    }
  }

  // Validate individual tabs
  tabGroup.tabs.forEach((tab, index) => {
    if (!tab.id || tab.id.trim() === '') {
      errors.push(`Tab ${index} must have a valid ID`);
    }
    if (!tab.title || tab.title.trim() === '') {
      errors.push(`Tab ${index} must have a valid title`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
