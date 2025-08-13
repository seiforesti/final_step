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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  useTheme,
} from '@mui/material';
import {
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  Label as LabelIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Timeline as TimelineIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataCatalog } from '../../hooks/useDataCatalog';
import { useSensitivityLabels } from '../../hooks/useSensitivityLabels';
import { useDataSources } from '../../hooks/useDataSources';
import { format, parseISO } from 'date-fns';
import EntitySensitivityLabelAssignModal from '../sensitivity/EntitySensitivityLabelAssignModal';

// Import chart components
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

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
      id={`entity-tabpanel-${index}`}
      aria-labelledby={`entity-tab-${index}`}
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
    id: `entity-tab-${index}`,
    'aria-controls': `entity-tabpanel-${index}`,
  };
}

const EntityDetails: React.FC = () => {
  const { entityType, entityId } = useParams<{ entityType: string; entityId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { getEntity, getEntityLineage, getEntityIssues, getEntityColumns, getEntitySampleData } = useDataCatalog();
  const { getSensitivityLabels } = useSensitivityLabels();
  const { getDataSources } = useDataSources();
  
  const [entity, setEntity] = useState<any | null>(null);
  const [lineage, setLineage] = useState<any | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [sampleData, setSampleData] = useState<any | null>(null);
  const [sensitivityLabels, setSensitivityLabels] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isAssignLabelModalOpen, setIsAssignLabelModalOpen] = useState(false);
  
  // Load entity data
  useEffect(() => {
    const loadData = async () => {
      if (!entityType || !entityId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load entity details
        const entityData = await getEntity(entityType, Number(entityId));
        setEntity(entityData);
        
        // Load sensitivity labels
        const labelsData = await getSensitivityLabels();
        setSensitivityLabels(labelsData);
        
        // Load data sources
        const sourcesData = await getDataSources();
        setDataSources(sourcesData);
        
        // Load entity issues
        const issuesData = await getEntityIssues(entityType, Number(entityId));
        setIssues(issuesData);
        
        // Load additional data based on entity type
        if (entityType === 'table') {
          // Load columns for table
          const columnsData = await getEntityColumns(Number(entityId));
          setColumns(columnsData);
          
          // Load sample data for table
          const sampleDataResult = await getEntitySampleData(Number(entityId));
          setSampleData(sampleDataResult);
        }
        
        // Load lineage data
        const lineageData = await getEntityLineage(entityType, Number(entityId));
        setLineage(lineageData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load entity details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [entityType, entityId]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  // Get entity icon
  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'database':
        return <StorageIcon />;
      case 'schema':
        return <DataObjectIcon />;
      case 'table':
        return <TableChartIcon />;
      case 'column':
        return <ViewColumnIcon />;
      case 'folder':
        return <FolderIcon />;
      case 'file':
        return <FileIcon />;
      default:
        return <DataObjectIcon />;
    }
  };
  
  // Get sensitivity label color
  const getSensitivityLabelColor = (labelId: number) => {
    const label = sensitivityLabels.find(l => l.id === labelId);
    if (!label) return theme.palette.grey[500];
    
    switch (label.level.toLowerCase()) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Get sensitivity label name
  const getSensitivityLabelName = (labelId: number) => {
    const label = sensitivityLabels.find(l => l.id === labelId);
    return label ? label.name : 'Unknown';
  };
  
  // Get data source name
  const getDataSourceName = (dataSourceId: number) => {
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    return dataSource ? dataSource.name : `ID: ${dataSourceId}`;
  };
  
  // Get issue severity icon
  const getIssueSeverityIcon = (severity: string) => {
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
  
  // Get issue severity color
  const getIssueSeverityColor = (severity: string) => {
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
  
  // Pie chart colors
  const COLORS = ['#FF4842', '#FFC107', '#2196F3', '#00AB55', '#8884D8'];
  
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
  
  if (!entity) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Entity not found
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/catalog')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h2">
          {entityType?.charAt(0).toUpperCase() + entityType?.slice(1)} Details
        </Typography>
      </Box>
      
      {/* Entity Header */}
      <Paper variant="outlined" sx={{ mb: 3, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box display="flex" alignItems="center">
              {getEntityIcon(entityType || '')}
              <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                {entity.name}
              </Typography>
              {entity.sensitivity_label_id && (
                <Chip
                  size="small"
                  icon={<SecurityIcon />}
                  label={getSensitivityLabelName(entity.sensitivity_label_id)}
                  sx={{ 
                    ml: 2,
                    color: getSensitivityLabelColor(entity.sensitivity_label_id),
                    borderColor: getSensitivityLabelColor(entity.sensitivity_label_id)
                  }}
                  variant="outlined"
                />
              )}
            </Box>
            
            {entity.description && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {entity.description}
              </Typography>
            )}
            
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              <Chip
                size="small"
                icon={getEntityIcon(entityType || '')}
                label={entityType?.charAt(0).toUpperCase() + entityType?.slice(1)}
                color="primary"
                variant="outlined"
              />
              
              <Chip
                size="small"
                icon={<StorageIcon />}
                label={getDataSourceName(entity.data_source_id)}
                color="secondary"
                variant="outlined"
              />
              
              {entity.qualified_name && (
                <Tooltip title={entity.qualified_name}>
                  <Chip
                    size="small"
                    label="Qualified Name"
                    color="default"
                    variant="outlined"
                    onClick={() => navigator.clipboard.writeText(entity.qualified_name)}
                  />
                </Tooltip>
              )}
              
              {entityType === 'table' && (
                <Chip
                  size="small"
                  icon={<ViewColumnIcon />}
                  label={`${columns.length} Columns`}
                  color="info"
                  variant="outlined"
                />
              )}
              
              {issues.length > 0 && (
                <Chip
                  size="small"
                  icon={<WarningIcon />}
                  label={`${issues.length} Issues`}
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/catalog/${entityType}/${entityId}/edit`)}
            >
              Edit
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Entity Content */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="entity tabs">
          <Tab label="Overview" {...a11yProps(0)} />
          {entityType === 'table' && <Tab label="Columns" {...a11yProps(1)} />}
          {entityType === 'table' && <Tab label="Sample Data" {...a11yProps(2)} />}
          <Tab label="Lineage" {...a11yProps(entityType === 'table' ? 3 : 1)} />
          <Tab label="Issues" {...a11yProps(entityType === 'table' ? 4 : 2)} />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Entity Metadata */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Metadata"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {entity.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Type
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {getEntityIcon(entityType || '')}
                      <Typography variant="body1" sx={{ ml: 0.5 }}>
                        {entityType?.charAt(0).toUpperCase() + entityType?.slice(1)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Qualified Name
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {entity.qualified_name}
                    </Typography>
                  </Grid>
                  
                  {entity.schema_name && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Schema
                      </Typography>
                      <Typography variant="body1">
                        {entity.schema_name}
                      </Typography>
                    </Grid>
                  )}
                  
                  {entity.database_name && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Database
                      </Typography>
                      <Typography variant="body1">
                        {entity.database_name}
                      </Typography>
                    </Grid>
                  )}
                  
                  {entity.table_name && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Table
                      </Typography>
                      <Typography variant="body1">
                        {entity.table_name}
                      </Typography>
                    </Grid>
                  )}
                  
                  {entity.data_type && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Data Type
                      </Typography>
                      <Typography variant="body1">
                        {entity.data_type}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Data Source
                    </Typography>
                    <Typography variant="body1">
                      {getDataSourceName(entity.data_source_id)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(entity.updated_at)}
                    </Typography>
                  </Grid>
                  
                  {entity.created_at && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Created
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(entity.created_at)}
                      </Typography>
                    </Grid>
                  )}
                  
                  {entity.last_scan_id && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Last Scan
                      </Typography>
                      <Link href={`/scans/${entity.last_scan_id}`} underline="hover">
                        View Scan Details
                      </Link>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Classification & Sensitivity */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Classification & Sensitivity"
                titleTypographyProps={{ variant: 'subtitle1' }}
                action={
                  <Button
                    size="small"
                    startIcon={<SecurityIcon />}
                    onClick={() => setIsAssignLabelModalOpen(true)}
                    variant="outlined"
                  >
                    {entity.sensitivity_label_id ? 'Change Label' : 'Assign Label'}
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                {entity.sensitivity_label_id ? (
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Sensitivity Label
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <SecurityIcon sx={{ color: getSensitivityLabelColor(entity.sensitivity_label_id), mr: 1 }} />
                      <Typography variant="body1" sx={{ color: getSensitivityLabelColor(entity.sensitivity_label_id) }}>
                        {getSensitivityLabelName(entity.sensitivity_label_id)}
                      </Typography>
                    </Box>
                    
                    {entity.sensitivity_justification && (
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Sensitivity Justification
                        </Typography>
                        <Typography variant="body2">
                          {entity.sensitivity_justification}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      No sensitivity label assigned
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Classifications
                </Typography>
                
                {entity.classifications && entity.classifications.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {entity.classifications.map((classification: string) => (
                      <Chip
                        key={classification}
                        size="small"
                        icon={<LabelIcon />}
                        label={classification}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No classifications assigned
                  </Typography>
                )}
                
                {entityType === 'table' && columns.length > 0 && (
                  <Box mt={3}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Column Classification Distribution
                    </Typography>
                    
                    <Box height={200}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'High Sensitivity', value: columns.filter(c => {
                                const label = sensitivityLabels.find(l => l.id === c.sensitivity_label_id);
                                return label && label.level.toLowerCase() === 'high';
                              }).length },
                              { name: 'Medium Sensitivity', value: columns.filter(c => {
                                const label = sensitivityLabels.find(l => l.id === c.sensitivity_label_id);
                                return label && label.level.toLowerCase() === 'medium';
                              }).length },
                              { name: 'Low Sensitivity', value: columns.filter(c => {
                                const label = sensitivityLabels.find(l => l.id === c.sensitivity_label_id);
                                return label && label.level.toLowerCase() === 'low';
                              }).length },
                              { name: 'No Sensitivity', value: columns.filter(c => !c.sensitivity_label_id).length },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'High Sensitivity', color: theme.palette.error.main },
                              { name: 'Medium Sensitivity', color: theme.palette.warning.main },
                              { name: 'Low Sensitivity', color: theme.palette.info.main },
                              { name: 'No Sensitivity', color: theme.palette.grey[300] },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => [`${value} columns`, null]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Description & Additional Info */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                title="Description & Additional Information"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Description
                </Typography>
                {entity.description ? (
                  <Typography variant="body2" paragraph>
                    {entity.description}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    No description available
                  </Typography>
                )}
                
                {entity.additional_attributes && Object.keys(entity.additional_attributes).length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Additional Attributes
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Attribute</TableCell>
                            <TableCell>Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(entity.additional_attributes).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell>{key}</TableCell>
                              <TableCell>{String(value)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Columns Tab (for tables) */}
      {entityType === 'table' && (
        <TabPanel value={tabValue} index={1}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Columns ({columns.length})
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Columns and their metadata for this table
            </Typography>
          </Box>
          
          {columns.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Data Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Sensitivity</TableCell>
                    <TableCell>Classifications</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {columns.map((column) => (
                    <TableRow key={column.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <ViewColumnIcon fontSize="small" sx={{ mr: 1 }} />
                          {column.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={column.data_type} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {column.description || (
                          <Typography variant="body2" color="textSecondary">
                            No description
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {column.sensitivity_label_id ? (
                          <Chip
                            size="small"
                            icon={<SecurityIcon />}
                            label={getSensitivityLabelName(column.sensitivity_label_id)}
                            sx={{ 
                              color: getSensitivityLabelColor(column.sensitivity_label_id),
                              borderColor: getSensitivityLabelColor(column.sensitivity_label_id)
                            }}
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {column.classifications && column.classifications.length > 0 ? (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {column.classifications.map((classification: string) => (
                              <Chip
                                key={classification}
                                size="small"
                                label={classification}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => navigate(`/catalog/column/${column.id}`)}>
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
              No columns found for this table
            </Alert>
          )}
        </TabPanel>
      )}
      
      {/* Sample Data Tab (for tables) */}
      {entityType === 'table' && (
        <TabPanel value={tabValue} index={2}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Sample Data
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sample data from this table (limited to 100 rows)
            </Typography>
          </Box>
          
          {sampleData && sampleData.rows && sampleData.rows.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {sampleData.columns.map((column: string) => (
                      <TableCell key={column}>{column}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sampleData.rows.map((row: any[], rowIndex: number) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {cell !== null ? String(cell) : <span style={{ color: 'rgba(0, 0, 0, 0.38)' }}>NULL</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No sample data available for this table
            </Alert>
          )}
        </TabPanel>
      )}
      
      {/* Lineage Tab */}
      <TabPanel value={tabValue} index={entityType === 'table' ? 3 : 1}>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Data Lineage
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualize how data flows to and from this entity
          </Typography>
        </Box>
        
        {lineage && (lineage.upstream.length > 0 || lineage.downstream.length > 0) ? (
          <Grid container spacing={3}>
            {/* Upstream Lineage */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader
                  title="Upstream (Data Sources)"
                  titleTypographyProps={{ variant: 'subtitle1' }}
                  subheader={`${lineage.upstream.length} entities`}
                />
                <Divider />
                <CardContent>
                  {lineage.upstream.length > 0 ? (
                    <List disablePadding>
                      {lineage.upstream.map((upEntity: any) => (
                        <ListItem key={upEntity.id} disablePadding sx={{ py: 1 }}>
                          <ListItemIcon>
                            {getEntityIcon(upEntity.entity_type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Link 
                                href={`/catalog/${upEntity.entity_type}/${upEntity.id}`}
                                underline="hover"
                              >
                                {upEntity.name}
                              </Link>
                            }
                            secondary={`${upEntity.entity_type} | ${getDataSourceName(upEntity.data_source_id)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box p={2} textAlign="center">
                      <Typography variant="body2" color="textSecondary">
                        No upstream lineage found
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Downstream Lineage */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader
                  title="Downstream (Data Consumers)"
                  titleTypographyProps={{ variant: 'subtitle1' }}
                  subheader={`${lineage.downstream.length} entities`}
                />
                <Divider />
                <CardContent>
                  {lineage.downstream.length > 0 ? (
                    <List disablePadding>
                      {lineage.downstream.map((downEntity: any) => (
                        <ListItem key={downEntity.id} disablePadding sx={{ py: 1 }}>
                          <ListItemIcon>
                            {getEntityIcon(downEntity.entity_type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Link 
                                href={`/catalog/${downEntity.entity_type}/${downEntity.id}`}
                                underline="hover"
                              >
                                {downEntity.name}
                              </Link>
                            }
                            secondary={`${downEntity.entity_type} | ${getDataSourceName(downEntity.data_source_id)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box p={2} textAlign="center">
                      <Typography variant="body2" color="textSecondary">
                        No downstream lineage found
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Lineage Diagram Placeholder */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Lineage Diagram
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Visual representation of data lineage
                </Typography>
                <Box 
                  sx={{ 
                    height: 300, 
                    bgcolor: 'background.default', 
                    border: '1px dashed', 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Lineage visualization would be displayed here
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            No lineage information available for this entity
          </Alert>
        )}
      </TabPanel>
      
      {/* Issues Tab */}
      <TabPanel value={tabValue} index={entityType === 'table' ? 4 : 2}>
        <Box mb={3}>
          <Typography variant="h6" component="h3">
            Issues ({issues.length})
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Data quality and compliance issues related to this entity
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
                        {getIssueSeverityIcon(issue.severity)}
                        <Typography variant="subtitle1" sx={{ ml: 1 }}>
                          {issue.description}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Detected: {formatDate(issue.detected_at)}
                      </Typography>
                      
                      {issue.details && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {issue.details}
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box display="flex" flexDirection="column" alignItems="flex-end">
                        <Chip
                          size="small"
                          label={issue.severity.toUpperCase()}
                          color={getIssueSeverityColor(issue.severity)}
                          sx={{ mb: 1 }}
                        />
                        
                        <Chip
                          size="small"
                          label={issue.type}
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                    
                    {issue.remediation_steps && (
                      <Grid item xs={12}>
                        <Box mt={1} p={1.5} bgcolor="background.default" borderRadius={1}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Remediation Steps:
                          </Typography>
                          <Typography variant="body2">
                            {issue.remediation_steps}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="success">
            No issues found for this entity
          </Alert>
        )}
      </TabPanel>
      
      {/* Sensitivity Label Assignment Modal */}
      {entity && (
        <EntitySensitivityLabelAssignModal
          open={isAssignLabelModalOpen}
          onClose={() => setIsAssignLabelModalOpen(false)}
          entityType={entityType || ''}
          entityId={entityId || ''}
          entityName={entity.name || ''}
          currentLabelId={entity.sensitivity_label_id}
          onSuccess={() => {
            // Reload entity data to reflect the new label
            if (entityType && entityId) {
              const loadData = async () => {
                try {
                  setIsLoading(true);
                  const entityData = await getEntity(entityType, Number(entityId));
                  setEntity(entityData);
                } catch (err: any) {
                  setError(err.response?.data?.detail || 'Failed to reload entity details');
                } finally {
                  setIsLoading(false);
                }
              };
              
              loadData();
            }
          }}
        />
      )}
    </Box>
  );
};

export default EntityDetails;