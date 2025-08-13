import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import CheckIcon from "@mui/icons-material/Check";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";

import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAssignUserToGroup,
  useRemoveUserFromGroup,
  useAssignRoleToGroup,
  useRemoveRoleFromGroup,
  useUsers,
  useRoles,
  useEntityAuditLogs,
  usePermissions,
  Group,
  User,
  Role,
  AuditLog,
} from "../../api/rbac";

import PageHeader from "./components/PageHeader";
import CommandBar from "./components/CommandBar";
import DataTable from "./components/DataTable";
import FilterBar from "./components/FilterBar";
import FormDialog from "./components/FormDialog";
import ConfirmationDialog from "./components/ConfirmationDialog";
import DetailPanel from "./components/DetailPanel";
import { TabsContainer } from "./components/TabPanel";
import PropertyList from "./components/PropertyList";
import JsonViewer from "./components/JsonViewer";
import StatusCard from "./components/StatusCard";

// Test ABAC Modal Component (Simplified)
const TestAbacModal: React.FC<{
  open: boolean;
  onClose: () => void;
  initialValues?: any;
}> = ({ open, onClose, initialValues }) => {
  return (
    <FormDialog
      open={open}
      title="Test ABAC Permissions"
      onClose={onClose}
      onSubmit={() => {}}
      submitLabel="Test"
    >
      <StatusCard
        type="info"
        title="ABAC Testing"
        message="This would be a form to test attribute-based access control permissions."
      />
    </FormDialog>
  );
};

