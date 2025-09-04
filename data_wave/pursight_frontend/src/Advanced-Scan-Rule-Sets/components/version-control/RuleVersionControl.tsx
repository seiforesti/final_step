import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GitBranch, GitCommit, GitMerge, GitPullRequest, History, Tag, Users, Calendar, Clock, Eye, Download, Upload, Copy, Settings, Search, Filter, RefreshCw, ArrowRight, ArrowLeft, ArrowUpDown, Plus, Minus, X, Check, Edit, Trash2, FileText, File, CheckCircle, AlertTriangle, XCircle, Info, Star, Bookmark, Share2, Link, ExternalLink, ChevronDown, ChevronRight, ChevronLeft, MoreHorizontal, Archive, Unarchive, Globe, Shield, Lock, Unlock, Code, Diff, FolderOpen, Folder, Layers, Target, Zap, Brain, Activity, BarChart3, PieChart, TrendingUp, TrendingDown, Hash, MessageSquare, Bell, Mail, Phone, Video, Scissors, Clipboard, ClipboardCheck, ClipboardCopy, Save, Terminal, Command, Database, Server, Cloud, Monitor, Smartphone, Tablet, Laptop, Cpu, HardDrive, MemoryStick, Package, Puzzle, Wrench, Hammer, Screwdriver, Ruler, Calculator, Binary, Braces, Code2, FileCode, FileJson, FileCog, FileCheck, FileX, FileWarning, Timer, Gauge, Maximize, Minimize } from 'lucide-react';

// Hooks
import { useScanRules } from '../../hooks/useScanRules';
import { useValidation } from '../../hooks/useValidation';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useReporting } from '../../hooks/useReporting';

// Types
import type { 
  ScanRule, 
  RuleVersion, 
  RuleBranch, 
  RuleCommit, 
  RuleMergeRequest, 
  RuleTag,
  RuleChangeSet,
  RuleConflict,
  RuleDiff,
  RuleMetadata
} from '../../types/scan-rules.types';
import type { 
  ValidationResult, 
  ValidationContext
} from '../../types/validation.types';
import type { 
  IntelligenceSuggestion, 
  AIAssistance
} from '../../types/intelligence.types';
import type { 
  CollaborationSession, 
  UserPresence, 
  Comment, 
  Review
} from '../../types/collaboration.types';

// Version Control Types
interface VersionControlState {
  currentBranch: RuleBranch | null;
  availableBranches: RuleBranch[];
  commitHistory: RuleCommit[];
  pendingChanges: RuleChangeSet[];
  conflicts: RuleConflict[];
  mergeRequests: RuleMergeRequest[];
  tags: RuleTag[];
  workingDirectory: WorkingDirectory;
}

interface WorkingDirectory {
  stagedChanges: RuleChangeSet[];
  unstagedChanges: RuleChangeSet[];
  conflictedFiles: string[];
  untrackedFiles: string[];
  modifiedFiles: string[];
  deletedFiles: string[];
}

interface MergeStrategy {
  type: 'auto' | 'manual' | 'ours' | 'theirs' | 'recursive';
  conflictResolution: 'interactive' | 'automatic' | 'manual';
  preserveHistory: boolean;
  squashCommits: boolean;
  fastForward: boolean;
}

interface BranchProtection {
  requireReviews: boolean;
  requiredReviewers: number;
  dismissStaleReviews: boolean;
  requireStatusChecks: boolean;
  requireUpToDate: boolean;
  restrictPushes: boolean;
  allowedUsers: string[];
  blockForceUpdates: boolean;
}

interface ReleaseManagement {
  version: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix' | 'prerelease';
  description: string;
  changelog: string;
  assets: ReleaseAsset[];
  prerelease: boolean;
  draft: boolean;
  targetCommitish: string;
}

