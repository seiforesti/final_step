"use client";

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import versionControlAPI from '../services/version-control-apis';
import { useRBACStateManager } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/useRBACState';
import type {
  WorkflowVersion,
  VersionBranch,
  VersionHistory,
  VersionComparison,
  VersionTag,
  VersionAnalytics,
  VersionAudit,
  VersionConfiguration,
  VersionPermission
} from '../types/version.types';

const ENTITY_TYPE = 'workflow';

export const useWorkflowVersions = (workflowId?: string) => {
  const rbac = useRBACStateManager();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'versions'],
    queryFn: () => versionControlAPI.getVersions(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId && rbac.isAuthenticated,
    staleTime: 30000,
    retry: 2
  });

  const createVersion = useMutation({
    mutationFn: (payload: Partial<WorkflowVersion>) => versionControlAPI.createVersion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'versions'] });
    }
  });

  const updateVersion = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WorkflowVersion> }) =>
      versionControlAPI.updateVersion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'versions'] });
    }
  });

  const deleteVersion = useMutation({
    mutationFn: (id: string) => versionControlAPI.deleteVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'versions'] });
    }
  });

  const cloneVersion = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: any }) => versionControlAPI.cloneVersion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'versions'] });
    }
  });

  return {
    versions: (data as any)?.versions || data || [],
    loading: isLoading,
    error: (error as any)?.message || null,
    refreshVersions: refetch,
    createVersion: (payload: Partial<WorkflowVersion>) => createVersion.mutateAsync(payload),
    updateVersion: (id: string, updates: Partial<WorkflowVersion>) => updateVersion.mutateAsync({ id, updates }),
    deleteVersion: (id: string) => deleteVersion.mutateAsync(id),
    cloneVersion: (id: string, payload?: any) => cloneVersion.mutateAsync({ id, payload })
  };
};

export const useVersionBranches = (workflowId?: string) => {
  const rbac = useRBACStateManager();
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'branches'],
    queryFn: () => versionControlAPI.getBranches(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId && rbac.isAuthenticated,
    staleTime: 30000
  });

  const createBranch = useMutation({
    mutationFn: (payload: { name: string; from?: string; description?: string }) =>
      versionControlAPI.createBranch(ENTITY_TYPE, workflowId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'branches'] })
  });

  const deleteBranch = useMutation({
    mutationFn: (branchName: string) => versionControlAPI.deleteBranch(ENTITY_TYPE, workflowId as string, branchName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'branches'] })
  });

  const switchBranch = useMutation({
    mutationFn: (branchName: string) => versionControlAPI.switchBranch(ENTITY_TYPE, workflowId as string, branchName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'branches'] })
  });

  const mergeBranch = useMutation({
    mutationFn: ({ sourceBranch, targetBranch, strategy }: { sourceBranch: string; targetBranch: string; strategy?: string }) =>
      versionControlAPI.mergeBranch(ENTITY_TYPE, workflowId as string, sourceBranch, targetBranch, strategy),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'branches'] })
  });

  const branches: VersionBranch[] = (data as any)?.branches || data || [];
  const activeBranch = useMemo(() => branches.find(b => (b as any).isDefault) || null, [branches]);

  return {
    branches,
    activeBranch,
    refreshBranches: refetch,
    createBranch: (payload: { name: string; from?: string; description?: string }) => createBranch.mutateAsync(payload),
    deleteBranch: (branchName: string) => deleteBranch.mutateAsync(branchName),
    switchBranch: (branchName: string) => switchBranch.mutateAsync(branchName),
    mergeBranch: (sourceBranch: string, targetBranch: string, strategy?: string) =>
      mergeBranch.mutateAsync({ sourceBranch, targetBranch, strategy })
  };
};

export const useVersionHistory = (workflowId?: string) => {
  const rbac = useRBACStateManager();

  const { data, refetch } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'history'],
    queryFn: () => versionControlAPI.getVersionHistory(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId && rbac.isAuthenticated,
    staleTime: 60000
  });

  async function getVersionHistory(versionId: string) {
    // If specific version history needed, backend should support filter; fallback to list
    const all = await versionControlAPI.getVersionHistory(ENTITY_TYPE, workflowId as string);
    return (all as any)?.history?.filter((h: VersionHistory) => (h as any).versionId === versionId) || [];
  }

  async function compareVersionHistory(version1Id: string, version2Id: string) {
    return versionControlAPI.compareVersions(ENTITY_TYPE, workflowId as string, version1Id, version2Id);
  }

  return {
    history: (data as any)?.history || data || [],
    refreshHistory: refetch,
    getVersionHistory,
    compareVersionHistory
  };
};

