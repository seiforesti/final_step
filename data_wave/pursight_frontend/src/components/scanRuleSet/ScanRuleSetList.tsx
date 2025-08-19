import React, { useState, useEffect } from 'react';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { Box, Typography, Button, TextField, IconButton, Chip, Tooltip, CircularProgress, Paper } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon, FilterList as FilterIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useModal } from '../../hooks/useModal';
import ScanRuleSetCreateModal from './ScanRuleSetCreateModal';
import ScanRuleSetEditModal from './ScanRuleSetEditModal';
import { formatDistanceToNow } from 'date-fns';

interface ScanRuleSetListProps {
  dataSourceId?: number;
}

const ScanRuleSetList: React.FC<ScanRuleSetListProps> = ({ dataSourceId }) => {
  const { openModal } = useModal();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    scanRuleSets,
    isScanRuleSetsLoading,
    refreshAllScanRuleSetData,
    updateFilters,
    clearFilters,
    canCreateScanRuleSet,
    canDeleteScanRuleSet,
    deleteScanRuleSet
  } = useScanRuleSets({
    initialFilters: dataSourceId ? { data_source_id: dataSourceId } : {},
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

  // Apply data source filter if provided
  useEffect(() => {
    if (dataSourceId) {
      updateFilters({ data_source_id: dataSourceId });
    }
  }, [dataSourceId, updateFilters]);

  const handleCreateRuleSet = () => {
    openModal({
      component: ScanRuleSetCreateModal,
      props: {
        dataSourceId,
        onSuccess: () => {
          refreshAllScanRuleSetData();
        }
      }
    });
  };

  const handleEditRuleSet = (ruleSet: any) => {
    openModal({
      component: ScanRuleSetEditModal,
      props: {
        ruleSet,
        onSuccess: () => {
          refreshAllScanRuleSetData();
        }
      }
    });
  };

  const handleDeleteRuleSet = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this rule set? This action cannot be undone.')) {
      try {
        await deleteScanRuleSet(id);
        refreshAllScanRuleSetData();
      } catch (error) {
        console.error('Failed to delete rule set:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { 
      field: 'is_global', 
      headerName: 'Scope', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const isGlobal = params.value as boolean;
        return (
          <Chip 
            label={isGlobal ? 'Global' : 'Data Source'} 
            color={isGlobal ? 'primary' : 'default'} 
            size="small" 
          />
        );
      }
    },
    { 
      field: 'data_source_name', 
      headerName: 'Data Source', 
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const dataSourceName = params.value as string;
        return dataSourceName || 'N/A';
      }
    },
    { 
      field: 'include_patterns', 
      headerName: 'Include Patterns', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const patterns = params.value as string[];
        return patterns && patterns.length > 0 ? (
          <Tooltip title={patterns.join('\n')}>
            <Typography variant="body2" noWrap>
              {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        );
      }
    },
    { 
      field: 'exclude_patterns', 
      headerName: 'Exclude Patterns', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const patterns = params.value as string[];
        return patterns && patterns.length > 0 ? (
          <Tooltip title={patterns.join('\n')}>
            <Typography variant="body2" noWrap>
              {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        );
      }
    },
    { 
      field: 'created_at', 
      headerName: 'Created', 
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const createdAt = params.value as string;
        return createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : 'N/A';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Edit Rule Set">
            <IconButton
              onClick={() => handleEditRuleSet(params.row)}
              size="small"
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canDeleteScanRuleSet && (
            <Tooltip title="Delete Rule Set">
              <IconButton
                onClick={() => handleDeleteRuleSet(params.row.id)}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          {dataSourceId ? 'Data Source Rule Sets' : 'Scan Rule Sets'}
        </Typography>
        {canCreateScanRuleSet && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateRuleSet}
          >
            Add Rule Set
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
        
        <Tooltip title="Refresh">
          <IconButton onClick={refreshAllScanRuleSetData} size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        {isScanRuleSetsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : scanRuleSets && scanRuleSets.length > 0 ? (
          <DataGrid
            rows={scanRuleSets}
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
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No scan rule sets found. {canCreateScanRuleSet && 'Create a new rule set to get started.'}
            </Typography>
            {canCreateScanRuleSet && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateRuleSet}
                sx={{ mt: 2 }}
              >
                Add Rule Set
              </Button>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ScanRuleSetList;