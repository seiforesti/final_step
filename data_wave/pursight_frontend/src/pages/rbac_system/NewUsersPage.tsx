import React, { useState } from "react";
import { Box, Typography, Chip, Tooltip, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import BlockIcon from "@mui/icons-material/Block";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
 
useUsers,
  useRoles,
  useDeactivateUser,
  useReactivateUser,
  useBulkAssignRoles,
  useBulkRemoveRolesFromUsers,
  useRoleEffectivePermissions,
  useTestAbac,
  User,
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
// Removed unused JsonViewer import
import StatusCard from "./components/StatusCard";

// User Effective Permissions Component (unified, like UsersPage.tsx)
import { useUserEffectivePermissions } from "../../api/rbac";

function renderCondition(cond: any): string {
  if (!cond) return "";
  if (typeof cond === "string") {
    try {
      cond = JSON.parse(cond);
    } catch {
      return cond;
    }
  }
  if (cond.user_id === ":current_user_id") return "Only for current user";
  if (cond.department === ":user_department") return "User's department only";
  if (cond.region === ":user_region") return "User's region only";
  if (
    typeof cond.department === "object" &&
    cond.department.$op === "user_attr"
  ) {
    return `User's ${cond.department.value}`;
  }
  if (cond.role) return `Role required: ${cond.role}`;
  if (cond.time && cond.time.$op === "between") {
    return `Allowed between ${cond.time.start} and ${cond.time.end}`;
  }
  if (cond.ip && cond.ip.$op === "in") {
    return `Allowed from IPs: ${cond.ip.values?.join(", ")}`;
  }
  if (cond.allowed_values && Array.isArray(cond.allowed_values)) {
    return `Allowed values: ${cond.allowed_values.join(", ")}`;
  }
  if (cond.project && cond.project === ":user_project") {
    return "User's project only";
  }
  if (cond.org_unit && cond.org_unit === ":user_org_unit") {
    return "User's org unit only";
  }
  if (cond.custom && typeof cond.custom === "string") {
    return `Custom: ${cond.custom}`;
  }
  // Add more ABAC/condition patterns as needed
  return JSON.stringify(cond);
}

// Advanced User Effective Permissions Table (improved, robust, and visually clear)
const UserEffectivePermissionsAdvanced: React.FC<{ userId: number }> = ({
  userId,
}) => {
  const { data: permissions = [], isLoading } =
    useUserEffectivePermissions(userId);

  // Define columns for DataTable (id, label, format)
  const columns = [
    {
      id: "action",
      label: "Action",
      minWidth: 120,
      format: (value: string, row: any) => (
        <Chip
          label={value}
          color={row.is_effective ? "primary" : "default"}
          size="small"
        />
      ),
    },
    {
      id: "resource",
      label: "Resource",
      minWidth: 120,
      format: (value: string, row: any) => (
        <Chip
          label={value}
          color={row.is_effective ? "secondary" : "default"}
          size="small"
        />
      ),
    },
    {
      id: "conditions",
      label: "Condition",
      minWidth: 180,
      format: (value: any) =>
        value ? (
          <Tooltip
            title={typeof value === "string" ? value : JSON.stringify(value)}
          >
            <span>{renderCondition(value)}</span>
          </Tooltip>
        ) : (
          <span>-</span>
        ),
    },
    {
      id: "is_effective",
      label: "Status",
      minWidth: 90,
      format: (value: boolean) =>
        value ? (
          <Chip label="Active" color="success" size="small" />
        ) : (
          <Chip label="Inactive" color="error" size="small" />
        ),
    },
    {
      id: "note",
      label: "Reason",
      minWidth: 180,
      format: (value: string, row: any) =>
        !row.is_effective && value ? (
          <Tooltip title={value}>
            <Typography color="error" fontStyle="italic" variant="body2">
              {value}
            </Typography>
          </Tooltip>
        ) : (
          <span>-</span>
        ),
    },
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Effective Permissions
      </Typography>
      {isLoading ? (
        <StatusCard type="loading" title="Loading permissions..." />
      ) : permissions.length === 0 ? (
        <StatusCard
          type="info"
          title="No effective permissions"
          message="This user doesn't have any effective permissions."
        />
      ) : (
        <DataTable
          columns={columns}
          data={permissions}
          keyExtractor={(row) => row.id ?? ""}
          pagination={false}
          size="small"
          emptyMessage="No effective permissions."
          stickyHeader
        />
      )}
    </Box>
  );
};

// Test ABAC Modal Component (Enhanced)
const TestAbacModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const testAbac = useTestAbac();
  const [userId, setUserId] = useState<number | "">("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [conditions, setConditions] = useState("{}");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    allowed: boolean;
    details?: any;
  }>(null);

  const validateJson = (value: string): boolean => {
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch {
      setJsonError("Invalid JSON");
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!userId || !action || !resource || !validateJson(conditions)) return;
    try {
      const res = await testAbac.mutateAsync({
        user_id: Number(userId),
        action,
        resource,
        conditions: JSON.parse(conditions),
      });
      setResult(res?.data || res);
    } catch (e) {
      setResult(null);
      setJsonError("Test failed. See console for details.");
    }
  };

  return (
    <FormDialog
      open={open}
      title="Test ABAC Permissions"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Test"
      loading={testAbac.isPending}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2">
          Test whether a user is allowed to perform an action on a resource
          under specific ABAC conditions.
          <Tooltip title="See OpenAPI documentation for ABAC test endpoint schema and examples.">
            <InfoOutlinedIcon
              fontSize="small"
              sx={{ ml: 1, verticalAlign: "middle" }}
            />
          </Tooltip>
        </Typography>
        <TextField
          label="User ID"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value) || "")}
          type="number"
          fullWidth
          required
        />
        <TextField
          label="Action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Resource"
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Conditions (JSON)"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          fullWidth
          multiline
          rows={4}
          error={!!jsonError}
          helperText={jsonError || 'Example: {"department": "HR"}'}
        />
        {result && (
          <StatusCard
            type={result.allowed ? "success" : "error"}
            title={result.allowed ? "Access Allowed" : "Access Denied"}
            message={
              result.details ? JSON.stringify(result.details, null, 2) : ""
            }
          />
        )}
      </Box>
    </FormDialog>
  );
};

