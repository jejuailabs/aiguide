import { adminAuth } from "./firebase-admin"
import { db } from "./db"
import { isAdminEmail } from "./roles"

/** Thrown by the guards below; carries the HTTP status to answer with. */
export class AuthError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface Caller {
  uid: string
  email: string
  name: string
}

/**
 * Verify the Firebase ID token carried in `Authorization: Bearer <token>`.
 * Everything downstream trusts the token payload, never the request body.
 */
export async function requireUser(req: Request): Promise<Caller> {
  const header = req.headers.get("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : ""
  if (!token) throw new AuthError(401, "로그인이 필요합니다.")

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(token)
  } catch {
    throw new AuthError(401, "인증 정보가 유효하지 않습니다.")
  }

  const email = decoded.email ?? ""
  return {
    uid: decoded.uid,
    email,
    name: decoded.name || email.split("@")[0] || "사용자",
  }
}

/** Same as `requireUser`, but additionally requires the admin tier. */
export async function requireAdmin(req: Request): Promise<Caller> {
  const caller = await requireUser(req)
  if (isAdminEmail(caller.email)) return caller

  const profile = await db.user.findUnique({ where: { id: caller.uid } })
  if (profile?.tier === "admin") return caller

  throw new AuthError(403, "관리자 권한이 필요합니다.")
}
