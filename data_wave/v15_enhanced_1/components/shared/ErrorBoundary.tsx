/**
 * 🛡️ ADVANCED ENTERPRISE ERROR BOUNDARY
 * =====================================
 * 
 * Advanced error boundary component with comprehensive error handling,
 * reporting, recovery mechanisms, and enterprise-grade features.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Bug, Shield, X, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  timestamp: Date;
  componentStack: string;
  userAgent: string;
  url: string;
  retryCount: number;
  isRecovering: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecover?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  showDetails?: boolean;
  enableReporting?: boolean;
  className?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: new Date(),
      componentStack: '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
      componentStack: errorInfo.componentStack
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo);
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        errorId: this.state.errorId,
        timestamp: this.state.timestamp.toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        context: {
          userAgent: this.state.userAgent,
          url: this.state.url,
          retryCount: this.state.retryCount
        }
      };

      // Send to error reporting service
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      toast({
        title: "Maximum retries exceeded",
        description: "Please refresh the page or contact support.",
        variant: "destructive"
      });
      return;
    }

    this.setState({ isRecovering: true });

    this.retryTimeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRecovering: false
      }));

      if (this.props.onRecover) {
        this.props.onRecover();
      }
    }, retryDelay);
  };

  private handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      timestamp: this.state.timestamp.toISOString(),
      error: this.state.error?.toString(),
      componentStack: this.state.componentStack,
      userAgent: this.state.userAgent,
      url: this.state.url
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    toast({
      title: "Error details copied",
      description: "Error information has been copied to clipboard."
    });
  };

  private downloadErrorReport = () => {
    const errorReport = {
      errorId: this.state.errorId,
      timestamp: this.state.timestamp.toISOString(),
      error: this.state.error?.toString(),
      componentStack: this.state.componentStack,
      userAgent: this.state.userAgent,
      url: this.state.url,
      retryCount: this.state.retryCount
    };

    const blob = new Blob([JSON.stringify(errorReport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={`min-h-screen bg-background p-4 ${this.props.className || ''}`}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-destructive/50">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-destructive/10">
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-destructive">
                    Something went wrong
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    An unexpected error occurred. Our team has been notified.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Error Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono">
                        {this.state.errorId}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {this.state.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {this.state.error?.message || 'Unknown error occurred'}
                    </p>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                      onClick={this.handleRetry}
                      disabled={this.state.isRecovering}
                      className="min-w-[120px]"
                    >
                      {this.state.isRecovering ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry ({this.state.retryCount + 1}/{this.props.maxRetries || 3})
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={this.handleRefresh}
                      className="min-w-[120px]"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Refresh Page
                    </Button>

                    {this.props.showDetails && (
                      <>
                        <Button
                          variant="outline"
                          onClick={this.copyErrorDetails}
                          size="sm"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Details
                        </Button>

                        <Button
                          variant="outline"
                          onClick={this.downloadErrorReport}
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Report
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Error Details */}
                  {this.props.showDetails && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Bug className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">Error Details</h3>
                        </div>
                        
                        <ScrollArea className="h-64 w-full rounded-md border p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Error Stack</h4>
                              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                                {this.state.error?.stack || 'No stack trace available'}
                              </pre>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-2">Component Stack</h4>
                              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                                {this.state.componentStack || 'No component stack available'}
                              </pre>
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}

                  {/* Support Information */}
                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      If this problem persists, please contact our support team with the error ID above.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
