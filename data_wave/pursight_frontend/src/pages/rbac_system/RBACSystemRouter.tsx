import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CheckAccessPage from "./CheckAccessPage";
import NewCheckAccessPage from "./NewCheckAccessPage";
import RoleAssignmentsPage from "./RoleAssignmentsPage";
import NewRoleAssignmentsPage from "./NewRoleAssignmentsPage";
import RolesPage from "./RolesPage";
import NewRolesPage from "./NewRolesPage";
import DenyAssignmentsPage from "./DenyAssignmentsPage";
import NewDenyAssignmentsPage from "./NewDenyAssignmentsPage";
import UsersPage from "./UsersPage";
import NewUsersPage from "./NewUsersPage";
import GroupsPage from "./GroupsPage";
import NewGroupsPage from "./NewGroupsPage";
import AuditLogsPage from "./AuditLogsPage";
import NewAuditLogsPage from "./NewAuditLogsPage";
import SettingsPage from "./SettingsPage";
import NewSettingsPage from "./NewSettingsPage";
import PermissionsPage from "./PermissionsPage";
import NewPermissionsPage from "./NewPermissionsPage";
import ConditionsPage from "./ConditionsPage";
import NewConditionsPage from "./NewConditionsPage";
import ResourceAssignmentsPage from "./ResourceAssignmentsPage";
import NewResourceAssignmentsPage from "./NewResourceAssignmentsPage";
import RoleHierarchyTree from "./RoleHierarchyTree";
import NewRoleHierarchyTree from "./NewRoleHierarchyTree";
import AccessRequestsPage from "./AccessRequestsPage";
import NewAccessRequestsPage from "./NewAccessRequestsPage";
import ResourceTreePage from "./ResourceTreePage";
import NewResourceTreePage from "./NewResourceTreePage";

export type RBACSection =
  | "check-access"
  | "role-assignments"
  | "roles"
  | "role-hierarchy"
  | "access-requests"
  | "deny-assignments"
  | "users"
  | "groups"
  | "audit-logs"
  | "settings"
  | "permissions"
  | "conditions"
  | "resource-assignments"
  | "resource-tree";

interface Props {
  section: RBACSection;
}

// Import UIToggle component
import UIToggle from "./components/UIToggle";

const RBACSystemRouter: React.FC<Props> = ({ section }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const useNewUI = searchParams.get('newUI') === 'true';

  // Render the appropriate component based on the section
  const renderSection = () => {
    switch (section) {
    case "check-access":
      return useNewUI ? <NewCheckAccessPage /> : <CheckAccessPage />;
    case "role-assignments":
      return useNewUI ? <NewRoleAssignmentsPage /> : <RoleAssignmentsPage />;
    case "roles":
      return useNewUI ? <NewRolesPage /> : <RolesPage />;
    case "deny-assignments":
      return useNewUI ? <NewDenyAssignmentsPage /> : <DenyAssignmentsPage />;
    case "users":
      return useNewUI ? <NewUsersPage /> : <UsersPage />; 
    case "groups":
      return useNewUI ? <NewGroupsPage /> : <GroupsPage />;
    case "audit-logs":
      return useNewUI ? <NewAuditLogsPage /> : <AuditLogsPage />;
    case "settings":
      return useNewUI ? <NewSettingsPage /> : <SettingsPage />;
    case "permissions":
      return useNewUI ? <NewPermissionsPage /> : <PermissionsPage />;
    case "conditions":
      return useNewUI ? <NewConditionsPage /> : <ConditionsPage />;
    case "resource-assignments":
      return useNewUI ? <NewResourceAssignmentsPage /> : <ResourceAssignmentsPage />;
    case "role-hierarchy":
      return useNewUI ? <NewRoleHierarchyTree /> : <RoleHierarchyTree />;
    case "access-requests":
      return useNewUI ? <NewAccessRequestsPage /> : <AccessRequestsPage />;
    case "resource-tree":
      return useNewUI ? <NewResourceTreePage /> : <ResourceTreePage />;
    default:
      return <CheckAccessPage />;
  }
  };

  return (
    <>
      {renderSection()}
      <UIToggle />
    </>
  );
};

export default RBACSystemRouter;
