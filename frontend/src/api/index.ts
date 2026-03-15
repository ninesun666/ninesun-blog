import api from './client'
import type { Article, ArticleListItem, Category, Tag, PageResponse, User, Comment, Attachment } from '../types'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  id: number
  username: string
  email: string
  nickname: string
  avatar?: string
  role: string
}

export interface LikeDTO {
  articleId: number
  count: number
  liked: boolean
}

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', request)
    return data
  },

  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', request)
    return data
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me')
    return data
  },
}

export const commentApi = {
  getByArticle: async (articleId: number): Promise<Comment[]> => {
    const { data } = await api.get(`/comments/article/${articleId}`)
    return data
  },

  create: async (request: {
    articleId: number
    content: string
    parentId?: number
    nickname?: string
    email?: string
  }): Promise<Comment> => {
    const { data } = await api.post('/comments', request)
    return data
  },

  getPending: async (): Promise<Comment[]> => {
    const { data } = await api.get('/comments/pending')
    return data
  },

  approve: async (id: number): Promise<Comment> => {
    const { data } = await api.post(`/comments/${id}/approve`)
    return data
  },

  reject: async (id: number): Promise<Comment> => {
    const { data } = await api.post(`/comments/${id}/reject`)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`)
  },
}

export const likeApi = {
  getInfo: async (articleId: number): Promise<LikeDTO> => {
    const { data } = await api.get(`/likes/article/${articleId}/count`)
    return data
  },

  toggle: async (articleId: number): Promise<LikeDTO> => {
    const { data } = await api.post(`/likes/article/${articleId}/toggle`)
    return data
  },
}

export const articleApi = {
  getArticles: async (page = 0, size = 10): Promise<PageResponse<Article>> => {
    const { data } = await api.get(`/articles?page=${page}&size=${size}`)
    return data
  },

  getAllArticles: async (): Promise<ArticleListItem[]> => {
    const { data } = await api.get('/articles/all')
    return data
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    const { data } = await api.get(`/articles/${slug}`)
    return data
  },

  getArticleById: async (id: number): Promise<Article> => {
    const { data } = await api.get(`/articles/id/${id}`)
    return data
  },

  getArticlesByCategory: async (slug: string, page = 0, size = 10): Promise<PageResponse<Article>> => {
    const { data } = await api.get(`/articles/category/${slug}?page=${page}&size=${size}`)
    return data
  },

  getArticlesByTag: async (slug: string, page = 0, size = 10): Promise<PageResponse<Article>> => {
    const { data } = await api.get(`/articles/tag/${slug}?page=${page}&size=${size}`)
    return data
  },

  create: async (article: Partial<Article>): Promise<Article> => {
    const { data } = await api.post('/articles', article)
    return data
  },

  update: async (id: number, article: Partial<Article>): Promise<Article> => {
    const { data } = await api.put(`/articles/${id}`, article)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/articles/${id}`)
  },

  incrementViewCount: async (id: number): Promise<void> => {
    await api.post(`/articles/${id}/view`)
  },
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories')
    return data
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const { data } = await api.get(`/categories/${slug}`)
    return data
  },
}

export const tagApi = {
  getAll: async (): Promise<Tag[]> => {
    const { data } = await api.get('/tags')
    return data
  },

  getBySlug: async (slug: string): Promise<Tag> => {
    const { data } = await api.get(`/tags/${slug}`)
    return data
  },
}

export const attachmentApi = {
  getByArticle: async (articleId: number): Promise<Attachment[]> => {
    const { data } = await api.get(`/articles/${articleId}/attachments`)
    return data
  },

  upload: async (articleId: number, file: File): Promise<Attachment> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post(`/articles/${articleId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/attachments/${id}`)
  },

  getDownloadUrl: (id: number): string => {
    return `${api.defaults.baseURL}/attachments/${id}/download`
  }
}
