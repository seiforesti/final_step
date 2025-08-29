"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ScrollArea,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Switch,
  Slider,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { FileText, FolderOpen, Plus, Search, Filter, Download, Upload, Share, Edit, Eye, Lock, Unlock, Users, Clock, Calendar, Star, Bookmark, Tag, GitBranch, History, CheckCircle, AlertTriangle, X, MoreHorizontal, Copy, Trash2, Archive, Settings, Bell, BellOff, Pin, PinOff, Send, MessageSquare, ThumbsUp, ThumbsDown, Flag, ExternalLink, RefreshCw, Save, Undo, Redo, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Image, Code, Quote, Heading1, Heading2, Heading3, Type, Palette, Layers, Grid, Layout, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Play, Pause, Square, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Monitor, Smartphone, Tablet, Laptop, MousePointer, Hand, Grab, Move, CornerDownRight, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { usePipelineManager } from '../../hooks/usePipelineManager';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { 
  CollaborationSpace, 
  CollaborationParticipant, 
  CollaborationMessage, 
  CollaborationSession,
  FileAttachment,
  DocumentCollaborationState,
  DocumentVersion,
  DocumentComment,
  DocumentApproval,
  DocumentTemplate,
  DocumentPermission,
  DocumentMetadata,
  DocumentStatus,
  DocumentType,
  ApprovalStatus,
  CommentStatus,
  VersionStatus,
  AccessLevel,
  SharePermission,
  DocumentActivity,
  DocumentAnalytics,
  ReviewWorkflow,
  DocumentTag,
  DocumentFolder,
  DocumentSearch,
  CollaborativeDocument
} from '../../types/racine-core.types';

// Enhanced Document Types
interface DocumentManagerState {
  documents: CollaborativeDocument[];
  folders: DocumentFolder[];
  selectedDocument: CollaborativeDocument | null;
  selectedFolder: DocumentFolder | null;
  documentVersions: { [documentId: string]: DocumentVersion[] };
  documentComments: { [documentId: string]: DocumentComment[] };
  documentApprovals: { [documentId: string]: DocumentApproval[] };
  templates: DocumentTemplate[];
  recentDocuments: CollaborativeDocument[];
  sharedWithMe: CollaborativeDocument[];
  starredDocuments: CollaborativeDocument[];
  trashedDocuments: CollaborativeDocument[];
  documentAnalytics: DocumentAnalytics;
  searchResults: DocumentSearch[];
  activeCollaborators: { [documentId: string]: CollaborationParticipant[] };
  documentSettings: DocumentSettings;
  isLoading: boolean;
  error: string | null;
}

interface DocumentSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  trackChanges: boolean;
  showComments: boolean;
  showSuggestions: boolean;
  enableRealTimeCollaboration: boolean;
  defaultSharePermission: SharePermission;
  versioningEnabled: boolean;
  maxVersions: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupEnabled: boolean;
  backupInterval: number;
}

interface DocumentEditor {
  content: string;
  selection: { start: number; end: number };
  cursor: { line: number; column: number };
  formatting: DocumentFormatting;
  isEditing: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  collaborativeCursors: { [userId: string]: DocumentCursor };
  activeSelections: { [userId: string]: DocumentSelection };
}

