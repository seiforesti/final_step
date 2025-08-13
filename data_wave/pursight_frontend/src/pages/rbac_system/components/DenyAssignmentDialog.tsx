import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Divider,
  Alert,
  Chip,
  Autocomplete,
  CircularProgress,
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FormDialog from './FormDialog';
import JsonViewer from './JsonViewer';

interface Principal {
  id: number;
  name?: string;
  email?: string;
}

interface ConditionTemplate {
  id: number;
  name: string;
  template: any;
}

interface DenyAssignmentFormValues {
  principal_type: 'user' | 'group';
  principal_id: string | number;
  action: string;
  resource: string;
  conditions: string;
}

interface DenyAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DenyAssignmentFormValues) => Promise<void>;
  initialValues?: DenyAssignmentFormValues;
  users: Principal[];
  groups: Principal[];
  conditionTemplates: ConditionTemplate[];
  loading?: boolean;
  title?: string;
  submitLabel?: string;
}

const defaultValues: DenyAssignmentFormValues = {
  principal_type: 'user',
  principal_id: '',
  action: '',
  resource: '',
  conditions: '{}',
};

const commonActions = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'delete', label: 'Delete' },
  { value: 'execute', label: 'Execute' },
  { value: 'manage', label: 'Manage' },
];

const commonResources = [
  { value: '*', label: 'All Resources (*)' },
  { value: 'dataset:*', label: 'All Datasets (dataset:*)' },
  { value: 'report:*', label: 'All Reports (report:*)' },
  { value: 'dashboard:*', label: 'All Dashboards (dashboard:*)' },
];

