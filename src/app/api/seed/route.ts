import { NextResponse } from "next/server"
import { firestore } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const metaPromptTemplates = [
  {
    resultType: "image",
    label: "이미지",
    icon: "Image",
    schemaJson: JSON.stringify({
      fields: [
        "purpose", "style", "color", "mood", "textIncluded",
        "aspectRatio", "composition", "cameraAngle", "lighting", "negativePrompt",
      ],
    }),
  },
  {
    resultType: "video",
    label: "동영상",
    icon: "Video",
    schemaJson: JSON.stringify({
      fields: [
        "purpose", "duration", "sceneCount", "cameraMovement",
        "subjectMotion", "transition", "subtitle", "soundEffect", "bgm", "aspectRatio",
      ],
    }),
  },
  {
    resultType: "report",
    label: "보고서",
    icon: "FileText",
    schemaJson: JSON.stringify({
      fields: [
        "purpose", "audience", "tone", "length",
        "dataIncluded", "structure", "keyPoints",
      ],
    }),
  },
  {
    resultType: "ppt",
    label: "프레젠테이션",
    icon: "Presentation",
    schemaJson: JSON.stringify({
      fields: [
        "purpose", "audience", "duration", "slideCount",
        "designStyle", "dataIncluded", "storyStructure",
      ],
    }),
  },
  {
    resultType: "website",
    label: "웹사이트",
    icon: "Globe",
    schemaJson: JSON.stringify({
      fields: [
        "purpose", "targetUser", "style", "pages",
        "features", "contentTone", "techStack",
      ],
    }),
  },
  {
    resultType: "vibe",
    label: "바이브코딩",
    icon: "Code",
    schemaJson: JSON.stringify({
      fields: [
        "projectType", "features", "designStyle",
        "techStack", "targetUser", "deployment",
      ],
    }),
  },
  {
    resultType: "document",
    label: "문서",
    icon: "FileEdit",
    schemaJson: JSON.stringify({
      fields: [
        "type", "purpose", "audience", "tone", "length", "structure",
      ],
    }),
  },
  {
    resultType: "code",
    label: "코드",
    icon: "Terminal",
    schemaJson: JSON.stringify({
      fields: [
        "language", "purpose", "framework",
        "features", "performance", "errorHandling",
      ],
    }),
  },
]

const miniTools = [
  {
    name: "QR 코드 생성기",
    description: "URL, 텍스트, 연락처 등을 QR 코드로 즉시 변환",
    icon: "QrCode",
    category: "변환",
    actionType: "qr",
    isInteractive: true,
    order: 0,
  },
  {
    name: "JSON 포맷터",
    description: "JSON 데이터를 보기 좋게 정리하고 검증",
    icon: "Braces",
    category: "개발",
    actionType: "json",
    isInteractive: true,
    order: 1,
  },
  {
    name: "Base64 인코더/디코더",
    description: "텍스트와 Base64 간 변환",
    icon: "Binary",
    category: "개발",
    actionType: "base64",
    isInteractive: true,
    order: 2,
  },
  {
    name: "마크다운 프리뷰",
    description: "마크다운 텍스트를 실시간 프리뷰",
    icon: "FileText",
    category: "문서",
    actionType: "markdown",
    isInteractive: true,
    order: 3,
  },
  {
    name: "URL 인코더/디코더",
    description: "URL 특수문자 인코딩/디코딩",
    icon: "Link",
    category: "개발",
    actionType: "url-encode",
    isInteractive: true,
    order: 4,
  },
  {
    name: "텍스트 변환기",
    description: "대소문자, 카멜케이스 등 텍스트 변환",
    icon: "Type",
    category: "텍스트",
    actionType: "text-case",
    isInteractive: true,
    order: 5,
  },
]

