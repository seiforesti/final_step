import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    name: string;
    email: string;
    role: string;
    permissions: string[];
  } | null;
}

interface ClassificationAuthProps {
  authState: AuthState;
  onLogin: () => void;
  onRetry: () => void;
  children: React.ReactNode;
  developmentMode?: boolean;
}

const ClassificationAuth: React.FC<ClassificationAuthProps> = ({
  authState,
  onLogin,
  onRetry,
  children,
  developmentMode = false
}) => {
  // Development mode bypass
  if (developmentMode) {
    return (
      <div>
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Running in development mode - Authentication bypassed
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // Loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Classifications</h2>
            <p className="text-gray-600">Verifying permissions and initializing system...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (authState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{authState.error}</p>
            <div className="space-y-2">
              <Button onClick={onRetry} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={onLogin} className="w-full">
                Login Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-gray-600">
              Please log in to access the Classifications system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onLogin} className="w-full">
              Sign In
            </Button>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Secure access to DataWave Classifications
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated - show children with user context
  return (
    <div>
      {/* Optional: Show authentication status */}
      <div className="hidden">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Authenticated as {authState.user?.name} ({authState.user?.role})
          </AlertDescription>
        </Alert>
      </div>
      {children}
    </div>
  );
};

export default ClassificationAuth;
