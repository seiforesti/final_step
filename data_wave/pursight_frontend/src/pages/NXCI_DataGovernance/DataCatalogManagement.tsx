import React, { useState, useEffect } from 'react';
import { useDataCatalog } from '../../hooks/useDataCatalog';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Divider,
  useTheme,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ImportExport as ImportExportIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';

// Import catalog components (assuming these exist or will be created)
import EntityList from '../../components/catalog/EntityList';
import EntityDetails from '../../components/catalog/EntityDetails';
import EntityCreateEditModal from '../../components/catalog/EntityCreateEditModal';
import EntityLineageView from '../../components/catalog/EntityLineageView';
import { useModal } from '../../hooks/useModal';

import { CircularProgress } from '@mui/material';

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
      id={`data-catalog-tabpanel-${index}`}
      aria-labelledby={`data-catalog-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, width: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `data-catalog-tab-${index}`,
    'aria-controls': `data-catalog-tabpanel-${index}`,
  };
}

const DataCatalogManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal, closeModal, isOpen } = useModal();

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: entities, isLoading, isError, error, refetch } = useDataCatalog().getEntities(filters);

  
  // Determine active tab based on URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/entities')) return 0;
    if (path.includes('/lineage')) return 1;
    if (path.includes('/import-export')) return 2;
    return 0; // Default to entities
  };

  const [value, setValue] = useState(getActiveTabFromPath());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    setValue(getActiveTabFromPath());
  }, [location.pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate to the corresponding route
    switch (newValue) {
      case 0:
        navigate('/data-catalog/entities');
        break;
      case 1:
        navigate('/data-catalog/lineage');
        break;
      case 2:
        navigate('/data-catalog/import-export');
        break;
      default:
        navigate('/data-catalog/entities');
    }
  };

  const handleCreateEntity = () => {
    openModal();
  };

  const handleRefreshEntities = () => {
    refetch();
  };

  const handleToggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  if (isError) return <Typography color="error">Error: {error?.message}</Typography>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
          Data Catalog
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={viewMode === 'list' ? 'Grid View' : 'List View'}>
            <IconButton onClick={handleToggleViewMode} size="small">
              {viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateEntity}
            sx={{ mr: 1 }}
          >
            Create Entity
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshEntities}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="data catalog management tabs"
            sx={{
              '& .MuiTab-root': {
                minHeight: '48px',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
              },
              '& .Mui-selected': {
                fontWeight: 600,
              }
            }}
          >
            <Tab label="Entities" {...a11yProps(0)} />
            <Tab label="Lineage" {...a11yProps(1)} />
            <Tab label="Import/Export" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          <Routes>
            <Route path="entities" element={
              <Box sx={{ p: 0 }}>
                <EntityList entities={entities} viewMode={viewMode} />
              </Box>
            } />
            <Route path="entities/:entityId" element={
              <Box sx={{ p: 0 }}>
                <EntityDetails />
              </Box>
            } />
          </Routes>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Routes>
            <Route path="lineage" element={
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Data Lineage Explorer</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Visualize and explore data lineage across your data assets. Select an entity to view its upstream and downstream dependencies.
                </Typography>
                <EntityLineageView />
              </Box>
            } />
            <Route path="lineage/:entityId" element={
              <Box sx={{ p: 0 }}>
                <EntityLineageView />
              </Box>
            } />
          </Routes>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Import & Export</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Import entities from various sources or export your catalog data for backup or migration purposes.
              </Typography>
            </Box>
            <Routes>
              <Route path="import-export" element={
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CloudUploadIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Import Data</Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            Upload a file to import new entities or update existing ones in your data catalog.
                          </Typography>
                          <Button variant="contained" startIcon={<CloudUploadIcon />}>
                            Upload File
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CloudDownloadIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Export Data</Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            Download your entire data catalog or a filtered subset in various formats.
                          </Typography>
                          <Button variant="contained" startIcon={<CloudDownloadIcon />}>
                            Export Data
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              } />
            </Routes>
          </>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default DataCatalogManagement;