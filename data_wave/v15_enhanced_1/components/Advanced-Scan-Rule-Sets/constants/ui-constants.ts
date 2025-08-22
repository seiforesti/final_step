/**
 * Advanced UI Constants for Enterprise Data Governance
 * Comprehensive UI configurations, themes, animations, layout constants,
 * and visual design tokens for scan rule management interface
 */

// =============================================================================
// THEME CONFIGURATIONS
// =============================================================================

export const THEME_CONFIG = {
  // Color palette
  COLORS: {
    // Primary colors
    PRIMARY: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },

    // Secondary colors
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

    // Success colors
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

    // Warning colors
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

    // Error colors
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

    // Info colors
    INFO: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },

    // Neutral colors
    NEUTRAL: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    }
  },

  // Typography scale
  TYPOGRAPHY: {
    // Font families
    FONT_FAMILIES: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      heading: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
    },

    // Font sizes
    FONT_SIZES: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
      '9xl': '8rem'      // 128px
    },

    // Font weights
    FONT_WEIGHTS: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },

    // Line heights
    LINE_HEIGHTS: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },

    // Letter spacing
    LETTER_SPACING: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  // Spacing scale
  SPACING: {
    px: '1px',
    0: '0px',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    11: '2.75rem',     // 44px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
    36: '9rem',        // 144px
    40: '10rem',       // 160px
    44: '11rem',       // 176px
    48: '12rem',       // 192px
    52: '13rem',       // 208px
    56: '14rem',       // 224px
    60: '15rem',       // 240px
    64: '16rem',       // 256px
    72: '18rem',       // 288px
    80: '20rem',       // 320px
    96: '24rem'        // 384px
  },

  // Border radius
  BORDER_RADIUS: {
    none: '0px',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px'
  },

  // Shadows
  SHADOWS: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000'
  }
} as const;

// =============================================================================
// LAYOUT CONFIGURATIONS
// =============================================================================

export const LAYOUT_CONFIG = {
  // Container sizes
  CONTAINER_SIZES: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
    '4xl': '2560px'
  },

  // Grid configurations
  GRID: {
    COLUMNS: {
      1: 'repeat(1, minmax(0, 1fr))',
      2: 'repeat(2, minmax(0, 1fr))',
      3: 'repeat(3, minmax(0, 1fr))',
      4: 'repeat(4, minmax(0, 1fr))',
      5: 'repeat(5, minmax(0, 1fr))',
      6: 'repeat(6, minmax(0, 1fr))',
      7: 'repeat(7, minmax(0, 1fr))',
      8: 'repeat(8, minmax(0, 1fr))',
      9: 'repeat(9, minmax(0, 1fr))',
      10: 'repeat(10, minmax(0, 1fr))',
      11: 'repeat(11, minmax(0, 1fr))',
      12: 'repeat(12, minmax(0, 1fr))'
    },
    GAPS: {
      0: '0px',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem'
    }
  },

  // Flexbox configurations
  FLEX: {
    DIRECTIONS: {
      row: 'row',
      'row-reverse': 'row-reverse',
      col: 'column',
      'col-reverse': 'column-reverse'
    },
    WRAPS: {
      wrap: 'wrap',
      'wrap-reverse': 'wrap-reverse',
      'no-wrap': 'nowrap'
    },
    JUSTIFICATIONS: {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly'
    },
    ALIGNMENTS: {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      baseline: 'baseline',
      stretch: 'stretch'
    }
  },

  // Header configurations
  HEADER: {
    height: '4rem',        // 64px
    mobileHeight: '3.5rem', // 56px
    zIndex: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropBlur: 'blur(8px)',
    borderColor: 'rgb(229 231 235 / 0.8)'
  },

  // Sidebar configurations
  SIDEBAR: {
    width: '16rem',        // 256px
    collapsedWidth: '4rem', // 64px
    mobileWidth: '20rem',   // 320px
    zIndex: 40,
    backgroundColor: 'rgb(248 250 252)',
    borderColor: 'rgb(229 231 235)'
  },

  // Content area
  CONTENT: {
    maxWidth: '1280px',
    padding: '1.5rem',     // 24px
    mobilePadding: '1rem'  // 16px
  }
} as const;

