/**
 * ⚖️ COMPLIANCE RULES SPA PAGE
 * ============================
 * 
 * Next.js App Router page for the Compliance Rules SPA
 * Integrates with the ComplianceRuleSPAOrchestrator to provide
 * comprehensive compliance policy management and regulatory framework support.
 */

import React from 'react';
import { Metadata } from 'next';
import { ComplianceRuleSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Compliance Rules | Enterprise Data Governance Platform',
  description: 'Manage compliance policies and regulatory frameworks with automated rule enforcement and audit reporting.',
  keywords: 'compliance, regulations, policies, GDPR, HIPAA, SOX, audit, governance',
  openGraph: {
    title: 'Compliance Rules Management',
    description: 'Comprehensive compliance policy management and regulatory framework support',
    type: 'website'
  }
};

// ============================================================================
// MAIN COMPLIANCE RULES PAGE
// ============================================================================

export default function ComplianceRulesPage() {
  return (
    <ComplianceRuleSPAOrchestrator 
      mode="full-spa"
      enablePolicyEditor={true}
      enableRegulatoryFrameworks={true}
      enableAutomatedEnforcement={true}
      enableAuditReporting={true}
      enableViolationDetection={true}
      enableRiskAssessment={true}
      enableComplianceTemplates={true}
      enableWorkflowAutomation={true}
      enableNotifications={true}
      enableBulkOperations={true}
      showComplianceScore={true}
      showViolationHistory={true}
      showRiskMetrics={true}
      showQuickActions={true}
      showRecommendations={true}
    />
  );
}