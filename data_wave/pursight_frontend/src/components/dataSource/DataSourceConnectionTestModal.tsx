import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDataSources } from '../../hooks/useDataSources';
import { DataSourceConnectionTest } from '../../models/DataSourceStats';

interface DataSourceConnectionTestModalProps {
  open: boolean;
  onClose: () => void;
  dataSourceId: number;
  testConnection: (id: number) => Promise<DataSourceConnectionTest>;
}

const DataSourceConnectionTestModal: React.FC<DataSourceConnectionTestModalProps> = ({
  open,
  onClose,
  dataSourceId,
  testConnection,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DataSourceConnectionTest | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { fetchDataSourceDetails } = useDataSources();
  const { data: dataSource } = fetchDataSourceDetails(dataSourceId);

  useEffect(() => {
    if (open && dataSourceId) {
      handleTestConnection();
    }
  }, [open, dataSourceId]);

  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await testConnection(dataSourceId);
      setResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to test connection');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Connection Test: {dataSource?.name || `Data Source #${dataSourceId}`}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Testing connection to {dataSource?.name || `Data Source #${dataSourceId}`}...
            </Typography>
          </Box>
        ) : result ? (
          <Box>
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: result.success ? 'success.light' : 'error.light' }}>
              <Box display="flex" alignItems="center">
                {result.success ? (
                  <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 32 }} />
                ) : (
                  <ErrorIcon color="error" sx={{ mr: 2, fontSize: 32 }} />
                )}
                <Typography variant="h6">
                  {result.success ? 'Connection Successful' : 'Connection Failed'}
                </Typography>
              </Box>
              {result.message && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {result.message}
                </Typography>
              )}
            </Paper>

            <Typography variant="subtitle1" gutterBottom>
              Connection Details
            </Typography>

            <List component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Connection Type"
                  secondary={dataSource?.source_type?.toUpperCase() || 'Unknown'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Host"
                  secondary={`${dataSource?.host}:${dataSource?.port}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Database"
                  secondary={dataSource?.database_name || 'N/A'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Connection Time"
                  secondary={`${result.connection_time_ms} ms`}
                />
              </ListItem>
            </List>

            {result.details && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" gutterBottom>
                    Test Results
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => toggleSection('details')}
                    endIcon={expandedSection === 'details' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  >
                    {expandedSection === 'details' ? 'Hide Details' : 'Show Details'}
                  </Button>
                </Box>

                <Collapse in={expandedSection === 'details'}>
                  <Paper variant="outlined" sx={{ p: 0 }}>
                    <List>
                      {Object.entries(result.details).map(([key, value]) => (
                        <React.Fragment key={key}>
                          <ListItem>
                            <ListItemIcon>
                              {typeof value === 'boolean' ? (
                                value ? (
                                  <CheckCircleIcon color="success" />
                                ) : (
                                  <ErrorIcon color="error" />
                                )
                              ) : (
                                <InfoIcon color="info" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              secondary={typeof value === 'boolean' ? (value ? 'Success' : 'Failed') : value}
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Collapse>
              </>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommendations
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => toggleSection('recommendations')}
                    endIcon={
                      expandedSection === 'recommendations' ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                  >
                    {expandedSection === 'recommendations' ? 'Hide Recommendations' : 'Show Recommendations'}
                  </Button>
                </Box>

                <Collapse in={expandedSection === 'recommendations'}>
                  <Paper variant="outlined" sx={{ p: 0 }}>
                    <List>
                      {result.recommendations.map((recommendation, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemIcon>
                              {recommendation.severity === 'critical' ? (
                                <ErrorIcon color="error" />
                              ) : recommendation.severity === 'warning' ? (
                                <WarningIcon color="warning" />
                              ) : (
                                <InfoIcon color="info" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={recommendation.title}
                              secondary={recommendation.description}
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Collapse>
              </>
            )}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!isLoading && result && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleTestConnection}
            startIcon={<RefreshIcon />}
          >
            Test Again
          </Button>
        )}
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataSourceConnectionTestModal;