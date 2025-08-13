import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Divider,
  useTheme,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

// Import scan components
import { ScanList, ScanDetails, ScanCreateModal, ScanScheduleModal, ScanEntitiesView, ScanResultsView } from '../../components/scan';
import { useModal } from '../../hooks/useModal';
import { useScans } from '../../hooks/useScans';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scan-tabpanel-${index}`}
      aria-labelledby={`scan-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, width: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `scan-tab-${index}`,
    'aria-controls': `scan-tabpanel-${index}`,
  };
}

const ScanManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  const { getScanStats, isLoading, error } = useScans();
  
  const [scanStats, setScanStats] = useState<any>(null);
  
  // Determine active tab based on URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/active')) return 0;
    if (path.includes('/history')) return 1;
    if (path.includes('/schedule')) return 2;
    return 0; // Default to active
  };

  const [value, setValue] = useState(getActiveTabFromPath());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getScanStats();
        setScanStats(stats);
      } catch (error) {
        console.error('Error fetching scan stats:', error);
      }
    };
    
    fetchStats();
  }, [getScanStats]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate to the corresponding route
    switch (newValue) {
      case 0:
        navigate('/data-governance/scans/active');
        break;
      case 1:
        navigate('/data-governance/scans/history');
        break;
      case 2:
        navigate('/data-governance/scans/schedule');
        break;
      default:
        navigate('/data-governance/scans/active');
    }
  };

  const handleCreateScan = () => {
    openModal({
      component: ScanCreateModal,
      props: {
        onSuccess: () => {
          // Refresh scan list after creation
          getScanStats().then(stats => setScanStats(stats));
        }
      }
    });
  };

  const handleScheduleScan = () => {
    openModal({
      component: ScanScheduleModal,
      props: {
        onSuccess: () => {
          // Refresh scan list after scheduling
          getScanStats().then(stats => setScanStats(stats));
        }
      }
    });
  };

  const renderScanStats = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading scan statistics
        </Alert>
      );
    }

    if (!scanStats) return null;

    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Chip 
          icon={<PlayArrowIcon />} 
          label={`${scanStats.runningScans || 0} Running`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          icon={<PendingIcon />} 
          label={`${scanStats.pendingScans || 0} Pending`} 
          color="info" 
          variant="outlined" 
        />
        <Chip 
          icon={<CheckCircleIcon />} 
          label={`${scanStats.completedScans || 0} Completed`} 
          color="success" 
          variant="outlined" 
        />
        <Chip 
          icon={<ErrorIcon />} 
          label={`${scanStats.failedScans || 0} Failed`} 
          color="error" 
          variant="outlined" 
        />
        <Chip 
          icon={<ScheduleIcon />} 
          label={`${scanStats.scheduledScans || 0} Scheduled`} 
          variant="outlined" 
        />
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
          Scan Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton 
              size="small"
              onClick={() => {
                getScanStats().then(stats => setScanStats(stats));
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ScheduleIcon />}
            onClick={handleScheduleScan}
            sx={{ mr: 1 }}
          >
            Schedule
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateScan}
          >
            New Scan
          </Button>
        </Box>
      </Box>
      
      {renderScanStats()}
      
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="scan management tabs"
            sx={{
              '& .MuiTab-root': {
                minHeight: '48px',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
              },
              '& .Mui-selected': {
                fontWeight: 600,
              }
            }}
          >
            <Tab 
              icon={<PlayArrowIcon fontSize="small" />} 
              iconPosition="start" 
              label="Active Scans" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<HistoryIcon fontSize="small" />} 
              iconPosition="start" 
              label="Scan History" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<ScheduleIcon fontSize="small" />} 
              iconPosition="start" 
              label="Scheduled Scans" 
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>
        
        <Routes>
          <Route path="/active" element={
            <Box sx={{ p: 0 }}>
              <ScanList filterType="active" />
            </Box>
          } />
          <Route path="/active/:scanId" element={
            <Box sx={{ p: 0 }}>
              <ScanDetails />
            </Box>
          } />
          <Route path="/history" element={
            <Box sx={{ p: 0 }}>
              <ScanList filterType="history" />
            </Box>
          } />
          <Route path="/history/:scanId" element={
            <Box sx={{ p: 0 }}>
              <ScanDetails />
            </Box>
          } />
          <Route path="/schedule" element={
            <Box sx={{ p: 0 }}>
              <ScanList filterType="scheduled" />
            </Box>
          } />
          <Route path="/schedule/:scanId" element={
            <Box sx={{ p: 0 }}>
              <ScanDetails />
            </Box>
          } />
          <Route path="/:scanId/entities" element={
            <Box sx={{ p: 0 }}>
              <ScanEntitiesView />
            </Box>
          } />
          <Route path="/:scanId/results" element={
            <Box sx={{ p: 0 }}>
              <ScanResultsView />
            </Box>
          } />
          <Route path="*" element={
            <Box sx={{ p: 0 }}>
              <ScanList filterType="active" />
            </Box>
          } />
        </Routes>
      </Paper>
      
      {/* Active Scan Progress Section */}
      {scanStats && scanStats.runningScans > 0 && (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Active Scan Progress</Typography>
              <Chip 
                label={`${scanStats.runningScans} Running`} 
                color="primary" 
                size="small" 
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Overall Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={scanStats.overallProgress || 0} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="textSecondary">
                    {`${Math.round(scanStats.overallProgress || 0)}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/data-governance/scans/active')}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ScanManagement;