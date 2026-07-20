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
    for (const k of ["title", "content", "category", "author"]) {
      if (typeof body[k] === "string") data[k] = body[k].trim()
    }
    if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags)
    if (typeof body.featured === "boolean") data.featured = body.featured
    if (typeof body.likes === "number") data.likes = body.likes

    await db.communityPost.update({ where: { id }, data })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[community PATCH]", e)
    return NextResponse.json({ error: "수정 실패" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.communityPost.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 })
  }
}
