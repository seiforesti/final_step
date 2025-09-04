export interface PersonalizationSettings {
	theme?: 'light' | 'dark' | 'system'
	layout?: 'default' | 'compact' | 'spacious'
	showTooltips?: boolean
}

export function mergePersonalization(base: PersonalizationSettings, override: PersonalizationSettings): PersonalizationSettings {
	return { ...base, ...override }
}

export const validatePreferences = (
  preferences: PersonalizationSettings
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate theme
  if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
    errors.push(`Invalid theme: ${preferences.theme}. Must be 'light', 'dark', or 'system'`);
  }

  // Validate layout
  if (preferences.layout && !['default', 'compact', 'spacious'].includes(preferences.layout)) {
    errors.push(`Invalid layout: ${preferences.layout}. Must be 'default', 'compact', or 'spacious'`);
  }

  // Validate showTooltips
  if (preferences.showTooltips !== undefined && typeof preferences.showTooltips !== 'boolean') {
    errors.push('showTooltips must be a boolean value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
