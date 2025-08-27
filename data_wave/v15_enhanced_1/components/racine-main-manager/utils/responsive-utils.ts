export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'ultrawide'

export function getActiveBreakpoint(width: number): Breakpoint {
	if (width < 640) return 'mobile'
	if (width < 1024) return 'tablet'
	if (width < 1536) return 'desktop'
	return 'ultrawide'
}

export const detectDeviceCapabilities = async (): Promise<any> => {
  const capabilities = {
    screenSize: { 
      width: typeof window !== 'undefined' ? window.innerWidth : 1920, 
      height: typeof window !== 'undefined' ? window.innerHeight : 1080 
    },
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    touchSupport: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
    hoverSupport: typeof window !== 'undefined' ? window.matchMedia('(hover: hover)').matches : true,
    keyboardSupport: true,
    gestureSupport: typeof window !== 'undefined' ? 'GestureEvent' in window : false,
    accelerometerSupport: typeof window !== 'undefined' ? 'DeviceOrientationEvent' in window : false,
    batteryAPI: typeof navigator !== 'undefined' ? 'getBattery' in navigator : false,
    networkAPI: typeof navigator !== 'undefined' ? 'connection' in navigator : false,
    memoryAPI: typeof performance !== 'undefined' ? 'memory' in (performance as any) : false,
    performanceAPI: typeof window !== 'undefined' ? 'PerformanceObserver' in window : false
  };

  return capabilities;
};

export const optimizeForDevice = async (deviceType: string, capabilities: any): Promise<any> => {
  const optimizations = {
    deviceType,
    optimizations: [] as string[],
    layoutAdjustments: [] as any[],
    performanceSettings: {} as any
  };

  switch (deviceType) {
    case 'mobile':
      optimizations.optimizations.push('touch-optimized', 'compact-layout', 'battery-optimized');
      optimizations.layoutAdjustments.push({ type: 'columns', value: 1 });
      optimizations.performanceSettings = { animationLevel: 'minimal', lazyLoading: true };
      break;
    case 'tablet':
      optimizations.optimizations.push('touch-optimized', 'medium-layout');
      optimizations.layoutAdjustments.push({ type: 'columns', value: 2 });
      optimizations.performanceSettings = { animationLevel: 'reduced', lazyLoading: true };
      break;
    case 'desktop':
      optimizations.optimizations.push('keyboard-optimized', 'full-layout');
      optimizations.layoutAdjustments.push({ type: 'columns', value: 3 });
      optimizations.performanceSettings = { animationLevel: 'full', lazyLoading: false };
      break;
    default:
      optimizations.optimizations.push('standard-layout');
      optimizations.layoutAdjustments.push({ type: 'columns', value: 3 });
      optimizations.performanceSettings = { animationLevel: 'full', lazyLoading: false };
  }

  return optimizations;
};

export const calculateOptimalBreakpoints = (capabilities: any): any[] => {
  const breakpoints = [
    { name: 'mobile', minWidth: 0, maxWidth: 639, deviceTypes: ['mobile'] },
    { name: 'tablet', minWidth: 640, maxWidth: 1023, deviceTypes: ['tablet'] },
    { name: 'desktop', minWidth: 1024, maxWidth: 1535, deviceTypes: ['desktop'] },
    { name: 'ultrawide', minWidth: 1536, maxWidth: Infinity, deviceTypes: ['desktop', 'ultrawide'] }
  ];

  return breakpoints;
};

export const collectRenderingMetrics = async (): Promise<any> => {
  const metrics = {
    frameRate: 60,
    paintTime: 0,
    layoutTime: 0,
    scriptTime: 0,
    inputLatency: 0,
    scrollPerformance: 100,
    animationPerformance: 100,
    memoryUsage: 0,
    batteryImpact: 0,
    networkUsage: 0
  };

  // Collect performance metrics if available
  if (typeof performance !== 'undefined') {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      if (navigation) {
        metrics.paintTime = navigation.loadEventEnd - navigation.loadEventStart;
        metrics.layoutTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        metrics.scriptTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      }
    } catch (error) {
      console.warn('Failed to collect performance metrics:', error);
    }
  }

  // Collect memory usage if available
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    try {
      const memoryInfo = (performance as any).memory;
      metrics.memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100;
    } catch (error) {
      console.warn('Failed to collect memory metrics:', error);
    }
  }

  return metrics;
};

