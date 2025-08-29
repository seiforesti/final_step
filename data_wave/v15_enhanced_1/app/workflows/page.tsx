/**
 * ⚡ JOB WORKFLOWS PAGE
 * ====================
 * 
 * Next.js App Router page for the Job Workflows
 * Integrates with the JobWorkflowBuilder to provide
 * Databricks-style workflow builder and orchestration.
 */

import React from 'react';
import { Metadata } from 'next';
import { JobWorkflowBuilder } from '../../components/racine-main-manager/components/job-workflow-space';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Job Workflows | Enterprise Data Governance Platform',
  description: 'Design, build, and orchestrate complex workflows with drag-and-drop interface and advanced scheduling.',
  keywords: 'workflows, jobs, automation, scheduling, orchestration, databricks',
  openGraph: {
    title: 'Job Workflows',
    description: 'Databricks-style workflow builder and orchestration',
    type: 'website'
  }
};

// ============================================================================
// MAIN WORKFLOWS PAGE
// ============================================================================

export default function WorkflowsPage() {
  return (
    <JobWorkflowBuilder 
      mode="full-builder"
      enableDragAndDrop={true}
      enableVisualScripting={true}
      enableAdvancedScheduling={true}
      enableRealTimeMonitoring={true}
      enableTemplateLibrary={true}
      enableVersionControl={true}
      enableCollaboration={true}
      enableAIRecommendations={true}
      enableCrossGroupOrchestration={true}
      enableNotifications={true}
      showWorkflowHealth={true}
      showExecutionHistory={true}
      showPerformanceMetrics={true}
      showQuickActions={true}
      showDependencyGraph={true}
    />
  );
}