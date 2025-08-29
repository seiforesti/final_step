// ============================================================================
// PREFERENCES UTILITIES - USER MANAGEMENT
// ============================================================================
// Advanced user preferences management utilities
// Provides comprehensive preference handling, validation, and synchronization

import { UUID } from '../types/racine-core.types';

// ============================================================================
// PREFERENCES INTERFACES
// ============================================================================

export interface UserPreference {
  id: string;
  userId: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  validation?: PreferenceValidation;
  metadata?: Record<string, any>;
}

export interface PreferenceValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  custom?: (value: any) => boolean;
  errorMessage?: string;
}

export interface PreferenceCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  preferences: UserPreference[];
  metadata?: Record<string, any>;
}

export interface PreferenceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preferences: Partial<UserPreference>[];
  metadata?: Record<string, any>;
}

export interface PreferenceSync {
  id: string;
  userId: string;
  deviceId: string;
  lastSync: Date;
  conflicts: PreferenceConflict[];
  metadata?: Record<string, any>;
}

export interface PreferenceConflict {
  preferenceId: string;
  localValue: any;
  remoteValue: any;
  resolution: 'local' | 'remote' | 'merge' | 'manual';
  metadata?: Record<string, any>;
}

// ============================================================================
// PREFERENCES UTILITIES
// ============================================================================

/**
 * Validate preference value against validation rules
 */
