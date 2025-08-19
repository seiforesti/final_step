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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDataSources } from '../../hooks/useDataSources';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface DataSourceCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DataSourceCreateModal: React.FC<DataSourceCreateModalProps> = ({ open, onClose, onSuccess }) => {
  const { createDataSource, isCreatingDataSource } = useDataSources();
  const [error, setError] = useState<string | null>(null);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    source_type: Yup.string().required('Type is required'),
    location: Yup.string().required('Location is required'),
    host: Yup.string().required('Host is required'),
    port: Yup.number().required('Port is required').positive('Port must be positive').integer('Port must be an integer'),
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
    database_name: Yup.string().when('source_type', {
      is: (val: string) => val !== 'mongodb',
      then: Yup.string().required('Database name is required'),
      otherwise: Yup.string(),
    }),
    description: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      source_type: '',
      location: 'on-premise',
      host: '',
      port: 0,
      username: '',
      password: '',
      database_name: '',
      description: '',
      connection_properties: {},
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await createDataSource(values);
        onSuccess?.();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to create data source');
      }
    },
  });

  const handleTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const type = event.target.value as string;
    let defaultPort = 0;

    switch (type) {
      case 'mysql':
        defaultPort = 3306;
        break;
      case 'postgresql':
        defaultPort = 5432;
        break;
      case 'mongodb':
        defaultPort = 27017;
        break;
      default:
        defaultPort = 0;
    }

    formik.setFieldValue('source_type', type);
    formik.setFieldValue('port', defaultPort);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add New Data Source</Typography>
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
              <FormControl fullWidth error={formik.touched.source_type && Boolean(formik.errors.source_type)}>
                <InputLabel id="source-type-label">Data Source Type</InputLabel>
                <Select
                  labelId="source-type-label"
                  id="source_type"
                  name="source_type"
                  value={formik.values.source_type}
                  onChange={handleTypeChange}
                  label="Data Source Type"
                >
                  <MenuItem value="mysql">MySQL</MenuItem>
                  <MenuItem value="postgresql">PostgreSQL</MenuItem>
                  <MenuItem value="mongodb">MongoDB</MenuItem>
                </Select>
                {formik.touched.source_type && formik.errors.source_type && (
                  <FormHelperText>{formik.errors.source_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.location && Boolean(formik.errors.location)}>
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  id="location"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  label="Location"
                >
                  <MenuItem value="on-premise">On-Premise</MenuItem>
                  <MenuItem value="cloud">Cloud</MenuItem>
                </Select>
                {formik.touched.location && formik.errors.location && (
                  <FormHelperText>{formik.errors.location}</FormHelperText>
                )}
              </FormControl>
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
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            
            {formik.values.source_type !== 'mongodb' && (
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
            disabled={isCreatingDataSource}
            startIcon={isCreatingDataSource ? <CircularProgress size={20} /> : null}
          >
            {isCreatingDataSource ? 'Creating...' : 'Create Data Source'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DataSourceCreateModal;