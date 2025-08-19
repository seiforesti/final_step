import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface RbacMe {
  id: number;
  email: string;
  roles: string[];
  permissions: [string, string][];
}

export function useRbacMe() {
  return useQuery<RbacMe, Error>({
    queryKey: ["rbac", "me"],
    queryFn: async () => {
      const res = await axios.get("/sensitivity-labels/rbac/me", {
        withCredentials: true,
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
