import { NextResponse } from "next/server"
import { chatJSON, chat } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const maxDuration = 60

interface MetaRequest {
  action: "start" | "step" | "generate"
  resultType: string
  resultLabel: string
  fields: string[]
  materials?: string
  schema?: Record<string, string>
  history?: { field: string; question: string; answer: string }[]
  lastAnswer?: { field: string; value: string }
}

const RESULT_CONTEXT: Record<string, { models: string[]; guidance: string }> = {
  image: {
    models: ["Midjourney", "GPT-4o Image", "Stable Diffusion"],
    guidance: "이미지 생성. 용도, 스타일, 색감, 분위기, 텍스트 포함 여부, 화면 비율, 구도, 카메라 시점, 조명, 네거티브 프롬프트가 중요합니다.",
  },
  video: {
    models: ["Runway", "Veo 3", "Kling", "Seedance"],
    guidance: "동영상 생성. 영상 길이, 장면 수, 카메라 무빙, 피사체 움직임, 화면 전환, 자막, 효과음, BGM, 화면 비율이 중요합니다.",
  },
  report: {
    models: ["Claude", "GPT-4o"],
    guidance: "보고서 작성. 목적, 대상, 톤, 분량, 데이터 포함 여부, 구조, 핵심 포인트가 중요합니다.",
  },
  ppt: {
    models: ["Gamma", "GPT-4o", "Claude"],
    guidance: "프레젠테이션. 발표 목적, 대상, 발표 시간, 슬라이드 수, 디자인 스타일, 데이터 포함 여부, 스토리 구조가 중요합니다.",
  },
  website: {
    models: ["v0", "Cursor", "Claude"],
    guidance: "웹사이트 제작. 목적, 타겟 사용자, 스타일, 페이지 구성, 기능, 콘텐츠 톤, 기술 스택이 중요합니다.",
  },
  vibe: {
    models: ["Cursor", "v0", "Claude"],
    guidance: "바이브코딩 프로젝트. 프로젝트 타입, 기능, 디자인 스타일, 기술 스택, 타겟 사용자, 배포가 중요합니다.",
  },
  document: {
    models: ["Claude", "GPT-4o"],
    guidance: "문서 작성. 문서 유형, 목적, 대상, 톤, 분량, 구조가 중요합니다.",
  },
  code: {
    models: ["Claude", "GPT-4o", "Cursor"],
    guidance: "코드 작성. 언어, 목적, 프레임워크, 기능, 성능, 예외 처리가 중요합니다.",
  },
  other: {
    models: ["GPT-4o", "Claude"],
    guidance: "기타 결과물. 설명, 목적, 형식, 제약사항이 중요합니다.",
  },
}

const FIELD_LABELS: Record<string, string> = {
  purpose: "용도", style: "스타일", color: "색감", mood: "분위기",
  textIncluded: "텍스트 포함 여부", aspectRatio: "화면 비율", composition: "구도",
  cameraAngle: "카메라 시점", lighting: "조명", negativePrompt: "네거티브 프롬프트",
  duration: "영상 길이", sceneCount: "장면 수", cameraMovement: "카메라 무빙",
  subjectMotion: "피사체 움직임", transition: "화면 전환", subtitle: "자막",
  soundEffect: "효과음", bgm: "BGM", audience: "대상", tone: "톤",
  length: "분량", dataIncluded: "데이터 포함", structure: "구조",
  keyPoints: "핵심 포인트", designStyle: "디자인 스타일", storyStructure: "스토리 구조",
  targetUser: "타겟 사용자", pages: "페이지", features: "기능",
  contentTone: "콘텐츠 톤", techStack: "기술 스택", projectType: "프로젝트 타입",
  deployment: "배포", type: "유형", language: "언어", framework: "프레임워크",
  performance: "성능", errorHandling: "예외 처리", slideCount: "슬라이드 수",
  description: "설명", format: "형식", constraints: "제약사항",
}

