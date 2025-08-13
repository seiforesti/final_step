// BulkActions.tsx - Enterprise-grade bulk action components for RBAC system
// Provides comprehensive bulk operations with confirmation, progress tracking, and RBAC integration

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Square,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Shield,
  Trash2,
  Edit,
  Copy,
  Download,
  Upload,
  Mail,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Archive,
  ArchiveRestore,
  UserPlus,
  UserMinus,
  Settings,
  MoreHorizontal,
  RefreshCw,
  FileText,
  Database,
  Activity,
  Zap,
  Target,
  Filter,
  Search,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { LoadingSpinner, ProgressBar, BulkOperationLoading } from './LoadingStates';

// Core interfaces
export interface BulkAction<T = any> {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'warning' | 'success';
  
  // Permissions and visibility
  permission?: string;
  requiredRole?: string;
  hidden?: (selectedItems: T[]) => boolean;
  disabled?: (selectedItems: T[]) => boolean;
  
  // Execution
  onClick: (selectedItems: T[], selectedIndices: number[]) => Promise<BulkActionResult> | BulkActionResult;
  
  // Confirmation
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string | ((selectedItems: T[]) => string);
  confirmationAction?: string;
  dangerWords?: string[]; // Words user must type to confirm dangerous actions
  
  // Progress tracking
  supportsProgress?: boolean;
  batchSize?: number; // For processing in batches
  
  // Validation
  minSelection?: number;
  maxSelection?: number;
  validation?: (selectedItems: T[]) => string | null;
  
  // Categorization
  category?: string;
  order?: number;
  shortcut?: string;
}

export interface BulkActionResult {
  success: boolean;
  message?: string;
  successCount?: number;
  errorCount?: number;
  errors?: Array<{ item: any; error: string }>;
  details?: any;
}

export interface BulkActionProgress {
  actionId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  currentItem?: string;
  errors: Array<{ item: any; error: string }>;
  startTime?: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number;
}

export interface BulkActionsProps<T = any> {
  actions: BulkAction<T>[];
  selectedItems: T[];
  selectedIndices: number[];
  onSelectionChange?: (selectedItems: T[], selectedIndices: number[]) => void;
  onClearSelection?: () => void;
  
  // Display options
  variant?: 'compact' | 'standard' | 'detailed';
  layout?: 'horizontal' | 'vertical' | 'dropdown' | 'contextual';
  showSelectionCount?: boolean;
  showActionCount?: boolean;
  groupByCategory?: boolean;
  
  // Behavior
  enableBatching?: boolean;
  defaultBatchSize?: number;
  autoExecute?: boolean;
  queueActions?: boolean;
  
  // Customization
  className?: string;
  selectionLabel?: string;
  emptyMessage?: string;
  
  // Callbacks
  onActionStart?: (actionId: string, selectedItems: T[]) => void;
  onActionComplete?: (actionId: string, result: BulkActionResult) => void;
  onActionProgress?: (actionId: string, progress: BulkActionProgress) => void;
  onActionError?: (actionId: string, error: string) => void;
  
  // RBAC
  permission?: string;
  hideActionsWithoutPermission?: boolean;
  
  // Advanced
  enableUndo?: boolean;
  enableHistory?: boolean;
  maxHistorySize?: number;
}

export interface ActionGroup {
  id: string;
  label: string;
  icon?: React.ReactNode;
  actions: BulkAction[];
  order?: number;
}

// Action execution context
interface ActionExecutionContext<T = any> {
  action: BulkAction<T>;
  selectedItems: T[];
  selectedIndices: number[];
  batchSize?: number;
  onProgress?: (progress: BulkActionProgress) => void;
  onComplete?: (result: BulkActionResult) => void;
}

// Utility functions
const validateActionExecution = <T,>(action: BulkAction<T>, selectedItems: T[]): string | null => {
  if (action.minSelection && selectedItems.length < action.minSelection) {
    return `This action requires at least ${action.minSelection} selected item${action.minSelection > 1 ? 's' : ''}`;
  }
  
  if (action.maxSelection && selectedItems.length > action.maxSelection) {
    return `This action can only be performed on up to ${action.maxSelection} item${action.maxSelection > 1 ? 's' : ''}`;
  }
  
  if (action.validation) {
    return action.validation(selectedItems);
  }
  
  return null;
};

