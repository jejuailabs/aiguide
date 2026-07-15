"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Search, Copy, Heart, ExternalLink, Filter, Flame, Sparkles, Tag,
} from "lucide-react"
import { useFetch, useCopy } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { ViewHeader } from "@/components/views/view-header"
import { cn } from "@/lib/utils"
import type { PromptDTO } from "@/lib/types"

const CATEGORIES = ["전체", "이미지", "영상", "문서", "코드", "카피", "마케팅"]

export function PromptsView() {
  const [category, setCategory] = React.useState("전체")
  const [query, setQuery] = React.useState("")
  const [activeTag, setActiveTag] = React.useState<string | null>(null)
  const [favOnly, setFavOnly] = React.useState(false)
  const [selected, setSelected] = React.useState<PromptDTO | null>(null)

  const { data, loading } = useFetch<{ prompts: PromptDTO[] }>(
    `/api/prompts?category=${encodeURIComponent(category)}`
  )
  const favorites = useFavorites()

  const prompts = data?.prompts ?? []
  const allTags = React.useMemo(() => {
    const s = new Set<string>()
    prompts.forEach((p) => p.tags.forEach((t) => s.add(t)))
    return Array.from(s).slice(0, 16)
  }, [prompts])

  const filtered = React.useMemo(() => {
    let list = prompts
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (activeTag) list = list.filter((p) => p.tags.includes(activeTag))
    if (favOnly) list = list.filter((p) => favorites.has(p.id))
    return list
  }, [prompts, query, activeTag, favOnly, favorites])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ViewHeader
        eyebrow="프롬프트 라이브러리"
        title="실무에서 바로 쓰는 프롬프트"
        desc="검증된 프롬프트를 체계적으로 관리합니다. 원클릭 복사, 최적 모델 추천, 실행 링크까지 제공합니다."
      />

      {/* Controls */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="프롬프트 검색"
              className="h-12 rounded-2xl pl-11 pr-4 text-base"
            />
          </div>
          <Button
            variant={favOnly ? "default" : "outline"}
            className="h-12 rounded-2xl px-5"
            onClick={() => setFavOnly((v) => !v)}
          >
            <Heart className={cn("size-4", favOnly && "fill-current")} />
            즐겨찾기 {favorites.size > 0 && `(${favorites.size})`}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="size-3" />카테고리
          </span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                category === c
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground ring-1 ring-border/50"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="size-3" />태그
            </span>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs transition-all",
                  activeTag === t
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground hover:text-foreground ring-1 ring-border/50"
                )}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted/50" />
            ))
          : filtered.map((p, i) => (
              <PromptGridCard
                key={p.id}
                prompt={p}
                index={i}
                isFav={favorites.has(p.id)}
                onToggleFav={() => favorites.toggle(p.id)}
                onOpen={() => setSelected(p)}
              />
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <Sparkles className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {favOnly ? "즐겨찾기한 프롬프트가 없습니다." : "검색 결과가 없습니다."}
          </p>
        </div>
      )}

      <PromptDialog
        prompt={selected}
        onClose={() => setSelected(null)}
        isFav={selected ? favorites.has(selected.id) : false}
        onToggleFav={() => selected && favorites.toggle(selected.id)}
      />
    </div>
  )
}

function PromptGridCard({
  prompt,
  index,
  isFav,
  onToggleFav,
  onOpen,
}: {
  prompt: PromptDTO
  index: number
  isFav: boolean
  onToggleFav: () => void
  onOpen: () => void
}) {
  const { copy } = useCopy()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="mb-3 flex items-center justify-between">
        <Badge variant="secondary" className="text-[0.65rem]">{prompt.category}</Badge>
        <button
          onClick={onToggleFav}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
          aria-label="즐겨찾기"
        >
          <Heart className={cn("size-4", isFav && "fill-primary text-primary")} />
        </button>
      </div>
      <button onClick={onOpen} className="flex-1 text-left">
        <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight">
          {prompt.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {prompt.description}
        </p>
      </button>
      <div className="mt-3 flex flex-wrap gap-1">
        {prompt.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="outline" className="text-[0.6rem] font-normal">#{t}</Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Flame className="size-3 text-primary/70" />
            {prompt.favorites}
          </span>
          <span className="truncate">{prompt.bestModel}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 px-2.5"
          onClick={() => copy(prompt.body, "프롬프트가 복사되었습니다")}
        >
          <Copy className="size-3.5" />
          복사
        </Button>
      </div>
    </motion.div>
  )
}

function PromptDialog({
  prompt,
  onClose,
  isFav,
  onToggleFav,
}: {
  prompt: PromptDTO | null
  onClose: () => void
  isFav: boolean
  onToggleFav: () => void
}) {
  const { copy } = useCopy()
  return (
    <Dialog open={!!prompt} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        {prompt && (
          <>
            <div className="relative bg-gradient-to-br from-primary/10 via-accent/30 to-transparent p-6">
              <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.03]" />
              <DialogHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{prompt.category}</Badge>
                    <Badge variant="outline">v{prompt.version}</Badge>
                  </div>
                  <button
                    onClick={onToggleFav}
                    className="flex size-9 items-center justify-center rounded-full bg-background/70 text-muted-foreground ring-1 ring-border/50 backdrop-blur transition-colors hover:text-primary"
                    aria-label="즐겨찾기"
                  >
                    <Heart className={cn("size-4", isFav && "fill-primary text-primary")} />
                  </button>
                </div>
                <DialogTitle className="font-serif text-2xl font-semibold tracking-tight">
                  {prompt.title}
                </DialogTitle>
                <DialogDescription className="text-sm">{prompt.description}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    프롬프트 본문
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => copy(prompt.body, "프롬프트가 복사되었습니다")}
                  >
                    <Copy className="size-3" />
                    복사
                  </Button>
                </div>
                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-xs leading-relaxed scrollbar-thin">
                  {prompt.body}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-accent/40 p-3">
                  <div className="text-xs text-muted-foreground">최적 AI 모델</div>
                  <div className="mt-1 text-sm font-medium">{prompt.bestModel}</div>
                </div>
                <div className="rounded-xl bg-accent/40 p-3">
                  <div className="text-xs text-muted-foreground">인기도</div>
                  <div className="mt-1 flex items-center gap-1 text-sm font-medium">
                    <Flame className="size-3.5 text-primary/70" />
                    {prompt.favorites}명 즐겨찾기
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map((t) => (
                  <Badge key={t} variant="outline" className="font-normal">#{t}</Badge>
                ))}
              </div>

              {prompt.runUrl && (
                <Button
                  className="w-full"
                  onClick={() => window.open(prompt.runUrl!, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="size-4" />
                  {prompt.bestModel}에서 실행하기
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* Favorites hook (localStorage) */
function useFavorites() {
  const [favs, setFavs] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("ai-prompt-favs")
      if (raw) setFavs(new Set(JSON.parse(raw)))
    } catch {}
  }, [])

  const toggle = React.useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem("ai-prompt-favs", JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }, [])

  // force re-render consumer when favs change
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => setTick((t) => t + 1), [favs])

  return { has: (id: string) => favs.has(id), toggle, size: favs.size, _tick: tick } as {
    has: (id: string) => boolean
    toggle: (id: string) => void
    size: number
    _tick: number
  }
}
