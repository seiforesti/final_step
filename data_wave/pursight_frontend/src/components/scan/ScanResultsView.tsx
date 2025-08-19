import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  Storage as StorageIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Label as LabelIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useScans } from '../../hooks/useScans';
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
      id={`scan-results-tabpanel-${index}`}
      aria-labelledby={`scan-results-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `scan-results-tab-${index}`,
    'aria-controls': `scan-results-tabpanel-${index}`,
  };
}

interface ScanResultsViewProps {
  scanId: number;
  scanResults: any;
  isLoading?: boolean;
  error?: string | null;
}

const ScanResultsView: React.FC<ScanResultsViewProps> = ({ 
  scanId, 
  scanResults, 
  isLoading = false,
  error = null,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleClassificationFilter = (classification: string) => {
    setSelectedClassification(prev => prev === classification ? null : classification);
  };

  const filterEntities = (entities: any[]) => {
    if (!entities) return [];
    
    return entities.filter(entity => {
      const matchesSearch = searchTerm === '' || 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.path && entity.path.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesClassification = !selectedClassification || 
        (entity.classifications && entity.classifications.includes(selectedClassification));
      
      return matchesSearch && matchesClassification;
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading scan results...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!scanResults) {
    return (
      <Alert severity="info">
        No scan results available.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="scan results tabs">
          <Tab label="Overview" icon={<InfoIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Tables" icon={<TableChartIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Columns" icon={<DataObjectIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Classifications" icon={<LabelIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Issues" icon={<WarningIcon />} iconPosition="start" {...a11yProps(4)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Scan Overview
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Summary Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Entities
                    </Typography>
                    <Typography variant="h6">
                      {scanResults.entities_scanned || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tables
                    </Typography>
                    <Typography variant="h6">
                      {scanResults.tables_count || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Columns
                    </Typography>
                    <Typography variant="h6">
                      {scanResults.columns_count || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Issues Found
                    </Typography>
                    <Typography variant="h6" color={scanResults.issues_found > 0 ? 'error.main' : 'inherit'}>
                      {scanResults.issues_found || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Data Classification
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {scanResults.classification_summary ? (
                  <Box>
                    {Object.entries(scanResults.classification_summary).map(([category, count]: [string, any]) => (
                      <Box key={category} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip 
                          label={category} 
                          size="small" 
                          color={category.toLowerCase().includes('sensitive') ? 'error' : 'default'}
                          onClick={() => handleClassificationFilter(category)}
                          variant={selectedClassification === category ? 'filled' : 'outlined'}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2">
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No classification data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Scan Performance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Scan Duration
                    </Typography>
                    <Typography variant="body1">
                      {scanResults.duration_seconds ? 
                        `${Math.floor(scanResults.duration_seconds / 60)} min ${scanResults.duration_seconds % 60} sec` : 
                        'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Entities Per Second
                    </Typography>
                    <Typography variant="body1">
                      {scanResults.entities_scanned && scanResults.duration_seconds ? 
                        (scanResults.entities_scanned / scanResults.duration_seconds).toFixed(2) : 
                        'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Memory Usage (Peak)
                    </Typography>
                    <Typography variant="body1">
                      {scanResults.performance_metrics?.peak_memory_mb ? 
                        `${scanResults.performance_metrics.peak_memory_mb} MB` : 
                        'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      CPU Usage (Average)
                    </Typography>
                    <Typography variant="body1">
                      {scanResults.performance_metrics?.avg_cpu_percent ? 
                        `${scanResults.performance_metrics.avg_cpu_percent}%` : 
                        'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Tables ({filterEntities(scanResults.entities?.filter((e: any) => e.type === 'table')).length})
          </Typography>
          
          <Box display="flex" alignItems="center">
            <TextField
              size="small"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, width: '250px' }}
            />
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>
        
        {scanResults.entities?.some((e: any) => e.type === 'table') ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Path</TableCell>
                  <TableCell>Rows</TableCell>
                  <TableCell>Columns</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Classifications</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterEntities(scanResults.entities?.filter((e: any) => e.type === 'table'))
                  .slice(0, 100)
                  .map((entity: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{entity.name}</TableCell>
                      <TableCell>{entity.path || '-'}</TableCell>
                      <TableCell>{entity.row_count || '-'}</TableCell>
                      <TableCell>{entity.column_count || '-'}</TableCell>
                      <TableCell>
                        {entity.size_bytes ? `${(entity.size_bytes / 1024 / 1024).toFixed(2)} MB` : '-'}
                      </TableCell>
                      <TableCell>
                        {entity.classifications?.length > 0 ? (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {entity.classifications.map((classification: string, i: number) => (
                              <Chip 
                                key={i} 
                                label={classification} 
                                size="small" 
                                color={classification.toLowerCase().includes('sensitive') ? 'error' : 'default'}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            No table entities found in scan results.
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Columns ({filterEntities(scanResults.columns || []).length})
          </Typography>
          
          <Box display="flex" alignItems="center">
            <TextField
              size="small"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, width: '250px' }}
            />
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>
        
        {scanResults.columns?.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Column Name</TableCell>
                  <TableCell>Table</TableCell>
                  <TableCell>Data Type</TableCell>
                  <TableCell>Nullable</TableCell>
                  <TableCell>Sample Values</TableCell>
                  <TableCell>Classifications</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterEntities(scanResults.columns)
                  .slice(0, 100)
                  .map((column: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{column.name}</TableCell>
                      <TableCell>{column.table_name}</TableCell>
                      <TableCell>{column.data_type}</TableCell>
                      <TableCell>{column.is_nullable ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        {column.sample_values?.length > 0 ? (
                          <Box>
                            <Box 
                              sx={{ 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              onClick={() => toggleExpand(`column-${index}`)}
                            >
                              <Typography variant="body2">
                                {expandedItems[`column-${index}`] ? 'Hide' : 'Show'} sample values
                              </Typography>
                              {expandedItems[`column-${index}`] ? (
                                <ExpandLessIcon fontSize="small" />
                              ) : (
                                <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                            {expandedItems[`column-${index}`] && (
                              <Box sx={{ mt: 1 }}>
                                {column.sample_values.map((value: any, i: number) => (
                                  <Chip 
                                    key={i} 
                                    label={value === null ? 'NULL' : String(value)} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {column.classifications?.length > 0 ? (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {column.classifications.map((classification: string, i: number) => (
                              <Chip 
                                key={i} 
                                label={classification} 
                                size="small" 
                                color={classification.toLowerCase().includes('sensitive') ? 'error' : 'default'}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            No column information available in scan results.
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Data Classifications
        </Typography>
        
        {scanResults.classification_summary ? (
          <Grid container spacing={3}>
            {Object.entries(scanResults.classification_summary).map(([category, count]: [string, any]) => (
              <Grid item xs={12} md={6} lg={4} key={category}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip 
                        label={category} 
                        color={category.toLowerCase().includes('sensitive') ? 'error' : 'default'}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="h6">
                        {count}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Top entities with this classification:
                    </Typography>
                    
                    <List dense>
                      {scanResults.entities
                        ?.filter((entity: any) => entity.classifications?.includes(category))
                        .slice(0, 5)
                        .map((entity: any, index: number) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              {entity.type === 'table' ? (
                                <TableChartIcon fontSize="small" />
                              ) : (
                                <DataObjectIcon fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText 
                              primary={entity.name} 
                              secondary={entity.path || entity.table_name} 
                            />
                          </ListItem>
                        ))}
                    </List>
                    
                    {scanResults.entities?.filter((entity: any) => entity.classifications?.includes(category)).length > 5 && (
                      <Box textAlign="center" mt={1}>
                        <Button size="small">
                          View all ({scanResults.entities.filter((entity: any) => entity.classifications?.includes(category)).length})
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            No classification data available in scan results.
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Issues & Warnings
        </Typography>
        
        {scanResults.issues?.length > 0 ? (
          <List>
            {scanResults.issues.map((issue: any, index: number) => (
              <Paper key={index} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{
                    borderLeft: '4px solid',
                    borderLeftColor: issue.severity === 'error' ? 'error.main' : 
                                    issue.severity === 'warning' ? 'warning.main' : 'info.main',
                  }}
                >
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
                      <Typography variant="subtitle1">
                        {issue.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" paragraph sx={{ mt: 1 }}>
                          {issue.description}
                        </Typography>
                        
                        <Grid container spacing={2}>
                          {issue.entity && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Entity:</strong> {issue.entity}
                              </Typography>
                            </Grid>
                          )}
                          
                          {issue.location && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Location:</strong> {issue.location}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                        
                        {issue.recommendation && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="body2" color="primary">
                              <strong>Recommendation:</strong> {issue.recommendation}
                            </Typography>
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        ) : (
          <Alert severity="success">
            No issues were found during this scan.
          </Alert>
        )}
      </TabPanel>
    </Box>
  );
};

export default ScanResultsView;