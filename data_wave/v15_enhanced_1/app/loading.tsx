/**
 * 🔄 GLOBAL LOADING COMPONENT
 * ============================
 * 
 * Advanced loading component for the Racine Main Manager SPA
 * Provides intelligent loading states with progress indicators
 * and contextual information based on the current route.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Database, 
  Shield, 
  Activity, 
  BarChart3,
  Workflow,
  GitBranch,
  Bot
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// ============================================================================
// LOADING CONTEXT DETECTION
// ============================================================================

const getLoadingContext = (pathname?: string) => {
  if (!pathname) return { icon: Loader2, label: 'Loading...', description: 'Initializing system' };
  
  if (pathname.includes('/data-sources')) {
    return { icon: Database, label: 'Loading Data Sources', description: 'Connecting to data sources and validating connections' };
  }
  
  if (pathname.includes('/scan-rule-sets')) {
    return { icon: Shield, label: 'Loading Scan Rules', description: 'Initializing scanning engine and rule sets' };
  }
  
  if (pathname.includes('/classifications')) {
    return { icon: Activity, label: 'Loading Classifications', description: 'Loading classification engine and schemas' };
  }
  
  if (pathname.includes('/compliance-rules')) {
    return { icon: Shield, label: 'Loading Compliance', description: 'Validating compliance policies and frameworks' };
  }
  
  if (pathname.includes('/advanced-catalog')) {
    return { icon: Database, label: 'Loading Catalog', description: 'Indexing data assets and metadata' };
  }
  
  if (pathname.includes('/scan-logic')) {
    return { icon: Activity, label: 'Loading Scan Logic', description: 'Initializing scanning algorithms and logic' };
  }
  
  if (pathname.includes('/rbac-system')) {
    return { icon: Shield, label: 'Loading RBAC System', description: 'Validating permissions and access controls' };
  }
  
  if (pathname.includes('/dashboard')) {
    return { icon: BarChart3, label: 'Loading Dashboard', description: 'Aggregating KPIs and real-time metrics' };
  }
  
  if (pathname.includes('/workspace')) {
    return { icon: Workflow, label: 'Loading Workspace', description: 'Preparing workspace environment' };
  }
  
  if (pathname.includes('/workflows')) {
    return { icon: Workflow, label: 'Loading Workflows', description: 'Initializing workflow engine and builder' };
  }
  
  if (pathname.includes('/pipelines')) {
    return { icon: GitBranch, label: 'Loading Pipelines', description: 'Loading pipeline designer and orchestrator' };
  }
  
  if (pathname.includes('/ai-assistant')) {
    return { icon: Bot, label: 'Loading AI Assistant', description: 'Initializing AI models and context engine' };
  }
  
  return { icon: Loader2, label: 'Loading Racine Manager', description: 'Initializing data governance platform' };
};

// ============================================================================
// MAIN LOADING COMPONENT
// ============================================================================

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [pathname, setPathname] = useState<string>('');

  // Get current pathname from window location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  // Simulate loading progress
  useEffect(() => {
    const steps = [
      'Authenticating user...',
      'Loading permissions...',
      'Connecting to backend...',
      'Initializing components...',
      'Finalizing setup...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 20, 95);
        
        // Update step based on progress
        const stepProgress = Math.floor((newProgress / 100) * steps.length);
        if (stepProgress < steps.length && stepProgress !== stepIndex) {
          stepIndex = stepProgress;
          setCurrentStep(steps[stepIndex]);
        }
        
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const context = getLoadingContext(pathname);
  const IconComponent = context.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <Card className="w-full max-w-md mx-4 border-border/50 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Main Loading Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10"
            >
              <IconComponent className="w-8 h-8 text-primary" />
            </motion.div>

            {/* Loading Title and Description */}
            <div className="space-y-2">
              <motion.h2 
                className="text-xl font-semibold text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {context.label}
              </motion.h2>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {context.description}
              </motion.p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />
              <motion.p 
                className="text-xs text-muted-foreground"
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep}
              </motion.p>
            </div>

            {/* Loading Dots Animation */}
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}