function buildSchemaGuidance(fields: string[]) {
  return fields.map((f) => `- ${f} (${FIELD_LABELS[f] ?? f})`).join("\n")
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MetaRequest
    const ctx = RESULT_CONTEXT[body.resultType] ?? RESULT_CONTEXT.other

    if (body.action === "start") {
      return handleStart(body, ctx)
    } else if (body.action === "step") {
      return handleStep(body, ctx)
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

async function handleStart(body: MetaRequest, ctx: { models: string[]; guidance: string }) {
  const fields = body.fields
  const materials = body.materials ?? ""

  const sys = `당신은 최고 수준의 "메타 프롬프트 엔지니어"입니다.
사용자가 원하는 결과물(${body.resultLabel})을 가장 높은 완성도로 만들기 위해 요구사항을 구조적으로 설계합니다.

결과물 타입: ${body.resultType} (${body.resultLabel})
설계 가이드: ${ctx.guidance}

Requirement Schema 항목:
${buildSchemaGuidance(fields)}

작업:
1. 사용자가 입력한 자료를 분석하여 이미 확보된 정보를 Schema에서 자동으로 채운다.
   - 예: "제주 감성카페를 홍보할 유튜브 썸네일" → purpose="유튜브 썸네일", mood="감성", subject="제주 카페" 등
2. 전체 완성도(0~100)를 계산한다. 항목당 대략 100/필드수 % 가중치이나, 핵심 항목은 가중치를 높게 적용한다.
3. 완성도가 90% 미만이면, 지금 가장 중요한 "단 하나의" 질문을 구성한다.
   - 질문은 버튼 중심 UX. 2~4개의 명확한 선택지를 제공한다.
   - 모든 질문의 options 배열에는 반드시 "AI에게 맡기기" 와 "기타 직접 입력" 이 포함되어야 한다.
   - 선택지는 구체적이고 실무적이어야 한다.
4. 완성도가 90% 이상이면 done=true 로 설정한다.

반드시 다음 JSON 형식으로만 응답한다. 다른 텍스트는 절대 포함하지 않는다.
{
  "schema": { "<필드명>": "<추론된 값 또는 빈 문자열>", ... },
  "completeness": <숫자>,
  "done": <boolean>,
  "conflict": null,
  "nextQuestion": {
    "field": "<필드명>",
    "prompt": "<사용자에게 보여줄 질문 문장>",
    "options": ["<선택지1>", "<선택지2>", "AI에게 맡기기", "기타 직접 입력"],
    "allowCustom": true,
    "allowAI": true
  } | null
}`

  const userMsg = `사용자 입력 자료:\n"""\n${materials}\n"""\n\n이제 위 JSON으로 응답해주세요.`

  const result = await chatJSON([
    { role: "system", content: sys },
    { role: "user", content: userMsg },
  ])

  if (!result) {
    return NextResponse.json({ error: "AI 응답을 파싱하지 못했습니다." }, { status: 500 })
  }
  return NextResponse.json(result)
}

async function handleStep(
  body: MetaRequest,
  ctx: { models: string[]; guidance: string }
) {
  const fields = body.fields
  const schema = body.schema ?? {}
  const history = body.history ?? []
  const lastAnswer = body.lastAnswer

  // apply last answer into schema
  let workingSchema = { ...schema }
  if (lastAnswer) {
    if (lastAnswer.value === "AI에게 맡기기") {
      // ask AI to decide this field based on context
      const decideSys = `당신은 메타 프롬프트 엔지니어입니다. 아래 컨텍스트를 바탕으로 "${lastAnswer.field}" 항목의 가장 적절한 값을 한 단어/짧은 구로 결정하세요. 다른 설명 없이 값만 응답하세요.`
      const ctxStr = `결과물: ${body.resultLabel}\n자료: ${body.materials}\n현재 스키마: ${JSON.stringify(workingSchema)}`
      const decided = await chat([
        { role: "system", content: decideSys },
        { role: "user", content: ctxStr },
      ])
      workingSchema[lastAnswer.field] = decided.trim()
    } else {
      workingSchema[lastAnswer.field] = lastAnswer.value
    }
  }

  const sys = `당신은 최고 수준의 "메타 프롬프트 엔지니어"입니다.
결과물 타입: ${body.resultType} (${body.resultLabel})
설계 가이드: ${ctx.guidance}

Requirement Schema 항목:
${buildSchemaGuidance(fields)}

현재까지 확보된 Schema:
${JSON.stringify(workingSchema, null, 2)}

작업:
1. 방금 사용자가 응답한 내용을 반영하여 Schema를 갱신한다 (이미 반영된 값은 유지).
2. 기존 응답들 사이에 방향성 충돌이 있는지 감지한다.
   - 예: "럭셔리/고급스러움" vs "빈티지/시골 감성" 처럼 어울리지 않는 조합.
   - 충돌이 감지되면 conflict 객체를 채우고, 어떤 충돌인지 이유를 설명하며 해결 선택지를 제공한다.
3. 충돌이 없다면 완성도(0~100)를 재계산한다.
4. 완성도 90% 이상이면 done=true, nextQuestion=null.
5. 90% 미만이면 다음 "단 하나의" 질문을 구성한다 (버튼 중심, options에 "AI에게 맡기기","기타 직접 입력" 필수).
6. 이미 값이 채워진 필드는 다시 질문하지 않는다.

반드시 다음 JSON 형식으로만 응답한다:
{
  "schema": { ... },
  "completeness": <숫자>,
  "done": <boolean>,
  "conflict": {
    "description": "<충돌 설명과 이유>",
    "options": ["<해결선택지1>", "<해결선택지2>", "<해결선택지3>"]
  } | null,
  "nextQuestion": {
    "field": "<필드명>",
    "prompt": "<질문 문장>",
    "options": ["<선택지1>", "<선택지2>", "AI에게 맡기기", "기타 직접 입력"],
    "allowCustom": true,
    "allowAI": true
  } | null
}`

  const userMsg = `방금 사용자 응답: ${lastAnswer ? JSON.stringify(lastAnswer) : "(없음)"}\n지금까지의 질문-응답 기록: ${JSON.stringify(history)}\n원래 입력 자료: ${body.materials ?? ""}\n\n위 JSON으로 응답해주세요.`

  const result = await chatJSON([
    { role: "system", content: sys },
    { role: "user", content: userMsg },
  ])

  if (!result) {
    return NextResponse.json({ error: "AI 응답을 파싱하지 못했습니다." }, { status: 500 })
  }
  // ensure schema carried forward even if AI omits
  result.schema = { ...workingSchema, ...(result.schema ?? {}) }
  return NextResponse.json(result)
}

async function handleGenerate(
  body: MetaRequest,
  ctx: { models: string[]; guidance: string }
) {
  const schema = body.schema ?? {}

  const sys = `당신은 최고 수준의 메타 프롬프트 엔지니어이자 각 생성형 AI 모델의 특성을 완벽히 이해하는 전문가입니다.

결과물 타입: ${body.resultType} (${body.resultLabel})
설계 가이드: ${ctx.guidance}

완성된 Requirement Schema:
${JSON.stringify(schema, null, 2)}

원래 사용자 입력 자료:
${body.materials ?? ""}

작업:
아래 모델 각각에 대해, 이 Schema를 바탕으로 해당 모델에 가장 최적화된 형태의 최종 프롬프트를 생성한다.
- Schema에 명시된 모든 값(용도, 스타일, 분위기 등)을 반드시 충실히 반영한다. 임의로 다른 컨셉을 지어내지 않는다.
- Schema 값이 "AI에게 맡기기"이거나 비어 있는 항목은, 전체 문맥에 가장 어울리는 최적값을 당신이 직접 결정해 프롬프트에 반영한다.
- 각 모델의 프롬프트 문법과 강점을 반영한다 (예: Midjourney는 파라미터 스타일, GPT-4o Image는 자연어 묘사, Claude/GPT는 구조적 지시문).
- 프롬프트는 바로 복사해서 실행할 수 있는 완성된 형태여야 한다.
- 한국어 설명은 "note" 필드에 간단히, 실제 프롬프트 본문은 "prompt" 필드에 작성한다.

대상 모델: ${ctx.models.join(", ")}

반드시 다음 JSON 형식으로만 응답한다:
{
  "summary": "<완성된 프롬프트의 핵심 방향성 1~2문장 요약>",
  "prompts": [
    { "model": "<모델명>", "prompt": "<최종 프롬프트 본문>", "note": "<이 모델에 대한 짧은 팁>" }
  ]
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
