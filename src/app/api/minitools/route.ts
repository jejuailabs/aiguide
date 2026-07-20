import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { MiniToolDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

function mapMiniTool(m: any): MiniToolDTO {
  return {
    id: m.id,
    name: m.name,
    description: m.description,
    icon: m.icon,
    category: m.category,
    actionType: m.actionType,
    isInteractive: m.isInteractive,
    order: m.order,
  }
}

export async function GET() {
  const miniTools = await db.miniTool.findMany({ orderBy: [{ order: "asc" }] })
  return NextResponse.json({ miniTools: miniTools.map(mapMiniTool) })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "도구명은 필수입니다." }, { status: 400 })
    }
    const created = await db.miniTool.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() ?? "",
        icon: body.icon?.trim() || "Boxes",
        category: body.category ?? "기타",
        actionType: body.actionType ?? "static",
        isInteractive: body.isInteractive !== false,
        order: typeof body.order === "number" ? body.order : 0,
      },
    })
    return NextResponse.json({ miniTool: mapMiniTool(created) })
  } catch (e: any) {
    console.error("[minitools POST]", e)
    return NextResponse.json({ error: "등록 실패" }, { status: 500 })
  }
}
