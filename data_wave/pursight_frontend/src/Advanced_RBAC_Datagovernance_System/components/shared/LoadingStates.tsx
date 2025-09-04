// LoadingStates.tsx - Enterprise-grade loading state components for RBAC system
// Provides comprehensive loading states with advanced patterns, animations, and accessibility

'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Loader2, Shield, Users, Settings, Eye, Database, Search, Download, Upload, Activity, BarChart3, Clock, AlertCircle, CheckCircle, XCircle, Info, Zap } from 'lucide-react';
import { cn } from '@/lib copie/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';

// Loading state types
export interface LoadingStateProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
  children?: React.ReactNode;
}

export interface SkeletonProps {
  className?: string;
  rows?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

export interface ProgressiveLoadingProps {
  stages: Array<{
    id: string;
    label: string;
    status: 'pending' | 'loading' | 'complete' | 'error';
    progress?: number;
    message?: string;
  }>;
  currentStage?: string;
  onStageComplete?: (stageId: string) => void;
  className?: string;
}

export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  allowCancel?: boolean;
  onCancel?: () => void;
  className?: string;
}

// Animation variants
const loadingVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  wave: {
    y: [0, -10, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const skeletonVariants = {
  shimmer: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Basic loading spinner
export const LoadingSpinner: React.FC<LoadingStateProps> = ({
  message,
  size = 'md',
  variant = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <motion.div
        variants={loadingVariants}
        animate="spin"
        className={cn(
          sizeClasses[size],
          variantClasses[variant]
        )}
      >
        <Loader2 className="w-full h-full" />
      </motion.div>
      {message && (
        <span className="text-sm text-gray-600 animate-pulse">{message}</span>
      )}
    </div>
  );
};

// Progress bar component
export const ProgressBar: React.FC<{
  progress: number;
  showLabel?: boolean;
  variant?: LoadingStateProps['variant'];
  className?: string;
}> = ({ progress, showLabel = true, variant = 'primary', className }) => {
  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <motion.div
          className={cn('h-2 rounded-full', variantClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 mt-1 block">
          {Math.round(progress)}% complete
        </span>
      )}
    </div>
  );
};

// Skeleton loading component
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  rows = 1,
  showAvatar = false,
  showImage = false,
  width = '100%',
  height = '1rem',
  animated = true
}) => {
  const skeletonItems = Array.from({ length: rows }, (_, index) => (
    <div
      key={index}
      className="relative overflow-hidden bg-gray-200 rounded-md dark:bg-gray-700"
      style={{ width, height }}
    >
      {animated && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={skeletonVariants}
          animate="shimmer"
        />
      )}
    </div>
  ));

  return (
    <div className={cn('space-y-2', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="relative overflow-hidden bg-gray-200 rounded-full w-10 h-10 dark:bg-gray-700">
            {animated && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                variants={skeletonVariants}
                animate="shimmer"
              />
            )}
          </div>
          <div className="space-y-1 flex-1">
            <div className="relative overflow-hidden bg-gray-200 rounded h-4 w-1/4 dark:bg-gray-700">
              {animated && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  variants={skeletonVariants}
                  animate="shimmer"
                />
              )}
            </div>
            <div className="relative overflow-hidden bg-gray-200 rounded h-3 w-1/3 dark:bg-gray-700">
              {animated && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  variants={skeletonVariants}
                  animate="shimmer"
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {showImage && (
        <div className="relative overflow-hidden bg-gray-200 rounded-lg w-full h-48 dark:bg-gray-700">
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={skeletonVariants}
              animate="shimmer"
            />
          )}
        </div>
      )}
      
      {skeletonItems}
    </div>
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 border rounded-lg bg-white dark:bg-gray-800', className)}>
    <Skeleton rows={3} showAvatar={true} />
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('w-full', className)}>
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b dark:bg-gray-800">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} height="1rem" width="60%" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <Skeleton key={colIndex} height="1rem" width={`${60 + Math.random() * 30}%`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Progressive loading stages
export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  currentStage,
  onStageComplete,
  className
}) => {
  const getStageIcon = (status: string, index: number) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'loading':
        return (
          <motion.div
            variants={loadingVariants}
            animate="spin"
            className="w-5 h-5 text-blue-600"
          >
            <Loader2 className="w-full h-full" />
          </motion.div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-600">{index + 1}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {stages.map((stage, index) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'flex items-center space-x-3 p-3 rounded-lg border',
            stage.status === 'complete' && 'bg-green-50 border-green-200',
            stage.status === 'error' && 'bg-red-50 border-red-200',
            stage.status === 'loading' && 'bg-blue-50 border-blue-200',
            stage.status === 'pending' && 'bg-gray-50 border-gray-200'
          )}
        >
          {getStageIcon(stage.status, index)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={cn(
                'text-sm font-medium',
                stage.status === 'complete' && 'text-green-900',
                stage.status === 'error' && 'text-red-900',
                stage.status === 'loading' && 'text-blue-900',
                stage.status === 'pending' && 'text-gray-900'
              )}>
                {stage.label}
              </h4>
              {stage.progress !== undefined && (
                <span className="text-xs text-gray-600">
                  {Math.round(stage.progress)}%
                </span>
              )}
            </div>
            
            {stage.message && (
              <p className="text-xs text-gray-600 mt-1">{stage.message}</p>
            )}
            
            {stage.progress !== undefined && stage.status === 'loading' && (
              <div className="mt-2">
                <ProgressBar
                  progress={stage.progress}
                  showLabel={false}
                  variant="primary"
                />
              </div>
            )}
          </div>
          
          {/* Connection line to next stage */}
          {index < stages.length - 1 && (
            <div className="absolute left-[22px] top-12 w-0.5 h-8 bg-gray-200" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Loading overlay
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message,
  progress,
  allowCancel,
  onCancel,
  className
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
          className
        )}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4"
        >
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            
            {message && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {message}
              </h3>
            )}
            
            {progress !== undefined && (
              <div className="mb-4">
                <ProgressBar progress={progress} />
              </div>
            )}
            
            {allowCancel && onCancel && (
              <button
                onClick={onCancel}
                className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Context-aware loading states for RBAC operations
export const RBACLoadingState: React.FC<{
  operation: 'users' | 'roles' | 'permissions' | 'resources' | 'groups' | 'audit' | 'auth';
  action?: 'loading' | 'creating' | 'updating' | 'deleting' | 'fetching';
  message?: string;
  progress?: number;
  className?: string;
}> = ({ operation, action = 'loading', message, progress, className }) => {
  const { user } = useCurrentUser();
  const { hasPermission } = usePermissionCheck();

  const operationIcons = {
    users: Users,
    roles: Shield,
    permissions: Settings,
    resources: Database,
    groups: Users,
    audit: Activity,
    auth: Shield
  };

  const operationMessages = {
    users: {
      loading: 'Loading users...',
      creating: 'Creating new user...',
      updating: 'Updating user information...',
      deleting: 'Removing user...',
      fetching: 'Fetching user details...'
    },
    roles: {
      loading: 'Loading roles...',
      creating: 'Creating new role...',
      updating: 'Updating role permissions...',
      deleting: 'Removing role...',
      fetching: 'Fetching role details...'
    },
    permissions: {
      loading: 'Loading permissions...',
      creating: 'Creating new permission...',
      updating: 'Updating permission settings...',
      deleting: 'Removing permission...',
      fetching: 'Fetching permission details...'
    },
    resources: {
      loading: 'Loading resources...',
      creating: 'Creating new resource...',
      updating: 'Updating resource configuration...',
      deleting: 'Removing resource...',
      fetching: 'Fetching resource hierarchy...'
    },
    groups: {
      loading: 'Loading groups...',
      creating: 'Creating new group...',
      updating: 'Updating group membership...',
      deleting: 'Removing group...',
      fetching: 'Fetching group details...'
    },
    audit: {
      loading: 'Loading audit logs...',
      creating: 'Generating audit report...',
      updating: 'Updating audit settings...',
      deleting: 'Archiving audit logs...',
      fetching: 'Fetching audit details...'
    },
    auth: {
      loading: 'Authenticating...',
      creating: 'Setting up authentication...',
      updating: 'Updating authentication settings...',
      deleting: 'Revoking authentication...',
      fetching: 'Validating session...'
    }
  };

  const IconComponent = operationIcons[operation];
  const defaultMessage = operationMessages[operation][action];

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
      <motion.div
        variants={loadingVariants}
        animate="pulse"
        className="p-4 bg-blue-50 rounded-full"
      >
        <IconComponent className="w-8 h-8 text-blue-600" />
      </motion.div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          {message || defaultMessage}
        </h3>
        
        {user && (
          <p className="text-sm text-gray-600">
            Performing operation as {user.display_name || user.email}
          </p>
        )}
        
        {progress !== undefined && (
          <div className="w-64">
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>
      
      <LoadingSpinner size="md" />
    </div>
  );
};

// Bulk operation loading state
export const BulkOperationLoading: React.FC<{
  operation: string;
  totalItems: number;
  completedItems: number;
  currentItem?: string;
  errors?: string[];
  onCancel?: () => void;
  className?: string;
}> = ({
  operation,
  totalItems,
  completedItems,
  currentItem,
  errors = [],
  onCancel,
  className
}) => {
  const progress = (completedItems / totalItems) * 100;
  const hasErrors = errors.length > 0;

  return (
    <div className={cn('p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {operation}
          </h3>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{completedItems} of {totalItems} items</span>
          </div>
          <ProgressBar
            progress={progress}
            showLabel={false}
            variant={hasErrors ? 'warning' : 'primary'}
          />
        </div>
        
        {currentItem && (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600">
              Processing: {currentItem}
            </span>
          </div>
        )}
        
        {hasErrors && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">
                {errors.length} error{errors.length > 1 ? 's' : ''} occurred
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {errors.slice(0, 5).map((error, index) => (
                <p key={index} className="text-xs text-red-700">
                  {error}
                </p>
              ))}
              {errors.length > 5 && (
                <p className="text-xs text-red-600">
                  ... and {errors.length - 5} more errors
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Data export loading state
export const ExportLoading: React.FC<{
  format: 'csv' | 'json' | 'pdf' | 'excel';
  recordCount?: number;
  progress?: number;
  onCancel?: () => void;
  className?: string;
}> = ({ format, recordCount, progress, onCancel, className }) => {
  const formatLabels = {
    csv: 'CSV',
    json: 'JSON',
    pdf: 'PDF',
    excel: 'Excel'
  };

  return (
    <div className={cn('p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg', className)}>
      <div className="text-center space-y-4">
        <motion.div
          variants={loadingVariants}
          animate="pulse"
          className="p-4 bg-green-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center"
        >
          <Download className="w-8 h-8 text-green-600" />
        </motion.div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Exporting to {formatLabels[format]}
          </h3>
          {recordCount && (
            <p className="text-sm text-gray-600 mt-1">
              Processing {recordCount.toLocaleString()} records...
            </p>
          )}
        </div>
        
        {progress !== undefined && (
          <div className="w-64 mx-auto">
            <ProgressBar progress={progress} />
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          This may take a few moments for large datasets
        </p>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel Export
          </button>
        )}
      </div>
    </div>
  );
};

// Search loading state
export const SearchLoading: React.FC<{
  query?: string;
  resultCount?: number;
  className?: string;
}> = ({ query, resultCount, className }) => (
  <div className={cn('flex items-center justify-center p-8 space-x-3', className)}>
    <motion.div
      variants={loadingVariants}
      animate="spin"
      className="text-blue-600"
    >
      <Search className="w-6 h-6" />
    </motion.div>
    <div className="text-center">
      <p className="text-sm text-gray-600">
        Searching{query && ` for "${query}"`}...
      </p>
      {resultCount !== undefined && (
        <p className="text-xs text-gray-500 mt-1">
          Found {resultCount} results so far
        </p>
      )}
    </div>
  </div>
);

// WebSocket connection loading
export const WebSocketConnectionLoading: React.FC<{
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  className?: string;
}> = ({ status, className }) => {
  const statusConfig = {
    connecting: {
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      message: 'Connecting to real-time updates...'
    },
    connected: {
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      message: 'Connected to real-time updates'
    },
    disconnected: {
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      message: 'Disconnected from real-time updates'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      message: 'Connection error - retrying...'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div className={cn(
      'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm',
      config.bgColor,
      className
    )}>
      {status === 'connecting' ? (
        <motion.div
          variants={loadingVariants}
          animate="spin"
          className={config.color}
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      ) : (
        <IconComponent className={cn('w-4 h-4', config.color)} />
      )}
      <span className={config.color}>{config.message}</span>
    </div>
  );
};

// Page loading wrapper
export const PageLoadingWrapper: React.FC<{
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
}> = ({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = 'No data available',
  children,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn('min-h-96 flex items-center justify-center', className)}>
        <RBACLoadingState operation="auth" action="loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('min-h-96 flex items-center justify-center', className)}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Error Loading Data</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn('min-h-96 flex items-center justify-center', className)}>
        <div className="text-center space-y-4">
          <Info className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">No Data</h3>
            <p className="text-sm text-gray-600 mt-1">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Export all components
export default {
  LoadingSpinner,
  ProgressBar,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ProgressiveLoading,
  LoadingOverlay,
  RBACLoadingState,
  BulkOperationLoading,
  ExportLoading,
  SearchLoading,
  WebSocketConnectionLoading,
  PageLoadingWrapper
};