const aiTools = [
  {
    name: "ChatGPT",
    tagline: "OpenAI의 대화형 AI 어시스턴트",
    description: "자연어 대화, 글쓰기, 코드 작성, 분석 등 다양한 작업을 수행하는 범용 AI",
    category: "대화형 AI",
    icon: "MessageSquare",
    price: "부분 무료",
    platforms: JSON.stringify(["web", "ios", "android"]),
    useCases: JSON.stringify(["글쓰기", "코딩", "분석", "번역"]),
    websiteUrl: "https://chat.openai.com",
    featured: true,
    order: 0,
  },
  {
    name: "Claude",
    tagline: "Anthropic의 안전한 AI 어시스턴트",
    description: "긴 문맥 이해, 정확한 분석, 코드 작성에 특화된 AI 어시스턴트",
    category: "대화형 AI",
    icon: "Brain",
    price: "부분 무료",
    platforms: JSON.stringify(["web", "ios", "android"]),
    useCases: JSON.stringify(["분석", "글쓰기", "코딩", "요약"]),
    websiteUrl: "https://claude.ai",
    featured: true,
    order: 1,
  },
  {
    name: "Midjourney",
    tagline: "고품질 AI 이미지 생성",
    description: "텍스트 프롬프트로 놀라운 품질의 이미지를 생성하는 AI 도구",
    category: "이미지 생성",
    icon: "Image",
    price: "유료",
    platforms: JSON.stringify(["web"]),
    useCases: JSON.stringify(["이미지 생성", "아트워크", "컨셉 디자인"]),
    websiteUrl: "https://midjourney.com",
    featured: true,
    order: 2,
  },
  {
    name: "Cursor",
    tagline: "AI 기반 코드 에디터",
    description: "AI가 코드를 이해하고 작성을 도와주는 차세대 코드 에디터",
    category: "코딩",
    icon: "Code",
    price: "부분 무료",
    platforms: JSON.stringify(["windows", "mac", "linux"]),
    useCases: JSON.stringify(["코딩", "디버깅", "리팩토링"]),
    websiteUrl: "https://cursor.sh",
    featured: true,
    order: 3,
  },
  {
    name: "Runway",
    tagline: "AI 동영상 생성 및 편집",
    description: "텍스트나 이미지에서 동영상을 생성하고 편집하는 AI 플랫폼",
    category: "동영상",
    icon: "Video",
    price: "부분 무료",
    platforms: JSON.stringify(["web"]),
    useCases: JSON.stringify(["동영상 생성", "영상 편집", "모션 그래픽"]),
    websiteUrl: "https://runwayml.com",
    featured: false,
    order: 4,
  },
  {
    name: "Gamma",
    tagline: "AI 프레젠테이션 생성",
    description: "텍스트만으로 전문적인 프레젠테이션을 자동 생성",
    category: "프레젠테이션",
    icon: "Presentation",
    price: "부분 무료",
    platforms: JSON.stringify(["web"]),
    useCases: JSON.stringify(["PPT 생성", "문서 작성", "웹페이지"]),
    websiteUrl: "https://gamma.app",
    featured: false,
    order: 5,
  },
]

const prompts = [
  {
    title: "블로그 포스트 작성",
    description: "SEO 최적화된 블로그 포스트를 구조적으로 작성",
    body: "다음 주제에 대해 SEO 최적화된 블로그 포스트를 작성해주세요.\n\n주제: [주제]\n타겟 독자: [독자]\n톤: [톤]\n\n구조:\n1. 흥미로운 제목 (60자 이내)\n2. 서론 (독자의 관심을 끄는 hook)\n3. 본론 (H2, H3 소제목으로 구분)\n4. 결론 (CTA 포함)\n5. 메타 디스크립션 (160자 이내)",
    category: "글쓰기",
    bestModel: "Claude",
    tags: JSON.stringify(["블로그", "SEO", "콘텐츠"]),
    version: "1.0",
    favorites: 42,
    order: 0,
  },
  {
    title: "코드 리뷰 요청",
    description: "체계적인 코드 리뷰를 요청하는 프롬프트",
    body: "다음 코드를 리뷰해주세요.\n\n```\n[코드]\n```\n\n리뷰 관점:\n1. 버그/오류 가능성\n2. 성능 최적화\n3. 코드 가독성\n4. 보안 취약점\n5. 베스트 프랙티스 준수\n\n각 항목에 대해 구체적인 개선 제안을 코드와 함께 제공해주세요.",
    category: "코딩",
    bestModel: "Claude",
    tags: JSON.stringify(["코드리뷰", "개발", "품질"]),
    version: "1.0",
    favorites: 38,
    order: 1,
  },
  {
    title: "이미지 프롬프트 생성",
    description: "Midjourney/DALL-E용 상세한 이미지 프롬프트",
    body: "다음 컨셉에 맞는 AI 이미지 생성 프롬프트를 작성해주세요.\n\n컨셉: [컨셉]\n스타일: [스타일]\n분위기: [분위기]\n\n프롬프트에 포함할 요소:\n- 주요 피사체 상세 묘사\n- 배경/환경\n- 조명/색감\n- 카메라 앵글/구도\n- 아트 스타일 참조\n- 네거티브 프롬프트\n\nMidjourney 파라미터(--ar, --v, --s 등)도 추천해주세요.",
    category: "이미지",
    bestModel: "GPT-4o",
    tags: JSON.stringify(["이미지", "Midjourney", "프롬프트"]),
    version: "1.0",
    favorites: 55,
    order: 2,
  },
  {
    title: "비즈니스 이메일 작성",
    description: "상황에 맞는 전문적인 비즈니스 이메일 작성",
    body: "다음 상황에 맞는 비즈니스 이메일을 작성해주세요.\n\n목적: [목적]\n수신자: [수신자/관계]\n톤: [격식/반격식]\n핵심 메시지: [전달할 내용]\n\n요구사항:\n- 명확한 제목\n- 간결한 본문 (3-4 문단)\n- 구체적인 CTA\n- 적절한 인사/마무리",
    category: "글쓰기",
    bestModel: "GPT-4o",
    tags: JSON.stringify(["이메일", "비즈니스", "커뮤니케이션"]),
    version: "1.0",
    favorites: 31,
    order: 3,
  },
]

