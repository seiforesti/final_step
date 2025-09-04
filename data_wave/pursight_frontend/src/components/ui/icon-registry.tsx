/**
 * 🎯 ADVANCED ICON REGISTRY SYSTEM
 * =================================
 * 
 * Enterprise-grade icon management system that resolves Lucide React
 * barrel optimization conflicts and provides advanced icon functionality
 * for the entire Racine platform.
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

// Advanced icon type definitions
export type IconName = keyof typeof LucideIcons;
export type IconProps = React.ComponentProps<'svg'> & {
  size?: number | string;
  color?: string;
  className?: string;
  variant?: 'outline' | 'filled' | 'duotone';
  animation?: 'pulse' | 'spin' | 'bounce' | 'ping';
};

// Icon registry with advanced features
export const IconRegistry = {
  // Core icon mapping
  icons: LucideIcons,
  
  // Advanced icon variants
  variants: {
    outline: 'stroke-current',
    filled: 'fill-current',
    duotone: 'fill-current opacity-50'
  },
  
  // Animation classes
  animations: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    ping: 'animate-ping'
  },
  
  // Icon categories for advanced organization
  categories: {
    navigation: ['ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
    actions: ['Play', 'Pause', 'Stop', 'Square', 'RotateCcw', 'RefreshCw', 'Save', 'Download', 'Upload'],
    status: ['CheckCircle', 'XCircle', 'AlertTriangle', 'AlertCircle', 'Info', 'Warning', 'Success'],
    data: ['Database', 'Table', 'FileText', 'Folder', 'Search', 'Filter', 'SortAsc', 'SortDesc'],
    analytics: ['BarChart3', 'LineChart', 'PieChart', 'TrendingUp', 'TrendingDown', 'Activity', 'Target'],
    security: ['Shield', 'Lock', 'Unlock', 'Eye', 'EyeOff', 'Key', 'Fingerprint'],
    workflow: ['GitBranch', 'Workflow', 'Layers', 'Network', 'Zap', 'Brain', 'Cpu']
  }
};

// Advanced icon component with enhanced functionality
export const AdvancedIcon: React.FC<IconProps & { name: IconName }> = ({
  name,
  size = 24,
  color,
  className = '',
  variant = 'outline',
  animation,
  ...props
}) => {
  const IconComponent = IconRegistry.icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in registry`);
    return <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />;
  }
  
  const variantClass = IconRegistry.variants[variant];
  const animationClass = animation ? IconRegistry.animations[animation] : '';
  
  return (
    <IconComponent
      size={size}
      className={`${variantClass} ${animationClass} ${className}`}
      style={color ? { color } : undefined}
      {...props}
    />
  );
};

// Icon factory for advanced use cases
export const createIconFactory = (defaultProps: Partial<IconProps> = {}) => {
  return (name: IconName, props: Partial<IconProps> = {}) => {
    return React.createElement(AdvancedIcon, {
      name,
      ...defaultProps,
      ...props
    });
  };
};

// Advanced icon selector with intelligent fallbacks
export const IconSelector: React.FC<{
  primary: IconName;
  fallbacks?: IconName[];
  onIconChange?: (icon: IconName) => void;
} & IconProps> = ({ primary, fallbacks = [], onIconChange, ...props }) => {
  const [currentIcon, setCurrentIcon] = React.useState<IconName>(primary);
  
  const availableIcons = [primary, ...fallbacks].filter(icon => 
    IconRegistry.icons[icon]
  );
  
  const handleIconChange = (icon: IconName) => {
    setCurrentIcon(icon);
    onIconChange?.(icon);
  };
  
  if (availableIcons.length === 0) {
    return <div className="w-6 h-6 bg-gray-200 rounded" />;
  }
  
  return (
    <AdvancedIcon
      name={currentIcon}
      {...props}
    />
  );
};

// Export all icons for backward compatibility
export * from 'lucide-react';

// Advanced icon utilities
export const IconUtils = {
  // Get icon by category
  getByCategory: (category: keyof typeof IconRegistry.categories) => {
    return IconRegistry.categories[category].filter(icon => 
      IconRegistry.icons[icon]
    );
  },
  
  // Search icons by name
  search: (query: string) => {
    const searchTerm = query.toLowerCase();
    return Object.keys(IconRegistry.icons).filter(iconName =>
      iconName.toLowerCase().includes(searchTerm)
    ) as IconName[];
  },
  
  // Validate icon exists
  exists: (name: string): name is IconName => {
    return name in IconRegistry.icons;
  },
  
  // Get icon metadata
  getMetadata: (name: IconName) => {
    const IconComponent = IconRegistry.icons[name];
    if (!IconComponent) return null;
    
    return {
      name,
      component: IconComponent,
      displayName: name.replace(/([A-Z])/g, ' $1').trim(),
      category: Object.entries(IconRegistry.categories).find(([_, icons]) =>
        icons.includes(name)
      )?.[0] || 'other'
    };
  }
};

// Default export for backward compatibility
export default IconRegistry;

