/**
 * 💬 COLLABORATION HUB PAGE
 * =========================
 * 
 * Next.js App Router page for the Collaboration Hub
 * Integrates with the MasterCollaborationHub to provide
 * team collaboration center with real-time features.
 */

import React from 'react';
import { Metadata } from 'next';
import { CollaborationHub } from '@/components/racine-main-manager/components/collaboration/CollaborationHub';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Collaboration Hub | Enterprise Data Governance Platform',
  description: 'Real-time collaboration center with chat, shared tasks, document management, and workflow co-authoring.',
  keywords: 'collaboration, chat, tasks, documents, teamwork, real-time, co-authoring',
  openGraph: {
    title: 'Collaboration Hub',
    description: 'Team collaboration center with real-time features',
    type: 'website'
  }
};

// ============================================================================
// MAIN COLLABORATION PAGE
// ============================================================================

export default function CollaborationPage() {
  return (
    <CollaborationHub 
      mode="full-hub"
      enableRealTimeCollaboration={true}
      enableTeamWorkspaces={true}
      enableDocumentSharing={true}
      enableVideoConferencing={true}
      enableProjectManagement={true}
      enableTaskAssignment={true}
      enableProgressTracking={true}
      enableNotifications={true}
      showTeamDirectory={true}
      showProjectOverview={true}
      showTaskBoard={true}
      showCollaborationHistory={true}
      showQuickActions={true}
    />
  );
}