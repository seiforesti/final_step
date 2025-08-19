import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Policy as PolicyIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useComplianceManagement } from "../../hooks/useComplianceManagement";
import { fetchComplianceRules } from "../../api/compliance";
import { useDataSources } from "../../hooks/useDataSources";
import { format, parseISO } from "date-fns";
import ComplianceRuleCreateModal from "./ComplianceRuleCreateModal";
import ComplianceRuleEditModal from "./ComplianceRuleEditModal";

const ComplianceRuleList: React.FC = () => {
  const { deleteComplianceRule } = useComplianceManagement();
  const { getDataSources } = useDataSources();

  const [rules, setRules] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<any | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load data sources
        const sourcesData = await getDataSources();
        setDataSources(sourcesData);

        // Load compliance rules
        const rulesData = await fetchComplianceRules();
        setRules(rulesData);
      } catch (err: any) {
        setError(
          err.response?.data?.detail || "Failed to load compliance rules"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    fetchComplianceRules()
      .then((data) => setRules(data))
      .catch((err) =>
        setError(err.response?.data?.detail || "Failed to refresh rules")
      )
      .finally(() => setIsLoading(false));
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  // Handle severity filter change
  const handleSeverityChange = (event: SelectChangeEvent) => {
    setSelectedSeverity(event.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  // Close create modal
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    handleRefresh();
  };

  // Open edit modal
  const handleOpenEditModal = (rule: any) => {
    setSelectedRule(rule);
    setEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedRule(null);
    handleRefresh();
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (rule: any) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRuleToDelete(null);
  };

  // Delete rule
  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;

    try {
      setIsLoading(true);
      await deleteComplianceRule(ruleToDelete.id);
      handleRefresh();
      handleCloseDeleteDialog();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete rule");
    } finally {
      setIsLoading(false);
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <ErrorIcon color="error" />;
      case "high":
        return <WarningIcon sx={{ color: "error.light" }} />;
      case "medium":
        return <WarningIcon color="warning" />;
      case "low":
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.compliance_standard.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || rule.category === selectedCategory;
    const matchesSeverity =
      selectedSeverity === "all" ||
      rule.severity.toLowerCase() === selectedSeverity.toLowerCase();
    const matchesStatus =
      selectedStatus === "all" ||
      rule.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "severity",
      headerName: "Severity",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center">
          {getSeverityIcon(params.value as string)}
          <Typography variant="body2" sx={{ ml: 1 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "name",
      headerName: "Rule Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          size="small"
          label={params.value}
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: "compliance_standard",
      headerName: "Compliance Standard",
      width: 180,
    },
    {
      field: "applies_to",
      headerName: "Applies To",
      width: 150,
    },
    {
      field: "pass_rate",
      headerName: "Pass Rate",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const passRate = params.value as number;
        let color = "success.main";
        if (passRate < 70) color = "error.main";
        else if (passRate < 90) color = "warning.main";

        return (
          <Typography variant="body2" sx={{ color }}>
            {passRate}%
          </Typography>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          size="small"
          label={params.value}
          color={params.value === "active" ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 120,
      valueFormatter: (params) => formatDate(params.value as string),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Edit Rule">
            <IconButton
              size="small"
              onClick={() => handleOpenEditModal(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Rule">
            <IconButton
              size="small"
              onClick={() => handleOpenDeleteDialog(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Get unique categories
  const categories = Array.from(new Set(rules.map((rule) => rule.category)));

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h2">
          Compliance Rules
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
        >
          Create Rule
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search rules..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={selectedCategory}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="severity-label">Severity</InputLabel>
                <Select
                  labelId="severity-label"
                  value={selectedSeverity}
                  label="Severity"
                  onChange={handleSeverityChange}
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={selectedStatus}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid item xs={12} md={1}>
            <Box display="flex" justifyContent="flex-end">
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} disabled={isLoading}>
                  {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ height: 650 }}>
        <DataGrid
          rows={filteredRules}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
            },
          }}
        />
      </Paper>

      {/* Create Modal */}
      {createModalOpen && (
        <ComplianceRuleCreateModal
          open={createModalOpen}
          onClose={handleCloseCreateModal}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedRule && (
        <ComplianceRuleEditModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          rule={selectedRule}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Compliance Rule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the rule "{ruleToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteRule} color="error" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceRuleList;
