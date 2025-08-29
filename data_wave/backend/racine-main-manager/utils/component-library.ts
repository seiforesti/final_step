// ============================================================================
// COMPONENT LIBRARY UTILITIES
// ============================================================================

import type { ComponentDefinition, ComponentInstance, ComponentTemplate } from '../types/racine-core.types';

/**
 * Component Library Registry
 * Central registry for all available components in the Racine system
 */
export const componentLibrary: Record<string, ComponentDefinition> = {
  // Data Source Components
  'data-source-connector': {
    id: 'data-source-connector',
    name: 'Data Source Connector',
    category: 'data-sources',
    description: 'Connect to various data sources',
    icon: 'Database',
    permissions: ['data-sources:read'],
    configSchema: {
      type: 'object',
      properties: {
        connectionType: { type: 'string', enum: ['database', 'api', 'file'] },
        connectionString: { type: 'string' },
        credentials: { type: 'object' }
      },
      required: ['connectionType', 'connectionString']
    }
  },

  // Scan Rule Components
  'scan-rule-engine': {
    id: 'scan-rule-engine',
    name: 'Scan Rule Engine',
    category: 'scan-rules',
    description: 'Execute data scanning rules',
    icon: 'Search',
    permissions: ['scan-rules:read'],
    configSchema: {
      type: 'object',
      properties: {
        ruleType: { type: 'string', enum: ['validation', 'transformation', 'classification'] },
        ruleDefinition: { type: 'object' },
        executionMode: { type: 'string', enum: ['synchronous', 'asynchronous'] }
      },
      required: ['ruleType', 'ruleDefinition']
    }
  },

  // Classification Components
  'classification-manager': {
    id: 'classification-manager',
    name: 'Classification Manager',
    category: 'classifications',
    description: 'Manage data classifications',
    icon: 'Tag',
    permissions: ['classifications:read'],
    configSchema: {
      type: 'object',
      properties: {
        classificationType: { type: 'string' },
        autoClassification: { type: 'boolean' },
        rules: { type: 'array' }
      }
    }
  },

  // Compliance Components
  'compliance-checker': {
    id: 'compliance-checker',
    name: 'Compliance Checker',
    category: 'compliance',
    description: 'Check data compliance rules',
    icon: 'Shield',
    permissions: ['compliance:read'],
    configSchema: {
      type: 'object',
      properties: {
        complianceFramework: { type: 'string' },
        rules: { type: 'array' },
        reportingMode: { type: 'string', enum: ['detailed', 'summary'] }
      },
      required: ['complianceFramework']
    }
  },

  // Catalog Components
  'catalog-manager': {
    id: 'catalog-manager',
    name: 'Catalog Manager',
    category: 'catalog',
    description: 'Manage data catalog entries',
    icon: 'BookOpen',
    permissions: ['catalog:read'],
    configSchema: {
      type: 'object',
      properties: {
        catalogType: { type: 'string' },
        metadataSchema: { type: 'object' },
        indexingMode: { type: 'string', enum: ['automatic', 'manual'] }
      }
    }
  },

  // Scan Logic Components
  'scan-logic-processor': {
    id: 'scan-logic-processor',
    name: 'Scan Logic Processor',
    category: 'scan-logic',
    description: 'Process scan logic workflows',
    icon: 'Workflow',
    permissions: ['scan-logic:read'],
    configSchema: {
      type: 'object',
      properties: {
        workflowType: { type: 'string' },
        steps: { type: 'array' },
        errorHandling: { type: 'object' }
      },
      required: ['workflowType', 'steps']
    }
  },

  // RBAC Components
  'rbac-controller': {
    id: 'rbac-controller',
    name: 'RBAC Controller',
    category: 'rbac',
    description: 'Control role-based access',
    icon: 'Users',
    permissions: ['rbac:admin'],
    configSchema: {
      type: 'object',
      properties: {
        roleDefinitions: { type: 'array' },
        permissionMatrix: { type: 'object' },
        accessControlMode: { type: 'string', enum: ['strict', 'permissive'] }
      },
      required: ['roleDefinitions', 'permissionMatrix']
    }
  }
};

/**
 * Get all available components for a given category
 */
export const getAvailableComponents = (category?: string): ComponentDefinition[] => {
  if (category) {
    return Object.values(componentLibrary).filter(component => component.category === category);
  }
  return Object.values(componentLibrary);
};

