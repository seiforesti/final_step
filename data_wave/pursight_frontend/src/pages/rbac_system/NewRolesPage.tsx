// Permission count chip for DataTable (React-compliant)
const RolePermissionCountChip: React.FC<{
  roleId: number;
  onClick: () => void;
}> = ({ roleId, onClick }) => {
  const { data: perms = [], isLoading } = useUserEffectivePermissions(roleId);
  return (
    <Chip
      label={isLoading ? "..." : `${perms.length} permissions`}
      size="small"
      color="primary"
      variant="outlined"
      onClick={onClick}
    />
  );
};
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions,
  useBulkAssignPermissions,
  useBulkRemovePermissions,
  Role,
  Permission,
  useRoleParents,
  useRoleChildren,
  useAddRoleParent,
  useRemoveRoleParent,
  useUserEffectivePermissions,
  useEntityAuditLogs,
  RbacAuditLog as AuditLog,
  useTestAbac,
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
// import JsonViewer from "./components/JsonViewer";
import StatusCard from "./components/StatusCard";

const NewRolesPage: React.FC = () => {
  // Data fetching hooks
  const { data: roles = [], isLoading } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const { data: permissions = [] } = usePermissions();
  const bulkAssignPermissions = useBulkAssignPermissions();
  const bulkRemovePermissions = useBulkRemovePermissions();

  // State for modals and panels
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testAbacModalOpen, setTestAbacModalOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // State for selected items
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // Inheritance, permissions, and audit logs hooks for details panel
  const parentsResult = useRoleParents(selectedRole?.id ?? 0);
  const childrenResult = useRoleChildren(selectedRole?.id ?? 0);
  const auditResult = useEntityAuditLogs(
    "role",
    String(selectedRole?.id ?? "")
  );
  // Use the unified v2 effective permissions hook (even for roles, as per backend)
  const permsResult = useUserEffectivePermissions(selectedRole?.id ?? 0);
  const roleParents: Role[] = parentsResult.data ?? [];
  const isParentsLoading = parentsResult.isLoading;
  const roleChildren: Role[] = childrenResult.data ?? [];
  const isChildrenLoading = childrenResult.isLoading;
  const roleAuditLogs: AuditLog[] = auditResult.data ?? [];
  const isAuditLoading = auditResult.isLoading;
  const effectivePermissions: Permission[] = permsResult.data ?? [];
  const permsLoading = permsResult.isLoading;

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [bulkPermissionId, setBulkPermissionId] = useState<number | undefined>(
    undefined
  );

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [bulkAction, setBulkAction] = useState<"assign" | "remove">("assign");

  // Reset form when opening add modal
  const handleAddRole = () => {
    setSelectedRole(null);
    setFormName("");
    setFormDescription("");
    setAddEditModalOpen(true);
  };

  // Set form values when opening edit modal
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormName(role.name);
    setFormDescription(role.description || "");
    setAddEditModalOpen(true);
  };

  // Handle form submission for add/edit
  const handleSaveRole = async () => {
    try {
      if (selectedRole) {
        // Update existing role
        await updateRole.mutateAsync({
          roleId: selectedRole.id,
          name: formName,
          description: formDescription,
        });
      } else {
        // Create new role
        await createRole.mutateAsync({
          name: formName,
          description: formDescription,
        });
      }
      setAddEditModalOpen(false);
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  // Handle role deletion
  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole.mutateAsync(selectedRole.id);
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  // Open role details panel
  const handleViewRoleDetails = (role: Role) => {
    setSelectedRole(role);
    setDetailPanelOpen(true);
  };

  // Filter roles based on search query
  const filteredRoles = roles.filter((role) => {
    if (!searchQuery) return true;

    return (
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Define table columns
  const columns = [
    {
      id: "name",
      label: "Role Name",
      minWidth: 150,
      format: (value: string, row: Role) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
      id: "permissions",
      label: "Permissions",
      minWidth: 120,
      format: (_: any, row: Role) => (
        <RolePermissionCountChip
          roleId={row.id}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleViewRoleDetails(row);
            setActiveTabIndex(0);
          }}
        />
      ),
    },
    {
      id: "inheritance",
      label: "Inheritance",
      minWidth: 120,
      format: (value: any, row: Role) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AccountTreeIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewRoleDetails(row);
            setActiveTabIndex(1); // Set to inheritance tab
          }}
        >
          View
        </Button>
      ),
    },
    {
      id: "audit",
      label: "Audit",
      minWidth: 100,
      format: (value: any, row: Role) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewRoleDetails(row);
            setActiveTabIndex(2); // Set to audit tab
          }}
        >
          Logs
        </Button>
      ),
    },
  ];

  // Define row actions
  const actions = [
    {
      label: "View Details",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row: Role) => handleViewRoleDetails(row),
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row: Role) => handleEditRole(row),
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row: Role) => {
        setSelectedRole(row);
        setDeleteDialogOpen(true);
      },
      divider: true,
    },
  ];

  // Define command bar actions
  const primaryActions = [
    {
      key: "add-role",
      label: "Add Role",
      icon: <AddIcon />,
      onClick: handleAddRole,
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
    {
      key: "bulk-permission",
      label: "Bulk Assign/Remove Permission",
      icon: <ScienceIcon />,
      onClick: () => setBulkModalOpen(true),
    },
  ];

  // Define filter options
  const filterOptions = [
    {
      id: "permissions",
      label: "Permissions Count",
      options: [
        { value: "none", label: "No permissions" },
        { value: "few", label: "1-5 permissions" },
        { value: "many", label: "More than 5 permissions" },
      ],
    },
  ];

  // Role Details Panel Content (fetches live data)
  const renderRoleDetailsContent = () => {
    if (!selectedRole) return null;
    // Permissions Tab Content
    let permissionsContent: React.ReactNode;
    if (permsLoading) {
      permissionsContent = (
        <StatusCard type="loading" title="Loading permissions..." />
      );
    } else if (effectivePermissions.length > 0) {
      permissionsContent = (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Role Permissions
          </Typography>
          <Box sx={{ mt: 2 }}>
            {effectivePermissions.map((perm, idx) => (
              <Chip
                key={perm.id ?? idx}
                label={`${perm.action} on ${perm.resource}`}
                sx={{ m: 0.5 }}
                color={perm.is_effective ? "primary" : "default"}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      );
    } else {
      permissionsContent = (
        <StatusCard
          type="info"
          title="No permissions assigned"
          message="This role doesn't have any permissions assigned directly or via inheritance."
        />
      );
    }

    // Inheritance Tab Content
    let inheritanceContent: React.ReactNode;
    if (isParentsLoading && isChildrenLoading) {
      inheritanceContent = (
        <StatusCard type="loading" title="Loading inheritance info..." />
      );
    } else {
      inheritanceContent = (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Parent Roles
          </Typography>
          {roleParents.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {roleParents.map((parent: Role) => (
                <Chip
                  key={parent.id}
                  label={parent.name}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No parent roles.
            </Typography>
          )}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Child Roles
          </Typography>
          {roleChildren.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {roleChildren.map((child: Role) => (
                <Chip
                  key={child.id}
                  label={child.name}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No child roles.
            </Typography>
          )}
        </>
      );
    }

    // Audit Logs Tab Content
    let auditLogsContent: React.ReactNode;
    if (isAuditLoading) {
      auditLogsContent = (
        <StatusCard type="loading" title="Loading audit logs..." />
      );
    } else if (roleAuditLogs.length > 0) {
      auditLogsContent = (
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {roleAuditLogs.map((log: AuditLog, idx: number) => (
            <Box
              key={log.id ?? idx}
              sx={{
                mb: 2,
                p: 1,
                border: "1px solid #22304a",
                borderRadius: 2,
                background: "#181f2a",
              }}
            >
              <Typography variant="body2" color="textSecondary">
                {log.timestamp}
              </Typography>
              <Typography variant="body2">
                {log.action} by {log.performed_by}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Status: {log.status}
              </Typography>
              {log.note && (
                <Typography variant="body2" color="textSecondary">
                  Note: {log.note}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      );
    } else {
      auditLogsContent = (
        <Typography variant="body2" color="textSecondary">
          No audit logs found for this role.
        </Typography>
      );
    }

    const tabs = [
      {
        label: "Permissions",
        content: <Box sx={{ p: 2 }}>{permissionsContent}</Box>,
      },
      {
        label: "Inheritance",
        content: <Box sx={{ p: 2 }}>{inheritanceContent}</Box>,
      },
      {
        label: "Audit Logs",
        content: <Box sx={{ p: 2 }}>{auditLogsContent}</Box>,
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

  // Bulk assign/remove permissions
  const handleBulkPermission = async () => {
    if (!bulkPermissionId || selectedRoleIds.length === 0) return;
    try {
      if (bulkAction === "assign") {
        await bulkAssignPermissions.mutateAsync({
          role_ids: selectedRoleIds,
          permission_id: bulkPermissionId,
        });
      } else {
        await bulkRemovePermissions.mutateAsync({
          role_ids: selectedRoleIds,
          permission_id: bulkPermissionId,
        });
      }
      setBulkModalOpen(false);
      setSelectedRoleIds([]);
      setBulkPermissionId(undefined);
    } catch (error) {
      console.error("Bulk permission operation failed:", error);
    }
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
        setResult(res?.data ?? res);
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
            helperText={jsonError ?? 'Example: {"department": "HR"}'}
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

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Roles"
        subtitle="Manage roles and their permissions"
        breadcrumbs={[
          { label: "RBAC System", href: "/rbac" },
          { label: "Roles", href: "/rbac/roles" },
        ]}
      />

      <CommandBar
        primaryActions={primaryActions}
        secondaryActions={[
          ...secondaryActions,
          {
            key: "test-abac",
            label: "Test ABAC",
            icon: <ScienceIcon />,
            onClick: () => setTestAbacModalOpen(true),
          },
        ]}
      />

      <Box sx={{ my: 2 }}>
        <FilterBar
          searchPlaceholder="Search roles..."
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
        data={filteredRoles}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        actions={actions}
        onRowClick={handleViewRoleDetails}
        pagination
        emptyMessage="No roles found. Create a new role to get started."
      />

      {/* Add/Edit Role Modal */}
      <FormDialog
        open={addEditModalOpen}
        title={selectedRole ? "Edit Role" : "Add Role"}
        onClose={() => setAddEditModalOpen(false)}
        onSubmit={handleSaveRole}
        submitLabel={selectedRole ? "Save Changes" : "Create Role"}
        loading={createRole.isPending || updateRole.isPending}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Role Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            fullWidth
            required
            error={!formName}
            helperText={!formName ? "Role name is required" : ""}
          />
          <TextField
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Describe the purpose of this role"
          />
        </Box>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteRole}
        onCancel={() => setDeleteDialogOpen(false)}
        severity="error"
        confirmButtonColor="error"
        loading={deleteRole.isPending}
      />

      {/* Role Details Panel */}
      <DetailPanel
        open={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        title={selectedRole?.name ?? "Role Details"}
        width={600}
      >
        {renderRoleDetailsContent()}
      </DetailPanel>

      {/* Bulk Assign/Remove Permission Modal */}
      <FormDialog
        open={bulkModalOpen}
        title={
          bulkAction === "assign"
            ? "Bulk Assign Permission"
            : "Bulk Remove Permission"
        }
        onClose={() => setBulkModalOpen(false)}
        onSubmit={handleBulkPermission}
        submitLabel={bulkAction === "assign" ? "Assign" : "Remove"}
        loading={
          bulkAssignPermissions.isPending || bulkRemovePermissions.isPending
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Select Permission"
            value={bulkPermissionId ?? ""}
            onChange={(e) =>
              setBulkPermissionId(Number(e.target.value) || undefined)
            }
            fullWidth
            required
            SelectProps={{ native: true }}
          >
            <option value="">Select a permission</option>
            {permissions.map((perm) => (
              <option key={perm.id} value={perm.id}>
                {perm.action} on {perm.resource}
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="Select Roles"
            value={selectedRoleIds.map(String)}
            onChange={(e) => {
              const select = e.target as unknown as HTMLSelectElement;
              setSelectedRoleIds(
                Array.from(
                  select.selectedOptions,
                  (option: HTMLOptionElement) => Number(option.value)
                )
              );
            }}
            fullWidth
            required
            SelectProps={{ multiple: true, native: true }}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </TextField>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={bulkAction === "assign" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setBulkAction("assign")}
            >
              Assign
            </Button>
            <Button
              variant={bulkAction === "remove" ? "contained" : "outlined"}
              color="error"
              onClick={() => setBulkAction("remove")}
            >
              Remove
            </Button>
          </Box>
        </Box>
      </FormDialog>

      {/* ABAC Test Modal */}
      <TestAbacModal
        open={testAbacModalOpen}
        onClose={() => setTestAbacModalOpen(false)}
      />
    </Box>
  );
};

export default NewRolesPage;
