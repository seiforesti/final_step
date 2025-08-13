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
  IconButton,
  Tooltip,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useScans } from '../../hooks/useScans';
import { useModal } from '../../hooks/useModal';
import ScanScheduleModal from './ScanScheduleModal';

interface ScanScheduleListProps {
  dataSourceId?: number;
  ruleSetId?: number;
}

const ScanScheduleList: React.FC<ScanScheduleListProps> = ({ dataSourceId, ruleSetId }) => {
  const { openModal } = useModal();
  const { 
    getScanSchedules, 
    deleteScanSchedule, 
    toggleScanSchedule,
    isLoadingSchedules,
    isDeletingSchedule,
    isTogglingSchedule
  } = useScans();
  
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      if (dataSourceId) filters.data_source_id = dataSourceId;
      if (ruleSetId) filters.scan_rule_set_id = ruleSetId;
      
      const data = await getScanSchedules(filters);
      setSchedules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load scan schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [dataSourceId, ruleSetId]);

  const handleCreateSchedule = () => {
    openModal({
      component: ScanScheduleModal,
      props: {
        dataSourceId,
        ruleSetId,
        onSuccess: loadSchedules
      }
    });
  };

  const handleEditSchedule = (schedule: any) => {
    openModal({
      component: ScanScheduleModal,
      props: {
        scanId: schedule.id,
        dataSourceId: schedule.data_source_id,
        ruleSetId: schedule.scan_rule_set_id,
        onSuccess: loadSchedules
      }
    });
  };

  const handleDeleteClick = (schedule: any) => {
    setSelectedSchedule(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSchedule) return;
    
    try {
      await deleteScanSchedule(selectedSchedule.id);
      loadSchedules();
      setDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete schedule');
    }
  };

  const handleToggleSchedule = async (schedule: any) => {
    try {
      await toggleScanSchedule(schedule.id, !schedule.enabled);
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle schedule status');
    }
  };

  const getFrequencyText = (schedule: any) => {
    switch (schedule.frequency) {
      case 'hourly':
        return 'Every hour';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `Weekly on ${schedule.day_of_week}`;
      case 'monthly':
        return `Monthly on day ${schedule.day_of_month}`;
      case 'once':
        return 'One time';
      default:
        return schedule.cron_expression || 'Custom';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Scan Schedules</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateSchedule}
        >
          Create Schedule
        </Button>
      </Box>

      {error && (
        <Box mb={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {loading || isLoadingSchedules ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : schedules.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Data Source</TableCell>
                <TableCell>Rule Set</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Next Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.name || `Schedule #${schedule.id}`}</TableCell>
                  <TableCell>{schedule.data_source_name}</TableCell>
                  <TableCell>{schedule.scan_rule_set_name}</TableCell>
                  <TableCell>{getFrequencyText(schedule)}</TableCell>
                  <TableCell>
                    {schedule.next_run_time ? format(new Date(schedule.next_run_time), 'PPp') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.enabled ? 'Active' : 'Paused'}
                      color={schedule.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={schedule.enabled ? 'Pause Schedule' : 'Activate Schedule'}>
                      <IconButton
                        onClick={() => handleToggleSchedule(schedule)}
                        disabled={isTogglingSchedule}
                        color="primary"
                      >
                        {schedule.enabled ? <PauseIcon /> : <PlayArrowIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Schedule">
                      <IconButton
                        onClick={() => handleEditSchedule(schedule)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Schedule">
                      <IconButton
                        onClick={() => handleDeleteClick(schedule)}
                        disabled={isDeletingSchedule}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No scan schedules found.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create a schedule to run scans automatically at specified intervals.
          </Typography>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Scan Schedule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this scan schedule? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeletingSchedule}>
            {isDeletingSchedule ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanScheduleList;