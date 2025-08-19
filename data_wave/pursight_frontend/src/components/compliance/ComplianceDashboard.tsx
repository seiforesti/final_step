import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Shield as ShieldIcon,
  Policy as PolicyIcon,
  Assignment as AssignmentIcon,
  AssignmentLate as AssignmentLateIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useComplianceManagement } from '../../hooks/useComplianceManagement';
import { useSensitivityLabels } from '../../hooks/useSensitivityLabels';
import { useDataSources } from '../../hooks/useDataSources';
import { format, parseISO } from 'date-fns';

// Import chart components
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ComplianceDashboardProps {
  dataSourceId?: number;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  dataSourceId,
}) => {
  const theme = useTheme();
  const { getComplianceSummary, getComplianceIssues, getComplianceRules } = useComplianceManagement();
  const { getSensitivityLabels } = useSensitivityLabels();
  const { getDataSources } = useDataSources();
  
  const [summary, setSummary] = useState<any | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<number | undefined>(dataSourceId);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  
  // Load compliance data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load data sources
        const sourcesData = await getDataSources();
        setDataSources(sourcesData);
        
        // Load sensitivity labels
        const labelsData = await getSensitivityLabels();
        setLabels(labelsData);
        
        // Load compliance summary
        const summaryData = await getComplianceSummary({
          data_source_id: selectedDataSource,
        });
        setSummary(summaryData);
        
        // Load compliance issues
        const issuesData = await getComplianceIssues({
          data_source_id: selectedDataSource,
          severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
          limit: 10,
        });
        setIssues(issuesData);
        
        // Load compliance rules
        const rulesData = await getComplianceRules();
        setRules(rulesData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load compliance data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedDataSource, selectedSeverity]);
  
  // Handle data source change
  const handleDataSourceChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedDataSource(value === 'all' ? undefined : Number(value));
  };
  
  // Handle severity filter change
  const handleSeverityChange = (event: SelectChangeEvent) => {
    setSelectedSeverity(event.target.value);
  };
  
  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    getComplianceSummary({
      data_source_id: selectedDataSource,
    })
      .then(data => setSummary(data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to refresh summary'))
      .finally(() => setIsLoading(false));
    
    getComplianceIssues({
      data_source_id: selectedDataSource,
      severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
      limit: 10,
    })
      .then(data => setIssues(data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to refresh issues'));
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
  
  // Pie chart colors
  const COLORS = ['#FF4842', '#FFC107', '#2196F3', '#00AB55', '#8884D8'];
  
  // Calculate compliance score color
  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Compliance Dashboard
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="data-source-label">Data Source</InputLabel>
            <Select
              labelId="data-source-label"
              value={selectedDataSource?.toString() || 'all'}
              label="Data Source"
              onChange={handleDataSourceChange}
              size="small"
            >
              <MenuItem value="all">All Sources</MenuItem>
              {dataSources.map(source => (
                <MenuItem key={source.id} value={source.id.toString()}>
                  {source.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="severity-label">Severity</InputLabel>
            <Select
              labelId="severity-label"
              value={selectedSeverity}
              label="Severity"
              onChange={handleSeverityChange}
              size="small"
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : summary ? (
        <>
          {/* Summary Cards */}
          <Box mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Compliance Score
                        </Typography>
                        <Typography variant="h4" sx={{ color: getComplianceScoreColor(summary.compliance_score) }}>
                          {summary.compliance_score}%
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 1 }}>
                        <SecurityIcon sx={{ color: 'primary.contrastText' }} />
                      </Box>
                    </Box>
                    
                    <Box mt={2}>
                      <LinearProgress
                        variant="determinate"
                        value={summary.compliance_score}
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          bgcolor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            bgcolor: getComplianceScoreColor(summary.compliance_score),
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Total Issues
                        </Typography>
                        <Typography variant="h4">
                          {summary.total_issues}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'error.light', p: 1, borderRadius: 1 }}>
                        <WarningIcon sx={{ color: 'error.contrastText' }} />
                      </Box>
                    </Box>
                    
                    <Box mt={2} display="flex" justifyContent="space-between">
                      <Chip
                        size="small"
                        icon={<ErrorIcon />}
                        label={`Critical: ${summary.issues_by_severity?.critical || 0}`}
                        sx={{ bgcolor: 'error.lighter', color: 'error.dark' }}
                      />
                      <Chip
                        size="small"
                        icon={<WarningIcon />}
                        label={`High: ${summary.issues_by_severity?.high || 0}`}
                        sx={{ bgcolor: 'warning.lighter', color: 'warning.dark' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Sensitive Data
                        </Typography>
                        <Typography variant="h4">
                          {summary.sensitive_data_percentage}%
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'warning.light', p: 1, borderRadius: 1 }}>
                        <LockIcon sx={{ color: 'warning.contrastText' }} />
                      </Box>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="textSecondary">
                        {summary.sensitive_columns} columns across {summary.sensitive_tables} tables
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Compliance Rules
                        </Typography>
                        <Typography variant="h4">
                          {summary.active_rules}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'info.light', p: 1, borderRadius: 1 }}>
                        <PolicyIcon sx={{ color: 'info.contrastText' }} />
                      </Box>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="textSecondary">
                        {summary.passing_rules} passing, {summary.failing_rules} failing
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          {/* Charts and Tables */}
          <Grid container spacing={3}>
            {/* Issues by Severity */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ height: '100%' }}>
                <Box p={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Issues by Severity
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {summary.issues_by_severity && (
                    <Box height={300} display="flex" justifyContent="center" alignItems="center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Critical', value: summary.issues_by_severity.critical || 0 },
                              { name: 'High', value: summary.issues_by_severity.high || 0 },
                              { name: 'Medium', value: summary.issues_by_severity.medium || 0 },
                              { name: 'Low', value: summary.issues_by_severity.low || 0 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Critical', value: summary.issues_by_severity.critical || 0 },
                              { name: 'High', value: summary.issues_by_severity.high || 0 },
                              { name: 'Medium', value: summary.issues_by_severity.medium || 0 },
                              { name: 'Low', value: summary.issues_by_severity.low || 0 },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => [`${value} issues`, null]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                  
                  <Box mt={2}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <Box sx={{ bgcolor: COLORS[0], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                          <Typography variant="body2">Critical: {summary.issues_by_severity?.critical || 0}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <Box sx={{ bgcolor: COLORS[1], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                          <Typography variant="body2">High: {summary.issues_by_severity?.high || 0}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <Box sx={{ bgcolor: COLORS[2], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                          <Typography variant="body2">Medium: {summary.issues_by_severity?.medium || 0}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <Box sx={{ bgcolor: COLORS[3], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                          <Typography variant="body2">Low: {summary.issues_by_severity?.low || 0}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            {/* Sensitivity Label Distribution */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ height: '100%' }}>
                <Box p={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sensitivity Label Distribution
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {summary.sensitivity_distribution && (
                    <Box height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(summary.sensitivity_distribution).map(([key, value]) => ({
                            name: key,
                            count: value,
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip formatter={(value) => [`${value} columns`, null]} />
                          <Bar dataKey="count" fill="#8884d8">
                            {Object.entries(summary.sensitivity_distribution).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Recent Compliance Issues */}
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Box p={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recent Compliance Issues
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {issues.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Severity</TableCell>
                            <TableCell>Issue</TableCell>
                            <TableCell>Data Source</TableCell>
                            <TableCell>Entity</TableCell>
                            <TableCell>Rule</TableCell>
                            <TableCell>Detected</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {issues.map((issue) => (
                            <TableRow key={issue.id}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  {getSeverityIcon(issue.severity)}
                                  <Typography variant="body2" sx={{ ml: 1, color: getSeverityColor(issue.severity) }}>
                                    {issue.severity}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{issue.description}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{issue.data_source_name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {issue.entity_type === 'column' ? (
                                    <Tooltip title={`${issue.schema_name}.${issue.table_name}.${issue.entity_name}`}>
                                      <span>{issue.entity_name}</span>
                                    </Tooltip>
                                  ) : (
                                    issue.entity_name
                                  )}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {issue.entity_type}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{issue.rule_name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{formatDate(issue.detected_at)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={issue.status}
                                  color={issue.status === 'open' ? 'error' : issue.status === 'in_progress' ? 'warning' : 'success'}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box p={3} display="flex" justifyContent="center" alignItems="center">
                      <Typography variant="body2" color="textSecondary">
                        No compliance issues found for the selected filters.
                      </Typography>
                    </Box>
                  )}
                  
                  {issues.length > 0 && (
                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<AssignmentIcon />}
                      >
                        View All Issues
                      </Button>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Active Compliance Rules */}
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Box p={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Active Compliance Rules
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {rules.length > 0 ? (
                    <Grid container spacing={2}>
                      {rules.slice(0, 6).map((rule) => (
                        <Grid item xs={12} md={4} key={rule.id}>
                          <Card variant="outlined">
                            <CardHeader
                              title={rule.name}
                              subheader={rule.category}
                              titleTypographyProps={{ variant: 'subtitle2' }}
                              subheaderTypographyProps={{ variant: 'caption' }}
                              avatar={
                                <Box sx={{ bgcolor: 'primary.lighter', p: 1, borderRadius: '50%' }}>
                                  <PolicyIcon fontSize="small" color="primary" />
                                </Box>
                              }
                              action={
                                <Chip
                                  size="small"
                                  label={rule.status}
                                  color={rule.status === 'active' ? 'success' : 'default'}
                                  variant="outlined"
                                />
                              }
                            />
                            <Divider />
                            <CardContent>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {rule.description}
                              </Typography>
                              
                              <Box mt={1}>
                                <Grid container spacing={1}>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">
                                      Severity
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                      {getSeverityIcon(rule.severity)}
                                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                                        {rule.severity}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary">
                                      Compliance
                                    </Typography>
                                    <Typography variant="body2">
                                      {rule.compliance_standard}
                                    </Typography>
                                  </Grid>
                                  
                                  <Grid item xs={12} sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="textSecondary">
                                      Applies To
                                    </Typography>
                                    <Typography variant="body2">
                                      {rule.applies_to}
                                    </Typography>
                                  </Grid>
                                  
                                  <Grid item xs={12} sx={{ mt: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                      <Typography variant="caption" color="textSecondary">
                                        Pass Rate: {rule.pass_rate}%
                                      </Typography>
                                      <Typography variant="caption" color="textSecondary">
                                        {rule.passing_entities} / {rule.total_entities}
                                      </Typography>
                                    </Box>
                                    <LinearProgress
                                      variant="determinate"
                                      value={rule.pass_rate}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: theme.palette.grey[200],
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 3,
                                          bgcolor: rule.pass_rate >= 90 ? theme.palette.success.main : 
                                                  rule.pass_rate >= 70 ? theme.palette.warning.main : 
                                                  theme.palette.error.main,
                                        },
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box p={3} display="flex" justifyContent="center" alignItems="center">
                      <Typography variant="body2" color="textSecondary">
                        No active compliance rules found.
                      </Typography>
                    </Box>
                  )}
                  
                  {rules.length > 6 && (
                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<PolicyIcon />}
                      >
                        View All Rules
                      </Button>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Box p={3} display="flex" justifyContent="center" alignItems="center">
          <Typography variant="body1" color="textSecondary">
            No compliance data available. Select a data source to view compliance information.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ComplianceDashboard;