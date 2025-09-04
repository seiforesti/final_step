// ExportDialog.tsx - Enterprise-grade data export dialog for RBAC system
// Provides comprehensive data export with multiple formats, filtering, and RBAC integration

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, FileText, File, FileSpreadsheet, Image, Database, X, Check, ChevronDown, ChevronUp, Settings, Filter, Calendar, Users, Shield, Eye, EyeOff, AlertCircle, CheckCircle, Clock, Zap, Archive, Share, Mail, Copy, ExternalLink, RefreshCw, Pause, Play, Square } from 'lucide-react';
import { cn } from '@/lib copie/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { ExportLoading, ProgressBar } from './LoadingStates';

// Core export interfaces
export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: React.ReactNode;
  description?: string;
  mimeType: string;
  supportsFiltering?: boolean;
  supportsCustomFields?: boolean;
  maxRecords?: number;
  estimatedSizeMultiplier: number; // Relative to CSV
}

export interface ExportField {
  id: string;
  label: string;
  key: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
  required?: boolean;
  sensitive?: boolean;
  permission?: string;
  formatter?: (value: any) => string;
  description?: string;
}

export interface ExportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  label?: string;
}

export interface ExportOptions {
  format: string;
  fields: string[];
  filters: ExportFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
  encoding?: string;
  delimiter?: string; // For CSV
  includeMetadata?: boolean;
  password?: string; // For protected exports
  watermark?: string;
  compression?: boolean;
}

export interface ExportProgress {
  status: 'preparing' | 'exporting' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  processedRecords: number;
  totalRecords: number;
  currentPhase: string;
  estimatedTimeRemaining?: number;
  fileSize?: number;
  errors?: string[];
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
  recordCount?: number;
  error?: string;
  warnings?: string[];
}

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Data configuration
  data?: any[];
  dataSource?: string; // API endpoint or data source identifier
  totalRecords?: number;
  availableFields: ExportField[];
  
  // Export configuration
  supportedFormats?: ExportFormat[];
  defaultFormat?: string;
  maxRecords?: number;
  enableFiltering?: boolean;
  enableFieldSelection?: boolean;
  enableScheduling?: boolean;
  
  // Callbacks
  onExport: (options: ExportOptions) => Promise<ExportResult>;
  onProgress?: (progress: ExportProgress) => void;
  onComplete?: (result: ExportResult) => void;
  onError?: (error: string) => void;
  
  // Customization
  title?: string;
  description?: string;
  className?: string;
  
  // RBAC
  permission?: string;
  sensitiveDataPermission?: string;
  exportHistoryPermission?: string;
  
  // Advanced features
  enablePreview?: boolean;
  enableTemplates?: boolean;
  enableSharing?: boolean;
  enableHistory?: boolean;
}

// Default export formats
const DEFAULT_FORMATS: ExportFormat[] = [
  {
    id: 'csv',
    name: 'CSV',
    extension: 'csv',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    description: 'Comma-separated values, compatible with Excel',
    mimeType: 'text/csv',
    supportsFiltering: true,
    supportsCustomFields: true,
    estimatedSizeMultiplier: 1
  },
  {
    id: 'excel',
    name: 'Excel',
    extension: 'xlsx',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    description: 'Microsoft Excel workbook',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    supportsFiltering: true,
    supportsCustomFields: true,
    maxRecords: 1000000,
    estimatedSizeMultiplier: 1.5
  },
  {
    id: 'json',
    name: 'JSON',
    extension: 'json',
    icon: <FileText className="w-5 h-5" />,
    description: 'JavaScript Object Notation',
    mimeType: 'application/json',
    supportsFiltering: true,
    supportsCustomFields: true,
    estimatedSizeMultiplier: 2
  },
  {
    id: 'pdf',
    name: 'PDF',
    extension: 'pdf',
    icon: <File className="w-5 h-5" />,
    description: 'Portable Document Format (limited records)',
    mimeType: 'application/pdf',
    supportsFiltering: true,
    supportsCustomFields: false,
    maxRecords: 1000,
    estimatedSizeMultiplier: 3
  }
];

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const estimateFileSize = (recordCount: number, fieldCount: number, format: ExportFormat): number => {
  const avgFieldSize = 20; // Average bytes per field
  const baseSize = recordCount * fieldCount * avgFieldSize;
  return Math.round(baseSize * format.estimatedSizeMultiplier);
};

const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};

// Format selection component
const FormatSelector: React.FC<{
  formats: ExportFormat[];
  selectedFormat: string;
  onFormatChange: (formatId: string) => void;
  recordCount?: number;
  className?: string;
}> = ({ formats, selectedFormat, onFormatChange, recordCount = 0, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium text-gray-900">Export Format</h4>
      <div className="grid grid-cols-2 gap-3">
        {formats.map((format) => {
          const isSelected = selectedFormat === format.id;
          const isDisabled = format.maxRecords && recordCount > format.maxRecords;
          const estimatedSize = estimateFileSize(recordCount, 10, format);
          
          return (
            <button
              key={format.id}
              onClick={() => !isDisabled && onFormatChange(format.id)}
              disabled={isDisabled}
              className={cn(
                'p-3 border rounded-lg text-left transition-colors',
                isSelected && 'border-blue-500 bg-blue-50 ring-1 ring-blue-500',
                !isSelected && !isDisabled && 'border-gray-300 hover:border-gray-400',
                isDisabled && 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'mt-0.5',
                  isSelected ? 'text-blue-600' : 'text-gray-400'
                )}>
                  {format.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      'font-medium',
                      isSelected ? 'text-blue-900' : 'text-gray-900',
                      isDisabled && 'text-gray-500'
                    )}>
                      {format.name}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className={cn(
                    'text-xs mt-1',
                    isSelected ? 'text-blue-700' : 'text-gray-600',
                    isDisabled && 'text-gray-400'
                  )}>
                    {format.description}
                  </p>
                  {estimatedSize > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Est. size: {formatFileSize(estimatedSize)}
                    </p>
                  )}
                  {isDisabled && format.maxRecords && (
                    <p className="text-xs text-red-600 mt-1">
                      Max {format.maxRecords.toLocaleString()} records
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Field selection component
const FieldSelector: React.FC<{
  fields: ExportField[];
  selectedFields: string[];
  onFieldsChange: (fieldIds: string[]) => void;
  hasPermission: (permission: string) => boolean;
  className?: string;
}> = ({ fields, selectedFields, onFieldsChange, hasPermission, className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);
  
  const filteredFields = useMemo(() => {
    return fields.filter(field => {
      // Permission check
      if (field.permission && !hasPermission(field.permission)) {
        return false;
      }
      
      // Sensitive data filter
      if (field.sensitive && !showSensitive) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        return field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
               field.key.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
  }, [fields, hasPermission, showSensitive, searchQuery]);
  
  const handleToggleField = (fieldId: string) => {
    const newSelection = selectedFields.includes(fieldId)
      ? selectedFields.filter(id => id !== fieldId)
      : [...selectedFields, fieldId];
    onFieldsChange(newSelection);
  };
  
  const handleSelectAll = () => {
    onFieldsChange(filteredFields.map(f => f.id));
  };
  
  const handleDeselectAll = () => {
    onFieldsChange([]);
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Fields to Export</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleDeselectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Deselect All
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Search and filters */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowSensitive(!showSensitive)}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-colors',
              showSensitive ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
          >
            {showSensitive ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span>Sensitive</span>
          </button>
        </div>
        
        {/* Field list */}
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <div className="p-2 space-y-1">
            {filteredFields.map((field) => {
              const isSelected = selectedFields.includes(field.id);
              
              return (
                <label
                  key={field.id}
                  className={cn(
                    'flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer',
                    field.sensitive && 'bg-orange-50 border border-orange-200'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleField(field.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-xs text-red-600">Required</span>
                      )}
                      {field.sensitive && (
                        <Shield className="w-3 h-3 text-orange-600" />
                      )}
                    </div>
                    {field.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {field.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
            
            {filteredFields.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Filter className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No fields found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600">
        {selectedFields.length} of {filteredFields.length} fields selected
      </div>
    </div>
  );
};

// Export progress component
const ExportProgressDisplay: React.FC<{
  progress: ExportProgress;
  onCancel?: () => void;
  className?: string;
}> = ({ progress, onCancel, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          {progress.status === 'completed' ? 'Export Complete' : 'Exporting Data'}
        </h4>
        {progress.status !== 'completed' && progress.status !== 'failed' && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{progress.currentPhase}</span>
          <span>{progress.processedRecords} of {progress.totalRecords} records</span>
        </div>
        
        <ProgressBar
          progress={progress.progress}
          showLabel={false}
          variant={progress.status === 'failed' ? 'error' : 'primary'}
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {progress.status === 'completed' && (
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </span>
            )}
            {progress.status === 'failed' && (
              <span className="flex items-center text-red-600">
                <AlertCircle className="w-3 h-3 mr-1" />
                Failed
              </span>
            )}
            {progress.fileSize && (
              <span>Size: {formatFileSize(progress.fileSize)}</span>
            )}
          </div>
          
          {progress.estimatedTimeRemaining && progress.status === 'exporting' && (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeRemaining(progress.estimatedTimeRemaining)} remaining
            </span>
          )}
        </div>
        
        {progress.errors && progress.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <h5 className="text-sm font-medium text-red-900 mb-2">Errors:</h5>
            <ul className="text-xs text-red-700 space-y-1">
              {progress.errors.slice(0, 3).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
              {progress.errors.length > 3 && (
                <li>... and {progress.errors.length - 3} more errors</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Main export dialog component
export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  
  // Data configuration
  data = [],
  dataSource,
  totalRecords = 0,
  availableFields,
  
  // Export configuration
  supportedFormats = DEFAULT_FORMATS,
  defaultFormat = 'csv',
  maxRecords = 100000,
  enableFiltering = true,
  enableFieldSelection = true,
  enableScheduling = false,
  
  // Callbacks
  onExport,
  onProgress,
  onComplete,
  onError,
  
  // Customization
  title = 'Export Data',
  description,
  className,
  
  // RBAC
  permission,
  sensitiveDataPermission = 'export.sensitive',
  exportHistoryPermission = 'export.history',
  
  // Advanced features
  enablePreview = false,
  enableTemplates = false,
  enableSharing = false,
  enableHistory = false
}) => {
  const { hasPermission } = usePermissionCheck();
  const { user } = useCurrentUser();
  
  // State management
  const [selectedFormat, setSelectedFormat] = useState(defaultFormat);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportOptions, setExportOptions] = useState<Partial<ExportOptions>>({
    includeHeaders: true,
    dateFormat: 'YYYY-MM-DD',
    encoding: 'utf-8',
    compression: false
  });
  const [currentProgress, setCurrentProgress] = useState<ExportProgress | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [step, setStep] = useState<'configure' | 'exporting' | 'complete'>('configure');
  
  // Permission check
  if (permission && !hasPermission(permission)) {
    return null;
  }
  
  // Initialize selected fields with required fields
  useEffect(() => {
    if (selectedFields.length === 0) {
      const defaultFields = availableFields
        .filter(field => field.required || (!field.permission || hasPermission(field.permission)))
        .slice(0, 10) // Limit to first 10 fields by default
        .map(field => field.id);
      setSelectedFields(defaultFields);
    }
  }, [availableFields, selectedFields.length, hasPermission]);
  
  // Handle format change
  const handleFormatChange = useCallback((formatId: string) => {
    setSelectedFormat(formatId);
    const format = supportedFormats.find(f => f.id === formatId);
    
    // Update options based on format
    if (format) {
      setExportOptions(prev => ({
        ...prev,
        format: formatId,
        delimiter: formatId === 'csv' ? ',' : undefined
      }));
    }
  }, [supportedFormats]);
  
  // Handle export execution
  const handleExport = useCallback(async () => {
    if (selectedFields.length === 0) {
      onError?.('Please select at least one field to export');
      return;
    }
    
    const finalOptions: ExportOptions = {
      format: selectedFormat,
      fields: selectedFields,
      filters: [],
      includeHeaders: true,
      dateFormat: 'YYYY-MM-DD',
      encoding: 'utf-8',
      ...exportOptions
    };
    
    try {
      setIsExporting(true);
      setStep('exporting');
      setCurrentProgress({
        status: 'preparing',
        progress: 0,
        processedRecords: 0,
        totalRecords: totalRecords || data.length,
        currentPhase: 'Preparing export...'
      });
      
      const result = await onExport(finalOptions);
      
      setExportResult(result);
      setStep('complete');
      setCurrentProgress({
        status: 'completed',
        progress: 100,
        processedRecords: totalRecords || data.length,
        totalRecords: totalRecords || data.length,
        currentPhase: 'Export completed',
        fileSize: result.fileSize
      });
      
      onComplete?.(result);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      onError?.(errorMessage);
      setCurrentProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        errors: [errorMessage]
      } : null);
    } finally {
      setIsExporting(false);
    }
  }, [selectedFormat, selectedFields, exportOptions, onExport, onComplete, onError, totalRecords, data.length]);
  
  // Handle progress updates
  useEffect(() => {
    if (currentProgress && onProgress) {
      onProgress(currentProgress);
    }
  }, [currentProgress, onProgress]);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('configure');
      setCurrentProgress(null);
      setExportResult(null);
      setIsExporting(false);
    }
  }, [isOpen]);
  
  const selectedFormat_obj = supportedFormats.find(f => f.id === selectedFormat);
  const recordCount = totalRecords || data.length;
  const isLargeExport = recordCount > 10000;
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            'bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {step === 'configure' && (
              <div className="space-y-6">
                {/* Export summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Export Summary</h3>
                  </div>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>Records to export: {recordCount.toLocaleString()}</p>
                    <p>Data source: {dataSource || 'Current selection'}</p>
                    {isLargeExport && (
                      <p className="flex items-center text-yellow-700">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Large export - this may take several minutes
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Format selection */}
                <FormatSelector
                  formats={supportedFormats}
                  selectedFormat={selectedFormat}
                  onFormatChange={handleFormatChange}
                  recordCount={recordCount}
                />
                
                {/* Field selection */}
                {enableFieldSelection && selectedFormat_obj?.supportsCustomFields && (
                  <FieldSelector
                    fields={availableFields}
                    selectedFields={selectedFields}
                    onFieldsChange={setSelectedFields}
                    hasPermission={(perm) => hasPermission(perm) || hasPermission(sensitiveDataPermission)}
                  />
                )}
                
                {/* Advanced options */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Options</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeHeaders ?? true}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          includeHeaders: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include headers</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.compression ?? false}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          compression: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Compress file</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {step === 'exporting' && currentProgress && (
              <ExportProgressDisplay
                progress={currentProgress}
                onCancel={() => {
                  setStep('configure');
                  setCurrentProgress(null);
                  setIsExporting(false);
                }}
              />
            )}
            
            {step === 'complete' && exportResult && (
              <div className="text-center space-y-4">
                {exportResult.success ? (
                  <>
                    <div className="flex justify-center">
                      <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Export Complete!</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Successfully exported {exportResult.recordCount?.toLocaleString()} records
                        {exportResult.fileSize && ` (${formatFileSize(exportResult.fileSize)})`}
                      </p>
                    </div>
                    
                    {exportResult.downloadUrl && (
                      <div className="space-y-3">
                        <a
                          href={exportResult.downloadUrl}
                          download={exportResult.fileName}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          ArrowDownTrayIcon File
                        </a>
                        
                        {enableSharing && (
                          <div className="flex justify-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Share className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Mail className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {exportResult.warnings && exportResult.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <h5 className="text-sm font-medium text-yellow-900 mb-2">Warnings:</h5>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          {exportResult.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <AlertCircle className="w-16 h-16 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Export Failed</h3>
                      <p className="text-sm text-red-600 mt-2">
                        {exportResult.error || 'An unknown error occurred'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              {user && `Exporting as ${user.display_name || user.email}`}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {step === 'complete' ? 'Close' : 'Cancel'}
              </button>
              
              {step === 'configure' && (
                <button
                  onClick={handleExport}
                  disabled={selectedFields.length === 0 || isExporting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Start Export
                </button>
              )}
              
              {step === 'complete' && exportResult?.success && (
                <button
                  onClick={() => {
                    setStep('configure');
                    setExportResult(null);
                    setCurrentProgress(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Export Again
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportDialog;