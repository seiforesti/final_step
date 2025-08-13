// --- Group & Deny Assignment Models ---
// RBAC API prefix for all endpoints
const RBAC_PREFIX = "/sensitivity-labels/rbac";
export interface Group {
  id: number;
  name: string;
  description?: string;
  users?: User[];
  roles?: Role[];
}

export interface DenyAssignment {
  id: number;
  principal_type: "user" | "group";
  principal_id: number;
  action: string;
  resource: string;
  conditions?: string | Record<string, any>;
}

// --- Selected Roles Permissions (bulk) ---
export interface RolePermissionsBulk {
  role_id: number;
  permissions: Permission[];
}

export const useSelectedRolesPermissions = (roleIds: number[] | undefined) =>
  useQuery<RolePermissionsBulk[], Error>({
    queryKey: ["selectedRolesPermissions", roleIds],
    queryFn: async () => {
      if (!roleIds || roleIds.length === 0) return [];
      const { data } = await axios.post(
        `${RBAC_PREFIX}/roles/selected-permissions`,
        roleIds
      );
      return data;
    },
    enabled: !!roleIds && roleIds.length > 0,
  });
// --- Groups ---
export const useGroups = () =>
  useQuery<Group[], Error>({
    queryKey: ["groups"],
    queryFn: async () => (await axios.get(`${RBAC_PREFIX}/groups`)).data,
  });

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      axios.post(`${RBAC_PREFIX}/groups`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      name,
      description,
    }: {
      groupId: number;
      name?: string;
      description?: string;
    }) => axios.put(`${RBAC_PREFIX}/groups/${groupId}`, { name, description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) =>
      axios.delete(`${RBAC_PREFIX}/groups/${groupId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
};

export const useAssignUserToGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      userIds,
    }: {
      groupId: number;
      userIds: number[];
    }) => axios.post(`${RBAC_PREFIX}/groups/${groupId}/add-user`, userIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
};

export const useRemoveUserFromGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      axios.post(`${RBAC_PREFIX}/groups/${groupId}/remove-user`, {
        user_id: userId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
};

export const useAssignRoleToGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      roleIds,
      resourceType,
      resourceId,
    }: {
      groupId: number;
      roleIds: number[];
      resourceType?: string;
      resourceId?: string;
    }) =>
      axios.post(`${RBAC_PREFIX}/groups/${groupId}/assign-role`, {
        role_ids: roleIds,
        resource_type: resourceType,
        resource_id: resourceId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
};

export const useRemoveRoleFromGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, roleId }: { groupId: number; roleId: number }) =>
      axios.post(`${RBAC_PREFIX}/groups/${groupId}/remove-role`, {
        role_id: roleId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
};

// --- Deny Assignments ---
export const useDenyAssignments = (params?: {
  principal_type?: string;
  principal_id?: number;
}) =>
  useQuery<DenyAssignment[], Error>({
    queryKey: ["deny-assignments", params],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/deny-assignments`, { params })).data,
  });

export const useCreateDenyAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      principal_type: "user" | "group";
      principal_id: number;
      action: string;
      resource: string;
      conditions?: any;
    }) => axios.post(`${RBAC_PREFIX}/deny-assignments`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["deny-assignments"] }),
  });
};

