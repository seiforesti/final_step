// ============================================================================
// ADVANCED ENTERPRISE ICON LIBRARY
// ============================================================================
// This file provides advanced enterprise-level custom icon implementations
// for all missing lucide-react icons with sophisticated SVG designs

import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';

// ============================================================================
// ADVANCED ICON INTERFACES
// ============================================================================

export interface AdvancedIconProps extends LucideProps {
  variant?: 'outline' | 'filled' | 'duotone' | 'gradient';
  strokeWidth?: number;
  fillOpacity?: number;
  gradientColors?: [string, string];
  animation?: 'pulse' | 'spin' | 'bounce' | 'none';
  size?: number | string;
  className?: string;
}

// ============================================================================
// TRENDING UP DOWN ICON - Advanced Enterprise Implementation
// ============================================================================
export const TrendingUpDown: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#f59e0b', '#d97706'], animation = 'none', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
    const isFilled = variant === 'filled';
    const isDuotone = variant === 'duotone';
    
    const animationClass = animation !== 'none' ? `animate-${animation}` : '';
    
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${animationClass} ${className}`}
        {...props}
      >
        {isGradient && (
          <defs>
            <linearGradient id="trendingUpDownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        {/* Trending Up Line */}
        <path
          d="M3 17l4-4 4 4 4-4 4 4"
          fill="none"
          stroke={isGradient ? 'url(#trendingUpDownGradient)' : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Trending Down Line */}
        <path
          d="M3 7l4 4 4-4 4 4 4-4"
          fill="none"
          stroke={isGradient ? 'url(#trendingUpDownGradient)' : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Trend Indicators */}
        <circle cx="7" cy="13" r="1" fill={isGradient ? 'url(#trendingUpDownGradient)' : 'currentColor'} opacity={0.6} />
        <circle cx="11" cy="9" r="1" fill={isGradient ? 'url(#trendingUpDownGradient)' : 'currentColor'} opacity={0.6} />
        <circle cx="15" cy="13" r="1" fill={isGradient ? 'url(#trendingUpDownGradient)' : 'currentColor'} opacity={0.6} />
        <circle cx="19" cy="9" r="1" fill={isGradient ? 'url(#trendingUpDownGradient)' : 'currentColor'} opacity={0.6} />
        
        {/* Trend Direction Arrows */}
        <path
          d="M21 3v6"
          fill="none"
          stroke={isGradient ? 'url(#trendingUpDownGradient)' : 'currentColor'}
          strokeWidth={strokeWidth * 0.8}
          opacity={0.4}
        />
        <path
          d="M21 21v-6"
          fill="none"
          stroke={isGradient ? 'url(#trendingUpDownGradient)' : 'currentColor'}
          strokeWidth={strokeWidth * 0.8}
          opacity={0.4}
        />
      </svg>
    );
  }
);

TrendingUpDown.displayName = 'TrendingUpDown';

// ============================================================================
// CLOUD UPLOAD ICON - Advanced Enterprise Implementation
// ============================================================================
export const CloudUpload: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#3b82f6', '#1d4ed8'], animation = 'none', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
    const isFilled = variant === 'filled';
    const isDuotone = variant === 'duotone';
    
    const animationClass = animation !== 'none' ? `animate-${animation}` : '';
    
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${animationClass} ${className}`}
        {...props}
      >
        {isGradient && (
          <defs>
            <linearGradient id="cloudUploadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        {/* Cloud */}
        <path
          d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
          fill={isFilled ? 'currentColor' : isDuotone ? `url(#cloudUploadGradient)` : 'none'}
          fillOpacity={isFilled ? fillOpacity : 1}
          stroke={isGradient ? 'url(#cloudUploadGradient)' : 'currentColor'}
        />
        
        {/* Upload Arrow */}
        <path
          d="M12 12v9"
          fill="none"
          stroke={isGradient ? 'url(#cloudUploadGradient)' : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <path
          d="M16 16l-4-4-4-4"
          fill="none"
          stroke={isGradient ? 'url(#cloudUploadGradient)' : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Cloud Details */}
        <path
          d="M8 14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2"
          fill="none"
          stroke={isGradient ? 'url(#cloudUploadGradient)' : 'currentColor'}
          strokeWidth={strokeWidth * 0.8}
          opacity={0.6}
        />
        
        {/* Upload Progress Indicator */}
        <circle cx="12" cy="18" r="1" fill={isGradient ? 'url(#cloudUploadGradient)' : 'currentColor'} opacity={0.8} />
      </svg>
    );
  }
);

CloudUpload.displayName = 'CloudUpload';

// ============================================================================
// FILE PDF ICON - Advanced Enterprise Implementation
// ============================================================================
export const FilePdf: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#ef4444', '#dc2626'], animation = 'none', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
    const isFilled = variant === 'filled';
    const isDuotone = variant === 'duotone';
    
    const animationClass = animation !== 'none' ? `animate-${animation}` : '';
    
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${animationClass} ${className}`}
        {...props}
      >
        {isGradient && (
          <defs>
            <linearGradient id="filePdfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        {/* File */}
        <path
          d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
          fill={isFilled ? 'currentColor' : isDuotone ? `url(#filePdfGradient)` : 'none'}
          fillOpacity={isFilled ? fillOpacity : 1}
          stroke={isGradient ? 'url(#filePdfGradient)' : 'currentColor'}
        />
        
        {/* PDF Text */}
        <text
          x="12"
          y="12"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill={isGradient ? 'url(#filePdfGradient)' : 'currentColor'}
        >
          PDF
        </text>
        
        {/* File Corner */}
        <polyline
          points="14,2 14,8 20,8"
          fill="none"
          stroke={isGradient ? 'url(#filePdfGradient)' : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* PDF Document Lines */}
        <line x1="8" y1="16" x2="16" y2="16" stroke={isGradient ? 'url(#filePdfGradient)' : 'currentColor'} opacity={0.6} />
        <line x1="8" y1="18" x2="14" y2="18" stroke={isGradient ? 'url(#filePdfGradient)' : 'currentColor'} opacity={0.6} />
        <line x1="8" y1="20" x2="12" y2="20" stroke={isGradient ? 'url(#filePdfGradient)' : 'currentColor'} opacity={0.6} />
      </svg>
    );
  }
);

FilePdf.displayName = 'FilePdf';

// ============================================================================
// ICON ALIASES MAPPING
// ============================================================================

export const ADVANCED_ICONS = {
  TrendingUpDown,
  CloudUpload,
  FilePdf
} as const;

// ============================================================================
// ADVANCED ICON UTILITIES
// ============================================================================

/**
 * Get advanced icon component by name with fallback support
 */
export function getAdvancedIconByName(iconName: string, props?: AdvancedIconProps) {
  const IconComponent = ADVANCED_ICONS[iconName as keyof typeof ADVANCED_ICONS];
  if (!IconComponent) {
    console.warn(`Advanced icon "${iconName}" not found, falling back to basic implementation`);
    return null;
  }
  return IconComponent;
}

/**
 * Check if an advanced icon exists
 */
export function advancedIconExists(iconName: string): boolean {
  return iconName in ADVANCED_ICONS;
}

/**
 * Get all available advanced icon names
 */
export function getAvailableAdvancedIconNames(): string[] {
  return Object.keys(ADVANCED_ICONS);
}

/**
 * Create advanced icon with enhanced styling
 */
export function createAdvancedIcon(iconName: string, props: AdvancedIconProps = {}) {
  const IconComponent = getAdvancedIconByName(iconName);
  if (!IconComponent) return null;
  
  return <IconComponent {...props} />;
}

export default ADVANCED_ICONS;

