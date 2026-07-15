"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Heart, Clock, Crown, Sparkles, Settings, LogOut, Shield, Bell,
  Palette, Mail, Calendar, ArrowRight, BookOpen, MessageCircle, Zap,
} from "lucide-react"
import { useAuth, TIER_LABELS, TIER_STYLES } from "@/lib/auth"
import { useNav } from "@/lib/store"
import { useFetch, timeAgo } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ViewHeader } from "@/components/views/view-header"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { PromptDTO, CommunityPostDTO } from "@/lib/types"

export function MyPageView() {
  const { user, logout, upgrade, hydrated } = useAuth()
  const { go } = useNav()
  const { data: promptsData } = useFetch<{ prompts: PromptDTO[] }>("/api/prompts")
  const { data: commData } = useFetch<{ posts: CommunityPostDTO[] }>("/api/community")

  const [favs, setFavs] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("ai-prompt-favs")
      if (raw) setFavs(new Set(JSON.parse(raw)))
    } catch {}
  }, [])

  if (!hydrated) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-muted-foreground">로딩 중…</div>
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-accent/50">
          <Heart className="size-7 text-muted-foreground" />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight">로그인이 필요합니다</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          마이페이지를 보려면 로그인하세요.
        </p>
        <Button className="mt-6" onClick={() => go("home")}>
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  const savedPrompts = (promptsData?.prompts ?? []).filter((p) => favs.has(p.id))
  const myPosts = (commData?.posts ?? []).filter((p) => p.author === user.name)
  const joinedDate = new Date(user.joinedAt)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ViewHeader
        eyebrow="마이페이지"
        title={`${user.name}님의 공간`}
        desc="프로필, 즐겨찾기, 활동 내역, 설정을 한곳에서 관리하세요."
      />

      {/* Profile hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 overflow-hidden rounded-3xl border border-border/60 bg-card"
      >
        <div className="relative bg-gradient-to-br from-primary/10 via-accent/30 to-transparent p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.03]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span
              className={cn(
                "flex size-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-semibold ring-2",
                user.tier === "admin"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30"
                  : "bg-gradient-to-br from-primary/25 to-primary/5 ring-primary/20"
              )}
            >
              {user.avatar}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-2xl font-semibold tracking-tight">{user.name}</h2>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    TIER_STYLES[user.tier]
                  )}
                >
                  {TIER_LABELS[user.tier]}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {user.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />{user.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />가입 {joinedDate.getFullYear()}년 {joinedDate.getMonth() + 1}월
                </span>
                {user.provider === "google" && (
                  <span className="flex items-center gap-1.5 text-primary">
                    <Shield className="size-3.5" />Google 인증
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { logout(); go("home"); toast.success("로그아웃되었습니다") }}>
              <LogOut className="size-4" /> 로그아웃
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-border/60 border-t border-border/60">
          <Stat value={savedPrompts.length} label="즐겨찾기" icon={Heart} />
          <Stat value={myPosts.length} label="커뮤니티 글" icon={MessageCircle} />
          <Stat value={user.tier === "premium" || user.tier === "admin" ? "∞" : "0"} label="저장 프롬프트" icon={BookOpen} />
        </div>
      </motion.div>

      {/* Premium upsell for free tier */}
      {user.tier === "free" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] via-accent/20 to-transparent p-6 sm:p-7"
        >
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Crown className="size-3" /> Premium
              </div>
              <h3 className="font-serif text-xl font-semibold tracking-tight">
                더 많은 것을 할 수 있습니다
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Zap className="size-3.5 text-primary" />AI 테스트랩 — 여러 모델 동시 비교</li>
                <li className="flex items-center gap-2"><Zap className="size-3.5 text-primary" />개인 프롬프트 저장소 무제한</li>
                <li className="flex items-center gap-2"><Zap className="size-3.5 text-primary" />고급 메타 프롬프트 기능</li>
              </ul>
            </div>
            <Button
              size="lg"
              className="shrink-0 shadow-lg shadow-primary/20"
              onClick={() => { upgrade(); toast.success("Premium으로 업그레이드되었습니다!") }}
            >
              <Crown className="size-4" /> 업그레이드
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="mt-8">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-2xl bg-muted/40 p-1.5">
          <TabsTrigger value="favorites" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Heart className="size-3.5" /> 즐겨찾기
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Clock className="size-3.5" /> 내 활동
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings className="size-3.5" /> 설정
          </TabsTrigger>
        </TabsList>

        {/* Favorites tab */}
        <TabsContent value="favorites" className="mt-5">
          {savedPrompts.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="아직 즐겨찾기가 없습니다"
              desc="프롬프트 라이브러리에서 하트를 눌러 저장해보세요."
              action={{ label: "프롬프트 둘러보기", onClick: () => go("prompts") }}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {savedPrompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => go("prompts")}
                  className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[0.6rem]">{p.category}</Badge>
                    </div>
                    <h4 className="mt-1 line-clamp-1 text-sm font-semibold">{p.title}</h4>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{p.bestModel}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity tab */}
        <TabsContent value="activity" className="mt-5">
          {myPosts.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="커뮤니티 활동이 없습니다"
              desc="AI 지식을 나누는 첫 글을 작성해보세요."
              action={{ label: "커뮤니티 가기", onClick: () => go("community") }}
            />
          ) : (
            <div className="space-y-2.5">
              {myPosts.map((p) => (
                <Card key={p.id} className="flex items-center gap-3 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-semibold">
                    {p.author.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(p.createdAt)} · ♥ {p.likes} · 💬 {p.comments}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings" className="mt-5">
          <div className="space-y-4">
            <SettingsRow
              icon={Palette}
              title="테마"
              desc="다크모드와 라이트모드를 전환합니다"
            >
              <ThemeSetting />
            </SettingsRow>
            <SettingsRow
              icon={Bell}
              title="알림"
              desc="새 콘텐츠 및 커뮤니티 알림을 받습니다"
            >
              <Switch defaultChecked onCheckedChange={(c) => toast.success(c ? "알림이 켜졌습니다" : "알림이 꺼졌습니다")} />
            </SettingsRow>
            <SettingsRow
              icon={Shield}
              title="프라이버시"
              desc="내 활동을 다른 사용자에게 공개합니다"
            >
              <Switch onCheckedChange={(c) => toast.success(c ? "공개로 설정되었습니다" : "비공개로 설정되었습니다")} />
            </SettingsRow>

            {user.tier !== "guest" && (
              <Card className="border-destructive/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">계정 관리</p>
                    <p className="text-xs text-muted-foreground">로그아웃하면 다시 로그인해야 합니다</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => { logout(); go("home"); toast.success("로그아웃되었습니다") }}
                  >
                    <LogOut className="size-4" /> 로그아웃
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Stat({
  value,
  label,
  icon: Icon,
}: {
  value: React.ReactNode
  label: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="px-4 py-5 text-center sm:px-6">
      <Icon className="mx-auto mb-1.5 size-4 text-primary/60" />
      <div className="font-serif text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function SettingsRow({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </Card>
  )
}

function ThemeSetting() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = mounted ? resolvedTheme === "dark" : true
  return (
    <Switch
      checked={isDark}
      onCheckedChange={(c) => setTheme(c ? "dark" : "light")}
    />
  )
}

function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/50">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      {action && (
        <Button size="sm" variant="outline" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
