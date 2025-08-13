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
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Autocomplete,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Security as SecurityIcon,
  Label as LabelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDataCatalog } from '../../hooks/useDataCatalog';
import { useSensitivityLabels } from '../../hooks/useSensitivityLabels';
import { useDataSources } from '../../hooks/useDataSources';

interface EntityCreateEditModalProps {
  open: boolean;
  onClose: () => void;
  entityToEdit?: any;
  onSuccess: () => void;
}

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
      id={`entity-tabpanel-${index}`}
      aria-labelledby={`entity-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EntityCreateEditModal: React.FC<EntityCreateEditModalProps> = ({
  open,
  onClose,
  entityToEdit,
  onSuccess,
}) => {
  const { createEntity, updateEntity, getEntityParents } = useDataCatalog();
  const { getSensitivityLabels } = useSensitivityLabels();
  const { getDataSources } = useDataSources();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sensitivityLabels, setSensitivityLabels] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [availableParents, setAvailableParents] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  
  const isEditMode = Boolean(entityToEdit);
  
  // Available entity types
  const entityTypes = ['database', 'schema', 'table', 'column', 'folder', 'file'];
  
  // Get entity icon
  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'database':
        return <StorageIcon />;
      case 'schema':
        return <DataObjectIcon />;
      case 'table':
        return <TableChartIcon />;
      case 'column':
        return <ViewColumnIcon />;
      case 'folder':
        return <FolderIcon />;
      case 'file':
        return <FileIcon />;
      default:
        return <DataObjectIcon />;
    }
  };
  
  // Load metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load sensitivity labels
        const labelsData = await getSensitivityLabels();
        setSensitivityLabels(labelsData);
        
        // Load data sources
        const sourcesData = await getDataSources();
        setDataSources(sourcesData);
        
        // If editing, load available parents
        if (isEditMode && entityToEdit.entity_type !== 'database') {
          const parentsData = await getEntityParents(entityToEdit.data_source_id, entityToEdit.entity_type);
          setAvailableParents(parentsData);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load metadata');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (open) {
      loadMetadata();
    }
  }, [open, isEditMode, entityToEdit]);
  
  // Load available parents when data source changes
  const loadAvailableParents = async (dataSourceId: number, entityType: string) => {
    if (entityType === 'database') {
      setAvailableParents([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const parentsData = await getEntityParents(dataSourceId, entityType);
      setAvailableParents(parentsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load parent entities');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get parent type based on entity type
  const getParentType = (entityType: string) => {
    switch (entityType) {
      case 'schema':
        return 'database';
      case 'table':
        return 'schema';
      case 'column':
        return 'table';
      case 'file':
        return 'folder';
      default:
        return null;
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Validation schema
  const validationSchema = Yup.object({
    entity_type: Yup.string().required('Entity type is required'),
    name: Yup.string().required('Name is required'),
    data_source_id: Yup.number().required('Data source is required'),
    parent_id: Yup.number().when('entity_type', {
      is: (val: string) => val !== 'database',
      then: Yup.number().required('Parent entity is required'),
      otherwise: Yup.number().nullable(),
    }),
    qualified_name: Yup.string().required('Qualified name is required'),
    description: Yup.string(),
    sensitivity_label_id: Yup.number().nullable(),
    classifications: Yup.array().of(Yup.string()),
    properties: Yup.object(),
  });
  
  // Initial form values
  const initialValues = isEditMode
    ? {
        entity_type: entityToEdit.entity_type || '',
        name: entityToEdit.name || '',
        data_source_id: entityToEdit.data_source_id || '',
        parent_id: entityToEdit.parent_id || null,
        qualified_name: entityToEdit.qualified_name || '',
        description: entityToEdit.description || '',
        sensitivity_label_id: entityToEdit.sensitivity_label_id || null,
        classifications: entityToEdit.classifications || [],
        properties: entityToEdit.properties || {},
      }
    : {
        entity_type: '',
        name: '',
        data_source_id: '',
        parent_id: null,
        qualified_name: '',
        description: '',
        sensitivity_label_id: null,
        classifications: [],
        properties: {},
      };
  
  // Form handling
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Format properties as JSON string if needed
        const formattedValues = {
          ...values,
          properties: typeof values.properties === 'string'
            ? JSON.parse(values.properties)
            : values.properties,
        };
        
        if (isEditMode) {
          await updateEntity(entityToEdit.id, formattedValues);
        } else {
          await createEntity(formattedValues);
        }
        
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} entity`);
      } finally {
        setIsLoading(false);
      }
    },
  });
  
  // Handle entity type change
  const handleEntityTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newEntityType = event.target.value as string;
    formik.setFieldValue('entity_type', newEntityType);
    formik.setFieldValue('parent_id', null);
    
    if (formik.values.data_source_id) {
      loadAvailableParents(formik.values.data_source_id, newEntityType);
    }
  };
  
  // Handle data source change
  const handleDataSourceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newDataSourceId = event.target.value as number;
    formik.setFieldValue('data_source_id', newDataSourceId);
    formik.setFieldValue('parent_id', null);
    
    if (formik.values.entity_type) {
      loadAvailableParents(newDataSourceId, formik.values.entity_type);
    }
  };
  
  // Handle properties change
  const handlePropertiesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const propertiesValue = event.target.value;
      
      // Allow empty string
      if (!propertiesValue.trim()) {
        formik.setFieldValue('properties', {});
        return;
      }
      
      // Try to parse as JSON
      JSON.parse(propertiesValue);
      formik.setFieldValue('properties', propertiesValue);
    } catch (err) {
      // Invalid JSON, keep the value but don't update the formik state
      // The validation will catch this
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEditMode ? 'Edit Entity' : 'Create New Entity'}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="entity tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Basic Information" />
          <Tab label="Classifications" />
          <Tab label="Properties" />
        </Tabs>
      </Box>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Entity Type */}
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.entity_type && Boolean(formik.errors.entity_type)}
                  disabled={isEditMode} // Can't change entity type when editing
                >
                  <InputLabel id="entity-type-label">Entity Type *</InputLabel>
                  <Select
                    labelId="entity-type-label"
                    id="entity_type"
                    name="entity_type"
                    value={formik.values.entity_type}
                    onChange={handleEntityTypeChange}
                    onBlur={formik.handleBlur}
                    label="Entity Type *"
                    startAdornment={
                      formik.values.entity_type ? (
                        <Box component="span" sx={{ mr: 1 }}>
                          {getEntityIcon(formik.values.entity_type)}
                        </Box>
                      ) : null
                    }
                  >
                    {entityTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box display="flex" alignItems="center">
                          {getEntityIcon(type)}
                          <Typography sx={{ ml: 1 }}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.entity_type && formik.errors.entity_type && (
                    <FormHelperText>{formik.errors.entity_type}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Data Source */}
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.data_source_id && Boolean(formik.errors.data_source_id)}
                  disabled={isEditMode} // Can't change data source when editing
                >
                  <InputLabel id="data-source-label">Data Source *</InputLabel>
                  <Select
                    labelId="data-source-label"
                    id="data_source_id"
                    name="data_source_id"
                    value={formik.values.data_source_id}
                    onChange={handleDataSourceChange}
                    onBlur={formik.handleBlur}
                    label="Data Source *"
                    startAdornment={
                      formik.values.data_source_id ? (
                        <Box component="span" sx={{ mr: 1 }}>
                          <StorageIcon />
                        </Box>
                      ) : null
                    }
                  >
                    {dataSources.map((source) => (
                      <MenuItem key={source.id} value={source.id}>
                        <Box display="flex" alignItems="center">
                          <StorageIcon />
                          <Typography sx={{ ml: 1 }}>
                            {source.name}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.data_source_id && formik.errors.data_source_id && (
                    <FormHelperText>{formik.errors.data_source_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Parent Entity (if not database) */}
              {formik.values.entity_type && formik.values.entity_type !== 'database' && (
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    error={formik.touched.parent_id && Boolean(formik.errors.parent_id)}
                    disabled={isLoading || !formik.values.data_source_id}
                  >
                    <InputLabel id="parent-entity-label">
                      Parent {getParentType(formik.values.entity_type)?.charAt(0).toUpperCase() + 
                              getParentType(formik.values.entity_type)?.slice(1)} *
                    </InputLabel>
                    <Select
                      labelId="parent-entity-label"
                      id="parent_id"
                      name="parent_id"
                      value={formik.values.parent_id || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label={`Parent ${getParentType(formik.values.entity_type)?.charAt(0).toUpperCase() + 
                              getParentType(formik.values.entity_type)?.slice(1)} *`}
                    >
                      {availableParents.map((parent) => (
                        <MenuItem key={parent.id} value={parent.id}>
                          <Box display="flex" alignItems="center">
                            {getEntityIcon(getParentType(formik.values.entity_type) || '')}
                            <Typography sx={{ ml: 1 }}>
                              {parent.name}
                              {parent.qualified_name && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                  {parent.qualified_name}
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.parent_id && formik.errors.parent_id && (
                      <FormHelperText>{formik.errors.parent_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}
              
              {/* Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Name *"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              
              {/* Qualified Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="qualified_name"
                  name="qualified_name"
                  label="Qualified Name *"
                  value={formik.values.qualified_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.qualified_name && Boolean(formik.errors.qualified_name)}
                  helperText={
                    (formik.touched.qualified_name && formik.errors.qualified_name) ||
                    'Fully qualified name (e.g., database.schema.table)'
                  }
                />
              </Grid>
              
              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              
              {/* Sensitivity Label */}
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={formik.touched.sensitivity_label_id && Boolean(formik.errors.sensitivity_label_id)}
                >
                  <InputLabel id="sensitivity-label-label">Sensitivity Label</InputLabel>
                  <Select
                    labelId="sensitivity-label-label"
                    id="sensitivity_label_id"
                    name="sensitivity_label_id"
                    value={formik.values.sensitivity_label_id || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Sensitivity Label"
                    startAdornment={
                      formik.values.sensitivity_label_id ? (
                        <Box component="span" sx={{ mr: 1 }}>
                          <SecurityIcon />
                        </Box>
                      ) : null
                    }
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {sensitivityLabels.map((label) => (
                      <MenuItem key={label.id} value={label.id}>
                        <Box display="flex" alignItems="center">
                          <SecurityIcon />
                          <Typography sx={{ ml: 1 }}>
                            {label.name}
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                              {label.description}
                            </Typography>
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.sensitivity_label_id && formik.errors.sensitivity_label_id && (
                    <FormHelperText>{formik.errors.sensitivity_label_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {/* Classifications */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    id="classifications"
                    freeSolo
                    options={[]}
                    value={formik.values.classifications}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('classifications', newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          icon={<LabelIcon />}
                          label={option}
                          {...getTagProps({ index })}
                          key={option}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Classifications"
                        placeholder="Add classifications"
                        helperText="Type and press Enter to add custom classifications"
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <InfoIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">About Classifications</Typography>
                  </Box>
                  <Typography variant="body2">
                    Classifications help categorize and organize data entities. They can be used for filtering, reporting, and compliance purposes.
                    Examples include: Personal, Financial, PII, Confidential, Public, etc.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {/* Properties (JSON) */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="properties"
                  name="properties"
                  label="Properties (JSON)"
                  multiline
                  rows={10}
                  value={typeof formik.values.properties === 'object'
                    ? JSON.stringify(formik.values.properties, null, 2)
                    : formik.values.properties
                  }
                  onChange={handlePropertiesChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.properties && Boolean(formik.errors.properties)}
                  helperText={
                    (formik.touched.properties && formik.errors.properties) ||
                    'Additional properties in JSON format'
                  }
                  InputProps={{
                    sx: { fontFamily: 'monospace' },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <InfoIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">About Properties</Typography>
                  </Box>
                  <Typography variant="body2">
                    Properties allow you to store additional metadata about the entity in JSON format.
                    For example, for a column entity, you might include data type, length, precision, etc.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Example: {`{ "dataType": "varchar", "length": 255, "nullable": true }`}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
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
            {isEditMode ? 'Update Entity' : 'Create Entity'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EntityCreateEditModal;