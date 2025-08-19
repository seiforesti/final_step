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
  Box,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDataSources } from '../../hooks/useDataSources';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface DataSourceEditModalProps {
  open: boolean;
  onClose: () => void;
  dataSource: any; // Replace with proper type
  onSuccess?: () => void;
}

const DataSourceEditModal: React.FC<DataSourceEditModalProps> = ({
  open,
  onClose,
  dataSource,
  onSuccess,
}) => {
  const { updateDataSource, isUpdatingDataSource } = useDataSources();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    host: Yup.string().required('Host is required'),
    port: Yup.number().required('Port is required').positive('Port must be positive').integer('Port must be an integer'),
    username: Yup.string().required('Username is required'),
    password: Yup.string().when('update_password', {
      is: true,
      then: Yup.string().required('Password is required'),
      otherwise: Yup.string(),
    }),
    database_name: Yup.string().when('source_type', {
      is: (val: string) => val !== 'mongodb',
      then: Yup.string().required('Database name is required'),
      otherwise: Yup.string(),
    }),
    description: Yup.string(),
    update_password: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      name: dataSource.name || '',
      host: dataSource.host || '',
      port: dataSource.port || 0,
      username: dataSource.username || '',
      password: '',
      database_name: dataSource.database_name || '',
      description: dataSource.description || '',
      update_password: false,
      connection_properties: dataSource.connection_properties || {},
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        const updateData: any = {
          id: dataSource.id,
          name: values.name,
          host: values.host,
          port: values.port,
          username: values.username,
          database_name: values.database_name,
          description: values.description,
          connection_properties: values.connection_properties,
        };

        // Only include password if update_password is true
        if (values.update_password) {
          updateData.password = values.password;
        }

        await updateDataSource(updateData);
        onSuccess?.();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to update data source');
      }
    },
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Data Source: {dataSource.name}</Typography>
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
                label="Data Source Name"
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
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Connection Details
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Data source type cannot be changed after creation.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="host"
                name="host"
                label="Host"
                value={formik.values.host}
                onChange={formik.handleChange}
                error={formik.touched.host && Boolean(formik.errors.host)}
                helperText={formik.touched.host && formik.errors.host}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="port"
                name="port"
                label="Port"
                type="number"
                value={formik.values.port}
                onChange={formik.handleChange}
                error={formik.touched.port && Boolean(formik.errors.port)}
                helperText={formik.touched.port && formik.errors.port}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.update_password}
                    onChange={(e) => formik.setFieldValue('update_password', e.target.checked)}
                    name="update_password"
                    color="primary"
                  />
                }
                label="Update Password"
              />
            </Grid>
            
            {formik.values.update_password && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={toggleShowPassword}
                        variant="text"
                        size="small"
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                    ),
                  }}
                />
              </Grid>
            )}
            
            {dataSource.source_type !== 'mongodb' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="database_name"
                  name="database_name"
                  label="Database Name"
                  value={formik.values.database_name}
                  onChange={formik.handleChange}
                  error={formik.touched.database_name && Boolean(formik.errors.database_name)}
                  helperText={formik.touched.database_name && formik.errors.database_name}
                />
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
            disabled={isUpdatingDataSource}
            startIcon={isUpdatingDataSource ? <CircularProgress size={20} /> : null}
          >
            {isUpdatingDataSource ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DataSourceEditModal;