export const useDeleteDenyAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (denyAssignmentId: number) =>
      axios.delete(`${RBAC_PREFIX}/deny-assignments/${denyAssignmentId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["deny-assignments"] }),
  });
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";

// --- RBAC Models (from backend auth_models.py) ---
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  action: string;
  resource: string;
  conditions?: string | Record<string, any>;
  is_effective?: boolean;
  note?: string;
}

export interface User {
  id: number;
  email: string;
  roles: string[];
  permissions: Permission[];
  isActive: boolean;
}

export interface ResourceRole {
  id: number;
  user_id: number;
  role_id: number;
  resource_type: string;
  resource_id: string;
  assigned_at: string;
}

export interface AccessRequest {
  id: number;
  user_id: number;
  resource_type: string;
  resource_id: string;
  requested_role: string;
  justification: string;
  status: string;
  review_note?: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface RbacAuditLog {
  id: number;
  action: string;
  performed_by: string;
  target_user?: string;
  resource_type?: string;
  resource_id?: string;
  role?: string;
  status?: string;
  note?: string;
  timestamp: string;
}

// --- RBAC API Hooks (all endpoints under /rbac) ---

// Roles
export const useRoles = () =>
  useQuery<Role[], Error>({
    queryKey: ["roles"],
    queryFn: async () => (await axios.get(`${RBAC_PREFIX}/roles`)).data,
  });

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => axios.post(`${RBAC_PREFIX}/roles`, { name, description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      name,
      description,
    }: {
      roleId: number;
      name: string;
      description?: string;
    }) => axios.put(`${RBAC_PREFIX}/roles/${roleId}`, { name, description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) =>
      axios.delete(`${RBAC_PREFIX}/roles/${roleId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

// Permissions
export const usePermissions = () =>
  useQuery<Permission[], Error>({
    queryKey: ["permissions"],
    queryFn: async () => (await axios.get(`${RBAC_PREFIX}/permissions`)).data,
  });

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      action: string;
      resource: string;
      conditions?: string;
    }) => axios.post(`${RBAC_PREFIX}/permissions`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      permissionId,
      action,
      resource,
      conditions,
    }: {
      permissionId: number;
      action?: string;
      resource?: string;
      conditions?: string;
    }) =>
      axios.put(`${RBAC_PREFIX}/permissions/${permissionId}`, {
        action,
        resource,
        conditions,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: number) =>
      axios.delete(`${RBAC_PREFIX}/permissions/${permissionId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });
};

// Users
export const useUsers = () =>
  useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => (await axios.get(`${RBAC_PREFIX}/users`)).data,
  });

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      axios.post(`${RBAC_PREFIX}/users/${userId}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      axios.post(`${RBAC_PREFIX}/users/${userId}/reactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useBulkAssignRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      user_ids,
      role_id,
    }: {
      user_ids: number[];
      role_id: number;
    }) =>
      axios.post(`${RBAC_PREFIX}/users/bulk-assign-roles`, {
        user_ids,
        role_id,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useBulkRemoveRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_ids: number[]; role_id: number }) =>
      axios.post(`${RBAC_PREFIX}/users/bulk-remove-roles`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

// --- User Management ---
export const useRemoveRoleFromUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      axios.post(`${RBAC_PREFIX}/users/${userId}/remove-role`, {
        role_id: roleId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      axios.post(`${RBAC_PREFIX}/users/${userId}/activate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

// --- Role/Permission Assignment (Role <-> Permission) ---
export const useAssignPermissionToRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: number;
      permissionId: number;
    }) =>
      axios.post(`${RBAC_PREFIX}/roles/bulk-assign-permissions`, {
        role_ids: [roleId],
        permission_id: permissionId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: number;
      permissionId: number;
    }) =>
      axios.post(`${RBAC_PREFIX}/roles/bulk-remove-permissions`, {
        role_ids: [roleId],
        permission_id: permissionId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useBulkAssignPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { role_ids: number[]; permission_id: number }) =>
      axios.post(`${RBAC_PREFIX}/roles/bulk-assign-permissions`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

// --- Bulk Remove Permissions from Roles ---
export const useBulkRemovePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { role_ids: number[]; permission_id: number }) =>
      axios.post(`${RBAC_PREFIX}/roles/bulk-remove-permissions`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

// --- Audit Logs (simple list, not filtered) ---
export const useAuditLogsSimple = (params?: {
  skip?: number;
  limit?: number;
}) =>
  useQuery<{ logs: RbacAuditLog[]; skip: number; limit: number }, Error>({
    queryKey: ["audit-logs-simple", params],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/audit-logs`, { params })).data,
  });

// Access Requests (delegation)
export const useAccessRequests = (params?: {
  user_id?: number;
  status?: string;
}) =>
  useQuery<AccessRequest[], Error>({
    queryKey: ["access-requests", params],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/access-requests`, { params })).data,
  });

export const useRequestAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      user_id: number;
      resource_type: string;
      resource_id: string;
      requested_role: string;
      justification: string;
    }) => axios.post(`${RBAC_PREFIX}/request-access`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["access-requests"] }),
  });
};

