/**
 * Racine Collaboration Hook
 * =========================
 * 
 * Comprehensive React hook for collaboration functionality that provides
 * state management, API integration, and real-time updates for the master
 * collaboration system across all 7 data governance groups.
 * 
 * Features:
 * - Master collaboration hub management
 * - Real-time co-authoring and communication
 * - Cross-group workflow collaboration
 * - Team workspace management
 * - Document collaboration and sharing
 * - Expert consultation network
 * - Knowledge sharing platform
 * - Collaboration analytics and metrics
 * 
 * Backend Integration:
 * - Maps to: RacineCollaborationService
 * - Uses: collaboration-apis.ts
 * - Real-time: WebSocket events for live collaboration
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  collaborationAPI,
  CollaborationEventType,
  CollaborationEvent,
  CollaborationEventHandler
} from '../services/collaboration-apis';

import {
  CollaborationHubResponse,
  CollaborationSessionResponse,
  CreateCollaborationHubRequest,
  StartCollaborationSessionRequest,
  CollaborationMessage,
  CollaborationParticipant,
  CollaborationDocument,
  CollaborationWorkspace,
  ExpertConsultationRequest,
  KnowledgeShareRequest,
  CollaborationAnalyticsResponse,
  UUID,
  ISODateString,
  OperationStatus,
  PaginationRequest,
  FilterRequest
} from '../types/api.types';

import {
  CollaborationState,
  CollaborationConfiguration,
  CollaborationSession,
  CollaborationHub,
  TeamMember,
  DocumentCollaborationState,
  ExpertNetwork,
  KnowledgeBase
} from '../types/racine-core.types';

import { generateUUID } from "@/components/Advanced-Catalog/utils/helpers";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Collaboration hook state interface
 */
export interface CollaborationHookState {
  // Collaboration hubs
  collaborationHubs: CollaborationHubResponse[];
  currentHub: CollaborationHubResponse | null;
  
  // Active sessions
  activeSessions: Record<UUID, CollaborationSessionResponse>;
  currentSession: CollaborationSessionResponse | null;
  
  // Participants and teams
  participants: Record<UUID, CollaborationParticipant>;
  teamMembers: TeamMember[];
  onlineParticipants: Set<UUID>;
  
  // Documents and workspaces
  collaborativeDocuments: Record<UUID, CollaborationDocument>;
  sharedWorkspaces: CollaborationWorkspace[];
  
  // Communication
  messages: CollaborationMessage[];
  unreadMessages: number;
  
  // Expert network
  expertNetwork: ExpertNetwork;
  consultationRequests: ExpertConsultationRequest[];
  
  // Knowledge sharing
  knowledgeBase: KnowledgeBase;
  sharedKnowledge: KnowledgeShareRequest[];
  
  // Analytics
  collaborationAnalytics: CollaborationAnalyticsResponse | null;
  
  // Connection status
  isConnected: boolean;
  lastSync: ISODateString | null;
  websocketConnected: boolean;
}

/**
 * Collaboration hook operations interface
 */
export interface CollaborationHookOperations {
  // Hub management
  createHub: (request: CreateCollaborationHubRequest) => Promise<CollaborationHubResponse>;
  joinHub: (hubId: UUID) => Promise<void>;
  leaveHub: (hubId: UUID) => Promise<void>;
  switchHub: (hubId: UUID) => Promise<void>;
  
  // Session management
  startSession: (request: StartCollaborationSessionRequest) => Promise<CollaborationSessionResponse>;
  joinSession: (sessionId: UUID) => Promise<void>;
  leaveSession: (sessionId: UUID) => Promise<void>;
  endSession: (sessionId: UUID) => Promise<void>;
  
  // Communication
  sendMessage: (sessionId: UUID, message: string, type?: string) => Promise<void>;
  markMessagesRead: (messageIds: UUID[]) => Promise<void>;
  
  // Document collaboration
  openDocument: (documentId: UUID, mode: 'read' | 'write') => Promise<void>;
  saveDocument: (documentId: UUID, content: any) => Promise<void>;
  shareDocument: (documentId: UUID, participantIds: UUID[]) => Promise<void>;
  
