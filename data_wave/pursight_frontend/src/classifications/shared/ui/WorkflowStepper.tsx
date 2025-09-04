"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib copie/utils';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, AlertCircle, Clock, Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, ChevronRight, ChevronDown, ChevronUp, MoreHorizontal, Settings, RefreshCw, Zap, Target, Flag, MapPin, Route, GitBranch, Timer, Users, FileText, Database, Shield, Brain, Activity, TrendingUp, AlertTriangle, Info, CheckSquare, XCircle, Loader2, ArrowRight, ArrowLeft, PlayCircle, StopCircle, PauseCircle, RotateCw, Maximize2, Minimize2, Eye, EyeOff, Calendar, User, Tag } from 'lucide-react';
import { toast } from 'sonner';

// Types and Interfaces
export type StepStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped' | 'cancelled';
export type StepType = 'standard' | 'conditional' | 'parallel' | 'merge' | 'gateway' | 'subprocess';
export type WorkflowStatus = 'draft' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperVariant = 'default' | 'compact' | 'detailed' | 'minimal';

export interface StepValidation {
  required: boolean;
  validator?: (data: any) => boolean | Promise<boolean>;
  errorMessage?: string;
  warningMessage?: string;
}

export interface StepAction {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  loading?: boolean;
  handler: (step: WorkflowStep, context: WorkflowContext) => void | Promise<void>;
}

export interface StepBranch {
  id: string;
  label: string;
  condition: (data: any) => boolean;
  targetStepId: string;
  description?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  type: StepType;
  status: StepStatus;
  icon?: React.ComponentType<any>;
  component?: React.ComponentType<any>;
  data?: any;
  validation?: StepValidation;
  actions?: StepAction[];
  branches?: StepBranch[];
  dependencies?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  startTime?: string;
  endTime?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: string[];
  metadata?: Record<string, any>;
  substeps?: WorkflowStep[];
  optional?: boolean;
  retryable?: boolean;
  maxRetries?: number;
  currentRetries?: number;
}

export interface WorkflowContext {
  workflowId: string;
  instanceId: string;
  data: Record<string, any>;
  variables: Record<string, any>;
  history: Array<{
    stepId: string;
    timestamp: string;
    action: string;
    data?: any;
  }>;
  permissions: string[];
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStepId?: string;
  context: WorkflowContext;
  status: WorkflowStatus;
  orientation?: StepperOrientation;
  variant?: StepperVariant;
  showProgress?: boolean;
  showTimeline?: boolean;
  showActions?: boolean;
  showValidation?: boolean;
  showBranching?: boolean;
  showAssignees?: boolean;
  showEstimates?: boolean;
  allowSkip?: boolean;
  allowRetry?: boolean;
  allowCancel?: boolean;
  interactive?: boolean;
  collapsible?: boolean;
  onStepClick?: (step: WorkflowStep) => void;
  onStepComplete?: (step: WorkflowStep, data: any) => void;
  onStepFail?: (step: WorkflowStep, error: string) => void;
  onStepSkip?: (step: WorkflowStep) => void;
  onStepRetry?: (step: WorkflowStep) => void;
  onWorkflowComplete?: (context: WorkflowContext) => void;
  onWorkflowFail?: (error: string, context: WorkflowContext) => void;
  onWorkflowPause?: (context: WorkflowContext) => void;
  onWorkflowResume?: (context: WorkflowContext) => void;
  onWorkflowCancel?: (context: WorkflowContext) => void;
  className?: string;
}

// Animation variants
const stepVariants = {
  inactive: {
    scale: 0.95,
    opacity: 0.6,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2 }
  },
  completed: {
    scale: 1,
    opacity: 0.8,
    transition: { duration: 0.2 }
  }
};

