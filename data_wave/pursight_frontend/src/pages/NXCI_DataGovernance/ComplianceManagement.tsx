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
  Dashboard as DashboardIcon,
  Rule as RuleIcon,
  Assignment as AssignmentIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

// Import compliance components
import { ComplianceDashboard, ComplianceRuleList, ComplianceRuleDetails, ComplianceRuleCreateModal, ComplianceRuleEditModal } from '../../components/compliance';
import { useModal } from '../../hooks/useModal';
import { useComplianceManagement } from '../../hooks/useComplianceManagement';

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
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
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
    id: `compliance-tab-${index}`,
    'aria-controls': `compliance-tabpanel-${index}`,
  };
}

const ComplianceManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  const { getComplianceStats, isLoading, error } = useComplianceManagement();
  
  const [complianceStats, setComplianceStats] = useState<any>(null);
  
  // Determine active tab based on URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 0;
    if (path.includes('/rules')) return 1;
    if (path.includes('/issues')) return 2;
    return 0; // Default to dashboard
  };

  const [value, setValue] = useState(getActiveTabFromPath());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getComplianceStats();
        setComplianceStats(stats);
      } catch (error) {
        console.error('Error fetching compliance stats:', error);
      }
    };
    
    fetchStats();
  }, [getComplianceStats]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate to the corresponding route
    switch (newValue) {
      case 0:
        navigate('/data-governance/compliance/dashboard');
        break;
      case 1:
        navigate('/data-governance/compliance/rules');
        break;
      case 2:
        navigate('/data-governance/compliance/issues');
        break;
      default:
        navigate('/data-governance/compliance/dashboard');
    }
  };

  const handleCreateRule = () => {
    openModal({
      component: ComplianceRuleCreateModal,
      props: {
        onSuccess: () => {
          // Refresh rule list after creation
        }
      }
    });
  };

  const renderComplianceStats = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading compliance statistics
        </Alert>
      );
    }

    if (!complianceStats) return null;

    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Chip 
          icon={<RuleIcon />} 
          label={`${complianceStats.totalRules || 0} Rules`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          icon={<CheckCircleIcon />} 
          label={`${complianceStats.compliantEntities || 0} Compliant`} 
          color="success" 
          variant="outlined" 
        />
        <Chip 
          icon={<ErrorIcon />} 
          label={`${complianceStats.criticalIssues || 0} Critical`} 
          color="error" 
          variant="outlined" 
        />
        <Chip 
          icon={<WarningIcon />} 
          label={`${complianceStats.highIssues || 0} High`} 
          color="warning" 
          variant="outlined" 
        />
        <Chip 
          icon={<InfoIcon />} 
          label={`${complianceStats.mediumIssues || 0} Medium`} 
          color="info" 
          variant="outlined" 
        />
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
          Compliance Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton 
              size="small"
              onClick={() => {
                getComplianceStats().then(stats => setComplianceStats(stats));
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateRule}
          >
            Create Rule
          </Button>
        </Box>
      </Box>
      
      {renderComplianceStats()}
      
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="compliance management tabs"
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
              icon={<DashboardIcon fontSize="small" />} 
              iconPosition="start" 
              label="Dashboard" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<RuleIcon fontSize="small" />} 
              iconPosition="start" 
              label="Rules" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<ErrorIcon fontSize="small" />} 
              iconPosition="start" 
              label="Issues" 
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>
        
        <Routes>
          <Route path="/dashboard" element={
            <Box sx={{ p: 0 }}>
              <ComplianceDashboard />
            </Box>
          } />
          <Route path="/rules" element={
            <Box sx={{ p: 0 }}>
              <ComplianceRuleList />
            </Box>
          } />
          <Route path="/rules/:ruleId" element={
            <Box sx={{ p: 0 }}>
              <ComplianceRuleDetails />
            </Box>
          } />
          <Route path="/issues" element={
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Compliance Issues</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                View and manage all compliance issues across your data assets.
              </Typography>
              
              {/* This would be a custom component for issues, but for now we'll use a placeholder */}
              <Alert severity="info" sx={{ mt: 2 }}>
                This section would display a list of all compliance issues with filtering and sorting capabilities.
              </Alert>
            </Box>
          } />
          <Route path="*" element={
            <Box sx={{ p: 0 }}>
              <ComplianceDashboard />
            </Box>
          } />
        </Routes>
      </Paper>
    </Box>
  );
};

export default ComplianceManagement;