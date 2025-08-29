/**
 * 🏢 WORKSPACE MANAGER PAGE
 * =========================
 * 
 * Next.js App Router page for the Workspace Manager
 * Integrates with the WorkspaceOrchestrator to provide
 * multi-workspace orchestration with SPA integration.
 */

import React from 'react';
import { Metadata } from 'next';
import { WorkspaceOrchestrator } from '../../components/racine-main-manager/components/workspace';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Workspace Manager | Enterprise Data Governance Platform',
  description: 'Create, manage, and switch between multiple workspaces with cross-SPA resource integration and collaboration.',
  keywords: 'workspace, management, collaboration, resources, projects, teams',
  openGraph: {
    title: 'Workspace Manager',
    description: 'Multi-workspace orchestration with SPA integration',
    type: 'website'
  }
};

// ============================================================================
// MAIN WORKSPACE PAGE
// ============================================================================

export default function WorkspacePage() {
  return (
    <WorkspaceOrchestrator 
      mode="full-workspace"
      enableMultiWorkspace={true}
      enableWorkspaceTemplates={true}
      enableCollaboration={true}
      enableResourceSharing={true}
      enableVersionControl={true}
      enableAccessControl={true}
      enableWorkspaceAnalytics={true}
      enableBackupRestore={true}
      enableNotifications={true}
      enableBulkOperations={true}
      showWorkspaceHealth={true}
      showResourceUsage={true}
      showCollaborationActivity={true}
      showQuickActions={true}
      showRecentActivity={true}
    />
  );
}