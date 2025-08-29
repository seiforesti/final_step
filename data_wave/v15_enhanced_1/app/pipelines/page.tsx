/**
 * 🔀 PIPELINE MANAGER PAGE
 * ========================
 * 
 * Next.js App Router page for the Pipeline Manager
 * Integrates with the PipelineDesigner to provide
 * advanced pipeline design and execution management.
 */

import React from 'react';
import { Metadata } from 'next';
import { PipelineDesigner } from '../../components/racine-main-manager/components/pipeline-manager';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Pipeline Manager | Enterprise Data Governance Platform',
  description: 'Design, visualize, and execute advanced data pipelines with real-time monitoring and optimization.',
  keywords: 'pipelines, data processing, ETL, real-time, monitoring, optimization',
  openGraph: {
    title: 'Pipeline Manager',
    description: 'Advanced pipeline design and execution management',
    type: 'website'
  }
};

// ============================================================================
// MAIN PIPELINES PAGE
// ============================================================================

export default function PipelinesPage() {
  return (
    <PipelineDesigner 
      mode="full-designer"
      enableDragAndDropDesign={true}
      enableAdvancedBranching={true}
      enableConditionalLogic={true}
      enableRealTimeVisualization={true}
      enableTemplateLibrary={true}
      enablePerformanceOptimization={true}
      enableAutoScaling={true}
      enableHealthMonitoring={true}
      enableVersionControl={true}
      enableNotifications={true}
      showExecutionMetrics={true}
      showResourceUsage={true}
      showOptimizationSuggestions={true}
      showQuickActions={true}
      showPipelineHealth={true}
    />
  );
}