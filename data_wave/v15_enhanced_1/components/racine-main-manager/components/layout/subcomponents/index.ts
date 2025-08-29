/**
 * Layout Subcomponents Index - Quick Actions Integration
 * =====================================================
 *
 * Centralized exports for all layout subcomponents designed for
 * integration with the Global Quick Actions Sidebar system.
 *
 * These components provide quick access to layout management
 * functionality without requiring full navigation to the main
 * layout management interfaces.
 */

// Quick Action Components
export { default as QuickLayoutSwitch } from './QuickLayoutSwitch';
export { default as QuickWorkspaceActions } from './QuickWorkspaceActions';
export { default as QuickSPANavigator } from './QuickSPANavigator';

// Component Types
export type { QuickLayoutSwitchProps } from './QuickLayoutSwitch';
export type { QuickWorkspaceActionsProps } from './QuickWorkspaceActions';
export type { QuickSPANavigatorProps } from './QuickSPANavigator';

// Re-export utility types for quick actions
export type {
  LayoutMode,
  WorkspaceContext,
  SPAContext,
  UserContext
} from '../../../types/racine-core.types';
