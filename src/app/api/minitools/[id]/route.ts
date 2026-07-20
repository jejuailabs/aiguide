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
    for (const k of ["name", "description", "icon", "category", "actionType"]) {
      if (typeof body[k] === "string") data[k] = body[k].trim()
    }
    if (typeof body.isInteractive === "boolean") data.isInteractive = body.isInteractive
    if (typeof body.order === "number") data.order = body.order

    await db.miniTool.update({ where: { id }, data })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[minitools PATCH]", e)
    return NextResponse.json({ error: "수정 실패" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.miniTool.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 })
  }
}
