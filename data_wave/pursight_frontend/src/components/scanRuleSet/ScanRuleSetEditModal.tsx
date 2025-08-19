import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { useDataSources } from '../../hooks/useDataSources';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface ScanRuleSetEditModalProps {
  open: boolean;
  onClose: () => void;
  ruleSetId: number;
  onSuccess?: () => void;
}

const ScanRuleSetEditModal: React.FC<ScanRuleSetEditModalProps> = ({
  open,
  onClose,
  ruleSetId,
  onSuccess,
}) => {
  const { 
    getScanRuleSetById, 
    updateScanRuleSet, 
    isUpdatingScanRuleSet, 
    validatePatterns 
  } = useScanRuleSets();
  const { dataSources, isDataSourcesLoading } = useDataSources();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [includePattern, setIncludePattern] = useState('');
  const [excludePattern, setExcludePattern] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    description: Yup.string(),
    is_global: Yup.boolean(),
    data_source_id: Yup.number().when('is_global', {
      is: false,
      then: Yup.number().required('Data source is required when not global'),
      otherwise: Yup.number().nullable(),
    }),
    include_patterns: Yup.array().of(Yup.string()).min(1, 'At least one include pattern is required'),
    exclude_patterns: Yup.array().of(Yup.string()),
  });

  const formik = useFormik({
    initialValues: {
      id: ruleSetId,
      name: '',
      description: '',
      is_global: false,
      data_source_id: null,
      include_patterns: ['*'],
      exclude_patterns: [],
      scan_settings: {},
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await updateScanRuleSet(values);
        onSuccess?.();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to update scan rule set');
      }
    },
    enableReinitialize: true,
  });

  // Load rule set data when modal opens
  useEffect(() => {
    const loadRuleSet = async () => {
      if (open && ruleSetId) {
        try {
          setLoading(true);
          setError(null);
          const ruleSet = await getScanRuleSetById(ruleSetId);
          
          // Initialize form with rule set data
          formik.setValues({
            id: ruleSet.id,
            name: ruleSet.name,
            description: ruleSet.description || '',
            is_global: ruleSet.is_global,
            data_source_id: ruleSet.data_source_id,
            include_patterns: ruleSet.include_patterns || ['*'],
            exclude_patterns: ruleSet.exclude_patterns || [],
            scan_settings: ruleSet.scan_settings || {},
          });
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to load scan rule set');
        } finally {
          setLoading(false);
        }
      }
    };

    loadRuleSet();
  }, [open, ruleSetId, getScanRuleSetById]);

  const handleAddIncludePattern = () => {
    if (includePattern.trim()) {
      const newPatterns = [...formik.values.include_patterns, includePattern.trim()];
      formik.setFieldValue('include_patterns', newPatterns);
      setIncludePattern('');
    }
  };

  const handleAddExcludePattern = () => {
    if (excludePattern.trim()) {
      const newPatterns = [...formik.values.exclude_patterns, excludePattern.trim()];
      formik.setFieldValue('exclude_patterns', newPatterns);
      setExcludePattern('');
    }
  };

  const handleRemoveIncludePattern = (index: number) => {
    const newPatterns = [...formik.values.include_patterns];
    newPatterns.splice(index, 1);
    formik.setFieldValue('include_patterns', newPatterns);
  };

  const handleRemoveExcludePattern = (index: number) => {
    const newPatterns = [...formik.values.exclude_patterns];
    newPatterns.splice(index, 1);
    formik.setFieldValue('exclude_patterns', newPatterns);
  };

  const handleValidatePatterns = async () => {
    if (!formik.values.data_source_id) {
      setError('Please select a data source to validate patterns');
      return;
    }

    try {
      setIsValidating(true);
      setError(null);
      const result = await validatePatterns({
        data_source_id: formik.values.data_source_id,
        include_patterns: formik.values.include_patterns,
        exclude_patterns: formik.values.exclude_patterns,
      });
      setValidationResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate patterns');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Edit Scan Rule Set</Typography>
            <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading rule set data...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Scan Rule Set</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Rule Set Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={1}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_global}
                    onChange={(e) => {
                      formik.setFieldValue('is_global', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('data_source_id', null);
                      }
                    }}
                    name="is_global"
                    color="primary"
                    disabled={true} // Cannot change global status after creation
                  />
                }
                label="Global Rule Set (applies to all data sources)"
              />
            </Grid>
            
            {!formik.values.is_global && (
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.data_source_id && Boolean(formik.errors.data_source_id)}
                  disabled={true} // Cannot change data source after creation
                >
                  <InputLabel id="data-source-label">Data Source</InputLabel>
                  <Select
                    labelId="data-source-label"
                    id="data_source_id"
                    name="data_source_id"
                    value={formik.values.data_source_id || ''}
                    onChange={formik.handleChange}
                    label="Data Source"
                  >
                    {isDataSourcesLoading ? (
                      <MenuItem value="" disabled>
                        Loading...
                      </MenuItem>
                    ) : dataSources && dataSources.length > 0 ? (
                      dataSources.map((source: any) => (
                        <MenuItem key={source.id} value={source.id}>
                          {source.name} ({source.source_type})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No data sources available
                      </MenuItem>
                    )}
                  </Select>
                  {formik.touched.data_source_id && formik.errors.data_source_id && (
                    <FormHelperText>{formik.errors.data_source_id as string}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Include Patterns
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Specify patterns to include in the scan. Use * as a wildcard.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  label="Include Pattern"
                  value={includePattern}
                  onChange={(e) => setIncludePattern(e.target.value)}
                  placeholder="e.g., *.sql, customer_*, etc."
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddIncludePattern}
                  startIcon={<AddIcon />}
                  disabled={!includePattern.trim()}
                >
                  Add
                </Button>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 0, maxHeight: 200, overflow: 'auto' }}>
                <List dense>
                  {formik.values.include_patterns.length > 0 ? (
                    formik.values.include_patterns.map((pattern, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={pattern} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveIncludePattern(index)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No include patterns added"
                        primaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
              {formik.touched.include_patterns && formik.errors.include_patterns && (
                <FormHelperText error>{formik.errors.include_patterns as string}</FormHelperText>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Exclude Patterns
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Specify patterns to exclude from the scan. Use * as a wildcard.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  label="Exclude Pattern"
                  value={excludePattern}
                  onChange={(e) => setExcludePattern(e.target.value)}
                  placeholder="e.g., temp_*, log_*, etc."
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddExcludePattern}
                  startIcon={<AddIcon />}
                  disabled={!excludePattern.trim()}
                >
                  Add
                </Button>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 0, maxHeight: 200, overflow: 'auto' }}>
                <List dense>
                  {formik.values.exclude_patterns.length > 0 ? (
                    formik.values.exclude_patterns.map((pattern, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={pattern} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveExcludePattern(index)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No exclude patterns added"
                        primaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
            
            {!formik.values.is_global && formik.values.data_source_id && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleValidatePatterns}
                    disabled={isValidating || formik.values.include_patterns.length === 0}
                    startIcon={isValidating ? <CircularProgress size={20} /> : <CheckIcon />}
                  >
                    {isValidating ? 'Validating...' : 'Validate Patterns'}
                  </Button>
                </Box>
                
                {validationResult && (
                  <Box mt={2}>
                    <Alert severity={validationResult.valid ? 'success' : 'warning'}>
                      {validationResult.valid
                        ? 'Patterns are valid and will match the expected entities.'
                        : 'Patterns may not match any entities or have issues.'}
                    </Alert>
                    
                    {validationResult.matched_entities && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Matched Entities: {validationResult.matched_entities.length}
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {validationResult.matched_entities.slice(0, 50).map((entity: string, index: number) => (
                              <Chip key={index} label={entity} size="small" />
                            ))}
                            {validationResult.matched_entities.length > 50 && (
                              <Chip
                                label={`+${validationResult.matched_entities.length - 50} more`}
                                size="small"
                                color="primary"
                              />
                            )}
                          </Box>
                        </Paper>
                      </Box>
                    )}
                    
                    {validationResult.warnings && validationResult.warnings.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" color="warning.main" gutterBottom>
                          Warnings:
                        </Typography>
                        <List dense>
                          {validationResult.warnings.map((warning: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={warning} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUpdatingScanRuleSet}
            startIcon={isUpdatingScanRuleSet ? <CircularProgress size={20} /> : null}
          >
            {isUpdatingScanRuleSet ? 'Updating...' : 'Update Rule Set'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ScanRuleSetEditModal;