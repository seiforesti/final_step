import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { TreeView, TreeItem } from "@mui/lab";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as TreeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import {
  useResourceTree,
  useResourceRolesForResource,
  useAssignResourceRole,
  useEffectiveUserPermissions,
  useRoles,
  useUsers,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useResourceAncestors,
  useResourceDescendants,
  useTestAbac,
} from "../../api/rbac";
import PageHeader from "./components/PageHeader";
import DataTable from "./components/DataTable";
import ConfirmationDialog from "./components/ConfirmationDialog";
import JsonViewer from "./components/JsonViewer";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ScienceIcon from "@mui/icons-material/Science";

// Helper for type check
function isServerType(type?: string) {
  return type === "server";
}

// Recursive component to render tree nodes
const RenderTreeNodes = ({
  nodes,
  onEdit,
  onDelete,
}: {
  nodes: any[];
  onEdit: (node: any) => void;
  onDelete: (nodeId: number) => void;
}) => {
  return (
    <>
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          nodeId={String(node.id)}
          label={
            <Box sx={{ display: "flex", alignItems: "center", py: 0.5 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {node.name}{" "}
                <Chip
                  label={node.type}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          icon={<TreeIcon fontSize="small" />}
        >
          {node.children && node.children.length > 0 && (
            <RenderTreeNodes
              nodes={node.children}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </TreeItem>
      ))}
    </>
  );
};

// Test ABAC Modal Component (for Resource Tree)
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

const NewResourceTreePage: React.FC = () => {
  const theme = useTheme();
  const { data: tree, isLoading: loadingTree } = useResourceTree();
  const [selected, setSelected] = useState<number | null>(null);
  const { data: roles } = useRoles();
  const { data: users } = useUsers();
  const { data: assignments, isLoading: loadingAssignments } =
    useResourceRolesForResource(selected || 0);
  const { data: effectivePerms, isLoading: loadingPerms } =
    useEffectiveUserPermissions(selected || 0);
  const assignRole = useAssignResourceRole();
  const { data: ancestors = [] } = useResourceAncestors(selected || 0);
  const { data: descendants = [] } = useResourceDescendants(selected || 0);

  // State for assign role modal
  const [assignModal, setAssignModal] = useState(false);
  const [assignUser, setAssignUser] = useState<number | null>(null);
  const [assignRoleId, setAssignRoleId] = useState<number | null>(null);

  // State for resource CRUD modal
  const [crudModal, setCrudModal] = useState<{
    mode: "add" | "edit";
    parentId?: number;
    resource?: any;
  } | null>(null);
  const [resourceName, setResourceName] = useState("");
  const [resourceType, setResourceType] = useState<string | undefined>(
    undefined
  );
  const [resourceEngine, setResourceEngine] = useState<string | undefined>(
    undefined
  );
  const [resourceDetails, setResourceDetails] = useState<string>("");

  // State for permission diff modal
  const [diffModal, setDiffModal] = useState<{
    before: any[];
    after: any[];
  } | null>(null);

  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // API hooks
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  // Handle tree node selection
  const handleNodeSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelected(Number(nodeId));
  };

  // Handle resource creation
  const handleCreateResource = async () => {
    if (
      crudModal?.mode === "add" &&
      resourceName &&
      resourceType &&
      (!isServerType(resourceType) || resourceEngine)
    ) {
      await createResource.mutateAsync({
        name: resourceName,
        type: resourceType,
        parent_id: crudModal.parentId,
        engine: resourceEngine,
        details: resourceDetails || undefined,
      });
      resetResourceForm();
    }
  };

  // Handle resource update
  const handleUpdateResource = async () => {
    if (crudModal?.mode === "edit" && crudModal.resource) {
      await updateResource.mutateAsync({
        resourceId: crudModal.resource.id,
        name: resourceName,
        engine: resourceEngine,
        details: resourceDetails || undefined,
      });
      resetResourceForm();
    }
  };

  // Handle resource deletion
  const handleDeleteResource = async () => {
    if (deleteConfirm) {
      await deleteResource.mutateAsync(deleteConfirm);
      setDeleteConfirm(null);
      if (selected === deleteConfirm) {
        setSelected(null);
      }
    }
  };

  // Handle role assignment
  const handleAssignRole = async () => {
    if (assignUser && assignRoleId && selected) {
      await assignRole.mutateAsync({
        user_id: assignUser,
        role_id: assignRoleId,
        resource_id: selected,
      });
      setAssignModal(false);
      setAssignUser(null);
      setAssignRoleId(null);
    }
  };

  // Reset resource form
  const resetResourceForm = () => {
    setCrudModal(null);
    setResourceName("");
    setResourceType(undefined);
    setResourceEngine(undefined);
    setResourceDetails("");
  };

  // Open edit resource modal
  const openEditModal = (resource: any) => {
    setCrudModal({ mode: "edit", resource });
    setResourceName(resource.name);
    setResourceType(resource.type);
    setResourceEngine(resource.engine);
    setResourceDetails(resource.details || "");
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Resource Tree" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardHeader
              title="Resource Hierarchy"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => {
                    setResourceName("");
                    setResourceType(undefined);
                    setResourceEngine(undefined);
                    setResourceDetails("");
                    setCrudModal({
                      mode: "add",
                      parentId: selected || undefined,
                    });
                  }}
                >
                  Add Resource
                </Button>
              }
            />
            <CardContent sx={{ maxHeight: 600, overflow: "auto" }}>
              {loadingTree ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : tree && tree.length > 0 ? (
                <TreeView
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                  selected={selected ? String(selected) : ""}
                  onNodeSelect={handleNodeSelect}
                >
                  <RenderTreeNodes
                    nodes={tree}
                    onEdit={openEditModal}
                    onDelete={(nodeId) => setDeleteConfirm(nodeId)}
                  />
                </TreeView>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No resources found.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {selected ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Card variant="outlined">
                <CardHeader
                  title="Direct Role Assignments"
                  action={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setAssignModal(true)}
                    >
                      Assign Role
                    </Button>
                  }
                />
                <CardContent>
                  {loadingAssignments ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : assignments && assignments.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Assigned At</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {assignments.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>
                                {users?.find((u) => u.id === row.user_id)
                                  ?.email || row.user_id}
                              </TableCell>
                              <TableCell>
                                {roles?.find((r) => r.id === row.role_id)
                                  ?.name || row.role_id}
                              </TableCell>
                              <TableCell>{row.assigned_at}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No role assignments found for this resource.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardHeader title="Effective Permissions (All Users)" />
                <CardContent>
                  {loadingPerms ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : effectivePerms &&
                    Object.keys(effectivePerms).length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Direct Permissions</TableCell>
                            <TableCell>Inherited Permissions</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(effectivePerms).map(
                            ([userId, perms]) => (
                              <TableRow key={userId}>
                                <TableCell>
                                  {users?.find((u) => u.id === Number(userId))
                                    ?.email || userId}
                                </TableCell>
                                <TableCell>
                                  {perms?.length ? (
                                    <List dense disablePadding>
                                      {perms.map((p: any, i: number) => (
                                        <ListItem key={i} disablePadding>
                                          <Chip
                                            label={p.action}
                                            size="small"
                                            color="primary"
                                            sx={{ mr: 1 }}
                                          />
                                          on
                                          <Chip
                                            label={p.resource}
                                            size="small"
                                            color="secondary"
                                            sx={{ ml: 1 }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      No direct permissions
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    (Inherited permissions shown here)
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      setDiffModal({ before: [], after: perms })
                                    }
                                  >
                                    Diff
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No effective permissions found for this resource.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardHeader title="Resource Hierarchy" />
                <CardContent>
                  <Box sx={{ display: "flex", gap: 4 }}>
                    <Box>
                      <Typography variant="subtitle2">Ancestors</Typography>
                      {ancestors.length > 0 ? (
                        <List dense>
                          {ancestors.map((node) => (
                            <ListItem key={node.id}>
                              <ListItemText
                                primary={node.name}
                                secondary={node.type}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No ancestors
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Descendants</Typography>
                      {descendants.length > 0 ? (
                        <List dense>
                          {descendants.map((node) => (
                            <ListItem key={node.id}>
                              <ListItemText
                                primary={node.name}
                                secondary={node.type}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No descendants
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                Select a resource from the tree to view its details.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Assign Role Modal */}
      <Dialog
        open={assignModal}
        onClose={() => setAssignModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Role to Resource</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>User</InputLabel>
              <Select
                value={assignUser || ""}
                onChange={(e) => setAssignUser(e.target.value as number)}
                label="User"
              >
                {users?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={assignRoleId || ""}
                onChange={(e) => setAssignRoleId(e.target.value as number)}
                label="Role"
              >
                {roles?.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignRole}
            disabled={!assignUser || !assignRoleId || assignRole.isPending}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resource CRUD Modal */}
      <Dialog
        open={!!crudModal}
        onClose={resetResourceForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {crudModal?.mode === "add" ? "Add Resource" : "Edit Resource"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Name"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              fullWidth
              required
            />

            <FormControl
              fullWidth
              required
              disabled={crudModal?.mode === "edit"}
            >
              <InputLabel>Type</InputLabel>
              <Select
                value={resourceType || ""}
                onChange={(e) => setResourceType(e.target.value)}
                label="Type"
              >
                {["server", "database", "schema", "table", "collection"].map(
                  (type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            {isServerType(resourceType) && (
              <FormControl fullWidth required>
                <InputLabel>Engine</InputLabel>
                <Select
                  value={resourceEngine || ""}
                  onChange={(e) => setResourceEngine(e.target.value)}
                  label="Engine"
                >
                  {["mysql", "postgres", "mongodb"].map((engine) => (
                    <MenuItem key={engine} value={engine}>
                      {engine}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Details"
              value={resourceDetails}
              onChange={(e) => setResourceDetails(e.target.value)}
              multiline
              minRows={3}
              placeholder="Optional JSON or text details"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetResourceForm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={
              crudModal?.mode === "add"
                ? handleCreateResource
                : handleUpdateResource
            }
            disabled={
              !resourceName ||
              (crudModal?.mode === "add" && !resourceType) ||
              (isServerType(resourceType) && !resourceEngine) ||
              createResource.isPending ||
              updateResource.isPending
            }
          >
            {crudModal?.mode === "add" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteConfirm}
        title="Delete Resource"
        content="Are you sure you want to delete this resource? This action cannot be undone."
        onConfirm={handleDeleteResource}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={deleteResource.isPending}
      />

      {/* Permission Diff Modal */}
      {diffModal && (
        <Dialog
          open={!!diffModal}
          onClose={() => setDiffModal(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Permission Differences</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Before:
                </Typography>
                {diffModal.before.length > 0 ? (
                  <JsonViewer data={diffModal.before} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No permissions
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  After:
                </Typography>
                {diffModal.after.length > 0 ? (
                  <JsonViewer data={diffModal.after} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No permissions
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDiffModal(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

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

      {/* ABAC Test Modal */}
      <TestAbacModal
        open={testAbacModalOpen}
        onClose={() => setTestAbacModalOpen(false)}
      />
    </Box>
  );
};

export default NewResourceTreePage;
