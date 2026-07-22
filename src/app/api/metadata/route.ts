import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/** 정규화: 스킴이 없으면 https:// 를 붙인다. */
function normalizeUrl(raw: string): string {
  const u = raw.trim()
  if (!/^https?:\/\//i.test(u)) return `https://${u}`
  return u
}

/** <meta> 태그에서 property/name = key 인 content 값을 뽑는다. (속성 순서 무관) */
function metaContent(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    // property/name 이 먼저 오는 경우
    const re1 = new RegExp(
      `<meta[^>]+(?:property|name)=["']${esc}["'][^>]*content=["']([^"']*)["']`,
      "i"
    )
    // content 가 먼저 오는 경우
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${esc}["']`,
      "i"
    )
    const m = html.match(re1) || html.match(re2)
    if (m?.[1]) return decodeEntities(m[1].trim())
  }
  return null
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
}

function absolutize(src: string, base: string): string {
  try {
    return new URL(src, base).toString()
  } catch {
    return src
  }
}

export async function POST(req: Request) {
  let target = ""
  try {
    const body = await req.json()
    target = normalizeUrl(String(body.url ?? ""))
    if (!target || !/^https?:\/\//i.test(target)) {
      return NextResponse.json({ error: "올바른 URL을 입력하세요." }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AIGuideBot/1.0; +https://ai-guide) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    }).finally(() => clearTimeout(timeout))

    if (!res.ok) {
      return NextResponse.json(
        { error: `페이지를 불러오지 못했습니다 (HTTP ${res.status})` },
        { status: 200, headers: { "x-partial": "1" } }
      )
    }

    const finalUrl = res.url || target
    const html = (await res.text()).slice(0, 500_000)

    const ogImage =
      metaContent(html, ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"]) ||
      null

    const title =
      metaContent(html, ["og:title", "twitter:title"]) ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
      ""

    const description =
      metaContent(html, ["og:description", "twitter:description", "description"]) || ""

    const siteName = metaContent(html, ["og:site_name"]) || ""

    return NextResponse.json({
      url: finalUrl,
      thumbnail: ogImage ? absolutize(ogImage, finalUrl) : "",
      title: decodeEntities(title),
      description: decodeEntities(description),
      siteName: decodeEntities(siteName),
    })
  } catch (e: any) {
    const aborted = e?.name === "AbortError"
    console.error("[metadata POST]", target, e?.message)
    return NextResponse.json(
      { error: aborted ? "요청 시간이 초과되었습니다." : "메타데이터를 가져오지 못했습니다.", url: target },
      { status: 200 }
    )
  }
}