const estimateActionDuration = <T,>(action: BulkAction<T>, itemCount: number): number => {
  // Simple estimation based on action type and item count
  const baseTime = 1000; // 1 second base
  const perItemTime = 100; // 100ms per item
  
  let multiplier = 1;
  if (action.variant === 'destructive') multiplier = 2;
  if (action.id.includes('export')) multiplier = 3;
  if (action.id.includes('email')) multiplier = 4;
  
  return (baseTime + (perItemTime * itemCount)) * multiplier;
};

const getActionIcon = (action: BulkAction): React.ReactNode => {
  if (action.icon) return action.icon;
  
  // Default icons based on action ID patterns
  if (action.id.includes('delete') || action.id.includes('remove')) return <Trash2 className="w-4 h-4" />;
  if (action.id.includes('edit') || action.id.includes('update')) return <Edit className="w-4 h-4" />;
  if (action.id.includes('copy') || action.id.includes('duplicate')) return <Copy className="w-4 h-4" />;
  if (action.id.includes('export') || action.id.includes('download')) return <Download className="w-4 h-4" />;
  if (action.id.includes('import') || action.id.includes('upload')) return <Upload className="w-4 h-4" />;
  if (action.id.includes('email') || action.id.includes('notify')) return <Mail className="w-4 h-4" />;
  if (action.id.includes('enable') || action.id.includes('activate')) return <CheckCircle className="w-4 h-4" />;
  if (action.id.includes('disable') || action.id.includes('deactivate')) return <X className="w-4 h-4" />;
  if (action.id.includes('archive')) return <Archive className="w-4 h-4" />;
  if (action.id.includes('restore')) return <ArchiveRestore className="w-4 h-4" />;
  if (action.id.includes('assign') || action.id.includes('grant')) return <UserPlus className="w-4 h-4" />;
  if (action.id.includes('revoke') || action.id.includes('unassign')) return <UserMinus className="w-4 h-4" />;
  
  return <Settings className="w-4 h-4" />;
};

// Action confirmation dialog
const ActionConfirmationDialog: React.FC<{
  action: BulkAction;
  selectedItems: any[];
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ action, selectedItems, isOpen, onConfirm, onCancel }) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  const confirmationMessage = typeof action.confirmationMessage === 'function' 
    ? action.confirmationMessage(selectedItems) 
    : action.confirmationMessage;
  
  const requiresDangerConfirmation = action.dangerWords && action.dangerWords.length > 0;
  const dangerWord = requiresDangerConfirmation ? action.dangerWords![0] : '';
  
  useEffect(() => {
    if (requiresDangerConfirmation) {
      setIsValid(confirmationInput.toLowerCase() === dangerWord.toLowerCase());
    } else {
      setIsValid(true);
    }
  }, [confirmationInput, dangerWord, requiresDangerConfirmation]);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={cn(
                "p-2 rounded-full",
                action.variant === 'destructive' && "bg-red-100",
                action.variant === 'warning' && "bg-yellow-100",
                (!action.variant || action.variant === 'default') && "bg-gray-100"
              )}>
                {action.variant === 'destructive' ? (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                ) : action.variant === 'warning' ? (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                ) : (
                  getActionIcon(action)
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {action.confirmationTitle || `Confirm ${action.label}`}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700">
                {confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()} the selected items?`}
              </p>
              
              {requiresDangerConfirmation && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Type <strong>{dangerWord}</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Type "${dangerWord}" to confirm`}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!isValid}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  action.variant === 'destructive' && "bg-red-600 text-white hover:bg-red-700",
                  action.variant === 'warning' && "bg-yellow-600 text-white hover:bg-yellow-700",
                  action.variant === 'primary' && "bg-blue-600 text-white hover:bg-blue-700",
                  (!action.variant || action.variant === 'default') && "bg-gray-600 text-white hover:bg-gray-700",
                  !isValid && "opacity-50 cursor-not-allowed"
                )}
              >
                {action.confirmationAction || action.label}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Action progress tracker
