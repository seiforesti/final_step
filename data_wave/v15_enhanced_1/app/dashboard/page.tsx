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
import { IntelligentDashboardOrchestrator } from '@/components/racine-main-manager/components/dashboard';

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
    <IntelligentDashboardOrchestrator 
      mode="full-dashboard"
      enableRealTimeUpdates={true}
      enableCustomWidgets={true}
      enableDrillDownAnalytics={true}
      enableExportCapabilities={true}
      enableAlertManagement={true}
      enablePredictiveAnalytics={true}
      enableCrossGroupCorrelation={true}
      enablePerformanceMetrics={true}
      enableNotifications={true}
      showSystemHealth={true}
      showDataQuality={true}
      showComplianceScores={true}
      showUsageStatistics={true}
      showTrendAnalysis={true}
      showQuickActions={true}
      autoRefreshInterval={30000}
    />
  );
}
