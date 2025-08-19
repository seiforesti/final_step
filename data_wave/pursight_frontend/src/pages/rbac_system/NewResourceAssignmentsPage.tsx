// ...existing code...
// --- AGGRESSIVE RBAC ADMIN UI ENHANCEMENT PATCH ---
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  Modal,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import {
  useRoleAssignments,
  useAssignRoleScope,
  useRemoveRoleScope,
  useBulkAssignRoles,
  useBulkRemoveRoles,
  useBulkAssignRolesEfficient,
  useBulkRemoveRolesEfficient,
  useTestAbac,
  useUsers,
  useRoles,
  useEntityAuditLogs,
  AuditLog,
} from "../../api/rbac";
import { ConditionSelector, CsvExport, TimelineAuditView, AdvancedJsonDiffView } from "../../components/rbac";
import { saveAs } from "file-saver";
import PageHeader from "./components/PageHeader";
import CommandBar from "./components/CommandBar";
import DataTable from "./components/DataTable";
import FilterBar from "./components/FilterBar";
import FormDialog from "./components/FormDialog";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { TabsContainer } from "./components/TabPanel";
import StatusCard from "./components/StatusCard";

// --- Resource assignments page with advanced RBAC admin features ---
const resources = [
  { label: "Table: Customers", type: "table", id: "customers" },
  { label: "Dataset: Sales", type: "dataset", id: "sales" },
];

