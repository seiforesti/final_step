// This is a mock. Replace with real user fetching (API, JWT, etc) in production.
import { User } from "../models/User";

export function useCurrentUser(): User | null {
  // Example: admin user with all permissions
  return {
    id: "1",
    email: "admin@example.com",
    displayName: "Admin User",
    roles: ["admin"],
    permissions: [
      { action: "view", resource: "sensitivity_labels" },
      { action: "manage", resource: "sensitivity_labels" },
      { action: "approve", resource: "sensitivity_labels" },
      { action: "review", resource: "sensitivity_labels" },
    ],
    createdAt: new Date().toISOString(),
    isActive: true,
  };
}
