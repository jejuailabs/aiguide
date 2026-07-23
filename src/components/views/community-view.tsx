"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Heart, MessageCircle, Pin, Sparkles, TrendingUp, Search, Plus, Loader2, Check,
  CalendarDays, ImageIcon, Upload, X,
} from "lucide-react"
import { useFetch, timeAgo } from "@/lib/hooks"
import { useAuth } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { LoginModal } from "@/components/auth/login-modal"
import { ViewHeader } from "@/components/views/view-header"
import {
  COMMUNITY_CATEGORY_LABELS, POSTER_REQUIRED_CATEGORY, type CommunityPostDTO,
} from "@/lib/types"
import { uploadPoster } from "@/lib/upload"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const CATEGORY_ORDER = ["전체", "event", "question", "prompt-share", "use-case", "news"] as const

const CAT_STYLES: Record<string, string> = {
  event: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  question: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  "prompt-share": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "use-case": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  news: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
}

export function CommunityView() {
  const [category, setCategory] = React.useState<string>("전체")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<CommunityPostDTO | null>(null)
  const [liked, setLiked] = React.useState<Set<string>>(new Set())
  const [writeOpen, setWriteOpen] = React.useState(false)
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [localPosts, setLocalPosts] = React.useState<CommunityPostDTO[]>([])

  const { user, hydrate } = useAuth()
  React.useEffect(() => { hydrate() }, [hydrate])

  const { data, loading } = useFetch<{ posts: CommunityPostDTO[] }>(
    `/api/community?category=${encodeURIComponent(category)}`
  )

  // 포스터 스트립은 카테고리 필터와 무관하게 항상 강의·모임 글을 보여준다
  const { data: eventData } = useFetch<{ posts: CommunityPostDTO[] }>(
    `/api/community?category=${POSTER_REQUIRED_CATEGORY}`
  )

  // 서버 데이터가 갱신되면 로컬 추가분 초기화
  React.useEffect(() => { setLocalPosts([]) }, [data])

  const posts = React.useMemo(() => {
    const server = data?.posts ?? []
    const visible = localPosts.filter(
      (p) => category === "전체" || p.category === category
    )
    return [...visible, ...server]
  }, [data, localPosts, category])

  // 포스터가 있는 강의·모임 글 (서버 + 방금 작성한 로컬 글)
  const eventPosts = React.useMemo(() => {
    const server = eventData?.posts ?? []
    const local = localPosts.filter((p) => p.category === POSTER_REQUIRED_CATEGORY)
    return [...local, ...server].filter((p) => !!p.poster)
  }, [eventData, localPosts])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return posts
    const q = query.toLowerCase()
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    )
  }, [posts, query])

  const onWriteClick = () => {
    if (!user || user.tier === "guest") {
      setLoginOpen(true)
      return
    }
    setWriteOpen(true)
  }

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ViewHeader
        eyebrow="커뮤니티"
        title="AI 지식을 함께 나누는 공간"
        desc="질문과 답변, 프롬프트 공유, AI 활용 사례, 최신 AI 뉴스까지. 서로의 경험으로 함께 성장합니다."
      />

      {/* 강의·모임 포스터 (게시글 목록과 별개로 상단 노출) */}
      <PosterStrip posts={eventPosts} onOpen={(p) => setSelected(p)} />

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="게시글 검색"
            className="h-11 rounded-2xl pl-11"
          />
        </div>
        <Button className="h-11 rounded-2xl" onClick={onWriteClick}>
          <Plus className="size-4" /> 글쓰기
        </Button>
      </div>

      {/* Category tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {CATEGORY_ORDER.map((c) => (
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
            {c === "전체" ? "전체" : COMMUNITY_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="mt-8 space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/50" />
            ))
          : filtered.map((p, i) => (
              <PostRow
                key={p.id}
                post={p}
                index={i}
                isLiked={liked.has(p.id)}
                onLike={() => toggleLike(p.id)}
                onOpen={() => setSelected(p)}
              />
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <Sparkles className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">게시글이 없습니다.</p>
        </div>
      )}

      <PostDialog post={selected} onClose={() => setSelected(null)} isLiked={selected ? liked.has(selected.id) : false} onLike={() => selected && toggleLike(selected.id)} />

      <WriteDialog
        open={writeOpen}
        onOpenChange={setWriteOpen}
        authorName={user?.name ?? ""}
        defaultCategory={category === "전체" ? "question" : category}
        onCreated={(post) => setLocalPosts((l) => [post, ...l])}
      />

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}

/** 강의·모임 포스터 스트립 — 세로형 포스터를 한 줄에 5개씩 노출 */
function PosterStrip({
  posts,
  onOpen,
}: {
  posts: CommunityPostDTO[]
  onOpen: (p: CommunityPostDTO) => void
}) {
  if (posts.length === 0) return null

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="size-4 text-violet-500" />
        <h2 className="font-serif text-lg font-semibold tracking-tight">강의 · 모임 안내</h2>
        <Badge variant="secondary" className="text-[0.65rem]">{posts.length}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {posts.slice(0, 10).map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
            onClick={() => onOpen(p)}
            className="group overflow-hidden rounded-xl border border-border/60 bg-card text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.poster!}
                alt={p.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="p-2.5">
              <h3 className="line-clamp-2 text-xs font-medium leading-snug transition-colors group-hover:text-primary">
                {p.title}
              </h3>
              <p className="mt-1 text-[0.65rem] text-muted-foreground">{timeAgo(p.createdAt)}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

function WriteDialog({
  open,
  onOpenChange,
  authorName,
  defaultCategory,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  authorName: string
  defaultCategory: string
  onCreated: (post: CommunityPostDTO) => void
}) {
  const [form, setForm] = React.useState({ title: "", content: "", category: defaultCategory, tags: "" })
  const [saving, setSaving] = React.useState(false)
  const [poster, setPoster] = React.useState("")
  const [uploading, setUploading] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const isEvent = form.category === POSTER_REQUIRED_CATEGORY

  React.useEffect(() => {
    if (open) { setForm((f) => ({ ...f, category: defaultCategory })); setPoster("") }
  }, [open, defaultCategory])

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPoster(file)
      setPoster(url)
      toast.success("포스터가 업로드되었습니다")
    } catch (e: any) {
      toast.error(e?.message ?? "업로드 실패 · 이미지 URL을 직접 입력해 주세요")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("제목과 내용을 입력하세요")
      return
    }
    if (isEvent && !poster.trim()) {
      toast.error("강의·모임 안내는 포스터 이미지가 필수입니다")
      return
    }
    setSaving(true)
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          category: form.category,
          poster: poster.trim() || null,
          tags,
          author: authorName,
          featured: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "등록 실패")
      onCreated(data.post)
      setForm({ title: "", content: "", category: defaultCategory, tags: "" })
      setPoster("")
      onOpenChange(false)
      toast.success("게시글이 등록되었습니다")
    } catch (e: any) {
      toast.error(e.message ?? "등록에 실패했습니다")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">새 글 작성</DialogTitle>
          <DialogDescription>
            {authorName} 님의 이름으로 등록됩니다
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {["event", "question", "prompt-share", "use-case", "news"].map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, category: c }))}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                    form.category === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {COMMUNITY_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          {/* 강의·모임은 세로형 포스터 필수 */}
          {isEvent && (
            <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-3.5">
              <label className="mb-2 block text-sm font-medium">
                포스터 <span className="text-violet-600 dark:text-violet-400">*필수</span>
                <span className="ml-1 font-normal text-muted-foreground">(세로형 권장 · 3:4)</span>
              </label>

              <div className="flex gap-3">
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                  {poster ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={poster} alt="포스터 미리보기" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPoster("")}
                        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur transition-colors hover:bg-background"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground/60">
                      {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImageIcon className="size-5" />}
                      <span className="text-[0.6rem]">{uploading ? "업로드 중" : "미리보기"}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    이미지 업로드
                  </Button>
                  <Input
                    value={poster}
                    onChange={(e) => setPoster(e.target.value)}
                    placeholder="또는 이미지 URL 붙여넣기"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">제목</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={isEvent ? "예) 제주 AI 실전 워크샵 3기 모집" : "제목을 입력하세요"}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">내용</label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="내용을 입력하세요"
              className="min-h-[140px] resize-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">태그 (쉼표로 구분)</label>
            <Input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="AI, 프롬프트, 팁"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            등록
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PostRow({
  post,
  index,
  isLiked,
  onLike,
  onOpen,
}: {
  post: CommunityPostDTO
  index: number
  isLiked: boolean
  onLike: () => void
  onOpen: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25) }}
      className={cn(
        "group flex items-start gap-4 rounded-2xl border bg-card p-4 transition-all hover:shadow-md sm:p-5",
        post.featured ? "border-primary/30" : "border-border/60 hover:border-primary/20"
      )}
    >
      <button onClick={onOpen} className="flex flex-1 items-start gap-4 text-left">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold ring-1 ring-primary/15">
          {post.author.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {post.featured && (
              <Badge variant="outline" className="border-primary/30 text-primary text-[0.6rem]">
                <TrendingUp className="mr-1 size-2.5" /> 추천
              </Badge>
            )}
            <Badge variant="outline" className={cn("text-[0.65rem] font-normal", CAT_STYLES[post.category])}>
              {COMMUNITY_CATEGORY_LABELS[post.category] ?? post.category}
            </Badge>
            <span className="text-xs text-muted-foreground">{post.author}</span>
            <span className="text-xs text-muted-foreground/60">· {timeAgo(post.createdAt)}</span>
          </div>
          <h3 className="font-medium leading-snug transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{post.content}</p>
          {post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-[0.65rem] text-muted-foreground">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </button>
      <div className="flex shrink-0 flex-col gap-2">
        <button
          onClick={onLike}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition-colors",
            isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Heart className={cn("size-3.5", isLiked && "fill-current")} />
          {post.likes + (isLiked ? 1 : 0)}
        </button>
        <button
          onClick={onOpen}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-3.5" />
          {post.comments}
        </button>
      </div>
    </motion.div>
  )
}

function PostDialog({
  post,
  onClose,
  isLiked,
  onLike,
}: {
  post: CommunityPostDTO | null
  onClose: () => void
  isLiked: boolean
  onLike: () => void
}) {
  return (
    <Dialog open={!!post} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        {post && (
          <>
            <DialogHeader className="space-y-3 border-b border-border/50 p-6">
              <div className="flex flex-wrap items-center gap-2">
                {post.featured && (
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    <Pin className="mr-1 size-2.5" /> 추천 게시글
                  </Badge>
                )}
                <Badge variant="outline" className={cn("font-normal", CAT_STYLES[post.category])}>
                  {COMMUNITY_CATEGORY_LABELS[post.category] ?? post.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
              </div>
              <DialogTitle className="font-serif text-2xl font-semibold tracking-tight">
                {post.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold">
                  {post.author.slice(0, 1)}
                </span>
                {post.author}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 p-6">
              {post.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.poster}
                  alt={post.title}
                  className="mx-auto max-h-[60vh] w-auto rounded-xl border border-border/60"
                />
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {post.content}
              </p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">#{t}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={onLike}
                >
                  <Heart className={cn("size-4", isLiked && "fill-current")} />
                  좋아요 {post.likes + (isLiked ? 1 : 0)}
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="size-4" />
                  댓글 {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => toast.info("공유 링크가 복사되었습니다")}>
                  공유
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
