import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { AIToolDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

function mapTool(t: any): AIToolDTO {
  return {
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    category: t.category,
    icon: t.icon,
    price: t.price,
    platforms: safeParse(t.platforms),
    useCases: safeParse(t.useCases),
    websiteUrl: t.websiteUrl,
    featured: t.featured,
    createdAt: t.createdAt.toISOString(),
  }
}

function safeParse(s: string | null | undefined): string[] {
  if (!s) return []
  try { return JSON.parse(s) } catch { return [] }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const featured = searchParams.get("featured")

  const where: any = {}
  if (category && category !== "전체") where.category = category
  if (featured === "true") where.featured = true

  const tools = await db.aITool.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json({ tools: tools.map(mapTool) })
}
