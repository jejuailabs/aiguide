import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, any> = {}
    for (const k of ["title", "tagline", "description", "url", "thumbnail", "purpose", "category"]) {
      if (typeof body[k] === "string") data[k] = body[k].trim()
    }
    if (Array.isArray(body.features)) data.features = JSON.stringify(body.features)
    if (Array.isArray(body.aiUsed)) data.aiUsed = JSON.stringify(body.aiUsed)
    if (Array.isArray(body.techStack)) data.techStack = JSON.stringify(body.techStack)
    if (typeof body.featured === "boolean") data.featured = body.featured
    if (typeof body.order === "number") data.order = body.order

    await db.vibeSolution.update({ where: { id }, data })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[solutions PATCH]", e)
    return NextResponse.json({ error: "수정 실패" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.vibeSolution.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 })
  }
}
