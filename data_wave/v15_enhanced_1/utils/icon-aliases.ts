// ============================================================================
// ADVANCED ENTERPRISE ICON LIBRARY
// ============================================================================
// Advanced enterprise-level custom icon implementations for missing lucide-react icons

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
// WARNING ICON - Advanced Enterprise Implementation
// ============================================================================
export const Warning: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#f59e0b', '#ef4444'], animation = 'none', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
    const isFilled = variant === 'filled';
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
            <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        <path
          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          fill={isFilled ? 'currentColor' : 'none'}
          fillOpacity={isFilled ? fillOpacity : 1}
          stroke={isGradient ? 'url(#warningGradient)' : 'currentColor'}
        />
        
        <line x1="12" y1="9" x2="12" y2="13" stroke={isGradient ? 'url(#warningGradient)' : 'currentColor'} />
        <line x1="12" y1="17" x2="12.01" y2="17" stroke={isGradient ? 'url(#warningGradient)' : 'currentColor'} />
      </svg>
    );
  }
);

Warning.displayName = 'Warning';

// ============================================================================
// SCHEDULE ICON - Advanced Enterprise Implementation
// ============================================================================
export const Schedule: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#3b82f6', '#1d4ed8'], animation = 'none', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
    const isFilled = variant === 'filled';
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
            <linearGradient id="scheduleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          ry="2"
          fill={isFilled ? 'currentColor' : 'none'}
          fillOpacity={isFilled ? fillOpacity : 1}
          stroke={isGradient ? 'url(#scheduleGradient)' : 'currentColor'}
        />
        
        <line x1="16" y1="2" x2="16" y2="6" stroke={isGradient ? 'url(#scheduleGradient)' : 'currentColor'} />
        <line x1="8" y1="2" x2="8" y2="6" stroke={isGradient ? 'url(#scheduleGradient)' : 'currentColor'} />
        <line x1="3" y1="10" x2="21" y2="10" stroke={isGradient ? 'url(#scheduleGradient)' : 'currentColor'} />
        
        <circle cx="8" cy="14" r="1" fill={isGradient ? 'url(#scheduleGradient)' : 'currentColor'} />
        <circle cx="12" cy="14" r="1" fill={isGradient ? 'url(#scheduleGradient)' : 'currentColor'} />
        <circle cx="16" cy="14" r="1" fill={isGradient ? 'url(#scheduleGradient)' : 'currentColor'} />
        <circle cx="8" cy="18" r="1" fill={isGradient ? 'url(#scheduleGradient)' : 'currentColor'} />
        <circle cx="12" cy="18" r="1" fill={isGradient ? 'url(#scheduleGradient)' : 'currentColor'} />
      </svg>
    );
  }
);

Schedule.displayName = 'Schedule';

// ============================================================================
// SCATTER ICON - Advanced Enterprise Implementation
// ============================================================================
export const Scatter: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#8b5cf6', '#a855f7'], animation = 'none', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
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
            <linearGradient id="scatterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        <circle cx="6" cy="18" r="1.5" fill={isGradient ? 'url(#scatterGradient)' : 'currentColor'} />
        <circle cx="10" cy="12" r="1.5" fill={isGradient ? 'url(#scatterGradient)' : 'currentColor'} />
        <circle cx="14" cy="16" r="1.5" fill={isGradient ? 'url(#scatterGradient)' : 'currentColor'} />
        <circle cx="18" cy="8" r="1.5" fill={isGradient ? 'url(#scatterGradient)' : 'currentColor'} />
        <circle cx="8" cy="6" r="1.5" fill={isGradient ? 'url(#scatterGradient)' : 'currentColor'} />
        <circle cx="12" cy="4" r="1.5" fill={isGradient ? 'url(#scatterGradient)' : 'currentColor'} />
        <circle cx="16" cy="14" r="1.5" fill={isGradient ? 'url(#scatterGradient)' : 'currentColor'} />
        <circle cx="4" cy="10" r="1.5" fill={isGradient ? 'url(#scatterGradient)' : 'currentColor'} />
        
        <line x1="3" y1="21" x2="21" y2="21" stroke={isGradient ? 'url(#scatterGradient)' : 'currentColor'} opacity={0.3} />
        <line x1="3" y1="3" x2="3" y2="21" stroke={isGradient ? 'url(#scatterGradient)' : 'currentColor'} opacity={0.3} />
        
        <path
          d="M4 18 Q8 14 12 12 Q16 10 20 8"
          fill="none"
          stroke={isGradient ? 'url(#scatterGradient)' : 'currentColor'}
          strokeWidth={strokeWidth * 0.5}
          strokeDasharray="2 2"
          opacity={0.6}
        />
      </svg>
    );
  }
);