// Group Audit Component
const GroupAuditView: React.FC<{ groupId: number }> = ({ groupId }) => {
  const { data: logs = [], isLoading } = useEntityAuditLogs(
    "group",
    groupId.toString()
  );

  if (isLoading) {
    return <StatusCard type="loading" title="Loading audit logs..." />;
  }

  if (logs.length === 0) {
    return (
      <StatusCard
        type="info"
        title="No audit logs"
        message="No audit history found for this group."
      />
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Audit History
      </Typography>
      <Box sx={{ maxHeight: "400px", overflow: "auto" }}>
        {logs.map((log, index) => (
          <Paper
            key={log.id || index}
            sx={{ p: 2, mb: 2, bgcolor: "background.paper" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Timestamp:
                </Typography>
                <Typography variant="body1">{log.timestamp}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Action:
                </Typography>
                <Typography variant="body1">{log.action}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Performed By:
                </Typography>
                <Typography variant="body1">{log.performed_by}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Status:
                </Typography>
                <Typography variant="body1">{log.status}</Typography>
              </Grid>
              {log.note && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Note:
                  </Typography>
                  <Typography variant="body1">{log.note}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

const NewGroupsPage: React.FC = () => {
  // Data fetching hooks
  const { data: groups = [], isLoading, refetch } = useGroups();
  const { data: users = [] } = useUsers();
  const { data: roles = [] } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const assignUser = useAssignUserToGroup();
  const removeUser = useRemoveUserFromGroup();
  const assignRole = useAssignRoleToGroup();
  const removeRole = useRemoveRoleFromGroup();

  // State for modals and panels
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testAbacModalOpen, setTestAbacModalOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [testAbacInitial, setTestAbacInitial] = useState<any>(null);

  // State for selected items
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  // Helper to get up-to-date group by id
  const getGroupById = (groupId: number) =>
    groups.find((g) => g.id === groupId) || { users: [], roles: [] };

  // Reset form when opening add modal
  const handleAddGroup = () => {
    setSelectedGroup(null);
    setFormName("");
    setFormDescription("");
    setAddEditModalOpen(true);
  };

  // Set form values when opening edit modal
  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setFormName(group.name);
    setFormDescription(group.description || "");
    setAddEditModalOpen(true);
  };

  // Handle form submission for add/edit
  const handleSaveGroup = async () => {
    try {
      if (selectedGroup) {
        // Update existing group
        await updateGroup.mutateAsync({
          groupId: selectedGroup.id,
          name: formName,
          description: formDescription,
        });
      } else {
        // Create new group
        await createGroup.mutateAsync({
          name: formName,
          description: formDescription,
        });
      }
      setAddEditModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save group:", error);
    }
  };

  // Handle group deletion
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      await deleteGroup.mutateAsync(selectedGroup.id);
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  // Open group details panel
  const handleViewGroupDetails = (group: Group) => {
    setSelectedGroup(group);
    setDetailPanelOpen(true);
  };

  // Handle user assignment to group
  const handleAssignUsers = async () => {
    if (!selectedGroup || selectedUsers.length === 0) return;

    try {
      await assignUser.mutateAsync({
        groupId: selectedGroup.id,
        userIds: selectedUsers,
      });
      setSelectedUsers([]);
      refetch();
    } catch (error) {
      console.error("Failed to assign users:", error);
    }
  };

  // Handle role assignment to group
  const handleAssignRoles = async () => {
    if (!selectedGroup || selectedRoles.length === 0) return;

    try {
      await assignRole.mutateAsync({
        groupId: selectedGroup.id,
        roleIds: selectedRoles,
      });
      setSelectedRoles([]);
      refetch();
    } catch (error) {
      console.error("Failed to assign roles:", error);
    }
  };

  // Handle user removal from group
  const handleRemoveUser = async (userId: number) => {
    if (!selectedGroup) return;

    try {
      await removeUser.mutateAsync({
        groupId: selectedGroup.id,
        userId,
      });
      refetch();
    } catch (error) {
      console.error("Failed to remove user:", error);
    }
  };

  // Handle role removal from group
  const handleRemoveRole = async (roleId: number) => {
    if (!selectedGroup) return;

    try {
      await removeRole.mutateAsync({
        groupId: selectedGroup.id,
        roleId,
      });
      refetch();
    } catch (error) {
      console.error("Failed to remove role:", error);
    }
  };

  // Filter groups based on search query
  const filteredGroups = groups.filter((group) => {
    if (!searchQuery) return true;

    return (
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description &&
        group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Define table columns
  const columns = [
    {
      id: "name",
      label: "Group Name",
      minWidth: 150,
      format: (value: string, row: Group) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GroupIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      ),
      sortable: true,
    },
    {
      id: "description",
      label: "Description",
      minWidth: 200,
      format: (value: string) => (
        <Typography
          variant="body2"
          color={value ? "textPrimary" : "textSecondary"}
        >
          {value || "No description"}
        </Typography>
      ),
    },
    {
      id: "users",
      label: "Users",
      minWidth: 120,
      format: (value: User[] | undefined, row: Group) => (
        <Chip
          label={`${value?.length || 0} users`}
          size="small"
          color="primary"
          variant="outlined"
          icon={<PersonIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewGroupDetails(row);
            setActiveTabIndex(0); // Set to users tab
          }}
        />
      ),
    },
    {
      id: "roles",
      label: "Roles",
      minWidth: 120,
      format: (value: Role[] | undefined, row: Group) => (
        <Chip
          label={`${value?.length || 0} roles`}
          size="small"
          color="secondary"
          variant="outlined"
          icon={<GroupIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewGroupDetails(row);
            setActiveTabIndex(1); // Set to roles tab
          }}
        />
      ),
    },
  ];

  // Define row actions
  const actions = [
    {
      label: "View Details",
      icon: <GroupIcon fontSize="small" />,
      onClick: (row: Group) => handleViewGroupDetails(row),
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row: Group) => handleEditGroup(row),
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row: Group) => {
        setSelectedGroup(row);
        setDeleteDialogOpen(true);
      },
      divider: true,
    },
    {
      label: "View Audit",
      icon: <HistoryIcon fontSize="small" />,
      onClick: (row: Group) => {
        handleViewGroupDetails(row);
        setActiveTabIndex(2); // Set to audit tab
      },
    },
  ];

  // Define command bar actions
  const primaryActions = [
    {
      key: "add-group",
      label: "Add Group",
      icon: <AddIcon />,
      onClick: handleAddGroup,
      primary: true,
    },
  ];

  const secondaryActions = [
    {
      key: "test-abac",
      label: "Test ABAC",
      icon: <ScienceIcon />,
      onClick: () => setTestAbacModalOpen(true),
    },
    {
      key: "import",
      label: "Import",
      icon: <UploadFileIcon />,
      onClick: () => console.log("Import clicked"),
    },
    {
      key: "export",
      label: "Export",
      icon: <DownloadIcon />,
      onClick: () => console.log("Export clicked"),
    },
  ];

  // Define filter options
  const filterOptions = [
    {
      id: "userCount",
      label: "User Count",
      options: [
        { value: "none", label: "No users" },
        { value: "few", label: "1-5 users" },
        { value: "many", label: "More than 5 users" },
      ],
    },
    {
      id: "roleCount",
      label: "Role Count",
      options: [
        { value: "none", label: "No roles" },
        { value: "few", label: "1-5 roles" },
        { value: "many", label: "More than 5 roles" },
      ],
    },
  ];

  // Group Details Panel Content
  const renderGroupDetailsContent = () => {
    if (!selectedGroup) return null;

    // Get the current group with latest data
    const currentGroup = getGroupById(selectedGroup.id);
    const groupUsers = currentGroup.users || [];
    const groupRoles = currentGroup.roles || [];

    // Available users/roles for assignment (not already assigned)
    const availableUsers = users.filter(
      (u) => !groupUsers.some((gu: any) => gu.id === u.id)
    );
    const availableRoles = roles.filter(
      (r) => !groupRoles.some((gr: any) => gr.id === r.id)
    );

    // Enhanced Azure-style tab UI
    const azureTabStyle = {
      borderRadius: 2,
      background: "linear-gradient(90deg, #f3f6fb 0%, #e6eefa 100%)",
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
      border: "1px solid #e0e7ef",
      minHeight: 60,
      mb: 2,
    };

    // Users Tab
    const usersTab = (
      <Box sx={{ ...azureTabStyle, p: 3 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: 600, color: "#2563eb" }}
        >
          Assigned Users
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {groupUsers.length > 0 ? (
            groupUsers.map((user: any) => (
              <Chip
                key={user.id}
                label={user.email}
                color="primary"
                variant="outlined"
                size="small"
                icon={<PersonIcon />}
                onDelete={() => handleRemoveUser(user.id)}
                deleteIcon={<PersonRemoveIcon />}
                sx={{ fontWeight: 500, bgcolor: "#e3f2fd", color: "#1976d2" }}
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No users assigned to this group
            </Typography>
          )}
        </Box>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: 600, color: "#2563eb" }}
        >
          Add Users
        </Typography>
        {availableUsers.length === 0 ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Chip
              label="No available users to assign"
              color="warning"
              variant="outlined"
              icon={<PersonRemoveIcon />}
            />
          </Box>
        ) : (
          <Box
            sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}
          >
            <TextField
              select
              label="Select Users"
              value={selectedUsers.map(String)}
              onChange={(e) => {
                const target = e.target as unknown as HTMLSelectElement;
                const value = Array.from(target.selectedOptions, (option) =>
                  Number(option.value)
                );
                setSelectedUsers(value);
              }}
              SelectProps={{
                multiple: true,
                native: true,
              }}
              fullWidth
              variant="outlined"
              size="small"
              sx={{ minWidth: 250, bgcolor: "#fff" }}
            >
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={handleAssignUsers}
              disabled={selectedUsers.length === 0}
              sx={{ minWidth: 120, fontWeight: 600, bgcolor: "#2563eb" }}
            >
              Assign
            </Button>
          </Box>
        )}
      </Box>
    );

    // Roles Tab
    const rolesTab = (
      <Box sx={{ ...azureTabStyle, p: 3 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: 600, color: "#7c3aed" }}
        >
          Assigned Roles
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {groupRoles.length > 0 ? (
            groupRoles.map((role: any) => (
              <Chip
                key={role.id}
                label={role.name}
                color="secondary"
                variant="outlined"
                size="small"
                icon={<GroupIcon />}
                onDelete={() => handleRemoveRole(role.id)}
                deleteIcon={<DeleteIcon />}
                sx={{ fontWeight: 500, bgcolor: "#ede7f6", color: "#6d28d9" }}
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No roles assigned to this group
            </Typography>
          )}
        </Box>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: 600, color: "#7c3aed" }}
        >
          Add Roles
        </Typography>
        {availableRoles.length === 0 ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Chip
              label="No available roles to assign"
              color="warning"
              variant="outlined"
              icon={<DeleteIcon />}
            />
          </Box>
        ) : (
          <Box
            sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 1 }}
          >
            <TextField
              select
              label="Select Roles"
              value={selectedRoles.map(String)}
              onChange={(e) => {
                const target = e.target as unknown as HTMLSelectElement;
                const value = Array.from(target.selectedOptions, (option) =>
                  Number(option.value)
                );
                setSelectedRoles(value);
              }}
              SelectProps={{
                multiple: true,
                native: true,
              }}
              fullWidth
              variant="outlined"
              size="small"
              sx={{ minWidth: 250, bgcolor: "#fff" }}
            >
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CheckIcon />}
              onClick={handleAssignRoles}
              disabled={selectedRoles.length === 0}
              sx={{ minWidth: 120, fontWeight: 600, bgcolor: "#7c3aed" }}
            >
              Assign
            </Button>
          </Box>
        )}
      </Box>
    );

    // Audit Tab
    const auditTab = (
      <Box sx={{ ...azureTabStyle, p: 3 }}>
        <GroupAuditView groupId={selectedGroup.id} />
      </Box>
    );

    // Modern Azure-style Tabs
    // TabsContainer expects string labels, so use emoji + text for modern look
    const tabs = [
      { label: "👤 Users", content: usersTab },
      { label: "👥 Roles", content: rolesTab },
      { label: "🕓 Audit Logs", content: auditTab },
    ];

    return (
      <TabsContainer
        tabs={tabs}
        value={activeTabIndex}
        onChange={setActiveTabIndex}
        // Remove tabProps if not supported by TabsContainer
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Groups"
        subtitle="Manage groups, their users and roles"
        breadcrumbs={[
          { label: "RBAC System", href: "/rbac" },
          { label: "Groups", href: "/rbac/groups" },
        ]}
      />

      <CommandBar
        primaryActions={primaryActions}
        secondaryActions={secondaryActions}
      />

      <Box sx={{ my: 2 }}>
        <FilterBar
          searchPlaceholder="Search groups..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          onFilterRemove={(filterId) => {
            setActiveFilters(activeFilters.filter((f) => f.id !== filterId));
          }}
          onFiltersClear={() => setActiveFilters([])}
        />
      </Box>

      <DataTable
        columns={columns}
        data={filteredGroups}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        actions={actions}
        onRowClick={handleViewGroupDetails}
        pagination
        emptyMessage="No groups found. Create a new group to get started."
      />

      {/* Add/Edit Group Modal */}
      <FormDialog
        open={addEditModalOpen}
        title={selectedGroup ? "Edit Group" : "Add Group"}
        onClose={() => setAddEditModalOpen(false)}
        onSubmit={handleSaveGroup}
        submitLabel={selectedGroup ? "Save Changes" : "Create Group"}
        loading={createGroup.isPending || updateGroup.isPending}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Group Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            fullWidth
            required
            error={!formName}
            helperText={!formName ? "Group name is required" : ""}
          />
          <TextField
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Describe the purpose of this group"
          />
        </Box>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Group"
        message={`Are you sure you want to delete the group "${selectedGroup?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteGroup}
        onCancel={() => setDeleteDialogOpen(false)}
        severity="error"
        confirmButtonColor="error"
        loading={deleteGroup.isPending}
      />

      {/* Test ABAC Modal */}
      <TestAbacModal
        open={testAbacModalOpen}
        onClose={() => {
          setTestAbacModalOpen(false);
          setTestAbacInitial(null);
        }}
        initialValues={testAbacInitial}
      />

      {/* Group Details Panel */}
      <DetailPanel
        open={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        title={selectedGroup?.name ?? "Group Details"}
        width={600}
      >
        {renderGroupDetailsContent()}
      </DetailPanel>
    </Box>
  );
};

export default NewGroupsPage;