// =============================================================================
// ANIMATION CONFIGURATIONS
// =============================================================================

export const ANIMATION_CONFIG = {
  // Transition durations
  DURATIONS: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms'
  },

  // Easing functions
  EASINGS: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    'elastic-in': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    'elastic-out': 'cubic-bezier(0.215, 0.61, 0.355, 1)'
  },

  // Common animations
  ANIMATIONS: {
    // Fade animations
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },

    // Slide animations
    slideInUp: {
      from: { transform: 'translateY(100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 }
    },
    slideInDown: {
      from: { transform: 'translateY(-100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 }
    },
    slideInLeft: {
      from: { transform: 'translateX(-100%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 }
    },
    slideInRight: {
      from: { transform: 'translateX(100%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 }
    },

    // Scale animations
    scaleIn: {
      from: { transform: 'scale(0.8)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 }
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.8)', opacity: 0 }
    },

    // Rotation animations
    rotate: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    },

    // Pulse animation
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 }
    },

    // Bounce animation
    bounce: {
      '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
      '40%, 43%': { transform: 'translateY(-30px)' },
      '70%': { transform: 'translateY(-15px)' },
      '90%': { transform: 'translateY(-4px)' }
    },

    // Shake animation
    shake: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' }
    }
  },

  // Micro-interactions
  MICRO_INTERACTIONS: {
    buttonHover: {
      scale: 1.02,
      duration: '150ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    buttonPress: {
      scale: 0.98,
      duration: '100ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    cardHover: {
      translateY: '-2px',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    inputFocus: {
      borderColor: 'rgb(59 130 246)',
      shadow: '0 0 0 3px rgb(59 130 246 / 0.1)',
      duration: '150ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
} as const;

// =============================================================================
// COMPONENT-SPECIFIC CONFIGURATIONS
// =============================================================================

export const COMPONENT_CONFIG = {
  // Button configurations
  BUTTON: {
    SIZES: {
      xs: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.75rem',
        lineHeight: '1rem',
        borderRadius: '0.375rem'
      },
      sm: {
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        borderRadius: '0.375rem'
      },
      md: {
        padding: '0.625rem 1.25rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        borderRadius: '0.375rem'
      },
      lg: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        lineHeight: '1.5rem',
        borderRadius: '0.5rem'
      },
      xl: {
        padding: '0.875rem 2rem',
        fontSize: '1rem',
        lineHeight: '1.5rem',
        borderRadius: '0.5rem'
      }
    },
    VARIANTS: {
      primary: {
        backgroundColor: 'rgb(59 130 246)',
        color: 'rgb(255 255 255)',
        border: '1px solid rgb(59 130 246)',
        hover: {
          backgroundColor: 'rgb(37 99 235)'
        }
      },
      secondary: {
        backgroundColor: 'rgb(248 250 252)',
        color: 'rgb(51 65 85)',
        border: '1px solid rgb(203 213 225)',
        hover: {
          backgroundColor: 'rgb(241 245 249)'
        }
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'rgb(59 130 246)',
        border: '1px solid rgb(59 130 246)',
        hover: {
          backgroundColor: 'rgb(59 130 246)',
          color: 'rgb(255 255 255)'
        }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'rgb(51 65 85)',
        border: 'none',
        hover: {
          backgroundColor: 'rgb(248 250 252)'
        }
      },
      destructive: {
        backgroundColor: 'rgb(239 68 68)',
        color: 'rgb(255 255 255)',
        border: '1px solid rgb(239 68 68)',
        hover: {
          backgroundColor: 'rgb(220 38 38)'
        }
      }
    }
  },

  // Input configurations
  INPUT: {
    SIZES: {
      sm: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        borderRadius: '0.375rem'
      },
      md: {
        padding: '0.5rem 0.875rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        borderRadius: '0.375rem'
      },
      lg: {
        padding: '0.625rem 1rem',
        fontSize: '1rem',
        lineHeight: '1.5rem',
        borderRadius: '0.5rem'
      }
    },
    STATES: {
      default: {
        borderColor: 'rgb(209 213 219)',
        backgroundColor: 'rgb(255 255 255)'
      },
      focus: {
        borderColor: 'rgb(59 130 246)',
        outline: '2px solid rgb(59 130 246 / 0.2)'
      },
      error: {
        borderColor: 'rgb(239 68 68)',
        outline: '2px solid rgb(239 68 68 / 0.2)'
      },
      disabled: {
        backgroundColor: 'rgb(249 250 251)',
        borderColor: 'rgb(229 231 235)',
        color: 'rgb(156 163 175)'
      }
    }
  },

  // Card configurations
  CARD: {
    VARIANTS: {
      default: {
        backgroundColor: 'rgb(255 255 255)',
        border: '1px solid rgb(229 231 235)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      },
      outlined: {
        backgroundColor: 'transparent',
        border: '1px solid rgb(229 231 235)',
        borderRadius: '0.5rem',
        padding: '1.5rem'
      },
      elevated: {
        backgroundColor: 'rgb(255 255 255)',
        border: 'none',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    }
  },

  // Badge configurations
  BADGE: {
    SIZES: {
      sm: {
        padding: '0.125rem 0.375rem',
        fontSize: '0.75rem',
        lineHeight: '1rem',
        borderRadius: '9999px'
      },
      md: {
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        lineHeight: '1rem',
        borderRadius: '9999px'
      },
      lg: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        borderRadius: '9999px'
      }
    },
    VARIANTS: {
      default: {
        backgroundColor: 'rgb(248 250 252)',
        color: 'rgb(51 65 85)',
        border: '1px solid rgb(229 231 235)'
      },
      primary: {
        backgroundColor: 'rgb(59 130 246)',
        color: 'rgb(255 255 255)'
      },
      secondary: {
        backgroundColor: 'rgb(100 116 139)',
        color: 'rgb(255 255 255)'
      },
      success: {
        backgroundColor: 'rgb(34 197 94)',
        color: 'rgb(255 255 255)'
      },
      warning: {
        backgroundColor: 'rgb(245 158 11)',
        color: 'rgb(255 255 255)'
      },
      error: {
        backgroundColor: 'rgb(239 68 68)',
        color: 'rgb(255 255 255)'
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'rgb(51 65 85)',
        border: '1px solid rgb(209 213 219)'
      }
    }
  },

  // Modal configurations
  MODAL: {
    SIZES: {
      sm: { maxWidth: '24rem' },      // 384px
      md: { maxWidth: '32rem' },      // 512px
      lg: { maxWidth: '42rem' },      // 672px
      xl: { maxWidth: '48rem' },      // 768px
      '2xl': { maxWidth: '56rem' },   // 896px
      '3xl': { maxWidth: '64rem' },   // 1024px
      '4xl': { maxWidth: '72rem' },   // 1152px
      '5xl': { maxWidth: '80rem' },   // 1280px
      '6xl': { maxWidth: '90rem' },   // 1440px
      full: { maxWidth: '100vw' }
    },
    BACKDROP: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropBlur: 'blur(4px)'
    }
  },

  // Tooltip configurations
  TOOLTIP: {
    backgroundColor: 'rgb(17 24 39)',
    color: 'rgb(255 255 255)',
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    maxWidth: '20rem',
    zIndex: 1000,
    arrow: {
      size: '4px',
      color: 'rgb(17 24 39)'
    }
  },

  // Table configurations
  TABLE: {
    CELL_PADDING: {
      sm: '0.5rem 0.75rem',
      md: '0.75rem 1rem',
      lg: '1rem 1.25rem'
    },
    STRIPED: {
      backgroundColor: 'rgb(249 250 251)'
    },
    HOVER: {
      backgroundColor: 'rgb(243 244 246)'
    }
  }
} as const;

