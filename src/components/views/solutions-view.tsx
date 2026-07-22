"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ExternalLink, Rocket, Sparkles, Target, Wrench, TrendingUp, Wand2,
  Plus, Loader2, Check, Link2, Download, ImageIcon,
} from "lucide-react"
import { useFetch } from "@/lib/hooks"
import { useAuth } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { LoginModal } from "@/components/auth/login-modal"
import { ViewHeader } from "@/components/views/view-header"
import { Thumb } from "@/components/views/home-view"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { VibeSolutionDTO } from "@/lib/types"

const CATEGORIES = ["전체", "대시보드", "포트폴리오", "콘텐츠", "라이프스타일"]
const SUBMIT_CATEGORIES = ["대시보드", "포트폴리오", "콘텐츠", "라이프스타일", "기타"]

export function SolutionsView() {
  const [category, setCategory] = React.useState("전체")
  const { data, loading } = useFetch<{ solutions: VibeSolutionDTO[] }>("/api/solutions")
  const [selected, setSelected] = React.useState<VibeSolutionDTO | null>(null)
  const [submitOpen, setSubmitOpen] = React.useState(false)
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [localItems, setLocalItems] = React.useState<VibeSolutionDTO[]>([])

  const { user, hydrate } = useAuth()
  React.useEffect(() => { hydrate() }, [hydrate])

  // 서버 데이터 갱신 시 로컬 추가분 초기화
  React.useEffect(() => { setLocalItems([]) }, [data])

  const solutions = React.useMemo(
    () => [...localItems, ...(data?.solutions ?? [])],
    [localItems, data]
  )
  const filtered = category === "전체" ? solutions : solutions.filter((s) => s.category === category)

  const onSubmitClick = () => {
    if (!user || user.tier === "guest") {
      setLoginOpen(true)
      return
    }
    setSubmitOpen(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ViewHeader
        eyebrow="바이브코딩 솔루션"
        title="AI로 제작된 웹서비스 아카이브"
        desc="바이브코딩으로 실제 제작된 웹서비스를 모아둔 쇼케이스와 레퍼런스 라이브러리입니다. 다양한 사례에서 새로운 영감을 얻으세요."
      />

      {/* Category filter + submit */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
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
        <Button className="h-10 shrink-0 rounded-full" onClick={onSubmitClick}>
          <Plus className="size-4" /> 솔루션 등록
        </Button>
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
          <Button variant="outline" className="mt-4 rounded-full" onClick={onSubmitClick}>
            <Plus className="size-4" /> 첫 솔루션 등록하기
          </Button>
        </div>
      )}

      <SolutionDialog solution={selected} onClose={() => setSelected(null)} />
      <SubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onCreated={(s) => setLocalItems((l) => [s, ...l])}
      />
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}

function SubmitDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: (s: VibeSolutionDTO) => void
}) {
  const empty = {
    url: "",
    title: "",
    tagline: "",
    thumbnail: "",
    category: "기타",
    techStack: "",
  }
  const [form, setForm] = React.useState(empty)
  const [fetching, setFetching] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [fetched, setFetched] = React.useState(false)

  React.useEffect(() => {
    if (open) { setForm(empty); setFetched(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // URL에서 썸네일/제목/설명 자동 추출
  const grab = async () => {
    if (!form.url.trim()) { toast.error("웹사이트 주소를 입력하세요"); return }
    setFetching(true)
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      })
      const data = await res.json()
      if (data.error && !data.title && !data.thumbnail) {
        toast.error(data.error)
      } else {
        setForm((f) => ({
          ...f,
          url: data.url || f.url,
          thumbnail: data.thumbnail || f.thumbnail,
          title: f.title || data.title || data.siteName || "",
          tagline: f.tagline || data.description || "",
        }))
        setFetched(true)
        toast.success(data.thumbnail ? "썸네일과 정보를 가져왔습니다" : "정보를 가져왔습니다 (썸네일 없음)")
      }
    } catch {
      toast.error("정보를 가져오지 못했습니다. 직접 입력해 주세요.")
    } finally {
      setFetching(false)
    }
  }

  const submit = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("제목과 URL은 필수입니다")
      return
    }
    setSaving(true)
    try {
      const techStack = form.techStack.split(",").map((t) => t.trim()).filter(Boolean)
      const res = await fetch("/api/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          tagline: form.tagline,
          description: form.tagline,
          url: form.url,
          thumbnail: form.thumbnail,
          category: form.category,
          techStack,
          features: [],
          aiUsed: [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "등록 실패")
      onCreated(data.solution)
      onOpenChange(false)
      toast.success("솔루션이 등록되었습니다")
    } catch (e: any) {
      toast.error(e.message ?? "등록에 실패했습니다")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">솔루션 등록</DialogTitle>
          <DialogDescription>
            웹사이트 주소를 입력하고 <span className="text-foreground">가져오기</span>를 누르면
            썸네일과 정보를 자동으로 불러옵니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* URL + 가져오기 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">웹사이트 주소</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); grab() } }}
                  placeholder="https://example.com"
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="secondary" onClick={grab} disabled={fetching}>
                {fetching ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                가져오기
              </Button>
            </div>
          </div>

          {/* 썸네일 미리보기 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">썸네일</label>
            <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
              {form.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.thumbnail}
                  alt="썸네일 미리보기"
                  className="aspect-[16/9] w-full object-cover"
                  onError={() => set("thumbnail", "")}
                />
              ) : (
                <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
                  <ImageIcon className="size-6" />
                  <span className="text-xs">
                    {fetched ? "썸네일을 찾지 못했습니다" : "가져오면 자동으로 표시됩니다"}
                  </span>
                </div>
              )}
            </div>
            <Input
              value={form.thumbnail}
              onChange={(e) => set("thumbnail", e.target.value)}
              placeholder="이미지 URL (선택 · 직접 지정 가능)"
              className="mt-2 text-xs"
            />
          </div>

          {/* 제목 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">제목</label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="서비스 이름"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">설명</label>
            <Textarea
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="이 서비스가 어떤 것인지 한두 문장으로 소개해 주세요"
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {SUBMIT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("category", c)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                    form.category === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 기술 스택 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">기술 스택 <span className="text-muted-foreground">(선택 · 쉼표 구분)</span></label>
            <Input
              value={form.techStack}
              onChange={(e) => set("techStack", e.target.value)}
              placeholder="Next.js, Tailwind, Supabase"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            게시하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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


