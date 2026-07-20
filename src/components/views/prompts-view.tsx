"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Search, Copy, Heart, ExternalLink, Filter, Flame, Sparkles, Tag,
  Plus, Pencil, Trash2, X,
} from "lucide-react"
import { useFetch, useCopy } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { ViewHeader } from "@/components/views/view-header"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import type { PromptDTO } from "@/lib/types"

const CATEGORIES = ["전체", "이미지", "영상", "문서", "코드", "카피", "마케팅"]

interface PromptForm {
  title: string
  description: string
  body: string
  category: string
  bestModel: string
  tags: string
  runUrl: string
}

const EMPTY_FORM: PromptForm = {
  title: "", description: "", body: "", category: "이미지",
  bestModel: "GPT-4o", tags: "", runUrl: "",
}

export function PromptsView() {
  const [category, setCategory] = React.useState("전체")
  const [query, setQuery] = React.useState("")
  const [activeTag, setActiveTag] = React.useState<string | null>(null)
  const [favOnly, setFavOnly] = React.useState(false)
  const [selected, setSelected] = React.useState<PromptDTO | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const [writeOpen, setWriteOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<PromptDTO | null>(null)

  const { user } = useAuth()
  const isAdmin = user?.tier === "admin"

  const { data, loading } = useFetch<{ prompts: PromptDTO[] }>(
    `/api/prompts?category=${encodeURIComponent(category)}`,
    { deps: [refreshKey] },
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

  const refresh = () => setRefreshKey((k) => k + 1)

  const handleDelete = async (p: PromptDTO) => {
    if (!confirm(`"${p.title}" 프롬프트를 삭제하시겠습니까?`)) return
    const r = await fetch(`/api/prompts/${p.id}`, { method: "DELETE" })
    if (r.ok) {
      toast.success("삭제되었습니다")
      refresh()
    } else {
      toast.error("삭제 실패")
    }
  }

  const handleEdit = (p: PromptDTO) => {
    setEditTarget(p)
    setWriteOpen(true)
  }

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
          {isAdmin && (
            <Button
              className="h-12 rounded-2xl px-5 gap-2"
              onClick={() => { setEditTarget(null); setWriteOpen(true) }}
            >
              <Plus className="size-4" />
              프롬프트 등록
            </Button>
          )}
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
                isAdmin={isAdmin}
                onEdit={() => handleEdit(p)}
                onDelete={() => handleDelete(p)}
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

      {isAdmin && (
        <PromptWriteDialog
          open={writeOpen}
          onOpenChange={(o) => { setWriteOpen(o); if (!o) setEditTarget(null) }}
          editTarget={editTarget}
          onSuccess={refresh}
        />
      )}
    </div>
  )
}

function PromptGridCard({
  prompt,
  index,
  isFav,
  onToggleFav,
  onOpen,
  isAdmin,
  onEdit,
  onDelete,
}: {
  prompt: PromptDTO
  index: number
  isFav: boolean
  onToggleFav: () => void
  onOpen: () => void
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
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
        <div className="flex items-center gap-1">
          {isAdmin && (
            <>
              <button
                onClick={onEdit}
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="수정"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="삭제"
              >
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
          <button
            onClick={onToggleFav}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            aria-label="즐겨찾기"
          >
            <Heart className={cn("size-4", isFav && "fill-primary text-primary")} />
          </button>
        </div>
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

function PromptWriteDialog({
  open,
  onOpenChange,
  editTarget,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editTarget: PromptDTO | null
  onSuccess: () => void
}) {
  const isEdit = !!editTarget
  const [form, setForm] = React.useState<PromptForm>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (editTarget) {
      setForm({
        title: editTarget.title,
        description: editTarget.description,
        body: editTarget.body,
        category: editTarget.category,
        bestModel: editTarget.bestModel,
        tags: editTarget.tags.join(", "),
        runUrl: editTarget.runUrl ?? "",
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editTarget, open])

  const set = (k: keyof PromptForm, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("제목과 본문은 필수입니다")
      return
    }
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      body: form.body.trim(),
      category: form.category,
      bestModel: form.bestModel.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      runUrl: form.runUrl.trim() || null,
    }

    const url = isEdit ? `/api/prompts/${editTarget!.id}` : "/api/prompts"
    const method = isEdit ? "PATCH" : "POST"

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (r.ok) {
      toast.success(isEdit ? "수정되었습니다" : "등록되었습니다")
      onOpenChange(false)
      onSuccess()
    } else {
      toast.error("저장에 실패했습니다")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEdit ? "프롬프트 수정" : "프롬프트 등록"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "프롬프트 정보를 수정합니다." : "새 프롬프트를 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">제목 *</label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="프롬프트 제목"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">설명</label>
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="간단한 설명"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">프롬프트 본문 *</label>
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder="프롬프트 전문을 입력하세요"
              rows={8}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">카테고리</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CATEGORIES.filter((c) => c !== "전체").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">최적 모델</label>
              <Input
                value={form.bestModel}
                onChange={(e) => set("bestModel", e.target.value)}
                placeholder="GPT-4o"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">태그 (쉼표 구분)</label>
            <Input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="마케팅, SNS, 카피"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">실행 URL (선택)</label>
            <Input
              value={form.runUrl}
              onChange={(e) => set("runUrl", e.target.value)}
              placeholder="https://chatgpt.com/..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "저장 중…" : isEdit ? "수정 완료" : "등록"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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

  const [tick, setTick] = React.useState(0)
  React.useEffect(() => setTick((t) => t + 1), [favs])

  return { has: (id: string) => favs.has(id), toggle, size: favs.size, _tick: tick } as {
    has: (id: string) => boolean
    toggle: (id: string) => void
    size: number
    _tick: number
  }
}
