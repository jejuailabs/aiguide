import { NextResponse } from "next/server"
import { chatJSON } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const maxDuration = 60

interface BankQuestion {
  field: string
  prompt: string
  options: string[]
}

interface MetaRequest {
  action: "start" | "next" | "generate"
  resultType: string
  resultLabel: string
  fields: string[]
  bank?: BankQuestion[]
  materials?: string
  schema?: Record<string, string>
  history?: { field: string; question: string; answer: string }[]
  lastAnswer?: { field: string; value: string }
  asked?: number
}

const RESULT_CONTEXT: Record<string, { guidance: string }> = {
  image: { guidance: "이미지 생성. 용도, 스타일, 색감, 분위기, 텍스트 포함 여부, 화면 비율, 구도, 조명이 중요합니다. 용도에 따라 들어갈 실제 내용(문구, 이름 등)이 필수일 수 있습니다." },
  video: { guidance: "동영상 생성. 용도, 길이, 장면 수, 카메라 무빙, 분위기, 비율, BGM이 중요합니다." },
  report: { guidance: "보고서 작성. 목적, 대상, 톤, 분량, 구조, 데이터, 핵심 포인트가 중요합니다. 보고서의 실제 주제와 핵심 내용이 필수입니다." },
  ppt: { guidance: "프레젠테이션. 발표 목적, 대상, 슬라이드 수, 디자인, 스토리 구조가 중요합니다. 발표 주제가 필수입니다." },
  website: { guidance: "웹사이트 제작. 목적, 타겟, 스타일, 페이지 구성, 기능, 톤, 기술 스택이 중요합니다. 사이트 이름/업체명 같은 실제 내용이 필요할 수 있습니다." },
  vibe: { guidance: "바이브코딩 프로젝트. 프로젝트 타입, 기능, 디자인, 기술 스택, 타겟, 배포가 중요합니다. 서비스가 해결하는 문제/이름이 필요할 수 있습니다." },
  document: { guidance: "문서 작성. 유형, 목적, 대상, 톤, 분량, 구조가 중요합니다. 문서에 들어갈 실제 내용(수신자, 용건 등)이 필수입니다." },
  code: { guidance: "코드 작성. 언어, 목적, 프레임워크, 기능, 성능, 예외 처리가 중요합니다. 구현할 기능의 구체적 설명이 필수입니다." },
  other: { guidance: "기타 결과물. 설명, 목적, 형식, 제약사항이 중요합니다." },
}

const MAX_QUESTIONS = 10

function bankToText(bank: BankQuestion[]) {
  return bank
    .map((q, i) => `${i + 1}. [${q.field}] ${q.prompt} — 선택지: ${q.options.length ? q.options.join(" / ") : "(자유 입력)"}`)
    .join("\n")
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MetaRequest
    const ctx = RESULT_CONTEXT[body.resultType] ?? RESULT_CONTEXT.other

    if (body.action === "start") {
      return handleStart(body, ctx)
    } else if (body.action === "next") {
      return handleNext(body, ctx)
    } else if (body.action === "generate") {
      return handleGenerate(body, ctx)
    }
    return NextResponse.json({ error: "알 수 없는 action 입니다." }, { status: 400 })
  } catch (e: any) {
    console.error("[meta-prompt] error:", e)
    return NextResponse.json(
      { error: "메타 프롬프트 엔진 처리 중 오류가 발생했습니다.", detail: e?.message },
      { status: 500 }
    )
  }
}

/**
 * start — 사용자가 붙여넣은 참고자료를 분석해 스키마를 미리 채운다.
 */
async function handleStart(body: MetaRequest, ctx: { guidance: string }) {
  const sys = `당신은 최고 수준의 메타 프롬프트 엔지니어입니다.
결과물 타입: ${body.resultType} (${body.resultLabel})
설계 가이드: ${ctx.guidance}

수집해야 할 항목:
${(body.fields ?? []).map((f) => `- ${f}`).join("\n")}

작업:
사용자가 입력한 자료를 분석해, 위 항목 중 자료에서 확실히 알 수 있는 것만 값을 채운다.
확실하지 않은 항목은 빈 문자열로 둔다. 지어내지 않는다.

반드시 다음 JSON 형식으로만 응답한다:
{ "schema": { "<필드명>": "<추론된 값 또는 빈 문자열>", ... } }`

  const result = await chatJSON([
    { role: "system", content: sys },
    { role: "user", content: `사용자 입력 자료:\n"""\n${body.materials ?? ""}\n"""` },
  ])

  if (!result) {
    return NextResponse.json({ error: "AI 응답을 파싱하지 못했습니다." }, { status: 500 })
  }
  return NextResponse.json({ schema: result.schema ?? {} })
}

