import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  TableChart as TableChartIcon,
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ScanEntitiesViewProps {
  scanId: number;
  entities: any[];
  isLoading?: boolean;
  error?: string | null;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

const ScanEntitiesView: React.FC<ScanEntitiesViewProps> = ({
  scanId,
  entities,
  isLoading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterTypeSelect = (type: string | null) => {
    setFilterType(type);
    setFilterAnchorEl(null);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleEntityDetails = (entity: any) => {
    setSelectedEntity(entity);
    setDetailsDialogOpen(true);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  const getEntityTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'table':
        return <TableChartIcon fontSize="small" />;
      case 'column':
        return <DataObjectIcon fontSize="small" />;
      case 'schema':
        return <StorageIcon fontSize="small" />;
      default:
        return <StorageIcon fontSize="small" />;
    }
  };

  const getFilteredEntities = () => {
    if (!entities) return [];

    return entities
      .filter(entity => {
        // Apply search filter
        const matchesSearch = searchTerm === '' ||
          entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entity.path && entity.path.toLowerCase().includes(searchTerm.toLowerCase()));

        // Apply type filter
        const matchesType = !filterType || entity.type.toLowerCase() === filterType.toLowerCase();

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        // Apply sorting
        const key = sortConfig.key as keyof typeof a;
        if (a[key] === undefined || b[key] === undefined) return 0;

        if (typeof a[key] === 'string') {
          const comparison = a[key].localeCompare(b[key]);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        } else {
          const comparison = (a[key] || 0) - (b[key] || 0);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
      });
  };

  const filteredEntities = getFilteredEntities();
  const paginatedEntities = filteredEntities.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredEntities.length / rowsPerPage);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading entities...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!entities || entities.length === 0) {
    return (
      <Alert severity="info">
        No entities found in this scan.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Entities ({filteredEntities.length})
        </Typography>

        <Box display="flex" alignItems="center">
          <TextField
            size="small"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2, width: '250px' }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            color={filterType ? 'primary' : 'inherit'}
            size="small"
            sx={{ mr: 2 }}
          >
            {filterType || 'Filter'}
          </Button>

          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilterTypeSelect(null)}>
              <ListItemText primary="All Types" />
            </MenuItem>
            <MenuItem onClick={() => handleFilterTypeSelect('table')}>
              <ListItemIcon>
                <TableChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Tables" />
            </MenuItem>
            <MenuItem onClick={() => handleFilterTypeSelect('column')}>
              <ListItemIcon>
                <DataObjectIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Columns" />
            </MenuItem>
            <MenuItem onClick={() => handleFilterTypeSelect('schema')}>
              <ListItemIcon>
                <StorageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Schemas" />
            </MenuItem>
          </Menu>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
          >
            Export
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('type')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center">
                  Type {getSortIcon('type')}
                </Box>
              </TableCell>
              <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center">
                  Name {getSortIcon('name')}
                </Box>
              </TableCell>
              <TableCell onClick={() => handleSort('path')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center">
                  Path {getSortIcon('path')}
                </Box>
              </TableCell>
              <TableCell onClick={() => handleSort('row_count')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center">
                  Rows {getSortIcon('row_count')}
                </Box>
              </TableCell>
              <TableCell onClick={() => handleSort('column_count')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center">
                  Columns {getSortIcon('column_count')}
                </Box>
              </TableCell>
              <TableCell onClick={() => handleSort('size_bytes')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center">
                  Size {getSortIcon('size_bytes')}
                </Box>
              </TableCell>
              <TableCell>Classifications</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEntities.map((entity, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getEntityTypeIcon(entity.type)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {entity.type}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{entity.name}</TableCell>
                <TableCell>{entity.path || '-'}</TableCell>
                <TableCell>{entity.row_count || '-'}</TableCell>
                <TableCell>{entity.column_count || '-'}</TableCell>
                <TableCell>
                  {entity.size_bytes ? `${(entity.size_bytes / 1024 / 1024).toFixed(2)} MB` : '-'}
                </TableCell>
                <TableCell>
                  {entity.classifications?.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {entity.classifications.slice(0, 2).map((classification: string, i: number) => (
                        <Chip
                          key={i}
                          label={classification}
                          size="small"
                          color={classification.toLowerCase().includes('sensitive') ? 'error' : 'default'}
                          variant="outlined"
                        />
                      ))}
                      {entity.classifications.length > 2 && (
                        <Chip
                          label={`+${entity.classifications.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleEntityDetails(entity)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Entity Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEntity && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                {getEntityTypeIcon(selectedEntity.type)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedEntity.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Basic Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Type
                        </Typography>
                        <Typography variant="body1">
                          {selectedEntity.type}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Path
                        </Typography>
                        <Typography variant="body1">
                          {selectedEntity.path || '-'}
                        </Typography>
                      </Grid>
                      {selectedEntity.type.toLowerCase() === 'table' && (
                        <>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Rows
                            </Typography>
                            <Typography variant="body1">
                              {selectedEntity.row_count || '-'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Columns
                            </Typography>
                            <Typography variant="body1">
                              {selectedEntity.column_count || '-'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Size
                            </Typography>
                            <Typography variant="body1">
                              {selectedEntity.size_bytes ? `${(selectedEntity.size_bytes / 1024 / 1024).toFixed(2)} MB` : '-'}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Paper>
                </Grid>

                {selectedEntity.classifications?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Classifications
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {selectedEntity.classifications.map((classification: string, i: number) => (
                          <Chip
                            key={i}
                            label={classification}
                            color={classification.toLowerCase().includes('sensitive') ? 'error' : 'default'}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {selectedEntity.columns?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Columns
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Data Type</TableCell>
                            <TableCell>Nullable</TableCell>
                            <TableCell>Classifications</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedEntity.columns.map((column: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>{column.name}</TableCell>
                              <TableCell>{column.data_type}</TableCell>
                              <TableCell>{column.is_nullable ? 'Yes' : 'No'}</TableCell>
                              <TableCell>
                                {column.classifications?.length > 0 ? (
                                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {column.classifications.map((classification: string, j: number) => (
                                      <Chip
                                        key={j}
                                        label={classification}
                                        size="small"
                                        color={classification.toLowerCase().includes('sensitive') ? 'error' : 'default'}
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                ) : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}

                {selectedEntity.sample_data?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sample Data
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {Object.keys(selectedEntity.sample_data[0]).map((key, i) => (
                              <TableCell key={i}>{key}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedEntity.sample_data.map((row: any, i: number) => (
                            <TableRow key={i}>
                              {Object.values(row).map((value: any, j: number) => (
                                <TableCell key={j}>
                                  {value === null ? 'NULL' : String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}

                {selectedEntity.issues?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Issues
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      {selectedEntity.issues.map((issue: any, i: number) => (
                        <Alert
                          key={i}
                          severity={issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'info'}
                          sx={{ mb: i < selectedEntity.issues.length - 1 ? 2 : 0 }}
                        >
                          <Typography variant="subtitle2">
                            {issue.title}
                          </Typography>
                          <Typography variant="body2">
                            {issue.description}
                          </Typography>
                        </Alert>
                      ))}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ScanEntitiesView;