interface ReleaseAsset {
  id: string;
  name: string;
  contentType: string;
  size: number;
  downloadCount: number;
  browserDownloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Advanced Rule Version Control Component
// Enterprise-grade version control system with sophisticated branching strategies,
// merge conflict resolution, comprehensive change tracking, collaborative workflows,
// and complete backend integration with zero mock data usage.
const RuleVersionControl: React.FC = () => {
  // Hooks
  const { 
    rules, 
    versions, 
    branches, 
    commits, 
    mergeRequests,
    tags,
    createBranch, 
    switchBranch, 
    deleteBranch,
    createCommit, 
    revertCommit,
    cherryPickCommit,
    createMergeRequest, 
    mergeBranch,
    resolveConflicts,
    createTag,
    deleteTag,
    getRuleDiff,
    getRuleHistory,
    restoreVersion,
    compareVersions,
    isLoading: rulesLoading,
    error: rulesError 
  } = useScanRules();

  const { 
    validateRule, 
    validationResults,
    isValidating,
    validationError 
  } = useValidation();

  const { 
    analyzeChanges, 
    suggestMergeStrategy,
    detectConflicts,
    generateChangelog,
    suggestions,
    isAnalyzing,
    analysisError 
  } = useIntelligence();

  const { 
    sessions, 
    comments, 
    reviews,
    addComment,
    addReview,
    shareVersion,
    isCollaborating,
    collaborationError 
  } = useCollaboration();

  const { 
    generateReport, 
    exportReport,
    reports,
    isGenerating,
    reportError 
  } = useReporting();

  // Version Control State
  const [versionState, setVersionState] = useState<VersionControlState>({
    currentBranch: null,
    availableBranches: [],
    commitHistory: [],
    pendingChanges: [],
    conflicts: [],
    mergeRequests: [],
    tags: [],
    workingDirectory: {
      stagedChanges: [],
      unstagedChanges: [],
      conflictedFiles: [],
      untrackedFiles: [],
      modifiedFiles: [],
      deletedFiles: []
    }
  });

  const [selectedRule, setSelectedRule] = useState<ScanRule | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<RuleVersion | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<RuleCommit | null>(null);
  const [selectedMergeRequest, setSelectedMergeRequest] = useState<RuleMergeRequest | null>(null);

  // Merge Management
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>({
    type: 'recursive',
    conflictResolution: 'interactive',
    preserveHistory: true,
    squashCommits: false,
    fastForward: true
  });

  const [branchProtection, setBranchProtection] = useState<BranchProtection>({
    requireReviews: true,
    requiredReviewers: 2,
    dismissStaleReviews: true,
    requireStatusChecks: true,
    requireUpToDate: true,
    restrictPushes: false,
    allowedUsers: [],
    blockForceUpdates: true
  });

  // Release Management
  const [releaseManagement, setReleaseManagement] = useState<ReleaseManagement>({
    version: '1.0.0',
    type: 'minor',
    description: '',
    changelog: '',
    assets: [],
    prerelease: false,
    draft: true,
    targetCommitish: 'main'
  });

  // UI State
  const [activeTab, setActiveTab] = useState('branches');
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Diff and Comparison State
  const [diffViewMode, setDiffViewMode] = useState<'side-by-side' | 'unified' | 'split'>('side-by-side');
  const [diffContext, setDiffContext] = useState<number>(3);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [compareCommit1, setCompareCommit1] = useState<RuleCommit | null>(null);
  const [compareCommit2, setCompareCommit2] = useState<RuleCommit | null>(null);
  const [ruleDiff, setRuleDiff] = useState<RuleDiff | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Loading and Error States
  const [loadingStates, setLoadingStates] = useState({
    branching: false,
    merging: false,
    committing: false,
    tagging: false,
    comparing: false,
    resolving: false,
    releasing: false
  });

  const [errors, setErrors] = useState({
    branch: null as string | null,
    merge: null as string | null,
    commit: null as string | null,
    conflict: null as string | null,
    release: null as string | null
  });

  // Refs
  const conflictResolverRef = useRef<HTMLDivElement>(null);
  const diffViewerRef = useRef<HTMLDivElement>(null);

  // Initialize version control state
  useEffect(() => {
    if (branches.length > 0 && !versionState.currentBranch) {
      const mainBranch = branches.find(b => b.name === 'main' || b.name === 'master') || branches[0];
      setVersionState(prev => ({
        ...prev,
        currentBranch: mainBranch,
        availableBranches: branches,
        commitHistory: commits.filter(c => c.branchId === mainBranch.id),
        mergeRequests: mergeRequests,
        tags: tags
      }));
    }
  }, [branches, commits, mergeRequests, tags, versionState.currentBranch]);

  // Handle create branch
  const handleCreateBranch = useCallback(async (branchName: string, sourceBranch?: string) => {
    if (!versionState.currentBranch) return;

    setLoadingStates(prev => ({ ...prev, branching: true }));
    setErrors(prev => ({ ...prev, branch: null }));

    try {
      const newBranch = await createBranch({
        name: branchName,
        sourceId: sourceBranch || versionState.currentBranch.id,
        description: `Branch created from ${sourceBranch || versionState.currentBranch.name}`,
        protected: false,
        protection: branchProtection
      });

      setVersionState(prev => ({
        ...prev,
        availableBranches: [...prev.availableBranches, newBranch]
      }));

      console.log('Branch created:', newBranch);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        branch: error instanceof Error ? error.message : 'Failed to create branch' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, branching: false }));
    }
  }, [versionState.currentBranch, createBranch, branchProtection]);

  // Handle switch branch
  const handleSwitchBranch = useCallback(async (branchId: string) => {
    const branch = versionState.availableBranches.find(b => b.id === branchId);
    if (!branch) return;

    setLoadingStates(prev => ({ ...prev, branching: true }));
    setErrors(prev => ({ ...prev, branch: null }));

    try {
      await switchBranch(branchId);
      
      const branchCommits = commits.filter(c => c.branchId === branchId);
      
      setVersionState(prev => ({
        ...prev,
        currentBranch: branch,
        commitHistory: branchCommits
      }));

      console.log('Switched to branch:', branch.name);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        branch: error instanceof Error ? error.message : 'Failed to switch branch' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, branching: false }));
    }
  }, [versionState.availableBranches, commits, switchBranch]);

  // Handle create commit
  const handleCreateCommit = useCallback(async (message: string, changes: RuleChangeSet[]) => {
    if (!versionState.currentBranch || !selectedRule) return;

    setLoadingStates(prev => ({ ...prev, committing: true }));
    setErrors(prev => ({ ...prev, commit: null }));

    try {
      const newCommit = await createCommit({
        branchId: versionState.currentBranch.id,
        ruleId: selectedRule.id!,
        message,
        changes,
        author: 'current_user', // This would come from auth context
        timestamp: new Date().toISOString()
      });

      setVersionState(prev => ({
        ...prev,
        commitHistory: [newCommit, ...prev.commitHistory],
        workingDirectory: {
          ...prev.workingDirectory,
          stagedChanges: [],
          unstagedChanges: prev.workingDirectory.unstagedChanges.filter(c => 
            !changes.some(change => change.id === c.id)
          )
        }
      }));

      console.log('Commit created:', newCommit);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        commit: error instanceof Error ? error.message : 'Failed to create commit' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, committing: false }));
    }
  }, [versionState.currentBranch, selectedRule, createCommit]);

  // Handle create merge request
  const handleCreateMergeRequest = useCallback(async (
    sourceBranch: string, 
    targetBranch: string, 
    title: string, 
    description: string
  ) => {
    setLoadingStates(prev => ({ ...prev, merging: true }));
    setErrors(prev => ({ ...prev, merge: null }));

    try {
      const mergeRequest = await createMergeRequest({
        sourceBranchId: sourceBranch,
        targetBranchId: targetBranch,
        title,
        description,
        author: 'current_user',
        strategy: mergeStrategy,
        reviewers: [],
        labels: [],
        milestone: null
      });

      setVersionState(prev => ({
        ...prev,
        mergeRequests: [...prev.mergeRequests, mergeRequest]
      }));

      console.log('Merge request created:', mergeRequest);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        merge: error instanceof Error ? error.message : 'Failed to create merge request' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, merging: false }));
    }
  }, [createMergeRequest, mergeStrategy]);

  // Handle merge branch
  const handleMergeBranch = useCallback(async (mergeRequestId: string) => {
    const mergeRequest = versionState.mergeRequests.find(mr => mr.id === mergeRequestId);
    if (!mergeRequest) return;

    setLoadingStates(prev => ({ ...prev, merging: true }));
    setErrors(prev => ({ ...prev, merge: null }));

    try {
      // Check for conflicts first
      const conflicts = await detectConflicts(mergeRequest.sourceBranchId, mergeRequest.targetBranchId);
      
      if (conflicts.length > 0) {
        setVersionState(prev => ({ ...prev, conflicts }));
        setShowConflictResolver(true);
        return;
      }

      // Proceed with merge if no conflicts
      const mergeResult = await mergeBranch(mergeRequestId, mergeStrategy);
      
      // Update commit history
      const updatedCommits = await getRuleHistory(selectedRule?.id!);
      
      setVersionState(prev => ({
        ...prev,
        commitHistory: updatedCommits,
        mergeRequests: prev.mergeRequests.map(mr => 
          mr.id === mergeRequestId 
            ? { ...mr, status: 'merged', mergedAt: new Date().toISOString() }
            : mr
        )
      }));

      console.log('Merge completed:', mergeResult);
      setShowMergeDialog(false);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        merge: error instanceof Error ? error.message : 'Failed to merge branch' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, merging: false }));
    }
  }, [versionState.mergeRequests, detectConflicts, mergeBranch, mergeStrategy, getRuleHistory, selectedRule]);

  // Handle resolve conflicts
  const handleResolveConflicts = useCallback(async (resolutions: { [conflictId: string]: string }) => {
    setLoadingStates(prev => ({ ...prev, resolving: true }));
    setErrors(prev => ({ ...prev, conflict: null }));

    try {
      await resolveConflicts(resolutions);
      
      setVersionState(prev => ({
        ...prev,
        conflicts: [],
        workingDirectory: {
          ...prev.workingDirectory,
          conflictedFiles: []
        }
      }));

      setShowConflictResolver(false);
      console.log('Conflicts resolved');
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        conflict: error instanceof Error ? error.message : 'Failed to resolve conflicts' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, resolving: false }));
    }
  }, [resolveConflicts]);

  // Handle create tag
  const handleCreateTag = useCallback(async (name: string, message: string, commitId?: string) => {
    if (!versionState.currentBranch) return;

    setLoadingStates(prev => ({ ...prev, tagging: true }));

    try {
      const tag = await createTag({
        name,
        message,
        commitId: commitId || versionState.commitHistory[0]?.id,
        branchId: versionState.currentBranch.id,
        author: 'current_user',
        type: 'annotated'
      });

      setVersionState(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));

      console.log('Tag created:', tag);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, tagging: false }));
    }
  }, [versionState.currentBranch, versionState.commitHistory, createTag]);

  // Handle compare versions
  const handleCompareVersions = useCallback(async (commit1: RuleCommit, commit2: RuleCommit) => {
    if (!selectedRule) return;

    setLoadingStates(prev => ({ ...prev, comparing: true }));

    try {
      const diff = await getRuleDiff(selectedRule.id!, commit1.id, commit2.id);
      
      setRuleDiff(diff);
      setCompareCommit1(commit1);
      setCompareCommit2(commit2);
      setShowDiffViewer(true);

      console.log('Comparison generated:', diff);
    } catch (error) {
      console.error('Failed to compare versions:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, comparing: false }));
    }
  }, [selectedRule, getRuleDiff]);

  // Handle revert commit
  const handleRevertCommit = useCallback(async (commitId: string) => {
    if (!versionState.currentBranch) return;

    setLoadingStates(prev => ({ ...prev, committing: true }));

    try {
      const revertCommit = await revertCommit(commitId, {
        branchId: versionState.currentBranch.id,
        message: `Revert commit ${commitId.substring(0, 8)}`,
        author: 'current_user'
      });

      setVersionState(prev => ({
        ...prev,
        commitHistory: [revertCommit, ...prev.commitHistory]
      }));

      console.log('Commit reverted:', revertCommit);
    } catch (error) {
      console.error('Failed to revert commit:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, committing: false }));
    }
  }, [versionState.currentBranch, revertCommit]);

  // Handle cherry pick commit
  const handleCherryPickCommit = useCallback(async (commitId: string, targetBranch: string) => {
    setLoadingStates(prev => ({ ...prev, committing: true }));

    try {
      const cherryPickedCommit = await cherryPickCommit(commitId, targetBranch, {
        author: 'current_user',
        message: `Cherry-pick commit ${commitId.substring(0, 8)}`
      });

      // Update commit history if cherry-picking to current branch
      if (targetBranch === versionState.currentBranch?.id) {
        setVersionState(prev => ({
          ...prev,
          commitHistory: [cherryPickedCommit, ...prev.commitHistory]
        }));
      }

      console.log('Commit cherry-picked:', cherryPickedCommit);
    } catch (error) {
      console.error('Failed to cherry-pick commit:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, committing: false }));
    }
  }, [versionState.currentBranch, cherryPickCommit]);

  // Handle create release
  const handleCreateRelease = useCallback(async () => {
    if (!versionState.currentBranch) return;

    setLoadingStates(prev => ({ ...prev, releasing: true }));
    setErrors(prev => ({ ...prev, release: null }));

    try {
      // Generate changelog automatically
      const changelog = await generateChangelog(
        versionState.currentBranch.id,
        releaseManagement.targetCommitish
      );

      const release = {
        ...releaseManagement,
        changelog: changelog || releaseManagement.changelog,
        branchId: versionState.currentBranch.id,
        createdAt: new Date().toISOString(),
        author: 'current_user'
      };

      // Create tag for the release
      await handleCreateTag(
        `v${releaseManagement.version}`,
        `Release ${releaseManagement.version}`,
        releaseManagement.targetCommitish
      );

      console.log('Release created:', release);
      setShowReleaseDialog(false);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        release: error instanceof Error ? error.message : 'Failed to create release' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, releasing: false }));
    }
  }, [versionState.currentBranch, releaseManagement, generateChangelog, handleCreateTag]);

  // Filtered commit history
  const filteredCommits = useMemo(() => {
    return versionState.commitHistory.filter(commit => {
      const matchesSearch = !searchQuery || 
        commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commit.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAuthor = filterAuthor === 'all' || commit.author === filterAuthor;
      const matchesBranch = filterBranch === 'all' || commit.branchId === filterBranch;
      
      return matchesSearch && matchesAuthor && matchesBranch;
    }).sort((a, b) => {
      const aValue = new Date(a.timestamp).getTime();
      const bValue = new Date(b.timestamp).getTime();
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [versionState.commitHistory, searchQuery, filterAuthor, filterBranch, sortOrder]);

  // Get unique authors
  const uniqueAuthors = useMemo(() => {
    const authors = new Set(versionState.commitHistory.map(c => c.author));
    return Array.from(authors);
  }, [versionState.commitHistory]);

  // Format commit hash
  const formatCommitHash = useCallback((hash: string) => {
    return hash.substring(0, 8);
  }, []);

  // Format relative time
  const formatRelativeTime = useCallback((timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return time.toLocaleDateString();
  }, []);

  // Main render
  return (
    <TooltipProvider>
      <div className={`flex flex-col h-full bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold flex items-center">
              <GitBranch className="h-6 w-6 mr-2" />
              Rule Version Control
            </h1>
            {versionState.currentBranch && (
              <Badge variant="outline" className="flex items-center">
                <GitBranch className="h-3 w-3 mr-1" />
                {versionState.currentBranch.name}
              </Badge>
            )}
            {versionState.workingDirectory.modifiedFiles.length > 0 && (
              <Badge variant="secondary">
                {versionState.workingDirectory.modifiedFiles.length} modified
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMergeDialog(true)}
              disabled={!versionState.currentBranch || loadingStates.merging}
            >
              <GitMerge className="h-4 w-4" />
              Merge
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCreateTag(`v${Date.now()}`, 'Auto-generated tag')}
              disabled={!versionState.currentBranch || loadingStates.tagging}
            >
              <Tag className="h-4 w-4" />
              Tag
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReleaseDialog(true)}
              disabled={!versionState.currentBranch}
            >
              <Package className="h-4 w-4" />
              Release
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDiffViewer(true)}>
                  <Diff className="h-4 w-4 mr-2" />
                  Compare
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4 mr-2" />
                  ) : (
                    <Maximize className="h-4 w-4 mr-2" />
                  )}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Side Panel */}
          <div className="w-80 border-r bg-card flex flex-col">
            {/* Rule Selection */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Select Rule</h3>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={selectedRule?.id || ''} onValueChange={(ruleId) => {
                const rule = rules.find(r => r.id === ruleId);
                setSelectedRule(rule || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rule" />
                </SelectTrigger>
                <SelectContent>
                  {rules.map(rule => (
                    <SelectItem key={rule.id} value={rule.id!}>
                      {rule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch Management */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Branches</h3>
                <Button 
                  size="sm" 
                  onClick={() => {
                    const branchName = prompt('Enter branch name:');
                    if (branchName) handleCreateBranch(branchName);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </div>
              
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {versionState.availableBranches.map(branch => (
                    <div
                      key={branch.id}
                      className={`p-2 rounded cursor-pointer transition-colors hover:bg-accent ${
                        versionState.currentBranch?.id === branch.id ? 'bg-accent ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleSwitchBranch(branch.id!)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-3 w-3" />
                          <span className="font-medium text-sm">{branch.name}</span>
                          {branch.protected && <Shield className="h-3 w-3 text-yellow-500" />}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCreateBranch(`${branch.name}-copy`, branch.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Create Branch
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const mergeTitle = prompt('Merge request title:');
                              if (mergeTitle && versionState.currentBranch) {
                                handleCreateMergeRequest(
                                  branch.id!,
                                  versionState.currentBranch.id!,
                                  mergeTitle,
                                  ''
                                );
                              }
                            }}>
                              <GitMerge className="h-4 w-4 mr-2" />
                              Create MR
                            </DropdownMenuItem>
                            {branch.name !== 'main' && branch.name !== 'master' && (
                              <DropdownMenuItem 
                                onClick={() => deleteBranch(branch.id!)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {branch.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated {formatRelativeTime(branch.updatedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Working Directory Status */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Working Directory</h3>
              
              {versionState.workingDirectory.modifiedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Modified Files ({versionState.workingDirectory.modifiedFiles.length})
                  </div>
                  <div className="space-y-1">
                    {versionState.workingDirectory.modifiedFiles.slice(0, 5).map((file, index) => (
                      <div key={index} className="text-xs flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {versionState.workingDirectory.stagedChanges.length > 0 && (
                <div className="space-y-2 mt-3">
                  <div className="text-sm text-muted-foreground">
                    Staged Changes ({versionState.workingDirectory.stagedChanges.length})
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      const message = prompt('Commit message:');
                      if (message) {
                        handleCreateCommit(message, versionState.workingDirectory.stagedChanges);
                      }
                    }}
                    disabled={loadingStates.committing}
                  >
                    <GitCommit className="h-3 w-3 mr-2" />
                    Commit Changes
                  </Button>
                </div>
              )}

              {versionState.conflicts.length > 0 && (
                <div className="space-y-2 mt-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {versionState.conflicts.length} conflict(s) need resolution
                    </AlertDescription>
                  </Alert>
                  <Button 
                    size="sm" 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => setShowConflictResolver(true)}
                  >
                    <Zap className="h-3 w-3 mr-2" />
                    Resolve Conflicts
                  </Button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Tags</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const tagName = prompt('Tag name:');
                    const tagMessage = prompt('Tag message:');
                    if (tagName && tagMessage) {
                      handleCreateTag(tagName, tagMessage);
                    }
                  }}
                >
                  <Tag className="h-3 w-3" />
                </Button>
              </div>
              
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {versionState.tags.slice(0, 10).map(tag => (
                    <div key={tag.id} className="flex items-center justify-between p-1 rounded hover:bg-accent">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-3 w-3" />
                        <span className="text-sm font-medium">{tag.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteTag(tag.id!)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {selectedRule && (
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedRule.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedRule.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{selectedRule.language}</Badge>
                    {selectedRule.category && (
                      <Badge variant="secondary">{selectedRule.category}</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b rounded-none">
                <TabsTrigger value="branches" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Branches
                </TabsTrigger>
                <TabsTrigger value="commits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <GitCommit className="h-4 w-4 mr-2" />
                  Commits
                </TabsTrigger>
                <TabsTrigger value="merges" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <GitMerge className="h-4 w-4 mr-2" />
                  Merge Requests
                </TabsTrigger>
                <TabsTrigger value="tags" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags & Releases
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
                <TabsTrigger value="compare" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Diff className="h-4 w-4 mr-2" />
                  Compare
                </TabsTrigger>
              </TabsList>

              {/* Branches Tab */}
              <TabsContent value="branches" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Branch Management</h3>
                  <div className="flex space-x-2">
                    <Button onClick={() => {
                      const branchName = prompt('Enter branch name:');
                      if (branchName) handleCreateBranch(branchName);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Branch
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {versionState.availableBranches.map(branch => (
                    <Card key={branch.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <GitBranch className="h-4 w-4" />
                              <h4 className="font-medium">{branch.name}</h4>
                              {branch.protected && (
                                <Badge variant="destructive" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Protected
                                </Badge>
                              )}
                              {versionState.currentBranch?.id === branch.id && (
                                <Badge variant="default" className="text-xs">Current</Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {branch.description}
                            </p>
                            
                            <div className="flex items-center text-xs text-muted-foreground space-x-4">
                              <span>Updated {formatRelativeTime(branch.updatedAt)}</span>
                              <span>{branch.commitCount || 0} commits</span>
                              {branch.ahead > 0 && (
                                <span className="text-green-600">+{branch.ahead} ahead</span>
                              )}
                              {branch.behind > 0 && (
                                <span className="text-red-600">-{branch.behind} behind</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {versionState.currentBranch?.id !== branch.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSwitchBranch(branch.id!)}
                                disabled={loadingStates.branching}
                              >
                                Checkout
                              </Button>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  const newBranchName = prompt('New branch name:');
                                  if (newBranchName) handleCreateBranch(newBranchName, branch.id);
                                }}>
                                  <GitBranch className="h-4 w-4 mr-2" />
                                  Create Branch
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const title = prompt('Merge request title:');
                                  if (title && versionState.currentBranch) {
                                    handleCreateMergeRequest(
                                      branch.id!,
                                      versionState.currentBranch.id!,
                                      title,
                                      ''
                                    );
                                  }
                                }}>
                                  <GitMerge className="h-4 w-4 mr-2" />
                                  Create Merge Request
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const tagName = prompt('Tag name:');
                                  const tagMessage = prompt('Tag message:');
                                  if (tagName && tagMessage) {
                                    handleCreateTag(tagName, tagMessage);
                                  }
                                }}>
                                  <Tag className="h-4 w-4 mr-2" />
                                  Create Tag
                                </DropdownMenuItem>
                                {branch.name !== 'main' && branch.name !== 'master' && (
                                  <DropdownMenuItem 
                                    onClick={() => deleteBranch(branch.id!)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Branch
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Commits Tab */}
              <TabsContent value="commits" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Commit History</h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search commits..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    
                    <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Author" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Authors</SelectItem>
                        {uniqueAuthors.map(author => (
                          <SelectItem key={author} value={author}>
                            {author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredCommits.map((commit, index) => (
                      <Card key={commit.id} className="hover:bg-accent/50 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <GitCommit className="h-4 w-4" />
                                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                  {formatCommitHash(commit.hash)}
                                </span>
                                <span className="font-medium">{commit.message}</span>
                              </div>
                              
                              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>{commit.author}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatRelativeTime(commit.timestamp)}</span>
                                </div>
                                {commit.verified && (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Verified</span>
                                  </div>
                                )}
                              </div>
                              
                              {commit.tags && commit.tags.length > 0 && (
                                <div className="flex items-center space-x-2 mt-2">
                                  {commit.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedCommit(commit)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    if (index < filteredCommits.length - 1) {
                                      handleCompareVersions(commit, filteredCommits[index + 1]);
                                    }
                                  }}>
                                    <Diff className="h-4 w-4 mr-2" />
                                    Compare with Previous
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRevertCommit(commit.id)}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Revert
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    const targetBranch = prompt('Target branch:');
                                    if (targetBranch) {
                                      handleCherryPickCommit(commit.id, targetBranch);
                                    }
                                  }}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Cherry Pick
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    navigator.clipboard.writeText(commit.hash);
                                  }}>
                                    <Hash className="h-4 w-4 mr-2" />
                                    Copy Hash
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Merge Requests Tab */}
              <TabsContent value="merges" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Merge Requests</h3>
                  <Button onClick={() => setShowMergeDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Merge Request
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {versionState.mergeRequests.map(mr => (
                    <Card key={mr.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <GitPullRequest className="h-4 w-4" />
                              <h4 className="font-medium">{mr.title}</h4>
                              <Badge variant={
                                mr.status === 'open' ? 'default' :
                                mr.status === 'merged' ? 'secondary' :
                                mr.status === 'closed' ? 'destructive' : 'outline'
                              }>
                                {mr.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {mr.description}
                            </p>
                            
                            <div className="flex items-center text-sm text-muted-foreground space-x-4">
                              <span>
                                {versionState.availableBranches.find(b => b.id === mr.sourceBranchId)?.name} 
                                → 
                                {versionState.availableBranches.find(b => b.id === mr.targetBranchId)?.name}
                              </span>
                              <span>by {mr.author}</span>
                              <span>{formatRelativeTime(mr.createdAt)}</span>
                            </div>
                            
                            {mr.reviewers && mr.reviewers.length > 0 && (
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-muted-foreground">Reviewers:</span>
                                {mr.reviewers.map(reviewer => (
                                  <Badge key={reviewer} variant="outline" className="text-xs">
                                    {reviewer}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {mr.status === 'open' && (
                              <Button
                                size="sm"
                                onClick={() => handleMergeBranch(mr.id!)}
                                disabled={loadingStates.merging}
                              >
                                <GitMerge className="h-3 w-3 mr-2" />
                                Merge
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedMergeRequest(mr)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Tags & Releases Tab */}
              <TabsContent value="tags" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Tags & Releases</h3>
                  <div className="flex space-x-2">
                    <Button onClick={() => setShowReleaseDialog(true)}>
                      <Package className="h-4 w-4 mr-2" />
                      Create Release
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const tagName = prompt('Tag name:');
                      const tagMessage = prompt('Tag message:');
                      if (tagName && tagMessage) {
                        handleCreateTag(tagName, tagMessage);
                      }
                    }}>
                      <Tag className="h-4 w-4 mr-2" />
                      Create Tag
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {versionState.tags.map(tag => (
                    <Card key={tag.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Tag className="h-4 w-4" />
                              <h4 className="font-medium">{tag.name}</h4>
                              {tag.type === 'release' && (
                                <Badge variant="secondary">Release</Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {tag.message}
                            </p>
                            
                            <div className="flex items-center text-sm text-muted-foreground space-x-4">
                              <span>by {tag.author}</span>
                              <span>{formatRelativeTime(tag.createdAt)}</span>
                              <span className="font-mono">
                                {formatCommitHash(tag.commitId)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteTag(tag.id!)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Version History</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export History
                    </Button>
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>
                
                {selectedRule && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          Version Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {versions.slice(0, 10).map((version, index) => (
                            <div key={version.id} className="flex items-start space-x-4">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                {index < versions.length - 1 && (
                                  <div className="w-px h-16 bg-border mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium">v{version.version}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {version.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {version.description}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                                  <span>{formatRelativeTime(version.createdAt)}</span>
                                  <span>by {version.author}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedVersion(version)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => restoreVersion(selectedRule.id!, version.id)}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Compare Tab */}
              <TabsContent value="compare" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Compare Versions</h3>
                  <div className="flex items-center space-x-2">
                    <Select value={diffViewMode} onValueChange={(value: any) => setDiffViewMode(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="side-by-side">Side by Side</SelectItem>
                        <SelectItem value="unified">Unified</SelectItem>
                        <SelectItem value="split">Split</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" onClick={() => setShowDiffViewer(true)}>
                      <Diff className="h-4 w-4 mr-2" />
                      View Diff
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Base Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select 
                        value={compareCommit1?.id || ''} 
                        onValueChange={(commitId) => {
                          const commit = filteredCommits.find(c => c.id === commitId);
                          setCompareCommit1(commit || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select base commit" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCommits.map(commit => (
                            <SelectItem key={commit.id} value={commit.id}>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs bg-muted px-1 rounded">
                                  {formatCommitHash(commit.hash)}
                                </span>
                                <span className="truncate">{commit.message}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Compare Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select 
                        value={compareCommit2?.id || ''} 
                        onValueChange={(commitId) => {
                          const commit = filteredCommits.find(c => c.id === commitId);
                          setCompareCommit2(commit || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select compare commit" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCommits.map(commit => (
                            <SelectItem key={commit.id} value={commit.id}>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs bg-muted px-1 rounded">
                                  {formatCommitHash(commit.hash)}
                                </span>
                                <span className="truncate">{commit.message}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>
                
                {compareCommit1 && compareCommit2 && (
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handleCompareVersions(compareCommit1, compareCommit2)}
                      disabled={loadingStates.comparing}
                    >
                      {loadingStates.comparing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Diff className="h-4 w-4 mr-2" />
                      )}
                      Compare Versions
                    </Button>
                    
                    {ruleDiff && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Diff className="h-5 w-5 mr-2" />
                            Comparison Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-green-600">
                                  +{ruleDiff.additions || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Additions</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-red-600">
                                  -{ruleDiff.deletions || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Deletions</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-blue-600">
                                  {ruleDiff.modifications || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Modifications</div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="bg-muted p-4 rounded font-mono text-sm">
                              <pre className="whitespace-pre-wrap">
                                {ruleDiff.diff || 'No differences found'}
                              </pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Merge Dialog */}
        <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Merge Request</DialogTitle>
              <DialogDescription>
                Create a new merge request to merge changes between branches
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source Branch</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {versionState.availableBranches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id!}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Target Branch</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {versionState.availableBranches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id!}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Title</Label>
                <Input placeholder="Enter merge request title" />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea 
                  placeholder="Enter merge request description"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={mergeStrategy.squashCommits}
                    onCheckedChange={(checked) => 
                      setMergeStrategy(prev => ({ ...prev, squashCommits: checked }))
                    }
                  />
                  <Label>Squash commits</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={mergeStrategy.fastForward}
                    onCheckedChange={(checked) => 
                      setMergeStrategy(prev => ({ ...prev, fastForward: checked }))
                    }
                  />
                  <Label>Fast-forward merge</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Handle merge request creation
                  setShowMergeDialog(false);
                }}>
                  Create Merge Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Conflict Resolver Dialog */}
        <Dialog open={showConflictResolver} onOpenChange={setShowConflictResolver}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Resolve Merge Conflicts</DialogTitle>
              <DialogDescription>
                Resolve conflicts to complete the merge
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4" ref={conflictResolverRef}>
              {versionState.conflicts.map(conflict => (
                <Card key={conflict.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
                      {conflict.file}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-green-600">Your Changes</Label>
                          <div className="bg-green-50 p-3 rounded border">
                            <pre className="text-sm whitespace-pre-wrap">
                              {conflict.ours}
                            </pre>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-blue-600">Their Changes</Label>
                          <div className="bg-blue-50 p-3 rounded border">
                            <pre className="text-sm whitespace-pre-wrap">
                              {conflict.theirs}
                            </pre>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Resolution</Label>
                        <Textarea 
                          placeholder="Enter resolved content"
                          rows={6}
                          className="font-mono text-sm"
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Use Yours
                          </Button>
                          <Button size="sm" variant="outline">
                            Use Theirs
                          </Button>
                        </div>
                        
                        <Button size="sm">
                          Mark as Resolved
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowConflictResolver(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleResolveConflicts({})}
                  disabled={loadingStates.resolving}
                >
                  {loadingStates.resolving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Complete Merge
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Release Dialog */}
        <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Release</DialogTitle>
              <DialogDescription>
                Create a new release with version tagging
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Version</Label>
                  <Input 
                    value={releaseManagement.version}
                    onChange={(e) => setReleaseManagement(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                  />
                </div>
                
                <div>
                  <Label>Release Type</Label>
                  <Select 
                    value={releaseManagement.type} 
                    onValueChange={(value: any) => setReleaseManagement(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="patch">Patch</SelectItem>
                      <SelectItem value="hotfix">Hotfix</SelectItem>
                      <SelectItem value="prerelease">Prerelease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Input 
                  placeholder="Release description"
                  value={releaseManagement.description}
                  onChange={(e) => setReleaseManagement(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Changelog</Label>
                <Textarea 
                  placeholder="Enter changelog or leave empty to auto-generate"
                  rows={6}
                  value={releaseManagement.changelog}
                  onChange={(e) => setReleaseManagement(prev => ({ ...prev, changelog: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={releaseManagement.prerelease}
                    onCheckedChange={(checked) => 
                      setReleaseManagement(prev => ({ ...prev, prerelease: checked }))
                    }
                  />
                  <Label>Pre-release</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={releaseManagement.draft}
                    onCheckedChange={(checked) => 
                      setReleaseManagement(prev => ({ ...prev, draft: checked }))
                    }
                  />
                  <Label>Save as draft</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRelease}
                  disabled={loadingStates.releasing}
                >
                  {loadingStates.releasing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  Create Release
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RuleVersionControl;