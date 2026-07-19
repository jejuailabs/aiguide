"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2, ArrowLeft, Sparkles, Copy, Check, Loader2,
  RefreshCw, Lightbulb, CheckCircle2, Pencil, ChevronDown, FileText,
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
import { getQuestions, type BankQuestion } from "@/lib/meta-questions"

type Phase = "select" | "questions" | "result"

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
  const [questions, setQuestions] = React.useState<BankQuestion[]>([])
  const [idx, setIdx] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [prefilled, setPrefilled] = React.useState<Set<string>>(new Set())
  const [materials, setMaterials] = React.useState("")
  const [showMaterials, setShowMaterials] = React.useState(false)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [customInput, setCustomInput] = React.useState("")
  const [showCustom, setShowCustom] = React.useState(false)
  const [generated, setGenerated] = React.useState<{
    summary: string
    prompts: GeneratedPrompt[]
  } | null>(null)

  const total = questions.length
  const answeredCount = questions.filter((q) => answers[q.field]).length
  const completeness = total > 0 ? Math.round((answeredCount / total) * 100) : 0
  const current = questions[idx] ?? null

  const reset = () => {
    setPhase("select")
    setTemplate(null)
    setQuestions([])
    setIdx(0)
    setAnswers({})
    setPrefilled(new Set())
    setMaterials("")
    setShowMaterials(false)
    setCustomInput("")
    setShowCustom(false)
    setGenerated(null)
  }

  /** 다음 미응답 질문 인덱스를 찾는다. 없으면 -1 */
  const nextUnanswered = (from: number, a: Record<string, string>) => {
    for (let i = from; i < questions.length; i++) {
      if (!a[questions[i].field]) return i
    }
    for (let i = 0; i < from; i++) {
      if (!a[questions[i].field]) return i
    }
    return -1
  }

  const onSelectTemplate = (t: MetaTemplateDTO) => {
    setTemplate(t)
    let fields: string[] = []
    try {
      fields = JSON.parse(t.schemaJson).fields ?? []
    } catch { /* noop */ }
    const qs = getQuestions(t.resultType, fields)
    setQuestions(qs)
    setIdx(0)
    setAnswers({})
    setPrefilled(new Set())
    setPhase("questions")
  }

  /** 참고자료 AI 분석 → 답변 자동 채움 */
  const analyzeMaterials = async () => {
    if (!template || !materials.trim()) return
    setAnalyzing(true)
    try {
      const res = await fetch("/api/meta-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          resultType: template.resultType,
          resultLabel: template.label,
          fields: questions.map((q) => q.field),
          materials,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "분석 실패")
      const schema: Record<string, string> = data.schema ?? {}
      const filled = new Set<string>()
      const merged = { ...answers }
      for (const q of questions) {
        const v = (schema[q.field] ?? "").trim()
        if (v && !merged[q.field]) {
          merged[q.field] = v
          filled.add(q.field)
        }
      }
      setAnswers(merged)
      setPrefilled(filled)
      setShowMaterials(false)
      if (filled.size > 0) {
        toast.success(`참고자료 분석으로 ${filled.size}개 항목이 자동 완성되었습니다`)
      } else {
        toast.info("자동으로 채울 수 있는 항목을 찾지 못했습니다")
      }
      const remain = questions.findIndex((q) => !merged[q.field])
      if (remain === -1) {
        generate(merged)
      } else {
        setIdx(remain)
      }
    } catch (e: any) {
      toast.error(e.message ?? "참고자료 분석에 실패했습니다.")
    } finally {
      setAnalyzing(false)
    }
  }

  const answer = (value: string) => {
    if (!current) return
    const merged = { ...answers, [current.field]: value }
    setAnswers(merged)
    setCustomInput("")
    setShowCustom(false)
    const next = nextUnanswered(idx + 1, merged)
    if (next === -1) {
      generate(merged)
    } else {
      setIdx(next)
    }
  }

  const goBack = () => {
    // 직전 답변한 질문으로 이동해 다시 선택할 수 있게
    for (let i = idx - 1; i >= 0; i--) {
      if (answers[questions[i].field]) {
        const merged = { ...answers }
        delete merged[questions[i].field]
        setAnswers(merged)
        setIdx(i)
        return
      }
    }
  }

  const generate = async (finalAnswers?: Record<string, string>) => {
    if (!template) return
    const schema = finalAnswers ?? answers
    setLoading(true)
    try {
      const res = await fetch("/api/meta-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          resultType: template.resultType,
          resultLabel: template.label,
          fields: questions.map((q) => q.field),
          materials,
          schema,
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
        desc="결과물을 선택하면 꼭 필요한 질문만 버튼으로 골라 답합니다. 10단계 안에 최적화된 프롬프트가 완성됩니다."
      />

      <Stepper phase={phase} className="mt-8" />

      <AnimatePresence mode="wait">
        {/* ---------- 1단계: 결과물 선택 ---------- */}
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

        {/* ---------- 2단계: 객관식 질문 ---------- */}
        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 space-y-4"
          >
            <SelectedTypeChip template={template} onReset={reset} />

            {/* 진행 상황 */}
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">
                  질문 {Math.min(answeredCount + 1, total)} / {total}
                </span>
                <span className="text-xs text-muted-foreground">
                  완성도 <span className="font-semibold text-primary">{completeness}%</span>
                  {completeness >= 90 && " · 곧 생성됩니다"}
                </span>
              </div>
              <Progress value={completeness} className="h-1.5" />
            </div>

            {/* 참고자료 (선택) — AI가 분석해 답변 자동 채움 */}
            {answeredCount === 0 && (
              <div className="rounded-2xl border border-dashed border-border/60">
                <button
                  onClick={() => setShowMaterials((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="size-4" />
                    참고자료가 있다면 붙여넣기 (선택사항 — AI가 분석해 질문을 건너뜁니다)
                  </span>
                  <ChevronDown className={cn("size-4 transition-transform", showMaterials && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showMaterials && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 px-4 pb-4">
                        <Textarea
                          value={materials}
                          onChange={(e) => setMaterials(e.target.value)}
                          placeholder="예) 제주 감성카페 홍보용. 따뜻한 색감에 여백 넓게, 유튜브에 올릴 거야."
                          className="min-h-[100px] resize-none"
                        />
                        <Button
                          size="sm"
                          onClick={analyzeMaterials}
                          disabled={!materials.trim() || analyzing}
                        >
                          {analyzing ? (
                            <><Loader2 className="size-4 animate-spin" /> 분석 중...</>
                          ) : (
                            <><Sparkles className="size-4" /> AI로 자동 채우기</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 자동 완성된 항목 요약 */}
            {prefilled.size > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs">
                <Sparkles className="size-3.5 text-primary" />
                <span className="text-muted-foreground">자동 완성:</span>
                {questions.filter((q) => prefilled.has(q.field)).map((q) => (
                  <Badge key={q.field} variant="secondary" className="text-[0.65rem]">
                    {answers[q.field]}
                  </Badge>
                ))}
              </div>
            )}

            {/* 답변 히스토리 */}
            {answeredCount > 0 && (
              <div className="space-y-2">
                {questions.filter((q) => answers[q.field] && !prefilled.has(q.field)).map((q, i) => (
                  <div
                    key={q.field}
                    className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/30 p-3 text-sm"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.6rem] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">{q.prompt}</div>
                      <div className="mt-0.5 font-medium">{answers[q.field]}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 생성 중 */}
            {loading && (
              <Card className="flex items-center gap-3 p-5">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  모든 정보가 모였습니다. 최종 프롬프트를 생성 중입니다...
                </span>
              </Card>
            )}

            {/* 현재 질문 */}
            {current && !loading && (
              <Card className="overflow-hidden">
                <div className="flex items-start gap-3 p-5">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Lightbulb className="size-5" />
                  </span>
                  <div className="flex-1">
                    <div className="text-base font-semibold">{current.prompt}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {current.options.map((o) => (
                        <button
                          key={o}
                          onClick={() => answer(o)}
                          className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-accent/50"
                        >
                          {o}
                        </button>
                      ))}
                      <button
                        onClick={() => answer("AI에게 맡기기")}
                        className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10"
                      >
                        <Sparkles className="size-3.5" />
                        AI에게 맡기기
                      </button>
                      <button
                        onClick={() => setShowCustom((v) => !v)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                          showCustom
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        )}
                      >
                        <Pencil className="size-3.5" />
                        기타 직접 입력
                      </button>
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

            {/* 하단 액션 */}
            {!loading && (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  disabled={answeredCount === 0}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="size-4" /> 이전 질문
                </Button>
                {answeredCount >= Math.ceil(total * 0.5) && answeredCount < total && (
                  <Button size="sm" variant="outline" onClick={() => generate()}>
                    <Wand2 className="size-4" />
                    남은 건 AI에게 맡기고 지금 생성
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ---------- 3단계: 결과 ---------- */}
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
                onClick={() => {
                  setGenerated(null)
                  setPhase("questions")
                }}
              >
                <ArrowLeft className="size-4" /> 답변 수정하기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stepper({ phase, className }: { phase: Phase; className?: string }) {
  const steps = [
    { key: "select", label: "결과물 선택" },
    { key: "questions", label: "필수 항목 선택" },
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
