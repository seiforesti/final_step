// ============================================================================
// WORKSPACE COMPONENTS - INDEX EXPORTS
// ============================================================================
// Central export file for all workspace components
// Enables proper module resolution for app pages

export { default as WorkspaceOrchestrator } from './WorkspaceOrchestrator';
export { default as CrossGroupResourceLinker } from './CrossGroupResourceLinker';
export { default as WorkspaceTemplateEngine } from './WorkspaceTemplateEngine';
export { default as WorkspaceSecurityManager } from './WorkspaceSecurityManager';
export { default as WorkspaceAnalytics } from './WorkspaceAnalytics';
export { default as ProjectManager } from './ProjectManager';
export { default as CollaborativeWorkspaces } from './CollaborativeWorkspaces';

// Re-export types and utilities
export type { 
  Workspace, 
  WorkspaceTemplate, 
  Project,
  WorkspaceSecurity,
  ResourceLink
} from '../../types/racine-core.types';

