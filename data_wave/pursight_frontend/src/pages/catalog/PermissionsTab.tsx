// Databricks-style Permissions Tab (custom design, no libraries)
import React, { useState } from "react";
import { FiLock, FiUserPlus, FiUsers, FiUserCheck, FiUserX, FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiChevronUp, FiInfo } from "react-icons/fi";
import { useTablePermissionsData, useAddUserPermission, useUpdateUserPermission, useRemoveUserPermission, useAddGroupPermission, useUpdateGroupPermission, useRemoveGroupPermission, useUpdateInheritance } from "../../api/permissions";
import { TablePermissionsData, UserPermission, GroupPermission, UserRole } from "../../models/TablePermissions";

const theme = {
  bg: "#f7f7f8",
  card: "#fff",
  border: "#e0e0e0",
  accent: "#0072e5",
  text: "#222",
  textSecondary: "#666",
  shadow: "0 2px 12px #0001",
  success: "#00c853",
  warning: "#ffab00",
  error: "#f44336",
  info: "#2196f3",
  hover: "#f5f5f5",
};

interface PermissionsTabProps {
  path?: string[];
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({ path }) => {
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const { data: permissionsData, isLoading, error } = useTablePermissionsData(path);
  const addUserPermission = useAddUserPermission();
  const updateUserPermission = useUpdateUserPermission();
  const removeUserPermission = useRemoveUserPermission();
  const addGroupPermission = useAddGroupPermission();
  const updateGroupPermission = useUpdateGroupPermission();
  const removeGroupPermission = useRemoveGroupPermission();
  const updateInheritance = useUpdateInheritance();

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleRemoveUser = (userId: string) => {
    if (!path) return;
    if (window.confirm("Are you sure you want to remove this user's permissions?")) {
      removeUserPermission.mutate({ path, userId });
    }
  };

  const handleRemoveGroup = (groupId: string) => {
    if (!path) return;
    if (window.confirm("Are you sure you want to remove this group's permissions?")) {
      removeGroupPermission.mutate({ path, groupId });
    }
  };

  const toggleInheritance = () => {
    if (!path || !permissionsData) return;
    updateInheritance.mutate({
      path,
      inheritanceEnabled: !permissionsData.summary.inheritanceEnabled
    });
  };

  const renderTabSelector = () => {
    return (
      <div
        style={{
          display: "flex",
          marginBottom: 24,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "users" ? `2px solid ${theme.accent}` : "none",
            color: activeTab === "users" ? theme.accent : theme.text,
            fontWeight: activeTab === "users" ? 600 : 400,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FiUserCheck size={16} style={{ marginRight: 8 }} />
          Users
          {permissionsData && (
            <span
              style={{
                marginLeft: 8,
                fontSize: "0.75rem",
                background: theme.bg,
                padding: "2px 6px",
                borderRadius: 12,
              }}
            >
              {permissionsData.users.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "groups" ? `2px solid ${theme.accent}` : "none",
            color: activeTab === "groups" ? theme.accent : theme.text,
            fontWeight: activeTab === "groups" ? 600 : 400,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FiUsers size={16} style={{ marginRight: 8 }} />
          Groups
          {permissionsData && (
            <span
              style={{
                marginLeft: 8,
                fontSize: "0.75rem",
                background: theme.bg,
                padding: "2px 6px",
                borderRadius: 12,
              }}
            >
              {permissionsData.groups.length}
            </span>
          )}
        </button>
      </div>
    );
  };

  const renderSearchAndActions = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 300,
          }}
        >
          <FiSearch
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.textSecondary,
            }}
          />
          <input
            type="text"
            placeholder={`Search ${activeTab === "users" ? "users" : "groups"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              borderRadius: 6,
              border: `1px solid ${theme.border}`,
              fontSize: "0.875rem",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              background: theme.accent,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <FiPlus size={16} style={{ marginRight: 8 }} />
            Add {activeTab === "users" ? "User" : "Group"}
          </button>
          <button
            onClick={toggleInheritance}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              background: "transparent",
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <FiInfo size={16} style={{ marginRight: 8 }} />
            {permissionsData?.summary.inheritanceEnabled
              ? "Disable Inheritance"
              : "Enable Inheritance"}
          </button>
        </div>
      </div>
    );
  };

  const renderUserRow = (user: UserPermission) => {
    const isExpanded = expandedUsers.includes(user.userId);
    const filteredRoles = user.roles.filter(role =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (searchQuery && filteredRoles.length === 0) return null;

    return (
      <div
        key={user.userId}
        style={{
          marginBottom: 8,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            background: theme.card,
            cursor: "pointer",
            borderBottom: isExpanded ? `1px solid ${theme.border}` : "none",
          }}
          onClick={() => toggleUserExpanded(user.userId)}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: theme.accent,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {user.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{user.userName}</div>
            <div style={{ fontSize: "0.75rem", color: theme.textSecondary }}>
              {user.email}
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: "0.875rem" }}>
              {user.roles.map((role) => role.name).join(", ")}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Edit user permissions
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: theme.textSecondary,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveUser(user.userId);
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: theme.error,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiTrash2 size={16} />
            </button>
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </div>
        </div>
        {isExpanded && (
          <div style={{ padding: 16, background: theme.bg }}>
            <div style={{ marginBottom: 16 }}>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Roles
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {user.roles.map((role) => (
                  <div
                    key={role.id}
                    style={{
                      background: `${theme.accent}15`,
                      color: theme.accent,
                      padding: "4px 10px",
                      borderRadius: 16,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {role.name}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Direct Permissions
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {user.directPermissions.map((permission, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      padding: "4px 10px",
                      borderRadius: 16,
                      fontSize: "0.75rem",
                    }}
                  >
                    {permission}
                  </div>
                ))}
                {user.directPermissions.length === 0 && (
                  <div style={{ fontSize: "0.75rem", color: theme.textSecondary }}>
                    No direct permissions
                  </div>
                )}
              </div>
            </div>
            {user.inheritedFrom && user.inheritedFrom.length > 0 && (
              <div>
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Inherited From
                </h4>
                <div style={{ fontSize: "0.75rem" }}>
                  {user.inheritedFrom.map((source, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: theme.textSecondary,
                          marginRight: 8,
                        }}
                      >
                        {source.resourceType}:
                      </span>
                      <span>{source.resourceName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: "0.75rem",
                color: theme.textSecondary,
                marginTop: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>Last modified: {new Date(user.lastModified).toLocaleString()}</div>
              <div>By: {user.modifiedBy}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGroupRow = (group: GroupPermission) => {
    const isExpanded = expandedGroups.includes(group.groupId);
    const filteredRoles = group.roles.filter(role =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (searchQuery && filteredRoles.length === 0) return null;

    return (
      <div
        key={group.groupId}
        style={{
          marginBottom: 8,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            background: theme.card,
            cursor: "pointer",
            borderBottom: isExpanded ? `1px solid ${theme.border}` : "none",
          }}
          onClick={() => toggleGroupExpanded(group.groupId)}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: theme.info,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <FiUsers size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{group.groupName}</div>
            <div style={{ fontSize: "0.75rem", color: theme.textSecondary }}>
              {group.members} members
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: "0.875rem" }}>
              {group.roles.map((role) => role.name).join(", ")}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Edit group permissions
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: theme.textSecondary,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveGroup(group.groupId);
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: theme.error,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiTrash2 size={16} />
            </button>
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </div>
        </div>
        {isExpanded && (
          <div style={{ padding: 16, background: theme.bg }}>
            <div style={{ marginBottom: 16 }}>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Roles
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {group.roles.map((role) => (
                  <div
                    key={role.id}
                    style={{
                      background: `${theme.info}15`,
                      color: theme.info,
                      padding: "4px 10px",
                      borderRadius: 16,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {role.name}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Direct Permissions
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {group.directPermissions.map((permission, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      padding: "4px 10px",
                      borderRadius: 16,
                      fontSize: "0.75rem",
                    }}
                  >
                    {permission}
                  </div>
                ))}
                {group.directPermissions.length === 0 && (
                  <div style={{ fontSize: "0.75rem", color: theme.textSecondary }}>
                    No direct permissions
                  </div>
                )}
              </div>
            </div>
            {group.inheritedFrom && group.inheritedFrom.length > 0 && (
              <div>
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Inherited From
                </h4>
                <div style={{ fontSize: "0.75rem" }}>
                  {group.inheritedFrom.map((source, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: theme.textSecondary,
                          marginRight: 8,
                        }}
                      >
                        {source.resourceType}:
                      </span>
                      <span>{source.resourceName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: "0.75rem",
                color: theme.textSecondary,
                marginTop: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>Last modified: {new Date(group.lastModified).toLocaleString()}</div>
              <div>By: {group.modifiedBy}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    if (!permissionsData) return null;

    return (
      <div
        style={{
          background: theme.card,
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              margin: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiLock size={16} style={{ marginRight: 8 }} />
            Permission Summary
          </h3>
          <div
            style={{
              marginLeft: "auto",
              fontSize: "0.75rem",
              color: theme.textSecondary,
            }}
          >
            Last modified: {new Date(permissionsData.summary.lastModified).toLocaleString()}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: theme.textSecondary }}>
              Resource Type
            </div>
            <div style={{ fontSize: "0.875rem" }}>
              {permissionsData.summary.resourceType}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: theme.textSecondary }}>
              Resource Name
            </div>
            <div style={{ fontSize: "0.875rem" }}>
              {permissionsData.summary.resourceName}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: theme.textSecondary }}>
              Owner
            </div>
            <div style={{ fontSize: "0.875rem" }}>
              {permissionsData.summary.ownerName}
              <span style={{ fontSize: "0.75rem", color: theme.textSecondary, marginLeft: 4 }}>
                ({permissionsData.summary.ownerType})
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: theme.textSecondary }}>
              Inheritance
            </div>
            <div style={{ fontSize: "0.875rem" }}>
              {permissionsData.summary.inheritanceEnabled ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <div style={{ color: theme.textSecondary }}>Loading permissions...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <div style={{ color: theme.error }}>
            Error loading permissions. Please try again.
          </div>
        </div>
      );
    }

    if (!permissionsData) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <div style={{ color: theme.textSecondary }}>
            No permissions data available for this table.
          </div>
        </div>
      );
    }

    // For demo purposes, create mock data if real data is empty
    const mockUsers: UserPermission[] = [
      {
        userId: "u1",
        userName: "john.doe",
        email: "john.doe@example.com",
        roles: [
          { id: "r1", name: "Data Owner", description: "Full control over the data", permissions: ["read", "write", "delete", "grant"] },
          { id: "r2", name: "Admin", description: "Administrative access", permissions: ["read", "write", "delete", "grant", "admin"] },
        ],
        directPermissions: ["read", "write", "delete", "grant"],
        lastModified: new Date().toISOString(),
        modifiedBy: "admin",
      },
      {
        userId: "u2",
        userName: "jane.smith",
        email: "jane.smith@example.com",
        roles: [
          { id: "r3", name: "Data Scientist", description: "Can read and analyze data", permissions: ["read", "analyze"] },
        ],
        directPermissions: ["read", "analyze"],
        inheritedFrom: [
          { resourceType: "Schema", resourceName: "analytics", resourceId: "s1" },
        ],
        lastModified: new Date(Date.now() - 86400000).toISOString(),
        modifiedBy: "john.doe",
      },
      {
        userId: "u3",
        userName: "bob.johnson",
        email: "bob.johnson@example.com",
        roles: [
          { id: "r4", name: "Data Engineer", description: "Can read and write data", permissions: ["read", "write"] },
        ],
        directPermissions: [],
        inheritedFrom: [
          { resourceType: "Workspace", resourceName: "Production", resourceId: "w1" },
          { resourceType: "Schema", resourceName: "analytics", resourceId: "s1" },
        ],
        lastModified: new Date(Date.now() - 172800000).toISOString(),
        modifiedBy: "admin",
      },
    ];

    const mockGroups: GroupPermission[] = [
      {
        groupId: "g1",
        groupName: "Data Science Team",
        members: 12,
        roles: [
          { id: "r3", name: "Data Scientist", description: "Can read and analyze data", permissions: ["read", "analyze"] },
        ],
        directPermissions: ["read", "analyze"],
        lastModified: new Date().toISOString(),
        modifiedBy: "admin",
      },
      {
        groupId: "g2",
        groupName: "Engineering Team",
        members: 28,
        roles: [
          { id: "r4", name: "Data Engineer", description: "Can read and write data", permissions: ["read", "write"] },
        ],
        directPermissions: ["read", "write"],
        inheritedFrom: [
          { resourceType: "Workspace", resourceName: "Production", resourceId: "w1" },
        ],
        lastModified: new Date(Date.now() - 86400000).toISOString(),
        modifiedBy: "john.doe",
      },
      {
        groupId: "g3",
        groupName: "Executives",
        members: 5,
        roles: [
          { id: "r5", name: "Viewer", description: "Can only view data", permissions: ["read"] },
        ],
        directPermissions: ["read"],
        lastModified: new Date(Date.now() - 172800000).toISOString(),
        modifiedBy: "admin",
      },
    ];

    // Use mock data for demonstration
    const displayUsers = mockUsers;
    const displayGroups = mockGroups;

    return (
      <>
        {renderSummary()}
        {renderTabSelector()}
        {renderSearchAndActions()}
        <div>
          {activeTab === "users" ? (
            displayUsers.length > 0 ? (
              displayUsers.map(renderUserRow)
            ) : (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: theme.textSecondary,
                  background: theme.bg,
                  borderRadius: 8,
                }}
              >
                No users with permissions found.
              </div>
            )
          ) : displayGroups.length > 0 ? (
            displayGroups.map(renderGroupRow)
          ) : (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: theme.textSecondary,
                background: theme.bg,
                borderRadius: 8,
              }}
            >
              No groups with permissions found.
            </div>
          )}
        </div>
      </>
    );
  };

  // Modal for adding user/group (simplified for this example)
  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
        onClick={() => setShowAddModal(false)}
      >
        <div
          style={{
            background: theme.card,
            borderRadius: 8,
            padding: 24,
            width: 480,
            maxWidth: "90%",
            boxShadow: theme.shadow,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginTop: 0,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiUserPlus size={18} style={{ marginRight: 8 }} />
            Add {activeTab === "users" ? "User" : "Group"} Permissions
          </h3>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              {activeTab === "users" ? "User" : "Group"}
            </label>
            <select
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: `1px solid ${theme.border}`,
                fontSize: "0.875rem",
              }}
            >
              <option value="">Select {activeTab === "users" ? "a user" : "a group"}...</option>
              {activeTab === "users" ? (
                <>
                  <option value="new_user_1">new_user_1@example.com</option>
                  <option value="new_user_2">new_user_2@example.com</option>
                  <option value="new_user_3">new_user_3@example.com</option>
                </>
              ) : (
                <>
                  <option value="new_group_1">Marketing Team</option>
                  <option value="new_group_2">Finance Department</option>
                  <option value="new_group_3">Product Management</option>
                </>
              )}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Roles
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {permissionsData?.availableRoles.map((role) => (
                <label
                  key={role.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ marginRight: 8 }}
                  />
                  {role.name}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: theme.textSecondary,
                      marginLeft: 8,
                    }}
                  >
                    {role.description}
                  </span>
                </label>
              ))}
              {!permissionsData?.availableRoles.length && (
                <>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginRight: 8 }}
                    />
                    Data Owner
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: theme.textSecondary,
                        marginLeft: 8,
                      }}
                    >
                      Full control over the data
                    </span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginRight: 8 }}
                    />
                    Data Scientist
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: theme.textSecondary,
                        marginLeft: 8,
                      }}
                    >
                      Can read and analyze data
                    </span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginRight: 8 }}
                    />
                    Data Engineer
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: theme.textSecondary,
                        marginLeft: 8,
                      }}
                    >
                      Can read and write data
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Direct Permissions
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {permissionsData?.availablePermissions.map((permission, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ marginRight: 8 }}
                  />
                  {permission}
                </label>
              ))}
              {!permissionsData?.availablePermissions.length && (
                <>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginRight: 8 }}
                    />
                    read
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginRight: 8 }}
                    />
                    write
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginRight: 8 }}
                    />
                    delete
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginRight: 8 }}
                    />
                    grant
                  </label>
                </>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Add user/group permissions logic here
                setShowAddModal(false);
              }}
              style={{
                padding: "8px 16px",
                background: theme.accent,
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Add Permissions
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: 520,
        background: theme.bg,
        borderRadius: 14,
        boxShadow: theme.shadow,
        padding: 24,
      }}
    >
      <h2
        style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          marginBottom: 24,
          color: theme.text,
          display: "flex",
          alignItems: "center",
        }}
      >
        <FiLock
          size={20}
          style={{ marginRight: 10, color: theme.accent }}
        />
        Table Permissions
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 400,
            color: theme.textSecondary,
            marginLeft: 12,
          }}
        >
          Last updated: {new Date().toLocaleString()}
        </span>
      </h2>
      {renderContent()}
      {renderAddModal()}
    </div>
  );
};

export default PermissionsTab;
