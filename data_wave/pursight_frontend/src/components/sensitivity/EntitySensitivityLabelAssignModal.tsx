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
  Divider,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSensitivityLabels } from '../../hooks/useSensitivityLabels';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

interface EntitySensitivityLabelAssignModalProps {
  open: boolean;
  onClose: () => void;
  entityType: string;
  entityId: string;
  entityName: string;
  currentLabelId?: number;
  onSuccess: () => void;
}

const EntitySensitivityLabelAssignModal: React.FC<EntitySensitivityLabelAssignModalProps> = ({
  open,
  onClose,
  entityType,
  entityId,
  entityName,
  currentLabelId,
  onSuccess,
}) => {
  const { assignLabel, labels, isLabelsLoading } = useSensitivityLabels({
    entityType,
    entityId,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    labelId: Yup.string().required('Sensitivity label is required'),
    justification: Yup.string().required('Justification is required'),
    expiresAt: Yup.date().nullable().min(new Date(), 'Expiration date must be in the future'),
  });
  
  // Initial form values
  const initialValues = {
    labelId: currentLabelId ? String(currentLabelId) : '',
    justification: '',
    expiresAt: null as Date | null,
  };
  
  // Form handling
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        
        await assignLabel(
          values.labelId,
          values.justification,
          values.expiresAt
        );
        
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to assign sensitivity label');
      } finally {
        setIsLoading(false);
      }
    }
  });
  
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Assign Sensitivity Label
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            disabled={isLoading}
            aria-label="close"
          >
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
          
          <Typography variant="subtitle1" gutterBottom>
            Assigning sensitivity label to: <strong>{entityName}</strong> ({entityType})
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={formik.touched.labelId && Boolean(formik.errors.labelId)}
                disabled={isLoading || isLabelsLoading}
              >
                <InputLabel id="sensitivity-label-select-label">Sensitivity Label</InputLabel>
                <Select
                  labelId="sensitivity-label-select-label"
                  id="labelId"
                  name="labelId"
                  value={formik.values.labelId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Sensitivity Label"
                >
                  {labels && labels.map((label: any) => (
                    <MenuItem key={label.id} value={label.id}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: label.color || getLevelColor(label.level),
                            mr: 1,
                          }}
                        />
                        {label.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.labelId && formik.errors.labelId && (
                  <FormHelperText>{formik.errors.labelId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                id="justification"
                name="justification"
                label="Justification"
                multiline
                rows={4}
                fullWidth
                value={formik.values.justification}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.justification && Boolean(formik.errors.justification)}
                helperText={
                  (formik.touched.justification && formik.errors.justification) ||
                  'Please provide a justification for assigning this sensitivity label'
                }
                disabled={isLoading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiration Date (Optional)"
                  value={formik.values.expiresAt}
                  onChange={(date) => formik.setFieldValue('expiresAt', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.expiresAt && Boolean(formik.errors.expiresAt),
                      helperText: (formik.touched.expiresAt && formik.errors.expiresAt as string) ||
                        'Optional: Set an expiration date for this sensitivity label assignment',
                    },
                  }}
                  disabled={isLoading}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        
        <Divider />
        
        <DialogActions>
          <Button
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <SecurityIcon />}
          >
            {isLoading ? 'Assigning...' : 'Assign Label'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EntitySensitivityLabelAssignModal;