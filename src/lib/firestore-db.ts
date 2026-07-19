import { firestore } from "./firebase-admin"
import {
  type CollectionReference,
  type Query,
  FieldValue,
} from "firebase-admin/firestore"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let id = ""
  for (let i = 0; i < 25; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

/** Convert Firestore Timestamps to JS Dates (recursively, shallow). */
function normalizeDoc(doc: FirebaseFirestore.DocumentSnapshot) {
  const data = doc.data()
  if (!data) return null
  const out: Record<string, any> = { id: doc.id }
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === "object" && typeof (v as any).toDate === "function") {
      out[k] = (v as any).toDate() as Date
    } else {
      out[k] = v
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Generic collection handle that mimics Prisma's model API
// ---------------------------------------------------------------------------

function createCollectionHandle(collectionName: string) {
  const col = () => firestore.collection(collectionName) as CollectionReference

  return {
    /**
     * findMany({ where?, orderBy?, take? })
     *
     * `orderBy` accepts:
     *   - { field: "asc"|"desc" }
     *   - [{ field: "asc"|"desc" }, ...]
     *
     * `where` accepts:
     *   - { field: value }  (equality)
     */
    async findMany(
      opts: {
        where?: Record<string, any>
        orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[]
        take?: number
      } = {}
    ) {
      let q: Query = col()

      // WHERE
      if (opts.where) {
        for (const [field, value] of Object.entries(opts.where)) {
          q = q.where(field, "==", value)
        }
      }

      // ORDER BY — use only the first field to avoid compound-index requirements
      const orderByArr = opts.orderBy
        ? Array.isArray(opts.orderBy)
          ? opts.orderBy
          : [opts.orderBy]
        : []

      if (orderByArr.length > 0) {
        const first = orderByArr[0]
        const [field, dir] = Object.entries(first)[0]
        q = q.orderBy(field, dir)
      }

      // TAKE (limit)
      if (opts.take) {
        q = q.limit(opts.take)
      }

      const snap = await q.get()
      return snap.docs.map(normalizeDoc).filter(Boolean) as Record<string, any>[]
    },

    /**
     * create({ data })
     * Returns the created document with its generated id and timestamps.
     */
    async create(opts: { data: Record<string, any> }): Promise<Record<string, any>> {
      const id = generateId()
      const now = new Date()
      const doc: Record<string, any> = {
        ...opts.data,
        createdAt: now,
        updatedAt: now,
      }
      await col().doc(id).set(doc)
      return { id, ...doc }
    },

    /**
     * delete({ where: { id } })
     */
    async delete(opts: { where: { id: string } }) {
      await col().doc(opts.where.id).delete()
      return { id: opts.where.id }
    },
  }
}

// ---------------------------------------------------------------------------
// Exported db object — one property per model, matching Prisma's casing
// ---------------------------------------------------------------------------

export const db = {
  aITool: createCollectionHandle("aiTools"),
  prompt: createCollectionHandle("prompts"),
  metaPromptTemplate: createCollectionHandle("metaPromptTemplates"),
  miniTool: createCollectionHandle("miniTools"),
  vibeSolution: createCollectionHandle("vibeSolutions"),
  communityPost: createCollectionHandle("communityPosts"),
  announcement: createCollectionHandle("announcements"),
}
