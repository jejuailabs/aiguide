"use client"

import { create } from "zustand"
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth"
import { auth, googleProvider } from "./firebase-client"

export type Tier = "guest" | "free" | "premium" | "admin"

const ADMIN_EMAILS = ["naggu1999@gmail.com"]

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  tier: Tier
  provider: "google" | "guest"
  joinedAt: string
}

interface AuthState {
  user: User | null
  hydrated: boolean
  hydrate: () => void
  loginWithGoogle: () => Promise<User>
  loginAsGuest: () => void
  logout: () => void
  upgrade: () => void
}

const KEY = "ai-guide-auth"

function tierForEmail(email: string): Tier {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "free"
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

    onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && !get().user) {
        const u: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "사용자",
          email: fbUser.email || "",
          avatar: (fbUser.displayName || "U").charAt(0),
          tier: tierForEmail(fbUser.email || ""),
          provider: "google",
          joinedAt: new Date().toISOString(),
        }
        try { localStorage.setItem(KEY, JSON.stringify(u)) } catch {}
        set({ user: u })
      }
    })
  },
  loginWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const fb = result.user
    const user: User = {
      id: fb.uid,
      name: fb.displayName || fb.email?.split("@")[0] || "사용자",
      email: fb.email || "",
      avatar: (fb.displayName || "U").charAt(0),
      tier: tierForEmail(fb.email || ""),
      provider: "google",
      joinedAt: new Date().toISOString(),
    }
    try { localStorage.setItem(KEY, JSON.stringify(user)) } catch {}
    set({ user })
    return user
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
    try { localStorage.setItem(KEY, JSON.stringify(guest)) } catch {}
    set({ user: guest })
  },
  logout: async () => {
    try { await fbSignOut(auth) } catch {}
    try { localStorage.removeItem(KEY) } catch {}
    set({ user: null })
  },
  upgrade: () => {
    const u = get().user
    if (!u) return
    const next = { ...u, tier: "premium" as Tier }
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
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
