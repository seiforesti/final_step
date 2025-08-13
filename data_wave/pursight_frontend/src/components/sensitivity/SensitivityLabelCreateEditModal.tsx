import React, { useState } from 'react';
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
  Divider,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSensitivityLabels } from '../../hooks/useSensitivityLabels';

interface SensitivityLabelCreateEditModalProps {
  open: boolean;
  onClose: () => void;
  labelToEdit?: any;
  onSuccess: () => void;
}

const SensitivityLabelCreateEditModal: React.FC<SensitivityLabelCreateEditModalProps> = ({
  open,
  onClose,
  labelToEdit,
  onSuccess,
}) => {
  const { createSensitivityLabel, updateSensitivityLabel } = useSensitivityLabels();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditMode = Boolean(labelToEdit);
  
  // Available sensitivity levels
  const sensitivityLevels = ['high', 'medium', 'low', 'none'];
  
  // Get level color
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return '#d32f2f'; // error.main
      case 'medium':
        return '#ed6c02'; // warning.main
      case 'low':
        return '#0288d1'; // info.main
      case 'none':
      default:
        return '#9e9e9e'; // grey[500]
    }
  };
  
  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    level: Yup.string().required('Sensitivity level is required'),
    display_order: Yup.number().integer('Must be an integer').min(0, 'Must be non-negative'),
  });
  
  // Initial form values
  const initialValues = isEditMode
    ? {
        name: labelToEdit.name || '',
        description: labelToEdit.description || '',
        level: labelToEdit.level || 'low',
        display_order: labelToEdit.display_order || 0,
      }
    : {
        name: '',
        description: '',
        level: 'low',
        display_order: 0,
      };
  
  // Form handling
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (isEditMode) {
          await updateSensitivityLabel(labelToEdit.id, values);
        } else {
          await createSensitivityLabel(values);
        }
        
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} sensitivity label`);
      } finally {
        setIsLoading(false);
      }
    },
  });
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEditMode ? 'Edit Sensitivity Label' : 'Create New Sensitivity Label'}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Label Name *"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            {/* Sensitivity Level */}
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.level && Boolean(formik.errors.level)}
              >
                <InputLabel id="level-label">Sensitivity Level *</InputLabel>
                <Select
                  labelId="level-label"
                  id="level"
                  name="level"
                  value={formik.values.level}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Sensitivity Level *"
                  startAdornment={
                    <Box component="span" sx={{ mr: 1 }}>
                      <SecurityIcon sx={{ color: getLevelColor(formik.values.level) }} />
                    </Box>
                  }
                >
                  {sensitivityLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      <Box display="flex" alignItems="center">
                        <SecurityIcon sx={{ color: getLevelColor(level) }} />
                        <Typography sx={{ ml: 1 }}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.level && formik.errors.level && (
                  <FormHelperText>{formik.errors.level}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description *"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={
                  (formik.touched.description && formik.errors.description) ||
                  'Provide a clear description of what this sensitivity label represents'
                }
              />
            </Grid>
            
            {/* Display Order */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="display_order"
                name="display_order"
                label="Display Order"
                type="number"
                value={formik.values.display_order}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.display_order && Boolean(formik.errors.display_order)}
                helperText={
                  (formik.touched.display_order && formik.errors.display_order) ||
                  'Order in which this label appears in lists (lower numbers first)'
                }
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            
            {/* Information Box */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <InfoIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">About Sensitivity Labels</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Sensitivity labels help classify data based on its sensitivity level. They are used to identify and protect sensitive information.
                </Typography>
                <Typography variant="body2">
                  <strong>High:</strong> Highly sensitive data that requires strict protection (e.g., passwords, credit card numbers).
                </Typography>
                <Typography variant="body2">
                  <strong>Medium:</strong> Sensitive data with moderate protection requirements (e.g., personal contact information).
                </Typography>
                <Typography variant="body2">
                  <strong>Low:</strong> Data with minimal sensitivity requiring basic protection (e.g., publicly available information).
                </Typography>
                <Typography variant="body2">
                  <strong>None:</strong> Non-sensitive data with no special protection requirements.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !formik.isValid}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isEditMode ? 'Update Label' : 'Create Label'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SensitivityLabelCreateEditModal;