// Helper to get assigned roles for a permission
const getAssignedRolesForPermission = (permission: any, roles: any[]) => {
  // Prefer permission.roles if available (backend may provide this), else cross-reference roles
  if (
    permission &&
    permission.roles &&
    Array.isArray(permission.roles) &&
    permission.roles.length > 0
  ) {
    return roles.filter((role: any) =>
      permission.roles.some((r: any) => r.id === role.id)
    );
  }
  // Fallback: cross-reference roles' permissions
  return roles.filter(
    (role: any) =>
      Array.isArray(role.permissions) &&
      role.permissions.some((p: any) => p.id === permission.id)
  );
};
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  useRoles,
  useAssignPermissionToRole,
  useRemovePermissionFromRole,
  useEntityAuditLogs,
  useConditionTemplates,
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

// Simplified ConditionSelector component
const ConditionSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
  templates?: any[];
}> = ({ value, onChange, templates = [] }) => {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Validate JSON if not empty
    if (newValue.trim()) {
      try {
        JSON.parse(newValue);
        setJsonError(null);
      } catch (err) {
        setJsonError("Invalid JSON format");
      }
    } else {
      setJsonError(null);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === "custom-condition") {
      // Custom condition
      onChange("");
      setJsonError(null);
      return;
    }
    // Prevent any other value from being treated as custom
    if (!templateId) return;
    const template = templates.find((t) => t.id.toString() === templateId);
    if (template) {
      let templateValue =
        template.template ?? template.value ?? template.conditions;
      if (templateValue && typeof templateValue === "object") {
        onChange(JSON.stringify(templateValue, null, 2));
        setJsonError(null);
      } else if (typeof templateValue === "string") {
        onChange(templateValue);
        setJsonError(null);
      }
    }
  };

  // If 'custom-condition' is selected, allow editing. If a template is selected, block editing.
  const isCustom = selectedTemplateId === "custom-condition";

  return (
    <Box>
      {templates && templates.length > 0 && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="template-select-label">Use Template</InputLabel>
          <Select
            labelId="template-select-label"
            label="Use Template"
            value={selectedTemplateId}
            onChange={(e) => handleTemplateSelect(e.target.value as string)}
          >
            <MenuItem value="custom-condition">Custom Condition</MenuItem>
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id.toString()}>
                {template.label ?? template.name ?? template.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        fullWidth
        multiline
        rows={6}
        value={value || ""}
        onChange={handleChange}
        placeholder={
          isCustom
            ? "Enter JSON condition or select a template"
            : "Prebuilt template selected. Field is read-only."
        }
        variant="outlined"
        error={!!jsonError}
        helperText={
          jsonError ||
          (!isCustom
            ? "This field is read-only when a prebuilt template is selected."
            : undefined)
        }
        sx={{ fontFamily: "monospace" }}
        disabled={!isCustom}
      />
    </Box>
  );
};

// Simplified TestAbacModal component
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

