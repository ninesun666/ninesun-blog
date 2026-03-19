import {
  Box,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Separator,
  Spinner,
  Center,
  Button,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { useParams, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { FiEdit2, FiMenu, FiX, FiPaperclip, FiDownload, FiLock, FiEye, FiCalendar, FiChevronRight } from 'react-icons/fi'
import { useArticle } from '../api/hooks'
import { articleApi, attachmentApi } from '../api'
import { useAuthStore } from '../stores'
import type { Attachment } from '../types'
import { toast } from '../utils/notify'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import hljs from 'highlight.js'
import { preprocessBilibiliEmbeds } from '../utils/bilibili'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'
import ArticleSidebar from '../components/ArticleSidebar'
import ArticleTOC from '../components/ArticleTOC'
import { SEO, generateArticleJsonLd } from '../components/SEO'
import { useColorModeValue } from '../components/ui/color-mode'
import { useBreakpointValue } from '@chakra-ui/react'

const ArticleDetail = () => {
  const { slug } = useParams()
  const { data: article, isLoading, error } = useArticle(slug || '')
  const codeRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated } = useAuthStore()
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const isMobile = useBreakpointValue({ base: true, lg: false })
  const isTablet = useBreakpointValue({ base: true, xl: false })

  // 颜色适配
  const sidebarBorderColor = useColorModeValue('#e5e7eb', '#2d2d44')
  const contentBg = useColorModeValue('#ffffff', '#0f0f1a')
  const metaColor = useColorModeValue('#6b7280', '#9ca3af')
  const separatorColor = useColorModeValue('#e5e7eb', '#2d2d44')
  const breadcrumbColor = useColorModeValue('#9ca3af', '#6b7280')
  const breadcrumbActiveColor = useColorModeValue('#374151', '#e5e7eb')
  const mobileSidebarBg = useColorModeValue('#ffffff', '#0f0f1a')
  const attachmentItemBg = useColorModeValue('#f8fafc', '#1a1a2e')
  const attachmentItemBg2 = useColorModeValue('#f1f5f9', '#2d2d44')
  const tocBorderColor = useColorModeValue('#e5e7eb', '#2d2d44')
  const overlayBg = useColorModeValue('rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)')
  const menuButtonBg = useColorModeValue('#ffffff', '#1a1a2e')
  const menuButtonBorderColor = useColorModeValue('#e5e7eb', '#2d2d44')
  const titleColor = useColorModeValue('#111827', '#f3f4f6')
  const summaryColor = useColorModeValue('#6b7280', '#9ca3af')

  // 文章加载完成后增加浏览次数
  useEffect(() => {
    if (article?.id) {
      articleApi.incrementViewCount(article.id).catch(() => {})
      loadAttachments(article.id)
    }
  }, [article?.id])

  const loadAttachments = async (articleId: number) => {
    try {
      const data = await attachmentApi.getByArticle(articleId)
      setAttachments(data)
    } catch (error) {
      console.error('Failed to load attachments:', error)
    }
  }

  const handleDownload = (attachment: Attachment) => {
    if (!isAuthenticated) {
      toast.warning('请先登录后再下载附件')
      return
    }
    window.open(attachmentApi.getDownloadUrl(attachment.id), '_blank')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // 代码高亮
  useEffect(() => {
    if (article?.content && codeRef.current) {
      codeRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement)
      })
    }
  }, [article?.content])

  // 切换文章时关闭移动端侧边栏
  useEffect(() => {
    setSidebarOpen(false)
  }, [slug])

  if (isLoading) {
    return (
      <Center py={20}>
        <VStack gap={3}>
          <Spinner size="xl" color="brand.500" />
          <Text color={metaColor} fontSize="sm">加载中...</Text>
        </VStack>
      </Center>
    )
  }

  if (error || !article) {
    return (
      <Center py={20}>
        <Text color="red.500">文章不存在</Text>
      </Center>
    )
  }

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:8999'
  const canonicalUrl = `${siteUrl}/article/${article.slug}`

  return (
    <Box position="relative" minH="calc(100vh - 160px)">
      <SEO
        title={article.title}
        description={article.summary || article.content?.slice(0, 160)}
        keywords={article.tags?.map((t: any) => t.name) || []}
        canonicalUrl={canonicalUrl}
        ogType="article"
        ogTitle={article.title}
        ogDescription={article.summary || article.content?.slice(0, 160)}
        ogImage={article.coverImage}
        articlePublishedTime={article.createdAt}
        articleModifiedTime={article.updatedAt}
        articleSection={article.category?.name}
        articleTags={article.tags?.map((t: any) => t.name)}
        jsonLd={generateArticleJsonLd(article)}
      />

      <Flex minH="calc(100vh - 160px)" align="stretch">
        {/* ===== 左侧导航边栏 - 桌面端 ===== */}
        {!isMobile && (
          <Box
            w="260px"
            minW="260px"
            borderRight="1px solid"
            borderColor={sidebarBorderColor}
            position="sticky"
            top="80px"
            h="calc(100vh - 80px)"
            flexShrink={0}
            overflow="hidden"
          >
            <ArticleSidebar />
          </Box>
        )}

        {/* ===== 左侧导航边栏 - 移动端浮层 ===== */}
        {isMobile && sidebarOpen && (
          <>
            {/* 遮罩层 */}
            <Box
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg={overlayBg}
              zIndex={999}
              onClick={() => setSidebarOpen(false)}
            />
            {/* 侧边栏 */}
            <Box
              position="fixed"
              top="0"
              left="0"
              w="280px"
              h="100vh"
              bg={mobileSidebarBg}
              zIndex={1000}
              boxShadow="0 0 40px rgba(0,0,0,0.15)"
              overflow="hidden"
            >
              <ArticleSidebar />
            </Box>
          </>
        )}

        {/* ===== 主内容区 ===== */}
        <Box flex="1" minW={0} bg={contentBg}>
          <Flex maxW="1200px" mx="auto" px={{ base: 4, md: 6, lg: 8 }} py={8} gap={0}>
            
            {/* 文章主体 */}
            <Box flex="1" minW={0} pr={{ base: 0, xl: tocBorderColor ? 8 : 0 }}>

              {/* 顶部操作栏（移动端菜单按钮 + 面包屑） */}
              <Flex align="center" gap={3} mb={6}>
                {/* 移动端：汉堡菜单按钮 */}
                {isMobile && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    borderRadius="8px"
                    px={2}
                    h="32px"
                    minW="32px"
                    bg={menuButtonBg}
                    borderColor={menuButtonBorderColor}
                    flexShrink={0}
                  >
                    <Icon as={sidebarOpen ? FiX : FiMenu} boxSize={4} />
                  </Button>
                )}

                {/* 面包屑导航 */}
                <HStack gap={1} fontSize="sm" flexWrap="wrap">
                  <Link to="/articles" style={{ textDecoration: 'none' }}>
                    <Text color={breadcrumbColor} _hover={{ color: 'brand.500' }} transition="color 0.15s">
                      文章
                    </Text>
                  </Link>
                  {article.category && (
                    <>
                      <Icon as={FiChevronRight} boxSize={3} color={breadcrumbColor} />
                      <Link to={`/category/${article.category.slug}`} style={{ textDecoration: 'none' }}>
                        <Text color={breadcrumbColor} _hover={{ color: 'brand.500' }} transition="color 0.15s">
                          {article.category.name}
                        </Text>
                      </Link>
                    </>
                  )}
                  <Icon as={FiChevronRight} boxSize={3} color={breadcrumbColor} />
                  <Text color={breadcrumbActiveColor} fontWeight="500" lineClamp={1}>
                    {article.title}
                  </Text>
                </HStack>
              </Flex>

              {/* 文章标题区 */}
              <Box mb={8}>
                <Flex justify="space-between" align="flex-start" gap={4} mb={4}>
                  <Heading
                    as="h1"
                    fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                    fontWeight="800"
                    lineHeight="1.2"
                    letterSpacing="-0.02em"
                    color={titleColor}
                    flex={1}
                  >
                    {article.title}
                  </Heading>

                  {/* 编辑按钮（管理员） */}
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="purple"
                      asChild
                      flexShrink={0}
                    >
                      <Link to={`/admin/articles/edit/${article.id}`}>
                        <Icon as={FiEdit2} mr={1} />
                        编辑
                      </Link>
                    </Button>
                  )}
                </Flex>

                {/* 文章摘要 */}
                {article.summary && (
                  <Text
                    fontSize="lg"
                    color={summaryColor}
                    lineHeight="1.7"
                    mb={5}
                    fontWeight="400"
                  >
                    {article.summary}
                  </Text>
                )}

                {/* 元信息 */}
                <HStack gap={5} color={metaColor} fontSize="sm" flexWrap="wrap" mb={4}>
                  <HStack gap={1.5}>
                    <Icon as={FiCalendar} boxSize={3.5} />
                    <Text>{new Date(article.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                  </HStack>
                  <HStack gap={1.5}>
                    <Icon as={FiEye} boxSize={3.5} />
                    <Text>阅读 {article.viewCount}</Text>
                  </HStack>
                </HStack>

                {/* 分类和标签 */}
                <HStack gap={2} flexWrap="wrap">
                  {article.category && (
                    <Badge colorPalette="purple" variant="subtle" px={2} py={0.5} borderRadius="6px" fontSize="12px">
                      {article.category.name}
                    </Badge>
                  )}
                  {article.tags?.map((tag: any) => (
                    <Badge key={tag.id} variant="outline" px={2} py={0.5} borderRadius="6px" fontSize="12px">
                      {tag.name}
                    </Badge>
                  ))}
                </HStack>
              </Box>

              {/* 分隔线 */}
              <Separator mb={8} borderColor={separatorColor} />

              {/* Markdown 正文内容 */}
              <Box ref={codeRef} className="markdown-body">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                >
                  {preprocessBilibiliEmbeds(article.content)}
                </ReactMarkdown>
              </Box>

              {/* 附件下载 */}
              {attachments.length > 0 && (
                <Box mt={10}>
                  <HStack gap={2} mb={4}>
                    <Icon as={FiPaperclip} boxSize={4} color={metaColor} />
                    <Heading size="sm" fontWeight="600" color={titleColor}>
                      附件下载
                    </Heading>
                  </HStack>
                  <VStack align="stretch" gap={2}>
                    {attachments.map((att) => (
                      <Flex
                        key={att.id}
                        align="center"
                        justify="space-between"
                        p={4}
                        bg={attachmentItemBg}
                        borderRadius="12px"
                        border="1px solid"
                        borderColor={separatorColor}
                        transition="all 0.15s"
                        _hover={{ bg: attachmentItemBg2 }}
                      >
                        <HStack gap={3}>
                          <Icon as={FiPaperclip} color="brand.500" boxSize={4} />
                          <Box>
                            <Text fontWeight="500" fontSize="sm" color={titleColor}>
                              {att.filename}
                            </Text>
                            <HStack gap={2} fontSize="xs" color={metaColor} mt={0.5}>
                              <Text>{formatFileSize(att.fileSize)}</Text>
                              <Text>·</Text>
                              <Text>下载 {att.downloadCount} 次</Text>
                            </HStack>
                          </Box>
                        </HStack>
                        <Button
                          size="sm"
                          colorPalette="brand"
                          onClick={() => handleDownload(att)}
                          borderRadius="8px"
                        >
                          {isAuthenticated ? (
                            <>
                              <Icon as={FiDownload} mr={1} />
                              下载
                            </>
                          ) : (
                            <>
                              <Icon as={FiLock} mr={1} />
                              登录下载
                            </>
                          )}
                        </Button>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* 点赞 */}
              <Separator my={10} borderColor={separatorColor} />
              <Box mb={8}>
                <LikeButton articleId={article.id} />
              </Box>

              {/* 评论区 */}
              <CommentSection articleId={article.id} />
            </Box>

            {/* ===== 右侧 TOC 大纲 - 宽屏端 ===== */}
            {!isTablet && article.content && (
              <Box
                w="240px"
                minW="240px"
                flexShrink={0}
                pl={8}
                borderLeft="1px solid"
                borderColor={tocBorderColor}
                ml={8}
              >
                <ArticleTOC content={article.content} contentRef={codeRef} />
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

export default ArticleDetail
