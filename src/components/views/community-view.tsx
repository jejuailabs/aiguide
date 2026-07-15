"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Heart, MessageCircle, Pin, Sparkles, TrendingUp, Search, Plus,
} from "lucide-react"
import { useFetch, timeAgo } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { ViewHeader } from "@/components/views/view-header"
import { COMMUNITY_CATEGORY_LABELS, type CommunityPostDTO } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const CATEGORY_ORDER = ["전체", "question", "prompt-share", "use-case", "news"] as const

const CAT_STYLES: Record<string, string> = {
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

  const { data, loading } = useFetch<{ posts: CommunityPostDTO[] }>(
    `/api/community?category=${encodeURIComponent(category)}`
  )

  const posts = data?.posts ?? []
  const filtered = React.useMemo(() => {
    if (!query.trim()) return posts
    const q = query.toLowerCase()
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    )
  }, [posts, query])

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
        <Button className="h-11 rounded-2xl" onClick={() => toast.info("게시글 작성은 곧 지원될 예정입니다")}>
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
    </div>
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