export function validatePreference(
  value: any,
  validation: PreferenceValidation
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required
  if (validation.required && (value === undefined || value === null || value === '')) {
    errors.push(validation.errorMessage || 'This preference is required');
  }

  // Check min/max for numbers
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      errors.push(validation.errorMessage || `Value must be at least ${validation.min}`);
    }
    if (validation.max !== undefined && value > validation.max) {
      errors.push(validation.errorMessage || `Value must be at most ${validation.max}`);
    }
  }

  // Check pattern for strings
  if (typeof value === 'string' && validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      errors.push(validation.errorMessage || 'Value does not match required pattern');
    }
  }

  // Check enum values
  if (validation.enum && !validation.enum.includes(value)) {
    errors.push(validation.errorMessage || `Value must be one of: ${validation.enum.join(', ')}`);
  }

  // Check custom validation
  if (validation.custom && !validation.custom(value)) {
    errors.push(validation.errorMessage || 'Value failed custom validation');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get preference value with fallback
 */
export function getPreferenceValue(
  preferences: UserPreference[],
  category: string,
  key: string,
  fallback?: any
): any {
  const preference = preferences.find(p => p.category === category && p.key === key);
  return preference ? preference.value : fallback;
}

/**
 * Set preference value
 */
export function setPreferenceValue(
  preferences: UserPreference[],
  category: string,
  key: string,
  value: any,
  type?: string
): UserPreference[] {
  const existingIndex = preferences.findIndex(p => p.category === category && p.key === key);
  
  if (existingIndex >= 0) {
    // Update existing preference
    const updated = [...preferences];
    updated[existingIndex] = {
      ...updated[existingIndex],
      value,
      type: type || updated[existingIndex].type
    };
    return updated;
  } else {
    // Add new preference
    const newPreference: UserPreference = {
      id: generateUUID(),
      userId: '', // Will be set by the calling function
      category,
      key,
      value,
      type: type || typeof value,
      description: '',
      metadata: {}
    };
    return [...preferences, newPreference];
  }
}

/**
 * Remove preference
 */
export function removePreference(
  preferences: UserPreference[],
  category: string,
  key: string
): UserPreference[] {
  return preferences.filter(p => !(p.category === category && p.key === key));
}

/**
 * Get preferences by category
 */
export function getPreferencesByCategory(
  preferences: UserPreference[],
  category: string
): UserPreference[] {
  return preferences.filter(p => p.category === category);
}

/**
 * Get preferences by key pattern
 */
export function getPreferencesByPattern(
  preferences: UserPreference[],
  pattern: string
): UserPreference[] {
  const regex = new RegExp(pattern);
  return preferences.filter(p => regex.test(p.key));
}

/**
 * Merge preference sets
 */
export function mergePreferences(
  local: UserPreference[],
  remote: UserPreference[],
  strategy: 'local' | 'remote' | 'merge' | 'smart' = 'smart'
): { merged: UserPreference[]; conflicts: PreferenceConflict[] } {
  const conflicts: PreferenceConflict[] = [];
  const merged = new Map<string, UserPreference>();

  // Add all local preferences
  local.forEach(pref => {
    const key = `${pref.category}:${pref.key}`;
    merged.set(key, pref);
  });

  // Process remote preferences
  remote.forEach(remotePref => {
    const key = `${remotePref.category}:${remotePref.key}`;
    const localPref = merged.get(key);

    if (!localPref) {
      // New preference from remote
      merged.set(key, remotePref);
    } else if (localPref.value !== remotePref.value) {
      // Conflict detected
      const conflict: PreferenceConflict = {
        preferenceId: localPref.id,
        localValue: localPref.value,
        remoteValue: remotePref.value,
        resolution: 'manual',
        metadata: {
          localTimestamp: localPref.metadata?.lastModified,
          remoteTimestamp: remotePref.metadata?.lastModified
        }
      };
      conflicts.push(conflict);

      // Apply resolution strategy
      switch (strategy) {
        case 'local':
          // Keep local value
          break;
        case 'remote':
          // Use remote value
          merged.set(key, remotePref);
          break;
        case 'merge':
          // Try to merge values
          const mergedValue = mergePreferenceValues(localPref.value, remotePref.value);
          if (mergedValue !== null) {
            merged.set(key, { ...localPref, value: mergedValue });
          }
          break;
        case 'smart':
          // Use most recent value
          const localTime = localPref.metadata?.lastModified || 0;
          const remoteTime = remotePref.metadata?.lastModified || 0;
          if (remoteTime > localTime) {
            merged.set(key, remotePref);
          }
          break;
      }
    }
  });

  return {
    merged: Array.from(merged.values()),
    conflicts
  };
}

/**
 * Merge preference values intelligently
 */
function mergePreferenceValues(local: any, remote: any): any {
  if (typeof local !== typeof remote) {
    return null; // Cannot merge different types
  }

  if (typeof local === 'object' && local !== null) {
    if (Array.isArray(local)) {
      // Merge arrays
      return [...new Set([...local, ...remote])];
    } else {
      // Merge objects
      return { ...local, ...remote };
    }
  }

  // For primitive types, return null to indicate no merge possible
  return null;
}

/**
 * Export preferences to JSON
 */
export function exportPreferences(
  preferences: UserPreference[],
  format: 'json' | 'csv' = 'json'
): string {
  if (format === 'csv') {
    const headers = ['Category', 'Key', 'Value', 'Type', 'Description'];
    const rows = preferences.map(p => [
      p.category,
      p.key,
      JSON.stringify(p.value),
      p.type,
      p.description || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  } else {
    return JSON.stringify(preferences, null, 2);
  }
}

/**
 * Import preferences from JSON
 */
export function importPreferences(
  data: string,
  format: 'json' | 'csv' = 'json'
): UserPreference[] {
  try {
    if (format === 'csv') {
      // Parse CSV format
      const lines = data.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
      const preferences: UserPreference[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = line.split(',').map(v => v.replace(/"/g, ''));
        const preference: UserPreference = {
          id: generateUUID(),
          userId: '',
          category: values[0],
          key: values[1],
          value: JSON.parse(values[2]),
          type: values[3] as any,
          description: values[4],
          metadata: {}
        };
        preferences.push(preference);
      }

      return preferences;
    } else {
      // Parse JSON format
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Failed to import preferences:', error);
    throw new Error('Invalid preferences format');
  }
}

/**
 * Validate preference schema
 */
export function validatePreferenceSchema(
  preferences: UserPreference[],
  schema: Record<string, PreferenceValidation>
): { valid: boolean; errors: Array<{ preference: string; errors: string[] }> } {
  const errors: Array<{ preference: string; errors: string[] }> = [];

  preferences.forEach(pref => {
    const schemaKey = `${pref.category}.${pref.key}`;
    const validation = schema[schemaKey];

    if (validation) {
      const result = validatePreference(pref.value, validation);
      if (!result.valid) {
        errors.push({
          preference: schemaKey,
          errors: result.errors
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get preference statistics
 */
export function getPreferenceStats(preferences: UserPreference[]): {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  conflicts: number;
} {
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};

  preferences.forEach(pref => {
    // Count by category
    byCategory[pref.category] = (byCategory[pref.category] || 0) + 1;
    
    // Count by type
    byType[pref.type] = (byType[pref.type] || 0) + 1;
  });

  return {
    total: preferences.length,
    byCategory,
    byType,
    conflicts: 0 // This would be calculated from actual conflict data
  };
}

/**
 * Generate UUID for preferences
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create preference template
 */
export function createPreferenceTemplate(
  name: string,
  description: string,
  category: string,
  preferences: Partial<UserPreference>[]
): PreferenceTemplate {
  return {
    id: generateUUID(),
    name,
    description,
    category,
    preferences,
    metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

/**
 * Apply preference template
 */
export function applyPreferenceTemplate(
  template: PreferenceTemplate,
  userId: string,
  overrides?: Record<string, any>
): UserPreference[] {
  return template.preferences.map(pref => ({
    id: generateUUID(),
    userId,
    category: pref.category || template.category,
    key: pref.key!,
    value: overrides?.[pref.key!] ?? pref.value!,
    type: pref.type!,
    description: pref.description || '',
    metadata: {
      ...pref.metadata,
      templateId: template.id,
      appliedAt: new Date().toISOString()
    }
  }));
}

// Additional utility functions for preferences management
export function validatePreferences(
  preferences: Partial<UserPreferences>
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (preferences.theme && !['light', 'dark', 'auto'].includes(preferences.theme)) {
    errors.push('Invalid theme value');
  }

  if (preferences.language && !['en', 'es', 'fr', 'de'].includes(preferences.language)) {
    errors.push('Unsupported language');
  }

  if (preferences.timezone && !Intl.supportedValuesOf('timeZone').includes(preferences.timezone)) {
    errors.push('Invalid timezone');
  }

  if (preferences.notifications && preferences.notifications.email && !preferences.notifications.email.enabled) {
    warnings.push('Email notifications are disabled');
  }

  return Promise.resolve({
    valid: errors.length === 0,
    errors,
    warnings
  });
}

export function exportUserPreferences(
  preferences: UserPreferences
): Promise<string> {
  // Implementation for exporting user preferences
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    preferences
  };
  
  return Promise.resolve(JSON.stringify(exportData, null, 2));
}

export async function importUserPreferences(
  importData: string
): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
  try {
    const parsed = JSON.parse(importData);
    
    if (!parsed.preferences || !parsed.version) {
      throw new Error('Invalid import format');
    }
    
    // Validate imported preferences
    const validation = await validatePreferences(parsed.preferences);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    return Promise.resolve({
      success: true,
      preferences: parsed.preferences
    });
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: error instanceof Error ? error.message : 'Import failed'
    });
  }
}
