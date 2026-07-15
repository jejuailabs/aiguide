"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, ArrowLeft, Copy, Check, Download, Wand2, RotateCcw,
} from "lucide-react"
import QRCode from "qrcode"
import ReactMarkdown from "react-markdown"
import { useFetch, useCopy } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DynamicIcon } from "@/components/dynamic-icon"
import { ViewHeader } from "@/components/views/view-header"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { MiniToolDTO } from "@/lib/types"

export function MiniToolsView() {
  const { data } = useFetch<{ miniTools: MiniToolDTO[] }>("/api/meta-templates")
  const tools = data?.miniTools ?? []
  const [active, setActive] = React.useState<MiniToolDTO | null>(null)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ViewHeader
        eyebrow="AI 미니툴"
        title="브라우저에서 바로 실행되는 생산성 도구"
        desc="설치 없이 웹에서 바로 쓰는 미니 도구 모음. QR 생성, 포매터, 변환기 등 실무에 필요한 도구를 제공합니다."
      />

      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tools.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-all group-hover:bg-primary/15 group-hover:ring-primary/25">
                  <DynamicIcon name={t.icon} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-semibold tracking-tight">{t.name}</h3>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t.description}
                  </p>
                  <Badge variant="outline" className="mt-2 text-[0.6rem] font-normal">
                    {t.category}
                  </Badge>
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="tool"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <DynamicIcon name={active.icon} className="size-5" />
              </span>
              <div>
                <h2 className="font-serif text-xl font-semibold tracking-tight">{active.name}</h2>
                <p className="text-xs text-muted-foreground">{active.description}</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setActive(null)}>
                <ArrowLeft className="size-4" /> 목록
              </Button>
            </div>
            <ToolRunner tool={active} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ToolRunner({ tool }: { tool: MiniToolDTO }) {
  switch (tool.actionType) {
    case "qr": return <QRTool />
    case "json": return <JSONTool />
    case "base64": return <Base64Tool />
    case "markdown": return <MarkdownTool />
    case "url-encode": return <URLEncodeTool />
    case "text-case": return <TextCaseTool />
    case "color": return <ColorTool />
    case "password": return <PasswordTool />
    default: return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">준비 중인 도구입니다.</div>
  }
}

/* ---------- QR ---------- */
function QRTool() {
  const [text, setText] = React.useState("https://ai-guide.portal")
  const [size, setSize] = React.useState(320)
  const [dataUrl, setDataUrl] = React.useState("")
  const { copy } = useCopy()

  React.useEffect(() => {
    if (!text.trim()) { setDataUrl(""); return }
    QRCode.toDataURL(text, { width: size, margin: 2, color: { dark: "#1a1714", light: "#ffffff" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(""))
  }, [text, size])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <label className="mb-2 block text-sm font-medium">내용 (URL 또는 텍스트)</label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px] resize-none" placeholder="https://example.com" />
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">크기: {size}px</label>
          <input type="range" min={160} max={480} step={40} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-primary" />
        </div>
      </Card>
      <Card className="flex flex-col items-center justify-center p-5">
        {dataUrl ? (
          <>
            <img src={dataUrl} alt="QR Code" className="rounded-xl border border-border/60 bg-white p-2" width={size} height={size} />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(text, "내용이 복사되었습니다")}>
                <Copy className="size-3.5" /> 내용 복사
              </Button>
              <a href={dataUrl} download="qr-code.png">
                <Button size="sm"><Download className="size-3.5" /> 다운로드</Button>
              </a>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">내용을 입력하면 QR이 생성됩니다</div>
        )}
      </Card>
    </div>
  )
}

/* ---------- JSON ---------- */
function JSONTool() {
  const [input, setInput] = React.useState('{"name":"AI Guide","tags":["ai","prompt"],"version":1}')
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState("")
  const { copied, copy } = useCopy()

  const format = (indent: number) => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError("")
      toast.success("포맷팅 완료")
    } catch (e: any) {
      setError(e.message)
      setOutput("")
      toast.error("JSON 형식 오류")
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">입력</label>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => format(2)}>포맷</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => format(0)}>압축</Button>
          </div>
        </div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[280px] resize-none font-mono text-xs" />
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </Card>
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">결과</label>
          {output && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => copy(output)}>
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />} 복사
            </Button>
          )}
        </div>
        <pre className="min-h-[280px] overflow-auto rounded-lg bg-muted/40 p-3 text-xs font-mono scrollbar-thin">{output || "포맷 버튼을 누르면 결과가 표시됩니다"}</pre>
      </Card>
    </div>
  )
}