const vibeSolutions = [
  {
    title: "AI 챗봇 대시보드",
    tagline: "고객 상담 AI 챗봇 관리 시스템",
    description: "AI 챗봇의 대화 내역, 성능 지표, 학습 데이터를 관리하는 대시보드",
    url: "https://example.com/chatbot-dashboard",
    thumbnail: "/images/placeholder.png",
    features: JSON.stringify(["실시간 대화 모니터링", "성능 분석", "학습 데이터 관리"]),
    purpose: "고객 상담 자동화",
    category: "고객 서비스",
    aiUsed: JSON.stringify(["GPT-4o", "Claude"]),
    techStack: JSON.stringify(["Next.js", "Python", "FastAPI"]),
    featured: true,
    order: 0,
  },
  {
    title: "AI 콘텐츠 생성기",
    tagline: "마케팅 콘텐츠 자동 생성 도구",
    description: "블로그, SNS, 광고 카피 등 다양한 마케팅 콘텐츠를 AI로 생성",
    url: "https://example.com/content-gen",
    thumbnail: "/images/placeholder.png",
    features: JSON.stringify(["멀티 채널 콘텐츠", "톤 커스터마이징", "A/B 테스트"]),
    purpose: "마케팅 콘텐츠 자동화",
    category: "마케팅",
    aiUsed: JSON.stringify(["Claude", "GPT-4o"]),
    techStack: JSON.stringify(["React", "Node.js", "PostgreSQL"]),
    featured: true,
    order: 1,
  },
]

const communityPosts = [
  {
    title: "GPT-4o 이미지 생성 팁 공유",
    content: "GPT-4o로 이미지 생성할 때 유용한 팁들을 정리했습니다. 특히 스타일 지정과 구도 설정에 대한 노하우를 공유합니다.",
    category: "prompt-share",
    author: "AI마스터",
    likes: 24,
    comments: 8,
    featured: true,
    tags: JSON.stringify(["GPT-4o", "이미지", "팁"]),
  },
  {
    title: "Claude로 코드 리뷰 자동화한 경험",
    content: "팀에서 Claude를 활용해 코드 리뷰를 자동화한 경험을 공유합니다. 설정 방법과 실제 효과에 대해 설명합니다.",
    category: "use-case",
    author: "개발자K",
    likes: 18,
    comments: 5,
    featured: false,
    tags: JSON.stringify(["Claude", "코드리뷰", "자동화"]),
  },
]

const announcements = [
  {
    title: "AI Guide 포털 오픈!",
    content: "AI Guide 포털이 정식 오픈했습니다. 다양한 AI 도구와 프롬프트를 탐색해보세요.",
    type: "notice",
    pinned: true,
  },
  {
    title: "메타 프롬프트 엔진 업데이트",
    content: "메타 프롬프트 엔진이 업데이트되었습니다. 더 정확한 프롬프트 생성이 가능합니다.",
    type: "update",
    pinned: false,
  },
]

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seedCollection(
  name: string,
  items: Record<string, any>[]
) {
  const col = firestore.collection(name)

  // Check if already seeded
  const existing = await col.limit(1).get()
  if (!existing.empty) {
    return { collection: name, status: "skipped (already has data)", count: 0 }
  }

  const batch = firestore.batch()
  const now = new Date()
  for (const item of items) {
    const ref = col.doc()
    batch.set(ref, { ...item, createdAt: now, updatedAt: now })
  }
  await batch.commit()
  return { collection: name, status: "seeded", count: items.length }
}

export async function POST() {
  try {
    const results = await Promise.all([
      seedCollection("aiTools", aiTools),
      seedCollection("prompts", prompts),
      seedCollection("metaPromptTemplates", metaPromptTemplates),
      seedCollection("miniTools", miniTools),
      seedCollection("vibeSolutions", vibeSolutions),
      seedCollection("communityPosts", communityPosts),
      seedCollection("announcements", announcements),
    ])

    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    console.error("[seed] error:", e)
    return NextResponse.json(
      { error: "시드 데이터 생성 실패", detail: e?.message },
      { status: 500 }
    )
  }
}
