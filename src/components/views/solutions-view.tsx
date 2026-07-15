"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ExternalLink, Rocket, Sparkles, Target, Wrench, TrendingUp, Wand2 } from "lucide-react"
import { useFetch } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { ViewHeader } from "@/components/views/view-header"
import { Thumb } from "@/components/views/home-view"
import { cn } from "@/lib/utils"
import type { VibeSolutionDTO } from "@/lib/types"

const CATEGORIES = ["전체", "대시보드", "포트폴리오", "콘텐츠", "라이프스타일"]

export function SolutionsView() {
  const [category, setCategory] = React.useState("전체")
  const { data, loading } = useFetch<{ solutions: VibeSolutionDTO[] }>("/api/solutions")
  const [selected, setSelected] = React.useState<VibeSolutionDTO | null>(null)

  const solutions = data?.solutions ?? []
  const filtered = category === "전체" ? solutions : solutions.filter((s) => s.category === category)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ViewHeader
        eyebrow="바이브코딩 솔루션"
        title="AI로 제작된 웹서비스 아카이브"
        desc="바이브코딩으로 실제 제작된 웹서비스를 모아둔 쇼케이스와 레퍼런스 라이브러리입니다. 다양한 사례에서 새로운 영감을 얻으세요."
      />

      {/* Category filter */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
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

      {/* Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted/50" />
            ))
          : filtered.map((s, i) => (
              <SolutionCard key={s.id} solution={s} index={i} onClick={() => setSelected(s)} />
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <Rocket className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">해당 카테고리의 솔루션이 없습니다.</p>
        </div>
      )}

      <SolutionDialog solution={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function SolutionCard({
  solution,
  index,
  onClick,
}: {
  solution: VibeSolutionDTO
  index: number
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      onClick={onClick}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="relative">
        <Thumb slug={solution.thumbnail} title={solution.title} className="aspect-[16/10]" />
        {solution.featured && (
          <Badge className="absolute right-3 top-3 bg-background/80 text-primary backdrop-blur hover:bg-background/90">
            <TrendingUp className="mr-1 size-2.5" />추천
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-[0.65rem]">{solution.category}</Badge>
        </div>
        <h3 className="font-serif text-lg font-semibold tracking-tight">{solution.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {solution.tagline}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {solution.techStack.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline" className="text-[0.6rem] font-normal">{t}</Badge>
          ))}
        </div>
      </div>
    </motion.button>
  )
}

function SolutionDialog({
  solution,
  onClose,
}: {
  solution: VibeSolutionDTO | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!solution} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        {solution && (
          <>
            <div className="relative">
              <Thumb slug={solution.thumbnail} title={solution.title} className="aspect-[16/8]" />
            </div>
            <DialogHeader className="px-6 pt-5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{solution.category}</Badge>
                {solution.featured && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
                    <TrendingUp className="mr-1 size-2.5" />추천 솔루션
                  </Badge>
                )}
              </div>
              <DialogTitle className="font-serif text-2xl font-semibold tracking-tight">
                {solution.title}
              </DialogTitle>
              <DialogDescription>{solution.tagline}</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 p-6">
              <p className="text-sm leading-relaxed text-foreground/80">{solution.description}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-accent/40 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Target className="size-3.5" /> 제작 목적
                  </div>
                  <div className="mt-1.5 text-sm font-medium">{solution.purpose}</div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="size-3.5" /> 주요 기능
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {solution.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {solution.aiUsed.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Wand2 className="size-3.5" /> 사용한 AI
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {solution.aiUsed.map((a) => (
                      <Badge key={a} variant="secondary" className="font-normal">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {solution.techStack.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Wrench className="size-3.5" /> 기술 스택
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {solution.techStack.map((t) => (
                      <Badge key={t} variant="outline" className="font-normal">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => window.open(solution.url, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="size-4" /> 서비스 방문하기
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}


