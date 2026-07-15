import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { CommunityPostDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

function safeParse(s: string | null | undefined): string[] {
  if (!s) return []
  try { return JSON.parse(s) } catch { return [] }
}

function mapPost(p: any): CommunityPostDTO {
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    author: p.author,
    authorAvatar: p.authorAvatar,
    likes: p.likes,
    comments: p.comments,
    featured: p.featured,
    tags: safeParse(p.tags),
    createdAt: p.createdAt.toISOString(),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const featured = searchParams.get("featured")

  const where: any = {}
  if (category && category !== "전체") where.category = category
  if (featured === "true") where.featured = true

  const posts = await db.communityPost.findMany({
    where,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  })
  return NextResponse.json({ posts: posts.map(mapPost) })
}
