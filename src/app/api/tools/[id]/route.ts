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
    for (const k of ["name", "tagline", "description", "category", "icon", "price", "websiteUrl"]) {
      if (typeof body[k] === "string") data[k] = body[k].trim()
    }
    if (Array.isArray(body.platforms)) data.platforms = JSON.stringify(body.platforms)
    if (Array.isArray(body.useCases)) data.useCases = JSON.stringify(body.useCases)
    if (typeof body.featured === "boolean") data.featured = body.featured
    if (typeof body.order === "number") data.order = body.order

    await db.aITool.update({ where: { id }, data })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[tools PATCH]", e)
    return NextResponse.json({ error: "수정 실패" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.aITool.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 })
  }
}
