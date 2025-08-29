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
import { MasterCollaborationHub } from '../../components/racine-main-manager/components/collaboration';

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
    <MasterCollaborationHub 
      mode="full-hub"
      enableRealTimeChat={true}
      enableSharedTasks={true}
      enableDocumentManagement={true}
      enableWorkflowCoAuthoring={true}
      enableVideoConferencing={true}
      enableScreenSharing={true}
      enableFileSharing={true}
      enableCollaborationAnalytics={true}
      enablePresenceIndicators={true}
      enableNotifications={true}
      showActiveCollaborations={true}
      showRecentActivity={true}
      showTaskProgress={true}
      showQuickActions={true}
      showParticipantsList={true}
    />
  );
}