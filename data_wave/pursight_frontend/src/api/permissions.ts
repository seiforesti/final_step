// React Query hooks for Table Permissions
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";
import { TablePermissionsData, UserPermission, GroupPermission, UserRole } from "../models/TablePermissions";

// Fetch permissions for a specific table
export const useTablePermissionsData = (path: string[] | undefined) =>
  useQuery<TablePermissionsData, Error>({
    queryKey: ["tablePermissionsData", path],
    queryFn: async () => {
      if (!path || path.length === 0) throw new Error("Invalid path");
      const { data } = await axios.post("/api/catalog/permissions", { path });
      return data;
    },
    enabled: !!path && path.length > 0,
  });

// Fetch available roles
export const useAvailableRoles = () =>
  useQuery<UserRole[], Error>({
    queryKey: ["availableRoles"],
    queryFn: async () => {
      const { data } = await axios.get("/api/catalog/permissions/roles");
      return data;
    },
  });

// Add user permission
export const useAddUserPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      path: string[];
      userId: string;
      roles: string[];
      directPermissions: string[];
    }) => axios.post("/api/catalog/permissions/add-user", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tablePermissionsData", variables.path],
      });
    },
  });
};

// Update user permission
export const useUpdateUserPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      path: string[];
      userId: string;
      roles: string[];
      directPermissions: string[];
    }) => axios.post("/api/catalog/permissions/update-user", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tablePermissionsData", variables.path],
      });
    },
  });
};

// Remove user permission
export const useRemoveUserPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { path: string[]; userId: string }) =>
      axios.post("/api/catalog/permissions/remove-user", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tablePermissionsData", variables.path],
      });
    },
  });
};

// Add group permission
export const useAddGroupPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      path: string[];
      groupId: string;
      roles: string[];
      directPermissions: string[];
    }) => axios.post("/api/catalog/permissions/add-group", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tablePermissionsData", variables.path],
      });
    },
  });
};

// Update group permission
export const useUpdateGroupPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      path: string[];
      groupId: string;
      roles: string[];
      directPermissions: string[];
    }) => axios.post("/api/catalog/permissions/update-group", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tablePermissionsData", variables.path],
      });
    },
  });
};

// Remove group permission
export const useRemoveGroupPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { path: string[]; groupId: string }) =>
      axios.post("/api/catalog/permissions/remove-group", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tablePermissionsData", variables.path],
      });
    },
  });
};

// Update inheritance settings
export const useUpdateInheritance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { path: string[]; inheritanceEnabled: boolean }) =>
      axios.post("/api/catalog/permissions/update-inheritance", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tablePermissionsData", variables.path],
      });
    },
  });
};