"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Shield, Plus, Trash2, Pencil, Pin, Megaphone, Users, BookOpen, Wrench, Boxes,
  Rocket, RefreshCw, AlertTriangle, Loader2, Check, X,
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
import {
  COMMUNITY_CATEGORY_LABELS, type AnnouncementDTO, type CommunityPostDTO,
  type PromptDTO, type AIToolDTO, type MiniToolDTO, type VibeSolutionDTO,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/* ===================== Field schema ===================== */

type FieldType = "text" | "textarea" | "select" | "switch" | "tags" | "number"

interface FieldDef {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  full?: boolean
}

interface EntityConfig<T> {
  entity: string
  endpoint: string
  responseKey: string
  listKey: string
  fields: FieldDef[]
  toRow: (item: T) => { title: string; sub?: string; badges: React.ReactNode; date: string | null }
  toForm: (item: T) => Record<string, any>
  emptyForm: Record<string, any>
}

/* ===================== Main ===================== */

export function AdminView() {
  const { user, hydrated } = useAuth()
  const { go } = useNav()

  const { data: ann } = useFetch<{ announcements: AnnouncementDTO[] }>("/api/announcements")
  const { data: comm } = useFetch<{ posts: CommunityPostDTO[] }>("/api/community")
  const { data: prompts } = useFetch<{ prompts: PromptDTO[] }>("/api/prompts")
  const { data: tools } = useFetch<{ tools: AIToolDTO[] }>("/api/tools")
  const { data: sols } = useFetch<{ solutions: VibeSolutionDTO[] }>("/api/solutions")
  const { data: minis } = useFetch<{ miniTools: MiniToolDTO[] }>("/api/minitools")

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
    { label: "미니툴", value: minis?.miniTools.length ?? 0, icon: Boxes, color: "text-emerald-500" },
    { label: "솔루션", value: sols?.solutions.length ?? 0, icon: Rocket, color: "text-violet-500" },
    { label: "커뮤니티", value: comm?.posts.length ?? 0, icon: Users, color: "text-sky-500" },
    { label: "공지사항", value: ann?.announcements.length ?? 0, icon: Megaphone, color: "text-primary" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
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
            모든 콘텐츠를 등록·수정·삭제할 수 있습니다. 변경사항은 메인 화면에 자동 반영됩니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="size-3.5" /> 새로고침
          </Button>
        </div>
      </motion.div>

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

      <Tabs defaultValue="announcements" className="mt-8">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-muted/40 p-1.5 no-scrollbar">
          {[
            { v: "announcements", icon: Megaphone, label: "공지사항" },
            { v: "community", icon: Users, label: "커뮤니티" },
            { v: "prompts", icon: BookOpen, label: "프롬프트" },
            { v: "tools", icon: Wrench, label: "AI 도구" },
            { v: "solutions", icon: Rocket, label: "솔루션" },
            { v: "minitools", icon: Boxes, label: "미니툴" },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="shrink-0 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <t.icon className="size-3.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="announcements" className="mt-5">
          <CrudManager
            config={ANNOUNCEMENT_CONFIG}
            initial={ann?.announcements ?? []}
            loading={!ann}
          />
        </TabsContent>
        <TabsContent value="community" className="mt-5">
          <CrudManager
            config={communityConfig(user.name)}
            initial={comm?.posts ?? []}
            loading={!comm}
          />
        </TabsContent>
        <TabsContent value="prompts" className="mt-5">
          <CrudManager
            config={PROMPT_CONFIG}
            initial={prompts?.prompts ?? []}
            loading={!prompts}
          />
        </TabsContent>
        <TabsContent value="tools" className="mt-5">
          <CrudManager
            config={TOOL_CONFIG}
            initial={tools?.tools ?? []}
            loading={!tools}
          />
        </TabsContent>
        <TabsContent value="solutions" className="mt-5">
          <CrudManager
            config={SOLUTION_CONFIG}
            initial={sols?.solutions ?? []}
            loading={!sols}
          />
        </TabsContent>
        <TabsContent value="minitools" className="mt-5">
          <CrudManager
            config={MINITOOL_CONFIG}
            initial={minis?.miniTools ?? []}
            loading={!minis}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ===================== Generic CRUD manager ===================== */

function CrudManager<T extends { id: string }>({
  config,
  initial,
  loading,
}: {
  config: EntityConfig<T>
  initial: T[]
  loading: boolean
}) {
  const [list, setList] = React.useState<T[]>(initial)
  React.useEffect(() => setList(initial), [initial])

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<T | null>(null)
  const [form, setForm] = React.useState<Record<string, any>>(config.emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<T | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...config.emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (item: T) => {
    setEditing(item)
    setForm(config.toForm(item))
    setDialogOpen(true)
  }

  const buildPayload = () => {
    const payload: Record<string, any> = {}
    for (const f of config.fields) {
      const v = form[f.key]
      if (f.type === "tags") {
        payload[f.key] = typeof v === "string"
          ? v.split(",").map((s) => s.trim()).filter(Boolean)
          : Array.isArray(v) ? v : []
      } else if (f.type === "number") {
        payload[f.key] = Number(v) || 0
      } else if (f.type === "switch") {
        payload[f.key] = !!v
      } else {
        payload[f.key] = v ?? ""
      }
    }
    return payload
  }

  const submit = async () => {
    const missing = config.fields.filter((f) => f.required && !String(form[f.key] ?? "").trim())
    if (missing.length > 0) {
      toast.error(`${missing.map((m) => m.label).join(", ")}을(를) 입력하세요`)
      return
    }
    setSaving(true)
    try {
      const payload = buildPayload()
      const url = editing ? `${config.endpoint}/${editing.id}` : config.endpoint
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "저장 실패")

      if (editing) {
        setList((l) => l.map((x) => (x.id === editing.id ? ({ ...x, ...payload } as T) : x)))
        toast.success("수정되었습니다")
      } else {
        const created = data[config.responseKey]
        if (created) setList((l) => [created as T, ...l])
        toast.success("등록되었습니다")
      }
      setDialogOpen(false)
      setEditing(null)
      setForm({ ...config.emptyForm })
    } catch (e: any) {
      toast.error(e.message ?? "저장에 실패했습니다")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: T) => {
    try {
      const res = await fetch(`${config.endpoint}/${item.id}`, { method: "DELETE" })
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
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg font-semibold tracking-tight">{config.entity} 관리</h3>
          <Badge variant="secondary" className="text-[0.65rem]">{list.length}개</Badge>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> 새 {config.entity} 등록
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
            ))}
          </>
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
            등록된 {config.entity}이(가) 없습니다
          </div>
        ) : (
          list.map((item) => {
            const row = config.toRow(item)
            return (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-colors hover:border-border"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{row.title}</p>
                    {row.badges}
                  </div>
                  {row.sub && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{row.sub}</p>}
                </div>
                {row.date && (
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {timeAgo(row.date)}
                  </span>
                )}
                <button
                  onClick={() => openEdit(item)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="수정"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="삭제"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? `${config.entity} 수정` : `새 ${config.entity} 등록`}
            </DialogTitle>
            <DialogDescription>메인 화면에 즉시 반영됩니다</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.key} className={cn(f.full || f.type === "textarea" ? "sm:col-span-2" : "")}>
                <label className="mb-1.5 block text-sm font-medium">
                  {f.label}
                  {f.required && <span className="ml-1 text-destructive">*</span>}
                </label>
                <FieldInput
                  field={f}
                  value={form[f.key]}
                  onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {editing ? "수정" : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" /> 정말 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget ? config.toRow(deleteTarget).title : ""}
              </span>{" "}
              항목이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><X className="size-4" /> 취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && remove(deleteTarget)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="size-4" /> 삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: any
  onChange: (v: any) => void
}) {
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="min-h-[100px] resize-none"
        />
      )
    case "select":
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )
    case "switch":
      return (
        <div className="flex h-10 items-center">
          <Switch checked={!!value} onCheckedChange={onChange} />
        </div>
      )
    case "number":
      return (
        <Input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )
    default:
      return (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )
  }
}

/* ===================== Entity configs ===================== */

const ANNOUNCEMENT_CONFIG: EntityConfig<AnnouncementDTO> = {
  entity: "공지사항",
  endpoint: "/api/announcements",
  responseKey: "announcement",
  listKey: "announcements",
  fields: [
    { key: "title", label: "제목", type: "text", required: true, full: true, placeholder: "공지 제목" },
    { key: "content", label: "내용", type: "textarea", required: true, placeholder: "공지 내용" },
    {
      key: "type", label: "유형", type: "select",
      options: [
        { value: "notice", label: "공지" },
        { value: "update", label: "업데이트" },
        { value: "event", label: "이벤트" },
      ],
    },
    { key: "pinned", label: "상단 고정", type: "switch" },
  ],
  emptyForm: { title: "", content: "", type: "notice", pinned: false },
  toForm: (a) => ({ title: a.title, content: a.content, type: a.type, pinned: a.pinned }),
  toRow: (a) => ({
    title: a.title,
    sub: a.content,
    date: a.createdAt,
    badges: (
      <>
        {a.pinned && (
          <Badge variant="outline" className="border-primary/30 text-primary text-[0.6rem]">
            <Pin className="mr-1 size-2.5" />고정
          </Badge>
        )}
        <Badge variant="outline" className="text-[0.6rem]">
          {a.type === "event" ? "이벤트" : a.type === "update" ? "업데이트" : "공지"}
        </Badge>
      </>
    ),
  }),
}

function communityConfig(adminName: string): EntityConfig<CommunityPostDTO> {
  return {
    entity: "게시글",
    endpoint: "/api/community",
    responseKey: "post",
    listKey: "posts",
    fields: [
      { key: "title", label: "제목", type: "text", required: true, full: true, placeholder: "글 제목" },
      { key: "content", label: "내용", type: "textarea", required: true, placeholder: "글 내용" },
      {
        key: "category", label: "카테고리", type: "select",
        options: [
          { value: "event", label: "강의·모임" },
          { value: "question", label: "질문·답변" },
          { value: "prompt-share", label: "프롬프트 공유" },
          { value: "use-case", label: "활용 사례" },
          { value: "news", label: "AI 뉴스" },
        ],
      },
      { key: "poster", label: "포스터 이미지 URL (강의·모임 필수)", type: "text", full: true, placeholder: "https://… (세로형 3:4)" },
      { key: "author", label: "작성자", type: "text", placeholder: "작성자명" },
      { key: "tags", label: "태그 (쉼표 구분)", type: "tags", full: true, placeholder: "AI, 프롬프트, 팁" },
      { key: "featured", label: "추천 게시글", type: "switch" },
    ],
    emptyForm: { title: "", content: "", category: "use-case", author: adminName, tags: "", featured: false, poster: "" },
    toForm: (p) => ({
      title: p.title, content: p.content, category: p.category,
      author: p.author, tags: p.tags.join(", "), featured: p.featured,
      poster: p.poster ?? "",
    }),
    toRow: (p) => ({
      title: p.title,
      sub: p.content,
      date: p.createdAt,
      badges: (
        <>
          <Badge variant="outline" className="text-[0.6rem]">
            {COMMUNITY_CATEGORY_LABELS[p.category] ?? p.category}
          </Badge>
          {p.featured && (
            <Badge variant="outline" className="border-primary/30 text-primary text-[0.6rem]">추천</Badge>
          )}
          <span className="text-[0.65rem] text-muted-foreground">{p.author}</span>
        </>
      ),
    }),
  }
}

const PROMPT_CONFIG: EntityConfig<PromptDTO> = {
  entity: "프롬프트",
  endpoint: "/api/prompts",
  responseKey: "prompt",
  listKey: "prompts",
  fields: [
    { key: "title", label: "제목", type: "text", required: true, placeholder: "프롬프트 제목" },
    { key: "category", label: "카테고리", type: "text", placeholder: "글쓰기, 코딩, 이미지…" },
    { key: "description", label: "설명", type: "text", full: true, placeholder: "한 줄 설명" },
    { key: "body", label: "프롬프트 본문", type: "textarea", required: true, placeholder: "실제 프롬프트 내용" },
    { key: "bestModel", label: "추천 모델", type: "text", placeholder: "Claude, GPT-4o…" },
    { key: "version", label: "버전", type: "text", placeholder: "1.0" },
    { key: "runUrl", label: "실행 URL", type: "text", full: true, placeholder: "https://…" },
    { key: "tags", label: "태그 (쉼표 구분)", type: "tags", full: true, placeholder: "블로그, SEO" },
  ],
  emptyForm: {
    title: "", description: "", body: "", category: "기타",
    bestModel: "GPT-4o", version: "1.0", runUrl: "", tags: "",
  },
  toForm: (p) => ({
    title: p.title, description: p.description, body: p.body, category: p.category,
    bestModel: p.bestModel, version: p.version, runUrl: p.runUrl ?? "", tags: p.tags.join(", "),
  }),
  toRow: (p) => ({
    title: p.title,
    sub: p.description,
    date: p.createdAt,
    badges: (
      <>
        <Badge variant="outline" className="text-[0.6rem]">{p.category}</Badge>
        <span className="text-[0.65rem] text-muted-foreground">{p.bestModel}</span>
      </>
    ),
  }),
}

const TOOL_CONFIG: EntityConfig<AIToolDTO> = {
  entity: "AI 도구",
  endpoint: "/api/tools",
  responseKey: "tool",
  listKey: "tools",
  fields: [
    { key: "name", label: "도구명", type: "text", required: true, placeholder: "ChatGPT" },
    { key: "category", label: "카테고리", type: "text", placeholder: "대화형 AI, 이미지 생성…" },
    { key: "tagline", label: "한 줄 소개", type: "text", full: true, placeholder: "OpenAI의 대화형 AI 어시스턴트" },
    { key: "description", label: "설명", type: "textarea", placeholder: "상세 설명" },
    { key: "websiteUrl", label: "웹사이트 URL", type: "text", required: true, placeholder: "https://…" },
    { key: "icon", label: "아이콘 (lucide 이름)", type: "text", placeholder: "MessageSquare" },
    {
      key: "price", label: "가격", type: "select",
      options: [
        { value: "무료", label: "무료" },
        { value: "부분 무료", label: "부분 무료" },
        { value: "유료", label: "유료" },
      ],
    },
    { key: "platforms", label: "플랫폼 (쉼표 구분)", type: "tags", placeholder: "web, ios, android" },
    { key: "useCases", label: "활용 사례 (쉼표 구분)", type: "tags", full: true, placeholder: "글쓰기, 코딩, 분석" },
    { key: "featured", label: "추천 도구", type: "switch" },
    { key: "order", label: "정렬 순서", type: "number" },
  ],
  emptyForm: {
    name: "", tagline: "", description: "", category: "기타", icon: "Sparkles",
    price: "무료", platforms: "", useCases: "", websiteUrl: "", featured: false, order: 0,
  },
  toForm: (t) => ({
    name: t.name, tagline: t.tagline, description: t.description, category: t.category,
    icon: t.icon, price: t.price, platforms: t.platforms.join(", "),
    useCases: t.useCases.join(", "), websiteUrl: t.websiteUrl, featured: t.featured, order: 0,
  }),
  toRow: (t) => ({
    title: t.name,
    sub: t.tagline,
    date: t.createdAt,
    badges: (
      <>
        <Badge variant="outline" className="text-[0.6rem]">{t.category}</Badge>
        <Badge variant="outline" className="text-[0.6rem]">{t.price}</Badge>
        {t.featured && (
          <Badge variant="outline" className="border-primary/30 text-primary text-[0.6rem]">추천</Badge>
        )}
      </>
    ),
  }),
}

const SOLUTION_CONFIG: EntityConfig<VibeSolutionDTO> = {
  entity: "솔루션",
  endpoint: "/api/solutions",
  responseKey: "solution",
  listKey: "solutions",
  fields: [
    { key: "title", label: "제목", type: "text", required: true, placeholder: "AI 챗봇 대시보드" },
    { key: "category", label: "카테고리", type: "text", placeholder: "고객 서비스, 마케팅…" },
    { key: "tagline", label: "한 줄 소개", type: "text", full: true, placeholder: "고객 상담 AI 챗봇 관리 시스템" },
    { key: "description", label: "설명", type: "textarea", placeholder: "상세 설명" },
    { key: "url", label: "서비스 URL", type: "text", required: true, placeholder: "https://…" },
    { key: "thumbnail", label: "썸네일 경로", type: "text", placeholder: "/logo.svg" },
    { key: "purpose", label: "제작 목적", type: "text", full: true, placeholder: "고객 상담 자동화" },
    { key: "features", label: "주요 기능 (쉼표 구분)", type: "tags", full: true, placeholder: "실시간 모니터링, 성능 분석" },
    { key: "aiUsed", label: "사용 AI (쉼표 구분)", type: "tags", placeholder: "GPT-4o, Claude" },
    { key: "techStack", label: "기술 스택 (쉼표 구분)", type: "tags", placeholder: "Next.js, Firebase" },
    { key: "featured", label: "추천 솔루션", type: "switch" },
    { key: "order", label: "정렬 순서", type: "number" },
  ],
  emptyForm: {
    title: "", tagline: "", description: "", url: "", thumbnail: "/logo.svg",
    features: "", purpose: "", category: "기타", aiUsed: "", techStack: "",
    featured: false, order: 0,
  },
  toForm: (s) => ({
    title: s.title, tagline: s.tagline, description: s.description, url: s.url,
    thumbnail: s.thumbnail, features: s.features.join(", "), purpose: s.purpose,
    category: s.category, aiUsed: s.aiUsed.join(", "), techStack: s.techStack.join(", "),
    featured: s.featured, order: 0,
  }),
  toRow: (s) => ({
    title: s.title,
    sub: s.tagline,
    date: s.createdAt,
    badges: (
      <>
        <Badge variant="outline" className="text-[0.6rem]">{s.category}</Badge>
        {s.featured && (
          <Badge variant="outline" className="border-primary/30 text-primary text-[0.6rem]">추천</Badge>
        )}
      </>
    ),
  }),
}

const MINITOOL_CONFIG: EntityConfig<MiniToolDTO> = {
  entity: "미니툴",
  endpoint: "/api/minitools",
  responseKey: "miniTool",
  listKey: "miniTools",
  fields: [
    { key: "name", label: "도구명", type: "text", required: true, placeholder: "QR 코드 생성기" },
    { key: "category", label: "카테고리", type: "text", placeholder: "변환, 개발, 문서…" },
    { key: "description", label: "설명", type: "textarea", placeholder: "도구 설명" },
    { key: "icon", label: "아이콘 (lucide 이름)", type: "text", placeholder: "QrCode" },
    {
      key: "actionType", label: "동작 유형", type: "select",
      options: [
        { value: "qr", label: "QR 코드" },
        { value: "json", label: "JSON 포맷터" },
        { value: "base64", label: "Base64" },
        { value: "markdown", label: "마크다운" },
        { value: "url-encode", label: "URL 인코딩" },
        { value: "text-case", label: "텍스트 변환" },
        { value: "static", label: "정적(링크)" },
      ],
    },
    { key: "isInteractive", label: "인터랙티브", type: "switch" },
    { key: "order", label: "정렬 순서", type: "number" },
  ],
  emptyForm: {
    name: "", description: "", icon: "Boxes", category: "기타",
    actionType: "static", isInteractive: true, order: 0,
  },
  toForm: (m) => ({
    name: m.name, description: m.description, icon: m.icon, category: m.category,
    actionType: m.actionType, isInteractive: m.isInteractive, order: m.order,
  }),
  toRow: (m) => ({
    title: m.name,
    sub: m.description,
    date: null,
    badges: (
      <>
        <Badge variant="outline" className="text-[0.6rem]">{m.category}</Badge>
        <Badge variant="outline" className="text-[0.6rem]">{m.actionType}</Badge>
      </>
    ),
  }),
}
