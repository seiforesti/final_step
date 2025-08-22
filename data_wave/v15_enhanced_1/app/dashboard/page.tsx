/**
 * 📊 GLOBAL DASHBOARD PAGE
 * ========================
 * 
 * Next.js App Router page for the Global Dashboard
 * Integrates with the IntelligentDashboardOrchestrator to provide
 * comprehensive cross-SPA analytics and system monitoring.
 */

import React from 'react';
import { Metadata } from 'next';
import { DashboardHub } from '@/components/racine-main-manager/components/dashboard/DashboardHub';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Global Dashboard | Enterprise Data Governance Platform',
  description: 'Comprehensive analytics dashboard with real-time KPIs, system health monitoring, and cross-SPA insights.',
  keywords: 'dashboard, analytics, KPIs, monitoring, insights, real-time, governance',
  openGraph: {
    title: 'Global Dashboard',
    description: 'Real-time analytics and monitoring across all data governance groups',
    type: 'website'
  }
};

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  return (
    <DashboardHub 
      mode="full-dashboard"
      enableRealTimeUpdates={true}
      enableCustomWidgets={true}
      enableCrossGroupVisualizations={true}
      enablePredictiveAnalytics={true}
      enableExecutiveReporting={true}
      enableDrillDownAnalytics={true}
      enableAlertSystem={true}
      enablePerformanceMonitoring={true}
      showKPIMetrics={true}
      showTrendAnalysis={true}
      showPerformanceCharts={true}
      showAlertHistory={true}
      showQuickActions={true}
    />
  );
}