export const useReviewAccessRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      request_id: number;
      approve: boolean;
      review_note?: string;
    }) => axios.post(`${RBAC_PREFIX}/access-review`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["access-requests"] }),
  });
};

export const useTriggerAccessReview = () =>
  useMutation({
    mutationFn: () => axios.post(`${RBAC_PREFIX}/access-review/trigger`),
  });

// Built-in roles
export const useBuiltinRoles = () =>
  useQuery<{ name: string; description: string }[], Error>({
    queryKey: ["builtin-roles"],
    queryFn: async () => (await axios.get(`${RBAC_PREFIX}/builtin-roles`)).data,
  });

// ABAC test
/**
 * Test whether a user is allowed to perform an action on a resource under specific ABAC conditions.
 * @param data { user_id, action, resource, conditions }
 * @returns { allowed: boolean }
 */
/**
 * Test whether a user is allowed to perform an action on a resource under specific ABAC conditions.
 * @param data { user_id, action, resource, conditions }
 * @returns { allowed: boolean }
 */
export const useTestAbac = () => {
  return useMutation({
    mutationFn: (data: {
      user_id: number;
      action: string;
      resource: string;
      conditions: Record<string, any>;
    }) => axios.post(`${RBAC_PREFIX}/test-abac`, data),
  });
};

/**
 * Test ABAC conditions for the current user
 * @param data { permission, context }
 * @returns Promise resolving to { hasAccess: boolean }
 */
export const testABAC = async (data: {
  permission: string;
  context: Record<string, any>;
}): Promise<{ hasAccess: boolean }> => {
  try {
    // Parse the permission key to extract action and resource
    const [action, resource] = data.permission.split(".");

    // Get current user ID from session or local storage
    const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userInfo.id;

    if (!userId) {
      return { hasAccess: false };
    }

    const response = await axios.post(`${RBAC_PREFIX}/test-abac`, {
      user_id: userId,
      action,
      resource,
      conditions: data.context,
    });

    return { hasAccess: response.data.allowed };
  } catch (error) {
    console.error("ABAC test failed:", error);
    return { hasAccess: false };
  }
};

/**
 * Fetch current user's permissions
 * @returns Promise resolving to array of Permission objects
 */
export const fetchCurrentUserPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await axios.get(`${RBAC_PREFIX}/me`);
    return response.data.permissions || [];
  } catch (error) {
    console.error("Failed to fetch user permissions:", error);
    return [];
  }
};

/**
 * Fetch current user's flat permissions (array of strings)
 * @returns Promise resolving to array of permission strings
 */
export const fetchCurrentUserFlatPermissions = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${RBAC_PREFIX}/me/flat-permissions`);
    // Use the correct key from backend response
    return response.data.flatPermissions || [];
  } catch (error) {
    console.error("Failed to fetch user flat permissions:", error);
    return [];
  }
};

// Role Assignments (resource-level)
export const useRoleAssignments = (params?: {
  user_id?: number;
  role_id?: number;
  resource_type?: string;
  resource_id?: string;
}) =>
  useQuery<ResourceRole[], Error>({
    queryKey: ["role-assignments", params],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/role-assignments`, { params })).data,
  });

export const useResourceRoleAssignments = (params?: {
  user_id?: number;
  resource_type?: string;
  resource_id?: string;
}) =>
  useQuery<ResourceRole[], Error>({
    queryKey: ["role-assignments", params],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/role-assignments`, { params })).data,
  });

export const useResourceRolesForResource = (resourceId: number) =>
  useQuery<ResourceRoleAssignment[], Error>({
    queryKey: ["resourceRoles", resourceId],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/resources/${resourceId}/roles`)).data,
    enabled: !!resourceId,
  });

export const useAssignRoleScope = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      user_id: number;
      role_id: number;
      resource_type: string;
      resource_id: string;
    }) => axios.post(`${RBAC_PREFIX}/assign-role-scope`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["role-assignments"] }),
  });
};

