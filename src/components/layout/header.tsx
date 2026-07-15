"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles } from "lucide-react"
import { useNav, type ViewKey } from "@/lib/store"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS: { key: ViewKey; label: string }[] = [
  { key: "tools", label: "AI 도구" },
  { key: "prompts", label: "프롬프트" },
  { key: "meta-prompt", label: "메타 프롬프트" },
  { key: "mini-tools", label: "AI 미니툴" },
  { key: "solutions", label: "바이브코딩 솔루션" },
  { key: "community", label: "커뮤니티" },
]

export function Header() {
  const { view, setView } = useNav()
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const go = (k: ViewKey) => {
    setView(k)
    setMobileOpen(false)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => go("home")}
          className="group flex items-center gap-2.5"
          aria-label="AI Guide Portal 홈"
        >
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:bg-primary/15 group-hover:ring-primary/30">
            <Sparkles className="size-[1.15rem] text-primary" />
            <span className="absolute inset-0 rounded-xl bg-primary/5 blur-md transition-opacity group-hover:opacity-100 opacity-0" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[1.05rem] font-semibold tracking-tight">
              AI Guide
            </span>
            <span className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
              Portal
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => go(item.key)}
              className={cn(
                "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                view === item.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {view === item.key && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-accent/70 ring-1 ring-border/60"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
            onClick={() => go("meta-prompt")}
          >
            시작하기
          </Button>
          <ThemeToggle />
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-b border-border/60 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1.5 px-4 py-4 sm:px-6">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => go(item.key)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
                    view === item.key
                      ? "bg-accent text-foreground ring-1 ring-border/60"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
