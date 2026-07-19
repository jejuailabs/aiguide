// 메타 프롬프트 엔진 — 산출물별 필수 질문 은행
// 각 산출물마다 프롬프트에 반드시 포함되어야 할 항목을 7~9개 질문으로 설계.
// 모든 질문은 객관식 버튼 + "AI에게 맡기기" + "기타 직접 입력"(UI에서 자동 추가)으로 답한다.

export interface BankQuestion {
  field: string
  prompt: string
  options: string[]
}

export const QUESTION_BANKS: Record<string, BankQuestion[]> = {
  image: [
    { field: "purpose", prompt: "이 이미지는 어디에 사용하나요?", options: ["유튜브 썸네일", "SNS 게시물", "블로그 대표 이미지", "광고 배너", "제품 소개"] },
    { field: "style", prompt: "어떤 스타일로 만들까요?", options: ["실사 사진", "일러스트", "3D 렌더링", "수채화 감성", "미니멀 그래픽"] },
    { field: "mood", prompt: "전체적인 분위기는 어떤 느낌이면 좋을까요?", options: ["따뜻한", "차분한", "활기찬", "고급스러운", "몽환적인"] },
    { field: "color", prompt: "색감은 어떤 톤이 좋을까요?", options: ["따뜻한 톤", "차가운 톤", "파스텔", "모노톤", "비비드"] },
    { field: "aspectRatio", prompt: "화면 비율을 선택하세요.", options: ["16:9 (가로)", "1:1 (정방형)", "9:16 (세로)", "4:3"] },
    { field: "textIncluded", prompt: "이미지 안에 텍스트가 필요한가요?", options: ["텍스트 없음", "제목 텍스트 포함", "텍스트 넣을 공간만 확보"] },
    { field: "composition", prompt: "구도는 어떻게 잡을까요?", options: ["중앙 집중", "여백 넓게", "클로즈업", "와이드샷"] },
    { field: "lighting", prompt: "조명/빛 느낌을 선택하세요.", options: ["자연광", "스튜디오 조명", "황금시간대(노을)", "네온/시티라이트"] },
    { field: "negativePrompt", prompt: "피하고 싶은 요소가 있나요?", options: ["왜곡된 손/얼굴 방지", "텍스트 깨짐 방지", "과도한 노이즈 방지", "특별히 없음"] },
  ],
  video: [
    { field: "purpose", prompt: "이 영상은 어디에 사용하나요?", options: ["SNS 릴스/쇼츠", "유튜브 인트로", "제품 홍보", "브랜드 필름", "배경 영상"] },
    { field: "duration", prompt: "영상 길이는 어느 정도로?", options: ["5초 내외", "10~15초", "30초 내외", "1분 이상"] },
    { field: "sceneCount", prompt: "장면(씬)은 몇 개로 구성할까요?", options: ["단일 장면", "2~3개 장면", "4~6개 장면"] },
    { field: "cameraMovement", prompt: "카메라 무빙은 어떻게 할까요?", options: ["고정(픽스)", "슬로우 줌인", "팬(좌우 이동)", "드론뷰", "트래킹(따라가기)"] },
    { field: "subjectMotion", prompt: "피사체의 움직임은 어떤 느낌인가요?", options: ["정적인/잔잔한", "자연스러운 일상 동작", "역동적인/빠른", "슬로우모션"] },
    { field: "mood", prompt: "영상의 분위기를 선택하세요.", options: ["감성적인", "세련된/시크한", "밝고 경쾌한", "웅장한"] },
    { field: "aspectRatio", prompt: "화면 비율을 선택하세요.", options: ["16:9 (가로)", "9:16 (세로)", "1:1 (정방형)"] },
    { field: "bgm", prompt: "배경음악(BGM) 느낌은?", options: ["잔잔한 어쿠스틱", "신나는 팝", "웅장한 오케스트라", "BGM 없음"] },
  ],
  report: [
    { field: "purpose", prompt: "어떤 보고서인가요?", options: ["업무 성과 보고", "시장/경쟁사 분석", "연구/조사 요약", "기획 제안서", "회의록 정리"] },
    { field: "audience", prompt: "누가 읽는 보고서인가요?", options: ["상사/경영진", "팀 동료", "고객사/외부 파트너", "일반 대중"] },
    { field: "tone", prompt: "문체는 어떤 톤으로 쓸까요?", options: ["격식 있는 공식체", "간결한 실무체", "친근한 설명체"] },
    { field: "length", prompt: "분량은 어느 정도로?", options: ["1페이지 요약", "3~5페이지", "10페이지 이상 상세"] },
    { field: "structure", prompt: "글의 구조는 어떻게 잡을까요?", options: ["서론-본론-결론", "결론 먼저(두괄식)", "문제-원인-해결책", "타임라인 순"] },
    { field: "dataIncluded", prompt: "데이터/수치는 어떻게 다룰까요?", options: ["표와 차트 포함", "핵심 수치만 인용", "텍스트 위주"] },
    { field: "keyPoints", prompt: "가장 강조하고 싶은 것은?", options: ["성과와 결과", "문제점과 개선안", "비교 분석", "향후 계획"] },
  ],
  ppt: [
    { field: "purpose", prompt: "어떤 발표인가요?", options: ["사업 제안/투자 유치", "사내 업무 보고", "강의/교육 자료", "제품 소개", "행사 발표"] },
    { field: "audience", prompt: "청중은 누구인가요?", options: ["경영진/투자자", "팀 동료/사내", "고객/외부인", "학생/수강생"] },
    { field: "slideCount", prompt: "슬라이드는 몇 장 정도?", options: ["5장 이내", "10장 내외", "20장 이상"] },
    { field: "designStyle", prompt: "디자인 스타일을 선택하세요.", options: ["미니멀/화이트", "기업형/포멀", "비비드/임팩트", "다크 테마"] },
    { field: "storyStructure", prompt: "발표 스토리 구조는?", options: ["문제 제기 → 해결책", "스토리텔링형", "데이터 중심 논증", "비전 제시형"] },
    { field: "dataIncluded", prompt: "차트/데이터 비중은?", options: ["차트 중심", "이미지 중심", "텍스트 중심", "균형 있게"] },
    { field: "tone", prompt: "발표 톤은 어떤 느낌인가요?", options: ["신뢰감 있는 프로페셔널", "열정적인 설득형", "편안한 대화형"] },
  ],
  website: [
    { field: "purpose", prompt: "어떤 웹사이트를 만드나요?", options: ["회사/브랜드 소개", "포트폴리오", "쇼핑몰", "랜딩페이지", "블로그/매거진", "예약 서비스"] },
    { field: "targetUser", prompt: "주요 방문자는 누구인가요?", options: ["일반 소비자", "기업 고객(B2B)", "20~30대 젊은층", "지역 주민"] },
    { field: "style", prompt: "디자인 스타일을 선택하세요.", options: ["미니멀/깔끔", "모던/세련", "따뜻한 감성", "화려한/임팩트", "다크 테마"] },
    { field: "pages", prompt: "페이지 구성은 어떻게 할까요?", options: ["원페이지(스크롤형)", "3~5개 페이지", "5개 이상 다중 페이지"] },
    { field: "features", prompt: "꼭 필요한 기능이 있나요?", options: ["문의 폼", "예약/신청", "결제", "회원가입/로그인", "갤러리"] },
    { field: "contentTone", prompt: "웹사이트 문구의 톤은?", options: ["신뢰감 있는 전문적", "친근하고 캐주얼", "감성적인 스토리텔링"] },
    { field: "techStack", prompt: "제작 방식을 선택하세요.", options: ["Next.js/React 코딩", "워드프레스", "노코드 툴(Framer 등)"] },
  ],
  vibe: [
    { field: "projectType", prompt: "어떤 프로젝트를 만드나요?", options: ["웹 서비스", "모바일 앱", "업무 자동화 도구", "대시보드/관리자", "간단한 게임"] },
    { field: "targetUser", prompt: "누가 사용하는 서비스인가요?", options: ["나 혼자/개인용", "우리 팀/사내용", "일반 사용자 공개", "특정 고객층"] },
    { field: "features", prompt: "핵심 기능 1순위는 무엇인가요?", options: ["데이터 입력/관리(CRUD)", "AI 기능 연동", "예약/신청 처리", "통계/시각화", "채팅/커뮤니티"] },
    { field: "designStyle", prompt: "디자인 스타일을 선택하세요.", options: ["미니멀/깔끔", "모던 다크", "밝고 친근한", "기업형 대시보드"] },
    { field: "techStack", prompt: "기술 스택 선호가 있나요?", options: ["Next.js + Vercel", "React + Firebase", "가볍게 HTML/JS만"] },
    { field: "deployment", prompt: "어디에 배포할 예정인가요?", options: ["Vercel", "Firebase Hosting", "일단 로컬에서만"] },
    { field: "dataStorage", prompt: "데이터 저장은 어떻게 할까요?", options: ["Firebase/Firestore", "Supabase", "로컬 저장(브라우저)", "저장 필요 없음"] },
  ],
  document: [
    { field: "type", prompt: "어떤 문서를 작성하나요?", options: ["비즈니스 이메일", "공문/안내문", "자기소개서", "보도자료", "사용 설명서", "계약서 초안"] },
    { field: "purpose", prompt: "이 문서의 목적은 무엇인가요?", options: ["요청/부탁", "안내/공지", "설득/제안", "감사/사과", "기록/정리"] },
    { field: "audience", prompt: "받는 사람은 누구인가요?", options: ["상사/윗사람", "동료/실무자", "고객/외부인", "불특정 다수"] },
    { field: "tone", prompt: "문체 톤을 선택하세요.", options: ["격식 있는 존칭체", "정중하지만 간결한", "친근한 캐주얼"] },
    { field: "length", prompt: "분량은 어느 정도로?", options: ["짧게 핵심만(3~5문장)", "보통(2~3문단)", "상세하게(1페이지 이상)"] },
    { field: "structure", prompt: "구성 방식을 선택하세요.", options: ["용건 먼저(두괄식)", "배경 설명 후 용건", "항목별 리스트"] },
  ],
  code: [
    { field: "language", prompt: "어떤 언어로 작성하나요?", options: ["Python", "JavaScript/TypeScript", "Java", "C#", "SQL"] },
    { field: "purpose", prompt: "코드의 목적은 무엇인가요?", options: ["데이터 처리/자동화", "웹 기능 구현", "API 연동", "알고리즘/로직", "버그 수정"] },
    { field: "framework", prompt: "사용 중인 프레임워크가 있나요?", options: ["없음(순수 언어)", "React/Next.js", "Django/FastAPI", "Spring", "Node.js/Express"] },
    { field: "features", prompt: "코드에 꼭 포함할 요소는?", options: ["주석 상세히", "테스트 코드 포함", "타입 안전성", "실행 예시 포함"] },
    { field: "performance", prompt: "무엇을 우선할까요?", options: ["가독성 우선", "실행 속도 우선", "메모리 효율 우선"] },
    { field: "errorHandling", prompt: "예외 처리 수준은?", options: ["꼼꼼한 예외처리 + 로깅", "기본 수준", "핵심 로직만(예외처리 생략)"] },
  ],
}

/** 질문 은행에 없는 resultType이면 schemaJson의 fields로 일반 질문 생성 */
export function getQuestions(resultType: string, schemaFields: string[]): BankQuestion[] {
  const bank = QUESTION_BANKS[resultType]
  if (bank && bank.length > 0) return bank
  return schemaFields.map((f) => ({
    field: f,
    prompt: `${f} 항목을 어떻게 할까요?`,
    options: [],
  }))
}
