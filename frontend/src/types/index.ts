export interface Article {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  coverImage?: string
  category?: Category
  tags?: Tag[]
  viewCount: number
  likeCount: number
  commentCount: number
  status: 'DRAFT' | 'PUBLISHED'
  allowComment?: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  articleCount: number
}

export interface Tag {
  id: number
  name: string
  slug: string
  articleCount: number
}

export interface Comment {
  id: number
  content: string
  articleId: number
  articleTitle?: string
  parentId?: number
  userId?: number
  user?: User
  nickname?: string
  email?: string
  ip: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export interface User {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  enabled?: boolean
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface Stats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalCategories: number
  totalTags: number
  totalComments: number
  pendingComments: number
  approvedComments: number
  totalUsers: number
  adminCount: number
  totalViews: number
  totalLikes: number
  lastUpdated: string
}

export interface SiteSettings {
  siteName: string
  siteDescription: string
  siteKeywords: string
  footerText: string
  socialGithub: string
  socialTwitter: string
  socialEmail: string
  allowGuestComment: boolean
  requireCommentApproval: boolean
}

export interface Todo {
  id: number
  title: string
  description?: string
  todoDate: string
  timeSlot?: number  // 时间阶段（小时）
  completed: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TodoStats {
  total: number
  completed: number
}