Scatter.displayName = 'Scatter';

// ============================================================================
// PULSE ICON - Advanced Enterprise Implementation
// ============================================================================
export const Pulse: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#ef4444', '#dc2626'], animation = 'pulse', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
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
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        <path
          d="M3 12h4l2-8 2 16 2-8h4"
          fill="none"
          stroke={isGradient ? 'url(#pulseGradient)' : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <line x1="3" y1="12" x2="21" y2="12" stroke={isGradient ? 'url(#pulseGradient)' : 'currentColor'} opacity={0.3} strokeWidth={strokeWidth * 0.5} />
        
        <circle cx="7" cy="4" r="0.5" fill={isGradient ? 'url(#pulseGradient)' : 'currentColor'} opacity={0.6} />
        <circle cx="11" cy="20" r="0.5" fill={isGradient ? 'url(#pulseGradient)' : 'currentColor'} opacity={0.6} />
        <circle cx="15" cy="4" r="0.5" fill={isGradient ? 'url(#pulseGradient)' : 'currentColor'} opacity={0.6} />
      </svg>
    );
  }
);

Pulse.displayName = 'Pulse';

// ============================================================================
// TOOL ICON - Advanced Enterprise Implementation
// ============================================================================
export const Tool: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#6b7280', '#374151'], animation = 'none', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
    const isFilled = variant === 'filled';
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
            <linearGradient id="toolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          fill={isFilled ? 'currentColor' : 'none'}
          fillOpacity={isFilled ? fillOpacity : 1}
          stroke={isGradient ? 'url(#toolGradient)' : 'currentColor'}
        />
        
        <path
          d="M9 12l-2-2 2-2"
          fill="none"
          stroke={isGradient ? 'url(#toolGradient)' : 'currentColor'}
          strokeWidth={strokeWidth * 0.8}
          opacity={0.6}
        />
        
        <circle cx="18" cy="6" r="0.5" fill={isGradient ? 'url(#toolGradient)' : 'currentColor'} />
      </svg>
    );
  }
);

Tool.displayName = 'Tool';

// ============================================================================
// COMPARE ICON - Advanced Enterprise Implementation
// ============================================================================
export const Compare: LucideIcon = React.forwardRef<SVGSVGElement, AdvancedIconProps>(
  ({ variant = 'outline', strokeWidth = 2, fillOpacity = 0.1, gradientColors = ['#10b981', '#059669'], animation = 'none', size = 24, className = '', ...props }, ref) => {
    const isGradient = variant === 'gradient';
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
            <linearGradient id="compareGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}
        
        <path
          d="M9 18l6-6-6-6"
          fill="none"
          stroke={isGradient ? 'url(#compareGradient)' : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <path
          d="M15 6l-6 6 6 6"
          fill="none"
          stroke={isGradient ? 'url(#compareGradient)' : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <line x1="12" y1="3" x2="12" y2="21" stroke={isGradient ? 'url(#compareGradient)' : 'currentColor'} opacity={0.3} />
        
        <circle cx="8" cy="12" r="1" fill={isGradient ? 'url(#compareGradient)' : 'currentColor'} opacity={0.6} />
        <circle cx="16" cy="12" r="1" fill={isGradient ? 'url(#compareGradient)' : 'currentColor'} opacity={0.6} />
      </svg>
    );
  }
);

Compare.displayName = 'Compare';

// ============================================================================
// ICON ALIASES MAPPING
// ============================================================================

export const ICON_ALIASES = {
  'Warning': Warning,
  'Schedule': Schedule,
  'Scatter': Scatter,
  'Pulse': Pulse,
  'Tool': Tool,
  'Compare': Compare
} as const;

export default ICON_ALIASES;
