import { useState, useEffect } from 'react'
import { Box, VStack, Text, HStack, Icon, Spinner, Badge } from '@chakra-ui/react'
import { FiChevronRight, FiChevronDown, FiFileText, FiFolder } from 'react-icons/fi'
import { Link, useParams } from 'react-router-dom'
import { articleApi } from '../api'
import type { ArticleListItem } from '../types'

interface GroupedArticles {
  categoryId: number | null
  categoryName: string
  categorySlug: string
  articles: ArticleListItem[]
}

const ArticleSidebar = () => {
  const { slug } = useParams()
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [groupedArticles, setGroupedArticles] = useState<GroupedArticles[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<number | null>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  useEffect(() => {
    // 自动展开当前文章所在的分类
    if (articles.length > 0 && slug) {
      const currentArticle = articles.find(a => a.slug === slug)
      const catId = currentArticle?.categoryId
      if (catId !== undefined && catId !== null) {
        setExpandedCategories(prev => {
          const next = new Set<number | null>(prev)
          next.add(catId)
          return next
        })
      }
    }
  }, [articles, slug])

  const loadArticles = async () => {
    try {
      const data = await articleApi.getAllArticles()
      setArticles(data)
      // 按分类分组
      const grouped = groupArticlesByCategory(data)
      setGroupedArticles(grouped)
      // 默认展开第一个分类
      if (grouped.length > 0) {
        setExpandedCategories(new Set([grouped[0].categoryId]))
      }
    } catch (error) {
      console.error('Failed to load articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupArticlesByCategory = (articles: ArticleListItem[]): GroupedArticles[] => {
    const groups: Map<number | null, GroupedArticles> = new Map()
    
    articles.forEach(article => {
      const key = article.categoryId || null
      if (!groups.has(key)) {
        groups.set(key, {
          categoryId: key,
          categoryName: article.categoryName || '未分类',
          categorySlug: article.categorySlug || 'uncategorized',
          articles: []
        })
      }
      groups.get(key)!.articles.push(article)
    })
    
    return Array.from(groups.values())
  }

  const toggleCategory = (categoryId: number | null) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <Box p={4}>
        <Spinner size="sm" color="brand.500" />
      </Box>
    )
  }

  return (
    <Box
      h="full"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: '#e2e8f0', borderRadius: '2px' },
      }}
    >
      <VStack align="stretch" gap={1} py={2}>
        {groupedArticles.map(group => {
          const isExpanded = expandedCategories.has(group.categoryId)
          const articleCount = group.articles.length
          
          return (
            <Box key={group.categoryId ?? 'uncategorized'}>
              {/* 分类标题 */}
              <HStack
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => toggleCategory(group.categoryId)}
                borderRadius="lg"
                transition="all 0.15s"
              >
                <Icon
                  as={isExpanded ? FiChevronDown : FiChevronRight}
                  boxSize={4}
                  color="gray.500"
                />
                <Icon as={FiFolder} boxSize={4} color="purple.500" />
                <Text fontWeight="600" fontSize="sm" flex="1" color="gray.700">
                  {group.categoryName}
                </Text>
                <Badge size="sm" colorPalette="gray" variant="subtle">
                  {articleCount}
                </Badge>
              </HStack>
              
              {/* 文章列表 */}
              {isExpanded && (
                <VStack align="stretch" gap={0.5} mt={1} ml={4}>
                  {group.articles.map(article => {
                    const isActive = article.slug === slug
                    
                    return (
                      <Link
                        key={article.id}
                        to={`/article/${article.slug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Box
                          px={3}
                          py={2}
                          borderRadius="lg"
                          bg={isActive ? 'purple.50' : 'transparent'}
                          borderLeft={isActive ? '3px solid' : '3px solid transparent'}
                          borderColor={isActive ? 'purple.500' : 'transparent'}
                          _hover={{ bg: isActive ? 'purple.50' : 'gray.50' }}
                          transition="all 0.15s"
                        >
                          <HStack gap={2}>
                            <Icon 
                              as={FiFileText} 
                              boxSize={3.5} 
                              color={isActive ? 'purple.500' : 'gray.400'} 
                            />
                            <Text
                              fontSize="sm"
                              fontWeight={isActive ? '600' : '500'}
                              color={isActive ? 'purple.700' : 'gray.600'}
                              lineClamp={1}
                              flex="1"
                            >
                              {article.title}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {formatDate(article.createdAt)}
                            </Text>
                          </HStack>
                        </Box>
                      </Link>
                    )
                  })}
                </VStack>
              )}
            </Box>
          )
        })}
      </VStack>
    </Box>
  )
}

export default ArticleSidebar
