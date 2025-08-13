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
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useDataSources } from '../../hooks/useDataSources';
import { useScans } from '../../hooks/useScans';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';
import { format, subDays, isAfter } from 'date-fns';

// Import chart components
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface ScanMetricsOverviewProps {
  timeRange?: '7d' | '30d' | '90d' | 'all';
  dataSourceId?: number;
}

const ScanMetricsOverview: React.FC<ScanMetricsOverviewProps> = ({
  timeRange = '30d',
  dataSourceId,
}) => {
  const theme = useTheme();
  const { getDashboardMetrics, getDashboardTrends } = useDashboardAnalytics();
  const { getDataSources, getDataSourceById } = useDataSources();
  const { getScans } = useScans();
  const { getScanRuleSets } = useScanRuleSets();
  
  const [metrics, setMetrics] = useState<any | null>(null);
  const [trends, setTrends] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange);
  const [selectedDataSource, setSelectedDataSource] = useState<number | undefined>(dataSourceId);
  const [dataSources, setDataSources] = useState<any[]>([]);
  
  // Load dashboard metrics
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load data sources for filter
        const sourcesData = await getDataSources();
        setDataSources(sourcesData);
        
        // Load dashboard metrics
        const metricsData = await getDashboardMetrics({
          time_range: selectedTimeRange,
          data_source_id: selectedDataSource,
        });
        setMetrics(metricsData);
        
        // Load dashboard trends
        const trendsData = await getDashboardTrends({
          time_range: selectedTimeRange,
          data_source_id: selectedDataSource,
        });
        setTrends(trendsData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedTimeRange, selectedDataSource]);
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setSelectedTimeRange(event.target.value);
  };
  
  // Handle data source change
  const handleDataSourceChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedDataSource(value === 'all' ? undefined : Number(value));
  };
  
  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    getDashboardMetrics({
      time_range: selectedTimeRange,
      data_source_id: selectedDataSource,
    })
      .then(data => setMetrics(data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to refresh metrics'))
      .finally(() => setIsLoading(false));
    
    getDashboardTrends({
      time_range: selectedTimeRange,
      data_source_id: selectedDataSource,
    })
      .then(data => setTrends(data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to refresh trends'));
  };
  
  // Calculate date range for display
  const getDateRangeText = (range: string): string => {
    const today = new Date();
    switch (range) {
      case '7d':
        return `${format(subDays(today, 7), 'MMM d, yyyy')} - ${format(today, 'MMM d, yyyy')}`;
      case '30d':
        return `${format(subDays(today, 30), 'MMM d, yyyy')} - ${format(today, 'MMM d, yyyy')}`;
      case '90d':
        return `${format(subDays(today, 90), 'MMM d, yyyy')} - ${format(today, 'MMM d, yyyy')}`;
      case 'all':
        return 'All Time';
      default:
        return 'Custom Range';
    }
  };
  
  // Calculate trend percentage
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Scan Metrics Overview
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              value={selectedTimeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              size="small"
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          
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
      
      <Box mb={3}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <CalendarTodayIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              {getDateRangeText(selectedTimeRange)}
            </Typography>
          </Box>
          
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
              <CircularProgress />
            </Box>
          ) : metrics ? (
            <Grid container spacing={3}>
              {/* Summary Cards */}
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Total Scans
                        </Typography>
                        <Typography variant="h4">
                          {formatNumber(metrics.total_scans)}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 1 }}>
                        <StorageIcon sx={{ color: 'primary.contrastText' }} />
                      </Box>
                    </Box>
                    
                    {trends && (
                      <Box display="flex" alignItems="center" mt={1}>
                        {calculateTrend(metrics.total_scans, trends.previous_period.total_scans) > 0 ? (
                          <TrendingUpIcon fontSize="small" color="success" />
                        ) : (
                          <TrendingDownIcon fontSize="small" color="error" />
                        )}
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {Math.abs(calculateTrend(metrics.total_scans, trends.previous_period.total_scans)).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                          vs previous period
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Tables Scanned
                        </Typography>
                        <Typography variant="h4">
                          {formatNumber(metrics.tables_scanned)}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'info.light', p: 1, borderRadius: 1 }}>
                        <TableChartIcon sx={{ color: 'info.contrastText' }} />
                      </Box>
                    </Box>
                    
                    {trends && (
                      <Box display="flex" alignItems="center" mt={1}>
                        {calculateTrend(metrics.tables_scanned, trends.previous_period.tables_scanned) > 0 ? (
                          <TrendingUpIcon fontSize="small" color="success" />
                        ) : (
                          <TrendingDownIcon fontSize="small" color="error" />
                        )}
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {Math.abs(calculateTrend(metrics.tables_scanned, trends.previous_period.tables_scanned)).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                          vs previous period
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Columns Classified
                        </Typography>
                        <Typography variant="h4">
                          {formatNumber(metrics.columns_classified)}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'success.light', p: 1, borderRadius: 1 }}>
                        <ViewColumnIcon sx={{ color: 'success.contrastText' }} />
                      </Box>
                    </Box>
                    
                    {trends && (
                      <Box display="flex" alignItems="center" mt={1}>
                        {calculateTrend(metrics.columns_classified, trends.previous_period.columns_classified) > 0 ? (
                          <TrendingUpIcon fontSize="small" color="success" />
                        ) : (
                          <TrendingDownIcon fontSize="small" color="error" />
                        )}
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {Math.abs(calculateTrend(metrics.columns_classified, trends.previous_period.columns_classified)).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                          vs previous period
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Issues Found
                        </Typography>
                        <Typography variant="h4">
                          {formatNumber(metrics.issues_found)}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'warning.light', p: 1, borderRadius: 1 }}>
                        <WarningIcon sx={{ color: 'warning.contrastText' }} />
                      </Box>
                    </Box>
                    
                    {trends && (
                      <Box display="flex" alignItems="center" mt={1}>
                        {calculateTrend(metrics.issues_found, trends.previous_period.issues_found) > 0 ? (
                          <TrendingUpIcon fontSize="small" color="error" />
                        ) : (
                          <TrendingDownIcon fontSize="small" color="success" />
                        )}
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {Math.abs(calculateTrend(metrics.issues_found, trends.previous_period.issues_found)).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                          vs previous period
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="textSecondary" align="center">
              No metrics data available for the selected filters.
            </Typography>
          )}
        </Paper>
      </Box>
      
      {metrics && (
        <Grid container spacing={3}>
          {/* Scan Status Distribution */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ height: '100%' }}>
              <Box p={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Scan Status Distribution
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {metrics.scan_status_distribution && (
                  <Box height={300} display="flex" justifyContent="center" alignItems="center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: metrics.scan_status_distribution.completed || 0 },
                            { name: 'Failed', value: metrics.scan_status_distribution.failed || 0 },
                            { name: 'Cancelled', value: metrics.scan_status_distribution.cancelled || 0 },
                            { name: 'In Progress', value: metrics.scan_status_distribution.in_progress || 0 },
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
                            { name: 'Completed', value: metrics.scan_status_distribution.completed || 0 },
                            { name: 'Failed', value: metrics.scan_status_distribution.failed || 0 },
                            { name: 'Cancelled', value: metrics.scan_status_distribution.cancelled || 0 },
                            { name: 'In Progress', value: metrics.scan_status_distribution.in_progress || 0 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value} scans`, null]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
                
                <Box mt={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ bgcolor: COLORS[0], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                        <Typography variant="body2">Completed: {metrics.scan_status_distribution?.completed || 0}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ bgcolor: COLORS[1], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                        <Typography variant="body2">Failed: {metrics.scan_status_distribution?.failed || 0}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ bgcolor: COLORS[2], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                        <Typography variant="body2">Cancelled: {metrics.scan_status_distribution?.cancelled || 0}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ bgcolor: COLORS[3], width: 12, height: 12, mr: 1, borderRadius: '50%' }} />
                        <Typography variant="body2">In Progress: {metrics.scan_status_distribution?.in_progress || 0}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Classification Distribution */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ height: '100%' }}>
              <Box p={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Classification Distribution
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {metrics.classification_distribution && (
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(metrics.classification_distribution).map(([key, value]) => ({
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
                          {Object.entries(metrics.classification_distribution).map((entry, index) => (
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
          
          {/* Scan Duration Trend */}
          <Grid item xs={12}>
            <Paper variant="outlined">
              <Box p={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Scan Duration Trend
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {trends && trends.scan_duration_trend && (
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trends.scan_duration_trend.map((item: any) => ({
                          date: item.date,
                          duration: item.average_duration_seconds / 60, // Convert to minutes
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Duration (minutes)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip formatter={(value) => [`${value.toFixed(1)} minutes`, 'Avg Duration']} />
                        <Line type="monotone" dataKey="duration" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Data Source Metrics */}
          {!selectedDataSource && metrics.data_source_metrics && (
            <Grid item xs={12}>
              <Paper variant="outlined">
                <Box p={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Data Source Metrics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    {metrics.data_source_metrics.map((source: any) => (
                      <Grid item xs={12} md={4} key={source.data_source_id}>
                        <Card variant="outlined">
                          <CardHeader
                            title={source.data_source_name}
                            subheader={source.data_source_type}
                            titleTypographyProps={{ variant: 'subtitle2' }}
                            subheaderTypographyProps={{ variant: 'caption' }}
                          />
                          <Divider />
                          <CardContent>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">
                                  Scans
                                </Typography>
                                <Typography variant="body2">
                                  {source.scan_count}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">
                                  Tables
                                </Typography>
                                <Typography variant="body2">
                                  {source.table_count}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">
                                  Columns
                                </Typography>
                                <Typography variant="body2">
                                  {source.column_count}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">
                                  Issues
                                </Typography>
                                <Typography variant="body2">
                                  {source.issue_count}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sx={{ mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                  Last Scan
                                </Typography>
                                <Typography variant="body2">
                                  {source.last_scan_date ? format(new Date(source.last_scan_date), 'MMM d, yyyy HH:mm') : 'Never'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">
                                  Health
                                </Typography>
                                <Box display="flex" alignItems="center">
                                  {source.health_status === 'good' ? (
                                    <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                                  ) : source.health_status === 'warning' ? (
                                    <WarningIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                                  ) : (
                                    <ErrorIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                                  )}
                                  <Typography variant="body2">
                                    {source.health_status.charAt(0).toUpperCase() + source.health_status.slice(1)}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ScanMetricsOverview;