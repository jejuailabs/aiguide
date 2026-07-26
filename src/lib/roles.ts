// Shared role/tier definitions — imported by both client (auth store) and
// server (API routes), so this module must stay free of "use client".

export type Tier = "guest" | "free" | "premium" | "admin"

/** Emails that are always granted the admin tier, regardless of stored value. */
export const ADMIN_EMAILS = ["naggu1999@gmail.com"]

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/** Default tier for a freshly registered account. */
export function tierForEmail(email: string): Tier {
  return isAdminEmail(email) ? "admin" : "free"
}

export const TIERS: Tier[] = ["guest", "free", "premium", "admin"]

export const TIER_LABELS: Record<Tier, string> = {
  guest: "게스트",
  free: "Free",
  premium: "Premium",
  admin: "Admin",
}

export const TIER_STYLES: Record<Tier, string> = {
  guest: "bg-muted text-muted-foreground",
  free: "bg-foreground/10 text-foreground",
  premium: "bg-primary/15 text-primary ring-1 ring-primary/25",
  admin: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30",
}
