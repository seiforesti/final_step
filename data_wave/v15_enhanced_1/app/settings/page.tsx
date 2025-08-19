/**
 * ⚙️ USER SETTINGS PAGE
 * =====================
 * 
 * Next.js App Router page for the User Settings
 * Integrates with the UserProfileManager to provide
 * profile and preferences management.
 */

import React from 'react';
import { Metadata } from 'next';
import { UserProfileManager } from '@/components/racine-main-manager/components/user-management';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'User Settings | Enterprise Data Governance Platform',
  description: 'Manage user profile, preferences, security settings, and access controls for the data governance platform.',
  keywords: 'settings, profile, preferences, security, access control, user management',
  openGraph: {
    title: 'User Settings',
    description: 'Profile and preferences management',
    type: 'website'
  }
};

// ============================================================================
// MAIN SETTINGS PAGE
// ============================================================================

export default function SettingsPage() {
  return (
    <UserProfileManager 
      mode="full-profile"
      enableProfileManagement={true}
      enableSecuritySettings={true}
      enablePreferencesEngine={true}
      enableAccessControlVisualization={true}
      enableAPIKeyManagement={true}
      enableMFAManagement={true}
      enableNotificationPreferences={true}
      enableThemeCustomization={true}
      enableDataExport={true}
      enableNotifications={true}
      showSecurityAudit={true}
      showAccessHistory={true}
      showUserAnalytics={true}
      showQuickActions={true}
      showRecentActivity={true}
    />
  );
}