// --- Condition Templates ---
export interface ConditionTemplate {
  id?: number;
  label: string;
  value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useConditionTemplates = () =>
  useQuery<ConditionTemplate[], Error>({
    queryKey: ["condition-templates"],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/condition-templates`)).data,
  });

export const usePrebuiltConditionTemplates = () =>
  useQuery<ConditionTemplate[], Error>({
    queryKey: ["prebuilt-condition-templates"],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/condition-templates/helpers`)).data,
  });

export const useCreateConditionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConditionTemplate & { from_prebuilt?: boolean }) =>
      axios.post(`${RBAC_PREFIX}/condition-templates`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["condition-templates"] }),
  });
};

export const useUpdateConditionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: ConditionTemplate) =>
      axios.put(`${RBAC_PREFIX}/condition-templates/${id}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["condition-templates"] }),
  });
};

export const useDeleteConditionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      axios.delete(`${RBAC_PREFIX}/condition-templates/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["condition-templates"] }),
  });
};

// --- Condition Validation ---
export const useValidateCondition = () => {
  return useMutation({
    mutationFn: (condition: Record<string, any>) =>
      axios.post(`${RBAC_PREFIX}/validate-condition`, condition),
  });
};

// --- Role Inheritance ---
export const useRoleParents = (roleId: number) =>
  useQuery<Role[], Error>({
    queryKey: ["role", roleId, "parents"],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/roles/${roleId}/parents`)).data,
    enabled: !!roleId,
  });

export const useRoleChildren = (roleId: number) =>
  useQuery<Role[], Error>({
    queryKey: ["role", roleId, "children"],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/roles/${roleId}/children`)).data,
    enabled: !!roleId,
  });

export const useAddRoleParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, parentId }: { roleId: number; parentId: number }) =>
      axios.post(`${RBAC_PREFIX}/roles/${roleId}/parents`, parentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["role", variables.roleId, "parents"],
      });
      queryClient.invalidateQueries({
        queryKey: ["role", variables.parentId, "children"],
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useRemoveRoleParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, parentId }: { roleId: number; parentId: number }) =>
      axios.delete(`${RBAC_PREFIX}/roles/${roleId}/parents/${parentId}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["role", variables.roleId, "parents"],
      });
      queryClient.invalidateQueries({
        queryKey: ["role", variables.parentId, "children"],
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useRoleEffectivePermissions = (roleId: number) =>
  useQuery<Permission[], Error>({
    queryKey: ["role", roleId, "effective-permissions"],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/roles/${roleId}/effective-permissions`))
        .data,
    enabled: !!roleId,
  });

// --- User Effective Permissions ---
// --- User Effective Permissions (v2, unified logic) ---
export const useUserEffectivePermissions = (userId: number) =>
  useQuery<Permission[], Error>({
    queryKey: ["user", userId, "effective-permissions-v2"],
    queryFn: async () =>
      (
        await axios.get(
          `${RBAC_PREFIX}/users/${userId}/effective-permissions-v2`
        )
      ).data,
    enabled: !!userId,
  });

// --- Entity Audit Log ---
export interface AuditLog {
  id: number;
  action: string;
  performed_by: string;
  entity_type?: string;
  entity_id?: string;
  before_state?: string | Record<string, any>;
  after_state?: string | Record<string, any>;
  correlation_id?: string;
  actor_ip?: string;
  actor_device?: string;
  api_client?: string;
  extra_metadata?: string | Record<string, any>;
  target_user?: string;
  resource_type?: string;
  resource_id?: string;
  role?: string;
  status?: string;
  note?: string;
  timestamp: string;
}

export const useEntityAuditLogs = (
  entityType: string,
  entityId: string,
  limit = 100
) =>
  useQuery<AuditLog[], Error>({
    queryKey: ["entityAuditLogs", entityType, entityId, limit],
    queryFn: async () => {
      const res = await axios.post(`${RBAC_PREFIX}/audit-logs/entity-history`, {
        entity_type: entityType,
        entity_id: entityId,
        limit,
      });
      return res.data.logs;
    },
    enabled: !!entityType && !!entityId,
  });

// --- Resource Hierarchy & Scoped RBAC ---
export interface ResourceNode {
  id: number;
  name: string;
  type: string;
  parent_id?: number | null;
  engine?: string;
  details?: string;
  children?: ResourceNode[];
}

