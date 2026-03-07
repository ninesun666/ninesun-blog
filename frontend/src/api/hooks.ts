import { useQuery } from '@tanstack/react-query'
import { articleApi, categoryApi, tagApi } from '../api'

export function useArticles(page = 0, size = 10) {
  return useQuery({
    queryKey: ['articles', page, size],
    queryFn: () => articleApi.getArticles(page, size),
  })
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => articleApi.getArticleBySlug(slug),
    enabled: !!slug,
  })
}

export function useArticlesByCategory(slug: string, page = 0, size = 10) {
  // "all" 表示查询所有文章
  const isAll = slug === 'all'
  
  return useQuery({
    queryKey: ['articles', 'category', slug, page, size],
    queryFn: () => isAll 
      ? articleApi.getArticles(page, size) 
      : articleApi.getArticlesByCategory(slug, page, size),
    enabled: !!slug,
  })
}

export function useArticlesByTag(slug: string, page = 0, size = 10) {
  // "all" 表示查询所有文章
  const isAll = slug === 'all'
  
  return useQuery({
    queryKey: ['articles', 'tag', slug, page, size],
    queryFn: () => isAll 
      ? articleApi.getArticles(page, size) 
      : articleApi.getArticlesByTag(slug, page, size),
    enabled: !!slug,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagApi.getAll,
  })
}
