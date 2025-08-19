/**
 * 🛡️ SCAN RULE SETS SPA PAGE
 * ===========================
 * 
 * Next.js App Router page for the Scan Rule Sets SPA
 * Integrates with the ScanRuleSetsSPAOrchestrator to provide
 * comprehensive scanning rule management and policy configuration.
 */

import React from 'react';
import { Metadata } from 'next';
import { ScanRuleSetsSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Scan Rule Sets | Enterprise Data Governance Platform',
  description: 'Configure and manage advanced scanning rules and policies for comprehensive data discovery and classification.',
  keywords: 'scan rules, policies, data discovery, classification, governance, security',
  openGraph: {
    title: 'Scan Rule Sets Management',
    description: 'Advanced scanning rule configuration and policy management',
    type: 'website'
  }
};

// ============================================================================
// MAIN SCAN RULE SETS PAGE
// ============================================================================

export default function ScanRuleSetsPage() {
  return (
    <ScanRuleSetsSPAOrchestrator 
      mode="full-spa"
      enableRuleEditor={true}
      enablePolicyWizard={true}
      enableRuleTesting={true}
      enablePerformanceMetrics={true}
      enableRuleValidation={true}
      enableBulkOperations={true}
      enableVersionControl={true}
      enableRuleTemplates={true}
      enableComplianceMapping={true}
      enableNotifications={true}
      showRuleEffectiveness={true}
      showScanningHistory={true}
      showQuickActions={true}
    />
  );
}