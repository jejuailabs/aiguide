// Shared domain types for AI Guide Portal

export interface AIToolDTO {
  id: string
  name: string
  tagline: string
  description: string
  category: string
  icon: string
  price: string
  platforms: string[]
  useCases: string[]
  websiteUrl: string
  featured: boolean
  createdAt: string
}

export interface PromptDTO {
  id: string
  title: string
  description: string
  body: string
  category: string
  bestModel: string
  runUrl: string | null
  tags: string[]
  version: string
  favorites: number
  createdAt: string
}

export interface MiniToolDTO {
  id: string
  name: string
  description: string
  icon: string
  category: string
  actionType: string
  isInteractive: boolean
  order: number
}

export interface VibeSolutionDTO {
  id: string
  title: string
  tagline: string
  description: string
  url: string
  thumbnail: string
  features: string[]
  purpose: string
  category: string
  aiUsed: string[]
  techStack: string[]
  featured: boolean
  createdAt: string
}

export interface CommunityPostDTO {
  id: string
  title: string
  content: string
  category: string
  author: string
  authorAvatar: string | null
  /** 강의·모임 안내 글의 세로형 포스터 이미지 URL */
  poster: string | null
  likes: number
  comments: number
  featured: boolean
  tags: string[]
  createdAt: string
}

export interface AnnouncementDTO {
  id: string
  title: string
  content: string
  type: string
  pinned: boolean
  createdAt: string
}

export interface MetaTemplateDTO {
  id: string
  resultType: string
  label: string
  icon: string
  schemaJson: string
}

export const COMMUNITY_CATEGORY_LABELS: Record<string, string> = {
  question: "질문·답변",
  "prompt-share": "프롬프트 공유",
  "use-case": "활용 사례",
  news: "AI 뉴스",
  event: "강의·모임",
}

/** 포스터 이미지가 필수인 카테고리 */
export const POSTER_REQUIRED_CATEGORY = "event"
