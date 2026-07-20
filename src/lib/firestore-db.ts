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

      // WHERE (equality only)
      if (opts.where) {
        for (const [field, value] of Object.entries(opts.where)) {
          q = q.where(field, "==", value)
        }
      }

      const snap = await q.get()
      let rows = snap.docs.map(normalizeDoc).filter(Boolean) as Record<string, any>[]

      // ORDER BY — sort in memory to avoid Firestore composite-index requirements.
      // Collections are small, and this also supports proper multi-field ordering.
      const orderByArr = opts.orderBy
        ? Array.isArray(opts.orderBy)
          ? opts.orderBy
          : [opts.orderBy]
        : []

      if (orderByArr.length > 0) {
        const keys = orderByArr.map((o) => Object.entries(o)[0] as [string, "asc" | "desc"])
        rows = rows.sort((a, b) => {
          for (const [field, dir] of keys) {
            const av = a[field]
            const bv = b[field]
            if (av === bv) continue
            let cmp: number
            if (av instanceof Date && bv instanceof Date) {
              cmp = av.getTime() - bv.getTime()
            } else if (typeof av === "number" && typeof bv === "number") {
              cmp = av - bv
            } else if (typeof av === "boolean" && typeof bv === "boolean") {
              cmp = (av ? 1 : 0) - (bv ? 1 : 0)
            } else {
              cmp = String(av ?? "").localeCompare(String(bv ?? ""))
            }
            if (cmp !== 0) return dir === "desc" ? -cmp : cmp
          }
          return 0
        })
      }

      // TAKE (limit)
      if (opts.take) {
        rows = rows.slice(0, opts.take)
      }

      return rows
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
     * update({ where: { id }, data })
     */
    async update(opts: { where: { id: string }; data: Record<string, any> }) {
      const ref = col().doc(opts.where.id)
      const patch = { ...opts.data, updatedAt: new Date() }
      await ref.update(patch)
      const snap = await ref.get()
      return normalizeDoc(snap) as Record<string, any>
    },

    /**
     * findUnique({ where: { id } })
     */
    async findUnique(opts: { where: { id: string } }) {
      const snap = await col().doc(opts.where.id).get()
      if (!snap.exists) return null
      return normalizeDoc(snap)
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
