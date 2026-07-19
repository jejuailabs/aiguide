"use client"

import { create } from "zustand"

export type ViewKey =
  | "home"
  | "tools"
  | "prompts"
  | "meta-prompt"
  | "mini-tools"
  | "solutions"
  | "community"
  | "vibe-guide"
  | "my-page"
  | "admin"

interface NavState {
  view: ViewKey
  setView: (v: ViewKey) => void
  // optional context payload, e.g. preselected prompt category
  context: Record<string, unknown>
  setContext: (c: Record<string, unknown>) => void
  go: (v: ViewKey, ctx?: Record<string, unknown>) => void
}

export const useNav = create<NavState>((set) => ({
  view: "home",
  setView: (view) => {
    set({ view })
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  },
  context: {},
  setContext: (context) => set({ context }),
  go: (view, ctx) => {
    set({ view, context: ctx ?? {} })
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  },
}))
