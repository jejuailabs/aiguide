import type { UserDTO } from "./types"
import type { Tier } from "./roles"

/** Firestore user document → wire format. */
export function toUserDTO(u: Record<string, any>): UserDTO {
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    avatar: u.avatar ?? (u.name ?? "U").charAt(0),
    tier: (u.tier ?? "free") as Tier,
    provider: u.provider ?? "google",
    blocked: !!u.blocked,
    createdAt: (u.createdAt instanceof Date ? u.createdAt : new Date()).toISOString(),
    lastLoginAt: u.lastLoginAt instanceof Date ? u.lastLoginAt.toISOString() : null,
  }
}
