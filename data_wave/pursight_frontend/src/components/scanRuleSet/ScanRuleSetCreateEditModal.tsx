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
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Storage as StorageIcon,
  Rule as RuleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useScanRuleSets } from '../../hooks/useScanRuleSets';
import { useDataSources } from '../../hooks/useDataSources';

interface ScanRuleSetCreateEditModalProps {
  open: boolean;
  onClose: () => void;
  ruleSet?: any; // For edit mode
  dataSourceId?: number; // For pre-selecting data source
  onSuccess?: () => void;
}

const ScanRuleSetCreateEditModal: React.FC<ScanRuleSetCreateEditModalProps> = ({
  open,
  onClose,
  ruleSet,
  dataSourceId,
  onSuccess,
}) => {
  const isEditMode = Boolean(ruleSet);
  const { createScanRuleSet, updateScanRuleSet, validateScanRuleSet } = useScanRuleSets();
  const { getDataSources } = useDataSources();
  
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Load data sources
  useEffect(() => {
    const loadDataSources = async () => {
      try {
        const sources = await getDataSources();
        setDataSources(sources);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load data sources');
      }
    };
    
    loadDataSources();
  }, [getDataSources]);
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required').max(100, 'Name must be at most 100 characters'),
    description: Yup.string().max(500, 'Description must be at most 500 characters'),
    data_source_id: Yup.number().required('Data source is required'),
    include_patterns: Yup.array().of(Yup.string()).min(1, 'At least one include pattern is required'),
    exclude_patterns: Yup.array().of(Yup.string()),
    sample_size: Yup.number().min(0, 'Sample size must be non-negative').max(100, 'Sample size must be at most 100'),
    scan_level: Yup.string().oneOf(['database', 'schema', 'table', 'column'], 'Invalid scan level'),
  });
  
  // Initialize form
  const formik = useFormik({
    initialValues: {
      name: ruleSet?.name || '',
      description: ruleSet?.description || '',
      data_source_id: ruleSet?.data_source_id || dataSourceId || '',
      include_patterns: ruleSet?.include_patterns || [''],
      exclude_patterns: ruleSet?.exclude_patterns || [''],
      sample_size: ruleSet?.sample_size ?? 100,
      scan_level: ruleSet?.scan_level || 'column',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Filter out empty patterns
        const filteredValues = {
          ...values,
          include_patterns: values.include_patterns.filter(pattern => pattern.trim() !== ''),
          exclude_patterns: values.exclude_patterns.filter(pattern => pattern.trim() !== ''),
        };
        
        if (isEditMode) {
          await updateScanRuleSet(ruleSet.id, filteredValues);
        } else {
          await createScanRuleSet(filteredValues);
        }
        
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} scan rule set`);
      } finally {
        setIsLoading(false);
      }
    },
  });
  
  // Handle include pattern changes
  const handleIncludePatternChange = (index: number, value: string) => {
    const newPatterns = [...formik.values.include_patterns];
    newPatterns[index] = value;
    formik.setFieldValue('include_patterns', newPatterns);
  };
  
  // Add new include pattern
  const addIncludePattern = () => {
    formik.setFieldValue('include_patterns', [...formik.values.include_patterns, '']);
  };
  
  // Remove include pattern
  const removeIncludePattern = (index: number) => {
    if (formik.values.include_patterns.length > 1) {
      const newPatterns = [...formik.values.include_patterns];
      newPatterns.splice(index, 1);
      formik.setFieldValue('include_patterns', newPatterns);
    }
  };
  
  // Handle exclude pattern changes
  const handleExcludePatternChange = (index: number, value: string) => {
    const newPatterns = [...formik.values.exclude_patterns];
    newPatterns[index] = value;
    formik.setFieldValue('exclude_patterns', newPatterns);
  };
  
  // Add new exclude pattern
  const addExcludePattern = () => {
    formik.setFieldValue('exclude_patterns', [...formik.values.exclude_patterns, '']);
  };
  
  // Remove exclude pattern
  const removeExcludePattern = (index: number) => {
    const newPatterns = [...formik.values.exclude_patterns];
    newPatterns.splice(index, 1);
    formik.setFieldValue('exclude_patterns', newPatterns);
  };
  
  // Validate rule set patterns
  const handleValidatePatterns = async () => {
    if (!formik.values.data_source_id) {
      setError('Please select a data source before validating patterns');
      return;
    }
    
    try {
      setIsValidating(true);
      setError(null);
      
      // Filter out empty patterns
      const filteredValues = {
        ...formik.values,
        include_patterns: formik.values.include_patterns.filter(pattern => pattern.trim() !== ''),
        exclude_patterns: formik.values.exclude_patterns.filter(pattern => pattern.trim() !== ''),
      };
      
      const results = await validateScanRuleSet(filteredValues);
      setValidationResults(results);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate patterns');
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle>
        {isEditMode ? 'Edit Scan Rule Set' : 'Create Scan Rule Set'}
      </DialogTitle>
      
      <DialogContent dividers>
        <Box component="form" noValidate>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Basic Information */}
          <Typography variant="subtitle1" gutterBottom>
            Basic Information
          </Typography>
          
          <Box display="flex" gap={2} mb={3}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={isLoading}
              required
            />
            
            <FormControl fullWidth required disabled={isLoading || (isEditMode && ruleSet?.data_source_id)}>
              <InputLabel>Data Source</InputLabel>
              <Select
                name="data_source_id"
                value={formik.values.data_source_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.data_source_id && Boolean(formik.errors.data_source_id)}
                label="Data Source"
              >
                {dataSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.name} ({source.type})
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.data_source_id && formik.errors.data_source_id && (
                <FormHelperText error>{formik.errors.data_source_id}</FormHelperText>
              )}
            </FormControl>
          </Box>
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            multiline
            rows={2}
            disabled={isLoading}
            sx={{ mb: 3 }}
          />
          
          <Divider sx={{ my: 3 }} />
          
          {/* Include Patterns */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">
              Include Patterns
              <Tooltip title="Specify patterns to include in the scan. Use * as a wildcard. Example: database.schema.* to include all tables in a schema.">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <Button
              startIcon={<AddIcon />}
              onClick={addIncludePattern}
              disabled={isLoading}
              size="small"
            >
              Add Pattern
            </Button>
          </Box>
          
          {formik.values.include_patterns.map((pattern, index) => (
            <Box key={index} display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                label={`Include Pattern ${index + 1}`}
                value={pattern}
                onChange={(e) => handleIncludePatternChange(index, e.target.value)}
                disabled={isLoading}
                error={Boolean(formik.errors.include_patterns)}
              />
              
              <IconButton
                onClick={() => removeIncludePattern(index)}
                disabled={isLoading || formik.values.include_patterns.length <= 1}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          {formik.touched.include_patterns && typeof formik.errors.include_patterns === 'string' && (
            <FormHelperText error sx={{ mb: 2 }}>
              {formik.errors.include_patterns}
            </FormHelperText>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {/* Exclude Patterns */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">
              Exclude Patterns (Optional)
              <Tooltip title="Specify patterns to exclude from the scan. These take precedence over include patterns.">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <Button
              startIcon={<AddIcon />}
              onClick={addExcludePattern}
              disabled={isLoading}
              size="small"
            >
              Add Pattern
            </Button>
          </Box>
          
          {formik.values.exclude_patterns.map((pattern, index) => (
            <Box key={index} display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                label={`Exclude Pattern ${index + 1}`}
                value={pattern}
                onChange={(e) => handleExcludePatternChange(index, e.target.value)}
                disabled={isLoading}
              />
              
              <IconButton
                onClick={() => removeExcludePattern(index)}
                disabled={isLoading}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          <Divider sx={{ my: 3 }} />
          
          {/* Advanced Settings */}
          <Typography variant="subtitle1" gutterBottom>
            Advanced Settings
          </Typography>
          
          <Box display="flex" gap={2} mb={3}>
            <FormControl fullWidth>
              <InputLabel>Scan Level</InputLabel>
              <Select
                name="scan_level"
                value={formik.values.scan_level}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Scan Level"
                disabled={isLoading}
              >
                <MenuItem value="database">Database</MenuItem>
                <MenuItem value="schema">Schema</MenuItem>
                <MenuItem value="table">Table</MenuItem>
                <MenuItem value="column">Column</MenuItem>
              </Select>
              <FormHelperText>
                Determines the deepest level to scan. Column level provides the most detailed information.
              </FormHelperText>
            </FormControl>
            
            <TextField
              label="Sample Size (%)"
              name="sample_size"
              type="number"
              value={formik.values.sample_size}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.sample_size && Boolean(formik.errors.sample_size)}
              helperText={
                (formik.touched.sample_size && formik.errors.sample_size) ||
                'Percentage of data to sample for classification (0-100)'
              }
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              disabled={isLoading}
              fullWidth
            />
          </Box>
          
          {/* Validation Results */}
          {validationResults && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Validation Results
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" gap={2} mb={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Entities
                    </Typography>
                    <Typography variant="h6">
                      {validationResults.total_entities || 0}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Included
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {validationResults.included_entities || 0}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Excluded
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {validationResults.excluded_entities || 0}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Entity Breakdown
                </Typography>
                
                <List dense>
                  {validationResults.entity_types?.map((entityType: any) => (
                    <ListItem key={entityType.type}>
                      <ListItemIcon>
                        <RuleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${entityType.type.charAt(0).toUpperCase() + entityType.type.slice(1)}s`}
                        secondary={`${entityType.included} included, ${entityType.excluded} excluded (out of ${entityType.total})`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleValidatePatterns}
          disabled={isLoading || isValidating}
          startIcon={isValidating ? <CircularProgress size={20} /> : <CheckIcon />}
        >
          Validate Patterns
        </Button>
        
        <Box>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => formik.handleSubmit()}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{ ml: 1 }}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ScanRuleSetCreateEditModal;