export const getMemoryPressure = async (): Promise<any> => {
  let memoryPressure = {
    level: 'low' as 'low' | 'moderate' | 'high' | 'critical',
    availableMemory: 1024,
    usedMemory: 256,
    pressureScore: 25
  };

  if (typeof performance !== 'undefined' && 'memory' in performance) {
    try {
      const memoryInfo = (performance as any).memory;
      const usedMemory = memoryInfo.usedJSHeapSize / 1024 / 1024; // MB
      const totalMemory = memoryInfo.totalJSHeapSize / 1024 / 1024; // MB
      const pressureScore = (usedMemory / totalMemory) * 100;
      
      memoryPressure = {
        level: pressureScore > 80 ? 'critical' : 
              pressureScore > 60 ? 'high' : 
              pressureScore > 40 ? 'moderate' : 'low',
        availableMemory: totalMemory - usedMemory,
        usedMemory,
        pressureScore
      };
    } catch (error) {
      console.warn('Failed to get memory pressure:', error);
    }
  }

  return memoryPressure;
};

export const calculatePerformanceProfile = async (params: {
  capabilities: any;
  networkCondition: any;
  batteryLevel: number;
  memoryPressure: any;
}): Promise<any> => {
  const { capabilities, networkCondition, batteryLevel, memoryPressure } = params;
  
  // Calculate performance profile based on device capabilities and conditions
  const performanceProfile = {
    cpuClass: 'high' as 'low' | 'medium' | 'high' | 'ultra',
    memoryClass: 'high' as 'low' | 'medium' | 'high' | 'ultra',
    gpuClass: 'high' as 'low' | 'medium' | 'high' | 'ultra',
    storageType: 'ssd' as 'hdd' | 'ssd' | 'nvme',
    networkClass: 'fast' as 'slow' | 'medium' | 'fast' | 'ultra',
    batteryLevel,
    thermalState: 'normal' as 'normal' | 'warm' | 'hot' | 'critical'
  };

  // Determine CPU class based on device capabilities
  if (capabilities.touchSupport && !capabilities.hoverSupport) {
    performanceProfile.cpuClass = 'medium';
  } else if (capabilities.performanceAPI) {
    performanceProfile.cpuClass = 'high';
  }

  // Determine memory class based on memory pressure
  if (memoryPressure.level === 'critical') {
    performanceProfile.memoryClass = 'low';
  } else if (memoryPressure.level === 'high') {
    performanceProfile.memoryClass = 'medium';
  }

  // Determine network class based on network condition
  if (networkCondition.speed < 10) {
    performanceProfile.networkClass = 'slow';
  } else if (networkCondition.speed < 50) {
    performanceProfile.networkClass = 'medium';
  } else if (networkCondition.speed < 100) {
    performanceProfile.networkClass = 'fast';
  } else {
    performanceProfile.networkClass = 'ultra';
  }

  // Determine thermal state based on battery level
  if (batteryLevel < 10) {
    performanceProfile.thermalState = 'critical';
  } else if (batteryLevel < 20) {
    performanceProfile.thermalState = 'hot';
  } else if (batteryLevel < 50) {
    performanceProfile.thermalState = 'warm';
  }

  return performanceProfile;
};

export const responsiveUtils = {
	getActiveBreakpoint,
	detectDeviceCapabilities,
	optimizeForDevice,
	calculateOptimalBreakpoints,
	collectRenderingMetrics,
	getMemoryPressure,
	calculatePerformanceProfile
};
