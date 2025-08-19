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
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Autocomplete,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
  Policy as PolicyIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useComplianceManagement } from '../../hooks/useComplianceManagement';
import { useDataSources } from '../../hooks/useDataSources';

interface ComplianceRuleCreateModalProps {
  open: boolean;
  onClose: () => void;
}

const ComplianceRuleCreateModal: React.FC<ComplianceRuleCreateModalProps> = ({
  open,
  onClose,
}) => {
  const { createComplianceRule } = useComplianceManagement();
  const { getDataSources } = useDataSources();
  
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
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
  }, []);
  
  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    severity: Yup.string().required('Severity is required'),
    compliance_standard: Yup.string().required('Compliance standard is required'),
    applies_to: Yup.string().required('Applies to is required'),
    rule_type: Yup.string().required('Rule type is required'),
    rule_definition: Yup.string().required('Rule definition is required'),
    status: Yup.string().required('Status is required'),
    data_source_ids: Yup.array().when('is_global', {
      is: false,
      then: Yup.array().min(1, 'At least one data source must be selected'),
      otherwise: Yup.array(),
    }),
  });
  
  // Form initialization
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      category: '',
      severity: 'medium',
      compliance_standard: '',
      applies_to: 'column',
      rule_type: 'pattern',
      rule_definition: '',
      status: 'active',
      is_global: true,
      data_source_ids: [],
      remediation_steps: '',
      reference_link: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        await createComplianceRule(values);
        setSuccess('Compliance rule created successfully');
        
        // Reset form after successful creation
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to create compliance rule');
      } finally {
        setIsLoading(false);
      }
    },
  });
  
  // Category options
  const categoryOptions = [
    'Data Protection',
    'Access Control',
    'Data Quality',
    'Regulatory Compliance',
    'Security',
    'Privacy',
    'Governance',
    'Custom',
  ];
  
  // Compliance standard options
  const complianceStandardOptions = [
    'GDPR',
    'HIPAA',
    'PCI DSS',
    'SOX',
    'CCPA',
    'GLBA',
    'ISO 27001',
    'NIST',
    'Custom',
  ];
  
  // Rule type options with descriptions
  const ruleTypeOptions = [
    { value: 'pattern', label: 'Pattern', description: 'Match data against regex patterns' },
    { value: 'value', label: 'Value', description: 'Check specific values or ranges' },
    { value: 'metadata', label: 'Metadata', description: 'Validate metadata properties' },
    { value: 'relationship', label: 'Relationship', description: 'Verify relationships between entities' },
    { value: 'custom', label: 'Custom', description: 'Custom rule logic' },
  ];
  
  // Get rule definition placeholder based on rule type
  const getRuleDefinitionPlaceholder = () => {
    switch (formik.values.rule_type) {
      case 'pattern':
        return 'e.g. ^\\d{3}-\\d{2}-\\d{4}$ (for SSN pattern)';
      case 'value':
        return 'e.g. {"min": 0, "max": 100} or ["allowed", "values", "list"]';
      case 'metadata':
        return 'e.g. {"required_properties": ["description", "owner"]}';
      case 'relationship':
        return 'e.g. {"required_relationship": "HAS_OWNER"}';
      case 'custom':
        return 'Custom rule definition in JSON format';
      default:
        return 'Rule definition';
    }
  };
  
  // Get rule definition helper text based on rule type
  const getRuleDefinitionHelperText = () => {
    switch (formik.values.rule_type) {
      case 'pattern':
        return 'Enter a regular expression pattern to match against data';
      case 'value':
        return 'Enter value constraints in JSON format';
      case 'metadata':
        return 'Specify metadata requirements in JSON format';
      case 'relationship':
        return 'Define relationship requirements in JSON format';
      case 'custom':
        return 'Enter custom rule logic in JSON format';
      default:
        return '';
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <PolicyIcon sx={{ mr: 1 }} />
            Create Compliance Rule
          </Box>
          <IconButton onClick={onClose} disabled={isLoading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Rule Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={isLoading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.category && Boolean(formik.errors.category)}
                disabled={isLoading}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Category"
                  required
                >
                  {categoryOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <FormHelperText>{formik.errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={isLoading}
                multiline
                rows={2}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.severity && Boolean(formik.errors.severity)}
                disabled={isLoading}
              >
                <InputLabel id="severity-label">Severity</InputLabel>
                <Select
                  labelId="severity-label"
                  id="severity"
                  name="severity"
                  value={formik.values.severity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Severity"
                  required
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
                {formik.touched.severity && formik.errors.severity && (
                  <FormHelperText>{formik.errors.severity}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.compliance_standard && Boolean(formik.errors.compliance_standard)}
                disabled={isLoading}
              >
                <InputLabel id="compliance-standard-label">Compliance Standard</InputLabel>
                <Select
                  labelId="compliance-standard-label"
                  id="compliance_standard"
                  name="compliance_standard"
                  value={formik.values.compliance_standard}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Compliance Standard"
                  required
                >
                  {complianceStandardOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.compliance_standard && formik.errors.compliance_standard && (
                  <FormHelperText>{formik.errors.compliance_standard}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Scope */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Scope
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_global}
                    onChange={(e) => {
                      formik.setFieldValue('is_global', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('data_source_ids', []);
                      }
                    }}
                    name="is_global"
                    disabled={isLoading}
                  />
                }
                label="Global Rule (applies to all data sources)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.applies_to && Boolean(formik.errors.applies_to)}
                disabled={isLoading}
              >
                <InputLabel id="applies-to-label">Applies To</InputLabel>
                <Select
                  labelId="applies-to-label"
                  id="applies_to"
                  name="applies_to"
                  value={formik.values.applies_to}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Applies To"
                  required
                >
                  <MenuItem value="column">Column</MenuItem>
                  <MenuItem value="table">Table</MenuItem>
                  <MenuItem value="schema">Schema</MenuItem>
                  <MenuItem value="database">Database</MenuItem>
                </Select>
                {formik.touched.applies_to && formik.errors.applies_to && (
                  <FormHelperText>{formik.errors.applies_to}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {!formik.values.is_global && (
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.data_source_ids && Boolean(formik.errors.data_source_ids)}
                  disabled={isLoading}
                >
                  <Autocomplete
                    multiple
                    id="data_source_ids"
                    options={dataSources}
                    getOptionLabel={(option) => option.name}
                    value={dataSources.filter(ds => formik.values.data_source_ids.includes(ds.id))}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('data_source_ids', newValue.map(item => item.id));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Data Sources"
                        error={formik.touched.data_source_ids && Boolean(formik.errors.data_source_ids)}
                        helperText={formik.touched.data_source_ids && formik.errors.data_source_ids}
                        required={!formik.values.is_global}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id}
                        />
                      ))
                    }
                    disabled={isLoading || formik.values.is_global}
                  />
                </FormControl>
              </Grid>
            )}
            
            {/* Rule Definition */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Rule Definition
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.rule_type && Boolean(formik.errors.rule_type)}
                disabled={isLoading}
              >
                <InputLabel id="rule-type-label">Rule Type</InputLabel>
                <Select
                  labelId="rule-type-label"
                  id="rule_type"
                  name="rule_type"
                  value={formik.values.rule_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Rule Type"
                  required
                >
                  {ruleTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.rule_type && formik.errors.rule_type && (
                  <FormHelperText>{formik.errors.rule_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.status && Boolean(formik.errors.status)}
                disabled={isLoading}
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Status"
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="rule_definition"
                name="rule_definition"
                label="Rule Definition"
                value={formik.values.rule_definition}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.rule_definition && Boolean(formik.errors.rule_definition)}
                helperText={
                  (formik.touched.rule_definition && formik.errors.rule_definition) ||
                  getRuleDefinitionHelperText()
                }
                disabled={isLoading}
                placeholder={getRuleDefinitionPlaceholder()}
                multiline
                rows={3}
                required
              />
            </Grid>
            
            {/* Additional Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="remediation_steps"
                name="remediation_steps"
                label="Remediation Steps"
                value={formik.values.remediation_steps}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.remediation_steps && Boolean(formik.errors.remediation_steps)}
                helperText={formik.touched.remediation_steps && formik.errors.remediation_steps}
                disabled={isLoading}
                multiline
                rows={2}
                placeholder="Steps to resolve issues related to this rule"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="reference_link"
                name="reference_link"
                label="Reference Link"
                value={formik.values.reference_link}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.reference_link && Boolean(formik.errors.reference_link)}
                helperText={formik.touched.reference_link && formik.errors.reference_link}
                disabled={isLoading}
                placeholder="URL to documentation or reference material"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Creating...' : 'Create Rule'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComplianceRuleCreateModal;