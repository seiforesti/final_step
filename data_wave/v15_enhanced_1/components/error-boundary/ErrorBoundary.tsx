import React from "react";
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg text-center space-y-6"
          >
            <AlertTriangle className="w-16 h-16 mx-auto text-red-500" />

            <Alert className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-red-200 dark:border-red-800">
              <AlertTitle className="text-xl font-bold text-red-900 dark:text-red-100">
                Something went wrong
              </AlertTitle>
              <AlertDescription className="mt-4 space-y-4">
                <p className="text-red-700 dark:text-red-300">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>

                {process.env.NODE_ENV === "development" &&
                  this.state.errorInfo && (
                    <div className="mt-4 text-left">
                      <details className="bg-red-50 dark:bg-red-950 p-4 rounded-lg text-xs font-mono text-red-800 dark:text-red-200 overflow-auto">
                        <summary className="cursor-pointer">
                          Stack trace
                        </summary>
                        <pre className="mt-2">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    </div>
                  )}

                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    onClick={this.handleReload}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Application
                  </Button>

                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
