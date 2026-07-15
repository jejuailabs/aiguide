"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, User as UserIcon, Shield, ChevronDown, Crown } from "lucide-react"
import { useAuth, TIER_LABELS, TIER_STYLES } from "@/lib/auth"
import { useNav } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function UserMenu({ onLogin }: { onLogin: () => void }) {
  const { user, logout, hydrated } = useAuth()
  const { go } = useNav()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  if (!hydrated) {
    return <div className="h-9 w-9" />
  }

  if (!user) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-9 rounded-full px-4"
        onClick={onLogin}
      >
        로그인
      </Button>
    )
  }

  const isAdmin = user.tier === "admin"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 py-1 pl-1 pr-2.5 transition-all hover:border-primary/30 hover:bg-accent/40"
        aria-label="사용자 메뉴"
      >
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full text-xs font-semibold ring-1",
            isAdmin
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30"
              : "bg-gradient-to-br from-primary/25 to-primary/5 text-foreground ring-primary/15"
          )}
        >
          {user.avatar}
        </span>
        <span className="hidden max-w-[80px] truncate text-sm font-medium sm:block">
          {user.name}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border/60 bg-popover p-1.5 shadow-xl"
          >
            {/* Profile head */}
            <div className="rounded-xl bg-accent/40 p-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full text-sm font-semibold ring-1",
                    isAdmin
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30"
                      : "bg-gradient-to-br from-primary/25 to-primary/5 ring-primary/15"
                  )}
                >
                  {user.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{user.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.email || "게스트"}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.65rem] font-semibold",
                    TIER_STYLES[user.tier]
                  )}
                >
                  {TIER_LABELS[user.tier]}
                </span>
                {user.provider === "google" && (
                  <span className="text-[0.6rem] text-muted-foreground">Google 연결됨</span>
                )}
              </div>
            </div>

            {/* Menu items */}
            <div className="mt-1.5 space-y-0.5">
              <MenuItem
                icon={UserIcon}
                label="마이페이지"
                onClick={() => {
                  go("my-page")
                  setOpen(false)
                }}
              />
              {isAdmin && (
                <MenuItem
                  icon={Shield}
                  label="관리자 대시보드"
                  onClick={() => {
                    go("admin")
                    setOpen(false)
                  }}
                  accent
                />
              )}
              {user.tier === "free" && (
                <MenuItem
                  icon={Crown}
                  label="Premium으로 업그레이드"
                  onClick={() => {
                    go("my-page")
                    setOpen(false)
                  }}
                />
              )}
              <div className="my-1 h-px bg-border/60" />
              <MenuItem
                icon={LogOut}
                label="로그아웃"
                onClick={() => {
                  logout()
                  setOpen(false)
                  go("home")
                  toast.success("로그아웃되었습니다")
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        accent
          ? "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          : "text-foreground hover:bg-accent"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