// =============================================================================
// ICON CONFIGURATIONS
// =============================================================================

export const ICON_CONFIG = {
  // Icon sizes
  SIZES: {
    xs: '0.75rem',    // 12px
    sm: '1rem',       // 16px
    md: '1.25rem',    // 20px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '5rem'     // 80px
  },

  // Icon colors for different states
  COLORS: {
    default: 'rgb(107 114 128)',
    primary: 'rgb(59 130 246)',
    secondary: 'rgb(100 116 139)',
    success: 'rgb(34 197 94)',
    warning: 'rgb(245 158 11)',
    error: 'rgb(239 68 68)',
    info: 'rgb(14 165 233)',
    muted: 'rgb(156 163 175)'
  },

  // Icon families and their default stroke widths
  FAMILIES: {
    lucide: {
      strokeWidth: 2,
      fill: 'none',
      stroke: 'currentColor'
    },
    heroicons: {
      strokeWidth: 1.5,
      fill: 'none',
      stroke: 'currentColor'
    },
    tabler: {
      strokeWidth: 2,
      fill: 'none',
      stroke: 'currentColor'
    }
  }
} as const;

// =============================================================================
// RESPONSIVE BREAKPOINTS
// =============================================================================

export const BREAKPOINTS = {
  // Breakpoint values
  VALUES: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px'
  },

  // Media queries
  MEDIA_QUERIES: {
    xs: '@media (min-width: 475px)',
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
    '3xl': '@media (min-width: 1920px)'
  },

  // Mobile-first approach
  UP: {
    xs: '(min-width: 475px)',
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
    '3xl': '(min-width: 1920px)'
  },

  // Desktop-first approach
  DOWN: {
    xs: '(max-width: 474px)',
    sm: '(max-width: 639px)',
    md: '(max-width: 767px)',
    lg: '(max-width: 1023px)',
    xl: '(max-width: 1279px)',
    '2xl': '(max-width: 1535px)',
    '3xl': '(max-width: 1919px)'
  }
} as const;

