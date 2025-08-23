'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  History, 
  RotateCcw, 
  Tag, 
  Clock, 
  User, 
  Compare, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Copy,
  Trash2,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  Maximize,
  Minimize,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Info,
  HelpCircle,
  Target,
  Layers,
  Workflow,
  Database,
  BarChart3,
  TrendingUp,
  Activity,
  Shield,
  Lock,
  Unlock,
  Key,
  Users,
  Calendar,
  Hash,
  Type,
  BookOpen,
  Code,
  FileText,
  FolderOpen,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2,
  ExternalLink
} from 'lucide-react';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuLabel, 
  ContextMenuSeparator, 
  ContextMenuTrigger 
} from '@/components/ui/context-menu';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Racine System Hooks
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import {
  createPipelineVersion,
  comparePipelineVersions,
  mergePipelineVersions,
  rollbackPipelineVersion,
  analyzePipelineChanges,
  optimizePipelineVersioning
} from '../../utils/version-control-backend-integration';

// Types from racine-core.types
import {
  PipelineVersion,
  VersionControl,
  VersionBranch,
  VersionCommit,
  VersionDiff,
  VersionMerge,
  VersionTag,
  VersionHistory,
  VersionConflict,
  VersionMetadata,
  VersionAnnotation,
  VersionComparison,
  BranchStrategy,
  MergeStrategy,
  VersionValidation,
  VersionArchive,
  VersionRestore,
  ChangeLog,
  VersionAnalytics,
  VersionPermission,
  VersionBackup,
  VersionSync,
  VersionOptimization,
  VersionAudit
} from '../../types/racine-core.types';

// Component Interface
interface PipelineVersionControlProps {
  pipelineId?: string;
  onVersionChange?: (version: PipelineVersion) => void;
  onBranchChange?: (branch: VersionBranch) => void;
  readonly?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

// Component State Interface
interface PipelineVersionControlState {
  // Core Version State
  currentVersion: PipelineVersion | null;
  activeBranch: VersionBranch | null;
  selectedCommit: VersionCommit | null;
  
  // Version Control State
  isCommitting: boolean;
  isMerging: boolean;
  isRollingBack: boolean;
  isComparison: boolean;
  
  // UI State
  activeTab: string;
  selectedView: 'commits' | 'branches' | 'tags' | 'diff' | 'timeline';
  isDiffMode: boolean;
  isFullscreen: boolean;
  showAdvanced: boolean;
  
  // Data State
  versions: PipelineVersion[];
  branches: VersionBranch[];
  commits: VersionCommit[];
  tags: VersionTag[];
  diffs: VersionDiff[];
  
  // Comparison State
  compareVersions: [PipelineVersion | null, PipelineVersion | null];
  versionDiff: VersionDiff | null;
  
  // Filter and Search
  searchTerm: string;
  filterCriteria: any;
  sortOrder: 'asc' | 'desc';
  sortBy: string;
}

// Version Status Types
const VERSION_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'staging', label: 'Staging', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'production', label: 'Production', color: 'bg-green-100 text-green-800' },
  { value: 'archived', label: 'Archived', color: 'bg-blue-100 text-blue-800' }
];

// Branch Types
const BRANCH_TYPES = [
  {
    id: 'main',
    name: 'Main',
    description: 'Primary production branch',
    icon: GitBranch,
    color: 'green'
  },
  {
    id: 'development',
    name: 'Development',
    description: 'Active development branch',
    icon: Code,
    color: 'blue'
  },
  {
    id: 'feature',
    name: 'Feature',
    description: 'Feature development branches',
    icon: Star,
    color: 'purple'
  },
  {
    id: 'hotfix',
    name: 'Hotfix',
    description: 'Critical bug fix branches',
    icon: AlertCircle,
    color: 'red'
  },
  {
    id: 'release',
    name: 'Release',
    description: 'Release preparation branches',
    icon: Tag,
    color: 'orange'
  }
];

// Merge Strategies
const MERGE_STRATEGIES = [
  { value: 'merge', label: 'Merge Commit', description: 'Create a merge commit' },
  { value: 'squash', label: 'Squash and Merge', description: 'Combine all commits' },
  { value: 'rebase', label: 'Rebase and Merge', description: 'Rebase then merge' }
];

// Main Component
export const PipelineVersionControl: React.FC<PipelineVersionControlProps> = ({
  pipelineId,
  onVersionChange,
  onBranchChange,
  readonly = false,
  theme = 'light',
  className = ''
}) => {
  // Racine System Hooks
  const {
    currentPipeline,
    pipelineVersions,
    createVersion,
    updateVersion,
    deleteVersion,
    comparePipeline,
    rollbackPipeline,
    getVersionHistory
  } = usePipelineManagement();

  const {
    orchestrateVersionControl,
    getVersionMetrics,
    optimizeVersionWorkflow,
    monitorVersionChanges
  } = useRacineOrchestration();

  const {
    synchronizeVersions,
    validateCrossGroupVersions,
    getCrossGroupVersionMetrics,
    resolveVersionConflicts
  } = useCrossGroupIntegration();

  const { currentUser, hasPermission } = useUserManagement();
  const { currentWorkspace, getWorkspaceResources } = useWorkspaceManagement();
  const { trackActivity, getActivityMetrics } = useActivityTracker();
  const { 
    getAIRecommendations, 
    optimizeWithAI, 
    analyzeVersionsWithAI,
    suggestVersionStrategy
  } = useAIAssistant();

  // Component State
  const [state, setState] = useState<PipelineVersionControlState>({
    currentVersion: null,
    activeBranch: null,
    selectedCommit: null,
    isCommitting: false,
    isMerging: false,
    isRollingBack: false,
    isComparison: false,
    activeTab: 'commits',
    selectedView: 'commits',
    isDiffMode: false,
    isFullscreen: false,
    showAdvanced: false,
    versions: [],
    branches: [],
    commits: [],
    tags: [],
    diffs: [],
    compareVersions: [null, null],
    versionDiff: null,
    searchTerm: '',
    filterCriteria: {},
    sortOrder: 'desc',
    sortBy: 'timestamp'
  });

  // Computed Values
  const filteredVersions = useMemo(() => {
    let filtered = state.versions;
    
    if (state.searchTerm) {
      filtered = filtered.filter(version =>
        version.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        version.description?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        version.author?.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[state.sortBy as keyof PipelineVersion] || '';
      const bValue = b[state.sortBy as keyof PipelineVersion] || '';
      
      if (state.sortOrder === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [state.versions, state.searchTerm, state.sortBy, state.sortOrder]);

  const versionStatistics = useMemo(() => {
    const versions = state.versions;
    const commits = state.commits;
    
    return {
      totalVersions: versions.length,
      totalCommits: commits.length,
      activeBranches: state.branches.filter(b => b.isActive).length,
      latestVersion: versions.find(v => v.isLatest),
      productionVersions: versions.filter(v => v.status === 'production').length,
      averageCommitsPerDay: commits.length > 0 
        ? commits.length / Math.max(1, Math.ceil((Date.now() - new Date(commits[commits.length - 1]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))
        : 0
    };
  }, [state.versions, state.commits, state.branches]);

  const branchStatistics = useMemo(() => {
    const branches = state.branches;
    
    return branches.reduce((acc, branch) => {
      acc[branch.type] = (acc[branch.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [state.branches]);

  // Data Fetching
  useEffect(() => {
    const fetchVersionControlData = async () => {
      try {
        if (pipelineId) {
          const [versions, branches, commits, tags, history] = await Promise.all([
            getPipelineVersions(pipelineId),
            getVersionBranches(pipelineId),
            getVersionCommits(pipelineId),
            getVersionTags(pipelineId),
            getVersionHistory(pipelineId)
          ]);

          setState(prev => ({
            ...prev,
            versions: versions || [],
            branches: branches || [],
            commits: commits || [],
            tags: tags || [],
            currentVersion: versions?.find(v => v.isLatest) || null,
            activeBranch: branches?.find(b => b.isActive) || null
          }));
        }
      } catch (error) {
        console.error('Error fetching version control data:', error);
      }
    };

    fetchVersionControlData();
  }, [pipelineId]);

  // Backend Integration Functions
  const getPipelineVersions = async (pipelineId: string): Promise<PipelineVersion[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/versions`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching pipeline versions:', error);
      return [];
    }
  };

  const getVersionBranches = async (pipelineId: string): Promise<VersionBranch[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/branches`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching version branches:', error);
      return [];
    }
  };

  const getVersionCommits = async (pipelineId: string): Promise<VersionCommit[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/commits`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching version commits:', error);
      return [];
    }
  };

  const getVersionTags = async (pipelineId: string): Promise<VersionTag[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/tags`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching version tags:', error);
      return [];
    }
  };

  // Version Control Functions
  const handleCreateCommit = useCallback(async (commitData: Partial<VersionCommit>) => {
    try {
      setState(prev => ({ ...prev, isCommitting: true }));
      
      const newCommit = await createPipelineVersion({
        ...commitData,
        pipelineId: pipelineId!,
        author: currentUser?.name || currentUser?.id,
        timestamp: new Date().toISOString()
      });

      setState(prev => ({
        ...prev,
        commits: [newCommit, ...prev.commits],
        selectedCommit: newCommit,
        isCommitting: false
      }));

      trackActivity({
        action: 'create_pipeline_commit',
        resource: 'pipeline',
        details: { commitId: newCommit.id, pipelineId }
      });

      if (onVersionChange) {
        onVersionChange(newCommit as PipelineVersion);
      }
    } catch (error) {
      console.error('Error creating commit:', error);
      setState(prev => ({ ...prev, isCommitting: false }));
    }
  }, [pipelineId, currentUser, createPipelineVersion, trackActivity, onVersionChange]);

  const handleComparePipelines = useCallback(async (version1: PipelineVersion, version2: PipelineVersion) => {
    try {
      setState(prev => ({ ...prev, isComparison: true }));
      
      const versionDiff = await comparePipelineVersions({
        pipelineId: pipelineId!,
        version1: version1.id,
        version2: version2.id
      });

      setState(prev => ({
        ...prev,
        compareVersions: [version1, version2],
        versionDiff,
        isComparison: false,
        isDiffMode: true
      }));

      trackActivity({
        action: 'compare_pipeline_versions',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          version1: version1.id, 
          version2: version2.id 
        }
      });
    } catch (error) {
      console.error('Error comparing versions:', error);
      setState(prev => ({ ...prev, isComparison: false }));
    }
  }, [pipelineId, comparePipelineVersions, trackActivity]);

  const handleMergeBranches = useCallback(async (sourceBranch: VersionBranch, targetBranch: VersionBranch, strategy: string) => {
    try {
      setState(prev => ({ ...prev, isMerging: true }));
      
      const mergeResult = await mergePipelineVersions({
        pipelineId: pipelineId!,
        sourceBranch: sourceBranch.id,
        targetBranch: targetBranch.id,
        strategy: strategy as MergeStrategy,
        mergedBy: currentUser?.id
      });

      setState(prev => ({
        ...prev,
        branches: prev.branches.map(branch => 
          branch.id === targetBranch.id 
            ? { ...branch, lastCommit: mergeResult.mergeCommit }
            : branch
        ),
        commits: [mergeResult.mergeCommit, ...prev.commits],
        isMerging: false
      }));

      trackActivity({
        action: 'merge_pipeline_branches',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          sourceBranch: sourceBranch.id, 
          targetBranch: targetBranch.id,
          strategy
        }
      });
    } catch (error) {
      console.error('Error merging branches:', error);
      setState(prev => ({ ...prev, isMerging: false }));
    }
  }, [pipelineId, currentUser, mergePipelineVersions, trackActivity]);

  const handleRollbackVersion = useCallback(async (version: PipelineVersion) => {
    try {
      setState(prev => ({ ...prev, isRollingBack: true }));
      
      const rollbackResult = await rollbackPipelineVersion({
        pipelineId: pipelineId!,
        targetVersion: version.id,
        rolledBackBy: currentUser?.id,
        reason: `Rollback to version ${version.name}`
      });

      setState(prev => ({
        ...prev,
        currentVersion: rollbackResult.version,
        commits: [rollbackResult.rollbackCommit, ...prev.commits],
        isRollingBack: false
      }));

      trackActivity({
        action: 'rollback_pipeline_version',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          targetVersion: version.id,
          rollbackCommit: rollbackResult.rollbackCommit.id
        }
      });

      if (onVersionChange) {
        onVersionChange(rollbackResult.version);
      }
    } catch (error) {
      console.error('Error rolling back version:', error);
      setState(prev => ({ ...prev, isRollingBack: false }));
    }
  }, [pipelineId, currentUser, rollbackPipelineVersion, trackActivity, onVersionChange]);

  const handleCreateBranch = useCallback(async (branchData: Partial<VersionBranch>) => {
    try {
      const newBranch = await createVersionBranch({
        ...branchData,
        pipelineId: pipelineId!,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString()
      });

      setState(prev => ({
        ...prev,
        branches: [...prev.branches, newBranch]
      }));

      trackActivity({
        action: 'create_pipeline_branch',
        resource: 'pipeline',
        details: { branchId: newBranch.id, pipelineId }
      });

      if (onBranchChange) {
        onBranchChange(newBranch);
      }
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  }, [pipelineId, currentUser, trackActivity, onBranchChange]);

  // Helper Functions
  const createVersionBranch = async (branchData: Partial<VersionBranch>): Promise<VersionBranch> => {
    const response = await fetch(`/api/pipelines/${pipelineId}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create branch');
    }
    
    return response.json();
  };

  // Render Functions
  const renderCommitHistory = () => (
    <div className="space-y-6">
      {/* Commit History Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Commit History</h3>
          <p className="text-sm text-muted-foreground">
            Track all changes and versions of your pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleCreateCommit({})}
            disabled={readonly || state.isCommitting}
            size="sm"
          >
            <GitCommit className="h-4 w-4 mr-2" />
            {state.isCommitting ? 'Committing...' : 'New Commit'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setState(prev => ({ ...prev, isDiffMode: !prev.isDiffMode }))}
          >
            <Compare className="h-4 w-4 mr-2" />
            Compare Mode
          </Button>
        </div>
      </div>

      {/* Commit Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GitCommit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Total Commits</div>
              <div className="text-2xl font-bold">{versionStatistics.totalCommits}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Total Versions</div>
              <div className="text-2xl font-bold">{versionStatistics.totalVersions}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <GitBranch className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Active Branches</div>
              <div className="text-2xl font-bold">{versionStatistics.activeBranches}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Daily Activity</div>
              <div className="text-2xl font-bold">{versionStatistics.averageCommitsPerDay.toFixed(1)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <Input 
          placeholder="Search commits..."
          value={state.searchTerm}
          onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
          className="flex-1"
        />
        <Select 
          value={state.sortBy} 
          onValueChange={(value) => setState(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="timestamp">Date</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="version">Version</SelectItem>
            <SelectItem value="message">Message</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setState(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
        >
          {state.sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Commits Timeline */}
      <div className="space-y-4">
        {state.commits.map((commit, index) => (
          <Card key={commit.id} className={`p-4 ${state.selectedCommit?.id === commit.id ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <GitCommit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                {index < state.commits.length - 1 && (
                  <div className="w-0.5 h-8 bg-border mt-2" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{commit.message || 'Untitled commit'}</div>
                    <Badge variant="outline">{commit.version}</Badge>
                    {commit.isLatest && <Badge>Latest</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{commit.branch}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, selectedCommit: commit }))}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleComparePipelines(commit as PipelineVersion, state.currentVersion!)}>
                          <Compare className="h-4 w-4 mr-2" />
                          Compare with Current
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRollbackVersion(commit as PipelineVersion)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Rollback to This
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {}}>
                          <Tag className="h-4 w-4 mr-2" />
                          Create Tag
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {commit.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(commit.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {commit.id.slice(0, 8)}
                  </div>
                </div>
                
                {commit.description && (
                  <p className="text-sm text-muted-foreground mt-2">{commit.description}</p>
                )}
                
                {commit.changes && commit.changes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {commit.changes.slice(0, 3).map((change, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {change}
                      </Badge>
                    ))}
                    {commit.changes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{commit.changes.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBranchManagement = () => (
    <div className="space-y-6">
      {/* Branch Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Branch Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage pipeline branches and merge workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleCreateBranch({})}
            disabled={readonly}
            size="sm"
          >
            <GitBranch className="h-4 w-4 mr-2" />
            New Branch
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={state.isMerging}
          >
            <GitMerge className="h-4 w-4 mr-2" />
            {state.isMerging ? 'Merging...' : 'Merge Branches'}
          </Button>
        </div>
      </div>

      {/* Branch Statistics */}
      <div className="grid grid-cols-5 gap-4">
        {BRANCH_TYPES.map((branchType) => (
          <Card key={branchType.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${branchType.color}-100 dark:bg-${branchType.color}-900 rounded-lg`}>
                <branchType.icon className={`h-4 w-4 text-${branchType.color}-600 dark:text-${branchType.color}-400`} />
              </div>
              <div>
                <div className="text-sm font-medium">{branchType.name}</div>
                <div className="text-2xl font-bold">{branchStatistics[branchType.id] || 0}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Branches */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Active Branches</h4>
        <div className="space-y-3">
          {state.branches.filter(b => b.isActive).map((branch) => (
            <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <GitBranch className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium">{branch.name}</div>
                  <div className="text-sm text-muted-foreground">{branch.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">{branch.commitCount || 0}</div>
                  <div className="text-muted-foreground">Commits</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{branch.lastActivity || 'N/A'}</div>
                  <div className="text-muted-foreground">Last Activity</div>
                </div>
                <Badge variant={branch.type === 'main' ? "default" : "outline"}>
                  {branch.type}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, activeBranch: branch }))}>
                      <Eye className="h-4 w-4 mr-2" />
                      Switch to Branch
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <GitMerge className="h-4 w-4 mr-2" />
                      Merge Branch
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <Copy className="h-4 w-4 mr-2" />
                      Create from Branch
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Branch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Branch Visualization */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Branch Tree</h4>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
          <div className="text-center text-muted-foreground">
            <GitBranch className="h-12 w-12 mx-auto mb-4" />
            <p>Interactive branch tree visualization</p>
            <p className="text-sm">Visual representation of branch relationships and merge history</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderVersionComparison = () => (
    <div className="space-y-6">
      {/* Comparison Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Version Comparison</h3>
          <p className="text-sm text-muted-foreground">
            Compare different versions to see changes and differences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setState(prev => ({ ...prev, isDiffMode: false, compareVersions: [null, null], versionDiff: null }))}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Clear Comparison
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={state.isComparison}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Diff
          </Button>
        </div>
      </div>

      {/* Version Selector */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="font-medium mb-3">Version A</h4>
          <Select 
            value={state.compareVersions[0]?.id || ''} 
            onValueChange={(value) => {
              const version = filteredVersions.find(v => v.id === value);
              setState(prev => ({ 
                ...prev, 
                compareVersions: [version || null, prev.compareVersions[1]] 
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select first version" />
            </SelectTrigger>
            <SelectContent>
              {filteredVersions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  {version.name} - {version.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.compareVersions[0] && (
            <div className="mt-3 space-y-2">
              <div className="text-sm">
                <span className="font-medium">Author:</span> {state.compareVersions[0].author}
              </div>
              <div className="text-sm">
                <span className="font-medium">Date:</span> {new Date(state.compareVersions[0].timestamp).toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Status:</span> 
                <Badge variant="outline" className="ml-2">{state.compareVersions[0].status}</Badge>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-3">Version B</h4>
          <Select 
            value={state.compareVersions[1]?.id || ''} 
            onValueChange={(value) => {
              const version = filteredVersions.find(v => v.id === value);
              setState(prev => ({ 
                ...prev, 
                compareVersions: [prev.compareVersions[0], version || null] 
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select second version" />
            </SelectTrigger>
            <SelectContent>
              {filteredVersions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  {version.name} - {version.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.compareVersions[1] && (
            <div className="mt-3 space-y-2">
              <div className="text-sm">
                <span className="font-medium">Author:</span> {state.compareVersions[1].author}
              </div>
              <div className="text-sm">
                <span className="font-medium">Date:</span> {new Date(state.compareVersions[1].timestamp).toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Status:</span> 
                <Badge variant="outline" className="ml-2">{state.compareVersions[1].status}</Badge>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Compare Button */}
      {state.compareVersions[0] && state.compareVersions[1] && (
        <div className="flex justify-center">
          <Button 
            onClick={() => handleComparePipelines(state.compareVersions[0]!, state.compareVersions[1]!)}
            disabled={state.isComparison}
            size="lg"
          >
            {state.isComparison ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Compare className="h-5 w-5 mr-2" />
            )}
            {state.isComparison ? 'Comparing...' : 'Compare Versions'}
          </Button>
        </div>
      )}

      {/* Diff Results */}
      {state.versionDiff && (
        <Card className="p-6">
          <h4 className="font-medium mb-4">Comparison Results</h4>
          <div className="space-y-4">
            {/* Diff Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{state.versionDiff.additions || 0}</div>
                <div className="text-sm text-green-600">Additions</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{state.versionDiff.deletions || 0}</div>
                <div className="text-sm text-red-600">Deletions</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{state.versionDiff.modifications || 0}</div>
                <div className="text-sm text-blue-600">Modifications</div>
              </div>
            </div>

            {/* Diff Details */}
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <h5 className="font-medium">Detailed Changes</h5>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="font-mono text-sm space-y-2">
                  {state.diffContent?.lines?.map((line) => (
                    <div key={line.id} className={
                      line.type === 'added' ? 'text-green-600' :
                      line.type === 'removed' ? 'text-red-600' :
                      line.type === 'modified' ? 'text-yellow-600' :
                      'text-gray-600'
                    }>
                      {line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}
                      {line.content}
                    </div>
                  )) || (
                    <div className="text-gray-500">Loading diff content...</div>
                  )}
                  <div className="text-blue-600">~ Modified output schema configuration</div>
                  <div className="text-blue-600">~ Updated resource allocation settings</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderVersionTags = () => (
    <div className="space-y-6">
      {/* Tags Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Version Tags</h3>
          <p className="text-sm text-muted-foreground">
            Manage release tags and version markers
          </p>
        </div>
        <Button size="sm">
          <Tag className="h-4 w-4 mr-2" />
          Create Tag
        </Button>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.tags.map((tag) => (
          <Card key={tag.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{tag.name}</span>
                </div>
                <Badge variant={tag.type === 'release' ? "default" : "secondary"}>
                  {tag.type}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">{tag.description}</p>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Version: {tag.version}</div>
                <div>Created: {new Date(tag.createdAt).toLocaleDateString()}</div>
                <div>Author: {tag.author}</div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`pipeline-version-control ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Pipeline Version Control</h2>
            <p className="text-muted-foreground">
              Comprehensive version management system for your data governance pipelines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Current: {state.currentVersion?.version || 'No version'}
            </Badge>
            <Badge variant="secondary">
              Branch: {state.activeBranch?.name || 'main'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="commits">Commit History</TabsTrigger>
            <TabsTrigger value="branches">Branch Management</TabsTrigger>
            <TabsTrigger value="comparison">Version Comparison</TabsTrigger>
            <TabsTrigger value="tags">Version Tags</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="commits" className="space-y-6">
              {renderCommitHistory()}
            </TabsContent>

            <TabsContent value="branches" className="space-y-6">
              {renderBranchManagement()}
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              {renderVersionComparison()}
            </TabsContent>

            <TabsContent value="tags" className="space-y-6">
              {renderVersionTags()}
            </TabsContent>
          </div>
        </Tabs>

        {/* Loading States */}
        {(state.isCommitting || state.isMerging || state.isRollingBack || state.isComparison) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <div>
                  <div className="font-medium">
                    {state.isCommitting && "Creating new commit..."}
                    {state.isMerging && "Merging branches..."}
                    {state.isRollingBack && "Rolling back version..."}
                    {state.isComparison && "Comparing versions..."}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Please wait while we process your request
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PipelineVersionControl;