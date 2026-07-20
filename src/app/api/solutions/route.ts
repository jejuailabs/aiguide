import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { VibeSolutionDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

function safeParse(s: string | null | undefined): string[] {
  if (!s) return []
  try { return JSON.parse(s) } catch { return [] }
}

function mapSolution(s: any): VibeSolutionDTO {
  return {
    id: s.id,
    title: s.title,
    tagline: s.tagline,
    description: s.description,
    url: s.url,
    thumbnail: s.thumbnail,
    features: safeParse(s.features),
    purpose: s.purpose,
    category: s.category,
    aiUsed: safeParse(s.aiUsed),
    techStack: safeParse(s.techStack),
    featured: s.featured,
    createdAt: s.createdAt.toISOString(),
  }
}

export async function GET() {
  const solutions = await db.vibeSolution.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json({ solutions: solutions.map(mapSolution) })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.title?.trim() || !body.url?.trim()) {
      return NextResponse.json({ error: "제목과 URL은 필수입니다." }, { status: 400 })
    }
    const created = await db.vibeSolution.create({
      data: {
        title: body.title.trim(),
        tagline: body.tagline?.trim() ?? "",
        description: body.description?.trim() ?? "",
        url: body.url.trim(),
        thumbnail: body.thumbnail?.trim() || "/logo.svg",
        features: JSON.stringify(Array.isArray(body.features) ? body.features : []),
        purpose: body.purpose?.trim() ?? "",
        category: body.category ?? "기타",
        aiUsed: JSON.stringify(Array.isArray(body.aiUsed) ? body.aiUsed : []),
        techStack: JSON.stringify(Array.isArray(body.techStack) ? body.techStack : []),
        featured: !!body.featured,
        order: typeof body.order === "number" ? body.order : 0,
      },
    })
    return NextResponse.json({ solution: mapSolution(created) })
  } catch (e: any) {
    console.error("[solutions POST]", e)
    return NextResponse.json({ error: "등록 실패" }, { status: 500 })
  }
}
