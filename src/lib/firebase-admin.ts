import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) })
}

export const firestore = getFirestore()

/**
 * firebase-admin/auth 는 정적으로 import 하지 않는다.
 *
 * Vercel(Node 24) 런타임에서 의존성 체인 jwks-rsa → jose 가 ERR_REQUIRE_ESM 을
 * 던지는데, 최상단 import 로 두면 이 모듈을 공유하는 Firestore 라우트
 * (공지·도구·프롬프트…)까지 전부 모듈 로드 단계에서 500 이 된다.
 * 실제로 Auth 가 필요한 요청에서만 불러와 피해를 그 요청에 가둔다.
 */
export async function adminAuth() {
  const { getAuth } = await import("firebase-admin/auth")
  return getAuth()
}
