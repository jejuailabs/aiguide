"use client"

import { create } from "zustand"

export type Tier = "guest" | "free" | "premium" | "admin"

export interface User {
  id: string
  name: string
  email: string
  avatar: string // initials
  tier: Tier
  provider: "google" | "guest"
  joinedAt: string
}

interface AuthState {
  user: User | null
  hydrated: boolean
  hydrate: () => void
  loginWithGoogle: (asAdmin?: boolean) => Promise<User>
  loginAsGuest: () => void
  logout: () => void
  upgrade: () => void
}

const KEY = "ai-guide-auth"

const DEMO_FREE: User = {
  id: "demo-free",
  name: "김가이드",
  email: "guide.kim@gmail.com",
  avatar: "김",
  tier: "free",
  provider: "google",
  joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 32).toISOString(),
}

const DEMO_ADMIN: User = {
  id: "demo-admin",
  name: "관리자",
  email: "admin@ai-guide.portal",
  avatar: "관",
  tier: "admin",
  provider: "google",
  joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const u = JSON.parse(raw) as User
        set({ user: u, hydrated: true })
        return
      }
    } catch {}
    set({ hydrated: true })
  },
  loginWithGoogle: (asAdmin = false) => {
    // Simulated OAuth handshake — real Google OAuth requires credentials
    // not available in this sandbox. UX is faithful to the real flow.
    const user = asAdmin ? DEMO_ADMIN : DEMO_FREE
    try {
      localStorage.setItem(KEY, JSON.stringify(user))
    } catch {}
    set({ user })
    return Promise.resolve(user)
  },
  loginAsGuest: () => {
    const guest: User = {
      id: "guest-" + Math.random().toString(36).slice(2, 8),
      name: "게스트",
      email: "",
      avatar: "G",
      tier: "guest",
      provider: "guest",
      joinedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(guest))
    } catch {}
    set({ user: guest })
  },
  logout: () => {
    try {
      localStorage.removeItem(KEY)
    } catch {}
    set({ user: null })
  },
  upgrade: () => {
    const u = get().user
    if (!u) return
    const next = { ...u, tier: "premium" as Tier }
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {}
    set({ user: next })
  },
}))

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