/* ---------- Base64 ---------- */
function Base64Tool() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [mode, setMode] = React.useState<"encode" | "decode">("encode")
  const { copied, copy } = useCopy()

  const run = (m: "encode" | "decode") => {
    setMode(m)
    try {
      if (m === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
    } catch {
      toast.error("변환 실패: 올바른 입력인지 확인하세요")
      setOutput("")
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">입력</label>
          <div className="flex gap-1.5">
            <Button size="sm" variant={mode === "encode" ? "default" : "outline"} className="h-7 text-xs" onClick={() => run("encode")}>인코딩</Button>
            <Button size="sm" variant={mode === "decode" ? "default" : "outline"} className="h-7 text-xs" onClick={() => run("decode")}>디코딩</Button>
          </div>
        </div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[280px] resize-none font-mono text-xs" placeholder="텍스트를 입력하세요" />
      </Card>
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">결과</label>
          {output && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => copy(output)}>
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />} 복사
            </Button>
          )}
        </div>
        <pre className="min-h-[280px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted/40 p-3 text-xs font-mono scrollbar-thin">{output || "변환 버튼을 누르면 결과가 표시됩니다"}</pre>
      </Card>
    </div>
  )
}

/* ---------- Markdown ---------- */
function MarkdownTool() {
  const [md, setMd] = React.useState(`# 제목

**볼드**와 *이탤릭*을 지원합니다.

- 리스트 항목 1
- 리스트 항목 2

> 인용구입니다.

\`\`\`
코드 블록
\`\`\`
`)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <label className="mb-2 block text-sm font-medium">Markdown 입력</label>
        <Textarea value={md} onChange={(e) => setMd(e.target.value)} className="min-h-[400px] resize-none font-mono text-xs" />
      </Card>
      <Card className="p-5">
        <label className="mb-2 block text-sm font-medium">미리보기</label>
        <div className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] overflow-auto rounded-lg bg-muted/30 p-4 scrollbar-thin">
          <ReactMarkdown>{md}</ReactMarkdown>
        </div>
      </Card>
    </div>
  )
}

/* ---------- URL Encode ---------- */
function URLEncodeTool() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [mode, setMode] = React.useState<"encode" | "decode">("encode")
  const { copied, copy } = useCopy()

  const run = (m: "encode" | "decode") => {
    setMode(m)
    try {
      setOutput(m === "encode" ? encodeURIComponent(input) : decodeURIComponent(input))
    } catch {
      toast.error("변환 실패")
      setOutput("")
    }
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">입력</label>
          <div className="flex gap-1.5">
            <Button size="sm" variant={mode === "encode" ? "default" : "outline"} className="h-7 text-xs" onClick={() => run("encode")}>인코딩</Button>
            <Button size="sm" variant={mode === "decode" ? "default" : "outline"} className="h-7 text-xs" onClick={() => run("decode")}>디코딩</Button>
          </div>
        </div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[200px] resize-none font-mono text-xs" />
      </Card>
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">결과</label>
          {output && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => copy(output)}>
              <Copy className="size-3" /> 복사
            </Button>
          )}
        </div>
        <pre className="min-h-[200px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted/40 p-3 text-xs font-mono scrollbar-thin">{output || "변환 버튼을 누르세요"}</pre>
      </Card>
    </div>
  )
}

