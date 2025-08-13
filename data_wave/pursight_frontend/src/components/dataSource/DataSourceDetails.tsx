import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  DataUsage as DataUsageIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useDataSources } from '../../hooks/useDataSources';
import { useScans } from '../../hooks/useScans';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { useModal } from '../../hooks/useModal';
import DataSourceConnectionTestModal from './DataSourceConnectionTestModal';
import DataSourceEditModal from './DataSourceEditModal';
import ScanRuleSetList from '../scanRuleSet/ScanRuleSetList';
import { ScanList, ScanScheduleList } from '../scan';
import { formatDistanceToNow, format } from 'date-fns';

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
      id={`data-source-tabpanel-${index}`}
      aria-labelledby={`data-source-tab-${index}`}
      {...other}
      style={{ height: 'calc(100% - 48px)', overflow: 'auto' }}
    >
      {value === index && <Box sx={{ p: 3, height: '100%' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `data-source-tab-${index}`,
    'aria-controls': `data-source-tabpanel-${index}`,
  };
}

const DataSourceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dataSourceId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { openModal } = useModal();
  
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const {
    fetchDataSourceDetails,
    fetchDataSourceDetailStats,
    fetchDataSourceHealth,
    deleteDataSource,
    testConnection,
    isDeletingDataSource,
  } = useDataSources();
  
  const { data: dataSource, isLoading: isDataSourceLoading } = fetchDataSourceDetails(dataSourceId);
  const { data: dataSourceStats, isLoading: isDataSourceStatsLoading } = fetchDataSourceDetailStats(dataSourceId);
  const { data: dataSourceHealth, isLoading: isDataSourceHealthLoading } = fetchDataSourceHealth(dataSourceId);
  
  const { startScan, isStartingScan } = useScans();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    navigate('/data-sources');
  };

  const handleEditDataSource = () => {
    if (!dataSource) return;
    
    openModal({
      component: DataSourceEditModal,
      props: {
        dataSource,
        onSuccess: () => {
          // Refresh data
        }
      }
    });
  };

  const handleTestConnection = () => {
    openModal({
      component: DataSourceConnectionTestModal,
      props: {
        dataSourceId,
        testConnection
      }
    });
  };

  const handleStartScan = async () => {
    try {
      // This is a simplified version. In a real implementation, you would
      // need to select a rule set or create a new one before starting a scan.
      await startScan({
        data_source_id: dataSourceId,
        rule_set_id: 1, // This should be selected by the user
        description: `Manual scan initiated on ${new Date().toISOString()}`
      });
    } catch (error) {
      console.error('Failed to start scan:', error);
    }
  };

  const handleDeleteDataSource = async () => {
    try {
      await deleteDataSource(dataSourceId);
      navigate('/data-sources');
    } catch (error) {
      console.error('Failed to delete data source:', error);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  if (isDataSourceLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (!dataSource) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Data source not found. It may have been deleted or you don't have permission to view it.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Data Sources
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {dataSource.name}
          </Typography>
          <Chip
            label={dataSource.source_type.toUpperCase()}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
          <Chip
            label={dataSource.status}
            color={dataSource.status === 'active' ? 'success' : dataSource.status === 'error' ? 'error' : 'warning'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {dataSource.description || 'No description provided'}
          </Typography>
          
          <Box>
            <Tooltip title="Test Connection">
              <IconButton onClick={handleTestConnection} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Data Source">
              <IconButton onClick={handleEditDataSource} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Data Source">
              <IconButton onClick={handleOpenDeleteDialog} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartScan}
              disabled={isStartingScan}
              sx={{ ml: 2 }}
            >
              {isStartingScan ? 'Starting...' : 'Start Scan'}
            </Button>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="data source tabs"
          sx={{ bgcolor: 'background.paper' }}
        >
          <Tab label="Overview" icon={<StorageIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Scans" icon={<DataUsageIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Schedules" icon={<ScheduleIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Rule Sets" icon={<SettingsIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" {...a11yProps(4)} />
        </Tabs>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Connection Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Host
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {dataSource.host}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Port
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {dataSource.port}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Database
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {dataSource.database_name || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Username
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {dataSource.username}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {dataSource.location === 'on-premise' ? 'On-Premise' : 'Cloud'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {dataSource.created_at ? format(new Date(dataSource.created_at), 'PPpp') : 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {dataSource.updated_at ? formatDistanceToNow(new Date(dataSource.updated_at), { addSuffix: true }) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {isDataSourceStatsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                  </Box>
                ) : dataSourceStats ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Entities
                      </Typography>
                      <Typography variant="h4">
                        {dataSourceStats.entity_stats.total_entities.toLocaleString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Size
                      </Typography>
                      <Typography variant="h4">
                        {dataSourceStats.size_stats.total_size_formatted}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tables
                      </Typography>
                      <Typography variant="body1">
                        {dataSourceStats.entity_stats.tables.toLocaleString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Views
                      </Typography>
                      <Typography variant="body1">
                        {dataSourceStats.entity_stats.views.toLocaleString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Stored Procedures
                      </Typography>
                      <Typography variant="body1">
                        {dataSourceStats.entity_stats.stored_procedures.toLocaleString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Scan
                      </Typography>
                      <Typography variant="body1">
                        {dataSourceStats.last_scan_time ? formatDistanceToNow(new Date(dataSourceStats.last_scan_time), { addSuffix: true }) : 'Never'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Classified Columns
                      </Typography>
                      <Typography variant="body1">
                        {dataSourceStats.classification_stats?.classified_columns.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Sensitive Columns
                      </Typography>
                      <Typography variant="body1">
                        {dataSourceStats.sensitivity_stats?.sensitive_columns.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Compliance Score
                      </Typography>
                      <Typography variant="body1">
                        {dataSourceStats.compliance_stats?.compliance_score || 'N/A'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Health Status
                      </Typography>
                      <Chip
                        label={dataSourceHealth?.status || 'Unknown'}
                        color={
                          dataSourceHealth?.status === 'healthy' ? 'success' :
                          dataSourceHealth?.status === 'warning' ? 'warning' :
                          dataSourceHealth?.status === 'critical' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No statistics available. Run a scan to collect data.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ScanList dataSourceId={dataSourceId} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ScanScheduleList dataSourceId={dataSourceId} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <ScanRuleSetList dataSourceId={dataSourceId} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6">Security & Access Control</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            This section will contain security settings and access control for this data source.
          </Typography>
        </TabPanel>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Data Source
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the data source "{dataSource.name}"? This action cannot be undone and will remove all associated scans, schedules, and rule sets.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDataSource}
            color="error"
            variant="contained"
            autoFocus
            disabled={isDeletingDataSource}
            startIcon={isDeletingDataSource ? <CircularProgress size={20} /> : null}
          >
            {isDeletingDataSource ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataSourceDetails;