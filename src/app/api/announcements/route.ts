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