const NewUsersPage: React.FC = () => {
  // Data fetching hooks
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();
  const bulkAssignRoles = useBulkAssignRoles();
  const bulkRemoveRoles = useBulkRemoveRolesFromUsers();

  // State for modals and panels
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [testAbacModalOpen, setTestAbacModalOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<
    "deactivate" | "reactivate" | "bulkRemove"
  >("deactivate");

  // State for selected items
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkRoleId, setBulkRoleId] = useState<number | undefined>(undefined);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  // Handle user deactivation
  const handleDeactivateUser = async () => {
    if (!selectedUser) return;

    try {
      await deactivateUser.mutateAsync(selectedUser.id);
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to deactivate user:", error);
    }
  };

  // Handle user reactivation
  const handleReactivateUser = async () => {
    if (!selectedUser) return;

    try {
      await reactivateUser.mutateAsync(selectedUser.id);
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to reactivate user:", error);
    }
  };

  // Handle bulk role assignment
  const handleBulkAssign = async () => {
    if (!bulkRoleId || selectedRowKeys.length === 0) return;

    try {
      await bulkAssignRoles.mutateAsync({
        user_ids: selectedRowKeys as number[],
        role_id: bulkRoleId,
      });
      setBulkModalOpen(false);
      setSelectedRowKeys([]);
      setBulkRoleId(undefined);
    } catch (error) {
      console.error("Failed to assign roles:", error);
    }
  };

  // Handle bulk role removal
  const handleBulkRemove = async () => {
    if (!bulkRoleId || selectedRowKeys.length === 0) return;
    try {
      await bulkRemoveRoles.mutateAsync({
        user_ids: selectedRowKeys as number[],
        role_id: bulkRoleId,
      });
      setConfirmDialogOpen(false);
      setSelectedRowKeys([]);
      setBulkRoleId(undefined);
    } catch (error) {
      console.error("Failed to remove roles:", error);
    }
  };

  // Open user details panel
  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setDetailPanelOpen(true);
  };

  // Filter users based on search query and active filters
  const filteredUsers = users.filter((user) => {
    // Apply search query filter
    if (
      searchQuery &&
      !user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Apply active status filter if present
    const statusFilter = activeFilters.find((f) => f.id === "status");
    if (statusFilter && statusFilter.value !== undefined) {
      if (statusFilter.value === "active" && !user.isActive) return false;
      if (statusFilter.value === "inactive" && user.isActive) return false;
    }

    return true;
  });

  // Define table columns
  const columns = [
    {
      id: "email",
      label: "Email",
      minWidth: 200,
      format: (value: string) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ),
      sortable: true,
    },
    {
      id: "roles",
      label: "Roles",
      minWidth: 120,
      format: (value: string[], row: User) => (
        <Chip
          label={`${value?.length || 0} roles`}
          size="small"
          color="primary"
          variant="outlined"
          icon={<GroupIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewUserDetails(row);
            setActiveTabIndex(0); // Set to roles tab
          }}
        />
      ),
    },
    {
      id: "isActive",
      label: "Status",
      minWidth: 100,
      format: (value: boolean) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          size="small"
          color={value ? "success" : "error"}
          icon={value ? <CheckCircleIcon /> : <BlockIcon />}
        />
      ),
      sortable: true,
    },
  ];

  // Define row actions
  const actions = [
    {
      label: "View Details",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row: User) => handleViewUserDetails(row),
    },
    {
      label: "Deactivate/Reactivate",
      icon: <BlockIcon fontSize="small" />,
      onClick: (row: User) => {
        setSelectedUser(row);
        setConfirmDialogAction(row.isActive ? "deactivate" : "reactivate");
        setConfirmDialogOpen(true);
      },
    },
    {
      label: "View Audit Logs",
      icon: <HistoryIcon fontSize="small" />,
      onClick: (row: User) => {
        handleViewUserDetails(row);
        setActiveTabIndex(2); // Set to audit tab
      },
      divider: true,
    },
  ];

  // Define command bar actions
  const primaryActions = [
    {
      key: "bulk-assign",
      label: "Bulk Assign Role",
      icon: <GroupIcon />,
      onClick: () => setBulkModalOpen(true),
      disabled: selectedRowKeys.length === 0,
      primary: true,
    },
  ];

  const secondaryActions = [
    {
      key: "bulk-remove",
      label: "Bulk Remove Role",
      icon: <DeleteIcon />,
      onClick: () => {
        setConfirmDialogAction("bulkRemove");
        setConfirmDialogOpen(true);
      },
      disabled: selectedRowKeys.length === 0,
    },
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
      id: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  // User Details Panel Content
  const renderUserDetailsContent = () => {
    if (!selectedUser) return null;

    // Define tabs for the detail panel
    const tabs = [
      {
        label: "Roles & Permissions",
        content: (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Assigned Roles
            </Typography>
            {selectedUser.roles && selectedUser.roles.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {selectedUser.roles.map((role, idx) => (
                  <Chip
                    key={idx}
                    label={role}
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<GroupIcon />}
                  />
                ))}
              </Box>
            ) : (
              <StatusCard
                type="info"
                title="No roles assigned"
                message="This user doesn't have any roles assigned."
              />
            )}
            <Box sx={{ mt: 3 }}>
              <UserEffectivePermissionsAdvanced userId={selectedUser.id} />
            </Box>
          </Box>
        ),
      },
      {
        label: "Details",
        content: (
          <Box sx={{ p: 2 }}>
            <PropertyList
              properties={[
                { label: "Email", value: selectedUser.email },
                {
                  label: "Status",
                  value: selectedUser.isActive ? "Active" : "Inactive",
                },
                { label: "ID", value: selectedUser.id.toString() },
                {
                  label: "Roles Count",
                  value: selectedUser.roles?.length.toString() || "0",
                },
              ]}
            />
          </Box>
        ),
      },
      {
        label: "Audit Logs",
        content: (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Audit History
            </Typography>
            <StatusCard
              type="info"
              title="Audit logs"
              message="This section would show the audit history for this user."
            />
          </Box>
        ),
      },
    ];

    return (
      <TabsContainer
        tabs={tabs}
        value={activeTabIndex}
        onChange={setActiveTabIndex}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Users"
        subtitle="Manage users and their roles"
        breadcrumbs={[
          { label: "RBAC System", href: "/rbac" },
          { label: "Users", href: "/rbac/users" },
        ]}
      />

      <CommandBar
        primaryActions={primaryActions}
        secondaryActions={secondaryActions}
      />
      <Box sx={{ my: 2 }}>
        <FilterBar
          searchPlaceholder="Search users..."
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
        data={filteredUsers}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        actions={actions}
        onRowClick={handleViewUserDetails}
        pagination
        selectable
        onSelectionChange={(rows: any[]) =>
          setSelectedRowKeys(rows.map((row) => row.id))
        }
        emptyMessage="No users found."
      />

      {/* Bulk Assign Role Modal */}
      <FormDialog
        open={bulkModalOpen}
        title="Bulk Assign Role"
        onClose={() => setBulkModalOpen(false)}
        onSubmit={handleBulkAssign}
        submitLabel="Assign Role"
        loading={bulkAssignRoles.isPending}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Assign a role to {selectedRowKeys.length} selected user(s).
          </Typography>

          <TextField
            select
            label="Select Role"
            value={bulkRoleId || ""}
            onChange={(e) => setBulkRoleId(Number(e.target.value) || undefined)}
            fullWidth
            required
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </TextField>
        </Box>
      </FormDialog>

      {/* Test ABAC Modal */}
      <TestAbacModal
        open={testAbacModalOpen}
        onClose={() => setTestAbacModalOpen(false)}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        title={
          confirmDialogAction === "deactivate"
            ? "Deactivate User"
            : confirmDialogAction === "reactivate"
            ? "Reactivate User"
            : "Remove Role"
        }
        message={
          confirmDialogAction === "deactivate"
            ? `Are you sure you want to deactivate user "${selectedUser?.email}"?`
            : confirmDialogAction === "reactivate"
            ? `Are you sure you want to reactivate user "${selectedUser?.email}"?`
            : `Are you sure you want to remove the selected role from ${selectedRowKeys.length} user(s)?`
        }
        confirmLabel={
          confirmDialogAction === "deactivate"
            ? "Deactivate"
            : confirmDialogAction === "reactivate"
            ? "Reactivate"
            : "Remove"
        }
        onConfirm={
          confirmDialogAction === "deactivate"
            ? handleDeactivateUser
            : confirmDialogAction === "reactivate"
            ? handleReactivateUser
            : handleBulkRemove
        }
        onCancel={() => setConfirmDialogOpen(false)}
        severity={
          confirmDialogAction === "deactivate" ||
          confirmDialogAction === "bulkRemove"
            ? "error"
            : "warning"
        }
        confirmButtonColor={
          confirmDialogAction === "deactivate" ||
          confirmDialogAction === "bulkRemove"
            ? "error"
            : "primary"
        }
        loading={
          deactivateUser.isPending ||
          reactivateUser.isPending ||
          bulkRemoveRoles.isPending
        }
      />

      {/* User Details Panel */}
      <DetailPanel
        open={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        title={selectedUser?.email || "User Details"}
        width={700}
      >
        {selectedUser && renderUserDetailsContent()}
      </DetailPanel>
    </Box>
  );
};

export default NewUsersPage;
