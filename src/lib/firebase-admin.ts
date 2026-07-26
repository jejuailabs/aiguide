import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) })
}

export const firestore = getFirestore()

/** Resolved per call rather than at module load, so an Auth-side failure can't
 *  take down the Firestore-backed routes that share this module. */
export const adminAuth = () => getAuth()
