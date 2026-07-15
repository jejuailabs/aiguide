import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { AnnouncementDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const items = await db.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  })
  const dtos: AnnouncementDTO[] = items.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    type: a.type,
    pinned: a.pinned,
    createdAt: a.createdAt.toISOString(),
  }))
  return NextResponse.json({ announcements: dtos })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, content, type, pinned } = body
    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용은 필수입니다." }, { status: 400 })
    }
    const created = await db.announcement.create({
      data: {
        title,
        content,
        type: type ?? "notice",
        pinned: !!pinned,
      },
    })
    return NextResponse.json({
      announcement: {
        id: created.id,
        title: created.title,
        content: created.content,
        type: created.type,
        pinned: created.pinned,
        createdAt: created.createdAt.toISOString(),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: "생성 실패" }, { status: 500 })
  }
}
