import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { PromptDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

function safeParse(s: string | null | undefined): string[] {
  if (!s) return []
  try { return JSON.parse(s) } catch { return [] }
}

function mapPrompt(p: any): PromptDTO {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    body: p.body,
    category: p.category,
    bestModel: p.bestModel,
    runUrl: p.runUrl,
    tags: safeParse(p.tags),
    version: p.version,
    favorites: p.favorites,
    createdAt: p.createdAt.toISOString(),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const limit = searchParams.get("limit")

  const where: any = {}
  if (category && category !== "전체") where.category = category

  const prompts = await db.prompt.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    ...(limit ? { take: Number(limit) } : {}),
  })
  return NextResponse.json({ prompts: prompts.map(mapPrompt) })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json({ error: "제목과 프롬프트 본문은 필수입니다." }, { status: 400 })
    }
    const created = await db.prompt.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() ?? "",
        body: body.body.trim(),
        category: body.category ?? "기타",
        bestModel: body.bestModel ?? "GPT-4o",
        runUrl: body.runUrl?.trim() || null,
        sampleImage: null,
        tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
        version: body.version ?? "1.0",
        favorites: 0,
        order: typeof body.order === "number" ? body.order : 0,
      },
    })
    return NextResponse.json({ prompt: mapPrompt(created) })
  } catch (e: any) {
    console.error("[prompts POST]", e)
    return NextResponse.json({ error: "등록 실패" }, { status: 500 })
  }
}
