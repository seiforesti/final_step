/**
 * Responsive Configuration Constants
 * ===================================
 * 
 * Configuration constants for responsive design system
 */

export const RESPONSIVE_BREAKPOINTS = {
  mobile: {
    minWidth: 0,
    maxWidth: 639,
    deviceTypes: ['mobile'],
    layoutModes: ['compact', 'single-column'],
    performanceProfile: {
      cpuClass: 'medium',
      memoryClass: 'medium',
      gpuClass: 'medium',
      storageType: 'ssd',
      networkClass: 'medium',
      batteryLevel: 100,
      thermalState: 'normal'
    },
    optimizations: [
      { type: 'layout', action: 'reduce-columns', parameters: { columns: 1 } },
      { type: 'performance', action: 'minimize-animations', parameters: { level: 'minimal' } },
      { type: 'accessibility', action: 'increase-touch-targets', parameters: { size: 44 } }
    ],
    animations: [
      { type: 'fade', duration: 200, easing: 'ease-out' },
      { type: 'slide', duration: 300, easing: 'ease-in-out' }
    ]
  },
  tablet: {
    minWidth: 640,
    maxWidth: 1023,
    deviceTypes: ['tablet'],
    layoutModes: ['medium', 'two-column'],
    performanceProfile: {
      cpuClass: 'high',
      memoryClass: 'high',
      gpuClass: 'high',
      storageType: 'ssd',
      networkClass: 'fast',
      batteryLevel: 100,
      thermalState: 'normal'
    },
    optimizations: [
      { type: 'layout', action: 'adjust-columns', parameters: { columns: 2 } },
      { type: 'performance', action: 'optimize-animations', parameters: { level: 'reduced' } },
      { type: 'accessibility', action: 'enhance-touch', parameters: { size: 40 } }
    ],
    animations: [
      { type: 'fade', duration: 250, easing: 'ease-out' },
      { type: 'slide', duration: 350, easing: 'ease-in-out' },
      { type: 'scale', duration: 200, easing: 'ease-out' }
    ]
  },
  desktop: {
    minWidth: 1024,
    maxWidth: 1535,
    deviceTypes: ['desktop'],
    layoutModes: ['comfortable', 'multi-column'],
    performanceProfile: {
      cpuClass: 'high',
      memoryClass: 'high',
      gpuClass: 'high',
      storageType: 'ssd',
      networkClass: 'fast',
      batteryLevel: 100,
      thermalState: 'normal'
    },
    optimizations: [
      { type: 'layout', action: 'full-columns', parameters: { columns: 3 } },
      { type: 'performance', action: 'full-animations', parameters: { level: 'full' } },
      { type: 'accessibility', action: 'keyboard-optimized', parameters: { focus: true } }
    ],
    animations: [
      { type: 'fade', duration: 300, easing: 'ease-out' },
      { type: 'slide', duration: 400, easing: 'ease-in-out' },
      { type: 'scale', duration: 250, easing: 'ease-out' },
      { type: 'rotate', duration: 200, easing: 'ease-in-out' }
    ]
  },
  ultrawide: {
    minWidth: 1536,
    maxWidth: Infinity,
    deviceTypes: ['desktop', 'ultrawide'],
    layoutModes: ['spacious', 'wide-column'],
    performanceProfile: {
      cpuClass: 'ultra',
      memoryClass: 'ultra',
      gpuClass: 'ultra',
      storageType: 'nvme',
      networkClass: 'ultra',
      batteryLevel: 100,
      thermalState: 'normal'
    },
    optimizations: [
      { type: 'layout', action: 'wide-columns', parameters: { columns: 4 } },
      { type: 'performance', action: 'ultra-animations', parameters: { level: 'ultra' } },
      { type: 'accessibility', action: 'advanced-features', parameters: { advanced: true } }
    ],
    animations: [
      { type: 'fade', duration: 350, easing: 'ease-out' },
      { type: 'slide', duration: 450, easing: 'ease-in-out' },
      { type: 'scale', duration: 300, easing: 'ease-out' },
      { type: 'rotate', duration: 250, easing: 'ease-in-out' },
      { type: 'morph', duration: 400, easing: 'ease-in-out' }
    ]
  }
};

export const DEVICE_OPTIMIZATIONS = {
  mobile: {
    touchOptimized: true,
    compactLayout: true,
    batteryOptimized: true,
    reducedAnimations: true,
    largeTouchTargets: true
  },
  tablet: {
    touchOptimized: true,
    mediumLayout: true,
    balancedPerformance: true,
    moderateAnimations: true,
    mediumTouchTargets: true
  },
  desktop: {
    keyboardOptimized: true,
    fullLayout: true,
    highPerformance: true,
    fullAnimations: true,
    standardTargets: true
  },
  ultrawide: {
    advancedFeatures: true,
    spaciousLayout: true,
    ultraPerformance: true,
    ultraAnimations: true,
    advancedTargets: true
  }
};

export const BREAKPOINT_ANIMATIONS = {
  mobile: {
    transitionDuration: 200,
    easing: 'ease-out',
    reducedMotion: true
  },
  tablet: {
    transitionDuration: 250,
    easing: 'ease-in-out',
    moderateMotion: true
  },
  desktop: {
    transitionDuration: 300,
    easing: 'ease-out',
    fullMotion: true
  },
  ultrawide: {
    transitionDuration: 350,
    easing: 'ease-in-out',
    ultraMotion: true
  }
};

export const RESPONSIVE_TEMPLATES = {
  mobile: {
    layout: 'single-column',
    spacing: 'compact',
    typography: 'mobile-optimized',
    navigation: 'bottom-tabs'
  },
  tablet: {
    layout: 'two-column',
    spacing: 'medium',
    typography: 'tablet-optimized',
    navigation: 'side-panel'
  },
  desktop: {
    layout: 'multi-column',
    spacing: 'comfortable',
    typography: 'desktop-optimized',
    navigation: 'top-bar'
  },
  ultrawide: {
    layout: 'wide-column',
    spacing: 'spacious',
    typography: 'ultrawide-optimized',
    navigation: 'advanced-panel'
  }
};
