import React, { useState, useEffect } from 'react';
import { useDataSources } from '../../hooks/useDataSources';
import { Box, Typography, Button, TextField, IconButton, Chip, Tooltip, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import FilterDropdown from '../common/FilterDropdown';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import DataSourceCreateModal from './DataSourceCreateModal';
import DataSourceConnectionTestModal from './DataSourceConnectionTestModal';
import { formatDistanceToNow } from 'date-fns';

const DataSourceList: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const {
    dataSources,
    isDataSourcesLoading,
    refreshAllDataSourceData,
    updateFilters,
    clearFilters,
    canCreateDataSource,
    testConnection
  } = useDataSources({
    refreshInterval: 30000, // 30 seconds
  });

  // Apply search filter with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilters({ search: searchTerm || undefined });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, updateFilters]);

  // Apply type and status filters
  useEffect(() => {
    updateFilters({
      type: typeFilter || undefined,
      status: statusFilter as any || undefined
    });
  }, [typeFilter, statusFilter, updateFilters]);

  const handleCreateDataSource = () => {
    openModal({
      component: DataSourceCreateModal,
      props: {
        onSuccess: () => {
          refreshAllDataSourceData();
        }
      }
    });
  };

  const handleTestConnection = async (id: number) => {
    openModal({
      component: DataSourceConnectionTestModal,
      props: {
        dataSourceId: id,
        testConnection
      }
    });
  };

  const handleViewDetails = (id: number) => {
    navigate(`/data-sources/${id}`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter(null);
    setStatusFilter(null);
    clearFilters();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { 
      field: 'source_type', 
      headerName: 'Type', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const type = params.value as string;
        let color = 'default';
        
        switch (type.toLowerCase()) {
          case 'mysql':
            color = 'primary';
            break;
          case 'postgresql':
            color = 'secondary';
            break;
          case 'mongodb':
            color = 'success';
            break;
          default:
            color = 'default';
        }
        
        return <Chip label={type} color={color as any} size="small" />;
      }
    },
    { field: 'host', headerName: 'Host', width: 180 },
    { field: 'port', headerName: 'Port', width: 100 },
    { field: 'database_name', headerName: 'Database', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        let color = 'default';
        
        switch (status.toLowerCase()) {
          case 'active':
            color = 'success';
            break;
          case 'inactive':
            color = 'warning';
            break;
          case 'error':
            color = 'error';
            break;
          case 'pending':
            color = 'info';
            break;
          default:
            color = 'default';
        }
        
        return <Chip label={status} color={color as any} size="small" />;
      }
    },
    { 
      field: 'last_scan', 
      headerName: 'Last Scan', 
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const lastScan = params.value as string;
        return lastScan ? formatDistanceToNow(new Date(lastScan), { addSuffix: true }) : 'Never';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Test Connection">
            <IconButton
              onClick={() => handleTestConnection(params.row.id)}
              size="small"
              color="primary"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Details">
            <IconButton
              onClick={() => handleViewDetails(params.row.id)}
              size="small"
              color="primary"
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const typeOptions = [
    { label: 'All Types', value: null },
    { label: 'MySQL', value: 'mysql' },
    { label: 'PostgreSQL', value: 'postgresql' },
    { label: 'MongoDB', value: 'mongodb' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Error', value: 'error' },
    { label: 'Pending', value: 'pending' },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Data Sources
        </Typography>
        {canCreateDataSource && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDataSource}
          >
            Add Data Source
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', mb: 2, gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        
        <FilterDropdown
          label="Type"
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          startIcon={<FilterIcon fontSize="small" />}
        />
        
        <FilterDropdown
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          startIcon={<FilterIcon fontSize="small" />}
        />
        
        <Tooltip title="Clear Filters">
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </Tooltip>
        
        <Tooltip title="Refresh">
          <IconButton onClick={refreshAllDataSourceData} size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        {isDataSourcesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={dataSources || []}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection={false}
            disableRowSelectionOnClick
            autoHeight
          />
        )}
      </Box>
    </Box>
  );
};

export default DataSourceList;