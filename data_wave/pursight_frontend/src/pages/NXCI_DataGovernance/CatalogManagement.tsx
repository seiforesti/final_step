import React, { useState } from 'react';
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

// Import catalog components
import { EntityList, EntityDetails, EntityCreateEditModal, EntityLineageView } from '../../components/catalog';
import { useModal } from '../../hooks/useModal';

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
      id={`catalog-tabpanel-${index}`}
      aria-labelledby={`catalog-tab-${index}`}
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
    id: `catalog-tab-${index}`,
    'aria-controls': `catalog-tabpanel-${index}`,
  };
}

const CatalogManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate to the corresponding route
    switch (newValue) {
      case 0:
        navigate('/catalog/entities');
        break;
      case 1:
        navigate('/catalog/lineage');
        break;
      case 2:
        navigate('/catalog/import-export');
        break;
      default:
        navigate('/catalog/entities');
    }
  };

  const handleCreateEntity = () => {
    openModal({
      component: EntityCreateEditModal,
      props: {
        onSuccess: () => {
          // Refresh entity list after creation
          // This would typically be handled by the modal component
        }
      }
    });
  };

  const handleToggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

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
          >
            Create Entity
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="catalog management tabs"
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
        
        <Routes>
          <Route path="entities" element={
            <Box sx={{ p: 0 }}>
              <EntityList />
            </Box>
          } />
          <Route path="entities/:entityId" element={
            <Box sx={{ p: 0 }}>
              <EntityDetails />
            </Box>
          } />
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
          <Route path="import-export" element={
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Import & Export</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Import entities from various sources or export your catalog data for backup or migration purposes.
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Import</Typography>
                      <Typography variant="body2" paragraph>
                        Import entities from CSV, JSON, or connect to external systems.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mr: 1 }}
                      >
                        Upload File
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ImportExportIcon />}
                      >
                        Connect Source
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Export</Typography>
                      <Typography variant="body2" paragraph>
                        Export your catalog data in various formats for backup or analysis.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownloadIcon />}
                        sx={{ mr: 1 }}
                      >
                        Export as CSV
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownloadIcon />}
                      >
                        Export as JSON
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          } />
          <Route path="*" element={
            <Box sx={{ p: 0 }}>
              <EntityList />
            </Box>
          } />
        </Routes>
      </Paper>
    </Box>
  );
};

export default CatalogManagement;