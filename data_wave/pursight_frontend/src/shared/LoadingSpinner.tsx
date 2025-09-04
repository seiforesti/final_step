/**
 * 🌀 ADVANCED ENTERPRISE LOADING SPINNER
 * ======================================
 * 
 * Advanced loading component with multiple states, animations, and enterprise-grade features.
 * Supports different loading types, progress tracking, and accessibility compliance.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib copie/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'pulse' | 'dots' | 'bars';
  text?: string;
  progress?: number;
  showProgress?: boolean;
  animated?: boolean;
  className?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  onComplete?: () => void;
  timeout?: number;
  showTimeout?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const variantClasses = {
  default: 'text-primary',
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  pulse: 'text-purple-600',
  dots: 'text-indigo-600',
  bars: 'text-cyan-600'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  progress,
  showProgress = false,
  animated = true,
  className,
  overlay = false,
  fullScreen = false,
  onComplete,
  timeout,
  showTimeout = false
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (progress === 100 && onComplete) {
      setIsComplete(true);
      setTimeout(onComplete, 500);
    }
  }, [progress, onComplete]);

  useEffect(() => {
    if (timeout && showTimeout) {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeout, showTimeout]);

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            className={cn('rounded-full bg-current', sizeClasses[size])}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn('w-2 h-2 rounded-full bg-current', variantClasses[variant])}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={cn('w-1 h-6 bg-current rounded', variantClasses[variant])}
                animate={{
                  scaleY: [1, 2, 1]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <motion.div
            animate={animated ? { rotate: 360 } : {}}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Loader2 className={cn(sizeClasses[size], variantClasses[variant])} />
          </motion.div>
        );
    }
  };

  const renderProgress = () => {
    if (!showProgress || progress === undefined) return null;

    return (
      <div className="w-full max-w-xs mt-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div
            className={cn('h-2 rounded-full', {
              'bg-primary': variant === 'default',
              'bg-blue-600': variant === 'primary',
              'bg-green-600': variant === 'success',
              'bg-yellow-600': variant === 'warning',
              'bg-red-600': variant === 'error'
            })}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  };

  const renderTimeout = () => {
    if (!showTimeout || !timeout) return null;

    return (
      <div className="text-xs text-muted-foreground mt-2">
        <Clock className="w-3 h-3 inline mr-1" />
        {timeElapsed}s / {timeout}s
      </div>
    );
  };

  const renderStatus = () => {
    if (isComplete) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-green-600"
        >
          <CheckCircle className={sizeClasses[size]} />
        </motion.div>
      );
    }

    if (progress === 100) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-green-600"
        >
          <CheckCircle className={sizeClasses[size]} />
        </motion.div>
      );
    }

    return renderSpinner();
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      fullScreen ? 'min-h-screen' : 'p-8',
      className
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isComplete ? 'complete' : 'loading'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          {renderStatus()}
          
          {text && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-sm font-medium text-center text-muted-foreground"
            >
              {text}
            </motion.p>
          )}

          {renderProgress()}
          {renderTimeout()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Export default for backward compatibility
export default LoadingSpinner;