const NewResourceAssignmentsPage: React.FC = () => {
  // Data fetching hooks
  const { data: assignments = [], isLoading } = useRoleAssignments();
  const { data: users = [] } = useUsers();
  const { data: roles = [] } = useRoles();
  const assignRoleScope = useAssignRoleScope();
  const removeRoleScope = useRemoveRoleScope();
  const bulkAssignRoles = useBulkAssignRolesEfficient();
  const bulkRemoveRoles = useBulkRemoveRolesEfficient();
  const testAbac = useTestAbac();

  // State for modals and panels
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [testAbacModalOpen, setTestAbacModalOpen] = useState(false);
  const [auditResource, setAuditResource] = useState<{
    type: string;
    id: string;
  } | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<
    "bulkRemove" | "bulkAssign"
  >("bulkRemove");

  // State for selected items
  const [selectedAssignments, setSelectedAssignments] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkRoleId, setBulkRoleId] = useState<number | undefined>(undefined);

  // Form state
  const [formUser, setFormUser] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formResourceType, setFormResourceType] = useState("");
  const [formResourceId, setFormResourceId] = useState("");
  const [formConditions, setFormConditions] = useState("{}");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  // Handle assignment creation
  const handleAssign = async () => {
    if (!formUser || !formRole || !formResourceType || !formResourceId) return;
    try {
      await assignRoleScope.mutateAsync({
        user_id: Number(formUser),
        role_id: Number(formRole),
        resource_type: formResourceType,
        resource_id: formResourceId,
        conditions: formConditions,
      });
      setAssignModalOpen(false);
      setFormUser("");
      setFormRole("");
      setFormResourceType("");
      setFormResourceId("");
      setFormConditions("{}");
    } catch (error) {
      // Show error dialog/snackbar
      alert("Failed to assign role: " + (error as any)?.message);
    }
  };

  // Handle bulk assign
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
      alert("Failed to bulk assign roles: " + (error as any)?.message);
    }
  };

  // Handle bulk remove
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
      alert("Failed to bulk remove roles: " + (error as any)?.message);
    }
  };

  // Table columns
  const columns = [
    {
      id: "user_id",
      label: "User",
      minWidth: 150,
      format: (value: number) => {
        const user = users.find((u) => u.id === value);
        return user ? user.email : value;
      },
    },
    {
      id: "role_id",
      label: "Role",
      minWidth: 150,
      format: (value: number) => {
        const role = roles.find((r) => r.id === value);
        return role ? role.name : value;
      },
    },
    { id: "resource_type", label: "Resource Type", minWidth: 120 },
    { id: "resource_id", label: "Resource ID", minWidth: 150 },
  ];

  // Row actions
  const actions = [
    {
      label: "Audit",
      icon: <HistoryIcon fontSize="small" />,
      onClick: (row: any) =>
        setAuditResource({ type: row.resource_type, id: row.resource_id }),
    },
  ];

  // Command bar actions
  const primaryActions = [
    {
      key: "assign-role",
      label: "Assign Role to Resource",
      icon: <AddIcon />,
      onClick: () => setAssignModalOpen(true),
      primary: true,
    },
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
      key: "export",
      label: "Export",
      icon: <DownloadIcon />,
      onClick: () => {
        const blob = new Blob([JSON.stringify(assignments, null, 2)], {
          type: "application/json",
        });
        saveAs(blob, `resource_assignments_export.json`);
      },
    },
  ];

  // Filter options
  const filterOptions = [
    {
      id: "resource_type",
      label: "Resource Type",
      options: [
        { value: "table", label: "Table" },
        { value: "dataset", label: "Dataset" },
      ],
    },
  ];

  // Filtered assignments
  const filteredAssignments = assignments.filter((assignment) => {
    if (!searchQuery) return true;
    const user = users.find((u) => u.id === assignment.user_id);
    const role = roles.find((r) => r.id === assignment.role_id);
    return (
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      role?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      assignment.resource_type
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      false ||
      assignment.resource_id
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      false
    );
  });

  // --- ABAC Test Modal ---
  const [abacUserId, setAbacUserId] = useState<number | "">("");
  const [abacAction, setAbacAction] = useState("");
  const [abacResource, setAbacResource] = useState("");
  const [abacConditions, setAbacConditions] = useState("{}");
  const [abacJsonError, setAbacJsonError] = useState<string | null>(null);
  const [abacResult, setAbacResult] = useState<null | {
    allowed: boolean;
    details?: any;
  }>(null);
  const validateAbacJson = (value: string): boolean => {
    try {
      JSON.parse(value);
      setAbacJsonError(null);
      return true;
    } catch {
      setAbacJsonError("Invalid JSON");
      return false;
    }
  };
  const handleAbacTest = async () => {
    if (
      !abacUserId ||
      !abacAction ||
      !abacResource ||
      !validateAbacJson(abacConditions)
    )
      return;
    try {
      const res = await testAbac.mutateAsync({
        user_id: Number(abacUserId),
        action: abacAction,
        resource: abacResource,
        conditions: JSON.parse(abacConditions),
      });
      setAbacResult(res?.data || res);
    } catch (e) {
      setAbacResult(null);
      setAbacJsonError("Test failed. See console for details.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Resource-Level Role Assignments"
        subtitle="Manage role assignments at the resource level"
        breadcrumbs={[
          { label: "RBAC System", href: "/rbac" },
          { label: "Resource Assignments", href: "/rbac/resource-assignments" },
        ]}
      />
      <CommandBar
        primaryActions={primaryActions}
        secondaryActions={secondaryActions}
      />
      <Box sx={{ my: 2 }}>
        <FilterBar
          searchPlaceholder="Search assignments..."
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
        data={filteredAssignments}
        keyExtractor={(row) =>
          row.id?.toString() ||
          `${row.user_id}-${row.role_id}-${row.resource_id}`
        }
        loading={isLoading}
        actions={actions}
        pagination
        selectable
        onSelectionChange={(rows: any[]) =>
          setSelectedRowKeys(rows.map((row) => row.user_id))
        }
        emptyMessage="No resource assignments found. Assign a role to a resource to get started."
      />

      {/* Assign Role to Resource Modal */}
      <FormDialog
        open={assignModalOpen}
        title="Assign Role to Resource"
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssign}
        submitLabel="Assign"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="user-select-label">User</InputLabel>
            <Select
              labelId="user-select-label"
              value={formUser}
              onChange={(e) => setFormUser(e.target.value)}
              label="User"
              required
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              label="Role"
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="resource-type-select-label">
              Resource Type
            </InputLabel>
            <Select
              labelId="resource-type-select-label"
              value={formResourceType}
              onChange={(e) => setFormResourceType(e.target.value)}
              label="Resource Type"
              required
            >
              <MenuItem value="table">Table</MenuItem>
              <MenuItem value="dataset">Dataset</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="resource-select-label">Resource</InputLabel>
            <Select
              labelId="resource-select-label"
              value={formResourceId}
              onChange={(e) => setFormResourceId(e.target.value)}
              label="Resource"
              required
              disabled={!formResourceType}
            >
              {resources
                .filter((r) => r.type === formResourceType)
                .map((resource) => (
                  <MenuItem key={resource.id} value={resource.id}>
                    {resource.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Conditions (JSON, optional)
              <Tooltip title="See OpenAPI documentation for ABAC/condition schema.">
                <InfoOutlinedIcon
                  fontSize="small"
                  sx={{ ml: 1, verticalAlign: "middle" }}
                />
              </Tooltip>
            </Typography>
            <ConditionSelector
              value={formConditions}
              onChange={setFormConditions}
            />
          </Box>
        </Box>
      </FormDialog>

      {/* Bulk Assign Role Modal */}
      <FormDialog
        open={bulkModalOpen}
        title="Bulk Assign Role"
        onClose={() => setBulkModalOpen(false)}
        onSubmit={handleBulkAssign}
        submitLabel="Assign Role"
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
            SelectProps={{ native: true }}
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

      {/* Bulk Remove Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Bulk Remove Role"
        message={`Are you sure you want to remove the selected role from ${selectedRowKeys.length} user(s)?`}
        confirmLabel="Remove"
        onConfirm={handleBulkRemove}
        onCancel={() => setConfirmDialogOpen(false)}
        severity="error"
        confirmButtonColor="error"
        loading={bulkRemoveRoles.isPending}
      />

      {/* ABAC Test Modal */}
      <FormDialog
        open={testAbacModalOpen}
        title="Test ABAC Permissions"
        onClose={() => setTestAbacModalOpen(false)}
        onSubmit={handleAbacTest}
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
            value={abacUserId}
            onChange={(e) => setAbacUserId(Number(e.target.value) || "")}
            type="number"
            fullWidth
            required
          />
          <TextField
            label="Action"
            value={abacAction}
            onChange={(e) => setAbacAction(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Resource"
            value={abacResource}
            onChange={(e) => setAbacResource(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Conditions (JSON)"
            value={abacConditions}
            onChange={(e) => setAbacConditions(e.target.value)}
            fullWidth
            multiline
            rows={4}
            error={!!abacJsonError}
            helperText={abacJsonError || 'Example: {"department": "HR"}'}
          />
          {abacResult && (
            <StatusCard
              type={abacResult.allowed ? "success" : "error"}
              title={abacResult.allowed ? "Access Allowed" : "Access Denied"}
              message={
                abacResult.details
                  ? JSON.stringify(abacResult.details, null, 2)
                  : ""
              }
            />
          )}
        </Box>
      </FormDialog>

      {/* Resource Audit Modal */}
      {auditResource && (
        <FormDialog
          open={!!auditResource}
          title={`Audit History for ${auditResource.type}:${auditResource.id}`}
          onClose={() => setAuditResource(null)}
          maxWidth="lg"
          onSubmit={() => {}}
        >
          <ResourceAuditView
            resourceType={auditResource.type}
            resourceId={auditResource.id}
          />
        </FormDialog>
      )}
    </Box>
  );
};

export default NewResourceAssignmentsPage;

// --- Resource Audit View ---
function ResourceAuditView({
  resourceType,
  resourceId,
}: {
  resourceType: string;
  resourceId: string;
}) {
  const { data: logs = [], isLoading } = useEntityAuditLogs(
    resourceType,
    resourceId
  );
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filter, setFilter] = useState("");
  const [showCorrelation, setShowCorrelation] = useState<string | null>(null);
  const filteredLogs = logs.filter(
    (log) =>
      log.action?.toLowerCase().includes(filter.toLowerCase()) ||
      log.performed_by?.toLowerCase().includes(filter.toLowerCase()) ||
      log.status?.toLowerCase().includes(filter.toLowerCase()) ||
      log.note?.toLowerCase().includes(filter.toLowerCase()) ||
      log.correlation_id?.toLowerCase().includes(filter.toLowerCase())
  );
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `resource_audit_logs_${resourceType}_${resourceId}.json`);
  };
  const correlationChains = filteredLogs
    .filter((log) => log.correlation_id)
    .map((log) => log.correlation_id!)
    .filter((value, index, self) => self.indexOf(value) === index);
  const auditColumns = [
    { id: "timestamp", label: "Timestamp", minWidth: 120 },
    { id: "action", label: "Action", minWidth: 120 },
    { id: "performed_by", label: "By", minWidth: 120 },
    { id: "status", label: "Status", minWidth: 100 },
    { id: "note", label: "Note", minWidth: 200 },
    {
      id: "drilldown",
      label: "Drilldown",
      minWidth: 100,
      format: (_: any, log: any) => (
        <Button size="small" onClick={() => setSelectedLog(log)}>
          View Diff
        </Button>
      ),
    },
  ];
  const auditActions = [
    {
      label: "View Diff",
      icon: <HistoryIcon fontSize="small" />,
      onClick: (row: AuditLog) => setSelectedLog(row),
    },
  ];
  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <TextField
          placeholder="Filter logs (action, user, status, note, correlation)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{ width: 320, mr: 2 }}
        />
        <Box>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            Export JSON
          </Button>
          <CsvExport
            data={filteredLogs}
            filename={`resource_audit_logs_${resourceType}_${resourceId}.csv`}
          />
        </Box>
      </Box>
      {correlationChains.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Correlation Chains
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {correlationChains.map((chain) => (
              <Button
                key={chain}
                size="small"
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => setShowCorrelation(chain)}
              >
                {chain.substring(0, 8)}...
              </Button>
            ))}
          </Box>
        </Box>
      )}
      <TabsContainer
        tabs={[
          {
            label: "Table View",
            content: (
              <DataTable
                columns={auditColumns}
                data={filteredLogs}
                keyExtractor={(row) => row.id?.toString() || ""}
                loading={isLoading}
                actions={auditActions}
                pagination
                emptyMessage="No audit logs found."
              />
            ),
          },
          {
            label: "Timeline View",
            content: (
              <TimelineAuditView
                logs={filteredLogs}
                onDrilldown={setSelectedLog}
              />
            ),
          },
        ]}
      />
      {/* Diff View Dialog */}
      <FormDialog
        open={!!selectedLog}
        title="Audit Log Diff"
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        onSubmit={() => {}}
      >
        {selectedLog && (
          <Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="subtitle2">Action:</Typography>
                <Typography>{selectedLog.action}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">By:</Typography>
                <Typography>{selectedLog.performed_by}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Status:</Typography>
                <Typography>{selectedLog.status}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Timestamp:</Typography>
                <Typography>{selectedLog.timestamp}</Typography>
              </Box>
              {selectedLog.note && (
                <Box sx={{ width: "100%" }}>
                  <Typography variant="subtitle2">Note:</Typography>
                  <Typography>{selectedLog.note}</Typography>
                </Box>
              )}
            </Box>
            <AdvancedJsonDiffView
              before={selectedLog.before_state}
              after={selectedLog.after_state}
            />
          </Box>
        )}
      </FormDialog>
      {/* Correlation Chain Dialog */}
      <FormDialog
        open={!!showCorrelation}
        title={`Workflow Chain: ${showCorrelation}`}
        onClose={() => setShowCorrelation(null)}
        maxWidth="lg"
        onSubmit={() => {}}
      >
        <DataTable
          columns={auditColumns}
          data={logs.filter((l) => l.correlation_id === showCorrelation)}
          keyExtractor={(row) => row.id?.toString() || ""}
          actions={auditActions}
          pagination={false}
          emptyMessage="No correlation chain logs found."
        />
      </FormDialog>
    </Box>
  );
}