const DenyAssignmentDialog: React.FC<DenyAssignmentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  users,
  groups,
  conditionTemplates,
  loading = false,
  title = 'Create Deny Assignment',
  submitLabel = 'Create',
}) => {
  const [formValues, setFormValues] = useState<DenyAssignmentFormValues>(
    initialValues || defaultValues
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Reset form when dialog opens with new initialValues
  React.useEffect(() => {
    if (open) {
      setFormValues(initialValues || defaultValues);
      setJsonError(null);
      setShowPreview(false);
    }
  }, [open, initialValues]);

  const handleInputChange = (field: keyof DenyAssignmentFormValues, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Reset principal_id when principal_type changes
    if (field === 'principal_type') {
      setFormValues(prev => ({
        ...prev,
        principal_id: '',
      }));
    }
  };

  const handleConditionsChange = (value: string) => {
    setFormValues(prev => ({
      ...prev,
      conditions: value,
    }));
    
    // Validate JSON
    if (value && value.trim() !== '{}') {
      try {
        JSON.parse(value);
        setJsonError(null);
      } catch (err) {
        setJsonError('Invalid JSON format');
      }
    } else {
      setJsonError(null);
    }
  };

  const handleTemplateSelect = (templateId: string | number) => {
    const template = conditionTemplates.find(t => t.id.toString() === templateId.toString());
    if (template && template.template) {
      handleConditionsChange(JSON.stringify(template.template, null, 2));
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formValues.principal_id || !formValues.action || !formValues.resource) {
      return; // Form validation would handle this
    }
    
    // Validate JSON
    if (formValues.conditions && formValues.conditions.trim() !== '{}') {
      try {
        JSON.parse(formValues.conditions);
      } catch (err) {
        setJsonError('Invalid JSON format');
        return;
      }
    }
    
    await onSubmit(formValues);
  };

  const getPrincipalOptions = () => {
    return formValues.principal_type === 'user' ? users : groups;
  };

  const getPrincipalLabel = (principal: Principal) => {
    return formValues.principal_type === 'user' ? principal.email : principal.name;
  };

  return (
    <FormDialog
      open={open}
      title={title}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
      loading={loading}
      disableSubmit={!formValues.principal_id || !formValues.action || !formValues.resource || !!jsonError}
      maxWidth="md"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Principal Selection Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Principal
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Principal Type</FormLabel>
              <RadioGroup 
                row 
                value={formValues.principal_type} 
                onChange={(e) => handleInputChange('principal_type', e.target.value)}
              >
                <FormControlLabel value="user" control={<Radio />} label="User" />
                <FormControlLabel value="group" control={<Radio />} label="Group" />
              </RadioGroup>
            </FormControl>
            
            <Autocomplete
              options={getPrincipalOptions()}
              getOptionLabel={(option) => getPrincipalLabel(option) || ''}
              value={getPrincipalOptions().find(p => p.id.toString() === formValues.principal_id.toString()) || null}
              onChange={(_, newValue) => handleInputChange('principal_id', newValue?.id || '')}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label={formValues.principal_type === 'user' ? 'Select User' : 'Select Group'}
                  required 
                  error={!formValues.principal_id}
                  helperText={!formValues.principal_id ? 'Required' : ''}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">
                      {getPrincipalLabel(option)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {option.id}
                    </Typography>
                  </Box>
                </li>
              )}
              loading={false}
              loadingText="Loading..."
              noOptionsText={`No ${formValues.principal_type === 'user' ? 'users' : 'groups'} found`}
              fullWidth
            />
          </Box>
        </Box>
        
        <Divider />
        
        {/* Access Control Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Access Control
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={commonActions}
              getOptionLabel={(option) => option.label}
              freeSolo
              inputValue={formValues.action}
              onInputChange={(_, newValue) => handleInputChange('action', newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Action" 
                  placeholder="e.g. read, write, delete"
                  required
                  error={!formValues.action}
                  helperText={!formValues.action ? 'Required' : 'Specify the action to deny'}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Chip 
                    label={option.label} 
                    color="error" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">{option.value}</Typography>
                </li>
              )}
            />
            
            <Autocomplete
              options={commonResources}
              getOptionLabel={(option) => option.label}
              freeSolo
              inputValue={formValues.resource}
              onInputChange={(_, newValue) => handleInputChange('resource', newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Resource" 
                  placeholder="e.g. dataset:123, *"
                  required
                  error={!formValues.resource}
                  helperText={!formValues.resource ? 'Required' : 'Specify the resource to deny access to'}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Typography variant="body2">{option.label}</Typography>
                </li>
              )}
            />
          </Box>
        </Box>
        
        <Divider />
        
        {/* Conditions Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Conditions
            </Typography>
            <Tooltip title="Conditions allow you to specify additional criteria for when the deny assignment applies. For example, you can deny access only during certain times or from certain IP addresses.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Conditions are optional. If no conditions are specified, the deny assignment will always apply.
          </Alert>
          
          {conditionTemplates && conditionTemplates.length > 0 && (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="template-select-label">Use Template</InputLabel>
              <Select
                labelId="template-select-label"
                label="Use Template"
                defaultValue=""
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                <MenuItem value="">-- Select a template --</MenuItem>
                {conditionTemplates.map((template) => (
                  <MenuItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={6}
            value={formValues.conditions || '{}'}
            onChange={(e) => handleConditionsChange(e.target.value)}
            placeholder="Enter JSON condition or select a template"
            variant="outlined"
            error={!!jsonError}
            helperText={jsonError || 'Enter valid JSON for conditions'}
            sx={{ fontFamily: 'monospace' }}
          />
          
          {!jsonError && formValues.conditions && formValues.conditions !== '{}' && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Preview</Typography>
                <FormControlLabel
                  control={
                    <Radio
                      checked={showPreview}
                      onChange={() => setShowPreview(!showPreview)}
                      size="small"
                    />
                  }
                  label="Show"
                />
              </Box>
              {showPreview && (
                <JsonViewer 
                  data={JSON.parse(formValues.conditions)} 
                  title="Conditions Preview"
                  collapsible
                />
              )}
            </Box>
          )}
        </Box>
        
        {/* Summary Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Summary
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" gutterBottom>
              This deny assignment will prevent the selected {formValues.principal_type} from performing the
              <Chip 
                label={formValues.action || 'action'} 
                color="error" 
                size="small" 
                sx={{ mx: 1 }}
              />
              action on
              <Chip 
                label={formValues.resource || 'resource'} 
                color="default" 
                size="small" 
                sx={{ mx: 1 }}
              />
              {formValues.conditions && formValues.conditions !== '{}' && (
                <span>when the specified conditions are met.</span>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Deny assignments take precedence over any role assignments.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </FormDialog>
  );
};

export default DenyAssignmentDialog;