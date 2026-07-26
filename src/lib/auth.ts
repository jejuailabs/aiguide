"use client"

import { create } from "zustand"
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth, googleProvider } from "./firebase-client"
import type { Tier } from "./roles"
import type { UserDTO } from "./types"

export type { Tier } from "./roles"
export { TIER_LABELS, TIER_STYLES } from "./roles"

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
  upgrade: () => Promise<void>
}

const KEY = "ai-guide-auth"

function cache(u: User | null) {
  try {
    if (u) localStorage.setItem(KEY, JSON.stringify(u))
    else localStorage.removeItem(KEY)
  } catch {}
}

function fromDTO(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    avatar: dto.avatar,
    tier: dto.tier,
    provider: "google",
    joinedAt: dto.createdAt,
  }
}

/**
 * Register/refresh the signed-in user's profile document and adopt the tier the
 * server hands back — that's what makes admin-side tier changes take effect.
 */
async function syncProfile(fbUser: FirebaseUser, body?: Record<string, unknown>): Promise<User> {
  const token = await fbUser.getIdToken()
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body ?? {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error ?? "회원 정보 동기화에 실패했습니다.") as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return fromDTO(data.user as UserDTO)
}

/**
 * fetch() with the caller's Firebase ID token attached — required by every
 * /api/users endpoint.
 */
export async function authFetch(url: string, init: RequestInit = {}) {
  await auth.authStateReady()
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error("로그인이 필요합니다.")
  return fetch(url, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
  })
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return

    // Show the cached profile immediately, then let the server correct it.
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) set({ user: JSON.parse(raw) as User })
    } catch {}
    set({ hydrated: true })

    onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        // Guests live only in localStorage; a signed-out Google user is stale.
        if (get().user?.provider === "google") {
          cache(null)
          set({ user: null })
        }
        return
      }
      try {
        const user = await syncProfile(fbUser)
        cache(user)
        set({ user })
      } catch (e: any) {
        // Rejected (blocked / bad token) — end the session. A transient network
        // or server error leaves the cached profile in place.
        if (e?.status === 401 || e?.status === 403) {
          await fbSignOut(auth).catch(() => {})
          cache(null)
          set({ user: null })
        }
      }
    })
  },
  loginWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider)
    let user: User
    try {
      user = await syncProfile(result.user)
    } catch (e) {
      await fbSignOut(auth).catch(() => {})
      throw e
    }
    cache(user)
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
    cache(guest)
    set({ user: guest })
  },
  logout: async () => {
    try { await fbSignOut(auth) } catch {}
    cache(null)
    set({ user: null })
  },
  upgrade: async () => {
    const current = get().user
    if (!current || current.provider !== "google") return
    await auth.authStateReady()
    const fbUser = auth.currentUser
    if (!fbUser) return
    const user = await syncProfile(fbUser, { upgrade: true })
    cache(user)
    set({ user })
  },
}))
