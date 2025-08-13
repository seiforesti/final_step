import { useState, createContext, useContext } from "react";
import { User } from "../models/User";

const API_BASE_URL = "http://localhost:8000/auth";

export function useEmailAuth() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function sendEmailCode(email: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Failed to send verification code");
      }
      setEmail(email);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function verifyEmailCode(email: string, code: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!response.ok) {
        throw new Error("Verification failed");
      }
      setError(null);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }

  return {
    email,
    code,
    error,
    setEmail,
    setCode,
    sendEmailCode,
    verifyEmailCode,
  };
}

// Simple global user context for demo; replace with real auth in production
export const AuthContext = createContext<{ user: User | null }>({ user: null });
export function useAuth() {
  return useContext(AuthContext);
}
