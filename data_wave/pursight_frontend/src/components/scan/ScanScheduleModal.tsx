import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Paper,
  Switch,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useScans } from '../../hooks/useScans';
import { useDataSources } from '../../hooks/useDataSources';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface ScanScheduleModalProps {
  open: boolean;
  onClose: () => void;
  scanId?: number;
  dataSourceId?: number;
  ruleSetId?: number;
  onSuccess?: () => void;
}

const ScanScheduleModal: React.FC<ScanScheduleModalProps> = ({
  open,
  onClose,
  scanId,
  dataSourceId,
  ruleSetId,
  onSuccess,
}) => {
  const { createScanSchedule, updateScanSchedule, getScanScheduleById, isCreatingSchedule, isUpdatingSchedule } = useScans();
  const { getDataSources, getDataSourceById } = useDataSources();
  const { getScanRuleSets, getScanRuleSetById } = useScanRuleSets();
  
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [ruleSets, setRuleSets] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any | null>(null);
  const [ruleSet, setRuleSet] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState('recurring');
  const [schedulePreview, setSchedulePreview] = useState<string[]>([]);
  const [existingSchedule, setExistingSchedule] = useState<any | null>(null);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load data sources
      const sourcesData = await getDataSources();
      setDataSources(sourcesData);
      
      // If editing an existing schedule
      if (scanId) {
        const scheduleData = await getScanScheduleById(scanId);
        setExistingSchedule(scheduleData);
        
        if (scheduleData.data_source_id) {
          const sourceData = await getDataSourceById(scheduleData.data_source_id);
          setDataSource(sourceData);
          
          // Load rule sets for this data source
          const ruleSetsData = await getScanRuleSets({ data_source_id: scheduleData.data_source_id });
          setRuleSets(ruleSetsData);
        }
        
        if (scheduleData.scan_rule_set_id) {
          const ruleSetData = await getScanRuleSetById(scheduleData.scan_rule_set_id);
          setRuleSet(ruleSetData);
        }
        
        // Set form values from existing schedule
        formik.setValues({
          name: scheduleData.name || '',
          description: scheduleData.description || '',
          data_source_id: scheduleData.data_source_id || '',
          scan_rule_set_id: scheduleData.scan_rule_set_id || '',
          schedule_type: scheduleData.cron_expression ? 'recurring' : 'once',
          cron_expression: scheduleData.cron_expression || '',
          start_date: scheduleData.start_date ? new Date(scheduleData.start_date) : new Date(),
          start_time: scheduleData.start_date ? new Date(scheduleData.start_date) : new Date(),
          frequency: getCronFrequency(scheduleData.cron_expression),
          day_of_week: getCronDayOfWeek(scheduleData.cron_expression),
          day_of_month: getCronDayOfMonth(scheduleData.cron_expression),
          hour: getCronHour(scheduleData.cron_expression),
          minute: getCronMinute(scheduleData.cron_expression),
          enable_classification: scheduleData.scan_settings?.enable_classification || false,
          sample_size: scheduleData.scan_settings?.sample_size || 100,
          timeout_seconds: scheduleData.scan_settings?.timeout_seconds || 3600,
        });
        
        setScheduleType(scheduleData.cron_expression ? 'recurring' : 'once');
      } else if (dataSourceId) {
        // If creating a new schedule with pre-selected data source
        const sourceData = await getDataSourceById(dataSourceId);
        setDataSource(sourceData);
        formik.setFieldValue('data_source_id', dataSourceId);
        
        // Load rule sets for this data source
        const ruleSetsData = await getScanRuleSets({ data_source_id: dataSourceId });
        setRuleSets(ruleSetsData);
        
        if (ruleSetId) {
          const ruleSetData = await getScanRuleSetById(ruleSetId);
          setRuleSet(ruleSetData);
          formik.setFieldValue('scan_rule_set_id', ruleSetId);
        }
      } else {
        // Load all rule sets
        const ruleSetsData = await getScanRuleSets();
        setRuleSets(ruleSetsData);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, dataSourceId, ruleSetId, scanId]);
  
  const handleDataSourceChange = async (sourceId: number) => {
    try {
      setIsLoading(true);
      
      // Load data source details
      const sourceData = await getDataSourceById(sourceId);
      setDataSource(sourceData);
      
      // Reset rule set selection
      formik.setFieldValue('scan_rule_set_id', '');
      
      // Load rule sets for this data source
      const ruleSetsData = await getScanRuleSets({ data_source_id: sourceId });
      setRuleSets(ruleSetsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load rule sets');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRuleSetChange = async (ruleSetId: number) => {
    try {
      setIsLoading(true);
      
      // Load rule set details
      const ruleSetData = await getScanRuleSetById(ruleSetId);
      setRuleSet(ruleSetData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load rule set details');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper functions to parse cron expressions
  const getCronFrequency = (cronExpression: string): string => {
    if (!cronExpression) return 'daily';
    
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return 'daily';
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    if (dayOfMonth !== '*' && dayOfWeek === '*') return 'monthly';
    if (dayOfMonth === '*' && dayOfWeek !== '*') return 'weekly';
    return 'daily';
  };
  
  const getCronDayOfWeek = (cronExpression: string): number => {
    if (!cronExpression) return 1; // Monday
    
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return 1;
    
    const dayOfWeek = parts[4];
    if (dayOfWeek === '*') return 1;
    
    return parseInt(dayOfWeek, 10);
  };
  
  const getCronDayOfMonth = (cronExpression: string): number => {
    if (!cronExpression) return 1;
    
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return 1;
    
    const dayOfMonth = parts[2];
    if (dayOfMonth === '*') return 1;
    
    return parseInt(dayOfMonth, 10);
  };
  
  const getCronHour = (cronExpression: string): number => {
    if (!cronExpression) return 0;
    
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return 0;
    
    const hour = parts[1];
    if (hour === '*') return 0;
    
    return parseInt(hour, 10);
  };
  
  const getCronMinute = (cronExpression: string): number => {
    if (!cronExpression) return 0;
    
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return 0;
    
    const minute = parts[0];
    if (minute === '*') return 0;
    
    return parseInt(minute, 10);
  };
  
  // Generate cron expression from form values
  const generateCronExpression = (values: any): string => {
    const { frequency, day_of_week, day_of_month, hour, minute } = values;
    
    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`;
      case 'weekly':
        return `${minute} ${hour} * * ${day_of_week}`;
      case 'monthly':
        return `${minute} ${hour} ${day_of_month} * *`;
      default:
        return `${minute} ${hour} * * *`;
    }
  };
  
  // Generate human-readable schedule preview
  const generateSchedulePreview = (values: any): string[] => {
    const { schedule_type, frequency, day_of_week, day_of_month, hour, minute, start_date, start_time } = values;
    
    if (schedule_type === 'once') {
      const dateTime = new Date(start_date);
      dateTime.setHours(new Date(start_time).getHours());
      dateTime.setMinutes(new Date(start_time).getMinutes());
      
      return [format(dateTime, "EEEE, MMMM d, yyyy 'at' h:mm a")];
    }
    
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const now = new Date();
    const preview = [];
    
    switch (frequency) {
      case 'daily':
        preview.push(`Every day at ${timeStr}`);
        // Next 3 occurrences
        for (let i = 1; i <= 3; i++) {
          const nextDate = addDays(now, i);
          preview.push(format(nextDate, "MMMM d, yyyy") + ` at ${timeStr}`);
        }
        break;
      
      case 'weekly':
        preview.push(`Every ${dayNames[day_of_week]} at ${timeStr}`);
        // Calculate next occurrence
        let daysUntilNext = (day_of_week - now.getDay() + 7) % 7;
        if (daysUntilNext === 0) daysUntilNext = 7; // If today, then next week
        
        let nextDate = addDays(now, daysUntilNext);
        preview.push(format(nextDate, "MMMM d, yyyy") + ` at ${timeStr}`);
        
        // Next 2 occurrences
        for (let i = 1; i <= 2; i++) {
          nextDate = addWeeks(nextDate, 1);
          preview.push(format(nextDate, "MMMM d, yyyy") + ` at ${timeStr}`);
        }
        break;
      
      case 'monthly':
        preview.push(`Monthly on day ${day_of_month} at ${timeStr}`);
        
        // Calculate next occurrence
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let nextMonth = currentMonth;
        let nextYear = currentYear;
        
        if (now.getDate() >= day_of_month) {
          nextMonth = (currentMonth + 1) % 12;
          if (nextMonth === 0) nextYear++;
        }
        
        const nextMonthDate = new Date(nextYear, nextMonth, day_of_month);
        preview.push(format(nextMonthDate, "MMMM d, yyyy") + ` at ${timeStr}`);
        
        // Next 2 occurrences
        for (let i = 1; i <= 2; i++) {
          const futureDate = addMonths(nextMonthDate, i);
          preview.push(format(futureDate, "MMMM d, yyyy") + ` at ${timeStr}`);
        }
        break;
    }
    
    return preview;
  };
  
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      data_source_id: dataSourceId || '',
      scan_rule_set_id: ruleSetId || '',
      schedule_type: 'recurring',
      cron_expression: '',
      start_date: new Date(),
      start_time: new Date(),
      frequency: 'daily',
      day_of_week: 1, // Monday
      day_of_month: 1,
      hour: 0,
      minute: 0,
      enable_classification: false,
      sample_size: 100,
      timeout_seconds: 3600,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      description: Yup.string(),
      data_source_id: Yup.number().required('Data source is required'),
      scan_rule_set_id: Yup.number().required('Scan rule set is required'),
      schedule_type: Yup.string().required('Schedule type is required'),
      start_date: Yup.date().when('schedule_type', {
        is: 'once',
        then: Yup.date().required('Start date is required'),
      }),
      start_time: Yup.date().when('schedule_type', {
        is: 'once',
        then: Yup.date().required('Start time is required'),
      }),
      frequency: Yup.string().when('schedule_type', {
        is: 'recurring',
        then: Yup.string().required('Frequency is required'),
      }),
      day_of_week: Yup.number().when('frequency', {
        is: 'weekly',
        then: Yup.number().min(0).max(6).required('Day of week is required'),
      }),
      day_of_month: Yup.number().when('frequency', {
        is: 'monthly',
        then: Yup.number().min(1).max(31).required('Day of month is required'),
      }),
      hour: Yup.number().min(0).max(23).required('Hour is required'),
      minute: Yup.number().min(0).max(59).required('Minute is required'),
      sample_size: Yup.number().min(1).max(10000),
      timeout_seconds: Yup.number().min(60).max(86400),
    }),
    onSubmit: async (values) => {
      try {
        setError(null);
        
        // Generate cron expression for recurring schedules
        if (values.schedule_type === 'recurring') {
          values.cron_expression = generateCronExpression(values);
        } else {
          values.cron_expression = '';
        }
        
        // Combine date and time for one-time schedules
        if (values.schedule_type === 'once') {
          const dateTime = new Date(values.start_date);
          dateTime.setHours(new Date(values.start_time).getHours());
          dateTime.setMinutes(new Date(values.start_time).getMinutes());
          values.start_date = dateTime.toISOString();
        }
        
        // Prepare scan settings
        const scanSettings = {
          enable_classification: values.enable_classification,
          sample_size: values.sample_size,
          timeout_seconds: values.timeout_seconds,
        };
        
        // Create or update schedule
        if (existingSchedule) {
          await updateScanSchedule(existingSchedule.id, {
            name: values.name,
            description: values.description,
            data_source_id: values.data_source_id,
            scan_rule_set_id: values.scan_rule_set_id,
            cron_expression: values.cron_expression,
            start_date: values.schedule_type === 'once' ? values.start_date : null,
            scan_settings: scanSettings,
          });
        } else {
          await createScanSchedule({
            name: values.name,
            description: values.description,
            data_source_id: values.data_source_id,
            scan_rule_set_id: values.scan_rule_set_id,
            cron_expression: values.cron_expression,
            start_date: values.schedule_type === 'once' ? values.start_date : null,
            scan_settings: scanSettings,
          });
        }
        
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to save schedule');
      }
    },
  });
  
  // Update schedule preview when form values change
  useEffect(() => {
    const preview = generateSchedulePreview(formik.values);
    setSchedulePreview(preview);
    
    // Generate cron expression for recurring schedules
    if (formik.values.schedule_type === 'recurring') {
      const cronExpression = generateCronExpression(formik.values);
      formik.setFieldValue('cron_expression', cronExpression, false);
    }
  }, [
    formik.values.schedule_type,
    formik.values.frequency,
    formik.values.day_of_week,
    formik.values.day_of_month,
    formik.values.hour,
    formik.values.minute,
    formik.values.start_date,
    formik.values.start_time,
  ]);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <ScheduleIcon sx={{ mr: 1 }} />
          {existingSchedule ? 'Edit Scan Schedule' : 'Create Scan Schedule'}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
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
                label="Schedule Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={isLoading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.data_source_id && Boolean(formik.errors.data_source_id)}>
                <InputLabel id="data-source-label">Data Source</InputLabel>
                <Select
                  labelId="data-source-label"
                  id="data_source_id"
                  name="data_source_id"
                  value={formik.values.data_source_id}
                  onChange={(e) => {
                    formik.handleChange(e);
                    handleDataSourceChange(Number(e.target.value));
                  }}
                  label="Data Source"
                  disabled={isLoading || Boolean(existingSchedule)}
                  required
                >
                  {dataSources.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.name} ({source.source_type})
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.data_source_id && formik.errors.data_source_id && (
                  <Typography variant="caption" color="error">
                    {formik.errors.data_source_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.scan_rule_set_id && Boolean(formik.errors.scan_rule_set_id)}>
                <InputLabel id="rule-set-label">Scan Rule Set</InputLabel>
                <Select
                  labelId="rule-set-label"
                  id="scan_rule_set_id"
                  name="scan_rule_set_id"
                  value={formik.values.scan_rule_set_id}
                  onChange={(e) => {
                    formik.handleChange(e);
                    handleRuleSetChange(Number(e.target.value));
                  }}
                  label="Scan Rule Set"
                  disabled={isLoading || !formik.values.data_source_id || Boolean(existingSchedule)}
                  required
                >
                  {ruleSets
                    .filter(rs => rs.is_global || rs.data_source_id === Number(formik.values.data_source_id))
                    .map((ruleSet) => (
                      <MenuItem key={ruleSet.id} value={ruleSet.id}>
                        {ruleSet.name} {ruleSet.is_global && '(Global)'}
                      </MenuItem>
                    ))}
                </Select>
                {formik.touched.scan_rule_set_id && formik.errors.scan_rule_set_id && (
                  <Typography variant="caption" color="error">
                    {formik.errors.scan_rule_set_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Schedule Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Schedule Type</FormLabel>
                <RadioGroup
                  row
                  name="schedule_type"
                  value={formik.values.schedule_type}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setScheduleType(e.target.value);
                  }}
                >
                  <FormControlLabel value="once" control={<Radio />} label="Run Once" />
                  <FormControlLabel value="recurring" control={<Radio />} label="Recurring Schedule" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {formik.values.schedule_type === 'once' ? (
              <>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={formik.values.start_date}
                      onChange={(date) => formik.setFieldValue('start_date', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: formik.touched.start_date && Boolean(formik.errors.start_date),
                          helperText: formik.touched.start_date && formik.errors.start_date as string,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Start Time"
                      value={formik.values.start_time}
                      onChange={(time) => formik.setFieldValue('start_time', time)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: formik.touched.start_time && Boolean(formik.errors.start_time),
                          helperText: formik.touched.start_time && formik.errors.start_time as string,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="frequency-label">Frequency</InputLabel>
                    <Select
                      labelId="frequency-label"
                      id="frequency"
                      name="frequency"
                      value={formik.values.frequency}
                      onChange={formik.handleChange}
                      label="Frequency"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {formik.values.frequency === 'weekly' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                      <Select
                        labelId="day-of-week-label"
                        id="day_of_week"
                        name="day_of_week"
                        value={formik.values.day_of_week}
                        onChange={formik.handleChange}
                        label="Day of Week"
                      >
                        <MenuItem value={0}>Sunday</MenuItem>
                        <MenuItem value={1}>Monday</MenuItem>
                        <MenuItem value={2}>Tuesday</MenuItem>
                        <MenuItem value={3}>Wednesday</MenuItem>
                        <MenuItem value={4}>Thursday</MenuItem>
                        <MenuItem value={5}>Friday</MenuItem>
                        <MenuItem value={6}>Saturday</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                {formik.values.frequency === 'monthly' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="day_of_month"
                      name="day_of_month"
                      label="Day of Month"
                      type="number"
                      InputProps={{ inputProps: { min: 1, max: 31 } }}
                      value={formik.values.day_of_month}
                      onChange={formik.handleChange}
                      error={formik.touched.day_of_month && Boolean(formik.errors.day_of_month)}
                      helperText={formik.touched.day_of_month && formik.errors.day_of_month}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="hour"
                    name="hour"
                    label="Hour (0-23)"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 23 } }}
                    value={formik.values.hour}
                    onChange={formik.handleChange}
                    error={formik.touched.hour && Boolean(formik.errors.hour)}
                    helperText={formik.touched.hour && formik.errors.hour}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="minute"
                    name="minute"
                    label="Minute (0-59)"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 59 } }}
                    value={formik.values.minute}
                    onChange={formik.handleChange}
                    error={formik.touched.minute && Boolean(formik.errors.minute)}
                    helperText={formik.touched.minute && formik.errors.minute}
                  />
                </Grid>
                
                {formik.values.cron_expression && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Cron Expression
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1" fontFamily="monospace">
                          {formik.values.cron_expression}
                        </Typography>
                        <Tooltip title="Cron expression format: minute hour day-of-month month day-of-week">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </>
            )}
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarTodayIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="subtitle2">
                    Schedule Preview
                  </Typography>
                </Box>
                
                {schedulePreview.map((preview, index) => (
                  <Typography key={index} variant="body2" sx={{ mt: index === 0 ? 1 : 0.5 }}>
                    {index === 0 ? (
                      <strong>{preview}</strong>
                    ) : (
                      <>
                        {index === 1 && <span>Next runs: </span>}
                        {preview}
                      </>
                    )}
                  </Typography>
                ))}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Advanced Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="sample_size"
                name="sample_size"
                label="Sample Size"
                type="number"
                InputProps={{ inputProps: { min: 1, max: 10000 } }}
                value={formik.values.sample_size}
                onChange={formik.handleChange}
                error={formik.touched.sample_size && Boolean(formik.errors.sample_size)}
                helperText={formik.touched.sample_size && formik.errors.sample_size}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="timeout_seconds"
                name="timeout_seconds"
                label="Timeout (seconds)"
                type="number"
                InputProps={{ inputProps: { min: 60, max: 86400 } }}
                value={formik.values.timeout_seconds}
                onChange={formik.handleChange}
                error={formik.touched.timeout_seconds && Boolean(formik.errors.timeout_seconds)}
                helperText={formik.touched.timeout_seconds && formik.errors.timeout_seconds}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.enable_classification}
                    onChange={(e) => formik.setFieldValue('enable_classification', e.target.checked)}
                    name="enable_classification"
                    color="primary"
                  />
                }
                label="Enable Classification"
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          color="primary"
          disabled={isLoading || isCreatingSchedule || isUpdatingSchedule}
          startIcon={isCreatingSchedule || isUpdatingSchedule ? <CircularProgress size={20} /> : null}
        >
          {isCreatingSchedule || isUpdatingSchedule
            ? (existingSchedule ? 'Updating...' : 'Creating...')
            : (existingSchedule ? 'Update Schedule' : 'Create Schedule')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScanScheduleModal;