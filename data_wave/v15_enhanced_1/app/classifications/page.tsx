/**
 * 🏷️ CLASSIFICATIONS SPA PAGE
 * ============================
 * 
 * Next.js App Router page for the Classifications SPA
 * Integrates with the ClassificationsSPAOrchestrator to provide
 * comprehensive data classification engine and schema management.
 */

import React from 'react';
import { Metadata } from 'next';
import { ClassificationsSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Classifications | Enterprise Data Governance Platform',
  description: 'Manage data classification schemas, labels, and automated classification rules for comprehensive data governance.',
  keywords: 'data classification, schemas, labels, automation, governance, sensitive data',
  openGraph: {
    title: 'Data Classifications Management',
    description: 'Comprehensive data classification engine and schema management',
    type: 'website'
  }
};

// ============================================================================
// MAIN CLASSIFICATIONS PAGE
// ============================================================================

export default function ClassificationsPage() {
  return (
    <ClassificationsSPAOrchestrator 
      mode="full-spa"
      enableSchemaEditor={true}
      enableLabelManagement={true}
      enableAutomationRules={true}
      enableClassificationEngine={true}
      enableSensitivityMapping={true}
      enableBulkClassification={true}
      enableMachineLearning={true}
      enableCustomClassifiers={true}
      enableComplianceMapping={true}
      enableNotifications={true}
      showClassificationMetrics={true}
      showAccuracyScores={true}
      showQuickActions={true}
      showRecommendations={true}
    />
  );
}