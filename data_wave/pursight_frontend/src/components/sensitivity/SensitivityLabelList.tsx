import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useSensitivityLabels } from '../../hooks/useSensitivityLabels';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import SensitivityLabelCreateEditModal from './SensitivityLabelCreateEditModal';

const SensitivityLabelList: React.FC = () => {
  const theme = useTheme();
  const { getSensitivityLabels, deleteSensitivityLabel } = useSensitivityLabels();
  
  // State for sensitivity labels
  const [sensitivityLabels, setSensitivityLabels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  
  // State for filter menu
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const filterMenuOpen = Boolean(filterAnchorEl);
  
  // State for modals
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [labelToEdit, setLabelToEdit] = useState<any | null>(null);
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<any | null>(null);
  
  // Available sensitivity levels
  const sensitivityLevels = ['high', 'medium', 'low', 'none'];
  
  // Load sensitivity labels
  useEffect(() => {
    const loadSensitivityLabels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const labelsData = await getSensitivityLabels();
        
        // Filter labels based on search term and level filter
        let filteredLabels = labelsData;
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredLabels = filteredLabels.filter(
            (label) =>
              label.name.toLowerCase().includes(searchLower) ||
              label.description.toLowerCase().includes(searchLower)
          );
        }
        
        if (levelFilter.length > 0) {
          filteredLabels = filteredLabels.filter((label) =>
            levelFilter.includes(label.level.toLowerCase())
          );
        }
        
        setSensitivityLabels(filteredLabels);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load sensitivity labels');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSensitivityLabels();
  }, [searchTerm, levelFilter]);
  
  // Handle filter menu open
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // Handle filter menu close
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle level filter change
  const handleLevelFilterChange = (level: string) => {
    if (levelFilter.includes(level)) {
      setLevelFilter(levelFilter.filter((l) => l !== level));
    } else {
      setLevelFilter([...levelFilter, level]);
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setLevelFilter([]);
    handleFilterMenuClose();
  };
  
  // Handle create new label
  const handleCreateLabel = () => {
    setLabelToEdit(null);
    setCreateEditModalOpen(true);
  };
  
  // Handle edit label
  const handleEditLabel = (label: any) => {
    setLabelToEdit(label);
    setCreateEditModalOpen(true);
  };
  
  // Handle delete label
  const handleDeleteLabel = (label: any) => {
    setLabelToDelete(label);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete label
  const confirmDeleteLabel = async () => {
    if (!labelToDelete) return;
    
    try {
      setIsLoading(true);
      await deleteSensitivityLabel(labelToDelete.id);
      
      // Refresh sensitivity labels list
      const updatedLabels = sensitivityLabels.filter(label => label.id !== labelToDelete.id);
      setSensitivityLabels(updatedLabels);
      
      setDeleteDialogOpen(false);
      setLabelToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete sensitivity label');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel delete label
  const cancelDeleteLabel = () => {
    setDeleteDialogOpen(false);
    setLabelToDelete(null);
  };
  
  // Handle modal close
  const handleModalClose = () => {
    setCreateEditModalOpen(false);
    setLabelToEdit(null);
  };
  
  // Handle label creation/update success
  const handleLabelSuccess = () => {
    // Refresh the list
    getSensitivityLabels()
      .then(data => setSensitivityLabels(data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to refresh sensitivity labels'));
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Get level color
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      case 'none':
      default:
        return theme.palette.grey[500];
    }
  };
  
  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'level',
      headerName: 'Level',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={<SecurityIcon />}
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          sx={{ 
            color: getLevelColor(params.value as string),
            borderColor: getLevelColor(params.value as string)
          }}
          variant="outlined"
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 300,
    },
    {
      field: 'entity_count',
      headerName: 'Entities',
      width: 120,
      type: 'number',
      valueGetter: (params) => params.row.entity_count || 0,
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      valueGetter: (params) => formatDate(params.value as string),
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      width: 150,
      valueGetter: (params) => formatDate(params.value as string),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditLabel(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteLabel(params.row)}
              disabled={params.row.entity_count > 0}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Sensitivity Labels
        </Typography>
        
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateLabel}
          >
            Create Label
          </Button>
        </Box>
      </Box>
      
      {/* Search and Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <TextField
            placeholder="Search labels..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterMenuOpen}
            color={levelFilter.length > 0 ? 'primary' : 'inherit'}
          >
            Filters
            {levelFilter.length > 0 && (
              <Chip
                size="small"
                label={levelFilter.length}
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setIsLoading(true);
              getSensitivityLabels()
                .then(data => setSensitivityLabels(data))
                .catch(err => setError(err.response?.data?.detail || 'Failed to refresh sensitivity labels'))
                .finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
        
        {/* Active Filters Display */}
        {levelFilter.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
            {levelFilter.map(level => (
              <Chip
                key={level}
                size="small"
                icon={<SecurityIcon />}
                label={`Level: ${level.charAt(0).toUpperCase() + level.slice(1)}`}
                onDelete={() => setLevelFilter(levelFilter.filter(l => l !== level))}
                sx={{ 
                  color: getLevelColor(level),
                  borderColor: getLevelColor(level)
                }}
                variant="outlined"
              />
            ))}
            
            <Chip
              size="small"
              icon={<ClearIcon />}
              label="Clear All Filters"
              onClick={handleClearFilters}
              color="default"
              variant="outlined"
            />
          </Box>
        )}
      </Paper>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={filterMenuOpen}
        onClose={handleFilterMenuClose}
        PaperProps={{
          sx: { width: 250, maxHeight: 400, p: 1 },
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Filter by Sensitivity Level
        </Typography>
        <Divider sx={{ mb: 1 }} />
        
        {sensitivityLevels.map((level) => (
          <MenuItem
            key={level}
            onClick={() => handleLevelFilterChange(level)}
            selected={levelFilter.includes(level)}
          >
            <ListItemIcon>
              <SecurityIcon sx={{ color: getLevelColor(level) }} />
            </ListItemIcon>
            <ListItemText primary={level.charAt(0).toUpperCase() + level.slice(1)} />
          </MenuItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <Box display="flex" justifyContent="flex-end" sx={{ px: 2, py: 1 }}>
          <Button size="small" onClick={handleClearFilters}>
            Clear All
          </Button>
        </Box>
      </Menu>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Sensitivity Labels DataGrid */}
      <Paper variant="outlined" sx={{ height: 600 }}>
        <DataGrid
          rows={sensitivityLabels}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
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
      
      {/* Create/Edit Modal */}
      <SensitivityLabelCreateEditModal
        open={createEditModalOpen}
        onClose={handleModalClose}
        labelToEdit={labelToEdit}
        onSuccess={handleLabelSuccess}
      />
      
      {/* Delete Confirmation Dialog */}
      {labelToDelete && (
        <Dialog
          open={deleteDialogOpen}
          onClose={cancelDeleteLabel}
        >
          <DialogTitle>Delete Sensitivity Label</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the sensitivity label <strong>{labelToDelete.name}</strong>? This action cannot be undone.
              {labelToDelete.entity_count > 0 && (
                <Box component="span" sx={{ display: 'block', color: 'error.main', mt: 1 }}>
                  This label is currently assigned to {labelToDelete.entity_count} entities. You must remove these assignments before deleting.
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeleteLabel} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteLabel} 
              color="error" 
              disabled={isLoading || labelToDelete.entity_count > 0}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SensitivityLabelList;