const ActionProgressTracker: React.FC<{
  progress: BulkActionProgress;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  className?: string;
}> = ({ progress, onPause, onResume, onCancel, className }) => {
  const progressPercentage = (progress.processedItems / progress.totalItems) * 100;
  const hasErrors = progress.errorCount > 0;
  
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white border border-gray-200 rounded-lg p-4 shadow-lg', className)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            progress.status === 'running' && "bg-blue-500 animate-pulse",
            progress.status === 'paused' && "bg-yellow-500",
            progress.status === 'completed' && "bg-green-500",
            progress.status === 'failed' && "bg-red-500",
            progress.status === 'cancelled' && "bg-gray-500"
          )} />
          <span className="text-sm font-medium text-gray-900">
            Bulk Action in Progress
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {progress.status === 'running' && onPause && (
            <button
              onClick={onPause}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          
          {progress.status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Resume"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          
          {(progress.status === 'running' || progress.status === 'paused') && onCancel && (
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Cancel"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{progress.processedItems} of {progress.totalItems} items</span>
        </div>
        
        <ProgressBar
          progress={progressPercentage}
          showLabel={false}
          variant={hasErrors ? 'warning' : 'primary'}
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
              {progress.successCount} success
            </span>
            {progress.errorCount > 0 && (
              <span className="flex items-center">
                <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                {progress.errorCount} errors
              </span>
            )}
          </div>
          
          {progress.estimatedTimeRemaining && progress.status === 'running' && (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeRemaining(progress.estimatedTimeRemaining)} remaining
            </span>
          )}
        </div>
        
        {progress.currentItem && (
          <div className="text-xs text-gray-600 truncate">
            Processing: {progress.currentItem}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Selection summary component
const SelectionSummary: React.FC<{
  selectedItems: any[];
  onClearSelection?: () => void;
  className?: string;
  variant?: 'compact' | 'standard' | 'detailed';
}> = ({ selectedItems, onClearSelection, className, variant = 'standard' }) => {
  if (selectedItems.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'bg-blue-50 border border-blue-200 rounded-lg p-3',
        variant === 'compact' && 'p-2',
        variant === 'detailed' && 'p-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span className={cn(
            'font-medium text-blue-900',
            variant === 'compact' && 'text-sm'
          )}>
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </span>
        </div>
        
        {onClearSelection && (
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      
      {variant === 'detailed' && selectedItems.length > 0 && (
        <div className="mt-2 text-sm text-blue-700">
          Selected items will be processed by the chosen action
        </div>
      )}
    </motion.div>
  );
};

// Main bulk actions component
export const BulkActions = <T extends Record<string, any> = any>({
  actions,
  selectedItems,
  selectedIndices,
  onSelectionChange,
  onClearSelection,
  
  // Display options
  variant = 'standard',
  layout = 'horizontal',
  showSelectionCount = true,
  showActionCount = true,
  groupByCategory = true,
  
  // Behavior
  enableBatching = true,
  defaultBatchSize = 50,
  autoExecute = false,
  queueActions = false,
  
  // Customization
  className,
  selectionLabel = 'Selected',
  emptyMessage = 'No items selected',
  
  // Callbacks
  onActionStart,
  onActionComplete,
  onActionProgress,
  onActionError,
  
  // RBAC
  permission,
  hideActionsWithoutPermission = true,
  
  // Advanced
  enableUndo = false,
  enableHistory = false,
  maxHistorySize = 10
}: BulkActionsProps<T>): JSX.Element => {
  const { hasPermission } = usePermissionCheck();
  const { user } = useCurrentUser();
  
  // State management
  const [activeProgress, setActiveProgress] = useState<BulkActionProgress | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    action: BulkAction<T>;
    isOpen: boolean;
  } | null>(null);
  const [actionHistory, setActionHistory] = useState<Array<{
    id: string;
    action: BulkAction<T>;
    items: T[];
    result: BulkActionResult;
    timestamp: Date;
  }>>([]);
  
  // Permission check
  if (permission && !hasPermission(permission)) {
    return <div className="text-sm text-gray-500">Access denied</div>;
  }
  
  // Filter visible actions based on permissions and conditions
  const visibleActions = useMemo(() => {
    return actions.filter(action => {
      // Permission check
      if (action.permission && !hasPermission(action.permission)) {
        return !hideActionsWithoutPermission;
      }
      
      // Role check
      if (action.requiredRole && user?.role !== action.requiredRole) {
        return false;
      }
      
      // Hidden condition
      if (action.hidden?.(selectedItems)) {
        return false;
      }
      
      return true;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [actions, hasPermission, hideActionsWithoutPermission, user, selectedItems]);
  
  // Group actions by category
  const groupedActions = useMemo(() => {
    if (!groupByCategory) {
      return { ungrouped: visibleActions };
    }
    
    const grouped: Record<string, BulkAction<T>[]> = {};
    const ungrouped: BulkAction<T>[] = [];
    
    visibleActions.forEach(action => {
      if (action.category) {
        if (!grouped[action.category]) {
          grouped[action.category] = [];
        }
        grouped[action.category].push(action);
      } else {
        ungrouped.push(action);
      }
    });
    
    return { grouped, ungrouped };
  }, [visibleActions, groupByCategory]);
  
  // Execute action with proper error handling and progress tracking
  const executeAction = useCallback(async (action: BulkAction<T>) => {
    try {
      // Validation
      const validationError = validateActionExecution(action, selectedItems);
      if (validationError) {
        onActionError?.(action.id, validationError);
        return;
      }
      
      // Start action
      onActionStart?.(action.id, selectedItems);
      
      // Initialize progress tracking
      if (action.supportsProgress) {
        const initialProgress: BulkActionProgress = {
          actionId: action.id,
          status: 'running',
          totalItems: selectedItems.length,
          processedItems: 0,
          successCount: 0,
          errorCount: 0,
          errors: [],
          startTime: new Date(),
          estimatedTimeRemaining: estimateActionDuration(action, selectedItems.length)
        };
        
        setActiveProgress(initialProgress);
        onActionProgress?.(action.id, initialProgress);
      }
      
      // Execute action
      const result = await action.onClick(selectedItems, selectedIndices);
      
      // Update progress to completed
      if (action.supportsProgress && activeProgress) {
        const completedProgress: BulkActionProgress = {
          ...activeProgress,
          status: result.success ? 'completed' : 'failed',
          processedItems: selectedItems.length,
          successCount: result.successCount || (result.success ? selectedItems.length : 0),
          errorCount: result.errorCount || (result.success ? 0 : selectedItems.length),
          errors: result.errors || [],
          endTime: new Date(),
          estimatedTimeRemaining: 0
        };
        
        setActiveProgress(completedProgress);
        onActionProgress?.(action.id, completedProgress);
        
        // Clear progress after a delay
        setTimeout(() => setActiveProgress(null), 3000);
      }
      
      // Add to history
      if (enableHistory) {
        const historyEntry = {
          id: `${action.id}_${Date.now()}`,
          action,
          items: selectedItems,
          result,
          timestamp: new Date()
        };
        
        setActionHistory(prev => {
          const newHistory = [historyEntry, ...prev];
          return newHistory.slice(0, maxHistorySize);
        });
      }
      
      // Complete callback
      onActionComplete?.(action.id, result);
      
      // Clear selection if action was successful
      if (result.success && onClearSelection) {
        onClearSelection();
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onActionError?.(action.id, errorMessage);
      
      if (activeProgress) {
        setActiveProgress({
          ...activeProgress,
          status: 'failed',
          endTime: new Date()
        });
      }
    }
  }, [selectedItems, selectedIndices, onActionStart, onActionComplete, onActionProgress, onActionError, onClearSelection, activeProgress, enableHistory, maxHistorySize]);
  
  // Handle action click
  const handleActionClick = useCallback((action: BulkAction<T>) => {
    if (action.disabled?.(selectedItems)) {
      return;
    }
    
    if (action.requiresConfirmation) {
      setConfirmationDialog({ action, isOpen: true });
    } else {
      executeAction(action);
    }
  }, [selectedItems, executeAction]);
  
  // Handle confirmation
  const handleConfirmAction = useCallback(() => {
    if (confirmationDialog) {
      executeAction(confirmationDialog.action);
      setConfirmationDialog(null);
    }
  }, [confirmationDialog, executeAction]);
  
  // Render action button
  const renderActionButton = useCallback((action: BulkAction<T>) => {
    const isDisabled = action.disabled?.(selectedItems);
    const validationError = validateActionExecution(action, selectedItems);
    
    const buttonVariants = {
      default: 'border-gray-300 text-gray-700 hover:bg-gray-50',
      primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
      secondary: 'border-gray-300 text-gray-700 hover:bg-gray-50',
      destructive: 'bg-red-600 text-white hover:bg-red-700 border-red-600',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600',
      success: 'bg-green-600 text-white hover:bg-green-700 border-green-600'
    };
    
    return (
      <button
        key={action.id}
        onClick={() => handleActionClick(action)}
        disabled={isDisabled || !!validationError}
        title={action.description || validationError || undefined}
        className={cn(
          'inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors',
          buttonVariants[action.variant || 'default'],
          (isDisabled || validationError) && 'opacity-50 cursor-not-allowed',
          variant === 'compact' && 'px-2 py-1 text-xs'
        )}
      >
        {getActionIcon(action)}
        <span className="ml-2">{action.label}</span>
        {action.shortcut && (
          <span className="ml-2 text-xs opacity-75">
            {action.shortcut}
          </span>
        )}
      </button>
    );
  }, [selectedItems, handleActionClick, variant]);
  
  // Don't render if no items selected and no actions available
  if (selectedItems.length === 0 && visibleActions.length === 0) {
    return <div className="text-sm text-gray-500">{emptyMessage}</div>;
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Selection Summary */}
      {showSelectionCount && selectedItems.length > 0 && (
        <SelectionSummary
          selectedItems={selectedItems}
          onClearSelection={onClearSelection}
          variant={variant}
        />
      )}
      
      {/* Active Progress */}
      {activeProgress && (
        <ActionProgressTracker
          progress={activeProgress}
          onCancel={() => {
            setActiveProgress(null);
            // TODO: Implement actual cancellation logic
          }}
        />
      )}
      
      {/* Actions */}
      {selectedItems.length > 0 && visibleActions.length > 0 && (
        <div className={cn(
          'space-y-3',
          layout === 'horizontal' && 'space-y-0 space-x-3 flex flex-wrap',
          layout === 'vertical' && 'space-y-2'
        )}>
          {/* Ungrouped actions */}
          {groupedActions.ungrouped.length > 0 && (
            <div className={cn(
              layout === 'horizontal' ? 'flex flex-wrap gap-2' : 'space-y-2'
            )}>
              {groupedActions.ungrouped.map(renderActionButton)}
            </div>
          )}
          
          {/* Grouped actions */}
          {Object.entries(groupedActions.grouped || {}).map(([category, categoryActions]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">{category}</h4>
              <div className={cn(
                layout === 'horizontal' ? 'flex flex-wrap gap-2' : 'space-y-2'
              )}>
                {categoryActions.map(renderActionButton)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Action History */}
      {enableHistory && actionHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Actions</h4>
          <div className="space-y-2">
            {actionHistory.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
              >
                <div className="flex items-center space-x-2">
                  {getActionIcon(entry.action)}
                  <span>{entry.action.label}</span>
                  <span className="text-gray-500">
                    on {entry.items.length} item{entry.items.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {entry.result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <ActionConfirmationDialog
          action={confirmationDialog.action}
          selectedItems={selectedItems}
          isOpen={confirmationDialog.isOpen}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmationDialog(null)}
        />
      )}
    </div>
  );
};

export default BulkActions;