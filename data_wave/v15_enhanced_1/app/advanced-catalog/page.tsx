/**
 * 📚 ADVANCED CATALOG SPA PAGE
 * ============================
 * 
 * Next.js App Router page for the Advanced Catalog SPA
 * Integrates with the AdvancedCatalogSPAOrchestrator to provide
 * enterprise data catalog with comprehensive metadata management.
 */

import React from 'react';
import { Metadata } from 'next';
import { AdvancedCatalogSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Advanced Catalog | Enterprise Data Governance Platform',
  description: 'Discover, catalog, and manage enterprise data assets with advanced metadata management and lineage tracking.',
  keywords: 'data catalog, metadata, lineage, discovery, assets, enterprise, governance',
  openGraph: {
    title: 'Advanced Data Catalog',
    description: 'Enterprise data catalog with comprehensive metadata management',
    type: 'website'
  }
};

// ============================================================================
// MAIN ADVANCED CATALOG PAGE
// ============================================================================

export default function AdvancedCatalogPage() {
  return (
    <AdvancedCatalogSPAOrchestrator 
      mode="full-spa"
      enableMetadataManagement={true}
      enableLineageTracking={true}
      enableDataDiscovery={true}
      enableSearchAndFilter={true}
      enableBusinessGlossary={true}
      enableQualityMetrics={true}
      enableUsageAnalytics={true}
      enableRecommendations={true}
      enableBulkOperations={true}
      enableVersionControl={true}
      enableNotifications={true}
      showQualityScores={true}
      showUsageStatistics={true}
      showLineageGraph={true}
      showQuickActions={true}
      showRecentActivity={true}
    />
  );
}