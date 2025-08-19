// React Query hooks for Users
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";
import { User } from "../models/User";

/**
 * Fetch the current authenticated user
 * @returns Promise resolving to User object
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const { data } = await axios.get("/sensitivity-labels/me");
    return data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    throw error;
  }
};

/**
 * React Query hook to fetch and cache the current user
 */
export const useCurrentUser = () => 
  useQuery<User, Error>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

export const useUsers = () =>
  useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => {
      // No /users endpoint exists in backend, so return an empty array or handle as needed
      return [];
    },
  });

export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      axios.patch(`/users/${id}/roles`, { roles }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

// Fetch current user's roles
export const useMyRoles = () =>
  useQuery<string[], Error>({
    queryKey: ["myRoles"],
    queryFn: async () => {
      const { data } = await axios.get("/sensitivity-labels/me/roles");
      return data;
    },
  });
