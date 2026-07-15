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
