'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a brief loading screen
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo and branding */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-md"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PurSight
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Enterprise Data Governance Platform
            </p>
            <p className="text-sm text-muted-foreground/80">
              Advanced AI/ML Intelligence • Real-time Orchestration • Comprehensive Integration
            </p>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading dashboard...</span>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-xs text-muted-foreground">
          <div className="p-3 bg-card rounded-lg border">
            <div className="font-medium text-foreground">7 Core Groups</div>
            <div>Integrated</div>
          </div>
          <div className="p-3 bg-card rounded-lg border">
            <div className="font-medium text-foreground">100+ Models</div>
            <div>Data Structures</div>
          </div>
          <div className="p-3 bg-card rounded-lg border">
            <div className="font-medium text-foreground">150+ Services</div>
            <div>Business Logic</div>
          </div>
          <div className="p-3 bg-card rounded-lg border">
            <div className="font-medium text-foreground">AI/ML Ready</div>
            <div>Intelligence</div>
          </div>
        </div>

        {/* Version info */}
        <div className="text-xs text-muted-foreground/60">
          Version 2.0.0 • Racine Main Manager • Production Ready
        </div>
      </div>
    </div>
  );
}