export interface ResourceRoleAssignment {
  id: number;
  user_id: number;
  role_id: number;
  resource_id: number;
  assigned_at: string;
}

export const useResourceTree = () =>
  useQuery<ResourceNode[], Error>({
    queryKey: ["resourceTree"],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/resources/tree`)).data,
  });

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ResourceNode>) =>
      axios.post(`${RBAC_PREFIX}/resources`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["resourceTree"] }),
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceId, ...data }: any) =>
      axios.put(`${RBAC_PREFIX}/resources/${resourceId}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["resourceTree"] }),
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: number) =>
      axios.delete(`${RBAC_PREFIX}/resources/${resourceId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["resourceTree"] }),
  });
};

export const useResourceRoles = (resourceId: number) =>
  useQuery<ResourceRoleAssignment[], Error>({
    queryKey: ["resourceRoles", resourceId],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/resources/${resourceId}/roles`)).data,
    enabled: !!resourceId,
  });

export const useAssignResourceRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      user_id: number;
      role_id: number;
      resource_id: number;
    }) =>
      axios.post(
        `${RBAC_PREFIX}/resources/${data.resource_id}/assign-role`,
        data
      ),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["resourceRoles", variables.resource_id],
      }),
  });
};

export const useEffectiveUserPermissions = (resourceId: number) =>
  useQuery<Record<number, any[]>, Error>({
    queryKey: ["effectiveUserPermissions", resourceId],
    queryFn: async () =>
      (
        await axios.get(
          `${RBAC_PREFIX}/resources/${resourceId}/effective-user-permissions`
        )
      ).data,
    enabled: !!resourceId,
  });

// --- Remove Resource Role Assignment ---
export const useRemoveRoleScope = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceRoleId }: { resourceRoleId: number }) =>
      axios.delete(`${RBAC_PREFIX}/resource-role/${resourceRoleId}`),
    onSuccess: (_data, variables) => {
      // Invalidate resourceRoles queries for all resources (or optimize if you know resourceId)
      queryClient.invalidateQueries({ queryKey: ["resourceRoles"] });
    },
  });
};

// --- Permission Diff ---
export interface PermissionDiffRequest {
  user_id?: number;
  role_id?: number;
  resource_type?: string;
  resource_id?: string;
  before_state?: { action: string; resource: string }[];
  after_state?: { action: string; resource: string }[];
}

export interface PermissionDiffResult {
  added: Array<{ action: string; resource: string; change: string }>;
  removed: Array<{ action: string; resource: string; change: string }>;
  unchanged: Array<{ action: string; resource: string; change: string }>;
}

export const fetchPermissionDiff = async (
  req: PermissionDiffRequest
): Promise<PermissionDiffResult> => {
  const { data } = await axios.post(`${RBAC_PREFIX}/permission-diff`, req);
  return data;
};

// --- Resource Ancestors/Descendants ---
export const useResourceAncestors = (resourceId: number) =>
  useQuery<ResourceNode[], Error>({
    queryKey: ["resourceAncestors", resourceId],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/resources/${resourceId}/ancestors`))
        .data,
    enabled: !!resourceId,
  });

export const useResourceDescendants = (resourceId: number) =>
  useQuery<ResourceNode[], Error>({
    queryKey: ["resourceDescendants", resourceId],
    queryFn: async () =>
      (await axios.get(`${RBAC_PREFIX}/resources/${resourceId}/descendants`))
        .data,
    enabled: !!resourceId,
  });

// --- Bulk Remove Roles from Users ---
export const useBulkRemoveRolesFromUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_ids: number[]; role_id: number }) =>
      axios.post(`${RBAC_PREFIX}/users/bulk-remove-roles`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
export const useBulkAssignRolesEfficient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_ids: number[]; role_id: number }) =>
      axios.post(`${RBAC_PREFIX}/users/bulk-assign-roles-efficient`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
export const useBulkRemoveRolesEfficient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_ids: number[]; role_id: number }) =>
      axios.post(`${RBAC_PREFIX}/users/bulk-remove-roles-efficient`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
