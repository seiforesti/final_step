import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useScans } from '../../hooks/useScans';

interface ScanListProps {
  scans: any[];
  dataSourceId?: number;
  ruleSetId?: number;
  onScanComplete?: () => void;
}

const ScanList: React.FC<ScanListProps> = ({
  scans: initialScans,
  dataSourceId,
  ruleSetId,
  onScanComplete,
}) => {
  const navigate = useNavigate();
  const { 
    cancelScan, 
    deleteScan, 
    startScan, 
    getScanById,
    isCancelingScan,
    isDeletingScan,
    isStartingScan,
  } = useScans();
  
  const [scans, setScans] = useState<any[]>(initialScans);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, scan: any) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedScan(scan);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewDetails = () => {
    handleMenuClose();
    if (selectedScan) {
      navigate(`/scans/${selectedScan.id}`);
    }
  };

  const handleCancelScan = async () => {
    if (!selectedScan) return;
    
    try {
      setError(null);
      await cancelScan(selectedScan.id);
      
      // Update the scan status in the list
      const updatedScan = await getScanById(selectedScan.id);
      setScans(scans.map(scan => scan.id === updatedScan.id ? updatedScan : scan));
      
      onScanComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel scan');
    } finally {
      setCancelDialogOpen(false);
    }
  };

  const handleDeleteScan = async () => {
    if (!selectedScan) return;
    
    try {
      setError(null);
      await deleteScan(selectedScan.id);
      
      // Remove the scan from the list
      setScans(scans.filter(scan => scan.id !== selectedScan.id));
      
      onScanComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete scan');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleRestartScan = async () => {
    if (!selectedScan) return;
    
    try {
      setError(null);
      const newScan = await startScan({
        data_source_id: selectedScan.data_source_id,
        scan_rule_set_id: selectedScan.scan_rule_set_id,
      });
      
      // Add the new scan to the list
      setScans([newScan, ...scans]);
      
      onScanComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to restart scan');
    } finally {
      setRestartDialogOpen(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Refresh all scans in the list
      const updatedScans = await Promise.all(
        scans.map(scan => getScanById(scan.id))
      );
      
      setScans(updatedScans);
      onScanComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refresh scans');
    } finally {
      setLoading(false);
    }
  };

  const getScanStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'running':
      case 'queued':
        return 'primary';
      case 'failed':
      case 'cancelled':
        return 'error';
      case 'scheduled':
        return 'info';
      default:
        return 'default';
    }
  };

  const getScanProgress = (scan: any) => {
    if (!scan.scan_result) return 0;
    
    if (scan.status.toLowerCase() === 'completed') {
      return 100;
    } else if (scan.status.toLowerCase() === 'running' && scan.scan_result.progress) {
      return scan.scan_result.progress;
    }
    
    return 0;
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={getScanStatusColor(params.value as string) as any}
          size="small"
        />
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const scan = params.row;
        const progress = getScanProgress(scan);
        
        return (
          <Box sx={{ width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'created_at',
      headerName: 'Start Time',
      width: 180,
      valueFormatter: (params) => {
        return format(new Date(params.value as string), 'PPp');
      },
    },
    {
      field: 'completed_at',
      headerName: 'End Time',
      width: 180,
      valueFormatter: (params) => {
        return params.value ? format(new Date(params.value as string), 'PPp') : '-';
      },
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 150,
      valueGetter: (params) => {
        const scan = params.row;
        if (!scan.completed_at && scan.status.toLowerCase() !== 'running') {
          return '-';
        }
        
        const startTime = new Date(scan.created_at).getTime();
        const endTime = scan.completed_at 
          ? new Date(scan.completed_at).getTime() 
          : new Date().getTime();
        
        const durationMs = endTime - startTime;
        const seconds = Math.floor(durationMs / 1000);
        
        if (seconds < 60) {
          return `${seconds}s`;
        } else if (seconds < 3600) {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return `${minutes}m ${remainingSeconds}s`;
        } else {
          const hours = Math.floor(seconds / 3600);
          const remainingMinutes = Math.floor((seconds % 3600) / 60);
          return `${hours}h ${remainingMinutes}m`;
        }
      },
    },
    {
      field: 'entities_scanned',
      headerName: 'Entities Scanned',
      width: 150,
      valueGetter: (params) => {
        const scan = params.row;
        return scan.scan_result?.entities_scanned || 0;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(event) => handleMenuOpen(event, params.row)}
          aria-label="actions"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <DataGrid
          rows={scans}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
            sorting: {
              sortModel: [{ field: 'created_at', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          autoHeight
          loading={loading}
          sx={{ minHeight: 400 }}
        />
      </Paper>
      
      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        {selectedScan && selectedScan.status.toLowerCase() === 'running' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            setCancelDialogOpen(true);
          }}>
            <ListItemIcon>
              <CancelIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Cancel Scan</ListItemText>
          </MenuItem>
        )}
        
        {selectedScan && ['completed', 'failed', 'cancelled'].includes(selectedScan.status.toLowerCase()) && (
          <MenuItem onClick={() => {
            handleMenuClose();
            setRestartDialogOpen(true);
          }}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Restart Scan</ListItemText>
          </MenuItem>
        )}
        
        {selectedScan && selectedScan.status.toLowerCase() === 'completed' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            // Handle download scan results
          }}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download Results</ListItemText>
          </MenuItem>
        )}
        
        {selectedScan && ['completed', 'failed', 'cancelled'].includes(selectedScan.status.toLowerCase()) && (
          <MenuItem onClick={() => {
            handleMenuClose();
            setDeleteDialogOpen(true);
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Scan</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancel Scan
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this scan? This will stop the scanning process and mark it as cancelled.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">
            No, Continue Scan
          </Button>
          <Button 
            onClick={handleCancelScan} 
            color="error" 
            variant="contained"
            disabled={isCancelingScan}
            startIcon={isCancelingScan ? <CircularProgress size={20} /> : null}
          >
            {isCancelingScan ? 'Cancelling...' : 'Yes, Cancel Scan'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Scan
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this scan? This will permanently remove the scan and its results from the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteScan} 
            color="error" 
            variant="contained"
            disabled={isDeletingScan}
            startIcon={isDeletingScan ? <CircularProgress size={20} /> : null}
          >
            {isDeletingScan ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Restart Confirmation Dialog */}
      <Dialog
        open={restartDialogOpen}
        onClose={() => setRestartDialogOpen(false)}
        aria-labelledby="restart-dialog-title"
      >
        <DialogTitle id="restart-dialog-title">
          Restart Scan
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to start a new scan with the same configuration? This will create a new scan entry.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestartDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleRestartScan} 
            color="primary" 
            variant="contained"
            disabled={isStartingScan}
            startIcon={isStartingScan ? <CircularProgress size={20} /> : null}
          >
            {isStartingScan ? 'Starting...' : 'Start New Scan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanList;