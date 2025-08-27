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

// Additional tab utilities for enterprise-grade functionality
export const tabUtils = {
  findTab,
  validateTabGroup,
  createTabConfiguration,
  optimizeTabPerformance
};

export function createTabConfiguration(
  id: string,
  title: string,
  viewId: string,
  options: {
    spaId?: string;
    groupId?: string;
    position?: number;
    isPinned?: boolean;
    isFavorite?: boolean;
    isClosable?: boolean;
    isDraggable?: boolean;
    isCollaborative?: boolean;
    permissions?: string[];
    metadata?: Record<string, any>;
  } = {}
) {
  return {
    id,
    title,
    viewId,
    spaId: options.spaId,
    groupId: options.groupId,
    position: options.position || 0,
    isPinned: options.isPinned || false,
    isFavorite: options.isFavorite || false,
    isClosable: options.isClosable !== false,
    isDraggable: options.isDraggable !== false,
    isCollaborative: options.isCollaborative || false,
    permissions: options.permissions || [],
    metadata: options.metadata || {},
    state: {
      isActive: false,
      isLoading: false,
      hasUnsavedChanges: false,
      lastSaved: new Date().toISOString(),
      scrollPosition: 0,
      formData: {},
      customState: null
    },
    performance: {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      interactionLatency: 0,
      updateFrequency: 0,
      errorCount: 0,
      lastOptimized: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
  };
}

export function optimizeTabPerformance(
  tabConfigurations: Record<string, any>,
  performanceMetrics: Record<string, any>
): {
  optimizedTabs: Record<string, any>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }>;
} {
  const optimizedTabs = { ...tabConfigurations };
  const recommendations: Array<{
    type: string;
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }> = [];

  // Analyze performance and provide optimization recommendations
  Object.entries(tabConfigurations).forEach(([tabId, config]) => {
    const metrics = performanceMetrics[tabId];
    if (metrics) {
      // Check for high memory usage
      if (metrics.memoryUsage > 100) {
        recommendations.push({
          type: 'memory',
          title: 'High Memory Usage',
          description: `Tab "${config.title}" is using excessive memory`,
          impact: 'high'
        });
      }

      // Check for slow render times
      if (metrics.renderTime > 1000) {
        recommendations.push({
          type: 'performance',
          title: 'Slow Rendering',
          description: `Tab "${config.title}" is taking too long to render`,
          impact: 'medium'
        });
      }
    }
  });

  return {
    optimizedTabs,
    recommendations
  };
}
