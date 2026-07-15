"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Shield, Plus, Trash2, Pin, Megaphone, Users, BookOpen, Wrench, Boxes,
  Rocket, TrendingUp, RefreshCw, AlertTriangle, Loader2, Check, X,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useNav } from "@/lib/store"
import { useFetch, timeAgo } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { COMMUNITY_CATEGORY_LABELS, type AnnouncementDTO, type CommunityPostDTO, type PromptDTO, type AIToolDTO, type MiniToolDTO, type VibeSolutionDTO } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Section = "overview" | "announcements" | "community" | "prompts" | "tools" | "solutions" | "minitools"

export function AdminView() {
  const { user, hydrated } = useAuth()
  const { go } = useNav()

  const { data: ann } = useFetch<{ announcements: AnnouncementDTO[] }>("/api/announcements")
  const { data: comm } = useFetch<{ posts: CommunityPostDTO[] }>("/api/community")
  const { data: prompts } = useFetch<{ prompts: PromptDTO[] }>("/api/prompts")
  const { data: tools } = useFetch<{ tools: AIToolDTO[] }>("/api/tools")
  const { data: sols } = useFetch<{ solutions: VibeSolutionDTO[] }>("/api/solutions")
  const { data: meta } = useFetch<{ miniTools: MiniToolDTO[] }>("/api/meta-templates")

  if (!hydrated) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-muted-foreground">로딩 중…</div>
  }

  if (!user || user.tier !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10">
          <Shield className="size-7 text-amber-500" />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight">관리자 권한이 필요합니다</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin 대시보드는 관리자 계정으로 로그인한 사용자만 접근할 수 있습니다.
        </p>
        <Button className="mt-6" onClick={() => go("home")}>홈으로 돌아가기</Button>
      </div>
    )
  }

  const stats = [
    { label: "AI 도구", value: tools?.tools.length ?? 0, icon: Wrench, color: "text-amber-500" },
    { label: "프롬프트", value: prompts?.prompts.length ?? 0, icon: BookOpen, color: "text-rose-500" },
    { label: "미니툴", value: meta?.miniTools.length ?? 0, icon: Boxes, color: "text-emerald-500" },
    { label: "솔루션", value: sols?.solutions.length ?? 0, icon: Rocket, color: "text-violet-500" },
    { label: "커뮤니티", value: comm?.posts.length ?? 0, icon: Users, color: "text-sky-500" },
    { label: "공지사항", value: ann?.announcements.length ?? 0, icon: Megaphone, color: "text-primary" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Admin header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Shield className="size-3" /> Admin Dashboard
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            콘텐츠 관리 센터
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            모든 콘텐츠를 CRUD로 관리합니다. 변경사항은 메인 화면에 자동 반영됩니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="size-3.5" /> 새로고침
          </Button>
        </div>
      </motion.div>

      {/* Overview stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Card className="p-4">
              <s.icon className={cn("size-4", s.color)} />
              <div className="mt-2 font-serif text-2xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Management tabs */}
      <Tabs defaultValue="announcements" className="mt-8">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-muted/40 p-1.5 no-scrollbar">
          <TabsTrigger value="announcements" className="shrink-0 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Megaphone className="size-3.5" /> 공지사항
          </TabsTrigger>
          <TabsTrigger value="community" className="shrink-0 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="size-3.5" /> 커뮤니티
          </TabsTrigger>
          <TabsTrigger value="prompts" className="shrink-0 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BookOpen className="size-3.5" /> 프롬프트
          </TabsTrigger>
          <TabsTrigger value="tools" className="shrink-0 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Wrench className="size-3.5" /> AI 도구
          </TabsTrigger>
          <TabsTrigger value="solutions" className="shrink-0 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Rocket className="size-3.5" /> 솔루션
          </TabsTrigger>
          <TabsTrigger value="minitools" className="shrink-0 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Boxes className="size-3.5" /> 미니툴
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-5">
          <AnnouncementsManager items={ann?.announcements ?? []} loading={!ann} />
        </TabsContent>
        <TabsContent value="community" className="mt-5">
          <CommunityManager items={comm?.posts ?? []} loading={!comm} authorName={user.name} />
        </TabsContent>
        <TabsContent value="prompts" className="mt-5">
          <SimpleManager
            items={(prompts?.prompts ?? []).map((p) => ({ id: p.id, title: p.title, sub: p.category, extra: `${p.favorites} 즐겨찾기`, date: p.createdAt }))}
            loading={!prompts}
            deleteUrl={(id) => `/api/prompts/${id}`}
            entity="프롬프트"
          />
        </TabsContent>
        <TabsContent value="tools" className="mt-5">
          <ReadonlyTable
            items={(tools?.tools ?? []).map((t) => ({ id: t.id, title: t.name, sub: t.category, extra: t.price, date: t.createdAt }))}
            loading={!tools}
            entity="AI 도구"
          />
        </TabsContent>
        <TabsContent value="solutions" className="mt-5">
          <ReadonlyTable
            items={(sols?.solutions ?? []).map((s) => ({ id: s.id, title: s.title, sub: s.category, extra: s.featured ? "추천" : "-", date: s.createdAt }))}
            loading={!sols}
            entity="솔루션"
          />
        </TabsContent>
        <TabsContent value="minitools" className="mt-5">
          <ReadonlyTable
            items={(meta?.miniTools ?? []).map((m) => ({ id: m.id, title: m.name, sub: m.category, extra: m.actionType, date: null }))}
            loading={!meta}
            entity="미니툴"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ============== Announcements Manager (full CRUD) ============== */
function AnnouncementsManager({
  items,
  loading,
}: {
  items: AnnouncementDTO[]
  loading: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<AnnouncementDTO | null>(null)
  const [list, setList] = React.useState(items)

  React.useEffect(() => setList(items), [items])

  const [form, setForm] = React.useState({ title: "", content: "", type: "notice", pinned: false })
  const [saving, setSaving] = React.useState(false)

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("제목과 내용을 입력하세요")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setList((l) => [data.announcement, ...l])
      setForm({ title: "", content: "", type: "notice", pinned: false })
      setOpen(false)
      toast.success("공지사항이 등록되었습니다")
    } catch (e: any) {
      toast.error(e.message ?? "등록 실패")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: AnnouncementDTO) => {
    try {
      const res = await fetch(`/api/announcements/${item.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setList((l) => l.filter((x) => x.id !== item.id))
      toast.success("삭제되었습니다")
    } catch {
      toast.error("삭제 실패")
    }
    setDeleteTarget(null)
  }

  return (
    <div>
      <ManagerHeader
        title="공지사항 관리"
        count={list.length}
        action={{ label: "새 공지 등록", icon: Plus, onClick: () => setOpen(true) }}
      />
      <div className="space-y-2">
        {loading ? (
          <SkeletonRows n={3} />
        ) : list.length === 0 ? (
          <EmptyRow label="공지사항이 없습니다" />
        ) : (
          list.map((a) => (
            <Row
              key={a.id}
              title={a.title}
              sub={a.content}
              badge={
                <>
                  {a.pinned && <Badge variant="outline" className="border-primary/30 text-primary text-[0.6rem]"><Pin className="mr-1 size-2.5" />고정</Badge>}
                  <Badge variant="outline" className="text-[0.6rem]">{typeLabel(a.type)}</Badge>
                </>
              }
              date={a.createdAt}
              onDelete={() => setDeleteTarget(a)}
            />
          ))
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">새 공지사항 등록</DialogTitle>
            <DialogDescription>메인 화면에 즉시 반영됩니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">제목</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="공지 제목" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">내용</label>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="공지 내용" className="min-h-[100px] resize-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">유형</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="notice">공지</option>
                  <option value="update">업데이트</option>
                  <option value="event">이벤트</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.pinned} onCheckedChange={(c) => setForm((f) => ({ ...f, pinned: c }))} />
                상단 고정
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}

/* ============== Community Manager (create + delete) ============== */
function CommunityManager({
  items,
  loading,
  authorName,
}: {
  items: CommunityPostDTO[]
  loading: boolean
  authorName: string
}) {
  const [open, setOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<CommunityPostDTO | null>(null)
  const [list, setList] = React.useState(items)
  React.useEffect(() => setList(items), [items])

  const [form, setForm] = React.useState({ title: "", content: "", category: "use-case", tags: "", featured: false })
  const [saving, setSaving] = React.useState(false)

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("제목과 내용을 입력하세요")
      return
    }
    setSaving(true)
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags, author: authorName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setList((l) => [data.post, ...l])
      setForm({ title: "", content: "", category: "use-case", tags: "", featured: false })
      setOpen(false)
      toast.success("게시글이 등록되었습니다")
    } catch (e: any) {
      toast.error(e.message ?? "등록 실패")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: CommunityPostDTO) => {
    try {
      const res = await fetch(`/api/community/${item.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setList((l) => l.filter((x) => x.id !== item.id))
      toast.success("삭제되었습니다")
    } catch {
      toast.error("삭제 실패")
    }
    setDeleteTarget(null)
  }

  return (
    <div>
      <ManagerHeader
        title="커뮤니티 관리"
        count={list.length}
        action={{ label: "새 글 작성", icon: Plus, onClick: () => setOpen(true) }}
      />
      <div className="space-y-2">
        {loading ? (
          <SkeletonRows n={4} />
        ) : list.length === 0 ? (
          <EmptyRow label="게시글이 없습니다" />
        ) : (
          list.map((p) => (
            <Row
              key={p.id}
              title={p.title}
              sub={p.content}
              badge={
                <>
                  <Badge variant="outline" className="text-[0.6rem]">{COMMUNITY_CATEGORY_LABELS[p.category] ?? p.category}</Badge>
                  {p.featured && <Badge variant="outline" className="border-primary/30 text-primary text-[0.6rem]">추천</Badge>}
                  <span className="text-[0.65rem] text-muted-foreground">{p.author}</span>
                </>
              }
              date={p.createdAt}
              onDelete={() => setDeleteTarget(p)}
            />
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">새 커뮤니티 글 작성</DialogTitle>
            <DialogDescription>관리자 명의로 등록됩니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">제목</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="글 제목" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">내용</label>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="글 내용" className="min-h-[120px] resize-none" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="question">질문·답변</option>
                  <option value="prompt-share">프롬프트 공유</option>
                  <option value="use-case">활용 사례</option>
                  <option value="news">AI 뉴스</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.featured} onCheckedChange={(c) => setForm((f) => ({ ...f, featured: c }))} />
                추천 게시글
              </label>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">태그 (쉼표 구분)</label>
              <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="AI, 프롬프트, 팁" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}

/* ============== Simple delete-only manager ============== */
function SimpleManager({
  items,
  loading,
  deleteUrl,
  entity,
}: {
  items: { id: string; title: string; sub?: string; extra?: string; date?: string }[]
  loading: boolean
  deleteUrl: (id: string) => string
  entity: string
}) {
  const [deleteTarget, setDeleteTarget] = React.useState<(typeof items)[number] | null>(null)
  const [list, setList] = React.useState(items)
  React.useEffect(() => setList(items), [items])

  const remove = async (item: (typeof items)[number]) => {
    try {
      const res = await fetch(deleteUrl(item.id), { method: "DELETE" })
      if (!res.ok) throw new Error()
      setList((l) => l.filter((x) => x.id !== item.id))
      toast.success("삭제되었습니다")
    } catch {
      toast.error("삭제 실패")
    }
    setDeleteTarget(null)
  }

  return (
    <div>
      <ManagerHeader title={`${entity} 관리`} count={list.length} />
      <div className="space-y-2">
        {loading ? (
          <SkeletonRows n={4} />
        ) : list.length === 0 ? (
          <EmptyRow label={`${entity}이(가) 없습니다`} />
        ) : (
          list.map((it) => (
            <Row
              key={it.id}
              title={it.title}
              sub={it.sub}
              badge={it.extra ? <Badge variant="outline" className="text-[0.6rem]">{it.extra}</Badge> : null}
              date={it.date ?? null}
              onDelete={() => setDeleteTarget(it)}
            />
          ))
        )}
      </div>
      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}

/* ============== Readonly table ============== */
function ReadonlyTable({
  items,
  loading,
  entity,
}: {
  items: { id: string; title: string; sub?: string; extra?: string; date?: string | null }[]
  loading: boolean
  entity: string
}) {
  return (
    <div>
      <ManagerHeader title={`${entity} 목록`} count={items.length} />
      <div className="space-y-2">
        {loading ? (
          <SkeletonRows n={4} />
        ) : items.length === 0 ? (
          <EmptyRow label={`${entity}이(가) 없습니다`} />
        ) : (
          items.map((it) => (
            <Row
              key={it.id}
              title={it.title}
              sub={it.sub}
              badge={it.extra ? <Badge variant="outline" className="text-[0.6rem]">{it.extra}</Badge> : null}
              date={it.date}
              onDelete={null}
            />
          ))
        )}
      </div>
    </div>
  )
}

/* ============== Shared bits ============== */
function ManagerHeader({
  title,
  count,
  action,
}: {
  title: string
  count: number
  action?: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void }
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="font-serif text-lg font-semibold tracking-tight">{title}</h3>
        <Badge variant="secondary" className="text-[0.65rem]">{count}개</Badge>
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          <action.icon className="size-4" /> {action.label}
        </Button>
      )}
    </div>
  )
}

function Row({
  title,
  sub,
  badge,
  date,
  onDelete,
}: {
  title: string
  sub?: string
  badge?: React.ReactNode
  date?: string | null
  onDelete: (() => void) | null
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-colors hover:border-border">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{title}</p>
          {badge}
        </div>
        {sub && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
      {date && <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{timeAgo(date)}</span>}
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="삭제"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  )
}

function SkeletonRows({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
      ))}
    </>
  )
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}

function DeleteDialog({
  open,
  title,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" /> 정말 삭제하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{title}</span> 항목이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel><X className="size-4" /> 취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            <Trash2 className="size-4" /> 삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function typeLabel(t: string) {
  return t === "event" ? "이벤트" : t === "update" ? "업데이트" : "공지"
}
