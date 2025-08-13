/**
 * 📊 DATA SOURCES SPA PAGE
 * ========================
 * 
 * Next.js App Router page for the Data Sources SPA
 * Integrates with the DataSourcesSPAOrchestrator to provide
 * full data source management capabilities within the Racine Main Manager.
 * 
 * Features RBAC route protection and permission validation.
 */

'use client';

import React from 'react';
import { RouteGuard } from '@/components/racine-main-manager/components/routing';
import { DataSourcesSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// MAIN DATA SOURCES PAGE WITH ROUTE PROTECTION
// ============================================================================

export default function DataSourcesPage() {
  return (
    <RouteGuard
      requiredPermissions={['data_sources.view']}
      requiredRoles={['user', 'admin', 'data_steward']}
      fallbackRoute="/access-denied"
      enableAuditLogging={true}
      showLoadingState={true}
      enableGracefulDegradation={true}
    >
      <DataSourcesSPAOrchestrator 
        mode="full-spa"
        enableRealTimeSync={true}
        enablePerformanceMonitoring={true}
        enableAdvancedFiltering={true}
        enableBulkOperations={true}
        enableExportCapabilities={true}
        showQuickActions={true}
        showStatusIndicators={true}
        showConnectionHealth={true}
        showDataQualityMetrics={true}
        enableNotifications={true}
      />
    </RouteGuard>
  );
}