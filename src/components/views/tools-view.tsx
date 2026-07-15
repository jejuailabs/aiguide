"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Search, ExternalLink, Smartphone, Monitor, Sparkles, Filter } from "lucide-react"
import { useFetch, useCopy } from "@/lib/hooks"
import { useNav } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { DynamicIcon } from "@/components/dynamic-icon"
import { cn } from "@/lib/utils"
import type { AIToolDTO } from "@/lib/types"
import { ViewHeader } from "@/components/views/view-header"

const CATEGORIES = ["전체", "이미지 생성", "영상 생성", "문서 작성", "PPT", "음성", "음악", "바이브코딩"]

export function ToolsView() {
  const [category, setCategory] = React.useState("전체")
  const [query, setQuery] = React.useState("")
  const { data, loading } = useFetch<{ tools: AIToolDTO[] }>(
    `/api/tools?category=${encodeURIComponent(category)}`
  )
  const [selected, setSelected] = React.useState<AIToolDTO | null>(null)

  const tools = data?.tools ?? []
  const filtered = React.useMemo(() => {
    if (!query.trim()) return tools
    const q = query.toLowerCase()
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.useCases.some((u) => u.toLowerCase().includes(q))
    )
  }, [tools, query])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ViewHeader
        eyebrow="AI 도구 디렉토리"
        title="검증된 AI 서비스를 한곳에"
        desc="이미지, 영상, 문서, PPT, 음성, 음악, 자동화, 바이브코딩까지. 카테고리별로 큐레이션된 AI 도구를 탐색하세요."
      />

      {/* Controls */}
      <div className="mt-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도구 이름, 용도, 키워드로 검색"
            className="h-12 rounded-2xl pl-11 pr-4 text-base"
          />
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
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted/50" />
            ))
          : filtered.map((t, i) => (
              <ToolGridCard key={t.id} tool={t} index={i} onClick={() => setSelected(t)} />
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <Sparkles className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">검색 결과가 없습니다.</p>
        </div>
      )}

      <ToolDialog tool={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function ToolGridCard({
  tool,
  index,
  onClick,
}: {
  tool: AIToolDTO
  index: number
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      onClick={onClick}
      className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-all group-hover:bg-primary/15 group-hover:ring-primary/25">
          <DynamicIcon name={tool.icon} className="size-6" />
        </span>
        <Badge variant="outline" className="text-[0.65rem]">{tool.price}</Badge>
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight">{tool.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {tool.tagline}
      </p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {tool.useCases.slice(0, 3).map((u) => (
          <Badge key={u} variant="secondary" className="text-[0.65rem] font-normal">{u}</Badge>
        ))}
      </div>
    </motion.button>
  )
}

function ToolDialog({ tool, onClose }: { tool: AIToolDTO | null; onClose: () => void }) {
  const { copy } = useCopy()
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const href = isMobile && tool?.playStoreUrl
    ? tool.playStoreUrl
    : isMobile && tool?.appStoreUrl
    ? tool.appStoreUrl
    : tool?.websiteUrl

  return (
    <Dialog open={!!tool} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        {tool && (
          <>
            <div className="relative bg-gradient-to-br from-primary/10 via-accent/30 to-transparent p-6">
              <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.03]" />
              <DialogHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-background/80 text-primary ring-1 ring-primary/20 backdrop-blur">
                    <DynamicIcon name={tool.icon} className="size-7" />
                  </span>
                  <Badge variant="outline">{tool.category}</Badge>
                </div>
                <DialogTitle className="font-serif text-2xl font-semibold tracking-tight">
                  {tool.name}
                </DialogTitle>
                <DialogDescription className="text-sm">{tool.tagline}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="space-y-5 p-6">
              <p className="text-sm leading-relaxed text-foreground/80">{tool.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="가격 정책" value={tool.price} />
                <Info
                  label="지원 플랫폼"
                  value={
                    <div className="flex gap-2">
                      {tool.platforms.map((p) => (
                        <span key={p} className="flex items-center gap-1 text-xs">
                          {p === "web" ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
                          {p}
                        </span>
                      ))}
                    </div>
                  }
                />
              </div>

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  추천 용도
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tool.useCases.map((u) => (
                    <Badge key={u} variant="secondary" className="font-normal">{u}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (href) {
                      window.open(href, "_blank", "noopener,noreferrer")
                    }
                  }}
                >
                  <ExternalLink className="size-4" />
                  {isMobile ? "앱에서 열기" : "공식 홈페이지 방문"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copy(tool.websiteUrl, "링크가 복사되었습니다")}
                >
                  링크 복사
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-accent/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  )
}


