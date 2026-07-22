"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Wrench, BookOpen, Wand2, Boxes, Rocket, Users,
  ArrowUpRight, ArrowRight, Flame, Pin, Megaphone, TrendingUp,
} from "lucide-react"
import { useNav, type ViewKey } from "@/lib/store"
import { useFetch, timeAgo } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DynamicIcon } from "@/components/dynamic-icon"
import { cn } from "@/lib/utils"
import type {
  AIToolDTO, PromptDTO, VibeSolutionDTO, CommunityPostDTO, AnnouncementDTO, MiniToolDTO,
} from "@/lib/types"

const FEATURES: {
  key: ViewKey
  title: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}[] = [
  { key: "tools", title: "AI 도구", desc: "카테고리별 검증된 AI 서비스", icon: Wrench, accent: "from-amber-500/20 to-amber-500/0" },
  { key: "prompts", title: "프롬프트", desc: "실무 바로 사용 프롬프트 라이브러리", icon: BookOpen, accent: "from-rose-500/20 to-rose-500/0" },
  { key: "meta-prompt", title: "메타 프롬프트", desc: "AI가 완성하는 최적화 프롬프트 엔진", icon: Wand2, accent: "from-amber-500/25 to-orange-500/0" },
  { key: "mini-tools", title: "AI 미니툴", desc: "브라우저에서 바로 실행되는 도구", icon: Boxes, accent: "from-emerald-500/20 to-emerald-500/0" },
  { key: "solutions", title: "바이브코딩 솔루션", desc: "AI로 제작된 웹서비스 아카이브", icon: Rocket, accent: "from-violet-500/20 to-violet-500/0" },
  { key: "community", title: "커뮤니티", desc: "AI 지식 공유와 소통의 공간", icon: Users, accent: "from-sky-500/20 to-sky-500/0" },
]

export function HomeView() {
  const { go } = useNav()
  return (
    <div>
      <Hero />
      <FeatureGrid />
      <DynamicSections />
    </div>
  )
}

