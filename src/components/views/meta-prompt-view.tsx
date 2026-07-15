"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2, ArrowRight, ArrowLeft, Sparkles, Copy, Check, Loader2,
  RefreshCw, Lightbulb, AlertTriangle, CheckCircle2, ExternalLink, Pencil,
} from "lucide-react"
import { useFetch, useCopy } from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { DynamicIcon } from "@/components/dynamic-icon"
import { ViewHeader } from "@/components/views/view-header"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { MetaTemplateDTO } from "@/lib/types"

type Phase = "select" | "input" | "conversation" | "result"

interface Question {
  field: string
  prompt: string
  options: string[]
  allowCustom: boolean
  allowAI: boolean
}
interface Conflict {
  description: string
  options: string[]
}
interface GeneratedPrompt {
  model: string
  prompt: string
  note: string
}

export function MetaPromptView() {
  const { data } = useFetch<{ templates: MetaTemplateDTO[] }>("/api/meta-templates")
  const templates = data?.templates ?? []

  const [phase, setPhase] = React.useState<Phase>("select")
  const [template, setTemplate] = React.useState<MetaTemplateDTO | null>(null)
  const [fields, setFields] = React.useState<string[]>([])
  const [materials, setMaterials] = React.useState("")
  const [schema, setSchema] = React.useState<Record<string, string>>({})
  const [history, setHistory] = React.useState<{ field: string; question: string; answer: string }[]>([])
  const [question, setQuestion] = React.useState<Question | null>(null)
  const [conflict, setConflict] = React.useState<Conflict | null>(null)
  const [completeness, setCompleteness] = React.useState(0)
  const [done, setDone] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [customInput, setCustomInput] = React.useState("")
  const [showCustom, setShowCustom] = React.useState(false)
  const [generated, setGenerated] = React.useState<{
    summary: string
    prompts: GeneratedPrompt[]
  } | null>(null)

  const reset = () => {
    setPhase("select")
    setTemplate(null)
    setFields([])
    setMaterials("")
    setSchema({})
    setHistory([])
    setQuestion(null)
    setConflict(null)
    setCompleteness(0)
    setDone(false)
    setCustomInput("")
    setShowCustom(false)
    setGenerated(null)
  }

  const onSelectTemplate = (t: MetaTemplateDTO) => {
    setTemplate(t)
    try {
      const parsed = JSON.parse(t.schemaJson)
      setFields(parsed.fields ?? [])
    } catch {
      setFields([])
    }
    setPhase("input")
  }

  const startConversation = async () => {
    if (!template) return
    setLoading(true)
    setPhase("conversation")
    try {
      const res = await fetch("/api/meta-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          resultType: template.resultType,
          resultLabel: template.label,
          fields,
          materials,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "시작 실패")
      applyResponse(data)
    } catch (e: any) {
      toast.error(e.message ?? "AI 엔진 응답에 실패했습니다.")
      setPhase("input")
    } finally {
      setLoading(false)
    }
  }

  const applyResponse = (data: any) => {
    setSchema(data.schema ?? {})
    setCompleteness(data.completeness ?? 0)
    setDone(!!data.done)
    setConflict(data.conflict ?? null)
    setQuestion(data.nextQuestion ?? null)
    setCustomInput("")
    setShowCustom(false)
  }

  const answer = async (value: string) => {
    if (!question || !template) return
    const field = question.field
    const q = question.prompt
    setHistory((h) => [...h, { field, question: q, answer: value }])
    setLoading(true)
    try {
      const res = await fetch("/api/meta-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "step",
          resultType: template.resultType,
          resultLabel: template.label,
          fields,
          materials,
          schema,
          history: [...history, { field, question: q, answer: value }],
          lastAnswer: { field, value },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "응답 실패")
      applyResponse(data)
      if (data.done) {
        // auto-generate
        setTimeout(() => generate({ ...schema, ...(data.schema ?? {}) }), 600)
      }
    } catch (e: any) {
      toast.error(e.message ?? "AI 엔진 응답에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const resolveConflict = async (value: string) => {
    if (!template) return
    setLoading(true)
    try {
      const res = await fetch("/api/meta-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "step",
          resultType: template.resultType,
          resultLabel: template.label,
          fields,
          materials,
          schema,
          history,
          lastAnswer: { field: "__conflict__", value },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "응답 실패")
      applyResponse(data)
      if (data.done) {
        setTimeout(() => generate({ ...schema, ...(data.schema ?? {}) }), 600)
      }
    } catch (e: any) {
      toast.error(e.message ?? "AI 엔진 응답에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const generate = async (finalSchema?: Record<string, string>) => {
    if (!template) return
    const s = finalSchema ?? schema
    setLoading(true)
    try {
      const res = await fetch("/api/meta-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          resultType: template.resultType,
          resultLabel: template.label,
          fields,
          materials,
          schema: s,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "생성 실패")
      setGenerated({ summary: data.summary ?? "", prompts: data.prompts ?? [] })
      setPhase("result")
    } catch (e: any) {
      toast.error(e.message ?? "프롬프트 생성에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ViewHeader
        eyebrow="메타 프롬프트 엔지니어"
        title="가장 적은 질문으로 완성도 높은 프롬프트를"
        desc="원하는 결과물을 선택하고 가진 자료를 입력하세요. AI가 의도를 분석해 필요한 것만 한 번에 하나씩 묻고, 방향성 충돌까지 감지합니다."
      />

      {/* Stepper */}
      <Stepper phase={phase} completeness={completeness} className="mt-8" />

      <AnimatePresence mode="wait">
        {phase === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8"
          >
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              원하는 최종 결과물을 선택하세요
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTemplate(t)}
                  className="group flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-all group-hover:bg-primary/15 group-hover:ring-primary/25">
                    <DynamicIcon name={t.icon} className="size-6" />
                  </span>
                  <span className="font-serif text-base font-semibold tracking-tight">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8"
          >
            <SelectedTypeChip template={template} onReset={reset} />
            <Card className="mt-4 p-6">
              <label className="mb-2 block text-sm font-medium">
                가진 자료를 자유롭게 입력하세요
              </label>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                아이디어, 기존 프롬프트, 메모, 참고자료 설명 등 무엇이든 좋습니다.
                AI가 입력을 분석해 자동으로 요구사항을 채웁니다.
              </p>
              <Textarea
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="예) 제주 감성카페를 홍보할 유튜브 썸네일. 따뜻한 색감에 여백이 넓었으면 좋겠어."
                className="min-h-[140px] resize-none text-base"
              />
              <div className="mt-4 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={reset}>
                  <ArrowLeft className="size-4" /> 다시 선택
                </Button>
                <Button
                  onClick={startConversation}
                  disabled={!materials.trim() || loading}
                  className="min-w-[160px]"
                >
                  {loading ? (
                    <><Loader2 className="size-4 animate-spin" /> 분석 중...</>
                  ) : (
                    <>AI 분석 시작 <ArrowRight className="size-4" /></>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {phase === "conversation" && (
          <motion.div
            key="conv"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 space-y-4"
          >
            <SelectedTypeChip template={template} onReset={reset} />

            {/* History */}
            {history.length > 0 && (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/30 p-3 text-sm"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.6rem] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">{h.question}</div>
                      <div className="mt-0.5 font-medium">{h.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading state */}
            {loading && !conflict && (
              <Card className="flex items-center gap-3 p-5">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">AI가 응답을 준비하고 있습니다...</span>
              </Card>
            )}

            {/* Conflict */}
            {conflict && !loading && (
              <Card className="overflow-hidden border-amber-500/30">
                <div className="flex items-start gap-3 bg-amber-500/5 p-5">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">방향성 충돌이 감지되었습니다</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {conflict.description}
                    </p>
                    <p className="mt-3 mb-2 text-xs font-medium text-muted-foreground">
                      어떤 방향을 우선하시겠습니까?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {conflict.options.map((o) => (
                        <Button
                          key={o}
                          variant="outline"
                          className="h-9"
                          onClick={() => resolveConflict(o)}
                        >
                          {o}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Question */}
            {question && !loading && !conflict && (
              <Card className="overflow-hidden">
                <div className="flex items-start gap-3 p-5">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Lightbulb className="size-5" />
                  </span>
                  <div className="flex-1">
                    <div className="text-base font-semibold">{question.prompt}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {question.options.map((o) => {
                        const isAI = o === "AI에게 맡기기"
                        const isCustom = o === "기타 직접 입력"
                        if (isCustom) {
                          return (
                            <button
                              key={o}
                              onClick={() => setShowCustom((v) => !v)}
                              className={cn(
                                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                                showCustom
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                              )}
                            >
                              <Pencil className="size-3.5" />
                              {o}
                            </button>
                          )
                        }
                        return (
                          <button
                            key={o}
                            onClick={() => answer(o)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                              isAI
                                ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                                : "border-border/60 bg-background text-foreground hover:border-primary/30 hover:bg-accent/50"
                            )}
                          >
                            {isAI && <Sparkles className="size-3.5" />}
                            {o}
                          </button>
                        )
                      })}
                    </div>

                    <AnimatePresence>
                      {showCustom && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 flex gap-2">
                            <Input
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              placeholder="직접 입력하세요"
                              className="h-10"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && customInput.trim()) {
                                  answer(customInput.trim())
                                }
                              }}
                            />
                            <Button
                              onClick={() => customInput.trim() && answer(customInput.trim())}
                              disabled={!customInput.trim()}
                            >
                              확인
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            )}

            {/* Manual generate button — appears after a few answers */}
            {!loading && !conflict && history.length >= 3 && !generated && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span className="text-muted-foreground">
                    충분한 정보가 모였습니다. 지금 바로 최종 프롬프트를 생성할 수 있어요.
                  </span>
                </div>
                <Button size="sm" onClick={() => generate()} disabled={loading}>
                  <Wand2 className="size-4" />
                  지금 생성하기
                </Button>
              </div>
            )}

            {/* Done pending */}
            {done && loading && !generated && (
              <Card className="flex items-center gap-3 p-5">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">최종 프롬프트를 생성 중입니다...</span>
              </Card>
            )}
          </motion.div>
        )}

        {phase === "result" && generated && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 space-y-4"
          >
            <SelectedTypeChip template={template} onReset={reset} />

            <Card className="overflow-hidden">
              <div className="flex items-start gap-3 bg-gradient-to-br from-primary/10 via-accent/30 to-transparent p-5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <div className="text-base font-semibold">프롬프트가 완성되었습니다</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {generated.summary}
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {generated.prompts.map((p, i) => (
                <ResultCard key={i} item={p} />
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="size-4" /> 새 프롬프트 만들기
              </Button>
              <Button
                variant="ghost"
                onClick={() => setPhase("conversation")}
              >
                <ArrowLeft className="size-4" /> 대화로 돌아가기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stepper({
  phase,
  completeness,
  className,
}: {
  phase: Phase
  completeness: number
  className?: string
}) {
  const steps = [
    { key: "select", label: "결과물 선택" },
    { key: "input", label: "자료 분석" },
    { key: "conversation", label: "요구사항 설계" },
    { key: "result", label: "프롬프트 생성" },
  ]
  const activeIdx = steps.findIndex((s) => s.key === phase)
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  i < activeIdx
                    ? "bg-primary text-primary-foreground"
                    : i === activeIdx
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i < activeIdx ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  i <= activeIdx ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-px flex-1 bg-border/60">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: i < activeIdx ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {phase === "conversation" && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">완성도</span>
            <span className="font-semibold text-primary">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-1.5" />
        </div>
      )}
    </div>
  )
}

function SelectedTypeChip({
  template,
  onReset,
}: {
  template: MetaTemplateDTO | null
  onReset: () => void
}) {
  if (!template) return null
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
        <DynamicIcon name={template.icon} className="size-4" />
      </span>
      <span className="text-sm font-medium">{template.label}</span>
      <Badge variant="outline" className="text-[0.65rem]">선택됨</Badge>
      <button
        onClick={onReset}
        className="ml-auto text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        변경
      </button>
    </div>
  )
}

function ResultCard({ item }: { item: GeneratedPrompt }) {
  const { copied, copy } = useCopy()
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          <span className="font-serif text-base font-semibold">{item.model}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5"
          onClick={() => copy(item.prompt, `${item.model} 프롬프트가 복사되었습니다`)}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "복사됨" : "복사"}
        </Button>
      </div>
      <div className="p-5">
        <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-xs leading-relaxed scrollbar-thin">
          {item.prompt}
        </pre>
        {item.note && (
          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
            {item.note}
          </p>
        )}
      </div>
    </Card>
  )
}
