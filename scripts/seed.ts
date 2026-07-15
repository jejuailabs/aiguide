/**
 * AI Guide Portal — Seed Script
 * Run with: bun run scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const J = (v: unknown) => JSON.stringify(v);

async function main() {
  console.log("🌱 Seeding AI Guide Portal...");

  // ---------- AITool ----------
  await db.aITool.deleteMany();
  const tools = [
    { name: "ChatGPT", tagline: "가장 널리 쓰이는 범용 대화형 AI", description: "OpenAI의 GPT 모델 기반 챗봇으로 문서 작성, 코드 생성, 요약, 번역 등 다양한 작업을 지원합니다. GPT-4o 멀티모달을 통해 이미지와 음성까지 처리할 수 있습니다.", category: "문서 작성", icon: "MessageSquare", price: "부분 무료", platforms: ["web","ios","android"], useCases: ["문서 작성","코드 생성","아이디어 브레인스토밍","번역"], websiteUrl: "https://chat.openai.com", featured: true, order: 1 },
    { name: "Claude", tagline: "긴 문맥과 정밀한 추론에 강한 AI", description: "Anthropic의 Claude는 200K 토큰 컨텍스트를 지원하며 긴 문서 분석, 코딩, 복잡한 추론에 탁월합니다. 안전성과 정확성에 중점을 둔 모델입니다.", category: "문서 작성", icon: "Sparkles", price: "부분 무료", platforms: ["web","ios","android"], useCases: ["긴 문서 분석","코드 리뷰","논리적 추론","학술 연구"], websiteUrl: "https://claude.ai", featured: true, order: 2 },
    { name: "Midjourney", tagline: "감각적이고 예술적인 이미지 생성의 정수", description: "프롬프트만으로 고품질 예술 이미지를 생성하는 대표적인 텍스트-투-이미지 AI입니다. 독보적인 미학적 완성도로 디자이너와 크리에이터에게 사랑받습니다.", category: "이미지 생성", icon: "Image", price: "유료", platforms: ["web"], useCases: ["컨셉 아트","마케팅 비주얼","캐릭터 디자인","인테리어 시안"], websiteUrl: "https://www.midjourney.com", featured: true, order: 3 },
    { name: "GPT-4o Image", tagline: "텍스트가 정확히 들어가는 이미지 생성", description: "OpenAI의 GPT-4o 기반 이미지 생성으로 이미지 내 텍스트 렌더링이 뛰어나 썸네일, 포스터, 카드뉴스 제작에 적합합니다.", category: "이미지 생성", icon: "ImagePlus", price: "부분 무료", platforms: ["web","ios","android"], useCases: ["유튜브 썸네일","카드뉴스","포스터","로고 시안"], websiteUrl: "https://chat.openai.com", featured: false, order: 4 },
    { name: "Runway", tagline: "프롬프트로 만드는 시네마틱 영상", description: "Gen-3 모델 기반으로 텍스트와 이미지에서 고품질 영상을 생성합니다. 카메라 무빙, 장면 전환 등 영화적 연출이 가능합니다.", category: "영상 생성", icon: "Clapperboard", price: "부분 무료", platforms: ["web"], useCases: ["숏폼 영상","광고 컨셉","뮤직비디오","콘셉트 필름"], websiteUrl: "https://runwayml.com", featured: true, order: 5 },
    { name: "Veo 3", tagline: "Google의 차세대 영상 생성 모델", description: "Google DeepMind의 Veo는 4K 해상도 영상과 동기화된 사운드를 생성합니다. 사실적인 물리 모델링과 자연스러운 모션이 특징입니다.", category: "영상 생성", icon: "Video", price: "부분 무료", platforms: ["web"], useCases: ["시네마틱 영상","제품 데모","스토리보드","콘텐츠 제작"], websiteUrl: "https://deepmind.google/technologies/veo/", featured: false, order: 6 },
    { name: "Suno", tagline: "텍스트 한 줄으로 완성하는 음악", description: "장르, 분위기, 가사를 입력하면 보컬 포함 완성된 곡을 생성합니다. 비트, 멜로디, 편곡까지 AI가 작곡합니다.", category: "음악", icon: "Music", price: "부분 무료", platforms: ["web","ios","android"], useCases: ["BGM 제작","광고 음악","개인 음악","콘텐츠 배경음"], websiteUrl: "https://suno.com", featured: false, order: 7 },
    { name: "ElevenLabs", tagline: "가장 자연스러운 AI 음성 합성", description: "감정이 담긴 고품질 TTS와 음성 클로닝을 제공합니다. 30개국 언어를 지원하며 오디오북, 더빙, 콘텐츠 나레이션에 활용됩니다.", category: "음성", icon: "Mic", price: "부분 무료", platforms: ["web"], useCases: ["오디오북","더빙","콘텐츠 나레이션","음성 봇"], websiteUrl: "https://elevenlabs.io", featured: false, order: 8 },
    { name: "Gamma", tagline: "AI로 1분 만에 완성하는 프레젠테이션", description: "주제만 입력하면 구조, 디자인, 이미지까지 자동 완성되는 프레젠테이션 도구입니다. 내보내기와 협업 기능을 지원합니다.", category: "PPT", icon: "Presentation", price: "부분 무료", platforms: ["web"], useCases: ["비즈니스 발표","교육 자료","제안서","포트폴리오"], websiteUrl: "https://gamma.app", featured: true, order: 9 },
    { name: "Cursor", tagline: "AI와 함께 작성하는 코드 에디터", description: "VS Code 기반의 AI 코드 에디터로 코드 생성, 리팩토링, 자연어 기반 코드베이스 탐색을 지원합니다. 바이브코딩의 대표 도구입니다.", category: "바이브코딩", icon: "Code2", price: "부분 무료", platforms: ["web"], useCases: ["웹 개발","앱 개발","프로토타이핑","코드 리뷰"], websiteUrl: "https://cursor.com", featured: true, order: 10 },
    { name: "v0", tagline: "프롬프트로 만드는 UI 컴포넌트", description: "Vercel의 v0는 텍스트 설명으로 React + Tailwind UI를 생성합니다. 디자인 시안을 코드로 바로 변환할 수 있습니다.", category: "바이브코딩", icon: "Blocks", price: "부분 무료", platforms: ["web"], useCases: ["UI 프로토타입","랜딩 페이지","대시보드","디자인 시스템"], websiteUrl: "https://v0.dev", featured: false, order: 11 },
    { name: "Perplexity", tagline: "실시간 웹 검색 기반 AI 답변", description: "검색과 AI를 결합해 출처가 명확한 답변을 제공합니다. 최신 정보가 필요한 리서치와 팩트체킹에 강력합니다.", category: "문서 작성", icon: "Search", price: "부분 무료", platforms: ["web","ios","android"], useCases: ["리서치","팩트체크","요약","학습"], websiteUrl: "https://perplexity.ai", featured: false, order: 12 },
  ];
  for (const t of tools) {
    await db.aITool.create({
      data: {
        name: t.name, tagline: t.tagline, description: t.description,
        category: t.category, icon: t.icon, price: t.price,
        platforms: J(t.platforms), useCases: J(t.useCases),
        websiteUrl: t.websiteUrl, featured: t.featured ?? false, order: t.order,
      },
    });
  }
  console.log(`  ✓ ${tools.length} AI Tools`);

  // ---------- Prompt ----------
  await db.prompt.deleteMany();
  const prompts = [
    { title: "제주 감성카페 유튜브 썸네일", description: "따뜻한 색감과 여백의 미가 돋보이는 제주 카페 썸네일을 생성하는 프롬프트입니다.", body: "A cozy Jeju Island aesthetic café, warm golden hour lighting streaming through large windows, minimalist wooden interior, soft film grain, muted warm color palette (cream, terracotta, sage), shallow depth of field, 16:9 aspect ratio, YouTube thumbnail style with negative space on the left for text overlay, photorealistic, cinematic composition, shot on 35mm lens", category: "이미지", bestModel: "Midjourney / GPT-4o Image", runUrl: "https://www.midjourney.com", tags: ["이미지","썸네일","제주","카페","마케팅"], favorites: 142, order: 1 },
    { title: "프리미엄 럭셔리 호텔 브로셔", description: "고급스러운 분위기의 호텔 홍보용 이미지를 만드는 프롬프트입니다.", body: "Ultra-luxury 5-star hotel lobby at dusk, marble floors with soft reflections, golden ambient lighting, floor-to-ceiling windows with city skyline, elegant minimalist furniture, champagne and gold color accents, professional architectural photography, wide-angle 24mm, hyperrealistic, editorial magazine quality, dramatic shadows", category: "이미지", bestModel: "Midjourney", runUrl: "https://www.midjourney.com", tags: ["이미지","럭셔리","호텔","브로셔","건축"], favorites: 98, order: 2 },
    { title: "제품 360도 회전 영상 프롬프트", description: "단일 제품을 360도로 회전하는 깔끔한 영상을 생성하는 프롬프트입니다.", body: "A [PRODUCT] placed on a seamless white pedestal, slow 360-degree rotation, studio softbox lighting from three angles, subtle reflection on glossy surface, neutral grey gradient background, cinematic 4K, 8 second loop, product photography style, ultra-sharp focus, no camera shake", category: "영상", bestModel: "Runway / Veo", runUrl: "https://runwayml.com", tags: ["영상","제품","360도","이커머스"], favorites: 76, order: 3 },
    { title: "1분 제품 소개 영상 스토리보드", description: "제품의 핵심 기능을 1분 안에 전달하는 영상 기획 프롬프트입니다.", body: "Create a 60-second product reveal video storyboard for [PRODUCT]. Structure: 0-5s hook (problem), 5-20s product intro with hero shot, 20-45s three key feature demos, 45-55s lifestyle in use, 55-60s CTA. Specify camera movement, lighting mood, text overlays, and BGM style for each segment. Tone: premium and trustworthy.", category: "영상", bestModel: "Claude / GPT-4o", runUrl: "https://claude.ai", tags: ["영상","스토리보드","마케팅","기획"], favorites: 64, order: 4 },
    { title: "전문적인 비즈니스 보고서 작성", description: "구조화되고 설득력 있는 비즈니스 보고서를 작성하는 프롬프트입니다.", body: "작성자 역할: 10년차 경영 컨설턴트\n작업: [주제]에 대한 비즈니스 보고서 작성\n구조:\n1. 요약 (Executive Summary, 3문장)\n2. 현황 분석 (데이터 기반)\n3. 핵심 이슈 3가지\n4. 해결 방안 (우선순위별)\n5. 예상 효과 및 리스크\n6. 실행 계획 (타임라인)\n조건: 객관적 어조, 숫자와 근거 포함, 한 장에 읽히는 분량, 전문 용어는 주석 처리", category: "문서", bestModel: "Claude / GPT-4o", runUrl: "https://claude.ai", tags: ["문서","보고서","비즈니스","컨설팅"], favorites: 187, order: 5 },
    { title: "10투 스토리텔링 발표 자료", description: "청중을 사로잡는 스토리 기반 프레젠테이션을 기획하는 프롬프트입니다.", body: "[주제]에 대한 10슬라이드 스토리텔링 발표 자료를 기획해줘.\n구조: 1)후크 2)문제 3)왜 지금인가 4)해결책 5)작동 원리 6)증거/사례 7)데모 8)비전 9)CTA 10)Q&A\n각 슬라이드별: 핵심 메시지 1문장, 시각 요소 설명, 발화 스크립트 2-3문장\n디자인 톤: 미니멀, 여백 강조, 키넘버는 대형 타이포\n발표 시간: 15분", category: "문서", bestModel: "GPT-4o / Claude", runUrl: "https://chat.openai.com", tags: ["문서","PPT","스토리텔링","발표"], favorites: 121, order: 6 },
    { title: "랜딩 페이지 카피라이팅", description: "전환율을 높이는 랜딩 페이지 카피를 작성하는 프롬프트입니다.", body: "제품: [제품명과 한 줄 설명]\n타겟: [타겟 고객]\n작업: 전환율 최적화 랜딩 페이지 카피 작성\n섹션: 히어로(헤드라인+서브+CTA), 소셜프루프, 문제-해결, 기능 3가지, 사용 후 변화, 가격, FAQ, 최종 CTA\n원칙: 혜택 중심, 구체적 숫자, 짧은 문장, 스캔 가능한 구조, 감정적 후킹\n톤: [브랜드 톤]", category: "카피", bestModel: "Claude / GPT-4o", runUrl: "https://claude.ai", tags: ["카피","랜딩페이지","마케팅","전환율"], favorites: 89, order: 7 },
    { title: "코드 리뷰 및 최적화", description: "코드를 분석하고 개선점을 제안하는 프롬프트입니다.", body: "역할: 시니어 소프트웨어 엔지니어\n작업: 아래 코드를 리뷰하고 최적화해줘\n분석 항목: 1)가독성 2)성능 3)보안 4)예외 처리 5)테스트 가능성\n출력 형식:\n- 전체 평가 (1-5점)\n- 발견된 이슈 (심각도별)\n- 개선된 코드 (전체)\n- 변경 사유 설명\n- 추가 제안\n\n코드:\n```\n[코드 입력]\n```", category: "코드", bestModel: "Claude / GPT-4o", runUrl: "https://claude.ai", tags: ["코드","리뷰","최적화","개발"], favorites: 156, order: 8 },
    { title: "캐릭터 컨셉 아트 생성", description: "게임/애니메이션용 캐릭터 컨셉 아트를 만드는 프롬프트입니다.", body: "Character concept art of [CHARACTER DESCRIPTION], full body, dynamic pose, detailed costume design, fantasy art style, dramatic rim lighting, dark atmospheric background, painterly texture, ArtStation trending, highly detailed, 8K, character sheet with front and 3/4 view", category: "이미지", bestModel: "Midjourney", runUrl: "https://www.midjourney.com", tags: ["이미지","캐릭터","컨셉아트","게임"], favorites: 73, order: 9 },
    { title: "뉴스레터 주간 요약", description: "한 주의 핵심 뉴스를 요약해 뉴스레터로 만드는 프롬프트입니다.", body: "역할: IT/비즈니스 뉴스레터 에디터\n작업: 이번 주 [분야] 핵심 뉴스 5개를 요약해 뉴스레터 작성\n형식:\n- 헤드라인 (흥미 유발)\n- 한 줄 요약\n- 왜 중요한지 (2-3문장)\n- 에디터 코멘트 (개인적 인사이트)\n톤: 친근하되 전문적, 독자는 업계 종사자\n분량: 전체 800자 이내", category: "문서", bestModel: "GPT-4o / Perplexity", runUrl: "https://perplexity.ai", tags: ["문서","뉴스레터","요약","콘텐츠"], favorites: 54, order: 10 },
    { title: "인테리어 시안 이미지 생성", description: "원하는 스타일의 인테리어 시안을 만드는 프롬프트입니다.", body: "Interior design visualization of a [ROOM TYPE], [STYLE] aesthetic, natural materials (oak wood, linen, stone), warm ambient lighting, large plants, minimalist furniture, soft natural light from window, architectural digest style, photorealistic, wide angle, 4K, mood: calm and inviting", category: "이미지", bestModel: "Midjourney / GPT-4o Image", runUrl: "https://www.midjourney.com", tags: ["이미지","인테리어","시안","디자인"], favorites: 67, order: 11 },
    { title: "SNS 캠페인 기획", description: "소셜미디어 마케팅 캠페인을 기획하는 프롬프트입니다.", body: "제품/서비스: [입력]\n목표: [인지도/전환/참여]\n작업: 2주 SNS 캠페인 기획\n출력:\n1. 캠페인 컨셉 및 메시지\n2. 타겟 페르소나\n3. 콘텐츠 캘린더 (일자별 플랫폼, 포맷, 주제)\n4. 핵미디어 아이디어 3개\n5. KPI 및 측정 방법\n6. 예산 배분 가이드\n톤: 트렌디하고 참여 유도형", category: "마케팅", bestModel: "GPT-4o / Claude", runUrl: "https://chat.openai.com", tags: ["마케팅","SNS","캠페인","기획"], favorites: 92, order: 12 },
  ];
  for (const p of prompts) {
    await db.prompt.create({
      data: {
        title: p.title, description: p.description, body: p.body,
        category: p.category, bestModel: p.bestModel, runUrl: p.runUrl,
        tags: J(p.tags), favorites: p.favorites, order: p.order,
      },
    });
  }
  console.log(`  ✓ ${prompts.length} Prompts`);

  // ---------- MetaPromptTemplate ----------
  await db.metaPromptTemplate.deleteMany();
  const metaTemplates = [
    { resultType: "image", label: "이미지", icon: "Image", schemaJson: J({ fields: ["purpose","style","color","mood","textIncluded","aspectRatio","composition","cameraAngle","lighting","negativePrompt"] }) },
    { resultType: "video", label: "동영상", icon: "Clapperboard", schemaJson: J({ fields: ["duration","sceneCount","cameraMovement","subjectMotion","transition","subtitle","soundEffect","bgm","aspectRatio"] }) },
    { resultType: "report", label: "보고서", icon: "FileText", schemaJson: J({ fields: ["purpose","audience","tone","length","dataIncluded","structure","keyPoints"] }) },
    { resultType: "ppt", label: "프레젠테이션", icon: "Presentation", schemaJson: J({ fields: ["purpose","audience","duration","slideCount","designStyle","dataIncluded","storyStructure"] }) },
    { resultType: "website", label: "웹사이트", icon: "Globe", schemaJson: J({ fields: ["purpose","targetUser","style","pages","features","contentTone","techStack"] }) },
    { resultType: "vibe", label: "바이브코딩 프로젝트", icon: "Code2", schemaJson: J({ fields: ["projectType","features","designStyle","techStack","targetUser","deployment"] }) },
    { resultType: "document", label: "문서", icon: "FileType", schemaJson: J({ fields: ["type","purpose","audience","tone","length","structure"] }) },
    { resultType: "code", label: "코드", icon: "Terminal", schemaJson: J({ fields: ["language","purpose","framework","features","performance","errorHandling"] }) },
    { resultType: "other", label: "기타", icon: "Wand2", schemaJson: J({ fields: ["description","purpose","format","constraints"] }) },
  ];
  for (const t of metaTemplates) {
    await db.metaPromptTemplate.create({
      data: { resultType: t.resultType, label: t.label, icon: t.icon, schemaJson: t.schemaJson },
    });
  }
  console.log(`  ✓ ${metaTemplates.length} Meta Prompt Templates`);

  // ---------- MiniTool ----------
  await db.miniTool.deleteMany();
  const miniTools = [
    { name: "QR 코드 생성", description: "URL이나 텍스트를 QR 코드로 변환합니다.", icon: "QrCode", category: "이미지", actionType: "qr", order: 1 },
    { name: "JSON 포매터", description: "JSON을 보기 좋게 정렬하고 검증합니다.", icon: "Braces", category: "개발", actionType: "json", order: 2 },
    { name: "Base64 변환", description: "텍스트를 Base64로 인코딩/디코딩합니다.", icon: "Binary", category: "개발", actionType: "base64", order: 3 },
    { name: "Markdown 미리보기", description: "Markdown을 실시간으로 렌더링합니다.", icon: "FileCode", category: "문서", actionType: "markdown", order: 4 },
    { name: "URL 인코더", description: "URL을 안전하게 인코딩/디코딩합니다.", icon: "Link", category: "개발", actionType: "url-encode", order: 5 },
    { name: "텍스트 케이스 변환", description: "대소문자, 스네이크, 케멀 케이스로 변환합니다.", icon: "Type", category: "텍스트", actionType: "text-case", order: 6 },
    { name: "색상 변환기", description: "HEX, RGB, HSL 색상 코드를 상호 변환합니다.", icon: "Palette", category: "디자인", actionType: "color", order: 7 },
    { name: "비밀번호 생성기", description: "안전한 랜덤 비밀번호를 생성합니다.", icon: "KeyRound", category: "보안", actionType: "password", order: 8 },
  ];
  for (const t of miniTools) {
    await db.miniTool.create({
      data: { name: t.name, description: t.description, icon: t.icon, category: t.category, actionType: t.actionType, order: t.order },
    });
  }
  console.log(`  ✓ ${miniTools.length} Mini Tools`);

  // ---------- VibeSolution ----------
  await db.vibeSolution.deleteMany();
  const solutions = [
    { title: "Aurora 마케팅 대시보드", tagline: "실시간 캠페인 성과를 한눈에", description: "광고 성과를 실시간으로 시각화하는 마케팅 분석 대시보드입니다. 다양한 플랫폼의 데이터를 통합해 직관적인 차트로 보여줍니다.", url: "#", thumbnail: "dashboard", features: ["실시간 데이터 동기화","멀티 플랫폼 통합","커스텀 리포트","팀 협업"], purpose: "마케팅팀의 데이터 기반 의사결정 지원", category: "대시보드", aiUsed: ["Cursor","Claude"], techStack: ["Next.js","Recharts","Prisma"], featured: true, order: 1 },
    { title: "Lumen 포트폴리오 빌더", tagline: "드래그 앤 드롭으로 만드는 포트폴리오", description: "디자이너와 크리에이터를 위한 노코드 포트폴리오 제작 도구입니다. 템플릿 기반으로 빠르게 개인 페이지를 구축할 수 있습니다.", url: "#", thumbnail: "portfolio", features: ["드래그 앤 드롭 에디터","반응형 템플릿","커스텀 도메인","통계 분석"], purpose: "크리에이터의 온라인 존재감 구축", category: "포트폴리오", aiUsed: ["v0","Cursor"], techStack: ["Next.js","DnD Kit","Tailwind"], featured: true, order: 2 },
    { title: "Verse 시집 출판 플랫폼", tagline: "AI와 함께 쓰는 시집", description: "사용자가 AI와 협업해 시를 쓰고 출판까지 진행할 수 있는 창작 플랫폼입니다. 감정 기반 시 생성과 북디자인을 지원합니다.", url: "#", thumbnail: "poetry", features: ["감정 기반 시 생성","북디자인 자동화","공동 창작","PDF 내보내기"], purpose: "창작의 진입장벽 낮추기", category: "콘텐츠", aiUsed: ["GPT-4o","Midjourney"], techStack: ["Next.js","Framer Motion"], featured: false, order: 3 },
    { title: "Pulse 피트니스 트래커", tagline: "개인맞춤 운동 플래너", description: "사용자의 체력과 목표에 맞춘 운동 루틴을 AI가 추천하고 추적하는 피트니스 웹앱입니다.", url: "#", thumbnail: "fitness", features: ["AI 루틴 추천","운동 기록 추적","진행 시각화","리마인더"], purpose: "개인화된 운동 습관 형성", category: "라이프스타일", aiUsed: ["Cursor","Claude"], techStack: ["Next.js","Recharts"], featured: false, order: 4 },
    { title: "Atlas 여행 기록 지도", tagline: "여행을 지도 위에 기록하는 공간", description: "방문한 장소를 지도에 기록하고 사진과 메모를 함께 저장하는 여행 아카이빙 웹서비스입니다.", url: "#", thumbnail: "travel", features: ["인터랙티브 지도","사진 갤러리","여행 통계","공유 기능"], purpose: "여행 추억의 디지털 아카이빙", category: "라이프스타일", aiUsed: ["Cursor","v0"], techStack: ["Next.js","Mapbox"], featured: false, order: 5 },
    { title: "Echo 음악 콜라보 플랫폼", tagline: "원격 음악 협업의 새로운 방식", description: "음악가들이 온라인에서 트랙을 주고받으며 협업할 수 있는 플랫폼입니다. 버전 관리와 코멘트 기능을 제공합니다.", url: "#", thumbnail: "music", features: ["트랙 버전 관리","타임라인 코멘트","믹싱 미리듣기","공개 공유"], purpose: "원격 음악 협업 활성화", category: "콘텐츠", aiUsed: ["Claude","Cursor"], techStack: ["Next.js","Web Audio API"], featured: false, order: 6 },
  ];
  for (const s of solutions) {
    await db.vibeSolution.create({
      data: {
        title: s.title, tagline: s.tagline, description: s.description, url: s.url,
        thumbnail: s.thumbnail, features: J(s.features), purpose: s.purpose,
        category: s.category, aiUsed: J(s.aiUsed), techStack: J(s.techStack),
        featured: s.featured ?? false, order: s.order,
      },
    });
  }
  console.log(`  ✓ ${solutions.length} Vibe Solutions`);

  // ---------- CommunityPost ----------
  await db.communityPost.deleteMany();
  const posts = [
    { title: "Midjourney v6로 사실적인 제품 사진 만드는 꿀팁", content: "최근 v6로 제품 사진을 찍듯 만드는 프롬프트를 정리해봤습니다. 핵심은 조명과 렌즈 스펙을 명시하는 거예요. 'studio softbox lighting, 85mm lens, f/2.8' 이런 식으로 넣으면 확 달라집니다.", category: "prompt-share", author: "비주얼메이커", likes: 87, comments: 12, featured: true, tags: ["Midjourney","제품사진","프롬프트"] },
    { title: "Cursor로 하루 만에 웹서비스 런칭한 후기", content: "바이브코딩으로 간단한 예산 관리 앱을 만들어봤습니다. Claude와 Cursor를 조합하니 정말 하루 만에 MVP가 나오더라고요. 핵심은 요구사항을 명확히 적는 것이었습니다.", category: "use-case", author: "인디해커", likes: 134, comments: 28, featured: true, tags: ["Cursor","바이브코딩","런칭"] },
    { title: "Claude vs GPT-4o, 코딩 작업에서 체감 차이", content: "두 모델로 같은 기능을 구현해봤습니다. Claude는 긴 컨텍스트 처리와 리팩토링이 압도적이고, GPT-4o는 빠른 응답과 다양한 기술 스택 지식이 강했어요. 용도별로 나눠 쓰는 게 정답인 것 같습니다.", category: "question", author: "코딩러버", likes: 92, comments: 31, featured: false, tags: ["Claude","GPT-4o","코딩"] },
    { title: "Suno로 만든 BGM을 유튜브에 쓸 수 있을까요?", content: "Suno 무료 플랜으로 만든 음악을 유튜브 영상에 배경음으로 쓰고 싶은데, 저작권 관련해서 경험 있으신 분 계신가요?", category: "question", author: "영상크리에이터", likes: 45, comments: 19, featured: false, tags: ["Suno","저작권","유튜브"] },
    { title: "이번 주 AI 업데이트 요약 (Veo 3, GPT-4o 업데이트)", content: "이번 주 가장 주목할 만한 AI 소식을 정리했습니다. Veo 3의 사운드 동기화 기능과 GPT-4o의 새로운 이미지 생성 품질 개선이 핵심입니다.", category: "news", author: "AI워치", likes: 76, comments: 8, featured: true, tags: ["AI뉴스","Veo","GPT-4o"] },
    { title: "프롬프트 공유: 감성 카페 인테리어 시안 일관성 유지하기", content: "같은 카페를 여러 각도에서 시안을 만들 때 스타일 일관성을 유지하는 프롬프트 패턴을 공유합니다. 시드값과 스타일 참조를 활용하는 게 핵심이에요.", category: "prompt-share", author: "공간디자이너", likes: 63, comments: 14, featured: false, tags: ["프롬프트","인테리어","일관성"] },
  ];
  for (const p of posts) {
    await db.communityPost.create({
      data: {
        title: p.title, content: p.content, category: p.category, author: p.author,
        likes: p.likes, comments: p.comments, featured: p.featured ?? false,
        tags: J(p.tags),
      },
    });
  }
  console.log(`  ✓ ${posts.length} Community Posts`);

  // ---------- Announcement ----------
  await db.announcement.deleteMany();
  const announcements = [
    { title: "메타 프롬프트 엔진이 베타로 공개되었습니다", content: "원하는 결과물만 선택하면 AI가 최소한의 질문으로 최고 품질의 프롬프트를 완성해줍니다. 지금 바로 체험해보세요.", type: "update", pinned: true },
    { title: "AI 미니툴 8종이 추가되었습니다", content: "QR 생성, JSON 포매터, Base64 변환 등 실무에 바로 쓰이는 미니툴을 추가했습니다. 더 많은 도구가 순차적으로 추가될 예정입니다.", type: "update", pinned: false },
    { title: "커뮤니티 가이드라인 안내", content: "AI 지식을 나누는 따뜻한 커뮤니티를 만들기 위해 가이드라인을 마련했습니다. 서로 존중하는 토론 문화를 함께 만들어가요.", type: "notice", pinned: false },
    { title: "바이브코딩 솔루션 쇼케이스 모집", content: "AI로 제작하신 웹서비스가 있으신가요? 쇼케이스에 등록하시면 포털에서 소개해드립니다. 등록 신청은 커뮤니티를 통해 가능합니다.", type: "event", pinned: false },
  ];
  for (const a of announcements) {
    await db.announcement.create({
      data: { title: a.title, content: a.content, type: a.type, pinned: a.pinned },
    });
  }
  console.log(`  ✓ ${announcements.length} Announcements`);

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