  // Expert consultation
  requestExpertConsultation: (request: ExpertConsultationRequest) => Promise<void>;
  respondToConsultation: (consultationId: UUID, response: string) => Promise<void>;
  
  // Knowledge sharing
  shareKnowledge: (request: KnowledgeShareRequest) => Promise<void>;
  searchKnowledge: (query: string, filters?: FilterRequest) => Promise<any[]>;
  
  // Analytics
  getCollaborationAnalytics: (hubId?: UUID, timeRange?: string) => Promise<CollaborationAnalyticsResponse>;
  
  // Utilities
  refresh: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
}

/**
 * Collaboration hook configuration
 */
export interface CollaborationHookConfig {
  userId: UUID;
  autoConnect?: boolean;
  enableRealTime?: boolean;
  maxMessages?: number;
  refreshInterval?: number;
  retryAttempts?: number;
}

// =============================================================================
// MAIN HOOK IMPLEMENTATION
// =============================================================================

/**
 * Main collaboration hook
 */
export const useCollaboration = (config?: Partial<CollaborationHookConfig>): [CollaborationHookState, CollaborationHookOperations] => {
  const safeConfig = (config || {}) as Partial<CollaborationHookConfig>;
  const {
    userId,
    autoConnect = true,
    enableRealTime = true,
    maxMessages = 1000,
    refreshInterval = 30000,
    retryAttempts = 3
  } = safeConfig;

  // State management
  const [state, setState] = useState<CollaborationHookState>({
    collaborationHubs: [],
    currentHub: null,
    activeSessions: {},
    currentSession: null,
    participants: {},
    teamMembers: [],
    onlineParticipants: new Set(),
    collaborativeDocuments: {},
    sharedWorkspaces: [],
    messages: [],
    unreadMessages: 0,
    expertNetwork: {
      experts: [],
      specializations: [],
      availability: {},
      ratings: {}
    },
    consultationRequests: [],
    knowledgeBase: {
      articles: [],
      categories: [],
      tags: [],
      searchIndex: {}
    },
    sharedKnowledge: [],
    collaborationAnalytics: null,
    isConnected: false,
    lastSync: null,
    websocketConnected: false
  });

  // Refs for managing subscriptions and intervals
  const eventHandlersRef = useRef<Map<CollaborationEventType, CollaborationEventHandler>>(new Map());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleCollaborationEvent = useCallback((event: CollaborationEvent) => {
    setState(prevState => {
      const newState = { ...prevState };

      switch (event.type) {
        case CollaborationEventType.HUB_CREATED:
          newState.collaborationHubs.push(event.data as CollaborationHubResponse);
          break;

        case CollaborationEventType.SESSION_STARTED:
          const session = event.data as CollaborationSessionResponse;
          newState.activeSessions[session.id] = session;
          break;

        case CollaborationEventType.PARTICIPANT_JOINED:
          const participant = event.data as CollaborationParticipant;
          newState.participants[participant.id] = participant;
          newState.onlineParticipants.add(participant.id);
          break;

        case CollaborationEventType.PARTICIPANT_LEFT:
          const participantId = event.data.participantId as UUID;
          newState.onlineParticipants.delete(participantId);
          break;

        case CollaborationEventType.MESSAGE_RECEIVED:
          const message = event.data as CollaborationMessage;
          newState.messages.push(message);
          if (newState.messages.length > maxMessages) {
            newState.messages = newState.messages.slice(-maxMessages);
          }
          if (!message.read) {
            newState.unreadMessages++;
          }
          break;

        case CollaborationEventType.DOCUMENT_UPDATED:
          const document = event.data as CollaborationDocument;
          newState.collaborativeDocuments[document.id] = document;
          break;

        case CollaborationEventType.EXPERT_CONSULTATION_REQUESTED:
          const consultation = event.data as ExpertConsultationRequest;
          newState.consultationRequests.push(consultation);
          break;

        case CollaborationEventType.KNOWLEDGE_SHARED:
          const knowledge = event.data as KnowledgeShareRequest;
          newState.sharedKnowledge.push(knowledge);
          break;

        case CollaborationEventType.CONNECTION_STATUS_CHANGED:
          newState.websocketConnected = event.data.connected as boolean;
          break;

        default:
          console.warn('Unknown collaboration event type:', event.type);
      }

      newState.lastSync = new Date().toISOString();
      return newState;
    });
  }, [maxMessages]);

  // =============================================================================
  // API OPERATIONS
  // =============================================================================

  const createHub = useCallback(async (request: CreateCollaborationHubRequest): Promise<CollaborationHubResponse> => {
    try {
      const hub = await collaborationAPI.createCollaborationHub(request);
      setState(prevState => ({
        ...prevState,
        collaborationHubs: [...prevState.collaborationHubs, hub],
        lastSync: new Date().toISOString()
      }));
      return hub;
    } catch (error) {
      console.error('Failed to create collaboration hub:', error);
      throw error;
    }
  }, []);

  const joinHub = useCallback(async (hubId: UUID): Promise<void> => {
    try {
      await collaborationAPI.joinCollaborationHub(hubId);
      const hub = await collaborationAPI.getCollaborationHub(hubId);
      setState(prevState => ({
        ...prevState,
        currentHub: hub,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to join collaboration hub:', error);
      throw error;
    }
  }, []);

  const leaveHub = useCallback(async (hubId: UUID): Promise<void> => {
    try {
      await collaborationAPI.leaveCollaborationHub(hubId);
      setState(prevState => ({
        ...prevState,
        currentHub: prevState.currentHub?.id === hubId ? null : prevState.currentHub,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to leave collaboration hub:', error);
      throw error;
    }
  }, []);

  const switchHub = useCallback(async (hubId: UUID): Promise<void> => {
    try {
      const hub = await collaborationAPI.getCollaborationHub(hubId);
      setState(prevState => ({
        ...prevState,
        currentHub: hub,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to switch collaboration hub:', error);
      throw error;
    }
  }, []);

  const startSession = useCallback(async (request: StartCollaborationSessionRequest): Promise<CollaborationSessionResponse> => {
    try {
      const session = await collaborationAPI.startCollaborationSession(request);
      setState(prevState => ({
        ...prevState,
        activeSessions: {
          ...prevState.activeSessions,
          [session.id]: session
        },
        currentSession: session,
        lastSync: new Date().toISOString()
      }));
      return session;
    } catch (error) {
      console.error('Failed to start collaboration session:', error);
      throw error;
    }
  }, []);

  const joinSession = useCallback(async (sessionId: UUID): Promise<void> => {
    try {
      await collaborationAPI.joinCollaborationSession(sessionId);
      const session = await collaborationAPI.getCollaborationSession(sessionId);
      setState(prevState => ({
        ...prevState,
        activeSessions: {
          ...prevState.activeSessions,
          [sessionId]: session
        },
        currentSession: session,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to join collaboration session:', error);
      throw error;
    }
  }, []);

  const leaveSession = useCallback(async (sessionId: UUID): Promise<void> => {
    try {
      await collaborationAPI.leaveCollaborationSession(sessionId);
      setState(prevState => {
        const newActiveSessions = { ...prevState.activeSessions };
        delete newActiveSessions[sessionId];
        return {
          ...prevState,
          activeSessions: newActiveSessions,
          currentSession: prevState.currentSession?.id === sessionId ? null : prevState.currentSession,
          lastSync: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Failed to leave collaboration session:', error);
      throw error;
    }
  }, []);

  const endSession = useCallback(async (sessionId: UUID): Promise<void> => {
    try {
      await collaborationAPI.endCollaborationSession(sessionId);
      setState(prevState => {
        const newActiveSessions = { ...prevState.activeSessions };
        delete newActiveSessions[sessionId];
        return {
          ...prevState,
          activeSessions: newActiveSessions,
          currentSession: prevState.currentSession?.id === sessionId ? null : prevState.currentSession,
          lastSync: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Failed to end collaboration session:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (sessionId: UUID, message: string, type = 'text'): Promise<void> => {
    try {
      if (!userId) {
        console.warn('sendMessage called without userId; using anonymous sender');
      }
      await collaborationAPI.sendCollaborationMessage(sessionId, {
        content: message,
        type,
        senderId: userId || ("anonymous" as any),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send collaboration message:', error);
      throw error;
    }
  }, [userId]);

  const markMessagesRead = useCallback(async (messageIds: UUID[]): Promise<void> => {
    try {
      await collaborationAPI.markMessagesRead(messageIds);
      setState(prevState => ({
        ...prevState,
        messages: prevState.messages.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        ),
        unreadMessages: Math.max(0, prevState.unreadMessages - messageIds.length),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }, []);

  const openDocument = useCallback(async (documentId: UUID, mode: 'read' | 'write'): Promise<void> => {
    try {
      const document = await collaborationAPI.openCollaborativeDocument(documentId, mode);
      setState(prevState => ({
        ...prevState,
        collaborativeDocuments: {
          ...prevState.collaborativeDocuments,
          [documentId]: document
        },
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to open collaborative document:', error);
      throw error;
    }
  }, []);

  const saveDocument = useCallback(async (documentId: UUID, content: any): Promise<void> => {
    try {
      await collaborationAPI.saveCollaborativeDocument(documentId, content);
      setState(prevState => ({
        ...prevState,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save collaborative document:', error);
      throw error;
    }
  }, []);

  const shareDocument = useCallback(async (documentId: UUID, participantIds: UUID[]): Promise<void> => {
    try {
      await collaborationAPI.shareCollaborativeDocument(documentId, participantIds);
      setState(prevState => ({
        ...prevState,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to share collaborative document:', error);
      throw error;
    }
  }, []);

  const requestExpertConsultation = useCallback(async (request: ExpertConsultationRequest): Promise<void> => {
    try {
      await collaborationAPI.requestExpertConsultation(request);
      setState(prevState => ({
        ...prevState,
        consultationRequests: [...prevState.consultationRequests, request],
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to request expert consultation:', error);
      throw error;
    }
  }, []);

  const respondToConsultation = useCallback(async (consultationId: UUID, response: string): Promise<void> => {
    try {
      await collaborationAPI.respondToExpertConsultation(consultationId, response);
      setState(prevState => ({
        ...prevState,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to respond to expert consultation:', error);
      throw error;
    }
  }, []);

  const shareKnowledge = useCallback(async (request: KnowledgeShareRequest): Promise<void> => {
    try {
      await collaborationAPI.shareKnowledge(request);
      setState(prevState => ({
        ...prevState,
        sharedKnowledge: [...prevState.sharedKnowledge, request],
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to share knowledge:', error);
      throw error;
    }
  }, []);

  const searchKnowledge = useCallback(async (query: string, filters?: FilterRequest): Promise<any[]> => {
    try {
      return await collaborationAPI.searchKnowledge(query, filters);
    } catch (error) {
      console.error('Failed to search knowledge:', error);
      throw error;
    }
  }, []);

  const getCollaborationAnalytics = useCallback(async (hubId?: UUID, timeRange = '7d'): Promise<CollaborationAnalyticsResponse> => {
    try {
      const analytics = await collaborationAPI.getCollaborationAnalytics(hubId, timeRange);
      setState(prevState => ({
        ...prevState,
        collaborationAnalytics: analytics,
        lastSync: new Date().toISOString()
      }));
      return analytics;
    } catch (error) {
      console.error('Failed to get collaboration analytics:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // UTILITY OPERATIONS
  // =============================================================================

  const refresh = useCallback(async (): Promise<void> => {
    try {
      // Fetch all collaboration data
      const [hubs, sessions, participants, analytics] = await Promise.all([
        collaborationAPI.getCollaborationHubs(),
        collaborationAPI.getActiveCollaborationSessions(),
        collaborationAPI.getCollaborationParticipants(),
        state.currentHub ? collaborationAPI.getCollaborationAnalytics(state.currentHub.id) : Promise.resolve(null)
      ]);

      setState(prevState => ({
        ...prevState,
        collaborationHubs: hubs,
        activeSessions: sessions.reduce((acc, session) => {
          acc[session.id] = session;
          return acc;
        }, {} as Record<UUID, CollaborationSessionResponse>),
        participants: participants.reduce((acc, participant) => {
          acc[participant.id] = participant;
          return acc;
        }, {} as Record<UUID, CollaborationParticipant>),
        collaborationAnalytics: analytics,
        isConnected: true,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      // Handle errors gracefully instead of throwing
      console.warn('Failed to refresh collaboration data, using offline mode:', error);
      
      // Set offline state with default data
      setState(prevState => ({
        ...prevState,
        collaborationHubs: [],
        activeSessions: {},
        participants: {
          [generateUUID()]: {
            id: generateUUID(),
            username: 'offline-user',
            email: 'offline@example.com',
            role: 'participant',
            status: 'offline',
            lastSeen: new Date().toISOString(),
            avatar: null
          }
        },
        collaborationAnalytics: null,
        isConnected: false,
        lastSync: new Date().toISOString()
      }));
    }
  }, [state.currentHub]);

  const disconnect = useCallback((): void => {
    if (enableRealTime) {
      collaborationAPI.unsubscribeFromEvents();
    }
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setState(prevState => ({
      ...prevState,
      isConnected: false,
      websocketConnected: false
    }));
  }, [enableRealTime]);

  const reconnect = useCallback(async (): Promise<void> => {
    disconnect();
    
    if (autoConnect) {
      try {
        await refresh();
        
        if (enableRealTime) {
          collaborationAPI.subscribeToEvents(handleCollaborationEvent);
        }
        
        // Set up refresh interval
        refreshIntervalRef.current = setInterval(refresh, refreshInterval);
        
        setState(prevState => ({
          ...prevState,
          websocketConnected: enableRealTime
        }));
      } catch (error) {
        // Handle errors gracefully instead of throwing
        console.warn('Failed to reconnect, staying in offline mode:', error);
        
        // Set offline state
        setState(prevState => ({
          ...prevState,
          websocketConnected: false,
          isConnected: false
        }));
        
        // Retry with exponential backoff only if we have retry attempts left
        if (retryAttempts > 0) {
          retryTimeoutRef.current = setTimeout(() => {
            reconnect();
          }, Math.min(30000, 1000 * Math.pow(2, 3 - retryAttempts)));
        }
      }
    }
  }, [autoConnect, enableRealTime, refresh, refreshInterval, retryAttempts, handleCollaborationEvent, disconnect]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize collaboration connection
  useEffect(() => {
    if (autoConnect) {
      reconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, reconnect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // =============================================================================
  // MEMOIZED OPERATIONS
  // =============================================================================

  const operations = useMemo<CollaborationHookOperations>(() => ({
    createHub,
    joinHub,
    leaveHub,
    switchHub,
    startSession,
    joinSession,
    leaveSession,
    endSession,
    sendMessage,
    markMessagesRead,
    openDocument,
    saveDocument,
    shareDocument,
    requestExpertConsultation,
    respondToConsultation,
    shareKnowledge,
    searchKnowledge,
    getCollaborationAnalytics,
    refresh,
    disconnect,
    reconnect
  }), [
    createHub,
    joinHub,
    leaveHub,
    switchHub,
    startSession,
    joinSession,
    leaveSession,
    endSession,
    sendMessage,
    markMessagesRead,
    openDocument,
    saveDocument,
    shareDocument,
    requestExpertConsultation,
    respondToConsultation,
    shareKnowledge,
    searchKnowledge,
    getCollaborationAnalytics,
    refresh,
    disconnect,
    reconnect
  ]);

  return [state, operations];
};

export default useCollaboration;