const NewPermissionsPage: React.FC = () => {
  // Data fetching hooks
  const { data: permissions = [], isLoading, refetch } = usePermissions();
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    refetch: refetchRoles,
  } = useRoles();
  // Load condition templates with explicit loading and error state, like NewConditionsPage
  const {
    data: conditionTemplates = [],
    isLoading: isLoadingConditionTemplates,
    error: conditionTemplatesError,
    refetch: refetchConditionTemplates,
  } = useConditionTemplates();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();
  const assignPermissionToRole = useAssignPermissionToRole();
  const removePermissionFromRole = useRemovePermissionFromRole();

  // State for modals and panels
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testAbacModalOpen, setTestAbacModalOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [testAbacInitial, setTestAbacInitial] = useState<any>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);

  // State for selected items
  const [selectedPermission, setSelectedPermission] = useState<any | null>(
    null
  );
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Form state
  const [formAction, setFormAction] = useState("");
  const [formResource, setFormResource] = useState("");
  const [formConditions, setFormConditions] = useState("");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  // Reset form when opening add modal
  const handleAddPermission = () => {
    setSelectedPermission(null);
    setFormAction("");
    setFormResource("");
    setFormConditions("");
    setAddEditModalOpen(true);
  };

  // Set form values when opening edit modal
  const handleEditPermission = (permission: any) => {
    setSelectedPermission(permission);
    setFormAction(permission.action);
    setFormResource(permission.resource);
    setFormConditions(permission.conditions || "");
    setAddEditModalOpen(true);
  };

  // Handle form submission for add/edit
  const handleSavePermission = async () => {
    if (!formAction.trim() || !formResource.trim()) {
      return; // Form validation would handle this
    }

    try {
      if (selectedPermission) {
        // Update existing permission
        await updatePermission.mutateAsync({
          permissionId: selectedPermission.id,
          action: formAction.trim(),
          resource: formResource.trim(),
          conditions: formConditions,
        });
      } else {
        // Create new permission
        await createPermission.mutateAsync({
          action: formAction.trim(),
          resource: formResource.trim(),
          conditions: formConditions,
        });
      }
      setAddEditModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save permission:", error);
    }
  };

  // Handle permission deletion
  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    try {
      await deletePermission.mutateAsync(selectedPermission.id);
      setDeleteDialogOpen(false);
      setSelectedPermission(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete permission:", error);
    }
  };

  // Open permission details panel
  const handleViewPermissionDetails = (permission: any) => {
    setSelectedPermission(permission);
    setDetailPanelOpen(true);
  };

  // Handle assigning permission to role
  const handleAssignPermission = async () => {
    if (!selectedPermission || !selectedRoleId) return;
    try {
      await assignPermissionToRole.mutateAsync({
        roleId: selectedRoleId,
        permissionId: selectedPermission.id,
      });
      setAssignModalOpen(false);
      setSelectedRoleId(null);
      refetch();
      refetchRoles();
    } catch (error) {
      console.error("Failed to assign permission:", error);
    }
  };

  // Handle removing permission from role
  const handleUnassignPermission = async () => {
    if (!selectedPermission || !selectedRoleId) return;
    try {
      await removePermissionFromRole.mutateAsync({
        roleId: selectedRoleId,
        permissionId: selectedPermission.id,
      });
      setUnassignModalOpen(false);
      setSelectedRoleId(null);
      refetch();
      refetchRoles();
    } catch (error) {
      console.error("Failed to unassign permission:", error);
    }
  };

  // Filter permissions based on search query
  const filteredPermissions = permissions.filter((permission) => {
    if (!searchQuery) return true;

    return (
      permission.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (permission.conditions &&
        permission.conditions.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Define table columns
  const columns = [
    {
      id: "id",
      label: "ID",
      minWidth: 50,
    },
    {
      id: "action",
      label: "Action",
      minWidth: 150,
      format: (value: string) => (
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      ),
      sortable: true,
    },
    {
      id: "resource",
      label: "Resource",
      minWidth: 150,
      format: (value: string) => (
        <Typography variant="body2">{value}</Typography>
      ),
      sortable: true,
    },
    {
      id: "conditions",
      label: "Conditions",
      minWidth: 200,
      format: (value: string) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 300,
          }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "roles",
      label: "Assigned Roles",
      minWidth: 200,
      format: (value: any, row: any) => {
        if (isLoadingRoles) {
          return (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          );
        }
        const assignedRoles = getAssignedRolesForPermission(row, roles);
        return assignedRoles.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {assignedRoles.map((role: any) => (
              <Chip
                key={role.id}
                label={role.name}
                size="small"
                variant="outlined"
                color="secondary"
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        );
      },
    },
  ];

  // Define row actions
  const actions = [
    {
      label: "View Details",
      icon: <ScienceIcon fontSize="small" />,
      onClick: (row: any) => handleViewPermissionDetails(row),
    },
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row: any) => handleEditPermission(row),
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row: any) => {
        setSelectedPermission(row);
        setDeleteDialogOpen(true);
      },
      divider: true,
    },
    {
      label: "Assign to Role",
      icon: <AddIcon fontSize="small" />,
      onClick: (row: any) => {
        setSelectedPermission(row);
        setSelectedRoleId(null);
        setAssignModalOpen(true);
      },
    },
    {
      label: "Unassign from Role",
      icon: <RemoveCircleIcon fontSize="small" />,
      onClick: (row: any) => {
        setSelectedPermission(row);
        setSelectedRoleId(null);
        setUnassignModalOpen(true);
      },
    },
    {
      label: "Test ABAC",
      icon: <ScienceIcon fontSize="small" />,
      onClick: (row: any) => {
        setTestAbacInitial({
          permissionId: row.id ? String(row.id) : undefined,
          conditions: row.conditions || "",
        });
        setTestAbacModalOpen(true);
      },
    },
    {
      label: "View Audit",
      icon: <HistoryIcon fontSize="small" />,
      onClick: (row: any) => {
        handleViewPermissionDetails(row);
        setActiveTabIndex(1); // Set to audit tab
      },
    },
  ];

  // Define command bar actions
  const primaryActions = [
    {
      key: "add-permission",
      label: "Create Permission",
      icon: <AddIcon />,
      onClick: handleAddPermission,
      primary: true,
    },
  ];

  const secondaryActions = [
    {
      key: "test-abac",
      label: "Test ABAC",
      icon: <ScienceIcon />,
      onClick: () => {
        setTestAbacInitial(null);
        setTestAbacModalOpen(true);
      },
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
      id: "hasConditions",
      label: "Conditions",
      options: [
        { value: "yes", label: "Has conditions" },
        { value: "no", label: "No conditions" },
      ],
    },
    {
      id: "assignedToRoles",
      label: "Role Assignment",
      options: [
        { value: "assigned", label: "Assigned to roles" },
        { value: "unassigned", label: "Not assigned to any role" },
      ],
    },
  ];

  // Permission Details Panel Content
  const renderPermissionDetailsContent = () => {
    if (!selectedPermission) return null;

    const assignedRoles = getAssignedRolesForPermission(
      selectedPermission,
      roles
    );

    // Define tabs for the detail panel
    const tabs = [
      {
        label: "Details",
        content: (
          <Box sx={{ p: 2 }}>
            <PropertyList
              properties={[
                { label: "ID", value: selectedPermission.id },
                { label: "Action", value: selectedPermission.action },
                { label: "Resource", value: selectedPermission.resource },
                {
                  label: "Conditions",
                  value:
                    selectedPermission.conditions &&
                    selectedPermission.conditions !== "None" ? (
                      <JsonViewer data={selectedPermission.conditions} />
                    ) : (
                      "None"
                    ),
                },
              ]}
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Assigned Roles
            </Typography>
            {assignedRoles.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {assignedRoles.map((role: any) => (
                  <Chip
                    key={role.id}
                    label={role.name}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    onDelete={() => {
                      setSelectedPermission(selectedPermission);
                      setSelectedRoleId(role.id);
                      setUnassignModalOpen(true);
                    }}
                    deleteIcon={<RemoveCircleIcon />}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                This permission is not assigned to any roles.
              </Typography>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ScienceIcon />}
                onClick={() => {
                  setTestAbacInitial({
                    permissionId: selectedPermission.id
                      ? String(selectedPermission.id)
                      : undefined,
                    conditions: selectedPermission.conditions || "",
                  });
                  setTestAbacModalOpen(true);
                }}
              >
                Test ABAC
              </Button>
            </Box>
          </Box>
        ),
      },
      {
        label: "Audit Logs",
        content: (
          <Box sx={{ p: 2 }}>
            <PermissionAuditView permissionId={selectedPermission.id} />
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
        title="Permissions Management"
        subtitle="Manage permissions for the RBAC system"
        breadcrumbs={[
          { label: "RBAC System", href: "/rbac" },
          { label: "Permissions", href: "/sensitivity-labels/rbac/permissions" },
        ]}
      />

      <CommandBar
        primaryActions={primaryActions}
        secondaryActions={secondaryActions}
      />

      <Box sx={{ my: 2 }}>
        <FilterBar
          searchPlaceholder="Search permissions..."
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
        data={filteredPermissions}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        actions={actions}
        onRowClick={handleViewPermissionDetails}
        pagination
        emptyMessage="No permissions found. Create a new permission to get started."
      />

      {/* Add/Edit Permission Modal */}
      <FormDialog
        open={addEditModalOpen}
        title={selectedPermission ? "Edit Permission" : "Create Permission"}
        onClose={() => setAddEditModalOpen(false)}
        onSubmit={handleSavePermission}
        submitLabel={selectedPermission ? "Save Changes" : "Create Permission"}
        loading={createPermission.isPending || updatePermission.isPending}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Action"
            value={formAction}
            onChange={(e) => setFormAction(e.target.value)}
            fullWidth
            required
            error={!formAction.trim()}
            helperText={!formAction.trim() ? "Action is required" : ""}
          />
          <TextField
            label="Resource"
            value={formResource}
            onChange={(e) => setFormResource(e.target.value)}
            fullWidth
            required
            error={!formResource.trim()}
            helperText={!formResource.trim() ? "Resource is required" : ""}
          />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Conditions
            </Typography>
            {/* Show loading, error, or selector for condition templates */}
            {isLoadingConditionTemplates ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  Loading condition templates...
                </Typography>
              </Box>
            ) : conditionTemplatesError ? (
              <Box sx={{ color: "error.main", mb: 1 }}>
                <Typography variant="body2">
                  Failed to load condition templates.
                </Typography>
                <Button
                  size="small"
                  onClick={() => refetchConditionTemplates()}
                >
                  Retry
                </Button>
              </Box>
            ) : (
              <ConditionSelector
                value={formConditions}
                onChange={setFormConditions}
                templates={
                  Array.isArray(conditionTemplates) ? conditionTemplates : []
                }
              />
            )}
          </Box>
        </Box>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Permission"
        message={`Are you sure you want to delete the permission "${selectedPermission?.action} ${selectedPermission?.resource}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeletePermission}
        onCancel={() => setDeleteDialogOpen(false)}
        severity="error"
        confirmButtonColor="error"
        loading={deletePermission.isPending}
      />

      {/* Assign Permission to Role Modal */}
      <FormDialog
        open={assignModalOpen}
        title="Assign Permission to Role"
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedRoleId(null);
        }}
        onSubmit={handleAssignPermission}
        submitLabel="Assign"
        // submitDisabled removed, not supported by FormDialog
        loading={assignPermissionToRole.isPending}
      >
        <FormControl fullWidth>
          <InputLabel id="assign-role-select-label">Select Role</InputLabel>
          <Select
            labelId="assign-role-select-label"
            value={selectedRoleId || ""}
            onChange={(e) => setSelectedRoleId(e.target.value as number)}
            label="Select Role"
          >
            <MenuItem value="">-- Select Role --</MenuItem>
            {roles
              .filter(
                (role: any) =>
                  !(role.permissions || []).some(
                    (p: any) => p.id === selectedPermission?.id
                  )
              )
              .map((role: any) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
          </Select>
          <FormHelperText>
            Select a role to assign this permission to
          </FormHelperText>
        </FormControl>
      </FormDialog>

      {/* Unassign Permission from Role Modal */}
      <FormDialog
        open={unassignModalOpen}
        title="Unassign Permission from Role"
        onClose={() => {
          setUnassignModalOpen(false);
          setSelectedRoleId(null);
        }}
        onSubmit={handleUnassignPermission}
        submitLabel="Unassign"
        // submitDisabled removed, not supported by FormDialog
        loading={removePermissionFromRole.isPending}
      >
        <FormControl fullWidth disabled={isLoadingRoles}>
          <InputLabel id="unassign-role-select-label">Select Role</InputLabel>
          <Select
            labelId="unassign-role-select-label"
            value={selectedRoleId || ""}
            onChange={(e) => setSelectedRoleId(e.target.value as number)}
            label="Select Role"
          >
            <MenuItem value="">-- Select Role --</MenuItem>
            {isLoadingRoles ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : (
              getAssignedRolesForPermission(selectedPermission, roles).map(
                (role: any) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                )
              )
            )}
          </Select>
          <FormHelperText>
            {isLoadingRoles
              ? "Loading roles..."
              : "Select a role to unassign this permission from"}
          </FormHelperText>
        </FormControl>
      </FormDialog>

      {/* Test ABAC Modal */}
      <TestAbacModal
        open={testAbacModalOpen}
        onClose={() => {
          setTestAbacModalOpen(false);
          setTestAbacInitial(null);
        }}
        initialValues={testAbacInitial}
      />

      {/* Permission Details Panel */}
      <DetailPanel
        open={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        title={
          selectedPermission
            ? `Permission: ${selectedPermission.action} ${selectedPermission.resource}`
            : "Permission Details"
        }
        width={600}
      >
        {renderPermissionDetailsContent()}
      </DetailPanel>
    </Box>
  );
};

// Permission Audit View Component
const PermissionAuditView: React.FC<{ permissionId: number }> = ({
  permissionId,
}) => {
  const { data: logs = [], isLoading } = useEntityAuditLogs(
    "permission",
    permissionId.toString()
  );
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (isLoading) {
    return <StatusCard type="loading" title="Loading audit logs..." />;
  }

  if (logs.length === 0) {
    return (
      <StatusCard
        type="info"
        title="No audit logs"
        message="No audit history found for this permission."
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
              <Grid item xs={12}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedLog(log)}
                  startIcon={<HistoryIcon />}
                  sx={{ mt: 1 }}
                >
                  View Details
                </Button>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Log Details Dialog */}
      <FormDialog
        open={!!selectedLog}
        title="Audit Log Details"
        onClose={() => setSelectedLog(null)}
        onSubmit={() => setSelectedLog(null)}
        submitLabel="Close"
        maxWidth="md"
      >
        {selectedLog && (
          <Box>
            <PropertyList
              properties={[
                { label: "Timestamp", value: selectedLog.timestamp },
                { label: "Action", value: selectedLog.action },
                { label: "Performed By", value: selectedLog.performed_by },
                { label: "Status", value: selectedLog.status },
                { label: "Note", value: selectedLog.note || "N/A" },
                {
                  label: "Correlation ID",
                  value: selectedLog.correlation_id || "N/A",
                },
              ]}
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Changes
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2">Before:</Typography>
                <JsonViewer json={selectedLog.before_state || "{}"} />
              </Box>
              <Box>
                <Typography variant="subtitle2">After:</Typography>
                <JsonViewer json={selectedLog.after_state || "{}"} />
              </Box>
            </Box>
          </Box>
        )}
      </FormDialog>
    </Box>
  );
};

export default NewPermissionsPage;
