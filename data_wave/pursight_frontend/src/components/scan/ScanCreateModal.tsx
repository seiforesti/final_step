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
  Checkbox,
  FormControlLabel,
  Switch,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useScans } from '../../hooks/useScans';
import { useDataSources } from '../../hooks/useDataSources';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ScanCreateModalProps {
  open: boolean;
  onClose: () => void;
  dataSourceId?: number;
  ruleSetId?: number;
  onSuccess?: () => void;
}

const ScanCreateModal: React.FC<ScanCreateModalProps> = ({
  open,
  onClose,
  dataSourceId,
  ruleSetId,
  onSuccess,
}) => {
  const { startScan, scheduleScan, isStartingScan } = useScans();
  const { dataSources, isDataSourcesLoading } = useDataSources();
  const { scanRuleSets, isLoadingScanRuleSets } = useScanRuleSets();
  
  const [error, setError] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [filteredRuleSets, setFilteredRuleSets] = useState<any[]>([]);

  const validationSchema = Yup.object({
    data_source_id: Yup.number().required('Data source is required'),
    scan_rule_set_id: Yup.number().required('Scan rule set is required'),
    description: Yup.string(),
    is_scheduled: Yup.boolean(),
    schedule_time: Yup.date().when('is_scheduled', {
      is: true,
      then: Yup.date().required('Schedule time is required').min(new Date(), 'Schedule time must be in the future'),
    }),
    schedule_cron: Yup.string().when('is_scheduled', {
      is: true,
      then: Yup.string(),
    }),
    scan_settings: Yup.object({
      sample_size: Yup.number().min(1, 'Sample size must be at least 1'),
      timeout_seconds: Yup.number().min(60, 'Timeout must be at least 60 seconds'),
      enable_classification: Yup.boolean(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      data_source_id: dataSourceId || '',
      scan_rule_set_id: ruleSetId || '',
      description: '',
      is_scheduled: false,
      schedule_time: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour from now
      schedule_cron: '',
      scan_settings: {
        sample_size: 100,
        timeout_seconds: 3600,
        enable_classification: true,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        
        if (values.is_scheduled) {
          await scheduleScan({
            data_source_id: values.data_source_id as number,
            scan_rule_set_id: values.scan_rule_set_id as number,
            description: values.description,
            schedule_time: values.schedule_time,
            schedule_cron: values.schedule_cron,
            scan_settings: values.scan_settings,
          });
        } else {
          await startScan({
            data_source_id: values.data_source_id as number,
            scan_rule_set_id: values.scan_rule_set_id as number,
            description: values.description,
            scan_settings: values.scan_settings,
          });
        }
        
        onSuccess?.();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to start scan');
      }
    },
  });

  // Filter rule sets based on selected data source
  useEffect(() => {
    if (scanRuleSets) {
      const filtered = scanRuleSets.filter((ruleSet: any) => {
        return ruleSet.is_global || ruleSet.data_source_id === formik.values.data_source_id;
      });
      setFilteredRuleSets(filtered);
    }
  }, [scanRuleSets, formik.values.data_source_id]);

  // Set data source ID and rule set ID if provided as props
  useEffect(() => {
    if (dataSourceId) {
      formik.setFieldValue('data_source_id', dataSourceId);
    }
    if (ruleSetId) {
      formik.setFieldValue('scan_rule_set_id', ruleSetId);
    }
  }, [dataSourceId, ruleSetId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create New Scan</Typography>
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
                Scan Configuration
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.data_source_id && Boolean(formik.errors.data_source_id)}
                disabled={!!dataSourceId}
              >
                <InputLabel id="data-source-label">Data Source</InputLabel>
                <Select
                  labelId="data-source-label"
                  id="data_source_id"
                  name="data_source_id"
                  value={formik.values.data_source_id}
                  onChange={(e) => {
                    formik.setFieldValue('data_source_id', e.target.value);
                    // Clear rule set if data source changes
                    if (!ruleSetId) {
                      formik.setFieldValue('scan_rule_set_id', '');
                    }
                  }}
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
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.scan_rule_set_id && Boolean(formik.errors.scan_rule_set_id)}
                disabled={!!ruleSetId || !formik.values.data_source_id}
              >
                <InputLabel id="rule-set-label">Scan Rule Set</InputLabel>
                <Select
                  labelId="rule-set-label"
                  id="scan_rule_set_id"
                  name="scan_rule_set_id"
                  value={formik.values.scan_rule_set_id}
                  onChange={formik.handleChange}
                  label="Scan Rule Set"
                >
                  {isLoadingScanRuleSets || !formik.values.data_source_id ? (
                    <MenuItem value="" disabled>
                      {!formik.values.data_source_id ? 'Select a data source first' : 'Loading...'}
                    </MenuItem>
                  ) : filteredRuleSets && filteredRuleSets.length > 0 ? (
                    filteredRuleSets.map((ruleSet: any) => (
                      <MenuItem key={ruleSet.id} value={ruleSet.id}>
                        {ruleSet.name} {ruleSet.is_global && '(Global)'}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No rule sets available for this data source
                    </MenuItem>
                  )}
                </Select>
                {formik.touched.scan_rule_set_id && formik.errors.scan_rule_set_id && (
                  <FormHelperText>{formik.errors.scan_rule_set_id as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description (Optional)"
                value={formik.values.description}
                onChange={formik.handleChange}
                multiline
                rows={2}
                placeholder="Enter a description for this scan"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" alignItems="center">
                <ScheduleIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="subtitle1">
                  Scheduling Options
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_scheduled}
                    onChange={(e) => {
                      formik.setFieldValue('is_scheduled', e.target.checked);
                      setIsScheduled(e.target.checked);
                    }}
                    name="is_scheduled"
                    color="primary"
                  />
                }
                label="Schedule this scan for later"
              />
            </Grid>
            
            {formik.values.is_scheduled && (
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Schedule Time"
                    value={formik.values.schedule_time}
                    onChange={(newValue) => {
                      formik.setFieldValue('schedule_time', newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.schedule_time && Boolean(formik.errors.schedule_time),
                        helperText: formik.touched.schedule_time && formik.errors.schedule_time as string,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            )}
            
            {formik.values.is_scheduled && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="schedule_cron"
                  name="schedule_cron"
                  label="Cron Expression (Optional)"
                  value={formik.values.schedule_cron}
                  onChange={formik.handleChange}
                  placeholder="e.g., 0 0 * * * (daily at midnight)"
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Use cron expressions for recurring schedules. Leave empty for one-time schedule.">
                        <IconButton edge="end">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="advanced-settings-content"
                  id="advanced-settings-header"
                >
                  <Typography>Advanced Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="scan_settings.sample_size"
                        name="scan_settings.sample_size"
                        label="Sample Size"
                        type="number"
                        value={formik.values.scan_settings.sample_size}
                        onChange={formik.handleChange}
                        InputProps={{ inputProps: { min: 1 } }}
                        helperText="Number of rows to sample for data profiling"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="scan_settings.timeout_seconds"
                        name="scan_settings.timeout_seconds"
                        label="Timeout (seconds)"
                        type="number"
                        value={formik.values.scan_settings.timeout_seconds}
                        onChange={formik.handleChange}
                        InputProps={{ inputProps: { min: 60 } }}
                        helperText="Maximum time allowed for scan execution"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.scan_settings.enable_classification}
                            onChange={(e) => {
                              formik.setFieldValue('scan_settings.enable_classification', e.target.checked);
                            }}
                            name="scan_settings.enable_classification"
                            color="primary"
                          />
                        }
                        label="Enable Data Classification"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Automatically classify data based on content patterns (may increase scan duration)
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
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
            disabled={isStartingScan}
            startIcon={isStartingScan ? <CircularProgress size={20} /> : null}
          >
            {isStartingScan ? 'Starting...' : formik.values.is_scheduled ? 'Schedule Scan' : 'Start Scan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ScanCreateModal;