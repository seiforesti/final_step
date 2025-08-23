/**
 * Layout Group - Index Exports
 * ============================
 * 
 * Central export file for all layout management components in the racine main manager.
 * These components provide enterprise-grade layout orchestration that surpasses
 * Databricks, Azure, and Microsoft Purview in flexibility and intelligence.
 */

// Core Layout Components
export { default as MasterLayoutOrchestrator, OptimizedMasterLayoutOrchestrator } from './MasterLayoutOrchestrator';
export { default as LayoutContent } from './LayoutContent';
export { default as DynamicWorkspaceManager } from './DynamicWorkspaceManager';
export { default as ResponsiveLayoutEngine } from './ResponsiveLayoutEngine';
export { default as ContextualOverlayManager } from './ContextualOverlayManager';
export { default as TabManager } from './TabManager';
export { default as SplitScreenManager } from './SplitScreenManager';
export { default as LayoutPersonalization } from './LayoutPersonalization';

// Layout Subcomponents (Quick Actions Integration)
export { default as QuickLayoutSwitch } from './subcomponents/QuickLayoutSwitch';
export { default as QuickWorkspaceActions } from './subcomponents/QuickWorkspaceActions';
export { default as QuickSPANavigator } from './subcomponents/QuickSPANavigator';

// Type Exports
export type {
  MasterLayoutOrchestratorProps
} from './MasterLayoutOrchestrator';

export type {
  LayoutContentProps,
  LayoutContentState,
  ViewConfiguration,
  LayoutPosition,
  LayoutSize
} from './LayoutContent';

export type {
  DynamicWorkspaceManagerProps,
  WorkspaceManagerState,
  WorkspaceLayoutTemplate,
  LayoutGridCell
} from './DynamicWorkspaceManager';

export type {
  ResponsiveLayoutEngineProps,
  ResponsiveState,
  BreakpointConfiguration,
  DeviceAdaptation
} from './ResponsiveLayoutEngine';

export type {
  ContextualOverlayManagerProps,
  OverlayState,
  OverlayConfiguration,
  ModalContext
} from './ContextualOverlayManager';

export type {
  TabManagerProps,
  TabManagerState,
  TabConfiguration,
  TabGroup
} from './TabManager';

export type {
  SplitScreenManagerProps,
  SplitScreenState,
  PaneConfiguration,
  SplitLayout
} from './SplitScreenManager';

export type {
  LayoutPersonalizationProps,
  PersonalizationState,
  UserLayoutPreferences,
  LayoutAdaptation
} from './LayoutPersonalization';

export type {
  QuickLayoutSwitchProps
} from './subcomponents/QuickLayoutSwitch';

export type {
  QuickWorkspaceActionsProps
} from './subcomponents/QuickWorkspaceActions';

export type {
  QuickSPANavigatorProps
} from './subcomponents/QuickSPANavigator';