/* ---------------- Hero ---------------- */
function Hero() {
  const { go } = useNav()
  return (
    <section className="relative overflow-hidden">
      {/* ambient mesh */}
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-90" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            생성형 AI를 위한 통합 생산성 플랫폼
          </div>

          <h1 className="font-serif text-[2.6rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            AI를 배우고, 탐색하고,
            <br />
            <span className="text-gradient-amber">완성하는 곳</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            AI 도구 디렉토리, 프롬프트 라이브러리, 메타 프롬프트 엔진, 미니툴,
            바이브코딩 솔루션 아카이브, 커뮤니티를 하나로.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="group h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20"
              onClick={() => go("meta-prompt")}
            >
              <Wand2 className="size-4" />
              메타 프롬프트 시작하기
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7 text-base"
              onClick={() => go("tools")}
            >
              AI 도구 탐색
            </Button>
          </div>
        </motion.div>

        {/* stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-4"
        >
          {[
            { v: "12+", l: "AI 도구" },
            { v: "12+", l: "프롬프트" },
            { v: "8", l: "미니툴" },
            { v: "6", l: "바이브 솔루션" },
          ].map((s) => (
            <div key={s.l} className="bg-background/80 px-4 py-5 text-center backdrop-blur">
              <div className="font-serif text-2xl font-semibold">{s.v}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- Feature Grid 2x3 ---------------- */
function FeatureGrid() {
  const { go } = useNav()
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            무엇을 도와드릴까요?
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            여섯 가지 핵심 기능으로 AI 활용의 전 과정을 지원합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.button
            key={f.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => go(f.key)}
            className="group relative flex aspect-[4/3.4] flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-6"
          >
            {/* gradient glow on hover */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                f.accent
              )}
            />
            <div className="relative flex items-start justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-all group-hover:bg-primary/15 group-hover:ring-primary/25 sm:size-12">
                <f.icon className="size-5 sm:size-[1.35rem]" />
              </span>
              <ArrowUpRight className="size-5 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:rotate-0" />
            </div>
            <div className="relative">
              <h3 className="font-serif text-lg font-semibold tracking-tight sm:text-xl">
                {f.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {f.desc}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Dynamic Sections ---------------- */
function DynamicSections() {
  const { data: toolsData } = useFetch<{ tools: AIToolDTO[] }>("/api/tools?featured=true")
  const { data: promptsData } = useFetch<{ prompts: PromptDTO[] }>("/api/prompts?limit=4")
  const { data: solData } = useFetch<{ solutions: VibeSolutionDTO[] }>("/api/solutions")
  const { data: miniData } = useFetch<{ miniTools: MiniToolDTO[] }>(
    "/api/meta-templates"
  )
  const { data: commData } = useFetch<{ posts: CommunityPostDTO[] }>(
    "/api/community?featured=true"
  )
  const { data: annData } = useFetch<{ announcements: AnnouncementDTO[] }>(
    "/api/announcements"
  )

  const recentTools = (toolsData?.tools ?? []).slice(0, 4)
  const recentPrompts = (promptsData?.prompts ?? []).slice(0, 4)
  const recentSolutions = (solData?.solutions ?? []).slice(0, 3)
  const recentMini = (miniData?.miniTools ?? []).slice(0, 4)
  const recentComm = (commData?.posts ?? []).slice(0, 3)
  const announcements = (annData?.announcements ?? []).slice(0, 3)

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      {/* Recent prompts */}
      <Section
        title="최근 등록 프롬프트"
        icon={BookOpen}
        onViewAll={() => useNav.getState().setView("prompts")}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentPrompts.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
          {recentPrompts.length === 0 && <SkeletonCards n={4} />}
        </div>
      </Section>

      {/* Recent meta prompts - reuse prompt list tagged differently? show a CTA banner */}
      <MetaPromptBanner />

      {/* Recent tools */}
      <Section
        title="최근 등록 AI 도구"
        icon={Wrench}
        onViewAll={() => useNav.getState().setView("tools")}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentTools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
          {recentTools.length === 0 && <SkeletonCards n={4} />}
        </div>
      </Section>

      {/* Recent solutions */}
      <Section
        title="바이브코딩 솔루션"
        icon={Rocket}
        onViewAll={() => useNav.getState().setView("solutions")}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentSolutions.map((s) => (
            <SolutionCard key={s.id} solution={s} />
          ))}
          {recentSolutions.length === 0 && <SkeletonCards n={3} />}
        </div>
      </Section>

      {/* Mini tools + Community split */}
      <div className="grid gap-12 lg:grid-cols-2">
        <Section
          title="AI 미니툴"
          icon={Boxes}
          onViewAll={() => useNav.getState().setView("mini-tools")}
        >
          <div className="grid grid-cols-2 gap-3">
            {recentMini.map((m) => (
              <button
                key={m.id}
                onClick={() => useNav.getState().setView("mini-tools")}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-left transition-all hover:border-primary/30 hover:bg-accent/40"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DynamicIcon name={m.icon} className="size-[1.05rem]" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{m.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.description}</div>
                </div>
              </button>
            ))}
            {recentMini.length === 0 && <SkeletonCards n={4} />}
          </div>
        </Section>

        <Section
          title="인기 커뮤니티"
          icon={Users}
          onViewAll={() => useNav.getState().setView("community")}
        >
          <div className="space-y-2.5">
            {recentComm.map((p) => (
              <CommunityRow key={p.id} post={p} />
            ))}
            {recentComm.length === 0 && (
              <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Announcements */}
      <Section title="공지사항" icon={Megaphone}>
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
              {a.pinned ? (
                <Pin className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{a.title}</span>
                  {a.type === "event" && (
                    <Badge variant="secondary" className="shrink-0 text-[0.65rem]">이벤트</Badge>
                  )}
                  {a.type === "update" && (
                    <Badge variant="outline" className="shrink-0 text-[0.65rem]">업데이트</Badge>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{a.content}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              공지사항이 없습니다.
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

/* ---------------- Section wrapper ---------------- */
function Section({
  title,
  icon: Icon,
  onViewAll,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  onViewAll?: () => void
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-[1rem]" />
          </span>
          <h2 className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            전체보기
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function SkeletonCards({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted/50" />
      ))}
    </>
  )
}

/* ---------------- Cards ---------------- */
function PromptCard({ prompt }: { prompt: PromptDTO }) {
  const { go } = useNav()
  return (
    <button
      onClick={() => go("prompts")}
      className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-[0.65rem]">{prompt.category}</Badge>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{prompt.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {prompt.description}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between text-[0.7rem] text-muted-foreground">
        <span className="truncate">{prompt.bestModel}</span>
        <span className="flex items-center gap-1">
          <Flame className="size-3 text-primary/70" />
          {prompt.favorites}
        </span>
      </div>
    </button>
  )
}

function ToolCard({ tool }: { tool: AIToolDTO }) {
  const { go } = useNav()
  return (
    <button
      onClick={() => go("tools")}
      className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <DynamicIcon name={tool.icon} className="size-[1.15rem]" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{tool.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{tool.price}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {tool.tagline}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {tool.useCases.slice(0, 2).map((u) => (
          <Badge key={u} variant="outline" className="text-[0.6rem] font-normal">{u}</Badge>
        ))}
      </div>
    </button>
  )
}

function SolutionCard({ solution }: { solution: VibeSolutionDTO }) {
  const { go } = useNav()
  return (
    <button
      onClick={() => go("solutions")}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <Thumb slug={solution.thumbnail} title={solution.title} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <Badge variant="secondary" className="text-[0.65rem]">{solution.category}</Badge>
          {solution.featured && (
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 text-[0.65rem]">
              <TrendingUp className="mr-1 size-2.5" />추천
            </Badge>
          )}
        </div>
        <h3 className="font-serif text-base font-semibold tracking-tight">{solution.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {solution.tagline}
        </p>
        <div className="mt-auto flex flex-wrap gap-1 pt-3">
          {solution.techStack.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline" className="text-[0.6rem] font-normal">{t}</Badge>
          ))}
        </div>
      </div>
    </button>
  )
}

function CommunityRow({ post }: { post: CommunityPostDTO }) {
  const { go } = useNav()
  const catLabel =
    post.category === "question" ? "질문" :
    post.category === "prompt-share" ? "프롬프트" :
    post.category === "use-case" ? "사례" : "뉴스"
  return (
    <button
      onClick={() => go("community")}
      className="group flex w-full items-start gap-3 rounded-xl border border-border/50 bg-card p-3.5 text-left transition-all hover:border-primary/30 hover:bg-accent/30"
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[0.65rem] font-semibold uppercase">
        {post.author.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[0.6rem] font-normal">{catLabel}</Badge>
          <span className="truncate text-xs text-muted-foreground">{post.author}</span>
        </div>
        <p className="mt-1 line-clamp-1 text-sm font-medium">{post.title}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end text-[0.7rem] text-muted-foreground">
        <span>♥ {post.likes}</span>
        <span>💬 {post.comments}</span>
      </div>
    </button>
  )
}

/* CSS-based premium thumbnail (no external image needed) */
export function Thumb({
  slug,
  title,
  className,
}: {
  slug: string
  title: string
  className?: string
}) {
  const palettes: Record<string, string> = {
    dashboard: "from-amber-500/30 via-orange-500/10 to-transparent",
    portfolio: "from-rose-500/30 via-pink-500/10 to-transparent",
    poetry: "from-violet-500/30 via-purple-500/10 to-transparent",
    fitness: "from-emerald-500/30 via-teal-500/10 to-transparent",
    travel: "from-sky-500/30 via-cyan-500/10 to-transparent",
    music: "from-fuchsia-500/30 via-pink-500/10 to-transparent",
  }
  const grad = palettes[slug] ?? "from-primary/25 via-primary/5 to-transparent"
  const isImage = typeof slug === "string" && /^(https?:\/\/|\/)/.test(slug) && slug !== "/logo.svg"

  // 실제 썸네일 이미지(og:image 등)가 있으면 이미지로 렌더한다.
  if (isImage) {
    return (
      <div className={cn("relative overflow-hidden bg-muted/40", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slug}
          alt={title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          onError={(e) => {
            // 이미지 로드 실패 시 그라디언트 폴백으로 대체
            const el = e.currentTarget
            el.style.display = "none"
            el.parentElement?.classList.add("thumb-fallback")
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted/40", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", grad)} />
      <div className="absolute inset-0 bg-grain opacity-[0.04]" />
      <div className="absolute left-4 top-4">
        <span className="font-serif text-xs uppercase tracking-[0.25em] text-foreground/40">
          Showcase
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <span className="line-clamp-1 font-serif text-sm font-medium text-foreground/70">
          {title}
        </span>
      </div>
      {/* faux window chrome */}
      <div className="absolute right-4 top-4 flex gap-1">
        <span className="size-1.5 rounded-full bg-foreground/15" />
        <span className="size-1.5 rounded-full bg-foreground/15" />
        <span className="size-1.5 rounded-full bg-foreground/15" />
      </div>
    </div>
  )
}

function MetaPromptBanner() {
  const { go } = useNav()
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/40 to-transparent p-7 sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative grid gap-6 sm:grid-cols-[1.4fr_1fr] sm:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/60 px-3 py-1 text-[0.7rem] font-medium text-primary backdrop-blur">
            <Wand2 className="size-3" /> 핵심 기능
          </div>
          <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            가장 적은 질문으로,
            <br />
            가장 높은 완성도의 프롬프트를.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            원하는 결과물만 선택하세요. AI가 자료를 분석해 자동으로 요구사항을 채우고,
            정말 필요한 것만 한 번에 하나씩 질문합니다. 방향성 충돌까지 감지합니다.
          </p>
        </div>
        <div className="flex sm:justify-end">
          <Button
            size="lg"
            className="h-12 rounded-full px-7 shadow-lg shadow-primary/20"
            onClick={() => go("meta-prompt")}
          >
            <Wand2 className="size-4" />
            지금 체험하기
          </Button>
        </div>
      </div>
    </section>
  )
}
