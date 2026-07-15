import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { MetaTemplateDTO, MiniToolDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const [templates, tools] = await Promise.all([
    db.metaPromptTemplate.findMany({ orderBy: { resultType: "asc" } }),
    db.miniTool.findMany({ orderBy: [{ order: "asc" }] }),
  ])
  const t: MetaTemplateDTO[] = templates.map((x) => ({
    id: x.id, resultType: x.resultType, label: x.label, icon: x.icon, schemaJson: x.schemaJson,
  }))
  const m: MiniToolDTO[] = tools.map((x) => ({
    id: x.id, name: x.name, description: x.description, icon: x.icon,
    category: x.category, actionType: x.actionType, isInteractive: x.isInteractive, order: x.order,
  }))
  return NextResponse.json({ templates: t, miniTools: m })
}
