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
  Badge,
} from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

// Import data source components
import { DataSourceList, DataSourceDetails, DataSourceCreateModal, DataSourceEditModal, DataSourceConnectionTestModal } from '../../components/dataSource';
import { useModal } from '../../hooks/useModal';
import { useDataSources } from '../../hooks/useDataSources';

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
      id={`datasource-tabpanel-${index}`}
      aria-labelledby={`datasource-tab-${index}`}
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
    id: `datasource-tab-${index}`,
    'aria-controls': `datasource-tabpanel-${index}`,
  };
}

const DataSourceManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  const { getDataSourceStats, isLoading, error } = useDataSources();
  
  const [dataSourceStats, setDataSourceStats] = useState<any>(null);
  
  // Determine active tab based on URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/sources')) return 0;
    if (path.includes('/health')) return 1;
    if (path.includes('/settings')) return 2;
    return 0; // Default to sources
  };

  const [value, setValue] = useState(getActiveTabFromPath());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getDataSourceStats();
        setDataSourceStats(stats);
      } catch (error) {
        console.error('Error fetching data source stats:', error);
      }
    };
    
    fetchStats();
  }, [getDataSourceStats]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate to the corresponding route
    switch (newValue) {
      case 0:
        navigate('/data-governance/data-sources/sources');
        break;
      case 1:
        navigate('/data-governance/data-sources/health');
        break;
      case 2:
        navigate('/data-governance/data-sources/settings');
        break;
      default:
        navigate('/data-governance/data-sources/sources');
    }
  };

  const handleCreateDataSource = () => {
    openModal({
      component: DataSourceCreateModal,
      props: {
        onSuccess: () => {
          // Refresh data source list after creation
          getDataSourceStats().then(stats => setDataSourceStats(stats));
        }
      }
    });
  };

  const renderDataSourceStats = () => {
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
          Error loading data source statistics
        </Alert>
      );
    }

    if (!dataSourceStats) return null;

    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Chip 
          icon={<StorageIcon />} 
          label={`${dataSourceStats.totalSources || 0} Sources`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          icon={<CheckCircleIcon />} 
          label={`${dataSourceStats.healthySources || 0} Healthy`} 
          color="success" 
          variant="outlined" 
        />
        <Chip 
          icon={<WarningIcon />} 
          label={`${dataSourceStats.warningSources || 0} Warning`} 
          color="warning" 
          variant="outlined" 
        />
        <Chip 
          icon={<ErrorIcon />} 
          label={`${dataSourceStats.errorSources || 0} Error`} 
          color="error" 
          variant="outlined" 
        />
        <Chip 
          icon={<SyncIcon />} 
          label={`${dataSourceStats.lastSyncTime || 'Never'} Last Sync`} 
          variant="outlined" 
        />
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
          Data Sources
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton 
              size="small"
              onClick={() => {
                getDataSourceStats().then(stats => setDataSourceStats(stats));
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDataSource}
          >
            Add Data Source
          </Button>
        </Box>
      </Box>
      
      {renderDataSourceStats()}
      
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="data source management tabs"
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
              icon={<StorageIcon fontSize="small" />} 
              iconPosition="start" 
              label="Sources" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<SpeedIcon fontSize="small" />} 
              iconPosition="start" 
              label="Health" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<SettingsIcon fontSize="small" />} 
              iconPosition="start" 
              label="Settings" 
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>
        
        <Routes>
          <Route path="/sources" element={
            <Box sx={{ p: 0 }}>
              <DataSourceList />
            </Box>
          } />
          <Route path="/sources/:sourceId" element={
            <Box sx={{ p: 0 }}>
              <DataSourceDetails />
            </Box>
          } />
          <Route path="/health" element={
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Data Source Health</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Monitor the health and connectivity status of your data sources.
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Connection Status</Typography>
                      <Typography variant="body2" paragraph>
                        View the current connection status of all data sources.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<SpeedIcon />}
                        onClick={() => {
                          openModal({
                            component: DataSourceConnectionTestModal,
                            props: {
                              onSuccess: () => {
                                // Refresh after test
                                getDataSourceStats().then(stats => setDataSourceStats(stats));
                              }
                            }
                          });
                        }}
                      >
                        Test Connections
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Health Metrics</Typography>
                      <Typography variant="body2" paragraph>
                        View detailed health metrics for your data sources.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                      >
                        Refresh Metrics
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          } />
          <Route path="/settings" element={
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Data Source Settings</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Configure global settings for data source connections and scanning.
              </Typography>
              
              <Card elevation={2} sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Connection Settings</Typography>
                  <Typography variant="body2" paragraph>
                    Configure default connection settings, timeouts, and retry policies.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                  >
                    Edit Settings
                  </Button>
                </CardContent>
              </Card>
            </Box>
          } />
          <Route path="*" element={
            <Box sx={{ p: 0 }}>
              <DataSourceList />
            </Box>
          } />
        </Routes>
      </Paper>
    </Box>
  );
};

export default DataSourceManagement;