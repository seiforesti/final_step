'use client';

import { Suspense } from 'react';
import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';
import { MetricsCards } from '@/features/dashboard/components/MetricsCards';
import { SystemHealthPanel } from '@/features/dashboard/components/SystemHealthPanel';
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to PurSight Enterprise Data Governance Platform
        </p>
      </div>

      {/* Metrics cards */}
      <Suspense fallback={<LoadingSpinner />}>
        <MetricsCards />
      </Suspense>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main overview */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardOverview />
          </Suspense>
          
          <Suspense fallback={<LoadingSpinner />}>
            <SystemHealthPanel />
          </Suspense>
        </div>

        {/* Right column - Activity and actions */}
        <div className="space-y-6">
          <QuickActions />
          
          <Suspense fallback={<LoadingSpinner />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </div>
    </div>
  );
}