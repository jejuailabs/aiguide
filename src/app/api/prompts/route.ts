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
