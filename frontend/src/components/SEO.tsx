import { useEffect } from 'react'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  articlePublishedTime?: string
  articleModifiedTime?: string
  articleAuthor?: string
  articleSection?: string
  articleTags?: string[]
  jsonLd?: object
}

const SITE_NAME = 'Ninesun Blog'
const DEFAULT_DESCRIPTION = '分享技术，记录成长 - Ninesun Blog'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:8999'

/**
 * SEO 组件 - 管理 head 元素
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  articleSection,
  articleTags,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    // 更新 title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    document.title = fullTitle

    // 更新 meta 标签
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords.join(', '))

    // Open Graph
    updateMetaTag('og:title', ogTitle || title || SITE_NAME, 'property')
    updateMetaTag('og:description', ogDescription || description, 'property')
    updateMetaTag('og:site_name', SITE_NAME, 'property')
    updateMetaTag('og:type', ogType, 'property')
    
    if (canonicalUrl) {
      updateMetaTag('og:url', canonicalUrl, 'property')
    }
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`, 'property')
    }

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image', 'name')
    updateMetaTag('twitter:title', ogTitle || title || SITE_NAME, 'name')
    updateMetaTag('twitter:description', ogDescription || description, 'name')
    
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`, 'name')
    }

    // Article specific
    if (ogType === 'article') {
      if (articlePublishedTime) {
        updateMetaTag('article:published_time', articlePublishedTime, 'property')
      }
      if (articleModifiedTime) {
        updateMetaTag('article:modified_time', articleModifiedTime, 'property')
      }
      if (articleAuthor) {
        updateMetaTag('article:author', articleAuthor, 'property')
      }
      if (articleSection) {
        updateMetaTag('article:section', articleSection, 'property')
      }
      if (articleTags && articleTags.length > 0) {
        articleTags.forEach(tag => {
          addMetaTag('article:tag', tag, 'property')
        })
      }
    }

    // Canonical URL
    if (canonicalUrl) {
      updateLinkTag('canonical', canonicalUrl)
    }

    // JSON-LD
    if (jsonLd) {
      updateJsonLd(jsonLd)
    }

    // Cleanup
    return () => {
      // Remove article tags on unmount
      document.querySelectorAll('meta[property^="article:"]').forEach(el => el.remove())
    }
  }, [
    title, description, keywords, canonicalUrl,
    ogTitle, ogDescription, ogImage, ogType,
    articlePublishedTime, articleModifiedTime, articleAuthor, articleSection, articleTags,
    jsonLd
  ])

  return null
}

function updateMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, name)
    document.head.appendChild(meta)
  }
  meta.content = content
}

function addMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  const existing = document.querySelector(`meta[${attr}="${name}"][content="${content}"]`)
  if (existing) return
  
  const meta = document.createElement('meta')
  meta.setAttribute(attr, name)
  meta.content = content
  document.head.appendChild(meta)
}

function updateLinkTag(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    document.head.appendChild(link)
  }
  link.href = href
}

function updateJsonLd(data: object) {
  // Remove existing JSON-LD
  const existing = document.getElementById('json-ld')
  if (existing) {
    existing.remove()
  }

  const script = document.createElement('script')
  script.id = 'json-ld'
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

/**
 * 生成文章 JSON-LD 结构化数据
 */
export function generateArticleJsonLd(article: {
  title: string
  slug: string
  summary?: string
  content?: string
  coverImage?: string
  createdAt: string
  updatedAt?: string
  category?: { name: string }
  tags?: { name: string }[]
}) {
  const url = `${SITE_URL}/article/${article.slug}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary || '',
    image: article.coverImage ? (article.coverImage.startsWith('http') ? article.coverImage : `${SITE_URL}${article.coverImage}`) : undefined,
    url,
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      'name': 'Ninesun'
    },
    publisher: {
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': SITE_URL
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    articleSection: article.category?.name,
    keywords: article.tags?.map(t => t.name).join(', ')
  }
}

/**
 * 生成网站 JSON-LD 结构化数据
 */
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/articles?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

/**
 * 生成面包屑 JSON-LD
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

export default SEO
