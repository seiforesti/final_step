import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  IconButton,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useScans } from '../../hooks/useScans';
import { useDataSources } from '../../hooks/useDataSources';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { format, formatDistance } from 'date-fns';
import ScanCreateModal from './ScanCreateModal';

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
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `scan-tab-${index}`,
    'aria-controls': `scan-tabpanel-${index}`,
  };
}

const ScanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const scanId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  
  const { 
    getScanById, 
    cancelScan, 
    deleteScan, 
    getScanResults,
    isLoadingScan,
    isCancelingScan,
    isDeletingScan,
  } = useScans();
  
  const { getDataSourceById } = useDataSources();
  const { getScanRuleSetById } = useScanRuleSets();
  
  const [scan, setScan] = useState<any>(null);
  const [dataSource, setDataSource] = useState<any>(null);
  const [ruleSet, setRuleSet] = useState<any>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [restartModalOpen, setRestartModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const loadScan = async () => {
    try {
      setError(null);
      const data = await getScanById(scanId);
      setScan(data);
      
      // Load data source
      if (data.data_source_id) {
        const sourceData = await getDataSourceById(data.data_source_id);
        setDataSource(sourceData);
      }
      
      // Load rule set
      if (data.scan_rule_set_id) {
        const ruleSetData = await getScanRuleSetById(data.scan_rule_set_id);
        setRuleSet(ruleSetData);
      }
      
      // Load scan results
      if (data.id) {
        const resultsData = await getScanResults(data.id);
        setScanResults(resultsData);
      }
      
      // Set up auto-refresh for running scans
      if (data.status.toLowerCase() === 'running') {
        if (!refreshInterval) {
          const interval = setInterval(() => {
            loadScan();
          }, 5000); // Refresh every 5 seconds
          setRefreshInterval(interval);
        }
      } else if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load scan details');
    }
  };

  useEffect(() => {
    if (scanId) {
      loadScan();
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [scanId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelScan = async () => {
    try {
      await cancelScan(scanId);
      loadScan();
      setCancelDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel scan');
    }
  };

  const handleDeleteScan = async () => {
    try {
      await deleteScan(scanId);
      navigate('/scans');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete scan');
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

  const getScanProgress = () => {
    if (!scan || !scan.scan_result) return 0;
    
    if (scan.status.toLowerCase() === 'completed') {
      return 100;
    } else if (scan.status.toLowerCase() === 'running' && scan.scan_result.progress) {
      return scan.scan_result.progress;
    }
    
    return 0;
  };

  const getScanDuration = () => {
    if (!scan) return '-';
    
    const startTime = new Date(scan.created_at).getTime();
    const endTime = scan.completed_at 
      ? new Date(scan.completed_at).getTime() 
      : scan.status.toLowerCase() === 'running' ? new Date().getTime() : startTime;
    
    const durationMs = endTime - startTime;
    const seconds = Math.floor(durationMs / 1000);
    
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
  };

  if (isLoadingScan || !scan) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading scan details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/scans')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Scan Details
        </Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" gutterBottom>
                Scan #{scan.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {scan.description || 'No description provided'}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Chip 
                  label={scan.status} 
                  color={getScanStatusColor(scan.status) as any}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Started: {format(new Date(scan.created_at), 'PPp')}
                </Typography>
                {scan.completed_at && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Completed: {format(new Date(scan.completed_at), 'PPp')}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box>
              {scan.status.toLowerCase() === 'running' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setCancelDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
              )}
              
              {['completed', 'failed', 'cancelled'].includes(scan.status.toLowerCase()) && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => setRestartModalOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Restart
                </Button>
              )}
              
              {scan.status.toLowerCase() === 'completed' && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ mr: 1 }}
                >
                  Download Results
                </Button>
              )}
              
              {['completed', 'failed', 'cancelled'].includes(scan.status.toLowerCase()) && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>
          
          {scan.status.toLowerCase() === 'running' && (
            <Box mt={3}>
              <Typography variant="body2" gutterBottom>
                Progress: {Math.round(getScanProgress())}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getScanProgress()} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Data Source
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {dataSource ? (
                  <Box display="flex" alignItems="center">
                    <StorageIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="body1">
                      {dataSource.name} ({dataSource.source_type})
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/data-sources/${dataSource.id}`)}
                      sx={{ ml: 1 }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Data source information not available
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Scan Rule Set
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {ruleSet ? (
                  <Box display="flex" alignItems="center">
                    <SettingsIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="body1">
                      {ruleSet.name} {ruleSet.is_global && '(Global)'}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/scan-rule-sets/${ruleSet.id}`)}
                      sx={{ ml: 1 }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Rule set information not available
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Duration
                </Typography>
                <Typography variant="body1">
                  {getScanDuration()}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Entities Scanned
                </Typography>
                <Typography variant="body1">
                  {scan.scan_result?.entities_scanned || 0}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Issues Found
                </Typography>
                <Typography variant="body1">
                  {scan.scan_result?.issues_found || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="scan tabs">
          <Tab label="Results" icon={<DataObjectIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Entities" icon={<TableChartIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Issues" icon={<WarningIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Timeline" icon={<TimelineIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" {...a11yProps(4)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Scan Results</Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadScan}
          >
            Refresh
          </Button>
        </Box>
        
        {scan.status.toLowerCase() === 'running' ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Scan is currently running. Results will be available when the scan completes.
          </Alert>
        ) : scan.status.toLowerCase() === 'completed' ? (
          scanResults ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Summary
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <StorageIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Total Entities" 
                        secondary={scanResults.entities_scanned || 0} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TableChartIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tables" 
                        secondary={scanResults.tables_count || 0} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DataObjectIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Columns" 
                        secondary={scanResults.columns_count || 0} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Issues Found" 
                        secondary={scanResults.issues_found || 0} 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Classification
                  </Typography>
                  {scanResults.classification_summary ? (
                    <List dense>
                      {Object.entries(scanResults.classification_summary).map(([category, count]: [string, any]) => (
                        <ListItem key={category}>
                          <ListItemIcon>
                            <Chip 
                              label={category} 
                              size="small" 
                              color={category.toLowerCase().includes('sensitive') ? 'error' : 'default'}
                            />
                          </ListItemIcon>
                          <ListItemText primary={count} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No classification data available
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Scan Time</TableCell>
                          <TableCell>{getScanDuration()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Entities Per Second</TableCell>
                          <TableCell>
                            {scanResults.entities_scanned && scan.completed_at && scan.created_at ? (
                              (scanResults.entities_scanned / ((new Date(scan.completed_at).getTime() - new Date(scan.created_at).getTime()) / 1000)).toFixed(2)
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Memory Usage (Peak)</TableCell>
                          <TableCell>{scanResults.performance_metrics?.peak_memory_mb || '-'} MB</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>CPU Usage (Average)</TableCell>
                          <TableCell>{scanResults.performance_metrics?.avg_cpu_percent || '-'}%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="warning">
              No detailed results available for this scan.
            </Alert>
          )
        ) : (
          <Alert severity={scan.status.toLowerCase() === 'failed' ? 'error' : 'warning'}>
            {scan.status === 'Failed' ? 'Scan failed to complete. Check the issues tab for details.' : 
             scan.status === 'Cancelled' ? 'Scan was cancelled before completion.' : 
             'Scan results are not available.'}
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Scanned Entities
        </Typography>
        
        {scan.status.toLowerCase() === 'completed' && scanResults?.entities ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Path</TableCell>
                  <TableCell>Rows</TableCell>
                  <TableCell>Columns</TableCell>
                  <TableCell>Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scanResults.entities.slice(0, 100).map((entity: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{entity.name}</TableCell>
                    <TableCell>{entity.type}</TableCell>
                    <TableCell>{entity.path}</TableCell>
                    <TableCell>{entity.row_count || '-'}</TableCell>
                    <TableCell>{entity.column_count || '-'}</TableCell>
                    <TableCell>{entity.size_bytes ? `${(entity.size_bytes / 1024 / 1024).toFixed(2)} MB` : '-'}</TableCell>
                  </TableRow>
                ))}
                {scanResults.entities.length > 100 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Showing 100 of {scanResults.entities.length} entities
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            {scan.status.toLowerCase() === 'running' ? 
              'Entity information will be available when the scan completes.' : 
              'No entity information available for this scan.'}
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Issues & Warnings
        </Typography>
        
        {scan.status.toLowerCase() === 'failed' ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Scan Failed
            </Typography>
            <Typography variant="body2">
              {scan.scan_result?.error_message || 'No error details available'}
            </Typography>
          </Alert>
        ) : scan.status.toLowerCase() === 'completed' && scanResults?.issues ? (
          scanResults.issues.length > 0 ? (
            <List>
              {scanResults.issues.map((issue: any, index: number) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemIcon>
                    {issue.severity === 'error' ? (
                      <ErrorIcon color="error" />
                    ) : issue.severity === 'warning' ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <InfoIcon color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {issue.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {issue.description}
                        </Typography>
                        {issue.entity && (
                          <Typography variant="body2" color="text.secondary">
                            Entity: {issue.entity}
                          </Typography>
                        )}
                        {issue.recommendation && (
                          <Typography variant="body2" color="primary">
                            Recommendation: {issue.recommendation}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="success">
              No issues were found during this scan.
            </Alert>
          )
        ) : (
          <Alert severity="info">
            {scan.status.toLowerCase() === 'running' ? 
              'Issue information will be available when the scan completes.' : 
              'No issue information available for this scan.'}
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Scan Timeline
        </Typography>
        
        {scanResults?.timeline ? (
          <List>
            {scanResults.timeline.map((event: any, index: number) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {event.type === 'start' ? (
                    <PlayArrowIcon color="primary" />
                  ) : event.type === 'complete' ? (
                    <CheckCircleIcon color="success" />
                  ) : event.type === 'error' ? (
                    <ErrorIcon color="error" />
                  ) : (
                    <InfoIcon color="info" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={event.message}
                  secondary={
                    <>
                      {format(new Date(event.timestamp), 'PPp')}
                      {event.details && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {event.details}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">
            No timeline information available for this scan.
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Scan Settings
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sample Size
                </Typography>
                <Typography variant="body1">
                  {scan.scan_settings?.sample_size || 'Default (100 rows)'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Timeout
                </Typography>
                <Typography variant="body1">
                  {scan.scan_settings?.timeout_seconds ? `${scan.scan_settings.timeout_seconds} seconds` : 'Default (3600 seconds)'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Classification
                </Typography>
                <Typography variant="body1">
                  {scan.scan_settings?.enable_classification ? 'Enabled' : 'Disabled'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
      
      {/* Restart Scan Modal */}
      <ScanCreateModal
        open={restartModalOpen}
        onClose={() => setRestartModalOpen(false)}
        dataSourceId={scan.data_source_id}
        ruleSetId={scan.scan_rule_set_id}
        onSuccess={() => navigate('/scans')}
      />
      
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
    </Box>
  );
};

export default ScanDetails;