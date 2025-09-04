import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  alpha,
} from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Label as LabelIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Tune as TuneIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

// Import custom theme context
import { useTheme as useCustomTheme, useSensitivityColor } from '../../context/ThemeContext';

// Import sensitivity components
import { SensitivityLabelList, SensitivityLabelCreateEditModal, EntitySensitivityLabelAssignModal } from '../../components/sensitivity';
import { useModal } from '../../hooks/useModal';
import { useSensitivityLabels } from '../../hooks/useSensitivityLabels';

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const AnimatedBox = styled(Box)(({ theme }) => ({
  animation: `${fadeIn} 0.5s ease-out`,
}));

const AnimatedChip = styled(Chip)(({ theme }) => ({
  animation: `${slideIn} 0.5s ease-out`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const PulseIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover .MuiSvgIcon-root': {
    animation: `${pulse} 0.5s ease-in-out`,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha('#0078d4', 0.08),
    },
  },
}));

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
      id={`sensitivity-tabpanel-${index}`}
      aria-labelledby={`sensitivity-tab-${index}`}
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
    id: `sensitivity-tab-${index}`,
    'aria-controls': `sensitivity-tabpanel-${index}`,
  };
}

const SensitivityManagement: React.FC = () => {
  const { currentTheme, isDarkMode } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  const { getSensitivityStats, isLoading, error } = useSensitivityLabels();
  
  const [sensitivityStats, setSensitivityStats] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Determine active tab based on URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/labels')) return 0;
    if (path.includes('/assignments')) return 1;
    if (path.includes('/history')) return 2;
    if (path.includes('/policies')) return 3;
    return 0; // Default to labels
  };

  const [value, setValue] = useState(getActiveTabFromPath());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getSensitivityStats();
        setSensitivityStats(stats);
        setLastRefreshed(new Date());
      } catch (error) {
        console.error('Error fetching sensitivity stats:', error);
      }
    };
    
    fetchStats();
  }, [getSensitivityStats]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate to the corresponding route
    switch (newValue) {
      case 0:
        navigate('/data-governance/sensitivity/labels');
        break;
      case 1:
        navigate('/data-governance/sensitivity/assignments');
        break;
      case 2:
        navigate('/data-governance/sensitivity/history');
        break;
      case 3:
        navigate('/data-governance/sensitivity/policies');
        break;
      default:
        navigate('/data-governance/sensitivity/labels');
    }
  };

  const handleCreateLabel = () => {
    openModal({
      component: SensitivityLabelCreateEditModal,
      props: {
        onSuccess: () => {
          // Refresh label list after creation
          getSensitivityStats().then(stats => {
            setSensitivityStats(stats);
            setLastRefreshed(new Date());
          });
        }
      }
    });
  };

  const handleAssignLabel = () => {
    openModal({
      component: EntitySensitivityLabelAssignModal,
      props: {
        onSuccess: () => {
          // Refresh after assignment
          getSensitivityStats().then(stats => {
            setSensitivityStats(stats);
            setLastRefreshed(new Date());
          });
        }
      }
    });
  };

  const renderSensitivityStats = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} sx={{ color: currentTheme.primary.main }} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2, animation: `${fadeIn} 0.5s ease-out` }}>
          Error loading sensitivity statistics
        </Alert>
      );
    }

    if (!sensitivityStats) return null;

    return (
      <AnimatedBox sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <AnimatedChip 
          icon={<LabelIcon />} 
          label={`${sensitivityStats.totalLabels || 0} Labels`} 
          sx={{ 
            backgroundColor: alpha(currentTheme.primary.main, 0.1),
            color: currentTheme.primary.main,
            borderColor: alpha(currentTheme.primary.main, 0.3),
            fontWeight: 500
          }}
          variant="outlined" 
        />
        <AnimatedChip 
          icon={<AssignmentIcon />} 
          label={`${sensitivityStats.totalAssignments || 0} Assignments`} 
          sx={{ 
            backgroundColor: alpha(currentTheme.status.info, 0.1),
            color: currentTheme.status.info,
            borderColor: alpha(currentTheme.status.info, 0.3),
            fontWeight: 500
          }}
          variant="outlined" 
        />
        <AnimatedChip 
          icon={<SecurityIcon />} 
          label={`${sensitivityStats.confidentialEntities || 0} Confidential`} 
          sx={{ 
            backgroundColor: alpha(currentTheme.sensitivity.high, 0.1),
            color: currentTheme.sensitivity.high,
            borderColor: alpha(currentTheme.sensitivity.high, 0.3),
            fontWeight: 500
          }}
          variant="outlined" 
        />
        <AnimatedChip 
          icon={<VisibilityIcon />} 
          label={`${sensitivityStats.publicEntities || 0} Public`} 
          sx={{ 
            backgroundColor: alpha(currentTheme.sensitivity.low, 0.1),
            color: currentTheme.sensitivity.low,
            borderColor: alpha(currentTheme.sensitivity.low, 0.3),
            fontWeight: 500
          }}
          variant="outlined" 
        />
      </AnimatedBox>
    );
  };

  return (
    <AnimatedBox sx={{ flexGrow: 1 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 3,
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 600, 
              color: currentTheme.text.primary,
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <SecurityIcon sx={{ color: currentTheme.primary.main }} />
            Sensitivity Management
          </Typography>
          {lastRefreshed && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: currentTheme.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <NotificationsIcon fontSize="small" />
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Refresh stats">
            <PulseIconButton 
              size="small"
              onClick={() => {
                getSensitivityStats().then(stats => {
                  setSensitivityStats(stats);
                  setLastRefreshed(new Date());
                });
              }}
              sx={{ 
                color: currentTheme.primary.main,
                backgroundColor: alpha(currentTheme.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(currentTheme.primary.main, 0.2),
                }
              }}
            >
              <RefreshIcon />
            </PulseIconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={handleAssignLabel}
            sx={{ 
              mr: 1,
              borderColor: currentTheme.secondary.main,
              color: currentTheme.secondary.main,
              '&:hover': {
                borderColor: currentTheme.secondary.dark,
                backgroundColor: alpha(currentTheme.secondary.main, 0.1),
              }
            }}
          >
            Assign Label
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateLabel}
            sx={{ 
              backgroundColor: currentTheme.primary.main,
              '&:hover': {
                backgroundColor: currentTheme.primary.dark,
              }
            }}
          >
            Create Label
          </Button>
        </Box>
      </Box>
      
      {renderSensitivityStats()}
      
      <Paper 
        elevation={isDarkMode ? 1 : 2} 
        sx={{ 
          mb: 3, 
          borderRadius: 2, 
          overflow: 'hidden',
          backgroundColor: currentTheme.background.paper,
          boxShadow: currentTheme.shadows.card,
          border: `1px solid ${alpha(currentTheme.border.light, 0.5)}`,
        }}
      >
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: alpha(currentTheme.border.light, 0.8),
          backgroundColor: isDarkMode ? alpha(currentTheme.background.elevated, 0.5) : alpha(currentTheme.background.default, 0.5),
        }}>
          <StyledTabs
            value={value}
            onChange={handleChange}
            aria-label="sensitivity management tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: '48px',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: currentTheme.text.secondary,
                transition: 'all 0.2s ease',
              },
              '& .Mui-selected': {
                fontWeight: 600,
                color: currentTheme.primary.main,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: currentTheme.primary.main,
                height: 3,
              }
            }}
          >
            <Tab 
              icon={<LabelIcon fontSize="small" />} 
              iconPosition="start" 
              label="Labels" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<AssignmentIcon fontSize="small" />} 
              iconPosition="start" 
              label="Assignments" 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<HistoryIcon fontSize="small" />} 
              iconPosition="start" 
              label="History" 
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<SettingsIcon fontSize="small" />} 
              iconPosition="start" 
              label="Policies" 
              {...a11yProps(3)} 
            />
          </StyledTabs>
        </Box>
        
        <Routes>
          <Route path="/labels" element={
            <AnimatedBox sx={{ p: 0 }}>
              <SensitivityLabelList />
            </AnimatedBox>
          } />
          <Route path="/assignments" element={
            <AnimatedBox sx={{ p: 3, animation: `${fadeIn} 0.5s ease-out` }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: currentTheme.text.primary,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AssignmentIcon sx={{ color: currentTheme.secondary.main }} />
                Label Assignments
              </Typography>
              <Typography 
                variant="body2" 
                paragraph 
                sx={{ color: currentTheme.text.secondary }}
              >
                View and manage sensitivity label assignments across your data assets.
              </Typography>
              
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  mt: 2,
                  border: `1px solid ${alpha(currentTheme.border.light, 0.5)}`,
                  borderRadius: 1,
                  overflow: 'hidden',
                  backgroundColor: isDarkMode ? alpha(currentTheme.background.paper, 0.6) : currentTheme.background.paper,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: isDarkMode ? alpha(currentTheme.background.elevated, 0.5) : alpha(currentTheme.background.default, 0.5) }}>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Entity Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Entity Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Label</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Assigned By</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Assigned Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Expiration</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* This would be populated with actual data */}
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          p: 4,
                          color: currentTheme.text.secondary,
                        }}>
                          <AssignmentIcon sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2" sx={{ color: 'inherit' }}>
                            No assignments found. Use the "Assign Label" button to create new assignments.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </AnimatedBox>
          } />
          <Route path="/history" element={
            <AnimatedBox sx={{ p: 3, animation: `${fadeIn} 0.5s ease-out` }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: currentTheme.text.primary,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <HistoryIcon sx={{ color: currentTheme.secondary.main }} />
                Label History
              </Typography>
              <Typography 
                variant="body2" 
                paragraph 
                sx={{ color: currentTheme.text.secondary }}
              >
                View the history of sensitivity label changes and assignments.
              </Typography>
              
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  mt: 2,
                  border: `1px solid ${alpha(currentTheme.border.light, 0.5)}`,
                  borderRadius: 1,
                  overflow: 'hidden',
                  backgroundColor: isDarkMode ? alpha(currentTheme.background.paper, 0.6) : currentTheme.background.paper,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: isDarkMode ? alpha(currentTheme.background.elevated, 0.5) : alpha(currentTheme.background.default, 0.5) }}>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Entity</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Old Label</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>New Label</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Changed By</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: currentTheme.text.primary }}>Justification</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* This would be populated with actual data */}
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          p: 4,
                          color: currentTheme.text.secondary,
                        }}>
                          <HistoryIcon sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2" sx={{ color: 'inherit' }}>
                            No history records found.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </AnimatedBox>
          } />
          <Route path="/policies" element={
            <AnimatedBox sx={{ p: 3, animation: `${fadeIn} 0.5s ease-out` }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: currentTheme.text.primary,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <SettingsIcon sx={{ color: currentTheme.secondary.main }} />
                Sensitivity Policies
              </Typography>
              <Typography 
                variant="body2" 
                paragraph 
                sx={{ color: currentTheme.text.secondary }}
              >
                Configure policies for automatic sensitivity label assignment and enforcement.
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={isDarkMode ? 1 : 2}
                    sx={{ 
                      backgroundColor: currentTheme.background.card,
                      borderRadius: 2,
                      border: `1px solid ${alpha(currentTheme.border.light, 0.5)}`,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: currentTheme.shadows.dropdown,
                      }
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          color: currentTheme.text.primary,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <TuneIcon sx={{ color: currentTheme.primary.main }} />
                        Automatic Classification
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ color: currentTheme.text.secondary }}>
                        Configure rules for automatically assigning sensitivity labels based on scan results.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        sx={{ 
                          borderColor: currentTheme.primary.main,
                          color: currentTheme.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(currentTheme.primary.main, 0.1),
                          }
                        }}
                      >
                        Configure Rules
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={isDarkMode ? 1 : 2}
                    sx={{ 
                      backgroundColor: currentTheme.background.card,
                      borderRadius: 2,
                      border: `1px solid ${alpha(currentTheme.border.light, 0.5)}`,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: currentTheme.shadows.dropdown,
                      }
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          color: currentTheme.text.primary,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <SecurityIcon sx={{ color: currentTheme.primary.main }} />
                        Label Inheritance
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ color: currentTheme.text.secondary }}>
                        Configure how sensitivity labels are inherited through data lineage relationships.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        sx={{ 
                          borderColor: currentTheme.primary.main,
                          color: currentTheme.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(currentTheme.primary.main, 0.1),
                          }
                        }}
                      >
                        Configure Inheritance
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AnimatedBox>
          } />
          <Route path="*" element={
            <AnimatedBox sx={{ p: 0 }}>
              <SensitivityLabelList />
            </AnimatedBox>
          } />
        </Routes>
      </Paper>
    </AnimatedBox>
  );
};

export default SensitivityManagement;