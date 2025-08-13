/**
 * 🔐 LOGIN PAGE - RACINE AUTHENTICATION
 * ====================================
 * 
 * Enterprise-grade login page that integrates with the Racine RBAC system
 * to provide secure authentication for the data governance platform.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Loader2,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Building2,
  Database,
  Layers
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Authentication hook (would be implemented in the RBAC system)
import { useAuth } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/useAuth';

// ============================================================================
// MAIN LOGIN COMPONENT
// ============================================================================

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [redirectPath, setRedirectPath] = useState('/dashboard');

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectPath(decodeURIComponent(redirect));
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      if (result.success) {
        router.push(redirectPath);
      }
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to Racine
          </h1>
          
          <p className="text-muted-foreground">
            Enterprise Data Governance Platform
          </p>
        </motion.div>

        {/* Login Card */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your credentials to access the platform
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username or email"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  disabled={isLoading}
                  className="rounded border-input"
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formData.username || !formData.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Additional Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Forgot your password?{' '}
                <Button variant="link" className="p-0 h-auto">
                  Reset it here
                </Button>
              </p>
              
              <p className="text-sm text-muted-foreground">
                Need access?{' '}
                <Button variant="link" className="p-0 h-auto">
                  Contact Administrator
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Data Sources</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-muted-foreground">Classification</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs text-muted-foreground">Compliance</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-muted-foreground">
            © 2024 Racine Data Governance Platform. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}