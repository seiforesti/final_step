import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useSendEmailCode() {
  return useMutation({
    mutationFn: async (email: string) => {
      await axios.post("/api/auth/email", { email });
    },
  });
}

export function useVerifyEmailCode() {
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      await axios.post("/api/auth/verify", { email, code });
    },
  });
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await axios.get("/api/session");
      return res.data;
    },
  });
}