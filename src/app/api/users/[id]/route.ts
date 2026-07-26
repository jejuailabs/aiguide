import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { adminAuth } from "@/lib/firebase-admin"
import { toUserDTO } from "@/lib/users"
import { AuthError, requireAdmin } from "@/lib/server-auth"
import { TIERS, isAdminEmail } from "@/lib/roles"

export const dynamic = "force-dynamic"

/** PATCH /api/users/[id] — change a member's tier, block state, or name. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await requireAdmin(req)
    const { id } = await params
    const body = await req.json()

    const target = await db.user.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ error: "존재하지 않는 회원입니다." }, { status: 404 })
    }

    const data: Record<string, any> = {}

    if (typeof body.name === "string" && body.name.trim()) {
      data.name = body.name.trim()
      data.avatar = data.name.charAt(0)
    }

    if (typeof body.tier === "string") {
      if (!TIERS.includes(body.tier)) {
        return NextResponse.json({ error: "알 수 없는 등급입니다." }, { status: 400 })
      }
      // Hard-coded admin accounts can't be demoted — they'd be restored on next login anyway.
      if (isAdminEmail(target.email ?? "") && body.tier !== "admin") {
        return NextResponse.json(
          { error: "기본 관리자 계정의 등급은 변경할 수 없습니다." },
          { status: 400 }
        )
      }
      data.tier = body.tier
    }

    if (typeof body.blocked === "boolean") {
      if (body.blocked && (caller.uid === id || isAdminEmail(target.email ?? ""))) {
        return NextResponse.json(
          { error: "관리자 계정은 차단할 수 없습니다." },
          { status: 400 }
        )
      }
      data.blocked = body.blocked
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "변경할 항목이 없습니다." }, { status: 400 })
    }

    const updated = await db.user.update({ where: { id }, data })
    return NextResponse.json({ user: toUserDTO(updated) })
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error("[users PATCH]", e)
    return NextResponse.json({ error: "수정 실패" }, { status: 500 })
  }
}

/**
 * DELETE /api/users/[id] — remove the member.
 *
 * The Firebase Auth account goes too: deleting only the profile document would
 * let the same person sign back in and silently recreate it.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await requireAdmin(req)
    const { id } = await params

    if (caller.uid === id) {
      return NextResponse.json({ error: "자기 계정은 삭제할 수 없습니다." }, { status: 400 })
    }

    const target = await db.user.findUnique({ where: { id } })
    if (target && isAdminEmail(target.email ?? "")) {
      return NextResponse.json(
        { error: "기본 관리자 계정은 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    await db.user.delete({ where: { id } })
    try {
      await adminAuth().deleteUser(id)
    } catch (e: any) {
      // Already gone from Auth (or never existed) — the profile is what matters.
      if (e?.code !== "auth/user-not-found") throw e
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error("[users DELETE]", e)
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 })
  }
}
