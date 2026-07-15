"use client"

import * as React from "react"
import { toast } from "sonner"

/** Simple data fetching hook with loading & error states. */
export function useFetch<T>(
  url: string | null,
  options?: { deps?: unknown[] }
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(!!url)
  const [error, setError] = React.useState<string | null>(null)

  const deps = options?.deps ?? []

  React.useEffect(() => {
    if (!url) {
      setData(null)
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => {
        if (active) {
          setData(json)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message ?? "불러오기 실패")
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [url, ...deps])

  return { data, loading, error }
}

/** Copy-to-clipboard with toast feedback. */
export function useCopy() {
  const [copied, setCopied] = React.useState(false)
  const copy = React.useCallback(async (text: string, label = "복사되었습니다") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(label)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("복사에 실패했습니다")
    }
  }, [])
  return { copied, copy }
}

/** Format a relative time in Korean. */
export function timeAgo(iso: string) {
  const d = new Date(iso).getTime()
  const diff = Date.now() - d
  const min = Math.floor(diff / 60000)
  if (min < 1) return "방금 전"
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}일 전`
  const wk = Math.floor(day / 7)
  if (wk < 5) return `${wk}주 전`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo}개월 전`
  return `${Math.floor(day / 365)}년 전`
}

/** Parse JSON arrays stored as strings safely. */
export function safeArr(v: unknown): string[] {
  if (Array.isArray(v)) return v
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}