/**
 * next — 매 답변마다 AI가 전체 맥락을 재검토한다.
 * 불필요해진 질문은 자동 확정하고, 답변에서 파생된 필수 정보는 새 질문으로 만들고,
 * 다음에 물을 단 하나의 질문과 완성도를 결정한다.
 */
async function handleNext(body: MetaRequest, ctx: { guidance: string }) {
  const bank = body.bank ?? []
  const schema = body.schema ?? {}
  const history = body.history ?? []
  const asked = body.asked ?? history.length
  const remaining = MAX_QUESTIONS - asked

  const sys = `당신은 최고 수준의 메타 프롬프트 엔지니어입니다. 사용자에게 버튼 중심으로 한 번에 하나씩 질문하며 "${body.resultLabel}" 결과물 제작에 필요한 요구사항을 수집합니다.

결과물 타입: ${body.resultType} (${body.resultLabel})
설계 가이드: ${ctx.guidance}

기본 질문 체크리스트 (참고용 설계 — 순서와 문구를 맥락에 맞게 바꿔도 된다):
${bankToText(bank)}

현재까지 수집된 답변:
${JSON.stringify(schema, null, 2)}

질문-답변 기록:
${JSON.stringify(history)}

지금까지 ${asked}개 질문했고, 최대 ${remaining}개 더 물을 수 있다 (전체 상한 ${MAX_QUESTIONS}개).

작업 — 방금 답변을 포함한 전체 맥락을 재해석한다:
1. 방금 답변으로 인해 이미 답이 정해졌거나 불필요해진 체크리스트 항목이 있으면, 직접 값을 확정해 autoFilled에 담는다.
   - 예: 용도가 "명함"이면 화면 비율은 표준 명함 비율(9:5)로 자동 확정하고 비율 질문은 생략한다.
   - 예: "텍스트 없음"을 선택했으면 텍스트 문구 관련 항목은 "해당 없음"으로 확정한다.
2. 답변 내용상 결과물에 반드시 필요한 새 정보가 드러났으면, 체크리스트에 없어도 새 질문을 만든다.
   - 예: 명함 → 이름/직함/연락처. "제목 텍스트 포함" → 실제 제목 문구. 자기소개서 → 지원 직무.
   - 이런 필수 내용 질문이 남은 취향/스타일 질문보다 항상 우선이다.
3. 다음 질문은 단 하나만 정한다. 체크리스트 문구를 그대로 쓰지 말고 지금까지의 답변 맥락을 반영해 자연스럽게 다듬는다. 선택지도 맥락에 맞게 조정한다 (2~5개). 이름/문구처럼 자유 입력이 적합하면 options를 빈 배열로 둔다.
4. 완성도(0~100)를 판단한다. 기준: 이 결과물을 높은 품질로 만들기 위해 필요한 정보 중 확보된 비율. 남은 질문 개수가 아니라 정보의 실질 가치로 판단한다.
5. 완성도가 90% 이상이거나, 더 물을 가치가 있는 것이 없거나, 질문 상한에 도달하면 done=true, nextQuestion=null.

반드시 다음 JSON 형식으로만 응답한다:
{
  "schema": { "<필드명>": "<값>", ... (자동 확정 포함, 전체 갱신본) },
  "autoFilled": [ { "field": "<필드명>", "value": "<확정값>", "reason": "<한 줄 이유>" } ],
  "completeness": <0~100>,
  "done": <boolean>,
  "nextQuestion": { "field": "<필드명>", "prompt": "<질문>", "options": ["<선택지>", ...] } | null
}`

  const userMsg = body.lastAnswer
    ? `방금 사용자 답변: [${body.lastAnswer.field}] = "${body.lastAnswer.value}"\n\n위 JSON으로 응답해주세요.`
    : `아직 답변 없음 (참고자료 분석 직후). 지금 가장 먼저 물어야 할 질문을 정해주세요.\n\n위 JSON으로 응답해주세요.`

  const result = await chatJSON([
    { role: "system", content: sys },
    { role: "user", content: userMsg },
  ])

  if (!result) {
    return NextResponse.json({ error: "AI 응답을 파싱하지 못했습니다." }, { status: 500 })
  }

  // 안전 보정: 스키마는 기존 값 위에 병합, 형식 검증
  const mergedSchema = { ...schema, ...(result.schema ?? {}) }
  const nq = result.nextQuestion
  const nextQuestion =
    nq && typeof nq.field === "string" && typeof nq.prompt === "string"
      ? { field: nq.field, prompt: nq.prompt, options: Array.isArray(nq.options) ? nq.options.slice(0, 5) : [] }
      : null
  const autoFilled = Array.isArray(result.autoFilled)
    ? result.autoFilled.filter((a: any) => a && typeof a.field === "string" && typeof a.value === "string")
    : []
  const done = !!result.done || asked >= MAX_QUESTIONS || !nextQuestion

  return NextResponse.json({
    schema: mergedSchema,
    autoFilled,
    completeness: typeof result.completeness === "number" ? Math.min(100, Math.max(0, result.completeness)) : 0,
    done,
    nextQuestion: done ? null : nextQuestion,
  })
}

