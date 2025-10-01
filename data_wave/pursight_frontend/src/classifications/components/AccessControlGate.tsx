import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, CheckCircle, Lock, Unlock, Eye, 
  Loader2, AlertTriangle, Clock, User
} from 'lucide-react';

interface AccessControlGateProps {
  children: React.ReactNode;
  componentId: string;
  componentName: string;
  requiredPermissions: string[];
  userPermissions: string[];
  onAccessGranted?: () => void;
  onAccessDenied?: () => void;
}

interface AccessCheckStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  duration: number;
  status: 'pending' | 'checking' | 'granted' | 'denied';
}

const AccessControlGate: React.FC<AccessControlGateProps> = ({
  children,
  componentId,
  componentName,
  requiredPermissions,
  userPermissions,
  onAccessGranted,
  onAccessDenied
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessSteps, setAccessSteps] = useState<AccessCheckStep[]>([]);

  // Initialize access check steps
  useEffect(() => {
    const steps: AccessCheckStep[] = [
      {
        id: 'identity',
        name: 'Identity Verification',
        description: 'Verifying user identity and session',
        icon: User,
        duration: 600,
        status: 'pending'
      },
      {
        id: 'permissions',
        name: 'Permission Check',
        description: 'Checking component access permissions',
        icon: Shield,
        duration: 800,
        status: 'pending'
      },
      {
        id: 'component',
        name: 'Component Authorization',
        description: `Authorizing access to ${componentName}`,
        icon: Lock,
        duration: 500,
        status: 'pending'
      },
      {
        id: 'security',
        name: 'Security Validation',
        description: 'Final security clearance',
        icon: Eye,
        duration: 300,
        status: 'pending'
      }
    ];
    setAccessSteps(steps);
  }, [componentName]);

  // Simulate access control checks
  useEffect(() => {
    if (accessSteps.length === 0) return;

    // Debug logging (can be removed in production)
    // console.log('AccessControlGate - Starting access check for:', componentName);
    // console.log('Required permissions:', requiredPermissions);
    // console.log('User permissions:', userPermissions);

    const runAccessChecks = async () => {
      let totalDuration = 0;
      const stepDurations = accessSteps.map(step => step.duration);
      const totalTime = stepDurations.reduce((sum, duration) => sum + duration, 0);

      for (let i = 0; i < accessSteps.length; i++) {
        // Update current step to checking
        setCurrentStep(i);
        setAccessSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'checking' } : step
        ));

        // Simulate step duration with progress
        const stepDuration = stepDurations[i];
        const stepStartProgress = (totalDuration / totalTime) * 100;
        const stepEndProgress = ((totalDuration + stepDuration) / totalTime) * 100;

        // Animate progress for this step
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + 1;
            if (newProgress >= stepEndProgress) {
              clearInterval(progressInterval);
              return stepEndProgress;
            }
            return newProgress;
          });
        }, stepDuration / (stepEndProgress - stepStartProgress));

        // Wait for step completion
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        
        // Check if user has required permissions for this step
        const hasPermission = requiredPermissions.every(permission => 
          userPermissions.includes(permission) || userPermissions.includes('*')
        );

        // Update step status
        setAccessSteps(prev => prev.map((step, index) => 
          index === i ? { 
            ...step, 
            status: hasPermission ? 'granted' : 'denied' 
          } : step
        ));

        // If access denied, stop here
        if (!hasPermission) {
          setIsChecking(false);
          setAccessGranted(false);
          onAccessDenied?.();
          return;
        }

        totalDuration += stepDuration;
      }

      // All checks passed
      setProgress(100);
      setAccessGranted(true);
      
      // Small delay before showing content
      setTimeout(() => {
        setIsChecking(false);
        onAccessGranted?.();
      }, 500);
    };

    runAccessChecks();
  }, [accessSteps.length, componentId]); // Only re-run when component changes

  // If access is being checked, show loading interface
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Access Control</h3>
              <p className="text-sm text-muted-foreground">
                Verifying permissions for {componentName}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Checking Access</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Access Steps */}
            <div className="space-y-3">
              {accessSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = step.status === 'granted';
                const isDenied = step.status === 'denied';
                
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/5 border border-primary/20' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-100 text-green-600' :
                      isDenied ? 'bg-red-100 text-red-600' :
                      isActive ? 'bg-primary/10 text-primary' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isDenied ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isCompleted ? 'text-green-600' :
                          isDenied ? 'text-red-600' :
                          isActive ? 'text-primary' :
                          'text-gray-600'
                        }`}>
                          {step.name}
                        </span>
                        
                        {isCompleted && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Granted
                          </Badge>
                        )}
                        {isDenied && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Denied
                          </Badge>
                        )}
                        {isActive && (
                          <Badge variant="outline" className="text-primary border-primary/20">
                            Checking
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Required Permissions */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Required Permissions</span>
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap gap-1">
                {requiredPermissions.map((permission) => (
                  <Badge 
                    key={permission} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If access denied, show denial message
  if (!accessGranted) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Access Denied</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have the required permissions to access {componentName}.
            </p>
            <div className="text-left">
              <p className="text-xs font-medium text-muted-foreground mb-2">Required Permissions:</p>
              <div className="flex flex-wrap gap-1">
                {requiredPermissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted, show the component
  return (
    <div className="animate-in fade-in-50 duration-500">
      {children}
    </div>
  );
};

export default AccessControlGate;
