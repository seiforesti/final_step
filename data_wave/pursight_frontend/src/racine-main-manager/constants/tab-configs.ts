/**
 * Tab Configuration Constants
 * ===========================
 * 
 * Enterprise-grade tab management configuration constants for the Racine system.
 * These constants define tab behavior, animations, and workflow patterns.
 */

import { UUID } from '../types/racine-core.types';

// =============================================================================
// TAB CONFIGURATIONS
// =============================================================================

export const TAB_CONFIGURATIONS = {
  DEFAULT: {
    maxTabs: 50,
    maxTabGroups: 20,
    tabTimeout: 30000,
    autoSaveInterval: 5000,
    performanceThreshold: 1000,
    memoryThreshold: 100
  },
  
  COMPACT: {
    maxTabs: 30,
    maxTabGroups: 10,
    tabTimeout: 15000,
    autoSaveInterval: 3000,
    performanceThreshold: 500,
    memoryThreshold: 50
  },
  
  ENTERPRISE: {
    maxTabs: 100,
    maxTabGroups: 50,
    tabTimeout: 60000,
    autoSaveInterval: 10000,
    performanceThreshold: 2000,
    memoryThreshold: 200
  }
};

// =============================================================================
// TAB GROUP TEMPLATES
// =============================================================================

export const TAB_GROUP_TEMPLATES = {
  DEVELOPMENT: {
    name: 'Development',
    color: '#3b82f6',
    icon: 'Code',
    description: 'Development and coding related tabs',
    defaultPermissions: ['read', 'write']
  },
  
  ANALYSIS: {
    name: 'Analysis',
    color: '#10b981',
    icon: 'BarChart3',
    description: 'Data analysis and reporting tabs',
    defaultPermissions: ['read', 'write']
  },
  
  COLLABORATION: {
    name: 'Collaboration',
    color: '#f59e0b',
    icon: 'Users',
    description: 'Team collaboration and communication tabs',
    defaultPermissions: ['read', 'write', 'share']
  },
  
  ADMINISTRATION: {
    name: 'Administration',
    color: '#ef4444',
    icon: 'Settings',
    description: 'System administration and configuration tabs',
    defaultPermissions: ['read', 'write', 'admin']
  }
};

// =============================================================================
// TAB WORKFLOW PATTERNS
// =============================================================================

export const TAB_WORKFLOW_PATTERNS = {
  DATA_PIPELINE: {
    name: 'Data Pipeline',
    description: 'Standard data processing workflow',
    steps: [
      { type: 'open', target: 'data-source', order: 1 },
      { type: 'open', target: 'transformation', order: 2 },
      { type: 'open', target: 'validation', order: 3 },
      { type: 'open', target: 'output', order: 4 }
    ]
  },
  
  ANALYSIS_WORKFLOW: {
    name: 'Analysis Workflow',
    description: 'Data analysis and reporting workflow',
    steps: [
      { type: 'open', target: 'data-exploration', order: 1 },
      { type: 'open', target: 'analysis', order: 2 },
      { type: 'open', target: 'visualization', order: 3 },
      { type: 'open', target: 'report', order: 4 }
    ]
  },
  
  COLLABORATION_SESSION: {
    name: 'Collaboration Session',
    description: 'Team collaboration workflow',
    steps: [
      { type: 'open', target: 'planning', order: 1 },
      { type: 'open', target: 'development', order: 2 },
      { type: 'open', target: 'review', order: 3 },
      { type: 'open', target: 'deployment', order: 4 }
    ]
  }
};

// =============================================================================
// TAB ANIMATIONS
// =============================================================================

export const TAB_ANIMATIONS = {
  OPEN: {
    initial: { opacity: 0, x: -20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  CLOSE: {
    initial: { opacity: 1, x: 0, scale: 1 },
    animate: { opacity: 0, x: -20, scale: 0.95 },
    transition: { duration: 0.15, ease: 'easeIn' }
  },
  
  REORDER: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 1, scale: 1.05 },
    exit: { opacity: 1, scale: 1 },
    transition: { duration: 0.1, ease: 'easeOut' }
  },
  
  GROUP: {
    initial: { opacity: 0, y: -10, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// =============================================================================
// TAB PERFORMANCE THRESHOLDS
// =============================================================================

export const TAB_PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: {
    EXCELLENT: 100,
    GOOD: 300,
    ACCEPTABLE: 1000,
    POOR: 3000,
    CRITICAL: 5000
  },
  
  MEMORY_USAGE: {
    EXCELLENT: 10,
    GOOD: 50,
    ACCEPTABLE: 100,
    POOR: 200,
    CRITICAL: 500
  },
  
  INTERACTION_LATENCY: {
    EXCELLENT: 16,
    GOOD: 50,
    ACCEPTABLE: 100,
    POOR: 300,
    CRITICAL: 1000
  }
};

// =============================================================================
// TAB ACCESSIBILITY CONFIGURATIONS
// =============================================================================

export const TAB_ACCESSIBILITY_CONFIG = {
  KEYBOARD_NAVIGATION: {
    enabled: true,
    shortcuts: {
      nextTab: 'Ctrl+Tab',
      previousTab: 'Ctrl+Shift+Tab',
      closeTab: 'Ctrl+W',
      newTab: 'Ctrl+T',
      pinTab: 'Ctrl+Shift+P',
      favoriteTab: 'Ctrl+Shift+F'
    }
  },
  
  SCREEN_READER: {
    enabled: true,
    announcements: {
      tabOpened: 'Tab opened: {title}',
      tabClosed: 'Tab closed: {title}',
      tabPinned: 'Tab pinned: {title}',
      tabUnpinned: 'Tab unpinned: {title}',
      tabGrouped: 'Tab grouped: {title}'
    }
  },
  
  HIGH_CONTRAST: {
    enabled: false,
    colors: {
      activeTab: '#ffffff',
      inactiveTab: '#cccccc',
      pinnedTab: '#3b82f6',
      favoriteTab: '#f59e0b'
    }
  }
};




