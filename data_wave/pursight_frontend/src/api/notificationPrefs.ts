// React Query hooks for Notification Preferences
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";

export interface NotificationPreferences {
  [key: string]: any;
}

export const useNotificationPrefs = (userId: string) =>
  useQuery<NotificationPreferences, Error>({
    queryKey: ["notificationPrefs", userId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/notifications/preferences?userId=${userId}`
      );
      return data.preferences;
    },
  });

export const useSetNotificationPrefs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: NotificationPreferences;
    }) => axios.post(`/notifications/preferences`, preferences),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["notificationPrefs", variables.userId],
      }),
  });
};