/* ---------- Text Case ---------- */
function TextCaseTool() {
  const [input, setInput] = React.useState("AI Guide Portal — the best place")
  const { copy } = useCopy()
  const transforms = [
    { label: "대문자", fn: (s: string) => s.toUpperCase() },
    { label: "소문자", fn: (s: string) => s.toLowerCase() },
    { label: "Title Case", fn: (s: string) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) },
    { label: "Sentence case", fn: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
    { label: "snake_case", fn: (s: string) => s.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^\w]/g, "_") },
    { label: "camelCase", fn: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
    { label: "kebab-case", fn: (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") },
    { label: "CONSTANT_CASE", fn: (s: string) => s.toUpperCase().trim().replace(/\s+/g, "_").replace(/[^\w]/g, "_") },
  ]
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <label className="mb-2 block text-sm font-medium">입력 텍스트</label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[80px] resize-none" />
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {transforms.map((t) => {
          const out = t.fn(input)
          return (
            <Card key={t.label} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{t.label}</div>
                <div className="mt-0.5 truncate font-mono text-sm">{out || "—"}</div>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0" onClick={() => copy(out, "복사되었습니다")}>
                <Copy className="size-3.5" />
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Color ---------- */
function ColorTool() {
  const [hex, setHex] = React.useState("#d4a574")
  const { copy } = useCopy()

  const hexToRgb = (h: string) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h)
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null
  }
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0; const l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }
  const rgb = hexToRgb(hex)
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null
  const formats = rgb && hsl ? [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CSS Var", value: `--color: ${hex};` },
  ] : []
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
      <Card className="flex flex-col p-5">
        <label className="mb-2 block text-sm font-medium">색상 선택</label>
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-32 w-full cursor-pointer rounded-xl border border-border/60 bg-transparent" />
        <Input value={hex} onChange={(e) => setHex(e.target.value)} className="mt-3 font-mono" />
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {formats.map((f) => (
          <Card key={f.label} className="flex flex-col justify-between p-4">
            <div className="text-xs text-muted-foreground">{f.label}</div>
            <div className="mt-2 font-mono text-sm break-all">{f.value}</div>
            <Button size="sm" variant="ghost" className="mt-2 h-7 self-start text-xs" onClick={() => copy(f.value, "복사되었습니다")}>
              <Copy className="size-3" /> 복사
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ---------- Password ---------- */
function PasswordTool() {
  const [length, setLength] = React.useState(16)
  const [opts, setOpts] = React.useState({ upper: true, lower: true, number: true, symbol: true })
  const [pw, setPw] = React.useState("")
  const { copied, copy } = useCopy()

  const gen = () => {
    let chars = ""
    if (opts.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (opts.lower) chars += "abcdefghijklmnopqrstuvwxyz"
    if (opts.number) chars += "0123456789"
    if (opts.symbol) chars += "!@#$%^&*()_+-=[]{}"
    if (!chars) { toast.error("최소 한 가지 문자 유형을 선택하세요"); return }
    let p = ""
    const arr = new Uint32Array(length)
    crypto.getRandomValues(arr)
    for (let i = 0; i < length; i++) p += chars[arr[i] % chars.length]
    setPw(p)
  }
  React.useEffect(() => { gen() }, [])

  const strength = React.useMemo(() => {
    let s = 0
    if (length >= 12) s += 25
    if (length >= 16) s += 15
    const types = Object.values(opts).filter(Boolean).length
    s += types * 15
    return Math.min(s, 100)
  }, [length, opts])

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <code className="flex-1 truncate font-mono text-lg break-all">{pw || "—"}</code>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={gen}><RotateCcw className="size-3.5" /> 재생성</Button>
            <Button size="sm" onClick={() => copy(pw, "비밀번호가 복사되었습니다")}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} 복사
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">강도</span>
            <span className="font-medium">{strength >= 80 ? "강함" : strength >= 50 ? "보통" : "약함"}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full transition-all", strength >= 80 ? "bg-emerald-500" : strength >= 50 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${strength}%` }} />
          </div>
        </div>
      </Card>
      <Card className="p-5">
        <label className="mb-2 block text-sm font-medium">길이: {length}</label>
        <input type="range" min={8} max={32} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-primary" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            { k: "upper", l: "대문자 A-Z" },
            { k: "lower", l: "소문자 a-z" },
            { k: "number", l: "숫자 0-9" },
            { k: "symbol", l: "특수문자" },
          ] as const).map(({ k, l }) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/50 p-2.5 text-sm">
              <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))} className="accent-primary" />
              {l}
            </label>
          ))}
        </div>
        <Button className="mt-4 w-full" onClick={gen}><Wand2 className="size-4" /> 비밀번호 생성</Button>
      </Card>
    </div>
  )
}
