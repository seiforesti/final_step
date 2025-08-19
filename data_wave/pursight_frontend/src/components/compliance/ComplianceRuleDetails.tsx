import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Chip,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Link,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Policy as PolicyIcon,
  Assignment as AssignmentIcon,
  AssignmentLate as AssignmentLateIcon,
  Timeline as TimelineIcon,
  Link as LinkIcon,
  DataObject as DataObjectIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplianceManagement } from '../../hooks/useComplianceManagement';
import { useDataSources } from '../../hooks/useDataSources';
import { format, parseISO } from 'date-fns';
import ComplianceRuleEditModal from './ComplianceRuleEditModal';

// Import chart components
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
      id={`rule-tabpanel-${index}`}
      aria-labelledby={`rule-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `rule-tab-${index}`,
    'aria-controls': `rule-tabpanel-${index}`,
  };
}

const ComplianceRuleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { getComplianceRule, deleteComplianceRule, getComplianceIssues, validateComplianceRule } = useComplianceManagement();
  const { getDataSources } = useDataSources();
  
  const [rule, setRule] = useState<any | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<any | null>(null);
  
  // Load rule data
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load rule details
        const ruleData = await getComplianceRule(Number(id));
        setRule(ruleData);
        
        // Load data sources
        const sourcesData = await getDataSources();
        setDataSources(sourcesData);
        
        // Load compliance issues for this rule
        const issuesData = await getComplianceIssues({
          rule_id: Number(id),
          limit: 100,
        });
        setIssues(issuesData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load rule details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Open edit modal
  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };
  
  // Close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    // Reload rule data after edit
    if (id) {
      setIsLoading(true);
      getComplianceRule(Number(id))
        .then(data => setRule(data))
        .catch(err => setError(err.response?.data?.detail || 'Failed to reload rule'))
        .finally(() => setIsLoading(false));
    }
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Delete rule
  const handleDeleteRule = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      await deleteComplianceRule(Number(id));
      handleCloseDeleteDialog();
      navigate('/compliance/rules');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete rule');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Validate rule
  const handleValidateRule = async () => {
    if (!id) return;
    
    try {
      setValidationLoading(true);
      setError(null);
      
      const results = await validateComplianceRule(Number(id));
      setValidationResults(results);
      setTabValue(3); // Switch to validation tab
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate rule');
    } finally {
      setValidationLoading(false);
    }
  };
  
  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon sx={{ color: theme.palette.error.light }} />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.error.light;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Get entity icon
  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'database':
        return <StorageIcon />;
      case 'schema':
        return <DataObjectIcon />;
      case 'table':
        return <TableChartIcon />;
      case 'column':
        return <ViewColumnIcon />;
      default:
        return <DataObjectIcon />;
    }
  };
  
  // Pie chart colors
  const COLORS = ['#FF4842', '#FFC107', '#2196F3', '#00AB55', '#8884D8'];
  
  // Calculate compliance score color
  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!rule) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Rule not found
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/compliance/rules')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h2">
          Compliance Rule Details
        </Typography>
      </Box>
      
      {/* Rule Header */}
      <Paper variant="outlined" sx={{ mb: 3, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box display="flex" alignItems="center">
              <PolicyIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="h3">
                {rule.name}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {rule.description}
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              <Chip
                size="small"
                label={rule.category}
                color="primary"
                variant="outlined"
              />
              
              <Chip
                size="small"
                icon={getSeverityIcon(rule.severity)}
                label={rule.severity}
                sx={{ 
                  color: getSeverityColor(rule.severity),
                  borderColor: getSeverityColor(rule.severity)
                }}
                variant="outlined"
              />
              
              <Chip
                size="small"
                label={rule.compliance_standard}
                color="secondary"
                variant="outlined"
              />
              
              <Chip
                size="small"
                label={`Applies to: ${rule.applies_to}`}
                color="default"
                variant="outlined"
              />
              
              <Chip
                size="small"
                label={rule.status}
                color={rule.status === 'active' ? 'success' : 'default'}
                variant="outlined"
              />
              
              <Chip
                size="small"
                label={rule.is_global ? 'Global' : 'Data Source Specific'}
                color="info"
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              onClick={handleValidateRule}
              disabled={validationLoading}
            >
              {validationLoading ? 'Validating...' : 'Validate Rule'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleOpenEditModal}
            >
              Edit
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenDeleteDialog}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Rule Content */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="rule tabs">
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Issues" {...a11yProps(1)} />
          <Tab label="Definition" {...a11yProps(2)} />
          <Tab label="Validation" {...a11yProps(3)} />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Rule Statistics */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader
                title="Rule Statistics"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Pass Rate
                    </Typography>
                    <Typography variant="h6" sx={{ color: getComplianceScoreColor(rule.pass_rate) }}>
                      {rule.pass_rate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={rule.pass_rate}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: theme.palette.grey[200],
                        mt: 1,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: getComplianceScoreColor(rule.pass_rate),
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Total Entities
                    </Typography>
                    <Typography variant="h6">
                      {rule.total_entities}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {rule.passing_entities} passing, {rule.total_entities - rule.passing_entities} failing
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Created
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(rule.created_at)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(rule.updated_at)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Rule Type */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader
                title="Rule Type"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DataObjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {rule.rule_type.charAt(0).toUpperCase() + rule.rule_type.slice(1)} Rule
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Definition:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', overflowX: 'auto' }}>
                    {rule.rule_definition}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Scope */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader
                title="Scope"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  This rule applies to:
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  {getEntityIcon(rule.applies_to)}
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {rule.applies_to.charAt(0).toUpperCase() + rule.applies_to.slice(1)}s
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Scope:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {rule.is_global ? 'Global (all data sources)' : 'Specific data sources'}
                </Typography>
                
                {!rule.is_global && rule.data_source_ids && rule.data_source_ids.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Applied to data sources:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {rule.data_source_ids.map((dsId: number) => {
                        const dataSource = dataSources.find(ds => ds.id === dsId);
                        return (
                          <Chip
                            key={dsId}
                            size="small"
                            label={dataSource ? dataSource.name : `ID: ${dsId}`}
                            color="primary"
                            variant="outlined"
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Remediation */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Remediation"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent>
                {rule.remediation_steps ? (
                  <Typography variant="body2">
                    {rule.remediation_steps}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No remediation steps provided.
                  </Typography>
                )}
                
                {rule.reference_link && (
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Reference:
                    </Typography>
                    <Link href={rule.reference_link} target="_blank" rel="noopener" display="flex" alignItems="center">
                      <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {rule.reference_link}
                    </Link>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Issues Summary */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Issues Summary"
                titleTypographyProps={{ variant: 'subtitle1' }}
                action={
                  <Button
                    size="small"
                    endIcon={<AssignmentIcon />}
                    onClick={() => setTabValue(1)}
                  >
                    View All
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                {issues.length > 0 ? (
                  <Box>
                    <Box height={200}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Critical', value: issues.filter(i => i.severity === 'critical').length },
                              { name: 'High', value: issues.filter(i => i.severity === 'high').length },
                              { name: 'Medium', value: issues.filter(i => i.severity === 'medium').length },
                              { name: 'Low', value: issues.filter(i => i.severity === 'low').length },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Critical', value: issues.filter(i => i.severity === 'critical').length },
                              { name: 'High', value: issues.filter(i => i.severity === 'high').length },
                              { name: 'Medium', value: issues.filter(i => i.severity === 'medium').length },
                              { name: 'Low', value: issues.filter(i => i.severity === 'low').length },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => [`${value} issues`, null]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box mt={2}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <Box sx={{ bgcolor: COLORS[0], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                            <Typography variant="body2">
                              Critical: {issues.filter(i => i.severity === 'critical').length}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <Box sx={{ bgcolor: COLORS[1], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                            <Typography variant="body2">
                              High: {issues.filter(i => i.severity === 'high').length}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <Box sx={{ bgcolor: COLORS[2], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                            <Typography variant="body2">
                              Medium: {issues.filter(i => i.severity === 'medium').length}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <Box sx={{ bgcolor: COLORS[3], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                            <Typography variant="body2">
                              Low: {issues.filter(i => i.severity === 'low').length}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                    <Typography variant="body2" color="textSecondary">
                      No issues found for this rule.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Issues Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Compliance Issues
          </Typography>
          <Typography variant="body2" color="textSecondary">
            The following issues were detected for this compliance rule.
          </Typography>
        </Box>
        
        {issues.length > 0 ? (
          <Grid container spacing={2}>
            {issues.map((issue) => (
              <Grid item xs={12} key={issue.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="center">
                        {getSeverityIcon(issue.severity)}
                        <Typography variant="subtitle1" sx={{ ml: 1 }}>
                          {issue.description}
                        </Typography>
                      </Box>
                      
                      <Box mt={1}>
                        <Typography variant="body2" color="textSecondary">
                          Entity: {issue.entity_type === 'column' ? (
                            <span>{issue.schema_name}.{issue.table_name}.{issue.entity_name}</span>
                          ) : issue.entity_type === 'table' ? (
                            <span>{issue.schema_name}.{issue.entity_name}</span>
                          ) : (
                            issue.entity_name
                          )}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Data Source: {issue.data_source_name}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box display="flex" flexDirection="column" alignItems="flex-end" height="100%" justifyContent="space-between">
                        <Box display="flex" gap={1}>
                          <Chip
                            size="small"
                            label={issue.severity}
                            sx={{ 
                              color: getSeverityColor(issue.severity),
                              borderColor: getSeverityColor(issue.severity)
                            }}
                            variant="outlined"
                          />
                          
                          <Chip
                            size="small"
                            label={issue.status}
                            color={issue.status === 'open' ? 'error' : issue.status === 'in_progress' ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="caption" color="textSecondary">
                          Detected: {formatDate(issue.detected_at)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box p={3} display="flex" justifyContent="center" alignItems="center">
            <Typography variant="body1" color="textSecondary">
              No issues found for this rule.
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      {/* Definition Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Rule Definition"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Rule Type: {rule.rule_type.charAt(0).toUpperCase() + rule.rule_type.slice(1)}
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', overflowX: 'auto' }}>
                    {rule.rule_definition}
                  </Typography>
                </Paper>
                
                <Box mt={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Applies To: {rule.applies_to.charAt(0).toUpperCase() + rule.applies_to.slice(1)}s
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom mt={2}>
                    Scope: {rule.is_global ? 'Global (all data sources)' : 'Specific data sources'}
                  </Typography>
                  
                  {!rule.is_global && rule.data_source_ids && rule.data_source_ids.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Applied to data sources:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {rule.data_source_ids.map((dsId: number) => {
                          const dataSource = dataSources.find(ds => ds.id === dsId);
                          return (
                            <Chip
                              key={dsId}
                              size="small"
                              label={dataSource ? dataSource.name : `ID: ${dsId}`}
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Rule Metadata"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {rule.category}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Severity
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {getSeverityIcon(rule.severity)}
                      <Typography variant="body1" sx={{ ml: 0.5 }}>
                        {rule.severity}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Compliance Standard
                    </Typography>
                    <Typography variant="body1">
                      {rule.compliance_standard}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      size="small"
                      label={rule.status}
                      color={rule.status === 'active' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="textSecondary">
                      Remediation Steps
                    </Typography>
                    {rule.remediation_steps ? (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {rule.remediation_steps}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        No remediation steps provided.
                      </Typography>
                    )}
                  </Grid>
                  
                  {rule.reference_link && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Reference Link
                      </Typography>
                      <Link href={rule.reference_link} target="_blank" rel="noopener" display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                        <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {rule.reference_link}
                      </Link>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Validation Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Rule Validation Results
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Results of validating this rule against data sources.
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={validationLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleValidateRule}
            disabled={validationLoading}
          >
            {validationLoading ? 'Validating...' : 'Refresh Validation'}
          </Button>
        </Box>
        
        {validationResults ? (
          <Grid container spacing={3}>
            {/* Validation Summary */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Pass Rate
                      </Typography>
                      <Typography variant="h4" sx={{ color: getComplianceScoreColor(validationResults.pass_rate) }}>
                        {validationResults.pass_rate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={validationResults.pass_rate}
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          bgcolor: theme.palette.grey[200],
                          mt: 1,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            bgcolor: getComplianceScoreColor(validationResults.pass_rate),
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Total Entities
                      </Typography>
                      <Typography variant="h4">
                        {validationResults.total_entities}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Entities evaluated against this rule
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Passing
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {validationResults.passing_entities}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Entities that comply with this rule
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Failing
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {validationResults.total_entities - validationResults.passing_entities}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Entities that violate this rule
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Data Source Results */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Results by Data Source
              </Typography>
              
              <Grid container spacing={2}>
                {validationResults.data_source_results.map((dsResult: any) => (
                  <Grid item xs={12} md={6} lg={4} key={dsResult.data_source_id}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          dataSources.find(ds => ds.id === dsResult.data_source_id)?.name || 
                          `Data Source ID: ${dsResult.data_source_id}`
                        }
                        titleTypographyProps={{ variant: 'subtitle2' }}
                        subheader={`${dsResult.total_entities} entities evaluated`}
                        subheaderTypographyProps={{ variant: 'caption' }}
                        avatar={
                          <Box sx={{ bgcolor: 'primary.lighter', p: 1, borderRadius: '50%' }}>
                            <StorageIcon fontSize="small" color="primary" />
                          </Box>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Pass Rate
                            </Typography>
                            <Typography variant="h6" sx={{ color: getComplianceScoreColor(dsResult.pass_rate) }}>
                              {dsResult.pass_rate}%
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Entities
                            </Typography>
                            <Typography variant="body1">
                              {dsResult.passing_entities} / {dsResult.total_entities}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <LinearProgress
                              variant="determinate"
                              value={dsResult.pass_rate}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: theme.palette.grey[200],
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor: getComplianceScoreColor(dsResult.pass_rate),
                                },
                              }}
                            />
                          </Grid>
                          
                          {dsResult.entity_type_breakdown && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Entity Breakdown
                              </Typography>
                              <List dense disablePadding>
                                {Object.entries(dsResult.entity_type_breakdown).map(([type, count]: [string, any]) => (
                                  <ListItem key={type} disablePadding sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      {getEntityIcon(type)}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={`${type.charAt(0).toUpperCase() + type.slice(1)}s`}
                                      secondary={`${count.passing} / ${count.total} passing (${Math.round(count.passing / count.total * 100)}%)`}
                                      primaryTypographyProps={{ variant: 'body2' }}
                                      secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            {/* Sample Violations */}
            {validationResults.sample_violations && validationResults.sample_violations.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Sample Violations
                </Typography>
                
                <Grid container spacing={2}>
                  {validationResults.sample_violations.map((violation: any, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={7}>
                            <Box display="flex" alignItems="center">
                              {getEntityIcon(violation.entity_type)}
                              <Typography variant="subtitle2" sx={{ ml: 1 }}>
                                {violation.entity_type === 'column' ? (
                                  <span>{violation.schema_name}.{violation.table_name}.{violation.entity_name}</span>
                                ) : violation.entity_type === 'table' ? (
                                  <span>{violation.schema_name}.{violation.entity_name}</span>
                                ) : (
                                  violation.entity_name
                                )}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                              {violation.reason}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={5}>
                            <Box display="flex" flexDirection="column" alignItems="flex-end">
                              <Chip
                                size="small"
                                label={dataSources.find(ds => ds.id === violation.data_source_id)?.name || 
                                      `Data Source ID: ${violation.data_source_id}`}
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 1 }}
                              />
                              
                              <Typography variant="caption" color="textSecondary">
                                Entity Type: {violation.entity_type.charAt(0).toUpperCase() + violation.entity_type.slice(1)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        ) : (
          <Box p={5} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Typography variant="body1" color="textSecondary" gutterBottom>
              No validation results available.
            </Typography>
            <Button
              variant="contained"
              startIcon={validationLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              onClick={handleValidateRule}
              disabled={validationLoading}
              sx={{ mt: 2 }}
            >
              {validationLoading ? 'Validating...' : 'Validate Rule Now'}
            </Button>
          </Box>
        )}
      </TabPanel>
      
      {/* Edit Modal */}
      {editModalOpen && (
        <ComplianceRuleEditModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          rule={rule}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Compliance Rule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the rule "{rule.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteRule} color="error" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceRuleDetails;