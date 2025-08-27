// Workflow Version Control APIs - aligned to backend
// Maps to: /api/v1/workflow/version-control
import { ApiClient } from '@/lib/api-client';

export class VersionControlAPIService {
  private apiClient: ApiClient;
  private baseUrl: string;
  
  constructor() {
    this.apiClient = new ApiClient();
    this.baseUrl = '/api/v1/workflow/version-control';
  }
  
  // Version Management
  async createVersion(payload: any) { 
    return this.apiClient.post(`${this.baseUrl}/versions`, payload); 
  }
  
  async updateVersion(id: string, payload: any) { 
    return this.apiClient.put(`${this.baseUrl}/versions/${id}`, payload); 
  }
  
  async deleteVersion(id: string) { 
    return this.apiClient.delete(`${this.baseUrl}/versions/${id}`); 
  }

  async cloneVersion(id: string, payload?: any) {
    return this.apiClient.post(`${this.baseUrl}/versions/${id}/clone`, payload || {});
  }
  
  // Version Retrieval
  async getVersions(entityType: string, entityId: string) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/versions`);
  }
  
  async getBranches(entityType: string, entityId: string) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/branches`);
  }
  
  async createBranch(entityType: string, entityId: string, payload: { name: string; from?: string; description?: string }) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/branches`, payload);
  }

  async deleteBranch(entityType: string, entityId: string, branchName: string) {
    return this.apiClient.delete(`${this.baseUrl}/${entityType}/${entityId}/branches/${encodeURIComponent(branchName)}`);
  }

  async switchBranch(entityType: string, entityId: string, branchName: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/branches/${encodeURIComponent(branchName)}/switch`, {});
  }

  async mergeBranch(entityType: string, entityId: string, sourceBranch: string, targetBranch: string, strategy?: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/branches/merge`, { sourceBranch, targetBranch, strategy });
  }
  
  async getVersionHistory(entityType: string, entityId: string) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/history`);
  }

  // Comparison and Diff
  async compareVersions(entityType: string, entityId: string, version1Id: string, version2Id: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/compare`, { version1Id, version2Id });
  }

  async generateDiff(entityType: string, entityId: string, version1Id: string, version2Id: string, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/diff`, { version1Id, version2Id, options });
  }

  async applyDiff(entityType: string, entityId: string, baseVersionId: string, diff: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/apply-diff`, { baseVersionId, diff });
  }

  // Merging and Conflicts
  async mergeVersions(entityType: string, entityId: string, sourceVersionId: string, targetVersionId: string, mergeStrategy?: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/merge`, { sourceVersionId, targetVersionId, mergeStrategy });
  }

  async resolveConflict(entityType: string, entityId: string, conflictId: string, resolution: 'ours' | 'theirs' | 'manual', content?: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/conflicts/${conflictId}/resolve`, { resolution, content });
  }

  async abortMerge(entityType: string, entityId: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/merge/abort`, {});
  }

  // Tags
  async getTags(entityType: string, entityId: string) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/tags`);
  }

  async createTag(entityType: string, entityId: string, payload: { name: string; description?: string; versionId: string }) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/tags`, payload);
  }

  async deleteTag(entityType: string, entityId: string, tagId: string) {
    return this.apiClient.delete(`${this.baseUrl}/${entityType}/${entityId}/tags/${tagId}`);
  }

  async moveTag(entityType: string, entityId: string, tagId: string, targetVersionId: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/tags/${tagId}/move`, { targetVersionId });
  }

  // Validation & Testing
  async validateVersion(entityType: string, entityId: string, versionId: string, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/versions/${versionId}/validate`, options || {});
  }

  async testVersion(entityType: string, entityId: string, versionId: string, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/versions/${versionId}/test`, options || {});
  }

  // Analytics
  async getVersionAnalytics(entityType: string, entityId: string, dateRange?: { start?: string; end?: string }) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/analytics`, { params: dateRange });
  }

  async generateReport(entityType: string, entityId: string, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/reports`, options || {});
  }

  // Audit
  async getAuditLog(entityType: string, entityId: string) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/audit`);
  }

  async logEvent(entityType: string, entityId: string, event: { event: string; actor?: string; metadata?: any }) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/audit`, event);
  }

  async generateAuditReport(entityType: string, entityId: string, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/audit/report`, options || {});
  }

  // Configuration
  async getConfiguration(entityType: string, entityId: string) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/configuration`);
  }

  async updateConfiguration(entityType: string, entityId: string, updates: any) {
    return this.apiClient.put(`${this.baseUrl}/${entityType}/${entityId}/configuration`, updates);
  }

  async resetConfiguration(entityType: string, entityId: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/configuration/reset`, {});
  }

  // Permissions (wrapping RBAC for version scope)
  async getPermissions(entityType: string, entityId: string) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/permissions`);
  }

  async grantPermission(entityType: string, entityId: string, permission: string, userId: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/permissions/grant`, { permission, userId });
  }

  async revokePermission(entityType: string, entityId: string, permission: string, userId: string) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/permissions/revoke`, { permission, userId });
  }

  // Backup & Restore
  async listBackups(entityType: string, entityId: string) {
    return this.apiClient.get(`${this.baseUrl}/${entityType}/${entityId}/backups`);
  }

  async createBackup(entityType: string, entityId: string, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/backups`, options || {});
  }

  async restoreBackup(entityType: string, entityId: string, backupId: string, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/backups/${backupId}/restore`, options || {});
  }

  // Rollback / Revert
  async revertVersion(entityType: string, entityId: string, versionId: string, payload?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/versions/${versionId}/revert`, payload || {});
  }

  async rollbackVersion(entityType: string, entityId: string, fromVersionId: string, toVersionId: string, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/${entityType}/${entityId}/versions/${fromVersionId}/rollback`, { toVersionId, ...options });
  }
}

export const versionControlAPI = new VersionControlAPIService();
export default versionControlAPI;

export const { createVersion, updateVersion, deleteVersion, revertVersion } = versionControlAPI as any;


