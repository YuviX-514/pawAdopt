export const USER_ROLES = ["adopter", "owner", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

const ROLE_SET = new Set<string>(USER_ROLES);

export function normalizeRole(role: unknown): UserRole {
  return typeof role === "string" && ROLE_SET.has(role) ? (role as UserRole) : "adopter";
}

export function canListPets(role: UserRole) {
  return role === "owner" || role === "admin";
}

export function canReviewAdoptions(role: UserRole) {
  return role === "owner" || role === "admin";
}

export function isAdmin(role: UserRole) {
  return role === "admin";
}
