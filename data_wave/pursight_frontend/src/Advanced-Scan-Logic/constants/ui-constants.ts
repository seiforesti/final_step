/**
 * 🎨 UI Constants - Advanced Scan Logic
 * ====================================
 * 
 * Comprehensive UI constants and configurations
 * Provides consistent design system for Advanced-Scan-Logic components
 * 
 * Features:
 * - Design system tokens and variables
 * - Component styling configurations
 * - Layout and responsive breakpoints
 * - Animation and transition definitions
 * - Color palettes and themes
 * - Typography scales and spacing
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

// ==========================================
// DESIGN TOKENS & BRAND COLORS
// ==========================================

export const BRAND_COLORS = {
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  },
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  INFO: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  }
} as const;

// ==========================================
// SEMANTIC COLOR MAPPINGS
// ==========================================

export const SEMANTIC_COLORS = {
  // Status Colors
  ACTIVE: BRAND_COLORS.SUCCESS[500],
  INACTIVE: BRAND_COLORS.SECONDARY[400],
  PENDING: BRAND_COLORS.WARNING[500],
  FAILED: BRAND_COLORS.ERROR[500],
  RUNNING: BRAND_COLORS.INFO[500],
  COMPLETED: BRAND_COLORS.SUCCESS[600],
  CANCELLED: BRAND_COLORS.SECONDARY[500],
  
  // Scan Logic Specific
  ORCHESTRATION: '#8b5cf6', // Purple
  INTELLIGENCE: '#06b6d4', // Cyan
  WORKFLOW: '#10b981', // Emerald
  MONITORING: '#f59e0b', // Amber
  SECURITY: '#ef4444', // Red
  ANALYTICS: '#3b82f6', // Blue
  PERFORMANCE: '#84cc16', // Lime
  COORDINATION: '#ec4899', // Pink
  
  // Data Classification
  PUBLIC: BRAND_COLORS.SECONDARY[300],
  INTERNAL: BRAND_COLORS.INFO[400],
  CONFIDENTIAL: BRAND_COLORS.WARNING[500],
  RESTRICTED: BRAND_COLORS.ERROR[500],
  TOP_SECRET: '#7c2d12' // Dark red
} as const;

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================

export const TYPOGRAPHY = {
  FONT_FAMILIES: {
    PRIMARY: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    MONO: 'JetBrains Mono, "Fira Code", Monaco, Consolas, monospace',
    DISPLAY: 'Lexend, Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  
  FONT_SIZES: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    '2XL': '1.5rem',  // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem', // 36px
    '5XL': '3rem',    // 48px
    '6XL': '3.75rem', // 60px
    '7XL': '4.5rem',  // 72px
    '8XL': '6rem',    // 96px
    '9XL': '8rem'     // 128px
  },
  
  FONT_WEIGHTS: {
    THIN: '100',
    EXTRALIGHT: '200',
    LIGHT: '300',
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800',
    BLACK: '900'
  },
  
  LINE_HEIGHTS: {
    NONE: '1',
    TIGHT: '1.25',
    SNUG: '1.375',
    NORMAL: '1.5',
    RELAXED: '1.625',
    LOOSE: '2'
  }
} as const;

// ==========================================
// SPACING SYSTEM
// ==========================================

export const SPACING = {
  0: '0px',
  PX: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
} as const;

// ==========================================
// BREAKPOINTS & RESPONSIVE DESIGN
// ==========================================

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
  '3XL': '1920px',
  '4XL': '2560px'
} as const;

export const MEDIA_QUERIES = {
  SM: `@media (min-width: ${BREAKPOINTS.SM})`,
  MD: `@media (min-width: ${BREAKPOINTS.MD})`,
  LG: `@media (min-width: ${BREAKPOINTS.LG})`,
  XL: `@media (min-width: ${BREAKPOINTS.XL})`,
  '2XL': `@media (min-width: ${BREAKPOINTS['2XL']})`,
  '3XL': `@media (min-width: ${BREAKPOINTS['3XL']})`,
  '4XL': `@media (min-width: ${BREAKPOINTS['4XL']})`
} as const;

// ==========================================
// COMPONENT DIMENSIONS
// ==========================================

export const COMPONENT_SIZES = {
  HEADER_HEIGHT: '4rem',        // 64px
  SIDEBAR_WIDTH: '16rem',       // 256px
  SIDEBAR_COLLAPSED: '4rem',    // 64px
  FOOTER_HEIGHT: '3rem',        // 48px
  TOOLBAR_HEIGHT: '3.5rem',     // 56px
  TAB_HEIGHT: '2.5rem',         // 40px
  BUTTON_HEIGHT: {
    SM: '2rem',                 // 32px
    MD: '2.5rem',               // 40px
    LG: '3rem',                 // 48px
    XL: '3.5rem'                // 56px
  },
  INPUT_HEIGHT: {
    SM: '2rem',                 // 32px
    MD: '2.5rem',               // 40px
    LG: '3rem'                  // 48px
  },
  CARD_MIN_HEIGHT: '8rem',      // 128px
  MODAL_MAX_WIDTH: '48rem',     // 768px
  DRAWER_WIDTH: '20rem'         // 320px
} as const;

// ==========================================
// BORDER RADIUS & SHADOWS
// ==========================================

export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',     // 2px
  DEFAULT: '0.25rem', // 4px
  MD: '0.375rem',     // 6px
  LG: '0.5rem',       // 8px
  XL: '0.75rem',      // 12px
  '2XL': '1rem',      // 16px
  '3XL': '1.5rem',    // 24px
  FULL: '9999px'
} as const;

export const BOX_SHADOWS = {
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  INNER: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  NONE: '0 0 #0000'
} as const;

// ==========================================
// ANIMATION & TRANSITIONS
// ==========================================

export const ANIMATIONS = {
  DURATIONS: {
    INSTANT: '0ms',
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
    SLOWER: '750ms',
    SLOWEST: '1000ms'
  },
  
  EASINGS: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  KEYFRAMES: {
    FADE_IN: 'fadeIn 300ms ease-in-out',
    FADE_OUT: 'fadeOut 300ms ease-in-out',
    SLIDE_IN_RIGHT: 'slideInRight 300ms ease-out',
    SLIDE_IN_LEFT: 'slideInLeft 300ms ease-out',
    SLIDE_IN_UP: 'slideInUp 300ms ease-out',
    SLIDE_IN_DOWN: 'slideInDown 300ms ease-out',
    SCALE_IN: 'scaleIn 200ms ease-out',
    SCALE_OUT: 'scaleOut 200ms ease-in',
    PULSE: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    SPIN: 'spin 1s linear infinite',
    BOUNCE: 'bounce 1s infinite'
  }
} as const;

// ==========================================
// COMPONENT SPECIFIC CONSTANTS
// ==========================================

export const COMPONENT_CONSTANTS = {
  // Data Table
  TABLE: {
    ROW_HEIGHT: '3rem',
    HEADER_HEIGHT: '3.5rem',
    MAX_ROWS_PER_PAGE: [10, 25, 50, 100],
    DEFAULT_PAGE_SIZE: 25,
    COLUMN_MIN_WIDTH: '100px',
    COLUMN_MAX_WIDTH: '400px'
  },
  
  // Charts & Visualizations
  CHARTS: {
    DEFAULT_HEIGHT: '300px',
    COLORS: [
      SEMANTIC_COLORS.ORCHESTRATION,
      SEMANTIC_COLORS.INTELLIGENCE,
      SEMANTIC_COLORS.WORKFLOW,
      SEMANTIC_COLORS.MONITORING,
      SEMANTIC_COLORS.SECURITY,
      SEMANTIC_COLORS.ANALYTICS,
      SEMANTIC_COLORS.PERFORMANCE,
      SEMANTIC_COLORS.COORDINATION
    ],
    GRID_COLOR: BRAND_COLORS.SECONDARY[200],
    AXIS_COLOR: BRAND_COLORS.SECONDARY[400],
    TOOLTIP_BG: BRAND_COLORS.SECONDARY[800]
  },
  
  // Forms
  FORMS: {
    LABEL_SPACING: SPACING[2],
    INPUT_SPACING: SPACING[4],
    ERROR_COLOR: BRAND_COLORS.ERROR[500],
    SUCCESS_COLOR: BRAND_COLORS.SUCCESS[500],
    REQUIRED_INDICATOR: '*',
    VALIDATION_DELAY: 300
  },
  
  // Navigation
  NAVIGATION: {
    ITEM_HEIGHT: '2.5rem',
    ITEM_PADDING: SPACING[3],
    ACTIVE_INDICATOR_WIDTH: '3px',
    SUBMENU_INDENT: SPACING[6]
  },
  
  // Modals & Overlays
  OVERLAYS: {
    BACKDROP_COLOR: 'rgba(0, 0, 0, 0.5)',
    BACKDROP_BLUR: 'blur(4px)',
    Z_INDEX: {
      DROPDOWN: 1000,
      STICKY: 1020,
      FIXED: 1030,
      MODAL_BACKDROP: 1040,
      MODAL: 1050,
      POPOVER: 1060,
      TOOLTIP: 1070,
      TOAST: 1080
    }
  },
  
  // Status Indicators
  STATUS: {
    DOT_SIZE: '8px',
    BADGE_HEIGHT: '1.5rem',
    BADGE_PADDING: SPACING[2],
    PROGRESS_HEIGHT: '8px',
    PROGRESS_TRACK_COLOR: BRAND_COLORS.SECONDARY[200],
    LOADING_SPINNER_SIZE: '1.5rem'
  }
} as const;

// ==========================================
// SCAN LOGIC SPECIFIC UI CONSTANTS
// ==========================================

export const SCAN_LOGIC_UI = {
  // Orchestration Dashboard
  ORCHESTRATION: {
    CARD_MIN_HEIGHT: '12rem',
    WORKFLOW_NODE_SIZE: '3rem',
    CONNECTION_STROKE_WIDTH: '2px',
    EXECUTION_TIMELINE_HEIGHT: '4rem',
    RESOURCE_METER_HEIGHT: '1rem'
  },
  
  // Intelligence Center
  INTELLIGENCE: {
    INSIGHT_CARD_HEIGHT: '8rem',
    CONFIDENCE_BAR_HEIGHT: '0.5rem',
    ML_MODEL_INDICATOR_SIZE: '1rem',
    PREDICTION_CHART_HEIGHT: '16rem',
    ANOMALY_THRESHOLD_LINE: '2px dashed'
  },
  
  // Workflow Designer
  WORKFLOW: {
    CANVAS_MIN_HEIGHT: '32rem',
    STEP_NODE_WIDTH: '10rem',
    STEP_NODE_HEIGHT: '4rem',
    CONNECTION_CURVE_RADIUS: '1rem',
    TOOLBAR_HEIGHT: '3rem',
    PROPERTY_PANEL_WIDTH: '20rem'
  },
  
  // Performance Monitoring
  PERFORMANCE: {
    METRIC_CARD_HEIGHT: '6rem',
    CHART_CONTAINER_HEIGHT: '20rem',
    THRESHOLD_LINE_WIDTH: '2px',
    ALERT_INDICATOR_SIZE: '0.75rem',
    TIMELINE_TRACK_HEIGHT: '2rem'
  },
  
  // Security Dashboard
  SECURITY: {
    THREAT_LEVEL_INDICATOR_SIZE: '1.5rem',
    COMPLIANCE_SCORE_SIZE: '4rem',
    AUDIT_LOG_ROW_HEIGHT: '2.5rem',
    INCIDENT_CARD_HEIGHT: '10rem',
    POLICY_RULE_HEIGHT: '3rem'
  },
  
  // Analytics Visualization
  ANALYTICS: {
    DASHBOARD_GRID_GAP: SPACING[6],
    WIDGET_MIN_HEIGHT: '12rem',
    FILTER_BAR_HEIGHT: '3.5rem',
    LEGEND_ITEM_HEIGHT: '1.5rem',
    DRILL_DOWN_INDICATOR_SIZE: '1rem'
  }
} as const;

// ==========================================
// THEME CONFIGURATIONS
// ==========================================

export const THEMES = {
  LIGHT: {
    name: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#ffffff',
      cardForeground: '#0f172a',
      popover: '#ffffff',
      popoverForeground: '#0f172a',
      primary: BRAND_COLORS.PRIMARY[600],
      primaryForeground: '#ffffff',
      secondary: BRAND_COLORS.SECONDARY[100],
      secondaryForeground: BRAND_COLORS.SECONDARY[900],
      muted: BRAND_COLORS.SECONDARY[100],
      mutedForeground: BRAND_COLORS.SECONDARY[500],
      accent: BRAND_COLORS.SECONDARY[100],
      accentForeground: BRAND_COLORS.SECONDARY[900],
      destructive: BRAND_COLORS.ERROR[500],
      destructiveForeground: '#ffffff',
      border: BRAND_COLORS.SECONDARY[200],
      input: BRAND_COLORS.SECONDARY[200],
      ring: BRAND_COLORS.PRIMARY[600]
    }
  },
  
  DARK: {
    name: 'dark',
    colors: {
      background: '#020617',
      foreground: '#f8fafc',
      card: '#020617',
      cardForeground: '#f8fafc',
      popover: '#020617',
      popoverForeground: '#f8fafc',
      primary: BRAND_COLORS.PRIMARY[500],
      primaryForeground: '#ffffff',
      secondary: BRAND_COLORS.SECONDARY[800],
      secondaryForeground: BRAND_COLORS.SECONDARY[100],
      muted: BRAND_COLORS.SECONDARY[800],
      mutedForeground: BRAND_COLORS.SECONDARY[400],
      accent: BRAND_COLORS.SECONDARY[800],
      accentForeground: BRAND_COLORS.SECONDARY[100],
      destructive: BRAND_COLORS.ERROR[600],
      destructiveForeground: '#ffffff',
      border: BRAND_COLORS.SECONDARY[800],
      input: BRAND_COLORS.SECONDARY[800],
      ring: BRAND_COLORS.PRIMARY[500]
    }
  }
} as const;

// ==========================================
// ICON SIZES & CONFIGURATIONS
// ==========================================

export const ICONS = {
  SIZES: {
    XS: '12px',
    SM: '16px',
    MD: '20px',
    LG: '24px',
    XL: '32px',
    '2XL': '48px'
  },
  
  STROKE_WIDTHS: {
    THIN: '1',
    NORMAL: '1.5',
    THICK: '2'
  },
  
  SEMANTIC_ICONS: {
    SUCCESS: 'CheckCircle',
    ERROR: 'XCircle',
    WARNING: 'AlertTriangle',
    INFO: 'Info',
    LOADING: 'Loader2',
    ORCHESTRATION: 'Network',
    INTELLIGENCE: 'Brain',
    WORKFLOW: 'GitBranch',
    MONITORING: 'Activity',
    SECURITY: 'Shield',
    ANALYTICS: 'BarChart3',
    PERFORMANCE: 'Gauge',
    COORDINATION: 'Workflow'
  }
} as const;

// ==========================================
// LAYOUT CONFIGURATIONS
// ==========================================

export const LAYOUTS = {
  CONTAINER: {
    MAX_WIDTH: '1440px',
    PADDING: SPACING[6],
    MARGIN: '0 auto'
  },
  
  GRID: {
    COLUMNS: 12,
    GAP: SPACING[6],
    BREAKPOINT_COLUMNS: {
      SM: 4,
      MD: 8,
      LG: 12,
      XL: 12
    }
  },
  
  FLEX: {
    GAPS: {
      XS: SPACING[1],
      SM: SPACING[2],
      MD: SPACING[4],
      LG: SPACING[6],
      XL: SPACING[8]
    }
  },
  
  DASHBOARD: {
    SIDEBAR_WIDTH: COMPONENT_SIZES.SIDEBAR_WIDTH,
    HEADER_HEIGHT: COMPONENT_SIZES.HEADER_HEIGHT,
    CONTENT_PADDING: SPACING[6],
    WIDGET_GAP: SPACING[4]
  }
} as const;

// ==========================================
// ACCESSIBILITY CONSTANTS
// ==========================================

export const ACCESSIBILITY = {
  FOCUS: {
    RING_WIDTH: '2px',
    RING_COLOR: BRAND_COLORS.PRIMARY[500],
    RING_OFFSET: '2px'
  },
  
  CONTRAST: {
    MIN_RATIO: 4.5,
    ENHANCED_RATIO: 7.0
  },
  
  TOUCH_TARGETS: {
    MIN_SIZE: '44px',
    RECOMMENDED_SIZE: '48px'
  },
  
  KEYBOARD_NAVIGATION: {
    TAB_INDEX: {
      FOCUSABLE: 0,
      NOT_FOCUSABLE: -1,
      PRIORITY: 1
    }
  }
} as const;

// ==========================================
// PERFORMANCE CONSTANTS
// ==========================================

export const PERFORMANCE = {
  VIRTUALIZATION: {
    ITEM_HEIGHT: 40,
    OVERSCAN: 5,
    THRESHOLD: 100
  },
  
  DEBOUNCE: {
    SEARCH: 300,
    RESIZE: 100,
    SCROLL: 16
  },
  
  THROTTLE: {
    SCROLL: 16,
    RESIZE: 100,
    MOUSE_MOVE: 16
  },
  
  LAZY_LOADING: {
    ROOT_MARGIN: '50px',
    THRESHOLD: 0.1
  }
} as const;

// ==========================================
// EXPORT CONSOLIDATED UI CONSTANTS
// ==========================================

export const UI_CONSTANTS = {
  BRAND_COLORS,
  SEMANTIC_COLORS,
  TYPOGRAPHY,
  SPACING,
  BREAKPOINTS,
  MEDIA_QUERIES,
  COMPONENT_SIZES,
  BORDER_RADIUS,
  BOX_SHADOWS,
  ANIMATIONS,
  COMPONENT_CONSTANTS,
  SCAN_LOGIC_UI,
  THEMES,
  ICONS,
  LAYOUTS,
  ACCESSIBILITY,
  PERFORMANCE
} as const;

export default UI_CONSTANTS;