interface DocumentFormatting {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

interface DocumentCursor {
  userId: string;
  userName: string;
  position: { line: number; column: number };
  color: string;
  timestamp: Date;
}

interface DocumentSelection {
  userId: string;
  userName: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  color: string;
  timestamp: Date;
}

interface DocumentPreview {
  documentId: string;
  thumbnailUrl: string;
  previewUrl: string;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  readingTime: number;
  lastModified: Date;
  fileSize: number;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const documentVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

export const DocumentCollaborationManager: React.FC = () => {
  // Hooks
  const {
    collaborationHubs,
    activeSessions,
    participants,
    onlineParticipants,
    collaborativeDocuments,
    openDocument,
    saveDocument,
    shareDocument,
    getCollaborationAnalytics,
    isConnected,
    refresh
  } = useCollaboration();

  const {
    orchestrationState,
    crossGroupActions,
    executeOrchestration
  } = useRacineOrchestration();

  const {
    integrationStatus,
    executeIntegration
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    teamMembers
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceMembers
  } = useWorkspaceManagement();

  const {
    trackActivity,
    getActivityAnalytics
  } = useActivityTracker();

  const {
    workflows,
    executeWorkflow
  } = useJobWorkflow();

  const {
    pipelines,
    executePipeline
  } = usePipelineManager();

  const {
    aiInsights,
    getRecommendations,
    analyzeContent,
    generateSummary
  } = useAIAssistant();

  // State Management
  const [documentState, setDocumentState] = useState<DocumentManagerState>({
    documents: [],
    folders: [],
    selectedDocument: null,
    selectedFolder: null,
    documentVersions: {},
    documentComments: {},
    documentApprovals: {},
    templates: [],
    recentDocuments: [],
    sharedWithMe: [],
    starredDocuments: [],
    trashedDocuments: [],
    documentAnalytics: {
      totalDocuments: 0,
      totalCollaborators: 0,
      totalVersions: 0,
      totalComments: 0,
      storageUsed: 0,
      collaborationScore: 0,
      activityTrends: [],
      popularDocuments: [],
      recentActivity: []
    },
    searchResults: [],
    activeCollaborators: {},
    documentSettings: {
      autoSave: true,
      autoSaveInterval: 30000,
      trackChanges: true,
      showComments: true,
      showSuggestions: true,
      enableRealTimeCollaboration: true,
      defaultSharePermission: SharePermission.VIEW,
      versioningEnabled: true,
      maxVersions: 50,
      compressionEnabled: true,
      encryptionEnabled: true,
      backupEnabled: true,
      backupInterval: 3600000
    },
    isLoading: false,
    error: null
  });

  const [documentEditor, setDocumentEditor] = useState<DocumentEditor>({
    content: '',
    selection: { start: 0, end: 0 },
    cursor: { line: 1, column: 1 },
    formatting: {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontSize: 14,
      fontFamily: 'Inter',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      alignment: 'left',
      lineHeight: 1.5,
      letterSpacing: 0,
      textTransform: 'none'
    },
    isEditing: false,
    isDirty: false,
    lastSaved: null,
    collaborativeCursors: {},
    activeSelections: {}
  });

  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    documentType: 'all',
    status: 'all',
    dateRange: 'all',
    collaborators: 'all',
    tags: []
  });
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showApprovals, setShowApprovals] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effects
  useEffect(() => {
    initializeDocumentManager();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (documentState.selectedDocument) {
      loadDocumentDetails(documentState.selectedDocument.id);
      setupAutoSave();
    }
  }, [documentState.selectedDocument]);

  useEffect(() => {
    if (documentEditor.isDirty && documentState.documentSettings.autoSave) {
      scheduleAutoSave();
    }
  }, [documentEditor.content, documentState.documentSettings.autoSave]);

  // Initialization
  const initializeDocumentManager = async () => {
    try {
      setDocumentState(prev => ({ ...prev, isLoading: true }));
      
      await Promise.all([
        loadDocuments(),
        loadFolders(),
        loadTemplates(),
        loadDocumentAnalytics()
      ]);

      // Track activity
      trackActivity({
        type: 'document_manager_initialized',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          component: 'DocumentCollaborationManager',
          workspace: activeWorkspace?.id
        }
      });

      setDocumentState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to initialize document manager:', error);
      setDocumentState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to initialize document manager' 
      }));
    }
  };

  const cleanup = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };

  // Document Management
  const loadDocuments = async () => {
    try {
      const documents = await generateMockDocuments();
      
      setDocumentState(prev => ({
        ...prev,
        documents,
        recentDocuments: documents.slice(0, 10),
        sharedWithMe: documents.filter(doc => doc.sharedBy && doc.sharedBy !== currentUser?.id),
        starredDocuments: documents.filter(doc => doc.isStarred),
        trashedDocuments: documents.filter(doc => doc.status === DocumentStatus.DELETED)
      }));
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const folders = await generateMockFolders();
      setDocumentState(prev => ({ ...prev, folders }));
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const templates = await generateMockTemplates();
      setDocumentState(prev => ({ ...prev, templates }));
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadDocumentAnalytics = async () => {
    try {
      const analytics = await getCollaborationAnalytics({
        timeRange: 'last_30_days',
        includeDocuments: true,
        includeCollaborators: true,
        includeVersions: true
      });

      setDocumentState(prev => ({
        ...prev,
        documentAnalytics: {
          totalDocuments: analytics.totalDocuments || 0,
          totalCollaborators: analytics.totalCollaborators || 0,
          totalVersions: analytics.totalVersions || 0,
          totalComments: analytics.totalComments || 0,
          storageUsed: analytics.storageUsed || 0,
          collaborationScore: analytics.collaborationScore || 0,
          activityTrends: analytics.activityTrends || [],
          popularDocuments: analytics.popularDocuments || [],
          recentActivity: analytics.recentActivity || []
        }
      }));
    } catch (error) {
      console.error('Failed to load document analytics:', error);
    }
  };

  const loadDocumentDetails = async (documentId: string) => {
    try {
      const [versions, comments, approvals, collaborators] = await Promise.all([
        loadDocumentVersions(documentId),
        loadDocumentComments(documentId),
        loadDocumentApprovals(documentId),
        loadActiveCollaborators(documentId)
      ]);

      setDocumentState(prev => ({
        ...prev,
        documentVersions: { ...prev.documentVersions, [documentId]: versions },
        documentComments: { ...prev.documentComments, [documentId]: comments },
        documentApprovals: { ...prev.documentApprovals, [documentId]: approvals },
        activeCollaborators: { ...prev.activeCollaborators, [documentId]: collaborators }
      }));
    } catch (error) {
      console.error('Failed to load document details:', error);
    }
  };

  // Document Operations
  const createDocument = async (documentData: Partial<CollaborativeDocument>) => {
    try {
      const newDocument: CollaborativeDocument = {
        id: `doc-${Date.now()}`,
        name: documentData.name || 'Untitled Document',
        type: documentData.type || DocumentType.TEXT,
        content: documentData.content || '',
        ownerId: currentUser?.id || '',
        ownerName: currentUser?.name || '',
        folderId: documentData.folderId,
        status: DocumentStatus.DRAFT,
        permissions: documentData.permissions || {
          owner: currentUser?.id || '',
          collaborators: [],
          viewers: [],
          commenters: [],
          accessLevel: AccessLevel.PRIVATE,
          allowDownload: true,
          allowPrint: true,
          allowCopy: true,
          expirationDate: undefined
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          size: 0,
          wordCount: 0,
          pageCount: 1,
          language: 'en',
          tags: documentData.metadata?.tags || [],
          description: documentData.metadata?.description || '',
          category: documentData.metadata?.category || 'General',
          priority: documentData.metadata?.priority || 'normal',
          customFields: {}
        },
        collaboration: {
          isShared: false,
          sharedBy: undefined,
          sharedAt: undefined,
          lastEditedBy: currentUser?.id || '',
          lastEditedAt: new Date(),
          activeCollaborators: [],
          totalCollaborators: 1,
          commentCount: 0,
          versionCount: 1,
          approvalStatus: ApprovalStatus.PENDING
        },
        isStarred: false,
        isBookmarked: false,
        isPinned: false,
        isTemplate: false,
        templateId: documentData.templateId,
        parentId: documentData.parentId,
        workspaceId: activeWorkspace?.id || '',
        integrationData: {}
      };

      setDocumentState(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument],
        selectedDocument: newDocument
      }));

      // Track activity
      trackActivity({
        type: 'document_created',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          documentId: newDocument.id,
          documentName: newDocument.name,
          documentType: newDocument.type
        }
      });

      return newDocument;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
    }
  };

  const selectDocument = async (document: CollaborativeDocument) => {
    try {
      setDocumentState(prev => ({ ...prev, selectedDocument: document }));
      
      // Open document for collaboration
      await openDocument(document.id, {
        mode: 'edit',
        trackChanges: documentState.documentSettings.trackChanges,
        enableComments: documentState.documentSettings.showComments
      });

      // Load document content into editor
      setDocumentEditor(prev => ({
        ...prev,
        content: document.content,
        isEditing: true,
        isDirty: false,
        lastSaved: document.metadata.updatedAt
      }));

      // Track activity
      trackActivity({
        type: 'document_opened',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          documentId: document.id,
          documentName: document.name
        }
      });
    } catch (error) {
      console.error('Failed to select document:', error);
    }
  };

  const saveDocumentChanges = async () => {
    if (!documentState.selectedDocument || !documentEditor.isDirty) return;

    try {
      const updatedDocument = {
        ...documentState.selectedDocument,
        content: documentEditor.content,
        metadata: {
          ...documentState.selectedDocument.metadata,
          updatedAt: new Date(),
          wordCount: documentEditor.content.split(/\s+/).length,
          size: new Blob([documentEditor.content]).size
        },
        collaboration: {
          ...documentState.selectedDocument.collaboration,
          lastEditedBy: currentUser?.id || '',
          lastEditedAt: new Date()
        }
      };

      await saveDocument(documentState.selectedDocument.id, {
        content: documentEditor.content,
        metadata: updatedDocument.metadata
      });

      setDocumentState(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === documentState.selectedDocument?.id ? updatedDocument : doc
        ),
        selectedDocument: updatedDocument
      }));

      setDocumentEditor(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date()
      }));

      // Track activity
      trackActivity({
        type: 'document_saved',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          documentId: updatedDocument.id,
          wordCount: updatedDocument.metadata.wordCount
        }
      });
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const shareDocumentWithCollaborators = async (
    documentId: string, 
    collaborators: string[], 
    permission: SharePermission
  ) => {
    try {
      await shareDocument(documentId, {
        collaboratorIds: collaborators,
        permission,
        message: 'Shared via Document Collaboration Manager',
        expirationDate: undefined
      });

      const document = documentState.documents.find(doc => doc.id === documentId);
      if (document) {
        const updatedDocument = {
          ...document,
          collaboration: {
            ...document.collaboration,
            isShared: true,
            sharedBy: currentUser?.id || '',
            sharedAt: new Date(),
            totalCollaborators: document.collaboration.totalCollaborators + collaborators.length
          }
        };

        setDocumentState(prev => ({
          ...prev,
          documents: prev.documents.map(doc =>
            doc.id === documentId ? updatedDocument : doc
          )
        }));
      }

      // Track activity
      trackActivity({
        type: 'document_shared',
        userId: currentUser?.id || '',
        timestamp: new Date(),
        metadata: {
          documentId,
          collaboratorCount: collaborators.length,
          permission
        }
      });
    } catch (error) {
      console.error('Failed to share document:', error);
      throw error;
    }
  };

  // Auto-save functionality
  const setupAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };

  const scheduleAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (documentEditor.isDirty) {
        saveDocumentChanges();
      }
    }, documentState.documentSettings.autoSaveInterval);
  };

  // Document Editor Functions
  const handleContentChange = (content: string) => {
    setDocumentEditor(prev => ({
      ...prev,
      content,
      isDirty: true
    }));
  };

  const applyFormatting = (formatType: keyof DocumentFormatting, value: any) => {
    setDocumentEditor(prev => ({
      ...prev,
      formatting: {
        ...prev.formatting,
        [formatType]: value
      }
    }));
  };

  // Search and Filter Functions
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setDocumentState(prev => ({ ...prev, searchResults: [] }));
      return;
    }

    try {
      const results = await performDocumentSearch(query);
      setDocumentState(prev => ({ ...prev, searchResults: results }));
    } catch (error) {
      console.error('Failed to search documents:', error);
    }
  };

  const performDocumentSearch = async (query: string): Promise<DocumentSearch[]> => {
    const searchTerms = query.toLowerCase().split(' ');
    const results: DocumentSearch[] = [];

    documentState.documents.forEach(document => {
      const name = document.name.toLowerCase();
      const content = document.content.toLowerCase();
      const tags = document.metadata.tags.join(' ').toLowerCase();
      
      const matchScore = searchTerms.reduce((score, term) => {
        let termScore = 0;
        if (name.includes(term)) termScore += 3;
        if (content.includes(term)) termScore += 2;
        if (tags.includes(term)) termScore += 1;
        return score + termScore;
      }, 0);

      if (matchScore > 0) {
        results.push({
          documentId: document.id,
          document,
          matchScore,
          highlights: searchTerms.filter(term => 
            name.includes(term) || content.includes(term) || tags.includes(term)
          ),
          context: content.substring(0, 200) + '...'
        });
      }
    });

    return results.sort((a, b) => b.matchScore - a.matchScore);
  };

  // Mock Data Generation
  const generateMockDocuments = async (): Promise<CollaborativeDocument[]> => {
    const mockDocuments: CollaborativeDocument[] = [];
    const documentTypes = [DocumentType.TEXT, DocumentType.SPREADSHEET, DocumentType.PRESENTATION, DocumentType.PDF];
    const statuses = [DocumentStatus.DRAFT, DocumentStatus.REVIEW, DocumentStatus.APPROVED, DocumentStatus.PUBLISHED];

    for (let i = 0; i < 50; i++) {
      mockDocuments.push({
        id: `doc-${i}`,
        name: `Document ${i + 1}`,
        type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
        content: `Content for document ${i + 1}...`,
        ownerId: currentUser?.id || '',
        ownerName: currentUser?.name || '',
        folderId: i < 10 ? `folder-${Math.floor(i / 5)}` : undefined,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        permissions: {
          owner: currentUser?.id || '',
          collaborators: [],
          viewers: [],
          commenters: [],
          accessLevel: AccessLevel.WORKSPACE,
          allowDownload: true,
          allowPrint: true,
          allowCopy: true,
          expirationDate: undefined
        },
        metadata: {
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          version: '1.0.0',
          size: Math.floor(Math.random() * 1000000),
          wordCount: Math.floor(Math.random() * 10000),
          pageCount: Math.floor(Math.random() * 50) + 1,
          language: 'en',
          tags: [`tag-${Math.floor(Math.random() * 10)}`, `category-${Math.floor(Math.random() * 5)}`],
          description: `Description for document ${i + 1}`,
          category: 'General',
          priority: 'normal',
          customFields: {}
        },
        collaboration: {
          isShared: Math.random() > 0.5,
          sharedBy: Math.random() > 0.5 ? currentUser?.id : undefined,
          sharedAt: Math.random() > 0.5 ? new Date() : undefined,
          lastEditedBy: currentUser?.id || '',
          lastEditedAt: new Date(),
          activeCollaborators: [],
          totalCollaborators: Math.floor(Math.random() * 10) + 1,
          commentCount: Math.floor(Math.random() * 20),
          versionCount: Math.floor(Math.random() * 5) + 1,
          approvalStatus: ApprovalStatus.PENDING
        },
        isStarred: Math.random() > 0.8,
        isBookmarked: Math.random() > 0.9,
        isPinned: Math.random() > 0.95,
        isTemplate: Math.random() > 0.9,
        templateId: undefined,
        parentId: undefined,
        workspaceId: activeWorkspace?.id || '',
        integrationData: {}
      });
    }

    return mockDocuments;
  };

  const generateMockFolders = async (): Promise<DocumentFolder[]> => {
    return [
      {
        id: 'folder-0',
        name: 'Project Documents',
        description: 'Documents related to current projects',
        parentId: undefined,
        ownerId: currentUser?.id || '',
        permissions: {
          owner: currentUser?.id || '',
          collaborators: [],
          viewers: [],
          accessLevel: AccessLevel.WORKSPACE
        },
        documentCount: 10,
        subfolderCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['project', 'work'],
        color: '#3b82f6'
      },
      {
        id: 'folder-1',
        name: 'Templates',
        description: 'Document templates for common use cases',
        parentId: undefined,
        ownerId: currentUser?.id || '',
        permissions: {
          owner: currentUser?.id || '',
          collaborators: [],
          viewers: [],
          accessLevel: AccessLevel.WORKSPACE
        },
        documentCount: 5,
        subfolderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['template', 'reference'],
        color: '#10b981'
      }
    ];
  };

  const generateMockTemplates = async (): Promise<DocumentTemplate[]> => {
    return [
      {
        id: 'template-1',
        name: 'Project Proposal',
        description: 'Standard template for project proposals',
        type: DocumentType.TEXT,
        content: 'Project proposal template content...',
        category: 'Business',
        tags: ['proposal', 'project'],
        createdBy: currentUser?.id || '',
        createdAt: new Date(),
        usageCount: 25,
        isPublic: true,
        previewUrl: '/templates/project-proposal-preview.png'
      },
      {
        id: 'template-2',
        name: 'Meeting Minutes',
        description: 'Template for recording meeting minutes',
        type: DocumentType.TEXT,
        content: 'Meeting minutes template content...',
        category: 'Meetings',
        tags: ['meeting', 'minutes'],
        createdBy: currentUser?.id || '',
        createdAt: new Date(),
        usageCount: 40,
        isPublic: true,
        previewUrl: '/templates/meeting-minutes-preview.png'
      }
    ];
  };

  const loadDocumentVersions = async (documentId: string): Promise<DocumentVersion[]> => {
    return [
      {
        id: `version-${documentId}-1`,
        documentId,
        version: '1.0.0',
        content: 'Initial version content...',
        createdBy: currentUser?.id || '',
        createdByName: currentUser?.name || '',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        changes: 'Initial version',
        status: VersionStatus.PUBLISHED,
        size: 1024,
        checksum: 'abc123',
        isCurrent: false
      },
      {
        id: `version-${documentId}-2`,
        documentId,
        version: '1.1.0',
        content: 'Updated version content...',
        createdBy: currentUser?.id || '',
        createdByName: currentUser?.name || '',
        createdAt: new Date(),
        changes: 'Added new sections and updated formatting',
        status: VersionStatus.PUBLISHED,
        size: 1536,
        checksum: 'def456',
        isCurrent: true
      }
    ];
  };

  const loadDocumentComments = async (documentId: string): Promise<DocumentComment[]> => {
    return [
      {
        id: `comment-${documentId}-1`,
        documentId,
        content: 'This section needs more detail.',
        authorId: teamMembers?.[0]?.id || '',
        authorName: teamMembers?.[0]?.name || 'Collaborator',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: CommentStatus.ACTIVE,
        position: { line: 5, column: 10 },
        selection: 'selected text',
        parentId: undefined,
        replies: [],
        reactions: [],
        isResolved: false,
        resolvedBy: undefined,
        resolvedAt: undefined
      }
    ];
  };

  const loadDocumentApprovals = async (documentId: string): Promise<DocumentApproval[]> => {
    return [
      {
        id: `approval-${documentId}-1`,
        documentId,
        requestedBy: currentUser?.id || '',
        requestedByName: currentUser?.name || '',
        requestedAt: new Date(),
        approvers: [
          {
            userId: teamMembers?.[0]?.id || '',
            userName: teamMembers?.[0]?.name || 'Approver',
            status: ApprovalStatus.PENDING,
            approvedAt: undefined,
            comments: ''
          }
        ],
        status: ApprovalStatus.PENDING,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'normal',
        approvalType: 'content',
        requirements: ['Review content', 'Check formatting'],
        completedAt: undefined
      }
    ];
  };

  const loadActiveCollaborators = async (documentId: string): Promise<CollaborationParticipant[]> => {
    return onlineParticipants.slice(0, 3);
  };

  // Utility Functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.TEXT: return FileText;
      case DocumentType.SPREADSHEET: return Grid;
      case DocumentType.PRESENTATION: return Layout;
      case DocumentType.PDF: return FileText;
      case DocumentType.IMAGE: return Image;
      case DocumentType.VIDEO: return Play;
      case DocumentType.AUDIO: return Volume2;
      default: return FileText;
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.DRAFT: return 'bg-gray-500';
      case DocumentStatus.REVIEW: return 'bg-yellow-500';
      case DocumentStatus.APPROVED: return 'bg-green-500';
      case DocumentStatus.PUBLISHED: return 'bg-blue-500';
      case DocumentStatus.ARCHIVED: return 'bg-purple-500';
      case DocumentStatus.DELETED: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Render Functions
  const renderDocumentGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documentState.documents
        .filter(doc => {
          if (searchQuery) {
            return doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   doc.content.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return true;
        })
        .map((document) => {
          const Icon = getDocumentIcon(document.type);
          
          return (
            <motion.div
              key={document.id}
              variants={documentVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="group"
            >
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-300 border-2 hover:shadow-lg",
                  documentState.selectedDocument?.id === document.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => selectDocument(document)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(document.status))}>
                        {document.status}
                      </Badge>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => selectDocument(document)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          ArrowDownTrayIcon
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          {document.isStarred ? 'Unstar' : 'Star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <CardTitle className="text-lg truncate">{document.name}</CardTitle>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(document.metadata.size)}</span>
                    <span>{document.metadata.wordCount} words</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {document.metadata.description || document.content.substring(0, 100) + '...'}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {document.metadata.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {document.metadata.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{document.metadata.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`/avatars/${document.ownerId}.jpg`} />
                        <AvatarFallback className="text-xs">
                          {document.ownerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {document.ownerName}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {document.isStarred && <Star className="h-3 w-3 text-yellow-500" />}
                      {document.isPinned && <Pin className="h-3 w-3 text-primary" />}
                      {document.collaboration.isShared && <Users className="h-3 w-3 text-blue-500" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(document.metadata.updatedAt)}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      {document.collaboration.commentCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span className="text-xs">{document.collaboration.commentCount}</span>
                        </div>
                      )}
                      {document.collaboration.totalCollaborators > 1 && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{document.collaboration.totalCollaborators}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
    </div>
  );

  const renderDocumentEditor = () => {
    if (!documentState.selectedDocument) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Document</h3>
            <p className="text-muted-foreground mb-4">
              Choose a document to start editing or create a new one
            </p>
            <Button onClick={() => createDocument({})}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Document
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Input
                value={documentState.selectedDocument.name}
                className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                onChange={(e) => {
                  if (documentState.selectedDocument) {
                    const updatedDocument = {
                      ...documentState.selectedDocument,
                      name: e.target.value
                    };
                    setDocumentState(prev => ({
                      ...prev,
                      selectedDocument: updatedDocument,
                      documents: prev.documents.map(doc =>
                        doc.id === updatedDocument.id ? updatedDocument : doc
                      )
                    }));
                  }
                }}
              />
              <Badge variant="outline" className={getStatusColor(documentState.selectedDocument.status)}>
                {documentState.selectedDocument.status}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                {documentEditor.isDirty ? (
                  <span className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                    <span>Unsaved changes</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Saved {documentEditor.lastSaved ? formatDate(documentEditor.lastSaved) : ''}</span>
                  </span>
                )}
              </div>
              
              <Button variant="outline" size="sm" onClick={saveDocumentChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowVersionHistory(true)}>
                    <History className="h-4 w-4 mr-2" />
                    Version History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDocumentPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Document Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-1 p-2 bg-muted/50 rounded-lg">
            <Button
              variant={documentEditor.formatting.bold ? "default" : "ghost"}
              size="sm"
              onClick={() => applyFormatting('bold', !documentEditor.formatting.bold)}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={documentEditor.formatting.italic ? "default" : "ghost"}
              size="sm"
              onClick={() => applyFormatting('italic', !documentEditor.formatting.italic)}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={documentEditor.formatting.underline ? "default" : "ghost"}
              size="sm"
              onClick={() => applyFormatting('underline', !documentEditor.formatting.underline)}
            >
              <Underline className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-2" />
            
            <Button
              variant={documentEditor.formatting.alignment === 'left' ? "default" : "ghost"}
              size="sm"
              onClick={() => applyFormatting('alignment', 'left')}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={documentEditor.formatting.alignment === 'center' ? "default" : "ghost"}
              size="sm"
              onClick={() => applyFormatting('alignment', 'center')}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={documentEditor.formatting.alignment === 'right' ? "default" : "ghost"}
              size="sm"
              onClick={() => applyFormatting('alignment', 'right')}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-2" />
            
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Image className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-2" />
            
            <Select
              value={documentEditor.formatting.fontSize.toString()}
              onValueChange={(value) => applyFormatting('fontSize', parseInt(value))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
                <SelectItem value="20">20px</SelectItem>
                <SelectItem value="24">24px</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={documentEditor.formatting.fontFamily}
              onValueChange={(value) => applyFormatting('fontFamily', value)}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Editor Content */}
        <div className="flex-1 p-4">
          <Textarea
            ref={editorRef}
            value={documentEditor.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your document..."
            className="w-full h-full resize-none border-none focus-visible:ring-0 text-base leading-relaxed"
            style={{
              fontSize: `${documentEditor.formatting.fontSize}px`,
              fontFamily: documentEditor.formatting.fontFamily,
              fontWeight: documentEditor.formatting.bold ? 'bold' : 'normal',
              fontStyle: documentEditor.formatting.italic ? 'italic' : 'normal',
              textDecoration: documentEditor.formatting.underline ? 'underline' : 'none',
              textAlign: documentEditor.formatting.alignment,
              color: documentEditor.formatting.textColor,
              backgroundColor: documentEditor.formatting.backgroundColor,
              lineHeight: documentEditor.formatting.lineHeight,
              letterSpacing: `${documentEditor.formatting.letterSpacing}px`
            }}
          />
        </div>
        
        {/* Editor Footer */}
        <div className="border-t p-2 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Words: {documentEditor.content.split(/\s+/).filter(word => word.length > 0).length}</span>
            <span>Characters: {documentEditor.content.length}</span>
            <span>Line: {documentEditor.cursor.line}, Column: {documentEditor.cursor.column}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {documentState.activeCollaborators[documentState.selectedDocument.id]?.map((collaborator, index) => (
              <Avatar key={collaborator.id} className="h-6 w-6">
                <AvatarImage src={`/avatars/${collaborator.id}.jpg`} />
                <AvatarFallback className="text-xs">
                  {collaborator.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20"
      >
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Document Collaboration Manager</h1>
                <p className="text-muted-foreground">
                  Advanced document management and real-time collaboration
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={() => createDocument({})}>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
              
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Options
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Documents</p>
                    <p className="text-2xl font-bold">{documentState.documentAnalytics.totalDocuments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Collaborators</p>
                    <p className="text-2xl font-bold">{documentState.documentAnalytics.totalCollaborators}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Versions</p>
                    <p className="text-2xl font-bold">{documentState.documentAnalytics.totalVersions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Comments</p>
                    <p className="text-2xl font-bold">{documentState.documentAnalytics.totalComments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center space-x-2">
                    <Grid className="h-4 w-4" />
                    <span>Grid</span>
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center space-x-2">
                    <List className="h-4 w-4" />
                    <span>List</span>
                  </div>
                </SelectItem>
                <SelectItem value="timeline">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Timeline</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Documents Panel */}
            <ResizablePanel defaultSize={documentState.selectedDocument ? 30 : 100} minSize={25}>
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="font-semibold mb-2">Documents</h2>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="recent">Recent</TabsTrigger>
                      <TabsTrigger value="shared">Shared</TabsTrigger>
                      <TabsTrigger value="starred">Starred</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {documentState.isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    renderDocumentGrid()
                  )}
                </ScrollArea>
              </div>
            </ResizablePanel>
            
            {documentState.selectedDocument && (
              <>
                <ResizableHandle />
                
                {/* Editor Panel */}
                <ResizablePanel defaultSize={50} minSize={40}>
                  {renderDocumentEditor()}
                </ResizablePanel>
                
                <ResizableHandle />
                
                {/* Comments/Collaboration Panel */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <div className="h-full flex flex-col border-l">
                    <div className="p-4 border-b">
                      <Tabs defaultValue="comments" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="comments">Comments</TabsTrigger>
                          <TabsTrigger value="versions">Versions</TabsTrigger>
                          <TabsTrigger value="collaborators">Team</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="comments" className="mt-4">
                          <div className="space-y-3">
                            {documentState.documentComments[documentState.selectedDocument.id]?.map((comment) => (
                              <div key={comment.id} className="p-3 border rounded-lg">
                                <div className="flex items-start space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {comment.authorName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium">{comment.authorName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm">{comment.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <div className="flex space-x-2">
                              <Input placeholder="Add a comment..." className="flex-1" />
                              <Button size="sm">
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="versions" className="mt-4">
                          <div className="space-y-2">
                            {documentState.documentVersions[documentState.selectedDocument.id]?.map((version) => (
                              <div key={version.id} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">v{version.version}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(version.createdAt)}
                                    </p>
                                  </div>
                                  <Badge variant={version.isCurrent ? "default" : "secondary"}>
                                    {version.isCurrent ? "Current" : "Historical"}
                                  </Badge>
                                </div>
                                <p className="text-sm mt-2">{version.changes}</p>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="collaborators" className="mt-4">
                          <div className="space-y-2">
                            {documentState.activeCollaborators[documentState.selectedDocument.id]?.map((collaborator) => (
                              <div key={collaborator.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={`/avatars/${collaborator.id}.jpg`} />
                                  <AvatarFallback className="text-xs">
                                    {collaborator.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{collaborator.name}</p>
                                  <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                                </div>
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.doc,.docx,.pdf,.md"
          className="hidden"
          onChange={(e) => {
            // Handle file upload
            const files = Array.from(e.target.files || []);
            files.forEach(file => {
              // Create document from file
              const reader = new FileReader();
              reader.onload = (event) => {
                createDocument({
                  name: file.name,
                  content: event.target?.result as string,
                  type: DocumentType.TEXT
                });
              };
              reader.readAsText(file);
            });
          }}
        />
      </motion.div>
    </TooltipProvider>
  );
};
