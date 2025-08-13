/**
 * 🛡️ RBAC SYSTEM SPA PAGE - ADMIN ONLY
 * =====================================
 * 
 * Next.js App Router page for the RBAC System SPA
 * Integrates with the RBACSystemSPAOrchestrator to provide
 * comprehensive role-based access control and security management.
 * 
 * Features strict admin-only route protection with enhanced security.
 */

'use client';

import React from 'react';
import { AdminRouteGuard } from '@/components/racine-main-manager/components/routing';
import { RBACSystemSPAOrchestrator } from '@/components/racine-main-manager/components/spa-orchestrators';

// ============================================================================
// MAIN RBAC SYSTEM PAGE WITH ADMIN PROTECTION
// ============================================================================

export default function RBACSystemPage() {
  return (
    <AdminRouteGuard
      requiredPermissions={['rbac.view', 'rbac.manage', 'admin.access']}
      requiredRoles={['admin', 'super_admin']}
      fallbackRoute="/access-denied"
      enableMFACheck={true}
      enableSessionValidation={true}
      enableAuditLogging={true}
      enableSecurityScoring={true}
      showLoadingState={true}
      minSecurityLevel="high"
    >
      <RBACSystemSPAOrchestrator 
        mode="full-spa"
        enableRoleManagement={true}
        enablePermissionMatrix={true}
        enableUserManagement={true}
        enableGroupManagement={true}
        enablePolicyBuilder={true}
        enableAccessReviews={true}
        enableAuditLogging={true}
        enableSecurityAnalytics={true}
        enableMFAManagement={true}
        enableAPIKeyManagement={true}
        enableNotifications={true}
        showSecurityScore={true}
        showAccessPatterns={true}
        showViolationHistory={true}
        showQuickActions={true}
        showRecommendations={true}
        adminOnly={true}
      />
    </AdminRouteGuard>
  );
}