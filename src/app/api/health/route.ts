import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * 배포 환경 진단용. 비밀값은 노출하지 않고 존재 여부와 형태만 보고한다.
 *
 * firebase-admin 은 반드시 동적 import 로만 만진다. 정적 import 하면 이
 * 라우트까지 같은 모듈 로드 실패에 휩쓸려 정작 원인을 못 읽는다.
 */
export async function GET() {
  const key = process.env.FIREBASE_PRIVATE_KEY ?? ""

  const report: Record<string, unknown> = {
    node: process.version,
    env: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!key,
    },
    privateKeyShape: {
      length: key.length,
      escapedNewlines: key.includes("\\n"),
      realNewlines: key.includes("\n"),
      beginsWithHeader: key.trimStart().startsWith("-----BEGIN"),
      quoted: /^["']/.test(key.trim()),
    },
  }

  try {
    const { firestore } = await import("@/lib/firebase-admin")
    report.adminModule = "ok"
    try {
      const snap = await firestore.collection("announcements").limit(1).get()
      report.firestore = `ok (${snap.size} docs)`
    } catch (e: any) {
      report.firestore = `${e?.code ?? "error"}: ${e?.message ?? String(e)}`
    }
  } catch (e: any) {
    report.adminModule = `${e?.code ?? "error"}: ${e?.message ?? String(e)}`
  }

  return NextResponse.json(report)
}
