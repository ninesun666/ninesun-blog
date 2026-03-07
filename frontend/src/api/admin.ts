import api from './client'
import type { Stats, SiteSettings, User, Comment, Article, PageResponse } from '../types'

// Admin Stats
export const getStats = async (): Promise<Stats> => {
  const response = await api.get<Stats>('/admin/stats')
  return response.data
}

export interface DetailedStats {
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
  popularArticles: PopularArticle[]
  recentArticles: RecentArticle[]
  categoryStats: CategoryStats[]
  tagStats: TagStats[]
}

export interface PopularArticle {
  id: number
  title: string
  slug: string
  viewCount: number
  likeCount: number
  commentCount: number
}

export interface RecentArticle {
  id: number
  title: string
  slug: string
  status: string
  createdAt: string
}

export interface CategoryStats {
  id: number
  name: string
  slug: string
  articleCount: number
}

export interface TagStats {
  id: number
  name: string
  slug: string
  articleCount: number
}

export const getDetailedStats = async (): Promise<DetailedStats> => {
  const response = await api.get<DetailedStats>('/admin/stats/detailed')
  return response.data
}

// Admin Articles
export const getAllArticles = async (page = 0, size = 10, status?: string): Promise<PageResponse<Article>> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) params.append('status', status)
  const response = await api.get<PageResponse<Article>>(`/admin/articles?${params}`)
  return response.data
}

// Admin Comments
export const getAllComments = async (): Promise<Comment[]> => {
  const response = await api.get<Comment[]>('/admin/comments')
  return response.data
}

export const getPendingComments = async (): Promise<Comment[]> => {
  const response = await api.get<Comment[]>('/admin/comments/pending')
  return response.data
}

export const getCommentsByStatus = async (status: string): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(`/admin/comments/status/${status}`)
  return response.data
}

export const approveComment = async (id: number): Promise<Comment> => {
  const response = await api.post<Comment>(`/admin/comments/${id}/approve`)
  return response.data
}

export const rejectComment = async (id: number): Promise<Comment> => {
  const response = await api.post<Comment>(`/admin/comments/${id}/reject`)
  return response.data
}

export const deleteComment = async (id: number): Promise<void> => {
  await api.delete(`/admin/comments/${id}`)
}

export const batchApproveComments = async (ids: number[]): Promise<Comment[]> => {
  const response = await api.post<Comment[]>('/admin/comments/batch-approve', ids)
  return response.data
}

export const batchRejectComments = async (ids: number[]): Promise<Comment[]> => {
  const response = await api.post<Comment[]>('/admin/comments/batch-reject', ids)
  return response.data
}

// Admin Users
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/users')
  return response.data
}

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/admin/users/${id}`)
  return response.data
}

export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/admin/users/${id}`, data)
  return response.data
}

export const updateUserRole = async (id: number, role: 'USER' | 'ADMIN'): Promise<User> => {
  const response = await api.put<User>(`/admin/users/${id}/role`, { role })
  return response.data
}

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`)
}

// Site Settings
export const getSiteSettings = async (): Promise<SiteSettings> => {
  const response = await api.get<SiteSettings>('/admin/settings')
  return response.data
}

export const updateSiteSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  const response = await api.put<SiteSettings>('/admin/settings', settings)
  return response.data
}

// Change Password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<User> => {
  const response = await api.put<User>('/auth/password', { currentPassword, newPassword })
  return response.data
}
