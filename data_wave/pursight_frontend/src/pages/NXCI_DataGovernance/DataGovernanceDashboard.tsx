import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Button,
  useTheme,
  alpha,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Fade,
  Zoom,
  Grow,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  Timeline as TimelineIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Rule as RuleIcon,
  Scanner as ScannerIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';
import { useDataSources } from '../../hooks/useDataSources';
import { useScans } from '../../hooks/useScans';
import { useComplianceManagement } from '../../hooks/useComplianceManagement';

// Import chart components
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

// Import scan metrics component
import { ScanMetricsOverview } from '../../components/dashboard';

const DataGovernanceDashboard: React.FC = () => {
  // Style pour l'animation de pulsation des icônes
  const pulseAnimation = {
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.1)',
      },
      '100%': {
        transform: 'scale(1)',
      },
    },
    animation: 'pulse 2s infinite ease-in-out',
  };
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use the dashboard analytics hook with refresh interval of 5 minutes (300000 ms)
  const {
    dashboardSummary,
    dataSourceStats,
    scanSummaryStats,
    metadataStats,
    complianceStats,
    timeSeriesData,
    timeRange,
    updateTimeRange,
    updateDataSourceFilter,
    refreshAllDashboardData,
    aggregatedStats,
    complianceScore,
    isLoading,
    isSummaryError: error
  } = useDashboardAnalytics({
    refreshInterval: 300000,
    initialTimeRange: 'month'
  });
  
  // Get data sources for filtering
  const { dataSources } = useDataSources();
  
  // State for time range filter
  const [timeRangeFilter, setTimeRangeFilter] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>(timeRange);
  
  // State for data source filter
  const [dataSourceFilter, setDataSourceFilter] = useState<string | undefined>(undefined);
  
  // Handle time range change
  const handleTimeRangeChange = (newRange: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRangeFilter(newRange);
    updateTimeRange(newRange);
  };
  
  // Handle data source filter change
  const handleDataSourceFilterChange = (dataSourceId: string | undefined) => {
    setDataSourceFilter(dataSourceId);
    updateDataSourceFilter(dataSourceId);
  };
  
  // Refresh dashboard data
  const handleRefresh = () => {
    refreshAllDashboardData();
  };
  
  // Filter menu state
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const openFilterMenu = Boolean(filterAnchorEl);
  
  // Open filter menu
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // Close filter menu
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Entity type distribution data for pie chart
  const entityTypeData = metadataStats?.entityTypeDistribution || [
    { name: 'Tables', value: 0, color: '#3f51b5' },
    { name: 'Files', value: 0, color: '#009688' },
    { name: 'Containers', value: 0, color: '#9c27b0' },
    { name: 'APIs', value: 0, color: '#607d8b' },
    { name: 'Schemas', value: 0, color: '#ff5722' },
    { name: 'Databases', value: 0, color: '#795548' },
  ];
  
  // Sensitivity distribution data for pie chart
  const sensitivityData = metadataStats?.sensitivityDistribution || [
    { name: 'Confidential', value: 0, color: '#f44336' },
    { name: 'Restricted', value: 0, color: '#ff9800' },
    { name: 'Internal', value: 0, color: '#2196f3' },
    { name: 'Public', value: 0, color: '#4caf50' },
  ];
  
  // Compliance status data for pie chart
  const complianceData = complianceStats?.statusDistribution || [
    { name: 'Compliant', value: 0, color: '#4caf50' },
    { name: 'Non-Compliant', value: 0, color: '#f44336' },
    { name: 'Warning', value: 0, color: '#ff9800' },
    { name: 'Not Scanned', value: 0, color: '#9e9e9e' },
  ];
  
  // Colors for pie charts - extract from the data objects
  const ENTITY_COLORS = entityTypeData.map(item => item.color);
  const SENSITIVITY_COLORS = sensitivityData.map(item => item.color);
  const COMPLIANCE_COLORS = complianceData.map(item => item.color);
  
  // Scan trend data for line chart
  const scanTrendData = timeSeriesData?.scanTrend || [];
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
          Data Governance Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Time Range Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-select-label">Time Range</InputLabel>
            <Select
              labelId="time-range-select-label"
              id="time-range-select"
              value={timeRangeFilter}
              label="Time Range"
              onChange={(e) => handleTimeRangeChange(e.target.value as 'day' | 'week' | 'month' | 'quarter' | 'year')}
              disabled={isLoading}
            >
              <MenuItem value="day">Last Day</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          {/* Data Source Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="data-source-select-label">Data Source</InputLabel>
            <Select
              labelId="data-source-select-label"
              id="data-source-select"
              value={dataSourceFilter || ''}
              label="Data Source"
              onChange={(e) => handleDataSourceFilterChange(e.target.value || undefined)}
              disabled={isLoading}
            >
              <MenuItem value="">All Sources</MenuItem>
              {dataSources?.map((source: any) => (
                <MenuItem key={source.id} value={source.id}>
                  {source.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Refresh Button */}
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={!isLoading} style={{ transitionDelay: !isLoading ? '100ms' : '0ms' }}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/data-governance/data-sources')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Total Data Sources
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
                          {isLoading ? (
                            <Skeleton animation="wave" height={40} width={60} />
                          ) : (
                            aggregatedStats?.totalDataSources || dashboardSummary?.totalDataSources || 0
                          )}
                        </Typography>
                      </Box>
                      <StorageIcon color="primary" sx={{ 
                        fontSize: 40,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 0.7 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.7 },
                        }
                      }} />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      {isLoading ? (
                        <Skeleton animation="wave" height={20} width={120} />
                      ) : (
                        `${dataSourceStats?.filter((ds: any) => ds.status === 'active').length || 0} active sources`
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={!isLoading} style={{ transitionDelay: !isLoading ? '200ms' : '0ms' }}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.info.main, 0.05),
                    borderLeft: `4px solid ${theme.palette.info.main}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/data-governance/data-catalog')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Total Entities
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
                          {isLoading ? (
                            <Skeleton animation="wave" height={40} width={60} />
                          ) : (
                            aggregatedStats?.totalTables || metadataStats?.totalEntities || dashboardSummary?.totalEntities || 0
                          )}
                        </Typography>
                      </Box>
                      <DataObjectIcon color="info" sx={{ 
                        fontSize: 40,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 0.7 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.7 },
                        },
                        animationDelay: '0.5s'
                      }} />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      {isLoading ? (
                        <Skeleton animation="wave" height={20} width={150} />
                      ) : (
                        `${metadataStats?.entitiesWithSensitivity || dashboardSummary?.entitiesWithSensitivity || 0} with sensitivity labels`
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={!isLoading} style={{ transitionDelay: !isLoading ? '300ms' : '0ms' }}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.warning.main, 0.05),
                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/data-governance/scan-rule-sets')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Compliance Rules
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
                          {isLoading ? (
                            <Skeleton animation="wave" height={40} width={60} />
                          ) : (
                            complianceStats?.totalRules || 0
                          )}
                        </Typography>
                      </Box>
                      <SecurityIcon color="warning" sx={{ 
                        fontSize: 40,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 0.7 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.7 },
                        },
                        animationDelay: '1s'
                      }} />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      {isLoading ? (
                        <Skeleton animation="wave" height={20} width={100} />
                      ) : (
                        `${complianceStats?.activeRules || 0} active rules`
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={!isLoading} style={{ transitionDelay: !isLoading ? '400ms' : '0ms' }}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.success.main, 0.05),
                    borderLeft: `4px solid ${theme.palette.success.main}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/data-governance/compliance')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Compliance Rate
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
                          {isLoading ? (
                            <Skeleton animation="wave" height={40} width={60} />
                          ) : (
                            complianceScore ? `${Math.round(complianceScore.score)}%` : complianceStats?.complianceRate ? `${Math.round(complianceStats.complianceRate * 100)}%` : 'N/A'
                          )}
                        </Typography>
                      </Box>
                      <CheckCircleIcon color="success" sx={{ 
                        fontSize: 40,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 0.7 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.7 },
                        },
                        animationDelay: '1.5s'
                      }} />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      {isLoading ? (
                        <Skeleton animation="wave" height={20} width={120} />
                      ) : (
                        `${complianceStats?.totalIssues || 0} issues detected`
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>
          
          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Fade in={!isLoading} timeout={1000}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardHeader 
                    title="Entity Distribution" 
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                    action={
                      <Tooltip title="View detailed entity breakdown">
                        <IconButton size="small" onClick={() => navigate('/data-governance/data-catalog')}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {isLoading ? (
                      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress size={40} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={entityTypeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              animationBegin={200}
                              animationDuration={1500}
                            >
                              {entityTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={ENTITY_COLORS[index % ENTITY_COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                            <RechartsTooltip formatter={(value) => [`${value} entities`, 'Count']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Fade in={!isLoading} timeout={1000} style={{ transitionDelay: !isLoading ? '200ms' : '0ms' }}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardHeader 
                    title="Sensitivity Distribution" 
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                    action={
                      <Tooltip title="View sensitivity details">
                        <IconButton size="small" onClick={() => navigate('/data-governance/sensitivity')}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {isLoading ? (
                      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress size={40} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sensitivityData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              animationBegin={400}
                              animationDuration={1500}
                            >
                              {sensitivityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={SENSITIVITY_COLORS[index % SENSITIVITY_COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                            <RechartsTooltip formatter={(value) => [`${value} entities`, 'Count']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Fade in={!isLoading} timeout={1000} style={{ transitionDelay: !isLoading ? '400ms' : '0ms' }}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardHeader 
                    title="Compliance Status" 
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                    action={
                      <Tooltip title="View compliance details">
                        <IconButton size="small" onClick={() => navigate('/data-governance/compliance')}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {isLoading ? (
                      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress size={40} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={complianceData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              animationBegin={600}
                              animationDuration={1500}
                            >
                              {complianceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COMPLIANCE_COLORS[index % COMPLIANCE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                            <RechartsTooltip formatter={(value) => [`${value} entities`, 'Count']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
          
          {/* Scan Metrics Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Grow in={!isLoading} timeout={1000} style={{ transitionDelay: !isLoading ? '600ms' : '0ms' }}>
                <Card 
                  elevation={3}
                  sx={{ 
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardHeader 
                    title="Scan Activity" 
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                    action={
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<VisibilityIcon />}
                        onClick={() => navigate('/data-governance/scans')}
                        sx={{
                          borderRadius: '20px',
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          }
                        }}
                      >
                        View All
                      </Button>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {isLoading ? (
                      <Box sx={{ p: 2 }}>
                        <Skeleton animation="wave" height={100} />
                      </Box>
                    ) : (
                      <ScanMetricsOverview />
                    )}
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>
          
          {/* Scan Trend Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grow in={!isLoading} timeout={1000} style={{ transitionDelay: !isLoading ? '800ms' : '0ms' }}>
                <Card 
                  elevation={3}
                  sx={{ 
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: theme.palette.mode === 'dark' ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardHeader 
                    title="Data Discovery Trend" 
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                    action={
                      <Tooltip title="View detailed trends">
                        <IconButton size="small" onClick={() => navigate('/data-governance/insights')}>
                          <InsightsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {isLoading ? (
                      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress size={40} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={scanTrendData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip 
                              contentStyle={{
                                backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                                border: `1px solid ${theme.palette.mode === 'dark' ? '#555' : '#ddd'}`,
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="entities_discovered" 
                              name="Entities Discovered" 
                              stroke={theme.palette.primary.main} 
                              fill={alpha(theme.palette.primary.main, 0.2)}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                              isAnimationActive={true}
                              animationDuration={2000}
                              animationBegin={800}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="sensitive_entities" 
                              name="Sensitive Entities" 
                              stroke={theme.palette.error.main} 
                              fill={alpha(theme.palette.error.main, 0.2)}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                              isAnimationActive={true}
                              animationDuration={2000}
                              animationBegin={1200}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DataGovernanceDashboard;