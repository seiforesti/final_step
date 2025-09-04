/**
 * useActivityTracking - Alias for useActivityTracker
 * ===================================================
 * 
 * This file provides compatibility by exporting useActivityTracker 
 * as useActivityTracking to maintain existing import paths.
 */

export { useActivityTracker as useActivityTracking } from './useActivityTracker';
export type { UseActivityTrackerOptions as UseActivityTrackingOptions } from './useActivityTracker';

// Default export for convenience
export { useActivityTracker as default } from './useActivityTracker';