const progressVariants = {
  initial: { width: 0 },
  animate: { width: '100%' },
  transition: { duration: 0.5, ease: 'easeInOut' }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Status configurations
const statusConfig = {
  pending: {
    icon: Circle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-muted',
    label: 'Pending'
  },
  active: {
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'Active'
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: 'Completed'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'Failed'
  },
  skipped: {
    icon: SkipForward,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    label: 'Skipped'
  },
  cancelled: {
    icon: StopCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    label: 'Cancelled'
  }
};

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  currentStepId,
  context,
  status,
  orientation = 'horizontal',
  variant = 'default',
  showProgress = true,
  showTimeline = true,
  showActions = true,
  showValidation = true,
  showBranching = true,
  showAssignees = true,
  showEstimates = true,
  allowSkip = true,
  allowRetry = true,
  allowCancel = true,
  interactive = true,
  collapsible = false,
  onStepClick,
  onStepComplete,
  onStepFail,
  onStepSkip,
  onStepRetry,
  onWorkflowComplete,
  onWorkflowFail,
  onWorkflowPause,
  onWorkflowResume,
  onWorkflowCancel,
  className
}) => {
  // Advanced Enterprise State Management
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [selectedStep, setSelectedStep] = useState<string | null>(currentStepId || null);
  const [showDetails, setShowDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loadingSteps, setLoadingSteps] = useState<Set<string>>(new Set());
  
  // Advanced workflow intelligence
  const [workflowAnalytics, setWorkflowAnalytics] = useState({
    averageStepTime: 0,
    bottleneckSteps: [] as string[],
    optimizationSuggestions: [] as Array<{
      stepId: string;
      suggestion: string;
      impact: 'low' | 'medium' | 'high';
      effort: 'low' | 'medium' | 'high';
    }>,
    riskAssessment: {
      overall: 'low' as 'low' | 'medium' | 'high',
      factors: [] as string[]
    },
    performanceMetrics: {
      throughput: 0,
      errorRate: 0,
      successRate: 0,
      averageExecutionTime: 0
    }
  });
  
  const [intelligentRouting, setIntelligentRouting] = useState({
    suggestedNextSteps: [] as string[],
    conditionalPaths: [] as Array<{
      condition: string;
      probability: number;
      targetStep: string;
    }>,
    parallelExecution: [] as Array<{
      steps: string[];
      estimatedTime: number;
    }>
  });
  
  const [realTimeCollaboration, setRealTimeCollaboration] = useState({
    activeUsers: [] as Array<{
      userId: string;
      userName: string;
      currentStep: string;
      lastActivity: string;
    }>,
    comments: [] as Array<{
      id: string;
      stepId: string;
      userId: string;
      userName: string;
      content: string;
      timestamp: string;
      resolved: boolean;
    }>,
    notifications: [] as Array<{
      id: string;
      type: 'info' | 'warning' | 'error' | 'success';
      message: string;
      timestamp: string;
      acknowledged: boolean;
    }>
  });
  
  const [workflowOptimization, setWorkflowOptimization] = useState({
    autoOptimizationEnabled: false,
    learningFromHistory: true,
    predictiveStepDuration: true,
    resourceOptimization: true,
    parallelizationSuggestions: true
  });

  // Refs
  const stepperRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Computed Values
  const currentStep = useMemo(() => {
    return steps.find(step => step.id === currentStepId);
  }, [steps, currentStepId]);

  const completedSteps = useMemo(() => {
    return steps.filter(step => step.status === 'completed').length;
  }, [steps]);

  const totalSteps = useMemo(() => {
    return steps.length;
  }, [steps]);

  const progressPercentage = useMemo(() => {
    if (totalSteps === 0) return 0;
    return (completedSteps / totalSteps) * 100;
  }, [completedSteps, totalSteps]);

  const canProceed = useMemo(() => {
    if (!currentStep) return false;
    return currentStep.status === 'completed' || !currentStep.validation?.required;
  }, [currentStep]);

  const workflowDuration = useMemo(() => {
    const startTimes = steps.map(s => s.startTime).filter(Boolean);
    const endTimes = steps.map(s => s.endTime).filter(Boolean);
    
    if (startTimes.length === 0) return 0;
    
    const earliestStart = new Date(Math.min(...startTimes.map(t => new Date(t!).getTime())));
    const latestEnd = endTimes.length > 0 ? 
      new Date(Math.max(...endTimes.map(t => new Date(t!).getTime()))) :
      new Date();
    
    return latestEnd.getTime() - earliestStart.getTime();
  }, [steps]);

  const estimatedCompletion = useMemo(() => {
    const remainingSteps = steps.filter(s => s.status === 'pending' || s.status === 'active');
    const totalEstimate = remainingSteps.reduce((sum, step) => sum + (step.estimatedDuration || 0), 0);
    
    if (totalEstimate === 0) return null;
    
    const now = new Date();
    return new Date(now.getTime() + totalEstimate);
  }, [steps]);

  // Effects
  useEffect(() => {
    if (currentStepId && activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentStepId]);

  useEffect(() => {
    // Auto-expand current step in detailed view
    if (currentStepId && variant === 'detailed') {
      setExpandedSteps(prev => new Set([...prev, currentStepId]));
    }
  }, [currentStepId, variant]);

  // Handlers
  const handleStepClick = useCallback((step: WorkflowStep) => {
    if (!interactive) return;
    
    setSelectedStep(step.id);
    onStepClick?.(step);
    
    if (collapsible) {
      setExpandedSteps(prev => {
        const newSet = new Set(prev);
        if (newSet.has(step.id)) {
          newSet.delete(step.id);
        } else {
          newSet.add(step.id);
        }
        return newSet;
      });
    }
  }, [interactive, collapsible, onStepClick]);

  const handleStepAction = useCallback(async (step: WorkflowStep, action: StepAction) => {
    if (action.disabled || action.loading) return;
    
    setLoadingSteps(prev => new Set([...prev, step.id]));
    
    try {
      await action.handler(step, context);
      toast.success(`Action "${action.label}" completed successfully`);
    } catch (error) {
      toast.error(`Action "${action.label}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(step.id);
        return newSet;
      });
    }
  }, [context]);

  const validateStep = useCallback(async (step: WorkflowStep): Promise<boolean> => {
    if (!step.validation?.validator) return true;
    
    try {
      const isValid = await step.validation.validator(step.data);
      
      if (!isValid && step.validation.errorMessage) {
        setValidationErrors(prev => ({
          ...prev,
          [step.id]: step.validation!.errorMessage!
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[step.id];
          return newErrors;
        });
      }
      
      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setValidationErrors(prev => ({
        ...prev,
        [step.id]: errorMessage
      }));
      return false;
    }
  }, []);

  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }, []);

  // Render Functions
  const renderStepIcon = (step: WorkflowStep, size: 'sm' | 'md' | 'lg' = 'md') => {
    const config = statusConfig[step.status];
    const IconComponent = step.icon || config.icon;
    const isLoading = loadingSteps.has(step.id);
    
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10'
    };
    
    const iconSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };
    
    return (
      <motion.div
        variants={step.status === 'active' ? pulseVariants : undefined}
        animate={step.status === 'active' ? 'pulse' : undefined}
        className={cn(
          "rounded-full flex items-center justify-center border-2 transition-colors",
          config.bgColor,
          config.borderColor,
          sizeClasses[size]
        )}
      >
        {isLoading ? (
          <Loader2 className={cn("animate-spin", config.color, iconSizes[size])} />
        ) : (
          <IconComponent className={cn(config.color, iconSizes[size])} />
        )}
      </motion.div>
    );
  };

  const renderStepContent = (step: WorkflowStep, isExpanded: boolean = false) => {
    const config = statusConfig[step.status];
    const hasValidationError = validationErrors[step.id];
    const isCurrentStep = step.id === currentStepId;
    
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-medium text-sm",
              isCurrentStep && "text-primary",
              step.status === 'completed' && "text-muted-foreground"
            )}>
              {step.title}
            </h3>
            
            {step.optional && (
              <Badge variant="outline" className="text-xs">Optional</Badge>
            )}
            
            {step.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            {showEstimates && step.estimatedDuration && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {formatDuration(step.estimatedDuration)}
              </div>
            )}
            
            {showAssignees && step.assignee && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {step.assignee.name}
              </div>
            )}
            
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
          </div>
        </div>
        
        {step.description && (
          <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
        )}
        
        {hasValidationError && showValidation && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            {hasValidationError}
          </div>
        )}
        
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-3"
          >
            {/* Step Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-muted-foreground">Type</div>
                <div className="font-medium capitalize">{step.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium">{config.label}</div>
              </div>
              {step.startTime && (
                <div>
                  <div className="text-muted-foreground">Started</div>
                  <div className="font-medium">{new Date(step.startTime).toLocaleString()}</div>
                </div>
              )}
              {step.endTime && (
                <div>
                  <div className="text-muted-foreground">Completed</div>
                  <div className="font-medium">{new Date(step.endTime).toLocaleString()}</div>
                </div>
              )}
              {step.actualDuration && (
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-medium">{formatDuration(step.actualDuration)}</div>
                </div>
              )}
              {step.retryable && step.maxRetries && (
                <div>
                  <div className="text-muted-foreground">Retries</div>
                  <div className="font-medium">{step.currentRetries || 0} / {step.maxRetries}</div>
                </div>
              )}
            </div>
            
            {/* Step Actions */}
            {showActions && step.actions && step.actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {step.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant || 'outline'}
                    size="sm"
                    disabled={action.disabled || loadingSteps.has(step.id)}
                    onClick={() => handleStepAction(step, action)}
                    className="h-7 text-xs"
                  >
                    {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                    {action.loading || loadingSteps.has(step.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Step Branches */}
            {showBranching && step.branches && step.branches.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  Branches
                </h4>
                <div className="space-y-1">
                  {step.branches.map((branch) => (
                    <div key={branch.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{branch.label}</span>
                      {branch.description && (
                        <span className="text-muted-foreground">- {branch.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Substeps */}
            {step.substeps && step.substeps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium">Substeps</h4>
                <div className="space-y-1 pl-4 border-l-2 border-muted">
                  {step.substeps.map((substep) => (
                    <div key={substep.id} className="flex items-center gap-2">
                      {renderStepIcon(substep, 'sm')}
                      <span className="text-xs">{substep.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {statusConfig[substep.status].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  const renderStep = (step: WorkflowStep, index: number) => {
    const isExpanded = expandedSteps.has(step.id);
    const isCurrentStep = step.id === currentStepId;
    const isLast = index === steps.length - 1;
    
    return (
      <motion.div
        key={step.id}
        ref={isCurrentStep ? activeStepRef : undefined}
        variants={stepVariants}
        animate={
          step.status === 'active' ? 'active' :
          step.status === 'completed' ? 'completed' : 'inactive'
        }
        className={cn(
          "relative",
          interactive && "cursor-pointer",
          orientation === 'vertical' ? "pb-6" : "pr-6"
        )}
        onClick={() => handleStepClick(step)}
      >
        <div className={cn(
          "flex gap-3",
          orientation === 'vertical' ? "flex-row" : "flex-col items-center"
        )}>
          {renderStepIcon(step)}
          
          {variant !== 'minimal' && renderStepContent(step, isExpanded)}
        </div>
        
        {/* Connector Line */}
        {!isLast && (
          <div className={cn(
            "absolute bg-border",
            orientation === 'vertical' ? 
              "left-4 top-10 w-px h-6" : 
              "top-4 left-10 h-px w-6"
          )} />
        )}
      </motion.div>
    );
  };

  const renderWorkflowControls = () => (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium">
          Workflow: {context.workflowId}
        </div>
        <Badge variant={
          status === 'running' ? 'default' :
          status === 'completed' ? 'secondary' :
          status === 'failed' ? 'destructive' : 'outline'
        }>
          {status}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        {status === 'running' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWorkflowPause?.(context)}
          >
            <Pause className="h-4 w-4 mr-1" />
            Pause
          </Button>
        )}
        
        {status === 'paused' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWorkflowResume?.(context)}
          >
            <Play className="h-4 w-4 mr-1" />
            Resume
          </Button>
        )}
        
        {allowCancel && (status === 'running' || status === 'paused') && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onWorkflowCancel?.(context)}
          >
            <StopCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  const renderProgressBar = () => {
    if (!showProgress) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{completedSteps} of {totalSteps} steps completed</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progressPercentage.toFixed(0)}% complete</span>
          {estimatedCompletion && (
            <span>ETA: {estimatedCompletion.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    if (!showTimeline || !context.history.length) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timeline
        </h4>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {context.history.slice(-5).map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span>{entry.action}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {steps.map((step, index) => (
          <TooltipProvider key={step.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div onClick={() => handleStepClick(step)}>
                  {renderStepIcon(step, 'sm')}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-muted-foreground">{statusConfig[step.status].label}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)} ref={stepperRef}>
        {renderWorkflowControls()}
        
        {renderProgressBar()}
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Workflow Steps</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {completedSteps}/{totalSteps}
                </Badge>
                {workflowDuration > 0 && (
                  <Badge variant="outline">
                    {formatDuration(workflowDuration)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className={cn(
              "space-y-4",
              orientation === 'horizontal' && "flex space-y-0 space-x-4 overflow-x-auto"
            )}>
              {steps.map((step, index) => renderStep(step, index))}
            </div>
          </CardContent>
        </Card>
        
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4"
            >
              {renderTimeline()}
              
              {/* Additional Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Workflow Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">Instance ID</div>
                      <div className="font-medium">{context.instanceId}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Current User</div>
                      <div className="font-medium">{context.currentUser?.name || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Variables</div>
                      <div className="font-medium">{Object.keys(context.variables).length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">History Entries</div>
                      <div className="font-medium">{context.history.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default WorkflowStepper;