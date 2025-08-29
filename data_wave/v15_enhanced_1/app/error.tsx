/**
 * ⚠️ GLOBAL ERROR BOUNDARY COMPONENT
 * ===================================
 * 
 * Advanced error boundary for the Racine Main Manager SPA
 * Provides intelligent error handling, recovery options, and
 * detailed error reporting for the data governance platform.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Shield, 
  Database,
  Activity,
  Bug,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useToast } from '../components/ui/use-toast';

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

interface ErrorDetails {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'network' | 'permission' | 'data' | 'system' | 'unknown';
  recoverable: boolean;
  suggestions: string[];
}

const classifyError = (error: Error, errorInfo?: any): ErrorDetails => {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Authentication Errors
  if (message.includes('auth') || message.includes('login') || message.includes('token')) {
    return {
      title: 'Authentication Error',
      description: 'There was an issue with user authentication or session management.',
      icon: Shield,
      severity: 'high',
      category: 'authentication',
      recoverable: true,
      suggestions: [
        'Try logging out and logging back in',
        'Clear browser cache and cookies',
        'Contact your system administrator if the issue persists'
      ]
    };
  }

  // Network/API Errors
  if (message.includes('network') || message.includes('fetch') || message.includes('api')) {
    return {
      title: 'Network Connection Error',
      description: 'Unable to connect to the data governance backend services.',
      icon: Database,
      severity: 'high',
      category: 'network',
      recoverable: true,
      suggestions: [
        'Check your internet connection',
        'Refresh the page to retry',
        'Verify that backend services are running'
      ]
    };
  }

  // Permission Errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return {
      title: 'Permission Denied',
      description: 'You do not have sufficient permissions to access this resource.',
      icon: Shield,
      severity: 'medium',
      category: 'permission',
      recoverable: false,
      suggestions: [
        'Contact your administrator to request access',
        'Verify your user role and permissions',
        'Return to a page you have access to'
      ]
    };
  }

  // Data Processing Errors
  if (message.includes('data') || message.includes('parse') || message.includes('validation')) {
    return {
      title: 'Data Processing Error',
      description: 'There was an issue processing or validating data in the system.',
      icon: Activity,
      severity: 'medium',
      category: 'data',
      recoverable: true,
      suggestions: [
        'Refresh the page to reload data',
        'Check if the data source is accessible',
        'Verify data format and structure'
      ]
    };
  }

  // System/Critical Errors
  if (message.includes('chunk') || message.includes('module') || stack.includes('webpack')) {
    return {
      title: 'System Loading Error',
      description: 'A critical system component failed to load properly.',
      icon: Bug,
      severity: 'critical',
      category: 'system',
      recoverable: true,
      suggestions: [
        'Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)',
        'Clear browser cache and reload',
        'Try accessing the system from a different browser'
      ]
    };
  }

  // Default Unknown Error
  return {
    title: 'Unexpected Error',
    description: 'An unexpected error occurred in the data governance platform.',
    icon: AlertTriangle,
    severity: 'medium',
    category: 'unknown',
    recoverable: true,
    suggestions: [
      'Refresh the page to retry',
      'Go back to the previous page',
      'Contact support if the issue continues'
    ]
  };
};

// ============================================================================
// ERROR BOUNDARY PROPS
// ============================================================================

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

// ============================================================================
// MAIN ERROR COMPONENT
// ============================================================================

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  const [errorId] = useState(() => Math.random().toString(36).substring(2, 9));
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const errorDetails = classifyError(error);
  const IconComponent = errorDetails.icon;

  // Generate error report
  const errorReport = {
    id: errorId,
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
    category: errorDetails.category,
    severity: errorDetails.severity
  };

  const copyErrorReport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      setCopied(true);
      toast({
        title: "Error report copied",
        description: "The error details have been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy error report to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-destructive/10 mb-4">
              <IconComponent className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {errorDetails.title}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {errorDetails.description}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge 
                variant="outline" 
                className={getSeverityColor(errorDetails.severity)}
              >
                {errorDetails.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {errorDetails.category.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2 font-mono text-sm">
                {error.message}
              </AlertDescription>
            </Alert>

            {/* Recovery Suggestions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Suggested Actions:</h4>
              <ul className="space-y-2">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {errorDetails.recoverable && (
                <Button 
                  onClick={reset} 
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              
              <Button 
                onClick={copyErrorReport}
                variant="outline"
                size="sm"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Report'}
              </Button>
            </div>

            {/* Error ID */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Error ID: <span className="font-mono">{errorId}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Include this ID when reporting the issue
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}