// =============================================================================
// Z-INDEX LAYERS
// =============================================================================

export const Z_INDEX = {
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  notification: 1900,
  loading: 2000,
  debug: 9999
} as const;

// =============================================================================
// ACCESSIBILITY CONFIGURATIONS
// =============================================================================

export const A11Y_CONFIG = {
  // Focus configurations
  FOCUS: {
    ringWidth: '2px',
    ringColor: 'rgb(59 130 246)',
    ringOpacity: '0.5',
    ringOffset: '2px',
    ringOffsetColor: 'rgb(255 255 255)'
  },

  // Color contrast ratios (WCAG 2.1 AA)
  CONTRAST_RATIOS: {
    normal: 4.5,
    large: 3.0,
    enhanced: 7.0
  },

  // Screen reader configurations
  SCREEN_READER: {
    skipToContent: 'Skip to main content',
    skipToNavigation: 'Skip to navigation',
    skipToFooter: 'Skip to footer',
    mainLandmark: 'Main content',
    navigationLandmark: 'Main navigation',
    searchLandmark: 'Search',
    bannerLandmark: 'Site header',
    contentInfoLandmark: 'Site footer'
  },

  // Reduced motion preferences
  REDUCED_MOTION: {
    respectUserPreference: true,
    fallbackDuration: '0.01ms',
    fallbackEasing: 'linear'
  }
} as const;

// =============================================================================
// PERFORMANCE CONFIGURATIONS
// =============================================================================

export const PERFORMANCE_CONFIG = {
  // Lazy loading
  LAZY_LOADING: {
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  },

  // Virtual scrolling
  VIRTUAL_SCROLLING: {
    itemHeight: 50,
    bufferSize: 5,
    overscan: 2
  },

  // Debounce and throttle
  DEBOUNCE_DELAY: {
    search: 300,
    resize: 100,
    scroll: 16,
    input: 200
  },

  // Bundle splitting
  BUNDLE_SPLITTING: {
    chunkSize: 244000, // ~244KB
    maxChunks: 20,
    minChunkSize: 10000 // ~10KB
  }
} as const;

// =============================================================================
// EXPORT ALL UI CONSTANTS
// =============================================================================

export const UI_CONSTANTS = {
  THEME: THEME_CONFIG,
  LAYOUT: LAYOUT_CONFIG,
  ANIMATION: ANIMATION_CONFIG,
  COMPONENT: COMPONENT_CONFIG,
  ICON: ICON_CONFIG,
  BREAKPOINTS,
  Z_INDEX,
  A11Y: A11Y_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG
} as const;

// Note: individual groups are already exported above using `export const` declarations.

// Default export
export default UI_CONSTANTS;