// ============================================================================
// COLLABORATION COMPONENTS - INDEX EXPORTS
// ============================================================================
// Central export file for all collaboration components
// Enables proper module resolution for app pages

export { MasterCollaborationHub } from './MasterCollaborationHub';
export { TeamCommunicationCenter } from './TeamCommunicationCenter';
export { RealTimeCoAuthoringEngine } from './RealTimeCoAuthoringEngine';
export { KnowledgeSharingPlatform } from './KnowledgeSharingPlatform';
export { ExternalCollaboratorManager } from './ExternalCollaboratorManager';
export { ExpertConsultationNetwork } from './ExpertConsultationNetwork';
export { DocumentCollaborationManager } from './DocumentCollaborationManager';
export { CrossGroupWorkflowCollaboration } from './CrossGroupWorkflowCollaboration';
export { CollaborationAnalytics } from './CollaborationAnalytics';

// Re-export types and utilities
export type { 
  CollaborationSession, 
  CollaborationWorkspace, 
  CollaborationInvitation,
  TeamMember,
  DocumentVersion
} from '../../types/racine-core.types';
