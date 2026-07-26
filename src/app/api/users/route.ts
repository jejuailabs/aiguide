import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { adminAuth } from "@/lib/firebase-admin"
import { toUserDTO } from "@/lib/users"
import { AuthError, requireAdmin, requireUser } from "@/lib/server-auth"
import { isAdminEmail } from "@/lib/roles"

export const dynamic = "force-dynamic"

/**
 * Create profile documents for Firebase Auth accounts that don't have one yet.
 *
 * Profiles are normally written at login, so without this pass the member list
 * would stay empty until every existing account happened to sign in again.
 */
async function backfillFromAuth(known: Set<string>) {
  const { users } = await (await adminAuth()).listUsers(1000)
  const missing = users.filter((u) => !known.has(u.uid))
  if (missing.length === 0) return []

  return Promise.all(
    missing.map((u) => {
      const email = u.email ?? ""
      const name = u.displayName || email.split("@")[0] || "사용자"
      return db.user.upsert({
        where: { id: u.uid },
        create: {
          name,
          email,
          avatar: name.charAt(0),
          tier: isAdminEmail(email) ? "admin" : "free",
          provider: "google",
          blocked: false,
          lastLoginAt: u.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime) : null,
        },
        update: {},
      })
    })
  )
}

/** GET /api/users — full member list (admin only). */
export async function GET(req: Request) {
  try {
    await requireAdmin(req)
    const rows = await db.user.findMany({ orderBy: { createdAt: "desc" } })
    const imported = await backfillFromAuth(new Set(rows.map((r) => r.id)))
    const all = [...imported, ...rows].sort(
      (a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0)
    )
    return NextResponse.json({ users: all.map(toUserDTO) })
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error("[users GET]", e)
    return NextResponse.json({ error: "회원 목록을 불러오지 못했습니다." }, { status: 500 })
  }
}

/**
 * POST /api/users — register/refresh the caller's own profile on login.
 *
 * Identity comes from the verified ID token, never from the body, so a client
 * cannot register someone else or hand itself a tier.
 */
export async function POST(req: Request) {
  try {
    const caller = await requireUser(req)
    let body: Record<string, any> = {}
    try { body = await req.json() } catch {}

    const existing = await db.user.findUnique({ where: { id: caller.uid } })

    if (existing?.blocked) {
      return NextResponse.json(
        { error: "차단된 계정입니다. 관리자에게 문의하세요." },
        { status: 403 }
      )
    }

    // Admin emails are always admin; otherwise keep whatever the admin assigned.
    let tier = isAdminEmail(caller.email) ? "admin" : (existing?.tier ?? "free")
    // Self-service Premium upgrade (the current flow has no payment step).
    if (body.upgrade === true && tier === "free") tier = "premium"
    const now = new Date()

    const saved = await db.user.upsert({
      where: { id: caller.uid },
      create: {
        name: caller.name,
        email: caller.email,
        avatar: caller.name.charAt(0),
        tier,
        provider: "google",
        blocked: false,
        lastLoginAt: now,
      },
      update: {
        name: caller.name,
        email: caller.email,
        tier,
        lastLoginAt: now,
      },
    })

    return NextResponse.json({ user: toUserDTO(saved) })
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error("[users POST]", e)
    return NextResponse.json({ error: "회원 정보 동기화 실패" }, { status: 500 })
  }
}
