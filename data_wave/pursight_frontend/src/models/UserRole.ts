// UserRole.ts
export type UserRole = "admin" | "steward" | "reviewer" | "auditor" | "user";

export interface User {
  id: number;
  email: string;
  name: string;
  roles: UserRole[];
}
