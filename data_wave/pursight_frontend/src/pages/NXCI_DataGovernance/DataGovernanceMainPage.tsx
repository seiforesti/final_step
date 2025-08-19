import React, { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Button,
  Grid,
  Card,
  CardContent,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { 
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Import dashboard page
import DataGovernanceDashboard from './DataGovernanceDashboard';

// Import hooks
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';
import { useDataSources } from '../../hooks/useDataSources';

const DataGovernanceMainPage: React.FC = () => {
  const theme = useTheme();
  
  // Use the dashboard analytics hook with refresh interval of 5 minutes (300000 ms)
  const {
    dashboardSummary,
    dataSourceStats,
    metadataStats,
    complianceStats,
    timeRange,
    updateTimeRange,
    updateDataSourceFilter,
    refreshAllDashboardData,
    aggregatedStats,
    complianceScore,
    isLoading
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
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    const newRange = event.target.value as 'day' | 'week' | 'month' | 'quarter' | 'year';
    setTimeRangeFilter(newRange);
    updateTimeRange(newRange);
  };
  
  // Handle data source filter change
  const handleDataSourceFilterChange = (event: SelectChangeEvent) => {
    const dataSourceId = event.target.value || undefined;
    setDataSourceFilter(dataSourceId);
    updateDataSourceFilter(dataSourceId);
  };
  
  // Refresh dashboard data
  const handleRefresh = () => {
    refreshAllDashboardData();
  };

  // Dashboard summary cards
  const renderDashboardSummary = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                borderLeft: `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Data Sources
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
                      {aggregatedStats?.totalDataSources || dashboardSummary?.totalDataSources || 0}
                    </Typography>
                  </Box>
                  <StorageIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  {dataSourceStats?.filter((ds: any) => ds.status === 'active').length || 0} active sources
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.info.main, 0.05),
                borderLeft: `4px solid ${theme.palette.info.main}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Entities
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
                      {aggregatedStats?.totalTables || metadataStats?.totalEntities || dashboardSummary?.totalEntities || 0}
                    </Typography>
                  </Box>
                  <DataObjectIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  {metadataStats?.entitiesWithSensitivity || dashboardSummary?.entitiesWithSensitivity || 0} with sensitivity labels
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.warning.main, 0.05),
                borderLeft: `4px solid ${theme.palette.warning.main}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Compliance Rules
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
                      {complianceStats?.totalRules || 0}
                    </Typography>
                  </Box>
                  <SecurityIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  {complianceStats?.activeRules || 0} active rules
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.success.main, 0.05),
                borderLeft: `4px solid ${theme.palette.success.main}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Compliance Rate
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 600 }}>
                      {complianceScore ? `${Math.round(complianceScore.score)}%` : complianceStats?.complianceRate ? `${Math.round(complianceStats.complianceRate * 100)}%` : 'N/A'}
                    </Typography>
                  </Box>
                  <SecurityIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  {complianceStats?.totalIssues || 0} issues detected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dashboard Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
        {/* Time Range Filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="time-range-select-label">Time Range</InputLabel>
          <Select
            labelId="time-range-select-label"
            id="time-range-select"
            value={timeRangeFilter}
            label="Time Range"
            onChange={handleTimeRangeChange}
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
            onChange={handleDataSourceFilterChange}
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
      
      {/* Dashboard summary cards */}
      {renderDashboardSummary()}
      
      {/* Main dashboard content */}
      <DataGovernanceDashboard />
    </Box>
  );
};

export default DataGovernanceMainPage;