"use client"

import { Sparkles, Github, Twitter, Send } from "lucide-react"
import { useNav, type ViewKey } from "@/lib/store"

const FOOTER_LINKS: { label: string; view?: ViewKey; href?: string }[] = [
  { label: "AI 도구", view: "tools" },
  { label: "프롬프트 라이브러리", view: "prompts" },
  { label: "메타 프롬프트 엔진", view: "meta-prompt" },
  { label: "AI 미니툴", view: "mini-tools" },
  { label: "바이브코딩 솔루션", view: "solutions" },
  { label: "커뮤니티", view: "community" },
]

export function Footer() {
  const { setView } = useNav()
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_2fr_1fr]">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Sparkles className="size-[1.15rem] text-primary" />
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg font-semibold">AI Guide</span>
                <span className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Portal
                </span>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI를 배우고, 탐색하고, 활용하고, 완성하는 통합 AI 생산성 플랫폼.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {FOOTER_LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => l.view && setView(l.view)}
                className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Social */}
          <div className="flex md:justify-end">
            <div className="flex gap-2">
              {[
                { icon: Github, label: "GitHub" },
                { icon: Twitter, label: "Twitter" },
                { icon: Send, label: "Telegram" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full bg-background ring-1 ring-border/60 text-muted-foreground transition-all hover:text-foreground hover:ring-primary/30 hover:bg-accent/50"
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} AI Guide Portal. AI로 만든 모든 것을 한곳에.</p>
          <p className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary/60 animate-pulse" />
            서비스가 살아있습니다 · 실시간 콘텐츠 갱신
          </p>
        </div>
      </div>
    </footer>
  )
}
