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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { useDataSources } from '../../hooks/useDataSources';
import { useScans } from '../../hooks/useScans';
import ScanRuleSetEditModal from './ScanRuleSetEditModal';
import ScanCreateModal from '../scan/ScanCreateModal';
import ScanList from '../scan/ScanList';
import { format } from 'date-fns';

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
      id={`rule-set-tabpanel-${index}`}
      aria-labelledby={`rule-set-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `rule-set-tab-${index}`,
    'aria-controls': `rule-set-tabpanel-${index}`,
  };
}

const ScanRuleSetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ruleSetId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  
  const { 
    getScanRuleSetById, 
    deleteScanRuleSet, 
    isLoadingScanRuleSet, 
    isDeleteingScanRuleSet,
    validatePatterns,
  } = useScanRuleSets();
  
  const { getDataSourceById } = useDataSources();
  const { getScansForRuleSet } = useScans();
  
  const [ruleSet, setRuleSet] = useState<any>(null);
  const [dataSource, setDataSource] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const loadRuleSet = async () => {
    try {
      setError(null);
      const data = await getScanRuleSetById(ruleSetId);
      setRuleSet(data);
      
      // Load data source if not global
      if (!data.is_global && data.data_source_id) {
        const sourceData = await getDataSourceById(data.data_source_id);
        setDataSource(sourceData);
      }
      
      // Load scans
      const scansData = await getScansForRuleSet(ruleSetId);
      setScans(scansData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load rule set details');
    }
  };

  useEffect(() => {
    if (ruleSetId) {
      loadRuleSet();
    }
  }, [ruleSetId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteScanRuleSet(ruleSetId);
      navigate('/scan-rule-sets');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete rule set');
      setDeleteDialogOpen(false);
    }
  };

  const handleStartScan = () => {
    setScanModalOpen(true);
  };

  const handleValidatePatterns = async () => {
    if (!ruleSet || (ruleSet.is_global === false && !ruleSet.data_source_id)) {
      setError('Cannot validate patterns without a data source');
      return;
    }

    try {
      setIsValidating(true);
      setError(null);
      const result = await validatePatterns({
        data_source_id: ruleSet.data_source_id,
        include_patterns: ruleSet.include_patterns,
        exclude_patterns: ruleSet.exclude_patterns,
      });
      setValidationResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate patterns');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoadingScanRuleSet || !ruleSet) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading rule set details...
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
        <IconButton onClick={() => navigate('/scan-rule-sets')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Scan Rule Set Details
        </Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" gutterBottom>
                {ruleSet.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {ruleSet.description || 'No description provided'}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Chip 
                  label={ruleSet.is_global ? 'Global Rule Set' : 'Data Source Specific'} 
                  color={ruleSet.is_global ? 'primary' : 'default'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Created: {format(new Date(ruleSet.created_at), 'PPP')}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            {!ruleSet.is_global && dataSource && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Data Source
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center">
                    <StorageIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="body1">
                      {dataSource.name} ({dataSource.source_type})
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {dataSource.description || 'No description'}
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12} md={ruleSet.is_global ? 12 : 6}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" gutterBottom>
                  Patterns Configuration
                </Typography>
                {!ruleSet.is_global && ruleSet.data_source_id && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleValidatePatterns}
                    disabled={isValidating}
                    startIcon={isValidating ? <CircularProgress size={16} /> : <CheckIcon />}
                  >
                    {isValidating ? 'Validating...' : 'Validate Patterns'}
                  </Button>
                )}
              </Box>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Include Patterns:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  {ruleSet.include_patterns && ruleSet.include_patterns.length > 0 ? (
                    ruleSet.include_patterns.map((pattern: string, index: number) => (
                      <Chip key={index} label={pattern} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No include patterns defined
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  Exclude Patterns:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {ruleSet.exclude_patterns && ruleSet.exclude_patterns.length > 0 ? (
                    ruleSet.exclude_patterns.map((pattern: string, index: number) => (
                      <Chip key={index} label={pattern} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No exclude patterns defined
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {validationResult && (
            <Box mt={3}>
              <Alert severity={validationResult.valid ? 'success' : 'warning'}>
                {validationResult.valid
                  ? 'Patterns are valid and will match the expected entities.'
                  : 'Patterns may not match any entities or have issues.'}
              </Alert>
              
              {validationResult.matched_entities && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Matched Entities: {validationResult.matched_entities.length}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {validationResult.matched_entities.slice(0, 50).map((entity: string, index: number) => (
                        <Chip key={index} label={entity} size="small" />
                      ))}
                      {validationResult.matched_entities.length > 50 && (
                        <Chip
                          label={`+${validationResult.matched_entities.length - 50} more`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </Paper>
                </Box>
              )}
              
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    Warnings:
                  </Typography>
                  <List dense>
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <InfoIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<StartIcon />}
              onClick={handleStartScan}
              disabled={ruleSet.is_global}
            >
              Start Scan
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="rule set tabs">
          <Tab label="Scans" icon={<HistoryIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" {...a11yProps(1)} />
          {!ruleSet.is_global && (
            <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" {...a11yProps(2)} />
          )}
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Scan History</Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadRuleSet}
          >
            Refresh
          </Button>
        </Box>
        
        {scans.length > 0 ? (
          <ScanList scans={scans} onScanComplete={loadRuleSet} />
        ) : (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No scans have been run with this rule set yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<StartIcon />}
              onClick={handleStartScan}
              sx={{ mt: 2 }}
              disabled={ruleSet.is_global}
            >
              Start First Scan
            </Button>
          </Paper>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Advanced Settings
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Scan Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            These settings control how scans are performed when using this rule set.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Scan Depth
                </Typography>
                <Typography variant="body2">
                  {ruleSet.scan_settings?.scan_depth || 'Default (All Levels)'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sample Size
                </Typography>
                <Typography variant="body2">
                  {ruleSet.scan_settings?.sample_size || 'Default (100 rows)'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Timeout
                </Typography>
                <Typography variant="body2">
                  {ruleSet.scan_settings?.timeout_seconds ? `${ruleSet.scan_settings.timeout_seconds} seconds` : 'Default (3600 seconds)'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Classification
                </Typography>
                <Typography variant="body2">
                  {ruleSet.scan_settings?.enable_classification ? 'Enabled' : 'Disabled'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
      
      {!ruleSet.is_global && (
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Security & Permissions
          </Typography>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="body1" gutterBottom>
              Access Control
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage who can view and use this scan rule set.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              This rule set inherits permissions from its data source. To modify permissions, please update the data source security settings.
            </Alert>
          </Paper>
        </TabPanel>
      )}
      
      {/* Edit Modal */}
      <ScanRuleSetEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        ruleSetId={ruleSetId}
        onSuccess={loadRuleSet}
      />
      
      {/* Create Scan Modal */}
      {!ruleSet.is_global && (
        <ScanCreateModal
          open={scanModalOpen}
          onClose={() => setScanModalOpen(false)}
          dataSourceId={ruleSet.data_source_id}
          ruleSetId={ruleSetId}
          onSuccess={loadRuleSet}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Scan Rule Set
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the scan rule set "{ruleSet.name}"? This action cannot be undone.
            {scans.length > 0 && (
              <>
                <br /><br />
                <strong>Warning:</strong> This rule set has been used in {scans.length} scan{scans.length !== 1 ? 's' : ''}. 
                Deleting it may impact historical scan data and references.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleteingScanRuleSet}
            startIcon={isDeleteingScanRuleSet ? <CircularProgress size={20} /> : null}
          >
            {isDeleteingScanRuleSet ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanRuleSetDetails;