/**
 * Component Index
 * 
 * Central export point for all components in the application.
 * This file provides a clean import interface for components.
 */

// Common Components
export * from './common/LoadingSpinner';
export * from './common/ErrorBoundary';
export * from './common/ConfirmDialog';
export * from './common/Toast';
export * from './common/Modal';
export * from './common/Tooltip';
export * from './common/Badge';
export * from './common/Avatar';

// Layout Components
export * from './layout/AppLayout';
export * from './layout/Sidebar';
export * from './layout/Header';
export * from './layout/Footer';
export * from './layout/Breadcrumbs';
export * from './layout/PageHeader';

// Form Components
export * from './forms/FormField';
export * from './forms/FormBuilder';
export * from './forms/SearchBar';
export * from './forms/FilterPanel';
export * from './forms/FileUpload';
export * from './forms/DatePicker';
export * from './forms/MultiSelect';

// Table Components
export * from './tables/DataTable';
export * from './tables/DataGrid';
export * from './tables/TablePagination';
export * from './tables/TableFilters';
export * from './tables/TableActions';

// Chart Components
export * from './charts/LineChart';
export * from './charts/BarChart';
export * from './charts/PieChart';
export * from './charts/AreaChart';
export * from './charts/ScatterChart';
export * from './charts/MetricCard';
export * from './charts/Dashboard';

// Data Catalog Components
export * from './catalog/DataSourceCard';
export * from './catalog/DataAssetViewer';
export * from './catalog/SchemaViewer';
export * from './catalog/LineageGraph';
export * from './catalog/MetadataEditor';
export * from './catalog/TagManager';

// Governance Components
export * from './governance/PolicyEditor';
export * from './governance/ComplianceStatus';
export * from './governance/ClassificationLabels';
export * from './governance/SensitivityIndicator';
export * from './governance/RetentionPolicy';

// Analytics Components
export * from './analytics/MetricsDashboard';
export * from './analytics/UsageAnalytics';
export * from './analytics/QualityMetrics';
export * from './analytics/TrendAnalysis';
export * from './analytics/ReportBuilder';

// Workflow Components
export * from './workflow/WorkflowBuilder';
export * from './workflow/TaskList';
export * from './workflow/ApprovalQueue';
export * from './workflow/ProcessStatus';

// Admin Components
export * from './admin/UserManagement';
export * from './admin/RoleManagement';
export * from './admin/SystemSettings';
export * from './admin/AuditLog';

// UI Components (re-export from ui folder)
export * from './ui';