export const useVersionComparison = (workflowId?: string) => {
  const queryClient = useQueryClient();

  const compareVersions = useMutation({
    mutationFn: ({ version1Id, version2Id }: { version1Id: string; version2Id: string }) =>
      versionControlAPI.compareVersions(ENTITY_TYPE, workflowId as string, version1Id, version2Id)
  });

  const generateDiff = useMutation({
    mutationFn: ({ version1Id, version2Id, options }: { version1Id: string; version2Id: string; options?: any }) =>
      versionControlAPI.generateDiff(ENTITY_TYPE, workflowId as string, version1Id, version2Id, options)
  });

  const applyDiff = useMutation({
    mutationFn: ({ baseVersionId, diff }: { baseVersionId: string; diff: any }) =>
      versionControlAPI.applyDiff(ENTITY_TYPE, workflowId as string, baseVersionId, diff),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'versions'] })
  });

  return {
    comparison: null as VersionComparison | null,
    diff: null as any,
    compareVersions: (v1: string, v2: string) => compareVersions.mutateAsync({ version1Id: v1, version2Id: v2 }),
    generateDiff: (v1: string, v2: string, options?: any) => generateDiff.mutateAsync({ version1Id: v1, version2Id: v2, options }),
    applyDiff: (baseVersionId: string, diff: any) => applyDiff.mutateAsync({ baseVersionId, diff })
  };
};

export const useVersionMerging = (workflowId?: string) => {
  const mergeVersions = useMutation({
    mutationFn: ({ sourceVersionId, targetVersionId, mergeStrategy }: { sourceVersionId: string; targetVersionId: string; mergeStrategy?: string }) =>
      versionControlAPI.mergeVersions(ENTITY_TYPE, workflowId as string, sourceVersionId, targetVersionId, mergeStrategy)
  });

  const resolveConflict = useMutation({
    mutationFn: ({ conflictId, resolution, content }: { conflictId: string; resolution: 'ours' | 'theirs' | 'manual'; content?: string }) =>
      versionControlAPI.resolveConflict(ENTITY_TYPE, workflowId as string, conflictId, resolution, content)
  });

  const abortMerge = useMutation({
    mutationFn: () => versionControlAPI.abortMerge(ENTITY_TYPE, workflowId as string)
  });

  return {
    mergeStatus: null as any,
    conflicts: [] as any[],
    mergeVersions: (sourceVersionId: string, targetVersionId: string, mergeStrategy?: string) =>
      mergeVersions.mutateAsync({ sourceVersionId, targetVersionId, mergeStrategy }),
    resolveConflict: (conflictId: string, resolution: 'ours' | 'theirs' | 'manual', content?: string) =>
      resolveConflict.mutateAsync({ conflictId, resolution, content }),
    abortMerge: () => abortMerge.mutateAsync()
  };
};

export const useVersionTags = (workflowId?: string) => {
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'tags'],
    queryFn: () => versionControlAPI.getTags(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId,
    staleTime: 30000
  });

  const createTag = useMutation({
    mutationFn: (payload: { name: string; description?: string; versionId: string }) =>
      versionControlAPI.createTag(ENTITY_TYPE, workflowId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'tags'] })
  });

  const deleteTag = useMutation({
    mutationFn: (tagId: string) => versionControlAPI.deleteTag(ENTITY_TYPE, workflowId as string, tagId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'tags'] })
  });

  const moveTag = useMutation({
    mutationFn: ({ tagId, targetVersionId }: { tagId: string; targetVersionId: string }) =>
      versionControlAPI.moveTag(ENTITY_TYPE, workflowId as string, tagId, targetVersionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'tags'] })
  });

  return {
    tags: (data as any)?.tags || data || [] as VersionTag[],
    refreshTags: refetch,
    createTag: (payload: { name: string; description?: string; versionId: string }) => createTag.mutateAsync(payload),
    deleteTag: (tagId: string) => deleteTag.mutateAsync(tagId),
    moveTag: (tagId: string, targetVersionId: string) => moveTag.mutateAsync({ tagId, targetVersionId })
  };
};

export const useVersionValidation = (workflowId?: string) => {
  const validateVersion = useMutation({
    mutationFn: ({ versionId, options }: { versionId: string; options?: any }) =>
      versionControlAPI.validateVersion(ENTITY_TYPE, workflowId as string, versionId, options)
  });

  const testVersion = useMutation({
    mutationFn: ({ versionId, options }: { versionId: string; options?: any }) =>
      versionControlAPI.testVersion(ENTITY_TYPE, workflowId as string, versionId, options)
  });

  return {
    validation: null as any,
    validateVersion: (versionId: string, options?: any) => validateVersion.mutateAsync({ versionId, options }),
    testVersion: (versionId: string, options?: any) => testVersion.mutateAsync({ versionId, options })
  };
};

export const useVersionAnalytics = (workflowId?: string) => {
  const { data, refetch } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'analytics'],
    queryFn: () => versionControlAPI.getVersionAnalytics(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId,
    staleTime: 60000
  });

  const generateReport = useMutation({
    mutationFn: (options?: any) => versionControlAPI.generateReport(ENTITY_TYPE, workflowId as string, options)
  });

  return {
    analytics: (data as any)?.analytics || data || ({} as VersionAnalytics),
    metrics: (data as any)?.metrics || {},
    refreshAnalytics: refetch,
    generateReport: (options?: any) => generateReport.mutateAsync(options)
  };
};

export const useVersionAudit = (workflowId?: string) => {
  const { data, refetch } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'audit'],
    queryFn: () => versionControlAPI.getAuditLog(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId,
    staleTime: 60000
  });

  const logEvent = useMutation({
    mutationFn: (event: { event: string; actor?: string; metadata?: any }) =>
      versionControlAPI.logEvent(ENTITY_TYPE, workflowId as string, event)
  });

  const generateAuditReport = useMutation({
    mutationFn: (options?: any) => versionControlAPI.generateAuditReport(ENTITY_TYPE, workflowId as string, options)
  });

  return {
    auditLog: (data as any)?.audit || data || [] as VersionAudit[],
    refreshAudit: refetch,
    logEvent: (event: { event: string; actor?: string; metadata?: any }) => logEvent.mutateAsync(event),
    generateAuditReport: (options?: any) => generateAuditReport.mutateAsync(options)
  };
};

export const useVersionConfiguration = (workflowId?: string) => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'configuration'],
    queryFn: () => versionControlAPI.getConfiguration(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId,
    staleTime: 60000
  });

  const updateConfiguration = useMutation({
    mutationFn: (updates: any) => versionControlAPI.updateConfiguration(ENTITY_TYPE, workflowId as string, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'configuration'] })
  });

  const resetConfiguration = useMutation({
    mutationFn: () => versionControlAPI.resetConfiguration(ENTITY_TYPE, workflowId as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['version-control', ENTITY_TYPE, workflowId, 'configuration'] })
  });

  return {
    configuration: (data as any)?.configuration || data || ({} as VersionConfiguration),
    updateConfiguration: (updates: any) => updateConfiguration.mutateAsync(updates),
    resetConfiguration: () => resetConfiguration.mutateAsync()
  };
};

export const useVersionPermissions = (userId?: string, workflowId?: string) => {
  const { data, refetch } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'permissions', userId],
    queryFn: () => versionControlAPI.getPermissions(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId,
    staleTime: 60000
  });

  const checkPermission = (permission: string) => {
    const list: VersionPermission[] = (data as any)?.permissions || data || [];
    return list.some(p => p.name === permission);
  };

  const grantPermission = useMutation({
    mutationFn: ({ permission, userId }: { permission: string; userId: string }) =>
      versionControlAPI.grantPermission(ENTITY_TYPE, workflowId as string, permission, userId)
  });

  const revokePermission = useMutation({
    mutationFn: ({ permission, userId }: { permission: string; userId: string }) =>
      versionControlAPI.revokePermission(ENTITY_TYPE, workflowId as string, permission, userId)
  });

  return {
    userPermissions: (data as any)?.permissions || data || [] as VersionPermission[],
    checkPermission,
    grantPermission: (permission: string, targetUserId: string) => grantPermission.mutateAsync({ permission, userId: targetUserId }),
    revokePermission: (permission: string, targetUserId: string) => revokePermission.mutateAsync({ permission, userId: targetUserId })
  };
};

export const useVersionBackup = (workflowId?: string) => {
  const { data, refetch } = useQuery({
    queryKey: ['version-control', ENTITY_TYPE, workflowId, 'backups'],
    queryFn: () => versionControlAPI.listBackups(ENTITY_TYPE, workflowId as string),
    enabled: !!workflowId,
    staleTime: 60000
  });

  const createBackup = useMutation({
    mutationFn: (options?: any) => versionControlAPI.createBackup(ENTITY_TYPE, workflowId as string, options),
    onSuccess: () => refetch()
  });

  const restoreBackup = useMutation({
    mutationFn: ({ backupId, options }: { backupId: string; options?: any }) =>
      versionControlAPI.restoreBackup(ENTITY_TYPE, workflowId as string, backupId, options),
    onSuccess: () => refetch()
  });

  return {
    backupStatus: (data as any)?.status || null,
    listBackups: () => data || [],
    createBackup: (options?: any) => createBackup.mutateAsync(options),
    restoreBackup: (backupId: string, options?: any) => restoreBackup.mutateAsync({ backupId, options })
  };
};

