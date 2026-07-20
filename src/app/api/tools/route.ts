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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name?.trim() || !body.websiteUrl?.trim()) {
      return NextResponse.json({ error: "도구명과 웹사이트 URL은 필수입니다." }, { status: 400 })
    }
    const created = await db.aITool.create({
      data: {
        name: body.name.trim(),
        tagline: body.tagline?.trim() ?? "",
        description: body.description?.trim() ?? "",
        category: body.category ?? "기타",
        icon: body.icon?.trim() || "Sparkles",
        price: body.price ?? "무료",
        platforms: JSON.stringify(Array.isArray(body.platforms) ? body.platforms : []),
        useCases: JSON.stringify(Array.isArray(body.useCases) ? body.useCases : []),
        websiteUrl: body.websiteUrl.trim(),
        appStoreUrl: null,
        playStoreUrl: null,
        featured: !!body.featured,
        order: typeof body.order === "number" ? body.order : 0,
      },
    })
    return NextResponse.json({ tool: mapTool(created) })
  } catch (e: any) {
    console.error("[tools POST]", e)
    return NextResponse.json({ error: "등록 실패" }, { status: 500 })
  }
}
