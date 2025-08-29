/**
 * 🚫 ACCESS DENIED PAGE - RBAC PROTECTION
 * =======================================
 * 
 * Professional access denied page that provides clear feedback when users
 * attempt to access routes they don't have permissions for. Integrates with
 * the RBAC system to provide helpful context and next steps.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  ArrowLeft, 
  Home, 
  Settings, 
  HelpCircle,
  AlertTriangle,
  Lock,
  UserX,
  Mail,
  ExternalLink
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

// ============================================================================
// ACCESS DENIAL REASONS
// ============================================================================

const DENIAL_REASONS = {
  admin_required: {
    title: 'Administrator Access Required',
    description: 'This section requires administrator privileges.',
    icon: UserX,
    color: 'destructive' as const,
    suggestions: [
      'Contact your system administrator to request admin access',
      'Verify you are logged in with the correct account',
      'Check if your admin privileges have been temporarily suspended'
    ]
  },
  insufficient_permissions: {
    title: 'Insufficient Permissions',
    description: 'You don\'t have the required permissions to access this resource.',
    icon: Lock,
    color: 'destructive' as const,
    suggestions: [
      'Request access through the self-service portal',
      'Contact your team lead or data governance administrator',
      'Verify your role assignments in your profile settings'
    ]
  },
  expired_session: {
    title: 'Session Expired',
    description: 'Your session has expired. Please log in again.',
    icon: AlertTriangle,
    color: 'warning' as const,
    suggestions: [
      'Click the login button below to authenticate again',
      'Ensure your system clock is correct',
      'Contact IT support if you continue experiencing issues'
    ]
  },
  maintenance_mode: {
    title: 'Maintenance Mode',
    description: 'This section is temporarily unavailable due to maintenance.',
    icon: Settings,
    color: 'secondary' as const,
    suggestions: [
      'Try again in a few minutes',
      'Check the system status page for updates',
      'Contact support if this is urgent'
    ]
  }
};

// ============================================================================
// MAIN ACCESS DENIED COMPONENT
// ============================================================================

export default function AccessDeniedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [denialReason, setDenialReason] = useState<keyof typeof DENIAL_REASONS>('insufficient_permissions');
  const [requestedRoute, setRequestedRoute] = useState<string>('');
  const [requiredPermissions, setRequiredPermissions] = useState<string[]>([]);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (!searchParams) return;
    
    const reason = searchParams.get('reason') as keyof typeof DENIAL_REASONS;
    const route = searchParams.get('route');
    const permissions = searchParams.get('required');

    if (reason && DENIAL_REASONS[reason]) {
      setDenialReason(reason);
    }
    
    if (route) {
      setRequestedRoute(route);
    }
    
    if (permissions) {
      setRequiredPermissions(permissions.split(','));
    }
  }, [searchParams]);

  const denialInfo = DENIAL_REASONS[denialReason];
  const DenialIcon = denialInfo.icon;

  const handleRequestAccess = async () => {
    try {
      setRequestSent(true);
      // Here you would integrate with the actual access request system
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      setRequestSent(false);
    }
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    // This would integrate with your support system
    window.open('mailto:support@racine-governance.com?subject=Access Request&body=I need access to: ' + requestedRoute, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className={`
                inline-flex items-center justify-center w-16 h-16 rounded-full
                ${denialInfo.color === 'destructive' ? 'bg-destructive/10 text-destructive' : ''}
                ${denialInfo.color === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' : ''}
                ${denialInfo.color === 'secondary' ? 'bg-secondary text-secondary-foreground' : ''}
              `}>
                <DenialIcon className="w-8 h-8" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-center">
              {denialInfo.title}
            </CardTitle>
            
            <p className="text-muted-foreground text-center">
              {denialInfo.description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Route Information */}
            {requestedRoute && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Requested Resource</AlertTitle>
                <AlertDescription>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {requestedRoute}
                  </code>
                </AlertDescription>
              </Alert>
            )}

            {/* Required Permissions */}
            {requiredPermissions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Required Permissions:</h4>
                <div className="flex flex-wrap gap-2">
                  {requiredPermissions.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What you can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {denialInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              {denialReason === 'insufficient_permissions' && (
                <Button 
                  onClick={handleRequestAccess}
                  disabled={requestSent}
                  className="w-full"
                >
                  {requestSent ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Access Request Sent
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Request Access
                    </>
                  )}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleGoBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                <Button variant="outline" onClick={handleGoHome}>
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleContactSupport}
                className="w-full"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Contact Support
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Need immediate assistance? Call{' '}
            <a 
              href="tel:+1-800-RACINE" 
              className="text-primary hover:underline font-medium"
            >
              +1-800-RACINE
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}