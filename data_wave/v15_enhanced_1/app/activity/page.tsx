/**
 * 📈 ACTIVITY TRACKER PAGE
 * ========================
 * 
 * Next.js App Router page for the Activity Tracker
 * Integrates with the ActivityTrackingHub to provide
 * historic activities and audit trails across all SPAs.
 */

import React from 'react';
import { Metadata } from 'next';
import { ActivityTrackingHub } from '@/components/racine-main-manager/components/activity-tracker';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Activity Tracker | Enterprise Data Governance Platform',
  description: 'Comprehensive activity logging and audit trails with real-time monitoring and analytics.',
  keywords: 'activity, tracking, audit, logs, monitoring, analytics, compliance',
  openGraph: {
    title: 'Activity Tracker',
    description: 'Historic activities and audit trails across all SPAs',
    type: 'website'
  }
};

// ============================================================================
// MAIN ACTIVITY PAGE
// ============================================================================

export default function ActivityPage() {
  return (
    <ActivityTrackingHub 
      mode="full-tracker" 
      enableRealTimeTracking={true} 
      enableAdvancedFiltering={true} 
      enableCrossGroupCorrelation={true} 
      enableVisualAnalytics={true} 
      enableAuditTrails={true} 
      enableExportCapabilities={true} 
      enableAlertSystem={true} 
      enableComplianceReporting={true} 
      enableUserBehaviorAnalysis={true} 
      enableNotifications={true} 
      showActivityTimeline={true} 
      showHeatmaps={true} 
      showAnomalyDetection={true} 
      showQuickActions={true} 
      showStatistics={true} 
    />
  );
}