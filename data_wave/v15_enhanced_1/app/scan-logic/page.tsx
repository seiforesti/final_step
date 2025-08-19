/**
 * 🔍 ADVANCED SCAN LOGIC SPA PAGE
 * ===============================
 * 
 * Next.js App Router page for the Advanced Scan Logic SPA
 * Integrates with the ScanLogicSPAOrchestrator to provide
 * comprehensive scanning algorithms and processing logic management.
 */

import React from 'react';
import { Metadata } from 'next';
import { ScanLogicSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Advanced Scan Logic | Enterprise Data Governance Platform',
  description: 'Configure and manage advanced scanning algorithms and data processing logic for comprehensive data analysis.',
  keywords: 'scan logic, algorithms, data processing, analysis, patterns, machine learning',
  openGraph: {
    title: 'Advanced Scan Logic Management',
    description: 'Scanning algorithms and processing logic management',
    type: 'website'
  }
};

// ============================================================================
// MAIN SCAN LOGIC PAGE
// ============================================================================

export default function ScanLogicPage() {
  return (
    <ScanLogicSPAOrchestrator 
      mode="full-spa"
      enableAlgorithmEditor={true}
      enableLogicBuilder={true}
      enablePatternRecognition={true}
      enableMachineLearning={true}
      enableCustomProcessors={true}
      enablePerformanceTuning={true}
      enableBatchProcessing={true}
      enableRealTimeProcessing={true}
      enableTestingFramework={true}
      enableVersionControl={true}
      enableNotifications={true}
      showPerformanceMetrics={true}
      showProcessingHistory={true}
      showAccuracyScores={true}
      showQuickActions={true}
      showOptimizationSuggestions={true}
    />
  );
}