/**
 * Create a new component instance from a template
 */
export const createComponentInstance = (
  componentId: string,
  config: Record<string, any> = {},
  workspaceId?: string
): ComponentInstance => {
  const component = componentLibrary[componentId];
  
  if (!component) {
    throw new Error(`Component with ID '${componentId}' not found in library`);
  }

  return {
    id: `${componentId}_${Date.now()}`,
    componentId,
    name: component.name,
    description: component.description,
    category: component.category,
    config: {
      ...component.configSchema?.properties ? 
        Object.keys(component.configSchema.properties).reduce((acc, key) => {
          acc[key] = component.configSchema.properties[key].default;
          return acc;
        }, {} as Record<string, any>) : {},
      ...config
    },
    workspaceId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'inactive',
    metadata: {}
  };
};

/**
 * Validate component configuration against schema
 */
export const validateComponentConfig = (
  componentId: string,
  config: Record<string, any>
): { isValid: boolean; errors: string[] } => {
  const component = componentLibrary[componentId];
  
  if (!component) {
    return { isValid: false, errors: [`Component '${componentId}' not found`] };
  }

  const errors: string[] = [];
  const schema = component.configSchema;

  if (!schema) {
    return { isValid: true, errors: [] };
  }

  // Check required fields
  if (schema.required) {
    for (const requiredField of schema.required) {
      if (!(requiredField in config)) {
        errors.push(`Required field '${requiredField}' is missing`);
      }
    }
  }

  // Check field types and constraints
  if (schema.properties) {
    for (const [fieldName, fieldConfig] of Object.entries(schema.properties)) {
      if (fieldName in config) {
        const value = config[fieldName];
        
        // Type validation
        if (fieldConfig.type === 'string' && typeof value !== 'string') {
          errors.push(`Field '${fieldName}' must be a string`);
        } else if (fieldConfig.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Field '${fieldName}' must be a boolean`);
        } else if (fieldConfig.type === 'array' && !Array.isArray(value)) {
          errors.push(`Field '${fieldName}' must be an array`);
        } else if (fieldConfig.type === 'object' && typeof value !== 'object') {
          errors.push(`Field '${fieldName}' must be an object`);
        }

        // Enum validation
        if (fieldConfig.enum && !fieldConfig.enum.includes(value)) {
          errors.push(`Field '${fieldName}' must be one of: ${fieldConfig.enum.join(', ')}`);
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Get component templates for quick setup
 */
export const getComponentTemplates = (category?: string): ComponentTemplate[] => {
  const components = getAvailableComponents(category);
  
  return components.map(component => ({
    id: `${component.id}_template`,
    name: `${component.name} Template`,
    description: `Quick setup template for ${component.name}`,
    componentId: component.id,
    config: component.configSchema?.properties ? 
      Object.keys(component.configSchema.properties).reduce((acc, key) => {
        acc[key] = component.configSchema.properties[key].default;
        return acc;
      }, {} as Record<string, any>) : {},
    category: component.category,
    tags: [component.category, 'template'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

/**
 * Search components by name, description, or tags
 */
export const searchComponents = (query: string): ComponentDefinition[] => {
  const searchTerm = query.toLowerCase();
  
  return Object.values(componentLibrary).filter(component => 
    component.name.toLowerCase().includes(searchTerm) ||
    component.description.toLowerCase().includes(searchTerm) ||
    component.category.toLowerCase().includes(searchTerm)
  );
};

/**
 * Get component categories
 */
export const getComponentCategories = (): string[] => {
  const categories = new Set(Object.values(componentLibrary).map(component => component.category));
  return Array.from(categories).sort();
};

/**
 * Get component statistics
 */
export const getComponentStats = () => {
  const components = Object.values(componentLibrary);
  const categories = getComponentCategories();
  
  return {
    totalComponents: components.length,
    categories: categories.length,
    componentsByCategory: categories.reduce((acc, category) => {
      acc[category] = components.filter(c => c.category === category).length;
      return acc;
    }, {} as Record<string, number>),
    permissions: components.reduce((acc, component) => {
      component.permissions.forEach(permission => {
        acc[permission] = (acc[permission] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  };
};

// Default export for registry; named functions are already exported above
export default componentLibrary;

