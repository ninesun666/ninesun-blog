import { useState, useEffect } from 'react'
import { Box, VStack, Text, HStack, Icon, Spinner } from '@chakra-ui/react'
import { FiChevronRight, FiChevronDown, FiFileText, FiFolder } from 'react-icons/fi'
import { Link, useParams } from 'react-router-dom'
import { articleApi } from '../api'
import type { ArticleListItem } from '../types'
import { useColorModeValue } from './ui/color-mode'

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

  // 颜色适配（亮色 / 暗色）
  const sidebarBg = useColorModeValue('#f8fafc', '#0f0f1a')
  const headerBg = useColorModeValue('#ffffff', '#13131f')
  const headerBorderColor = useColorModeValue('#e5e7eb', '#2d2d44')
  const categoryTextColor = useColorModeValue('#374151', '#e5e7eb')
  const categoryIconColor = useColorModeValue('#7c3aed', '#a78bfa')
  const categoryHoverBg = useColorModeValue('rgba(124,58,237,0.06)', 'rgba(167,139,250,0.08)')
  const articleTextColor = useColorModeValue('#6b7280', '#9ca3af')
  const articleHoverBg = useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.05)')
  const dateColor = useColorModeValue('#9ca3af', '#6b7280')
  const scrollThumb = useColorModeValue('#e2e8f0', '#2d2d44')
  const activeBg = useColorModeValue('rgba(124,58,237,0.08)', 'rgba(167,139,250,0.12)')
  const activeTextColor = useColorModeValue('#7c3aed', '#a78bfa')
  const badgeBg = useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.08)')
  const badgeTextColor = useColorModeValue('#6b7280', '#9ca3af')
  const logoGradient = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'

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
      const grouped = groupArticlesByCategory(data)
      setGroupedArticles(grouped)
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
      <Box p={4} bg={sidebarBg} h="full" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="sm" color="brand.500" />
      </Box>
    )
  }

  return (
    <Box
      h="full"
      bg={sidebarBg}
      display="flex"
      flexDirection="column"
    >
      {/* 侧边栏顶部 Logo 区域 */}
      <Box
        px={4}
        py={3}
        bg={headerBg}
        borderBottom="1px solid"
        borderColor={headerBorderColor}
        display="flex"
        alignItems="center"
        gap={3}
        flexShrink={0}
      >
        <Box
          w={8}
          h={8}
          borderRadius="lg"
          bg={logoGradient}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontWeight="800"
          fontSize="sm"
          flexShrink={0}
          boxShadow="0 2px 8px rgba(124, 58, 237, 0.3)"
        >
          N
        </Box>
        <Text fontWeight="700" fontSize="sm" color={categoryTextColor}>
          文章目录
        </Text>
      </Box>

      {/* 文章导航列表 */}
      <Box
        flex={1}
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': { width: '3px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: scrollThumb, borderRadius: '2px' },
        }}
      >
        <VStack align="stretch" gap={0} py={2}>
          {groupedArticles.map(group => {
            const isExpanded = expandedCategories.has(group.categoryId)
            const articleCount = group.articles.length

            return (
              <Box key={group.categoryId ?? 'uncategorized'}>
                {/* 分类标题 */}
                <HStack
                  px={3}
                  py="9px"
                  cursor="pointer"
                  onClick={() => toggleCategory(group.categoryId)}
                  transition="all 0.15s"
                  mx={1}
                  borderRadius="8px"
                  _hover={{ bg: categoryHoverBg }}
                >
                  <Icon
                    as={isExpanded ? FiChevronDown : FiChevronRight}
                    boxSize={3.5}
                    color={categoryIconColor}
                    flexShrink={0}
                  />
                  <Icon as={FiFolder} boxSize={3.5} color={categoryIconColor} flexShrink={0} />
                  <Text
                    fontWeight="600"
                    fontSize="13px"
                    flex="1"
                    color={categoryTextColor}
                    lineClamp={1}
                  >
                    {group.categoryName}
                  </Text>
                  <Box
                    px="6px"
                    py="1px"
                    borderRadius="full"
                    bg={badgeBg}
                    flexShrink={0}
                  >
                    <Text fontSize="11px" color={badgeTextColor} fontWeight="500">
                      {articleCount}
                    </Text>
                  </Box>
                </HStack>

                {/* 文章列表 */}
                {isExpanded && (
                  <VStack align="stretch" gap={0} mt={0.5}>
                    {group.articles.map(article => {
                      const isActive = article.slug === slug

                      return (
                        <Link
                          key={article.id}
                          to={`/article/${article.slug}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            pl="28px"
                            pr={3}
                            py="7px"
                            position="relative"
                            bg={isActive ? activeBg : 'transparent'}
                            transition="all 0.15s"
                            mx={1}
                            borderRadius="8px"
                            _hover={{ bg: isActive ? activeBg : articleHoverBg }}
                          >
                            {/* 活跃状态左侧竖条 */}
                            {isActive && (
                              <Box
                                position="absolute"
                                left="4px"
                                top="50%"
                                transform="translateY(-50%)"
                                w="2px"
                                h="60%"
                                bg={activeTextColor}
                                borderRadius="1px"
                              />
                            )}
                            <HStack gap={2} align="flex-start">
                              <Icon
                                as={FiFileText}
                                boxSize={3}
                                color={isActive ? activeTextColor : dateColor}
                                mt="3px"
                                flexShrink={0}
                              />
                              <Box flex={1} minW={0}>
                                <Text
                                  fontSize="13px"
                                  fontWeight={isActive ? '600' : '400'}
                                  color={isActive ? activeTextColor : articleTextColor}
                                  lineClamp={2}
                                  lineHeight="1.5"
                                >
                                  {article.title}
                                </Text>
                                <Text fontSize="11px" color={dateColor} mt="1px">
                                  {formatDate(article.createdAt)}
                                </Text>
                              </Box>
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
    </Box>
  )
}

export default ArticleSidebar
