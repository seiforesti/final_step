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
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  Security as SecurityIcon,
  Label as LabelIcon,
  Warning as WarningIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDataCatalog } from '../../hooks/useDataCatalog';
import { useSensitivityLabels } from '../../hooks/useSensitivityLabels';
import { useDataSources } from '../../hooks/useDataSources';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';

const EntityList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { getEntities, deleteEntity } = useDataCatalog();
  const { getSensitivityLabels } = useSensitivityLabels();
  const { getDataSources } = useDataSources();
  
  // State for entities and metadata
  const [entities, setEntities] = useState<any[]>([]);
  const [sensitivityLabels, setSensitivityLabels] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string[]>([]);
  const [dataSourceFilter, setDataSourceFilter] = useState<number[]>([]);
  const [sensitivityFilter, setSensitivityFilter] = useState<number[]>([]);
  const [classificationFilter, setClassificationFilter] = useState<string[]>([]);
  
  // State for filter menu
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const filterMenuOpen = Boolean(filterAnchorEl);
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<any | null>(null);
  
  // Available entity types
  const entityTypes = ['database', 'schema', 'table', 'column', 'folder', 'file'];
  
  // Available classifications (derived from entities)
  const [availableClassifications, setAvailableClassifications] = useState<string[]>([]);
  
  // Load entities and metadata
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load entities
        const entitiesData = await getEntities({
          search: searchTerm,
          entity_types: entityTypeFilter.length > 0 ? entityTypeFilter : undefined,
          data_source_ids: dataSourceFilter.length > 0 ? dataSourceFilter : undefined,
          sensitivity_label_ids: sensitivityFilter.length > 0 ? sensitivityFilter : undefined,
          classifications: classificationFilter.length > 0 ? classificationFilter : undefined,
        });
        setEntities(entitiesData);
        
        // Extract unique classifications from entities
        const classifications = new Set<string>();
        entitiesData.forEach((entity: any) => {
          if (entity.classifications && Array.isArray(entity.classifications)) {
            entity.classifications.forEach((classification: string) => {
              classifications.add(classification);
            });
          }
        });
        setAvailableClassifications(Array.from(classifications).sort());
        
        // Load sensitivity labels
        const labelsData = await getSensitivityLabels();
        setSensitivityLabels(labelsData);
        
        // Load data sources
        const sourcesData = await getDataSources();
        setDataSources(sourcesData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load entities');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [searchTerm, entityTypeFilter, dataSourceFilter, sensitivityFilter, classificationFilter]);
  
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
  
  // Handle entity type filter change
  const handleEntityTypeFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setEntityTypeFilter(event.target.value as string[]);
  };
  
  // Handle data source filter change
  const handleDataSourceFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDataSourceFilter(event.target.value as number[]);
  };
  
  // Handle sensitivity filter change
  const handleSensitivityFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSensitivityFilter(event.target.value as number[]);
  };
  
  // Handle classification filter change
  const handleClassificationFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setClassificationFilter(event.target.value as string[]);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setEntityTypeFilter([]);
    setDataSourceFilter([]);
    setSensitivityFilter([]);
    setClassificationFilter([]);
    handleFilterMenuClose();
  };
  
  // Handle view entity details
  const handleViewEntity = (entityType: string, entityId: number) => {
    navigate(`/catalog/${entityType}/${entityId}`);
  };
  
  // Handle edit entity
  const handleEditEntity = (entityType: string, entityId: number) => {
    navigate(`/catalog/${entityType}/${entityId}/edit`);
  };
  
  // Handle delete entity
  const handleDeleteEntity = (entity: any) => {
    setEntityToDelete(entity);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete entity
  const confirmDeleteEntity = async () => {
    if (!entityToDelete) return;
    
    try {
      setIsLoading(true);
      await deleteEntity(entityToDelete.entity_type, entityToDelete.id);
      
      // Refresh entities list
      const updatedEntities = entities.filter(entity => 
        !(entity.id === entityToDelete.id && entity.entity_type === entityToDelete.entity_type)
      );
      setEntities(updatedEntities);
      
      setDeleteDialogOpen(false);
      setEntityToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete entity');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel delete entity
  const cancelDeleteEntity = () => {
    setDeleteDialogOpen(false);
    setEntityToDelete(null);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Get entity icon
  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'database':
        return <StorageIcon />;
      case 'schema':
        return <DataObjectIcon />;
      case 'table':
        return <TableChartIcon />;
      case 'column':
        return <ViewColumnIcon />;
      case 'folder':
        return <FolderIcon />;
      case 'file':
        return <FileIcon />;
      default:
        return <DataObjectIcon />;
    }
  };
  
  // Get sensitivity label color
  const getSensitivityLabelColor = (labelId: number) => {
    const label = sensitivityLabels.find(l => l.id === labelId);
    if (!label) return theme.palette.grey[500];
    
    switch (label.level.toLowerCase()) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Get sensitivity label name
  const getSensitivityLabelName = (labelId: number) => {
    const label = sensitivityLabels.find(l => l.id === labelId);
    return label ? label.name : 'Unknown';
  };
  
  // Get data source name
  const getDataSourceName = (dataSourceId: number) => {
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    return dataSource ? dataSource.name : `ID: ${dataSourceId}`;
  };
  
  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'entity_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center">
          {getEntityIcon(params.value as string)}
          <Typography variant="body2" sx={{ ml: 1 }}>
            {(params.value as string).charAt(0).toUpperCase() + (params.value as string).slice(1)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {params.value}
          </Typography>
          {params.row.qualified_name && (
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {params.row.qualified_name}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'data_source_id',
      headerName: 'Data Source',
      width: 180,
      valueGetter: (params) => getDataSourceName(params.value as number),
    },
    {
      field: 'sensitivity_label_id',
      headerName: 'Sensitivity',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Chip
            size="small"
            icon={<SecurityIcon />}
            label={getSensitivityLabelName(params.value as number)}
            sx={{ 
              color: getSensitivityLabelColor(params.value as number),
              borderColor: getSensitivityLabelColor(params.value as number)
            }}
            variant="outlined"
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            None
          </Typography>
        )
      ),
    },
    {
      field: 'classifications',
      headerName: 'Classifications',
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const classifications = params.value as string[];
        return classifications && classifications.length > 0 ? (
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {classifications.slice(0, 2).map((classification) => (
              <Chip
                key={classification}
                size="small"
                label={classification}
                color="primary"
                variant="outlined"
              />
            ))}
            {classifications.length > 2 && (
              <Chip
                size="small"
                label={`+${classifications.length - 2}`}
                color="default"
                variant="outlined"
              />
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            None
          </Typography>
        );
      },
    },
    {
      field: 'updated_at',
      headerName: 'Last Updated',
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
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewEntity(params.row.entity_type, params.row.id)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditEntity(params.row.entity_type, params.row.id)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteEntity(params.row)}
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
          Data Catalog
        </Typography>
        
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/catalog/create')}
          >
            Add Entity
          </Button>
        </Box>
      </Box>
      
      {/* Search and Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <TextField
            placeholder="Search entities..."
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
            color={entityTypeFilter.length > 0 || dataSourceFilter.length > 0 || 
                  sensitivityFilter.length > 0 || classificationFilter.length > 0 ? 'primary' : 'inherit'}
          >
            Filters
            {(entityTypeFilter.length > 0 || dataSourceFilter.length > 0 || 
              sensitivityFilter.length > 0 || classificationFilter.length > 0) && (
              <Chip
                size="small"
                label={entityTypeFilter.length + dataSourceFilter.length + 
                      sensitivityFilter.length + classificationFilter.length}
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
              getEntities({
                search: searchTerm,
                entity_types: entityTypeFilter.length > 0 ? entityTypeFilter : undefined,
                data_source_ids: dataSourceFilter.length > 0 ? dataSourceFilter : undefined,
                sensitivity_label_ids: sensitivityFilter.length > 0 ? sensitivityFilter : undefined,
                classifications: classificationFilter.length > 0 ? classificationFilter : undefined,
              })
                .then(data => setEntities(data))
                .catch(err => setError(err.response?.data?.detail || 'Failed to refresh entities'))
                .finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
        
        {/* Active Filters Display */}
        {(entityTypeFilter.length > 0 || dataSourceFilter.length > 0 || 
          sensitivityFilter.length > 0 || classificationFilter.length > 0) && (
          <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
            {entityTypeFilter.map(type => (
              <Chip
                key={type}
                size="small"
                icon={getEntityIcon(type)}
                label={`Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                onDelete={() => setEntityTypeFilter(entityTypeFilter.filter(t => t !== type))}
                color="primary"
                variant="outlined"
              />
            ))}
            
            {dataSourceFilter.map(dsId => (
              <Chip
                key={dsId}
                size="small"
                icon={<StorageIcon />}
                label={`Source: ${getDataSourceName(dsId)}`}
                onDelete={() => setDataSourceFilter(dataSourceFilter.filter(id => id !== dsId))}
                color="secondary"
                variant="outlined"
              />
            ))}
            
            {sensitivityFilter.map(labelId => (
              <Chip
                key={labelId}
                size="small"
                icon={<SecurityIcon />}
                label={`Sensitivity: ${getSensitivityLabelName(labelId)}`}
                onDelete={() => setSensitivityFilter(sensitivityFilter.filter(id => id !== labelId))}
                sx={{ 
                  color: getSensitivityLabelColor(labelId),
                  borderColor: getSensitivityLabelColor(labelId)
                }}
                variant="outlined"
              />
            ))}
            
            {classificationFilter.map(classification => (
              <Chip
                key={classification}
                size="small"
                icon={<LabelIcon />}
                label={`Classification: ${classification}`}
                onDelete={() => setClassificationFilter(classificationFilter.filter(c => c !== classification))}
                color="info"
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
          sx: { width: 350, maxHeight: 500, p: 1 },
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Filter Entities
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {/* Entity Type Filter */}
        <FormControl fullWidth size="small" sx={{ px: 2, mb: 2 }}>
          <InputLabel id="entity-type-filter-label">Entity Type</InputLabel>
          <Select
            labelId="entity-type-filter-label"
            multiple
            value={entityTypeFilter}
            onChange={handleEntityTypeFilterChange}
            input={<OutlinedInput label="Entity Type" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip 
                    key={value} 
                    label={value.charAt(0).toUpperCase() + value.slice(1)} 
                    size="small" 
                  />
                ))}
              </Box>
            )}
          >
            {entityTypes.map((type) => (
              <MenuItem key={type} value={type}>
                <Checkbox checked={entityTypeFilter.indexOf(type) > -1} />
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getEntityIcon(type)}
                </ListItemIcon>
                <ListItemText primary={type.charAt(0).toUpperCase() + type.slice(1)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Data Source Filter */}
        <FormControl fullWidth size="small" sx={{ px: 2, mb: 2 }}>
          <InputLabel id="data-source-filter-label">Data Source</InputLabel>
          <Select
            labelId="data-source-filter-label"
            multiple
            value={dataSourceFilter}
            onChange={handleDataSourceFilterChange}
            input={<OutlinedInput label="Data Source" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as number[]).map((value) => (
                  <Chip 
                    key={value} 
                    label={getDataSourceName(value)} 
                    size="small" 
                  />
                ))}
              </Box>
            )}
          >
            {dataSources.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                <Checkbox checked={dataSourceFilter.indexOf(source.id) > -1} />
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <StorageIcon />
                </ListItemIcon>
                <ListItemText primary={source.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Sensitivity Label Filter */}
        <FormControl fullWidth size="small" sx={{ px: 2, mb: 2 }}>
          <InputLabel id="sensitivity-filter-label">Sensitivity</InputLabel>
          <Select
            labelId="sensitivity-filter-label"
            multiple
            value={sensitivityFilter}
            onChange={handleSensitivityFilterChange}
            input={<OutlinedInput label="Sensitivity" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as number[]).map((value) => (
                  <Chip 
                    key={value} 
                    label={getSensitivityLabelName(value)} 
                    size="small" 
                  />
                ))}
              </Box>
            )}
          >
            {sensitivityLabels.map((label) => (
              <MenuItem key={label.id} value={label.id}>
                <Checkbox checked={sensitivityFilter.indexOf(label.id) > -1} />
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SecurityIcon sx={{ color: getSensitivityLabelColor(label.id) }} />
                </ListItemIcon>
                <ListItemText primary={label.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Classification Filter */}
        <FormControl fullWidth size="small" sx={{ px: 2, mb: 2 }}>
          <InputLabel id="classification-filter-label">Classification</InputLabel>
          <Select
            labelId="classification-filter-label"
            multiple
            value={classificationFilter}
            onChange={handleClassificationFilterChange}
            input={<OutlinedInput label="Classification" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip 
                    key={value} 
                    label={value} 
                    size="small" 
                  />
                ))}
              </Box>
            )}
          >
            {availableClassifications.map((classification) => (
              <MenuItem key={classification} value={classification}>
                <Checkbox checked={classificationFilter.indexOf(classification) > -1} />
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LabelIcon />
                </ListItemIcon>
                <ListItemText primary={classification} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Divider sx={{ my: 1 }} />
        
        <Box display="flex" justifyContent="flex-end" gap={1} sx={{ px: 2, py: 1 }}>
          <Button size="small" onClick={handleClearFilters}>
            Clear All
          </Button>
          <Button size="small" variant="contained" onClick={handleFilterMenuClose}>
            Apply Filters
          </Button>
        </Box>
      </Menu>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Entities DataGrid */}
      <Paper variant="outlined" sx={{ height: 600 }}>
        <DataGrid
          rows={entities}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
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
      
      {/* Delete Confirmation Dialog */}
      {entityToDelete && (
        <Dialog
          open={deleteDialogOpen}
          onClose={cancelDeleteEntity}
        >
          <DialogTitle>Delete Entity</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the {entityToDelete.entity_type} <strong>{entityToDelete.name}</strong>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeleteEntity} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDeleteEntity} color="error" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default EntityList;