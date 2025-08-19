/**
 * Rule Version Control Component for Advanced Data Governance
 * Comprehensive version control system with Git-like functionality for rule management
 * Features: Versioning, branching, merging, change tracking, rollback, collaborative change management
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  History, 
  RotateCcw, 
  Tag, 
  Users, 
  User, 
  Calendar, 
  Clock, 
  Edit, 
  Save, 
  Copy, 
  Download, 
  Upload, 
  Share2, 
  Compare, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus, 
  X, 
  Check, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  HelpCircle, 
  Settings, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp, 
  MoreHorizontal, 
  RefreshCw, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  Scissors, 
  Link, 
  Unlink, 
  Split, 
  Merge, 
  File, 
  FileText, 
  Folder, 
  FolderOpen, 
  Archive, 
  Bookmark, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Bell, 
  BellOff, 
  Lock, 
  Unlock, 
  Shield, 
  Globe, 
  Workflow, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Target, 
  Zap, 
  Code, 
  Database, 
  Server, 
  Cloud, 
  Cpu, 
  Memory, 
  HardDrive, 
  Signal, 
  Wifi, 
  Bluetooth, 
  Radio, 
  Phone, 
  Mail, 
  Send, 
  Inbox, 
  Trash2, 
  Package, 
  Box, 
  Archive as ArchiveIcon, 
  FileArchive, 
  FolderArchive, 
  Package2, 
  PackageCheck, 
  PackageOpen, 
  PackageX, 
  Layers, 
  Grid, 
  List, 
  Table, 
  Columns, 
  Rows, 
  Layout, 
  LayoutGrid, 
  LayoutList, 
  Sidebar, 
  PanelLeft, 
  PanelRight, 
  PanelTop, 
  PanelBottom, 
  Maximize, 
  Minimize, 
  SquareStack, 
  Boxes
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Types and interfaces
import { 
  RuleVersion,
  RuleBranch,
  RuleCommit,
  RuleMerge,
  RuleTag,
  VersionHistory,
  ChangeLog,
  VersionDiff,
  MergeConflict,
  BranchPolicy,
  VersionMetadata,
  CommitMessage,
  Author,
  Reviewer,
  RollbackRequest,
  VersionComparison,
  VersionStats,
  BranchStats,
  VersionTree,
  CommitGraph,
  MergeStrategy,
  ConflictResolution,
  VersionAudit,
  ChangeApproval,
  VersionRelease,
  Snapshot,
  Checkpoint,
  VersionBackup,
  VersionArchive,
  VersionMigration,
  VersionValidation,
  VersionPolicy,
  VersionWorkflow,
  VersionNotification,
  VersionAlert,
  VersionReport,
  VersionAnalytics,
  VersionMetrics,
  VersionTrend,
  VersionGovernance,
  VersionCompliance
} from '../../types/version-control.types';
import { ScanRule, RuleLanguage, RuleCategory, RuleType } from '../../types/scan-rules.types';
import { User as UserType, UserRole, UserPermission } from '../../types/user.types';

// Services and hooks
import { useScanRules } from '../../hooks/useScanRules';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useValidation } from '../../hooks/useValidation';

// Utilities
import { validationEngine } from '../../utils/validation-engine';
import { collaborationManager } from '../../utils/collaboration-utils';

// Constants
import { THEME_CONFIG, ANIMATION_CONFIG, COMPONENT_CONFIG } from '../../constants/ui-constants';

// =============================================================================
// RULE VERSION CONTROL COMPONENT
// =============================================================================

interface RuleVersionControlProps {
  rule?: ScanRule;
  onVersionSelect?: (version: RuleVersion) => void;
  onBranchSwitch?: (branch: RuleBranch) => void;
  onCommit?: (commit: RuleCommit) => void;
  onMerge?: (merge: RuleMerge) => void;
  onRollback?: (version: RuleVersion) => void;
  readonly?: boolean;
  collaborative?: boolean;
  enableBranching?: boolean;
  enableTagging?: boolean;
  className?: string;
}

export const RuleVersionControl: React.FC<RuleVersionControlProps> = ({
  rule,
  onVersionSelect,
  onBranchSwitch,
  onCommit,
  onMerge,
  onRollback,
  readonly = false,
  collaborative = true,
  enableBranching = true,
  enableTagging = true,
  className = ''
}) => {
  // State management
  const [versions, setVersions] = useState<RuleVersion[]>([]);
  const [branches, setBranches] = useState<RuleBranch[]>([]);
  const [commits, setCommits] = useState<RuleCommit[]>([]);
  const [tags, setTags] = useState<RuleTag[]>([]);
  const [currentBranch, setCurrentBranch] = useState<RuleBranch | null>(null);
  const [currentVersion, setCurrentVersion] = useState<RuleVersion | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<RuleVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<RuleVersion | null>(null);
  const [versionDiff, setVersionDiff] = useState<VersionDiff | null>(null);
  const [mergeConflicts, setMergeConflicts] = useState<MergeConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  // Dialog states
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showBranchPolicyDialog, setShowBranchPolicyDialog] = useState(false);

  // Form states
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [tagDescription, setTagDescription] = useState('');
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('fast-forward');
  const [targetBranch, setTargetBranch] = useState<string>('');

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'major' | 'minor' | 'patch'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'version' | 'author'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showArchived, setShowArchived] = useState(false);

  // View states
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'graph'>('list');
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [selectedCommits, setSelectedCommits] = useState<Set<string>>(new Set());

  // Analytics and metrics
  const [versionStats, setVersionStats] = useState<VersionStats | null>(null);
  const [branchStats, setBranchStats] = useState<BranchStats | null>(null);
  const [versionTrends, setVersionTrends] = useState<VersionTrend[]>([]);

  // Collaboration
  const [collaborators, setCollaborators] = useState<UserType[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ChangeApproval[]>([]);
  const [notifications, setNotifications] = useState<VersionNotification[]>([]);

  // Refs
  const commitGraphRef = useRef<HTMLDivElement>(null);
  const versionTimelineRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { validateRule, formatRule } = useScanRules();
  const { trackUserActivity, sendNotification } = useCollaboration();
  const { validateVersion } = useValidation();

  // =============================================================================
  // VERSION CONTROL OPERATIONS
  // =============================================================================

  /**
   * Create a new commit
   */
  const createCommit = useCallback(async () => {
    if (!rule || !commitMessage.trim() || isCommitting) return;

    setIsCommitting(true);
    try {
      const newCommit: RuleCommit = {
        id: generateCommitId(),
        ruleId: rule.id,
        branchName: currentBranch?.name || 'main',
        message: commitMessage.trim(),
        description: commitDescription.trim() || undefined,
        author: {
          id: getCurrentUserId(),
          name: getCurrentUserName(),
          email: getCurrentUserEmail()
        },
        timestamp: new Date(),
        version: generateNextVersion(),
        changes: await calculateChanges(rule),
        parentCommitId: currentVersion?.commitId,
        hash: await generateCommitHash(),
        metadata: {
          lineCount: rule.content.split('\n').length,
          characterCount: rule.content.length,
          language: rule.language,
          category: rule.category
        }
      };

      // Validate commit
      const validation = await validateCommit(newCommit);
      if (!validation.isValid) {
        throw new Error(`Commit validation failed: ${validation.errors.join(', ')}`);
      }

      // Create version
      const newVersion: RuleVersion = {
        id: generateVersionId(),
        ruleId: rule.id,
        version: newCommit.version,
        commitId: newCommit.id,
        branchName: newCommit.branchName,
        content: rule.content,
        metadata: newCommit.metadata,
        author: newCommit.author,
        createdAt: newCommit.timestamp,
        isStable: false,
        isArchived: false,
        tags: []
      };

      // Add to state
      setCommits(prev => [newCommit, ...prev]);
      setVersions(prev => [newVersion, ...prev]);
      setCurrentVersion(newVersion);

      // Update branch
      if (currentBranch) {
        const updatedBranch = {
          ...currentBranch,
          lastCommitId: newCommit.id,
          lastModified: newCommit.timestamp,
          commitCount: currentBranch.commitCount + 1
        };
        setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
        setCurrentBranch(updatedBranch);
      }

      // Track activity
      await trackUserActivity({
        action: 'version_committed',
        ruleId: rule.id,
        versionId: newVersion.id,
        commitId: newCommit.id,
        branchName: newCommit.branchName,
        message: commitMessage,
        timestamp: new Date().toISOString()
      });

      // Send notifications
      if (collaborative) {
        await sendNotification({
          type: 'version_created',
          ruleId: rule.id,
          version: newVersion.version,
          author: newCommit.author,
          message: commitMessage
        });
      }

      // Callbacks
      onCommit?.(newCommit);
      onVersionSelect?.(newVersion);

      // Reset form
      setCommitMessage('');
      setCommitDescription('');
      setShowCommitDialog(false);

      addToLog(`Created commit ${newCommit.hash.substring(0, 8)} on branch ${newCommit.branchName}`);

    } catch (error) {
      addToLog(`Failed to create commit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCommitting(false);
    }
  }, [
    rule,
    commitMessage,
    commitDescription,
    currentBranch,
    currentVersion,
    isCommitting,
    collaborative,
    onCommit,
    onVersionSelect,
    trackUserActivity,
    sendNotification
  ]);

  /**
   * Create a new branch
   */
  const createBranch = useCallback(async () => {
    if (!newBranchName.trim() || !currentVersion) return;

    try {
      const branch: RuleBranch = {
        id: generateBranchId(),
        name: newBranchName.trim(),
        ruleId: rule?.id || '',
        sourceCommitId: currentVersion.commitId,
        lastCommitId: currentVersion.commitId,
        author: {
          id: getCurrentUserId(),
          name: getCurrentUserName(),
          email: getCurrentUserEmail()
        },
        createdAt: new Date(),
        lastModified: new Date(),
        isProtected: false,
        isDefault: false,
        commitCount: 0,
        mergePolicy: 'merge-commit',
        description: `Branch created from ${currentVersion.version}`
      };

      setBranches(prev => [...prev, branch]);
      setCurrentBranch(branch);
      setNewBranchName('');
      setShowBranchDialog(false);

      await trackUserActivity({
        action: 'branch_created',
        ruleId: rule?.id,
        branchName: branch.name,
        sourceCommit: currentVersion.commitId,
        timestamp: new Date().toISOString()
      });

      onBranchSwitch?.(branch);
      addToLog(`Created branch ${branch.name}`);

    } catch (error) {
      addToLog(`Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [newBranchName, currentVersion, rule, onBranchSwitch, trackUserActivity]);

  /**
   * Switch to a different branch
   */
  const switchBranch = useCallback(async (branch: RuleBranch) => {
    try {
      setCurrentBranch(branch);
      
      // Load latest version from branch
      const branchVersions = versions.filter(v => v.branchName === branch.name);
      if (branchVersions.length > 0) {
        const latestVersion = branchVersions[0];
        setCurrentVersion(latestVersion);
        onVersionSelect?.(latestVersion);
      }

      await trackUserActivity({
        action: 'branch_switched',
        ruleId: rule?.id,
        branchName: branch.name,
        timestamp: new Date().toISOString()
      });

      onBranchSwitch?.(branch);
      addToLog(`Switched to branch ${branch.name}`);

    } catch (error) {
      addToLog(`Failed to switch branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [versions, rule, onVersionSelect, onBranchSwitch, trackUserActivity]);

  /**
   * Create a tag
   */
  const createTag = useCallback(async () => {
    if (!newTagName.trim() || !selectedVersion) return;

    try {
      const tag: RuleTag = {
        id: generateTagId(),
        name: newTagName.trim(),
        versionId: selectedVersion.id,
        commitId: selectedVersion.commitId,
        ruleId: rule?.id || '',
        description: tagDescription.trim() || undefined,
        author: {
          id: getCurrentUserId(),
          name: getCurrentUserName(),
          email: getCurrentUserEmail()
        },
        createdAt: new Date(),
        isRelease: false,
        metadata: {
          version: selectedVersion.version,
          branchName: selectedVersion.branchName
        }
      };

      setTags(prev => [...prev, tag]);
      
      // Update version with tag
      setVersions(prev => prev.map(v => 
        v.id === selectedVersion.id 
          ? { ...v, tags: [...(v.tags || []), tag] }
          : v
      ));

      setNewTagName('');
      setTagDescription('');
      setShowTagDialog(false);

      await trackUserActivity({
        action: 'tag_created',
        ruleId: rule?.id,
        tagName: tag.name,
        versionId: selectedVersion.id,
        timestamp: new Date().toISOString()
      });

      addToLog(`Created tag ${tag.name} for version ${selectedVersion.version}`);

    } catch (error) {
      addToLog(`Failed to create tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [newTagName, tagDescription, selectedVersion, rule, trackUserActivity]);

  /**
   * Merge branches
   */
  const mergeBranches = useCallback(async () => {
    if (!currentBranch || !targetBranch || isMerging) return;

    setIsMerging(true);
    try {
      const sourceBranch = currentBranch;
      const destBranch = branches.find(b => b.name === targetBranch);

      if (!destBranch) {
        throw new Error('Target branch not found');
      }

      // Check for conflicts
      const conflicts = await detectMergeConflicts(sourceBranch, destBranch);
      
      if (conflicts.length > 0) {
        setMergeConflicts(conflicts);
        setShowConflictDialog(true);
        return;
      }

      // Perform merge
      const merge: RuleMerge = {
        id: generateMergeId(),
        ruleId: rule?.id || '',
        sourceBranch: sourceBranch.name,
        targetBranch: destBranch.name,
        strategy: mergeStrategy,
        author: {
          id: getCurrentUserId(),
          name: getCurrentUserName(),
          email: getCurrentUserEmail()
        },
        timestamp: new Date(),
        status: 'completed',
        conflicts: [],
        mergeCommitId: generateCommitId()
      };

      // Create merge commit
      const mergeCommit: RuleCommit = {
        id: merge.mergeCommitId,
        ruleId: rule?.id || '',
        branchName: destBranch.name,
        message: `Merge branch '${sourceBranch.name}' into '${destBranch.name}'`,
        author: merge.author,
        timestamp: merge.timestamp,
        version: generateNextVersion(),
        changes: [],
        parentCommitId: destBranch.lastCommitId,
        mergeCommitId: sourceBranch.lastCommitId,
        hash: await generateCommitHash(),
        isMergeCommit: true,
        metadata: {}
      };

      setCommits(prev => [mergeCommit, ...prev]);
      setTargetBranch('');
      setShowMergeDialog(false);

      await trackUserActivity({
        action: 'branches_merged',
        ruleId: rule?.id,
        sourceBranch: sourceBranch.name,
        targetBranch: destBranch.name,
        strategy: mergeStrategy,
        timestamp: new Date().toISOString()
      });

      onMerge?.(merge);
      addToLog(`Merged branch ${sourceBranch.name} into ${destBranch.name}`);

    } catch (error) {
      addToLog(`Failed to merge branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMerging(false);
    }
  }, [
    currentBranch,
    targetBranch,
    mergeStrategy,
    branches,
    rule,
    isMerging,
    onMerge,
    trackUserActivity
  ]);

  /**
   * Rollback to a previous version
   */
  const rollbackToVersion = useCallback(async (version: RuleVersion) => {
    try {
      // Create rollback commit
      const rollbackCommit: RuleCommit = {
        id: generateCommitId(),
        ruleId: rule?.id || '',
        branchName: currentBranch?.name || 'main',
        message: `Rollback to version ${version.version}`,
        description: `Reverted changes to restore version ${version.version}`,
        author: {
          id: getCurrentUserId(),
          name: getCurrentUserName(),
          email: getCurrentUserEmail()
        },
        timestamp: new Date(),
        version: generateNextVersion(),
        changes: await calculateRollbackChanges(version),
        parentCommitId: currentVersion?.commitId,
        hash: await generateCommitHash(),
        isRollback: true,
        rollbackToCommitId: version.commitId,
        metadata: version.metadata
      };

      // Create new version with rolled back content
      const rollbackVersion: RuleVersion = {
        id: generateVersionId(),
        ruleId: rule?.id || '',
        version: rollbackCommit.version,
        commitId: rollbackCommit.id,
        branchName: rollbackCommit.branchName,
        content: version.content,
        metadata: version.metadata,
        author: rollbackCommit.author,
        createdAt: rollbackCommit.timestamp,
        isStable: false,
        isArchived: false,
        isRollback: true,
        rollbackFromVersionId: currentVersion?.id,
        tags: []
      };

      setCommits(prev => [rollbackCommit, ...prev]);
      setVersions(prev => [rollbackVersion, ...prev]);
      setCurrentVersion(rollbackVersion);

      await trackUserActivity({
        action: 'version_rollback',
        ruleId: rule?.id,
        fromVersionId: currentVersion?.id,
        toVersionId: version.id,
        rollbackVersionId: rollbackVersion.id,
        timestamp: new Date().toISOString()
      });

      onRollback?.(rollbackVersion);
      addToLog(`Rolled back to version ${version.version}`);

    } catch (error) {
      addToLog(`Failed to rollback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [rule, currentBranch, currentVersion, onRollback, trackUserActivity]);

  /**
   * Compare two versions
   */
  const compareVersions = useCallback(async (v1: RuleVersion, v2: RuleVersion) => {
    try {
      const diff = await calculateVersionDiff(v1, v2);
      setVersionDiff(diff);
      setCompareVersion(v2);
      setShowDiffDialog(true);

      await trackUserActivity({
        action: 'versions_compared',
        ruleId: rule?.id,
        version1Id: v1.id,
        version2Id: v2.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      addToLog(`Failed to compare versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [rule, trackUserActivity]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Generate unique IDs
   */
  const generateCommitId = useCallback(() => `commit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const generateVersionId = useCallback(() => `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const generateBranchId = useCallback(() => `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const generateTagId = useCallback(() => `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const generateMergeId = useCallback(() => `merge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

  /**
   * Generate next version number
   */
  const generateNextVersion = useCallback(() => {
    const latestVersion = versions[0];
    if (!latestVersion) return '1.0.0';

    const [major, minor, patch] = latestVersion.version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }, [versions]);

  /**
   * Generate commit hash
   */
  const generateCommitHash = useCallback(async () => {
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return randomString.toLowerCase();
  }, []);

  /**
   * Get current user info
   */
  const getCurrentUserId = useCallback(() => 'current-user-id', []);
  const getCurrentUserName = useCallback(() => 'Current User', []);
  const getCurrentUserEmail = useCallback(() => 'user@example.com', []);

  /**
   * Calculate changes between versions
   */
  const calculateChanges = useCallback(async (rule: ScanRule) => {
    // This would implement actual diff calculation
    return [
      {
        type: 'modified' as const,
        file: 'rule.content',
        linesAdded: 5,
        linesRemoved: 2,
        changes: '+5 -2'
      }
    ];
  }, []);

  /**
   * Calculate rollback changes
   */
  const calculateRollbackChanges = useCallback(async (version: RuleVersion) => {
    return [
      {
        type: 'rollback' as const,
        file: 'rule.content',
        linesAdded: 0,
        linesRemoved: 0,
        changes: 'Rollback to previous version'
      }
    ];
  }, []);

  /**
   * Calculate version diff
   */
  const calculateVersionDiff = useCallback(async (v1: RuleVersion, v2: RuleVersion): Promise<VersionDiff> => {
    // This would implement actual diff calculation
    return {
      id: `diff_${v1.id}_${v2.id}`,
      version1: v1,
      version2: v2,
      changes: [
        {
          type: 'addition',
          line: 10,
          content: '+ Added new validation rule',
          oldContent: '',
          newContent: 'Added new validation rule'
        },
        {
          type: 'deletion',
          line: 15,
          content: '- Removed old condition',
          oldContent: 'Removed old condition',
          newContent: ''
        },
        {
          type: 'modification',
          line: 20,
          content: '~ Updated rule logic',
          oldContent: 'Old rule logic',
          newContent: 'Updated rule logic'
        }
      ],
      statistics: {
        linesAdded: 5,
        linesRemoved: 3,
        linesModified: 2,
        filesChanged: 1
      },
      generatedAt: new Date()
    };
  }, []);

  /**
   * Detect merge conflicts
   */
  const detectMergeConflicts = useCallback(async (
    sourceBranch: RuleBranch, 
    targetBranch: RuleBranch
  ): Promise<MergeConflict[]> => {
    // This would implement actual conflict detection
    return [];
  }, []);

  /**
   * Validate commit
   */
  const validateCommit = useCallback(async (commit: RuleCommit) => {
    // Basic validation
    if (!commit.message.trim()) {
      return { isValid: false, errors: ['Commit message is required'] };
    }

    return { isValid: true, errors: [] };
  }, []);

  /**
   * Add message to log
   */
  const addToLog = useCallback((message: string) => {
    console.log(`[Version Control] ${message}`);
  }, []);

  /**
   * Filter and sort versions
   */
  const filteredAndSortedVersions = useMemo(() => {
    let filtered = versions.filter(version => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return version.version.toLowerCase().includes(query) ||
               version.author.name.toLowerCase().includes(query) ||
               commits.find(c => c.id === version.commitId)?.message.toLowerCase().includes(query);
      }

      // Type filter
      if (filterBy !== 'all') {
        const [major, minor, patch] = version.version.split('.').map(Number);
        switch (filterBy) {
          case 'major':
            return minor === 0 && patch === 0;
          case 'minor':
            return patch === 0;
          case 'patch':
            return patch > 0;
        }
      }

      // Archive filter
      if (!showArchived && version.isArchived) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'version':
          return sortOrder === 'asc' 
            ? a.version.localeCompare(b.version)
            : b.version.localeCompare(a.version);
        case 'author':
          return sortOrder === 'asc'
            ? a.author.name.localeCompare(b.author.name)
            : b.author.name.localeCompare(a.author.name);
        case 'date':
        default:
          return sortOrder === 'asc'
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [versions, commits, searchQuery, filterBy, sortBy, sortOrder, showArchived]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  /**
   * Initialize version control data
   */
  useEffect(() => {
    if (rule) {
      // Initialize with current rule as first version
      const initialBranch: RuleBranch = {
        id: generateBranchId(),
        name: 'main',
        ruleId: rule.id,
        sourceCommitId: '',
        lastCommitId: '',
        author: {
          id: getCurrentUserId(),
          name: getCurrentUserName(),
          email: getCurrentUserEmail()
        },
        createdAt: new Date(),
        lastModified: new Date(),
        isProtected: true,
        isDefault: true,
        commitCount: 1,
        mergePolicy: 'merge-commit',
        description: 'Main branch'
      };

      const initialCommit: RuleCommit = {
        id: generateCommitId(),
        ruleId: rule.id,
        branchName: 'main',
        message: 'Initial commit',
        description: 'Initial version of the rule',
        author: initialBranch.author,
        timestamp: new Date(),
        version: '1.0.0',
        changes: [],
        hash: 'initial',
        metadata: {
          lineCount: rule.content.split('\n').length,
          characterCount: rule.content.length,
          language: rule.language,
          category: rule.category
        }
      };

      const initialVersion: RuleVersion = {
        id: generateVersionId(),
        ruleId: rule.id,
        version: '1.0.0',
        commitId: initialCommit.id,
        branchName: 'main',
        content: rule.content,
        metadata: initialCommit.metadata,
        author: initialCommit.author,
        createdAt: initialCommit.timestamp,
        isStable: true,
        isArchived: false,
        tags: []
      };

      // Update branch with commit ID
      initialBranch.lastCommitId = initialCommit.id;

      setBranches([initialBranch]);
      setCommits([initialCommit]);
      setVersions([initialVersion]);
      setCurrentBranch(initialBranch);
      setCurrentVersion(initialVersion);
    }
  }, [rule, generateBranchId, generateCommitId, generateVersionId, getCurrentUserId, getCurrentUserName, getCurrentUserEmail]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render version item
   */
  const renderVersionItem = useCallback((version: RuleVersion) => {
    const commit = commits.find(c => c.id === version.commitId);
    const isSelected = selectedVersion?.id === version.id;
    const isCurrent = currentVersion?.id === version.id;

    return (
      <motion.div
        key={version.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
          isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
        } ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setSelectedVersion(version)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-lg">{version.version}</span>
              {isCurrent && (
                <Badge variant="default" className="text-xs">Current</Badge>
              )}
              {version.isStable && (
                <Badge variant="secondary" className="text-xs">Stable</Badge>
              )}
              {version.isRollback && (
                <Badge variant="destructive" className="text-xs">Rollback</Badge>
              )}
            </div>

            {commit && (
              <p className="text-sm text-gray-600 mb-2">{commit.message}</p>
            )}

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{version.author.name}</span>
              </span>
              <span className="flex items-center space-x-1">
                <GitBranch className="h-3 w-3" />
                <span>{version.branchName}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{version.createdAt.toLocaleDateString()}</span>
              </span>
              {commit && (
                <span className="flex items-center space-x-1">
                  <GitCommit className="h-3 w-3" />
                  <span>{commit.hash.substring(0, 8)}</span>
                </span>
              )}
            </div>

            {version.tags && version.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {version.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onVersionSelect?.(version)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedVersion(version);
                if (compareVersion) {
                  compareVersions(version, compareVersion);
                }
              }}>
                <Compare className="h-4 w-4 mr-2" />
                Compare
              </DropdownMenuItem>
              {enableTagging && (
                <DropdownMenuItem onClick={() => {
                  setSelectedVersion(version);
                  setShowTagDialog(true);
                }}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tag
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => rollbackToVersion(version)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Rollback
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                navigator.clipboard.writeText(version.id);
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }, [
    commits,
    selectedVersion,
    currentVersion,
    compareVersion,
    enableTagging,
    onVersionSelect,
    compareVersions,
    rollbackToVersion
  ]);

  /**
   * Render branch item
   */
  const renderBranchItem = useCallback((branch: RuleBranch) => {
    const isCurrent = currentBranch?.id === branch.id;

    return (
      <motion.div
        key={branch.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
          isCurrent ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => switchBranch(branch)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GitBranch className={`h-4 w-4 ${isCurrent ? 'text-primary' : 'text-gray-500'}`} />
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${isCurrent ? 'text-primary' : 'text-gray-900'}`}>
                  {branch.name}
                </span>
                {branch.isDefault && (
                  <Badge variant="default" className="text-xs">Default</Badge>
                )}
                {branch.isProtected && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Protected
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                <span>{branch.commitCount} commits</span>
                <span>by {branch.author.name}</span>
                <span>{branch.lastModified.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {enableBranching && !branch.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetBranch(branch.name);
                  setShowMergeDialog(true);
                }}
                className="h-7 text-xs"
              >
                <GitMerge className="h-3 w-3 mr-1" />
                Merge
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }, [currentBranch, enableBranching, switchBranch]);

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <TooltipProvider>
      <div className={`rule-version-control ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Version Control</h2>
              <p className="text-gray-600">
                Comprehensive version management with Git-like functionality
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentBranch && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <GitBranch className="h-3 w-3" />
                <span>{currentBranch.name}</span>
              </Badge>
            )}

            {enableBranching && (
              <Button
                variant="outline"
                onClick={() => setShowBranchDialog(true)}
                disabled={readonly}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Branch</span>
              </Button>
            )}

            <Button
              onClick={() => setShowCommitDialog(true)}
              disabled={readonly || !rule}
              className="flex items-center space-x-2"
            >
              <GitCommit className="h-4 w-4" />
              <span>Commit</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Versions List */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="versions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="versions" className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>Versions</span>
                  <Badge variant="secondary" className="ml-1">
                    {filteredAndSortedVersions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="branches" className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4" />
                  <span>Branches</span>
                  <Badge variant="secondary" className="ml-1">
                    {branches.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="tags" className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Tags</span>
                  <Badge variant="secondary" className="ml-1">
                    {tags.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="diff" className="flex items-center space-x-2">
                  <Compare className="h-4 w-4" />
                  <span>Compare</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="versions" className="mt-6">
                {/* Version Controls */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Search and filters */}
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search versions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as any)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="patch">Patch</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="version">Version</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                        </Button>
                      </div>

                      {/* View options */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-archived"
                            checked={showArchived}
                            onCheckedChange={setShowArchived}
                          />
                          <Label htmlFor="show-archived" className="text-sm">
                            Show archived versions
                          </Label>
                        </div>

                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-7 px-3"
                          >
                            <List className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={viewMode === 'tree' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('tree')}
                            className="h-7 px-3"
                          >
                            <GitBranch className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={viewMode === 'graph' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('graph')}
                            className="h-7 px-3"
                          >
                            <Activity className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Versions List */}
                <div className="space-y-4">
                  {filteredAndSortedVersions.map(renderVersionItem)}
                  {filteredAndSortedVersions.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No versions found</h3>
                        <p className="text-gray-600">
                          {searchQuery ? 'Try adjusting your search or filters' : 'Create your first commit to get started'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="branches" className="mt-6">
                <div className="space-y-4">
                  {branches.map(renderBranchItem)}
                  {branches.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
                        <p className="text-gray-600">Create your first branch to start working</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tags" className="mt-6">
                <div className="space-y-4">
                  {tags.map((tag) => (
                    <Card key={tag.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <div>
                              <h4 className="font-medium">{tag.name}</h4>
                              {tag.description && (
                                <p className="text-sm text-gray-600">{tag.description}</p>
                              )}
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                <span>Version {tag.metadata?.version}</span>
                                <span>by {tag.author.name}</span>
                                <span>{tag.createdAt.toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {tag.isRelease && (
                              <Badge variant="default" className="text-xs">Release</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tags.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
                        <p className="text-gray-600">Create tags to mark important versions</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="diff" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Compare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Version Comparison</h3>
                    <p className="text-gray-600">Select two versions to compare their differences</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {currentVersion && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary mb-1">
                        v{currentVersion.version}
                      </div>
                      <div className="text-xs text-gray-600">
                        {currentBranch?.name} branch
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-sm font-medium">{versions.length}</div>
                      <div className="text-xs text-gray-600">Versions</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{branches.length}</div>
                      <div className="text-xs text-gray-600">Branches</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{commits.length}</div>
                      <div className="text-xs text-gray-600">Commits</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{tags.length}</div>
                      <div className="text-xs text-gray-600">Tags</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {commits.slice(0, 5).map((commit) => (
                    <div key={commit.id} className="flex items-start space-x-2">
                      <GitCommit className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {commit.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {commit.author.name} • {commit.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {commits.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Old Versions
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Branch Policies
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Version Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Commit Dialog */}
        <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Commit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="commit-message">Commit Message</Label>
                <Input
                  id="commit-message"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Describe your changes"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="commit-description">Description (optional)</Label>
                <Textarea
                  id="commit-description"
                  value={commitDescription}
                  onChange={(e) => setCommitDescription(e.target.value)}
                  placeholder="Add more details about your changes"
                  rows={3}
                />
              </div>
              {currentBranch && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <GitBranch className="h-4 w-4" />
                  <span>Committing to branch: <strong>{currentBranch.name}</strong></span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCommitDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createCommit}
                disabled={!commitMessage.trim() || isCommitting}
              >
                {isCommitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <GitCommit className="h-4 w-4 mr-2" />
                )}
                Commit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Branch Dialog */}
        <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Branch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="branch-name">Branch Name</Label>
                <Input
                  id="branch-name"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Enter branch name"
                  autoFocus
                />
              </div>
              {currentVersion && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <GitCommit className="h-4 w-4" />
                  <span>Creating from version: <strong>{currentVersion.version}</strong></span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBranchDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createBranch}
                disabled={!newBranchName.trim()}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Create Branch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tag Dialog */}
        <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., v1.0.0, release-2023"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="tag-description">Description (optional)</Label>
                <Textarea
                  id="tag-description"
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                  placeholder="Describe this tag"
                  rows={3}
                />
              </div>
              {selectedVersion && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Tag className="h-4 w-4" />
                  <span>Tagging version: <strong>{selectedVersion.version}</strong></span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTagDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createTag}
                disabled={!newTagName.trim() || !selectedVersion}
              >
                <Tag className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Merge Dialog */}
        <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Merge Branches</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Source Branch</Label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <GitBranch className="h-4 w-4 text-gray-500" />
                  <span>{currentBranch?.name}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="target-branch">Target Branch</Label>
                <Select value={targetBranch} onValueChange={setTargetBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches
                      .filter(b => b.name !== currentBranch?.name)
                      .map(branch => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="merge-strategy">Merge Strategy</Label>
                <Select value={mergeStrategy} onValueChange={(value) => setMergeStrategy(value as MergeStrategy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast-forward">Fast Forward</SelectItem>
                    <SelectItem value="merge-commit">Merge Commit</SelectItem>
                    <SelectItem value="squash">Squash and Merge</SelectItem>
                    <SelectItem value="rebase">Rebase and Merge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={mergeBranches}
                disabled={!targetBranch || isMerging}
              >
                {isMerging ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <GitMerge className="h-4 w-4 mr-2" />
                )}
                Merge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RuleVersionControl;