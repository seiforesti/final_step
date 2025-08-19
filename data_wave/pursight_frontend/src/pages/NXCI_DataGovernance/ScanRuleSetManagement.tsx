import React, { useState, useEffect } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Rule as RuleIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Import scan rule set components
import { ScanRuleSetList, ScanRuleSetDetails, ScanRuleSetCreateModal, ScanRuleSetEditModal, ScanRuleVisualizer } from '../../components/scanRuleSet';
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
      id={`ruleset-tabpanel-${index}`}
      aria-labelledby={`ruleset-tab-${index}`}
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
    id: `ruleset-tab-${index}`,
    'aria-controls': `ruleset-tabpanel-${index}`,
  };
}

const ScanRuleSetManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  
  // Determine active tab based on URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/rule-sets')) return 0;
    if (path.includes('/visualizer')) return 1;
    if (path.includes('/templates')) return 2;
    return 0; // Default to rule-sets
  };

  const [value, setValue] = useState(getActiveTabFromPath());
  const [isLoading, setIsLoading] = useState(false);
  const [ruleSetStats, setRuleSetStats] = useState<any>({
    totalRuleSets: 0,
    activeRuleSets: 0,
    customRuleSets: 0,
    systemRuleSets: 0,
  });

  useEffect(() => {
    // Mock fetching rule set stats
    const fetchRuleSetStats = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with an actual API call
        setTimeout(() => {
          setRuleSetStats({
            totalRuleSets: 12,
            activeRuleSets: 8,
            customRuleSets: 7,
            systemRuleSets: 5,
          });
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching rule set stats:', error);
        setIsLoading(false);
      }
    };
    
    fetchRuleSetStats();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate to the corresponding route
    switch (newValue) {
      case 0:
        navigate('/data-governance/scan-rule-sets/rule-sets');
        break;
      case 1:
        navigate('/data-governance/scan-rule-sets/visualizer');
        break;
      case 2:
        navigate('/data-governance/scan-rule-sets/templates');
        break;
      default:
        navigate('/data-governance/scan-rule-sets/rule-sets');
    }
  };

  const handleCreateRuleSet = () => {
    openModal({
      component: ScanRuleSetCreateModal,
      props: {
        onSuccess: () => {
          // Refresh rule set list after creation
          // This would be replaced with an actual API call
          setRuleSetStats(prev => ({
            ...prev,
            totalRuleSets: prev.totalRuleSets + 1,
            customRuleSets: prev.customRuleSets + 1,
          }));
        }
      }
    });
  };

  const renderRuleSetStats = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Chip 
          icon={<RuleIcon />} 
          label={`${ruleSetStats.totalRuleSets} Total`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          icon={<PlayArrowIcon />} 
          label={`${ruleSetStats.activeRuleSets} Active`} 
          color="success" 
          variant="outlined" 
        />
        <Chip 
          icon={<EditIcon />} 
          label={`${ruleSetStats.customRuleSets} Custom`} 
          color="info" 
          variant="outlined" 
        />
        <Chip 
          icon={<SettingsIcon />} 
          label={`${ruleSetStats.systemRuleSets} System`} 
          variant="outlined" 
        />
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
          Scan Rule Sets
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton 
              size="small"
              onClick={() => {
                setIsLoading(true);
                // This would be replaced with an actual API call
                setTimeout(() => {
                  setRuleSetStats({
                    totalRuleSets: 12,
                    activeRuleSets: 8,
                    customRuleSets: 7,
                    systemRuleSets: 5,
                  });
                  setIsLoading(false);
                }, 500);
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateRuleSet}
          >
            Create Rule Set
          </Button>
        </Box>
      </Box>
      
      {renderRuleSetStats()}
      
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="scan rule set management tabs"
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
            <Tab 
              icon={<RuleIcon fontSize="small" />} 
              iconPosition="start" 
              label="Rule Sets" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<VisibilityIcon fontSize="small" />} 
              iconPosition="start" 
              label="Rule Visualizer" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<CategoryIcon fontSize="small" />} 
              iconPosition="start" 
              label="Templates" 
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>
        
        <Routes>
          <Route path="/rule-sets" element={
            <Box sx={{ p: 0 }}>
              <ScanRuleSetList />
            </Box>
          } />
          <Route path="/rule-sets/:ruleSetId" element={
            <Box sx={{ p: 0 }}>
              <ScanRuleSetDetails />
            </Box>
          } />
          <Route path="/visualizer" element={
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Rule Visualizer</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Visualize and explore the relationships between scan rules and their effects on data.
              </Typography>
              <ScanRuleVisualizer />
            </Box>
          } />
          <Route path="/visualizer/:ruleSetId" element={
            <Box sx={{ p: 0 }}>
              <ScanRuleVisualizer />
            </Box>
          } />
          <Route path="/templates" element={
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Rule Set Templates</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Browse and use pre-defined rule set templates for common scanning scenarios.
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>PII Detection</Typography>
                      <Typography variant="body2" paragraph>
                        Rules for detecting personally identifiable information in your data.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          // Logic to create a rule set from this template
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Financial Data</Typography>
                      <Typography variant="body2" paragraph>
                        Rules for detecting and classifying financial information.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          // Logic to create a rule set from this template
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Healthcare Data</Typography>
                      <Typography variant="body2" paragraph>
                        Rules for detecting and classifying healthcare information (HIPAA).
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          // Logic to create a rule set from this template
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          } />
          <Route path="*" element={
            <Box sx={{ p: 0 }}>
              <ScanRuleSetList />
            </Box>
          } />
        </Routes>
      </Paper>
    </Box>
  );
};

export default ScanRuleSetManagement;