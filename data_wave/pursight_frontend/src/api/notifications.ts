// React Query hooks for Notifications
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";
import { Notification } from "../models/Notification";

export const useNotifications = (userEmail: string) =>
  useQuery<Notification[], Error>({
    queryKey: ["notifications", userEmail],
    queryFn: async () => {
      const { data } = await axios.get(
        `/sensitivity-labels/notifications/?user_email=${userEmail}`
      );
      return data;
    },
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userEmail }: { id: string; userEmail: string }) =>
      axios.post(`/sensitivity-labels/notifications/${id}/mark-read`),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["notifications", variables.userEmail],
      }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userEmail: string) =>
      axios.post(
        `/sensitivity-labels/notifications/mark-all-read?user_email=${userEmail}`
      ),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["notifications", variables],
      }),
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      userEmail,
    }: {
      id: string;
      userEmail: string;
    }) => {
      await axios.delete(`/sensitivity-labels/notifications/${id}`);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["notifications", variables.userEmail],
      }),
  });
};

export const useBulkDeleteNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      userEmail,
    }: {
      ids: string[];
      userEmail: string;
    }) => {
      await axios.post(`/notifications/bulk-delete`, { ids });
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["notifications", variables.userEmail],
      }),
  });
};

export interface NotificationAnalytics {
  total_notifications: number;
  unread: number;
  read: number;
  types: string[];
  created_from?: string;
  created_to?: string;
}

export interface NotificationAnalyticsFilters {
  user_email?: string | number;
  date_from?: string;
  date_to?: string;
}

export function useNotificationAnalytics(
  filters?: NotificationAnalyticsFilters
) {
  return useQuery<NotificationAnalytics>({
    queryKey: ["notificationAnalytics", filters],
    queryFn: async () => {
      const params: any = { ...filters };
      return (
        await axios.get("/sensitivity-labels/notifications/analytics", {
          params,
        })
      ).data;
    },
  });
}