/**
 * generate — 수집된 요구사항으로 역할 규정이 포함된 단일 완성형 프롬프트를 만든다.
 */
async function handleGenerate(body: MetaRequest, ctx: { guidance: string }) {
  const schema = body.schema ?? {}

  const sys = `당신은 최고 수준의 메타 프롬프트 엔지니어입니다. 사용자가 선택한 요구사항으로 "바로 실행 가능한 최종 프롬프트"를 만듭니다.

결과물 타입: ${body.resultType} (${body.resultLabel})
설계 가이드: ${ctx.guidance}

수집된 요구사항:
${JSON.stringify(schema, null, 2)}

참고 자료(있다면):
${body.materials ?? ""}

작업 — 하나의 완성형 프롬프트를 작성한다:
1. 프롬프트 맨 앞에 이 결과물에 최적화된 전문가 역할 규정을 넣는다.
   - 예: 이미지 → "당신은 15년 경력의 브랜드 비주얼 디렉터입니다.", 보고서 → "당신은 대기업 전략기획팀 출신의 비즈니스 라이터입니다.", 코드 → "당신은 시니어 소프트웨어 엔지니어입니다."
   - 결과물의 용도에 맞춰 역할을 구체적으로 커스터마이즈한다 (명함이면 "명함/브랜딩 전문 디자이너"처럼).
2. 수집된 모든 요구사항을 반드시 충실히 반영한다. 임의로 다른 컨셉을 지어내지 않는다.
3. 값이 "AI에게 맡기기"이거나 비어 있는 항목은 전체 문맥에 가장 어울리는 최적값을 직접 결정해 반영한다.
4. GPT 계열 대화형 AI에 그대로 붙여넣어 실행하면 되는 형태로 쓴다: 역할 규정 → 목표 → 세부 요구사항(구조화) → 출력 형식 지시 순.
5. 사용자가 입력한 실제 내용(이름, 문구, 제목 등)이 있다면 프롬프트 안에 그대로 포함시킨다.
6. 프롬프트는 한국어로 작성한다 (이미지/영상처럼 영문 프롬프트가 관례인 경우, 장면 묘사 부분만 영문 병기 가능).

반드시 다음 JSON 형식으로만 응답한다:
{
  "summary": "<완성된 프롬프트의 핵심 방향성 1~2문장 요약>",
  "prompt": "<최종 프롬프트 본문 (역할 규정 포함)>",
  "note": "<사용 팁 1문장>"
}`

  const result = await chatJSON([
    { role: "system", content: sys },
    { role: "user", content: "위 지시에 따라 JSON으로 응답해주세요." },
  ])

  if (!result) {
    return NextResponse.json({ error: "AI 응답을 파싱하지 못했습니다." }, { status: 500 })
  }
  return NextResponse.json(result)
}
